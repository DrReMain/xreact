import { NoWork } from './ReactFiberExpirationTime.js'
import { noTimeout } from './constants/ReactDOMHostConfig.js'

import { createHostRootFiber } from './ReactFiber.js'

import { unstable_getThreadID } from './utils/Tracing.js'

export function createFiberRoot(container, isConcurrent, hydrate) {
    const uninitializedFiber = createHostRootFiber(isConcurrent);

    const root = {
        current: uninitializedFiber,
        containerInfo: container,
        pendingChildren: null,

        pingCache: null,

        earliestPendingTime: NoWork,
        latestPendingTime: NoWork,
        earliestSuspendedTime: NoWork,
        latestSuspendedTime: NoWork,
        latestPingedTime: NoWork,

        didError: false,

        pendingCommitExpirationTime: NoWork,
        finishedWork: null,
        timeoutHandle: noTimeout,
        context: null,
        pendingContext: null,
        hydrate,
        nextExpirationTimeToWorkOn: NoWork,
        expirationTime: NoWork,
        firstBatch: null,
        nextScheduledRoot: null,
    }

    if (window.__PROFILE__) {
        root.interactionThreadID = unstable_getThreadID();
        root.memoizedInteractions = new Set();
        root.pendingInteractionMap = new Map();
    }

    uninitializedFiber.stateNode = root;

    return root;
}
