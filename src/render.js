import ReactRoot from './classes/ReactRoot.js'
import {ELEMENT_NODE, DOCUMENT_NODE} from './constants/HTMLNodeType.js'
import {unbatchedUpdates} from './ReactFiberScheduler.js'
import {getPublicRootInstance} from './ReactFiberReconciler.js'

function getReactRootElementInContainer(container) {
    if (!container) return null
    if (container.nodeType === DOCUMENT_NODE)
        return container.documentElement
    return container.firstChild
}

function shouldHydrateDueToLegacyHeuristic(container) {
    const rootElement = getReactRootElementInContainer(container)

    return !!(
        rootElement &&
        rootElement.nodeType === ELEMENT_NODE &&
        rootElement.hasAttribute('data-reactroot')
    )
}

function legacyCreateRootFromDOMContainer(container, forceHydrate) {
    const shouldHydrate = forceHydrate || shouldHydrateDueToLegacyHeuristic(container);

    if (!shouldHydrate) {
        let warned = false;
        let rootSubling;
        while ((rootSubling = container.lastChild)) {
            container.removeChild(rootSubling)
        }
    }

    return new ReactRoot(container, false, shouldHydrate)
}

function legacyRenderSubtreeIntoContainer(parentComponent, children, container, forceHydrate, callback) {
    let root = container._reactRootContainer

    if (root) {
        if (typeof callback === 'function') {
            const cb = callback;
            callback = function () {
                const instance = getPublicRootInstance(root._internalRoot)
                cb.call(instance)
            }
        }

        if (parentComponent !== null) {
            root.legacy_renderSubtreeIntoContainer(
                parentComponent,
                children,
                callback
            )
        } else {
            root.render(children, callback)
        }
    } else {
        root = container._reactRootContainer = legacyCreateRootFromDOMContainer(
            container,
            forceHydrate,
        )

        if (typeof callback === 'function') {
            const cb = callback;
            callback = function () {
                const instance = getPublicRootInstance(root._internalRoot)
                cb.call(instance)
            }
        }

        unbatchedUpdates(() => {
            if (parentComponent !== null) {
                root.legacy_renderSubtreeIntoContainer(
                    parentComponent,
                    children,
                    callback
                )
            } else {
                root.render(children, callback)
            }
        })
    }

    return getPublicRootInstance(root._internalRoot)
}

export default function render(element, container, callback) {
    return legacyRenderSubtreeIntoContainer(
        null,
        element,
        container,
        false,
        callback
    )
}
