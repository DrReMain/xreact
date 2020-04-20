export const ImmediatePriority = 1;
export const UserBlockingPriority = 2;
export const NormalPriority = 3;
export const LowPriority = 4;
export const IdlePriority = 5;

let firstCallbackNode = null;

const currentPriorityLevel = NormalPriority;

export function getCurrentPriorityLevel() {
    return currentPriorityLevel;
}

export function unstable_cancelCallback(callbackNode) {
    const next = callbackNode.next;
    if (next === null) return

    if (next === callbackNode) {
        firstCallbackNode = null;
    } else {
        if (callbackNode === firstCallbackNode) {
            firstCallbackNode = next;
        }
        const previous = callbackNode.previous;
        previous.next = next;
        next.previous = previous;
    }

    callbackNode.next = callbackNode.previous = null;
}

const hasNativePerformanceNow =
    typeof performance === 'object' && typeof performance.now === 'function';

export let getCurrentTime;

if (hasNativePerformanceNow) {
    getCurrentTime = function () {
        return performance.now()
    }
} else {
    getCurrentTime = function () {
        return Date.now()
    }
}
