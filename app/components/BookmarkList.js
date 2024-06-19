import { Component } from "../assets/core.js";

const ITEM_HEIGHT = 30;

export default class BookmarkList extends Component {
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
      aspect-ratio: 960 / 840;
      max-height: 840px;
      min-height: 600px;
      display: grid;
      grid-template-columns: auto 1fr;
    }

    .sidebar {
      text-overflow: ellipsis;
      background: linear-gradient(rgba(0, 0, 0, 8%), rgba(214, 214, 214, 8%)), 
                  linear-gradient(rgba(214, 214, 214, 20%), rgba(214, 214, 214, 20%));
      display: flex;
      flex-direction: column;
      width: 260px;
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

    #tree {
      width: 88%;
      flex: 1;
      aspect-ratio: 1/1;
      overflow-x: hidden;
      font-size: 15px;
      letter-spacing: 0.03em;
      font-weight: 300;
      padding-right: 2px;
      margin: 10px auto;
    }

    #tree .children {
      transition: var(--duration);
      height: 0px;
      overflow: hidden;
    }
    #tree .children.child-open {
      height: fit-content !important;
    }

    #tree .title {
      display: flex;
      align-items: center;
      width: 100%;
      padding: 0 0.2em;
      overflow: hidden;
      cursor: pointer;
    }
    #tree .title span {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
    #tree .title img {
      width: 1em;
      margin-right: 0.5em;
      object-fit: contain;
    }

    #tree .bookmark-item {
      display: flex;
      transition: var(--duration);
    }
    #tree .bookmark-item:hover {
      background-color: rgba(255, 255, 255, 14%);
    }

    .content {
    }
  `;

  tree = [];
  sidebarWidth = 240;
  
  beforeMount() {
    chrome.bookmarks.getTree(tree => {
      this.tree = [...tree];
      this.reRender();
    })
  }

  renderTree() {
    const treeElem = document.createElement('div');
    treeElem.id = "tree";

    treeElem.addEventListener('wheel', (e) => {
      e.stopPropagation();
    })

    const folderTreeRef = {
      roots: []
    };

    const updateTreeHeight = () => {
      const dfs = (node) => {
        const img = node.ref.querySelector("img");
        img.src = "/app/assets/icons/" + (node.open ? "folder.png" : "folder.fill.png");

        if (!node.open) {
          node.childrenRef.style.height = '0px';
          return 0;
        }
        
        let totalHeight = node.defaultHeight;
        node.children.forEach(childId => {
          totalHeight += dfs(folderTreeRef[childId]);
        });

        node.childrenRef.style.height = `${totalHeight}px`;

        return totalHeight;
      }

      folderTreeRef['roots'].forEach((id) => {
        dfs(folderTreeRef[id]);
      });
    }

    const recRender = (obj, parentChildrenElem, level) => {
      const itemDiv = document.createElement('div');
      const isFolder = 'children' in obj;
      const title = isFolder ? document.createElement('p') : document.createElement('a');

      itemDiv.id = obj.id;

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
        const children = document.createElement('div');
        
        itemDiv.classList.add("folder");
        children.classList.add("children");
        parentChildrenElem.appendChild(children);

        folderTreeRef[obj.id] = {
          open: false,
          ref: itemDiv,
          childrenRef: children,
          children: [],
          defaultHeight: ITEM_HEIGHT * obj.children.length
        };

        itemDiv.addEventListener("click", () => {
          folderTreeRef[obj.id].open = !folderTreeRef[obj.id].open;

          updateTreeHeight();
        });

        obj.children.forEach((child) => {
          const childId = recRender(child, children, level + 1);
          
          if (childId) {
            folderTreeRef[obj.id].children.push(childId);
          }
        });

        return obj.id;
      }

      itemDiv.classList.add("bookmark-item");
      return undefined;
    }

    // 무조건 폴더가 최상위에 있다는 가정
    this.tree[0].children.forEach(item => {
      folderTreeRef['roots'].push(recRender(item, treeElem, 0));
    });

    this.shadowRoot.querySelector(".sidebar").append(treeElem);

    updateTreeHeight();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <div class="container">
        <app-window>
          <div class="bookmark">
            <section class="sidebar">
              <div class="header">
                <h1>
                  <img src="/app/assets/icons/book.closed.fill.png" />
                  Bookmarks
                </h1>
              </div>
            </section>
            
            <section class="content">
              <div class="finder"></div>
              
              <div class="recent">
              </div>
            </section>
          </div>
        </app-window>
      </div>
    `
  }

  updated() {
    if (this.tree.length > 0) this.renderTree();
  }
}