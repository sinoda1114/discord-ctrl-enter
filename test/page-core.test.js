const assert = require("node:assert/strict");
const test = require("node:test");
const { installDiscordCtrlEnter } = require("../src/page-core");

test("plain Enter in Discord channels is blocked before Discord listeners can send", () => {
  const env = createFakeDiscordWindow();
  const editor = env.document.createElement("div");
  editor.setAttribute("contenteditable", "true");
  env.document.body.appendChild(editor);
  editor.focus();

  installDiscordCtrlEnter(env.window);

  let discordSendCount = 0;
  let discordNewlineCount = 0;
  env.document.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey && !event.ctrlKey && !event.metaKey) {
      discordSendCount += 1;
    }
    if (event.key === "Enter" && event.shiftKey) {
      discordNewlineCount += 1;
    }
  });

  const event = new env.window.KeyboardEvent("keydown", {
    key: "Enter",
    code: "Enter",
    keyCode: 13,
    which: 13,
    bubbles: true,
    cancelable: true
  });

  editor.dispatchEvent(event);

  assert.equal(event.defaultPrevented, true);
  assert.equal(discordSendCount, 0);
  assert.equal(discordNewlineCount, 1);
});

test("plain Enter is ignored when no editor is focused", () => {
  const env = createFakeDiscordWindow();

  installDiscordCtrlEnter(env.window);

  let discordSendCount = 0;
  env.document.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.ctrlKey && !event.metaKey) {
      discordSendCount += 1;
    }
  });

  const event = new env.window.KeyboardEvent("keydown", {
    key: "Enter",
    code: "Enter",
    keyCode: 13,
    which: 13,
    bubbles: true,
    cancelable: true
  });

  env.document.body.dispatchEvent(event);

  assert.equal(event.defaultPrevented, false);
  assert.equal(discordSendCount, 1);
  assert.deepEqual(env.document.execCommands, []);
});

test("Ctrl+Enter dispatches a synthetic Enter that Discord listeners can send", async () => {
  const env = createFakeDiscordWindow();
  const editor = env.document.createElement("div");
  editor.setAttribute("contenteditable", "true");
  env.document.body.appendChild(editor);
  editor.focus();

  installDiscordCtrlEnter(env.window);

  let discordSendCount = 0;
  env.document.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      discordSendCount += 1;
    }
  });

  const event = new env.window.KeyboardEvent("keydown", {
    key: "Enter",
    code: "Enter",
    keyCode: 13,
    which: 13,
    ctrlKey: true,
    bubbles: true,
    cancelable: true
  });

  editor.dispatchEvent(event);

  assert.equal(event.defaultPrevented, true);
  assert.equal(discordSendCount, 1);
  assert.equal(env.document.execCommands.includes("insertLineBreak"), false);
});

test("Shift+Enter is left to Discord native newline handling", () => {
  const env = createFakeDiscordWindow();
  const editor = env.document.createElement("div");
  editor.setAttribute("contenteditable", "true");
  env.document.body.appendChild(editor);
  editor.focus();

  installDiscordCtrlEnter(env.window);

  let discordListenerCount = 0;
  env.document.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && event.shiftKey) {
      discordListenerCount += 1;
    }
  });

  const event = new env.window.KeyboardEvent("keydown", {
    key: "Enter",
    code: "Enter",
    keyCode: 13,
    which: 13,
    shiftKey: true,
    bubbles: true,
    cancelable: true
  });

  editor.dispatchEvent(event);

  assert.equal(event.defaultPrevented, false);
  assert.equal(discordListenerCount, 1);
});

test("plain Enter does not block normal fetch calls after key handling", async () => {
  const env = createFakeDiscordWindow();
  const editor = env.document.createElement("div");
  editor.setAttribute("contenteditable", "true");
  env.document.body.appendChild(editor);
  editor.focus();

  let fetchCount = 0;
  env.window.fetch = async () => {
    fetchCount += 1;
    return { ok: true };
  };

  installDiscordCtrlEnter(env.window);

  editor.dispatchEvent(new env.window.KeyboardEvent("keydown", {
    key: "Enter",
    code: "Enter",
    keyCode: 13,
    which: 13,
    bubbles: true,
    cancelable: true
  }));

  const response = await env.window.fetch("https://discord.com/api/v9/channels/123/messages", { method: "POST" });

  assert.equal(response.ok, true);
  assert.equal(fetchCount, 1);
});

test("message POST is allowed when it was not triggered by plain Enter", async () => {
  const env = createFakeDiscordWindow();

  let fetchCount = 0;
  env.window.fetch = async () => {
    fetchCount += 1;
    return { ok: true };
  };

  installDiscordCtrlEnter(env.window);

  const response = await env.window.fetch("https://discord.com/api/v9/channels/123/messages", { method: "POST" });

  assert.equal(response.ok, true);
  assert.equal(fetchCount, 1);
});

test("Ctrl+Enter allows normal fetch calls after send handling", async () => {
  const env = createFakeDiscordWindow();
  const editor = env.document.createElement("div");
  editor.setAttribute("contenteditable", "true");
  env.document.body.appendChild(editor);
  editor.focus();

  let fetchCount = 0;
  env.window.fetch = async () => {
    fetchCount += 1;
    return { ok: true };
  };

  installDiscordCtrlEnter(env.window);

  editor.dispatchEvent(new env.window.KeyboardEvent("keydown", {
    key: "Enter",
    code: "Enter",
    keyCode: 13,
    which: 13,
    ctrlKey: true,
    bubbles: true,
    cancelable: true
  }));

  const response = await env.window.fetch("https://discord.com/api/v9/channels/123/messages", { method: "POST" });

  assert.equal(response.ok, true);
  assert.equal(fetchCount, 1);
});

test("Enter with leftover isComposing=true (macOS quirk) is still blocked", () => {
  const env = createFakeDiscordWindow();
  const editor = env.document.createElement("div");
  editor.setAttribute("contenteditable", "true");
  env.document.body.appendChild(editor);
  editor.focus();

  installDiscordCtrlEnter(env.window);

  let discordSendCount = 0;
  let discordNewlineCount = 0;
  env.document.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey && !event.ctrlKey && !event.metaKey) {
      discordSendCount += 1;
    }
    if (event.key === "Enter" && event.shiftKey) {
      discordNewlineCount += 1;
    }
  });

  const event = new env.window.KeyboardEvent("keydown", {
    key: "Enter",
    code: "Enter",
    keyCode: 13,
    which: 13,
    isComposing: true,
    bubbles: true,
    cancelable: true
  });

  editor.dispatchEvent(event);

  assert.equal(event.defaultPrevented, true);
  assert.equal(discordSendCount, 0);
  assert.equal(discordNewlineCount, 1);
});

test("real IME-pending keydown (keyCode 229) is left alone", () => {
  const env = createFakeDiscordWindow();
  const editor = env.document.createElement("div");
  editor.setAttribute("contenteditable", "true");
  env.document.body.appendChild(editor);
  editor.focus();

  installDiscordCtrlEnter(env.window);

  const event = new env.window.KeyboardEvent("keydown", {
    key: "Process",
    code: "Enter",
    keyCode: 229,
    which: 229,
    isComposing: true,
    bubbles: true,
    cancelable: true
  });

  editor.dispatchEvent(event);

  assert.equal(event.defaultPrevented, false);
});

test("Enter outside Discord channel routes is left alone", () => {
  const env = createFakeDiscordWindow({ pathname: "/app" });

  installDiscordCtrlEnter(env.window);

  let listenerCount = 0;
  env.document.addEventListener("keydown", () => {
    listenerCount += 1;
  });

  const event = new env.window.KeyboardEvent("keydown", {
    key: "Enter",
    code: "Enter",
    keyCode: 13,
    which: 13,
    bubbles: true,
    cancelable: true
  });

  env.document.body.dispatchEvent(event);

  assert.equal(event.defaultPrevented, false);
  assert.equal(listenerCount, 1);
});

function createFakeDiscordWindow(options = {}) {
  FakeEventTarget.prototype.addEventListener = ORIGINAL_FAKE_ADD_EVENT_LISTENER;

  const window = new FakeWindow(options);
  return {
    window,
    document: window.document
  };
}

class FakeEventTarget {
  constructor() {
    this.listeners = new Map();
  }

  addEventListener(type, listener, options = false) {
    const normalized = typeof options === "boolean" ? { capture: options } : (options || {});
    const listeners = this.listeners.get(type) || [];
    listeners.push({ listener, capture: Boolean(normalized.capture) });
    this.listeners.set(type, listeners);
  }

  dispatchEvent(event) {
    event.target = event.target || this;
    const path = buildEventPath(this);

    for (let index = path.length - 1; index >= 0; index -= 1) {
      if (invokeListeners(path[index], event, true)) {
        return !event.defaultPrevented;
      }
    }

    for (const target of path) {
      if (invokeListeners(target, event, false)) {
        return !event.defaultPrevented;
      }
    }

    return !event.defaultPrevented;
  }
}

class FakeWindow extends FakeEventTarget {
  constructor({ hostname = "discord.com", pathname = "/channels/123/456" } = {}) {
    super();
    this.location = { hostname, pathname };
    this.fetch = async () => ({ ok: true });
    this.DOMException = DOMException;
    this.URL = URL;
    this.pendingTimers = [];
    this.setTimeout = (callback) => {
      this.pendingTimers.push(callback);
      return this.pendingTimers.length;
    };
    this.clearTimeout = () => {};
    this.EventTarget = FakeEventTarget;
    this.Element = FakeElement;
    this.HTMLButtonElement = FakeButtonElement;
    this.HTMLTextAreaElement = FakeTextAreaElement;
    this.KeyboardEvent = FakeKeyboardEvent;
    this.InputEvent = FakeInputEvent;
    this.Node = { ELEMENT_NODE: 1 };
    this.console = console;
    this.document = new FakeDocument(this);
  }

  getSelection() {
    return { anchorNode: this.document.activeElement };
  }

  async runTimers() {
    const timers = this.pendingTimers.splice(0);
    for (const callback of timers) {
      callback();
    }
  }
}

class FakeDocument extends FakeEventTarget {
  constructor(defaultView) {
    super();
    this.defaultView = defaultView;
    this.parentTarget = defaultView;
    this.activeElement = null;
    this.execCommands = [];
    this.documentElement = this.createElement("html");
    this.documentElement.ownerDocument = this;
    this.documentElement.parentTarget = this;
    this.body = this.createElement("body");
    this.body.ownerDocument = this;
    this.documentElement.appendChild(this.body);
  }

  createElement(tagName) {
    if (tagName.toLowerCase() === "button") {
      return new FakeButtonElement(tagName, this);
    }

    if (tagName.toLowerCase() === "textarea") {
      return new FakeTextAreaElement(tagName, this);
    }

    return new FakeElement(tagName, this);
  }

  execCommand(command) {
    this.execCommands.push(command);
    return true;
  }

  querySelector(selector) {
    return this.body.querySelector(selector);
  }
}

class FakeElement extends FakeEventTarget {
  constructor(tagName = "div", ownerDocument = null) {
    super();
    this.tagName = tagName.toUpperCase();
    this.ownerDocument = ownerDocument;
    this.parentElement = null;
    this.parentTarget = null;
    this.children = [];
    this.attributes = new Map();
    this.offsetParent = {};
    this.style = {};
  }

  appendChild(child) {
    child.parentElement = this;
    child.parentTarget = this;
    child.ownerDocument = this.ownerDocument;
    this.children.push(child);
    return child;
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }

  getAttribute(name) {
    return this.attributes.get(name) ?? null;
  }

  matches(selector) {
    return selector.split(",").some((part) => matchesSimpleSelector(this, part.trim()));
  }

  closest(selector) {
    let current = this;
    while (current) {
      if (current.matches(selector)) {
        return current;
      }

      current = current.parentElement;
    }

    return null;
  }

  querySelector(selector) {
    for (const child of this.children) {
      if (child.matches(selector)) {
        return child;
      }

      const nested = child.querySelector(selector);
      if (nested) {
        return nested;
      }
    }

    return null;
  }

  focus() {
    this.ownerDocument.activeElement = this;
  }

  remove() {
    if (!this.parentElement) {
      return;
    }

    this.parentElement.children = this.parentElement.children.filter((child) => child !== this);
    this.parentElement = null;
    this.parentTarget = null;
  }
}

class FakeButtonElement extends FakeElement {
  constructor(tagName, ownerDocument) {
    super(tagName, ownerDocument);
    this.disabled = false;
    this.clickCount = 0;
  }

  click() {
    this.clickCount += 1;
  }
}

class FakeTextAreaElement extends FakeElement {
  constructor(tagName, ownerDocument) {
    super(tagName, ownerDocument);
    this.value = "";
    this.selectionStart = 0;
    this.selectionEnd = 0;
  }
}

class FakeKeyboardEvent {
  constructor(type, init = {}) {
    this.type = type;
    this.key = init.key;
    this.code = init.code;
    this.keyCode = init.keyCode;
    this.which = init.which;
    this.ctrlKey = Boolean(init.ctrlKey);
    this.metaKey = Boolean(init.metaKey);
    this.shiftKey = Boolean(init.shiftKey);
    this.altKey = Boolean(init.altKey);
    this.isComposing = Boolean(init.isComposing);
    this.bubbles = Boolean(init.bubbles);
    this.cancelable = Boolean(init.cancelable);
    this.defaultPrevented = false;
    this.propagationStopped = false;
    this.immediatePropagationStopped = false;
    this.target = null;
  }

  preventDefault() {
    if (this.cancelable) {
      this.defaultPrevented = true;
    }
  }

  stopPropagation() {
    this.propagationStopped = true;
  }

  stopImmediatePropagation() {
    this.immediatePropagationStopped = true;
    this.stopPropagation();
  }
}

class FakeInputEvent extends FakeKeyboardEvent {
  constructor(type, init = {}) {
    super(type, init);
    this.inputType = init.inputType;
    this.data = init.data;
  }
}

function buildEventPath(target) {
  const path = [target];
  let current = target;

  while (current.parentTarget) {
    current = current.parentTarget;
    path.push(current);
  }

  return path;
}

function invokeListeners(target, event, capture) {
  const listeners = target.listeners.get(event.type) || [];

  for (const { listener, capture: listenerCapture } of listeners) {
    if (listenerCapture !== capture) {
      continue;
    }

    if (typeof listener === "function") {
      listener.call(target, event);
    } else {
      listener.handleEvent(event);
    }

    if (event.immediatePropagationStopped) {
      return true;
    }
  }

  return event.propagationStopped;
}

function matchesSimpleSelector(element, selector) {
  if (selector === "[contenteditable=\"true\"]") {
    return element.getAttribute("contenteditable") === "true";
  }

  if (selector === "[role=\"textbox\"][contenteditable=\"true\"][data-slate-editor=\"true\"]") {
    return element.getAttribute("role") === "textbox" &&
      element.getAttribute("contenteditable") === "true" &&
      element.getAttribute("data-slate-editor") === "true";
  }

  if (selector === "[role=\"textbox\"][contenteditable=\"true\"]") {
    return element.getAttribute("role") === "textbox" &&
      element.getAttribute("contenteditable") === "true";
  }

  if (selector === "form") {
    return element.tagName === "FORM";
  }

  if (selector.startsWith("button")) {
    return element instanceof FakeButtonElement;
  }

  if (selector.startsWith("[class*=\"")) {
    const className = element.getAttribute("class") || "";
    const expected = selector.slice(9, -2);
    return className.includes(expected);
  }

  return false;
}

const ORIGINAL_FAKE_ADD_EVENT_LISTENER = FakeEventTarget.prototype.addEventListener;
