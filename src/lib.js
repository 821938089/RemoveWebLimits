// 等待 DOMContentLoaded 事件触发
export function DOMContentLoaded() {
    if (document.readyState === 'loading') {
        return new Promise((resolve) => {
            function handler() {
                window.removeEventListener('DOMContentLoaded', handler);
                resolve();
            }
            window.addEventListener('DOMContentLoaded', handler);
        });
    }
}

export function DomMutation() {
    return new Promise((resolve) => {
        const debounced = _.debounce(() => {
            observer.disconnect();
            resolve();
        }, 500);
        const observer = new MutationObserver(debounced);
        observer.observe(document, {
            childList: true,
            subtree: true,
        });
        debounced();
    });
}

export function getPropertyDescriptor(o, prop) {
    // 替代方法 Object.getPrototypeOf()
    let obj = o;
    while (!obj.hasOwnProperty(prop)) {
        if (obj.__proto__) {
            obj = obj.__proto__;
        } else {
            break;
        }
    }
    return Object.getOwnPropertyDescriptor(obj, prop);
}