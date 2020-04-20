import {
    getCurrentTime as now,
    getCurrentPriorityLevel,
    ImmediatePriority,
    UserBlockingPriority,
    NormalPriority,
    LowPriority,
    IdlePriority,
    unstable_cancelCallback as cancelPassiveEffects
} from "./Scheduler.js";
import {
    msToExpirationTime,
    Sync,
    NoWork,
    Never,
    computeInteractiveExpiration,
    computeAsyncExpiration
} from './ReactFiberExpirationTime.js'
import {markPendingPriorityLevel} from './ReactFiberPendingPriority.js'

import {ConcurrentMode, NoContext} from "./constants/ReactTypeOfMode.js";

let isWorking = false;

let nextRoot = null;
let nextRenderExpirationTime = NoWork;

let isCommitting = false;
let passiveEffectCallbackHandle = null;
let passiveEffectCallback = null;

let interruptedBy = null;

let firstScheduledRoot = null;
let lastScheduledRoot = null;

let nextFlushedRoot = null;
let nextFlushedExpirationTime = NoWork;
let lowestPriorityPendingInteractiveExpirationTime = NoWork;

let isBatchingUpdates = false;
let isUnbatchingUpdates = false;
let isRendering = false;

let originalStartTimeMs = now();
let currentRendererTime = msToExpirationTime(originalStartTimeMs);
let currentSchedulerTime = currentRendererTime;

const NESTED_UPDATE_LIMIT = 50;
let nestedUpdateCount = 0;

function findHighestPriorityRoot() {
    let highestPriorityWork = NoWork;
    let highestPriorityRoot = null;

    if (lastScheduledRoot !== null) {
        let previousScheduledRoot = lastScheduledRoot;
        let root = firstScheduledRoot;

        while (root !== null) {
            const remainingExpirationTime = root.expirationTime;
            if (remainingExpirationTime === NoWork) {

                if (root === root.nextScheduledRoot) {
                    root.nextScheduledRoot = null;
                    firstScheduledRoot = lastScheduledRoot = null;
                    break;
                } else if (root === firstScheduledRoot) {
                    const next = root.nextScheduledRoot;
                    firstScheduledRoot = next;
                    lastScheduledRoot.nextScheduledRoot = next;
                    root.nextScheduledRoot = null;
                } else if (root === lastScheduledRoot) {
                    lastScheduledRoot = previousScheduledRoot;
                    lastScheduledRoot.nextScheduledRoot = firstScheduledRoot;
                    root.nextScheduledRoot = null;
                    break;
                } else {
                    previousScheduledRoot.nextScheduledRoot = root.nextScheduledRoot;
                    root.nextScheduledRoot = null;
                }
                root = previousScheduledRoot.nextScheduledRoot;
            } else {
                if (remainingExpirationTime > highestPriorityWork) {
                    highestPriorityWork = remainingExpirationTime;
                    highestPriorityRoot = root;
                }
                if (root === lastScheduledRoot) break;
                if (highestPriorityWork === Sync) break;
                previousScheduledRoot = root;
                root = root.nextScheduledRoot;
            }
        }
    }

    nextFlushedRoot = highestPriorityRoot;
    nextFlushedExpirationTime = highestPriorityWork;
}

function recomputeCurrentRendererTime() {
    const currentTimeMs = now() - originalStartTimeMs;
    currentRendererTime = msToExpirationTime(currentTimeMs);
}

function scheduleWorkToRoot(fiber, expiration) {
    // TODO
}

function resetStack() {
    // TODO
}

function requestWork(root, expirationTime) {
    // TODO
}

export function unbatchedUpdates(fn, a) {
    if (isBatchingUpdates && !isUnbatchingUpdates) {
        isUnbatchingUpdates = true;

        try {
            return fn(a)
        } finally {
            isUnbatchingUpdates = false;
        }
    }

    return fn(a)
}

export function requestCurrentTime() {
    if (isRendering) {
        return currentSchedulerTime;
    }

    findHighestPriorityRoot();

    if (nextFlushedExpirationTime === NoWork ||
        nextFlushedExpirationTime === Never) {

        recomputeCurrentRendererTime();
        currentSchedulerTime = currentRendererTime;
        return currentSchedulerTime;
    }

    return currentSchedulerTime;
}

export function computeExpirationForFiber(currentTime, fiber) {
    const priorityLevel = getCurrentPriorityLevel();

    let expirationTime;
    if ((fiber.mode & ConcurrentMode) === NoContext) {
        expirationTime = Sync;
    } else if (isWorking && !isCommitting) {
        expirationTime = nextRenderExpirationTime;
    } else {
        switch (priorityLevel) {
            case ImmediatePriority:
                expirationTime = Sync;
                break;
            case UserBlockingPriority:
                expirationTime = computeInteractiveExpiration(currentTime);
                break;
            case NormalPriority:
                // This is a normal, concurrent update
                expirationTime = computeAsyncExpiration(currentTime);
                break;
            case LowPriority:
            case IdlePriority:
                expirationTime = Never;
                break;
            default:
                throw new Error('Unknown priority level. This error is likely caused by a bug in React. Please file an issue.')
        }

        if (nextRoot !== null && expirationTime === nextRenderExpirationTime) {
            expirationTime -= 1;
        }
    }

    if (
        priorityLevel === UserBlockingPriority &&
        (lowestPriorityPendingInteractiveExpirationTime === NoWork ||
            expirationTime < lowestPriorityPendingInteractiveExpirationTime)
    ) {
        lowestPriorityPendingInteractiveExpirationTime = expirationTime;
    }

    return expirationTime;
}

export function flushPassiveEffects() {
    if (passiveEffectCallbackHandle !== null) cancelPassiveEffects(passiveEffectCallbackHandle)
    if (passiveEffectCallback !== null) passiveEffectCallback()
}

export function scheduleWork(fiber, expirationTime) {
    const root = scheduleWorkToRoot(fiber, expirationTime);
    if (root === null) return;

    if (!isWorking && nextRenderExpirationTime !== NoWork && expirationTime > nextRenderExpirationTime) {
        interruptedBy = fiber;
        resetStack();
    }

    markPendingPriorityLevel(root, expirationTime);

    if (
        !isWorking ||
        isCommitting ||
        nextRoot !== root
    ) {
        const rootExpirationTime = root.expirationTime;
        requestWork(root, rootExpirationTime);
    }

    if (nestedUpdateCount > NESTED_UPDATE_LIMIT) {
        nestedUpdateCount = 0;
    }
}
