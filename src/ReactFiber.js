import FiberNode from './classes/FiberNode.js'
import { NoContext, ConcurrentMode, StrictMode, ProfileMode } from './constants/ReactTypeOfMode.js'
import { HostRoot } from './constants/ReactWorkTags.js'

import { isDevToolsPresent } from './utils/ReactFiberDevToolsHook.js'

const createFiber = function (
    tag,
    pendingProps,
    key,
    mode
) {
    return new FiberNode(tag, pendingProps, key, mode)
}

export function createHostRootFiber(isConcurrent) {
    let mode = isConcurrent ? ConcurrentMode | StrictMode : NoContext;

    if (window.__PROFILE__ && isDevToolsPresent) {
        mode |= ProfileMode;
    }

    return createFiber(HostRoot, null, null, mode);
}
