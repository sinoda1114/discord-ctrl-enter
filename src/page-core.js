function installDiscordCtrlEnter(rootWindow = window) {
  if (rootWindow.__discordCtrlEnterInstalled) {
    return;
  }

  rootWindow.__discordCtrlEnterInstalled = true;

  const document = rootWindow.document;
  const Element = rootWindow.Element;
  const Node = rootWindow.Node;

  const EDITOR_SELECTOR = [
    '[role="textbox"][contenteditable="true"]',
    '[contenteditable="true"]',
    'textarea'
  ].join(",");

  let swallowing = false;

  installCaptureGuards();
  installVisibleBadge();

  console.info("[Discord Ctrl Enter] installed v0.5.6");

  function installCaptureGuards() {
    for (const target of [rootWindow, document, document.documentElement]) {
      if (!target) {
        continue;
      }

      target.addEventListener("keydown", handleKeyboardEvent, true);
      target.addEventListener("beforeinput", handleBeforeInput, true);
    }
  }

  function handleKeyboardEvent(event) {
    if (swallowing || !isDiscordChannelRoute() || !isEnterKey(event) || isImePending(event)) {
      return false;
    }

    const editor = findEditor(event.target) || findEditor(document.activeElement) || findEditorFromSelection();
    if (!editor) {
      return false;
    }

    if (event.shiftKey) {
      return false;
    }

    stop(event);

    if (event.type !== "keydown") {
      return true;
    }

    if (event.ctrlKey || event.metaKey) {
      dispatchSendEnter(editor);
      return true;
    }

    if (!event.altKey) {
      dispatchNewlineEnter(editor);
    }

    return true;
  }

  function handleBeforeInput(event) {
    if (swallowing || !isDiscordChannelRoute()) {
      return false;
    }

    if (event.inputType !== "insertParagraph") {
      return false;
    }

    if (event.isComposing) {
      return false;
    }

    const editor = findEditor(event.target) || findEditor(document.activeElement) || findEditorFromSelection();
    if (!editor) {
      return false;
    }

    stop(event);
    return true;
  }

  function stop(event) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
  }

  function isEnterKey(event) {
    if (isImePending(event)) {
      return false;
    }

    return event.key === "Enter" ||
      event.code === "Enter" ||
      event.code === "NumpadEnter" ||
      event.keyCode === 13 ||
      event.which === 13;
  }

  function isImePending(event) {
    return event.keyCode === 229 || event.which === 229 || event.key === "Process";
  }

  function findEditor(target) {
    if (!(target instanceof Element)) {
      return null;
    }

    if (target.matches(EDITOR_SELECTOR)) {
      return target;
    }

    return target.closest(EDITOR_SELECTOR);
  }

  function findEditorFromSelection() {
    const anchorNode = rootWindow.getSelection()?.anchorNode;
    if (!anchorNode) {
      return null;
    }

    const element = anchorNode.nodeType === Node.ELEMENT_NODE ? anchorNode : anchorNode.parentElement;
    return findEditor(element);
  }

  function insertNewline(editor) {
    if (!editor) {
      return;
    }

    editor.focus();

    if (editor instanceof rootWindow.HTMLTextAreaElement) {
      const start = editor.selectionStart;
      const end = editor.selectionEnd;
      editor.value = `${editor.value.slice(0, start)}\n${editor.value.slice(end)}`;
      editor.selectionStart = start + 1;
      editor.selectionEnd = start + 1;
      editor.dispatchEvent(new rootWindow.Event("input", { bubbles: true }));
      return;
    }

    swallowing = true;
    try {
      if (!document.execCommand("insertLineBreak")) {
        document.execCommand("insertHTML", false, "<br>");
      }
      editor.dispatchEvent(new rootWindow.InputEvent("input", {
        bubbles: true,
        cancelable: false,
        inputType: "insertLineBreak",
        data: null
      }));
    } finally {
      swallowing = false;
    }
  }

  function dispatchNewlineEnter(editor) {
    if (!editor) {
      return;
    }

    swallowing = true;
    try {
      editor.dispatchEvent(new rootWindow.KeyboardEvent("keydown", {
        key: "Enter",
        code: "Enter",
        keyCode: 13,
        which: 13,
        shiftKey: true,
        bubbles: true,
        cancelable: true
      }));
    } finally {
      swallowing = false;
    }
  }

  function dispatchSendEnter(editor) {
    if (!editor) {
      return;
    }

    swallowing = true;
    try {
      editor.dispatchEvent(new rootWindow.KeyboardEvent("keydown", {
        key: "Enter",
        code: "Enter",
        keyCode: 13,
        which: 13,
        bubbles: true,
        cancelable: true
      }));
    } finally {
      swallowing = false;
    }
  }

  function isDiscordChannelRoute() {
    return (rootWindow.location.hostname === "discord.com" ||
      rootWindow.location.hostname === "discordapp.com" ||
      rootWindow.location.hostname.endsWith(".discord.com")) &&
      rootWindow.location.pathname.startsWith("/channels/");
  }

  function installVisibleBadge() {
    const badge = document.createElement("div");
    badge.textContent = "Ctrl Enter v0.5.6";
    badge.style.cssText = [
      "position:fixed",
      "right:8px",
      "bottom:8px",
      "z-index:2147483647",
      "padding:4px 7px",
      "border-radius:6px",
      "background:#202225",
      "color:#fff",
      "font:12px/1.2 system-ui,sans-serif",
      "opacity:.72",
      "pointer-events:none"
    ].join(";");
    document.documentElement.appendChild(badge);
    if (typeof rootWindow.setTimeout === "function") {
      rootWindow.setTimeout(() => badge.remove(), 7000);
    }
  }
}

if (typeof module !== "undefined") {
  module.exports = { installDiscordCtrlEnter };
}

if (typeof window !== "undefined") {
  installDiscordCtrlEnter(window);
}
