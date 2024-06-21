function devMode() {
  const BACKGROUND = [
    { name: "manifest.json", timestamp: 0, changed: false },
    { name: "worker.js", timestamp: 0, changed: false },
  ];

  async function filesInDirectory(dir) {
    return new Promise(res => dir.createReader().readEntries(entries =>
      Promise.all(
        entries
          .filter(e => e.name[0] !== '.')
          .map(e => e.isDirectory ? filesInDirectory(e) : new Promise(resolve => e.file(resolve)))
      )
        .then(files => [].concat(...files))
        .then(res)
    ))
  }

  async function timestampForFilesInDirectory(dir) {
    const files = await filesInDirectory(dir);

    return files.map(f => {
      const idx = BACKGROUND.findIndex(item => item.name === f.name);

      if (idx !== -1) {
        BACKGROUND[idx].changed = new Date(BACKGROUND[idx].timestamp).valueOf() !== f.lastModifiedDate.valueOf();
        BACKGROUND[idx].timestamp = f.lastModifiedDate;
      }

      return f.name + f.lastModifiedDate;
    }).join();
  }

  function reload() {
    chrome.tabs.query({ 
      active: true, 
      currentWindow: true 
    }, tabs => {
      if (tabs[0] && tabs[0].url === "chrome://newtab/") { 
        chrome.tabs.reload(tabs[0].id);
      }

      if (BACKGROUND.some(info => info.timestamp > 0 && info.changed))  {
        chrome.runtime.reload();
      }
    });
  }

  const INTERVAL = 1000;
  async function watch(dir, lastTimestamp) {
    const timestamp = await timestampForFilesInDirectory(dir);

    if (!lastTimestamp || (lastTimestamp === timestamp)) {
      setTimeout(() => watch(dir, timestamp), INTERVAL);
    } else {
      reload();
    }
  }

  chrome.management.getSelf(self => {
    if (self.installType === 'development') {
      chrome.runtime.getPackageDirectoryEntry(dir => watch(dir));
    }
  });
}

function main() {
  devMode();
}

main();