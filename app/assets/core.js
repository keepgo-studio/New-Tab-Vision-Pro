export class Component extends HTMLElement {
  resetCss = `
    * {
      margin: 0;
      padding: 0;
      border: 0;
      font: inherit;
      vertical-align: baseline;
    }
    
    li {
      display: block;
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
    style.innerHTML = `${this.resetCss} ${this.css.trim()}`;

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