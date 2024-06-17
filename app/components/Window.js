import { Component } from "../assets/core.js";

const BORDER_RADIUS = 46;
const STROKE_SIZE = 1.5;

export default class Window extends Component {

  css =`
    div {
      position: relative;
      width: fit-content;
      height: fit-content;
      background: rgba(128, 128, 128, 30%);
      border-radius: ${BORDER_RADIUS}px;
      backdrop-filter: blur(24px);
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
      border-radius: ${BORDER_RADIUS}px;
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

  render() {
    this.shadowRoot.innerHTML = `
      <div>
        <slot></slot>
      </div>
    `;
  }
}