import { debounce, delay, minMax, roundToThirdDecimal } from "./lib.js";

class Ease {
  static easeOutExpo = (x) => { return x === 1 ? 1 : 1 - Math.pow(2, -10 * x); }
}

export function addDragToScrollAnimation(rootElem, direction = 'vertical', callback) {
  [...rootElem.children].forEach(_elem => {
    _elem.style.width = '100%';
    _elem.style.height = '100%';
    _elem.style.flexShrink = 0;
  });

  rootElem.style.display = 'flex';
  rootElem.style.overflow = 'hidden';
  if (direction === 'horizontal') {
    rootElem.style.flexWrap = 'nowrap';
  } else {
    rootElem.style.flexDirection = 'column';
  }

  const n = rootElem.children.length;

  const GDuration = 1000,
        GSpringRatio = 0.3,
        GChildren = [...rootElem.children],
        scrollRef = direction === 'horizontal' ? 'scrollLeft' : 'scrollTop';
  
  let GItemLength = direction === 'horizontal' ? rootElem.offsetWidth : rootElem.offsetHeight,
      GTotalLength = GItemLength * (n - 1) + GItemLength * (GSpringRatio * 2);

  let GCurrentIdx = 0;

  function getScrollPositionByIdx(_idx) {
    return (_idx + GSpringRatio) * GItemLength;
  }

  // TODO: div1, div2 width
  const div1 = document.createElement('div'),
        div2 = document.createElement('div'),
        dummySize = GSpringRatio * GItemLength;

  div1.style.width = dummySize + "px";
  div1.style.height = dummySize + "px";
  div1.style.flexShrink = 0;

  div2.style.width = dummySize + "px";
  div2.style.height = dummySize + "px";
  div2.style.flexShrink = 0;

  rootElem.insertBefore(div1, rootElem.firstChild);
  rootElem.appendChild(div2);


  // ---------------------------------------------------------------------------------------
  const childrenIdxMap = GChildren.reduce((prev, curr, i) => prev.set(curr, i), new Map());

  const ioForCurrentIdxUpdate = new IntersectionObserver((entries) => {
    for (const info of entries) {
      if (info.isIntersecting) {
        const i = childrenIdxMap.get(info.target);
        GCurrentIdx = i;

        if (callback) callback(GCurrentIdx);

        return;
      }
    }
  }, { threshold: 0.1 });

  childrenIdxMap.forEach((i, elem) => {
    ioForCurrentIdxUpdate.observe(elem);
  });


  // ---------------------------------------------------------------------------------------
  let isMouseDown = false,
      x1 = 0,
      y1 = 0,
      x2 = 0,
      y2 = 0;

  function moveTo(dest, duration) {
    const from = rootElem[scrollRef],
          start = Date.now();

    function scroll() {
      if (isMouseDown) return;

      const currentTime = Date.now(),
            time = Math.min(1, ((currentTime - start) / duration)),
            easedT = Ease.easeOutExpo(roundToThirdDecimal(time));

      rootElem[scrollRef] = (easedT * (dest - from)) + from;

      if (time < 1) requestAnimationFrame(scroll);
      // else --> scroll end event
    }

    requestAnimationFrame(scroll);
  }

  function directMoveTo(idx) {
    rootElem[scrollRef] = getScrollPositionByIdx(minMax(idx, 0, n - 1));
  }

  const mousedownHandler = (e) => {
    isMouseDown = true;
    x1 = e.x; y1 = e.y;
  }
  rootElem.addEventListener('mousedown', mousedownHandler);
  
  const mousemoveHandler = (e) => {
    if (!isMouseDown) return;

    x2 = e.x; y2 = e.y;
    const d = direction === 'horizontal' ? -e.movementX : -e.movementY;

    const from = rootElem[scrollRef];
    rootElem[scrollRef] = minMax(from + d, 0, GTotalLength);
  }
  rootElem.addEventListener('mousemove', mousemoveHandler);

  const mouseupHandler = (e) => {
    isMouseDown = false;
    x2 = e.x; y2 = e.y;

    moveTo(getScrollPositionByIdx(GCurrentIdx), GDuration);
  }
  ['mouseup', 'mouseleave'].forEach(event => rootElem.addEventListener(event, mouseupHandler));


  // ---------------------------------------------------------------------------------------
  const opacityInit = 0,
        scaleInit = 0.7,
        showingMap = new Map(),
        offsetLeftMap = new Map();

  function getRatio(elem) {
    const left = offsetLeftMap.get(elem);
    return minMax(Math.abs(left - rootElem[scrollRef]), 0, GItemLength) / GItemLength;
  }

  function styleChild(elem) {
    const ratio = roundToThirdDecimal(getRatio(elem));

    elem.style.scale = String(scaleInit + (1 - ratio) * (1 - scaleInit));
    elem.style.opacity = String(opacityInit + (1 - ratio) * (1 - opacityInit));
  }

  const ioForRenderItems = new IntersectionObserver((entries) => entries.forEach(info => {
    showingMap.set(info.target, info.isIntersecting);
  }));

  GChildren.forEach((elem, i) => {
    offsetLeftMap.set(elem, getScrollPositionByIdx(i));
    showingMap.set(elem, false);
    ioForRenderItems.observe(elem);

    styleChild(elem);
  });

  function renderChildren() {
    GChildren.forEach((elem) => {
      const isShowing = showingMap.get(elem);

      if (!isShowing) return;

      styleChild(elem);
    });

    if (!lifeCycle) return;

    requestAnimationFrame(renderChildren);
  }

  requestAnimationFrame(renderChildren);


  // ---------------------------------------------------------------------------------------
  setTimeout(() => {
    directMoveTo(0);
  });


  window.addEventListener("resize", debounce(() => {
    // GTotalLength, GItemLength
    GItemLength = direction === 'horizontal' ? rootElem.offsetWidth : rootElem.offsetHeight;
    GTotalLength = GItemLength * (n - 1) + GItemLength * (GSpringRatio * 2);

    // div1, div2 width
    const newDummySize = GSpringRatio * GItemLength;

    div1.style.width = newDummySize + "px";
    div1.style.height = newDummySize + "px";

    div2.style.width = newDummySize + "px";
    div2.style.height = newDummySize + "px";

    // offsetLeftMap
    offsetLeftMap.clear();
    GChildren.forEach((elem, i) => {
      offsetLeftMap.set(elem, getScrollPositionByIdx(i));
    });

    setTimeout(() => {
      directMoveTo(GCurrentIdx);
    });
  }, 500));

  const moveToIdx = (idx, mode = 'smooth') => {
    if (mode === 'smooth') {
      moveTo(getScrollPositionByIdx(minMax(idx, 0, n - 1)), GDuration);
    } else if (mode === 'direct') {
      directMoveTo(idx);
    }

    if (idx < 0 || n <= idx) console.error("Wrong idx range");
  }

  const prev = () => {
    moveTo(getScrollPositionByIdx(minMax(GCurrentIdx - 1, 0, n - 1)), GDuration);
  }

  const next = () => {
    moveTo(getScrollPositionByIdx(minMax(GCurrentIdx + 1, 0, n - 1)), GDuration);
  }

  var lifeCycle = true;

  function detach() {
    lifeCycle = false;
    rootElem.removeEventListener('mousedown', mousedownHandler);
    rootElem.removeEventListener('mousemove', mousemoveHandler);
    ['mouseup', 'mouseleave'].forEach(event => rootElem.removeEventListener(event, mouseupHandler));
  }

  return { moveToIdx, prev, next, detach };
}

export async function fadeIn(elem) {
  elem.style.transform = 'scale(1.5)';
  elem.style.opacity = '0';
  elem.style.filter = 'blur(10px)';

  await delay(100);

  elem.style.transition = `ease 450ms`;
  elem.style.transform = '';
  elem.style.opacity = '1'; 
  elem.style.filter = '';
}