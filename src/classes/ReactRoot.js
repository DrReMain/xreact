import ReactWork from './ReactWork.js'
import ReactBatch from './ReactBatch.js'
import {createContainer, updateContainer} from '../ReactFiberReconciler.js'

export default class ReactRoot {
    constructor(container, isConcurrent, hydrate) {
        this._internalRoot = createContainer(container, isConcurrent, hydrate)
    }

    render(children, callback) {
        const root = this._internalRoot;
        const work = new ReactWork();
        callback = callback === undefined ? null : callback;
        if (callback !== null) {
            work.then(callback)
        }

        updateContainer(children, root, null, work._onCommit);
        return work;
    }

    unmount(callback) {
        const root = this._internalRoot;
        const work = new ReactWork();
        callback = callback === undefined ? null : callback;
        if (callback !== null) {
            work.then(callback)
        }
        updateContainer(null, root, null, work._onCommit);
        return work;
    }

    legacy_renderSubtreeIntoContainer(parentComponent, children, callback) {
        const root = this._internalRoot;
        const work = new ReactWork();
        callback = callback === undefined ? null : callback;
        if (callback !== null) {
            work.then(callback);
        }

        updateContainer(children, root, parentComponent, work._onCommit);
        return work;
    }

    createBatch() {
        const batch = new ReactBatch(this);
        const expirationTime = batch._expirationTime;

        const root = this._internalRoot;
        const firstBatch = root.firstBatch;
        if (firstBatch === null) {
            root.firstBatch = batch;
            batch._next = null;
        } else {

            let insertAfter = null;
            let insertBefore = firstBatch;

            while (
                insertBefor !== null &&
                insertBefore._expirationTime >= expirationTime
            ) {
                insertAfter = insertBefore;
                insertBefore = insertBefore._next;
            }

            batch._next = insertBefore;

            if (insertAfter !== null) {
                insertAfter._next = batch;
            }
        }

        return batch;
    }
}
