import { Component } from "../assets/core.js";
import IDB from "../assets/idb.js";
import { minMax } from "../assets/lib.js";
import MessageClientManager from "../assets/message.js";

const ITEM_HEIGHT = 32;

export default class BookmarkList extends Component {
  sidebarWidth = 260;

  css = `
    .container {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    app-window {
      width: 92%;
    }
    .bookmark {
      width: 100%;
      display: grid;
      grid-template-columns: auto 1fr;
    }

    @media only screen and (min-height: 840px) {
      .bookmark {
        aspect-ratio: 960 / 840;
      }
    }
    @media only screen and (min-width: 1200px) {
      .bookmark {
        max-height: 840px;
      }
    }

    .sidebar {
      text-overflow: ellipsis;
      background: linear-gradient(rgba(0, 0, 0, 8%), rgba(0, 0, 0, 8%)), 
                  linear-gradient(rgba(0, 0, 0, 20%), rgba(0, 0, 0, 20%));
      display: flex;
      flex-direction: column;
      width: ${this.sidebarWidth}px;
      position: relative;
      user-select: none;
      border-right: solid var(--gray) 1px;
    }
    .sidebar .resizer {
      position: absolute;
      top: 0;
      right: 0;
      width: 50px;
      height: 100%;
      transform: translateX(50%);
    }
    .sidebar .resizer .cursor {
      position: absolute;
      top: 50%;
      right: 8px;
      transform: translateY(-50%);
      transition: var(--duration);
      width: clamp(4px, 0.5vw ,5px);
      border-radius: 999px;
      height: 8%;
      background-color: #fff;
      cursor: col-resize;
    }
    .sidebar .header {
      padding: 32px 28px 20px 32px;
      font-size: 22px;
      font-weight: bold;
      letter-spacing: 0.05em;
      display: grid;
      grid-template-rows: auto 1fr;
      border-bottom: solid var(--gray) 1px;
    }
    .sidebar .header h1 {
      display: flex;
      align-items: center;
      gap: 0.4em;
    }
    .sidebar .header img {
      width: 0.7em;
    }

    .tree-container {
      width: 100%;
      flex: 1;
      position: relative;
      font-weight: 300;
      padding: 10px 0 24px 0;
    }
    @media only screen and (max-width: 960px) {
      .tree-container {
        font-size: 14px;
      }
    }
    
    .queue {
      position: absolute;
      top: 0;
      left: 2px;
      right: 0px;
      display: flex;
      background: #43413e;
    }
    .queue > div {
      flex: 1;
    }

    #tree {
      width: 100%;
      height: 100%;
      aspect-ratio: 1/1;
      overflow-x: hidden;
      overflow-y: scroll;
      letter-spacing: 0.03em;
    }

    .folder,
    .bookmark-item
     {
      margin-left: 2px;
    }
    .children {
      transition: var(--duration);
      height: 0px;
      overflow: hidden;
    }

    .title {
      display: flex;
      align-items: center;
      width: 100%;
      padding: 0 0.2em;
      overflow: hidden;
      cursor: pointer;
    }
    .title span {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
    .title img {
      width: 1em;
      margin-right: 0.5em;
      object-fit: contain;
    }

    .bookmark-item {
      display: flex;
      transition: var(--duration);
    }
    .bookmark-item:hover {
      background-color: rgba(255, 255, 255, 14%);
    }

    .content {
      padding: 28px;
      background: linear-gradient(rgba(0, 0, 0, 15%), rgba(0, 0, 0, 15%));
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `;

  tree = [];
  favIconMapByUrl = {};
  folderTreeRef = {
    roots: []
  }
  childrenRefMap = {};
  queue = [];

  renderImg(url, favIconUrl) {
    Object.keys(this.favIconMapByUrl).forEach(bookmarkUrl => {
      if (url.includes(bookmarkUrl)) {
        this.favIconMapByUrl[bookmarkUrl].favIconUrl = favIconUrl;
        const img = this.favIconMapByUrl[bookmarkUrl].ref.querySelector("img");
        img.src = favIconUrl;
      }
    });
  }

  updateTreeHeight() {
    const dfs = (node) => {
      const img = node.ref.querySelector("img");
      img.src = "/app/assets/icons/" + (node.open ? "folder.png" : "folder.fill.png");

      if (!node.open) {
        node.childrenRef.style.height = '0px';
        return 0;
      }
      
      let totalHeight = node.defaultHeight;
      node.children.forEach(childId => {
        totalHeight += dfs(this.folderTreeRef[childId]);
      });

      node.childrenRef.style.height = `${totalHeight}px`;

      return totalHeight;
    }

    this.folderTreeRef['roots'].forEach((id) => {
      dfs(this.folderTreeRef[id]);
    });
  }

  sendEventToFinder(id) {
    let data;
    
    const updateData = () => {
      if (!id) return;

      const currentId = this.folderTreeRef[id].open ? id : this.folderTreeRef[id].parentId;
      
      if (!currentId) return;
      
      const children = this.childrenRefMap[currentId];

      data = {
        id: currentId,
        children: children.map(child => {
          const isChildFolder = 'children' in child;
          const title = child.title ? child.title : child.url;
          const favIconUrl = this.favIconMapByUrl[child.url]?.favIconUrl;

          return {
            type: isChildFolder ? 'folder' : 'bookmark',
            title,
            favIconUrl,
            id: child.id,
            url: child?.url
          }
        }),
        folderName: this.folderTreeRef[currentId].title,
        parentExist: Boolean(this.folderTreeRef[currentId].parentId)
      };
    }

    updateData();

    const finder = this.shadowRoot.querySelector("app-finder");
    finder.dispatchEvent(new CustomEvent("select", {
      detail: data
    }));
  }

  beforeMount() {
    chrome.bookmarks.getTree(tree => {
      this.tree = [...tree];
      this.reRender();
    })

    MessageClientManager.listen(this, async ({ type, data }) => {
      if (type === 'update-favicon') {
        this.renderImg(data.url, data.favIconUrl);
      }
    })

    this.addEventListener("folder-select", (e) => {
      const  { id, open } = e.detail;

      this.folderTreeRef[id].open = e.detail.open;
      
      this.updateTreeHeight();

      this.sendEventToFinder(id)
    })
  }

  renderTree() {
    const treeElem = document.createElement('div');
    treeElem.id = "tree";

    const queueElem = this.shadowRoot.querySelector(".queue");
    
    queueElem.addEventListener("click", () => {
      const elem = queueElem.querySelector(".folder");

      if (!elem) return;

      const id = elem.id;
      this.folderTreeRef[id].open = false;
      this.queue.pop();

      const lastIdx = this.queue[this.queue.length - 1];
      this.updateTreeHeight();
      renderQueue();
      this.sendEventToFinder(lastIdx);
    });

    const renderQueue = () => {
      queueElem.innerHTML = ``;
      if (this.queue.length === 0) return;

      const id = this.queue[this.queue.length - 1];
      const lastFolder = this.folderTreeRef[id];

      queueElem.append(lastFolder.ref.cloneNode(true));
    }

    const folderElemIo = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const id = entry.target.id;

        if (!entry.isIntersecting) {
          const d = entry.boundingClientRect.y - entry.rootBounds.y;
          if (d < 0 && this.folderTreeRef[id].open) {
            this.queue.push(entry.target.id);
          }
        } else {
          const idx = this.queue.findIndex(_id => _id === id);
          if (idx !== -1) this.queue.splice(idx, 1);
        }
      })

      renderQueue();
    }, {
      threshold: 1,
      root: treeElem
    });

    const recRender = (obj, parentId, parentChildrenElem, level) => {
      const itemDiv = document.createElement('div');
      const isFolder = 'children' in obj;
      const title = isFolder ? document.createElement('p') : document.createElement('a');

      itemDiv.id = obj.id;
      
      itemDiv.style.paddingLeft = '1em';
      title.style.height = `${ITEM_HEIGHT}px`;
      title.style.marginLeft = `${level * 1.5}em`;
      title.className = 'title';
      title.innerHTML = `
        <img src="/app/assets/icons/${isFolder ? "folder.fill.png" : "globe.png"}"/>
        <span>${obj.title ? obj.title : obj.url}</span>
      `;
      if (!isFolder) {
        title.href = obj.url;
        title.target = "_blank";
      }

      itemDiv.appendChild(title);
      parentChildrenElem.appendChild(itemDiv);

      if (isFolder) {
        folderElemIo.observe(itemDiv);

        const children = document.createElement('div');
        
        itemDiv.classList.add("folder");
        children.classList.add("children");
        parentChildrenElem.appendChild(children);

        this.folderTreeRef[obj.id] = {
          id: obj.id,
          parentId,
          title: obj.title ? obj.title : obj.url,
          open: false,
          ref: itemDiv,
          childrenRef: children,
          children: [],
          defaultHeight: ITEM_HEIGHT * obj.children.length
        };
        
        this.childrenRefMap[obj.id] = obj.children;

        itemDiv.addEventListener("click", (e) => {
          e.stopPropagation();
          this.folderTreeRef[obj.id].open = !this.folderTreeRef[obj.id].open;
          
          this.updateTreeHeight();
          this.sendEventToFinder(obj.id);
        });

        obj.children.forEach((child) => {
          const childId = recRender(child, obj.id, children, level + 1);
          
          if (childId) {
            this.folderTreeRef[obj.id].children.push(childId);
          }
        });

        return obj.id;
      }
      
      IDB.get(obj.url).then((data) => {
        if (data && 'favIconUrl' in data && data.favIconUrl) {
          itemDiv.querySelector("img").src=data.favIconUrl;
        }
      })
      
      itemDiv.classList.add("bookmark-item");
      
      this.favIconMapByUrl[obj.url] = {
        ref: itemDiv,
        favIconUrl: undefined
      };

      return undefined;
    }

    // 무조건 폴더가 최상위에 있다는 가정
    this.tree[0].children.forEach(item => {
      this.folderTreeRef['roots'].push(recRender(item, undefined, treeElem, 0));
    });

    this.shadowRoot.querySelector(".tree-container").append(treeElem);
    
    Object.keys(this.favIconMapByUrl).forEach(async bookmarkUrl => {
      const data = await IDB.get(bookmarkUrl);

      if (data && data?.favIconUrl) {
        this.renderImg(bookmarkUrl, data.favIconUrl);
      }
    });

    this.updateTreeHeight();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <div class="container">
        <app-window>
          <div class="bookmark">
            <section class="sidebar">
              <div class="resizer">
                <div class="cursor"></div>
              </div>

              <div class="header">
                <h1>
                  <img src="/app/assets/icons/book.closed.fill.png" />
                  Bookmarks
                </h1>
              </div>

              <div class="tree-container">
                <div class="queue"></div>
              </div>
            </section>
            
            <section class="content">
              <app-finder></app-finder>
            </section>
          </div>
        </app-window>
      </div>
    `
  }

  updated() {
    if (this.tree.length > 0) this.renderTree();

    const bookmark = this.shadowRoot.querySelector(".bookmark");
    const sidebar = this.shadowRoot.querySelector(".sidebar");
    const resizer = this.shadowRoot.querySelector(".resizer");
    const cursor = this.shadowRoot.querySelector(".cursor");

    resizer.addEventListener("mouseenter", () => {
      cursor.style.zIndex = 1;
      cursor.style.opacity = 1;
    });
    resizer.addEventListener("mouseleave", () => {
      cursor.style.opacity = 0;
      cursor.style.zIndex= -1;
    });

    let cursorClicked = false;
    bookmark.addEventListener("mousedown", (e) => {
      if (e.target.className === "cursor") {
        cursorClicked = true;
      }
    });
    bookmark.addEventListener("wheel", (e) => {
      e.stopPropagation();
    }, {
      passive: true
    });
    bookmark.addEventListener("mouseup", (e) => {
      cursorClicked = false;
    });
    bookmark.addEventListener("mouseleave", () => {
      cursorClicked = false;
    });
    bookmark.addEventListener("mousemove", (e) => {
      if (!cursorClicked) return;
      e.stopPropagation();

      this.sidebarWidth = minMax(this.sidebarWidth + e.movementX, 200, 500);

      sidebar.style.width = `${this.sidebarWidth}px`;
    });
  }
}