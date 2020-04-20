import ReactCurrentOwner from './ReactCurrentOwner.js'

const RESERVED_PROPS = {
    key: true,
    ref: true,
    __self: true,
    __source: true,
};

const ReactElement = function (type, key, ref, self, source, _owner, props) {
    const element = {
        $$typeof: Symbol.for('react.element'),
        type,
        key,
        ref,
        props,
        _owner
    }

    if (window.__DEV__) {
        element._store = {};

        Object.defineProperty(element._store, 'validated', {
            configurable: false,
            enumerable: false,
            writable: true,
            value: false,
        })

        Object.defineProperty(element, '_self', {
            configurable: false,
            enumerable: false,
            writable: false,
            value: self
        })

        Object.defineProperty(element, '_source', {
            configurable: false,
            enumerable: false,
            writable: false,
            value: source
        })

        if (Object.freeze) {
            Object.freeze(element.props);
            Object.freeze(element);
        }
    }

    return element
}

export default function createElement(type, config, children) {

    const props = {};

    let key = null;
    let ref = null;
    let self = null;
    let source = null;

    if (config !== null) {
        ref = config.ref || null;
        key = config.key ? '' + config.key : null

        self = config.__self === undefined ? null : config.__self;
        source = config.__source === undefined ? null : config.__source;

        for (const propName in config) {
            if (Object.hasOwnProperty.call(config, propName) && !RESERVED_PROPS.hasOwnProperty(propName)) {
                props[propName] = config[propName]
            }
        }
    }

    const childrenLength = arguments.length - 2;
    if (childrenLength === 1) {
        props.children = children;
    } else if (childrenLength > 1) {
        const childrenArray = Array(childrenLength);
        for (let i = 0; i < childrenLength; i++) {
            childrenArray[i] = arguments[i + 2];
        }
        props.children = childrenArray;
    }

    if (type && type.defaultProps) {
        const defaultProps = type.defaultProps;
        for (const propName in defaultProps) {
            if (props[propName] === undefined) {
                props[propName] = defaultProps[propName];
            }
        }
    }

    return ReactElement(type, key, ref, self, source, ReactCurrentOwner.current, props)
}
