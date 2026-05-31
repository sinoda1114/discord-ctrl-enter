const DEFAULT_SETTINGS = {
  enabled: true
};

const enabledInput = document.querySelector("#enabled");
const statusElement = document.querySelector("#status");

loadSettings();

document.addEventListener("change", async (event) => {
  const target = event.target;

  if (!(target instanceof HTMLInputElement)) {
    return;
  }

  const nextSettings = readSettingsFromForm();
  await chrome.storage.sync.set(nextSettings);
  showStatus("保存しました");
});

async function loadSettings() {
  const settings = {
    ...DEFAULT_SETTINGS,
    ...(await chrome.storage.sync.get(DEFAULT_SETTINGS))
  };

  enabledInput.checked = settings.enabled;
}

function readSettingsFromForm() {
  return {
    enabled: enabledInput.checked
  };
}

function showStatus(message) {
  statusElement.textContent = message;
  window.clearTimeout(showStatus.timeoutId);
  showStatus.timeoutId = window.setTimeout(() => {
    statusElement.textContent = "";
  }, 1800);
}
