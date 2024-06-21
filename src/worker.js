const LIMIT_CNT = 200;
class IDB {
  static VERSION = 1;
  static db;

  static open = async () => new Promise(res => {
    const request = indexedDB.open("db", this.VERSION);

    request.onupgradeneeded = (e) => {
      this.db = e.target.result;

      if (!this.db.objectStoreNames.contains('history')) {
        this.db.createObjectStore("history", {
          keyPath: "url"
        });
      }
      res();
    };

    request.onerror = (e) => {
      console.error("Database error: " + e.target.error);
      res();
    };

    request.onsuccess = (e) => {
      this.db = e.target.result;
      console.log("Database opened successfully.");
      res();
    };
  })

  oldestUrl = '';

  static async _preProcess() {
    return new Promise(res => {
      const transaction = this.db.transaction("history", "readwrite")
      const store = transaction.objectStore("history");

      const count = store.count();

      count.onsuccess = async () => {
        if (count.result >= LIMIT_CNT && this.oldestUrl) {
          await this.removeData(this.oldestUrl);
          this.oldestUrl = '';
          res();
        }
      }

      count.onerror = res();
    })
  }

  static async get(url) {
    if (!this.db) {
      console.error("Database has not been initialized.");
      return;
    }

    return new Promise(res => {
      const transaction = this.db.transaction("history", "readwrite")
      const store = transaction.objectStore("history");
  
      store.get(url).onsuccess = (e) => res(e.target.result);
      store.get(url).onerror = () => res(undefined);
    });
  }

  static async put(data) {
    if (!this.db) {
      console.error("Database has not been initialized.");
      return;
    }

    this._preProcess();
    
    const prevData = await this.get(data.url);

    return new Promise(res => {
      const transaction = this.db.transaction("history", "readwrite")
      const store = transaction.objectStore("history");

      const request = store.put({
        ...prevData,
        ...data
      });

      request.onsuccess = () => res();

      request.onerror = () => {
        console.log("Error", request.error);
        res();
      };
    })
  }

  static async removeData(url) {
    if (!this.db) {
      console.error("Database has not been initialized.");
      return;
    }

    return new Promise(res => {
      const transaction = this.db.transaction("history", "readwrite")
      const store = transaction.objectStore("history");

      const request = store.delete(url);

      request.onsuccess = () => res();

      request.onerror = () => {
        console.log("Error", request.error);
        res();
      };
    })
  }
}

class MessageManager {
  static clients = new Set();

  static add(tabId) {
    this.clients.add(tabId);
  }

  static remove(tabId) {
    this.clients.delete(tabId);
  }

  static send(message) {
    this.clients.forEach(tabId => {
      chrome.tabs.sendMessage(tabId, message, () => {});
    });
  }
}

async function getCapture() {
  try {
    return await chrome.tabs.captureVisibleTab();
  } catch {
    return undefined;
  }
}

async function getRecentHistory(n) {
  return await chrome.history.search({ text: '', maxResults: n })
}

function main() {
  IDB.open();

  chrome.history.onVisited.addListener(async () => {
    const { url, title, lastVisitTime } = (await getRecentHistory(1))[0];
    const imgUrl = await getCapture();
    const data = {
      url,
      title,
      lastVisitTime,
      imgUrl
    };

    if (IDB.oldestUrl === '') IDB.oldestUrl = url;

    IDB.put(data).then(() => {
      MessageManager.send({
        type: 'update',
        data
      })
    });
  });

  chrome.tabs.onUpdated.addListener((_, info, tab) => {
    if (tab.url === "chrome://newtab/") {
      MessageManager.add(tab.id);
      return;
    } else {
      MessageManager.remove(tab.id);
    }

    const { url, favIconUrl } = tab;
    if (tab && favIconUrl) {
      const data = { url, favIconUrl };

      IDB.put(data).then(() => {
        MessageManager.send({
          type: 'update-favicon', 
          data
        })
      });
    }
  });

  chrome.tabs.onRemoved.addListener((tabId) => {
    MessageManager.remove(tabId);
  })

  chrome.management.getSelf(self => {
    chrome.storage.local.set({
      boot: self.installType === 'development' ? false : true
    });
  });
}

chrome.runtime.onInstalled.addListener(() => main());