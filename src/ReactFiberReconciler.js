import {createFiberRoot} from './ReactFiberRoot.js'
import {
    requestCurrentTime,
    computeExpirationForFiber,
    flushPassiveEffects,
    scheduleWork
} from './ReactFiberScheduler.js'
import {
    emptyContextObject,
    isContextProvider,
    findCurrentUnmaskedContext,
    processChildContext
} from './ReactFiberContext.js'
import {createUpdate, enqueueUpdate} from './ReactUpdateQueue.js'
import {getPublicInstance} from './constants/ReactDOMHostConfig.js'
import {ClassComponent, HostComponent} from './constants/ReactWorkTags.js'

import ReactFiberInstrumentation from './utils/ReactFiberInstrumentation.js'

function getContextForSubtree(parentComponent) {
    if (!parentComponent) return emptyContextObject;

    const fiber = parentComponent._reactInternalFiber;

    const parentContext = findCurrentUnmaskedContext(fiber);

    if (fiber.tag === ClassComponent) {
        const Component = fiber.type;
        if (isContextProvider(Component)) {
            return processChildContext(fiber, Component, parentContext)
        }
    }

    return parentComponent;
}

function scheduleRootUpdate(current, element, expirationTime, callback) {
    const update = createUpdate(expirationTime);
    update.payload = {element}

    callback = callback === undefined ? null : callback;
    if (callback !== null) {
        update.callback = callback;
    }

    flushPassiveEffects();
    enqueueUpdate(current, update);
    scheduleWork(current, expirationTime);

    return expirationTime;
}

export function createContainer(container, isConcurrent, hydrate) {
    return createFiberRoot(container, isConcurrent, hydrate);
}

export function updateContainerAtExpirationTime(
    element,
    container,
    parentComponent,
    expirationTime,
    callback
) {
    const current = container.current;

    if (window.__DEV__) {
        if (ReactFiberInstrumentation.debugTool) {
            if (current.alternate === null) {
                ReactFiberInstrumentation.debugTool.onMountContainer(container);
            } else if (element === null) {
                ReactFiberInstrumentation.debugTool.onUnmountContainer(container);
            } else {
                ReactFiberInstrumentation.debugTool.onUpdateContainer(container);
            }
        }
    }

    const context = getContextForSubtree(parentComponent);
    if (container.context === null) {
        container.context = context
    } else {
        container.pendingContext = context
    }

    return scheduleRootUpdate(current, element, expirationTime, callback);

}

export function updateContainer(element, root, parentComponent, callback) {
    const current = root.current;
    const currentTime = requestCurrentTime();
    const expirationTime = computeExpirationForFiber(currentTime, current);
    return updateContainerAtExpirationTime(
        element,
        root,
        parentComponent,
        expirationTime,
        callback,
    )
}

export function getPublicRootInstance(container) {
    const containerFiber = container.current;
    if (!containerFiber.child) return null;

    switch (containerFiber.child.tag) {
        case HostComponent:
            return getPublicInstance(containerFiber.child.stateNode)
        default:
            return containerFiber.child.stateNode
    }
}
