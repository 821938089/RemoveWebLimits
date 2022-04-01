var nullFn = function() {};

export var C;

export function toggleConsole(debug) {
    if (debug) {
        C = {...unsafeWindow.console};
    } else {
        C = {
            log: nullFn,
            debug: nullFn,
            error: nullFn,
            group: nullFn,
            groupCollapsed: nullFn,
            groupEnd: nullFn,
            time: nullFn,
            timeEnd: nullFn,
        };
    }
}