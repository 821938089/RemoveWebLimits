// 等待 DOMContentLoaded 事件触发
export function domContentLoaded() {
  if (document.readyState === 'loading') {
    return new Promise(resolve => {
      function handler() {
        window.removeEventListener('DOMContentLoaded', handler)
        resolve()
      }
      window.addEventListener('DOMContentLoaded', handler)
    })
  }
}

export function domMutation() {
  return new Promise(resolve => {
    const fn = _.debounce(() => {
      observer.disconnect()
      resolve()
    }, 500)
    const observer = new MutationObserver(fn)
    observer.observe(document, {
      childList: true,
      subtree: true,
    })
    fn()
  })
}

export function getPropertyDescriptor(o, prop) {
  // 替代方法 Object.getPrototypeOf()
  let obj = o
  while (!obj.hasOwnProperty(prop)) {
    if (obj.__proto__) {
      obj = obj.__proto__
    } else {
      break
    }
  }
  return Object.getOwnPropertyDescriptor(obj, prop)
}

const _regexCache = {}

/**
 * 将字符串编译为正则
 * @param {RegExp | string} obj
 * @param {string} flag
 * @returns {RegExp}
 */
export function toRE(obj, flag = 'igm') {
  if (obj instanceof RegExp) {
    return obj
  } else if (_regexCache[obj] && _regexCache[obj][flag]) {
    const re = _regexCache[obj][flag]
    re.lastIndex = 0
    return re
  } else if (!_regexCache[obj]) {
    const re = new RegExp(obj, flag)
    _regexCache[obj] = { [flag]: re }
    return re
  } else if (!_regexCache[obj][flag]) {
    const re = new RegExp(obj, flag)
    _regexCache[obj][flag] = re
    return re
  }
}

export function setPropReadOnly(obj, prop, target) {
  const value = target ?? obj[prop]
  Object.defineProperty(obj, prop, {
    get() {
      return value
    },
    set() {},
    configurable: true
  })
}

export function setProp(obj, prop, target) {
  let value = target ?? obj[prop]
  Object.defineProperty(obj, prop, {
    get() {
      return value
    },
    set(newValue) {
      value = newValue
    },
    
  })
}

export function sleep(timeout) {
  return new Promise(resolve => setTimeout(resolve, timeout))
}