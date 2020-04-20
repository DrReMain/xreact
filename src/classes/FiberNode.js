import {NoEffect} from '../constants/ReactSideEffectTags.js'
import {NoWork} from "../ReactFiberExpirationTime.js";

let debugCounter;

if (window.__DEV__) {
    debugCounter = 1;
}

export default class FiberNode {
    constructor(tag, pendingProps, key, mode) {
        // Instance
        this.tag = tag;
        this.key = key;
        this.elementType = null;
        this.type = null;
        this.stateNode = null;

        // Fiber
        this.return = null;
        this.child = null;
        this.sibling = null;
        this.index = 0;

        this.ref = null;

        this.pendingProps = pendingProps;
        this.memoizedProps = null;
        this.updateQueue = null;
        this.memoizedState = null;
        this.contextDependencies = null;

        this.mode = mode;

        // Effects
        this.effectTag = NoEffect;
        this.nextEffect = null;

        this.firstEffect = null;
        this.lastEffect = null;

        this.expirationTime = NoWork;
        this.childExpirationTime = NoWork;

        this.alternate = null;

        if (window.__PROFILE__) {
            this.actualDuration = Number.NaN;
            this.actualStartTime = Number.NaN;
            this.selfBaseDuration = Number.NaN;
            this.treeBaseDuration = Number.NaN;

            this.actualDuration = 0;
            this.actualStartTime = -1;
            this.selfBaseDuration = 0;
            this.treeBaseDuration = 0;
        }

        if (window.__DEV__) {
            this._debugID = debugCounter++;
            this._debugSource = null;
            this._debugOwner = null;
            this._debugIsCurrentlyTiming = false;
            this._debugHookTypes = null;

            if (typeof Object.preventExtensions === 'function') {
                Object.preventExtensions(this);
            }
        }
    }
}
