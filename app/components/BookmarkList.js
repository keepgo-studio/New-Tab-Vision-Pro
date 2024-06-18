import { Component } from "../assets/core.js";

export default class BookmarkList extends Component {
  css = `
    .container {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .bookmark {
      height: 600px;
      display: grid;
      grid-template-columns: auto auto;
    }

    .sidebar {
      min-width: 240px;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(24px);

      width: 240px;
    }

    .content {
      width: 480px;
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

    const rec = (obj, parentElem) => {
      const dom = document.createElement('div');
      const title = document.createElement('p');

      dom.id = obj.id;
      dom.style.paddingLeft = `1em`;
      title.innerHTML = obj.title;

      dom.prepend(title);
      parentElem.appendChild(dom);

      // if it's folder
      if ('children' in obj) {
        dom.classList.add("folder");
        [...obj.children].forEach((child) => rec(child, dom));
        return;
      }

      // if it's bookmark
      dom.classList.add("bookmark");
    }

    rec(this.tree[0], treeElem);

    this.shadowRoot.querySelector(".sidebar").append(treeElem);
  }

  render() {
    this.shadowRoot.innerHTML = `
      <div class="container">

          <div class="bookmark">
            <section class="sidebar">
              <div class="header">
                <h1>Title</h1>
              </div>
            </section>
            
            <section class="content">
              <div class="finder"></div>
              
              <div class="recent">
              </div>
            </section>
          </div>

      </div>
    `
  }

  updated() {
    // if (this.tree.length > 0) this.renderTree();
  }
}