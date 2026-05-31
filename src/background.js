const DEFAULT_SETTINGS = {
  enabled: true
};

chrome.runtime.onInstalled.addListener(async () => {
  const stored = await chrome.storage.sync.get(DEFAULT_SETTINGS);
  await chrome.storage.sync.set({
    ...DEFAULT_SETTINGS,
    ...stored
  });
});
