import {HostRoot, ClassComponent} from "./constants/ReactWorkTags.js";
import {startPhaseTimer, stopPhaseTimer} from './ReactDebugFiberPerf.js'

export const emptyContextObject = {};

if (window.__DEV__) {
    Object.freeze(emptyContextObject);
}

export function processChildContext(fiber, type, parentContext) {
    const instance = fiber.stateNode;
    const childContextTypes = type.childContextTypes;

    if (typeof instance.getChildContext !== 'function') return parentContext

    let childContext;
    startPhaseTimer(fiber, 'getChildContext');
    childContext = instance.getChildContext();
    stopPhaseTimer();

    return {
        ...parentContext,
        ...childContext
    }
}

export function isContextProvider(type) {
    const childContextTypes = type.childContextTypes;
    return childContextTypes !== null && childContextTypes !== undefined;
}

export function findCurrentUnmaskedContext(fiber) {
    let node = fiber;

    do {
        switch (node.tag) {
            case HostRoot:
                return node.stateNode.context;
            case ClassComponent: {
                const Component = node.type;
                if (isContextProvider(Component)) {
                    return node.stateNode.__reactInternalMemoizedMergedChildContext;
                }
                break
            }
        }
        node = node.return;
    } while (node !== null);
}
