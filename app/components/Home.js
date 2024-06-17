import { Component } from "../assets/core.js";

export default class Home extends Component {
  css = `
    :host {
          display: block;
      width: 100%;
      height: 100%;}
  `;
  render() {
    this.shadowRoot.innerHTML = `
      <div>home</div>
    `
  }
}