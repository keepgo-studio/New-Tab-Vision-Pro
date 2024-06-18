import { Component, renderMap } from "../assets/core.js";

export default class Home extends Component {
  css = `
    section {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    @media only screen and (min-width: 960px) {
      ul {
        width: 100%;
        display: grid;
        grid-template-areas:
          "a1 a2 a3 a4 ."
          "b1 b2 b3 b4 b5"
          "c1 c2 c3 c4 .";
        gap: 46px;
      }
      ul li {
        display: flex;
        justify-content: center;
      }
      ul li:nth-child(1) { grid-area: a1; width: 200%; }
      ul li:nth-child(2) { grid-area: a2; width: 200%; }
      ul li:nth-child(3) { grid-area: a3; width: 200%; }
      ul li:nth-child(4) { grid-area: a4; width: 200%; }
      ul li:nth-child(5) { grid-area: b1; }
      ul li:nth-child(6) { grid-area: b2; }
      ul li:nth-child(7) { grid-area: b3; }
      ul li:nth-child(8) { grid-area: b4; }
      ul li:nth-child(9) { grid-area: b5; }
      ul li:nth-child(10) { grid-area: c1; width: 200%; }
      ul li:nth-child(11) { grid-area: c2; width: 200%; }
      ul li:nth-child(12) { grid-area: c3; width: 200%; }
      ul li:nth-child(13) { grid-area: c4; width: 200%; }
    }

    @media only screen and (max-width: 960px) {
      ul {
        width: 100%;
        display: flex;
        flex-wrap: wrap;
        gap: 46px;
        justify-content: center;
      }
    }

    
    ul li .wrapper {
      display: flex;
      flex-direction: column;
      gap: 10px;
      align-items: center;
      justify-content: center;
      transition: var(--duration);
    }
    ul li .wrapper:hover {
      transform: scale(1.1);
    }
    ul li .wrapper:active {
      transform: scale(1.05);
    }

    app-window {
      border-radius: 999px;
      box-shadow: var(--shadow);
    }
    a {
      width: clamp(100px, 8vw, 160px);
      height: clamp(100px, 8vw, 160px);
      border-radius: 999px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #fff;
    }
    img {
      display: inline-block;
      width: 100%;
      aspect-ratio: 1 / 1;
      object-fit: contain;
    }
    p {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.8);
    }
  `;

  iconList = [
    { 
      src:"/app/assets/icons/apple.png",
      title: "apple",
      href: "https://www.apple.com",
    },
    { 
      src:"/app/assets/icons/youtube-music.png",
      title: "music",
      href: "https://music.youtube.com/",
    },
    { 
      src:"/app/assets/icons/gmap.png",
      title: "map",
      href: "https://www.google.com/maps",
    },
    { 
      src:"/app/assets/icons/setting.png",
      title: "setting",
      action: "chrome://settings/",
    },
    { 
      src:"/app/assets/icons/youtube.png",
      title: "youtube",
      href: "https://www.youtube.com/",
    },
    { 
      src:"/app/assets/icons/safari.png",
      title: "safari",
      action: "chrome://newtab",
    },
    { 
      src:"/app/assets/icons/gphoto.png",
      title: "photo",
      href: "https://www.google.com/photos/",
    },
    { 
      src:"/app/assets/icons/notes.png",
      title: "notes",
      href: "https://keep.google.com/",
    },
    { 
      src:"/app/assets/icons/market.png",
      title: "market",
      href: "https://chrome.google.com/webstore/category/extensions",
    },
    { 
      src:"/app/assets/icons/gmail.png",
      title: "mail",
      href: "https://gmail.com/",
    },
    { 
      src:"/app/assets/icons/naver.png",
      title: "naver",
      href: "https://naver.com/",
    },
    { 
      src:"/app/assets/icons/translate.png",
      title: "translate",
      href: "https://translate.google.com/",
    },
    { 
      src:"/app/assets/icons/chrome.png",
      title: "•••",
      action: "chrome://dino/",
    },
  ];

  render() {
    this.shadowRoot.innerHTML = `
      <section>
        <ul>
        ${renderMap(this.iconList, (item, idx) => `
          <li>
            <div class="wrapper">
              <app-window radius="999">
                <a
                  ${item.href ? `href="${item.href}" target="_blank"` : ""} 
                  class="${item.action ? `action idx-${idx}` : ""}"
                >
                  <img src=${item.src} alt="icon" />
                </a>
              </app-window>

              <p>${item.title}</p>
            </div>
          </li>
        `)}
        </ul>
      </section>
    `
  }

  firstUpdated() {
    [...this.shadowRoot.querySelectorAll("a")].forEach(a => {
      a.addEventListener("dragstart", (e) => e.preventDefault());

      if (a.classList.contains("action")) {
        a.addEventListener("click", () => {
          const idx = a.className.split("idx-")[1];
          chrome.tabs.create({ active: true, url: this.iconList[idx].action });
        });
      }
    });
  }
}

