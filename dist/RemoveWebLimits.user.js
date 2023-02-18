
// ==UserScript==
// @name        Remove Web Limits
// @namespace   https://github.com/821938089/RemoveWebLimits
// @description Remove Web Limits
// @match       *://*/*
// @version     0.1.6
// @author      Horis
// @run-at      document-start
// @require     https://cdn.staticfile.org/underscore.js/1.7.0/underscore-min.js
// @require     https://cdn.jsdelivr.net/combine/npm/@violentmonkey/dom@2,npm/@violentmonkey/ui@0.7
// @grant       GM_addStyle
// @grant       GM_getValue
// @grant       GM_registerMenuCommand
// @grant       GM_setValue
// @grant       unsafeWindow
// ==/UserScript==

(function () {
'use strict';

// 加载设置数据
class Setting {
  constructor() {
    this.init();
    // https://stackoverflow.com/a/43323115
    return new Proxy(this, this);
  }
  init() {
    let data = GM_getValue('setting');
    if (!data) {
      data = this.defaultSetting();
    }
    this._data = data;
  }
  save() {
    GM_setValue('setting', this._data);
  }
  reset() {
    GM_setValue('setting', this.defaultSetting());
  }
  defaultSetting() {
    return {
      positionTop: '0',
      positionLeft: '0',
      positionRight: 'auto',
      addBtn: true,
      // shortcut: 3,
      blackList: []
    };
  }
  set(target, prop, value) {
    if (this._data.hasOwnProperty(prop)) {
      this._data[prop] = value;
    } else {
      this[prop] = value;
    }
    return true;
  }
  get(target, prop) {
    if (this._data.hasOwnProperty(prop)) {
      return this._data[prop];
    } else {
      return this[prop];
    }
  }
}
var Setting$1 = new Setting();

// 等待 DOMContentLoaded 事件触发
function domContentLoaded() {
  if (document.readyState === 'loading') {
    return new Promise(resolve => {
      function handler() {
        window.removeEventListener('DOMContentLoaded', handler);
        resolve();
      }
      window.addEventListener('DOMContentLoaded', handler);
    });
  }
}
function domMutation() {
  return new Promise(resolve => {
    const fn = _.debounce(() => {
      observer.disconnect();
      resolve();
    }, 500);
    const observer = new MutationObserver(fn);
    observer.observe(document, {
      childList: true,
      subtree: true
    });
    fn();
  });
}
const _regexCache = {};

/**
 * 将字符串编译为正则
 * @param {RegExp | string} obj
 * @param {string} flag
 * @returns {RegExp}
 */
function toRE(obj, flag = 'igm') {
  if (obj instanceof RegExp) {
    return obj;
  } else if (_regexCache[obj] && _regexCache[obj][flag]) {
    const re = _regexCache[obj][flag];
    re.lastIndex = 0;
    return re;
  } else if (!_regexCache[obj]) {
    const re = new RegExp(obj, flag);
    _regexCache[obj] = {
      [flag]: re
    };
    return re;
  } else if (!_regexCache[obj][flag]) {
    const re = new RegExp(obj, flag);
    _regexCache[obj][flag] = re;
    return re;
  }
}
function setPropReadOnly(obj, prop, target) {
  const value = target != null ? target : obj[prop];
  Object.defineProperty(obj, prop, {
    get() {
      return value;
    },
    set() {},
    configurable: true
  });
}

var css_248z$2 = "#rwl{background:#333;border:1px solid #ccc;border-bottom-right-radius:5px;border-left-width:0;box-sizing:initial;color:#fff;font-family:Verdana,Arial,宋体;font-size:12px;font-weight:500;height:25px;line-height:25px;margin:0;opacity:.05;overflow:hidden;padding:0 16px;position:fixed;text-align:center;transform:translate(-95px);transition:.3s;-moz-user-select:none;user-select:none;white-space:nowrap;width:85px;z-index:2147483647}#rwl input{clip:auto;-webkit-appearance:checkbox;-moz-appearance:checkbox;cursor:pointer;margin:0;opacity:1;padding:0;position:static;vertical-align:middle;visibility:visible}#rwl.rwl-active{height:32px;left:0;line-height:32px;opacity:.9;transform:translate(0)}#rwl label{cursor:move;font-size:12px;font-weight:500;margin:0;padding:0}#rwl #rwl-setbtn{background:#fff;border:none;border-radius:2px;color:#000;cursor:pointer;margin:0 4px 0 0;padding:0 0 0 4px}";

var css_248z$1 = "#rwl-reset,#rwl-setMenuClose,#rwl-setMenuSave{background:#fff;border:none;border-radius:2px;color:#000;cursor:pointer;margin:0;padding:0 2px}#rwl-reset{border:1px solid #666}#rwl-setMenuSave{border:1px solid green}#rwl-setMenuClose{border:1px solid red}#rwl-setMenu{border:1px solid #6495ed;font-size:14px;line-height:normal;text-align:left;z-index:999999}#rwl-setMenu p{margin:5px auto}#rwl-setMenu{background:#fff;border-radius:4px;left:50px;padding:10px;position:fixed;top:5px}#rwl-setMenu>textarea{font:unset}#rwl-setMenu>span{font-size:.7em}";

class UI {
  static async init() {
    // iframe  不用加载
    if (window.self !== window.top) return;
    await UI.initButtonElement();
    UI.registerButtonEvent();
    UI.initMenuElement();
    UI.registerDrag();
    UI.registerUiObserve();
    GM_registerMenuCommand('复制限制解除 设置', () => UI.toggleMenu());
  }
  static async initButtonElement() {
    // 等待 DOM 初始化
    await domContentLoaded();
    UI.checkBox = VM.hm("input", {
      type: "checkbox",
      id: "black_node",
      checked: App.inBlackList()
    });
    UI.setButton = VM.hm("button", {
      type: "button",
      id: "rwl-setbtn"
    }, ' ', "set", ' ');
    UI.button = VM.hm("div", {
      id: "rwl",
      className: "rwl-exempt"
    }, UI.setButton, VM.hm("label", null, "\u9650\u5236\u89E3\u9664 "), UI.checkBox);
    UI.button.style.top = `${UI.buttonHeight()}px`;
    UI.button.style.left = `${Setting$1.positionLeft}px`;
    UI.button.style.right = Setting$1.positionRight === 'auto' ? 'auto' : Setting$1.positionRight + 'px';
    document.body.appendChild(UI.button);
    GM_addStyle(Setting$1.addBtn ? css_248z$2 : css_248z$2 + '#rwl{display:none}');
  }
  static registerButtonEvent() {
    // 改变窗口大小的情况
    window.onresize = () => {
      UI.button.style.top = `${UI.buttonHeight()}px`;
    };
    UI.button.addEventListener('mouseover', () => {
      UI.button.classList.add('rwl-active');
    });
    UI.button.addEventListener('mouseleave', () => {
      setTimeout(() => {
        UI.button.classList.remove('rwl-active');
        UI.updateBlackList(UI.isChecked());
      }, 100);
    });

    // 给按钮绑定点击事件
    UI.setButton.addEventListener('click', () => UI.toggleMenu());
  }
  static isChecked() {
    return UI.checkBox.checked;
  }
  static buttonHeight() {
    // 再次打开窗口小于之前窗口的情况,导致按钮出现在可视窗口之外
    const clientHeight = document.documentElement.clientHeight;
    let buttonHeight = Setting$1.positionTop > clientHeight ? clientHeight - 40 : Setting$1.positionTop;
    return buttonHeight < 0 ? 0 : buttonHeight;
  }

  // 初始化菜单元素
  static initMenuElement() {
    let settingData;
    UI.menu = VM.hm("div", {
      id: "rwl-setMenu"
    }, VM.hm("p", null, "\u8DDD\u79BB\u9876\u90E8\u8DDD\u79BB\uFF08\u5355\u4F4D \u50CF\u7D20\uFF09", ' ', VM.hm("input", {
      id: "positiontop",
      type: "text",
      value: Setting$1.positionTop,
      onChange: function () {
        Setting$1.positionTop = parseInt(this.value);
      }
    })), VM.hm("laberl", null, ' ', VM.hm("p", null, "\u663E\u793A\u6309\u94AE", VM.hm("input", {
      id: "btnchecked",
      type: "checkbox",
      checked: Setting$1.addBtn,
      onChange: function () {
        Setting$1.addBtn = this.checked;
      }
    }), ' ', "\u70B9\u51FB\u811A\u672C\u7BA1\u7406\u6269\u5C55\u53EF\u4EE5\u518D\u6B21\u6253\u5F00\u8BBE\u7F6E")), VM.hm("p", null, "\u95EE\u9898\u53CD\u9988\u5730\u5740:", ' ', VM.hm("a", {
      target: "_blank",
      href: "https://github.com/qxinGitHub/Remove-web-limits-"
    }, "GitHub(qxin)"), ",", ' ', VM.hm("a", {
      target: "_blank",
      href: "https://greasyfork.org/zh-CN/scripts/28497-remove-web-limits-modified"
    }, "GreasyFork(qxin)"), ' '), VM.hm("p", null, "\u9879\u76EE\u539F\u4F5C\u8005\u4E3A", ' ', VM.hm("a", {
      target: "_blank",
      href: "https://cat7373.github.io/remove-web-limits/"
    }, "cat7373"), ",", ' ', VM.hm("a", {
      target: "_blank",
      href: "https://github.com/Cat7373/remove-web-limits"
    }, "\u9879\u76EE\u4E3B\u9875"), ' '), VM.hm("p", null, "\u80FD\u529B\u6709\u9650,\u4E0D\u80FD\u6BCF\u4E2A\u7F51\u7AD9\u90FD\u80FD\u5B8C\u7F8E"), VM.hm("p", null, "\u5982\u82E5\u53CD\u9988,\u52A1\u5FC5\u5E26\u4E0A\u8BE6\u7EC6\u7F51\u5740"), VM.hm("p", null, " "), VM.hm("p", null, "\u6570\u636E\u5B58\u50A8\u65B9\u5F0F\u4E3AJSON,\u5982\u82E5\u5728\u6B64\u4FEE\u6539,\u6CE8\u610F\u5F15\u53F7\u9017\u53F7"), VM.hm("textarea", {
      wrap: "off",
      cols: "45",
      rows: "20",
      style: "overflow:auto;border-radius:4px;",
      onChange: function () {
        settingData = this.value;
        Setting$1.blackList = JSON.parse(this.value);
      }
    }, JSON.stringify(Setting$1.blackList, false, 4)), VM.hm("br", null), VM.hm("button", {
      id: "rwl-reset",
      onclick: () => {
        Setting$1.reset();
        window.location.reload();
      }
    }, "\u6E05\u7A7A\u8BBE\u7F6E"), ' ', "\xA0\xA0\xA0", VM.hm("button", {
      id: "rwl-setMenuSave",
      onclick: () => {
        if (!settingData) {
          alert('内容为空');
          return;
        }
        try {
          JSON.parse(settingData);
        } catch (e) {
          alert('内容格式有误');
          return;
        }
        Setting$1.save();
        window.location.reload();
      }
    }, "\u4FDD\u5B58"), ' ', "\xA0\xA0\xA0", VM.hm("button", {
      id: "rwl-setMenuClose",
      onclick: () => {
        UI.toggleMenu();
        Setting$1.init();
      },
      title: "\u5982\u679C\u65E0\u6CD5\u5173\u95ED \u8BF7\u5237\u65B0\u754C\u9762"
    }, "\u5173\u95ED"), ' ', "\xA0\xA0\xA0", VM.hm("span", null, "--| qxin v4.4.6 2021-06-09 |--"));
    UI.menu.style.display = "none";
    document.body.appendChild(UI.menu);
    GM_addStyle(css_248z$1);
  }
  static toggleMenu() {
    UI.checkExist();
    UI.menu.style.display = UI.menu.style.display ? null : 'none';
  }
  static checkExist() {
    if (window.self !== window.top) return;
    if (!document.querySelector('#rwl')) {
      document.body.appendChild(UI.button);
    }
    if (!document.querySelector('#rwl-setMenu')) {
      document.body.appendChild(UI.menu);
    }
  }
  static registerUiObserve() {
    const checkExist = _.throttle(() => UI.checkExist(), 1000);
    const observer = new MutationObserver(mutations => checkExist());
    observer.observe(document, {
      childList: true,
      subtree: true
    });
  }

  // 注册拖动事件
  static registerDrag() {
    App.addEventListener.call(UI.button, 'mousedown', event => {
      UI.button.style.transition = 'null';
      var disX = event.clientX - UI.button.offsetLeft;
      var disY = event.clientY - UI.button.offsetTop;
      var move = event => {
        UI.button.style.left = event.clientX - disX + 'px';
        UI.button.style.top = event.clientY - disY + 'px';
      };
      App.addEventListener.call(document, 'mousemove', move);
      App.addEventListener.call(document, 'mouseup', function mouseUpHandler() {
        UI.button.style.transition = '0.3s';
        document.removeEventListener('mousemove', move);
        document.removeEventListener('mouseup', mouseUpHandler);
        UI.button.style.right = Setting$1.positionRight = 'auto';
        UI.button.style.left = Setting$1.positionLeft = 0;
        Setting$1.positionTop = UI.button.offsetTop;
        Setting$1.save();
      });
    });
  }
  static updateBlackList(checked) {
    if (checked && !App.inBlackList()) {
      UI.addBlackList();
    } else if (!checked && App.inBlackList()) {
      UI.removeBlackList();
    } else {
      return;
    }
    Setting$1.save();
    window.location.reload();
  }
  static addBlackList() {
    Setting$1.blackList.push(window.location.hostname);
  }
  static removeBlackList() {
    const host = window.location.hostname;
    const index = Setting$1.blackList.indexOf(host);
    Setting$1.blackList.splice(index, 1);
  }
}

var css_248z = ":not([class*=rwl-exempt]),html{-moz-user-select:text!important;user-select:text!important;-ms-user-select:text!important;-khtml-user-select:text!important}:not([class*=rwl-exempt]) ::-moz-selection{background:#3390ff!important;color:#fff}:not([class*=rwl-exempt]) ::selection{background:#3390ff!important;color:#fff}";

function _extends() {
  _extends = Object.assign ? Object.assign.bind() : function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends.apply(this, arguments);
}

var nullFn = function () {};
var C;
function toggleConsole(debug) {
  if (debug) {
    C = _extends({}, unsafeWindow.console);
  } else {
    C = {
      log: nullFn,
      debug: nullFn,
      error: nullFn,
      group: nullFn,
      groupCollapsed: nullFn,
      groupEnd: nullFn,
      time: nullFn,
      timeEnd: nullFn
    };
  }
}

/**
 * @typedef Site
 * @prop {string} siteName
 * @prop {string | RegExp} url
 * @prop {string[]} disableEvents
 * @prop {object} wrapperEvents
 */

/**@type {Site} */
const sites = [{
  siteName: '起点阅读',
  url: 'https://read.qidian.com/chapter/.*?/.*?/',
  disableEvents: ['copy', 'cut', 'contextmenu', 'error'],
  wrapperEvents: {
    $events: [],
    click(event) {
      const props = ['screenX', 'screenY', 'clientX', 'clientY', 'pageX', 'pageY'];
      props.forEach(p => setPropReadOnly(event, p, 0));
    }
  }
}];

/**
 * @typedef {import('./sites').Site} Site
 */

/**
 * 获取站点信息
 * @returns {Site}
 */
function getSiteInfo() {
  const {
    href
  } = location;
  return sites.find(({
    url
  }) => url && toRE(url).test(href));
}

// global CSS

/**@typedef {import('./rule').Site} Site */

try {
  console.clear = () => {};
} catch (e) {}
class App {
  /**@type {Site} */

  static init() {
    try {
      // https://github.com/Tampermonkey/tampermonkey/issues/1498
      if (!document.contentType.includes('html')) {
        return;
      }
    } catch (e) {}
    UI.init();
    C.log('脚本: 复制限制解除(改) --- 开始执行 --- ');
    App.siteInfo = getSiteInfo();
    if (App.siteInfo) {
      this.initEventDefender(App.siteInfo);
    } else {
      if (this.inBlackList()) {
        C.log(`${App.host} 在黑名单中，开始清理`);
        App.main();
      } else if (window.self !== window.top) {
        C.log(`[iframe] ${App.host} 不在黑名单中，如有需要请手动添加`);
      } else {
        C.log(`${App.host} 不在黑名单中`);
      }
    }
  }
  static inBlackList() {
    return Setting$1.blackList.some(e => e === App.host);
  }
  static async initEventDefender(siteInfo) {
    // 自定义规则模式
    C.log('自定义规则模式');
    const {
      disableEvents,
      wrapperEvents
    } = siteInfo;
    App.hookEventListener(disableEvents, wrapperEvents);
    App.hookGlobalEvent2(disableEvents, wrapperEvents);
    App.hookDefaultEvent(wrapperEvents);
    await domContentLoaded();
    App.addRemoveLimitsCss();
    await domMutation();
    App.registerElementObserve(disableEvents, wrapperEvents);
    App.hookGlobalEvent(disableEvents, wrapperEvents);
    C.log(`${App.host} 清理完成`);
  }
  static async main() {
    // 自动模式
    // 禁止的事件
    const disableEvents = ['copy', 'cut', 'beforeunload', 'contextmenu', 'afterprint', 'beforeprint', 'error', 'mousemove', 'paste', 'mouseout'];
    // 忽略阻止默认行为的事件
    const wrapperEvents = {
      $events: ['select', 'selectstart', 'dragstart', 'mousedown', 'mouseup', 'keydown', 'keyup', 'keypress']
    };
    App.hookEventListener(disableEvents, wrapperEvents);
    App.hookGlobalEvent2(disableEvents, wrapperEvents);
    App.hookDefaultEvent(wrapperEvents);
    await domContentLoaded();
    App.addRemoveLimitsCss();
    await domMutation();
    App.registerElementObserve(disableEvents, wrapperEvents);
    App.hookGlobalEvent(disableEvents, wrapperEvents);
    C.log(`${App.host} 清理完成`);
  }
  static hookDefaultEvent(wrapperEvents) {
    const {
      $events
    } = wrapperEvents;
    if (!$events) return;
    Event.prototype.preventDefault = new Proxy(Event.prototype.preventDefault, {
      apply(target, thisArg, argumentsList) {
        if ($events.includes(thisArg.type)) return;
        Reflect.apply(target, thisArg, argumentsList);
      }
    });
    Object.defineProperty(Event.prototype, 'returnValue', {
      set(value) {
        if ($events.includes(this.type)) return;
        App.returnValueSetter.call(this, value);
      }
    });
  }
  static addRemoveLimitsCss() {
    document.head.appendChild(VM.hm("style", null, css_248z));
  }

  // 全局事件清理
  // 全局事件参考 https://developer.mozilla.org/zh-CN/docs/Web/API/GlobalEventHandlers
  static hookGlobalEvent(disableEvents, wrapperEvents) {
    const allElements = [...document.getElementsByTagName('*')];
    allElements.push(document, document.body, window);
    allElements.forEach(element => {
      App.disableGlobalEvent(element, disableEvents);
      App.warpperGlobalEvent(element, wrapperEvents);
    });
  }
  static hookEventListener(disableEvents, wrapperEvents) {
    const addEventListenerProxy = new Proxy(EventTarget.prototype.addEventListener, {
      apply(target, thisArg, argumentsList) {
        const [type, listener, options] = argumentsList;
        const {
          $events
        } = wrapperEvents;
        const events = Object.keys(wrapperEvents).filter(k => k !== '$events');
        if (disableEvents.includes(type)) return;
        if ($events.includes(type)) {
          target.call(thisArg, type, App.eventWrapperFunc(listener), options);
        } else if (events.includes(type)) {
          const listenerProxy = new Proxy(listener, {
            apply(target, thisArg, argumentsList) {
              const [event] = argumentsList;
              const ret1 = wrapperEvents[type](event);
              const ret2 = Reflect.apply(target, thisArg, argumentsList);
              return ret1 != null ? ret1 : ret2;
            }
          });
          target.call(thisArg, type, listenerProxy, options);
        } else {
          Reflect.apply(target, thisArg, argumentsList);
        }
      }
    });
    const removeEventListenerProxy = new Proxy(EventTarget.prototype.removeEventListener, {
      apply(target, thisArg, argumentsList) {
        const [type, listener, options] = argumentsList;
        if (listener && listener.hasOwnProperty('wrapperFunc')) {
          target.call(thisArg, type, listener.wrapperFunc, options);
        } else {
          Reflect.apply(target, thisArg, argumentsList);
        }
      }
    });
    EventTarget.prototype.addEventListener = addEventListenerProxy;
    document.addEventListener = addEventListenerProxy;
    EventTarget.prototype.removeEventListener = removeEventListenerProxy;
    document.removeEventListener = removeEventListenerProxy;
  }
  static registerElementObserve(disableEvents, wrapperEvents) {
    const {
      $events
    } = wrapperEvents;
    const events = Object.keys(wrapperEvents).filter(k => k !== '$events');
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutationRecord => {
        const {
          addedNodes,
          attributeName,
          target,
          type
        } = mutationRecord;
        switch (type) {
          case 'childList':
            // addedNodes.forEach(element => {
            //   App.disableGlobalEvent(element, disableEvents)
            //   App.warpperGlobalEvent(element, wrapperEvents)
            // })
            break;
          case 'attributes':
            const eventName = attributeName.slice(2);
            if (disableEvents.includes(eventName)) {
              target[attributeName] = null;
              break;
            }
            if ($events.includes(eventName)) {
              target[attributeName] = target[attributeName];
            } else if (events.includes(eventName)) {
              const listener = target[attributeName];
              const listenerProxy = new Proxy(listener, {
                apply(target, thisArg, argumentsList) {
                  const [event] = argumentsList;
                  const ret1 = wrapperEvents[eventName](event);
                  const ret2 = Reflect.apply(target, thisArg, argumentsList);
                  return ret1 != null ? ret1 : ret2;
                }
              });
              target[attributeName] = listenerProxy;
            }
            break;
        }
      });
    });
    observer.observe(document, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: disableEvents.concat(wrapperEvents).map(event => 'on' + event)
    });
  }

  // 事件包装函数
  static eventWrapperFunc(func) {
    function wrapper(event) {
      func.call(this, event);
      return true;
    }
    func.wrapperFunc = wrapper;
    return wrapper;
  }
  static disableGlobalEvent(element, eventList) {
    eventList.forEach(event => {
      if ('removeAttribute' in element && element['on' + event]) {
        element.removeAttribute('on' + event);
      } else if (element['on' + event]) {
        element['on' + event] = null;
      }
    });
  }
  static warpperGlobalEvent(element, wrapperEvents) {
    const {
      $events
    } = wrapperEvents;
    $events.forEach(event => {
      if ('on' + event in element && element['on' + event] !== App.eventWrapperFunc) {
        element['on' + event] = element['on' + event];
      } else if (element['on' + event]) {
        element['on' + event] = null;
      }
    });
  }

  // https://developer.chrome.com/blog/DOM-attributes-now-on-the-prototype-chain/
  // https://developer.mozilla.org/zh-CN/docs/Web/API/GlobalEventHandlers
  static hookGlobalEvent2(disableEvents, wrapperEvents) {
    App.disableGlobalEvent2(disableEvents);
    App.wrapperGlobalEvent2(wrapperEvents);
  }
  static disableGlobalEvent2(eventList) {
    const hookTargets = {
      window: unsafeWindow,
      Document: Document.prototype,
      HTMLElement: HTMLElement.prototype
    };
    for (const [name, target] of Object.entries(hookTargets)) {
      eventList.forEach(event => {
        try {
          const setter = Object.getOwnPropertyDescriptor(target, 'on' + event).set;
          Object.defineProperty(target, 'on' + event, {
            set() {
              setter.call(this, null);
            }
          });
        } catch (e) {
          // C.log(`${name} 没有 ${event} 事件`, e);
        }
      });
    }
  }
  static wrapperGlobalEvent2(wrapperEvents) {
    const hookTargets = {
      window: unsafeWindow,
      Document: Document.prototype,
      HTMLElement: HTMLElement.prototype
    };
    const {
      $events
    } = wrapperEvents;
    const events = Object.keys(wrapperEvents).filter(k => k !== '$events');
    for (const [name, target] of Object.entries(hookTargets)) {
      $events.forEach(event => {
        try {
          const setter = Object.getOwnPropertyDescriptor(target, 'on' + event).set;
          Object.defineProperty(target, 'on' + event, {
            set(func) {
              if (!func) return;
              setter.call(this, App.eventWrapperFunc(func));
            }
          });
        } catch (e) {
          // C.log(`${name} 没有 ${event} 事件`, e);
        }
      });
    }
    for (const [name, target] of Object.entries(hookTargets)) {
      events.forEach(eventName => {
        try {
          const setter = Object.getOwnPropertyDescriptor(target, 'on' + eventName).set;
          Object.defineProperty(target, 'on' + eventName, {
            set(func) {
              if (!func) return;
              const funcProxy = new Proxy(func, {
                apply(target, thisArg, argumentsList) {
                  const [event] = argumentsList;
                  const ret1 = wrapperEvents[eventName](event);
                  const ret2 = Reflect.apply(target, thisArg, argumentsList);
                  return ret1 != null ? ret1 : ret2;
                }
              });
              setter.call(this, funcProxy);
            }
          });
        } catch (e) {
          // C.log(`${name} 没有 ${event} 事件`, e);
        }
      });
    }
  }
}
App.host = window.location.hostname;
App.addEventListener = EventTarget.prototype.addEventListener;
App.removeEventListener = EventTarget.prototype.removeEventListener;
App.preventDefault = Event.prototype.preventDefault;
App.returnValueSetter = Object.getOwnPropertyDescriptor(Event.prototype, 'returnValue').set;
App.siteInfo = void 0;

// import { getGreetings } from './app';
toggleConsole(true);
App.init();

})();
