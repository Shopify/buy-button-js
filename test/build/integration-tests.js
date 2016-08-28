(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*!
 * assertion-error
 * Copyright(c) 2013 Jake Luer <jake@qualiancy.com>
 * MIT Licensed
 */

/*!
 * Return a function that will copy properties from
 * one object to another excluding any originally
 * listed. Returned function will create a new `{}`.
 *
 * @param {String} excluded properties ...
 * @return {Function}
 */

function exclude () {
  var excludes = [].slice.call(arguments);

  function excludeProps (res, obj) {
    Object.keys(obj).forEach(function (key) {
      if (!~excludes.indexOf(key)) res[key] = obj[key];
    });
  }

  return function extendExclude () {
    var args = [].slice.call(arguments)
      , i = 0
      , res = {};

    for (; i < args.length; i++) {
      excludeProps(res, args[i]);
    }

    return res;
  };
};

/*!
 * Primary Exports
 */

module.exports = AssertionError;

/**
 * ### AssertionError
 *
 * An extension of the JavaScript `Error` constructor for
 * assertion and validation scenarios.
 *
 * @param {String} message
 * @param {Object} properties to include (optional)
 * @param {callee} start stack function (optional)
 */

function AssertionError (message, _props, ssf) {
  var extend = exclude('name', 'message', 'stack', 'constructor', 'toJSON')
    , props = extend(_props || {});

  // default values
  this.message = message || 'Unspecified AssertionError';
  this.showDiff = false;

  // copy from properties
  for (var key in props) {
    this[key] = props[key];
  }

  // capture stack trace
  ssf = ssf || arguments.callee;
  if (ssf && Error.captureStackTrace) {
    Error.captureStackTrace(this, ssf);
  } else {
    try {
      throw new Error();
    } catch(e) {
      this.stack = e.stack;
    }
  }
}

/*!
 * Inherit from Error.prototype
 */

AssertionError.prototype = Object.create(Error.prototype);

/*!
 * Statically set name
 */

AssertionError.prototype.name = 'AssertionError';

/*!
 * Ensure correct constructor
 */

AssertionError.prototype.constructor = AssertionError;

/**
 * Allow errors to be converted to JSON for static transfer.
 *
 * @param {Boolean} include stack (default: `true`)
 * @return {Object} object that can be `JSON.stringify`
 */

AssertionError.prototype.toJSON = function (stack) {
  var extend = exclude('constructor', 'toJSON', 'stack')
    , props = extend({ name: this.name }, this);

  // include stack if exists and not turned off
  if (false !== stack && this.stack) {
    props.stack = this.stack;
  }

  return props;
};

},{}],2:[function(require,module,exports){
'use strict'

exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

function init () {
  var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
  for (var i = 0, len = code.length; i < len; ++i) {
    lookup[i] = code[i]
    revLookup[code.charCodeAt(i)] = i
  }

  revLookup['-'.charCodeAt(0)] = 62
  revLookup['_'.charCodeAt(0)] = 63
}

init()

function toByteArray (b64) {
  var i, j, l, tmp, placeHolders, arr
  var len = b64.length

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // the number of equal signs (place holders)
  // if there are two placeholders, than the two characters before it
  // represent one byte
  // if there is only one, then the three characters before it represent 2 bytes
  // this is just a cheap hack to not do indexOf twice
  placeHolders = b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0

  // base64 is 4/3 + up to two characters of the original data
  arr = new Arr(len * 3 / 4 - placeHolders)

  // if there are placeholders, only get up to the last complete 4 chars
  l = placeHolders > 0 ? len - 4 : len

  var L = 0

  for (i = 0, j = 0; i < l; i += 4, j += 3) {
    tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)]
    arr[L++] = (tmp >> 16) & 0xFF
    arr[L++] = (tmp >> 8) & 0xFF
    arr[L++] = tmp & 0xFF
  }

  if (placeHolders === 2) {
    tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[L++] = tmp & 0xFF
  } else if (placeHolders === 1) {
    tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[L++] = (tmp >> 8) & 0xFF
    arr[L++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var output = ''
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    output += lookup[tmp >> 2]
    output += lookup[(tmp << 4) & 0x3F]
    output += '=='
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + (uint8[len - 1])
    output += lookup[tmp >> 10]
    output += lookup[(tmp >> 4) & 0x3F]
    output += lookup[(tmp << 2) & 0x3F]
    output += '='
  }

  parts.push(output)

  return parts.join('')
}

},{}],3:[function(require,module,exports){
(function (global){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')
var isArray = require('isarray')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Due to various browser bugs, sometimes the Object implementation will be used even
 * when the browser supports typed arrays.
 *
 * Note:
 *
 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *     incorrect length in some situations.

 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
 * get the Object implementation, which is slower but behaves correctly.
 */
Buffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined
  ? global.TYPED_ARRAY_SUPPORT
  : typedArraySupport()

/*
 * Export kMaxLength after typed array support is determined.
 */
exports.kMaxLength = kMaxLength()

function typedArraySupport () {
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = {__proto__: Uint8Array.prototype, foo: function () { return 42 }}
    return arr.foo() === 42 && // typed array instances can be augmented
        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
        arr.subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
  } catch (e) {
    return false
  }
}

function kMaxLength () {
  return Buffer.TYPED_ARRAY_SUPPORT
    ? 0x7fffffff
    : 0x3fffffff
}

function createBuffer (that, length) {
  if (kMaxLength() < length) {
    throw new RangeError('Invalid typed array length')
  }
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = new Uint8Array(length)
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    if (that === null) {
      that = new Buffer(length)
    }
    that.length = length
  }

  return that
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) {
    return new Buffer(arg, encodingOrOffset, length)
  }

  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new Error(
        'If encoding is specified then the first argument must be a string'
      )
    }
    return allocUnsafe(this, arg)
  }
  return from(this, arg, encodingOrOffset, length)
}

Buffer.poolSize = 8192 // not used by this implementation

// TODO: Legacy, not needed anymore. Remove in next major version.
Buffer._augment = function (arr) {
  arr.__proto__ = Buffer.prototype
  return arr
}

function from (that, value, encodingOrOffset, length) {
  if (typeof value === 'number') {
    throw new TypeError('"value" argument must not be a number')
  }

  if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
    return fromArrayBuffer(that, value, encodingOrOffset, length)
  }

  if (typeof value === 'string') {
    return fromString(that, value, encodingOrOffset)
  }

  return fromObject(that, value)
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(null, value, encodingOrOffset, length)
}

if (Buffer.TYPED_ARRAY_SUPPORT) {
  Buffer.prototype.__proto__ = Uint8Array.prototype
  Buffer.__proto__ = Uint8Array
  if (typeof Symbol !== 'undefined' && Symbol.species &&
      Buffer[Symbol.species] === Buffer) {
    // Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
    Object.defineProperty(Buffer, Symbol.species, {
      value: null,
      configurable: true
    })
  }
}

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be a number')
  }
}

function alloc (that, size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(that, size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(that, size).fill(fill, encoding)
      : createBuffer(that, size).fill(fill)
  }
  return createBuffer(that, size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(null, size, fill, encoding)
}

function allocUnsafe (that, size) {
  assertSize(size)
  that = createBuffer(that, size < 0 ? 0 : checked(size) | 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < size; ++i) {
      that[i] = 0
    }
  }
  return that
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(null, size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(null, size)
}

function fromString (that, string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('"encoding" must be a valid string encoding')
  }

  var length = byteLength(string, encoding) | 0
  that = createBuffer(that, length)

  var actual = that.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    that = that.slice(0, actual)
  }

  return that
}

function fromArrayLike (that, array) {
  var length = checked(array.length) | 0
  that = createBuffer(that, length)
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

function fromArrayBuffer (that, array, byteOffset, length) {
  array.byteLength // this throws if `array` is not a valid ArrayBuffer

  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('\'offset\' is out of bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('\'length\' is out of bounds')
  }

  if (byteOffset === undefined && length === undefined) {
    array = new Uint8Array(array)
  } else if (length === undefined) {
    array = new Uint8Array(array, byteOffset)
  } else {
    array = new Uint8Array(array, byteOffset, length)
  }

  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = array
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    that = fromArrayLike(that, array)
  }
  return that
}

function fromObject (that, obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    that = createBuffer(that, len)

    if (that.length === 0) {
      return that
    }

    obj.copy(that, 0, 0, len)
    return that
  }

  if (obj) {
    if ((typeof ArrayBuffer !== 'undefined' &&
        obj.buffer instanceof ArrayBuffer) || 'length' in obj) {
      if (typeof obj.length !== 'number' || isnan(obj.length)) {
        return createBuffer(that, 0)
      }
      return fromArrayLike(that, obj)
    }

    if (obj.type === 'Buffer' && isArray(obj.data)) {
      return fromArrayLike(that, obj.data)
    }
  }

  throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
}

function checked (length) {
  // Note: cannot use `length < kMaxLength` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= kMaxLength()) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.compare = function compare (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' &&
      (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    string = '' + string
  }

  var len = string.length
  if (len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
      case undefined:
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) return utf8ToBytes(string).length // assume utf8
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect
// Buffer instances.
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length | 0
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max) str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (!Buffer.isBuffer(target)) {
    throw new TypeError('Argument must be a Buffer')
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset  // Coerce to Number.
  if (isNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (Buffer.TYPED_ARRAY_SUPPORT &&
        typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (isNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset | 0
    if (isFinite(length)) {
      length = length | 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  // legacy write(string, encoding, offset, length) - remove in v0.13
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
      : (firstByte > 0xBF) ? 2
      : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    newBuf = this.subarray(start, end)
    newBuf.__proto__ = Buffer.prototype
  } else {
    var sliceLen = end - start
    newBuf = new Buffer(sliceLen, undefined)
    for (var i = 0; i < sliceLen; ++i) {
      newBuf[i] = this[i + start]
    }
  }

  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  this[offset] = (value & 0xff)
  return offset + 1
}

function objectWriteUInt16 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
      (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

function objectWriteUInt32 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = (value >>> 24)
    this[offset + 2] = (value >>> 16)
    this[offset + 1] = (value >>> 8)
    this[offset] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
    this[offset + 2] = (value >>> 16)
    this[offset + 3] = (value >>> 24)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start
  var i

  if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    // ascending copy from start
    for (i = 0; i < len; ++i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, start + len),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if (code < 256) {
        val = code
      }
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : utf8ToBytes(new Buffer(val, encoding).toString())
    var len = bytes.length
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

function isnan (val) {
  return val !== val // eslint-disable-line no-self-compare
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"base64-js":2,"ieee754":43,"isarray":45}],4:[function(require,module,exports){
module.exports = require('./lib/chai');

},{"./lib/chai":5}],5:[function(require,module,exports){
/*!
 * chai
 * Copyright(c) 2011-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

var used = []
  , exports = module.exports = {};

/*!
 * Chai version
 */

exports.version = '3.5.0';

/*!
 * Assertion Error
 */

exports.AssertionError = require('assertion-error');

/*!
 * Utils for plugins (not exported)
 */

var util = require('./chai/utils');

/**
 * # .use(function)
 *
 * Provides a way to extend the internals of Chai
 *
 * @param {Function}
 * @returns {this} for chaining
 * @api public
 */

exports.use = function (fn) {
  if (!~used.indexOf(fn)) {
    fn(this, util);
    used.push(fn);
  }

  return this;
};

/*!
 * Utility Functions
 */

exports.util = util;

/*!
 * Configuration
 */

var config = require('./chai/config');
exports.config = config;

/*!
 * Primary `Assertion` prototype
 */

var assertion = require('./chai/assertion');
exports.use(assertion);

/*!
 * Core Assertions
 */

var core = require('./chai/core/assertions');
exports.use(core);

/*!
 * Expect interface
 */

var expect = require('./chai/interface/expect');
exports.use(expect);

/*!
 * Should interface
 */

var should = require('./chai/interface/should');
exports.use(should);

/*!
 * Assert interface
 */

var assert = require('./chai/interface/assert');
exports.use(assert);

},{"./chai/assertion":6,"./chai/config":7,"./chai/core/assertions":8,"./chai/interface/assert":9,"./chai/interface/expect":10,"./chai/interface/should":11,"./chai/utils":25,"assertion-error":1}],6:[function(require,module,exports){
/*!
 * chai
 * http://chaijs.com
 * Copyright(c) 2011-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

var config = require('./config');

module.exports = function (_chai, util) {
  /*!
   * Module dependencies.
   */

  var AssertionError = _chai.AssertionError
    , flag = util.flag;

  /*!
   * Module export.
   */

  _chai.Assertion = Assertion;

  /*!
   * Assertion Constructor
   *
   * Creates object for chaining.
   *
   * @api private
   */

  function Assertion (obj, msg, stack) {
    flag(this, 'ssfi', stack || arguments.callee);
    flag(this, 'object', obj);
    flag(this, 'message', msg);
  }

  Object.defineProperty(Assertion, 'includeStack', {
    get: function() {
      console.warn('Assertion.includeStack is deprecated, use chai.config.includeStack instead.');
      return config.includeStack;
    },
    set: function(value) {
      console.warn('Assertion.includeStack is deprecated, use chai.config.includeStack instead.');
      config.includeStack = value;
    }
  });

  Object.defineProperty(Assertion, 'showDiff', {
    get: function() {
      console.warn('Assertion.showDiff is deprecated, use chai.config.showDiff instead.');
      return config.showDiff;
    },
    set: function(value) {
      console.warn('Assertion.showDiff is deprecated, use chai.config.showDiff instead.');
      config.showDiff = value;
    }
  });

  Assertion.addProperty = function (name, fn) {
    util.addProperty(this.prototype, name, fn);
  };

  Assertion.addMethod = function (name, fn) {
    util.addMethod(this.prototype, name, fn);
  };

  Assertion.addChainableMethod = function (name, fn, chainingBehavior) {
    util.addChainableMethod(this.prototype, name, fn, chainingBehavior);
  };

  Assertion.overwriteProperty = function (name, fn) {
    util.overwriteProperty(this.prototype, name, fn);
  };

  Assertion.overwriteMethod = function (name, fn) {
    util.overwriteMethod(this.prototype, name, fn);
  };

  Assertion.overwriteChainableMethod = function (name, fn, chainingBehavior) {
    util.overwriteChainableMethod(this.prototype, name, fn, chainingBehavior);
  };

  /**
   * ### .assert(expression, message, negateMessage, expected, actual, showDiff)
   *
   * Executes an expression and check expectations. Throws AssertionError for reporting if test doesn't pass.
   *
   * @name assert
   * @param {Philosophical} expression to be tested
   * @param {String|Function} message or function that returns message to display if expression fails
   * @param {String|Function} negatedMessage or function that returns negatedMessage to display if negated expression fails
   * @param {Mixed} expected value (remember to check for negation)
   * @param {Mixed} actual (optional) will default to `this.obj`
   * @param {Boolean} showDiff (optional) when set to `true`, assert will display a diff in addition to the message if expression fails
   * @api private
   */

  Assertion.prototype.assert = function (expr, msg, negateMsg, expected, _actual, showDiff) {
    var ok = util.test(this, arguments);
    if (true !== showDiff) showDiff = false;
    if (true !== config.showDiff) showDiff = false;

    if (!ok) {
      var msg = util.getMessage(this, arguments)
        , actual = util.getActual(this, arguments);
      throw new AssertionError(msg, {
          actual: actual
        , expected: expected
        , showDiff: showDiff
      }, (config.includeStack) ? this.assert : flag(this, 'ssfi'));
    }
  };

  /*!
   * ### ._obj
   *
   * Quick reference to stored `actual` value for plugin developers.
   *
   * @api private
   */

  Object.defineProperty(Assertion.prototype, '_obj',
    { get: function () {
        return flag(this, 'object');
      }
    , set: function (val) {
        flag(this, 'object', val);
      }
  });
};

},{"./config":7}],7:[function(require,module,exports){
module.exports = {

  /**
   * ### config.includeStack
   *
   * User configurable property, influences whether stack trace
   * is included in Assertion error message. Default of false
   * suppresses stack trace in the error message.
   *
   *     chai.config.includeStack = true;  // enable stack on error
   *
   * @param {Boolean}
   * @api public
   */

   includeStack: false,

  /**
   * ### config.showDiff
   *
   * User configurable property, influences whether or not
   * the `showDiff` flag should be included in the thrown
   * AssertionErrors. `false` will always be `false`; `true`
   * will be true when the assertion has requested a diff
   * be shown.
   *
   * @param {Boolean}
   * @api public
   */

  showDiff: true,

  /**
   * ### config.truncateThreshold
   *
   * User configurable property, sets length threshold for actual and
   * expected values in assertion errors. If this threshold is exceeded, for
   * example for large data structures, the value is replaced with something
   * like `[ Array(3) ]` or `{ Object (prop1, prop2) }`.
   *
   * Set it to zero if you want to disable truncating altogether.
   *
   * This is especially userful when doing assertions on arrays: having this
   * set to a reasonable large value makes the failure messages readily
   * inspectable.
   *
   *     chai.config.truncateThreshold = 0;  // disable truncating
   *
   * @param {Number}
   * @api public
   */

  truncateThreshold: 40

};

},{}],8:[function(require,module,exports){
/*!
 * chai
 * http://chaijs.com
 * Copyright(c) 2011-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

module.exports = function (chai, _) {
  var Assertion = chai.Assertion
    , toString = Object.prototype.toString
    , flag = _.flag;

  /**
   * ### Language Chains
   *
   * The following are provided as chainable getters to
   * improve the readability of your assertions. They
   * do not provide testing capabilities unless they
   * have been overwritten by a plugin.
   *
   * **Chains**
   *
   * - to
   * - be
   * - been
   * - is
   * - that
   * - which
   * - and
   * - has
   * - have
   * - with
   * - at
   * - of
   * - same
   *
   * @name language chains
   * @namespace BDD
   * @api public
   */

  [ 'to', 'be', 'been'
  , 'is', 'and', 'has', 'have'
  , 'with', 'that', 'which', 'at'
  , 'of', 'same' ].forEach(function (chain) {
    Assertion.addProperty(chain, function () {
      return this;
    });
  });

  /**
   * ### .not
   *
   * Negates any of assertions following in the chain.
   *
   *     expect(foo).to.not.equal('bar');
   *     expect(goodFn).to.not.throw(Error);
   *     expect({ foo: 'baz' }).to.have.property('foo')
   *       .and.not.equal('bar');
   *
   * @name not
   * @namespace BDD
   * @api public
   */

  Assertion.addProperty('not', function () {
    flag(this, 'negate', true);
  });

  /**
   * ### .deep
   *
   * Sets the `deep` flag, later used by the `equal` and
   * `property` assertions.
   *
   *     expect(foo).to.deep.equal({ bar: 'baz' });
   *     expect({ foo: { bar: { baz: 'quux' } } })
   *       .to.have.deep.property('foo.bar.baz', 'quux');
   *
   * `.deep.property` special characters can be escaped
   * by adding two slashes before the `.` or `[]`.
   *
   *     var deepCss = { '.link': { '[target]': 42 }};
   *     expect(deepCss).to.have.deep.property('\\.link.\\[target\\]', 42);
   *
   * @name deep
   * @namespace BDD
   * @api public
   */

  Assertion.addProperty('deep', function () {
    flag(this, 'deep', true);
  });

  /**
   * ### .any
   *
   * Sets the `any` flag, (opposite of the `all` flag)
   * later used in the `keys` assertion.
   *
   *     expect(foo).to.have.any.keys('bar', 'baz');
   *
   * @name any
   * @namespace BDD
   * @api public
   */

  Assertion.addProperty('any', function () {
    flag(this, 'any', true);
    flag(this, 'all', false)
  });


  /**
   * ### .all
   *
   * Sets the `all` flag (opposite of the `any` flag)
   * later used by the `keys` assertion.
   *
   *     expect(foo).to.have.all.keys('bar', 'baz');
   *
   * @name all
   * @namespace BDD
   * @api public
   */

  Assertion.addProperty('all', function () {
    flag(this, 'all', true);
    flag(this, 'any', false);
  });

  /**
   * ### .a(type)
   *
   * The `a` and `an` assertions are aliases that can be
   * used either as language chains or to assert a value's
   * type.
   *
   *     // typeof
   *     expect('test').to.be.a('string');
   *     expect({ foo: 'bar' }).to.be.an('object');
   *     expect(null).to.be.a('null');
   *     expect(undefined).to.be.an('undefined');
   *     expect(new Error).to.be.an('error');
   *     expect(new Promise).to.be.a('promise');
   *     expect(new Float32Array()).to.be.a('float32array');
   *     expect(Symbol()).to.be.a('symbol');
   *
   *     // es6 overrides
   *     expect({[Symbol.toStringTag]:()=>'foo'}).to.be.a('foo');
   *
   *     // language chain
   *     expect(foo).to.be.an.instanceof(Foo);
   *
   * @name a
   * @alias an
   * @param {String} type
   * @param {String} message _optional_
   * @namespace BDD
   * @api public
   */

  function an (type, msg) {
    if (msg) flag(this, 'message', msg);
    type = type.toLowerCase();
    var obj = flag(this, 'object')
      , article = ~[ 'a', 'e', 'i', 'o', 'u' ].indexOf(type.charAt(0)) ? 'an ' : 'a ';

    this.assert(
        type === _.type(obj)
      , 'expected #{this} to be ' + article + type
      , 'expected #{this} not to be ' + article + type
    );
  }

  Assertion.addChainableMethod('an', an);
  Assertion.addChainableMethod('a', an);

  /**
   * ### .include(value)
   *
   * The `include` and `contain` assertions can be used as either property
   * based language chains or as methods to assert the inclusion of an object
   * in an array or a substring in a string. When used as language chains,
   * they toggle the `contains` flag for the `keys` assertion.
   *
   *     expect([1,2,3]).to.include(2);
   *     expect('foobar').to.contain('foo');
   *     expect({ foo: 'bar', hello: 'universe' }).to.include.keys('foo');
   *
   * @name include
   * @alias contain
   * @alias includes
   * @alias contains
   * @param {Object|String|Number} obj
   * @param {String} message _optional_
   * @namespace BDD
   * @api public
   */

  function includeChainingBehavior () {
    flag(this, 'contains', true);
  }

  function include (val, msg) {
    _.expectTypes(this, ['array', 'object', 'string']);

    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');
    var expected = false;

    if (_.type(obj) === 'array' && _.type(val) === 'object') {
      for (var i in obj) {
        if (_.eql(obj[i], val)) {
          expected = true;
          break;
        }
      }
    } else if (_.type(val) === 'object') {
      if (!flag(this, 'negate')) {
        for (var k in val) new Assertion(obj).property(k, val[k]);
        return;
      }
      var subset = {};
      for (var k in val) subset[k] = obj[k];
      expected = _.eql(subset, val);
    } else {
      expected = (obj != undefined) && ~obj.indexOf(val);
    }
    this.assert(
        expected
      , 'expected #{this} to include ' + _.inspect(val)
      , 'expected #{this} to not include ' + _.inspect(val));
  }

  Assertion.addChainableMethod('include', include, includeChainingBehavior);
  Assertion.addChainableMethod('contain', include, includeChainingBehavior);
  Assertion.addChainableMethod('contains', include, includeChainingBehavior);
  Assertion.addChainableMethod('includes', include, includeChainingBehavior);

  /**
   * ### .ok
   *
   * Asserts that the target is truthy.
   *
   *     expect('everything').to.be.ok;
   *     expect(1).to.be.ok;
   *     expect(false).to.not.be.ok;
   *     expect(undefined).to.not.be.ok;
   *     expect(null).to.not.be.ok;
   *
   * @name ok
   * @namespace BDD
   * @api public
   */

  Assertion.addProperty('ok', function () {
    this.assert(
        flag(this, 'object')
      , 'expected #{this} to be truthy'
      , 'expected #{this} to be falsy');
  });

  /**
   * ### .true
   *
   * Asserts that the target is `true`.
   *
   *     expect(true).to.be.true;
   *     expect(1).to.not.be.true;
   *
   * @name true
   * @namespace BDD
   * @api public
   */

  Assertion.addProperty('true', function () {
    this.assert(
        true === flag(this, 'object')
      , 'expected #{this} to be true'
      , 'expected #{this} to be false'
      , this.negate ? false : true
    );
  });

  /**
   * ### .false
   *
   * Asserts that the target is `false`.
   *
   *     expect(false).to.be.false;
   *     expect(0).to.not.be.false;
   *
   * @name false
   * @namespace BDD
   * @api public
   */

  Assertion.addProperty('false', function () {
    this.assert(
        false === flag(this, 'object')
      , 'expected #{this} to be false'
      , 'expected #{this} to be true'
      , this.negate ? true : false
    );
  });

  /**
   * ### .null
   *
   * Asserts that the target is `null`.
   *
   *     expect(null).to.be.null;
   *     expect(undefined).to.not.be.null;
   *
   * @name null
   * @namespace BDD
   * @api public
   */

  Assertion.addProperty('null', function () {
    this.assert(
        null === flag(this, 'object')
      , 'expected #{this} to be null'
      , 'expected #{this} not to be null'
    );
  });

  /**
   * ### .undefined
   *
   * Asserts that the target is `undefined`.
   *
   *     expect(undefined).to.be.undefined;
   *     expect(null).to.not.be.undefined;
   *
   * @name undefined
   * @namespace BDD
   * @api public
   */

  Assertion.addProperty('undefined', function () {
    this.assert(
        undefined === flag(this, 'object')
      , 'expected #{this} to be undefined'
      , 'expected #{this} not to be undefined'
    );
  });

  /**
   * ### .NaN
   * Asserts that the target is `NaN`.
   *
   *     expect('foo').to.be.NaN;
   *     expect(4).not.to.be.NaN;
   *
   * @name NaN
   * @namespace BDD
   * @api public
   */

  Assertion.addProperty('NaN', function () {
    this.assert(
        isNaN(flag(this, 'object'))
        , 'expected #{this} to be NaN'
        , 'expected #{this} not to be NaN'
    );
  });

  /**
   * ### .exist
   *
   * Asserts that the target is neither `null` nor `undefined`.
   *
   *     var foo = 'hi'
   *       , bar = null
   *       , baz;
   *
   *     expect(foo).to.exist;
   *     expect(bar).to.not.exist;
   *     expect(baz).to.not.exist;
   *
   * @name exist
   * @namespace BDD
   * @api public
   */

  Assertion.addProperty('exist', function () {
    this.assert(
        null != flag(this, 'object')
      , 'expected #{this} to exist'
      , 'expected #{this} to not exist'
    );
  });


  /**
   * ### .empty
   *
   * Asserts that the target's length is `0`. For arrays and strings, it checks
   * the `length` property. For objects, it gets the count of
   * enumerable keys.
   *
   *     expect([]).to.be.empty;
   *     expect('').to.be.empty;
   *     expect({}).to.be.empty;
   *
   * @name empty
   * @namespace BDD
   * @api public
   */

  Assertion.addProperty('empty', function () {
    var obj = flag(this, 'object')
      , expected = obj;

    if (Array.isArray(obj) || 'string' === typeof object) {
      expected = obj.length;
    } else if (typeof obj === 'object') {
      expected = Object.keys(obj).length;
    }

    this.assert(
        !expected
      , 'expected #{this} to be empty'
      , 'expected #{this} not to be empty'
    );
  });

  /**
   * ### .arguments
   *
   * Asserts that the target is an arguments object.
   *
   *     function test () {
   *       expect(arguments).to.be.arguments;
   *     }
   *
   * @name arguments
   * @alias Arguments
   * @namespace BDD
   * @api public
   */

  function checkArguments () {
    var obj = flag(this, 'object')
      , type = Object.prototype.toString.call(obj);
    this.assert(
        '[object Arguments]' === type
      , 'expected #{this} to be arguments but got ' + type
      , 'expected #{this} to not be arguments'
    );
  }

  Assertion.addProperty('arguments', checkArguments);
  Assertion.addProperty('Arguments', checkArguments);

  /**
   * ### .equal(value)
   *
   * Asserts that the target is strictly equal (`===`) to `value`.
   * Alternately, if the `deep` flag is set, asserts that
   * the target is deeply equal to `value`.
   *
   *     expect('hello').to.equal('hello');
   *     expect(42).to.equal(42);
   *     expect(1).to.not.equal(true);
   *     expect({ foo: 'bar' }).to.not.equal({ foo: 'bar' });
   *     expect({ foo: 'bar' }).to.deep.equal({ foo: 'bar' });
   *
   * @name equal
   * @alias equals
   * @alias eq
   * @alias deep.equal
   * @param {Mixed} value
   * @param {String} message _optional_
   * @namespace BDD
   * @api public
   */

  function assertEqual (val, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');
    if (flag(this, 'deep')) {
      return this.eql(val);
    } else {
      this.assert(
          val === obj
        , 'expected #{this} to equal #{exp}'
        , 'expected #{this} to not equal #{exp}'
        , val
        , this._obj
        , true
      );
    }
  }

  Assertion.addMethod('equal', assertEqual);
  Assertion.addMethod('equals', assertEqual);
  Assertion.addMethod('eq', assertEqual);

  /**
   * ### .eql(value)
   *
   * Asserts that the target is deeply equal to `value`.
   *
   *     expect({ foo: 'bar' }).to.eql({ foo: 'bar' });
   *     expect([ 1, 2, 3 ]).to.eql([ 1, 2, 3 ]);
   *
   * @name eql
   * @alias eqls
   * @param {Mixed} value
   * @param {String} message _optional_
   * @namespace BDD
   * @api public
   */

  function assertEql(obj, msg) {
    if (msg) flag(this, 'message', msg);
    this.assert(
        _.eql(obj, flag(this, 'object'))
      , 'expected #{this} to deeply equal #{exp}'
      , 'expected #{this} to not deeply equal #{exp}'
      , obj
      , this._obj
      , true
    );
  }

  Assertion.addMethod('eql', assertEql);
  Assertion.addMethod('eqls', assertEql);

  /**
   * ### .above(value)
   *
   * Asserts that the target is greater than `value`.
   *
   *     expect(10).to.be.above(5);
   *
   * Can also be used in conjunction with `length` to
   * assert a minimum length. The benefit being a
   * more informative error message than if the length
   * was supplied directly.
   *
   *     expect('foo').to.have.length.above(2);
   *     expect([ 1, 2, 3 ]).to.have.length.above(2);
   *
   * @name above
   * @alias gt
   * @alias greaterThan
   * @param {Number} value
   * @param {String} message _optional_
   * @namespace BDD
   * @api public
   */

  function assertAbove (n, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');
    if (flag(this, 'doLength')) {
      new Assertion(obj, msg).to.have.property('length');
      var len = obj.length;
      this.assert(
          len > n
        , 'expected #{this} to have a length above #{exp} but got #{act}'
        , 'expected #{this} to not have a length above #{exp}'
        , n
        , len
      );
    } else {
      this.assert(
          obj > n
        , 'expected #{this} to be above ' + n
        , 'expected #{this} to be at most ' + n
      );
    }
  }

  Assertion.addMethod('above', assertAbove);
  Assertion.addMethod('gt', assertAbove);
  Assertion.addMethod('greaterThan', assertAbove);

  /**
   * ### .least(value)
   *
   * Asserts that the target is greater than or equal to `value`.
   *
   *     expect(10).to.be.at.least(10);
   *
   * Can also be used in conjunction with `length` to
   * assert a minimum length. The benefit being a
   * more informative error message than if the length
   * was supplied directly.
   *
   *     expect('foo').to.have.length.of.at.least(2);
   *     expect([ 1, 2, 3 ]).to.have.length.of.at.least(3);
   *
   * @name least
   * @alias gte
   * @param {Number} value
   * @param {String} message _optional_
   * @namespace BDD
   * @api public
   */

  function assertLeast (n, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');
    if (flag(this, 'doLength')) {
      new Assertion(obj, msg).to.have.property('length');
      var len = obj.length;
      this.assert(
          len >= n
        , 'expected #{this} to have a length at least #{exp} but got #{act}'
        , 'expected #{this} to have a length below #{exp}'
        , n
        , len
      );
    } else {
      this.assert(
          obj >= n
        , 'expected #{this} to be at least ' + n
        , 'expected #{this} to be below ' + n
      );
    }
  }

  Assertion.addMethod('least', assertLeast);
  Assertion.addMethod('gte', assertLeast);

  /**
   * ### .below(value)
   *
   * Asserts that the target is less than `value`.
   *
   *     expect(5).to.be.below(10);
   *
   * Can also be used in conjunction with `length` to
   * assert a maximum length. The benefit being a
   * more informative error message than if the length
   * was supplied directly.
   *
   *     expect('foo').to.have.length.below(4);
   *     expect([ 1, 2, 3 ]).to.have.length.below(4);
   *
   * @name below
   * @alias lt
   * @alias lessThan
   * @param {Number} value
   * @param {String} message _optional_
   * @namespace BDD
   * @api public
   */

  function assertBelow (n, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');
    if (flag(this, 'doLength')) {
      new Assertion(obj, msg).to.have.property('length');
      var len = obj.length;
      this.assert(
          len < n
        , 'expected #{this} to have a length below #{exp} but got #{act}'
        , 'expected #{this} to not have a length below #{exp}'
        , n
        , len
      );
    } else {
      this.assert(
          obj < n
        , 'expected #{this} to be below ' + n
        , 'expected #{this} to be at least ' + n
      );
    }
  }

  Assertion.addMethod('below', assertBelow);
  Assertion.addMethod('lt', assertBelow);
  Assertion.addMethod('lessThan', assertBelow);

  /**
   * ### .most(value)
   *
   * Asserts that the target is less than or equal to `value`.
   *
   *     expect(5).to.be.at.most(5);
   *
   * Can also be used in conjunction with `length` to
   * assert a maximum length. The benefit being a
   * more informative error message than if the length
   * was supplied directly.
   *
   *     expect('foo').to.have.length.of.at.most(4);
   *     expect([ 1, 2, 3 ]).to.have.length.of.at.most(3);
   *
   * @name most
   * @alias lte
   * @param {Number} value
   * @param {String} message _optional_
   * @namespace BDD
   * @api public
   */

  function assertMost (n, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');
    if (flag(this, 'doLength')) {
      new Assertion(obj, msg).to.have.property('length');
      var len = obj.length;
      this.assert(
          len <= n
        , 'expected #{this} to have a length at most #{exp} but got #{act}'
        , 'expected #{this} to have a length above #{exp}'
        , n
        , len
      );
    } else {
      this.assert(
          obj <= n
        , 'expected #{this} to be at most ' + n
        , 'expected #{this} to be above ' + n
      );
    }
  }

  Assertion.addMethod('most', assertMost);
  Assertion.addMethod('lte', assertMost);

  /**
   * ### .within(start, finish)
   *
   * Asserts that the target is within a range.
   *
   *     expect(7).to.be.within(5,10);
   *
   * Can also be used in conjunction with `length` to
   * assert a length range. The benefit being a
   * more informative error message than if the length
   * was supplied directly.
   *
   *     expect('foo').to.have.length.within(2,4);
   *     expect([ 1, 2, 3 ]).to.have.length.within(2,4);
   *
   * @name within
   * @param {Number} start lowerbound inclusive
   * @param {Number} finish upperbound inclusive
   * @param {String} message _optional_
   * @namespace BDD
   * @api public
   */

  Assertion.addMethod('within', function (start, finish, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object')
      , range = start + '..' + finish;
    if (flag(this, 'doLength')) {
      new Assertion(obj, msg).to.have.property('length');
      var len = obj.length;
      this.assert(
          len >= start && len <= finish
        , 'expected #{this} to have a length within ' + range
        , 'expected #{this} to not have a length within ' + range
      );
    } else {
      this.assert(
          obj >= start && obj <= finish
        , 'expected #{this} to be within ' + range
        , 'expected #{this} to not be within ' + range
      );
    }
  });

  /**
   * ### .instanceof(constructor)
   *
   * Asserts that the target is an instance of `constructor`.
   *
   *     var Tea = function (name) { this.name = name; }
   *       , Chai = new Tea('chai');
   *
   *     expect(Chai).to.be.an.instanceof(Tea);
   *     expect([ 1, 2, 3 ]).to.be.instanceof(Array);
   *
   * @name instanceof
   * @param {Constructor} constructor
   * @param {String} message _optional_
   * @alias instanceOf
   * @namespace BDD
   * @api public
   */

  function assertInstanceOf (constructor, msg) {
    if (msg) flag(this, 'message', msg);
    var name = _.getName(constructor);
    this.assert(
        flag(this, 'object') instanceof constructor
      , 'expected #{this} to be an instance of ' + name
      , 'expected #{this} to not be an instance of ' + name
    );
  };

  Assertion.addMethod('instanceof', assertInstanceOf);
  Assertion.addMethod('instanceOf', assertInstanceOf);

  /**
   * ### .property(name, [value])
   *
   * Asserts that the target has a property `name`, optionally asserting that
   * the value of that property is strictly equal to  `value`.
   * If the `deep` flag is set, you can use dot- and bracket-notation for deep
   * references into objects and arrays.
   *
   *     // simple referencing
   *     var obj = { foo: 'bar' };
   *     expect(obj).to.have.property('foo');
   *     expect(obj).to.have.property('foo', 'bar');
   *
   *     // deep referencing
   *     var deepObj = {
   *         green: { tea: 'matcha' }
   *       , teas: [ 'chai', 'matcha', { tea: 'konacha' } ]
   *     };
   *
   *     expect(deepObj).to.have.deep.property('green.tea', 'matcha');
   *     expect(deepObj).to.have.deep.property('teas[1]', 'matcha');
   *     expect(deepObj).to.have.deep.property('teas[2].tea', 'konacha');
   *
   * You can also use an array as the starting point of a `deep.property`
   * assertion, or traverse nested arrays.
   *
   *     var arr = [
   *         [ 'chai', 'matcha', 'konacha' ]
   *       , [ { tea: 'chai' }
   *         , { tea: 'matcha' }
   *         , { tea: 'konacha' } ]
   *     ];
   *
   *     expect(arr).to.have.deep.property('[0][1]', 'matcha');
   *     expect(arr).to.have.deep.property('[1][2].tea', 'konacha');
   *
   * Furthermore, `property` changes the subject of the assertion
   * to be the value of that property from the original object. This
   * permits for further chainable assertions on that property.
   *
   *     expect(obj).to.have.property('foo')
   *       .that.is.a('string');
   *     expect(deepObj).to.have.property('green')
   *       .that.is.an('object')
   *       .that.deep.equals({ tea: 'matcha' });
   *     expect(deepObj).to.have.property('teas')
   *       .that.is.an('array')
   *       .with.deep.property('[2]')
   *         .that.deep.equals({ tea: 'konacha' });
   *
   * Note that dots and bracket in `name` must be backslash-escaped when
   * the `deep` flag is set, while they must NOT be escaped when the `deep`
   * flag is not set.
   *
   *     // simple referencing
   *     var css = { '.link[target]': 42 };
   *     expect(css).to.have.property('.link[target]', 42);
   *
   *     // deep referencing
   *     var deepCss = { '.link': { '[target]': 42 }};
   *     expect(deepCss).to.have.deep.property('\\.link.\\[target\\]', 42);
   *
   * @name property
   * @alias deep.property
   * @param {String} name
   * @param {Mixed} value (optional)
   * @param {String} message _optional_
   * @returns value of property for chaining
   * @namespace BDD
   * @api public
   */

  Assertion.addMethod('property', function (name, val, msg) {
    if (msg) flag(this, 'message', msg);

    var isDeep = !!flag(this, 'deep')
      , descriptor = isDeep ? 'deep property ' : 'property '
      , negate = flag(this, 'negate')
      , obj = flag(this, 'object')
      , pathInfo = isDeep ? _.getPathInfo(name, obj) : null
      , hasProperty = isDeep
        ? pathInfo.exists
        : _.hasProperty(name, obj)
      , value = isDeep
        ? pathInfo.value
        : obj[name];

    if (negate && arguments.length > 1) {
      if (undefined === value) {
        msg = (msg != null) ? msg + ': ' : '';
        throw new Error(msg + _.inspect(obj) + ' has no ' + descriptor + _.inspect(name));
      }
    } else {
      this.assert(
          hasProperty
        , 'expected #{this} to have a ' + descriptor + _.inspect(name)
        , 'expected #{this} to not have ' + descriptor + _.inspect(name));
    }

    if (arguments.length > 1) {
      this.assert(
          val === value
        , 'expected #{this} to have a ' + descriptor + _.inspect(name) + ' of #{exp}, but got #{act}'
        , 'expected #{this} to not have a ' + descriptor + _.inspect(name) + ' of #{act}'
        , val
        , value
      );
    }

    flag(this, 'object', value);
  });


  /**
   * ### .ownProperty(name)
   *
   * Asserts that the target has an own property `name`.
   *
   *     expect('test').to.have.ownProperty('length');
   *
   * @name ownProperty
   * @alias haveOwnProperty
   * @param {String} name
   * @param {String} message _optional_
   * @namespace BDD
   * @api public
   */

  function assertOwnProperty (name, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');
    this.assert(
        obj.hasOwnProperty(name)
      , 'expected #{this} to have own property ' + _.inspect(name)
      , 'expected #{this} to not have own property ' + _.inspect(name)
    );
  }

  Assertion.addMethod('ownProperty', assertOwnProperty);
  Assertion.addMethod('haveOwnProperty', assertOwnProperty);

  /**
   * ### .ownPropertyDescriptor(name[, descriptor[, message]])
   *
   * Asserts that the target has an own property descriptor `name`, that optionally matches `descriptor`.
   *
   *     expect('test').to.have.ownPropertyDescriptor('length');
   *     expect('test').to.have.ownPropertyDescriptor('length', { enumerable: false, configurable: false, writable: false, value: 4 });
   *     expect('test').not.to.have.ownPropertyDescriptor('length', { enumerable: false, configurable: false, writable: false, value: 3 });
   *     expect('test').ownPropertyDescriptor('length').to.have.property('enumerable', false);
   *     expect('test').ownPropertyDescriptor('length').to.have.keys('value');
   *
   * @name ownPropertyDescriptor
   * @alias haveOwnPropertyDescriptor
   * @param {String} name
   * @param {Object} descriptor _optional_
   * @param {String} message _optional_
   * @namespace BDD
   * @api public
   */

  function assertOwnPropertyDescriptor (name, descriptor, msg) {
    if (typeof descriptor === 'string') {
      msg = descriptor;
      descriptor = null;
    }
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');
    var actualDescriptor = Object.getOwnPropertyDescriptor(Object(obj), name);
    if (actualDescriptor && descriptor) {
      this.assert(
          _.eql(descriptor, actualDescriptor)
        , 'expected the own property descriptor for ' + _.inspect(name) + ' on #{this} to match ' + _.inspect(descriptor) + ', got ' + _.inspect(actualDescriptor)
        , 'expected the own property descriptor for ' + _.inspect(name) + ' on #{this} to not match ' + _.inspect(descriptor)
        , descriptor
        , actualDescriptor
        , true
      );
    } else {
      this.assert(
          actualDescriptor
        , 'expected #{this} to have an own property descriptor for ' + _.inspect(name)
        , 'expected #{this} to not have an own property descriptor for ' + _.inspect(name)
      );
    }
    flag(this, 'object', actualDescriptor);
  }

  Assertion.addMethod('ownPropertyDescriptor', assertOwnPropertyDescriptor);
  Assertion.addMethod('haveOwnPropertyDescriptor', assertOwnPropertyDescriptor);

  /**
   * ### .length
   *
   * Sets the `doLength` flag later used as a chain precursor to a value
   * comparison for the `length` property.
   *
   *     expect('foo').to.have.length.above(2);
   *     expect([ 1, 2, 3 ]).to.have.length.above(2);
   *     expect('foo').to.have.length.below(4);
   *     expect([ 1, 2, 3 ]).to.have.length.below(4);
   *     expect('foo').to.have.length.within(2,4);
   *     expect([ 1, 2, 3 ]).to.have.length.within(2,4);
   *
   * *Deprecation notice:* Using `length` as an assertion will be deprecated
   * in version 2.4.0 and removed in 3.0.0. Code using the old style of
   * asserting for `length` property value using `length(value)` should be
   * switched to use `lengthOf(value)` instead.
   *
   * @name length
   * @namespace BDD
   * @api public
   */

  /**
   * ### .lengthOf(value[, message])
   *
   * Asserts that the target's `length` property has
   * the expected value.
   *
   *     expect([ 1, 2, 3]).to.have.lengthOf(3);
   *     expect('foobar').to.have.lengthOf(6);
   *
   * @name lengthOf
   * @param {Number} length
   * @param {String} message _optional_
   * @namespace BDD
   * @api public
   */

  function assertLengthChain () {
    flag(this, 'doLength', true);
  }

  function assertLength (n, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');
    new Assertion(obj, msg).to.have.property('length');
    var len = obj.length;

    this.assert(
        len == n
      , 'expected #{this} to have a length of #{exp} but got #{act}'
      , 'expected #{this} to not have a length of #{act}'
      , n
      , len
    );
  }

  Assertion.addChainableMethod('length', assertLength, assertLengthChain);
  Assertion.addMethod('lengthOf', assertLength);

  /**
   * ### .match(regexp)
   *
   * Asserts that the target matches a regular expression.
   *
   *     expect('foobar').to.match(/^foo/);
   *
   * @name match
   * @alias matches
   * @param {RegExp} RegularExpression
   * @param {String} message _optional_
   * @namespace BDD
   * @api public
   */
  function assertMatch(re, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');
    this.assert(
        re.exec(obj)
      , 'expected #{this} to match ' + re
      , 'expected #{this} not to match ' + re
    );
  }

  Assertion.addMethod('match', assertMatch);
  Assertion.addMethod('matches', assertMatch);

  /**
   * ### .string(string)
   *
   * Asserts that the string target contains another string.
   *
   *     expect('foobar').to.have.string('bar');
   *
   * @name string
   * @param {String} string
   * @param {String} message _optional_
   * @namespace BDD
   * @api public
   */

  Assertion.addMethod('string', function (str, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');
    new Assertion(obj, msg).is.a('string');

    this.assert(
        ~obj.indexOf(str)
      , 'expected #{this} to contain ' + _.inspect(str)
      , 'expected #{this} to not contain ' + _.inspect(str)
    );
  });


  /**
   * ### .keys(key1, [key2], [...])
   *
   * Asserts that the target contains any or all of the passed-in keys.
   * Use in combination with `any`, `all`, `contains`, or `have` will affect
   * what will pass.
   *
   * When used in conjunction with `any`, at least one key that is passed
   * in must exist in the target object. This is regardless whether or not
   * the `have` or `contain` qualifiers are used. Note, either `any` or `all`
   * should be used in the assertion. If neither are used, the assertion is
   * defaulted to `all`.
   *
   * When both `all` and `contain` are used, the target object must have at
   * least all of the passed-in keys but may have more keys not listed.
   *
   * When both `all` and `have` are used, the target object must both contain
   * all of the passed-in keys AND the number of keys in the target object must
   * match the number of keys passed in (in other words, a target object must
   * have all and only all of the passed-in keys).
   *
   *     expect({ foo: 1, bar: 2 }).to.have.any.keys('foo', 'baz');
   *     expect({ foo: 1, bar: 2 }).to.have.any.keys('foo');
   *     expect({ foo: 1, bar: 2 }).to.contain.any.keys('bar', 'baz');
   *     expect({ foo: 1, bar: 2 }).to.contain.any.keys(['foo']);
   *     expect({ foo: 1, bar: 2 }).to.contain.any.keys({'foo': 6});
   *     expect({ foo: 1, bar: 2 }).to.have.all.keys(['bar', 'foo']);
   *     expect({ foo: 1, bar: 2 }).to.have.all.keys({'bar': 6, 'foo': 7});
   *     expect({ foo: 1, bar: 2, baz: 3 }).to.contain.all.keys(['bar', 'foo']);
   *     expect({ foo: 1, bar: 2, baz: 3 }).to.contain.all.keys({'bar': 6});
   *
   *
   * @name keys
   * @alias key
   * @param {...String|Array|Object} keys
   * @namespace BDD
   * @api public
   */

  function assertKeys (keys) {
    var obj = flag(this, 'object')
      , str
      , ok = true
      , mixedArgsMsg = 'keys must be given single argument of Array|Object|String, or multiple String arguments';

    switch (_.type(keys)) {
      case "array":
        if (arguments.length > 1) throw (new Error(mixedArgsMsg));
        break;
      case "object":
        if (arguments.length > 1) throw (new Error(mixedArgsMsg));
        keys = Object.keys(keys);
        break;
      default:
        keys = Array.prototype.slice.call(arguments);
    }

    if (!keys.length) throw new Error('keys required');

    var actual = Object.keys(obj)
      , expected = keys
      , len = keys.length
      , any = flag(this, 'any')
      , all = flag(this, 'all');

    if (!any && !all) {
      all = true;
    }

    // Has any
    if (any) {
      var intersection = expected.filter(function(key) {
        return ~actual.indexOf(key);
      });
      ok = intersection.length > 0;
    }

    // Has all
    if (all) {
      ok = keys.every(function(key){
        return ~actual.indexOf(key);
      });
      if (!flag(this, 'negate') && !flag(this, 'contains')) {
        ok = ok && keys.length == actual.length;
      }
    }

    // Key string
    if (len > 1) {
      keys = keys.map(function(key){
        return _.inspect(key);
      });
      var last = keys.pop();
      if (all) {
        str = keys.join(', ') + ', and ' + last;
      }
      if (any) {
        str = keys.join(', ') + ', or ' + last;
      }
    } else {
      str = _.inspect(keys[0]);
    }

    // Form
    str = (len > 1 ? 'keys ' : 'key ') + str;

    // Have / include
    str = (flag(this, 'contains') ? 'contain ' : 'have ') + str;

    // Assertion
    this.assert(
        ok
      , 'expected #{this} to ' + str
      , 'expected #{this} to not ' + str
      , expected.slice(0).sort()
      , actual.sort()
      , true
    );
  }

  Assertion.addMethod('keys', assertKeys);
  Assertion.addMethod('key', assertKeys);

  /**
   * ### .throw(constructor)
   *
   * Asserts that the function target will throw a specific error, or specific type of error
   * (as determined using `instanceof`), optionally with a RegExp or string inclusion test
   * for the error's message.
   *
   *     var err = new ReferenceError('This is a bad function.');
   *     var fn = function () { throw err; }
   *     expect(fn).to.throw(ReferenceError);
   *     expect(fn).to.throw(Error);
   *     expect(fn).to.throw(/bad function/);
   *     expect(fn).to.not.throw('good function');
   *     expect(fn).to.throw(ReferenceError, /bad function/);
   *     expect(fn).to.throw(err);
   *
   * Please note that when a throw expectation is negated, it will check each
   * parameter independently, starting with error constructor type. The appropriate way
   * to check for the existence of a type of error but for a message that does not match
   * is to use `and`.
   *
   *     expect(fn).to.throw(ReferenceError)
   *        .and.not.throw(/good function/);
   *
   * @name throw
   * @alias throws
   * @alias Throw
   * @param {ErrorConstructor} constructor
   * @param {String|RegExp} expected error message
   * @param {String} message _optional_
   * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Error#Error_types
   * @returns error for chaining (null if no error)
   * @namespace BDD
   * @api public
   */

  function assertThrows (constructor, errMsg, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');
    new Assertion(obj, msg).is.a('function');

    var thrown = false
      , desiredError = null
      , name = null
      , thrownError = null;

    if (arguments.length === 0) {
      errMsg = null;
      constructor = null;
    } else if (constructor && (constructor instanceof RegExp || 'string' === typeof constructor)) {
      errMsg = constructor;
      constructor = null;
    } else if (constructor && constructor instanceof Error) {
      desiredError = constructor;
      constructor = null;
      errMsg = null;
    } else if (typeof constructor === 'function') {
      name = constructor.prototype.name;
      if (!name || (name === 'Error' && constructor !== Error)) {
        name = constructor.name || (new constructor()).name;
      }
    } else {
      constructor = null;
    }

    try {
      obj();
    } catch (err) {
      // first, check desired error
      if (desiredError) {
        this.assert(
            err === desiredError
          , 'expected #{this} to throw #{exp} but #{act} was thrown'
          , 'expected #{this} to not throw #{exp}'
          , (desiredError instanceof Error ? desiredError.toString() : desiredError)
          , (err instanceof Error ? err.toString() : err)
        );

        flag(this, 'object', err);
        return this;
      }

      // next, check constructor
      if (constructor) {
        this.assert(
            err instanceof constructor
          , 'expected #{this} to throw #{exp} but #{act} was thrown'
          , 'expected #{this} to not throw #{exp} but #{act} was thrown'
          , name
          , (err instanceof Error ? err.toString() : err)
        );

        if (!errMsg) {
          flag(this, 'object', err);
          return this;
        }
      }

      // next, check message
      var message = 'error' === _.type(err) && "message" in err
        ? err.message
        : '' + err;

      if ((message != null) && errMsg && errMsg instanceof RegExp) {
        this.assert(
            errMsg.exec(message)
          , 'expected #{this} to throw error matching #{exp} but got #{act}'
          , 'expected #{this} to throw error not matching #{exp}'
          , errMsg
          , message
        );

        flag(this, 'object', err);
        return this;
      } else if ((message != null) && errMsg && 'string' === typeof errMsg) {
        this.assert(
            ~message.indexOf(errMsg)
          , 'expected #{this} to throw error including #{exp} but got #{act}'
          , 'expected #{this} to throw error not including #{act}'
          , errMsg
          , message
        );

        flag(this, 'object', err);
        return this;
      } else {
        thrown = true;
        thrownError = err;
      }
    }

    var actuallyGot = ''
      , expectedThrown = name !== null
        ? name
        : desiredError
          ? '#{exp}' //_.inspect(desiredError)
          : 'an error';

    if (thrown) {
      actuallyGot = ' but #{act} was thrown'
    }

    this.assert(
        thrown === true
      , 'expected #{this} to throw ' + expectedThrown + actuallyGot
      , 'expected #{this} to not throw ' + expectedThrown + actuallyGot
      , (desiredError instanceof Error ? desiredError.toString() : desiredError)
      , (thrownError instanceof Error ? thrownError.toString() : thrownError)
    );

    flag(this, 'object', thrownError);
  };

  Assertion.addMethod('throw', assertThrows);
  Assertion.addMethod('throws', assertThrows);
  Assertion.addMethod('Throw', assertThrows);

  /**
   * ### .respondTo(method)
   *
   * Asserts that the object or class target will respond to a method.
   *
   *     Klass.prototype.bar = function(){};
   *     expect(Klass).to.respondTo('bar');
   *     expect(obj).to.respondTo('bar');
   *
   * To check if a constructor will respond to a static function,
   * set the `itself` flag.
   *
   *     Klass.baz = function(){};
   *     expect(Klass).itself.to.respondTo('baz');
   *
   * @name respondTo
   * @alias respondsTo
   * @param {String} method
   * @param {String} message _optional_
   * @namespace BDD
   * @api public
   */

  function respondTo (method, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object')
      , itself = flag(this, 'itself')
      , context = ('function' === _.type(obj) && !itself)
        ? obj.prototype[method]
        : obj[method];

    this.assert(
        'function' === typeof context
      , 'expected #{this} to respond to ' + _.inspect(method)
      , 'expected #{this} to not respond to ' + _.inspect(method)
    );
  }

  Assertion.addMethod('respondTo', respondTo);
  Assertion.addMethod('respondsTo', respondTo);

  /**
   * ### .itself
   *
   * Sets the `itself` flag, later used by the `respondTo` assertion.
   *
   *     function Foo() {}
   *     Foo.bar = function() {}
   *     Foo.prototype.baz = function() {}
   *
   *     expect(Foo).itself.to.respondTo('bar');
   *     expect(Foo).itself.not.to.respondTo('baz');
   *
   * @name itself
   * @namespace BDD
   * @api public
   */

  Assertion.addProperty('itself', function () {
    flag(this, 'itself', true);
  });

  /**
   * ### .satisfy(method)
   *
   * Asserts that the target passes a given truth test.
   *
   *     expect(1).to.satisfy(function(num) { return num > 0; });
   *
   * @name satisfy
   * @alias satisfies
   * @param {Function} matcher
   * @param {String} message _optional_
   * @namespace BDD
   * @api public
   */

  function satisfy (matcher, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');
    var result = matcher(obj);
    this.assert(
        result
      , 'expected #{this} to satisfy ' + _.objDisplay(matcher)
      , 'expected #{this} to not satisfy' + _.objDisplay(matcher)
      , this.negate ? false : true
      , result
    );
  }

  Assertion.addMethod('satisfy', satisfy);
  Assertion.addMethod('satisfies', satisfy);

  /**
   * ### .closeTo(expected, delta)
   *
   * Asserts that the target is equal `expected`, to within a +/- `delta` range.
   *
   *     expect(1.5).to.be.closeTo(1, 0.5);
   *
   * @name closeTo
   * @alias approximately
   * @param {Number} expected
   * @param {Number} delta
   * @param {String} message _optional_
   * @namespace BDD
   * @api public
   */

  function closeTo(expected, delta, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');

    new Assertion(obj, msg).is.a('number');
    if (_.type(expected) !== 'number' || _.type(delta) !== 'number') {
      throw new Error('the arguments to closeTo or approximately must be numbers');
    }

    this.assert(
        Math.abs(obj - expected) <= delta
      , 'expected #{this} to be close to ' + expected + ' +/- ' + delta
      , 'expected #{this} not to be close to ' + expected + ' +/- ' + delta
    );
  }

  Assertion.addMethod('closeTo', closeTo);
  Assertion.addMethod('approximately', closeTo);

  function isSubsetOf(subset, superset, cmp) {
    return subset.every(function(elem) {
      if (!cmp) return superset.indexOf(elem) !== -1;

      return superset.some(function(elem2) {
        return cmp(elem, elem2);
      });
    })
  }

  /**
   * ### .members(set)
   *
   * Asserts that the target is a superset of `set`,
   * or that the target and `set` have the same strictly-equal (===) members.
   * Alternately, if the `deep` flag is set, set members are compared for deep
   * equality.
   *
   *     expect([1, 2, 3]).to.include.members([3, 2]);
   *     expect([1, 2, 3]).to.not.include.members([3, 2, 8]);
   *
   *     expect([4, 2]).to.have.members([2, 4]);
   *     expect([5, 2]).to.not.have.members([5, 2, 1]);
   *
   *     expect([{ id: 1 }]).to.deep.include.members([{ id: 1 }]);
   *
   * @name members
   * @param {Array} set
   * @param {String} message _optional_
   * @namespace BDD
   * @api public
   */

  Assertion.addMethod('members', function (subset, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');

    new Assertion(obj).to.be.an('array');
    new Assertion(subset).to.be.an('array');

    var cmp = flag(this, 'deep') ? _.eql : undefined;

    if (flag(this, 'contains')) {
      return this.assert(
          isSubsetOf(subset, obj, cmp)
        , 'expected #{this} to be a superset of #{act}'
        , 'expected #{this} to not be a superset of #{act}'
        , obj
        , subset
      );
    }

    this.assert(
        isSubsetOf(obj, subset, cmp) && isSubsetOf(subset, obj, cmp)
        , 'expected #{this} to have the same members as #{act}'
        , 'expected #{this} to not have the same members as #{act}'
        , obj
        , subset
    );
  });

  /**
   * ### .oneOf(list)
   *
   * Assert that a value appears somewhere in the top level of array `list`.
   *
   *     expect('a').to.be.oneOf(['a', 'b', 'c']);
   *     expect(9).to.not.be.oneOf(['z']);
   *     expect([3]).to.not.be.oneOf([1, 2, [3]]);
   *
   *     var three = [3];
   *     // for object-types, contents are not compared
   *     expect(three).to.not.be.oneOf([1, 2, [3]]);
   *     // comparing references works
   *     expect(three).to.be.oneOf([1, 2, three]);
   *
   * @name oneOf
   * @param {Array<*>} list
   * @param {String} message _optional_
   * @namespace BDD
   * @api public
   */

  function oneOf (list, msg) {
    if (msg) flag(this, 'message', msg);
    var expected = flag(this, 'object');
    new Assertion(list).to.be.an('array');

    this.assert(
        list.indexOf(expected) > -1
      , 'expected #{this} to be one of #{exp}'
      , 'expected #{this} to not be one of #{exp}'
      , list
      , expected
    );
  }

  Assertion.addMethod('oneOf', oneOf);


  /**
   * ### .change(function)
   *
   * Asserts that a function changes an object property
   *
   *     var obj = { val: 10 };
   *     var fn = function() { obj.val += 3 };
   *     var noChangeFn = function() { return 'foo' + 'bar'; }
   *     expect(fn).to.change(obj, 'val');
   *     expect(noChangeFn).to.not.change(obj, 'val')
   *
   * @name change
   * @alias changes
   * @alias Change
   * @param {String} object
   * @param {String} property name
   * @param {String} message _optional_
   * @namespace BDD
   * @api public
   */

  function assertChanges (object, prop, msg) {
    if (msg) flag(this, 'message', msg);
    var fn = flag(this, 'object');
    new Assertion(object, msg).to.have.property(prop);
    new Assertion(fn).is.a('function');

    var initial = object[prop];
    fn();

    this.assert(
      initial !== object[prop]
      , 'expected .' + prop + ' to change'
      , 'expected .' + prop + ' to not change'
    );
  }

  Assertion.addChainableMethod('change', assertChanges);
  Assertion.addChainableMethod('changes', assertChanges);

  /**
   * ### .increase(function)
   *
   * Asserts that a function increases an object property
   *
   *     var obj = { val: 10 };
   *     var fn = function() { obj.val = 15 };
   *     expect(fn).to.increase(obj, 'val');
   *
   * @name increase
   * @alias increases
   * @alias Increase
   * @param {String} object
   * @param {String} property name
   * @param {String} message _optional_
   * @namespace BDD
   * @api public
   */

  function assertIncreases (object, prop, msg) {
    if (msg) flag(this, 'message', msg);
    var fn = flag(this, 'object');
    new Assertion(object, msg).to.have.property(prop);
    new Assertion(fn).is.a('function');

    var initial = object[prop];
    fn();

    this.assert(
      object[prop] - initial > 0
      , 'expected .' + prop + ' to increase'
      , 'expected .' + prop + ' to not increase'
    );
  }

  Assertion.addChainableMethod('increase', assertIncreases);
  Assertion.addChainableMethod('increases', assertIncreases);

  /**
   * ### .decrease(function)
   *
   * Asserts that a function decreases an object property
   *
   *     var obj = { val: 10 };
   *     var fn = function() { obj.val = 5 };
   *     expect(fn).to.decrease(obj, 'val');
   *
   * @name decrease
   * @alias decreases
   * @alias Decrease
   * @param {String} object
   * @param {String} property name
   * @param {String} message _optional_
   * @namespace BDD
   * @api public
   */

  function assertDecreases (object, prop, msg) {
    if (msg) flag(this, 'message', msg);
    var fn = flag(this, 'object');
    new Assertion(object, msg).to.have.property(prop);
    new Assertion(fn).is.a('function');

    var initial = object[prop];
    fn();

    this.assert(
      object[prop] - initial < 0
      , 'expected .' + prop + ' to decrease'
      , 'expected .' + prop + ' to not decrease'
    );
  }

  Assertion.addChainableMethod('decrease', assertDecreases);
  Assertion.addChainableMethod('decreases', assertDecreases);

  /**
   * ### .extensible
   *
   * Asserts that the target is extensible (can have new properties added to
   * it).
   *
   *     var nonExtensibleObject = Object.preventExtensions({});
   *     var sealedObject = Object.seal({});
   *     var frozenObject = Object.freeze({});
   *
   *     expect({}).to.be.extensible;
   *     expect(nonExtensibleObject).to.not.be.extensible;
   *     expect(sealedObject).to.not.be.extensible;
   *     expect(frozenObject).to.not.be.extensible;
   *
   * @name extensible
   * @namespace BDD
   * @api public
   */

  Assertion.addProperty('extensible', function() {
    var obj = flag(this, 'object');

    // In ES5, if the argument to this method is not an object (a primitive), then it will cause a TypeError.
    // In ES6, a non-object argument will be treated as if it was a non-extensible ordinary object, simply return false.
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/isExtensible
    // The following provides ES6 behavior when a TypeError is thrown under ES5.

    var isExtensible;

    try {
      isExtensible = Object.isExtensible(obj);
    } catch (err) {
      if (err instanceof TypeError) isExtensible = false;
      else throw err;
    }

    this.assert(
      isExtensible
      , 'expected #{this} to be extensible'
      , 'expected #{this} to not be extensible'
    );
  });

  /**
   * ### .sealed
   *
   * Asserts that the target is sealed (cannot have new properties added to it
   * and its existing properties cannot be removed).
   *
   *     var sealedObject = Object.seal({});
   *     var frozenObject = Object.freeze({});
   *
   *     expect(sealedObject).to.be.sealed;
   *     expect(frozenObject).to.be.sealed;
   *     expect({}).to.not.be.sealed;
   *
   * @name sealed
   * @namespace BDD
   * @api public
   */

  Assertion.addProperty('sealed', function() {
    var obj = flag(this, 'object');

    // In ES5, if the argument to this method is not an object (a primitive), then it will cause a TypeError.
    // In ES6, a non-object argument will be treated as if it was a sealed ordinary object, simply return true.
    // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/isSealed
    // The following provides ES6 behavior when a TypeError is thrown under ES5.

    var isSealed;

    try {
      isSealed = Object.isSealed(obj);
    } catch (err) {
      if (err instanceof TypeError) isSealed = true;
      else throw err;
    }

    this.assert(
      isSealed
      , 'expected #{this} to be sealed'
      , 'expected #{this} to not be sealed'
    );
  });

  /**
   * ### .frozen
   *
   * Asserts that the target is frozen (cannot have new properties added to it
   * and its existing properties cannot be modified).
   *
   *     var frozenObject = Object.freeze({});
   *
   *     expect(frozenObject).to.be.frozen;
   *     expect({}).to.not.be.frozen;
   *
   * @name frozen
   * @namespace BDD
   * @api public
   */

  Assertion.addProperty('frozen', function() {
    var obj = flag(this, 'object');

    // In ES5, if the argument to this method is not an object (a primitive), then it will cause a TypeError.
    // In ES6, a non-object argument will be treated as if it was a frozen ordinary object, simply return true.
    // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/isFrozen
    // The following provides ES6 behavior when a TypeError is thrown under ES5.

    var isFrozen;

    try {
      isFrozen = Object.isFrozen(obj);
    } catch (err) {
      if (err instanceof TypeError) isFrozen = true;
      else throw err;
    }

    this.assert(
      isFrozen
      , 'expected #{this} to be frozen'
      , 'expected #{this} to not be frozen'
    );
  });
};

},{}],9:[function(require,module,exports){
/*!
 * chai
 * Copyright(c) 2011-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */


module.exports = function (chai, util) {

  /*!
   * Chai dependencies.
   */

  var Assertion = chai.Assertion
    , flag = util.flag;

  /*!
   * Module export.
   */

  /**
   * ### assert(expression, message)
   *
   * Write your own test expressions.
   *
   *     assert('foo' !== 'bar', 'foo is not bar');
   *     assert(Array.isArray([]), 'empty arrays are arrays');
   *
   * @param {Mixed} expression to test for truthiness
   * @param {String} message to display on error
   * @name assert
   * @namespace Assert
   * @api public
   */

  var assert = chai.assert = function (express, errmsg) {
    var test = new Assertion(null, null, chai.assert);
    test.assert(
        express
      , errmsg
      , '[ negation message unavailable ]'
    );
  };

  /**
   * ### .fail(actual, expected, [message], [operator])
   *
   * Throw a failure. Node.js `assert` module-compatible.
   *
   * @name fail
   * @param {Mixed} actual
   * @param {Mixed} expected
   * @param {String} message
   * @param {String} operator
   * @namespace Assert
   * @api public
   */

  assert.fail = function (actual, expected, message, operator) {
    message = message || 'assert.fail()';
    throw new chai.AssertionError(message, {
        actual: actual
      , expected: expected
      , operator: operator
    }, assert.fail);
  };

  /**
   * ### .isOk(object, [message])
   *
   * Asserts that `object` is truthy.
   *
   *     assert.isOk('everything', 'everything is ok');
   *     assert.isOk(false, 'this will fail');
   *
   * @name isOk
   * @alias ok
   * @param {Mixed} object to test
   * @param {String} message
   * @namespace Assert
   * @api public
   */

  assert.isOk = function (val, msg) {
    new Assertion(val, msg).is.ok;
  };

  /**
   * ### .isNotOk(object, [message])
   *
   * Asserts that `object` is falsy.
   *
   *     assert.isNotOk('everything', 'this will fail');
   *     assert.isNotOk(false, 'this will pass');
   *
   * @name isNotOk
   * @alias notOk
   * @param {Mixed} object to test
   * @param {String} message
   * @namespace Assert
   * @api public
   */

  assert.isNotOk = function (val, msg) {
    new Assertion(val, msg).is.not.ok;
  };

  /**
   * ### .equal(actual, expected, [message])
   *
   * Asserts non-strict equality (`==`) of `actual` and `expected`.
   *
   *     assert.equal(3, '3', '== coerces values to strings');
   *
   * @name equal
   * @param {Mixed} actual
   * @param {Mixed} expected
   * @param {String} message
   * @namespace Assert
   * @api public
   */

  assert.equal = function (act, exp, msg) {
    var test = new Assertion(act, msg, assert.equal);

    test.assert(
        exp == flag(test, 'object')
      , 'expected #{this} to equal #{exp}'
      , 'expected #{this} to not equal #{act}'
      , exp
      , act
    );
  };

  /**
   * ### .notEqual(actual, expected, [message])
   *
   * Asserts non-strict inequality (`!=`) of `actual` and `expected`.
   *
   *     assert.notEqual(3, 4, 'these numbers are not equal');
   *
   * @name notEqual
   * @param {Mixed} actual
   * @param {Mixed} expected
   * @param {String} message
   * @namespace Assert
   * @api public
   */

  assert.notEqual = function (act, exp, msg) {
    var test = new Assertion(act, msg, assert.notEqual);

    test.assert(
        exp != flag(test, 'object')
      , 'expected #{this} to not equal #{exp}'
      , 'expected #{this} to equal #{act}'
      , exp
      , act
    );
  };

  /**
   * ### .strictEqual(actual, expected, [message])
   *
   * Asserts strict equality (`===`) of `actual` and `expected`.
   *
   *     assert.strictEqual(true, true, 'these booleans are strictly equal');
   *
   * @name strictEqual
   * @param {Mixed} actual
   * @param {Mixed} expected
   * @param {String} message
   * @namespace Assert
   * @api public
   */

  assert.strictEqual = function (act, exp, msg) {
    new Assertion(act, msg).to.equal(exp);
  };

  /**
   * ### .notStrictEqual(actual, expected, [message])
   *
   * Asserts strict inequality (`!==`) of `actual` and `expected`.
   *
   *     assert.notStrictEqual(3, '3', 'no coercion for strict equality');
   *
   * @name notStrictEqual
   * @param {Mixed} actual
   * @param {Mixed} expected
   * @param {String} message
   * @namespace Assert
   * @api public
   */

  assert.notStrictEqual = function (act, exp, msg) {
    new Assertion(act, msg).to.not.equal(exp);
  };

  /**
   * ### .deepEqual(actual, expected, [message])
   *
   * Asserts that `actual` is deeply equal to `expected`.
   *
   *     assert.deepEqual({ tea: 'green' }, { tea: 'green' });
   *
   * @name deepEqual
   * @param {Mixed} actual
   * @param {Mixed} expected
   * @param {String} message
   * @namespace Assert
   * @api public
   */

  assert.deepEqual = function (act, exp, msg) {
    new Assertion(act, msg).to.eql(exp);
  };

  /**
   * ### .notDeepEqual(actual, expected, [message])
   *
   * Assert that `actual` is not deeply equal to `expected`.
   *
   *     assert.notDeepEqual({ tea: 'green' }, { tea: 'jasmine' });
   *
   * @name notDeepEqual
   * @param {Mixed} actual
   * @param {Mixed} expected
   * @param {String} message
   * @namespace Assert
   * @api public
   */

  assert.notDeepEqual = function (act, exp, msg) {
    new Assertion(act, msg).to.not.eql(exp);
  };

   /**
   * ### .isAbove(valueToCheck, valueToBeAbove, [message])
   *
   * Asserts `valueToCheck` is strictly greater than (>) `valueToBeAbove`
   *
   *     assert.isAbove(5, 2, '5 is strictly greater than 2');
   *
   * @name isAbove
   * @param {Mixed} valueToCheck
   * @param {Mixed} valueToBeAbove
   * @param {String} message
   * @namespace Assert
   * @api public
   */

  assert.isAbove = function (val, abv, msg) {
    new Assertion(val, msg).to.be.above(abv);
  };

   /**
   * ### .isAtLeast(valueToCheck, valueToBeAtLeast, [message])
   *
   * Asserts `valueToCheck` is greater than or equal to (>=) `valueToBeAtLeast`
   *
   *     assert.isAtLeast(5, 2, '5 is greater or equal to 2');
   *     assert.isAtLeast(3, 3, '3 is greater or equal to 3');
   *
   * @name isAtLeast
   * @param {Mixed} valueToCheck
   * @param {Mixed} valueToBeAtLeast
   * @param {String} message
   * @namespace Assert
   * @api public
   */

  assert.isAtLeast = function (val, atlst, msg) {
    new Assertion(val, msg).to.be.least(atlst);
  };

   /**
   * ### .isBelow(valueToCheck, valueToBeBelow, [message])
   *
   * Asserts `valueToCheck` is strictly less than (<) `valueToBeBelow`
   *
   *     assert.isBelow(3, 6, '3 is strictly less than 6');
   *
   * @name isBelow
   * @param {Mixed} valueToCheck
   * @param {Mixed} valueToBeBelow
   * @param {String} message
   * @namespace Assert
   * @api public
   */

  assert.isBelow = function (val, blw, msg) {
    new Assertion(val, msg).to.be.below(blw);
  };

   /**
   * ### .isAtMost(valueToCheck, valueToBeAtMost, [message])
   *
   * Asserts `valueToCheck` is less than or equal to (<=) `valueToBeAtMost`
   *
   *     assert.isAtMost(3, 6, '3 is less than or equal to 6');
   *     assert.isAtMost(4, 4, '4 is less than or equal to 4');
   *
   * @name isAtMost
   * @param {Mixed} valueToCheck
   * @param {Mixed} valueToBeAtMost
   * @param {String} message
   * @namespace Assert
   * @api public
   */

  assert.isAtMost = function (val, atmst, msg) {
    new Assertion(val, msg).to.be.most(atmst);
  };

  /**
   * ### .isTrue(value, [message])
   *
   * Asserts that `value` is true.
   *
   *     var teaServed = true;
   *     assert.isTrue(teaServed, 'the tea has been served');
   *
   * @name isTrue
   * @param {Mixed} value
   * @param {String} message
   * @namespace Assert
   * @api public
   */

  assert.isTrue = function (val, msg) {
    new Assertion(val, msg).is['true'];
  };

  /**
   * ### .isNotTrue(value, [message])
   *
   * Asserts that `value` is not true.
   *
   *     var tea = 'tasty chai';
   *     assert.isNotTrue(tea, 'great, time for tea!');
   *
   * @name isNotTrue
   * @param {Mixed} value
   * @param {String} message
   * @namespace Assert
   * @api public
   */

  assert.isNotTrue = function (val, msg) {
    new Assertion(val, msg).to.not.equal(true);
  };

  /**
   * ### .isFalse(value, [message])
   *
   * Asserts that `value` is false.
   *
   *     var teaServed = false;
   *     assert.isFalse(teaServed, 'no tea yet? hmm...');
   *
   * @name isFalse
   * @param {Mixed} value
   * @param {String} message
   * @namespace Assert
   * @api public
   */

  assert.isFalse = function (val, msg) {
    new Assertion(val, msg).is['false'];
  };

  /**
   * ### .isNotFalse(value, [message])
   *
   * Asserts that `value` is not false.
   *
   *     var tea = 'tasty chai';
   *     assert.isNotFalse(tea, 'great, time for tea!');
   *
   * @name isNotFalse
   * @param {Mixed} value
   * @param {String} message
   * @namespace Assert
   * @api public
   */

  assert.isNotFalse = function (val, msg) {
    new Assertion(val, msg).to.not.equal(false);
  };

  /**
   * ### .isNull(value, [message])
   *
   * Asserts that `value` is null.
   *
   *     assert.isNull(err, 'there was no error');
   *
   * @name isNull
   * @param {Mixed} value
   * @param {String} message
   * @namespace Assert
   * @api public
   */

  assert.isNull = function (val, msg) {
    new Assertion(val, msg).to.equal(null);
  };

  /**
   * ### .isNotNull(value, [message])
   *
   * Asserts that `value` is not null.
   *
   *     var tea = 'tasty chai';
   *     assert.isNotNull(tea, 'great, time for tea!');
   *
   * @name isNotNull
   * @param {Mixed} value
   * @param {String} message
   * @namespace Assert
   * @api public
   */

  assert.isNotNull = function (val, msg) {
    new Assertion(val, msg).to.not.equal(null);
  };

  /**
   * ### .isNaN
   * Asserts that value is NaN
   *
   *    assert.isNaN('foo', 'foo is NaN');
   *
   * @name isNaN
   * @param {Mixed} value
   * @param {String} message
   * @namespace Assert
   * @api public
   */

  assert.isNaN = function (val, msg) {
    new Assertion(val, msg).to.be.NaN;
  };

  /**
   * ### .isNotNaN
   * Asserts that value is not NaN
   *
   *    assert.isNotNaN(4, '4 is not NaN');
   *
   * @name isNotNaN
   * @param {Mixed} value
   * @param {String} message
   * @namespace Assert
   * @api public
   */
  assert.isNotNaN = function (val, msg) {
    new Assertion(val, msg).not.to.be.NaN;
  };

  /**
   * ### .isUndefined(value, [message])
   *
   * Asserts that `value` is `undefined`.
   *
   *     var tea;
   *     assert.isUndefined(tea, 'no tea defined');
   *
   * @name isUndefined
   * @param {Mixed} value
   * @param {String} message
   * @namespace Assert
   * @api public
   */

  assert.isUndefined = function (val, msg) {
    new Assertion(val, msg).to.equal(undefined);
  };

  /**
   * ### .isDefined(value, [message])
   *
   * Asserts that `value` is not `undefined`.
   *
   *     var tea = 'cup of chai';
   *     assert.isDefined(tea, 'tea has been defined');
   *
   * @name isDefined
   * @param {Mixed} value
   * @param {String} message
   * @namespace Assert
   * @api public
   */

  assert.isDefined = function (val, msg) {
    new Assertion(val, msg).to.not.equal(undefined);
  };

  /**
   * ### .isFunction(value, [message])
   *
   * Asserts that `value` is a function.
   *
   *     function serveTea() { return 'cup of tea'; };
   *     assert.isFunction(serveTea, 'great, we can have tea now');
   *
   * @name isFunction
   * @param {Mixed} value
   * @param {String} message
   * @namespace Assert
   * @api public
   */

  assert.isFunction = function (val, msg) {
    new Assertion(val, msg).to.be.a('function');
  };

  /**
   * ### .isNotFunction(value, [message])
   *
   * Asserts that `value` is _not_ a function.
   *
   *     var serveTea = [ 'heat', 'pour', 'sip' ];
   *     assert.isNotFunction(serveTea, 'great, we have listed the steps');
   *
   * @name isNotFunction
   * @param {Mixed} value
   * @param {String} message
   * @namespace Assert
   * @api public
   */

  assert.isNotFunction = function (val, msg) {
    new Assertion(val, msg).to.not.be.a('function');
  };

  /**
   * ### .isObject(value, [message])
   *
   * Asserts that `value` is an object of type 'Object' (as revealed by `Object.prototype.toString`).
   * _The assertion does not match subclassed objects._
   *
   *     var selection = { name: 'Chai', serve: 'with spices' };
   *     assert.isObject(selection, 'tea selection is an object');
   *
   * @name isObject
   * @param {Mixed} value
   * @param {String} message
   * @namespace Assert
   * @api public
   */

  assert.isObject = function (val, msg) {
    new Assertion(val, msg).to.be.a('object');
  };

  /**
   * ### .isNotObject(value, [message])
   *
   * Asserts that `value` is _not_ an object of type 'Object' (as revealed by `Object.prototype.toString`).
   *
   *     var selection = 'chai'
   *     assert.isNotObject(selection, 'tea selection is not an object');
   *     assert.isNotObject(null, 'null is not an object');
   *
   * @name isNotObject
   * @param {Mixed} value
   * @param {String} message
   * @namespace Assert
   * @api public
   */

  assert.isNotObject = function (val, msg) {
    new Assertion(val, msg).to.not.be.a('object');
  };

  /**
   * ### .isArray(value, [message])
   *
   * Asserts that `value` is an array.
   *
   *     var menu = [ 'green', 'chai', 'oolong' ];
   *     assert.isArray(menu, 'what kind of tea do we want?');
   *
   * @name isArray
   * @param {Mixed} value
   * @param {String} message
   * @namespace Assert
   * @api public
   */

  assert.isArray = function (val, msg) {
    new Assertion(val, msg).to.be.an('array');
  };

  /**
   * ### .isNotArray(value, [message])
   *
   * Asserts that `value` is _not_ an array.
   *
   *     var menu = 'green|chai|oolong';
   *     assert.isNotArray(menu, 'what kind of tea do we want?');
   *
   * @name isNotArray
   * @param {Mixed} value
   * @param {String} message
   * @namespace Assert
   * @api public
   */

  assert.isNotArray = function (val, msg) {
    new Assertion(val, msg).to.not.be.an('array');
  };

  /**
   * ### .isString(value, [message])
   *
   * Asserts that `value` is a string.
   *
   *     var teaOrder = 'chai';
   *     assert.isString(teaOrder, 'order placed');
   *
   * @name isString
   * @param {Mixed} value
   * @param {String} message
   * @namespace Assert
   * @api public
   */

  assert.isString = function (val, msg) {
    new Assertion(val, msg).to.be.a('string');
  };

  /**
   * ### .isNotString(value, [message])
   *
   * Asserts that `value` is _not_ a string.
   *
   *     var teaOrder = 4;
   *     assert.isNotString(teaOrder, 'order placed');
   *
   * @name isNotString
   * @param {Mixed} value
   * @param {String} message
   * @namespace Assert
   * @api public
   */

  assert.isNotString = function (val, msg) {
    new Assertion(val, msg).to.not.be.a('string');
  };

  /**
   * ### .isNumber(value, [message])
   *
   * Asserts that `value` is a number.
   *
   *     var cups = 2;
   *     assert.isNumber(cups, 'how many cups');
   *
   * @name isNumber
   * @param {Number} value
   * @param {String} message
   * @namespace Assert
   * @api public
   */

  assert.isNumber = function (val, msg) {
    new Assertion(val, msg).to.be.a('number');
  };

  /**
   * ### .isNotNumber(value, [message])
   *
   * Asserts that `value` is _not_ a number.
   *
   *     var cups = '2 cups please';
   *     assert.isNotNumber(cups, 'how many cups');
   *
   * @name isNotNumber
   * @param {Mixed} value
   * @param {String} message
   * @namespace Assert
   * @api public
   */

  assert.isNotNumber = function (val, msg) {
    new Assertion(val, msg).to.not.be.a('number');
  };

  /**
   * ### .isBoolean(value, [message])
   *
   * Asserts that `value` is a boolean.
   *
   *     var teaReady = true
   *       , teaServed = false;
   *
   *     assert.isBoolean(teaReady, 'is the tea ready');
   *     assert.isBoolean(teaServed, 'has tea been served');
   *
   * @name isBoolean
   * @param {Mixed} value
   * @param {String} message
   * @namespace Assert
   * @api public
   */

  assert.isBoolean = function (val, msg) {
    new Assertion(val, msg).to.be.a('boolean');
  };

  /**
   * ### .isNotBoolean(value, [message])
   *
   * Asserts that `value` is _not_ a boolean.
   *
   *     var teaReady = 'yep'
   *       , teaServed = 'nope';
   *
   *     assert.isNotBoolean(teaReady, 'is the tea ready');
   *     assert.isNotBoolean(teaServed, 'has tea been served');
   *
   * @name isNotBoolean
   * @param {Mixed} value
   * @param {String} message
   * @namespace Assert
   * @api public
   */

  assert.isNotBoolean = function (val, msg) {
    new Assertion(val, msg).to.not.be.a('boolean');
  };

  /**
   * ### .typeOf(value, name, [message])
   *
   * Asserts that `value`'s type is `name`, as determined by
   * `Object.prototype.toString`.
   *
   *     assert.typeOf({ tea: 'chai' }, 'object', 'we have an object');
   *     assert.typeOf(['chai', 'jasmine'], 'array', 'we have an array');
   *     assert.typeOf('tea', 'string', 'we have a string');
   *     assert.typeOf(/tea/, 'regexp', 'we have a regular expression');
   *     assert.typeOf(null, 'null', 'we have a null');
   *     assert.typeOf(undefined, 'undefined', 'we have an undefined');
   *
   * @name typeOf
   * @param {Mixed} value
   * @param {String} name
   * @param {String} message
   * @namespace Assert
   * @api public
   */

  assert.typeOf = function (val, type, msg) {
    new Assertion(val, msg).to.be.a(type);
  };

  /**
   * ### .notTypeOf(value, name, [message])
   *
   * Asserts that `value`'s type is _not_ `name`, as determined by
   * `Object.prototype.toString`.
   *
   *     assert.notTypeOf('tea', 'number', 'strings are not numbers');
   *
   * @name notTypeOf
   * @param {Mixed} value
   * @param {String} typeof name
   * @param {String} message
   * @namespace Assert
   * @api public
   */

  assert.notTypeOf = function (val, type, msg) {
    new Assertion(val, msg).to.not.be.a(type);
  };

  /**
   * ### .instanceOf(object, constructor, [message])
   *
   * Asserts that `value` is an instance of `constructor`.
   *
   *     var Tea = function (name) { this.name = name; }
   *       , chai = new Tea('chai');
   *
   *     assert.instanceOf(chai, Tea, 'chai is an instance of tea');
   *
   * @name instanceOf
   * @param {Object} object
   * @param {Constructor} constructor
   * @param {String} message
   * @namespace Assert
   * @api public
   */

  assert.instanceOf = function (val, type, msg) {
    new Assertion(val, msg).to.be.instanceOf(type);
  };

  /**
   * ### .notInstanceOf(object, constructor, [message])
   *
   * Asserts `value` is not an instance of `constructor`.
   *
   *     var Tea = function (name) { this.name = name; }
   *       , chai = new String('chai');
   *
   *     assert.notInstanceOf(chai, Tea, 'chai is not an instance of tea');
   *
   * @name notInstanceOf
   * @param {Object} object
   * @param {Constructor} constructor
   * @param {String} message
   * @namespace Assert
   * @api public
   */

  assert.notInstanceOf = function (val, type, msg) {
    new Assertion(val, msg).to.not.be.instanceOf(type);
  };

  /**
   * ### .include(haystack, needle, [message])
   *
   * Asserts that `haystack` includes `needle`. Works
   * for strings and arrays.
   *
   *     assert.include('foobar', 'bar', 'foobar contains string "bar"');
   *     assert.include([ 1, 2, 3 ], 3, 'array contains value');
   *
   * @name include
   * @param {Array|String} haystack
   * @param {Mixed} needle
   * @param {String} message
   * @namespace Assert
   * @api public
   */

  assert.include = function (exp, inc, msg) {
    new Assertion(exp, msg, assert.include).include(inc);
  };

  /**
   * ### .notInclude(haystack, needle, [message])
   *
   * Asserts that `haystack` does not include `needle`. Works
   * for strings and arrays.
   *
   *     assert.notInclude('foobar', 'baz', 'string not include substring');
   *     assert.notInclude([ 1, 2, 3 ], 4, 'array not include contain value');
   *
   * @name notInclude
   * @param {Array|String} haystack
   * @param {Mixed} needle
   * @param {String} message
   * @namespace Assert
   * @api public
   */

  assert.notInclude = function (exp, inc, msg) {
    new Assertion(exp, msg, assert.notInclude).not.include(inc);
  };

  /**
   * ### .match(value, regexp, [message])
   *
   * Asserts that `value` matches the regular expression `regexp`.
   *
   *     assert.match('foobar', /^foo/, 'regexp matches');
   *
   * @name match
   * @param {Mixed} value
   * @param {RegExp} regexp
   * @param {String} message
   * @namespace Assert
   * @api public
   */

  assert.match = function (exp, re, msg) {
    new Assertion(exp, msg).to.match(re);
  };

  /**
   * ### .notMatch(value, regexp, [message])
   *
   * Asserts that `value` does not match the regular expression `regexp`.
   *
   *     assert.notMatch('foobar', /^foo/, 'regexp does not match');
   *
   * @name notMatch
   * @param {Mixed} value
   * @param {RegExp} regexp
   * @param {String} message
   * @namespace Assert
   * @api public
   */

  assert.notMatch = function (exp, re, msg) {
    new Assertion(exp, msg).to.not.match(re);
  };

  /**
   * ### .property(object, property, [message])
   *
   * Asserts that `object` has a property named by `property`.
   *
   *     assert.property({ tea: { green: 'matcha' }}, 'tea');
   *
   * @name property
   * @param {Object} object
   * @param {String} property
   * @param {String} message
   * @namespace Assert
   * @api public
   */

  assert.property = function (obj, prop, msg) {
    new Assertion(obj, msg).to.have.property(prop);
  };

  /**
   * ### .notProperty(object, property, [message])
   *
   * Asserts that `object` does _not_ have a property named by `property`.
   *
   *     assert.notProperty({ tea: { green: 'matcha' }}, 'coffee');
   *
   * @name notProperty
   * @param {Object} object
   * @param {String} property
   * @param {String} message
   * @namespace Assert
   * @api public
   */

  assert.notProperty = function (obj, prop, msg) {
    new Assertion(obj, msg).to.not.have.property(prop);
  };

  /**
   * ### .deepProperty(object, property, [message])
   *
   * Asserts that `object` has a property named by `property`, which can be a
   * string using dot- and bracket-notation for deep reference.
   *
   *     assert.deepProperty({ tea: { green: 'matcha' }}, 'tea.green');
   *
   * @name deepProperty
   * @param {Object} object
   * @param {String} property
   * @param {String} message
   * @namespace Assert
   * @api public
   */

  assert.deepProperty = function (obj, prop, msg) {
    new Assertion(obj, msg).to.have.deep.property(prop);
  };

  /**
   * ### .notDeepProperty(object, property, [message])
   *
   * Asserts that `object` does _not_ have a property named by `property`, which
   * can be a string using dot- and bracket-notation for deep reference.
   *
   *     assert.notDeepProperty({ tea: { green: 'matcha' }}, 'tea.oolong');
   *
   * @name notDeepProperty
   * @param {Object} object
   * @param {String} property
   * @param {String} message
   * @namespace Assert
   * @api public
   */

  assert.notDeepProperty = function (obj, prop, msg) {
    new Assertion(obj, msg).to.not.have.deep.property(prop);
  };

  /**
   * ### .propertyVal(object, property, value, [message])
   *
   * Asserts that `object` has a property named by `property` with value given
   * by `value`.
   *
   *     assert.propertyVal({ tea: 'is good' }, 'tea', 'is good');
   *
   * @name propertyVal
   * @param {Object} object
   * @param {String} property
   * @param {Mixed} value
   * @param {String} message
   * @namespace Assert
   * @api public
   */

  assert.propertyVal = function (obj, prop, val, msg) {
    new Assertion(obj, msg).to.have.property(prop, val);
  };

  /**
   * ### .propertyNotVal(object, property, value, [message])
   *
   * Asserts that `object` has a property named by `property`, but with a value
   * different from that given by `value`.
   *
   *     assert.propertyNotVal({ tea: 'is good' }, 'tea', 'is bad');
   *
   * @name propertyNotVal
   * @param {Object} object
   * @param {String} property
   * @param {Mixed} value
   * @param {String} message
   * @namespace Assert
   * @api public
   */

  assert.propertyNotVal = function (obj, prop, val, msg) {
    new Assertion(obj, msg).to.not.have.property(prop, val);
  };

  /**
   * ### .deepPropertyVal(object, property, value, [message])
   *
   * Asserts that `object` has a property named by `property` with value given
   * by `value`. `property` can use dot- and bracket-notation for deep
   * reference.
   *
   *     assert.deepPropertyVal({ tea: { green: 'matcha' }}, 'tea.green', 'matcha');
   *
   * @name deepPropertyVal
   * @param {Object} object
   * @param {String} property
   * @param {Mixed} value
   * @param {String} message
   * @namespace Assert
   * @api public
   */

  assert.deepPropertyVal = function (obj, prop, val, msg) {
    new Assertion(obj, msg).to.have.deep.property(prop, val);
  };

  /**
   * ### .deepPropertyNotVal(object, property, value, [message])
   *
   * Asserts that `object` has a property named by `property`, but with a value
   * different from that given by `value`. `property` can use dot- and
   * bracket-notation for deep reference.
   *
   *     assert.deepPropertyNotVal({ tea: { green: 'matcha' }}, 'tea.green', 'konacha');
   *
   * @name deepPropertyNotVal
   * @param {Object} object
   * @param {String} property
   * @param {Mixed} value
   * @param {String} message
   * @namespace Assert
   * @api public
   */

  assert.deepPropertyNotVal = function (obj, prop, val, msg) {
    new Assertion(obj, msg).to.not.have.deep.property(prop, val);
  };

  /**
   * ### .lengthOf(object, length, [message])
   *
   * Asserts that `object` has a `length` property with the expected value.
   *
   *     assert.lengthOf([1,2,3], 3, 'array has length of 3');
   *     assert.lengthOf('foobar', 6, 'string has length of 6');
   *
   * @name lengthOf
   * @param {Mixed} object
   * @param {Number} length
   * @param {String} message
   * @namespace Assert
   * @api public
   */

  assert.lengthOf = function (exp, len, msg) {
    new Assertion(exp, msg).to.have.length(len);
  };

  /**
   * ### .throws(function, [constructor/string/regexp], [string/regexp], [message])
   *
   * Asserts that `function` will throw an error that is an instance of
   * `constructor`, or alternately that it will throw an error with message
   * matching `regexp`.
   *
   *     assert.throws(fn, 'function throws a reference error');
   *     assert.throws(fn, /function throws a reference error/);
   *     assert.throws(fn, ReferenceError);
   *     assert.throws(fn, ReferenceError, 'function throws a reference error');
   *     assert.throws(fn, ReferenceError, /function throws a reference error/);
   *
   * @name throws
   * @alias throw
   * @alias Throw
   * @param {Function} function
   * @param {ErrorConstructor} constructor
   * @param {RegExp} regexp
   * @param {String} message
   * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Error#Error_types
   * @namespace Assert
   * @api public
   */

  assert.throws = function (fn, errt, errs, msg) {
    if ('string' === typeof errt || errt instanceof RegExp) {
      errs = errt;
      errt = null;
    }

    var assertErr = new Assertion(fn, msg).to.throw(errt, errs);
    return flag(assertErr, 'object');
  };

  /**
   * ### .doesNotThrow(function, [constructor/regexp], [message])
   *
   * Asserts that `function` will _not_ throw an error that is an instance of
   * `constructor`, or alternately that it will not throw an error with message
   * matching `regexp`.
   *
   *     assert.doesNotThrow(fn, Error, 'function does not throw');
   *
   * @name doesNotThrow
   * @param {Function} function
   * @param {ErrorConstructor} constructor
   * @param {RegExp} regexp
   * @param {String} message
   * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Error#Error_types
   * @namespace Assert
   * @api public
   */

  assert.doesNotThrow = function (fn, type, msg) {
    if ('string' === typeof type) {
      msg = type;
      type = null;
    }

    new Assertion(fn, msg).to.not.Throw(type);
  };

  /**
   * ### .operator(val1, operator, val2, [message])
   *
   * Compares two values using `operator`.
   *
   *     assert.operator(1, '<', 2, 'everything is ok');
   *     assert.operator(1, '>', 2, 'this will fail');
   *
   * @name operator
   * @param {Mixed} val1
   * @param {String} operator
   * @param {Mixed} val2
   * @param {String} message
   * @namespace Assert
   * @api public
   */

  assert.operator = function (val, operator, val2, msg) {
    var ok;
    switch(operator) {
      case '==':
        ok = val == val2;
        break;
      case '===':
        ok = val === val2;
        break;
      case '>':
        ok = val > val2;
        break;
      case '>=':
        ok = val >= val2;
        break;
      case '<':
        ok = val < val2;
        break;
      case '<=':
        ok = val <= val2;
        break;
      case '!=':
        ok = val != val2;
        break;
      case '!==':
        ok = val !== val2;
        break;
      default:
        throw new Error('Invalid operator "' + operator + '"');
    }
    var test = new Assertion(ok, msg);
    test.assert(
        true === flag(test, 'object')
      , 'expected ' + util.inspect(val) + ' to be ' + operator + ' ' + util.inspect(val2)
      , 'expected ' + util.inspect(val) + ' to not be ' + operator + ' ' + util.inspect(val2) );
  };

  /**
   * ### .closeTo(actual, expected, delta, [message])
   *
   * Asserts that the target is equal `expected`, to within a +/- `delta` range.
   *
   *     assert.closeTo(1.5, 1, 0.5, 'numbers are close');
   *
   * @name closeTo
   * @param {Number} actual
   * @param {Number} expected
   * @param {Number} delta
   * @param {String} message
   * @namespace Assert
   * @api public
   */

  assert.closeTo = function (act, exp, delta, msg) {
    new Assertion(act, msg).to.be.closeTo(exp, delta);
  };

  /**
   * ### .approximately(actual, expected, delta, [message])
   *
   * Asserts that the target is equal `expected`, to within a +/- `delta` range.
   *
   *     assert.approximately(1.5, 1, 0.5, 'numbers are close');
   *
   * @name approximately
   * @param {Number} actual
   * @param {Number} expected
   * @param {Number} delta
   * @param {String} message
   * @namespace Assert
   * @api public
   */

  assert.approximately = function (act, exp, delta, msg) {
    new Assertion(act, msg).to.be.approximately(exp, delta);
  };

  /**
   * ### .sameMembers(set1, set2, [message])
   *
   * Asserts that `set1` and `set2` have the same members.
   * Order is not taken into account.
   *
   *     assert.sameMembers([ 1, 2, 3 ], [ 2, 1, 3 ], 'same members');
   *
   * @name sameMembers
   * @param {Array} set1
   * @param {Array} set2
   * @param {String} message
   * @namespace Assert
   * @api public
   */

  assert.sameMembers = function (set1, set2, msg) {
    new Assertion(set1, msg).to.have.same.members(set2);
  }

  /**
   * ### .sameDeepMembers(set1, set2, [message])
   *
   * Asserts that `set1` and `set2` have the same members - using a deep equality checking.
   * Order is not taken into account.
   *
   *     assert.sameDeepMembers([ {b: 3}, {a: 2}, {c: 5} ], [ {c: 5}, {b: 3}, {a: 2} ], 'same deep members');
   *
   * @name sameDeepMembers
   * @param {Array} set1
   * @param {Array} set2
   * @param {String} message
   * @namespace Assert
   * @api public
   */

  assert.sameDeepMembers = function (set1, set2, msg) {
    new Assertion(set1, msg).to.have.same.deep.members(set2);
  }

  /**
   * ### .includeMembers(superset, subset, [message])
   *
   * Asserts that `subset` is included in `superset`.
   * Order is not taken into account.
   *
   *     assert.includeMembers([ 1, 2, 3 ], [ 2, 1 ], 'include members');
   *
   * @name includeMembers
   * @param {Array} superset
   * @param {Array} subset
   * @param {String} message
   * @namespace Assert
   * @api public
   */

  assert.includeMembers = function (superset, subset, msg) {
    new Assertion(superset, msg).to.include.members(subset);
  }

  /**
   * ### .includeDeepMembers(superset, subset, [message])
   *
   * Asserts that `subset` is included in `superset` - using deep equality checking.
   * Order is not taken into account.
   * Duplicates are ignored.
   *
   *     assert.includeDeepMembers([ {a: 1}, {b: 2}, {c: 3} ], [ {b: 2}, {a: 1}, {b: 2} ], 'include deep members');
   *
   * @name includeDeepMembers
   * @param {Array} superset
   * @param {Array} subset
   * @param {String} message
   * @namespace Assert
   * @api public
   */

  assert.includeDeepMembers = function (superset, subset, msg) {
    new Assertion(superset, msg).to.include.deep.members(subset);
  }

  /**
   * ### .oneOf(inList, list, [message])
   *
   * Asserts that non-object, non-array value `inList` appears in the flat array `list`.
   *
   *     assert.oneOf(1, [ 2, 1 ], 'Not found in list');
   *
   * @name oneOf
   * @param {*} inList
   * @param {Array<*>} list
   * @param {String} message
   * @namespace Assert
   * @api public
   */

  assert.oneOf = function (inList, list, msg) {
    new Assertion(inList, msg).to.be.oneOf(list);
  }

   /**
   * ### .changes(function, object, property)
   *
   * Asserts that a function changes the value of a property
   *
   *     var obj = { val: 10 };
   *     var fn = function() { obj.val = 22 };
   *     assert.changes(fn, obj, 'val');
   *
   * @name changes
   * @param {Function} modifier function
   * @param {Object} object
   * @param {String} property name
   * @param {String} message _optional_
   * @namespace Assert
   * @api public
   */

  assert.changes = function (fn, obj, prop) {
    new Assertion(fn).to.change(obj, prop);
  }

   /**
   * ### .doesNotChange(function, object, property)
   *
   * Asserts that a function does not changes the value of a property
   *
   *     var obj = { val: 10 };
   *     var fn = function() { console.log('foo'); };
   *     assert.doesNotChange(fn, obj, 'val');
   *
   * @name doesNotChange
   * @param {Function} modifier function
   * @param {Object} object
   * @param {String} property name
   * @param {String} message _optional_
   * @namespace Assert
   * @api public
   */

  assert.doesNotChange = function (fn, obj, prop) {
    new Assertion(fn).to.not.change(obj, prop);
  }

   /**
   * ### .increases(function, object, property)
   *
   * Asserts that a function increases an object property
   *
   *     var obj = { val: 10 };
   *     var fn = function() { obj.val = 13 };
   *     assert.increases(fn, obj, 'val');
   *
   * @name increases
   * @param {Function} modifier function
   * @param {Object} object
   * @param {String} property name
   * @param {String} message _optional_
   * @namespace Assert
   * @api public
   */

  assert.increases = function (fn, obj, prop) {
    new Assertion(fn).to.increase(obj, prop);
  }

   /**
   * ### .doesNotIncrease(function, object, property)
   *
   * Asserts that a function does not increase object property
   *
   *     var obj = { val: 10 };
   *     var fn = function() { obj.val = 8 };
   *     assert.doesNotIncrease(fn, obj, 'val');
   *
   * @name doesNotIncrease
   * @param {Function} modifier function
   * @param {Object} object
   * @param {String} property name
   * @param {String} message _optional_
   * @namespace Assert
   * @api public
   */

  assert.doesNotIncrease = function (fn, obj, prop) {
    new Assertion(fn).to.not.increase(obj, prop);
  }

   /**
   * ### .decreases(function, object, property)
   *
   * Asserts that a function decreases an object property
   *
   *     var obj = { val: 10 };
   *     var fn = function() { obj.val = 5 };
   *     assert.decreases(fn, obj, 'val');
   *
   * @name decreases
   * @param {Function} modifier function
   * @param {Object} object
   * @param {String} property name
   * @param {String} message _optional_
   * @namespace Assert
   * @api public
   */

  assert.decreases = function (fn, obj, prop) {
    new Assertion(fn).to.decrease(obj, prop);
  }

   /**
   * ### .doesNotDecrease(function, object, property)
   *
   * Asserts that a function does not decreases an object property
   *
   *     var obj = { val: 10 };
   *     var fn = function() { obj.val = 15 };
   *     assert.doesNotDecrease(fn, obj, 'val');
   *
   * @name doesNotDecrease
   * @param {Function} modifier function
   * @param {Object} object
   * @param {String} property name
   * @param {String} message _optional_
   * @namespace Assert
   * @api public
   */

  assert.doesNotDecrease = function (fn, obj, prop) {
    new Assertion(fn).to.not.decrease(obj, prop);
  }

  /*!
   * ### .ifError(object)
   *
   * Asserts if value is not a false value, and throws if it is a true value.
   * This is added to allow for chai to be a drop-in replacement for Node's
   * assert class.
   *
   *     var err = new Error('I am a custom error');
   *     assert.ifError(err); // Rethrows err!
   *
   * @name ifError
   * @param {Object} object
   * @namespace Assert
   * @api public
   */

  assert.ifError = function (val) {
    if (val) {
      throw(val);
    }
  };

  /**
   * ### .isExtensible(object)
   *
   * Asserts that `object` is extensible (can have new properties added to it).
   *
   *     assert.isExtensible({});
   *
   * @name isExtensible
   * @alias extensible
   * @param {Object} object
   * @param {String} message _optional_
   * @namespace Assert
   * @api public
   */

  assert.isExtensible = function (obj, msg) {
    new Assertion(obj, msg).to.be.extensible;
  };

  /**
   * ### .isNotExtensible(object)
   *
   * Asserts that `object` is _not_ extensible.
   *
   *     var nonExtensibleObject = Object.preventExtensions({});
   *     var sealedObject = Object.seal({});
   *     var frozenObject = Object.freese({});
   *
   *     assert.isNotExtensible(nonExtensibleObject);
   *     assert.isNotExtensible(sealedObject);
   *     assert.isNotExtensible(frozenObject);
   *
   * @name isNotExtensible
   * @alias notExtensible
   * @param {Object} object
   * @param {String} message _optional_
   * @namespace Assert
   * @api public
   */

  assert.isNotExtensible = function (obj, msg) {
    new Assertion(obj, msg).to.not.be.extensible;
  };

  /**
   * ### .isSealed(object)
   *
   * Asserts that `object` is sealed (cannot have new properties added to it
   * and its existing properties cannot be removed).
   *
   *     var sealedObject = Object.seal({});
   *     var frozenObject = Object.seal({});
   *
   *     assert.isSealed(sealedObject);
   *     assert.isSealed(frozenObject);
   *
   * @name isSealed
   * @alias sealed
   * @param {Object} object
   * @param {String} message _optional_
   * @namespace Assert
   * @api public
   */

  assert.isSealed = function (obj, msg) {
    new Assertion(obj, msg).to.be.sealed;
  };

  /**
   * ### .isNotSealed(object)
   *
   * Asserts that `object` is _not_ sealed.
   *
   *     assert.isNotSealed({});
   *
   * @name isNotSealed
   * @alias notSealed
   * @param {Object} object
   * @param {String} message _optional_
   * @namespace Assert
   * @api public
   */

  assert.isNotSealed = function (obj, msg) {
    new Assertion(obj, msg).to.not.be.sealed;
  };

  /**
   * ### .isFrozen(object)
   *
   * Asserts that `object` is frozen (cannot have new properties added to it
   * and its existing properties cannot be modified).
   *
   *     var frozenObject = Object.freeze({});
   *     assert.frozen(frozenObject);
   *
   * @name isFrozen
   * @alias frozen
   * @param {Object} object
   * @param {String} message _optional_
   * @namespace Assert
   * @api public
   */

  assert.isFrozen = function (obj, msg) {
    new Assertion(obj, msg).to.be.frozen;
  };

  /**
   * ### .isNotFrozen(object)
   *
   * Asserts that `object` is _not_ frozen.
   *
   *     assert.isNotFrozen({});
   *
   * @name isNotFrozen
   * @alias notFrozen
   * @param {Object} object
   * @param {String} message _optional_
   * @namespace Assert
   * @api public
   */

  assert.isNotFrozen = function (obj, msg) {
    new Assertion(obj, msg).to.not.be.frozen;
  };

  /*!
   * Aliases.
   */

  (function alias(name, as){
    assert[as] = assert[name];
    return alias;
  })
  ('isOk', 'ok')
  ('isNotOk', 'notOk')
  ('throws', 'throw')
  ('throws', 'Throw')
  ('isExtensible', 'extensible')
  ('isNotExtensible', 'notExtensible')
  ('isSealed', 'sealed')
  ('isNotSealed', 'notSealed')
  ('isFrozen', 'frozen')
  ('isNotFrozen', 'notFrozen');
};

},{}],10:[function(require,module,exports){
/*!
 * chai
 * Copyright(c) 2011-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

module.exports = function (chai, util) {
  chai.expect = function (val, message) {
    return new chai.Assertion(val, message);
  };

  /**
   * ### .fail(actual, expected, [message], [operator])
   *
   * Throw a failure.
   *
   * @name fail
   * @param {Mixed} actual
   * @param {Mixed} expected
   * @param {String} message
   * @param {String} operator
   * @namespace Expect
   * @api public
   */

  chai.expect.fail = function (actual, expected, message, operator) {
    message = message || 'expect.fail()';
    throw new chai.AssertionError(message, {
        actual: actual
      , expected: expected
      , operator: operator
    }, chai.expect.fail);
  };
};

},{}],11:[function(require,module,exports){
/*!
 * chai
 * Copyright(c) 2011-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

module.exports = function (chai, util) {
  var Assertion = chai.Assertion;

  function loadShould () {
    // explicitly define this method as function as to have it's name to include as `ssfi`
    function shouldGetter() {
      if (this instanceof String || this instanceof Number || this instanceof Boolean ) {
        return new Assertion(this.valueOf(), null, shouldGetter);
      }
      return new Assertion(this, null, shouldGetter);
    }
    function shouldSetter(value) {
      // See https://github.com/chaijs/chai/issues/86: this makes
      // `whatever.should = someValue` actually set `someValue`, which is
      // especially useful for `global.should = require('chai').should()`.
      //
      // Note that we have to use [[DefineProperty]] instead of [[Put]]
      // since otherwise we would trigger this very setter!
      Object.defineProperty(this, 'should', {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    }
    // modify Object.prototype to have `should`
    Object.defineProperty(Object.prototype, 'should', {
      set: shouldSetter
      , get: shouldGetter
      , configurable: true
    });

    var should = {};

    /**
     * ### .fail(actual, expected, [message], [operator])
     *
     * Throw a failure.
     *
     * @name fail
     * @param {Mixed} actual
     * @param {Mixed} expected
     * @param {String} message
     * @param {String} operator
     * @namespace Should
     * @api public
     */

    should.fail = function (actual, expected, message, operator) {
      message = message || 'should.fail()';
      throw new chai.AssertionError(message, {
          actual: actual
        , expected: expected
        , operator: operator
      }, should.fail);
    };

    /**
     * ### .equal(actual, expected, [message])
     *
     * Asserts non-strict equality (`==`) of `actual` and `expected`.
     *
     *     should.equal(3, '3', '== coerces values to strings');
     *
     * @name equal
     * @param {Mixed} actual
     * @param {Mixed} expected
     * @param {String} message
     * @namespace Should
     * @api public
     */

    should.equal = function (val1, val2, msg) {
      new Assertion(val1, msg).to.equal(val2);
    };

    /**
     * ### .throw(function, [constructor/string/regexp], [string/regexp], [message])
     *
     * Asserts that `function` will throw an error that is an instance of
     * `constructor`, or alternately that it will throw an error with message
     * matching `regexp`.
     *
     *     should.throw(fn, 'function throws a reference error');
     *     should.throw(fn, /function throws a reference error/);
     *     should.throw(fn, ReferenceError);
     *     should.throw(fn, ReferenceError, 'function throws a reference error');
     *     should.throw(fn, ReferenceError, /function throws a reference error/);
     *
     * @name throw
     * @alias Throw
     * @param {Function} function
     * @param {ErrorConstructor} constructor
     * @param {RegExp} regexp
     * @param {String} message
     * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Error#Error_types
     * @namespace Should
     * @api public
     */

    should.Throw = function (fn, errt, errs, msg) {
      new Assertion(fn, msg).to.Throw(errt, errs);
    };

    /**
     * ### .exist
     *
     * Asserts that the target is neither `null` nor `undefined`.
     *
     *     var foo = 'hi';
     *
     *     should.exist(foo, 'foo exists');
     *
     * @name exist
     * @namespace Should
     * @api public
     */

    should.exist = function (val, msg) {
      new Assertion(val, msg).to.exist;
    }

    // negation
    should.not = {}

    /**
     * ### .not.equal(actual, expected, [message])
     *
     * Asserts non-strict inequality (`!=`) of `actual` and `expected`.
     *
     *     should.not.equal(3, 4, 'these numbers are not equal');
     *
     * @name not.equal
     * @param {Mixed} actual
     * @param {Mixed} expected
     * @param {String} message
     * @namespace Should
     * @api public
     */

    should.not.equal = function (val1, val2, msg) {
      new Assertion(val1, msg).to.not.equal(val2);
    };

    /**
     * ### .throw(function, [constructor/regexp], [message])
     *
     * Asserts that `function` will _not_ throw an error that is an instance of
     * `constructor`, or alternately that it will not throw an error with message
     * matching `regexp`.
     *
     *     should.not.throw(fn, Error, 'function does not throw');
     *
     * @name not.throw
     * @alias not.Throw
     * @param {Function} function
     * @param {ErrorConstructor} constructor
     * @param {RegExp} regexp
     * @param {String} message
     * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Error#Error_types
     * @namespace Should
     * @api public
     */

    should.not.Throw = function (fn, errt, errs, msg) {
      new Assertion(fn, msg).to.not.Throw(errt, errs);
    };

    /**
     * ### .not.exist
     *
     * Asserts that the target is neither `null` nor `undefined`.
     *
     *     var bar = null;
     *
     *     should.not.exist(bar, 'bar does not exist');
     *
     * @name not.exist
     * @namespace Should
     * @api public
     */

    should.not.exist = function (val, msg) {
      new Assertion(val, msg).to.not.exist;
    }

    should['throw'] = should['Throw'];
    should.not['throw'] = should.not['Throw'];

    return should;
  };

  chai.should = loadShould;
  chai.Should = loadShould;
};

},{}],12:[function(require,module,exports){
/*!
 * Chai - addChainingMethod utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * Module dependencies
 */

var transferFlags = require('./transferFlags');
var flag = require('./flag');
var config = require('../config');

/*!
 * Module variables
 */

// Check whether `__proto__` is supported
var hasProtoSupport = '__proto__' in Object;

// Without `__proto__` support, this module will need to add properties to a function.
// However, some Function.prototype methods cannot be overwritten,
// and there seems no easy cross-platform way to detect them (@see chaijs/chai/issues/69).
var excludeNames = /^(?:length|name|arguments|caller)$/;

// Cache `Function` properties
var call  = Function.prototype.call,
    apply = Function.prototype.apply;

/**
 * ### addChainableMethod (ctx, name, method, chainingBehavior)
 *
 * Adds a method to an object, such that the method can also be chained.
 *
 *     utils.addChainableMethod(chai.Assertion.prototype, 'foo', function (str) {
 *       var obj = utils.flag(this, 'object');
 *       new chai.Assertion(obj).to.be.equal(str);
 *     });
 *
 * Can also be accessed directly from `chai.Assertion`.
 *
 *     chai.Assertion.addChainableMethod('foo', fn, chainingBehavior);
 *
 * The result can then be used as both a method assertion, executing both `method` and
 * `chainingBehavior`, or as a language chain, which only executes `chainingBehavior`.
 *
 *     expect(fooStr).to.be.foo('bar');
 *     expect(fooStr).to.be.foo.equal('foo');
 *
 * @param {Object} ctx object to which the method is added
 * @param {String} name of method to add
 * @param {Function} method function to be used for `name`, when called
 * @param {Function} chainingBehavior function to be called every time the property is accessed
 * @namespace Utils
 * @name addChainableMethod
 * @api public
 */

module.exports = function (ctx, name, method, chainingBehavior) {
  if (typeof chainingBehavior !== 'function') {
    chainingBehavior = function () { };
  }

  var chainableBehavior = {
      method: method
    , chainingBehavior: chainingBehavior
  };

  // save the methods so we can overwrite them later, if we need to.
  if (!ctx.__methods) {
    ctx.__methods = {};
  }
  ctx.__methods[name] = chainableBehavior;

  Object.defineProperty(ctx, name,
    { get: function () {
        chainableBehavior.chainingBehavior.call(this);

        var assert = function assert() {
          var old_ssfi = flag(this, 'ssfi');
          if (old_ssfi && config.includeStack === false)
            flag(this, 'ssfi', assert);
          var result = chainableBehavior.method.apply(this, arguments);
          return result === undefined ? this : result;
        };

        // Use `__proto__` if available
        if (hasProtoSupport) {
          // Inherit all properties from the object by replacing the `Function` prototype
          var prototype = assert.__proto__ = Object.create(this);
          // Restore the `call` and `apply` methods from `Function`
          prototype.call = call;
          prototype.apply = apply;
        }
        // Otherwise, redefine all properties (slow!)
        else {
          var asserterNames = Object.getOwnPropertyNames(ctx);
          asserterNames.forEach(function (asserterName) {
            if (!excludeNames.test(asserterName)) {
              var pd = Object.getOwnPropertyDescriptor(ctx, asserterName);
              Object.defineProperty(assert, asserterName, pd);
            }
          });
        }

        transferFlags(this, assert);
        return assert;
      }
    , configurable: true
  });
};

},{"../config":7,"./flag":16,"./transferFlags":32}],13:[function(require,module,exports){
/*!
 * Chai - addMethod utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

var config = require('../config');

/**
 * ### .addMethod (ctx, name, method)
 *
 * Adds a method to the prototype of an object.
 *
 *     utils.addMethod(chai.Assertion.prototype, 'foo', function (str) {
 *       var obj = utils.flag(this, 'object');
 *       new chai.Assertion(obj).to.be.equal(str);
 *     });
 *
 * Can also be accessed directly from `chai.Assertion`.
 *
 *     chai.Assertion.addMethod('foo', fn);
 *
 * Then can be used as any other assertion.
 *
 *     expect(fooStr).to.be.foo('bar');
 *
 * @param {Object} ctx object to which the method is added
 * @param {String} name of method to add
 * @param {Function} method function to be used for name
 * @namespace Utils
 * @name addMethod
 * @api public
 */
var flag = require('./flag');

module.exports = function (ctx, name, method) {
  ctx[name] = function () {
    var old_ssfi = flag(this, 'ssfi');
    if (old_ssfi && config.includeStack === false)
      flag(this, 'ssfi', ctx[name]);
    var result = method.apply(this, arguments);
    return result === undefined ? this : result;
  };
};

},{"../config":7,"./flag":16}],14:[function(require,module,exports){
/*!
 * Chai - addProperty utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

var config = require('../config');
var flag = require('./flag');

/**
 * ### addProperty (ctx, name, getter)
 *
 * Adds a property to the prototype of an object.
 *
 *     utils.addProperty(chai.Assertion.prototype, 'foo', function () {
 *       var obj = utils.flag(this, 'object');
 *       new chai.Assertion(obj).to.be.instanceof(Foo);
 *     });
 *
 * Can also be accessed directly from `chai.Assertion`.
 *
 *     chai.Assertion.addProperty('foo', fn);
 *
 * Then can be used as any other assertion.
 *
 *     expect(myFoo).to.be.foo;
 *
 * @param {Object} ctx object to which the property is added
 * @param {String} name of property to add
 * @param {Function} getter function to be used for name
 * @namespace Utils
 * @name addProperty
 * @api public
 */

module.exports = function (ctx, name, getter) {
  Object.defineProperty(ctx, name,
    { get: function addProperty() {
        var old_ssfi = flag(this, 'ssfi');
        if (old_ssfi && config.includeStack === false)
          flag(this, 'ssfi', addProperty);

        var result = getter.call(this);
        return result === undefined ? this : result;
      }
    , configurable: true
  });
};

},{"../config":7,"./flag":16}],15:[function(require,module,exports){
/*!
 * Chai - expectTypes utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/**
 * ### expectTypes(obj, types)
 *
 * Ensures that the object being tested against is of a valid type.
 *
 *     utils.expectTypes(this, ['array', 'object', 'string']);
 *
 * @param {Mixed} obj constructed Assertion
 * @param {Array} type A list of allowed types for this assertion
 * @namespace Utils
 * @name expectTypes
 * @api public
 */

var AssertionError = require('assertion-error');
var flag = require('./flag');
var type = require('type-detect');

module.exports = function (obj, types) {
  var obj = flag(obj, 'object');
  types = types.map(function (t) { return t.toLowerCase(); });
  types.sort();

  // Transforms ['lorem', 'ipsum'] into 'a lirum, or an ipsum'
  var str = types.map(function (t, index) {
    var art = ~[ 'a', 'e', 'i', 'o', 'u' ].indexOf(t.charAt(0)) ? 'an' : 'a';
    var or = types.length > 1 && index === types.length - 1 ? 'or ' : '';
    return or + art + ' ' + t;
  }).join(', ');

  if (!types.some(function (expected) { return type(obj) === expected; })) {
    throw new AssertionError(
      'object tested must be ' + str + ', but ' + type(obj) + ' given'
    );
  }
};

},{"./flag":16,"assertion-error":1,"type-detect":110}],16:[function(require,module,exports){
/*!
 * Chai - flag utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/**
 * ### flag(object, key, [value])
 *
 * Get or set a flag value on an object. If a
 * value is provided it will be set, else it will
 * return the currently set value or `undefined` if
 * the value is not set.
 *
 *     utils.flag(this, 'foo', 'bar'); // setter
 *     utils.flag(this, 'foo'); // getter, returns `bar`
 *
 * @param {Object} object constructed Assertion
 * @param {String} key
 * @param {Mixed} value (optional)
 * @namespace Utils
 * @name flag
 * @api private
 */

module.exports = function (obj, key, value) {
  var flags = obj.__flags || (obj.__flags = Object.create(null));
  if (arguments.length === 3) {
    flags[key] = value;
  } else {
    return flags[key];
  }
};

},{}],17:[function(require,module,exports){
/*!
 * Chai - getActual utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/**
 * # getActual(object, [actual])
 *
 * Returns the `actual` value for an Assertion
 *
 * @param {Object} object (constructed Assertion)
 * @param {Arguments} chai.Assertion.prototype.assert arguments
 * @namespace Utils
 * @name getActual
 */

module.exports = function (obj, args) {
  return args.length > 4 ? args[4] : obj._obj;
};

},{}],18:[function(require,module,exports){
/*!
 * Chai - getEnumerableProperties utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/**
 * ### .getEnumerableProperties(object)
 *
 * This allows the retrieval of enumerable property names of an object,
 * inherited or not.
 *
 * @param {Object} object
 * @returns {Array}
 * @namespace Utils
 * @name getEnumerableProperties
 * @api public
 */

module.exports = function getEnumerableProperties(object) {
  var result = [];
  for (var name in object) {
    result.push(name);
  }
  return result;
};

},{}],19:[function(require,module,exports){
/*!
 * Chai - message composition utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * Module dependancies
 */

var flag = require('./flag')
  , getActual = require('./getActual')
  , inspect = require('./inspect')
  , objDisplay = require('./objDisplay');

/**
 * ### .getMessage(object, message, negateMessage)
 *
 * Construct the error message based on flags
 * and template tags. Template tags will return
 * a stringified inspection of the object referenced.
 *
 * Message template tags:
 * - `#{this}` current asserted object
 * - `#{act}` actual value
 * - `#{exp}` expected value
 *
 * @param {Object} object (constructed Assertion)
 * @param {Arguments} chai.Assertion.prototype.assert arguments
 * @namespace Utils
 * @name getMessage
 * @api public
 */

module.exports = function (obj, args) {
  var negate = flag(obj, 'negate')
    , val = flag(obj, 'object')
    , expected = args[3]
    , actual = getActual(obj, args)
    , msg = negate ? args[2] : args[1]
    , flagMsg = flag(obj, 'message');

  if(typeof msg === "function") msg = msg();
  msg = msg || '';
  msg = msg
    .replace(/#\{this\}/g, function () { return objDisplay(val); })
    .replace(/#\{act\}/g, function () { return objDisplay(actual); })
    .replace(/#\{exp\}/g, function () { return objDisplay(expected); });

  return flagMsg ? flagMsg + ': ' + msg : msg;
};

},{"./flag":16,"./getActual":17,"./inspect":26,"./objDisplay":27}],20:[function(require,module,exports){
/*!
 * Chai - getName utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/**
 * # getName(func)
 *
 * Gets the name of a function, in a cross-browser way.
 *
 * @param {Function} a function (usually a constructor)
 * @namespace Utils
 * @name getName
 */

module.exports = function (func) {
  if (func.name) return func.name;

  var match = /^\s?function ([^(]*)\(/.exec(func);
  return match && match[1] ? match[1] : "";
};

},{}],21:[function(require,module,exports){
/*!
 * Chai - getPathInfo utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

var hasProperty = require('./hasProperty');

/**
 * ### .getPathInfo(path, object)
 *
 * This allows the retrieval of property info in an
 * object given a string path.
 *
 * The path info consists of an object with the
 * following properties:
 *
 * * parent - The parent object of the property referenced by `path`
 * * name - The name of the final property, a number if it was an array indexer
 * * value - The value of the property, if it exists, otherwise `undefined`
 * * exists - Whether the property exists or not
 *
 * @param {String} path
 * @param {Object} object
 * @returns {Object} info
 * @namespace Utils
 * @name getPathInfo
 * @api public
 */

module.exports = function getPathInfo(path, obj) {
  var parsed = parsePath(path),
      last = parsed[parsed.length - 1];

  var info = {
    parent: parsed.length > 1 ? _getPathValue(parsed, obj, parsed.length - 1) : obj,
    name: last.p || last.i,
    value: _getPathValue(parsed, obj)
  };
  info.exists = hasProperty(info.name, info.parent);

  return info;
};


/*!
 * ## parsePath(path)
 *
 * Helper function used to parse string object
 * paths. Use in conjunction with `_getPathValue`.
 *
 *      var parsed = parsePath('myobject.property.subprop');
 *
 * ### Paths:
 *
 * * Can be as near infinitely deep and nested
 * * Arrays are also valid using the formal `myobject.document[3].property`.
 * * Literal dots and brackets (not delimiter) must be backslash-escaped.
 *
 * @param {String} path
 * @returns {Object} parsed
 * @api private
 */

function parsePath (path) {
  var str = path.replace(/([^\\])\[/g, '$1.[')
    , parts = str.match(/(\\\.|[^.]+?)+/g);
  return parts.map(function (value) {
    var re = /^\[(\d+)\]$/
      , mArr = re.exec(value);
    if (mArr) return { i: parseFloat(mArr[1]) };
    else return { p: value.replace(/\\([.\[\]])/g, '$1') };
  });
}


/*!
 * ## _getPathValue(parsed, obj)
 *
 * Helper companion function for `.parsePath` that returns
 * the value located at the parsed address.
 *
 *      var value = getPathValue(parsed, obj);
 *
 * @param {Object} parsed definition from `parsePath`.
 * @param {Object} object to search against
 * @param {Number} object to search against
 * @returns {Object|Undefined} value
 * @api private
 */

function _getPathValue (parsed, obj, index) {
  var tmp = obj
    , res;

  index = (index === undefined ? parsed.length : index);

  for (var i = 0, l = index; i < l; i++) {
    var part = parsed[i];
    if (tmp) {
      if ('undefined' !== typeof part.p)
        tmp = tmp[part.p];
      else if ('undefined' !== typeof part.i)
        tmp = tmp[part.i];
      if (i == (l - 1)) res = tmp;
    } else {
      res = undefined;
    }
  }
  return res;
}

},{"./hasProperty":24}],22:[function(require,module,exports){
/*!
 * Chai - getPathValue utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * @see https://github.com/logicalparadox/filtr
 * MIT Licensed
 */

var getPathInfo = require('./getPathInfo');

/**
 * ### .getPathValue(path, object)
 *
 * This allows the retrieval of values in an
 * object given a string path.
 *
 *     var obj = {
 *         prop1: {
 *             arr: ['a', 'b', 'c']
 *           , str: 'Hello'
 *         }
 *       , prop2: {
 *             arr: [ { nested: 'Universe' } ]
 *           , str: 'Hello again!'
 *         }
 *     }
 *
 * The following would be the results.
 *
 *     getPathValue('prop1.str', obj); // Hello
 *     getPathValue('prop1.att[2]', obj); // b
 *     getPathValue('prop2.arr[0].nested', obj); // Universe
 *
 * @param {String} path
 * @param {Object} object
 * @returns {Object} value or `undefined`
 * @namespace Utils
 * @name getPathValue
 * @api public
 */
module.exports = function(path, obj) {
  var info = getPathInfo(path, obj);
  return info.value;
};

},{"./getPathInfo":21}],23:[function(require,module,exports){
/*!
 * Chai - getProperties utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/**
 * ### .getProperties(object)
 *
 * This allows the retrieval of property names of an object, enumerable or not,
 * inherited or not.
 *
 * @param {Object} object
 * @returns {Array}
 * @namespace Utils
 * @name getProperties
 * @api public
 */

module.exports = function getProperties(object) {
  var result = Object.getOwnPropertyNames(object);

  function addProperty(property) {
    if (result.indexOf(property) === -1) {
      result.push(property);
    }
  }

  var proto = Object.getPrototypeOf(object);
  while (proto !== null) {
    Object.getOwnPropertyNames(proto).forEach(addProperty);
    proto = Object.getPrototypeOf(proto);
  }

  return result;
};

},{}],24:[function(require,module,exports){
/*!
 * Chai - hasProperty utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

var type = require('type-detect');

/**
 * ### .hasProperty(object, name)
 *
 * This allows checking whether an object has
 * named property or numeric array index.
 *
 * Basically does the same thing as the `in`
 * operator but works properly with natives
 * and null/undefined values.
 *
 *     var obj = {
 *         arr: ['a', 'b', 'c']
 *       , str: 'Hello'
 *     }
 *
 * The following would be the results.
 *
 *     hasProperty('str', obj);  // true
 *     hasProperty('constructor', obj);  // true
 *     hasProperty('bar', obj);  // false
 *
 *     hasProperty('length', obj.str); // true
 *     hasProperty(1, obj.str);  // true
 *     hasProperty(5, obj.str);  // false
 *
 *     hasProperty('length', obj.arr);  // true
 *     hasProperty(2, obj.arr);  // true
 *     hasProperty(3, obj.arr);  // false
 *
 * @param {Objuect} object
 * @param {String|Number} name
 * @returns {Boolean} whether it exists
 * @namespace Utils
 * @name getPathInfo
 * @api public
 */

var literals = {
    'number': Number
  , 'string': String
};

module.exports = function hasProperty(name, obj) {
  var ot = type(obj);

  // Bad Object, obviously no props at all
  if(ot === 'null' || ot === 'undefined')
    return false;

  // The `in` operator does not work with certain literals
  // box these before the check
  if(literals[ot] && typeof obj !== 'object')
    obj = new literals[ot](obj);

  return name in obj;
};

},{"type-detect":110}],25:[function(require,module,exports){
/*!
 * chai
 * Copyright(c) 2011 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * Main exports
 */

var exports = module.exports = {};

/*!
 * test utility
 */

exports.test = require('./test');

/*!
 * type utility
 */

exports.type = require('type-detect');

/*!
 * expectTypes utility
 */
exports.expectTypes = require('./expectTypes');

/*!
 * message utility
 */

exports.getMessage = require('./getMessage');

/*!
 * actual utility
 */

exports.getActual = require('./getActual');

/*!
 * Inspect util
 */

exports.inspect = require('./inspect');

/*!
 * Object Display util
 */

exports.objDisplay = require('./objDisplay');

/*!
 * Flag utility
 */

exports.flag = require('./flag');

/*!
 * Flag transferring utility
 */

exports.transferFlags = require('./transferFlags');

/*!
 * Deep equal utility
 */

exports.eql = require('deep-eql');

/*!
 * Deep path value
 */

exports.getPathValue = require('./getPathValue');

/*!
 * Deep path info
 */

exports.getPathInfo = require('./getPathInfo');

/*!
 * Check if a property exists
 */

exports.hasProperty = require('./hasProperty');

/*!
 * Function name
 */

exports.getName = require('./getName');

/*!
 * add Property
 */

exports.addProperty = require('./addProperty');

/*!
 * add Method
 */

exports.addMethod = require('./addMethod');

/*!
 * overwrite Property
 */

exports.overwriteProperty = require('./overwriteProperty');

/*!
 * overwrite Method
 */

exports.overwriteMethod = require('./overwriteMethod');

/*!
 * Add a chainable method
 */

exports.addChainableMethod = require('./addChainableMethod');

/*!
 * Overwrite chainable method
 */

exports.overwriteChainableMethod = require('./overwriteChainableMethod');

},{"./addChainableMethod":12,"./addMethod":13,"./addProperty":14,"./expectTypes":15,"./flag":16,"./getActual":17,"./getMessage":19,"./getName":20,"./getPathInfo":21,"./getPathValue":22,"./hasProperty":24,"./inspect":26,"./objDisplay":27,"./overwriteChainableMethod":28,"./overwriteMethod":29,"./overwriteProperty":30,"./test":31,"./transferFlags":32,"deep-eql":33,"type-detect":110}],26:[function(require,module,exports){
// This is (almost) directly from Node.js utils
// https://github.com/joyent/node/blob/f8c335d0caf47f16d31413f89aa28eda3878e3aa/lib/util.js

var getName = require('./getName');
var getProperties = require('./getProperties');
var getEnumerableProperties = require('./getEnumerableProperties');

module.exports = inspect;

/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Boolean} showHidden Flag that shows hidden (not enumerable)
 *    properties of objects.
 * @param {Number} depth Depth in which to descend in object. Default is 2.
 * @param {Boolean} colors Flag to turn on ANSI escape codes to color the
 *    output. Default is false (no coloring).
 * @namespace Utils
 * @name inspect
 */
function inspect(obj, showHidden, depth, colors) {
  var ctx = {
    showHidden: showHidden,
    seen: [],
    stylize: function (str) { return str; }
  };
  return formatValue(ctx, obj, (typeof depth === 'undefined' ? 2 : depth));
}

// Returns true if object is a DOM element.
var isDOMElement = function (object) {
  if (typeof HTMLElement === 'object') {
    return object instanceof HTMLElement;
  } else {
    return object &&
      typeof object === 'object' &&
      object.nodeType === 1 &&
      typeof object.nodeName === 'string';
  }
};

function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (value && typeof value.inspect === 'function' &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes);
    if (typeof ret !== 'string') {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // If this is a DOM element, try to get the outer HTML.
  if (isDOMElement(value)) {
    if ('outerHTML' in value) {
      return value.outerHTML;
      // This value does not have an outerHTML attribute,
      //   it could still be an XML element
    } else {
      // Attempt to serialize it
      try {
        if (document.xmlVersion) {
          var xmlSerializer = new XMLSerializer();
          return xmlSerializer.serializeToString(value);
        } else {
          // Firefox 11- do not support outerHTML
          //   It does, however, support innerHTML
          //   Use the following to render the element
          var ns = "http://www.w3.org/1999/xhtml";
          var container = document.createElementNS(ns, '_');

          container.appendChild(value.cloneNode(false));
          html = container.innerHTML
            .replace('><', '>' + value.innerHTML + '<');
          container.innerHTML = '';
          return html;
        }
      } catch (err) {
        // This could be a non-native DOM implementation,
        //   continue with the normal flow:
        //   printing the element as if it is an object.
      }
    }
  }

  // Look up the keys of the object.
  var visibleKeys = getEnumerableProperties(value);
  var keys = ctx.showHidden ? getProperties(value) : visibleKeys;

  // Some type of object without properties can be shortcutted.
  // In IE, errors have a single `stack` property, or if they are vanilla `Error`,
  // a `stack` plus `description` property; ignore those for consistency.
  if (keys.length === 0 || (isError(value) && (
      (keys.length === 1 && keys[0] === 'stack') ||
      (keys.length === 2 && keys[0] === 'description' && keys[1] === 'stack')
     ))) {
    if (typeof value === 'function') {
      var name = getName(value);
      var nameSuffix = name ? ': ' + name : '';
      return ctx.stylize('[Function' + nameSuffix + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toUTCString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (typeof value === 'function') {
    var name = getName(value);
    var nameSuffix = name ? ': ' + name : '';
    base = ' [Function' + nameSuffix + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    return formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  switch (typeof value) {
    case 'undefined':
      return ctx.stylize('undefined', 'undefined');

    case 'string':
      var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                               .replace(/'/g, "\\'")
                                               .replace(/\\"/g, '"') + '\'';
      return ctx.stylize(simple, 'string');

    case 'number':
      if (value === 0 && (1/value) === -Infinity) {
        return ctx.stylize('-0', 'number');
      }
      return ctx.stylize('' + value, 'number');

    case 'boolean':
      return ctx.stylize('' + value, 'boolean');
  }
  // For some reason typeof null is "object", so special case here.
  if (value === null) {
    return ctx.stylize('null', 'null');
  }
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (Object.prototype.hasOwnProperty.call(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str;
  if (value.__lookupGetter__) {
    if (value.__lookupGetter__(key)) {
      if (value.__lookupSetter__(key)) {
        str = ctx.stylize('[Getter/Setter]', 'special');
      } else {
        str = ctx.stylize('[Getter]', 'special');
      }
    } else {
      if (value.__lookupSetter__(key)) {
        str = ctx.stylize('[Setter]', 'special');
      }
    }
  }
  if (visibleKeys.indexOf(key) < 0) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(value[key]) < 0) {
      if (recurseTimes === null) {
        str = formatValue(ctx, value[key], null);
      } else {
        str = formatValue(ctx, value[key], recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (typeof name === 'undefined') {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}

function isArray(ar) {
  return Array.isArray(ar) ||
         (typeof ar === 'object' && objectToString(ar) === '[object Array]');
}

function isRegExp(re) {
  return typeof re === 'object' && objectToString(re) === '[object RegExp]';
}

function isDate(d) {
  return typeof d === 'object' && objectToString(d) === '[object Date]';
}

function isError(e) {
  return typeof e === 'object' && objectToString(e) === '[object Error]';
}

function objectToString(o) {
  return Object.prototype.toString.call(o);
}

},{"./getEnumerableProperties":18,"./getName":20,"./getProperties":23}],27:[function(require,module,exports){
/*!
 * Chai - flag utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * Module dependancies
 */

var inspect = require('./inspect');
var config = require('../config');

/**
 * ### .objDisplay (object)
 *
 * Determines if an object or an array matches
 * criteria to be inspected in-line for error
 * messages or should be truncated.
 *
 * @param {Mixed} javascript object to inspect
 * @name objDisplay
 * @namespace Utils
 * @api public
 */

module.exports = function (obj) {
  var str = inspect(obj)
    , type = Object.prototype.toString.call(obj);

  if (config.truncateThreshold && str.length >= config.truncateThreshold) {
    if (type === '[object Function]') {
      return !obj.name || obj.name === ''
        ? '[Function]'
        : '[Function: ' + obj.name + ']';
    } else if (type === '[object Array]') {
      return '[ Array(' + obj.length + ') ]';
    } else if (type === '[object Object]') {
      var keys = Object.keys(obj)
        , kstr = keys.length > 2
          ? keys.splice(0, 2).join(', ') + ', ...'
          : keys.join(', ');
      return '{ Object (' + kstr + ') }';
    } else {
      return str;
    }
  } else {
    return str;
  }
};

},{"../config":7,"./inspect":26}],28:[function(require,module,exports){
/*!
 * Chai - overwriteChainableMethod utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/**
 * ### overwriteChainableMethod (ctx, name, method, chainingBehavior)
 *
 * Overwites an already existing chainable method
 * and provides access to the previous function or
 * property.  Must return functions to be used for
 * name.
 *
 *     utils.overwriteChainableMethod(chai.Assertion.prototype, 'length',
 *       function (_super) {
 *       }
 *     , function (_super) {
 *       }
 *     );
 *
 * Can also be accessed directly from `chai.Assertion`.
 *
 *     chai.Assertion.overwriteChainableMethod('foo', fn, fn);
 *
 * Then can be used as any other assertion.
 *
 *     expect(myFoo).to.have.length(3);
 *     expect(myFoo).to.have.length.above(3);
 *
 * @param {Object} ctx object whose method / property is to be overwritten
 * @param {String} name of method / property to overwrite
 * @param {Function} method function that returns a function to be used for name
 * @param {Function} chainingBehavior function that returns a function to be used for property
 * @namespace Utils
 * @name overwriteChainableMethod
 * @api public
 */

module.exports = function (ctx, name, method, chainingBehavior) {
  var chainableBehavior = ctx.__methods[name];

  var _chainingBehavior = chainableBehavior.chainingBehavior;
  chainableBehavior.chainingBehavior = function () {
    var result = chainingBehavior(_chainingBehavior).call(this);
    return result === undefined ? this : result;
  };

  var _method = chainableBehavior.method;
  chainableBehavior.method = function () {
    var result = method(_method).apply(this, arguments);
    return result === undefined ? this : result;
  };
};

},{}],29:[function(require,module,exports){
/*!
 * Chai - overwriteMethod utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/**
 * ### overwriteMethod (ctx, name, fn)
 *
 * Overwites an already existing method and provides
 * access to previous function. Must return function
 * to be used for name.
 *
 *     utils.overwriteMethod(chai.Assertion.prototype, 'equal', function (_super) {
 *       return function (str) {
 *         var obj = utils.flag(this, 'object');
 *         if (obj instanceof Foo) {
 *           new chai.Assertion(obj.value).to.equal(str);
 *         } else {
 *           _super.apply(this, arguments);
 *         }
 *       }
 *     });
 *
 * Can also be accessed directly from `chai.Assertion`.
 *
 *     chai.Assertion.overwriteMethod('foo', fn);
 *
 * Then can be used as any other assertion.
 *
 *     expect(myFoo).to.equal('bar');
 *
 * @param {Object} ctx object whose method is to be overwritten
 * @param {String} name of method to overwrite
 * @param {Function} method function that returns a function to be used for name
 * @namespace Utils
 * @name overwriteMethod
 * @api public
 */

module.exports = function (ctx, name, method) {
  var _method = ctx[name]
    , _super = function () { return this; };

  if (_method && 'function' === typeof _method)
    _super = _method;

  ctx[name] = function () {
    var result = method(_super).apply(this, arguments);
    return result === undefined ? this : result;
  }
};

},{}],30:[function(require,module,exports){
/*!
 * Chai - overwriteProperty utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/**
 * ### overwriteProperty (ctx, name, fn)
 *
 * Overwites an already existing property getter and provides
 * access to previous value. Must return function to use as getter.
 *
 *     utils.overwriteProperty(chai.Assertion.prototype, 'ok', function (_super) {
 *       return function () {
 *         var obj = utils.flag(this, 'object');
 *         if (obj instanceof Foo) {
 *           new chai.Assertion(obj.name).to.equal('bar');
 *         } else {
 *           _super.call(this);
 *         }
 *       }
 *     });
 *
 *
 * Can also be accessed directly from `chai.Assertion`.
 *
 *     chai.Assertion.overwriteProperty('foo', fn);
 *
 * Then can be used as any other assertion.
 *
 *     expect(myFoo).to.be.ok;
 *
 * @param {Object} ctx object whose property is to be overwritten
 * @param {String} name of property to overwrite
 * @param {Function} getter function that returns a getter function to be used for name
 * @namespace Utils
 * @name overwriteProperty
 * @api public
 */

module.exports = function (ctx, name, getter) {
  var _get = Object.getOwnPropertyDescriptor(ctx, name)
    , _super = function () {};

  if (_get && 'function' === typeof _get.get)
    _super = _get.get

  Object.defineProperty(ctx, name,
    { get: function () {
        var result = getter(_super).call(this);
        return result === undefined ? this : result;
      }
    , configurable: true
  });
};

},{}],31:[function(require,module,exports){
/*!
 * Chai - test utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * Module dependancies
 */

var flag = require('./flag');

/**
 * # test(object, expression)
 *
 * Test and object for expression.
 *
 * @param {Object} object (constructed Assertion)
 * @param {Arguments} chai.Assertion.prototype.assert arguments
 * @namespace Utils
 * @name test
 */

module.exports = function (obj, args) {
  var negate = flag(obj, 'negate')
    , expr = args[0];
  return negate ? !expr : expr;
};

},{"./flag":16}],32:[function(require,module,exports){
/*!
 * Chai - transferFlags utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/**
 * ### transferFlags(assertion, object, includeAll = true)
 *
 * Transfer all the flags for `assertion` to `object`. If
 * `includeAll` is set to `false`, then the base Chai
 * assertion flags (namely `object`, `ssfi`, and `message`)
 * will not be transferred.
 *
 *
 *     var newAssertion = new Assertion();
 *     utils.transferFlags(assertion, newAssertion);
 *
 *     var anotherAsseriton = new Assertion(myObj);
 *     utils.transferFlags(assertion, anotherAssertion, false);
 *
 * @param {Assertion} assertion the assertion to transfer the flags from
 * @param {Object} object the object to transfer the flags to; usually a new assertion
 * @param {Boolean} includeAll
 * @namespace Utils
 * @name transferFlags
 * @api private
 */

module.exports = function (assertion, object, includeAll) {
  var flags = assertion.__flags || (assertion.__flags = Object.create(null));

  if (!object.__flags) {
    object.__flags = Object.create(null);
  }

  includeAll = arguments.length === 3 ? includeAll : true;

  for (var flag in flags) {
    if (includeAll ||
        (flag !== 'object' && flag !== 'ssfi' && flag != 'message')) {
      object.__flags[flag] = flags[flag];
    }
  }
};

},{}],33:[function(require,module,exports){
module.exports = require('./lib/eql');

},{"./lib/eql":34}],34:[function(require,module,exports){
/*!
 * deep-eql
 * Copyright(c) 2013 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * Module dependencies
 */

var type = require('type-detect');

/*!
 * Buffer.isBuffer browser shim
 */

var Buffer;
try { Buffer = require('buffer').Buffer; }
catch(ex) {
  Buffer = {};
  Buffer.isBuffer = function() { return false; }
}

/*!
 * Primary Export
 */

module.exports = deepEqual;

/**
 * Assert super-strict (egal) equality between
 * two objects of any type.
 *
 * @param {Mixed} a
 * @param {Mixed} b
 * @param {Array} memoised (optional)
 * @return {Boolean} equal match
 */

function deepEqual(a, b, m) {
  if (sameValue(a, b)) {
    return true;
  } else if ('date' === type(a)) {
    return dateEqual(a, b);
  } else if ('regexp' === type(a)) {
    return regexpEqual(a, b);
  } else if (Buffer.isBuffer(a)) {
    return bufferEqual(a, b);
  } else if ('arguments' === type(a)) {
    return argumentsEqual(a, b, m);
  } else if (!typeEqual(a, b)) {
    return false;
  } else if (('object' !== type(a) && 'object' !== type(b))
  && ('array' !== type(a) && 'array' !== type(b))) {
    return sameValue(a, b);
  } else {
    return objectEqual(a, b, m);
  }
}

/*!
 * Strict (egal) equality test. Ensures that NaN always
 * equals NaN and `-0` does not equal `+0`.
 *
 * @param {Mixed} a
 * @param {Mixed} b
 * @return {Boolean} equal match
 */

function sameValue(a, b) {
  if (a === b) return a !== 0 || 1 / a === 1 / b;
  return a !== a && b !== b;
}

/*!
 * Compare the types of two given objects and
 * return if they are equal. Note that an Array
 * has a type of `array` (not `object`) and arguments
 * have a type of `arguments` (not `array`/`object`).
 *
 * @param {Mixed} a
 * @param {Mixed} b
 * @return {Boolean} result
 */

function typeEqual(a, b) {
  return type(a) === type(b);
}

/*!
 * Compare two Date objects by asserting that
 * the time values are equal using `saveValue`.
 *
 * @param {Date} a
 * @param {Date} b
 * @return {Boolean} result
 */

function dateEqual(a, b) {
  if ('date' !== type(b)) return false;
  return sameValue(a.getTime(), b.getTime());
}

/*!
 * Compare two regular expressions by converting them
 * to string and checking for `sameValue`.
 *
 * @param {RegExp} a
 * @param {RegExp} b
 * @return {Boolean} result
 */

function regexpEqual(a, b) {
  if ('regexp' !== type(b)) return false;
  return sameValue(a.toString(), b.toString());
}

/*!
 * Assert deep equality of two `arguments` objects.
 * Unfortunately, these must be sliced to arrays
 * prior to test to ensure no bad behavior.
 *
 * @param {Arguments} a
 * @param {Arguments} b
 * @param {Array} memoize (optional)
 * @return {Boolean} result
 */

function argumentsEqual(a, b, m) {
  if ('arguments' !== type(b)) return false;
  a = [].slice.call(a);
  b = [].slice.call(b);
  return deepEqual(a, b, m);
}

/*!
 * Get enumerable properties of a given object.
 *
 * @param {Object} a
 * @return {Array} property names
 */

function enumerable(a) {
  var res = [];
  for (var key in a) res.push(key);
  return res;
}

/*!
 * Simple equality for flat iterable objects
 * such as Arrays or Node.js buffers.
 *
 * @param {Iterable} a
 * @param {Iterable} b
 * @return {Boolean} result
 */

function iterableEqual(a, b) {
  if (a.length !==  b.length) return false;

  var i = 0;
  var match = true;

  for (; i < a.length; i++) {
    if (a[i] !== b[i]) {
      match = false;
      break;
    }
  }

  return match;
}

/*!
 * Extension to `iterableEqual` specifically
 * for Node.js Buffers.
 *
 * @param {Buffer} a
 * @param {Mixed} b
 * @return {Boolean} result
 */

function bufferEqual(a, b) {
  if (!Buffer.isBuffer(b)) return false;
  return iterableEqual(a, b);
}

/*!
 * Block for `objectEqual` ensuring non-existing
 * values don't get in.
 *
 * @param {Mixed} object
 * @return {Boolean} result
 */

function isValue(a) {
  return a !== null && a !== undefined;
}

/*!
 * Recursively check the equality of two objects.
 * Once basic sameness has been established it will
 * defer to `deepEqual` for each enumerable key
 * in the object.
 *
 * @param {Mixed} a
 * @param {Mixed} b
 * @return {Boolean} result
 */

function objectEqual(a, b, m) {
  if (!isValue(a) || !isValue(b)) {
    return false;
  }

  if (a.prototype !== b.prototype) {
    return false;
  }

  var i;
  if (m) {
    for (i = 0; i < m.length; i++) {
      if ((m[i][0] === a && m[i][1] === b)
      ||  (m[i][0] === b && m[i][1] === a)) {
        return true;
      }
    }
  } else {
    m = [];
  }

  try {
    var ka = enumerable(a);
    var kb = enumerable(b);
  } catch (ex) {
    return false;
  }

  ka.sort();
  kb.sort();

  if (!iterableEqual(ka, kb)) {
    return false;
  }

  m.push([ a, b ]);

  var key;
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!deepEqual(a[key], b[key], m)) {
      return false;
    }
  }

  return true;
}

},{"buffer":3,"type-detect":35}],35:[function(require,module,exports){
module.exports = require('./lib/type');

},{"./lib/type":36}],36:[function(require,module,exports){
/*!
 * type-detect
 * Copyright(c) 2013 jake luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * Primary Exports
 */

var exports = module.exports = getType;

/*!
 * Detectable javascript natives
 */

var natives = {
    '[object Array]': 'array'
  , '[object RegExp]': 'regexp'
  , '[object Function]': 'function'
  , '[object Arguments]': 'arguments'
  , '[object Date]': 'date'
};

/**
 * ### typeOf (obj)
 *
 * Use several different techniques to determine
 * the type of object being tested.
 *
 *
 * @param {Mixed} object
 * @return {String} object type
 * @api public
 */

function getType (obj) {
  var str = Object.prototype.toString.call(obj);
  if (natives[str]) return natives[str];
  if (obj === null) return 'null';
  if (obj === undefined) return 'undefined';
  if (obj === Object(obj)) return 'object';
  return typeof obj;
}

exports.Library = Library;

/**
 * ### Library
 *
 * Create a repository for custom type detection.
 *
 * ```js
 * var lib = new type.Library;
 * ```
 *
 */

function Library () {
  this.tests = {};
}

/**
 * #### .of (obj)
 *
 * Expose replacement `typeof` detection to the library.
 *
 * ```js
 * if ('string' === lib.of('hello world')) {
 *   // ...
 * }
 * ```
 *
 * @param {Mixed} object to test
 * @return {String} type
 */

Library.prototype.of = getType;

/**
 * #### .define (type, test)
 *
 * Add a test to for the `.test()` assertion.
 *
 * Can be defined as a regular expression:
 *
 * ```js
 * lib.define('int', /^[0-9]+$/);
 * ```
 *
 * ... or as a function:
 *
 * ```js
 * lib.define('bln', function (obj) {
 *   if ('boolean' === lib.of(obj)) return true;
 *   var blns = [ 'yes', 'no', 'true', 'false', 1, 0 ];
 *   if ('string' === lib.of(obj)) obj = obj.toLowerCase();
 *   return !! ~blns.indexOf(obj);
 * });
 * ```
 *
 * @param {String} type
 * @param {RegExp|Function} test
 * @api public
 */

Library.prototype.define = function (type, test) {
  if (arguments.length === 1) return this.tests[type];
  this.tests[type] = test;
  return this;
};

/**
 * #### .test (obj, test)
 *
 * Assert that an object is of type. Will first
 * check natives, and if that does not pass it will
 * use the user defined custom tests.
 *
 * ```js
 * assert(lib.test('1', 'int'));
 * assert(lib.test('yes', 'bln'));
 * ```
 *
 * @param {Mixed} object
 * @param {String} type
 * @return {Boolean} result
 * @api public
 */

Library.prototype.test = function (obj, type) {
  if (type === getType(obj)) return true;
  var test = this.tests[type];

  if (test && 'regexp' === getType(test)) {
    return test.test(obj);
  } else if (test && 'function' === getType(test)) {
    return test(obj);
  } else {
    throw new ReferenceError('Type test "' + type + '" not defined or invalid.');
  }
};

},{}],37:[function(require,module,exports){
(function (global){
/* jshint -W097 */
'use strict';

var RouteRecognizer = require('route-recognizer');
var FakeXMLHttpRequest = require('xhr-pretender');
var createFetch = require('fetchme');
var urlLib = require('url');

var baseURL = (typeof location !== 'undefined') && location.href || 'http://localhost/';

/**
 * parseURL - decompose a URL into its parts
 * @param  {String} url a URL
 * @return {Object} parts of the URL, including the following
 *
 * 'https://www.yahoo.com:1234/mypage?test=yes#abc'
 *
 * {
 *   host: 'www.yahoo.com:1234',
 *   protocol: 'https:',
 *   search: '?test=yes',
 *   hash: '#abc',
 *   href: 'https://www.yahoo.com:1234/mypage?test=yes#abc',
 *   pathname: '/mypage',
 *   fullpath: '/mypage?test=yes'
 * }
 */
function parseURL(url) {
  var fullURL = urlLib.resolve(baseURL, url);
  var parsed = urlLib.parse(fullURL);
  parsed.hash = parsed.hash || '';
  parsed.search = parsed.search || '';
  parsed.query = parsed.query || '';
  parsed.fullpath = parsed.path + parsed.hash;
  return parsed;
}


/**
 * Registry
 *
 * A registry is a map of HTTP verbs to route recognizers.
 */

function Registry(/* host */) {
  // Herein we keep track of RouteRecognizer instances
  // keyed by HTTP method. Feel free to add more as needed.
  this.verbs = {
    GET: new RouteRecognizer(),
    PUT: new RouteRecognizer(),
    POST: new RouteRecognizer(),
    DELETE: new RouteRecognizer(),
    PATCH: new RouteRecognizer(),
    HEAD: new RouteRecognizer(),
    OPTIONS: new RouteRecognizer()
  };
}

/**
 * Hosts
 *
 * a map of hosts to Registries, ultimately allowing
 * a per-host-and-port, per HTTP verb lookup of RouteRecognizers
 */
function Hosts() {
  this._registries = {};
}

/**
 * Hosts#forURL - retrieve a map of HTTP verbs to RouteRecognizers
 *                for a given URL
 *
 * @param  {String} url a URL
 * @return {Registry}   a map of HTTP verbs to RouteRecognizers
 *                      corresponding to the provided URL's
 *                      hostname and port
 */
Hosts.prototype.forURL = function(url) {
  var host = parseURL(url).host;
  var registry = this._registries[host];

  if (registry === undefined) {
    registry = (this._registries[host] = new Registry(host));
  }

  return registry.verbs;
};

function Pretender() {
  this.hosts = new Hosts();

  this.handlers = [];
  this.handledRequests = [];
  this.passthroughRequests = [];
  this.unhandledRequests = [];
  this.requestReferences = [];

  // reference the native XMLHttpRequest object so
  // it can be restored later
  this._nativeXMLHttpRequest = global.XMLHttpRequest;
  this._nativeHeaders = global.Headers;
  this._nativeRequest = global.Request;
  this._nativeResponse = global.Response;
  this._nativeFetch = global.fetch;

  // capture xhr requests, channeling them into
  // the route map.
  var XMLHttpRequest = interceptor(this);
  var fetchStuff = createFetch(XMLHttpRequest);
  global.XMLHttpRequest = XMLHttpRequest;
  global.Headers = fetchStuff.Headers;
  global.Request = fetchStuff.Request;
  global.Response = fetchStuff.Response;
  global.fetch = fetchStuff.fetch;

  // 'start' the server
  this.running = true;
}

function interceptor(pretender) {
  function FakeRequest() {
    // super()
    FakeXMLHttpRequest.call(this);
  }
  // extend
  var proto = new FakeXMLHttpRequest();
  proto.send = function send() {
    if (!pretender.running) {
      throw new Error('You shut down a Pretender instance while there was a pending request. ' +
            'That request just tried to complete. Check to see if you accidentally shut down ' +
            'a pretender earlier than you intended to');
    }

    FakeXMLHttpRequest.prototype.send.apply(this, arguments);
    if (!pretender.checkPassthrough(this)) {
      pretender.handleRequest(this);
    } else {
      var xhr = createPassthrough(this);
      xhr.send.apply(xhr, arguments);
    }
  };


  function createPassthrough(fakeXHR) {
    // event types to handle on the xhr
    var evts = ['error', 'timeout', 'abort', 'readystatechange'];

    // event types to handle on the xhr.upload
    var uploadEvents = ['progress'];

    // properties to copy from the native xhr to fake xhr
    var lifecycleProps = ['readyState', 'responseText', 'responseXML', 'status', 'statusText'];

    var xhr = fakeXHR._passthroughRequest = new pretender._nativeXMLHttpRequest();

    if (fakeXHR.responseType === 'arraybuffer') {
      lifecycleProps = ['readyState', 'response', 'status', 'statusText'];
      xhr.responseType = fakeXHR.responseType;
    }

    // Use onload if the browser supports it
    if ('onload' in xhr) {
      evts.push('load');
    }

    // add progress event for async calls
    if (fakeXHR.async && fakeXHR.responseType !== 'arraybuffer') {
      evts.push('progress');
    }

    // update `propertyNames` properties from `fromXHR` to `toXHR`
    function copyLifecycleProperties(propertyNames, fromXHR, toXHR) {
      for (var i = 0; i < propertyNames.length; i++) {
        var prop = propertyNames[i];
        if (fromXHR[prop]) {
          toXHR[prop] = fromXHR[prop];
        }
      }
    }

    // fire fake event on `eventable`
    function dispatchEvent(eventable, eventType, event) {
      eventable.dispatchEvent(event);
      if (eventable['on' + eventType]) {
        eventable['on' + eventType](event);
      }
    }

    // set the on- handler on the native xhr for the given eventType
    function createHandler(eventType) {
      xhr['on' + eventType] = function(event) {
        copyLifecycleProperties(lifecycleProps, xhr, fakeXHR);
        dispatchEvent(fakeXHR, eventType, event);
      };
    }

    // set the on- handler on the native xhr's `upload` property for
    // the given eventType
    function createUploadHandler(eventType) {
      if (xhr.upload) {
        xhr.upload['on' + eventType] = function(event) {
          dispatchEvent(fakeXHR.upload, eventType, event);
        };
      }
    }

    xhr.open(fakeXHR.method, fakeXHR.url, fakeXHR.async, fakeXHR.username, fakeXHR.password);

    var i;
    for (i = 0; i < evts.length; i++) {
      createHandler(evts[i]);
    }
    for (i = 0; i < uploadEvents.length; i++) {
      createUploadHandler(uploadEvents[i]);
    }

    if (fakeXHR.async) {
      xhr.timeout = fakeXHR.timeout;
      xhr.withCredentials = fakeXHR.withCredentials;
    }
    for (var h in fakeXHR.requestHeaders) {
      xhr.setRequestHeader(h, fakeXHR.requestHeaders[h]);
    }
    return xhr;
  }

  proto._passthroughCheck = function(method, args) {
    if (this._passthroughRequest) {
      return this._passthroughRequest[method].apply(this._passthroughRequest, args);
    }
    return FakeXMLHttpRequest.prototype[method].apply(this, args);
  };

  proto.abort = function abort() {
    return this._passthroughCheck('abort', arguments);
  };

  proto.getResponseHeader = function getResponseHeader() {
    return this._passthroughCheck('getResponseHeader', arguments);
  };

  proto.getAllResponseHeaders = function getAllResponseHeaders() {
    return this._passthroughCheck('getAllResponseHeaders', arguments);
  };

  FakeRequest.prototype = proto;
  return FakeRequest;
}

function verbify(verb) {
  return function(path, handler, async) {
    this.register(verb, path, handler, async);
  };
}

function scheduleProgressEvent(request, startTime, totalTime) {
  setTimeout(function() {
    if (!request.aborted && !request.status) {
      var ellapsedTime = new Date().getTime() - startTime.getTime();
      request.upload._progress(true, ellapsedTime, totalTime);
      request._progress(true, ellapsedTime, totalTime);
      scheduleProgressEvent(request, startTime, totalTime);
    }
  }, 50);
}

function isArray(array) {
  return Object.prototype.toString.call(array) === '[object Array]';
}

var PASSTHROUGH = {};

Pretender.prototype = {
  get: verbify('GET'),
  post: verbify('POST'),
  put: verbify('PUT'),
  'delete': verbify('DELETE'),
  patch: verbify('PATCH'),
  head: verbify('HEAD'),
  register: function register(verb, url, handler, async) {
    if (!handler) {
      throw new Error('The function you tried passing to Pretender to handle ' +
        verb + ' ' + url + ' is undefined or missing.');
    }

    handler.numberOfCalls = 0;
    handler.async = async;
    this.handlers.push(handler);

    var registry = this.hosts.forURL(url)[verb];

    registry.add([{
      path: parseURL(url).fullpath,
      handler: handler
    }]);
  },
  passthrough: PASSTHROUGH,
  checkPassthrough: function checkPassthrough(request) {
    var verb = request.method.toUpperCase();

    var path = parseURL(request.url).fullpath;

    verb = verb.toUpperCase();

    var recognized = this.hosts.forURL(request.url)[verb].recognize(path);
    var match = recognized && recognized[0];
    if (match && match.handler === PASSTHROUGH) {
      this.passthroughRequests.push(request);
      this.passthroughRequest(verb, path, request);
      return true;
    }

    return false;
  },
  handleRequest: function handleRequest(request) {
    var verb = request.method.toUpperCase();
    var path = request.url;

    var handler = this._handlerFor(verb, path, request);

    if (handler) {
      handler.handler.numberOfCalls++;
      var async = handler.handler.async;
      this.handledRequests.push(request);

      try {
        var statusHeadersAndBody = handler.handler(request);
        if (!isArray(statusHeadersAndBody)) {
          var note = 'Remember to `return [status, headers, body];` in your route handler.';
          throw new Error('Nothing returned by handler for ' + path + '. ' + note);
        }

        var status = statusHeadersAndBody[0],
            headers = this.prepareHeaders(statusHeadersAndBody[1]),
            body = this.prepareBody(statusHeadersAndBody[2], headers),
            pretender = this;

        this.handleResponse(request, async, function() {
          request.respond(status, headers, body);
          pretender.handledRequest(verb, path, request);
        });
      } catch (error) {
        this.erroredRequest(verb, path, request, error);
        this.resolve(request);
      }
    } else {
      this.unhandledRequests.push(request);
      this.unhandledRequest(verb, path, request);
    }
  },
  handleResponse: function handleResponse(request, strategy, callback) {
    var delay = typeof strategy === 'function' ? strategy() : strategy;
    delay = typeof delay === 'boolean' || typeof delay === 'number' ? delay : 0;

    if (delay === false) {
      callback();
    } else {
      var pretender = this;
      pretender.requestReferences.push({
        request: request,
        callback: callback
      });

      if (delay !== true) {
        scheduleProgressEvent(request, new Date(), delay);
        setTimeout(function() {
          pretender.resolve(request);
        }, delay);
      }
    }
  },
  resolve: function resolve(request) {
    for (var i = 0, len = this.requestReferences.length; i < len; i++) {
      var res = this.requestReferences[i];
      if (res.request === request) {
        res.callback();
        this.requestReferences.splice(i, 1);
        break;
      }
    }
  },
  requiresManualResolution: function(verb, path) {
    var handler = this._handlerFor(verb.toUpperCase(), path, {});
    if (!handler) { return false; }

    var async = handler.handler.async;
    return typeof async === 'function' ? async() === true : async === true;
  },
  prepareBody: function(body) { return body; },
  prepareHeaders: function(headers) { return headers; },
  handledRequest: function(/* verb, path, request */) { /* no-op */},
  passthroughRequest: function(/* verb, path, request */) { /* no-op */},
  unhandledRequest: function(verb, path/*, request */) {
    throw new Error('Pretender intercepted ' + verb + ' ' +
      path + ' but no handler was defined for this type of request');
  },
  erroredRequest: function(verb, path, request, error) {
    error.message = 'Pretender intercepted ' + verb + ' ' +
      path + ' but encountered an error: ' + error.message;
    throw error;
  },
  _handlerFor: function(verb, url, request) {
    var registry = this.hosts.forURL(url)[verb];
    var matches = registry.recognize(parseURL(url).fullpath);

    var match = matches ? matches[0] : null;
    if (match) {
      request.params = match.params;
      request.queryParams = matches.queryParams;
    }

    return match;
  },
  shutdown: function shutdown() {
    global.XMLHttpRequest = this._nativeXMLHttpRequest;
    global.Headers = this._nativeHeaders;
    global.Request = this._nativeRequest;
    global.Response = this._nativeResponse;
    global.fetch = this._nativeFetch;

    // 'stop' the server
    this.running = false;
  }
};

Pretender.parseURL = parseURL;
Pretender.Hosts = Hosts;
Pretender.Registry = Registry;

module.exports = Pretender;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"fetchme":38,"route-recognizer":53,"url":112,"xhr-pretender":116}],38:[function(require,module,exports){
(function (global){
module.exports = function createFetch(XMLHttpRequest, self) {
  'use strict';

  if (self == null) {
    self = global
  }

  var support = {
    searchParams: 'URLSearchParams' in self,
    iterable: 'Symbol' in self && 'iterator' in Symbol,
    blob: 'FileReader' in self && 'Blob' in self && (function() {
      try {
        new Blob()
        return true
      } catch(e) {
        return false
      }
    })(),
    formData: 'FormData' in self,
    arrayBuffer: 'ArrayBuffer' in self
  }

  function normalizeName(name) {
    if (typeof name !== 'string') {
      name = String(name)
    }
    if (/[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(name)) {
      throw new TypeError('Invalid character in header field name')
    }
    return name.toLowerCase()
  }

  function normalizeValue(value) {
    if (typeof value !== 'string') {
      value = String(value)
    }
    return value
  }

  // Build a destructive iterator for the value list
  function iteratorFor(items) {
    var iterator = {
      next: function() {
        var value = items.shift()
        return {done: value === undefined, value: value}
      }
    }

    if (support.iterable) {
      iterator[Symbol.iterator] = function() {
        return iterator
      }
    }

    return iterator
  }

  function Headers(headers) {
    this.map = {}

    if (headers instanceof Headers) {
      headers.forEach(function(value, name) {
        this.append(name, value)
      }, this)

    } else if (headers) {
      Object.getOwnPropertyNames(headers).forEach(function(name) {
        this.append(name, headers[name])
      }, this)
    }
  }

  Headers.prototype.append = function(name, value) {
    name = normalizeName(name)
    value = normalizeValue(value)
    var list = this.map[name]
    if (!list) {
      list = []
      this.map[name] = list
    }
    list.push(value)
  }

  Headers.prototype['delete'] = function(name) {
    delete this.map[normalizeName(name)]
  }

  Headers.prototype.get = function(name) {
    var values = this.map[normalizeName(name)]
    return values ? values[0] : null
  }

  Headers.prototype.getAll = function(name) {
    return this.map[normalizeName(name)] || []
  }

  Headers.prototype.has = function(name) {
    return this.map.hasOwnProperty(normalizeName(name))
  }

  Headers.prototype.set = function(name, value) {
    this.map[normalizeName(name)] = [normalizeValue(value)]
  }

  Headers.prototype.forEach = function(callback, thisArg) {
    Object.getOwnPropertyNames(this.map).forEach(function(name) {
      this.map[name].forEach(function(value) {
        callback.call(thisArg, value, name, this)
      }, this)
    }, this)
  }

  Headers.prototype.keys = function() {
    var items = []
    this.forEach(function(value, name) { items.push(name) })
    return iteratorFor(items)
  }

  Headers.prototype.values = function() {
    var items = []
    this.forEach(function(value) { items.push(value) })
    return iteratorFor(items)
  }

  Headers.prototype.entries = function() {
    var items = []
    this.forEach(function(value, name) { items.push([name, value]) })
    return iteratorFor(items)
  }

  if (support.iterable) {
    Headers.prototype[Symbol.iterator] = Headers.prototype.entries
  }

  function consumed(body) {
    if (body.bodyUsed) {
      return Promise.reject(new TypeError('Already read'))
    }
    body.bodyUsed = true
  }

  function fileReaderReady(reader) {
    return new Promise(function(resolve, reject) {
      reader.onload = function() {
        resolve(reader.result)
      }
      reader.onerror = function() {
        reject(reader.error)
      }
    })
  }

  function readBlobAsArrayBuffer(blob) {
    var reader = new FileReader()
    reader.readAsArrayBuffer(blob)
    return fileReaderReady(reader)
  }

  function readBlobAsText(blob) {
    var reader = new FileReader()
    reader.readAsText(blob)
    return fileReaderReady(reader)
  }

  function Body() {
    this.bodyUsed = false

    this._initBody = function(body) {
      this._bodyInit = body
      if (typeof body === 'string') {
        this._bodyText = body
      } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
        this._bodyBlob = body
      } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
        this._bodyFormData = body
      } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
        this._bodyText = body.toString()
      } else if (!body) {
        this._bodyText = ''
      } else if (support.arrayBuffer && ArrayBuffer.prototype.isPrototypeOf(body)) {
        // Only support ArrayBuffers for POST method.
        // Receiving ArrayBuffers happens via Blobs, instead.
      } else {
        throw new Error('unsupported BodyInit type')
      }

      if (!this.headers.get('content-type')) {
        if (typeof body === 'string') {
          this.headers.set('content-type', 'text/plain;charset=UTF-8')
        } else if (this._bodyBlob && this._bodyBlob.type) {
          this.headers.set('content-type', this._bodyBlob.type)
        } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
          this.headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8')
        }
      }
    }

    if (support.blob) {
      this.blob = function() {
        var rejected = consumed(this)
        if (rejected) {
          return rejected
        }

        if (this._bodyBlob) {
          return Promise.resolve(this._bodyBlob)
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as blob')
        } else {
          return Promise.resolve(new Blob([this._bodyText]))
        }
      }

      this.arrayBuffer = function() {
        return this.blob().then(readBlobAsArrayBuffer)
      }

      this.text = function() {
        var rejected = consumed(this)
        if (rejected) {
          return rejected
        }

        if (this._bodyBlob) {
          return readBlobAsText(this._bodyBlob)
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as text')
        } else {
          return Promise.resolve(this._bodyText)
        }
      }
    } else {
      this.text = function() {
        var rejected = consumed(this)
        return rejected ? rejected : Promise.resolve(this._bodyText)
      }
    }

    if (support.formData) {
      this.formData = function() {
        return this.text().then(decode)
      }
    }

    this.json = function() {
      return this.text().then(JSON.parse)
    }

    return this
  }

  // HTTP methods whose capitalization should be normalized
  var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT']

  function normalizeMethod(method) {
    var upcased = method.toUpperCase()
    return (methods.indexOf(upcased) > -1) ? upcased : method
  }

  function Request(input, options) {
    options = options || {}
    var body = options.body
    if (Request.prototype.isPrototypeOf(input)) {
      if (input.bodyUsed) {
        throw new TypeError('Already read')
      }
      this.url = input.url
      this.credentials = input.credentials
      if (!options.headers) {
        this.headers = new Headers(input.headers)
      }
      this.method = input.method
      this.mode = input.mode
      if (!body) {
        body = input._bodyInit
        input.bodyUsed = true
      }
    } else {
      this.url = input
    }

    this.credentials = options.credentials || this.credentials || 'omit'
    if (options.headers || !this.headers) {
      this.headers = new Headers(options.headers)
    }
    this.method = normalizeMethod(options.method || this.method || 'GET')
    this.mode = options.mode || this.mode || null
    this.referrer = null

    if ((this.method === 'GET' || this.method === 'HEAD') && body) {
      throw new TypeError('Body not allowed for GET or HEAD requests')
    }
    this._initBody(body)
  }

  Request.prototype.clone = function() {
    return new Request(this)
  }

  function decode(body) {
    var form = new FormData()
    body.trim().split('&').forEach(function(bytes) {
      if (bytes) {
        var split = bytes.split('=')
        var name = split.shift().replace(/\+/g, ' ')
        var value = split.join('=').replace(/\+/g, ' ')
        form.append(decodeURIComponent(name), decodeURIComponent(value))
      }
    })
    return form
  }

  function headers(xhr) {
    var head = new Headers()
    var pairs = (xhr.getAllResponseHeaders() || '').trim().split('\n')
    pairs.forEach(function(header) {
      var split = header.trim().split(':')
      var key = split.shift().trim()
      var value = split.join(':').trim()
      head.append(key, value)
    })
    return head
  }

  Body.call(Request.prototype)

  function Response(bodyInit, options) {
    if (!options) {
      options = {}
    }

    this.type = 'default'
    this.status = options.status
    this.ok = this.status >= 200 && this.status < 300
    this.statusText = options.statusText
    this.headers = options.headers instanceof Headers ? options.headers : new Headers(options.headers)
    this.url = options.url || ''
    this._initBody(bodyInit)
  }

  Body.call(Response.prototype)

  Response.prototype.clone = function() {
    return new Response(this._bodyInit, {
      status: this.status,
      statusText: this.statusText,
      headers: new Headers(this.headers),
      url: this.url
    })
  }

  Response.error = function() {
    var response = new Response(null, {status: 0, statusText: ''})
    response.type = 'error'
    return response
  }

  var redirectStatuses = [301, 302, 303, 307, 308]

  Response.redirect = function(url, status) {
    if (redirectStatuses.indexOf(status) === -1) {
      throw new RangeError('Invalid status code')
    }

    return new Response(null, {status: status, headers: {location: url}})
  }

  function fetch(input, init) {
    return new Promise(function(resolve, reject) {
      var request
      if (Request.prototype.isPrototypeOf(input) && !init) {
        request = input
      } else {
        request = new Request(input, init)
      }

      var xhr = new XMLHttpRequest()

      function responseURL() {
        if ('responseURL' in xhr) {
          return xhr.responseURL
        }

        // Avoid security warnings on getResponseHeader when not allowed by CORS
        if (/^X-Request-URL:/m.test(xhr.getAllResponseHeaders())) {
          return xhr.getResponseHeader('X-Request-URL')
        }

        return
      }

      xhr.onload = function() {
        var options = {
          status: xhr.status,
          statusText: xhr.statusText,
          headers: headers(xhr),
          url: responseURL()
        }
        var body = 'response' in xhr ? xhr.response : xhr.responseText
        resolve(new Response(body, options))
      }

      xhr.onerror = function() {
        reject(new TypeError('Network request failed'))
      }

      xhr.ontimeout = function() {
        reject(new TypeError('Network request failed'))
      }

      xhr.open(request.method, request.url, true)

      if (request.credentials === 'include') {
        xhr.withCredentials = true
      }

      if ('responseType' in xhr && support.blob) {
        xhr.responseType = 'blob'
      }

      request.headers.forEach(function(value, name) {
        xhr.setRequestHeader(name, value)
      })

      xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit)
    })
  }
  fetch.polyfill = true

  return {
    Headers: Headers,
    Request: Request,
    Response: Response,
    fetch: fetch
  }
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],39:[function(require,module,exports){
(function (global){
((typeof define === "function" && define.amd && function (m) {
    define("formatio", ["samsam"], m);
}) || (typeof module === "object" && function (m) {
    module.exports = m(require("samsam"));
}) || function (m) { this.formatio = m(this.samsam); }
)(function (samsam) {
    "use strict";

    var formatio = {
        excludeConstructors: ["Object", /^.$/],
        quoteStrings: true,
        limitChildrenCount: 0
    };

    var hasOwn = Object.prototype.hasOwnProperty;

    var specialObjects = [];
    if (typeof global !== "undefined") {
        specialObjects.push({ object: global, value: "[object global]" });
    }
    if (typeof document !== "undefined") {
        specialObjects.push({
            object: document,
            value: "[object HTMLDocument]"
        });
    }
    if (typeof window !== "undefined") {
        specialObjects.push({ object: window, value: "[object Window]" });
    }

    function functionName(func) {
        if (!func) { return ""; }
        if (func.displayName) { return func.displayName; }
        if (func.name) { return func.name; }
        var matches = func.toString().match(/function\s+([^\(]+)/m);
        return (matches && matches[1]) || "";
    }

    function constructorName(f, object) {
        var name = functionName(object && object.constructor);
        var excludes = f.excludeConstructors ||
                formatio.excludeConstructors || [];

        var i, l;
        for (i = 0, l = excludes.length; i < l; ++i) {
            if (typeof excludes[i] === "string" && excludes[i] === name) {
                return "";
            } else if (excludes[i].test && excludes[i].test(name)) {
                return "";
            }
        }

        return name;
    }

    function isCircular(object, objects) {
        if (typeof object !== "object") { return false; }
        var i, l;
        for (i = 0, l = objects.length; i < l; ++i) {
            if (objects[i] === object) { return true; }
        }
        return false;
    }

    function ascii(f, object, processed, indent) {
        if (typeof object === "string") {
            var qs = f.quoteStrings;
            var quote = typeof qs !== "boolean" || qs;
            return processed || quote ? '"' + object + '"' : object;
        }

        if (typeof object === "function" && !(object instanceof RegExp)) {
            return ascii.func(object);
        }

        processed = processed || [];

        if (isCircular(object, processed)) { return "[Circular]"; }

        if (Object.prototype.toString.call(object) === "[object Array]") {
            return ascii.array.call(f, object, processed);
        }

        if (!object) { return String((1/object) === -Infinity ? "-0" : object); }
        if (samsam.isElement(object)) { return ascii.element(object); }

        if (typeof object.toString === "function" &&
                object.toString !== Object.prototype.toString) {
            return object.toString();
        }

        var i, l;
        for (i = 0, l = specialObjects.length; i < l; i++) {
            if (object === specialObjects[i].object) {
                return specialObjects[i].value;
            }
        }

        return ascii.object.call(f, object, processed, indent);
    }

    ascii.func = function (func) {
        return "function " + functionName(func) + "() {}";
    };

    ascii.array = function (array, processed) {
        processed = processed || [];
        processed.push(array);
        var pieces = [];
        var i, l;
        l = (this.limitChildrenCount > 0) ? 
            Math.min(this.limitChildrenCount, array.length) : array.length;

        for (i = 0; i < l; ++i) {
            pieces.push(ascii(this, array[i], processed));
        }

        if(l < array.length)
            pieces.push("[... " + (array.length - l) + " more elements]");

        return "[" + pieces.join(", ") + "]";
    };

    ascii.object = function (object, processed, indent) {
        processed = processed || [];
        processed.push(object);
        indent = indent || 0;
        var pieces = [], properties = samsam.keys(object).sort();
        var length = 3;
        var prop, str, obj, i, k, l;
        l = (this.limitChildrenCount > 0) ? 
            Math.min(this.limitChildrenCount, properties.length) : properties.length;

        for (i = 0; i < l; ++i) {
            prop = properties[i];
            obj = object[prop];

            if (isCircular(obj, processed)) {
                str = "[Circular]";
            } else {
                str = ascii(this, obj, processed, indent + 2);
            }

            str = (/\s/.test(prop) ? '"' + prop + '"' : prop) + ": " + str;
            length += str.length;
            pieces.push(str);
        }

        var cons = constructorName(this, object);
        var prefix = cons ? "[" + cons + "] " : "";
        var is = "";
        for (i = 0, k = indent; i < k; ++i) { is += " "; }

        if(l < properties.length)
            pieces.push("[... " + (properties.length - l) + " more elements]");

        if (length + indent > 80) {
            return prefix + "{\n  " + is + pieces.join(",\n  " + is) + "\n" +
                is + "}";
        }
        return prefix + "{ " + pieces.join(", ") + " }";
    };

    ascii.element = function (element) {
        var tagName = element.tagName.toLowerCase();
        var attrs = element.attributes, attr, pairs = [], attrName, i, l, val;

        for (i = 0, l = attrs.length; i < l; ++i) {
            attr = attrs.item(i);
            attrName = attr.nodeName.toLowerCase().replace("html:", "");
            val = attr.nodeValue;
            if (attrName !== "contenteditable" || val !== "inherit") {
                if (!!val) { pairs.push(attrName + "=\"" + val + "\""); }
            }
        }

        var formatted = "<" + tagName + (pairs.length > 0 ? " " : "");
        var content = element.innerHTML;

        if (content.length > 20) {
            content = content.substr(0, 20) + "[...]";
        }

        var res = formatted + pairs.join(" ") + ">" + content +
                "</" + tagName + ">";

        return res.replace(/ contentEditable="inherit"/, "");
    };

    function Formatio(options) {
        for (var opt in options) {
            this[opt] = options[opt];
        }
    }

    Formatio.prototype = {
        functionName: functionName,

        configure: function (options) {
            return new Formatio(options);
        },

        constructorName: function (object) {
            return constructorName(this, object);
        },

        ascii: function (object, processed, indent) {
            return ascii(this, object, processed, indent);
        }
    };

    return Formatio.prototype;
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"samsam":54}],40:[function(require,module,exports){
/*
 *  Copyright 2011 Twitter, Inc.
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

(function (Hogan) {
  // Setup regex  assignments
  // remove whitespace according to Mustache spec
  var rIsWhitespace = /\S/,
      rQuot = /\"/g,
      rNewline =  /\n/g,
      rCr = /\r/g,
      rSlash = /\\/g,
      rLineSep = /\u2028/,
      rParagraphSep = /\u2029/;

  Hogan.tags = {
    '#': 1, '^': 2, '<': 3, '$': 4,
    '/': 5, '!': 6, '>': 7, '=': 8, '_v': 9,
    '{': 10, '&': 11, '_t': 12
  };

  Hogan.scan = function scan(text, delimiters) {
    var len = text.length,
        IN_TEXT = 0,
        IN_TAG_TYPE = 1,
        IN_TAG = 2,
        state = IN_TEXT,
        tagType = null,
        tag = null,
        buf = '',
        tokens = [],
        seenTag = false,
        i = 0,
        lineStart = 0,
        otag = '{{',
        ctag = '}}';

    function addBuf() {
      if (buf.length > 0) {
        tokens.push({tag: '_t', text: new String(buf)});
        buf = '';
      }
    }

    function lineIsWhitespace() {
      var isAllWhitespace = true;
      for (var j = lineStart; j < tokens.length; j++) {
        isAllWhitespace =
          (Hogan.tags[tokens[j].tag] < Hogan.tags['_v']) ||
          (tokens[j].tag == '_t' && tokens[j].text.match(rIsWhitespace) === null);
        if (!isAllWhitespace) {
          return false;
        }
      }

      return isAllWhitespace;
    }

    function filterLine(haveSeenTag, noNewLine) {
      addBuf();

      if (haveSeenTag && lineIsWhitespace()) {
        for (var j = lineStart, next; j < tokens.length; j++) {
          if (tokens[j].text) {
            if ((next = tokens[j+1]) && next.tag == '>') {
              // set indent to token value
              next.indent = tokens[j].text.toString()
            }
            tokens.splice(j, 1);
          }
        }
      } else if (!noNewLine) {
        tokens.push({tag:'\n'});
      }

      seenTag = false;
      lineStart = tokens.length;
    }

    function changeDelimiters(text, index) {
      var close = '=' + ctag,
          closeIndex = text.indexOf(close, index),
          delimiters = trim(
            text.substring(text.indexOf('=', index) + 1, closeIndex)
          ).split(' ');

      otag = delimiters[0];
      ctag = delimiters[delimiters.length - 1];

      return closeIndex + close.length - 1;
    }

    if (delimiters) {
      delimiters = delimiters.split(' ');
      otag = delimiters[0];
      ctag = delimiters[1];
    }

    for (i = 0; i < len; i++) {
      if (state == IN_TEXT) {
        if (tagChange(otag, text, i)) {
          --i;
          addBuf();
          state = IN_TAG_TYPE;
        } else {
          if (text.charAt(i) == '\n') {
            filterLine(seenTag);
          } else {
            buf += text.charAt(i);
          }
        }
      } else if (state == IN_TAG_TYPE) {
        i += otag.length - 1;
        tag = Hogan.tags[text.charAt(i + 1)];
        tagType = tag ? text.charAt(i + 1) : '_v';
        if (tagType == '=') {
          i = changeDelimiters(text, i);
          state = IN_TEXT;
        } else {
          if (tag) {
            i++;
          }
          state = IN_TAG;
        }
        seenTag = i;
      } else {
        if (tagChange(ctag, text, i)) {
          tokens.push({tag: tagType, n: trim(buf), otag: otag, ctag: ctag,
                       i: (tagType == '/') ? seenTag - otag.length : i + ctag.length});
          buf = '';
          i += ctag.length - 1;
          state = IN_TEXT;
          if (tagType == '{') {
            if (ctag == '}}') {
              i++;
            } else {
              cleanTripleStache(tokens[tokens.length - 1]);
            }
          }
        } else {
          buf += text.charAt(i);
        }
      }
    }

    filterLine(seenTag, true);

    return tokens;
  }

  function cleanTripleStache(token) {
    if (token.n.substr(token.n.length - 1) === '}') {
      token.n = token.n.substring(0, token.n.length - 1);
    }
  }

  function trim(s) {
    if (s.trim) {
      return s.trim();
    }

    return s.replace(/^\s*|\s*$/g, '');
  }

  function tagChange(tag, text, index) {
    if (text.charAt(index) != tag.charAt(0)) {
      return false;
    }

    for (var i = 1, l = tag.length; i < l; i++) {
      if (text.charAt(index + i) != tag.charAt(i)) {
        return false;
      }
    }

    return true;
  }

  // the tags allowed inside super templates
  var allowedInSuper = {'_t': true, '\n': true, '$': true, '/': true};

  function buildTree(tokens, kind, stack, customTags) {
    var instructions = [],
        opener = null,
        tail = null,
        token = null;

    tail = stack[stack.length - 1];

    while (tokens.length > 0) {
      token = tokens.shift();

      if (tail && tail.tag == '<' && !(token.tag in allowedInSuper)) {
        throw new Error('Illegal content in < super tag.');
      }

      if (Hogan.tags[token.tag] <= Hogan.tags['$'] || isOpener(token, customTags)) {
        stack.push(token);
        token.nodes = buildTree(tokens, token.tag, stack, customTags);
      } else if (token.tag == '/') {
        if (stack.length === 0) {
          throw new Error('Closing tag without opener: /' + token.n);
        }
        opener = stack.pop();
        if (token.n != opener.n && !isCloser(token.n, opener.n, customTags)) {
          throw new Error('Nesting error: ' + opener.n + ' vs. ' + token.n);
        }
        opener.end = token.i;
        return instructions;
      } else if (token.tag == '\n') {
        token.last = (tokens.length == 0) || (tokens[0].tag == '\n');
      }

      instructions.push(token);
    }

    if (stack.length > 0) {
      throw new Error('missing closing tag: ' + stack.pop().n);
    }

    return instructions;
  }

  function isOpener(token, tags) {
    for (var i = 0, l = tags.length; i < l; i++) {
      if (tags[i].o == token.n) {
        token.tag = '#';
        return true;
      }
    }
  }

  function isCloser(close, open, tags) {
    for (var i = 0, l = tags.length; i < l; i++) {
      if (tags[i].c == close && tags[i].o == open) {
        return true;
      }
    }
  }

  function stringifySubstitutions(obj) {
    var items = [];
    for (var key in obj) {
      items.push('"' + esc(key) + '": function(c,p,t,i) {' + obj[key] + '}');
    }
    return "{ " + items.join(",") + " }";
  }

  function stringifyPartials(codeObj) {
    var partials = [];
    for (var key in codeObj.partials) {
      partials.push('"' + esc(key) + '":{name:"' + esc(codeObj.partials[key].name) + '", ' + stringifyPartials(codeObj.partials[key]) + "}");
    }
    return "partials: {" + partials.join(",") + "}, subs: " + stringifySubstitutions(codeObj.subs);
  }

  Hogan.stringify = function(codeObj, text, options) {
    return "{code: function (c,p,i) { " + Hogan.wrapMain(codeObj.code) + " }," + stringifyPartials(codeObj) +  "}";
  }

  var serialNo = 0;
  Hogan.generate = function(tree, text, options) {
    serialNo = 0;
    var context = { code: '', subs: {}, partials: {} };
    Hogan.walk(tree, context);

    if (options.asString) {
      return this.stringify(context, text, options);
    }

    return this.makeTemplate(context, text, options);
  }

  Hogan.wrapMain = function(code) {
    return 'var t=this;t.b(i=i||"");' + code + 'return t.fl();';
  }

  Hogan.template = Hogan.Template;

  Hogan.makeTemplate = function(codeObj, text, options) {
    var template = this.makePartials(codeObj);
    template.code = new Function('c', 'p', 'i', this.wrapMain(codeObj.code));
    return new this.template(template, text, this, options);
  }

  Hogan.makePartials = function(codeObj) {
    var key, template = {subs: {}, partials: codeObj.partials, name: codeObj.name};
    for (key in template.partials) {
      template.partials[key] = this.makePartials(template.partials[key]);
    }
    for (key in codeObj.subs) {
      template.subs[key] = new Function('c', 'p', 't', 'i', codeObj.subs[key]);
    }
    return template;
  }

  function esc(s) {
    return s.replace(rSlash, '\\\\')
            .replace(rQuot, '\\\"')
            .replace(rNewline, '\\n')
            .replace(rCr, '\\r')
            .replace(rLineSep, '\\u2028')
            .replace(rParagraphSep, '\\u2029');
  }

  function chooseMethod(s) {
    return (~s.indexOf('.')) ? 'd' : 'f';
  }

  function createPartial(node, context) {
    var prefix = "<" + (context.prefix || "");
    var sym = prefix + node.n + serialNo++;
    context.partials[sym] = {name: node.n, partials: {}};
    context.code += 't.b(t.rp("' +  esc(sym) + '",c,p,"' + (node.indent || '') + '"));';
    return sym;
  }

  Hogan.codegen = {
    '#': function(node, context) {
      context.code += 'if(t.s(t.' + chooseMethod(node.n) + '("' + esc(node.n) + '",c,p,1),' +
                      'c,p,0,' + node.i + ',' + node.end + ',"' + node.otag + " " + node.ctag + '")){' +
                      't.rs(c,p,' + 'function(c,p,t){';
      Hogan.walk(node.nodes, context);
      context.code += '});c.pop();}';
    },

    '^': function(node, context) {
      context.code += 'if(!t.s(t.' + chooseMethod(node.n) + '("' + esc(node.n) + '",c,p,1),c,p,1,0,0,"")){';
      Hogan.walk(node.nodes, context);
      context.code += '};';
    },

    '>': createPartial,
    '<': function(node, context) {
      var ctx = {partials: {}, code: '', subs: {}, inPartial: true};
      Hogan.walk(node.nodes, ctx);
      var template = context.partials[createPartial(node, context)];
      template.subs = ctx.subs;
      template.partials = ctx.partials;
    },

    '$': function(node, context) {
      var ctx = {subs: {}, code: '', partials: context.partials, prefix: node.n};
      Hogan.walk(node.nodes, ctx);
      context.subs[node.n] = ctx.code;
      if (!context.inPartial) {
        context.code += 't.sub("' + esc(node.n) + '",c,p,i);';
      }
    },

    '\n': function(node, context) {
      context.code += write('"\\n"' + (node.last ? '' : ' + i'));
    },

    '_v': function(node, context) {
      context.code += 't.b(t.v(t.' + chooseMethod(node.n) + '("' + esc(node.n) + '",c,p,0)));';
    },

    '_t': function(node, context) {
      context.code += write('"' + esc(node.text) + '"');
    },

    '{': tripleStache,

    '&': tripleStache
  }

  function tripleStache(node, context) {
    context.code += 't.b(t.t(t.' + chooseMethod(node.n) + '("' + esc(node.n) + '",c,p,0)));';
  }

  function write(s) {
    return 't.b(' + s + ');';
  }

  Hogan.walk = function(nodelist, context) {
    var func;
    for (var i = 0, l = nodelist.length; i < l; i++) {
      func = Hogan.codegen[nodelist[i].tag];
      func && func(nodelist[i], context);
    }
    return context;
  }

  Hogan.parse = function(tokens, text, options) {
    options = options || {};
    return buildTree(tokens, '', [], options.sectionTags || []);
  }

  Hogan.cache = {};

  Hogan.cacheKey = function(text, options) {
    return [text, !!options.asString, !!options.disableLambda, options.delimiters, !!options.modelGet].join('||');
  }

  Hogan.compile = function(text, options) {
    options = options || {};
    var key = Hogan.cacheKey(text, options);
    var template = this.cache[key];

    if (template) {
      var partials = template.partials;
      for (var name in partials) {
        delete partials[name].instance;
      }
      return template;
    }

    template = this.generate(this.parse(this.scan(text, options.delimiters), text, options), text, options);
    return this.cache[key] = template;
  }
})(typeof exports !== 'undefined' ? exports : Hogan);

},{}],41:[function(require,module,exports){
/*
 *  Copyright 2011 Twitter, Inc.
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

// This file is for use with Node.js. See dist/ for browser files.

var Hogan = require('./compiler');
Hogan.Template = require('./template').Template;
Hogan.template = Hogan.Template;
module.exports = Hogan;

},{"./compiler":40,"./template":42}],42:[function(require,module,exports){
/*
 *  Copyright 2011 Twitter, Inc.
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

var Hogan = {};

(function (Hogan) {
  Hogan.Template = function (codeObj, text, compiler, options) {
    codeObj = codeObj || {};
    this.r = codeObj.code || this.r;
    this.c = compiler;
    this.options = options || {};
    this.text = text || '';
    this.partials = codeObj.partials || {};
    this.subs = codeObj.subs || {};
    this.buf = '';
  }

  Hogan.Template.prototype = {
    // render: replaced by generated code.
    r: function (context, partials, indent) { return ''; },

    // variable escaping
    v: hoganEscape,

    // triple stache
    t: coerceToString,

    render: function render(context, partials, indent) {
      return this.ri([context], partials || {}, indent);
    },

    // render internal -- a hook for overrides that catches partials too
    ri: function (context, partials, indent) {
      return this.r(context, partials, indent);
    },

    // ensurePartial
    ep: function(symbol, partials) {
      var partial = this.partials[symbol];

      // check to see that if we've instantiated this partial before
      var template = partials[partial.name];
      if (partial.instance && partial.base == template) {
        return partial.instance;
      }

      if (typeof template == 'string') {
        if (!this.c) {
          throw new Error("No compiler available.");
        }
        template = this.c.compile(template, this.options);
      }

      if (!template) {
        return null;
      }

      // We use this to check whether the partials dictionary has changed
      this.partials[symbol].base = template;

      if (partial.subs) {
        // Make sure we consider parent template now
        if (!partials.stackText) partials.stackText = {};
        for (key in partial.subs) {
          if (!partials.stackText[key]) {
            partials.stackText[key] = (this.activeSub !== undefined && partials.stackText[this.activeSub]) ? partials.stackText[this.activeSub] : this.text;
          }
        }
        template = createSpecializedPartial(template, partial.subs, partial.partials,
          this.stackSubs, this.stackPartials, partials.stackText);
      }
      this.partials[symbol].instance = template;

      return template;
    },

    // tries to find a partial in the current scope and render it
    rp: function(symbol, context, partials, indent) {
      var partial = this.ep(symbol, partials);
      if (!partial) {
        return '';
      }

      return partial.ri(context, partials, indent);
    },

    // render a section
    rs: function(context, partials, section) {
      var tail = context[context.length - 1];

      if (!isArray(tail)) {
        section(context, partials, this);
        return;
      }

      for (var i = 0; i < tail.length; i++) {
        context.push(tail[i]);
        section(context, partials, this);
        context.pop();
      }
    },

    // maybe start a section
    s: function(val, ctx, partials, inverted, start, end, tags) {
      var pass;

      if (isArray(val) && val.length === 0) {
        return false;
      }

      if (typeof val == 'function') {
        val = this.ms(val, ctx, partials, inverted, start, end, tags);
      }

      pass = !!val;

      if (!inverted && pass && ctx) {
        ctx.push((typeof val == 'object') ? val : ctx[ctx.length - 1]);
      }

      return pass;
    },

    // find values with dotted names
    d: function(key, ctx, partials, returnFound) {
      var found,
          names = key.split('.'),
          val = this.f(names[0], ctx, partials, returnFound),
          doModelGet = this.options.modelGet,
          cx = null;

      if (key === '.' && isArray(ctx[ctx.length - 2])) {
        val = ctx[ctx.length - 1];
      } else {
        for (var i = 1; i < names.length; i++) {
          found = findInScope(names[i], val, doModelGet);
          if (found !== undefined) {
            cx = val;
            val = found;
          } else {
            val = '';
          }
        }
      }

      if (returnFound && !val) {
        return false;
      }

      if (!returnFound && typeof val == 'function') {
        ctx.push(cx);
        val = this.mv(val, ctx, partials);
        ctx.pop();
      }

      return val;
    },

    // find values with normal names
    f: function(key, ctx, partials, returnFound) {
      var val = false,
          v = null,
          found = false,
          doModelGet = this.options.modelGet;

      for (var i = ctx.length - 1; i >= 0; i--) {
        v = ctx[i];
        val = findInScope(key, v, doModelGet);
        if (val !== undefined) {
          found = true;
          break;
        }
      }

      if (!found) {
        return (returnFound) ? false : "";
      }

      if (!returnFound && typeof val == 'function') {
        val = this.mv(val, ctx, partials);
      }

      return val;
    },

    // higher order templates
    ls: function(func, cx, partials, text, tags) {
      var oldTags = this.options.delimiters;

      this.options.delimiters = tags;
      this.b(this.ct(coerceToString(func.call(cx, text)), cx, partials));
      this.options.delimiters = oldTags;

      return false;
    },

    // compile text
    ct: function(text, cx, partials) {
      if (this.options.disableLambda) {
        throw new Error('Lambda features disabled.');
      }
      return this.c.compile(text, this.options).render(cx, partials);
    },

    // template result buffering
    b: function(s) { this.buf += s; },

    fl: function() { var r = this.buf; this.buf = ''; return r; },

    // method replace section
    ms: function(func, ctx, partials, inverted, start, end, tags) {
      var textSource,
          cx = ctx[ctx.length - 1],
          result = func.call(cx);

      if (typeof result == 'function') {
        if (inverted) {
          return true;
        } else {
          textSource = (this.activeSub && this.subsText && this.subsText[this.activeSub]) ? this.subsText[this.activeSub] : this.text;
          return this.ls(result, cx, partials, textSource.substring(start, end), tags);
        }
      }

      return result;
    },

    // method replace variable
    mv: function(func, ctx, partials) {
      var cx = ctx[ctx.length - 1];
      var result = func.call(cx);

      if (typeof result == 'function') {
        return this.ct(coerceToString(result.call(cx)), cx, partials);
      }

      return result;
    },

    sub: function(name, context, partials, indent) {
      var f = this.subs[name];
      if (f) {
        this.activeSub = name;
        f(context, partials, this, indent);
        this.activeSub = false;
      }
    }

  };

  //Find a key in an object
  function findInScope(key, scope, doModelGet) {
    var val;

    if (scope && typeof scope == 'object') {

      if (scope[key] !== undefined) {
        val = scope[key];

      // try lookup with get for backbone or similar model data
      } else if (doModelGet && scope.get && typeof scope.get == 'function') {
        val = scope.get(key);
      }
    }

    return val;
  }

  function createSpecializedPartial(instance, subs, partials, stackSubs, stackPartials, stackText) {
    function PartialTemplate() {};
    PartialTemplate.prototype = instance;
    function Substitutions() {};
    Substitutions.prototype = instance.subs;
    var key;
    var partial = new PartialTemplate();
    partial.subs = new Substitutions();
    partial.subsText = {};  //hehe. substext.
    partial.buf = '';

    stackSubs = stackSubs || {};
    partial.stackSubs = stackSubs;
    partial.subsText = stackText;
    for (key in subs) {
      if (!stackSubs[key]) stackSubs[key] = subs[key];
    }
    for (key in stackSubs) {
      partial.subs[key] = stackSubs[key];
    }

    stackPartials = stackPartials || {};
    partial.stackPartials = stackPartials;
    for (key in partials) {
      if (!stackPartials[key]) stackPartials[key] = partials[key];
    }
    for (key in stackPartials) {
      partial.partials[key] = stackPartials[key];
    }

    return partial;
  }

  var rAmp = /&/g,
      rLt = /</g,
      rGt = />/g,
      rApos = /\'/g,
      rQuot = /\"/g,
      hChars = /[&<>\"\']/;

  function coerceToString(val) {
    return String((val === null || val === undefined) ? '' : val);
  }

  function hoganEscape(str) {
    str = coerceToString(str);
    return hChars.test(str) ?
      str
        .replace(rAmp, '&amp;')
        .replace(rLt, '&lt;')
        .replace(rGt, '&gt;')
        .replace(rApos, '&#39;')
        .replace(rQuot, '&quot;') :
      str;
  }

  var isArray = Array.isArray || function(a) {
    return Object.prototype.toString.call(a) === '[object Array]';
  };

})(typeof exports !== 'undefined' ? exports : Hogan);

},{}],43:[function(require,module,exports){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],44:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],45:[function(require,module,exports){
var toString = {}.toString;

module.exports = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
};

},{}],46:[function(require,module,exports){
(function (global){
/*global global, window*/
/**
 * @author Christian Johansen (christian@cjohansen.no) and contributors
 * @license BSD
 *
 * Copyright (c) 2010-2014 Christian Johansen
 */

(function (global) {
    "use strict";

    // Make properties writable in IE, as per
    // http://www.adequatelygood.com/Replacing-setTimeout-Globally.html
    // JSLint being anal
    var glbl = global;

    global.setTimeout = glbl.setTimeout;
    global.clearTimeout = glbl.clearTimeout;
    global.setInterval = glbl.setInterval;
    global.clearInterval = glbl.clearInterval;
    global.Date = glbl.Date;

    // setImmediate is not a standard function
    // avoid adding the prop to the window object if not present
    if('setImmediate' in global) {
        global.setImmediate = glbl.setImmediate;
        global.clearImmediate = glbl.clearImmediate;
    }

    // node expects setTimeout/setInterval to return a fn object w/ .ref()/.unref()
    // browsers, a number.
    // see https://github.com/cjohansen/Sinon.JS/pull/436

    var NOOP = function () { return undefined; };
    var timeoutResult = setTimeout(NOOP, 0);
    var addTimerReturnsObject = typeof timeoutResult === "object";
    clearTimeout(timeoutResult);

    var NativeDate = Date;
    var uniqueTimerId = 1;

    /**
     * Parse strings like "01:10:00" (meaning 1 hour, 10 minutes, 0 seconds) into
     * number of milliseconds. This is used to support human-readable strings passed
     * to clock.tick()
     */
    function parseTime(str) {
        if (!str) {
            return 0;
        }

        var strings = str.split(":");
        var l = strings.length, i = l;
        var ms = 0, parsed;

        if (l > 3 || !/^(\d\d:){0,2}\d\d?$/.test(str)) {
            throw new Error("tick only understands numbers and 'h:m:s'");
        }

        while (i--) {
            parsed = parseInt(strings[i], 10);

            if (parsed >= 60) {
                throw new Error("Invalid time " + str);
            }

            ms += parsed * Math.pow(60, (l - i - 1));
        }

        return ms * 1000;
    }

    /**
     * Used to grok the `now` parameter to createClock.
     */
    function getEpoch(epoch) {
        if (!epoch) { return 0; }
        if (typeof epoch.getTime === "function") { return epoch.getTime(); }
        if (typeof epoch === "number") { return epoch; }
        throw new TypeError("now should be milliseconds since UNIX epoch");
    }

    function inRange(from, to, timer) {
        return timer && timer.callAt >= from && timer.callAt <= to;
    }

    function mirrorDateProperties(target, source) {
        var prop;
        for (prop in source) {
            if (source.hasOwnProperty(prop)) {
                target[prop] = source[prop];
            }
        }

        // set special now implementation
        if (source.now) {
            target.now = function now() {
                return target.clock.now;
            };
        } else {
            delete target.now;
        }

        // set special toSource implementation
        if (source.toSource) {
            target.toSource = function toSource() {
                return source.toSource();
            };
        } else {
            delete target.toSource;
        }

        // set special toString implementation
        target.toString = function toString() {
            return source.toString();
        };

        target.prototype = source.prototype;
        target.parse = source.parse;
        target.UTC = source.UTC;
        target.prototype.toUTCString = source.prototype.toUTCString;

        return target;
    }

    function createDate() {
        function ClockDate(year, month, date, hour, minute, second, ms) {
            // Defensive and verbose to avoid potential harm in passing
            // explicit undefined when user does not pass argument
            switch (arguments.length) {
            case 0:
                return new NativeDate(ClockDate.clock.now);
            case 1:
                return new NativeDate(year);
            case 2:
                return new NativeDate(year, month);
            case 3:
                return new NativeDate(year, month, date);
            case 4:
                return new NativeDate(year, month, date, hour);
            case 5:
                return new NativeDate(year, month, date, hour, minute);
            case 6:
                return new NativeDate(year, month, date, hour, minute, second);
            default:
                return new NativeDate(year, month, date, hour, minute, second, ms);
            }
        }

        return mirrorDateProperties(ClockDate, NativeDate);
    }

    function addTimer(clock, timer) {
        if (timer.func === undefined) {
            throw new Error("Callback must be provided to timer calls");
        }

        if (!clock.timers) {
            clock.timers = {};
        }

        timer.id = uniqueTimerId++;
        timer.createdAt = clock.now;
        timer.callAt = clock.now + (timer.delay || (clock.duringTick ? 1 : 0));

        clock.timers[timer.id] = timer;

        if (addTimerReturnsObject) {
            return {
                id: timer.id,
                ref: NOOP,
                unref: NOOP
            };
        }

        return timer.id;
    }


    function compareTimers(a, b) {
        // Sort first by absolute timing
        if (a.callAt < b.callAt) {
            return -1;
        }
        if (a.callAt > b.callAt) {
            return 1;
        }

        // Sort next by immediate, immediate timers take precedence
        if (a.immediate && !b.immediate) {
            return -1;
        }
        if (!a.immediate && b.immediate) {
            return 1;
        }

        // Sort next by creation time, earlier-created timers take precedence
        if (a.createdAt < b.createdAt) {
            return -1;
        }
        if (a.createdAt > b.createdAt) {
            return 1;
        }

        // Sort next by id, lower-id timers take precedence
        if (a.id < b.id) {
            return -1;
        }
        if (a.id > b.id) {
            return 1;
        }

        // As timer ids are unique, no fallback `0` is necessary
    }

    function firstTimerInRange(clock, from, to) {
        var timers = clock.timers,
            timer = null,
            id,
            isInRange;

        for (id in timers) {
            if (timers.hasOwnProperty(id)) {
                isInRange = inRange(from, to, timers[id]);

                if (isInRange && (!timer || compareTimers(timer, timers[id]) === 1)) {
                    timer = timers[id];
                }
            }
        }

        return timer;
    }

    function callTimer(clock, timer) {
        var exception;

        if (typeof timer.interval === "number") {
            clock.timers[timer.id].callAt += timer.interval;
        } else {
            delete clock.timers[timer.id];
        }

        try {
            if (typeof timer.func === "function") {
                timer.func.apply(null, timer.args);
            } else {
                eval(timer.func);
            }
        } catch (e) {
            exception = e;
        }

        if (!clock.timers[timer.id]) {
            if (exception) {
                throw exception;
            }
            return;
        }

        if (exception) {
            throw exception;
        }
    }

    function timerType(timer) {
        if (timer.immediate) {
            return "Immediate";
        } else if (typeof timer.interval !== "undefined") {
            return "Interval";
        } else {
            return "Timeout";
        }
    }

    function clearTimer(clock, timerId, ttype) {
        if (!timerId) {
            // null appears to be allowed in most browsers, and appears to be
            // relied upon by some libraries, like Bootstrap carousel
            return;
        }

        if (!clock.timers) {
            clock.timers = [];
        }

        // in Node, timerId is an object with .ref()/.unref(), and
        // its .id field is the actual timer id.
        if (typeof timerId === "object") {
            timerId = timerId.id;
        }

        if (clock.timers.hasOwnProperty(timerId)) {
            // check that the ID matches a timer of the correct type
            var timer = clock.timers[timerId];
            if (timerType(timer) === ttype) {
                delete clock.timers[timerId];
            } else {
				throw new Error("Cannot clear timer: timer created with set" + ttype + "() but cleared with clear" + timerType(timer) + "()");
			}
        }
    }

    function uninstall(clock, target) {
        var method,
            i,
            l;

        for (i = 0, l = clock.methods.length; i < l; i++) {
            method = clock.methods[i];

            if (target[method].hadOwnProperty) {
                target[method] = clock["_" + method];
            } else {
                try {
                    delete target[method];
                } catch (ignore) {}
            }
        }

        // Prevent multiple executions which will completely remove these props
        clock.methods = [];
    }

    function hijackMethod(target, method, clock) {
        var prop;

        clock[method].hadOwnProperty = Object.prototype.hasOwnProperty.call(target, method);
        clock["_" + method] = target[method];

        if (method === "Date") {
            var date = mirrorDateProperties(clock[method], target[method]);
            target[method] = date;
        } else {
            target[method] = function () {
                return clock[method].apply(clock, arguments);
            };

            for (prop in clock[method]) {
                if (clock[method].hasOwnProperty(prop)) {
                    target[method][prop] = clock[method][prop];
                }
            }
        }

        target[method].clock = clock;
    }

    var timers = {
        setTimeout: setTimeout,
        clearTimeout: clearTimeout,
        setImmediate: global.setImmediate,
        clearImmediate: global.clearImmediate,
        setInterval: setInterval,
        clearInterval: clearInterval,
        Date: Date
    };

    var keys = Object.keys || function (obj) {
        var ks = [],
            key;

        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                ks.push(key);
            }
        }

        return ks;
    };

    exports.timers = timers;

    function createClock(now) {
        var clock = {
            now: getEpoch(now),
            timeouts: {},
            Date: createDate()
        };

        clock.Date.clock = clock;

        clock.setTimeout = function setTimeout(func, timeout) {
            return addTimer(clock, {
                func: func,
                args: Array.prototype.slice.call(arguments, 2),
                delay: timeout
            });
        };

        clock.clearTimeout = function clearTimeout(timerId) {
            return clearTimer(clock, timerId, "Timeout");
        };

        clock.setInterval = function setInterval(func, timeout) {
            return addTimer(clock, {
                func: func,
                args: Array.prototype.slice.call(arguments, 2),
                delay: timeout,
                interval: timeout
            });
        };

        clock.clearInterval = function clearInterval(timerId) {
            return clearTimer(clock, timerId, "Interval");
        };

        clock.setImmediate = function setImmediate(func) {
            return addTimer(clock, {
                func: func,
                args: Array.prototype.slice.call(arguments, 1),
                immediate: true
            });
        };

        clock.clearImmediate = function clearImmediate(timerId) {
            return clearTimer(clock, timerId, "Immediate");
        };

        clock.tick = function tick(ms) {
            ms = typeof ms === "number" ? ms : parseTime(ms);
            var tickFrom = clock.now, tickTo = clock.now + ms, previous = clock.now;
            var timer = firstTimerInRange(clock, tickFrom, tickTo);
            var oldNow;

            clock.duringTick = true;

            var firstException;
            while (timer && tickFrom <= tickTo) {
                if (clock.timers[timer.id]) {
                    tickFrom = clock.now = timer.callAt;
                    try {
                        oldNow = clock.now;
                        callTimer(clock, timer);
                        // compensate for any setSystemTime() call during timer callback
                        if (oldNow !== clock.now) {
                            tickFrom += clock.now - oldNow;
                            tickTo += clock.now - oldNow;
                            previous += clock.now - oldNow;
                        }
                    } catch (e) {
                        firstException = firstException || e;
                    }
                }

                timer = firstTimerInRange(clock, previous, tickTo);
                previous = tickFrom;
            }

            clock.duringTick = false;
            clock.now = tickTo;

            if (firstException) {
                throw firstException;
            }

            return clock.now;
        };

        clock.reset = function reset() {
            clock.timers = {};
        };

        clock.setSystemTime = function setSystemTime(now) {
            // determine time difference
            var newNow = getEpoch(now);
            var difference = newNow - clock.now;

            // update 'system clock'
            clock.now = newNow;

            // update timers and intervals to keep them stable
            for (var id in clock.timers) {
                if (clock.timers.hasOwnProperty(id)) {
                    var timer = clock.timers[id];
                    timer.createdAt += difference;
                    timer.callAt += difference;
                }
            }
        };

        return clock;
    }
    exports.createClock = createClock;

    exports.install = function install(target, now, toFake) {
        var i,
            l;

        if (typeof target === "number") {
            toFake = now;
            now = target;
            target = null;
        }

        if (!target) {
            target = global;
        }

        var clock = createClock(now);

        clock.uninstall = function () {
            uninstall(clock, target);
        };

        clock.methods = toFake || [];

        if (clock.methods.length === 0) {
            clock.methods = keys(timers);
        }

        for (i = 0, l = clock.methods.length; i < l; i++) {
            hijackMethod(target, clock.methods[i], clock);
        }

        return clock;
    };

}(global || this));

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],47:[function(require,module,exports){
// Create a range object for efficently rendering strings to elements.
var range;

var testEl = (typeof document !== 'undefined') ?
    document.body || document.createElement('div') :
    {};

var XHTML = 'http://www.w3.org/1999/xhtml';
var ELEMENT_NODE = 1;
var TEXT_NODE = 3;
var COMMENT_NODE = 8;

// Fixes <https://github.com/patrick-steele-idem/morphdom/issues/32>
// (IE7+ support) <=IE7 does not support el.hasAttribute(name)
var hasAttributeNS;

if (testEl.hasAttributeNS) {
    hasAttributeNS = function(el, namespaceURI, name) {
        return el.hasAttributeNS(namespaceURI, name);
    };
} else if (testEl.hasAttribute) {
    hasAttributeNS = function(el, namespaceURI, name) {
        return el.hasAttribute(name);
    };
} else {
    hasAttributeNS = function(el, namespaceURI, name) {
        return !!el.getAttributeNode(name);
    };
}

function empty(o) {
    for (var k in o) {
        if (o.hasOwnProperty(k)) {
            return false;
        }
    }
    return true;
}

function toElement(str) {
    if (!range && document.createRange) {
        range = document.createRange();
        range.selectNode(document.body);
    }

    var fragment;
    if (range && range.createContextualFragment) {
        fragment = range.createContextualFragment(str);
    } else {
        fragment = document.createElement('body');
        fragment.innerHTML = str;
    }
    return fragment.childNodes[0];
}

var specialElHandlers = {
    /**
     * Needed for IE. Apparently IE doesn't think that "selected" is an
     * attribute when reading over the attributes using selectEl.attributes
     */
    OPTION: function(fromEl, toEl) {
        fromEl.selected = toEl.selected;
        if (fromEl.selected) {
            fromEl.setAttribute('selected', '');
        } else {
            fromEl.removeAttribute('selected', '');
        }
    },
    /**
     * The "value" attribute is special for the <input> element since it sets
     * the initial value. Changing the "value" attribute without changing the
     * "value" property will have no effect since it is only used to the set the
     * initial value.  Similar for the "checked" attribute, and "disabled".
     */
    INPUT: function(fromEl, toEl) {
        fromEl.checked = toEl.checked;
        if (fromEl.checked) {
            fromEl.setAttribute('checked', '');
        } else {
            fromEl.removeAttribute('checked');
        }

        if (fromEl.value !== toEl.value) {
            fromEl.value = toEl.value;
        }

        if (!hasAttributeNS(toEl, null, 'value')) {
            fromEl.removeAttribute('value');
        }

        fromEl.disabled = toEl.disabled;
        if (fromEl.disabled) {
            fromEl.setAttribute('disabled', '');
        } else {
            fromEl.removeAttribute('disabled');
        }
    },

    TEXTAREA: function(fromEl, toEl) {
        var newValue = toEl.value;
        if (fromEl.value !== newValue) {
            fromEl.value = newValue;
        }

        if (fromEl.firstChild) {
            fromEl.firstChild.nodeValue = newValue;
        }
    }
};

function noop() {}

/**
 * Returns true if two node's names and namespace URIs are the same.
 *
 * @param {Element} a
 * @param {Element} b
 * @return {boolean}
 */
var compareNodeNames = function(a, b) {
    return a.nodeName === b.nodeName &&
           a.namespaceURI === b.namespaceURI;
};

/**
 * Create an element, optionally with a known namespace URI.
 *
 * @param {string} name the element name, e.g. 'div' or 'svg'
 * @param {string} [namespaceURI] the element's namespace URI, i.e. the value of
 * its `xmlns` attribute or its inferred namespace.
 *
 * @return {Element}
 */
function createElementNS(name, namespaceURI) {
    return !namespaceURI || namespaceURI === XHTML ?
        document.createElement(name) :
        document.createElementNS(namespaceURI, name);
}

/**
 * Loop over all of the attributes on the target node and make sure the original
 * DOM node has the same attributes. If an attribute found on the original node
 * is not on the new node then remove it from the original node.
 *
 * @param  {Element} fromNode
 * @param  {Element} toNode
 */
function morphAttrs(fromNode, toNode) {
    var attrs = toNode.attributes;
    var i;
    var attr;
    var attrName;
    var attrNamespaceURI;
    var attrValue;
    var fromValue;

    for (i = attrs.length - 1; i >= 0; i--) {
        attr = attrs[i];
        attrName = attr.name;
        attrValue = attr.value;
        attrNamespaceURI = attr.namespaceURI;

        if (attrNamespaceURI) {
            attrName = attr.localName || attrName;
            fromValue = fromNode.getAttributeNS(attrNamespaceURI, attrName);
        } else {
            fromValue = fromNode.getAttribute(attrName);
        }

        if (fromValue !== attrValue) {
            if (attrNamespaceURI) {
                fromNode.setAttributeNS(attrNamespaceURI, attrName, attrValue);
            } else {
                fromNode.setAttribute(attrName, attrValue);
            }
        }
    }

    // Remove any extra attributes found on the original DOM element that
    // weren't found on the target element.
    attrs = fromNode.attributes;

    for (i = attrs.length - 1; i >= 0; i--) {
        attr = attrs[i];
        if (attr.specified !== false) {
            attrName = attr.name;
            attrNamespaceURI = attr.namespaceURI;

            if (!hasAttributeNS(toNode, attrNamespaceURI, attrNamespaceURI ? attrName = attr.localName || attrName : attrName)) {
                if (attrNamespaceURI) {
                    fromNode.removeAttributeNS(attrNamespaceURI, attr.localName);
                } else {
                    fromNode.removeAttribute(attrName);
                }
            }
        }
    }
}

/**
 * Copies the children of one DOM element to another DOM element
 */
function moveChildren(fromEl, toEl) {
    var curChild = fromEl.firstChild;
    while (curChild) {
        var nextChild = curChild.nextSibling;
        toEl.appendChild(curChild);
        curChild = nextChild;
    }
    return toEl;
}

function defaultGetNodeKey(node) {
    return node.id;
}

function morphdom(fromNode, toNode, options) {
    if (!options) {
        options = {};
    }

    if (typeof toNode === 'string') {
        if (fromNode.nodeName === '#document' || fromNode.nodeName === 'HTML') {
            var toNodeHtml = toNode;
            toNode = document.createElement('html');
            toNode.innerHTML = toNodeHtml;
        } else {
            toNode = toElement(toNode);
        }
    }

    // XXX optimization: if the nodes are equal, don't morph them
    /*
    if (fromNode.isEqualNode(toNode)) {
      return fromNode;
    }
    */

    var savedEls = {}; // Used to save off DOM elements with IDs
    var unmatchedEls = {};
    var getNodeKey = options.getNodeKey || defaultGetNodeKey;
    var onBeforeNodeAdded = options.onBeforeNodeAdded || noop;
    var onNodeAdded = options.onNodeAdded || noop;
    var onBeforeElUpdated = options.onBeforeElUpdated || options.onBeforeMorphEl || noop;
    var onElUpdated = options.onElUpdated || noop;
    var onBeforeNodeDiscarded = options.onBeforeNodeDiscarded || noop;
    var onNodeDiscarded = options.onNodeDiscarded || noop;
    var onBeforeElChildrenUpdated = options.onBeforeElChildrenUpdated || options.onBeforeMorphElChildren || noop;
    var childrenOnly = options.childrenOnly === true;
    var movedEls = [];

    function removeNodeHelper(node, nestedInSavedEl) {
        var id = getNodeKey(node);
        // If the node has an ID then save it off since we will want
        // to reuse it in case the target DOM tree has a DOM element
        // with the same ID
        if (id) {
            savedEls[id] = node;
        } else if (!nestedInSavedEl) {
            // If we are not nested in a saved element then we know that this node has been
            // completely discarded and will not exist in the final DOM.
            onNodeDiscarded(node);
        }

        if (node.nodeType === ELEMENT_NODE) {
            var curChild = node.firstChild;
            while (curChild) {
                removeNodeHelper(curChild, nestedInSavedEl || id);
                curChild = curChild.nextSibling;
            }
        }
    }

    function walkDiscardedChildNodes(node) {
        if (node.nodeType === ELEMENT_NODE) {
            var curChild = node.firstChild;
            while (curChild) {


                if (!getNodeKey(curChild)) {
                    // We only want to handle nodes that don't have an ID to avoid double
                    // walking the same saved element.

                    onNodeDiscarded(curChild);

                    // Walk recursively
                    walkDiscardedChildNodes(curChild);
                }

                curChild = curChild.nextSibling;
            }
        }
    }

    function removeNode(node, parentNode, alreadyVisited) {
        if (onBeforeNodeDiscarded(node) === false) {
            return;
        }

        parentNode.removeChild(node);
        if (alreadyVisited) {
            if (!getNodeKey(node)) {
                onNodeDiscarded(node);
                walkDiscardedChildNodes(node);
            }
        } else {
            removeNodeHelper(node);
        }
    }

    function morphEl(fromEl, toEl, alreadyVisited, childrenOnly) {
        var toElKey = getNodeKey(toEl);
        if (toElKey) {
            // If an element with an ID is being morphed then it is will be in the final
            // DOM so clear it out of the saved elements collection
            delete savedEls[toElKey];
        }

        if (!childrenOnly) {
            if (onBeforeElUpdated(fromEl, toEl) === false) {
                return;
            }

            morphAttrs(fromEl, toEl);
            onElUpdated(fromEl);

            if (onBeforeElChildrenUpdated(fromEl, toEl) === false) {
                return;
            }
        }

        if (fromEl.nodeName !== 'TEXTAREA') {
            var curToNodeChild = toEl.firstChild;
            var curFromNodeChild = fromEl.firstChild;
            var curToNodeId;

            var fromNextSibling;
            var toNextSibling;
            var savedEl;
            var unmatchedEl;

            outer: while (curToNodeChild) {
                toNextSibling = curToNodeChild.nextSibling;
                curToNodeId = getNodeKey(curToNodeChild);

                while (curFromNodeChild) {
                    var curFromNodeId = getNodeKey(curFromNodeChild);
                    fromNextSibling = curFromNodeChild.nextSibling;

                    if (!alreadyVisited) {
                        if (curFromNodeId && (unmatchedEl = unmatchedEls[curFromNodeId])) {
                            unmatchedEl.parentNode.replaceChild(curFromNodeChild, unmatchedEl);
                            morphEl(curFromNodeChild, unmatchedEl, alreadyVisited);
                            curFromNodeChild = fromNextSibling;
                            continue;
                        }
                    }

                    var curFromNodeType = curFromNodeChild.nodeType;

                    if (curFromNodeType === curToNodeChild.nodeType) {
                        var isCompatible = false;

                        // Both nodes being compared are Element nodes
                        if (curFromNodeType === ELEMENT_NODE) {
                            if (compareNodeNames(curFromNodeChild, curToNodeChild)) {
                                // We have compatible DOM elements
                                if (curFromNodeId || curToNodeId) {
                                    // If either DOM element has an ID then we
                                    // handle those differently since we want to
                                    // match up by ID
                                    if (curToNodeId === curFromNodeId) {
                                        isCompatible = true;
                                    }
                                } else {
                                    isCompatible = true;
                                }
                            }

                            if (isCompatible) {
                                // We found compatible DOM elements so transform
                                // the current "from" node to match the current
                                // target DOM node.
                                morphEl(curFromNodeChild, curToNodeChild, alreadyVisited);
                            }
                        // Both nodes being compared are Text or Comment nodes
                    } else if (curFromNodeType === TEXT_NODE || curFromNodeType == COMMENT_NODE) {
                            isCompatible = true;
                            // Simply update nodeValue on the original node to
                            // change the text value
                            curFromNodeChild.nodeValue = curToNodeChild.nodeValue;
                        }

                        if (isCompatible) {
                            curToNodeChild = toNextSibling;
                            curFromNodeChild = fromNextSibling;
                            continue outer;
                        }
                    }

                    // No compatible match so remove the old node from the DOM
                    // and continue trying to find a match in the original DOM
                    removeNode(curFromNodeChild, fromEl, alreadyVisited);
                    curFromNodeChild = fromNextSibling;
                }

                if (curToNodeId) {
                    if ((savedEl = savedEls[curToNodeId])) {
                        if (compareNodeNames(savedEl, curToNodeChild)) {
                            morphEl(savedEl, curToNodeChild, true);
                            // We want to append the saved element instead
                            curToNodeChild = savedEl;
                        } else {
                            delete savedEls[curToNodeId];
                            onNodeDiscarded(savedEl);
                        }
                    } else {
                        // The current DOM element in the target tree has an ID
                        // but we did not find a match in any of the
                        // corresponding siblings. We just put the target
                        // element in the old DOM tree but if we later find an
                        // element in the old DOM tree that has a matching ID
                        // then we will replace the target element with the
                        // corresponding old element and morph the old element
                        unmatchedEls[curToNodeId] = curToNodeChild;
                    }
                }

                // If we got this far then we did not find a candidate match for
                // our "to node" and we exhausted all of the children "from"
                // nodes. Therefore, we will just append the current "to node"
                // to the end
                if (onBeforeNodeAdded(curToNodeChild) !== false) {
                    fromEl.appendChild(curToNodeChild);
                    onNodeAdded(curToNodeChild);
                }

                if (curToNodeChild.nodeType === ELEMENT_NODE &&
                    (curToNodeId || curToNodeChild.firstChild)) {
                    // The element that was just added to the original DOM may
                    // have some nested elements with a key/ID that needs to be
                    // matched up with other elements. We'll add the element to
                    // a list so that we can later process the nested elements
                    // if there are any unmatched keyed elements that were
                    // discarded
                    movedEls.push(curToNodeChild);
                }

                curToNodeChild = toNextSibling;
                curFromNodeChild = fromNextSibling;
            }

            // We have processed all of the "to nodes". If curFromNodeChild is
            // non-null then we still have some from nodes left over that need
            // to be removed
            while (curFromNodeChild) {
                fromNextSibling = curFromNodeChild.nextSibling;
                removeNode(curFromNodeChild, fromEl, alreadyVisited);
                curFromNodeChild = fromNextSibling;
            }
        }

        var specialElHandler = specialElHandlers[fromEl.nodeName];
        if (specialElHandler) {
            specialElHandler(fromEl, toEl);
        }
    } // END: morphEl(...)

    var morphedNode = fromNode;
    var morphedNodeType = morphedNode.nodeType;
    var toNodeType = toNode.nodeType;

    if (!childrenOnly) {
        // Handle the case where we are given two DOM nodes that are not
        // compatible (e.g. <div> --> <span> or <div> --> TEXT)
        if (morphedNodeType === ELEMENT_NODE) {
            if (toNodeType === ELEMENT_NODE) {
                if (!compareNodeNames(fromNode, toNode)) {
                    onNodeDiscarded(fromNode);
                    morphedNode = moveChildren(fromNode, createElementNS(toNode.nodeName, toNode.namespaceURI));
                }
            } else {
                // Going from an element node to a text node
                morphedNode = toNode;
            }
        } else if (morphedNodeType === TEXT_NODE || morphedNodeType === COMMENT_NODE) { // Text or comment node
            if (toNodeType === morphedNodeType) {
                morphedNode.nodeValue = toNode.nodeValue;
                return morphedNode;
            } else {
                // Text node to something else
                morphedNode = toNode;
            }
        }
    }

    if (morphedNode === toNode) {
        // The "to node" was not compatible with the "from node" so we had to
        // toss out the "from node" and use the "to node"
        onNodeDiscarded(fromNode);
    } else {
        morphEl(morphedNode, toNode, false, childrenOnly);

        /**
         * What we will do here is walk the tree for the DOM element that was
         * moved from the target DOM tree to the original DOM tree and we will
         * look for keyed elements that could be matched to keyed elements that
         * were earlier discarded.  If we find a match then we will move the
         * saved element into the final DOM tree.
         */
        var handleMovedEl = function(el) {
            var curChild = el.firstChild;
            while (curChild) {
                var nextSibling = curChild.nextSibling;

                var key = getNodeKey(curChild);
                if (key) {
                    var savedEl = savedEls[key];
                    if (savedEl && compareNodeNames(curChild, savedEl)) {
                        curChild.parentNode.replaceChild(savedEl, curChild);
                        // true: already visited the saved el tree
                        morphEl(savedEl, curChild, true);
                        curChild = nextSibling;
                        if (empty(savedEls)) {
                            return false;
                        }
                        continue;
                    }
                }

                if (curChild.nodeType === ELEMENT_NODE) {
                    handleMovedEl(curChild);
                }

                curChild = nextSibling;
            }
        };

        // The loop below is used to possibly match up any discarded
        // elements in the original DOM tree with elemenets from the
        // target tree that were moved over without visiting their
        // children
        if (!empty(savedEls)) {
            handleMovedElsLoop:
            while (movedEls.length) {
                var movedElsTemp = movedEls;
                movedEls = [];
                for (var i=0; i<movedElsTemp.length; i++) {
                    if (handleMovedEl(movedElsTemp[i]) === false) {
                        // There are no more unmatched elements so completely end
                        // the loop
                        break handleMovedElsLoop;
                    }
                }
            }
        }

        // Fire the "onNodeDiscarded" event for any saved elements
        // that never found a new home in the morphed DOM
        for (var savedElId in savedEls) {
            if (savedEls.hasOwnProperty(savedElId)) {
                var savedEl = savedEls[savedElId];
                onNodeDiscarded(savedEl);
                walkDiscardedChildNodes(savedEl);
            }
        }
    }

    if (!childrenOnly && morphedNode !== fromNode && fromNode.parentNode) {
        // If we had to swap out the from node with a new node because the old
        // node was not compatible with the target node then we need to
        // replace the old DOM node in the original DOM tree. This is only
        // possible if the original DOM node was part of a DOM tree which
        // we know is the case if it has a parent node.
        fromNode.parentNode.replaceChild(morphedNode, fromNode);
    }

    return morphedNode;
}

module.exports = morphdom;

},{}],48:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

(function () {
    try {
        cachedSetTimeout = setTimeout;
    } catch (e) {
        cachedSetTimeout = function () {
            throw new Error('setTimeout is not defined');
        }
    }
    try {
        cachedClearTimeout = clearTimeout;
    } catch (e) {
        cachedClearTimeout = function () {
            throw new Error('clearTimeout is not defined');
        }
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],49:[function(require,module,exports){
(function (global){
/*! https://mths.be/punycode v1.4.1 by @mathias */
;(function(root) {

	/** Detect free variables */
	var freeExports = typeof exports == 'object' && exports &&
		!exports.nodeType && exports;
	var freeModule = typeof module == 'object' && module &&
		!module.nodeType && module;
	var freeGlobal = typeof global == 'object' && global;
	if (
		freeGlobal.global === freeGlobal ||
		freeGlobal.window === freeGlobal ||
		freeGlobal.self === freeGlobal
	) {
		root = freeGlobal;
	}

	/**
	 * The `punycode` object.
	 * @name punycode
	 * @type Object
	 */
	var punycode,

	/** Highest positive signed 32-bit float value */
	maxInt = 2147483647, // aka. 0x7FFFFFFF or 2^31-1

	/** Bootstring parameters */
	base = 36,
	tMin = 1,
	tMax = 26,
	skew = 38,
	damp = 700,
	initialBias = 72,
	initialN = 128, // 0x80
	delimiter = '-', // '\x2D'

	/** Regular expressions */
	regexPunycode = /^xn--/,
	regexNonASCII = /[^\x20-\x7E]/, // unprintable ASCII chars + non-ASCII chars
	regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g, // RFC 3490 separators

	/** Error messages */
	errors = {
		'overflow': 'Overflow: input needs wider integers to process',
		'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
		'invalid-input': 'Invalid input'
	},

	/** Convenience shortcuts */
	baseMinusTMin = base - tMin,
	floor = Math.floor,
	stringFromCharCode = String.fromCharCode,

	/** Temporary variable */
	key;

	/*--------------------------------------------------------------------------*/

	/**
	 * A generic error utility function.
	 * @private
	 * @param {String} type The error type.
	 * @returns {Error} Throws a `RangeError` with the applicable error message.
	 */
	function error(type) {
		throw new RangeError(errors[type]);
	}

	/**
	 * A generic `Array#map` utility function.
	 * @private
	 * @param {Array} array The array to iterate over.
	 * @param {Function} callback The function that gets called for every array
	 * item.
	 * @returns {Array} A new array of values returned by the callback function.
	 */
	function map(array, fn) {
		var length = array.length;
		var result = [];
		while (length--) {
			result[length] = fn(array[length]);
		}
		return result;
	}

	/**
	 * A simple `Array#map`-like wrapper to work with domain name strings or email
	 * addresses.
	 * @private
	 * @param {String} domain The domain name or email address.
	 * @param {Function} callback The function that gets called for every
	 * character.
	 * @returns {Array} A new string of characters returned by the callback
	 * function.
	 */
	function mapDomain(string, fn) {
		var parts = string.split('@');
		var result = '';
		if (parts.length > 1) {
			// In email addresses, only the domain name should be punycoded. Leave
			// the local part (i.e. everything up to `@`) intact.
			result = parts[0] + '@';
			string = parts[1];
		}
		// Avoid `split(regex)` for IE8 compatibility. See #17.
		string = string.replace(regexSeparators, '\x2E');
		var labels = string.split('.');
		var encoded = map(labels, fn).join('.');
		return result + encoded;
	}

	/**
	 * Creates an array containing the numeric code points of each Unicode
	 * character in the string. While JavaScript uses UCS-2 internally,
	 * this function will convert a pair of surrogate halves (each of which
	 * UCS-2 exposes as separate characters) into a single code point,
	 * matching UTF-16.
	 * @see `punycode.ucs2.encode`
	 * @see <https://mathiasbynens.be/notes/javascript-encoding>
	 * @memberOf punycode.ucs2
	 * @name decode
	 * @param {String} string The Unicode input string (UCS-2).
	 * @returns {Array} The new array of code points.
	 */
	function ucs2decode(string) {
		var output = [],
		    counter = 0,
		    length = string.length,
		    value,
		    extra;
		while (counter < length) {
			value = string.charCodeAt(counter++);
			if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
				// high surrogate, and there is a next character
				extra = string.charCodeAt(counter++);
				if ((extra & 0xFC00) == 0xDC00) { // low surrogate
					output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
				} else {
					// unmatched surrogate; only append this code unit, in case the next
					// code unit is the high surrogate of a surrogate pair
					output.push(value);
					counter--;
				}
			} else {
				output.push(value);
			}
		}
		return output;
	}

	/**
	 * Creates a string based on an array of numeric code points.
	 * @see `punycode.ucs2.decode`
	 * @memberOf punycode.ucs2
	 * @name encode
	 * @param {Array} codePoints The array of numeric code points.
	 * @returns {String} The new Unicode string (UCS-2).
	 */
	function ucs2encode(array) {
		return map(array, function(value) {
			var output = '';
			if (value > 0xFFFF) {
				value -= 0x10000;
				output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
				value = 0xDC00 | value & 0x3FF;
			}
			output += stringFromCharCode(value);
			return output;
		}).join('');
	}

	/**
	 * Converts a basic code point into a digit/integer.
	 * @see `digitToBasic()`
	 * @private
	 * @param {Number} codePoint The basic numeric code point value.
	 * @returns {Number} The numeric value of a basic code point (for use in
	 * representing integers) in the range `0` to `base - 1`, or `base` if
	 * the code point does not represent a value.
	 */
	function basicToDigit(codePoint) {
		if (codePoint - 48 < 10) {
			return codePoint - 22;
		}
		if (codePoint - 65 < 26) {
			return codePoint - 65;
		}
		if (codePoint - 97 < 26) {
			return codePoint - 97;
		}
		return base;
	}

	/**
	 * Converts a digit/integer into a basic code point.
	 * @see `basicToDigit()`
	 * @private
	 * @param {Number} digit The numeric value of a basic code point.
	 * @returns {Number} The basic code point whose value (when used for
	 * representing integers) is `digit`, which needs to be in the range
	 * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
	 * used; else, the lowercase form is used. The behavior is undefined
	 * if `flag` is non-zero and `digit` has no uppercase form.
	 */
	function digitToBasic(digit, flag) {
		//  0..25 map to ASCII a..z or A..Z
		// 26..35 map to ASCII 0..9
		return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
	}

	/**
	 * Bias adaptation function as per section 3.4 of RFC 3492.
	 * https://tools.ietf.org/html/rfc3492#section-3.4
	 * @private
	 */
	function adapt(delta, numPoints, firstTime) {
		var k = 0;
		delta = firstTime ? floor(delta / damp) : delta >> 1;
		delta += floor(delta / numPoints);
		for (/* no initialization */; delta > baseMinusTMin * tMax >> 1; k += base) {
			delta = floor(delta / baseMinusTMin);
		}
		return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
	}

	/**
	 * Converts a Punycode string of ASCII-only symbols to a string of Unicode
	 * symbols.
	 * @memberOf punycode
	 * @param {String} input The Punycode string of ASCII-only symbols.
	 * @returns {String} The resulting string of Unicode symbols.
	 */
	function decode(input) {
		// Don't use UCS-2
		var output = [],
		    inputLength = input.length,
		    out,
		    i = 0,
		    n = initialN,
		    bias = initialBias,
		    basic,
		    j,
		    index,
		    oldi,
		    w,
		    k,
		    digit,
		    t,
		    /** Cached calculation results */
		    baseMinusT;

		// Handle the basic code points: let `basic` be the number of input code
		// points before the last delimiter, or `0` if there is none, then copy
		// the first basic code points to the output.

		basic = input.lastIndexOf(delimiter);
		if (basic < 0) {
			basic = 0;
		}

		for (j = 0; j < basic; ++j) {
			// if it's not a basic code point
			if (input.charCodeAt(j) >= 0x80) {
				error('not-basic');
			}
			output.push(input.charCodeAt(j));
		}

		// Main decoding loop: start just after the last delimiter if any basic code
		// points were copied; start at the beginning otherwise.

		for (index = basic > 0 ? basic + 1 : 0; index < inputLength; /* no final expression */) {

			// `index` is the index of the next character to be consumed.
			// Decode a generalized variable-length integer into `delta`,
			// which gets added to `i`. The overflow checking is easier
			// if we increase `i` as we go, then subtract off its starting
			// value at the end to obtain `delta`.
			for (oldi = i, w = 1, k = base; /* no condition */; k += base) {

				if (index >= inputLength) {
					error('invalid-input');
				}

				digit = basicToDigit(input.charCodeAt(index++));

				if (digit >= base || digit > floor((maxInt - i) / w)) {
					error('overflow');
				}

				i += digit * w;
				t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);

				if (digit < t) {
					break;
				}

				baseMinusT = base - t;
				if (w > floor(maxInt / baseMinusT)) {
					error('overflow');
				}

				w *= baseMinusT;

			}

			out = output.length + 1;
			bias = adapt(i - oldi, out, oldi == 0);

			// `i` was supposed to wrap around from `out` to `0`,
			// incrementing `n` each time, so we'll fix that now:
			if (floor(i / out) > maxInt - n) {
				error('overflow');
			}

			n += floor(i / out);
			i %= out;

			// Insert `n` at position `i` of the output
			output.splice(i++, 0, n);

		}

		return ucs2encode(output);
	}

	/**
	 * Converts a string of Unicode symbols (e.g. a domain name label) to a
	 * Punycode string of ASCII-only symbols.
	 * @memberOf punycode
	 * @param {String} input The string of Unicode symbols.
	 * @returns {String} The resulting Punycode string of ASCII-only symbols.
	 */
	function encode(input) {
		var n,
		    delta,
		    handledCPCount,
		    basicLength,
		    bias,
		    j,
		    m,
		    q,
		    k,
		    t,
		    currentValue,
		    output = [],
		    /** `inputLength` will hold the number of code points in `input`. */
		    inputLength,
		    /** Cached calculation results */
		    handledCPCountPlusOne,
		    baseMinusT,
		    qMinusT;

		// Convert the input in UCS-2 to Unicode
		input = ucs2decode(input);

		// Cache the length
		inputLength = input.length;

		// Initialize the state
		n = initialN;
		delta = 0;
		bias = initialBias;

		// Handle the basic code points
		for (j = 0; j < inputLength; ++j) {
			currentValue = input[j];
			if (currentValue < 0x80) {
				output.push(stringFromCharCode(currentValue));
			}
		}

		handledCPCount = basicLength = output.length;

		// `handledCPCount` is the number of code points that have been handled;
		// `basicLength` is the number of basic code points.

		// Finish the basic string - if it is not empty - with a delimiter
		if (basicLength) {
			output.push(delimiter);
		}

		// Main encoding loop:
		while (handledCPCount < inputLength) {

			// All non-basic code points < n have been handled already. Find the next
			// larger one:
			for (m = maxInt, j = 0; j < inputLength; ++j) {
				currentValue = input[j];
				if (currentValue >= n && currentValue < m) {
					m = currentValue;
				}
			}

			// Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
			// but guard against overflow
			handledCPCountPlusOne = handledCPCount + 1;
			if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
				error('overflow');
			}

			delta += (m - n) * handledCPCountPlusOne;
			n = m;

			for (j = 0; j < inputLength; ++j) {
				currentValue = input[j];

				if (currentValue < n && ++delta > maxInt) {
					error('overflow');
				}

				if (currentValue == n) {
					// Represent delta as a generalized variable-length integer
					for (q = delta, k = base; /* no condition */; k += base) {
						t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
						if (q < t) {
							break;
						}
						qMinusT = q - t;
						baseMinusT = base - t;
						output.push(
							stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0))
						);
						q = floor(qMinusT / baseMinusT);
					}

					output.push(stringFromCharCode(digitToBasic(q, 0)));
					bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
					delta = 0;
					++handledCPCount;
				}
			}

			++delta;
			++n;

		}
		return output.join('');
	}

	/**
	 * Converts a Punycode string representing a domain name or an email address
	 * to Unicode. Only the Punycoded parts of the input will be converted, i.e.
	 * it doesn't matter if you call it on a string that has already been
	 * converted to Unicode.
	 * @memberOf punycode
	 * @param {String} input The Punycoded domain name or email address to
	 * convert to Unicode.
	 * @returns {String} The Unicode representation of the given Punycode
	 * string.
	 */
	function toUnicode(input) {
		return mapDomain(input, function(string) {
			return regexPunycode.test(string)
				? decode(string.slice(4).toLowerCase())
				: string;
		});
	}

	/**
	 * Converts a Unicode string representing a domain name or an email address to
	 * Punycode. Only the non-ASCII parts of the domain name will be converted,
	 * i.e. it doesn't matter if you call it with a domain that's already in
	 * ASCII.
	 * @memberOf punycode
	 * @param {String} input The domain name or email address to convert, as a
	 * Unicode string.
	 * @returns {String} The Punycode representation of the given domain name or
	 * email address.
	 */
	function toASCII(input) {
		return mapDomain(input, function(string) {
			return regexNonASCII.test(string)
				? 'xn--' + encode(string)
				: string;
		});
	}

	/*--------------------------------------------------------------------------*/

	/** Define the public API */
	punycode = {
		/**
		 * A string representing the current Punycode.js version number.
		 * @memberOf punycode
		 * @type String
		 */
		'version': '1.4.1',
		/**
		 * An object of methods to convert from JavaScript's internal character
		 * representation (UCS-2) to Unicode code points, and back.
		 * @see <https://mathiasbynens.be/notes/javascript-encoding>
		 * @memberOf punycode
		 * @type Object
		 */
		'ucs2': {
			'decode': ucs2decode,
			'encode': ucs2encode
		},
		'decode': decode,
		'encode': encode,
		'toASCII': toASCII,
		'toUnicode': toUnicode
	};

	/** Expose `punycode` */
	// Some AMD build optimizers, like r.js, check for specific condition patterns
	// like the following:
	if (
		typeof define == 'function' &&
		typeof define.amd == 'object' &&
		define.amd
	) {
		define('punycode', function() {
			return punycode;
		});
	} else if (freeExports && freeModule) {
		if (module.exports == freeExports) {
			// in Node.js, io.js, or RingoJS v0.8.0+
			freeModule.exports = punycode;
		} else {
			// in Narwhal or RingoJS v0.7.0-
			for (key in punycode) {
				punycode.hasOwnProperty(key) && (freeExports[key] = punycode[key]);
			}
		}
	} else {
		// in Rhino or a web browser
		root.punycode = punycode;
	}

}(this));

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],50:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

// If obj.hasOwnProperty has been overridden, then calling
// obj.hasOwnProperty(prop) will break.
// See: https://github.com/joyent/node/issues/1707
function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

module.exports = function(qs, sep, eq, options) {
  sep = sep || '&';
  eq = eq || '=';
  var obj = {};

  if (typeof qs !== 'string' || qs.length === 0) {
    return obj;
  }

  var regexp = /\+/g;
  qs = qs.split(sep);

  var maxKeys = 1000;
  if (options && typeof options.maxKeys === 'number') {
    maxKeys = options.maxKeys;
  }

  var len = qs.length;
  // maxKeys <= 0 means that we should not limit keys count
  if (maxKeys > 0 && len > maxKeys) {
    len = maxKeys;
  }

  for (var i = 0; i < len; ++i) {
    var x = qs[i].replace(regexp, '%20'),
        idx = x.indexOf(eq),
        kstr, vstr, k, v;

    if (idx >= 0) {
      kstr = x.substr(0, idx);
      vstr = x.substr(idx + 1);
    } else {
      kstr = x;
      vstr = '';
    }

    k = decodeURIComponent(kstr);
    v = decodeURIComponent(vstr);

    if (!hasOwnProperty(obj, k)) {
      obj[k] = v;
    } else if (isArray(obj[k])) {
      obj[k].push(v);
    } else {
      obj[k] = [obj[k], v];
    }
  }

  return obj;
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

},{}],51:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

var stringifyPrimitive = function(v) {
  switch (typeof v) {
    case 'string':
      return v;

    case 'boolean':
      return v ? 'true' : 'false';

    case 'number':
      return isFinite(v) ? v : '';

    default:
      return '';
  }
};

module.exports = function(obj, sep, eq, name) {
  sep = sep || '&';
  eq = eq || '=';
  if (obj === null) {
    obj = undefined;
  }

  if (typeof obj === 'object') {
    return map(objectKeys(obj), function(k) {
      var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
      if (isArray(obj[k])) {
        return map(obj[k], function(v) {
          return ks + encodeURIComponent(stringifyPrimitive(v));
        }).join(sep);
      } else {
        return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
      }
    }).join(sep);

  }

  if (!name) return '';
  return encodeURIComponent(stringifyPrimitive(name)) + eq +
         encodeURIComponent(stringifyPrimitive(obj));
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

function map (xs, f) {
  if (xs.map) return xs.map(f);
  var res = [];
  for (var i = 0; i < xs.length; i++) {
    res.push(f(xs[i], i));
  }
  return res;
}

var objectKeys = Object.keys || function (obj) {
  var res = [];
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) res.push(key);
  }
  return res;
};

},{}],52:[function(require,module,exports){
'use strict';

exports.decode = exports.parse = require('./decode');
exports.encode = exports.stringify = require('./encode');

},{"./decode":50,"./encode":51}],53:[function(require,module,exports){
(function() {
    "use strict";
    function $$route$recognizer$dsl$$Target(path, matcher, delegate) {
      this.path = path;
      this.matcher = matcher;
      this.delegate = delegate;
    }

    $$route$recognizer$dsl$$Target.prototype = {
      to: function(target, callback) {
        var delegate = this.delegate;

        if (delegate && delegate.willAddRoute) {
          target = delegate.willAddRoute(this.matcher.target, target);
        }

        this.matcher.add(this.path, target);

        if (callback) {
          if (callback.length === 0) { throw new Error("You must have an argument in the function passed to `to`"); }
          this.matcher.addChild(this.path, target, callback, this.delegate);
        }
        return this;
      }
    };

    function $$route$recognizer$dsl$$Matcher(target) {
      this.routes = {};
      this.children = {};
      this.target = target;
    }

    $$route$recognizer$dsl$$Matcher.prototype = {
      add: function(path, handler) {
        this.routes[path] = handler;
      },

      addChild: function(path, target, callback, delegate) {
        var matcher = new $$route$recognizer$dsl$$Matcher(target);
        this.children[path] = matcher;

        var match = $$route$recognizer$dsl$$generateMatch(path, matcher, delegate);

        if (delegate && delegate.contextEntered) {
          delegate.contextEntered(target, match);
        }

        callback(match);
      }
    };

    function $$route$recognizer$dsl$$generateMatch(startingPath, matcher, delegate) {
      return function(path, nestedCallback) {
        var fullPath = startingPath + path;

        if (nestedCallback) {
          nestedCallback($$route$recognizer$dsl$$generateMatch(fullPath, matcher, delegate));
        } else {
          return new $$route$recognizer$dsl$$Target(startingPath + path, matcher, delegate);
        }
      };
    }

    function $$route$recognizer$dsl$$addRoute(routeArray, path, handler) {
      var len = 0;
      for (var i=0; i<routeArray.length; i++) {
        len += routeArray[i].path.length;
      }

      path = path.substr(len);
      var route = { path: path, handler: handler };
      routeArray.push(route);
    }

    function $$route$recognizer$dsl$$eachRoute(baseRoute, matcher, callback, binding) {
      var routes = matcher.routes;

      for (var path in routes) {
        if (routes.hasOwnProperty(path)) {
          var routeArray = baseRoute.slice();
          $$route$recognizer$dsl$$addRoute(routeArray, path, routes[path]);

          if (matcher.children[path]) {
            $$route$recognizer$dsl$$eachRoute(routeArray, matcher.children[path], callback, binding);
          } else {
            callback.call(binding, routeArray);
          }
        }
      }
    }

    var $$route$recognizer$dsl$$default = function(callback, addRouteCallback) {
      var matcher = new $$route$recognizer$dsl$$Matcher();

      callback($$route$recognizer$dsl$$generateMatch("", matcher, this.delegate));

      $$route$recognizer$dsl$$eachRoute([], matcher, function(route) {
        if (addRouteCallback) { addRouteCallback(this, route); }
        else { this.add(route); }
      }, this);
    };

    var $$route$recognizer$$specials = [
      '/', '.', '*', '+', '?', '|',
      '(', ')', '[', ']', '{', '}', '\\'
    ];

    var $$route$recognizer$$escapeRegex = new RegExp('(\\' + $$route$recognizer$$specials.join('|\\') + ')', 'g');

    function $$route$recognizer$$isArray(test) {
      return Object.prototype.toString.call(test) === "[object Array]";
    }

    // A Segment represents a segment in the original route description.
    // Each Segment type provides an `eachChar` and `regex` method.
    //
    // The `eachChar` method invokes the callback with one or more character
    // specifications. A character specification consumes one or more input
    // characters.
    //
    // The `regex` method returns a regex fragment for the segment. If the
    // segment is a dynamic of star segment, the regex fragment also includes
    // a capture.
    //
    // A character specification contains:
    //
    // * `validChars`: a String with a list of all valid characters, or
    // * `invalidChars`: a String with a list of all invalid characters
    // * `repeat`: true if the character specification can repeat

    function $$route$recognizer$$StaticSegment(string) { this.string = string; }
    $$route$recognizer$$StaticSegment.prototype = {
      eachChar: function(currentState) {
        var string = this.string, ch;

        for (var i=0; i<string.length; i++) {
          ch = string.charAt(i);
          currentState = currentState.put({ invalidChars: undefined, repeat: false, validChars: ch });
        }

        return currentState;
      },

      regex: function() {
        return this.string.replace($$route$recognizer$$escapeRegex, '\\$1');
      },

      generate: function() {
        return this.string;
      }
    };

    function $$route$recognizer$$DynamicSegment(name) { this.name = name; }
    $$route$recognizer$$DynamicSegment.prototype = {
      eachChar: function(currentState) {
        return currentState.put({ invalidChars: "/", repeat: true, validChars: undefined });
      },

      regex: function() {
        return "([^/]+)";
      },

      generate: function(params) {
        return params[this.name];
      }
    };

    function $$route$recognizer$$StarSegment(name) { this.name = name; }
    $$route$recognizer$$StarSegment.prototype = {
      eachChar: function(currentState) {
        return currentState.put({ invalidChars: "", repeat: true, validChars: undefined });
      },

      regex: function() {
        return "(.+)";
      },

      generate: function(params) {
        return params[this.name];
      }
    };

    function $$route$recognizer$$EpsilonSegment() {}
    $$route$recognizer$$EpsilonSegment.prototype = {
      eachChar: function(currentState) {
        return currentState;
      },
      regex: function() { return ""; },
      generate: function() { return ""; }
    };

    function $$route$recognizer$$parse(route, names, specificity) {
      // normalize route as not starting with a "/". Recognition will
      // also normalize.
      if (route.charAt(0) === "/") { route = route.substr(1); }

      var segments = route.split("/");
      var results = new Array(segments.length);

      // A routes has specificity determined by the order that its different segments
      // appear in. This system mirrors how the magnitude of numbers written as strings
      // works.
      // Consider a number written as: "abc". An example would be "200". Any other number written
      // "xyz" will be smaller than "abc" so long as `a > z`. For instance, "199" is smaller
      // then "200", even though "y" and "z" (which are both 9) are larger than "0" (the value
      // of (`b` and `c`). This is because the leading symbol, "2", is larger than the other
      // leading symbol, "1".
      // The rule is that symbols to the left carry more weight than symbols to the right
      // when a number is written out as a string. In the above strings, the leading digit
      // represents how many 100's are in the number, and it carries more weight than the middle
      // number which represents how many 10's are in the number.
      // This system of number magnitude works well for route specificity, too. A route written as
      // `a/b/c` will be more specific than `x/y/z` as long as `a` is more specific than
      // `x`, irrespective of the other parts.
      // Because of this similarity, we assign each type of segment a number value written as a
      // string. We can find the specificity of compound routes by concatenating these strings
      // together, from left to right. After we have looped through all of the segments,
      // we convert the string to a number.
      specificity.val = '';

      for (var i=0; i<segments.length; i++) {
        var segment = segments[i], match;

        if (match = segment.match(/^:([^\/]+)$/)) {
          results[i] = new $$route$recognizer$$DynamicSegment(match[1]);
          names.push(match[1]);
          specificity.val += '3';
        } else if (match = segment.match(/^\*([^\/]+)$/)) {
          results[i] = new $$route$recognizer$$StarSegment(match[1]);
          specificity.val += '1';
          names.push(match[1]);
        } else if(segment === "") {
          results[i] = new $$route$recognizer$$EpsilonSegment();
          specificity.val += '2';
        } else {
          results[i] = new $$route$recognizer$$StaticSegment(segment);
          specificity.val += '4';
        }
      }

      specificity.val = +specificity.val;

      return results;
    }

    // A State has a character specification and (`charSpec`) and a list of possible
    // subsequent states (`nextStates`).
    //
    // If a State is an accepting state, it will also have several additional
    // properties:
    //
    // * `regex`: A regular expression that is used to extract parameters from paths
    //   that reached this accepting state.
    // * `handlers`: Information on how to convert the list of captures into calls
    //   to registered handlers with the specified parameters
    // * `types`: How many static, dynamic or star segments in this route. Used to
    //   decide which route to use if multiple registered routes match a path.
    //
    // Currently, State is implemented naively by looping over `nextStates` and
    // comparing a character specification against a character. A more efficient
    // implementation would use a hash of keys pointing at one or more next states.

    function $$route$recognizer$$State(charSpec) {
      this.charSpec = charSpec;
      this.nextStates = [];
      this.charSpecs = {};
      this.regex = undefined;
      this.handlers = undefined;
      this.specificity = undefined;
    }

    $$route$recognizer$$State.prototype = {
      get: function(charSpec) {
        if (this.charSpecs[charSpec.validChars]) {
          return this.charSpecs[charSpec.validChars];
        }

        var nextStates = this.nextStates;

        for (var i=0; i<nextStates.length; i++) {
          var child = nextStates[i];

          var isEqual = child.charSpec.validChars === charSpec.validChars;
          isEqual = isEqual && child.charSpec.invalidChars === charSpec.invalidChars;

          if (isEqual) {
            this.charSpecs[charSpec.validChars] = child;
            return child;
          }
        }
      },

      put: function(charSpec) {
        var state;

        // If the character specification already exists in a child of the current
        // state, just return that state.
        if (state = this.get(charSpec)) { return state; }

        // Make a new state for the character spec
        state = new $$route$recognizer$$State(charSpec);

        // Insert the new state as a child of the current state
        this.nextStates.push(state);

        // If this character specification repeats, insert the new state as a child
        // of itself. Note that this will not trigger an infinite loop because each
        // transition during recognition consumes a character.
        if (charSpec.repeat) {
          state.nextStates.push(state);
        }

        // Return the new state
        return state;
      },

      // Find a list of child states matching the next character
      match: function(ch) {
        var nextStates = this.nextStates,
            child, charSpec, chars;

        var returned = [];

        for (var i=0; i<nextStates.length; i++) {
          child = nextStates[i];

          charSpec = child.charSpec;

          if (typeof (chars = charSpec.validChars) !== 'undefined') {
            if (chars.indexOf(ch) !== -1) { returned.push(child); }
          } else if (typeof (chars = charSpec.invalidChars) !== 'undefined') {
            if (chars.indexOf(ch) === -1) { returned.push(child); }
          }
        }

        return returned;
      }
    };

    // Sort the routes by specificity
    function $$route$recognizer$$sortSolutions(states) {
      return states.sort(function(a, b) {
        return b.specificity.val - a.specificity.val;
      });
    }

    function $$route$recognizer$$recognizeChar(states, ch) {
      var nextStates = [];

      for (var i=0, l=states.length; i<l; i++) {
        var state = states[i];

        nextStates = nextStates.concat(state.match(ch));
      }

      return nextStates;
    }

    var $$route$recognizer$$oCreate = Object.create || function(proto) {
      function F() {}
      F.prototype = proto;
      return new F();
    };

    function $$route$recognizer$$RecognizeResults(queryParams) {
      this.queryParams = queryParams || {};
    }
    $$route$recognizer$$RecognizeResults.prototype = $$route$recognizer$$oCreate({
      splice: Array.prototype.splice,
      slice:  Array.prototype.slice,
      push:   Array.prototype.push,
      length: 0,
      queryParams: null
    });

    function $$route$recognizer$$findHandler(state, path, queryParams) {
      var handlers = state.handlers, regex = state.regex;
      var captures = path.match(regex), currentCapture = 1;
      var result = new $$route$recognizer$$RecognizeResults(queryParams);

      result.length = handlers.length;

      for (var i=0; i<handlers.length; i++) {
        var handler = handlers[i], names = handler.names, params = {};

        for (var j=0; j<names.length; j++) {
          params[names[j]] = captures[currentCapture++];
        }

        result[i] = { handler: handler.handler, params: params, isDynamic: !!names.length };
      }

      return result;
    }

    function $$route$recognizer$$decodeQueryParamPart(part) {
      // http://www.w3.org/TR/html401/interact/forms.html#h-17.13.4.1
      part = part.replace(/\+/gm, '%20');
      var result;
      try {
        result = decodeURIComponent(part);
      } catch(error) {result = '';}
      return result;
    }

    // The main interface

    var $$route$recognizer$$RouteRecognizer = function() {
      this.rootState = new $$route$recognizer$$State();
      this.names = {};
    };


    $$route$recognizer$$RouteRecognizer.prototype = {
      add: function(routes, options) {
        var currentState = this.rootState, regex = "^",
            specificity = {},
            handlers = new Array(routes.length), allSegments = [], name;

        var isEmpty = true;

        for (var i=0; i<routes.length; i++) {
          var route = routes[i], names = [];

          var segments = $$route$recognizer$$parse(route.path, names, specificity);

          allSegments = allSegments.concat(segments);

          for (var j=0; j<segments.length; j++) {
            var segment = segments[j];

            if (segment instanceof $$route$recognizer$$EpsilonSegment) { continue; }

            isEmpty = false;

            // Add a "/" for the new segment
            currentState = currentState.put({ invalidChars: undefined, repeat: false, validChars: "/" });
            regex += "/";

            // Add a representation of the segment to the NFA and regex
            currentState = segment.eachChar(currentState);
            regex += segment.regex();
          }
          var handler = { handler: route.handler, names: names };
          handlers[i] = handler;
        }

        if (isEmpty) {
          currentState = currentState.put({ invalidChars: undefined, repeat: false, validChars: "/" });
          regex += "/";
        }

        currentState.handlers = handlers;
        currentState.regex = new RegExp(regex + "$");
        currentState.specificity = specificity;

        if (name = options && options.as) {
          this.names[name] = {
            segments: allSegments,
            handlers: handlers
          };
        }
      },

      handlersFor: function(name) {
        var route = this.names[name];

        if (!route) { throw new Error("There is no route named " + name); }

        var result = new Array(route.handlers.length);

        for (var i=0; i<route.handlers.length; i++) {
          result[i] = route.handlers[i];
        }

        return result;
      },

      hasRoute: function(name) {
        return !!this.names[name];
      },

      generate: function(name, params) {
        var route = this.names[name], output = "";
        if (!route) { throw new Error("There is no route named " + name); }

        var segments = route.segments;

        for (var i=0; i<segments.length; i++) {
          var segment = segments[i];

          if (segment instanceof $$route$recognizer$$EpsilonSegment) { continue; }

          output += "/";
          output += segment.generate(params);
        }

        if (output.charAt(0) !== '/') { output = '/' + output; }

        if (params && params.queryParams) {
          output += this.generateQueryString(params.queryParams, route.handlers);
        }

        return output;
      },

      generateQueryString: function(params, handlers) {
        var pairs = [];
        var keys = [];
        for(var key in params) {
          if (params.hasOwnProperty(key)) {
            keys.push(key);
          }
        }
        keys.sort();
        for (var i = 0; i < keys.length; i++) {
          key = keys[i];
          var value = params[key];
          if (value == null) {
            continue;
          }
          var pair = encodeURIComponent(key);
          if ($$route$recognizer$$isArray(value)) {
            for (var j = 0; j < value.length; j++) {
              var arrayPair = key + '[]' + '=' + encodeURIComponent(value[j]);
              pairs.push(arrayPair);
            }
          } else {
            pair += "=" + encodeURIComponent(value);
            pairs.push(pair);
          }
        }

        if (pairs.length === 0) { return ''; }

        return "?" + pairs.join("&");
      },

      parseQueryString: function(queryString) {
        var pairs = queryString.split("&"), queryParams = {};
        for(var i=0; i < pairs.length; i++) {
          var pair      = pairs[i].split('='),
              key       = $$route$recognizer$$decodeQueryParamPart(pair[0]),
              keyLength = key.length,
              isArray = false,
              value;
          if (pair.length === 1) {
            value = 'true';
          } else {
            //Handle arrays
            if (keyLength > 2 && key.slice(keyLength -2) === '[]') {
              isArray = true;
              key = key.slice(0, keyLength - 2);
              if(!queryParams[key]) {
                queryParams[key] = [];
              }
            }
            value = pair[1] ? $$route$recognizer$$decodeQueryParamPart(pair[1]) : '';
          }
          if (isArray) {
            queryParams[key].push(value);
          } else {
            queryParams[key] = value;
          }
        }
        return queryParams;
      },

      recognize: function(path) {
        var states = [ this.rootState ],
            pathLen, i, l, queryStart, queryParams = {},
            isSlashDropped = false;

        queryStart = path.indexOf('?');
        if (queryStart !== -1) {
          var queryString = path.substr(queryStart + 1, path.length);
          path = path.substr(0, queryStart);
          queryParams = this.parseQueryString(queryString);
        }

        path = decodeURI(path);

        if (path.charAt(0) !== "/") { path = "/" + path; }

        pathLen = path.length;
        if (pathLen > 1 && path.charAt(pathLen - 1) === "/") {
          path = path.substr(0, pathLen - 1);
          isSlashDropped = true;
        }

        for (i=0; i<path.length; i++) {
          states = $$route$recognizer$$recognizeChar(states, path.charAt(i));
          if (!states.length) { break; }
        }

        var solutions = [];
        for (i=0; i<states.length; i++) {
          if (states[i].handlers) { solutions.push(states[i]); }
        }

        states = $$route$recognizer$$sortSolutions(solutions);

        var state = solutions[0];

        if (state && state.handlers) {
          // if a trailing slash was dropped and a star segment is the last segment
          // specified, put the trailing slash back
          if (isSlashDropped && state.regex.source.slice(-5) === "(.+)$") {
            path = path + "/";
          }
          return $$route$recognizer$$findHandler(state, path, queryParams);
        }
      }
    };

    $$route$recognizer$$RouteRecognizer.prototype.map = $$route$recognizer$dsl$$default;

    $$route$recognizer$$RouteRecognizer.VERSION = '0.1.11';

    var $$route$recognizer$$default = $$route$recognizer$$RouteRecognizer;

    /* global define:true module:true window: true */
    if (typeof define === 'function' && define['amd']) {
      define('route-recognizer', function() { return $$route$recognizer$$default; });
    } else if (typeof module !== 'undefined' && module['exports']) {
      module['exports'] = $$route$recognizer$$default;
    } else if (typeof this !== 'undefined') {
      this['RouteRecognizer'] = $$route$recognizer$$default;
    }
}).call(this);


},{}],54:[function(require,module,exports){
((typeof define === "function" && define.amd && function (m) { define("samsam", m); }) ||
 (typeof module === "object" &&
      function (m) { module.exports = m(); }) || // Node
 function (m) { this.samsam = m(); } // Browser globals
)(function () {
    var o = Object.prototype;
    var div = typeof document !== "undefined" && document.createElement("div");

    function isNaN(value) {
        // Unlike global isNaN, this avoids type coercion
        // typeof check avoids IE host object issues, hat tip to
        // lodash
        var val = value; // JsLint thinks value !== value is "weird"
        return typeof value === "number" && value !== val;
    }

    function getClass(value) {
        // Returns the internal [[Class]] by calling Object.prototype.toString
        // with the provided value as this. Return value is a string, naming the
        // internal class, e.g. "Array"
        return o.toString.call(value).split(/[ \]]/)[1];
    }

    /**
     * @name samsam.isArguments
     * @param Object object
     *
     * Returns ``true`` if ``object`` is an ``arguments`` object,
     * ``false`` otherwise.
     */
    function isArguments(object) {
        if (getClass(object) === 'Arguments') { return true; }
        if (typeof object !== "object" || typeof object.length !== "number" ||
                getClass(object) === "Array") {
            return false;
        }
        if (typeof object.callee == "function") { return true; }
        try {
            object[object.length] = 6;
            delete object[object.length];
        } catch (e) {
            return true;
        }
        return false;
    }

    /**
     * @name samsam.isElement
     * @param Object object
     *
     * Returns ``true`` if ``object`` is a DOM element node. Unlike
     * Underscore.js/lodash, this function will return ``false`` if ``object``
     * is an *element-like* object, i.e. a regular object with a ``nodeType``
     * property that holds the value ``1``.
     */
    function isElement(object) {
        if (!object || object.nodeType !== 1 || !div) { return false; }
        try {
            object.appendChild(div);
            object.removeChild(div);
        } catch (e) {
            return false;
        }
        return true;
    }

    /**
     * @name samsam.keys
     * @param Object object
     *
     * Return an array of own property names.
     */
    function keys(object) {
        var ks = [], prop;
        for (prop in object) {
            if (o.hasOwnProperty.call(object, prop)) { ks.push(prop); }
        }
        return ks;
    }

    /**
     * @name samsam.isDate
     * @param Object value
     *
     * Returns true if the object is a ``Date``, or *date-like*. Duck typing
     * of date objects work by checking that the object has a ``getTime``
     * function whose return value equals the return value from the object's
     * ``valueOf``.
     */
    function isDate(value) {
        return typeof value.getTime == "function" &&
            value.getTime() == value.valueOf();
    }

    /**
     * @name samsam.isNegZero
     * @param Object value
     *
     * Returns ``true`` if ``value`` is ``-0``.
     */
    function isNegZero(value) {
        return value === 0 && 1 / value === -Infinity;
    }

    /**
     * @name samsam.equal
     * @param Object obj1
     * @param Object obj2
     *
     * Returns ``true`` if two objects are strictly equal. Compared to
     * ``===`` there are two exceptions:
     *
     *   - NaN is considered equal to NaN
     *   - -0 and +0 are not considered equal
     */
    function identical(obj1, obj2) {
        if (obj1 === obj2 || (isNaN(obj1) && isNaN(obj2))) {
            return obj1 !== 0 || isNegZero(obj1) === isNegZero(obj2);
        }
    }


    /**
     * @name samsam.deepEqual
     * @param Object obj1
     * @param Object obj2
     *
     * Deep equal comparison. Two values are "deep equal" if:
     *
     *   - They are equal, according to samsam.identical
     *   - They are both date objects representing the same time
     *   - They are both arrays containing elements that are all deepEqual
     *   - They are objects with the same set of properties, and each property
     *     in ``obj1`` is deepEqual to the corresponding property in ``obj2``
     *
     * Supports cyclic objects.
     */
    function deepEqualCyclic(obj1, obj2) {

        // used for cyclic comparison
        // contain already visited objects
        var objects1 = [],
            objects2 = [],
        // contain pathes (position in the object structure)
        // of the already visited objects
        // indexes same as in objects arrays
            paths1 = [],
            paths2 = [],
        // contains combinations of already compared objects
        // in the manner: { "$1['ref']$2['ref']": true }
            compared = {};

        /**
         * used to check, if the value of a property is an object
         * (cyclic logic is only needed for objects)
         * only needed for cyclic logic
         */
        function isObject(value) {

            if (typeof value === 'object' && value !== null &&
                    !(value instanceof Boolean) &&
                    !(value instanceof Date)    &&
                    !(value instanceof Number)  &&
                    !(value instanceof RegExp)  &&
                    !(value instanceof String)) {

                return true;
            }

            return false;
        }

        /**
         * returns the index of the given object in the
         * given objects array, -1 if not contained
         * only needed for cyclic logic
         */
        function getIndex(objects, obj) {

            var i;
            for (i = 0; i < objects.length; i++) {
                if (objects[i] === obj) {
                    return i;
                }
            }

            return -1;
        }

        // does the recursion for the deep equal check
        return (function deepEqual(obj1, obj2, path1, path2) {
            var type1 = typeof obj1;
            var type2 = typeof obj2;

            // == null also matches undefined
            if (obj1 === obj2 ||
                    isNaN(obj1) || isNaN(obj2) ||
                    obj1 == null || obj2 == null ||
                    type1 !== "object" || type2 !== "object") {

                return identical(obj1, obj2);
            }

            // Elements are only equal if identical(expected, actual)
            if (isElement(obj1) || isElement(obj2)) { return false; }

            var isDate1 = isDate(obj1), isDate2 = isDate(obj2);
            if (isDate1 || isDate2) {
                if (!isDate1 || !isDate2 || obj1.getTime() !== obj2.getTime()) {
                    return false;
                }
            }

            if (obj1 instanceof RegExp && obj2 instanceof RegExp) {
                if (obj1.toString() !== obj2.toString()) { return false; }
            }

            var class1 = getClass(obj1);
            var class2 = getClass(obj2);
            var keys1 = keys(obj1);
            var keys2 = keys(obj2);

            if (isArguments(obj1) || isArguments(obj2)) {
                if (obj1.length !== obj2.length) { return false; }
            } else {
                if (type1 !== type2 || class1 !== class2 ||
                        keys1.length !== keys2.length) {
                    return false;
                }
            }

            var key, i, l,
                // following vars are used for the cyclic logic
                value1, value2,
                isObject1, isObject2,
                index1, index2,
                newPath1, newPath2;

            for (i = 0, l = keys1.length; i < l; i++) {
                key = keys1[i];
                if (!o.hasOwnProperty.call(obj2, key)) {
                    return false;
                }

                // Start of the cyclic logic

                value1 = obj1[key];
                value2 = obj2[key];

                isObject1 = isObject(value1);
                isObject2 = isObject(value2);

                // determine, if the objects were already visited
                // (it's faster to check for isObject first, than to
                // get -1 from getIndex for non objects)
                index1 = isObject1 ? getIndex(objects1, value1) : -1;
                index2 = isObject2 ? getIndex(objects2, value2) : -1;

                // determine the new pathes of the objects
                // - for non cyclic objects the current path will be extended
                //   by current property name
                // - for cyclic objects the stored path is taken
                newPath1 = index1 !== -1
                    ? paths1[index1]
                    : path1 + '[' + JSON.stringify(key) + ']';
                newPath2 = index2 !== -1
                    ? paths2[index2]
                    : path2 + '[' + JSON.stringify(key) + ']';

                // stop recursion if current objects are already compared
                if (compared[newPath1 + newPath2]) {
                    return true;
                }

                // remember the current objects and their pathes
                if (index1 === -1 && isObject1) {
                    objects1.push(value1);
                    paths1.push(newPath1);
                }
                if (index2 === -1 && isObject2) {
                    objects2.push(value2);
                    paths2.push(newPath2);
                }

                // remember that the current objects are already compared
                if (isObject1 && isObject2) {
                    compared[newPath1 + newPath2] = true;
                }

                // End of cyclic logic

                // neither value1 nor value2 is a cycle
                // continue with next level
                if (!deepEqual(value1, value2, newPath1, newPath2)) {
                    return false;
                }
            }

            return true;

        }(obj1, obj2, '$1', '$2'));
    }

    var match;

    function arrayContains(array, subset) {
        if (subset.length === 0) { return true; }
        var i, l, j, k;
        for (i = 0, l = array.length; i < l; ++i) {
            if (match(array[i], subset[0])) {
                for (j = 0, k = subset.length; j < k; ++j) {
                    if (!match(array[i + j], subset[j])) { return false; }
                }
                return true;
            }
        }
        return false;
    }

    /**
     * @name samsam.match
     * @param Object object
     * @param Object matcher
     *
     * Compare arbitrary value ``object`` with matcher.
     */
    match = function match(object, matcher) {
        if (matcher && typeof matcher.test === "function") {
            return matcher.test(object);
        }

        if (typeof matcher === "function") {
            return matcher(object) === true;
        }

        if (typeof matcher === "string") {
            matcher = matcher.toLowerCase();
            var notNull = typeof object === "string" || !!object;
            return notNull &&
                (String(object)).toLowerCase().indexOf(matcher) >= 0;
        }

        if (typeof matcher === "number") {
            return matcher === object;
        }

        if (typeof matcher === "boolean") {
            return matcher === object;
        }

        if (typeof(matcher) === "undefined") {
            return typeof(object) === "undefined";
        }

        if (matcher === null) {
            return object === null;
        }

        if (getClass(object) === "Array" && getClass(matcher) === "Array") {
            return arrayContains(object, matcher);
        }

        if (matcher && typeof matcher === "object") {
            if (matcher === object) {
                return true;
            }
            var prop;
            for (prop in matcher) {
                var value = object[prop];
                if (typeof value === "undefined" &&
                        typeof object.getAttribute === "function") {
                    value = object.getAttribute(prop);
                }
                if (matcher[prop] === null || typeof matcher[prop] === 'undefined') {
                    if (value !== matcher[prop]) {
                        return false;
                    }
                } else if (typeof  value === "undefined" || !match(value, matcher[prop])) {
                    return false;
                }
            }
            return true;
        }

        throw new Error("Matcher was not a string, a number, a " +
                        "function, a boolean or an object");
    };

    return {
        isArguments: isArguments,
        isElement: isElement,
        isDate: isDate,
        isNegZero: isNegZero,
        identical: identical,
        deepEqual: deepEqualCyclic,
        match: match,
        keys: keys
    };
});

},{}],55:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ajax = require('../ajax');

var _ajax2 = _interopRequireDefault(_ajax);

var _coreObject = require('../metal/core-object');

var _coreObject2 = _interopRequireDefault(_coreObject);

var _version = require('../version');

var _version2 = _interopRequireDefault(_version);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ListingsAdapter = _coreObject2.default.extend({
  ajax: _ajax2.default,

  constructor: function constructor(config) {
    this.config = config;
  },


  get base64ApiKey() {
    return btoa(this.config.apiKey);
  },

  get baseUrl() {
    var _config = this.config;
    var domain = _config.domain;
    var appId = _config.appId;


    return 'https://' + domain + '/api/apps/' + appId;
  },

  get headers() {
    return {
      Authorization: 'Basic ' + this.base64ApiKey,
      'Content-Type': 'application/json',
      'X-SDK-Variant': 'javascript',
      'X-SDK-Version': _version2.default

    };
  },

  pathForType: function pathForType(type) {
    return '/' + type.slice(0, -1) + '_listings';
  },
  buildUrl: function buildUrl(singleOrMultiple, type, idOrQuery) {
    switch (singleOrMultiple) {
      case 'multiple':
        return this.buildMultipleUrl(type, idOrQuery);
      case 'single':
        return this.buildSingleUrl(type, idOrQuery);
      default:
        return '';
    }
  },
  buildMultipleUrl: function buildMultipleUrl(type) {
    var query = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    var url = '' + this.baseUrl + this.pathForType(type);
    var paramNames = Object.keys(query);

    if (paramNames.length > 0) {
      var queryString = paramNames.map(function (key) {
        var value = void 0;

        if (Array.isArray(query[key])) {
          value = query[key].join(',');
        } else {
          value = query[key];
        }

        return key + '=' + encodeURIComponent(value);
      }).join('&');

      return url + '?' + queryString;
    }

    return url;
  },
  buildSingleUrl: function buildSingleUrl(type, id) {
    return '' + this.baseUrl + this.pathForType(type) + '/' + id;
  },
  fetchMultiple: function fetchMultiple() /* type, [query] */{
    var url = this.buildUrl.apply(this, ['multiple'].concat(Array.prototype.slice.call(arguments)));

    return this.ajax('GET', url, { headers: this.headers }).then(function (response) {
      return response.json;
    });
  },
  fetchSingle: function fetchSingle() /* type, id */{
    var url = this.buildUrl.apply(this, ['single'].concat(Array.prototype.slice.call(arguments)));

    return this.ajax('GET', url, { headers: this.headers }).then(function (response) {
      return response.json;
    });
  }
});

exports.default = ListingsAdapter;
},{"../ajax":57,"../metal/core-object":64,"../version":84}],56:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _coreObject = require('../metal/core-object');

var _coreObject2 = _interopRequireDefault(_coreObject);

var _setGuidFor = require('../metal/set-guid-for');

var _setGuidFor2 = _interopRequireDefault(_setGuidFor);

var _store = require('../store');

var _store2 = _interopRequireDefault(_store);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var LocalStorageAdapter = _coreObject2.default.extend({
  constructor: function constructor() {
    this.store = new _store2.default();
  },
  idKeyForType: function idKeyForType() /* type */{
    return _setGuidFor.GUID_KEY;
  },
  fetchSingle: function fetchSingle(type, id) {
    var _this = this;

    return new Promise(function (resolve, reject) {
      var value = _this.store.getItem(_this.storageKey(type, id));

      if (value === null) {
        reject(new Error(type + '#' + id + ' not found'));

        return;
      }

      resolve(value);
    });
  },
  create: function create(type, payload) {
    var _this2 = this;

    return new Promise(function (resolve) {
      var id = _this2.identify(payload);

      _this2.store.setItem(_this2.storageKey(type, id), payload);
      resolve(payload);
    });
  },
  update: function update(type, id, payload) {
    var _this3 = this;

    return new Promise(function (resolve) {
      _this3.store.setItem(_this3.storageKey(type, id), payload);
      resolve(payload);
    });
  },
  storageKey: function storageKey(type, id) {
    return type + '.' + id;
  },
  identify: function identify(payload) {
    var keys = Object.keys(payload);

    if (keys.length === 1 && _typeof(payload[keys[0]]) === 'object') {
      return (0, _setGuidFor2.default)(payload[keys[0]]);
    }

    return (0, _setGuidFor2.default)(payload);
  }
});

exports.default = LocalStorageAdapter;
},{"../metal/core-object":64,"../metal/set-guid-for":69,"../store":83}],57:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = ajax;

var _ie9Ajax = require('./ie9-ajax');

var _ie9Ajax2 = _interopRequireDefault(_ie9Ajax);

var _global = require('./metal/global');

var _global2 = _interopRequireDefault(_global);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }

  var error = new Error(response.statusText);

  error.status = response.status;
  error.response = response;
  throw error;
}

function parseResponse(response) {
  return response.json().then(function (json) {
    return { json: json, originalResponse: response, isJSON: true };
  }).catch(function () {
    var responseClone = response.clone();

    return responseClone.text().then(function (text) {
      return { text: text, originalResponse: responseClone, isText: true };
    });
  });
}

function ajax(method, url) {
  var opts = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

  if (_global2.default.XDomainRequest) {
    return _ie9Ajax2.default.apply(undefined, arguments);
  }

  opts.method = method;
  opts.mode = 'cors';

  return fetch(url, opts).then(checkStatus).then(parseResponse);
}
},{"./ie9-ajax":59,"./metal/global":66}],58:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _coreObject = require('./metal/core-object');

var _coreObject2 = _interopRequireDefault(_coreObject);

var _logger = require('./logger');

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @module shopify-buy
 * @submodule config
 */

var Config = _coreObject2.default.extend({
  /**
   * @class Config
   * @constructor
   * @param {Object} attrs An object of required config data.
   * @param {String} attrs.apiKey Your api client's public token
   * @param {String} attrs.appId The app whose listings the client will be
   * using. If you are just modifying a buy button, the buy-button's app id is
   * 6. Otherwise, obtain the app id of the app you're modifying or extending.
   * @param {String} attrs.domain Your shop's full domain. (i.e. `craftedgoods.myshopify.com`)
   */

  constructor: function constructor(attrs) {
    var _this = this;

    Object.keys(this.deprecatedProperties).forEach(function (key) {
      if (attrs.hasOwnProperty(key)) {
        var transformName = _this.deprecatedProperties[key];
        var transform = _this[transformName];

        transform(attrs[key], attrs);
      }
    });
    this.requiredProperties.forEach(function (key) {
      if (!attrs.hasOwnProperty(key)) {
        throw new Error('new Config() requires the option \'' + key + '\'');
      } else {
        _this[key] = attrs[key];
      }
    });
  },


  /**
   * An object with keys for deprecated properties and values as functions that
   * will transform the value into a usable value. A depracation transform should
   * have the value signature function(deprecated_value, config_to_be_transformed)
   * @attribute deprecatedProperties
   * @default { myShopifyDomain: this.transformMyShopifyDomain }
   * @type Object
   * @private
   */
  deprecatedProperties: {
    myShopifyDomain: 'transformMyShopifyDomain'
  },

  /**
   * Transform the myShopifyDomain config to a domain config.
   * @method transformMyShopifyDomain
   * @static
   * @private
   * @param {String} subdomain The original subdomain on myshopify.com
   * @param {Object} attrs. The config attributes to be transformed to a
   * non-deprecated state.
   * @return {Object} the transformed config attributes.
   */
  transformMyShopifyDomain: function transformMyShopifyDomain(subdomain, attrs) {
    _logger2.default.warn('Config - ', 'myShopifyDomain is deprecated, please use domain and provide the full shop domain.');
    attrs.domain = subdomain + '.myshopify.com';
  },


  /**
   * Properties that must be set on initializations
   * @attribute requiredProperties
   * @default ['apiKey', 'appId', 'myShopifyDomain']
   * @type Array
   * @private
   */
  requiredProperties: ['apiKey', 'appId', 'domain'],

  /**
   * The apiKey for authenticating against shopify. This is your api client's
   * public api token. Not the shared secret. Set during initialation.
   * @attribute apiKey
   * @default ''
   * @type String
   * @public
   */
  apiKey: '',

  /**
   * @attribute appId
   * @default ''
   * @type String
   * @public
   */
  appId: '',

  /**
   * The domain that all the api requests will go to
   * @attribute domain
   * @default ''
   * @type String
   * @public
   */
  domain: '',

  /**
   * The subdomain of myshopify.io that all the api requests will go to
   * @attribute myShopifyDomain
   * @default ''
   * @type String
   * @public
   * @deprecated Use `config.domain` instead.
   */
  myShopifyDomain: ''
});

exports.default = Config;
},{"./logger":62,"./metal/core-object":64}],59:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
function authToUrl(url, opts) {
  var authorization = void 0;

  if (opts.headers) {
    Object.keys(opts.headers).forEach(function (key) {
      if (key.toLowerCase() === 'authorization') {
        authorization = opts.headers[key];
      }
    });
  }

  if (authorization) {
    var hashedKey = authorization.split(' ').slice(-1)[0];

    try {
      var plainKey = atob(hashedKey);

      var newUrl = void 0;

      if (url.indexOf('?') > -1) {
        newUrl = url + '&_x_http_authorization=' + plainKey;
      } else {
        newUrl = url + '?_x_http_authorization=' + plainKey;
      }

      return newUrl;
    } catch (e) {
      // atob choked on non-encoded data. Therefore, not a form of auth we
      // support.
      //
      // NOOP
      //
    }
  }

  /* eslint newline-before-return: 0 */
  return url;
}

function ie9Ajax(method, url, opts) {
  return new Promise(function (resolve, reject) {
    var xdr = new XDomainRequest();

    xdr.onload = function () {
      try {
        var json = JSON.parse(xdr.responseText);

        resolve({ json: json, originalResponse: xdr, isJSON: true });
      } catch (e) {
        resolve({ text: xdr.responseText, originalResponse: xdr, isText: true });
      }
    };

    function handleError() {
      reject(new Error('There was an error with the XDR'));
    }

    xdr.onerror = handleError;
    xdr.ontimeout = handleError;

    xdr.open(method, authToUrl(url, opts));
    xdr.send(opts.data);
  });
}

exports.default = ie9Ajax;
},{}],60:[function(require,module,exports){
(function (Buffer){
'use strict';

var _global = require('./metal/global');

var _global2 = _interopRequireDefault(_global);

var _isNodeLikeEnvironment = require('./metal/is-node-like-environment');

var _isNodeLikeEnvironment2 = _interopRequireDefault(_isNodeLikeEnvironment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* global Buffer */

var btoa = _global2.default.btoa;

if (!btoa && (0, _isNodeLikeEnvironment2.default)()) {
  _global2.default.btoa = function (string) {
    return new Buffer(string).toString('base64');
  };
}
}).call(this,require("buffer").Buffer)
},{"./metal/global":66,"./metal/is-node-like-environment":68,"buffer":3}],61:[function(require,module,exports){
'use strict';

var _global = require('./metal/global');

var _global2 = _interopRequireDefault(_global);

var _isNodeLikeEnvironment = require('./metal/is-node-like-environment');

var _isNodeLikeEnvironment2 = _interopRequireDefault(_isNodeLikeEnvironment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* globals require */

var fetch = _global2.default.fetch;

if (!fetch && (0, _isNodeLikeEnvironment2.default)()) {
  /* this indirection is needed because babel throws errors when
   * transpiling require('node-fetch') using `amd` plugin with babel6
   */
  var localRequire = require;

  _global2.default.fetch = localRequire('node-fetch');
  _global2.default.Response = _global2.default.fetch.Response;
}
},{"./metal/global":66,"./metal/is-node-like-environment":68}],62:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.wrapConsole = undefined;

var _coreObject = require('./metal/core-object');

var _coreObject2 = _interopRequireDefault(_coreObject);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function wrapConsole(logCommand) {
  var logMethod = function logMethod() {
    /* eslint-disable no-console */
    if (console[logCommand]) {
      var _console;

      (_console = console)[logCommand].apply(_console, arguments);
    } else {
      var _console2;

      (_console2 = console).log.apply(_console2, arguments);
    }
    /* eslint-enable no-console */
  };

  return function () {
    var args = [].concat(Array.prototype.slice.call(arguments));

    args.unshift('[JS-BUY-SDK]: ');
    logMethod.apply(undefined, _toConsumableArray(args));
  };
}

var Logger = _coreObject2.default.extend({
  /**
   * Wrapper around the console log so in the future we can have better dev output.
   * Also allows us to disable output in production.
   * @class Logger
   * @constructor
   */

  constructor: function constructor() {},

  debug: wrapConsole('debug'),
  info: wrapConsole('info'),
  warn: wrapConsole('warn'),
  error: wrapConsole('error')
});

exports.wrapConsole = wrapConsole;
exports.default = new Logger();
},{"./metal/core-object":64}],63:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
/* eslint no-undefined: 0 */

var assign = void 0;

if (typeof Object.assign === 'function') {
  assign = Object.assign;
} else {
  assign = function assign(target) {
    if (target === undefined || target === null) {
      throw new TypeError('Cannot convert undefined or null to object');
    }

    var output = Object(target);

    var propertyObjects = [].slice.call(arguments, 1);

    if (propertyObjects.length > 0) {
      propertyObjects.forEach(function (source) {
        if (source !== undefined && source !== null) {
          var nextKey = void 0;

          for (nextKey in source) {
            if (source.hasOwnProperty(nextKey)) {
              output[nextKey] = source[nextKey];
            }
          }
        }
      });
    }

    return output;
  };
}

exports.default = assign;
},{}],64:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = require('./create-class');

var _createClass2 = _interopRequireDefault(_createClass);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var CoreObject = (0, _createClass2.default)({
  constructor: function constructor() {},


  static: {
    extend: function extend(subClassProps) {
      return (0, _createClass2.default)(subClassProps, this);
    }
  }
});

exports.default = CoreObject;
},{"./create-class":65}],65:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _assign = require('./assign');

var _assign2 = _interopRequireDefault(_assign);

var _includes = require('./includes');

var _includes2 = _interopRequireDefault(_includes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function wrap(func, superFunc) {
  function superWrapper() {
    var originalSuper = this.super;

    this.super = function () {
      return superFunc.apply(this, arguments);
    };

    var ret = func.apply(this, arguments);

    this.super = originalSuper;

    return ret;
  }

  superWrapper.wrappedFunction = func;

  return superWrapper;
}

function defineProperties(names, proto, destination) {
  var parentProto = Object.getPrototypeOf(destination);

  names.forEach(function (name) {
    var descriptor = Object.getOwnPropertyDescriptor(proto, name);
    var parentDescriptor = parentProto.hasOwnProperty(name) && Object.getOwnPropertyDescriptor(parentProto, name);

    if (typeof parentDescriptor.value === 'function' && typeof descriptor.value === 'function') {
      var wrappedFunction = wrap(descriptor.value, parentDescriptor.value);

      Object.defineProperty(destination, name, { value: wrappedFunction });
    } else {
      Object.defineProperty(destination, name, descriptor);
    }
  });
}

function createClass(props) {
  var parent = arguments.length <= 1 || arguments[1] === undefined ? Object : arguments[1];

  var Constructor = wrap(props.constructor, parent);
  var instancePropertyNames = Object.getOwnPropertyNames(props).filter(function (key) {
    return !(0, _includes2.default)(['constructor', 'static'], key);
  });

  (0, _assign2.default)(Constructor, parent);

  Constructor.prototype = Object.create(parent.prototype);
  defineProperties(instancePropertyNames, props, Constructor.prototype);
  Constructor.prototype.constructor = Constructor;

  var staticProps = props.static;

  if (staticProps) {
    var staticPropertyNames = Object.getOwnPropertyNames(staticProps);

    defineProperties(staticPropertyNames, staticProps, Constructor);
  }

  return Constructor;
}

exports.default = createClass;
},{"./assign":63,"./includes":67}],66:[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
/* global global */

var globalNamespace = void 0;

if (typeof global === 'undefined') {
  globalNamespace = window;
} else {
  globalNamespace = global;
}

exports.default = globalNamespace;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],67:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var includes = void 0;

if (!Array.prototype.includes) {
  includes = function includes(array, searchElement) {
    var ObjectifiedArray = Object(array);
    var length = parseInt(ObjectifiedArray.length, 10) || 0;

    if (length === 0) {
      return false;
    }

    var startIndex = parseInt(arguments[1], 10) || 0;
    var index = void 0;

    if (startIndex >= 0) {
      index = startIndex;
    } else {
      index = length + startIndex;

      if (index < 0) {
        index = 0;
      }
    }

    while (index < length) {
      var currentElement = ObjectifiedArray[index];

      /* eslint no-self-compare:0 */
      if (searchElement === currentElement || searchElement !== searchElement && currentElement !== currentElement) {
        // NaN !== NaN
        return true;
      }
      index++;
    }

    return false;
  };
} else {
  includes = function includes(array) {
    var args = [].slice.call(arguments, 1);

    return Array.prototype.includes.apply(array, args);
  };
}

exports.default = includes;
},{}],68:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = isNodeLikeEnvironment;
function isNodeLikeEnvironment() {
  var windowAbsent = typeof window === 'undefined';
  var requirePresent = typeof require === 'function';

  return windowAbsent && requirePresent;
}
},{}],69:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

/* eslint no-undefined: 0 complexity: 0 */

var GUID_KEY = 'shopify-buy-uuid';

var GUID_PREFIX = 'shopify-buy.' + Date.now();

var GUID_DESC = {
  writable: true,
  configurable: true,
  enumerable: true,
  value: null
};

var uuidSeed = 0;

function uuid() {
  return ++uuidSeed;
}

var numberCache = {};
var stringCache = {};

function setGuidFor(obj) {
  if (obj && obj[GUID_KEY]) {
    return obj[GUID_KEY];
  }

  if (obj === undefined) {
    return '(undefined)';
  }

  if (obj === null) {
    return '(null)';
  }

  var type = typeof obj === 'undefined' ? 'undefined' : _typeof(obj);
  var id = void 0;

  switch (type) {
    case 'number':
      id = numberCache[obj];

      if (!id) {
        id = numberCache[obj] = 'nu' + obj;
      }

      break;

    case 'string':
      id = stringCache[obj];

      if (!id) {
        id = stringCache[obj] = 'st' + uuid();
      }

      break;

    case 'boolean':
      if (obj) {
        id = '(true)';
      } else {
        id = '(false)';
      }

      break;

    default:
      if (obj === Object) {
        id = '(Object)';
        break;
      }

      if (obj === Array) {
        id = '(Array)';
        break;
      }

      id = GUID_PREFIX + '.' + uuid();

      if (obj[GUID_KEY] === null) {
        obj[GUID_KEY] = id;
      } else {
        GUID_DESC.value = id;
        Object.defineProperty(obj, GUID_KEY, GUID_DESC);
      }
  }

  return id;
}

exports.default = setGuidFor;
exports.GUID_KEY = GUID_KEY;
},{}],70:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (array) {
  return array.reduce(function (uniqueArray, item) {
    if (uniqueArray.indexOf(item) < 0) {
      uniqueArray.push(item);
    }

    return uniqueArray;
  }, []);
};
},{}],71:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _coreObject = require('../metal/core-object');

var _coreObject2 = _interopRequireDefault(_coreObject);

var _assign = require('../metal/assign');

var _assign2 = _interopRequireDefault(_assign);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var BaseModel = _coreObject2.default.extend({
  constructor: function constructor() {
    var attrs = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
    var metaAttrs = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    this.attrs = attrs;

    (0, _assign2.default)(this, metaAttrs);
  },

  attrs: null,
  serializer: null,
  adapter: null,
  shopClient: null
});

exports.default = BaseModel;
},{"../metal/assign":63,"../metal/core-object":64}],72:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _baseModel = require('./base-model');

var _baseModel2 = _interopRequireDefault(_baseModel);

var _setGuidFor = require('../metal/set-guid-for');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var CartLineItem = _baseModel2.default.extend({
  constructor: function constructor() {
    this.super.apply(this, arguments);
  },


  get id() {
    return this.attrs[_setGuidFor.GUID_KEY];
  },

  get variant_id() {
    return this.attrs.variant_id;
  },

  get product_id() {
    return this.attrs.product_id;
  },

  get image() {
    return this.attrs.image;
  },

  get title() {
    return this.attrs.title;
  },

  get quantity() {
    return this.attrs.quantity;
  },

  set quantity(value) {
    var parsedValue = parseInt(value, 10);

    if (parsedValue < 0) {
      throw new Error('Quantities must be positive');
    } else if (parsedValue !== parseFloat(value)) {
      /* incidentally, this covers all NaN values, because NaN !== Nan */
      throw new Error('Quantities must be whole numbers');
    }

    this.attrs.quantity = parsedValue;

    return this.attrs.quantity;
  },

  get properties() {
    return this.attrs.properties || {};
  },

  set properties(value) {
    this.attrs.properties = value || {};

    return value;
  },

  get variant_title() {
    return this.attrs.variant_title;
  },

  get price() {
    return this.attrs.price;
  },

  get compare_at_price() {
    return this.attrs.compare_at_price;
  },

  get line_price() {
    return (this.quantity * parseFloat(this.price)).toFixed(2);
  },

  get grams() {
    return this.attrs.grams;
  }
});

exports.default = CartLineItem;
},{"../metal/set-guid-for":69,"./base-model":71}],73:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _baseModel = require('./base-model');

var _baseModel2 = _interopRequireDefault(_baseModel);

var _cartLineItemModel = require('./cart-line-item-model');

var _cartLineItemModel2 = _interopRequireDefault(_cartLineItemModel);

var _assign = require('../metal/assign');

var _assign2 = _interopRequireDefault(_assign);

var _setGuidFor = require('../metal/set-guid-for');

var _setGuidFor2 = _interopRequireDefault(_setGuidFor);

var _global = require('../metal/global');

var _global2 = _interopRequireDefault(_global);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function objectsEqual(one, two) {
  if (one === two) {
    return true;
  }

  return Object.keys(one).every(function (key) {
    if (one[key] instanceof Date) {
      return one[key].toString() === two[key].toString();
    } else if (_typeof(one[key]) === 'object') {
      return objectsEqual(one[key], two[key]);
    }

    return one[key] === two[key];
  });
}

var CartModel = _baseModel2.default.extend({

  /**
    * Class for cart model
    * @class CartModel
    * @constructor
  */

  constructor: function constructor() {
    this.super.apply(this, arguments);
  },


  /**
    * get ID for current cart
    * @property id
    * @type {String}
  */
  get id() {
    return this.attrs[_setGuidFor.GUID_KEY];
  },

  /**
    * Get current line items for cart
    * @property lineItems
    * @type {Array}
  */
  get lineItems() {
    return (this.attrs.line_items || []).map(function (item) {
      return new _cartLineItemModel2.default(item);
    });
  },

  /**
    * Gets the sum quantity of each line item
    * @property lineItemCount
    * @type {Number}
  */
  get lineItemCount() {
    return this.lineItems.reduce(function (total, item) {
      return total + item.quantity;
    }, 0);
  },

  /**
    * Get current subtotal price for all line items
    * @property subtotal
    * @type {String}
  */
  get subtotal() {
    var subtotal = this.lineItems.reduce(function (runningTotal, lineItem) {
      return runningTotal + parseFloat(lineItem.line_price);
    }, 0);

    return subtotal.toFixed(2);
  },

  /**
    * Get checkout URL for current cart
    * @property checkoutUrl
    * @type {String}
  */
  get checkoutUrl() {
    var config = this.config;
    var baseUrl = 'https://' + config.domain + '/cart';

    var variantPath = this.lineItems.map(function (item) {
      return item.variant_id + ':' + item.quantity;
    });

    var query = 'api_key=' + config.apiKey;

    if (typeof _global2.default.ga === 'function') {
      var linkerParam = void 0;

      _global2.default.ga(function (tracker) {
        linkerParam = tracker.get('linkerParam');
      });

      if (linkerParam) {
        query += '&' + linkerParam;
      }
    }

    return baseUrl + '/' + variantPath + '?' + query;
  },

  /**
    * Add items to cart. Updates cart's `lineItems`
    * ```javascript
    * cart.addVariants({variant: variantObject, quantity: 1}).then(cart => {
    *   // do things with the updated cart.
    * });
    * ```
    * @method addVariants
    * @param {Object} item - One or more variants
    * @param {Object} item.variant - variant object
    * @param {Number} item.quantity - quantity
    * @param {Object} [nextItem...] - further lineItems may be passed
    * @public
    * @return {Promise|CartModel} - updated cart instance.
  */
  addVariants: function addVariants() {
    var newLineItems = [].concat(Array.prototype.slice.call(arguments)).map(function (item) {
      var lineItem = {
        image: item.variant.image,
        variant_id: item.variant.id,
        product_id: item.variant.productId,
        title: item.variant.productTitle,
        quantity: parseInt(item.quantity, 10),
        properties: item.properties || {},
        variant_title: item.variant.title,
        price: item.variant.price,
        compare_at_price: item.variant.compareAtPrice,
        grams: item.variant.grams
      };

      (0, _setGuidFor2.default)(lineItem);

      return lineItem;
    });
    var existingLineItems = this.attrs.line_items;

    existingLineItems.push.apply(existingLineItems, _toConsumableArray(newLineItems));

    var dedupedLineItems = existingLineItems.reduce(function (itemAcc, item) {
      var matchingItem = itemAcc.filter(function (existingItem) {
        return existingItem.variant_id === item.variant_id && objectsEqual(existingItem.properties, item.properties);
      })[0];

      if (matchingItem) {
        matchingItem.quantity = matchingItem.quantity + item.quantity;
      } else {
        itemAcc.push(item);
      }

      return itemAcc;
    }, []);

    // Users may pass negative numbers and remove items. This ensures there's no
    // item with a quantity of zero or less.
    this.attrs.line_items = dedupedLineItems.reduce(function (itemAcc, item) {
      if (item.quantity >= 1) {
        itemAcc.push(item);
      }

      return itemAcc;
    }, []);

    return this.updateModel();
  },


  /**
    * Update line item quantity
    * ```javascript
    * cart.updateLineItem(123, 2).then(cart => {
    *   // do things with the updated cart.
    * });
    * ```
    * @method updateLineItem
    * @param {Number} id - line item ID
    * @param {Number} quantity - new quantity for line item
    * @throws {Error} if line item with ID is not in cart.
    * @public
    * @return {Promise|CartModel} - updated cart instance
  */
  updateLineItem: function updateLineItem(id, quantity) {
    if (quantity < 1) {
      return this.removeLineItem(id);
    }

    var lineItem = this.lineItems.filter(function (item) {
      return item.id === id;
    })[0];

    if (lineItem) {
      lineItem.quantity = quantity;

      return this.updateModel();
    }

    return new Promise(function (resolve, reject) {
      reject(new Error('line item with id: ' + id + ' not found in cart#' + this.id));
    });
  },


  /**
    * Remove line item from cart
    * @method removeLineItem
    * @param {Number} id - line item ID
    * @throws {Error} if line item with ID is not in cart.
    * @public
    * @return {Promise|CartModel} - updated cart instance
  */
  removeLineItem: function removeLineItem(id) {
    var oldLength = this.lineItems.length;
    var newLineItems = this.lineItems.filter(function (item) {
      return item.id !== id;
    });
    var newLength = newLineItems.length;

    if (newLength < oldLength) {
      this.attrs.line_items = newLineItems.map(function (item) {
        return item.attrs;
      });

      return this.updateModel();
    }

    return new Promise(function (resolve, reject) {
      reject(new Error('line item with id: ' + id + ' not found in cart#' + this.id));
    });
  },


  /**
    * Remove all line items from cart
    * @method clearLineItems
    * @public
    * @return {Promise|CartModel} - updated cart instance
  */
  clearLineItems: function clearLineItems() {
    this.attrs.line_items = [];

    return this.updateModel();
  },


  /**
    * force update of cart model on server
    * @method updateModel
    * @public
    * @return {Promise|CartModel} - updated cart instance
  */
  updateModel: function updateModel() {
    var _this = this;

    return this.shopClient.update('carts', this).then(function (updateCart) {
      (0, _assign2.default)(_this.attrs, updateCart.attrs);

      return _this;
    });
  }
});

exports.default = CartModel;
},{"../metal/assign":63,"../metal/global":66,"../metal/set-guid-for":69,"./base-model":71,"./cart-line-item-model":72}],74:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NO_IMAGE_URI = undefined;

var _baseModel = require('./base-model');

var _baseModel2 = _interopRequireDefault(_baseModel);

var _productOptionModel = require('./product-option-model');

var _productOptionModel2 = _interopRequireDefault(_productOptionModel);

var _productVariantModel = require('./product-variant-model');

var _productVariantModel2 = _interopRequireDefault(_productVariantModel);

var _uniq = require('../metal/uniq');

var _uniq2 = _interopRequireDefault(_uniq);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var NO_IMAGE_URI = 'https://widgets.shopifyapps.com/assets/no-image.svg';

/**
   * Class for products returned by fetch('product')
   * @class ProductModel
   * @constructor
 */
var ProductModel = _baseModel2.default.extend({
  constructor: function constructor() {
    this.super.apply(this, arguments);
  },


  /**
    * Product unique ID
    * @property id
    * @type {String}
  */
  get id() {
    return this.attrs.product_id;
  },

  /**
    * Product title
    * @property title
    * @type {String}
  */
  get title() {
    return this.attrs.title;
  },

  /**
    * Product description. The exposes the `body_html` property on the listings API
    * @property description
    * @type {String}
  */
  get description() {
    return this.attrs.body_html;
  },

  /**
    * All images associated with product.
    * @property images
    * @type {Array} array of image objects.
  */
  get images() {
    return this.attrs.images;
  },

  get memoized() {
    this._memoized = this._memoized || {};

    return this._memoized;
  },

  /**
     *  Get array of options with nested values. Useful for creating UI for selecting options.
     *
     * ```javascript
     *  var elements = product.options.map(function(option) {
     *    return '<select name="' + option.name + '">' + option.values.map(function(value) {
     *      return '<option value="' + value + '">' + value + '</option>';
     *    }) + '</select>';
     *  });
     * ```
     *
     * @attribute options
     * @type {Array|Option}
   */
  get options() {
    if (this.memoized.options) {
      return this.memoized.options;
    }

    var baseOptions = this.attrs.options;
    var variants = this.variants;

    this.memoized.options = baseOptions.map(function (option) {
      var name = option.name;

      var dupedValues = variants.reduce(function (valueList, variant) {
        var optionValueForOption = variant.optionValues.filter(function (optionValue) {
          return optionValue.name === option.name;
        })[0];

        valueList.push(optionValueForOption.value);

        return valueList;
      }, []);

      var values = (0, _uniq2.default)(dupedValues);

      return new _productOptionModel2.default({ name: name, values: values });
    });

    return this.memoized.options;
  },

  /**
    * All variants of a product.
    * @property variants
    * @type {Array|ProductVariantModel} array of ProductVariantModel instances.
  */
  get variants() {
    var _this = this;

    return this.attrs.variants.map(function (variant) {
      return new _productVariantModel2.default({ variant: variant, product: _this }, { config: _this.config });
    });
  },

  /**
    * Retrieve currently selected option values.
    * @attribute selections
    * @type {Option}
  */
  get selections() {
    return this.options.map(function (option) {
      return option.selected;
    });
  },

  /**
    * Retrieve variant for currently selected options
    * @attribute selectedVariant
    * @type {Object}
  */
  get selectedVariant() {
    var variantTitle = this.selections.join(' / ');

    return this.variants.filter(function (variant) {
      return variant.title === variantTitle;
    })[0] || null;
  },

  /**
    * Retrieve image for currently selected variantImage
    * @attribute selectedVariantImage
    * @type {Object}
  */
  get selectedVariantImage() {
    if (!this.selectedVariant) {
      return null;
    }

    return this.selectedVariant.image;
  }
});

exports.default = ProductModel;
exports.NO_IMAGE_URI = NO_IMAGE_URI;
},{"../metal/uniq":70,"./base-model":71,"./product-option-model":75,"./product-variant-model":76}],75:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _baseModel = require('./base-model');

var _baseModel2 = _interopRequireDefault(_baseModel);

var _includes = require('../metal/includes');

var _includes2 = _interopRequireDefault(_includes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
  * Class for product option
  * @class Option
  * @constructor
*/
var ProductOptionModel = _baseModel2.default.extend({
  constructor: function constructor() {
    this.super.apply(this, arguments);

    this.selected = this.values[0];
  },


  /**
    * name of option (ex. "Size", "Color")
    * @property name
    * @type String
  */
  get name() {
    return this.attrs.name;
  },

  /**
    * possible values for selection
    * @property values
    * @type Array
  */
  get values() {
    return this.attrs.values;
  },

  /**
    * get/set selected option value (ex. "Large"). Setting this will update the
    * selected value on the model. Throws {Error} if setting selected to value that does not exist for option
    * @property selected
    * @type String
  */
  get selected() {
    return this._selected;
  },

  set selected(value) {
    if ((0, _includes2.default)(this.values, value)) {
      this._selected = value;
    } else {
      throw new Error('Invalid option selection for ' + this.name + '.');
    }

    return value;
  }
});

exports.default = ProductOptionModel;
},{"../metal/includes":67,"./base-model":71}],76:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _baseModel = require('./base-model');

var _baseModel2 = _interopRequireDefault(_baseModel);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
  * Model for product variant
  * @class ProductVariantModel
  * @constructor
*/
var ProductVariantModel = _baseModel2.default.extend({
  constructor: function constructor() {
    this.super.apply(this, arguments);
  },


  /**
    * Variant unique ID
    * @property id
    * @type {String}
  */
  get id() {
    return this.attrs.variant.id;
  },

  /**
    * ID of product variant belongs to
    * @property productId
    * @type {String}
  */
  get productId() {
    return this.attrs.product.id;
  },

  /**
    * Title of variant
    * @property title
    * @type {String}
  */
  get title() {
    return this.attrs.variant.title;
  },

  /**
    * Title of product variant belongs to
    * @property productTitle
    * @type {String}
  */
  get productTitle() {
    return this.attrs.product.title;
  },

  /**
    * <a href="https://docs.shopify.com/manual/products/promoting-marketing/sales">
    * Compare at</a> price for variant formatted as currency.
    * @property compareAtPrice
    * @type {String}
  */
  get compareAtPrice() {
    return this.attrs.variant.compare_at_price;
  },

  /**
    * Price of variant, formatted as currency
    * @property price
    * @type {String}
  */
  get price() {
    return this.attrs.variant.price;
  },

  /**
    * Variant weight in grams
    * @property grams
    * @type {Number}
  */
  get grams() {
    return this.attrs.variant.grams;
  },

  /**
    * Option values associated with this variant, ex {name: "color", value: "Blue"}
    * @property optionValues
    * @type {Array|Object}
  */
  get optionValues() {
    return this.attrs.variant.option_values;
  },

  /**
    * Variant in stock (always true if inventory tracking is disabled)
    * @property available
    * @type {Boolean}
  */
  get available() {
    return this.attrs.variant.available;
  },

  /**
    * Image for variant
    * @property image
    * @type {Object}
  */
  get image() {
    var id = this.id;
    var images = this.attrs.product.images;

    var primaryImage = images[0];
    var variantImage = images.filter(function (image) {
      return image.variant_ids.indexOf(id) !== -1;
    })[0];

    return variantImage || primaryImage;
  },

  /**
    * Image variants available for a variant, ex [ {"name":"pico","dimension":"16x16","src":"https://cdn.shopify.com/image-two_pico.jpg"} ]
    * See <a href="https://help.shopify.com/themes/liquid/filters/url-filters#size-parameters"> for list of available variants.</a>
    * @property imageVariant
    * @type {Array}
  */
  get imageVariants() {
    var image = this.image;

    if (!image) {
      return [];
    }

    var src = this.image.src;
    var extensionIndex = src.lastIndexOf('.');
    var pathAndBasename = src.slice(0, extensionIndex);
    var extension = src.slice(extensionIndex);
    var variants = [{ name: 'pico', dimension: '16x16' }, { name: 'icon', dimension: '32x32' }, { name: 'thumb', dimension: '50x50' }, { name: 'small', dimension: '100x100' }, { name: 'compact', dimension: '160x160' }, { name: 'medium', dimension: '240x240' }, { name: 'large', dimension: '480x480' }, { name: 'grande', dimension: '600x600' }, { name: '1024x1024', dimension: '1024x1024' }, { name: '2048x2048', dimension: '2048x2048' }];

    variants.forEach(function (variant) {
      variant.src = pathAndBasename + '_' + variant.name + extension;
    });

    return variants;
  },

  /**
    * Checkout URL for purchasing variant with quantity.
    * @method checkoutUrl
    * @param {Number} [quantity = 1] quantity of variant
    * @public
    * @return {String} Checkout URL
  */
  checkoutUrl: function checkoutUrl() {
    var quantity = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];

    var config = this.config;
    var baseUrl = 'https://' + config.domain + '/cart';

    var variantPath = this.id + ':' + parseInt(quantity, 10);

    var query = 'api_key=' + config.apiKey;

    return baseUrl + '/' + variantPath + '?' + query;
  }
});

exports.default = ProductVariantModel;
},{"./base-model":71}],77:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _baseModel = require('./base-model');

var _baseModel2 = _interopRequireDefault(_baseModel);

var _setGuidFor = require('../metal/set-guid-for');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ReferenceModel = _baseModel2.default.extend({

  /**
    * Class for reference model
    * @class ReferenceModel
    * @constructor
  */

  constructor: function constructor(attrs) {
    if (Object.keys(attrs).indexOf('referenceId') < 0) {
      throw new Error('Missing key referenceId of reference. References to null are not allowed');
    }

    this.super.apply(this, arguments);
  },


  /**
    * get the ID for current reference (not what it refers to, but its own unique identifier)
    * @property id
    * @type {String}
  */
  get id() {
    return this.attrs[_setGuidFor.GUID_KEY];
  },

  get referenceId() {
    return this.attrs.referenceId;
  },
  set referenceId(value) {
    this.attrs.referenceId = value;

    return value;
  }

});

exports.default = ReferenceModel;
},{"../metal/set-guid-for":69,"./base-model":71}],78:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _coreObject = require('../metal/core-object');

var _coreObject2 = _interopRequireDefault(_coreObject);

var _assign = require('../metal/assign');

var _assign2 = _interopRequireDefault(_assign);

var _cartModel = require('../models/cart-model');

var _cartModel2 = _interopRequireDefault(_cartModel);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var CartSerializer = _coreObject2.default.extend({
  constructor: function constructor(config) {
    this.config = config;
  },
  rootKeyForType: function rootKeyForType(type) {
    return type.slice(0, -1);
  },
  modelForType: function modelForType() /* type */{
    return _cartModel2.default;
  },
  deserializeSingle: function deserializeSingle(type) {
    var singlePayload = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
    var metaAttrs = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

    var modelAttrs = singlePayload[this.rootKeyForType(type)];
    var model = this.modelFromAttrs(type, modelAttrs, metaAttrs);

    return model;
  },
  modelFromAttrs: function modelFromAttrs(type, attrs, metaAttrs) {
    var Model = this.modelForType(type);

    metaAttrs.config = this.config;

    return new Model(attrs, metaAttrs);
  },
  serialize: function serialize(type, model) {
    var root = this.rootKeyForType(type);
    var payload = {};
    var attrs = (0, _assign2.default)({}, model.attrs);

    payload[root] = attrs;

    delete attrs.attributes;

    Object.keys(attrs).forEach(function (key) {
      var value = attrs[key];

      if (value === null || typeof value === 'string' && value.length === 0) {
        delete attrs[key];
      }
    });

    return payload;
  }
});

exports.default = CartSerializer;
},{"../metal/assign":63,"../metal/core-object":64,"../models/cart-model":73}],79:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _coreObject = require('../metal/core-object');

var _coreObject2 = _interopRequireDefault(_coreObject);

var _baseModel = require('../models/base-model');

var _baseModel2 = _interopRequireDefault(_baseModel);

var _productModel = require('../models/product-model');

var _productModel2 = _interopRequireDefault(_productModel);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ListingsSerializer = _coreObject2.default.extend({
  constructor: function constructor(config) {
    this.config = config;
  },
  rootKeyForType: function rootKeyForType(type) {
    return type.slice(0, -1) + '_listing';
  },


  models: {
    collections: _baseModel2.default,
    products: _productModel2.default
  },

  modelForType: function modelForType(type) {
    return this.models[type];
  },
  deserializeSingle: function deserializeSingle(type) {
    var singlePayload = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
    var metaAttrs = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

    var modelAttrs = singlePayload[this.rootKeyForType(type)];
    var model = this.modelFromAttrs(type, modelAttrs, metaAttrs);

    return model;
  },
  deserializeMultiple: function deserializeMultiple(type) {
    var _this = this;

    var collectionPayload = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
    var metaAttrs = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

    var models = collectionPayload[this.rootKeyForType(type) + 's'];

    return models.map(function (attrs) {
      var model = _this.modelFromAttrs(type, attrs, metaAttrs);

      return model;
    });
  },
  modelFromAttrs: function modelFromAttrs(type, attrs, metaAttrs) {
    var Model = this.modelForType(type);

    metaAttrs.config = this.config;

    return new Model(attrs, metaAttrs);
  }
});

exports.default = ListingsSerializer;
},{"../metal/core-object":64,"../models/base-model":71,"../models/product-model":74}],80:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _coreObject = require('../metal/core-object');

var _coreObject2 = _interopRequireDefault(_coreObject);

var _assign = require('../metal/assign');

var _assign2 = _interopRequireDefault(_assign);

var _referenceModel = require('../models/reference-model');

var _referenceModel2 = _interopRequireDefault(_referenceModel);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ReferenceSerializer = _coreObject2.default.extend({
  constructor: function constructor(config) {
    this.config = config;
  },
  modelForType: function modelForType() /* type */{
    return _referenceModel2.default;
  },
  deserializeSingle: function deserializeSingle(type) {
    var singlePayload = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
    var metaAttrs = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

    var Model = this.modelForType(type);

    return new Model(singlePayload, metaAttrs);
  },
  serialize: function serialize(type, model) {
    var attrs = (0, _assign2.default)({}, model.attrs);

    return attrs;
  }
});

exports.default = ReferenceSerializer;
},{"../metal/assign":63,"../metal/core-object":64,"../models/reference-model":77}],81:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _listingsSerializer = require('./serializers/listings-serializer');

var _listingsSerializer2 = _interopRequireDefault(_listingsSerializer);

var _listingsAdapter = require('./adapters/listings-adapter');

var _listingsAdapter2 = _interopRequireDefault(_listingsAdapter);

var _cartSerializer = require('./serializers/cart-serializer');

var _cartSerializer2 = _interopRequireDefault(_cartSerializer);

var _referenceSerializer = require('./serializers/reference-serializer');

var _referenceSerializer2 = _interopRequireDefault(_referenceSerializer);

var _localStorageAdapter = require('./adapters/local-storage-adapter');

var _localStorageAdapter2 = _interopRequireDefault(_localStorageAdapter);

var _coreObject = require('./metal/core-object');

var _coreObject2 = _interopRequireDefault(_coreObject);

var _assign = require('./metal/assign');

var _assign2 = _interopRequireDefault(_assign);

var _setGuidFor = require('./metal/set-guid-for');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @module shopify-buy
 * @submodule shop-client
 */

function fetchFactory(fetchType, type) {
  var func = void 0;

  switch (fetchType) {
    case 'all':
      func = function func() {
        return this.fetchAll(type);
      };
      break;
    case 'one':
      func = function func() {
        return this.fetch.apply(this, [type].concat(Array.prototype.slice.call(arguments)));
      };
      break;
    case 'query':
      func = function func() {
        return this.fetchQuery.apply(this, [type].concat(Array.prototype.slice.call(arguments)));
      };
      break;
  }

  return func;
}

var ShopClient = _coreObject2.default.extend({
  /**
   * @class ShopClient
   * @constructor
   * @param {Config} [config] Config data to be used throughout all API
   * interaction
   */

  constructor: function constructor(config) {
    this.config = config;

    this.serializers = {
      products: _listingsSerializer2.default,
      collections: _listingsSerializer2.default,
      carts: _cartSerializer2.default,
      references: _referenceSerializer2.default
    };

    this.adapters = {
      products: _listingsAdapter2.default,
      collections: _listingsAdapter2.default,
      carts: _localStorageAdapter2.default,
      references: _localStorageAdapter2.default
    };
  },


  config: null,

  /**
   * @attribute
   * @default {
   *  products: ListingsAdapter,
   *  collections: ListingsAdapter,
   *  carts: CartAdapter
   * }
   * @type Object
   * @protected
   */
  // Prevent leaky state
  get serializers() {
    return (0, _assign2.default)({}, this.shadowedSerializers);
  },

  set serializers(values) {
    this.shadowedSerializers = (0, _assign2.default)({}, values);
  },

  get adapters() {
    return (0, _assign2.default)({}, this.shadowedAdapters);
  },

  set adapters(values) {
    this.shadowedAdapters = (0, _assign2.default)({}, values);
  },

  /**
   * Fetch all of a `type`, returning a promise.
   *
   * ```javascript
   * client.fetchAll('products').then(products => {
   *   // do things with products
   * });
   * ```
   *
   * @method fetchAll
   * @private
   * @param {String} type The pluralized name of the type, in lower case.
   * @return {Promise|Array} a promise resolving with an array of `type`
   */
  fetchAll: function fetchAll(type) {
    var _this = this;

    var adapter = new this.adapters[type](this.config);

    return adapter.fetchMultiple(type).then(function (payload) {
      return _this.deserialize(type, payload, adapter, null, { multiple: true });
    });
  },


  /**
   * Fetch one of a `type`, returning a promise.
   *
   * ```javascript
   * client.fetch('products', 123).then(product => {
   *   // do things with the product
   * });
   * ```
   *
   * @method fetch
   * @private
   * @param {String} type The pluralized name of the type, in lower case.
   * @param {String|Number} id a unique identifier
   * @return {Promise|BaseModel} a promise resolving with a single instance of
   * `type` expressed as a `BaseModel`.
   */
  fetch: function fetch(type, id) {
    var _this2 = this;

    var adapter = new this.adapters[type](this.config);

    return adapter.fetchSingle(type, id).then(function (payload) {
      return _this2.deserialize(type, payload, adapter, null, { single: true });
    });
  },


  /**
   * Fetch many of a `type`, that match `query`
   *
   * ```javascript
   * client.fetchQuery('products', { collection_id: 456 }).then(products => {
   *   // do things with the products
   * });
   * ```
   *
   * @method fetchQuery
   * @private
   * @param {String} type The pluralized name of the type, in lower case.
   * @param {Object} query a query sent to the api server.
   * @return {Promise|Array} a promise resolving with an array of `type`.
   */
  fetchQuery: function fetchQuery(type, query) {
    var _this3 = this;

    var adapter = new this.adapters[type](this.config);

    return adapter.fetchMultiple(type, query).then(function (payload) {
      return _this3.deserialize(type, payload, adapter, null, { multiple: true });
    });
  },


  /**
   * Create an instance of `type`, optionally including `modelAttrs`.
   *
   * ```javascript
   * client.create('carts', { line_items: [ ... ] }).then(cart => {
   *   // do things with the cart.
   * });
   * ```
   *
   * @method create
   * @private
   * @param {String} type The pluralized name of the type, in lower case.
   * @param {Object} [modelAttrs={}] attributes representing the internal state
   * of the model to be persisted.
   * @return {Promise|CartModel} a promise resolving with a single instance of
   * `type`
   */
  create: function create(type) {
    var _this4 = this;

    var modelAttrs = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    var adapter = new this.adapters[type](this.config);
    var serializer = new this.serializers[type](this.config);
    var Model = serializer.modelForType(type);
    var model = new Model(modelAttrs, { shopClient: this });
    var attrs = serializer.serialize(type, model);

    return adapter.create(type, attrs).then(function (payload) {
      return _this4.deserialize(type, payload, adapter, serializer, { single: true });
    });
  },


  /**
   * Create an instance of `type`, optionally including `attrs`.
   *
   * ```javascript
   * client.create('carts', { line_items: [ ... ] }).then(cart => {
   *   // do things with the cart.
   * });
   * ```
   *
   * @method update
   * @private
   * @param {String} type The pluralized name of the type, in lower case.
   * @param {BaseModel} updatedModel The model that represents new state to
   * to persist.
   * @return {Promise|CartModel} a promise resolving with a single instance of
   * `type`
   */
  update: function update(type, updatedModel) {
    var _this5 = this;

    var adapter = updatedModel.adapter;
    var serializer = updatedModel.serializer;
    var serializedModel = serializer.serialize(type, updatedModel);
    var id = updatedModel.attrs[adapter.idKeyForType(type)];

    return adapter.update(type, id, serializedModel).then(function (payload) {
      return _this5.deserialize(type, payload, adapter, serializer, { single: true });
    });
  },


  /**
   * Proxy to serializer's deserialize.
   *
   * @method deserialize
   * @private
   * @param {String} type The pluralized name of the type, in lower case.
   * @param {Object} payload The raw payload returned by the adapter.
   * @param {BaseAdapter} adapter The adapter that yielded the payload.
   * @param {BaseSerializer} existingSerializer The serializer to attach. If
   * none is passed, then `this.deserialize` will create one for the type.
   * @param {Object} opts Options that determine which deserialization method to
   * use.
   * @param {Boolean} opts.multiple true when the payload represents multiple
   * models
   * @param {Boolean} opts.single true when the payload represents one model.
   * @return {BaseModel} an instance of `type` reified into a model.
   */
  deserialize: function deserialize(type, payload, adapter, existingSerializer) {
    var opts = arguments.length <= 4 || arguments[4] === undefined ? {} : arguments[4];

    var serializer = existingSerializer || new this.serializers[type](this.config);
    var meta = { shopClient: this, adapter: adapter, serializer: serializer, type: type };
    var serializedPayload = void 0;

    if (opts.multiple) {
      serializedPayload = serializer.deserializeMultiple(type, payload, meta);
    } else {
      serializedPayload = serializer.deserializeSingle(type, payload, meta);
    }

    return serializedPayload;
  },


  /**
    * Creates a {{#crossLink "CartModel"}}CartModel{{/crossLink}} instance, optionally including `attrs`.
    *
    * ```javascript
    * client.createCart().then(cart => {
    *   // do something with cart
    * });
    * ```
    *
    * @param {Object}[attrs={}] attributes representing the internal state of the cart to be persisted to localStorage.
    * @method createCart
    * @public
    * @return {Promise|CartModel} - new cart instance.
  */
  createCart: function createCart() {
    var userAttrs = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    var baseAttrs = {
      line_items: []
    };
    var attrs = {};

    (0, _assign2.default)(attrs, baseAttrs);
    (0, _assign2.default)(attrs, userAttrs);

    return this.create('carts', attrs);
  },


  /**
    * Updates an existing {{#crossLink "CartModel"}}CartModel{{/crossLink}} instance and persists it to localStorage.
    *
    * ```javascript
    * client.createCart().then(cart => {
    *   cart.lineItems = [
    *     // ...
    *   ];
    *   client.updateCart(cart);
    * });
    * ```
    *
    * @param {Object}[attrs={}] attributes representing the internal state of the cart to be persisted to localStorage.
    * @method updateCart
    * @public
    * @return {Promise|CartModel} - updated cart instance.
  */
  updateCart: function updateCart(updatedCart) {
    return this.update('carts', updatedCart);
  },


  /**
   * Retrieve a previously created cart by its key.
   *
   * ```javascript
   * client.fetchCart('shopify-buy.1459804699118.2').then(cart => {
   *   console.log(cart); // The retrieved cart
   * });
   *
   * @method fetchCart
   * @public
   * @param {String} id The cart's unique identifier
   * @return {Promise|CartModel} The cart model.
   *
   */
  fetchCart: fetchFactory('one', 'carts'),

  /**
   * Convenience wrapper for {{#crossLink "ShopClient/fetchAll:method"}}
   * {{/crossLink}}. Equivalent to:
   *
   * ```javascript
   * client.fetchAll('products');
   * ```
   *
   * @method fetchAllProducts
   * @private
   * @return {Promise|Array} The product models.
   */
  fetchAllProducts: fetchFactory('all', 'products'),

  /**
   * Convenience wrapper for {{#crossLink "ShopClient/fetchAll:method"}}
   * {{/crossLink}}. Equivalent to:
   *
   * ```javascript
   * client.fetchAll('collections');
   * ```
   *
   * @method fetchAllCollections
   * @private
   * @return {Promise|Array} The collection models.
   */
  fetchAllCollections: fetchFactory('all', 'collections'),

  /**
   * Fetch one product by its ID.
   *
   * ```javascript
   * client.fetchProduct(123).then(product => {
   *   console.log(product); // The product with an ID of 123
   * });
   * ```
   *
   * @method fetchProduct
   * @public
   * @param {String|Number} id a unique identifier
   * @return {Promise|BaseModel} The product model with the specified ID.
   */
  fetchProduct: fetchFactory('one', 'products'),

  /**
   * Fetch one collection by its ID.
   *
   * ```javascript
   * client.fetchCollection(123).then(collection => {
   *   console.log(collection); // The collection with an ID of 123
   * });
   * ```
   *
   * @method fetchCollection
   * @public
   * @param {String|Number} id a unique identifier
   * @return {Promise|BaseModel} The collection model with the specified ID.
   */
  fetchCollection: fetchFactory('one', 'collections'),

  /**
   * Fetches a list of products matching a specified query.
   *
   * ```javascript
   * client.fetchQueryProducts({ collection_id: 123, tag: ['hats'] }).then(products => {
   *   console.log(products); // An array of products in collection `123` having the tag `hats`
   * });
   * ```
   * @method fetchQueryProducts
   * @public
   * @param {Object} query A query sent to the api server containing one or more of:
   *   @param {String|Number} [query.collection_id] The ID of a collection to retrieve products from
   *   @param {Array} [query.tag] A list of tags to filter the products by. Accepts up to 10 tags.
   *   @param {Array} [query.product_ids] A list of product IDs to retrieve
   *   @param {String|Number} [query.page=1] The page offset number of the current lookup (based on the `limit`)
   *   @param {String|Number} [query.limit=50] The number of products to retrieve per page
   *   @param {String} [query.handle] The handle of the product to look up
   *   @param {String} [query.updated_at_min] Products updated since the supplied timestamp (format: 2008-12-31 03:00)
   * @return {Promise|Array} The product models.
   */
  fetchQueryProducts: fetchFactory('query', 'products'),

  /**
   * Fetches a list of collections matching a specified query.
   *
   * ```javascript
   * client.fetchQueryCollections({page: 2, limit: 20}).then(collections => {
   *   console.log(collections); // An array of collection resources
   * });
   * ```
   *
   * @method fetchQueryCollections
   * @public
   * @param {Object} query a query sent to the api server.
   *   @param {String|Number} [query.page=1] the page offset number of the current lookup (based on the `limit`)
   *   @param {String|Number} [query.limit=50] the number of collections to retrieve per page
   * @return {Promise|Array} The collection models.
   */
  fetchQueryCollections: fetchFactory('query', 'collections'),

  /**
   * This method looks up a reference in localStorage to the most recent cart.
   * If one is not found, creates one. If the cart the reference points to
   * doesn't exist, create one and store the new reference.
   *
   * ```javascript
   * client.fetchRecentCart().then(cart => {
   *  // do stuff with the cart
   * });
   * ```
   *
   * @method fetchRecentCart
   * @public
   * @return {Promise|CartModel} The cart.
   */
  fetchRecentCart: function fetchRecentCart() {
    var _this6 = this;

    return this.fetch('references', this.config.domain + '.recent-cart').then(function (reference) {
      var cartId = reference.referenceId;

      return _this6.fetchCart(cartId);
    }).catch(function () {
      return _this6.createCart().then(function (cart) {
        var refAttrs = {
          referenceId: cart.id
        };

        refAttrs[_setGuidFor.GUID_KEY] = _this6.config.domain + '.recent-cart';

        _this6.create('references', refAttrs);

        return cart;
      });
    });
  }
});

exports.default = ShopClient;
},{"./adapters/listings-adapter":55,"./adapters/local-storage-adapter":56,"./metal/assign":63,"./metal/core-object":64,"./metal/set-guid-for":69,"./serializers/cart-serializer":78,"./serializers/listings-serializer":79,"./serializers/reference-serializer":80}],82:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _version = require('./version');

var _version2 = _interopRequireDefault(_version);

var _shopClient = require('./shop-client');

var _shopClient2 = _interopRequireDefault(_shopClient);

require('./isomorphic-fetch');

require('./isomorphic-btoa');

var _productModel = require('./models/product-model');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @module shopify-buy
 * @submodule shopify
 */

/**
 * This namespace contains all globally accessible classes
 * @class ShopifyBuy
 * @static
 */
var Shopify = {
  ShopClient: _shopClient2.default,
  Config: _config2.default,
  version: _version2.default,
  NO_IMAGE_URI: _productModel.NO_IMAGE_URI,

  /**
   * Create a ShopClient. This is the main entry point to the SDK.
   *
   * ```javascript
   * const client = ShopifyBuy.buildClient({
   *   apiKey: 'abc123',
   *   appId: 123456,
   *   myShopifyDomain: 'myshop',
   *   domain: 'myshop.myshopify.com'
   * });
   * ```
   *
   * @method buildClient
   * @for ShopifyBuy
   * @static
   * @public
   * @param {Object} configAttrs An object of required config data.
   * @param {String} configAttrs.apiKey Your api client's public token.
   * @param {String} configAttrs.appId The app whose listings the client will be
   * using. If you are just modifying a buy button, the buy-button's app id is
   * 6. Otherwise, obtain the app id of the app you're modifying or extending.
   * @param {String} configAttrs.domain You shop's full `myshopify.com` domain.
   * @return {ShopClient} a client for the shop using your api credentials.
   */
  buildClient: function buildClient() {
    var configAttrs = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    var config = new this.Config(configAttrs);

    return new this.ShopClient(config);
  }
};

exports.default = Shopify;
},{"./config":58,"./isomorphic-btoa":60,"./isomorphic-fetch":61,"./models/product-model":74,"./shop-client":81,"./version":84}],83:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _global = require('./metal/global');

var _global2 = _interopRequireDefault(_global);

var _coreObject = require('./metal/core-object');

var _coreObject2 = _interopRequireDefault(_coreObject);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Store = _coreObject2.default.extend({
  constructor: function constructor() {
    this.localStorageAvailable = this.storageAvailable('localStorage');
    this.cache = {};
  },
  setItem: function setItem(key, value) {
    if (this.localStorageAvailable) {
      localStorage.setItem(key, JSON.stringify(value));
    } else {
      this.cache[key] = value;
    }

    return value;
  },
  getItem: function getItem(key) {
    if (this.localStorageAvailable) {
      var stringValue = localStorage.getItem(key);

      try {
        return JSON.parse(stringValue);
      } catch (e) {
        return null;
      }
    } else {
      return this.cache[key] || null;
    }
  },
  storageAvailable: function storageAvailable(type) {
    try {
      var storage = _global2.default[type];
      var x = '__storage_test__';

      storage.setItem(x, x);
      storage.removeItem(x);

      return true;
    } catch (e) {
      return false;
    }
  }
});

exports.default = Store;
},{"./metal/core-object":64,"./metal/global":66}],84:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var version = '{{versionString}}';

/**
 * @module shopify-buy
 * @submodule version
 */

exports.default = version;
},{}],85:[function(require,module,exports){
/**
 * Sinon core utilities. For internal use only.
 *
 * @author Christian Johansen (christian@cjohansen.no)
 * @license BSD
 *
 * Copyright (c) 2010-2013 Christian Johansen
 */
var sinon = (function () { // eslint-disable-line no-unused-vars
    "use strict";

    var sinonModule;
    var isNode = typeof module !== "undefined" && module.exports && typeof require === "function";
    var isAMD = typeof define === "function" && typeof define.amd === "object" && define.amd;

    function loadDependencies(require, exports, module) {
        sinonModule = module.exports = require("./sinon/util/core");
        require("./sinon/extend");
        require("./sinon/walk");
        require("./sinon/typeOf");
        require("./sinon/times_in_words");
        require("./sinon/spy");
        require("./sinon/call");
        require("./sinon/behavior");
        require("./sinon/stub");
        require("./sinon/mock");
        require("./sinon/collection");
        require("./sinon/assert");
        require("./sinon/sandbox");
        require("./sinon/test");
        require("./sinon/test_case");
        require("./sinon/match");
        require("./sinon/format");
        require("./sinon/log_error");
    }

    if (isAMD) {
        define(loadDependencies);
    } else if (isNode) {
        loadDependencies(require, module.exports, module);
        sinonModule = module.exports;
    } else {
        sinonModule = {};
    }

    return sinonModule;
}());

},{"./sinon/assert":86,"./sinon/behavior":87,"./sinon/call":88,"./sinon/collection":89,"./sinon/extend":90,"./sinon/format":91,"./sinon/log_error":92,"./sinon/match":93,"./sinon/mock":94,"./sinon/sandbox":95,"./sinon/spy":96,"./sinon/stub":97,"./sinon/test":98,"./sinon/test_case":99,"./sinon/times_in_words":100,"./sinon/typeOf":101,"./sinon/util/core":102,"./sinon/walk":109}],86:[function(require,module,exports){
(function (global){
/**
 * @depend times_in_words.js
 * @depend util/core.js
 * @depend match.js
 * @depend format.js
 */
/**
 * Assertions matching the test spy retrieval interface.
 *
 * @author Christian Johansen (christian@cjohansen.no)
 * @license BSD
 *
 * Copyright (c) 2010-2013 Christian Johansen
 */
(function (sinonGlobal, global) {
    "use strict";

    var slice = Array.prototype.slice;

    function makeApi(sinon) {
        var assert;

        function verifyIsStub() {
            var method;

            for (var i = 0, l = arguments.length; i < l; ++i) {
                method = arguments[i];

                if (!method) {
                    assert.fail("fake is not a spy");
                }

                if (method.proxy && method.proxy.isSinonProxy) {
                    verifyIsStub(method.proxy);
                } else {
                    if (typeof method !== "function") {
                        assert.fail(method + " is not a function");
                    }

                    if (typeof method.getCall !== "function") {
                        assert.fail(method + " is not stubbed");
                    }
                }

            }
        }

        function verifyIsValidAssertion(assertionMethod, assertionArgs) {
            switch (assertionMethod) {
                case "notCalled":
                case "called":
                case "calledOnce":
                case "calledTwice":
                case "calledThrice":
                    if (assertionArgs.length !== 0) {
                        assert.fail(assertionMethod +
                                    " takes 1 argument but was called with " +
                                    (assertionArgs.length + 1) + " arguments");
                    }
                    break;
                default:
                    break;
            }
        }

        function failAssertion(object, msg) {
            object = object || global;
            var failMethod = object.fail || assert.fail;
            failMethod.call(object, msg);
        }

        function mirrorPropAsAssertion(name, method, message) {
            if (arguments.length === 2) {
                message = method;
                method = name;
            }

            assert[name] = function (fake) {
                verifyIsStub(fake);

                var args = slice.call(arguments, 1);
                verifyIsValidAssertion(name, args);

                var failed = false;

                if (typeof method === "function") {
                    failed = !method(fake);
                } else {
                    failed = typeof fake[method] === "function" ?
                        !fake[method].apply(fake, args) : !fake[method];
                }

                if (failed) {
                    failAssertion(this, (fake.printf || fake.proxy.printf).apply(fake, [message].concat(args)));
                } else {
                    assert.pass(name);
                }
            };
        }

        function exposedName(prefix, prop) {
            return !prefix || /^fail/.test(prop) ? prop :
                prefix + prop.slice(0, 1).toUpperCase() + prop.slice(1);
        }

        assert = {
            failException: "AssertError",

            fail: function fail(message) {
                var error = new Error(message);
                error.name = this.failException || assert.failException;

                throw error;
            },

            pass: function pass() {},

            callOrder: function assertCallOrder() {
                verifyIsStub.apply(null, arguments);
                var expected = "";
                var actual = "";

                if (!sinon.calledInOrder(arguments)) {
                    try {
                        expected = [].join.call(arguments, ", ");
                        var calls = slice.call(arguments);
                        var i = calls.length;
                        while (i) {
                            if (!calls[--i].called) {
                                calls.splice(i, 1);
                            }
                        }
                        actual = sinon.orderByFirstCall(calls).join(", ");
                    } catch (e) {
                        // If this fails, we'll just fall back to the blank string
                    }

                    failAssertion(this, "expected " + expected + " to be " +
                                "called in order but were called as " + actual);
                } else {
                    assert.pass("callOrder");
                }
            },

            callCount: function assertCallCount(method, count) {
                verifyIsStub(method);

                if (method.callCount !== count) {
                    var msg = "expected %n to be called " + sinon.timesInWords(count) +
                        " but was called %c%C";
                    failAssertion(this, method.printf(msg));
                } else {
                    assert.pass("callCount");
                }
            },

            expose: function expose(target, options) {
                if (!target) {
                    throw new TypeError("target is null or undefined");
                }

                var o = options || {};
                var prefix = typeof o.prefix === "undefined" && "assert" || o.prefix;
                var includeFail = typeof o.includeFail === "undefined" || !!o.includeFail;

                for (var method in this) {
                    if (method !== "expose" && (includeFail || !/^(fail)/.test(method))) {
                        target[exposedName(prefix, method)] = this[method];
                    }
                }

                return target;
            },

            match: function match(actual, expectation) {
                var matcher = sinon.match(expectation);
                if (matcher.test(actual)) {
                    assert.pass("match");
                } else {
                    var formatted = [
                        "expected value to match",
                        "    expected = " + sinon.format(expectation),
                        "    actual = " + sinon.format(actual)
                    ];

                    failAssertion(this, formatted.join("\n"));
                }
            }
        };

        mirrorPropAsAssertion("called", "expected %n to have been called at least once but was never called");
        mirrorPropAsAssertion("notCalled", function (spy) {
            return !spy.called;
        }, "expected %n to not have been called but was called %c%C");
        mirrorPropAsAssertion("calledOnce", "expected %n to be called once but was called %c%C");
        mirrorPropAsAssertion("calledTwice", "expected %n to be called twice but was called %c%C");
        mirrorPropAsAssertion("calledThrice", "expected %n to be called thrice but was called %c%C");
        mirrorPropAsAssertion("calledOn", "expected %n to be called with %1 as this but was called with %t");
        mirrorPropAsAssertion(
            "alwaysCalledOn",
            "expected %n to always be called with %1 as this but was called with %t"
        );
        mirrorPropAsAssertion("calledWithNew", "expected %n to be called with new");
        mirrorPropAsAssertion("alwaysCalledWithNew", "expected %n to always be called with new");
        mirrorPropAsAssertion("calledWith", "expected %n to be called with arguments %*%C");
        mirrorPropAsAssertion("calledWithMatch", "expected %n to be called with match %*%C");
        mirrorPropAsAssertion("alwaysCalledWith", "expected %n to always be called with arguments %*%C");
        mirrorPropAsAssertion("alwaysCalledWithMatch", "expected %n to always be called with match %*%C");
        mirrorPropAsAssertion("calledWithExactly", "expected %n to be called with exact arguments %*%C");
        mirrorPropAsAssertion("alwaysCalledWithExactly", "expected %n to always be called with exact arguments %*%C");
        mirrorPropAsAssertion("neverCalledWith", "expected %n to never be called with arguments %*%C");
        mirrorPropAsAssertion("neverCalledWithMatch", "expected %n to never be called with match %*%C");
        mirrorPropAsAssertion("threw", "%n did not throw exception%C");
        mirrorPropAsAssertion("alwaysThrew", "%n did not always throw exception%C");

        sinon.assert = assert;
        return assert;
    }

    var isNode = typeof module !== "undefined" && module.exports && typeof require === "function";
    var isAMD = typeof define === "function" && typeof define.amd === "object" && define.amd;

    function loadDependencies(require, exports, module) {
        var sinon = require("./util/core");
        require("./match");
        require("./format");
        module.exports = makeApi(sinon);
    }

    if (isAMD) {
        define(loadDependencies);
        return;
    }

    if (isNode) {
        loadDependencies(require, module.exports, module);
        return;
    }

    if (sinonGlobal) {
        makeApi(sinonGlobal);
    }
}(
    typeof sinon === "object" && sinon, // eslint-disable-line no-undef
    typeof global !== "undefined" ? global : self
));

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./format":91,"./match":93,"./util/core":102}],87:[function(require,module,exports){
(function (process){
/**
 * @depend util/core.js
 * @depend extend.js
 */
/**
 * Stub behavior
 *
 * @author Christian Johansen (christian@cjohansen.no)
 * @author Tim Fischbach (mail@timfischbach.de)
 * @license BSD
 *
 * Copyright (c) 2010-2013 Christian Johansen
 */
(function (sinonGlobal) {
    "use strict";

    var slice = Array.prototype.slice;
    var join = Array.prototype.join;
    var useLeftMostCallback = -1;
    var useRightMostCallback = -2;

    var nextTick = (function () {
        if (typeof process === "object" && typeof process.nextTick === "function") {
            return process.nextTick;
        }

        if (typeof setImmediate === "function") {
            return setImmediate;
        }

        return function (callback) {
            setTimeout(callback, 0);
        };
    })();

    function throwsException(error, message) {
        if (typeof error === "string") {
            this.exception = new Error(message || "");
            this.exception.name = error;
        } else if (!error) {
            this.exception = new Error("Error");
        } else {
            this.exception = error;
        }

        return this;
    }

    function getCallback(behavior, args) {
        var callArgAt = behavior.callArgAt;

        if (callArgAt >= 0) {
            return args[callArgAt];
        }

        var argumentList;

        if (callArgAt === useLeftMostCallback) {
            argumentList = args;
        }

        if (callArgAt === useRightMostCallback) {
            argumentList = slice.call(args).reverse();
        }

        var callArgProp = behavior.callArgProp;

        for (var i = 0, l = argumentList.length; i < l; ++i) {
            if (!callArgProp && typeof argumentList[i] === "function") {
                return argumentList[i];
            }

            if (callArgProp && argumentList[i] &&
                typeof argumentList[i][callArgProp] === "function") {
                return argumentList[i][callArgProp];
            }
        }

        return null;
    }

    function makeApi(sinon) {
        function getCallbackError(behavior, func, args) {
            if (behavior.callArgAt < 0) {
                var msg;

                if (behavior.callArgProp) {
                    msg = sinon.functionName(behavior.stub) +
                        " expected to yield to '" + behavior.callArgProp +
                        "', but no object with such a property was passed.";
                } else {
                    msg = sinon.functionName(behavior.stub) +
                        " expected to yield, but no callback was passed.";
                }

                if (args.length > 0) {
                    msg += " Received [" + join.call(args, ", ") + "]";
                }

                return msg;
            }

            return "argument at index " + behavior.callArgAt + " is not a function: " + func;
        }

        function callCallback(behavior, args) {
            if (typeof behavior.callArgAt === "number") {
                var func = getCallback(behavior, args);

                if (typeof func !== "function") {
                    throw new TypeError(getCallbackError(behavior, func, args));
                }

                if (behavior.callbackAsync) {
                    nextTick(function () {
                        func.apply(behavior.callbackContext, behavior.callbackArguments);
                    });
                } else {
                    func.apply(behavior.callbackContext, behavior.callbackArguments);
                }
            }
        }

        var proto = {
            create: function create(stub) {
                var behavior = sinon.extend({}, sinon.behavior);
                delete behavior.create;
                behavior.stub = stub;

                return behavior;
            },

            isPresent: function isPresent() {
                return (typeof this.callArgAt === "number" ||
                        this.exception ||
                        typeof this.returnArgAt === "number" ||
                        this.returnThis ||
                        this.returnValueDefined);
            },

            invoke: function invoke(context, args) {
                callCallback(this, args);

                if (this.exception) {
                    throw this.exception;
                } else if (typeof this.returnArgAt === "number") {
                    return args[this.returnArgAt];
                } else if (this.returnThis) {
                    return context;
                }

                return this.returnValue;
            },

            onCall: function onCall(index) {
                return this.stub.onCall(index);
            },

            onFirstCall: function onFirstCall() {
                return this.stub.onFirstCall();
            },

            onSecondCall: function onSecondCall() {
                return this.stub.onSecondCall();
            },

            onThirdCall: function onThirdCall() {
                return this.stub.onThirdCall();
            },

            withArgs: function withArgs(/* arguments */) {
                throw new Error(
                    "Defining a stub by invoking \"stub.onCall(...).withArgs(...)\" " +
                    "is not supported. Use \"stub.withArgs(...).onCall(...)\" " +
                    "to define sequential behavior for calls with certain arguments."
                );
            },

            callsArg: function callsArg(pos) {
                if (typeof pos !== "number") {
                    throw new TypeError("argument index is not number");
                }

                this.callArgAt = pos;
                this.callbackArguments = [];
                this.callbackContext = undefined;
                this.callArgProp = undefined;
                this.callbackAsync = false;

                return this;
            },

            callsArgOn: function callsArgOn(pos, context) {
                if (typeof pos !== "number") {
                    throw new TypeError("argument index is not number");
                }
                if (typeof context !== "object") {
                    throw new TypeError("argument context is not an object");
                }

                this.callArgAt = pos;
                this.callbackArguments = [];
                this.callbackContext = context;
                this.callArgProp = undefined;
                this.callbackAsync = false;

                return this;
            },

            callsArgWith: function callsArgWith(pos) {
                if (typeof pos !== "number") {
                    throw new TypeError("argument index is not number");
                }

                this.callArgAt = pos;
                this.callbackArguments = slice.call(arguments, 1);
                this.callbackContext = undefined;
                this.callArgProp = undefined;
                this.callbackAsync = false;

                return this;
            },

            callsArgOnWith: function callsArgWith(pos, context) {
                if (typeof pos !== "number") {
                    throw new TypeError("argument index is not number");
                }
                if (typeof context !== "object") {
                    throw new TypeError("argument context is not an object");
                }

                this.callArgAt = pos;
                this.callbackArguments = slice.call(arguments, 2);
                this.callbackContext = context;
                this.callArgProp = undefined;
                this.callbackAsync = false;

                return this;
            },

            yields: function () {
                this.callArgAt = useLeftMostCallback;
                this.callbackArguments = slice.call(arguments, 0);
                this.callbackContext = undefined;
                this.callArgProp = undefined;
                this.callbackAsync = false;

                return this;
            },

            yieldsRight: function () {
                this.callArgAt = useRightMostCallback;
                this.callbackArguments = slice.call(arguments, 0);
                this.callbackContext = undefined;
                this.callArgProp = undefined;
                this.callbackAsync = false;

                return this;
            },

            yieldsOn: function (context) {
                if (typeof context !== "object") {
                    throw new TypeError("argument context is not an object");
                }

                this.callArgAt = useLeftMostCallback;
                this.callbackArguments = slice.call(arguments, 1);
                this.callbackContext = context;
                this.callArgProp = undefined;
                this.callbackAsync = false;

                return this;
            },

            yieldsTo: function (prop) {
                this.callArgAt = useLeftMostCallback;
                this.callbackArguments = slice.call(arguments, 1);
                this.callbackContext = undefined;
                this.callArgProp = prop;
                this.callbackAsync = false;

                return this;
            },

            yieldsToOn: function (prop, context) {
                if (typeof context !== "object") {
                    throw new TypeError("argument context is not an object");
                }

                this.callArgAt = useLeftMostCallback;
                this.callbackArguments = slice.call(arguments, 2);
                this.callbackContext = context;
                this.callArgProp = prop;
                this.callbackAsync = false;

                return this;
            },

            throws: throwsException,
            throwsException: throwsException,

            returns: function returns(value) {
                this.returnValue = value;
                this.returnValueDefined = true;
                this.exception = undefined;

                return this;
            },

            returnsArg: function returnsArg(pos) {
                if (typeof pos !== "number") {
                    throw new TypeError("argument index is not number");
                }

                this.returnArgAt = pos;

                return this;
            },

            returnsThis: function returnsThis() {
                this.returnThis = true;

                return this;
            }
        };

        function createAsyncVersion(syncFnName) {
            return function () {
                var result = this[syncFnName].apply(this, arguments);
                this.callbackAsync = true;
                return result;
            };
        }

        // create asynchronous versions of callsArg* and yields* methods
        for (var method in proto) {
            // need to avoid creating anotherasync versions of the newly added async methods
            if (proto.hasOwnProperty(method) && method.match(/^(callsArg|yields)/) && !method.match(/Async/)) {
                proto[method + "Async"] = createAsyncVersion(method);
            }
        }

        sinon.behavior = proto;
        return proto;
    }

    var isNode = typeof module !== "undefined" && module.exports && typeof require === "function";
    var isAMD = typeof define === "function" && typeof define.amd === "object" && define.amd;

    function loadDependencies(require, exports, module) {
        var sinon = require("./util/core");
        require("./extend");
        module.exports = makeApi(sinon);
    }

    if (isAMD) {
        define(loadDependencies);
        return;
    }

    if (isNode) {
        loadDependencies(require, module.exports, module);
        return;
    }

    if (sinonGlobal) {
        makeApi(sinonGlobal);
    }
}(
    typeof sinon === "object" && sinon // eslint-disable-line no-undef
));

}).call(this,require('_process'))
},{"./extend":90,"./util/core":102,"_process":48}],88:[function(require,module,exports){
/**
  * @depend util/core.js
  * @depend match.js
  * @depend format.js
  */
/**
  * Spy calls
  *
  * @author Christian Johansen (christian@cjohansen.no)
  * @author Maximilian Antoni (mail@maxantoni.de)
  * @license BSD
  *
  * Copyright (c) 2010-2013 Christian Johansen
  * Copyright (c) 2013 Maximilian Antoni
  */
(function (sinonGlobal) {
    "use strict";

    var slice = Array.prototype.slice;

    function makeApi(sinon) {
        function throwYieldError(proxy, text, args) {
            var msg = sinon.functionName(proxy) + text;
            if (args.length) {
                msg += " Received [" + slice.call(args).join(", ") + "]";
            }
            throw new Error(msg);
        }

        var callProto = {
            calledOn: function calledOn(thisValue) {
                if (sinon.match && sinon.match.isMatcher(thisValue)) {
                    return thisValue.test(this.thisValue);
                }
                return this.thisValue === thisValue;
            },

            calledWith: function calledWith() {
                var l = arguments.length;
                if (l > this.args.length) {
                    return false;
                }
                for (var i = 0; i < l; i += 1) {
                    if (!sinon.deepEqual(arguments[i], this.args[i])) {
                        return false;
                    }
                }

                return true;
            },

            calledWithMatch: function calledWithMatch() {
                var l = arguments.length;
                if (l > this.args.length) {
                    return false;
                }
                for (var i = 0; i < l; i += 1) {
                    var actual = this.args[i];
                    var expectation = arguments[i];
                    if (!sinon.match || !sinon.match(expectation).test(actual)) {
                        return false;
                    }
                }
                return true;
            },

            calledWithExactly: function calledWithExactly() {
                return arguments.length === this.args.length &&
                    this.calledWith.apply(this, arguments);
            },

            notCalledWith: function notCalledWith() {
                return !this.calledWith.apply(this, arguments);
            },

            notCalledWithMatch: function notCalledWithMatch() {
                return !this.calledWithMatch.apply(this, arguments);
            },

            returned: function returned(value) {
                return sinon.deepEqual(value, this.returnValue);
            },

            threw: function threw(error) {
                if (typeof error === "undefined" || !this.exception) {
                    return !!this.exception;
                }

                return this.exception === error || this.exception.name === error;
            },

            calledWithNew: function calledWithNew() {
                return this.proxy.prototype && this.thisValue instanceof this.proxy;
            },

            calledBefore: function (other) {
                return this.callId < other.callId;
            },

            calledAfter: function (other) {
                return this.callId > other.callId;
            },

            callArg: function (pos) {
                this.args[pos]();
            },

            callArgOn: function (pos, thisValue) {
                this.args[pos].apply(thisValue);
            },

            callArgWith: function (pos) {
                this.callArgOnWith.apply(this, [pos, null].concat(slice.call(arguments, 1)));
            },

            callArgOnWith: function (pos, thisValue) {
                var args = slice.call(arguments, 2);
                this.args[pos].apply(thisValue, args);
            },

            "yield": function () {
                this.yieldOn.apply(this, [null].concat(slice.call(arguments, 0)));
            },

            yieldOn: function (thisValue) {
                var args = this.args;
                for (var i = 0, l = args.length; i < l; ++i) {
                    if (typeof args[i] === "function") {
                        args[i].apply(thisValue, slice.call(arguments, 1));
                        return;
                    }
                }
                throwYieldError(this.proxy, " cannot yield since no callback was passed.", args);
            },

            yieldTo: function (prop) {
                this.yieldToOn.apply(this, [prop, null].concat(slice.call(arguments, 1)));
            },

            yieldToOn: function (prop, thisValue) {
                var args = this.args;
                for (var i = 0, l = args.length; i < l; ++i) {
                    if (args[i] && typeof args[i][prop] === "function") {
                        args[i][prop].apply(thisValue, slice.call(arguments, 2));
                        return;
                    }
                }
                throwYieldError(this.proxy, " cannot yield to '" + prop +
                    "' since no callback was passed.", args);
            },

            getStackFrames: function () {
                // Omit the error message and the two top stack frames in sinon itself:
                return this.stack && this.stack.split("\n").slice(3);
            },

            toString: function () {
                var callStr = this.proxy ? this.proxy.toString() + "(" : "";
                var args = [];

                if (!this.args) {
                    return ":(";
                }

                for (var i = 0, l = this.args.length; i < l; ++i) {
                    args.push(sinon.format(this.args[i]));
                }

                callStr = callStr + args.join(", ") + ")";

                if (typeof this.returnValue !== "undefined") {
                    callStr += " => " + sinon.format(this.returnValue);
                }

                if (this.exception) {
                    callStr += " !" + this.exception.name;

                    if (this.exception.message) {
                        callStr += "(" + this.exception.message + ")";
                    }
                }
                if (this.stack) {
                    callStr += this.getStackFrames()[0].replace(/^\s*(?:at\s+|@)?/, " at ");

                }

                return callStr;
            }
        };

        callProto.invokeCallback = callProto.yield;

        function createSpyCall(spy, thisValue, args, returnValue, exception, id, stack) {
            if (typeof id !== "number") {
                throw new TypeError("Call id is not a number");
            }
            var proxyCall = sinon.create(callProto);
            proxyCall.proxy = spy;
            proxyCall.thisValue = thisValue;
            proxyCall.args = args;
            proxyCall.returnValue = returnValue;
            proxyCall.exception = exception;
            proxyCall.callId = id;
            proxyCall.stack = stack;

            return proxyCall;
        }
        createSpyCall.toString = callProto.toString; // used by mocks

        sinon.spyCall = createSpyCall;
        return createSpyCall;
    }

    var isNode = typeof module !== "undefined" && module.exports && typeof require === "function";
    var isAMD = typeof define === "function" && typeof define.amd === "object" && define.amd;

    function loadDependencies(require, exports, module) {
        var sinon = require("./util/core");
        require("./match");
        require("./format");
        module.exports = makeApi(sinon);
    }

    if (isAMD) {
        define(loadDependencies);
        return;
    }

    if (isNode) {
        loadDependencies(require, module.exports, module);
        return;
    }

    if (sinonGlobal) {
        makeApi(sinonGlobal);
    }
}(
    typeof sinon === "object" && sinon // eslint-disable-line no-undef
));

},{"./format":91,"./match":93,"./util/core":102}],89:[function(require,module,exports){
/**
 * @depend util/core.js
 * @depend spy.js
 * @depend stub.js
 * @depend mock.js
 */
/**
 * Collections of stubs, spies and mocks.
 *
 * @author Christian Johansen (christian@cjohansen.no)
 * @license BSD
 *
 * Copyright (c) 2010-2013 Christian Johansen
 */
(function (sinonGlobal) {
    "use strict";

    var push = [].push;
    var hasOwnProperty = Object.prototype.hasOwnProperty;

    function getFakes(fakeCollection) {
        if (!fakeCollection.fakes) {
            fakeCollection.fakes = [];
        }

        return fakeCollection.fakes;
    }

    function each(fakeCollection, method) {
        var fakes = getFakes(fakeCollection);

        for (var i = 0, l = fakes.length; i < l; i += 1) {
            if (typeof fakes[i][method] === "function") {
                fakes[i][method]();
            }
        }
    }

    function compact(fakeCollection) {
        var fakes = getFakes(fakeCollection);
        var i = 0;
        while (i < fakes.length) {
            fakes.splice(i, 1);
        }
    }

    function makeApi(sinon) {
        var collection = {
            verify: function resolve() {
                each(this, "verify");
            },

            restore: function restore() {
                each(this, "restore");
                compact(this);
            },

            reset: function restore() {
                each(this, "reset");
            },

            verifyAndRestore: function verifyAndRestore() {
                var exception;

                try {
                    this.verify();
                } catch (e) {
                    exception = e;
                }

                this.restore();

                if (exception) {
                    throw exception;
                }
            },

            add: function add(fake) {
                push.call(getFakes(this), fake);
                return fake;
            },

            spy: function spy() {
                return this.add(sinon.spy.apply(sinon, arguments));
            },

            stub: function stub(object, property, value) {
                if (property) {
                    var original = object[property];

                    if (typeof original !== "function") {
                        if (!hasOwnProperty.call(object, property)) {
                            throw new TypeError("Cannot stub non-existent own property " + property);
                        }

                        object[property] = value;

                        return this.add({
                            restore: function () {
                                object[property] = original;
                            }
                        });
                    }
                }
                if (!property && !!object && typeof object === "object") {
                    var stubbedObj = sinon.stub.apply(sinon, arguments);

                    for (var prop in stubbedObj) {
                        if (typeof stubbedObj[prop] === "function") {
                            this.add(stubbedObj[prop]);
                        }
                    }

                    return stubbedObj;
                }

                return this.add(sinon.stub.apply(sinon, arguments));
            },

            mock: function mock() {
                return this.add(sinon.mock.apply(sinon, arguments));
            },

            inject: function inject(obj) {
                var col = this;

                obj.spy = function () {
                    return col.spy.apply(col, arguments);
                };

                obj.stub = function () {
                    return col.stub.apply(col, arguments);
                };

                obj.mock = function () {
                    return col.mock.apply(col, arguments);
                };

                return obj;
            }
        };

        sinon.collection = collection;
        return collection;
    }

    var isNode = typeof module !== "undefined" && module.exports && typeof require === "function";
    var isAMD = typeof define === "function" && typeof define.amd === "object" && define.amd;

    function loadDependencies(require, exports, module) {
        var sinon = require("./util/core");
        require("./mock");
        require("./spy");
        require("./stub");
        module.exports = makeApi(sinon);
    }

    if (isAMD) {
        define(loadDependencies);
        return;
    }

    if (isNode) {
        loadDependencies(require, module.exports, module);
        return;
    }

    if (sinonGlobal) {
        makeApi(sinonGlobal);
    }
}(
    typeof sinon === "object" && sinon // eslint-disable-line no-undef
));

},{"./mock":94,"./spy":96,"./stub":97,"./util/core":102}],90:[function(require,module,exports){
/**
 * @depend util/core.js
 */
(function (sinonGlobal) {
    "use strict";

    function makeApi(sinon) {

        // Adapted from https://developer.mozilla.org/en/docs/ECMAScript_DontEnum_attribute#JScript_DontEnum_Bug
        var hasDontEnumBug = (function () {
            var obj = {
                constructor: function () {
                    return "0";
                },
                toString: function () {
                    return "1";
                },
                valueOf: function () {
                    return "2";
                },
                toLocaleString: function () {
                    return "3";
                },
                prototype: function () {
                    return "4";
                },
                isPrototypeOf: function () {
                    return "5";
                },
                propertyIsEnumerable: function () {
                    return "6";
                },
                hasOwnProperty: function () {
                    return "7";
                },
                length: function () {
                    return "8";
                },
                unique: function () {
                    return "9";
                }
            };

            var result = [];
            for (var prop in obj) {
                if (obj.hasOwnProperty(prop)) {
                    result.push(obj[prop]());
                }
            }
            return result.join("") !== "0123456789";
        })();

        /* Public: Extend target in place with all (own) properties from sources in-order. Thus, last source will
         *         override properties in previous sources.
         *
         * target - The Object to extend
         * sources - Objects to copy properties from.
         *
         * Returns the extended target
         */
        function extend(target /*, sources */) {
            var sources = Array.prototype.slice.call(arguments, 1);
            var source, i, prop;

            for (i = 0; i < sources.length; i++) {
                source = sources[i];

                for (prop in source) {
                    if (source.hasOwnProperty(prop)) {
                        target[prop] = source[prop];
                    }
                }

                // Make sure we copy (own) toString method even when in JScript with DontEnum bug
                // See https://developer.mozilla.org/en/docs/ECMAScript_DontEnum_attribute#JScript_DontEnum_Bug
                if (hasDontEnumBug && source.hasOwnProperty("toString") && source.toString !== target.toString) {
                    target.toString = source.toString;
                }
            }

            return target;
        }

        sinon.extend = extend;
        return sinon.extend;
    }

    function loadDependencies(require, exports, module) {
        var sinon = require("./util/core");
        module.exports = makeApi(sinon);
    }

    var isNode = typeof module !== "undefined" && module.exports && typeof require === "function";
    var isAMD = typeof define === "function" && typeof define.amd === "object" && define.amd;

    if (isAMD) {
        define(loadDependencies);
        return;
    }

    if (isNode) {
        loadDependencies(require, module.exports, module);
        return;
    }

    if (sinonGlobal) {
        makeApi(sinonGlobal);
    }
}(
    typeof sinon === "object" && sinon // eslint-disable-line no-undef
));

},{"./util/core":102}],91:[function(require,module,exports){
/**
 * @depend util/core.js
 */
/**
 * Format functions
 *
 * @author Christian Johansen (christian@cjohansen.no)
 * @license BSD
 *
 * Copyright (c) 2010-2014 Christian Johansen
 */
(function (sinonGlobal, formatio) {
    "use strict";

    function makeApi(sinon) {
        function valueFormatter(value) {
            return "" + value;
        }

        function getFormatioFormatter() {
            var formatter = formatio.configure({
                    quoteStrings: false,
                    limitChildrenCount: 250
                });

            function format() {
                return formatter.ascii.apply(formatter, arguments);
            }

            return format;
        }

        function getNodeFormatter() {
            try {
                var util = require("util");
            } catch (e) {
                /* Node, but no util module - would be very old, but better safe than sorry */
            }

            function format(v) {
                var isObjectWithNativeToString = typeof v === "object" && v.toString === Object.prototype.toString;
                return isObjectWithNativeToString ? util.inspect(v) : v;
            }

            return util ? format : valueFormatter;
        }

        var isNode = typeof module !== "undefined" && module.exports && typeof require === "function";
        var formatter;

        if (isNode) {
            try {
                formatio = require("formatio");
            }
            catch (e) {} // eslint-disable-line no-empty
        }

        if (formatio) {
            formatter = getFormatioFormatter();
        } else if (isNode) {
            formatter = getNodeFormatter();
        } else {
            formatter = valueFormatter;
        }

        sinon.format = formatter;
        return sinon.format;
    }

    function loadDependencies(require, exports, module) {
        var sinon = require("./util/core");
        module.exports = makeApi(sinon);
    }

    var isNode = typeof module !== "undefined" && module.exports && typeof require === "function";
    var isAMD = typeof define === "function" && typeof define.amd === "object" && define.amd;

    if (isAMD) {
        define(loadDependencies);
        return;
    }

    if (isNode) {
        loadDependencies(require, module.exports, module);
        return;
    }

    if (sinonGlobal) {
        makeApi(sinonGlobal);
    }
}(
    typeof sinon === "object" && sinon, // eslint-disable-line no-undef
    typeof formatio === "object" && formatio // eslint-disable-line no-undef
));

},{"./util/core":102,"formatio":39,"util":115}],92:[function(require,module,exports){
/**
 * @depend util/core.js
 */
/**
 * Logs errors
 *
 * @author Christian Johansen (christian@cjohansen.no)
 * @license BSD
 *
 * Copyright (c) 2010-2014 Christian Johansen
 */
(function (sinonGlobal) {
    "use strict";

    // cache a reference to setTimeout, so that our reference won't be stubbed out
    // when using fake timers and errors will still get logged
    // https://github.com/cjohansen/Sinon.JS/issues/381
    var realSetTimeout = setTimeout;

    function makeApi(sinon) {

        function log() {}

        function logError(label, err) {
            var msg = label + " threw exception: ";

            function throwLoggedError() {
                err.message = msg + err.message;
                throw err;
            }

            sinon.log(msg + "[" + err.name + "] " + err.message);

            if (err.stack) {
                sinon.log(err.stack);
            }

            if (logError.useImmediateExceptions) {
                throwLoggedError();
            } else {
                logError.setTimeout(throwLoggedError, 0);
            }
        }

        // When set to true, any errors logged will be thrown immediately;
        // If set to false, the errors will be thrown in separate execution frame.
        logError.useImmediateExceptions = false;

        // wrap realSetTimeout with something we can stub in tests
        logError.setTimeout = function (func, timeout) {
            realSetTimeout(func, timeout);
        };

        var exports = {};
        exports.log = sinon.log = log;
        exports.logError = sinon.logError = logError;

        return exports;
    }

    function loadDependencies(require, exports, module) {
        var sinon = require("./util/core");
        module.exports = makeApi(sinon);
    }

    var isNode = typeof module !== "undefined" && module.exports && typeof require === "function";
    var isAMD = typeof define === "function" && typeof define.amd === "object" && define.amd;

    if (isAMD) {
        define(loadDependencies);
        return;
    }

    if (isNode) {
        loadDependencies(require, module.exports, module);
        return;
    }

    if (sinonGlobal) {
        makeApi(sinonGlobal);
    }
}(
    typeof sinon === "object" && sinon // eslint-disable-line no-undef
));

},{"./util/core":102}],93:[function(require,module,exports){
/**
 * @depend util/core.js
 * @depend typeOf.js
 */
/*jslint eqeqeq: false, onevar: false, plusplus: false*/
/*global module, require, sinon*/
/**
 * Match functions
 *
 * @author Maximilian Antoni (mail@maxantoni.de)
 * @license BSD
 *
 * Copyright (c) 2012 Maximilian Antoni
 */
(function (sinonGlobal) {
    "use strict";

    function makeApi(sinon) {
        function assertType(value, type, name) {
            var actual = sinon.typeOf(value);
            if (actual !== type) {
                throw new TypeError("Expected type of " + name + " to be " +
                    type + ", but was " + actual);
            }
        }

        var matcher = {
            toString: function () {
                return this.message;
            }
        };

        function isMatcher(object) {
            return matcher.isPrototypeOf(object);
        }

        function matchObject(expectation, actual) {
            if (actual === null || actual === undefined) {
                return false;
            }
            for (var key in expectation) {
                if (expectation.hasOwnProperty(key)) {
                    var exp = expectation[key];
                    var act = actual[key];
                    if (isMatcher(exp)) {
                        if (!exp.test(act)) {
                            return false;
                        }
                    } else if (sinon.typeOf(exp) === "object") {
                        if (!matchObject(exp, act)) {
                            return false;
                        }
                    } else if (!sinon.deepEqual(exp, act)) {
                        return false;
                    }
                }
            }
            return true;
        }

        function match(expectation, message) {
            var m = sinon.create(matcher);
            var type = sinon.typeOf(expectation);
            switch (type) {
            case "object":
                if (typeof expectation.test === "function") {
                    m.test = function (actual) {
                        return expectation.test(actual) === true;
                    };
                    m.message = "match(" + sinon.functionName(expectation.test) + ")";
                    return m;
                }
                var str = [];
                for (var key in expectation) {
                    if (expectation.hasOwnProperty(key)) {
                        str.push(key + ": " + expectation[key]);
                    }
                }
                m.test = function (actual) {
                    return matchObject(expectation, actual);
                };
                m.message = "match(" + str.join(", ") + ")";
                break;
            case "number":
                m.test = function (actual) {
                    // we need type coercion here
                    return expectation == actual; // eslint-disable-line eqeqeq
                };
                break;
            case "string":
                m.test = function (actual) {
                    if (typeof actual !== "string") {
                        return false;
                    }
                    return actual.indexOf(expectation) !== -1;
                };
                m.message = "match(\"" + expectation + "\")";
                break;
            case "regexp":
                m.test = function (actual) {
                    if (typeof actual !== "string") {
                        return false;
                    }
                    return expectation.test(actual);
                };
                break;
            case "function":
                m.test = expectation;
                if (message) {
                    m.message = message;
                } else {
                    m.message = "match(" + sinon.functionName(expectation) + ")";
                }
                break;
            default:
                m.test = function (actual) {
                    return sinon.deepEqual(expectation, actual);
                };
            }
            if (!m.message) {
                m.message = "match(" + expectation + ")";
            }
            return m;
        }

        matcher.or = function (m2) {
            if (!arguments.length) {
                throw new TypeError("Matcher expected");
            } else if (!isMatcher(m2)) {
                m2 = match(m2);
            }
            var m1 = this;
            var or = sinon.create(matcher);
            or.test = function (actual) {
                return m1.test(actual) || m2.test(actual);
            };
            or.message = m1.message + ".or(" + m2.message + ")";
            return or;
        };

        matcher.and = function (m2) {
            if (!arguments.length) {
                throw new TypeError("Matcher expected");
            } else if (!isMatcher(m2)) {
                m2 = match(m2);
            }
            var m1 = this;
            var and = sinon.create(matcher);
            and.test = function (actual) {
                return m1.test(actual) && m2.test(actual);
            };
            and.message = m1.message + ".and(" + m2.message + ")";
            return and;
        };

        match.isMatcher = isMatcher;

        match.any = match(function () {
            return true;
        }, "any");

        match.defined = match(function (actual) {
            return actual !== null && actual !== undefined;
        }, "defined");

        match.truthy = match(function (actual) {
            return !!actual;
        }, "truthy");

        match.falsy = match(function (actual) {
            return !actual;
        }, "falsy");

        match.same = function (expectation) {
            return match(function (actual) {
                return expectation === actual;
            }, "same(" + expectation + ")");
        };

        match.typeOf = function (type) {
            assertType(type, "string", "type");
            return match(function (actual) {
                return sinon.typeOf(actual) === type;
            }, "typeOf(\"" + type + "\")");
        };

        match.instanceOf = function (type) {
            assertType(type, "function", "type");
            return match(function (actual) {
                return actual instanceof type;
            }, "instanceOf(" + sinon.functionName(type) + ")");
        };

        function createPropertyMatcher(propertyTest, messagePrefix) {
            return function (property, value) {
                assertType(property, "string", "property");
                var onlyProperty = arguments.length === 1;
                var message = messagePrefix + "(\"" + property + "\"";
                if (!onlyProperty) {
                    message += ", " + value;
                }
                message += ")";
                return match(function (actual) {
                    if (actual === undefined || actual === null ||
                            !propertyTest(actual, property)) {
                        return false;
                    }
                    return onlyProperty || sinon.deepEqual(value, actual[property]);
                }, message);
            };
        }

        match.has = createPropertyMatcher(function (actual, property) {
            if (typeof actual === "object") {
                return property in actual;
            }
            return actual[property] !== undefined;
        }, "has");

        match.hasOwn = createPropertyMatcher(function (actual, property) {
            return actual.hasOwnProperty(property);
        }, "hasOwn");

        match.bool = match.typeOf("boolean");
        match.number = match.typeOf("number");
        match.string = match.typeOf("string");
        match.object = match.typeOf("object");
        match.func = match.typeOf("function");
        match.array = match.typeOf("array");
        match.regexp = match.typeOf("regexp");
        match.date = match.typeOf("date");

        sinon.match = match;
        return match;
    }

    var isNode = typeof module !== "undefined" && module.exports && typeof require === "function";
    var isAMD = typeof define === "function" && typeof define.amd === "object" && define.amd;

    function loadDependencies(require, exports, module) {
        var sinon = require("./util/core");
        require("./typeOf");
        module.exports = makeApi(sinon);
    }

    if (isAMD) {
        define(loadDependencies);
        return;
    }

    if (isNode) {
        loadDependencies(require, module.exports, module);
        return;
    }

    if (sinonGlobal) {
        makeApi(sinonGlobal);
    }
}(
    typeof sinon === "object" && sinon // eslint-disable-line no-undef
));

},{"./typeOf":101,"./util/core":102}],94:[function(require,module,exports){
/**
 * @depend times_in_words.js
 * @depend util/core.js
 * @depend call.js
 * @depend extend.js
 * @depend match.js
 * @depend spy.js
 * @depend stub.js
 * @depend format.js
 */
/**
 * Mock functions.
 *
 * @author Christian Johansen (christian@cjohansen.no)
 * @license BSD
 *
 * Copyright (c) 2010-2013 Christian Johansen
 */
(function (sinonGlobal) {
    "use strict";

    function makeApi(sinon) {
        var push = [].push;
        var match = sinon.match;

        function mock(object) {
            // if (typeof console !== undefined && console.warn) {
            //     console.warn("mock will be removed from Sinon.JS v2.0");
            // }

            if (!object) {
                return sinon.expectation.create("Anonymous mock");
            }

            return mock.create(object);
        }

        function each(collection, callback) {
            if (!collection) {
                return;
            }

            for (var i = 0, l = collection.length; i < l; i += 1) {
                callback(collection[i]);
            }
        }

        function arrayEquals(arr1, arr2, compareLength) {
            if (compareLength && (arr1.length !== arr2.length)) {
                return false;
            }

            for (var i = 0, l = arr1.length; i < l; i++) {
                if (!sinon.deepEqual(arr1[i], arr2[i])) {
                    return false;
                }
            }
            return true;
        }

        sinon.extend(mock, {
            create: function create(object) {
                if (!object) {
                    throw new TypeError("object is null");
                }

                var mockObject = sinon.extend({}, mock);
                mockObject.object = object;
                delete mockObject.create;

                return mockObject;
            },

            expects: function expects(method) {
                if (!method) {
                    throw new TypeError("method is falsy");
                }

                if (!this.expectations) {
                    this.expectations = {};
                    this.proxies = [];
                }

                if (!this.expectations[method]) {
                    this.expectations[method] = [];
                    var mockObject = this;

                    sinon.wrapMethod(this.object, method, function () {
                        return mockObject.invokeMethod(method, this, arguments);
                    });

                    push.call(this.proxies, method);
                }

                var expectation = sinon.expectation.create(method);
                push.call(this.expectations[method], expectation);

                return expectation;
            },

            restore: function restore() {
                var object = this.object;

                each(this.proxies, function (proxy) {
                    if (typeof object[proxy].restore === "function") {
                        object[proxy].restore();
                    }
                });
            },

            verify: function verify() {
                var expectations = this.expectations || {};
                var messages = [];
                var met = [];

                each(this.proxies, function (proxy) {
                    each(expectations[proxy], function (expectation) {
                        if (!expectation.met()) {
                            push.call(messages, expectation.toString());
                        } else {
                            push.call(met, expectation.toString());
                        }
                    });
                });

                this.restore();

                if (messages.length > 0) {
                    sinon.expectation.fail(messages.concat(met).join("\n"));
                } else if (met.length > 0) {
                    sinon.expectation.pass(messages.concat(met).join("\n"));
                }

                return true;
            },

            invokeMethod: function invokeMethod(method, thisValue, args) {
                var expectations = this.expectations && this.expectations[method] ? this.expectations[method] : [];
                var expectationsWithMatchingArgs = [];
                var currentArgs = args || [];
                var i, available;

                for (i = 0; i < expectations.length; i += 1) {
                    var expectedArgs = expectations[i].expectedArguments || [];
                    if (arrayEquals(expectedArgs, currentArgs, expectations[i].expectsExactArgCount)) {
                        expectationsWithMatchingArgs.push(expectations[i]);
                    }
                }

                for (i = 0; i < expectationsWithMatchingArgs.length; i += 1) {
                    if (!expectationsWithMatchingArgs[i].met() &&
                        expectationsWithMatchingArgs[i].allowsCall(thisValue, args)) {
                        return expectationsWithMatchingArgs[i].apply(thisValue, args);
                    }
                }

                var messages = [];
                var exhausted = 0;

                for (i = 0; i < expectationsWithMatchingArgs.length; i += 1) {
                    if (expectationsWithMatchingArgs[i].allowsCall(thisValue, args)) {
                        available = available || expectationsWithMatchingArgs[i];
                    } else {
                        exhausted += 1;
                    }
                }

                if (available && exhausted === 0) {
                    return available.apply(thisValue, args);
                }

                for (i = 0; i < expectations.length; i += 1) {
                    push.call(messages, "    " + expectations[i].toString());
                }

                messages.unshift("Unexpected call: " + sinon.spyCall.toString.call({
                    proxy: method,
                    args: args
                }));

                sinon.expectation.fail(messages.join("\n"));
            }
        });

        var times = sinon.timesInWords;
        var slice = Array.prototype.slice;

        function callCountInWords(callCount) {
            if (callCount === 0) {
                return "never called";
            }

            return "called " + times(callCount);
        }

        function expectedCallCountInWords(expectation) {
            var min = expectation.minCalls;
            var max = expectation.maxCalls;

            if (typeof min === "number" && typeof max === "number") {
                var str = times(min);

                if (min !== max) {
                    str = "at least " + str + " and at most " + times(max);
                }

                return str;
            }

            if (typeof min === "number") {
                return "at least " + times(min);
            }

            return "at most " + times(max);
        }

        function receivedMinCalls(expectation) {
            var hasMinLimit = typeof expectation.minCalls === "number";
            return !hasMinLimit || expectation.callCount >= expectation.minCalls;
        }

        function receivedMaxCalls(expectation) {
            if (typeof expectation.maxCalls !== "number") {
                return false;
            }

            return expectation.callCount === expectation.maxCalls;
        }

        function verifyMatcher(possibleMatcher, arg) {
            var isMatcher = match && match.isMatcher(possibleMatcher);

            return isMatcher && possibleMatcher.test(arg) || true;
        }

        sinon.expectation = {
            minCalls: 1,
            maxCalls: 1,

            create: function create(methodName) {
                var expectation = sinon.extend(sinon.stub.create(), sinon.expectation);
                delete expectation.create;
                expectation.method = methodName;

                return expectation;
            },

            invoke: function invoke(func, thisValue, args) {
                this.verifyCallAllowed(thisValue, args);

                return sinon.spy.invoke.apply(this, arguments);
            },

            atLeast: function atLeast(num) {
                if (typeof num !== "number") {
                    throw new TypeError("'" + num + "' is not number");
                }

                if (!this.limitsSet) {
                    this.maxCalls = null;
                    this.limitsSet = true;
                }

                this.minCalls = num;

                return this;
            },

            atMost: function atMost(num) {
                if (typeof num !== "number") {
                    throw new TypeError("'" + num + "' is not number");
                }

                if (!this.limitsSet) {
                    this.minCalls = null;
                    this.limitsSet = true;
                }

                this.maxCalls = num;

                return this;
            },

            never: function never() {
                return this.exactly(0);
            },

            once: function once() {
                return this.exactly(1);
            },

            twice: function twice() {
                return this.exactly(2);
            },

            thrice: function thrice() {
                return this.exactly(3);
            },

            exactly: function exactly(num) {
                if (typeof num !== "number") {
                    throw new TypeError("'" + num + "' is not a number");
                }

                this.atLeast(num);
                return this.atMost(num);
            },

            met: function met() {
                return !this.failed && receivedMinCalls(this);
            },

            verifyCallAllowed: function verifyCallAllowed(thisValue, args) {
                if (receivedMaxCalls(this)) {
                    this.failed = true;
                    sinon.expectation.fail(this.method + " already called " + times(this.maxCalls));
                }

                if ("expectedThis" in this && this.expectedThis !== thisValue) {
                    sinon.expectation.fail(this.method + " called with " + thisValue + " as thisValue, expected " +
                        this.expectedThis);
                }

                if (!("expectedArguments" in this)) {
                    return;
                }

                if (!args) {
                    sinon.expectation.fail(this.method + " received no arguments, expected " +
                        sinon.format(this.expectedArguments));
                }

                if (args.length < this.expectedArguments.length) {
                    sinon.expectation.fail(this.method + " received too few arguments (" + sinon.format(args) +
                        "), expected " + sinon.format(this.expectedArguments));
                }

                if (this.expectsExactArgCount &&
                    args.length !== this.expectedArguments.length) {
                    sinon.expectation.fail(this.method + " received too many arguments (" + sinon.format(args) +
                        "), expected " + sinon.format(this.expectedArguments));
                }

                for (var i = 0, l = this.expectedArguments.length; i < l; i += 1) {

                    if (!verifyMatcher(this.expectedArguments[i], args[i])) {
                        sinon.expectation.fail(this.method + " received wrong arguments " + sinon.format(args) +
                            ", didn't match " + this.expectedArguments.toString());
                    }

                    if (!sinon.deepEqual(this.expectedArguments[i], args[i])) {
                        sinon.expectation.fail(this.method + " received wrong arguments " + sinon.format(args) +
                            ", expected " + sinon.format(this.expectedArguments));
                    }
                }
            },

            allowsCall: function allowsCall(thisValue, args) {
                if (this.met() && receivedMaxCalls(this)) {
                    return false;
                }

                if ("expectedThis" in this && this.expectedThis !== thisValue) {
                    return false;
                }

                if (!("expectedArguments" in this)) {
                    return true;
                }

                args = args || [];

                if (args.length < this.expectedArguments.length) {
                    return false;
                }

                if (this.expectsExactArgCount &&
                    args.length !== this.expectedArguments.length) {
                    return false;
                }

                for (var i = 0, l = this.expectedArguments.length; i < l; i += 1) {
                    if (!verifyMatcher(this.expectedArguments[i], args[i])) {
                        return false;
                    }

                    if (!sinon.deepEqual(this.expectedArguments[i], args[i])) {
                        return false;
                    }
                }

                return true;
            },

            withArgs: function withArgs() {
                this.expectedArguments = slice.call(arguments);
                return this;
            },

            withExactArgs: function withExactArgs() {
                this.withArgs.apply(this, arguments);
                this.expectsExactArgCount = true;
                return this;
            },

            on: function on(thisValue) {
                this.expectedThis = thisValue;
                return this;
            },

            toString: function () {
                var args = (this.expectedArguments || []).slice();

                if (!this.expectsExactArgCount) {
                    push.call(args, "[...]");
                }

                var callStr = sinon.spyCall.toString.call({
                    proxy: this.method || "anonymous mock expectation",
                    args: args
                });

                var message = callStr.replace(", [...", "[, ...") + " " +
                    expectedCallCountInWords(this);

                if (this.met()) {
                    return "Expectation met: " + message;
                }

                return "Expected " + message + " (" +
                    callCountInWords(this.callCount) + ")";
            },

            verify: function verify() {
                if (!this.met()) {
                    sinon.expectation.fail(this.toString());
                } else {
                    sinon.expectation.pass(this.toString());
                }

                return true;
            },

            pass: function pass(message) {
                sinon.assert.pass(message);
            },

            fail: function fail(message) {
                var exception = new Error(message);
                exception.name = "ExpectationError";

                throw exception;
            }
        };

        sinon.mock = mock;
        return mock;
    }

    var isNode = typeof module !== "undefined" && module.exports && typeof require === "function";
    var isAMD = typeof define === "function" && typeof define.amd === "object" && define.amd;

    function loadDependencies(require, exports, module) {
        var sinon = require("./util/core");
        require("./times_in_words");
        require("./call");
        require("./extend");
        require("./match");
        require("./spy");
        require("./stub");
        require("./format");

        module.exports = makeApi(sinon);
    }

    if (isAMD) {
        define(loadDependencies);
        return;
    }

    if (isNode) {
        loadDependencies(require, module.exports, module);
        return;
    }

    if (sinonGlobal) {
        makeApi(sinonGlobal);
    }
}(
    typeof sinon === "object" && sinon // eslint-disable-line no-undef
));

},{"./call":88,"./extend":90,"./format":91,"./match":93,"./spy":96,"./stub":97,"./times_in_words":100,"./util/core":102}],95:[function(require,module,exports){
/**
 * @depend util/core.js
 * @depend extend.js
 * @depend collection.js
 * @depend util/fake_timers.js
 * @depend util/fake_server_with_clock.js
 */
/**
 * Manages fake collections as well as fake utilities such as Sinon's
 * timers and fake XHR implementation in one convenient object.
 *
 * @author Christian Johansen (christian@cjohansen.no)
 * @license BSD
 *
 * Copyright (c) 2010-2013 Christian Johansen
 */
(function (sinonGlobal) {
    "use strict";

    function makeApi(sinon) {
        var push = [].push;

        function exposeValue(sandbox, config, key, value) {
            if (!value) {
                return;
            }

            if (config.injectInto && !(key in config.injectInto)) {
                config.injectInto[key] = value;
                sandbox.injectedKeys.push(key);
            } else {
                push.call(sandbox.args, value);
            }
        }

        function prepareSandboxFromConfig(config) {
            var sandbox = sinon.create(sinon.sandbox);

            if (config.useFakeServer) {
                if (typeof config.useFakeServer === "object") {
                    sandbox.serverPrototype = config.useFakeServer;
                }

                sandbox.useFakeServer();
            }

            if (config.useFakeTimers) {
                if (typeof config.useFakeTimers === "object") {
                    sandbox.useFakeTimers.apply(sandbox, config.useFakeTimers);
                } else {
                    sandbox.useFakeTimers();
                }
            }

            return sandbox;
        }

        sinon.sandbox = sinon.extend(sinon.create(sinon.collection), {
            useFakeTimers: function useFakeTimers() {
                this.clock = sinon.useFakeTimers.apply(sinon, arguments);

                return this.add(this.clock);
            },

            serverPrototype: sinon.fakeServer,

            useFakeServer: function useFakeServer() {
                var proto = this.serverPrototype || sinon.fakeServer;

                if (!proto || !proto.create) {
                    return null;
                }

                this.server = proto.create();
                return this.add(this.server);
            },

            inject: function (obj) {
                sinon.collection.inject.call(this, obj);

                if (this.clock) {
                    obj.clock = this.clock;
                }

                if (this.server) {
                    obj.server = this.server;
                    obj.requests = this.server.requests;
                }

                obj.match = sinon.match;

                return obj;
            },

            restore: function () {
                sinon.collection.restore.apply(this, arguments);
                this.restoreContext();
            },

            restoreContext: function () {
                if (this.injectedKeys) {
                    for (var i = 0, j = this.injectedKeys.length; i < j; i++) {
                        delete this.injectInto[this.injectedKeys[i]];
                    }
                    this.injectedKeys = [];
                }
            },

            create: function (config) {
                if (!config) {
                    return sinon.create(sinon.sandbox);
                }

                var sandbox = prepareSandboxFromConfig(config);
                sandbox.args = sandbox.args || [];
                sandbox.injectedKeys = [];
                sandbox.injectInto = config.injectInto;
                var prop,
                    value;
                var exposed = sandbox.inject({});

                if (config.properties) {
                    for (var i = 0, l = config.properties.length; i < l; i++) {
                        prop = config.properties[i];
                        value = exposed[prop] || prop === "sandbox" && sandbox;
                        exposeValue(sandbox, config, prop, value);
                    }
                } else {
                    exposeValue(sandbox, config, "sandbox", value);
                }

                return sandbox;
            },

            match: sinon.match
        });

        sinon.sandbox.useFakeXMLHttpRequest = sinon.sandbox.useFakeServer;

        return sinon.sandbox;
    }

    var isNode = typeof module !== "undefined" && module.exports && typeof require === "function";
    var isAMD = typeof define === "function" && typeof define.amd === "object" && define.amd;

    function loadDependencies(require, exports, module) {
        var sinon = require("./util/core");
        require("./extend");
        require("./util/fake_server_with_clock");
        require("./util/fake_timers");
        require("./collection");
        module.exports = makeApi(sinon);
    }

    if (isAMD) {
        define(loadDependencies);
        return;
    }

    if (isNode) {
        loadDependencies(require, module.exports, module);
        return;
    }

    if (sinonGlobal) {
        makeApi(sinonGlobal);
    }
}(
    typeof sinon === "object" && sinon // eslint-disable-line no-undef
));

},{"./collection":89,"./extend":90,"./util/core":102,"./util/fake_server_with_clock":105,"./util/fake_timers":106}],96:[function(require,module,exports){
/**
  * @depend times_in_words.js
  * @depend util/core.js
  * @depend extend.js
  * @depend call.js
  * @depend format.js
  */
/**
  * Spy functions
  *
  * @author Christian Johansen (christian@cjohansen.no)
  * @license BSD
  *
  * Copyright (c) 2010-2013 Christian Johansen
  */
(function (sinonGlobal) {
    "use strict";

    function makeApi(sinon) {
        var push = Array.prototype.push;
        var slice = Array.prototype.slice;
        var callId = 0;

        function spy(object, property, types) {
            if (!property && typeof object === "function") {
                return spy.create(object);
            }

            if (!object && !property) {
                return spy.create(function () { });
            }

            if (types) {
                var methodDesc = sinon.getPropertyDescriptor(object, property);
                for (var i = 0; i < types.length; i++) {
                    methodDesc[types[i]] = spy.create(methodDesc[types[i]]);
                }
                return sinon.wrapMethod(object, property, methodDesc);
            }

            return sinon.wrapMethod(object, property, spy.create(object[property]));
        }

        function matchingFake(fakes, args, strict) {
            if (!fakes) {
                return undefined;
            }

            for (var i = 0, l = fakes.length; i < l; i++) {
                if (fakes[i].matches(args, strict)) {
                    return fakes[i];
                }
            }
        }

        function incrementCallCount() {
            this.called = true;
            this.callCount += 1;
            this.notCalled = false;
            this.calledOnce = this.callCount === 1;
            this.calledTwice = this.callCount === 2;
            this.calledThrice = this.callCount === 3;
        }

        function createCallProperties() {
            this.firstCall = this.getCall(0);
            this.secondCall = this.getCall(1);
            this.thirdCall = this.getCall(2);
            this.lastCall = this.getCall(this.callCount - 1);
        }

        var vars = "a,b,c,d,e,f,g,h,i,j,k,l";
        function createProxy(func, proxyLength) {
            // Retain the function length:
            var p;
            if (proxyLength) {
                eval("p = (function proxy(" + vars.substring(0, proxyLength * 2 - 1) + // eslint-disable-line no-eval
                    ") { return p.invoke(func, this, slice.call(arguments)); });");
            } else {
                p = function proxy() {
                    return p.invoke(func, this, slice.call(arguments));
                };
            }
            p.isSinonProxy = true;
            return p;
        }

        var uuid = 0;

        // Public API
        var spyApi = {
            reset: function () {
                if (this.invoking) {
                    var err = new Error("Cannot reset Sinon function while invoking it. " +
                                        "Move the call to .reset outside of the callback.");
                    err.name = "InvalidResetException";
                    throw err;
                }

                this.called = false;
                this.notCalled = true;
                this.calledOnce = false;
                this.calledTwice = false;
                this.calledThrice = false;
                this.callCount = 0;
                this.firstCall = null;
                this.secondCall = null;
                this.thirdCall = null;
                this.lastCall = null;
                this.args = [];
                this.returnValues = [];
                this.thisValues = [];
                this.exceptions = [];
                this.callIds = [];
                this.stacks = [];
                if (this.fakes) {
                    for (var i = 0; i < this.fakes.length; i++) {
                        this.fakes[i].reset();
                    }
                }

                return this;
            },

            create: function create(func, spyLength) {
                var name;

                if (typeof func !== "function") {
                    func = function () { };
                } else {
                    name = sinon.functionName(func);
                }

                if (!spyLength) {
                    spyLength = func.length;
                }

                var proxy = createProxy(func, spyLength);

                sinon.extend(proxy, spy);
                delete proxy.create;
                sinon.extend(proxy, func);

                proxy.reset();
                proxy.prototype = func.prototype;
                proxy.displayName = name || "spy";
                proxy.toString = sinon.functionToString;
                proxy.instantiateFake = sinon.spy.create;
                proxy.id = "spy#" + uuid++;

                return proxy;
            },

            invoke: function invoke(func, thisValue, args) {
                var matching = matchingFake(this.fakes, args);
                var exception, returnValue;

                incrementCallCount.call(this);
                push.call(this.thisValues, thisValue);
                push.call(this.args, args);
                push.call(this.callIds, callId++);

                // Make call properties available from within the spied function:
                createCallProperties.call(this);

                try {
                    this.invoking = true;

                    if (matching) {
                        returnValue = matching.invoke(func, thisValue, args);
                    } else {
                        returnValue = (this.func || func).apply(thisValue, args);
                    }

                    var thisCall = this.getCall(this.callCount - 1);
                    if (thisCall.calledWithNew() && typeof returnValue !== "object") {
                        returnValue = thisValue;
                    }
                } catch (e) {
                    exception = e;
                } finally {
                    delete this.invoking;
                }

                push.call(this.exceptions, exception);
                push.call(this.returnValues, returnValue);
                push.call(this.stacks, new Error().stack);

                // Make return value and exception available in the calls:
                createCallProperties.call(this);

                if (exception !== undefined) {
                    throw exception;
                }

                return returnValue;
            },

            named: function named(name) {
                this.displayName = name;
                return this;
            },

            getCall: function getCall(i) {
                if (i < 0 || i >= this.callCount) {
                    return null;
                }

                return sinon.spyCall(this, this.thisValues[i], this.args[i],
                                        this.returnValues[i], this.exceptions[i],
                                        this.callIds[i], this.stacks[i]);
            },

            getCalls: function () {
                var calls = [];
                var i;

                for (i = 0; i < this.callCount; i++) {
                    calls.push(this.getCall(i));
                }

                return calls;
            },

            calledBefore: function calledBefore(spyFn) {
                if (!this.called) {
                    return false;
                }

                if (!spyFn.called) {
                    return true;
                }

                return this.callIds[0] < spyFn.callIds[spyFn.callIds.length - 1];
            },

            calledAfter: function calledAfter(spyFn) {
                if (!this.called || !spyFn.called) {
                    return false;
                }

                return this.callIds[this.callCount - 1] > spyFn.callIds[spyFn.callCount - 1];
            },

            withArgs: function () {
                var args = slice.call(arguments);

                if (this.fakes) {
                    var match = matchingFake(this.fakes, args, true);

                    if (match) {
                        return match;
                    }
                } else {
                    this.fakes = [];
                }

                var original = this;
                var fake = this.instantiateFake();
                fake.matchingAguments = args;
                fake.parent = this;
                push.call(this.fakes, fake);

                fake.withArgs = function () {
                    return original.withArgs.apply(original, arguments);
                };

                for (var i = 0; i < this.args.length; i++) {
                    if (fake.matches(this.args[i])) {
                        incrementCallCount.call(fake);
                        push.call(fake.thisValues, this.thisValues[i]);
                        push.call(fake.args, this.args[i]);
                        push.call(fake.returnValues, this.returnValues[i]);
                        push.call(fake.exceptions, this.exceptions[i]);
                        push.call(fake.callIds, this.callIds[i]);
                    }
                }
                createCallProperties.call(fake);

                return fake;
            },

            matches: function (args, strict) {
                var margs = this.matchingAguments;

                if (margs.length <= args.length &&
                    sinon.deepEqual(margs, args.slice(0, margs.length))) {
                    return !strict || margs.length === args.length;
                }
            },

            printf: function (format) {
                var spyInstance = this;
                var args = slice.call(arguments, 1);
                var formatter;

                return (format || "").replace(/%(.)/g, function (match, specifyer) {
                    formatter = spyApi.formatters[specifyer];

                    if (typeof formatter === "function") {
                        return formatter.call(null, spyInstance, args);
                    } else if (!isNaN(parseInt(specifyer, 10))) {
                        return sinon.format(args[specifyer - 1]);
                    }

                    return "%" + specifyer;
                });
            }
        };

        function delegateToCalls(method, matchAny, actual, notCalled) {
            spyApi[method] = function () {
                if (!this.called) {
                    if (notCalled) {
                        return notCalled.apply(this, arguments);
                    }
                    return false;
                }

                var currentCall;
                var matches = 0;

                for (var i = 0, l = this.callCount; i < l; i += 1) {
                    currentCall = this.getCall(i);

                    if (currentCall[actual || method].apply(currentCall, arguments)) {
                        matches += 1;

                        if (matchAny) {
                            return true;
                        }
                    }
                }

                return matches === this.callCount;
            };
        }

        delegateToCalls("calledOn", true);
        delegateToCalls("alwaysCalledOn", false, "calledOn");
        delegateToCalls("calledWith", true);
        delegateToCalls("calledWithMatch", true);
        delegateToCalls("alwaysCalledWith", false, "calledWith");
        delegateToCalls("alwaysCalledWithMatch", false, "calledWithMatch");
        delegateToCalls("calledWithExactly", true);
        delegateToCalls("alwaysCalledWithExactly", false, "calledWithExactly");
        delegateToCalls("neverCalledWith", false, "notCalledWith", function () {
            return true;
        });
        delegateToCalls("neverCalledWithMatch", false, "notCalledWithMatch", function () {
            return true;
        });
        delegateToCalls("threw", true);
        delegateToCalls("alwaysThrew", false, "threw");
        delegateToCalls("returned", true);
        delegateToCalls("alwaysReturned", false, "returned");
        delegateToCalls("calledWithNew", true);
        delegateToCalls("alwaysCalledWithNew", false, "calledWithNew");
        delegateToCalls("callArg", false, "callArgWith", function () {
            throw new Error(this.toString() + " cannot call arg since it was not yet invoked.");
        });
        spyApi.callArgWith = spyApi.callArg;
        delegateToCalls("callArgOn", false, "callArgOnWith", function () {
            throw new Error(this.toString() + " cannot call arg since it was not yet invoked.");
        });
        spyApi.callArgOnWith = spyApi.callArgOn;
        delegateToCalls("yield", false, "yield", function () {
            throw new Error(this.toString() + " cannot yield since it was not yet invoked.");
        });
        // "invokeCallback" is an alias for "yield" since "yield" is invalid in strict mode.
        spyApi.invokeCallback = spyApi.yield;
        delegateToCalls("yieldOn", false, "yieldOn", function () {
            throw new Error(this.toString() + " cannot yield since it was not yet invoked.");
        });
        delegateToCalls("yieldTo", false, "yieldTo", function (property) {
            throw new Error(this.toString() + " cannot yield to '" + property +
                "' since it was not yet invoked.");
        });
        delegateToCalls("yieldToOn", false, "yieldToOn", function (property) {
            throw new Error(this.toString() + " cannot yield to '" + property +
                "' since it was not yet invoked.");
        });

        spyApi.formatters = {
            c: function (spyInstance) {
                return sinon.timesInWords(spyInstance.callCount);
            },

            n: function (spyInstance) {
                return spyInstance.toString();
            },

            C: function (spyInstance) {
                var calls = [];

                for (var i = 0, l = spyInstance.callCount; i < l; ++i) {
                    var stringifiedCall = "    " + spyInstance.getCall(i).toString();
                    if (/\n/.test(calls[i - 1])) {
                        stringifiedCall = "\n" + stringifiedCall;
                    }
                    push.call(calls, stringifiedCall);
                }

                return calls.length > 0 ? "\n" + calls.join("\n") : "";
            },

            t: function (spyInstance) {
                var objects = [];

                for (var i = 0, l = spyInstance.callCount; i < l; ++i) {
                    push.call(objects, sinon.format(spyInstance.thisValues[i]));
                }

                return objects.join(", ");
            },

            "*": function (spyInstance, args) {
                var formatted = [];

                for (var i = 0, l = args.length; i < l; ++i) {
                    push.call(formatted, sinon.format(args[i]));
                }

                return formatted.join(", ");
            }
        };

        sinon.extend(spy, spyApi);

        spy.spyCall = sinon.spyCall;
        sinon.spy = spy;

        return spy;
    }

    var isNode = typeof module !== "undefined" && module.exports && typeof require === "function";
    var isAMD = typeof define === "function" && typeof define.amd === "object" && define.amd;

    function loadDependencies(require, exports, module) {
        var core = require("./util/core");
        require("./call");
        require("./extend");
        require("./times_in_words");
        require("./format");
        module.exports = makeApi(core);
    }

    if (isAMD) {
        define(loadDependencies);
        return;
    }

    if (isNode) {
        loadDependencies(require, module.exports, module);
        return;
    }

    if (sinonGlobal) {
        makeApi(sinonGlobal);
    }
}(
    typeof sinon === "object" && sinon // eslint-disable-line no-undef
));

},{"./call":88,"./extend":90,"./format":91,"./times_in_words":100,"./util/core":102}],97:[function(require,module,exports){
/**
 * @depend util/core.js
 * @depend extend.js
 * @depend spy.js
 * @depend behavior.js
 * @depend walk.js
 */
/**
 * Stub functions
 *
 * @author Christian Johansen (christian@cjohansen.no)
 * @license BSD
 *
 * Copyright (c) 2010-2013 Christian Johansen
 */
(function (sinonGlobal) {
    "use strict";

    function makeApi(sinon) {
        function stub(object, property, func) {
            if (!!func && typeof func !== "function" && typeof func !== "object") {
                throw new TypeError("Custom stub should be a function or a property descriptor");
            }

            var wrapper;

            if (func) {
                if (typeof func === "function") {
                    wrapper = sinon.spy && sinon.spy.create ? sinon.spy.create(func) : func;
                } else {
                    wrapper = func;
                    if (sinon.spy && sinon.spy.create) {
                        var types = sinon.objectKeys(wrapper);
                        for (var i = 0; i < types.length; i++) {
                            wrapper[types[i]] = sinon.spy.create(wrapper[types[i]]);
                        }
                    }
                }
            } else {
                var stubLength = 0;
                if (typeof object === "object" && typeof object[property] === "function") {
                    stubLength = object[property].length;
                }
                wrapper = stub.create(stubLength);
            }

            if (!object && typeof property === "undefined") {
                return sinon.stub.create();
            }

            if (typeof property === "undefined" && typeof object === "object") {
                sinon.walk(object || {}, function (value, prop, propOwner) {
                    // we don't want to stub things like toString(), valueOf(), etc. so we only stub if the object
                    // is not Object.prototype
                    if (
                        propOwner !== Object.prototype &&
                        prop !== "constructor" &&
                        typeof sinon.getPropertyDescriptor(propOwner, prop).value === "function"
                    ) {
                        stub(object, prop);
                    }
                });

                return object;
            }

            return sinon.wrapMethod(object, property, wrapper);
        }


        /*eslint-disable no-use-before-define*/
        function getParentBehaviour(stubInstance) {
            return (stubInstance.parent && getCurrentBehavior(stubInstance.parent));
        }

        function getDefaultBehavior(stubInstance) {
            return stubInstance.defaultBehavior ||
                    getParentBehaviour(stubInstance) ||
                    sinon.behavior.create(stubInstance);
        }

        function getCurrentBehavior(stubInstance) {
            var behavior = stubInstance.behaviors[stubInstance.callCount - 1];
            return behavior && behavior.isPresent() ? behavior : getDefaultBehavior(stubInstance);
        }
        /*eslint-enable no-use-before-define*/

        var uuid = 0;

        var proto = {
            create: function create(stubLength) {
                var functionStub = function () {
                    return getCurrentBehavior(functionStub).invoke(this, arguments);
                };

                functionStub.id = "stub#" + uuid++;
                var orig = functionStub;
                functionStub = sinon.spy.create(functionStub, stubLength);
                functionStub.func = orig;

                sinon.extend(functionStub, stub);
                functionStub.instantiateFake = sinon.stub.create;
                functionStub.displayName = "stub";
                functionStub.toString = sinon.functionToString;

                functionStub.defaultBehavior = null;
                functionStub.behaviors = [];

                return functionStub;
            },

            resetBehavior: function () {
                var i;

                this.defaultBehavior = null;
                this.behaviors = [];

                delete this.returnValue;
                delete this.returnArgAt;
                this.returnThis = false;

                if (this.fakes) {
                    for (i = 0; i < this.fakes.length; i++) {
                        this.fakes[i].resetBehavior();
                    }
                }
            },

            onCall: function onCall(index) {
                if (!this.behaviors[index]) {
                    this.behaviors[index] = sinon.behavior.create(this);
                }

                return this.behaviors[index];
            },

            onFirstCall: function onFirstCall() {
                return this.onCall(0);
            },

            onSecondCall: function onSecondCall() {
                return this.onCall(1);
            },

            onThirdCall: function onThirdCall() {
                return this.onCall(2);
            }
        };

        function createBehavior(behaviorMethod) {
            return function () {
                this.defaultBehavior = this.defaultBehavior || sinon.behavior.create(this);
                this.defaultBehavior[behaviorMethod].apply(this.defaultBehavior, arguments);
                return this;
            };
        }

        for (var method in sinon.behavior) {
            if (sinon.behavior.hasOwnProperty(method) &&
                !proto.hasOwnProperty(method) &&
                method !== "create" &&
                method !== "withArgs" &&
                method !== "invoke") {
                proto[method] = createBehavior(method);
            }
        }

        sinon.extend(stub, proto);
        sinon.stub = stub;

        return stub;
    }

    var isNode = typeof module !== "undefined" && module.exports && typeof require === "function";
    var isAMD = typeof define === "function" && typeof define.amd === "object" && define.amd;

    function loadDependencies(require, exports, module) {
        var core = require("./util/core");
        require("./behavior");
        require("./spy");
        require("./extend");
        module.exports = makeApi(core);
    }

    if (isAMD) {
        define(loadDependencies);
        return;
    }

    if (isNode) {
        loadDependencies(require, module.exports, module);
        return;
    }

    if (sinonGlobal) {
        makeApi(sinonGlobal);
    }
}(
    typeof sinon === "object" && sinon // eslint-disable-line no-undef
));

},{"./behavior":87,"./extend":90,"./spy":96,"./util/core":102}],98:[function(require,module,exports){
/**
 * @depend util/core.js
 * @depend sandbox.js
 */
/**
 * Test function, sandboxes fakes
 *
 * @author Christian Johansen (christian@cjohansen.no)
 * @license BSD
 *
 * Copyright (c) 2010-2013 Christian Johansen
 */
(function (sinonGlobal) {
    "use strict";

    function makeApi(sinon) {
        var slice = Array.prototype.slice;

        function test(callback) {
            var type = typeof callback;

            if (type !== "function") {
                throw new TypeError("sinon.test needs to wrap a test function, got " + type);
            }

            function sinonSandboxedTest() {
                var config = sinon.getConfig(sinon.config);
                config.injectInto = config.injectIntoThis && this || config.injectInto;
                var sandbox = sinon.sandbox.create(config);
                var args = slice.call(arguments);
                var oldDone = args.length && args[args.length - 1];
                var exception, result;

                if (typeof oldDone === "function") {
                    args[args.length - 1] = function sinonDone(res) {
                        if (res) {
                            sandbox.restore();
                        } else {
                            sandbox.verifyAndRestore();
                        }
                        oldDone(res);
                    };
                }

                try {
                    result = callback.apply(this, args.concat(sandbox.args));
                } catch (e) {
                    exception = e;
                }

                if (typeof exception !== "undefined") {
                    sandbox.restore();
                    throw exception;
                } else if (typeof oldDone !== "function") {
                    sandbox.verifyAndRestore();
                }

                return result;
            }

            if (callback.length) {
                return function sinonAsyncSandboxedTest(done) { // eslint-disable-line no-unused-vars
                    return sinonSandboxedTest.apply(this, arguments);
                };
            }

            return sinonSandboxedTest;
        }

        test.config = {
            injectIntoThis: true,
            injectInto: null,
            properties: ["spy", "stub", "mock", "clock", "server", "requests"],
            useFakeTimers: true,
            useFakeServer: true
        };

        sinon.test = test;
        return test;
    }

    var isNode = typeof module !== "undefined" && module.exports && typeof require === "function";
    var isAMD = typeof define === "function" && typeof define.amd === "object" && define.amd;

    function loadDependencies(require, exports, module) {
        var core = require("./util/core");
        require("./sandbox");
        module.exports = makeApi(core);
    }

    if (isAMD) {
        define(loadDependencies);
    } else if (isNode) {
        loadDependencies(require, module.exports, module);
    } else if (sinonGlobal) {
        makeApi(sinonGlobal);
    }
}(typeof sinon === "object" && sinon || null)); // eslint-disable-line no-undef

},{"./sandbox":95,"./util/core":102}],99:[function(require,module,exports){
/**
 * @depend util/core.js
 * @depend test.js
 */
/**
 * Test case, sandboxes all test functions
 *
 * @author Christian Johansen (christian@cjohansen.no)
 * @license BSD
 *
 * Copyright (c) 2010-2013 Christian Johansen
 */
(function (sinonGlobal) {
    "use strict";

    function createTest(property, setUp, tearDown) {
        return function () {
            if (setUp) {
                setUp.apply(this, arguments);
            }

            var exception, result;

            try {
                result = property.apply(this, arguments);
            } catch (e) {
                exception = e;
            }

            if (tearDown) {
                tearDown.apply(this, arguments);
            }

            if (exception) {
                throw exception;
            }

            return result;
        };
    }

    function makeApi(sinon) {
        function testCase(tests, prefix) {
            if (!tests || typeof tests !== "object") {
                throw new TypeError("sinon.testCase needs an object with test functions");
            }

            prefix = prefix || "test";
            var rPrefix = new RegExp("^" + prefix);
            var methods = {};
            var setUp = tests.setUp;
            var tearDown = tests.tearDown;
            var testName,
                property,
                method;

            for (testName in tests) {
                if (tests.hasOwnProperty(testName) && !/^(setUp|tearDown)$/.test(testName)) {
                    property = tests[testName];

                    if (typeof property === "function" && rPrefix.test(testName)) {
                        method = property;

                        if (setUp || tearDown) {
                            method = createTest(property, setUp, tearDown);
                        }

                        methods[testName] = sinon.test(method);
                    } else {
                        methods[testName] = tests[testName];
                    }
                }
            }

            return methods;
        }

        sinon.testCase = testCase;
        return testCase;
    }

    var isNode = typeof module !== "undefined" && module.exports && typeof require === "function";
    var isAMD = typeof define === "function" && typeof define.amd === "object" && define.amd;

    function loadDependencies(require, exports, module) {
        var core = require("./util/core");
        require("./test");
        module.exports = makeApi(core);
    }

    if (isAMD) {
        define(loadDependencies);
        return;
    }

    if (isNode) {
        loadDependencies(require, module.exports, module);
        return;
    }

    if (sinonGlobal) {
        makeApi(sinonGlobal);
    }
}(
    typeof sinon === "object" && sinon // eslint-disable-line no-undef
));

},{"./test":98,"./util/core":102}],100:[function(require,module,exports){
/**
 * @depend util/core.js
 */
(function (sinonGlobal) {
    "use strict";

    function makeApi(sinon) {

        function timesInWords(count) {
            switch (count) {
                case 1:
                    return "once";
                case 2:
                    return "twice";
                case 3:
                    return "thrice";
                default:
                    return (count || 0) + " times";
            }
        }

        sinon.timesInWords = timesInWords;
        return sinon.timesInWords;
    }

    function loadDependencies(require, exports, module) {
        var core = require("./util/core");
        module.exports = makeApi(core);
    }

    var isNode = typeof module !== "undefined" && module.exports && typeof require === "function";
    var isAMD = typeof define === "function" && typeof define.amd === "object" && define.amd;

    if (isAMD) {
        define(loadDependencies);
        return;
    }

    if (isNode) {
        loadDependencies(require, module.exports, module);
        return;
    }

    if (sinonGlobal) {
        makeApi(sinonGlobal);
    }
}(
    typeof sinon === "object" && sinon // eslint-disable-line no-undef
));

},{"./util/core":102}],101:[function(require,module,exports){
/**
 * @depend util/core.js
 */
/**
 * Format functions
 *
 * @author Christian Johansen (christian@cjohansen.no)
 * @license BSD
 *
 * Copyright (c) 2010-2014 Christian Johansen
 */
(function (sinonGlobal) {
    "use strict";

    function makeApi(sinon) {
        function typeOf(value) {
            if (value === null) {
                return "null";
            } else if (value === undefined) {
                return "undefined";
            }
            var string = Object.prototype.toString.call(value);
            return string.substring(8, string.length - 1).toLowerCase();
        }

        sinon.typeOf = typeOf;
        return sinon.typeOf;
    }

    function loadDependencies(require, exports, module) {
        var core = require("./util/core");
        module.exports = makeApi(core);
    }

    var isNode = typeof module !== "undefined" && module.exports && typeof require === "function";
    var isAMD = typeof define === "function" && typeof define.amd === "object" && define.amd;

    if (isAMD) {
        define(loadDependencies);
        return;
    }

    if (isNode) {
        loadDependencies(require, module.exports, module);
        return;
    }

    if (sinonGlobal) {
        makeApi(sinonGlobal);
    }
}(
    typeof sinon === "object" && sinon // eslint-disable-line no-undef
));

},{"./util/core":102}],102:[function(require,module,exports){
/**
 * @depend ../../sinon.js
 */
/**
 * Sinon core utilities. For internal use only.
 *
 * @author Christian Johansen (christian@cjohansen.no)
 * @license BSD
 *
 * Copyright (c) 2010-2013 Christian Johansen
 */
(function (sinonGlobal) {
    "use strict";

    var div = typeof document !== "undefined" && document.createElement("div");
    var hasOwn = Object.prototype.hasOwnProperty;

    function isDOMNode(obj) {
        var success = false;

        try {
            obj.appendChild(div);
            success = div.parentNode === obj;
        } catch (e) {
            return false;
        } finally {
            try {
                obj.removeChild(div);
            } catch (e) {
                // Remove failed, not much we can do about that
            }
        }

        return success;
    }

    function isElement(obj) {
        return div && obj && obj.nodeType === 1 && isDOMNode(obj);
    }

    function isFunction(obj) {
        return typeof obj === "function" || !!(obj && obj.constructor && obj.call && obj.apply);
    }

    function isReallyNaN(val) {
        return typeof val === "number" && isNaN(val);
    }

    function mirrorProperties(target, source) {
        for (var prop in source) {
            if (!hasOwn.call(target, prop)) {
                target[prop] = source[prop];
            }
        }
    }

    function isRestorable(obj) {
        return typeof obj === "function" && typeof obj.restore === "function" && obj.restore.sinon;
    }

    // Cheap way to detect if we have ES5 support.
    var hasES5Support = "keys" in Object;

    function makeApi(sinon) {
        sinon.wrapMethod = function wrapMethod(object, property, method) {
            if (!object) {
                throw new TypeError("Should wrap property of object");
            }

            if (typeof method !== "function" && typeof method !== "object") {
                throw new TypeError("Method wrapper should be a function or a property descriptor");
            }

            function checkWrappedMethod(wrappedMethod) {
                var error;

                if (!isFunction(wrappedMethod)) {
                    error = new TypeError("Attempted to wrap " + (typeof wrappedMethod) + " property " +
                                        property + " as function");
                } else if (wrappedMethod.restore && wrappedMethod.restore.sinon) {
                    error = new TypeError("Attempted to wrap " + property + " which is already wrapped");
                } else if (wrappedMethod.calledBefore) {
                    var verb = wrappedMethod.returns ? "stubbed" : "spied on";
                    error = new TypeError("Attempted to wrap " + property + " which is already " + verb);
                }

                if (error) {
                    if (wrappedMethod && wrappedMethod.stackTrace) {
                        error.stack += "\n--------------\n" + wrappedMethod.stackTrace;
                    }
                    throw error;
                }
            }

            var error, wrappedMethod, i;

            // IE 8 does not support hasOwnProperty on the window object and Firefox has a problem
            // when using hasOwn.call on objects from other frames.
            var owned = object.hasOwnProperty ? object.hasOwnProperty(property) : hasOwn.call(object, property);

            if (hasES5Support) {
                var methodDesc = (typeof method === "function") ? {value: method} : method;
                var wrappedMethodDesc = sinon.getPropertyDescriptor(object, property);

                if (!wrappedMethodDesc) {
                    error = new TypeError("Attempted to wrap " + (typeof wrappedMethod) + " property " +
                                        property + " as function");
                } else if (wrappedMethodDesc.restore && wrappedMethodDesc.restore.sinon) {
                    error = new TypeError("Attempted to wrap " + property + " which is already wrapped");
                }
                if (error) {
                    if (wrappedMethodDesc && wrappedMethodDesc.stackTrace) {
                        error.stack += "\n--------------\n" + wrappedMethodDesc.stackTrace;
                    }
                    throw error;
                }

                var types = sinon.objectKeys(methodDesc);
                for (i = 0; i < types.length; i++) {
                    wrappedMethod = wrappedMethodDesc[types[i]];
                    checkWrappedMethod(wrappedMethod);
                }

                mirrorProperties(methodDesc, wrappedMethodDesc);
                for (i = 0; i < types.length; i++) {
                    mirrorProperties(methodDesc[types[i]], wrappedMethodDesc[types[i]]);
                }
                Object.defineProperty(object, property, methodDesc);
            } else {
                wrappedMethod = object[property];
                checkWrappedMethod(wrappedMethod);
                object[property] = method;
                method.displayName = property;
            }

            method.displayName = property;

            // Set up a stack trace which can be used later to find what line of
            // code the original method was created on.
            method.stackTrace = (new Error("Stack Trace for original")).stack;

            method.restore = function () {
                // For prototype properties try to reset by delete first.
                // If this fails (ex: localStorage on mobile safari) then force a reset
                // via direct assignment.
                if (!owned) {
                    // In some cases `delete` may throw an error
                    try {
                        delete object[property];
                    } catch (e) {} // eslint-disable-line no-empty
                    // For native code functions `delete` fails without throwing an error
                    // on Chrome < 43, PhantomJS, etc.
                } else if (hasES5Support) {
                    Object.defineProperty(object, property, wrappedMethodDesc);
                }

                // Use strict equality comparison to check failures then force a reset
                // via direct assignment.
                if (object[property] === method) {
                    object[property] = wrappedMethod;
                }
            };

            method.restore.sinon = true;

            if (!hasES5Support) {
                mirrorProperties(method, wrappedMethod);
            }

            return method;
        };

        sinon.create = function create(proto) {
            var F = function () {};
            F.prototype = proto;
            return new F();
        };

        sinon.deepEqual = function deepEqual(a, b) {
            if (sinon.match && sinon.match.isMatcher(a)) {
                return a.test(b);
            }

            if (typeof a !== "object" || typeof b !== "object") {
                return isReallyNaN(a) && isReallyNaN(b) || a === b;
            }

            if (isElement(a) || isElement(b)) {
                return a === b;
            }

            if (a === b) {
                return true;
            }

            if ((a === null && b !== null) || (a !== null && b === null)) {
                return false;
            }

            if (a instanceof RegExp && b instanceof RegExp) {
                return (a.source === b.source) && (a.global === b.global) &&
                    (a.ignoreCase === b.ignoreCase) && (a.multiline === b.multiline);
            }

            var aString = Object.prototype.toString.call(a);
            if (aString !== Object.prototype.toString.call(b)) {
                return false;
            }

            if (aString === "[object Date]") {
                return a.valueOf() === b.valueOf();
            }

            var prop;
            var aLength = 0;
            var bLength = 0;

            if (aString === "[object Array]" && a.length !== b.length) {
                return false;
            }

            for (prop in a) {
                if (hasOwn.call(a, prop)) {
                    aLength += 1;

                    if (!(prop in b)) {
                        return false;
                    }

                    if (!deepEqual(a[prop], b[prop])) {
                        return false;
                    }
                }
            }

            for (prop in b) {
                if (hasOwn.call(b, prop)) {
                    bLength += 1;
                }
            }

            return aLength === bLength;
        };

        sinon.functionName = function functionName(func) {
            var name = func.displayName || func.name;

            // Use function decomposition as a last resort to get function
            // name. Does not rely on function decomposition to work - if it
            // doesn't debugging will be slightly less informative
            // (i.e. toString will say 'spy' rather than 'myFunc').
            if (!name) {
                var matches = func.toString().match(/function ([^\s\(]+)/);
                name = matches && matches[1];
            }

            return name;
        };

        sinon.functionToString = function toString() {
            if (this.getCall && this.callCount) {
                var thisValue,
                    prop;
                var i = this.callCount;

                while (i--) {
                    thisValue = this.getCall(i).thisValue;

                    for (prop in thisValue) {
                        if (thisValue[prop] === this) {
                            return prop;
                        }
                    }
                }
            }

            return this.displayName || "sinon fake";
        };

        sinon.objectKeys = function objectKeys(obj) {
            if (obj !== Object(obj)) {
                throw new TypeError("sinon.objectKeys called on a non-object");
            }

            var keys = [];
            var key;
            for (key in obj) {
                if (hasOwn.call(obj, key)) {
                    keys.push(key);
                }
            }

            return keys;
        };

        sinon.getPropertyDescriptor = function getPropertyDescriptor(object, property) {
            var proto = object;
            var descriptor;

            while (proto && !(descriptor = Object.getOwnPropertyDescriptor(proto, property))) {
                proto = Object.getPrototypeOf(proto);
            }
            return descriptor;
        };

        sinon.getConfig = function (custom) {
            var config = {};
            custom = custom || {};
            var defaults = sinon.defaultConfig;

            for (var prop in defaults) {
                if (defaults.hasOwnProperty(prop)) {
                    config[prop] = custom.hasOwnProperty(prop) ? custom[prop] : defaults[prop];
                }
            }

            return config;
        };

        sinon.defaultConfig = {
            injectIntoThis: true,
            injectInto: null,
            properties: ["spy", "stub", "mock", "clock", "server", "requests"],
            useFakeTimers: true,
            useFakeServer: true
        };

        sinon.timesInWords = function timesInWords(count) {
            return count === 1 && "once" ||
                count === 2 && "twice" ||
                count === 3 && "thrice" ||
                (count || 0) + " times";
        };

        sinon.calledInOrder = function (spies) {
            for (var i = 1, l = spies.length; i < l; i++) {
                if (!spies[i - 1].calledBefore(spies[i]) || !spies[i].called) {
                    return false;
                }
            }

            return true;
        };

        sinon.orderByFirstCall = function (spies) {
            return spies.sort(function (a, b) {
                // uuid, won't ever be equal
                var aCall = a.getCall(0);
                var bCall = b.getCall(0);
                var aId = aCall && aCall.callId || -1;
                var bId = bCall && bCall.callId || -1;

                return aId < bId ? -1 : 1;
            });
        };

        sinon.createStubInstance = function (constructor) {
            if (typeof constructor !== "function") {
                throw new TypeError("The constructor should be a function.");
            }
            return sinon.stub(sinon.create(constructor.prototype));
        };

        sinon.restore = function (object) {
            if (object !== null && typeof object === "object") {
                for (var prop in object) {
                    if (isRestorable(object[prop])) {
                        object[prop].restore();
                    }
                }
            } else if (isRestorable(object)) {
                object.restore();
            }
        };

        return sinon;
    }

    var isNode = typeof module !== "undefined" && module.exports && typeof require === "function";
    var isAMD = typeof define === "function" && typeof define.amd === "object" && define.amd;

    function loadDependencies(require, exports) {
        makeApi(exports);
    }

    if (isAMD) {
        define(loadDependencies);
        return;
    }

    if (isNode) {
        loadDependencies(require, module.exports, module);
        return;
    }

    if (sinonGlobal) {
        makeApi(sinonGlobal);
    }
}(
    typeof sinon === "object" && sinon // eslint-disable-line no-undef
));

},{}],103:[function(require,module,exports){
/**
 * Minimal Event interface implementation
 *
 * Original implementation by Sven Fuchs: https://gist.github.com/995028
 * Modifications and tests by Christian Johansen.
 *
 * @author Sven Fuchs (svenfuchs@artweb-design.de)
 * @author Christian Johansen (christian@cjohansen.no)
 * @license BSD
 *
 * Copyright (c) 2011 Sven Fuchs, Christian Johansen
 */
if (typeof sinon === "undefined") {
    this.sinon = {};
}

(function () {
    "use strict";

    var push = [].push;

    function makeApi(sinon) {
        sinon.Event = function Event(type, bubbles, cancelable, target) {
            this.initEvent(type, bubbles, cancelable, target);
        };

        sinon.Event.prototype = {
            initEvent: function (type, bubbles, cancelable, target) {
                this.type = type;
                this.bubbles = bubbles;
                this.cancelable = cancelable;
                this.target = target;
            },

            stopPropagation: function () {},

            preventDefault: function () {
                this.defaultPrevented = true;
            }
        };

        sinon.ProgressEvent = function ProgressEvent(type, progressEventRaw, target) {
            this.initEvent(type, false, false, target);
            this.loaded = typeof progressEventRaw.loaded === "number" ? progressEventRaw.loaded : null;
            this.total = typeof progressEventRaw.total === "number" ? progressEventRaw.total : null;
            this.lengthComputable = !!progressEventRaw.total;
        };

        sinon.ProgressEvent.prototype = new sinon.Event();

        sinon.ProgressEvent.prototype.constructor = sinon.ProgressEvent;

        sinon.CustomEvent = function CustomEvent(type, customData, target) {
            this.initEvent(type, false, false, target);
            this.detail = customData.detail || null;
        };

        sinon.CustomEvent.prototype = new sinon.Event();

        sinon.CustomEvent.prototype.constructor = sinon.CustomEvent;

        sinon.EventTarget = {
            addEventListener: function addEventListener(event, listener) {
                this.eventListeners = this.eventListeners || {};
                this.eventListeners[event] = this.eventListeners[event] || [];
                push.call(this.eventListeners[event], listener);
            },

            removeEventListener: function removeEventListener(event, listener) {
                var listeners = this.eventListeners && this.eventListeners[event] || [];

                for (var i = 0, l = listeners.length; i < l; ++i) {
                    if (listeners[i] === listener) {
                        return listeners.splice(i, 1);
                    }
                }
            },

            dispatchEvent: function dispatchEvent(event) {
                var type = event.type;
                var listeners = this.eventListeners && this.eventListeners[type] || [];

                for (var i = 0; i < listeners.length; i++) {
                    if (typeof listeners[i] === "function") {
                        listeners[i].call(this, event);
                    } else {
                        listeners[i].handleEvent(event);
                    }
                }

                return !!event.defaultPrevented;
            }
        };
    }

    var isNode = typeof module !== "undefined" && module.exports && typeof require === "function";
    var isAMD = typeof define === "function" && typeof define.amd === "object" && define.amd;

    function loadDependencies(require) {
        var sinon = require("./core");
        makeApi(sinon);
    }

    if (isAMD) {
        define(loadDependencies);
    } else if (isNode) {
        loadDependencies(require);
    } else {
        makeApi(sinon); // eslint-disable-line no-undef
    }
}());

},{"./core":102}],104:[function(require,module,exports){
/**
 * @depend fake_xdomain_request.js
 * @depend fake_xml_http_request.js
 * @depend ../format.js
 * @depend ../log_error.js
 */
/**
 * The Sinon "server" mimics a web server that receives requests from
 * sinon.FakeXMLHttpRequest and provides an API to respond to those requests,
 * both synchronously and asynchronously. To respond synchronuously, canned
 * answers have to be provided upfront.
 *
 * @author Christian Johansen (christian@cjohansen.no)
 * @license BSD
 *
 * Copyright (c) 2010-2013 Christian Johansen
 */
(function () {
    "use strict";

    var push = [].push;

    function responseArray(handler) {
        var response = handler;

        if (Object.prototype.toString.call(handler) !== "[object Array]") {
            response = [200, {}, handler];
        }

        if (typeof response[2] !== "string") {
            throw new TypeError("Fake server response body should be string, but was " +
                                typeof response[2]);
        }

        return response;
    }

    var wloc = typeof window !== "undefined" ? window.location : {};
    var rCurrLoc = new RegExp("^" + wloc.protocol + "//" + wloc.host);

    function matchOne(response, reqMethod, reqUrl) {
        var rmeth = response.method;
        var matchMethod = !rmeth || rmeth.toLowerCase() === reqMethod.toLowerCase();
        var url = response.url;
        var matchUrl = !url || url === reqUrl || (typeof url.test === "function" && url.test(reqUrl));

        return matchMethod && matchUrl;
    }

    function match(response, request) {
        var requestUrl = request.url;

        if (!/^https?:\/\//.test(requestUrl) || rCurrLoc.test(requestUrl)) {
            requestUrl = requestUrl.replace(rCurrLoc, "");
        }

        if (matchOne(response, this.getHTTPMethod(request), requestUrl)) {
            if (typeof response.response === "function") {
                var ru = response.url;
                var args = [request].concat(ru && typeof ru.exec === "function" ? ru.exec(requestUrl).slice(1) : []);
                return response.response.apply(response, args);
            }

            return true;
        }

        return false;
    }

    function makeApi(sinon) {
        sinon.fakeServer = {
            create: function (config) {
                var server = sinon.create(this);
                server.configure(config);
                if (!sinon.xhr.supportsCORS) {
                    this.xhr = sinon.useFakeXDomainRequest();
                } else {
                    this.xhr = sinon.useFakeXMLHttpRequest();
                }
                server.requests = [];

                this.xhr.onCreate = function (xhrObj) {
                    server.addRequest(xhrObj);
                };

                return server;
            },
            configure: function (config) {
                var whitelist = {
                    "autoRespond": true,
                    "autoRespondAfter": true,
                    "respondImmediately": true,
                    "fakeHTTPMethods": true
                };
                var setting;

                config = config || {};
                for (setting in config) {
                    if (whitelist.hasOwnProperty(setting) && config.hasOwnProperty(setting)) {
                        this[setting] = config[setting];
                    }
                }
            },
            addRequest: function addRequest(xhrObj) {
                var server = this;
                push.call(this.requests, xhrObj);

                xhrObj.onSend = function () {
                    server.handleRequest(this);

                    if (server.respondImmediately) {
                        server.respond();
                    } else if (server.autoRespond && !server.responding) {
                        setTimeout(function () {
                            server.responding = false;
                            server.respond();
                        }, server.autoRespondAfter || 10);

                        server.responding = true;
                    }
                };
            },

            getHTTPMethod: function getHTTPMethod(request) {
                if (this.fakeHTTPMethods && /post/i.test(request.method)) {
                    var matches = (request.requestBody || "").match(/_method=([^\b;]+)/);
                    return matches ? matches[1] : request.method;
                }

                return request.method;
            },

            handleRequest: function handleRequest(xhr) {
                if (xhr.async) {
                    if (!this.queue) {
                        this.queue = [];
                    }

                    push.call(this.queue, xhr);
                } else {
                    this.processRequest(xhr);
                }
            },

            log: function log(response, request) {
                var str;

                str = "Request:\n" + sinon.format(request) + "\n\n";
                str += "Response:\n" + sinon.format(response) + "\n\n";

                sinon.log(str);
            },

            respondWith: function respondWith(method, url, body) {
                if (arguments.length === 1 && typeof method !== "function") {
                    this.response = responseArray(method);
                    return;
                }

                if (!this.responses) {
                    this.responses = [];
                }

                if (arguments.length === 1) {
                    body = method;
                    url = method = null;
                }

                if (arguments.length === 2) {
                    body = url;
                    url = method;
                    method = null;
                }

                push.call(this.responses, {
                    method: method,
                    url: url,
                    response: typeof body === "function" ? body : responseArray(body)
                });
            },

            respond: function respond() {
                if (arguments.length > 0) {
                    this.respondWith.apply(this, arguments);
                }

                var queue = this.queue || [];
                var requests = queue.splice(0, queue.length);

                for (var i = 0; i < requests.length; i++) {
                    this.processRequest(requests[i]);
                }
            },

            processRequest: function processRequest(request) {
                try {
                    if (request.aborted) {
                        return;
                    }

                    var response = this.response || [404, {}, ""];

                    if (this.responses) {
                        for (var l = this.responses.length, i = l - 1; i >= 0; i--) {
                            if (match.call(this, this.responses[i], request)) {
                                response = this.responses[i].response;
                                break;
                            }
                        }
                    }

                    if (request.readyState !== 4) {
                        this.log(response, request);

                        request.respond(response[0], response[1], response[2]);
                    }
                } catch (e) {
                    sinon.logError("Fake server request processing", e);
                }
            },

            restore: function restore() {
                return this.xhr.restore && this.xhr.restore.apply(this.xhr, arguments);
            }
        };
    }

    var isNode = typeof module !== "undefined" && module.exports && typeof require === "function";
    var isAMD = typeof define === "function" && typeof define.amd === "object" && define.amd;

    function loadDependencies(require, exports, module) {
        var sinon = require("./core");
        require("./fake_xdomain_request");
        require("./fake_xml_http_request");
        require("../format");
        makeApi(sinon);
        module.exports = sinon;
    }

    if (isAMD) {
        define(loadDependencies);
    } else if (isNode) {
        loadDependencies(require, module.exports, module);
    } else {
        makeApi(sinon); // eslint-disable-line no-undef
    }
}());

},{"../format":91,"./core":102,"./fake_xdomain_request":107,"./fake_xml_http_request":108}],105:[function(require,module,exports){
/**
 * @depend fake_server.js
 * @depend fake_timers.js
 */
/**
 * Add-on for sinon.fakeServer that automatically handles a fake timer along with
 * the FakeXMLHttpRequest. The direct inspiration for this add-on is jQuery
 * 1.3.x, which does not use xhr object's onreadystatehandler at all - instead,
 * it polls the object for completion with setInterval. Dispite the direct
 * motivation, there is nothing jQuery-specific in this file, so it can be used
 * in any environment where the ajax implementation depends on setInterval or
 * setTimeout.
 *
 * @author Christian Johansen (christian@cjohansen.no)
 * @license BSD
 *
 * Copyright (c) 2010-2013 Christian Johansen
 */
(function () {
    "use strict";

    function makeApi(sinon) {
        function Server() {}
        Server.prototype = sinon.fakeServer;

        sinon.fakeServerWithClock = new Server();

        sinon.fakeServerWithClock.addRequest = function addRequest(xhr) {
            if (xhr.async) {
                if (typeof setTimeout.clock === "object") {
                    this.clock = setTimeout.clock;
                } else {
                    this.clock = sinon.useFakeTimers();
                    this.resetClock = true;
                }

                if (!this.longestTimeout) {
                    var clockSetTimeout = this.clock.setTimeout;
                    var clockSetInterval = this.clock.setInterval;
                    var server = this;

                    this.clock.setTimeout = function (fn, timeout) {
                        server.longestTimeout = Math.max(timeout, server.longestTimeout || 0);

                        return clockSetTimeout.apply(this, arguments);
                    };

                    this.clock.setInterval = function (fn, timeout) {
                        server.longestTimeout = Math.max(timeout, server.longestTimeout || 0);

                        return clockSetInterval.apply(this, arguments);
                    };
                }
            }

            return sinon.fakeServer.addRequest.call(this, xhr);
        };

        sinon.fakeServerWithClock.respond = function respond() {
            var returnVal = sinon.fakeServer.respond.apply(this, arguments);

            if (this.clock) {
                this.clock.tick(this.longestTimeout || 0);
                this.longestTimeout = 0;

                if (this.resetClock) {
                    this.clock.restore();
                    this.resetClock = false;
                }
            }

            return returnVal;
        };

        sinon.fakeServerWithClock.restore = function restore() {
            if (this.clock) {
                this.clock.restore();
            }

            return sinon.fakeServer.restore.apply(this, arguments);
        };
    }

    var isNode = typeof module !== "undefined" && module.exports && typeof require === "function";
    var isAMD = typeof define === "function" && typeof define.amd === "object" && define.amd;

    function loadDependencies(require) {
        var sinon = require("./core");
        require("./fake_server");
        require("./fake_timers");
        makeApi(sinon);
    }

    if (isAMD) {
        define(loadDependencies);
    } else if (isNode) {
        loadDependencies(require);
    } else {
        makeApi(sinon); // eslint-disable-line no-undef
    }
}());

},{"./core":102,"./fake_server":104,"./fake_timers":106}],106:[function(require,module,exports){
/**
 * Fake timer API
 * setTimeout
 * setInterval
 * clearTimeout
 * clearInterval
 * tick
 * reset
 * Date
 *
 * Inspired by jsUnitMockTimeOut from JsUnit
 *
 * @author Christian Johansen (christian@cjohansen.no)
 * @license BSD
 *
 * Copyright (c) 2010-2013 Christian Johansen
 */
(function () {
    "use strict";

    function makeApi(s, lol) {
        /*global lolex */
        var llx = typeof lolex !== "undefined" ? lolex : lol;

        s.useFakeTimers = function () {
            var now;
            var methods = Array.prototype.slice.call(arguments);

            if (typeof methods[0] === "string") {
                now = 0;
            } else {
                now = methods.shift();
            }

            var clock = llx.install(now || 0, methods);
            clock.restore = clock.uninstall;
            return clock;
        };

        s.clock = {
            create: function (now) {
                return llx.createClock(now);
            }
        };

        s.timers = {
            setTimeout: setTimeout,
            clearTimeout: clearTimeout,
            setImmediate: (typeof setImmediate !== "undefined" ? setImmediate : undefined),
            clearImmediate: (typeof clearImmediate !== "undefined" ? clearImmediate : undefined),
            setInterval: setInterval,
            clearInterval: clearInterval,
            Date: Date
        };
    }

    var isNode = typeof module !== "undefined" && module.exports && typeof require === "function";
    var isAMD = typeof define === "function" && typeof define.amd === "object" && define.amd;

    function loadDependencies(require, epxorts, module, lolex) {
        var core = require("./core");
        makeApi(core, lolex);
        module.exports = core;
    }

    if (isAMD) {
        define(loadDependencies);
    } else if (isNode) {
        loadDependencies(require, module.exports, module, require("lolex"));
    } else {
        makeApi(sinon); // eslint-disable-line no-undef
    }
}());

},{"./core":102,"lolex":46}],107:[function(require,module,exports){
(function (global){
/**
 * @depend core.js
 * @depend ../extend.js
 * @depend event.js
 * @depend ../log_error.js
 */
/**
 * Fake XDomainRequest object
 */

/**
 * Returns the global to prevent assigning values to 'this' when this is undefined.
 * This can occur when files are interpreted by node in strict mode.
 * @private
 */
function getGlobal() {
    "use strict";

    return typeof window !== "undefined" ? window : global;
}

if (typeof sinon === "undefined") {
    if (typeof this === "undefined") {
        getGlobal().sinon = {};
    } else {
        this.sinon = {};
    }
}

// wrapper for global
(function (global) {
    "use strict";

    var xdr = { XDomainRequest: global.XDomainRequest };
    xdr.GlobalXDomainRequest = global.XDomainRequest;
    xdr.supportsXDR = typeof xdr.GlobalXDomainRequest !== "undefined";
    xdr.workingXDR = xdr.supportsXDR ? xdr.GlobalXDomainRequest : false;

    function makeApi(sinon) {
        sinon.xdr = xdr;

        function FakeXDomainRequest() {
            this.readyState = FakeXDomainRequest.UNSENT;
            this.requestBody = null;
            this.requestHeaders = {};
            this.status = 0;
            this.timeout = null;

            if (typeof FakeXDomainRequest.onCreate === "function") {
                FakeXDomainRequest.onCreate(this);
            }
        }

        function verifyState(x) {
            if (x.readyState !== FakeXDomainRequest.OPENED) {
                throw new Error("INVALID_STATE_ERR");
            }

            if (x.sendFlag) {
                throw new Error("INVALID_STATE_ERR");
            }
        }

        function verifyRequestSent(x) {
            if (x.readyState === FakeXDomainRequest.UNSENT) {
                throw new Error("Request not sent");
            }
            if (x.readyState === FakeXDomainRequest.DONE) {
                throw new Error("Request done");
            }
        }

        function verifyResponseBodyType(body) {
            if (typeof body !== "string") {
                var error = new Error("Attempted to respond to fake XDomainRequest with " +
                                    body + ", which is not a string.");
                error.name = "InvalidBodyException";
                throw error;
            }
        }

        sinon.extend(FakeXDomainRequest.prototype, sinon.EventTarget, {
            open: function open(method, url) {
                this.method = method;
                this.url = url;

                this.responseText = null;
                this.sendFlag = false;

                this.readyStateChange(FakeXDomainRequest.OPENED);
            },

            readyStateChange: function readyStateChange(state) {
                this.readyState = state;
                var eventName = "";
                switch (this.readyState) {
                case FakeXDomainRequest.UNSENT:
                    break;
                case FakeXDomainRequest.OPENED:
                    break;
                case FakeXDomainRequest.LOADING:
                    if (this.sendFlag) {
                        //raise the progress event
                        eventName = "onprogress";
                    }
                    break;
                case FakeXDomainRequest.DONE:
                    if (this.isTimeout) {
                        eventName = "ontimeout";
                    } else if (this.errorFlag || (this.status < 200 || this.status > 299)) {
                        eventName = "onerror";
                    } else {
                        eventName = "onload";
                    }
                    break;
                }

                // raising event (if defined)
                if (eventName) {
                    if (typeof this[eventName] === "function") {
                        try {
                            this[eventName]();
                        } catch (e) {
                            sinon.logError("Fake XHR " + eventName + " handler", e);
                        }
                    }
                }
            },

            send: function send(data) {
                verifyState(this);

                if (!/^(get|head)$/i.test(this.method)) {
                    this.requestBody = data;
                }
                this.requestHeaders["Content-Type"] = "text/plain;charset=utf-8";

                this.errorFlag = false;
                this.sendFlag = true;
                this.readyStateChange(FakeXDomainRequest.OPENED);

                if (typeof this.onSend === "function") {
                    this.onSend(this);
                }
            },

            abort: function abort() {
                this.aborted = true;
                this.responseText = null;
                this.errorFlag = true;

                if (this.readyState > sinon.FakeXDomainRequest.UNSENT && this.sendFlag) {
                    this.readyStateChange(sinon.FakeXDomainRequest.DONE);
                    this.sendFlag = false;
                }
            },

            setResponseBody: function setResponseBody(body) {
                verifyRequestSent(this);
                verifyResponseBodyType(body);

                var chunkSize = this.chunkSize || 10;
                var index = 0;
                this.responseText = "";

                do {
                    this.readyStateChange(FakeXDomainRequest.LOADING);
                    this.responseText += body.substring(index, index + chunkSize);
                    index += chunkSize;
                } while (index < body.length);

                this.readyStateChange(FakeXDomainRequest.DONE);
            },

            respond: function respond(status, contentType, body) {
                // content-type ignored, since XDomainRequest does not carry this
                // we keep the same syntax for respond(...) as for FakeXMLHttpRequest to ease
                // test integration across browsers
                this.status = typeof status === "number" ? status : 200;
                this.setResponseBody(body || "");
            },

            simulatetimeout: function simulatetimeout() {
                this.status = 0;
                this.isTimeout = true;
                // Access to this should actually throw an error
                this.responseText = undefined;
                this.readyStateChange(FakeXDomainRequest.DONE);
            }
        });

        sinon.extend(FakeXDomainRequest, {
            UNSENT: 0,
            OPENED: 1,
            LOADING: 3,
            DONE: 4
        });

        sinon.useFakeXDomainRequest = function useFakeXDomainRequest() {
            sinon.FakeXDomainRequest.restore = function restore(keepOnCreate) {
                if (xdr.supportsXDR) {
                    global.XDomainRequest = xdr.GlobalXDomainRequest;
                }

                delete sinon.FakeXDomainRequest.restore;

                if (keepOnCreate !== true) {
                    delete sinon.FakeXDomainRequest.onCreate;
                }
            };
            if (xdr.supportsXDR) {
                global.XDomainRequest = sinon.FakeXDomainRequest;
            }
            return sinon.FakeXDomainRequest;
        };

        sinon.FakeXDomainRequest = FakeXDomainRequest;
    }

    var isNode = typeof module !== "undefined" && module.exports && typeof require === "function";
    var isAMD = typeof define === "function" && typeof define.amd === "object" && define.amd;

    function loadDependencies(require, exports, module) {
        var sinon = require("./core");
        require("../extend");
        require("./event");
        require("../log_error");
        makeApi(sinon);
        module.exports = sinon;
    }

    if (isAMD) {
        define(loadDependencies);
    } else if (isNode) {
        loadDependencies(require, module.exports, module);
    } else {
        makeApi(sinon); // eslint-disable-line no-undef
    }
})(typeof global !== "undefined" ? global : self);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../extend":90,"../log_error":92,"./core":102,"./event":103}],108:[function(require,module,exports){
(function (global){
/**
 * @depend core.js
 * @depend ../extend.js
 * @depend event.js
 * @depend ../log_error.js
 */
/**
 * Fake XMLHttpRequest object
 *
 * @author Christian Johansen (christian@cjohansen.no)
 * @license BSD
 *
 * Copyright (c) 2010-2013 Christian Johansen
 */
(function (sinonGlobal, global) {
    "use strict";

    function getWorkingXHR(globalScope) {
        var supportsXHR = typeof globalScope.XMLHttpRequest !== "undefined";
        if (supportsXHR) {
            return globalScope.XMLHttpRequest;
        }

        var supportsActiveX = typeof globalScope.ActiveXObject !== "undefined";
        if (supportsActiveX) {
            return function () {
                return new globalScope.ActiveXObject("MSXML2.XMLHTTP.3.0");
            };
        }

        return false;
    }

    var supportsProgress = typeof ProgressEvent !== "undefined";
    var supportsCustomEvent = typeof CustomEvent !== "undefined";
    var supportsFormData = typeof FormData !== "undefined";
    var supportsArrayBuffer = typeof ArrayBuffer !== "undefined";
    var supportsBlob = (function () {
        try {
            return !!new Blob();
        } catch (e) {
            return false;
        }
    })();
    var sinonXhr = { XMLHttpRequest: global.XMLHttpRequest };
    sinonXhr.GlobalXMLHttpRequest = global.XMLHttpRequest;
    sinonXhr.GlobalActiveXObject = global.ActiveXObject;
    sinonXhr.supportsActiveX = typeof sinonXhr.GlobalActiveXObject !== "undefined";
    sinonXhr.supportsXHR = typeof sinonXhr.GlobalXMLHttpRequest !== "undefined";
    sinonXhr.workingXHR = getWorkingXHR(global);
    sinonXhr.supportsCORS = sinonXhr.supportsXHR && "withCredentials" in (new sinonXhr.GlobalXMLHttpRequest());

    var unsafeHeaders = {
        "Accept-Charset": true,
        "Accept-Encoding": true,
        Connection: true,
        "Content-Length": true,
        Cookie: true,
        Cookie2: true,
        "Content-Transfer-Encoding": true,
        Date: true,
        Expect: true,
        Host: true,
        "Keep-Alive": true,
        Referer: true,
        TE: true,
        Trailer: true,
        "Transfer-Encoding": true,
        Upgrade: true,
        "User-Agent": true,
        Via: true
    };

    // An upload object is created for each
    // FakeXMLHttpRequest and allows upload
    // events to be simulated using uploadProgress
    // and uploadError.
    function UploadProgress() {
        this.eventListeners = {
            abort: [],
            error: [],
            load: [],
            loadend: [],
            progress: []
        };
    }

    UploadProgress.prototype.addEventListener = function addEventListener(event, listener) {
        this.eventListeners[event].push(listener);
    };

    UploadProgress.prototype.removeEventListener = function removeEventListener(event, listener) {
        var listeners = this.eventListeners[event] || [];

        for (var i = 0, l = listeners.length; i < l; ++i) {
            if (listeners[i] === listener) {
                return listeners.splice(i, 1);
            }
        }
    };

    UploadProgress.prototype.dispatchEvent = function dispatchEvent(event) {
        var listeners = this.eventListeners[event.type] || [];

        for (var i = 0, listener; (listener = listeners[i]) != null; i++) {
            listener(event);
        }
    };

    // Note that for FakeXMLHttpRequest to work pre ES5
    // we lose some of the alignment with the spec.
    // To ensure as close a match as possible,
    // set responseType before calling open, send or respond;
    function FakeXMLHttpRequest() {
        this.readyState = FakeXMLHttpRequest.UNSENT;
        this.requestHeaders = {};
        this.requestBody = null;
        this.status = 0;
        this.statusText = "";
        this.upload = new UploadProgress();
        this.responseType = "";
        this.response = "";
        if (sinonXhr.supportsCORS) {
            this.withCredentials = false;
        }

        var xhr = this;
        var events = ["loadstart", "load", "abort", "error", "loadend"];

        function addEventListener(eventName) {
            xhr.addEventListener(eventName, function (event) {
                var listener = xhr["on" + eventName];

                if (listener && typeof listener === "function") {
                    listener.call(this, event);
                }
            });
        }

        for (var i = events.length - 1; i >= 0; i--) {
            addEventListener(events[i]);
        }

        if (typeof FakeXMLHttpRequest.onCreate === "function") {
            FakeXMLHttpRequest.onCreate(this);
        }
    }

    function verifyState(xhr) {
        if (xhr.readyState !== FakeXMLHttpRequest.OPENED) {
            throw new Error("INVALID_STATE_ERR");
        }

        if (xhr.sendFlag) {
            throw new Error("INVALID_STATE_ERR");
        }
    }

    function getHeader(headers, header) {
        header = header.toLowerCase();

        for (var h in headers) {
            if (h.toLowerCase() === header) {
                return h;
            }
        }

        return null;
    }

    // filtering to enable a white-list version of Sinon FakeXhr,
    // where whitelisted requests are passed through to real XHR
    function each(collection, callback) {
        if (!collection) {
            return;
        }

        for (var i = 0, l = collection.length; i < l; i += 1) {
            callback(collection[i]);
        }
    }
    function some(collection, callback) {
        for (var index = 0; index < collection.length; index++) {
            if (callback(collection[index]) === true) {
                return true;
            }
        }
        return false;
    }
    // largest arity in XHR is 5 - XHR#open
    var apply = function (obj, method, args) {
        switch (args.length) {
        case 0: return obj[method]();
        case 1: return obj[method](args[0]);
        case 2: return obj[method](args[0], args[1]);
        case 3: return obj[method](args[0], args[1], args[2]);
        case 4: return obj[method](args[0], args[1], args[2], args[3]);
        case 5: return obj[method](args[0], args[1], args[2], args[3], args[4]);
        }
    };

    FakeXMLHttpRequest.filters = [];
    FakeXMLHttpRequest.addFilter = function addFilter(fn) {
        this.filters.push(fn);
    };
    var IE6Re = /MSIE 6/;
    FakeXMLHttpRequest.defake = function defake(fakeXhr, xhrArgs) {
        var xhr = new sinonXhr.workingXHR(); // eslint-disable-line new-cap

        each([
            "open",
            "setRequestHeader",
            "send",
            "abort",
            "getResponseHeader",
            "getAllResponseHeaders",
            "addEventListener",
            "overrideMimeType",
            "removeEventListener"
        ], function (method) {
            fakeXhr[method] = function () {
                return apply(xhr, method, arguments);
            };
        });

        var copyAttrs = function (args) {
            each(args, function (attr) {
                try {
                    fakeXhr[attr] = xhr[attr];
                } catch (e) {
                    if (!IE6Re.test(navigator.userAgent)) {
                        throw e;
                    }
                }
            });
        };

        var stateChange = function stateChange() {
            fakeXhr.readyState = xhr.readyState;
            if (xhr.readyState >= FakeXMLHttpRequest.HEADERS_RECEIVED) {
                copyAttrs(["status", "statusText"]);
            }
            if (xhr.readyState >= FakeXMLHttpRequest.LOADING) {
                copyAttrs(["responseText", "response"]);
            }
            if (xhr.readyState === FakeXMLHttpRequest.DONE) {
                copyAttrs(["responseXML"]);
            }
            if (fakeXhr.onreadystatechange) {
                fakeXhr.onreadystatechange.call(fakeXhr, { target: fakeXhr });
            }
        };

        if (xhr.addEventListener) {
            for (var event in fakeXhr.eventListeners) {
                if (fakeXhr.eventListeners.hasOwnProperty(event)) {

                    /*eslint-disable no-loop-func*/
                    each(fakeXhr.eventListeners[event], function (handler) {
                        xhr.addEventListener(event, handler);
                    });
                    /*eslint-enable no-loop-func*/
                }
            }
            xhr.addEventListener("readystatechange", stateChange);
        } else {
            xhr.onreadystatechange = stateChange;
        }
        apply(xhr, "open", xhrArgs);
    };
    FakeXMLHttpRequest.useFilters = false;

    function verifyRequestOpened(xhr) {
        if (xhr.readyState !== FakeXMLHttpRequest.OPENED) {
            throw new Error("INVALID_STATE_ERR - " + xhr.readyState);
        }
    }

    function verifyRequestSent(xhr) {
        if (xhr.readyState === FakeXMLHttpRequest.DONE) {
            throw new Error("Request done");
        }
    }

    function verifyHeadersReceived(xhr) {
        if (xhr.async && xhr.readyState !== FakeXMLHttpRequest.HEADERS_RECEIVED) {
            throw new Error("No headers received");
        }
    }

    function verifyResponseBodyType(body) {
        if (typeof body !== "string") {
            var error = new Error("Attempted to respond to fake XMLHttpRequest with " +
                                 body + ", which is not a string.");
            error.name = "InvalidBodyException";
            throw error;
        }
    }

    function convertToArrayBuffer(body) {
        var buffer = new ArrayBuffer(body.length);
        var view = new Uint8Array(buffer);
        for (var i = 0; i < body.length; i++) {
            var charCode = body.charCodeAt(i);
            if (charCode >= 256) {
                throw new TypeError("arraybuffer or blob responseTypes require binary string, " +
                                    "invalid character " + body[i] + " found.");
            }
            view[i] = charCode;
        }
        return buffer;
    }

    function isXmlContentType(contentType) {
        return !contentType || /(text\/xml)|(application\/xml)|(\+xml)/.test(contentType);
    }

    function convertResponseBody(responseType, contentType, body) {
        if (responseType === "" || responseType === "text") {
            return body;
        } else if (supportsArrayBuffer && responseType === "arraybuffer") {
            return convertToArrayBuffer(body);
        } else if (responseType === "json") {
            try {
                return JSON.parse(body);
            } catch (e) {
                // Return parsing failure as null
                return null;
            }
        } else if (supportsBlob && responseType === "blob") {
            var blobOptions = {};
            if (contentType) {
                blobOptions.type = contentType;
            }
            return new Blob([convertToArrayBuffer(body)], blobOptions);
        } else if (responseType === "document") {
            if (isXmlContentType(contentType)) {
                return FakeXMLHttpRequest.parseXML(body);
            }
            return null;
        }
        throw new Error("Invalid responseType " + responseType);
    }

    function clearResponse(xhr) {
        if (xhr.responseType === "" || xhr.responseType === "text") {
            xhr.response = xhr.responseText = "";
        } else {
            xhr.response = xhr.responseText = null;
        }
        xhr.responseXML = null;
    }

    FakeXMLHttpRequest.parseXML = function parseXML(text) {
        // Treat empty string as parsing failure
        if (text !== "") {
            try {
                if (typeof DOMParser !== "undefined") {
                    var parser = new DOMParser();
                    return parser.parseFromString(text, "text/xml");
                }
                var xmlDoc = new window.ActiveXObject("Microsoft.XMLDOM");
                xmlDoc.async = "false";
                xmlDoc.loadXML(text);
                return xmlDoc;
            } catch (e) {
                // Unable to parse XML - no biggie
            }
        }

        return null;
    };

    FakeXMLHttpRequest.statusCodes = {
        100: "Continue",
        101: "Switching Protocols",
        200: "OK",
        201: "Created",
        202: "Accepted",
        203: "Non-Authoritative Information",
        204: "No Content",
        205: "Reset Content",
        206: "Partial Content",
        207: "Multi-Status",
        300: "Multiple Choice",
        301: "Moved Permanently",
        302: "Found",
        303: "See Other",
        304: "Not Modified",
        305: "Use Proxy",
        307: "Temporary Redirect",
        400: "Bad Request",
        401: "Unauthorized",
        402: "Payment Required",
        403: "Forbidden",
        404: "Not Found",
        405: "Method Not Allowed",
        406: "Not Acceptable",
        407: "Proxy Authentication Required",
        408: "Request Timeout",
        409: "Conflict",
        410: "Gone",
        411: "Length Required",
        412: "Precondition Failed",
        413: "Request Entity Too Large",
        414: "Request-URI Too Long",
        415: "Unsupported Media Type",
        416: "Requested Range Not Satisfiable",
        417: "Expectation Failed",
        422: "Unprocessable Entity",
        500: "Internal Server Error",
        501: "Not Implemented",
        502: "Bad Gateway",
        503: "Service Unavailable",
        504: "Gateway Timeout",
        505: "HTTP Version Not Supported"
    };

    function makeApi(sinon) {
        sinon.xhr = sinonXhr;

        sinon.extend(FakeXMLHttpRequest.prototype, sinon.EventTarget, {
            async: true,

            open: function open(method, url, async, username, password) {
                this.method = method;
                this.url = url;
                this.async = typeof async === "boolean" ? async : true;
                this.username = username;
                this.password = password;
                clearResponse(this);
                this.requestHeaders = {};
                this.sendFlag = false;

                if (FakeXMLHttpRequest.useFilters === true) {
                    var xhrArgs = arguments;
                    var defake = some(FakeXMLHttpRequest.filters, function (filter) {
                        return filter.apply(this, xhrArgs);
                    });
                    if (defake) {
                        return FakeXMLHttpRequest.defake(this, arguments);
                    }
                }
                this.readyStateChange(FakeXMLHttpRequest.OPENED);
            },

            readyStateChange: function readyStateChange(state) {
                this.readyState = state;

                var readyStateChangeEvent = new sinon.Event("readystatechange", false, false, this);
                var event, progress;

                if (typeof this.onreadystatechange === "function") {
                    try {
                        this.onreadystatechange(readyStateChangeEvent);
                    } catch (e) {
                        sinon.logError("Fake XHR onreadystatechange handler", e);
                    }
                }

                if (this.readyState === FakeXMLHttpRequest.DONE) {
                    // ensure loaded and total are numbers
                    progress = {
                      loaded: this.progress || 0,
                      total: this.progress || 0
                    };

                    if (this.status === 0) {
                        event = this.aborted ? "abort" : "error";
                    }
                    else {
                        event = "load";
                    }

                    if (supportsProgress) {
                        this.upload.dispatchEvent(new sinon.ProgressEvent("progress", progress, this));
                        this.upload.dispatchEvent(new sinon.ProgressEvent(event, progress, this));
                        this.upload.dispatchEvent(new sinon.ProgressEvent("loadend", progress, this));
                    }

                    this.dispatchEvent(new sinon.ProgressEvent("progress", progress, this));
                    this.dispatchEvent(new sinon.ProgressEvent(event, progress, this));
                    this.dispatchEvent(new sinon.ProgressEvent("loadend", progress, this));
                }

                this.dispatchEvent(readyStateChangeEvent);
            },

            setRequestHeader: function setRequestHeader(header, value) {
                verifyState(this);

                if (unsafeHeaders[header] || /^(Sec-|Proxy-)/.test(header)) {
                    throw new Error("Refused to set unsafe header \"" + header + "\"");
                }

                if (this.requestHeaders[header]) {
                    this.requestHeaders[header] += "," + value;
                } else {
                    this.requestHeaders[header] = value;
                }
            },

            // Helps testing
            setResponseHeaders: function setResponseHeaders(headers) {
                verifyRequestOpened(this);
                this.responseHeaders = {};

                for (var header in headers) {
                    if (headers.hasOwnProperty(header)) {
                        this.responseHeaders[header] = headers[header];
                    }
                }

                if (this.async) {
                    this.readyStateChange(FakeXMLHttpRequest.HEADERS_RECEIVED);
                } else {
                    this.readyState = FakeXMLHttpRequest.HEADERS_RECEIVED;
                }
            },

            // Currently treats ALL data as a DOMString (i.e. no Document)
            send: function send(data) {
                verifyState(this);

                if (!/^(get|head)$/i.test(this.method)) {
                    var contentType = getHeader(this.requestHeaders, "Content-Type");
                    if (this.requestHeaders[contentType]) {
                        var value = this.requestHeaders[contentType].split(";");
                        this.requestHeaders[contentType] = value[0] + ";charset=utf-8";
                    } else if (supportsFormData && !(data instanceof FormData)) {
                        this.requestHeaders["Content-Type"] = "text/plain;charset=utf-8";
                    }

                    this.requestBody = data;
                }

                this.errorFlag = false;
                this.sendFlag = this.async;
                clearResponse(this);
                this.readyStateChange(FakeXMLHttpRequest.OPENED);

                if (typeof this.onSend === "function") {
                    this.onSend(this);
                }

                this.dispatchEvent(new sinon.Event("loadstart", false, false, this));
            },

            abort: function abort() {
                this.aborted = true;
                clearResponse(this);
                this.errorFlag = true;
                this.requestHeaders = {};
                this.responseHeaders = {};

                if (this.readyState > FakeXMLHttpRequest.UNSENT && this.sendFlag) {
                    this.readyStateChange(FakeXMLHttpRequest.DONE);
                    this.sendFlag = false;
                }

                this.readyState = FakeXMLHttpRequest.UNSENT;
            },

            error: function error() {
                clearResponse(this);
                this.errorFlag = true;
                this.requestHeaders = {};
                this.responseHeaders = {};

                this.readyStateChange(FakeXMLHttpRequest.DONE);
            },

            getResponseHeader: function getResponseHeader(header) {
                if (this.readyState < FakeXMLHttpRequest.HEADERS_RECEIVED) {
                    return null;
                }

                if (/^Set-Cookie2?$/i.test(header)) {
                    return null;
                }

                header = getHeader(this.responseHeaders, header);

                return this.responseHeaders[header] || null;
            },

            getAllResponseHeaders: function getAllResponseHeaders() {
                if (this.readyState < FakeXMLHttpRequest.HEADERS_RECEIVED) {
                    return "";
                }

                var headers = "";

                for (var header in this.responseHeaders) {
                    if (this.responseHeaders.hasOwnProperty(header) &&
                        !/^Set-Cookie2?$/i.test(header)) {
                        headers += header + ": " + this.responseHeaders[header] + "\r\n";
                    }
                }

                return headers;
            },

            setResponseBody: function setResponseBody(body) {
                verifyRequestSent(this);
                verifyHeadersReceived(this);
                verifyResponseBodyType(body);
                var contentType = this.getResponseHeader("Content-Type");

                var isTextResponse = this.responseType === "" || this.responseType === "text";
                clearResponse(this);
                if (this.async) {
                    var chunkSize = this.chunkSize || 10;
                    var index = 0;

                    do {
                        this.readyStateChange(FakeXMLHttpRequest.LOADING);

                        if (isTextResponse) {
                            this.responseText = this.response += body.substring(index, index + chunkSize);
                        }
                        index += chunkSize;
                    } while (index < body.length);
                }

                this.response = convertResponseBody(this.responseType, contentType, body);
                if (isTextResponse) {
                    this.responseText = this.response;
                }

                if (this.responseType === "document") {
                    this.responseXML = this.response;
                } else if (this.responseType === "" && isXmlContentType(contentType)) {
                    this.responseXML = FakeXMLHttpRequest.parseXML(this.responseText);
                }
                this.progress = body.length;
                this.readyStateChange(FakeXMLHttpRequest.DONE);
            },

            respond: function respond(status, headers, body) {
                this.status = typeof status === "number" ? status : 200;
                this.statusText = FakeXMLHttpRequest.statusCodes[this.status];
                this.setResponseHeaders(headers || {});
                this.setResponseBody(body || "");
            },

            uploadProgress: function uploadProgress(progressEventRaw) {
                if (supportsProgress) {
                    this.upload.dispatchEvent(new sinon.ProgressEvent("progress", progressEventRaw));
                }
            },

            downloadProgress: function downloadProgress(progressEventRaw) {
                if (supportsProgress) {
                    this.dispatchEvent(new sinon.ProgressEvent("progress", progressEventRaw));
                }
            },

            uploadError: function uploadError(error) {
                if (supportsCustomEvent) {
                    this.upload.dispatchEvent(new sinon.CustomEvent("error", {detail: error}));
                }
            }
        });

        sinon.extend(FakeXMLHttpRequest, {
            UNSENT: 0,
            OPENED: 1,
            HEADERS_RECEIVED: 2,
            LOADING: 3,
            DONE: 4
        });

        sinon.useFakeXMLHttpRequest = function () {
            FakeXMLHttpRequest.restore = function restore(keepOnCreate) {
                if (sinonXhr.supportsXHR) {
                    global.XMLHttpRequest = sinonXhr.GlobalXMLHttpRequest;
                }

                if (sinonXhr.supportsActiveX) {
                    global.ActiveXObject = sinonXhr.GlobalActiveXObject;
                }

                delete FakeXMLHttpRequest.restore;

                if (keepOnCreate !== true) {
                    delete FakeXMLHttpRequest.onCreate;
                }
            };
            if (sinonXhr.supportsXHR) {
                global.XMLHttpRequest = FakeXMLHttpRequest;
            }

            if (sinonXhr.supportsActiveX) {
                global.ActiveXObject = function ActiveXObject(objId) {
                    if (objId === "Microsoft.XMLHTTP" || /^Msxml2\.XMLHTTP/i.test(objId)) {

                        return new FakeXMLHttpRequest();
                    }

                    return new sinonXhr.GlobalActiveXObject(objId);
                };
            }

            return FakeXMLHttpRequest;
        };

        sinon.FakeXMLHttpRequest = FakeXMLHttpRequest;
    }

    var isNode = typeof module !== "undefined" && module.exports && typeof require === "function";
    var isAMD = typeof define === "function" && typeof define.amd === "object" && define.amd;

    function loadDependencies(require, exports, module) {
        var sinon = require("./core");
        require("../extend");
        require("./event");
        require("../log_error");
        makeApi(sinon);
        module.exports = sinon;
    }

    if (isAMD) {
        define(loadDependencies);
        return;
    }

    if (isNode) {
        loadDependencies(require, module.exports, module);
        return;
    }

    if (sinonGlobal) {
        makeApi(sinonGlobal);
    }
}(
    typeof sinon === "object" && sinon, // eslint-disable-line no-undef
    typeof global !== "undefined" ? global : self
));

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../extend":90,"../log_error":92,"./core":102,"./event":103}],109:[function(require,module,exports){
/**
 * @depend util/core.js
 */
(function (sinonGlobal) {
    "use strict";

    function makeApi(sinon) {
        function walkInternal(obj, iterator, context, originalObj, seen) {
            var proto, prop;

            if (typeof Object.getOwnPropertyNames !== "function") {
                // We explicitly want to enumerate through all of the prototype's properties
                // in this case, therefore we deliberately leave out an own property check.
                /* eslint-disable guard-for-in */
                for (prop in obj) {
                    iterator.call(context, obj[prop], prop, obj);
                }
                /* eslint-enable guard-for-in */

                return;
            }

            Object.getOwnPropertyNames(obj).forEach(function (k) {
                if (!seen[k]) {
                    seen[k] = true;
                    var target = typeof Object.getOwnPropertyDescriptor(obj, k).get === "function" ?
                        originalObj : obj;
                    iterator.call(context, target[k], k, target);
                }
            });

            proto = Object.getPrototypeOf(obj);
            if (proto) {
                walkInternal(proto, iterator, context, originalObj, seen);
            }
        }

        /* Public: walks the prototype chain of an object and iterates over every own property
         * name encountered. The iterator is called in the same fashion that Array.prototype.forEach
         * works, where it is passed the value, key, and own object as the 1st, 2nd, and 3rd positional
         * argument, respectively. In cases where Object.getOwnPropertyNames is not available, walk will
         * default to using a simple for..in loop.
         *
         * obj - The object to walk the prototype chain for.
         * iterator - The function to be called on each pass of the walk.
         * context - (Optional) When given, the iterator will be called with this object as the receiver.
         */
        function walk(obj, iterator, context) {
            return walkInternal(obj, iterator, context, obj, {});
        }

        sinon.walk = walk;
        return sinon.walk;
    }

    function loadDependencies(require, exports, module) {
        var sinon = require("./util/core");
        module.exports = makeApi(sinon);
    }

    var isNode = typeof module !== "undefined" && module.exports && typeof require === "function";
    var isAMD = typeof define === "function" && typeof define.amd === "object" && define.amd;

    if (isAMD) {
        define(loadDependencies);
        return;
    }

    if (isNode) {
        loadDependencies(require, module.exports, module);
        return;
    }

    if (sinonGlobal) {
        makeApi(sinonGlobal);
    }
}(
    typeof sinon === "object" && sinon // eslint-disable-line no-undef
));

},{"./util/core":102}],110:[function(require,module,exports){
arguments[4][35][0].apply(exports,arguments)
},{"./lib/type":111,"dup":35}],111:[function(require,module,exports){
/*!
 * type-detect
 * Copyright(c) 2013 jake luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * Primary Exports
 */

var exports = module.exports = getType;

/**
 * ### typeOf (obj)
 *
 * Use several different techniques to determine
 * the type of object being tested.
 *
 *
 * @param {Mixed} object
 * @return {String} object type
 * @api public
 */
var objectTypeRegexp = /^\[object (.*)\]$/;

function getType(obj) {
  var type = Object.prototype.toString.call(obj).match(objectTypeRegexp)[1].toLowerCase();
  // Let "new String('')" return 'object'
  if (typeof Promise === 'function' && obj instanceof Promise) return 'promise';
  // PhantomJS has type "DOMWindow" for null
  if (obj === null) return 'null';
  // PhantomJS has type "DOMWindow" for undefined
  if (obj === undefined) return 'undefined';
  return type;
}

exports.Library = Library;

/**
 * ### Library
 *
 * Create a repository for custom type detection.
 *
 * ```js
 * var lib = new type.Library;
 * ```
 *
 */

function Library() {
  if (!(this instanceof Library)) return new Library();
  this.tests = {};
}

/**
 * #### .of (obj)
 *
 * Expose replacement `typeof` detection to the library.
 *
 * ```js
 * if ('string' === lib.of('hello world')) {
 *   // ...
 * }
 * ```
 *
 * @param {Mixed} object to test
 * @return {String} type
 */

Library.prototype.of = getType;

/**
 * #### .define (type, test)
 *
 * Add a test to for the `.test()` assertion.
 *
 * Can be defined as a regular expression:
 *
 * ```js
 * lib.define('int', /^[0-9]+$/);
 * ```
 *
 * ... or as a function:
 *
 * ```js
 * lib.define('bln', function (obj) {
 *   if ('boolean' === lib.of(obj)) return true;
 *   var blns = [ 'yes', 'no', 'true', 'false', 1, 0 ];
 *   if ('string' === lib.of(obj)) obj = obj.toLowerCase();
 *   return !! ~blns.indexOf(obj);
 * });
 * ```
 *
 * @param {String} type
 * @param {RegExp|Function} test
 * @api public
 */

Library.prototype.define = function(type, test) {
  if (arguments.length === 1) return this.tests[type];
  this.tests[type] = test;
  return this;
};

/**
 * #### .test (obj, test)
 *
 * Assert that an object is of type. Will first
 * check natives, and if that does not pass it will
 * use the user defined custom tests.
 *
 * ```js
 * assert(lib.test('1', 'int'));
 * assert(lib.test('yes', 'bln'));
 * ```
 *
 * @param {Mixed} object
 * @param {String} type
 * @return {Boolean} result
 * @api public
 */

Library.prototype.test = function(obj, type) {
  if (type === getType(obj)) return true;
  var test = this.tests[type];

  if (test && 'regexp' === getType(test)) {
    return test.test(obj);
  } else if (test && 'function' === getType(test)) {
    return test(obj);
  } else {
    throw new ReferenceError('Type test "' + type + '" not defined or invalid.');
  }
};

},{}],112:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

var punycode = require('punycode');
var util = require('./util');

exports.parse = urlParse;
exports.resolve = urlResolve;
exports.resolveObject = urlResolveObject;
exports.format = urlFormat;

exports.Url = Url;

function Url() {
  this.protocol = null;
  this.slashes = null;
  this.auth = null;
  this.host = null;
  this.port = null;
  this.hostname = null;
  this.hash = null;
  this.search = null;
  this.query = null;
  this.pathname = null;
  this.path = null;
  this.href = null;
}

// Reference: RFC 3986, RFC 1808, RFC 2396

// define these here so at least they only have to be
// compiled once on the first module load.
var protocolPattern = /^([a-z0-9.+-]+:)/i,
    portPattern = /:[0-9]*$/,

    // Special case for a simple path URL
    simplePathPattern = /^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/,

    // RFC 2396: characters reserved for delimiting URLs.
    // We actually just auto-escape these.
    delims = ['<', '>', '"', '`', ' ', '\r', '\n', '\t'],

    // RFC 2396: characters not allowed for various reasons.
    unwise = ['{', '}', '|', '\\', '^', '`'].concat(delims),

    // Allowed by RFCs, but cause of XSS attacks.  Always escape these.
    autoEscape = ['\''].concat(unwise),
    // Characters that are never ever allowed in a hostname.
    // Note that any invalid chars are also handled, but these
    // are the ones that are *expected* to be seen, so we fast-path
    // them.
    nonHostChars = ['%', '/', '?', ';', '#'].concat(autoEscape),
    hostEndingChars = ['/', '?', '#'],
    hostnameMaxLen = 255,
    hostnamePartPattern = /^[+a-z0-9A-Z_-]{0,63}$/,
    hostnamePartStart = /^([+a-z0-9A-Z_-]{0,63})(.*)$/,
    // protocols that can allow "unsafe" and "unwise" chars.
    unsafeProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that never have a hostname.
    hostlessProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that always contain a // bit.
    slashedProtocol = {
      'http': true,
      'https': true,
      'ftp': true,
      'gopher': true,
      'file': true,
      'http:': true,
      'https:': true,
      'ftp:': true,
      'gopher:': true,
      'file:': true
    },
    querystring = require('querystring');

function urlParse(url, parseQueryString, slashesDenoteHost) {
  if (url && util.isObject(url) && url instanceof Url) return url;

  var u = new Url;
  u.parse(url, parseQueryString, slashesDenoteHost);
  return u;
}

Url.prototype.parse = function(url, parseQueryString, slashesDenoteHost) {
  if (!util.isString(url)) {
    throw new TypeError("Parameter 'url' must be a string, not " + typeof url);
  }

  // Copy chrome, IE, opera backslash-handling behavior.
  // Back slashes before the query string get converted to forward slashes
  // See: https://code.google.com/p/chromium/issues/detail?id=25916
  var queryIndex = url.indexOf('?'),
      splitter =
          (queryIndex !== -1 && queryIndex < url.indexOf('#')) ? '?' : '#',
      uSplit = url.split(splitter),
      slashRegex = /\\/g;
  uSplit[0] = uSplit[0].replace(slashRegex, '/');
  url = uSplit.join(splitter);

  var rest = url;

  // trim before proceeding.
  // This is to support parse stuff like "  http://foo.com  \n"
  rest = rest.trim();

  if (!slashesDenoteHost && url.split('#').length === 1) {
    // Try fast path regexp
    var simplePath = simplePathPattern.exec(rest);
    if (simplePath) {
      this.path = rest;
      this.href = rest;
      this.pathname = simplePath[1];
      if (simplePath[2]) {
        this.search = simplePath[2];
        if (parseQueryString) {
          this.query = querystring.parse(this.search.substr(1));
        } else {
          this.query = this.search.substr(1);
        }
      } else if (parseQueryString) {
        this.search = '';
        this.query = {};
      }
      return this;
    }
  }

  var proto = protocolPattern.exec(rest);
  if (proto) {
    proto = proto[0];
    var lowerProto = proto.toLowerCase();
    this.protocol = lowerProto;
    rest = rest.substr(proto.length);
  }

  // figure out if it's got a host
  // user@server is *always* interpreted as a hostname, and url
  // resolution will treat //foo/bar as host=foo,path=bar because that's
  // how the browser resolves relative URLs.
  if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
    var slashes = rest.substr(0, 2) === '//';
    if (slashes && !(proto && hostlessProtocol[proto])) {
      rest = rest.substr(2);
      this.slashes = true;
    }
  }

  if (!hostlessProtocol[proto] &&
      (slashes || (proto && !slashedProtocol[proto]))) {

    // there's a hostname.
    // the first instance of /, ?, ;, or # ends the host.
    //
    // If there is an @ in the hostname, then non-host chars *are* allowed
    // to the left of the last @ sign, unless some host-ending character
    // comes *before* the @-sign.
    // URLs are obnoxious.
    //
    // ex:
    // http://a@b@c/ => user:a@b host:c
    // http://a@b?@c => user:a host:c path:/?@c

    // v0.12 TODO(isaacs): This is not quite how Chrome does things.
    // Review our test case against browsers more comprehensively.

    // find the first instance of any hostEndingChars
    var hostEnd = -1;
    for (var i = 0; i < hostEndingChars.length; i++) {
      var hec = rest.indexOf(hostEndingChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
        hostEnd = hec;
    }

    // at this point, either we have an explicit point where the
    // auth portion cannot go past, or the last @ char is the decider.
    var auth, atSign;
    if (hostEnd === -1) {
      // atSign can be anywhere.
      atSign = rest.lastIndexOf('@');
    } else {
      // atSign must be in auth portion.
      // http://a@b/c@d => host:b auth:a path:/c@d
      atSign = rest.lastIndexOf('@', hostEnd);
    }

    // Now we have a portion which is definitely the auth.
    // Pull that off.
    if (atSign !== -1) {
      auth = rest.slice(0, atSign);
      rest = rest.slice(atSign + 1);
      this.auth = decodeURIComponent(auth);
    }

    // the host is the remaining to the left of the first non-host char
    hostEnd = -1;
    for (var i = 0; i < nonHostChars.length; i++) {
      var hec = rest.indexOf(nonHostChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
        hostEnd = hec;
    }
    // if we still have not hit it, then the entire thing is a host.
    if (hostEnd === -1)
      hostEnd = rest.length;

    this.host = rest.slice(0, hostEnd);
    rest = rest.slice(hostEnd);

    // pull out port.
    this.parseHost();

    // we've indicated that there is a hostname,
    // so even if it's empty, it has to be present.
    this.hostname = this.hostname || '';

    // if hostname begins with [ and ends with ]
    // assume that it's an IPv6 address.
    var ipv6Hostname = this.hostname[0] === '[' &&
        this.hostname[this.hostname.length - 1] === ']';

    // validate a little.
    if (!ipv6Hostname) {
      var hostparts = this.hostname.split(/\./);
      for (var i = 0, l = hostparts.length; i < l; i++) {
        var part = hostparts[i];
        if (!part) continue;
        if (!part.match(hostnamePartPattern)) {
          var newpart = '';
          for (var j = 0, k = part.length; j < k; j++) {
            if (part.charCodeAt(j) > 127) {
              // we replace non-ASCII char with a temporary placeholder
              // we need this to make sure size of hostname is not
              // broken by replacing non-ASCII by nothing
              newpart += 'x';
            } else {
              newpart += part[j];
            }
          }
          // we test again with ASCII char only
          if (!newpart.match(hostnamePartPattern)) {
            var validParts = hostparts.slice(0, i);
            var notHost = hostparts.slice(i + 1);
            var bit = part.match(hostnamePartStart);
            if (bit) {
              validParts.push(bit[1]);
              notHost.unshift(bit[2]);
            }
            if (notHost.length) {
              rest = '/' + notHost.join('.') + rest;
            }
            this.hostname = validParts.join('.');
            break;
          }
        }
      }
    }

    if (this.hostname.length > hostnameMaxLen) {
      this.hostname = '';
    } else {
      // hostnames are always lower case.
      this.hostname = this.hostname.toLowerCase();
    }

    if (!ipv6Hostname) {
      // IDNA Support: Returns a punycoded representation of "domain".
      // It only converts parts of the domain name that
      // have non-ASCII characters, i.e. it doesn't matter if
      // you call it with a domain that already is ASCII-only.
      this.hostname = punycode.toASCII(this.hostname);
    }

    var p = this.port ? ':' + this.port : '';
    var h = this.hostname || '';
    this.host = h + p;
    this.href += this.host;

    // strip [ and ] from the hostname
    // the host field still retains them, though
    if (ipv6Hostname) {
      this.hostname = this.hostname.substr(1, this.hostname.length - 2);
      if (rest[0] !== '/') {
        rest = '/' + rest;
      }
    }
  }

  // now rest is set to the post-host stuff.
  // chop off any delim chars.
  if (!unsafeProtocol[lowerProto]) {

    // First, make 100% sure that any "autoEscape" chars get
    // escaped, even if encodeURIComponent doesn't think they
    // need to be.
    for (var i = 0, l = autoEscape.length; i < l; i++) {
      var ae = autoEscape[i];
      if (rest.indexOf(ae) === -1)
        continue;
      var esc = encodeURIComponent(ae);
      if (esc === ae) {
        esc = escape(ae);
      }
      rest = rest.split(ae).join(esc);
    }
  }


  // chop off from the tail first.
  var hash = rest.indexOf('#');
  if (hash !== -1) {
    // got a fragment string.
    this.hash = rest.substr(hash);
    rest = rest.slice(0, hash);
  }
  var qm = rest.indexOf('?');
  if (qm !== -1) {
    this.search = rest.substr(qm);
    this.query = rest.substr(qm + 1);
    if (parseQueryString) {
      this.query = querystring.parse(this.query);
    }
    rest = rest.slice(0, qm);
  } else if (parseQueryString) {
    // no query string, but parseQueryString still requested
    this.search = '';
    this.query = {};
  }
  if (rest) this.pathname = rest;
  if (slashedProtocol[lowerProto] &&
      this.hostname && !this.pathname) {
    this.pathname = '/';
  }

  //to support http.request
  if (this.pathname || this.search) {
    var p = this.pathname || '';
    var s = this.search || '';
    this.path = p + s;
  }

  // finally, reconstruct the href based on what has been validated.
  this.href = this.format();
  return this;
};

// format a parsed object into a url string
function urlFormat(obj) {
  // ensure it's an object, and not a string url.
  // If it's an obj, this is a no-op.
  // this way, you can call url_format() on strings
  // to clean up potentially wonky urls.
  if (util.isString(obj)) obj = urlParse(obj);
  if (!(obj instanceof Url)) return Url.prototype.format.call(obj);
  return obj.format();
}

Url.prototype.format = function() {
  var auth = this.auth || '';
  if (auth) {
    auth = encodeURIComponent(auth);
    auth = auth.replace(/%3A/i, ':');
    auth += '@';
  }

  var protocol = this.protocol || '',
      pathname = this.pathname || '',
      hash = this.hash || '',
      host = false,
      query = '';

  if (this.host) {
    host = auth + this.host;
  } else if (this.hostname) {
    host = auth + (this.hostname.indexOf(':') === -1 ?
        this.hostname :
        '[' + this.hostname + ']');
    if (this.port) {
      host += ':' + this.port;
    }
  }

  if (this.query &&
      util.isObject(this.query) &&
      Object.keys(this.query).length) {
    query = querystring.stringify(this.query);
  }

  var search = this.search || (query && ('?' + query)) || '';

  if (protocol && protocol.substr(-1) !== ':') protocol += ':';

  // only the slashedProtocols get the //.  Not mailto:, xmpp:, etc.
  // unless they had them to begin with.
  if (this.slashes ||
      (!protocol || slashedProtocol[protocol]) && host !== false) {
    host = '//' + (host || '');
    if (pathname && pathname.charAt(0) !== '/') pathname = '/' + pathname;
  } else if (!host) {
    host = '';
  }

  if (hash && hash.charAt(0) !== '#') hash = '#' + hash;
  if (search && search.charAt(0) !== '?') search = '?' + search;

  pathname = pathname.replace(/[?#]/g, function(match) {
    return encodeURIComponent(match);
  });
  search = search.replace('#', '%23');

  return protocol + host + pathname + search + hash;
};

function urlResolve(source, relative) {
  return urlParse(source, false, true).resolve(relative);
}

Url.prototype.resolve = function(relative) {
  return this.resolveObject(urlParse(relative, false, true)).format();
};

function urlResolveObject(source, relative) {
  if (!source) return relative;
  return urlParse(source, false, true).resolveObject(relative);
}

Url.prototype.resolveObject = function(relative) {
  if (util.isString(relative)) {
    var rel = new Url();
    rel.parse(relative, false, true);
    relative = rel;
  }

  var result = new Url();
  var tkeys = Object.keys(this);
  for (var tk = 0; tk < tkeys.length; tk++) {
    var tkey = tkeys[tk];
    result[tkey] = this[tkey];
  }

  // hash is always overridden, no matter what.
  // even href="" will remove it.
  result.hash = relative.hash;

  // if the relative url is empty, then there's nothing left to do here.
  if (relative.href === '') {
    result.href = result.format();
    return result;
  }

  // hrefs like //foo/bar always cut to the protocol.
  if (relative.slashes && !relative.protocol) {
    // take everything except the protocol from relative
    var rkeys = Object.keys(relative);
    for (var rk = 0; rk < rkeys.length; rk++) {
      var rkey = rkeys[rk];
      if (rkey !== 'protocol')
        result[rkey] = relative[rkey];
    }

    //urlParse appends trailing / to urls like http://www.example.com
    if (slashedProtocol[result.protocol] &&
        result.hostname && !result.pathname) {
      result.path = result.pathname = '/';
    }

    result.href = result.format();
    return result;
  }

  if (relative.protocol && relative.protocol !== result.protocol) {
    // if it's a known url protocol, then changing
    // the protocol does weird things
    // first, if it's not file:, then we MUST have a host,
    // and if there was a path
    // to begin with, then we MUST have a path.
    // if it is file:, then the host is dropped,
    // because that's known to be hostless.
    // anything else is assumed to be absolute.
    if (!slashedProtocol[relative.protocol]) {
      var keys = Object.keys(relative);
      for (var v = 0; v < keys.length; v++) {
        var k = keys[v];
        result[k] = relative[k];
      }
      result.href = result.format();
      return result;
    }

    result.protocol = relative.protocol;
    if (!relative.host && !hostlessProtocol[relative.protocol]) {
      var relPath = (relative.pathname || '').split('/');
      while (relPath.length && !(relative.host = relPath.shift()));
      if (!relative.host) relative.host = '';
      if (!relative.hostname) relative.hostname = '';
      if (relPath[0] !== '') relPath.unshift('');
      if (relPath.length < 2) relPath.unshift('');
      result.pathname = relPath.join('/');
    } else {
      result.pathname = relative.pathname;
    }
    result.search = relative.search;
    result.query = relative.query;
    result.host = relative.host || '';
    result.auth = relative.auth;
    result.hostname = relative.hostname || relative.host;
    result.port = relative.port;
    // to support http.request
    if (result.pathname || result.search) {
      var p = result.pathname || '';
      var s = result.search || '';
      result.path = p + s;
    }
    result.slashes = result.slashes || relative.slashes;
    result.href = result.format();
    return result;
  }

  var isSourceAbs = (result.pathname && result.pathname.charAt(0) === '/'),
      isRelAbs = (
          relative.host ||
          relative.pathname && relative.pathname.charAt(0) === '/'
      ),
      mustEndAbs = (isRelAbs || isSourceAbs ||
                    (result.host && relative.pathname)),
      removeAllDots = mustEndAbs,
      srcPath = result.pathname && result.pathname.split('/') || [],
      relPath = relative.pathname && relative.pathname.split('/') || [],
      psychotic = result.protocol && !slashedProtocol[result.protocol];

  // if the url is a non-slashed url, then relative
  // links like ../.. should be able
  // to crawl up to the hostname, as well.  This is strange.
  // result.protocol has already been set by now.
  // Later on, put the first path part into the host field.
  if (psychotic) {
    result.hostname = '';
    result.port = null;
    if (result.host) {
      if (srcPath[0] === '') srcPath[0] = result.host;
      else srcPath.unshift(result.host);
    }
    result.host = '';
    if (relative.protocol) {
      relative.hostname = null;
      relative.port = null;
      if (relative.host) {
        if (relPath[0] === '') relPath[0] = relative.host;
        else relPath.unshift(relative.host);
      }
      relative.host = null;
    }
    mustEndAbs = mustEndAbs && (relPath[0] === '' || srcPath[0] === '');
  }

  if (isRelAbs) {
    // it's absolute.
    result.host = (relative.host || relative.host === '') ?
                  relative.host : result.host;
    result.hostname = (relative.hostname || relative.hostname === '') ?
                      relative.hostname : result.hostname;
    result.search = relative.search;
    result.query = relative.query;
    srcPath = relPath;
    // fall through to the dot-handling below.
  } else if (relPath.length) {
    // it's relative
    // throw away the existing file, and take the new path instead.
    if (!srcPath) srcPath = [];
    srcPath.pop();
    srcPath = srcPath.concat(relPath);
    result.search = relative.search;
    result.query = relative.query;
  } else if (!util.isNullOrUndefined(relative.search)) {
    // just pull out the search.
    // like href='?foo'.
    // Put this after the other two cases because it simplifies the booleans
    if (psychotic) {
      result.hostname = result.host = srcPath.shift();
      //occationaly the auth can get stuck only in host
      //this especially happens in cases like
      //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
      var authInHost = result.host && result.host.indexOf('@') > 0 ?
                       result.host.split('@') : false;
      if (authInHost) {
        result.auth = authInHost.shift();
        result.host = result.hostname = authInHost.shift();
      }
    }
    result.search = relative.search;
    result.query = relative.query;
    //to support http.request
    if (!util.isNull(result.pathname) || !util.isNull(result.search)) {
      result.path = (result.pathname ? result.pathname : '') +
                    (result.search ? result.search : '');
    }
    result.href = result.format();
    return result;
  }

  if (!srcPath.length) {
    // no path at all.  easy.
    // we've already handled the other stuff above.
    result.pathname = null;
    //to support http.request
    if (result.search) {
      result.path = '/' + result.search;
    } else {
      result.path = null;
    }
    result.href = result.format();
    return result;
  }

  // if a url ENDs in . or .., then it must get a trailing slash.
  // however, if it ends in anything else non-slashy,
  // then it must NOT get a trailing slash.
  var last = srcPath.slice(-1)[0];
  var hasTrailingSlash = (
      (result.host || relative.host || srcPath.length > 1) &&
      (last === '.' || last === '..') || last === '');

  // strip single dots, resolve double dots to parent dir
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = srcPath.length; i >= 0; i--) {
    last = srcPath[i];
    if (last === '.') {
      srcPath.splice(i, 1);
    } else if (last === '..') {
      srcPath.splice(i, 1);
      up++;
    } else if (up) {
      srcPath.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (!mustEndAbs && !removeAllDots) {
    for (; up--; up) {
      srcPath.unshift('..');
    }
  }

  if (mustEndAbs && srcPath[0] !== '' &&
      (!srcPath[0] || srcPath[0].charAt(0) !== '/')) {
    srcPath.unshift('');
  }

  if (hasTrailingSlash && (srcPath.join('/').substr(-1) !== '/')) {
    srcPath.push('');
  }

  var isAbsolute = srcPath[0] === '' ||
      (srcPath[0] && srcPath[0].charAt(0) === '/');

  // put the host back
  if (psychotic) {
    result.hostname = result.host = isAbsolute ? '' :
                                    srcPath.length ? srcPath.shift() : '';
    //occationaly the auth can get stuck only in host
    //this especially happens in cases like
    //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
    var authInHost = result.host && result.host.indexOf('@') > 0 ?
                     result.host.split('@') : false;
    if (authInHost) {
      result.auth = authInHost.shift();
      result.host = result.hostname = authInHost.shift();
    }
  }

  mustEndAbs = mustEndAbs || (result.host && srcPath.length);

  if (mustEndAbs && !isAbsolute) {
    srcPath.unshift('');
  }

  if (!srcPath.length) {
    result.pathname = null;
    result.path = null;
  } else {
    result.pathname = srcPath.join('/');
  }

  //to support request.http
  if (!util.isNull(result.pathname) || !util.isNull(result.search)) {
    result.path = (result.pathname ? result.pathname : '') +
                  (result.search ? result.search : '');
  }
  result.auth = relative.auth || result.auth;
  result.slashes = result.slashes || relative.slashes;
  result.href = result.format();
  return result;
};

Url.prototype.parseHost = function() {
  var host = this.host;
  var port = portPattern.exec(host);
  if (port) {
    port = port[0];
    if (port !== ':') {
      this.port = port.substr(1);
    }
    host = host.substr(0, host.length - port.length);
  }
  if (host) this.hostname = host;
};

},{"./util":113,"punycode":49,"querystring":52}],113:[function(require,module,exports){
'use strict';

module.exports = {
  isString: function(arg) {
    return typeof(arg) === 'string';
  },
  isObject: function(arg) {
    return typeof(arg) === 'object' && arg !== null;
  },
  isNull: function(arg) {
    return arg === null;
  },
  isNullOrUndefined: function(arg) {
    return arg == null;
  }
};

},{}],114:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],115:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":114,"_process":48,"inherits":44}],116:[function(require,module,exports){
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  global.FakeXMLHttpRequest = factory()
}(this, function () { 'use strict';

  /**
   * Minimal Event interface implementation
   *
   * Original implementation by Sven Fuchs: https://gist.github.com/995028
   * Modifications and tests by Christian Johansen.
   *
   * @author Sven Fuchs (svenfuchs@artweb-design.de)
   * @author Christian Johansen (christian@cjohansen.no)
   * @license BSD
   *
   * Copyright (c) 2011 Sven Fuchs, Christian Johansen
   */

  var normRequestHeaders = {
    'accept': 'Accept',
    'accept-charset': 'Accept-Charset',
    'accept-encoding': 'Accept-Encoding',
    'accept-language': 'Accept-Language',
    'accept-datetime': 'Accept-Datetime',
    'authorization': 'Authorization',
    'cache-control': 'Cache-Control',
    'connection': 'Connection',
    'cookie': 'Cookie',
    'content-length': 'Content-Length',
    'content-md5': 'Content-MD5',
    'content-type': 'Content-Type',
    'date': 'Date',
    'expect': 'Expect',
    'from': 'From',
    'host': 'Host',
    'if-match': 'If-Match',
    'if-modified-since': 'If-Modified-Since',
    'if-none-match': 'If-None-Match',
    'if-range': 'If-Range',
    'if-unmodified-since': 'If-Unmodified-Since',
    'max-forwards': 'Max-Forwards',
    'pragma': 'Pragma',
    'proxy-authorization': 'Proxy-Authorization',
    'range': 'Range',
    'referer': 'Referer',
    'te': 'TE',
    'upgrade': 'Upgrade',
    'user-agent': 'User-Agent',
    'via': 'Via',
    'warning': 'Warning',
    'x-requested-with': 'X-Requested-With',
    'x-do-not-track': 'X-Do-Not-Track',
    'x-forwarded-for': 'X-Forwarded-For',
    'x-att-deviceid': 'X-ATT-DeviceId',
    'x-wap-profile': 'X-Wap-Profile'
  };

  function getNormRequestHeader(name) {
    return normRequestHeaders[name.toLowerCase()] || name;
  }

  var _Event = function Event(type, bubbles, cancelable, target) {
    this.type = type;
    this.bubbles = bubbles;
    this.cancelable = cancelable;
    this.target = target;
  };

  _Event.prototype = {
    stopPropagation: function () {},
    preventDefault: function () {
      this.defaultPrevented = true;
    }
  };

  /*
    Used to set the statusText property of an xhr object
  */
  var httpStatusCodes = {
    100: "Continue",
    101: "Switching Protocols",
    200: "OK",
    201: "Created",
    202: "Accepted",
    203: "Non-Authoritative Information",
    204: "No Content",
    205: "Reset Content",
    206: "Partial Content",
    300: "Multiple Choice",
    301: "Moved Permanently",
    302: "Found",
    303: "See Other",
    304: "Not Modified",
    305: "Use Proxy",
    307: "Temporary Redirect",
    400: "Bad Request",
    401: "Unauthorized",
    402: "Payment Required",
    403: "Forbidden",
    404: "Not Found",
    405: "Method Not Allowed",
    406: "Not Acceptable",
    407: "Proxy Authentication Required",
    408: "Request Timeout",
    409: "Conflict",
    410: "Gone",
    411: "Length Required",
    412: "Precondition Failed",
    413: "Request Entity Too Large",
    414: "Request-URI Too Long",
    415: "Unsupported Media Type",
    416: "Requested Range Not Satisfiable",
    417: "Expectation Failed",
    422: "Unprocessable Entity",
    500: "Internal Server Error",
    501: "Not Implemented",
    502: "Bad Gateway",
    503: "Service Unavailable",
    504: "Gateway Timeout",
    505: "HTTP Version Not Supported"
  };


  /*
    Cross-browser XML parsing. Used to turn
    XML responses into Document objects
    Borrowed from JSpec
  */
  function parseXML(text) {
    var xmlDoc;

    if (typeof DOMParser != "undefined") {
      var parser = new DOMParser();
      xmlDoc = parser.parseFromString(text, "text/xml");
    } else {
      xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
      xmlDoc.async = "false";
      xmlDoc.loadXML(text);
    }

    return xmlDoc;
  }

  /*
    Without mocking, the native XMLHttpRequest object will throw
    an error when attempting to set these headers. We match this behavior.
  */
  var unsafeHeaders = {
    "Accept-Charset": true,
    "Accept-Encoding": true,
    "Connection": true,
    "Content-Length": true,
    "Cookie": true,
    "Cookie2": true,
    "Content-Transfer-Encoding": true,
    "Date": true,
    "Expect": true,
    "Host": true,
    "Keep-Alive": true,
    "Referer": true,
    "TE": true,
    "Trailer": true,
    "Transfer-Encoding": true,
    "Upgrade": true,
    "User-Agent": true,
    "Via": true
  };

  /*
    Adds an "event" onto the fake xhr object
    that just calls the same-named method. This is
    in case a library adds callbacks for these events.
  */
  function _addEventListener(eventName, xhr){
    xhr.addEventListener(eventName, function (event) {
      var listener = xhr["on" + eventName];

      if (listener && typeof listener == "function") {
        listener(event);
      }
    });
  }

  function EventedObject() {
    this._eventListeners = {};
    var events = ["loadstart", "progress", "load", "abort", "loadend"];
    for (var i = events.length - 1; i >= 0; i--) {
      _addEventListener(events[i], this);
    }
  };

  EventedObject.prototype = {
    /*
      Duplicates the behavior of native XMLHttpRequest's addEventListener function
    */
    addEventListener: function addEventListener(event, listener) {
      this._eventListeners[event] = this._eventListeners[event] || [];
      this._eventListeners[event].push(listener);
    },

    /*
      Duplicates the behavior of native XMLHttpRequest's removeEventListener function
    */
    removeEventListener: function removeEventListener(event, listener) {
      var listeners = this._eventListeners[event] || [];

      for (var i = 0, l = listeners.length; i < l; ++i) {
        if (listeners[i] == listener) {
          return listeners.splice(i, 1);
        }
      }
    },

    /*
      Duplicates the behavior of native XMLHttpRequest's dispatchEvent function
    */
    dispatchEvent: function dispatchEvent(event) {
      var type = event.type;
      var listeners = this._eventListeners[type] || [];

      for (var i = 0; i < listeners.length; i++) {
        if (typeof listeners[i] == "function") {
          listeners[i].call(this, event);
        } else {
          listeners[i].handleEvent(event);
        }
      }

      return !!event.defaultPrevented;
    },

    /*
      Triggers an `onprogress` event with the given parameters.
    */
    _progress: function _progress(lengthComputable, loaded, total) {
      var event = new _Event('progress');
      event.target = this;
      event.lengthComputable = lengthComputable;
      event.loaded = loaded;
      event.total = total;
      this.dispatchEvent(event);
    }
  }

  /*
    Constructor for a fake window.XMLHttpRequest
  */
  function FakeXMLHttpRequest() {
    EventedObject.call(this);
    this.readyState = FakeXMLHttpRequest.UNSENT;
    this.requestHeaders = {};
    this.requestBody = null;
    this.status = 0;
    this.statusText = "";
    this.upload = new EventedObject();
  }

  FakeXMLHttpRequest.prototype = new EventedObject();

  // These status codes are available on the native XMLHttpRequest
  // object, so we match that here in case a library is relying on them.
  FakeXMLHttpRequest.UNSENT = 0;
  FakeXMLHttpRequest.OPENED = 1;
  FakeXMLHttpRequest.HEADERS_RECEIVED = 2;
  FakeXMLHttpRequest.LOADING = 3;
  FakeXMLHttpRequest.DONE = 4;

  var FakeXMLHttpRequestProto = {
    UNSENT: 0,
    OPENED: 1,
    HEADERS_RECEIVED: 2,
    LOADING: 3,
    DONE: 4,
    async: true,
    withCredentials: false,

    /*
      Duplicates the behavior of native XMLHttpRequest's open function
    */
    open: function open(method, url, async, username, password) {
      this.method = method;
      this.url = url;
      this.async = typeof async == "boolean" ? async : true;
      this.username = username;
      this.password = password;
      this.responseText = null;
      this.responseXML = null;
      this.requestHeaders = {};
      this.sendFlag = false;
      this._readyStateChange(FakeXMLHttpRequest.OPENED);
    },

    /*
      Duplicates the behavior of native XMLHttpRequest's setRequestHeader function
    */
    setRequestHeader: function setRequestHeader(header, value) {
      verifyState(this);
      header = getNormRequestHeader(header);

      if (unsafeHeaders[header] || /^(Sec-|Proxy-)/.test(header)) {
        throw new Error("Refused to set unsafe header \"" + header + "\"");
      }

      if (this.requestHeaders[header]) {
        this.requestHeaders[header] += "," + value;
      } else {
        this.requestHeaders[header] = value;
      }
    },

    /*
      Duplicates the behavior of native XMLHttpRequest's send function
    */
    send: function send(data) {
      verifyState(this);

      if (!/^(get|head)$/i.test(this.method)) {
        if (!this.requestHeaders["Content-Type"] && !(data || '').toString().match('FormData')) {
          this.requestHeaders["Content-Type"] = "text/plain;charset=UTF-8";
        }

        this.requestBody = data;
      }

      this.errorFlag = false;
      this.sendFlag = this.async;
      this._readyStateChange(FakeXMLHttpRequest.OPENED);

      if (typeof this.onSend == "function") {
        this.onSend(this);
      }

      this.dispatchEvent(new _Event("loadstart", false, false, this));
    },

    /*
      Duplicates the behavior of native XMLHttpRequest's abort function
    */
    abort: function abort() {
      this.aborted = true;
      this.responseText = null;
      this.errorFlag = true;
      this.requestHeaders = {};

      if (this.readyState > FakeXMLHttpRequest.UNSENT && this.sendFlag) {
        this._readyStateChange(FakeXMLHttpRequest.DONE);
        this.sendFlag = false;
      }

      this.readyState = FakeXMLHttpRequest.UNSENT;

      this.dispatchEvent(new _Event("abort", false, false, this));
      if (typeof this.onerror === "function") {
          this.onerror();
      }
    },

    /*
      Duplicates the behavior of native XMLHttpRequest's getResponseHeader function
    */
    getResponseHeader: function getResponseHeader(header) {
      if (this.readyState < FakeXMLHttpRequest.HEADERS_RECEIVED) {
        return null;
      }

      if (/^Set-Cookie2?$/i.test(header)) {
        return null;
      }

      header = header.toLowerCase();

      for (var h in this.responseHeaders) {
        if (h.toLowerCase() == header) {
          return this.responseHeaders[h];
        }
      }

      return null;
    },

    /*
      Duplicates the behavior of native XMLHttpRequest's getAllResponseHeaders function
    */
    getAllResponseHeaders: function getAllResponseHeaders() {
      if (this.readyState < FakeXMLHttpRequest.HEADERS_RECEIVED) {
        return "";
      }

      var headers = "";

      for (var header in this.responseHeaders) {
        if (this.responseHeaders.hasOwnProperty(header) && !/^Set-Cookie2?$/i.test(header)) {
          headers += header + ": " + this.responseHeaders[header] + "\r\n";
        }
      }

      return headers;
    },

    /*
     Duplicates the behavior of native XMLHttpRequest's overrideMimeType function
     */
    overrideMimeType: function overrideMimeType(mimeType) {
      if (typeof mimeType === "string") {
        this.forceMimeType = mimeType.toLowerCase();
      }
    },


    /*
      Places a FakeXMLHttpRequest object into the passed
      state.
    */
    _readyStateChange: function _readyStateChange(state) {
      this.readyState = state;

      if (typeof this.onreadystatechange == "function") {
        this.onreadystatechange(new _Event("readystatechange"));
      }

      this.dispatchEvent(new _Event("readystatechange"));

      if (this.readyState == FakeXMLHttpRequest.DONE) {
        this.dispatchEvent(new _Event("load", false, false, this));
        this.dispatchEvent(new _Event("loadend", false, false, this));
      }
    },


    /*
      Sets the FakeXMLHttpRequest object's response headers and
      places the object into readyState 2
    */
    _setResponseHeaders: function _setResponseHeaders(headers) {
      this.responseHeaders = {};

      for (var header in headers) {
        if (headers.hasOwnProperty(header)) {
            this.responseHeaders[header] = headers[header];
        }
      }

      if (this.forceMimeType) {
        this.responseHeaders['Content-Type'] = this.forceMimeType;
      }

      if (this.async) {
        this._readyStateChange(FakeXMLHttpRequest.HEADERS_RECEIVED);
      } else {
        this.readyState = FakeXMLHttpRequest.HEADERS_RECEIVED;
      }
    },

    /*
      Sets the FakeXMLHttpRequest object's response body and
      if body text is XML, sets responseXML to parsed document
      object
    */
    _setResponseBody: function _setResponseBody(body) {
      verifyRequestSent(this);
      verifyHeadersReceived(this);
      verifyResponseBodyType(body);

      var chunkSize = this.chunkSize || 10;
      var index = 0;
      this.responseText = "";

      do {
        if (this.async) {
          this._readyStateChange(FakeXMLHttpRequest.LOADING);
        }

        this.responseText += body.substring(index, index + chunkSize);
        index += chunkSize;
      } while (index < body.length);

      var type = this.getResponseHeader("Content-Type");

      if (this.responseText && (!type || /(text\/xml)|(application\/xml)|(\+xml)/.test(type))) {
        try {
          this.responseXML = parseXML(this.responseText);
        } catch (e) {
          // Unable to parse XML - no biggie
        }
      }

      if (this.async) {
        this._readyStateChange(FakeXMLHttpRequest.DONE);
      } else {
        this.readyState = FakeXMLHttpRequest.DONE;
      }
    },

    /*
      Forces a response on to the FakeXMLHttpRequest object.

      This is the public API for faking responses. This function
      takes a number status, headers object, and string body:

      ```
      xhr.respond(404, {Content-Type: 'text/plain'}, "Sorry. This object was not found.")

      ```
    */
    respond: function respond(status, headers, body) {
      this._setResponseHeaders(headers || {});
      this.status = typeof status == "number" ? status : 200;
      this.statusText = httpStatusCodes[this.status];
      this._setResponseBody(body || "");
    }
  };

  for (var property in FakeXMLHttpRequestProto) {
    FakeXMLHttpRequest.prototype[property] = FakeXMLHttpRequestProto[property];
  }

  function verifyState(xhr) {
    if (xhr.readyState !== FakeXMLHttpRequest.OPENED) {
      throw new Error("INVALID_STATE_ERR");
    }

    if (xhr.sendFlag) {
      throw new Error("INVALID_STATE_ERR");
    }
  }


  function verifyRequestSent(xhr) {
      if (xhr.readyState == FakeXMLHttpRequest.DONE) {
          throw new Error("Request done");
      }
  }

  function verifyHeadersReceived(xhr) {
      if (xhr.async && xhr.readyState != FakeXMLHttpRequest.HEADERS_RECEIVED) {
          throw new Error("No headers received");
      }
  }

  function verifyResponseBodyType(body) {
      if (typeof body != "string") {
          var error = new Error("Attempted to respond to fake XMLHttpRequest with " +
                               body + ", which is not a string.");
          error.name = "InvalidBodyException";
          throw error;
      }
  }
  var main = FakeXMLHttpRequest;

  return main;

}));
},{}],117:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _morphdom = require('morphdom');

var _morphdom2 = _interopRequireDefault(_morphdom);

var _merge = require('./utils/merge');

var _merge2 = _interopRequireDefault(_merge);

var _isFunction = require('./utils/is-function');

var _isFunction2 = _interopRequireDefault(_isFunction);

var _components = require('./defaults/components');

var _components2 = _interopRequireDefault(_components);

var _iframe = require('./iframe');

var _iframe2 = _interopRequireDefault(_iframe);

var _template = require('./template');

var _template2 = _interopRequireDefault(_template);

var _all = require('./styles/embeds/all');

var _all2 = _interopRequireDefault(_all);

var _elementClass = require('./utils/element-class');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var delegateEventSplitter = /^(\S+)\s*(.*)$/;
var ESC_KEY = 27;

function logEvent(event, type) {

  /* eslint-disable no-console */
  console.log('EVENT: ' + event + ' (' + type + ')');

  /* eslint-enable no-console  */
}

var Component = function () {
  function Component(config, props) {
    _classCallCheck(this, Component);

    this.id = config.id;
    this.handle = config.handle;
    this.node = config.node;
    this.debug = config.debug;
    this.config = (0, _merge2.default)({}, _components2.default, config.options || {});
    this.props = props;
    this.model = {};
    this.template = new _template2.default(this.templates, this.contents, this.order);
    this.children = null;
  }

  Component.prototype.delegateEvents = function delegateEvents() {
    var _this = this;

    this._userEvent('beforeDelegateEvents');
    this._closeComponentsOnEsc();
    Object.keys(this.DOMEvents).forEach(function (key) {
      var _key$match = key.match(delegateEventSplitter);

      var _key$match2 = _slicedToArray(_key$match, 3);

      var eventName = _key$match2[1];
      var selectorString = _key$match2[2];

      var selector = selectorString.split(' ').join('.');
      if (selector) {
        _this._on(eventName, selector, function (evt, target) {
          _this.DOMEvents[key].call(_this, evt, target);
        });
      } else {
        _this.wrapper.addEventListener('click', function (evt) {
          _this.DOMEvents[key].call(_this, evt);
        });
      }
    });
    this._userEvent('afterDelegateEvents');
  };

  Component.prototype.resize = function resize() {
    if (!this.iframe) {
      return;
    }
    if (this.typeKey === 'product' && this.options.layout === 'vertical') {
      this.resizeX();
    }
    if (this.typeKey === 'product' || this.typeKey === 'productSet') {
      this.resizeY();
    }
  };

  Component.prototype.resizeY = function resizeY() {
    this.iframe.el.style.height = this.wrapper.clientHeight + 'px';
  };

  Component.prototype.resizeX = function resizeX() {
    this.iframe.el.style.width = this.wrapper.clientWidth + 'px';
  };

  Component.prototype.setupView = function setupView() {
    if (this.iframe) {
      return Promise.resolve();
    }
    if (this.options.iframe) {
      this.iframe = new _iframe2.default(this.node, {
        classes: this.classes,
        customStyles: this.styles,
        stylesheet: _all2.default[this.typeKey],
        browserFeatures: this.props.browserFeatures
      });
      this.node.className += ' shopify-buy-frame shopify-buy-frame--' + this.typeKey;
      this.iframe.addClass(this.iframeClass);
      return this.iframe.load();
    } else {
      this.iframe = null;
      return Promise.resolve();
    }
  };

  Component.prototype.setupModel = function setupModel(data) {
    if (data) {
      return Promise.resolve(data);
    } else {
      return this.fetchData();
    }
  };

  Component.prototype.init = function init(data) {
    var _this2 = this;

    this._userEvent('beforeInit');
    return this.setupView().then(function () {
      return _this2.setupModel(data);
    }).then(function (model) {
      _this2.model = model;
      _this2.render();
      _this2.delegateEvents();
      _this2._userEvent('afterInit');
      return _this2;
    });
  };

  Component.prototype.destroy = function destroy() {
    this.node.parentNode.removeChild(this.node);
  };

  Component.prototype.updateConfig = function updateConfig(config) {
    this._userEvent('beforeUpdateConfig');
    this.config = (0, _merge2.default)(this.config, config.options);
    this.template = new _template2.default(this.templates, this.contents, this.order);
    if (this.iframe) {
      this.iframe.updateStyles(this.styles);
    }
    this.render();
    this.resize();
    this._userEvent('afterUpdateConfig');
  };

  Component.prototype.wrapTemplate = function wrapTemplate(html) {
    return '<div class="' + this.classes[this.typeKey][this.typeKey] + '">' + html + '</div>';
  };

  Component.prototype.render = function render() {
    var _this3 = this;

    this._userEvent('beforeRender');
    var html = this.template.render({ data: this.viewData }, function (data) {
      return _this3.wrapTemplate(data);
    });
    if (this.wrapper && this.wrapper.innerHTML.length) {
      var div = document.createElement('div');
      div.innerHTML = html;
      (0, _morphdom2.default)(this.wrapper, div, this.morphCallbacks);
      this.wrapper.className = this.classes[this.typeKey].wrapper;
    } else {
      this.wrapper = this.createWrapper();
      this.wrapper.innerHTML = html;
    }
    this._userEvent('afterRender');
    return this.loadImgs();
  };

  Component.prototype.createWrapper = function createWrapper() {
    var wrapper = document.createElement('div');
    wrapper.className = this.classes[this.typeKey].wrapper;
    if (this.iframe) {
      this.document.body.appendChild(wrapper);
    } else {
      this.node.appendChild(wrapper);
    }
    return wrapper;
  };

  Component.prototype.loadImgs = function loadImgs() {
    var _this4 = this;

    var imgs = Array.prototype.slice.call(this.wrapper.querySelectorAll('img'));
    var promises = imgs.map(function (img) {
      (0, _elementClass.addClassToElement)('is-transitioning', img);
      var src = img.getAttribute('data-src');
      if (src) {
        return new Promise(function (resolve) {
          img.addEventListener('load', function (evt) {
            (0, _elementClass.removeClassFromElement)('is-transitioning', img);
            return resolve(evt);
          });
          img.addEventListener('error', function (evt) {
            return resolve(evt);
          });
          img.setAttribute('src', src);
        });
      } else {
        return Promise.resolve();
      }
    });
    if (this.iframe) {
      return Promise.all(promises).then(function () {
        return _this4.resize();
      });
    } else {
      return Promise.resolve();
    }
  };

  Component.prototype._closeComponentsOnEsc = function _closeComponentsOnEsc() {
    var _this5 = this;

    if (!this.iframe) {
      return;
    }
    this.document.addEventListener('keydown', function (evt) {
      if (evt.keyCode !== ESC_KEY) {
        return;
      }
      _this5.props.closeModal();
      _this5.props.closeCart();
    });
  };

  Component.prototype._userEvent = function _userEvent(methodName) {
    if (this.debug) {
      logEvent(methodName, this.typeKey);
    }
    if ((0, _isFunction2.default)(this.events[methodName])) {
      this.events[methodName].call(this, this);
    }
  };

  Component.prototype._on = function _on(eventName, selector, fn) {
    var _this6 = this;

    this.wrapper.addEventListener(eventName, function (evt) {
      var possibleTargets = Array.prototype.slice.call(_this6.wrapper.querySelectorAll(selector));
      var target = evt.target;

      possibleTargets.forEach(function (possibleTarget) {
        var el = target;
        while (el && el !== _this6.wrapper) {
          if (el === possibleTarget) {
            return fn.call(possibleTarget, evt, possibleTarget);
          }
          el = el.parentNode;
        }
        return el;
      });
    });
  };

  _createClass(Component, [{
    key: 'client',
    get: function get() {
      return this.props.client;
    }
  }, {
    key: 'options',
    get: function get() {
      return (0, _merge2.default)({}, this.config[this.typeKey]);
    }
  }, {
    key: 'manifest',
    get: function get() {
      return this.options.manifest.slice(0);
    }
  }, {
    key: 'order',
    get: function get() {
      return this.options.order.slice(0);
    }
  }, {
    key: 'templates',
    get: function get() {
      return (0, _merge2.default)({}, this.options.templates);
    }
  }, {
    key: 'contents',
    get: function get() {
      return (0, _merge2.default)({}, this.options.contents);
    }
  }, {
    key: 'text',
    get: function get() {
      return (0, _merge2.default)({}, this.options.text);
    }
  }, {
    key: 'events',
    get: function get() {
      return (0, _merge2.default)({}, this.options.events);
    }
  }, {
    key: 'DOMEvents',
    get: function get() {
      return (0, _merge2.default)({}, this.options.DOMEvents);
    }
  }, {
    key: 'styles',
    get: function get() {
      var _this7 = this;

      return this.manifest.filter(function (component) {
        return _this7.config[component].styles;
      }).reduce(function (hash, component) {
        hash[component] = _this7.config[component].styles;
        return hash;
      }, {});
    }
  }, {
    key: 'classes',
    get: function get() {
      var _this8 = this;

      return this.manifest.filter(function (component) {
        return _this8.config[component].classes;
      }).reduce(function (hash, component) {
        hash[component] = _this8.config[component].classes;
        return hash;
      }, {});
    }
  }, {
    key: 'document',
    get: function get() {
      return this.iframe ? this.iframe.document : window.document;
    }
  }, {
    key: 'viewData',
    get: function get() {
      return (0, _merge2.default)(this.model, {
        classes: this.classes,
        text: this.text
      });
    }
  }, {
    key: 'morphCallbacks',
    get: function get() {
      return {};
    }
  }, {
    key: 'iframeClass',
    get: function get() {
      return '';
    }
  }]);

  return Component;
}();

exports.default = Component;

},{"./defaults/components":124,"./iframe":125,"./styles/embeds/all":127,"./template":131,"./utils/element-class":141,"./utils/is-function":143,"./utils/merge":144,"morphdom":47}],118:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _merge2 = require('../utils/merge');

var _merge3 = _interopRequireDefault(_merge2);

var _component = require('../component');

var _component2 = _interopRequireDefault(_component);

var _toggle = require('./toggle');

var _toggle2 = _interopRequireDefault(_toggle);

var _template = require('../template');

var _template2 = _interopRequireDefault(_template);

var _checkout = require('./checkout');

var _checkout2 = _interopRequireDefault(_checkout);

var _elementClass = require('../utils/element-class');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Cart = function (_Component) {
  _inherits(Cart, _Component);

  function Cart(config, props, storage) {
    _classCallCheck(this, Cart);

    var _this = _possibleConstructorReturn(this, _Component.call(this, config, props));

    _this.storage = storage || window.localStorage;
    _this.addVariantToCart = _this.addVariantToCart.bind(_this);
    _this.childTemplate = new _template2.default(_this.config.lineItem.templates, _this.config.lineItem.contents, _this.config.lineItem.order);
    _this.node = document.body.appendChild(document.createElement('div'));
    _this.node.className = 'shopify-buy-cart-wrapper';
    _this.isVisible = false;
    _this.toggle = new _toggle2.default(config, _extends({}, _this.props, { cart: _this }));
    _this.checkout = new _checkout2.default(_this.config);
    return _this;
  }

  Cart.prototype.fetchData = function fetchData() {
    var _this2 = this;

    if (this.storage.getItem('lastCartId')) {
      return this.props.client.fetchCart(this.storage.getItem('lastCartId'));
    } else {
      return this.props.client.createCart().then(function (cart) {
        try {
          _this2.storage.setItem('lastCartId', cart.id);
        } catch (err) {
          // eslint-disable-next-line
          console.warn('localStorage unsupported');
        }
        return cart;
      });
    }
  };

  Cart.prototype.init = function init(data) {
    var _this3 = this;

    return _Component.prototype.init.call(this, data).then(function (cart) {
      return _this3.toggle.init({ lineItems: cart.model.lineItems }).then(function () {
        return _this3;
      });
    });
  };

  Cart.prototype.render = function render() {
    _Component.prototype.render.call(this);
    if (this.isVisible) {
      this.iframe.addClass('is-active');
    } else {
      this.iframe.removeClass('is-active');
    }
  };

  Cart.prototype.destroy = function destroy() {
    _Component.prototype.destroy.call(this);
    this.toggle.destroy();
  };

  Cart.prototype.close = function close() {
    this.isVisible = false;
    this.render();
  };

  Cart.prototype.toggleVisibility = function toggleVisibility() {
    this.isVisible = !this.isVisible;
    this.render();
  };

  Cart.prototype.onQuantityBlur = function onQuantityBlur(evt, target) {
    this.setQuantity(target, function () {
      return target.value;
    });
  };

  Cart.prototype.onQuantityIncrement = function onQuantityIncrement(qty, evt, target) {
    this.setQuantity(target, function (prevQty) {
      return prevQty + qty;
    });
  };

  Cart.prototype.setQuantity = function setQuantity(target, fn) {
    var id = target.getAttribute('data-line-item-id');
    var item = this.model.lineItems.filter(function (lineItem) {
      return lineItem.id === id;
    })[0];
    var newQty = fn(item.quantity);
    return this.updateItem(id, newQty);
  };

  Cart.prototype.updateItem = function updateItem(id, qty) {
    var _this4 = this;

    return this.model.updateLineItem(id, qty).then(function (cart) {
      _this4.model = cart;
      _this4.toggle.render();
      if (qty > 0) {
        _this4.render();
      } else {
        _this4.animateRemoveItem(id);
      }
      return cart;
    });
  };

  Cart.prototype.animateRemoveItem = function animateRemoveItem(id) {
    var el = this.document.getElementById(id);
    (0, _elementClass.addClassToElement)('is-hidden', el);
    if (el.parentNode) {
      if (this.props.browserFeatures.transition) {
        el.addEventListener('transitionend', function () {
          // eslint-disable-next-line
          // TODO: why is transitionend sometimes called twice?
          if (el.parentNode) {
            el.parentNode.removeChild(el);
          }
        });
      } else {
        el.parentNode.removeChild(el);
      }
    }
  };

  Cart.prototype.updateConfig = function updateConfig(config) {
    _Component.prototype.updateConfig.call(this, config);
    this.toggle.updateConfig(config);
  };

  Cart.prototype.onCheckout = function onCheckout() {
    this.checkout.open(this.model.checkoutUrl);
  };

  Cart.prototype.addVariantToCart = function addVariantToCart(variant) {
    var _this5 = this;

    var quantity = arguments.length <= 1 || arguments[1] === undefined ? 1 : arguments[1];

    this.isVisible = true;
    this.render();
    return this.model.addVariants({ variant: variant, quantity: quantity }).then(function (cart) {
      _this5.render();
      _this5.toggle.render();
      return cart;
    });
  };

  _createClass(Cart, [{
    key: 'typeKey',
    get: function get() {
      return 'cart';
    }
  }, {
    key: 'DOMEvents',
    get: function get() {
      var _merge;

      return (0, _merge3.default)({}, this.options.DOMEvents, (_merge = {}, _defineProperty(_merge, 'click .' + this.classes.cart.close, this.close.bind(this)), _defineProperty(_merge, 'click .' + this.classes.lineItem.quantityButton + '.quantity-increment', this.onQuantityIncrement.bind(this, 1)), _defineProperty(_merge, 'click .' + this.classes.lineItem.quantityButton + '.quantity-decrement', this.onQuantityIncrement.bind(this, -1)), _defineProperty(_merge, 'click .' + this.classes.cart.button, this.onCheckout.bind(this)), _defineProperty(_merge, 'focusout .' + this.classes.lineItem.quantityInput, this.onQuantityBlur.bind(this)), _merge));
    }
  }, {
    key: 'lineItemsHtml',
    get: function get() {
      var _this6 = this;

      return this.model.lineItems.reduce(function (acc, lineItem) {
        var data = lineItem;
        data.classes = _this6.classes;
        return acc + _this6.childTemplate.render({ data: data }, function (output) {
          return '<div id="' + lineItem.id + '" class=' + _this6.classes.lineItem.lineItem + '>' + output + '</div>';
        });
      }, '');
    }
  }, {
    key: 'viewData',
    get: function get() {
      return (0, _merge3.default)(this.model, {
        wrapperClass: this.isVisible ? 'is-active' : '',
        text: this.text,
        classes: this.classes,
        lineItemsHtml: this.lineItemsHtml,
        isEmpty: this.model.lineItems.length < 1
      });
    }
  }]);

  return Cart;
}(_component2.default);

exports.default = Cart;

},{"../component":117,"../template":131,"../utils/element-class":141,"../utils/merge":144,"./checkout":119,"./toggle":123}],119:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Checkout = function () {
  function Checkout(config) {
    _classCallCheck(this, Checkout);

    this.config = config;
  }

  Checkout.prototype.open = function open(url) {
    window.open(url, 'checkout', this.params);
  };

  _createClass(Checkout, [{
    key: 'params',
    get: function get() {
      var _this = this;

      return Object.keys(this.config.window).reduce(function (acc, key) {
        return '' + acc + key + '=' + _this.config.window[key] + ',';
      }, '');
    }
  }]);

  return Checkout;
}();

exports.default = Checkout;

},{}],120:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _merge = require('../utils/merge');

var _merge2 = _interopRequireDefault(_merge);

var _component = require('../component');

var _component2 = _interopRequireDefault(_component);

var _product = require('./product');

var _product2 = _interopRequireDefault(_product);

var _template = require('../template');

var _template2 = _interopRequireDefault(_template);

var _elementClass = require('../utils/element-class');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Modal = function (_Component) {
  _inherits(Modal, _Component);

  function Modal(config, props) {
    _classCallCheck(this, Modal);

    var _this = _possibleConstructorReturn(this, _Component.call(this, config, props));

    _this.node = document.body.appendChild(document.createElement('div'));
    _this.node.className = 'shopify-buy-modal-wrapper';
    _this.product = null;
    return _this;
  }

  Modal.prototype.delegateEvents = function delegateEvents() {
    _Component.prototype.delegateEvents.call(this);
    this.document.body.addEventListener('click', this.closeOnBgClick.bind(this));
  };

  Modal.prototype.closeOnBgClick = function closeOnBgClick(evt) {
    if (!this.wrapper.contains(evt.target)) {
      this.close();
    }
  };

  Modal.prototype.init = function init(data) {
    var _this2 = this;

    this.isVisible = true;
    return _Component.prototype.init.call(this, data).then(function () {
      return _this2.product.init(_this2.model).then(function () {
        return _this2.loadImgs();
      });
    });
  };

  Modal.prototype.close = function close() {
    var _this3 = this;

    (0, _elementClass.removeClassFromElement)('is-active', this.wrapper);
    this.iframe.removeClass('is-active');
    if (this.props.browserFeatures.transition) {
      this.iframe.parent.addEventListener('transitionend', function () {
        _this3.iframe.removeClass('is-block');
      });
    } else {
      this.iframe.removeClass('is-block');
    }
  };

  Modal.prototype.render = function render() {
    if (!this.isVisible) {
      return;
    }
    _Component.prototype.render.call(this);
    this.iframe.addClass('is-active');
    this.iframe.addClass('is-block');
    (0, _elementClass.addClassToElement)('is-active', this.wrapper);
    this.product = new _product2.default(this.productConfig, this.props);
    this.product.template = new _template2.default(this.productModalTemplates, this.productModalContents, this.productModalOrder);
  };

  _createClass(Modal, [{
    key: 'typeKey',
    get: function get() {
      return 'modal';
    }
  }, {
    key: 'DOMEvents',
    get: function get() {
      return _extends({}, this.options.DOMEvents, this.product.DOMEvents, _defineProperty({}, 'click .' + this.classes.modal.close, this.close.bind(this)));
    }
  }, {
    key: 'productConfig',
    get: function get() {
      return {
        node: this.document.querySelector('.' + this.classes.modal.modal),
        options: (0, _merge2.default)({}, this.config)
      };
    }
  }, {
    key: 'productTemplate',
    get: function get() {
      return new _template2.default(this.product.templates, _extends({}, this.product.config.modalProduct.contents, {
        img: false
      }), this.product.config.modalProduct.order);
    }
  }, {
    key: 'productModalTemplates',
    get: function get() {
      return {
        img: '<div class="' + this.classes.modal.img + '">' + this.product.templates.img + '</div>',
        contents: '<div class="' + this.classes.modal.contents + ' {{#data.currentImage}}' + this.classes.modal.contentsWithImg + '{{/data.currentImage}}"><div class="' + this.classes.modal.scrollContents + '">' + this.productTemplate.masterTemplate + '</div></div>',
        footer: '<div class="' + this.classes.modal.footer + ' {{#data.currentImage}}' + this.classes.modal.footerWithImg + '{{/data.currentImage}}">\n                ' + this.product.templates.button + '\n              </div>'
      };
    }
  }, {
    key: 'productModalContents',
    get: function get() {
      return {
        img: true,
        contents: true
      };
    }
  }, {
    key: 'productModalOrder',
    get: function get() {
      return ['img', 'contents', 'footer'];
    }
  }]);

  return Modal;
}(_component2.default);

exports.default = Modal;

},{"../component":117,"../template":131,"../utils/element-class":141,"../utils/merge":144,"./product":122}],121:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _merge = require('../utils/merge');

var _merge2 = _interopRequireDefault(_merge);

var _component = require('../component');

var _component2 = _interopRequireDefault(_component);

var _product = require('./product');

var _product2 = _interopRequireDefault(_product);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function isArray(arg) {
  return Object.prototype.toString.call(arg) === '[object Array]';
}

var ProductSet = function (_Component) {
  _inherits(ProductSet, _Component);

  function ProductSet(config, props) {
    _classCallCheck(this, ProductSet);

    var _this = _possibleConstructorReturn(this, _Component.call(this, config, props));

    _this.products = [];
    _this.cart = null;
    return _this;
  }

  ProductSet.prototype.sdkFetch = function sdkFetch() {
    var _this2 = this;

    /* eslint-disable camelcase */
    var method = void 0;
    if (this.id) {
      var queryKey = isArray(this.id) ? 'product_ids' : 'collection_id';
      method = this.props.client.fetchQueryProducts(_defineProperty({}, queryKey, this.id));
    } else if (this.handle) {
      method = this.props.client.fetchQueryCollections({ handle: this.handle }).then(function (collections) {
        var collection = collections[0];
        return _this2.props.client.fetchQueryProducts({ collection_id: collection.attrs.collection_id });
      });
    }
    return method;

    /* eslint-enable camelcase */
  };

  ProductSet.prototype.fetchData = function fetchData() {
    return this.sdkFetch().then(function (products) {
      return {
        products: products
      };
    });
  };

  ProductSet.prototype.updateConfig = function updateConfig(config) {
    _Component.prototype.updateConfig.call(this, config);
    this.cart.updateConfig(config);
  };

  ProductSet.prototype.render = function render() {
    var _this3 = this;

    _Component.prototype.render.call(this);
    var productConfig = {
      node: this.document.querySelector('.' + this.classes.productSet.products),
      options: (0, _merge2.default)({}, this.config, {
        product: {
          iframe: false,
          classes: {
            wrapper: this.classes.productSet.product
          }
        }
      })
    };

    var promises = this.model.products.map(function (productModel) {
      var product = new _product2.default(productConfig, _this3.props);
      _this3.products.push(product);
      return product.init(productModel);
    });

    return Promise.all(promises).then(function () {
      _this3.resize();
      _this3.cart = _this3.products[0].cart;
      return _this3.loadImgs();
    });
  };

  _createClass(ProductSet, [{
    key: 'typeKey',
    get: function get() {
      return 'productSet';
    }
  }]);

  return ProductSet;
}(_component2.default);

exports.default = ProductSet;

},{"../component":117,"../utils/merge":144,"./product":122}],122:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _merge2 = require('../utils/merge');

var _merge3 = _interopRequireDefault(_merge2);

var _component = require('../component');

var _component2 = _interopRequireDefault(_component);

var _template = require('../template');

var _template2 = _interopRequireDefault(_template);

var _checkout = require('./checkout');

var _checkout2 = _interopRequireDefault(_checkout);

var _windowUtils = require('../utils/window-utils');

var _windowUtils2 = _interopRequireDefault(_windowUtils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function isPseudoSelector(key) {
  return key.charAt(0) === ':';
}

function isMedia(key) {
  return key.charAt(0) === '@';
}

var propertiesWhitelist = ['background', 'background-color', 'border', 'border-radius', 'color', 'border-color', 'border-width', 'border-style', 'transition', 'text-transform', 'text-shadow', 'box-shadow', 'font-size', 'font-family'];

function whitelistedProperties(selectorStyles) {
  return Object.keys(selectorStyles).reduce(function (filteredStyles, propertyName) {
    if (isPseudoSelector(propertyName) || isMedia(propertyName)) {
      filteredStyles[propertyName] = whitelistedProperties(selectorStyles[propertyName]);
      return filteredStyles;
    }
    if (propertiesWhitelist.indexOf(propertyName) > -1) {
      filteredStyles[propertyName] = selectorStyles[propertyName];
    }
    return filteredStyles;
  }, {});
}

var Product = function (_Component) {
  _inherits(Product, _Component);

  function Product(config, props) {
    _classCallCheck(this, Product);

    var _this = _possibleConstructorReturn(this, _Component.call(this, config, props));

    _this.defaultVariantId = config.variantId;
    _this.cachedImage = null;
    _this.childTemplate = new _template2.default(_this.config.option.templates, _this.config.option.contents, _this.config.option.order);
    _this.cart = null;
    _this.modal = null;
    _this.imgStyle = '';
    _this.selectedQuantity = 1;
    return _this;
  }

  Product.prototype.init = function init(data) {
    var _this2 = this;

    return _Component.prototype.init.call(this, data).then(function (model) {
      return _this2.createCart().then(function (cart) {
        _this2.cart = cart;
        _this2.render();
        return model;
      });
    });
  };

  Product.prototype.createCart = function createCart() {
    if (this.options.buttonDestination === 'cart' || this.config.modalProduct.buttonDestination === 'cart') {
      return this.props.createCart({
        options: this.config
      });
    } else {
      return Promise.resolve();
    }
  };

  Product.prototype.setupModel = function setupModel(data) {
    var _this3 = this;

    return _Component.prototype.setupModel.call(this, data).then(function (model) {
      return _this3.setDefaultVariant(model);
    });
  };

  Product.prototype.wrapTemplate = function wrapTemplate(html) {
    if (this.contents.button) {
      return '<div class="' + this.wrapperClass + ' ' + this.classes.product.product + '">' + html + '</div>';
    } else {
      return '<button class="' + this.classes.product.blockButton + ' ' + this.classes.product.product + '">' + html + '</button>';
    }
  };

  Product.prototype.sdkFetch = function sdkFetch() {
    if (this.id) {
      return this.props.client.fetchProduct(this.id);
    } else if (this.handle) {
      return this.props.client.fetchQueryProducts({ handle: this.handle }).then(function (products) {
        return products[0];
      });
    }
    return Promise.resolve();
  };

  Product.prototype.fetchData = function fetchData() {
    return this.sdkFetch().then(function (model) {
      model.selectedQuantity = 0;
      return model;
    });
  };

  Product.prototype.updateConfig = function updateConfig(config) {
    _Component.prototype.updateConfig.call(this, config);
    this.cart.updateConfig(config);
    if (this.modal) {
      this.modal.updateConfig(config);
    }
  };

  Product.prototype.onButtonClick = function onButtonClick(evt) {
    evt.stopPropagation();
    if (this.options.buttonDestination === 'cart') {
      this.props.closeModal();
      this.cart.addVariantToCart(this.model.selectedVariant, this.model.selectedQuantity);
    } else if (this.options.buttonDestination === 'modal') {
      this.openModal();
    } else if (this.options.buttonDestination === 'onlineStore') {
      this.openOnlineStore();
    } else {
      new _checkout2.default(this.config).open(this.model.selectedVariant.checkoutUrl(1));
    }
  };

  Product.prototype.openOnlineStore = function openOnlineStore() {
    window.open(this.onlineStoreURL);
  };

  Product.prototype.openModal = function openModal() {
    if (!this.modal) {
      this.modal = this.props.createModal({
        options: _extends({}, this.config, {
          product: this.modalProductConfig
        })
      }, this.props);
    }
    return this.modal.init(this.model);
  };

  Product.prototype.onOptionSelect = function onOptionSelect(evt) {
    var target = evt.target;
    var value = target.options[target.selectedIndex].value;
    var name = target.getAttribute('name');
    this.updateVariant(name, value);
  };

  Product.prototype.onQuantityBlur = function onQuantityBlur(evt, target) {
    this.updateQuantity(function () {
      return target.value;
    });
  };

  Product.prototype.onQuantityIncrement = function onQuantityIncrement(qty) {
    this.updateQuantity(function (prevQty) {
      return prevQty + qty;
    });
  };

  Product.prototype.updateQuantity = function updateQuantity(fn) {
    var quantity = fn(this.selectedQuantity);
    if (quantity < 0) {
      quantity = 0;
    }
    this.selectedQuantity = quantity;
    this.render();
  };

  Product.prototype.updateVariant = function updateVariant(optionName, value) {
    var updatedOption = this.model.options.filter(function (option) {
      return option.name === optionName;
    })[0];
    updatedOption.selected = value;
    if (this.variantExists) {
      this.cachedImage = this.model.selectedVariantImage;
    }
    this.renderWithNewImg();
    return updatedOption;
  };

  Product.prototype.renderWithNewImg = function renderWithNewImg() {
    var _this4 = this;

    var img = this.wrapper.getElementsByClassName(this.classes.product.img)[0];
    this.imgStyle = this.imgStyle || 'min-height: ' + img.clientHeight + 'px;';
    this.render();
    img.addEventListener('load', function () {
      var height = img.clientHeight;
      img.parentNode.style.minHeight = height;
      _this4.imgStyle = 'min-height: ' + height + 'px;';
    });
  };

  Product.prototype.closeCartOnBgClick = function closeCartOnBgClick() {
    if (this.cart.isVisible) {
      this.cart.close();
    }
  };

  Product.prototype.setDefaultVariant = function setDefaultVariant(model) {
    var _this5 = this;

    if (!this.defaultVariantId) {
      return model;
    }

    var selectedVariant = model.variants.filter(function (variant) {
      return variant.id === _this5.defaultVariantId;
    })[0];
    if (selectedVariant) {
      model.options.forEach(function (option) {
        option.selected = selectedVariant.optionValues.filter(function (optionValue) {
          return optionValue.name === option.name;
        })[0].value;
      });
    } else {

      // eslint-disable-next-line
      console.error('invalid variant ID');
    }
    return model;
  };

  _createClass(Product, [{
    key: 'iframeClass',
    get: function get() {
      return 'layout-' + this.options.layout;
    }
  }, {
    key: 'typeKey',
    get: function get() {
      return 'product';
    }
  }, {
    key: 'currentImage',
    get: function get() {
      if (!this.cachedImage) {
        this.cachedImage = this.model.selectedVariantImage;
      }

      return this.cachedImage;
    }
  }, {
    key: 'viewData',
    get: function get() {
      return (0, _merge3.default)(this.model, {
        optionsHtml: this.optionsHtml,
        contents: this.contents,
        currentImage: this.currentImage,
        buttonClass: this.buttonClass,
        hasVariants: this.hasVariants,
        buttonDisabled: !this.buttonEnabled,
        priceClass: this.model.selectedVariant && this.model.selectedVariant.compareAtPrice ? 'price--lowered' : '',
        classes: this.classes,
        hasQuantity: this.options.contents.quantityInput,
        selectedQuantity: this.selectedQuantity,
        buttonText: this.buttonText,
        imgStyle: this.imgStyle
      });
    }
  }, {
    key: 'wrapperClass',
    get: function get() {
      return (this.currentImage ? 'has-image' : 'no-image') + ' layout-' + this.options.layout;
    }
  }, {
    key: 'DOMEvents',
    get: function get() {
      var _merge;

      return (0, _merge3.default)({}, this.options.DOMEvents, (_merge = {
        click: this.closeCartOnBgClick.bind(this)
      }, _defineProperty(_merge, 'change .' + this.classes.option.select, this.onOptionSelect.bind(this)), _defineProperty(_merge, 'click .' + this.classes.product.button, this.onButtonClick.bind(this)), _defineProperty(_merge, 'click .' + this.classes.product.blockButton, this.onButtonClick.bind(this)), _defineProperty(_merge, 'click .' + this.classes.product.quantityButton + '.quantity-increment', this.onQuantityIncrement.bind(this, 1)), _defineProperty(_merge, 'click .' + this.classes.product.quantityButton + '.quantity-decrement', this.onQuantityIncrement.bind(this, -1)), _defineProperty(_merge, 'focusout .' + this.classes.product.quantityInput, this.onQuantityBlur.bind(this)), _merge));
    }
  }, {
    key: 'buttonClass',
    get: function get() {
      var disabledClass = this.buttonEnabled ? '' : this.classes.disabled;
      var quantityClass = this.options.contents.quantityInput ? 'beside-quantity' : '';
      return disabledClass + ' ' + quantityClass;
    }
  }, {
    key: 'buttonText',
    get: function get() {
      if (!this.variantExists) {
        return this.text.unavailable;
      }
      if (!this.variantInStock) {
        return this.text.outOfStock;
      }
      return this.text.button;
    }
  }, {
    key: 'buttonEnabled',
    get: function get() {
      return this.buttonActionAvailable && this.variantExists && this.variantInStock;
    }
  }, {
    key: 'variantExists',
    get: function get() {
      return Boolean(this.model.selectedVariant);
    }
  }, {
    key: 'variantInStock',
    get: function get() {
      return this.variantExists && this.model.selectedVariant.available;
    }
  }, {
    key: 'requiresCart',
    get: function get() {
      return this.options.buttonDestination === 'cart';
    }
  }, {
    key: 'buttonActionAvailable',
    get: function get() {
      return !this.requiresCart || Boolean(this.cart);
    }
  }, {
    key: 'optionsHtml',
    get: function get() {
      var _this6 = this;

      if (!this.contents.options) {
        return '';
      }
      return this.decoratedOptions.reduce(function (acc, option) {
        var data = option;
        data.classes = _this6.classes;

        return acc + _this6.childTemplate.render({ data: data });
      }, '');
    }
  }, {
    key: 'hasVariants',
    get: function get() {
      return this.model.variants.length > 1;
    }
  }, {
    key: 'decoratedOptions',
    get: function get() {
      return this.model.options.map(function (option) {
        return {
          name: option.name,
          values: option.values.map(function (value) {
            return {
              name: value,
              selected: value === option.selected
            };
          })
        };
      });
    }
  }, {
    key: 'modalProductConfig',
    get: function get() {
      var _this7 = this;

      var modalProductStyles = void 0;
      if (this.config.product.styles) {
        modalProductStyles = (0, _merge3.default)({}, Object.keys(this.config.product.styles).reduce(function (productStyles, selectorKey) {
          productStyles[selectorKey] = whitelistedProperties(_this7.config.product.styles[selectorKey]);
          return productStyles;
        }, {}), this.config.modalProduct.styles);
      } else {
        modalProductStyles = {};
      }

      return _extends({}, this.config.modalProduct, {
        styles: modalProductStyles
      });
    }
  }, {
    key: 'onlineStoreParams',
    get: function get() {
      return {
        channel: 'buy_button',
        referrer: encodeURIComponent(_windowUtils2.default.location()),
        variant: this.model.selectedVariant.id
      };
    }
  }, {
    key: 'onlineStoreQueryString',
    get: function get() {
      var _this8 = this;

      return Object.keys(this.onlineStoreParams).reduce(function (string, key) {
        return '' + string + key + '=' + _this8.onlineStoreParams[key] + '&';
      }, '?');
    }
  }, {
    key: 'onlineStoreURL',
    get: function get() {
      return 'https://' + this.props.client.config.domain + '/products/' + this.id + this.onlineStoreQueryString;
    }
  }]);

  return Product;
}(_component2.default);

exports.default = Product;

},{"../component":117,"../template":131,"../utils/merge":144,"../utils/window-utils":146,"./checkout":119}],123:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _merge2 = require('../utils/merge');

var _merge3 = _interopRequireDefault(_merge2);

var _component = require('../component');

var _component2 = _interopRequireDefault(_component);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var CartToggle = function (_Component) {
  _inherits(CartToggle, _Component);

  function CartToggle(config, props) {
    _classCallCheck(this, CartToggle);

    var _this = _possibleConstructorReturn(this, _Component.call(this, config, props));

    _this.node = _this.props.cart.node.parentNode.insertBefore(document.createElement('div'), _this.props.cart.node);
    return _this;
  }

  CartToggle.prototype.render = function render() {
    _Component.prototype.render.call(this);
    if (this.isVisible) {
      this.iframe.addClass('is-active');
    } else {
      this.iframe.removeClass('is-active');
    }
  };

  _createClass(CartToggle, [{
    key: 'isVisible',
    get: function get() {
      return this.count > 0;
    }
  }, {
    key: 'typeKey',
    get: function get() {
      return 'toggle';
    }
  }, {
    key: 'count',
    get: function get() {
      return this.props.cart.model.lineItems.reduce(function (acc, lineItem) {
        return acc + lineItem.quantity;
      }, 0);
    }
  }, {
    key: 'viewData',
    get: function get() {
      return {
        classes: this.classes,
        text: this.text,
        count: this.count
      };
    }
  }, {
    key: 'DOMEvents',
    get: function get() {
      return (0, _merge3.default)({}, this.options.DOMEvents, _defineProperty({}, 'click .' + this.classes.toggle.toggle, this.props.cart.toggleVisibility.bind(this.props.cart)));
    }
  }]);

  return CartToggle;
}(_component2.default);

exports.default = CartToggle;

},{"../component":117,"../utils/merge":144}],124:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _product = require('../templates/product');

var _product2 = _interopRequireDefault(_product);

var _cart = require('../templates/cart');

var _cart2 = _interopRequireDefault(_cart);

var _option = require('../templates/option');

var _option2 = _interopRequireDefault(_option);

var _toggle = require('../templates/toggle');

var _toggle2 = _interopRequireDefault(_toggle);

var _lineItem = require('../templates/line-item');

var _lineItem2 = _interopRequireDefault(_lineItem);

var _modal = require('../templates/modal');

var _modal2 = _interopRequireDefault(_modal);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var defaults = {
  product: {
    iframe: true,
    buttonDestination: 'cart',
    layout: 'vertical',
    manifest: ['product', 'option'],
    order: ['img', 'title', 'variantTitle', 'price', 'options', 'quantity', 'button'],
    contents: {
      img: true,
      title: true,
      variantTitle: false,
      price: true,
      options: true,
      quantity: true,
      quantityIncrement: false,
      quantityDecrement: false,
      quantityInput: true,
      button: true,
      description: false
    },
    templates: _product2.default,
    classes: {
      wrapper: 'product-wrapper',
      product: 'product',
      img: 'product__variant-img',
      imgWrapper: 'product-img-wrapper',
      blockButton: 'btn--parent',
      button: 'btn',
      title: 'product__title',
      prices: 'product__price',
      price: 'product__actual-price',
      compareAt: 'product__compare-price',
      variantTitle: 'product__variant-title',
      description: 'product-description',
      options: 'product__variant-selectors',
      disabled: 'btn-disabled',
      buttonBesideQty: 'beside-quantity',
      quantity: 'quantity-container',
      quantityInput: 'quantity',
      quantityButton: 'btn--seamless',
      quantityIncrement: 'quantity-increment',
      quantityDecrement: 'quantity-decrement'
    },
    text: {
      button: 'SHOP NOW',
      outOfStock: 'Out of stock',
      unavailable: 'Unavailable'
    }
  },
  modalProduct: {
    iframe: false,
    contents: {
      img: true,
      title: true,
      variantTitle: false,
      price: true,
      options: true,
      button: true,
      quantity: true,
      quantityIncrement: false,
      quantityDecrement: false,
      quantityInput: true,
      description: true
    },
    order: ['img', 'title', 'variantTitle', 'price', 'options', 'quantity', 'button', 'description'],
    classes: {
      wrapper: 'modal-product-wrapper',
      hasImage: 'has-image'
    },
    buttonDestination: 'cart',
    text: {
      button: 'ADD TO CART'
    }
  },
  modal: {
    iframe: true,
    manifest: ['modal', 'product', 'option'],
    classes: {
      modal: 'modal',
      contents: 'modal-contents',
      close: 'btn--close',
      wrapper: 'modal-wrapper',
      product: 'product-modal',
      img: 'modal-img',
      footer: 'modal-footer',
      footerWithImg: 'modal-footer--has-img',
      imgWithImg: 'modal-img--has-img',
      contentsWithImg: 'modal-contents--has-img',
      scrollContents: 'modal-scroll-contents'
    },
    contents: {
      contents: true
    },
    order: ['contents'],
    templates: _modal2.default
  },
  productSet: {
    iframe: true,
    manifest: ['product', 'option', 'productSet'],
    contents: {
      title: false,
      products: true
    },
    order: ['title', 'products'],
    templates: {
      title: '<h2 class="{{data.classes.productSet.title}}">{{data.collection.attrs.title}}</h2>',
      products: '<div class="{{data.classes.productSet.products}}"></div>'
    },
    classes: {
      wrapper: 'collection-wrapper',
      productSet: 'collection',
      title: 'collection__title',
      collection: 'collection',
      products: 'collection-products',
      product: 'collection-product'
    }
  },
  option: {
    templates: _option2.default,
    contents: {
      option: true
    },
    order: ['option'],
    classes: {
      option: 'option-select',
      wrapper: 'option-select-wrapper',
      select: 'option-select__select',
      label: 'option-select__label'
    }
  },
  cart: {
    iframe: true,
    templates: _cart2.default,
    manifest: ['cart', 'lineItem'],
    contents: {
      title: true,
      lineItems: true,
      footer: true
    },
    order: ['title', 'lineItems', 'footer'],
    classes: {
      wrapper: 'cart-wrapper',
      cart: 'cart',
      header: 'cart__header',
      title: 'cart__title',
      lineItems: 'cart-items',
      footer: 'cart-bottom',
      subtotalText: 'cart__subtotal__text',
      subtotal: 'cart__subtotal__price',
      notice: 'cart__notice',
      currency: 'cart__currency',
      button: 'btn btn--cart-checkout',
      close: 'btn--close',
      cartScroll: 'cart-scroll',
      emptyCart: 'cart-empty-text'
    },
    text: {
      title: 'Your cart',
      empty: 'Your cart is empty.',
      button: 'Checkout',
      total: 'Total',
      currency: 'CAD',
      notice: 'Shipping and discount codes are added at checkout.'
    }
  },
  lineItem: {
    templates: _lineItem2.default,
    contents: {
      image: true,
      variantTitle: true,
      title: true,
      price: true,
      quantity: true,
      quantityIncrement: true,
      quantityDecrement: true,
      quantityInput: true
    },
    order: ['image', 'variantTitle', 'title', 'price', 'quantity'],
    classes: {
      lineItem: 'cart-item',
      image: 'cart-item__image',
      variantTitle: 'cart-item__variant-title',
      itemTitle: 'cart-item__title',
      price: 'cart-item__price',
      quantity: 'quantity-container',
      quantityInput: 'quantity',
      quantityButton: 'btn--seamless'
    }
  },
  toggle: {
    templates: _toggle2.default,
    manifest: ['toggle'],
    iframe: true,
    contents: {
      count: true,
      icon: true,
      title: false
    },
    order: ['count', 'icon', 'title'],
    classes: {
      wrapper: 'cart-toggle-wrapper',
      toggle: 'cart-toggle',
      title: 'cart-toggle__title',
      count: 'cart-toggle__count',
      icon: 'icon-cart icon-cart--side',
      iconPath: 'icon-cart__group'
    },
    text: {
      title: 'cart'
    }
  },
  window: {
    height: 600,
    width: 600,
    toolbar: 0,
    scrollbars: 0,
    status: 0,
    resizable: 1,
    left: 0,
    top: 0,
    center: 0,
    createnew: 1,
    location: 0,
    menubar: 0,
    onUnload: null
  }
};

exports.default = defaults;

},{"../templates/cart":132,"../templates/line-item":133,"../templates/modal":134,"../templates/option":135,"../templates/product":136,"../templates/toggle":138}],125:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _hogan = require('hogan.js');

var _hogan2 = _interopRequireDefault(_hogan);

var _styles = require('./templates/styles');

var _styles2 = _interopRequireDefault(_styles);

var _conditional = require('./styles/embeds/conditional');

var _conditional2 = _interopRequireDefault(_conditional);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var iframeStyles = {
  width: '100%',
  overflow: 'hidden',
  border: 'none'
};

var iframeAttrs = {
  horizontalscrolling: 'no',
  verticalscrolling: 'no',
  allowTransparency: 'true',
  frameBorder: '0',
  scrolling: 'false'
};

function isPseudoSelector(key) {
  return key.charAt(0) === ':';
}

function isMedia(key) {
  return key.charAt(0) === '@';
}

function ruleDeclarations(rule) {
  return Object.keys(rule).filter(function (key) {
    return !isPseudoSelector(key) && !isMedia(key);
  }).map(function (key) {
    return { property: key, value: rule[key] };
  });
}

function selectorStyleGroup(selector, selectorClass) {
  var styleGroup = [];
  if (selector && selectorClass) {
    Object.keys(selector).forEach(function (decKey) {
      if (selector && selectorClass) {
        if (isPseudoSelector(decKey)) {
          styleGroup.push({
            selector: '.' + selectorClass + decKey,
            declarations: ruleDeclarations(selector[decKey])
          });
        } else if (isMedia(decKey)) {
          styleGroup.push({
            media: decKey,
            selector: '.' + selectorClass,
            declarations: ruleDeclarations(selector[decKey])
          });
        }
      }
    });
    var formattedSelector = selectorClass.split(' ').join('.');
    styleGroup.push({
      selector: '.' + formattedSelector,
      declarations: ruleDeclarations(selector)
    });
  }
  return styleGroup;
}

var iframe = function () {
  function iframe(node, config) {
    var _this = this;

    _classCallCheck(this, iframe);

    this.el = document.createElement('iframe');
    this.parent = node;
    this.stylesheet = config.stylesheet;
    this.customStylesHash = config.customStyles || {};
    this.classes = config.classes;
    this.browserFeatures = config.browserFeatures;
    Object.keys(iframeStyles).forEach(function (key) {
      _this.el.style[key] = iframeStyles[key];
    });
    Object.keys(iframeAttrs).forEach(function (key) {
      return _this.el.setAttribute(key, iframeAttrs[key]);
    });
    this.styleTag = null;
  }

  iframe.prototype.load = function load() {
    var _this2 = this;

    return new Promise(function (resolve) {
      _this2.el.onload = function () {
        _this2.appendStyleTag();
        resolve();
      };
      _this2.parent.appendChild(_this2.el);
    });
  };

  iframe.prototype.addClass = function addClass(className) {
    if (this.parent.className.indexOf(className) < 0) {
      this.parent.className += ' ' + className;
    }
  };

  iframe.prototype.removeClass = function removeClass(className) {
    var newClass = this.parent.className.replace(className, '');
    this.parent.className = newClass;
  };

  iframe.prototype.updateStyles = function updateStyles(customStyles) {
    this.customStylesHash = customStyles;
    this.styleTag.innerHTML = this.css;
  };

  iframe.prototype.appendStyleTag = function appendStyleTag() {
    if (!this.document.head) {
      return;
    }
    this.styleTag = this.document.createElement('style');

    if (this.styleTag.styleSheet) {
      this.styleTag.styleSheet.cssText = this.css;
    } else {
      this.styleTag.appendChild(this.document.createTextNode(this.css));
    }

    this.document.head.appendChild(this.styleTag);
  };

  _createClass(iframe, [{
    key: 'document',
    get: function get() {
      var doc = void 0;
      if (this.el.contentWindow && this.el.contentWindow.document.body) {
        doc = this.el.contentWindow.document;
      } else if (this.el.document && this.el.document.body) {
        doc = this.el.document;
      } else if (this.el.contentDocument && this.el.contentDocument.body) {
        doc = this.el.contentDocument;
      }
      return doc;
    }
  }, {
    key: 'customStyles',
    get: function get() {
      var _this3 = this;

      var customStyles = [];
      Object.keys(this.customStylesHash).forEach(function (typeKey) {
        if (_this3.customStylesHash[typeKey]) {
          Object.keys(_this3.customStylesHash[typeKey]).forEach(function (key) {
            var styleGroup = selectorStyleGroup(_this3.customStylesHash[typeKey][key], _this3.classes[typeKey][key]);
            customStyles = customStyles.concat(styleGroup);
          });
        }
      });
      return customStyles;
    }
  }, {
    key: 'conditionalCSS',
    get: function get() {
      if (this.browserFeatures.transition && this.browserFeatures.transform && this.browserFeatures.animation) {
        return '';
      }
      return _conditional2.default;
    }
  }, {
    key: 'css',
    get: function get() {
      var compiled = _hogan2.default.compile(_styles2.default);
      return this.stylesheet + ' \n ' + compiled.render({ selectors: this.customStyles }) + ' \n ' + this.conditionalCSS;
    }
  }]);

  return iframe;
}();

exports.default = iframe;

},{"./styles/embeds/conditional":128,"./templates/styles":137,"hogan.js":41}],126:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _shopifyBuy = require('shopify-buy');

var _shopifyBuy2 = _interopRequireDefault(_shopifyBuy);

var _ui = require('./ui');

var _ui2 = _interopRequireDefault(_ui);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_shopifyBuy2.default.UI = {
  ui: null,

  init: function init(client) {
    if (!this.ui) {
      this.ui = new _ui2.default(client);
    }
    return this.ui;
  }
};

window.ShopifyBuy = _shopifyBuy2.default;
exports.default = _shopifyBuy2.default;

},{"./ui":139,"shopify-buy":82}],127:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var styles = {};
styles.cart = 'html,body,h1,h2,h3,h4,h5,p{padding:0;margin:0}*{box-sizing:border-box}html{font-family:"Helvetica Neue", Helvetica, Arial, sans-serif;font-size:14px;line-height:1.2;color:#31373d}ul{list-style:none;padding-left:0;margin:0}img{display:block;width:100%}input{-webkit-appearance:textfield;margin:0}.clearfix:after{content:"";display:table;clear:both}.visuallyhidden{border:0;height:1px;margin:-1px;overflow:hidden;padding:0;position:absolute;width:1px}.component-container{overflow:hidden}.type--center{text-align:center}.btn{color:#fff;font-size:15px;background:#95C13E;padding:12px 40px;letter-spacing:.3px;display:block;border-radius:3px;cursor:pointer;transition:background 200ms ease;max-width:100%;text-overflow:ellipsis;overflow:hidden;line-height:1.2;border:0;-moz-appearance:none;-webkit-appearance:none}.btn:hover,.btn:focus{background:#6C9319}.btn--parent{background-color:transparent;border:0;line-height:1;padding:0;cursor:pointer;-moz-appearance:none;-webkit-appearance:none}.btn--parent:hover .product__variant-image,.btn--parent:focus .product__variant-image{transition:all .3s ease;opacity:.7}.btn--test{position:absolute;top:50%;left:50%;transform:translate(-50%)}.btn--cart-tab{padding:5px 11px;border-radius:3px 0 0 3px;position:fixed;right:0;top:50%;transform:translate(100%, -50%);opacity:0;min-width:inherit;width:auto;height:auto;z-index:2147483647}.btn--cart-tab.is-active{transform:translateY(-50%);opacity:1}.btn__counter{display:block;margin:0 auto 10px auto;font-size:18px}.icon-cart--side{height:20px;width:20px}.btn[disabled]{background-color:#999}.btn--close{position:absolute;right:9px;top:8px;font-size:35px;color:#767676;border:none;background:transparent;transition:transform 100ms ease;cursor:pointer;padding-right:9px}.btn--close:hover{transform:scale(1.2);color:dimgray}@keyframes flipin{from{max-height:0;transform:rotatex(90deg) translatey(-50%);margin-bottom:-65px;opacity:0}to{min-height:65px;margin-bottom:15px;transform:none;opacity:1}}.cart-wrapper{height:100%;padding-left:10px}.cart{height:100%;background:#fff;width:calc(100% - 10px);position:absolute;right:0;box-shadow:-5px 0 5px rgba(0,0,0,0.1)}.cart__header{padding:15px;position:relative;z-index:2147483647}.cart__title{font-size:18px;color:#767676}.cart-scroll{padding:70px 0 135px 0;position:absolute;top:0;height:100%;width:100%}.cart-items{overflow:hidden;overflow-y:auto;height:100%;position:relative;padding:0 15px 15px;-webkit-overflow-scrolling:touch;perspective:400px;perspective-origin:50% 0px}.cart-item{min-height:65px;margin-bottom:20px;overflow:hidden;position:relative;transition:all 200ms;backface-visibility:visible;transform-style:preserve-3d;animation-name:flipIn;animation-duration:200ms}.cart-item.is-hidden{transform:rotateX(90deg) translateY(-50%);margin-bottom:-65px;opacity:0;transition:all 200ms}.cart-item__image{width:65px;height:65px;background-size:contain;background-repeat:no-repeat;background-position:center center;background-color:#e5e5e5;position:absolute;left:0;top:0}.cart-item__title{font-size:14px;margin-left:80px;display:block;margin-bottom:10px}.cart-item__price{float:right;font-size:14px;font-weight:bold}.cart-item__variant-title{float:right;color:#767676;font-size:11px;font-weight:bold}.cart-bottom{background:#fff;position:absolute;width:100%;bottom:0;padding:20px;border-top:1px solid #79ab61}.cart__subtotal__text{text-transform:uppercase;float:left;font-size:11px;color:#767676}.cart__subtotal__price{float:right}.cart__currency{font-size:12px}.cart__notice{font-size:11px;clear:both;padding-top:10px;text-align:center;color:#767676}.cart-empty-text{padding:10px 15px;text-align:center}.btn--cart-checkout{clear:both;margin-top:15px;width:100%;padding:10px 5px;font-size:16px}.quantity-container{border-radius:3px;overflow:hidden}.quantity-decrement,.quantity-increment{color:#767676;display:block;float:left;height:21px;line-height:16px;font-family:monospace;width:25px;padding:0;border:none;background:transparent;box-shadow:none;cursor:pointer;font-size:18px;text-align:center;border:1px solid #d3dbe2}.quantity-decrement{border-radius:3px 0 0 3px}.quantity-increment{border-radius:0 3px 3px 0}.quantity{color:black;width:38px;height:21px;font-size:12px;border:none;text-align:center;-moz-appearance:textfield;background:transparent;display:inline-block;padding:0;border-radius:0;border-top:1px solid #d3dbe2;border-bottom:1px solid #d3dbe2}input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none;margin:0} ';
styles.modal = 'html,body,h1,h2,h3,h4,h5,p{padding:0;margin:0}*{box-sizing:border-box}html{font-family:"Helvetica Neue", Helvetica, Arial, sans-serif;font-size:14px;line-height:1.2;color:#31373d}ul{list-style:none;padding-left:0;margin:0}img{display:block;width:100%}input{-webkit-appearance:textfield;margin:0}.clearfix:after{content:"";display:table;clear:both}.visuallyhidden{border:0;height:1px;margin:-1px;overflow:hidden;padding:0;position:absolute;width:1px}.component-container{overflow:hidden}.type--center{text-align:center}.quantity-container{border-radius:3px;overflow:hidden}.quantity-decrement,.quantity-increment{color:#767676;display:block;float:left;height:21px;line-height:16px;font-family:monospace;width:25px;padding:0;border:none;background:transparent;box-shadow:none;cursor:pointer;font-size:18px;text-align:center;border:1px solid #d3dbe2}.quantity-decrement{border-radius:3px 0 0 3px}.quantity-increment{border-radius:0 3px 3px 0}.quantity{color:black;width:38px;height:21px;font-size:12px;border:none;text-align:center;-moz-appearance:textfield;background:transparent;display:inline-block;padding:0;border-radius:0;border-top:1px solid #d3dbe2;border-bottom:1px solid #d3dbe2}input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none;margin:0}.btn{color:#fff;font-size:15px;background:#95C13E;padding:12px 40px;letter-spacing:.3px;display:block;border-radius:3px;cursor:pointer;transition:background 200ms ease;max-width:100%;text-overflow:ellipsis;overflow:hidden;line-height:1.2;border:0;-moz-appearance:none;-webkit-appearance:none}.btn:hover,.btn:focus{background:#6C9319}.btn--parent{background-color:transparent;border:0;line-height:1;padding:0;cursor:pointer;-moz-appearance:none;-webkit-appearance:none}.btn--parent:hover .product__variant-image,.btn--parent:focus .product__variant-image{transition:all .3s ease;opacity:.7}.btn--test{position:absolute;top:50%;left:50%;transform:translate(-50%)}.btn--cart-tab{padding:5px 11px;border-radius:3px 0 0 3px;position:fixed;right:0;top:50%;transform:translate(100%, -50%);opacity:0;min-width:inherit;width:auto;height:auto;z-index:2147483647}.btn--cart-tab.is-active{transform:translateY(-50%);opacity:1}.btn__counter{display:block;margin:0 auto 10px auto;font-size:18px}.icon-cart--side{height:20px;width:20px}.btn[disabled]{background-color:#999}.btn--close{position:absolute;right:9px;top:8px;font-size:35px;color:#767676;border:none;background:transparent;transition:transform 100ms ease;cursor:pointer;padding-right:9px}.btn--close:hover{transform:scale(1.2);color:dimgray}.option-select-wrapper{border:1px solid #d3dbe2;border-radius:3px;box-sizing:border-box;position:relative;background:#fff;overflow:hidden;vertical-align:bottom}.shopify-select-icon{cursor:pointer;display:block;fill:#798c9c;position:absolute;right:10px;top:50%;margin-top:-6px;pointer-events:none;width:12px;height:12px;vertical-align:middle}.option-select+.option-select{margin-top:7.5px}.option-select__label{display:block;font-size:14px;margin-top:15px;margin-bottom:5px}.option-select__select{font-size:inherit;padding:7px 10px;padding-right:32px;border:0;width:100%;background:transparent;-webkit-appearance:none;-moz-appearance:none}.product-wrapper{overflow:hidden}.product__variant-img{margin:0 auto 15px auto;transition:all 0.3s ease;opacity:1}.product__variant-img.is-transitioning{opacity:0}.product__title{font-size:18px;line-height:1.2;color:#4a4a4a;margin-bottom:0;font-weight:400}.product__variant-title{font-size:18px;color:#666;font-weight:400;margin-top:15px;text-align:center}.product__price{margin-top:15px}.layout-vertical{text-align:center}.product__actual-price{font-size:18px;color:#4a4a4a;display:block}.product__compare-price{font-size:18px;text-decoration:line-through;color:#a2a2a3;display:block}.product__variant-selectors{margin-top:15px;text-align:left}.quantity-container{display:inline-block}.quantity{font-size:15px;height:auto;padding-top:12px;padding-bottom:12px;border-left:1px solid #d3dbe2;border-top-left-radius:3px;border-bottom-left-radius:3px;line-height:1.2;margin-top:20px}.btn{display:block;margin:20px auto 0}.btn.beside-quantity{display:inline-block;vertical-align:top;border-top-left-radius:0;border-bottom-left-radius:0;border:1px solid transparent}.cart-item__quantity-container{margin-top:20px;display:inline-block}@media (min-width: 801px){.layout-horizontal .product-img-wrapper{float:left;margin-right:15px;width:50%}.layout-horizontal .product__title,.layout-horizontal .product__variant-title,.layout-horizontal .product__price,.layout-horizontal .quantity-container,.layout-horizontal .btn,.layout-horizontal .product__variant-selectors{overflow:hidden}}.btn--close{right:0px;font-size:45px;padding-right:3px;font-weight:100;z-index:2147483647}.btn{margin-bottom:30px}.modal-wrapper{background:#fff;width:100%;max-width:950px;position:absolute;left:0;right:0;z-index:2147483646}.modal-img{padding:45px;padding-right:15px}.modal-contents{position:relative;padding:45px;padding-left:15px}.product{text-align:left}.product__title,.product__price,.product__variant-title{text-align:left}.product__title{font-size:26px;font-weight:700}.product-description{line-height:1.55;color:#4a4a4a}.product-description p+p{margin-top:9.99px}.modal .modal-product-wrapper{width:100%}.product__variant-image{margin:0}@media (max-width: 800px){.modal{min-height:100vh}.modal-img{width:100%;height:40%;padding:30px 30px 0}.modal-contents{width:100%;height:60%;position:relative;padding:30px}.product__variant-image{max-height:60vh;margin:0 auto;width:auto;max-width:100%}.btn--close{position:fixed;top:0;right:10px}}@keyframes slideIn{from{opacity:0;transform:translateY(-200px)}to{opacity:1;transform:translateY(0)}}@media (min-width: 801px){.modal-wrapper{margin:100px auto 40px auto;opacity:0;transform:translateY(-200px);animation-name:slideOut;animation-duration:200ms;animation-fill-mode:forwards}.modal-wrapper.is-active{animation-name:slideIn;animation-duration:200ms;animation-fill-mode:forwards}.has-image .modal-img{width:50%;float:left;height:100%}.has-image .modal-contents{float:right;width:50%}.product-img-wrapper{height:100%;max-height:570}.product-img-wrapper{height:100%;max-height:570}.product__variant-img{max-height:100%}.btn--close{top:-60px;color:#fff}.btn--close:hover{color:#fff}.modal-contents{height:100%}} ';
styles.product = 'html,body,h1,h2,h3,h4,h5,p{padding:0;margin:0}*{box-sizing:border-box}html{font-family:"Helvetica Neue", Helvetica, Arial, sans-serif;font-size:14px;line-height:1.2;color:#31373d}ul{list-style:none;padding-left:0;margin:0}img{display:block;width:100%}input{-webkit-appearance:textfield;margin:0}.clearfix:after{content:"";display:table;clear:both}.visuallyhidden{border:0;height:1px;margin:-1px;overflow:hidden;padding:0;position:absolute;width:1px}.component-container{overflow:hidden}.type--center{text-align:center}.quantity-container{border-radius:3px;overflow:hidden}.quantity-decrement,.quantity-increment{color:#767676;display:block;float:left;height:21px;line-height:16px;font-family:monospace;width:25px;padding:0;border:none;background:transparent;box-shadow:none;cursor:pointer;font-size:18px;text-align:center;border:1px solid #d3dbe2}.quantity-decrement{border-radius:3px 0 0 3px}.quantity-increment{border-radius:0 3px 3px 0}.quantity{color:black;width:38px;height:21px;font-size:12px;border:none;text-align:center;-moz-appearance:textfield;background:transparent;display:inline-block;padding:0;border-radius:0;border-top:1px solid #d3dbe2;border-bottom:1px solid #d3dbe2}input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none;margin:0}.btn{color:#fff;font-size:15px;background:#95C13E;padding:12px 40px;letter-spacing:.3px;display:block;border-radius:3px;cursor:pointer;transition:background 200ms ease;max-width:100%;text-overflow:ellipsis;overflow:hidden;line-height:1.2;border:0;-moz-appearance:none;-webkit-appearance:none}.btn:hover,.btn:focus{background:#6C9319}.btn--parent{background-color:transparent;border:0;line-height:1;padding:0;cursor:pointer;-moz-appearance:none;-webkit-appearance:none}.btn--parent:hover .product__variant-image,.btn--parent:focus .product__variant-image{transition:all .3s ease;opacity:.7}.btn--test{position:absolute;top:50%;left:50%;transform:translate(-50%)}.btn--cart-tab{padding:5px 11px;border-radius:3px 0 0 3px;position:fixed;right:0;top:50%;transform:translate(100%, -50%);opacity:0;min-width:inherit;width:auto;height:auto;z-index:2147483647}.btn--cart-tab.is-active{transform:translateY(-50%);opacity:1}.btn__counter{display:block;margin:0 auto 10px auto;font-size:18px}.icon-cart--side{height:20px;width:20px}.btn[disabled]{background-color:#999}.btn--close{position:absolute;right:9px;top:8px;font-size:35px;color:#767676;border:none;background:transparent;transition:transform 100ms ease;cursor:pointer;padding-right:9px}.btn--close:hover{transform:scale(1.2);color:dimgray}.option-select-wrapper{border:1px solid #d3dbe2;border-radius:3px;box-sizing:border-box;position:relative;background:#fff;overflow:hidden;vertical-align:bottom}.shopify-select-icon{cursor:pointer;display:block;fill:#798c9c;position:absolute;right:10px;top:50%;margin-top:-6px;pointer-events:none;width:12px;height:12px;vertical-align:middle}.option-select+.option-select{margin-top:7.5px}.option-select__label{display:block;font-size:14px;margin-top:15px;margin-bottom:5px}.option-select__select{font-size:inherit;padding:7px 10px;padding-right:32px;border:0;width:100%;background:transparent;-webkit-appearance:none;-moz-appearance:none}.product-wrapper{overflow:hidden}.product__variant-img{margin:0 auto 15px auto;transition:all 0.3s ease;opacity:1}.product__variant-img.is-transitioning{opacity:0}.product__title{font-size:18px;line-height:1.2;color:#4a4a4a;margin-bottom:0;font-weight:400}.product__variant-title{font-size:18px;color:#666;font-weight:400;margin-top:15px;text-align:center}.product__price{margin-top:15px}.layout-vertical{text-align:center}.product__actual-price{font-size:18px;color:#4a4a4a;display:block}.product__compare-price{font-size:18px;text-decoration:line-through;color:#a2a2a3;display:block}.product__variant-selectors{margin-top:15px;text-align:left}.quantity-container{display:inline-block}.quantity{font-size:15px;height:auto;padding-top:12px;padding-bottom:12px;border-left:1px solid #d3dbe2;border-top-left-radius:3px;border-bottom-left-radius:3px;line-height:1.2;margin-top:20px}.btn{display:block;margin:20px auto 0}.btn.beside-quantity{display:inline-block;vertical-align:top;border-top-left-radius:0;border-bottom-left-radius:0;border:1px solid transparent}.cart-item__quantity-container{margin-top:20px;display:inline-block}@media (min-width: 801px){.layout-horizontal .product-img-wrapper{float:left;margin-right:15px;width:50%}.layout-horizontal .product__title,.layout-horizontal .product__variant-title,.layout-horizontal .product__price,.layout-horizontal .quantity-container,.layout-horizontal .btn,.layout-horizontal .product__variant-selectors{overflow:hidden}} ';
styles.productSet = 'html,body,h1,h2,h3,h4,h5,p{padding:0;margin:0}*{box-sizing:border-box}html{font-family:"Helvetica Neue", Helvetica, Arial, sans-serif;font-size:14px;line-height:1.2;color:#31373d}ul{list-style:none;padding-left:0;margin:0}img{display:block;width:100%}input{-webkit-appearance:textfield;margin:0}.clearfix:after{content:"";display:table;clear:both}.visuallyhidden{border:0;height:1px;margin:-1px;overflow:hidden;padding:0;position:absolute;width:1px}.component-container{overflow:hidden}.type--center{text-align:center}.btn{color:#fff;font-size:15px;background:#95C13E;padding:12px 40px;letter-spacing:.3px;display:block;border-radius:3px;cursor:pointer;transition:background 200ms ease;max-width:100%;text-overflow:ellipsis;overflow:hidden;line-height:1.2;border:0;-moz-appearance:none;-webkit-appearance:none}.btn:hover,.btn:focus{background:#6C9319}.btn--parent{background-color:transparent;border:0;line-height:1;padding:0;cursor:pointer;-moz-appearance:none;-webkit-appearance:none}.btn--parent:hover .product__variant-image,.btn--parent:focus .product__variant-image{transition:all .3s ease;opacity:.7}.btn--test{position:absolute;top:50%;left:50%;transform:translate(-50%)}.btn--cart-tab{padding:5px 11px;border-radius:3px 0 0 3px;position:fixed;right:0;top:50%;transform:translate(100%, -50%);opacity:0;min-width:inherit;width:auto;height:auto;z-index:2147483647}.btn--cart-tab.is-active{transform:translateY(-50%);opacity:1}.btn__counter{display:block;margin:0 auto 10px auto;font-size:18px}.icon-cart--side{height:20px;width:20px}.btn[disabled]{background-color:#999}.btn--close{position:absolute;right:9px;top:8px;font-size:35px;color:#767676;border:none;background:transparent;transition:transform 100ms ease;cursor:pointer;padding-right:9px}.btn--close:hover{transform:scale(1.2);color:dimgray}.quantity-container{border-radius:3px;overflow:hidden}.quantity-decrement,.quantity-increment{color:#767676;display:block;float:left;height:21px;line-height:16px;font-family:monospace;width:25px;padding:0;border:none;background:transparent;box-shadow:none;cursor:pointer;font-size:18px;text-align:center;border:1px solid #d3dbe2}.quantity-decrement{border-radius:3px 0 0 3px}.quantity-increment{border-radius:0 3px 3px 0}.quantity{color:black;width:38px;height:21px;font-size:12px;border:none;text-align:center;-moz-appearance:textfield;background:transparent;display:inline-block;padding:0;border-radius:0;border-top:1px solid #d3dbe2;border-bottom:1px solid #d3dbe2}input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none;margin:0}.option-select-wrapper{border:1px solid #d3dbe2;border-radius:3px;box-sizing:border-box;position:relative;background:#fff;overflow:hidden;vertical-align:bottom}.shopify-select-icon{cursor:pointer;display:block;fill:#798c9c;position:absolute;right:10px;top:50%;margin-top:-6px;pointer-events:none;width:12px;height:12px;vertical-align:middle}.option-select+.option-select{margin-top:7.5px}.option-select__label{display:block;font-size:14px;margin-top:15px;margin-bottom:5px}.option-select__select{font-size:inherit;padding:7px 10px;padding-right:32px;border:0;width:100%;background:transparent;-webkit-appearance:none;-moz-appearance:none}.product-wrapper{overflow:hidden}.product__variant-img{margin:0 auto 15px auto;transition:all 0.3s ease;opacity:1}.product__variant-img.is-transitioning{opacity:0}.product__title{font-size:18px;line-height:1.2;color:#4a4a4a;margin-bottom:0;font-weight:400}.product__variant-title{font-size:18px;color:#666;font-weight:400;margin-top:15px;text-align:center}.product__price{margin-top:15px}.layout-vertical{text-align:center}.product__actual-price{font-size:18px;color:#4a4a4a;display:block}.product__compare-price{font-size:18px;text-decoration:line-through;color:#a2a2a3;display:block}.product__variant-selectors{margin-top:15px;text-align:left}.quantity-container{display:inline-block}.quantity{font-size:15px;height:auto;padding-top:12px;padding-bottom:12px;border-left:1px solid #d3dbe2;border-top-left-radius:3px;border-bottom-left-radius:3px;line-height:1.2;margin-top:20px}.btn{display:block;margin:20px auto 0}.btn.beside-quantity{display:inline-block;vertical-align:top;border-top-left-radius:0;border-bottom-left-radius:0;border:1px solid transparent}.cart-item__quantity-container{margin-top:20px;display:inline-block}@media (min-width: 801px){.layout-horizontal .product-img-wrapper{float:left;margin-right:15px;width:50%}.layout-horizontal .product__title,.layout-horizontal .product__variant-title,.layout-horizontal .product__price,.layout-horizontal .quantity-container,.layout-horizontal .btn,.layout-horizontal .product__variant-selectors{overflow:hidden}}.collection-wrapper{overflow:hidden}.collection-products{display:flex;justify-content:center;flex-wrap:wrap;margin-left:-15px}@media (max-width: 600px){.collection-products{display:block}}.collection-product{margin-left:15px;margin-bottom:15px;flex:0 0 auto;display:inline-block} ';
styles.toggle = 'html,body,h1,h2,h3,h4,h5,p{padding:0;margin:0}*{box-sizing:border-box}html{font-family:"Helvetica Neue", Helvetica, Arial, sans-serif;font-size:14px;line-height:1.2;color:#31373d}ul{list-style:none;padding-left:0;margin:0}img{display:block;width:100%}input{-webkit-appearance:textfield;margin:0}.clearfix:after{content:"";display:table;clear:both}.visuallyhidden{border:0;height:1px;margin:-1px;overflow:hidden;padding:0;position:absolute;width:1px}.component-container{overflow:hidden}.type--center{text-align:center}.btn{color:#fff;font-size:15px;background:#95C13E;padding:12px 40px;letter-spacing:.3px;display:block;border-radius:3px;cursor:pointer;transition:background 200ms ease;max-width:100%;text-overflow:ellipsis;overflow:hidden;line-height:1.2;border:0;-moz-appearance:none;-webkit-appearance:none}.btn:hover,.btn:focus{background:#6C9319}.btn--parent{background-color:transparent;border:0;line-height:1;padding:0;cursor:pointer;-moz-appearance:none;-webkit-appearance:none}.btn--parent:hover .product__variant-image,.btn--parent:focus .product__variant-image{transition:all .3s ease;opacity:.7}.btn--test{position:absolute;top:50%;left:50%;transform:translate(-50%)}.btn--cart-tab{padding:5px 11px;border-radius:3px 0 0 3px;position:fixed;right:0;top:50%;transform:translate(100%, -50%);opacity:0;min-width:inherit;width:auto;height:auto;z-index:2147483647}.btn--cart-tab.is-active{transform:translateY(-50%);opacity:1}.btn__counter{display:block;margin:0 auto 10px auto;font-size:18px}.icon-cart--side{height:20px;width:20px}.btn[disabled]{background-color:#999}.btn--close{position:absolute;right:9px;top:8px;font-size:35px;color:#767676;border:none;background:transparent;transition:transform 100ms ease;cursor:pointer;padding-right:9px}.btn--close:hover{transform:scale(1.2);color:dimgray}.toggle-container{display:inline-block}.cart-toggle{background-color:#95C13E;color:#fff;border-radius:3px 0 0 3px;padding:8px 10px;text-align:center;display:inline-block;min-width:46px;margin-right:0;cursor:pointer;transition:background 200ms ease}.cart-toggle:hover{background-color:#6C9319}.cart-toggle__count{font-size:18px;margin-bottom:10px}.icon-cart__group{fill:#fff} ';
exports.default = styles;

},{}],128:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = ".modal-wrapper {\n  display: none; }\n  .modal-wrapper.is-active {\n    display: block;\n    opacity: 1;\n    margin-left: auto;\n    margin-right: auto; }\n";

},{}],129:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = ".shopify-buy-frame--cart {\n  display: none; }\n  .shopify-buy-frame--cart.is-active {\n    display: block; }\n";

},{}],130:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = ".shopify-buy-frame {\n  display: inline-block; }\n  .shopify-buy-frame iframe {\n    width: 100%;\n    display: block;\n    height: 0;\n    overflow: hidden; }\n\n.shopify-buy-frame--cart {\n  width: 100%;\n  max-width: 350px;\n  position: fixed;\n  top: 0;\n  right: 0;\n  height: 100%;\n  z-index: 2147483647;\n  transform: translateX(100%);\n  transition: all 250ms cubic-bezier(0.165, 0.84, 0.44, 1); }\n  .shopify-buy-frame--cart iframe {\n    height: 100%; }\n  .shopify-buy-frame--cart.is-active {\n    transform: translateX(0); }\n\n.shopify-buy-frame--product.layout-vertical iframe {\n  max-width: 250px; }\n\n.shopify-buy-frame--product.layout-horizontal {\n  display: block; }\n  .shopify-buy-frame--product.layout-horizontal iframe {\n    max-width: 950px; }\n\n.shopify-buy-frame--toggle {\n  position: fixed;\n  right: 0;\n  top: 50%;\n  transform: translateY(-50%);\n  max-width: 46px;\n  z-index: 2147483645;\n  display: none; }\n  .shopify-buy-frame--toggle.is-active {\n    display: block; }\n  .shopify-buy-frame--toggle iframe {\n    height: auto; }\n\n.shopify-buy-frame--productSet {\n  width: 100%; }\n\n.shopify-buy-frame--modal {\n  position: fixed;\n  width: 100%;\n  height: 100%;\n  top: 0;\n  left: 0;\n  z-index: 2147483646;\n  display: none;\n  transition: background 300ms ease; }\n  .shopify-buy-frame--modal iframe {\n    height: 100%;\n    width: 100%;\n    max-width: none; }\n  .shopify-buy-frame--modal.is-active {\n    background: rgba(0, 0, 0, 0.6); }\n  .shopify-buy-frame--modal.is-block {\n    display: block; }\n";

},{}],131:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _hogan = require('hogan.js');

var _hogan2 = _interopRequireDefault(_hogan);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Template = function () {
  function Template(templates, contents, order) {
    _classCallCheck(this, Template);

    this.templates = templates;
    this.contents = contents;
    this.order = order;
    this.templateFn = _hogan2.default.compile(this.masterTemplate);
  }

  Template.prototype.render = function render(data, cb) {
    var output = '' + this.templateFn.render(data);
    if (!cb) {
      return output;
    }
    return cb(output);
  };

  _createClass(Template, [{
    key: 'masterTemplate',
    get: function get() {
      var _this = this;

      return this.order.reduce(function (acc, key) {
        var string = '';
        if (_this.contents[key]) {
          string = _this.templates[key] || '';
        }
        return acc + string;
      }, '');
    }
  }]);

  return Template;
}();

exports.default = Template;

},{"hogan.js":41}],132:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var cartTemplates = {
  title: "<div class=\"{{data.classes.cart.header}}\">\n            <h2 class=\"{{data.classes.cart.title}}\">{{data.text.title}}</h2>\n            <button class=\"{{data.classes.cart.close}}\">\n              <span aria-role=\"hidden\">×</span>\n              <span class=\"visuallyhidden\">Close</span>\n             </button>\n          </div>",
  lineItems: "<div class=\"{{data.classes.cart.cartScroll}}\">\n                {{#data.isEmpty}}<p class=\"{{data.classes.cart.emptyCart}}\">{{data.text.empty}}</p>{{/data.isEmpty}}\n                <div class=\"{{data.classes.cart.lineItems}}\">{{{data.lineItemsHtml}}}</div>\n              </div>",
  footer: "<div class=\"{{data.classes.cart.footer}}\">\n            <p class=\"{{data.classes.cart.subtotalText}}\">{{data.text.total}}</p>\n            <p class=\"{{data.classes.cart.subtotal}}\"><span class=\"{{data.classes.currency}}\"></span>${{data.subtotal}}</p>\n            <p class=\"{{data.classes.cart.notice}}\">{{data.text.notice}}</p>\n            <button class=\"{{data.classes.cart.button}}\" type=\"button\">{{data.text.button}}</button>\n          </div>"
};

exports.default = cartTemplates;

},{}],133:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var lineItemTemplates = {
  image: '<img class="{{data.classes.lineItem.image}}" src="{{data.image.src}}" />',
  variantTitle: '<div class="{{data.classes.lineItem.variantTitle}}">{{data.variant_title}}</div>',

  title: '<span class="{{data.classes.lineItem.itemTitle}}">{{data.title}}</span>',
  price: '<span class="{{data.classes.lineItem.price}}">${{data.line_price}}</span>',
  quantity: '<div class="{{data.classes.lineItem.quantity}}">\n              <button class="{{data.classes.lineItem.quantityButton}} quantity-decrement" type="button" data-line-item-id="{{data.id}}"><span>-</span><span class="visuallyhidden">Decrement</span></button>\n              <input class="{{data.classes.lineItem.quantityInput}}" type="number" min="0" aria-label="Quantity" data-line-item-id="{{data.id}}" value="{{data.quantity}}">\n              <button class="{{data.classes.lineItem.quantityButton}} quantity-increment" type="button" data-line-item-id="{{data.id}}"><span>+</span><span class="visuallyhidden">Increment</span></button>\n            </div>'
};

exports.default = lineItemTemplates;

},{}],134:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var modalTemplates = {
  contents: "\n              <button class=\"{{data.classes.modal.close}}\">\n                <span aria-role=\"hidden\">×</span>\n                <span class=\"visuallyhidden\">Close</span>\n              </button>\n            "
};

exports.default = modalTemplates;

},{}],135:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var optionTemplates = {
  option: "<div class={{data.classes.option.option}}>\n    <label class=\"{{data.classes.option.label}}\">{{data.name}}</label>\n      <div class=\"{{data.classes.option.wrapper}}\">\n      <select class=\"{{data.classes.option.select}}\" name=\"{{data.name}}\">\n        {{#data.values}}\n          <option {{#disabled}}disabled{{/disabled}} {{#selected}}selected{{/selected}} value={{name}}>{{name}}</option>\n        {{/data.values}}\n      </select>\n      <svg class=\"shopify-select-icon\" viewBox=\"0 0 24 24\"><path d=\"M21 5.176l-9.086 9.353L3 5.176.686 7.647 12 19.382 23.314 7.647 21 5.176z\"></path></svg>\n    </div>\n  </div>"
};

exports.default = optionTemplates;

},{}],136:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var productTemplate = {
  img: '<div class="{{data.classes.product.imgWrapper}}" style="{{data.imgStyle}}"><img class="{{data.classes.product.img}}" data-src="{{data.currentImage.src}}" /></div>',
  title: '<h1 class="{{data.classes.product.title}}">{{data.title}}</h1>',
  variantTitle: '{{#data.hasVariants}}<h2 class="{{data.classes.product.variantTitle}}">{{data.selectedVariant.title}}</h2>{{/data.hasVariants}}',
  options: '{{#data.hasVariants}}<div class="{{data.classes.product.options}}">{{{data.optionsHtml}}}</div>{{/data.hasVariants}}',
  price: '<div class="{{data.classes.product.prices}}">\n            {{#data.selectedVariant}}\n            {{#data.selectedVariant.compareAtPrice}}<span class="{{data.classes.product.compareAt}}">${{data.selectedVariant.compareAtPrice}}</span>{{/data.selectedVariant.compareAtPrice}}\n            <span class="{{data.classes.product.price}} {{data.priceClass}}">${{data.selectedVariant.price}}</span>\n            {{/data.selectedVariant}}\n          </div>',
  description: '<div class="{{data.classes.product.description}}">{{{data.description}}}</div>',
  button: '<button {{#data.buttonDisabled}}disabled{{/data.buttonDisabled}} class="{{data.classes.product.button}} {{data.buttonClass}}">{{data.buttonText}}</button>',
  quantity: '<div class="{{data.classes.product.quantity}}">\n              {{#data.contents.quantityDecrement}}\n                <button class="{{data.classes.product.quantityButton}} {{data.classes.product.quantityDecrement}}" type="button"><span>-</span><span class="visuallyhidden">Decrement</span></button>\n              {{/data.contents.quantityDecrement}}\n              {{#data.contents.quantityInput}}\n                <input class="{{data.classes.product.quantityInput}}" type="number" min="0" aria-label="Quantity" value="{{data.selectedQuantity}}">\n              {{/data.contents.quantityInput}}\n              {{#data.contents.quantityIncrement}}\n                <button class="{{data.classes.product.quantityButton}} {{data.classes.product.quantityIncrement}}" type="button"><span>+</span><span class="visuallyhidden">Increment</span></button>\n              {{/data.contents.quantityIncrement}}\n             </div>'
};

exports.default = productTemplate;

},{}],137:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var stylesTemplate = '{{#selectors}}' + '{{#media}} {{media}} { {{/media}}' + '{{selector}} { ' + '{{#declarations}}' + '{{property}}: {{{value}}};' + '{{/declarations}}' + ' } ' + '{{#media}} } {{/media}}' + '{{/selectors}}';
exports.default = stylesTemplate;

},{}],138:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var toggleTemplates = {
  title: '<h5 class="{{data.classes.toggle.title}}">{{data.text.title}}</h5>',
  icon: '<svg xmlns="http://www.w3.org/2000/svg" class="{{data.classes.toggle.icon}}" viewBox="0 0 25 25" enable-background="new 0 0 25 25"><g class="{{data.classes.toggle.iconPath}}"><path d="M24.6 3.6c-.3-.4-.8-.6-1.3-.6h-18.4l-.1-.5c-.3-1.5-1.7-1.5-2.5-1.5h-1.3c-.6 0-1 .4-1 1s.4 1 1 1h1.8l3 13.6c.2 1.2 1.3 2.4 2.5 2.4h12.7c.6 0 1-.4 1-1s-.4-1-1-1h-12.7c-.2 0-.5-.4-.6-.8l-.2-1.2h12.6c1.3 0 2.3-1.4 2.5-2.4l2.4-7.4v-.2c.1-.5-.1-1-.4-1.4zm-4 8.5v.2c-.1.3-.4.8-.5.8h-13l-1.8-8.1h17.6l-2.3 7.1z"/><circle cx="9" cy="22" r="2"/><circle cx="19" cy="22" r="2"/></g></svg>',
  count: '<div class="{{data.classes.toggle.count}}">{{data.count}}</div>'
};

exports.default = toggleTemplates;

},{}],139:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _product = require('./components/product');

var _product2 = _interopRequireDefault(_product);

var _modal = require('./components/modal');

var _modal2 = _interopRequireDefault(_modal);

var _productSet = require('./components/product-set');

var _productSet2 = _interopRequireDefault(_productSet);

var _cart = require('./components/cart');

var _cart2 = _interopRequireDefault(_cart);

var _host = require('./styles/host/host');

var _host2 = _interopRequireDefault(_host);

var _conditional = require('./styles/host/conditional');

var _conditional2 = _interopRequireDefault(_conditional);

var _throttle = require('./utils/throttle');

var _throttle2 = _interopRequireDefault(_throttle);

var _detectFeatures = require('./utils/detect-features');

var _detectFeatures2 = _interopRequireDefault(_detectFeatures);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DATA_ATTRIBUTE = 'data-shopify-buy-ui';
var ESC_KEY = 27;

var UI = function () {
  function UI(client) {
    _classCallCheck(this, UI);

    this.client = client;
    this.iframeComponents = [];
    this.components = {
      product: [],
      cart: [],
      collection: [],
      productSet: [],
      modal: []
    };
    this.componentTypes = {
      product: _product2.default,
      cart: _cart2.default,
      collection: _productSet2.default,
      productSet: _productSet2.default
    };
    this._appendStyleTag();
    this._bindResize();
    this._bindHostClick();
    this._bindEsc();
  }

  UI.prototype.createCart = function createCart(config) {
    if (this.components.cart.length) {
      return Promise.resolve(this.components.cart[0]);
    } else {
      var cart = new _cart2.default(config, this.componentProps);
      this.components.cart.push(cart);
      return cart.init();
    }
  };

  UI.prototype.closeCart = function closeCart() {
    if (this.components.cart.length) {
      this.components.cart.forEach(function (cart) {
        if (cart.isVisible) {
          cart.close();
        }
      });
    }
  };

  UI.prototype.createModal = function createModal(config) {
    if (this.components.modal.length) {
      return this.components.modal[0];
    } else {
      var modal = new _modal2.default(config, this.componentProps);
      this.components.modal.push(modal);
      return modal;
    }
  };

  UI.prototype.closeModal = function closeModal() {
    if (this.components.modal.length) {
      this.components.modal.forEach(function (modal) {
        return modal.close();
      });
    }
  };

  UI.prototype.createComponent = function createComponent(type, config) {
    config.node = config.node || this._queryEntryNode();
    var component = new this.componentTypes[type](config, this.componentProps);
    this.components[type].push(component);
    return component.init();
  };

  UI.prototype.destroyComponent = function destroyComponent(type, id) {
    var _this = this;

    this.components[type].forEach(function (component, index) {
      if (!component.model.id === id) {
        return;
      }
      _this.components[type][index].destroy();
      _this.components[type].splice(index, 1);
    });
  };

  UI.prototype._queryEntryNode = function _queryEntryNode() {
    this.entry = this.entry || window.document.querySelectorAll('script[' + DATA_ATTRIBUTE + ']')[0];
    this.entry.removeAttribute(DATA_ATTRIBUTE);

    var div = document.createElement('div');
    this.entry.parentNode.insertBefore(div, this.entry);
    return div;
  };

  UI.prototype._appendStyleTag = function _appendStyleTag() {
    var styleTag = document.createElement('style');
    if (styleTag.styleSheet) {
      styleTag.styleSheet.cssText = this.styleText;
    } else {
      styleTag.appendChild(document.createTextNode(this.styleText));
    }
    document.head.appendChild(styleTag);
  };

  UI.prototype._bindHostClick = function _bindHostClick() {
    var _this2 = this;

    document.addEventListener('click', function () {
      _this2.closeCart();
    });
  };

  UI.prototype._bindResize = function _bindResize() {
    var _this3 = this;

    (0, _throttle2.default)('resize', 'safeResize');
    window.addEventListener('safeResize', function () {
      _this3.components.collection.forEach(function (collection) {
        return collection.resize();
      });
      _this3.components.productSet.forEach(function (set) {
        return set.resize();
      });
    });
  };

  UI.prototype._bindEsc = function _bindEsc() {
    var _this4 = this;

    window.addEventListener('keydown', function (evt) {
      if (evt.keyCode !== ESC_KEY) {
        return;
      }
      _this4.closeModal();
      _this4.closeCart();
    });
  };

  _createClass(UI, [{
    key: 'componentProps',
    get: function get() {
      return {
        client: this.client,
        createCart: this.createCart.bind(this),
        closeCart: this.closeCart.bind(this),
        createModal: this.createModal.bind(this),
        closeModal: this.closeModal.bind(this),
        browserFeatures: _detectFeatures2.default
      };
    }
  }, {
    key: 'styleText',
    get: function get() {
      if (_detectFeatures2.default.transition && _detectFeatures2.default.transform && _detectFeatures2.default.animation) {
        return _host2.default;
      }
      return _host2.default + _conditional2.default;
    }
  }]);

  return UI;
}();

exports.default = UI;

},{"./components/cart":118,"./components/modal":120,"./components/product":122,"./components/product-set":121,"./styles/host/conditional":129,"./styles/host/host":130,"./utils/detect-features":140,"./utils/throttle":145}],140:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
function detectCSSFeature(featurename) {
  var feature = false,
      domPrefixes = 'Webkit Moz ms O'.split(' '),
      elm = document.createElement('div'),
      featurenameCapital = null;

  featurename = featurename.toLowerCase();

  if (elm.style[featurename] !== undefined) {
    feature = true;
  }

  if (feature === false) {
    featurenameCapital = featurename.charAt(0).toUpperCase() + featurename.substr(1);
    for (var i = 0; i < domPrefixes.length; i++) {
      if (elm.style[domPrefixes[i] + featurenameCapital] !== undefined) {
        feature = true;
        break;
      }
    }
  }
  return feature;
}

var supportsAnimations = function supportsAnimations() {
  return detectCSSFeature('animation');
};

var supportsTransitions = function supportsTransitions() {
  return detectCSSFeature('transition');
};

var supportsTransforms = function supportsTransforms() {
  return detectCSSFeature('transform');
};

exports.default = {
  animation: supportsAnimations(),
  transition: supportsTransitions(),
  transform: supportsTransforms()
};

},{}],141:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addClassToElement = addClassToElement;
exports.removeClassFromElement = removeClassFromElement;
function addClassToElement(className, element) {
  if (element.classList) {
    element.classList.add(className);
  } else {
    element.className += ' ' + className;
  }
}

function removeClassFromElement(className, element) {
  if (element.classList) {
    element.classList.remove(className);
  } else {
    element.className = element.className.replace(className, '');
  }
}

},{}],142:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var frameUtils = {};

var lastTime = 0;
var vendors = ['ms', 'moz', 'webkit', 'o'];
if (window.requestAnimationFrame && window.cancelAnimationFrame) {
  frameUtils.requestAnimationFrame = window.requestAnimationFrame;
  frameUtils.cancelAnimationFrame = window.cancelAnimationFrame;
} else {
  for (var x = 0; x < vendors.length && !frameUtils.requestAnimationFrame; ++x) {
    frameUtils.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
    frameUtils.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
  }

  if (!frameUtils.requestAnimationFrame) frameUtils.requestAnimationFrame = function (callback, element) {
    var currTime = new Date().getTime();
    var timeToCall = Math.max(0, 16 - (currTime - lastTime));
    var id = window.setTimeout(function () {
      callback(currTime + timeToCall);
    }, timeToCall);
    lastTime = currTime + timeToCall;
    return id;
  };

  if (!frameUtils.cancelAnimationFrame) frameUtils.cancelAnimationFrame = function (id) {
    clearTimeout(id);
  };
}

exports.default = frameUtils;

},{}],143:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = isFunction;
function isFunction(obj) {
  return !!(obj && obj.constructor && obj.call && obj.apply);
};

},{}],144:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
function isObject(value) {
  return Object.prototype.toString.call(value) === '[object Object]';
}

function merge(target) {
  for (var _len = arguments.length, sources = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    sources[_key - 1] = arguments[_key];
  }

  sources.forEach(function (source) {
    if (source) {
      Object.keys(source).forEach(function (key) {
        if (Object.prototype.toString.call(source[key]) === '[object Object]') {
          target[key] = merge(target[key] || {}, source[key]);
        } else {
          target[key] = source[key];
        }
      });
    }
  });
  return target;
}

exports.default = merge;

},{}],145:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _frameUtils = require('./frame-utils');

var _frameUtils2 = _interopRequireDefault(_frameUtils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function CustomEvent(event, params) {
  params = params || { bubbles: false, cancelable: false, detail: undefined };
  var evt = document.createEvent('CustomEvent');
  evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
  return evt;
};

CustomEvent.prototype = window.Event.prototype;

var throttle = function throttle(type, name, obj) {
  obj = obj || window;
  var running = false;
  var func = function func() {
    if (running) {
      return;
    }
    running = true;
    _frameUtils2.default.requestAnimationFrame.call(window, function () {
      obj.dispatchEvent(new CustomEvent(name));
      running = false;
    });
  };
  obj.addEventListener(type, func);
};

exports.default = throttle;

},{"./frame-utils":142}],146:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var windowUtils = {
  location: function location() {
    return window.location.href;
  }
};

exports.default = windowUtils;

},{}],147:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var collectionJSON = { "product_listings": [{ "product_id": 3614411907, "created_at": "2015-11-07T18:54:10-05:00", "updated_at": "2016-07-11T10:25:44-04:00", "body_html": "<p class=\"p1\"><span class=\"s1\">6 Panel Hat - Unisex</span></p>\n<p class=\"p1\"><span class=\"s1\">Cap made out of 100% Virgin Wool</span></p>\n<p class=\"p1\"><span class=\"s1\">Brim made out of 100% Cotton Twill</span></p>\n<p class=\"p1\"><span class=\"s1\">Adjustable leather back strap</span></p>\n<p class=\"p2\"> </p>", "handle": "6-panel-lumberjack", "product_type": "hats", "title": "6 Panel - Lumberjack", "vendor": "Embeds", "available": true, "tags": "hats", "published_at": "2015-11-07T18:54:10-05:00", "images": [{ "id": 7395367811, "created_at": "2015-11-07T19:46:26-05:00", "position": 1, "updated_at": "2015-11-07T19:46:26-05:00", "product_id": 3614411907, "src": "https:\/\/cdn.shopify.com\/s\/files\/1\/1019\/0495\/products\/i1.jpg?v=1446943586", "variant_ids": [10493283203] }, { "id": 7395368515, "created_at": "2015-11-07T19:46:27-05:00", "position": 2, "updated_at": "2015-11-07T19:46:27-05:00", "product_id": 3614411907, "src": "https:\/\/cdn.shopify.com\/s\/files\/1\/1019\/0495\/products\/i2.jpg?v=1446943587", "variant_ids": [10493296963] }, { "id": 7395368771, "created_at": "2015-11-07T19:46:29-05:00", "position": 3, "updated_at": "2015-11-07T19:46:29-05:00", "product_id": 3614411907, "src": "https:\/\/cdn.shopify.com\/s\/files\/1\/1019\/0495\/products\/i3.jpg?v=1446943589", "variant_ids": [10493297027] }], "options": [{ "id": 4368043395, "name": "Color", "product_id": 3614411907, "position": 1 }], "variants": [{ "id": 10493283203, "title": "Green", "option_values": [{ "option_id": 4368043395, "name": "Color", "value": "Green" }], "price": "32.00", "compare_at_price": null, "grams": 0, "requires_shipping": true, "sku": "", "barcode": "", "taxable": true, "position": 1, "available": true, "created_at": "2015-11-07T18:54:10-05:00", "updated_at": "2015-11-07T19:46:58-05:00" }, { "id": 10493296963, "title": "Blue", "option_values": [{ "option_id": 4368043395, "name": "Color", "value": "Blue" }], "price": "32.00", "compare_at_price": null, "grams": 0, "requires_shipping": true, "sku": "", "barcode": "", "taxable": true, "position": 2, "available": true, "created_at": "2015-11-07T18:55:22-05:00", "updated_at": "2015-11-07T19:47:05-05:00" }, { "id": 10493297027, "title": "Black", "option_values": [{ "option_id": 4368043395, "name": "Color", "value": "Black" }], "price": "32.00", "compare_at_price": null, "grams": 0, "requires_shipping": true, "sku": "", "barcode": "", "taxable": true, "position": 3, "available": true, "created_at": "2015-11-07T18:55:22-05:00", "updated_at": "2015-11-07T19:47:10-05:00" }] }, { "product_id": 3614436099, "created_at": "2015-11-07T18:57:43-05:00", "updated_at": "2016-07-11T10:25:36-04:00", "body_html": "<p class=\"p1\"><span class=\"s1\">6 Panel Hat - Unisex</span></p>\n<p class=\"p1\"><span class=\"s1\">Cap made out of 100% Virgin Wool</span></p>\n<p class=\"p1\"><span class=\"s1\">Brim made out of 100% Cotton Twill</span></p>\n<p class=\"p1\"><span class=\"s1\">Adjustable leather back strap</span></p>", "handle": "6-panel-aztec", "product_type": "hats", "title": "6 Panel – Aztec", "vendor": "Embeds", "available": true, "tags": "hats", "published_at": "2015-11-07T18:57:43-05:00", "images": [{ "id": 7395355523, "created_at": "2015-11-07T19:45:28-05:00", "position": 1, "updated_at": "2015-11-07T19:45:28-05:00", "product_id": 3614436099, "src": "https:\/\/cdn.shopify.com\/s\/files\/1\/1019\/0495\/products\/i5.jpg?v=1446943528", "variant_ids": [10493405315] }, { "id": 7395356163, "created_at": "2015-11-07T19:45:30-05:00", "position": 2, "updated_at": "2015-11-07T19:45:30-05:00", "product_id": 3614436099, "src": "https:\/\/cdn.shopify.com\/s\/files\/1\/1019\/0495\/products\/i6.jpg?v=1446943530", "variant_ids": [10493410627] }, { "id": 7395356547, "created_at": "2015-11-07T19:45:31-05:00", "position": 3, "updated_at": "2015-11-07T19:45:31-05:00", "product_id": 3614436099, "src": "https:\/\/cdn.shopify.com\/s\/files\/1\/1019\/0495\/products\/i7.jpg?v=1446943531", "variant_ids": [10493410563] }], "options": [{ "id": 4368081987, "name": "Color", "product_id": 3614436099, "position": 1 }], "variants": [{ "id": 10493405315, "title": "Black", "option_values": [{ "option_id": 4368081987, "name": "Color", "value": "Black" }], "price": "32.00", "compare_at_price": null, "grams": 0, "requires_shipping": true, "sku": "", "barcode": "", "taxable": true, "position": 1, "available": true, "created_at": "2015-11-07T18:57:43-05:00", "updated_at": "2016-08-08T00:44:41-04:00" }, { "id": 10493410563, "title": "Green", "option_values": [{ "option_id": 4368081987, "name": "Color", "value": "Green" }], "price": "32.00", "compare_at_price": null, "grams": 0, "requires_shipping": true, "sku": "", "barcode": "", "taxable": true, "position": 2, "available": true, "created_at": "2015-11-07T18:58:10-05:00", "updated_at": "2016-08-08T00:44:40-04:00" }, { "id": 10493410627, "title": "Red", "option_values": [{ "option_id": 4368081987, "name": "Color", "value": "Red" }], "price": "32.00", "compare_at_price": null, "grams": 0, "requires_shipping": true, "sku": "", "barcode": "", "taxable": true, "position": 3, "available": true, "created_at": "2015-11-07T18:58:10-05:00", "updated_at": "2016-06-14T11:04:32-04:00" }] }, { "product_id": 3614470467, "created_at": "2015-11-07T19:04:49-05:00", "updated_at": "2016-07-11T10:25:27-04:00", "body_html": "<p class=\"p1\"><span class=\"s1\">6 Panel Hat - Unisex</span></p>\n<p class=\"p1\"><span class=\"s1\">Cap made out of 100% Virgin Wool</span></p>\n<p class=\"p1\"><span class=\"s1\">Brim made out of 100% Cotton Twill</span></p>\n<p class=\"p1\"><span class=\"s1\">Adjustable leather back strap</span></p>", "handle": "6-panel-hunter", "product_type": "hats", "title": "6 Panel – Hunter", "vendor": "Embeds", "available": true, "tags": "hats", "published_at": "2015-11-07T19:04:49-05:00", "images": [{ "id": 7395334787, "created_at": "2015-11-07T19:44:09-05:00", "position": 1, "updated_at": "2015-11-07T19:44:09-05:00", "product_id": 3614470467, "src": "https:\/\/cdn.shopify.com\/s\/files\/1\/1019\/0495\/products\/i8.jpg?v=1446943449", "variant_ids": [10493524355] }, { "id": 7395335491, "created_at": "2015-11-07T19:44:14-05:00", "position": 2, "updated_at": "2015-11-07T19:44:14-05:00", "product_id": 3614470467, "src": "https:\/\/cdn.shopify.com\/s\/files\/1\/1019\/0495\/products\/i9.jpg?v=1446943454", "variant_ids": [10493524291] }, { "id": 7395336899, "created_at": "2015-11-07T19:44:17-05:00", "position": 3, "updated_at": "2015-11-07T19:44:17-05:00", "product_id": 3614470467, "src": "https:\/\/cdn.shopify.com\/s\/files\/1\/1019\/0495\/products\/i10.jpg?v=1446943457", "variant_ids": [10493524227] }], "options": [{ "id": 4368142211, "name": "Color", "product_id": 3614470467, "position": 1 }], "variants": [{ "id": 10493524227, "title": "Blue", "option_values": [{ "option_id": 4368142211, "name": "Color", "value": "Blue" }], "price": "32.00", "compare_at_price": null, "grams": 0, "requires_shipping": true, "sku": "", "barcode": "", "taxable": true, "position": 1, "available": true, "created_at": "2015-11-07T19:04:49-05:00", "updated_at": "2015-11-07T19:49:16-05:00" }, { "id": 10493524291, "title": "Red", "option_values": [{ "option_id": 4368142211, "name": "Color", "value": "Red" }], "price": "32.00", "compare_at_price": null, "grams": 0, "requires_shipping": true, "sku": "", "barcode": "", "taxable": true, "position": 2, "available": true, "created_at": "2015-11-07T19:04:49-05:00", "updated_at": "2016-04-02T15:03:30-04:00" }, { "id": 10493524355, "title": "Black", "option_values": [{ "option_id": 4368142211, "name": "Color", "value": "Black" }], "price": "32.00", "compare_at_price": null, "grams": 0, "requires_shipping": true, "sku": "", "barcode": "", "taxable": true, "position": 3, "available": true, "created_at": "2015-11-07T19:04:49-05:00", "updated_at": "2015-11-07T19:49:16-05:00" }] }, { "product_id": 3614811395, "created_at": "2015-11-07T19:48:39-05:00", "updated_at": "2016-07-11T10:25:11-04:00", "body_html": "<meta charset=\"utf-8\">\n<p class=\"p1\"><span class=\"s1\">6 Panel Hat - Unisex</span></p>\n<p class=\"p1\"><span class=\"s1\">Cap made out of 100% Virgin Wool</span></p>\n<p class=\"p1\"><span class=\"s1\">Brim made out of 100% Cotton Twill</span></p>\n<p class=\"p1\"><span class=\"s1\">Adjustable leather back strap</span></p>\n<p class=\"p2\"> </p>", "handle": "6-panel-racer", "product_type": "hats", "title": "6 Panel – Racer", "vendor": "Embeds", "available": true, "tags": "hats", "published_at": "2015-11-07T19:48:39-05:00", "images": [{ "id": 7395390147, "created_at": "2015-11-07T19:48:40-05:00", "position": 1, "updated_at": "2015-11-07T19:48:40-05:00", "product_id": 3614811395, "src": "https:\/\/cdn.shopify.com\/s\/files\/1\/1019\/0495\/products\/i11.jpg?v=1446943720", "variant_ids": [10494465091] }, { "id": 7395390403, "created_at": "2015-11-07T19:48:42-05:00", "position": 2, "updated_at": "2015-11-07T19:48:42-05:00", "product_id": 3614811395, "src": "https:\/\/cdn.shopify.com\/s\/files\/1\/1019\/0495\/products\/i12.jpg?v=1446943722", "variant_ids": [10494465027] }], "options": [{ "id": 4368660995, "name": "Color", "product_id": 3614811395, "position": 1 }], "variants": [{ "id": 10494465027, "title": "Purple", "option_values": [{ "option_id": 4368660995, "name": "Color", "value": "Purple" }], "price": "32.00", "compare_at_price": null, "grams": 0, "requires_shipping": true, "sku": "", "barcode": "", "taxable": true, "position": 1, "available": true, "created_at": "2015-11-07T19:48:39-05:00", "updated_at": "2015-11-07T19:48:51-05:00" }, { "id": 10494465091, "title": "Red", "option_values": [{ "option_id": 4368660995, "name": "Color", "value": "Red" }], "price": "32.00", "compare_at_price": null, "grams": 0, "requires_shipping": true, "sku": "", "barcode": "", "taxable": true, "position": 2, "available": true, "created_at": "2015-11-07T19:48:39-05:00", "updated_at": "2015-11-07T19:48:57-05:00" }] }] };
exports.default = collectionJSON;

},{}],148:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var productJSON = { "product_listing": { "product_id": 6640244678, "created_at": "2016-06-06T19:50:43-04:00", "updated_at": "2016-07-21T09:25:26-04:00", "body_html": "<p>What's cuter than a Sockness Monster wearing socks? Baby Sockness Monsters wearing socks. Our knee high Sockness Monster was such a hit that we decided to create an ankle version. The only problem: how to fit a whole monster on an ankle sock. Solution: put baby monsters on the ankle sock!</p>\n<p>56% cotton, 42% polyester, 2% spandex.  Made in Korea.</p>", "handle": "ankle-socks", "product_type": "", "title": "Ankle socks", "vendor": "Embeds", "available": true, "tags": "", "published_at": "2016-06-06T19:50:43-04:00", "images": [{ "id": 12780243142, "created_at": "2016-06-06T19:50:44-04:00", "position": 1, "updated_at": "2016-06-06T19:50:44-04:00", "product_id": 6640244678, "src": "https:\/\/cdn.shopify.com\/s\/files\/1\/1019\/0495\/products\/sharek.jpg?v=1465257044", "variant_ids": [20984900806, 20984923078] }, { "id": 12780246150, "created_at": "2016-06-06T19:51:00-04:00", "position": 2, "updated_at": "2016-06-06T19:51:00-04:00", "product_id": 6640244678, "src": "https:\/\/cdn.shopify.com\/s\/files\/1\/1019\/0495\/products\/sloth.jpg?v=1465257060", "variant_ids": [20984830918, 20984917574, 20984923270] }, { "id": 12780247046, "created_at": "2016-06-06T19:51:02-04:00", "position": 3, "updated_at": "2016-06-06T19:51:02-04:00", "product_id": 6640244678, "src": "https:\/\/cdn.shopify.com\/s\/files\/1\/1019\/0495\/products\/water.jpg?v=1465257062", "variant_ids": [20984831046, 20984917638] }, { "id": 12780361606, "created_at": "2016-06-06T19:56:50-04:00", "position": 4, "updated_at": "2016-06-06T19:56:50-04:00", "product_id": 6640244678, "src": "https:\/\/cdn.shopify.com\/s\/files\/1\/1019\/0495\/products\/dino2.JPG?v=1465257410", "variant_ids": [] }, { "id": 12780362502, "created_at": "2016-06-06T19:56:52-04:00", "position": 5, "updated_at": "2016-06-06T19:56:52-04:00", "product_id": 6640244678, "src": "https:\/\/cdn.shopify.com\/s\/files\/1\/1019\/0495\/products\/shark2.jpg?v=1465257412", "variant_ids": [] }, { "id": 12780363014, "created_at": "2016-06-06T19:56:54-04:00", "position": 6, "updated_at": "2016-06-06T19:56:54-04:00", "product_id": 6640244678, "src": "https:\/\/cdn.shopify.com\/s\/files\/1\/1019\/0495\/products\/sloth2.JPG?v=1465257414", "variant_ids": [] }], "options": [{ "id": 7989736070, "name": "Print", "product_id": 6640244678, "position": 1 }, { "id": 7989744518, "name": "Size", "product_id": 6640244678, "position": 2 }], "variants": [{ "id": 20984830918, "title": "sloth \/ small", "option_values": [{ "option_id": 7989736070, "name": "Print", "value": "sloth" }, { "option_id": 7989744518, "name": "Size", "value": "small" }], "price": "10.00", "compare_at_price": "14.99", "grams": 0, "requires_shipping": true, "sku": "", "barcode": "", "taxable": true, "position": 1, "available": true, "created_at": "2016-06-06T19:50:43-04:00", "updated_at": "2016-07-21T09:25:26-04:00" }, { "id": 20984917574, "title": "sloth \/ medium", "option_values": [{ "option_id": 7989736070, "name": "Print", "value": "sloth" }, { "option_id": 7989744518, "name": "Size", "value": "medium" }], "price": "10.00", "compare_at_price": null, "grams": 0, "requires_shipping": true, "sku": "", "barcode": "", "taxable": true, "position": 2, "available": true, "created_at": "2016-06-06T19:53:48-04:00", "updated_at": "2016-06-06T19:53:57-04:00" }, { "id": 20984923270, "title": "sloth \/ large", "option_values": [{ "option_id": 7989736070, "name": "Print", "value": "sloth" }, { "option_id": 7989744518, "name": "Size", "value": "large" }], "price": "10.00", "compare_at_price": null, "grams": 0, "requires_shipping": true, "sku": "", "barcode": "", "taxable": true, "position": 3, "available": true, "created_at": "2016-06-06T19:54:18-04:00", "updated_at": "2016-06-14T18:12:39-04:00" }, { "id": 20984831046, "title": "dinosaur \/ small", "option_values": [{ "option_id": 7989736070, "name": "Print", "value": "dinosaur" }, { "option_id": 7989744518, "name": "Size", "value": "small" }], "price": "10.00", "compare_at_price": null, "grams": 0, "requires_shipping": true, "sku": "", "barcode": "", "taxable": true, "position": 4, "available": true, "created_at": "2016-06-06T19:50:43-04:00", "updated_at": "2016-06-14T18:12:39-04:00" }, { "id": 20984917638, "title": "dinosaur \/ medium", "option_values": [{ "option_id": 7989736070, "name": "Print", "value": "dinosaur" }, { "option_id": 7989744518, "name": "Size", "value": "medium" }], "price": "10.00", "compare_at_price": null, "grams": 0, "requires_shipping": true, "sku": "", "barcode": "", "taxable": true, "position": 5, "available": true, "created_at": "2016-06-06T19:53:48-04:00", "updated_at": "2016-06-14T18:12:39-04:00" }, { "id": 20984923334, "title": "dinosaur \/ large", "option_values": [{ "option_id": 7989736070, "name": "Print", "value": "dinosaur" }, { "option_id": 7989744518, "name": "Size", "value": "large" }], "price": "10.00", "compare_at_price": null, "grams": 0, "requires_shipping": true, "sku": "", "barcode": "", "taxable": true, "position": 6, "available": true, "created_at": "2016-06-06T19:54:18-04:00", "updated_at": "2016-06-14T18:12:39-04:00" }, { "id": 20984900806, "title": "shark \/ medium", "option_values": [{ "option_id": 7989736070, "name": "Print", "value": "shark" }, { "option_id": 7989744518, "name": "Size", "value": "medium" }], "price": "5.00", "compare_at_price": "10.00", "grams": 0, "requires_shipping": true, "sku": "", "barcode": "", "taxable": true, "position": 7, "available": true, "created_at": "2016-06-06T19:53:03-04:00", "updated_at": "2016-06-14T18:12:39-04:00" }, { "id": 20984923078, "title": "shark \/ large", "option_values": [{ "option_id": 7989736070, "name": "Print", "value": "shark" }, { "option_id": 7989744518, "name": "Size", "value": "large" }], "price": "5.00", "compare_at_price": "10.00", "grams": 0, "requires_shipping": true, "sku": "", "barcode": "", "taxable": true, "position": 8, "available": true, "created_at": "2016-06-06T19:54:18-04:00", "updated_at": "2016-06-14T18:12:39-04:00" }] } };

exports.default = productJSON;

},{}],149:[function(require,module,exports){
'use strict';

var _chai = require('chai');

var _chai2 = _interopRequireDefault(_chai);

var _sinon = require('sinon');

var _sinon2 = _interopRequireDefault(_sinon);

require('./integration/shopify-buy-ui');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

window.chai = _chai2.default;
window.sinon = _sinon2.default;

window.assert = _chai2.default.assert;

_sinon2.default.assert.expose(_chai2.default.assert, { prefix: '' });

},{"./integration/shopify-buy-ui":150,"chai":4,"sinon":85}],150:[function(require,module,exports){
'use strict';

var _shopifyBuyUi = require('../../src/shopify-buy-ui');

var _shopifyBuyUi2 = _interopRequireDefault(_shopifyBuyUi);

var _ui = require('../../src/ui');

var _ui2 = _interopRequireDefault(_ui);

var _product = require('../fixtures/pretender/product');

var _product2 = _interopRequireDefault(_product);

var _collection = require('../fixtures/pretender/collection');

var _collection2 = _interopRequireDefault(_collection);

var _fetchPretender = require('fetch-pretender');

var _fetchPretender2 = _interopRequireDefault(_fetchPretender);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var config = {
  id: 6640244678
};

var client = _shopifyBuyUi2.default.buildClient({
  apiKey: 'abc123',
  domain: 'embeds.myshopify.com',
  appId: '6'
});

var fancyOptions = {
  cart: {
    styles: {
      button: {
        'background-color': 'rgb(0, 0, 0)'
      }
    }
  },
  product: {
    buttonDestination: 'modal',
    contents: {
      image: false
    },
    order: ['title', 'variantTitle', 'options', 'quantity', 'button', 'price'],
    templates: {
      button: '<button class="fancy-button {{data.classes.product.button}}">{{data.buttonText}}</button>'
    },
    text: {
      button: 'BUY SOCKS'
    },
    styles: {
      button: {
        'background-color': 'rgb(255, 0, 255)'
      },
      title: {
        'font-size': '88px',
        'margin-top': '200px'
      }
    }
  }
};

var product = void 0;
var ui = void 0;
var server = void 0;

describe('ShopifyBuy.UI', function () {
  before(function () {
    server = new _fetchPretender2.default();
    server.get('https://embeds.myshopify.com/api/apps/6/product_listings/6640244678', function (request) {
      return [200, { "Content-Type": "application/json" }, JSON.stringify(_product2.default)];
    });
    server.unhandledRequest = function (verb, path, request) {
      console.warn('unhandled path: ' + path);
    };
  });

  beforeEach(function () {
    config.node = document.createElement('div');
    config.node.setAttribute('id', 'fixture');
    document.body.appendChild(config.node);
  });

  afterEach(function () {
    document.body.removeChild(config.node);
    config.node = null;
    product = null;
    _shopifyBuyUi2.default.UI.ui = null;
  });

  after(function () {
    server.shutdown();
  });

  describe('init', function () {
    beforeEach(function () {
      ui = _shopifyBuyUi2.default.UI.init(client);
    });

    afterEach(function () {
      _shopifyBuyUi2.default.UI.ui = null;
    });

    it('creates an instance of ShopifyBuy.UI', function () {
      assert.instanceOf(ui, _ui2.default);
    });
  });

  describe('createComponent', function () {
    describe('with no customization', function () {
      beforeEach(function (done) {
        ui = _shopifyBuyUi2.default.UI.init(client);
        ui.createComponent('product', config).then(function (prod) {
          product = prod;
          done();
        });
      });

      it('renders a product', function () {
        var fixture = document.getElementById('fixture');
        var iframe = fixture.children[0];
        assert.include(iframe.contentDocument.body.innerHTML, 'Ankle socks');
      });
    });

    describe('with much customization', function () {
      beforeEach(function (done) {
        ui = _shopifyBuyUi2.default.UI.init(client);
        config.options = fancyOptions;

        ui.createComponent('product', config).then(function (prod) {
          product = prod;
          done();
        });
      });

      it('has the correct DOM', function () {
        var children = product.wrapper.children[0].children;
        var img = product.wrapper.getElementsByTagName('img');
        var button = product.wrapper.getElementsByClassName(product.classes.product.button)[0];
        var buttonColor = getComputedStyle(button, null).getPropertyValue('background-color');
        assert.lengthOf(img, 0, 'image is not present if contents.image is false');
        assert.include(children[children.length - 1].className, product.classes.product.prices, 'order is dictated by order array');
        assert.include(button.innerHTML, 'BUY SOCKS', 'button text is replaced by text.button');
        assert.include(button.className, 'fancy-button', 'button template is replaced by template.button');
        assert.include(buttonColor, '255, 0, 255', 'button styles are overridden by styles.button');
      });

      it('has a cart that has the correct DOM', function () {
        var button = product.cart.wrapper.getElementsByClassName(product.cart.classes.cart.button)[0];
        var buttonColor = getComputedStyle(button, null).getPropertyValue('background-color');
        assert.include(buttonColor, 'rgb(0, 0, 0)', 'cart button styles are overridden');
      });

      describe('with buttonDestination set to modal', function () {
        var modal = void 0;

        beforeEach(function (done) {
          product.openModal().then(function (productModal) {
            modal = product.modal;
            done();
          });
        });

        afterEach(function () {
          ui.closeModal();
          modal = null;
        });

        it('has a modal that has the correct DOM', function () {
          var title = modal.wrapper.getElementsByClassName(modal.classes.product.title)[0];
          var titleStyles = getComputedStyle(title, null);
          var titleSize = titleStyles.getPropertyValue('font-size');
          var marginSize = titleStyles.getPropertyValue('margin-top');
          assert.equal(titleSize, '88px', 'it transfers non-layout styles to modal product');
          assert.notEqual(marginSize, '200px', 'it does not transfer layout styles to modal product');
        });
      });
    });
  });
});

},{"../../src/shopify-buy-ui":126,"../../src/ui":139,"../fixtures/pretender/collection":147,"../fixtures/pretender/product":148,"fetch-pretender":37}]},{},[149]);
