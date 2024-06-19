export class Component extends HTMLElement {
  resetCss = `
    * {
      margin: 0;
      padding: 0;
      border: 0;
      font: inherit;
      vertical-align: baseline;
      color: inherit;
      text-decoration: inherit;
    }
    
    li {
      display: block;
    }

    ::-webkit-scrollbar {
      width:  10px;
      height: 10px;
    }

    ::-webkit-scrollbar-thumb {
      background-color: rgba(46, 46, 46, 0.3);
      border-radius: 999px;
      background-clip: padding-box;
      border: 3px solid transparent;
      cursor: pointer;
    }
    ::-webkit-scrollbar-thumb:hover {
      background-color: #fff;  
    }

    ::-webkit-scrollbar-track {
      background-color: transparent;
      border-radius: 999px;
    }
  `
  css = ``;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.beforeMount();
    this.render();
    this.attachStyle();
    this.firstUpdated();
    this.updated();
  }

  attachStyle() {
    const style = document.createElement('style');
    let sheet = typeof this.css === 'function' ? this.css() : this.css;

    style.innerHTML = `${this.resetCss} ${sheet.trim()}`;

    this.shadowRoot.prepend(style);
  }

  reRender() {
    this.render();
    this.attachStyle();
    this.updated();
  }

  beforeMount() {}
  render() {}
  firstUpdated() {}
  updated() {}
}

export function renderMap(array, callback) {
  return array.map(callback).join('');
}