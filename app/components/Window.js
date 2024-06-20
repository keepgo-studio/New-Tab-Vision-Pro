import { Component } from "../assets/core.js";

const STROKE_SIZE = 1.5;

export default class Window extends Component {
  radius;
  background;

  css = () => `
    div {
      position: relative;
      border-radius: ${this.radius}px;
      background: ${this.background};
      backdrop-filter: blur(60px);
      overflow: hidden;
    }

    div::before {
      content: "";      
      position: absolute;
      z-index: -1;
      top: 0;
      left: 0; 
      right: 0; 
      bottom: 0;
      padding: ${STROKE_SIZE}px;
      border-radius: ${this.radius}px;
      background: linear-gradient(
        -184deg,
        rgba(255, 255, 255, 40%) 0%,
        rgba(255, 255, 255, 0.01) 41%,
        rgba(255, 255, 255, 0.01) 57%, 
        rgba(255, 255, 255, 10%) 100%
      );
      -webkit-mask: 
        linear-gradient(#fff, #fff) content-box, 
        linear-gradient(#fff, #fff);
      mask: 
        linear-gradient(#fff, #fff) content-box, 
        linear-gradient(#fff, #fff);
      mask-composite: exclude;
    }
  `
  beforeMount() {
    this.background = this.getAttribute("background") ? this.getAttribute("background") : "var(--window)";
    this.radius = this.getAttribute("radius") ? this.getAttribute("radius") : 46;
  }

  render() {
    this.shadowRoot.innerHTML = `
      <div>
        <slot></slot>
      </div>
    `;
  }
}