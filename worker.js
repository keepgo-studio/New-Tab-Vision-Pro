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

  static async getAll() {
    if (!this.db) {
      console.error("Database has not been initialized.");
      return;
    }

    return new Promise(res => {
      const transaction = this.db.transaction("history", "readwrite")
      const store = transaction.objectStore("history");

      store.getAll().onsuccess = (e) => res(e.target.result)
    });
  }

  static async put(data) {
    if (!this.db) {
      console.error("Database has not been initialized.");
      return;
    }

    return new Promise(res => {
      const transaction = this.db.transaction("history", "readwrite")
      const store = transaction.objectStore("history");

      const request = store.put(data);

      request.onsuccess = () => res();

      request.onerror = () => {
        console.log("Error", request.error);
        res();
      };
    })
  }

  static async removeData(data) {
    if (!this.db) {
      console.error("Database has not been initialized.");
      return;
    }

    return new Promise(res => {
      const transaction = this.db.transaction("history", "readwrite")
      const store = transaction.objectStore("history");

      const request = store.delete(data.url);

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
      chrome.tabs.sendMessage(tabId, message, () => {
        if (chrome.runtime.lastError) this.clients.delete(tabId);
      });
    });
  }
}

class HistoryStore {
  static ITEM_LIMIT = 30;
  // {
  //   lastVisitTime
  //   title
  //   url
  //   imgUrl
  //   favIconUrl
  // }
  static queue = [];

  static find(url) {
    return this.queue.find(item => item.url === url);
  }

  static async syncData(data) {
    await IDB.put(data);

    MessageManager.send({
      type: 'update',
      historyUrl: data.url
    });
  }

  static async unsyncData(data) {
    await IDB.removeData(data);

    MessageManager.send({
      type: 'remove',
      historyUrl: data.url
    });
  }

  static insert(historyItem) {
    const { url, title, lastVisitTime } = historyItem;

    if (!url) return;

    const data = { url, title, lastVisitTime };
    this.queue.push(data);

    if (this.queue.length > this.ITEM_LIMIT) {
      const removeData = this.queue.shift();
      this.unsyncData(removeData);
    } else {
      this.syncData(data);
    }
  }

  static update(url, partialData) {
    const idx = this.queue.findIndex(item => item.url === url);

    if (idx === -1) return;

    const originalData = this.queue[idx];
    this.queue[idx] = { ...originalData, ...partialData };

    this.syncData(this.queue[idx]);
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
  IDB.open().then(async () => {
    const [prevData, recentHistory] = await Promise.all([
      IDB.getAll(),
      getRecentHistory(HistoryStore.ITEM_LIMIT)
    ])

    recentHistory.forEach((historyItem) => {
      HistoryStore.insert(historyItem)
    });

    prevData.forEach(({ url, imgUrl, favIconUrl }) => {
      HistoryStore.update(url, { imgUrl, favIconUrl })
    });
  });

  chrome.history.onVisited.addListener(async () => {
    const { url, title, lastVisitTime } = (await getRecentHistory(1))[0];
    const imgUrl = await getCapture();
    const data = {
      url,
      title,
      lastVisitTime, 
      imgUrl
    };

    if (url && !HistoryStore.find(url)) {
      HistoryStore.insert(data);
    } else {
      HistoryStore.update(url, data);
    }
  });

  chrome.tabs.onUpdated.addListener((_, info, tab) => {
    if (tab.url === "chrome://newtab/") {
      MessageManager.add(tab.id);
    } else {
      MessageManager.remove(tab.id);
    }

    if (tab && HistoryStore.find(tab.url)) {
      const { url, favIconUrl } = tab;

      HistoryStore.update(url, { favIconUrl });
    }
  });

  chrome.tabs.onRemoved.addListener((tabId) => {
    MessageManager.remove(tabId);
  })
}

chrome.runtime.onInstalled.addListener(() => main());