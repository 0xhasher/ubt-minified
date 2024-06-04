"use strict";
(self["webpackChunkweb3_dapp"] = self["webpackChunkweb3_dapp"] || []).push([[724],{

/***/ 41343:
/***/ ((module) => {



var has = Object.prototype.hasOwnProperty
  , prefix = '~';

/**
 * Constructor to create a storage for our `EE` objects.
 * An `Events` instance is a plain object whose properties are event names.
 *
 * @constructor
 * @private
 */
function Events() {}

//
// We try to not inherit from `Object.prototype`. In some engines creating an
// instance in this way is faster than calling `Object.create(null)` directly.
// If `Object.create(null)` is not supported we prefix the event names with a
// character to make sure that the built-in object properties are not
// overridden or used as an attack vector.
//
if (Object.create) {
  Events.prototype = Object.create(null);

  //
  // This hack is needed because the `__proto__` property is still inherited in
  // some old browsers like Android 4, iPhone 5.1, Opera 11 and Safari 5.
  //
  if (!new Events().__proto__) prefix = false;
}

/**
 * Representation of a single event listener.
 *
 * @param {Function} fn The listener function.
 * @param {*} context The context to invoke the listener with.
 * @param {Boolean} [once=false] Specify if the listener is a one-time listener.
 * @constructor
 * @private
 */
function EE(fn, context, once) {
  this.fn = fn;
  this.context = context;
  this.once = once || false;
}

/**
 * Add a listener for a given event.
 *
 * @param {EventEmitter} emitter Reference to the `EventEmitter` instance.
 * @param {(String|Symbol)} event The event name.
 * @param {Function} fn The listener function.
 * @param {*} context The context to invoke the listener with.
 * @param {Boolean} once Specify if the listener is a one-time listener.
 * @returns {EventEmitter}
 * @private
 */
function addListener(emitter, event, fn, context, once) {
  if (typeof fn !== 'function') {
    throw new TypeError('The listener must be a function');
  }

  var listener = new EE(fn, context || emitter, once)
    , evt = prefix ? prefix + event : event;

  if (!emitter._events[evt]) emitter._events[evt] = listener, emitter._eventsCount++;
  else if (!emitter._events[evt].fn) emitter._events[evt].push(listener);
  else emitter._events[evt] = [emitter._events[evt], listener];

  return emitter;
}

/**
 * Clear event by name.
 *
 * @param {EventEmitter} emitter Reference to the `EventEmitter` instance.
 * @param {(String|Symbol)} evt The Event name.
 * @private
 */
function clearEvent(emitter, evt) {
  if (--emitter._eventsCount === 0) emitter._events = new Events();
  else delete emitter._events[evt];
}

/**
 * Minimal `EventEmitter` interface that is molded against the Node.js
 * `EventEmitter` interface.
 *
 * @constructor
 * @public
 */
function EventEmitter() {
  this._events = new Events();
  this._eventsCount = 0;
}

/**
 * Return an array listing the events for which the emitter has registered
 * listeners.
 *
 * @returns {Array}
 * @public
 */
EventEmitter.prototype.eventNames = function eventNames() {
  var names = []
    , events
    , name;

  if (this._eventsCount === 0) return names;

  for (name in (events = this._events)) {
    if (has.call(events, name)) names.push(prefix ? name.slice(1) : name);
  }

  if (Object.getOwnPropertySymbols) {
    return names.concat(Object.getOwnPropertySymbols(events));
  }

  return names;
};

/**
 * Return the listeners registered for a given event.
 *
 * @param {(String|Symbol)} event The event name.
 * @returns {Array} The registered listeners.
 * @public
 */
EventEmitter.prototype.listeners = function listeners(event) {
  var evt = prefix ? prefix + event : event
    , handlers = this._events[evt];

  if (!handlers) return [];
  if (handlers.fn) return [handlers.fn];

  for (var i = 0, l = handlers.length, ee = new Array(l); i < l; i++) {
    ee[i] = handlers[i].fn;
  }

  return ee;
};

/**
 * Return the number of listeners listening to a given event.
 *
 * @param {(String|Symbol)} event The event name.
 * @returns {Number} The number of listeners.
 * @public
 */
EventEmitter.prototype.listenerCount = function listenerCount(event) {
  var evt = prefix ? prefix + event : event
    , listeners = this._events[evt];

  if (!listeners) return 0;
  if (listeners.fn) return 1;
  return listeners.length;
};

/**
 * Calls each of the listeners registered for a given event.
 *
 * @param {(String|Symbol)} event The event name.
 * @returns {Boolean} `true` if the event had listeners, else `false`.
 * @public
 */
EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
  var evt = prefix ? prefix + event : event;

  if (!this._events[evt]) return false;

  var listeners = this._events[evt]
    , len = arguments.length
    , args
    , i;

  if (listeners.fn) {
    if (listeners.once) this.removeListener(event, listeners.fn, undefined, true);

    switch (len) {
      case 1: return listeners.fn.call(listeners.context), true;
      case 2: return listeners.fn.call(listeners.context, a1), true;
      case 3: return listeners.fn.call(listeners.context, a1, a2), true;
      case 4: return listeners.fn.call(listeners.context, a1, a2, a3), true;
      case 5: return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
      case 6: return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
    }

    for (i = 1, args = new Array(len -1); i < len; i++) {
      args[i - 1] = arguments[i];
    }

    listeners.fn.apply(listeners.context, args);
  } else {
    var length = listeners.length
      , j;

    for (i = 0; i < length; i++) {
      if (listeners[i].once) this.removeListener(event, listeners[i].fn, undefined, true);

      switch (len) {
        case 1: listeners[i].fn.call(listeners[i].context); break;
        case 2: listeners[i].fn.call(listeners[i].context, a1); break;
        case 3: listeners[i].fn.call(listeners[i].context, a1, a2); break;
        case 4: listeners[i].fn.call(listeners[i].context, a1, a2, a3); break;
        default:
          if (!args) for (j = 1, args = new Array(len -1); j < len; j++) {
            args[j - 1] = arguments[j];
          }

          listeners[i].fn.apply(listeners[i].context, args);
      }
    }
  }

  return true;
};

/**
 * Add a listener for a given event.
 *
 * @param {(String|Symbol)} event The event name.
 * @param {Function} fn The listener function.
 * @param {*} [context=this] The context to invoke the listener with.
 * @returns {EventEmitter} `this`.
 * @public
 */
EventEmitter.prototype.on = function on(event, fn, context) {
  return addListener(this, event, fn, context, false);
};

/**
 * Add a one-time listener for a given event.
 *
 * @param {(String|Symbol)} event The event name.
 * @param {Function} fn The listener function.
 * @param {*} [context=this] The context to invoke the listener with.
 * @returns {EventEmitter} `this`.
 * @public
 */
EventEmitter.prototype.once = function once(event, fn, context) {
  return addListener(this, event, fn, context, true);
};

/**
 * Remove the listeners of a given event.
 *
 * @param {(String|Symbol)} event The event name.
 * @param {Function} fn Only remove the listeners that match this function.
 * @param {*} context Only remove the listeners that have this context.
 * @param {Boolean} once Only remove one-time listeners.
 * @returns {EventEmitter} `this`.
 * @public
 */
EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
  var evt = prefix ? prefix + event : event;

  if (!this._events[evt]) return this;
  if (!fn) {
    clearEvent(this, evt);
    return this;
  }

  var listeners = this._events[evt];

  if (listeners.fn) {
    if (
      listeners.fn === fn &&
      (!once || listeners.once) &&
      (!context || listeners.context === context)
    ) {
      clearEvent(this, evt);
    }
  } else {
    for (var i = 0, events = [], length = listeners.length; i < length; i++) {
      if (
        listeners[i].fn !== fn ||
        (once && !listeners[i].once) ||
        (context && listeners[i].context !== context)
      ) {
        events.push(listeners[i]);
      }
    }

    //
    // Reset the array, or remove it completely if we have no more listeners.
    //
    if (events.length) this._events[evt] = events.length === 1 ? events[0] : events;
    else clearEvent(this, evt);
  }

  return this;
};

/**
 * Remove all listeners, or those of the specified event.
 *
 * @param {(String|Symbol)} [event] The event name.
 * @returns {EventEmitter} `this`.
 * @public
 */
EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
  var evt;

  if (event) {
    evt = prefix ? prefix + event : event;
    if (this._events[evt]) clearEvent(this, evt);
  } else {
    this._events = new Events();
    this._eventsCount = 0;
  }

  return this;
};

//
// Alias methods names because people roll like that.
//
EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
EventEmitter.prototype.addListener = EventEmitter.prototype.on;

//
// Expose the prefix.
//
EventEmitter.prefixed = prefix;

//
// Allow `EventEmitter` to be imported as module namespace.
//
EventEmitter.EventEmitter = EventEmitter;

//
// Expose the module.
//
if (true) {
  module.exports = EventEmitter;
}


/***/ }),

/***/ 43450:
/***/ ((module) => {



module.exports = function () {
  throw new Error(
    'ws does not work in the browser. Browser clients must use the native ' +
      'WebSocket object'
  );
};


/***/ }),

/***/ 24724:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "default": () => (/* binding */ w3w_ethereum_provider_dist_I),
  getProvider: () => (/* binding */ w3w_ethereum_provider_dist_k)
});

// NAMESPACE OBJECT: ./node_modules/.pnpm/axios@1.6.8/node_modules/axios/lib/platform/common/utils.js
var common_utils_namespaceObject = {};
__webpack_require__.r(common_utils_namespaceObject);
__webpack_require__.d(common_utils_namespaceObject, {
  hasBrowserEnv: () => (hasBrowserEnv),
  hasStandardBrowserEnv: () => (hasStandardBrowserEnv),
  hasStandardBrowserWebWorkerEnv: () => (hasStandardBrowserWebWorkerEnv)
});

// EXTERNAL MODULE: ./node_modules/.pnpm/hash.js@1.1.7/node_modules/hash.js/lib/hash.js
var hash = __webpack_require__(75402);
var hash_namespaceObject = /*#__PURE__*/__webpack_require__.t(hash, 2);
// EXTERNAL MODULE: ./node_modules/.pnpm/eventemitter3@5.0.1/node_modules/eventemitter3/index.js
var eventemitter3 = __webpack_require__(41343);
;// CONCATENATED MODULE: ./node_modules/.pnpm/eventemitter3@5.0.1/node_modules/eventemitter3/index.mjs



/* harmony default export */ const node_modules_eventemitter3 = (eventemitter3);

;// CONCATENATED MODULE: ./node_modules/.pnpm/js-base64@3.7.7/node_modules/js-base64/base64.mjs
/* provided dependency */ var Buffer = __webpack_require__(84686)["Buffer"];
/**
 *  base64.ts
 *
 *  Licensed under the BSD 3-Clause License.
 *    http://opensource.org/licenses/BSD-3-Clause
 *
 *  References:
 *    http://en.wikipedia.org/wiki/Base64
 *
 * @author Dan Kogai (https://github.com/dankogai)
 */
const version = '3.7.7';
/**
 * @deprecated use lowercase `version`.
 */
const VERSION = version;
const _hasBuffer = typeof Buffer === 'function';
const _TD = typeof TextDecoder === 'function' ? new TextDecoder() : undefined;
const _TE = typeof TextEncoder === 'function' ? new TextEncoder() : undefined;
const b64ch = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
const b64chs = Array.prototype.slice.call(b64ch);
const b64tab = ((a) => {
    let tab = {};
    a.forEach((c, i) => tab[c] = i);
    return tab;
})(b64chs);
const b64re = /^(?:[A-Za-z\d+\/]{4})*?(?:[A-Za-z\d+\/]{2}(?:==)?|[A-Za-z\d+\/]{3}=?)?$/;
const _fromCC = String.fromCharCode.bind(String);
const _U8Afrom = typeof Uint8Array.from === 'function'
    ? Uint8Array.from.bind(Uint8Array)
    : (it) => new Uint8Array(Array.prototype.slice.call(it, 0));
const _mkUriSafe = (src) => src
    .replace(/=/g, '').replace(/[+\/]/g, (m0) => m0 == '+' ? '-' : '_');
const _tidyB64 = (s) => s.replace(/[^A-Za-z0-9\+\/]/g, '');
/**
 * polyfill version of `btoa`
 */
const btoaPolyfill = (bin) => {
    // console.log('polyfilled');
    let u32, c0, c1, c2, asc = '';
    const pad = bin.length % 3;
    for (let i = 0; i < bin.length;) {
        if ((c0 = bin.charCodeAt(i++)) > 255 ||
            (c1 = bin.charCodeAt(i++)) > 255 ||
            (c2 = bin.charCodeAt(i++)) > 255)
            throw new TypeError('invalid character found');
        u32 = (c0 << 16) | (c1 << 8) | c2;
        asc += b64chs[u32 >> 18 & 63]
            + b64chs[u32 >> 12 & 63]
            + b64chs[u32 >> 6 & 63]
            + b64chs[u32 & 63];
    }
    return pad ? asc.slice(0, pad - 3) + "===".substring(pad) : asc;
};
/**
 * does what `window.btoa` of web browsers do.
 * @param {String} bin binary string
 * @returns {string} Base64-encoded string
 */
const _btoa = typeof btoa === 'function' ? (bin) => btoa(bin)
    : _hasBuffer ? (bin) => Buffer.from(bin, 'binary').toString('base64')
        : btoaPolyfill;
const _fromUint8Array = _hasBuffer
    ? (u8a) => Buffer.from(u8a).toString('base64')
    : (u8a) => {
        // cf. https://stackoverflow.com/questions/12710001/how-to-convert-uint8-array-to-base64-encoded-string/12713326#12713326
        const maxargs = 0x1000;
        let strs = [];
        for (let i = 0, l = u8a.length; i < l; i += maxargs) {
            strs.push(_fromCC.apply(null, u8a.subarray(i, i + maxargs)));
        }
        return _btoa(strs.join(''));
    };
/**
 * converts a Uint8Array to a Base64 string.
 * @param {boolean} [urlsafe] URL-and-filename-safe a la RFC4648 §5
 * @returns {string} Base64 string
 */
const fromUint8Array = (u8a, urlsafe = false) => urlsafe ? _mkUriSafe(_fromUint8Array(u8a)) : _fromUint8Array(u8a);
// This trick is found broken https://github.com/dankogai/js-base64/issues/130
// const utob = (src: string) => unescape(encodeURIComponent(src));
// reverting good old fationed regexp
const cb_utob = (c) => {
    if (c.length < 2) {
        var cc = c.charCodeAt(0);
        return cc < 0x80 ? c
            : cc < 0x800 ? (_fromCC(0xc0 | (cc >>> 6))
                + _fromCC(0x80 | (cc & 0x3f)))
                : (_fromCC(0xe0 | ((cc >>> 12) & 0x0f))
                    + _fromCC(0x80 | ((cc >>> 6) & 0x3f))
                    + _fromCC(0x80 | (cc & 0x3f)));
    }
    else {
        var cc = 0x10000
            + (c.charCodeAt(0) - 0xD800) * 0x400
            + (c.charCodeAt(1) - 0xDC00);
        return (_fromCC(0xf0 | ((cc >>> 18) & 0x07))
            + _fromCC(0x80 | ((cc >>> 12) & 0x3f))
            + _fromCC(0x80 | ((cc >>> 6) & 0x3f))
            + _fromCC(0x80 | (cc & 0x3f)));
    }
};
const re_utob = /[\uD800-\uDBFF][\uDC00-\uDFFFF]|[^\x00-\x7F]/g;
/**
 * @deprecated should have been internal use only.
 * @param {string} src UTF-8 string
 * @returns {string} UTF-16 string
 */
const utob = (u) => u.replace(re_utob, cb_utob);
//
const _encode = _hasBuffer
    ? (s) => Buffer.from(s, 'utf8').toString('base64')
    : _TE
        ? (s) => _fromUint8Array(_TE.encode(s))
        : (s) => _btoa(utob(s));
/**
 * converts a UTF-8-encoded string to a Base64 string.
 * @param {boolean} [urlsafe] if `true` make the result URL-safe
 * @returns {string} Base64 string
 */
const encode = (src, urlsafe = false) => urlsafe
    ? _mkUriSafe(_encode(src))
    : _encode(src);
/**
 * converts a UTF-8-encoded string to URL-safe Base64 RFC4648 §5.
 * @returns {string} Base64 string
 */
const base64_encodeURI = (src) => encode(src, true);
// This trick is found broken https://github.com/dankogai/js-base64/issues/130
// const btou = (src: string) => decodeURIComponent(escape(src));
// reverting good old fationed regexp
const re_btou = /[\xC0-\xDF][\x80-\xBF]|[\xE0-\xEF][\x80-\xBF]{2}|[\xF0-\xF7][\x80-\xBF]{3}/g;
const cb_btou = (cccc) => {
    switch (cccc.length) {
        case 4:
            var cp = ((0x07 & cccc.charCodeAt(0)) << 18)
                | ((0x3f & cccc.charCodeAt(1)) << 12)
                | ((0x3f & cccc.charCodeAt(2)) << 6)
                | (0x3f & cccc.charCodeAt(3)), offset = cp - 0x10000;
            return (_fromCC((offset >>> 10) + 0xD800)
                + _fromCC((offset & 0x3FF) + 0xDC00));
        case 3:
            return _fromCC(((0x0f & cccc.charCodeAt(0)) << 12)
                | ((0x3f & cccc.charCodeAt(1)) << 6)
                | (0x3f & cccc.charCodeAt(2)));
        default:
            return _fromCC(((0x1f & cccc.charCodeAt(0)) << 6)
                | (0x3f & cccc.charCodeAt(1)));
    }
};
/**
 * @deprecated should have been internal use only.
 * @param {string} src UTF-16 string
 * @returns {string} UTF-8 string
 */
const btou = (b) => b.replace(re_btou, cb_btou);
/**
 * polyfill version of `atob`
 */
const atobPolyfill = (asc) => {
    // console.log('polyfilled');
    asc = asc.replace(/\s+/g, '');
    if (!b64re.test(asc))
        throw new TypeError('malformed base64.');
    asc += '=='.slice(2 - (asc.length & 3));
    let u24, bin = '', r1, r2;
    for (let i = 0; i < asc.length;) {
        u24 = b64tab[asc.charAt(i++)] << 18
            | b64tab[asc.charAt(i++)] << 12
            | (r1 = b64tab[asc.charAt(i++)]) << 6
            | (r2 = b64tab[asc.charAt(i++)]);
        bin += r1 === 64 ? _fromCC(u24 >> 16 & 255)
            : r2 === 64 ? _fromCC(u24 >> 16 & 255, u24 >> 8 & 255)
                : _fromCC(u24 >> 16 & 255, u24 >> 8 & 255, u24 & 255);
    }
    return bin;
};
/**
 * does what `window.atob` of web browsers do.
 * @param {String} asc Base64-encoded string
 * @returns {string} binary string
 */
const _atob = typeof atob === 'function' ? (asc) => atob(_tidyB64(asc))
    : _hasBuffer ? (asc) => Buffer.from(asc, 'base64').toString('binary')
        : atobPolyfill;
//
const _toUint8Array = _hasBuffer
    ? (a) => _U8Afrom(Buffer.from(a, 'base64'))
    : (a) => _U8Afrom(_atob(a).split('').map(c => c.charCodeAt(0)));
/**
 * converts a Base64 string to a Uint8Array.
 */
const toUint8Array = (a) => _toUint8Array(_unURI(a));
//
const _decode = _hasBuffer
    ? (a) => Buffer.from(a, 'base64').toString('utf8')
    : _TD
        ? (a) => _TD.decode(_toUint8Array(a))
        : (a) => btou(_atob(a));
const _unURI = (a) => _tidyB64(a.replace(/[-_]/g, (m0) => m0 == '-' ? '+' : '/'));
/**
 * converts a Base64 string to a UTF-8 string.
 * @param {String} src Base64 string.  Both normal and URL-safe are supported
 * @returns {string} UTF-8 string
 */
const decode = (src) => _decode(_unURI(src));
/**
 * check if a value is a valid Base64 string
 * @param {String} src a value to check
  */
const isValid = (src) => {
    if (typeof src !== 'string')
        return false;
    const s = src.replace(/\s+/g, '').replace(/={0,2}$/, '');
    return !/[^\s0-9a-zA-Z\+/]/.test(s) || !/[^\s0-9a-zA-Z\-_]/.test(s);
};
//
const _noEnum = (v) => {
    return {
        value: v, enumerable: false, writable: true, configurable: true
    };
};
/**
 * extend String.prototype with relevant methods
 */
const extendString = function () {
    const _add = (name, body) => Object.defineProperty(String.prototype, name, _noEnum(body));
    _add('fromBase64', function () { return decode(this); });
    _add('toBase64', function (urlsafe) { return encode(this, urlsafe); });
    _add('toBase64URI', function () { return encode(this, true); });
    _add('toBase64URL', function () { return encode(this, true); });
    _add('toUint8Array', function () { return toUint8Array(this); });
};
/**
 * extend Uint8Array.prototype with relevant methods
 */
const extendUint8Array = function () {
    const _add = (name, body) => Object.defineProperty(Uint8Array.prototype, name, _noEnum(body));
    _add('toBase64', function (urlsafe) { return fromUint8Array(this, urlsafe); });
    _add('toBase64URI', function () { return fromUint8Array(this, true); });
    _add('toBase64URL', function () { return fromUint8Array(this, true); });
};
/**
 * extend Builtin prototypes with relevant methods
 */
const extendBuiltins = () => {
    extendString();
    extendUint8Array();
};
const gBase64 = {
    version: version,
    VERSION: VERSION,
    atob: _atob,
    atobPolyfill: atobPolyfill,
    btoa: _btoa,
    btoaPolyfill: btoaPolyfill,
    fromBase64: decode,
    toBase64: encode,
    encode: encode,
    encodeURI: base64_encodeURI,
    encodeURL: base64_encodeURI,
    utob: utob,
    btou: btou,
    decode: decode,
    isValid: isValid,
    fromUint8Array: fromUint8Array,
    toUint8Array: toUint8Array,
    extendString: extendString,
    extendUint8Array: extendUint8Array,
    extendBuiltins: extendBuiltins
};
// makecjs:CUT //




















// and finally,


;// CONCATENATED MODULE: ./node_modules/.pnpm/@binance+w3w-utils@1.1.4/node_modules/@binance/w3w-utils/dist/index.js
/* provided dependency */ var process = __webpack_require__(68558);
/* provided dependency */ var dist_Buffer = __webpack_require__(84686)["Buffer"];
/* provided dependency */ var console = __webpack_require__(65640);
function e(e,r){if(r==null||r>e.length)r=e.length;for(var t=0,n=new Array(r);t<r;t++)n[t]=e[t];return n}function r(r){if(Array.isArray(r))return e(r)}function t(e){if(e===void 0){throw new ReferenceError("this hasn't been initialised - super() hasn't been called")}return e}function n(e,r){if(!(e instanceof r)){throw new TypeError("Cannot call a class as a function")}}function o(e,r,t){if(O()){o=Reflect.construct}else{o=function e(e,r,t){var n=[null];n.push.apply(n,r);var o=Function.bind.apply(e,n);var i=new o;if(t)m(i,t.prototype);return i}}return o.apply(null,arguments)}function i(e,r){for(var t=0;t<r.length;t++){var n=r[t];n.enumerable=n.enumerable||false;n.configurable=true;if("value"in n)n.writable=true;Object.defineProperty(e,n.key,n)}}function a(e,r,t){if(r)i(e.prototype,r);if(t)i(e,t);return e}function s(e,r,t){if(r in e){Object.defineProperty(e,r,{value:t,enumerable:true,configurable:true,writable:true})}else{e[r]=t}return e}function u(e){u=Object.setPrototypeOf?Object.getPrototypeOf:function e(e){return e.__proto__||Object.getPrototypeOf(e)};return u(e)}function c(e,r){if(typeof r!=="function"&&r!==null){throw new TypeError("Super expression must either be null or a function")}e.prototype=Object.create(r&&r.prototype,{constructor:{value:e,writable:true,configurable:true}});if(r)m(e,r)}function f(e,r){if(r!=null&&typeof Symbol!=="undefined"&&r[Symbol.hasInstance]){return!!r[Symbol.hasInstance](e)}else{return e instanceof r}}function l(e){return Function.toString.call(e).indexOf("[native code]")!==-1}function p(e){if(typeof Symbol!=="undefined"&&e[Symbol.iterator]!=null||e["@@iterator"]!=null)return Array.from(e)}function d(){throw new TypeError("Invalid attempt to spread non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}function v(e){for(var r=1;r<arguments.length;r++){var t=arguments[r]!=null?arguments[r]:{};var n=Object.keys(t);if(typeof Object.getOwnPropertySymbols==="function"){n=n.concat(Object.getOwnPropertySymbols(t).filter(function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))}n.forEach(function(r){s(e,r,t[r])})}return e}function h(e,r){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);if(r){n=n.filter(function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable})}t.push.apply(t,n)}return t}function y(e,r){r=r!=null?r:{};if(Object.getOwnPropertyDescriptors){Object.defineProperties(e,Object.getOwnPropertyDescriptors(r))}else{h(Object(r)).forEach(function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))})}return e}function g(e,r){if(r&&(w(r)==="object"||typeof r==="function")){return r}return t(e)}function m(e,r){m=Object.setPrototypeOf||function e(e,r){e.__proto__=r;return e};return m(e,r)}function b(e){return r(e)||p(e)||R(e)||d()}function w(e){"@swc/helpers - typeof";return e&&typeof Symbol!=="undefined"&&e.constructor===Symbol?"symbol":typeof e}function R(r,t){if(!r)return;if(typeof r==="string")return e(r,t);var n=Object.prototype.toString.call(r).slice(8,-1);if(n==="Object"&&r.constructor)n=r.constructor.name;if(n==="Map"||n==="Set")return Array.from(n);if(n==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))return e(r,t)}function E(e){var r=typeof Map==="function"?new Map:undefined;E=function e(e){if(e===null||!l(e))return e;if(typeof e!=="function"){throw new TypeError("Super expression must either be null or a function")}if(typeof r!=="undefined"){if(r.has(e))return r.get(e);r.set(e,t)}function t(){return o(e,arguments,u(this).constructor)}t.prototype=Object.create(e.prototype,{constructor:{value:t,enumerable:false,writable:true,configurable:true}});return m(t,e)};return E(e)}function O(){if(typeof Reflect==="undefined"||!Reflect.construct)return false;if(Reflect.construct.sham)return false;if(typeof Proxy==="function")return true;try{Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],function(){}));return true}catch(e){return false}}function _(e){var r=O();return function t(){var t=u(e),n;if(r){var o=u(this).constructor;n=Reflect.construct(t,arguments,o)}else{n=t.apply(this,arguments)}return g(this,n)}}var A=Object.defineProperty;var S=function(e,r,t){return r in e?A(e,r,{enumerable:!0,configurable:!0,writable:!0,value:t}):e[r]=t};var x=function(e,r,t){return S(e,(typeof r==="undefined"?"undefined":w(r))!="symbol"?r+"":r,t),t};var N;var I="PARSE_ERROR",P="INVALID_REQUEST",T="METHOD_NOT_FOUND",C="INVALID_PARAMS",j="INTERNAL_ERROR",D="SERVER_ERROR",U=[-32700,-32600,-32601,-32602,-32603],k=(/* unused pure expression or super */ null && ([-32e3,-32099])),M=(N={},s(N,I,{code:-32700,message:"Parse error"}),s(N,P,{code:-32600,message:"Invalid Request"}),s(N,T,{code:-32601,message:"Method not found"}),s(N,C,{code:-32602,message:"Invalid params"}),s(N,j,{code:-32603,message:"Internal error"}),s(N,D,{code:-32e3,message:"Server error"}),N),B=D;function L(e){return e<=k[0]&&e>=k[1]}function J(e){return U.includes(e)}function K(e){return typeof e=="number"}function H(e){return Object.keys(M).includes(e)?M[e]:M[B]}function V(e){var r=Object.values(M).find(function(r){return r.code===e});return r||M[B]}function F(e){if(w(e.error.code)>"u")return{valid:!1,error:"Missing code for JSON-RPC error"};if(w(e.error.message)>"u")return{valid:!1,error:"Missing message for JSON-RPC error"};if(!K(e.error.code))return{valid:!1,error:"Invalid error code type for JSON-RPC: ".concat(e.error.code)};if(J(e.error.code)){var r=V(e.error.code);if(r.message!==M[B].message&&e.error.message===r.message)return{valid:!1,error:"Invalid error code message for JSON-RPC: ".concat(e.error.code)}}return{valid:!0}}function z(e,r,t){return e.message.includes("getaddrinfo ENOTFOUND")||e.message.includes("connect ECONNREFUSED")?new Error("Unavailable ".concat(t," RPC url at ").concat(r)):e}function W(){var e=Date.now()*Math.pow(10,3),r=Math.floor(Math.random()*Math.pow(10,3));return e+r}function q(){return function(e,r){for(r=e="";e++<36;r+=e*51&52?(e^15?8^Math.random()*(e^20?16:4):4).toString(16):"-");return r}()}function G(e,r,t){return{id:t||W(),jsonrpc:"2.0",method:e,params:r||[]}}function Z(e,r){return{id:e,jsonrpc:"2.0",result:r}}function Q(e,r,t){return{id:e,jsonrpc:"2.0",error:X(r,t)}}function X(e,r){return(typeof e==="undefined"?"undefined":w(e))>"u"?H(j):(typeof e=="string"&&(e=y(v({},H(D)),{message:e})),(typeof r==="undefined"?"undefined":w(r))<"u"&&(e.data=r),J(e.code)&&(e=V(e.code)),e)}function Y(e){return typeof e=="object"&&"id"in e&&"jsonrpc"in e&&e.jsonrpc==="2.0"}function $(e){return Y(e)&&(ee(e)||er(e))}function ee(e){return"result"in e}function er(e){return"error"in e}var et="^https?:",en="^wss?:";function eo(e){var r=e.match(new RegExp(/^\w+:/,"gi"));if(!(!r||!r.length))return r[0]}function ei(e,r){var t=eo(e);return(typeof t==="undefined"?"undefined":w(t))>"u"?!1:new RegExp(r).test(t)}function ea(e){return ei(e,et)}function es(e){return ei(e,en)}function eu(e){return new RegExp("wss?://localhost(:d{2,5})?").test(e)}var ec={1:"mainnet",3:"ropsten",4:"rinkeby",5:"goerli",42:"kovan"},ef=["eth_requestAccounts","eth_accounts","eth_chainId","eth_signTransaction","eth_sendTransaction","eth_sign","personal_sign","eth_signTypedData","eth_signTypedData_v1","eth_signTypedData_v2","eth_signTypedData_v3","eth_signTypedData_v4","wallet_switchEthereumChain","wallet_watchAsset"];function el(e,r){var t,n=ec[e];return typeof n=="string"&&(t="https://".concat(n,".infura.io/v3/").concat(r)),t}function ep(e){if(typeof e!="string")throw new Error("Cannot safe json parse value of type ".concat(typeof e==="undefined"?"undefined":w(e)));try{return JSON.parse(e)}catch(r){return e}}function ed(e){return typeof e=="string"?e:JSON.stringify(e)}function ev(e,r){var t,n=el(e,r.infuraId);return r.custom&&r.custom[e]?t=r.custom[e]:n&&(t=n),t}function eh(){return(typeof process==="undefined"?"undefined":w(process))<"u"&&w(process.versions)<"u"&&w(process.versions.node)<"u"}function ey(e){return typeof e=="string"?Number.parseInt(e,e.trim().substring(0,2)==="0x"?16:10):(typeof e==="undefined"?"undefined":w(e))=="bigint"?Number(e):e}var eg="hex",em="utf8";function eb(e){return e.replace(/^0x/,"")}function ew(e){return eE(dist_Buffer.from(eb(e),eg))}function eR(e){var r=arguments.length>1&&arguments[1]!==void 0?arguments[1]:!1;return eO(eA(e),r)}function eE(e){return new Uint8Array(e)}function eO(e){var r=arguments.length>1&&arguments[1]!==void 0?arguments[1]:!1;var t=e.toString(eg);return r?eS(t):t}function e_(e){return ArrayBuffer.isView(e)?dist_Buffer.from(e.buffer,e.byteOffset,e.byteLength):dist_Buffer.from(e)}function eA(e){return e_(e)}function eS(e){return e.startsWith("0x")?e:"0x".concat(e)}function ex(){for(var e=arguments.length,r=new Array(e),t=0;t<e;t++){r[t]=arguments[t]}var n=[];return r.forEach(function(e){return n=n.concat(Array.from(e))}),new Uint8Array(b(n))}function eN(e){return eE(dist_Buffer.from(e,em))}function eI(e){return dist_Buffer.from(e,em)}function eP(e){return e.toString(em)}function eT(e){return eP(eA(e))}function eC(e){var r=arguments.length>1&&arguments[1]!==void 0?arguments[1]:!1;return eO(eI(e),r)}function ej(e){return ew(e).buffer}function eD(e,r){return eR(new Uint8Array(e),!r)}function eU(e){return eE(e).buffer}function ek(e){return eA(new Uint8Array(e))}function eM(e){var r="0x0";return typeof e=="number"&&(r="0x".concat(e.toString(16))),typeof e=="string"&&(e.startsWith("0x")?r=e:r="0x0"),r}var eL={16:10,24:12,32:14},eJ=[1,2,4,8,16,32,64,128,27,54,108,216,171,77,154,47,94,188,99,198,151,53,106,212,179,125,250,239,197,145],eK=[99,124,119,123,242,107,111,197,48,1,103,43,254,215,171,118,202,130,201,125,250,89,71,240,173,212,162,175,156,164,114,192,183,253,147,38,54,63,247,204,52,165,229,241,113,216,49,21,4,199,35,195,24,150,5,154,7,18,128,226,235,39,178,117,9,131,44,26,27,110,90,160,82,59,214,179,41,227,47,132,83,209,0,237,32,252,177,91,106,203,190,57,74,76,88,207,208,239,170,251,67,77,51,133,69,249,2,127,80,60,159,168,81,163,64,143,146,157,56,245,188,182,218,33,16,255,243,210,205,12,19,236,95,151,68,23,196,167,126,61,100,93,25,115,96,129,79,220,34,42,144,136,70,238,184,20,222,94,11,219,224,50,58,10,73,6,36,92,194,211,172,98,145,149,228,121,231,200,55,109,141,213,78,169,108,86,244,234,101,122,174,8,186,120,37,46,28,166,180,198,232,221,116,31,75,189,139,138,112,62,181,102,72,3,246,14,97,53,87,185,134,193,29,158,225,248,152,17,105,217,142,148,155,30,135,233,206,85,40,223,140,161,137,13,191,230,66,104,65,153,45,15,176,84,187,22],eH=[82,9,106,213,48,54,165,56,191,64,163,158,129,243,215,251,124,227,57,130,155,47,255,135,52,142,67,68,196,222,233,203,84,123,148,50,166,194,35,61,238,76,149,11,66,250,195,78,8,46,161,102,40,217,36,178,118,91,162,73,109,139,209,37,114,248,246,100,134,104,152,22,212,164,92,204,93,101,182,146,108,112,72,80,253,237,185,218,94,21,70,87,167,141,157,132,144,216,171,0,140,188,211,10,247,228,88,5,184,179,69,6,208,44,30,143,202,63,15,2,193,175,189,3,1,19,138,107,58,145,17,65,79,103,220,234,151,242,207,206,240,180,230,115,150,172,116,34,231,173,53,133,226,249,55,232,28,117,223,110,71,241,26,113,29,41,197,137,111,183,98,14,170,24,190,27,252,86,62,75,198,210,121,32,154,219,192,254,120,205,90,244,31,221,168,51,136,7,199,49,177,18,16,89,39,128,236,95,96,81,127,169,25,181,74,13,45,229,122,159,147,201,156,239,160,224,59,77,174,42,245,176,200,235,187,60,131,83,153,97,23,43,4,126,186,119,214,38,225,105,20,99,85,33,12,125],eV=[3328402341,4168907908,4000806809,4135287693,4294111757,3597364157,3731845041,2445657428,1613770832,33620227,3462883241,1445669757,3892248089,3050821474,1303096294,3967186586,2412431941,528646813,2311702848,4202528135,4026202645,2992200171,2387036105,4226871307,1101901292,3017069671,1604494077,1169141738,597466303,1403299063,3832705686,2613100635,1974974402,3791519004,1033081774,1277568618,1815492186,2118074177,4126668546,2211236943,1748251740,1369810420,3521504564,4193382664,3799085459,2883115123,1647391059,706024767,134480908,2512897874,1176707941,2646852446,806885416,932615841,168101135,798661301,235341577,605164086,461406363,3756188221,3454790438,1311188841,2142417613,3933566367,302582043,495158174,1479289972,874125870,907746093,3698224818,3025820398,1537253627,2756858614,1983593293,3084310113,2108928974,1378429307,3722699582,1580150641,327451799,2790478837,3117535592,0,3253595436,1075847264,3825007647,2041688520,3059440621,3563743934,2378943302,1740553945,1916352843,2487896798,2555137236,2958579944,2244988746,3151024235,3320835882,1336584933,3992714006,2252555205,2588757463,1714631509,293963156,2319795663,3925473552,67240454,4269768577,2689618160,2017213508,631218106,1269344483,2723238387,1571005438,2151694528,93294474,1066570413,563977660,1882732616,4059428100,1673313503,2008463041,2950355573,1109467491,537923632,3858759450,4260623118,3218264685,2177748300,403442708,638784309,3287084079,3193921505,899127202,2286175436,773265209,2479146071,1437050866,4236148354,2050833735,3362022572,3126681063,840505643,3866325909,3227541664,427917720,2655997905,2749160575,1143087718,1412049534,999329963,193497219,2353415882,3354324521,1807268051,672404540,2816401017,3160301282,369822493,2916866934,3688947771,1681011286,1949973070,336202270,2454276571,201721354,1210328172,3093060836,2680341085,3184776046,1135389935,3294782118,965841320,831886756,3554993207,4068047243,3588745010,2345191491,1849112409,3664604599,26054028,2983581028,2622377682,1235855840,3630984372,2891339514,4092916743,3488279077,3395642799,4101667470,1202630377,268961816,1874508501,4034427016,1243948399,1546530418,941366308,1470539505,1941222599,2546386513,3421038627,2715671932,3899946140,1042226977,2521517021,1639824860,227249030,260737669,3765465232,2084453954,1907733956,3429263018,2420656344,100860677,4160157185,470683154,3261161891,1781871967,2924959737,1773779408,394692241,2579611992,974986535,664706745,3655459128,3958962195,731420851,571543859,3530123707,2849626480,126783113,865375399,765172662,1008606754,361203602,3387549984,2278477385,2857719295,1344809080,2782912378,59542671,1503764984,160008576,437062935,1707065306,3622233649,2218934982,3496503480,2185314755,697932208,1512910199,504303377,2075177163,2824099068,1841019862,739644986],eF=[2781242211,2230877308,2582542199,2381740923,234877682,3184946027,2984144751,1418839493,1348481072,50462977,2848876391,2102799147,434634494,1656084439,3863849899,2599188086,1167051466,2636087938,1082771913,2281340285,368048890,3954334041,3381544775,201060592,3963727277,1739838676,4250903202,3930435503,3206782108,4149453988,2531553906,1536934080,3262494647,484572669,2923271059,1783375398,1517041206,1098792767,49674231,1334037708,1550332980,4098991525,886171109,150598129,2481090929,1940642008,1398944049,1059722517,201851908,1385547719,1699095331,1587397571,674240536,2704774806,252314885,3039795866,151914247,908333586,2602270848,1038082786,651029483,1766729511,3447698098,2682942837,454166793,2652734339,1951935532,775166490,758520603,3000790638,4004797018,4217086112,4137964114,1299594043,1639438038,3464344499,2068982057,1054729187,1901997871,2534638724,4121318227,1757008337,0,750906861,1614815264,535035132,3363418545,3988151131,3201591914,1183697867,3647454910,1265776953,3734260298,3566750796,3903871064,1250283471,1807470800,717615087,3847203498,384695291,3313910595,3617213773,1432761139,2484176261,3481945413,283769337,100925954,2180939647,4037038160,1148730428,3123027871,3813386408,4087501137,4267549603,3229630528,2315620239,2906624658,3156319645,1215313976,82966005,3747855548,3245848246,1974459098,1665278241,807407632,451280895,251524083,1841287890,1283575245,337120268,891687699,801369324,3787349855,2721421207,3431482436,959321879,1469301956,4065699751,2197585534,1199193405,2898814052,3887750493,724703513,2514908019,2696962144,2551808385,3516813135,2141445340,1715741218,2119445034,2872807568,2198571144,3398190662,700968686,3547052216,1009259540,2041044702,3803995742,487983883,1991105499,1004265696,1449407026,1316239930,504629770,3683797321,168560134,1816667172,3837287516,1570751170,1857934291,4014189740,2797888098,2822345105,2754712981,936633572,2347923833,852879335,1133234376,1500395319,3084545389,2348912013,1689376213,3533459022,3762923945,3034082412,4205598294,133428468,634383082,2949277029,2398386810,3913789102,403703816,3580869306,2297460856,1867130149,1918643758,607656988,4049053350,3346248884,1368901318,600565992,2090982877,2632479860,557719327,3717614411,3697393085,2249034635,2232388234,2430627952,1115438654,3295786421,2865522278,3633334344,84280067,33027830,303828494,2747425121,1600795957,4188952407,3496589753,2434238086,1486471617,658119965,3106381470,953803233,334231800,3005978776,857870609,3151128937,1890179545,2298973838,2805175444,3056442267,574365214,2450884487,550103529,1233637070,4289353045,2018519080,2057691103,2399374476,4166623649,2148108681,387583245,3664101311,836232934,3330556482,3100665960,3280093505,2955516313,2002398509,287182607,3413881008,4238890068,3597515707,975967766],ez=[1671808611,2089089148,2006576759,2072901243,4061003762,1807603307,1873927791,3310653893,810573872,16974337,1739181671,729634347,4263110654,3613570519,2883997099,1989864566,3393556426,2191335298,3376449993,2106063485,4195741690,1508618841,1204391495,4027317232,2917941677,3563566036,2734514082,2951366063,2629772188,2767672228,1922491506,3227229120,3082974647,4246528509,2477669779,644500518,911895606,1061256767,4144166391,3427763148,878471220,2784252325,3845444069,4043897329,1905517169,3631459288,827548209,356461077,67897348,3344078279,593839651,3277757891,405286936,2527147926,84871685,2595565466,118033927,305538066,2157648768,3795705826,3945188843,661212711,2999812018,1973414517,152769033,2208177539,745822252,439235610,455947803,1857215598,1525593178,2700827552,1391895634,994932283,3596728278,3016654259,695947817,3812548067,795958831,2224493444,1408607827,3513301457,0,3979133421,543178784,4229948412,2982705585,1542305371,1790891114,3410398667,3201918910,961245753,1256100938,1289001036,1491644504,3477767631,3496721360,4012557807,2867154858,4212583931,1137018435,1305975373,861234739,2241073541,1171229253,4178635257,33948674,2139225727,1357946960,1011120188,2679776671,2833468328,1374921297,2751356323,1086357568,2408187279,2460827538,2646352285,944271416,4110742005,3168756668,3066132406,3665145818,560153121,271589392,4279952895,4077846003,3530407890,3444343245,202643468,322250259,3962553324,1608629855,2543990167,1154254916,389623319,3294073796,2817676711,2122513534,1028094525,1689045092,1575467613,422261273,1939203699,1621147744,2174228865,1339137615,3699352540,577127458,712922154,2427141008,2290289544,1187679302,3995715566,3100863416,339486740,3732514782,1591917662,186455563,3681988059,3762019296,844522546,978220090,169743370,1239126601,101321734,611076132,1558493276,3260915650,3547250131,2901361580,1655096418,2443721105,2510565781,3828863972,2039214713,3878868455,3359869896,928607799,1840765549,2374762893,3580146133,1322425422,2850048425,1823791212,1459268694,4094161908,3928346602,1706019429,2056189050,2934523822,135794696,3134549946,2022240376,628050469,779246638,472135708,2800834470,3032970164,3327236038,3894660072,3715932637,1956440180,522272287,1272813131,3185336765,2340818315,2323976074,1888542832,1044544574,3049550261,1722469478,1222152264,50660867,4127324150,236067854,1638122081,895445557,1475980887,3117443513,2257655686,3243809217,489110045,2662934430,3778599393,4162055160,2561878936,288563729,1773916777,3648039385,2391345038,2493985684,2612407707,505560094,2274497927,3911240169,3460925390,1442818645,678973480,3749357023,2358182796,2717407649,2306869641,219617805,3218761151,3862026214,1120306242,1756942440,1103331905,2578459033,762796589,252780047,2966125488,1425844308,3151392187,372911126],eW=[1667474886,2088535288,2004326894,2071694838,4075949567,1802223062,1869591006,3318043793,808472672,16843522,1734846926,724270422,4278065639,3621216949,2880169549,1987484396,3402253711,2189597983,3385409673,2105378810,4210693615,1499065266,1195886990,4042263547,2913856577,3570689971,2728590687,2947541573,2627518243,2762274643,1920112356,3233831835,3082273397,4261223649,2475929149,640051788,909531756,1061110142,4160160501,3435941763,875846760,2779116625,3857003729,4059105529,1903268834,3638064043,825316194,353713962,67374088,3351728789,589522246,3284360861,404236336,2526454071,84217610,2593830191,117901582,303183396,2155911963,3806477791,3958056653,656894286,2998062463,1970642922,151591698,2206440989,741110872,437923380,454765878,1852748508,1515908788,2694904667,1381168804,993742198,3604373943,3014905469,690584402,3823320797,791638366,2223281939,1398011302,3520161977,0,3991743681,538992704,4244381667,2981218425,1532751286,1785380564,3419096717,3200178535,960056178,1246420628,1280103576,1482221744,3486468741,3503319995,4025428677,2863326543,4227536621,1128514950,1296947098,859002214,2240123921,1162203018,4193849577,33687044,2139062782,1347481760,1010582648,2678045221,2829640523,1364325282,2745433693,1077985408,2408548869,2459086143,2644360225,943212656,4126475505,3166494563,3065430391,3671750063,555836226,269496352,4294908645,4092792573,3537006015,3452783745,202118168,320025894,3974901699,1600119230,2543297077,1145359496,387397934,3301201811,2812801621,2122220284,1027426170,1684319432,1566435258,421079858,1936954854,1616945344,2172753945,1330631070,3705438115,572679748,707427924,2425400123,2290647819,1179044492,4008585671,3099120491,336870440,3739122087,1583276732,185277718,3688593069,3772791771,842159716,976899700,168435220,1229577106,101059084,606366792,1549591736,3267517855,3553849021,2897014595,1650632388,2442242105,2509612081,3840161747,2038008818,3890688725,3368567691,926374254,1835907034,2374863873,3587531953,1313788572,2846482505,1819063512,1448540844,4109633523,3941213647,1701162954,2054852340,2930698567,134748176,3132806511,2021165296,623210314,774795868,471606328,2795958615,3031746419,3334885783,3907527627,3722280097,1953799400,522133822,1263263126,3183336545,2341176845,2324333839,1886425312,1044267644,3048588401,1718004428,1212733584,50529542,4143317495,235803164,1633788866,892690282,1465383342,3115962473,2256965911,3250673817,488449850,2661202215,3789633753,4177007595,2560144171,286339874,1768537042,3654906025,2391705863,2492770099,2610673197,505291324,2273808917,3924369609,3469625735,1431699370,673740880,3755965093,2358021891,2711746649,2307489801,218961690,3217021541,3873845719,1111672452,1751693520,1094828930,2576986153,757954394,252645662,2964376443,1414855848,3149649517,370555436],eq=[1374988112,2118214995,437757123,975658646,1001089995,530400753,2902087851,1273168787,540080725,2910219766,2295101073,4110568485,1340463100,3307916247,641025152,3043140495,3736164937,632953703,1172967064,1576976609,3274667266,2169303058,2370213795,1809054150,59727847,361929877,3211623147,2505202138,3569255213,1484005843,1239443753,2395588676,1975683434,4102977912,2572697195,666464733,3202437046,4035489047,3374361702,2110667444,1675577880,3843699074,2538681184,1649639237,2976151520,3144396420,4269907996,4178062228,1883793496,2403728665,2497604743,1383856311,2876494627,1917518562,3810496343,1716890410,3001755655,800440835,2261089178,3543599269,807962610,599762354,33778362,3977675356,2328828971,2809771154,4077384432,1315562145,1708848333,101039829,3509871135,3299278474,875451293,2733856160,92987698,2767645557,193195065,1080094634,1584504582,3178106961,1042385657,2531067453,3711829422,1306967366,2438237621,1908694277,67556463,1615861247,429456164,3602770327,2302690252,1742315127,2968011453,126454664,3877198648,2043211483,2709260871,2084704233,4169408201,0,159417987,841739592,504459436,1817866830,4245618683,260388950,1034867998,908933415,168810852,1750902305,2606453969,607530554,202008497,2472011535,3035535058,463180190,2160117071,1641816226,1517767529,470948374,3801332234,3231722213,1008918595,303765277,235474187,4069246893,766945465,337553864,1475418501,2943682380,4003061179,2743034109,4144047775,1551037884,1147550661,1543208500,2336434550,3408119516,3069049960,3102011747,3610369226,1113818384,328671808,2227573024,2236228733,3535486456,2935566865,3341394285,496906059,3702665459,226906860,2009195472,733156972,2842737049,294930682,1206477858,2835123396,2700099354,1451044056,573804783,2269728455,3644379585,2362090238,2564033334,2801107407,2776292904,3669462566,1068351396,742039012,1350078989,1784663195,1417561698,4136440770,2430122216,775550814,2193862645,2673705150,1775276924,1876241833,3475313331,3366754619,270040487,3902563182,3678124923,3441850377,1851332852,3969562369,2203032232,3868552805,2868897406,566021896,4011190502,3135740889,1248802510,3936291284,699432150,832877231,708780849,3332740144,899835584,1951317047,4236429990,3767586992,866637845,4043610186,1106041591,2144161806,395441711,1984812685,1139781709,3433712980,3835036895,2664543715,1282050075,3240894392,1181045119,2640243204,25965917,4203181171,4211818798,3009879386,2463879762,3910161971,1842759443,2597806476,933301370,1509430414,3943906441,3467192302,3076639029,3776767469,2051518780,2631065433,1441952575,404016761,1942435775,1408749034,1610459739,3745345300,2017778566,3400528769,3110650942,941896748,3265478751,371049330,3168937228,675039627,4279080257,967311729,135050206,3635733660,1683407248,2076935265,3576870512,1215061108,3501741890],eG=[1347548327,1400783205,3273267108,2520393566,3409685355,4045380933,2880240216,2471224067,1428173050,4138563181,2441661558,636813900,4233094615,3620022987,2149987652,2411029155,1239331162,1730525723,2554718734,3781033664,46346101,310463728,2743944855,3328955385,3875770207,2501218972,3955191162,3667219033,768917123,3545789473,692707433,1150208456,1786102409,2029293177,1805211710,3710368113,3065962831,401639597,1724457132,3028143674,409198410,2196052529,1620529459,1164071807,3769721975,2226875310,486441376,2499348523,1483753576,428819965,2274680428,3075636216,598438867,3799141122,1474502543,711349675,129166120,53458370,2592523643,2782082824,4063242375,2988687269,3120694122,1559041666,730517276,2460449204,4042459122,2706270690,3446004468,3573941694,533804130,2328143614,2637442643,2695033685,839224033,1973745387,957055980,2856345839,106852767,1371368976,4181598602,1033297158,2933734917,1179510461,3046200461,91341917,1862534868,4284502037,605657339,2547432937,3431546947,2003294622,3182487618,2282195339,954669403,3682191598,1201765386,3917234703,3388507166,0,2198438022,1211247597,2887651696,1315723890,4227665663,1443857720,507358933,657861945,1678381017,560487590,3516619604,975451694,2970356327,261314535,3535072918,2652609425,1333838021,2724322336,1767536459,370938394,182621114,3854606378,1128014560,487725847,185469197,2918353863,3106780840,3356761769,2237133081,1286567175,3152976349,4255350624,2683765030,3160175349,3309594171,878443390,1988838185,3704300486,1756818940,1673061617,3403100636,272786309,1075025698,545572369,2105887268,4174560061,296679730,1841768865,1260232239,4091327024,3960309330,3497509347,1814803222,2578018489,4195456072,575138148,3299409036,446754879,3629546796,4011996048,3347532110,3252238545,4270639778,915985419,3483825537,681933534,651868046,2755636671,3828103837,223377554,2607439820,1649704518,3270937875,3901806776,1580087799,4118987695,3198115200,2087309459,2842678573,3016697106,1003007129,2802849917,1860738147,2077965243,164439672,4100872472,32283319,2827177882,1709610350,2125135846,136428751,3874428392,3652904859,3460984630,3572145929,3593056380,2939266226,824852259,818324884,3224740454,930369212,2801566410,2967507152,355706840,1257309336,4148292826,243256656,790073846,2373340630,1296297904,1422699085,3756299780,3818836405,457992840,3099667487,2135319889,77422314,1560382517,1945798516,788204353,1521706781,1385356242,870912086,325965383,2358957921,2050466060,2388260884,2313884476,4006521127,901210569,3990953189,1014646705,1503449823,1062597235,2031621326,3212035895,3931371469,1533017514,350174575,2256028891,2177544179,1052338372,741876788,1606591296,1914052035,213705253,2334669897,1107234197,1899603969,3725069491,2631447780,2422494913,1635502980,1893020342,1950903388,1120974935],eZ=[2807058932,1699970625,2764249623,1586903591,1808481195,1173430173,1487645946,59984867,4199882800,1844882806,1989249228,1277555970,3623636965,3419915562,1149249077,2744104290,1514790577,459744698,244860394,3235995134,1963115311,4027744588,2544078150,4190530515,1608975247,2627016082,2062270317,1507497298,2200818878,567498868,1764313568,3359936201,2305455554,2037970062,1047239e3,1910319033,1337376481,2904027272,2892417312,984907214,1243112415,830661914,861968209,2135253587,2011214180,2927934315,2686254721,731183368,1750626376,4246310725,1820824798,4172763771,3542330227,48394827,2404901663,2871682645,671593195,3254988725,2073724613,145085239,2280796200,2779915199,1790575107,2187128086,472615631,3029510009,4075877127,3802222185,4107101658,3201631749,1646252340,4270507174,1402811438,1436590835,3778151818,3950355702,3963161475,4020912224,2667994737,273792366,2331590177,104699613,95345982,3175501286,2377486676,1560637892,3564045318,369057872,4213447064,3919042237,1137477952,2658625497,1119727848,2340947849,1530455833,4007360968,172466556,266959938,516552836,0,2256734592,3980931627,1890328081,1917742170,4294704398,945164165,3575528878,958871085,3647212047,2787207260,1423022939,775562294,1739656202,3876557655,2530391278,2443058075,3310321856,547512796,1265195639,437656594,3121275539,719700128,3762502690,387781147,218828297,3350065803,2830708150,2848461854,428169201,122466165,3720081049,1627235199,648017665,4122762354,1002783846,2117360635,695634755,3336358691,4234721005,4049844452,3704280881,2232435299,574624663,287343814,612205898,1039717051,840019705,2708326185,793451934,821288114,1391201670,3822090177,376187827,3113855344,1224348052,1679968233,2361698556,1058709744,752375421,2431590963,1321699145,3519142200,2734591178,188127444,2177869557,3727205754,2384911031,3215212461,2648976442,2450346104,3432737375,1180849278,331544205,3102249176,4150144569,2952102595,2159976285,2474404304,766078933,313773861,2570832044,2108100632,1668212892,3145456443,2013908262,418672217,3070356634,2594734927,1852171925,3867060991,3473416636,3907448597,2614737639,919489135,164948639,2094410160,2997825956,590424639,2486224549,1723872674,3157750862,3399941250,3501252752,3625268135,2555048196,3673637356,1343127501,4130281361,3599595085,2957853679,1297403050,81781910,3051593425,2283490410,532201772,1367295589,3926170974,895287692,1953757831,1093597963,492483431,3528626907,1446242576,1192455638,1636604631,209336225,344873464,1015671571,669961897,3375740769,3857572124,2973530695,3747192018,1933530610,3464042516,935293895,3454686199,2858115069,1863638845,3683022916,4085369519,3292445032,875313188,1080017571,3279033885,621591778,1233856572,2504130317,24197544,3017672716,3835484340,3247465558,2220981195,3060847922,1551124588,1463996600],eQ=[4104605777,1097159550,396673818,660510266,2875968315,2638606623,4200115116,3808662347,821712160,1986918061,3430322568,38544885,3856137295,718002117,893681702,1654886325,2975484382,3122358053,3926825029,4274053469,796197571,1290801793,1184342925,3556361835,2405426947,2459735317,1836772287,1381620373,3196267988,1948373848,3764988233,3385345166,3263785589,2390325492,1480485785,3111247143,3780097726,2293045232,548169417,3459953789,3746175075,439452389,1362321559,1400849762,1685577905,1806599355,2174754046,137073913,1214797936,1174215055,3731654548,2079897426,1943217067,1258480242,529487843,1437280870,3945269170,3049390895,3313212038,923313619,679998e3,3215307299,57326082,377642221,3474729866,2041877159,133361907,1776460110,3673476453,96392454,878845905,2801699524,777231668,4082475170,2330014213,4142626212,2213296395,1626319424,1906247262,1846563261,562755902,3708173718,1040559837,3871163981,1418573201,3294430577,114585348,1343618912,2566595609,3186202582,1078185097,3651041127,3896688048,2307622919,425408743,3371096953,2081048481,1108339068,2216610296,0,2156299017,736970802,292596766,1517440620,251657213,2235061775,2933202493,758720310,265905162,1554391400,1532285339,908999204,174567692,1474760595,4002861748,2610011675,3234156416,3693126241,2001430874,303699484,2478443234,2687165888,585122620,454499602,151849742,2345119218,3064510765,514443284,4044981591,1963412655,2581445614,2137062819,19308535,1928707164,1715193156,4219352155,1126790795,600235211,3992742070,3841024952,836553431,1669664834,2535604243,3323011204,1243905413,3141400786,4180808110,698445255,2653899549,2989552604,2253581325,3252932727,3004591147,1891211689,2487810577,3915653703,4237083816,4030667424,2100090966,865136418,1229899655,953270745,3399679628,3557504664,4118925222,2061379749,3079546586,2915017791,983426092,2022837584,1607244650,2118541908,2366882550,3635996816,972512814,3283088770,1568718495,3499326569,3576539503,621982671,2895723464,410887952,2623762152,1002142683,645401037,1494807662,2595684844,1335535747,2507040230,4293295786,3167684641,367585007,3885750714,1865862730,2668221674,2960971305,2763173681,1059270954,2777952454,2724642869,1320957812,2194319100,2429595872,2815956275,77089521,3973773121,3444575871,2448830231,1305906550,4021308739,2857194700,2516901860,3518358430,1787304780,740276417,1699839814,1592394909,2352307457,2272556026,188821243,1729977011,3687994002,274084841,3594982253,3613494426,2701949495,4162096729,322734571,2837966542,1640576439,484830689,1202797690,3537852828,4067639125,349075736,3342319475,4157467219,4255800159,1030690015,1155237496,2951971274,1757691577,607398968,2738905026,499347990,3794078908,1011452712,227885567,2818666809,213114376,3034881240,1455525988,3414450555,850817237,1817998408,3092726480],eX=[0,235474187,470948374,303765277,941896748,908933415,607530554,708780849,1883793496,2118214995,1817866830,1649639237,1215061108,1181045119,1417561698,1517767529,3767586992,4003061179,4236429990,4069246893,3635733660,3602770327,3299278474,3400528769,2430122216,2664543715,2362090238,2193862645,2835123396,2801107407,3035535058,3135740889,3678124923,3576870512,3341394285,3374361702,3810496343,3977675356,4279080257,4043610186,2876494627,2776292904,3076639029,3110650942,2472011535,2640243204,2403728665,2169303058,1001089995,899835584,666464733,699432150,59727847,226906860,530400753,294930682,1273168787,1172967064,1475418501,1509430414,1942435775,2110667444,1876241833,1641816226,2910219766,2743034109,2976151520,3211623147,2505202138,2606453969,2302690252,2269728455,3711829422,3543599269,3240894392,3475313331,3843699074,3943906441,4178062228,4144047775,1306967366,1139781709,1374988112,1610459739,1975683434,2076935265,1775276924,1742315127,1034867998,866637845,566021896,800440835,92987698,193195065,429456164,395441711,1984812685,2017778566,1784663195,1683407248,1315562145,1080094634,1383856311,1551037884,101039829,135050206,437757123,337553864,1042385657,807962610,573804783,742039012,2531067453,2564033334,2328828971,2227573024,2935566865,2700099354,3001755655,3168937228,3868552805,3902563182,4203181171,4102977912,3736164937,3501741890,3265478751,3433712980,1106041591,1340463100,1576976609,1408749034,2043211483,2009195472,1708848333,1809054150,832877231,1068351396,766945465,599762354,159417987,126454664,361929877,463180190,2709260871,2943682380,3178106961,3009879386,2572697195,2538681184,2236228733,2336434550,3509871135,3745345300,3441850377,3274667266,3910161971,3877198648,4110568485,4211818798,2597806476,2497604743,2261089178,2295101073,2733856160,2902087851,3202437046,2968011453,3936291284,3835036895,4136440770,4169408201,3535486456,3702665459,3467192302,3231722213,2051518780,1951317047,1716890410,1750902305,1113818384,1282050075,1584504582,1350078989,168810852,67556463,371049330,404016761,841739592,1008918595,775550814,540080725,3969562369,3801332234,4035489047,4269907996,3569255213,3669462566,3366754619,3332740144,2631065433,2463879762,2160117071,2395588676,2767645557,2868897406,3102011747,3069049960,202008497,33778362,270040487,504459436,875451293,975658646,675039627,641025152,2084704233,1917518562,1615861247,1851332852,1147550661,1248802510,1484005843,1451044056,933301370,967311729,733156972,632953703,260388950,25965917,328671808,496906059,1206477858,1239443753,1543208500,1441952575,2144161806,1908694277,1675577880,1842759443,3610369226,3644379585,3408119516,3307916247,4011190502,3776767469,4077384432,4245618683,2809771154,2842737049,3144396420,3043140495,2673705150,2438237621,2203032232,2370213795],eY=[0,185469197,370938394,487725847,741876788,657861945,975451694,824852259,1483753576,1400783205,1315723890,1164071807,1950903388,2135319889,1649704518,1767536459,2967507152,3152976349,2801566410,2918353863,2631447780,2547432937,2328143614,2177544179,3901806776,3818836405,4270639778,4118987695,3299409036,3483825537,3535072918,3652904859,2077965243,1893020342,1841768865,1724457132,1474502543,1559041666,1107234197,1257309336,598438867,681933534,901210569,1052338372,261314535,77422314,428819965,310463728,3409685355,3224740454,3710368113,3593056380,3875770207,3960309330,4045380933,4195456072,2471224067,2554718734,2237133081,2388260884,3212035895,3028143674,2842678573,2724322336,4138563181,4255350624,3769721975,3955191162,3667219033,3516619604,3431546947,3347532110,2933734917,2782082824,3099667487,3016697106,2196052529,2313884476,2499348523,2683765030,1179510461,1296297904,1347548327,1533017514,1786102409,1635502980,2087309459,2003294622,507358933,355706840,136428751,53458370,839224033,957055980,605657339,790073846,2373340630,2256028891,2607439820,2422494913,2706270690,2856345839,3075636216,3160175349,3573941694,3725069491,3273267108,3356761769,4181598602,4063242375,4011996048,3828103837,1033297158,915985419,730517276,545572369,296679730,446754879,129166120,213705253,1709610350,1860738147,1945798516,2029293177,1239331162,1120974935,1606591296,1422699085,4148292826,4233094615,3781033664,3931371469,3682191598,3497509347,3446004468,3328955385,2939266226,2755636671,3106780840,2988687269,2198438022,2282195339,2501218972,2652609425,1201765386,1286567175,1371368976,1521706781,1805211710,1620529459,2105887268,1988838185,533804130,350174575,164439672,46346101,870912086,954669403,636813900,788204353,2358957921,2274680428,2592523643,2441661558,2695033685,2880240216,3065962831,3182487618,3572145929,3756299780,3270937875,3388507166,4174560061,4091327024,4006521127,3854606378,1014646705,930369212,711349675,560487590,272786309,457992840,106852767,223377554,1678381017,1862534868,1914052035,2031621326,1211247597,1128014560,1580087799,1428173050,32283319,182621114,401639597,486441376,768917123,651868046,1003007129,818324884,1503449823,1385356242,1333838021,1150208456,1973745387,2125135846,1673061617,1756818940,2970356327,3120694122,2802849917,2887651696,2637442643,2520393566,2334669897,2149987652,3917234703,3799141122,4284502037,4100872472,3309594171,3460984630,3545789473,3629546796,2050466060,1899603969,1814803222,1730525723,1443857720,1560382517,1075025698,1260232239,575138148,692707433,878443390,1062597235,243256656,91341917,409198410,325965383,3403100636,3252238545,3704300486,3620022987,3874428392,3990953189,4042459122,4227665663,2460449204,2578018489,2226875310,2411029155,3198115200,3046200461,2827177882,2743944855],e$=[0,218828297,437656594,387781147,875313188,958871085,775562294,590424639,1750626376,1699970625,1917742170,2135253587,1551124588,1367295589,1180849278,1265195639,3501252752,3720081049,3399941250,3350065803,3835484340,3919042237,4270507174,4085369519,3102249176,3051593425,2734591178,2952102595,2361698556,2177869557,2530391278,2614737639,3145456443,3060847922,2708326185,2892417312,2404901663,2187128086,2504130317,2555048196,3542330227,3727205754,3375740769,3292445032,3876557655,3926170974,4246310725,4027744588,1808481195,1723872674,1910319033,2094410160,1608975247,1391201670,1173430173,1224348052,59984867,244860394,428169201,344873464,935293895,984907214,766078933,547512796,1844882806,1627235199,2011214180,2062270317,1507497298,1423022939,1137477952,1321699145,95345982,145085239,532201772,313773861,830661914,1015671571,731183368,648017665,3175501286,2957853679,2807058932,2858115069,2305455554,2220981195,2474404304,2658625497,3575528878,3625268135,3473416636,3254988725,3778151818,3963161475,4213447064,4130281361,3599595085,3683022916,3432737375,3247465558,3802222185,4020912224,4172763771,4122762354,3201631749,3017672716,2764249623,2848461854,2331590177,2280796200,2431590963,2648976442,104699613,188127444,472615631,287343814,840019705,1058709744,671593195,621591778,1852171925,1668212892,1953757831,2037970062,1514790577,1463996600,1080017571,1297403050,3673637356,3623636965,3235995134,3454686199,4007360968,3822090177,4107101658,4190530515,2997825956,3215212461,2830708150,2779915199,2256734592,2340947849,2627016082,2443058075,172466556,122466165,273792366,492483431,1047239e3,861968209,612205898,695634755,1646252340,1863638845,2013908262,1963115311,1446242576,1530455833,1277555970,1093597963,1636604631,1820824798,2073724613,1989249228,1436590835,1487645946,1337376481,1119727848,164948639,81781910,331544205,516552836,1039717051,821288114,669961897,719700128,2973530695,3157750862,2871682645,2787207260,2232435299,2283490410,2667994737,2450346104,3647212047,3564045318,3279033885,3464042516,3980931627,3762502690,4150144569,4199882800,3070356634,3121275539,2904027272,2686254721,2200818878,2384911031,2570832044,2486224549,3747192018,3528626907,3310321856,3359936201,3950355702,3867060991,4049844452,4234721005,1739656202,1790575107,2108100632,1890328081,1402811438,1586903591,1233856572,1149249077,266959938,48394827,369057872,418672217,1002783846,919489135,567498868,752375421,209336225,24197544,376187827,459744698,945164165,895287692,574624663,793451934,1679968233,1764313568,2117360635,1933530610,1343127501,1560637892,1243112415,1192455638,3704280881,3519142200,3336358691,3419915562,3907448597,3857572124,4075877127,4294704398,3029510009,3113855344,2927934315,2744104290,2159976285,2377486676,2594734927,2544078150],e1=[0,151849742,303699484,454499602,607398968,758720310,908999204,1059270954,1214797936,1097159550,1517440620,1400849762,1817998408,1699839814,2118541908,2001430874,2429595872,2581445614,2194319100,2345119218,3034881240,3186202582,2801699524,2951971274,3635996816,3518358430,3399679628,3283088770,4237083816,4118925222,4002861748,3885750714,1002142683,850817237,698445255,548169417,529487843,377642221,227885567,77089521,1943217067,2061379749,1640576439,1757691577,1474760595,1592394909,1174215055,1290801793,2875968315,2724642869,3111247143,2960971305,2405426947,2253581325,2638606623,2487810577,3808662347,3926825029,4044981591,4162096729,3342319475,3459953789,3576539503,3693126241,1986918061,2137062819,1685577905,1836772287,1381620373,1532285339,1078185097,1229899655,1040559837,923313619,740276417,621982671,439452389,322734571,137073913,19308535,3871163981,4021308739,4104605777,4255800159,3263785589,3414450555,3499326569,3651041127,2933202493,2815956275,3167684641,3049390895,2330014213,2213296395,2566595609,2448830231,1305906550,1155237496,1607244650,1455525988,1776460110,1626319424,2079897426,1928707164,96392454,213114376,396673818,514443284,562755902,679998e3,865136418,983426092,3708173718,3557504664,3474729866,3323011204,4180808110,4030667424,3945269170,3794078908,2507040230,2623762152,2272556026,2390325492,2975484382,3092726480,2738905026,2857194700,3973773121,3856137295,4274053469,4157467219,3371096953,3252932727,3673476453,3556361835,2763173681,2915017791,3064510765,3215307299,2156299017,2307622919,2459735317,2610011675,2081048481,1963412655,1846563261,1729977011,1480485785,1362321559,1243905413,1126790795,878845905,1030690015,645401037,796197571,274084841,425408743,38544885,188821243,3613494426,3731654548,3313212038,3430322568,4082475170,4200115116,3780097726,3896688048,2668221674,2516901860,2366882550,2216610296,3141400786,2989552604,2837966542,2687165888,1202797690,1320957812,1437280870,1554391400,1669664834,1787304780,1906247262,2022837584,265905162,114585348,499347990,349075736,736970802,585122620,972512814,821712160,2595684844,2478443234,2293045232,2174754046,3196267988,3079546586,2895723464,2777952454,3537852828,3687994002,3234156416,3385345166,4142626212,4293295786,3841024952,3992742070,174567692,57326082,410887952,292596766,777231668,660510266,1011452712,893681702,1108339068,1258480242,1343618912,1494807662,1715193156,1865862730,1948373848,2100090966,2701949495,2818666809,3004591147,3122358053,2235061775,2352307457,2535604243,2653899549,3915653703,3764988233,4219352155,4067639125,3444575871,3294430577,3746175075,3594982253,836553431,953270745,600235211,718002117,367585007,484830689,133361907,251657213,2041877159,1891211689,1806599355,1654886325,1568718495,1418573201,1335535747,1184342925];function e2(e){return parseInt("".concat(e))===e}function e3(e){if(!e2(e.length))return!1;for(var r=0;r<e.length;r++)if(!e2(e[r])||e[r]<0||e[r]>255)return!1;return!0}function e4(e){return new Uint8Array(e)}function e0(e){var r=[];for(var t=0;t<e.length;t+=4)r.push(e[t]<<24|e[t+1]<<16|e[t+2]<<8|e[t+3]);return r}function e5(e,r){if(e.buffer&&e.name==="Uint8Array")return r&&(e.slice?e=e.slice():e=Array.prototype.slice.call(e)),e;if(Array.isArray(e)){if(!e3(e))throw new Error("Array contains invalid value");return new Uint8Array(e)}if(e2(e.length)&&e3(e))return new Uint8Array(e);throw new Error("unsupported array-like object")}function e7(e,r,t,n,o){(n!=null||o!=null)&&(e.slice?e=e.slice(n,o):e=Array.prototype.slice.call(e,n,o)),r.set(e,t)}var e6=function(){"use strict";function e(r){n(this,e);x(this,"key");x(this,"_Ke");x(this,"_Kd");this.key=e5(r,!0),this._prepare()}a(e,[{key:"_prepare",value:function e(){var e=eL[this.key.length];if(e==null)throw new Error("invalid key size (must be 16, 24 or 32 bytes)");this._Ke=[],this._Kd=[];for(var r=0;r<=e;r++)this._Ke.push([0,0,0,0]),this._Kd.push([0,0,0,0]);var t=(e+1)*4,n=this.key.length/4,o=e0(this.key),i;for(var a=0;a<n;a++)i=a>>2,this._Ke[i][a%4]=o[a],this._Kd[e-i][a%4]=o[a];var s=0,u=n,c;for(;u<t;){if(c=o[n-1],o[0]^=eK[c>>16&255]<<24^eK[c>>8&255]<<16^eK[c&255]<<8^eK[c>>24&255]^eJ[s]<<24,s+=1,n!=8)for(var f=1;f<n;f++)o[f]^=o[f-1];else{for(var l=1;l<n/2;l++)o[l]^=o[l-1];c=o[n/2-1],o[n/2]^=eK[c&255]^eK[c>>8&255]<<8^eK[c>>16&255]<<16^eK[c>>24&255]<<24;for(var p=n/2+1;p<n;p++)o[p]^=o[p-1]}var d=0,v=void 0,h=void 0;for(;d<n&&u<t;)v=u>>2,h=u%4,this._Ke[v][h]=o[d],this._Kd[e-v][h]=o[d++],u++}for(var y=1;y<e;y++)for(var g=0;g<4;g++)c=this._Kd[y][g],this._Kd[y][g]=eX[c>>24&255]^eY[c>>16&255]^e$[c>>8&255]^e1[c&255]}},{key:"encrypt",value:function e(e){if(e.length!=16)throw new Error("invalid plaintext size (must be 16 bytes)");var r=this._Ke.length-1,t=[0,0,0,0],n=e0(e);for(var o=0;o<4;o++)n[o]^=this._Ke[0][o];for(var i=1;i<r;i++){for(var a=0;a<4;a++)t[a]=eV[n[a]>>24&255]^eF[n[(a+1)%4]>>16&255]^ez[n[(a+2)%4]>>8&255]^eW[n[(a+3)%4]&255]^this._Ke[i][a];n=t.slice()}var s=e4(16),u;for(var c=0;c<4;c++)u=this._Ke[r][c],s[4*c]=(eK[n[c]>>24&255]^u>>24)&255,s[4*c+1]=(eK[n[(c+1)%4]>>16&255]^u>>16)&255,s[4*c+2]=(eK[n[(c+2)%4]>>8&255]^u>>8)&255,s[4*c+3]=(eK[n[(c+3)%4]&255]^u)&255;return s}},{key:"decrypt",value:function e(e){if(e.length!=16)throw new Error("invalid ciphertext size (must be 16 bytes)");var r=this._Kd.length-1,t=[0,0,0,0],n=e0(e);for(var o=0;o<4;o++)n[o]^=this._Kd[0][o];for(var i=1;i<r;i++){for(var a=0;a<4;a++)t[a]=eq[n[a]>>24&255]^eG[n[(a+3)%4]>>16&255]^eZ[n[(a+2)%4]>>8&255]^eQ[n[(a+1)%4]&255]^this._Kd[i][a];n=t.slice()}var s=e4(16),u;for(var c=0;c<4;c++)u=this._Kd[r][c],s[4*c]=(eH[n[c]>>24&255]^u>>24)&255,s[4*c+1]=(eH[n[(c+3)%4]>>16&255]^u>>16)&255,s[4*c+2]=(eH[n[(c+2)%4]>>8&255]^u>>8)&255,s[4*c+3]=(eH[n[(c+1)%4]&255]^u)&255;return s}}]);return e}(),e8=function(){"use strict";function e(r,t){n(this,e);x(this,"_aes");x(this,"_lastCipherblock");if(!t)t=new Uint8Array(16);else if(t.length!=16)throw new Error("invalid initialation vector size (must be 16 bytes)");this._lastCipherblock=e5(t,!0),this._aes=new e6(r)}a(e,[{key:"encrypt",value:function e(e){if(e=e5(e),e.length%16!==0)throw new Error("invalid plaintext size (must be multiple of 16 bytes)");var r=e4(e.length),t=e4(16);for(var n=0;n<e.length;n+=16){e7(e,t,0,n,n+16);for(var o=0;o<16;o++)t[o]^=this._lastCipherblock[o];this._lastCipherblock=this._aes.encrypt(t),e7(this._lastCipherblock,r,n)}return r}},{key:"decrypt",value:function e(e){if(e=e5(e),e.length%16!==0)throw new Error("invalid ciphertext size (must be multiple of 16 bytes)");var r=e4(e.length),t=e4(16);for(var n=0;n<e.length;n+=16){e7(e,t,0,n,n+16),t=this._aes.decrypt(t);for(var o=0;o<16;o++)r[n+o]=t[o]^this._lastCipherblock[o];e7(e,this._lastCipherblock,0,n,n+16)}return r}}]);return e}();var e9=[[16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16],[15,15,15,15,15,15,15,15,15,15,15,15,15,15,15],[14,14,14,14,14,14,14,14,14,14,14,14,14,14],[13,13,13,13,13,13,13,13,13,13,13,13,13],[12,12,12,12,12,12,12,12,12,12,12,12],[11,11,11,11,11,11,11,11,11,11,11],[10,10,10,10,10,10,10,10,10,10],[9,9,9,9,9,9,9,9,9],[8,8,8,8,8,8,8,8],[7,7,7,7,7,7,7],[6,6,6,6,6,6],[5,5,5,5,5],[4,4,4,4],[3,3,3],[2,2],[1]],re={pad:function e(e){var r=e9[e.byteLength%16||0],t=new Uint8Array(e.byteLength+r.length);return t.set(e),t.set(r,e.byteLength),t},unpad:function e(e){return e.subarray(0,e.byteLength-e[e.byteLength-1])}};var rr="sha256";function rt(e,r,t){var n=new e8(r,e),o=re.pad(t),i=n.encrypt(o);return new Uint8Array(i)}function rn(e,r,t){var n=new e8(r,e).decrypt(t),o=new Uint8Array(n);return re.unpad(o)}function ro(e,r){var t=hash.hmac(hash_namespaceObject[rr],e).update(r).digest("hex");return ew(t)}function ri(e){for(var r=new Uint8Array(e),t=0;t<e;++t)r[t]=Math.floor(256*Math.random());return eA(r)}function ra(e){var r=ri(e);return eE(r)}function rs(e){var r=(e||256)/8,t=ra(r);return eU(eA(t))}function ru(e,r){var t=ew(e.data),n=ew(e.iv),o=ew(e.hmac),i=eR(o,!1),a=ex(t,n),s=ro(r,a),u=eR(s,!1);return eb(i)===eb(u)}function rc(e,r,t){var n=eE(ek(r)),o=t||rs(128),i=eE(ek(o)),a=eR(i,!1),s=JSON.stringify(e),u=eN(s),c=rt(i,n,u),f=eR(c,!1),l=ex(c,i),p=ro(n,l),d=eR(p,!1);return{data:f,hmac:d,iv:a}}function rf(e,r){var t=eE(ek(r));if(!t)throw new Error("Missing key: required for decryption");if(!ru(e,t))return null;var n=ew(e.data),o=ew(e.iv),i=rn(o,t,n),a=eT(i),s;try{s=JSON.parse(a)}catch(e){return null}return s}function rl(e){var r=null;try{var t=window.localStorage.getItem(e);t&&(r=JSON.parse(t))}catch(e){r=null}return r}function rp(e){try{window.localStorage.removeItem(e)}catch(e){}}function rd(e,r){try{window.localStorage.setItem(e,JSON.stringify(r))}catch(e){}}var rh=function e(){"use strict";var r=this;n(this,e);x(this,"events",new node_modules_eventemitter3);x(this,"on",function(e,t){return r.events.on(e,t)});x(this,"once",function(e,t){return r.events.once(e,t)});x(this,"off",function(e,t){return r.events.off(e,t)});x(this,"removeListener",function(e,t){return r.events.removeListener(e,t)});x(this,"removeAllListeners",function(){return r.events.removeAllListeners()})};var ry={ERROR:0,WARN:1,INFO:2,DEBUG:3},rg=ry.DEBUG,rm={error:function e(){for(var e=arguments.length,r=new Array(e),t=0;t<e;t++){r[t]=arguments[t]}var n;rg>=ry.ERROR&&(n=console).error.apply(n,["[ERROR]"].concat(b(r)))},warn:function e(){for(var e=arguments.length,r=new Array(e),t=0;t<e;t++){r[t]=arguments[t]}var n;rg>=ry.WARN&&(n=console).warn.apply(n,["[WARN]"].concat(b(r)))},info:function e(){for(var e=arguments.length,r=new Array(e),t=0;t<e;t++){r[t]=arguments[t]}var n;rg>=ry.INFO&&(n=console).info.apply(n,["[INFO]"].concat(b(r)))},debug:function e(){for(var e=arguments.length,r=new Array(e),t=0;t<e;t++){r[t]=arguments[t]}var n;rg>=ry.DEBUG&&(n=console).log.apply(n,["[DEBUG]"].concat(b(r)))}};var rb=(typeof window==="undefined"?"undefined":w(window))<"u";function rw(){var e=document.getElementsByTagName("link"),r=[];for(var t=0;t<e.length;t++){var n=e[t],o=n.getAttribute("rel");if(o&&o.toLowerCase().indexOf("icon")>-1){var i=n.getAttribute("href");if(i)if(i.toLowerCase().indexOf("https:")===-1&&i.toLowerCase().indexOf("http:")===-1&&i.indexOf("//")!==0){var a=location.protocol+"//"+location.host;if(i.indexOf("/")===0)a+=i;else{var s=location.pathname.split("/");s.pop();var u=s.join("/");a+=u+"/"+i}r.push(a)}else if(i.indexOf("//")===0){var c=location.protocol+i;r.push(c)}else r.push(i)}}return r}function rR(){var e=function(e){var r=o[e],n=["itemprop","property","name"].map(function(e){return r.getAttribute(e)}).filter(function(e){return e?t.includes(e):!1});if(n.length&&n){var i=r.getAttribute("content");if(i)return{v:i}}};for(var r=arguments.length,t=new Array(r),n=0;n<r;n++){t[n]=arguments[n]}var o=document.getElementsByTagName("meta");for(var i=0;i<o.length;i++){var a=e(i);if(w(a)==="object")return a.v}return""}function rE(){var e=rR("name","og:site_name","og:title","twitter:title");return e||(e=document.title),e}function rO(){return rR("description","og:description","twitter:description","keywords")}function r_(){if(!rb)return;var e=rE(),r=rO(),t=location.origin,n=rw();return{description:r,url:t,icons:n,name:e}}var rA=function e(e){"use strict";c(o,e);var r=_(o);function o(e,i){n(this,o);var a;a=r.call(this,i);x(t(a),"code");a.code=e,Object.setPrototypeOf(t(a),(f(this,o)?this.constructor:void 0).prototype);return a}a(o,[{key:"toString",value:function e(){return"".concat(this.message," (").concat(this.code,")")}}]);return o}(E(Error));var rS={CLOSE_MODAL:{code:100001,message:"[binance-w3w] User closed modal"},REJECT_SESSION:{code:100002,message:"[binance-w3w] User rejected connection"},PROVIDER_NOT_READY:{code:100003,message:"[binance-w3w] Provider is not ready"},CONNECTING:{code:100004,message:"[binance-w3w] Already processing session request. Please wait"},CONNECTED:{code:100005,message:"[binance-w3w] Already connected"}},rx={REJECT_ERR:{code:200001,message:"[binance-w3w] User rejected the operation"},METHOD_NOT_SUPPORT:{code:200002,message:"[binance-w3w] Does not support calling method"},MISSING_RESPONSE:{code:200003,message:"[binance-w3w] Missing JSON RPC response"},INVALID_PARAM:{code:200004,message:"[binance-w3w] Invalid request param"}},rN={INTERNAL_ERR:{code:300001,message:"[binance-w3w] Internal error"}};var rP=function(){return!!(w(window.navigator)>"u"?"":navigator.userAgent).match(/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i)},rT=function(){return!!navigator.userAgent.match(/Android/i)},rC=function(e,r){var t="appId=xoqXxUSMRccLCrZNRebmzj&startPagePath=L3BhZ2VzL2Rhc2hib2FyZC1uZXcvaW5kZXg=";if(r){var n=base64_encodeURI("wc=".concat(encodeURIComponent(r),"&isDeepLink=true&id=").concat(+new Date));t="".concat(t,"&startPageQuery=").concat(n)}var o="//app.binance.com";return e?"bnc:".concat(o,"/mp/app?").concat(t):"https:".concat(o,"/?_dp=").concat(base64_encodeURI("/mp/app?".concat(t)))},rj=function(e){var r=rP(),t=rC(!0,e);if(!r)return;var n=document.createElement("a");n.href=t,document.body.appendChild(n),n.click(),document.body.removeChild(n)};var rD=function(){try{var e,r;return((r=window)===null||r===void 0?void 0:(e=r.ethereum)===null||e===void 0?void 0:e.isBinance)===!0}catch(e){return!1}};//# sourceMappingURL=index.js.map
// EXTERNAL MODULE: ./node_modules/.pnpm/cross-fetch@3.1.8_encoding@0.1.13/node_modules/cross-fetch/dist/browser-ponyfill.js
var browser_ponyfill = __webpack_require__(62541);
;// CONCATENATED MODULE: ./node_modules/.pnpm/@binance+w3w-http-client@1.1.4_encoding@0.1.13/node_modules/@binance/w3w-http-client/dist/index.js
function dist_e(e,t,r,n,i,o,s){try{var u=e[o](s);var a=u.value}catch(e){r(e);return}if(u.done){t(a)}else{Promise.resolve(a).then(n,i)}}function dist_t(t){return function(){var r=this,n=arguments;return new Promise(function(i,o){var s=t.apply(r,n);function u(t){dist_e(s,i,o,u,a,"next",t)}function a(t){dist_e(s,i,o,u,a,"throw",t)}u(undefined)})}}function dist_r(e,t){if(!(e instanceof t)){throw new TypeError("Cannot call a class as a function")}}function dist_n(e,t){for(var r=0;r<t.length;r++){var n=t[r];n.enumerable=n.enumerable||false;n.configurable=true;if("value"in n)n.writable=true;Object.defineProperty(e,n.key,n)}}function dist_i(e,t,r){if(t)dist_n(e.prototype,t);if(r)dist_n(e,r);return e}function dist_o(e,t,r){if(t in e){Object.defineProperty(e,t,{value:r,enumerable:true,configurable:true,writable:true})}else{e[t]=r}return e}function dist_s(e){for(var t=1;t<arguments.length;t++){var r=arguments[t]!=null?arguments[t]:{};var n=Object.keys(r);if(typeof Object.getOwnPropertySymbols==="function"){n=n.concat(Object.getOwnPropertySymbols(r).filter(function(e){return Object.getOwnPropertyDescriptor(r,e).enumerable}))}n.forEach(function(t){dist_o(e,t,r[t])})}return e}function dist_u(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);if(t){n=n.filter(function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable})}r.push.apply(r,n)}return r}function dist_a(e,t){t=t!=null?t:{};if(Object.getOwnPropertyDescriptors){Object.defineProperties(e,Object.getOwnPropertyDescriptors(t))}else{dist_u(Object(t)).forEach(function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(t,r))})}return e}function dist_c(e){"@swc/helpers - typeof";return e&&typeof Symbol!=="undefined"&&e.constructor===Symbol?"symbol":typeof e}function dist_l(e,t){var r,n,i,o,s={label:0,sent:function(){if(i[0]&1)throw i[1];return i[1]},trys:[],ops:[]};return o={next:u(0),"throw":u(1),"return":u(2)},typeof Symbol==="function"&&(o[Symbol.iterator]=function(){return this}),o;function u(e){return function(t){return a([e,t])}}function a(o){if(r)throw new TypeError("Generator is already executing.");while(s)try{if(r=1,n&&(i=o[0]&2?n["return"]:o[0]?n["throw"]||((i=n["return"])&&i.call(n),0):n.next)&&!(i=i.call(n,o[1])).done)return i;if(n=0,i)o=[o[0]&2,i.value];switch(o[0]){case 0:case 1:i=o;break;case 4:s.label++;return{value:o[1],done:false};case 5:s.label++;n=o[1];o=[0];continue;case 7:o=s.ops.pop();s.trys.pop();continue;default:if(!(i=s.trys,i=i.length>0&&i[i.length-1])&&(o[0]===6||o[0]===2)){s=0;continue}if(o[0]===3&&(!i||o[1]>i[0]&&o[1]<i[3])){s.label=o[1];break}if(o[0]===6&&s.label<i[1]){s.label=i[1];i=o;break}if(i&&s.label<i[2]){s.label=i[2];s.ops.push(o);break}if(i[2])s.ops.pop();s.trys.pop();continue}o=t.call(e,s)}catch(e){o=[6,e];n=0}finally{r=i=0}if(o[0]&5)throw o[1];return{value:o[0]?o[1]:void 0,done:true}}}var dist_f=Object.defineProperty;var dist_p=function(e,t,r){return t in e?dist_f(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r};var dist_b=function(e,t,r){return dist_p(e,(typeof t==="undefined"?"undefined":dist_c(t))!="symbol"?t+"":t,r),r};var dist_P={Accept:"application/json","Content-Type":"application/json"},dist_j="POST",dist_k={headers:dist_P,method:dist_j},dist_E=function(){"use strict";function e(t){dist_r(this,e);this.url=t;dist_b(this,"events",new eventemitter3);dist_b(this,"isAvailable",!1);dist_b(this,"registering",!1);if(!ea(t))throw new Error("Provided URL is not compatible with HTTP connection: ".concat(t));this.url=t}dist_i(e,[{key:"connected",get:function e(){return this.isAvailable}},{key:"connecting",get:function e(){return this.registering}},{key:"open",value:function e(){var e=arguments.length>0&&arguments[0]!==void 0?arguments[0]:this.url;var r=this;return dist_t(function(){return dist_l(this,function(t){switch(t.label){case 0:return[4,r.register(e)];case 1:t.sent();return[2]}})})()}},{key:"close",value:function e(){var e=this;return dist_t(function(){return dist_l(this,function(t){if(!e.isAvailable)throw new Error("Connection already closed");e.onClose();return[2]})})()}},{key:"request",value:function e(e){var r=this;return dist_t(function(){var t,n,i,o,u;return dist_l(this,function(c){switch(c.label){case 0:rm.debug("HttpClient ~ request ~ payload:",e);t=r.isAvailable;if(t)return[3,2];return[4,r.register()];case 1:t=c.sent();c.label=2;case 2:t;c.label=3;case 3:c.trys.push([3,6,,7]);n=ed(e);return[4,browser_ponyfill(r.url,dist_a(dist_s({},dist_k),{body:n}))];case 4:return[4,c.sent().json()];case 5:i=c.sent(),o=typeof i=="string"?ep(i):i;return[2,(rm.debug("HttpClient ~ request ~ result:",o),o)];case 6:u=c.sent();return[2,r.formatError(e.id,u)];case 7:return[2]}})})()}},{key:"formatError",value:function e(e,t){var r=this.parseError(t),n=r.message||r.toString();return Q(e,n)}},{key:"register",value:function e(){var e=arguments.length>0&&arguments[0]!==void 0?arguments[0]:this.url;var r=this;return dist_t(function(){var t,n,i;return dist_l(this,function(o){switch(o.label){case 0:if(!ea(e))throw new Error("Provided URL is not compatible with HTTP connection: ".concat(e));if(r.registering)return[2,new Promise(function(e,t){r.events.once("register_error",function(e){t(e)}),r.events.once("open",function(){if(dist_c(r.isAvailable)>"u")return t(new Error("HTTP connection is missing or invalid"));e()})})];r.url=e,r.registering=!0;o.label=1;case 1:o.trys.push([1,3,,4]);t=ed({id:1,jsonrpc:"2.0",method:"test",params:[]});return[4,browser_ponyfill(e,dist_a(dist_s({},dist_k),{body:t}))];case 2:o.sent(),r.onOpen();return[3,4];case 3:n=o.sent();i=r.parseError(n);throw r.events.emit("register_error",i),r.onClose(),i;case 4:return[2]}})})()}},{key:"onOpen",value:function e(){this.isAvailable=!0,this.registering=!1,this.events.emit("open")}},{key:"onClose",value:function e(){this.isAvailable=!1,this.registering=!1,this.events.emit("open")}},{key:"parseError",value:function e(e){var t=arguments.length>1&&arguments[1]!==void 0?arguments[1]:this.url;return z(e,t,"HTTP")}}]);return e}();//# sourceMappingURL=index.js.map
// EXTERNAL MODULE: ./node_modules/.pnpm/react@18.2.0/node_modules/react/index.js
var react = __webpack_require__(79474);
// EXTERNAL MODULE: ./node_modules/.pnpm/react-dom@18.2.0_react@18.2.0/node_modules/react-dom/client.js
var client = __webpack_require__(48088);
;// CONCATENATED MODULE: ./node_modules/.pnpm/qrcode.react@3.1.0_react@18.2.0/node_modules/qrcode.react/lib/esm/index.js
var __defProp = Object.defineProperty;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __objRest = (source, exclude) => {
  var target = {};
  for (var prop in source)
    if (__hasOwnProp.call(source, prop) && exclude.indexOf(prop) < 0)
      target[prop] = source[prop];
  if (source != null && __getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(source)) {
      if (exclude.indexOf(prop) < 0 && __propIsEnum.call(source, prop))
        target[prop] = source[prop];
    }
  return target;
};

// src/index.tsx


// src/third-party/qrcodegen/index.ts
/**
 * @license QR Code generator library (TypeScript)
 * Copyright (c) Project Nayuki.
 * SPDX-License-Identifier: MIT
 */
var qrcodegen;
((qrcodegen2) => {
  const _QrCode = class {
    constructor(version, errorCorrectionLevel, dataCodewords, msk) {
      this.version = version;
      this.errorCorrectionLevel = errorCorrectionLevel;
      this.modules = [];
      this.isFunction = [];
      if (version < _QrCode.MIN_VERSION || version > _QrCode.MAX_VERSION)
        throw new RangeError("Version value out of range");
      if (msk < -1 || msk > 7)
        throw new RangeError("Mask value out of range");
      this.size = version * 4 + 17;
      let row = [];
      for (let i = 0; i < this.size; i++)
        row.push(false);
      for (let i = 0; i < this.size; i++) {
        this.modules.push(row.slice());
        this.isFunction.push(row.slice());
      }
      this.drawFunctionPatterns();
      const allCodewords = this.addEccAndInterleave(dataCodewords);
      this.drawCodewords(allCodewords);
      if (msk == -1) {
        let minPenalty = 1e9;
        for (let i = 0; i < 8; i++) {
          this.applyMask(i);
          this.drawFormatBits(i);
          const penalty = this.getPenaltyScore();
          if (penalty < minPenalty) {
            msk = i;
            minPenalty = penalty;
          }
          this.applyMask(i);
        }
      }
      assert(0 <= msk && msk <= 7);
      this.mask = msk;
      this.applyMask(msk);
      this.drawFormatBits(msk);
      this.isFunction = [];
    }
    static encodeText(text, ecl) {
      const segs = qrcodegen2.QrSegment.makeSegments(text);
      return _QrCode.encodeSegments(segs, ecl);
    }
    static encodeBinary(data, ecl) {
      const seg = qrcodegen2.QrSegment.makeBytes(data);
      return _QrCode.encodeSegments([seg], ecl);
    }
    static encodeSegments(segs, ecl, minVersion = 1, maxVersion = 40, mask = -1, boostEcl = true) {
      if (!(_QrCode.MIN_VERSION <= minVersion && minVersion <= maxVersion && maxVersion <= _QrCode.MAX_VERSION) || mask < -1 || mask > 7)
        throw new RangeError("Invalid value");
      let version;
      let dataUsedBits;
      for (version = minVersion; ; version++) {
        const dataCapacityBits2 = _QrCode.getNumDataCodewords(version, ecl) * 8;
        const usedBits = QrSegment.getTotalBits(segs, version);
        if (usedBits <= dataCapacityBits2) {
          dataUsedBits = usedBits;
          break;
        }
        if (version >= maxVersion)
          throw new RangeError("Data too long");
      }
      for (const newEcl of [_QrCode.Ecc.MEDIUM, _QrCode.Ecc.QUARTILE, _QrCode.Ecc.HIGH]) {
        if (boostEcl && dataUsedBits <= _QrCode.getNumDataCodewords(version, newEcl) * 8)
          ecl = newEcl;
      }
      let bb = [];
      for (const seg of segs) {
        appendBits(seg.mode.modeBits, 4, bb);
        appendBits(seg.numChars, seg.mode.numCharCountBits(version), bb);
        for (const b of seg.getData())
          bb.push(b);
      }
      assert(bb.length == dataUsedBits);
      const dataCapacityBits = _QrCode.getNumDataCodewords(version, ecl) * 8;
      assert(bb.length <= dataCapacityBits);
      appendBits(0, Math.min(4, dataCapacityBits - bb.length), bb);
      appendBits(0, (8 - bb.length % 8) % 8, bb);
      assert(bb.length % 8 == 0);
      for (let padByte = 236; bb.length < dataCapacityBits; padByte ^= 236 ^ 17)
        appendBits(padByte, 8, bb);
      let dataCodewords = [];
      while (dataCodewords.length * 8 < bb.length)
        dataCodewords.push(0);
      bb.forEach((b, i) => dataCodewords[i >>> 3] |= b << 7 - (i & 7));
      return new _QrCode(version, ecl, dataCodewords, mask);
    }
    getModule(x, y) {
      return 0 <= x && x < this.size && 0 <= y && y < this.size && this.modules[y][x];
    }
    getModules() {
      return this.modules;
    }
    drawFunctionPatterns() {
      for (let i = 0; i < this.size; i++) {
        this.setFunctionModule(6, i, i % 2 == 0);
        this.setFunctionModule(i, 6, i % 2 == 0);
      }
      this.drawFinderPattern(3, 3);
      this.drawFinderPattern(this.size - 4, 3);
      this.drawFinderPattern(3, this.size - 4);
      const alignPatPos = this.getAlignmentPatternPositions();
      const numAlign = alignPatPos.length;
      for (let i = 0; i < numAlign; i++) {
        for (let j = 0; j < numAlign; j++) {
          if (!(i == 0 && j == 0 || i == 0 && j == numAlign - 1 || i == numAlign - 1 && j == 0))
            this.drawAlignmentPattern(alignPatPos[i], alignPatPos[j]);
        }
      }
      this.drawFormatBits(0);
      this.drawVersion();
    }
    drawFormatBits(mask) {
      const data = this.errorCorrectionLevel.formatBits << 3 | mask;
      let rem = data;
      for (let i = 0; i < 10; i++)
        rem = rem << 1 ^ (rem >>> 9) * 1335;
      const bits = (data << 10 | rem) ^ 21522;
      assert(bits >>> 15 == 0);
      for (let i = 0; i <= 5; i++)
        this.setFunctionModule(8, i, getBit(bits, i));
      this.setFunctionModule(8, 7, getBit(bits, 6));
      this.setFunctionModule(8, 8, getBit(bits, 7));
      this.setFunctionModule(7, 8, getBit(bits, 8));
      for (let i = 9; i < 15; i++)
        this.setFunctionModule(14 - i, 8, getBit(bits, i));
      for (let i = 0; i < 8; i++)
        this.setFunctionModule(this.size - 1 - i, 8, getBit(bits, i));
      for (let i = 8; i < 15; i++)
        this.setFunctionModule(8, this.size - 15 + i, getBit(bits, i));
      this.setFunctionModule(8, this.size - 8, true);
    }
    drawVersion() {
      if (this.version < 7)
        return;
      let rem = this.version;
      for (let i = 0; i < 12; i++)
        rem = rem << 1 ^ (rem >>> 11) * 7973;
      const bits = this.version << 12 | rem;
      assert(bits >>> 18 == 0);
      for (let i = 0; i < 18; i++) {
        const color = getBit(bits, i);
        const a = this.size - 11 + i % 3;
        const b = Math.floor(i / 3);
        this.setFunctionModule(a, b, color);
        this.setFunctionModule(b, a, color);
      }
    }
    drawFinderPattern(x, y) {
      for (let dy = -4; dy <= 4; dy++) {
        for (let dx = -4; dx <= 4; dx++) {
          const dist = Math.max(Math.abs(dx), Math.abs(dy));
          const xx = x + dx;
          const yy = y + dy;
          if (0 <= xx && xx < this.size && 0 <= yy && yy < this.size)
            this.setFunctionModule(xx, yy, dist != 2 && dist != 4);
        }
      }
    }
    drawAlignmentPattern(x, y) {
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++)
          this.setFunctionModule(x + dx, y + dy, Math.max(Math.abs(dx), Math.abs(dy)) != 1);
      }
    }
    setFunctionModule(x, y, isDark) {
      this.modules[y][x] = isDark;
      this.isFunction[y][x] = true;
    }
    addEccAndInterleave(data) {
      const ver = this.version;
      const ecl = this.errorCorrectionLevel;
      if (data.length != _QrCode.getNumDataCodewords(ver, ecl))
        throw new RangeError("Invalid argument");
      const numBlocks = _QrCode.NUM_ERROR_CORRECTION_BLOCKS[ecl.ordinal][ver];
      const blockEccLen = _QrCode.ECC_CODEWORDS_PER_BLOCK[ecl.ordinal][ver];
      const rawCodewords = Math.floor(_QrCode.getNumRawDataModules(ver) / 8);
      const numShortBlocks = numBlocks - rawCodewords % numBlocks;
      const shortBlockLen = Math.floor(rawCodewords / numBlocks);
      let blocks = [];
      const rsDiv = _QrCode.reedSolomonComputeDivisor(blockEccLen);
      for (let i = 0, k = 0; i < numBlocks; i++) {
        let dat = data.slice(k, k + shortBlockLen - blockEccLen + (i < numShortBlocks ? 0 : 1));
        k += dat.length;
        const ecc = _QrCode.reedSolomonComputeRemainder(dat, rsDiv);
        if (i < numShortBlocks)
          dat.push(0);
        blocks.push(dat.concat(ecc));
      }
      let result = [];
      for (let i = 0; i < blocks[0].length; i++) {
        blocks.forEach((block, j) => {
          if (i != shortBlockLen - blockEccLen || j >= numShortBlocks)
            result.push(block[i]);
        });
      }
      assert(result.length == rawCodewords);
      return result;
    }
    drawCodewords(data) {
      if (data.length != Math.floor(_QrCode.getNumRawDataModules(this.version) / 8))
        throw new RangeError("Invalid argument");
      let i = 0;
      for (let right = this.size - 1; right >= 1; right -= 2) {
        if (right == 6)
          right = 5;
        for (let vert = 0; vert < this.size; vert++) {
          for (let j = 0; j < 2; j++) {
            const x = right - j;
            const upward = (right + 1 & 2) == 0;
            const y = upward ? this.size - 1 - vert : vert;
            if (!this.isFunction[y][x] && i < data.length * 8) {
              this.modules[y][x] = getBit(data[i >>> 3], 7 - (i & 7));
              i++;
            }
          }
        }
      }
      assert(i == data.length * 8);
    }
    applyMask(mask) {
      if (mask < 0 || mask > 7)
        throw new RangeError("Mask value out of range");
      for (let y = 0; y < this.size; y++) {
        for (let x = 0; x < this.size; x++) {
          let invert;
          switch (mask) {
            case 0:
              invert = (x + y) % 2 == 0;
              break;
            case 1:
              invert = y % 2 == 0;
              break;
            case 2:
              invert = x % 3 == 0;
              break;
            case 3:
              invert = (x + y) % 3 == 0;
              break;
            case 4:
              invert = (Math.floor(x / 3) + Math.floor(y / 2)) % 2 == 0;
              break;
            case 5:
              invert = x * y % 2 + x * y % 3 == 0;
              break;
            case 6:
              invert = (x * y % 2 + x * y % 3) % 2 == 0;
              break;
            case 7:
              invert = ((x + y) % 2 + x * y % 3) % 2 == 0;
              break;
            default:
              throw new Error("Unreachable");
          }
          if (!this.isFunction[y][x] && invert)
            this.modules[y][x] = !this.modules[y][x];
        }
      }
    }
    getPenaltyScore() {
      let result = 0;
      for (let y = 0; y < this.size; y++) {
        let runColor = false;
        let runX = 0;
        let runHistory = [0, 0, 0, 0, 0, 0, 0];
        for (let x = 0; x < this.size; x++) {
          if (this.modules[y][x] == runColor) {
            runX++;
            if (runX == 5)
              result += _QrCode.PENALTY_N1;
            else if (runX > 5)
              result++;
          } else {
            this.finderPenaltyAddHistory(runX, runHistory);
            if (!runColor)
              result += this.finderPenaltyCountPatterns(runHistory) * _QrCode.PENALTY_N3;
            runColor = this.modules[y][x];
            runX = 1;
          }
        }
        result += this.finderPenaltyTerminateAndCount(runColor, runX, runHistory) * _QrCode.PENALTY_N3;
      }
      for (let x = 0; x < this.size; x++) {
        let runColor = false;
        let runY = 0;
        let runHistory = [0, 0, 0, 0, 0, 0, 0];
        for (let y = 0; y < this.size; y++) {
          if (this.modules[y][x] == runColor) {
            runY++;
            if (runY == 5)
              result += _QrCode.PENALTY_N1;
            else if (runY > 5)
              result++;
          } else {
            this.finderPenaltyAddHistory(runY, runHistory);
            if (!runColor)
              result += this.finderPenaltyCountPatterns(runHistory) * _QrCode.PENALTY_N3;
            runColor = this.modules[y][x];
            runY = 1;
          }
        }
        result += this.finderPenaltyTerminateAndCount(runColor, runY, runHistory) * _QrCode.PENALTY_N3;
      }
      for (let y = 0; y < this.size - 1; y++) {
        for (let x = 0; x < this.size - 1; x++) {
          const color = this.modules[y][x];
          if (color == this.modules[y][x + 1] && color == this.modules[y + 1][x] && color == this.modules[y + 1][x + 1])
            result += _QrCode.PENALTY_N2;
        }
      }
      let dark = 0;
      for (const row of this.modules)
        dark = row.reduce((sum, color) => sum + (color ? 1 : 0), dark);
      const total = this.size * this.size;
      const k = Math.ceil(Math.abs(dark * 20 - total * 10) / total) - 1;
      assert(0 <= k && k <= 9);
      result += k * _QrCode.PENALTY_N4;
      assert(0 <= result && result <= 2568888);
      return result;
    }
    getAlignmentPatternPositions() {
      if (this.version == 1)
        return [];
      else {
        const numAlign = Math.floor(this.version / 7) + 2;
        const step = this.version == 32 ? 26 : Math.ceil((this.version * 4 + 4) / (numAlign * 2 - 2)) * 2;
        let result = [6];
        for (let pos = this.size - 7; result.length < numAlign; pos -= step)
          result.splice(1, 0, pos);
        return result;
      }
    }
    static getNumRawDataModules(ver) {
      if (ver < _QrCode.MIN_VERSION || ver > _QrCode.MAX_VERSION)
        throw new RangeError("Version number out of range");
      let result = (16 * ver + 128) * ver + 64;
      if (ver >= 2) {
        const numAlign = Math.floor(ver / 7) + 2;
        result -= (25 * numAlign - 10) * numAlign - 55;
        if (ver >= 7)
          result -= 36;
      }
      assert(208 <= result && result <= 29648);
      return result;
    }
    static getNumDataCodewords(ver, ecl) {
      return Math.floor(_QrCode.getNumRawDataModules(ver) / 8) - _QrCode.ECC_CODEWORDS_PER_BLOCK[ecl.ordinal][ver] * _QrCode.NUM_ERROR_CORRECTION_BLOCKS[ecl.ordinal][ver];
    }
    static reedSolomonComputeDivisor(degree) {
      if (degree < 1 || degree > 255)
        throw new RangeError("Degree out of range");
      let result = [];
      for (let i = 0; i < degree - 1; i++)
        result.push(0);
      result.push(1);
      let root = 1;
      for (let i = 0; i < degree; i++) {
        for (let j = 0; j < result.length; j++) {
          result[j] = _QrCode.reedSolomonMultiply(result[j], root);
          if (j + 1 < result.length)
            result[j] ^= result[j + 1];
        }
        root = _QrCode.reedSolomonMultiply(root, 2);
      }
      return result;
    }
    static reedSolomonComputeRemainder(data, divisor) {
      let result = divisor.map((_) => 0);
      for (const b of data) {
        const factor = b ^ result.shift();
        result.push(0);
        divisor.forEach((coef, i) => result[i] ^= _QrCode.reedSolomonMultiply(coef, factor));
      }
      return result;
    }
    static reedSolomonMultiply(x, y) {
      if (x >>> 8 != 0 || y >>> 8 != 0)
        throw new RangeError("Byte out of range");
      let z = 0;
      for (let i = 7; i >= 0; i--) {
        z = z << 1 ^ (z >>> 7) * 285;
        z ^= (y >>> i & 1) * x;
      }
      assert(z >>> 8 == 0);
      return z;
    }
    finderPenaltyCountPatterns(runHistory) {
      const n = runHistory[1];
      assert(n <= this.size * 3);
      const core = n > 0 && runHistory[2] == n && runHistory[3] == n * 3 && runHistory[4] == n && runHistory[5] == n;
      return (core && runHistory[0] >= n * 4 && runHistory[6] >= n ? 1 : 0) + (core && runHistory[6] >= n * 4 && runHistory[0] >= n ? 1 : 0);
    }
    finderPenaltyTerminateAndCount(currentRunColor, currentRunLength, runHistory) {
      if (currentRunColor) {
        this.finderPenaltyAddHistory(currentRunLength, runHistory);
        currentRunLength = 0;
      }
      currentRunLength += this.size;
      this.finderPenaltyAddHistory(currentRunLength, runHistory);
      return this.finderPenaltyCountPatterns(runHistory);
    }
    finderPenaltyAddHistory(currentRunLength, runHistory) {
      if (runHistory[0] == 0)
        currentRunLength += this.size;
      runHistory.pop();
      runHistory.unshift(currentRunLength);
    }
  };
  let QrCode = _QrCode;
  QrCode.MIN_VERSION = 1;
  QrCode.MAX_VERSION = 40;
  QrCode.PENALTY_N1 = 3;
  QrCode.PENALTY_N2 = 3;
  QrCode.PENALTY_N3 = 40;
  QrCode.PENALTY_N4 = 10;
  QrCode.ECC_CODEWORDS_PER_BLOCK = [
    [-1, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
    [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28],
    [-1, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
    [-1, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30]
  ];
  QrCode.NUM_ERROR_CORRECTION_BLOCKS = [
    [-1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25],
    [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49],
    [-1, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68],
    [-1, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81]
  ];
  qrcodegen2.QrCode = QrCode;
  function appendBits(val, len, bb) {
    if (len < 0 || len > 31 || val >>> len != 0)
      throw new RangeError("Value out of range");
    for (let i = len - 1; i >= 0; i--)
      bb.push(val >>> i & 1);
  }
  function getBit(x, i) {
    return (x >>> i & 1) != 0;
  }
  function assert(cond) {
    if (!cond)
      throw new Error("Assertion error");
  }
  const _QrSegment = class {
    constructor(mode, numChars, bitData) {
      this.mode = mode;
      this.numChars = numChars;
      this.bitData = bitData;
      if (numChars < 0)
        throw new RangeError("Invalid argument");
      this.bitData = bitData.slice();
    }
    static makeBytes(data) {
      let bb = [];
      for (const b of data)
        appendBits(b, 8, bb);
      return new _QrSegment(_QrSegment.Mode.BYTE, data.length, bb);
    }
    static makeNumeric(digits) {
      if (!_QrSegment.isNumeric(digits))
        throw new RangeError("String contains non-numeric characters");
      let bb = [];
      for (let i = 0; i < digits.length; ) {
        const n = Math.min(digits.length - i, 3);
        appendBits(parseInt(digits.substr(i, n), 10), n * 3 + 1, bb);
        i += n;
      }
      return new _QrSegment(_QrSegment.Mode.NUMERIC, digits.length, bb);
    }
    static makeAlphanumeric(text) {
      if (!_QrSegment.isAlphanumeric(text))
        throw new RangeError("String contains unencodable characters in alphanumeric mode");
      let bb = [];
      let i;
      for (i = 0; i + 2 <= text.length; i += 2) {
        let temp = _QrSegment.ALPHANUMERIC_CHARSET.indexOf(text.charAt(i)) * 45;
        temp += _QrSegment.ALPHANUMERIC_CHARSET.indexOf(text.charAt(i + 1));
        appendBits(temp, 11, bb);
      }
      if (i < text.length)
        appendBits(_QrSegment.ALPHANUMERIC_CHARSET.indexOf(text.charAt(i)), 6, bb);
      return new _QrSegment(_QrSegment.Mode.ALPHANUMERIC, text.length, bb);
    }
    static makeSegments(text) {
      if (text == "")
        return [];
      else if (_QrSegment.isNumeric(text))
        return [_QrSegment.makeNumeric(text)];
      else if (_QrSegment.isAlphanumeric(text))
        return [_QrSegment.makeAlphanumeric(text)];
      else
        return [_QrSegment.makeBytes(_QrSegment.toUtf8ByteArray(text))];
    }
    static makeEci(assignVal) {
      let bb = [];
      if (assignVal < 0)
        throw new RangeError("ECI assignment value out of range");
      else if (assignVal < 1 << 7)
        appendBits(assignVal, 8, bb);
      else if (assignVal < 1 << 14) {
        appendBits(2, 2, bb);
        appendBits(assignVal, 14, bb);
      } else if (assignVal < 1e6) {
        appendBits(6, 3, bb);
        appendBits(assignVal, 21, bb);
      } else
        throw new RangeError("ECI assignment value out of range");
      return new _QrSegment(_QrSegment.Mode.ECI, 0, bb);
    }
    static isNumeric(text) {
      return _QrSegment.NUMERIC_REGEX.test(text);
    }
    static isAlphanumeric(text) {
      return _QrSegment.ALPHANUMERIC_REGEX.test(text);
    }
    getData() {
      return this.bitData.slice();
    }
    static getTotalBits(segs, version) {
      let result = 0;
      for (const seg of segs) {
        const ccbits = seg.mode.numCharCountBits(version);
        if (seg.numChars >= 1 << ccbits)
          return Infinity;
        result += 4 + ccbits + seg.bitData.length;
      }
      return result;
    }
    static toUtf8ByteArray(str) {
      str = encodeURI(str);
      let result = [];
      for (let i = 0; i < str.length; i++) {
        if (str.charAt(i) != "%")
          result.push(str.charCodeAt(i));
        else {
          result.push(parseInt(str.substr(i + 1, 2), 16));
          i += 2;
        }
      }
      return result;
    }
  };
  let QrSegment = _QrSegment;
  QrSegment.NUMERIC_REGEX = /^[0-9]*$/;
  QrSegment.ALPHANUMERIC_REGEX = /^[A-Z0-9 $%*+.\/:-]*$/;
  QrSegment.ALPHANUMERIC_CHARSET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:";
  qrcodegen2.QrSegment = QrSegment;
})(qrcodegen || (qrcodegen = {}));
((qrcodegen2) => {
  let QrCode;
  ((QrCode2) => {
    const _Ecc = class {
      constructor(ordinal, formatBits) {
        this.ordinal = ordinal;
        this.formatBits = formatBits;
      }
    };
    let Ecc = _Ecc;
    Ecc.LOW = new _Ecc(0, 1);
    Ecc.MEDIUM = new _Ecc(1, 0);
    Ecc.QUARTILE = new _Ecc(2, 3);
    Ecc.HIGH = new _Ecc(3, 2);
    QrCode2.Ecc = Ecc;
  })(QrCode = qrcodegen2.QrCode || (qrcodegen2.QrCode = {}));
})(qrcodegen || (qrcodegen = {}));
((qrcodegen2) => {
  let QrSegment;
  ((QrSegment2) => {
    const _Mode = class {
      constructor(modeBits, numBitsCharCount) {
        this.modeBits = modeBits;
        this.numBitsCharCount = numBitsCharCount;
      }
      numCharCountBits(ver) {
        return this.numBitsCharCount[Math.floor((ver + 7) / 17)];
      }
    };
    let Mode = _Mode;
    Mode.NUMERIC = new _Mode(1, [10, 12, 14]);
    Mode.ALPHANUMERIC = new _Mode(2, [9, 11, 13]);
    Mode.BYTE = new _Mode(4, [8, 16, 16]);
    Mode.KANJI = new _Mode(8, [8, 10, 12]);
    Mode.ECI = new _Mode(7, [0, 0, 0]);
    QrSegment2.Mode = Mode;
  })(QrSegment = qrcodegen2.QrSegment || (qrcodegen2.QrSegment = {}));
})(qrcodegen || (qrcodegen = {}));
var qrcodegen_default = qrcodegen;

// src/index.tsx
/**
 * @license qrcode.react
 * Copyright (c) Paul O'Shannessy
 * SPDX-License-Identifier: ISC
 */
var ERROR_LEVEL_MAP = {
  L: qrcodegen_default.QrCode.Ecc.LOW,
  M: qrcodegen_default.QrCode.Ecc.MEDIUM,
  Q: qrcodegen_default.QrCode.Ecc.QUARTILE,
  H: qrcodegen_default.QrCode.Ecc.HIGH
};
var DEFAULT_SIZE = 128;
var DEFAULT_LEVEL = "L";
var DEFAULT_BGCOLOR = "#FFFFFF";
var DEFAULT_FGCOLOR = "#000000";
var DEFAULT_INCLUDEMARGIN = false;
var MARGIN_SIZE = 4;
var DEFAULT_IMG_SCALE = 0.1;
function generatePath(modules, margin = 0) {
  const ops = [];
  modules.forEach(function(row, y) {
    let start = null;
    row.forEach(function(cell, x) {
      if (!cell && start !== null) {
        ops.push(`M${start + margin} ${y + margin}h${x - start}v1H${start + margin}z`);
        start = null;
        return;
      }
      if (x === row.length - 1) {
        if (!cell) {
          return;
        }
        if (start === null) {
          ops.push(`M${x + margin},${y + margin} h1v1H${x + margin}z`);
        } else {
          ops.push(`M${start + margin},${y + margin} h${x + 1 - start}v1H${start + margin}z`);
        }
        return;
      }
      if (cell && start === null) {
        start = x;
      }
    });
  });
  return ops.join("");
}
function excavateModules(modules, excavation) {
  return modules.slice().map((row, y) => {
    if (y < excavation.y || y >= excavation.y + excavation.h) {
      return row;
    }
    return row.map((cell, x) => {
      if (x < excavation.x || x >= excavation.x + excavation.w) {
        return cell;
      }
      return false;
    });
  });
}
function getImageSettings(cells, size, includeMargin, imageSettings) {
  if (imageSettings == null) {
    return null;
  }
  const margin = includeMargin ? MARGIN_SIZE : 0;
  const numCells = cells.length + margin * 2;
  const defaultSize = Math.floor(size * DEFAULT_IMG_SCALE);
  const scale = numCells / size;
  const w = (imageSettings.width || defaultSize) * scale;
  const h = (imageSettings.height || defaultSize) * scale;
  const x = imageSettings.x == null ? cells.length / 2 - w / 2 : imageSettings.x * scale;
  const y = imageSettings.y == null ? cells.length / 2 - h / 2 : imageSettings.y * scale;
  let excavation = null;
  if (imageSettings.excavate) {
    let floorX = Math.floor(x);
    let floorY = Math.floor(y);
    let ceilW = Math.ceil(w + x - floorX);
    let ceilH = Math.ceil(h + y - floorY);
    excavation = { x: floorX, y: floorY, w: ceilW, h: ceilH };
  }
  return { x, y, h, w, excavation };
}
var SUPPORTS_PATH2D = function() {
  try {
    new Path2D().addPath(new Path2D());
  } catch (e) {
    return false;
  }
  return true;
}();
function QRCodeCanvas(props) {
  const _a = props, {
    value,
    size = DEFAULT_SIZE,
    level = DEFAULT_LEVEL,
    bgColor = DEFAULT_BGCOLOR,
    fgColor = DEFAULT_FGCOLOR,
    includeMargin = DEFAULT_INCLUDEMARGIN,
    style,
    imageSettings
  } = _a, otherProps = __objRest(_a, [
    "value",
    "size",
    "level",
    "bgColor",
    "fgColor",
    "includeMargin",
    "style",
    "imageSettings"
  ]);
  const imgSrc = imageSettings == null ? void 0 : imageSettings.src;
  const _canvas = useRef(null);
  const _image = useRef(null);
  const [isImgLoaded, setIsImageLoaded] = useState(false);
  useEffect(() => {
    if (_canvas.current != null) {
      const canvas = _canvas.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        return;
      }
      let cells = qrcodegen_default.QrCode.encodeText(value, ERROR_LEVEL_MAP[level]).getModules();
      const margin = includeMargin ? MARGIN_SIZE : 0;
      const numCells = cells.length + margin * 2;
      const calculatedImageSettings = getImageSettings(cells, size, includeMargin, imageSettings);
      const image = _image.current;
      const haveImageToRender = calculatedImageSettings != null && image !== null && image.complete && image.naturalHeight !== 0 && image.naturalWidth !== 0;
      if (haveImageToRender) {
        if (calculatedImageSettings.excavation != null) {
          cells = excavateModules(cells, calculatedImageSettings.excavation);
        }
      }
      const pixelRatio = window.devicePixelRatio || 1;
      canvas.height = canvas.width = size * pixelRatio;
      const scale = size / numCells * pixelRatio;
      ctx.scale(scale, scale);
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, numCells, numCells);
      ctx.fillStyle = fgColor;
      if (SUPPORTS_PATH2D) {
        ctx.fill(new Path2D(generatePath(cells, margin)));
      } else {
        cells.forEach(function(row, rdx) {
          row.forEach(function(cell, cdx) {
            if (cell) {
              ctx.fillRect(cdx + margin, rdx + margin, 1, 1);
            }
          });
        });
      }
      if (haveImageToRender) {
        ctx.drawImage(image, calculatedImageSettings.x + margin, calculatedImageSettings.y + margin, calculatedImageSettings.w, calculatedImageSettings.h);
      }
    }
  });
  useEffect(() => {
    setIsImageLoaded(false);
  }, [imgSrc]);
  const canvasStyle = __spreadValues({ height: size, width: size }, style);
  let img = null;
  if (imgSrc != null) {
    img = /* @__PURE__ */ React.createElement("img", {
      src: imgSrc,
      key: imgSrc,
      style: { display: "none" },
      onLoad: () => {
        setIsImageLoaded(true);
      },
      ref: _image
    });
  }
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("canvas", __spreadValues({
    style: canvasStyle,
    height: size,
    width: size,
    ref: _canvas
  }, otherProps)), img);
}
function QRCodeSVG(props) {
  const _a = props, {
    value,
    size = DEFAULT_SIZE,
    level = DEFAULT_LEVEL,
    bgColor = DEFAULT_BGCOLOR,
    fgColor = DEFAULT_FGCOLOR,
    includeMargin = DEFAULT_INCLUDEMARGIN,
    imageSettings
  } = _a, otherProps = __objRest(_a, [
    "value",
    "size",
    "level",
    "bgColor",
    "fgColor",
    "includeMargin",
    "imageSettings"
  ]);
  let cells = qrcodegen_default.QrCode.encodeText(value, ERROR_LEVEL_MAP[level]).getModules();
  const margin = includeMargin ? MARGIN_SIZE : 0;
  const numCells = cells.length + margin * 2;
  const calculatedImageSettings = getImageSettings(cells, size, includeMargin, imageSettings);
  let image = null;
  if (imageSettings != null && calculatedImageSettings != null) {
    if (calculatedImageSettings.excavation != null) {
      cells = excavateModules(cells, calculatedImageSettings.excavation);
    }
    image = /* @__PURE__ */ react.createElement("image", {
      xlinkHref: imageSettings.src,
      height: calculatedImageSettings.h,
      width: calculatedImageSettings.w,
      x: calculatedImageSettings.x + margin,
      y: calculatedImageSettings.y + margin,
      preserveAspectRatio: "none"
    });
  }
  const fgPath = generatePath(cells, margin);
  return /* @__PURE__ */ react.createElement("svg", __spreadValues({
    height: size,
    width: size,
    viewBox: `0 0 ${numCells} ${numCells}`
  }, otherProps), /* @__PURE__ */ react.createElement("path", {
    fill: bgColor,
    d: `M0,0 h${numCells}v${numCells}H0z`,
    shapeRendering: "crispEdges"
  }), /* @__PURE__ */ react.createElement("path", {
    fill: fgColor,
    d: fgPath,
    shapeRendering: "crispEdges"
  }), image);
}
var QRCode = (props) => {
  const _a = props, { renderAs } = _a, otherProps = __objRest(_a, ["renderAs"]);
  if (renderAs === "svg") {
    return /* @__PURE__ */ React.createElement(QRCodeSVG, __spreadValues({}, otherProps));
  }
  return /* @__PURE__ */ React.createElement(QRCodeCanvas, __spreadValues({}, otherProps));
};


;// CONCATENATED MODULE: ./node_modules/.pnpm/@binance+w3w-qrcode-modal@1.1.5_ts-node@10.9.2/node_modules/@binance/w3w-qrcode-modal/dist/index.js
/* provided dependency */ var dist_console = __webpack_require__(65640);
function w3w_qrcode_modal_dist_n(n,e){if(e==null||e>n.length)e=n.length;for(var a=0,t=new Array(e);a<e;a++)t[a]=n[a];return t}function w3w_qrcode_modal_dist_e(n){if(Array.isArray(n))return n}function w3w_qrcode_modal_dist_a(n,e,a,t,i,r,o){try{var d=n[r](o);var l=d.value}catch(n){a(n);return}if(d.done){e(l)}else{Promise.resolve(l).then(t,i)}}function w3w_qrcode_modal_dist_t(n){return function(){var e=this,t=arguments;return new Promise(function(i,r){var o=n.apply(e,t);function d(n){w3w_qrcode_modal_dist_a(o,i,r,d,l,"next",n)}function l(n){w3w_qrcode_modal_dist_a(o,i,r,d,l,"throw",n)}d(undefined)})}}function w3w_qrcode_modal_dist_i(n,e,a){if(e in n){Object.defineProperty(n,e,{value:a,enumerable:true,configurable:true,writable:true})}else{n[e]=a}return n}function w3w_qrcode_modal_dist_r(n,e){var a=n==null?null:typeof Symbol!=="undefined"&&n[Symbol.iterator]||n["@@iterator"];if(a==null)return;var t=[];var i=true;var r=false;var o,d;try{for(a=a.call(n);!(i=(o=a.next()).done);i=true){t.push(o.value);if(e&&t.length===e)break}}catch(n){r=true;d=n}finally{try{if(!i&&a["return"]!=null)a["return"]()}finally{if(r)throw d}}return t}function w3w_qrcode_modal_dist_o(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}function dist_d(n){for(var e=1;e<arguments.length;e++){var a=arguments[e]!=null?arguments[e]:{};var t=Object.keys(a);if(typeof Object.getOwnPropertySymbols==="function"){t=t.concat(Object.getOwnPropertySymbols(a).filter(function(n){return Object.getOwnPropertyDescriptor(a,n).enumerable}))}t.forEach(function(e){w3w_qrcode_modal_dist_i(n,e,a[e])})}return n}function w3w_qrcode_modal_dist_l(n,e){if(n==null)return{};var a=w3w_qrcode_modal_dist_c(n,e);var t,i;if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(n);for(i=0;i<r.length;i++){t=r[i];if(e.indexOf(t)>=0)continue;if(!Object.prototype.propertyIsEnumerable.call(n,t))continue;a[t]=n[t]}}return a}function w3w_qrcode_modal_dist_c(n,e){if(n==null)return{};var a={};var t=Object.keys(n);var i,r;for(r=0;r<t.length;r++){i=t[r];if(e.indexOf(i)>=0)continue;a[i]=n[i]}return a}function w3w_qrcode_modal_dist_s(n,a){return w3w_qrcode_modal_dist_e(n)||w3w_qrcode_modal_dist_r(n,a)||w3w_qrcode_modal_dist_p(n,a)||w3w_qrcode_modal_dist_o()}function w3w_qrcode_modal_dist_p(e,a){if(!e)return;if(typeof e==="string")return w3w_qrcode_modal_dist_n(e,a);var t=Object.prototype.toString.call(e).slice(8,-1);if(t==="Object"&&e.constructor)t=e.constructor.name;if(t==="Map"||t==="Set")return Array.from(t);if(t==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t))return w3w_qrcode_modal_dist_n(e,a)}function w3w_qrcode_modal_dist_u(n,e){var a,t,i,r,o={label:0,sent:function(){if(i[0]&1)throw i[1];return i[1]},trys:[],ops:[]};return r={next:d(0),"throw":d(1),"return":d(2)},typeof Symbol==="function"&&(r[Symbol.iterator]=function(){return this}),r;function d(n){return function(e){return l([n,e])}}function l(r){if(a)throw new TypeError("Generator is already executing.");while(o)try{if(a=1,t&&(i=r[0]&2?t["return"]:r[0]?t["throw"]||((i=t["return"])&&i.call(t),0):t.next)&&!(i=i.call(t,r[1])).done)return i;if(t=0,i)r=[r[0]&2,i.value];switch(r[0]){case 0:case 1:i=r;break;case 4:o.label++;return{value:r[1],done:false};case 5:o.label++;t=r[1];r=[0];continue;case 7:r=o.ops.pop();o.trys.pop();continue;default:if(!(i=o.trys,i=i.length>0&&i[i.length-1])&&(r[0]===6||r[0]===2)){o=0;continue}if(r[0]===3&&(!i||r[1]>i[0]&&r[1]<i[3])){o.label=r[1];break}if(r[0]===6&&o.label<i[1]){o.label=i[1];i=r;break}if(i&&o.label<i[2]){o.label=i[2];o.ops.push(r);break}if(i[2])o.ops.pop();o.trys.pop();continue}r=e.call(n,o)}catch(n){r=[6,n];t=0}finally{a=i=0}if(r[0]&5)throw r[1];return{value:r[0]?r[1]:void 0,done:true}}}var w3w_qrcode_modal_dist_f="#binanceW3W-wrapper :is(.pointer-events-auto) {\n  pointer-events: auto;\n}\n\n#binanceW3W-wrapper :is(.fixed) {\n  position: fixed;\n}\n\n#binanceW3W-wrapper :is(.absolute) {\n  position: absolute;\n}\n\n#binanceW3W-wrapper :is(.relative) {\n  position: relative;\n}\n\n#binanceW3W-wrapper :is(.bottom-0) {\n  bottom: 0px;\n}\n\n#binanceW3W-wrapper :is(.left-0) {\n  left: 0px;\n}\n\n#binanceW3W-wrapper :is(.top-0) {\n  top: 0px;\n}\n\n#binanceW3W-wrapper :is(.m-auto) {\n  margin: auto;\n}\n\n#binanceW3W-wrapper :is(.mx-\\[4px\\]) {\n  margin-left: 4px;\n  margin-right: 4px;\n}\n\n#binanceW3W-wrapper :is(.mb-4) {\n  margin-bottom: 1rem;\n}\n\n#binanceW3W-wrapper :is(.mb-6) {\n  margin-bottom: 1.5rem;\n}\n\n#binanceW3W-wrapper :is(.ml-1) {\n  margin-left: 0.25rem;\n}\n\n#binanceW3W-wrapper :is(.mt-6) {\n  margin-top: 1.5rem;\n}\n\n#binanceW3W-wrapper :is(.mt-\\[35px\\]) {\n  margin-top: 35px;\n}\n\n#binanceW3W-wrapper :is(.flex) {\n  display: flex;\n}\n\n#binanceW3W-wrapper :is(.grid) {\n  display: grid;\n}\n\n#binanceW3W-wrapper :is(.h-\\[200px\\]) {\n  height: 200px;\n}\n\n#binanceW3W-wrapper :is(.h-\\[24px\\]) {\n  height: 24px;\n}\n\n#binanceW3W-wrapper :is(.h-\\[40px\\]) {\n  height: 40px;\n}\n\n#binanceW3W-wrapper :is(.h-\\[52px\\]) {\n  height: 52px;\n}\n\n#binanceW3W-wrapper :is(.h-full) {\n  height: 100%;\n}\n\n#binanceW3W-wrapper :is(.w-\\[150px\\]) {\n  width: 150px;\n}\n\n#binanceW3W-wrapper :is(.w-\\[200px\\]) {\n  width: 200px;\n}\n\n#binanceW3W-wrapper :is(.w-\\[20px\\]) {\n  width: 20px;\n}\n\n#binanceW3W-wrapper :is(.w-\\[24px\\]) {\n  width: 24px;\n}\n\n#binanceW3W-wrapper :is(.w-\\[343px\\]) {\n  width: 343px;\n}\n\n#binanceW3W-wrapper :is(.w-\\[60px\\]) {\n  width: 60px;\n}\n\n#binanceW3W-wrapper :is(.w-\\[75px\\]) {\n  width: 75px;\n}\n\n#binanceW3W-wrapper :is(.w-full) {\n  width: 100%;\n}\n\n#binanceW3W-wrapper :is(.transform) {\n  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));\n}\n\n#binanceW3W-wrapper :is(.cursor-pointer) {\n  cursor: pointer;\n}\n\n#binanceW3W-wrapper :is(.grid-flow-col) {\n  grid-auto-flow: column;\n}\n\n#binanceW3W-wrapper :is(.grid-cols-2) {\n  grid-template-columns: repeat(2, minmax(0, 1fr));\n}\n\n#binanceW3W-wrapper :is(.items-center) {\n  align-items: center;\n}\n\n#binanceW3W-wrapper :is(.justify-end) {\n  justify-content: flex-end;\n}\n\n#binanceW3W-wrapper :is(.justify-center) {\n  justify-content: center;\n}\n\n#binanceW3W-wrapper :is(.justify-between) {\n  justify-content: space-between;\n}\n\n#binanceW3W-wrapper :is(.gap-x-4) {\n  -moz-column-gap: 1rem;\n       column-gap: 1rem;\n}\n\n#binanceW3W-wrapper :is(.gap-y-2) {\n  row-gap: 0.5rem;\n}\n\n#binanceW3W-wrapper :is(.rounded) {\n  border-radius: 0.25rem;\n}\n\n#binanceW3W-wrapper :is(.rounded-2xl) {\n  border-radius: 1rem;\n}\n\n#binanceW3W-wrapper :is(.rounded-lg) {\n  border-radius: 0.5rem;\n}\n\n#binanceW3W-wrapper :is(.rounded-t-2xl) {\n  border-top-left-radius: 1rem;\n  border-top-right-radius: 1rem;\n}\n\n#binanceW3W-wrapper :is(.border) {\n  border-width: 1px;\n}\n\n#binanceW3W-wrapper :is(.border-b) {\n  border-bottom-width: 1px;\n}\n\n#binanceW3W-wrapper :is(.border-gray-300) {\n  --tw-border-opacity: 1;\n  border-color: rgb(209 213 219 / var(--tw-border-opacity));\n}\n\n#binanceW3W-wrapper :is(.bg-black\\/\\[\\.80\\]) {\n  background-color: rgb(0 0 0 / .80);\n}\n\n#binanceW3W-wrapper :is(.bg-white) {\n  --tw-bg-opacity: 1;\n  background-color: rgb(255 255 255 / var(--tw-bg-opacity));\n}\n\n#binanceW3W-wrapper :is(.p-\\[12px\\]) {\n  padding: 12px;\n}\n\n#binanceW3W-wrapper :is(.px-4) {\n  padding-left: 1rem;\n  padding-right: 1rem;\n}\n\n#binanceW3W-wrapper :is(.px-6) {\n  padding-left: 1.5rem;\n  padding-right: 1.5rem;\n}\n\n#binanceW3W-wrapper :is(.py-3) {\n  padding-top: 0.75rem;\n  padding-bottom: 0.75rem;\n}\n\n#binanceW3W-wrapper :is(.py-4) {\n  padding-top: 1rem;\n  padding-bottom: 1rem;\n}\n\n#binanceW3W-wrapper :is(.pb-6) {\n  padding-bottom: 1.5rem;\n}\n\n#binanceW3W-wrapper :is(.pt-\\[20px\\]) {\n  padding-top: 20px;\n}\n\n#binanceW3W-wrapper :is(.text-center) {\n  text-align: center;\n}\n\n#binanceW3W-wrapper :is(.text-base) {\n  font-size: 1rem;\n  line-height: 1.5rem;\n}\n\n#binanceW3W-wrapper :is(.font-medium) {\n  font-weight: 500;\n}\n\n#binanceW3W-wrapper :is(.text-\\[\\#1E2329\\]) {\n  --tw-text-opacity: 1;\n  color: rgb(30 35 41 / var(--tw-text-opacity));\n}\n\n#binanceW3W-wrapper :is(.text-\\[\\#929AA5\\]) {\n  --tw-text-opacity: 1;\n  color: rgb(146 154 165 / var(--tw-text-opacity));\n}\n\n#binanceW3W-wrapper :is(.shadow-inner) {\n  --tw-shadow: inset 0 2px 4px 0 rgb(0 0 0 / 0.05);\n  --tw-shadow-colored: inset 0 2px 4px 0 var(--tw-shadow-color);\n  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);\n}\n\n#binanceW3W-wrapper :is(.duration-300) {\n  transition-duration: 300ms;\n}\n\n#binanceW3W-wrapper :is(.ease-in-out) {\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n}\n\n#binanceW3W-wrapper :is(.will-change-auto) {\n  will-change: auto;\n}\n\n#binanceW3W-wrapper :is(.will-change-transform) {\n  will-change: transform;\n}\n\n.w3w-body3 {\n  font-size: 14px;\n  font-style: normal;\n  font-weight: 400;\n  line-height: 20px;\n}\n\n.w3w-subtitle1 {\n  font-size: 20px;\n  font-style: normal;\n  font-weight: 600;\n  line-height: 28px;\n}\n\n.w3w-subtitle3 {\n  font-size: 16px;\n  font-style: normal;\n  font-weight: 500;\n  line-height: 24px;\n  /* 150% */\n}\n\n.w3w-caption2 {\n  font-size: 12px;\n  font-style: normal;\n  font-weight: 400;\n  line-height: 16px;\n}\n\n.w3w-t-black {\n  color: #0b0e11;\n}\n\n.w3w-t-brand {\n  color: #c99400;\n}\n\n.w3w-t-primary {\n  color: #202630;\n}\n\n.w3w-t-secondary {\n  color: #474d57;\n}\n\n.w3w-bg-primary {\n  background: #fcd535;\n}\n\n@media (min-width: 768px) {\n  .md\\:w3w-subtitle1 {\n    font-size: 20px;\n    font-style: normal;\n    font-weight: 600;\n    line-height: 28px;\n  }\n\n  #binanceW3W-wrapper :is(.md\\:w-\\[400px\\]) {\n    width: 400px;\n  }\n\n  #binanceW3W-wrapper :is(.md\\:font-semibold) {\n    font-weight: 600;\n  }\n}\n\n@media (min-width: 1024px) {\n  #binanceW3W-wrapper :is(.lg\\:p-8) {\n    padding: 2rem;\n  }\n\n  #binanceW3W-wrapper :is(.lg\\:pt-6) {\n    padding-top: 1.5rem;\n  }\n\n  #binanceW3W-wrapper :is(.lg\\:text-xl) {\n    font-size: 1.25rem;\n    line-height: 1.75rem;\n  }\n}\n";var w3w_qrcode_modal_dist_b="\n".concat(w3w_qrcode_modal_dist_f,"\n\n:root {\n  --animation-duration: 300ms;\n}\n\n@keyframes w3w-fadeIn {\n  from {\n    opacity: 0;\n  }\n  to {\n    opacity: 1;\n  }\n}\n\n@keyframes w3w-fadeOut {\n  from {\n    opacity: 1;\n  }\n  to {\n    opacity: 0;\n  }\n}\n\n.w3w-animated {\n  animation-duration: var(--animation-duration);\n  animation-fill-mode: both;\n}\n\n.w3w-fadeIn {\n  animation-name: w3w-fadeIn;\n}\n\n.w3w-fadeOut {\n  animation-name: w3w-fadeOut;\n}\n\n#binanceW3W-wrapper {\n  -webkit-user-select: none;\n  align-items: center;\n  display: flex;\n  height: 100%;\n  justify-content: center;\n  left: 0;\n  pointer-events: none;\n  position: fixed;\n  top: 0;\n  user-select: none;\n  width: 100%;\n  z-index: 99999999999999;\n}\n");var dist_h=(0,react.createContext)({}),dist_y=function(){return (0,react.useContext)(dist_h)};var dist_C="binanceW3W-wrapper",dist_A="binanceW3W-qrcode-modal",dist_M={googlePlay:"https://app.appsflyer.com/com.binance.dev?pid=https%3A%2F%2Fwww.binance.com%2Fen&c=https%3A%2F%2Fwww.binance.com%2Fen",appleStore:"https://app.appsflyer.com/id1436799971?pid=https%3A%2F%2Fwww.binance.com%2Fen&c=https%3A%2F%2Fwww.binance.com%2Fen"},dist_S="PHN2ZyB3aWR0aD0iNTYiIGhlaWdodD0iNTYiIHZpZXdCb3g9IjAgMCA1NiA1NiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3QgeD0iMiIgeT0iMiIgd2lkdGg9IjUyIiBoZWlnaHQ9IjUyIiByeD0iMTAiIGZpbGw9IiMxNDE1MUEiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iNCIvPgo8cGF0aCBkPSJNMTIgMjhMMTUuNjEyOSAyNC4zODcxTDE5LjIyNTggMjhMMTUuNjEyOSAzMS42MTI5TDEyIDI4WiIgZmlsbD0iI0YwQjkwQiIvPgo8cGF0aCBkPSJNMTguMTkzNSAyMS44MDY1TDI4IDEyTDM3LjgwNjUgMjEuODA2NUwzNC4xOTM2IDI1LjQxOTRMMjggMTkuMjI1OEwyMS44MDY1IDI1LjQxOTRMMTguMTkzNSAyMS44MDY1WiIgZmlsbD0iI0YwQjkwQiIvPgo8cGF0aCBkPSJNMjQuMzg3MSAyOEwyOCAyNC4zODcxTDMxLjYxMjkgMjhMMjggMzEuNjEyOUwyNC4zODcxIDI4WiIgZmlsbD0iI0YwQjkwQiIvPgo8cGF0aCBkPSJNMjEuODA2NSAzMC41ODA2TDE4LjE5MzUgMzQuMTkzNUwyOCA0NEwzNy44MDY1IDM0LjE5MzVMMzQuMTkzNiAzMC41ODA2TDI4IDM2Ljc3NDJMMjEuODA2NSAzMC41ODA2WiIgZmlsbD0iI0YwQjkwQiIvPgo8cGF0aCBkPSJNMzYuNzc0MiAyOEw0MC4zODcxIDI0LjM4NzFMNDQgMjhMNDAuMzg3MSAzMS42MTI5TDM2Ljc3NDIgMjhaIiBmaWxsPSIjRjBCOTBCIi8+Cjwvc3ZnPgo=",dist_I="data:image/svg+xml;base64,".concat(dist_S);var dist_z=function(){var n=w3w_qrcode_modal_dist_s((0,react.useState)(),2),e=n[0],a=n[1],t=w3w_qrcode_modal_dist_s((0,react.useState)(!1),2),i=t[0],r=t[1];return (0,react.useEffect)(function(){var n=rP(),e=rT();a(n),r(e)},[]),{isMobile:e,isAndroid:i}};var w3w_qrcode_modal_dist_P=["en","ar","bg-BG","zh-CN","zh-TW","cs-CZ","fr-FR","de-DE","el-GR","id-ID","it-IT","kk-KZ","lv-LV","pl-PL","pt-BR","pt-PT","ro-RO","ru-RU","sk-SK","sl-SI","es-LA","es-ES","sv-SE","tr-TR","uk-UA","vi-VN","da-DK","my-MM","lo-LA","si-LK"];var dist_H={"sdk-download-android":"تنزيل لنظام Android","sdk-connect":"اتصال","sdk-download-ios":"تنزيل لنظام iOS","sdk-install":"تثبيت","sdk-modal-instruct-1":"1. افتح تطبيق Binance","sdk-modal-instruct-2":"2. اضغط {{icon}} على الشاشة الرئيسية","sdk-modal-title":"الربط مع Binance (بينانس)","sdk-no-app":"ليس لديك تطبيق Binance حتّى الآن؟"};var dist_F={"sdk-download-android":"Изтегляне за Android","sdk-connect":"Свържи","sdk-download-ios":"Изтегляне за iOS","sdk-install":"Инсталиране","sdk-modal-instruct-1":"1. Отворете приложението Binance","sdk-modal-instruct-2":"2. Докоснете {{icon}} на началния екран","sdk-modal-title":"Свържете се с Binance","sdk-no-app":"Все още нямате приложението Binance?"};var dist_Z={"sdk-download-android":"St\xe1hnout pro Android","sdk-connect":"Připojit","sdk-download-ios":"St\xe1hnout pro iOS","sdk-install":"Instalovat","sdk-modal-instruct-1":"1. Otevřete aplikaci Binance","sdk-modal-instruct-2":"2. Klepněte na {{icon}} na domovsk\xe9 obrazovce","sdk-modal-title":"Připojit platformu Binance","sdk-no-app":"Ještě nem\xe1te aplikaci Binance?"};var dist_V={"sdk-download-android":"Download til Android","sdk-connect":"Forbind","sdk-download-ios":"Download til iOS","sdk-install":"Installer","sdk-modal-instruct-1":"1. \xc5bn Binance-appen","sdk-modal-instruct-2":"2. Tryk p\xe5 {{icon}} p\xe5 startsk\xe6rmen","sdk-modal-title":"Forbind til Binance","sdk-no-app":"Har du ikke Binance-appen endnu?"};var dist_R={"sdk-download-android":"F\xfcr Android herunterladen","sdk-connect":"Verbinden","sdk-download-ios":"F\xfcr iOS herunterladen","sdk-install":"Installieren","sdk-modal-instruct-1":"1. Binance-App \xf6ffnen","sdk-modal-instruct-2":"2. Tippe auf dem Startbildschirm auf {{icon}}","sdk-modal-title":"Mit Binance verkn\xfcpfen","sdk-no-app":"Du hast die Binance-App noch nicht?"};var dist_U={"sdk-download-android":"Λήψη για Android","sdk-connect":"Συνδεθείτε","sdk-download-ios":"Λήψη για iOS","sdk-install":"Εγκατάσταση","sdk-modal-instruct-1":"1. Ανοίξτε την εφαρμογή Binance","sdk-modal-instruct-2":"2. Πατήστε {{icon}} στην αρχική οθόνη","sdk-modal-title":"Συνδεθείτε με την Binance","sdk-no-app":"Δεν έχετε ακόμα την εφαρμογή Binance;"};var dist_Q={"sdk-download-android":"Download for Android","sdk-connect":"Connect","sdk-download-ios":"Download for iOS","sdk-install":"Install","sdk-modal-instruct-1":"1. Open Binance app","sdk-modal-instruct-2":"2. Tap {{icon}} on Home Screen","sdk-modal-title":"Connect With Binance","sdk-no-app":"Don’t have the Binance app yet?"};var dist_G={"sdk-download-android":"Descargar para Android","sdk-connect":"Conectar","sdk-download-ios":"Descargar para iOS","sdk-install":"Instalar","sdk-modal-instruct-1":"1. Open Binance app","sdk-modal-instruct-2":"2. Pulsa en {{icon}} en la p\xe1gina principal","sdk-modal-title":"Connect With Binance","sdk-no-app":"\xbfA\xfan no tienes la aplicaci\xf3n de Binance?"};var dist_Y={"sdk-download-android":"Descargar para Android","sdk-connect":"Conecta","sdk-download-ios":"Descargar para iOS","sdk-install":"Instala","sdk-modal-instruct-1":"1. Abre la aplicaci\xf3n de Binance","sdk-modal-instruct-2":"2. Toca {{icon}} en la pantalla de inicio","sdk-modal-title":"Conectar con Binance","sdk-no-app":"\xbfA\xfan no tienes la aplicaci\xf3n de Binance?"};var dist_K={"sdk-download-android":"T\xe9l\xe9charger pour Android","sdk-connect":"Se connecter","sdk-download-ios":"T\xe9l\xe9charger pour iOS","sdk-install":"Installer","sdk-modal-instruct-1":"1. Ouvrez l’application de Binance","sdk-modal-instruct-2":"2. Appuyez sur {{icon}} sur l’\xe9cran d’accueil","sdk-modal-title":"Se connecter \xe0 Binance","sdk-no-app":"Vous n’avez pas encore l’application de Binance\xa0?"};var dist_J={"sdk-download-android":"Unduh untuk Android","sdk-connect":"Terhubung","sdk-download-ios":"Unduh untuk iOS","sdk-install":"Instal","sdk-modal-instruct-1":"1. Buka aplikasi Binance","sdk-modal-instruct-2":"2. Ketuk {{icon}} di Layar Beranda","sdk-modal-title":"Hubungkan dengan Binance","sdk-no-app":"Belum punya aplikasi Binance?"};var dist_q={"sdk-download-android":"Scarica per Android","sdk-connect":"Collega","sdk-download-ios":"Scarica per iOS","sdk-install":"Installa","sdk-modal-instruct-1":"1. Apri l'app Binance","sdk-modal-instruct-2":"2. Tocca {{icon}} nella homepage","sdk-modal-title":"Collega con Binance","sdk-no-app":"Non hai ancora l'app Binance?"};var dist_={"sdk-download-android":"Android үшін жүктеп алу","sdk-connect":"Қосылу","sdk-download-ios":"iOS үшін жүктеп алу","sdk-install":"Орнату","sdk-modal-instruct-1":"1. Binance қолданбасын ашыңыз","sdk-modal-instruct-2":"2. Басты экрандағы {{icon}} белгішесін түртіңіз","sdk-modal-title":"Binance платформасымен байланыстыру","sdk-no-app":"Сізде әлі Binance қолданбасы жоқ па?"};var dist_X={"sdk-download-android":"ດາວໂຫຼດສໍາລັບ Android","sdk-connect":"ເຊື່ອມຕໍ່","sdk-download-ios":"ດາວໂຫຼດສໍາລັບ iOS","sdk-install":"ຕິດຕັ້ງ","sdk-modal-instruct-1":"1. ເປີດແອັບ Binance","sdk-modal-instruct-2":"2. ແຕະ {{icon}} ໃນໜ້າຈໍຫຼັກ","sdk-modal-title":"ເຊື່ອມຕໍ່ກັບ Binance","sdk-no-app":"ຍັງບໍ່ມີແອັບ Binance ເທື່ອບໍ?"};var dist_$={"sdk-download-android":"Lejupielādēt Android ierīcei","sdk-connect":"Savienot","sdk-download-ios":"Lejupielādēt iOS ierīcei","sdk-install":"Instalēt","sdk-modal-instruct-1":"1.\xa0Atver Binance lietotni","sdk-modal-instruct-2":"2.\xa0Pieskaries pie {{icon}} sākuma ekrānā","sdk-modal-title":"Savieno ar Binance","sdk-no-app":"Vai tev vēl nav Binance lietotnes?"};var nn={"sdk-download-android":"အန်းဒရွိုက်အတွက် ဒေါင်းလုဒ်လုပ်မည်","sdk-connect":"ချိတ်ဆက်မည်","sdk-download-ios":"iOS အတွက် ဒေါင်းလုဒ်လုပ်မည်","sdk-install":"ထည့်သွင်းမည်","sdk-modal-instruct-1":"1. Open Binance app","sdk-modal-instruct-2":"ပင်မမျက်နှာပြင်မှ {{icon}} ကိုနှိပ်ပါ။","sdk-modal-title":"Connect With Binance","sdk-no-app":"Binance App မရှိသေးဘူးလား။"};var ne={"sdk-download-android":"Pobierz na Androida","sdk-connect":"Połącz","sdk-download-ios":"Pobierz na iOS","sdk-install":"Zainstaluj","sdk-modal-instruct-1":"1. Otw\xf3rz Aplikację Binance","sdk-modal-instruct-2":"2. Kliknij {{icon}} na ekranie gł\xf3wnym","sdk-modal-title":"Połącz z Binance","sdk-no-app":"Nie masz jeszcze aplikacji Binance?"};var na={"sdk-download-android":"Baixar para Android","sdk-connect":"Conecte","sdk-download-ios":"Baixar para iOS","sdk-install":"Instalar","sdk-modal-instruct-1":"1. Abra o Aplicativo da Binance","sdk-modal-instruct-2":"2. Toque em {{icon}} na Tela Inicial","sdk-modal-title":"Conectar com a Binance","sdk-no-app":"Ainda n\xe3o tem o aplicativo da Binance?"};var nt={"sdk-download-android":"Transferir para Android","sdk-connect":"Associar","sdk-download-ios":"Transferir para iOS","sdk-install":"Instalar","sdk-modal-instruct-1":"1. Abre a aplica\xe7\xe3o Binance","sdk-modal-instruct-2":"2. Toca em {{icon}} no Ecr\xe3 Inicial","sdk-modal-title":"Associa com a Binance","sdk-no-app":"Ainda n\xe3o tens a aplica\xe7\xe3o Binance?"};var ni={"sdk-download-android":"Descărcați pentru Android","sdk-connect":"Conectare","sdk-download-ios":"Descărcați pentru iOS","sdk-install":"Instalați","sdk-modal-instruct-1":"1. Deschideți aplicația Binance","sdk-modal-instruct-2":"2. Atingeți {{icon}} pe ecranul de pornire","sdk-modal-title":"Conectați-vă cu Binance","sdk-no-app":"Nu aveți \xeencă aplicația Binance?"};var nr={"sdk-download-android":"Скачать для Android","sdk-connect":"Подключить","sdk-download-ios":"Скачать для iOS","sdk-install":"Установить","sdk-modal-instruct-1":"1. Откройте приложение Binance","sdk-modal-instruct-2":"2. Нажмите {{icon}} на главном экране","sdk-modal-title":"Подключить кошелек Binance","sdk-no-app":"У вас еще нет приложения Binance?"};var no={"sdk-download-android":"Android සඳහා බාගත කරන්න","sdk-connect":"සම්බන්ධ කරන්න","sdk-download-ios":"iOS සඳහා බාගත කරන්න","sdk-install":"ස්ථාපනය කරන්න","sdk-modal-instruct-1":"1. Binance යෙදුම විවෘත කරන්න","sdk-modal-instruct-2":"2. මුල් තිරයේ {{icon}} මත තට්ටු කරන්න","sdk-modal-title":"Binance සමග සම්බන්ධ වන්න","sdk-no-app":"තවමත් Binance යෙදුම නැති ද?"};var nd={"sdk-download-android":"Stiahnuť pre Android","sdk-connect":"Pripojiť","sdk-download-ios":"Stiahnuť pre iOS","sdk-install":"Nainštalovať","sdk-modal-instruct-1":"1. Otvorte aplik\xe1ciu Binance","sdk-modal-instruct-2":"2. Klepnite na ikonu {{icon}} na domovskej obrazovke","sdk-modal-title":"Spojte sa s\xa0Binance","sdk-no-app":"Ešte nem\xe1te aplik\xe1ciu Binance?"};var nl={"sdk-download-android":"Prenos za Android","sdk-connect":"Poveži","sdk-download-ios":"Prenos za iOS","sdk-install":"Namesti","sdk-modal-instruct-1":"1. Odprite aplikacijo Binance","sdk-modal-instruct-2":"2. Tapnite {{icon}} na začetnem zaslonu","sdk-modal-title":"Povežite se s platformo Binance","sdk-no-app":"Še nimate aplikacije Binance?"};var nc={"sdk-download-android":"Ladda ned f\xf6r Android","sdk-connect":"Anslut","sdk-download-ios":"Ladda ned f\xf6r iOS","sdk-install":"Installera","sdk-modal-instruct-1":"1. \xd6ppna Binance-appen","sdk-modal-instruct-2":"2. Tryck p\xe5 {{icon}} p\xe5 startsk\xe4rmen","sdk-modal-title":"Anslut med Binance","sdk-no-app":"Har du inte Binance-appen \xe4nnu?"};var ns={"sdk-download-android":"Android i\xe7in indir","sdk-connect":"Bağlan","sdk-download-ios":"iOS i\xe7in indir","sdk-install":"Y\xfckle","sdk-modal-instruct-1":"1. Binance Uygulamasını A\xe7ın","sdk-modal-instruct-2":"2. Ana Ekranda {{icon}} simgesine dokunun","sdk-modal-title":"Binance ile Bağlanın","sdk-no-app":"Hen\xfcz Binance uygulamanız yok mu?"};var np={"sdk-download-android":"Завантажити для Android","sdk-connect":"Підключитись","sdk-download-ios":"Завантажити для iOS","sdk-install":"Встановити","sdk-modal-instruct-1":"1. Відкрийте застосунок Binance","sdk-modal-instruct-2":"2. Торкніться {{icon}} на головному екрані","sdk-modal-title":"Підключіться до Binance","sdk-no-app":"Ще не маєте застосунку Binance?"};var nu={"sdk-download-android":"Tải xuống cho Android","sdk-connect":"Kết nối","sdk-download-ios":"Tải xuống cho iOS","sdk-install":"C\xe0i đặt","sdk-modal-instruct-1":"1. Mở ứng dụng Binance","sdk-modal-instruct-2":"2. Nhấn v\xe0o {{icon}} tr\xean M\xe0n h\xecnh ch\xednh","sdk-modal-title":"Kết nối với Binance","sdk-no-app":"Bạn chưa c\xf3 ứng dụng Binance?"};var nm={"sdk-download-android":"下载安卓版","sdk-connect":"关联","sdk-download-ios":"下载iOS版","sdk-install":"安装","sdk-modal-instruct-1":"1.打开币安App","sdk-modal-instruct-2":"2.点击主屏幕的{{icon}}","sdk-modal-title":"关联币安","sdk-no-app":"尚未安装币安App？"};var nw={"sdk-download-android":"Android 下載","sdk-connect":"連接","sdk-download-ios":"iOS 下載","sdk-install":"安裝","sdk-modal-instruct-1":"1. 開啟幣安 App","sdk-modal-instruct-2":"2. 在首頁畫面上點擊 {{icon}}","sdk-modal-title":"與幣安連接","sdk-no-app":"還沒有幣安 App 嗎？"};var nk={en:dist_Q,ar:dist_H,"bg-BG":dist_F,"zh-CN":nm,"zh-TW":nw,"cs-CZ":dist_Z,"fr-FR":dist_K,"de-DE":dist_R,"el-GR":dist_U,"id-ID":dist_J,"it-IT":dist_q,"kk-KZ":dist_,"lv-LV":dist_$,"pl-PL":ne,"pt-BR":na,"pt-PT":nt,"ro-RO":ni,"ru-RU":nr,"sk-SK":nd,"sl-SI":nl,"es-LA":dist_Y,"es-ES":dist_G,"sv-SE":nc,"tr-TR":ns,"uk-UA":np,"vi-VN":nu,"da-DK":dist_V,"my-MM":nn,"lo-LA":dist_X,"si-LK":no};var nf=w3w_qrcode_modal_dist_P.reduce(function(n,e){return n[e]=nk[e],n},{}),nb=nf;var nv=function(){var n=dist_y(),e=n.lng;return (0,react.useCallback)(function(n,a){var t,i;return(nb===null||nb===void 0?void 0:(t=nb[e])===null||t===void 0?void 0:t[n])||(nb===null||nb===void 0?void 0:(i=nb.en)===null||i===void 0?void 0:i[n])||(a===null||a===void 0?void 0:a.default)||n},[e])},ng=nv;var nx=function(n){var e=n.size,a=e===void 0?24:e,t=n.color,i=t===void 0?"currentColor":t,r=n.className,o=n.children,c=w3w_qrcode_modal_dist_l(n,["size","color","className","children"]);return react.createElement("svg",dist_d({width:a,height:a,fill:i,className:r,viewBox:"0 0 24 24",xmlns:"http://www.w3.org/2000/svg"},c),o)},nW=nx;var nB=function(n){return react.createElement(nW,dist_d({size:24},n),react.createElement("path",{d:"M21.7725 18.7033C21.4062 19.5418 20.9727 20.3136 20.4704 21.0232C19.7857 21.9906 19.2251 22.6602 18.7931 23.032C18.1233 23.6424 17.4058 23.955 16.6374 23.9728C16.0857 23.9728 15.4205 23.8172 14.6461 23.5017C13.8692 23.1876 13.1552 23.032 12.5024 23.032C11.8177 23.032 11.0834 23.1876 10.2979 23.5017C9.51127 23.8172 8.87756 23.9816 8.39305 23.9979C7.65619 24.0291 6.92173 23.7076 6.1886 23.032C5.72069 22.6276 5.13542 21.9343 4.43429 20.9521C3.68203 19.9033 3.06358 18.687 2.57906 17.3004C2.06017 15.8026 1.80005 14.3523 1.80005 12.9482C1.80005 11.3398 2.15076 9.95259 2.85324 8.79011C3.40532 7.85636 4.13979 7.11979 5.05903 6.57906C5.97827 6.03834 6.97151 5.76279 8.04114 5.74516C8.62641 5.74516 9.39391 5.92456 10.3477 6.27715C11.2988 6.63091 11.9095 6.81032 12.1772 6.81032C12.3774 6.81032 13.0558 6.60054 14.2058 6.18233C15.2934 5.79449 16.2113 5.63391 16.9633 5.69716C19.0009 5.86012 20.5317 6.6561 21.5497 8.09013C19.7274 9.18432 18.826 10.7169 18.8439 12.6829C18.8603 14.2142 19.4209 15.4886 20.5227 16.5004C21.022 16.97 21.5796 17.333 22.2001 17.5907C22.0655 17.9774 21.9235 18.3477 21.7725 18.7033ZM17.0993 0.480137C17.0993 1.68041 16.6568 2.8011 15.7748 3.8384C14.7104 5.07155 13.4229 5.78412 12.0268 5.67168C12.009 5.52769 11.9987 5.37614 11.9987 5.21688C11.9987 4.06462 12.5049 2.83147 13.4038 1.82321C13.8526 1.3127 14.4234 0.888228 15.1155 0.549615C15.8062 0.216055 16.4595 0.031589 17.0739 0C17.0918 0.160458 17.0993 0.320926 17.0993 0.480121V0.480137Z",fill:"#1E2329"}))};var nC=function(n){return react.createElement(nW,dist_d({size:24},n),react.createElement("path",{d:"M13.5589 11.0874L4.08203 1.59644H4.17441C4.98558 1.59644 5.68614 1.89129 6.81073 2.4993L16.7488 7.88083L13.5589 11.0874Z",fill:"#202630"}),react.createElement("path",{d:"M12.6373 12.008L2.90218 21.7203C2.66236 21.3329 2.49658 20.7063 2.49658 19.8034V4.19354C2.49658 3.29078 2.66236 2.66403 2.90218 2.2771L12.6373 12.008Z",fill:"#202630"}),react.createElement("path",{d:"M13.5589 12.9124L16.7488 16.1187L6.81073 21.5001C5.68614 22.1083 4.98548 22.4036 4.17441 22.4036H4.08203L13.5589 12.9124Z",fill:"#202630"}),react.createElement("path",{d:"M17.9437 8.52563L14.4775 12.0091L17.9437 15.4738L20.0456 14.3309C20.8199 13.9069 22 13.1329 22 12.0091C22 10.8662 20.8199 10.0922 20.0456 9.66821L17.9437 8.52563Z",fill:"#202630"}))};var nM=function(n){return react.createElement(nW,dist_d({size:24},n),react.createElement("path",{fillRule:"evenodd",clipRule:"evenodd",d:"M7.5 4H10.5V7H7.5V10H4.5V7V4H7.5ZM14.5 4H17.5H20.5V7V10H17.5V7H14.5V4ZM10.5 20V17H7.5V14H4.5V17V20H7.5H10.5ZM17.5 20H14.5V17H17.5V14H20.5V17V20H17.5ZM16.5 10.5H8.5V13.5H16.5V10.5Z",fill:"#202630"}))};var nI=function(n){var e=n.value,a=w3w_qrcode_modal_dist_l(n,["value"]);var t=nO(e).map(function(n){return typeof n=="string"?n:react.cloneElement(a[n.key],{key:n.key})});return react.createElement(react.Fragment,null,t)},nO=function(n){var e=/{{(.*?)}}/g,a,t=0,i=[];for(;(a=e.exec(n))!==null;)a.index!==t&&i.push(n.substring(t,a.index)),i.push({key:a[1]}),t=e.lastIndex;return t!==n.length&&i.push(n.substring(t)),i};var nN=function(){var n=ng();return react.createElement(react.Fragment,null,react.createElement(nj,{t:n}),react.createElement(nD,{t:n}),react.createElement(nz,null))},nj=function(n){var e=n.t;return react.createElement("div",{style:{borderBottom:"1px solid #EAECEF"},className:"grid justify-center gap-y-2 pb-6 w3w-body3 w3w-t-black border-b border-gray-300"},react.createElement("div",null,e("sdk-modal-instruct-1",{default:"1. Open Binance app"})),react.createElement("div",{className:"flex items-center"},react.createElement(nI,{value:e("sdk-modal-instruct-2",{default:"2. Tap {{icon}} on Home"}),icon:react.createElement(nM,{className:"w-[24px] h-[24px] mx-[4px]"})})))},nD=function(n){var e=n.t;return react.createElement("div",{className:"py-4 w3w-body3 w3w-t-secondary text-center"},e("sdk-no-app",{default:"Don't have Binance app yet?"}))},nz=function(){return react.createElement("div",{className:"grid grid-cols-2 gap-x-4"},react.createElement(nT,{type:"iOS"}),react.createElement(nT,{type:"Android"}))},nT=function(n){var e=n.type;var a=ng();return react.createElement("div",{style:{border:"1px solid #EAECEF"},className:"p-[12px] rounded-lg grid cursor-pointer w3w-t-secondary grid-flow-col items-center gap-x-4 w-[150px]",onClick:function(){window.open(e==="Android"?dist_M.googlePlay:dist_M.appleStore,"_blank")}},e==="Android"?react.createElement(nC,{className:"w-[24px] h-[24px] m-auto"}):react.createElement(nB,{className:"w-[24px] h-[24px] m-auto"}),react.createElement("div",{className:"w-[75px] w3w-caption2 w3w-t-secondary"},a("sdk-download-".concat(e.toLowerCase()),{default:"Download for ".concat(e)})))};var nH=function(n){return react.createElement(nW,dist_d({},n),react.createElement("path",{d:"M6.69708 4.57538L4.57576 6.6967L9.87906 12L4.57576 17.3033L6.69708 19.4246L12.0004 14.1213L17.3037 19.4246L19.425 17.3033L14.1217 12L19.425 6.6967L17.3037 4.57538L12.0004 9.87868L6.69708 4.57538Z",fill:"currentColor"}))};var nF=function(n){var e=n.onClose;var a=ng();return react.createElement("div",{className:"flex items-center justify-between"},react.createElement("p",{className:"text-base font-medium text-[#1E2329] lg:text-xl md:font-semibold md:w3w-subtitle1"},a("sdk-modal-title",{default:"Connect with Binance"})),react.createElement("div",{className:"cursor-pointer text-[#929AA5]",onClick:e},react.createElement(nH,null)))},nZ=nF;var nR=function(n){var e=n.id,a=n.onClose,t=n.onConnect;var i=ng();return react.createElement("div",{id:e,className:"w3w-animated w3w-fadeIn pointer-events-auto fixed top-0 left-0 h-full w-full bg-black/[.80] duration-300 ease-in-out will-change-auto"},react.createElement("div",{className:"absolute bottom-0 m-auto w-full rounded-t-2xl bg-white px-4 pb-6 shadow-inner duration-300 ease-in-out will-change-transform md:w-[400px]"},react.createElement(nU,{onClose:a}),react.createElement("div",{className:"mt-6 mb-4 flex justify-center"},react.createElement("img",{className:"w-[60px]",src:dist_I})),react.createElement("div",{className:"w3w-subtitle1 text-center mb-6 w3w-t-primary"},i("sdk-modal-title",{default:"Connect with Binance"})),react.createElement("button",{onClick:t,style:{borderColor:"transparent"},className:"w-full rounded h-[40px] flex justify-center items-center w3w-bg-primary w3w-t-primary w3w-subtitle3 mb-4"},i("sdk-connect",{default:"Connect"})),react.createElement("div",{className:"text-center py-3 w3w-t-secondary"},react.createElement("span",null,i("sdk-no-app",{default:"Don’t have Binance app yet?"})),react.createElement("a",{target:"_blank",href:"https://www.binance.com/en/download",className:"w3w-t-brand ml-1"},i("sdk-install",{default:"Install"})))))},nU=function(n){var e=n.onClose;return react.createElement("div",{className:"flex items-center justify-end h-[52px]"},react.createElement("div",{className:"cursor-pointer text-[#929AA5]",onClick:e},react.createElement(nH,{className:"w-[20px]"})))};var nK=function(n,e){var a="visibilitychange",t=setTimeout(function(){document.hidden||n()},e),i=function(){document.hidden&&(clearTimeout(t),document.removeEventListener(a,i))};document.addEventListener(a,i,!1)},nJ=function(n){var e=document.createElement("a");e.href=n,document.body.appendChild(e),nK(function(){window.location.href="https://www.binance.com/en/download"},1e3),e.click(),document.body.removeChild(e)},nq=function(n){var e=dist_z(),a=e.isAndroid,t=e.isMobile;return{toBinance:function(){var e=rC(a,n);if(t){if(!a){var i=document.createElement("a");i.href=e,document.body.appendChild(i),i.click(),document.body.removeChild(i)}a&&nJ(e)}}}};function n_(n){var e=nq(n.url),a=e.toBinance;return react.createElement("div",null,react.createElement("div",{className:"mt-[35px] flex justify-center"},react.createElement("div",{className:"w-[200px] h-[200px] mb-4",onClick:a},n.url&&react.createElement(QRCodeSVG,{value:n.url,width:"100%",height:"100%",level:"M",imageSettings:{src:dist_I,height:32,width:32,excavate:!1}}))))}var nX=n_;var n$=function(n){var e=n.onClose,a=n.isReady;var t=dist_z(),i=t.isMobile,r=w3w_qrcode_modal_dist_s((0,react.useState)(""),2),o=r[0],l=r[1],c=w3w_qrcode_modal_dist_s((0,react.useState)(!1),2),p=c[0],u=c[1];(0,react.useEffect)(function(){a.then(l).catch(function(){return u(!0)})},[a]);var m=function(){rj(o)},w={url:o,error:p};if(i===!1)return react.createElement("div",{id:dist_A,className:"w3w-animated w3w-fadeIn pointer-events-auto fixed top-0 left-0 h-full w-full bg-black/[.80] duration-300 ease-in-out will-change-auto"},react.createElement("div",{style:{transform:"translateY(-50%)",top:"50%"},className:"relative m-auto w-[343px] rounded-2xl bg-white px-6 pt-[20px] pb-6 shadow-inner duration-300 ease-in-out will-change-transform md:w-[400px] lg:p-8 lg:pt-6"},react.createElement(nZ,{onClose:e}),react.createElement(nX,dist_d({},w)),react.createElement(nN,null)));if(i)return react.createElement(nR,{onConnect:m,onClose:e,id:dist_A})},n1=n$;var n0={order:["querystring","cookie","localStorage","sessionStorage","navigator","htmlTag","path","subdomain"],lookupQuerystring:function n(){var n=window.location.search.match(/lng=([^&]*)/);return n&&n[1]},lookupCookie:function n(){var n=document.cookie.match(/i18next=([^;]*)/);return n&&n[1]},lookupLocalStorage:function n(){return localStorage.getItem("i18nextLng")},lookupSessionStorage:function n(){return sessionStorage.getItem("i18nextLng")},lookupFromNavigator:function n(){return navigator.language},lookupFromHtmlTag:function n(){return document.documentElement.lang},lookupFromPath:function n(){var n=window.location.pathname.match(/\/([^/]*)/);return n&&n[1]},lookupFromSubdomain:function n(){var n=window.location.hostname.match(/^(.+)\./);return n&&n[1]}},n2=function(){var n=true,e=false,a=undefined;try{for(var t=n0.order[Symbol.iterator](),i;!(n=(i=t.next()).done);n=true){var r=i.value;try{var o=n0["lookup"+r.charAt(0).toUpperCase()+r.slice(1)]();if(o)return o}catch(n){dist_console.error("Error detecting language with method: ".concat(r),n);continue}}}catch(n){e=true;a=n}finally{try{if(!n&&t.return!=null){t.return()}}finally{if(e){throw a}}}return"en"};function n3(){var n=window.document,e=n.createElement("div");return e.setAttribute("id",dist_C),n.body.appendChild(e),e}function n4(){var n=window.document,e=n.getElementById(dist_A);e&&(e.className=e.className.replace("w3w-fadeIn","w3w-fadeOut"),setTimeout(function(){var e=n.getElementById(dist_C);e&&n.body.removeChild(e)},300))}function n5(n){return function(){n4(),n&&n()}}function n9(n){return n6.apply(this,arguments)}function n6(){n6=w3w_qrcode_modal_dist_t(function(n){var e,a,t,i,r,o;return w3w_qrcode_modal_dist_u(this,function(d){switch(d.label){case 0:e=n.isReady,a=n.cb,t=n.lng;i=n3(),r=(0,client/* createRoot */.H)(i);return[4,e];case 1:d.sent();o=t!==null&&t!==void 0?t:n2();r.render(react.createElement(dist_h.Provider,{value:{lng:o}},react.createElement("style",{dangerouslySetInnerHTML:{__html:w3w_qrcode_modal_dist_b}}),react.createElement(n1,{isReady:e,onClose:n5(a)})));return[2]}})});return n6.apply(this,arguments)}function n7(){n4()}var n8=function(n){},dist_en=function(){};function dist_ee(n){var e=n.cb,a=n.lng;var t=new Promise(function(n,e){n8=n,dist_en=e});eh()||n9({isReady:t,cb:e,lng:a})}function dist_ea(){eh()||n7()}function dist_et(n){n8(n)}function dist_ei(){dist_console.log("relay failed...."),dist_en()}var dist_er={open:dist_ee,close:dist_ea,ready:dist_et,fail:dist_ei},dist_eo=dist_er;//# sourceMappingURL=index.js.map
// EXTERNAL MODULE: ./node_modules/.pnpm/ws@8.17.0_bufferutil@4.0.8_utf-8-validate@5.0.10/node_modules/ws/browser.js
var browser = __webpack_require__(43450);
;// CONCATENATED MODULE: ./node_modules/.pnpm/@binance+w3w-socket-transport@1.1.4_bufferutil@4.0.8_utf-8-validate@5.0.10/node_modules/@binance/w3w-socket-transport/dist/index.js
function w3w_socket_transport_dist_t(t){if(t===void 0){throw new ReferenceError("this hasn't been initialised - super() hasn't been called")}return t}function w3w_socket_transport_dist_e(t,e){if(!(t instanceof e)){throw new TypeError("Cannot call a class as a function")}}function w3w_socket_transport_dist_n(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||false;r.configurable=true;if("value"in r)r.writable=true;Object.defineProperty(t,r.key,r)}}function w3w_socket_transport_dist_r(t,e,r){if(e)w3w_socket_transport_dist_n(t.prototype,e);if(r)w3w_socket_transport_dist_n(t,r);return t}function w3w_socket_transport_dist_o(t){w3w_socket_transport_dist_o=Object.setPrototypeOf?Object.getPrototypeOf:function t(t){return t.__proto__||Object.getPrototypeOf(t)};return w3w_socket_transport_dist_o(t)}function w3w_socket_transport_dist_i(t,e){if(typeof e!=="function"&&e!==null){throw new TypeError("Super expression must either be null or a function")}t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,writable:true,configurable:true}});if(e)w3w_socket_transport_dist_u(t,e)}function w3w_socket_transport_dist_s(e,n){if(n&&(w3w_socket_transport_dist_c(n)==="object"||typeof n==="function")){return n}return w3w_socket_transport_dist_t(e)}function w3w_socket_transport_dist_u(t,e){w3w_socket_transport_dist_u=Object.setPrototypeOf||function t(t,e){t.__proto__=e;return t};return w3w_socket_transport_dist_u(t,e)}function w3w_socket_transport_dist_c(t){"@swc/helpers - typeof";return t&&typeof Symbol!=="undefined"&&t.constructor===Symbol?"symbol":typeof t}function w3w_socket_transport_dist_a(){if(typeof Reflect==="undefined"||!Reflect.construct)return false;if(Reflect.construct.sham)return false;if(typeof Proxy==="function")return true;try{Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],function(){}));return true}catch(t){return false}}function w3w_socket_transport_dist_f(t){var e=w3w_socket_transport_dist_a();return function n(){var n=w3w_socket_transport_dist_o(t),r;if(e){var i=w3w_socket_transport_dist_o(this).constructor;r=Reflect.construct(n,arguments,i)}else{r=n.apply(this,arguments)}return w3w_socket_transport_dist_s(this,r)}}var w3w_socket_transport_dist_l=Object.defineProperty;var w3w_socket_transport_dist_h=function(t,e,n){return e in t?w3w_socket_transport_dist_l(t,e,{enumerable:!0,configurable:!0,writable:!0,value:n}):t[e]=n};var w3w_socket_transport_dist_y=function(t,e,n){return w3w_socket_transport_dist_h(t,(typeof e==="undefined"?"undefined":w3w_socket_transport_dist_c(e))!="symbol"?e+"":e,n),n};var w3w_socket_transport_dist_d=(typeof window==="undefined"?"undefined":w3w_socket_transport_dist_c(window))<"u"?window.WebSocket:browser,dist_v=function(n){"use strict";w3w_socket_transport_dist_i(s,n);var o=w3w_socket_transport_dist_f(s);function s(n){w3w_socket_transport_dist_e(this,s);var r;r=o.call(this);r.opts=n;w3w_socket_transport_dist_y(w3w_socket_transport_dist_t(r),"qs");w3w_socket_transport_dist_y(w3w_socket_transport_dist_t(r),"urls",[]);w3w_socket_transport_dist_y(w3w_socket_transport_dist_t(r),"url");w3w_socket_transport_dist_y(w3w_socket_transport_dist_t(r),"socket");w3w_socket_transport_dist_y(w3w_socket_transport_dist_t(r),"nextSocket");w3w_socket_transport_dist_y(w3w_socket_transport_dist_t(r),"queue",[]);w3w_socket_transport_dist_y(w3w_socket_transport_dist_t(r),"subscriptions",[]);w3w_socket_transport_dist_y(w3w_socket_transport_dist_t(r),"retryIndex",0);r.socket=null,r.nextSocket=null,r.subscriptions=n.subscriptions||[],r.qs="env=browser&protocol=wc&version=".concat(n.version);return r}w3w_socket_transport_dist_r(s,[{key:"readyState",get:function t(){return this.socket?this.socket.readyState:-1},set:function t(t){}},{key:"connecting",get:function t(){return this.readyState===0},set:function t(t){}},{key:"connected",get:function t(){return this.readyState===1},set:function t(t){}},{key:"retryFailed",get:function t(){return this.retryIndex>0&&this.retryIndex>this.urls.length},set:function t(t){}},{key:"open",value:function t(t){if(!Array.isArray(t)||t.length===0)throw new Error("Missing or invalid WebSocket url");this.urls=t,this.retryIndex=0,this.socketCreate()}},{key:"close",value:function t(){this._socketClose()}},{key:"send",value:function t(t,e,n){if(!e||typeof e!="string")throw new Error("Missing or invalid topic field");this.socketSend({topic:e,type:"pub",payload:t,silent:!!n})}},{key:"subscribe",value:function t(t){this.socketSend({topic:t,type:"sub",payload:"",silent:!0})}},{key:"socketCreate",value:function t(){var t=this;if(this.nextSocket)return;var e=this.url||this.getWsUrl();if(!e)return this.events.emit("error",new Error("Retry limit reached. Can't connect to any url."),e);if(this.url=e,this.nextSocket=new w3w_socket_transport_dist_d(e),!this.nextSocket)throw new Error("Failed to create socket");this.nextSocket.onmessage=function(e){return t.socketReceive(e)},this.nextSocket.onopen=function(){return t.socketOpen()},this.nextSocket.onerror=function(n){return t.socketError(n,e)},this.nextSocket.onclose=function(e){t.nextSocket=null,t.socketCreate()}}},{key:"getWsUrl",value:function t(){return this.retryIndex>=this.urls.length?"":"".concat(this.urls[this.retryIndex++],"?").concat(this.qs)}},{key:"socketOpen",value:function t(){this._socketClose(),this.socket=this.nextSocket,this.nextSocket=null,this.queueSubscriptions(),this.pushQueue(),this.events.emit("open",this.urls[this.retryIndex-1])}},{key:"_socketClose",value:function t(){this.socket&&(this.socket.onclose=function(){},this.socket.close(),this.events.emit("close"))}},{key:"socketSend",value:function t(t){var e=JSON.stringify(t);this.socket&&this.socket.readyState===1?this.socket.send(e):this.setToQueue(t)}},{key:"socketReceive",value:function t(t){var e;try{e=JSON.parse(t.data)}catch(t){return}this.socketSend({topic:e.topic,type:"ack",payload:"",silent:!0}),this.socket&&this.socket.readyState===1&&this.events.emit("message",e)}},{key:"socketError",value:function t(t,e){this.events.emit("error",t,e)}},{key:"queueSubscriptions",value:function t(){var t=this;this.subscriptions.forEach(function(e){return t.queue.push({topic:e,type:"sub",payload:"",silent:!0})}),this.subscriptions=this.opts.subscriptions||[]}},{key:"setToQueue",value:function t(t){this.queue.push(t)}},{key:"pushQueue",value:function t(){var t=this;this.queue.forEach(function(e){return t.socketSend(e)}),this.queue=[]}}]);return s}(rh);function w3w_socket_transport_dist_b(t){var e=Date.now();return new Promise(function(n){try{setTimeout(function(){n({ttl:0,url:t})},5e3);var r=new w3w_socket_transport_dist_d(t);r.onopen=function(){r.close(),n({ttl:Date.now()-e,url:t})},r.onerror=function(){n({ttl:0,url:t})}}catch(e){n({ttl:0,url:t})}})}//# sourceMappingURL=index.js.map
;// CONCATENATED MODULE: ./node_modules/.pnpm/@binance+w3w-types@1.1.4/node_modules/@binance/w3w-types/dist/index.js
function w3w_types_dist_t(t){if(t===void 0){throw new ReferenceError("this hasn't been initialised - super() hasn't been called")}return t}function w3w_types_dist_e(t,e){if(!(t instanceof e)){throw new TypeError("Cannot call a class as a function")}}function w3w_types_dist_n(t){w3w_types_dist_n=Object.setPrototypeOf?Object.getPrototypeOf:function t(t){return t.__proto__||Object.getPrototypeOf(t)};return w3w_types_dist_n(t)}function w3w_types_dist_r(t,e){if(typeof e!=="function"&&e!==null){throw new TypeError("Super expression must either be null or a function")}t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,writable:true,configurable:true}});if(e)w3w_types_dist_c(t,e)}function w3w_types_dist_o(e,n){if(n&&(w3w_types_dist_i(n)==="object"||typeof n==="function")){return n}return w3w_types_dist_t(e)}function w3w_types_dist_c(t,e){w3w_types_dist_c=Object.setPrototypeOf||function t(t,e){t.__proto__=e;return t};return w3w_types_dist_c(t,e)}function w3w_types_dist_i(t){"@swc/helpers - typeof";return t&&typeof Symbol!=="undefined"&&t.constructor===Symbol?"symbol":typeof t}function w3w_types_dist_u(){if(typeof Reflect==="undefined"||!Reflect.construct)return false;if(Reflect.construct.sham)return false;if(typeof Proxy==="function")return true;try{Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],function(){}));return true}catch(t){return false}}function w3w_types_dist_f(t){var e=w3w_types_dist_u();return function r(){var r=w3w_types_dist_n(t),c;if(e){var i=w3w_types_dist_n(this).constructor;c=Reflect.construct(r,arguments,i)}else{c=r.apply(this,arguments)}return w3w_types_dist_o(this,c)}}var w3w_types_dist_s=Object.defineProperty;var w3w_types_dist_a=function(t,e,n){return e in t?w3w_types_dist_s(t,e,{enumerable:!0,configurable:!0,writable:!0,value:n}):t[e]=n};var w3w_types_dist_l=function(t,e,n){return w3w_types_dist_a(t,(typeof e==="undefined"?"undefined":w3w_types_dist_i(e))!="symbol"?e+"":e,n),n};var w3w_types_dist_p=function t(){"use strict";w3w_types_dist_e(this,t);w3w_types_dist_l(this,"events")},w3w_types_dist_y=function(t){"use strict";w3w_types_dist_r(o,t);var n=w3w_types_dist_f(o);function o(){w3w_types_dist_e(this,o);return n.apply(this,arguments)}return o}(w3w_types_dist_p),w3w_types_dist_b=function(n){"use strict";w3w_types_dist_r(c,n);var o=w3w_types_dist_f(c);function c(){w3w_types_dist_e(this,c);var n;n=o.call.apply(o,[this].concat(Array.prototype.slice.call(arguments)));w3w_types_dist_l(w3w_types_dist_t(n),"connection");return n}return c}(w3w_types_dist_y);var w3w_types_dist_h=function(t){return t[t.DisconnectAtWallet=0]="DisconnectAtWallet",t[t.DisconnectAtClient=1]="DisconnectAtClient",t[t.NetworkError=2]="NetworkError",t}(w3w_types_dist_h||{});//# sourceMappingURL=index.js.map
// EXTERNAL MODULE: ./node_modules/.pnpm/@ethersproject+abi@5.7.0/node_modules/@ethersproject/abi/lib.esm/interface.js
var lib_esm_interface = __webpack_require__(24445);
;// CONCATENATED MODULE: ./node_modules/.pnpm/axios@1.6.8/node_modules/axios/lib/helpers/bind.js


function bind(fn, thisArg) {
  return function wrap() {
    return fn.apply(thisArg, arguments);
  };
}

;// CONCATENATED MODULE: ./node_modules/.pnpm/axios@1.6.8/node_modules/axios/lib/utils.js




// utils is a library of generic helper functions non-specific to axios

const {toString: utils_toString} = Object.prototype;
const {getPrototypeOf} = Object;

const kindOf = (cache => thing => {
    const str = utils_toString.call(thing);
    return cache[str] || (cache[str] = str.slice(8, -1).toLowerCase());
})(Object.create(null));

const kindOfTest = (type) => {
  type = type.toLowerCase();
  return (thing) => kindOf(thing) === type
}

const typeOfTest = type => thing => typeof thing === type;

/**
 * Determine if a value is an Array
 *
 * @param {Object} val The value to test
 *
 * @returns {boolean} True if value is an Array, otherwise false
 */
const {isArray} = Array;

/**
 * Determine if a value is undefined
 *
 * @param {*} val The value to test
 *
 * @returns {boolean} True if the value is undefined, otherwise false
 */
const isUndefined = typeOfTest('undefined');

/**
 * Determine if a value is a Buffer
 *
 * @param {*} val The value to test
 *
 * @returns {boolean} True if value is a Buffer, otherwise false
 */
function isBuffer(val) {
  return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor)
    && isFunction(val.constructor.isBuffer) && val.constructor.isBuffer(val);
}

/**
 * Determine if a value is an ArrayBuffer
 *
 * @param {*} val The value to test
 *
 * @returns {boolean} True if value is an ArrayBuffer, otherwise false
 */
const isArrayBuffer = kindOfTest('ArrayBuffer');


/**
 * Determine if a value is a view on an ArrayBuffer
 *
 * @param {*} val The value to test
 *
 * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
 */
function isArrayBufferView(val) {
  let result;
  if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
    result = ArrayBuffer.isView(val);
  } else {
    result = (val) && (val.buffer) && (isArrayBuffer(val.buffer));
  }
  return result;
}

/**
 * Determine if a value is a String
 *
 * @param {*} val The value to test
 *
 * @returns {boolean} True if value is a String, otherwise false
 */
const isString = typeOfTest('string');

/**
 * Determine if a value is a Function
 *
 * @param {*} val The value to test
 * @returns {boolean} True if value is a Function, otherwise false
 */
const isFunction = typeOfTest('function');

/**
 * Determine if a value is a Number
 *
 * @param {*} val The value to test
 *
 * @returns {boolean} True if value is a Number, otherwise false
 */
const isNumber = typeOfTest('number');

/**
 * Determine if a value is an Object
 *
 * @param {*} thing The value to test
 *
 * @returns {boolean} True if value is an Object, otherwise false
 */
const isObject = (thing) => thing !== null && typeof thing === 'object';

/**
 * Determine if a value is a Boolean
 *
 * @param {*} thing The value to test
 * @returns {boolean} True if value is a Boolean, otherwise false
 */
const isBoolean = thing => thing === true || thing === false;

/**
 * Determine if a value is a plain Object
 *
 * @param {*} val The value to test
 *
 * @returns {boolean} True if value is a plain Object, otherwise false
 */
const isPlainObject = (val) => {
  if (kindOf(val) !== 'object') {
    return false;
  }

  const prototype = getPrototypeOf(val);
  return (prototype === null || prototype === Object.prototype || Object.getPrototypeOf(prototype) === null) && !(Symbol.toStringTag in val) && !(Symbol.iterator in val);
}

/**
 * Determine if a value is a Date
 *
 * @param {*} val The value to test
 *
 * @returns {boolean} True if value is a Date, otherwise false
 */
const isDate = kindOfTest('Date');

/**
 * Determine if a value is a File
 *
 * @param {*} val The value to test
 *
 * @returns {boolean} True if value is a File, otherwise false
 */
const isFile = kindOfTest('File');

/**
 * Determine if a value is a Blob
 *
 * @param {*} val The value to test
 *
 * @returns {boolean} True if value is a Blob, otherwise false
 */
const isBlob = kindOfTest('Blob');

/**
 * Determine if a value is a FileList
 *
 * @param {*} val The value to test
 *
 * @returns {boolean} True if value is a File, otherwise false
 */
const isFileList = kindOfTest('FileList');

/**
 * Determine if a value is a Stream
 *
 * @param {*} val The value to test
 *
 * @returns {boolean} True if value is a Stream, otherwise false
 */
const isStream = (val) => isObject(val) && isFunction(val.pipe);

/**
 * Determine if a value is a FormData
 *
 * @param {*} thing The value to test
 *
 * @returns {boolean} True if value is an FormData, otherwise false
 */
const isFormData = (thing) => {
  let kind;
  return thing && (
    (typeof FormData === 'function' && thing instanceof FormData) || (
      isFunction(thing.append) && (
        (kind = kindOf(thing)) === 'formdata' ||
        // detect form-data instance
        (kind === 'object' && isFunction(thing.toString) && thing.toString() === '[object FormData]')
      )
    )
  )
}

/**
 * Determine if a value is a URLSearchParams object
 *
 * @param {*} val The value to test
 *
 * @returns {boolean} True if value is a URLSearchParams object, otherwise false
 */
const isURLSearchParams = kindOfTest('URLSearchParams');

/**
 * Trim excess whitespace off the beginning and end of a string
 *
 * @param {String} str The String to trim
 *
 * @returns {String} The String freed of excess whitespace
 */
const trim = (str) => str.trim ?
  str.trim() : str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');

/**
 * Iterate over an Array or an Object invoking a function for each item.
 *
 * If `obj` is an Array callback will be called passing
 * the value, index, and complete array for each item.
 *
 * If 'obj' is an Object callback will be called passing
 * the value, key, and complete object for each property.
 *
 * @param {Object|Array} obj The object to iterate
 * @param {Function} fn The callback to invoke for each item
 *
 * @param {Boolean} [allOwnKeys = false]
 * @returns {any}
 */
function forEach(obj, fn, {allOwnKeys = false} = {}) {
  // Don't bother if no value provided
  if (obj === null || typeof obj === 'undefined') {
    return;
  }

  let i;
  let l;

  // Force an array if not already something iterable
  if (typeof obj !== 'object') {
    /*eslint no-param-reassign:0*/
    obj = [obj];
  }

  if (isArray(obj)) {
    // Iterate over array values
    for (i = 0, l = obj.length; i < l; i++) {
      fn.call(null, obj[i], i, obj);
    }
  } else {
    // Iterate over object keys
    const keys = allOwnKeys ? Object.getOwnPropertyNames(obj) : Object.keys(obj);
    const len = keys.length;
    let key;

    for (i = 0; i < len; i++) {
      key = keys[i];
      fn.call(null, obj[key], key, obj);
    }
  }
}

function findKey(obj, key) {
  key = key.toLowerCase();
  const keys = Object.keys(obj);
  let i = keys.length;
  let _key;
  while (i-- > 0) {
    _key = keys[i];
    if (key === _key.toLowerCase()) {
      return _key;
    }
  }
  return null;
}

const _global = (() => {
  /*eslint no-undef:0*/
  if (typeof globalThis !== "undefined") return globalThis;
  return typeof self !== "undefined" ? self : (typeof window !== 'undefined' ? window : global)
})();

const isContextDefined = (context) => !isUndefined(context) && context !== _global;

/**
 * Accepts varargs expecting each argument to be an object, then
 * immutably merges the properties of each object and returns result.
 *
 * When multiple objects contain the same key the later object in
 * the arguments list will take precedence.
 *
 * Example:
 *
 * ```js
 * var result = merge({foo: 123}, {foo: 456});
 * console.log(result.foo); // outputs 456
 * ```
 *
 * @param {Object} obj1 Object to merge
 *
 * @returns {Object} Result of all merge properties
 */
function merge(/* obj1, obj2, obj3, ... */) {
  const {caseless} = isContextDefined(this) && this || {};
  const result = {};
  const assignValue = (val, key) => {
    const targetKey = caseless && findKey(result, key) || key;
    if (isPlainObject(result[targetKey]) && isPlainObject(val)) {
      result[targetKey] = merge(result[targetKey], val);
    } else if (isPlainObject(val)) {
      result[targetKey] = merge({}, val);
    } else if (isArray(val)) {
      result[targetKey] = val.slice();
    } else {
      result[targetKey] = val;
    }
  }

  for (let i = 0, l = arguments.length; i < l; i++) {
    arguments[i] && forEach(arguments[i], assignValue);
  }
  return result;
}

/**
 * Extends object a by mutably adding to it the properties of object b.
 *
 * @param {Object} a The object to be extended
 * @param {Object} b The object to copy properties from
 * @param {Object} thisArg The object to bind function to
 *
 * @param {Boolean} [allOwnKeys]
 * @returns {Object} The resulting value of object a
 */
const extend = (a, b, thisArg, {allOwnKeys}= {}) => {
  forEach(b, (val, key) => {
    if (thisArg && isFunction(val)) {
      a[key] = bind(val, thisArg);
    } else {
      a[key] = val;
    }
  }, {allOwnKeys});
  return a;
}

/**
 * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
 *
 * @param {string} content with BOM
 *
 * @returns {string} content value without BOM
 */
const stripBOM = (content) => {
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
  }
  return content;
}

/**
 * Inherit the prototype methods from one constructor into another
 * @param {function} constructor
 * @param {function} superConstructor
 * @param {object} [props]
 * @param {object} [descriptors]
 *
 * @returns {void}
 */
const inherits = (constructor, superConstructor, props, descriptors) => {
  constructor.prototype = Object.create(superConstructor.prototype, descriptors);
  constructor.prototype.constructor = constructor;
  Object.defineProperty(constructor, 'super', {
    value: superConstructor.prototype
  });
  props && Object.assign(constructor.prototype, props);
}

/**
 * Resolve object with deep prototype chain to a flat object
 * @param {Object} sourceObj source object
 * @param {Object} [destObj]
 * @param {Function|Boolean} [filter]
 * @param {Function} [propFilter]
 *
 * @returns {Object}
 */
const toFlatObject = (sourceObj, destObj, filter, propFilter) => {
  let props;
  let i;
  let prop;
  const merged = {};

  destObj = destObj || {};
  // eslint-disable-next-line no-eq-null,eqeqeq
  if (sourceObj == null) return destObj;

  do {
    props = Object.getOwnPropertyNames(sourceObj);
    i = props.length;
    while (i-- > 0) {
      prop = props[i];
      if ((!propFilter || propFilter(prop, sourceObj, destObj)) && !merged[prop]) {
        destObj[prop] = sourceObj[prop];
        merged[prop] = true;
      }
    }
    sourceObj = filter !== false && getPrototypeOf(sourceObj);
  } while (sourceObj && (!filter || filter(sourceObj, destObj)) && sourceObj !== Object.prototype);

  return destObj;
}

/**
 * Determines whether a string ends with the characters of a specified string
 *
 * @param {String} str
 * @param {String} searchString
 * @param {Number} [position= 0]
 *
 * @returns {boolean}
 */
const endsWith = (str, searchString, position) => {
  str = String(str);
  if (position === undefined || position > str.length) {
    position = str.length;
  }
  position -= searchString.length;
  const lastIndex = str.indexOf(searchString, position);
  return lastIndex !== -1 && lastIndex === position;
}


/**
 * Returns new array from array like object or null if failed
 *
 * @param {*} [thing]
 *
 * @returns {?Array}
 */
const toArray = (thing) => {
  if (!thing) return null;
  if (isArray(thing)) return thing;
  let i = thing.length;
  if (!isNumber(i)) return null;
  const arr = new Array(i);
  while (i-- > 0) {
    arr[i] = thing[i];
  }
  return arr;
}

/**
 * Checking if the Uint8Array exists and if it does, it returns a function that checks if the
 * thing passed in is an instance of Uint8Array
 *
 * @param {TypedArray}
 *
 * @returns {Array}
 */
// eslint-disable-next-line func-names
const isTypedArray = (TypedArray => {
  // eslint-disable-next-line func-names
  return thing => {
    return TypedArray && thing instanceof TypedArray;
  };
})(typeof Uint8Array !== 'undefined' && getPrototypeOf(Uint8Array));

/**
 * For each entry in the object, call the function with the key and value.
 *
 * @param {Object<any, any>} obj - The object to iterate over.
 * @param {Function} fn - The function to call for each entry.
 *
 * @returns {void}
 */
const forEachEntry = (obj, fn) => {
  const generator = obj && obj[Symbol.iterator];

  const iterator = generator.call(obj);

  let result;

  while ((result = iterator.next()) && !result.done) {
    const pair = result.value;
    fn.call(obj, pair[0], pair[1]);
  }
}

/**
 * It takes a regular expression and a string, and returns an array of all the matches
 *
 * @param {string} regExp - The regular expression to match against.
 * @param {string} str - The string to search.
 *
 * @returns {Array<boolean>}
 */
const matchAll = (regExp, str) => {
  let matches;
  const arr = [];

  while ((matches = regExp.exec(str)) !== null) {
    arr.push(matches);
  }

  return arr;
}

/* Checking if the kindOfTest function returns true when passed an HTMLFormElement. */
const isHTMLForm = kindOfTest('HTMLFormElement');

const toCamelCase = str => {
  return str.toLowerCase().replace(/[-_\s]([a-z\d])(\w*)/g,
    function replacer(m, p1, p2) {
      return p1.toUpperCase() + p2;
    }
  );
};

/* Creating a function that will check if an object has a property. */
const utils_hasOwnProperty = (({hasOwnProperty}) => (obj, prop) => hasOwnProperty.call(obj, prop))(Object.prototype);

/**
 * Determine if a value is a RegExp object
 *
 * @param {*} val The value to test
 *
 * @returns {boolean} True if value is a RegExp object, otherwise false
 */
const isRegExp = kindOfTest('RegExp');

const reduceDescriptors = (obj, reducer) => {
  const descriptors = Object.getOwnPropertyDescriptors(obj);
  const reducedDescriptors = {};

  forEach(descriptors, (descriptor, name) => {
    let ret;
    if ((ret = reducer(descriptor, name, obj)) !== false) {
      reducedDescriptors[name] = ret || descriptor;
    }
  });

  Object.defineProperties(obj, reducedDescriptors);
}

/**
 * Makes all methods read-only
 * @param {Object} obj
 */

const freezeMethods = (obj) => {
  reduceDescriptors(obj, (descriptor, name) => {
    // skip restricted props in strict mode
    if (isFunction(obj) && ['arguments', 'caller', 'callee'].indexOf(name) !== -1) {
      return false;
    }

    const value = obj[name];

    if (!isFunction(value)) return;

    descriptor.enumerable = false;

    if ('writable' in descriptor) {
      descriptor.writable = false;
      return;
    }

    if (!descriptor.set) {
      descriptor.set = () => {
        throw Error('Can not rewrite read-only method \'' + name + '\'');
      };
    }
  });
}

const toObjectSet = (arrayOrString, delimiter) => {
  const obj = {};

  const define = (arr) => {
    arr.forEach(value => {
      obj[value] = true;
    });
  }

  isArray(arrayOrString) ? define(arrayOrString) : define(String(arrayOrString).split(delimiter));

  return obj;
}

const noop = () => {}

const toFiniteNumber = (value, defaultValue) => {
  value = +value;
  return Number.isFinite(value) ? value : defaultValue;
}

const ALPHA = 'abcdefghijklmnopqrstuvwxyz'

const DIGIT = '0123456789';

const ALPHABET = {
  DIGIT,
  ALPHA,
  ALPHA_DIGIT: ALPHA + ALPHA.toUpperCase() + DIGIT
}

const generateString = (size = 16, alphabet = ALPHABET.ALPHA_DIGIT) => {
  let str = '';
  const {length} = alphabet;
  while (size--) {
    str += alphabet[Math.random() * length|0]
  }

  return str;
}

/**
 * If the thing is a FormData object, return true, otherwise return false.
 *
 * @param {unknown} thing - The thing to check.
 *
 * @returns {boolean}
 */
function isSpecCompliantForm(thing) {
  return !!(thing && isFunction(thing.append) && thing[Symbol.toStringTag] === 'FormData' && thing[Symbol.iterator]);
}

const toJSONObject = (obj) => {
  const stack = new Array(10);

  const visit = (source, i) => {

    if (isObject(source)) {
      if (stack.indexOf(source) >= 0) {
        return;
      }

      if(!('toJSON' in source)) {
        stack[i] = source;
        const target = isArray(source) ? [] : {};

        forEach(source, (value, key) => {
          const reducedValue = visit(value, i + 1);
          !isUndefined(reducedValue) && (target[key] = reducedValue);
        });

        stack[i] = undefined;

        return target;
      }
    }

    return source;
  }

  return visit(obj, 0);
}

const isAsyncFn = kindOfTest('AsyncFunction');

const isThenable = (thing) =>
  thing && (isObject(thing) || isFunction(thing)) && isFunction(thing.then) && isFunction(thing.catch);

/* harmony default export */ const utils = ({
  isArray,
  isArrayBuffer,
  isBuffer,
  isFormData,
  isArrayBufferView,
  isString,
  isNumber,
  isBoolean,
  isObject,
  isPlainObject,
  isUndefined,
  isDate,
  isFile,
  isBlob,
  isRegExp,
  isFunction,
  isStream,
  isURLSearchParams,
  isTypedArray,
  isFileList,
  forEach,
  merge,
  extend,
  trim,
  stripBOM,
  inherits,
  toFlatObject,
  kindOf,
  kindOfTest,
  endsWith,
  toArray,
  forEachEntry,
  matchAll,
  isHTMLForm,
  hasOwnProperty: utils_hasOwnProperty,
  hasOwnProp: utils_hasOwnProperty, // an alias to avoid ESLint no-prototype-builtins detection
  reduceDescriptors,
  freezeMethods,
  toObjectSet,
  toCamelCase,
  noop,
  toFiniteNumber,
  findKey,
  global: _global,
  isContextDefined,
  ALPHABET,
  generateString,
  isSpecCompliantForm,
  toJSONObject,
  isAsyncFn,
  isThenable
});

;// CONCATENATED MODULE: ./node_modules/.pnpm/axios@1.6.8/node_modules/axios/lib/core/AxiosError.js




/**
 * Create an Error with the specified message, config, error code, request and response.
 *
 * @param {string} message The error message.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [config] The config.
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 *
 * @returns {Error} The created error.
 */
function AxiosError(message, code, config, request, response) {
  Error.call(this);

  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, this.constructor);
  } else {
    this.stack = (new Error()).stack;
  }

  this.message = message;
  this.name = 'AxiosError';
  code && (this.code = code);
  config && (this.config = config);
  request && (this.request = request);
  response && (this.response = response);
}

utils.inherits(AxiosError, Error, {
  toJSON: function toJSON() {
    return {
      // Standard
      message: this.message,
      name: this.name,
      // Microsoft
      description: this.description,
      number: this.number,
      // Mozilla
      fileName: this.fileName,
      lineNumber: this.lineNumber,
      columnNumber: this.columnNumber,
      stack: this.stack,
      // Axios
      config: utils.toJSONObject(this.config),
      code: this.code,
      status: this.response && this.response.status ? this.response.status : null
    };
  }
});

const AxiosError_prototype = AxiosError.prototype;
const descriptors = {};

[
  'ERR_BAD_OPTION_VALUE',
  'ERR_BAD_OPTION',
  'ECONNABORTED',
  'ETIMEDOUT',
  'ERR_NETWORK',
  'ERR_FR_TOO_MANY_REDIRECTS',
  'ERR_DEPRECATED',
  'ERR_BAD_RESPONSE',
  'ERR_BAD_REQUEST',
  'ERR_CANCELED',
  'ERR_NOT_SUPPORT',
  'ERR_INVALID_URL'
// eslint-disable-next-line func-names
].forEach(code => {
  descriptors[code] = {value: code};
});

Object.defineProperties(AxiosError, descriptors);
Object.defineProperty(AxiosError_prototype, 'isAxiosError', {value: true});

// eslint-disable-next-line func-names
AxiosError.from = (error, code, config, request, response, customProps) => {
  const axiosError = Object.create(AxiosError_prototype);

  utils.toFlatObject(error, axiosError, function filter(obj) {
    return obj !== Error.prototype;
  }, prop => {
    return prop !== 'isAxiosError';
  });

  AxiosError.call(axiosError, error.message, code, config, request, response);

  axiosError.cause = error;

  axiosError.name = error.name;

  customProps && Object.assign(axiosError, customProps);

  return axiosError;
};

/* harmony default export */ const core_AxiosError = (AxiosError);

;// CONCATENATED MODULE: ./node_modules/.pnpm/axios@1.6.8/node_modules/axios/lib/helpers/null.js
// eslint-disable-next-line strict
/* harmony default export */ const helpers_null = (null);

;// CONCATENATED MODULE: ./node_modules/.pnpm/axios@1.6.8/node_modules/axios/lib/helpers/toFormData.js
/* provided dependency */ var toFormData_Buffer = __webpack_require__(84686)["Buffer"];




// temporary hotfix to avoid circular references until AxiosURLSearchParams is refactored


/**
 * Determines if the given thing is a array or js object.
 *
 * @param {string} thing - The object or array to be visited.
 *
 * @returns {boolean}
 */
function isVisitable(thing) {
  return utils.isPlainObject(thing) || utils.isArray(thing);
}

/**
 * It removes the brackets from the end of a string
 *
 * @param {string} key - The key of the parameter.
 *
 * @returns {string} the key without the brackets.
 */
function removeBrackets(key) {
  return utils.endsWith(key, '[]') ? key.slice(0, -2) : key;
}

/**
 * It takes a path, a key, and a boolean, and returns a string
 *
 * @param {string} path - The path to the current key.
 * @param {string} key - The key of the current object being iterated over.
 * @param {string} dots - If true, the key will be rendered with dots instead of brackets.
 *
 * @returns {string} The path to the current key.
 */
function renderKey(path, key, dots) {
  if (!path) return key;
  return path.concat(key).map(function each(token, i) {
    // eslint-disable-next-line no-param-reassign
    token = removeBrackets(token);
    return !dots && i ? '[' + token + ']' : token;
  }).join(dots ? '.' : '');
}

/**
 * If the array is an array and none of its elements are visitable, then it's a flat array.
 *
 * @param {Array<any>} arr - The array to check
 *
 * @returns {boolean}
 */
function isFlatArray(arr) {
  return utils.isArray(arr) && !arr.some(isVisitable);
}

const predicates = utils.toFlatObject(utils, {}, null, function filter(prop) {
  return /^is[A-Z]/.test(prop);
});

/**
 * Convert a data object to FormData
 *
 * @param {Object} obj
 * @param {?Object} [formData]
 * @param {?Object} [options]
 * @param {Function} [options.visitor]
 * @param {Boolean} [options.metaTokens = true]
 * @param {Boolean} [options.dots = false]
 * @param {?Boolean} [options.indexes = false]
 *
 * @returns {Object}
 **/

/**
 * It converts an object into a FormData object
 *
 * @param {Object<any, any>} obj - The object to convert to form data.
 * @param {string} formData - The FormData object to append to.
 * @param {Object<string, any>} options
 *
 * @returns
 */
function toFormData(obj, formData, options) {
  if (!utils.isObject(obj)) {
    throw new TypeError('target must be an object');
  }

  // eslint-disable-next-line no-param-reassign
  formData = formData || new (helpers_null || FormData)();

  // eslint-disable-next-line no-param-reassign
  options = utils.toFlatObject(options, {
    metaTokens: true,
    dots: false,
    indexes: false
  }, false, function defined(option, source) {
    // eslint-disable-next-line no-eq-null,eqeqeq
    return !utils.isUndefined(source[option]);
  });

  const metaTokens = options.metaTokens;
  // eslint-disable-next-line no-use-before-define
  const visitor = options.visitor || defaultVisitor;
  const dots = options.dots;
  const indexes = options.indexes;
  const _Blob = options.Blob || typeof Blob !== 'undefined' && Blob;
  const useBlob = _Blob && utils.isSpecCompliantForm(formData);

  if (!utils.isFunction(visitor)) {
    throw new TypeError('visitor must be a function');
  }

  function convertValue(value) {
    if (value === null) return '';

    if (utils.isDate(value)) {
      return value.toISOString();
    }

    if (!useBlob && utils.isBlob(value)) {
      throw new core_AxiosError('Blob is not supported. Use a Buffer instead.');
    }

    if (utils.isArrayBuffer(value) || utils.isTypedArray(value)) {
      return useBlob && typeof Blob === 'function' ? new Blob([value]) : toFormData_Buffer.from(value);
    }

    return value;
  }

  /**
   * Default visitor.
   *
   * @param {*} value
   * @param {String|Number} key
   * @param {Array<String|Number>} path
   * @this {FormData}
   *
   * @returns {boolean} return true to visit the each prop of the value recursively
   */
  function defaultVisitor(value, key, path) {
    let arr = value;

    if (value && !path && typeof value === 'object') {
      if (utils.endsWith(key, '{}')) {
        // eslint-disable-next-line no-param-reassign
        key = metaTokens ? key : key.slice(0, -2);
        // eslint-disable-next-line no-param-reassign
        value = JSON.stringify(value);
      } else if (
        (utils.isArray(value) && isFlatArray(value)) ||
        ((utils.isFileList(value) || utils.endsWith(key, '[]')) && (arr = utils.toArray(value))
        )) {
        // eslint-disable-next-line no-param-reassign
        key = removeBrackets(key);

        arr.forEach(function each(el, index) {
          !(utils.isUndefined(el) || el === null) && formData.append(
            // eslint-disable-next-line no-nested-ternary
            indexes === true ? renderKey([key], index, dots) : (indexes === null ? key : key + '[]'),
            convertValue(el)
          );
        });
        return false;
      }
    }

    if (isVisitable(value)) {
      return true;
    }

    formData.append(renderKey(path, key, dots), convertValue(value));

    return false;
  }

  const stack = [];

  const exposedHelpers = Object.assign(predicates, {
    defaultVisitor,
    convertValue,
    isVisitable
  });

  function build(value, path) {
    if (utils.isUndefined(value)) return;

    if (stack.indexOf(value) !== -1) {
      throw Error('Circular reference detected in ' + path.join('.'));
    }

    stack.push(value);

    utils.forEach(value, function each(el, key) {
      const result = !(utils.isUndefined(el) || el === null) && visitor.call(
        formData, el, utils.isString(key) ? key.trim() : key, path, exposedHelpers
      );

      if (result === true) {
        build(el, path ? path.concat(key) : [key]);
      }
    });

    stack.pop();
  }

  if (!utils.isObject(obj)) {
    throw new TypeError('data must be an object');
  }

  build(obj);

  return formData;
}

/* harmony default export */ const helpers_toFormData = (toFormData);

;// CONCATENATED MODULE: ./node_modules/.pnpm/axios@1.6.8/node_modules/axios/lib/helpers/AxiosURLSearchParams.js




/**
 * It encodes a string by replacing all characters that are not in the unreserved set with
 * their percent-encoded equivalents
 *
 * @param {string} str - The string to encode.
 *
 * @returns {string} The encoded string.
 */
function AxiosURLSearchParams_encode(str) {
  const charMap = {
    '!': '%21',
    "'": '%27',
    '(': '%28',
    ')': '%29',
    '~': '%7E',
    '%20': '+',
    '%00': '\x00'
  };
  return encodeURIComponent(str).replace(/[!'()~]|%20|%00/g, function replacer(match) {
    return charMap[match];
  });
}

/**
 * It takes a params object and converts it to a FormData object
 *
 * @param {Object<string, any>} params - The parameters to be converted to a FormData object.
 * @param {Object<string, any>} options - The options object passed to the Axios constructor.
 *
 * @returns {void}
 */
function AxiosURLSearchParams(params, options) {
  this._pairs = [];

  params && helpers_toFormData(params, this, options);
}

const AxiosURLSearchParams_prototype = AxiosURLSearchParams.prototype;

AxiosURLSearchParams_prototype.append = function append(name, value) {
  this._pairs.push([name, value]);
};

AxiosURLSearchParams_prototype.toString = function toString(encoder) {
  const _encode = encoder ? function(value) {
    return encoder.call(this, value, AxiosURLSearchParams_encode);
  } : AxiosURLSearchParams_encode;

  return this._pairs.map(function each(pair) {
    return _encode(pair[0]) + '=' + _encode(pair[1]);
  }, '').join('&');
};

/* harmony default export */ const helpers_AxiosURLSearchParams = (AxiosURLSearchParams);

;// CONCATENATED MODULE: ./node_modules/.pnpm/axios@1.6.8/node_modules/axios/lib/helpers/buildURL.js





/**
 * It replaces all instances of the characters `:`, `$`, `,`, `+`, `[`, and `]` with their
 * URI encoded counterparts
 *
 * @param {string} val The value to be encoded.
 *
 * @returns {string} The encoded value.
 */
function buildURL_encode(val) {
  return encodeURIComponent(val).
    replace(/%3A/gi, ':').
    replace(/%24/g, '$').
    replace(/%2C/gi, ',').
    replace(/%20/g, '+').
    replace(/%5B/gi, '[').
    replace(/%5D/gi, ']');
}

/**
 * Build a URL by appending params to the end
 *
 * @param {string} url The base of the url (e.g., http://www.google.com)
 * @param {object} [params] The params to be appended
 * @param {?object} options
 *
 * @returns {string} The formatted url
 */
function buildURL(url, params, options) {
  /*eslint no-param-reassign:0*/
  if (!params) {
    return url;
  }
  
  const _encode = options && options.encode || buildURL_encode;

  const serializeFn = options && options.serialize;

  let serializedParams;

  if (serializeFn) {
    serializedParams = serializeFn(params, options);
  } else {
    serializedParams = utils.isURLSearchParams(params) ?
      params.toString() :
      new helpers_AxiosURLSearchParams(params, options).toString(_encode);
  }

  if (serializedParams) {
    const hashmarkIndex = url.indexOf("#");

    if (hashmarkIndex !== -1) {
      url = url.slice(0, hashmarkIndex);
    }
    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
  }

  return url;
}

;// CONCATENATED MODULE: ./node_modules/.pnpm/axios@1.6.8/node_modules/axios/lib/core/InterceptorManager.js




class InterceptorManager {
  constructor() {
    this.handlers = [];
  }

  /**
   * Add a new interceptor to the stack
   *
   * @param {Function} fulfilled The function to handle `then` for a `Promise`
   * @param {Function} rejected The function to handle `reject` for a `Promise`
   *
   * @return {Number} An ID used to remove interceptor later
   */
  use(fulfilled, rejected, options) {
    this.handlers.push({
      fulfilled,
      rejected,
      synchronous: options ? options.synchronous : false,
      runWhen: options ? options.runWhen : null
    });
    return this.handlers.length - 1;
  }

  /**
   * Remove an interceptor from the stack
   *
   * @param {Number} id The ID that was returned by `use`
   *
   * @returns {Boolean} `true` if the interceptor was removed, `false` otherwise
   */
  eject(id) {
    if (this.handlers[id]) {
      this.handlers[id] = null;
    }
  }

  /**
   * Clear all interceptors from the stack
   *
   * @returns {void}
   */
  clear() {
    if (this.handlers) {
      this.handlers = [];
    }
  }

  /**
   * Iterate over all the registered interceptors
   *
   * This method is particularly useful for skipping over any
   * interceptors that may have become `null` calling `eject`.
   *
   * @param {Function} fn The function to call for each interceptor
   *
   * @returns {void}
   */
  forEach(fn) {
    utils.forEach(this.handlers, function forEachHandler(h) {
      if (h !== null) {
        fn(h);
      }
    });
  }
}

/* harmony default export */ const core_InterceptorManager = (InterceptorManager);

;// CONCATENATED MODULE: ./node_modules/.pnpm/axios@1.6.8/node_modules/axios/lib/defaults/transitional.js


/* harmony default export */ const defaults_transitional = ({
  silentJSONParsing: true,
  forcedJSONParsing: true,
  clarifyTimeoutError: false
});

;// CONCATENATED MODULE: ./node_modules/.pnpm/axios@1.6.8/node_modules/axios/lib/platform/browser/classes/URLSearchParams.js



/* harmony default export */ const classes_URLSearchParams = (typeof URLSearchParams !== 'undefined' ? URLSearchParams : helpers_AxiosURLSearchParams);

;// CONCATENATED MODULE: ./node_modules/.pnpm/axios@1.6.8/node_modules/axios/lib/platform/browser/classes/FormData.js


/* harmony default export */ const classes_FormData = (typeof FormData !== 'undefined' ? FormData : null);

;// CONCATENATED MODULE: ./node_modules/.pnpm/axios@1.6.8/node_modules/axios/lib/platform/browser/classes/Blob.js


/* harmony default export */ const classes_Blob = (typeof Blob !== 'undefined' ? Blob : null);

;// CONCATENATED MODULE: ./node_modules/.pnpm/axios@1.6.8/node_modules/axios/lib/platform/browser/index.js




/* harmony default export */ const platform_browser = ({
  isBrowser: true,
  classes: {
    URLSearchParams: classes_URLSearchParams,
    FormData: classes_FormData,
    Blob: classes_Blob
  },
  protocols: ['http', 'https', 'file', 'blob', 'url', 'data']
});

;// CONCATENATED MODULE: ./node_modules/.pnpm/axios@1.6.8/node_modules/axios/lib/platform/common/utils.js
const hasBrowserEnv = typeof window !== 'undefined' && typeof document !== 'undefined';

/**
 * Determine if we're running in a standard browser environment
 *
 * This allows axios to run in a web worker, and react-native.
 * Both environments support XMLHttpRequest, but not fully standard globals.
 *
 * web workers:
 *  typeof window -> undefined
 *  typeof document -> undefined
 *
 * react-native:
 *  navigator.product -> 'ReactNative'
 * nativescript
 *  navigator.product -> 'NativeScript' or 'NS'
 *
 * @returns {boolean}
 */
const hasStandardBrowserEnv = (
  (product) => {
    return hasBrowserEnv && ['ReactNative', 'NativeScript', 'NS'].indexOf(product) < 0
  })(typeof navigator !== 'undefined' && navigator.product);

/**
 * Determine if we're running in a standard browser webWorker environment
 *
 * Although the `isStandardBrowserEnv` method indicates that
 * `allows axios to run in a web worker`, the WebWorker will still be
 * filtered out due to its judgment standard
 * `typeof window !== 'undefined' && typeof document !== 'undefined'`.
 * This leads to a problem when axios post `FormData` in webWorker
 */
const hasStandardBrowserWebWorkerEnv = (() => {
  return (
    typeof WorkerGlobalScope !== 'undefined' &&
    // eslint-disable-next-line no-undef
    self instanceof WorkerGlobalScope &&
    typeof self.importScripts === 'function'
  );
})();



;// CONCATENATED MODULE: ./node_modules/.pnpm/axios@1.6.8/node_modules/axios/lib/platform/index.js



/* harmony default export */ const platform = ({
  ...common_utils_namespaceObject,
  ...platform_browser
});

;// CONCATENATED MODULE: ./node_modules/.pnpm/axios@1.6.8/node_modules/axios/lib/helpers/toURLEncodedForm.js






function toURLEncodedForm(data, options) {
  return helpers_toFormData(data, new platform.classes.URLSearchParams(), Object.assign({
    visitor: function(value, key, path, helpers) {
      if (platform.isNode && utils.isBuffer(value)) {
        this.append(key, value.toString('base64'));
        return false;
      }

      return helpers.defaultVisitor.apply(this, arguments);
    }
  }, options));
}

;// CONCATENATED MODULE: ./node_modules/.pnpm/axios@1.6.8/node_modules/axios/lib/helpers/formDataToJSON.js




/**
 * It takes a string like `foo[x][y][z]` and returns an array like `['foo', 'x', 'y', 'z']
 *
 * @param {string} name - The name of the property to get.
 *
 * @returns An array of strings.
 */
function parsePropPath(name) {
  // foo[x][y][z]
  // foo.x.y.z
  // foo-x-y-z
  // foo x y z
  return utils.matchAll(/\w+|\[(\w*)]/g, name).map(match => {
    return match[0] === '[]' ? '' : match[1] || match[0];
  });
}

/**
 * Convert an array to an object.
 *
 * @param {Array<any>} arr - The array to convert to an object.
 *
 * @returns An object with the same keys and values as the array.
 */
function arrayToObject(arr) {
  const obj = {};
  const keys = Object.keys(arr);
  let i;
  const len = keys.length;
  let key;
  for (i = 0; i < len; i++) {
    key = keys[i];
    obj[key] = arr[key];
  }
  return obj;
}

/**
 * It takes a FormData object and returns a JavaScript object
 *
 * @param {string} formData The FormData object to convert to JSON.
 *
 * @returns {Object<string, any> | null} The converted object.
 */
function formDataToJSON(formData) {
  function buildPath(path, value, target, index) {
    let name = path[index++];

    if (name === '__proto__') return true;

    const isNumericKey = Number.isFinite(+name);
    const isLast = index >= path.length;
    name = !name && utils.isArray(target) ? target.length : name;

    if (isLast) {
      if (utils.hasOwnProp(target, name)) {
        target[name] = [target[name], value];
      } else {
        target[name] = value;
      }

      return !isNumericKey;
    }

    if (!target[name] || !utils.isObject(target[name])) {
      target[name] = [];
    }

    const result = buildPath(path, value, target[name], index);

    if (result && utils.isArray(target[name])) {
      target[name] = arrayToObject(target[name]);
    }

    return !isNumericKey;
  }

  if (utils.isFormData(formData) && utils.isFunction(formData.entries)) {
    const obj = {};

    utils.forEachEntry(formData, (name, value) => {
      buildPath(parsePropPath(name), value, obj, 0);
    });

    return obj;
  }

  return null;
}

/* harmony default export */ const helpers_formDataToJSON = (formDataToJSON);

;// CONCATENATED MODULE: ./node_modules/.pnpm/axios@1.6.8/node_modules/axios/lib/defaults/index.js










/**
 * It takes a string, tries to parse it, and if it fails, it returns the stringified version
 * of the input
 *
 * @param {any} rawValue - The value to be stringified.
 * @param {Function} parser - A function that parses a string into a JavaScript object.
 * @param {Function} encoder - A function that takes a value and returns a string.
 *
 * @returns {string} A stringified version of the rawValue.
 */
function stringifySafely(rawValue, parser, encoder) {
  if (utils.isString(rawValue)) {
    try {
      (parser || JSON.parse)(rawValue);
      return utils.trim(rawValue);
    } catch (e) {
      if (e.name !== 'SyntaxError') {
        throw e;
      }
    }
  }

  return (encoder || JSON.stringify)(rawValue);
}

const defaults = {

  transitional: defaults_transitional,

  adapter: ['xhr', 'http'],

  transformRequest: [function transformRequest(data, headers) {
    const contentType = headers.getContentType() || '';
    const hasJSONContentType = contentType.indexOf('application/json') > -1;
    const isObjectPayload = utils.isObject(data);

    if (isObjectPayload && utils.isHTMLForm(data)) {
      data = new FormData(data);
    }

    const isFormData = utils.isFormData(data);

    if (isFormData) {
      return hasJSONContentType ? JSON.stringify(helpers_formDataToJSON(data)) : data;
    }

    if (utils.isArrayBuffer(data) ||
      utils.isBuffer(data) ||
      utils.isStream(data) ||
      utils.isFile(data) ||
      utils.isBlob(data)
    ) {
      return data;
    }
    if (utils.isArrayBufferView(data)) {
      return data.buffer;
    }
    if (utils.isURLSearchParams(data)) {
      headers.setContentType('application/x-www-form-urlencoded;charset=utf-8', false);
      return data.toString();
    }

    let isFileList;

    if (isObjectPayload) {
      if (contentType.indexOf('application/x-www-form-urlencoded') > -1) {
        return toURLEncodedForm(data, this.formSerializer).toString();
      }

      if ((isFileList = utils.isFileList(data)) || contentType.indexOf('multipart/form-data') > -1) {
        const _FormData = this.env && this.env.FormData;

        return helpers_toFormData(
          isFileList ? {'files[]': data} : data,
          _FormData && new _FormData(),
          this.formSerializer
        );
      }
    }

    if (isObjectPayload || hasJSONContentType ) {
      headers.setContentType('application/json', false);
      return stringifySafely(data);
    }

    return data;
  }],

  transformResponse: [function transformResponse(data) {
    const transitional = this.transitional || defaults.transitional;
    const forcedJSONParsing = transitional && transitional.forcedJSONParsing;
    const JSONRequested = this.responseType === 'json';

    if (data && utils.isString(data) && ((forcedJSONParsing && !this.responseType) || JSONRequested)) {
      const silentJSONParsing = transitional && transitional.silentJSONParsing;
      const strictJSONParsing = !silentJSONParsing && JSONRequested;

      try {
        return JSON.parse(data);
      } catch (e) {
        if (strictJSONParsing) {
          if (e.name === 'SyntaxError') {
            throw core_AxiosError.from(e, core_AxiosError.ERR_BAD_RESPONSE, this, null, this.response);
          }
          throw e;
        }
      }
    }

    return data;
  }],

  /**
   * A timeout in milliseconds to abort a request. If set to 0 (default) a
   * timeout is not created.
   */
  timeout: 0,

  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',

  maxContentLength: -1,
  maxBodyLength: -1,

  env: {
    FormData: platform.classes.FormData,
    Blob: platform.classes.Blob
  },

  validateStatus: function validateStatus(status) {
    return status >= 200 && status < 300;
  },

  headers: {
    common: {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': undefined
    }
  }
};

utils.forEach(['delete', 'get', 'head', 'post', 'put', 'patch'], (method) => {
  defaults.headers[method] = {};
});

/* harmony default export */ const lib_defaults = (defaults);

;// CONCATENATED MODULE: ./node_modules/.pnpm/axios@1.6.8/node_modules/axios/lib/helpers/parseHeaders.js




// RawAxiosHeaders whose duplicates are ignored by node
// c.f. https://nodejs.org/api/http.html#http_message_headers
const ignoreDuplicateOf = utils.toObjectSet([
  'age', 'authorization', 'content-length', 'content-type', 'etag',
  'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
  'last-modified', 'location', 'max-forwards', 'proxy-authorization',
  'referer', 'retry-after', 'user-agent'
]);

/**
 * Parse headers into an object
 *
 * ```
 * Date: Wed, 27 Aug 2014 08:58:49 GMT
 * Content-Type: application/json
 * Connection: keep-alive
 * Transfer-Encoding: chunked
 * ```
 *
 * @param {String} rawHeaders Headers needing to be parsed
 *
 * @returns {Object} Headers parsed into an object
 */
/* harmony default export */ const parseHeaders = (rawHeaders => {
  const parsed = {};
  let key;
  let val;
  let i;

  rawHeaders && rawHeaders.split('\n').forEach(function parser(line) {
    i = line.indexOf(':');
    key = line.substring(0, i).trim().toLowerCase();
    val = line.substring(i + 1).trim();

    if (!key || (parsed[key] && ignoreDuplicateOf[key])) {
      return;
    }

    if (key === 'set-cookie') {
      if (parsed[key]) {
        parsed[key].push(val);
      } else {
        parsed[key] = [val];
      }
    } else {
      parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
    }
  });

  return parsed;
});

;// CONCATENATED MODULE: ./node_modules/.pnpm/axios@1.6.8/node_modules/axios/lib/core/AxiosHeaders.js





const $internals = Symbol('internals');

function normalizeHeader(header) {
  return header && String(header).trim().toLowerCase();
}

function normalizeValue(value) {
  if (value === false || value == null) {
    return value;
  }

  return utils.isArray(value) ? value.map(normalizeValue) : String(value);
}

function parseTokens(str) {
  const tokens = Object.create(null);
  const tokensRE = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;
  let match;

  while ((match = tokensRE.exec(str))) {
    tokens[match[1]] = match[2];
  }

  return tokens;
}

const isValidHeaderName = (str) => /^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(str.trim());

function matchHeaderValue(context, value, header, filter, isHeaderNameFilter) {
  if (utils.isFunction(filter)) {
    return filter.call(this, value, header);
  }

  if (isHeaderNameFilter) {
    value = header;
  }

  if (!utils.isString(value)) return;

  if (utils.isString(filter)) {
    return value.indexOf(filter) !== -1;
  }

  if (utils.isRegExp(filter)) {
    return filter.test(value);
  }
}

function formatHeader(header) {
  return header.trim()
    .toLowerCase().replace(/([a-z\d])(\w*)/g, (w, char, str) => {
      return char.toUpperCase() + str;
    });
}

function buildAccessors(obj, header) {
  const accessorName = utils.toCamelCase(' ' + header);

  ['get', 'set', 'has'].forEach(methodName => {
    Object.defineProperty(obj, methodName + accessorName, {
      value: function(arg1, arg2, arg3) {
        return this[methodName].call(this, header, arg1, arg2, arg3);
      },
      configurable: true
    });
  });
}

class AxiosHeaders {
  constructor(headers) {
    headers && this.set(headers);
  }

  set(header, valueOrRewrite, rewrite) {
    const self = this;

    function setHeader(_value, _header, _rewrite) {
      const lHeader = normalizeHeader(_header);

      if (!lHeader) {
        throw new Error('header name must be a non-empty string');
      }

      const key = utils.findKey(self, lHeader);

      if(!key || self[key] === undefined || _rewrite === true || (_rewrite === undefined && self[key] !== false)) {
        self[key || _header] = normalizeValue(_value);
      }
    }

    const setHeaders = (headers, _rewrite) =>
      utils.forEach(headers, (_value, _header) => setHeader(_value, _header, _rewrite));

    if (utils.isPlainObject(header) || header instanceof this.constructor) {
      setHeaders(header, valueOrRewrite)
    } else if(utils.isString(header) && (header = header.trim()) && !isValidHeaderName(header)) {
      setHeaders(parseHeaders(header), valueOrRewrite);
    } else {
      header != null && setHeader(valueOrRewrite, header, rewrite);
    }

    return this;
  }

  get(header, parser) {
    header = normalizeHeader(header);

    if (header) {
      const key = utils.findKey(this, header);

      if (key) {
        const value = this[key];

        if (!parser) {
          return value;
        }

        if (parser === true) {
          return parseTokens(value);
        }

        if (utils.isFunction(parser)) {
          return parser.call(this, value, key);
        }

        if (utils.isRegExp(parser)) {
          return parser.exec(value);
        }

        throw new TypeError('parser must be boolean|regexp|function');
      }
    }
  }

  has(header, matcher) {
    header = normalizeHeader(header);

    if (header) {
      const key = utils.findKey(this, header);

      return !!(key && this[key] !== undefined && (!matcher || matchHeaderValue(this, this[key], key, matcher)));
    }

    return false;
  }

  delete(header, matcher) {
    const self = this;
    let deleted = false;

    function deleteHeader(_header) {
      _header = normalizeHeader(_header);

      if (_header) {
        const key = utils.findKey(self, _header);

        if (key && (!matcher || matchHeaderValue(self, self[key], key, matcher))) {
          delete self[key];

          deleted = true;
        }
      }
    }

    if (utils.isArray(header)) {
      header.forEach(deleteHeader);
    } else {
      deleteHeader(header);
    }

    return deleted;
  }

  clear(matcher) {
    const keys = Object.keys(this);
    let i = keys.length;
    let deleted = false;

    while (i--) {
      const key = keys[i];
      if(!matcher || matchHeaderValue(this, this[key], key, matcher, true)) {
        delete this[key];
        deleted = true;
      }
    }

    return deleted;
  }

  normalize(format) {
    const self = this;
    const headers = {};

    utils.forEach(this, (value, header) => {
      const key = utils.findKey(headers, header);

      if (key) {
        self[key] = normalizeValue(value);
        delete self[header];
        return;
      }

      const normalized = format ? formatHeader(header) : String(header).trim();

      if (normalized !== header) {
        delete self[header];
      }

      self[normalized] = normalizeValue(value);

      headers[normalized] = true;
    });

    return this;
  }

  concat(...targets) {
    return this.constructor.concat(this, ...targets);
  }

  toJSON(asStrings) {
    const obj = Object.create(null);

    utils.forEach(this, (value, header) => {
      value != null && value !== false && (obj[header] = asStrings && utils.isArray(value) ? value.join(', ') : value);
    });

    return obj;
  }

  [Symbol.iterator]() {
    return Object.entries(this.toJSON())[Symbol.iterator]();
  }

  toString() {
    return Object.entries(this.toJSON()).map(([header, value]) => header + ': ' + value).join('\n');
  }

  get [Symbol.toStringTag]() {
    return 'AxiosHeaders';
  }

  static from(thing) {
    return thing instanceof this ? thing : new this(thing);
  }

  static concat(first, ...targets) {
    const computed = new this(first);

    targets.forEach((target) => computed.set(target));

    return computed;
  }

  static accessor(header) {
    const internals = this[$internals] = (this[$internals] = {
      accessors: {}
    });

    const accessors = internals.accessors;
    const prototype = this.prototype;

    function defineAccessor(_header) {
      const lHeader = normalizeHeader(_header);

      if (!accessors[lHeader]) {
        buildAccessors(prototype, _header);
        accessors[lHeader] = true;
      }
    }

    utils.isArray(header) ? header.forEach(defineAccessor) : defineAccessor(header);

    return this;
  }
}

AxiosHeaders.accessor(['Content-Type', 'Content-Length', 'Accept', 'Accept-Encoding', 'User-Agent', 'Authorization']);

// reserved names hotfix
utils.reduceDescriptors(AxiosHeaders.prototype, ({value}, key) => {
  let mapped = key[0].toUpperCase() + key.slice(1); // map `set` => `Set`
  return {
    get: () => value,
    set(headerValue) {
      this[mapped] = headerValue;
    }
  }
});

utils.freezeMethods(AxiosHeaders);

/* harmony default export */ const core_AxiosHeaders = (AxiosHeaders);

;// CONCATENATED MODULE: ./node_modules/.pnpm/axios@1.6.8/node_modules/axios/lib/core/transformData.js






/**
 * Transform the data for a request or a response
 *
 * @param {Array|Function} fns A single function or Array of functions
 * @param {?Object} response The response object
 *
 * @returns {*} The resulting transformed data
 */
function transformData(fns, response) {
  const config = this || lib_defaults;
  const context = response || config;
  const headers = core_AxiosHeaders.from(context.headers);
  let data = context.data;

  utils.forEach(fns, function transform(fn) {
    data = fn.call(config, data, headers.normalize(), response ? response.status : undefined);
  });

  headers.normalize();

  return data;
}

;// CONCATENATED MODULE: ./node_modules/.pnpm/axios@1.6.8/node_modules/axios/lib/cancel/isCancel.js


function isCancel(value) {
  return !!(value && value.__CANCEL__);
}

;// CONCATENATED MODULE: ./node_modules/.pnpm/axios@1.6.8/node_modules/axios/lib/cancel/CanceledError.js





/**
 * A `CanceledError` is an object that is thrown when an operation is canceled.
 *
 * @param {string=} message The message.
 * @param {Object=} config The config.
 * @param {Object=} request The request.
 *
 * @returns {CanceledError} The created error.
 */
function CanceledError(message, config, request) {
  // eslint-disable-next-line no-eq-null,eqeqeq
  core_AxiosError.call(this, message == null ? 'canceled' : message, core_AxiosError.ERR_CANCELED, config, request);
  this.name = 'CanceledError';
}

utils.inherits(CanceledError, core_AxiosError, {
  __CANCEL__: true
});

/* harmony default export */ const cancel_CanceledError = (CanceledError);

;// CONCATENATED MODULE: ./node_modules/.pnpm/axios@1.6.8/node_modules/axios/lib/core/settle.js




/**
 * Resolve or reject a Promise based on response status.
 *
 * @param {Function} resolve A function that resolves the promise.
 * @param {Function} reject A function that rejects the promise.
 * @param {object} response The response.
 *
 * @returns {object} The response.
 */
function settle(resolve, reject, response) {
  const validateStatus = response.config.validateStatus;
  if (!response.status || !validateStatus || validateStatus(response.status)) {
    resolve(response);
  } else {
    reject(new core_AxiosError(
      'Request failed with status code ' + response.status,
      [core_AxiosError.ERR_BAD_REQUEST, core_AxiosError.ERR_BAD_RESPONSE][Math.floor(response.status / 100) - 4],
      response.config,
      response.request,
      response
    ));
  }
}

;// CONCATENATED MODULE: ./node_modules/.pnpm/axios@1.6.8/node_modules/axios/lib/helpers/cookies.js



/* harmony default export */ const cookies = (platform.hasStandardBrowserEnv ?

  // Standard browser envs support document.cookie
  {
    write(name, value, expires, path, domain, secure) {
      const cookie = [name + '=' + encodeURIComponent(value)];

      utils.isNumber(expires) && cookie.push('expires=' + new Date(expires).toGMTString());

      utils.isString(path) && cookie.push('path=' + path);

      utils.isString(domain) && cookie.push('domain=' + domain);

      secure === true && cookie.push('secure');

      document.cookie = cookie.join('; ');
    },

    read(name) {
      const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
      return (match ? decodeURIComponent(match[3]) : null);
    },

    remove(name) {
      this.write(name, '', Date.now() - 86400000);
    }
  }

  :

  // Non-standard browser env (web workers, react-native) lack needed support.
  {
    write() {},
    read() {
      return null;
    },
    remove() {}
  });


;// CONCATENATED MODULE: ./node_modules/.pnpm/axios@1.6.8/node_modules/axios/lib/helpers/isAbsoluteURL.js


/**
 * Determines whether the specified URL is absolute
 *
 * @param {string} url The URL to test
 *
 * @returns {boolean} True if the specified URL is absolute, otherwise false
 */
function isAbsoluteURL(url) {
  // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
  // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
  // by any combination of letters, digits, plus, period, or hyphen.
  return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url);
}

;// CONCATENATED MODULE: ./node_modules/.pnpm/axios@1.6.8/node_modules/axios/lib/helpers/combineURLs.js


/**
 * Creates a new URL by combining the specified URLs
 *
 * @param {string} baseURL The base URL
 * @param {string} relativeURL The relative URL
 *
 * @returns {string} The combined URL
 */
function combineURLs(baseURL, relativeURL) {
  return relativeURL
    ? baseURL.replace(/\/?\/$/, '') + '/' + relativeURL.replace(/^\/+/, '')
    : baseURL;
}

;// CONCATENATED MODULE: ./node_modules/.pnpm/axios@1.6.8/node_modules/axios/lib/core/buildFullPath.js





/**
 * Creates a new URL by combining the baseURL with the requestedURL,
 * only when the requestedURL is not already an absolute URL.
 * If the requestURL is absolute, this function returns the requestedURL untouched.
 *
 * @param {string} baseURL The base URL
 * @param {string} requestedURL Absolute or relative URL to combine
 *
 * @returns {string} The combined full path
 */
function buildFullPath(baseURL, requestedURL) {
  if (baseURL && !isAbsoluteURL(requestedURL)) {
    return combineURLs(baseURL, requestedURL);
  }
  return requestedURL;
}

;// CONCATENATED MODULE: ./node_modules/.pnpm/axios@1.6.8/node_modules/axios/lib/helpers/isURLSameOrigin.js





/* harmony default export */ const isURLSameOrigin = (platform.hasStandardBrowserEnv ?

// Standard browser envs have full support of the APIs needed to test
// whether the request URL is of the same origin as current location.
  (function standardBrowserEnv() {
    const msie = /(msie|trident)/i.test(navigator.userAgent);
    const urlParsingNode = document.createElement('a');
    let originURL;

    /**
    * Parse a URL to discover its components
    *
    * @param {String} url The URL to be parsed
    * @returns {Object}
    */
    function resolveURL(url) {
      let href = url;

      if (msie) {
        // IE needs attribute set twice to normalize properties
        urlParsingNode.setAttribute('href', href);
        href = urlParsingNode.href;
      }

      urlParsingNode.setAttribute('href', href);

      // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
      return {
        href: urlParsingNode.href,
        protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
        host: urlParsingNode.host,
        search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
        hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
        hostname: urlParsingNode.hostname,
        port: urlParsingNode.port,
        pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
          urlParsingNode.pathname :
          '/' + urlParsingNode.pathname
      };
    }

    originURL = resolveURL(window.location.href);

    /**
    * Determine if a URL shares the same origin as the current location
    *
    * @param {String} requestURL The URL to test
    * @returns {boolean} True if URL shares the same origin, otherwise false
    */
    return function isURLSameOrigin(requestURL) {
      const parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
      return (parsed.protocol === originURL.protocol &&
          parsed.host === originURL.host);
    };
  })() :

  // Non standard browser envs (web workers, react-native) lack needed support.
  (function nonStandardBrowserEnv() {
    return function isURLSameOrigin() {
      return true;
    };
  })());

;// CONCATENATED MODULE: ./node_modules/.pnpm/axios@1.6.8/node_modules/axios/lib/helpers/parseProtocol.js


function parseProtocol(url) {
  const match = /^([-+\w]{1,25})(:?\/\/|:)/.exec(url);
  return match && match[1] || '';
}

;// CONCATENATED MODULE: ./node_modules/.pnpm/axios@1.6.8/node_modules/axios/lib/helpers/speedometer.js


/**
 * Calculate data maxRate
 * @param {Number} [samplesCount= 10]
 * @param {Number} [min= 1000]
 * @returns {Function}
 */
function speedometer(samplesCount, min) {
  samplesCount = samplesCount || 10;
  const bytes = new Array(samplesCount);
  const timestamps = new Array(samplesCount);
  let head = 0;
  let tail = 0;
  let firstSampleTS;

  min = min !== undefined ? min : 1000;

  return function push(chunkLength) {
    const now = Date.now();

    const startedAt = timestamps[tail];

    if (!firstSampleTS) {
      firstSampleTS = now;
    }

    bytes[head] = chunkLength;
    timestamps[head] = now;

    let i = tail;
    let bytesCount = 0;

    while (i !== head) {
      bytesCount += bytes[i++];
      i = i % samplesCount;
    }

    head = (head + 1) % samplesCount;

    if (head === tail) {
      tail = (tail + 1) % samplesCount;
    }

    if (now - firstSampleTS < min) {
      return;
    }

    const passed = startedAt && now - startedAt;

    return passed ? Math.round(bytesCount * 1000 / passed) : undefined;
  };
}

/* harmony default export */ const helpers_speedometer = (speedometer);

;// CONCATENATED MODULE: ./node_modules/.pnpm/axios@1.6.8/node_modules/axios/lib/adapters/xhr.js
















function progressEventReducer(listener, isDownloadStream) {
  let bytesNotified = 0;
  const _speedometer = helpers_speedometer(50, 250);

  return e => {
    const loaded = e.loaded;
    const total = e.lengthComputable ? e.total : undefined;
    const progressBytes = loaded - bytesNotified;
    const rate = _speedometer(progressBytes);
    const inRange = loaded <= total;

    bytesNotified = loaded;

    const data = {
      loaded,
      total,
      progress: total ? (loaded / total) : undefined,
      bytes: progressBytes,
      rate: rate ? rate : undefined,
      estimated: rate && total && inRange ? (total - loaded) / rate : undefined,
      event: e
    };

    data[isDownloadStream ? 'download' : 'upload'] = true;

    listener(data);
  };
}

const isXHRAdapterSupported = typeof XMLHttpRequest !== 'undefined';

/* harmony default export */ const xhr = (isXHRAdapterSupported && function (config) {
  return new Promise(function dispatchXhrRequest(resolve, reject) {
    let requestData = config.data;
    const requestHeaders = core_AxiosHeaders.from(config.headers).normalize();
    let {responseType, withXSRFToken} = config;
    let onCanceled;
    function done() {
      if (config.cancelToken) {
        config.cancelToken.unsubscribe(onCanceled);
      }

      if (config.signal) {
        config.signal.removeEventListener('abort', onCanceled);
      }
    }

    let contentType;

    if (utils.isFormData(requestData)) {
      if (platform.hasStandardBrowserEnv || platform.hasStandardBrowserWebWorkerEnv) {
        requestHeaders.setContentType(false); // Let the browser set it
      } else if ((contentType = requestHeaders.getContentType()) !== false) {
        // fix semicolon duplication issue for ReactNative FormData implementation
        const [type, ...tokens] = contentType ? contentType.split(';').map(token => token.trim()).filter(Boolean) : [];
        requestHeaders.setContentType([type || 'multipart/form-data', ...tokens].join('; '));
      }
    }

    let request = new XMLHttpRequest();

    // HTTP basic authentication
    if (config.auth) {
      const username = config.auth.username || '';
      const password = config.auth.password ? unescape(encodeURIComponent(config.auth.password)) : '';
      requestHeaders.set('Authorization', 'Basic ' + btoa(username + ':' + password));
    }

    const fullPath = buildFullPath(config.baseURL, config.url);

    request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);

    // Set the request timeout in MS
    request.timeout = config.timeout;

    function onloadend() {
      if (!request) {
        return;
      }
      // Prepare the response
      const responseHeaders = core_AxiosHeaders.from(
        'getAllResponseHeaders' in request && request.getAllResponseHeaders()
      );
      const responseData = !responseType || responseType === 'text' || responseType === 'json' ?
        request.responseText : request.response;
      const response = {
        data: responseData,
        status: request.status,
        statusText: request.statusText,
        headers: responseHeaders,
        config,
        request
      };

      settle(function _resolve(value) {
        resolve(value);
        done();
      }, function _reject(err) {
        reject(err);
        done();
      }, response);

      // Clean up request
      request = null;
    }

    if ('onloadend' in request) {
      // Use onloadend if available
      request.onloadend = onloadend;
    } else {
      // Listen for ready state to emulate onloadend
      request.onreadystatechange = function handleLoad() {
        if (!request || request.readyState !== 4) {
          return;
        }

        // The request errored out and we didn't get a response, this will be
        // handled by onerror instead
        // With one exception: request that using file: protocol, most browsers
        // will return status as 0 even though it's a successful request
        if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
          return;
        }
        // readystate handler is calling before onerror or ontimeout handlers,
        // so we should call onloadend on the next 'tick'
        setTimeout(onloadend);
      };
    }

    // Handle browser request cancellation (as opposed to a manual cancellation)
    request.onabort = function handleAbort() {
      if (!request) {
        return;
      }

      reject(new core_AxiosError('Request aborted', core_AxiosError.ECONNABORTED, config, request));

      // Clean up request
      request = null;
    };

    // Handle low level network errors
    request.onerror = function handleError() {
      // Real errors are hidden from us by the browser
      // onerror should only fire if it's a network error
      reject(new core_AxiosError('Network Error', core_AxiosError.ERR_NETWORK, config, request));

      // Clean up request
      request = null;
    };

    // Handle timeout
    request.ontimeout = function handleTimeout() {
      let timeoutErrorMessage = config.timeout ? 'timeout of ' + config.timeout + 'ms exceeded' : 'timeout exceeded';
      const transitional = config.transitional || defaults_transitional;
      if (config.timeoutErrorMessage) {
        timeoutErrorMessage = config.timeoutErrorMessage;
      }
      reject(new core_AxiosError(
        timeoutErrorMessage,
        transitional.clarifyTimeoutError ? core_AxiosError.ETIMEDOUT : core_AxiosError.ECONNABORTED,
        config,
        request));

      // Clean up request
      request = null;
    };

    // Add xsrf header
    // This is only done if running in a standard browser environment.
    // Specifically not if we're in a web worker, or react-native.
    if(platform.hasStandardBrowserEnv) {
      withXSRFToken && utils.isFunction(withXSRFToken) && (withXSRFToken = withXSRFToken(config));

      if (withXSRFToken || (withXSRFToken !== false && isURLSameOrigin(fullPath))) {
        // Add xsrf header
        const xsrfValue = config.xsrfHeaderName && config.xsrfCookieName && cookies.read(config.xsrfCookieName);

        if (xsrfValue) {
          requestHeaders.set(config.xsrfHeaderName, xsrfValue);
        }
      }
    }

    // Remove Content-Type if data is undefined
    requestData === undefined && requestHeaders.setContentType(null);

    // Add headers to the request
    if ('setRequestHeader' in request) {
      utils.forEach(requestHeaders.toJSON(), function setRequestHeader(val, key) {
        request.setRequestHeader(key, val);
      });
    }

    // Add withCredentials to request if needed
    if (!utils.isUndefined(config.withCredentials)) {
      request.withCredentials = !!config.withCredentials;
    }

    // Add responseType to request if needed
    if (responseType && responseType !== 'json') {
      request.responseType = config.responseType;
    }

    // Handle progress if needed
    if (typeof config.onDownloadProgress === 'function') {
      request.addEventListener('progress', progressEventReducer(config.onDownloadProgress, true));
    }

    // Not all browsers support upload events
    if (typeof config.onUploadProgress === 'function' && request.upload) {
      request.upload.addEventListener('progress', progressEventReducer(config.onUploadProgress));
    }

    if (config.cancelToken || config.signal) {
      // Handle cancellation
      // eslint-disable-next-line func-names
      onCanceled = cancel => {
        if (!request) {
          return;
        }
        reject(!cancel || cancel.type ? new cancel_CanceledError(null, config, request) : cancel);
        request.abort();
        request = null;
      };

      config.cancelToken && config.cancelToken.subscribe(onCanceled);
      if (config.signal) {
        config.signal.aborted ? onCanceled() : config.signal.addEventListener('abort', onCanceled);
      }
    }

    const protocol = parseProtocol(fullPath);

    if (protocol && platform.protocols.indexOf(protocol) === -1) {
      reject(new core_AxiosError('Unsupported protocol ' + protocol + ':', core_AxiosError.ERR_BAD_REQUEST, config));
      return;
    }


    // Send the request
    request.send(requestData || null);
  });
});

;// CONCATENATED MODULE: ./node_modules/.pnpm/axios@1.6.8/node_modules/axios/lib/adapters/adapters.js





const knownAdapters = {
  http: helpers_null,
  xhr: xhr
}

utils.forEach(knownAdapters, (fn, value) => {
  if (fn) {
    try {
      Object.defineProperty(fn, 'name', {value});
    } catch (e) {
      // eslint-disable-next-line no-empty
    }
    Object.defineProperty(fn, 'adapterName', {value});
  }
});

const renderReason = (reason) => `- ${reason}`;

const isResolvedHandle = (adapter) => utils.isFunction(adapter) || adapter === null || adapter === false;

/* harmony default export */ const adapters = ({
  getAdapter: (adapters) => {
    adapters = utils.isArray(adapters) ? adapters : [adapters];

    const {length} = adapters;
    let nameOrAdapter;
    let adapter;

    const rejectedReasons = {};

    for (let i = 0; i < length; i++) {
      nameOrAdapter = adapters[i];
      let id;

      adapter = nameOrAdapter;

      if (!isResolvedHandle(nameOrAdapter)) {
        adapter = knownAdapters[(id = String(nameOrAdapter)).toLowerCase()];

        if (adapter === undefined) {
          throw new core_AxiosError(`Unknown adapter '${id}'`);
        }
      }

      if (adapter) {
        break;
      }

      rejectedReasons[id || '#' + i] = adapter;
    }

    if (!adapter) {

      const reasons = Object.entries(rejectedReasons)
        .map(([id, state]) => `adapter ${id} ` +
          (state === false ? 'is not supported by the environment' : 'is not available in the build')
        );

      let s = length ?
        (reasons.length > 1 ? 'since :\n' + reasons.map(renderReason).join('\n') : ' ' + renderReason(reasons[0])) :
        'as no adapter specified';

      throw new core_AxiosError(
        `There is no suitable adapter to dispatch the request ` + s,
        'ERR_NOT_SUPPORT'
      );
    }

    return adapter;
  },
  adapters: knownAdapters
});

;// CONCATENATED MODULE: ./node_modules/.pnpm/axios@1.6.8/node_modules/axios/lib/core/dispatchRequest.js









/**
 * Throws a `CanceledError` if cancellation has been requested.
 *
 * @param {Object} config The config that is to be used for the request
 *
 * @returns {void}
 */
function throwIfCancellationRequested(config) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }

  if (config.signal && config.signal.aborted) {
    throw new cancel_CanceledError(null, config);
  }
}

/**
 * Dispatch a request to the server using the configured adapter.
 *
 * @param {object} config The config that is to be used for the request
 *
 * @returns {Promise} The Promise to be fulfilled
 */
function dispatchRequest(config) {
  throwIfCancellationRequested(config);

  config.headers = core_AxiosHeaders.from(config.headers);

  // Transform request data
  config.data = transformData.call(
    config,
    config.transformRequest
  );

  if (['post', 'put', 'patch'].indexOf(config.method) !== -1) {
    config.headers.setContentType('application/x-www-form-urlencoded', false);
  }

  const adapter = adapters.getAdapter(config.adapter || lib_defaults.adapter);

  return adapter(config).then(function onAdapterResolution(response) {
    throwIfCancellationRequested(config);

    // Transform response data
    response.data = transformData.call(
      config,
      config.transformResponse,
      response
    );

    response.headers = core_AxiosHeaders.from(response.headers);

    return response;
  }, function onAdapterRejection(reason) {
    if (!isCancel(reason)) {
      throwIfCancellationRequested(config);

      // Transform response data
      if (reason && reason.response) {
        reason.response.data = transformData.call(
          config,
          config.transformResponse,
          reason.response
        );
        reason.response.headers = core_AxiosHeaders.from(reason.response.headers);
      }
    }

    return Promise.reject(reason);
  });
}

;// CONCATENATED MODULE: ./node_modules/.pnpm/axios@1.6.8/node_modules/axios/lib/core/mergeConfig.js





const headersToObject = (thing) => thing instanceof core_AxiosHeaders ? { ...thing } : thing;

/**
 * Config-specific merge-function which creates a new config-object
 * by merging two configuration objects together.
 *
 * @param {Object} config1
 * @param {Object} config2
 *
 * @returns {Object} New object resulting from merging config2 to config1
 */
function mergeConfig(config1, config2) {
  // eslint-disable-next-line no-param-reassign
  config2 = config2 || {};
  const config = {};

  function getMergedValue(target, source, caseless) {
    if (utils.isPlainObject(target) && utils.isPlainObject(source)) {
      return utils.merge.call({caseless}, target, source);
    } else if (utils.isPlainObject(source)) {
      return utils.merge({}, source);
    } else if (utils.isArray(source)) {
      return source.slice();
    }
    return source;
  }

  // eslint-disable-next-line consistent-return
  function mergeDeepProperties(a, b, caseless) {
    if (!utils.isUndefined(b)) {
      return getMergedValue(a, b, caseless);
    } else if (!utils.isUndefined(a)) {
      return getMergedValue(undefined, a, caseless);
    }
  }

  // eslint-disable-next-line consistent-return
  function valueFromConfig2(a, b) {
    if (!utils.isUndefined(b)) {
      return getMergedValue(undefined, b);
    }
  }

  // eslint-disable-next-line consistent-return
  function defaultToConfig2(a, b) {
    if (!utils.isUndefined(b)) {
      return getMergedValue(undefined, b);
    } else if (!utils.isUndefined(a)) {
      return getMergedValue(undefined, a);
    }
  }

  // eslint-disable-next-line consistent-return
  function mergeDirectKeys(a, b, prop) {
    if (prop in config2) {
      return getMergedValue(a, b);
    } else if (prop in config1) {
      return getMergedValue(undefined, a);
    }
  }

  const mergeMap = {
    url: valueFromConfig2,
    method: valueFromConfig2,
    data: valueFromConfig2,
    baseURL: defaultToConfig2,
    transformRequest: defaultToConfig2,
    transformResponse: defaultToConfig2,
    paramsSerializer: defaultToConfig2,
    timeout: defaultToConfig2,
    timeoutMessage: defaultToConfig2,
    withCredentials: defaultToConfig2,
    withXSRFToken: defaultToConfig2,
    adapter: defaultToConfig2,
    responseType: defaultToConfig2,
    xsrfCookieName: defaultToConfig2,
    xsrfHeaderName: defaultToConfig2,
    onUploadProgress: defaultToConfig2,
    onDownloadProgress: defaultToConfig2,
    decompress: defaultToConfig2,
    maxContentLength: defaultToConfig2,
    maxBodyLength: defaultToConfig2,
    beforeRedirect: defaultToConfig2,
    transport: defaultToConfig2,
    httpAgent: defaultToConfig2,
    httpsAgent: defaultToConfig2,
    cancelToken: defaultToConfig2,
    socketPath: defaultToConfig2,
    responseEncoding: defaultToConfig2,
    validateStatus: mergeDirectKeys,
    headers: (a, b) => mergeDeepProperties(headersToObject(a), headersToObject(b), true)
  };

  utils.forEach(Object.keys(Object.assign({}, config1, config2)), function computeConfigValue(prop) {
    const merge = mergeMap[prop] || mergeDeepProperties;
    const configValue = merge(config1[prop], config2[prop], prop);
    (utils.isUndefined(configValue) && merge !== mergeDirectKeys) || (config[prop] = configValue);
  });

  return config;
}

;// CONCATENATED MODULE: ./node_modules/.pnpm/axios@1.6.8/node_modules/axios/lib/env/data.js
const data_VERSION = "1.6.8";
;// CONCATENATED MODULE: ./node_modules/.pnpm/axios@1.6.8/node_modules/axios/lib/helpers/validator.js
/* provided dependency */ var validator_console = __webpack_require__(65640);





const validators = {};

// eslint-disable-next-line func-names
['object', 'boolean', 'number', 'function', 'string', 'symbol'].forEach((type, i) => {
  validators[type] = function validator(thing) {
    return typeof thing === type || 'a' + (i < 1 ? 'n ' : ' ') + type;
  };
});

const deprecatedWarnings = {};

/**
 * Transitional option validator
 *
 * @param {function|boolean?} validator - set to false if the transitional option has been removed
 * @param {string?} version - deprecated version / removed since version
 * @param {string?} message - some message with additional info
 *
 * @returns {function}
 */
validators.transitional = function transitional(validator, version, message) {
  function formatMessage(opt, desc) {
    return '[Axios v' + data_VERSION + '] Transitional option \'' + opt + '\'' + desc + (message ? '. ' + message : '');
  }

  // eslint-disable-next-line func-names
  return (value, opt, opts) => {
    if (validator === false) {
      throw new core_AxiosError(
        formatMessage(opt, ' has been removed' + (version ? ' in ' + version : '')),
        core_AxiosError.ERR_DEPRECATED
      );
    }

    if (version && !deprecatedWarnings[opt]) {
      deprecatedWarnings[opt] = true;
      // eslint-disable-next-line no-console
      validator_console.warn(
        formatMessage(
          opt,
          ' has been deprecated since v' + version + ' and will be removed in the near future'
        )
      );
    }

    return validator ? validator(value, opt, opts) : true;
  };
};

/**
 * Assert object's properties type
 *
 * @param {object} options
 * @param {object} schema
 * @param {boolean?} allowUnknown
 *
 * @returns {object}
 */

function assertOptions(options, schema, allowUnknown) {
  if (typeof options !== 'object') {
    throw new core_AxiosError('options must be an object', core_AxiosError.ERR_BAD_OPTION_VALUE);
  }
  const keys = Object.keys(options);
  let i = keys.length;
  while (i-- > 0) {
    const opt = keys[i];
    const validator = schema[opt];
    if (validator) {
      const value = options[opt];
      const result = value === undefined || validator(value, opt, options);
      if (result !== true) {
        throw new core_AxiosError('option ' + opt + ' must be ' + result, core_AxiosError.ERR_BAD_OPTION_VALUE);
      }
      continue;
    }
    if (allowUnknown !== true) {
      throw new core_AxiosError('Unknown option ' + opt, core_AxiosError.ERR_BAD_OPTION);
    }
  }
}

/* harmony default export */ const validator = ({
  assertOptions,
  validators
});

;// CONCATENATED MODULE: ./node_modules/.pnpm/axios@1.6.8/node_modules/axios/lib/core/Axios.js











const Axios_validators = validator.validators;

/**
 * Create a new instance of Axios
 *
 * @param {Object} instanceConfig The default config for the instance
 *
 * @return {Axios} A new instance of Axios
 */
class Axios {
  constructor(instanceConfig) {
    this.defaults = instanceConfig;
    this.interceptors = {
      request: new core_InterceptorManager(),
      response: new core_InterceptorManager()
    };
  }

  /**
   * Dispatch a request
   *
   * @param {String|Object} configOrUrl The config specific for this request (merged with this.defaults)
   * @param {?Object} config
   *
   * @returns {Promise} The Promise to be fulfilled
   */
  async request(configOrUrl, config) {
    try {
      return await this._request(configOrUrl, config);
    } catch (err) {
      if (err instanceof Error) {
        let dummy;

        Error.captureStackTrace ? Error.captureStackTrace(dummy = {}) : (dummy = new Error());

        // slice off the Error: ... line
        const stack = dummy.stack ? dummy.stack.replace(/^.+\n/, '') : '';

        if (!err.stack) {
          err.stack = stack;
          // match without the 2 top stack lines
        } else if (stack && !String(err.stack).endsWith(stack.replace(/^.+\n.+\n/, ''))) {
          err.stack += '\n' + stack
        }
      }

      throw err;
    }
  }

  _request(configOrUrl, config) {
    /*eslint no-param-reassign:0*/
    // Allow for axios('example/url'[, config]) a la fetch API
    if (typeof configOrUrl === 'string') {
      config = config || {};
      config.url = configOrUrl;
    } else {
      config = configOrUrl || {};
    }

    config = mergeConfig(this.defaults, config);

    const {transitional, paramsSerializer, headers} = config;

    if (transitional !== undefined) {
      validator.assertOptions(transitional, {
        silentJSONParsing: Axios_validators.transitional(Axios_validators.boolean),
        forcedJSONParsing: Axios_validators.transitional(Axios_validators.boolean),
        clarifyTimeoutError: Axios_validators.transitional(Axios_validators.boolean)
      }, false);
    }

    if (paramsSerializer != null) {
      if (utils.isFunction(paramsSerializer)) {
        config.paramsSerializer = {
          serialize: paramsSerializer
        }
      } else {
        validator.assertOptions(paramsSerializer, {
          encode: Axios_validators.function,
          serialize: Axios_validators.function
        }, true);
      }
    }

    // Set config.method
    config.method = (config.method || this.defaults.method || 'get').toLowerCase();

    // Flatten headers
    let contextHeaders = headers && utils.merge(
      headers.common,
      headers[config.method]
    );

    headers && utils.forEach(
      ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
      (method) => {
        delete headers[method];
      }
    );

    config.headers = core_AxiosHeaders.concat(contextHeaders, headers);

    // filter out skipped interceptors
    const requestInterceptorChain = [];
    let synchronousRequestInterceptors = true;
    this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
      if (typeof interceptor.runWhen === 'function' && interceptor.runWhen(config) === false) {
        return;
      }

      synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;

      requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
    });

    const responseInterceptorChain = [];
    this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
      responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
    });

    let promise;
    let i = 0;
    let len;

    if (!synchronousRequestInterceptors) {
      const chain = [dispatchRequest.bind(this), undefined];
      chain.unshift.apply(chain, requestInterceptorChain);
      chain.push.apply(chain, responseInterceptorChain);
      len = chain.length;

      promise = Promise.resolve(config);

      while (i < len) {
        promise = promise.then(chain[i++], chain[i++]);
      }

      return promise;
    }

    len = requestInterceptorChain.length;

    let newConfig = config;

    i = 0;

    while (i < len) {
      const onFulfilled = requestInterceptorChain[i++];
      const onRejected = requestInterceptorChain[i++];
      try {
        newConfig = onFulfilled(newConfig);
      } catch (error) {
        onRejected.call(this, error);
        break;
      }
    }

    try {
      promise = dispatchRequest.call(this, newConfig);
    } catch (error) {
      return Promise.reject(error);
    }

    i = 0;
    len = responseInterceptorChain.length;

    while (i < len) {
      promise = promise.then(responseInterceptorChain[i++], responseInterceptorChain[i++]);
    }

    return promise;
  }

  getUri(config) {
    config = mergeConfig(this.defaults, config);
    const fullPath = buildFullPath(config.baseURL, config.url);
    return buildURL(fullPath, config.params, config.paramsSerializer);
  }
}

// Provide aliases for supported request methods
utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, config) {
    return this.request(mergeConfig(config || {}, {
      method,
      url,
      data: (config || {}).data
    }));
  };
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  /*eslint func-names:0*/

  function generateHTTPMethod(isForm) {
    return function httpMethod(url, data, config) {
      return this.request(mergeConfig(config || {}, {
        method,
        headers: isForm ? {
          'Content-Type': 'multipart/form-data'
        } : {},
        url,
        data
      }));
    };
  }

  Axios.prototype[method] = generateHTTPMethod();

  Axios.prototype[method + 'Form'] = generateHTTPMethod(true);
});

/* harmony default export */ const core_Axios = (Axios);

;// CONCATENATED MODULE: ./node_modules/.pnpm/axios@1.6.8/node_modules/axios/lib/cancel/CancelToken.js




/**
 * A `CancelToken` is an object that can be used to request cancellation of an operation.
 *
 * @param {Function} executor The executor function.
 *
 * @returns {CancelToken}
 */
class CancelToken {
  constructor(executor) {
    if (typeof executor !== 'function') {
      throw new TypeError('executor must be a function.');
    }

    let resolvePromise;

    this.promise = new Promise(function promiseExecutor(resolve) {
      resolvePromise = resolve;
    });

    const token = this;

    // eslint-disable-next-line func-names
    this.promise.then(cancel => {
      if (!token._listeners) return;

      let i = token._listeners.length;

      while (i-- > 0) {
        token._listeners[i](cancel);
      }
      token._listeners = null;
    });

    // eslint-disable-next-line func-names
    this.promise.then = onfulfilled => {
      let _resolve;
      // eslint-disable-next-line func-names
      const promise = new Promise(resolve => {
        token.subscribe(resolve);
        _resolve = resolve;
      }).then(onfulfilled);

      promise.cancel = function reject() {
        token.unsubscribe(_resolve);
      };

      return promise;
    };

    executor(function cancel(message, config, request) {
      if (token.reason) {
        // Cancellation has already been requested
        return;
      }

      token.reason = new cancel_CanceledError(message, config, request);
      resolvePromise(token.reason);
    });
  }

  /**
   * Throws a `CanceledError` if cancellation has been requested.
   */
  throwIfRequested() {
    if (this.reason) {
      throw this.reason;
    }
  }

  /**
   * Subscribe to the cancel signal
   */

  subscribe(listener) {
    if (this.reason) {
      listener(this.reason);
      return;
    }

    if (this._listeners) {
      this._listeners.push(listener);
    } else {
      this._listeners = [listener];
    }
  }

  /**
   * Unsubscribe from the cancel signal
   */

  unsubscribe(listener) {
    if (!this._listeners) {
      return;
    }
    const index = this._listeners.indexOf(listener);
    if (index !== -1) {
      this._listeners.splice(index, 1);
    }
  }

  /**
   * Returns an object that contains a new `CancelToken` and a function that, when called,
   * cancels the `CancelToken`.
   */
  static source() {
    let cancel;
    const token = new CancelToken(function executor(c) {
      cancel = c;
    });
    return {
      token,
      cancel
    };
  }
}

/* harmony default export */ const cancel_CancelToken = (CancelToken);

;// CONCATENATED MODULE: ./node_modules/.pnpm/axios@1.6.8/node_modules/axios/lib/helpers/spread.js


/**
 * Syntactic sugar for invoking a function and expanding an array for arguments.
 *
 * Common use case would be to use `Function.prototype.apply`.
 *
 *  ```js
 *  function f(x, y, z) {}
 *  var args = [1, 2, 3];
 *  f.apply(null, args);
 *  ```
 *
 * With `spread` this example can be re-written.
 *
 *  ```js
 *  spread(function(x, y, z) {})([1, 2, 3]);
 *  ```
 *
 * @param {Function} callback
 *
 * @returns {Function}
 */
function spread(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr);
  };
}

;// CONCATENATED MODULE: ./node_modules/.pnpm/axios@1.6.8/node_modules/axios/lib/helpers/isAxiosError.js




/**
 * Determines whether the payload is an error thrown by Axios
 *
 * @param {*} payload The value to test
 *
 * @returns {boolean} True if the payload is an error thrown by Axios, otherwise false
 */
function isAxiosError(payload) {
  return utils.isObject(payload) && (payload.isAxiosError === true);
}

;// CONCATENATED MODULE: ./node_modules/.pnpm/axios@1.6.8/node_modules/axios/lib/helpers/HttpStatusCode.js
const HttpStatusCode = {
  Continue: 100,
  SwitchingProtocols: 101,
  Processing: 102,
  EarlyHints: 103,
  Ok: 200,
  Created: 201,
  Accepted: 202,
  NonAuthoritativeInformation: 203,
  NoContent: 204,
  ResetContent: 205,
  PartialContent: 206,
  MultiStatus: 207,
  AlreadyReported: 208,
  ImUsed: 226,
  MultipleChoices: 300,
  MovedPermanently: 301,
  Found: 302,
  SeeOther: 303,
  NotModified: 304,
  UseProxy: 305,
  Unused: 306,
  TemporaryRedirect: 307,
  PermanentRedirect: 308,
  BadRequest: 400,
  Unauthorized: 401,
  PaymentRequired: 402,
  Forbidden: 403,
  NotFound: 404,
  MethodNotAllowed: 405,
  NotAcceptable: 406,
  ProxyAuthenticationRequired: 407,
  RequestTimeout: 408,
  Conflict: 409,
  Gone: 410,
  LengthRequired: 411,
  PreconditionFailed: 412,
  PayloadTooLarge: 413,
  UriTooLong: 414,
  UnsupportedMediaType: 415,
  RangeNotSatisfiable: 416,
  ExpectationFailed: 417,
  ImATeapot: 418,
  MisdirectedRequest: 421,
  UnprocessableEntity: 422,
  Locked: 423,
  FailedDependency: 424,
  TooEarly: 425,
  UpgradeRequired: 426,
  PreconditionRequired: 428,
  TooManyRequests: 429,
  RequestHeaderFieldsTooLarge: 431,
  UnavailableForLegalReasons: 451,
  InternalServerError: 500,
  NotImplemented: 501,
  BadGateway: 502,
  ServiceUnavailable: 503,
  GatewayTimeout: 504,
  HttpVersionNotSupported: 505,
  VariantAlsoNegotiates: 506,
  InsufficientStorage: 507,
  LoopDetected: 508,
  NotExtended: 510,
  NetworkAuthenticationRequired: 511,
};

Object.entries(HttpStatusCode).forEach(([key, value]) => {
  HttpStatusCode[value] = key;
});

/* harmony default export */ const helpers_HttpStatusCode = (HttpStatusCode);

;// CONCATENATED MODULE: ./node_modules/.pnpm/axios@1.6.8/node_modules/axios/lib/axios.js




















/**
 * Create an instance of Axios
 *
 * @param {Object} defaultConfig The default config for the instance
 *
 * @returns {Axios} A new instance of Axios
 */
function createInstance(defaultConfig) {
  const context = new core_Axios(defaultConfig);
  const instance = bind(core_Axios.prototype.request, context);

  // Copy axios.prototype to instance
  utils.extend(instance, core_Axios.prototype, context, {allOwnKeys: true});

  // Copy context to instance
  utils.extend(instance, context, null, {allOwnKeys: true});

  // Factory for creating new instances
  instance.create = function create(instanceConfig) {
    return createInstance(mergeConfig(defaultConfig, instanceConfig));
  };

  return instance;
}

// Create the default instance to be exported
const axios = createInstance(lib_defaults);

// Expose Axios class to allow class inheritance
axios.Axios = core_Axios;

// Expose Cancel & CancelToken
axios.CanceledError = cancel_CanceledError;
axios.CancelToken = cancel_CancelToken;
axios.isCancel = isCancel;
axios.VERSION = data_VERSION;
axios.toFormData = helpers_toFormData;

// Expose AxiosError class
axios.AxiosError = core_AxiosError;

// alias for CanceledError for backward compatibility
axios.Cancel = axios.CanceledError;

// Expose all/spread
axios.all = function all(promises) {
  return Promise.all(promises);
};

axios.spread = spread;

// Expose isAxiosError
axios.isAxiosError = isAxiosError;

// Expose mergeConfig
axios.mergeConfig = mergeConfig;

axios.AxiosHeaders = core_AxiosHeaders;

axios.formToJSON = thing => helpers_formDataToJSON(utils.isHTMLForm(thing) ? new FormData(thing) : thing);

axios.getAdapter = adapters.getAdapter;

axios.HttpStatusCode = helpers_HttpStatusCode;

axios.default = axios;

// this module should only have a default export
/* harmony default export */ const lib_axios = (axios);

;// CONCATENATED MODULE: ./node_modules/.pnpm/@binance+w3w-core@1.1.7_bufferutil@4.0.8_ts-node@10.9.2_utf-8-validate@5.0.10/node_modules/@binance/w3w-core/dist/index.js
/* provided dependency */ var w3w_core_dist_console = __webpack_require__(65640);
function w3w_core_dist_e(e){if(e===void 0){throw new ReferenceError("this hasn't been initialised - super() hasn't been called")}return e}function w3w_core_dist_t(e,t,n,s,r,i,o){try{var a=e[i](o);var c=a.value}catch(e){n(e);return}if(a.done){t(c)}else{Promise.resolve(c).then(s,r)}}function w3w_core_dist_n(e){return function(){var n=this,s=arguments;return new Promise(function(r,i){var o=e.apply(n,s);function a(e){w3w_core_dist_t(o,r,i,a,c,"next",e)}function c(e){w3w_core_dist_t(o,r,i,a,c,"throw",e)}a(undefined)})}}function w3w_core_dist_s(e,t){if(!(e instanceof t)){throw new TypeError("Cannot call a class as a function")}}function w3w_core_dist_r(e,t){for(var n=0;n<t.length;n++){var s=t[n];s.enumerable=s.enumerable||false;s.configurable=true;if("value"in s)s.writable=true;Object.defineProperty(e,s.key,s)}}function w3w_core_dist_i(e,t,n){if(t)w3w_core_dist_r(e.prototype,t);if(n)w3w_core_dist_r(e,n);return e}function w3w_core_dist_o(e){w3w_core_dist_o=Object.setPrototypeOf?Object.getPrototypeOf:function e(e){return e.__proto__||Object.getPrototypeOf(e)};return w3w_core_dist_o(e)}function w3w_core_dist_a(e,t){if(typeof t!=="function"&&t!==null){throw new TypeError("Super expression must either be null or a function")}e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:true,configurable:true}});if(t)w3w_core_dist_h(e,t)}function w3w_core_dist_c(e,t){if(t!=null&&typeof Symbol!=="undefined"&&t[Symbol.hasInstance]){return!!t[Symbol.hasInstance](e)}else{return e instanceof t}}function w3w_core_dist_u(t,n){if(n&&(w3w_core_dist_l(n)==="object"||typeof n==="function")){return n}return w3w_core_dist_e(t)}function w3w_core_dist_h(e,t){w3w_core_dist_h=Object.setPrototypeOf||function e(e,t){e.__proto__=t;return e};return w3w_core_dist_h(e,t)}function w3w_core_dist_l(e){"@swc/helpers - typeof";return e&&typeof Symbol!=="undefined"&&e.constructor===Symbol?"symbol":typeof e}function w3w_core_dist_d(){if(typeof Reflect==="undefined"||!Reflect.construct)return false;if(Reflect.construct.sham)return false;if(typeof Proxy==="function")return true;try{Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],function(){}));return true}catch(e){return false}}function w3w_core_dist_f(e){var t=w3w_core_dist_d();return function n(){var n=w3w_core_dist_o(e),s;if(t){var r=w3w_core_dist_o(this).constructor;s=Reflect.construct(n,arguments,r)}else{s=n.apply(this,arguments)}return w3w_core_dist_u(this,s)}}function w3w_core_dist_p(e,t){var n,s,r,i,o={label:0,sent:function(){if(r[0]&1)throw r[1];return r[1]},trys:[],ops:[]};return i={next:a(0),"throw":a(1),"return":a(2)},typeof Symbol==="function"&&(i[Symbol.iterator]=function(){return this}),i;function a(e){return function(t){return c([e,t])}}function c(i){if(n)throw new TypeError("Generator is already executing.");while(o)try{if(n=1,s&&(r=i[0]&2?s["return"]:i[0]?s["throw"]||((r=s["return"])&&r.call(s),0):s.next)&&!(r=r.call(s,i[1])).done)return r;if(s=0,r)i=[i[0]&2,r.value];switch(i[0]){case 0:case 1:r=i;break;case 4:o.label++;return{value:i[1],done:false};case 5:o.label++;s=i[1];i=[0];continue;case 7:i=o.ops.pop();o.trys.pop();continue;default:if(!(r=o.trys,r=r.length>0&&r[r.length-1])&&(i[0]===6||i[0]===2)){o=0;continue}if(i[0]===3&&(!r||i[1]>r[0]&&i[1]<r[3])){o.label=i[1];break}if(i[0]===6&&o.label<r[1]){o.label=r[1];r=i;break}if(r&&o.label<r[2]){o.label=r[2];o.ops.push(i);break}if(r[2])o.ops.pop();o.trys.pop();continue}i=t.call(e,o)}catch(e){i=[6,e];s=0}finally{n=r=0}if(i[0]&5)throw i[1];return{value:i[0]?i[1]:void 0,done:true}}}var w3w_core_dist_y=Object.defineProperty;var w3w_core_dist_v=function(e,t,n){return t in e?w3w_core_dist_y(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n};var w3w_core_dist_=function(e,t,n){return w3w_core_dist_v(e,(typeof t==="undefined"?"undefined":w3w_core_dist_l(t))!="symbol"?t+"":t,n),n};var w3w_core_dist_Q="connect-session",w3w_core_dist_U="connect-domains",w3w_core_dist_V="wss://nbstream.binance.com/wallet-connector",w3w_core_dist_F=["https://rpc.ankr.com/bsc","https://binance.nodereal.io","https://bscrpc.com","https://bsc-dataseed2.ninicoin.io"];var dist_W=function(t){"use strict";w3w_core_dist_a(r,t);var n=w3w_core_dist_f(r);function r(){w3w_core_dist_s(this,r);var t;t=n.call.apply(n,[this].concat(Array.prototype.slice.call(arguments)));w3w_core_dist_(w3w_core_dist_e(t),"pending",!1);w3w_core_dist_(w3w_core_dist_e(t),"callbacks",new Map);w3w_core_dist_(w3w_core_dist_e(t),"clientMeta");w3w_core_dist_(w3w_core_dist_e(t),"relay");w3w_core_dist_(w3w_core_dist_e(t),"_key",null);w3w_core_dist_(w3w_core_dist_e(t),"_clientId","");w3w_core_dist_(w3w_core_dist_e(t),"_peerId","");w3w_core_dist_(w3w_core_dist_e(t),"_peerMeta",null);w3w_core_dist_(w3w_core_dist_e(t),"_handshakeId",0);w3w_core_dist_(w3w_core_dist_e(t),"_handshakeTopic","");w3w_core_dist_(w3w_core_dist_e(t),"_connected",!1);w3w_core_dist_(w3w_core_dist_e(t),"_accounts",[]);w3w_core_dist_(w3w_core_dist_e(t),"_chainId","0x0");return t}w3w_core_dist_i(r,[{key:"key",get:function e(){return this._key?eD(this._key,!0):""},set:function e(e){if(!e)return;var t=ej(e);this._key=t}},{key:"clientId",get:function e(){var e=this._clientId;return e||(e=this._clientId=q()),this._clientId},set:function e(e){e&&(this._clientId=e)}},{key:"peerId",get:function e(){return this._peerId},set:function e(e){e&&(this._peerId=e)}},{key:"peerMeta",get:function e(){return this._peerMeta},set:function e(e){this._peerMeta=e}},{key:"handshakeTopic",get:function e(){return this._handshakeTopic},set:function e(e){e&&(this._handshakeTopic=e)}},{key:"handshakeId",get:function e(){return this._handshakeId},set:function e(e){e&&(this._handshakeId=e)}},{key:"uri",get:function e(){return"wc:".concat(this.handshakeTopic,"@1?bridge=").concat(this.relay,"&key=").concat(this.key,"&scene=bid")}},{key:"chainId",get:function e(){return this._chainId},set:function e(e){this._chainId=e}},{key:"accounts",get:function e(){return this._accounts},set:function e(e){this._accounts=e}},{key:"connected",get:function e(){return this._connected},set:function e(e){}},{key:"session",get:function e(){return{connected:this.connected,accounts:this.accounts,chainId:this.chainId,relay:this.relay,key:this.key,clientId:this.clientId,clientMeta:this.clientMeta,peerId:this.peerId,peerMeta:this.peerMeta,handshakeId:this.handshakeId,handshakeTopic:this.handshakeTopic}},set:function e(e){e&&(this._connected=e.connected,this.accounts=e.accounts,this.chainId=e.chainId,this.relay=e.relay,this.key=e.key,this.clientId=e.clientId,this.clientMeta=e.clientMeta,this.peerId=e.peerId,this.peerMeta=e.peerMeta,this.handshakeId=e.handshakeId,this.handshakeTopic=e.handshakeTopic)}}]);return r}(rh),w3w_core_dist_Y=function(e){"use strict";w3w_core_dist_a(n,e);var t=w3w_core_dist_f(n);function n(){w3w_core_dist_s(this,n);return t.apply(this,arguments)}w3w_core_dist_i(n,[{key:"getStorageSession",value:function e(){try{return rl(w3w_core_dist_Q)}catch(e){}return null}},{key:"setStorageSession",value:function e(){rd(w3w_core_dist_Q,this.session)}},{key:"removeStorageSession",value:function e(){rp(w3w_core_dist_Q)}},{key:"manageStorageSession",value:function e(){this._connected?this.setStorageSession():this.removeStorageSession()}}]);return n}(dist_W);function dist_es(){return w3w_core_dist_er.apply(this,arguments)}function w3w_core_dist_er(){w3w_core_dist_er=w3w_core_dist_n(function(){var e,t;return w3w_core_dist_p(this,function(n){switch(n.label){case 0:return[4,Promise.any(w3w_core_dist_F.map(function(e){return lib_axios.request({url:e,method:"POST",data:{jsonrpc:"2.0",id:Date.now(),method:"eth_call",params:[{to:"0x76054B318785b588A3164B2A6eA5476F7cBA51e0",data:"0x97b5f450"},"latest"]}})}))];case 1:e=n.sent(),t=new lib_esm_interface/* Interface */.KA(["function apiDomains() view returns (string)"]);return[2,decode(t.decodeFunctionResult("apiDomains",e.data.result)[0]).split(",")]}})});return w3w_core_dist_er.apply(this,arguments)}function w3w_core_dist_ei(e){return e.filter(function(e){return e.ttl>0}).sort(function(e,t){return e.ttl-t.ttl}).map(function(e){return e.url})}function w3w_core_dist_eo(){return w3w_core_dist_ea.apply(this,arguments)}function w3w_core_dist_ea(){w3w_core_dist_ea=w3w_core_dist_n(function(){var e,t;return w3w_core_dist_p(this,function(n){switch(n.label){case 0:return[4,dist_es()];case 1:e=n.sent();return[4,Promise.all(e.map(function(e){var t=e.split(".").slice(1).join(".");return w3w_socket_transport_dist_b("wss://nbstream.".concat(t,"/wallet-connector"))}))];case 2:t=n.sent();return[2,w3w_core_dist_ei(t)]}})});return w3w_core_dist_ea.apply(this,arguments)}var dist_ec=Promise.resolve([]);if(!eh()){var dist_eu=rl(w3w_core_dist_U);dist_ec=Promise.resolve(dist_eu),(!dist_eu||dist_eu.length===0)&&(dist_ec=w3w_core_dist_eo().then(function(e){return w3w_core_dist_console.log("\uD83D\uDE80 ~ file: relay.ts:63 ~ .then ~ domains:",e),rd(w3w_core_dist_U,e),e}).catch(function(){return[]}))}function dist_eh(){return dist_el.apply(this,arguments)}function dist_el(){dist_el=w3w_core_dist_n(function(){var e;return w3w_core_dist_p(this,function(t){switch(t.label){case 0:return[4,dist_ec];case 1:e=t.sent();return[2,(e.length===0&&e.push(w3w_core_dist_V),e)]}})});return dist_el.apply(this,arguments)}function dist_ed(e){var t=rl(w3w_core_dist_U);if(!t)return;var n=t.filter(function(t){return t!==e});rd(w3w_core_dist_U,n)}function dist_ef(){rp(w3w_core_dist_U)}function dist_e_(e){return e.code===-32050||e.code===-32e3||e.code===1e3?new rA(rx.REJECT_ERR.code,rx.REJECT_ERR.message):e.code===-32603?new rA(rN.INTERNAL_ERR.code,rN.INTERNAL_ERR.message):e.code===-32600||e.code===-32602?new rA(rx.INVALID_PARAM.code,rx.INVALID_PARAM.message):e}function dist_em(e){var t=e.indexOf("?");return t>-1?e.slice(0,t):e}var dist_eI=function(t){"use strict";w3w_core_dist_a(o,t);var r=w3w_core_dist_f(o);function o(){w3w_core_dist_s(this,o);var t;t=r.call(this);w3w_core_dist_(w3w_core_dist_e(t),"transport");w3w_core_dist_(w3w_core_dist_e(t),"lng");t.clientMeta=r_();var n=t.getStorageSession();n&&(t.session=n),t.handshakeId&&t.subscribeToSessionResponse(t.handshakeId),t.initTransport(),t.subscribeInternalEvent();return t}w3w_core_dist_i(o,[{key:"request",value:function e(e){var t=this;return w3w_core_dist_n(function(){return w3w_core_dist_p(this,function(n){if(!t.connected)throw new rA(rS.PROVIDER_NOT_READY.code,rS.PROVIDER_NOT_READY.message);if(ef.indexOf(e.method)<0)throw new rA(rx.METHOD_NOT_SUPPORT.code,rx.METHOD_NOT_SUPPORT.message);switch(e.method){case"eth_requestAccounts":return[2,t.accounts];case"eth_accounts":return[2,t.accounts];case"eth_chainId":return[2,eM(t.chainId)];case"eth_signTransaction":case"eth_sendTransaction":case"eth_sign":case"personal_sign":case"eth_signTypedData":case"eth_signTypedData_v1":case"eth_signTypedData_v2":case"eth_signTypedData_v3":case"eth_signTypedData_v4":case"wallet_switchEthereumChain":case"wallet_watchAsset":return[2,new Promise(function(n,s){e.id||(e.id=W()),t.callbacks.set("response-".concat(e.id),function(e,t){e?s(dist_e_(e)):t?n(t.result):s(new rA(rx.MISSING_RESPONSE.code,rx.MISSING_RESPONSE.message))}),t.sendRequest(e),t.events.emit("call_request_sent")})];default:break}return[2]})})()}},{key:"killSession",value:function e(){if(!this.connected)return;var e={approved:!1,chainId:null,networkId:null,accounts:null},t={id:W(),method:"wc_sessionUpdate",params:[e]};this.sendRequest(t),this.handleSessionDisconnect(w3w_types_dist_h.DisconnectAtClient)}},{key:"connect",value:function e(){var e=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{},t=e.chainId,s=e.lng,r=e.showQrCodeModal;var i=this;return w3w_core_dist_n(function(){return w3w_core_dist_p(this,function(e){return[2,(i.lng=s,i.connected?{chainId:i.chainId,accounts:i.accounts}:new Promise(function(e,n){i.on("modal_closed",function(e){n(e)}),i.on("session_error",function(e){n(e)}),i.on("connect",function(t){e(t)}),i.createSession({chainId:t,showQrCodeModal:r})}))]})})()}},{key:"createSession",value:function e(e){var t=e.chainId,n=e.showQrCodeModal;try{if(this.connected)throw new rA(rS.CONNECTED.code,rS.CONNECTED.message);if(this.pending||this._handshakeTopic)throw new rA(rS.CONNECTING.code,rS.CONNECTING.message);this.pending=!0,this._key=rs(),this.handshakeId=W(),this.handshakeTopic=q();var s={id:this.handshakeId,method:"wc_sessionRequest",params:[{peerId:this.clientId,peerMeta:this.clientMeta,chainId:t?Number(t):null}]};this.sendRequest(s,this.handshakeTopic),this.subscribeToSessionResponse(this.handshakeId),this.events.emit("display_uri",{showQrCodeModal:n})}catch(e){this.pending=!1;var r="response-".concat(this.handshakeId);this.callbacks.get(r)&&this.callbacks.delete(r);var i=e.message,o=w3w_core_dist_c(e,rA)?e:new rA(rN.INTERNAL_ERR.code,"".concat(rN.INTERNAL_ERR.message,": ").concat(i));throw this.handleRejectSessionConnection(o),rm.error("[binance-w3w] create connection failed: ".concat(i)),o}}},{key:"initTransport",value:function e(){var e=this;return w3w_core_dist_n(function(){var t,n,s,r;return w3w_core_dist_p(this,function(i){switch(i.label){case 0:e.transport=new dist_v({version:1,subscriptions:[e.clientId]}),e.transport.on("message",function(t){return e.setIncomingMessages(t)}),e.transport.on("open",function(t){e.events.emit("transport_open",t)}),e.transport.on("close",function(){e.events.emit("transport_close")}),e.transport.on("error",function(t,n){e.events.emit("transport_error",t,n)});i.label=1;case 1:i.trys.push([1,5,,6]);if(!e.session.relay)return[3,2];e.transport.open([e.session.relay]);return[3,4];case 2:return[4,dist_eh()];case 3:t=i.sent();e.transport.open(t);i.label=4;case 4:return[3,6];case 5:n=i.sent();dist_ef();s=n.message,r=new rA(rN.INTERNAL_ERR.code,"".concat(rN.INTERNAL_ERR.message,": ").concat(s));throw e.handleRejectSessionConnection(r),r;case 6:return[2]}})})()}},{key:"setIncomingMessages",value:function e(e){if(![this.clientId,this.handshakeTopic].includes(e.topic))return;var t;try{t=JSON.parse(e.payload)}catch(e){return}var n=this.decrypt(t);if(!n)return;if("method"in n&&n.method){this.events.emit(n.method,null,n);return}var s=n.id,r="response-".concat(s),i=this.callbacks.get(r);if(i){if("error"in n&&n.error){var o=new rA(n.error.code,n.error.message);i(o,null)}else"result"in n&&n.result&&i(null,n);this.callbacks.delete(r)}else rm.error("[binance-w3w] callback id: ".concat(s," not found"))}},{key:"encrypt",value:function e(e){var t=this._key;return t?rc(e,t):null}},{key:"decrypt",value:function e(e){var t=this._key;return t?rf(e,t):null}},{key:"sendRequest",value:function e(e,t){var n=G(e.method,e.params,e.id),s=this.encrypt(n),r=t||this.peerId,i=JSON.stringify(s);this.transport.send(i,r,!0)}},{key:"subscribeInternalEvent",value:function e(){var e=this;this.on("display_uri",function(t){var n=t.showQrCodeModal;n!==!1&&(dist_eo.open({cb:function(){e.events.emit("modal_closed",new rA(rS.CLOSE_MODAL.code,rS.CLOSE_MODAL.message))},lng:e.lng}),e.transport.connected?(e.events.emit("uri_ready",e.uri),e.key&&dist_eo.ready(e.uri)):e.transport.retryFailed&&dist_eo.fail())}),this.on("transport_open",function(t){e.relay=t,e.events.emit("uri_ready",e.uri),e.key&&dist_eo.ready(e.uri)}),this.on("transport_error",function(e,t){t?dist_ed(dist_em(t)):(dist_ef(),dist_eo.fail())}),this.on("modal_closed",function(){var t="response-".concat(e.handshakeId);e.callbacks.get(t)&&e.callbacks.delete(t),e.clearConnectionStatus()}),this.on("connect",function(){e.pending=!1,dist_eo.close()}),this.on("call_request_sent",function(){rj()}),this.on("wc_sessionUpdate",function(t,n){if(t){e.handleSessionResponse();return}n.params&&Array.isArray(n.params)?e.handleSessionResponse(n.params[0]):n.error&&e.handleSessionResponse()})}},{key:"subscribeToSessionResponse",value:function e(e){var t=this;this.callbacks.set("response-".concat(e),function(e,n){if(e){t.handleSessionResponse();return}n&&(n.result?t.handleSessionResponse(n.result):n.error&&n.error.message?t.handleSessionResponse():t.handleSessionResponse())})}},{key:"handleSessionResponse",value:function e(e){e?e.approved?(this._connected?(e.chainId&&this.setChainId(e.chainId),e.accounts&&this.setAddress(e.accounts)):(this._connected=!0,e.chainId&&this.setChainId(e.chainId),e.accounts&&this.setAddress(e.accounts),e.peerId&&!this.peerId&&(this.peerId=e.peerId),e.peerMeta&&!this.peerMeta&&(this.peerMeta=e.peerMeta),this.events.emit("connect",{chainId:this.chainId,accounts:this.accounts})),this.manageStorageSession()):this.connected?this.handleSessionDisconnect(w3w_types_dist_h.DisconnectAtWallet):this.handleRejectSessionConnection(new rA(rS.REJECT_SESSION.code,rS.REJECT_SESSION.message)):this.handleRejectSessionConnection(new rA(rS.REJECT_SESSION.code,rS.REJECT_SESSION.message))}},{key:"handleRejectSessionConnection",value:function e(e){dist_eo.close(),this.clearConnectionStatus(),this.events.emit("session_error",e)}},{key:"handleSessionDisconnect",value:function e(e){this._connected||dist_eo.close(),this.events.emit("disconnect",e),this.clearConnectionStatus()}},{key:"clearConnectionStatus",value:function e(){this._connected&&(this._connected=!1),this._handshakeId&&(this._handshakeId=0),this._handshakeTopic&&(this._handshakeTopic=""),this._peerId&&(this._peerId=""),this._clientId&&(this._clientId=""),this.pending&&(this.pending=!1),this.callbacks.clear(),this._peerMeta=null,this._accounts=[],this._chainId="0x0",this.offConnectEvents(),this.removeStorageSession(),this.transport.close()}},{key:"offConnectEvents",value:function e(){this.removeListener("connect")}},{key:"setChainId",value:function e(e){var t=eM(e);if(t==="0x0"){this.chainId=t;return}w3w_core_dist_l(this.chainId)<"u"&&this.chainId!==t&&this.events.emit("chainChanged",t),this.chainId=t}},{key:"setAddress",value:function e(){var e=arguments.length>0&&arguments[0]!==void 0?arguments[0]:[];var t=e.filter(function(e){return typeof e=="string"}).map(function(e){return e.toLowerCase()}).filter(Boolean);JSON.stringify(this.accounts)!==JSON.stringify(t)&&this.events.emit("accountsChanged",t),this.accounts=t}}]);return o}(w3w_core_dist_Y);//# sourceMappingURL=index.js.map
;// CONCATENATED MODULE: ./node_modules/.pnpm/@binance+w3w-sign-client@1.1.7_bufferutil@4.0.8_ts-node@10.9.2_utf-8-validate@5.0.10/node_modules/@binance/w3w-sign-client/dist/index.js
function w3w_sign_client_dist_n(n){if(n===void 0){throw new ReferenceError("this hasn't been initialised - super() hasn't been called")}return n}function w3w_sign_client_dist_e(n,e,t,o,r,c,i){try{var u=n[c](i);var s=u.value}catch(n){t(n);return}if(u.done){e(s)}else{Promise.resolve(s).then(o,r)}}function w3w_sign_client_dist_t(n){return function(){var t=this,o=arguments;return new Promise(function(r,c){var i=n.apply(t,o);function u(n){w3w_sign_client_dist_e(i,r,c,u,s,"next",n)}function s(n){w3w_sign_client_dist_e(i,r,c,u,s,"throw",n)}u(undefined)})}}function w3w_sign_client_dist_o(n,e){if(!(n instanceof e)){throw new TypeError("Cannot call a class as a function")}}function w3w_sign_client_dist_r(n,e){for(var t=0;t<e.length;t++){var o=e[t];o.enumerable=o.enumerable||false;o.configurable=true;if("value"in o)o.writable=true;Object.defineProperty(n,o.key,o)}}function w3w_sign_client_dist_c(n,e,t){if(e)w3w_sign_client_dist_r(n.prototype,e);if(t)w3w_sign_client_dist_r(n,t);return n}function w3w_sign_client_dist_i(n){w3w_sign_client_dist_i=Object.setPrototypeOf?Object.getPrototypeOf:function n(n){return n.__proto__||Object.getPrototypeOf(n)};return w3w_sign_client_dist_i(n)}function w3w_sign_client_dist_u(n,e){if(typeof e!=="function"&&e!==null){throw new TypeError("Super expression must either be null or a function")}n.prototype=Object.create(e&&e.prototype,{constructor:{value:n,writable:true,configurable:true}});if(e)w3w_sign_client_dist_a(n,e)}function w3w_sign_client_dist_s(e,t){if(t&&(w3w_sign_client_dist_f(t)==="object"||typeof t==="function")){return t}return w3w_sign_client_dist_n(e)}function w3w_sign_client_dist_a(n,e){w3w_sign_client_dist_a=Object.setPrototypeOf||function n(n,e){n.__proto__=e;return n};return w3w_sign_client_dist_a(n,e)}function w3w_sign_client_dist_f(n){"@swc/helpers - typeof";return n&&typeof Symbol!=="undefined"&&n.constructor===Symbol?"symbol":typeof n}function w3w_sign_client_dist_l(){if(typeof Reflect==="undefined"||!Reflect.construct)return false;if(Reflect.construct.sham)return false;if(typeof Proxy==="function")return true;try{Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],function(){}));return true}catch(n){return false}}function w3w_sign_client_dist_h(n){var e=w3w_sign_client_dist_l();return function t(){var t=w3w_sign_client_dist_i(n),o;if(e){var r=w3w_sign_client_dist_i(this).constructor;o=Reflect.construct(t,arguments,r)}else{o=t.apply(this,arguments)}return w3w_sign_client_dist_s(this,o)}}function w3w_sign_client_dist_p(n,e){var t,o,r,c,i={label:0,sent:function(){if(r[0]&1)throw r[1];return r[1]},trys:[],ops:[]};return c={next:u(0),"throw":u(1),"return":u(2)},typeof Symbol==="function"&&(c[Symbol.iterator]=function(){return this}),c;function u(n){return function(e){return s([n,e])}}function s(c){if(t)throw new TypeError("Generator is already executing.");while(i)try{if(t=1,o&&(r=c[0]&2?o["return"]:c[0]?o["throw"]||((r=o["return"])&&r.call(o),0):o.next)&&!(r=r.call(o,c[1])).done)return r;if(o=0,r)c=[c[0]&2,r.value];switch(c[0]){case 0:case 1:r=c;break;case 4:i.label++;return{value:c[1],done:false};case 5:i.label++;o=c[1];c=[0];continue;case 7:c=i.ops.pop();i.trys.pop();continue;default:if(!(r=i.trys,r=r.length>0&&r[r.length-1])&&(c[0]===6||c[0]===2)){i=0;continue}if(c[0]===3&&(!r||c[1]>r[0]&&c[1]<r[3])){i.label=c[1];break}if(c[0]===6&&i.label<r[1]){i.label=r[1];r=c;break}if(r&&i.label<r[2]){i.label=r[2];i.ops.push(c);break}if(r[2])i.ops.pop();i.trys.pop();continue}c=e.call(n,i)}catch(n){c=[6,n];o=0}finally{t=r=0}if(c[0]&5)throw c[1];return{value:c[0]?c[1]:void 0,done:true}}}var w3w_sign_client_dist_y=Object.defineProperty;var w3w_sign_client_dist_b=function(n,e,t){return e in n?w3w_sign_client_dist_y(n,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):n[e]=t};var w3w_sign_client_dist_v=function(n,e,t){return w3w_sign_client_dist_b(n,(typeof e==="undefined"?"undefined":w3w_sign_client_dist_f(e))!="symbol"?e+"":e,t),t};var dist_g=function(e){"use strict";w3w_sign_client_dist_u(i,e);var r=w3w_sign_client_dist_h(i);function i(){w3w_sign_client_dist_o(this,i);var e;e=r.call(this);w3w_sign_client_dist_v(w3w_sign_client_dist_n(e),"accounts",[]);w3w_sign_client_dist_v(w3w_sign_client_dist_n(e),"coreConnection");e.register();return e}w3w_sign_client_dist_c(i,[{key:"chainId",get:function n(){return this.coreConnection?this.coreConnection.chainId:"0x0"}},{key:"connected",get:function n(){return this.coreConnection?this.coreConnection.connected:!1}},{key:"connecting",get:function n(){return this.coreConnection?this.coreConnection.pending:!1}},{key:"open",value:function n(n){var e=n.requestChainId,o=n.lng,r=n.showQrCodeModal;var c=this;return w3w_sign_client_dist_t(function(){var n,t;return w3w_sign_client_dist_p(this,function(i){switch(i.label){case 0:if(c.register(),c.coreConnection.connected)return[2];return[4,c.coreConnection.connect({chainId:e,lng:o,showQrCodeModal:r})];case 1:n=i.sent(),t=n.accounts;c.accounts=t;return[2]}})})()}},{key:"request",value:function n(n){var e=this;return w3w_sign_client_dist_t(function(){var t;return w3w_sign_client_dist_p(this,function(o){switch(o.label){case 0:t=e.connected;if(t)return[3,2];return[4,e.open({})];case 1:t=o.sent();o.label=2;case 2:return[2,(t,e.coreConnection.request(n))]}})})()}},{key:"disconnect",value:function n(){this.connected&&(this.coreConnection.killSession(),this.onClose(w3w_types_dist_h.DisconnectAtClient))}},{key:"register",value:function n(){if(this.coreConnection)return this.coreConnection;this.coreConnection=new dist_eI,this.accounts=this.coreConnection.accounts,this.subscribeEvents()}},{key:"subscribeEvents",value:function n(){var n=this;this.coreConnection.on("chainChanged",function(e){n.events.emit("chainChanged",e)}),this.coreConnection.on("accountsChanged",function(e){n.accounts=e,n.events.emit("accountsChanged",e)}),this.coreConnection.on("uri_ready",function(e){n.events.emit("uri_ready",e)}),this.coreConnection.on("disconnect",function(e){n.onClose(e)})}},{key:"onClose",value:function n(n){this.coreConnection=null,this.events.emit("disconnect",n)}}]);return i}(rh);//# sourceMappingURL=index.js.map
;// CONCATENATED MODULE: ./node_modules/.pnpm/@binance+w3w-ethereum-provider@1.1.7_bufferutil@4.0.8_encoding@0.1.13_ts-node@10.9.2_utf-8-validate@5.0.10/node_modules/@binance/w3w-ethereum-provider/dist/index.js
function w3w_ethereum_provider_dist_e(e,n,t,i,r,o,s){try{var u=e[o](s);var c=u.value}catch(e){t(e);return}if(u.done){n(c)}else{Promise.resolve(c).then(i,r)}}function w3w_ethereum_provider_dist_n(n){return function(){var t=this,i=arguments;return new Promise(function(r,o){var s=n.apply(t,i);function u(n){w3w_ethereum_provider_dist_e(s,r,o,u,c,"next",n)}function c(n){w3w_ethereum_provider_dist_e(s,r,o,u,c,"throw",n)}u(undefined)})}}function w3w_ethereum_provider_dist_t(e,n){if(!(e instanceof n)){throw new TypeError("Cannot call a class as a function")}}function w3w_ethereum_provider_dist_i(e,n){for(var t=0;t<n.length;t++){var i=n[t];i.enumerable=i.enumerable||false;i.configurable=true;if("value"in i)i.writable=true;Object.defineProperty(e,i.key,i)}}function w3w_ethereum_provider_dist_r(e,n,t){if(n)w3w_ethereum_provider_dist_i(e.prototype,n);if(t)w3w_ethereum_provider_dist_i(e,t);return e}function w3w_ethereum_provider_dist_o(e){"@swc/helpers - typeof";return e&&typeof Symbol!=="undefined"&&e.constructor===Symbol?"symbol":typeof e}function w3w_ethereum_provider_dist_s(e,n){var t,i,r,o,s={label:0,sent:function(){if(r[0]&1)throw r[1];return r[1]},trys:[],ops:[]};return o={next:u(0),"throw":u(1),"return":u(2)},typeof Symbol==="function"&&(o[Symbol.iterator]=function(){return this}),o;function u(e){return function(n){return c([e,n])}}function c(o){if(t)throw new TypeError("Generator is already executing.");while(s)try{if(t=1,i&&(r=o[0]&2?i["return"]:o[0]?i["throw"]||((r=i["return"])&&r.call(i),0):i.next)&&!(r=r.call(i,o[1])).done)return r;if(i=0,r)o=[o[0]&2,r.value];switch(o[0]){case 0:case 1:r=o;break;case 4:s.label++;return{value:o[1],done:false};case 5:s.label++;i=o[1];o=[0];continue;case 7:o=s.ops.pop();s.trys.pop();continue;default:if(!(r=s.trys,r=r.length>0&&r[r.length-1])&&(o[0]===6||o[0]===2)){s=0;continue}if(o[0]===3&&(!r||o[1]>r[0]&&o[1]<r[3])){s.label=o[1];break}if(o[0]===6&&s.label<r[1]){s.label=r[1];r=o;break}if(r&&s.label<r[2]){s.label=r[2];s.ops.push(o);break}if(r[2])s.ops.pop();s.trys.pop();continue}o=n.call(e,s)}catch(e){o=[6,e];i=0}finally{t=r=0}if(o[0]&5)throw o[1];return{value:o[0]?o[1]:void 0,done:true}}}var w3w_ethereum_provider_dist_u=Object.defineProperty;var w3w_ethereum_provider_dist_c=function(e,n,t){return n in e?w3w_ethereum_provider_dist_u(e,n,{enumerable:!0,configurable:!0,writable:!0,value:t}):e[n]=t};var w3w_ethereum_provider_dist_a=function(e,n,t){return w3w_ethereum_provider_dist_c(e,(typeof n==="undefined"?"undefined":w3w_ethereum_provider_dist_o(n))!="symbol"?n+"":n,t),t};var w3w_ethereum_provider_dist_b=function(){"use strict";function e(n){w3w_ethereum_provider_dist_t(this,e);w3w_ethereum_provider_dist_a(this,"events",new node_modules_eventemitter3);w3w_ethereum_provider_dist_a(this,"signClient");w3w_ethereum_provider_dist_a(this,"rpc");w3w_ethereum_provider_dist_a(this,"httpClient");w3w_ethereum_provider_dist_a(this,"optsChainId");w3w_ethereum_provider_dist_a(this,"lng");w3w_ethereum_provider_dist_a(this,"showQrCodeModal");this.rpc={infuraId:n===null||n===void 0?void 0:n.infuraId,custom:n===null||n===void 0?void 0:n.rpc},this.lng=(n===null||n===void 0?void 0:n.lng)||"en",this.showQrCodeModal=n===null||n===void 0?void 0:n.showQrCodeModal,this.signClient=new dist_g,this.optsChainId=Number(this.signClient.coreConnection.chainId)||(n===null||n===void 0?void 0:n.chainId)||56,this.registerEventListeners(),this.httpClient=this.setHttpProvider(this.optsChainId)}w3w_ethereum_provider_dist_r(e,[{key:"connected",get:function e(){return this.signClient.connected}},{key:"connector",get:function e(){return this.signClient}},{key:"accounts",get:function e(){return this.signClient.accounts}},{key:"chainId",get:function e(){return rm.debug("provider get chainId",this.signClient.chainId),this.signClient.chainId}},{key:"rpcUrl",get:function e(){return this.httpClient.url||""}},{key:"request",value:function e(e){var t=this;return w3w_ethereum_provider_dist_n(function(){var n,i,r;return w3w_ethereum_provider_dist_s(this,function(s){switch(s.label){case 0:n=(rm.debug("ethereum-provider request",e),e.method);switch(n){case"eth_requestAccounts":return[3,1];case"eth_chainId":return[3,3];case"eth_accounts":return[3,4];case"wallet_switchEthereumChain":return[3,5]}return[3,6];case 1:return[4,t.connect()];case 2:return[2,(s.sent(),t.accounts)];case 3:return[2,t.chainId];case 4:return[2,t.accounts];case 5:return[2,t.switchChain(e)];case 6:return[3,7];case 7:i=G(e.method,e.params||[]);if(ef.includes(e.method))return[2,t.signClient.request(i)];if(w3w_ethereum_provider_dist_o(t.httpClient)>"u")throw new Error("Cannot request JSON-RPC method (".concat(e.method,") without provided rpc url"));return[4,t.httpClient.request(i)];case 8:r=s.sent();if(ee(r))return[2,r.result];throw new Error(r.error.message)}})})()}},{key:"signMessage",value:function e(e){var t=this;return w3w_ethereum_provider_dist_n(function(){var n;return w3w_ethereum_provider_dist_s(this,function(i){switch(i.label){case 0:rm.debug("signMessage",e);n=t.accounts.length;if(n)return[3,2];return[4,t.enable()];case 1:n=i.sent();i.label=2;case 2:n;return[4,t.request({method:"personal_sign",params:[eC(e),t.accounts[0]]})];case 3:return[2,i.sent()]}})})()}},{key:"sendAsync",value:function e(e,n){this.request(e).then(function(e){return n(null,e)}).catch(function(e){return n(e,void 0)})}},{key:"setLng",value:function e(e){this.lng=e}},{key:"enable",value:function e(e){var t=this;return w3w_ethereum_provider_dist_n(function(){return w3w_ethereum_provider_dist_s(this,function(n){switch(n.label){case 0:return[4,t.connect(e)];case 1:return[2,(n.sent(),t.accounts)]}})})()}},{key:"switchChain",value:function e(e){var t=this;return w3w_ethereum_provider_dist_n(function(){var n;return w3w_ethereum_provider_dist_s(this,function(i){switch(i.label){case 0:n=G(e.method,e.params||[]);return[4,Promise.race([t.signClient.request(n),new Promise(function(n){return t.on("chainChanged",function(t){t===e.params[0].chainId&&n(t)})})])];case 1:return[2,i.sent()]}})})()}},{key:"connect",value:function e(e){var t=this;return w3w_ethereum_provider_dist_n(function(){var n,i;return w3w_ethereum_provider_dist_s(this,function(r){switch(r.label){case 0:if(!t.connected)return[3,1];i=rm.info("already connected");return[3,3];case 1:return[4,t.signClient.open({requestChainId:(n=e===null||e===void 0?void 0:e.toString())!==null&&n!==void 0?n:t.optsChainId.toString(),lng:t.lng,showQrCodeModal:t.showQrCodeModal})];case 2:i=r.sent();r.label=3;case 3:i;return[2]}})})()}},{key:"disconnect",value:function e(){this.connected&&this.signClient.disconnect()}},{key:"on",value:function e(e,n){this.events.on(e,n)}},{key:"once",value:function e(e,n){this.events.once(e,n)}},{key:"removeListener",value:function e(e,n){this.events.removeListener(e,n)}},{key:"off",value:function e(e,n){this.events.off(e,n)}},{key:"isWalletConnect",get:function e(){return!0}},{key:"registerEventListeners",value:function e(){var e=this;this.signClient.on("accountsChanged",function(n){e.events.emit("accountsChanged",n)}),this.signClient.on("chainChanged",function(n){e.httpClient=e.setHttpProvider(ey(n)),e.events.emit("chainChanged",n)}),this.signClient.on("disconnect",function(){e.events.emit("disconnect")}),this.signClient.on("uri_ready",function(n){e.events.emit("uri_ready",n)})}},{key:"setHttpProvider",value:function e(e){var n=ev(e,this.rpc);if(!((typeof n==="undefined"?"undefined":w3w_ethereum_provider_dist_o(n))>"u"))return new dist_E(n)}}]);return e}(),w3w_ethereum_provider_dist_k=function(e){if(rD()){var n=(typeof window==="undefined"?"undefined":w3w_ethereum_provider_dist_o(window))<"u"?window.ethereum:void 0;if(n)return n.setLng=function(){},n.disconnect=function(){},n}return new w3w_ethereum_provider_dist_b(e)},w3w_ethereum_provider_dist_I=w3w_ethereum_provider_dist_b;//# sourceMappingURL=index.js.map

/***/ })

}]);