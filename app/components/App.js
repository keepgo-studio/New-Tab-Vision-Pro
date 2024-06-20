import { Component, renderMap } from "../assets/core.js";
import { addDragToScrollAnimation, fadeIn } from "../assets/animation.js";
import { delay, throttle } from "../assets/lib.js";

export default class App extends Component {
  css = `
    :host {
      display: block;
      width: 100vw;
      height: 100vh;
      overflow: hidden;
    }
    main {
      color: #fff;
      font-family: 'SF-Pro';
      width: 100vw;
      height: 100vh;
      display: grid;
      grid-template-columns: 15% 1fr;
      align-items: center;
      justify-items: center;
      opacity: 0;
    }

    .sidebar-container {
      width: 100%;
      height: 100%;
      position: relative;
    }
    .sidebar-container app-window {
      position: absolute;
      top: 50%;
      right: 30px;
      transform: translateY(-50%);
    }

    .sidebar {
      width: fit-content;
      height: fit-content;
      padding: 11px 10px;
      display: flex;
      flex-direction: column;
      gap: clamp(10px, 1vw, 12px);
    }
    .sidebar li {
      padding: clamp(10px, 1vw, 12px);
      border-radius: 999px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: var(--duration);
      cursor: pointer;
    }
    .sidebar li:hover {
      background-color: rgba(255, 255, 255, 8%);
    }
    .sidebar li.select {
      background-color: rgba(255, 255, 255, 18%);
    }
    .sidebar li svg {
      width: clamp(22px, 2vw, 32px);
      height: clamp(22px, 2vw, 32px);
      fill: var(--gray);
      transition: var(--duration);
    }
    .sidebar li.select svg {
      fill: #fff;
    }
    .sidebar li:hover:not(.select) svg {
      fill: #c7c7cc;
    }

    .content {
      width: 100%;
      height: 100%;
      overflow: hidden;
    }
    .content > li {
      width: 100%;
      height: 100%;
    }
  `;

  itemList = [
    {
      icon: `
        <svg viewBox="0 0 24 23" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g clip-path="url(#clip0_127_938)">
          <path d="M14.1699 18.9355H9.13086V12.4805C9.13086 12.2526 9.20085 12.072 9.34082 11.9385C9.48079 11.805 9.66146 11.7383 9.88281 11.7383H13.4277C13.6556 11.7383 13.8362 11.805 13.9697 11.9385C14.1032 12.072 14.1699 12.2526 14.1699 12.4805V18.9355ZM3.04688 18.3496C3.04688 19.0332 3.24056 19.5638 3.62793 19.9414C4.0153 20.319 4.55403 20.5078 5.24414 20.5078H18.0859C18.7695 20.5078 19.305 20.319 19.6924 19.9414C20.0797 19.5638 20.2734 19.0332 20.2734 18.3496V10.6152L12.2461 3.88672C11.8555 3.55469 11.4649 3.55469 11.0742 3.88672L3.04688 10.6152V18.3496ZM0 9.63867C0 9.8405 0.0748697 10.0212 0.224609 10.1807C0.374349 10.3402 0.579427 10.4199 0.839844 10.4199C0.976561 10.4199 1.10189 10.3874 1.21582 10.3223C1.32975 10.2572 1.4388 10.1855 1.54297 10.1074L11.3184 1.9043C11.4291 1.80664 11.5446 1.75781 11.665 1.75781C11.7855 1.75781 11.901 1.80664 12.0117 1.9043L21.7871 10.1074C21.8848 10.1855 21.9906 10.2572 22.1045 10.3223C22.2184 10.3874 22.3438 10.4199 22.4805 10.4199C22.7084 10.4199 22.9037 10.3532 23.0664 10.2197C23.2291 10.0862 23.3105 9.90232 23.3105 9.66797C23.3105 9.39453 23.2096 9.17318 23.0078 9.00391L12.8418 0.458984C12.4772 0.152995 12.0849 0 11.665 0C11.2451 0 10.8529 0.152995 10.4883 0.458984L0.3125 9.00391C0.104167 9.17318 0 9.38476 0 9.63867ZM17.8223 5.23438L20.2734 7.30469V2.79297C20.2734 2.57812 20.2099 2.40722 20.083 2.28027C19.9561 2.15332 19.7852 2.08984 19.5703 2.08984H18.5254C18.3171 2.08984 18.1478 2.15332 18.0176 2.28027C17.8874 2.40722 17.8223 2.57812 17.8223 2.79297V5.23438Z" />
          </g>
          <defs>
          <clipPath id="clip0_127_938">
          <rect width="23.3105" height="22.1582" />
          </clipPath>
          </defs>
        </svg>
      `,
      content: `<app-home></app-home>`
    },
    {
      icon: `
        <svg viewBox="0 0 23 30" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g clip-path="url(#clip0_127_934)">
          <path d="M4.19798 29.3037H21.906C22.2069 29.3037 22.4644 29.1966 22.6786 28.9824C22.8929 28.7682 23 28.5107 23 28.2099C23 27.9728 22.927 27.7563 22.7811 27.5603C22.6353 27.3643 22.453 27.2299 22.2342 27.1569C21.6599 26.929 21.2474 26.5575 20.9967 26.0424C20.746 25.5274 20.6845 24.9577 20.8121 24.3332C20.9397 23.7088 21.2862 23.1094 21.8514 22.5351C22.1066 22.2798 22.3618 21.9607 22.617 21.5779C22.8723 21.195 23 20.6617 23 19.978V4.2937C23 2.87158 22.6467 1.80043 21.9402 1.08026C21.2337 0.360087 20.1739 0 18.7609 0H4.23899C2.82599 0 1.76625 0.357808 1.05975 1.07342C0.35325 1.78904 0 2.86246 0 4.2937V25.0785C0 26.4824 0.350971 27.5376 1.05291 28.244C1.75486 28.9505 2.80321 29.3037 4.19798 29.3037ZM4.32104 27.1023C3.62822 27.1023 3.10176 26.9245 2.74168 26.5689C2.38159 26.2134 2.20155 25.7121 2.20155 25.0648C2.20155 24.454 2.40438 23.964 2.81005 23.5948C3.21572 23.2256 3.7604 23.041 4.44411 23.041H18.4739C18.647 23.041 18.8066 23.0274 18.9525 23C18.6334 23.711 18.4944 24.4244 18.5353 25.14C18.5763 25.8556 18.7792 26.5097 19.1439 27.1023H4.32104ZM3.91082 20.9625C3.70115 20.9625 3.51882 20.885 3.36384 20.7301C3.20887 20.5751 3.13139 20.3882 3.13139 20.1694V2.89892C3.13139 2.68014 3.20887 2.49554 3.36384 2.34512C3.51882 2.1947 3.70115 2.1195 3.91082 2.1195C4.12049 2.1195 4.30509 2.1947 4.46462 2.34512C4.62416 2.49554 4.70393 2.68014 4.70393 2.89892V20.1694C4.70393 20.3882 4.62416 20.5751 4.46462 20.7301C4.30509 20.885 4.12049 20.9625 3.91082 20.9625Z" fill-opacity="0.85"/>
          </g>
          <defs>
          <clipPath id="clip0_127_934">
          <rect width="23" height="29.3037" />
          </clipPath>
          </defs>
        </svg>
      `,
      content: `<app-bookmark-list></app-bookmark-list>`
    },
    {
      icon: `
        <svg viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g clip-path="url(#clip0_126_137)">
          <path d="M5.60343 12.7114C5.37794 12.7114 5.19003 12.6363 5.03969 12.486C4.88937 12.3358 4.81421 12.148 4.81421 11.9226C4.81421 11.7047 4.88937 11.5207 5.03969 11.3704C5.19003 11.2202 5.37794 11.145 5.60343 11.145H10.7108V4.3273C10.7108 4.10943 10.7859 3.92537 10.9363 3.77511C11.0866 3.62486 11.2707 3.54974 11.4887 3.54974C11.7142 3.54974 11.9021 3.62486 12.0525 3.77511C12.2028 3.92537 12.278 4.10943 12.278 4.3273V11.9226C12.278 12.148 12.2028 12.3358 12.0525 12.486C11.9021 12.6363 11.7142 12.7114 11.4887 12.7114H5.60343ZM11.5 22.9888C13.0709 22.9888 14.5498 22.6883 15.9365 22.0872C17.3233 21.4863 18.5466 20.6561 19.6063 19.5968C20.6662 18.5375 21.4967 17.3149 22.098 15.9287C22.6993 14.5427 23 13.0646 23 11.4944C23 9.92424 22.6993 8.44612 22.098 7.06003C21.4967 5.67395 20.6662 4.45126 19.6063 3.39197C18.5466 2.33268 17.3214 1.50253 15.9308 0.901521C14.5403 0.300507 13.0596 0 11.4887 0C9.9178 0 8.43896 0.300507 7.0522 0.901521C5.66543 1.50253 4.44403 2.33268 3.38799 3.39197C2.33194 4.45126 1.50327 5.67395 0.90196 7.06003C0.300653 8.44612 0 9.92424 0 11.4944C0 13.0646 0.300653 14.5427 0.90196 15.9287C1.50327 17.3149 2.33382 18.5375 3.39362 19.5968C4.45343 20.6561 5.67671 21.4863 7.06347 22.0872C8.45023 22.6883 9.92907 22.9888 11.5 22.9888Z" fill-opacity="0.85"/>
          </g>
          <defs>
          <clipPath id="clip0_126_137">
          <rect width="23" height="23" />
          </clipPath>
          </defs>
        </svg>
      `,
      content: `<app-history-list></app-history-list>`
    }
  ]

  render() {
    this.shadowRoot.innerHTML = `
      <main>
        <section class="sidebar-container">
          <app-window radius="999">
            <ul class="sidebar">
            ${renderMap(this.itemList, ({ icon }) => `
              <li>${icon}</li>
            `)}
            </ul>
          </app-window>
        </section>

        <section class="content">
        ${renderMap(this.itemList, ({ content }) => content)}
        </section>
      </main>

      <app-boot></app-boot>
      <app-background></app-background>
    `;
  }

  selectIdx = 0;

  firstUpdated() {
    const main = this.shadowRoot.querySelector("main");
    const content = this.shadowRoot.querySelector(".content");
    const sidebar = this.shadowRoot.querySelector(".sidebar");
    const sidebarList = [...sidebar.children];

    const animateSidebar = async (idx) => {
      await chrome.storage.local.set({ "appIdx": idx });
      sidebarList[this.selectIdx].classList.remove('select');
      this.selectIdx = idx;
      sidebarList[this.selectIdx].classList.add('select');
    }

    const { moveToIdx, prev, next } = addDragToScrollAnimation(content, 'vertical', animateSidebar);

    main.addEventListener("wheel", throttle((e) => {
      if (e.deltaY < 0) prev();
      else next();
    }, 300), { passive: true });

    sidebarList.forEach((li, idx) => {
      li.addEventListener('click', () => {
        if (idx === this.selectIdx) return;
        moveToIdx(idx);
      })
    });

    chrome.storage.local.get(["appIdx", "boot"], async ({ appIdx, boot }) => {
      const bootElem = this.shadowRoot.querySelector("app-boot");
      
      if (boot) {
        bootElem.dispatchEvent(new CustomEvent('boot'));
        await delay(5500);
      } else {
        this.shadowRoot.querySelector("app-boot").remove();
      }

      if (typeof appIdx === 'number') {
        this.selectIdx = appIdx;
      }

      moveToIdx(this.selectIdx, 'direct');
      fadeIn(main);
    });

  }
} 