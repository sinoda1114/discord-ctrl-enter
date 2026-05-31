(() => {
  injectScript("src/page-core.js", () => {
    injectScript("src/page.js");
  });

  function injectScript(path, onload) {
    const script = document.createElement("script");
    script.async = false;
    script.src = chrome.runtime.getURL(path);
    script.onload = () => {
      script.remove();
      onload?.();
    };
    (document.documentElement || document.head).append(script);
  }
})();
