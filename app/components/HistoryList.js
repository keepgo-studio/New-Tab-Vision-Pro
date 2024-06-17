import { Component, renderMap } from "../assets/core.js";
import IDB from "../assets/idb.js";
import { getRecentHistory } from "../assets/lib.js";
import MessageClientManager from "../assets/message.js";

export default class HistoryList extends Component {
  css = `
    .list-container {
      padding: 36px;
      width: 400px;
      overflow: hidden;
    }
  `;

  LIMIT = 13;
  list = [];

  compareItem(prevItem, currItem) {
    if (!prevItem) return true;

    for (const key in currItem) {
      if (prevItem[key] !== currItem[key]) return true;
    }

    return false;
  }

  beforeMount() {
    getRecentHistory(this.LIMIT).then(async historyList => {
      this.list = await Promise.all(
        historyList.map(async item => {
          const { url, title, lastVisitTime } = item;
          const data = await IDB.get(url);

          if (data) return data;

          return { url, title, lastVisitTime };
        })
      );

      this.reRender();
    });

    MessageClientManager.listen(this, async ({ type, historyUrl }) => {
      this.list.forEach(async (item, idx) => {
        if (item.url === historyUrl) {
          this.list[idx] = await IDB.get(historyUrl);
        }
      });
    });
  }

  render() {
    this.shadowRoot.innerHTML = `
      <app-window>
        <div class="list-container">
          <ul>
          ${renderMap(this.list, (data) => `
            <li>${data.url}</li>
          `)}
          </ul>
        </div>
      </app-window>
    `;
  }
}