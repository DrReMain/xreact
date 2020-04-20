export const UpdateState = 0;
export const ReplaceState = 1;
export const ForceUpdate = 2;
export const CaptureUpdate = 3;

export function createUpdate(expirationTime) {
    return {
        expirationTime,

        tag: UpdateState,
        payload: null,
        callback: null,

        next: null,
        nextEffect: null
    }
}

export function enqueueUpdate(fiber, update) {
    const alternate = fiber.alternate;
    let queue1, queue2;

    if (alternate === null) {
        queue1 = fiber.updateQueue;
        queue2 = null;
        if (queue1 === null) {
            queue1 = fiber.updateQueue = createUpdateQueue(fiber.memoizedState)
        }
    } else {
        queue1 = fiber.updateQueue;
        queue2 = alternate.updateQueue;
        if (queue1 === null) {
            if (queue2 === null) {
                queue1 = fiber.updateQueue = createUpdateQueue(fiber.memoizedState);
                queue2 = alternate.updateQueue = createUpdateQueue(alternate.memoizedState)
            } else {
                queue1 = fiber.updateQueue = cloneUpdateQueue(queue2)
            }
        } else {
            if (queue2 === null) {
                queue2 = alternate.updateQueue = cloneUpdateQueue(queue1)
            } else {
            }
        }
    }

    if (queue2 === null || queue1 === queue2) {
        appendUpdateToQueue(queue1, update);
    } else {
        if (queue1.lastUpdate === null || queue2.lastUpdate === null) {
            appendUpdateToQueue(queue1, update)
            appendUpdateToQueue(queue2, update)
        } else {
            appendUpdateToQueue(queue1, update)
            queue2.lastUpdate = update
        }
    }


}

export function createUpdateQueue(baseState) {
    return {
        baseState,
        firstUpdate: null,
        lastUpdate: null,

        firstCapturedUpdate: null,
        lastCapturedUpdate: null,

        firstEffect: null,
        lastEffect: null,

        firstCapturedEffect: null,
        lastCapturedEffect: null,
    }
}

function cloneUpdateQueue(currentQueue) {
    return {
        baseState: currentQueue.baseState,
        firstUpdate: currentQueue.firstUpdate,
        lastUpdate: currentQueue.lastUpdate,

        firstCapturedUpdate: null,
        lastCapturedUpdate: null,

        firstEffect: null,
        lastEffect: null,

        firstCapturedEffect: null,
        lastCapturedEffect: null,
    }
}

function appendUpdateToQueue(queue, update) {
    if (queue.lastUpdate === null) {
        queue.firstUpdate = queue.lastUpdate = update
    } else {
        queue.lastUpdate.next = update;
        queue.lastUpdate = update;
    }
}
