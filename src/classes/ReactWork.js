export default class ReactWork {
    constructor() {
        this._callbacks = null;
        this._didCommit = false;
        this._onCommit = this._onCommit.bind(this)
    }

    then(onCommit) {
        if (this._didCommit) {
            onCommit();
            return
        }
        let callbacks = this._callbacks;
        if (callbacks === null) callbacks = this._callbacks = [];
        callbacks.push(onCommit);
    }

    _onCommit() {
        if (this._didCommit) return
        this._didCommit = true;
        const callbacks = this._callbacks
        if (callbacks === null) return

        for (let i = 0; i < callbacks.length; i++) {
            callbacks[i]();
        }

    }
}
