export default class MessageClientManager {
  static listeners = new Map();

  static on() {
    chrome.runtime.onMessage.addListener((msg) => {
      this.listeners.forEach((callback) => callback(msg));
    });
  }
  
  static listen(target, callback) {
    this.listeners.set(target, callback);
  }

  static disconnect(target) {
    this.listeners.delete(target);
  }
}