export async function getRecentHistory(n) {
  return await chrome.history.search({ text: '', maxResults: n })
}

export function throttle(callback, delay) {
  let timer;
  return function () {
    if (!timer) {
      timer = setTimeout(_ => {
        callback.apply(this, arguments);
        timer = undefined;
      }, delay);
    }
  };
};

export function debounce(callback, delay) {
  let timer;
  return function () {
    clearTimeout(timer);
    timer = setTimeout(_ => callback.apply(this, arguments), delay);
  };
};

export function delay(n = IOS_DURATION) {
  return new Promise(res => setTimeout(() => res(true), n));
}

export function roundToThirdDecimal(num) {
  return Math.round(num * 1000) / 1000;
}

export function minMax(x, min, max) {
  if (x < min) return min;
  else if (x > max) return max;
  return x;
}