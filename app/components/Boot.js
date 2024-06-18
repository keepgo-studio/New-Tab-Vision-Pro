import { Component } from "../assets/core.js";
import { delay } from "../assets/lib.js";

export default class Boot extends Component{
  css = `
    div {
      position: fixed;
      z-index: 999;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #000;
      transition: ease 1000ms opacity;
    }

    svg {
      opacity: 0;
      transition: ease 1000ms;
      width: clamp(80px, 5vw, 100px);
      fill: #fff;
    }
    
    div.on svg {
      opacity: 1;
    }

    div.off {
      opacity: 0
    }
  `;

  beforeMount() {
    this.addEventListener("boot", async () => {
      const root = this.shadowRoot.querySelector("div");
      new Audio('/app/assets/startup.mp3').play();

      await delay(1000);

      root.classList.add("on");

      await delay(3500);

      root.classList.add("off");

      await delay(1000);

      await chrome.storage.local.set({ boot: false });
      this.remove();
    })
  }

  render() {
    this.shadowRoot.innerHTML = `
      <div>
        <svg viewBox="0 0 350 431" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M338.822 146.943C336.328 148.882 292.304 173.753 292.304 229.056C292.304 293.023 348.323 315.653 350 316.213C349.742 317.593 341.101 347.205 320.464 377.378C302.064 403.93 282.846 430.44 253.611 430.44C224.377 430.44 216.853 413.413 183.104 413.413C150.215 413.413 138.521 431 111.78 431C85.0387 431 66.3801 406.431 44.9269 376.258C20.0774 340.826 0 285.782 0 233.539C0 149.744 54.3422 105.304 107.825 105.304C136.242 105.304 159.931 124.011 177.773 124.011C194.755 124.011 221.238 104.183 253.568 104.183C265.821 104.183 309.845 105.304 338.822 146.943ZM238.22 68.7083C251.591 52.8028 261.049 30.7334 261.049 8.66397C261.049 5.60356 260.791 2.50005 260.232 0C238.478 0.818982 212.597 14.5262 196.991 32.6731C184.738 46.6389 173.302 68.7083 173.302 91.0794C173.302 94.4415 173.861 97.8037 174.119 98.8813C175.494 99.1399 177.73 99.4416 179.966 99.4416C199.484 99.4416 224.033 86.3379 238.22 68.7083Z"/>
        </svg>
      </div>
    `;
  }
}