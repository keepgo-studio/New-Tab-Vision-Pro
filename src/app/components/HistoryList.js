import { Component, renderMap } from "../assets/core.js";
import IDB from "../assets/idb.js";
import { getRecentHistory } from "../assets/lib.js";
import MessageClientManager from "../assets/message.js";

export default class HistoryList extends Component {
  css = `
    .container {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      user-select: none;
    }

    .container > app-window {
      width: 92%;
      height: 60%;
    }
    .list-container {
      height: 100%;
      display: flex;
      flex-direction: column;
      margin: auto;
    }

    .list-container .header {
      font-size: 28px;  
      padding: 32px;
      font-weight: bold;
    }
    
    section {
      flex: 1;
      overflow: hidden;
      padding: 0 22px 32px 22px;
    }

    ul {
      height: 100%;
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      overflow-y: auto;
      justify-content: center;
    }
    ul li {
      width: 100%;
      max-width: 300px;
      transition: var(--duration);
    }
    ul li:active {
      transform: scale(0.95);
    }
    ul li p {
      font-size: 14px;
      padding-top: 1em;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    ul li p img {
      width: 1em;
      margin-right: 0.5em;
    }
    ul li p span {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      width: fit-content;
    }
    ul li app-window {
      aspect-ratio: 1920 / 1080;
      width: 100%;
    }
    ul li app-window img {
      width: 100%;
    }
    ul li app-window .blank {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    ul li app-window .blank img {
      aspect-ratio: 0;
      width: 30px;
      object-fit: contain;
    }
  `;

  LIMIT = 12;
  list = [];

  compareItem(prevItem, currItem) {
    if (!prevItem) return true;

    for (const key in currItem) {
      if (prevItem[key] !== currItem[key]) return true;
    }

    return false;
  }

  renderRecents() {
    getRecentHistory(this.LIMIT).then(async historyList => {
      this.list = await Promise.all(
        historyList.map(async item => {
          const { url, title, lastVisitTime } = item;
          const data = await IDB.get(url);

          const historyItem = { url, title, lastVisitTime };

          if (data) return { ...data, ...historyItem };

          return historyItem;
        })
      );

      this.reRender();
    });
  }

  beforeMount() {
    MessageClientManager.listen(this, async ({ type, data }) => {
      if (type === 'update' && data.imgUrl) {
        this.list.forEach(async (item, idx) => {
          if (item.url === data.url) {
            this.list[idx].imgUrl = data.imgUrl;
          }
        });
      } else if (type === 'update-favicon' && data.favIconUrl) {
        this.list.forEach(async (item, idx) => {
          if (item.url === data.url) {
            this.list[idx].favIconUrl = data.favIconUrl;
          }
        });
      }
    });

    this.renderRecents();

    chrome.history.onVisited.addListener(() => {
      this.renderRecents();
    });
  }

  render() {
    this.shadowRoot.innerHTML = `
      <div class="container">
        <app-window>
          <div class="list-container">
            <div class="header">
              <h2>History</h2>
            </div>

            <section>
              <ul>
              ${renderMap(this.list, ({ title, url, imgUrl, favIconUrl }) => `
                <li>
                  <a href="${url}" target="_blank">
                    <app-window radius="16">
                    ${imgUrl ? `
                      <img src="${imgUrl}" />
                    ` : `
                      <div class="blank">
                        <img src="/app/assets/icons/record.png" />
                      </div>
                    `}
                    </app-window>

                    <p>
                    <img src="${favIconUrl ? favIconUrl : "/app/assets/icons/square.dashed.png"}"/>
                    <span>${title}</span>
                    </p>
                  </a>
                </li>
              `)}
              </ul>
            </section>
          </div>
        </app-window>
      </div>
    `;
  }

  updated() {
    const ul = this.shadowRoot.querySelector("ul");

    ul.addEventListener("wheel", (e) => {
      e.stopPropagation();
    }, {
      passive: true
    });

    [...ul.querySelectorAll("a")].forEach(a => {
      a.addEventListener("mousedown", (e) => {
        e.stopPropagation();
      })
    });
  }
}