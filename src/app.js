// global CSS
// import globalCss from './style.css';
// CSS modules
// import styles, { stylesheet } from './style.module.css';

// export function getGreetings() {
//   return (
//     <>
//       <div className={styles.panel}>hello</div>
//       <style>{globalCss}</style>
//       <style>{stylesheet}</style>
//     </>
//   );
// }

import Setting from './setting'
import UI from './UI'
import { domContentLoaded, domMutation } from './lib'
import removeLimitsStyle from './removeLimits.css'
import { C } from './log'
import { getSiteInfo } from './rule'

/**@typedef {import('./rule').Site} Site */

console.clear = () => {}

class App {
  static host = window.location.hostname
  static addEventListener = EventTarget.prototype.addEventListener
  static removeEventListener = EventTarget.prototype.removeEventListener
  static preventDefault = Event.prototype.preventDefault
  static returnValueSetter = Object.getOwnPropertyDescriptor(
    Event.prototype,
    'returnValue'
  ).set
  /**@type {Site} */
  static siteInfo

  static init() {
    UI.init()
    C.log('脚本: 复制限制解除(改) --- 开始执行 --- ')
    App.siteInfo = getSiteInfo()
    if (App.siteInfo) {
      this.initEventDefender(App.siteInfo)
    } else {
      if (this.inBlackList()) {
        C.log(`${App.host} 在黑名单中，开始清理`)
        App.main()
      } else if (window.self !== window.top) {
        C.log(`[iframe] ${App.host} 不在黑名单中，如有需要请手动添加`)
      } else {
        C.log(`${App.host} 不在黑名单中`)
      }
    }
  }

  static inBlackList() {
    return Setting.blackList.some(e => e === App.host)
  }

  static async initEventDefender(siteInfo) {
    // 自定义规则模式
    C.log('自定义规则模式')
    const { disableEvents, wrapperEvents } = siteInfo
    App.hookEventListener(disableEvents, wrapperEvents)
    App.hookGlobalEvent2(disableEvents, wrapperEvents)
    App.hookDefaultEvent(wrapperEvents)
    await domContentLoaded()
    App.addRemoveLimitsCss()
    await domMutation()
    App.registerElementObserve(disableEvents, wrapperEvents)
    App.hookGlobalEvent(disableEvents, wrapperEvents)
  }

  static async main() {
    // 自动模式
    // 禁止的事件
    const disableEvents = [
      'copy',
      'cut',
      'beforeunload',
      'contextmenu',
      'afterprint',
      'beforeprint',
      'error',
      'mousemove',
      'paste',
      'mouseout',
    ]
    // 忽略阻止默认行为的事件
    const wrapperEvents = {
      $events: [
        'select',
        'selectstart',
        'dragstart',
        'mousedown',
        'mouseup',
        'keydown',
        'keyup',
        'keypress',
      ],
    }
    App.hookEventListener(disableEvents, wrapperEvents)
    App.hookGlobalEvent2(disableEvents, wrapperEvents)
    App.hookDefaultEvent(wrapperEvents)
    await domContentLoaded()
    App.addRemoveLimitsCss()
    await domMutation()
    App.registerElementObserve(disableEvents, wrapperEvents)
    App.hookGlobalEvent(disableEvents, wrapperEvents)
  }

  static hookDefaultEvent(wrapperEvents) {
    const { $events } = wrapperEvents
    if (!$events) return
    Event.prototype.preventDefault = new Proxy(Event.prototype.preventDefault, {
      apply(target, thisArg, argumentsList) {
        if ($events.includes(thisArg.type)) return
        Reflect.apply(target, thisArg, argumentsList)
      },
    })
    Object.defineProperty(Event.prototype, 'returnValue', {
      set(value) {
        if ($events.includes(this.type)) return
        App.returnValueSetter.call(this, value)
      },
    })
  }

  static addRemoveLimitsCss() {
    document.head.appendChild(<style>{removeLimitsStyle}</style>)
  }

  // 全局事件清理
  // 全局事件参考 https://developer.mozilla.org/zh-CN/docs/Web/API/GlobalEventHandlers
  static hookGlobalEvent(disableEvents, wrapperEvents) {
    const allElements = [...document.getElementsByTagName('*')]

    allElements.push(document, document.body, window)
    allElements.forEach(element => {
      App.disableGlobalEvent(element, disableEvents)
      App.warpperGlobalEvent(element, wrapperEvents)
    })
  }

  static hookEventListener(disableEvents, wrapperEvents) {
    const addEventListenerProxy = new Proxy(
      EventTarget.prototype.addEventListener,
      {
        apply(target, thisArg, argumentsList) {
          const [type, listener, options] = argumentsList
          const { $events } = wrapperEvents
          const events = Object.keys(wrapperEvents).filter(k => k !== '$events')
          if (disableEvents.includes(type)) return
          if ($events.includes(type)) {
            target.call(thisArg, type, App.eventWrapperFunc(listener), options)
          } else if (events.includes(type)) {
            const listenerProxy = new Proxy(listener, {
              apply(target, thisArg, argumentsList) {
                const [event] = argumentsList
                const ret1 = wrapperEvents[type](event)
                const ret2 = Reflect.apply(target, thisArg, argumentsList)
                return ret1 ?? ret2
              },
            })
            target.call(thisArg, type, listenerProxy, options)
          } else {
            Reflect.apply(target, thisArg, argumentsList)
          }
        },
      }
    )
    const removeEventListenerProxy = new Proxy(
      EventTarget.prototype.removeEventListener,
      {
        apply(target, thisArg, argumentsList) {
          const [type, listener, options] = argumentsList
          if (listener && listener.hasOwnProperty('wrapperFunc')) {
            target.call(thisArg, type, listener.wrapperFunc, options)
          } else {
            Reflect.apply(target, thisArg, argumentsList)
          }
        },
      }
    )
    EventTarget.prototype.addEventListener = addEventListenerProxy
    document.addEventListener = addEventListenerProxy
    EventTarget.prototype.removeEventListener = removeEventListenerProxy
    document.removeEventListener = removeEventListenerProxy
  }

  static registerElementObserve(disableEvents, wrapperEvents) {
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutationRecord => {
        const { addedNodes, attributeName, target, type } = mutationRecord

        switch (type) {
          case 'childList':
            // addedNodes.forEach(element => {
            //   App.disableGlobalEvent(element, disableEvents)
            //   App.warpperGlobalEvent(element, wrapperEvents)
            // })
            break
          case 'attributes':
            if (disableEvents.includes(attributeName.slice(2))) {
              target[attributeName] = null
            }
            if (wrapperEvents.includes(attributeName.slice(2))) {
              target[attributeName] = target[attributeName]
            }
            break
          default:
            break
        }
      })
    })
    observer.observe(document, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: disableEvents
        .concat(wrapperEvents)
        .map(event => 'on' + event),
    })
  }

  // 事件包装函数
  static eventWrapperFunc(func) {
    function wrapper(event) {
      func.call(this, event)

      return true
    }
    func.wrapperFunc = wrapper
    return wrapper
  }

  static disableGlobalEvent(element, eventList) {
    eventList.forEach(event => {
      if ('removeAttribute' in element && element['on' + event]) {
        element.removeAttribute('on' + event)
      }
    })
  }

  static warpperGlobalEvent(element, wrapperEvents) {
    const { $events } = wrapperEvents
    $events.forEach(event => {
      if (
        'on' + event in element &&
        element['on' + event] !== App.eventWrapperFunc
      ) {
        element['on' + event] = element['on' + event]
      }
    })
  }

  // https://developer.chrome.com/blog/DOM-attributes-now-on-the-prototype-chain/
  // https://developer.mozilla.org/zh-CN/docs/Web/API/GlobalEventHandlers
  static hookGlobalEvent2(disableEvents, wrapperEvents) {
    App.disableGlobalEvent2(disableEvents)
    App.wrapperGlobalEvent2(wrapperEvents)
  }

  static disableGlobalEvent2(eventList) {
    const hookTargets = {
      window: unsafeWindow,
      Document: Document.prototype,
      HTMLElement: HTMLElement.prototype,
    }
    for (const [name, target] of Object.entries(hookTargets)) {
      eventList.forEach(event => {
        try {
          const setter = Object.getOwnPropertyDescriptor(
            target,
            'on' + event
          ).set
          Object.defineProperty(target, 'on' + event, {
            set() {
              setter.call(this, null)
            },
          })
        } catch (e) {
          // C.log(`${name} 没有 ${event} 事件`, e);
        }
      })
    }
  }

  static wrapperGlobalEvent2(wrapperEvents) {
    const hookTargets = {
      window: unsafeWindow,
      Document: Document.prototype,
      HTMLElement: HTMLElement.prototype,
    }
    const { $events } = wrapperEvents
    const events = Object.keys(wrapperEvents).filter(k => k !== '$events')

    for (const [name, target] of Object.entries(hookTargets)) {
      $events.forEach(event => {
        try {
          const setter = Object.getOwnPropertyDescriptor(
            target,
            'on' + event
          ).set
          Object.defineProperty(target, 'on' + event, {
            set(func) {
              if (!func) return
              setter.call(this, App.eventWrapperFunc(func))
            },
          })
        } catch (e) {
          // C.log(`${name} 没有 ${event} 事件`, e);
        }
      })
    }
    for (const [name, target] of Object.entries(hookTargets)) {
      events.forEach(eventName => {
        try {
          const setter = Object.getOwnPropertyDescriptor(
            target,
            'on' + eventName
          ).set
          Object.defineProperty(target, 'on' + eventName, {
            set(func) {
              if (!func) return
              const funcProxy = new Proxy(func, {
                apply(target, thisArg, argumentsList) {
                  const [event] = argumentsList
                  const ret1 = wrapperEvents[eventName](event)
                  const ret2 = Reflect.apply(target, thisArg, argumentsList)
                  return ret1 ?? ret2
                },
              })
              setter.call(this, funcProxy)
            },
          })
        } catch (e) {
          // C.log(`${name} 没有 ${event} 事件`, e);
        }
      })
    }
  }
}

export default App
