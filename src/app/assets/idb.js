export default class IDB {
  static VERSION = 1;
  static db;

  static open = async () => new Promise((res, rej) => {
    const request = indexedDB.open("db", this.VERSION);

    request.onerror = (e) => {
      console.error("Database error: " + e.target.error);
      rej();
    };

    request.onsuccess = (e) => {
      this.db = e.target.result;
      console.log("Database opened successfully.");
      res();
    };
  })

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
}
