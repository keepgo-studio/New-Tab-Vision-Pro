import "./components/barrel.js";
import IDB from "./assets/idb.js";
import MessageClientManager from "./assets/message.js";

async function main() {
  // init
  MessageClientManager.on();
  await IDB.open();

  // attach app
  const app = document.createElement('app-app');
  document.body.appendChild(app);
}

main();