(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.DemoGraph1ClientStandAlone = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict'

exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function placeHoldersCount (b64) {
  var len = b64.length
  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // the number of equal signs (place holders)
  // if there are two placeholders, than the two characters before it
  // represent one byte
  // if there is only one, then the three characters before it represent 2 bytes
  // this is just a cheap hack to not do indexOf twice
  return b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0
}

function byteLength (b64) {
  // base64 is 4/3 + up to two characters of the original data
  return b64.length * 3 / 4 - placeHoldersCount(b64)
}

function toByteArray (b64) {
  var i, j, l, tmp, placeHolders, arr
  var len = b64.length
  placeHolders = placeHoldersCount(b64)

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

},{}],2:[function(require,module,exports){

},{}],3:[function(require,module,exports){
(function (global){
'use strict';

var buffer = require('buffer');
var Buffer = buffer.Buffer;
var SlowBuffer = buffer.SlowBuffer;
var MAX_LEN = buffer.kMaxLength || 2147483647;
exports.alloc = function alloc(size, fill, encoding) {
  if (typeof Buffer.alloc === 'function') {
    return Buffer.alloc(size, fill, encoding);
  }
  if (typeof encoding === 'number') {
    throw new TypeError('encoding must not be number');
  }
  if (typeof size !== 'number') {
    throw new TypeError('size must be a number');
  }
  if (size > MAX_LEN) {
    throw new RangeError('size is too large');
  }
  var enc = encoding;
  var _fill = fill;
  if (_fill === undefined) {
    enc = undefined;
    _fill = 0;
  }
  var buf = new Buffer(size);
  if (typeof _fill === 'string') {
    var fillBuf = new Buffer(_fill, enc);
    var flen = fillBuf.length;
    var i = -1;
    while (++i < size) {
      buf[i] = fillBuf[i % flen];
    }
  } else {
    buf.fill(_fill);
  }
  return buf;
}
exports.allocUnsafe = function allocUnsafe(size) {
  if (typeof Buffer.allocUnsafe === 'function') {
    return Buffer.allocUnsafe(size);
  }
  if (typeof size !== 'number') {
    throw new TypeError('size must be a number');
  }
  if (size > MAX_LEN) {
    throw new RangeError('size is too large');
  }
  return new Buffer(size);
}
exports.from = function from(value, encodingOrOffset, length) {
  if (typeof Buffer.from === 'function' && (!global.Uint8Array || Uint8Array.from !== Buffer.from)) {
    return Buffer.from(value, encodingOrOffset, length);
  }
  if (typeof value === 'number') {
    throw new TypeError('"value" argument must not be a number');
  }
  if (typeof value === 'string') {
    return new Buffer(value, encodingOrOffset);
  }
  if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
    var offset = encodingOrOffset;
    if (arguments.length === 1) {
      return new Buffer(value);
    }
    if (typeof offset === 'undefined') {
      offset = 0;
    }
    var len = length;
    if (typeof len === 'undefined') {
      len = value.byteLength - offset;
    }
    if (offset >= value.byteLength) {
      throw new RangeError('\'offset\' is out of bounds');
    }
    if (len > value.byteLength - offset) {
      throw new RangeError('\'length\' is out of bounds');
    }
    return new Buffer(value.slice(offset, offset + len));
  }
  if (Buffer.isBuffer(value)) {
    var out = new Buffer(value.length);
    value.copy(out, 0, 0, value.length);
    return out;
  }
  if (value) {
    if (Array.isArray(value) || (typeof ArrayBuffer !== 'undefined' && value.buffer instanceof ArrayBuffer) || 'length' in value) {
      return new Buffer(value);
    }
    if (value.type === 'Buffer' && Array.isArray(value.data)) {
      return new Buffer(value.data);
    }
  }

  throw new TypeError('First argument must be a string, Buffer, ' + 'ArrayBuffer, Array, or array-like object.');
}
exports.allocUnsafeSlow = function allocUnsafeSlow(size) {
  if (typeof Buffer.allocUnsafeSlow === 'function') {
    return Buffer.allocUnsafeSlow(size);
  }
  if (typeof size !== 'number') {
    throw new TypeError('size must be a number');
  }
  if (size >= MAX_LEN) {
    throw new RangeError('size is too large');
  }
  return new SlowBuffer(size);
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"buffer":4}],4:[function(require,module,exports){
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

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

var K_MAX_LENGTH = 0x7fffffff
exports.kMaxLength = K_MAX_LENGTH

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Print warning and recommend using `buffer` v4.x which has an Object
 *               implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * We report that the browser does not support typed arrays if the are not subclassable
 * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
 * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
 * for __proto__ and has a buggy typed array implementation.
 */
Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport()

if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' &&
    typeof console.error === 'function') {
  console.error(
    'This browser lacks typed array (Uint8Array) support which is required by ' +
    '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.'
  )
}

function typedArraySupport () {
  // Can typed array instances can be augmented?
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = {__proto__: Uint8Array.prototype, foo: function () { return 42 }}
    return arr.foo() === 42
  } catch (e) {
    return false
  }
}

function createBuffer (length) {
  if (length > K_MAX_LENGTH) {
    throw new RangeError('Invalid typed array length')
  }
  // Return an augmented `Uint8Array` instance
  var buf = new Uint8Array(length)
  buf.__proto__ = Buffer.prototype
  return buf
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
  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new Error(
        'If encoding is specified then the first argument must be a string'
      )
    }
    return allocUnsafe(arg)
  }
  return from(arg, encodingOrOffset, length)
}

// Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
if (typeof Symbol !== 'undefined' && Symbol.species &&
    Buffer[Symbol.species] === Buffer) {
  Object.defineProperty(Buffer, Symbol.species, {
    value: null,
    configurable: true,
    enumerable: false,
    writable: false
  })
}

Buffer.poolSize = 8192 // not used by this implementation

function from (value, encodingOrOffset, length) {
  if (typeof value === 'number') {
    throw new TypeError('"value" argument must not be a number')
  }

  if (value instanceof ArrayBuffer) {
    return fromArrayBuffer(value, encodingOrOffset, length)
  }

  if (typeof value === 'string') {
    return fromString(value, encodingOrOffset)
  }

  return fromObject(value)
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
  return from(value, encodingOrOffset, length)
}

// Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
// https://github.com/feross/buffer/pull/148
Buffer.prototype.__proto__ = Uint8Array.prototype
Buffer.__proto__ = Uint8Array

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be a number')
  } else if (size < 0) {
    throw new RangeError('"size" argument must not be negative')
  }
}

function alloc (size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(size).fill(fill, encoding)
      : createBuffer(size).fill(fill)
  }
  return createBuffer(size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(size, fill, encoding)
}

function allocUnsafe (size) {
  assertSize(size)
  return createBuffer(size < 0 ? 0 : checked(size) | 0)
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(size)
}

function fromString (string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('"encoding" must be a valid string encoding')
  }

  var length = byteLength(string, encoding) | 0
  var buf = createBuffer(length)

  var actual = buf.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    buf = buf.slice(0, actual)
  }

  return buf
}

function fromArrayLike (array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  var buf = createBuffer(length)
  for (var i = 0; i < length; i += 1) {
    buf[i] = array[i] & 255
  }
  return buf
}

function fromArrayBuffer (array, byteOffset, length) {
  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('\'offset\' is out of bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('\'length\' is out of bounds')
  }

  var buf
  if (byteOffset === undefined && length === undefined) {
    buf = new Uint8Array(array)
  } else if (length === undefined) {
    buf = new Uint8Array(array, byteOffset)
  } else {
    buf = new Uint8Array(array, byteOffset, length)
  }

  // Return an augmented `Uint8Array` instance
  buf.__proto__ = Buffer.prototype
  return buf
}

function fromObject (obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    var buf = createBuffer(len)

    if (buf.length === 0) {
      return buf
    }

    obj.copy(buf, 0, 0, len)
    return buf
  }

  if (obj) {
    if (ArrayBuffer.isView(obj) || 'length' in obj) {
      if (typeof obj.length !== 'number' || isnan(obj.length)) {
        return createBuffer(0)
      }
      return fromArrayLike(obj)
    }

    if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
      return fromArrayLike(obj.data)
    }
  }

  throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
}

function checked (length) {
  // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= K_MAX_LENGTH) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes')
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
  return b != null && b._isBuffer === true
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
  if (!Array.isArray(list)) {
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
  if (ArrayBuffer.isView(string) || string instanceof ArrayBuffer) {
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

// This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
// to detect a Buffer instance. It's not possible to use `instanceof Buffer`
// reliably in a browserify context because there could be multiple different
// copies of the 'buffer' package in use. This method works even for Buffer
// instances that were created from another copy of the `buffer` package.
// See: https://github.com/feross/buffer/issues/154
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
  var length = this.length
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
    if (typeof Uint8Array.prototype.indexOf === 'function') {
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
    offset = offset >>> 0
    if (isFinite(length)) {
      length = length >>> 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
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
    res += String.fromCharCode(bytes[i] + (bytes[i + 1] * 256))
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

  var newBuf = this.subarray(start, end)
  // Return an augmented `Uint8Array` instance
  newBuf.__proto__ = Buffer.prototype
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
  offset = offset >>> 0
  byteLength = byteLength >>> 0
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
  offset = offset >>> 0
  byteLength = byteLength >>> 0
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
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
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
  offset = offset >>> 0
  byteLength = byteLength >>> 0
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
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  offset = offset >>> 0
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
  offset = offset >>> 0
  byteLength = byteLength >>> 0
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
  offset = offset >>> 0
  byteLength = byteLength >>> 0
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
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset + 3] = (value >>> 24)
  this[offset + 2] = (value >>> 16)
  this[offset + 1] = (value >>> 8)
  this[offset] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

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
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

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
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  this[offset + 2] = (value >>> 16)
  this[offset + 3] = (value >>> 24)
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
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
  value = +value
  offset = offset >>> 0
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
  } else if (len < 1000) {
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
      : new Buffer(val, encoding)
    var len = bytes.length
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g

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

},{"base64-js":1,"ieee754":8}],5:[function(require,module,exports){
module.exports = {
  "100": "Continue",
  "101": "Switching Protocols",
  "102": "Processing",
  "200": "OK",
  "201": "Created",
  "202": "Accepted",
  "203": "Non-Authoritative Information",
  "204": "No Content",
  "205": "Reset Content",
  "206": "Partial Content",
  "207": "Multi-Status",
  "208": "Already Reported",
  "226": "IM Used",
  "300": "Multiple Choices",
  "301": "Moved Permanently",
  "302": "Found",
  "303": "See Other",
  "304": "Not Modified",
  "305": "Use Proxy",
  "307": "Temporary Redirect",
  "308": "Permanent Redirect",
  "400": "Bad Request",
  "401": "Unauthorized",
  "402": "Payment Required",
  "403": "Forbidden",
  "404": "Not Found",
  "405": "Method Not Allowed",
  "406": "Not Acceptable",
  "407": "Proxy Authentication Required",
  "408": "Request Timeout",
  "409": "Conflict",
  "410": "Gone",
  "411": "Length Required",
  "412": "Precondition Failed",
  "413": "Payload Too Large",
  "414": "URI Too Long",
  "415": "Unsupported Media Type",
  "416": "Range Not Satisfiable",
  "417": "Expectation Failed",
  "418": "I'm a teapot",
  "421": "Misdirected Request",
  "422": "Unprocessable Entity",
  "423": "Locked",
  "424": "Failed Dependency",
  "425": "Unordered Collection",
  "426": "Upgrade Required",
  "428": "Precondition Required",
  "429": "Too Many Requests",
  "431": "Request Header Fields Too Large",
  "451": "Unavailable For Legal Reasons",
  "500": "Internal Server Error",
  "501": "Not Implemented",
  "502": "Bad Gateway",
  "503": "Service Unavailable",
  "504": "Gateway Timeout",
  "505": "HTTP Version Not Supported",
  "506": "Variant Also Negotiates",
  "507": "Insufficient Storage",
  "508": "Loop Detected",
  "509": "Bandwidth Limit Exceeded",
  "510": "Not Extended",
  "511": "Network Authentication Required"
}

},{}],6:[function(require,module,exports){
(function (Buffer){
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

// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.

function isArray(arg) {
  if (Array.isArray) {
    return Array.isArray(arg);
  }
  return objectToString(arg) === '[object Array]';
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
  return objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return (objectToString(e) === '[object Error]' || e instanceof Error);
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

exports.isBuffer = Buffer.isBuffer;

function objectToString(o) {
  return Object.prototype.toString.call(o);
}

}).call(this,{"isBuffer":require("../../is-buffer/index.js")})

},{"../../is-buffer/index.js":10}],7:[function(require,module,exports){
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

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        // At least give some kind of context to the user
        var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
        err.context = er;
        throw err;
      }
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    args = Array.prototype.slice.call(arguments, 1);
    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else if (listeners) {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.prototype.listenerCount = function(type) {
  if (this._events) {
    var evlistener = this._events[type];

    if (isFunction(evlistener))
      return 1;
    else if (evlistener)
      return evlistener.length;
  }
  return 0;
};

EventEmitter.listenerCount = function(emitter, type) {
  return emitter.listenerCount(type);
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],8:[function(require,module,exports){
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

},{}],9:[function(require,module,exports){
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

},{}],10:[function(require,module,exports){
/*!
 * Determine if an object is a Buffer
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */

// The _isBuffer check is for Safari 5-7 support, because it's missing
// Object.prototype.constructor. Remove this eventually
module.exports = function (obj) {
  return obj != null && (isBuffer(obj) || isSlowBuffer(obj) || !!obj._isBuffer)
}

function isBuffer (obj) {
  return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
}

// For Node v0.10 support. Remove this eventually.
function isSlowBuffer (obj) {
  return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isBuffer(obj.slice(0, 0))
}

},{}],11:[function(require,module,exports){
var toString = {}.toString;

module.exports = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
};

},{}],12:[function(require,module,exports){
(function (process){
'use strict';

if (!process.version ||
    process.version.indexOf('v0.') === 0 ||
    process.version.indexOf('v1.') === 0 && process.version.indexOf('v1.8.') !== 0) {
  module.exports = nextTick;
} else {
  module.exports = process.nextTick;
}

function nextTick(fn, arg1, arg2, arg3) {
  if (typeof fn !== 'function') {
    throw new TypeError('"callback" argument must be a function');
  }
  var len = arguments.length;
  var args, i;
  switch (len) {
  case 0:
  case 1:
    return process.nextTick(fn);
  case 2:
    return process.nextTick(function afterTickOne() {
      fn.call(null, arg1);
    });
  case 3:
    return process.nextTick(function afterTickTwo() {
      fn.call(null, arg1, arg2);
    });
  case 4:
    return process.nextTick(function afterTickThree() {
      fn.call(null, arg1, arg2, arg3);
    });
  default:
    args = new Array(len - 1);
    i = 0;
    while (i < args.length) {
      args[i++] = arguments[i];
    }
    return process.nextTick(function afterTick() {
      fn.apply(null, args);
    });
  }
}

}).call(this,require('_process'))

},{"_process":13}],13:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
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
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
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

},{}],14:[function(require,module,exports){
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

},{}],15:[function(require,module,exports){
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

},{}],16:[function(require,module,exports){
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

},{}],17:[function(require,module,exports){
'use strict';

exports.decode = exports.parse = require('./decode');
exports.encode = exports.stringify = require('./encode');

},{"./decode":15,"./encode":16}],18:[function(require,module,exports){
// a duplex stream is just a stream that is both readable and writable.
// Since JS doesn't have multiple prototypal inheritance, this class
// prototypally inherits from Readable, and then parasitically from
// Writable.

'use strict';

/*<replacement>*/

var objectKeys = Object.keys || function (obj) {
  var keys = [];
  for (var key in obj) {
    keys.push(key);
  }return keys;
};
/*</replacement>*/

module.exports = Duplex;

/*<replacement>*/
var processNextTick = require('process-nextick-args');
/*</replacement>*/

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

var Readable = require('./_stream_readable');
var Writable = require('./_stream_writable');

util.inherits(Duplex, Readable);

var keys = objectKeys(Writable.prototype);
for (var v = 0; v < keys.length; v++) {
  var method = keys[v];
  if (!Duplex.prototype[method]) Duplex.prototype[method] = Writable.prototype[method];
}

function Duplex(options) {
  if (!(this instanceof Duplex)) return new Duplex(options);

  Readable.call(this, options);
  Writable.call(this, options);

  if (options && options.readable === false) this.readable = false;

  if (options && options.writable === false) this.writable = false;

  this.allowHalfOpen = true;
  if (options && options.allowHalfOpen === false) this.allowHalfOpen = false;

  this.once('end', onend);
}

// the no-half-open enforcer
function onend() {
  // if we allow half-open state, or if the writable side ended,
  // then we're ok.
  if (this.allowHalfOpen || this._writableState.ended) return;

  // no more data can be written.
  // But allow more writes to happen in this tick.
  processNextTick(onEndNT, this);
}

function onEndNT(self) {
  self.end();
}

function forEach(xs, f) {
  for (var i = 0, l = xs.length; i < l; i++) {
    f(xs[i], i);
  }
}
},{"./_stream_readable":20,"./_stream_writable":22,"core-util-is":6,"inherits":9,"process-nextick-args":12}],19:[function(require,module,exports){
// a passthrough stream.
// basically just the most minimal sort of Transform stream.
// Every written chunk gets output as-is.

'use strict';

module.exports = PassThrough;

var Transform = require('./_stream_transform');

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

util.inherits(PassThrough, Transform);

function PassThrough(options) {
  if (!(this instanceof PassThrough)) return new PassThrough(options);

  Transform.call(this, options);
}

PassThrough.prototype._transform = function (chunk, encoding, cb) {
  cb(null, chunk);
};
},{"./_stream_transform":21,"core-util-is":6,"inherits":9}],20:[function(require,module,exports){
(function (process){
'use strict';

module.exports = Readable;

/*<replacement>*/
var processNextTick = require('process-nextick-args');
/*</replacement>*/

/*<replacement>*/
var isArray = require('isarray');
/*</replacement>*/

/*<replacement>*/
var Duplex;
/*</replacement>*/

Readable.ReadableState = ReadableState;

/*<replacement>*/
var EE = require('events').EventEmitter;

var EElistenerCount = function (emitter, type) {
  return emitter.listeners(type).length;
};
/*</replacement>*/

/*<replacement>*/
var Stream;
(function () {
  try {
    Stream = require('st' + 'ream');
  } catch (_) {} finally {
    if (!Stream) Stream = require('events').EventEmitter;
  }
})();
/*</replacement>*/

var Buffer = require('buffer').Buffer;
/*<replacement>*/
var bufferShim = require('buffer-shims');
/*</replacement>*/

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

/*<replacement>*/
var debugUtil = require('util');
var debug = void 0;
if (debugUtil && debugUtil.debuglog) {
  debug = debugUtil.debuglog('stream');
} else {
  debug = function () {};
}
/*</replacement>*/

var BufferList = require('./internal/streams/BufferList');
var StringDecoder;

util.inherits(Readable, Stream);

function prependListener(emitter, event, fn) {
  // Sadly this is not cacheable as some libraries bundle their own
  // event emitter implementation with them.
  if (typeof emitter.prependListener === 'function') {
    return emitter.prependListener(event, fn);
  } else {
    // This is a hack to make sure that our error handler is attached before any
    // userland ones.  NEVER DO THIS. This is here only because this code needs
    // to continue to work with older versions of Node.js that do not include
    // the prependListener() method. The goal is to eventually remove this hack.
    if (!emitter._events || !emitter._events[event]) emitter.on(event, fn);else if (isArray(emitter._events[event])) emitter._events[event].unshift(fn);else emitter._events[event] = [fn, emitter._events[event]];
  }
}

function ReadableState(options, stream) {
  Duplex = Duplex || require('./_stream_duplex');

  options = options || {};

  // object stream flag. Used to make read(n) ignore n and to
  // make all the buffer merging and length checks go away
  this.objectMode = !!options.objectMode;

  if (stream instanceof Duplex) this.objectMode = this.objectMode || !!options.readableObjectMode;

  // the point at which it stops calling _read() to fill the buffer
  // Note: 0 is a valid value, means "don't call _read preemptively ever"
  var hwm = options.highWaterMark;
  var defaultHwm = this.objectMode ? 16 : 16 * 1024;
  this.highWaterMark = hwm || hwm === 0 ? hwm : defaultHwm;

  // cast to ints.
  this.highWaterMark = ~~this.highWaterMark;

  // A linked list is used to store data chunks instead of an array because the
  // linked list can remove elements from the beginning faster than
  // array.shift()
  this.buffer = new BufferList();
  this.length = 0;
  this.pipes = null;
  this.pipesCount = 0;
  this.flowing = null;
  this.ended = false;
  this.endEmitted = false;
  this.reading = false;

  // a flag to be able to tell if the onwrite cb is called immediately,
  // or on a later tick.  We set this to true at first, because any
  // actions that shouldn't happen until "later" should generally also
  // not happen before the first write call.
  this.sync = true;

  // whenever we return null, then we set a flag to say
  // that we're awaiting a 'readable' event emission.
  this.needReadable = false;
  this.emittedReadable = false;
  this.readableListening = false;
  this.resumeScheduled = false;

  // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.
  this.defaultEncoding = options.defaultEncoding || 'utf8';

  // when piping, we only care about 'readable' events that happen
  // after read()ing all the bytes and not getting any pushback.
  this.ranOut = false;

  // the number of writers that are awaiting a drain event in .pipe()s
  this.awaitDrain = 0;

  // if true, a maybeReadMore has been scheduled
  this.readingMore = false;

  this.decoder = null;
  this.encoding = null;
  if (options.encoding) {
    if (!StringDecoder) StringDecoder = require('string_decoder/').StringDecoder;
    this.decoder = new StringDecoder(options.encoding);
    this.encoding = options.encoding;
  }
}

function Readable(options) {
  Duplex = Duplex || require('./_stream_duplex');

  if (!(this instanceof Readable)) return new Readable(options);

  this._readableState = new ReadableState(options, this);

  // legacy
  this.readable = true;

  if (options && typeof options.read === 'function') this._read = options.read;

  Stream.call(this);
}

// Manually shove something into the read() buffer.
// This returns true if the highWaterMark has not been hit yet,
// similar to how Writable.write() returns true if you should
// write() some more.
Readable.prototype.push = function (chunk, encoding) {
  var state = this._readableState;

  if (!state.objectMode && typeof chunk === 'string') {
    encoding = encoding || state.defaultEncoding;
    if (encoding !== state.encoding) {
      chunk = bufferShim.from(chunk, encoding);
      encoding = '';
    }
  }

  return readableAddChunk(this, state, chunk, encoding, false);
};

// Unshift should *always* be something directly out of read()
Readable.prototype.unshift = function (chunk) {
  var state = this._readableState;
  return readableAddChunk(this, state, chunk, '', true);
};

Readable.prototype.isPaused = function () {
  return this._readableState.flowing === false;
};

function readableAddChunk(stream, state, chunk, encoding, addToFront) {
  var er = chunkInvalid(state, chunk);
  if (er) {
    stream.emit('error', er);
  } else if (chunk === null) {
    state.reading = false;
    onEofChunk(stream, state);
  } else if (state.objectMode || chunk && chunk.length > 0) {
    if (state.ended && !addToFront) {
      var e = new Error('stream.push() after EOF');
      stream.emit('error', e);
    } else if (state.endEmitted && addToFront) {
      var _e = new Error('stream.unshift() after end event');
      stream.emit('error', _e);
    } else {
      var skipAdd;
      if (state.decoder && !addToFront && !encoding) {
        chunk = state.decoder.write(chunk);
        skipAdd = !state.objectMode && chunk.length === 0;
      }

      if (!addToFront) state.reading = false;

      // Don't add to the buffer if we've decoded to an empty string chunk and
      // we're not in object mode
      if (!skipAdd) {
        // if we want the data now, just emit it.
        if (state.flowing && state.length === 0 && !state.sync) {
          stream.emit('data', chunk);
          stream.read(0);
        } else {
          // update the buffer info.
          state.length += state.objectMode ? 1 : chunk.length;
          if (addToFront) state.buffer.unshift(chunk);else state.buffer.push(chunk);

          if (state.needReadable) emitReadable(stream);
        }
      }

      maybeReadMore(stream, state);
    }
  } else if (!addToFront) {
    state.reading = false;
  }

  return needMoreData(state);
}

// if it's past the high water mark, we can push in some more.
// Also, if we have no data yet, we can stand some
// more bytes.  This is to work around cases where hwm=0,
// such as the repl.  Also, if the push() triggered a
// readable event, and the user called read(largeNumber) such that
// needReadable was set, then we ought to push more, so that another
// 'readable' event will be triggered.
function needMoreData(state) {
  return !state.ended && (state.needReadable || state.length < state.highWaterMark || state.length === 0);
}

// backwards compatibility.
Readable.prototype.setEncoding = function (enc) {
  if (!StringDecoder) StringDecoder = require('string_decoder/').StringDecoder;
  this._readableState.decoder = new StringDecoder(enc);
  this._readableState.encoding = enc;
  return this;
};

// Don't raise the hwm > 8MB
var MAX_HWM = 0x800000;
function computeNewHighWaterMark(n) {
  if (n >= MAX_HWM) {
    n = MAX_HWM;
  } else {
    // Get the next highest power of 2 to prevent increasing hwm excessively in
    // tiny amounts
    n--;
    n |= n >>> 1;
    n |= n >>> 2;
    n |= n >>> 4;
    n |= n >>> 8;
    n |= n >>> 16;
    n++;
  }
  return n;
}

// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function howMuchToRead(n, state) {
  if (n <= 0 || state.length === 0 && state.ended) return 0;
  if (state.objectMode) return 1;
  if (n !== n) {
    // Only flow one buffer at a time
    if (state.flowing && state.length) return state.buffer.head.data.length;else return state.length;
  }
  // If we're asking for more than the current hwm, then raise the hwm.
  if (n > state.highWaterMark) state.highWaterMark = computeNewHighWaterMark(n);
  if (n <= state.length) return n;
  // Don't have enough
  if (!state.ended) {
    state.needReadable = true;
    return 0;
  }
  return state.length;
}

// you can override either this method, or the async _read(n) below.
Readable.prototype.read = function (n) {
  debug('read', n);
  n = parseInt(n, 10);
  var state = this._readableState;
  var nOrig = n;

  if (n !== 0) state.emittedReadable = false;

  // if we're doing read(0) to trigger a readable event, but we
  // already have a bunch of data in the buffer, then just trigger
  // the 'readable' event and move on.
  if (n === 0 && state.needReadable && (state.length >= state.highWaterMark || state.ended)) {
    debug('read: emitReadable', state.length, state.ended);
    if (state.length === 0 && state.ended) endReadable(this);else emitReadable(this);
    return null;
  }

  n = howMuchToRead(n, state);

  // if we've ended, and we're now clear, then finish it up.
  if (n === 0 && state.ended) {
    if (state.length === 0) endReadable(this);
    return null;
  }

  // All the actual chunk generation logic needs to be
  // *below* the call to _read.  The reason is that in certain
  // synthetic stream cases, such as passthrough streams, _read
  // may be a completely synchronous operation which may change
  // the state of the read buffer, providing enough data when
  // before there was *not* enough.
  //
  // So, the steps are:
  // 1. Figure out what the state of things will be after we do
  // a read from the buffer.
  //
  // 2. If that resulting state will trigger a _read, then call _read.
  // Note that this may be asynchronous, or synchronous.  Yes, it is
  // deeply ugly to write APIs this way, but that still doesn't mean
  // that the Readable class should behave improperly, as streams are
  // designed to be sync/async agnostic.
  // Take note if the _read call is sync or async (ie, if the read call
  // has returned yet), so that we know whether or not it's safe to emit
  // 'readable' etc.
  //
  // 3. Actually pull the requested chunks out of the buffer and return.

  // if we need a readable event, then we need to do some reading.
  var doRead = state.needReadable;
  debug('need readable', doRead);

  // if we currently have less than the highWaterMark, then also read some
  if (state.length === 0 || state.length - n < state.highWaterMark) {
    doRead = true;
    debug('length less than watermark', doRead);
  }

  // however, if we've ended, then there's no point, and if we're already
  // reading, then it's unnecessary.
  if (state.ended || state.reading) {
    doRead = false;
    debug('reading or ended', doRead);
  } else if (doRead) {
    debug('do read');
    state.reading = true;
    state.sync = true;
    // if the length is currently zero, then we *need* a readable event.
    if (state.length === 0) state.needReadable = true;
    // call internal read method
    this._read(state.highWaterMark);
    state.sync = false;
    // If _read pushed data synchronously, then `reading` will be false,
    // and we need to re-evaluate how much data we can return to the user.
    if (!state.reading) n = howMuchToRead(nOrig, state);
  }

  var ret;
  if (n > 0) ret = fromList(n, state);else ret = null;

  if (ret === null) {
    state.needReadable = true;
    n = 0;
  } else {
    state.length -= n;
  }

  if (state.length === 0) {
    // If we have nothing in the buffer, then we want to know
    // as soon as we *do* get something into the buffer.
    if (!state.ended) state.needReadable = true;

    // If we tried to read() past the EOF, then emit end on the next tick.
    if (nOrig !== n && state.ended) endReadable(this);
  }

  if (ret !== null) this.emit('data', ret);

  return ret;
};

function chunkInvalid(state, chunk) {
  var er = null;
  if (!Buffer.isBuffer(chunk) && typeof chunk !== 'string' && chunk !== null && chunk !== undefined && !state.objectMode) {
    er = new TypeError('Invalid non-string/buffer chunk');
  }
  return er;
}

function onEofChunk(stream, state) {
  if (state.ended) return;
  if (state.decoder) {
    var chunk = state.decoder.end();
    if (chunk && chunk.length) {
      state.buffer.push(chunk);
      state.length += state.objectMode ? 1 : chunk.length;
    }
  }
  state.ended = true;

  // emit 'readable' now to make sure it gets picked up.
  emitReadable(stream);
}

// Don't emit readable right away in sync mode, because this can trigger
// another read() call => stack overflow.  This way, it might trigger
// a nextTick recursion warning, but that's not so bad.
function emitReadable(stream) {
  var state = stream._readableState;
  state.needReadable = false;
  if (!state.emittedReadable) {
    debug('emitReadable', state.flowing);
    state.emittedReadable = true;
    if (state.sync) processNextTick(emitReadable_, stream);else emitReadable_(stream);
  }
}

function emitReadable_(stream) {
  debug('emit readable');
  stream.emit('readable');
  flow(stream);
}

// at this point, the user has presumably seen the 'readable' event,
// and called read() to consume some data.  that may have triggered
// in turn another _read(n) call, in which case reading = true if
// it's in progress.
// However, if we're not ended, or reading, and the length < hwm,
// then go ahead and try to read some more preemptively.
function maybeReadMore(stream, state) {
  if (!state.readingMore) {
    state.readingMore = true;
    processNextTick(maybeReadMore_, stream, state);
  }
}

function maybeReadMore_(stream, state) {
  var len = state.length;
  while (!state.reading && !state.flowing && !state.ended && state.length < state.highWaterMark) {
    debug('maybeReadMore read 0');
    stream.read(0);
    if (len === state.length)
      // didn't get any data, stop spinning.
      break;else len = state.length;
  }
  state.readingMore = false;
}

// abstract method.  to be overridden in specific implementation classes.
// call cb(er, data) where data is <= n in length.
// for virtual (non-string, non-buffer) streams, "length" is somewhat
// arbitrary, and perhaps not very meaningful.
Readable.prototype._read = function (n) {
  this.emit('error', new Error('_read() is not implemented'));
};

Readable.prototype.pipe = function (dest, pipeOpts) {
  var src = this;
  var state = this._readableState;

  switch (state.pipesCount) {
    case 0:
      state.pipes = dest;
      break;
    case 1:
      state.pipes = [state.pipes, dest];
      break;
    default:
      state.pipes.push(dest);
      break;
  }
  state.pipesCount += 1;
  debug('pipe count=%d opts=%j', state.pipesCount, pipeOpts);

  var doEnd = (!pipeOpts || pipeOpts.end !== false) && dest !== process.stdout && dest !== process.stderr;

  var endFn = doEnd ? onend : cleanup;
  if (state.endEmitted) processNextTick(endFn);else src.once('end', endFn);

  dest.on('unpipe', onunpipe);
  function onunpipe(readable) {
    debug('onunpipe');
    if (readable === src) {
      cleanup();
    }
  }

  function onend() {
    debug('onend');
    dest.end();
  }

  // when the dest drains, it reduces the awaitDrain counter
  // on the source.  This would be more elegant with a .once()
  // handler in flow(), but adding and removing repeatedly is
  // too slow.
  var ondrain = pipeOnDrain(src);
  dest.on('drain', ondrain);

  var cleanedUp = false;
  function cleanup() {
    debug('cleanup');
    // cleanup event handlers once the pipe is broken
    dest.removeListener('close', onclose);
    dest.removeListener('finish', onfinish);
    dest.removeListener('drain', ondrain);
    dest.removeListener('error', onerror);
    dest.removeListener('unpipe', onunpipe);
    src.removeListener('end', onend);
    src.removeListener('end', cleanup);
    src.removeListener('data', ondata);

    cleanedUp = true;

    // if the reader is waiting for a drain event from this
    // specific writer, then it would cause it to never start
    // flowing again.
    // So, if this is awaiting a drain, then we just call it now.
    // If we don't know, then assume that we are waiting for one.
    if (state.awaitDrain && (!dest._writableState || dest._writableState.needDrain)) ondrain();
  }

  // If the user pushes more data while we're writing to dest then we'll end up
  // in ondata again. However, we only want to increase awaitDrain once because
  // dest will only emit one 'drain' event for the multiple writes.
  // => Introduce a guard on increasing awaitDrain.
  var increasedAwaitDrain = false;
  src.on('data', ondata);
  function ondata(chunk) {
    debug('ondata');
    increasedAwaitDrain = false;
    var ret = dest.write(chunk);
    if (false === ret && !increasedAwaitDrain) {
      // If the user unpiped during `dest.write()`, it is possible
      // to get stuck in a permanently paused state if that write
      // also returned false.
      // => Check whether `dest` is still a piping destination.
      if ((state.pipesCount === 1 && state.pipes === dest || state.pipesCount > 1 && indexOf(state.pipes, dest) !== -1) && !cleanedUp) {
        debug('false write response, pause', src._readableState.awaitDrain);
        src._readableState.awaitDrain++;
        increasedAwaitDrain = true;
      }
      src.pause();
    }
  }

  // if the dest has an error, then stop piping into it.
  // however, don't suppress the throwing behavior for this.
  function onerror(er) {
    debug('onerror', er);
    unpipe();
    dest.removeListener('error', onerror);
    if (EElistenerCount(dest, 'error') === 0) dest.emit('error', er);
  }

  // Make sure our error handler is attached before userland ones.
  prependListener(dest, 'error', onerror);

  // Both close and finish should trigger unpipe, but only once.
  function onclose() {
    dest.removeListener('finish', onfinish);
    unpipe();
  }
  dest.once('close', onclose);
  function onfinish() {
    debug('onfinish');
    dest.removeListener('close', onclose);
    unpipe();
  }
  dest.once('finish', onfinish);

  function unpipe() {
    debug('unpipe');
    src.unpipe(dest);
  }

  // tell the dest that it's being piped to
  dest.emit('pipe', src);

  // start the flow if it hasn't been started already.
  if (!state.flowing) {
    debug('pipe resume');
    src.resume();
  }

  return dest;
};

function pipeOnDrain(src) {
  return function () {
    var state = src._readableState;
    debug('pipeOnDrain', state.awaitDrain);
    if (state.awaitDrain) state.awaitDrain--;
    if (state.awaitDrain === 0 && EElistenerCount(src, 'data')) {
      state.flowing = true;
      flow(src);
    }
  };
}

Readable.prototype.unpipe = function (dest) {
  var state = this._readableState;

  // if we're not piping anywhere, then do nothing.
  if (state.pipesCount === 0) return this;

  // just one destination.  most common case.
  if (state.pipesCount === 1) {
    // passed in one, but it's not the right one.
    if (dest && dest !== state.pipes) return this;

    if (!dest) dest = state.pipes;

    // got a match.
    state.pipes = null;
    state.pipesCount = 0;
    state.flowing = false;
    if (dest) dest.emit('unpipe', this);
    return this;
  }

  // slow case. multiple pipe destinations.

  if (!dest) {
    // remove all.
    var dests = state.pipes;
    var len = state.pipesCount;
    state.pipes = null;
    state.pipesCount = 0;
    state.flowing = false;

    for (var i = 0; i < len; i++) {
      dests[i].emit('unpipe', this);
    }return this;
  }

  // try to find the right one.
  var index = indexOf(state.pipes, dest);
  if (index === -1) return this;

  state.pipes.splice(index, 1);
  state.pipesCount -= 1;
  if (state.pipesCount === 1) state.pipes = state.pipes[0];

  dest.emit('unpipe', this);

  return this;
};

// set up data events if they are asked for
// Ensure readable listeners eventually get something
Readable.prototype.on = function (ev, fn) {
  var res = Stream.prototype.on.call(this, ev, fn);

  if (ev === 'data') {
    // Start flowing on next tick if stream isn't explicitly paused
    if (this._readableState.flowing !== false) this.resume();
  } else if (ev === 'readable') {
    var state = this._readableState;
    if (!state.endEmitted && !state.readableListening) {
      state.readableListening = state.needReadable = true;
      state.emittedReadable = false;
      if (!state.reading) {
        processNextTick(nReadingNextTick, this);
      } else if (state.length) {
        emitReadable(this, state);
      }
    }
  }

  return res;
};
Readable.prototype.addListener = Readable.prototype.on;

function nReadingNextTick(self) {
  debug('readable nexttick read 0');
  self.read(0);
}

// pause() and resume() are remnants of the legacy readable stream API
// If the user uses them, then switch into old mode.
Readable.prototype.resume = function () {
  var state = this._readableState;
  if (!state.flowing) {
    debug('resume');
    state.flowing = true;
    resume(this, state);
  }
  return this;
};

function resume(stream, state) {
  if (!state.resumeScheduled) {
    state.resumeScheduled = true;
    processNextTick(resume_, stream, state);
  }
}

function resume_(stream, state) {
  if (!state.reading) {
    debug('resume read 0');
    stream.read(0);
  }

  state.resumeScheduled = false;
  state.awaitDrain = 0;
  stream.emit('resume');
  flow(stream);
  if (state.flowing && !state.reading) stream.read(0);
}

Readable.prototype.pause = function () {
  debug('call pause flowing=%j', this._readableState.flowing);
  if (false !== this._readableState.flowing) {
    debug('pause');
    this._readableState.flowing = false;
    this.emit('pause');
  }
  return this;
};

function flow(stream) {
  var state = stream._readableState;
  debug('flow', state.flowing);
  while (state.flowing && stream.read() !== null) {}
}

// wrap an old-style stream as the async data source.
// This is *not* part of the readable stream interface.
// It is an ugly unfortunate mess of history.
Readable.prototype.wrap = function (stream) {
  var state = this._readableState;
  var paused = false;

  var self = this;
  stream.on('end', function () {
    debug('wrapped end');
    if (state.decoder && !state.ended) {
      var chunk = state.decoder.end();
      if (chunk && chunk.length) self.push(chunk);
    }

    self.push(null);
  });

  stream.on('data', function (chunk) {
    debug('wrapped data');
    if (state.decoder) chunk = state.decoder.write(chunk);

    // don't skip over falsy values in objectMode
    if (state.objectMode && (chunk === null || chunk === undefined)) return;else if (!state.objectMode && (!chunk || !chunk.length)) return;

    var ret = self.push(chunk);
    if (!ret) {
      paused = true;
      stream.pause();
    }
  });

  // proxy all the other methods.
  // important when wrapping filters and duplexes.
  for (var i in stream) {
    if (this[i] === undefined && typeof stream[i] === 'function') {
      this[i] = function (method) {
        return function () {
          return stream[method].apply(stream, arguments);
        };
      }(i);
    }
  }

  // proxy certain important events.
  var events = ['error', 'close', 'destroy', 'pause', 'resume'];
  forEach(events, function (ev) {
    stream.on(ev, self.emit.bind(self, ev));
  });

  // when we try to consume some more bytes, simply unpause the
  // underlying stream.
  self._read = function (n) {
    debug('wrapped _read', n);
    if (paused) {
      paused = false;
      stream.resume();
    }
  };

  return self;
};

// exposed for testing purposes only.
Readable._fromList = fromList;

// Pluck off n bytes from an array of buffers.
// Length is the combined lengths of all the buffers in the list.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function fromList(n, state) {
  // nothing buffered
  if (state.length === 0) return null;

  var ret;
  if (state.objectMode) ret = state.buffer.shift();else if (!n || n >= state.length) {
    // read it all, truncate the list
    if (state.decoder) ret = state.buffer.join('');else if (state.buffer.length === 1) ret = state.buffer.head.data;else ret = state.buffer.concat(state.length);
    state.buffer.clear();
  } else {
    // read part of list
    ret = fromListPartial(n, state.buffer, state.decoder);
  }

  return ret;
}

// Extracts only enough buffered data to satisfy the amount requested.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function fromListPartial(n, list, hasStrings) {
  var ret;
  if (n < list.head.data.length) {
    // slice is the same for buffers and strings
    ret = list.head.data.slice(0, n);
    list.head.data = list.head.data.slice(n);
  } else if (n === list.head.data.length) {
    // first chunk is a perfect match
    ret = list.shift();
  } else {
    // result spans more than one buffer
    ret = hasStrings ? copyFromBufferString(n, list) : copyFromBuffer(n, list);
  }
  return ret;
}

// Copies a specified amount of characters from the list of buffered data
// chunks.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function copyFromBufferString(n, list) {
  var p = list.head;
  var c = 1;
  var ret = p.data;
  n -= ret.length;
  while (p = p.next) {
    var str = p.data;
    var nb = n > str.length ? str.length : n;
    if (nb === str.length) ret += str;else ret += str.slice(0, n);
    n -= nb;
    if (n === 0) {
      if (nb === str.length) {
        ++c;
        if (p.next) list.head = p.next;else list.head = list.tail = null;
      } else {
        list.head = p;
        p.data = str.slice(nb);
      }
      break;
    }
    ++c;
  }
  list.length -= c;
  return ret;
}

// Copies a specified amount of bytes from the list of buffered data chunks.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function copyFromBuffer(n, list) {
  var ret = bufferShim.allocUnsafe(n);
  var p = list.head;
  var c = 1;
  p.data.copy(ret);
  n -= p.data.length;
  while (p = p.next) {
    var buf = p.data;
    var nb = n > buf.length ? buf.length : n;
    buf.copy(ret, ret.length - n, 0, nb);
    n -= nb;
    if (n === 0) {
      if (nb === buf.length) {
        ++c;
        if (p.next) list.head = p.next;else list.head = list.tail = null;
      } else {
        list.head = p;
        p.data = buf.slice(nb);
      }
      break;
    }
    ++c;
  }
  list.length -= c;
  return ret;
}

function endReadable(stream) {
  var state = stream._readableState;

  // If we get here before consuming all the bytes, then that is a
  // bug in node.  Should never happen.
  if (state.length > 0) throw new Error('"endReadable()" called on non-empty stream');

  if (!state.endEmitted) {
    state.ended = true;
    processNextTick(endReadableNT, state, stream);
  }
}

function endReadableNT(state, stream) {
  // Check that we didn't get one last unshift.
  if (!state.endEmitted && state.length === 0) {
    state.endEmitted = true;
    stream.readable = false;
    stream.emit('end');
  }
}

function forEach(xs, f) {
  for (var i = 0, l = xs.length; i < l; i++) {
    f(xs[i], i);
  }
}

function indexOf(xs, x) {
  for (var i = 0, l = xs.length; i < l; i++) {
    if (xs[i] === x) return i;
  }
  return -1;
}
}).call(this,require('_process'))

},{"./_stream_duplex":18,"./internal/streams/BufferList":23,"_process":13,"buffer":4,"buffer-shims":3,"core-util-is":6,"events":7,"inherits":9,"isarray":11,"process-nextick-args":12,"string_decoder/":29,"util":2}],21:[function(require,module,exports){
// a transform stream is a readable/writable stream where you do
// something with the data.  Sometimes it's called a "filter",
// but that's not a great name for it, since that implies a thing where
// some bits pass through, and others are simply ignored.  (That would
// be a valid example of a transform, of course.)
//
// While the output is causally related to the input, it's not a
// necessarily symmetric or synchronous transformation.  For example,
// a zlib stream might take multiple plain-text writes(), and then
// emit a single compressed chunk some time in the future.
//
// Here's how this works:
//
// The Transform stream has all the aspects of the readable and writable
// stream classes.  When you write(chunk), that calls _write(chunk,cb)
// internally, and returns false if there's a lot of pending writes
// buffered up.  When you call read(), that calls _read(n) until
// there's enough pending readable data buffered up.
//
// In a transform stream, the written data is placed in a buffer.  When
// _read(n) is called, it transforms the queued up data, calling the
// buffered _write cb's as it consumes chunks.  If consuming a single
// written chunk would result in multiple output chunks, then the first
// outputted bit calls the readcb, and subsequent chunks just go into
// the read buffer, and will cause it to emit 'readable' if necessary.
//
// This way, back-pressure is actually determined by the reading side,
// since _read has to be called to start processing a new chunk.  However,
// a pathological inflate type of transform can cause excessive buffering
// here.  For example, imagine a stream where every byte of input is
// interpreted as an integer from 0-255, and then results in that many
// bytes of output.  Writing the 4 bytes {ff,ff,ff,ff} would result in
// 1kb of data being output.  In this case, you could write a very small
// amount of input, and end up with a very large amount of output.  In
// such a pathological inflating mechanism, there'd be no way to tell
// the system to stop doing the transform.  A single 4MB write could
// cause the system to run out of memory.
//
// However, even in such a pathological case, only a single written chunk
// would be consumed, and then the rest would wait (un-transformed) until
// the results of the previous transformed chunk were consumed.

'use strict';

module.exports = Transform;

var Duplex = require('./_stream_duplex');

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

util.inherits(Transform, Duplex);

function TransformState(stream) {
  this.afterTransform = function (er, data) {
    return afterTransform(stream, er, data);
  };

  this.needTransform = false;
  this.transforming = false;
  this.writecb = null;
  this.writechunk = null;
  this.writeencoding = null;
}

function afterTransform(stream, er, data) {
  var ts = stream._transformState;
  ts.transforming = false;

  var cb = ts.writecb;

  if (!cb) return stream.emit('error', new Error('no writecb in Transform class'));

  ts.writechunk = null;
  ts.writecb = null;

  if (data !== null && data !== undefined) stream.push(data);

  cb(er);

  var rs = stream._readableState;
  rs.reading = false;
  if (rs.needReadable || rs.length < rs.highWaterMark) {
    stream._read(rs.highWaterMark);
  }
}

function Transform(options) {
  if (!(this instanceof Transform)) return new Transform(options);

  Duplex.call(this, options);

  this._transformState = new TransformState(this);

  var stream = this;

  // start out asking for a readable event once data is transformed.
  this._readableState.needReadable = true;

  // we have implemented the _read method, and done the other things
  // that Readable wants before the first _read call, so unset the
  // sync guard flag.
  this._readableState.sync = false;

  if (options) {
    if (typeof options.transform === 'function') this._transform = options.transform;

    if (typeof options.flush === 'function') this._flush = options.flush;
  }

  // When the writable side finishes, then flush out anything remaining.
  this.once('prefinish', function () {
    if (typeof this._flush === 'function') this._flush(function (er, data) {
      done(stream, er, data);
    });else done(stream);
  });
}

Transform.prototype.push = function (chunk, encoding) {
  this._transformState.needTransform = false;
  return Duplex.prototype.push.call(this, chunk, encoding);
};

// This is the part where you do stuff!
// override this function in implementation classes.
// 'chunk' is an input chunk.
//
// Call `push(newChunk)` to pass along transformed output
// to the readable side.  You may call 'push' zero or more times.
//
// Call `cb(err)` when you are done with this chunk.  If you pass
// an error, then that'll put the hurt on the whole operation.  If you
// never call cb(), then you'll never get another chunk.
Transform.prototype._transform = function (chunk, encoding, cb) {
  throw new Error('_transform() is not implemented');
};

Transform.prototype._write = function (chunk, encoding, cb) {
  var ts = this._transformState;
  ts.writecb = cb;
  ts.writechunk = chunk;
  ts.writeencoding = encoding;
  if (!ts.transforming) {
    var rs = this._readableState;
    if (ts.needTransform || rs.needReadable || rs.length < rs.highWaterMark) this._read(rs.highWaterMark);
  }
};

// Doesn't matter what the args are here.
// _transform does all the work.
// That we got here means that the readable side wants more data.
Transform.prototype._read = function (n) {
  var ts = this._transformState;

  if (ts.writechunk !== null && ts.writecb && !ts.transforming) {
    ts.transforming = true;
    this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
  } else {
    // mark that we need a transform, so that any data that comes in
    // will get processed, now that we've asked for it.
    ts.needTransform = true;
  }
};

function done(stream, er, data) {
  if (er) return stream.emit('error', er);

  if (data !== null && data !== undefined) stream.push(data);

  // if there's nothing in the write buffer, then that means
  // that nothing more will ever be provided
  var ws = stream._writableState;
  var ts = stream._transformState;

  if (ws.length) throw new Error('Calling transform done when ws.length != 0');

  if (ts.transforming) throw new Error('Calling transform done when still transforming');

  return stream.push(null);
}
},{"./_stream_duplex":18,"core-util-is":6,"inherits":9}],22:[function(require,module,exports){
(function (process){
// A bit simpler than readable streams.
// Implement an async ._write(chunk, encoding, cb), and it'll handle all
// the drain event emission and buffering.

'use strict';

module.exports = Writable;

/*<replacement>*/
var processNextTick = require('process-nextick-args');
/*</replacement>*/

/*<replacement>*/
var asyncWrite = !process.browser && ['v0.10', 'v0.9.'].indexOf(process.version.slice(0, 5)) > -1 ? setImmediate : processNextTick;
/*</replacement>*/

/*<replacement>*/
var Duplex;
/*</replacement>*/

Writable.WritableState = WritableState;

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

/*<replacement>*/
var internalUtil = {
  deprecate: require('util-deprecate')
};
/*</replacement>*/

/*<replacement>*/
var Stream;
(function () {
  try {
    Stream = require('st' + 'ream');
  } catch (_) {} finally {
    if (!Stream) Stream = require('events').EventEmitter;
  }
})();
/*</replacement>*/

var Buffer = require('buffer').Buffer;
/*<replacement>*/
var bufferShim = require('buffer-shims');
/*</replacement>*/

util.inherits(Writable, Stream);

function nop() {}

function WriteReq(chunk, encoding, cb) {
  this.chunk = chunk;
  this.encoding = encoding;
  this.callback = cb;
  this.next = null;
}

function WritableState(options, stream) {
  Duplex = Duplex || require('./_stream_duplex');

  options = options || {};

  // object stream flag to indicate whether or not this stream
  // contains buffers or objects.
  this.objectMode = !!options.objectMode;

  if (stream instanceof Duplex) this.objectMode = this.objectMode || !!options.writableObjectMode;

  // the point at which write() starts returning false
  // Note: 0 is a valid value, means that we always return false if
  // the entire buffer is not flushed immediately on write()
  var hwm = options.highWaterMark;
  var defaultHwm = this.objectMode ? 16 : 16 * 1024;
  this.highWaterMark = hwm || hwm === 0 ? hwm : defaultHwm;

  // cast to ints.
  this.highWaterMark = ~~this.highWaterMark;

  // drain event flag.
  this.needDrain = false;
  // at the start of calling end()
  this.ending = false;
  // when end() has been called, and returned
  this.ended = false;
  // when 'finish' is emitted
  this.finished = false;

  // should we decode strings into buffers before passing to _write?
  // this is here so that some node-core streams can optimize string
  // handling at a lower level.
  var noDecode = options.decodeStrings === false;
  this.decodeStrings = !noDecode;

  // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.
  this.defaultEncoding = options.defaultEncoding || 'utf8';

  // not an actual buffer we keep track of, but a measurement
  // of how much we're waiting to get pushed to some underlying
  // socket or file.
  this.length = 0;

  // a flag to see when we're in the middle of a write.
  this.writing = false;

  // when true all writes will be buffered until .uncork() call
  this.corked = 0;

  // a flag to be able to tell if the onwrite cb is called immediately,
  // or on a later tick.  We set this to true at first, because any
  // actions that shouldn't happen until "later" should generally also
  // not happen before the first write call.
  this.sync = true;

  // a flag to know if we're processing previously buffered items, which
  // may call the _write() callback in the same tick, so that we don't
  // end up in an overlapped onwrite situation.
  this.bufferProcessing = false;

  // the callback that's passed to _write(chunk,cb)
  this.onwrite = function (er) {
    onwrite(stream, er);
  };

  // the callback that the user supplies to write(chunk,encoding,cb)
  this.writecb = null;

  // the amount that is being written when _write is called.
  this.writelen = 0;

  this.bufferedRequest = null;
  this.lastBufferedRequest = null;

  // number of pending user-supplied write callbacks
  // this must be 0 before 'finish' can be emitted
  this.pendingcb = 0;

  // emit prefinish if the only thing we're waiting for is _write cbs
  // This is relevant for synchronous Transform streams
  this.prefinished = false;

  // True if the error was already emitted and should not be thrown again
  this.errorEmitted = false;

  // count buffered requests
  this.bufferedRequestCount = 0;

  // allocate the first CorkedRequest, there is always
  // one allocated and free to use, and we maintain at most two
  this.corkedRequestsFree = new CorkedRequest(this);
}

WritableState.prototype.getBuffer = function getBuffer() {
  var current = this.bufferedRequest;
  var out = [];
  while (current) {
    out.push(current);
    current = current.next;
  }
  return out;
};

(function () {
  try {
    Object.defineProperty(WritableState.prototype, 'buffer', {
      get: internalUtil.deprecate(function () {
        return this.getBuffer();
      }, '_writableState.buffer is deprecated. Use _writableState.getBuffer ' + 'instead.')
    });
  } catch (_) {}
})();

// Test _writableState for inheritance to account for Duplex streams,
// whose prototype chain only points to Readable.
var realHasInstance;
if (typeof Symbol === 'function' && Symbol.hasInstance && typeof Function.prototype[Symbol.hasInstance] === 'function') {
  realHasInstance = Function.prototype[Symbol.hasInstance];
  Object.defineProperty(Writable, Symbol.hasInstance, {
    value: function (object) {
      if (realHasInstance.call(this, object)) return true;

      return object && object._writableState instanceof WritableState;
    }
  });
} else {
  realHasInstance = function (object) {
    return object instanceof this;
  };
}

function Writable(options) {
  Duplex = Duplex || require('./_stream_duplex');

  // Writable ctor is applied to Duplexes, too.
  // `realHasInstance` is necessary because using plain `instanceof`
  // would return false, as no `_writableState` property is attached.

  // Trying to use the custom `instanceof` for Writable here will also break the
  // Node.js LazyTransform implementation, which has a non-trivial getter for
  // `_writableState` that would lead to infinite recursion.
  if (!realHasInstance.call(Writable, this) && !(this instanceof Duplex)) {
    return new Writable(options);
  }

  this._writableState = new WritableState(options, this);

  // legacy.
  this.writable = true;

  if (options) {
    if (typeof options.write === 'function') this._write = options.write;

    if (typeof options.writev === 'function') this._writev = options.writev;
  }

  Stream.call(this);
}

// Otherwise people can pipe Writable streams, which is just wrong.
Writable.prototype.pipe = function () {
  this.emit('error', new Error('Cannot pipe, not readable'));
};

function writeAfterEnd(stream, cb) {
  var er = new Error('write after end');
  // TODO: defer error events consistently everywhere, not just the cb
  stream.emit('error', er);
  processNextTick(cb, er);
}

// Checks that a user-supplied chunk is valid, especially for the particular
// mode the stream is in. Currently this means that `null` is never accepted
// and undefined/non-string values are only allowed in object mode.
function validChunk(stream, state, chunk, cb) {
  var valid = true;
  var er = false;

  if (chunk === null) {
    er = new TypeError('May not write null values to stream');
  } else if (typeof chunk !== 'string' && chunk !== undefined && !state.objectMode) {
    er = new TypeError('Invalid non-string/buffer chunk');
  }
  if (er) {
    stream.emit('error', er);
    processNextTick(cb, er);
    valid = false;
  }
  return valid;
}

Writable.prototype.write = function (chunk, encoding, cb) {
  var state = this._writableState;
  var ret = false;
  var isBuf = Buffer.isBuffer(chunk);

  if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (isBuf) encoding = 'buffer';else if (!encoding) encoding = state.defaultEncoding;

  if (typeof cb !== 'function') cb = nop;

  if (state.ended) writeAfterEnd(this, cb);else if (isBuf || validChunk(this, state, chunk, cb)) {
    state.pendingcb++;
    ret = writeOrBuffer(this, state, isBuf, chunk, encoding, cb);
  }

  return ret;
};

Writable.prototype.cork = function () {
  var state = this._writableState;

  state.corked++;
};

Writable.prototype.uncork = function () {
  var state = this._writableState;

  if (state.corked) {
    state.corked--;

    if (!state.writing && !state.corked && !state.finished && !state.bufferProcessing && state.bufferedRequest) clearBuffer(this, state);
  }
};

Writable.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
  // node::ParseEncoding() requires lower case.
  if (typeof encoding === 'string') encoding = encoding.toLowerCase();
  if (!(['hex', 'utf8', 'utf-8', 'ascii', 'binary', 'base64', 'ucs2', 'ucs-2', 'utf16le', 'utf-16le', 'raw'].indexOf((encoding + '').toLowerCase()) > -1)) throw new TypeError('Unknown encoding: ' + encoding);
  this._writableState.defaultEncoding = encoding;
  return this;
};

function decodeChunk(state, chunk, encoding) {
  if (!state.objectMode && state.decodeStrings !== false && typeof chunk === 'string') {
    chunk = bufferShim.from(chunk, encoding);
  }
  return chunk;
}

// if we're already writing something, then just put this
// in the queue, and wait our turn.  Otherwise, call _write
// If we return false, then we need a drain event, so set that flag.
function writeOrBuffer(stream, state, isBuf, chunk, encoding, cb) {
  if (!isBuf) {
    chunk = decodeChunk(state, chunk, encoding);
    if (Buffer.isBuffer(chunk)) encoding = 'buffer';
  }
  var len = state.objectMode ? 1 : chunk.length;

  state.length += len;

  var ret = state.length < state.highWaterMark;
  // we must ensure that previous needDrain will not be reset to false.
  if (!ret) state.needDrain = true;

  if (state.writing || state.corked) {
    var last = state.lastBufferedRequest;
    state.lastBufferedRequest = new WriteReq(chunk, encoding, cb);
    if (last) {
      last.next = state.lastBufferedRequest;
    } else {
      state.bufferedRequest = state.lastBufferedRequest;
    }
    state.bufferedRequestCount += 1;
  } else {
    doWrite(stream, state, false, len, chunk, encoding, cb);
  }

  return ret;
}

function doWrite(stream, state, writev, len, chunk, encoding, cb) {
  state.writelen = len;
  state.writecb = cb;
  state.writing = true;
  state.sync = true;
  if (writev) stream._writev(chunk, state.onwrite);else stream._write(chunk, encoding, state.onwrite);
  state.sync = false;
}

function onwriteError(stream, state, sync, er, cb) {
  --state.pendingcb;
  if (sync) processNextTick(cb, er);else cb(er);

  stream._writableState.errorEmitted = true;
  stream.emit('error', er);
}

function onwriteStateUpdate(state) {
  state.writing = false;
  state.writecb = null;
  state.length -= state.writelen;
  state.writelen = 0;
}

function onwrite(stream, er) {
  var state = stream._writableState;
  var sync = state.sync;
  var cb = state.writecb;

  onwriteStateUpdate(state);

  if (er) onwriteError(stream, state, sync, er, cb);else {
    // Check if we're actually ready to finish, but don't emit yet
    var finished = needFinish(state);

    if (!finished && !state.corked && !state.bufferProcessing && state.bufferedRequest) {
      clearBuffer(stream, state);
    }

    if (sync) {
      /*<replacement>*/
      asyncWrite(afterWrite, stream, state, finished, cb);
      /*</replacement>*/
    } else {
      afterWrite(stream, state, finished, cb);
    }
  }
}

function afterWrite(stream, state, finished, cb) {
  if (!finished) onwriteDrain(stream, state);
  state.pendingcb--;
  cb();
  finishMaybe(stream, state);
}

// Must force callback to be called on nextTick, so that we don't
// emit 'drain' before the write() consumer gets the 'false' return
// value, and has a chance to attach a 'drain' listener.
function onwriteDrain(stream, state) {
  if (state.length === 0 && state.needDrain) {
    state.needDrain = false;
    stream.emit('drain');
  }
}

// if there's something in the buffer waiting, then process it
function clearBuffer(stream, state) {
  state.bufferProcessing = true;
  var entry = state.bufferedRequest;

  if (stream._writev && entry && entry.next) {
    // Fast case, write everything using _writev()
    var l = state.bufferedRequestCount;
    var buffer = new Array(l);
    var holder = state.corkedRequestsFree;
    holder.entry = entry;

    var count = 0;
    while (entry) {
      buffer[count] = entry;
      entry = entry.next;
      count += 1;
    }

    doWrite(stream, state, true, state.length, buffer, '', holder.finish);

    // doWrite is almost always async, defer these to save a bit of time
    // as the hot path ends with doWrite
    state.pendingcb++;
    state.lastBufferedRequest = null;
    if (holder.next) {
      state.corkedRequestsFree = holder.next;
      holder.next = null;
    } else {
      state.corkedRequestsFree = new CorkedRequest(state);
    }
  } else {
    // Slow case, write chunks one-by-one
    while (entry) {
      var chunk = entry.chunk;
      var encoding = entry.encoding;
      var cb = entry.callback;
      var len = state.objectMode ? 1 : chunk.length;

      doWrite(stream, state, false, len, chunk, encoding, cb);
      entry = entry.next;
      // if we didn't call the onwrite immediately, then
      // it means that we need to wait until it does.
      // also, that means that the chunk and cb are currently
      // being processed, so move the buffer counter past them.
      if (state.writing) {
        break;
      }
    }

    if (entry === null) state.lastBufferedRequest = null;
  }

  state.bufferedRequestCount = 0;
  state.bufferedRequest = entry;
  state.bufferProcessing = false;
}

Writable.prototype._write = function (chunk, encoding, cb) {
  cb(new Error('_write() is not implemented'));
};

Writable.prototype._writev = null;

Writable.prototype.end = function (chunk, encoding, cb) {
  var state = this._writableState;

  if (typeof chunk === 'function') {
    cb = chunk;
    chunk = null;
    encoding = null;
  } else if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (chunk !== null && chunk !== undefined) this.write(chunk, encoding);

  // .end() fully uncorks
  if (state.corked) {
    state.corked = 1;
    this.uncork();
  }

  // ignore unnecessary end() calls.
  if (!state.ending && !state.finished) endWritable(this, state, cb);
};

function needFinish(state) {
  return state.ending && state.length === 0 && state.bufferedRequest === null && !state.finished && !state.writing;
}

function prefinish(stream, state) {
  if (!state.prefinished) {
    state.prefinished = true;
    stream.emit('prefinish');
  }
}

function finishMaybe(stream, state) {
  var need = needFinish(state);
  if (need) {
    if (state.pendingcb === 0) {
      prefinish(stream, state);
      state.finished = true;
      stream.emit('finish');
    } else {
      prefinish(stream, state);
    }
  }
  return need;
}

function endWritable(stream, state, cb) {
  state.ending = true;
  finishMaybe(stream, state);
  if (cb) {
    if (state.finished) processNextTick(cb);else stream.once('finish', cb);
  }
  state.ended = true;
  stream.writable = false;
}

// It seems a linked list but it is not
// there will be only 2 of these for each stream
function CorkedRequest(state) {
  var _this = this;

  this.next = null;
  this.entry = null;
  this.finish = function (err) {
    var entry = _this.entry;
    _this.entry = null;
    while (entry) {
      var cb = entry.callback;
      state.pendingcb--;
      cb(err);
      entry = entry.next;
    }
    if (state.corkedRequestsFree) {
      state.corkedRequestsFree.next = _this;
    } else {
      state.corkedRequestsFree = _this;
    }
  };
}
}).call(this,require('_process'))

},{"./_stream_duplex":18,"_process":13,"buffer":4,"buffer-shims":3,"core-util-is":6,"events":7,"inherits":9,"process-nextick-args":12,"util-deprecate":33}],23:[function(require,module,exports){
'use strict';

var Buffer = require('buffer').Buffer;
/*<replacement>*/
var bufferShim = require('buffer-shims');
/*</replacement>*/

module.exports = BufferList;

function BufferList() {
  this.head = null;
  this.tail = null;
  this.length = 0;
}

BufferList.prototype.push = function (v) {
  var entry = { data: v, next: null };
  if (this.length > 0) this.tail.next = entry;else this.head = entry;
  this.tail = entry;
  ++this.length;
};

BufferList.prototype.unshift = function (v) {
  var entry = { data: v, next: this.head };
  if (this.length === 0) this.tail = entry;
  this.head = entry;
  ++this.length;
};

BufferList.prototype.shift = function () {
  if (this.length === 0) return;
  var ret = this.head.data;
  if (this.length === 1) this.head = this.tail = null;else this.head = this.head.next;
  --this.length;
  return ret;
};

BufferList.prototype.clear = function () {
  this.head = this.tail = null;
  this.length = 0;
};

BufferList.prototype.join = function (s) {
  if (this.length === 0) return '';
  var p = this.head;
  var ret = '' + p.data;
  while (p = p.next) {
    ret += s + p.data;
  }return ret;
};

BufferList.prototype.concat = function (n) {
  if (this.length === 0) return bufferShim.alloc(0);
  if (this.length === 1) return this.head.data;
  var ret = bufferShim.allocUnsafe(n >>> 0);
  var p = this.head;
  var i = 0;
  while (p) {
    p.data.copy(ret, i);
    i += p.data.length;
    p = p.next;
  }
  return ret;
};
},{"buffer":4,"buffer-shims":3}],24:[function(require,module,exports){
(function (process){
var Stream = (function (){
  try {
    return require('st' + 'ream'); // hack to fix a circular dependency issue when used with browserify
  } catch(_){}
}());
exports = module.exports = require('./lib/_stream_readable.js');
exports.Stream = Stream || exports;
exports.Readable = exports;
exports.Writable = require('./lib/_stream_writable.js');
exports.Duplex = require('./lib/_stream_duplex.js');
exports.Transform = require('./lib/_stream_transform.js');
exports.PassThrough = require('./lib/_stream_passthrough.js');

if (!process.browser && process.env.READABLE_STREAM === 'disable' && Stream) {
  module.exports = Stream;
}

}).call(this,require('_process'))

},{"./lib/_stream_duplex.js":18,"./lib/_stream_passthrough.js":19,"./lib/_stream_readable.js":20,"./lib/_stream_transform.js":21,"./lib/_stream_writable.js":22,"_process":13}],25:[function(require,module,exports){
(function (global){
var ClientRequest = require('./lib/request')
var extend = require('xtend')
var statusCodes = require('builtin-status-codes')
var url = require('url')

var http = exports

http.request = function (opts, cb) {
	if (typeof opts === 'string')
		opts = url.parse(opts)
	else
		opts = extend(opts)

	// Normally, the page is loaded from http or https, so not specifying a protocol
	// will result in a (valid) protocol-relative url. However, this won't work if
	// the protocol is something else, like 'file:'
	var defaultProtocol = global.location.protocol.search(/^https?:$/) === -1 ? 'http:' : ''

	var protocol = opts.protocol || defaultProtocol
	var host = opts.hostname || opts.host
	var port = opts.port
	var path = opts.path || '/'

	// Necessary for IPv6 addresses
	if (host && host.indexOf(':') !== -1)
		host = '[' + host + ']'

	// This may be a relative url. The browser should always be able to interpret it correctly.
	opts.url = (host ? (protocol + '//' + host) : '') + (port ? ':' + port : '') + path
	opts.method = (opts.method || 'GET').toUpperCase()
	opts.headers = opts.headers || {}

	// Also valid opts.auth, opts.mode

	var req = new ClientRequest(opts)
	if (cb)
		req.on('response', cb)
	return req
}

http.get = function get (opts, cb) {
	var req = http.request(opts, cb)
	req.end()
	return req
}

http.Agent = function () {}
http.Agent.defaultMaxSockets = 4

http.STATUS_CODES = statusCodes

http.METHODS = [
	'CHECKOUT',
	'CONNECT',
	'COPY',
	'DELETE',
	'GET',
	'HEAD',
	'LOCK',
	'M-SEARCH',
	'MERGE',
	'MKACTIVITY',
	'MKCOL',
	'MOVE',
	'NOTIFY',
	'OPTIONS',
	'PATCH',
	'POST',
	'PROPFIND',
	'PROPPATCH',
	'PURGE',
	'PUT',
	'REPORT',
	'SEARCH',
	'SUBSCRIBE',
	'TRACE',
	'UNLOCK',
	'UNSUBSCRIBE'
]
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./lib/request":27,"builtin-status-codes":5,"url":31,"xtend":34}],26:[function(require,module,exports){
(function (global){
exports.fetch = isFunction(global.fetch) && isFunction(global.ReadableStream)

exports.blobConstructor = false
try {
	new Blob([new ArrayBuffer(1)])
	exports.blobConstructor = true
} catch (e) {}

// The xhr request to example.com may violate some restrictive CSP configurations,
// so if we're running in a browser that supports `fetch`, avoid calling getXHR()
// and assume support for certain features below.
var xhr
function getXHR () {
	// Cache the xhr value
	if (xhr !== undefined) return xhr

	if (global.XMLHttpRequest) {
		xhr = new global.XMLHttpRequest()
		// If XDomainRequest is available (ie only, where xhr might not work
		// cross domain), use the page location. Otherwise use example.com
		// Note: this doesn't actually make an http request.
		try {
			xhr.open('GET', global.XDomainRequest ? '/' : 'https://example.com')
		} catch(e) {
			xhr = null
		}
	} else {
		// Service workers don't have XHR
		xhr = null
	}
	return xhr
}

function checkTypeSupport (type) {
	var xhr = getXHR()
	if (!xhr) return false
	try {
		xhr.responseType = type
		return xhr.responseType === type
	} catch (e) {}
	return false
}

// For some strange reason, Safari 7.0 reports typeof global.ArrayBuffer === 'object'.
// Safari 7.1 appears to have fixed this bug.
var haveArrayBuffer = typeof global.ArrayBuffer !== 'undefined'
var haveSlice = haveArrayBuffer && isFunction(global.ArrayBuffer.prototype.slice)

// If fetch is supported, then arraybuffer will be supported too. Skip calling
// checkTypeSupport(), since that calls getXHR().
exports.arraybuffer = exports.fetch || (haveArrayBuffer && checkTypeSupport('arraybuffer'))

// These next two tests unavoidably show warnings in Chrome. Since fetch will always
// be used if it's available, just return false for these to avoid the warnings.
exports.msstream = !exports.fetch && haveSlice && checkTypeSupport('ms-stream')
exports.mozchunkedarraybuffer = !exports.fetch && haveArrayBuffer &&
	checkTypeSupport('moz-chunked-arraybuffer')

// If fetch is supported, then overrideMimeType will be supported too. Skip calling
// getXHR().
exports.overrideMimeType = exports.fetch || (getXHR() ? isFunction(getXHR().overrideMimeType) : false)

exports.vbArray = isFunction(global.VBArray)

function isFunction (value) {
	return typeof value === 'function'
}

xhr = null // Help gc

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],27:[function(require,module,exports){
(function (process,global,Buffer){
var capability = require('./capability')
var inherits = require('inherits')
var response = require('./response')
var stream = require('readable-stream')
var toArrayBuffer = require('to-arraybuffer')

var IncomingMessage = response.IncomingMessage
var rStates = response.readyStates

function decideMode (preferBinary, useFetch) {
	if (capability.fetch && useFetch) {
		return 'fetch'
	} else if (capability.mozchunkedarraybuffer) {
		return 'moz-chunked-arraybuffer'
	} else if (capability.msstream) {
		return 'ms-stream'
	} else if (capability.arraybuffer && preferBinary) {
		return 'arraybuffer'
	} else if (capability.vbArray && preferBinary) {
		return 'text:vbarray'
	} else {
		return 'text'
	}
}

var ClientRequest = module.exports = function (opts) {
	var self = this
	stream.Writable.call(self)

	self._opts = opts
	self._body = []
	self._headers = {}
	if (opts.auth)
		self.setHeader('Authorization', 'Basic ' + new Buffer(opts.auth).toString('base64'))
	Object.keys(opts.headers).forEach(function (name) {
		self.setHeader(name, opts.headers[name])
	})

	var preferBinary
	var useFetch = true
	if (opts.mode === 'disable-fetch' || 'timeout' in opts) {
		// If the use of XHR should be preferred and includes preserving the 'content-type' header.
		// Force XHR to be used since the Fetch API does not yet support timeouts.
		useFetch = false
		preferBinary = true
	} else if (opts.mode === 'prefer-streaming') {
		// If streaming is a high priority but binary compatibility and
		// the accuracy of the 'content-type' header aren't
		preferBinary = false
	} else if (opts.mode === 'allow-wrong-content-type') {
		// If streaming is more important than preserving the 'content-type' header
		preferBinary = !capability.overrideMimeType
	} else if (!opts.mode || opts.mode === 'default' || opts.mode === 'prefer-fast') {
		// Use binary if text streaming may corrupt data or the content-type header, or for speed
		preferBinary = true
	} else {
		throw new Error('Invalid value for opts.mode')
	}
	self._mode = decideMode(preferBinary, useFetch)

	self.on('finish', function () {
		self._onFinish()
	})
}

inherits(ClientRequest, stream.Writable)

ClientRequest.prototype.setHeader = function (name, value) {
	var self = this
	var lowerName = name.toLowerCase()
	// This check is not necessary, but it prevents warnings from browsers about setting unsafe
	// headers. To be honest I'm not entirely sure hiding these warnings is a good thing, but
	// http-browserify did it, so I will too.
	if (unsafeHeaders.indexOf(lowerName) !== -1)
		return

	self._headers[lowerName] = {
		name: name,
		value: value
	}
}

ClientRequest.prototype.getHeader = function (name) {
	var self = this
	return self._headers[name.toLowerCase()].value
}

ClientRequest.prototype.removeHeader = function (name) {
	var self = this
	delete self._headers[name.toLowerCase()]
}

ClientRequest.prototype._onFinish = function () {
	var self = this

	if (self._destroyed)
		return
	var opts = self._opts

	var headersObj = self._headers
	var body = null
	if (opts.method === 'POST' || opts.method === 'PUT' || opts.method === 'PATCH' || opts.method === 'MERGE') {
		if (capability.blobConstructor) {
			body = new global.Blob(self._body.map(function (buffer) {
				return toArrayBuffer(buffer)
			}), {
				type: (headersObj['content-type'] || {}).value || ''
			})
		} else {
			// get utf8 string
			body = Buffer.concat(self._body).toString()
		}
	}

	if (self._mode === 'fetch') {
		var headers = Object.keys(headersObj).map(function (name) {
			return [headersObj[name].name, headersObj[name].value]
		})

		global.fetch(self._opts.url, {
			method: self._opts.method,
			headers: headers,
			body: body || undefined,
			mode: 'cors',
			credentials: opts.withCredentials ? 'include' : 'same-origin'
		}).then(function (response) {
			self._fetchResponse = response
			self._connect()
		}, function (reason) {
			self.emit('error', reason)
		})
	} else {
		var xhr = self._xhr = new global.XMLHttpRequest()
		try {
			xhr.open(self._opts.method, self._opts.url, true)
		} catch (err) {
			process.nextTick(function () {
				self.emit('error', err)
			})
			return
		}

		// Can't set responseType on really old browsers
		if ('responseType' in xhr)
			xhr.responseType = self._mode.split(':')[0]

		if ('withCredentials' in xhr)
			xhr.withCredentials = !!opts.withCredentials

		if (self._mode === 'text' && 'overrideMimeType' in xhr)
			xhr.overrideMimeType('text/plain; charset=x-user-defined')

		if ('timeout' in opts) {
			xhr.timeout = opts.timeout
			xhr.ontimeout = function () {
				self.emit('timeout')
			}
		}

		Object.keys(headersObj).forEach(function (name) {
			xhr.setRequestHeader(headersObj[name].name, headersObj[name].value)
		})

		self._response = null
		xhr.onreadystatechange = function () {
			switch (xhr.readyState) {
				case rStates.LOADING:
				case rStates.DONE:
					self._onXHRProgress()
					break
			}
		}
		// Necessary for streaming in Firefox, since xhr.response is ONLY defined
		// in onprogress, not in onreadystatechange with xhr.readyState = 3
		if (self._mode === 'moz-chunked-arraybuffer') {
			xhr.onprogress = function () {
				self._onXHRProgress()
			}
		}

		xhr.onerror = function () {
			if (self._destroyed)
				return
			self.emit('error', new Error('XHR error'))
		}

		try {
			xhr.send(body)
		} catch (err) {
			process.nextTick(function () {
				self.emit('error', err)
			})
			return
		}
	}
}

/**
 * Checks if xhr.status is readable and non-zero, indicating no error.
 * Even though the spec says it should be available in readyState 3,
 * accessing it throws an exception in IE8
 */
function statusValid (xhr) {
	try {
		var status = xhr.status
		return (status !== null && status !== 0)
	} catch (e) {
		return false
	}
}

ClientRequest.prototype._onXHRProgress = function () {
	var self = this

	if (!statusValid(self._xhr) || self._destroyed)
		return

	if (!self._response)
		self._connect()

	self._response._onXHRProgress()
}

ClientRequest.prototype._connect = function () {
	var self = this

	if (self._destroyed)
		return

	self._response = new IncomingMessage(self._xhr, self._fetchResponse, self._mode)
	self._response.on('error', function(err) {
		self.emit('error', err)
	})

	self.emit('response', self._response)
}

ClientRequest.prototype._write = function (chunk, encoding, cb) {
	var self = this

	self._body.push(chunk)
	cb()
}

ClientRequest.prototype.abort = ClientRequest.prototype.destroy = function () {
	var self = this
	self._destroyed = true
	if (self._response)
		self._response._destroyed = true
	if (self._xhr)
		self._xhr.abort()
	// Currently, there isn't a way to truly abort a fetch.
	// If you like bikeshedding, see https://github.com/whatwg/fetch/issues/27
}

ClientRequest.prototype.end = function (data, encoding, cb) {
	var self = this
	if (typeof data === 'function') {
		cb = data
		data = undefined
	}

	stream.Writable.prototype.end.call(self, data, encoding, cb)
}

ClientRequest.prototype.flushHeaders = function () {}
ClientRequest.prototype.setTimeout = function () {}
ClientRequest.prototype.setNoDelay = function () {}
ClientRequest.prototype.setSocketKeepAlive = function () {}

// Taken from http://www.w3.org/TR/XMLHttpRequest/#the-setrequestheader%28%29-method
var unsafeHeaders = [
	'accept-charset',
	'accept-encoding',
	'access-control-request-headers',
	'access-control-request-method',
	'connection',
	'content-length',
	'cookie',
	'cookie2',
	'date',
	'dnt',
	'expect',
	'host',
	'keep-alive',
	'origin',
	'referer',
	'te',
	'trailer',
	'transfer-encoding',
	'upgrade',
	'user-agent',
	'via'
]

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer)

},{"./capability":26,"./response":28,"_process":13,"buffer":4,"inherits":9,"readable-stream":24,"to-arraybuffer":30}],28:[function(require,module,exports){
(function (process,global,Buffer){
var capability = require('./capability')
var inherits = require('inherits')
var stream = require('readable-stream')

var rStates = exports.readyStates = {
	UNSENT: 0,
	OPENED: 1,
	HEADERS_RECEIVED: 2,
	LOADING: 3,
	DONE: 4
}

var IncomingMessage = exports.IncomingMessage = function (xhr, response, mode) {
	var self = this
	stream.Readable.call(self)

	self._mode = mode
	self.headers = {}
	self.rawHeaders = []
	self.trailers = {}
	self.rawTrailers = []

	// Fake the 'close' event, but only once 'end' fires
	self.on('end', function () {
		// The nextTick is necessary to prevent the 'request' module from causing an infinite loop
		process.nextTick(function () {
			self.emit('close')
		})
	})

	if (mode === 'fetch') {
		self._fetchResponse = response

		self.url = response.url
		self.statusCode = response.status
		self.statusMessage = response.statusText
		
		response.headers.forEach(function(header, key){
			self.headers[key.toLowerCase()] = header
			self.rawHeaders.push(key, header)
		})


		// TODO: this doesn't respect backpressure. Once WritableStream is available, this can be fixed
		var reader = response.body.getReader()
		function read () {
			reader.read().then(function (result) {
				if (self._destroyed)
					return
				if (result.done) {
					self.push(null)
					return
				}
				self.push(new Buffer(result.value))
				read()
			}).catch(function(err) {
				self.emit('error', err)
			})
		}
		read()

	} else {
		self._xhr = xhr
		self._pos = 0

		self.url = xhr.responseURL
		self.statusCode = xhr.status
		self.statusMessage = xhr.statusText
		var headers = xhr.getAllResponseHeaders().split(/\r?\n/)
		headers.forEach(function (header) {
			var matches = header.match(/^([^:]+):\s*(.*)/)
			if (matches) {
				var key = matches[1].toLowerCase()
				if (key === 'set-cookie') {
					if (self.headers[key] === undefined) {
						self.headers[key] = []
					}
					self.headers[key].push(matches[2])
				} else if (self.headers[key] !== undefined) {
					self.headers[key] += ', ' + matches[2]
				} else {
					self.headers[key] = matches[2]
				}
				self.rawHeaders.push(matches[1], matches[2])
			}
		})

		self._charset = 'x-user-defined'
		if (!capability.overrideMimeType) {
			var mimeType = self.rawHeaders['mime-type']
			if (mimeType) {
				var charsetMatch = mimeType.match(/;\s*charset=([^;])(;|$)/)
				if (charsetMatch) {
					self._charset = charsetMatch[1].toLowerCase()
				}
			}
			if (!self._charset)
				self._charset = 'utf-8' // best guess
		}
	}
}

inherits(IncomingMessage, stream.Readable)

IncomingMessage.prototype._read = function () {}

IncomingMessage.prototype._onXHRProgress = function () {
	var self = this

	var xhr = self._xhr

	var response = null
	switch (self._mode) {
		case 'text:vbarray': // For IE9
			if (xhr.readyState !== rStates.DONE)
				break
			try {
				// This fails in IE8
				response = new global.VBArray(xhr.responseBody).toArray()
			} catch (e) {}
			if (response !== null) {
				self.push(new Buffer(response))
				break
			}
			// Falls through in IE8	
		case 'text':
			try { // This will fail when readyState = 3 in IE9. Switch mode and wait for readyState = 4
				response = xhr.responseText
			} catch (e) {
				self._mode = 'text:vbarray'
				break
			}
			if (response.length > self._pos) {
				var newData = response.substr(self._pos)
				if (self._charset === 'x-user-defined') {
					var buffer = new Buffer(newData.length)
					for (var i = 0; i < newData.length; i++)
						buffer[i] = newData.charCodeAt(i) & 0xff

					self.push(buffer)
				} else {
					self.push(newData, self._charset)
				}
				self._pos = response.length
			}
			break
		case 'arraybuffer':
			if (xhr.readyState !== rStates.DONE || !xhr.response)
				break
			response = xhr.response
			self.push(new Buffer(new Uint8Array(response)))
			break
		case 'moz-chunked-arraybuffer': // take whole
			response = xhr.response
			if (xhr.readyState !== rStates.LOADING || !response)
				break
			self.push(new Buffer(new Uint8Array(response)))
			break
		case 'ms-stream':
			response = xhr.response
			if (xhr.readyState !== rStates.LOADING)
				break
			var reader = new global.MSStreamReader()
			reader.onprogress = function () {
				if (reader.result.byteLength > self._pos) {
					self.push(new Buffer(new Uint8Array(reader.result.slice(self._pos))))
					self._pos = reader.result.byteLength
				}
			}
			reader.onload = function () {
				self.push(null)
			}
			// reader.onerror = ??? // TODO: this
			reader.readAsArrayBuffer(response)
			break
	}

	// The ms-stream case handles end separately in reader.onload()
	if (self._xhr.readyState === rStates.DONE && self._mode !== 'ms-stream') {
		self.push(null)
	}
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer)

},{"./capability":26,"_process":13,"buffer":4,"inherits":9,"readable-stream":24}],29:[function(require,module,exports){
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

var Buffer = require('buffer').Buffer;

var isBufferEncoding = Buffer.isEncoding
  || function(encoding) {
       switch (encoding && encoding.toLowerCase()) {
         case 'hex': case 'utf8': case 'utf-8': case 'ascii': case 'binary': case 'base64': case 'ucs2': case 'ucs-2': case 'utf16le': case 'utf-16le': case 'raw': return true;
         default: return false;
       }
     }


function assertEncoding(encoding) {
  if (encoding && !isBufferEncoding(encoding)) {
    throw new Error('Unknown encoding: ' + encoding);
  }
}

// StringDecoder provides an interface for efficiently splitting a series of
// buffers into a series of JS strings without breaking apart multi-byte
// characters. CESU-8 is handled as part of the UTF-8 encoding.
//
// @TODO Handling all encodings inside a single object makes it very difficult
// to reason about this code, so it should be split up in the future.
// @TODO There should be a utf8-strict encoding that rejects invalid UTF-8 code
// points as used by CESU-8.
var StringDecoder = exports.StringDecoder = function(encoding) {
  this.encoding = (encoding || 'utf8').toLowerCase().replace(/[-_]/, '');
  assertEncoding(encoding);
  switch (this.encoding) {
    case 'utf8':
      // CESU-8 represents each of Surrogate Pair by 3-bytes
      this.surrogateSize = 3;
      break;
    case 'ucs2':
    case 'utf16le':
      // UTF-16 represents each of Surrogate Pair by 2-bytes
      this.surrogateSize = 2;
      this.detectIncompleteChar = utf16DetectIncompleteChar;
      break;
    case 'base64':
      // Base-64 stores 3 bytes in 4 chars, and pads the remainder.
      this.surrogateSize = 3;
      this.detectIncompleteChar = base64DetectIncompleteChar;
      break;
    default:
      this.write = passThroughWrite;
      return;
  }

  // Enough space to store all bytes of a single character. UTF-8 needs 4
  // bytes, but CESU-8 may require up to 6 (3 bytes per surrogate).
  this.charBuffer = new Buffer(6);
  // Number of bytes received for the current incomplete multi-byte character.
  this.charReceived = 0;
  // Number of bytes expected for the current incomplete multi-byte character.
  this.charLength = 0;
};


// write decodes the given buffer and returns it as JS string that is
// guaranteed to not contain any partial multi-byte characters. Any partial
// character found at the end of the buffer is buffered up, and will be
// returned when calling write again with the remaining bytes.
//
// Note: Converting a Buffer containing an orphan surrogate to a String
// currently works, but converting a String to a Buffer (via `new Buffer`, or
// Buffer#write) will replace incomplete surrogates with the unicode
// replacement character. See https://codereview.chromium.org/121173009/ .
StringDecoder.prototype.write = function(buffer) {
  var charStr = '';
  // if our last write ended with an incomplete multibyte character
  while (this.charLength) {
    // determine how many remaining bytes this buffer has to offer for this char
    var available = (buffer.length >= this.charLength - this.charReceived) ?
        this.charLength - this.charReceived :
        buffer.length;

    // add the new bytes to the char buffer
    buffer.copy(this.charBuffer, this.charReceived, 0, available);
    this.charReceived += available;

    if (this.charReceived < this.charLength) {
      // still not enough chars in this buffer? wait for more ...
      return '';
    }

    // remove bytes belonging to the current character from the buffer
    buffer = buffer.slice(available, buffer.length);

    // get the character that was split
    charStr = this.charBuffer.slice(0, this.charLength).toString(this.encoding);

    // CESU-8: lead surrogate (D800-DBFF) is also the incomplete character
    var charCode = charStr.charCodeAt(charStr.length - 1);
    if (charCode >= 0xD800 && charCode <= 0xDBFF) {
      this.charLength += this.surrogateSize;
      charStr = '';
      continue;
    }
    this.charReceived = this.charLength = 0;

    // if there are no more bytes in this buffer, just emit our char
    if (buffer.length === 0) {
      return charStr;
    }
    break;
  }

  // determine and set charLength / charReceived
  this.detectIncompleteChar(buffer);

  var end = buffer.length;
  if (this.charLength) {
    // buffer the incomplete character bytes we got
    buffer.copy(this.charBuffer, 0, buffer.length - this.charReceived, end);
    end -= this.charReceived;
  }

  charStr += buffer.toString(this.encoding, 0, end);

  var end = charStr.length - 1;
  var charCode = charStr.charCodeAt(end);
  // CESU-8: lead surrogate (D800-DBFF) is also the incomplete character
  if (charCode >= 0xD800 && charCode <= 0xDBFF) {
    var size = this.surrogateSize;
    this.charLength += size;
    this.charReceived += size;
    this.charBuffer.copy(this.charBuffer, size, 0, size);
    buffer.copy(this.charBuffer, 0, 0, size);
    return charStr.substring(0, end);
  }

  // or just emit the charStr
  return charStr;
};

// detectIncompleteChar determines if there is an incomplete UTF-8 character at
// the end of the given buffer. If so, it sets this.charLength to the byte
// length that character, and sets this.charReceived to the number of bytes
// that are available for this character.
StringDecoder.prototype.detectIncompleteChar = function(buffer) {
  // determine how many bytes we have to check at the end of this buffer
  var i = (buffer.length >= 3) ? 3 : buffer.length;

  // Figure out if one of the last i bytes of our buffer announces an
  // incomplete char.
  for (; i > 0; i--) {
    var c = buffer[buffer.length - i];

    // See http://en.wikipedia.org/wiki/UTF-8#Description

    // 110XXXXX
    if (i == 1 && c >> 5 == 0x06) {
      this.charLength = 2;
      break;
    }

    // 1110XXXX
    if (i <= 2 && c >> 4 == 0x0E) {
      this.charLength = 3;
      break;
    }

    // 11110XXX
    if (i <= 3 && c >> 3 == 0x1E) {
      this.charLength = 4;
      break;
    }
  }
  this.charReceived = i;
};

StringDecoder.prototype.end = function(buffer) {
  var res = '';
  if (buffer && buffer.length)
    res = this.write(buffer);

  if (this.charReceived) {
    var cr = this.charReceived;
    var buf = this.charBuffer;
    var enc = this.encoding;
    res += buf.slice(0, cr).toString(enc);
  }

  return res;
};

function passThroughWrite(buffer) {
  return buffer.toString(this.encoding);
}

function utf16DetectIncompleteChar(buffer) {
  this.charReceived = buffer.length % 2;
  this.charLength = this.charReceived ? 2 : 0;
}

function base64DetectIncompleteChar(buffer) {
  this.charReceived = buffer.length % 3;
  this.charLength = this.charReceived ? 3 : 0;
}

},{"buffer":4}],30:[function(require,module,exports){
var Buffer = require('buffer').Buffer

module.exports = function (buf) {
	// If the buffer is backed by a Uint8Array, a faster version will work
	if (buf instanceof Uint8Array) {
		// If the buffer isn't a subarray, return the underlying ArrayBuffer
		if (buf.byteOffset === 0 && buf.byteLength === buf.buffer.byteLength) {
			return buf.buffer
		} else if (typeof buf.buffer.slice === 'function') {
			// Otherwise we need to get a proper copy
			return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
		}
	}

	if (Buffer.isBuffer(buf)) {
		// This is the slow version that will work with any Buffer
		// implementation (even in old browsers)
		var arrayCopy = new Uint8Array(buf.length)
		var len = buf.length
		for (var i = 0; i < len; i++) {
			arrayCopy[i] = buf[i]
		}
		return arrayCopy.buffer
	} else {
		throw new Error('Argument must be a Buffer')
	}
}

},{"buffer":4}],31:[function(require,module,exports){
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

},{"./util":32,"punycode":14,"querystring":17}],32:[function(require,module,exports){
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

},{}],33:[function(require,module,exports){
(function (global){

/**
 * Module exports.
 */

module.exports = deprecate;

/**
 * Mark that a method should not be used.
 * Returns a modified function which warns once by default.
 *
 * If `localStorage.noDeprecation = true` is set, then it is a no-op.
 *
 * If `localStorage.throwDeprecation = true` is set, then deprecated functions
 * will throw an Error when invoked.
 *
 * If `localStorage.traceDeprecation = true` is set, then deprecated functions
 * will invoke `console.trace()` instead of `console.error()`.
 *
 * @param {Function} fn - the function to deprecate
 * @param {String} msg - the string to print to the console when `fn` is invoked
 * @returns {Function} a new "deprecated" version of `fn`
 * @api public
 */

function deprecate (fn, msg) {
  if (config('noDeprecation')) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (config('throwDeprecation')) {
        throw new Error(msg);
      } else if (config('traceDeprecation')) {
        console.trace(msg);
      } else {
        console.warn(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
}

/**
 * Checks `localStorage` for boolean values for the given `name`.
 *
 * @param {String} name
 * @returns {Boolean}
 * @api private
 */

function config (name) {
  // accessing global.localStorage can trigger a DOMException in sandboxed iframes
  try {
    if (!global.localStorage) return false;
  } catch (_) {
    return false;
  }
  var val = global.localStorage[name];
  if (null == val) return false;
  return String(val).toLowerCase() === 'true';
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],34:[function(require,module,exports){
module.exports = extend

var hasOwnProperty = Object.prototype.hasOwnProperty;

function extend() {
    var target = {}

    for (var i = 0; i < arguments.length; i++) {
        var source = arguments[i]

        for (var key in source) {
            if (hasOwnProperty.call(source, key)) {
                target[key] = source[key]
            }
        }
    }

    return target
}

},{}],35:[function(require,module,exports){
class Common
{
	constructor(values)
	{
		this.values = values;
		console.log("101");
	}
	
	static inheritsFrom(child, parent)
	{
	    child.prototype = Object.create(parent.prototype);
	}
	
	static getTimeKey()
	{
		var uid = (new Date().getTime()).toString(36);
		return(uid);
	}

	static  jsonToURI(json){ return encodeURIComponent(JSON.stringify(json)); }

	static uriToJSON(urijson){ return JSON.parse(decodeURIComponent(urijson)); }

	static stringifyCommon(obj, replacer, spaces, cycleReplacer)
	{
	  return JSON.stringify(obj, this.serializerCommon(replacer, cycleReplacer), spaces)
	}

	static getDayOfWeek(date)
	{   
	    return ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][ date.getDay() ];
	};
	
	test(test)
	{
		console.log("Common:test:"+test);
	}

	static serializerCommon(replacer, cycleReplacer)
	{
	  var stack = [], keys = []

	  if (cycleReplacer == null) cycleReplacer = function(key, value) {
	    if (stack[0] === value) return "[Circular ~]"
	    return "[Circular ~." + keys.slice(0, stack.indexOf(value)).join(".") + "]"
	  }

	  return function(key, value) {
	    if (stack.length > 0) {
	      var thisPos = stack.indexOf(this)
	      ~thisPos ? stack.splice(thisPos + 1) : stack.push(this)
	      ~thisPos ? keys.splice(thisPos, Infinity, key) : keys.push(key)
	      if (~stack.indexOf(value)) value = cycleReplacer.call(this, key, value)
	    }
	    else stack.push(value)

	    return replacer == null ? value : replacer.call(this, key, value)
	  }
	}

	static getColorFromString(colorString)
	{
		var transparency = 1.0;
		if(colorString.length==6)
		{
			colorString += "ff";
		}
		
		var color = "rgba("+
				parseInt(colorString.substring(0,2), 16)+","+
				parseInt(colorString.substring(2,4), 16)+","+
				parseInt(colorString.substring(4,6), 16)+","+
				parseInt(colorString.substring(6,8), 16)/255.0+")";
		
		return(color);
	}

	static logInsertArray(array,printValueFunction)
	{
		for(var i=0;i<array.length;i++)
		{
			console.log("i="+printValueFunction(array[i]));
		}
	}	
	
	static insertIntoArray(toInsert,array,position)
	{
		array.splice(position,0,toInsert);
	}	
	
	static shuffleArray(array)
	{
	    for (var i = array.length - 1; i > 0; i--) {
	        var j = Math.floor(Math.random() * (i + 1));
	        var temp = array[i];
	        array[i] = array[j];
	        array[j] = temp;
	    }
	    return array;
	}

	static removeItemFromArray(array,item)
	{
		var index = array.indexOf(item);
		if (index > -1)
		{
		    array.splice(index, 1);
		}
	}
	
	static toString(object)
	{
		return(JSON.stringify(object));
	}
}


//<js2node>
module.exports = Common;
console.log("Loading:Common");
//</js2node>

},{}],36:[function(require,module,exports){
var Common = require('../../common/common');
var Position = require('../../nodes/position/position');


class Connector
{
	constructor(connectorFunction,connectorDisplay,name)
	{
		this.nodes = new Array();
		this.connectorFunction = connectorFunction;	
		this.connectorDisplay = connectorDisplay;	
		this.name = name;
		this.connectorKey = name+"#"+Common.getTimeKey();
		if(!name) console.trace("Connector passed in empty name");
	}
	
	getConnectorKey()
	{
		return(this.connectorKey);
	}

	getClientJson()
	{
		var json = {};
		json.connectorKey = this.getConnectorKey();
		json.connectorDisplay = this.connectorDisplay;
		json.connectorDefKey = this.connectorDefKey;
		json.nodes = new Array();
		for(var i=0;i<this.nodes.list;i++)
		{
			json.nodes.push(this.nodes[i].getNodeKey());
		}
		return(json);
	}
	
	executeConnectorFunction(timestamp,node)
	{
		this.connectorFunction(this,node,timestamp)
	}

	containsPostion(position)
	{
		console.log("Node:containsPostion:"+this.name+":default, will always fail");
		return(false);
	}

	addNodeList(nodeList)
	{
		for(var i=0;i<nodeList.length;i++)
		{
			this.addNode(nodeList[i]);
		}
	}

	addNode(node)
	{
		this.nodes.push(node);
		node.connectors.push(this);
	}

	removeNode(node)
	{
		// console.log("Connector removeNode before:"+
		// "node="+node.name+
		// ":this.nodes="+this.nodes.length+
		// ":node.connectors="+node.connectors.length+
		// "");
		Common.removeItemFromArray(this.nodes,node);
		Common.removeItemFromArray(node.connectors,this);
		
		// console.log("Connector removeNode after :"+
		// "node="+node.name+
		// ":this.nodes="+this.nodes.length+
		// ":node.connectors="+node.connectors.length+
		// "");
	}

	initProcessor()
	{
		var positionList = new Array();
		if (this.springAnchorPoint != null)
		{
			if (this.anchorOffsetPoint == null)
			{
				positionList.push(this.springAnchorPoint);
			}
			else
			{
				positionList.push(this.springAnchorPoint.createByAdding(this.anchorOffsetPoint));
			}
		}
		return(positionList);
	}

	calulateMovementExp(node,positionList,randomStrengthFactor,relaxedDistance,elasticityFactor)
	{
		if (positionList.length>0)
		{
			// look at each position and make a new list of positions the
			// "relaxed" distance away
			var animateList = new Array();
			var x = 0.0;
			var y = 0.0;
			for(var i=0;i<positionList.length;i++)
			{
				var position = node.position.getDistanceOnLinePointArrayClosest(
						positionList[i],
						relaxedDistance+(randomStrengthFactor/2-randomStrengthFactor*Math.random())
						);
				x += position.getX()+(randomStrengthFactor/2-randomStrengthFactor*Math.random());
				y += position.getY()+(randomStrengthFactor/2-randomStrengthFactor*Math.random());		
				animateList.push(position);
			}

			// find the average "relaxed" position
			var averagePosition = new Position(x / positionList.length,y / positionList.length);
			var distanceToAveragePosition = node.position.getDistance(averagePosition);

			// take the average position and move towards it based upon the
			// elasticity factor
			var movePosition = averagePosition.getDistanceOnLinePointArrayClosest(
					node.position,
					distanceToAveragePosition * elasticityFactor
					);

			// add this position to the list of points this node needs to move
			// to
			node.positionMoveList.push(movePosition);
		}
	}

	calulateMovement(node,positionList,randomStrengthFactor)
	{
		if (positionList.length>0)
		{
			// look at each position and make a new list of positions the
			// "relaxed" distance away
			var animateList = new Array();
			var x = 0.0;
			var y = 0.0;
			for(var i=0;i<positionList.length;i++)
			{
				var position = node.position.getDistanceOnLinePointArrayClosest(
						positionList[i],
						this.relaxedDistance+randomStrengthFactor*Math.random()
						);
				x += position.getX();
				y += position.getY();		
				animateList.push(position);
			}

			// find the average "relaxed" position
			var averagePosition = new Position(x / positionList.length,y / positionList.length);
			var distanceToAveragePosition = node.position.getDistance(averagePosition);

			// take the average position and move towards it based upon the
			// elasticity factor
			var movePosition = averagePosition.getDistanceOnLinePointArrayClosest(
					node.position,
					distanceToAveragePosition * this.elasticityFactor
					);

			// add this position to the list of points this node needs to move
			// to
			node.positionMoveList.push(movePosition);
		}
	}
}

// <js2node>
module.exports = Connector;
console.log("Loading:Connector");
// </js2node>

},{"../../common/common":35,"../../nodes/position/position":55}],37:[function(require,module,exports){
var Position = require('../../nodes/position/position');
var Connector = require('../../nodes/connector/connector');
var Common = require('../../common/common');

class GroupConnector extends Connector
{
	constructor(connectorDisplay,springAnchorPoint,anchorOffsetPoint,relaxedDistance,elasticityFactor,name)
	{
		super(GroupConnector.processGroupSpringConnectorOneNodeToConnectedNodes,connectorDisplay,name);

		this.springAnchorPoint = springAnchorPoint;
		this.anchorOffsetPoint = anchorOffsetPoint;
		this.relaxedDistance = relaxedDistance;
		this.elasticityFactor = elasticityFactor;
	}
	
	static processGroupSpringConnectorOneNodeToConnectedNodes(connector,node,timestamp)
	{
		var positionList = connector.initProcessor();
		for(var i=0;i<connector.nodes.length;i++)
		{
			var b = connector.nodes[i];
			var distance = node.position.getDistance(b.position);
			if (b != node && distance<connector.relaxedDistance) positionList.push(b.position);		
		}
		connector.calulateMovement(node,positionList,0);
	}

	processWallSpringRepulseOneNode(connector,node,timestamp)
	{
		var positionList = connector.initProcessor();
		for(var i=0;i<connector.nodes.length;i++)
		{
			var b = connector.nodes[i];
			var distance = node.position.getDistance(b.position);
			if (b != node && distance<connector.relaxedDistance) positionList.push(b.position);		
		}
		connector.calulateMovement(node,positionList,0);
	}
}

//<js2node>
module.exports = GroupConnector;
console.log("Loading:GroupConnector");
//</js2node>

},{"../../common/common":35,"../../nodes/connector/connector":36,"../../nodes/position/position":55}],38:[function(require,module,exports){
var Position = require('../../nodes/position/position');
var Connector = require('../../nodes/connector/connector');
var Common = require('../../common/common');

class ShapeConnector extends Connector
{
	constructor(node,connectorDisplay,shape,anchorOffsetPoint,relaxedDistance,elasticityFactor,outsideRelaxedDistance,outsideElasticityFactor,name)
	{
		super(ShapeConnector.processShapeConnectorOneNodeToConnectedNodes,connectorDisplay,name);

		this.node = node;
		this.springAnchorPoint = node.position;
		this.anchorOffsetPoint = anchorOffsetPoint;
		this.relaxedDistance = relaxedDistance;
		this.elasticityFactor = elasticityFactor;
		this.outsideRelaxedDistance = outsideRelaxedDistance;
		this.outsideElasticityFactor = outsideElasticityFactor;
		this.shape = shape;
	}
	
	static processShapeConnectorOneNodeToConnectedNodes(connector,node,timestamp)
	{
	//	var positionList = connector.initProcessor();
		var positionList = new Array();
	
		
		if(!this.shape.containsPosition(node.position,this.node))
		{
			/************
			var onShapeLinePosition = this.shape.findClosestPointInShapeFromStartingPoint(node.position,this.node);
			positionList.push(onShapeLinePosition);
			connector.calulateMovementExp(node,positionList,0.0,this.outsideRelaxedDistance,this.outsideElasticityFactor);
			****************/
			var averagePointTransformed = this.shape.getAveragePointTransformed(this.node)
			//positionList.push(this.node.position);
			positionList.push(averagePointTransformed);
			
			var outsideRelaxDistance = this.outsideRelaxedDistance;
			var outsideElasticityFactor = this.outsideElasticityFactor;
			outsideElasticityFactor = 0.025;
			if(distance>outsideRelaxDistance*1.25) 
			{
				console.log("its outside!!:node="+node.name+" distance="+distance);
				outsideElasticityFactor = 0.01;
			}
				 
			connector.calulateMovementExp(
				node,
				positionList,
				0.0,
				outsideRelaxDistance,
				outsideElasticityFactor);
	
			//connector.calulateMovementExp(node,positionList,0.0,0.0,0.5);
		}
		else
		{
			var shapeArea = this.shape.getShapeArea();
			var minAreaPerNode = shapeArea / connector.nodes.length;
			//var spacing = minAreaPerNode/2;//Math.sqrt(minAreaPerNode);
			var spacing = Math.sqrt(minAreaPerNode)*1.01;//*2.3;
			if(spacing==0) spacing = 1;
			//var spacing = Math.sqrt(minAreaPerNode)*1.3;
			/*
			if(node.isSelected)
			{
				console.log("node name:"+node.name);
				console.log("	shapeArea:"+shapeArea);
				console.log("	minAreaPerNode:"+minAreaPerNode);
				console.log("	spacing:"+spacing);
			}
			*/
	
			this.relaxedDistance = spacing;
			for(var i=0;i<connector.nodes.length;i++)
			{
				var b = connector.nodes[i];
				
				/*
				if(node.isSelected)
				{
					var d = node.position.getDistance(b.position);
	
					console.log("	checking:"+b.name+" distance="+d);
				}
				*/
				if(b != node && this.shape.containsPosition(b.position,this.node))
				{
					var distance = node.position.getDistance(b.position);
					if (distance<spacing)
					{
						positionList.push(b.position);
					}
				}
			}
			//if(node.isSelected) console.log("---------------------------------------------------");
	
			connector.calulateMovementExp(node,positionList,0.0,this.relaxedDistance,this.elasticityFactor);
			// move it to a new spacing distance (still in the shape)
		}
		
		//connector.calulateMovement(node,positionList,0);
	
		//if(shape.containsPosition())
		// if it is not inside the shape move into the shape fast as possible
		//        ..you can cycle through the sides and find the closet intersection point.
		//        ..this can probably be optimized by looking at each point first
		// if it is inside the shape then :
		//        ..find he average distance between the points (only check those so close?!?!?_
		//        if its distance is great than the average then move away for the CON of the sampling
		//        if the distance is less than the average hen move towards the COM of the sampling
		//      ..the average space be able to to be calculated 
		//
		//      function to find the average distance between a list of points
		///     if you look at the area you should be able to dive it by the size o the sampling
		//      to get this average....
		//		if we limited it to a pe slice it is easy... a slice of the pie's area is easy to calculate
		//
		//		for a closed list of polygons it is a sum of triangles... should circles
		// 		be a special case?
		/*
		for(var i=0;i<connector.nodes.length;i++)
		{
			var b = connector.nodes[i];
			if (b != node && distance<connector.relaxedDistance)
			{
				positionList.push(b.position);		
			}
	
			
			var distance = node.position.getDistance(b.position);
			if (b != node && distance<connector.relaxedDistance) positionList.push(b.position);		
		}
		connector.calulateMovement(node,positionList,0);
		*/
	}

	processWallSpringRepulseOneNode(connector,node,timestamp)
	{
		var positionList = connector.initProcessor();
		for(var i=0;i<connector.nodes.length;i++)
		{
			var b = connector.nodes[i];
			var distance = node.position.getDistance(b.position);
			if (b != node && distance<connector.relaxedDistance) positionList.push(b.position);		
		}
		connector.calulateMovement(node,positionList,0);
	}
}

//<js2node>
module.exports = ShapeConnector;
console.log("Loading:ShapeConnector");
//</js2node>

},{"../../common/common":35,"../../nodes/connector/connector":36,"../../nodes/position/position":55}],39:[function(require,module,exports){
var Position = require('../../nodes/position/position');
var Connector = require('../../nodes/connector/connector');
var Common = require('../../common/common');

class SpringConnector extends Connector
{
	constructor(connectorDisplay,springAnchorPoint,anchorOffsetPoint,relaxedDistance,elasticityFactor,name)
	{
		super(SpringConnector.processSpringConnectorOneBeastieToConnectedNodes,connectorDisplay,name);
		this.springAnchorPoint = springAnchorPoint;
		this.anchorOffsetPoint = anchorOffsetPoint;
		this.relaxedDistance = relaxedDistance;
		this.elasticityFactor = elasticityFactor;
	}

	static processSpringConnectorOneBeastieToConnectedNodes(connector,node,timestamp)
	{
		var positionList = connector.initProcessor();
		////////////////////////var positionList = new Array();
		for(var i=0;i<connector.nodes.length;i++)
		{
			var b = connector.nodes[i];
			var distance = node.position.getDistance(b.position);
			if (b != node) positionList.push(b.position);		
		}
		connector.calulateMovement(node,positionList,1.0);
	}
}

//<js2node>
module.exports = SpringConnector;
console.log("Loading:SpringConnector");
//</js2node>

},{"../../common/common":35,"../../nodes/connector/connector":36,"../../nodes/position/position":55}],40:[function(require,module,exports){
var Position = require('../../nodes/position/position');
var Connector = require('../../nodes/connector/connector');
var Common = require('../../common/common');

class  WallConnector extends Connector
{
	constructor(connectorDisplay,springAnchorPoint,anchorOffsetPoint,relaxedDistance,elasticityFactor,name)
	{
		//super(WallConnector.prototype.processWallSpringRepulseOneNode,connectorDisplay);
		super(WallConnector.processWallSpringRepulseOneNode,connectorDisplay,name);

		this.springAnchorPoint = springAnchorPoint;
		this.anchorOffsetPoint = anchorOffsetPoint;
		this.relaxedDistance = relaxedDistance;
		this.elasticityFactor = elasticityFactor;
	}

	static processWallSpringRepulseOneNode(connector,node,timestamp)
	{
		var positionList = connector.initProcessor();
		if((node.position.getX()-node.width/2)<0)
		{
			node.position.setX(0+node.width/2);
		}
		if((node.position.getX()+node.width/2)>node.canvasHolder.getWidth())
		{
			node.position.setX(node.canvasHolder.getWidth()-node.width/2);	
		}
		if((node.position.getY()-node.height/2)<0)
		{
			node.position.setY(0+node.height/2);
		}
		if((node.position.getY()+node.height/2)>node.canvasHolder.getHeight())
		{
			node.position.setY(node.canvasHolder.getHeight()-node.height/2);
		}
		
		connector.calulateMovement(node,positionList,0);
	}
}

//<js2node>
module.exports = WallConnector;
console.log("Loading:WallConnector");
//</js2node>

},{"../../common/common":35,"../../nodes/connector/connector":36,"../../nodes/position/position":55}],41:[function(require,module,exports){
class ConnectorDisplay
{
	constructor(displayInfo)
	{
		ConnectorDisplay.createConnectorDisplay(this,displayInfo);
	}

	static createConnectorDisplay(connectorDisplay,displayInfo)
	{
		connectorDisplay.displayInfo = displayInfo;
	}

	drawConnector(canvasHolder,connector,node)
	{
	}

	containsPostion(position,connector)
	{
		return(false);
	}
}

//<js2node>
module.exports = ConnectorDisplay;
console.log("Loading:ConnectorDisplay");
//</js2node>

},{}],42:[function(require,module,exports){
var ConnectorDisplay = require('../../nodes/connectordisplay/connectordisplay');

class ConnectorDisplayEmpty extends ConnectorDisplay
{
	constructor(displayInfo) 
	{
		super(displayInfo);
	}

	drawConnector(canvasHolder,connector,node)
	{
	}
}
//<js2node>
module.exports = ConnectorDisplayEmpty;
console.log("Loading:ConnectorDisplayEmpty");
//</js2node>

},{"../../nodes/connectordisplay/connectordisplay":41}],43:[function(require,module,exports){
var Position = require('../nodes/position/position');
var CanvasHolder= require('../nodes/nodecanvas/canvasholder');
var Common = require('../common/common');

class Node
{
  constructor(name,position,canvasHolder,graphDataKey,infoData)
  {
		this.name = name;
		this.canvasHolder = canvasHolder;
		this.position = position;
		this.graphDataKey = graphDataKey;
		this.graphData = this.canvasHolder.getGraphData(this.graphDataKey);
		if(infoData==null)
		{
			console.log("info data was null : "+this.name);
			infoData = {};
		}
		else
		{
			
			console.log("info data passed in for  : "+this.name +" infoData="+Common.toString(infoData));
			console.log("info data passed in for  : "+this.name);
		}
		this.infoData = infoData;
		
		this.nodes = new Array();
		this.nodeMap = {};
		this.positionMoveList = new Array();
		this.connectors = new Array();
		this.isAnimated = true;
		this.isSelected = false;
		this.layer=0;

		
		//if(!this.infoData.nodeKey)
		if(!this.infoData.hasOwnProperty("nodeKey"))
		{
			console.log("making new nodeKey for : "+this.name);
			this.infoData.nodeKey =
			{
					key:Common.getTimeKey(),
					nodeId:"root",
			}
		}
		this.infoData.nodeKey.parentNodeKey = function(){return("");};
		
		this.connectorPosition = new Position(0,0);

		if(this.graphData.initGraphData!=null) this.graphData.initGraphData(this);		
  }

  
  getClientJson()
  {
	  var json = this.getNodeJson({});
	  
	  json.nodeTree = this.getClientJsonNodeTree();
	  
	  json.nodeMap = {};
	  var allNodesArray = this.getAllNodesArray(new Array());
	  for(var i=0;i<allNodesArray.length;i++)
	  {
		  var node = allNodesArray[i];
		  json.nodeMap[node.getNodeKey()] = node.getNodeJson({});
	  }
	  
	  json.connectorMap = {};
	  var allConnectorsArray = this.getAllConnectorsArray(new Array());	  
	  for(var i=0;i<allConnectorsArray.length;i++)
	  {
		  var connector = allConnectorsArray[i];
		  json.connectorMap[connector.getConnectorKey()] = connector.getClientJson({});
	  }

	  JSON.stringify(json);
	  return(json)
  }
  
  getNodeJson(json)
  {
	  json.name = this.name;
	  json.graphDataKey = this.graphDataKey;
	  json.infoData = this.infoData;
	  //json.infoData.nodeKey = this.getNodeKey();
	  json.position = this.position.getClientJson();
	  json.connectors = new Array();
	  for(var i=0;i<this.connectors.length;i++) json.connectors.push(this.connectors[i].getConnectorKey());

	  return(json);
  }
  
  getAllNodesArray(arrayOfNodes)
  {
	  for(var i=0;i<this.nodes.length;i++)
	  {
		  var node = this.nodes[i];
		  arrayOfNodes.push(node);
		  node.getAllNodesArray(arrayOfNodes);
	  }
	  return(arrayOfNodes);
  }
  
  getAllConnectorsArray(arrayOfConnectors)
  {
	  for(var i=0;i<this.nodes.length;i++)
	  {
		  var node = this.nodes[i];
		  for(var j=0;j<node.connectors.length;j++)
		  {
			  var connector = node.connectors[j];
			  arrayOfConnectors.push(connector);
		  }
		  node.getAllConnectorsArray(arrayOfConnectors);
	  }
	  return(arrayOfConnectors);
  }
  
    
  getClientJsonNodeTree()
  {
	  var json = {};
	  json.nodeKey = this.getNodeKey();

	  json.nodes = new Array();
	  for(var i=0;i<this.nodes.length;i++)
	  {
		  json.nodes.push(this.nodes[i].getClientJsonNodeTree());	  
	  }
	  JSON.stringify(json);
	  return(json)
  }
  
  
  drawCanvas(timestamp)
  {
  	this.setAnimationTimes();

  	this.clearCanvas();
  	
      for(var i=0;i<this.nodes.length;i++)
      {
          var node = this.nodes[i];
          if(this.isAnimated) node.animateCalculate(timestamp);
      }

      for(var i=0;i<this.nodes.length;i++)
      {
      	var node = this.nodes[i];
      	if(this.isAnimated)  node.animateFinalize(timestamp);
      	node.drawCanvas(timestamp);
      }
      
      if(this.canvasHolder.isDrawable())
      {
    	  this.drawConnectors(); 
    	  this.drawNodes();
      }
      if(this.extraAnimation!=null) this.extraAnimation(timestamp);
      
      this.draw();
      this.debugFunction();
  }


	getNodeUiDisplay(node)
	{
		return(this.name);
	}
	
	getNodeKey()
	{
   	    //console.log("Node:getNodeKey:START:name="+this.name);
   	    //console.log("Node:getNodeKey:START:infoData="+Common.toString(this.infoData));

		//if(!this.nodeKey) console.log("XXXXXXXXXXX:"+this.name);
   	    //var key = this.nodeKey.parentNodeKey()+":"+this.nodeKey.nodeId+":"+this.nodeKey.ts.getTime();
   	    //console.log(".....getNodeKey:END:name="+this.name);
   	    var key = this.infoData.nodeKey.parentNodeKey()+":"+this.infoData.nodeKey.nodeId+"_"+this.infoData.nodeKey.key;
		return(key);
		
	}
	/*
	 * 		this.nodeKey = 
			{
				ts:new Date(),
				parentNodeKey:function(){return("root");},
				nodeId:-1,
			}
	 */
	
	doesNodeExist(nodeKey)
	{
		return( this.nodeMap.hasOwnProperty(nodeKey) );
	}
	
	getNode(nodeKey)
	{
		if(!this.doesNodeExist(nodeKey))
		{
			Object.keys(this.nodeMap).forEach(function (key)
					{
						console.log("key="+key)
					});
			throw "nodeKey does not exist : '"+nodeKey+"'";
		}
		return(this.nodeMap[nodeKey]);
	}
	
	getNodeListFromMap()
	{
		var nodeList = new Array();
		Object.keys(this.nodeMap).forEach(function (key)
		{
			nodeList.push(nodeMap[key]);
		});
		return(nodeList);
	}
	
	addNode(node)
	{
		this.nodes.push(node);
   	    //console.log("Node:addNode:parent.name="+this.name+ " toAdd.name="+node.name);
   	    //console.log(".....addNode:parent.name="+this.name+ " getNodeKey()="+this.getNodeKey());
		
		if(node.infoData.nodeKey.nodeId=="root") node.infoData.nodeKey.nodeId = this.nodes.length;
		var self = this;
		node.infoData.nodeKey.parentNodeKey = function(){ return(self.getNodeKey()); };
		
		//console.log(Common.toString(this.canvasHolder));

		node.canvasHolder = this.canvasHolder.clone(node.position);
		//console.log("addNode node.canvasHolder:"+CommontoString(node.canvasHolder));
		this.nodes.sort(function(a, b) {
	  	  return(a.layer-b.layer);
	  	});	
		
		this.nodeMap[node.getNodeKey()] = node;
   	    //console.log(".....addNode:ADDED:parent.name="+this.name+ " added.name="+node.name);
   	    //console.log(".....addNode:ADDED:parent.name="+this.name+ " getNodeKey()="+this.getNodeKey());

	}
	
	removeNode(node)
	{
		Common.removeItemFromArray(this.nodes,node);
		delete this.nodeMap[node.getNodeKey()];

	}
	
	clearCanvas(timestamp)
	{
	}
	
	draw()
	{
	}
	
	
	drawConnectors(timestamp)
	{
		if(this.isVisable) 
		{
		    for(var i=0;i<this.nodes.length;i++)
		    {
		    	var node = this.nodes[i];
		    	for(var j=0;j<node.connectors.length;j++)
		    	{
		    		var connector = node.connectors[j];
		    		//console.log("drawing connector:"+connector.name);
		    		connector.connectorDisplay.drawConnector(this.canvasHolder,connector,node);
		        }
		    }
		}
	}
	
	drawNodes(timestamp)
	{
		if(this.isVisable) 
		{
		   	for(var i=0;i<this.nodes.length;i++)
		   	{
		   		var node = this.nodes[i]; 
		   		if(this.isVisable) node.graphData.nodeDisplay.drawNode(this.canvasHolder,node);
		   	}
		}
	}
	
	setAnimationTimes(timestamp)
	{
	}
	
	debugFunction()
	{
	}
	
	getNodeContainingPosition(position)
	{
		var foundNode = null;
	
	    for (var i=this.nodes.length-1;i>=0;i--)
	    {
	        var node = this.nodes[i];
	        if(node.graphData.nodeDisplay.containsPosition(position,node))
	        {
	        	foundNode = node;
	        	break;
	        }
	    }
	    return(foundNode);
	}
	
	
	
	animateCalculate(timestamp)
	{
		if(this.isAnimated)
		{
			for (var i = 0; i < this.connectors.length; i++)
			{
				var connector = this.connectors[i];
				connector.executeConnectorFunction(timestamp,this)
			}
		}
	}
	
	animateFinalize(timestamp)
	{
		//if(this.isAnimated)
		{
			for (var i = 0; i < this.connectors.length; i++)
			{
				this.setNewPosition();
			}
			this.positionMoveList.length = 0;
	
		}
	}
	
	containsPostion(position)
	{
		return(
				(
						(this.position.getX()-this.width/2)<=position.getX() &&
						(this.position.getX()+this.width/2)>=position.getX() &&
						(this.position.getY()-this.height/2)<=position.getY() &&
						(this.position.getY()+this.height/2)>=position.getY()
				)
			);
	}
	
	setNewPosition()
	{
		if(this.positionMoveList.length==0)  this.positionMoveList.push(this.position);	
		var newPosition = new Position(0,0);
		
		for (var i = 0; i < this.positionMoveList.length; i++)
	    {
	        var onePosition =  this.positionMoveList[i];
	        newPosition.setX(newPosition.getX()+onePosition.getX());
	        newPosition.setY(newPosition.getY()+onePosition.getY());
		}
		
		var newX = newPosition.getX() / this.positionMoveList.length;
		var newY = newPosition.getY() / this.positionMoveList.length;
		
		this.position.setX(newX);
		this.position.setY(newY);		
	}

}

//<js2node>
module.exports = Node;
console.log("Loading:Node");
//</js2node>

},{"../common/common":35,"../nodes/nodecanvas/canvasholder":45,"../nodes/position/position":55}],44:[function(require,module,exports){
class CanvasDef
{
	constructor()
	{		
	}
	
	getWorldDispaly()
	{
		throw "CanvasDef.getWorldDispaly not defined";
	}
	
	getWorldDefaults()
	{
		throw "CanvasDef.getWorldDefaults not defined";
	}
}

//<js2node>
module.exports = CanvasDef;
console.log("Loading:CanvasDef");
//</js2node>

},{}],45:[function(require,module,exports){
var Position = require('../../nodes/position/position');
var Common = require('../../common/common');

class CanvasHolder
{
	constructor(canvasName,worldDef)
	{
		this.canvasName = canvasName;
		this.worldDef = worldDef;		
		this.origin = new Position(0,0);
		this.init(canvasName,worldDef);
	}
	
	init(canvasName,worldDef)
	{
		this.isCanvasVisable = true;
		this.isCanvasDrawable = true;
		this.canvas = document.getElementById(this.canvasName);			
		this.context = this.canvas.getContext('2d');
		/*if (typeof document !== 'undefined')
		{
			this.canvas = document.getElementById(this.canvasName);			
			this.context = this.canvas.getContext('2d');
		}*/
	}
	
	static createCanvasHolderFromClientJson(worldDef,json)
	{
	  var canvasHolder = new CanvasHolder(json.canavsName,worldDef);
	  return(canvasHolder);
	}
	  getClientJson()
	  {
		  var json = {};
		  
		  
		  json.canvasName = this.canvasName;
		  json.origin = this.origin;
		  json.width = this.getWidth();
		  json.height = this.getHeight();
		  json.worldDef = this.worldDef;
		  
		  JSON.stringify(json);
		  return(json)
	  }
	
	getConnector(connectorDefKey,name)
	{
		var connector = this.getConnectorDef(connectorDefKey)(this.worldDef,name);
		connector.connectorDefKey = connectorDefKey;
		return(connector);
	}
	
	getConnectorDef(connectorDefKey)
	{
		var connectorDef = this.worldDef.worldDisplay.connectorDefs["generic"];
		
		var foundConnectorDef = false;
		if(this.worldDef.worldDisplay.connectorDefs.hasOwnProperty(connectorDefKey))
		{
			connectorDef = this.worldDef.worldDisplay.connectorDefs[connectorDefKey];
			foundConnectorDef = true;
		}
		if(!foundConnectorDef) console.trace("CanvasHolder:getConnectorDef:connectorDefKey=\""+connectorDefKey+ "\" was not found using generic");
		else console.log("found connector display :"+connectorDefKey);
		connectorDef.connectorDefKey = connectorDefKey;
		return(connectorDef);
	}
	
	getConnectorDisplay(connectorDisplayKey)
	{
		var connectorDisplay = this.worldDef.worldDisplay.connectorDisplay["generic"];
		
		var foundConnectorDisplay = false;
		if(this.worldDef.worldDisplay.connectorDisplay.hasOwnProperty(connectorDisplayKey))
		{
			connectorDisplay = this.worldDef.worldDisplay.connectorDisplay[connectorDisplayKey];
			foundConnectorDisplay = true;
		}
		if(!foundConnectorDisplay) console.trace("CanvasHolder:getConnectorDisplay:connectorDisplayKey=\""+connectorDisplayKey+ "\" was not found using generic");
		connectorDisplay.connectorDisplayKey = connectorDisplayKey;
		return(connectorDisplay);
	}
	
	getGraphData(graphDataKey)
	{
		var graphData = this.worldDef.worldDisplay.nodeDisplay["generic"];	
		var foundGraphData = false;
		if(this.worldDef.worldDisplay.nodeDisplay.hasOwnProperty(graphDataKey))
		{
			graphData = this.worldDef.worldDisplay.nodeDisplay[graphDataKey];
			foundGraphData = true;
		}
		if(!foundGraphData) console.trace("CanvasHolder:getGraphData:graphDataKey=\""+graphDataKey+ "\" was not found using generic")
		//console.trace("CanvasHolder:getGraphData:graphDataKey=\""+graphDataKey+ "\" was not found using generic")
		//console.log("FOR:"+graphDataKey+Common.toString(graphData));
		//console.log("getGraphData:graphDataKey="+graphDataKey+":clone="+graphData.nodeDisplay.displayInfo.clone);

		//if(graphData.nodeDisplay.displayInfo.clone)
		if(graphData.nodeDisplayFunction)
		{
			//console.log("getGraphData:graphDataKey:FOUND A FUNCTION:"+graphDataKey);
			graphData = Object.create(graphData);
			graphData.nodeDisplay = graphData.nodeDisplayFunction();
			//console.log("CLONING:"+graphDataKey+Common.toString(graphData));
			//graphData.nodeDisplay.displayInfo = Object.create(graphData.nodeDisplay.displayInfo);
			//graphData.nodeDisplay.displayInfo  = JSON.parse(JSON.stringify(graphData.nodeDisplay.displayInfo));
			//graphData.nodeDisplay.displayInfo  = JSON.parse(JSON.stringify(graphData.nodeDisplay.displayInfo));
			//graphData = Object.create(graphData);
			//graphData.nodeDisplay.displayInfo.ts = new Date().getTime();


		}

		graphData.graphDataKey = graphDataKey;
		return(graphData);
	}
	
	clone(origin)
	{
		var canvasHolder = new CanvasHolder(this.canvasName,this.worldDef);
		canvasHolder.origin = origin;
		/*
		var canvasHolder = new Object();
		canvasHolder.origin = origin;
		
		canvasHolder.canvasName = this.canvasName;
		canvasHolder.canvas = this.canvas;
		canvasHolder.context = this.context;
		canvasHolder.isCanvasVisable = this.isCanvasVisable;
		canvasHolder.isCanvasDrawable = this.isCanvasDrawable;
		canvasHolder.isDrawable = this.isDrawable;
		canvasHolder.isVisable = this.isVisable;
		canvasHolder.getWidth = this.getWidth;
		canvasHolder.getHeight = this.getHeight;
		canvasHolder.worldDef = this.worldDef;
		canvasHolder.getGraphData = this.getGraphData;
		*/
		
		return(canvasHolder);
	}
	
	isDrawable()
	{
		return(this.isCanvasDrawable);
	}
	
	isVisable()
	{
		return(this.isCanvasVisable);
	}
	
	getWidth()
	{
		return(this.canvas.width);
	}
	
	getHeight()
	{
		return(this.canvas.height);
	}
}


//<js2node>
module.exports = CanvasHolder;
console.log("Loading:CanvasHolder");
//</js2node>

},{"../../common/common":35,"../../nodes/position/position":55}],46:[function(require,module,exports){
var CanvasHolder = require('../../nodes/nodecanvas/canvasholder');
var Common = require('../../common/common');


class CanvasHolderVirtual extends CanvasHolder
{
	constructor(canvasName,worldDef,width,height,origin)
	{
		super(canvasName,worldDef);
		this.width = width;
		this.height = height;
	}
	
	init(canvasName,worldDef)
	{
		this.canvas = null;
		this.context = null;
		this.isCanvasVisable = false;
		this.isCanvasDrawable = false;
	}

	clone(origin)
	{
		var canvasHolder = new CanvasHolderVirtual(this.canvasName,this.worldDef,this.width,this.height,origin);
		return(canvasHolder);
	}

	getWidth()
	{
		return(this.width);
	}

	getHeight()
	{
		return(this.height);
	}
}
//<js2node>
module.exports = CanvasHolderVirtual;
console.log("Loading:CanvasHolderVirtual");
//</js2node>

},{"../../common/common":35,"../../nodes/nodecanvas/canvasholder":45}],47:[function(require,module,exports){
class MouseStatus
{
	constructor(isDown,startPosition,position,node,nodeStartPosition)
	{
		this.isDown = isDown;
		this.startPosition = startPosition;
		this.position = position;
		this.node = node;
		this.nodeStartPosition = nodeStartPosition;
	}
}
//<js2node>
module.exports = MouseStatus;
console.log("Loading:MouseStatus");
//</js2node>

},{}],48:[function(require,module,exports){
var Position = require('../position/position');
var Node = require('../node');
var Common = require('../../common/common');

class NodeCanvas extends Node
{
	  constructor(canvasHolder)
	  {
		  super(	canvasHolder.canvasName,
					new Position(0,0),
					canvasHolder,
					"generic",
					null);
		  NodeCanvas.initNodeCanvas(this,canvasHolder);
		  
	  }
	  
	  static initNodeCanvas(nodeCanvas,canvasHolder)
	  {
			nodeCanvas.extraAnimation = null;
			nodeCanvas.canvasHolder = canvasHolder;
			nodeCanvas.startAnimationTimeStamp = null;
			nodeCanvas.lastAnimationTimeStamp = null;
			nodeCanvas.startAnimationDate = null;
			nodeCanvas.animationExecTime = 0;
			nodeCanvas.timeFactor = 1;
			nodeCanvas.worldUpdateQueueProcessed = new Array();

		}
	  
	  getWorldUpdatesProcessed(timeStamp,maxItems)
		{
			var worldUpdateArray = new Array();
			var first = null;
			for(var i=0;i<this.worldUpdateQueueProcessed.length &&
				worldUpdateArray.length<maxItems;i++)
			{
				var worldUpdate = this.worldUpdateQueueProcessed[i];

				if(worldUpdate.processTimestamp>timeStamp) 
				{
					worldUpdateArray.push(worldUpdate);
					/*
					console.log("      getWorldUpdatesProcessed"+
							":worldUpdate.processTimestamp="+worldUpdate.processTimestamp+
							":readyToBeProcessed="+worldUpdate.readyToBeProcessed(timeStamp)+
							":timeStamp="+timeStamp);
					*/
				}
			}
			/*
			console.log("getWorldUpdatesProcessed"+
					":timeStamp="+timeStamp+
					":maxItems="+maxItems+
					":found="+worldUpdateArray.length);
					*/
			return(worldUpdateArray);
		}
	
	  getWorldClientJson()
	  {
		  var json = {};
		  
		  json.nodeGraph = super.getClientJson();
		  json.canvasHolder = this.canvasHolder.getClientJson();
		  JSON.stringify(json);
		  return(json)
	  }
	
	isVisable()
	{
		return(this.canvasHolder.isVisable())
	}
	
	pointerUp(node)
	{
		//console.log("NodeCanvas.pointerUp:"+node.name)
	}
	
	pointerMove(node)
	{
		//console.log("NodeCanvas.pointerMove:"+node.name)
	}
	
	pointerDown(node)
	{
		//console.log("NodeCanvas.pointerDown:"+node.name)
	}
	
	pause()
	{
		this.isAnimated = false;
	}
	
	play()
	{
		this.isAnimated = true;
	    this.draw();
	}
	draw()
	{
		var self = this;
		if(this.canvasHolder.isDrawable())
			requestAnimationFrame(function(timestamp) { self.drawCanvas(timestamp) }, false);
	}
	
	
	setAnimationTimes(timestamp)
	{
		if(this.startAnimationTimeStamp==null) this.startAnimationTimeStamp = timestamp+0;
		if(this.startAnimationDate==null) this.startAnimationDate = new Date();
		var now = new Date();
		if(this.lastAnimationTimeStamp==null) this.lastAnimationTimeStamp = now;
	
		if(this.isAnimated)
		{
			this.animationExecTime += now.getTime()-this.lastAnimationTimeStamp.getTime();
			//console.log("now="+now+
			//	" lastAnimationTimeStamp="+this.lastAnimationTimeStamp+
			//	" animationExecTime="+this.animationExecTime+
			//	"");
		}
		this.lastAnimationTimeStamp = now;
	
	}
	
	
	clearCanvas(timestamp)
	{
		if(this.isVisable() && this.canvasHolder.isDrawable())
		{
			this.canvasHolder.context.clearRect(0, 0, this.canvasHolder.getWidth(), this.canvasHolder.canvas.height);
			this.canvasHolder.context.fillStyle = Common.getColorFromString(this.fillStyle)
			this.canvasHolder.context.fillRect(0, 0, this.canvasHolder.getWidth(), this.canvasHolder.getHeight());
		}
	}
}

//<js2node>
module.exports = NodeCanvas;
console.log("Loading:NodeCanvas");
//</js2node>

},{"../../common/common":35,"../node":43,"../position/position":55}],49:[function(require,module,exports){
var MouseStatus = require('../../nodes/nodecanvas/mousestatus');
var Position = require('../../nodes/position/position');
var Common = require('../../common/common');

class NodeCanvasMouse
{
	constructor(nodeCanvas)
	{
		NodeCanvasMouse.createNodeCanvasMouse(this,nodeCanvas);
	}

	static createNodeCanvasMouse(nodeCanvasMouse,nodeCanvas)
	{
		nodeCanvasMouse.nodeCanvas = nodeCanvas;
		if(nodeCanvas.isVisable()) 
		{
			nodeCanvasMouse.offset = NodeCanvasMouse.getCanvasOffset(nodeCanvas.canvasHolder.canvas);
			nodeCanvasMouse.mouseStatus = new MouseStatus(false,new Position(0,0),new Position(0,0),null,null);
			nodeCanvasMouse.initCavansPointer();
			nodeCanvasMouse.nodeMouseMovment = {};
		}
	}
	
	static getCanvasOffset(obj)
	{
	    var offsetLeft = 0;
	    var offsetTop = 0;
	    do
	    {
	      if (!isNaN(obj.offsetLeft))
	      {
	          offsetLeft += obj.offsetLeft;
	      }
	      if (!isNaN(obj.offsetTop))
	      {
	          offsetTop += obj.offsetTop;
	      }   
	    }
	    while(obj = obj.offsetParent );
	    
	    return {left: offsetLeft, top: offsetTop};
	}

	pointerDownEvent(event)
	{
		var eventPosition = new Position(event.pageX-this.offset.left,event.pageY-this.offset.top);
		this.hideCurrentNodeInfo();
	
		this.mouseStatus.isDown = true;
		this.mouseStatus.startPosition = eventPosition;
		this.mouseStatus.position = eventPosition;
		if(this.mouseStatus.node!=null)
		{
			this.mouseStatus.node.isAnimated = true;
			this.mouseStatus.node.isSelected = false;
			this.mouseStatus.node = null;
		}
		
		var clickNode =  this.nodeCanvas.getNodeContainingPosition(eventPosition);
	
		var clickNode =  this.nodeCanvas.getNodeContainingPosition(eventPosition);
		if(clickNode!=null && clickNode!=this.mouseStatus.lastNode)
		{
			this.mouseStatus.node = clickNode;
			this.mouseStatus.nodeStartPosition = clickNode.position.clone();
			this.mouseStatus.node.isSelected = true;
			this.mouseStatus.offset = clickNode.position.getDelta(eventPosition);
			this.nodeCanvas.pointerDown(clickNode);
			
			this.showCurrentNodeInfo();
		}
		
		if(clickNode==null)
		{
			this.hideCurrentNodeInfo();
		}
		
		if(this.mouseStatus.lastNode)
		{
			this.hideCurrentNodeInfo();
			this.mouseStatus.lastNode.isSelected = false;
			this.mouseStatus.lastNode = null;
		}
	
	}
	
	showCurrentNodeInfo()
	{
		var htmlObject = document.getElementById("nodeinfo");
		if(htmlObject!=null)
		{
			htmlObject.style.left = this.mouseStatus.node.position.getX()+30+'px';
			htmlObject.style.top  = this.mouseStatus.node.position.getY()+'px';
			htmlObject.style.visibility = 'visible';
			$('#nodeinfo').html(this.mouseStatus.node.getNodeUiDisplay());
		}
		
		console.log("name:"+this.mouseStatus.node.name+"\n"+
				"	isSelected:"+this.mouseStatus.node.isSelected+"\n"+
				"	isSelected:"+this.mouseStatus.node.isAnimated+"\n"+
				"	position:"+Common.toString(this.mouseStatus.node.position)+"\n"+
				"	isSelected:"+this.mouseStatus.node.isSelected+
				"---------------------------------------------"+
			"");
	}
	
	hideCurrentNodeInfo()
	{
		var htmlObject = document.getElementById("nodeinfo");
		if(htmlObject!=null)
		{
			htmlObject.style.left = 0+'px';
			htmlObject.style.top  = 0+'px';
			htmlObject.style.visibility = 'hidden';
			$('#nodeinfo').html();
		}
	}
	
	pointerMoveEvent(event)
	{
		var eventPosition = new Position(event.pageX-this.offset.left,event.pageY-this.offset.top);
		if(this.mouseStatus.isDown)
		{
			this.hideCurrentNodeInfo();
	
			if(this.mouseStatus.node!=null)
			{
				this.mouseStatus.node.isAnimated = false;
				this.mouseStatus.position = eventPosition;
				var deltaPosition = this.mouseStatus.nodeStartPosition.getDelta(eventPosition);
				
				this.mouseStatus.node.position.setX(
						this.mouseStatus.nodeStartPosition.getX()-
						deltaPosition.getX()+
						this.mouseStatus.offset.getX());
				
				this.mouseStatus.node.position.setY(
						this.mouseStatus.nodeStartPosition.getY()-
						deltaPosition.getY()+
						this.mouseStatus.offset.getY());
				
				this.nodeCanvas.pointerMove(this.mouseStatus.node);
				
				if(!this.nodeMouseMovment.hasOwnProperty(this.mouseStatus.node.getNodeKey()))
				{
					this.nodeMouseMovment[this.mouseStatus.node.getNodeKey()] =
					{
							movePostionArray:new Array()
					}
				}
				this.nodeMouseMovment[this.mouseStatus.node.getNodeKey()].movePostionArray.push(this.mouseStatus.node.position.clone());
			}
		}
		else
		{
		}
	}
	
	pointerUpEvent(event)
	{
		if(this.mouseStatus.node!=null)
		{
			this.nodeCanvas.pointerUp(this.mouseStatus.node);
			this.mouseStatus.node.isAnimated = true;
			//this.mouseStatus.node.isSelected = false;
			this.mouseStatus.lastNode = this.mouseStatus.node;
	
			this.mouseStatus.node = null;
		}
		this.mouseStatus.isDown = false;
	}
	
	initCavansPointer()
	{
		var self = this;
		if(window.PointerEvent)
		{
			this.nodeCanvas.canvasHolder.canvas.addEventListener("pointerdown", function(event) { self.pointerDownEvent( event) }, false);
			this.nodeCanvas.canvasHolder.canvas.addEventListener("pointermove",function(event) { self.pointerMoveEvent( event) }, false);
			this.nodeCanvas.canvasHolder.canvas.addEventListener("pointerup",function(event) { self.pointerUpEvent( event) }, false);
	    }
	    else
	    {
	    	this.nodeCanvas.canvasHolder.canvas.addEventListener("mousedown",function(event) { self.pointerDownEvent( event) }, false);
	    	this.nodeCanvas.canvasHolder.canvas.addEventListener("mousemove",function(event) { self.pointerMoveEvent( event) }, false);
	    	this.nodeCanvas.canvasHolder.canvas.addEventListener("mouseup", function(event) { self.pointerUpEvent( event) }, false);
	    }  
	}
}

//<js2node>
module.exports = NodeCanvasMouse;
console.log("Loading:NodeCanvasMouse");
//</js2node>

},{"../../common/common":35,"../../nodes/nodecanvas/mousestatus":47,"../../nodes/position/position":55}],50:[function(require,module,exports){
var Position = require('../../nodes/position/position');
var NodeDisplay = require('../../nodes/nodedisplay/nodedisplay');
var Common = require('../../common/common');
var Shape = require('../../nodes/shapes/shape');

class ArcDisplayShape extends NodeDisplay
{
	constructor(displayInfo)
	{
		super(displayInfo);
		this.pointList = new Array();
		this.shape = null;
		this.init();
		
	}
	
	init()
	{
		this.pointList.length = 0;
		this.angle = Math.abs(this.displayInfo.endAngle,this.displayInfo.startAngle);
		var angleInc = this.angle / this.displayInfo.curvePoints;
		
		this.pointList.push(new Position(0,0));
		for(var angle=this.displayInfo.startAngle;
			angle<=this.displayInfo.endAngle && angleInc>0;
			angle=angle+angleInc)
		{
			if( (angle+angleInc) > this.displayInfo.endAngle )
			{
				if(angle!=this.displayInfo.endAngle) angle = this.displayInfo.endAngle ;
			}
			var rads = angle * (Math.PI/180);
			this.pointList.push(
					new Position(
							this.displayInfo.radius*Math.cos(rads),
							this.displayInfo.radius*Math.sin(rads))
					);	
		}
		
		this.pointList.push(new Position(0,0));
		if(this.shape==null) this.shape = new Shape(this.pointList);
		else this.shape.initShape();
	}
	
	containsPosition(position,node)
	{
		var distance = node.position.getDistance(position);
		return(distance<=this.displayInfo.radius);
	}
	
	
	drawNodex(canvasHolder,node)
	{

	}
	
	drawNode(canvasHolder,node)
	{
		super.drawNode(canvasHolder,node);

	    if(node.isSelected)
	    {
	    	canvasHolder.context.fillStyle = Common.getColorFromString(this.displayInfo.selectFillColor);
	    	canvasHolder.context.strokeStyle = Common.getColorFromString(this.displayInfo.selectBorderColor);
	    }
	    else
	    {
	    	canvasHolder.context.fillStyle = Common.getColorFromString(this.displayInfo.fillColor);
	    	canvasHolder.context.strokeStyle = Common.getColorFromString(this.displayInfo.borderColor);
	    }
	   /* 
	    canvasHolder.context.beginPath();
	    canvasHolder.context.arc(node.position.getX(),node.position.getY(),this.displayInfo.radius,0,Math.PI * 2, false);
	    canvasHolder.context.closePath();
	    canvasHolder.context.fill();
	    canvasHolder.context.lineWidth = this.displayInfo.borderWidth;
	    canvasHolder.context.stroke();
	    */
	    canvasHolder.context.beginPath(); //Begins drawing the path. See link in "Edit" section
	    canvasHolder.context.moveTo(node.position.getX(),node.position.getY()); //Moves the beginning position to cx, cy (100, 75)
	    canvasHolder.context.arc(node.position.getX(),node.position.getY(),
	    		this.displayInfo.radius,
	    		this.toRadians(this.displayInfo.startAngle),
	    		this.toRadians(this.displayInfo.endAngle)); //	ctx.arc(cx, cy, radius, startAngle, endAngle, counterclockwise (optional));
	    canvasHolder.context.lineTo(node.position.getX(),node.position.getY()); //Draws lines from the ends of the arc to cx and cy
	    canvasHolder.context.closePath(); //Finishes drawing the path
	    canvasHolder.context.fill(); //Actually draws the shape (and fills)
	    canvasHolder.context.lineWidth = this.displayInfo.borderWidth;
	    canvasHolder.context.stroke();
	}
	//this.displayInfo.endAngle,this.displayInfo.startAngle
	toRadians(deg)
	{
	    return deg * Math.PI / 180 //Converts degrees into radians
	}
}
//<js2node>
module.exports = ArcDisplayShape;
console.log("Loading:ArcDisplayShape");
//</js2node>

},{"../../common/common":35,"../../nodes/nodedisplay/nodedisplay":52,"../../nodes/position/position":55,"../../nodes/shapes/shape":57}],51:[function(require,module,exports){
var Position = require('../../nodes/position/position');
var NodeDisplay = require('../../nodes/nodedisplay/nodedisplay');
var Common = require('../../common/common');


class CircleDisplay extends NodeDisplay
{
	constructor(displayInfo)
	{
		super(displayInfo);
	}
	
	containsPosition(position,node)
	{
		var distance = node.position.getDistance(position);
		return(distance<=this.displayInfo.radius);
	}
	
	
	drawNode(canvasHolder,node)
	{
		super.drawNode(canvasHolder,node);

	    if(node.isSelected)
	    {
	    	canvasHolder.context.fillStyle = Common.getColorFromString(this.displayInfo.selectFillColor);
	    	canvasHolder.context.strokeStyle = Common.getColorFromString(this.displayInfo.selectBorderColor);
	    }
	    else
	    {
	    	canvasHolder.context.fillStyle = Common.getColorFromString(this.displayInfo.fillColor);
	    	canvasHolder.context.strokeStyle = Common.getColorFromString(this.displayInfo.borderColor);
	    }
	    
	    canvasHolder.context.beginPath();
	    canvasHolder.context.arc(node.position.getX(),node.position.getY(),this.displayInfo.radius,0,Math.PI * 2, false);
	    canvasHolder.context.closePath();
	    canvasHolder.context.fill();
	    canvasHolder.context.lineWidth = this.displayInfo.borderWidth;
	    canvasHolder.context.stroke();
	}
}
//<js2node>
module.exports = CircleDisplay;
console.log("Loading:CircleDisplay");
//</js2node>

},{"../../common/common":35,"../../nodes/nodedisplay/nodedisplay":52,"../../nodes/position/position":55}],52:[function(require,module,exports){
var Common = require('../../common/common');
var Position = require('../../nodes/position/position');

class NodeDisplay
{
	constructor(displayInfo)
	{
		NodeDisplay.createNodeDisplay(this,displayInfo);
	}
	
	static createNodeDisplay(nodeDisplay,displayInfo)
	{
		nodeDisplay.displayInfo = displayInfo;
	}
	
	drawNode(canvasHolder,node)
	{
		this.drawPosition = new Position(
				Math.round(node.position.x),
				Math.round(node.position.y)
				);
	}
	
	containsPosition(postion,node)
	{
	}
	
	fillTextMutipleLines(context,text,x,y,lineHeight,splitChar)
	{
		var lines = text.split(splitChar);
	    var line = '';
	
	    for(var n = 0; n < lines.length; n++)
	    {
	      var metrics = context.measureText(lines[n]);
	      context.fillText(lines[n], x, y);
	      y = y+lineHeight; 
	    }
	    context.fillText(line, x, y);
	 }
	
	metricsTextMutipleLines(context,text,lineHeight,splitChar)
	{
		var lines = text.split(splitChar);
	    var line = '';
	    var maxWidth = 0;
	    var totalHeight = 0;
	    for(var n = 0; n < lines.length; n++)
	    {
	      var metrics = context.measureText(lines[n]);
	      if(metrics.width>maxWidth) maxWidth = metrics.width;
	      totalHeight = totalHeight + lineHeight;
	    }
	    return({width:maxWidth,height:totalHeight});
	 }
	
	roundedRect(context,x,y,w,h,r,borderWitdh,borderColor,rectColor)
	{
		  if (w < 2 * r) r = w / 2;
		  if (h < 2 * r) r = h / 2;
		  context.beginPath();
		  context.moveTo(x+r, y);
		  context.arcTo(x+w, y,   x+w, y+h, r);
		  context.arcTo(x+w, y+h, x,   y+h, r);
		  context.arcTo(x,   y+h, x,   y,   r);
		  context.arcTo(x,   y,   x+w, y,   r);
		  context.closePath();
		/*
	    context.beginPath();
	    context.moveTo(x, y);
	    context.lineTo(x + width - cornerRadius, y);
	    context.arcTo(x + width, y, x + width, y + cornerRadius, cornerRadius);
	    context.lineTo(x + width, y + height);
	   */ 
	    context.lineWidth = borderWitdh;
	    context.fillStyle = rectColor;
	    context.strokeStyle = borderColor;
	    
	    context.stroke();
	    context.fill();
	
	}
}
//<js2node>
module.exports = NodeDisplay;
console.log("Loading:NodeDisplay");
//</js2node>

},{"../../common/common":35,"../../nodes/position/position":55}],53:[function(require,module,exports){
var Position = require('../../nodes/position/position');
var NodeDisplay = require('../../nodes/nodedisplay/nodedisplay');
var Common = require('../../common/common');

class RectangleDisplay extends NodeDisplay
{
	constructor(displayInfo)
	{
		super(displayInfo);
	}
	
	containsPosition(position,node)
	{
		return(
				(
						(node.position.getX()-this.displayInfo.width/2)<=position.getX() &&
						(node.position.getX()+this.displayInfo.width/2)>=position.getX() &&
						(node.position.getY()-this.displayInfo.height/2)<=position.getY() &&
						(node.position.getY()+this.displayInfo.height/2)>=position.getY()
				)
			);
	}
	
	
	drawNode(canvasHolder,node)
	{
		super.drawNode(canvasHolder,node);

	    if(node.isSelected)
	    {
	    	canvasHolder.context.fillStyle = Common.getColorFromString(this.displayInfo.selectFillColor);
	    	canvasHolder.context.strokeStyle = Common.getColorFromString(this.displayInfo.selectBorderColor);
	    }
	    else
	    {
	    	canvasHolder.context.fillStyle = Common.getColorFromString(this.displayInfo.fillColor);
	    	canvasHolder.context.strokeStyle = Common.getColorFromString(this.displayInfo.borderColor);
	    }
	    //console.log(CommontoString(this.displayInfo));
	    canvasHolder.context.fillRect( 
	    		(node.position.getX()-this.displayInfo.width/2),
	    		(node.position.getY()-this.displayInfo.height/2),
	    		this.displayInfo.width,
	    		this.displayInfo.height);
	    canvasHolder.context.lineWidth = this.displayInfo.borderWidth;
	    canvasHolder.context.strokeStyle = Common.getColorFromString(this.displayInfo.borderColor);
	    canvasHolder.context.strokeRect( 
	    		(node.position.getX()-this.displayInfo.width/2), 
	    		(node.position.getY()-this.displayInfo.height/2), 
	    		this.displayInfo.width, 
	    		this.displayInfo.height);
	
	}
}
//<js2node>
module.exports = RectangleDisplay;
console.log("Loading:RectangleDisplay");
//</js2node>

},{"../../common/common":35,"../../nodes/nodedisplay/nodedisplay":52,"../../nodes/position/position":55}],54:[function(require,module,exports){
var Position = require('../../nodes/position/position');
var NodeDisplay = require('../../nodes/nodedisplay/nodedisplay');
var Common = require('../../common/common');
var Shape = require('../../nodes/shapes/shape');

class TriangleDisplay extends NodeDisplay
{
	constructor(displayInfo)
	{
		super(displayInfo);
		
		var pointList = new Array();
		
		pointList.push(new Position(0,-(this.displayInfo.height/2)));
		pointList.push(new Position(this.displayInfo.width/2,this.displayInfo.height/2));
		pointList.push(new Position(-(this.displayInfo.width/2),this.displayInfo.height/2));
		pointList.push(new Position(0,-(this.displayInfo.height/2)));
	
		this.pointList = pointList;
		this.shape = new Shape(pointList)
	}
	
	containsPosition(position,node)
	{
		return(this.shape.containsPosition(position,node));
	}
	
	
	drawNode(canvasHolder,node)
	{
		super.drawNode(canvasHolder,node);
		this.shape.drawShape(canvasHolder,node,this.displayInfo);
	}
}
//<js2node>
module.exports = TriangleDisplay;
console.log("Loading:TriangleDisplay");
//</js2node>

},{"../../common/common":35,"../../nodes/nodedisplay/nodedisplay":52,"../../nodes/position/position":55,"../../nodes/shapes/shape":57}],55:[function(require,module,exports){
class Position
{
	constructor(x, y)
	{
	    this.x = x;
	    this.y = y;
	}

	static getAveragePostionFromPositionList(positionList)
	{
		var x = 0.0;
		var y = 0.0;
		for(var i=0;i<positionList.length;i++)
		{
			var p = positionList[i];
			x += p.getX();
			y += p.getY();
		}
		x = x / positionList.length;
		y = y / positionList.length;
		return(new Position(x,y));
	}
	
  getClientJson()
  {
	  var json = {};
	  json.x = this.getX();
	  json.y = this.getY();
	  return(json)
  }
		
  static getAveragePostionFromNodeList(nodelist)
  {
	var x = 0.0;
	var y = 0.0;
	for(var i=0;i<nodelist.length;i++)
	{
		var p = nodelist[i].position;
		x += p.getX();
		y += p.getY();
	}
	x = x / nodelist.length;
	y = y / nodelist.length;
	return(new Position(x,y));
  }
		
	static getPostionListFromNodeList(nodeList)
	{
		var positions = new Array();
		for (var i = 0; i < nodeList.length; i++)
		{
			positions.push(nodeList[i].position);
		}
		return(positions);
	}
	
	addTo(position)
	{
		this.setX(this.getX()+position.getX());
		this.setY(this.getY()+position.getY());
	}

	copyFrom(position)
	{
		this.setX(position.getX());
		this.setY(position.getY());
	}

	copyTo(position)
	{
		position.setX(this.getX());
		position.setY(this.getY());
	}
	
	setXY(x,y)
	{
		this.setX(x);
		this.setY(y);
	}

	setX(x)
	{
		this.x = x;
	}

	setY(y)
	{
		this.y = y;
	}

	getX()
	{
		return(this.x);
	}

	getY()
	{
		return(this.y);
	}
	
	clone()
	{
		return(new Position(this.getX(),this.getY()));
	}

	equals(position)
	{
		return( (this.getX()==position.getX()) && (this.getY()==position.getY()) ) ;
	}

	createByAdding(position)
	{
		return(new Position(this.getX() + position.getX(),this.getY()+position.getY()));
	}

	createBySubtracting(position)
	{
		return(new Position(this.getX()-position.getX(),this.getY()-position.getY()));
	}

	findClosestPostionOnLine(p1,p2)
	{
		  var A = this.getDeltaX(p1);
		  var B = this.getDeltaY(p1);
		  var C = p2.getDeltaX(p1);
		  var D = p2.getDeltaY(p1);
	
		  var dot = A * C + B * D;
		  var lengthSquared = C * C + D * D;
		  var param = -1;
		  if (lengthSquared != 0) //in case of 0 length line
		      param = dot / lengthSquared;
	
		  var xx, yy;
	
		  if (param < 0)
		  {
		    xx = p1.getX();
		    yy = p1.getY();
		  }
		  else if (param > 1) {
		    xx = p2.getX();
		    yy = p2.getY();
		  }
		  else {
		    xx = p1.getX() + param * C;
		    yy = p1.getY() + param * D;
		  }
	/*
		  var dx = x - xx;
		  var dy = y - yy;
		  return Math.sqrt(dx * dx + dy * dy);
		  */
		  return(new Position(xx,yy));
	}


	findClosestPointInList	(positionList)
	{
		var closetIndex = 0;
		var closetPoint = positionList[closetIndex];
		var distanceToClosest = this.getDistance(closetPoint);
		
		for(var i=0;i<positionList.length;i++)
		{
			var point = positionList[i];
			var distanceToPoint = this.getDistance(point);
			if(distanceToPoint<distanceToClosest)
			{
				closetIndex = i;
				closetPoint = point;
				distanceToClosest = distanceToPoint;
			}
		}
		return(
				{
					closetIndex:closetIndex,
					closetPoint:closetPoint,
					distanceToClosest:distanceToClosest
				}
				);
	}

	log	()
	{
		console.log(
				"Position"+
				":x="+this.getX()+
				":y="+this.getY()+
				""
		);
	}

	getDeltaY(position)
	{
		return(this.getY()-position.getY());
	}

	getDeltaX(position)
	{
		return(this.getX()-position.getX());
	}

	getDelta(position)
	{
		return(new Position(this.getDeltaX(position),this.getDeltaY(position)));
	}

	getDistance(position)
	{
		return (Math.sqrt(Math.pow(this.getDeltaX(position), 2) + Math.pow(this.getDeltaY(position), 2)));
	}

	getDistanceOnLinePointArray(positionOrg,distance)
	{
		var positionList = new Array();
		var modX = 0.0;
		var modY = 0.0;
	
		// what if they are top of each other?
		if (this.getDeltaX(positionOrg) == 0 && this.getDeltaY(positionOrg) == 0)
		{
			modX += Math.random() - 0.5;
			modY += Math.random() - 0.5;
		}
	
		var position = new Position(positionOrg.x + modX, positionOrg.y + modY);
	
		// this is when the slope is undefined (totally horizontal line)
		if (position.getX() == this.getX())
		{
			var p1 = new Position(position.getX(),position.getY()+distance);
			var p2 = new Position(position.getX(),position.getY()-distance);
			p1.distance = this.getDistance(p1)
			p2.distance = this.getDistance(p2)
	
			positionList.push(p1);
			positionList.push(p2);
			return(positionList);
		}
	
		// get the equation for the line m=slope b=y-intercept
		var m = this.getDeltaY(position) / this.getDeltaX(position);
		var b = this.getY() - (m * this.getX());
	
		var xPlus = position.getX() + distance / Math.sqrt(1 + (m * m));
		var xMinus = position.getX() - distance / Math.sqrt(1 + (m * m));
		var yPlus = xPlus * m + b;
		var yMinus = xMinus * m + b;
	
		var p1 = new Position(xPlus, yPlus);
		var p2 = new Position(xMinus, yMinus);
		p1.distance = this.getDistance(p1)
		p2.distance = this.getDistance(p2)
	
		positionList.push(p1);
		positionList.push(p2);
		return(positionList);
	}

	getDistancePostionList(positionList)
	{
		var distanceList = new Array();
		for(var i=0;i<positionList.length;i++)
		{
			var p = positionList[i];
			var d = this.getDistance(p);
			var position = new Position(p.getX(), p.getY());
			position.distance = d;
			distanceList.push(position);
		}
		return (distanceList);
	}

	getDistanceOnLinePointArrayClosest(position,distance)
	{
		var positionList = this.getDistanceOnLinePointArray(position,distance);
		var closest = null;
		for(var i=0;i<positionList.length;i++)
		{		
			var position = positionList[i];
			if(closest==null)
			{
				closest = position;
			}
			else if(position.distance < closest.distance)
			{
				closest = position;
			}
		}
		////console.log("closest="+CommontoString(closest)+" given distance="+distance+" position="+CommontoString(position)+" list="+CommontoString(positionList))
		return (closest);
	}

	getDistanceOnLinePointArrayFarthest(position,distance)
	{
		var positionList = this.getDistanceOnLinePointArray(position,distance);
		var farthest = null;
		for(var i=0;i<positionList.length;i++)
		{
			var position = positionList[i];
			if(farthest==null)
			{
				farthest = position;
			}
			else if(position.distance > farthest.distance)
			{
				farthest = position;
			}
		}
		return (farthest);
	}
}

//<js2node>
module.exports = Position;
console.log("Loading:Position");
//</js2node>

},{}],56:[function(require,module,exports){
class BoundingBox
{
	constructor(pointList)
	{
		this.initDone = false;
		this.pointList = pointList;
		this.initBoundingBox();
	
	}
	
	
	containsPosition(position,node)
	{
		if(!this.initDone) this.initBoundingBox();
	
		return(
				(
						(this.xMin.getX()+node.position.getX())>=position.x &&
						(this.xMax.getX()+node.position.getX())<=position.x &&
						(this.yMin.getY()+node.position.getY())>=position.y &&
						(this.yMax.getY()+node.position.getY())<=position.y
				)
			);
	}
	
	initBoundingBox()
	{
		this.initDone = true;
		//this.pointList = pointList;
	
	
		this.xMin = null;
		this.xMax = null;
		this.yMin = null;
		this.yMax = null;
		//console.log("plist size="+pointList.length);
		for(var i=0;i<this.pointList.length;i++)
		{
			var p = this.pointList[i];
			if(this.xMin==null) this.xMin = p;
			if(this.xMax==null) this.xMax = p;
			if(this.yMin==null) this.yMin = p;
			if(this.yMax==null) this.yMax = p;
			
			if(p.getX()<this.xMin) this.xMin = p;
			if(p.getX()>this.xMax) this.xMax = p;
			if(p.getY()<this.yMin) this.yMin = p;
			if(p.getY()>this.yMax) this.yMax = p;
	
		}
		
		this.width = this.xMax.getX()-this.xMin.getX();
		this.height = this.yMax.getY()-this.yMin.getY();
	}
}




//<js2node>
module.exports = BoundingBox;
console.log("Loading:BoundingBox");
//</js2node>

},{}],57:[function(require,module,exports){
var Position = require('../../nodes/position/position');
var BoundingBox = require('../../nodes/shapes/boundingbox');
var Position = require('../../nodes/position/position');
var Common = require('../../common/common');

class Shape
{
	constructor(pointList)
	{
		this.pointList = pointList;
		this.averagePoint = new Position(0,0);
		this.boundingBox = new BoundingBox(pointList);
		this.initShape();
	}
	
	initShape()
	{
		if(!this.pointList[this.pointList.length-1].equals(this.pointList[0])) 
			this.pointList.push(this.pointList[0].clone());
		
		
		Position.getAveragePostionFromPositionList(this.pointList).copyTo(this.averagePoint);
		
		this.drawCenterDot = false;
		/*
		for(var i=0;i<pointList.length;i++)
		{
			console.log("i="+i+" "+CommontoString(pointList[i]));
		}
		*/
		
	}
	
	drawShape(canvasHolder,node,displayInfo)
	{
	    if(node.isSelected)
	    {
	    	canvasHolder.context.fillStyle = Common.getColorFromString(displayInfo.selectFillColor);
	    	canvasHolder.context.strokeStyle = Common.getColorFromString(displayInfo.selectBorderColor);
	    }
	    else
	    {
	    	canvasHolder.context.fillStyle = Common.getColorFromString(displayInfo.fillColor);
	    	canvasHolder.context.strokeStyle = Common.getColorFromString(displayInfo.borderColor);
	    }
	    
	    canvasHolder.context.beginPath();
	    for(var i=0;i<this.pointList.length;i++)
	    {   	
			var point = this.pointList[i].createByAdding(node.position);
	    	if(i==0) canvasHolder.context.moveTo(point.getX(),point.getY());
	    	else canvasHolder.context.lineTo(point.getX(),point.getY());
	    }
	    canvasHolder.context.closePath();
	    
	    canvasHolder.context.fill();
	    canvasHolder.context.lineWidth = displayInfo.borderWidth;
	    canvasHolder.context.stroke();
	    
	    if(this.drawCenterDot)
	    {
	    	var averageTrans = this.getAveragePointTransformed(node);
	    	canvasHolder.context.fillStyle = Common.getColorFromString("000000ff");
	    	canvasHolder.context.beginPath();
	    	canvasHolder.context.arc(node.position.getX(),node.position.getY(),2,0,Math.PI * 2, false);
	    	canvasHolder.context.closePath();
	    	canvasHolder.context.fill();
		}
	}
	
	getAveragePointTransformed(node)
	{
	    var averagePointTransformed = this.averagePoint.createByAdding(node.position);
	    return(averagePointTransformed);
	}
	
	//function polygonArea(X, Y, numPoints) 
	
	getShapeArea()
	{ 
	  var area = 0;         // Accumulates area in the loop
	  var j = this.pointList.length-1;  // The last vertex is the 'previous' one to the first
	
	  for (var i=0; i<this.pointList.length; i++)
	  { 
		  area = area + (this.pointList[j].getX()+this.pointList[i].getX()) *
		  	(this.pointList[j].getY()-this.pointList[i].getY()); 
	      j = i;  //j is previous vertex to i
	  }
	  if(area<0) area = area * -1;
	  return(area/2);
	}
	
	
	getShapeArea2()
	{ 
		var area = 0; // Accumulates area in the loop
		var j = this.pointList.length-1; // The last vertex is the 'previous' one to the first
		for (i=0;i<this.pointList.length;i++)
		{
			area = area + (this.pointList[j].getX()+this.pointList[i].getX()) *
				(this.pointList[j].getY()+this.pointList[i].getY()); 
			j = i; //j is previous vertex to i
			
			console.log("XXXXXXXXXXX:i="+i+" area="+area);
	
		}
		return(area);
	}
	
	findClosestPointInShapeFromStartingPoint(startingPosition,node)
	{
		var lookFromPosition = startingPosition.createBySubtracting(node.position);
		var closestInfo = lookFromPosition.findClosestPointInList(this.pointList);
	
		var endOfList = this.pointList.length-1;
		if(this.pointList[0].equals(this.pointList[endOfList])) endOfList = endOfList - 1;
			
		var closestPoint = closestInfo.closetPoint;
		var p1Index = closestInfo.closetIndex-1;
		var p2Index = closestInfo.closetIndex+1;
		if(closestInfo.closetIndex==0) p1Index = endOfList;
		if(closestInfo.closetIndex==endOfList) p2Index = 0;
		
		var p1 = this.pointList[p1Index];
		var p2 = this.pointList[p2Index];
		
		
		var distanceToClosest = closestInfo.distanceToClosest;
		var p1LinePoint = lookFromPosition.findClosestPostionOnLine(closestPoint,p1);
		var p2LinePoint = lookFromPosition.findClosestPostionOnLine(closestPoint,p2);
		var p1Distance = lookFromPosition.getDistance(p1LinePoint);
		var p2Distance = lookFromPosition.getDistance(p2LinePoint);
		
		var finalPoint = closestPoint;
		var finalDistance = distanceToClosest;
		if(distanceToClosest<p1Distance && distanceToClosest<p2Distance)
		{
			finalPoint = closetPoint;
			finalDistance = distanceToClosest;
		}
		else if(p1Distance<p2Distance)
		{
			finalPoint = p1LinePoint;
			finalDistance = p1Distance;
		}
		else
		{
			finalPoint = p2LinePoint;
			finalDistance = p2Distance;
		}
		
		var finalPointTranslated = finalPoint.createByAdding(node.position);
		
		/*
		console.log(CommontoString(closestInfo));
	    console.log("startingPosition="+CommontoString(startingPosition));
		console.log("lookFromPosition="+CommontoString(lookFromPosition));
		console.log("node.position="+CommontoString(node.position));
		console.log("this.pointList.length="+this.pointList.length);
		console.log("closestInfo.closetIndex="+closestInfo.closetIndex);
		console.log("endOfList="+endOfList);
		console.log("p1Index="+p1Index);
		console.log("p2Index="+p2Index);
		console.log("closestInfo.closetIndex="+closestInfo.closetIndex);
		console.log("p1:"+CommontoString(p1));
		console.log("p2:"+CommontoString(p2));
	
		console.log("finalDistance="+finalDistance);
		console.log("finalPoint="+CommontoString(finalPoint));
		console.log("finalPointTranslatedt="+CommontoString(finalPointTranslated));
		console.log("-------------------------------------------------------------------");
		*/
	
		return(finalPointTranslated);
	}
	
	
	containsPosition(position,node)
	{
		if(this.boundingBox.containsPosition(position,node)) return false;
		
		var i;
		var j;
		var c = false;
		for(i=0,j=this.pointList.length-1;i< this.pointList.length;j=i++)
		{
			//
			var pi = this.pointList[i].createByAdding(node.position);
			var pj = this.pointList[j].createByAdding(node.position);
			  
			if (
				((pi.getY()>position.getY()) != (pj.getY()>position.getY())) &&
					(position.getX() < (pj.getX()-pi.getX()) *
					(position.getY()-pi.getY()) /
					(pj.getY()-pi.getY()) +
					pi.getX()) )
				c = !c;
		}
		return c;
	}
}
//<js2node>
module.exports = Shape;
console.log("Loading:Shape");
//</js2node>

},{"../../common/common":35,"../../nodes/position/position":55,"../../nodes/shapes/boundingbox":56}],58:[function(require,module,exports){
var Node = require('../nodes/node');
var Position = require('../nodes/position/position');
var Common = require('../common/common');
var ConnectorDisplayEmpty = require('../nodes/connectordisplay/connectordisplayempty');
var ShapeConnector = require('../nodes/connector/shapeconnector');
var ArcDisplayShape = require('../nodes/nodedisplay/arcdisplayshape');


class Junction extends Node
{
	constructor(name,position,canvasHolder,shapeList,graphDataKey,infoData,world)
	{
		super(name,position,canvasHolder,graphDataKey,infoData);
		this.pathArray = new Array();
		this.walkerObject = new Object();
		this.walkerTypeConnections = new Object();
		this.layer=1;
		this.world = world;
	}

	getClientJson()
	{
		var json = super.getClientJson();
		json.pathWorldTye = "junction";
		
		
		var walkerList = this.getWalkerArray();
		json.walkerList = new Array();
		
		for(var i=0;i<walkerList.length;i++)
		{
			json.walkerList.push(walkerList[i].getNodeKey());
		}
		
		return(json);
	}
	
	getCreateWalkerTypeConnection(walkerType)
	{
		if(!this.walkerTypeConnections.hasOwnProperty(walkerType))
		{
			var walkerGraphData = this.canvasHolder.getGraphData(walkerType);
			/***
			this.world.worldDisplay.walkerDisplayTypes["generic"];
			if(this.world.worldDisplay.walkerDisplayTypes.hasOwnProperty(walkerType))
			{
				walkerGraphData = this.world.worldDisplay.walkerDisplayTypes[walkerType];
			}*/
			/*
			console.log("adding "+walkerType+
					" this.connectorPosition="+CommontoString(this.connectorPosition)+
					" this.position="+CommontoString(this.position)+		
					"");
					*/
			/*
			console.log("nd ="+CommontoString(walkerGraphData)+
					"");
					*/
			var shapeNode = new Node(
						"shapeNode for "+this.name+" "+walkerType,
						this.position,
						this.canvasHolder,
						"junctionPieSlice",
						new Object()
					);
			
			
			shapeNode.layer=10;
			shapeNode.debugFunction()
			{
				//console.log("debugFunction:"+this.name);
			}
			
			this.walkerTypeConnections[walkerType] = new ShapeConnector(
					shapeNode,
					new ConnectorDisplayEmpty(),
					shapeNode.graphData.nodeDisplay.shape,
					new Position(0,0),
					10,
					0.5,
					0.0,
					0.95,
					this.name+":"+walkerType+":"+shapeNode.name);
			this.walkerTypeConnections[walkerType].shapeNode = shapeNode;
			//this.nodes.push(shapeNode);
						
			this.addNode(shapeNode);
			this.shapeNode = shapeNode;
			//console.log("getCreateWalkerTypeConnection:GOT NEW:walker="+this.name+":walkerType="+walkerType+":ts="+shapeNode.graphData.nodeDisplay.displayInfo.ts);
			
		}
		var connection = this.walkerTypeConnections[walkerType];
		//console.log("getCreateWalkerTypeConnection:walker="+this.name+":walkerType="+walkerType+":ts="+connection.shapeNode.graphData.nodeDisplay.displayInfo.ts);
		
		return(connection);
	}
	
	getNodeUiDisplay(node)
	{
		return(
				"<ul>"+
				"<li> name : "+this.name+"</li>"+
				"<li> nodeKey.ts : "+this.infoData.nodeKey.key+"</li>"+
				"<li> nodeKey.nodeId : "+this.infoData.nodeKey.nodeId+"</li>"+
				"</ul>");
	}
	
	getWalkerKeysSorted(node)
	{
		var walkerTypeKeys = new Array()
		var totalWalkers = 0;
		for (var walkerType in this.walkerTypeConnections)
		{
			walkerTypeKeys.push(walkerType);
			var connector = this.walkerTypeConnections[walkerType];
			totalWalkers += connector.nodes.length;
			//console.log(walkerType+":totalWalkers="+totalWalkers+":for conector="+connector.nodes.length);
	
		}
		walkerTypeKeys.sort();
		return(walkerTypeKeys);
	}
	
	getWalkerArrayToFix()
	{
		var walkerArray = this.walkerObject.values();
		return(walkerArray);
	}
	
	getWalkerArray()
	{
		// this is SLOW.. why does the above not work?!?!?!
		var walkerArray = new Array();
		var walkerTypeKeys = this.getWalkerKeysSorted();
		for (var i=0;i<walkerTypeKeys.length;i++)
		{
			var walkerType = walkerTypeKeys[i];
			var connector = this.walkerTypeConnections[walkerType];
			for(var j=0;j<connector.nodes.length;j++)
			{
				walkerArray.push(connector.nodes[j]);
	
			}
		}
	
		return(walkerArray);
	}
	
	adjustwalkerTypeConnections()
	{
		var walkerTypeKeys = this.getWalkerKeysSorted();
		var totalWalkers = this.getWalkerArray().length;
	//console.log("walekrCount="+totalWalkers);
		//console.log("walkerCountalkerCount="+this.walkerObject);
		/*
		new Array()
		var totalWalkers = 0;
		for (var walkerType in this.walkerTypeConnections)
		{
			walkerTypeKeys.push(walkerType);
			var connector = this.walkerTypeConnections[walkerType];
			totalWalkers += connector.nodes.length;
			//console.log(walkerType+":totalWalkers="+totalWalkers+":for conector="+connector.nodes.length);
	
		}
		walkerTypeKeys.sort();*/
		var angle = 0;
		// area = pi r^2
		// so... if we have 10 nodes...
		// and a node takes "100 area" per node (a 10X10 area)
		// 10 nodes and 100area^2
		// sqrt(area/pi) = r
		// sqrt( (area*numberNodes*areaPerNode)/PI ) = R
		var walkerArea = 25;
		//var radius = Math.sqrt( totalWalkers/Math.PI )*4;
		var radius = Math.sqrt( totalWalkers*walkerArea) / Math.PI;
		
		for(var i=0;i<walkerTypeKeys.length;i++)
		{
			var walkerType = walkerTypeKeys[i];
			var connector = this.walkerTypeConnections[walkerType];
			var percentOfWalkers = connector.nodes.length/totalWalkers;
			var walkerAngle = percentOfWalkers * 360;
			
			var graphData = this.canvasHolder.getGraphData(walkerType);
			/*
			console.log("walkerType="+walkerType+
					":connector.nodes.length:"+connector.nodes.length+
					":percentOfWalkers:"+percentOfWalkers+
					":walkerAngle:"+walkerAngle+
					"graphData="+Common.toString(graphData)+
					"");
	*/
			//console.log(walkerType+":before:"+CommontoString(connector.shapeNode.graphData.nodeDisplay));
			//console.log("walker="+this.name+":walkerType="+walkerType+":ts="+connector.shapeNode.graphData.nodeDisplay.displayInfo.ts);
			
			connector.shapeNode.graphData.nodeDisplay.displayInfo.startAngle = angle;
			angle += walkerAngle;
			connector.shapeNode.graphData.nodeDisplay.displayInfo.endAngle = angle;
			connector.shapeNode.graphData.nodeDisplay.displayInfo.radius = radius;
			
			connector.shapeNode.graphData.nodeDisplay.displayInfo.fillColor = graphData.nodeDisplay.displayInfo.fillColor;
			//if(connector.shapeNode.graphData.nodeDisplay.displayInfo.fillColor)
			//connector.shapeNode.graphData.nodeDisplay.displayInfo.fillColor = 
			////////connector.shapeNode.graphData.nodeDisplay = new ArcDisplayShape(connector.shapeNode.graphData.nodeDisplay.displayInfo)
			connector.shapeNode.graphData.nodeDisplay.init();
			/////////connector.shape = connector.shapeNode.graphData.nodeDisplay.shape;
			
			//console.log(walkerType+":after:"+CommontoString(connector.shapeNode.graphData.nodeDisplay));
			//console.log("----------------------------------------------");
		}
	}
	
	addWalker(walker)
	{
		this.walkerObject[walker] = walker;
		var connection = this.getCreateWalkerTypeConnection(walker.graphDataKey)
		//var connection = this.getCreateWalkerTypeConnection(walker.infoData.walkerTypeKey)
		connection.addNode(walker);
		
		this.adjustwalkerTypeConnections();
	}
	
	removeWalker(walker)
	{
		var connection = this.getCreateWalkerTypeConnection(walker.infoData.walkerTypeKey);
		delete this.walkerObject[walker]; 
		connection.removeNode(walker);	
		this.adjustwalkerTypeConnections();
	}
	
	log()
	{
		console.log("junction log:"+CommontoString(this));
	}

}
//<js2node>
module.exports = Junction;
console.log("Loading:Junction");
//</js2node>

},{"../common/common":35,"../nodes/connector/shapeconnector":38,"../nodes/connectordisplay/connectordisplayempty":42,"../nodes/node":43,"../nodes/nodedisplay/arcdisplayshape":50,"../nodes/position/position":55}],59:[function(require,module,exports){
var ConnectorDisplay = require('../../nodes/connectordisplay/connectordisplay');
var NodeDisplay = require('../../nodes/nodedisplay/nodedisplay');
var Common = require('../../common/common');

class JunctionConnector extends ConnectorDisplay
{
	constructor(displayInfo)
	{
		super(displayInfo);
	}
	
	drawConnector(canvasHolder,connector,node)
	{
		super.drawConnector(canvasHolder,connector,node);

		for(var j=0;j<connector.nodes.length;j++)
		{
			var nodeJ = connector.nodes[j];		
			var p = node.position.createByAdding(node.connectorPosition);
			var pj = nodeJ.position.createByAdding(nodeJ.connectorPosition);
			canvasHolder.context.lineWidth = 5;
			canvasHolder.context.strokeStyle = Common.getColorFromString("000000ff");
			canvasHolder.context.beginPath();
			canvasHolder.context.moveTo(p.getX(),p.getY());
			canvasHolder.context.lineTo(pj.getX(),pj.getY());
			canvasHolder.context.stroke();
		}
	}
}
//<js2node>
module.exports = JunctionConnector;
console.log("Loading:JunctionConnector");
//</js2node>

},{"../../common/common":35,"../../nodes/connectordisplay/connectordisplay":41,"../../nodes/nodedisplay/nodedisplay":52}],60:[function(require,module,exports){
var Position = require('../../nodes/position/position');
var NodeDisplay = require('../../nodes/nodedisplay/nodedisplay');
var Common = require('../../common/common');

class JunctionDisplay extends NodeDisplay
{
	constructor(displayInfo)
	{
		super(displayInfo);
		this.checkPositionInfo = {};
	}
	
	containsPosition(position,node)
	{
		//console.log("---- "+node.name+" -----------------------------------------------");
		
		if(!node.hasOwnProperty("checkPositionInfo"))
		{
				//console.log("---- "+node.name+" "+node.getNodeKey()+" missing checkPositionInfo --");
				return(false);
		}

		
		var distance = node.checkPositionInfo.circlePosition.getDistance(position);
	
	
		return(
				(distance<=node.graphData.radius) ||
				(
						(node.checkPositionInfo.textX<=position.getX()) &&
						(node.checkPositionInfo.textX+node.checkPositionInfo.textWidth)>=position.getX() &&
						(node.checkPositionInfo.textY<=position.getY()) &&
						(node.checkPositionInfo.textY+node.checkPositionInfo.textHeight)>=position.getY()
				)
				);
	}
	
	
	drawNode(canvasHolder,node)
	{
		super.drawNode(canvasHolder,node);
		//console.log("ZZZZZZZZZZZZZZ::::"+node.name);
	    var radiusAverage = 0;
	    for(var i=0;i<node.nodes.length;i++)
	    {
	     	var subNode = node.nodes[i];
	     	//console.log("            ZZZZZZZZZZZZZZ::::"+subNode.name);
	    	radiusAverage += subNode.graphData.nodeDisplay.displayInfo.radius;
	    }
	    if(radiusAverage!=0) radiusAverage = (radiusAverage / node.nodes.length);
	    radiusAverage += this.displayInfo.borderWidth*5;
	    
	    var junctionText = node.name;	    
	    var rectPadding = this.displayInfo.fontPixelHeight/2;
	    
	    canvasHolder.context.font=this.displayInfo.fontStyle+" "+this.displayInfo.fontPixelHeight+"px "+this.displayInfo.fontFace; 
	    canvasHolder.context.textAlign="center";
	    var textMetrics = this.metricsTextMutipleLines(
	    		canvasHolder.context,
	    		junctionText,
	    		this.displayInfo.fontPixelHeight,
	    		"\n");
	    
	    var totalWidth = Math.max(radiusAverage+rectPadding,textMetrics.width+rectPadding+rectPadding);
	    var totalHeight = 
	    	radiusAverage+
	    	this.displayInfo.borderWidth*2+
	    	node.graphData.textSpacer+
	    	textMetrics.height+rectPadding;
	    
	    node.width = totalWidth;
	    node.height = totalHeight;
	    
		if(!node.hasOwnProperty("checkPositionInfo"))
		{
			//console.log("**** "+node.name+" missing checkPositionInfo ---------------------");			
			node.checkPositionInfo = { makeItReal:"true", };
		}
		var x = node.position.getX();
		var y = node.position.getY();
		//x = this.drawPosition.getX();
		//y = this.drawPosition.getY();

	    //if(node.checkPositionInfo==null) node.checkPositionInfo = {};
	    node.checkPositionInfo.circlePosition = new Position(
	    		x,
	    		y-totalHeight/2.0+radiusAverage);
	    
	    node.connectorPosition.setY(-(totalHeight/2.0-radiusAverage));
	
	    
	    node.checkPositionInfo.textX = x-(textMetrics.width+rectPadding)/2.0;
	    node.checkPositionInfo.textY = node.checkPositionInfo.circlePosition.getY()+
	    	radiusAverage+
	    	this.displayInfo.borderWidth+
	    	node.graphData.textSpacer;
	    node.checkPositionInfo.textWidth = textMetrics.width+rectPadding;
	    node.checkPositionInfo.textHeight = textMetrics.height+rectPadding;
	
	    
	    this.roundedRect(
	    		canvasHolder.context,
	 		   node.checkPositionInfo.textX,
	 		   node.checkPositionInfo.textY,
	 		   node.checkPositionInfo.textWidth,
	 		   node.checkPositionInfo.textHeight,
	 		   this.displayInfo.fontPixelHeight/3,
	 		   this.displayInfo.borderWidth,
	 		   Common.getColorFromString(this.displayInfo.rectBorderColor),
	 		   Common.getColorFromString(this.displayInfo.rectFillColor) );
	    
	    
	    canvasHolder.context.fillStyle=Common.getColorFromString(this.displayInfo.fontColor);
	
	    this.fillTextMutipleLines(
	    		canvasHolder.context,
	    		junctionText,
	    		x,
	    		node.checkPositionInfo.textY+rectPadding*2.0+this.displayInfo.borderWidth,
	    		this.displayInfo.fontPixelHeight,
	    		"\n");
	  
	  
	    if(node.isSelected)
	    {
	    	canvasHolder.context.fillStyle = Common.getColorFromString(this.displayInfo.selectFillColor);
	    	canvasHolder.context.strokeStyle = Common.getColorFromString(this.displayInfo.selectBorderColor);
	    }
	    else
	    {
	    	canvasHolder.context.fillStyle = Common.getColorFromString(this.displayInfo.fillColor);
	        canvasHolder.context.strokeStyle = Common.getColorFromString(this.displayInfo.borderColor);
	    }
	  /*
	    console.log("name="+node.name+
	    		":selectFillColor="+this.displayInfo.selectFillColor+
	    		":fillColor="+this.displayInfo.fillColor+
	    		":X="+node.checkPositionInfo.circlePosition.getX()+
	    		":Y="+node.checkPositionInfo.circlePosition.getY()+
	    		":radius="+radiusAverage+
	    		""
	    		);
	    */
	    
	
	    canvasHolder.context.beginPath();
	    canvasHolder.context.arc(
				node.checkPositionInfo.circlePosition.getX(),
				node.checkPositionInfo.circlePosition.getY(),
				radiusAverage,//node.graphData.radius,
				0,
				Math.PI * 2, false);
	    canvasHolder.context.closePath();
	    canvasHolder.context.fill();
	    canvasHolder.context.lineWidth = this.displayInfo.borderWidth;
	    canvasHolder.context.stroke();
	
	
	    for(var i=0;i<node.nodes.length;i++)
	    {
	     	var subNode = node.nodes[i];
	     	subNode.position = node.checkPositionInfo.circlePosition;
	    	subNode.graphData.nodeDisplay.drawNode(node.canvasHolder,subNode);
	    }
	
	}
}
//<js2node>
module.exports = JunctionDisplay;
console.log("Loading:JunctionDisplay");
//</js2node>

},{"../../common/common":35,"../../nodes/nodedisplay/nodedisplay":52,"../../nodes/position/position":55}],61:[function(require,module,exports){
var Connector = require('../nodes/connector/connector');
var SpringConnector = require('../nodes/connector/springconnector');


class Path extends SpringConnector
{
	constructor(connectorDisplay,springAnchorPoint,anchorOffsetPoint,relaxedDistance,elasticityFactor,name)
	{
		super(connectorDisplay,springAnchorPoint,anchorOffsetPoint,relaxedDistance,elasticityFactor,name)
		this.walkerObject = new Object();
	}
	
	getClientJson()
	{
		var json = super.getClientJson();
		json.junctionStart = this.junctionStart.getNodeKey();
		json.junctionEnd = this.junctionEnd.getNodeKey();
		return(json);
	}
	
	setJunctions(junctionStart,junctionEnd)
	{
	    this.junctionStart = junctionStart;
		this.junctionEnd = junctionEnd;
		this.addNode(junctionStart);
		this.addNode(junctionEnd);		
	}
	
	getConnectorKey()
	{
		return(this.getPathKey());
	}
	
	getPathKey()
	{
		return(this.junctionStart.getNodeKey()+"#"+this.junctionEnd.getNodeKey());
	}
	
	log()
	{
		console.log("path log:"+CommontoString(this));
	}
}
//<js2node>
module.exports = Path;
console.log("Loading:Path");
//</js2node>

},{"../nodes/connector/connector":36,"../nodes/connector/springconnector":39}],62:[function(require,module,exports){
var Node = require('../nodes/nodecanvas/nodecanvas');
var NodeCanvas = require('../nodes/nodecanvas/nodecanvas');
var NodeCanvasMouse = require('../nodes/nodecanvas/nodecanvasmouse');
var Common = require('../common/common');
var Position = require('../nodes/position/position');
var Path = require('../paths/path');
var Walker = require('../paths/walker');
var Junction = require('../paths/junction');

class PathWorld extends NodeCanvas
{
	constructor(canvasHolder,worldDisplay)
	{
		super(canvasHolder);
		this.junctions = new Object();
		this.paths = new Object();
		this.walkers = new Object();
		this.worldUpdateQueue = new Array();
		this.worldUpdateQueue.isInNeedOfSorting = false
		
		this.junctionSpacer = canvasHolder.getConnector("junctionSpacer",canvasHolder.canvasName+":junctionSpacer"),
		this.worldWall = canvasHolder.getConnector("worldWall",canvasHolder.canvasName+":worldWall"),
		
		//this.junctionSpacer = junctionSpacer;
		//this.worldWall = worldWall;
		this.worldDisplay = worldDisplay;
		this.lastDate = "";
		this.checkTimestamp = "";
		this.nodeCanvasMouse = new NodeCanvasMouse(this);
		this.fillStyle = worldDisplay.worldBackgroundColor;
	}
	
	static fillPathWorldFromClientJson(world,json)
	{		
		//console.log("PathWolrd:fillPathWorldFromClientJson");
		//console.log("PathWolrd:fillPathWorldFromClientJson:worldName="+this.name);
		world.infoData.nodeKey.key = json.infoData.nodeKey.key;
		world.infoData.nodeKey.nodeId = json.infoData.nodeKey.nodeId;
		
		var junctionKeyMap = {};
		Object.keys(json.junctions).forEach(function (key)
		{
			var junctionJson = json.junctions[key];
			var junction = world.getCreateJunction(junctionJson.name,junctionJson.infoData);
			junction.position.x = junctionJson.position.x;
			junction.position.y = junctionJson.position.y;
			junctionKeyMap[key] = junction;
		});
		
		Object.keys(json.paths).forEach(function (key)
		{
			var pathJson = json.paths[key];
			var path = world.getCreatePath(
					junctionKeyMap[pathJson.junctionStart],
					junctionKeyMap[pathJson.junctionEnd],
					pathJson);
		});
				
		Object.keys(json.walkers).forEach(function (key)
		{
			var walkerJson = json.walkers[key];
			var walker = world.getCreateWalker(walkerJson.name,walkerJson.infoData);
			walker.position.x = walkerJson.position.x;
			walker.position.y = walkerJson.position.y;	
			walker.setCurrentJunction(junctionKeyMap[walkerJson.currentJunction]);
		});
	}
	
	  xgetNodeJson(json)
	  {
		  json.name = this.name;
		  json.graphDataKey = this.graphDataKey;
		  json.infoData = this.infoData;
		  //json.infoData.nodeKey = this.getNodeKey();
		  json.position = this.position.getClientJson();
		  json.connectors = new Array();
		  for(var i=0;i<this.connectors.length;i++) json.connectors.push(this.connectors[i].getConnectorKey());

		  return(json);
	  }

	
	static createPathWorldFromClientJson(canvasHolder,worldDef,json)
	{
		var pathWorld = new PathWorld(canvasHolder,worldDef);
		
		Object.keys(json.junctions).forEach(function (key)
		{
			var junctionJson = json.junctions[key];
			var junction = pathWorld.getCreateJunction(junctionJson.name,junctionJson.infoData);
			junction.position.x = junctionJson.position.x;
			junction.position.y = junctionJson.position.y;
		});
		
		Object.keys(json.walkers).forEach(function (key)
				{
					var walkerJson = json.walkers[key];
					var walker = pathWorld.getCreateWalker(walkerJson.name,walkerJson.infoData);
					walker.position.x = walkerJson.position.x;
					walker.position.y = walkerJson.position.y;
				});
		//json.junctions = {};
		//json.walkers = {};
		//json.paths = {};
		
		/*
		var isWalkerNew = this.isWalkerNew(worldUpdate.walkerName);
		var isJunctionNew = this.isJunctionNew(worldUpdate.junctionName);
		var walker = this.getCreateWalker(worldUpdate.walkerName,worldUpdate.walkerInfo);
		var junction = this.getCreateJunction(worldUpdate.junctionName,worldUpdate.junctionInfo);		
		var currentJunction = walker.getCurrentJunction();
		*/	
		//var worldDisplay = sdfsd;
		//var worldWall = sfsd;
		//var junctionSpacer = xxx
		return(pathWorld);
	}
	
	drawCanvas(timestamp)
	{
		super.drawCanvas(timestamp);
		this.pathWolrdExtraAnimation(timestamp);
	}
	
	getWorldClientJson()
	{
		var json = {};
		
		json.junctions = {};
		var junctionList = this.getJunctionList();
		for(var i=0;i<junctionList.length;i++)
		{
			var junction = junctionList[i];
			json.junctions[junction.getNodeKey()] = junction.getClientJson();
		}
		
		
		json.walkers = {};
		var walkerList = this.getWalkerList();
		for(var i=0;i<walkerList.length;i++)
		{
			var walker = walkerList[i];
			json.walkers[walker.getNodeKey()] = walker.getClientJson();
		}
		
		json.paths = {};
		var pathList = this.getPathList();
		for(var i=0;i<pathList.length;i++)
		{
			var path = pathList[i];
			json.paths[path.getConnectorKey()] = path.getClientJson();
		}
		
  	   json.canvasHolder = this.canvasHolder.getClientJson();
  	   json.infoData = this.infoData;	
  	   return(json);
	}
	
	pathWolrdExtraAnimation(timestamp)
	{
		this.prepareWorldUpdateQueue();

		var localCheckTimestamp = this.animationExecTime*this.timeFactor + this.startTime.getTime();
		var checkDate = new Date(localCheckTimestamp);

		if(this.lastDate==null) this.lastDate=="";
		
		if(this.lastDate!=checkDate.toLocaleString()+" "+Common.getDayOfWeek(checkDate))
		{
			this.lastDate = checkDate.toLocaleString()+" "+Common.getDayOfWeek(checkDate);
			if(this.isAnimated && this.canvasHolder.isDrawable()) $('#world_date').html(this.lastDate);
		}
		
		this.checkTimestamp = localCheckTimestamp;
		if(this.isAnimated) while(this.isNextWorldUpdateReady(localCheckTimestamp))
		{
			var proccesed = this.processWorldUpdateQueue();
			if(proccesed!=null)
			{
				var date = new Date(proccesed.processTimestamp*1000+0*1000);//proccesed.getDate();
			}
		}	
		
		// process the walkers rules
		for (var walkerKey in this.walkers)
		{
			var walker = this.walkers[walkerKey];
			walker.processWalkerRules(this);
		}
	}

	
	
	
	log()
	{
		console.log("pathWorld log:"+CommontoString(this.worldDisplay));
	}
	
	
	isWalkerNew(walkerName)
	{
		return(!this.walkers.hasOwnProperty(walkerName));
	}
	
	isJunctionNew(junctionName)
	{
		return(!this.junctions.hasOwnProperty(junctionName));
	}
	
	isNextWorldUpdateReady(timestamp)
	{
		var ready = false;
		if(this.worldUpdateQueue.length>0)
		{
			ready = this.worldUpdateQueue[0].readyToBeProcessed(timestamp);
		}
		return(ready);
	}
	
	peekAtNextWorldUpdate()
	{
		var worldUpdate = null;
		if(this.worldUpdateQueue.length>0)
		{
			worldUpdate = this.worldUpdateQueue[0];
		}
		return(worldUpdate);
	}
	
	getCreatePath(junctionStart,junctionEnd,pathInfo)
	{
		var connectorDisplayObject = this.canvasHolder.getConnectorDisplay(pathInfo.pathTypeKey);
		
		var path = null;
		var pathKey = this.getPathKey(junctionStart,junctionEnd);
		if(!this.paths.hasOwnProperty(pathKey))
		{
			var p = this.canvasHolder.getConnector("path",pathKey);
			p.setJunctions(junctionStart,junctionEnd);
			this.paths[pathKey] = p;
		}
		var path = this.paths[pathKey];
		return(path);
	}
	
	getWalkerList()
	{
		var walkerList = new Array();
		var walkers = this.walkers;
		Object.keys(this.walkers).forEach(function (key)
		{
			walkerList.push(walkers[key]);
		});
		return(walkerList);
	}

	getPathList()
	{
		var pathList = new Array();
		var paths = this.paths;
		Object.keys(this.paths).forEach(function (key)
		{
			pathList.push(paths[key]);
		});
		return(pathList);
	}

	getJunctionList()
	{
		var junctionList = new Array();
		var junctions = this.junctions;
		Object.keys(this.junctions).forEach(function (key)
		{
			junctionList.push(junctions[key]);
		});
		return(junctionList);
	}
	
	/*
	getJuntionGraphData(junctionInfo)
	{
		var junctionGraphData = this.worldDisplay.junctionTypes["generic"];
	
		if(this.worldDisplay.junctionTypes.hasOwnProperty(junctionInfo.junctionTypeKey))
		{
			junctionGraphData = this.worldDisplay.junctionTypes[junctionInfo.junctionTypeKey];
	
		}
		return(junctionGraphData);
	}
	*/
	getCreateJunction(name,junctionInfo)
	{
		//var junctionGraphData = this.getJuntionGraphData(junctionInfo);
		if(!this.junctions.hasOwnProperty(name))
		{
			//console.log("PathWorld:getCreateJunction:type="+junctionInfo.junctionTypeKey);

			var startPosition = this.getStartPositionJunction();
			this.junctions[name] = new Junction(
				name,
				new Position(startPosition.getX(),startPosition.getY()),
				this.canvasHolder,
				new Array(),
				junctionInfo.junctionTypeKey,
				junctionInfo,
				this);
			var j = this.junctions[name];
			//console.log("pathWorld getCreateJunction inner name:"+j.name)	
			this.addNode(j);
			this.worldWall.addNode(j);
			this.junctionSpacer.addNode(j);
		}
		var junction = this.junctions[name];
	
		return(junction);
	}
	
	/*
	getWalkerGraphData(walkerInfo)
	{
		var walkerGraphData = this.worldDisplay.walkerDisplayTypes["generic"];
		//console.log("getWalkerGraphData:looking up:"+CommontoString(walkerInfo));
		if(this.worldDisplay.walkerDisplayTypes.hasOwnProperty(walkerInfo.walkerTypeKey))
		{
			//console.log("     getWalkerGraphData:found:"+CommontoString(walkerInfo.walkerTypeKey));
			walkerGraphData = this.worldDisplay.walkerDisplayTypes[walkerInfo.walkerTypeKey];
		}
		return(walkerGraphData);
	}
	*/
	getCreateWalker(walkerName,walkerInfo)
	{
		//var walkerGraphData = this.getWalkerGraphData(walkerInfo);
		
		if(!this.walkers.hasOwnProperty(walkerName))
		{
			//console.log("PathWorld:getCreateWalker:type="+walkerInfo.walkerTypeKey);

			var startPosition = this.getStartPositionWalker();
			this.walkers[walkerName] = new Walker(
					walkerName,
					new Position(startPosition.getX(),startPosition.getY()),
					this.canvasHolder,
					new Array(),
					walkerInfo.walkerTypeKey,
					walkerInfo);
			var w = this.walkers[walkerName];
			this.addNode(w);
			this.worldWall.addNode(w);
			//this.junctionSpacer.addNode(j);
		}
		var walker = this.walkers[walkerName]; 
		return(walker);
	}
	
	removeWalker(walker)
	{
		//console.log("PathWorld.removeWalker:"+walker.name+" at "+walker.getCurrentJunction().name);
		if(walker.getCurrentJunction())	walker.getCurrentJunction().removeWalker(walker);
		this.removeNode(walker);
		this.worldWall.removeNode(walker);
		delete this.walkers[walker.name];
	}
	
	getTeleportPath(startJunction,endJunction)
	{
		var startJunctionName = "";
		var endJunctionName = "";
		if(startJunction!=null) startJunctionName = startJunction.name;
		if(endJunction!=null) endJunctionName = endJunction.name;
		var teleportPathReturn = null;
		for(var i=0;i<this.worldDisplay.teleportPaths.length;i++)
		{
			var teleportPath = this.worldDisplay.teleportPaths[i];
			var startJunctionRegExp = new RegExp(teleportPath.startJunction);
			var endJunctionRegExp = new RegExp(teleportPath.endJunction);
			if(
					startJunctionRegExp.test(startJunctionName) &&
					endJunctionRegExp.test(endJunctionName) &&
					startJunctionName!=endJunctionName)
			{
				teleportPathReturn = teleportPath;
				break;
			}
		}
		return(teleportPathReturn);
	}
	
	getEndPointMod(startJunction,endJunction)
	{
		var startJunctionName = "";
		var endJunctionName = "";
		if(startJunction!=null) startJunctionName = startJunction.name;
		if(endJunction!=null) endJunctionName = endJunction.name;
		var endPointReturn = null;
		for(var i=0;i<this.worldDisplay.endPointMods.length;i++)
		{
			var endPoint = this.worldDisplay.endPointMods[i];
			var startJunctionRegExp = new RegExp(endPoint.startJunction);
			var endJunctionRegExp = new RegExp(endPoint.endJunction);
			if(
					startJunctionRegExp.test(startJunctionName) &&
					endJunctionRegExp.test(endJunctionName) &&
					startJunctionName!=endJunctionName)
			{
				endPointReturn = endPoint;
				break;
			}
		}
		return(endPointReturn);
	}
	
	processWorldUpdateQueue()
	{
		var worldUpdate = this.getNextFromWorldUpdate();
		if(worldUpdate!=null) worldUpdate = this.processWorldUpdate(worldUpdate);
		return(worldUpdate);
	}
	
	processWorldUpdate(worldUpdate)
	{
		//console.log("processWorldUpdateQueue:worldUpdate="+CommontoString(worldUpdate));		
		var isWalkerNew = this.isWalkerNew(worldUpdate.walkerName);
		var isJunctionNew = this.isJunctionNew(worldUpdate.junctionName);
		var walker = this.getCreateWalker(worldUpdate.walkerName,worldUpdate.walkerInfo);
		var junction = this.getCreateJunction(worldUpdate.junctionName,worldUpdate.junctionInfo);		
		var currentJunction = walker.getCurrentJunction();	
		
		var endPointMod = this.getEndPointMod(currentJunction,junction);		
		if(endPointMod!=null)
		{
			console.log("Before getEndPointMod! name="+endPointMod.endPointModName+" start="+currentJunction.name+
					" end="+junction.name+" walkerName:"+worldUpdate.walkerName+
					" worldUpdate="+CommontoString(worldUpdate));
			
			
			isJunctionNew = this.isJunctionNew(endPointMod.endPointModName);
			worldUpdate.junctionInfo.junctionName = endPointMod.endPointModName;
			worldUpdate.junctionName = endPointMod.endPointModName;
			junction = this.getCreateJunction(endPointMod.endPointModName,worldUpdate.junctionInfo);
			console.log("...after getEndPointMod! name="+endPointMod.endPointModName+" start="+currentJunction.name+
					" end="+junction.name+" walkerName:"+worldUpdate.walkerName+
					" worldUpdate="+CommontoString(worldUpdate));
			//walker.setCurrentJunction(currentJunction);
		}
		
		var teleportPath = this.getTeleportPath(currentJunction,junction);
		if(teleportPath!=null)
		{	var cjname = "null";
			if(currentJunction!=null) cjname = currentJunction.name; 
			//console.log("Teleport Path! name="+teleportPath.teleportName+" start="+cjname+" end="+junction.name);
			
			currentJunction = this.getCreateJunction(teleportPath.teleportName,
					{junctionName:teleportPath.teleportName,junctionTypeKey:"genericJunction"});
			//console.log("...after Teleport Path! name="+teleportPath.teleportName+" start="+currentJunction.name+" end="+junction.name);
			walker.setCurrentJunction(currentJunction);
		}
		
		if(currentJunction!=null)
		{
			this.getCreatePath(currentJunction,junction,worldUpdate.pathInfo);
			//walker.setCurrentJunction(junction);
		}
		
		walker.setCurrentJunction(junction);
		walker.lastUpdateTimeStamp = this.checkTimestamp;
		if(isJunctionNew)
		{
			if(this.junctions.length==0)
			{
				this.junction.position.setX(0);
				this.junction.position.setY(0);
			}
			else if(currentJunction==null)
			{
				junction.position.setX(this.worldDisplay.relaxedDistanceDefault);
				junction.position.setY(this.worldDisplay.relaxedDistanceDefault);
			}
			else
			{
				junction.position.setX( currentJunction.position.getX()+this.worldDisplay.junctionRadiusDefault*(Math.random()) );
				junction.position.setY( currentJunction.position.getY()+this.worldDisplay.junctionRadiusDefault*(Math.random()) );
			}
		}
		if(isWalkerNew)
		{
			walker.position.setX( junction.position.getX() );
			walker.position.setY( junction.position.getY() );
		}
		this.worldUpdateQueueProcessed.push(worldUpdate);
		return(worldUpdate);
	}
	
	
	
	addToWorldUpdateQueue(worldUpdate)
	{
		this.worldUpdateQueue.isInNeedOfSorting = true;
		this.worldUpdateQueue.push(worldUpdate);
	}	
	
	prepareWorldUpdateQueue()
	{
		//console.log("prepareWorldUpdateQueue:isInNeedOfSorting="+this.worldUpdateQueue.isInNeedOfSorting);
		if(this.worldUpdateQueue.isInNeedOfSorting)
		{
			this.worldUpdateQueue.sort(
				function(a, b)
				{
					return(a.processTimestamp-b.processTimestamp);
				}
				);
			this.worldUpdateQueue.isInNeedOfSorting = false;
		}
	}
	
	getNextFromWorldUpdate(worldUpdate)
	{
		var worldUpdate = null;
		if(this.worldUpdateQueue.length>0)
		{
			worldUpdate = this.worldUpdateQueue[0];
			this.worldUpdateQueue.shift();
		}
		return(worldUpdate);
	}
	
	getWalkerKey(walker)
	{
		return(walker.name);
	}
	
	getJunctionKey(junction)
	{
		return(junction.getNodeKey());
	}
	
	getPathKey(junctionStart,junctionEnd)
	{
		return(this.getJunctionKey(junctionStart)+"#"+this.getJunctionKey(junctionEnd));
	}
	
	getStartPositionWalker()
	{
		return(new Position(this.canvasHolder.getWidth()/2,this.canvasHolder.getHeight()/2));
	}
	
	getStartPositionJunction()
	{
		return(new Position(this.canvasHolder.getWidth()/2,this.canvasHolder.getHeight()/2));
	}

}
//<js2node>
module.exports = PathWorld;
console.log("Loading:PathWorld");
//</js2node>

},{"../common/common":35,"../nodes/nodecanvas/nodecanvas":48,"../nodes/nodecanvas/nodecanvasmouse":49,"../nodes/position/position":55,"../paths/junction":58,"../paths/path":61,"../paths/walker":64}],63:[function(require,module,exports){
var CanvasDef = require('../nodes/nodecanvas/canvasdef');


class PathWorldDef extends CanvasDef
{
	constructor()
	{		
		super();
	}
	
	getPathParts()
	{
		throw "PathWorldDef.getPathParts not defined";
	}
	
	getPathDef()
	{
		throw "PathWorldDef.getPathDef not defined";
	}
	
	getWalkerJunctionRules()
	{
		throw "PathWorldDef.getWalkerJunctionRules not defined";
	}
}

//<js2node>
module.exports = PathWorldDef;
console.log("Loading:PathWorldDef");
//</js2node>

},{"../nodes/nodecanvas/canvasdef":44}],64:[function(require,module,exports){
var Node = require('../nodes/node');
var Common = require('../common/common');

class Walker extends Node
{
	constructor(name,position,canvasHolder,shapeList,graphDataKey,infoData)
	{
		super(name,position,canvasHolder,graphDataKey,infoData);
		Walker.initWalker(this,name,position,shapeList,graphDataKey,infoData);
	}
	
	static initWalker(walker,name,position,shapeList,graphDataKey,infoData)
	{
		walker.junctionArray = new Array();
		walker.layer=2;
		if(!walker.graphData.walkerJunctionRules) walker.graphData.walkerJunctionRules = new Object();
		if(!walker.graphData.walkerJunctionRules.junctionExits)
			walker.graphData.walkerJunctionRules.junctionExits = new Array();
	}
	
	getClientJson()
	{
		var json = super.getClientJson();
		json.pathWorldTye = "walker";
		json.currentJunction = this.getCurrentJunction().getNodeKey();
		return(json);
	}

	
	getNodeUiDisplay(node)
	{
		var value = this.name;
	
		value += "<li>type:"+this.infoData.walkerTypeKey+"</li>";
		value += "<li>currentJ:"+this.getCurrentJunction().name+"</li>";
		
		for(var i=0;i<this.graphData.walkerJunctionRules.junctionExits.length;i++)
		{
			var exit = this.graphData.walkerJunctionRules.junctionExits[i];
	
			var timeToRemove = (
					(this.lastUpdateTimeStamp+exit.exitAfterMiliSeconds)
					<
					world.checkTimestamp);
	
			value += "<li>exitJunction:i="+i+" "+exit.exitJunction+
				" at exit:"+(exit.exitJunction==this.getCurrentJunction().name)+
				" timeToRemove:"+timeToRemove+
				"</li>";
		}
		//////////////value += "<li>remove at:"+(this.lastUpdateTimeStamp+exit.exitAfterMiliSeconds)+"</li>";
		//value += "<li>checkTime:"+world.checkTimestamp+"</li>";
		/////////value += "<li>diff:"+(world.checkTimestamp-(this.lastUpdateTimeStamp+exit.exitAfterMiliSeconds))+"</li>";
		return(value);
	}
	
	
	processWalkerRules(world)
	{
		//console.log("w:"+this.name+" currentJunction="+this.getCurrentJunction().name);
		
		for(var i=0;i<this.graphData.walkerJunctionRules.junctionExits.length;i++)
		{
			var exit = this.graphData.walkerJunctionRules.junctionExits[i];
			if(exit.exitJunction==this.getCurrentJunction().name)
			{
				var timeToRemove = (
						(this.lastUpdateTimeStamp+exit.exitAfterMiliSeconds)
						<
						world.checkTimestamp);
				
		
				if(timeToRemove)
				{
					
					console.log("TIME TO EXIT w:"+this.name+
							" currentJunction="+this.getCurrentJunction().name+
							" exit:"+exit.exitJunction+
							" type:"+CommontoString(this.infoData.walkerTypeKey)+
							" infoData:"+CommontoString(this.infoData));
							
					world.removeWalker(this);
				}
			}
		}
		//console.log("w:"+this.name+" junction:"+this.getCurrentJunction());
	}
	
	setCurrentJunction(junction)
	{
		if(this.getCurrentJunction()!=null)
		{
			//console.log("getCurrentJunction().removeWalker ");
			this.getCurrentJunction().removeWalker(this);
		}
		this.junctionArray.push(junction);
		junction.addWalker(this);
	}
	
	getCurrentJunction()
	{
		if(this.junctionArray.length==0) return(null);
		return(this.junctionArray[this.junctionArray.length - 1]);
	}
	
	log()
	{
		console.log("walker log:"+CommontoString(this));
	}
}
//<js2node>
module.exports = Walker;
console.log("Loading:Walker");
//</js2node>

},{"../common/common":35,"../nodes/node":43}],65:[function(require,module,exports){
////////////////////////////////////////////
// WorldUpdate
//////////////////////////////////////////////
class WorldUpdate
{
	constructor(junctionName,walkerName,processTimestamp,walkerInfo,junctionInfo,pathInfo)
	{
		WorldUpdate.createWorldUpdate(this,junctionName,walkerName,processTimestamp,walkerInfo,junctionInfo,pathInfo);
	}
	
	static createWorldUpdateFromJson(json)
	{
		var worldUpdate = new WorldUpdate(
				json.junctionName,
				json.walkerName,
				json.processTimestamp,
				json.walkerInfo,
				json.junctionInfo,
				json.pathInfo);
		return(worldUpdate);
	}
		
	static createWorldUpdate(worldUpdate,junctionName,walkerName,processTimestamp,walkerInfo,junctionInfo,pathInfo)
	{
		worldUpdate.junctionName = junctionName;
		worldUpdate.walkerName = walkerName;
		worldUpdate.processTimestamp = processTimestamp;
		worldUpdate.walkerInfo = walkerInfo;
		worldUpdate.junctionInfo = junctionInfo;
		worldUpdate.pathInfo = pathInfo;
		worldUpdate.updateType = "junction";

	}
	
	readyToBeProcessed (timestamp)
	{
		return( (this.processTimestamp<=timestamp) );
		//return(  (this.getDate().getTime()<=timestamp)  );
	}
	
	xgetDate()
	{
		return(new Date(this.processTimestamp*1000));
	}
}

//<js2node>
module.exports = WorldUpdate;
console.log("Loading:WorldUpdate");
//</js2node>

},{}],66:[function(require,module,exports){
var CanvasHolder = require('../../nodes/nodecanvas/canvasholder');
var CanvasHolderVirtual = require('../../nodes/nodecanvas/canvasholdervirtual');
var Position = require('../../nodes/position/position');
var PathWorld = require('../../paths/pathworld');
var WorldUpdate = require('../../paths/worldupdate');
var DemoGraph1GraphPathWorldDef = require('./demograph1pathworlddef');
var Common = require('../../common/common');
var CanvasHolder = require('../../nodes/nodecanvas/canvasholder');
var PushDemoGrap1h = require('./pushdemograph1');

class DemoGraph1ClientStandAlone
{
	constructor(canvasHolder)
	{
		this.canvasName = canvasHolder.canvasName;
		this.canvasHolder = canvasHolder;
		this.worldDisplay = this.canvasHolder.worldDef.getWorldDispaly();	
		this.world = new PathWorld(
				this.canvasHolder,		
				this.worldDisplay);
		this.world.timeFactor = 1.0;
		this.world.startTime = new Date();
		this.lastTimeDelta = -1;

		var firstItem = this.world.peekAtNextWorldUpdate();
		if(firstItem!=null)
		{
			var firstDate = firstItem.getDate();
			this.world.startTime = firstDate;
		}
	}
	
	static getExports()
	{
		//var exports = super.getExports();
		//exports.PathClientStandAlone = PathClientStandAlone;
		
		console.log.apply("DemoGraph1ClienStandAlone:Getting exports");
		return(
			//exports
				
				{
					CanvasHolder:CanvasHolder,
					CanvasHolderVirtual:CanvasHolderVirtual,
					Position:Position,
					PathWorld:PathWorld,
					WorldUpdate:WorldUpdate,
					DemoGraph1GraphPathWorldDef:DemoGraph1GraphPathWorldDef,
					Common:Common,
					PushDemoGrap1h:PushDemoGrap1h,
				}
				
				);
	}
	
	startAnimation()
	{
			this.doDraw();
			var self = this;
			setInterval(function(){ self.doDraw(); },250);		
	}
	
	doDraw()
	{
		/*
		if(this.lastTimeDelta<0) this.getData();
		else
		{
			this.getDelta(this.lastTimeDelta);
			this.pushUserMovments();
		}
		*/
	}    				
	
	pushUserMovments()
	{
		//console.log("pushUserMovments...");
		/*
		var nodeMouseMovment = this.world.nodeCanvasMouse.nodeMouseMovment;
		var self = this;
		Object.keys(nodeMouseMovment).forEach(function (key)
		{
			var movePosition = Position.getAveragePostionFromPositionList(nodeMouseMovment[key].movePostionArray);
			nodeMouseMovment[key].movePostionArray.length = 0;
			delete nodeMouseMovment[key];
			
			var moveMessage = 
			{
				nodeKey:key,
				movePosition
			};
			self.sendServerJson(
				"/paths/"+self.canvasName+"/movenode/",
				moveMessage);
			console.log("movements for : "+key);
		});
		*/
	}
	
	sendServerJson(url,json)
	{
		/*
		var encodedJson = Common.jsonToURI(json);
		fetch(url+encodedJson).then((resp) => resp.json()).then(
	  				function(data)
	  				{
	    				console.log("sent json to "+url);
					});  	
					*/
	 }
	
	getDelta(deltaTime)
	{
		/*
		var url = "/paths/"+this.canvasName+"/delta/"+deltaTime+"/"+10;
		var self = this;
		fetch(url).then((resp) => resp.json()).then(
	  				function(data)
	  				{
	    				for(var i=0;i<data.length;i++)
	    				{
	    					var  oneData = data[i];
	    					if(oneData.updateType== "junction")
							{
	    						self.world.addToWorldUpdateQueue(WorldUpdate.createWorldUpdateFromJson(oneData));
	
	    					}
	    					else if(oneData.updateType=="move")
	    					{
	    						console.log("move:"+Common.toString(oneData));
	    						if(self.world.doesNodeExist(oneData.nodeKey))
	    						{
	    							var node = self.world.getNode(oneData.nodeKey);
	    							if(!node.isSelected) node.position.setXY(oneData.movePosition.x,oneData.movePosition.y);
	    						}
	    					}
	    					self.lastTimeDelta = oneData.processTimestamp;
	    				}
					});  	
					*/
	 }
	
	getData()
	{
		/*
		var url = "/paths/"+this.canvasName;
		var self = this;
		fetch(url).then((resp) => resp.json()).then(
	  				function(data)
	  				{
	    				PathWorld.fillPathWorldFromClientJson(self.world,data);
					});
		*/
		this.lastTimeDelta = 0;	

	}
}

//<js2node>
module.exports = DemoGraph1ClientStandAlone;
console.log("Loading:DemoGraph1ClientStandAlone");
//</js2node>
},{"../../common/common":35,"../../nodes/nodecanvas/canvasholder":45,"../../nodes/nodecanvas/canvasholdervirtual":46,"../../nodes/position/position":55,"../../paths/pathworld":62,"../../paths/worldupdate":65,"./demograph1pathworlddef":67,"./pushdemograph1":68}],67:[function(require,module,exports){
var PathWorldDef = require('../../paths/pathworlddef');
var CanvasHolder = require('../../nodes/nodecanvas/canvasholder');
var PathWorld = require('../../paths/pathworld');
var WorldUpdate = require('../../paths/worldupdate');
var Path = require('../../paths/path');
var Common = require('../../common/common');
var CircleDisplay = require('../../nodes/nodedisplay/circledisplay');
var ConnectorDisplayEmpty = require('../../nodes/connectordisplay/connectordisplayempty');
var GroupConnector = require('../../nodes/connector/groupconnector');
var WallConnector = require('../../nodes/connector/wallconnector');
var JunctionConnector = require('../../paths/nodedisplay/junctionconnector');
var JunctionDisplay = require('../../paths/nodedisplay/junctiondisplay');
var RectangleDisplay = require('../../nodes/nodedisplay/rectangledisplay');
var TriangleDisplay = require('../../nodes/nodedisplay/triangledisplay');
var ArcDisplayShape = require('../../nodes/nodedisplay/arcdisplayshape');

//var InitInaGraph = require('../../pathsexp/inagraph/initinagraph');




class DemoGraph1GraphPathWorldDef extends PathWorldDef
{

	constructor()
	{
		super();
		this.init();
	}
	
	init()
	{
		this.worldDefaults =
		{
				junctionRadiusDefault:15,
				walkerRadiusDefault:15*0.3,
				relaxedDistanceDefault:8.5*10,
				elasticityFactorDefualt:0.025,
				port:3000,
		};
		
		this.pathParts =
		{
			starta:["Step 1a","Step 2a","Step 3a"],
			startb:["Step 1b","Step 2b","Step 3b"],
			startc:["Step 1c","Step 2c","Step 3c"],
			middle:["Step 4","Step 5","Step 6","Step 7","Step 8"],
			enda:["Step7","Step 7a","Step 8a"],
			endb:["Step8","Step 8b","Step 8b"],
			endc:["Step8","Step 9c","Step 10c","Step 11c","Step 12c"],
		};

		
		this.pathDefs =
		[
			{
				pathDefName:"path1",numberNodes:100,nodeShape:"circle",nodeColor:"ff0000",
				path:["starta","middle","enda"]
			},
			{
				pathDefName:"path2",numberNodes:100,nodeShape:"square",nodeColor:"ffff00",
				path:["startb","middle","endb"]
			},
			{
				pathDefName:"path3",numberNodes:100,nodeShape:"triangle",nodeColor:"0000ff",
				path:["startc","middle","endc"]
			},

		];
			
	    this.junctionExits = 
	    [
			{exitJunction:"Step 8a",exitAfterMiliSeconds:60*60*24*1000},
			{exitJunction:"Step ba",exitAfterMiliSeconds:60*60*24*1000},
			{exitJunction:"Step 12c",exitAfterMiliSeconds:60*60*24*1000},
	    ];
		
		this.worldDisplay =
		{	
			junctionRadiusDefault:this.worldDefaults.junctionRadiusDefault,
			walkerRadiusDefault:this.worldDefaults.walkerRadiusDefault,
			relaxedDistanceDefault:this.worldDefaults.relaxedDistanceDefault,
			elasticityFactorDefualt:this.worldDefaults.elasticityFactorDefualt,
			
		    worldBackgroundColor:"e0e0f0ff",
		
		    teleportPaths:
				[
					// Teleport Path! name=Requeue to MS start=DT1 end=MS/In Progress
					//{teleportName:"Requeue to MS/In Progress",startJunction:"^((?!DT1|MS.*|Signing).)*$",endJunction:"MS/In Progress"},
					//{teleportName:"Requeue to MS",startJunction:"^((?!DT1|MS.*|Signing).)*$",endJunction:"MS"},
					//{teleportName:"Requeue to DT1",startJunction:"^((?!CS|MS.*).)*$",endJunction:"DT1"},
					//{teleportName:"Requeue to MRP-Packaging",startJunction:"^((?!Signing|Cancled).)*$",endJunction:"MRP-Packaging"},
					//{teleportName:"Requeue to Signing",startJunction:"^((?!MS|Packaging|MRP-Packaging).)*$",endJunction:"Signing"},
					//{teleportName:"Test canceled",startJunction:"^((?!Canceled|.*Packaging.*).)*$",endJunction:"Canceled"},	
				],
			endPointMods:
				[
					////////////////////{endPointModName:"MRP-Test Reported",startJunction:"MRP-Packaging",endJunction:"Test Reported"},		
					//{endPointModName:"NEW-Test Reported",startJunction:".*",endJunction:"Test Reported"},		
				],
			connectorDefs:
			{
				generic:
					function(worldDef,name) 
					{
						return(
								new GroupConnector(
										new ConnectorDisplayEmpty(),
										null,
										null,
										worldDef.worldDefaults.relaxedDistanceDefault*2.5,
										worldDef.worldDefaults.elasticityFactorDefualt,
										name)
								);
					},
				junctionSpacer:
					function(worldDef,name) 
					{
						return(
								new GroupConnector(
										new ConnectorDisplayEmpty(),
										null,
										null,
										worldDef.worldDefaults.relaxedDistanceDefault*2.5,
										worldDef.worldDefaults.elasticityFactorDefualt,
										name)
								);
					},
				worldWall:
					function(worldDef,name)
					{
						return(
								new WallConnector(
										new ConnectorDisplayEmpty(),
										null,
										null,
										worldDef.worldDefaults.relaxedDistanceDefault*0.75,
										1-worldDef.worldDefaults.elasticityFactorDefualt,
										name)
								);
					},
				path:
					function(worldDef,name)
					{
						return(
							new Path(new JunctionConnector(
									{lineColor:"0000a0ff",lineWidth:5}),
								null,
								null,
								worldDef.worldDefaults.relaxedDistanceDefault*1.25,
								1-worldDef.worldDefaults.elasticityFactorDefualt,
								name)
						);
				}
				
			},
		    connectorDisplay:
			{
				generic:
				{
					connectorDisplay: new JunctionConnector(
					{
						lineColor:"0000a0ff",lineWidth:5
					}),					
				},
			},
			nodeDisplay:
			{
				generic:
				{
		
					nodeDisplay:new TriangleDisplay(
							{
								fillColor:"ffffffff",borderColor:"000000ff",
								selectFillColor:"20ff20ff",selectBorderColor:"0000ffff",
								borderWidth:1,
								radius:this.worldDefaults.walkerRadiusDefault/1.25,
								width:(this.worldDefaults.walkerRadiusDefault/1.25)*2,
								height:(this.worldDefaults.walkerRadiusDefault/1.25)*2,
								clone:false
							}),
					walkerJunctionRules:this.junctionExits,							
				},
				genericJunction:
				{			
					//initGraphData:InaGraphPathWorldDef.initJunctionDisplay,
					initGraphData:this.initJunctionDisplay,
					nodeDisplay:{displayInfo:{clone:false}}
				},
				nodeGeneric:
				{
		
					nodeDisplay:new TriangleDisplay(
							{
								fillColor:"ffffffff",borderColor:"000000ff",
								selectFillColor:"20ff20ff",selectBorderColor:"0000ffff",
								borderWidth:1,
								radius:this.worldDefaults.walkerRadiusDefault/1.25,
								width:(this.worldDefaults.walkerRadiusDefault/1.25)*2,
								height:(this.worldDefaults.walkerRadiusDefault/1.25)*2,
								clone:false
							}),
					walkerJunctionRules:this.junctionExits,
				},
				junctionPieSlice:
				{
					
					nodeDisplayFunction:function()
						{
							return(new ArcDisplayShape(
								{
									fillColor:"00000000",
									borderColor:"000000ff",
									selectFillColor:"00ff007f",selectBorderColor:"000000ff",
									borderWidth:1,
									radius:25,
									curvePoints:16,
									startAngle:0,
									endAngle:320,
									width:25,
									height:25,
									ts:new Date().getTime(),
									clone:true
								}))
								},
					nodeDisplay:new ArcDisplayShape(
					{
						fillColor:"00000000",
						borderColor:"000000ff",
						selectFillColor:"00ff007f",selectBorderColor:"000000ff",
						borderWidth:1,
						radius:25,
						curvePoints:16,
						startAngle:0,
						endAngle:320,
						width:25,
						height:25,
						clone:true
					}),
				},
				path1:
				{
		
					nodeDisplay:new TriangleDisplay(
							{
								fillColor:"FFA500ff",borderColor:"000000ff",
								selectFillColor:"20ff20ff",selectBorderColor:"0000ffff",
								borderWidth:1,
								//radius:walkerRadiusDefault/1.25,
								width:(this.worldDefaults.walkerRadiusDefault/1.25)*2,
								height:(this.worldDefaults.walkerRadiusDefault/1.25)*2,
								clone:false
							}),
					walkerJunctionRules:this.junctionExits,
				},
				normal:
				{
					nodeDisplay:new RectangleDisplay(
							{
								fillColor:"ff2020ff",borderColor:"000000ff",
								selectFillColor:"20ff20ff",selectBorderColor:"0000ffff",
								borderWidth:1,
								width:(this.worldDefaults.walkerRadiusDefault/1.25)*2,
								height:(this.worldDefaults.walkerRadiusDefault/1.25)*2,
								clone:false							
							}),
					walkerJunctionRules:this.junctionExits,
				},
				path2:
				{
					nodeDisplay:new CircleDisplay(
							{
								fillColor:"00A5FFff",borderColor:"000000ff",
								selectFillColor:"20ff20ff",selectBorderColor:"0000ffff",
								borderWidth:1,
								radius:this.worldDefaults.walkerRadiusDefault/1.25,
								width:(this.worldDefaults.walkerRadiusDefault/1.25)*2,
								height:(this.worldDefaults.walkerRadiusDefault/1.25)*2,
								clone:false
							}),
					walkerJunctionRules:this.junctionExits,		
				},
				path3:
				{
					nodeDisplay:new CircleDisplay(
							{
								fillColor:"A5FF00ff",borderColor:"000000ff",
								selectFillColor:"20ff20ff",selectBorderColor:"0000ffff",
								borderWidth:1,
								radius:this.worldDefaults.walkerRadiusDefault/1.25,
								width:(this.worldDefaults.walkerRadiusDefault/1.25)*2,
								height:(this.worldDefaults.walkerRadiusDefault/1.25)*2,
								clone:false
							}),
					walkerJunctionRules:this.junctionExits,
				},
				testing:
				{
					nodeDisplay:new CircleDisplay(
							{
								fillColor:"A5FF00ff",borderColor:"000000ff",
								selectFillColor:"20ff20ff",selectBorderColor:"0000ffff",
								borderWidth:1,
								radius:this.worldDefaults.walkerRadiusDefault*3,
								width:(this.worldDefaults.walkerRadiusDefault*3)*2,
								height:(this.worldDefaults.walkerRadiusDefault*3)*2,
								clone:false
							}),
					walkerJunctionRules:this.junctionExits,
				},
			},
		};
		
	}
	
	getPathParts()
	{
		return(this.pathParts);
	}
	
	getPathDef()
	{
		return(this.pathDefs);
	}
	
	getWorldDispaly()
	{
		return(this.worldDisplay);
	}
	
	getWalkerJunctionRules()
	{
		return(this.junctionExits);
   	}
	
	getWorldDefaults()
	{

		return(this.worldDefaults);
	}
	
	//static initJunctionDisplay(node)
	initJunctionDisplay(node)
	{
		console.log("inside initJunctionDisplay for name="+node.name);
		node.graphData.nodeDisplay = new JunctionDisplay(
				{
					fillColor:"a0a0ffff",
					borderColor:"000000ff",
					selectFillColor:"ffff00ff",
					selectBorderColor:"0000ffff",
					borderWidth:2,
					fontStyle:"bold",
					fontPixelHeight:15,
					fontFace:"Arial",
					rectBorderColor:"0000ffff",
					rectFillColor:"ffffffff",
					fontColor:"0000ffff",
					clone:false
				});
		//node.graphData.nodeDisplay.clone=false;
		node.graphData.textSpacer = 5;
		//node.graphData.radius = this.worldDefaults.junctionRadiusDefault*3;
		node.graphData.radius = 15;
		node.graphData.width = node.graphData.radius*2;
		node.graphData.height = node.graphData.radius*2;
		if(node.graphData.nodes==null) node.graphData.nodes = new Array();
	}
	
	
	getPathArray()
	{
		var allPathArray = [];
		for(var i=0;i<this.pathDefs.length;i++)
		{
			var pathDef = this.pathDefs[i]; 
			for(var nodeLoop=0;nodeLoop<pathDef.numberNodes;nodeLoop++)
			{
				var pathArray = [];
				for(var j=0;j<pathDef.path.length;j++)
				{
					var pathName = pathDef.path[j];
					var pathDefName = pathDef.pathDefName;
					//console.log("   doing pathDefName="+pathDefName+" pathName="+pathName);
					for(var k=0;k<this.pathParts[pathName].length;k++)
					{
						//console.log("               junction="+pathParts[pathName][k]);
						pathArray.push(this.pathParts[pathName][k]);
					}
				}
				allPathArray.push(
				{
					pathDef:pathDef,
					path:pathArray
				});
				//console.log("#"+i+" pathArray size="+pathArray.length+" name="+pathDef.pathDefName);
			}
		}
		//CommonshuffleArray(allPathArray);
		return(allPathArray);
	}
	
	initCustomNodes(world)
	{
		var pathArray = this.getPathArray();
		
		var now = new Date().getTime();
		//now = Math.floor(now/1000);
		//now = now/1000;
		//var lastTime = now;
		
		for(var i=0;i<pathArray.length;i++)
		{
			var lastTime = now;
			var pd = pathArray[i];
			//console.log("Start of worldUpdate:"+CommontoString(pd));
			
			var startSpacer = Math.floor(Math.random()*360000)-0;
			if( (lastTime+startSpacer) < now) startSpacer = 0;
			for(var j=0;j<pd.path.length;j++)
			{
				var spacer = Math.floor(Math.random()*8000)+1000;
				lastTime += spacer;
				
				//console.log("adding : pathName="+pd.pathDef.pathDefName+" junction="+pd.path[j]);
	
				var worldUpdate = new WorldUpdate(
						pd.path[j],
						pd.pathDef.pathDefName+"."+i,
						lastTime+startSpacer,
						{
							waklerName:pd.pathDef.pathDefName+"."+i,
							walkerTypeKey:pd.pathDef.pathDefName
						},
						{
							junctionName:pd.path[j],
							junctionTypeKey:"genericJunction"
						},
						{
							pathTypeKey:"generic"
						},
						{
							status:"In Progress"
						}); // 23-JAN-17 06.35.14 AM
				console.log("adding : pathName="+pd.pathDef.pathDefName+" junction="+pd.path[j]+" ts="+worldUpdate.processTimestamp);

				world.addToWorldUpdateQueue(worldUpdate);
			}
		}
	}
}

//<js2node>
module.exports = DemoGraph1GraphPathWorldDef;
console.log("Loading:DemoGraph1GraphPathWorldDef");
//</js2node>
},{"../../common/common":35,"../../nodes/connector/groupconnector":37,"../../nodes/connector/wallconnector":40,"../../nodes/connectordisplay/connectordisplayempty":42,"../../nodes/nodecanvas/canvasholder":45,"../../nodes/nodedisplay/arcdisplayshape":50,"../../nodes/nodedisplay/circledisplay":51,"../../nodes/nodedisplay/rectangledisplay":53,"../../nodes/nodedisplay/triangledisplay":54,"../../paths/nodedisplay/junctionconnector":59,"../../paths/nodedisplay/junctiondisplay":60,"../../paths/path":61,"../../paths/pathworld":62,"../../paths/pathworlddef":63,"../../paths/worldupdate":65}],68:[function(require,module,exports){
var DemoGraph1GraphPathWorldDef = require('./demograph1pathworlddef');
var Common = require('../../common/common');
var WorldUpdate = require('../../paths/worldupdate');
var PushWorldUpdate = require('../../pathsexp/pathserver/pushworldupdate');
var worldDef = new DemoGraph1GraphPathWorldDef();		
var port = worldDef.getWorldDefaults().port;


class PushDemoGrap1h {

	constructor()
	{
		console.log("Got new PushDemoGrap1h");
	}

	initCustomNodes(world)
	{
		var pathArray = this.getPathArray();
		
		var now = new Date().getTime();
		
		for(var i=0;i<pathArray.length;i++)
		{
			var lastTime = now;
			var pd = pathArray[i];
			//console.log("Start of worldUpdate:"+CommontoString(pd));
			
			var startSpacer = Math.floor(Math.random()*360000)-0;
			if( (lastTime+startSpacer) < now) startSpacer = 0;
			for(var j=0;j<pd.path.length;j++)
			{
				var spacer = Math.floor(Math.random()*8000)+1000;
				lastTime += spacer;

				var worldUpdate = new WorldUpdate(
						pd.path[j],
						pd.pathDef.pathDefName+"."+i,
						lastTime+startSpacer,
						{
							waklerName:pd.pathDef.pathDefName+"."+i,
							walkerTypeKey:pd.pathDef.pathDefName
						},
						{
							junctionName:pd.path[j],
							junctionTypeKey:"genericJunction"
						},
						{
							pathTypeKey:"generic"
						},
						{
							status:"In Progress"
						}); // 23-JAN-17 06.35.14 AM
				console.log("adding : pathName="+pd.pathDef.pathDefName+" junction="+pd.path[j]+" ts="+worldUpdate.processTimestamp);

				//var pushWorldUpdate = new PushWorldUpdate();
				world.addToWorldUpdateQueue(WorldUpdate.createWorldUpdateFromJson(worldUpdate));

				//pushWorldUpdate.sendToServer(worldUpdate);
				
			}
		}
	}

	getPathArray()
	{
		var allPathArray = [];
		for(var i=0;i<worldDef.pathDefs.length;i++)
		{
			var pathDef = worldDef.pathDefs[i]; 
			for(var nodeLoop=0;nodeLoop<pathDef.numberNodes;nodeLoop++)
			{
				var pathArray = [];
				for(var j=0;j<pathDef.path.length;j++)
				{
					var pathName = pathDef.path[j];
					var pathDefName = pathDef.pathDefName;
					//console.log("   doing pathDefName="+pathDefName+" pathName="+pathName);
					for(var k=0;k<worldDef.pathParts[pathName].length;k++)
					{
						//console.log("               junction="+pathParts[pathName][k]);
						pathArray.push(worldDef.pathParts[pathName][k]);
					}
				}
				allPathArray.push(
				{
					pathDef:pathDef,
					path:pathArray
				});
				//console.log("#"+i+" pathArray size="+pathArray.length+" name="+pathDef.pathDefName);
			}
		}
		//CommonshuffleArray(allPathArray);
		return(allPathArray);
	}
}

//<js2node>
module.exports = PushDemoGrap1h;
console.log("Loading:PushDemoGrap1h");
//</js2node>

},{"../../common/common":35,"../../paths/worldupdate":65,"../../pathsexp/pathserver/pushworldupdate":69,"./demograph1pathworlddef":67}],69:[function(require,module,exports){

var Common = require('../../common/common');
var http = require('http');


class PushWorldUpdate
{
	constructor(canvasHolder)
	{
	}
	
	sendToServer(worldUpdate)
	{	
		var options =
		{
  			host: '127.0.0.1',
  			port : 3000,
  			path: '/paths/myCanvas/update/'
		};
		
		var encodedWorldUpdate = Common.jsonToURI(worldUpdate);
		console.log("sending : "+encodedWorldUpdate);
		options.path += encodedWorldUpdate;
		http.request(options,
			function(response)
			{
				var self = this;
			  	var str = '';
			
			  	//another chunk of data has been recieved, so append it to `str`
			  	response.on('data', function (chunk)
			  	{
			    	str += chunk;
			  	});
			
			  	//the whole response has been recieved, so we just print it out here
			  	response.on('end', function ()
				{
				  	console.log(str);
				});
			}).end();
	}
	
}


//<js2node>
module.exports = PushWorldUpdate;
console.log("Loading:PushWorldUpdate");
//</js2node>
},{"../../common/common":35,"http":25}]},{},[66])(66)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL1VzZXJzL21tL0FwcERhdGEvUm9hbWluZy9ucG0vbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL1VzZXJzL21tL0FwcERhdGEvUm9hbWluZy9ucG0vbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jhc2U2NC1qcy9pbmRleC5qcyIsIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL1VzZXJzL21tL0FwcERhdGEvUm9hbWluZy9ucG0vbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcmVzb2x2ZS9lbXB0eS5qcyIsIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL1VzZXJzL21tL0FwcERhdGEvUm9hbWluZy9ucG0vbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2J1ZmZlci1zaGltcy9pbmRleC5qcyIsIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL1VzZXJzL21tL0FwcERhdGEvUm9hbWluZy9ucG0vbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2J1ZmZlci9pbmRleC5qcyIsIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL1VzZXJzL21tL0FwcERhdGEvUm9hbWluZy9ucG0vbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2J1aWx0aW4tc3RhdHVzLWNvZGVzL2Jyb3dzZXIuanMiLCIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9Vc2Vycy9tbS9BcHBEYXRhL1JvYW1pbmcvbnBtL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9jb3JlLXV0aWwtaXMvbGliL3V0aWwuanMiLCIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9Vc2Vycy9tbS9BcHBEYXRhL1JvYW1pbmcvbnBtL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9ldmVudHMvZXZlbnRzLmpzIiwiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vVXNlcnMvbW0vQXBwRGF0YS9Sb2FtaW5nL25wbS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvaWVlZTc1NC9pbmRleC5qcyIsIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL1VzZXJzL21tL0FwcERhdGEvUm9hbWluZy9ucG0vbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2luaGVyaXRzL2luaGVyaXRzX2Jyb3dzZXIuanMiLCIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9Vc2Vycy9tbS9BcHBEYXRhL1JvYW1pbmcvbnBtL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9pcy1idWZmZXIvaW5kZXguanMiLCIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9Vc2Vycy9tbS9BcHBEYXRhL1JvYW1pbmcvbnBtL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9pc2FycmF5L2luZGV4LmpzIiwiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vVXNlcnMvbW0vQXBwRGF0YS9Sb2FtaW5nL25wbS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcHJvY2Vzcy1uZXh0aWNrLWFyZ3MvaW5kZXguanMiLCIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9Vc2Vycy9tbS9BcHBEYXRhL1JvYW1pbmcvbnBtL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanMiLCIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9Vc2Vycy9tbS9BcHBEYXRhL1JvYW1pbmcvbnBtL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9wdW55Y29kZS9wdW55Y29kZS5qcyIsIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL1VzZXJzL21tL0FwcERhdGEvUm9hbWluZy9ucG0vbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3F1ZXJ5c3RyaW5nLWVzMy9kZWNvZGUuanMiLCIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9Vc2Vycy9tbS9BcHBEYXRhL1JvYW1pbmcvbnBtL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9xdWVyeXN0cmluZy1lczMvZW5jb2RlLmpzIiwiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vVXNlcnMvbW0vQXBwRGF0YS9Sb2FtaW5nL25wbS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcXVlcnlzdHJpbmctZXMzL2luZGV4LmpzIiwiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vVXNlcnMvbW0vQXBwRGF0YS9Sb2FtaW5nL25wbS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcmVhZGFibGUtc3RyZWFtL2xpYi9fc3RyZWFtX2R1cGxleC5qcyIsIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL1VzZXJzL21tL0FwcERhdGEvUm9hbWluZy9ucG0vbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3JlYWRhYmxlLXN0cmVhbS9saWIvX3N0cmVhbV9wYXNzdGhyb3VnaC5qcyIsIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL1VzZXJzL21tL0FwcERhdGEvUm9hbWluZy9ucG0vbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3JlYWRhYmxlLXN0cmVhbS9saWIvX3N0cmVhbV9yZWFkYWJsZS5qcyIsIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL1VzZXJzL21tL0FwcERhdGEvUm9hbWluZy9ucG0vbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3JlYWRhYmxlLXN0cmVhbS9saWIvX3N0cmVhbV90cmFuc2Zvcm0uanMiLCIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9Vc2Vycy9tbS9BcHBEYXRhL1JvYW1pbmcvbnBtL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9yZWFkYWJsZS1zdHJlYW0vbGliL19zdHJlYW1fd3JpdGFibGUuanMiLCIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9Vc2Vycy9tbS9BcHBEYXRhL1JvYW1pbmcvbnBtL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9yZWFkYWJsZS1zdHJlYW0vbGliL2ludGVybmFsL3N0cmVhbXMvQnVmZmVyTGlzdC5qcyIsIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL1VzZXJzL21tL0FwcERhdGEvUm9hbWluZy9ucG0vbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3JlYWRhYmxlLXN0cmVhbS9yZWFkYWJsZS5qcyIsIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL1VzZXJzL21tL0FwcERhdGEvUm9hbWluZy9ucG0vbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3N0cmVhbS1odHRwL2luZGV4LmpzIiwiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vVXNlcnMvbW0vQXBwRGF0YS9Sb2FtaW5nL25wbS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvc3RyZWFtLWh0dHAvbGliL2NhcGFiaWxpdHkuanMiLCIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9Vc2Vycy9tbS9BcHBEYXRhL1JvYW1pbmcvbnBtL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9zdHJlYW0taHR0cC9saWIvcmVxdWVzdC5qcyIsIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL1VzZXJzL21tL0FwcERhdGEvUm9hbWluZy9ucG0vbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3N0cmVhbS1odHRwL2xpYi9yZXNwb25zZS5qcyIsIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL1VzZXJzL21tL0FwcERhdGEvUm9hbWluZy9ucG0vbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3N0cmluZ19kZWNvZGVyL2luZGV4LmpzIiwiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vVXNlcnMvbW0vQXBwRGF0YS9Sb2FtaW5nL25wbS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvdG8tYXJyYXlidWZmZXIvaW5kZXguanMiLCIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9Vc2Vycy9tbS9BcHBEYXRhL1JvYW1pbmcvbnBtL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy91cmwvdXJsLmpzIiwiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vVXNlcnMvbW0vQXBwRGF0YS9Sb2FtaW5nL25wbS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvdXJsL3V0aWwuanMiLCIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9Vc2Vycy9tbS9BcHBEYXRhL1JvYW1pbmcvbnBtL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy91dGlsLWRlcHJlY2F0ZS9icm93c2VyLmpzIiwiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vVXNlcnMvbW0vQXBwRGF0YS9Sb2FtaW5nL25wbS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMveHRlbmQvaW1tdXRhYmxlLmpzIiwiLi4vLi4vY29tbW9uL2NvbW1vbi5qcyIsIi4uLy4uL25vZGVzL2Nvbm5lY3Rvci9jb25uZWN0b3IuanMiLCIuLi8uLi9ub2Rlcy9jb25uZWN0b3IvZ3JvdXBjb25uZWN0b3IuanMiLCIuLi8uLi9ub2Rlcy9jb25uZWN0b3Ivc2hhcGVjb25uZWN0b3IuanMiLCIuLi8uLi9ub2Rlcy9jb25uZWN0b3Ivc3ByaW5nY29ubmVjdG9yLmpzIiwiLi4vLi4vbm9kZXMvY29ubmVjdG9yL3dhbGxjb25uZWN0b3IuanMiLCIuLi8uLi9ub2Rlcy9jb25uZWN0b3JkaXNwbGF5L2Nvbm5lY3RvcmRpc3BsYXkuanMiLCIuLi8uLi9ub2Rlcy9jb25uZWN0b3JkaXNwbGF5L2Nvbm5lY3RvcmRpc3BsYXllbXB0eS5qcyIsIi4uLy4uL25vZGVzL25vZGUuanMiLCIuLi8uLi9ub2Rlcy9ub2RlY2FudmFzL2NhbnZhc2RlZi5qcyIsIi4uLy4uL25vZGVzL25vZGVjYW52YXMvY2FudmFzaG9sZGVyLmpzIiwiLi4vLi4vbm9kZXMvbm9kZWNhbnZhcy9jYW52YXNob2xkZXJ2aXJ0dWFsLmpzIiwiLi4vLi4vbm9kZXMvbm9kZWNhbnZhcy9tb3VzZXN0YXR1cy5qcyIsIi4uLy4uL25vZGVzL25vZGVjYW52YXMvbm9kZWNhbnZhcy5qcyIsIi4uLy4uL25vZGVzL25vZGVjYW52YXMvbm9kZWNhbnZhc21vdXNlLmpzIiwiLi4vLi4vbm9kZXMvbm9kZWRpc3BsYXkvYXJjZGlzcGxheXNoYXBlLmpzIiwiLi4vLi4vbm9kZXMvbm9kZWRpc3BsYXkvY2lyY2xlZGlzcGxheS5qcyIsIi4uLy4uL25vZGVzL25vZGVkaXNwbGF5L25vZGVkaXNwbGF5LmpzIiwiLi4vLi4vbm9kZXMvbm9kZWRpc3BsYXkvcmVjdGFuZ2xlZGlzcGxheS5qcyIsIi4uLy4uL25vZGVzL25vZGVkaXNwbGF5L3RyaWFuZ2xlZGlzcGxheS5qcyIsIi4uLy4uL25vZGVzL3Bvc2l0aW9uL3Bvc2l0aW9uLmpzIiwiLi4vLi4vbm9kZXMvc2hhcGVzL2JvdW5kaW5nYm94LmpzIiwiLi4vLi4vbm9kZXMvc2hhcGVzL3NoYXBlLmpzIiwiLi4vLi4vcGF0aHMvanVuY3Rpb24uanMiLCIuLi8uLi9wYXRocy9ub2RlZGlzcGxheS9qdW5jdGlvbmNvbm5lY3Rvci5qcyIsIi4uLy4uL3BhdGhzL25vZGVkaXNwbGF5L2p1bmN0aW9uZGlzcGxheS5qcyIsIi4uLy4uL3BhdGhzL3BhdGguanMiLCIuLi8uLi9wYXRocy9wYXRod29ybGQuanMiLCIuLi8uLi9wYXRocy9wYXRod29ybGRkZWYuanMiLCIuLi8uLi9wYXRocy93YWxrZXIuanMiLCIuLi8uLi9wYXRocy93b3JsZHVwZGF0ZS5qcyIsImRlbW9ncmFwaDFjbGllbnRzdGFuZGFsb25lLmpzIiwiZGVtb2dyYXBoMXBhdGh3b3JsZGRlZi5qcyIsInB1c2hkZW1vZ3JhcGgxLmpzIiwiLi4vcGF0aHNlcnZlci9wdXNod29ybGR1cGRhdGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsSEE7OztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDNUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxcURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ2hFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUMzR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDM0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNwTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDcmhCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDNTZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNyTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3RpQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQy9EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUM5RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDckVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ3RTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUN0TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNXRCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ25FQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0tBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5VEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5TUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL2lCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4Y0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCdcblxuZXhwb3J0cy5ieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aFxuZXhwb3J0cy50b0J5dGVBcnJheSA9IHRvQnl0ZUFycmF5XG5leHBvcnRzLmZyb21CeXRlQXJyYXkgPSBmcm9tQnl0ZUFycmF5XG5cbnZhciBsb29rdXAgPSBbXVxudmFyIHJldkxvb2t1cCA9IFtdXG52YXIgQXJyID0gdHlwZW9mIFVpbnQ4QXJyYXkgIT09ICd1bmRlZmluZWQnID8gVWludDhBcnJheSA6IEFycmF5XG5cbnZhciBjb2RlID0gJ0FCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5Ky8nXG5mb3IgKHZhciBpID0gMCwgbGVuID0gY29kZS5sZW5ndGg7IGkgPCBsZW47ICsraSkge1xuICBsb29rdXBbaV0gPSBjb2RlW2ldXG4gIHJldkxvb2t1cFtjb2RlLmNoYXJDb2RlQXQoaSldID0gaVxufVxuXG5yZXZMb29rdXBbJy0nLmNoYXJDb2RlQXQoMCldID0gNjJcbnJldkxvb2t1cFsnXycuY2hhckNvZGVBdCgwKV0gPSA2M1xuXG5mdW5jdGlvbiBwbGFjZUhvbGRlcnNDb3VudCAoYjY0KSB7XG4gIHZhciBsZW4gPSBiNjQubGVuZ3RoXG4gIGlmIChsZW4gJSA0ID4gMCkge1xuICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBzdHJpbmcuIExlbmd0aCBtdXN0IGJlIGEgbXVsdGlwbGUgb2YgNCcpXG4gIH1cblxuICAvLyB0aGUgbnVtYmVyIG9mIGVxdWFsIHNpZ25zIChwbGFjZSBob2xkZXJzKVxuICAvLyBpZiB0aGVyZSBhcmUgdHdvIHBsYWNlaG9sZGVycywgdGhhbiB0aGUgdHdvIGNoYXJhY3RlcnMgYmVmb3JlIGl0XG4gIC8vIHJlcHJlc2VudCBvbmUgYnl0ZVxuICAvLyBpZiB0aGVyZSBpcyBvbmx5IG9uZSwgdGhlbiB0aGUgdGhyZWUgY2hhcmFjdGVycyBiZWZvcmUgaXQgcmVwcmVzZW50IDIgYnl0ZXNcbiAgLy8gdGhpcyBpcyBqdXN0IGEgY2hlYXAgaGFjayB0byBub3QgZG8gaW5kZXhPZiB0d2ljZVxuICByZXR1cm4gYjY0W2xlbiAtIDJdID09PSAnPScgPyAyIDogYjY0W2xlbiAtIDFdID09PSAnPScgPyAxIDogMFxufVxuXG5mdW5jdGlvbiBieXRlTGVuZ3RoIChiNjQpIHtcbiAgLy8gYmFzZTY0IGlzIDQvMyArIHVwIHRvIHR3byBjaGFyYWN0ZXJzIG9mIHRoZSBvcmlnaW5hbCBkYXRhXG4gIHJldHVybiBiNjQubGVuZ3RoICogMyAvIDQgLSBwbGFjZUhvbGRlcnNDb3VudChiNjQpXG59XG5cbmZ1bmN0aW9uIHRvQnl0ZUFycmF5IChiNjQpIHtcbiAgdmFyIGksIGosIGwsIHRtcCwgcGxhY2VIb2xkZXJzLCBhcnJcbiAgdmFyIGxlbiA9IGI2NC5sZW5ndGhcbiAgcGxhY2VIb2xkZXJzID0gcGxhY2VIb2xkZXJzQ291bnQoYjY0KVxuXG4gIGFyciA9IG5ldyBBcnIobGVuICogMyAvIDQgLSBwbGFjZUhvbGRlcnMpXG5cbiAgLy8gaWYgdGhlcmUgYXJlIHBsYWNlaG9sZGVycywgb25seSBnZXQgdXAgdG8gdGhlIGxhc3QgY29tcGxldGUgNCBjaGFyc1xuICBsID0gcGxhY2VIb2xkZXJzID4gMCA/IGxlbiAtIDQgOiBsZW5cblxuICB2YXIgTCA9IDBcblxuICBmb3IgKGkgPSAwLCBqID0gMDsgaSA8IGw7IGkgKz0gNCwgaiArPSAzKSB7XG4gICAgdG1wID0gKHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpKV0gPDwgMTgpIHwgKHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpICsgMSldIDw8IDEyKSB8IChyZXZMb29rdXBbYjY0LmNoYXJDb2RlQXQoaSArIDIpXSA8PCA2KSB8IHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpICsgMyldXG4gICAgYXJyW0wrK10gPSAodG1wID4+IDE2KSAmIDB4RkZcbiAgICBhcnJbTCsrXSA9ICh0bXAgPj4gOCkgJiAweEZGXG4gICAgYXJyW0wrK10gPSB0bXAgJiAweEZGXG4gIH1cblxuICBpZiAocGxhY2VIb2xkZXJzID09PSAyKSB7XG4gICAgdG1wID0gKHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpKV0gPDwgMikgfCAocmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkgKyAxKV0gPj4gNClcbiAgICBhcnJbTCsrXSA9IHRtcCAmIDB4RkZcbiAgfSBlbHNlIGlmIChwbGFjZUhvbGRlcnMgPT09IDEpIHtcbiAgICB0bXAgPSAocmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkpXSA8PCAxMCkgfCAocmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkgKyAxKV0gPDwgNCkgfCAocmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkgKyAyKV0gPj4gMilcbiAgICBhcnJbTCsrXSA9ICh0bXAgPj4gOCkgJiAweEZGXG4gICAgYXJyW0wrK10gPSB0bXAgJiAweEZGXG4gIH1cblxuICByZXR1cm4gYXJyXG59XG5cbmZ1bmN0aW9uIHRyaXBsZXRUb0Jhc2U2NCAobnVtKSB7XG4gIHJldHVybiBsb29rdXBbbnVtID4+IDE4ICYgMHgzRl0gKyBsb29rdXBbbnVtID4+IDEyICYgMHgzRl0gKyBsb29rdXBbbnVtID4+IDYgJiAweDNGXSArIGxvb2t1cFtudW0gJiAweDNGXVxufVxuXG5mdW5jdGlvbiBlbmNvZGVDaHVuayAodWludDgsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIHRtcFxuICB2YXIgb3V0cHV0ID0gW11cbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpICs9IDMpIHtcbiAgICB0bXAgPSAodWludDhbaV0gPDwgMTYpICsgKHVpbnQ4W2kgKyAxXSA8PCA4KSArICh1aW50OFtpICsgMl0pXG4gICAgb3V0cHV0LnB1c2godHJpcGxldFRvQmFzZTY0KHRtcCkpXG4gIH1cbiAgcmV0dXJuIG91dHB1dC5qb2luKCcnKVxufVxuXG5mdW5jdGlvbiBmcm9tQnl0ZUFycmF5ICh1aW50OCkge1xuICB2YXIgdG1wXG4gIHZhciBsZW4gPSB1aW50OC5sZW5ndGhcbiAgdmFyIGV4dHJhQnl0ZXMgPSBsZW4gJSAzIC8vIGlmIHdlIGhhdmUgMSBieXRlIGxlZnQsIHBhZCAyIGJ5dGVzXG4gIHZhciBvdXRwdXQgPSAnJ1xuICB2YXIgcGFydHMgPSBbXVxuICB2YXIgbWF4Q2h1bmtMZW5ndGggPSAxNjM4MyAvLyBtdXN0IGJlIG11bHRpcGxlIG9mIDNcblxuICAvLyBnbyB0aHJvdWdoIHRoZSBhcnJheSBldmVyeSB0aHJlZSBieXRlcywgd2UnbGwgZGVhbCB3aXRoIHRyYWlsaW5nIHN0dWZmIGxhdGVyXG4gIGZvciAodmFyIGkgPSAwLCBsZW4yID0gbGVuIC0gZXh0cmFCeXRlczsgaSA8IGxlbjI7IGkgKz0gbWF4Q2h1bmtMZW5ndGgpIHtcbiAgICBwYXJ0cy5wdXNoKGVuY29kZUNodW5rKHVpbnQ4LCBpLCAoaSArIG1heENodW5rTGVuZ3RoKSA+IGxlbjIgPyBsZW4yIDogKGkgKyBtYXhDaHVua0xlbmd0aCkpKVxuICB9XG5cbiAgLy8gcGFkIHRoZSBlbmQgd2l0aCB6ZXJvcywgYnV0IG1ha2Ugc3VyZSB0byBub3QgZm9yZ2V0IHRoZSBleHRyYSBieXRlc1xuICBpZiAoZXh0cmFCeXRlcyA9PT0gMSkge1xuICAgIHRtcCA9IHVpbnQ4W2xlbiAtIDFdXG4gICAgb3V0cHV0ICs9IGxvb2t1cFt0bXAgPj4gMl1cbiAgICBvdXRwdXQgKz0gbG9va3VwWyh0bXAgPDwgNCkgJiAweDNGXVxuICAgIG91dHB1dCArPSAnPT0nXG4gIH0gZWxzZSBpZiAoZXh0cmFCeXRlcyA9PT0gMikge1xuICAgIHRtcCA9ICh1aW50OFtsZW4gLSAyXSA8PCA4KSArICh1aW50OFtsZW4gLSAxXSlcbiAgICBvdXRwdXQgKz0gbG9va3VwW3RtcCA+PiAxMF1cbiAgICBvdXRwdXQgKz0gbG9va3VwWyh0bXAgPj4gNCkgJiAweDNGXVxuICAgIG91dHB1dCArPSBsb29rdXBbKHRtcCA8PCAyKSAmIDB4M0ZdXG4gICAgb3V0cHV0ICs9ICc9J1xuICB9XG5cbiAgcGFydHMucHVzaChvdXRwdXQpXG5cbiAgcmV0dXJuIHBhcnRzLmpvaW4oJycpXG59XG4iLCIiLCIndXNlIHN0cmljdCc7XG5cbnZhciBidWZmZXIgPSByZXF1aXJlKCdidWZmZXInKTtcbnZhciBCdWZmZXIgPSBidWZmZXIuQnVmZmVyO1xudmFyIFNsb3dCdWZmZXIgPSBidWZmZXIuU2xvd0J1ZmZlcjtcbnZhciBNQVhfTEVOID0gYnVmZmVyLmtNYXhMZW5ndGggfHwgMjE0NzQ4MzY0NztcbmV4cG9ydHMuYWxsb2MgPSBmdW5jdGlvbiBhbGxvYyhzaXplLCBmaWxsLCBlbmNvZGluZykge1xuICBpZiAodHlwZW9mIEJ1ZmZlci5hbGxvYyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiBCdWZmZXIuYWxsb2Moc2l6ZSwgZmlsbCwgZW5jb2RpbmcpO1xuICB9XG4gIGlmICh0eXBlb2YgZW5jb2RpbmcgPT09ICdudW1iZXInKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignZW5jb2RpbmcgbXVzdCBub3QgYmUgbnVtYmVyJyk7XG4gIH1cbiAgaWYgKHR5cGVvZiBzaXplICE9PSAnbnVtYmVyJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ3NpemUgbXVzdCBiZSBhIG51bWJlcicpO1xuICB9XG4gIGlmIChzaXplID4gTUFYX0xFTikge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdzaXplIGlzIHRvbyBsYXJnZScpO1xuICB9XG4gIHZhciBlbmMgPSBlbmNvZGluZztcbiAgdmFyIF9maWxsID0gZmlsbDtcbiAgaWYgKF9maWxsID09PSB1bmRlZmluZWQpIHtcbiAgICBlbmMgPSB1bmRlZmluZWQ7XG4gICAgX2ZpbGwgPSAwO1xuICB9XG4gIHZhciBidWYgPSBuZXcgQnVmZmVyKHNpemUpO1xuICBpZiAodHlwZW9mIF9maWxsID09PSAnc3RyaW5nJykge1xuICAgIHZhciBmaWxsQnVmID0gbmV3IEJ1ZmZlcihfZmlsbCwgZW5jKTtcbiAgICB2YXIgZmxlbiA9IGZpbGxCdWYubGVuZ3RoO1xuICAgIHZhciBpID0gLTE7XG4gICAgd2hpbGUgKCsraSA8IHNpemUpIHtcbiAgICAgIGJ1ZltpXSA9IGZpbGxCdWZbaSAlIGZsZW5dO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBidWYuZmlsbChfZmlsbCk7XG4gIH1cbiAgcmV0dXJuIGJ1Zjtcbn1cbmV4cG9ydHMuYWxsb2NVbnNhZmUgPSBmdW5jdGlvbiBhbGxvY1Vuc2FmZShzaXplKSB7XG4gIGlmICh0eXBlb2YgQnVmZmVyLmFsbG9jVW5zYWZlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgcmV0dXJuIEJ1ZmZlci5hbGxvY1Vuc2FmZShzaXplKTtcbiAgfVxuICBpZiAodHlwZW9mIHNpemUgIT09ICdudW1iZXInKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignc2l6ZSBtdXN0IGJlIGEgbnVtYmVyJyk7XG4gIH1cbiAgaWYgKHNpemUgPiBNQVhfTEVOKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ3NpemUgaXMgdG9vIGxhcmdlJyk7XG4gIH1cbiAgcmV0dXJuIG5ldyBCdWZmZXIoc2l6ZSk7XG59XG5leHBvcnRzLmZyb20gPSBmdW5jdGlvbiBmcm9tKHZhbHVlLCBlbmNvZGluZ09yT2Zmc2V0LCBsZW5ndGgpIHtcbiAgaWYgKHR5cGVvZiBCdWZmZXIuZnJvbSA9PT0gJ2Z1bmN0aW9uJyAmJiAoIWdsb2JhbC5VaW50OEFycmF5IHx8IFVpbnQ4QXJyYXkuZnJvbSAhPT0gQnVmZmVyLmZyb20pKSB7XG4gICAgcmV0dXJuIEJ1ZmZlci5mcm9tKHZhbHVlLCBlbmNvZGluZ09yT2Zmc2V0LCBsZW5ndGgpO1xuICB9XG4gIGlmICh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignXCJ2YWx1ZVwiIGFyZ3VtZW50IG11c3Qgbm90IGJlIGEgbnVtYmVyJyk7XG4gIH1cbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gbmV3IEJ1ZmZlcih2YWx1ZSwgZW5jb2RpbmdPck9mZnNldCk7XG4gIH1cbiAgaWYgKHR5cGVvZiBBcnJheUJ1ZmZlciAhPT0gJ3VuZGVmaW5lZCcgJiYgdmFsdWUgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcikge1xuICAgIHZhciBvZmZzZXQgPSBlbmNvZGluZ09yT2Zmc2V0O1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxKSB7XG4gICAgICByZXR1cm4gbmV3IEJ1ZmZlcih2YWx1ZSk7XG4gICAgfVxuICAgIGlmICh0eXBlb2Ygb2Zmc2V0ID09PSAndW5kZWZpbmVkJykge1xuICAgICAgb2Zmc2V0ID0gMDtcbiAgICB9XG4gICAgdmFyIGxlbiA9IGxlbmd0aDtcbiAgICBpZiAodHlwZW9mIGxlbiA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIGxlbiA9IHZhbHVlLmJ5dGVMZW5ndGggLSBvZmZzZXQ7XG4gICAgfVxuICAgIGlmIChvZmZzZXQgPj0gdmFsdWUuYnl0ZUxlbmd0aCkge1xuICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ1xcJ29mZnNldFxcJyBpcyBvdXQgb2YgYm91bmRzJyk7XG4gICAgfVxuICAgIGlmIChsZW4gPiB2YWx1ZS5ieXRlTGVuZ3RoIC0gb2Zmc2V0KSB7XG4gICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignXFwnbGVuZ3RoXFwnIGlzIG91dCBvZiBib3VuZHMnKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBCdWZmZXIodmFsdWUuc2xpY2Uob2Zmc2V0LCBvZmZzZXQgKyBsZW4pKTtcbiAgfVxuICBpZiAoQnVmZmVyLmlzQnVmZmVyKHZhbHVlKSkge1xuICAgIHZhciBvdXQgPSBuZXcgQnVmZmVyKHZhbHVlLmxlbmd0aCk7XG4gICAgdmFsdWUuY29weShvdXQsIDAsIDAsIHZhbHVlLmxlbmd0aCk7XG4gICAgcmV0dXJuIG91dDtcbiAgfVxuICBpZiAodmFsdWUpIHtcbiAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkgfHwgKHR5cGVvZiBBcnJheUJ1ZmZlciAhPT0gJ3VuZGVmaW5lZCcgJiYgdmFsdWUuYnVmZmVyIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIpIHx8ICdsZW5ndGgnIGluIHZhbHVlKSB7XG4gICAgICByZXR1cm4gbmV3IEJ1ZmZlcih2YWx1ZSk7XG4gICAgfVxuICAgIGlmICh2YWx1ZS50eXBlID09PSAnQnVmZmVyJyAmJiBBcnJheS5pc0FycmF5KHZhbHVlLmRhdGEpKSB7XG4gICAgICByZXR1cm4gbmV3IEJ1ZmZlcih2YWx1ZS5kYXRhKTtcbiAgICB9XG4gIH1cblxuICB0aHJvdyBuZXcgVHlwZUVycm9yKCdGaXJzdCBhcmd1bWVudCBtdXN0IGJlIGEgc3RyaW5nLCBCdWZmZXIsICcgKyAnQXJyYXlCdWZmZXIsIEFycmF5LCBvciBhcnJheS1saWtlIG9iamVjdC4nKTtcbn1cbmV4cG9ydHMuYWxsb2NVbnNhZmVTbG93ID0gZnVuY3Rpb24gYWxsb2NVbnNhZmVTbG93KHNpemUpIHtcbiAgaWYgKHR5cGVvZiBCdWZmZXIuYWxsb2NVbnNhZmVTbG93ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgcmV0dXJuIEJ1ZmZlci5hbGxvY1Vuc2FmZVNsb3coc2l6ZSk7XG4gIH1cbiAgaWYgKHR5cGVvZiBzaXplICE9PSAnbnVtYmVyJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ3NpemUgbXVzdCBiZSBhIG51bWJlcicpO1xuICB9XG4gIGlmIChzaXplID49IE1BWF9MRU4pIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignc2l6ZSBpcyB0b28gbGFyZ2UnKTtcbiAgfVxuICByZXR1cm4gbmV3IFNsb3dCdWZmZXIoc2l6ZSk7XG59XG4iLCIvKiFcbiAqIFRoZSBidWZmZXIgbW9kdWxlIGZyb20gbm9kZS5qcywgZm9yIHRoZSBicm93c2VyLlxuICpcbiAqIEBhdXRob3IgICBGZXJvc3MgQWJvdWtoYWRpamVoIDxmZXJvc3NAZmVyb3NzLm9yZz4gPGh0dHA6Ly9mZXJvc3Mub3JnPlxuICogQGxpY2Vuc2UgIE1JVFxuICovXG4vKiBlc2xpbnQtZGlzYWJsZSBuby1wcm90byAqL1xuXG4ndXNlIHN0cmljdCdcblxudmFyIGJhc2U2NCA9IHJlcXVpcmUoJ2Jhc2U2NC1qcycpXG52YXIgaWVlZTc1NCA9IHJlcXVpcmUoJ2llZWU3NTQnKVxuXG5leHBvcnRzLkJ1ZmZlciA9IEJ1ZmZlclxuZXhwb3J0cy5TbG93QnVmZmVyID0gU2xvd0J1ZmZlclxuZXhwb3J0cy5JTlNQRUNUX01BWF9CWVRFUyA9IDUwXG5cbnZhciBLX01BWF9MRU5HVEggPSAweDdmZmZmZmZmXG5leHBvcnRzLmtNYXhMZW5ndGggPSBLX01BWF9MRU5HVEhcblxuLyoqXG4gKiBJZiBgQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlRgOlxuICogICA9PT0gdHJ1ZSAgICBVc2UgVWludDhBcnJheSBpbXBsZW1lbnRhdGlvbiAoZmFzdGVzdClcbiAqICAgPT09IGZhbHNlICAgUHJpbnQgd2FybmluZyBhbmQgcmVjb21tZW5kIHVzaW5nIGBidWZmZXJgIHY0Lnggd2hpY2ggaGFzIGFuIE9iamVjdFxuICogICAgICAgICAgICAgICBpbXBsZW1lbnRhdGlvbiAobW9zdCBjb21wYXRpYmxlLCBldmVuIElFNilcbiAqXG4gKiBCcm93c2VycyB0aGF0IHN1cHBvcnQgdHlwZWQgYXJyYXlzIGFyZSBJRSAxMCssIEZpcmVmb3ggNCssIENocm9tZSA3KywgU2FmYXJpIDUuMSssXG4gKiBPcGVyYSAxMS42KywgaU9TIDQuMisuXG4gKlxuICogV2UgcmVwb3J0IHRoYXQgdGhlIGJyb3dzZXIgZG9lcyBub3Qgc3VwcG9ydCB0eXBlZCBhcnJheXMgaWYgdGhlIGFyZSBub3Qgc3ViY2xhc3NhYmxlXG4gKiB1c2luZyBfX3Byb3RvX18uIEZpcmVmb3ggNC0yOSBsYWNrcyBzdXBwb3J0IGZvciBhZGRpbmcgbmV3IHByb3BlcnRpZXMgdG8gYFVpbnQ4QXJyYXlgXG4gKiAoU2VlOiBodHRwczovL2J1Z3ppbGxhLm1vemlsbGEub3JnL3Nob3dfYnVnLmNnaT9pZD02OTU0MzgpLiBJRSAxMCBsYWNrcyBzdXBwb3J0XG4gKiBmb3IgX19wcm90b19fIGFuZCBoYXMgYSBidWdneSB0eXBlZCBhcnJheSBpbXBsZW1lbnRhdGlvbi5cbiAqL1xuQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQgPSB0eXBlZEFycmF5U3VwcG9ydCgpXG5cbmlmICghQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQgJiYgdHlwZW9mIGNvbnNvbGUgIT09ICd1bmRlZmluZWQnICYmXG4gICAgdHlwZW9mIGNvbnNvbGUuZXJyb3IgPT09ICdmdW5jdGlvbicpIHtcbiAgY29uc29sZS5lcnJvcihcbiAgICAnVGhpcyBicm93c2VyIGxhY2tzIHR5cGVkIGFycmF5IChVaW50OEFycmF5KSBzdXBwb3J0IHdoaWNoIGlzIHJlcXVpcmVkIGJ5ICcgK1xuICAgICdgYnVmZmVyYCB2NS54LiBVc2UgYGJ1ZmZlcmAgdjQueCBpZiB5b3UgcmVxdWlyZSBvbGQgYnJvd3NlciBzdXBwb3J0LidcbiAgKVxufVxuXG5mdW5jdGlvbiB0eXBlZEFycmF5U3VwcG9ydCAoKSB7XG4gIC8vIENhbiB0eXBlZCBhcnJheSBpbnN0YW5jZXMgY2FuIGJlIGF1Z21lbnRlZD9cbiAgdHJ5IHtcbiAgICB2YXIgYXJyID0gbmV3IFVpbnQ4QXJyYXkoMSlcbiAgICBhcnIuX19wcm90b19fID0ge19fcHJvdG9fXzogVWludDhBcnJheS5wcm90b3R5cGUsIGZvbzogZnVuY3Rpb24gKCkgeyByZXR1cm4gNDIgfX1cbiAgICByZXR1cm4gYXJyLmZvbygpID09PSA0MlxuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbn1cblxuZnVuY3Rpb24gY3JlYXRlQnVmZmVyIChsZW5ndGgpIHtcbiAgaWYgKGxlbmd0aCA+IEtfTUFYX0xFTkdUSCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdJbnZhbGlkIHR5cGVkIGFycmF5IGxlbmd0aCcpXG4gIH1cbiAgLy8gUmV0dXJuIGFuIGF1Z21lbnRlZCBgVWludDhBcnJheWAgaW5zdGFuY2VcbiAgdmFyIGJ1ZiA9IG5ldyBVaW50OEFycmF5KGxlbmd0aClcbiAgYnVmLl9fcHJvdG9fXyA9IEJ1ZmZlci5wcm90b3R5cGVcbiAgcmV0dXJuIGJ1ZlxufVxuXG4vKipcbiAqIFRoZSBCdWZmZXIgY29uc3RydWN0b3IgcmV0dXJucyBpbnN0YW5jZXMgb2YgYFVpbnQ4QXJyYXlgIHRoYXQgaGF2ZSB0aGVpclxuICogcHJvdG90eXBlIGNoYW5nZWQgdG8gYEJ1ZmZlci5wcm90b3R5cGVgLiBGdXJ0aGVybW9yZSwgYEJ1ZmZlcmAgaXMgYSBzdWJjbGFzcyBvZlxuICogYFVpbnQ4QXJyYXlgLCBzbyB0aGUgcmV0dXJuZWQgaW5zdGFuY2VzIHdpbGwgaGF2ZSBhbGwgdGhlIG5vZGUgYEJ1ZmZlcmAgbWV0aG9kc1xuICogYW5kIHRoZSBgVWludDhBcnJheWAgbWV0aG9kcy4gU3F1YXJlIGJyYWNrZXQgbm90YXRpb24gd29ya3MgYXMgZXhwZWN0ZWQgLS0gaXRcbiAqIHJldHVybnMgYSBzaW5nbGUgb2N0ZXQuXG4gKlxuICogVGhlIGBVaW50OEFycmF5YCBwcm90b3R5cGUgcmVtYWlucyB1bm1vZGlmaWVkLlxuICovXG5cbmZ1bmN0aW9uIEJ1ZmZlciAoYXJnLCBlbmNvZGluZ09yT2Zmc2V0LCBsZW5ndGgpIHtcbiAgLy8gQ29tbW9uIGNhc2UuXG4gIGlmICh0eXBlb2YgYXJnID09PSAnbnVtYmVyJykge1xuICAgIGlmICh0eXBlb2YgZW5jb2RpbmdPck9mZnNldCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgJ0lmIGVuY29kaW5nIGlzIHNwZWNpZmllZCB0aGVuIHRoZSBmaXJzdCBhcmd1bWVudCBtdXN0IGJlIGEgc3RyaW5nJ1xuICAgICAgKVxuICAgIH1cbiAgICByZXR1cm4gYWxsb2NVbnNhZmUoYXJnKVxuICB9XG4gIHJldHVybiBmcm9tKGFyZywgZW5jb2RpbmdPck9mZnNldCwgbGVuZ3RoKVxufVxuXG4vLyBGaXggc3ViYXJyYXkoKSBpbiBFUzIwMTYuIFNlZTogaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXIvcHVsbC85N1xuaWYgKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC5zcGVjaWVzICYmXG4gICAgQnVmZmVyW1N5bWJvbC5zcGVjaWVzXSA9PT0gQnVmZmVyKSB7XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShCdWZmZXIsIFN5bWJvbC5zcGVjaWVzLCB7XG4gICAgdmFsdWU6IG51bGwsXG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgIHdyaXRhYmxlOiBmYWxzZVxuICB9KVxufVxuXG5CdWZmZXIucG9vbFNpemUgPSA4MTkyIC8vIG5vdCB1c2VkIGJ5IHRoaXMgaW1wbGVtZW50YXRpb25cblxuZnVuY3Rpb24gZnJvbSAodmFsdWUsIGVuY29kaW5nT3JPZmZzZXQsIGxlbmd0aCkge1xuICBpZiAodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1widmFsdWVcIiBhcmd1bWVudCBtdXN0IG5vdCBiZSBhIG51bWJlcicpXG4gIH1cblxuICBpZiAodmFsdWUgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcikge1xuICAgIHJldHVybiBmcm9tQXJyYXlCdWZmZXIodmFsdWUsIGVuY29kaW5nT3JPZmZzZXQsIGxlbmd0aClcbiAgfVxuXG4gIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIGZyb21TdHJpbmcodmFsdWUsIGVuY29kaW5nT3JPZmZzZXQpXG4gIH1cblxuICByZXR1cm4gZnJvbU9iamVjdCh2YWx1ZSlcbn1cblxuLyoqXG4gKiBGdW5jdGlvbmFsbHkgZXF1aXZhbGVudCB0byBCdWZmZXIoYXJnLCBlbmNvZGluZykgYnV0IHRocm93cyBhIFR5cGVFcnJvclxuICogaWYgdmFsdWUgaXMgYSBudW1iZXIuXG4gKiBCdWZmZXIuZnJvbShzdHJbLCBlbmNvZGluZ10pXG4gKiBCdWZmZXIuZnJvbShhcnJheSlcbiAqIEJ1ZmZlci5mcm9tKGJ1ZmZlcilcbiAqIEJ1ZmZlci5mcm9tKGFycmF5QnVmZmVyWywgYnl0ZU9mZnNldFssIGxlbmd0aF1dKVxuICoqL1xuQnVmZmVyLmZyb20gPSBmdW5jdGlvbiAodmFsdWUsIGVuY29kaW5nT3JPZmZzZXQsIGxlbmd0aCkge1xuICByZXR1cm4gZnJvbSh2YWx1ZSwgZW5jb2RpbmdPck9mZnNldCwgbGVuZ3RoKVxufVxuXG4vLyBOb3RlOiBDaGFuZ2UgcHJvdG90eXBlICphZnRlciogQnVmZmVyLmZyb20gaXMgZGVmaW5lZCB0byB3b3JrYXJvdW5kIENocm9tZSBidWc6XG4vLyBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlci9wdWxsLzE0OFxuQnVmZmVyLnByb3RvdHlwZS5fX3Byb3RvX18gPSBVaW50OEFycmF5LnByb3RvdHlwZVxuQnVmZmVyLl9fcHJvdG9fXyA9IFVpbnQ4QXJyYXlcblxuZnVuY3Rpb24gYXNzZXJ0U2l6ZSAoc2l6ZSkge1xuICBpZiAodHlwZW9mIHNpemUgIT09ICdudW1iZXInKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignXCJzaXplXCIgYXJndW1lbnQgbXVzdCBiZSBhIG51bWJlcicpXG4gIH0gZWxzZSBpZiAoc2l6ZSA8IDApIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignXCJzaXplXCIgYXJndW1lbnQgbXVzdCBub3QgYmUgbmVnYXRpdmUnKVxuICB9XG59XG5cbmZ1bmN0aW9uIGFsbG9jIChzaXplLCBmaWxsLCBlbmNvZGluZykge1xuICBhc3NlcnRTaXplKHNpemUpXG4gIGlmIChzaXplIDw9IDApIHtcbiAgICByZXR1cm4gY3JlYXRlQnVmZmVyKHNpemUpXG4gIH1cbiAgaWYgKGZpbGwgIT09IHVuZGVmaW5lZCkge1xuICAgIC8vIE9ubHkgcGF5IGF0dGVudGlvbiB0byBlbmNvZGluZyBpZiBpdCdzIGEgc3RyaW5nLiBUaGlzXG4gICAgLy8gcHJldmVudHMgYWNjaWRlbnRhbGx5IHNlbmRpbmcgaW4gYSBudW1iZXIgdGhhdCB3b3VsZFxuICAgIC8vIGJlIGludGVycHJldHRlZCBhcyBhIHN0YXJ0IG9mZnNldC5cbiAgICByZXR1cm4gdHlwZW9mIGVuY29kaW5nID09PSAnc3RyaW5nJ1xuICAgICAgPyBjcmVhdGVCdWZmZXIoc2l6ZSkuZmlsbChmaWxsLCBlbmNvZGluZylcbiAgICAgIDogY3JlYXRlQnVmZmVyKHNpemUpLmZpbGwoZmlsbClcbiAgfVxuICByZXR1cm4gY3JlYXRlQnVmZmVyKHNpemUpXG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBmaWxsZWQgQnVmZmVyIGluc3RhbmNlLlxuICogYWxsb2Moc2l6ZVssIGZpbGxbLCBlbmNvZGluZ11dKVxuICoqL1xuQnVmZmVyLmFsbG9jID0gZnVuY3Rpb24gKHNpemUsIGZpbGwsIGVuY29kaW5nKSB7XG4gIHJldHVybiBhbGxvYyhzaXplLCBmaWxsLCBlbmNvZGluZylcbn1cblxuZnVuY3Rpb24gYWxsb2NVbnNhZmUgKHNpemUpIHtcbiAgYXNzZXJ0U2l6ZShzaXplKVxuICByZXR1cm4gY3JlYXRlQnVmZmVyKHNpemUgPCAwID8gMCA6IGNoZWNrZWQoc2l6ZSkgfCAwKVxufVxuXG4vKipcbiAqIEVxdWl2YWxlbnQgdG8gQnVmZmVyKG51bSksIGJ5IGRlZmF1bHQgY3JlYXRlcyBhIG5vbi16ZXJvLWZpbGxlZCBCdWZmZXIgaW5zdGFuY2UuXG4gKiAqL1xuQnVmZmVyLmFsbG9jVW5zYWZlID0gZnVuY3Rpb24gKHNpemUpIHtcbiAgcmV0dXJuIGFsbG9jVW5zYWZlKHNpemUpXG59XG4vKipcbiAqIEVxdWl2YWxlbnQgdG8gU2xvd0J1ZmZlcihudW0pLCBieSBkZWZhdWx0IGNyZWF0ZXMgYSBub24temVyby1maWxsZWQgQnVmZmVyIGluc3RhbmNlLlxuICovXG5CdWZmZXIuYWxsb2NVbnNhZmVTbG93ID0gZnVuY3Rpb24gKHNpemUpIHtcbiAgcmV0dXJuIGFsbG9jVW5zYWZlKHNpemUpXG59XG5cbmZ1bmN0aW9uIGZyb21TdHJpbmcgKHN0cmluZywgZW5jb2RpbmcpIHtcbiAgaWYgKHR5cGVvZiBlbmNvZGluZyAhPT0gJ3N0cmluZycgfHwgZW5jb2RpbmcgPT09ICcnKSB7XG4gICAgZW5jb2RpbmcgPSAndXRmOCdcbiAgfVxuXG4gIGlmICghQnVmZmVyLmlzRW5jb2RpbmcoZW5jb2RpbmcpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignXCJlbmNvZGluZ1wiIG11c3QgYmUgYSB2YWxpZCBzdHJpbmcgZW5jb2RpbmcnKVxuICB9XG5cbiAgdmFyIGxlbmd0aCA9IGJ5dGVMZW5ndGgoc3RyaW5nLCBlbmNvZGluZykgfCAwXG4gIHZhciBidWYgPSBjcmVhdGVCdWZmZXIobGVuZ3RoKVxuXG4gIHZhciBhY3R1YWwgPSBidWYud3JpdGUoc3RyaW5nLCBlbmNvZGluZylcblxuICBpZiAoYWN0dWFsICE9PSBsZW5ndGgpIHtcbiAgICAvLyBXcml0aW5nIGEgaGV4IHN0cmluZywgZm9yIGV4YW1wbGUsIHRoYXQgY29udGFpbnMgaW52YWxpZCBjaGFyYWN0ZXJzIHdpbGxcbiAgICAvLyBjYXVzZSBldmVyeXRoaW5nIGFmdGVyIHRoZSBmaXJzdCBpbnZhbGlkIGNoYXJhY3RlciB0byBiZSBpZ25vcmVkLiAoZS5nLlxuICAgIC8vICdhYnh4Y2QnIHdpbGwgYmUgdHJlYXRlZCBhcyAnYWInKVxuICAgIGJ1ZiA9IGJ1Zi5zbGljZSgwLCBhY3R1YWwpXG4gIH1cblxuICByZXR1cm4gYnVmXG59XG5cbmZ1bmN0aW9uIGZyb21BcnJheUxpa2UgKGFycmF5KSB7XG4gIHZhciBsZW5ndGggPSBhcnJheS5sZW5ndGggPCAwID8gMCA6IGNoZWNrZWQoYXJyYXkubGVuZ3RoKSB8IDBcbiAgdmFyIGJ1ZiA9IGNyZWF0ZUJ1ZmZlcihsZW5ndGgpXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpICs9IDEpIHtcbiAgICBidWZbaV0gPSBhcnJheVtpXSAmIDI1NVxuICB9XG4gIHJldHVybiBidWZcbn1cblxuZnVuY3Rpb24gZnJvbUFycmF5QnVmZmVyIChhcnJheSwgYnl0ZU9mZnNldCwgbGVuZ3RoKSB7XG4gIGlmIChieXRlT2Zmc2V0IDwgMCB8fCBhcnJheS5ieXRlTGVuZ3RoIDwgYnl0ZU9mZnNldCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdcXCdvZmZzZXRcXCcgaXMgb3V0IG9mIGJvdW5kcycpXG4gIH1cblxuICBpZiAoYXJyYXkuYnl0ZUxlbmd0aCA8IGJ5dGVPZmZzZXQgKyAobGVuZ3RoIHx8IDApKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ1xcJ2xlbmd0aFxcJyBpcyBvdXQgb2YgYm91bmRzJylcbiAgfVxuXG4gIHZhciBidWZcbiAgaWYgKGJ5dGVPZmZzZXQgPT09IHVuZGVmaW5lZCAmJiBsZW5ndGggPT09IHVuZGVmaW5lZCkge1xuICAgIGJ1ZiA9IG5ldyBVaW50OEFycmF5KGFycmF5KVxuICB9IGVsc2UgaWYgKGxlbmd0aCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgYnVmID0gbmV3IFVpbnQ4QXJyYXkoYXJyYXksIGJ5dGVPZmZzZXQpXG4gIH0gZWxzZSB7XG4gICAgYnVmID0gbmV3IFVpbnQ4QXJyYXkoYXJyYXksIGJ5dGVPZmZzZXQsIGxlbmd0aClcbiAgfVxuXG4gIC8vIFJldHVybiBhbiBhdWdtZW50ZWQgYFVpbnQ4QXJyYXlgIGluc3RhbmNlXG4gIGJ1Zi5fX3Byb3RvX18gPSBCdWZmZXIucHJvdG90eXBlXG4gIHJldHVybiBidWZcbn1cblxuZnVuY3Rpb24gZnJvbU9iamVjdCAob2JqKSB7XG4gIGlmIChCdWZmZXIuaXNCdWZmZXIob2JqKSkge1xuICAgIHZhciBsZW4gPSBjaGVja2VkKG9iai5sZW5ndGgpIHwgMFxuICAgIHZhciBidWYgPSBjcmVhdGVCdWZmZXIobGVuKVxuXG4gICAgaWYgKGJ1Zi5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBidWZcbiAgICB9XG5cbiAgICBvYmouY29weShidWYsIDAsIDAsIGxlbilcbiAgICByZXR1cm4gYnVmXG4gIH1cblxuICBpZiAob2JqKSB7XG4gICAgaWYgKEFycmF5QnVmZmVyLmlzVmlldyhvYmopIHx8ICdsZW5ndGgnIGluIG9iaikge1xuICAgICAgaWYgKHR5cGVvZiBvYmoubGVuZ3RoICE9PSAnbnVtYmVyJyB8fCBpc25hbihvYmoubGVuZ3RoKSkge1xuICAgICAgICByZXR1cm4gY3JlYXRlQnVmZmVyKDApXG4gICAgICB9XG4gICAgICByZXR1cm4gZnJvbUFycmF5TGlrZShvYmopXG4gICAgfVxuXG4gICAgaWYgKG9iai50eXBlID09PSAnQnVmZmVyJyAmJiBBcnJheS5pc0FycmF5KG9iai5kYXRhKSkge1xuICAgICAgcmV0dXJuIGZyb21BcnJheUxpa2Uob2JqLmRhdGEpXG4gICAgfVxuICB9XG5cbiAgdGhyb3cgbmV3IFR5cGVFcnJvcignRmlyc3QgYXJndW1lbnQgbXVzdCBiZSBhIHN0cmluZywgQnVmZmVyLCBBcnJheUJ1ZmZlciwgQXJyYXksIG9yIGFycmF5LWxpa2Ugb2JqZWN0LicpXG59XG5cbmZ1bmN0aW9uIGNoZWNrZWQgKGxlbmd0aCkge1xuICAvLyBOb3RlOiBjYW5ub3QgdXNlIGBsZW5ndGggPCBLX01BWF9MRU5HVEhgIGhlcmUgYmVjYXVzZSB0aGF0IGZhaWxzIHdoZW5cbiAgLy8gbGVuZ3RoIGlzIE5hTiAod2hpY2ggaXMgb3RoZXJ3aXNlIGNvZXJjZWQgdG8gemVyby4pXG4gIGlmIChsZW5ndGggPj0gS19NQVhfTEVOR1RIKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0F0dGVtcHQgdG8gYWxsb2NhdGUgQnVmZmVyIGxhcmdlciB0aGFuIG1heGltdW0gJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgJ3NpemU6IDB4JyArIEtfTUFYX0xFTkdUSC50b1N0cmluZygxNikgKyAnIGJ5dGVzJylcbiAgfVxuICByZXR1cm4gbGVuZ3RoIHwgMFxufVxuXG5mdW5jdGlvbiBTbG93QnVmZmVyIChsZW5ndGgpIHtcbiAgaWYgKCtsZW5ndGggIT0gbGVuZ3RoKSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgZXFlcWVxXG4gICAgbGVuZ3RoID0gMFxuICB9XG4gIHJldHVybiBCdWZmZXIuYWxsb2MoK2xlbmd0aClcbn1cblxuQnVmZmVyLmlzQnVmZmVyID0gZnVuY3Rpb24gaXNCdWZmZXIgKGIpIHtcbiAgcmV0dXJuIGIgIT0gbnVsbCAmJiBiLl9pc0J1ZmZlciA9PT0gdHJ1ZVxufVxuXG5CdWZmZXIuY29tcGFyZSA9IGZ1bmN0aW9uIGNvbXBhcmUgKGEsIGIpIHtcbiAgaWYgKCFCdWZmZXIuaXNCdWZmZXIoYSkgfHwgIUJ1ZmZlci5pc0J1ZmZlcihiKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0FyZ3VtZW50cyBtdXN0IGJlIEJ1ZmZlcnMnKVxuICB9XG5cbiAgaWYgKGEgPT09IGIpIHJldHVybiAwXG5cbiAgdmFyIHggPSBhLmxlbmd0aFxuICB2YXIgeSA9IGIubGVuZ3RoXG5cbiAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IE1hdGgubWluKHgsIHkpOyBpIDwgbGVuOyArK2kpIHtcbiAgICBpZiAoYVtpXSAhPT0gYltpXSkge1xuICAgICAgeCA9IGFbaV1cbiAgICAgIHkgPSBiW2ldXG4gICAgICBicmVha1xuICAgIH1cbiAgfVxuXG4gIGlmICh4IDwgeSkgcmV0dXJuIC0xXG4gIGlmICh5IDwgeCkgcmV0dXJuIDFcbiAgcmV0dXJuIDBcbn1cblxuQnVmZmVyLmlzRW5jb2RpbmcgPSBmdW5jdGlvbiBpc0VuY29kaW5nIChlbmNvZGluZykge1xuICBzd2l0Y2ggKFN0cmluZyhlbmNvZGluZykudG9Mb3dlckNhc2UoKSkge1xuICAgIGNhc2UgJ2hleCc6XG4gICAgY2FzZSAndXRmOCc6XG4gICAgY2FzZSAndXRmLTgnOlxuICAgIGNhc2UgJ2FzY2lpJzpcbiAgICBjYXNlICdsYXRpbjEnOlxuICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgY2FzZSAnYmFzZTY0JzpcbiAgICBjYXNlICd1Y3MyJzpcbiAgICBjYXNlICd1Y3MtMic6XG4gICAgY2FzZSAndXRmMTZsZSc6XG4gICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgcmV0dXJuIHRydWVcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIGZhbHNlXG4gIH1cbn1cblxuQnVmZmVyLmNvbmNhdCA9IGZ1bmN0aW9uIGNvbmNhdCAobGlzdCwgbGVuZ3RoKSB7XG4gIGlmICghQXJyYXkuaXNBcnJheShsaXN0KSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1wibGlzdFwiIGFyZ3VtZW50IG11c3QgYmUgYW4gQXJyYXkgb2YgQnVmZmVycycpXG4gIH1cblxuICBpZiAobGlzdC5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gQnVmZmVyLmFsbG9jKDApXG4gIH1cblxuICB2YXIgaVxuICBpZiAobGVuZ3RoID09PSB1bmRlZmluZWQpIHtcbiAgICBsZW5ndGggPSAwXG4gICAgZm9yIChpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyArK2kpIHtcbiAgICAgIGxlbmd0aCArPSBsaXN0W2ldLmxlbmd0aFxuICAgIH1cbiAgfVxuXG4gIHZhciBidWZmZXIgPSBCdWZmZXIuYWxsb2NVbnNhZmUobGVuZ3RoKVxuICB2YXIgcG9zID0gMFxuICBmb3IgKGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7ICsraSkge1xuICAgIHZhciBidWYgPSBsaXN0W2ldXG4gICAgaWYgKCFCdWZmZXIuaXNCdWZmZXIoYnVmKSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignXCJsaXN0XCIgYXJndW1lbnQgbXVzdCBiZSBhbiBBcnJheSBvZiBCdWZmZXJzJylcbiAgICB9XG4gICAgYnVmLmNvcHkoYnVmZmVyLCBwb3MpXG4gICAgcG9zICs9IGJ1Zi5sZW5ndGhcbiAgfVxuICByZXR1cm4gYnVmZmVyXG59XG5cbmZ1bmN0aW9uIGJ5dGVMZW5ndGggKHN0cmluZywgZW5jb2RpbmcpIHtcbiAgaWYgKEJ1ZmZlci5pc0J1ZmZlcihzdHJpbmcpKSB7XG4gICAgcmV0dXJuIHN0cmluZy5sZW5ndGhcbiAgfVxuICBpZiAoQXJyYXlCdWZmZXIuaXNWaWV3KHN0cmluZykgfHwgc3RyaW5nIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIpIHtcbiAgICByZXR1cm4gc3RyaW5nLmJ5dGVMZW5ndGhcbiAgfVxuICBpZiAodHlwZW9mIHN0cmluZyAhPT0gJ3N0cmluZycpIHtcbiAgICBzdHJpbmcgPSAnJyArIHN0cmluZ1xuICB9XG5cbiAgdmFyIGxlbiA9IHN0cmluZy5sZW5ndGhcbiAgaWYgKGxlbiA9PT0gMCkgcmV0dXJuIDBcblxuICAvLyBVc2UgYSBmb3IgbG9vcCB0byBhdm9pZCByZWN1cnNpb25cbiAgdmFyIGxvd2VyZWRDYXNlID0gZmFsc2VcbiAgZm9yICg7Oykge1xuICAgIHN3aXRjaCAoZW5jb2RpbmcpIHtcbiAgICAgIGNhc2UgJ2FzY2lpJzpcbiAgICAgIGNhc2UgJ2xhdGluMSc6XG4gICAgICBjYXNlICdiaW5hcnknOlxuICAgICAgICByZXR1cm4gbGVuXG4gICAgICBjYXNlICd1dGY4JzpcbiAgICAgIGNhc2UgJ3V0Zi04JzpcbiAgICAgIGNhc2UgdW5kZWZpbmVkOlxuICAgICAgICByZXR1cm4gdXRmOFRvQnl0ZXMoc3RyaW5nKS5sZW5ndGhcbiAgICAgIGNhc2UgJ3VjczInOlxuICAgICAgY2FzZSAndWNzLTInOlxuICAgICAgY2FzZSAndXRmMTZsZSc6XG4gICAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICAgIHJldHVybiBsZW4gKiAyXG4gICAgICBjYXNlICdoZXgnOlxuICAgICAgICByZXR1cm4gbGVuID4+PiAxXG4gICAgICBjYXNlICdiYXNlNjQnOlxuICAgICAgICByZXR1cm4gYmFzZTY0VG9CeXRlcyhzdHJpbmcpLmxlbmd0aFxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgaWYgKGxvd2VyZWRDYXNlKSByZXR1cm4gdXRmOFRvQnl0ZXMoc3RyaW5nKS5sZW5ndGggLy8gYXNzdW1lIHV0ZjhcbiAgICAgICAgZW5jb2RpbmcgPSAoJycgKyBlbmNvZGluZykudG9Mb3dlckNhc2UoKVxuICAgICAgICBsb3dlcmVkQ2FzZSA9IHRydWVcbiAgICB9XG4gIH1cbn1cbkJ1ZmZlci5ieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aFxuXG5mdW5jdGlvbiBzbG93VG9TdHJpbmcgKGVuY29kaW5nLCBzdGFydCwgZW5kKSB7XG4gIHZhciBsb3dlcmVkQ2FzZSA9IGZhbHNlXG5cbiAgLy8gTm8gbmVlZCB0byB2ZXJpZnkgdGhhdCBcInRoaXMubGVuZ3RoIDw9IE1BWF9VSU5UMzJcIiBzaW5jZSBpdCdzIGEgcmVhZC1vbmx5XG4gIC8vIHByb3BlcnR5IG9mIGEgdHlwZWQgYXJyYXkuXG5cbiAgLy8gVGhpcyBiZWhhdmVzIG5laXRoZXIgbGlrZSBTdHJpbmcgbm9yIFVpbnQ4QXJyYXkgaW4gdGhhdCB3ZSBzZXQgc3RhcnQvZW5kXG4gIC8vIHRvIHRoZWlyIHVwcGVyL2xvd2VyIGJvdW5kcyBpZiB0aGUgdmFsdWUgcGFzc2VkIGlzIG91dCBvZiByYW5nZS5cbiAgLy8gdW5kZWZpbmVkIGlzIGhhbmRsZWQgc3BlY2lhbGx5IGFzIHBlciBFQ01BLTI2MiA2dGggRWRpdGlvbixcbiAgLy8gU2VjdGlvbiAxMy4zLjMuNyBSdW50aW1lIFNlbWFudGljczogS2V5ZWRCaW5kaW5nSW5pdGlhbGl6YXRpb24uXG4gIGlmIChzdGFydCA9PT0gdW5kZWZpbmVkIHx8IHN0YXJ0IDwgMCkge1xuICAgIHN0YXJ0ID0gMFxuICB9XG4gIC8vIFJldHVybiBlYXJseSBpZiBzdGFydCA+IHRoaXMubGVuZ3RoLiBEb25lIGhlcmUgdG8gcHJldmVudCBwb3RlbnRpYWwgdWludDMyXG4gIC8vIGNvZXJjaW9uIGZhaWwgYmVsb3cuXG4gIGlmIChzdGFydCA+IHRoaXMubGVuZ3RoKSB7XG4gICAgcmV0dXJuICcnXG4gIH1cblxuICBpZiAoZW5kID09PSB1bmRlZmluZWQgfHwgZW5kID4gdGhpcy5sZW5ndGgpIHtcbiAgICBlbmQgPSB0aGlzLmxlbmd0aFxuICB9XG5cbiAgaWYgKGVuZCA8PSAwKSB7XG4gICAgcmV0dXJuICcnXG4gIH1cblxuICAvLyBGb3JjZSBjb2Vyc2lvbiB0byB1aW50MzIuIFRoaXMgd2lsbCBhbHNvIGNvZXJjZSBmYWxzZXkvTmFOIHZhbHVlcyB0byAwLlxuICBlbmQgPj4+PSAwXG4gIHN0YXJ0ID4+Pj0gMFxuXG4gIGlmIChlbmQgPD0gc3RhcnQpIHtcbiAgICByZXR1cm4gJydcbiAgfVxuXG4gIGlmICghZW5jb2RpbmcpIGVuY29kaW5nID0gJ3V0ZjgnXG5cbiAgd2hpbGUgKHRydWUpIHtcbiAgICBzd2l0Y2ggKGVuY29kaW5nKSB7XG4gICAgICBjYXNlICdoZXgnOlxuICAgICAgICByZXR1cm4gaGV4U2xpY2UodGhpcywgc3RhcnQsIGVuZClcblxuICAgICAgY2FzZSAndXRmOCc6XG4gICAgICBjYXNlICd1dGYtOCc6XG4gICAgICAgIHJldHVybiB1dGY4U2xpY2UodGhpcywgc3RhcnQsIGVuZClcblxuICAgICAgY2FzZSAnYXNjaWknOlxuICAgICAgICByZXR1cm4gYXNjaWlTbGljZSh0aGlzLCBzdGFydCwgZW5kKVxuXG4gICAgICBjYXNlICdsYXRpbjEnOlxuICAgICAgY2FzZSAnYmluYXJ5JzpcbiAgICAgICAgcmV0dXJuIGxhdGluMVNsaWNlKHRoaXMsIHN0YXJ0LCBlbmQpXG5cbiAgICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgICAgIHJldHVybiBiYXNlNjRTbGljZSh0aGlzLCBzdGFydCwgZW5kKVxuXG4gICAgICBjYXNlICd1Y3MyJzpcbiAgICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgICByZXR1cm4gdXRmMTZsZVNsaWNlKHRoaXMsIHN0YXJ0LCBlbmQpXG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGlmIChsb3dlcmVkQ2FzZSkgdGhyb3cgbmV3IFR5cGVFcnJvcignVW5rbm93biBlbmNvZGluZzogJyArIGVuY29kaW5nKVxuICAgICAgICBlbmNvZGluZyA9IChlbmNvZGluZyArICcnKS50b0xvd2VyQ2FzZSgpXG4gICAgICAgIGxvd2VyZWRDYXNlID0gdHJ1ZVxuICAgIH1cbiAgfVxufVxuXG4vLyBUaGlzIHByb3BlcnR5IGlzIHVzZWQgYnkgYEJ1ZmZlci5pc0J1ZmZlcmAgKGFuZCB0aGUgYGlzLWJ1ZmZlcmAgbnBtIHBhY2thZ2UpXG4vLyB0byBkZXRlY3QgYSBCdWZmZXIgaW5zdGFuY2UuIEl0J3Mgbm90IHBvc3NpYmxlIHRvIHVzZSBgaW5zdGFuY2VvZiBCdWZmZXJgXG4vLyByZWxpYWJseSBpbiBhIGJyb3dzZXJpZnkgY29udGV4dCBiZWNhdXNlIHRoZXJlIGNvdWxkIGJlIG11bHRpcGxlIGRpZmZlcmVudFxuLy8gY29waWVzIG9mIHRoZSAnYnVmZmVyJyBwYWNrYWdlIGluIHVzZS4gVGhpcyBtZXRob2Qgd29ya3MgZXZlbiBmb3IgQnVmZmVyXG4vLyBpbnN0YW5jZXMgdGhhdCB3ZXJlIGNyZWF0ZWQgZnJvbSBhbm90aGVyIGNvcHkgb2YgdGhlIGBidWZmZXJgIHBhY2thZ2UuXG4vLyBTZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyL2lzc3Vlcy8xNTRcbkJ1ZmZlci5wcm90b3R5cGUuX2lzQnVmZmVyID0gdHJ1ZVxuXG5mdW5jdGlvbiBzd2FwIChiLCBuLCBtKSB7XG4gIHZhciBpID0gYltuXVxuICBiW25dID0gYlttXVxuICBiW21dID0gaVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnN3YXAxNiA9IGZ1bmN0aW9uIHN3YXAxNiAoKSB7XG4gIHZhciBsZW4gPSB0aGlzLmxlbmd0aFxuICBpZiAobGVuICUgMiAhPT0gMCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdCdWZmZXIgc2l6ZSBtdXN0IGJlIGEgbXVsdGlwbGUgb2YgMTYtYml0cycpXG4gIH1cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkgKz0gMikge1xuICAgIHN3YXAodGhpcywgaSwgaSArIDEpXG4gIH1cbiAgcmV0dXJuIHRoaXNcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5zd2FwMzIgPSBmdW5jdGlvbiBzd2FwMzIgKCkge1xuICB2YXIgbGVuID0gdGhpcy5sZW5ndGhcbiAgaWYgKGxlbiAlIDQgIT09IDApIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignQnVmZmVyIHNpemUgbXVzdCBiZSBhIG11bHRpcGxlIG9mIDMyLWJpdHMnKVxuICB9XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpICs9IDQpIHtcbiAgICBzd2FwKHRoaXMsIGksIGkgKyAzKVxuICAgIHN3YXAodGhpcywgaSArIDEsIGkgKyAyKVxuICB9XG4gIHJldHVybiB0aGlzXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuc3dhcDY0ID0gZnVuY3Rpb24gc3dhcDY0ICgpIHtcbiAgdmFyIGxlbiA9IHRoaXMubGVuZ3RoXG4gIGlmIChsZW4gJSA4ICE9PSAwKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0J1ZmZlciBzaXplIG11c3QgYmUgYSBtdWx0aXBsZSBvZiA2NC1iaXRzJylcbiAgfVxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSArPSA4KSB7XG4gICAgc3dhcCh0aGlzLCBpLCBpICsgNylcbiAgICBzd2FwKHRoaXMsIGkgKyAxLCBpICsgNilcbiAgICBzd2FwKHRoaXMsIGkgKyAyLCBpICsgNSlcbiAgICBzd2FwKHRoaXMsIGkgKyAzLCBpICsgNClcbiAgfVxuICByZXR1cm4gdGhpc1xufVxuXG5CdWZmZXIucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gdG9TdHJpbmcgKCkge1xuICB2YXIgbGVuZ3RoID0gdGhpcy5sZW5ndGhcbiAgaWYgKGxlbmd0aCA9PT0gMCkgcmV0dXJuICcnXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSByZXR1cm4gdXRmOFNsaWNlKHRoaXMsIDAsIGxlbmd0aClcbiAgcmV0dXJuIHNsb3dUb1N0cmluZy5hcHBseSh0aGlzLCBhcmd1bWVudHMpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuZXF1YWxzID0gZnVuY3Rpb24gZXF1YWxzIChiKSB7XG4gIGlmICghQnVmZmVyLmlzQnVmZmVyKGIpKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdBcmd1bWVudCBtdXN0IGJlIGEgQnVmZmVyJylcbiAgaWYgKHRoaXMgPT09IGIpIHJldHVybiB0cnVlXG4gIHJldHVybiBCdWZmZXIuY29tcGFyZSh0aGlzLCBiKSA9PT0gMFxufVxuXG5CdWZmZXIucHJvdG90eXBlLmluc3BlY3QgPSBmdW5jdGlvbiBpbnNwZWN0ICgpIHtcbiAgdmFyIHN0ciA9ICcnXG4gIHZhciBtYXggPSBleHBvcnRzLklOU1BFQ1RfTUFYX0JZVEVTXG4gIGlmICh0aGlzLmxlbmd0aCA+IDApIHtcbiAgICBzdHIgPSB0aGlzLnRvU3RyaW5nKCdoZXgnLCAwLCBtYXgpLm1hdGNoKC8uezJ9L2cpLmpvaW4oJyAnKVxuICAgIGlmICh0aGlzLmxlbmd0aCA+IG1heCkgc3RyICs9ICcgLi4uICdcbiAgfVxuICByZXR1cm4gJzxCdWZmZXIgJyArIHN0ciArICc+J1xufVxuXG5CdWZmZXIucHJvdG90eXBlLmNvbXBhcmUgPSBmdW5jdGlvbiBjb21wYXJlICh0YXJnZXQsIHN0YXJ0LCBlbmQsIHRoaXNTdGFydCwgdGhpc0VuZCkge1xuICBpZiAoIUJ1ZmZlci5pc0J1ZmZlcih0YXJnZXQpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQXJndW1lbnQgbXVzdCBiZSBhIEJ1ZmZlcicpXG4gIH1cblxuICBpZiAoc3RhcnQgPT09IHVuZGVmaW5lZCkge1xuICAgIHN0YXJ0ID0gMFxuICB9XG4gIGlmIChlbmQgPT09IHVuZGVmaW5lZCkge1xuICAgIGVuZCA9IHRhcmdldCA/IHRhcmdldC5sZW5ndGggOiAwXG4gIH1cbiAgaWYgKHRoaXNTdGFydCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdGhpc1N0YXJ0ID0gMFxuICB9XG4gIGlmICh0aGlzRW5kID09PSB1bmRlZmluZWQpIHtcbiAgICB0aGlzRW5kID0gdGhpcy5sZW5ndGhcbiAgfVxuXG4gIGlmIChzdGFydCA8IDAgfHwgZW5kID4gdGFyZ2V0Lmxlbmd0aCB8fCB0aGlzU3RhcnQgPCAwIHx8IHRoaXNFbmQgPiB0aGlzLmxlbmd0aCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdvdXQgb2YgcmFuZ2UgaW5kZXgnKVxuICB9XG5cbiAgaWYgKHRoaXNTdGFydCA+PSB0aGlzRW5kICYmIHN0YXJ0ID49IGVuZCkge1xuICAgIHJldHVybiAwXG4gIH1cbiAgaWYgKHRoaXNTdGFydCA+PSB0aGlzRW5kKSB7XG4gICAgcmV0dXJuIC0xXG4gIH1cbiAgaWYgKHN0YXJ0ID49IGVuZCkge1xuICAgIHJldHVybiAxXG4gIH1cblxuICBzdGFydCA+Pj49IDBcbiAgZW5kID4+Pj0gMFxuICB0aGlzU3RhcnQgPj4+PSAwXG4gIHRoaXNFbmQgPj4+PSAwXG5cbiAgaWYgKHRoaXMgPT09IHRhcmdldCkgcmV0dXJuIDBcblxuICB2YXIgeCA9IHRoaXNFbmQgLSB0aGlzU3RhcnRcbiAgdmFyIHkgPSBlbmQgLSBzdGFydFxuICB2YXIgbGVuID0gTWF0aC5taW4oeCwgeSlcblxuICB2YXIgdGhpc0NvcHkgPSB0aGlzLnNsaWNlKHRoaXNTdGFydCwgdGhpc0VuZClcbiAgdmFyIHRhcmdldENvcHkgPSB0YXJnZXQuc2xpY2Uoc3RhcnQsIGVuZClcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgKytpKSB7XG4gICAgaWYgKHRoaXNDb3B5W2ldICE9PSB0YXJnZXRDb3B5W2ldKSB7XG4gICAgICB4ID0gdGhpc0NvcHlbaV1cbiAgICAgIHkgPSB0YXJnZXRDb3B5W2ldXG4gICAgICBicmVha1xuICAgIH1cbiAgfVxuXG4gIGlmICh4IDwgeSkgcmV0dXJuIC0xXG4gIGlmICh5IDwgeCkgcmV0dXJuIDFcbiAgcmV0dXJuIDBcbn1cblxuLy8gRmluZHMgZWl0aGVyIHRoZSBmaXJzdCBpbmRleCBvZiBgdmFsYCBpbiBgYnVmZmVyYCBhdCBvZmZzZXQgPj0gYGJ5dGVPZmZzZXRgLFxuLy8gT1IgdGhlIGxhc3QgaW5kZXggb2YgYHZhbGAgaW4gYGJ1ZmZlcmAgYXQgb2Zmc2V0IDw9IGBieXRlT2Zmc2V0YC5cbi8vXG4vLyBBcmd1bWVudHM6XG4vLyAtIGJ1ZmZlciAtIGEgQnVmZmVyIHRvIHNlYXJjaFxuLy8gLSB2YWwgLSBhIHN0cmluZywgQnVmZmVyLCBvciBudW1iZXJcbi8vIC0gYnl0ZU9mZnNldCAtIGFuIGluZGV4IGludG8gYGJ1ZmZlcmA7IHdpbGwgYmUgY2xhbXBlZCB0byBhbiBpbnQzMlxuLy8gLSBlbmNvZGluZyAtIGFuIG9wdGlvbmFsIGVuY29kaW5nLCByZWxldmFudCBpcyB2YWwgaXMgYSBzdHJpbmdcbi8vIC0gZGlyIC0gdHJ1ZSBmb3IgaW5kZXhPZiwgZmFsc2UgZm9yIGxhc3RJbmRleE9mXG5mdW5jdGlvbiBiaWRpcmVjdGlvbmFsSW5kZXhPZiAoYnVmZmVyLCB2YWwsIGJ5dGVPZmZzZXQsIGVuY29kaW5nLCBkaXIpIHtcbiAgLy8gRW1wdHkgYnVmZmVyIG1lYW5zIG5vIG1hdGNoXG4gIGlmIChidWZmZXIubGVuZ3RoID09PSAwKSByZXR1cm4gLTFcblxuICAvLyBOb3JtYWxpemUgYnl0ZU9mZnNldFxuICBpZiAodHlwZW9mIGJ5dGVPZmZzZXQgPT09ICdzdHJpbmcnKSB7XG4gICAgZW5jb2RpbmcgPSBieXRlT2Zmc2V0XG4gICAgYnl0ZU9mZnNldCA9IDBcbiAgfSBlbHNlIGlmIChieXRlT2Zmc2V0ID4gMHg3ZmZmZmZmZikge1xuICAgIGJ5dGVPZmZzZXQgPSAweDdmZmZmZmZmXG4gIH0gZWxzZSBpZiAoYnl0ZU9mZnNldCA8IC0weDgwMDAwMDAwKSB7XG4gICAgYnl0ZU9mZnNldCA9IC0weDgwMDAwMDAwXG4gIH1cbiAgYnl0ZU9mZnNldCA9ICtieXRlT2Zmc2V0ICAvLyBDb2VyY2UgdG8gTnVtYmVyLlxuICBpZiAoaXNOYU4oYnl0ZU9mZnNldCkpIHtcbiAgICAvLyBieXRlT2Zmc2V0OiBpdCBpdCdzIHVuZGVmaW5lZCwgbnVsbCwgTmFOLCBcImZvb1wiLCBldGMsIHNlYXJjaCB3aG9sZSBidWZmZXJcbiAgICBieXRlT2Zmc2V0ID0gZGlyID8gMCA6IChidWZmZXIubGVuZ3RoIC0gMSlcbiAgfVxuXG4gIC8vIE5vcm1hbGl6ZSBieXRlT2Zmc2V0OiBuZWdhdGl2ZSBvZmZzZXRzIHN0YXJ0IGZyb20gdGhlIGVuZCBvZiB0aGUgYnVmZmVyXG4gIGlmIChieXRlT2Zmc2V0IDwgMCkgYnl0ZU9mZnNldCA9IGJ1ZmZlci5sZW5ndGggKyBieXRlT2Zmc2V0XG4gIGlmIChieXRlT2Zmc2V0ID49IGJ1ZmZlci5sZW5ndGgpIHtcbiAgICBpZiAoZGlyKSByZXR1cm4gLTFcbiAgICBlbHNlIGJ5dGVPZmZzZXQgPSBidWZmZXIubGVuZ3RoIC0gMVxuICB9IGVsc2UgaWYgKGJ5dGVPZmZzZXQgPCAwKSB7XG4gICAgaWYgKGRpcikgYnl0ZU9mZnNldCA9IDBcbiAgICBlbHNlIHJldHVybiAtMVxuICB9XG5cbiAgLy8gTm9ybWFsaXplIHZhbFxuICBpZiAodHlwZW9mIHZhbCA9PT0gJ3N0cmluZycpIHtcbiAgICB2YWwgPSBCdWZmZXIuZnJvbSh2YWwsIGVuY29kaW5nKVxuICB9XG5cbiAgLy8gRmluYWxseSwgc2VhcmNoIGVpdGhlciBpbmRleE9mIChpZiBkaXIgaXMgdHJ1ZSkgb3IgbGFzdEluZGV4T2ZcbiAgaWYgKEJ1ZmZlci5pc0J1ZmZlcih2YWwpKSB7XG4gICAgLy8gU3BlY2lhbCBjYXNlOiBsb29raW5nIGZvciBlbXB0eSBzdHJpbmcvYnVmZmVyIGFsd2F5cyBmYWlsc1xuICAgIGlmICh2YWwubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gLTFcbiAgICB9XG4gICAgcmV0dXJuIGFycmF5SW5kZXhPZihidWZmZXIsIHZhbCwgYnl0ZU9mZnNldCwgZW5jb2RpbmcsIGRpcilcbiAgfSBlbHNlIGlmICh0eXBlb2YgdmFsID09PSAnbnVtYmVyJykge1xuICAgIHZhbCA9IHZhbCAmIDB4RkYgLy8gU2VhcmNoIGZvciBhIGJ5dGUgdmFsdWUgWzAtMjU1XVxuICAgIGlmICh0eXBlb2YgVWludDhBcnJheS5wcm90b3R5cGUuaW5kZXhPZiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgaWYgKGRpcikge1xuICAgICAgICByZXR1cm4gVWludDhBcnJheS5wcm90b3R5cGUuaW5kZXhPZi5jYWxsKGJ1ZmZlciwgdmFsLCBieXRlT2Zmc2V0KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIFVpbnQ4QXJyYXkucHJvdG90eXBlLmxhc3RJbmRleE9mLmNhbGwoYnVmZmVyLCB2YWwsIGJ5dGVPZmZzZXQpXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBhcnJheUluZGV4T2YoYnVmZmVyLCBbIHZhbCBdLCBieXRlT2Zmc2V0LCBlbmNvZGluZywgZGlyKVxuICB9XG5cbiAgdGhyb3cgbmV3IFR5cGVFcnJvcigndmFsIG11c3QgYmUgc3RyaW5nLCBudW1iZXIgb3IgQnVmZmVyJylcbn1cblxuZnVuY3Rpb24gYXJyYXlJbmRleE9mIChhcnIsIHZhbCwgYnl0ZU9mZnNldCwgZW5jb2RpbmcsIGRpcikge1xuICB2YXIgaW5kZXhTaXplID0gMVxuICB2YXIgYXJyTGVuZ3RoID0gYXJyLmxlbmd0aFxuICB2YXIgdmFsTGVuZ3RoID0gdmFsLmxlbmd0aFxuXG4gIGlmIChlbmNvZGluZyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgZW5jb2RpbmcgPSBTdHJpbmcoZW5jb2RpbmcpLnRvTG93ZXJDYXNlKClcbiAgICBpZiAoZW5jb2RpbmcgPT09ICd1Y3MyJyB8fCBlbmNvZGluZyA9PT0gJ3Vjcy0yJyB8fFxuICAgICAgICBlbmNvZGluZyA9PT0gJ3V0ZjE2bGUnIHx8IGVuY29kaW5nID09PSAndXRmLTE2bGUnKSB7XG4gICAgICBpZiAoYXJyLmxlbmd0aCA8IDIgfHwgdmFsLmxlbmd0aCA8IDIpIHtcbiAgICAgICAgcmV0dXJuIC0xXG4gICAgICB9XG4gICAgICBpbmRleFNpemUgPSAyXG4gICAgICBhcnJMZW5ndGggLz0gMlxuICAgICAgdmFsTGVuZ3RoIC89IDJcbiAgICAgIGJ5dGVPZmZzZXQgLz0gMlxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHJlYWQgKGJ1ZiwgaSkge1xuICAgIGlmIChpbmRleFNpemUgPT09IDEpIHtcbiAgICAgIHJldHVybiBidWZbaV1cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGJ1Zi5yZWFkVUludDE2QkUoaSAqIGluZGV4U2l6ZSlcbiAgICB9XG4gIH1cblxuICB2YXIgaVxuICBpZiAoZGlyKSB7XG4gICAgdmFyIGZvdW5kSW5kZXggPSAtMVxuICAgIGZvciAoaSA9IGJ5dGVPZmZzZXQ7IGkgPCBhcnJMZW5ndGg7IGkrKykge1xuICAgICAgaWYgKHJlYWQoYXJyLCBpKSA9PT0gcmVhZCh2YWwsIGZvdW5kSW5kZXggPT09IC0xID8gMCA6IGkgLSBmb3VuZEluZGV4KSkge1xuICAgICAgICBpZiAoZm91bmRJbmRleCA9PT0gLTEpIGZvdW5kSW5kZXggPSBpXG4gICAgICAgIGlmIChpIC0gZm91bmRJbmRleCArIDEgPT09IHZhbExlbmd0aCkgcmV0dXJuIGZvdW5kSW5kZXggKiBpbmRleFNpemVcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChmb3VuZEluZGV4ICE9PSAtMSkgaSAtPSBpIC0gZm91bmRJbmRleFxuICAgICAgICBmb3VuZEluZGV4ID0gLTFcbiAgICAgIH1cbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgaWYgKGJ5dGVPZmZzZXQgKyB2YWxMZW5ndGggPiBhcnJMZW5ndGgpIGJ5dGVPZmZzZXQgPSBhcnJMZW5ndGggLSB2YWxMZW5ndGhcbiAgICBmb3IgKGkgPSBieXRlT2Zmc2V0OyBpID49IDA7IGktLSkge1xuICAgICAgdmFyIGZvdW5kID0gdHJ1ZVxuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCB2YWxMZW5ndGg7IGorKykge1xuICAgICAgICBpZiAocmVhZChhcnIsIGkgKyBqKSAhPT0gcmVhZCh2YWwsIGopKSB7XG4gICAgICAgICAgZm91bmQgPSBmYWxzZVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChmb3VuZCkgcmV0dXJuIGlcbiAgICB9XG4gIH1cblxuICByZXR1cm4gLTFcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5pbmNsdWRlcyA9IGZ1bmN0aW9uIGluY2x1ZGVzICh2YWwsIGJ5dGVPZmZzZXQsIGVuY29kaW5nKSB7XG4gIHJldHVybiB0aGlzLmluZGV4T2YodmFsLCBieXRlT2Zmc2V0LCBlbmNvZGluZykgIT09IC0xXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuaW5kZXhPZiA9IGZ1bmN0aW9uIGluZGV4T2YgKHZhbCwgYnl0ZU9mZnNldCwgZW5jb2RpbmcpIHtcbiAgcmV0dXJuIGJpZGlyZWN0aW9uYWxJbmRleE9mKHRoaXMsIHZhbCwgYnl0ZU9mZnNldCwgZW5jb2RpbmcsIHRydWUpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUubGFzdEluZGV4T2YgPSBmdW5jdGlvbiBsYXN0SW5kZXhPZiAodmFsLCBieXRlT2Zmc2V0LCBlbmNvZGluZykge1xuICByZXR1cm4gYmlkaXJlY3Rpb25hbEluZGV4T2YodGhpcywgdmFsLCBieXRlT2Zmc2V0LCBlbmNvZGluZywgZmFsc2UpXG59XG5cbmZ1bmN0aW9uIGhleFdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgb2Zmc2V0ID0gTnVtYmVyKG9mZnNldCkgfHwgMFxuICB2YXIgcmVtYWluaW5nID0gYnVmLmxlbmd0aCAtIG9mZnNldFxuICBpZiAoIWxlbmd0aCkge1xuICAgIGxlbmd0aCA9IHJlbWFpbmluZ1xuICB9IGVsc2Uge1xuICAgIGxlbmd0aCA9IE51bWJlcihsZW5ndGgpXG4gICAgaWYgKGxlbmd0aCA+IHJlbWFpbmluZykge1xuICAgICAgbGVuZ3RoID0gcmVtYWluaW5nXG4gICAgfVxuICB9XG5cbiAgLy8gbXVzdCBiZSBhbiBldmVuIG51bWJlciBvZiBkaWdpdHNcbiAgdmFyIHN0ckxlbiA9IHN0cmluZy5sZW5ndGhcbiAgaWYgKHN0ckxlbiAlIDIgIT09IDApIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ludmFsaWQgaGV4IHN0cmluZycpXG5cbiAgaWYgKGxlbmd0aCA+IHN0ckxlbiAvIDIpIHtcbiAgICBsZW5ndGggPSBzdHJMZW4gLyAyXG4gIH1cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7ICsraSkge1xuICAgIHZhciBwYXJzZWQgPSBwYXJzZUludChzdHJpbmcuc3Vic3RyKGkgKiAyLCAyKSwgMTYpXG4gICAgaWYgKGlzTmFOKHBhcnNlZCkpIHJldHVybiBpXG4gICAgYnVmW29mZnNldCArIGldID0gcGFyc2VkXG4gIH1cbiAgcmV0dXJuIGlcbn1cblxuZnVuY3Rpb24gdXRmOFdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgcmV0dXJuIGJsaXRCdWZmZXIodXRmOFRvQnl0ZXMoc3RyaW5nLCBidWYubGVuZ3RoIC0gb2Zmc2V0KSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbn1cblxuZnVuY3Rpb24gYXNjaWlXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHJldHVybiBibGl0QnVmZmVyKGFzY2lpVG9CeXRlcyhzdHJpbmcpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxufVxuXG5mdW5jdGlvbiBsYXRpbjFXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHJldHVybiBhc2NpaVdyaXRlKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbn1cblxuZnVuY3Rpb24gYmFzZTY0V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICByZXR1cm4gYmxpdEJ1ZmZlcihiYXNlNjRUb0J5dGVzKHN0cmluZyksIGJ1Ziwgb2Zmc2V0LCBsZW5ndGgpXG59XG5cbmZ1bmN0aW9uIHVjczJXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHJldHVybiBibGl0QnVmZmVyKHV0ZjE2bGVUb0J5dGVzKHN0cmluZywgYnVmLmxlbmd0aCAtIG9mZnNldCksIGJ1Ziwgb2Zmc2V0LCBsZW5ndGgpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGUgPSBmdW5jdGlvbiB3cml0ZSAoc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCwgZW5jb2RpbmcpIHtcbiAgLy8gQnVmZmVyI3dyaXRlKHN0cmluZylcbiAgaWYgKG9mZnNldCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgZW5jb2RpbmcgPSAndXRmOCdcbiAgICBsZW5ndGggPSB0aGlzLmxlbmd0aFxuICAgIG9mZnNldCA9IDBcbiAgLy8gQnVmZmVyI3dyaXRlKHN0cmluZywgZW5jb2RpbmcpXG4gIH0gZWxzZSBpZiAobGVuZ3RoID09PSB1bmRlZmluZWQgJiYgdHlwZW9mIG9mZnNldCA9PT0gJ3N0cmluZycpIHtcbiAgICBlbmNvZGluZyA9IG9mZnNldFxuICAgIGxlbmd0aCA9IHRoaXMubGVuZ3RoXG4gICAgb2Zmc2V0ID0gMFxuICAvLyBCdWZmZXIjd3JpdGUoc3RyaW5nLCBvZmZzZXRbLCBsZW5ndGhdWywgZW5jb2RpbmddKVxuICB9IGVsc2UgaWYgKGlzRmluaXRlKG9mZnNldCkpIHtcbiAgICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgICBpZiAoaXNGaW5pdGUobGVuZ3RoKSkge1xuICAgICAgbGVuZ3RoID0gbGVuZ3RoID4+PiAwXG4gICAgICBpZiAoZW5jb2RpbmcgPT09IHVuZGVmaW5lZCkgZW5jb2RpbmcgPSAndXRmOCdcbiAgICB9IGVsc2Uge1xuICAgICAgZW5jb2RpbmcgPSBsZW5ndGhcbiAgICAgIGxlbmd0aCA9IHVuZGVmaW5lZFxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAnQnVmZmVyLndyaXRlKHN0cmluZywgZW5jb2RpbmcsIG9mZnNldFssIGxlbmd0aF0pIGlzIG5vIGxvbmdlciBzdXBwb3J0ZWQnXG4gICAgKVxuICB9XG5cbiAgdmFyIHJlbWFpbmluZyA9IHRoaXMubGVuZ3RoIC0gb2Zmc2V0XG4gIGlmIChsZW5ndGggPT09IHVuZGVmaW5lZCB8fCBsZW5ndGggPiByZW1haW5pbmcpIGxlbmd0aCA9IHJlbWFpbmluZ1xuXG4gIGlmICgoc3RyaW5nLmxlbmd0aCA+IDAgJiYgKGxlbmd0aCA8IDAgfHwgb2Zmc2V0IDwgMCkpIHx8IG9mZnNldCA+IHRoaXMubGVuZ3RoKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0F0dGVtcHQgdG8gd3JpdGUgb3V0c2lkZSBidWZmZXIgYm91bmRzJylcbiAgfVxuXG4gIGlmICghZW5jb2RpbmcpIGVuY29kaW5nID0gJ3V0ZjgnXG5cbiAgdmFyIGxvd2VyZWRDYXNlID0gZmFsc2VcbiAgZm9yICg7Oykge1xuICAgIHN3aXRjaCAoZW5jb2RpbmcpIHtcbiAgICAgIGNhc2UgJ2hleCc6XG4gICAgICAgIHJldHVybiBoZXhXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuXG4gICAgICBjYXNlICd1dGY4JzpcbiAgICAgIGNhc2UgJ3V0Zi04JzpcbiAgICAgICAgcmV0dXJuIHV0ZjhXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuXG4gICAgICBjYXNlICdhc2NpaSc6XG4gICAgICAgIHJldHVybiBhc2NpaVdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG5cbiAgICAgIGNhc2UgJ2xhdGluMSc6XG4gICAgICBjYXNlICdiaW5hcnknOlxuICAgICAgICByZXR1cm4gbGF0aW4xV3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcblxuICAgICAgY2FzZSAnYmFzZTY0JzpcbiAgICAgICAgLy8gV2FybmluZzogbWF4TGVuZ3RoIG5vdCB0YWtlbiBpbnRvIGFjY291bnQgaW4gYmFzZTY0V3JpdGVcbiAgICAgICAgcmV0dXJuIGJhc2U2NFdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG5cbiAgICAgIGNhc2UgJ3VjczInOlxuICAgICAgY2FzZSAndWNzLTInOlxuICAgICAgY2FzZSAndXRmMTZsZSc6XG4gICAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICAgIHJldHVybiB1Y3MyV3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcblxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgaWYgKGxvd2VyZWRDYXNlKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdVbmtub3duIGVuY29kaW5nOiAnICsgZW5jb2RpbmcpXG4gICAgICAgIGVuY29kaW5nID0gKCcnICsgZW5jb2RpbmcpLnRvTG93ZXJDYXNlKClcbiAgICAgICAgbG93ZXJlZENhc2UgPSB0cnVlXG4gICAgfVxuICB9XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24gdG9KU09OICgpIHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiAnQnVmZmVyJyxcbiAgICBkYXRhOiBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbCh0aGlzLl9hcnIgfHwgdGhpcywgMClcbiAgfVxufVxuXG5mdW5jdGlvbiBiYXNlNjRTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIGlmIChzdGFydCA9PT0gMCAmJiBlbmQgPT09IGJ1Zi5sZW5ndGgpIHtcbiAgICByZXR1cm4gYmFzZTY0LmZyb21CeXRlQXJyYXkoYnVmKVxuICB9IGVsc2Uge1xuICAgIHJldHVybiBiYXNlNjQuZnJvbUJ5dGVBcnJheShidWYuc2xpY2Uoc3RhcnQsIGVuZCkpXG4gIH1cbn1cblxuZnVuY3Rpb24gdXRmOFNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgZW5kID0gTWF0aC5taW4oYnVmLmxlbmd0aCwgZW5kKVxuICB2YXIgcmVzID0gW11cblxuICB2YXIgaSA9IHN0YXJ0XG4gIHdoaWxlIChpIDwgZW5kKSB7XG4gICAgdmFyIGZpcnN0Qnl0ZSA9IGJ1ZltpXVxuICAgIHZhciBjb2RlUG9pbnQgPSBudWxsXG4gICAgdmFyIGJ5dGVzUGVyU2VxdWVuY2UgPSAoZmlyc3RCeXRlID4gMHhFRikgPyA0XG4gICAgICA6IChmaXJzdEJ5dGUgPiAweERGKSA/IDNcbiAgICAgIDogKGZpcnN0Qnl0ZSA+IDB4QkYpID8gMlxuICAgICAgOiAxXG5cbiAgICBpZiAoaSArIGJ5dGVzUGVyU2VxdWVuY2UgPD0gZW5kKSB7XG4gICAgICB2YXIgc2Vjb25kQnl0ZSwgdGhpcmRCeXRlLCBmb3VydGhCeXRlLCB0ZW1wQ29kZVBvaW50XG5cbiAgICAgIHN3aXRjaCAoYnl0ZXNQZXJTZXF1ZW5jZSkge1xuICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgaWYgKGZpcnN0Qnl0ZSA8IDB4ODApIHtcbiAgICAgICAgICAgIGNvZGVQb2ludCA9IGZpcnN0Qnl0ZVxuICAgICAgICAgIH1cbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgc2Vjb25kQnl0ZSA9IGJ1ZltpICsgMV1cbiAgICAgICAgICBpZiAoKHNlY29uZEJ5dGUgJiAweEMwKSA9PT0gMHg4MCkge1xuICAgICAgICAgICAgdGVtcENvZGVQb2ludCA9IChmaXJzdEJ5dGUgJiAweDFGKSA8PCAweDYgfCAoc2Vjb25kQnl0ZSAmIDB4M0YpXG4gICAgICAgICAgICBpZiAodGVtcENvZGVQb2ludCA+IDB4N0YpIHtcbiAgICAgICAgICAgICAgY29kZVBvaW50ID0gdGVtcENvZGVQb2ludFxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgc2Vjb25kQnl0ZSA9IGJ1ZltpICsgMV1cbiAgICAgICAgICB0aGlyZEJ5dGUgPSBidWZbaSArIDJdXG4gICAgICAgICAgaWYgKChzZWNvbmRCeXRlICYgMHhDMCkgPT09IDB4ODAgJiYgKHRoaXJkQnl0ZSAmIDB4QzApID09PSAweDgwKSB7XG4gICAgICAgICAgICB0ZW1wQ29kZVBvaW50ID0gKGZpcnN0Qnl0ZSAmIDB4RikgPDwgMHhDIHwgKHNlY29uZEJ5dGUgJiAweDNGKSA8PCAweDYgfCAodGhpcmRCeXRlICYgMHgzRilcbiAgICAgICAgICAgIGlmICh0ZW1wQ29kZVBvaW50ID4gMHg3RkYgJiYgKHRlbXBDb2RlUG9pbnQgPCAweEQ4MDAgfHwgdGVtcENvZGVQb2ludCA+IDB4REZGRikpIHtcbiAgICAgICAgICAgICAgY29kZVBvaW50ID0gdGVtcENvZGVQb2ludFxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgc2Vjb25kQnl0ZSA9IGJ1ZltpICsgMV1cbiAgICAgICAgICB0aGlyZEJ5dGUgPSBidWZbaSArIDJdXG4gICAgICAgICAgZm91cnRoQnl0ZSA9IGJ1ZltpICsgM11cbiAgICAgICAgICBpZiAoKHNlY29uZEJ5dGUgJiAweEMwKSA9PT0gMHg4MCAmJiAodGhpcmRCeXRlICYgMHhDMCkgPT09IDB4ODAgJiYgKGZvdXJ0aEJ5dGUgJiAweEMwKSA9PT0gMHg4MCkge1xuICAgICAgICAgICAgdGVtcENvZGVQb2ludCA9IChmaXJzdEJ5dGUgJiAweEYpIDw8IDB4MTIgfCAoc2Vjb25kQnl0ZSAmIDB4M0YpIDw8IDB4QyB8ICh0aGlyZEJ5dGUgJiAweDNGKSA8PCAweDYgfCAoZm91cnRoQnl0ZSAmIDB4M0YpXG4gICAgICAgICAgICBpZiAodGVtcENvZGVQb2ludCA+IDB4RkZGRiAmJiB0ZW1wQ29kZVBvaW50IDwgMHgxMTAwMDApIHtcbiAgICAgICAgICAgICAgY29kZVBvaW50ID0gdGVtcENvZGVQb2ludFxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoY29kZVBvaW50ID09PSBudWxsKSB7XG4gICAgICAvLyB3ZSBkaWQgbm90IGdlbmVyYXRlIGEgdmFsaWQgY29kZVBvaW50IHNvIGluc2VydCBhXG4gICAgICAvLyByZXBsYWNlbWVudCBjaGFyIChVK0ZGRkQpIGFuZCBhZHZhbmNlIG9ubHkgMSBieXRlXG4gICAgICBjb2RlUG9pbnQgPSAweEZGRkRcbiAgICAgIGJ5dGVzUGVyU2VxdWVuY2UgPSAxXG4gICAgfSBlbHNlIGlmIChjb2RlUG9pbnQgPiAweEZGRkYpIHtcbiAgICAgIC8vIGVuY29kZSB0byB1dGYxNiAoc3Vycm9nYXRlIHBhaXIgZGFuY2UpXG4gICAgICBjb2RlUG9pbnQgLT0gMHgxMDAwMFxuICAgICAgcmVzLnB1c2goY29kZVBvaW50ID4+PiAxMCAmIDB4M0ZGIHwgMHhEODAwKVxuICAgICAgY29kZVBvaW50ID0gMHhEQzAwIHwgY29kZVBvaW50ICYgMHgzRkZcbiAgICB9XG5cbiAgICByZXMucHVzaChjb2RlUG9pbnQpXG4gICAgaSArPSBieXRlc1BlclNlcXVlbmNlXG4gIH1cblxuICByZXR1cm4gZGVjb2RlQ29kZVBvaW50c0FycmF5KHJlcylcbn1cblxuLy8gQmFzZWQgb24gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMjI3NDcyNzIvNjgwNzQyLCB0aGUgYnJvd3NlciB3aXRoXG4vLyB0aGUgbG93ZXN0IGxpbWl0IGlzIENocm9tZSwgd2l0aCAweDEwMDAwIGFyZ3MuXG4vLyBXZSBnbyAxIG1hZ25pdHVkZSBsZXNzLCBmb3Igc2FmZXR5XG52YXIgTUFYX0FSR1VNRU5UU19MRU5HVEggPSAweDEwMDBcblxuZnVuY3Rpb24gZGVjb2RlQ29kZVBvaW50c0FycmF5IChjb2RlUG9pbnRzKSB7XG4gIHZhciBsZW4gPSBjb2RlUG9pbnRzLmxlbmd0aFxuICBpZiAobGVuIDw9IE1BWF9BUkdVTUVOVFNfTEVOR1RIKSB7XG4gICAgcmV0dXJuIFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkoU3RyaW5nLCBjb2RlUG9pbnRzKSAvLyBhdm9pZCBleHRyYSBzbGljZSgpXG4gIH1cblxuICAvLyBEZWNvZGUgaW4gY2h1bmtzIHRvIGF2b2lkIFwiY2FsbCBzdGFjayBzaXplIGV4Y2VlZGVkXCIuXG4gIHZhciByZXMgPSAnJ1xuICB2YXIgaSA9IDBcbiAgd2hpbGUgKGkgPCBsZW4pIHtcbiAgICByZXMgKz0gU3RyaW5nLmZyb21DaGFyQ29kZS5hcHBseShcbiAgICAgIFN0cmluZyxcbiAgICAgIGNvZGVQb2ludHMuc2xpY2UoaSwgaSArPSBNQVhfQVJHVU1FTlRTX0xFTkdUSClcbiAgICApXG4gIH1cbiAgcmV0dXJuIHJlc1xufVxuXG5mdW5jdGlvbiBhc2NpaVNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIHJldCA9ICcnXG4gIGVuZCA9IE1hdGgubWluKGJ1Zi5sZW5ndGgsIGVuZClcblxuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7ICsraSkge1xuICAgIHJldCArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ1ZltpXSAmIDB4N0YpXG4gIH1cbiAgcmV0dXJuIHJldFxufVxuXG5mdW5jdGlvbiBsYXRpbjFTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHZhciByZXQgPSAnJ1xuICBlbmQgPSBNYXRoLm1pbihidWYubGVuZ3RoLCBlbmQpXG5cbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyArK2kpIHtcbiAgICByZXQgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShidWZbaV0pXG4gIH1cbiAgcmV0dXJuIHJldFxufVxuXG5mdW5jdGlvbiBoZXhTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG5cbiAgaWYgKCFzdGFydCB8fCBzdGFydCA8IDApIHN0YXJ0ID0gMFxuICBpZiAoIWVuZCB8fCBlbmQgPCAwIHx8IGVuZCA+IGxlbikgZW5kID0gbGVuXG5cbiAgdmFyIG91dCA9ICcnXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgKytpKSB7XG4gICAgb3V0ICs9IHRvSGV4KGJ1ZltpXSlcbiAgfVxuICByZXR1cm4gb3V0XG59XG5cbmZ1bmN0aW9uIHV0ZjE2bGVTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHZhciBieXRlcyA9IGJ1Zi5zbGljZShzdGFydCwgZW5kKVxuICB2YXIgcmVzID0gJydcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBieXRlcy5sZW5ndGg7IGkgKz0gMikge1xuICAgIHJlcyArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ5dGVzW2ldICsgKGJ5dGVzW2kgKyAxXSAqIDI1NikpXG4gIH1cbiAgcmV0dXJuIHJlc1xufVxuXG5CdWZmZXIucHJvdG90eXBlLnNsaWNlID0gZnVuY3Rpb24gc2xpY2UgKHN0YXJ0LCBlbmQpIHtcbiAgdmFyIGxlbiA9IHRoaXMubGVuZ3RoXG4gIHN0YXJ0ID0gfn5zdGFydFxuICBlbmQgPSBlbmQgPT09IHVuZGVmaW5lZCA/IGxlbiA6IH5+ZW5kXG5cbiAgaWYgKHN0YXJ0IDwgMCkge1xuICAgIHN0YXJ0ICs9IGxlblxuICAgIGlmIChzdGFydCA8IDApIHN0YXJ0ID0gMFxuICB9IGVsc2UgaWYgKHN0YXJ0ID4gbGVuKSB7XG4gICAgc3RhcnQgPSBsZW5cbiAgfVxuXG4gIGlmIChlbmQgPCAwKSB7XG4gICAgZW5kICs9IGxlblxuICAgIGlmIChlbmQgPCAwKSBlbmQgPSAwXG4gIH0gZWxzZSBpZiAoZW5kID4gbGVuKSB7XG4gICAgZW5kID0gbGVuXG4gIH1cblxuICBpZiAoZW5kIDwgc3RhcnQpIGVuZCA9IHN0YXJ0XG5cbiAgdmFyIG5ld0J1ZiA9IHRoaXMuc3ViYXJyYXkoc3RhcnQsIGVuZClcbiAgLy8gUmV0dXJuIGFuIGF1Z21lbnRlZCBgVWludDhBcnJheWAgaW5zdGFuY2VcbiAgbmV3QnVmLl9fcHJvdG9fXyA9IEJ1ZmZlci5wcm90b3R5cGVcbiAgcmV0dXJuIG5ld0J1ZlxufVxuXG4vKlxuICogTmVlZCB0byBtYWtlIHN1cmUgdGhhdCBidWZmZXIgaXNuJ3QgdHJ5aW5nIHRvIHdyaXRlIG91dCBvZiBib3VuZHMuXG4gKi9cbmZ1bmN0aW9uIGNoZWNrT2Zmc2V0IChvZmZzZXQsIGV4dCwgbGVuZ3RoKSB7XG4gIGlmICgob2Zmc2V0ICUgMSkgIT09IDAgfHwgb2Zmc2V0IDwgMCkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ29mZnNldCBpcyBub3QgdWludCcpXG4gIGlmIChvZmZzZXQgKyBleHQgPiBsZW5ndGgpIHRocm93IG5ldyBSYW5nZUVycm9yKCdUcnlpbmcgdG8gYWNjZXNzIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludExFID0gZnVuY3Rpb24gcmVhZFVJbnRMRSAob2Zmc2V0LCBieXRlTGVuZ3RoLCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgYnl0ZUxlbmd0aCA9IGJ5dGVMZW5ndGggPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCBieXRlTGVuZ3RoLCB0aGlzLmxlbmd0aClcblxuICB2YXIgdmFsID0gdGhpc1tvZmZzZXRdXG4gIHZhciBtdWwgPSAxXG4gIHZhciBpID0gMFxuICB3aGlsZSAoKytpIDwgYnl0ZUxlbmd0aCAmJiAobXVsICo9IDB4MTAwKSkge1xuICAgIHZhbCArPSB0aGlzW29mZnNldCArIGldICogbXVsXG4gIH1cblxuICByZXR1cm4gdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnRCRSA9IGZ1bmN0aW9uIHJlYWRVSW50QkUgKG9mZnNldCwgYnl0ZUxlbmd0aCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGJ5dGVMZW5ndGggPSBieXRlTGVuZ3RoID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBjaGVja09mZnNldChvZmZzZXQsIGJ5dGVMZW5ndGgsIHRoaXMubGVuZ3RoKVxuICB9XG5cbiAgdmFyIHZhbCA9IHRoaXNbb2Zmc2V0ICsgLS1ieXRlTGVuZ3RoXVxuICB2YXIgbXVsID0gMVxuICB3aGlsZSAoYnl0ZUxlbmd0aCA+IDAgJiYgKG11bCAqPSAweDEwMCkpIHtcbiAgICB2YWwgKz0gdGhpc1tvZmZzZXQgKyAtLWJ5dGVMZW5ndGhdICogbXVsXG4gIH1cblxuICByZXR1cm4gdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQ4ID0gZnVuY3Rpb24gcmVhZFVJbnQ4IChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDEsIHRoaXMubGVuZ3RoKVxuICByZXR1cm4gdGhpc1tvZmZzZXRdXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQxNkxFID0gZnVuY3Rpb24gcmVhZFVJbnQxNkxFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDIsIHRoaXMubGVuZ3RoKVxuICByZXR1cm4gdGhpc1tvZmZzZXRdIHwgKHRoaXNbb2Zmc2V0ICsgMV0gPDwgOClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDE2QkUgPSBmdW5jdGlvbiByZWFkVUludDE2QkUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgMiwgdGhpcy5sZW5ndGgpXG4gIHJldHVybiAodGhpc1tvZmZzZXRdIDw8IDgpIHwgdGhpc1tvZmZzZXQgKyAxXVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MzJMRSA9IGZ1bmN0aW9uIHJlYWRVSW50MzJMRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCA0LCB0aGlzLmxlbmd0aClcblxuICByZXR1cm4gKCh0aGlzW29mZnNldF0pIHxcbiAgICAgICh0aGlzW29mZnNldCArIDFdIDw8IDgpIHxcbiAgICAgICh0aGlzW29mZnNldCArIDJdIDw8IDE2KSkgK1xuICAgICAgKHRoaXNbb2Zmc2V0ICsgM10gKiAweDEwMDAwMDApXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQzMkJFID0gZnVuY3Rpb24gcmVhZFVJbnQzMkJFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDQsIHRoaXMubGVuZ3RoKVxuXG4gIHJldHVybiAodGhpc1tvZmZzZXRdICogMHgxMDAwMDAwKSArXG4gICAgKCh0aGlzW29mZnNldCArIDFdIDw8IDE2KSB8XG4gICAgKHRoaXNbb2Zmc2V0ICsgMl0gPDwgOCkgfFxuICAgIHRoaXNbb2Zmc2V0ICsgM10pXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludExFID0gZnVuY3Rpb24gcmVhZEludExFIChvZmZzZXQsIGJ5dGVMZW5ndGgsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIGJ5dGVMZW5ndGgsIHRoaXMubGVuZ3RoKVxuXG4gIHZhciB2YWwgPSB0aGlzW29mZnNldF1cbiAgdmFyIG11bCA9IDFcbiAgdmFyIGkgPSAwXG4gIHdoaWxlICgrK2kgPCBieXRlTGVuZ3RoICYmIChtdWwgKj0gMHgxMDApKSB7XG4gICAgdmFsICs9IHRoaXNbb2Zmc2V0ICsgaV0gKiBtdWxcbiAgfVxuICBtdWwgKj0gMHg4MFxuXG4gIGlmICh2YWwgPj0gbXVsKSB2YWwgLT0gTWF0aC5wb3coMiwgOCAqIGJ5dGVMZW5ndGgpXG5cbiAgcmV0dXJuIHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnRCRSA9IGZ1bmN0aW9uIHJlYWRJbnRCRSAob2Zmc2V0LCBieXRlTGVuZ3RoLCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgYnl0ZUxlbmd0aCA9IGJ5dGVMZW5ndGggPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCBieXRlTGVuZ3RoLCB0aGlzLmxlbmd0aClcblxuICB2YXIgaSA9IGJ5dGVMZW5ndGhcbiAgdmFyIG11bCA9IDFcbiAgdmFyIHZhbCA9IHRoaXNbb2Zmc2V0ICsgLS1pXVxuICB3aGlsZSAoaSA+IDAgJiYgKG11bCAqPSAweDEwMCkpIHtcbiAgICB2YWwgKz0gdGhpc1tvZmZzZXQgKyAtLWldICogbXVsXG4gIH1cbiAgbXVsICo9IDB4ODBcblxuICBpZiAodmFsID49IG11bCkgdmFsIC09IE1hdGgucG93KDIsIDggKiBieXRlTGVuZ3RoKVxuXG4gIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50OCA9IGZ1bmN0aW9uIHJlYWRJbnQ4IChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDEsIHRoaXMubGVuZ3RoKVxuICBpZiAoISh0aGlzW29mZnNldF0gJiAweDgwKSkgcmV0dXJuICh0aGlzW29mZnNldF0pXG4gIHJldHVybiAoKDB4ZmYgLSB0aGlzW29mZnNldF0gKyAxKSAqIC0xKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQxNkxFID0gZnVuY3Rpb24gcmVhZEludDE2TEUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgMiwgdGhpcy5sZW5ndGgpXG4gIHZhciB2YWwgPSB0aGlzW29mZnNldF0gfCAodGhpc1tvZmZzZXQgKyAxXSA8PCA4KVxuICByZXR1cm4gKHZhbCAmIDB4ODAwMCkgPyB2YWwgfCAweEZGRkYwMDAwIDogdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDE2QkUgPSBmdW5jdGlvbiByZWFkSW50MTZCRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCAyLCB0aGlzLmxlbmd0aClcbiAgdmFyIHZhbCA9IHRoaXNbb2Zmc2V0ICsgMV0gfCAodGhpc1tvZmZzZXRdIDw8IDgpXG4gIHJldHVybiAodmFsICYgMHg4MDAwKSA/IHZhbCB8IDB4RkZGRjAwMDAgOiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MzJMRSA9IGZ1bmN0aW9uIHJlYWRJbnQzMkxFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDQsIHRoaXMubGVuZ3RoKVxuXG4gIHJldHVybiAodGhpc1tvZmZzZXRdKSB8XG4gICAgKHRoaXNbb2Zmc2V0ICsgMV0gPDwgOCkgfFxuICAgICh0aGlzW29mZnNldCArIDJdIDw8IDE2KSB8XG4gICAgKHRoaXNbb2Zmc2V0ICsgM10gPDwgMjQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDMyQkUgPSBmdW5jdGlvbiByZWFkSW50MzJCRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCA0LCB0aGlzLmxlbmd0aClcblxuICByZXR1cm4gKHRoaXNbb2Zmc2V0XSA8PCAyNCkgfFxuICAgICh0aGlzW29mZnNldCArIDFdIDw8IDE2KSB8XG4gICAgKHRoaXNbb2Zmc2V0ICsgMl0gPDwgOCkgfFxuICAgICh0aGlzW29mZnNldCArIDNdKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRGbG9hdExFID0gZnVuY3Rpb24gcmVhZEZsb2F0TEUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgNCwgdGhpcy5sZW5ndGgpXG4gIHJldHVybiBpZWVlNzU0LnJlYWQodGhpcywgb2Zmc2V0LCB0cnVlLCAyMywgNClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRmxvYXRCRSA9IGZ1bmN0aW9uIHJlYWRGbG9hdEJFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDQsIHRoaXMubGVuZ3RoKVxuICByZXR1cm4gaWVlZTc1NC5yZWFkKHRoaXMsIG9mZnNldCwgZmFsc2UsIDIzLCA0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWREb3VibGVMRSA9IGZ1bmN0aW9uIHJlYWREb3VibGVMRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCA4LCB0aGlzLmxlbmd0aClcbiAgcmV0dXJuIGllZWU3NTQucmVhZCh0aGlzLCBvZmZzZXQsIHRydWUsIDUyLCA4KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWREb3VibGVCRSA9IGZ1bmN0aW9uIHJlYWREb3VibGVCRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCA4LCB0aGlzLmxlbmd0aClcbiAgcmV0dXJuIGllZWU3NTQucmVhZCh0aGlzLCBvZmZzZXQsIGZhbHNlLCA1MiwgOClcbn1cblxuZnVuY3Rpb24gY2hlY2tJbnQgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgZXh0LCBtYXgsIG1pbikge1xuICBpZiAoIUJ1ZmZlci5pc0J1ZmZlcihidWYpKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdcImJ1ZmZlclwiIGFyZ3VtZW50IG11c3QgYmUgYSBCdWZmZXIgaW5zdGFuY2UnKVxuICBpZiAodmFsdWUgPiBtYXggfHwgdmFsdWUgPCBtaW4pIHRocm93IG5ldyBSYW5nZUVycm9yKCdcInZhbHVlXCIgYXJndW1lbnQgaXMgb3V0IG9mIGJvdW5kcycpXG4gIGlmIChvZmZzZXQgKyBleHQgPiBidWYubGVuZ3RoKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcignSW5kZXggb3V0IG9mIHJhbmdlJylcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnRMRSA9IGZ1bmN0aW9uIHdyaXRlVUludExFICh2YWx1ZSwgb2Zmc2V0LCBieXRlTGVuZ3RoLCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgYnl0ZUxlbmd0aCA9IGJ5dGVMZW5ndGggPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIHZhciBtYXhCeXRlcyA9IE1hdGgucG93KDIsIDggKiBieXRlTGVuZ3RoKSAtIDFcbiAgICBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBieXRlTGVuZ3RoLCBtYXhCeXRlcywgMClcbiAgfVxuXG4gIHZhciBtdWwgPSAxXG4gIHZhciBpID0gMFxuICB0aGlzW29mZnNldF0gPSB2YWx1ZSAmIDB4RkZcbiAgd2hpbGUgKCsraSA8IGJ5dGVMZW5ndGggJiYgKG11bCAqPSAweDEwMCkpIHtcbiAgICB0aGlzW29mZnNldCArIGldID0gKHZhbHVlIC8gbXVsKSAmIDB4RkZcbiAgfVxuXG4gIHJldHVybiBvZmZzZXQgKyBieXRlTGVuZ3RoXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50QkUgPSBmdW5jdGlvbiB3cml0ZVVJbnRCRSAodmFsdWUsIG9mZnNldCwgYnl0ZUxlbmd0aCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGJ5dGVMZW5ndGggPSBieXRlTGVuZ3RoID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICB2YXIgbWF4Qnl0ZXMgPSBNYXRoLnBvdygyLCA4ICogYnl0ZUxlbmd0aCkgLSAxXG4gICAgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgYnl0ZUxlbmd0aCwgbWF4Qnl0ZXMsIDApXG4gIH1cblxuICB2YXIgaSA9IGJ5dGVMZW5ndGggLSAxXG4gIHZhciBtdWwgPSAxXG4gIHRoaXNbb2Zmc2V0ICsgaV0gPSB2YWx1ZSAmIDB4RkZcbiAgd2hpbGUgKC0taSA+PSAwICYmIChtdWwgKj0gMHgxMDApKSB7XG4gICAgdGhpc1tvZmZzZXQgKyBpXSA9ICh2YWx1ZSAvIG11bCkgJiAweEZGXG4gIH1cblxuICByZXR1cm4gb2Zmc2V0ICsgYnl0ZUxlbmd0aFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDggPSBmdW5jdGlvbiB3cml0ZVVJbnQ4ICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgMSwgMHhmZiwgMClcbiAgdGhpc1tvZmZzZXRdID0gKHZhbHVlICYgMHhmZilcbiAgcmV0dXJuIG9mZnNldCArIDFcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQxNkxFID0gZnVuY3Rpb24gd3JpdGVVSW50MTZMRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDIsIDB4ZmZmZiwgMClcbiAgdGhpc1tvZmZzZXRdID0gKHZhbHVlICYgMHhmZilcbiAgdGhpc1tvZmZzZXQgKyAxXSA9ICh2YWx1ZSA+Pj4gOClcbiAgcmV0dXJuIG9mZnNldCArIDJcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQxNkJFID0gZnVuY3Rpb24gd3JpdGVVSW50MTZCRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDIsIDB4ZmZmZiwgMClcbiAgdGhpc1tvZmZzZXRdID0gKHZhbHVlID4+PiA4KVxuICB0aGlzW29mZnNldCArIDFdID0gKHZhbHVlICYgMHhmZilcbiAgcmV0dXJuIG9mZnNldCArIDJcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQzMkxFID0gZnVuY3Rpb24gd3JpdGVVSW50MzJMRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDQsIDB4ZmZmZmZmZmYsIDApXG4gIHRoaXNbb2Zmc2V0ICsgM10gPSAodmFsdWUgPj4+IDI0KVxuICB0aGlzW29mZnNldCArIDJdID0gKHZhbHVlID4+PiAxNilcbiAgdGhpc1tvZmZzZXQgKyAxXSA9ICh2YWx1ZSA+Pj4gOClcbiAgdGhpc1tvZmZzZXRdID0gKHZhbHVlICYgMHhmZilcbiAgcmV0dXJuIG9mZnNldCArIDRcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQzMkJFID0gZnVuY3Rpb24gd3JpdGVVSW50MzJCRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDQsIDB4ZmZmZmZmZmYsIDApXG4gIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSA+Pj4gMjQpXG4gIHRoaXNbb2Zmc2V0ICsgMV0gPSAodmFsdWUgPj4+IDE2KVxuICB0aGlzW29mZnNldCArIDJdID0gKHZhbHVlID4+PiA4KVxuICB0aGlzW29mZnNldCArIDNdID0gKHZhbHVlICYgMHhmZilcbiAgcmV0dXJuIG9mZnNldCArIDRcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludExFID0gZnVuY3Rpb24gd3JpdGVJbnRMRSAodmFsdWUsIG9mZnNldCwgYnl0ZUxlbmd0aCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICB2YXIgbGltaXQgPSBNYXRoLnBvdygyLCAoOCAqIGJ5dGVMZW5ndGgpIC0gMSlcblxuICAgIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGJ5dGVMZW5ndGgsIGxpbWl0IC0gMSwgLWxpbWl0KVxuICB9XG5cbiAgdmFyIGkgPSAwXG4gIHZhciBtdWwgPSAxXG4gIHZhciBzdWIgPSAwXG4gIHRoaXNbb2Zmc2V0XSA9IHZhbHVlICYgMHhGRlxuICB3aGlsZSAoKytpIDwgYnl0ZUxlbmd0aCAmJiAobXVsICo9IDB4MTAwKSkge1xuICAgIGlmICh2YWx1ZSA8IDAgJiYgc3ViID09PSAwICYmIHRoaXNbb2Zmc2V0ICsgaSAtIDFdICE9PSAwKSB7XG4gICAgICBzdWIgPSAxXG4gICAgfVxuICAgIHRoaXNbb2Zmc2V0ICsgaV0gPSAoKHZhbHVlIC8gbXVsKSA+PiAwKSAtIHN1YiAmIDB4RkZcbiAgfVxuXG4gIHJldHVybiBvZmZzZXQgKyBieXRlTGVuZ3RoXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnRCRSA9IGZ1bmN0aW9uIHdyaXRlSW50QkUgKHZhbHVlLCBvZmZzZXQsIGJ5dGVMZW5ndGgsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgdmFyIGxpbWl0ID0gTWF0aC5wb3coMiwgKDggKiBieXRlTGVuZ3RoKSAtIDEpXG5cbiAgICBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBieXRlTGVuZ3RoLCBsaW1pdCAtIDEsIC1saW1pdClcbiAgfVxuXG4gIHZhciBpID0gYnl0ZUxlbmd0aCAtIDFcbiAgdmFyIG11bCA9IDFcbiAgdmFyIHN1YiA9IDBcbiAgdGhpc1tvZmZzZXQgKyBpXSA9IHZhbHVlICYgMHhGRlxuICB3aGlsZSAoLS1pID49IDAgJiYgKG11bCAqPSAweDEwMCkpIHtcbiAgICBpZiAodmFsdWUgPCAwICYmIHN1YiA9PT0gMCAmJiB0aGlzW29mZnNldCArIGkgKyAxXSAhPT0gMCkge1xuICAgICAgc3ViID0gMVxuICAgIH1cbiAgICB0aGlzW29mZnNldCArIGldID0gKCh2YWx1ZSAvIG11bCkgPj4gMCkgLSBzdWIgJiAweEZGXG4gIH1cblxuICByZXR1cm4gb2Zmc2V0ICsgYnl0ZUxlbmd0aFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50OCA9IGZ1bmN0aW9uIHdyaXRlSW50OCAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDEsIDB4N2YsIC0weDgwKVxuICBpZiAodmFsdWUgPCAwKSB2YWx1ZSA9IDB4ZmYgKyB2YWx1ZSArIDFcbiAgdGhpc1tvZmZzZXRdID0gKHZhbHVlICYgMHhmZilcbiAgcmV0dXJuIG9mZnNldCArIDFcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDE2TEUgPSBmdW5jdGlvbiB3cml0ZUludDE2TEUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCAyLCAweDdmZmYsIC0weDgwMDApXG4gIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSAmIDB4ZmYpXG4gIHRoaXNbb2Zmc2V0ICsgMV0gPSAodmFsdWUgPj4+IDgpXG4gIHJldHVybiBvZmZzZXQgKyAyXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQxNkJFID0gZnVuY3Rpb24gd3JpdGVJbnQxNkJFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgMiwgMHg3ZmZmLCAtMHg4MDAwKVxuICB0aGlzW29mZnNldF0gPSAodmFsdWUgPj4+IDgpXG4gIHRoaXNbb2Zmc2V0ICsgMV0gPSAodmFsdWUgJiAweGZmKVxuICByZXR1cm4gb2Zmc2V0ICsgMlxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MzJMRSA9IGZ1bmN0aW9uIHdyaXRlSW50MzJMRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDQsIDB4N2ZmZmZmZmYsIC0weDgwMDAwMDAwKVxuICB0aGlzW29mZnNldF0gPSAodmFsdWUgJiAweGZmKVxuICB0aGlzW29mZnNldCArIDFdID0gKHZhbHVlID4+PiA4KVxuICB0aGlzW29mZnNldCArIDJdID0gKHZhbHVlID4+PiAxNilcbiAgdGhpc1tvZmZzZXQgKyAzXSA9ICh2YWx1ZSA+Pj4gMjQpXG4gIHJldHVybiBvZmZzZXQgKyA0XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQzMkJFID0gZnVuY3Rpb24gd3JpdGVJbnQzMkJFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgNCwgMHg3ZmZmZmZmZiwgLTB4ODAwMDAwMDApXG4gIGlmICh2YWx1ZSA8IDApIHZhbHVlID0gMHhmZmZmZmZmZiArIHZhbHVlICsgMVxuICB0aGlzW29mZnNldF0gPSAodmFsdWUgPj4+IDI0KVxuICB0aGlzW29mZnNldCArIDFdID0gKHZhbHVlID4+PiAxNilcbiAgdGhpc1tvZmZzZXQgKyAyXSA9ICh2YWx1ZSA+Pj4gOClcbiAgdGhpc1tvZmZzZXQgKyAzXSA9ICh2YWx1ZSAmIDB4ZmYpXG4gIHJldHVybiBvZmZzZXQgKyA0XG59XG5cbmZ1bmN0aW9uIGNoZWNrSUVFRTc1NCAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBleHQsIG1heCwgbWluKSB7XG4gIGlmIChvZmZzZXQgKyBleHQgPiBidWYubGVuZ3RoKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcignSW5kZXggb3V0IG9mIHJhbmdlJylcbiAgaWYgKG9mZnNldCA8IDApIHRocm93IG5ldyBSYW5nZUVycm9yKCdJbmRleCBvdXQgb2YgcmFuZ2UnKVxufVxuXG5mdW5jdGlvbiB3cml0ZUZsb2F0IChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBjaGVja0lFRUU3NTQoYnVmLCB2YWx1ZSwgb2Zmc2V0LCA0LCAzLjQwMjgyMzQ2NjM4NTI4ODZlKzM4LCAtMy40MDI4MjM0NjYzODUyODg2ZSszOClcbiAgfVxuICBpZWVlNzU0LndyaXRlKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCAyMywgNClcbiAgcmV0dXJuIG9mZnNldCArIDRcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUZsb2F0TEUgPSBmdW5jdGlvbiB3cml0ZUZsb2F0TEUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiB3cml0ZUZsb2F0KHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRmxvYXRCRSA9IGZ1bmN0aW9uIHdyaXRlRmxvYXRCRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIHdyaXRlRmxvYXQodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiB3cml0ZURvdWJsZSAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgY2hlY2tJRUVFNzU0KGJ1ZiwgdmFsdWUsIG9mZnNldCwgOCwgMS43OTc2OTMxMzQ4NjIzMTU3RSszMDgsIC0xLjc5NzY5MzEzNDg2MjMxNTdFKzMwOClcbiAgfVxuICBpZWVlNzU0LndyaXRlKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCA1MiwgOClcbiAgcmV0dXJuIG9mZnNldCArIDhcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZURvdWJsZUxFID0gZnVuY3Rpb24gd3JpdGVEb3VibGVMRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIHdyaXRlRG91YmxlKHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRG91YmxlQkUgPSBmdW5jdGlvbiB3cml0ZURvdWJsZUJFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gd3JpdGVEb3VibGUodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG4vLyBjb3B5KHRhcmdldEJ1ZmZlciwgdGFyZ2V0U3RhcnQ9MCwgc291cmNlU3RhcnQ9MCwgc291cmNlRW5kPWJ1ZmZlci5sZW5ndGgpXG5CdWZmZXIucHJvdG90eXBlLmNvcHkgPSBmdW5jdGlvbiBjb3B5ICh0YXJnZXQsIHRhcmdldFN0YXJ0LCBzdGFydCwgZW5kKSB7XG4gIGlmICghc3RhcnQpIHN0YXJ0ID0gMFxuICBpZiAoIWVuZCAmJiBlbmQgIT09IDApIGVuZCA9IHRoaXMubGVuZ3RoXG4gIGlmICh0YXJnZXRTdGFydCA+PSB0YXJnZXQubGVuZ3RoKSB0YXJnZXRTdGFydCA9IHRhcmdldC5sZW5ndGhcbiAgaWYgKCF0YXJnZXRTdGFydCkgdGFyZ2V0U3RhcnQgPSAwXG4gIGlmIChlbmQgPiAwICYmIGVuZCA8IHN0YXJ0KSBlbmQgPSBzdGFydFxuXG4gIC8vIENvcHkgMCBieXRlczsgd2UncmUgZG9uZVxuICBpZiAoZW5kID09PSBzdGFydCkgcmV0dXJuIDBcbiAgaWYgKHRhcmdldC5sZW5ndGggPT09IDAgfHwgdGhpcy5sZW5ndGggPT09IDApIHJldHVybiAwXG5cbiAgLy8gRmF0YWwgZXJyb3IgY29uZGl0aW9uc1xuICBpZiAodGFyZ2V0U3RhcnQgPCAwKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ3RhcmdldFN0YXJ0IG91dCBvZiBib3VuZHMnKVxuICB9XG4gIGlmIChzdGFydCA8IDAgfHwgc3RhcnQgPj0gdGhpcy5sZW5ndGgpIHRocm93IG5ldyBSYW5nZUVycm9yKCdzb3VyY2VTdGFydCBvdXQgb2YgYm91bmRzJylcbiAgaWYgKGVuZCA8IDApIHRocm93IG5ldyBSYW5nZUVycm9yKCdzb3VyY2VFbmQgb3V0IG9mIGJvdW5kcycpXG5cbiAgLy8gQXJlIHdlIG9vYj9cbiAgaWYgKGVuZCA+IHRoaXMubGVuZ3RoKSBlbmQgPSB0aGlzLmxlbmd0aFxuICBpZiAodGFyZ2V0Lmxlbmd0aCAtIHRhcmdldFN0YXJ0IDwgZW5kIC0gc3RhcnQpIHtcbiAgICBlbmQgPSB0YXJnZXQubGVuZ3RoIC0gdGFyZ2V0U3RhcnQgKyBzdGFydFxuICB9XG5cbiAgdmFyIGxlbiA9IGVuZCAtIHN0YXJ0XG4gIHZhciBpXG5cbiAgaWYgKHRoaXMgPT09IHRhcmdldCAmJiBzdGFydCA8IHRhcmdldFN0YXJ0ICYmIHRhcmdldFN0YXJ0IDwgZW5kKSB7XG4gICAgLy8gZGVzY2VuZGluZyBjb3B5IGZyb20gZW5kXG4gICAgZm9yIChpID0gbGVuIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgIHRhcmdldFtpICsgdGFyZ2V0U3RhcnRdID0gdGhpc1tpICsgc3RhcnRdXG4gICAgfVxuICB9IGVsc2UgaWYgKGxlbiA8IDEwMDApIHtcbiAgICAvLyBhc2NlbmRpbmcgY29weSBmcm9tIHN0YXJ0XG4gICAgZm9yIChpID0gMDsgaSA8IGxlbjsgKytpKSB7XG4gICAgICB0YXJnZXRbaSArIHRhcmdldFN0YXJ0XSA9IHRoaXNbaSArIHN0YXJ0XVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBVaW50OEFycmF5LnByb3RvdHlwZS5zZXQuY2FsbChcbiAgICAgIHRhcmdldCxcbiAgICAgIHRoaXMuc3ViYXJyYXkoc3RhcnQsIHN0YXJ0ICsgbGVuKSxcbiAgICAgIHRhcmdldFN0YXJ0XG4gICAgKVxuICB9XG5cbiAgcmV0dXJuIGxlblxufVxuXG4vLyBVc2FnZTpcbi8vICAgIGJ1ZmZlci5maWxsKG51bWJlclssIG9mZnNldFssIGVuZF1dKVxuLy8gICAgYnVmZmVyLmZpbGwoYnVmZmVyWywgb2Zmc2V0WywgZW5kXV0pXG4vLyAgICBidWZmZXIuZmlsbChzdHJpbmdbLCBvZmZzZXRbLCBlbmRdXVssIGVuY29kaW5nXSlcbkJ1ZmZlci5wcm90b3R5cGUuZmlsbCA9IGZ1bmN0aW9uIGZpbGwgKHZhbCwgc3RhcnQsIGVuZCwgZW5jb2RpbmcpIHtcbiAgLy8gSGFuZGxlIHN0cmluZyBjYXNlczpcbiAgaWYgKHR5cGVvZiB2YWwgPT09ICdzdHJpbmcnKSB7XG4gICAgaWYgKHR5cGVvZiBzdGFydCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGVuY29kaW5nID0gc3RhcnRcbiAgICAgIHN0YXJ0ID0gMFxuICAgICAgZW5kID0gdGhpcy5sZW5ndGhcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBlbmQgPT09ICdzdHJpbmcnKSB7XG4gICAgICBlbmNvZGluZyA9IGVuZFxuICAgICAgZW5kID0gdGhpcy5sZW5ndGhcbiAgICB9XG4gICAgaWYgKHZhbC5sZW5ndGggPT09IDEpIHtcbiAgICAgIHZhciBjb2RlID0gdmFsLmNoYXJDb2RlQXQoMClcbiAgICAgIGlmIChjb2RlIDwgMjU2KSB7XG4gICAgICAgIHZhbCA9IGNvZGVcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGVuY29kaW5nICE9PSB1bmRlZmluZWQgJiYgdHlwZW9mIGVuY29kaW5nICE9PSAnc3RyaW5nJykge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignZW5jb2RpbmcgbXVzdCBiZSBhIHN0cmluZycpXG4gICAgfVxuICAgIGlmICh0eXBlb2YgZW5jb2RpbmcgPT09ICdzdHJpbmcnICYmICFCdWZmZXIuaXNFbmNvZGluZyhlbmNvZGluZykpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1Vua25vd24gZW5jb2Rpbmc6ICcgKyBlbmNvZGluZylcbiAgICB9XG4gIH0gZWxzZSBpZiAodHlwZW9mIHZhbCA9PT0gJ251bWJlcicpIHtcbiAgICB2YWwgPSB2YWwgJiAyNTVcbiAgfVxuXG4gIC8vIEludmFsaWQgcmFuZ2VzIGFyZSBub3Qgc2V0IHRvIGEgZGVmYXVsdCwgc28gY2FuIHJhbmdlIGNoZWNrIGVhcmx5LlxuICBpZiAoc3RhcnQgPCAwIHx8IHRoaXMubGVuZ3RoIDwgc3RhcnQgfHwgdGhpcy5sZW5ndGggPCBlbmQpIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignT3V0IG9mIHJhbmdlIGluZGV4JylcbiAgfVxuXG4gIGlmIChlbmQgPD0gc3RhcnQpIHtcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgc3RhcnQgPSBzdGFydCA+Pj4gMFxuICBlbmQgPSBlbmQgPT09IHVuZGVmaW5lZCA/IHRoaXMubGVuZ3RoIDogZW5kID4+PiAwXG5cbiAgaWYgKCF2YWwpIHZhbCA9IDBcblxuICB2YXIgaVxuICBpZiAodHlwZW9mIHZhbCA9PT0gJ251bWJlcicpIHtcbiAgICBmb3IgKGkgPSBzdGFydDsgaSA8IGVuZDsgKytpKSB7XG4gICAgICB0aGlzW2ldID0gdmFsXG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHZhciBieXRlcyA9IEJ1ZmZlci5pc0J1ZmZlcih2YWwpXG4gICAgICA/IHZhbFxuICAgICAgOiBuZXcgQnVmZmVyKHZhbCwgZW5jb2RpbmcpXG4gICAgdmFyIGxlbiA9IGJ5dGVzLmxlbmd0aFxuICAgIGZvciAoaSA9IDA7IGkgPCBlbmQgLSBzdGFydDsgKytpKSB7XG4gICAgICB0aGlzW2kgKyBzdGFydF0gPSBieXRlc1tpICUgbGVuXVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0aGlzXG59XG5cbi8vIEhFTFBFUiBGVU5DVElPTlNcbi8vID09PT09PT09PT09PT09PT1cblxudmFyIElOVkFMSURfQkFTRTY0X1JFID0gL1teKy8wLTlBLVphLXotX10vZ1xuXG5mdW5jdGlvbiBiYXNlNjRjbGVhbiAoc3RyKSB7XG4gIC8vIE5vZGUgc3RyaXBzIG91dCBpbnZhbGlkIGNoYXJhY3RlcnMgbGlrZSBcXG4gYW5kIFxcdCBmcm9tIHRoZSBzdHJpbmcsIGJhc2U2NC1qcyBkb2VzIG5vdFxuICBzdHIgPSBzdHJpbmd0cmltKHN0cikucmVwbGFjZShJTlZBTElEX0JBU0U2NF9SRSwgJycpXG4gIC8vIE5vZGUgY29udmVydHMgc3RyaW5ncyB3aXRoIGxlbmd0aCA8IDIgdG8gJydcbiAgaWYgKHN0ci5sZW5ndGggPCAyKSByZXR1cm4gJydcbiAgLy8gTm9kZSBhbGxvd3MgZm9yIG5vbi1wYWRkZWQgYmFzZTY0IHN0cmluZ3MgKG1pc3NpbmcgdHJhaWxpbmcgPT09KSwgYmFzZTY0LWpzIGRvZXMgbm90XG4gIHdoaWxlIChzdHIubGVuZ3RoICUgNCAhPT0gMCkge1xuICAgIHN0ciA9IHN0ciArICc9J1xuICB9XG4gIHJldHVybiBzdHJcbn1cblxuZnVuY3Rpb24gc3RyaW5ndHJpbSAoc3RyKSB7XG4gIGlmIChzdHIudHJpbSkgcmV0dXJuIHN0ci50cmltKClcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJylcbn1cblxuZnVuY3Rpb24gdG9IZXggKG4pIHtcbiAgaWYgKG4gPCAxNikgcmV0dXJuICcwJyArIG4udG9TdHJpbmcoMTYpXG4gIHJldHVybiBuLnRvU3RyaW5nKDE2KVxufVxuXG5mdW5jdGlvbiB1dGY4VG9CeXRlcyAoc3RyaW5nLCB1bml0cykge1xuICB1bml0cyA9IHVuaXRzIHx8IEluZmluaXR5XG4gIHZhciBjb2RlUG9pbnRcbiAgdmFyIGxlbmd0aCA9IHN0cmluZy5sZW5ndGhcbiAgdmFyIGxlYWRTdXJyb2dhdGUgPSBudWxsXG4gIHZhciBieXRlcyA9IFtdXG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7ICsraSkge1xuICAgIGNvZGVQb2ludCA9IHN0cmluZy5jaGFyQ29kZUF0KGkpXG5cbiAgICAvLyBpcyBzdXJyb2dhdGUgY29tcG9uZW50XG4gICAgaWYgKGNvZGVQb2ludCA+IDB4RDdGRiAmJiBjb2RlUG9pbnQgPCAweEUwMDApIHtcbiAgICAgIC8vIGxhc3QgY2hhciB3YXMgYSBsZWFkXG4gICAgICBpZiAoIWxlYWRTdXJyb2dhdGUpIHtcbiAgICAgICAgLy8gbm8gbGVhZCB5ZXRcbiAgICAgICAgaWYgKGNvZGVQb2ludCA+IDB4REJGRikge1xuICAgICAgICAgIC8vIHVuZXhwZWN0ZWQgdHJhaWxcbiAgICAgICAgICBpZiAoKHVuaXRzIC09IDMpID4gLTEpIGJ5dGVzLnB1c2goMHhFRiwgMHhCRiwgMHhCRClcbiAgICAgICAgICBjb250aW51ZVxuICAgICAgICB9IGVsc2UgaWYgKGkgKyAxID09PSBsZW5ndGgpIHtcbiAgICAgICAgICAvLyB1bnBhaXJlZCBsZWFkXG4gICAgICAgICAgaWYgKCh1bml0cyAtPSAzKSA+IC0xKSBieXRlcy5wdXNoKDB4RUYsIDB4QkYsIDB4QkQpXG4gICAgICAgICAgY29udGludWVcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHZhbGlkIGxlYWRcbiAgICAgICAgbGVhZFN1cnJvZ2F0ZSA9IGNvZGVQb2ludFxuXG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG5cbiAgICAgIC8vIDIgbGVhZHMgaW4gYSByb3dcbiAgICAgIGlmIChjb2RlUG9pbnQgPCAweERDMDApIHtcbiAgICAgICAgaWYgKCh1bml0cyAtPSAzKSA+IC0xKSBieXRlcy5wdXNoKDB4RUYsIDB4QkYsIDB4QkQpXG4gICAgICAgIGxlYWRTdXJyb2dhdGUgPSBjb2RlUG9pbnRcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgLy8gdmFsaWQgc3Vycm9nYXRlIHBhaXJcbiAgICAgIGNvZGVQb2ludCA9IChsZWFkU3Vycm9nYXRlIC0gMHhEODAwIDw8IDEwIHwgY29kZVBvaW50IC0gMHhEQzAwKSArIDB4MTAwMDBcbiAgICB9IGVsc2UgaWYgKGxlYWRTdXJyb2dhdGUpIHtcbiAgICAgIC8vIHZhbGlkIGJtcCBjaGFyLCBidXQgbGFzdCBjaGFyIHdhcyBhIGxlYWRcbiAgICAgIGlmICgodW5pdHMgLT0gMykgPiAtMSkgYnl0ZXMucHVzaCgweEVGLCAweEJGLCAweEJEKVxuICAgIH1cblxuICAgIGxlYWRTdXJyb2dhdGUgPSBudWxsXG5cbiAgICAvLyBlbmNvZGUgdXRmOFxuICAgIGlmIChjb2RlUG9pbnQgPCAweDgwKSB7XG4gICAgICBpZiAoKHVuaXRzIC09IDEpIDwgMCkgYnJlYWtcbiAgICAgIGJ5dGVzLnB1c2goY29kZVBvaW50KVxuICAgIH0gZWxzZSBpZiAoY29kZVBvaW50IDwgMHg4MDApIHtcbiAgICAgIGlmICgodW5pdHMgLT0gMikgPCAwKSBicmVha1xuICAgICAgYnl0ZXMucHVzaChcbiAgICAgICAgY29kZVBvaW50ID4+IDB4NiB8IDB4QzAsXG4gICAgICAgIGNvZGVQb2ludCAmIDB4M0YgfCAweDgwXG4gICAgICApXG4gICAgfSBlbHNlIGlmIChjb2RlUG9pbnQgPCAweDEwMDAwKSB7XG4gICAgICBpZiAoKHVuaXRzIC09IDMpIDwgMCkgYnJlYWtcbiAgICAgIGJ5dGVzLnB1c2goXG4gICAgICAgIGNvZGVQb2ludCA+PiAweEMgfCAweEUwLFxuICAgICAgICBjb2RlUG9pbnQgPj4gMHg2ICYgMHgzRiB8IDB4ODAsXG4gICAgICAgIGNvZGVQb2ludCAmIDB4M0YgfCAweDgwXG4gICAgICApXG4gICAgfSBlbHNlIGlmIChjb2RlUG9pbnQgPCAweDExMDAwMCkge1xuICAgICAgaWYgKCh1bml0cyAtPSA0KSA8IDApIGJyZWFrXG4gICAgICBieXRlcy5wdXNoKFxuICAgICAgICBjb2RlUG9pbnQgPj4gMHgxMiB8IDB4RjAsXG4gICAgICAgIGNvZGVQb2ludCA+PiAweEMgJiAweDNGIHwgMHg4MCxcbiAgICAgICAgY29kZVBvaW50ID4+IDB4NiAmIDB4M0YgfCAweDgwLFxuICAgICAgICBjb2RlUG9pbnQgJiAweDNGIHwgMHg4MFxuICAgICAgKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgY29kZSBwb2ludCcpXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGJ5dGVzXG59XG5cbmZ1bmN0aW9uIGFzY2lpVG9CeXRlcyAoc3RyKSB7XG4gIHZhciBieXRlQXJyYXkgPSBbXVxuICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7ICsraSkge1xuICAgIC8vIE5vZGUncyBjb2RlIHNlZW1zIHRvIGJlIGRvaW5nIHRoaXMgYW5kIG5vdCAmIDB4N0YuLlxuICAgIGJ5dGVBcnJheS5wdXNoKHN0ci5jaGFyQ29kZUF0KGkpICYgMHhGRilcbiAgfVxuICByZXR1cm4gYnl0ZUFycmF5XG59XG5cbmZ1bmN0aW9uIHV0ZjE2bGVUb0J5dGVzIChzdHIsIHVuaXRzKSB7XG4gIHZhciBjLCBoaSwgbG9cbiAgdmFyIGJ5dGVBcnJheSA9IFtdXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgKytpKSB7XG4gICAgaWYgKCh1bml0cyAtPSAyKSA8IDApIGJyZWFrXG5cbiAgICBjID0gc3RyLmNoYXJDb2RlQXQoaSlcbiAgICBoaSA9IGMgPj4gOFxuICAgIGxvID0gYyAlIDI1NlxuICAgIGJ5dGVBcnJheS5wdXNoKGxvKVxuICAgIGJ5dGVBcnJheS5wdXNoKGhpKVxuICB9XG5cbiAgcmV0dXJuIGJ5dGVBcnJheVxufVxuXG5mdW5jdGlvbiBiYXNlNjRUb0J5dGVzIChzdHIpIHtcbiAgcmV0dXJuIGJhc2U2NC50b0J5dGVBcnJheShiYXNlNjRjbGVhbihzdHIpKVxufVxuXG5mdW5jdGlvbiBibGl0QnVmZmVyIChzcmMsIGRzdCwgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7ICsraSkge1xuICAgIGlmICgoaSArIG9mZnNldCA+PSBkc3QubGVuZ3RoKSB8fCAoaSA+PSBzcmMubGVuZ3RoKSkgYnJlYWtcbiAgICBkc3RbaSArIG9mZnNldF0gPSBzcmNbaV1cbiAgfVxuICByZXR1cm4gaVxufVxuXG5mdW5jdGlvbiBpc25hbiAodmFsKSB7XG4gIHJldHVybiB2YWwgIT09IHZhbCAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXNlbGYtY29tcGFyZVxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIFwiMTAwXCI6IFwiQ29udGludWVcIixcbiAgXCIxMDFcIjogXCJTd2l0Y2hpbmcgUHJvdG9jb2xzXCIsXG4gIFwiMTAyXCI6IFwiUHJvY2Vzc2luZ1wiLFxuICBcIjIwMFwiOiBcIk9LXCIsXG4gIFwiMjAxXCI6IFwiQ3JlYXRlZFwiLFxuICBcIjIwMlwiOiBcIkFjY2VwdGVkXCIsXG4gIFwiMjAzXCI6IFwiTm9uLUF1dGhvcml0YXRpdmUgSW5mb3JtYXRpb25cIixcbiAgXCIyMDRcIjogXCJObyBDb250ZW50XCIsXG4gIFwiMjA1XCI6IFwiUmVzZXQgQ29udGVudFwiLFxuICBcIjIwNlwiOiBcIlBhcnRpYWwgQ29udGVudFwiLFxuICBcIjIwN1wiOiBcIk11bHRpLVN0YXR1c1wiLFxuICBcIjIwOFwiOiBcIkFscmVhZHkgUmVwb3J0ZWRcIixcbiAgXCIyMjZcIjogXCJJTSBVc2VkXCIsXG4gIFwiMzAwXCI6IFwiTXVsdGlwbGUgQ2hvaWNlc1wiLFxuICBcIjMwMVwiOiBcIk1vdmVkIFBlcm1hbmVudGx5XCIsXG4gIFwiMzAyXCI6IFwiRm91bmRcIixcbiAgXCIzMDNcIjogXCJTZWUgT3RoZXJcIixcbiAgXCIzMDRcIjogXCJOb3QgTW9kaWZpZWRcIixcbiAgXCIzMDVcIjogXCJVc2UgUHJveHlcIixcbiAgXCIzMDdcIjogXCJUZW1wb3JhcnkgUmVkaXJlY3RcIixcbiAgXCIzMDhcIjogXCJQZXJtYW5lbnQgUmVkaXJlY3RcIixcbiAgXCI0MDBcIjogXCJCYWQgUmVxdWVzdFwiLFxuICBcIjQwMVwiOiBcIlVuYXV0aG9yaXplZFwiLFxuICBcIjQwMlwiOiBcIlBheW1lbnQgUmVxdWlyZWRcIixcbiAgXCI0MDNcIjogXCJGb3JiaWRkZW5cIixcbiAgXCI0MDRcIjogXCJOb3QgRm91bmRcIixcbiAgXCI0MDVcIjogXCJNZXRob2QgTm90IEFsbG93ZWRcIixcbiAgXCI0MDZcIjogXCJOb3QgQWNjZXB0YWJsZVwiLFxuICBcIjQwN1wiOiBcIlByb3h5IEF1dGhlbnRpY2F0aW9uIFJlcXVpcmVkXCIsXG4gIFwiNDA4XCI6IFwiUmVxdWVzdCBUaW1lb3V0XCIsXG4gIFwiNDA5XCI6IFwiQ29uZmxpY3RcIixcbiAgXCI0MTBcIjogXCJHb25lXCIsXG4gIFwiNDExXCI6IFwiTGVuZ3RoIFJlcXVpcmVkXCIsXG4gIFwiNDEyXCI6IFwiUHJlY29uZGl0aW9uIEZhaWxlZFwiLFxuICBcIjQxM1wiOiBcIlBheWxvYWQgVG9vIExhcmdlXCIsXG4gIFwiNDE0XCI6IFwiVVJJIFRvbyBMb25nXCIsXG4gIFwiNDE1XCI6IFwiVW5zdXBwb3J0ZWQgTWVkaWEgVHlwZVwiLFxuICBcIjQxNlwiOiBcIlJhbmdlIE5vdCBTYXRpc2ZpYWJsZVwiLFxuICBcIjQxN1wiOiBcIkV4cGVjdGF0aW9uIEZhaWxlZFwiLFxuICBcIjQxOFwiOiBcIkknbSBhIHRlYXBvdFwiLFxuICBcIjQyMVwiOiBcIk1pc2RpcmVjdGVkIFJlcXVlc3RcIixcbiAgXCI0MjJcIjogXCJVbnByb2Nlc3NhYmxlIEVudGl0eVwiLFxuICBcIjQyM1wiOiBcIkxvY2tlZFwiLFxuICBcIjQyNFwiOiBcIkZhaWxlZCBEZXBlbmRlbmN5XCIsXG4gIFwiNDI1XCI6IFwiVW5vcmRlcmVkIENvbGxlY3Rpb25cIixcbiAgXCI0MjZcIjogXCJVcGdyYWRlIFJlcXVpcmVkXCIsXG4gIFwiNDI4XCI6IFwiUHJlY29uZGl0aW9uIFJlcXVpcmVkXCIsXG4gIFwiNDI5XCI6IFwiVG9vIE1hbnkgUmVxdWVzdHNcIixcbiAgXCI0MzFcIjogXCJSZXF1ZXN0IEhlYWRlciBGaWVsZHMgVG9vIExhcmdlXCIsXG4gIFwiNDUxXCI6IFwiVW5hdmFpbGFibGUgRm9yIExlZ2FsIFJlYXNvbnNcIixcbiAgXCI1MDBcIjogXCJJbnRlcm5hbCBTZXJ2ZXIgRXJyb3JcIixcbiAgXCI1MDFcIjogXCJOb3QgSW1wbGVtZW50ZWRcIixcbiAgXCI1MDJcIjogXCJCYWQgR2F0ZXdheVwiLFxuICBcIjUwM1wiOiBcIlNlcnZpY2UgVW5hdmFpbGFibGVcIixcbiAgXCI1MDRcIjogXCJHYXRld2F5IFRpbWVvdXRcIixcbiAgXCI1MDVcIjogXCJIVFRQIFZlcnNpb24gTm90IFN1cHBvcnRlZFwiLFxuICBcIjUwNlwiOiBcIlZhcmlhbnQgQWxzbyBOZWdvdGlhdGVzXCIsXG4gIFwiNTA3XCI6IFwiSW5zdWZmaWNpZW50IFN0b3JhZ2VcIixcbiAgXCI1MDhcIjogXCJMb29wIERldGVjdGVkXCIsXG4gIFwiNTA5XCI6IFwiQmFuZHdpZHRoIExpbWl0IEV4Y2VlZGVkXCIsXG4gIFwiNTEwXCI6IFwiTm90IEV4dGVuZGVkXCIsXG4gIFwiNTExXCI6IFwiTmV0d29yayBBdXRoZW50aWNhdGlvbiBSZXF1aXJlZFwiXG59XG4iLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxuLy8gTk9URTogVGhlc2UgdHlwZSBjaGVja2luZyBmdW5jdGlvbnMgaW50ZW50aW9uYWxseSBkb24ndCB1c2UgYGluc3RhbmNlb2ZgXG4vLyBiZWNhdXNlIGl0IGlzIGZyYWdpbGUgYW5kIGNhbiBiZSBlYXNpbHkgZmFrZWQgd2l0aCBgT2JqZWN0LmNyZWF0ZSgpYC5cblxuZnVuY3Rpb24gaXNBcnJheShhcmcpIHtcbiAgaWYgKEFycmF5LmlzQXJyYXkpIHtcbiAgICByZXR1cm4gQXJyYXkuaXNBcnJheShhcmcpO1xuICB9XG4gIHJldHVybiBvYmplY3RUb1N0cmluZyhhcmcpID09PSAnW29iamVjdCBBcnJheV0nO1xufVxuZXhwb3J0cy5pc0FycmF5ID0gaXNBcnJheTtcblxuZnVuY3Rpb24gaXNCb29sZWFuKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ2Jvb2xlYW4nO1xufVxuZXhwb3J0cy5pc0Jvb2xlYW4gPSBpc0Jvb2xlYW47XG5cbmZ1bmN0aW9uIGlzTnVsbChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gbnVsbDtcbn1cbmV4cG9ydHMuaXNOdWxsID0gaXNOdWxsO1xuXG5mdW5jdGlvbiBpc051bGxPclVuZGVmaW5lZChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PSBudWxsO1xufVxuZXhwb3J0cy5pc051bGxPclVuZGVmaW5lZCA9IGlzTnVsbE9yVW5kZWZpbmVkO1xuXG5mdW5jdGlvbiBpc051bWJlcihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdudW1iZXInO1xufVxuZXhwb3J0cy5pc051bWJlciA9IGlzTnVtYmVyO1xuXG5mdW5jdGlvbiBpc1N0cmluZyhhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdzdHJpbmcnO1xufVxuZXhwb3J0cy5pc1N0cmluZyA9IGlzU3RyaW5nO1xuXG5mdW5jdGlvbiBpc1N5bWJvbChhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdzeW1ib2wnO1xufVxuZXhwb3J0cy5pc1N5bWJvbCA9IGlzU3ltYm9sO1xuXG5mdW5jdGlvbiBpc1VuZGVmaW5lZChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gdm9pZCAwO1xufVxuZXhwb3J0cy5pc1VuZGVmaW5lZCA9IGlzVW5kZWZpbmVkO1xuXG5mdW5jdGlvbiBpc1JlZ0V4cChyZSkge1xuICByZXR1cm4gb2JqZWN0VG9TdHJpbmcocmUpID09PSAnW29iamVjdCBSZWdFeHBdJztcbn1cbmV4cG9ydHMuaXNSZWdFeHAgPSBpc1JlZ0V4cDtcblxuZnVuY3Rpb24gaXNPYmplY3QoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnb2JqZWN0JyAmJiBhcmcgIT09IG51bGw7XG59XG5leHBvcnRzLmlzT2JqZWN0ID0gaXNPYmplY3Q7XG5cbmZ1bmN0aW9uIGlzRGF0ZShkKSB7XG4gIHJldHVybiBvYmplY3RUb1N0cmluZyhkKSA9PT0gJ1tvYmplY3QgRGF0ZV0nO1xufVxuZXhwb3J0cy5pc0RhdGUgPSBpc0RhdGU7XG5cbmZ1bmN0aW9uIGlzRXJyb3IoZSkge1xuICByZXR1cm4gKG9iamVjdFRvU3RyaW5nKGUpID09PSAnW29iamVjdCBFcnJvcl0nIHx8IGUgaW5zdGFuY2VvZiBFcnJvcik7XG59XG5leHBvcnRzLmlzRXJyb3IgPSBpc0Vycm9yO1xuXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ2Z1bmN0aW9uJztcbn1cbmV4cG9ydHMuaXNGdW5jdGlvbiA9IGlzRnVuY3Rpb247XG5cbmZ1bmN0aW9uIGlzUHJpbWl0aXZlKGFyZykge1xuICByZXR1cm4gYXJnID09PSBudWxsIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnYm9vbGVhbicgfHxcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICdudW1iZXInIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnc3RyaW5nJyB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ3N5bWJvbCcgfHwgIC8vIEVTNiBzeW1ib2xcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICd1bmRlZmluZWQnO1xufVxuZXhwb3J0cy5pc1ByaW1pdGl2ZSA9IGlzUHJpbWl0aXZlO1xuXG5leHBvcnRzLmlzQnVmZmVyID0gQnVmZmVyLmlzQnVmZmVyO1xuXG5mdW5jdGlvbiBvYmplY3RUb1N0cmluZyhvKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwobyk7XG59XG4iLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxuZnVuY3Rpb24gRXZlbnRFbWl0dGVyKCkge1xuICB0aGlzLl9ldmVudHMgPSB0aGlzLl9ldmVudHMgfHwge307XG4gIHRoaXMuX21heExpc3RlbmVycyA9IHRoaXMuX21heExpc3RlbmVycyB8fCB1bmRlZmluZWQ7XG59XG5tb2R1bGUuZXhwb3J0cyA9IEV2ZW50RW1pdHRlcjtcblxuLy8gQmFja3dhcmRzLWNvbXBhdCB3aXRoIG5vZGUgMC4xMC54XG5FdmVudEVtaXR0ZXIuRXZlbnRFbWl0dGVyID0gRXZlbnRFbWl0dGVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9ldmVudHMgPSB1bmRlZmluZWQ7XG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9tYXhMaXN0ZW5lcnMgPSB1bmRlZmluZWQ7XG5cbi8vIEJ5IGRlZmF1bHQgRXZlbnRFbWl0dGVycyB3aWxsIHByaW50IGEgd2FybmluZyBpZiBtb3JlIHRoYW4gMTAgbGlzdGVuZXJzIGFyZVxuLy8gYWRkZWQgdG8gaXQuIFRoaXMgaXMgYSB1c2VmdWwgZGVmYXVsdCB3aGljaCBoZWxwcyBmaW5kaW5nIG1lbW9yeSBsZWFrcy5cbkV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzID0gMTA7XG5cbi8vIE9idmlvdXNseSBub3QgYWxsIEVtaXR0ZXJzIHNob3VsZCBiZSBsaW1pdGVkIHRvIDEwLiBUaGlzIGZ1bmN0aW9uIGFsbG93c1xuLy8gdGhhdCB0byBiZSBpbmNyZWFzZWQuIFNldCB0byB6ZXJvIGZvciB1bmxpbWl0ZWQuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnNldE1heExpc3RlbmVycyA9IGZ1bmN0aW9uKG4pIHtcbiAgaWYgKCFpc051bWJlcihuKSB8fCBuIDwgMCB8fCBpc05hTihuKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ24gbXVzdCBiZSBhIHBvc2l0aXZlIG51bWJlcicpO1xuICB0aGlzLl9tYXhMaXN0ZW5lcnMgPSBuO1xuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdmFyIGVyLCBoYW5kbGVyLCBsZW4sIGFyZ3MsIGksIGxpc3RlbmVycztcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcblxuICAvLyBJZiB0aGVyZSBpcyBubyAnZXJyb3InIGV2ZW50IGxpc3RlbmVyIHRoZW4gdGhyb3cuXG4gIGlmICh0eXBlID09PSAnZXJyb3InKSB7XG4gICAgaWYgKCF0aGlzLl9ldmVudHMuZXJyb3IgfHxcbiAgICAgICAgKGlzT2JqZWN0KHRoaXMuX2V2ZW50cy5lcnJvcikgJiYgIXRoaXMuX2V2ZW50cy5lcnJvci5sZW5ndGgpKSB7XG4gICAgICBlciA9IGFyZ3VtZW50c1sxXTtcbiAgICAgIGlmIChlciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgIHRocm93IGVyOyAvLyBVbmhhbmRsZWQgJ2Vycm9yJyBldmVudFxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gQXQgbGVhc3QgZ2l2ZSBzb21lIGtpbmQgb2YgY29udGV4dCB0byB0aGUgdXNlclxuICAgICAgICB2YXIgZXJyID0gbmV3IEVycm9yKCdVbmNhdWdodCwgdW5zcGVjaWZpZWQgXCJlcnJvclwiIGV2ZW50LiAoJyArIGVyICsgJyknKTtcbiAgICAgICAgZXJyLmNvbnRleHQgPSBlcjtcbiAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGhhbmRsZXIgPSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgaWYgKGlzVW5kZWZpbmVkKGhhbmRsZXIpKVxuICAgIHJldHVybiBmYWxzZTtcblxuICBpZiAoaXNGdW5jdGlvbihoYW5kbGVyKSkge1xuICAgIHN3aXRjaCAoYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgLy8gZmFzdCBjYXNlc1xuICAgICAgY2FzZSAxOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAyOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcywgYXJndW1lbnRzWzFdKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDM6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0sIGFyZ3VtZW50c1syXSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgLy8gc2xvd2VyXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICAgICAgaGFuZGxlci5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoaXNPYmplY3QoaGFuZGxlcikpIHtcbiAgICBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICBsaXN0ZW5lcnMgPSBoYW5kbGVyLnNsaWNlKCk7XG4gICAgbGVuID0gbGlzdGVuZXJzLmxlbmd0aDtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuOyBpKyspXG4gICAgICBsaXN0ZW5lcnNbaV0uYXBwbHkodGhpcywgYXJncyk7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICB2YXIgbTtcblxuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgdGhpcy5fZXZlbnRzID0ge307XG5cbiAgLy8gVG8gYXZvaWQgcmVjdXJzaW9uIGluIHRoZSBjYXNlIHRoYXQgdHlwZSA9PT0gXCJuZXdMaXN0ZW5lclwiISBCZWZvcmVcbiAgLy8gYWRkaW5nIGl0IHRvIHRoZSBsaXN0ZW5lcnMsIGZpcnN0IGVtaXQgXCJuZXdMaXN0ZW5lclwiLlxuICBpZiAodGhpcy5fZXZlbnRzLm5ld0xpc3RlbmVyKVxuICAgIHRoaXMuZW1pdCgnbmV3TGlzdGVuZXInLCB0eXBlLFxuICAgICAgICAgICAgICBpc0Z1bmN0aW9uKGxpc3RlbmVyLmxpc3RlbmVyKSA/XG4gICAgICAgICAgICAgIGxpc3RlbmVyLmxpc3RlbmVyIDogbGlzdGVuZXIpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIC8vIE9wdGltaXplIHRoZSBjYXNlIG9mIG9uZSBsaXN0ZW5lci4gRG9uJ3QgbmVlZCB0aGUgZXh0cmEgYXJyYXkgb2JqZWN0LlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXSA9IGxpc3RlbmVyO1xuICBlbHNlIGlmIChpc09iamVjdCh0aGlzLl9ldmVudHNbdHlwZV0pKVxuICAgIC8vIElmIHdlJ3ZlIGFscmVhZHkgZ290IGFuIGFycmF5LCBqdXN0IGFwcGVuZC5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0ucHVzaChsaXN0ZW5lcik7XG4gIGVsc2VcbiAgICAvLyBBZGRpbmcgdGhlIHNlY29uZCBlbGVtZW50LCBuZWVkIHRvIGNoYW5nZSB0byBhcnJheS5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0gPSBbdGhpcy5fZXZlbnRzW3R5cGVdLCBsaXN0ZW5lcl07XG5cbiAgLy8gQ2hlY2sgZm9yIGxpc3RlbmVyIGxlYWtcbiAgaWYgKGlzT2JqZWN0KHRoaXMuX2V2ZW50c1t0eXBlXSkgJiYgIXRoaXMuX2V2ZW50c1t0eXBlXS53YXJuZWQpIHtcbiAgICBpZiAoIWlzVW5kZWZpbmVkKHRoaXMuX21heExpc3RlbmVycykpIHtcbiAgICAgIG0gPSB0aGlzLl9tYXhMaXN0ZW5lcnM7XG4gICAgfSBlbHNlIHtcbiAgICAgIG0gPSBFdmVudEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycztcbiAgICB9XG5cbiAgICBpZiAobSAmJiBtID4gMCAmJiB0aGlzLl9ldmVudHNbdHlwZV0ubGVuZ3RoID4gbSkge1xuICAgICAgdGhpcy5fZXZlbnRzW3R5cGVdLndhcm5lZCA9IHRydWU7XG4gICAgICBjb25zb2xlLmVycm9yKCcobm9kZSkgd2FybmluZzogcG9zc2libGUgRXZlbnRFbWl0dGVyIG1lbW9yeSAnICtcbiAgICAgICAgICAgICAgICAgICAgJ2xlYWsgZGV0ZWN0ZWQuICVkIGxpc3RlbmVycyBhZGRlZC4gJyArXG4gICAgICAgICAgICAgICAgICAgICdVc2UgZW1pdHRlci5zZXRNYXhMaXN0ZW5lcnMoKSB0byBpbmNyZWFzZSBsaW1pdC4nLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9ldmVudHNbdHlwZV0ubGVuZ3RoKTtcbiAgICAgIGlmICh0eXBlb2YgY29uc29sZS50cmFjZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAvLyBub3Qgc3VwcG9ydGVkIGluIElFIDEwXG4gICAgICAgIGNvbnNvbGUudHJhY2UoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub24gPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgdmFyIGZpcmVkID0gZmFsc2U7XG5cbiAgZnVuY3Rpb24gZygpIHtcbiAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGcpO1xuXG4gICAgaWYgKCFmaXJlZCkge1xuICAgICAgZmlyZWQgPSB0cnVlO1xuICAgICAgbGlzdGVuZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG4gIH1cblxuICBnLmxpc3RlbmVyID0gbGlzdGVuZXI7XG4gIHRoaXMub24odHlwZSwgZyk7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vLyBlbWl0cyBhICdyZW1vdmVMaXN0ZW5lcicgZXZlbnQgaWZmIHRoZSBsaXN0ZW5lciB3YXMgcmVtb3ZlZFxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIHZhciBsaXN0LCBwb3NpdGlvbiwgbGVuZ3RoLCBpO1xuXG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIHJldHVybiB0aGlzO1xuXG4gIGxpc3QgPSB0aGlzLl9ldmVudHNbdHlwZV07XG4gIGxlbmd0aCA9IGxpc3QubGVuZ3RoO1xuICBwb3NpdGlvbiA9IC0xO1xuXG4gIGlmIChsaXN0ID09PSBsaXN0ZW5lciB8fFxuICAgICAgKGlzRnVuY3Rpb24obGlzdC5saXN0ZW5lcikgJiYgbGlzdC5saXN0ZW5lciA9PT0gbGlzdGVuZXIpKSB7XG4gICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICBpZiAodGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKVxuICAgICAgdGhpcy5lbWl0KCdyZW1vdmVMaXN0ZW5lcicsIHR5cGUsIGxpc3RlbmVyKTtcblxuICB9IGVsc2UgaWYgKGlzT2JqZWN0KGxpc3QpKSB7XG4gICAgZm9yIChpID0gbGVuZ3RoOyBpLS0gPiAwOykge1xuICAgICAgaWYgKGxpc3RbaV0gPT09IGxpc3RlbmVyIHx8XG4gICAgICAgICAgKGxpc3RbaV0ubGlzdGVuZXIgJiYgbGlzdFtpXS5saXN0ZW5lciA9PT0gbGlzdGVuZXIpKSB7XG4gICAgICAgIHBvc2l0aW9uID0gaTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHBvc2l0aW9uIDwgMClcbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgaWYgKGxpc3QubGVuZ3RoID09PSAxKSB7XG4gICAgICBsaXN0Lmxlbmd0aCA9IDA7XG4gICAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIH0gZWxzZSB7XG4gICAgICBsaXN0LnNwbGljZShwb3NpdGlvbiwgMSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcilcbiAgICAgIHRoaXMuZW1pdCgncmVtb3ZlTGlzdGVuZXInLCB0eXBlLCBsaXN0ZW5lcik7XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlQWxsTGlzdGVuZXJzID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIga2V5LCBsaXN0ZW5lcnM7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgcmV0dXJuIHRoaXM7XG5cbiAgLy8gbm90IGxpc3RlbmluZyBmb3IgcmVtb3ZlTGlzdGVuZXIsIG5vIG5lZWQgdG8gZW1pdFxuICBpZiAoIXRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcikge1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKVxuICAgICAgdGhpcy5fZXZlbnRzID0ge307XG4gICAgZWxzZSBpZiAodGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIGVtaXQgcmVtb3ZlTGlzdGVuZXIgZm9yIGFsbCBsaXN0ZW5lcnMgb24gYWxsIGV2ZW50c1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgIGZvciAoa2V5IGluIHRoaXMuX2V2ZW50cykge1xuICAgICAgaWYgKGtleSA9PT0gJ3JlbW92ZUxpc3RlbmVyJykgY29udGludWU7XG4gICAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycyhrZXkpO1xuICAgIH1cbiAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycygncmVtb3ZlTGlzdGVuZXInKTtcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGxpc3RlbmVycyA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICBpZiAoaXNGdW5jdGlvbihsaXN0ZW5lcnMpKSB7XG4gICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcnMpO1xuICB9IGVsc2UgaWYgKGxpc3RlbmVycykge1xuICAgIC8vIExJRk8gb3JkZXJcbiAgICB3aGlsZSAobGlzdGVuZXJzLmxlbmd0aClcbiAgICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXJzW2xpc3RlbmVycy5sZW5ndGggLSAxXSk7XG4gIH1cbiAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJzID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIgcmV0O1xuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIHJldCA9IFtdO1xuICBlbHNlIGlmIChpc0Z1bmN0aW9uKHRoaXMuX2V2ZW50c1t0eXBlXSkpXG4gICAgcmV0ID0gW3RoaXMuX2V2ZW50c1t0eXBlXV07XG4gIGVsc2VcbiAgICByZXQgPSB0aGlzLl9ldmVudHNbdHlwZV0uc2xpY2UoKTtcbiAgcmV0dXJuIHJldDtcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJDb3VudCA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgaWYgKHRoaXMuX2V2ZW50cykge1xuICAgIHZhciBldmxpc3RlbmVyID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gICAgaWYgKGlzRnVuY3Rpb24oZXZsaXN0ZW5lcikpXG4gICAgICByZXR1cm4gMTtcbiAgICBlbHNlIGlmIChldmxpc3RlbmVyKVxuICAgICAgcmV0dXJuIGV2bGlzdGVuZXIubGVuZ3RoO1xuICB9XG4gIHJldHVybiAwO1xufTtcblxuRXZlbnRFbWl0dGVyLmxpc3RlbmVyQ291bnQgPSBmdW5jdGlvbihlbWl0dGVyLCB0eXBlKSB7XG4gIHJldHVybiBlbWl0dGVyLmxpc3RlbmVyQ291bnQodHlwZSk7XG59O1xuXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ2Z1bmN0aW9uJztcbn1cblxuZnVuY3Rpb24gaXNOdW1iZXIoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnbnVtYmVyJztcbn1cblxuZnVuY3Rpb24gaXNPYmplY3QoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnb2JqZWN0JyAmJiBhcmcgIT09IG51bGw7XG59XG5cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09PSB2b2lkIDA7XG59XG4iLCJleHBvcnRzLnJlYWQgPSBmdW5jdGlvbiAoYnVmZmVyLCBvZmZzZXQsIGlzTEUsIG1MZW4sIG5CeXRlcykge1xuICB2YXIgZSwgbVxuICB2YXIgZUxlbiA9IG5CeXRlcyAqIDggLSBtTGVuIC0gMVxuICB2YXIgZU1heCA9ICgxIDw8IGVMZW4pIC0gMVxuICB2YXIgZUJpYXMgPSBlTWF4ID4+IDFcbiAgdmFyIG5CaXRzID0gLTdcbiAgdmFyIGkgPSBpc0xFID8gKG5CeXRlcyAtIDEpIDogMFxuICB2YXIgZCA9IGlzTEUgPyAtMSA6IDFcbiAgdmFyIHMgPSBidWZmZXJbb2Zmc2V0ICsgaV1cblxuICBpICs9IGRcblxuICBlID0gcyAmICgoMSA8PCAoLW5CaXRzKSkgLSAxKVxuICBzID4+PSAoLW5CaXRzKVxuICBuQml0cyArPSBlTGVuXG4gIGZvciAoOyBuQml0cyA+IDA7IGUgPSBlICogMjU2ICsgYnVmZmVyW29mZnNldCArIGldLCBpICs9IGQsIG5CaXRzIC09IDgpIHt9XG5cbiAgbSA9IGUgJiAoKDEgPDwgKC1uQml0cykpIC0gMSlcbiAgZSA+Pj0gKC1uQml0cylcbiAgbkJpdHMgKz0gbUxlblxuICBmb3IgKDsgbkJpdHMgPiAwOyBtID0gbSAqIDI1NiArIGJ1ZmZlcltvZmZzZXQgKyBpXSwgaSArPSBkLCBuQml0cyAtPSA4KSB7fVxuXG4gIGlmIChlID09PSAwKSB7XG4gICAgZSA9IDEgLSBlQmlhc1xuICB9IGVsc2UgaWYgKGUgPT09IGVNYXgpIHtcbiAgICByZXR1cm4gbSA/IE5hTiA6ICgocyA/IC0xIDogMSkgKiBJbmZpbml0eSlcbiAgfSBlbHNlIHtcbiAgICBtID0gbSArIE1hdGgucG93KDIsIG1MZW4pXG4gICAgZSA9IGUgLSBlQmlhc1xuICB9XG4gIHJldHVybiAocyA/IC0xIDogMSkgKiBtICogTWF0aC5wb3coMiwgZSAtIG1MZW4pXG59XG5cbmV4cG9ydHMud3JpdGUgPSBmdW5jdGlvbiAoYnVmZmVyLCB2YWx1ZSwgb2Zmc2V0LCBpc0xFLCBtTGVuLCBuQnl0ZXMpIHtcbiAgdmFyIGUsIG0sIGNcbiAgdmFyIGVMZW4gPSBuQnl0ZXMgKiA4IC0gbUxlbiAtIDFcbiAgdmFyIGVNYXggPSAoMSA8PCBlTGVuKSAtIDFcbiAgdmFyIGVCaWFzID0gZU1heCA+PiAxXG4gIHZhciBydCA9IChtTGVuID09PSAyMyA/IE1hdGgucG93KDIsIC0yNCkgLSBNYXRoLnBvdygyLCAtNzcpIDogMClcbiAgdmFyIGkgPSBpc0xFID8gMCA6IChuQnl0ZXMgLSAxKVxuICB2YXIgZCA9IGlzTEUgPyAxIDogLTFcbiAgdmFyIHMgPSB2YWx1ZSA8IDAgfHwgKHZhbHVlID09PSAwICYmIDEgLyB2YWx1ZSA8IDApID8gMSA6IDBcblxuICB2YWx1ZSA9IE1hdGguYWJzKHZhbHVlKVxuXG4gIGlmIChpc05hTih2YWx1ZSkgfHwgdmFsdWUgPT09IEluZmluaXR5KSB7XG4gICAgbSA9IGlzTmFOKHZhbHVlKSA/IDEgOiAwXG4gICAgZSA9IGVNYXhcbiAgfSBlbHNlIHtcbiAgICBlID0gTWF0aC5mbG9vcihNYXRoLmxvZyh2YWx1ZSkgLyBNYXRoLkxOMilcbiAgICBpZiAodmFsdWUgKiAoYyA9IE1hdGgucG93KDIsIC1lKSkgPCAxKSB7XG4gICAgICBlLS1cbiAgICAgIGMgKj0gMlxuICAgIH1cbiAgICBpZiAoZSArIGVCaWFzID49IDEpIHtcbiAgICAgIHZhbHVlICs9IHJ0IC8gY1xuICAgIH0gZWxzZSB7XG4gICAgICB2YWx1ZSArPSBydCAqIE1hdGgucG93KDIsIDEgLSBlQmlhcylcbiAgICB9XG4gICAgaWYgKHZhbHVlICogYyA+PSAyKSB7XG4gICAgICBlKytcbiAgICAgIGMgLz0gMlxuICAgIH1cblxuICAgIGlmIChlICsgZUJpYXMgPj0gZU1heCkge1xuICAgICAgbSA9IDBcbiAgICAgIGUgPSBlTWF4XG4gICAgfSBlbHNlIGlmIChlICsgZUJpYXMgPj0gMSkge1xuICAgICAgbSA9ICh2YWx1ZSAqIGMgLSAxKSAqIE1hdGgucG93KDIsIG1MZW4pXG4gICAgICBlID0gZSArIGVCaWFzXG4gICAgfSBlbHNlIHtcbiAgICAgIG0gPSB2YWx1ZSAqIE1hdGgucG93KDIsIGVCaWFzIC0gMSkgKiBNYXRoLnBvdygyLCBtTGVuKVxuICAgICAgZSA9IDBcbiAgICB9XG4gIH1cblxuICBmb3IgKDsgbUxlbiA+PSA4OyBidWZmZXJbb2Zmc2V0ICsgaV0gPSBtICYgMHhmZiwgaSArPSBkLCBtIC89IDI1NiwgbUxlbiAtPSA4KSB7fVxuXG4gIGUgPSAoZSA8PCBtTGVuKSB8IG1cbiAgZUxlbiArPSBtTGVuXG4gIGZvciAoOyBlTGVuID4gMDsgYnVmZmVyW29mZnNldCArIGldID0gZSAmIDB4ZmYsIGkgKz0gZCwgZSAvPSAyNTYsIGVMZW4gLT0gOCkge31cblxuICBidWZmZXJbb2Zmc2V0ICsgaSAtIGRdIHw9IHMgKiAxMjhcbn1cbiIsImlmICh0eXBlb2YgT2JqZWN0LmNyZWF0ZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAvLyBpbXBsZW1lbnRhdGlvbiBmcm9tIHN0YW5kYXJkIG5vZGUuanMgJ3V0aWwnIG1vZHVsZVxuICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGluaGVyaXRzKGN0b3IsIHN1cGVyQ3Rvcikge1xuICAgIGN0b3Iuc3VwZXJfID0gc3VwZXJDdG9yXG4gICAgY3Rvci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ3Rvci5wcm90b3R5cGUsIHtcbiAgICAgIGNvbnN0cnVjdG9yOiB7XG4gICAgICAgIHZhbHVlOiBjdG9yLFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgfVxuICAgIH0pO1xuICB9O1xufSBlbHNlIHtcbiAgLy8gb2xkIHNjaG9vbCBzaGltIGZvciBvbGQgYnJvd3NlcnNcbiAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpbmhlcml0cyhjdG9yLCBzdXBlckN0b3IpIHtcbiAgICBjdG9yLnN1cGVyXyA9IHN1cGVyQ3RvclxuICAgIHZhciBUZW1wQ3RvciA9IGZ1bmN0aW9uICgpIHt9XG4gICAgVGVtcEN0b3IucHJvdG90eXBlID0gc3VwZXJDdG9yLnByb3RvdHlwZVxuICAgIGN0b3IucHJvdG90eXBlID0gbmV3IFRlbXBDdG9yKClcbiAgICBjdG9yLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGN0b3JcbiAgfVxufVxuIiwiLyohXG4gKiBEZXRlcm1pbmUgaWYgYW4gb2JqZWN0IGlzIGEgQnVmZmVyXG4gKlxuICogQGF1dGhvciAgIEZlcm9zcyBBYm91a2hhZGlqZWggPGZlcm9zc0BmZXJvc3Mub3JnPiA8aHR0cDovL2Zlcm9zcy5vcmc+XG4gKiBAbGljZW5zZSAgTUlUXG4gKi9cblxuLy8gVGhlIF9pc0J1ZmZlciBjaGVjayBpcyBmb3IgU2FmYXJpIDUtNyBzdXBwb3J0LCBiZWNhdXNlIGl0J3MgbWlzc2luZ1xuLy8gT2JqZWN0LnByb3RvdHlwZS5jb25zdHJ1Y3Rvci4gUmVtb3ZlIHRoaXMgZXZlbnR1YWxseVxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAob2JqKSB7XG4gIHJldHVybiBvYmogIT0gbnVsbCAmJiAoaXNCdWZmZXIob2JqKSB8fCBpc1Nsb3dCdWZmZXIob2JqKSB8fCAhIW9iai5faXNCdWZmZXIpXG59XG5cbmZ1bmN0aW9uIGlzQnVmZmVyIChvYmopIHtcbiAgcmV0dXJuICEhb2JqLmNvbnN0cnVjdG9yICYmIHR5cGVvZiBvYmouY29uc3RydWN0b3IuaXNCdWZmZXIgPT09ICdmdW5jdGlvbicgJiYgb2JqLmNvbnN0cnVjdG9yLmlzQnVmZmVyKG9iailcbn1cblxuLy8gRm9yIE5vZGUgdjAuMTAgc3VwcG9ydC4gUmVtb3ZlIHRoaXMgZXZlbnR1YWxseS5cbmZ1bmN0aW9uIGlzU2xvd0J1ZmZlciAob2JqKSB7XG4gIHJldHVybiB0eXBlb2Ygb2JqLnJlYWRGbG9hdExFID09PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBvYmouc2xpY2UgPT09ICdmdW5jdGlvbicgJiYgaXNCdWZmZXIob2JqLnNsaWNlKDAsIDApKVxufVxuIiwidmFyIHRvU3RyaW5nID0ge30udG9TdHJpbmc7XG5cbm1vZHVsZS5leHBvcnRzID0gQXJyYXkuaXNBcnJheSB8fCBmdW5jdGlvbiAoYXJyKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKGFycikgPT0gJ1tvYmplY3QgQXJyYXldJztcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbmlmICghcHJvY2Vzcy52ZXJzaW9uIHx8XG4gICAgcHJvY2Vzcy52ZXJzaW9uLmluZGV4T2YoJ3YwLicpID09PSAwIHx8XG4gICAgcHJvY2Vzcy52ZXJzaW9uLmluZGV4T2YoJ3YxLicpID09PSAwICYmIHByb2Nlc3MudmVyc2lvbi5pbmRleE9mKCd2MS44LicpICE9PSAwKSB7XG4gIG1vZHVsZS5leHBvcnRzID0gbmV4dFRpY2s7XG59IGVsc2Uge1xuICBtb2R1bGUuZXhwb3J0cyA9IHByb2Nlc3MubmV4dFRpY2s7XG59XG5cbmZ1bmN0aW9uIG5leHRUaWNrKGZuLCBhcmcxLCBhcmcyLCBhcmczKSB7XG4gIGlmICh0eXBlb2YgZm4gIT09ICdmdW5jdGlvbicpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdcImNhbGxiYWNrXCIgYXJndW1lbnQgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG4gIH1cbiAgdmFyIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gIHZhciBhcmdzLCBpO1xuICBzd2l0Y2ggKGxlbikge1xuICBjYXNlIDA6XG4gIGNhc2UgMTpcbiAgICByZXR1cm4gcHJvY2Vzcy5uZXh0VGljayhmbik7XG4gIGNhc2UgMjpcbiAgICByZXR1cm4gcHJvY2Vzcy5uZXh0VGljayhmdW5jdGlvbiBhZnRlclRpY2tPbmUoKSB7XG4gICAgICBmbi5jYWxsKG51bGwsIGFyZzEpO1xuICAgIH0pO1xuICBjYXNlIDM6XG4gICAgcmV0dXJuIHByb2Nlc3MubmV4dFRpY2soZnVuY3Rpb24gYWZ0ZXJUaWNrVHdvKCkge1xuICAgICAgZm4uY2FsbChudWxsLCBhcmcxLCBhcmcyKTtcbiAgICB9KTtcbiAgY2FzZSA0OlxuICAgIHJldHVybiBwcm9jZXNzLm5leHRUaWNrKGZ1bmN0aW9uIGFmdGVyVGlja1RocmVlKCkge1xuICAgICAgZm4uY2FsbChudWxsLCBhcmcxLCBhcmcyLCBhcmczKTtcbiAgICB9KTtcbiAgZGVmYXVsdDpcbiAgICBhcmdzID0gbmV3IEFycmF5KGxlbiAtIDEpO1xuICAgIGkgPSAwO1xuICAgIHdoaWxlIChpIDwgYXJncy5sZW5ndGgpIHtcbiAgICAgIGFyZ3NbaSsrXSA9IGFyZ3VtZW50c1tpXTtcbiAgICB9XG4gICAgcmV0dXJuIHByb2Nlc3MubmV4dFRpY2soZnVuY3Rpb24gYWZ0ZXJUaWNrKCkge1xuICAgICAgZm4uYXBwbHkobnVsbCwgYXJncyk7XG4gICAgfSk7XG4gIH1cbn1cbiIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG4vLyBjYWNoZWQgZnJvbSB3aGF0ZXZlciBnbG9iYWwgaXMgcHJlc2VudCBzbyB0aGF0IHRlc3QgcnVubmVycyB0aGF0IHN0dWIgaXRcbi8vIGRvbid0IGJyZWFrIHRoaW5ncy4gIEJ1dCB3ZSBuZWVkIHRvIHdyYXAgaXQgaW4gYSB0cnkgY2F0Y2ggaW4gY2FzZSBpdCBpc1xuLy8gd3JhcHBlZCBpbiBzdHJpY3QgbW9kZSBjb2RlIHdoaWNoIGRvZXNuJ3QgZGVmaW5lIGFueSBnbG9iYWxzLiAgSXQncyBpbnNpZGUgYVxuLy8gZnVuY3Rpb24gYmVjYXVzZSB0cnkvY2F0Y2hlcyBkZW9wdGltaXplIGluIGNlcnRhaW4gZW5naW5lcy5cblxudmFyIGNhY2hlZFNldFRpbWVvdXQ7XG52YXIgY2FjaGVkQ2xlYXJUaW1lb3V0O1xuXG5mdW5jdGlvbiBkZWZhdWx0U2V0VGltb3V0KCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc2V0VGltZW91dCBoYXMgbm90IGJlZW4gZGVmaW5lZCcpO1xufVxuZnVuY3Rpb24gZGVmYXVsdENsZWFyVGltZW91dCAoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdjbGVhclRpbWVvdXQgaGFzIG5vdCBiZWVuIGRlZmluZWQnKTtcbn1cbihmdW5jdGlvbiAoKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiBzZXRUaW1lb3V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBkZWZhdWx0U2V0VGltb3V0O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gZGVmYXVsdFNldFRpbW91dDtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiBjbGVhclRpbWVvdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGRlZmF1bHRDbGVhclRpbWVvdXQ7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGRlZmF1bHRDbGVhclRpbWVvdXQ7XG4gICAgfVxufSAoKSlcbmZ1bmN0aW9uIHJ1blRpbWVvdXQoZnVuKSB7XG4gICAgaWYgKGNhY2hlZFNldFRpbWVvdXQgPT09IHNldFRpbWVvdXQpIHtcbiAgICAgICAgLy9ub3JtYWwgZW52aXJvbWVudHMgaW4gc2FuZSBzaXR1YXRpb25zXG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfVxuICAgIC8vIGlmIHNldFRpbWVvdXQgd2Fzbid0IGF2YWlsYWJsZSBidXQgd2FzIGxhdHRlciBkZWZpbmVkXG4gICAgaWYgKChjYWNoZWRTZXRUaW1lb3V0ID09PSBkZWZhdWx0U2V0VGltb3V0IHx8ICFjYWNoZWRTZXRUaW1lb3V0KSAmJiBzZXRUaW1lb3V0KSB7XG4gICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW4sIDApO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB3aGVuIHdoZW4gc29tZWJvZHkgaGFzIHNjcmV3ZWQgd2l0aCBzZXRUaW1lb3V0IGJ1dCBubyBJLkUuIG1hZGRuZXNzXG4gICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfSBjYXRjaChlKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gd2UgYXJlIGluIEkuRS4gYnV0IHRoZSBzY3JpcHQgaGFzIGJlZW4gZXZhbGVkIHNvIEkuRS4gZG9lc24ndCB0cnVzdCB0aGUgZ2xvYmFsIG9iamVjdCB3aGVuIGNhbGxlZCBub3JtYWxseVxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQuY2FsbChudWxsLCBmdW4sIDApO1xuICAgICAgICB9IGNhdGNoKGUpe1xuICAgICAgICAgICAgLy8gc2FtZSBhcyBhYm92ZSBidXQgd2hlbiBpdCdzIGEgdmVyc2lvbiBvZiBJLkUuIHRoYXQgbXVzdCBoYXZlIHRoZSBnbG9iYWwgb2JqZWN0IGZvciAndGhpcycsIGhvcGZ1bGx5IG91ciBjb250ZXh0IGNvcnJlY3Qgb3RoZXJ3aXNlIGl0IHdpbGwgdGhyb3cgYSBnbG9iYWwgZXJyb3JcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0LmNhbGwodGhpcywgZnVuLCAwKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG59XG5mdW5jdGlvbiBydW5DbGVhclRpbWVvdXQobWFya2VyKSB7XG4gICAgaWYgKGNhY2hlZENsZWFyVGltZW91dCA9PT0gY2xlYXJUaW1lb3V0KSB7XG4gICAgICAgIC8vbm9ybWFsIGVudmlyb21lbnRzIGluIHNhbmUgc2l0dWF0aW9uc1xuICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfVxuICAgIC8vIGlmIGNsZWFyVGltZW91dCB3YXNuJ3QgYXZhaWxhYmxlIGJ1dCB3YXMgbGF0dGVyIGRlZmluZWRcbiAgICBpZiAoKGNhY2hlZENsZWFyVGltZW91dCA9PT0gZGVmYXVsdENsZWFyVGltZW91dCB8fCAhY2FjaGVkQ2xlYXJUaW1lb3V0KSAmJiBjbGVhclRpbWVvdXQpIHtcbiAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gY2xlYXJUaW1lb3V0O1xuICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIC8vIHdoZW4gd2hlbiBzb21lYm9keSBoYXMgc2NyZXdlZCB3aXRoIHNldFRpbWVvdXQgYnV0IG5vIEkuRS4gbWFkZG5lc3NcbiAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gV2hlbiB3ZSBhcmUgaW4gSS5FLiBidXQgdGhlIHNjcmlwdCBoYXMgYmVlbiBldmFsZWQgc28gSS5FLiBkb2Vzbid0ICB0cnVzdCB0aGUgZ2xvYmFsIG9iamVjdCB3aGVuIGNhbGxlZCBub3JtYWxseVxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dC5jYWxsKG51bGwsIG1hcmtlcik7XG4gICAgICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICAgICAgLy8gc2FtZSBhcyBhYm92ZSBidXQgd2hlbiBpdCdzIGEgdmVyc2lvbiBvZiBJLkUuIHRoYXQgbXVzdCBoYXZlIHRoZSBnbG9iYWwgb2JqZWN0IGZvciAndGhpcycsIGhvcGZ1bGx5IG91ciBjb250ZXh0IGNvcnJlY3Qgb3RoZXJ3aXNlIGl0IHdpbGwgdGhyb3cgYSBnbG9iYWwgZXJyb3IuXG4gICAgICAgICAgICAvLyBTb21lIHZlcnNpb25zIG9mIEkuRS4gaGF2ZSBkaWZmZXJlbnQgcnVsZXMgZm9yIGNsZWFyVGltZW91dCB2cyBzZXRUaW1lb3V0XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0LmNhbGwodGhpcywgbWFya2VyKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG5cbn1cbnZhciBxdWV1ZSA9IFtdO1xudmFyIGRyYWluaW5nID0gZmFsc2U7XG52YXIgY3VycmVudFF1ZXVlO1xudmFyIHF1ZXVlSW5kZXggPSAtMTtcblxuZnVuY3Rpb24gY2xlYW5VcE5leHRUaWNrKCkge1xuICAgIGlmICghZHJhaW5pbmcgfHwgIWN1cnJlbnRRdWV1ZSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgaWYgKGN1cnJlbnRRdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgcXVldWUgPSBjdXJyZW50UXVldWUuY29uY2F0KHF1ZXVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgfVxuICAgIGlmIChxdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgZHJhaW5RdWV1ZSgpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZHJhaW5RdWV1ZSgpIHtcbiAgICBpZiAoZHJhaW5pbmcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgdGltZW91dCA9IHJ1blRpbWVvdXQoY2xlYW5VcE5leHRUaWNrKTtcbiAgICBkcmFpbmluZyA9IHRydWU7XG5cbiAgICB2YXIgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIHdoaWxlKGxlbikge1xuICAgICAgICBjdXJyZW50UXVldWUgPSBxdWV1ZTtcbiAgICAgICAgcXVldWUgPSBbXTtcbiAgICAgICAgd2hpbGUgKCsrcXVldWVJbmRleCA8IGxlbikge1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRRdWV1ZSkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRRdWV1ZVtxdWV1ZUluZGV4XS5ydW4oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgICAgIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB9XG4gICAgY3VycmVudFF1ZXVlID0gbnVsbDtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIHJ1bkNsZWFyVGltZW91dCh0aW1lb3V0KTtcbn1cblxucHJvY2Vzcy5uZXh0VGljayA9IGZ1bmN0aW9uIChmdW4pIHtcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoIC0gMSk7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBxdWV1ZS5wdXNoKG5ldyBJdGVtKGZ1biwgYXJncykpO1xuICAgIGlmIChxdWV1ZS5sZW5ndGggPT09IDEgJiYgIWRyYWluaW5nKSB7XG4gICAgICAgIHJ1blRpbWVvdXQoZHJhaW5RdWV1ZSk7XG4gICAgfVxufTtcblxuLy8gdjggbGlrZXMgcHJlZGljdGlibGUgb2JqZWN0c1xuZnVuY3Rpb24gSXRlbShmdW4sIGFycmF5KSB7XG4gICAgdGhpcy5mdW4gPSBmdW47XG4gICAgdGhpcy5hcnJheSA9IGFycmF5O1xufVxuSXRlbS5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZnVuLmFwcGx5KG51bGwsIHRoaXMuYXJyYXkpO1xufTtcbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xucHJvY2Vzcy52ZXJzaW9uID0gJyc7IC8vIGVtcHR5IHN0cmluZyB0byBhdm9pZCByZWdleHAgaXNzdWVzXG5wcm9jZXNzLnZlcnNpb25zID0ge307XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbnByb2Nlc3MudW1hc2sgPSBmdW5jdGlvbigpIHsgcmV0dXJuIDA7IH07XG4iLCIvKiEgaHR0cHM6Ly9tdGhzLmJlL3B1bnljb2RlIHYxLjQuMSBieSBAbWF0aGlhcyAqL1xuOyhmdW5jdGlvbihyb290KSB7XG5cblx0LyoqIERldGVjdCBmcmVlIHZhcmlhYmxlcyAqL1xuXHR2YXIgZnJlZUV4cG9ydHMgPSB0eXBlb2YgZXhwb3J0cyA9PSAnb2JqZWN0JyAmJiBleHBvcnRzICYmXG5cdFx0IWV4cG9ydHMubm9kZVR5cGUgJiYgZXhwb3J0cztcblx0dmFyIGZyZWVNb2R1bGUgPSB0eXBlb2YgbW9kdWxlID09ICdvYmplY3QnICYmIG1vZHVsZSAmJlxuXHRcdCFtb2R1bGUubm9kZVR5cGUgJiYgbW9kdWxlO1xuXHR2YXIgZnJlZUdsb2JhbCA9IHR5cGVvZiBnbG9iYWwgPT0gJ29iamVjdCcgJiYgZ2xvYmFsO1xuXHRpZiAoXG5cdFx0ZnJlZUdsb2JhbC5nbG9iYWwgPT09IGZyZWVHbG9iYWwgfHxcblx0XHRmcmVlR2xvYmFsLndpbmRvdyA9PT0gZnJlZUdsb2JhbCB8fFxuXHRcdGZyZWVHbG9iYWwuc2VsZiA9PT0gZnJlZUdsb2JhbFxuXHQpIHtcblx0XHRyb290ID0gZnJlZUdsb2JhbDtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgYHB1bnljb2RlYCBvYmplY3QuXG5cdCAqIEBuYW1lIHB1bnljb2RlXG5cdCAqIEB0eXBlIE9iamVjdFxuXHQgKi9cblx0dmFyIHB1bnljb2RlLFxuXG5cdC8qKiBIaWdoZXN0IHBvc2l0aXZlIHNpZ25lZCAzMi1iaXQgZmxvYXQgdmFsdWUgKi9cblx0bWF4SW50ID0gMjE0NzQ4MzY0NywgLy8gYWthLiAweDdGRkZGRkZGIG9yIDJeMzEtMVxuXG5cdC8qKiBCb290c3RyaW5nIHBhcmFtZXRlcnMgKi9cblx0YmFzZSA9IDM2LFxuXHR0TWluID0gMSxcblx0dE1heCA9IDI2LFxuXHRza2V3ID0gMzgsXG5cdGRhbXAgPSA3MDAsXG5cdGluaXRpYWxCaWFzID0gNzIsXG5cdGluaXRpYWxOID0gMTI4LCAvLyAweDgwXG5cdGRlbGltaXRlciA9ICctJywgLy8gJ1xceDJEJ1xuXG5cdC8qKiBSZWd1bGFyIGV4cHJlc3Npb25zICovXG5cdHJlZ2V4UHVueWNvZGUgPSAvXnhuLS0vLFxuXHRyZWdleE5vbkFTQ0lJID0gL1teXFx4MjAtXFx4N0VdLywgLy8gdW5wcmludGFibGUgQVNDSUkgY2hhcnMgKyBub24tQVNDSUkgY2hhcnNcblx0cmVnZXhTZXBhcmF0b3JzID0gL1tcXHgyRVxcdTMwMDJcXHVGRjBFXFx1RkY2MV0vZywgLy8gUkZDIDM0OTAgc2VwYXJhdG9yc1xuXG5cdC8qKiBFcnJvciBtZXNzYWdlcyAqL1xuXHRlcnJvcnMgPSB7XG5cdFx0J292ZXJmbG93JzogJ092ZXJmbG93OiBpbnB1dCBuZWVkcyB3aWRlciBpbnRlZ2VycyB0byBwcm9jZXNzJyxcblx0XHQnbm90LWJhc2ljJzogJ0lsbGVnYWwgaW5wdXQgPj0gMHg4MCAobm90IGEgYmFzaWMgY29kZSBwb2ludCknLFxuXHRcdCdpbnZhbGlkLWlucHV0JzogJ0ludmFsaWQgaW5wdXQnXG5cdH0sXG5cblx0LyoqIENvbnZlbmllbmNlIHNob3J0Y3V0cyAqL1xuXHRiYXNlTWludXNUTWluID0gYmFzZSAtIHRNaW4sXG5cdGZsb29yID0gTWF0aC5mbG9vcixcblx0c3RyaW5nRnJvbUNoYXJDb2RlID0gU3RyaW5nLmZyb21DaGFyQ29kZSxcblxuXHQvKiogVGVtcG9yYXJ5IHZhcmlhYmxlICovXG5cdGtleTtcblxuXHQvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuXHQvKipcblx0ICogQSBnZW5lcmljIGVycm9yIHV0aWxpdHkgZnVuY3Rpb24uXG5cdCAqIEBwcml2YXRlXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlIFRoZSBlcnJvciB0eXBlLlxuXHQgKiBAcmV0dXJucyB7RXJyb3J9IFRocm93cyBhIGBSYW5nZUVycm9yYCB3aXRoIHRoZSBhcHBsaWNhYmxlIGVycm9yIG1lc3NhZ2UuXG5cdCAqL1xuXHRmdW5jdGlvbiBlcnJvcih0eXBlKSB7XG5cdFx0dGhyb3cgbmV3IFJhbmdlRXJyb3IoZXJyb3JzW3R5cGVdKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBBIGdlbmVyaWMgYEFycmF5I21hcGAgdXRpbGl0eSBmdW5jdGlvbi5cblx0ICogQHByaXZhdGVcblx0ICogQHBhcmFtIHtBcnJheX0gYXJyYXkgVGhlIGFycmF5IHRvIGl0ZXJhdGUgb3Zlci5cblx0ICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgVGhlIGZ1bmN0aW9uIHRoYXQgZ2V0cyBjYWxsZWQgZm9yIGV2ZXJ5IGFycmF5XG5cdCAqIGl0ZW0uXG5cdCAqIEByZXR1cm5zIHtBcnJheX0gQSBuZXcgYXJyYXkgb2YgdmFsdWVzIHJldHVybmVkIGJ5IHRoZSBjYWxsYmFjayBmdW5jdGlvbi5cblx0ICovXG5cdGZ1bmN0aW9uIG1hcChhcnJheSwgZm4pIHtcblx0XHR2YXIgbGVuZ3RoID0gYXJyYXkubGVuZ3RoO1xuXHRcdHZhciByZXN1bHQgPSBbXTtcblx0XHR3aGlsZSAobGVuZ3RoLS0pIHtcblx0XHRcdHJlc3VsdFtsZW5ndGhdID0gZm4oYXJyYXlbbGVuZ3RoXSk7XG5cdFx0fVxuXHRcdHJldHVybiByZXN1bHQ7XG5cdH1cblxuXHQvKipcblx0ICogQSBzaW1wbGUgYEFycmF5I21hcGAtbGlrZSB3cmFwcGVyIHRvIHdvcmsgd2l0aCBkb21haW4gbmFtZSBzdHJpbmdzIG9yIGVtYWlsXG5cdCAqIGFkZHJlc3Nlcy5cblx0ICogQHByaXZhdGVcblx0ICogQHBhcmFtIHtTdHJpbmd9IGRvbWFpbiBUaGUgZG9tYWluIG5hbWUgb3IgZW1haWwgYWRkcmVzcy5cblx0ICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgVGhlIGZ1bmN0aW9uIHRoYXQgZ2V0cyBjYWxsZWQgZm9yIGV2ZXJ5XG5cdCAqIGNoYXJhY3Rlci5cblx0ICogQHJldHVybnMge0FycmF5fSBBIG5ldyBzdHJpbmcgb2YgY2hhcmFjdGVycyByZXR1cm5lZCBieSB0aGUgY2FsbGJhY2tcblx0ICogZnVuY3Rpb24uXG5cdCAqL1xuXHRmdW5jdGlvbiBtYXBEb21haW4oc3RyaW5nLCBmbikge1xuXHRcdHZhciBwYXJ0cyA9IHN0cmluZy5zcGxpdCgnQCcpO1xuXHRcdHZhciByZXN1bHQgPSAnJztcblx0XHRpZiAocGFydHMubGVuZ3RoID4gMSkge1xuXHRcdFx0Ly8gSW4gZW1haWwgYWRkcmVzc2VzLCBvbmx5IHRoZSBkb21haW4gbmFtZSBzaG91bGQgYmUgcHVueWNvZGVkLiBMZWF2ZVxuXHRcdFx0Ly8gdGhlIGxvY2FsIHBhcnQgKGkuZS4gZXZlcnl0aGluZyB1cCB0byBgQGApIGludGFjdC5cblx0XHRcdHJlc3VsdCA9IHBhcnRzWzBdICsgJ0AnO1xuXHRcdFx0c3RyaW5nID0gcGFydHNbMV07XG5cdFx0fVxuXHRcdC8vIEF2b2lkIGBzcGxpdChyZWdleClgIGZvciBJRTggY29tcGF0aWJpbGl0eS4gU2VlICMxNy5cblx0XHRzdHJpbmcgPSBzdHJpbmcucmVwbGFjZShyZWdleFNlcGFyYXRvcnMsICdcXHgyRScpO1xuXHRcdHZhciBsYWJlbHMgPSBzdHJpbmcuc3BsaXQoJy4nKTtcblx0XHR2YXIgZW5jb2RlZCA9IG1hcChsYWJlbHMsIGZuKS5qb2luKCcuJyk7XG5cdFx0cmV0dXJuIHJlc3VsdCArIGVuY29kZWQ7XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlcyBhbiBhcnJheSBjb250YWluaW5nIHRoZSBudW1lcmljIGNvZGUgcG9pbnRzIG9mIGVhY2ggVW5pY29kZVxuXHQgKiBjaGFyYWN0ZXIgaW4gdGhlIHN0cmluZy4gV2hpbGUgSmF2YVNjcmlwdCB1c2VzIFVDUy0yIGludGVybmFsbHksXG5cdCAqIHRoaXMgZnVuY3Rpb24gd2lsbCBjb252ZXJ0IGEgcGFpciBvZiBzdXJyb2dhdGUgaGFsdmVzIChlYWNoIG9mIHdoaWNoXG5cdCAqIFVDUy0yIGV4cG9zZXMgYXMgc2VwYXJhdGUgY2hhcmFjdGVycykgaW50byBhIHNpbmdsZSBjb2RlIHBvaW50LFxuXHQgKiBtYXRjaGluZyBVVEYtMTYuXG5cdCAqIEBzZWUgYHB1bnljb2RlLnVjczIuZW5jb2RlYFxuXHQgKiBAc2VlIDxodHRwczovL21hdGhpYXNieW5lbnMuYmUvbm90ZXMvamF2YXNjcmlwdC1lbmNvZGluZz5cblx0ICogQG1lbWJlck9mIHB1bnljb2RlLnVjczJcblx0ICogQG5hbWUgZGVjb2RlXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBzdHJpbmcgVGhlIFVuaWNvZGUgaW5wdXQgc3RyaW5nIChVQ1MtMikuXG5cdCAqIEByZXR1cm5zIHtBcnJheX0gVGhlIG5ldyBhcnJheSBvZiBjb2RlIHBvaW50cy5cblx0ICovXG5cdGZ1bmN0aW9uIHVjczJkZWNvZGUoc3RyaW5nKSB7XG5cdFx0dmFyIG91dHB1dCA9IFtdLFxuXHRcdCAgICBjb3VudGVyID0gMCxcblx0XHQgICAgbGVuZ3RoID0gc3RyaW5nLmxlbmd0aCxcblx0XHQgICAgdmFsdWUsXG5cdFx0ICAgIGV4dHJhO1xuXHRcdHdoaWxlIChjb3VudGVyIDwgbGVuZ3RoKSB7XG5cdFx0XHR2YWx1ZSA9IHN0cmluZy5jaGFyQ29kZUF0KGNvdW50ZXIrKyk7XG5cdFx0XHRpZiAodmFsdWUgPj0gMHhEODAwICYmIHZhbHVlIDw9IDB4REJGRiAmJiBjb3VudGVyIDwgbGVuZ3RoKSB7XG5cdFx0XHRcdC8vIGhpZ2ggc3Vycm9nYXRlLCBhbmQgdGhlcmUgaXMgYSBuZXh0IGNoYXJhY3RlclxuXHRcdFx0XHRleHRyYSA9IHN0cmluZy5jaGFyQ29kZUF0KGNvdW50ZXIrKyk7XG5cdFx0XHRcdGlmICgoZXh0cmEgJiAweEZDMDApID09IDB4REMwMCkgeyAvLyBsb3cgc3Vycm9nYXRlXG5cdFx0XHRcdFx0b3V0cHV0LnB1c2goKCh2YWx1ZSAmIDB4M0ZGKSA8PCAxMCkgKyAoZXh0cmEgJiAweDNGRikgKyAweDEwMDAwKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQvLyB1bm1hdGNoZWQgc3Vycm9nYXRlOyBvbmx5IGFwcGVuZCB0aGlzIGNvZGUgdW5pdCwgaW4gY2FzZSB0aGUgbmV4dFxuXHRcdFx0XHRcdC8vIGNvZGUgdW5pdCBpcyB0aGUgaGlnaCBzdXJyb2dhdGUgb2YgYSBzdXJyb2dhdGUgcGFpclxuXHRcdFx0XHRcdG91dHB1dC5wdXNoKHZhbHVlKTtcblx0XHRcdFx0XHRjb3VudGVyLS07XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdG91dHB1dC5wdXNoKHZhbHVlKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIG91dHB1dDtcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGVzIGEgc3RyaW5nIGJhc2VkIG9uIGFuIGFycmF5IG9mIG51bWVyaWMgY29kZSBwb2ludHMuXG5cdCAqIEBzZWUgYHB1bnljb2RlLnVjczIuZGVjb2RlYFxuXHQgKiBAbWVtYmVyT2YgcHVueWNvZGUudWNzMlxuXHQgKiBAbmFtZSBlbmNvZGVcblx0ICogQHBhcmFtIHtBcnJheX0gY29kZVBvaW50cyBUaGUgYXJyYXkgb2YgbnVtZXJpYyBjb2RlIHBvaW50cy5cblx0ICogQHJldHVybnMge1N0cmluZ30gVGhlIG5ldyBVbmljb2RlIHN0cmluZyAoVUNTLTIpLlxuXHQgKi9cblx0ZnVuY3Rpb24gdWNzMmVuY29kZShhcnJheSkge1xuXHRcdHJldHVybiBtYXAoYXJyYXksIGZ1bmN0aW9uKHZhbHVlKSB7XG5cdFx0XHR2YXIgb3V0cHV0ID0gJyc7XG5cdFx0XHRpZiAodmFsdWUgPiAweEZGRkYpIHtcblx0XHRcdFx0dmFsdWUgLT0gMHgxMDAwMDtcblx0XHRcdFx0b3V0cHV0ICs9IHN0cmluZ0Zyb21DaGFyQ29kZSh2YWx1ZSA+Pj4gMTAgJiAweDNGRiB8IDB4RDgwMCk7XG5cdFx0XHRcdHZhbHVlID0gMHhEQzAwIHwgdmFsdWUgJiAweDNGRjtcblx0XHRcdH1cblx0XHRcdG91dHB1dCArPSBzdHJpbmdGcm9tQ2hhckNvZGUodmFsdWUpO1xuXHRcdFx0cmV0dXJuIG91dHB1dDtcblx0XHR9KS5qb2luKCcnKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDb252ZXJ0cyBhIGJhc2ljIGNvZGUgcG9pbnQgaW50byBhIGRpZ2l0L2ludGVnZXIuXG5cdCAqIEBzZWUgYGRpZ2l0VG9CYXNpYygpYFxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAcGFyYW0ge051bWJlcn0gY29kZVBvaW50IFRoZSBiYXNpYyBudW1lcmljIGNvZGUgcG9pbnQgdmFsdWUuXG5cdCAqIEByZXR1cm5zIHtOdW1iZXJ9IFRoZSBudW1lcmljIHZhbHVlIG9mIGEgYmFzaWMgY29kZSBwb2ludCAoZm9yIHVzZSBpblxuXHQgKiByZXByZXNlbnRpbmcgaW50ZWdlcnMpIGluIHRoZSByYW5nZSBgMGAgdG8gYGJhc2UgLSAxYCwgb3IgYGJhc2VgIGlmXG5cdCAqIHRoZSBjb2RlIHBvaW50IGRvZXMgbm90IHJlcHJlc2VudCBhIHZhbHVlLlxuXHQgKi9cblx0ZnVuY3Rpb24gYmFzaWNUb0RpZ2l0KGNvZGVQb2ludCkge1xuXHRcdGlmIChjb2RlUG9pbnQgLSA0OCA8IDEwKSB7XG5cdFx0XHRyZXR1cm4gY29kZVBvaW50IC0gMjI7XG5cdFx0fVxuXHRcdGlmIChjb2RlUG9pbnQgLSA2NSA8IDI2KSB7XG5cdFx0XHRyZXR1cm4gY29kZVBvaW50IC0gNjU7XG5cdFx0fVxuXHRcdGlmIChjb2RlUG9pbnQgLSA5NyA8IDI2KSB7XG5cdFx0XHRyZXR1cm4gY29kZVBvaW50IC0gOTc7XG5cdFx0fVxuXHRcdHJldHVybiBiYXNlO1xuXHR9XG5cblx0LyoqXG5cdCAqIENvbnZlcnRzIGEgZGlnaXQvaW50ZWdlciBpbnRvIGEgYmFzaWMgY29kZSBwb2ludC5cblx0ICogQHNlZSBgYmFzaWNUb0RpZ2l0KClgXG5cdCAqIEBwcml2YXRlXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBkaWdpdCBUaGUgbnVtZXJpYyB2YWx1ZSBvZiBhIGJhc2ljIGNvZGUgcG9pbnQuXG5cdCAqIEByZXR1cm5zIHtOdW1iZXJ9IFRoZSBiYXNpYyBjb2RlIHBvaW50IHdob3NlIHZhbHVlICh3aGVuIHVzZWQgZm9yXG5cdCAqIHJlcHJlc2VudGluZyBpbnRlZ2VycykgaXMgYGRpZ2l0YCwgd2hpY2ggbmVlZHMgdG8gYmUgaW4gdGhlIHJhbmdlXG5cdCAqIGAwYCB0byBgYmFzZSAtIDFgLiBJZiBgZmxhZ2AgaXMgbm9uLXplcm8sIHRoZSB1cHBlcmNhc2UgZm9ybSBpc1xuXHQgKiB1c2VkOyBlbHNlLCB0aGUgbG93ZXJjYXNlIGZvcm0gaXMgdXNlZC4gVGhlIGJlaGF2aW9yIGlzIHVuZGVmaW5lZFxuXHQgKiBpZiBgZmxhZ2AgaXMgbm9uLXplcm8gYW5kIGBkaWdpdGAgaGFzIG5vIHVwcGVyY2FzZSBmb3JtLlxuXHQgKi9cblx0ZnVuY3Rpb24gZGlnaXRUb0Jhc2ljKGRpZ2l0LCBmbGFnKSB7XG5cdFx0Ly8gIDAuLjI1IG1hcCB0byBBU0NJSSBhLi56IG9yIEEuLlpcblx0XHQvLyAyNi4uMzUgbWFwIHRvIEFTQ0lJIDAuLjlcblx0XHRyZXR1cm4gZGlnaXQgKyAyMiArIDc1ICogKGRpZ2l0IDwgMjYpIC0gKChmbGFnICE9IDApIDw8IDUpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEJpYXMgYWRhcHRhdGlvbiBmdW5jdGlvbiBhcyBwZXIgc2VjdGlvbiAzLjQgb2YgUkZDIDM0OTIuXG5cdCAqIGh0dHBzOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmMzNDkyI3NlY3Rpb24tMy40XG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRmdW5jdGlvbiBhZGFwdChkZWx0YSwgbnVtUG9pbnRzLCBmaXJzdFRpbWUpIHtcblx0XHR2YXIgayA9IDA7XG5cdFx0ZGVsdGEgPSBmaXJzdFRpbWUgPyBmbG9vcihkZWx0YSAvIGRhbXApIDogZGVsdGEgPj4gMTtcblx0XHRkZWx0YSArPSBmbG9vcihkZWx0YSAvIG51bVBvaW50cyk7XG5cdFx0Zm9yICgvKiBubyBpbml0aWFsaXphdGlvbiAqLzsgZGVsdGEgPiBiYXNlTWludXNUTWluICogdE1heCA+PiAxOyBrICs9IGJhc2UpIHtcblx0XHRcdGRlbHRhID0gZmxvb3IoZGVsdGEgLyBiYXNlTWludXNUTWluKTtcblx0XHR9XG5cdFx0cmV0dXJuIGZsb29yKGsgKyAoYmFzZU1pbnVzVE1pbiArIDEpICogZGVsdGEgLyAoZGVsdGEgKyBza2V3KSk7XG5cdH1cblxuXHQvKipcblx0ICogQ29udmVydHMgYSBQdW55Y29kZSBzdHJpbmcgb2YgQVNDSUktb25seSBzeW1ib2xzIHRvIGEgc3RyaW5nIG9mIFVuaWNvZGVcblx0ICogc3ltYm9scy5cblx0ICogQG1lbWJlck9mIHB1bnljb2RlXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBpbnB1dCBUaGUgUHVueWNvZGUgc3RyaW5nIG9mIEFTQ0lJLW9ubHkgc3ltYm9scy5cblx0ICogQHJldHVybnMge1N0cmluZ30gVGhlIHJlc3VsdGluZyBzdHJpbmcgb2YgVW5pY29kZSBzeW1ib2xzLlxuXHQgKi9cblx0ZnVuY3Rpb24gZGVjb2RlKGlucHV0KSB7XG5cdFx0Ly8gRG9uJ3QgdXNlIFVDUy0yXG5cdFx0dmFyIG91dHB1dCA9IFtdLFxuXHRcdCAgICBpbnB1dExlbmd0aCA9IGlucHV0Lmxlbmd0aCxcblx0XHQgICAgb3V0LFxuXHRcdCAgICBpID0gMCxcblx0XHQgICAgbiA9IGluaXRpYWxOLFxuXHRcdCAgICBiaWFzID0gaW5pdGlhbEJpYXMsXG5cdFx0ICAgIGJhc2ljLFxuXHRcdCAgICBqLFxuXHRcdCAgICBpbmRleCxcblx0XHQgICAgb2xkaSxcblx0XHQgICAgdyxcblx0XHQgICAgayxcblx0XHQgICAgZGlnaXQsXG5cdFx0ICAgIHQsXG5cdFx0ICAgIC8qKiBDYWNoZWQgY2FsY3VsYXRpb24gcmVzdWx0cyAqL1xuXHRcdCAgICBiYXNlTWludXNUO1xuXG5cdFx0Ly8gSGFuZGxlIHRoZSBiYXNpYyBjb2RlIHBvaW50czogbGV0IGBiYXNpY2AgYmUgdGhlIG51bWJlciBvZiBpbnB1dCBjb2RlXG5cdFx0Ly8gcG9pbnRzIGJlZm9yZSB0aGUgbGFzdCBkZWxpbWl0ZXIsIG9yIGAwYCBpZiB0aGVyZSBpcyBub25lLCB0aGVuIGNvcHlcblx0XHQvLyB0aGUgZmlyc3QgYmFzaWMgY29kZSBwb2ludHMgdG8gdGhlIG91dHB1dC5cblxuXHRcdGJhc2ljID0gaW5wdXQubGFzdEluZGV4T2YoZGVsaW1pdGVyKTtcblx0XHRpZiAoYmFzaWMgPCAwKSB7XG5cdFx0XHRiYXNpYyA9IDA7XG5cdFx0fVxuXG5cdFx0Zm9yIChqID0gMDsgaiA8IGJhc2ljOyArK2opIHtcblx0XHRcdC8vIGlmIGl0J3Mgbm90IGEgYmFzaWMgY29kZSBwb2ludFxuXHRcdFx0aWYgKGlucHV0LmNoYXJDb2RlQXQoaikgPj0gMHg4MCkge1xuXHRcdFx0XHRlcnJvcignbm90LWJhc2ljJyk7XG5cdFx0XHR9XG5cdFx0XHRvdXRwdXQucHVzaChpbnB1dC5jaGFyQ29kZUF0KGopKTtcblx0XHR9XG5cblx0XHQvLyBNYWluIGRlY29kaW5nIGxvb3A6IHN0YXJ0IGp1c3QgYWZ0ZXIgdGhlIGxhc3QgZGVsaW1pdGVyIGlmIGFueSBiYXNpYyBjb2RlXG5cdFx0Ly8gcG9pbnRzIHdlcmUgY29waWVkOyBzdGFydCBhdCB0aGUgYmVnaW5uaW5nIG90aGVyd2lzZS5cblxuXHRcdGZvciAoaW5kZXggPSBiYXNpYyA+IDAgPyBiYXNpYyArIDEgOiAwOyBpbmRleCA8IGlucHV0TGVuZ3RoOyAvKiBubyBmaW5hbCBleHByZXNzaW9uICovKSB7XG5cblx0XHRcdC8vIGBpbmRleGAgaXMgdGhlIGluZGV4IG9mIHRoZSBuZXh0IGNoYXJhY3RlciB0byBiZSBjb25zdW1lZC5cblx0XHRcdC8vIERlY29kZSBhIGdlbmVyYWxpemVkIHZhcmlhYmxlLWxlbmd0aCBpbnRlZ2VyIGludG8gYGRlbHRhYCxcblx0XHRcdC8vIHdoaWNoIGdldHMgYWRkZWQgdG8gYGlgLiBUaGUgb3ZlcmZsb3cgY2hlY2tpbmcgaXMgZWFzaWVyXG5cdFx0XHQvLyBpZiB3ZSBpbmNyZWFzZSBgaWAgYXMgd2UgZ28sIHRoZW4gc3VidHJhY3Qgb2ZmIGl0cyBzdGFydGluZ1xuXHRcdFx0Ly8gdmFsdWUgYXQgdGhlIGVuZCB0byBvYnRhaW4gYGRlbHRhYC5cblx0XHRcdGZvciAob2xkaSA9IGksIHcgPSAxLCBrID0gYmFzZTsgLyogbm8gY29uZGl0aW9uICovOyBrICs9IGJhc2UpIHtcblxuXHRcdFx0XHRpZiAoaW5kZXggPj0gaW5wdXRMZW5ndGgpIHtcblx0XHRcdFx0XHRlcnJvcignaW52YWxpZC1pbnB1dCcpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0ZGlnaXQgPSBiYXNpY1RvRGlnaXQoaW5wdXQuY2hhckNvZGVBdChpbmRleCsrKSk7XG5cblx0XHRcdFx0aWYgKGRpZ2l0ID49IGJhc2UgfHwgZGlnaXQgPiBmbG9vcigobWF4SW50IC0gaSkgLyB3KSkge1xuXHRcdFx0XHRcdGVycm9yKCdvdmVyZmxvdycpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aSArPSBkaWdpdCAqIHc7XG5cdFx0XHRcdHQgPSBrIDw9IGJpYXMgPyB0TWluIDogKGsgPj0gYmlhcyArIHRNYXggPyB0TWF4IDogayAtIGJpYXMpO1xuXG5cdFx0XHRcdGlmIChkaWdpdCA8IHQpIHtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGJhc2VNaW51c1QgPSBiYXNlIC0gdDtcblx0XHRcdFx0aWYgKHcgPiBmbG9vcihtYXhJbnQgLyBiYXNlTWludXNUKSkge1xuXHRcdFx0XHRcdGVycm9yKCdvdmVyZmxvdycpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0dyAqPSBiYXNlTWludXNUO1xuXG5cdFx0XHR9XG5cblx0XHRcdG91dCA9IG91dHB1dC5sZW5ndGggKyAxO1xuXHRcdFx0YmlhcyA9IGFkYXB0KGkgLSBvbGRpLCBvdXQsIG9sZGkgPT0gMCk7XG5cblx0XHRcdC8vIGBpYCB3YXMgc3VwcG9zZWQgdG8gd3JhcCBhcm91bmQgZnJvbSBgb3V0YCB0byBgMGAsXG5cdFx0XHQvLyBpbmNyZW1lbnRpbmcgYG5gIGVhY2ggdGltZSwgc28gd2UnbGwgZml4IHRoYXQgbm93OlxuXHRcdFx0aWYgKGZsb29yKGkgLyBvdXQpID4gbWF4SW50IC0gbikge1xuXHRcdFx0XHRlcnJvcignb3ZlcmZsb3cnKTtcblx0XHRcdH1cblxuXHRcdFx0biArPSBmbG9vcihpIC8gb3V0KTtcblx0XHRcdGkgJT0gb3V0O1xuXG5cdFx0XHQvLyBJbnNlcnQgYG5gIGF0IHBvc2l0aW9uIGBpYCBvZiB0aGUgb3V0cHV0XG5cdFx0XHRvdXRwdXQuc3BsaWNlKGkrKywgMCwgbik7XG5cblx0XHR9XG5cblx0XHRyZXR1cm4gdWNzMmVuY29kZShvdXRwdXQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENvbnZlcnRzIGEgc3RyaW5nIG9mIFVuaWNvZGUgc3ltYm9scyAoZS5nLiBhIGRvbWFpbiBuYW1lIGxhYmVsKSB0byBhXG5cdCAqIFB1bnljb2RlIHN0cmluZyBvZiBBU0NJSS1vbmx5IHN5bWJvbHMuXG5cdCAqIEBtZW1iZXJPZiBwdW55Y29kZVxuXHQgKiBAcGFyYW0ge1N0cmluZ30gaW5wdXQgVGhlIHN0cmluZyBvZiBVbmljb2RlIHN5bWJvbHMuXG5cdCAqIEByZXR1cm5zIHtTdHJpbmd9IFRoZSByZXN1bHRpbmcgUHVueWNvZGUgc3RyaW5nIG9mIEFTQ0lJLW9ubHkgc3ltYm9scy5cblx0ICovXG5cdGZ1bmN0aW9uIGVuY29kZShpbnB1dCkge1xuXHRcdHZhciBuLFxuXHRcdCAgICBkZWx0YSxcblx0XHQgICAgaGFuZGxlZENQQ291bnQsXG5cdFx0ICAgIGJhc2ljTGVuZ3RoLFxuXHRcdCAgICBiaWFzLFxuXHRcdCAgICBqLFxuXHRcdCAgICBtLFxuXHRcdCAgICBxLFxuXHRcdCAgICBrLFxuXHRcdCAgICB0LFxuXHRcdCAgICBjdXJyZW50VmFsdWUsXG5cdFx0ICAgIG91dHB1dCA9IFtdLFxuXHRcdCAgICAvKiogYGlucHV0TGVuZ3RoYCB3aWxsIGhvbGQgdGhlIG51bWJlciBvZiBjb2RlIHBvaW50cyBpbiBgaW5wdXRgLiAqL1xuXHRcdCAgICBpbnB1dExlbmd0aCxcblx0XHQgICAgLyoqIENhY2hlZCBjYWxjdWxhdGlvbiByZXN1bHRzICovXG5cdFx0ICAgIGhhbmRsZWRDUENvdW50UGx1c09uZSxcblx0XHQgICAgYmFzZU1pbnVzVCxcblx0XHQgICAgcU1pbnVzVDtcblxuXHRcdC8vIENvbnZlcnQgdGhlIGlucHV0IGluIFVDUy0yIHRvIFVuaWNvZGVcblx0XHRpbnB1dCA9IHVjczJkZWNvZGUoaW5wdXQpO1xuXG5cdFx0Ly8gQ2FjaGUgdGhlIGxlbmd0aFxuXHRcdGlucHV0TGVuZ3RoID0gaW5wdXQubGVuZ3RoO1xuXG5cdFx0Ly8gSW5pdGlhbGl6ZSB0aGUgc3RhdGVcblx0XHRuID0gaW5pdGlhbE47XG5cdFx0ZGVsdGEgPSAwO1xuXHRcdGJpYXMgPSBpbml0aWFsQmlhcztcblxuXHRcdC8vIEhhbmRsZSB0aGUgYmFzaWMgY29kZSBwb2ludHNcblx0XHRmb3IgKGogPSAwOyBqIDwgaW5wdXRMZW5ndGg7ICsraikge1xuXHRcdFx0Y3VycmVudFZhbHVlID0gaW5wdXRbal07XG5cdFx0XHRpZiAoY3VycmVudFZhbHVlIDwgMHg4MCkge1xuXHRcdFx0XHRvdXRwdXQucHVzaChzdHJpbmdGcm9tQ2hhckNvZGUoY3VycmVudFZhbHVlKSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aGFuZGxlZENQQ291bnQgPSBiYXNpY0xlbmd0aCA9IG91dHB1dC5sZW5ndGg7XG5cblx0XHQvLyBgaGFuZGxlZENQQ291bnRgIGlzIHRoZSBudW1iZXIgb2YgY29kZSBwb2ludHMgdGhhdCBoYXZlIGJlZW4gaGFuZGxlZDtcblx0XHQvLyBgYmFzaWNMZW5ndGhgIGlzIHRoZSBudW1iZXIgb2YgYmFzaWMgY29kZSBwb2ludHMuXG5cblx0XHQvLyBGaW5pc2ggdGhlIGJhc2ljIHN0cmluZyAtIGlmIGl0IGlzIG5vdCBlbXB0eSAtIHdpdGggYSBkZWxpbWl0ZXJcblx0XHRpZiAoYmFzaWNMZW5ndGgpIHtcblx0XHRcdG91dHB1dC5wdXNoKGRlbGltaXRlcik7XG5cdFx0fVxuXG5cdFx0Ly8gTWFpbiBlbmNvZGluZyBsb29wOlxuXHRcdHdoaWxlIChoYW5kbGVkQ1BDb3VudCA8IGlucHV0TGVuZ3RoKSB7XG5cblx0XHRcdC8vIEFsbCBub24tYmFzaWMgY29kZSBwb2ludHMgPCBuIGhhdmUgYmVlbiBoYW5kbGVkIGFscmVhZHkuIEZpbmQgdGhlIG5leHRcblx0XHRcdC8vIGxhcmdlciBvbmU6XG5cdFx0XHRmb3IgKG0gPSBtYXhJbnQsIGogPSAwOyBqIDwgaW5wdXRMZW5ndGg7ICsraikge1xuXHRcdFx0XHRjdXJyZW50VmFsdWUgPSBpbnB1dFtqXTtcblx0XHRcdFx0aWYgKGN1cnJlbnRWYWx1ZSA+PSBuICYmIGN1cnJlbnRWYWx1ZSA8IG0pIHtcblx0XHRcdFx0XHRtID0gY3VycmVudFZhbHVlO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdC8vIEluY3JlYXNlIGBkZWx0YWAgZW5vdWdoIHRvIGFkdmFuY2UgdGhlIGRlY29kZXIncyA8bixpPiBzdGF0ZSB0byA8bSwwPixcblx0XHRcdC8vIGJ1dCBndWFyZCBhZ2FpbnN0IG92ZXJmbG93XG5cdFx0XHRoYW5kbGVkQ1BDb3VudFBsdXNPbmUgPSBoYW5kbGVkQ1BDb3VudCArIDE7XG5cdFx0XHRpZiAobSAtIG4gPiBmbG9vcigobWF4SW50IC0gZGVsdGEpIC8gaGFuZGxlZENQQ291bnRQbHVzT25lKSkge1xuXHRcdFx0XHRlcnJvcignb3ZlcmZsb3cnKTtcblx0XHRcdH1cblxuXHRcdFx0ZGVsdGEgKz0gKG0gLSBuKSAqIGhhbmRsZWRDUENvdW50UGx1c09uZTtcblx0XHRcdG4gPSBtO1xuXG5cdFx0XHRmb3IgKGogPSAwOyBqIDwgaW5wdXRMZW5ndGg7ICsraikge1xuXHRcdFx0XHRjdXJyZW50VmFsdWUgPSBpbnB1dFtqXTtcblxuXHRcdFx0XHRpZiAoY3VycmVudFZhbHVlIDwgbiAmJiArK2RlbHRhID4gbWF4SW50KSB7XG5cdFx0XHRcdFx0ZXJyb3IoJ292ZXJmbG93Jyk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoY3VycmVudFZhbHVlID09IG4pIHtcblx0XHRcdFx0XHQvLyBSZXByZXNlbnQgZGVsdGEgYXMgYSBnZW5lcmFsaXplZCB2YXJpYWJsZS1sZW5ndGggaW50ZWdlclxuXHRcdFx0XHRcdGZvciAocSA9IGRlbHRhLCBrID0gYmFzZTsgLyogbm8gY29uZGl0aW9uICovOyBrICs9IGJhc2UpIHtcblx0XHRcdFx0XHRcdHQgPSBrIDw9IGJpYXMgPyB0TWluIDogKGsgPj0gYmlhcyArIHRNYXggPyB0TWF4IDogayAtIGJpYXMpO1xuXHRcdFx0XHRcdFx0aWYgKHEgPCB0KSB7XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0cU1pbnVzVCA9IHEgLSB0O1xuXHRcdFx0XHRcdFx0YmFzZU1pbnVzVCA9IGJhc2UgLSB0O1xuXHRcdFx0XHRcdFx0b3V0cHV0LnB1c2goXG5cdFx0XHRcdFx0XHRcdHN0cmluZ0Zyb21DaGFyQ29kZShkaWdpdFRvQmFzaWModCArIHFNaW51c1QgJSBiYXNlTWludXNULCAwKSlcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRxID0gZmxvb3IocU1pbnVzVCAvIGJhc2VNaW51c1QpO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdG91dHB1dC5wdXNoKHN0cmluZ0Zyb21DaGFyQ29kZShkaWdpdFRvQmFzaWMocSwgMCkpKTtcblx0XHRcdFx0XHRiaWFzID0gYWRhcHQoZGVsdGEsIGhhbmRsZWRDUENvdW50UGx1c09uZSwgaGFuZGxlZENQQ291bnQgPT0gYmFzaWNMZW5ndGgpO1xuXHRcdFx0XHRcdGRlbHRhID0gMDtcblx0XHRcdFx0XHQrK2hhbmRsZWRDUENvdW50O1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdCsrZGVsdGE7XG5cdFx0XHQrK247XG5cblx0XHR9XG5cdFx0cmV0dXJuIG91dHB1dC5qb2luKCcnKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDb252ZXJ0cyBhIFB1bnljb2RlIHN0cmluZyByZXByZXNlbnRpbmcgYSBkb21haW4gbmFtZSBvciBhbiBlbWFpbCBhZGRyZXNzXG5cdCAqIHRvIFVuaWNvZGUuIE9ubHkgdGhlIFB1bnljb2RlZCBwYXJ0cyBvZiB0aGUgaW5wdXQgd2lsbCBiZSBjb252ZXJ0ZWQsIGkuZS5cblx0ICogaXQgZG9lc24ndCBtYXR0ZXIgaWYgeW91IGNhbGwgaXQgb24gYSBzdHJpbmcgdGhhdCBoYXMgYWxyZWFkeSBiZWVuXG5cdCAqIGNvbnZlcnRlZCB0byBVbmljb2RlLlxuXHQgKiBAbWVtYmVyT2YgcHVueWNvZGVcblx0ICogQHBhcmFtIHtTdHJpbmd9IGlucHV0IFRoZSBQdW55Y29kZWQgZG9tYWluIG5hbWUgb3IgZW1haWwgYWRkcmVzcyB0b1xuXHQgKiBjb252ZXJ0IHRvIFVuaWNvZGUuXG5cdCAqIEByZXR1cm5zIHtTdHJpbmd9IFRoZSBVbmljb2RlIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBnaXZlbiBQdW55Y29kZVxuXHQgKiBzdHJpbmcuXG5cdCAqL1xuXHRmdW5jdGlvbiB0b1VuaWNvZGUoaW5wdXQpIHtcblx0XHRyZXR1cm4gbWFwRG9tYWluKGlucHV0LCBmdW5jdGlvbihzdHJpbmcpIHtcblx0XHRcdHJldHVybiByZWdleFB1bnljb2RlLnRlc3Qoc3RyaW5nKVxuXHRcdFx0XHQ/IGRlY29kZShzdHJpbmcuc2xpY2UoNCkudG9Mb3dlckNhc2UoKSlcblx0XHRcdFx0OiBzdHJpbmc7XG5cdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogQ29udmVydHMgYSBVbmljb2RlIHN0cmluZyByZXByZXNlbnRpbmcgYSBkb21haW4gbmFtZSBvciBhbiBlbWFpbCBhZGRyZXNzIHRvXG5cdCAqIFB1bnljb2RlLiBPbmx5IHRoZSBub24tQVNDSUkgcGFydHMgb2YgdGhlIGRvbWFpbiBuYW1lIHdpbGwgYmUgY29udmVydGVkLFxuXHQgKiBpLmUuIGl0IGRvZXNuJ3QgbWF0dGVyIGlmIHlvdSBjYWxsIGl0IHdpdGggYSBkb21haW4gdGhhdCdzIGFscmVhZHkgaW5cblx0ICogQVNDSUkuXG5cdCAqIEBtZW1iZXJPZiBwdW55Y29kZVxuXHQgKiBAcGFyYW0ge1N0cmluZ30gaW5wdXQgVGhlIGRvbWFpbiBuYW1lIG9yIGVtYWlsIGFkZHJlc3MgdG8gY29udmVydCwgYXMgYVxuXHQgKiBVbmljb2RlIHN0cmluZy5cblx0ICogQHJldHVybnMge1N0cmluZ30gVGhlIFB1bnljb2RlIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBnaXZlbiBkb21haW4gbmFtZSBvclxuXHQgKiBlbWFpbCBhZGRyZXNzLlxuXHQgKi9cblx0ZnVuY3Rpb24gdG9BU0NJSShpbnB1dCkge1xuXHRcdHJldHVybiBtYXBEb21haW4oaW5wdXQsIGZ1bmN0aW9uKHN0cmluZykge1xuXHRcdFx0cmV0dXJuIHJlZ2V4Tm9uQVNDSUkudGVzdChzdHJpbmcpXG5cdFx0XHRcdD8gJ3huLS0nICsgZW5jb2RlKHN0cmluZylcblx0XHRcdFx0OiBzdHJpbmc7XG5cdFx0fSk7XG5cdH1cblxuXHQvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuXHQvKiogRGVmaW5lIHRoZSBwdWJsaWMgQVBJICovXG5cdHB1bnljb2RlID0ge1xuXHRcdC8qKlxuXHRcdCAqIEEgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgY3VycmVudCBQdW55Y29kZS5qcyB2ZXJzaW9uIG51bWJlci5cblx0XHQgKiBAbWVtYmVyT2YgcHVueWNvZGVcblx0XHQgKiBAdHlwZSBTdHJpbmdcblx0XHQgKi9cblx0XHQndmVyc2lvbic6ICcxLjQuMScsXG5cdFx0LyoqXG5cdFx0ICogQW4gb2JqZWN0IG9mIG1ldGhvZHMgdG8gY29udmVydCBmcm9tIEphdmFTY3JpcHQncyBpbnRlcm5hbCBjaGFyYWN0ZXJcblx0XHQgKiByZXByZXNlbnRhdGlvbiAoVUNTLTIpIHRvIFVuaWNvZGUgY29kZSBwb2ludHMsIGFuZCBiYWNrLlxuXHRcdCAqIEBzZWUgPGh0dHBzOi8vbWF0aGlhc2J5bmVucy5iZS9ub3Rlcy9qYXZhc2NyaXB0LWVuY29kaW5nPlxuXHRcdCAqIEBtZW1iZXJPZiBwdW55Y29kZVxuXHRcdCAqIEB0eXBlIE9iamVjdFxuXHRcdCAqL1xuXHRcdCd1Y3MyJzoge1xuXHRcdFx0J2RlY29kZSc6IHVjczJkZWNvZGUsXG5cdFx0XHQnZW5jb2RlJzogdWNzMmVuY29kZVxuXHRcdH0sXG5cdFx0J2RlY29kZSc6IGRlY29kZSxcblx0XHQnZW5jb2RlJzogZW5jb2RlLFxuXHRcdCd0b0FTQ0lJJzogdG9BU0NJSSxcblx0XHQndG9Vbmljb2RlJzogdG9Vbmljb2RlXG5cdH07XG5cblx0LyoqIEV4cG9zZSBgcHVueWNvZGVgICovXG5cdC8vIFNvbWUgQU1EIGJ1aWxkIG9wdGltaXplcnMsIGxpa2Ugci5qcywgY2hlY2sgZm9yIHNwZWNpZmljIGNvbmRpdGlvbiBwYXR0ZXJuc1xuXHQvLyBsaWtlIHRoZSBmb2xsb3dpbmc6XG5cdGlmIChcblx0XHR0eXBlb2YgZGVmaW5lID09ICdmdW5jdGlvbicgJiZcblx0XHR0eXBlb2YgZGVmaW5lLmFtZCA9PSAnb2JqZWN0JyAmJlxuXHRcdGRlZmluZS5hbWRcblx0KSB7XG5cdFx0ZGVmaW5lKCdwdW55Y29kZScsIGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIHB1bnljb2RlO1xuXHRcdH0pO1xuXHR9IGVsc2UgaWYgKGZyZWVFeHBvcnRzICYmIGZyZWVNb2R1bGUpIHtcblx0XHRpZiAobW9kdWxlLmV4cG9ydHMgPT0gZnJlZUV4cG9ydHMpIHtcblx0XHRcdC8vIGluIE5vZGUuanMsIGlvLmpzLCBvciBSaW5nb0pTIHYwLjguMCtcblx0XHRcdGZyZWVNb2R1bGUuZXhwb3J0cyA9IHB1bnljb2RlO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBpbiBOYXJ3aGFsIG9yIFJpbmdvSlMgdjAuNy4wLVxuXHRcdFx0Zm9yIChrZXkgaW4gcHVueWNvZGUpIHtcblx0XHRcdFx0cHVueWNvZGUuaGFzT3duUHJvcGVydHkoa2V5KSAmJiAoZnJlZUV4cG9ydHNba2V5XSA9IHB1bnljb2RlW2tleV0pO1xuXHRcdFx0fVxuXHRcdH1cblx0fSBlbHNlIHtcblx0XHQvLyBpbiBSaGlubyBvciBhIHdlYiBicm93c2VyXG5cdFx0cm9vdC5wdW55Y29kZSA9IHB1bnljb2RlO1xuXHR9XG5cbn0odGhpcykpO1xuIiwiLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbid1c2Ugc3RyaWN0JztcblxuLy8gSWYgb2JqLmhhc093blByb3BlcnR5IGhhcyBiZWVuIG92ZXJyaWRkZW4sIHRoZW4gY2FsbGluZ1xuLy8gb2JqLmhhc093blByb3BlcnR5KHByb3ApIHdpbGwgYnJlYWsuXG4vLyBTZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9qb3llbnQvbm9kZS9pc3N1ZXMvMTcwN1xuZnVuY3Rpb24gaGFzT3duUHJvcGVydHkob2JqLCBwcm9wKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihxcywgc2VwLCBlcSwgb3B0aW9ucykge1xuICBzZXAgPSBzZXAgfHwgJyYnO1xuICBlcSA9IGVxIHx8ICc9JztcbiAgdmFyIG9iaiA9IHt9O1xuXG4gIGlmICh0eXBlb2YgcXMgIT09ICdzdHJpbmcnIHx8IHFzLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBvYmo7XG4gIH1cblxuICB2YXIgcmVnZXhwID0gL1xcKy9nO1xuICBxcyA9IHFzLnNwbGl0KHNlcCk7XG5cbiAgdmFyIG1heEtleXMgPSAxMDAwO1xuICBpZiAob3B0aW9ucyAmJiB0eXBlb2Ygb3B0aW9ucy5tYXhLZXlzID09PSAnbnVtYmVyJykge1xuICAgIG1heEtleXMgPSBvcHRpb25zLm1heEtleXM7XG4gIH1cblxuICB2YXIgbGVuID0gcXMubGVuZ3RoO1xuICAvLyBtYXhLZXlzIDw9IDAgbWVhbnMgdGhhdCB3ZSBzaG91bGQgbm90IGxpbWl0IGtleXMgY291bnRcbiAgaWYgKG1heEtleXMgPiAwICYmIGxlbiA+IG1heEtleXMpIHtcbiAgICBsZW4gPSBtYXhLZXlzO1xuICB9XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47ICsraSkge1xuICAgIHZhciB4ID0gcXNbaV0ucmVwbGFjZShyZWdleHAsICclMjAnKSxcbiAgICAgICAgaWR4ID0geC5pbmRleE9mKGVxKSxcbiAgICAgICAga3N0ciwgdnN0ciwgaywgdjtcblxuICAgIGlmIChpZHggPj0gMCkge1xuICAgICAga3N0ciA9IHguc3Vic3RyKDAsIGlkeCk7XG4gICAgICB2c3RyID0geC5zdWJzdHIoaWR4ICsgMSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGtzdHIgPSB4O1xuICAgICAgdnN0ciA9ICcnO1xuICAgIH1cblxuICAgIGsgPSBkZWNvZGVVUklDb21wb25lbnQoa3N0cik7XG4gICAgdiA9IGRlY29kZVVSSUNvbXBvbmVudCh2c3RyKTtcblxuICAgIGlmICghaGFzT3duUHJvcGVydHkob2JqLCBrKSkge1xuICAgICAgb2JqW2tdID0gdjtcbiAgICB9IGVsc2UgaWYgKGlzQXJyYXkob2JqW2tdKSkge1xuICAgICAgb2JqW2tdLnB1c2godik7XG4gICAgfSBlbHNlIHtcbiAgICAgIG9ialtrXSA9IFtvYmpba10sIHZdO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBvYmo7XG59O1xuXG52YXIgaXNBcnJheSA9IEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24gKHhzKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoeHMpID09PSAnW29iamVjdCBBcnJheV0nO1xufTtcbiIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBzdHJpbmdpZnlQcmltaXRpdmUgPSBmdW5jdGlvbih2KSB7XG4gIHN3aXRjaCAodHlwZW9mIHYpIHtcbiAgICBjYXNlICdzdHJpbmcnOlxuICAgICAgcmV0dXJuIHY7XG5cbiAgICBjYXNlICdib29sZWFuJzpcbiAgICAgIHJldHVybiB2ID8gJ3RydWUnIDogJ2ZhbHNlJztcblxuICAgIGNhc2UgJ251bWJlcic6XG4gICAgICByZXR1cm4gaXNGaW5pdGUodikgPyB2IDogJyc7XG5cbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuICcnO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG9iaiwgc2VwLCBlcSwgbmFtZSkge1xuICBzZXAgPSBzZXAgfHwgJyYnO1xuICBlcSA9IGVxIHx8ICc9JztcbiAgaWYgKG9iaiA9PT0gbnVsbCkge1xuICAgIG9iaiA9IHVuZGVmaW5lZDtcbiAgfVxuXG4gIGlmICh0eXBlb2Ygb2JqID09PSAnb2JqZWN0Jykge1xuICAgIHJldHVybiBtYXAob2JqZWN0S2V5cyhvYmopLCBmdW5jdGlvbihrKSB7XG4gICAgICB2YXIga3MgPSBlbmNvZGVVUklDb21wb25lbnQoc3RyaW5naWZ5UHJpbWl0aXZlKGspKSArIGVxO1xuICAgICAgaWYgKGlzQXJyYXkob2JqW2tdKSkge1xuICAgICAgICByZXR1cm4gbWFwKG9ialtrXSwgZnVuY3Rpb24odikge1xuICAgICAgICAgIHJldHVybiBrcyArIGVuY29kZVVSSUNvbXBvbmVudChzdHJpbmdpZnlQcmltaXRpdmUodikpO1xuICAgICAgICB9KS5qb2luKHNlcCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4ga3MgKyBlbmNvZGVVUklDb21wb25lbnQoc3RyaW5naWZ5UHJpbWl0aXZlKG9ialtrXSkpO1xuICAgICAgfVxuICAgIH0pLmpvaW4oc2VwKTtcblxuICB9XG5cbiAgaWYgKCFuYW1lKSByZXR1cm4gJyc7XG4gIHJldHVybiBlbmNvZGVVUklDb21wb25lbnQoc3RyaW5naWZ5UHJpbWl0aXZlKG5hbWUpKSArIGVxICtcbiAgICAgICAgIGVuY29kZVVSSUNvbXBvbmVudChzdHJpbmdpZnlQcmltaXRpdmUob2JqKSk7XG59O1xuXG52YXIgaXNBcnJheSA9IEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24gKHhzKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoeHMpID09PSAnW29iamVjdCBBcnJheV0nO1xufTtcblxuZnVuY3Rpb24gbWFwICh4cywgZikge1xuICBpZiAoeHMubWFwKSByZXR1cm4geHMubWFwKGYpO1xuICB2YXIgcmVzID0gW107XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgeHMubGVuZ3RoOyBpKyspIHtcbiAgICByZXMucHVzaChmKHhzW2ldLCBpKSk7XG4gIH1cbiAgcmV0dXJuIHJlcztcbn1cblxudmFyIG9iamVjdEtleXMgPSBPYmplY3Qua2V5cyB8fCBmdW5jdGlvbiAob2JqKSB7XG4gIHZhciByZXMgPSBbXTtcbiAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBrZXkpKSByZXMucHVzaChrZXkpO1xuICB9XG4gIHJldHVybiByZXM7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLmRlY29kZSA9IGV4cG9ydHMucGFyc2UgPSByZXF1aXJlKCcuL2RlY29kZScpO1xuZXhwb3J0cy5lbmNvZGUgPSBleHBvcnRzLnN0cmluZ2lmeSA9IHJlcXVpcmUoJy4vZW5jb2RlJyk7XG4iLCIvLyBhIGR1cGxleCBzdHJlYW0gaXMganVzdCBhIHN0cmVhbSB0aGF0IGlzIGJvdGggcmVhZGFibGUgYW5kIHdyaXRhYmxlLlxuLy8gU2luY2UgSlMgZG9lc24ndCBoYXZlIG11bHRpcGxlIHByb3RvdHlwYWwgaW5oZXJpdGFuY2UsIHRoaXMgY2xhc3Ncbi8vIHByb3RvdHlwYWxseSBpbmhlcml0cyBmcm9tIFJlYWRhYmxlLCBhbmQgdGhlbiBwYXJhc2l0aWNhbGx5IGZyb21cbi8vIFdyaXRhYmxlLlxuXG4ndXNlIHN0cmljdCc7XG5cbi8qPHJlcGxhY2VtZW50PiovXG5cbnZhciBvYmplY3RLZXlzID0gT2JqZWN0LmtleXMgfHwgZnVuY3Rpb24gKG9iaikge1xuICB2YXIga2V5cyA9IFtdO1xuICBmb3IgKHZhciBrZXkgaW4gb2JqKSB7XG4gICAga2V5cy5wdXNoKGtleSk7XG4gIH1yZXR1cm4ga2V5cztcbn07XG4vKjwvcmVwbGFjZW1lbnQ+Ki9cblxubW9kdWxlLmV4cG9ydHMgPSBEdXBsZXg7XG5cbi8qPHJlcGxhY2VtZW50PiovXG52YXIgcHJvY2Vzc05leHRUaWNrID0gcmVxdWlyZSgncHJvY2Vzcy1uZXh0aWNrLWFyZ3MnKTtcbi8qPC9yZXBsYWNlbWVudD4qL1xuXG4vKjxyZXBsYWNlbWVudD4qL1xudmFyIHV0aWwgPSByZXF1aXJlKCdjb3JlLXV0aWwtaXMnKTtcbnV0aWwuaW5oZXJpdHMgPSByZXF1aXJlKCdpbmhlcml0cycpO1xuLyo8L3JlcGxhY2VtZW50PiovXG5cbnZhciBSZWFkYWJsZSA9IHJlcXVpcmUoJy4vX3N0cmVhbV9yZWFkYWJsZScpO1xudmFyIFdyaXRhYmxlID0gcmVxdWlyZSgnLi9fc3RyZWFtX3dyaXRhYmxlJyk7XG5cbnV0aWwuaW5oZXJpdHMoRHVwbGV4LCBSZWFkYWJsZSk7XG5cbnZhciBrZXlzID0gb2JqZWN0S2V5cyhXcml0YWJsZS5wcm90b3R5cGUpO1xuZm9yICh2YXIgdiA9IDA7IHYgPCBrZXlzLmxlbmd0aDsgdisrKSB7XG4gIHZhciBtZXRob2QgPSBrZXlzW3ZdO1xuICBpZiAoIUR1cGxleC5wcm90b3R5cGVbbWV0aG9kXSkgRHVwbGV4LnByb3RvdHlwZVttZXRob2RdID0gV3JpdGFibGUucHJvdG90eXBlW21ldGhvZF07XG59XG5cbmZ1bmN0aW9uIER1cGxleChvcHRpb25zKSB7XG4gIGlmICghKHRoaXMgaW5zdGFuY2VvZiBEdXBsZXgpKSByZXR1cm4gbmV3IER1cGxleChvcHRpb25zKTtcblxuICBSZWFkYWJsZS5jYWxsKHRoaXMsIG9wdGlvbnMpO1xuICBXcml0YWJsZS5jYWxsKHRoaXMsIG9wdGlvbnMpO1xuXG4gIGlmIChvcHRpb25zICYmIG9wdGlvbnMucmVhZGFibGUgPT09IGZhbHNlKSB0aGlzLnJlYWRhYmxlID0gZmFsc2U7XG5cbiAgaWYgKG9wdGlvbnMgJiYgb3B0aW9ucy53cml0YWJsZSA9PT0gZmFsc2UpIHRoaXMud3JpdGFibGUgPSBmYWxzZTtcblxuICB0aGlzLmFsbG93SGFsZk9wZW4gPSB0cnVlO1xuICBpZiAob3B0aW9ucyAmJiBvcHRpb25zLmFsbG93SGFsZk9wZW4gPT09IGZhbHNlKSB0aGlzLmFsbG93SGFsZk9wZW4gPSBmYWxzZTtcblxuICB0aGlzLm9uY2UoJ2VuZCcsIG9uZW5kKTtcbn1cblxuLy8gdGhlIG5vLWhhbGYtb3BlbiBlbmZvcmNlclxuZnVuY3Rpb24gb25lbmQoKSB7XG4gIC8vIGlmIHdlIGFsbG93IGhhbGYtb3BlbiBzdGF0ZSwgb3IgaWYgdGhlIHdyaXRhYmxlIHNpZGUgZW5kZWQsXG4gIC8vIHRoZW4gd2UncmUgb2suXG4gIGlmICh0aGlzLmFsbG93SGFsZk9wZW4gfHwgdGhpcy5fd3JpdGFibGVTdGF0ZS5lbmRlZCkgcmV0dXJuO1xuXG4gIC8vIG5vIG1vcmUgZGF0YSBjYW4gYmUgd3JpdHRlbi5cbiAgLy8gQnV0IGFsbG93IG1vcmUgd3JpdGVzIHRvIGhhcHBlbiBpbiB0aGlzIHRpY2suXG4gIHByb2Nlc3NOZXh0VGljayhvbkVuZE5ULCB0aGlzKTtcbn1cblxuZnVuY3Rpb24gb25FbmROVChzZWxmKSB7XG4gIHNlbGYuZW5kKCk7XG59XG5cbmZ1bmN0aW9uIGZvckVhY2goeHMsIGYpIHtcbiAgZm9yICh2YXIgaSA9IDAsIGwgPSB4cy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICBmKHhzW2ldLCBpKTtcbiAgfVxufSIsIi8vIGEgcGFzc3Rocm91Z2ggc3RyZWFtLlxuLy8gYmFzaWNhbGx5IGp1c3QgdGhlIG1vc3QgbWluaW1hbCBzb3J0IG9mIFRyYW5zZm9ybSBzdHJlYW0uXG4vLyBFdmVyeSB3cml0dGVuIGNodW5rIGdldHMgb3V0cHV0IGFzLWlzLlxuXG4ndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gUGFzc1Rocm91Z2g7XG5cbnZhciBUcmFuc2Zvcm0gPSByZXF1aXJlKCcuL19zdHJlYW1fdHJhbnNmb3JtJyk7XG5cbi8qPHJlcGxhY2VtZW50PiovXG52YXIgdXRpbCA9IHJlcXVpcmUoJ2NvcmUtdXRpbC1pcycpO1xudXRpbC5pbmhlcml0cyA9IHJlcXVpcmUoJ2luaGVyaXRzJyk7XG4vKjwvcmVwbGFjZW1lbnQ+Ki9cblxudXRpbC5pbmhlcml0cyhQYXNzVGhyb3VnaCwgVHJhbnNmb3JtKTtcblxuZnVuY3Rpb24gUGFzc1Rocm91Z2gob3B0aW9ucykge1xuICBpZiAoISh0aGlzIGluc3RhbmNlb2YgUGFzc1Rocm91Z2gpKSByZXR1cm4gbmV3IFBhc3NUaHJvdWdoKG9wdGlvbnMpO1xuXG4gIFRyYW5zZm9ybS5jYWxsKHRoaXMsIG9wdGlvbnMpO1xufVxuXG5QYXNzVGhyb3VnaC5wcm90b3R5cGUuX3RyYW5zZm9ybSA9IGZ1bmN0aW9uIChjaHVuaywgZW5jb2RpbmcsIGNiKSB7XG4gIGNiKG51bGwsIGNodW5rKTtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWRhYmxlO1xuXG4vKjxyZXBsYWNlbWVudD4qL1xudmFyIHByb2Nlc3NOZXh0VGljayA9IHJlcXVpcmUoJ3Byb2Nlc3MtbmV4dGljay1hcmdzJyk7XG4vKjwvcmVwbGFjZW1lbnQ+Ki9cblxuLyo8cmVwbGFjZW1lbnQ+Ki9cbnZhciBpc0FycmF5ID0gcmVxdWlyZSgnaXNhcnJheScpO1xuLyo8L3JlcGxhY2VtZW50PiovXG5cbi8qPHJlcGxhY2VtZW50PiovXG52YXIgRHVwbGV4O1xuLyo8L3JlcGxhY2VtZW50PiovXG5cblJlYWRhYmxlLlJlYWRhYmxlU3RhdGUgPSBSZWFkYWJsZVN0YXRlO1xuXG4vKjxyZXBsYWNlbWVudD4qL1xudmFyIEVFID0gcmVxdWlyZSgnZXZlbnRzJykuRXZlbnRFbWl0dGVyO1xuXG52YXIgRUVsaXN0ZW5lckNvdW50ID0gZnVuY3Rpb24gKGVtaXR0ZXIsIHR5cGUpIHtcbiAgcmV0dXJuIGVtaXR0ZXIubGlzdGVuZXJzKHR5cGUpLmxlbmd0aDtcbn07XG4vKjwvcmVwbGFjZW1lbnQ+Ki9cblxuLyo8cmVwbGFjZW1lbnQ+Ki9cbnZhciBTdHJlYW07XG4oZnVuY3Rpb24gKCkge1xuICB0cnkge1xuICAgIFN0cmVhbSA9IHJlcXVpcmUoJ3N0JyArICdyZWFtJyk7XG4gIH0gY2F0Y2ggKF8pIHt9IGZpbmFsbHkge1xuICAgIGlmICghU3RyZWFtKSBTdHJlYW0gPSByZXF1aXJlKCdldmVudHMnKS5FdmVudEVtaXR0ZXI7XG4gIH1cbn0pKCk7XG4vKjwvcmVwbGFjZW1lbnQ+Ki9cblxudmFyIEJ1ZmZlciA9IHJlcXVpcmUoJ2J1ZmZlcicpLkJ1ZmZlcjtcbi8qPHJlcGxhY2VtZW50PiovXG52YXIgYnVmZmVyU2hpbSA9IHJlcXVpcmUoJ2J1ZmZlci1zaGltcycpO1xuLyo8L3JlcGxhY2VtZW50PiovXG5cbi8qPHJlcGxhY2VtZW50PiovXG52YXIgdXRpbCA9IHJlcXVpcmUoJ2NvcmUtdXRpbC1pcycpO1xudXRpbC5pbmhlcml0cyA9IHJlcXVpcmUoJ2luaGVyaXRzJyk7XG4vKjwvcmVwbGFjZW1lbnQ+Ki9cblxuLyo8cmVwbGFjZW1lbnQ+Ki9cbnZhciBkZWJ1Z1V0aWwgPSByZXF1aXJlKCd1dGlsJyk7XG52YXIgZGVidWcgPSB2b2lkIDA7XG5pZiAoZGVidWdVdGlsICYmIGRlYnVnVXRpbC5kZWJ1Z2xvZykge1xuICBkZWJ1ZyA9IGRlYnVnVXRpbC5kZWJ1Z2xvZygnc3RyZWFtJyk7XG59IGVsc2Uge1xuICBkZWJ1ZyA9IGZ1bmN0aW9uICgpIHt9O1xufVxuLyo8L3JlcGxhY2VtZW50PiovXG5cbnZhciBCdWZmZXJMaXN0ID0gcmVxdWlyZSgnLi9pbnRlcm5hbC9zdHJlYW1zL0J1ZmZlckxpc3QnKTtcbnZhciBTdHJpbmdEZWNvZGVyO1xuXG51dGlsLmluaGVyaXRzKFJlYWRhYmxlLCBTdHJlYW0pO1xuXG5mdW5jdGlvbiBwcmVwZW5kTGlzdGVuZXIoZW1pdHRlciwgZXZlbnQsIGZuKSB7XG4gIC8vIFNhZGx5IHRoaXMgaXMgbm90IGNhY2hlYWJsZSBhcyBzb21lIGxpYnJhcmllcyBidW5kbGUgdGhlaXIgb3duXG4gIC8vIGV2ZW50IGVtaXR0ZXIgaW1wbGVtZW50YXRpb24gd2l0aCB0aGVtLlxuICBpZiAodHlwZW9mIGVtaXR0ZXIucHJlcGVuZExpc3RlbmVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgcmV0dXJuIGVtaXR0ZXIucHJlcGVuZExpc3RlbmVyKGV2ZW50LCBmbik7XG4gIH0gZWxzZSB7XG4gICAgLy8gVGhpcyBpcyBhIGhhY2sgdG8gbWFrZSBzdXJlIHRoYXQgb3VyIGVycm9yIGhhbmRsZXIgaXMgYXR0YWNoZWQgYmVmb3JlIGFueVxuICAgIC8vIHVzZXJsYW5kIG9uZXMuICBORVZFUiBETyBUSElTLiBUaGlzIGlzIGhlcmUgb25seSBiZWNhdXNlIHRoaXMgY29kZSBuZWVkc1xuICAgIC8vIHRvIGNvbnRpbnVlIHRvIHdvcmsgd2l0aCBvbGRlciB2ZXJzaW9ucyBvZiBOb2RlLmpzIHRoYXQgZG8gbm90IGluY2x1ZGVcbiAgICAvLyB0aGUgcHJlcGVuZExpc3RlbmVyKCkgbWV0aG9kLiBUaGUgZ29hbCBpcyB0byBldmVudHVhbGx5IHJlbW92ZSB0aGlzIGhhY2suXG4gICAgaWYgKCFlbWl0dGVyLl9ldmVudHMgfHwgIWVtaXR0ZXIuX2V2ZW50c1tldmVudF0pIGVtaXR0ZXIub24oZXZlbnQsIGZuKTtlbHNlIGlmIChpc0FycmF5KGVtaXR0ZXIuX2V2ZW50c1tldmVudF0pKSBlbWl0dGVyLl9ldmVudHNbZXZlbnRdLnVuc2hpZnQoZm4pO2Vsc2UgZW1pdHRlci5fZXZlbnRzW2V2ZW50XSA9IFtmbiwgZW1pdHRlci5fZXZlbnRzW2V2ZW50XV07XG4gIH1cbn1cblxuZnVuY3Rpb24gUmVhZGFibGVTdGF0ZShvcHRpb25zLCBzdHJlYW0pIHtcbiAgRHVwbGV4ID0gRHVwbGV4IHx8IHJlcXVpcmUoJy4vX3N0cmVhbV9kdXBsZXgnKTtcblxuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAvLyBvYmplY3Qgc3RyZWFtIGZsYWcuIFVzZWQgdG8gbWFrZSByZWFkKG4pIGlnbm9yZSBuIGFuZCB0b1xuICAvLyBtYWtlIGFsbCB0aGUgYnVmZmVyIG1lcmdpbmcgYW5kIGxlbmd0aCBjaGVja3MgZ28gYXdheVxuICB0aGlzLm9iamVjdE1vZGUgPSAhIW9wdGlvbnMub2JqZWN0TW9kZTtcblxuICBpZiAoc3RyZWFtIGluc3RhbmNlb2YgRHVwbGV4KSB0aGlzLm9iamVjdE1vZGUgPSB0aGlzLm9iamVjdE1vZGUgfHwgISFvcHRpb25zLnJlYWRhYmxlT2JqZWN0TW9kZTtcblxuICAvLyB0aGUgcG9pbnQgYXQgd2hpY2ggaXQgc3RvcHMgY2FsbGluZyBfcmVhZCgpIHRvIGZpbGwgdGhlIGJ1ZmZlclxuICAvLyBOb3RlOiAwIGlzIGEgdmFsaWQgdmFsdWUsIG1lYW5zIFwiZG9uJ3QgY2FsbCBfcmVhZCBwcmVlbXB0aXZlbHkgZXZlclwiXG4gIHZhciBod20gPSBvcHRpb25zLmhpZ2hXYXRlck1hcms7XG4gIHZhciBkZWZhdWx0SHdtID0gdGhpcy5vYmplY3RNb2RlID8gMTYgOiAxNiAqIDEwMjQ7XG4gIHRoaXMuaGlnaFdhdGVyTWFyayA9IGh3bSB8fCBod20gPT09IDAgPyBod20gOiBkZWZhdWx0SHdtO1xuXG4gIC8vIGNhc3QgdG8gaW50cy5cbiAgdGhpcy5oaWdoV2F0ZXJNYXJrID0gfn50aGlzLmhpZ2hXYXRlck1hcms7XG5cbiAgLy8gQSBsaW5rZWQgbGlzdCBpcyB1c2VkIHRvIHN0b3JlIGRhdGEgY2h1bmtzIGluc3RlYWQgb2YgYW4gYXJyYXkgYmVjYXVzZSB0aGVcbiAgLy8gbGlua2VkIGxpc3QgY2FuIHJlbW92ZSBlbGVtZW50cyBmcm9tIHRoZSBiZWdpbm5pbmcgZmFzdGVyIHRoYW5cbiAgLy8gYXJyYXkuc2hpZnQoKVxuICB0aGlzLmJ1ZmZlciA9IG5ldyBCdWZmZXJMaXN0KCk7XG4gIHRoaXMubGVuZ3RoID0gMDtcbiAgdGhpcy5waXBlcyA9IG51bGw7XG4gIHRoaXMucGlwZXNDb3VudCA9IDA7XG4gIHRoaXMuZmxvd2luZyA9IG51bGw7XG4gIHRoaXMuZW5kZWQgPSBmYWxzZTtcbiAgdGhpcy5lbmRFbWl0dGVkID0gZmFsc2U7XG4gIHRoaXMucmVhZGluZyA9IGZhbHNlO1xuXG4gIC8vIGEgZmxhZyB0byBiZSBhYmxlIHRvIHRlbGwgaWYgdGhlIG9ud3JpdGUgY2IgaXMgY2FsbGVkIGltbWVkaWF0ZWx5LFxuICAvLyBvciBvbiBhIGxhdGVyIHRpY2suICBXZSBzZXQgdGhpcyB0byB0cnVlIGF0IGZpcnN0LCBiZWNhdXNlIGFueVxuICAvLyBhY3Rpb25zIHRoYXQgc2hvdWxkbid0IGhhcHBlbiB1bnRpbCBcImxhdGVyXCIgc2hvdWxkIGdlbmVyYWxseSBhbHNvXG4gIC8vIG5vdCBoYXBwZW4gYmVmb3JlIHRoZSBmaXJzdCB3cml0ZSBjYWxsLlxuICB0aGlzLnN5bmMgPSB0cnVlO1xuXG4gIC8vIHdoZW5ldmVyIHdlIHJldHVybiBudWxsLCB0aGVuIHdlIHNldCBhIGZsYWcgdG8gc2F5XG4gIC8vIHRoYXQgd2UncmUgYXdhaXRpbmcgYSAncmVhZGFibGUnIGV2ZW50IGVtaXNzaW9uLlxuICB0aGlzLm5lZWRSZWFkYWJsZSA9IGZhbHNlO1xuICB0aGlzLmVtaXR0ZWRSZWFkYWJsZSA9IGZhbHNlO1xuICB0aGlzLnJlYWRhYmxlTGlzdGVuaW5nID0gZmFsc2U7XG4gIHRoaXMucmVzdW1lU2NoZWR1bGVkID0gZmFsc2U7XG5cbiAgLy8gQ3J5cHRvIGlzIGtpbmQgb2Ygb2xkIGFuZCBjcnVzdHkuICBIaXN0b3JpY2FsbHksIGl0cyBkZWZhdWx0IHN0cmluZ1xuICAvLyBlbmNvZGluZyBpcyAnYmluYXJ5JyBzbyB3ZSBoYXZlIHRvIG1ha2UgdGhpcyBjb25maWd1cmFibGUuXG4gIC8vIEV2ZXJ5dGhpbmcgZWxzZSBpbiB0aGUgdW5pdmVyc2UgdXNlcyAndXRmOCcsIHRob3VnaC5cbiAgdGhpcy5kZWZhdWx0RW5jb2RpbmcgPSBvcHRpb25zLmRlZmF1bHRFbmNvZGluZyB8fCAndXRmOCc7XG5cbiAgLy8gd2hlbiBwaXBpbmcsIHdlIG9ubHkgY2FyZSBhYm91dCAncmVhZGFibGUnIGV2ZW50cyB0aGF0IGhhcHBlblxuICAvLyBhZnRlciByZWFkKClpbmcgYWxsIHRoZSBieXRlcyBhbmQgbm90IGdldHRpbmcgYW55IHB1c2hiYWNrLlxuICB0aGlzLnJhbk91dCA9IGZhbHNlO1xuXG4gIC8vIHRoZSBudW1iZXIgb2Ygd3JpdGVycyB0aGF0IGFyZSBhd2FpdGluZyBhIGRyYWluIGV2ZW50IGluIC5waXBlKClzXG4gIHRoaXMuYXdhaXREcmFpbiA9IDA7XG5cbiAgLy8gaWYgdHJ1ZSwgYSBtYXliZVJlYWRNb3JlIGhhcyBiZWVuIHNjaGVkdWxlZFxuICB0aGlzLnJlYWRpbmdNb3JlID0gZmFsc2U7XG5cbiAgdGhpcy5kZWNvZGVyID0gbnVsbDtcbiAgdGhpcy5lbmNvZGluZyA9IG51bGw7XG4gIGlmIChvcHRpb25zLmVuY29kaW5nKSB7XG4gICAgaWYgKCFTdHJpbmdEZWNvZGVyKSBTdHJpbmdEZWNvZGVyID0gcmVxdWlyZSgnc3RyaW5nX2RlY29kZXIvJykuU3RyaW5nRGVjb2RlcjtcbiAgICB0aGlzLmRlY29kZXIgPSBuZXcgU3RyaW5nRGVjb2RlcihvcHRpb25zLmVuY29kaW5nKTtcbiAgICB0aGlzLmVuY29kaW5nID0gb3B0aW9ucy5lbmNvZGluZztcbiAgfVxufVxuXG5mdW5jdGlvbiBSZWFkYWJsZShvcHRpb25zKSB7XG4gIER1cGxleCA9IER1cGxleCB8fCByZXF1aXJlKCcuL19zdHJlYW1fZHVwbGV4Jyk7XG5cbiAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIFJlYWRhYmxlKSkgcmV0dXJuIG5ldyBSZWFkYWJsZShvcHRpb25zKTtcblxuICB0aGlzLl9yZWFkYWJsZVN0YXRlID0gbmV3IFJlYWRhYmxlU3RhdGUob3B0aW9ucywgdGhpcyk7XG5cbiAgLy8gbGVnYWN5XG4gIHRoaXMucmVhZGFibGUgPSB0cnVlO1xuXG4gIGlmIChvcHRpb25zICYmIHR5cGVvZiBvcHRpb25zLnJlYWQgPT09ICdmdW5jdGlvbicpIHRoaXMuX3JlYWQgPSBvcHRpb25zLnJlYWQ7XG5cbiAgU3RyZWFtLmNhbGwodGhpcyk7XG59XG5cbi8vIE1hbnVhbGx5IHNob3ZlIHNvbWV0aGluZyBpbnRvIHRoZSByZWFkKCkgYnVmZmVyLlxuLy8gVGhpcyByZXR1cm5zIHRydWUgaWYgdGhlIGhpZ2hXYXRlck1hcmsgaGFzIG5vdCBiZWVuIGhpdCB5ZXQsXG4vLyBzaW1pbGFyIHRvIGhvdyBXcml0YWJsZS53cml0ZSgpIHJldHVybnMgdHJ1ZSBpZiB5b3Ugc2hvdWxkXG4vLyB3cml0ZSgpIHNvbWUgbW9yZS5cblJlYWRhYmxlLnByb3RvdHlwZS5wdXNoID0gZnVuY3Rpb24gKGNodW5rLCBlbmNvZGluZykge1xuICB2YXIgc3RhdGUgPSB0aGlzLl9yZWFkYWJsZVN0YXRlO1xuXG4gIGlmICghc3RhdGUub2JqZWN0TW9kZSAmJiB0eXBlb2YgY2h1bmsgPT09ICdzdHJpbmcnKSB7XG4gICAgZW5jb2RpbmcgPSBlbmNvZGluZyB8fCBzdGF0ZS5kZWZhdWx0RW5jb2Rpbmc7XG4gICAgaWYgKGVuY29kaW5nICE9PSBzdGF0ZS5lbmNvZGluZykge1xuICAgICAgY2h1bmsgPSBidWZmZXJTaGltLmZyb20oY2h1bmssIGVuY29kaW5nKTtcbiAgICAgIGVuY29kaW5nID0gJyc7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHJlYWRhYmxlQWRkQ2h1bmsodGhpcywgc3RhdGUsIGNodW5rLCBlbmNvZGluZywgZmFsc2UpO1xufTtcblxuLy8gVW5zaGlmdCBzaG91bGQgKmFsd2F5cyogYmUgc29tZXRoaW5nIGRpcmVjdGx5IG91dCBvZiByZWFkKClcblJlYWRhYmxlLnByb3RvdHlwZS51bnNoaWZ0ID0gZnVuY3Rpb24gKGNodW5rKSB7XG4gIHZhciBzdGF0ZSA9IHRoaXMuX3JlYWRhYmxlU3RhdGU7XG4gIHJldHVybiByZWFkYWJsZUFkZENodW5rKHRoaXMsIHN0YXRlLCBjaHVuaywgJycsIHRydWUpO1xufTtcblxuUmVhZGFibGUucHJvdG90eXBlLmlzUGF1c2VkID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy5fcmVhZGFibGVTdGF0ZS5mbG93aW5nID09PSBmYWxzZTtcbn07XG5cbmZ1bmN0aW9uIHJlYWRhYmxlQWRkQ2h1bmsoc3RyZWFtLCBzdGF0ZSwgY2h1bmssIGVuY29kaW5nLCBhZGRUb0Zyb250KSB7XG4gIHZhciBlciA9IGNodW5rSW52YWxpZChzdGF0ZSwgY2h1bmspO1xuICBpZiAoZXIpIHtcbiAgICBzdHJlYW0uZW1pdCgnZXJyb3InLCBlcik7XG4gIH0gZWxzZSBpZiAoY2h1bmsgPT09IG51bGwpIHtcbiAgICBzdGF0ZS5yZWFkaW5nID0gZmFsc2U7XG4gICAgb25Fb2ZDaHVuayhzdHJlYW0sIHN0YXRlKTtcbiAgfSBlbHNlIGlmIChzdGF0ZS5vYmplY3RNb2RlIHx8IGNodW5rICYmIGNodW5rLmxlbmd0aCA+IDApIHtcbiAgICBpZiAoc3RhdGUuZW5kZWQgJiYgIWFkZFRvRnJvbnQpIHtcbiAgICAgIHZhciBlID0gbmV3IEVycm9yKCdzdHJlYW0ucHVzaCgpIGFmdGVyIEVPRicpO1xuICAgICAgc3RyZWFtLmVtaXQoJ2Vycm9yJywgZSk7XG4gICAgfSBlbHNlIGlmIChzdGF0ZS5lbmRFbWl0dGVkICYmIGFkZFRvRnJvbnQpIHtcbiAgICAgIHZhciBfZSA9IG5ldyBFcnJvcignc3RyZWFtLnVuc2hpZnQoKSBhZnRlciBlbmQgZXZlbnQnKTtcbiAgICAgIHN0cmVhbS5lbWl0KCdlcnJvcicsIF9lKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIHNraXBBZGQ7XG4gICAgICBpZiAoc3RhdGUuZGVjb2RlciAmJiAhYWRkVG9Gcm9udCAmJiAhZW5jb2RpbmcpIHtcbiAgICAgICAgY2h1bmsgPSBzdGF0ZS5kZWNvZGVyLndyaXRlKGNodW5rKTtcbiAgICAgICAgc2tpcEFkZCA9ICFzdGF0ZS5vYmplY3RNb2RlICYmIGNodW5rLmxlbmd0aCA9PT0gMDtcbiAgICAgIH1cblxuICAgICAgaWYgKCFhZGRUb0Zyb250KSBzdGF0ZS5yZWFkaW5nID0gZmFsc2U7XG5cbiAgICAgIC8vIERvbid0IGFkZCB0byB0aGUgYnVmZmVyIGlmIHdlJ3ZlIGRlY29kZWQgdG8gYW4gZW1wdHkgc3RyaW5nIGNodW5rIGFuZFxuICAgICAgLy8gd2UncmUgbm90IGluIG9iamVjdCBtb2RlXG4gICAgICBpZiAoIXNraXBBZGQpIHtcbiAgICAgICAgLy8gaWYgd2Ugd2FudCB0aGUgZGF0YSBub3csIGp1c3QgZW1pdCBpdC5cbiAgICAgICAgaWYgKHN0YXRlLmZsb3dpbmcgJiYgc3RhdGUubGVuZ3RoID09PSAwICYmICFzdGF0ZS5zeW5jKSB7XG4gICAgICAgICAgc3RyZWFtLmVtaXQoJ2RhdGEnLCBjaHVuayk7XG4gICAgICAgICAgc3RyZWFtLnJlYWQoMCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gdXBkYXRlIHRoZSBidWZmZXIgaW5mby5cbiAgICAgICAgICBzdGF0ZS5sZW5ndGggKz0gc3RhdGUub2JqZWN0TW9kZSA/IDEgOiBjaHVuay5sZW5ndGg7XG4gICAgICAgICAgaWYgKGFkZFRvRnJvbnQpIHN0YXRlLmJ1ZmZlci51bnNoaWZ0KGNodW5rKTtlbHNlIHN0YXRlLmJ1ZmZlci5wdXNoKGNodW5rKTtcblxuICAgICAgICAgIGlmIChzdGF0ZS5uZWVkUmVhZGFibGUpIGVtaXRSZWFkYWJsZShzdHJlYW0pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIG1heWJlUmVhZE1vcmUoc3RyZWFtLCBzdGF0ZSk7XG4gICAgfVxuICB9IGVsc2UgaWYgKCFhZGRUb0Zyb250KSB7XG4gICAgc3RhdGUucmVhZGluZyA9IGZhbHNlO1xuICB9XG5cbiAgcmV0dXJuIG5lZWRNb3JlRGF0YShzdGF0ZSk7XG59XG5cbi8vIGlmIGl0J3MgcGFzdCB0aGUgaGlnaCB3YXRlciBtYXJrLCB3ZSBjYW4gcHVzaCBpbiBzb21lIG1vcmUuXG4vLyBBbHNvLCBpZiB3ZSBoYXZlIG5vIGRhdGEgeWV0LCB3ZSBjYW4gc3RhbmQgc29tZVxuLy8gbW9yZSBieXRlcy4gIFRoaXMgaXMgdG8gd29yayBhcm91bmQgY2FzZXMgd2hlcmUgaHdtPTAsXG4vLyBzdWNoIGFzIHRoZSByZXBsLiAgQWxzbywgaWYgdGhlIHB1c2goKSB0cmlnZ2VyZWQgYVxuLy8gcmVhZGFibGUgZXZlbnQsIGFuZCB0aGUgdXNlciBjYWxsZWQgcmVhZChsYXJnZU51bWJlcikgc3VjaCB0aGF0XG4vLyBuZWVkUmVhZGFibGUgd2FzIHNldCwgdGhlbiB3ZSBvdWdodCB0byBwdXNoIG1vcmUsIHNvIHRoYXQgYW5vdGhlclxuLy8gJ3JlYWRhYmxlJyBldmVudCB3aWxsIGJlIHRyaWdnZXJlZC5cbmZ1bmN0aW9uIG5lZWRNb3JlRGF0YShzdGF0ZSkge1xuICByZXR1cm4gIXN0YXRlLmVuZGVkICYmIChzdGF0ZS5uZWVkUmVhZGFibGUgfHwgc3RhdGUubGVuZ3RoIDwgc3RhdGUuaGlnaFdhdGVyTWFyayB8fCBzdGF0ZS5sZW5ndGggPT09IDApO1xufVxuXG4vLyBiYWNrd2FyZHMgY29tcGF0aWJpbGl0eS5cblJlYWRhYmxlLnByb3RvdHlwZS5zZXRFbmNvZGluZyA9IGZ1bmN0aW9uIChlbmMpIHtcbiAgaWYgKCFTdHJpbmdEZWNvZGVyKSBTdHJpbmdEZWNvZGVyID0gcmVxdWlyZSgnc3RyaW5nX2RlY29kZXIvJykuU3RyaW5nRGVjb2RlcjtcbiAgdGhpcy5fcmVhZGFibGVTdGF0ZS5kZWNvZGVyID0gbmV3IFN0cmluZ0RlY29kZXIoZW5jKTtcbiAgdGhpcy5fcmVhZGFibGVTdGF0ZS5lbmNvZGluZyA9IGVuYztcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vLyBEb24ndCByYWlzZSB0aGUgaHdtID4gOE1CXG52YXIgTUFYX0hXTSA9IDB4ODAwMDAwO1xuZnVuY3Rpb24gY29tcHV0ZU5ld0hpZ2hXYXRlck1hcmsobikge1xuICBpZiAobiA+PSBNQVhfSFdNKSB7XG4gICAgbiA9IE1BWF9IV007XG4gIH0gZWxzZSB7XG4gICAgLy8gR2V0IHRoZSBuZXh0IGhpZ2hlc3QgcG93ZXIgb2YgMiB0byBwcmV2ZW50IGluY3JlYXNpbmcgaHdtIGV4Y2Vzc2l2ZWx5IGluXG4gICAgLy8gdGlueSBhbW91bnRzXG4gICAgbi0tO1xuICAgIG4gfD0gbiA+Pj4gMTtcbiAgICBuIHw9IG4gPj4+IDI7XG4gICAgbiB8PSBuID4+PiA0O1xuICAgIG4gfD0gbiA+Pj4gODtcbiAgICBuIHw9IG4gPj4+IDE2O1xuICAgIG4rKztcbiAgfVxuICByZXR1cm4gbjtcbn1cblxuLy8gVGhpcyBmdW5jdGlvbiBpcyBkZXNpZ25lZCB0byBiZSBpbmxpbmFibGUsIHNvIHBsZWFzZSB0YWtlIGNhcmUgd2hlbiBtYWtpbmdcbi8vIGNoYW5nZXMgdG8gdGhlIGZ1bmN0aW9uIGJvZHkuXG5mdW5jdGlvbiBob3dNdWNoVG9SZWFkKG4sIHN0YXRlKSB7XG4gIGlmIChuIDw9IDAgfHwgc3RhdGUubGVuZ3RoID09PSAwICYmIHN0YXRlLmVuZGVkKSByZXR1cm4gMDtcbiAgaWYgKHN0YXRlLm9iamVjdE1vZGUpIHJldHVybiAxO1xuICBpZiAobiAhPT0gbikge1xuICAgIC8vIE9ubHkgZmxvdyBvbmUgYnVmZmVyIGF0IGEgdGltZVxuICAgIGlmIChzdGF0ZS5mbG93aW5nICYmIHN0YXRlLmxlbmd0aCkgcmV0dXJuIHN0YXRlLmJ1ZmZlci5oZWFkLmRhdGEubGVuZ3RoO2Vsc2UgcmV0dXJuIHN0YXRlLmxlbmd0aDtcbiAgfVxuICAvLyBJZiB3ZSdyZSBhc2tpbmcgZm9yIG1vcmUgdGhhbiB0aGUgY3VycmVudCBod20sIHRoZW4gcmFpc2UgdGhlIGh3bS5cbiAgaWYgKG4gPiBzdGF0ZS5oaWdoV2F0ZXJNYXJrKSBzdGF0ZS5oaWdoV2F0ZXJNYXJrID0gY29tcHV0ZU5ld0hpZ2hXYXRlck1hcmsobik7XG4gIGlmIChuIDw9IHN0YXRlLmxlbmd0aCkgcmV0dXJuIG47XG4gIC8vIERvbid0IGhhdmUgZW5vdWdoXG4gIGlmICghc3RhdGUuZW5kZWQpIHtcbiAgICBzdGF0ZS5uZWVkUmVhZGFibGUgPSB0cnVlO1xuICAgIHJldHVybiAwO1xuICB9XG4gIHJldHVybiBzdGF0ZS5sZW5ndGg7XG59XG5cbi8vIHlvdSBjYW4gb3ZlcnJpZGUgZWl0aGVyIHRoaXMgbWV0aG9kLCBvciB0aGUgYXN5bmMgX3JlYWQobikgYmVsb3cuXG5SZWFkYWJsZS5wcm90b3R5cGUucmVhZCA9IGZ1bmN0aW9uIChuKSB7XG4gIGRlYnVnKCdyZWFkJywgbik7XG4gIG4gPSBwYXJzZUludChuLCAxMCk7XG4gIHZhciBzdGF0ZSA9IHRoaXMuX3JlYWRhYmxlU3RhdGU7XG4gIHZhciBuT3JpZyA9IG47XG5cbiAgaWYgKG4gIT09IDApIHN0YXRlLmVtaXR0ZWRSZWFkYWJsZSA9IGZhbHNlO1xuXG4gIC8vIGlmIHdlJ3JlIGRvaW5nIHJlYWQoMCkgdG8gdHJpZ2dlciBhIHJlYWRhYmxlIGV2ZW50LCBidXQgd2VcbiAgLy8gYWxyZWFkeSBoYXZlIGEgYnVuY2ggb2YgZGF0YSBpbiB0aGUgYnVmZmVyLCB0aGVuIGp1c3QgdHJpZ2dlclxuICAvLyB0aGUgJ3JlYWRhYmxlJyBldmVudCBhbmQgbW92ZSBvbi5cbiAgaWYgKG4gPT09IDAgJiYgc3RhdGUubmVlZFJlYWRhYmxlICYmIChzdGF0ZS5sZW5ndGggPj0gc3RhdGUuaGlnaFdhdGVyTWFyayB8fCBzdGF0ZS5lbmRlZCkpIHtcbiAgICBkZWJ1ZygncmVhZDogZW1pdFJlYWRhYmxlJywgc3RhdGUubGVuZ3RoLCBzdGF0ZS5lbmRlZCk7XG4gICAgaWYgKHN0YXRlLmxlbmd0aCA9PT0gMCAmJiBzdGF0ZS5lbmRlZCkgZW5kUmVhZGFibGUodGhpcyk7ZWxzZSBlbWl0UmVhZGFibGUodGhpcyk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBuID0gaG93TXVjaFRvUmVhZChuLCBzdGF0ZSk7XG5cbiAgLy8gaWYgd2UndmUgZW5kZWQsIGFuZCB3ZSdyZSBub3cgY2xlYXIsIHRoZW4gZmluaXNoIGl0IHVwLlxuICBpZiAobiA9PT0gMCAmJiBzdGF0ZS5lbmRlZCkge1xuICAgIGlmIChzdGF0ZS5sZW5ndGggPT09IDApIGVuZFJlYWRhYmxlKHRoaXMpO1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLy8gQWxsIHRoZSBhY3R1YWwgY2h1bmsgZ2VuZXJhdGlvbiBsb2dpYyBuZWVkcyB0byBiZVxuICAvLyAqYmVsb3cqIHRoZSBjYWxsIHRvIF9yZWFkLiAgVGhlIHJlYXNvbiBpcyB0aGF0IGluIGNlcnRhaW5cbiAgLy8gc3ludGhldGljIHN0cmVhbSBjYXNlcywgc3VjaCBhcyBwYXNzdGhyb3VnaCBzdHJlYW1zLCBfcmVhZFxuICAvLyBtYXkgYmUgYSBjb21wbGV0ZWx5IHN5bmNocm9ub3VzIG9wZXJhdGlvbiB3aGljaCBtYXkgY2hhbmdlXG4gIC8vIHRoZSBzdGF0ZSBvZiB0aGUgcmVhZCBidWZmZXIsIHByb3ZpZGluZyBlbm91Z2ggZGF0YSB3aGVuXG4gIC8vIGJlZm9yZSB0aGVyZSB3YXMgKm5vdCogZW5vdWdoLlxuICAvL1xuICAvLyBTbywgdGhlIHN0ZXBzIGFyZTpcbiAgLy8gMS4gRmlndXJlIG91dCB3aGF0IHRoZSBzdGF0ZSBvZiB0aGluZ3Mgd2lsbCBiZSBhZnRlciB3ZSBkb1xuICAvLyBhIHJlYWQgZnJvbSB0aGUgYnVmZmVyLlxuICAvL1xuICAvLyAyLiBJZiB0aGF0IHJlc3VsdGluZyBzdGF0ZSB3aWxsIHRyaWdnZXIgYSBfcmVhZCwgdGhlbiBjYWxsIF9yZWFkLlxuICAvLyBOb3RlIHRoYXQgdGhpcyBtYXkgYmUgYXN5bmNocm9ub3VzLCBvciBzeW5jaHJvbm91cy4gIFllcywgaXQgaXNcbiAgLy8gZGVlcGx5IHVnbHkgdG8gd3JpdGUgQVBJcyB0aGlzIHdheSwgYnV0IHRoYXQgc3RpbGwgZG9lc24ndCBtZWFuXG4gIC8vIHRoYXQgdGhlIFJlYWRhYmxlIGNsYXNzIHNob3VsZCBiZWhhdmUgaW1wcm9wZXJseSwgYXMgc3RyZWFtcyBhcmVcbiAgLy8gZGVzaWduZWQgdG8gYmUgc3luYy9hc3luYyBhZ25vc3RpYy5cbiAgLy8gVGFrZSBub3RlIGlmIHRoZSBfcmVhZCBjYWxsIGlzIHN5bmMgb3IgYXN5bmMgKGllLCBpZiB0aGUgcmVhZCBjYWxsXG4gIC8vIGhhcyByZXR1cm5lZCB5ZXQpLCBzbyB0aGF0IHdlIGtub3cgd2hldGhlciBvciBub3QgaXQncyBzYWZlIHRvIGVtaXRcbiAgLy8gJ3JlYWRhYmxlJyBldGMuXG4gIC8vXG4gIC8vIDMuIEFjdHVhbGx5IHB1bGwgdGhlIHJlcXVlc3RlZCBjaHVua3Mgb3V0IG9mIHRoZSBidWZmZXIgYW5kIHJldHVybi5cblxuICAvLyBpZiB3ZSBuZWVkIGEgcmVhZGFibGUgZXZlbnQsIHRoZW4gd2UgbmVlZCB0byBkbyBzb21lIHJlYWRpbmcuXG4gIHZhciBkb1JlYWQgPSBzdGF0ZS5uZWVkUmVhZGFibGU7XG4gIGRlYnVnKCduZWVkIHJlYWRhYmxlJywgZG9SZWFkKTtcblxuICAvLyBpZiB3ZSBjdXJyZW50bHkgaGF2ZSBsZXNzIHRoYW4gdGhlIGhpZ2hXYXRlck1hcmssIHRoZW4gYWxzbyByZWFkIHNvbWVcbiAgaWYgKHN0YXRlLmxlbmd0aCA9PT0gMCB8fCBzdGF0ZS5sZW5ndGggLSBuIDwgc3RhdGUuaGlnaFdhdGVyTWFyaykge1xuICAgIGRvUmVhZCA9IHRydWU7XG4gICAgZGVidWcoJ2xlbmd0aCBsZXNzIHRoYW4gd2F0ZXJtYXJrJywgZG9SZWFkKTtcbiAgfVxuXG4gIC8vIGhvd2V2ZXIsIGlmIHdlJ3ZlIGVuZGVkLCB0aGVuIHRoZXJlJ3Mgbm8gcG9pbnQsIGFuZCBpZiB3ZSdyZSBhbHJlYWR5XG4gIC8vIHJlYWRpbmcsIHRoZW4gaXQncyB1bm5lY2Vzc2FyeS5cbiAgaWYgKHN0YXRlLmVuZGVkIHx8IHN0YXRlLnJlYWRpbmcpIHtcbiAgICBkb1JlYWQgPSBmYWxzZTtcbiAgICBkZWJ1ZygncmVhZGluZyBvciBlbmRlZCcsIGRvUmVhZCk7XG4gIH0gZWxzZSBpZiAoZG9SZWFkKSB7XG4gICAgZGVidWcoJ2RvIHJlYWQnKTtcbiAgICBzdGF0ZS5yZWFkaW5nID0gdHJ1ZTtcbiAgICBzdGF0ZS5zeW5jID0gdHJ1ZTtcbiAgICAvLyBpZiB0aGUgbGVuZ3RoIGlzIGN1cnJlbnRseSB6ZXJvLCB0aGVuIHdlICpuZWVkKiBhIHJlYWRhYmxlIGV2ZW50LlxuICAgIGlmIChzdGF0ZS5sZW5ndGggPT09IDApIHN0YXRlLm5lZWRSZWFkYWJsZSA9IHRydWU7XG4gICAgLy8gY2FsbCBpbnRlcm5hbCByZWFkIG1ldGhvZFxuICAgIHRoaXMuX3JlYWQoc3RhdGUuaGlnaFdhdGVyTWFyayk7XG4gICAgc3RhdGUuc3luYyA9IGZhbHNlO1xuICAgIC8vIElmIF9yZWFkIHB1c2hlZCBkYXRhIHN5bmNocm9ub3VzbHksIHRoZW4gYHJlYWRpbmdgIHdpbGwgYmUgZmFsc2UsXG4gICAgLy8gYW5kIHdlIG5lZWQgdG8gcmUtZXZhbHVhdGUgaG93IG11Y2ggZGF0YSB3ZSBjYW4gcmV0dXJuIHRvIHRoZSB1c2VyLlxuICAgIGlmICghc3RhdGUucmVhZGluZykgbiA9IGhvd011Y2hUb1JlYWQobk9yaWcsIHN0YXRlKTtcbiAgfVxuXG4gIHZhciByZXQ7XG4gIGlmIChuID4gMCkgcmV0ID0gZnJvbUxpc3Qobiwgc3RhdGUpO2Vsc2UgcmV0ID0gbnVsbDtcblxuICBpZiAocmV0ID09PSBudWxsKSB7XG4gICAgc3RhdGUubmVlZFJlYWRhYmxlID0gdHJ1ZTtcbiAgICBuID0gMDtcbiAgfSBlbHNlIHtcbiAgICBzdGF0ZS5sZW5ndGggLT0gbjtcbiAgfVxuXG4gIGlmIChzdGF0ZS5sZW5ndGggPT09IDApIHtcbiAgICAvLyBJZiB3ZSBoYXZlIG5vdGhpbmcgaW4gdGhlIGJ1ZmZlciwgdGhlbiB3ZSB3YW50IHRvIGtub3dcbiAgICAvLyBhcyBzb29uIGFzIHdlICpkbyogZ2V0IHNvbWV0aGluZyBpbnRvIHRoZSBidWZmZXIuXG4gICAgaWYgKCFzdGF0ZS5lbmRlZCkgc3RhdGUubmVlZFJlYWRhYmxlID0gdHJ1ZTtcblxuICAgIC8vIElmIHdlIHRyaWVkIHRvIHJlYWQoKSBwYXN0IHRoZSBFT0YsIHRoZW4gZW1pdCBlbmQgb24gdGhlIG5leHQgdGljay5cbiAgICBpZiAobk9yaWcgIT09IG4gJiYgc3RhdGUuZW5kZWQpIGVuZFJlYWRhYmxlKHRoaXMpO1xuICB9XG5cbiAgaWYgKHJldCAhPT0gbnVsbCkgdGhpcy5lbWl0KCdkYXRhJywgcmV0KTtcblxuICByZXR1cm4gcmV0O1xufTtcblxuZnVuY3Rpb24gY2h1bmtJbnZhbGlkKHN0YXRlLCBjaHVuaykge1xuICB2YXIgZXIgPSBudWxsO1xuICBpZiAoIUJ1ZmZlci5pc0J1ZmZlcihjaHVuaykgJiYgdHlwZW9mIGNodW5rICE9PSAnc3RyaW5nJyAmJiBjaHVuayAhPT0gbnVsbCAmJiBjaHVuayAhPT0gdW5kZWZpbmVkICYmICFzdGF0ZS5vYmplY3RNb2RlKSB7XG4gICAgZXIgPSBuZXcgVHlwZUVycm9yKCdJbnZhbGlkIG5vbi1zdHJpbmcvYnVmZmVyIGNodW5rJyk7XG4gIH1cbiAgcmV0dXJuIGVyO1xufVxuXG5mdW5jdGlvbiBvbkVvZkNodW5rKHN0cmVhbSwgc3RhdGUpIHtcbiAgaWYgKHN0YXRlLmVuZGVkKSByZXR1cm47XG4gIGlmIChzdGF0ZS5kZWNvZGVyKSB7XG4gICAgdmFyIGNodW5rID0gc3RhdGUuZGVjb2Rlci5lbmQoKTtcbiAgICBpZiAoY2h1bmsgJiYgY2h1bmsubGVuZ3RoKSB7XG4gICAgICBzdGF0ZS5idWZmZXIucHVzaChjaHVuayk7XG4gICAgICBzdGF0ZS5sZW5ndGggKz0gc3RhdGUub2JqZWN0TW9kZSA/IDEgOiBjaHVuay5sZW5ndGg7XG4gICAgfVxuICB9XG4gIHN0YXRlLmVuZGVkID0gdHJ1ZTtcblxuICAvLyBlbWl0ICdyZWFkYWJsZScgbm93IHRvIG1ha2Ugc3VyZSBpdCBnZXRzIHBpY2tlZCB1cC5cbiAgZW1pdFJlYWRhYmxlKHN0cmVhbSk7XG59XG5cbi8vIERvbid0IGVtaXQgcmVhZGFibGUgcmlnaHQgYXdheSBpbiBzeW5jIG1vZGUsIGJlY2F1c2UgdGhpcyBjYW4gdHJpZ2dlclxuLy8gYW5vdGhlciByZWFkKCkgY2FsbCA9PiBzdGFjayBvdmVyZmxvdy4gIFRoaXMgd2F5LCBpdCBtaWdodCB0cmlnZ2VyXG4vLyBhIG5leHRUaWNrIHJlY3Vyc2lvbiB3YXJuaW5nLCBidXQgdGhhdCdzIG5vdCBzbyBiYWQuXG5mdW5jdGlvbiBlbWl0UmVhZGFibGUoc3RyZWFtKSB7XG4gIHZhciBzdGF0ZSA9IHN0cmVhbS5fcmVhZGFibGVTdGF0ZTtcbiAgc3RhdGUubmVlZFJlYWRhYmxlID0gZmFsc2U7XG4gIGlmICghc3RhdGUuZW1pdHRlZFJlYWRhYmxlKSB7XG4gICAgZGVidWcoJ2VtaXRSZWFkYWJsZScsIHN0YXRlLmZsb3dpbmcpO1xuICAgIHN0YXRlLmVtaXR0ZWRSZWFkYWJsZSA9IHRydWU7XG4gICAgaWYgKHN0YXRlLnN5bmMpIHByb2Nlc3NOZXh0VGljayhlbWl0UmVhZGFibGVfLCBzdHJlYW0pO2Vsc2UgZW1pdFJlYWRhYmxlXyhzdHJlYW0pO1xuICB9XG59XG5cbmZ1bmN0aW9uIGVtaXRSZWFkYWJsZV8oc3RyZWFtKSB7XG4gIGRlYnVnKCdlbWl0IHJlYWRhYmxlJyk7XG4gIHN0cmVhbS5lbWl0KCdyZWFkYWJsZScpO1xuICBmbG93KHN0cmVhbSk7XG59XG5cbi8vIGF0IHRoaXMgcG9pbnQsIHRoZSB1c2VyIGhhcyBwcmVzdW1hYmx5IHNlZW4gdGhlICdyZWFkYWJsZScgZXZlbnQsXG4vLyBhbmQgY2FsbGVkIHJlYWQoKSB0byBjb25zdW1lIHNvbWUgZGF0YS4gIHRoYXQgbWF5IGhhdmUgdHJpZ2dlcmVkXG4vLyBpbiB0dXJuIGFub3RoZXIgX3JlYWQobikgY2FsbCwgaW4gd2hpY2ggY2FzZSByZWFkaW5nID0gdHJ1ZSBpZlxuLy8gaXQncyBpbiBwcm9ncmVzcy5cbi8vIEhvd2V2ZXIsIGlmIHdlJ3JlIG5vdCBlbmRlZCwgb3IgcmVhZGluZywgYW5kIHRoZSBsZW5ndGggPCBod20sXG4vLyB0aGVuIGdvIGFoZWFkIGFuZCB0cnkgdG8gcmVhZCBzb21lIG1vcmUgcHJlZW1wdGl2ZWx5LlxuZnVuY3Rpb24gbWF5YmVSZWFkTW9yZShzdHJlYW0sIHN0YXRlKSB7XG4gIGlmICghc3RhdGUucmVhZGluZ01vcmUpIHtcbiAgICBzdGF0ZS5yZWFkaW5nTW9yZSA9IHRydWU7XG4gICAgcHJvY2Vzc05leHRUaWNrKG1heWJlUmVhZE1vcmVfLCBzdHJlYW0sIHN0YXRlKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBtYXliZVJlYWRNb3JlXyhzdHJlYW0sIHN0YXRlKSB7XG4gIHZhciBsZW4gPSBzdGF0ZS5sZW5ndGg7XG4gIHdoaWxlICghc3RhdGUucmVhZGluZyAmJiAhc3RhdGUuZmxvd2luZyAmJiAhc3RhdGUuZW5kZWQgJiYgc3RhdGUubGVuZ3RoIDwgc3RhdGUuaGlnaFdhdGVyTWFyaykge1xuICAgIGRlYnVnKCdtYXliZVJlYWRNb3JlIHJlYWQgMCcpO1xuICAgIHN0cmVhbS5yZWFkKDApO1xuICAgIGlmIChsZW4gPT09IHN0YXRlLmxlbmd0aClcbiAgICAgIC8vIGRpZG4ndCBnZXQgYW55IGRhdGEsIHN0b3Agc3Bpbm5pbmcuXG4gICAgICBicmVhaztlbHNlIGxlbiA9IHN0YXRlLmxlbmd0aDtcbiAgfVxuICBzdGF0ZS5yZWFkaW5nTW9yZSA9IGZhbHNlO1xufVxuXG4vLyBhYnN0cmFjdCBtZXRob2QuICB0byBiZSBvdmVycmlkZGVuIGluIHNwZWNpZmljIGltcGxlbWVudGF0aW9uIGNsYXNzZXMuXG4vLyBjYWxsIGNiKGVyLCBkYXRhKSB3aGVyZSBkYXRhIGlzIDw9IG4gaW4gbGVuZ3RoLlxuLy8gZm9yIHZpcnR1YWwgKG5vbi1zdHJpbmcsIG5vbi1idWZmZXIpIHN0cmVhbXMsIFwibGVuZ3RoXCIgaXMgc29tZXdoYXRcbi8vIGFyYml0cmFyeSwgYW5kIHBlcmhhcHMgbm90IHZlcnkgbWVhbmluZ2Z1bC5cblJlYWRhYmxlLnByb3RvdHlwZS5fcmVhZCA9IGZ1bmN0aW9uIChuKSB7XG4gIHRoaXMuZW1pdCgnZXJyb3InLCBuZXcgRXJyb3IoJ19yZWFkKCkgaXMgbm90IGltcGxlbWVudGVkJykpO1xufTtcblxuUmVhZGFibGUucHJvdG90eXBlLnBpcGUgPSBmdW5jdGlvbiAoZGVzdCwgcGlwZU9wdHMpIHtcbiAgdmFyIHNyYyA9IHRoaXM7XG4gIHZhciBzdGF0ZSA9IHRoaXMuX3JlYWRhYmxlU3RhdGU7XG5cbiAgc3dpdGNoIChzdGF0ZS5waXBlc0NvdW50KSB7XG4gICAgY2FzZSAwOlxuICAgICAgc3RhdGUucGlwZXMgPSBkZXN0O1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAxOlxuICAgICAgc3RhdGUucGlwZXMgPSBbc3RhdGUucGlwZXMsIGRlc3RdO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIHN0YXRlLnBpcGVzLnB1c2goZGVzdCk7XG4gICAgICBicmVhaztcbiAgfVxuICBzdGF0ZS5waXBlc0NvdW50ICs9IDE7XG4gIGRlYnVnKCdwaXBlIGNvdW50PSVkIG9wdHM9JWonLCBzdGF0ZS5waXBlc0NvdW50LCBwaXBlT3B0cyk7XG5cbiAgdmFyIGRvRW5kID0gKCFwaXBlT3B0cyB8fCBwaXBlT3B0cy5lbmQgIT09IGZhbHNlKSAmJiBkZXN0ICE9PSBwcm9jZXNzLnN0ZG91dCAmJiBkZXN0ICE9PSBwcm9jZXNzLnN0ZGVycjtcblxuICB2YXIgZW5kRm4gPSBkb0VuZCA/IG9uZW5kIDogY2xlYW51cDtcbiAgaWYgKHN0YXRlLmVuZEVtaXR0ZWQpIHByb2Nlc3NOZXh0VGljayhlbmRGbik7ZWxzZSBzcmMub25jZSgnZW5kJywgZW5kRm4pO1xuXG4gIGRlc3Qub24oJ3VucGlwZScsIG9udW5waXBlKTtcbiAgZnVuY3Rpb24gb251bnBpcGUocmVhZGFibGUpIHtcbiAgICBkZWJ1Zygnb251bnBpcGUnKTtcbiAgICBpZiAocmVhZGFibGUgPT09IHNyYykge1xuICAgICAgY2xlYW51cCgpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIG9uZW5kKCkge1xuICAgIGRlYnVnKCdvbmVuZCcpO1xuICAgIGRlc3QuZW5kKCk7XG4gIH1cblxuICAvLyB3aGVuIHRoZSBkZXN0IGRyYWlucywgaXQgcmVkdWNlcyB0aGUgYXdhaXREcmFpbiBjb3VudGVyXG4gIC8vIG9uIHRoZSBzb3VyY2UuICBUaGlzIHdvdWxkIGJlIG1vcmUgZWxlZ2FudCB3aXRoIGEgLm9uY2UoKVxuICAvLyBoYW5kbGVyIGluIGZsb3coKSwgYnV0IGFkZGluZyBhbmQgcmVtb3ZpbmcgcmVwZWF0ZWRseSBpc1xuICAvLyB0b28gc2xvdy5cbiAgdmFyIG9uZHJhaW4gPSBwaXBlT25EcmFpbihzcmMpO1xuICBkZXN0Lm9uKCdkcmFpbicsIG9uZHJhaW4pO1xuXG4gIHZhciBjbGVhbmVkVXAgPSBmYWxzZTtcbiAgZnVuY3Rpb24gY2xlYW51cCgpIHtcbiAgICBkZWJ1ZygnY2xlYW51cCcpO1xuICAgIC8vIGNsZWFudXAgZXZlbnQgaGFuZGxlcnMgb25jZSB0aGUgcGlwZSBpcyBicm9rZW5cbiAgICBkZXN0LnJlbW92ZUxpc3RlbmVyKCdjbG9zZScsIG9uY2xvc2UpO1xuICAgIGRlc3QucmVtb3ZlTGlzdGVuZXIoJ2ZpbmlzaCcsIG9uZmluaXNoKTtcbiAgICBkZXN0LnJlbW92ZUxpc3RlbmVyKCdkcmFpbicsIG9uZHJhaW4pO1xuICAgIGRlc3QucmVtb3ZlTGlzdGVuZXIoJ2Vycm9yJywgb25lcnJvcik7XG4gICAgZGVzdC5yZW1vdmVMaXN0ZW5lcigndW5waXBlJywgb251bnBpcGUpO1xuICAgIHNyYy5yZW1vdmVMaXN0ZW5lcignZW5kJywgb25lbmQpO1xuICAgIHNyYy5yZW1vdmVMaXN0ZW5lcignZW5kJywgY2xlYW51cCk7XG4gICAgc3JjLnJlbW92ZUxpc3RlbmVyKCdkYXRhJywgb25kYXRhKTtcblxuICAgIGNsZWFuZWRVcCA9IHRydWU7XG5cbiAgICAvLyBpZiB0aGUgcmVhZGVyIGlzIHdhaXRpbmcgZm9yIGEgZHJhaW4gZXZlbnQgZnJvbSB0aGlzXG4gICAgLy8gc3BlY2lmaWMgd3JpdGVyLCB0aGVuIGl0IHdvdWxkIGNhdXNlIGl0IHRvIG5ldmVyIHN0YXJ0XG4gICAgLy8gZmxvd2luZyBhZ2Fpbi5cbiAgICAvLyBTbywgaWYgdGhpcyBpcyBhd2FpdGluZyBhIGRyYWluLCB0aGVuIHdlIGp1c3QgY2FsbCBpdCBub3cuXG4gICAgLy8gSWYgd2UgZG9uJ3Qga25vdywgdGhlbiBhc3N1bWUgdGhhdCB3ZSBhcmUgd2FpdGluZyBmb3Igb25lLlxuICAgIGlmIChzdGF0ZS5hd2FpdERyYWluICYmICghZGVzdC5fd3JpdGFibGVTdGF0ZSB8fCBkZXN0Ll93cml0YWJsZVN0YXRlLm5lZWREcmFpbikpIG9uZHJhaW4oKTtcbiAgfVxuXG4gIC8vIElmIHRoZSB1c2VyIHB1c2hlcyBtb3JlIGRhdGEgd2hpbGUgd2UncmUgd3JpdGluZyB0byBkZXN0IHRoZW4gd2UnbGwgZW5kIHVwXG4gIC8vIGluIG9uZGF0YSBhZ2Fpbi4gSG93ZXZlciwgd2Ugb25seSB3YW50IHRvIGluY3JlYXNlIGF3YWl0RHJhaW4gb25jZSBiZWNhdXNlXG4gIC8vIGRlc3Qgd2lsbCBvbmx5IGVtaXQgb25lICdkcmFpbicgZXZlbnQgZm9yIHRoZSBtdWx0aXBsZSB3cml0ZXMuXG4gIC8vID0+IEludHJvZHVjZSBhIGd1YXJkIG9uIGluY3JlYXNpbmcgYXdhaXREcmFpbi5cbiAgdmFyIGluY3JlYXNlZEF3YWl0RHJhaW4gPSBmYWxzZTtcbiAgc3JjLm9uKCdkYXRhJywgb25kYXRhKTtcbiAgZnVuY3Rpb24gb25kYXRhKGNodW5rKSB7XG4gICAgZGVidWcoJ29uZGF0YScpO1xuICAgIGluY3JlYXNlZEF3YWl0RHJhaW4gPSBmYWxzZTtcbiAgICB2YXIgcmV0ID0gZGVzdC53cml0ZShjaHVuayk7XG4gICAgaWYgKGZhbHNlID09PSByZXQgJiYgIWluY3JlYXNlZEF3YWl0RHJhaW4pIHtcbiAgICAgIC8vIElmIHRoZSB1c2VyIHVucGlwZWQgZHVyaW5nIGBkZXN0LndyaXRlKClgLCBpdCBpcyBwb3NzaWJsZVxuICAgICAgLy8gdG8gZ2V0IHN0dWNrIGluIGEgcGVybWFuZW50bHkgcGF1c2VkIHN0YXRlIGlmIHRoYXQgd3JpdGVcbiAgICAgIC8vIGFsc28gcmV0dXJuZWQgZmFsc2UuXG4gICAgICAvLyA9PiBDaGVjayB3aGV0aGVyIGBkZXN0YCBpcyBzdGlsbCBhIHBpcGluZyBkZXN0aW5hdGlvbi5cbiAgICAgIGlmICgoc3RhdGUucGlwZXNDb3VudCA9PT0gMSAmJiBzdGF0ZS5waXBlcyA9PT0gZGVzdCB8fCBzdGF0ZS5waXBlc0NvdW50ID4gMSAmJiBpbmRleE9mKHN0YXRlLnBpcGVzLCBkZXN0KSAhPT0gLTEpICYmICFjbGVhbmVkVXApIHtcbiAgICAgICAgZGVidWcoJ2ZhbHNlIHdyaXRlIHJlc3BvbnNlLCBwYXVzZScsIHNyYy5fcmVhZGFibGVTdGF0ZS5hd2FpdERyYWluKTtcbiAgICAgICAgc3JjLl9yZWFkYWJsZVN0YXRlLmF3YWl0RHJhaW4rKztcbiAgICAgICAgaW5jcmVhc2VkQXdhaXREcmFpbiA9IHRydWU7XG4gICAgICB9XG4gICAgICBzcmMucGF1c2UoKTtcbiAgICB9XG4gIH1cblxuICAvLyBpZiB0aGUgZGVzdCBoYXMgYW4gZXJyb3IsIHRoZW4gc3RvcCBwaXBpbmcgaW50byBpdC5cbiAgLy8gaG93ZXZlciwgZG9uJ3Qgc3VwcHJlc3MgdGhlIHRocm93aW5nIGJlaGF2aW9yIGZvciB0aGlzLlxuICBmdW5jdGlvbiBvbmVycm9yKGVyKSB7XG4gICAgZGVidWcoJ29uZXJyb3InLCBlcik7XG4gICAgdW5waXBlKCk7XG4gICAgZGVzdC5yZW1vdmVMaXN0ZW5lcignZXJyb3InLCBvbmVycm9yKTtcbiAgICBpZiAoRUVsaXN0ZW5lckNvdW50KGRlc3QsICdlcnJvcicpID09PSAwKSBkZXN0LmVtaXQoJ2Vycm9yJywgZXIpO1xuICB9XG5cbiAgLy8gTWFrZSBzdXJlIG91ciBlcnJvciBoYW5kbGVyIGlzIGF0dGFjaGVkIGJlZm9yZSB1c2VybGFuZCBvbmVzLlxuICBwcmVwZW5kTGlzdGVuZXIoZGVzdCwgJ2Vycm9yJywgb25lcnJvcik7XG5cbiAgLy8gQm90aCBjbG9zZSBhbmQgZmluaXNoIHNob3VsZCB0cmlnZ2VyIHVucGlwZSwgYnV0IG9ubHkgb25jZS5cbiAgZnVuY3Rpb24gb25jbG9zZSgpIHtcbiAgICBkZXN0LnJlbW92ZUxpc3RlbmVyKCdmaW5pc2gnLCBvbmZpbmlzaCk7XG4gICAgdW5waXBlKCk7XG4gIH1cbiAgZGVzdC5vbmNlKCdjbG9zZScsIG9uY2xvc2UpO1xuICBmdW5jdGlvbiBvbmZpbmlzaCgpIHtcbiAgICBkZWJ1Zygnb25maW5pc2gnKTtcbiAgICBkZXN0LnJlbW92ZUxpc3RlbmVyKCdjbG9zZScsIG9uY2xvc2UpO1xuICAgIHVucGlwZSgpO1xuICB9XG4gIGRlc3Qub25jZSgnZmluaXNoJywgb25maW5pc2gpO1xuXG4gIGZ1bmN0aW9uIHVucGlwZSgpIHtcbiAgICBkZWJ1ZygndW5waXBlJyk7XG4gICAgc3JjLnVucGlwZShkZXN0KTtcbiAgfVxuXG4gIC8vIHRlbGwgdGhlIGRlc3QgdGhhdCBpdCdzIGJlaW5nIHBpcGVkIHRvXG4gIGRlc3QuZW1pdCgncGlwZScsIHNyYyk7XG5cbiAgLy8gc3RhcnQgdGhlIGZsb3cgaWYgaXQgaGFzbid0IGJlZW4gc3RhcnRlZCBhbHJlYWR5LlxuICBpZiAoIXN0YXRlLmZsb3dpbmcpIHtcbiAgICBkZWJ1ZygncGlwZSByZXN1bWUnKTtcbiAgICBzcmMucmVzdW1lKCk7XG4gIH1cblxuICByZXR1cm4gZGVzdDtcbn07XG5cbmZ1bmN0aW9uIHBpcGVPbkRyYWluKHNyYykge1xuICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgIHZhciBzdGF0ZSA9IHNyYy5fcmVhZGFibGVTdGF0ZTtcbiAgICBkZWJ1ZygncGlwZU9uRHJhaW4nLCBzdGF0ZS5hd2FpdERyYWluKTtcbiAgICBpZiAoc3RhdGUuYXdhaXREcmFpbikgc3RhdGUuYXdhaXREcmFpbi0tO1xuICAgIGlmIChzdGF0ZS5hd2FpdERyYWluID09PSAwICYmIEVFbGlzdGVuZXJDb3VudChzcmMsICdkYXRhJykpIHtcbiAgICAgIHN0YXRlLmZsb3dpbmcgPSB0cnVlO1xuICAgICAgZmxvdyhzcmMpO1xuICAgIH1cbiAgfTtcbn1cblxuUmVhZGFibGUucHJvdG90eXBlLnVucGlwZSA9IGZ1bmN0aW9uIChkZXN0KSB7XG4gIHZhciBzdGF0ZSA9IHRoaXMuX3JlYWRhYmxlU3RhdGU7XG5cbiAgLy8gaWYgd2UncmUgbm90IHBpcGluZyBhbnl3aGVyZSwgdGhlbiBkbyBub3RoaW5nLlxuICBpZiAoc3RhdGUucGlwZXNDb3VudCA9PT0gMCkgcmV0dXJuIHRoaXM7XG5cbiAgLy8ganVzdCBvbmUgZGVzdGluYXRpb24uICBtb3N0IGNvbW1vbiBjYXNlLlxuICBpZiAoc3RhdGUucGlwZXNDb3VudCA9PT0gMSkge1xuICAgIC8vIHBhc3NlZCBpbiBvbmUsIGJ1dCBpdCdzIG5vdCB0aGUgcmlnaHQgb25lLlxuICAgIGlmIChkZXN0ICYmIGRlc3QgIT09IHN0YXRlLnBpcGVzKSByZXR1cm4gdGhpcztcblxuICAgIGlmICghZGVzdCkgZGVzdCA9IHN0YXRlLnBpcGVzO1xuXG4gICAgLy8gZ290IGEgbWF0Y2guXG4gICAgc3RhdGUucGlwZXMgPSBudWxsO1xuICAgIHN0YXRlLnBpcGVzQ291bnQgPSAwO1xuICAgIHN0YXRlLmZsb3dpbmcgPSBmYWxzZTtcbiAgICBpZiAoZGVzdCkgZGVzdC5lbWl0KCd1bnBpcGUnLCB0aGlzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIHNsb3cgY2FzZS4gbXVsdGlwbGUgcGlwZSBkZXN0aW5hdGlvbnMuXG5cbiAgaWYgKCFkZXN0KSB7XG4gICAgLy8gcmVtb3ZlIGFsbC5cbiAgICB2YXIgZGVzdHMgPSBzdGF0ZS5waXBlcztcbiAgICB2YXIgbGVuID0gc3RhdGUucGlwZXNDb3VudDtcbiAgICBzdGF0ZS5waXBlcyA9IG51bGw7XG4gICAgc3RhdGUucGlwZXNDb3VudCA9IDA7XG4gICAgc3RhdGUuZmxvd2luZyA9IGZhbHNlO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgZGVzdHNbaV0uZW1pdCgndW5waXBlJywgdGhpcyk7XG4gICAgfXJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gdHJ5IHRvIGZpbmQgdGhlIHJpZ2h0IG9uZS5cbiAgdmFyIGluZGV4ID0gaW5kZXhPZihzdGF0ZS5waXBlcywgZGVzdCk7XG4gIGlmIChpbmRleCA9PT0gLTEpIHJldHVybiB0aGlzO1xuXG4gIHN0YXRlLnBpcGVzLnNwbGljZShpbmRleCwgMSk7XG4gIHN0YXRlLnBpcGVzQ291bnQgLT0gMTtcbiAgaWYgKHN0YXRlLnBpcGVzQ291bnQgPT09IDEpIHN0YXRlLnBpcGVzID0gc3RhdGUucGlwZXNbMF07XG5cbiAgZGVzdC5lbWl0KCd1bnBpcGUnLCB0aGlzKTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8vIHNldCB1cCBkYXRhIGV2ZW50cyBpZiB0aGV5IGFyZSBhc2tlZCBmb3Jcbi8vIEVuc3VyZSByZWFkYWJsZSBsaXN0ZW5lcnMgZXZlbnR1YWxseSBnZXQgc29tZXRoaW5nXG5SZWFkYWJsZS5wcm90b3R5cGUub24gPSBmdW5jdGlvbiAoZXYsIGZuKSB7XG4gIHZhciByZXMgPSBTdHJlYW0ucHJvdG90eXBlLm9uLmNhbGwodGhpcywgZXYsIGZuKTtcblxuICBpZiAoZXYgPT09ICdkYXRhJykge1xuICAgIC8vIFN0YXJ0IGZsb3dpbmcgb24gbmV4dCB0aWNrIGlmIHN0cmVhbSBpc24ndCBleHBsaWNpdGx5IHBhdXNlZFxuICAgIGlmICh0aGlzLl9yZWFkYWJsZVN0YXRlLmZsb3dpbmcgIT09IGZhbHNlKSB0aGlzLnJlc3VtZSgpO1xuICB9IGVsc2UgaWYgKGV2ID09PSAncmVhZGFibGUnKSB7XG4gICAgdmFyIHN0YXRlID0gdGhpcy5fcmVhZGFibGVTdGF0ZTtcbiAgICBpZiAoIXN0YXRlLmVuZEVtaXR0ZWQgJiYgIXN0YXRlLnJlYWRhYmxlTGlzdGVuaW5nKSB7XG4gICAgICBzdGF0ZS5yZWFkYWJsZUxpc3RlbmluZyA9IHN0YXRlLm5lZWRSZWFkYWJsZSA9IHRydWU7XG4gICAgICBzdGF0ZS5lbWl0dGVkUmVhZGFibGUgPSBmYWxzZTtcbiAgICAgIGlmICghc3RhdGUucmVhZGluZykge1xuICAgICAgICBwcm9jZXNzTmV4dFRpY2soblJlYWRpbmdOZXh0VGljaywgdGhpcyk7XG4gICAgICB9IGVsc2UgaWYgKHN0YXRlLmxlbmd0aCkge1xuICAgICAgICBlbWl0UmVhZGFibGUodGhpcywgc3RhdGUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiByZXM7XG59O1xuUmVhZGFibGUucHJvdG90eXBlLmFkZExpc3RlbmVyID0gUmVhZGFibGUucHJvdG90eXBlLm9uO1xuXG5mdW5jdGlvbiBuUmVhZGluZ05leHRUaWNrKHNlbGYpIHtcbiAgZGVidWcoJ3JlYWRhYmxlIG5leHR0aWNrIHJlYWQgMCcpO1xuICBzZWxmLnJlYWQoMCk7XG59XG5cbi8vIHBhdXNlKCkgYW5kIHJlc3VtZSgpIGFyZSByZW1uYW50cyBvZiB0aGUgbGVnYWN5IHJlYWRhYmxlIHN0cmVhbSBBUElcbi8vIElmIHRoZSB1c2VyIHVzZXMgdGhlbSwgdGhlbiBzd2l0Y2ggaW50byBvbGQgbW9kZS5cblJlYWRhYmxlLnByb3RvdHlwZS5yZXN1bWUgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBzdGF0ZSA9IHRoaXMuX3JlYWRhYmxlU3RhdGU7XG4gIGlmICghc3RhdGUuZmxvd2luZykge1xuICAgIGRlYnVnKCdyZXN1bWUnKTtcbiAgICBzdGF0ZS5mbG93aW5nID0gdHJ1ZTtcbiAgICByZXN1bWUodGhpcywgc3RhdGUpO1xuICB9XG4gIHJldHVybiB0aGlzO1xufTtcblxuZnVuY3Rpb24gcmVzdW1lKHN0cmVhbSwgc3RhdGUpIHtcbiAgaWYgKCFzdGF0ZS5yZXN1bWVTY2hlZHVsZWQpIHtcbiAgICBzdGF0ZS5yZXN1bWVTY2hlZHVsZWQgPSB0cnVlO1xuICAgIHByb2Nlc3NOZXh0VGljayhyZXN1bWVfLCBzdHJlYW0sIHN0YXRlKTtcbiAgfVxufVxuXG5mdW5jdGlvbiByZXN1bWVfKHN0cmVhbSwgc3RhdGUpIHtcbiAgaWYgKCFzdGF0ZS5yZWFkaW5nKSB7XG4gICAgZGVidWcoJ3Jlc3VtZSByZWFkIDAnKTtcbiAgICBzdHJlYW0ucmVhZCgwKTtcbiAgfVxuXG4gIHN0YXRlLnJlc3VtZVNjaGVkdWxlZCA9IGZhbHNlO1xuICBzdGF0ZS5hd2FpdERyYWluID0gMDtcbiAgc3RyZWFtLmVtaXQoJ3Jlc3VtZScpO1xuICBmbG93KHN0cmVhbSk7XG4gIGlmIChzdGF0ZS5mbG93aW5nICYmICFzdGF0ZS5yZWFkaW5nKSBzdHJlYW0ucmVhZCgwKTtcbn1cblxuUmVhZGFibGUucHJvdG90eXBlLnBhdXNlID0gZnVuY3Rpb24gKCkge1xuICBkZWJ1ZygnY2FsbCBwYXVzZSBmbG93aW5nPSVqJywgdGhpcy5fcmVhZGFibGVTdGF0ZS5mbG93aW5nKTtcbiAgaWYgKGZhbHNlICE9PSB0aGlzLl9yZWFkYWJsZVN0YXRlLmZsb3dpbmcpIHtcbiAgICBkZWJ1ZygncGF1c2UnKTtcbiAgICB0aGlzLl9yZWFkYWJsZVN0YXRlLmZsb3dpbmcgPSBmYWxzZTtcbiAgICB0aGlzLmVtaXQoJ3BhdXNlJyk7XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5mdW5jdGlvbiBmbG93KHN0cmVhbSkge1xuICB2YXIgc3RhdGUgPSBzdHJlYW0uX3JlYWRhYmxlU3RhdGU7XG4gIGRlYnVnKCdmbG93Jywgc3RhdGUuZmxvd2luZyk7XG4gIHdoaWxlIChzdGF0ZS5mbG93aW5nICYmIHN0cmVhbS5yZWFkKCkgIT09IG51bGwpIHt9XG59XG5cbi8vIHdyYXAgYW4gb2xkLXN0eWxlIHN0cmVhbSBhcyB0aGUgYXN5bmMgZGF0YSBzb3VyY2UuXG4vLyBUaGlzIGlzICpub3QqIHBhcnQgb2YgdGhlIHJlYWRhYmxlIHN0cmVhbSBpbnRlcmZhY2UuXG4vLyBJdCBpcyBhbiB1Z2x5IHVuZm9ydHVuYXRlIG1lc3Mgb2YgaGlzdG9yeS5cblJlYWRhYmxlLnByb3RvdHlwZS53cmFwID0gZnVuY3Rpb24gKHN0cmVhbSkge1xuICB2YXIgc3RhdGUgPSB0aGlzLl9yZWFkYWJsZVN0YXRlO1xuICB2YXIgcGF1c2VkID0gZmFsc2U7XG5cbiAgdmFyIHNlbGYgPSB0aGlzO1xuICBzdHJlYW0ub24oJ2VuZCcsIGZ1bmN0aW9uICgpIHtcbiAgICBkZWJ1Zygnd3JhcHBlZCBlbmQnKTtcbiAgICBpZiAoc3RhdGUuZGVjb2RlciAmJiAhc3RhdGUuZW5kZWQpIHtcbiAgICAgIHZhciBjaHVuayA9IHN0YXRlLmRlY29kZXIuZW5kKCk7XG4gICAgICBpZiAoY2h1bmsgJiYgY2h1bmsubGVuZ3RoKSBzZWxmLnB1c2goY2h1bmspO1xuICAgIH1cblxuICAgIHNlbGYucHVzaChudWxsKTtcbiAgfSk7XG5cbiAgc3RyZWFtLm9uKCdkYXRhJywgZnVuY3Rpb24gKGNodW5rKSB7XG4gICAgZGVidWcoJ3dyYXBwZWQgZGF0YScpO1xuICAgIGlmIChzdGF0ZS5kZWNvZGVyKSBjaHVuayA9IHN0YXRlLmRlY29kZXIud3JpdGUoY2h1bmspO1xuXG4gICAgLy8gZG9uJ3Qgc2tpcCBvdmVyIGZhbHN5IHZhbHVlcyBpbiBvYmplY3RNb2RlXG4gICAgaWYgKHN0YXRlLm9iamVjdE1vZGUgJiYgKGNodW5rID09PSBudWxsIHx8IGNodW5rID09PSB1bmRlZmluZWQpKSByZXR1cm47ZWxzZSBpZiAoIXN0YXRlLm9iamVjdE1vZGUgJiYgKCFjaHVuayB8fCAhY2h1bmsubGVuZ3RoKSkgcmV0dXJuO1xuXG4gICAgdmFyIHJldCA9IHNlbGYucHVzaChjaHVuayk7XG4gICAgaWYgKCFyZXQpIHtcbiAgICAgIHBhdXNlZCA9IHRydWU7XG4gICAgICBzdHJlYW0ucGF1c2UoKTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIHByb3h5IGFsbCB0aGUgb3RoZXIgbWV0aG9kcy5cbiAgLy8gaW1wb3J0YW50IHdoZW4gd3JhcHBpbmcgZmlsdGVycyBhbmQgZHVwbGV4ZXMuXG4gIGZvciAodmFyIGkgaW4gc3RyZWFtKSB7XG4gICAgaWYgKHRoaXNbaV0gPT09IHVuZGVmaW5lZCAmJiB0eXBlb2Ygc3RyZWFtW2ldID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aGlzW2ldID0gZnVuY3Rpb24gKG1ldGhvZCkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHJldHVybiBzdHJlYW1bbWV0aG9kXS5hcHBseShzdHJlYW0sIGFyZ3VtZW50cyk7XG4gICAgICAgIH07XG4gICAgICB9KGkpO1xuICAgIH1cbiAgfVxuXG4gIC8vIHByb3h5IGNlcnRhaW4gaW1wb3J0YW50IGV2ZW50cy5cbiAgdmFyIGV2ZW50cyA9IFsnZXJyb3InLCAnY2xvc2UnLCAnZGVzdHJveScsICdwYXVzZScsICdyZXN1bWUnXTtcbiAgZm9yRWFjaChldmVudHMsIGZ1bmN0aW9uIChldikge1xuICAgIHN0cmVhbS5vbihldiwgc2VsZi5lbWl0LmJpbmQoc2VsZiwgZXYpKTtcbiAgfSk7XG5cbiAgLy8gd2hlbiB3ZSB0cnkgdG8gY29uc3VtZSBzb21lIG1vcmUgYnl0ZXMsIHNpbXBseSB1bnBhdXNlIHRoZVxuICAvLyB1bmRlcmx5aW5nIHN0cmVhbS5cbiAgc2VsZi5fcmVhZCA9IGZ1bmN0aW9uIChuKSB7XG4gICAgZGVidWcoJ3dyYXBwZWQgX3JlYWQnLCBuKTtcbiAgICBpZiAocGF1c2VkKSB7XG4gICAgICBwYXVzZWQgPSBmYWxzZTtcbiAgICAgIHN0cmVhbS5yZXN1bWUoKTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIHNlbGY7XG59O1xuXG4vLyBleHBvc2VkIGZvciB0ZXN0aW5nIHB1cnBvc2VzIG9ubHkuXG5SZWFkYWJsZS5fZnJvbUxpc3QgPSBmcm9tTGlzdDtcblxuLy8gUGx1Y2sgb2ZmIG4gYnl0ZXMgZnJvbSBhbiBhcnJheSBvZiBidWZmZXJzLlxuLy8gTGVuZ3RoIGlzIHRoZSBjb21iaW5lZCBsZW5ndGhzIG9mIGFsbCB0aGUgYnVmZmVycyBpbiB0aGUgbGlzdC5cbi8vIFRoaXMgZnVuY3Rpb24gaXMgZGVzaWduZWQgdG8gYmUgaW5saW5hYmxlLCBzbyBwbGVhc2UgdGFrZSBjYXJlIHdoZW4gbWFraW5nXG4vLyBjaGFuZ2VzIHRvIHRoZSBmdW5jdGlvbiBib2R5LlxuZnVuY3Rpb24gZnJvbUxpc3Qobiwgc3RhdGUpIHtcbiAgLy8gbm90aGluZyBidWZmZXJlZFxuICBpZiAoc3RhdGUubGVuZ3RoID09PSAwKSByZXR1cm4gbnVsbDtcblxuICB2YXIgcmV0O1xuICBpZiAoc3RhdGUub2JqZWN0TW9kZSkgcmV0ID0gc3RhdGUuYnVmZmVyLnNoaWZ0KCk7ZWxzZSBpZiAoIW4gfHwgbiA+PSBzdGF0ZS5sZW5ndGgpIHtcbiAgICAvLyByZWFkIGl0IGFsbCwgdHJ1bmNhdGUgdGhlIGxpc3RcbiAgICBpZiAoc3RhdGUuZGVjb2RlcikgcmV0ID0gc3RhdGUuYnVmZmVyLmpvaW4oJycpO2Vsc2UgaWYgKHN0YXRlLmJ1ZmZlci5sZW5ndGggPT09IDEpIHJldCA9IHN0YXRlLmJ1ZmZlci5oZWFkLmRhdGE7ZWxzZSByZXQgPSBzdGF0ZS5idWZmZXIuY29uY2F0KHN0YXRlLmxlbmd0aCk7XG4gICAgc3RhdGUuYnVmZmVyLmNsZWFyKCk7XG4gIH0gZWxzZSB7XG4gICAgLy8gcmVhZCBwYXJ0IG9mIGxpc3RcbiAgICByZXQgPSBmcm9tTGlzdFBhcnRpYWwobiwgc3RhdGUuYnVmZmVyLCBzdGF0ZS5kZWNvZGVyKTtcbiAgfVxuXG4gIHJldHVybiByZXQ7XG59XG5cbi8vIEV4dHJhY3RzIG9ubHkgZW5vdWdoIGJ1ZmZlcmVkIGRhdGEgdG8gc2F0aXNmeSB0aGUgYW1vdW50IHJlcXVlc3RlZC5cbi8vIFRoaXMgZnVuY3Rpb24gaXMgZGVzaWduZWQgdG8gYmUgaW5saW5hYmxlLCBzbyBwbGVhc2UgdGFrZSBjYXJlIHdoZW4gbWFraW5nXG4vLyBjaGFuZ2VzIHRvIHRoZSBmdW5jdGlvbiBib2R5LlxuZnVuY3Rpb24gZnJvbUxpc3RQYXJ0aWFsKG4sIGxpc3QsIGhhc1N0cmluZ3MpIHtcbiAgdmFyIHJldDtcbiAgaWYgKG4gPCBsaXN0LmhlYWQuZGF0YS5sZW5ndGgpIHtcbiAgICAvLyBzbGljZSBpcyB0aGUgc2FtZSBmb3IgYnVmZmVycyBhbmQgc3RyaW5nc1xuICAgIHJldCA9IGxpc3QuaGVhZC5kYXRhLnNsaWNlKDAsIG4pO1xuICAgIGxpc3QuaGVhZC5kYXRhID0gbGlzdC5oZWFkLmRhdGEuc2xpY2Uobik7XG4gIH0gZWxzZSBpZiAobiA9PT0gbGlzdC5oZWFkLmRhdGEubGVuZ3RoKSB7XG4gICAgLy8gZmlyc3QgY2h1bmsgaXMgYSBwZXJmZWN0IG1hdGNoXG4gICAgcmV0ID0gbGlzdC5zaGlmdCgpO1xuICB9IGVsc2Uge1xuICAgIC8vIHJlc3VsdCBzcGFucyBtb3JlIHRoYW4gb25lIGJ1ZmZlclxuICAgIHJldCA9IGhhc1N0cmluZ3MgPyBjb3B5RnJvbUJ1ZmZlclN0cmluZyhuLCBsaXN0KSA6IGNvcHlGcm9tQnVmZmVyKG4sIGxpc3QpO1xuICB9XG4gIHJldHVybiByZXQ7XG59XG5cbi8vIENvcGllcyBhIHNwZWNpZmllZCBhbW91bnQgb2YgY2hhcmFjdGVycyBmcm9tIHRoZSBsaXN0IG9mIGJ1ZmZlcmVkIGRhdGFcbi8vIGNodW5rcy5cbi8vIFRoaXMgZnVuY3Rpb24gaXMgZGVzaWduZWQgdG8gYmUgaW5saW5hYmxlLCBzbyBwbGVhc2UgdGFrZSBjYXJlIHdoZW4gbWFraW5nXG4vLyBjaGFuZ2VzIHRvIHRoZSBmdW5jdGlvbiBib2R5LlxuZnVuY3Rpb24gY29weUZyb21CdWZmZXJTdHJpbmcobiwgbGlzdCkge1xuICB2YXIgcCA9IGxpc3QuaGVhZDtcbiAgdmFyIGMgPSAxO1xuICB2YXIgcmV0ID0gcC5kYXRhO1xuICBuIC09IHJldC5sZW5ndGg7XG4gIHdoaWxlIChwID0gcC5uZXh0KSB7XG4gICAgdmFyIHN0ciA9IHAuZGF0YTtcbiAgICB2YXIgbmIgPSBuID4gc3RyLmxlbmd0aCA/IHN0ci5sZW5ndGggOiBuO1xuICAgIGlmIChuYiA9PT0gc3RyLmxlbmd0aCkgcmV0ICs9IHN0cjtlbHNlIHJldCArPSBzdHIuc2xpY2UoMCwgbik7XG4gICAgbiAtPSBuYjtcbiAgICBpZiAobiA9PT0gMCkge1xuICAgICAgaWYgKG5iID09PSBzdHIubGVuZ3RoKSB7XG4gICAgICAgICsrYztcbiAgICAgICAgaWYgKHAubmV4dCkgbGlzdC5oZWFkID0gcC5uZXh0O2Vsc2UgbGlzdC5oZWFkID0gbGlzdC50YWlsID0gbnVsbDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxpc3QuaGVhZCA9IHA7XG4gICAgICAgIHAuZGF0YSA9IHN0ci5zbGljZShuYik7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICB9XG4gICAgKytjO1xuICB9XG4gIGxpc3QubGVuZ3RoIC09IGM7XG4gIHJldHVybiByZXQ7XG59XG5cbi8vIENvcGllcyBhIHNwZWNpZmllZCBhbW91bnQgb2YgYnl0ZXMgZnJvbSB0aGUgbGlzdCBvZiBidWZmZXJlZCBkYXRhIGNodW5rcy5cbi8vIFRoaXMgZnVuY3Rpb24gaXMgZGVzaWduZWQgdG8gYmUgaW5saW5hYmxlLCBzbyBwbGVhc2UgdGFrZSBjYXJlIHdoZW4gbWFraW5nXG4vLyBjaGFuZ2VzIHRvIHRoZSBmdW5jdGlvbiBib2R5LlxuZnVuY3Rpb24gY29weUZyb21CdWZmZXIobiwgbGlzdCkge1xuICB2YXIgcmV0ID0gYnVmZmVyU2hpbS5hbGxvY1Vuc2FmZShuKTtcbiAgdmFyIHAgPSBsaXN0LmhlYWQ7XG4gIHZhciBjID0gMTtcbiAgcC5kYXRhLmNvcHkocmV0KTtcbiAgbiAtPSBwLmRhdGEubGVuZ3RoO1xuICB3aGlsZSAocCA9IHAubmV4dCkge1xuICAgIHZhciBidWYgPSBwLmRhdGE7XG4gICAgdmFyIG5iID0gbiA+IGJ1Zi5sZW5ndGggPyBidWYubGVuZ3RoIDogbjtcbiAgICBidWYuY29weShyZXQsIHJldC5sZW5ndGggLSBuLCAwLCBuYik7XG4gICAgbiAtPSBuYjtcbiAgICBpZiAobiA9PT0gMCkge1xuICAgICAgaWYgKG5iID09PSBidWYubGVuZ3RoKSB7XG4gICAgICAgICsrYztcbiAgICAgICAgaWYgKHAubmV4dCkgbGlzdC5oZWFkID0gcC5uZXh0O2Vsc2UgbGlzdC5oZWFkID0gbGlzdC50YWlsID0gbnVsbDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxpc3QuaGVhZCA9IHA7XG4gICAgICAgIHAuZGF0YSA9IGJ1Zi5zbGljZShuYik7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICB9XG4gICAgKytjO1xuICB9XG4gIGxpc3QubGVuZ3RoIC09IGM7XG4gIHJldHVybiByZXQ7XG59XG5cbmZ1bmN0aW9uIGVuZFJlYWRhYmxlKHN0cmVhbSkge1xuICB2YXIgc3RhdGUgPSBzdHJlYW0uX3JlYWRhYmxlU3RhdGU7XG5cbiAgLy8gSWYgd2UgZ2V0IGhlcmUgYmVmb3JlIGNvbnN1bWluZyBhbGwgdGhlIGJ5dGVzLCB0aGVuIHRoYXQgaXMgYVxuICAvLyBidWcgaW4gbm9kZS4gIFNob3VsZCBuZXZlciBoYXBwZW4uXG4gIGlmIChzdGF0ZS5sZW5ndGggPiAwKSB0aHJvdyBuZXcgRXJyb3IoJ1wiZW5kUmVhZGFibGUoKVwiIGNhbGxlZCBvbiBub24tZW1wdHkgc3RyZWFtJyk7XG5cbiAgaWYgKCFzdGF0ZS5lbmRFbWl0dGVkKSB7XG4gICAgc3RhdGUuZW5kZWQgPSB0cnVlO1xuICAgIHByb2Nlc3NOZXh0VGljayhlbmRSZWFkYWJsZU5ULCBzdGF0ZSwgc3RyZWFtKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBlbmRSZWFkYWJsZU5UKHN0YXRlLCBzdHJlYW0pIHtcbiAgLy8gQ2hlY2sgdGhhdCB3ZSBkaWRuJ3QgZ2V0IG9uZSBsYXN0IHVuc2hpZnQuXG4gIGlmICghc3RhdGUuZW5kRW1pdHRlZCAmJiBzdGF0ZS5sZW5ndGggPT09IDApIHtcbiAgICBzdGF0ZS5lbmRFbWl0dGVkID0gdHJ1ZTtcbiAgICBzdHJlYW0ucmVhZGFibGUgPSBmYWxzZTtcbiAgICBzdHJlYW0uZW1pdCgnZW5kJyk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZm9yRWFjaCh4cywgZikge1xuICBmb3IgKHZhciBpID0gMCwgbCA9IHhzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgIGYoeHNbaV0sIGkpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGluZGV4T2YoeHMsIHgpIHtcbiAgZm9yICh2YXIgaSA9IDAsIGwgPSB4cy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICBpZiAoeHNbaV0gPT09IHgpIHJldHVybiBpO1xuICB9XG4gIHJldHVybiAtMTtcbn0iLCIvLyBhIHRyYW5zZm9ybSBzdHJlYW0gaXMgYSByZWFkYWJsZS93cml0YWJsZSBzdHJlYW0gd2hlcmUgeW91IGRvXG4vLyBzb21ldGhpbmcgd2l0aCB0aGUgZGF0YS4gIFNvbWV0aW1lcyBpdCdzIGNhbGxlZCBhIFwiZmlsdGVyXCIsXG4vLyBidXQgdGhhdCdzIG5vdCBhIGdyZWF0IG5hbWUgZm9yIGl0LCBzaW5jZSB0aGF0IGltcGxpZXMgYSB0aGluZyB3aGVyZVxuLy8gc29tZSBiaXRzIHBhc3MgdGhyb3VnaCwgYW5kIG90aGVycyBhcmUgc2ltcGx5IGlnbm9yZWQuICAoVGhhdCB3b3VsZFxuLy8gYmUgYSB2YWxpZCBleGFtcGxlIG9mIGEgdHJhbnNmb3JtLCBvZiBjb3Vyc2UuKVxuLy9cbi8vIFdoaWxlIHRoZSBvdXRwdXQgaXMgY2F1c2FsbHkgcmVsYXRlZCB0byB0aGUgaW5wdXQsIGl0J3Mgbm90IGFcbi8vIG5lY2Vzc2FyaWx5IHN5bW1ldHJpYyBvciBzeW5jaHJvbm91cyB0cmFuc2Zvcm1hdGlvbi4gIEZvciBleGFtcGxlLFxuLy8gYSB6bGliIHN0cmVhbSBtaWdodCB0YWtlIG11bHRpcGxlIHBsYWluLXRleHQgd3JpdGVzKCksIGFuZCB0aGVuXG4vLyBlbWl0IGEgc2luZ2xlIGNvbXByZXNzZWQgY2h1bmsgc29tZSB0aW1lIGluIHRoZSBmdXR1cmUuXG4vL1xuLy8gSGVyZSdzIGhvdyB0aGlzIHdvcmtzOlxuLy9cbi8vIFRoZSBUcmFuc2Zvcm0gc3RyZWFtIGhhcyBhbGwgdGhlIGFzcGVjdHMgb2YgdGhlIHJlYWRhYmxlIGFuZCB3cml0YWJsZVxuLy8gc3RyZWFtIGNsYXNzZXMuICBXaGVuIHlvdSB3cml0ZShjaHVuayksIHRoYXQgY2FsbHMgX3dyaXRlKGNodW5rLGNiKVxuLy8gaW50ZXJuYWxseSwgYW5kIHJldHVybnMgZmFsc2UgaWYgdGhlcmUncyBhIGxvdCBvZiBwZW5kaW5nIHdyaXRlc1xuLy8gYnVmZmVyZWQgdXAuICBXaGVuIHlvdSBjYWxsIHJlYWQoKSwgdGhhdCBjYWxscyBfcmVhZChuKSB1bnRpbFxuLy8gdGhlcmUncyBlbm91Z2ggcGVuZGluZyByZWFkYWJsZSBkYXRhIGJ1ZmZlcmVkIHVwLlxuLy9cbi8vIEluIGEgdHJhbnNmb3JtIHN0cmVhbSwgdGhlIHdyaXR0ZW4gZGF0YSBpcyBwbGFjZWQgaW4gYSBidWZmZXIuICBXaGVuXG4vLyBfcmVhZChuKSBpcyBjYWxsZWQsIGl0IHRyYW5zZm9ybXMgdGhlIHF1ZXVlZCB1cCBkYXRhLCBjYWxsaW5nIHRoZVxuLy8gYnVmZmVyZWQgX3dyaXRlIGNiJ3MgYXMgaXQgY29uc3VtZXMgY2h1bmtzLiAgSWYgY29uc3VtaW5nIGEgc2luZ2xlXG4vLyB3cml0dGVuIGNodW5rIHdvdWxkIHJlc3VsdCBpbiBtdWx0aXBsZSBvdXRwdXQgY2h1bmtzLCB0aGVuIHRoZSBmaXJzdFxuLy8gb3V0cHV0dGVkIGJpdCBjYWxscyB0aGUgcmVhZGNiLCBhbmQgc3Vic2VxdWVudCBjaHVua3MganVzdCBnbyBpbnRvXG4vLyB0aGUgcmVhZCBidWZmZXIsIGFuZCB3aWxsIGNhdXNlIGl0IHRvIGVtaXQgJ3JlYWRhYmxlJyBpZiBuZWNlc3NhcnkuXG4vL1xuLy8gVGhpcyB3YXksIGJhY2stcHJlc3N1cmUgaXMgYWN0dWFsbHkgZGV0ZXJtaW5lZCBieSB0aGUgcmVhZGluZyBzaWRlLFxuLy8gc2luY2UgX3JlYWQgaGFzIHRvIGJlIGNhbGxlZCB0byBzdGFydCBwcm9jZXNzaW5nIGEgbmV3IGNodW5rLiAgSG93ZXZlcixcbi8vIGEgcGF0aG9sb2dpY2FsIGluZmxhdGUgdHlwZSBvZiB0cmFuc2Zvcm0gY2FuIGNhdXNlIGV4Y2Vzc2l2ZSBidWZmZXJpbmdcbi8vIGhlcmUuICBGb3IgZXhhbXBsZSwgaW1hZ2luZSBhIHN0cmVhbSB3aGVyZSBldmVyeSBieXRlIG9mIGlucHV0IGlzXG4vLyBpbnRlcnByZXRlZCBhcyBhbiBpbnRlZ2VyIGZyb20gMC0yNTUsIGFuZCB0aGVuIHJlc3VsdHMgaW4gdGhhdCBtYW55XG4vLyBieXRlcyBvZiBvdXRwdXQuICBXcml0aW5nIHRoZSA0IGJ5dGVzIHtmZixmZixmZixmZn0gd291bGQgcmVzdWx0IGluXG4vLyAxa2Igb2YgZGF0YSBiZWluZyBvdXRwdXQuICBJbiB0aGlzIGNhc2UsIHlvdSBjb3VsZCB3cml0ZSBhIHZlcnkgc21hbGxcbi8vIGFtb3VudCBvZiBpbnB1dCwgYW5kIGVuZCB1cCB3aXRoIGEgdmVyeSBsYXJnZSBhbW91bnQgb2Ygb3V0cHV0LiAgSW5cbi8vIHN1Y2ggYSBwYXRob2xvZ2ljYWwgaW5mbGF0aW5nIG1lY2hhbmlzbSwgdGhlcmUnZCBiZSBubyB3YXkgdG8gdGVsbFxuLy8gdGhlIHN5c3RlbSB0byBzdG9wIGRvaW5nIHRoZSB0cmFuc2Zvcm0uICBBIHNpbmdsZSA0TUIgd3JpdGUgY291bGRcbi8vIGNhdXNlIHRoZSBzeXN0ZW0gdG8gcnVuIG91dCBvZiBtZW1vcnkuXG4vL1xuLy8gSG93ZXZlciwgZXZlbiBpbiBzdWNoIGEgcGF0aG9sb2dpY2FsIGNhc2UsIG9ubHkgYSBzaW5nbGUgd3JpdHRlbiBjaHVua1xuLy8gd291bGQgYmUgY29uc3VtZWQsIGFuZCB0aGVuIHRoZSByZXN0IHdvdWxkIHdhaXQgKHVuLXRyYW5zZm9ybWVkKSB1bnRpbFxuLy8gdGhlIHJlc3VsdHMgb2YgdGhlIHByZXZpb3VzIHRyYW5zZm9ybWVkIGNodW5rIHdlcmUgY29uc3VtZWQuXG5cbid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBUcmFuc2Zvcm07XG5cbnZhciBEdXBsZXggPSByZXF1aXJlKCcuL19zdHJlYW1fZHVwbGV4Jyk7XG5cbi8qPHJlcGxhY2VtZW50PiovXG52YXIgdXRpbCA9IHJlcXVpcmUoJ2NvcmUtdXRpbC1pcycpO1xudXRpbC5pbmhlcml0cyA9IHJlcXVpcmUoJ2luaGVyaXRzJyk7XG4vKjwvcmVwbGFjZW1lbnQ+Ki9cblxudXRpbC5pbmhlcml0cyhUcmFuc2Zvcm0sIER1cGxleCk7XG5cbmZ1bmN0aW9uIFRyYW5zZm9ybVN0YXRlKHN0cmVhbSkge1xuICB0aGlzLmFmdGVyVHJhbnNmb3JtID0gZnVuY3Rpb24gKGVyLCBkYXRhKSB7XG4gICAgcmV0dXJuIGFmdGVyVHJhbnNmb3JtKHN0cmVhbSwgZXIsIGRhdGEpO1xuICB9O1xuXG4gIHRoaXMubmVlZFRyYW5zZm9ybSA9IGZhbHNlO1xuICB0aGlzLnRyYW5zZm9ybWluZyA9IGZhbHNlO1xuICB0aGlzLndyaXRlY2IgPSBudWxsO1xuICB0aGlzLndyaXRlY2h1bmsgPSBudWxsO1xuICB0aGlzLndyaXRlZW5jb2RpbmcgPSBudWxsO1xufVxuXG5mdW5jdGlvbiBhZnRlclRyYW5zZm9ybShzdHJlYW0sIGVyLCBkYXRhKSB7XG4gIHZhciB0cyA9IHN0cmVhbS5fdHJhbnNmb3JtU3RhdGU7XG4gIHRzLnRyYW5zZm9ybWluZyA9IGZhbHNlO1xuXG4gIHZhciBjYiA9IHRzLndyaXRlY2I7XG5cbiAgaWYgKCFjYikgcmV0dXJuIHN0cmVhbS5lbWl0KCdlcnJvcicsIG5ldyBFcnJvcignbm8gd3JpdGVjYiBpbiBUcmFuc2Zvcm0gY2xhc3MnKSk7XG5cbiAgdHMud3JpdGVjaHVuayA9IG51bGw7XG4gIHRzLndyaXRlY2IgPSBudWxsO1xuXG4gIGlmIChkYXRhICE9PSBudWxsICYmIGRhdGEgIT09IHVuZGVmaW5lZCkgc3RyZWFtLnB1c2goZGF0YSk7XG5cbiAgY2IoZXIpO1xuXG4gIHZhciBycyA9IHN0cmVhbS5fcmVhZGFibGVTdGF0ZTtcbiAgcnMucmVhZGluZyA9IGZhbHNlO1xuICBpZiAocnMubmVlZFJlYWRhYmxlIHx8IHJzLmxlbmd0aCA8IHJzLmhpZ2hXYXRlck1hcmspIHtcbiAgICBzdHJlYW0uX3JlYWQocnMuaGlnaFdhdGVyTWFyayk7XG4gIH1cbn1cblxuZnVuY3Rpb24gVHJhbnNmb3JtKG9wdGlvbnMpIHtcbiAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIFRyYW5zZm9ybSkpIHJldHVybiBuZXcgVHJhbnNmb3JtKG9wdGlvbnMpO1xuXG4gIER1cGxleC5jYWxsKHRoaXMsIG9wdGlvbnMpO1xuXG4gIHRoaXMuX3RyYW5zZm9ybVN0YXRlID0gbmV3IFRyYW5zZm9ybVN0YXRlKHRoaXMpO1xuXG4gIHZhciBzdHJlYW0gPSB0aGlzO1xuXG4gIC8vIHN0YXJ0IG91dCBhc2tpbmcgZm9yIGEgcmVhZGFibGUgZXZlbnQgb25jZSBkYXRhIGlzIHRyYW5zZm9ybWVkLlxuICB0aGlzLl9yZWFkYWJsZVN0YXRlLm5lZWRSZWFkYWJsZSA9IHRydWU7XG5cbiAgLy8gd2UgaGF2ZSBpbXBsZW1lbnRlZCB0aGUgX3JlYWQgbWV0aG9kLCBhbmQgZG9uZSB0aGUgb3RoZXIgdGhpbmdzXG4gIC8vIHRoYXQgUmVhZGFibGUgd2FudHMgYmVmb3JlIHRoZSBmaXJzdCBfcmVhZCBjYWxsLCBzbyB1bnNldCB0aGVcbiAgLy8gc3luYyBndWFyZCBmbGFnLlxuICB0aGlzLl9yZWFkYWJsZVN0YXRlLnN5bmMgPSBmYWxzZTtcblxuICBpZiAob3B0aW9ucykge1xuICAgIGlmICh0eXBlb2Ygb3B0aW9ucy50cmFuc2Zvcm0gPT09ICdmdW5jdGlvbicpIHRoaXMuX3RyYW5zZm9ybSA9IG9wdGlvbnMudHJhbnNmb3JtO1xuXG4gICAgaWYgKHR5cGVvZiBvcHRpb25zLmZsdXNoID09PSAnZnVuY3Rpb24nKSB0aGlzLl9mbHVzaCA9IG9wdGlvbnMuZmx1c2g7XG4gIH1cblxuICAvLyBXaGVuIHRoZSB3cml0YWJsZSBzaWRlIGZpbmlzaGVzLCB0aGVuIGZsdXNoIG91dCBhbnl0aGluZyByZW1haW5pbmcuXG4gIHRoaXMub25jZSgncHJlZmluaXNoJywgZnVuY3Rpb24gKCkge1xuICAgIGlmICh0eXBlb2YgdGhpcy5fZmx1c2ggPT09ICdmdW5jdGlvbicpIHRoaXMuX2ZsdXNoKGZ1bmN0aW9uIChlciwgZGF0YSkge1xuICAgICAgZG9uZShzdHJlYW0sIGVyLCBkYXRhKTtcbiAgICB9KTtlbHNlIGRvbmUoc3RyZWFtKTtcbiAgfSk7XG59XG5cblRyYW5zZm9ybS5wcm90b3R5cGUucHVzaCA9IGZ1bmN0aW9uIChjaHVuaywgZW5jb2RpbmcpIHtcbiAgdGhpcy5fdHJhbnNmb3JtU3RhdGUubmVlZFRyYW5zZm9ybSA9IGZhbHNlO1xuICByZXR1cm4gRHVwbGV4LnByb3RvdHlwZS5wdXNoLmNhbGwodGhpcywgY2h1bmssIGVuY29kaW5nKTtcbn07XG5cbi8vIFRoaXMgaXMgdGhlIHBhcnQgd2hlcmUgeW91IGRvIHN0dWZmIVxuLy8gb3ZlcnJpZGUgdGhpcyBmdW5jdGlvbiBpbiBpbXBsZW1lbnRhdGlvbiBjbGFzc2VzLlxuLy8gJ2NodW5rJyBpcyBhbiBpbnB1dCBjaHVuay5cbi8vXG4vLyBDYWxsIGBwdXNoKG5ld0NodW5rKWAgdG8gcGFzcyBhbG9uZyB0cmFuc2Zvcm1lZCBvdXRwdXRcbi8vIHRvIHRoZSByZWFkYWJsZSBzaWRlLiAgWW91IG1heSBjYWxsICdwdXNoJyB6ZXJvIG9yIG1vcmUgdGltZXMuXG4vL1xuLy8gQ2FsbCBgY2IoZXJyKWAgd2hlbiB5b3UgYXJlIGRvbmUgd2l0aCB0aGlzIGNodW5rLiAgSWYgeW91IHBhc3Ncbi8vIGFuIGVycm9yLCB0aGVuIHRoYXQnbGwgcHV0IHRoZSBodXJ0IG9uIHRoZSB3aG9sZSBvcGVyYXRpb24uICBJZiB5b3Vcbi8vIG5ldmVyIGNhbGwgY2IoKSwgdGhlbiB5b3UnbGwgbmV2ZXIgZ2V0IGFub3RoZXIgY2h1bmsuXG5UcmFuc2Zvcm0ucHJvdG90eXBlLl90cmFuc2Zvcm0gPSBmdW5jdGlvbiAoY2h1bmssIGVuY29kaW5nLCBjYikge1xuICB0aHJvdyBuZXcgRXJyb3IoJ190cmFuc2Zvcm0oKSBpcyBub3QgaW1wbGVtZW50ZWQnKTtcbn07XG5cblRyYW5zZm9ybS5wcm90b3R5cGUuX3dyaXRlID0gZnVuY3Rpb24gKGNodW5rLCBlbmNvZGluZywgY2IpIHtcbiAgdmFyIHRzID0gdGhpcy5fdHJhbnNmb3JtU3RhdGU7XG4gIHRzLndyaXRlY2IgPSBjYjtcbiAgdHMud3JpdGVjaHVuayA9IGNodW5rO1xuICB0cy53cml0ZWVuY29kaW5nID0gZW5jb2Rpbmc7XG4gIGlmICghdHMudHJhbnNmb3JtaW5nKSB7XG4gICAgdmFyIHJzID0gdGhpcy5fcmVhZGFibGVTdGF0ZTtcbiAgICBpZiAodHMubmVlZFRyYW5zZm9ybSB8fCBycy5uZWVkUmVhZGFibGUgfHwgcnMubGVuZ3RoIDwgcnMuaGlnaFdhdGVyTWFyaykgdGhpcy5fcmVhZChycy5oaWdoV2F0ZXJNYXJrKTtcbiAgfVxufTtcblxuLy8gRG9lc24ndCBtYXR0ZXIgd2hhdCB0aGUgYXJncyBhcmUgaGVyZS5cbi8vIF90cmFuc2Zvcm0gZG9lcyBhbGwgdGhlIHdvcmsuXG4vLyBUaGF0IHdlIGdvdCBoZXJlIG1lYW5zIHRoYXQgdGhlIHJlYWRhYmxlIHNpZGUgd2FudHMgbW9yZSBkYXRhLlxuVHJhbnNmb3JtLnByb3RvdHlwZS5fcmVhZCA9IGZ1bmN0aW9uIChuKSB7XG4gIHZhciB0cyA9IHRoaXMuX3RyYW5zZm9ybVN0YXRlO1xuXG4gIGlmICh0cy53cml0ZWNodW5rICE9PSBudWxsICYmIHRzLndyaXRlY2IgJiYgIXRzLnRyYW5zZm9ybWluZykge1xuICAgIHRzLnRyYW5zZm9ybWluZyA9IHRydWU7XG4gICAgdGhpcy5fdHJhbnNmb3JtKHRzLndyaXRlY2h1bmssIHRzLndyaXRlZW5jb2RpbmcsIHRzLmFmdGVyVHJhbnNmb3JtKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBtYXJrIHRoYXQgd2UgbmVlZCBhIHRyYW5zZm9ybSwgc28gdGhhdCBhbnkgZGF0YSB0aGF0IGNvbWVzIGluXG4gICAgLy8gd2lsbCBnZXQgcHJvY2Vzc2VkLCBub3cgdGhhdCB3ZSd2ZSBhc2tlZCBmb3IgaXQuXG4gICAgdHMubmVlZFRyYW5zZm9ybSA9IHRydWU7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIGRvbmUoc3RyZWFtLCBlciwgZGF0YSkge1xuICBpZiAoZXIpIHJldHVybiBzdHJlYW0uZW1pdCgnZXJyb3InLCBlcik7XG5cbiAgaWYgKGRhdGEgIT09IG51bGwgJiYgZGF0YSAhPT0gdW5kZWZpbmVkKSBzdHJlYW0ucHVzaChkYXRhKTtcblxuICAvLyBpZiB0aGVyZSdzIG5vdGhpbmcgaW4gdGhlIHdyaXRlIGJ1ZmZlciwgdGhlbiB0aGF0IG1lYW5zXG4gIC8vIHRoYXQgbm90aGluZyBtb3JlIHdpbGwgZXZlciBiZSBwcm92aWRlZFxuICB2YXIgd3MgPSBzdHJlYW0uX3dyaXRhYmxlU3RhdGU7XG4gIHZhciB0cyA9IHN0cmVhbS5fdHJhbnNmb3JtU3RhdGU7XG5cbiAgaWYgKHdzLmxlbmd0aCkgdGhyb3cgbmV3IEVycm9yKCdDYWxsaW5nIHRyYW5zZm9ybSBkb25lIHdoZW4gd3MubGVuZ3RoICE9IDAnKTtcblxuICBpZiAodHMudHJhbnNmb3JtaW5nKSB0aHJvdyBuZXcgRXJyb3IoJ0NhbGxpbmcgdHJhbnNmb3JtIGRvbmUgd2hlbiBzdGlsbCB0cmFuc2Zvcm1pbmcnKTtcblxuICByZXR1cm4gc3RyZWFtLnB1c2gobnVsbCk7XG59IiwiLy8gQSBiaXQgc2ltcGxlciB0aGFuIHJlYWRhYmxlIHN0cmVhbXMuXG4vLyBJbXBsZW1lbnQgYW4gYXN5bmMgLl93cml0ZShjaHVuaywgZW5jb2RpbmcsIGNiKSwgYW5kIGl0J2xsIGhhbmRsZSBhbGxcbi8vIHRoZSBkcmFpbiBldmVudCBlbWlzc2lvbiBhbmQgYnVmZmVyaW5nLlxuXG4ndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gV3JpdGFibGU7XG5cbi8qPHJlcGxhY2VtZW50PiovXG52YXIgcHJvY2Vzc05leHRUaWNrID0gcmVxdWlyZSgncHJvY2Vzcy1uZXh0aWNrLWFyZ3MnKTtcbi8qPC9yZXBsYWNlbWVudD4qL1xuXG4vKjxyZXBsYWNlbWVudD4qL1xudmFyIGFzeW5jV3JpdGUgPSAhcHJvY2Vzcy5icm93c2VyICYmIFsndjAuMTAnLCAndjAuOS4nXS5pbmRleE9mKHByb2Nlc3MudmVyc2lvbi5zbGljZSgwLCA1KSkgPiAtMSA/IHNldEltbWVkaWF0ZSA6IHByb2Nlc3NOZXh0VGljaztcbi8qPC9yZXBsYWNlbWVudD4qL1xuXG4vKjxyZXBsYWNlbWVudD4qL1xudmFyIER1cGxleDtcbi8qPC9yZXBsYWNlbWVudD4qL1xuXG5Xcml0YWJsZS5Xcml0YWJsZVN0YXRlID0gV3JpdGFibGVTdGF0ZTtcblxuLyo8cmVwbGFjZW1lbnQ+Ki9cbnZhciB1dGlsID0gcmVxdWlyZSgnY29yZS11dGlsLWlzJyk7XG51dGlsLmluaGVyaXRzID0gcmVxdWlyZSgnaW5oZXJpdHMnKTtcbi8qPC9yZXBsYWNlbWVudD4qL1xuXG4vKjxyZXBsYWNlbWVudD4qL1xudmFyIGludGVybmFsVXRpbCA9IHtcbiAgZGVwcmVjYXRlOiByZXF1aXJlKCd1dGlsLWRlcHJlY2F0ZScpXG59O1xuLyo8L3JlcGxhY2VtZW50PiovXG5cbi8qPHJlcGxhY2VtZW50PiovXG52YXIgU3RyZWFtO1xuKGZ1bmN0aW9uICgpIHtcbiAgdHJ5IHtcbiAgICBTdHJlYW0gPSByZXF1aXJlKCdzdCcgKyAncmVhbScpO1xuICB9IGNhdGNoIChfKSB7fSBmaW5hbGx5IHtcbiAgICBpZiAoIVN0cmVhbSkgU3RyZWFtID0gcmVxdWlyZSgnZXZlbnRzJykuRXZlbnRFbWl0dGVyO1xuICB9XG59KSgpO1xuLyo8L3JlcGxhY2VtZW50PiovXG5cbnZhciBCdWZmZXIgPSByZXF1aXJlKCdidWZmZXInKS5CdWZmZXI7XG4vKjxyZXBsYWNlbWVudD4qL1xudmFyIGJ1ZmZlclNoaW0gPSByZXF1aXJlKCdidWZmZXItc2hpbXMnKTtcbi8qPC9yZXBsYWNlbWVudD4qL1xuXG51dGlsLmluaGVyaXRzKFdyaXRhYmxlLCBTdHJlYW0pO1xuXG5mdW5jdGlvbiBub3AoKSB7fVxuXG5mdW5jdGlvbiBXcml0ZVJlcShjaHVuaywgZW5jb2RpbmcsIGNiKSB7XG4gIHRoaXMuY2h1bmsgPSBjaHVuaztcbiAgdGhpcy5lbmNvZGluZyA9IGVuY29kaW5nO1xuICB0aGlzLmNhbGxiYWNrID0gY2I7XG4gIHRoaXMubmV4dCA9IG51bGw7XG59XG5cbmZ1bmN0aW9uIFdyaXRhYmxlU3RhdGUob3B0aW9ucywgc3RyZWFtKSB7XG4gIER1cGxleCA9IER1cGxleCB8fCByZXF1aXJlKCcuL19zdHJlYW1fZHVwbGV4Jyk7XG5cbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgLy8gb2JqZWN0IHN0cmVhbSBmbGFnIHRvIGluZGljYXRlIHdoZXRoZXIgb3Igbm90IHRoaXMgc3RyZWFtXG4gIC8vIGNvbnRhaW5zIGJ1ZmZlcnMgb3Igb2JqZWN0cy5cbiAgdGhpcy5vYmplY3RNb2RlID0gISFvcHRpb25zLm9iamVjdE1vZGU7XG5cbiAgaWYgKHN0cmVhbSBpbnN0YW5jZW9mIER1cGxleCkgdGhpcy5vYmplY3RNb2RlID0gdGhpcy5vYmplY3RNb2RlIHx8ICEhb3B0aW9ucy53cml0YWJsZU9iamVjdE1vZGU7XG5cbiAgLy8gdGhlIHBvaW50IGF0IHdoaWNoIHdyaXRlKCkgc3RhcnRzIHJldHVybmluZyBmYWxzZVxuICAvLyBOb3RlOiAwIGlzIGEgdmFsaWQgdmFsdWUsIG1lYW5zIHRoYXQgd2UgYWx3YXlzIHJldHVybiBmYWxzZSBpZlxuICAvLyB0aGUgZW50aXJlIGJ1ZmZlciBpcyBub3QgZmx1c2hlZCBpbW1lZGlhdGVseSBvbiB3cml0ZSgpXG4gIHZhciBod20gPSBvcHRpb25zLmhpZ2hXYXRlck1hcms7XG4gIHZhciBkZWZhdWx0SHdtID0gdGhpcy5vYmplY3RNb2RlID8gMTYgOiAxNiAqIDEwMjQ7XG4gIHRoaXMuaGlnaFdhdGVyTWFyayA9IGh3bSB8fCBod20gPT09IDAgPyBod20gOiBkZWZhdWx0SHdtO1xuXG4gIC8vIGNhc3QgdG8gaW50cy5cbiAgdGhpcy5oaWdoV2F0ZXJNYXJrID0gfn50aGlzLmhpZ2hXYXRlck1hcms7XG5cbiAgLy8gZHJhaW4gZXZlbnQgZmxhZy5cbiAgdGhpcy5uZWVkRHJhaW4gPSBmYWxzZTtcbiAgLy8gYXQgdGhlIHN0YXJ0IG9mIGNhbGxpbmcgZW5kKClcbiAgdGhpcy5lbmRpbmcgPSBmYWxzZTtcbiAgLy8gd2hlbiBlbmQoKSBoYXMgYmVlbiBjYWxsZWQsIGFuZCByZXR1cm5lZFxuICB0aGlzLmVuZGVkID0gZmFsc2U7XG4gIC8vIHdoZW4gJ2ZpbmlzaCcgaXMgZW1pdHRlZFxuICB0aGlzLmZpbmlzaGVkID0gZmFsc2U7XG5cbiAgLy8gc2hvdWxkIHdlIGRlY29kZSBzdHJpbmdzIGludG8gYnVmZmVycyBiZWZvcmUgcGFzc2luZyB0byBfd3JpdGU/XG4gIC8vIHRoaXMgaXMgaGVyZSBzbyB0aGF0IHNvbWUgbm9kZS1jb3JlIHN0cmVhbXMgY2FuIG9wdGltaXplIHN0cmluZ1xuICAvLyBoYW5kbGluZyBhdCBhIGxvd2VyIGxldmVsLlxuICB2YXIgbm9EZWNvZGUgPSBvcHRpb25zLmRlY29kZVN0cmluZ3MgPT09IGZhbHNlO1xuICB0aGlzLmRlY29kZVN0cmluZ3MgPSAhbm9EZWNvZGU7XG5cbiAgLy8gQ3J5cHRvIGlzIGtpbmQgb2Ygb2xkIGFuZCBjcnVzdHkuICBIaXN0b3JpY2FsbHksIGl0cyBkZWZhdWx0IHN0cmluZ1xuICAvLyBlbmNvZGluZyBpcyAnYmluYXJ5JyBzbyB3ZSBoYXZlIHRvIG1ha2UgdGhpcyBjb25maWd1cmFibGUuXG4gIC8vIEV2ZXJ5dGhpbmcgZWxzZSBpbiB0aGUgdW5pdmVyc2UgdXNlcyAndXRmOCcsIHRob3VnaC5cbiAgdGhpcy5kZWZhdWx0RW5jb2RpbmcgPSBvcHRpb25zLmRlZmF1bHRFbmNvZGluZyB8fCAndXRmOCc7XG5cbiAgLy8gbm90IGFuIGFjdHVhbCBidWZmZXIgd2Uga2VlcCB0cmFjayBvZiwgYnV0IGEgbWVhc3VyZW1lbnRcbiAgLy8gb2YgaG93IG11Y2ggd2UncmUgd2FpdGluZyB0byBnZXQgcHVzaGVkIHRvIHNvbWUgdW5kZXJseWluZ1xuICAvLyBzb2NrZXQgb3IgZmlsZS5cbiAgdGhpcy5sZW5ndGggPSAwO1xuXG4gIC8vIGEgZmxhZyB0byBzZWUgd2hlbiB3ZSdyZSBpbiB0aGUgbWlkZGxlIG9mIGEgd3JpdGUuXG4gIHRoaXMud3JpdGluZyA9IGZhbHNlO1xuXG4gIC8vIHdoZW4gdHJ1ZSBhbGwgd3JpdGVzIHdpbGwgYmUgYnVmZmVyZWQgdW50aWwgLnVuY29yaygpIGNhbGxcbiAgdGhpcy5jb3JrZWQgPSAwO1xuXG4gIC8vIGEgZmxhZyB0byBiZSBhYmxlIHRvIHRlbGwgaWYgdGhlIG9ud3JpdGUgY2IgaXMgY2FsbGVkIGltbWVkaWF0ZWx5LFxuICAvLyBvciBvbiBhIGxhdGVyIHRpY2suICBXZSBzZXQgdGhpcyB0byB0cnVlIGF0IGZpcnN0LCBiZWNhdXNlIGFueVxuICAvLyBhY3Rpb25zIHRoYXQgc2hvdWxkbid0IGhhcHBlbiB1bnRpbCBcImxhdGVyXCIgc2hvdWxkIGdlbmVyYWxseSBhbHNvXG4gIC8vIG5vdCBoYXBwZW4gYmVmb3JlIHRoZSBmaXJzdCB3cml0ZSBjYWxsLlxuICB0aGlzLnN5bmMgPSB0cnVlO1xuXG4gIC8vIGEgZmxhZyB0byBrbm93IGlmIHdlJ3JlIHByb2Nlc3NpbmcgcHJldmlvdXNseSBidWZmZXJlZCBpdGVtcywgd2hpY2hcbiAgLy8gbWF5IGNhbGwgdGhlIF93cml0ZSgpIGNhbGxiYWNrIGluIHRoZSBzYW1lIHRpY2ssIHNvIHRoYXQgd2UgZG9uJ3RcbiAgLy8gZW5kIHVwIGluIGFuIG92ZXJsYXBwZWQgb253cml0ZSBzaXR1YXRpb24uXG4gIHRoaXMuYnVmZmVyUHJvY2Vzc2luZyA9IGZhbHNlO1xuXG4gIC8vIHRoZSBjYWxsYmFjayB0aGF0J3MgcGFzc2VkIHRvIF93cml0ZShjaHVuayxjYilcbiAgdGhpcy5vbndyaXRlID0gZnVuY3Rpb24gKGVyKSB7XG4gICAgb253cml0ZShzdHJlYW0sIGVyKTtcbiAgfTtcblxuICAvLyB0aGUgY2FsbGJhY2sgdGhhdCB0aGUgdXNlciBzdXBwbGllcyB0byB3cml0ZShjaHVuayxlbmNvZGluZyxjYilcbiAgdGhpcy53cml0ZWNiID0gbnVsbDtcblxuICAvLyB0aGUgYW1vdW50IHRoYXQgaXMgYmVpbmcgd3JpdHRlbiB3aGVuIF93cml0ZSBpcyBjYWxsZWQuXG4gIHRoaXMud3JpdGVsZW4gPSAwO1xuXG4gIHRoaXMuYnVmZmVyZWRSZXF1ZXN0ID0gbnVsbDtcbiAgdGhpcy5sYXN0QnVmZmVyZWRSZXF1ZXN0ID0gbnVsbDtcblxuICAvLyBudW1iZXIgb2YgcGVuZGluZyB1c2VyLXN1cHBsaWVkIHdyaXRlIGNhbGxiYWNrc1xuICAvLyB0aGlzIG11c3QgYmUgMCBiZWZvcmUgJ2ZpbmlzaCcgY2FuIGJlIGVtaXR0ZWRcbiAgdGhpcy5wZW5kaW5nY2IgPSAwO1xuXG4gIC8vIGVtaXQgcHJlZmluaXNoIGlmIHRoZSBvbmx5IHRoaW5nIHdlJ3JlIHdhaXRpbmcgZm9yIGlzIF93cml0ZSBjYnNcbiAgLy8gVGhpcyBpcyByZWxldmFudCBmb3Igc3luY2hyb25vdXMgVHJhbnNmb3JtIHN0cmVhbXNcbiAgdGhpcy5wcmVmaW5pc2hlZCA9IGZhbHNlO1xuXG4gIC8vIFRydWUgaWYgdGhlIGVycm9yIHdhcyBhbHJlYWR5IGVtaXR0ZWQgYW5kIHNob3VsZCBub3QgYmUgdGhyb3duIGFnYWluXG4gIHRoaXMuZXJyb3JFbWl0dGVkID0gZmFsc2U7XG5cbiAgLy8gY291bnQgYnVmZmVyZWQgcmVxdWVzdHNcbiAgdGhpcy5idWZmZXJlZFJlcXVlc3RDb3VudCA9IDA7XG5cbiAgLy8gYWxsb2NhdGUgdGhlIGZpcnN0IENvcmtlZFJlcXVlc3QsIHRoZXJlIGlzIGFsd2F5c1xuICAvLyBvbmUgYWxsb2NhdGVkIGFuZCBmcmVlIHRvIHVzZSwgYW5kIHdlIG1haW50YWluIGF0IG1vc3QgdHdvXG4gIHRoaXMuY29ya2VkUmVxdWVzdHNGcmVlID0gbmV3IENvcmtlZFJlcXVlc3QodGhpcyk7XG59XG5cbldyaXRhYmxlU3RhdGUucHJvdG90eXBlLmdldEJ1ZmZlciA9IGZ1bmN0aW9uIGdldEJ1ZmZlcigpIHtcbiAgdmFyIGN1cnJlbnQgPSB0aGlzLmJ1ZmZlcmVkUmVxdWVzdDtcbiAgdmFyIG91dCA9IFtdO1xuICB3aGlsZSAoY3VycmVudCkge1xuICAgIG91dC5wdXNoKGN1cnJlbnQpO1xuICAgIGN1cnJlbnQgPSBjdXJyZW50Lm5leHQ7XG4gIH1cbiAgcmV0dXJuIG91dDtcbn07XG5cbihmdW5jdGlvbiAoKSB7XG4gIHRyeSB7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFdyaXRhYmxlU3RhdGUucHJvdG90eXBlLCAnYnVmZmVyJywge1xuICAgICAgZ2V0OiBpbnRlcm5hbFV0aWwuZGVwcmVjYXRlKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0QnVmZmVyKCk7XG4gICAgICB9LCAnX3dyaXRhYmxlU3RhdGUuYnVmZmVyIGlzIGRlcHJlY2F0ZWQuIFVzZSBfd3JpdGFibGVTdGF0ZS5nZXRCdWZmZXIgJyArICdpbnN0ZWFkLicpXG4gICAgfSk7XG4gIH0gY2F0Y2ggKF8pIHt9XG59KSgpO1xuXG4vLyBUZXN0IF93cml0YWJsZVN0YXRlIGZvciBpbmhlcml0YW5jZSB0byBhY2NvdW50IGZvciBEdXBsZXggc3RyZWFtcyxcbi8vIHdob3NlIHByb3RvdHlwZSBjaGFpbiBvbmx5IHBvaW50cyB0byBSZWFkYWJsZS5cbnZhciByZWFsSGFzSW5zdGFuY2U7XG5pZiAodHlwZW9mIFN5bWJvbCA9PT0gJ2Z1bmN0aW9uJyAmJiBTeW1ib2wuaGFzSW5zdGFuY2UgJiYgdHlwZW9mIEZ1bmN0aW9uLnByb3RvdHlwZVtTeW1ib2wuaGFzSW5zdGFuY2VdID09PSAnZnVuY3Rpb24nKSB7XG4gIHJlYWxIYXNJbnN0YW5jZSA9IEZ1bmN0aW9uLnByb3RvdHlwZVtTeW1ib2wuaGFzSW5zdGFuY2VdO1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoV3JpdGFibGUsIFN5bWJvbC5oYXNJbnN0YW5jZSwge1xuICAgIHZhbHVlOiBmdW5jdGlvbiAob2JqZWN0KSB7XG4gICAgICBpZiAocmVhbEhhc0luc3RhbmNlLmNhbGwodGhpcywgb2JqZWN0KSkgcmV0dXJuIHRydWU7XG5cbiAgICAgIHJldHVybiBvYmplY3QgJiYgb2JqZWN0Ll93cml0YWJsZVN0YXRlIGluc3RhbmNlb2YgV3JpdGFibGVTdGF0ZTtcbiAgICB9XG4gIH0pO1xufSBlbHNlIHtcbiAgcmVhbEhhc0luc3RhbmNlID0gZnVuY3Rpb24gKG9iamVjdCkge1xuICAgIHJldHVybiBvYmplY3QgaW5zdGFuY2VvZiB0aGlzO1xuICB9O1xufVxuXG5mdW5jdGlvbiBXcml0YWJsZShvcHRpb25zKSB7XG4gIER1cGxleCA9IER1cGxleCB8fCByZXF1aXJlKCcuL19zdHJlYW1fZHVwbGV4Jyk7XG5cbiAgLy8gV3JpdGFibGUgY3RvciBpcyBhcHBsaWVkIHRvIER1cGxleGVzLCB0b28uXG4gIC8vIGByZWFsSGFzSW5zdGFuY2VgIGlzIG5lY2Vzc2FyeSBiZWNhdXNlIHVzaW5nIHBsYWluIGBpbnN0YW5jZW9mYFxuICAvLyB3b3VsZCByZXR1cm4gZmFsc2UsIGFzIG5vIGBfd3JpdGFibGVTdGF0ZWAgcHJvcGVydHkgaXMgYXR0YWNoZWQuXG5cbiAgLy8gVHJ5aW5nIHRvIHVzZSB0aGUgY3VzdG9tIGBpbnN0YW5jZW9mYCBmb3IgV3JpdGFibGUgaGVyZSB3aWxsIGFsc28gYnJlYWsgdGhlXG4gIC8vIE5vZGUuanMgTGF6eVRyYW5zZm9ybSBpbXBsZW1lbnRhdGlvbiwgd2hpY2ggaGFzIGEgbm9uLXRyaXZpYWwgZ2V0dGVyIGZvclxuICAvLyBgX3dyaXRhYmxlU3RhdGVgIHRoYXQgd291bGQgbGVhZCB0byBpbmZpbml0ZSByZWN1cnNpb24uXG4gIGlmICghcmVhbEhhc0luc3RhbmNlLmNhbGwoV3JpdGFibGUsIHRoaXMpICYmICEodGhpcyBpbnN0YW5jZW9mIER1cGxleCkpIHtcbiAgICByZXR1cm4gbmV3IFdyaXRhYmxlKG9wdGlvbnMpO1xuICB9XG5cbiAgdGhpcy5fd3JpdGFibGVTdGF0ZSA9IG5ldyBXcml0YWJsZVN0YXRlKG9wdGlvbnMsIHRoaXMpO1xuXG4gIC8vIGxlZ2FjeS5cbiAgdGhpcy53cml0YWJsZSA9IHRydWU7XG5cbiAgaWYgKG9wdGlvbnMpIHtcbiAgICBpZiAodHlwZW9mIG9wdGlvbnMud3JpdGUgPT09ICdmdW5jdGlvbicpIHRoaXMuX3dyaXRlID0gb3B0aW9ucy53cml0ZTtcblxuICAgIGlmICh0eXBlb2Ygb3B0aW9ucy53cml0ZXYgPT09ICdmdW5jdGlvbicpIHRoaXMuX3dyaXRldiA9IG9wdGlvbnMud3JpdGV2O1xuICB9XG5cbiAgU3RyZWFtLmNhbGwodGhpcyk7XG59XG5cbi8vIE90aGVyd2lzZSBwZW9wbGUgY2FuIHBpcGUgV3JpdGFibGUgc3RyZWFtcywgd2hpY2ggaXMganVzdCB3cm9uZy5cbldyaXRhYmxlLnByb3RvdHlwZS5waXBlID0gZnVuY3Rpb24gKCkge1xuICB0aGlzLmVtaXQoJ2Vycm9yJywgbmV3IEVycm9yKCdDYW5ub3QgcGlwZSwgbm90IHJlYWRhYmxlJykpO1xufTtcblxuZnVuY3Rpb24gd3JpdGVBZnRlckVuZChzdHJlYW0sIGNiKSB7XG4gIHZhciBlciA9IG5ldyBFcnJvcignd3JpdGUgYWZ0ZXIgZW5kJyk7XG4gIC8vIFRPRE86IGRlZmVyIGVycm9yIGV2ZW50cyBjb25zaXN0ZW50bHkgZXZlcnl3aGVyZSwgbm90IGp1c3QgdGhlIGNiXG4gIHN0cmVhbS5lbWl0KCdlcnJvcicsIGVyKTtcbiAgcHJvY2Vzc05leHRUaWNrKGNiLCBlcik7XG59XG5cbi8vIENoZWNrcyB0aGF0IGEgdXNlci1zdXBwbGllZCBjaHVuayBpcyB2YWxpZCwgZXNwZWNpYWxseSBmb3IgdGhlIHBhcnRpY3VsYXJcbi8vIG1vZGUgdGhlIHN0cmVhbSBpcyBpbi4gQ3VycmVudGx5IHRoaXMgbWVhbnMgdGhhdCBgbnVsbGAgaXMgbmV2ZXIgYWNjZXB0ZWRcbi8vIGFuZCB1bmRlZmluZWQvbm9uLXN0cmluZyB2YWx1ZXMgYXJlIG9ubHkgYWxsb3dlZCBpbiBvYmplY3QgbW9kZS5cbmZ1bmN0aW9uIHZhbGlkQ2h1bmsoc3RyZWFtLCBzdGF0ZSwgY2h1bmssIGNiKSB7XG4gIHZhciB2YWxpZCA9IHRydWU7XG4gIHZhciBlciA9IGZhbHNlO1xuXG4gIGlmIChjaHVuayA9PT0gbnVsbCkge1xuICAgIGVyID0gbmV3IFR5cGVFcnJvcignTWF5IG5vdCB3cml0ZSBudWxsIHZhbHVlcyB0byBzdHJlYW0nKTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgY2h1bmsgIT09ICdzdHJpbmcnICYmIGNodW5rICE9PSB1bmRlZmluZWQgJiYgIXN0YXRlLm9iamVjdE1vZGUpIHtcbiAgICBlciA9IG5ldyBUeXBlRXJyb3IoJ0ludmFsaWQgbm9uLXN0cmluZy9idWZmZXIgY2h1bmsnKTtcbiAgfVxuICBpZiAoZXIpIHtcbiAgICBzdHJlYW0uZW1pdCgnZXJyb3InLCBlcik7XG4gICAgcHJvY2Vzc05leHRUaWNrKGNiLCBlcik7XG4gICAgdmFsaWQgPSBmYWxzZTtcbiAgfVxuICByZXR1cm4gdmFsaWQ7XG59XG5cbldyaXRhYmxlLnByb3RvdHlwZS53cml0ZSA9IGZ1bmN0aW9uIChjaHVuaywgZW5jb2RpbmcsIGNiKSB7XG4gIHZhciBzdGF0ZSA9IHRoaXMuX3dyaXRhYmxlU3RhdGU7XG4gIHZhciByZXQgPSBmYWxzZTtcbiAgdmFyIGlzQnVmID0gQnVmZmVyLmlzQnVmZmVyKGNodW5rKTtcblxuICBpZiAodHlwZW9mIGVuY29kaW5nID09PSAnZnVuY3Rpb24nKSB7XG4gICAgY2IgPSBlbmNvZGluZztcbiAgICBlbmNvZGluZyA9IG51bGw7XG4gIH1cblxuICBpZiAoaXNCdWYpIGVuY29kaW5nID0gJ2J1ZmZlcic7ZWxzZSBpZiAoIWVuY29kaW5nKSBlbmNvZGluZyA9IHN0YXRlLmRlZmF1bHRFbmNvZGluZztcblxuICBpZiAodHlwZW9mIGNiICE9PSAnZnVuY3Rpb24nKSBjYiA9IG5vcDtcblxuICBpZiAoc3RhdGUuZW5kZWQpIHdyaXRlQWZ0ZXJFbmQodGhpcywgY2IpO2Vsc2UgaWYgKGlzQnVmIHx8IHZhbGlkQ2h1bmsodGhpcywgc3RhdGUsIGNodW5rLCBjYikpIHtcbiAgICBzdGF0ZS5wZW5kaW5nY2IrKztcbiAgICByZXQgPSB3cml0ZU9yQnVmZmVyKHRoaXMsIHN0YXRlLCBpc0J1ZiwgY2h1bmssIGVuY29kaW5nLCBjYik7XG4gIH1cblxuICByZXR1cm4gcmV0O1xufTtcblxuV3JpdGFibGUucHJvdG90eXBlLmNvcmsgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBzdGF0ZSA9IHRoaXMuX3dyaXRhYmxlU3RhdGU7XG5cbiAgc3RhdGUuY29ya2VkKys7XG59O1xuXG5Xcml0YWJsZS5wcm90b3R5cGUudW5jb3JrID0gZnVuY3Rpb24gKCkge1xuICB2YXIgc3RhdGUgPSB0aGlzLl93cml0YWJsZVN0YXRlO1xuXG4gIGlmIChzdGF0ZS5jb3JrZWQpIHtcbiAgICBzdGF0ZS5jb3JrZWQtLTtcblxuICAgIGlmICghc3RhdGUud3JpdGluZyAmJiAhc3RhdGUuY29ya2VkICYmICFzdGF0ZS5maW5pc2hlZCAmJiAhc3RhdGUuYnVmZmVyUHJvY2Vzc2luZyAmJiBzdGF0ZS5idWZmZXJlZFJlcXVlc3QpIGNsZWFyQnVmZmVyKHRoaXMsIHN0YXRlKTtcbiAgfVxufTtcblxuV3JpdGFibGUucHJvdG90eXBlLnNldERlZmF1bHRFbmNvZGluZyA9IGZ1bmN0aW9uIHNldERlZmF1bHRFbmNvZGluZyhlbmNvZGluZykge1xuICAvLyBub2RlOjpQYXJzZUVuY29kaW5nKCkgcmVxdWlyZXMgbG93ZXIgY2FzZS5cbiAgaWYgKHR5cGVvZiBlbmNvZGluZyA9PT0gJ3N0cmluZycpIGVuY29kaW5nID0gZW5jb2RpbmcudG9Mb3dlckNhc2UoKTtcbiAgaWYgKCEoWydoZXgnLCAndXRmOCcsICd1dGYtOCcsICdhc2NpaScsICdiaW5hcnknLCAnYmFzZTY0JywgJ3VjczInLCAndWNzLTInLCAndXRmMTZsZScsICd1dGYtMTZsZScsICdyYXcnXS5pbmRleE9mKChlbmNvZGluZyArICcnKS50b0xvd2VyQ2FzZSgpKSA+IC0xKSkgdGhyb3cgbmV3IFR5cGVFcnJvcignVW5rbm93biBlbmNvZGluZzogJyArIGVuY29kaW5nKTtcbiAgdGhpcy5fd3JpdGFibGVTdGF0ZS5kZWZhdWx0RW5jb2RpbmcgPSBlbmNvZGluZztcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5mdW5jdGlvbiBkZWNvZGVDaHVuayhzdGF0ZSwgY2h1bmssIGVuY29kaW5nKSB7XG4gIGlmICghc3RhdGUub2JqZWN0TW9kZSAmJiBzdGF0ZS5kZWNvZGVTdHJpbmdzICE9PSBmYWxzZSAmJiB0eXBlb2YgY2h1bmsgPT09ICdzdHJpbmcnKSB7XG4gICAgY2h1bmsgPSBidWZmZXJTaGltLmZyb20oY2h1bmssIGVuY29kaW5nKTtcbiAgfVxuICByZXR1cm4gY2h1bms7XG59XG5cbi8vIGlmIHdlJ3JlIGFscmVhZHkgd3JpdGluZyBzb21ldGhpbmcsIHRoZW4ganVzdCBwdXQgdGhpc1xuLy8gaW4gdGhlIHF1ZXVlLCBhbmQgd2FpdCBvdXIgdHVybi4gIE90aGVyd2lzZSwgY2FsbCBfd3JpdGVcbi8vIElmIHdlIHJldHVybiBmYWxzZSwgdGhlbiB3ZSBuZWVkIGEgZHJhaW4gZXZlbnQsIHNvIHNldCB0aGF0IGZsYWcuXG5mdW5jdGlvbiB3cml0ZU9yQnVmZmVyKHN0cmVhbSwgc3RhdGUsIGlzQnVmLCBjaHVuaywgZW5jb2RpbmcsIGNiKSB7XG4gIGlmICghaXNCdWYpIHtcbiAgICBjaHVuayA9IGRlY29kZUNodW5rKHN0YXRlLCBjaHVuaywgZW5jb2RpbmcpO1xuICAgIGlmIChCdWZmZXIuaXNCdWZmZXIoY2h1bmspKSBlbmNvZGluZyA9ICdidWZmZXInO1xuICB9XG4gIHZhciBsZW4gPSBzdGF0ZS5vYmplY3RNb2RlID8gMSA6IGNodW5rLmxlbmd0aDtcblxuICBzdGF0ZS5sZW5ndGggKz0gbGVuO1xuXG4gIHZhciByZXQgPSBzdGF0ZS5sZW5ndGggPCBzdGF0ZS5oaWdoV2F0ZXJNYXJrO1xuICAvLyB3ZSBtdXN0IGVuc3VyZSB0aGF0IHByZXZpb3VzIG5lZWREcmFpbiB3aWxsIG5vdCBiZSByZXNldCB0byBmYWxzZS5cbiAgaWYgKCFyZXQpIHN0YXRlLm5lZWREcmFpbiA9IHRydWU7XG5cbiAgaWYgKHN0YXRlLndyaXRpbmcgfHwgc3RhdGUuY29ya2VkKSB7XG4gICAgdmFyIGxhc3QgPSBzdGF0ZS5sYXN0QnVmZmVyZWRSZXF1ZXN0O1xuICAgIHN0YXRlLmxhc3RCdWZmZXJlZFJlcXVlc3QgPSBuZXcgV3JpdGVSZXEoY2h1bmssIGVuY29kaW5nLCBjYik7XG4gICAgaWYgKGxhc3QpIHtcbiAgICAgIGxhc3QubmV4dCA9IHN0YXRlLmxhc3RCdWZmZXJlZFJlcXVlc3Q7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0YXRlLmJ1ZmZlcmVkUmVxdWVzdCA9IHN0YXRlLmxhc3RCdWZmZXJlZFJlcXVlc3Q7XG4gICAgfVxuICAgIHN0YXRlLmJ1ZmZlcmVkUmVxdWVzdENvdW50ICs9IDE7XG4gIH0gZWxzZSB7XG4gICAgZG9Xcml0ZShzdHJlYW0sIHN0YXRlLCBmYWxzZSwgbGVuLCBjaHVuaywgZW5jb2RpbmcsIGNiKTtcbiAgfVxuXG4gIHJldHVybiByZXQ7XG59XG5cbmZ1bmN0aW9uIGRvV3JpdGUoc3RyZWFtLCBzdGF0ZSwgd3JpdGV2LCBsZW4sIGNodW5rLCBlbmNvZGluZywgY2IpIHtcbiAgc3RhdGUud3JpdGVsZW4gPSBsZW47XG4gIHN0YXRlLndyaXRlY2IgPSBjYjtcbiAgc3RhdGUud3JpdGluZyA9IHRydWU7XG4gIHN0YXRlLnN5bmMgPSB0cnVlO1xuICBpZiAod3JpdGV2KSBzdHJlYW0uX3dyaXRldihjaHVuaywgc3RhdGUub253cml0ZSk7ZWxzZSBzdHJlYW0uX3dyaXRlKGNodW5rLCBlbmNvZGluZywgc3RhdGUub253cml0ZSk7XG4gIHN0YXRlLnN5bmMgPSBmYWxzZTtcbn1cblxuZnVuY3Rpb24gb253cml0ZUVycm9yKHN0cmVhbSwgc3RhdGUsIHN5bmMsIGVyLCBjYikge1xuICAtLXN0YXRlLnBlbmRpbmdjYjtcbiAgaWYgKHN5bmMpIHByb2Nlc3NOZXh0VGljayhjYiwgZXIpO2Vsc2UgY2IoZXIpO1xuXG4gIHN0cmVhbS5fd3JpdGFibGVTdGF0ZS5lcnJvckVtaXR0ZWQgPSB0cnVlO1xuICBzdHJlYW0uZW1pdCgnZXJyb3InLCBlcik7XG59XG5cbmZ1bmN0aW9uIG9ud3JpdGVTdGF0ZVVwZGF0ZShzdGF0ZSkge1xuICBzdGF0ZS53cml0aW5nID0gZmFsc2U7XG4gIHN0YXRlLndyaXRlY2IgPSBudWxsO1xuICBzdGF0ZS5sZW5ndGggLT0gc3RhdGUud3JpdGVsZW47XG4gIHN0YXRlLndyaXRlbGVuID0gMDtcbn1cblxuZnVuY3Rpb24gb253cml0ZShzdHJlYW0sIGVyKSB7XG4gIHZhciBzdGF0ZSA9IHN0cmVhbS5fd3JpdGFibGVTdGF0ZTtcbiAgdmFyIHN5bmMgPSBzdGF0ZS5zeW5jO1xuICB2YXIgY2IgPSBzdGF0ZS53cml0ZWNiO1xuXG4gIG9ud3JpdGVTdGF0ZVVwZGF0ZShzdGF0ZSk7XG5cbiAgaWYgKGVyKSBvbndyaXRlRXJyb3Ioc3RyZWFtLCBzdGF0ZSwgc3luYywgZXIsIGNiKTtlbHNlIHtcbiAgICAvLyBDaGVjayBpZiB3ZSdyZSBhY3R1YWxseSByZWFkeSB0byBmaW5pc2gsIGJ1dCBkb24ndCBlbWl0IHlldFxuICAgIHZhciBmaW5pc2hlZCA9IG5lZWRGaW5pc2goc3RhdGUpO1xuXG4gICAgaWYgKCFmaW5pc2hlZCAmJiAhc3RhdGUuY29ya2VkICYmICFzdGF0ZS5idWZmZXJQcm9jZXNzaW5nICYmIHN0YXRlLmJ1ZmZlcmVkUmVxdWVzdCkge1xuICAgICAgY2xlYXJCdWZmZXIoc3RyZWFtLCBzdGF0ZSk7XG4gICAgfVxuXG4gICAgaWYgKHN5bmMpIHtcbiAgICAgIC8qPHJlcGxhY2VtZW50PiovXG4gICAgICBhc3luY1dyaXRlKGFmdGVyV3JpdGUsIHN0cmVhbSwgc3RhdGUsIGZpbmlzaGVkLCBjYik7XG4gICAgICAvKjwvcmVwbGFjZW1lbnQ+Ki9cbiAgICB9IGVsc2Uge1xuICAgICAgYWZ0ZXJXcml0ZShzdHJlYW0sIHN0YXRlLCBmaW5pc2hlZCwgY2IpO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBhZnRlcldyaXRlKHN0cmVhbSwgc3RhdGUsIGZpbmlzaGVkLCBjYikge1xuICBpZiAoIWZpbmlzaGVkKSBvbndyaXRlRHJhaW4oc3RyZWFtLCBzdGF0ZSk7XG4gIHN0YXRlLnBlbmRpbmdjYi0tO1xuICBjYigpO1xuICBmaW5pc2hNYXliZShzdHJlYW0sIHN0YXRlKTtcbn1cblxuLy8gTXVzdCBmb3JjZSBjYWxsYmFjayB0byBiZSBjYWxsZWQgb24gbmV4dFRpY2ssIHNvIHRoYXQgd2UgZG9uJ3Rcbi8vIGVtaXQgJ2RyYWluJyBiZWZvcmUgdGhlIHdyaXRlKCkgY29uc3VtZXIgZ2V0cyB0aGUgJ2ZhbHNlJyByZXR1cm5cbi8vIHZhbHVlLCBhbmQgaGFzIGEgY2hhbmNlIHRvIGF0dGFjaCBhICdkcmFpbicgbGlzdGVuZXIuXG5mdW5jdGlvbiBvbndyaXRlRHJhaW4oc3RyZWFtLCBzdGF0ZSkge1xuICBpZiAoc3RhdGUubGVuZ3RoID09PSAwICYmIHN0YXRlLm5lZWREcmFpbikge1xuICAgIHN0YXRlLm5lZWREcmFpbiA9IGZhbHNlO1xuICAgIHN0cmVhbS5lbWl0KCdkcmFpbicpO1xuICB9XG59XG5cbi8vIGlmIHRoZXJlJ3Mgc29tZXRoaW5nIGluIHRoZSBidWZmZXIgd2FpdGluZywgdGhlbiBwcm9jZXNzIGl0XG5mdW5jdGlvbiBjbGVhckJ1ZmZlcihzdHJlYW0sIHN0YXRlKSB7XG4gIHN0YXRlLmJ1ZmZlclByb2Nlc3NpbmcgPSB0cnVlO1xuICB2YXIgZW50cnkgPSBzdGF0ZS5idWZmZXJlZFJlcXVlc3Q7XG5cbiAgaWYgKHN0cmVhbS5fd3JpdGV2ICYmIGVudHJ5ICYmIGVudHJ5Lm5leHQpIHtcbiAgICAvLyBGYXN0IGNhc2UsIHdyaXRlIGV2ZXJ5dGhpbmcgdXNpbmcgX3dyaXRldigpXG4gICAgdmFyIGwgPSBzdGF0ZS5idWZmZXJlZFJlcXVlc3RDb3VudDtcbiAgICB2YXIgYnVmZmVyID0gbmV3IEFycmF5KGwpO1xuICAgIHZhciBob2xkZXIgPSBzdGF0ZS5jb3JrZWRSZXF1ZXN0c0ZyZWU7XG4gICAgaG9sZGVyLmVudHJ5ID0gZW50cnk7XG5cbiAgICB2YXIgY291bnQgPSAwO1xuICAgIHdoaWxlIChlbnRyeSkge1xuICAgICAgYnVmZmVyW2NvdW50XSA9IGVudHJ5O1xuICAgICAgZW50cnkgPSBlbnRyeS5uZXh0O1xuICAgICAgY291bnQgKz0gMTtcbiAgICB9XG5cbiAgICBkb1dyaXRlKHN0cmVhbSwgc3RhdGUsIHRydWUsIHN0YXRlLmxlbmd0aCwgYnVmZmVyLCAnJywgaG9sZGVyLmZpbmlzaCk7XG5cbiAgICAvLyBkb1dyaXRlIGlzIGFsbW9zdCBhbHdheXMgYXN5bmMsIGRlZmVyIHRoZXNlIHRvIHNhdmUgYSBiaXQgb2YgdGltZVxuICAgIC8vIGFzIHRoZSBob3QgcGF0aCBlbmRzIHdpdGggZG9Xcml0ZVxuICAgIHN0YXRlLnBlbmRpbmdjYisrO1xuICAgIHN0YXRlLmxhc3RCdWZmZXJlZFJlcXVlc3QgPSBudWxsO1xuICAgIGlmIChob2xkZXIubmV4dCkge1xuICAgICAgc3RhdGUuY29ya2VkUmVxdWVzdHNGcmVlID0gaG9sZGVyLm5leHQ7XG4gICAgICBob2xkZXIubmV4dCA9IG51bGw7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0YXRlLmNvcmtlZFJlcXVlc3RzRnJlZSA9IG5ldyBDb3JrZWRSZXF1ZXN0KHN0YXRlKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgLy8gU2xvdyBjYXNlLCB3cml0ZSBjaHVua3Mgb25lLWJ5LW9uZVxuICAgIHdoaWxlIChlbnRyeSkge1xuICAgICAgdmFyIGNodW5rID0gZW50cnkuY2h1bms7XG4gICAgICB2YXIgZW5jb2RpbmcgPSBlbnRyeS5lbmNvZGluZztcbiAgICAgIHZhciBjYiA9IGVudHJ5LmNhbGxiYWNrO1xuICAgICAgdmFyIGxlbiA9IHN0YXRlLm9iamVjdE1vZGUgPyAxIDogY2h1bmsubGVuZ3RoO1xuXG4gICAgICBkb1dyaXRlKHN0cmVhbSwgc3RhdGUsIGZhbHNlLCBsZW4sIGNodW5rLCBlbmNvZGluZywgY2IpO1xuICAgICAgZW50cnkgPSBlbnRyeS5uZXh0O1xuICAgICAgLy8gaWYgd2UgZGlkbid0IGNhbGwgdGhlIG9ud3JpdGUgaW1tZWRpYXRlbHksIHRoZW5cbiAgICAgIC8vIGl0IG1lYW5zIHRoYXQgd2UgbmVlZCB0byB3YWl0IHVudGlsIGl0IGRvZXMuXG4gICAgICAvLyBhbHNvLCB0aGF0IG1lYW5zIHRoYXQgdGhlIGNodW5rIGFuZCBjYiBhcmUgY3VycmVudGx5XG4gICAgICAvLyBiZWluZyBwcm9jZXNzZWQsIHNvIG1vdmUgdGhlIGJ1ZmZlciBjb3VudGVyIHBhc3QgdGhlbS5cbiAgICAgIGlmIChzdGF0ZS53cml0aW5nKSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChlbnRyeSA9PT0gbnVsbCkgc3RhdGUubGFzdEJ1ZmZlcmVkUmVxdWVzdCA9IG51bGw7XG4gIH1cblxuICBzdGF0ZS5idWZmZXJlZFJlcXVlc3RDb3VudCA9IDA7XG4gIHN0YXRlLmJ1ZmZlcmVkUmVxdWVzdCA9IGVudHJ5O1xuICBzdGF0ZS5idWZmZXJQcm9jZXNzaW5nID0gZmFsc2U7XG59XG5cbldyaXRhYmxlLnByb3RvdHlwZS5fd3JpdGUgPSBmdW5jdGlvbiAoY2h1bmssIGVuY29kaW5nLCBjYikge1xuICBjYihuZXcgRXJyb3IoJ193cml0ZSgpIGlzIG5vdCBpbXBsZW1lbnRlZCcpKTtcbn07XG5cbldyaXRhYmxlLnByb3RvdHlwZS5fd3JpdGV2ID0gbnVsbDtcblxuV3JpdGFibGUucHJvdG90eXBlLmVuZCA9IGZ1bmN0aW9uIChjaHVuaywgZW5jb2RpbmcsIGNiKSB7XG4gIHZhciBzdGF0ZSA9IHRoaXMuX3dyaXRhYmxlU3RhdGU7XG5cbiAgaWYgKHR5cGVvZiBjaHVuayA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGNiID0gY2h1bms7XG4gICAgY2h1bmsgPSBudWxsO1xuICAgIGVuY29kaW5nID0gbnVsbDtcbiAgfSBlbHNlIGlmICh0eXBlb2YgZW5jb2RpbmcgPT09ICdmdW5jdGlvbicpIHtcbiAgICBjYiA9IGVuY29kaW5nO1xuICAgIGVuY29kaW5nID0gbnVsbDtcbiAgfVxuXG4gIGlmIChjaHVuayAhPT0gbnVsbCAmJiBjaHVuayAhPT0gdW5kZWZpbmVkKSB0aGlzLndyaXRlKGNodW5rLCBlbmNvZGluZyk7XG5cbiAgLy8gLmVuZCgpIGZ1bGx5IHVuY29ya3NcbiAgaWYgKHN0YXRlLmNvcmtlZCkge1xuICAgIHN0YXRlLmNvcmtlZCA9IDE7XG4gICAgdGhpcy51bmNvcmsoKTtcbiAgfVxuXG4gIC8vIGlnbm9yZSB1bm5lY2Vzc2FyeSBlbmQoKSBjYWxscy5cbiAgaWYgKCFzdGF0ZS5lbmRpbmcgJiYgIXN0YXRlLmZpbmlzaGVkKSBlbmRXcml0YWJsZSh0aGlzLCBzdGF0ZSwgY2IpO1xufTtcblxuZnVuY3Rpb24gbmVlZEZpbmlzaChzdGF0ZSkge1xuICByZXR1cm4gc3RhdGUuZW5kaW5nICYmIHN0YXRlLmxlbmd0aCA9PT0gMCAmJiBzdGF0ZS5idWZmZXJlZFJlcXVlc3QgPT09IG51bGwgJiYgIXN0YXRlLmZpbmlzaGVkICYmICFzdGF0ZS53cml0aW5nO1xufVxuXG5mdW5jdGlvbiBwcmVmaW5pc2goc3RyZWFtLCBzdGF0ZSkge1xuICBpZiAoIXN0YXRlLnByZWZpbmlzaGVkKSB7XG4gICAgc3RhdGUucHJlZmluaXNoZWQgPSB0cnVlO1xuICAgIHN0cmVhbS5lbWl0KCdwcmVmaW5pc2gnKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBmaW5pc2hNYXliZShzdHJlYW0sIHN0YXRlKSB7XG4gIHZhciBuZWVkID0gbmVlZEZpbmlzaChzdGF0ZSk7XG4gIGlmIChuZWVkKSB7XG4gICAgaWYgKHN0YXRlLnBlbmRpbmdjYiA9PT0gMCkge1xuICAgICAgcHJlZmluaXNoKHN0cmVhbSwgc3RhdGUpO1xuICAgICAgc3RhdGUuZmluaXNoZWQgPSB0cnVlO1xuICAgICAgc3RyZWFtLmVtaXQoJ2ZpbmlzaCcpO1xuICAgIH0gZWxzZSB7XG4gICAgICBwcmVmaW5pc2goc3RyZWFtLCBzdGF0ZSk7XG4gICAgfVxuICB9XG4gIHJldHVybiBuZWVkO1xufVxuXG5mdW5jdGlvbiBlbmRXcml0YWJsZShzdHJlYW0sIHN0YXRlLCBjYikge1xuICBzdGF0ZS5lbmRpbmcgPSB0cnVlO1xuICBmaW5pc2hNYXliZShzdHJlYW0sIHN0YXRlKTtcbiAgaWYgKGNiKSB7XG4gICAgaWYgKHN0YXRlLmZpbmlzaGVkKSBwcm9jZXNzTmV4dFRpY2soY2IpO2Vsc2Ugc3RyZWFtLm9uY2UoJ2ZpbmlzaCcsIGNiKTtcbiAgfVxuICBzdGF0ZS5lbmRlZCA9IHRydWU7XG4gIHN0cmVhbS53cml0YWJsZSA9IGZhbHNlO1xufVxuXG4vLyBJdCBzZWVtcyBhIGxpbmtlZCBsaXN0IGJ1dCBpdCBpcyBub3Rcbi8vIHRoZXJlIHdpbGwgYmUgb25seSAyIG9mIHRoZXNlIGZvciBlYWNoIHN0cmVhbVxuZnVuY3Rpb24gQ29ya2VkUmVxdWVzdChzdGF0ZSkge1xuICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gIHRoaXMubmV4dCA9IG51bGw7XG4gIHRoaXMuZW50cnkgPSBudWxsO1xuICB0aGlzLmZpbmlzaCA9IGZ1bmN0aW9uIChlcnIpIHtcbiAgICB2YXIgZW50cnkgPSBfdGhpcy5lbnRyeTtcbiAgICBfdGhpcy5lbnRyeSA9IG51bGw7XG4gICAgd2hpbGUgKGVudHJ5KSB7XG4gICAgICB2YXIgY2IgPSBlbnRyeS5jYWxsYmFjaztcbiAgICAgIHN0YXRlLnBlbmRpbmdjYi0tO1xuICAgICAgY2IoZXJyKTtcbiAgICAgIGVudHJ5ID0gZW50cnkubmV4dDtcbiAgICB9XG4gICAgaWYgKHN0YXRlLmNvcmtlZFJlcXVlc3RzRnJlZSkge1xuICAgICAgc3RhdGUuY29ya2VkUmVxdWVzdHNGcmVlLm5leHQgPSBfdGhpcztcbiAgICB9IGVsc2Uge1xuICAgICAgc3RhdGUuY29ya2VkUmVxdWVzdHNGcmVlID0gX3RoaXM7XG4gICAgfVxuICB9O1xufSIsIid1c2Ugc3RyaWN0JztcblxudmFyIEJ1ZmZlciA9IHJlcXVpcmUoJ2J1ZmZlcicpLkJ1ZmZlcjtcbi8qPHJlcGxhY2VtZW50PiovXG52YXIgYnVmZmVyU2hpbSA9IHJlcXVpcmUoJ2J1ZmZlci1zaGltcycpO1xuLyo8L3JlcGxhY2VtZW50PiovXG5cbm1vZHVsZS5leHBvcnRzID0gQnVmZmVyTGlzdDtcblxuZnVuY3Rpb24gQnVmZmVyTGlzdCgpIHtcbiAgdGhpcy5oZWFkID0gbnVsbDtcbiAgdGhpcy50YWlsID0gbnVsbDtcbiAgdGhpcy5sZW5ndGggPSAwO1xufVxuXG5CdWZmZXJMaXN0LnByb3RvdHlwZS5wdXNoID0gZnVuY3Rpb24gKHYpIHtcbiAgdmFyIGVudHJ5ID0geyBkYXRhOiB2LCBuZXh0OiBudWxsIH07XG4gIGlmICh0aGlzLmxlbmd0aCA+IDApIHRoaXMudGFpbC5uZXh0ID0gZW50cnk7ZWxzZSB0aGlzLmhlYWQgPSBlbnRyeTtcbiAgdGhpcy50YWlsID0gZW50cnk7XG4gICsrdGhpcy5sZW5ndGg7XG59O1xuXG5CdWZmZXJMaXN0LnByb3RvdHlwZS51bnNoaWZ0ID0gZnVuY3Rpb24gKHYpIHtcbiAgdmFyIGVudHJ5ID0geyBkYXRhOiB2LCBuZXh0OiB0aGlzLmhlYWQgfTtcbiAgaWYgKHRoaXMubGVuZ3RoID09PSAwKSB0aGlzLnRhaWwgPSBlbnRyeTtcbiAgdGhpcy5oZWFkID0gZW50cnk7XG4gICsrdGhpcy5sZW5ndGg7XG59O1xuXG5CdWZmZXJMaXN0LnByb3RvdHlwZS5zaGlmdCA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKHRoaXMubGVuZ3RoID09PSAwKSByZXR1cm47XG4gIHZhciByZXQgPSB0aGlzLmhlYWQuZGF0YTtcbiAgaWYgKHRoaXMubGVuZ3RoID09PSAxKSB0aGlzLmhlYWQgPSB0aGlzLnRhaWwgPSBudWxsO2Vsc2UgdGhpcy5oZWFkID0gdGhpcy5oZWFkLm5leHQ7XG4gIC0tdGhpcy5sZW5ndGg7XG4gIHJldHVybiByZXQ7XG59O1xuXG5CdWZmZXJMaXN0LnByb3RvdHlwZS5jbGVhciA9IGZ1bmN0aW9uICgpIHtcbiAgdGhpcy5oZWFkID0gdGhpcy50YWlsID0gbnVsbDtcbiAgdGhpcy5sZW5ndGggPSAwO1xufTtcblxuQnVmZmVyTGlzdC5wcm90b3R5cGUuam9pbiA9IGZ1bmN0aW9uIChzKSB7XG4gIGlmICh0aGlzLmxlbmd0aCA9PT0gMCkgcmV0dXJuICcnO1xuICB2YXIgcCA9IHRoaXMuaGVhZDtcbiAgdmFyIHJldCA9ICcnICsgcC5kYXRhO1xuICB3aGlsZSAocCA9IHAubmV4dCkge1xuICAgIHJldCArPSBzICsgcC5kYXRhO1xuICB9cmV0dXJuIHJldDtcbn07XG5cbkJ1ZmZlckxpc3QucHJvdG90eXBlLmNvbmNhdCA9IGZ1bmN0aW9uIChuKSB7XG4gIGlmICh0aGlzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIGJ1ZmZlclNoaW0uYWxsb2MoMCk7XG4gIGlmICh0aGlzLmxlbmd0aCA9PT0gMSkgcmV0dXJuIHRoaXMuaGVhZC5kYXRhO1xuICB2YXIgcmV0ID0gYnVmZmVyU2hpbS5hbGxvY1Vuc2FmZShuID4+PiAwKTtcbiAgdmFyIHAgPSB0aGlzLmhlYWQ7XG4gIHZhciBpID0gMDtcbiAgd2hpbGUgKHApIHtcbiAgICBwLmRhdGEuY29weShyZXQsIGkpO1xuICAgIGkgKz0gcC5kYXRhLmxlbmd0aDtcbiAgICBwID0gcC5uZXh0O1xuICB9XG4gIHJldHVybiByZXQ7XG59OyIsInZhciBTdHJlYW0gPSAoZnVuY3Rpb24gKCl7XG4gIHRyeSB7XG4gICAgcmV0dXJuIHJlcXVpcmUoJ3N0JyArICdyZWFtJyk7IC8vIGhhY2sgdG8gZml4IGEgY2lyY3VsYXIgZGVwZW5kZW5jeSBpc3N1ZSB3aGVuIHVzZWQgd2l0aCBicm93c2VyaWZ5XG4gIH0gY2F0Y2goXyl7fVxufSgpKTtcbmV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vbGliL19zdHJlYW1fcmVhZGFibGUuanMnKTtcbmV4cG9ydHMuU3RyZWFtID0gU3RyZWFtIHx8IGV4cG9ydHM7XG5leHBvcnRzLlJlYWRhYmxlID0gZXhwb3J0cztcbmV4cG9ydHMuV3JpdGFibGUgPSByZXF1aXJlKCcuL2xpYi9fc3RyZWFtX3dyaXRhYmxlLmpzJyk7XG5leHBvcnRzLkR1cGxleCA9IHJlcXVpcmUoJy4vbGliL19zdHJlYW1fZHVwbGV4LmpzJyk7XG5leHBvcnRzLlRyYW5zZm9ybSA9IHJlcXVpcmUoJy4vbGliL19zdHJlYW1fdHJhbnNmb3JtLmpzJyk7XG5leHBvcnRzLlBhc3NUaHJvdWdoID0gcmVxdWlyZSgnLi9saWIvX3N0cmVhbV9wYXNzdGhyb3VnaC5qcycpO1xuXG5pZiAoIXByb2Nlc3MuYnJvd3NlciAmJiBwcm9jZXNzLmVudi5SRUFEQUJMRV9TVFJFQU0gPT09ICdkaXNhYmxlJyAmJiBTdHJlYW0pIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSBTdHJlYW07XG59XG4iLCJ2YXIgQ2xpZW50UmVxdWVzdCA9IHJlcXVpcmUoJy4vbGliL3JlcXVlc3QnKVxudmFyIGV4dGVuZCA9IHJlcXVpcmUoJ3h0ZW5kJylcbnZhciBzdGF0dXNDb2RlcyA9IHJlcXVpcmUoJ2J1aWx0aW4tc3RhdHVzLWNvZGVzJylcbnZhciB1cmwgPSByZXF1aXJlKCd1cmwnKVxuXG52YXIgaHR0cCA9IGV4cG9ydHNcblxuaHR0cC5yZXF1ZXN0ID0gZnVuY3Rpb24gKG9wdHMsIGNiKSB7XG5cdGlmICh0eXBlb2Ygb3B0cyA9PT0gJ3N0cmluZycpXG5cdFx0b3B0cyA9IHVybC5wYXJzZShvcHRzKVxuXHRlbHNlXG5cdFx0b3B0cyA9IGV4dGVuZChvcHRzKVxuXG5cdC8vIE5vcm1hbGx5LCB0aGUgcGFnZSBpcyBsb2FkZWQgZnJvbSBodHRwIG9yIGh0dHBzLCBzbyBub3Qgc3BlY2lmeWluZyBhIHByb3RvY29sXG5cdC8vIHdpbGwgcmVzdWx0IGluIGEgKHZhbGlkKSBwcm90b2NvbC1yZWxhdGl2ZSB1cmwuIEhvd2V2ZXIsIHRoaXMgd29uJ3Qgd29yayBpZlxuXHQvLyB0aGUgcHJvdG9jb2wgaXMgc29tZXRoaW5nIGVsc2UsIGxpa2UgJ2ZpbGU6J1xuXHR2YXIgZGVmYXVsdFByb3RvY29sID0gZ2xvYmFsLmxvY2F0aW9uLnByb3RvY29sLnNlYXJjaCgvXmh0dHBzPzokLykgPT09IC0xID8gJ2h0dHA6JyA6ICcnXG5cblx0dmFyIHByb3RvY29sID0gb3B0cy5wcm90b2NvbCB8fCBkZWZhdWx0UHJvdG9jb2xcblx0dmFyIGhvc3QgPSBvcHRzLmhvc3RuYW1lIHx8IG9wdHMuaG9zdFxuXHR2YXIgcG9ydCA9IG9wdHMucG9ydFxuXHR2YXIgcGF0aCA9IG9wdHMucGF0aCB8fCAnLydcblxuXHQvLyBOZWNlc3NhcnkgZm9yIElQdjYgYWRkcmVzc2VzXG5cdGlmIChob3N0ICYmIGhvc3QuaW5kZXhPZignOicpICE9PSAtMSlcblx0XHRob3N0ID0gJ1snICsgaG9zdCArICddJ1xuXG5cdC8vIFRoaXMgbWF5IGJlIGEgcmVsYXRpdmUgdXJsLiBUaGUgYnJvd3NlciBzaG91bGQgYWx3YXlzIGJlIGFibGUgdG8gaW50ZXJwcmV0IGl0IGNvcnJlY3RseS5cblx0b3B0cy51cmwgPSAoaG9zdCA/IChwcm90b2NvbCArICcvLycgKyBob3N0KSA6ICcnKSArIChwb3J0ID8gJzonICsgcG9ydCA6ICcnKSArIHBhdGhcblx0b3B0cy5tZXRob2QgPSAob3B0cy5tZXRob2QgfHwgJ0dFVCcpLnRvVXBwZXJDYXNlKClcblx0b3B0cy5oZWFkZXJzID0gb3B0cy5oZWFkZXJzIHx8IHt9XG5cblx0Ly8gQWxzbyB2YWxpZCBvcHRzLmF1dGgsIG9wdHMubW9kZVxuXG5cdHZhciByZXEgPSBuZXcgQ2xpZW50UmVxdWVzdChvcHRzKVxuXHRpZiAoY2IpXG5cdFx0cmVxLm9uKCdyZXNwb25zZScsIGNiKVxuXHRyZXR1cm4gcmVxXG59XG5cbmh0dHAuZ2V0ID0gZnVuY3Rpb24gZ2V0IChvcHRzLCBjYikge1xuXHR2YXIgcmVxID0gaHR0cC5yZXF1ZXN0KG9wdHMsIGNiKVxuXHRyZXEuZW5kKClcblx0cmV0dXJuIHJlcVxufVxuXG5odHRwLkFnZW50ID0gZnVuY3Rpb24gKCkge31cbmh0dHAuQWdlbnQuZGVmYXVsdE1heFNvY2tldHMgPSA0XG5cbmh0dHAuU1RBVFVTX0NPREVTID0gc3RhdHVzQ29kZXNcblxuaHR0cC5NRVRIT0RTID0gW1xuXHQnQ0hFQ0tPVVQnLFxuXHQnQ09OTkVDVCcsXG5cdCdDT1BZJyxcblx0J0RFTEVURScsXG5cdCdHRVQnLFxuXHQnSEVBRCcsXG5cdCdMT0NLJyxcblx0J00tU0VBUkNIJyxcblx0J01FUkdFJyxcblx0J01LQUNUSVZJVFknLFxuXHQnTUtDT0wnLFxuXHQnTU9WRScsXG5cdCdOT1RJRlknLFxuXHQnT1BUSU9OUycsXG5cdCdQQVRDSCcsXG5cdCdQT1NUJyxcblx0J1BST1BGSU5EJyxcblx0J1BST1BQQVRDSCcsXG5cdCdQVVJHRScsXG5cdCdQVVQnLFxuXHQnUkVQT1JUJyxcblx0J1NFQVJDSCcsXG5cdCdTVUJTQ1JJQkUnLFxuXHQnVFJBQ0UnLFxuXHQnVU5MT0NLJyxcblx0J1VOU1VCU0NSSUJFJ1xuXSIsImV4cG9ydHMuZmV0Y2ggPSBpc0Z1bmN0aW9uKGdsb2JhbC5mZXRjaCkgJiYgaXNGdW5jdGlvbihnbG9iYWwuUmVhZGFibGVTdHJlYW0pXG5cbmV4cG9ydHMuYmxvYkNvbnN0cnVjdG9yID0gZmFsc2VcbnRyeSB7XG5cdG5ldyBCbG9iKFtuZXcgQXJyYXlCdWZmZXIoMSldKVxuXHRleHBvcnRzLmJsb2JDb25zdHJ1Y3RvciA9IHRydWVcbn0gY2F0Y2ggKGUpIHt9XG5cbi8vIFRoZSB4aHIgcmVxdWVzdCB0byBleGFtcGxlLmNvbSBtYXkgdmlvbGF0ZSBzb21lIHJlc3RyaWN0aXZlIENTUCBjb25maWd1cmF0aW9ucyxcbi8vIHNvIGlmIHdlJ3JlIHJ1bm5pbmcgaW4gYSBicm93c2VyIHRoYXQgc3VwcG9ydHMgYGZldGNoYCwgYXZvaWQgY2FsbGluZyBnZXRYSFIoKVxuLy8gYW5kIGFzc3VtZSBzdXBwb3J0IGZvciBjZXJ0YWluIGZlYXR1cmVzIGJlbG93LlxudmFyIHhoclxuZnVuY3Rpb24gZ2V0WEhSICgpIHtcblx0Ly8gQ2FjaGUgdGhlIHhociB2YWx1ZVxuXHRpZiAoeGhyICE9PSB1bmRlZmluZWQpIHJldHVybiB4aHJcblxuXHRpZiAoZ2xvYmFsLlhNTEh0dHBSZXF1ZXN0KSB7XG5cdFx0eGhyID0gbmV3IGdsb2JhbC5YTUxIdHRwUmVxdWVzdCgpXG5cdFx0Ly8gSWYgWERvbWFpblJlcXVlc3QgaXMgYXZhaWxhYmxlIChpZSBvbmx5LCB3aGVyZSB4aHIgbWlnaHQgbm90IHdvcmtcblx0XHQvLyBjcm9zcyBkb21haW4pLCB1c2UgdGhlIHBhZ2UgbG9jYXRpb24uIE90aGVyd2lzZSB1c2UgZXhhbXBsZS5jb21cblx0XHQvLyBOb3RlOiB0aGlzIGRvZXNuJ3QgYWN0dWFsbHkgbWFrZSBhbiBodHRwIHJlcXVlc3QuXG5cdFx0dHJ5IHtcblx0XHRcdHhoci5vcGVuKCdHRVQnLCBnbG9iYWwuWERvbWFpblJlcXVlc3QgPyAnLycgOiAnaHR0cHM6Ly9leGFtcGxlLmNvbScpXG5cdFx0fSBjYXRjaChlKSB7XG5cdFx0XHR4aHIgPSBudWxsXG5cdFx0fVxuXHR9IGVsc2Uge1xuXHRcdC8vIFNlcnZpY2Ugd29ya2VycyBkb24ndCBoYXZlIFhIUlxuXHRcdHhociA9IG51bGxcblx0fVxuXHRyZXR1cm4geGhyXG59XG5cbmZ1bmN0aW9uIGNoZWNrVHlwZVN1cHBvcnQgKHR5cGUpIHtcblx0dmFyIHhociA9IGdldFhIUigpXG5cdGlmICgheGhyKSByZXR1cm4gZmFsc2Vcblx0dHJ5IHtcblx0XHR4aHIucmVzcG9uc2VUeXBlID0gdHlwZVxuXHRcdHJldHVybiB4aHIucmVzcG9uc2VUeXBlID09PSB0eXBlXG5cdH0gY2F0Y2ggKGUpIHt9XG5cdHJldHVybiBmYWxzZVxufVxuXG4vLyBGb3Igc29tZSBzdHJhbmdlIHJlYXNvbiwgU2FmYXJpIDcuMCByZXBvcnRzIHR5cGVvZiBnbG9iYWwuQXJyYXlCdWZmZXIgPT09ICdvYmplY3QnLlxuLy8gU2FmYXJpIDcuMSBhcHBlYXJzIHRvIGhhdmUgZml4ZWQgdGhpcyBidWcuXG52YXIgaGF2ZUFycmF5QnVmZmVyID0gdHlwZW9mIGdsb2JhbC5BcnJheUJ1ZmZlciAhPT0gJ3VuZGVmaW5lZCdcbnZhciBoYXZlU2xpY2UgPSBoYXZlQXJyYXlCdWZmZXIgJiYgaXNGdW5jdGlvbihnbG9iYWwuQXJyYXlCdWZmZXIucHJvdG90eXBlLnNsaWNlKVxuXG4vLyBJZiBmZXRjaCBpcyBzdXBwb3J0ZWQsIHRoZW4gYXJyYXlidWZmZXIgd2lsbCBiZSBzdXBwb3J0ZWQgdG9vLiBTa2lwIGNhbGxpbmdcbi8vIGNoZWNrVHlwZVN1cHBvcnQoKSwgc2luY2UgdGhhdCBjYWxscyBnZXRYSFIoKS5cbmV4cG9ydHMuYXJyYXlidWZmZXIgPSBleHBvcnRzLmZldGNoIHx8IChoYXZlQXJyYXlCdWZmZXIgJiYgY2hlY2tUeXBlU3VwcG9ydCgnYXJyYXlidWZmZXInKSlcblxuLy8gVGhlc2UgbmV4dCB0d28gdGVzdHMgdW5hdm9pZGFibHkgc2hvdyB3YXJuaW5ncyBpbiBDaHJvbWUuIFNpbmNlIGZldGNoIHdpbGwgYWx3YXlzXG4vLyBiZSB1c2VkIGlmIGl0J3MgYXZhaWxhYmxlLCBqdXN0IHJldHVybiBmYWxzZSBmb3IgdGhlc2UgdG8gYXZvaWQgdGhlIHdhcm5pbmdzLlxuZXhwb3J0cy5tc3N0cmVhbSA9ICFleHBvcnRzLmZldGNoICYmIGhhdmVTbGljZSAmJiBjaGVja1R5cGVTdXBwb3J0KCdtcy1zdHJlYW0nKVxuZXhwb3J0cy5tb3pjaHVua2VkYXJyYXlidWZmZXIgPSAhZXhwb3J0cy5mZXRjaCAmJiBoYXZlQXJyYXlCdWZmZXIgJiZcblx0Y2hlY2tUeXBlU3VwcG9ydCgnbW96LWNodW5rZWQtYXJyYXlidWZmZXInKVxuXG4vLyBJZiBmZXRjaCBpcyBzdXBwb3J0ZWQsIHRoZW4gb3ZlcnJpZGVNaW1lVHlwZSB3aWxsIGJlIHN1cHBvcnRlZCB0b28uIFNraXAgY2FsbGluZ1xuLy8gZ2V0WEhSKCkuXG5leHBvcnRzLm92ZXJyaWRlTWltZVR5cGUgPSBleHBvcnRzLmZldGNoIHx8IChnZXRYSFIoKSA/IGlzRnVuY3Rpb24oZ2V0WEhSKCkub3ZlcnJpZGVNaW1lVHlwZSkgOiBmYWxzZSlcblxuZXhwb3J0cy52YkFycmF5ID0gaXNGdW5jdGlvbihnbG9iYWwuVkJBcnJheSlcblxuZnVuY3Rpb24gaXNGdW5jdGlvbiAodmFsdWUpIHtcblx0cmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJ1xufVxuXG54aHIgPSBudWxsIC8vIEhlbHAgZ2NcbiIsInZhciBjYXBhYmlsaXR5ID0gcmVxdWlyZSgnLi9jYXBhYmlsaXR5JylcbnZhciBpbmhlcml0cyA9IHJlcXVpcmUoJ2luaGVyaXRzJylcbnZhciByZXNwb25zZSA9IHJlcXVpcmUoJy4vcmVzcG9uc2UnKVxudmFyIHN0cmVhbSA9IHJlcXVpcmUoJ3JlYWRhYmxlLXN0cmVhbScpXG52YXIgdG9BcnJheUJ1ZmZlciA9IHJlcXVpcmUoJ3RvLWFycmF5YnVmZmVyJylcblxudmFyIEluY29taW5nTWVzc2FnZSA9IHJlc3BvbnNlLkluY29taW5nTWVzc2FnZVxudmFyIHJTdGF0ZXMgPSByZXNwb25zZS5yZWFkeVN0YXRlc1xuXG5mdW5jdGlvbiBkZWNpZGVNb2RlIChwcmVmZXJCaW5hcnksIHVzZUZldGNoKSB7XG5cdGlmIChjYXBhYmlsaXR5LmZldGNoICYmIHVzZUZldGNoKSB7XG5cdFx0cmV0dXJuICdmZXRjaCdcblx0fSBlbHNlIGlmIChjYXBhYmlsaXR5Lm1vemNodW5rZWRhcnJheWJ1ZmZlcikge1xuXHRcdHJldHVybiAnbW96LWNodW5rZWQtYXJyYXlidWZmZXInXG5cdH0gZWxzZSBpZiAoY2FwYWJpbGl0eS5tc3N0cmVhbSkge1xuXHRcdHJldHVybiAnbXMtc3RyZWFtJ1xuXHR9IGVsc2UgaWYgKGNhcGFiaWxpdHkuYXJyYXlidWZmZXIgJiYgcHJlZmVyQmluYXJ5KSB7XG5cdFx0cmV0dXJuICdhcnJheWJ1ZmZlcidcblx0fSBlbHNlIGlmIChjYXBhYmlsaXR5LnZiQXJyYXkgJiYgcHJlZmVyQmluYXJ5KSB7XG5cdFx0cmV0dXJuICd0ZXh0OnZiYXJyYXknXG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuICd0ZXh0J1xuXHR9XG59XG5cbnZhciBDbGllbnRSZXF1ZXN0ID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAob3B0cykge1xuXHR2YXIgc2VsZiA9IHRoaXNcblx0c3RyZWFtLldyaXRhYmxlLmNhbGwoc2VsZilcblxuXHRzZWxmLl9vcHRzID0gb3B0c1xuXHRzZWxmLl9ib2R5ID0gW11cblx0c2VsZi5faGVhZGVycyA9IHt9XG5cdGlmIChvcHRzLmF1dGgpXG5cdFx0c2VsZi5zZXRIZWFkZXIoJ0F1dGhvcml6YXRpb24nLCAnQmFzaWMgJyArIG5ldyBCdWZmZXIob3B0cy5hdXRoKS50b1N0cmluZygnYmFzZTY0JykpXG5cdE9iamVjdC5rZXlzKG9wdHMuaGVhZGVycykuZm9yRWFjaChmdW5jdGlvbiAobmFtZSkge1xuXHRcdHNlbGYuc2V0SGVhZGVyKG5hbWUsIG9wdHMuaGVhZGVyc1tuYW1lXSlcblx0fSlcblxuXHR2YXIgcHJlZmVyQmluYXJ5XG5cdHZhciB1c2VGZXRjaCA9IHRydWVcblx0aWYgKG9wdHMubW9kZSA9PT0gJ2Rpc2FibGUtZmV0Y2gnIHx8ICd0aW1lb3V0JyBpbiBvcHRzKSB7XG5cdFx0Ly8gSWYgdGhlIHVzZSBvZiBYSFIgc2hvdWxkIGJlIHByZWZlcnJlZCBhbmQgaW5jbHVkZXMgcHJlc2VydmluZyB0aGUgJ2NvbnRlbnQtdHlwZScgaGVhZGVyLlxuXHRcdC8vIEZvcmNlIFhIUiB0byBiZSB1c2VkIHNpbmNlIHRoZSBGZXRjaCBBUEkgZG9lcyBub3QgeWV0IHN1cHBvcnQgdGltZW91dHMuXG5cdFx0dXNlRmV0Y2ggPSBmYWxzZVxuXHRcdHByZWZlckJpbmFyeSA9IHRydWVcblx0fSBlbHNlIGlmIChvcHRzLm1vZGUgPT09ICdwcmVmZXItc3RyZWFtaW5nJykge1xuXHRcdC8vIElmIHN0cmVhbWluZyBpcyBhIGhpZ2ggcHJpb3JpdHkgYnV0IGJpbmFyeSBjb21wYXRpYmlsaXR5IGFuZFxuXHRcdC8vIHRoZSBhY2N1cmFjeSBvZiB0aGUgJ2NvbnRlbnQtdHlwZScgaGVhZGVyIGFyZW4ndFxuXHRcdHByZWZlckJpbmFyeSA9IGZhbHNlXG5cdH0gZWxzZSBpZiAob3B0cy5tb2RlID09PSAnYWxsb3ctd3JvbmctY29udGVudC10eXBlJykge1xuXHRcdC8vIElmIHN0cmVhbWluZyBpcyBtb3JlIGltcG9ydGFudCB0aGFuIHByZXNlcnZpbmcgdGhlICdjb250ZW50LXR5cGUnIGhlYWRlclxuXHRcdHByZWZlckJpbmFyeSA9ICFjYXBhYmlsaXR5Lm92ZXJyaWRlTWltZVR5cGVcblx0fSBlbHNlIGlmICghb3B0cy5tb2RlIHx8IG9wdHMubW9kZSA9PT0gJ2RlZmF1bHQnIHx8IG9wdHMubW9kZSA9PT0gJ3ByZWZlci1mYXN0Jykge1xuXHRcdC8vIFVzZSBiaW5hcnkgaWYgdGV4dCBzdHJlYW1pbmcgbWF5IGNvcnJ1cHQgZGF0YSBvciB0aGUgY29udGVudC10eXBlIGhlYWRlciwgb3IgZm9yIHNwZWVkXG5cdFx0cHJlZmVyQmluYXJ5ID0gdHJ1ZVxuXHR9IGVsc2Uge1xuXHRcdHRocm93IG5ldyBFcnJvcignSW52YWxpZCB2YWx1ZSBmb3Igb3B0cy5tb2RlJylcblx0fVxuXHRzZWxmLl9tb2RlID0gZGVjaWRlTW9kZShwcmVmZXJCaW5hcnksIHVzZUZldGNoKVxuXG5cdHNlbGYub24oJ2ZpbmlzaCcsIGZ1bmN0aW9uICgpIHtcblx0XHRzZWxmLl9vbkZpbmlzaCgpXG5cdH0pXG59XG5cbmluaGVyaXRzKENsaWVudFJlcXVlc3QsIHN0cmVhbS5Xcml0YWJsZSlcblxuQ2xpZW50UmVxdWVzdC5wcm90b3R5cGUuc2V0SGVhZGVyID0gZnVuY3Rpb24gKG5hbWUsIHZhbHVlKSB7XG5cdHZhciBzZWxmID0gdGhpc1xuXHR2YXIgbG93ZXJOYW1lID0gbmFtZS50b0xvd2VyQ2FzZSgpXG5cdC8vIFRoaXMgY2hlY2sgaXMgbm90IG5lY2Vzc2FyeSwgYnV0IGl0IHByZXZlbnRzIHdhcm5pbmdzIGZyb20gYnJvd3NlcnMgYWJvdXQgc2V0dGluZyB1bnNhZmVcblx0Ly8gaGVhZGVycy4gVG8gYmUgaG9uZXN0IEknbSBub3QgZW50aXJlbHkgc3VyZSBoaWRpbmcgdGhlc2Ugd2FybmluZ3MgaXMgYSBnb29kIHRoaW5nLCBidXRcblx0Ly8gaHR0cC1icm93c2VyaWZ5IGRpZCBpdCwgc28gSSB3aWxsIHRvby5cblx0aWYgKHVuc2FmZUhlYWRlcnMuaW5kZXhPZihsb3dlck5hbWUpICE9PSAtMSlcblx0XHRyZXR1cm5cblxuXHRzZWxmLl9oZWFkZXJzW2xvd2VyTmFtZV0gPSB7XG5cdFx0bmFtZTogbmFtZSxcblx0XHR2YWx1ZTogdmFsdWVcblx0fVxufVxuXG5DbGllbnRSZXF1ZXN0LnByb3RvdHlwZS5nZXRIZWFkZXIgPSBmdW5jdGlvbiAobmFtZSkge1xuXHR2YXIgc2VsZiA9IHRoaXNcblx0cmV0dXJuIHNlbGYuX2hlYWRlcnNbbmFtZS50b0xvd2VyQ2FzZSgpXS52YWx1ZVxufVxuXG5DbGllbnRSZXF1ZXN0LnByb3RvdHlwZS5yZW1vdmVIZWFkZXIgPSBmdW5jdGlvbiAobmFtZSkge1xuXHR2YXIgc2VsZiA9IHRoaXNcblx0ZGVsZXRlIHNlbGYuX2hlYWRlcnNbbmFtZS50b0xvd2VyQ2FzZSgpXVxufVxuXG5DbGllbnRSZXF1ZXN0LnByb3RvdHlwZS5fb25GaW5pc2ggPSBmdW5jdGlvbiAoKSB7XG5cdHZhciBzZWxmID0gdGhpc1xuXG5cdGlmIChzZWxmLl9kZXN0cm95ZWQpXG5cdFx0cmV0dXJuXG5cdHZhciBvcHRzID0gc2VsZi5fb3B0c1xuXG5cdHZhciBoZWFkZXJzT2JqID0gc2VsZi5faGVhZGVyc1xuXHR2YXIgYm9keSA9IG51bGxcblx0aWYgKG9wdHMubWV0aG9kID09PSAnUE9TVCcgfHwgb3B0cy5tZXRob2QgPT09ICdQVVQnIHx8IG9wdHMubWV0aG9kID09PSAnUEFUQ0gnIHx8IG9wdHMubWV0aG9kID09PSAnTUVSR0UnKSB7XG5cdFx0aWYgKGNhcGFiaWxpdHkuYmxvYkNvbnN0cnVjdG9yKSB7XG5cdFx0XHRib2R5ID0gbmV3IGdsb2JhbC5CbG9iKHNlbGYuX2JvZHkubWFwKGZ1bmN0aW9uIChidWZmZXIpIHtcblx0XHRcdFx0cmV0dXJuIHRvQXJyYXlCdWZmZXIoYnVmZmVyKVxuXHRcdFx0fSksIHtcblx0XHRcdFx0dHlwZTogKGhlYWRlcnNPYmpbJ2NvbnRlbnQtdHlwZSddIHx8IHt9KS52YWx1ZSB8fCAnJ1xuXHRcdFx0fSlcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gZ2V0IHV0Zjggc3RyaW5nXG5cdFx0XHRib2R5ID0gQnVmZmVyLmNvbmNhdChzZWxmLl9ib2R5KS50b1N0cmluZygpXG5cdFx0fVxuXHR9XG5cblx0aWYgKHNlbGYuX21vZGUgPT09ICdmZXRjaCcpIHtcblx0XHR2YXIgaGVhZGVycyA9IE9iamVjdC5rZXlzKGhlYWRlcnNPYmopLm1hcChmdW5jdGlvbiAobmFtZSkge1xuXHRcdFx0cmV0dXJuIFtoZWFkZXJzT2JqW25hbWVdLm5hbWUsIGhlYWRlcnNPYmpbbmFtZV0udmFsdWVdXG5cdFx0fSlcblxuXHRcdGdsb2JhbC5mZXRjaChzZWxmLl9vcHRzLnVybCwge1xuXHRcdFx0bWV0aG9kOiBzZWxmLl9vcHRzLm1ldGhvZCxcblx0XHRcdGhlYWRlcnM6IGhlYWRlcnMsXG5cdFx0XHRib2R5OiBib2R5IHx8IHVuZGVmaW5lZCxcblx0XHRcdG1vZGU6ICdjb3JzJyxcblx0XHRcdGNyZWRlbnRpYWxzOiBvcHRzLndpdGhDcmVkZW50aWFscyA/ICdpbmNsdWRlJyA6ICdzYW1lLW9yaWdpbidcblx0XHR9KS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuXHRcdFx0c2VsZi5fZmV0Y2hSZXNwb25zZSA9IHJlc3BvbnNlXG5cdFx0XHRzZWxmLl9jb25uZWN0KClcblx0XHR9LCBmdW5jdGlvbiAocmVhc29uKSB7XG5cdFx0XHRzZWxmLmVtaXQoJ2Vycm9yJywgcmVhc29uKVxuXHRcdH0pXG5cdH0gZWxzZSB7XG5cdFx0dmFyIHhociA9IHNlbGYuX3hociA9IG5ldyBnbG9iYWwuWE1MSHR0cFJlcXVlc3QoKVxuXHRcdHRyeSB7XG5cdFx0XHR4aHIub3BlbihzZWxmLl9vcHRzLm1ldGhvZCwgc2VsZi5fb3B0cy51cmwsIHRydWUpXG5cdFx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0XHRwcm9jZXNzLm5leHRUaWNrKGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0c2VsZi5lbWl0KCdlcnJvcicsIGVycilcblx0XHRcdH0pXG5cdFx0XHRyZXR1cm5cblx0XHR9XG5cblx0XHQvLyBDYW4ndCBzZXQgcmVzcG9uc2VUeXBlIG9uIHJlYWxseSBvbGQgYnJvd3NlcnNcblx0XHRpZiAoJ3Jlc3BvbnNlVHlwZScgaW4geGhyKVxuXHRcdFx0eGhyLnJlc3BvbnNlVHlwZSA9IHNlbGYuX21vZGUuc3BsaXQoJzonKVswXVxuXG5cdFx0aWYgKCd3aXRoQ3JlZGVudGlhbHMnIGluIHhocilcblx0XHRcdHhoci53aXRoQ3JlZGVudGlhbHMgPSAhIW9wdHMud2l0aENyZWRlbnRpYWxzXG5cblx0XHRpZiAoc2VsZi5fbW9kZSA9PT0gJ3RleHQnICYmICdvdmVycmlkZU1pbWVUeXBlJyBpbiB4aHIpXG5cdFx0XHR4aHIub3ZlcnJpZGVNaW1lVHlwZSgndGV4dC9wbGFpbjsgY2hhcnNldD14LXVzZXItZGVmaW5lZCcpXG5cblx0XHRpZiAoJ3RpbWVvdXQnIGluIG9wdHMpIHtcblx0XHRcdHhoci50aW1lb3V0ID0gb3B0cy50aW1lb3V0XG5cdFx0XHR4aHIub250aW1lb3V0ID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRzZWxmLmVtaXQoJ3RpbWVvdXQnKVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdE9iamVjdC5rZXlzKGhlYWRlcnNPYmopLmZvckVhY2goZnVuY3Rpb24gKG5hbWUpIHtcblx0XHRcdHhoci5zZXRSZXF1ZXN0SGVhZGVyKGhlYWRlcnNPYmpbbmFtZV0ubmFtZSwgaGVhZGVyc09ialtuYW1lXS52YWx1ZSlcblx0XHR9KVxuXG5cdFx0c2VsZi5fcmVzcG9uc2UgPSBudWxsXG5cdFx0eGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdHN3aXRjaCAoeGhyLnJlYWR5U3RhdGUpIHtcblx0XHRcdFx0Y2FzZSByU3RhdGVzLkxPQURJTkc6XG5cdFx0XHRcdGNhc2UgclN0YXRlcy5ET05FOlxuXHRcdFx0XHRcdHNlbGYuX29uWEhSUHJvZ3Jlc3MoKVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHR9XG5cdFx0fVxuXHRcdC8vIE5lY2Vzc2FyeSBmb3Igc3RyZWFtaW5nIGluIEZpcmVmb3gsIHNpbmNlIHhoci5yZXNwb25zZSBpcyBPTkxZIGRlZmluZWRcblx0XHQvLyBpbiBvbnByb2dyZXNzLCBub3QgaW4gb25yZWFkeXN0YXRlY2hhbmdlIHdpdGggeGhyLnJlYWR5U3RhdGUgPSAzXG5cdFx0aWYgKHNlbGYuX21vZGUgPT09ICdtb3otY2h1bmtlZC1hcnJheWJ1ZmZlcicpIHtcblx0XHRcdHhoci5vbnByb2dyZXNzID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRzZWxmLl9vblhIUlByb2dyZXNzKClcblx0XHRcdH1cblx0XHR9XG5cblx0XHR4aHIub25lcnJvciA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdGlmIChzZWxmLl9kZXN0cm95ZWQpXG5cdFx0XHRcdHJldHVyblxuXHRcdFx0c2VsZi5lbWl0KCdlcnJvcicsIG5ldyBFcnJvcignWEhSIGVycm9yJykpXG5cdFx0fVxuXG5cdFx0dHJ5IHtcblx0XHRcdHhoci5zZW5kKGJvZHkpXG5cdFx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0XHRwcm9jZXNzLm5leHRUaWNrKGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0c2VsZi5lbWl0KCdlcnJvcicsIGVycilcblx0XHRcdH0pXG5cdFx0XHRyZXR1cm5cblx0XHR9XG5cdH1cbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgeGhyLnN0YXR1cyBpcyByZWFkYWJsZSBhbmQgbm9uLXplcm8sIGluZGljYXRpbmcgbm8gZXJyb3IuXG4gKiBFdmVuIHRob3VnaCB0aGUgc3BlYyBzYXlzIGl0IHNob3VsZCBiZSBhdmFpbGFibGUgaW4gcmVhZHlTdGF0ZSAzLFxuICogYWNjZXNzaW5nIGl0IHRocm93cyBhbiBleGNlcHRpb24gaW4gSUU4XG4gKi9cbmZ1bmN0aW9uIHN0YXR1c1ZhbGlkICh4aHIpIHtcblx0dHJ5IHtcblx0XHR2YXIgc3RhdHVzID0geGhyLnN0YXR1c1xuXHRcdHJldHVybiAoc3RhdHVzICE9PSBudWxsICYmIHN0YXR1cyAhPT0gMClcblx0fSBjYXRjaCAoZSkge1xuXHRcdHJldHVybiBmYWxzZVxuXHR9XG59XG5cbkNsaWVudFJlcXVlc3QucHJvdG90eXBlLl9vblhIUlByb2dyZXNzID0gZnVuY3Rpb24gKCkge1xuXHR2YXIgc2VsZiA9IHRoaXNcblxuXHRpZiAoIXN0YXR1c1ZhbGlkKHNlbGYuX3hocikgfHwgc2VsZi5fZGVzdHJveWVkKVxuXHRcdHJldHVyblxuXG5cdGlmICghc2VsZi5fcmVzcG9uc2UpXG5cdFx0c2VsZi5fY29ubmVjdCgpXG5cblx0c2VsZi5fcmVzcG9uc2UuX29uWEhSUHJvZ3Jlc3MoKVxufVxuXG5DbGllbnRSZXF1ZXN0LnByb3RvdHlwZS5fY29ubmVjdCA9IGZ1bmN0aW9uICgpIHtcblx0dmFyIHNlbGYgPSB0aGlzXG5cblx0aWYgKHNlbGYuX2Rlc3Ryb3llZClcblx0XHRyZXR1cm5cblxuXHRzZWxmLl9yZXNwb25zZSA9IG5ldyBJbmNvbWluZ01lc3NhZ2Uoc2VsZi5feGhyLCBzZWxmLl9mZXRjaFJlc3BvbnNlLCBzZWxmLl9tb2RlKVxuXHRzZWxmLl9yZXNwb25zZS5vbignZXJyb3InLCBmdW5jdGlvbihlcnIpIHtcblx0XHRzZWxmLmVtaXQoJ2Vycm9yJywgZXJyKVxuXHR9KVxuXG5cdHNlbGYuZW1pdCgncmVzcG9uc2UnLCBzZWxmLl9yZXNwb25zZSlcbn1cblxuQ2xpZW50UmVxdWVzdC5wcm90b3R5cGUuX3dyaXRlID0gZnVuY3Rpb24gKGNodW5rLCBlbmNvZGluZywgY2IpIHtcblx0dmFyIHNlbGYgPSB0aGlzXG5cblx0c2VsZi5fYm9keS5wdXNoKGNodW5rKVxuXHRjYigpXG59XG5cbkNsaWVudFJlcXVlc3QucHJvdG90eXBlLmFib3J0ID0gQ2xpZW50UmVxdWVzdC5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uICgpIHtcblx0dmFyIHNlbGYgPSB0aGlzXG5cdHNlbGYuX2Rlc3Ryb3llZCA9IHRydWVcblx0aWYgKHNlbGYuX3Jlc3BvbnNlKVxuXHRcdHNlbGYuX3Jlc3BvbnNlLl9kZXN0cm95ZWQgPSB0cnVlXG5cdGlmIChzZWxmLl94aHIpXG5cdFx0c2VsZi5feGhyLmFib3J0KClcblx0Ly8gQ3VycmVudGx5LCB0aGVyZSBpc24ndCBhIHdheSB0byB0cnVseSBhYm9ydCBhIGZldGNoLlxuXHQvLyBJZiB5b3UgbGlrZSBiaWtlc2hlZGRpbmcsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vd2hhdHdnL2ZldGNoL2lzc3Vlcy8yN1xufVxuXG5DbGllbnRSZXF1ZXN0LnByb3RvdHlwZS5lbmQgPSBmdW5jdGlvbiAoZGF0YSwgZW5jb2RpbmcsIGNiKSB7XG5cdHZhciBzZWxmID0gdGhpc1xuXHRpZiAodHlwZW9mIGRhdGEgPT09ICdmdW5jdGlvbicpIHtcblx0XHRjYiA9IGRhdGFcblx0XHRkYXRhID0gdW5kZWZpbmVkXG5cdH1cblxuXHRzdHJlYW0uV3JpdGFibGUucHJvdG90eXBlLmVuZC5jYWxsKHNlbGYsIGRhdGEsIGVuY29kaW5nLCBjYilcbn1cblxuQ2xpZW50UmVxdWVzdC5wcm90b3R5cGUuZmx1c2hIZWFkZXJzID0gZnVuY3Rpb24gKCkge31cbkNsaWVudFJlcXVlc3QucHJvdG90eXBlLnNldFRpbWVvdXQgPSBmdW5jdGlvbiAoKSB7fVxuQ2xpZW50UmVxdWVzdC5wcm90b3R5cGUuc2V0Tm9EZWxheSA9IGZ1bmN0aW9uICgpIHt9XG5DbGllbnRSZXF1ZXN0LnByb3RvdHlwZS5zZXRTb2NrZXRLZWVwQWxpdmUgPSBmdW5jdGlvbiAoKSB7fVxuXG4vLyBUYWtlbiBmcm9tIGh0dHA6Ly93d3cudzMub3JnL1RSL1hNTEh0dHBSZXF1ZXN0LyN0aGUtc2V0cmVxdWVzdGhlYWRlciUyOCUyOS1tZXRob2RcbnZhciB1bnNhZmVIZWFkZXJzID0gW1xuXHQnYWNjZXB0LWNoYXJzZXQnLFxuXHQnYWNjZXB0LWVuY29kaW5nJyxcblx0J2FjY2Vzcy1jb250cm9sLXJlcXVlc3QtaGVhZGVycycsXG5cdCdhY2Nlc3MtY29udHJvbC1yZXF1ZXN0LW1ldGhvZCcsXG5cdCdjb25uZWN0aW9uJyxcblx0J2NvbnRlbnQtbGVuZ3RoJyxcblx0J2Nvb2tpZScsXG5cdCdjb29raWUyJyxcblx0J2RhdGUnLFxuXHQnZG50Jyxcblx0J2V4cGVjdCcsXG5cdCdob3N0Jyxcblx0J2tlZXAtYWxpdmUnLFxuXHQnb3JpZ2luJyxcblx0J3JlZmVyZXInLFxuXHQndGUnLFxuXHQndHJhaWxlcicsXG5cdCd0cmFuc2Zlci1lbmNvZGluZycsXG5cdCd1cGdyYWRlJyxcblx0J3VzZXItYWdlbnQnLFxuXHQndmlhJ1xuXVxuIiwidmFyIGNhcGFiaWxpdHkgPSByZXF1aXJlKCcuL2NhcGFiaWxpdHknKVxudmFyIGluaGVyaXRzID0gcmVxdWlyZSgnaW5oZXJpdHMnKVxudmFyIHN0cmVhbSA9IHJlcXVpcmUoJ3JlYWRhYmxlLXN0cmVhbScpXG5cbnZhciByU3RhdGVzID0gZXhwb3J0cy5yZWFkeVN0YXRlcyA9IHtcblx0VU5TRU5UOiAwLFxuXHRPUEVORUQ6IDEsXG5cdEhFQURFUlNfUkVDRUlWRUQ6IDIsXG5cdExPQURJTkc6IDMsXG5cdERPTkU6IDRcbn1cblxudmFyIEluY29taW5nTWVzc2FnZSA9IGV4cG9ydHMuSW5jb21pbmdNZXNzYWdlID0gZnVuY3Rpb24gKHhociwgcmVzcG9uc2UsIG1vZGUpIHtcblx0dmFyIHNlbGYgPSB0aGlzXG5cdHN0cmVhbS5SZWFkYWJsZS5jYWxsKHNlbGYpXG5cblx0c2VsZi5fbW9kZSA9IG1vZGVcblx0c2VsZi5oZWFkZXJzID0ge31cblx0c2VsZi5yYXdIZWFkZXJzID0gW11cblx0c2VsZi50cmFpbGVycyA9IHt9XG5cdHNlbGYucmF3VHJhaWxlcnMgPSBbXVxuXG5cdC8vIEZha2UgdGhlICdjbG9zZScgZXZlbnQsIGJ1dCBvbmx5IG9uY2UgJ2VuZCcgZmlyZXNcblx0c2VsZi5vbignZW5kJywgZnVuY3Rpb24gKCkge1xuXHRcdC8vIFRoZSBuZXh0VGljayBpcyBuZWNlc3NhcnkgdG8gcHJldmVudCB0aGUgJ3JlcXVlc3QnIG1vZHVsZSBmcm9tIGNhdXNpbmcgYW4gaW5maW5pdGUgbG9vcFxuXHRcdHByb2Nlc3MubmV4dFRpY2soZnVuY3Rpb24gKCkge1xuXHRcdFx0c2VsZi5lbWl0KCdjbG9zZScpXG5cdFx0fSlcblx0fSlcblxuXHRpZiAobW9kZSA9PT0gJ2ZldGNoJykge1xuXHRcdHNlbGYuX2ZldGNoUmVzcG9uc2UgPSByZXNwb25zZVxuXG5cdFx0c2VsZi51cmwgPSByZXNwb25zZS51cmxcblx0XHRzZWxmLnN0YXR1c0NvZGUgPSByZXNwb25zZS5zdGF0dXNcblx0XHRzZWxmLnN0YXR1c01lc3NhZ2UgPSByZXNwb25zZS5zdGF0dXNUZXh0XG5cdFx0XG5cdFx0cmVzcG9uc2UuaGVhZGVycy5mb3JFYWNoKGZ1bmN0aW9uKGhlYWRlciwga2V5KXtcblx0XHRcdHNlbGYuaGVhZGVyc1trZXkudG9Mb3dlckNhc2UoKV0gPSBoZWFkZXJcblx0XHRcdHNlbGYucmF3SGVhZGVycy5wdXNoKGtleSwgaGVhZGVyKVxuXHRcdH0pXG5cblxuXHRcdC8vIFRPRE86IHRoaXMgZG9lc24ndCByZXNwZWN0IGJhY2twcmVzc3VyZS4gT25jZSBXcml0YWJsZVN0cmVhbSBpcyBhdmFpbGFibGUsIHRoaXMgY2FuIGJlIGZpeGVkXG5cdFx0dmFyIHJlYWRlciA9IHJlc3BvbnNlLmJvZHkuZ2V0UmVhZGVyKClcblx0XHRmdW5jdGlvbiByZWFkICgpIHtcblx0XHRcdHJlYWRlci5yZWFkKCkudGhlbihmdW5jdGlvbiAocmVzdWx0KSB7XG5cdFx0XHRcdGlmIChzZWxmLl9kZXN0cm95ZWQpXG5cdFx0XHRcdFx0cmV0dXJuXG5cdFx0XHRcdGlmIChyZXN1bHQuZG9uZSkge1xuXHRcdFx0XHRcdHNlbGYucHVzaChudWxsKVxuXHRcdFx0XHRcdHJldHVyblxuXHRcdFx0XHR9XG5cdFx0XHRcdHNlbGYucHVzaChuZXcgQnVmZmVyKHJlc3VsdC52YWx1ZSkpXG5cdFx0XHRcdHJlYWQoKVxuXHRcdFx0fSkuY2F0Y2goZnVuY3Rpb24oZXJyKSB7XG5cdFx0XHRcdHNlbGYuZW1pdCgnZXJyb3InLCBlcnIpXG5cdFx0XHR9KVxuXHRcdH1cblx0XHRyZWFkKClcblxuXHR9IGVsc2Uge1xuXHRcdHNlbGYuX3hociA9IHhoclxuXHRcdHNlbGYuX3BvcyA9IDBcblxuXHRcdHNlbGYudXJsID0geGhyLnJlc3BvbnNlVVJMXG5cdFx0c2VsZi5zdGF0dXNDb2RlID0geGhyLnN0YXR1c1xuXHRcdHNlbGYuc3RhdHVzTWVzc2FnZSA9IHhoci5zdGF0dXNUZXh0XG5cdFx0dmFyIGhlYWRlcnMgPSB4aHIuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzKCkuc3BsaXQoL1xccj9cXG4vKVxuXHRcdGhlYWRlcnMuZm9yRWFjaChmdW5jdGlvbiAoaGVhZGVyKSB7XG5cdFx0XHR2YXIgbWF0Y2hlcyA9IGhlYWRlci5tYXRjaCgvXihbXjpdKyk6XFxzKiguKikvKVxuXHRcdFx0aWYgKG1hdGNoZXMpIHtcblx0XHRcdFx0dmFyIGtleSA9IG1hdGNoZXNbMV0udG9Mb3dlckNhc2UoKVxuXHRcdFx0XHRpZiAoa2V5ID09PSAnc2V0LWNvb2tpZScpIHtcblx0XHRcdFx0XHRpZiAoc2VsZi5oZWFkZXJzW2tleV0gPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdFx0c2VsZi5oZWFkZXJzW2tleV0gPSBbXVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRzZWxmLmhlYWRlcnNba2V5XS5wdXNoKG1hdGNoZXNbMl0pXG5cdFx0XHRcdH0gZWxzZSBpZiAoc2VsZi5oZWFkZXJzW2tleV0gIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdHNlbGYuaGVhZGVyc1trZXldICs9ICcsICcgKyBtYXRjaGVzWzJdXG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0c2VsZi5oZWFkZXJzW2tleV0gPSBtYXRjaGVzWzJdXG5cdFx0XHRcdH1cblx0XHRcdFx0c2VsZi5yYXdIZWFkZXJzLnB1c2gobWF0Y2hlc1sxXSwgbWF0Y2hlc1syXSlcblx0XHRcdH1cblx0XHR9KVxuXG5cdFx0c2VsZi5fY2hhcnNldCA9ICd4LXVzZXItZGVmaW5lZCdcblx0XHRpZiAoIWNhcGFiaWxpdHkub3ZlcnJpZGVNaW1lVHlwZSkge1xuXHRcdFx0dmFyIG1pbWVUeXBlID0gc2VsZi5yYXdIZWFkZXJzWydtaW1lLXR5cGUnXVxuXHRcdFx0aWYgKG1pbWVUeXBlKSB7XG5cdFx0XHRcdHZhciBjaGFyc2V0TWF0Y2ggPSBtaW1lVHlwZS5tYXRjaCgvO1xccypjaGFyc2V0PShbXjtdKSg7fCQpLylcblx0XHRcdFx0aWYgKGNoYXJzZXRNYXRjaCkge1xuXHRcdFx0XHRcdHNlbGYuX2NoYXJzZXQgPSBjaGFyc2V0TWF0Y2hbMV0udG9Mb3dlckNhc2UoKVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRpZiAoIXNlbGYuX2NoYXJzZXQpXG5cdFx0XHRcdHNlbGYuX2NoYXJzZXQgPSAndXRmLTgnIC8vIGJlc3QgZ3Vlc3Ncblx0XHR9XG5cdH1cbn1cblxuaW5oZXJpdHMoSW5jb21pbmdNZXNzYWdlLCBzdHJlYW0uUmVhZGFibGUpXG5cbkluY29taW5nTWVzc2FnZS5wcm90b3R5cGUuX3JlYWQgPSBmdW5jdGlvbiAoKSB7fVxuXG5JbmNvbWluZ01lc3NhZ2UucHJvdG90eXBlLl9vblhIUlByb2dyZXNzID0gZnVuY3Rpb24gKCkge1xuXHR2YXIgc2VsZiA9IHRoaXNcblxuXHR2YXIgeGhyID0gc2VsZi5feGhyXG5cblx0dmFyIHJlc3BvbnNlID0gbnVsbFxuXHRzd2l0Y2ggKHNlbGYuX21vZGUpIHtcblx0XHRjYXNlICd0ZXh0OnZiYXJyYXknOiAvLyBGb3IgSUU5XG5cdFx0XHRpZiAoeGhyLnJlYWR5U3RhdGUgIT09IHJTdGF0ZXMuRE9ORSlcblx0XHRcdFx0YnJlYWtcblx0XHRcdHRyeSB7XG5cdFx0XHRcdC8vIFRoaXMgZmFpbHMgaW4gSUU4XG5cdFx0XHRcdHJlc3BvbnNlID0gbmV3IGdsb2JhbC5WQkFycmF5KHhoci5yZXNwb25zZUJvZHkpLnRvQXJyYXkoKVxuXHRcdFx0fSBjYXRjaCAoZSkge31cblx0XHRcdGlmIChyZXNwb25zZSAhPT0gbnVsbCkge1xuXHRcdFx0XHRzZWxmLnB1c2gobmV3IEJ1ZmZlcihyZXNwb25zZSkpXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHR9XG5cdFx0XHQvLyBGYWxscyB0aHJvdWdoIGluIElFOFx0XG5cdFx0Y2FzZSAndGV4dCc6XG5cdFx0XHR0cnkgeyAvLyBUaGlzIHdpbGwgZmFpbCB3aGVuIHJlYWR5U3RhdGUgPSAzIGluIElFOS4gU3dpdGNoIG1vZGUgYW5kIHdhaXQgZm9yIHJlYWR5U3RhdGUgPSA0XG5cdFx0XHRcdHJlc3BvbnNlID0geGhyLnJlc3BvbnNlVGV4dFxuXHRcdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0XHRzZWxmLl9tb2RlID0gJ3RleHQ6dmJhcnJheSdcblx0XHRcdFx0YnJlYWtcblx0XHRcdH1cblx0XHRcdGlmIChyZXNwb25zZS5sZW5ndGggPiBzZWxmLl9wb3MpIHtcblx0XHRcdFx0dmFyIG5ld0RhdGEgPSByZXNwb25zZS5zdWJzdHIoc2VsZi5fcG9zKVxuXHRcdFx0XHRpZiAoc2VsZi5fY2hhcnNldCA9PT0gJ3gtdXNlci1kZWZpbmVkJykge1xuXHRcdFx0XHRcdHZhciBidWZmZXIgPSBuZXcgQnVmZmVyKG5ld0RhdGEubGVuZ3RoKVxuXHRcdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgbmV3RGF0YS5sZW5ndGg7IGkrKylcblx0XHRcdFx0XHRcdGJ1ZmZlcltpXSA9IG5ld0RhdGEuY2hhckNvZGVBdChpKSAmIDB4ZmZcblxuXHRcdFx0XHRcdHNlbGYucHVzaChidWZmZXIpXG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0c2VsZi5wdXNoKG5ld0RhdGEsIHNlbGYuX2NoYXJzZXQpXG5cdFx0XHRcdH1cblx0XHRcdFx0c2VsZi5fcG9zID0gcmVzcG9uc2UubGVuZ3RoXG5cdFx0XHR9XG5cdFx0XHRicmVha1xuXHRcdGNhc2UgJ2FycmF5YnVmZmVyJzpcblx0XHRcdGlmICh4aHIucmVhZHlTdGF0ZSAhPT0gclN0YXRlcy5ET05FIHx8ICF4aHIucmVzcG9uc2UpXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHRyZXNwb25zZSA9IHhoci5yZXNwb25zZVxuXHRcdFx0c2VsZi5wdXNoKG5ldyBCdWZmZXIobmV3IFVpbnQ4QXJyYXkocmVzcG9uc2UpKSlcblx0XHRcdGJyZWFrXG5cdFx0Y2FzZSAnbW96LWNodW5rZWQtYXJyYXlidWZmZXInOiAvLyB0YWtlIHdob2xlXG5cdFx0XHRyZXNwb25zZSA9IHhoci5yZXNwb25zZVxuXHRcdFx0aWYgKHhoci5yZWFkeVN0YXRlICE9PSByU3RhdGVzLkxPQURJTkcgfHwgIXJlc3BvbnNlKVxuXHRcdFx0XHRicmVha1xuXHRcdFx0c2VsZi5wdXNoKG5ldyBCdWZmZXIobmV3IFVpbnQ4QXJyYXkocmVzcG9uc2UpKSlcblx0XHRcdGJyZWFrXG5cdFx0Y2FzZSAnbXMtc3RyZWFtJzpcblx0XHRcdHJlc3BvbnNlID0geGhyLnJlc3BvbnNlXG5cdFx0XHRpZiAoeGhyLnJlYWR5U3RhdGUgIT09IHJTdGF0ZXMuTE9BRElORylcblx0XHRcdFx0YnJlYWtcblx0XHRcdHZhciByZWFkZXIgPSBuZXcgZ2xvYmFsLk1TU3RyZWFtUmVhZGVyKClcblx0XHRcdHJlYWRlci5vbnByb2dyZXNzID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRpZiAocmVhZGVyLnJlc3VsdC5ieXRlTGVuZ3RoID4gc2VsZi5fcG9zKSB7XG5cdFx0XHRcdFx0c2VsZi5wdXNoKG5ldyBCdWZmZXIobmV3IFVpbnQ4QXJyYXkocmVhZGVyLnJlc3VsdC5zbGljZShzZWxmLl9wb3MpKSkpXG5cdFx0XHRcdFx0c2VsZi5fcG9zID0gcmVhZGVyLnJlc3VsdC5ieXRlTGVuZ3RoXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHJlYWRlci5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdHNlbGYucHVzaChudWxsKVxuXHRcdFx0fVxuXHRcdFx0Ly8gcmVhZGVyLm9uZXJyb3IgPSA/Pz8gLy8gVE9ETzogdGhpc1xuXHRcdFx0cmVhZGVyLnJlYWRBc0FycmF5QnVmZmVyKHJlc3BvbnNlKVxuXHRcdFx0YnJlYWtcblx0fVxuXG5cdC8vIFRoZSBtcy1zdHJlYW0gY2FzZSBoYW5kbGVzIGVuZCBzZXBhcmF0ZWx5IGluIHJlYWRlci5vbmxvYWQoKVxuXHRpZiAoc2VsZi5feGhyLnJlYWR5U3RhdGUgPT09IHJTdGF0ZXMuRE9ORSAmJiBzZWxmLl9tb2RlICE9PSAnbXMtc3RyZWFtJykge1xuXHRcdHNlbGYucHVzaChudWxsKVxuXHR9XG59XG4iLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxudmFyIEJ1ZmZlciA9IHJlcXVpcmUoJ2J1ZmZlcicpLkJ1ZmZlcjtcblxudmFyIGlzQnVmZmVyRW5jb2RpbmcgPSBCdWZmZXIuaXNFbmNvZGluZ1xuICB8fCBmdW5jdGlvbihlbmNvZGluZykge1xuICAgICAgIHN3aXRjaCAoZW5jb2RpbmcgJiYgZW5jb2RpbmcudG9Mb3dlckNhc2UoKSkge1xuICAgICAgICAgY2FzZSAnaGV4JzogY2FzZSAndXRmOCc6IGNhc2UgJ3V0Zi04JzogY2FzZSAnYXNjaWknOiBjYXNlICdiaW5hcnknOiBjYXNlICdiYXNlNjQnOiBjYXNlICd1Y3MyJzogY2FzZSAndWNzLTInOiBjYXNlICd1dGYxNmxlJzogY2FzZSAndXRmLTE2bGUnOiBjYXNlICdyYXcnOiByZXR1cm4gdHJ1ZTtcbiAgICAgICAgIGRlZmF1bHQ6IHJldHVybiBmYWxzZTtcbiAgICAgICB9XG4gICAgIH1cblxuXG5mdW5jdGlvbiBhc3NlcnRFbmNvZGluZyhlbmNvZGluZykge1xuICBpZiAoZW5jb2RpbmcgJiYgIWlzQnVmZmVyRW5jb2RpbmcoZW5jb2RpbmcpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIGVuY29kaW5nOiAnICsgZW5jb2RpbmcpO1xuICB9XG59XG5cbi8vIFN0cmluZ0RlY29kZXIgcHJvdmlkZXMgYW4gaW50ZXJmYWNlIGZvciBlZmZpY2llbnRseSBzcGxpdHRpbmcgYSBzZXJpZXMgb2Zcbi8vIGJ1ZmZlcnMgaW50byBhIHNlcmllcyBvZiBKUyBzdHJpbmdzIHdpdGhvdXQgYnJlYWtpbmcgYXBhcnQgbXVsdGktYnl0ZVxuLy8gY2hhcmFjdGVycy4gQ0VTVS04IGlzIGhhbmRsZWQgYXMgcGFydCBvZiB0aGUgVVRGLTggZW5jb2RpbmcuXG4vL1xuLy8gQFRPRE8gSGFuZGxpbmcgYWxsIGVuY29kaW5ncyBpbnNpZGUgYSBzaW5nbGUgb2JqZWN0IG1ha2VzIGl0IHZlcnkgZGlmZmljdWx0XG4vLyB0byByZWFzb24gYWJvdXQgdGhpcyBjb2RlLCBzbyBpdCBzaG91bGQgYmUgc3BsaXQgdXAgaW4gdGhlIGZ1dHVyZS5cbi8vIEBUT0RPIFRoZXJlIHNob3VsZCBiZSBhIHV0Zjgtc3RyaWN0IGVuY29kaW5nIHRoYXQgcmVqZWN0cyBpbnZhbGlkIFVURi04IGNvZGVcbi8vIHBvaW50cyBhcyB1c2VkIGJ5IENFU1UtOC5cbnZhciBTdHJpbmdEZWNvZGVyID0gZXhwb3J0cy5TdHJpbmdEZWNvZGVyID0gZnVuY3Rpb24oZW5jb2RpbmcpIHtcbiAgdGhpcy5lbmNvZGluZyA9IChlbmNvZGluZyB8fCAndXRmOCcpLnRvTG93ZXJDYXNlKCkucmVwbGFjZSgvWy1fXS8sICcnKTtcbiAgYXNzZXJ0RW5jb2RpbmcoZW5jb2RpbmcpO1xuICBzd2l0Y2ggKHRoaXMuZW5jb2RpbmcpIHtcbiAgICBjYXNlICd1dGY4JzpcbiAgICAgIC8vIENFU1UtOCByZXByZXNlbnRzIGVhY2ggb2YgU3Vycm9nYXRlIFBhaXIgYnkgMy1ieXRlc1xuICAgICAgdGhpcy5zdXJyb2dhdGVTaXplID0gMztcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3VjczInOlxuICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgICAgLy8gVVRGLTE2IHJlcHJlc2VudHMgZWFjaCBvZiBTdXJyb2dhdGUgUGFpciBieSAyLWJ5dGVzXG4gICAgICB0aGlzLnN1cnJvZ2F0ZVNpemUgPSAyO1xuICAgICAgdGhpcy5kZXRlY3RJbmNvbXBsZXRlQ2hhciA9IHV0ZjE2RGV0ZWN0SW5jb21wbGV0ZUNoYXI7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdiYXNlNjQnOlxuICAgICAgLy8gQmFzZS02NCBzdG9yZXMgMyBieXRlcyBpbiA0IGNoYXJzLCBhbmQgcGFkcyB0aGUgcmVtYWluZGVyLlxuICAgICAgdGhpcy5zdXJyb2dhdGVTaXplID0gMztcbiAgICAgIHRoaXMuZGV0ZWN0SW5jb21wbGV0ZUNoYXIgPSBiYXNlNjREZXRlY3RJbmNvbXBsZXRlQ2hhcjtcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aGlzLndyaXRlID0gcGFzc1Rocm91Z2hXcml0ZTtcbiAgICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIEVub3VnaCBzcGFjZSB0byBzdG9yZSBhbGwgYnl0ZXMgb2YgYSBzaW5nbGUgY2hhcmFjdGVyLiBVVEYtOCBuZWVkcyA0XG4gIC8vIGJ5dGVzLCBidXQgQ0VTVS04IG1heSByZXF1aXJlIHVwIHRvIDYgKDMgYnl0ZXMgcGVyIHN1cnJvZ2F0ZSkuXG4gIHRoaXMuY2hhckJ1ZmZlciA9IG5ldyBCdWZmZXIoNik7XG4gIC8vIE51bWJlciBvZiBieXRlcyByZWNlaXZlZCBmb3IgdGhlIGN1cnJlbnQgaW5jb21wbGV0ZSBtdWx0aS1ieXRlIGNoYXJhY3Rlci5cbiAgdGhpcy5jaGFyUmVjZWl2ZWQgPSAwO1xuICAvLyBOdW1iZXIgb2YgYnl0ZXMgZXhwZWN0ZWQgZm9yIHRoZSBjdXJyZW50IGluY29tcGxldGUgbXVsdGktYnl0ZSBjaGFyYWN0ZXIuXG4gIHRoaXMuY2hhckxlbmd0aCA9IDA7XG59O1xuXG5cbi8vIHdyaXRlIGRlY29kZXMgdGhlIGdpdmVuIGJ1ZmZlciBhbmQgcmV0dXJucyBpdCBhcyBKUyBzdHJpbmcgdGhhdCBpc1xuLy8gZ3VhcmFudGVlZCB0byBub3QgY29udGFpbiBhbnkgcGFydGlhbCBtdWx0aS1ieXRlIGNoYXJhY3RlcnMuIEFueSBwYXJ0aWFsXG4vLyBjaGFyYWN0ZXIgZm91bmQgYXQgdGhlIGVuZCBvZiB0aGUgYnVmZmVyIGlzIGJ1ZmZlcmVkIHVwLCBhbmQgd2lsbCBiZVxuLy8gcmV0dXJuZWQgd2hlbiBjYWxsaW5nIHdyaXRlIGFnYWluIHdpdGggdGhlIHJlbWFpbmluZyBieXRlcy5cbi8vXG4vLyBOb3RlOiBDb252ZXJ0aW5nIGEgQnVmZmVyIGNvbnRhaW5pbmcgYW4gb3JwaGFuIHN1cnJvZ2F0ZSB0byBhIFN0cmluZ1xuLy8gY3VycmVudGx5IHdvcmtzLCBidXQgY29udmVydGluZyBhIFN0cmluZyB0byBhIEJ1ZmZlciAodmlhIGBuZXcgQnVmZmVyYCwgb3Jcbi8vIEJ1ZmZlciN3cml0ZSkgd2lsbCByZXBsYWNlIGluY29tcGxldGUgc3Vycm9nYXRlcyB3aXRoIHRoZSB1bmljb2RlXG4vLyByZXBsYWNlbWVudCBjaGFyYWN0ZXIuIFNlZSBodHRwczovL2NvZGVyZXZpZXcuY2hyb21pdW0ub3JnLzEyMTE3MzAwOS8gLlxuU3RyaW5nRGVjb2Rlci5wcm90b3R5cGUud3JpdGUgPSBmdW5jdGlvbihidWZmZXIpIHtcbiAgdmFyIGNoYXJTdHIgPSAnJztcbiAgLy8gaWYgb3VyIGxhc3Qgd3JpdGUgZW5kZWQgd2l0aCBhbiBpbmNvbXBsZXRlIG11bHRpYnl0ZSBjaGFyYWN0ZXJcbiAgd2hpbGUgKHRoaXMuY2hhckxlbmd0aCkge1xuICAgIC8vIGRldGVybWluZSBob3cgbWFueSByZW1haW5pbmcgYnl0ZXMgdGhpcyBidWZmZXIgaGFzIHRvIG9mZmVyIGZvciB0aGlzIGNoYXJcbiAgICB2YXIgYXZhaWxhYmxlID0gKGJ1ZmZlci5sZW5ndGggPj0gdGhpcy5jaGFyTGVuZ3RoIC0gdGhpcy5jaGFyUmVjZWl2ZWQpID9cbiAgICAgICAgdGhpcy5jaGFyTGVuZ3RoIC0gdGhpcy5jaGFyUmVjZWl2ZWQgOlxuICAgICAgICBidWZmZXIubGVuZ3RoO1xuXG4gICAgLy8gYWRkIHRoZSBuZXcgYnl0ZXMgdG8gdGhlIGNoYXIgYnVmZmVyXG4gICAgYnVmZmVyLmNvcHkodGhpcy5jaGFyQnVmZmVyLCB0aGlzLmNoYXJSZWNlaXZlZCwgMCwgYXZhaWxhYmxlKTtcbiAgICB0aGlzLmNoYXJSZWNlaXZlZCArPSBhdmFpbGFibGU7XG5cbiAgICBpZiAodGhpcy5jaGFyUmVjZWl2ZWQgPCB0aGlzLmNoYXJMZW5ndGgpIHtcbiAgICAgIC8vIHN0aWxsIG5vdCBlbm91Z2ggY2hhcnMgaW4gdGhpcyBidWZmZXI/IHdhaXQgZm9yIG1vcmUgLi4uXG4gICAgICByZXR1cm4gJyc7XG4gICAgfVxuXG4gICAgLy8gcmVtb3ZlIGJ5dGVzIGJlbG9uZ2luZyB0byB0aGUgY3VycmVudCBjaGFyYWN0ZXIgZnJvbSB0aGUgYnVmZmVyXG4gICAgYnVmZmVyID0gYnVmZmVyLnNsaWNlKGF2YWlsYWJsZSwgYnVmZmVyLmxlbmd0aCk7XG5cbiAgICAvLyBnZXQgdGhlIGNoYXJhY3RlciB0aGF0IHdhcyBzcGxpdFxuICAgIGNoYXJTdHIgPSB0aGlzLmNoYXJCdWZmZXIuc2xpY2UoMCwgdGhpcy5jaGFyTGVuZ3RoKS50b1N0cmluZyh0aGlzLmVuY29kaW5nKTtcblxuICAgIC8vIENFU1UtODogbGVhZCBzdXJyb2dhdGUgKEQ4MDAtREJGRikgaXMgYWxzbyB0aGUgaW5jb21wbGV0ZSBjaGFyYWN0ZXJcbiAgICB2YXIgY2hhckNvZGUgPSBjaGFyU3RyLmNoYXJDb2RlQXQoY2hhclN0ci5sZW5ndGggLSAxKTtcbiAgICBpZiAoY2hhckNvZGUgPj0gMHhEODAwICYmIGNoYXJDb2RlIDw9IDB4REJGRikge1xuICAgICAgdGhpcy5jaGFyTGVuZ3RoICs9IHRoaXMuc3Vycm9nYXRlU2l6ZTtcbiAgICAgIGNoYXJTdHIgPSAnJztcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgICB0aGlzLmNoYXJSZWNlaXZlZCA9IHRoaXMuY2hhckxlbmd0aCA9IDA7XG5cbiAgICAvLyBpZiB0aGVyZSBhcmUgbm8gbW9yZSBieXRlcyBpbiB0aGlzIGJ1ZmZlciwganVzdCBlbWl0IG91ciBjaGFyXG4gICAgaWYgKGJ1ZmZlci5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBjaGFyU3RyO1xuICAgIH1cbiAgICBicmVhaztcbiAgfVxuXG4gIC8vIGRldGVybWluZSBhbmQgc2V0IGNoYXJMZW5ndGggLyBjaGFyUmVjZWl2ZWRcbiAgdGhpcy5kZXRlY3RJbmNvbXBsZXRlQ2hhcihidWZmZXIpO1xuXG4gIHZhciBlbmQgPSBidWZmZXIubGVuZ3RoO1xuICBpZiAodGhpcy5jaGFyTGVuZ3RoKSB7XG4gICAgLy8gYnVmZmVyIHRoZSBpbmNvbXBsZXRlIGNoYXJhY3RlciBieXRlcyB3ZSBnb3RcbiAgICBidWZmZXIuY29weSh0aGlzLmNoYXJCdWZmZXIsIDAsIGJ1ZmZlci5sZW5ndGggLSB0aGlzLmNoYXJSZWNlaXZlZCwgZW5kKTtcbiAgICBlbmQgLT0gdGhpcy5jaGFyUmVjZWl2ZWQ7XG4gIH1cblxuICBjaGFyU3RyICs9IGJ1ZmZlci50b1N0cmluZyh0aGlzLmVuY29kaW5nLCAwLCBlbmQpO1xuXG4gIHZhciBlbmQgPSBjaGFyU3RyLmxlbmd0aCAtIDE7XG4gIHZhciBjaGFyQ29kZSA9IGNoYXJTdHIuY2hhckNvZGVBdChlbmQpO1xuICAvLyBDRVNVLTg6IGxlYWQgc3Vycm9nYXRlIChEODAwLURCRkYpIGlzIGFsc28gdGhlIGluY29tcGxldGUgY2hhcmFjdGVyXG4gIGlmIChjaGFyQ29kZSA+PSAweEQ4MDAgJiYgY2hhckNvZGUgPD0gMHhEQkZGKSB7XG4gICAgdmFyIHNpemUgPSB0aGlzLnN1cnJvZ2F0ZVNpemU7XG4gICAgdGhpcy5jaGFyTGVuZ3RoICs9IHNpemU7XG4gICAgdGhpcy5jaGFyUmVjZWl2ZWQgKz0gc2l6ZTtcbiAgICB0aGlzLmNoYXJCdWZmZXIuY29weSh0aGlzLmNoYXJCdWZmZXIsIHNpemUsIDAsIHNpemUpO1xuICAgIGJ1ZmZlci5jb3B5KHRoaXMuY2hhckJ1ZmZlciwgMCwgMCwgc2l6ZSk7XG4gICAgcmV0dXJuIGNoYXJTdHIuc3Vic3RyaW5nKDAsIGVuZCk7XG4gIH1cblxuICAvLyBvciBqdXN0IGVtaXQgdGhlIGNoYXJTdHJcbiAgcmV0dXJuIGNoYXJTdHI7XG59O1xuXG4vLyBkZXRlY3RJbmNvbXBsZXRlQ2hhciBkZXRlcm1pbmVzIGlmIHRoZXJlIGlzIGFuIGluY29tcGxldGUgVVRGLTggY2hhcmFjdGVyIGF0XG4vLyB0aGUgZW5kIG9mIHRoZSBnaXZlbiBidWZmZXIuIElmIHNvLCBpdCBzZXRzIHRoaXMuY2hhckxlbmd0aCB0byB0aGUgYnl0ZVxuLy8gbGVuZ3RoIHRoYXQgY2hhcmFjdGVyLCBhbmQgc2V0cyB0aGlzLmNoYXJSZWNlaXZlZCB0byB0aGUgbnVtYmVyIG9mIGJ5dGVzXG4vLyB0aGF0IGFyZSBhdmFpbGFibGUgZm9yIHRoaXMgY2hhcmFjdGVyLlxuU3RyaW5nRGVjb2Rlci5wcm90b3R5cGUuZGV0ZWN0SW5jb21wbGV0ZUNoYXIgPSBmdW5jdGlvbihidWZmZXIpIHtcbiAgLy8gZGV0ZXJtaW5lIGhvdyBtYW55IGJ5dGVzIHdlIGhhdmUgdG8gY2hlY2sgYXQgdGhlIGVuZCBvZiB0aGlzIGJ1ZmZlclxuICB2YXIgaSA9IChidWZmZXIubGVuZ3RoID49IDMpID8gMyA6IGJ1ZmZlci5sZW5ndGg7XG5cbiAgLy8gRmlndXJlIG91dCBpZiBvbmUgb2YgdGhlIGxhc3QgaSBieXRlcyBvZiBvdXIgYnVmZmVyIGFubm91bmNlcyBhblxuICAvLyBpbmNvbXBsZXRlIGNoYXIuXG4gIGZvciAoOyBpID4gMDsgaS0tKSB7XG4gICAgdmFyIGMgPSBidWZmZXJbYnVmZmVyLmxlbmd0aCAtIGldO1xuXG4gICAgLy8gU2VlIGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvVVRGLTgjRGVzY3JpcHRpb25cblxuICAgIC8vIDExMFhYWFhYXG4gICAgaWYgKGkgPT0gMSAmJiBjID4+IDUgPT0gMHgwNikge1xuICAgICAgdGhpcy5jaGFyTGVuZ3RoID0gMjtcbiAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIC8vIDExMTBYWFhYXG4gICAgaWYgKGkgPD0gMiAmJiBjID4+IDQgPT0gMHgwRSkge1xuICAgICAgdGhpcy5jaGFyTGVuZ3RoID0gMztcbiAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIC8vIDExMTEwWFhYXG4gICAgaWYgKGkgPD0gMyAmJiBjID4+IDMgPT0gMHgxRSkge1xuICAgICAgdGhpcy5jaGFyTGVuZ3RoID0gNDtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuICB0aGlzLmNoYXJSZWNlaXZlZCA9IGk7XG59O1xuXG5TdHJpbmdEZWNvZGVyLnByb3RvdHlwZS5lbmQgPSBmdW5jdGlvbihidWZmZXIpIHtcbiAgdmFyIHJlcyA9ICcnO1xuICBpZiAoYnVmZmVyICYmIGJ1ZmZlci5sZW5ndGgpXG4gICAgcmVzID0gdGhpcy53cml0ZShidWZmZXIpO1xuXG4gIGlmICh0aGlzLmNoYXJSZWNlaXZlZCkge1xuICAgIHZhciBjciA9IHRoaXMuY2hhclJlY2VpdmVkO1xuICAgIHZhciBidWYgPSB0aGlzLmNoYXJCdWZmZXI7XG4gICAgdmFyIGVuYyA9IHRoaXMuZW5jb2Rpbmc7XG4gICAgcmVzICs9IGJ1Zi5zbGljZSgwLCBjcikudG9TdHJpbmcoZW5jKTtcbiAgfVxuXG4gIHJldHVybiByZXM7XG59O1xuXG5mdW5jdGlvbiBwYXNzVGhyb3VnaFdyaXRlKGJ1ZmZlcikge1xuICByZXR1cm4gYnVmZmVyLnRvU3RyaW5nKHRoaXMuZW5jb2RpbmcpO1xufVxuXG5mdW5jdGlvbiB1dGYxNkRldGVjdEluY29tcGxldGVDaGFyKGJ1ZmZlcikge1xuICB0aGlzLmNoYXJSZWNlaXZlZCA9IGJ1ZmZlci5sZW5ndGggJSAyO1xuICB0aGlzLmNoYXJMZW5ndGggPSB0aGlzLmNoYXJSZWNlaXZlZCA/IDIgOiAwO1xufVxuXG5mdW5jdGlvbiBiYXNlNjREZXRlY3RJbmNvbXBsZXRlQ2hhcihidWZmZXIpIHtcbiAgdGhpcy5jaGFyUmVjZWl2ZWQgPSBidWZmZXIubGVuZ3RoICUgMztcbiAgdGhpcy5jaGFyTGVuZ3RoID0gdGhpcy5jaGFyUmVjZWl2ZWQgPyAzIDogMDtcbn1cbiIsInZhciBCdWZmZXIgPSByZXF1aXJlKCdidWZmZXInKS5CdWZmZXJcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoYnVmKSB7XG5cdC8vIElmIHRoZSBidWZmZXIgaXMgYmFja2VkIGJ5IGEgVWludDhBcnJheSwgYSBmYXN0ZXIgdmVyc2lvbiB3aWxsIHdvcmtcblx0aWYgKGJ1ZiBpbnN0YW5jZW9mIFVpbnQ4QXJyYXkpIHtcblx0XHQvLyBJZiB0aGUgYnVmZmVyIGlzbid0IGEgc3ViYXJyYXksIHJldHVybiB0aGUgdW5kZXJseWluZyBBcnJheUJ1ZmZlclxuXHRcdGlmIChidWYuYnl0ZU9mZnNldCA9PT0gMCAmJiBidWYuYnl0ZUxlbmd0aCA9PT0gYnVmLmJ1ZmZlci5ieXRlTGVuZ3RoKSB7XG5cdFx0XHRyZXR1cm4gYnVmLmJ1ZmZlclxuXHRcdH0gZWxzZSBpZiAodHlwZW9mIGJ1Zi5idWZmZXIuc2xpY2UgPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdC8vIE90aGVyd2lzZSB3ZSBuZWVkIHRvIGdldCBhIHByb3BlciBjb3B5XG5cdFx0XHRyZXR1cm4gYnVmLmJ1ZmZlci5zbGljZShidWYuYnl0ZU9mZnNldCwgYnVmLmJ5dGVPZmZzZXQgKyBidWYuYnl0ZUxlbmd0aClcblx0XHR9XG5cdH1cblxuXHRpZiAoQnVmZmVyLmlzQnVmZmVyKGJ1ZikpIHtcblx0XHQvLyBUaGlzIGlzIHRoZSBzbG93IHZlcnNpb24gdGhhdCB3aWxsIHdvcmsgd2l0aCBhbnkgQnVmZmVyXG5cdFx0Ly8gaW1wbGVtZW50YXRpb24gKGV2ZW4gaW4gb2xkIGJyb3dzZXJzKVxuXHRcdHZhciBhcnJheUNvcHkgPSBuZXcgVWludDhBcnJheShidWYubGVuZ3RoKVxuXHRcdHZhciBsZW4gPSBidWYubGVuZ3RoXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuXHRcdFx0YXJyYXlDb3B5W2ldID0gYnVmW2ldXG5cdFx0fVxuXHRcdHJldHVybiBhcnJheUNvcHkuYnVmZmVyXG5cdH0gZWxzZSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKCdBcmd1bWVudCBtdXN0IGJlIGEgQnVmZmVyJylcblx0fVxufVxuIiwiLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIHB1bnljb2RlID0gcmVxdWlyZSgncHVueWNvZGUnKTtcbnZhciB1dGlsID0gcmVxdWlyZSgnLi91dGlsJyk7XG5cbmV4cG9ydHMucGFyc2UgPSB1cmxQYXJzZTtcbmV4cG9ydHMucmVzb2x2ZSA9IHVybFJlc29sdmU7XG5leHBvcnRzLnJlc29sdmVPYmplY3QgPSB1cmxSZXNvbHZlT2JqZWN0O1xuZXhwb3J0cy5mb3JtYXQgPSB1cmxGb3JtYXQ7XG5cbmV4cG9ydHMuVXJsID0gVXJsO1xuXG5mdW5jdGlvbiBVcmwoKSB7XG4gIHRoaXMucHJvdG9jb2wgPSBudWxsO1xuICB0aGlzLnNsYXNoZXMgPSBudWxsO1xuICB0aGlzLmF1dGggPSBudWxsO1xuICB0aGlzLmhvc3QgPSBudWxsO1xuICB0aGlzLnBvcnQgPSBudWxsO1xuICB0aGlzLmhvc3RuYW1lID0gbnVsbDtcbiAgdGhpcy5oYXNoID0gbnVsbDtcbiAgdGhpcy5zZWFyY2ggPSBudWxsO1xuICB0aGlzLnF1ZXJ5ID0gbnVsbDtcbiAgdGhpcy5wYXRobmFtZSA9IG51bGw7XG4gIHRoaXMucGF0aCA9IG51bGw7XG4gIHRoaXMuaHJlZiA9IG51bGw7XG59XG5cbi8vIFJlZmVyZW5jZTogUkZDIDM5ODYsIFJGQyAxODA4LCBSRkMgMjM5NlxuXG4vLyBkZWZpbmUgdGhlc2UgaGVyZSBzbyBhdCBsZWFzdCB0aGV5IG9ubHkgaGF2ZSB0byBiZVxuLy8gY29tcGlsZWQgb25jZSBvbiB0aGUgZmlyc3QgbW9kdWxlIGxvYWQuXG52YXIgcHJvdG9jb2xQYXR0ZXJuID0gL14oW2EtejAtOS4rLV0rOikvaSxcbiAgICBwb3J0UGF0dGVybiA9IC86WzAtOV0qJC8sXG5cbiAgICAvLyBTcGVjaWFsIGNhc2UgZm9yIGEgc2ltcGxlIHBhdGggVVJMXG4gICAgc2ltcGxlUGF0aFBhdHRlcm4gPSAvXihcXC9cXC8/KD8hXFwvKVteXFw/XFxzXSopKFxcP1teXFxzXSopPyQvLFxuXG4gICAgLy8gUkZDIDIzOTY6IGNoYXJhY3RlcnMgcmVzZXJ2ZWQgZm9yIGRlbGltaXRpbmcgVVJMcy5cbiAgICAvLyBXZSBhY3R1YWxseSBqdXN0IGF1dG8tZXNjYXBlIHRoZXNlLlxuICAgIGRlbGltcyA9IFsnPCcsICc+JywgJ1wiJywgJ2AnLCAnICcsICdcXHInLCAnXFxuJywgJ1xcdCddLFxuXG4gICAgLy8gUkZDIDIzOTY6IGNoYXJhY3RlcnMgbm90IGFsbG93ZWQgZm9yIHZhcmlvdXMgcmVhc29ucy5cbiAgICB1bndpc2UgPSBbJ3snLCAnfScsICd8JywgJ1xcXFwnLCAnXicsICdgJ10uY29uY2F0KGRlbGltcyksXG5cbiAgICAvLyBBbGxvd2VkIGJ5IFJGQ3MsIGJ1dCBjYXVzZSBvZiBYU1MgYXR0YWNrcy4gIEFsd2F5cyBlc2NhcGUgdGhlc2UuXG4gICAgYXV0b0VzY2FwZSA9IFsnXFwnJ10uY29uY2F0KHVud2lzZSksXG4gICAgLy8gQ2hhcmFjdGVycyB0aGF0IGFyZSBuZXZlciBldmVyIGFsbG93ZWQgaW4gYSBob3N0bmFtZS5cbiAgICAvLyBOb3RlIHRoYXQgYW55IGludmFsaWQgY2hhcnMgYXJlIGFsc28gaGFuZGxlZCwgYnV0IHRoZXNlXG4gICAgLy8gYXJlIHRoZSBvbmVzIHRoYXQgYXJlICpleHBlY3RlZCogdG8gYmUgc2Vlbiwgc28gd2UgZmFzdC1wYXRoXG4gICAgLy8gdGhlbS5cbiAgICBub25Ib3N0Q2hhcnMgPSBbJyUnLCAnLycsICc/JywgJzsnLCAnIyddLmNvbmNhdChhdXRvRXNjYXBlKSxcbiAgICBob3N0RW5kaW5nQ2hhcnMgPSBbJy8nLCAnPycsICcjJ10sXG4gICAgaG9zdG5hbWVNYXhMZW4gPSAyNTUsXG4gICAgaG9zdG5hbWVQYXJ0UGF0dGVybiA9IC9eWythLXowLTlBLVpfLV17MCw2M30kLyxcbiAgICBob3N0bmFtZVBhcnRTdGFydCA9IC9eKFsrYS16MC05QS1aXy1dezAsNjN9KSguKikkLyxcbiAgICAvLyBwcm90b2NvbHMgdGhhdCBjYW4gYWxsb3cgXCJ1bnNhZmVcIiBhbmQgXCJ1bndpc2VcIiBjaGFycy5cbiAgICB1bnNhZmVQcm90b2NvbCA9IHtcbiAgICAgICdqYXZhc2NyaXB0JzogdHJ1ZSxcbiAgICAgICdqYXZhc2NyaXB0Oic6IHRydWVcbiAgICB9LFxuICAgIC8vIHByb3RvY29scyB0aGF0IG5ldmVyIGhhdmUgYSBob3N0bmFtZS5cbiAgICBob3N0bGVzc1Byb3RvY29sID0ge1xuICAgICAgJ2phdmFzY3JpcHQnOiB0cnVlLFxuICAgICAgJ2phdmFzY3JpcHQ6JzogdHJ1ZVxuICAgIH0sXG4gICAgLy8gcHJvdG9jb2xzIHRoYXQgYWx3YXlzIGNvbnRhaW4gYSAvLyBiaXQuXG4gICAgc2xhc2hlZFByb3RvY29sID0ge1xuICAgICAgJ2h0dHAnOiB0cnVlLFxuICAgICAgJ2h0dHBzJzogdHJ1ZSxcbiAgICAgICdmdHAnOiB0cnVlLFxuICAgICAgJ2dvcGhlcic6IHRydWUsXG4gICAgICAnZmlsZSc6IHRydWUsXG4gICAgICAnaHR0cDonOiB0cnVlLFxuICAgICAgJ2h0dHBzOic6IHRydWUsXG4gICAgICAnZnRwOic6IHRydWUsXG4gICAgICAnZ29waGVyOic6IHRydWUsXG4gICAgICAnZmlsZTonOiB0cnVlXG4gICAgfSxcbiAgICBxdWVyeXN0cmluZyA9IHJlcXVpcmUoJ3F1ZXJ5c3RyaW5nJyk7XG5cbmZ1bmN0aW9uIHVybFBhcnNlKHVybCwgcGFyc2VRdWVyeVN0cmluZywgc2xhc2hlc0Rlbm90ZUhvc3QpIHtcbiAgaWYgKHVybCAmJiB1dGlsLmlzT2JqZWN0KHVybCkgJiYgdXJsIGluc3RhbmNlb2YgVXJsKSByZXR1cm4gdXJsO1xuXG4gIHZhciB1ID0gbmV3IFVybDtcbiAgdS5wYXJzZSh1cmwsIHBhcnNlUXVlcnlTdHJpbmcsIHNsYXNoZXNEZW5vdGVIb3N0KTtcbiAgcmV0dXJuIHU7XG59XG5cblVybC5wcm90b3R5cGUucGFyc2UgPSBmdW5jdGlvbih1cmwsIHBhcnNlUXVlcnlTdHJpbmcsIHNsYXNoZXNEZW5vdGVIb3N0KSB7XG4gIGlmICghdXRpbC5pc1N0cmluZyh1cmwpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlBhcmFtZXRlciAndXJsJyBtdXN0IGJlIGEgc3RyaW5nLCBub3QgXCIgKyB0eXBlb2YgdXJsKTtcbiAgfVxuXG4gIC8vIENvcHkgY2hyb21lLCBJRSwgb3BlcmEgYmFja3NsYXNoLWhhbmRsaW5nIGJlaGF2aW9yLlxuICAvLyBCYWNrIHNsYXNoZXMgYmVmb3JlIHRoZSBxdWVyeSBzdHJpbmcgZ2V0IGNvbnZlcnRlZCB0byBmb3J3YXJkIHNsYXNoZXNcbiAgLy8gU2VlOiBodHRwczovL2NvZGUuZ29vZ2xlLmNvbS9wL2Nocm9taXVtL2lzc3Vlcy9kZXRhaWw/aWQ9MjU5MTZcbiAgdmFyIHF1ZXJ5SW5kZXggPSB1cmwuaW5kZXhPZignPycpLFxuICAgICAgc3BsaXR0ZXIgPVxuICAgICAgICAgIChxdWVyeUluZGV4ICE9PSAtMSAmJiBxdWVyeUluZGV4IDwgdXJsLmluZGV4T2YoJyMnKSkgPyAnPycgOiAnIycsXG4gICAgICB1U3BsaXQgPSB1cmwuc3BsaXQoc3BsaXR0ZXIpLFxuICAgICAgc2xhc2hSZWdleCA9IC9cXFxcL2c7XG4gIHVTcGxpdFswXSA9IHVTcGxpdFswXS5yZXBsYWNlKHNsYXNoUmVnZXgsICcvJyk7XG4gIHVybCA9IHVTcGxpdC5qb2luKHNwbGl0dGVyKTtcblxuICB2YXIgcmVzdCA9IHVybDtcblxuICAvLyB0cmltIGJlZm9yZSBwcm9jZWVkaW5nLlxuICAvLyBUaGlzIGlzIHRvIHN1cHBvcnQgcGFyc2Ugc3R1ZmYgbGlrZSBcIiAgaHR0cDovL2Zvby5jb20gIFxcblwiXG4gIHJlc3QgPSByZXN0LnRyaW0oKTtcblxuICBpZiAoIXNsYXNoZXNEZW5vdGVIb3N0ICYmIHVybC5zcGxpdCgnIycpLmxlbmd0aCA9PT0gMSkge1xuICAgIC8vIFRyeSBmYXN0IHBhdGggcmVnZXhwXG4gICAgdmFyIHNpbXBsZVBhdGggPSBzaW1wbGVQYXRoUGF0dGVybi5leGVjKHJlc3QpO1xuICAgIGlmIChzaW1wbGVQYXRoKSB7XG4gICAgICB0aGlzLnBhdGggPSByZXN0O1xuICAgICAgdGhpcy5ocmVmID0gcmVzdDtcbiAgICAgIHRoaXMucGF0aG5hbWUgPSBzaW1wbGVQYXRoWzFdO1xuICAgICAgaWYgKHNpbXBsZVBhdGhbMl0pIHtcbiAgICAgICAgdGhpcy5zZWFyY2ggPSBzaW1wbGVQYXRoWzJdO1xuICAgICAgICBpZiAocGFyc2VRdWVyeVN0cmluZykge1xuICAgICAgICAgIHRoaXMucXVlcnkgPSBxdWVyeXN0cmluZy5wYXJzZSh0aGlzLnNlYXJjaC5zdWJzdHIoMSkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMucXVlcnkgPSB0aGlzLnNlYXJjaC5zdWJzdHIoMSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAocGFyc2VRdWVyeVN0cmluZykge1xuICAgICAgICB0aGlzLnNlYXJjaCA9ICcnO1xuICAgICAgICB0aGlzLnF1ZXJ5ID0ge307XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gIH1cblxuICB2YXIgcHJvdG8gPSBwcm90b2NvbFBhdHRlcm4uZXhlYyhyZXN0KTtcbiAgaWYgKHByb3RvKSB7XG4gICAgcHJvdG8gPSBwcm90b1swXTtcbiAgICB2YXIgbG93ZXJQcm90byA9IHByb3RvLnRvTG93ZXJDYXNlKCk7XG4gICAgdGhpcy5wcm90b2NvbCA9IGxvd2VyUHJvdG87XG4gICAgcmVzdCA9IHJlc3Quc3Vic3RyKHByb3RvLmxlbmd0aCk7XG4gIH1cblxuICAvLyBmaWd1cmUgb3V0IGlmIGl0J3MgZ290IGEgaG9zdFxuICAvLyB1c2VyQHNlcnZlciBpcyAqYWx3YXlzKiBpbnRlcnByZXRlZCBhcyBhIGhvc3RuYW1lLCBhbmQgdXJsXG4gIC8vIHJlc29sdXRpb24gd2lsbCB0cmVhdCAvL2Zvby9iYXIgYXMgaG9zdD1mb28scGF0aD1iYXIgYmVjYXVzZSB0aGF0J3NcbiAgLy8gaG93IHRoZSBicm93c2VyIHJlc29sdmVzIHJlbGF0aXZlIFVSTHMuXG4gIGlmIChzbGFzaGVzRGVub3RlSG9zdCB8fCBwcm90byB8fCByZXN0Lm1hdGNoKC9eXFwvXFwvW15AXFwvXStAW15AXFwvXSsvKSkge1xuICAgIHZhciBzbGFzaGVzID0gcmVzdC5zdWJzdHIoMCwgMikgPT09ICcvLyc7XG4gICAgaWYgKHNsYXNoZXMgJiYgIShwcm90byAmJiBob3N0bGVzc1Byb3RvY29sW3Byb3RvXSkpIHtcbiAgICAgIHJlc3QgPSByZXN0LnN1YnN0cigyKTtcbiAgICAgIHRoaXMuc2xhc2hlcyA9IHRydWU7XG4gICAgfVxuICB9XG5cbiAgaWYgKCFob3N0bGVzc1Byb3RvY29sW3Byb3RvXSAmJlxuICAgICAgKHNsYXNoZXMgfHwgKHByb3RvICYmICFzbGFzaGVkUHJvdG9jb2xbcHJvdG9dKSkpIHtcblxuICAgIC8vIHRoZXJlJ3MgYSBob3N0bmFtZS5cbiAgICAvLyB0aGUgZmlyc3QgaW5zdGFuY2Ugb2YgLywgPywgOywgb3IgIyBlbmRzIHRoZSBob3N0LlxuICAgIC8vXG4gICAgLy8gSWYgdGhlcmUgaXMgYW4gQCBpbiB0aGUgaG9zdG5hbWUsIHRoZW4gbm9uLWhvc3QgY2hhcnMgKmFyZSogYWxsb3dlZFxuICAgIC8vIHRvIHRoZSBsZWZ0IG9mIHRoZSBsYXN0IEAgc2lnbiwgdW5sZXNzIHNvbWUgaG9zdC1lbmRpbmcgY2hhcmFjdGVyXG4gICAgLy8gY29tZXMgKmJlZm9yZSogdGhlIEAtc2lnbi5cbiAgICAvLyBVUkxzIGFyZSBvYm5veGlvdXMuXG4gICAgLy9cbiAgICAvLyBleDpcbiAgICAvLyBodHRwOi8vYUBiQGMvID0+IHVzZXI6YUBiIGhvc3Q6Y1xuICAgIC8vIGh0dHA6Ly9hQGI/QGMgPT4gdXNlcjphIGhvc3Q6YyBwYXRoOi8/QGNcblxuICAgIC8vIHYwLjEyIFRPRE8oaXNhYWNzKTogVGhpcyBpcyBub3QgcXVpdGUgaG93IENocm9tZSBkb2VzIHRoaW5ncy5cbiAgICAvLyBSZXZpZXcgb3VyIHRlc3QgY2FzZSBhZ2FpbnN0IGJyb3dzZXJzIG1vcmUgY29tcHJlaGVuc2l2ZWx5LlxuXG4gICAgLy8gZmluZCB0aGUgZmlyc3QgaW5zdGFuY2Ugb2YgYW55IGhvc3RFbmRpbmdDaGFyc1xuICAgIHZhciBob3N0RW5kID0gLTE7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBob3N0RW5kaW5nQ2hhcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBoZWMgPSByZXN0LmluZGV4T2YoaG9zdEVuZGluZ0NoYXJzW2ldKTtcbiAgICAgIGlmIChoZWMgIT09IC0xICYmIChob3N0RW5kID09PSAtMSB8fCBoZWMgPCBob3N0RW5kKSlcbiAgICAgICAgaG9zdEVuZCA9IGhlYztcbiAgICB9XG5cbiAgICAvLyBhdCB0aGlzIHBvaW50LCBlaXRoZXIgd2UgaGF2ZSBhbiBleHBsaWNpdCBwb2ludCB3aGVyZSB0aGVcbiAgICAvLyBhdXRoIHBvcnRpb24gY2Fubm90IGdvIHBhc3QsIG9yIHRoZSBsYXN0IEAgY2hhciBpcyB0aGUgZGVjaWRlci5cbiAgICB2YXIgYXV0aCwgYXRTaWduO1xuICAgIGlmIChob3N0RW5kID09PSAtMSkge1xuICAgICAgLy8gYXRTaWduIGNhbiBiZSBhbnl3aGVyZS5cbiAgICAgIGF0U2lnbiA9IHJlc3QubGFzdEluZGV4T2YoJ0AnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gYXRTaWduIG11c3QgYmUgaW4gYXV0aCBwb3J0aW9uLlxuICAgICAgLy8gaHR0cDovL2FAYi9jQGQgPT4gaG9zdDpiIGF1dGg6YSBwYXRoOi9jQGRcbiAgICAgIGF0U2lnbiA9IHJlc3QubGFzdEluZGV4T2YoJ0AnLCBob3N0RW5kKTtcbiAgICB9XG5cbiAgICAvLyBOb3cgd2UgaGF2ZSBhIHBvcnRpb24gd2hpY2ggaXMgZGVmaW5pdGVseSB0aGUgYXV0aC5cbiAgICAvLyBQdWxsIHRoYXQgb2ZmLlxuICAgIGlmIChhdFNpZ24gIT09IC0xKSB7XG4gICAgICBhdXRoID0gcmVzdC5zbGljZSgwLCBhdFNpZ24pO1xuICAgICAgcmVzdCA9IHJlc3Quc2xpY2UoYXRTaWduICsgMSk7XG4gICAgICB0aGlzLmF1dGggPSBkZWNvZGVVUklDb21wb25lbnQoYXV0aCk7XG4gICAgfVxuXG4gICAgLy8gdGhlIGhvc3QgaXMgdGhlIHJlbWFpbmluZyB0byB0aGUgbGVmdCBvZiB0aGUgZmlyc3Qgbm9uLWhvc3QgY2hhclxuICAgIGhvc3RFbmQgPSAtMTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG5vbkhvc3RDaGFycy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGhlYyA9IHJlc3QuaW5kZXhPZihub25Ib3N0Q2hhcnNbaV0pO1xuICAgICAgaWYgKGhlYyAhPT0gLTEgJiYgKGhvc3RFbmQgPT09IC0xIHx8IGhlYyA8IGhvc3RFbmQpKVxuICAgICAgICBob3N0RW5kID0gaGVjO1xuICAgIH1cbiAgICAvLyBpZiB3ZSBzdGlsbCBoYXZlIG5vdCBoaXQgaXQsIHRoZW4gdGhlIGVudGlyZSB0aGluZyBpcyBhIGhvc3QuXG4gICAgaWYgKGhvc3RFbmQgPT09IC0xKVxuICAgICAgaG9zdEVuZCA9IHJlc3QubGVuZ3RoO1xuXG4gICAgdGhpcy5ob3N0ID0gcmVzdC5zbGljZSgwLCBob3N0RW5kKTtcbiAgICByZXN0ID0gcmVzdC5zbGljZShob3N0RW5kKTtcblxuICAgIC8vIHB1bGwgb3V0IHBvcnQuXG4gICAgdGhpcy5wYXJzZUhvc3QoKTtcblxuICAgIC8vIHdlJ3ZlIGluZGljYXRlZCB0aGF0IHRoZXJlIGlzIGEgaG9zdG5hbWUsXG4gICAgLy8gc28gZXZlbiBpZiBpdCdzIGVtcHR5LCBpdCBoYXMgdG8gYmUgcHJlc2VudC5cbiAgICB0aGlzLmhvc3RuYW1lID0gdGhpcy5ob3N0bmFtZSB8fCAnJztcblxuICAgIC8vIGlmIGhvc3RuYW1lIGJlZ2lucyB3aXRoIFsgYW5kIGVuZHMgd2l0aCBdXG4gICAgLy8gYXNzdW1lIHRoYXQgaXQncyBhbiBJUHY2IGFkZHJlc3MuXG4gICAgdmFyIGlwdjZIb3N0bmFtZSA9IHRoaXMuaG9zdG5hbWVbMF0gPT09ICdbJyAmJlxuICAgICAgICB0aGlzLmhvc3RuYW1lW3RoaXMuaG9zdG5hbWUubGVuZ3RoIC0gMV0gPT09ICddJztcblxuICAgIC8vIHZhbGlkYXRlIGEgbGl0dGxlLlxuICAgIGlmICghaXB2Nkhvc3RuYW1lKSB7XG4gICAgICB2YXIgaG9zdHBhcnRzID0gdGhpcy5ob3N0bmFtZS5zcGxpdCgvXFwuLyk7XG4gICAgICBmb3IgKHZhciBpID0gMCwgbCA9IGhvc3RwYXJ0cy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgdmFyIHBhcnQgPSBob3N0cGFydHNbaV07XG4gICAgICAgIGlmICghcGFydCkgY29udGludWU7XG4gICAgICAgIGlmICghcGFydC5tYXRjaChob3N0bmFtZVBhcnRQYXR0ZXJuKSkge1xuICAgICAgICAgIHZhciBuZXdwYXJ0ID0gJyc7XG4gICAgICAgICAgZm9yICh2YXIgaiA9IDAsIGsgPSBwYXJ0Lmxlbmd0aDsgaiA8IGs7IGorKykge1xuICAgICAgICAgICAgaWYgKHBhcnQuY2hhckNvZGVBdChqKSA+IDEyNykge1xuICAgICAgICAgICAgICAvLyB3ZSByZXBsYWNlIG5vbi1BU0NJSSBjaGFyIHdpdGggYSB0ZW1wb3JhcnkgcGxhY2Vob2xkZXJcbiAgICAgICAgICAgICAgLy8gd2UgbmVlZCB0aGlzIHRvIG1ha2Ugc3VyZSBzaXplIG9mIGhvc3RuYW1lIGlzIG5vdFxuICAgICAgICAgICAgICAvLyBicm9rZW4gYnkgcmVwbGFjaW5nIG5vbi1BU0NJSSBieSBub3RoaW5nXG4gICAgICAgICAgICAgIG5ld3BhcnQgKz0gJ3gnO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgbmV3cGFydCArPSBwYXJ0W2pdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICAvLyB3ZSB0ZXN0IGFnYWluIHdpdGggQVNDSUkgY2hhciBvbmx5XG4gICAgICAgICAgaWYgKCFuZXdwYXJ0Lm1hdGNoKGhvc3RuYW1lUGFydFBhdHRlcm4pKSB7XG4gICAgICAgICAgICB2YXIgdmFsaWRQYXJ0cyA9IGhvc3RwYXJ0cy5zbGljZSgwLCBpKTtcbiAgICAgICAgICAgIHZhciBub3RIb3N0ID0gaG9zdHBhcnRzLnNsaWNlKGkgKyAxKTtcbiAgICAgICAgICAgIHZhciBiaXQgPSBwYXJ0Lm1hdGNoKGhvc3RuYW1lUGFydFN0YXJ0KTtcbiAgICAgICAgICAgIGlmIChiaXQpIHtcbiAgICAgICAgICAgICAgdmFsaWRQYXJ0cy5wdXNoKGJpdFsxXSk7XG4gICAgICAgICAgICAgIG5vdEhvc3QudW5zaGlmdChiaXRbMl0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG5vdEhvc3QubGVuZ3RoKSB7XG4gICAgICAgICAgICAgIHJlc3QgPSAnLycgKyBub3RIb3N0LmpvaW4oJy4nKSArIHJlc3Q7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmhvc3RuYW1lID0gdmFsaWRQYXJ0cy5qb2luKCcuJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGhpcy5ob3N0bmFtZS5sZW5ndGggPiBob3N0bmFtZU1heExlbikge1xuICAgICAgdGhpcy5ob3N0bmFtZSA9ICcnO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBob3N0bmFtZXMgYXJlIGFsd2F5cyBsb3dlciBjYXNlLlxuICAgICAgdGhpcy5ob3N0bmFtZSA9IHRoaXMuaG9zdG5hbWUudG9Mb3dlckNhc2UoKTtcbiAgICB9XG5cbiAgICBpZiAoIWlwdjZIb3N0bmFtZSkge1xuICAgICAgLy8gSUROQSBTdXBwb3J0OiBSZXR1cm5zIGEgcHVueWNvZGVkIHJlcHJlc2VudGF0aW9uIG9mIFwiZG9tYWluXCIuXG4gICAgICAvLyBJdCBvbmx5IGNvbnZlcnRzIHBhcnRzIG9mIHRoZSBkb21haW4gbmFtZSB0aGF0XG4gICAgICAvLyBoYXZlIG5vbi1BU0NJSSBjaGFyYWN0ZXJzLCBpLmUuIGl0IGRvZXNuJ3QgbWF0dGVyIGlmXG4gICAgICAvLyB5b3UgY2FsbCBpdCB3aXRoIGEgZG9tYWluIHRoYXQgYWxyZWFkeSBpcyBBU0NJSS1vbmx5LlxuICAgICAgdGhpcy5ob3N0bmFtZSA9IHB1bnljb2RlLnRvQVNDSUkodGhpcy5ob3N0bmFtZSk7XG4gICAgfVxuXG4gICAgdmFyIHAgPSB0aGlzLnBvcnQgPyAnOicgKyB0aGlzLnBvcnQgOiAnJztcbiAgICB2YXIgaCA9IHRoaXMuaG9zdG5hbWUgfHwgJyc7XG4gICAgdGhpcy5ob3N0ID0gaCArIHA7XG4gICAgdGhpcy5ocmVmICs9IHRoaXMuaG9zdDtcblxuICAgIC8vIHN0cmlwIFsgYW5kIF0gZnJvbSB0aGUgaG9zdG5hbWVcbiAgICAvLyB0aGUgaG9zdCBmaWVsZCBzdGlsbCByZXRhaW5zIHRoZW0sIHRob3VnaFxuICAgIGlmIChpcHY2SG9zdG5hbWUpIHtcbiAgICAgIHRoaXMuaG9zdG5hbWUgPSB0aGlzLmhvc3RuYW1lLnN1YnN0cigxLCB0aGlzLmhvc3RuYW1lLmxlbmd0aCAtIDIpO1xuICAgICAgaWYgKHJlc3RbMF0gIT09ICcvJykge1xuICAgICAgICByZXN0ID0gJy8nICsgcmVzdDtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBub3cgcmVzdCBpcyBzZXQgdG8gdGhlIHBvc3QtaG9zdCBzdHVmZi5cbiAgLy8gY2hvcCBvZmYgYW55IGRlbGltIGNoYXJzLlxuICBpZiAoIXVuc2FmZVByb3RvY29sW2xvd2VyUHJvdG9dKSB7XG5cbiAgICAvLyBGaXJzdCwgbWFrZSAxMDAlIHN1cmUgdGhhdCBhbnkgXCJhdXRvRXNjYXBlXCIgY2hhcnMgZ2V0XG4gICAgLy8gZXNjYXBlZCwgZXZlbiBpZiBlbmNvZGVVUklDb21wb25lbnQgZG9lc24ndCB0aGluayB0aGV5XG4gICAgLy8gbmVlZCB0byBiZS5cbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IGF1dG9Fc2NhcGUubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICB2YXIgYWUgPSBhdXRvRXNjYXBlW2ldO1xuICAgICAgaWYgKHJlc3QuaW5kZXhPZihhZSkgPT09IC0xKVxuICAgICAgICBjb250aW51ZTtcbiAgICAgIHZhciBlc2MgPSBlbmNvZGVVUklDb21wb25lbnQoYWUpO1xuICAgICAgaWYgKGVzYyA9PT0gYWUpIHtcbiAgICAgICAgZXNjID0gZXNjYXBlKGFlKTtcbiAgICAgIH1cbiAgICAgIHJlc3QgPSByZXN0LnNwbGl0KGFlKS5qb2luKGVzYyk7XG4gICAgfVxuICB9XG5cblxuICAvLyBjaG9wIG9mZiBmcm9tIHRoZSB0YWlsIGZpcnN0LlxuICB2YXIgaGFzaCA9IHJlc3QuaW5kZXhPZignIycpO1xuICBpZiAoaGFzaCAhPT0gLTEpIHtcbiAgICAvLyBnb3QgYSBmcmFnbWVudCBzdHJpbmcuXG4gICAgdGhpcy5oYXNoID0gcmVzdC5zdWJzdHIoaGFzaCk7XG4gICAgcmVzdCA9IHJlc3Quc2xpY2UoMCwgaGFzaCk7XG4gIH1cbiAgdmFyIHFtID0gcmVzdC5pbmRleE9mKCc/Jyk7XG4gIGlmIChxbSAhPT0gLTEpIHtcbiAgICB0aGlzLnNlYXJjaCA9IHJlc3Quc3Vic3RyKHFtKTtcbiAgICB0aGlzLnF1ZXJ5ID0gcmVzdC5zdWJzdHIocW0gKyAxKTtcbiAgICBpZiAocGFyc2VRdWVyeVN0cmluZykge1xuICAgICAgdGhpcy5xdWVyeSA9IHF1ZXJ5c3RyaW5nLnBhcnNlKHRoaXMucXVlcnkpO1xuICAgIH1cbiAgICByZXN0ID0gcmVzdC5zbGljZSgwLCBxbSk7XG4gIH0gZWxzZSBpZiAocGFyc2VRdWVyeVN0cmluZykge1xuICAgIC8vIG5vIHF1ZXJ5IHN0cmluZywgYnV0IHBhcnNlUXVlcnlTdHJpbmcgc3RpbGwgcmVxdWVzdGVkXG4gICAgdGhpcy5zZWFyY2ggPSAnJztcbiAgICB0aGlzLnF1ZXJ5ID0ge307XG4gIH1cbiAgaWYgKHJlc3QpIHRoaXMucGF0aG5hbWUgPSByZXN0O1xuICBpZiAoc2xhc2hlZFByb3RvY29sW2xvd2VyUHJvdG9dICYmXG4gICAgICB0aGlzLmhvc3RuYW1lICYmICF0aGlzLnBhdGhuYW1lKSB7XG4gICAgdGhpcy5wYXRobmFtZSA9ICcvJztcbiAgfVxuXG4gIC8vdG8gc3VwcG9ydCBodHRwLnJlcXVlc3RcbiAgaWYgKHRoaXMucGF0aG5hbWUgfHwgdGhpcy5zZWFyY2gpIHtcbiAgICB2YXIgcCA9IHRoaXMucGF0aG5hbWUgfHwgJyc7XG4gICAgdmFyIHMgPSB0aGlzLnNlYXJjaCB8fCAnJztcbiAgICB0aGlzLnBhdGggPSBwICsgcztcbiAgfVxuXG4gIC8vIGZpbmFsbHksIHJlY29uc3RydWN0IHRoZSBocmVmIGJhc2VkIG9uIHdoYXQgaGFzIGJlZW4gdmFsaWRhdGVkLlxuICB0aGlzLmhyZWYgPSB0aGlzLmZvcm1hdCgpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8vIGZvcm1hdCBhIHBhcnNlZCBvYmplY3QgaW50byBhIHVybCBzdHJpbmdcbmZ1bmN0aW9uIHVybEZvcm1hdChvYmopIHtcbiAgLy8gZW5zdXJlIGl0J3MgYW4gb2JqZWN0LCBhbmQgbm90IGEgc3RyaW5nIHVybC5cbiAgLy8gSWYgaXQncyBhbiBvYmosIHRoaXMgaXMgYSBuby1vcC5cbiAgLy8gdGhpcyB3YXksIHlvdSBjYW4gY2FsbCB1cmxfZm9ybWF0KCkgb24gc3RyaW5nc1xuICAvLyB0byBjbGVhbiB1cCBwb3RlbnRpYWxseSB3b25reSB1cmxzLlxuICBpZiAodXRpbC5pc1N0cmluZyhvYmopKSBvYmogPSB1cmxQYXJzZShvYmopO1xuICBpZiAoIShvYmogaW5zdGFuY2VvZiBVcmwpKSByZXR1cm4gVXJsLnByb3RvdHlwZS5mb3JtYXQuY2FsbChvYmopO1xuICByZXR1cm4gb2JqLmZvcm1hdCgpO1xufVxuXG5VcmwucHJvdG90eXBlLmZvcm1hdCA9IGZ1bmN0aW9uKCkge1xuICB2YXIgYXV0aCA9IHRoaXMuYXV0aCB8fCAnJztcbiAgaWYgKGF1dGgpIHtcbiAgICBhdXRoID0gZW5jb2RlVVJJQ29tcG9uZW50KGF1dGgpO1xuICAgIGF1dGggPSBhdXRoLnJlcGxhY2UoLyUzQS9pLCAnOicpO1xuICAgIGF1dGggKz0gJ0AnO1xuICB9XG5cbiAgdmFyIHByb3RvY29sID0gdGhpcy5wcm90b2NvbCB8fCAnJyxcbiAgICAgIHBhdGhuYW1lID0gdGhpcy5wYXRobmFtZSB8fCAnJyxcbiAgICAgIGhhc2ggPSB0aGlzLmhhc2ggfHwgJycsXG4gICAgICBob3N0ID0gZmFsc2UsXG4gICAgICBxdWVyeSA9ICcnO1xuXG4gIGlmICh0aGlzLmhvc3QpIHtcbiAgICBob3N0ID0gYXV0aCArIHRoaXMuaG9zdDtcbiAgfSBlbHNlIGlmICh0aGlzLmhvc3RuYW1lKSB7XG4gICAgaG9zdCA9IGF1dGggKyAodGhpcy5ob3N0bmFtZS5pbmRleE9mKCc6JykgPT09IC0xID9cbiAgICAgICAgdGhpcy5ob3N0bmFtZSA6XG4gICAgICAgICdbJyArIHRoaXMuaG9zdG5hbWUgKyAnXScpO1xuICAgIGlmICh0aGlzLnBvcnQpIHtcbiAgICAgIGhvc3QgKz0gJzonICsgdGhpcy5wb3J0O1xuICAgIH1cbiAgfVxuXG4gIGlmICh0aGlzLnF1ZXJ5ICYmXG4gICAgICB1dGlsLmlzT2JqZWN0KHRoaXMucXVlcnkpICYmXG4gICAgICBPYmplY3Qua2V5cyh0aGlzLnF1ZXJ5KS5sZW5ndGgpIHtcbiAgICBxdWVyeSA9IHF1ZXJ5c3RyaW5nLnN0cmluZ2lmeSh0aGlzLnF1ZXJ5KTtcbiAgfVxuXG4gIHZhciBzZWFyY2ggPSB0aGlzLnNlYXJjaCB8fCAocXVlcnkgJiYgKCc/JyArIHF1ZXJ5KSkgfHwgJyc7XG5cbiAgaWYgKHByb3RvY29sICYmIHByb3RvY29sLnN1YnN0cigtMSkgIT09ICc6JykgcHJvdG9jb2wgKz0gJzonO1xuXG4gIC8vIG9ubHkgdGhlIHNsYXNoZWRQcm90b2NvbHMgZ2V0IHRoZSAvLy4gIE5vdCBtYWlsdG86LCB4bXBwOiwgZXRjLlxuICAvLyB1bmxlc3MgdGhleSBoYWQgdGhlbSB0byBiZWdpbiB3aXRoLlxuICBpZiAodGhpcy5zbGFzaGVzIHx8XG4gICAgICAoIXByb3RvY29sIHx8IHNsYXNoZWRQcm90b2NvbFtwcm90b2NvbF0pICYmIGhvc3QgIT09IGZhbHNlKSB7XG4gICAgaG9zdCA9ICcvLycgKyAoaG9zdCB8fCAnJyk7XG4gICAgaWYgKHBhdGhuYW1lICYmIHBhdGhuYW1lLmNoYXJBdCgwKSAhPT0gJy8nKSBwYXRobmFtZSA9ICcvJyArIHBhdGhuYW1lO1xuICB9IGVsc2UgaWYgKCFob3N0KSB7XG4gICAgaG9zdCA9ICcnO1xuICB9XG5cbiAgaWYgKGhhc2ggJiYgaGFzaC5jaGFyQXQoMCkgIT09ICcjJykgaGFzaCA9ICcjJyArIGhhc2g7XG4gIGlmIChzZWFyY2ggJiYgc2VhcmNoLmNoYXJBdCgwKSAhPT0gJz8nKSBzZWFyY2ggPSAnPycgKyBzZWFyY2g7XG5cbiAgcGF0aG5hbWUgPSBwYXRobmFtZS5yZXBsYWNlKC9bPyNdL2csIGZ1bmN0aW9uKG1hdGNoKSB7XG4gICAgcmV0dXJuIGVuY29kZVVSSUNvbXBvbmVudChtYXRjaCk7XG4gIH0pO1xuICBzZWFyY2ggPSBzZWFyY2gucmVwbGFjZSgnIycsICclMjMnKTtcblxuICByZXR1cm4gcHJvdG9jb2wgKyBob3N0ICsgcGF0aG5hbWUgKyBzZWFyY2ggKyBoYXNoO1xufTtcblxuZnVuY3Rpb24gdXJsUmVzb2x2ZShzb3VyY2UsIHJlbGF0aXZlKSB7XG4gIHJldHVybiB1cmxQYXJzZShzb3VyY2UsIGZhbHNlLCB0cnVlKS5yZXNvbHZlKHJlbGF0aXZlKTtcbn1cblxuVXJsLnByb3RvdHlwZS5yZXNvbHZlID0gZnVuY3Rpb24ocmVsYXRpdmUpIHtcbiAgcmV0dXJuIHRoaXMucmVzb2x2ZU9iamVjdCh1cmxQYXJzZShyZWxhdGl2ZSwgZmFsc2UsIHRydWUpKS5mb3JtYXQoKTtcbn07XG5cbmZ1bmN0aW9uIHVybFJlc29sdmVPYmplY3Qoc291cmNlLCByZWxhdGl2ZSkge1xuICBpZiAoIXNvdXJjZSkgcmV0dXJuIHJlbGF0aXZlO1xuICByZXR1cm4gdXJsUGFyc2Uoc291cmNlLCBmYWxzZSwgdHJ1ZSkucmVzb2x2ZU9iamVjdChyZWxhdGl2ZSk7XG59XG5cblVybC5wcm90b3R5cGUucmVzb2x2ZU9iamVjdCA9IGZ1bmN0aW9uKHJlbGF0aXZlKSB7XG4gIGlmICh1dGlsLmlzU3RyaW5nKHJlbGF0aXZlKSkge1xuICAgIHZhciByZWwgPSBuZXcgVXJsKCk7XG4gICAgcmVsLnBhcnNlKHJlbGF0aXZlLCBmYWxzZSwgdHJ1ZSk7XG4gICAgcmVsYXRpdmUgPSByZWw7XG4gIH1cblxuICB2YXIgcmVzdWx0ID0gbmV3IFVybCgpO1xuICB2YXIgdGtleXMgPSBPYmplY3Qua2V5cyh0aGlzKTtcbiAgZm9yICh2YXIgdGsgPSAwOyB0ayA8IHRrZXlzLmxlbmd0aDsgdGsrKykge1xuICAgIHZhciB0a2V5ID0gdGtleXNbdGtdO1xuICAgIHJlc3VsdFt0a2V5XSA9IHRoaXNbdGtleV07XG4gIH1cblxuICAvLyBoYXNoIGlzIGFsd2F5cyBvdmVycmlkZGVuLCBubyBtYXR0ZXIgd2hhdC5cbiAgLy8gZXZlbiBocmVmPVwiXCIgd2lsbCByZW1vdmUgaXQuXG4gIHJlc3VsdC5oYXNoID0gcmVsYXRpdmUuaGFzaDtcblxuICAvLyBpZiB0aGUgcmVsYXRpdmUgdXJsIGlzIGVtcHR5LCB0aGVuIHRoZXJlJ3Mgbm90aGluZyBsZWZ0IHRvIGRvIGhlcmUuXG4gIGlmIChyZWxhdGl2ZS5ocmVmID09PSAnJykge1xuICAgIHJlc3VsdC5ocmVmID0gcmVzdWx0LmZvcm1hdCgpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvLyBocmVmcyBsaWtlIC8vZm9vL2JhciBhbHdheXMgY3V0IHRvIHRoZSBwcm90b2NvbC5cbiAgaWYgKHJlbGF0aXZlLnNsYXNoZXMgJiYgIXJlbGF0aXZlLnByb3RvY29sKSB7XG4gICAgLy8gdGFrZSBldmVyeXRoaW5nIGV4Y2VwdCB0aGUgcHJvdG9jb2wgZnJvbSByZWxhdGl2ZVxuICAgIHZhciBya2V5cyA9IE9iamVjdC5rZXlzKHJlbGF0aXZlKTtcbiAgICBmb3IgKHZhciByayA9IDA7IHJrIDwgcmtleXMubGVuZ3RoOyByaysrKSB7XG4gICAgICB2YXIgcmtleSA9IHJrZXlzW3JrXTtcbiAgICAgIGlmIChya2V5ICE9PSAncHJvdG9jb2wnKVxuICAgICAgICByZXN1bHRbcmtleV0gPSByZWxhdGl2ZVtya2V5XTtcbiAgICB9XG5cbiAgICAvL3VybFBhcnNlIGFwcGVuZHMgdHJhaWxpbmcgLyB0byB1cmxzIGxpa2UgaHR0cDovL3d3dy5leGFtcGxlLmNvbVxuICAgIGlmIChzbGFzaGVkUHJvdG9jb2xbcmVzdWx0LnByb3RvY29sXSAmJlxuICAgICAgICByZXN1bHQuaG9zdG5hbWUgJiYgIXJlc3VsdC5wYXRobmFtZSkge1xuICAgICAgcmVzdWx0LnBhdGggPSByZXN1bHQucGF0aG5hbWUgPSAnLyc7XG4gICAgfVxuXG4gICAgcmVzdWx0LmhyZWYgPSByZXN1bHQuZm9ybWF0KCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIGlmIChyZWxhdGl2ZS5wcm90b2NvbCAmJiByZWxhdGl2ZS5wcm90b2NvbCAhPT0gcmVzdWx0LnByb3RvY29sKSB7XG4gICAgLy8gaWYgaXQncyBhIGtub3duIHVybCBwcm90b2NvbCwgdGhlbiBjaGFuZ2luZ1xuICAgIC8vIHRoZSBwcm90b2NvbCBkb2VzIHdlaXJkIHRoaW5nc1xuICAgIC8vIGZpcnN0LCBpZiBpdCdzIG5vdCBmaWxlOiwgdGhlbiB3ZSBNVVNUIGhhdmUgYSBob3N0LFxuICAgIC8vIGFuZCBpZiB0aGVyZSB3YXMgYSBwYXRoXG4gICAgLy8gdG8gYmVnaW4gd2l0aCwgdGhlbiB3ZSBNVVNUIGhhdmUgYSBwYXRoLlxuICAgIC8vIGlmIGl0IGlzIGZpbGU6LCB0aGVuIHRoZSBob3N0IGlzIGRyb3BwZWQsXG4gICAgLy8gYmVjYXVzZSB0aGF0J3Mga25vd24gdG8gYmUgaG9zdGxlc3MuXG4gICAgLy8gYW55dGhpbmcgZWxzZSBpcyBhc3N1bWVkIHRvIGJlIGFic29sdXRlLlxuICAgIGlmICghc2xhc2hlZFByb3RvY29sW3JlbGF0aXZlLnByb3RvY29sXSkge1xuICAgICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhyZWxhdGl2ZSk7XG4gICAgICBmb3IgKHZhciB2ID0gMDsgdiA8IGtleXMubGVuZ3RoOyB2KyspIHtcbiAgICAgICAgdmFyIGsgPSBrZXlzW3ZdO1xuICAgICAgICByZXN1bHRba10gPSByZWxhdGl2ZVtrXTtcbiAgICAgIH1cbiAgICAgIHJlc3VsdC5ocmVmID0gcmVzdWx0LmZvcm1hdCgpO1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICByZXN1bHQucHJvdG9jb2wgPSByZWxhdGl2ZS5wcm90b2NvbDtcbiAgICBpZiAoIXJlbGF0aXZlLmhvc3QgJiYgIWhvc3RsZXNzUHJvdG9jb2xbcmVsYXRpdmUucHJvdG9jb2xdKSB7XG4gICAgICB2YXIgcmVsUGF0aCA9IChyZWxhdGl2ZS5wYXRobmFtZSB8fCAnJykuc3BsaXQoJy8nKTtcbiAgICAgIHdoaWxlIChyZWxQYXRoLmxlbmd0aCAmJiAhKHJlbGF0aXZlLmhvc3QgPSByZWxQYXRoLnNoaWZ0KCkpKTtcbiAgICAgIGlmICghcmVsYXRpdmUuaG9zdCkgcmVsYXRpdmUuaG9zdCA9ICcnO1xuICAgICAgaWYgKCFyZWxhdGl2ZS5ob3N0bmFtZSkgcmVsYXRpdmUuaG9zdG5hbWUgPSAnJztcbiAgICAgIGlmIChyZWxQYXRoWzBdICE9PSAnJykgcmVsUGF0aC51bnNoaWZ0KCcnKTtcbiAgICAgIGlmIChyZWxQYXRoLmxlbmd0aCA8IDIpIHJlbFBhdGgudW5zaGlmdCgnJyk7XG4gICAgICByZXN1bHQucGF0aG5hbWUgPSByZWxQYXRoLmpvaW4oJy8nKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzdWx0LnBhdGhuYW1lID0gcmVsYXRpdmUucGF0aG5hbWU7XG4gICAgfVxuICAgIHJlc3VsdC5zZWFyY2ggPSByZWxhdGl2ZS5zZWFyY2g7XG4gICAgcmVzdWx0LnF1ZXJ5ID0gcmVsYXRpdmUucXVlcnk7XG4gICAgcmVzdWx0Lmhvc3QgPSByZWxhdGl2ZS5ob3N0IHx8ICcnO1xuICAgIHJlc3VsdC5hdXRoID0gcmVsYXRpdmUuYXV0aDtcbiAgICByZXN1bHQuaG9zdG5hbWUgPSByZWxhdGl2ZS5ob3N0bmFtZSB8fCByZWxhdGl2ZS5ob3N0O1xuICAgIHJlc3VsdC5wb3J0ID0gcmVsYXRpdmUucG9ydDtcbiAgICAvLyB0byBzdXBwb3J0IGh0dHAucmVxdWVzdFxuICAgIGlmIChyZXN1bHQucGF0aG5hbWUgfHwgcmVzdWx0LnNlYXJjaCkge1xuICAgICAgdmFyIHAgPSByZXN1bHQucGF0aG5hbWUgfHwgJyc7XG4gICAgICB2YXIgcyA9IHJlc3VsdC5zZWFyY2ggfHwgJyc7XG4gICAgICByZXN1bHQucGF0aCA9IHAgKyBzO1xuICAgIH1cbiAgICByZXN1bHQuc2xhc2hlcyA9IHJlc3VsdC5zbGFzaGVzIHx8IHJlbGF0aXZlLnNsYXNoZXM7XG4gICAgcmVzdWx0LmhyZWYgPSByZXN1bHQuZm9ybWF0KCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIHZhciBpc1NvdXJjZUFicyA9IChyZXN1bHQucGF0aG5hbWUgJiYgcmVzdWx0LnBhdGhuYW1lLmNoYXJBdCgwKSA9PT0gJy8nKSxcbiAgICAgIGlzUmVsQWJzID0gKFxuICAgICAgICAgIHJlbGF0aXZlLmhvc3QgfHxcbiAgICAgICAgICByZWxhdGl2ZS5wYXRobmFtZSAmJiByZWxhdGl2ZS5wYXRobmFtZS5jaGFyQXQoMCkgPT09ICcvJ1xuICAgICAgKSxcbiAgICAgIG11c3RFbmRBYnMgPSAoaXNSZWxBYnMgfHwgaXNTb3VyY2VBYnMgfHxcbiAgICAgICAgICAgICAgICAgICAgKHJlc3VsdC5ob3N0ICYmIHJlbGF0aXZlLnBhdGhuYW1lKSksXG4gICAgICByZW1vdmVBbGxEb3RzID0gbXVzdEVuZEFicyxcbiAgICAgIHNyY1BhdGggPSByZXN1bHQucGF0aG5hbWUgJiYgcmVzdWx0LnBhdGhuYW1lLnNwbGl0KCcvJykgfHwgW10sXG4gICAgICByZWxQYXRoID0gcmVsYXRpdmUucGF0aG5hbWUgJiYgcmVsYXRpdmUucGF0aG5hbWUuc3BsaXQoJy8nKSB8fCBbXSxcbiAgICAgIHBzeWNob3RpYyA9IHJlc3VsdC5wcm90b2NvbCAmJiAhc2xhc2hlZFByb3RvY29sW3Jlc3VsdC5wcm90b2NvbF07XG5cbiAgLy8gaWYgdGhlIHVybCBpcyBhIG5vbi1zbGFzaGVkIHVybCwgdGhlbiByZWxhdGl2ZVxuICAvLyBsaW5rcyBsaWtlIC4uLy4uIHNob3VsZCBiZSBhYmxlXG4gIC8vIHRvIGNyYXdsIHVwIHRvIHRoZSBob3N0bmFtZSwgYXMgd2VsbC4gIFRoaXMgaXMgc3RyYW5nZS5cbiAgLy8gcmVzdWx0LnByb3RvY29sIGhhcyBhbHJlYWR5IGJlZW4gc2V0IGJ5IG5vdy5cbiAgLy8gTGF0ZXIgb24sIHB1dCB0aGUgZmlyc3QgcGF0aCBwYXJ0IGludG8gdGhlIGhvc3QgZmllbGQuXG4gIGlmIChwc3ljaG90aWMpIHtcbiAgICByZXN1bHQuaG9zdG5hbWUgPSAnJztcbiAgICByZXN1bHQucG9ydCA9IG51bGw7XG4gICAgaWYgKHJlc3VsdC5ob3N0KSB7XG4gICAgICBpZiAoc3JjUGF0aFswXSA9PT0gJycpIHNyY1BhdGhbMF0gPSByZXN1bHQuaG9zdDtcbiAgICAgIGVsc2Ugc3JjUGF0aC51bnNoaWZ0KHJlc3VsdC5ob3N0KTtcbiAgICB9XG4gICAgcmVzdWx0Lmhvc3QgPSAnJztcbiAgICBpZiAocmVsYXRpdmUucHJvdG9jb2wpIHtcbiAgICAgIHJlbGF0aXZlLmhvc3RuYW1lID0gbnVsbDtcbiAgICAgIHJlbGF0aXZlLnBvcnQgPSBudWxsO1xuICAgICAgaWYgKHJlbGF0aXZlLmhvc3QpIHtcbiAgICAgICAgaWYgKHJlbFBhdGhbMF0gPT09ICcnKSByZWxQYXRoWzBdID0gcmVsYXRpdmUuaG9zdDtcbiAgICAgICAgZWxzZSByZWxQYXRoLnVuc2hpZnQocmVsYXRpdmUuaG9zdCk7XG4gICAgICB9XG4gICAgICByZWxhdGl2ZS5ob3N0ID0gbnVsbDtcbiAgICB9XG4gICAgbXVzdEVuZEFicyA9IG11c3RFbmRBYnMgJiYgKHJlbFBhdGhbMF0gPT09ICcnIHx8IHNyY1BhdGhbMF0gPT09ICcnKTtcbiAgfVxuXG4gIGlmIChpc1JlbEFicykge1xuICAgIC8vIGl0J3MgYWJzb2x1dGUuXG4gICAgcmVzdWx0Lmhvc3QgPSAocmVsYXRpdmUuaG9zdCB8fCByZWxhdGl2ZS5ob3N0ID09PSAnJykgP1xuICAgICAgICAgICAgICAgICAgcmVsYXRpdmUuaG9zdCA6IHJlc3VsdC5ob3N0O1xuICAgIHJlc3VsdC5ob3N0bmFtZSA9IChyZWxhdGl2ZS5ob3N0bmFtZSB8fCByZWxhdGl2ZS5ob3N0bmFtZSA9PT0gJycpID9cbiAgICAgICAgICAgICAgICAgICAgICByZWxhdGl2ZS5ob3N0bmFtZSA6IHJlc3VsdC5ob3N0bmFtZTtcbiAgICByZXN1bHQuc2VhcmNoID0gcmVsYXRpdmUuc2VhcmNoO1xuICAgIHJlc3VsdC5xdWVyeSA9IHJlbGF0aXZlLnF1ZXJ5O1xuICAgIHNyY1BhdGggPSByZWxQYXRoO1xuICAgIC8vIGZhbGwgdGhyb3VnaCB0byB0aGUgZG90LWhhbmRsaW5nIGJlbG93LlxuICB9IGVsc2UgaWYgKHJlbFBhdGgubGVuZ3RoKSB7XG4gICAgLy8gaXQncyByZWxhdGl2ZVxuICAgIC8vIHRocm93IGF3YXkgdGhlIGV4aXN0aW5nIGZpbGUsIGFuZCB0YWtlIHRoZSBuZXcgcGF0aCBpbnN0ZWFkLlxuICAgIGlmICghc3JjUGF0aCkgc3JjUGF0aCA9IFtdO1xuICAgIHNyY1BhdGgucG9wKCk7XG4gICAgc3JjUGF0aCA9IHNyY1BhdGguY29uY2F0KHJlbFBhdGgpO1xuICAgIHJlc3VsdC5zZWFyY2ggPSByZWxhdGl2ZS5zZWFyY2g7XG4gICAgcmVzdWx0LnF1ZXJ5ID0gcmVsYXRpdmUucXVlcnk7XG4gIH0gZWxzZSBpZiAoIXV0aWwuaXNOdWxsT3JVbmRlZmluZWQocmVsYXRpdmUuc2VhcmNoKSkge1xuICAgIC8vIGp1c3QgcHVsbCBvdXQgdGhlIHNlYXJjaC5cbiAgICAvLyBsaWtlIGhyZWY9Jz9mb28nLlxuICAgIC8vIFB1dCB0aGlzIGFmdGVyIHRoZSBvdGhlciB0d28gY2FzZXMgYmVjYXVzZSBpdCBzaW1wbGlmaWVzIHRoZSBib29sZWFuc1xuICAgIGlmIChwc3ljaG90aWMpIHtcbiAgICAgIHJlc3VsdC5ob3N0bmFtZSA9IHJlc3VsdC5ob3N0ID0gc3JjUGF0aC5zaGlmdCgpO1xuICAgICAgLy9vY2NhdGlvbmFseSB0aGUgYXV0aCBjYW4gZ2V0IHN0dWNrIG9ubHkgaW4gaG9zdFxuICAgICAgLy90aGlzIGVzcGVjaWFsbHkgaGFwcGVucyBpbiBjYXNlcyBsaWtlXG4gICAgICAvL3VybC5yZXNvbHZlT2JqZWN0KCdtYWlsdG86bG9jYWwxQGRvbWFpbjEnLCAnbG9jYWwyQGRvbWFpbjInKVxuICAgICAgdmFyIGF1dGhJbkhvc3QgPSByZXN1bHQuaG9zdCAmJiByZXN1bHQuaG9zdC5pbmRleE9mKCdAJykgPiAwID9cbiAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0Lmhvc3Quc3BsaXQoJ0AnKSA6IGZhbHNlO1xuICAgICAgaWYgKGF1dGhJbkhvc3QpIHtcbiAgICAgICAgcmVzdWx0LmF1dGggPSBhdXRoSW5Ib3N0LnNoaWZ0KCk7XG4gICAgICAgIHJlc3VsdC5ob3N0ID0gcmVzdWx0Lmhvc3RuYW1lID0gYXV0aEluSG9zdC5zaGlmdCgpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXN1bHQuc2VhcmNoID0gcmVsYXRpdmUuc2VhcmNoO1xuICAgIHJlc3VsdC5xdWVyeSA9IHJlbGF0aXZlLnF1ZXJ5O1xuICAgIC8vdG8gc3VwcG9ydCBodHRwLnJlcXVlc3RcbiAgICBpZiAoIXV0aWwuaXNOdWxsKHJlc3VsdC5wYXRobmFtZSkgfHwgIXV0aWwuaXNOdWxsKHJlc3VsdC5zZWFyY2gpKSB7XG4gICAgICByZXN1bHQucGF0aCA9IChyZXN1bHQucGF0aG5hbWUgPyByZXN1bHQucGF0aG5hbWUgOiAnJykgK1xuICAgICAgICAgICAgICAgICAgICAocmVzdWx0LnNlYXJjaCA/IHJlc3VsdC5zZWFyY2ggOiAnJyk7XG4gICAgfVxuICAgIHJlc3VsdC5ocmVmID0gcmVzdWx0LmZvcm1hdCgpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBpZiAoIXNyY1BhdGgubGVuZ3RoKSB7XG4gICAgLy8gbm8gcGF0aCBhdCBhbGwuICBlYXN5LlxuICAgIC8vIHdlJ3ZlIGFscmVhZHkgaGFuZGxlZCB0aGUgb3RoZXIgc3R1ZmYgYWJvdmUuXG4gICAgcmVzdWx0LnBhdGhuYW1lID0gbnVsbDtcbiAgICAvL3RvIHN1cHBvcnQgaHR0cC5yZXF1ZXN0XG4gICAgaWYgKHJlc3VsdC5zZWFyY2gpIHtcbiAgICAgIHJlc3VsdC5wYXRoID0gJy8nICsgcmVzdWx0LnNlYXJjaDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzdWx0LnBhdGggPSBudWxsO1xuICAgIH1cbiAgICByZXN1bHQuaHJlZiA9IHJlc3VsdC5mb3JtYXQoKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgLy8gaWYgYSB1cmwgRU5EcyBpbiAuIG9yIC4uLCB0aGVuIGl0IG11c3QgZ2V0IGEgdHJhaWxpbmcgc2xhc2guXG4gIC8vIGhvd2V2ZXIsIGlmIGl0IGVuZHMgaW4gYW55dGhpbmcgZWxzZSBub24tc2xhc2h5LFxuICAvLyB0aGVuIGl0IG11c3QgTk9UIGdldCBhIHRyYWlsaW5nIHNsYXNoLlxuICB2YXIgbGFzdCA9IHNyY1BhdGguc2xpY2UoLTEpWzBdO1xuICB2YXIgaGFzVHJhaWxpbmdTbGFzaCA9IChcbiAgICAgIChyZXN1bHQuaG9zdCB8fCByZWxhdGl2ZS5ob3N0IHx8IHNyY1BhdGgubGVuZ3RoID4gMSkgJiZcbiAgICAgIChsYXN0ID09PSAnLicgfHwgbGFzdCA9PT0gJy4uJykgfHwgbGFzdCA9PT0gJycpO1xuXG4gIC8vIHN0cmlwIHNpbmdsZSBkb3RzLCByZXNvbHZlIGRvdWJsZSBkb3RzIHRvIHBhcmVudCBkaXJcbiAgLy8gaWYgdGhlIHBhdGggdHJpZXMgdG8gZ28gYWJvdmUgdGhlIHJvb3QsIGB1cGAgZW5kcyB1cCA+IDBcbiAgdmFyIHVwID0gMDtcbiAgZm9yICh2YXIgaSA9IHNyY1BhdGgubGVuZ3RoOyBpID49IDA7IGktLSkge1xuICAgIGxhc3QgPSBzcmNQYXRoW2ldO1xuICAgIGlmIChsYXN0ID09PSAnLicpIHtcbiAgICAgIHNyY1BhdGguc3BsaWNlKGksIDEpO1xuICAgIH0gZWxzZSBpZiAobGFzdCA9PT0gJy4uJykge1xuICAgICAgc3JjUGF0aC5zcGxpY2UoaSwgMSk7XG4gICAgICB1cCsrO1xuICAgIH0gZWxzZSBpZiAodXApIHtcbiAgICAgIHNyY1BhdGguc3BsaWNlKGksIDEpO1xuICAgICAgdXAtLTtcbiAgICB9XG4gIH1cblxuICAvLyBpZiB0aGUgcGF0aCBpcyBhbGxvd2VkIHRvIGdvIGFib3ZlIHRoZSByb290LCByZXN0b3JlIGxlYWRpbmcgLi5zXG4gIGlmICghbXVzdEVuZEFicyAmJiAhcmVtb3ZlQWxsRG90cykge1xuICAgIGZvciAoOyB1cC0tOyB1cCkge1xuICAgICAgc3JjUGF0aC51bnNoaWZ0KCcuLicpO1xuICAgIH1cbiAgfVxuXG4gIGlmIChtdXN0RW5kQWJzICYmIHNyY1BhdGhbMF0gIT09ICcnICYmXG4gICAgICAoIXNyY1BhdGhbMF0gfHwgc3JjUGF0aFswXS5jaGFyQXQoMCkgIT09ICcvJykpIHtcbiAgICBzcmNQYXRoLnVuc2hpZnQoJycpO1xuICB9XG5cbiAgaWYgKGhhc1RyYWlsaW5nU2xhc2ggJiYgKHNyY1BhdGguam9pbignLycpLnN1YnN0cigtMSkgIT09ICcvJykpIHtcbiAgICBzcmNQYXRoLnB1c2goJycpO1xuICB9XG5cbiAgdmFyIGlzQWJzb2x1dGUgPSBzcmNQYXRoWzBdID09PSAnJyB8fFxuICAgICAgKHNyY1BhdGhbMF0gJiYgc3JjUGF0aFswXS5jaGFyQXQoMCkgPT09ICcvJyk7XG5cbiAgLy8gcHV0IHRoZSBob3N0IGJhY2tcbiAgaWYgKHBzeWNob3RpYykge1xuICAgIHJlc3VsdC5ob3N0bmFtZSA9IHJlc3VsdC5ob3N0ID0gaXNBYnNvbHV0ZSA/ICcnIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNyY1BhdGgubGVuZ3RoID8gc3JjUGF0aC5zaGlmdCgpIDogJyc7XG4gICAgLy9vY2NhdGlvbmFseSB0aGUgYXV0aCBjYW4gZ2V0IHN0dWNrIG9ubHkgaW4gaG9zdFxuICAgIC8vdGhpcyBlc3BlY2lhbGx5IGhhcHBlbnMgaW4gY2FzZXMgbGlrZVxuICAgIC8vdXJsLnJlc29sdmVPYmplY3QoJ21haWx0bzpsb2NhbDFAZG9tYWluMScsICdsb2NhbDJAZG9tYWluMicpXG4gICAgdmFyIGF1dGhJbkhvc3QgPSByZXN1bHQuaG9zdCAmJiByZXN1bHQuaG9zdC5pbmRleE9mKCdAJykgPiAwID9cbiAgICAgICAgICAgICAgICAgICAgIHJlc3VsdC5ob3N0LnNwbGl0KCdAJykgOiBmYWxzZTtcbiAgICBpZiAoYXV0aEluSG9zdCkge1xuICAgICAgcmVzdWx0LmF1dGggPSBhdXRoSW5Ib3N0LnNoaWZ0KCk7XG4gICAgICByZXN1bHQuaG9zdCA9IHJlc3VsdC5ob3N0bmFtZSA9IGF1dGhJbkhvc3Quc2hpZnQoKTtcbiAgICB9XG4gIH1cblxuICBtdXN0RW5kQWJzID0gbXVzdEVuZEFicyB8fCAocmVzdWx0Lmhvc3QgJiYgc3JjUGF0aC5sZW5ndGgpO1xuXG4gIGlmIChtdXN0RW5kQWJzICYmICFpc0Fic29sdXRlKSB7XG4gICAgc3JjUGF0aC51bnNoaWZ0KCcnKTtcbiAgfVxuXG4gIGlmICghc3JjUGF0aC5sZW5ndGgpIHtcbiAgICByZXN1bHQucGF0aG5hbWUgPSBudWxsO1xuICAgIHJlc3VsdC5wYXRoID0gbnVsbDtcbiAgfSBlbHNlIHtcbiAgICByZXN1bHQucGF0aG5hbWUgPSBzcmNQYXRoLmpvaW4oJy8nKTtcbiAgfVxuXG4gIC8vdG8gc3VwcG9ydCByZXF1ZXN0Lmh0dHBcbiAgaWYgKCF1dGlsLmlzTnVsbChyZXN1bHQucGF0aG5hbWUpIHx8ICF1dGlsLmlzTnVsbChyZXN1bHQuc2VhcmNoKSkge1xuICAgIHJlc3VsdC5wYXRoID0gKHJlc3VsdC5wYXRobmFtZSA/IHJlc3VsdC5wYXRobmFtZSA6ICcnKSArXG4gICAgICAgICAgICAgICAgICAocmVzdWx0LnNlYXJjaCA/IHJlc3VsdC5zZWFyY2ggOiAnJyk7XG4gIH1cbiAgcmVzdWx0LmF1dGggPSByZWxhdGl2ZS5hdXRoIHx8IHJlc3VsdC5hdXRoO1xuICByZXN1bHQuc2xhc2hlcyA9IHJlc3VsdC5zbGFzaGVzIHx8IHJlbGF0aXZlLnNsYXNoZXM7XG4gIHJlc3VsdC5ocmVmID0gcmVzdWx0LmZvcm1hdCgpO1xuICByZXR1cm4gcmVzdWx0O1xufTtcblxuVXJsLnByb3RvdHlwZS5wYXJzZUhvc3QgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGhvc3QgPSB0aGlzLmhvc3Q7XG4gIHZhciBwb3J0ID0gcG9ydFBhdHRlcm4uZXhlYyhob3N0KTtcbiAgaWYgKHBvcnQpIHtcbiAgICBwb3J0ID0gcG9ydFswXTtcbiAgICBpZiAocG9ydCAhPT0gJzonKSB7XG4gICAgICB0aGlzLnBvcnQgPSBwb3J0LnN1YnN0cigxKTtcbiAgICB9XG4gICAgaG9zdCA9IGhvc3Quc3Vic3RyKDAsIGhvc3QubGVuZ3RoIC0gcG9ydC5sZW5ndGgpO1xuICB9XG4gIGlmIChob3N0KSB0aGlzLmhvc3RuYW1lID0gaG9zdDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBpc1N0cmluZzogZnVuY3Rpb24oYXJnKSB7XG4gICAgcmV0dXJuIHR5cGVvZihhcmcpID09PSAnc3RyaW5nJztcbiAgfSxcbiAgaXNPYmplY3Q6IGZ1bmN0aW9uKGFyZykge1xuICAgIHJldHVybiB0eXBlb2YoYXJnKSA9PT0gJ29iamVjdCcgJiYgYXJnICE9PSBudWxsO1xuICB9LFxuICBpc051bGw6IGZ1bmN0aW9uKGFyZykge1xuICAgIHJldHVybiBhcmcgPT09IG51bGw7XG4gIH0sXG4gIGlzTnVsbE9yVW5kZWZpbmVkOiBmdW5jdGlvbihhcmcpIHtcbiAgICByZXR1cm4gYXJnID09IG51bGw7XG4gIH1cbn07XG4iLCJcbi8qKlxuICogTW9kdWxlIGV4cG9ydHMuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBkZXByZWNhdGU7XG5cbi8qKlxuICogTWFyayB0aGF0IGEgbWV0aG9kIHNob3VsZCBub3QgYmUgdXNlZC5cbiAqIFJldHVybnMgYSBtb2RpZmllZCBmdW5jdGlvbiB3aGljaCB3YXJucyBvbmNlIGJ5IGRlZmF1bHQuXG4gKlxuICogSWYgYGxvY2FsU3RvcmFnZS5ub0RlcHJlY2F0aW9uID0gdHJ1ZWAgaXMgc2V0LCB0aGVuIGl0IGlzIGEgbm8tb3AuXG4gKlxuICogSWYgYGxvY2FsU3RvcmFnZS50aHJvd0RlcHJlY2F0aW9uID0gdHJ1ZWAgaXMgc2V0LCB0aGVuIGRlcHJlY2F0ZWQgZnVuY3Rpb25zXG4gKiB3aWxsIHRocm93IGFuIEVycm9yIHdoZW4gaW52b2tlZC5cbiAqXG4gKiBJZiBgbG9jYWxTdG9yYWdlLnRyYWNlRGVwcmVjYXRpb24gPSB0cnVlYCBpcyBzZXQsIHRoZW4gZGVwcmVjYXRlZCBmdW5jdGlvbnNcbiAqIHdpbGwgaW52b2tlIGBjb25zb2xlLnRyYWNlKClgIGluc3RlYWQgb2YgYGNvbnNvbGUuZXJyb3IoKWAuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gLSB0aGUgZnVuY3Rpb24gdG8gZGVwcmVjYXRlXG4gKiBAcGFyYW0ge1N0cmluZ30gbXNnIC0gdGhlIHN0cmluZyB0byBwcmludCB0byB0aGUgY29uc29sZSB3aGVuIGBmbmAgaXMgaW52b2tlZFxuICogQHJldHVybnMge0Z1bmN0aW9ufSBhIG5ldyBcImRlcHJlY2F0ZWRcIiB2ZXJzaW9uIG9mIGBmbmBcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gZGVwcmVjYXRlIChmbiwgbXNnKSB7XG4gIGlmIChjb25maWcoJ25vRGVwcmVjYXRpb24nKSkge1xuICAgIHJldHVybiBmbjtcbiAgfVxuXG4gIHZhciB3YXJuZWQgPSBmYWxzZTtcbiAgZnVuY3Rpb24gZGVwcmVjYXRlZCgpIHtcbiAgICBpZiAoIXdhcm5lZCkge1xuICAgICAgaWYgKGNvbmZpZygndGhyb3dEZXByZWNhdGlvbicpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihtc2cpO1xuICAgICAgfSBlbHNlIGlmIChjb25maWcoJ3RyYWNlRGVwcmVjYXRpb24nKSkge1xuICAgICAgICBjb25zb2xlLnRyYWNlKG1zZyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLndhcm4obXNnKTtcbiAgICAgIH1cbiAgICAgIHdhcm5lZCA9IHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9XG5cbiAgcmV0dXJuIGRlcHJlY2F0ZWQ7XG59XG5cbi8qKlxuICogQ2hlY2tzIGBsb2NhbFN0b3JhZ2VgIGZvciBib29sZWFuIHZhbHVlcyBmb3IgdGhlIGdpdmVuIGBuYW1lYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICogQHJldHVybnMge0Jvb2xlYW59XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBjb25maWcgKG5hbWUpIHtcbiAgLy8gYWNjZXNzaW5nIGdsb2JhbC5sb2NhbFN0b3JhZ2UgY2FuIHRyaWdnZXIgYSBET01FeGNlcHRpb24gaW4gc2FuZGJveGVkIGlmcmFtZXNcbiAgdHJ5IHtcbiAgICBpZiAoIWdsb2JhbC5sb2NhbFN0b3JhZ2UpIHJldHVybiBmYWxzZTtcbiAgfSBjYXRjaCAoXykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICB2YXIgdmFsID0gZ2xvYmFsLmxvY2FsU3RvcmFnZVtuYW1lXTtcbiAgaWYgKG51bGwgPT0gdmFsKSByZXR1cm4gZmFsc2U7XG4gIHJldHVybiBTdHJpbmcodmFsKS50b0xvd2VyQ2FzZSgpID09PSAndHJ1ZSc7XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGV4dGVuZFxuXG52YXIgaGFzT3duUHJvcGVydHkgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xuXG5mdW5jdGlvbiBleHRlbmQoKSB7XG4gICAgdmFyIHRhcmdldCA9IHt9XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldXG5cbiAgICAgICAgZm9yICh2YXIga2V5IGluIHNvdXJjZSkge1xuICAgICAgICAgICAgaWYgKGhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBrZXkpKSB7XG4gICAgICAgICAgICAgICAgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRhcmdldFxufVxuIiwiY2xhc3MgQ29tbW9uXHJcbntcclxuXHRjb25zdHJ1Y3Rvcih2YWx1ZXMpXHJcblx0e1xyXG5cdFx0dGhpcy52YWx1ZXMgPSB2YWx1ZXM7XHJcblx0XHRjb25zb2xlLmxvZyhcIjEwMVwiKTtcclxuXHR9XHJcblx0XHJcblx0c3RhdGljIGluaGVyaXRzRnJvbShjaGlsZCwgcGFyZW50KVxyXG5cdHtcclxuXHQgICAgY2hpbGQucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShwYXJlbnQucHJvdG90eXBlKTtcclxuXHR9XHJcblx0XHJcblx0c3RhdGljIGdldFRpbWVLZXkoKVxyXG5cdHtcclxuXHRcdHZhciB1aWQgPSAobmV3IERhdGUoKS5nZXRUaW1lKCkpLnRvU3RyaW5nKDM2KTtcclxuXHRcdHJldHVybih1aWQpO1xyXG5cdH1cclxuXHJcblx0c3RhdGljICBqc29uVG9VUkkoanNvbil7IHJldHVybiBlbmNvZGVVUklDb21wb25lbnQoSlNPTi5zdHJpbmdpZnkoanNvbikpOyB9XHJcblxyXG5cdHN0YXRpYyB1cmlUb0pTT04odXJpanNvbil7IHJldHVybiBKU09OLnBhcnNlKGRlY29kZVVSSUNvbXBvbmVudCh1cmlqc29uKSk7IH1cclxuXHJcblx0c3RhdGljIHN0cmluZ2lmeUNvbW1vbihvYmosIHJlcGxhY2VyLCBzcGFjZXMsIGN5Y2xlUmVwbGFjZXIpXHJcblx0e1xyXG5cdCAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KG9iaiwgdGhpcy5zZXJpYWxpemVyQ29tbW9uKHJlcGxhY2VyLCBjeWNsZVJlcGxhY2VyKSwgc3BhY2VzKVxyXG5cdH1cclxuXHJcblx0c3RhdGljIGdldERheU9mV2VlayhkYXRlKVxyXG5cdHsgICBcclxuXHQgICAgcmV0dXJuIFtcIlN1bmRheVwiLFwiTW9uZGF5XCIsXCJUdWVzZGF5XCIsXCJXZWRuZXNkYXlcIixcIlRodXJzZGF5XCIsXCJGcmlkYXlcIixcIlNhdHVyZGF5XCJdWyBkYXRlLmdldERheSgpIF07XHJcblx0fTtcclxuXHRcclxuXHR0ZXN0KHRlc3QpXHJcblx0e1xyXG5cdFx0Y29uc29sZS5sb2coXCJDb21tb246dGVzdDpcIit0ZXN0KTtcclxuXHR9XHJcblxyXG5cdHN0YXRpYyBzZXJpYWxpemVyQ29tbW9uKHJlcGxhY2VyLCBjeWNsZVJlcGxhY2VyKVxyXG5cdHtcclxuXHQgIHZhciBzdGFjayA9IFtdLCBrZXlzID0gW11cclxuXHJcblx0ICBpZiAoY3ljbGVSZXBsYWNlciA9PSBudWxsKSBjeWNsZVJlcGxhY2VyID0gZnVuY3Rpb24oa2V5LCB2YWx1ZSkge1xyXG5cdCAgICBpZiAoc3RhY2tbMF0gPT09IHZhbHVlKSByZXR1cm4gXCJbQ2lyY3VsYXIgfl1cIlxyXG5cdCAgICByZXR1cm4gXCJbQ2lyY3VsYXIgfi5cIiArIGtleXMuc2xpY2UoMCwgc3RhY2suaW5kZXhPZih2YWx1ZSkpLmpvaW4oXCIuXCIpICsgXCJdXCJcclxuXHQgIH1cclxuXHJcblx0ICByZXR1cm4gZnVuY3Rpb24oa2V5LCB2YWx1ZSkge1xyXG5cdCAgICBpZiAoc3RhY2subGVuZ3RoID4gMCkge1xyXG5cdCAgICAgIHZhciB0aGlzUG9zID0gc3RhY2suaW5kZXhPZih0aGlzKVxyXG5cdCAgICAgIH50aGlzUG9zID8gc3RhY2suc3BsaWNlKHRoaXNQb3MgKyAxKSA6IHN0YWNrLnB1c2godGhpcylcclxuXHQgICAgICB+dGhpc1BvcyA/IGtleXMuc3BsaWNlKHRoaXNQb3MsIEluZmluaXR5LCBrZXkpIDoga2V5cy5wdXNoKGtleSlcclxuXHQgICAgICBpZiAofnN0YWNrLmluZGV4T2YodmFsdWUpKSB2YWx1ZSA9IGN5Y2xlUmVwbGFjZXIuY2FsbCh0aGlzLCBrZXksIHZhbHVlKVxyXG5cdCAgICB9XHJcblx0ICAgIGVsc2Ugc3RhY2sucHVzaCh2YWx1ZSlcclxuXHJcblx0ICAgIHJldHVybiByZXBsYWNlciA9PSBudWxsID8gdmFsdWUgOiByZXBsYWNlci5jYWxsKHRoaXMsIGtleSwgdmFsdWUpXHJcblx0ICB9XHJcblx0fVxyXG5cclxuXHRzdGF0aWMgZ2V0Q29sb3JGcm9tU3RyaW5nKGNvbG9yU3RyaW5nKVxyXG5cdHtcclxuXHRcdHZhciB0cmFuc3BhcmVuY3kgPSAxLjA7XHJcblx0XHRpZihjb2xvclN0cmluZy5sZW5ndGg9PTYpXHJcblx0XHR7XHJcblx0XHRcdGNvbG9yU3RyaW5nICs9IFwiZmZcIjtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0dmFyIGNvbG9yID0gXCJyZ2JhKFwiK1xyXG5cdFx0XHRcdHBhcnNlSW50KGNvbG9yU3RyaW5nLnN1YnN0cmluZygwLDIpLCAxNikrXCIsXCIrXHJcblx0XHRcdFx0cGFyc2VJbnQoY29sb3JTdHJpbmcuc3Vic3RyaW5nKDIsNCksIDE2KStcIixcIitcclxuXHRcdFx0XHRwYXJzZUludChjb2xvclN0cmluZy5zdWJzdHJpbmcoNCw2KSwgMTYpK1wiLFwiK1xyXG5cdFx0XHRcdHBhcnNlSW50KGNvbG9yU3RyaW5nLnN1YnN0cmluZyg2LDgpLCAxNikvMjU1LjArXCIpXCI7XHJcblx0XHRcclxuXHRcdHJldHVybihjb2xvcik7XHJcblx0fVxyXG5cclxuXHRzdGF0aWMgbG9nSW5zZXJ0QXJyYXkoYXJyYXkscHJpbnRWYWx1ZUZ1bmN0aW9uKVxyXG5cdHtcclxuXHRcdGZvcih2YXIgaT0wO2k8YXJyYXkubGVuZ3RoO2krKylcclxuXHRcdHtcclxuXHRcdFx0Y29uc29sZS5sb2coXCJpPVwiK3ByaW50VmFsdWVGdW5jdGlvbihhcnJheVtpXSkpO1xyXG5cdFx0fVxyXG5cdH1cdFxyXG5cdFxyXG5cdHN0YXRpYyBpbnNlcnRJbnRvQXJyYXkodG9JbnNlcnQsYXJyYXkscG9zaXRpb24pXHJcblx0e1xyXG5cdFx0YXJyYXkuc3BsaWNlKHBvc2l0aW9uLDAsdG9JbnNlcnQpO1xyXG5cdH1cdFxyXG5cdFxyXG5cdHN0YXRpYyBzaHVmZmxlQXJyYXkoYXJyYXkpXHJcblx0e1xyXG5cdCAgICBmb3IgKHZhciBpID0gYXJyYXkubGVuZ3RoIC0gMTsgaSA+IDA7IGktLSkge1xyXG5cdCAgICAgICAgdmFyIGogPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAoaSArIDEpKTtcclxuXHQgICAgICAgIHZhciB0ZW1wID0gYXJyYXlbaV07XHJcblx0ICAgICAgICBhcnJheVtpXSA9IGFycmF5W2pdO1xyXG5cdCAgICAgICAgYXJyYXlbal0gPSB0ZW1wO1xyXG5cdCAgICB9XHJcblx0ICAgIHJldHVybiBhcnJheTtcclxuXHR9XHJcblxyXG5cdHN0YXRpYyByZW1vdmVJdGVtRnJvbUFycmF5KGFycmF5LGl0ZW0pXHJcblx0e1xyXG5cdFx0dmFyIGluZGV4ID0gYXJyYXkuaW5kZXhPZihpdGVtKTtcclxuXHRcdGlmIChpbmRleCA+IC0xKVxyXG5cdFx0e1xyXG5cdFx0ICAgIGFycmF5LnNwbGljZShpbmRleCwgMSk7XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdHN0YXRpYyB0b1N0cmluZyhvYmplY3QpXHJcblx0e1xyXG5cdFx0cmV0dXJuKEpTT04uc3RyaW5naWZ5KG9iamVjdCkpO1xyXG5cdH1cclxufVxyXG5cclxuXHJcbi8vPGpzMm5vZGU+XHJcbm1vZHVsZS5leHBvcnRzID0gQ29tbW9uO1xyXG5jb25zb2xlLmxvZyhcIkxvYWRpbmc6Q29tbW9uXCIpO1xyXG4vLzwvanMybm9kZT5cclxuIiwidmFyIENvbW1vbiA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9jb21tb24nKTtcclxudmFyIFBvc2l0aW9uID0gcmVxdWlyZSgnLi4vLi4vbm9kZXMvcG9zaXRpb24vcG9zaXRpb24nKTtcclxuXHJcblxyXG5jbGFzcyBDb25uZWN0b3Jcclxue1xyXG5cdGNvbnN0cnVjdG9yKGNvbm5lY3RvckZ1bmN0aW9uLGNvbm5lY3RvckRpc3BsYXksbmFtZSlcclxuXHR7XHJcblx0XHR0aGlzLm5vZGVzID0gbmV3IEFycmF5KCk7XHJcblx0XHR0aGlzLmNvbm5lY3RvckZ1bmN0aW9uID0gY29ubmVjdG9yRnVuY3Rpb247XHRcclxuXHRcdHRoaXMuY29ubmVjdG9yRGlzcGxheSA9IGNvbm5lY3RvckRpc3BsYXk7XHRcclxuXHRcdHRoaXMubmFtZSA9IG5hbWU7XHJcblx0XHR0aGlzLmNvbm5lY3RvcktleSA9IG5hbWUrXCIjXCIrQ29tbW9uLmdldFRpbWVLZXkoKTtcclxuXHRcdGlmKCFuYW1lKSBjb25zb2xlLnRyYWNlKFwiQ29ubmVjdG9yIHBhc3NlZCBpbiBlbXB0eSBuYW1lXCIpO1xyXG5cdH1cclxuXHRcclxuXHRnZXRDb25uZWN0b3JLZXkoKVxyXG5cdHtcclxuXHRcdHJldHVybih0aGlzLmNvbm5lY3RvcktleSk7XHJcblx0fVxyXG5cclxuXHRnZXRDbGllbnRKc29uKClcclxuXHR7XHJcblx0XHR2YXIganNvbiA9IHt9O1xyXG5cdFx0anNvbi5jb25uZWN0b3JLZXkgPSB0aGlzLmdldENvbm5lY3RvcktleSgpO1xyXG5cdFx0anNvbi5jb25uZWN0b3JEaXNwbGF5ID0gdGhpcy5jb25uZWN0b3JEaXNwbGF5O1xyXG5cdFx0anNvbi5jb25uZWN0b3JEZWZLZXkgPSB0aGlzLmNvbm5lY3RvckRlZktleTtcclxuXHRcdGpzb24ubm9kZXMgPSBuZXcgQXJyYXkoKTtcclxuXHRcdGZvcih2YXIgaT0wO2k8dGhpcy5ub2Rlcy5saXN0O2krKylcclxuXHRcdHtcclxuXHRcdFx0anNvbi5ub2Rlcy5wdXNoKHRoaXMubm9kZXNbaV0uZ2V0Tm9kZUtleSgpKTtcclxuXHRcdH1cclxuXHRcdHJldHVybihqc29uKTtcclxuXHR9XHJcblx0XHJcblx0ZXhlY3V0ZUNvbm5lY3RvckZ1bmN0aW9uKHRpbWVzdGFtcCxub2RlKVxyXG5cdHtcclxuXHRcdHRoaXMuY29ubmVjdG9yRnVuY3Rpb24odGhpcyxub2RlLHRpbWVzdGFtcClcclxuXHR9XHJcblxyXG5cdGNvbnRhaW5zUG9zdGlvbihwb3NpdGlvbilcclxuXHR7XHJcblx0XHRjb25zb2xlLmxvZyhcIk5vZGU6Y29udGFpbnNQb3N0aW9uOlwiK3RoaXMubmFtZStcIjpkZWZhdWx0LCB3aWxsIGFsd2F5cyBmYWlsXCIpO1xyXG5cdFx0cmV0dXJuKGZhbHNlKTtcclxuXHR9XHJcblxyXG5cdGFkZE5vZGVMaXN0KG5vZGVMaXN0KVxyXG5cdHtcclxuXHRcdGZvcih2YXIgaT0wO2k8bm9kZUxpc3QubGVuZ3RoO2krKylcclxuXHRcdHtcclxuXHRcdFx0dGhpcy5hZGROb2RlKG5vZGVMaXN0W2ldKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGFkZE5vZGUobm9kZSlcclxuXHR7XHJcblx0XHR0aGlzLm5vZGVzLnB1c2gobm9kZSk7XHJcblx0XHRub2RlLmNvbm5lY3RvcnMucHVzaCh0aGlzKTtcclxuXHR9XHJcblxyXG5cdHJlbW92ZU5vZGUobm9kZSlcclxuXHR7XHJcblx0XHQvLyBjb25zb2xlLmxvZyhcIkNvbm5lY3RvciByZW1vdmVOb2RlIGJlZm9yZTpcIitcclxuXHRcdC8vIFwibm9kZT1cIitub2RlLm5hbWUrXHJcblx0XHQvLyBcIjp0aGlzLm5vZGVzPVwiK3RoaXMubm9kZXMubGVuZ3RoK1xyXG5cdFx0Ly8gXCI6bm9kZS5jb25uZWN0b3JzPVwiK25vZGUuY29ubmVjdG9ycy5sZW5ndGgrXHJcblx0XHQvLyBcIlwiKTtcclxuXHRcdENvbW1vbi5yZW1vdmVJdGVtRnJvbUFycmF5KHRoaXMubm9kZXMsbm9kZSk7XHJcblx0XHRDb21tb24ucmVtb3ZlSXRlbUZyb21BcnJheShub2RlLmNvbm5lY3RvcnMsdGhpcyk7XHJcblx0XHRcclxuXHRcdC8vIGNvbnNvbGUubG9nKFwiQ29ubmVjdG9yIHJlbW92ZU5vZGUgYWZ0ZXIgOlwiK1xyXG5cdFx0Ly8gXCJub2RlPVwiK25vZGUubmFtZStcclxuXHRcdC8vIFwiOnRoaXMubm9kZXM9XCIrdGhpcy5ub2Rlcy5sZW5ndGgrXHJcblx0XHQvLyBcIjpub2RlLmNvbm5lY3RvcnM9XCIrbm9kZS5jb25uZWN0b3JzLmxlbmd0aCtcclxuXHRcdC8vIFwiXCIpO1xyXG5cdH1cclxuXHJcblx0aW5pdFByb2Nlc3NvcigpXHJcblx0e1xyXG5cdFx0dmFyIHBvc2l0aW9uTGlzdCA9IG5ldyBBcnJheSgpO1xyXG5cdFx0aWYgKHRoaXMuc3ByaW5nQW5jaG9yUG9pbnQgIT0gbnVsbClcclxuXHRcdHtcclxuXHRcdFx0aWYgKHRoaXMuYW5jaG9yT2Zmc2V0UG9pbnQgPT0gbnVsbClcclxuXHRcdFx0e1xyXG5cdFx0XHRcdHBvc2l0aW9uTGlzdC5wdXNoKHRoaXMuc3ByaW5nQW5jaG9yUG9pbnQpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2VcclxuXHRcdFx0e1xyXG5cdFx0XHRcdHBvc2l0aW9uTGlzdC5wdXNoKHRoaXMuc3ByaW5nQW5jaG9yUG9pbnQuY3JlYXRlQnlBZGRpbmcodGhpcy5hbmNob3JPZmZzZXRQb2ludCkpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRyZXR1cm4ocG9zaXRpb25MaXN0KTtcclxuXHR9XHJcblxyXG5cdGNhbHVsYXRlTW92ZW1lbnRFeHAobm9kZSxwb3NpdGlvbkxpc3QscmFuZG9tU3RyZW5ndGhGYWN0b3IscmVsYXhlZERpc3RhbmNlLGVsYXN0aWNpdHlGYWN0b3IpXHJcblx0e1xyXG5cdFx0aWYgKHBvc2l0aW9uTGlzdC5sZW5ndGg+MClcclxuXHRcdHtcclxuXHRcdFx0Ly8gbG9vayBhdCBlYWNoIHBvc2l0aW9uIGFuZCBtYWtlIGEgbmV3IGxpc3Qgb2YgcG9zaXRpb25zIHRoZVxyXG5cdFx0XHQvLyBcInJlbGF4ZWRcIiBkaXN0YW5jZSBhd2F5XHJcblx0XHRcdHZhciBhbmltYXRlTGlzdCA9IG5ldyBBcnJheSgpO1xyXG5cdFx0XHR2YXIgeCA9IDAuMDtcclxuXHRcdFx0dmFyIHkgPSAwLjA7XHJcblx0XHRcdGZvcih2YXIgaT0wO2k8cG9zaXRpb25MaXN0Lmxlbmd0aDtpKyspXHJcblx0XHRcdHtcclxuXHRcdFx0XHR2YXIgcG9zaXRpb24gPSBub2RlLnBvc2l0aW9uLmdldERpc3RhbmNlT25MaW5lUG9pbnRBcnJheUNsb3Nlc3QoXHJcblx0XHRcdFx0XHRcdHBvc2l0aW9uTGlzdFtpXSxcclxuXHRcdFx0XHRcdFx0cmVsYXhlZERpc3RhbmNlKyhyYW5kb21TdHJlbmd0aEZhY3Rvci8yLXJhbmRvbVN0cmVuZ3RoRmFjdG9yKk1hdGgucmFuZG9tKCkpXHJcblx0XHRcdFx0XHRcdCk7XHJcblx0XHRcdFx0eCArPSBwb3NpdGlvbi5nZXRYKCkrKHJhbmRvbVN0cmVuZ3RoRmFjdG9yLzItcmFuZG9tU3RyZW5ndGhGYWN0b3IqTWF0aC5yYW5kb20oKSk7XHJcblx0XHRcdFx0eSArPSBwb3NpdGlvbi5nZXRZKCkrKHJhbmRvbVN0cmVuZ3RoRmFjdG9yLzItcmFuZG9tU3RyZW5ndGhGYWN0b3IqTWF0aC5yYW5kb20oKSk7XHRcdFxyXG5cdFx0XHRcdGFuaW1hdGVMaXN0LnB1c2gocG9zaXRpb24pO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHQvLyBmaW5kIHRoZSBhdmVyYWdlIFwicmVsYXhlZFwiIHBvc2l0aW9uXHJcblx0XHRcdHZhciBhdmVyYWdlUG9zaXRpb24gPSBuZXcgUG9zaXRpb24oeCAvIHBvc2l0aW9uTGlzdC5sZW5ndGgseSAvIHBvc2l0aW9uTGlzdC5sZW5ndGgpO1xyXG5cdFx0XHR2YXIgZGlzdGFuY2VUb0F2ZXJhZ2VQb3NpdGlvbiA9IG5vZGUucG9zaXRpb24uZ2V0RGlzdGFuY2UoYXZlcmFnZVBvc2l0aW9uKTtcclxuXHJcblx0XHRcdC8vIHRha2UgdGhlIGF2ZXJhZ2UgcG9zaXRpb24gYW5kIG1vdmUgdG93YXJkcyBpdCBiYXNlZCB1cG9uIHRoZVxyXG5cdFx0XHQvLyBlbGFzdGljaXR5IGZhY3RvclxyXG5cdFx0XHR2YXIgbW92ZVBvc2l0aW9uID0gYXZlcmFnZVBvc2l0aW9uLmdldERpc3RhbmNlT25MaW5lUG9pbnRBcnJheUNsb3Nlc3QoXHJcblx0XHRcdFx0XHRub2RlLnBvc2l0aW9uLFxyXG5cdFx0XHRcdFx0ZGlzdGFuY2VUb0F2ZXJhZ2VQb3NpdGlvbiAqIGVsYXN0aWNpdHlGYWN0b3JcclxuXHRcdFx0XHRcdCk7XHJcblxyXG5cdFx0XHQvLyBhZGQgdGhpcyBwb3NpdGlvbiB0byB0aGUgbGlzdCBvZiBwb2ludHMgdGhpcyBub2RlIG5lZWRzIHRvIG1vdmVcclxuXHRcdFx0Ly8gdG9cclxuXHRcdFx0bm9kZS5wb3NpdGlvbk1vdmVMaXN0LnB1c2gobW92ZVBvc2l0aW9uKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGNhbHVsYXRlTW92ZW1lbnQobm9kZSxwb3NpdGlvbkxpc3QscmFuZG9tU3RyZW5ndGhGYWN0b3IpXHJcblx0e1xyXG5cdFx0aWYgKHBvc2l0aW9uTGlzdC5sZW5ndGg+MClcclxuXHRcdHtcclxuXHRcdFx0Ly8gbG9vayBhdCBlYWNoIHBvc2l0aW9uIGFuZCBtYWtlIGEgbmV3IGxpc3Qgb2YgcG9zaXRpb25zIHRoZVxyXG5cdFx0XHQvLyBcInJlbGF4ZWRcIiBkaXN0YW5jZSBhd2F5XHJcblx0XHRcdHZhciBhbmltYXRlTGlzdCA9IG5ldyBBcnJheSgpO1xyXG5cdFx0XHR2YXIgeCA9IDAuMDtcclxuXHRcdFx0dmFyIHkgPSAwLjA7XHJcblx0XHRcdGZvcih2YXIgaT0wO2k8cG9zaXRpb25MaXN0Lmxlbmd0aDtpKyspXHJcblx0XHRcdHtcclxuXHRcdFx0XHR2YXIgcG9zaXRpb24gPSBub2RlLnBvc2l0aW9uLmdldERpc3RhbmNlT25MaW5lUG9pbnRBcnJheUNsb3Nlc3QoXHJcblx0XHRcdFx0XHRcdHBvc2l0aW9uTGlzdFtpXSxcclxuXHRcdFx0XHRcdFx0dGhpcy5yZWxheGVkRGlzdGFuY2UrcmFuZG9tU3RyZW5ndGhGYWN0b3IqTWF0aC5yYW5kb20oKVxyXG5cdFx0XHRcdFx0XHQpO1xyXG5cdFx0XHRcdHggKz0gcG9zaXRpb24uZ2V0WCgpO1xyXG5cdFx0XHRcdHkgKz0gcG9zaXRpb24uZ2V0WSgpO1x0XHRcclxuXHRcdFx0XHRhbmltYXRlTGlzdC5wdXNoKHBvc2l0aW9uKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0Ly8gZmluZCB0aGUgYXZlcmFnZSBcInJlbGF4ZWRcIiBwb3NpdGlvblxyXG5cdFx0XHR2YXIgYXZlcmFnZVBvc2l0aW9uID0gbmV3IFBvc2l0aW9uKHggLyBwb3NpdGlvbkxpc3QubGVuZ3RoLHkgLyBwb3NpdGlvbkxpc3QubGVuZ3RoKTtcclxuXHRcdFx0dmFyIGRpc3RhbmNlVG9BdmVyYWdlUG9zaXRpb24gPSBub2RlLnBvc2l0aW9uLmdldERpc3RhbmNlKGF2ZXJhZ2VQb3NpdGlvbik7XHJcblxyXG5cdFx0XHQvLyB0YWtlIHRoZSBhdmVyYWdlIHBvc2l0aW9uIGFuZCBtb3ZlIHRvd2FyZHMgaXQgYmFzZWQgdXBvbiB0aGVcclxuXHRcdFx0Ly8gZWxhc3RpY2l0eSBmYWN0b3JcclxuXHRcdFx0dmFyIG1vdmVQb3NpdGlvbiA9IGF2ZXJhZ2VQb3NpdGlvbi5nZXREaXN0YW5jZU9uTGluZVBvaW50QXJyYXlDbG9zZXN0KFxyXG5cdFx0XHRcdFx0bm9kZS5wb3NpdGlvbixcclxuXHRcdFx0XHRcdGRpc3RhbmNlVG9BdmVyYWdlUG9zaXRpb24gKiB0aGlzLmVsYXN0aWNpdHlGYWN0b3JcclxuXHRcdFx0XHRcdCk7XHJcblxyXG5cdFx0XHQvLyBhZGQgdGhpcyBwb3NpdGlvbiB0byB0aGUgbGlzdCBvZiBwb2ludHMgdGhpcyBub2RlIG5lZWRzIHRvIG1vdmVcclxuXHRcdFx0Ly8gdG9cclxuXHRcdFx0bm9kZS5wb3NpdGlvbk1vdmVMaXN0LnB1c2gobW92ZVBvc2l0aW9uKTtcclxuXHRcdH1cclxuXHR9XHJcbn1cclxuXHJcbi8vIDxqczJub2RlPlxyXG5tb2R1bGUuZXhwb3J0cyA9IENvbm5lY3RvcjtcclxuY29uc29sZS5sb2coXCJMb2FkaW5nOkNvbm5lY3RvclwiKTtcclxuLy8gPC9qczJub2RlPlxyXG4iLCJ2YXIgUG9zaXRpb24gPSByZXF1aXJlKCcuLi8uLi9ub2Rlcy9wb3NpdGlvbi9wb3NpdGlvbicpO1xyXG52YXIgQ29ubmVjdG9yID0gcmVxdWlyZSgnLi4vLi4vbm9kZXMvY29ubmVjdG9yL2Nvbm5lY3RvcicpO1xyXG52YXIgQ29tbW9uID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL2NvbW1vbicpO1xyXG5cclxuY2xhc3MgR3JvdXBDb25uZWN0b3IgZXh0ZW5kcyBDb25uZWN0b3Jcclxue1xyXG5cdGNvbnN0cnVjdG9yKGNvbm5lY3RvckRpc3BsYXksc3ByaW5nQW5jaG9yUG9pbnQsYW5jaG9yT2Zmc2V0UG9pbnQscmVsYXhlZERpc3RhbmNlLGVsYXN0aWNpdHlGYWN0b3IsbmFtZSlcclxuXHR7XHJcblx0XHRzdXBlcihHcm91cENvbm5lY3Rvci5wcm9jZXNzR3JvdXBTcHJpbmdDb25uZWN0b3JPbmVOb2RlVG9Db25uZWN0ZWROb2Rlcyxjb25uZWN0b3JEaXNwbGF5LG5hbWUpO1xyXG5cclxuXHRcdHRoaXMuc3ByaW5nQW5jaG9yUG9pbnQgPSBzcHJpbmdBbmNob3JQb2ludDtcclxuXHRcdHRoaXMuYW5jaG9yT2Zmc2V0UG9pbnQgPSBhbmNob3JPZmZzZXRQb2ludDtcclxuXHRcdHRoaXMucmVsYXhlZERpc3RhbmNlID0gcmVsYXhlZERpc3RhbmNlO1xyXG5cdFx0dGhpcy5lbGFzdGljaXR5RmFjdG9yID0gZWxhc3RpY2l0eUZhY3RvcjtcclxuXHR9XHJcblx0XHJcblx0c3RhdGljIHByb2Nlc3NHcm91cFNwcmluZ0Nvbm5lY3Rvck9uZU5vZGVUb0Nvbm5lY3RlZE5vZGVzKGNvbm5lY3Rvcixub2RlLHRpbWVzdGFtcClcclxuXHR7XHJcblx0XHR2YXIgcG9zaXRpb25MaXN0ID0gY29ubmVjdG9yLmluaXRQcm9jZXNzb3IoKTtcclxuXHRcdGZvcih2YXIgaT0wO2k8Y29ubmVjdG9yLm5vZGVzLmxlbmd0aDtpKyspXHJcblx0XHR7XHJcblx0XHRcdHZhciBiID0gY29ubmVjdG9yLm5vZGVzW2ldO1xyXG5cdFx0XHR2YXIgZGlzdGFuY2UgPSBub2RlLnBvc2l0aW9uLmdldERpc3RhbmNlKGIucG9zaXRpb24pO1xyXG5cdFx0XHRpZiAoYiAhPSBub2RlICYmIGRpc3RhbmNlPGNvbm5lY3Rvci5yZWxheGVkRGlzdGFuY2UpIHBvc2l0aW9uTGlzdC5wdXNoKGIucG9zaXRpb24pO1x0XHRcclxuXHRcdH1cclxuXHRcdGNvbm5lY3Rvci5jYWx1bGF0ZU1vdmVtZW50KG5vZGUscG9zaXRpb25MaXN0LDApO1xyXG5cdH1cclxuXHJcblx0cHJvY2Vzc1dhbGxTcHJpbmdSZXB1bHNlT25lTm9kZShjb25uZWN0b3Isbm9kZSx0aW1lc3RhbXApXHJcblx0e1xyXG5cdFx0dmFyIHBvc2l0aW9uTGlzdCA9IGNvbm5lY3Rvci5pbml0UHJvY2Vzc29yKCk7XHJcblx0XHRmb3IodmFyIGk9MDtpPGNvbm5lY3Rvci5ub2Rlcy5sZW5ndGg7aSsrKVxyXG5cdFx0e1xyXG5cdFx0XHR2YXIgYiA9IGNvbm5lY3Rvci5ub2Rlc1tpXTtcclxuXHRcdFx0dmFyIGRpc3RhbmNlID0gbm9kZS5wb3NpdGlvbi5nZXREaXN0YW5jZShiLnBvc2l0aW9uKTtcclxuXHRcdFx0aWYgKGIgIT0gbm9kZSAmJiBkaXN0YW5jZTxjb25uZWN0b3IucmVsYXhlZERpc3RhbmNlKSBwb3NpdGlvbkxpc3QucHVzaChiLnBvc2l0aW9uKTtcdFx0XHJcblx0XHR9XHJcblx0XHRjb25uZWN0b3IuY2FsdWxhdGVNb3ZlbWVudChub2RlLHBvc2l0aW9uTGlzdCwwKTtcclxuXHR9XHJcbn1cclxuXHJcbi8vPGpzMm5vZGU+XHJcbm1vZHVsZS5leHBvcnRzID0gR3JvdXBDb25uZWN0b3I7XHJcbmNvbnNvbGUubG9nKFwiTG9hZGluZzpHcm91cENvbm5lY3RvclwiKTtcclxuLy88L2pzMm5vZGU+XHJcbiIsInZhciBQb3NpdGlvbiA9IHJlcXVpcmUoJy4uLy4uL25vZGVzL3Bvc2l0aW9uL3Bvc2l0aW9uJyk7XHJcbnZhciBDb25uZWN0b3IgPSByZXF1aXJlKCcuLi8uLi9ub2Rlcy9jb25uZWN0b3IvY29ubmVjdG9yJyk7XHJcbnZhciBDb21tb24gPSByZXF1aXJlKCcuLi8uLi9jb21tb24vY29tbW9uJyk7XHJcblxyXG5jbGFzcyBTaGFwZUNvbm5lY3RvciBleHRlbmRzIENvbm5lY3RvclxyXG57XHJcblx0Y29uc3RydWN0b3Iobm9kZSxjb25uZWN0b3JEaXNwbGF5LHNoYXBlLGFuY2hvck9mZnNldFBvaW50LHJlbGF4ZWREaXN0YW5jZSxlbGFzdGljaXR5RmFjdG9yLG91dHNpZGVSZWxheGVkRGlzdGFuY2Usb3V0c2lkZUVsYXN0aWNpdHlGYWN0b3IsbmFtZSlcclxuXHR7XHJcblx0XHRzdXBlcihTaGFwZUNvbm5lY3Rvci5wcm9jZXNzU2hhcGVDb25uZWN0b3JPbmVOb2RlVG9Db25uZWN0ZWROb2Rlcyxjb25uZWN0b3JEaXNwbGF5LG5hbWUpO1xyXG5cclxuXHRcdHRoaXMubm9kZSA9IG5vZGU7XHJcblx0XHR0aGlzLnNwcmluZ0FuY2hvclBvaW50ID0gbm9kZS5wb3NpdGlvbjtcclxuXHRcdHRoaXMuYW5jaG9yT2Zmc2V0UG9pbnQgPSBhbmNob3JPZmZzZXRQb2ludDtcclxuXHRcdHRoaXMucmVsYXhlZERpc3RhbmNlID0gcmVsYXhlZERpc3RhbmNlO1xyXG5cdFx0dGhpcy5lbGFzdGljaXR5RmFjdG9yID0gZWxhc3RpY2l0eUZhY3RvcjtcclxuXHRcdHRoaXMub3V0c2lkZVJlbGF4ZWREaXN0YW5jZSA9IG91dHNpZGVSZWxheGVkRGlzdGFuY2U7XHJcblx0XHR0aGlzLm91dHNpZGVFbGFzdGljaXR5RmFjdG9yID0gb3V0c2lkZUVsYXN0aWNpdHlGYWN0b3I7XHJcblx0XHR0aGlzLnNoYXBlID0gc2hhcGU7XHJcblx0fVxyXG5cdFxyXG5cdHN0YXRpYyBwcm9jZXNzU2hhcGVDb25uZWN0b3JPbmVOb2RlVG9Db25uZWN0ZWROb2Rlcyhjb25uZWN0b3Isbm9kZSx0aW1lc3RhbXApXHJcblx0e1xyXG5cdC8vXHR2YXIgcG9zaXRpb25MaXN0ID0gY29ubmVjdG9yLmluaXRQcm9jZXNzb3IoKTtcclxuXHRcdHZhciBwb3NpdGlvbkxpc3QgPSBuZXcgQXJyYXkoKTtcclxuXHRcclxuXHRcdFxyXG5cdFx0aWYoIXRoaXMuc2hhcGUuY29udGFpbnNQb3NpdGlvbihub2RlLnBvc2l0aW9uLHRoaXMubm9kZSkpXHJcblx0XHR7XHJcblx0XHRcdC8qKioqKioqKioqKipcclxuXHRcdFx0dmFyIG9uU2hhcGVMaW5lUG9zaXRpb24gPSB0aGlzLnNoYXBlLmZpbmRDbG9zZXN0UG9pbnRJblNoYXBlRnJvbVN0YXJ0aW5nUG9pbnQobm9kZS5wb3NpdGlvbix0aGlzLm5vZGUpO1xyXG5cdFx0XHRwb3NpdGlvbkxpc3QucHVzaChvblNoYXBlTGluZVBvc2l0aW9uKTtcclxuXHRcdFx0Y29ubmVjdG9yLmNhbHVsYXRlTW92ZW1lbnRFeHAobm9kZSxwb3NpdGlvbkxpc3QsMC4wLHRoaXMub3V0c2lkZVJlbGF4ZWREaXN0YW5jZSx0aGlzLm91dHNpZGVFbGFzdGljaXR5RmFjdG9yKTtcclxuXHRcdFx0KioqKioqKioqKioqKioqKi9cclxuXHRcdFx0dmFyIGF2ZXJhZ2VQb2ludFRyYW5zZm9ybWVkID0gdGhpcy5zaGFwZS5nZXRBdmVyYWdlUG9pbnRUcmFuc2Zvcm1lZCh0aGlzLm5vZGUpXHJcblx0XHRcdC8vcG9zaXRpb25MaXN0LnB1c2godGhpcy5ub2RlLnBvc2l0aW9uKTtcclxuXHRcdFx0cG9zaXRpb25MaXN0LnB1c2goYXZlcmFnZVBvaW50VHJhbnNmb3JtZWQpO1xyXG5cdFx0XHRcclxuXHRcdFx0dmFyIG91dHNpZGVSZWxheERpc3RhbmNlID0gdGhpcy5vdXRzaWRlUmVsYXhlZERpc3RhbmNlO1xyXG5cdFx0XHR2YXIgb3V0c2lkZUVsYXN0aWNpdHlGYWN0b3IgPSB0aGlzLm91dHNpZGVFbGFzdGljaXR5RmFjdG9yO1xyXG5cdFx0XHRvdXRzaWRlRWxhc3RpY2l0eUZhY3RvciA9IDAuMDI1O1xyXG5cdFx0XHRpZihkaXN0YW5jZT5vdXRzaWRlUmVsYXhEaXN0YW5jZSoxLjI1KSBcclxuXHRcdFx0e1xyXG5cdFx0XHRcdGNvbnNvbGUubG9nKFwiaXRzIG91dHNpZGUhITpub2RlPVwiK25vZGUubmFtZStcIiBkaXN0YW5jZT1cIitkaXN0YW5jZSk7XHJcblx0XHRcdFx0b3V0c2lkZUVsYXN0aWNpdHlGYWN0b3IgPSAwLjAxO1xyXG5cdFx0XHR9XHJcblx0XHRcdFx0IFxyXG5cdFx0XHRjb25uZWN0b3IuY2FsdWxhdGVNb3ZlbWVudEV4cChcclxuXHRcdFx0XHRub2RlLFxyXG5cdFx0XHRcdHBvc2l0aW9uTGlzdCxcclxuXHRcdFx0XHQwLjAsXHJcblx0XHRcdFx0b3V0c2lkZVJlbGF4RGlzdGFuY2UsXHJcblx0XHRcdFx0b3V0c2lkZUVsYXN0aWNpdHlGYWN0b3IpO1xyXG5cdFxyXG5cdFx0XHQvL2Nvbm5lY3Rvci5jYWx1bGF0ZU1vdmVtZW50RXhwKG5vZGUscG9zaXRpb25MaXN0LDAuMCwwLjAsMC41KTtcclxuXHRcdH1cclxuXHRcdGVsc2VcclxuXHRcdHtcclxuXHRcdFx0dmFyIHNoYXBlQXJlYSA9IHRoaXMuc2hhcGUuZ2V0U2hhcGVBcmVhKCk7XHJcblx0XHRcdHZhciBtaW5BcmVhUGVyTm9kZSA9IHNoYXBlQXJlYSAvIGNvbm5lY3Rvci5ub2Rlcy5sZW5ndGg7XHJcblx0XHRcdC8vdmFyIHNwYWNpbmcgPSBtaW5BcmVhUGVyTm9kZS8yOy8vTWF0aC5zcXJ0KG1pbkFyZWFQZXJOb2RlKTtcclxuXHRcdFx0dmFyIHNwYWNpbmcgPSBNYXRoLnNxcnQobWluQXJlYVBlck5vZGUpKjEuMDE7Ly8qMi4zO1xyXG5cdFx0XHRpZihzcGFjaW5nPT0wKSBzcGFjaW5nID0gMTtcclxuXHRcdFx0Ly92YXIgc3BhY2luZyA9IE1hdGguc3FydChtaW5BcmVhUGVyTm9kZSkqMS4zO1xyXG5cdFx0XHQvKlxyXG5cdFx0XHRpZihub2RlLmlzU2VsZWN0ZWQpXHJcblx0XHRcdHtcclxuXHRcdFx0XHRjb25zb2xlLmxvZyhcIm5vZGUgbmFtZTpcIitub2RlLm5hbWUpO1xyXG5cdFx0XHRcdGNvbnNvbGUubG9nKFwiXHRzaGFwZUFyZWE6XCIrc2hhcGVBcmVhKTtcclxuXHRcdFx0XHRjb25zb2xlLmxvZyhcIlx0bWluQXJlYVBlck5vZGU6XCIrbWluQXJlYVBlck5vZGUpO1xyXG5cdFx0XHRcdGNvbnNvbGUubG9nKFwiXHRzcGFjaW5nOlwiK3NwYWNpbmcpO1xyXG5cdFx0XHR9XHJcblx0XHRcdCovXHJcblx0XHJcblx0XHRcdHRoaXMucmVsYXhlZERpc3RhbmNlID0gc3BhY2luZztcclxuXHRcdFx0Zm9yKHZhciBpPTA7aTxjb25uZWN0b3Iubm9kZXMubGVuZ3RoO2krKylcclxuXHRcdFx0e1xyXG5cdFx0XHRcdHZhciBiID0gY29ubmVjdG9yLm5vZGVzW2ldO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdC8qXHJcblx0XHRcdFx0aWYobm9kZS5pc1NlbGVjdGVkKVxyXG5cdFx0XHRcdHtcclxuXHRcdFx0XHRcdHZhciBkID0gbm9kZS5wb3NpdGlvbi5nZXREaXN0YW5jZShiLnBvc2l0aW9uKTtcclxuXHRcclxuXHRcdFx0XHRcdGNvbnNvbGUubG9nKFwiXHRjaGVja2luZzpcIitiLm5hbWUrXCIgZGlzdGFuY2U9XCIrZCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdCovXHJcblx0XHRcdFx0aWYoYiAhPSBub2RlICYmIHRoaXMuc2hhcGUuY29udGFpbnNQb3NpdGlvbihiLnBvc2l0aW9uLHRoaXMubm9kZSkpXHJcblx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0dmFyIGRpc3RhbmNlID0gbm9kZS5wb3NpdGlvbi5nZXREaXN0YW5jZShiLnBvc2l0aW9uKTtcclxuXHRcdFx0XHRcdGlmIChkaXN0YW5jZTxzcGFjaW5nKVxyXG5cdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRwb3NpdGlvbkxpc3QucHVzaChiLnBvc2l0aW9uKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0Ly9pZihub2RlLmlzU2VsZWN0ZWQpIGNvbnNvbGUubG9nKFwiLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXCIpO1xyXG5cdFxyXG5cdFx0XHRjb25uZWN0b3IuY2FsdWxhdGVNb3ZlbWVudEV4cChub2RlLHBvc2l0aW9uTGlzdCwwLjAsdGhpcy5yZWxheGVkRGlzdGFuY2UsdGhpcy5lbGFzdGljaXR5RmFjdG9yKTtcclxuXHRcdFx0Ly8gbW92ZSBpdCB0byBhIG5ldyBzcGFjaW5nIGRpc3RhbmNlIChzdGlsbCBpbiB0aGUgc2hhcGUpXHJcblx0XHR9XHJcblx0XHRcclxuXHRcdC8vY29ubmVjdG9yLmNhbHVsYXRlTW92ZW1lbnQobm9kZSxwb3NpdGlvbkxpc3QsMCk7XHJcblx0XHJcblx0XHQvL2lmKHNoYXBlLmNvbnRhaW5zUG9zaXRpb24oKSlcclxuXHRcdC8vIGlmIGl0IGlzIG5vdCBpbnNpZGUgdGhlIHNoYXBlIG1vdmUgaW50byB0aGUgc2hhcGUgZmFzdCBhcyBwb3NzaWJsZVxyXG5cdFx0Ly8gICAgICAgIC4ueW91IGNhbiBjeWNsZSB0aHJvdWdoIHRoZSBzaWRlcyBhbmQgZmluZCB0aGUgY2xvc2V0IGludGVyc2VjdGlvbiBwb2ludC5cclxuXHRcdC8vICAgICAgICAuLnRoaXMgY2FuIHByb2JhYmx5IGJlIG9wdGltaXplZCBieSBsb29raW5nIGF0IGVhY2ggcG9pbnQgZmlyc3RcclxuXHRcdC8vIGlmIGl0IGlzIGluc2lkZSB0aGUgc2hhcGUgdGhlbiA6XHJcblx0XHQvLyAgICAgICAgLi5maW5kIGhlIGF2ZXJhZ2UgZGlzdGFuY2UgYmV0d2VlbiB0aGUgcG9pbnRzIChvbmx5IGNoZWNrIHRob3NlIHNvIGNsb3NlPyE/IT9fXHJcblx0XHQvLyAgICAgICAgaWYgaXRzIGRpc3RhbmNlIGlzIGdyZWF0IHRoYW4gdGhlIGF2ZXJhZ2UgdGhlbiBtb3ZlIGF3YXkgZm9yIHRoZSBDT04gb2YgdGhlIHNhbXBsaW5nXHJcblx0XHQvLyAgICAgICAgaWYgdGhlIGRpc3RhbmNlIGlzIGxlc3MgdGhhbiB0aGUgYXZlcmFnZSBoZW4gbW92ZSB0b3dhcmRzIHRoZSBDT00gb2YgdGhlIHNhbXBsaW5nXHJcblx0XHQvLyAgICAgIC4udGhlIGF2ZXJhZ2Ugc3BhY2UgYmUgYWJsZSB0byB0byBiZSBjYWxjdWxhdGVkIFxyXG5cdFx0Ly9cclxuXHRcdC8vICAgICAgZnVuY3Rpb24gdG8gZmluZCB0aGUgYXZlcmFnZSBkaXN0YW5jZSBiZXR3ZWVuIGEgbGlzdCBvZiBwb2ludHNcclxuXHRcdC8vLyAgICAgaWYgeW91IGxvb2sgYXQgdGhlIGFyZWEgeW91IHNob3VsZCBiZSBhYmxlIHRvIGRpdmUgaXQgYnkgdGhlIHNpemUgbyB0aGUgc2FtcGxpbmdcclxuXHRcdC8vICAgICAgdG8gZ2V0IHRoaXMgYXZlcmFnZS4uLi5cclxuXHRcdC8vXHRcdGlmIHdlIGxpbWl0ZWQgaXQgdG8gYSBwZSBzbGljZSBpdCBpcyBlYXN5Li4uIGEgc2xpY2Ugb2YgdGhlIHBpZSdzIGFyZWEgaXMgZWFzeSB0byBjYWxjdWxhdGVcclxuXHRcdC8vXHJcblx0XHQvL1x0XHRmb3IgYSBjbG9zZWQgbGlzdCBvZiBwb2x5Z29ucyBpdCBpcyBhIHN1bSBvZiB0cmlhbmdsZXMuLi4gc2hvdWxkIGNpcmNsZXNcclxuXHRcdC8vIFx0XHRiZSBhIHNwZWNpYWwgY2FzZT9cclxuXHRcdC8qXHJcblx0XHRmb3IodmFyIGk9MDtpPGNvbm5lY3Rvci5ub2Rlcy5sZW5ndGg7aSsrKVxyXG5cdFx0e1xyXG5cdFx0XHR2YXIgYiA9IGNvbm5lY3Rvci5ub2Rlc1tpXTtcclxuXHRcdFx0aWYgKGIgIT0gbm9kZSAmJiBkaXN0YW5jZTxjb25uZWN0b3IucmVsYXhlZERpc3RhbmNlKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0cG9zaXRpb25MaXN0LnB1c2goYi5wb3NpdGlvbik7XHRcdFxyXG5cdFx0XHR9XHJcblx0XHJcblx0XHRcdFxyXG5cdFx0XHR2YXIgZGlzdGFuY2UgPSBub2RlLnBvc2l0aW9uLmdldERpc3RhbmNlKGIucG9zaXRpb24pO1xyXG5cdFx0XHRpZiAoYiAhPSBub2RlICYmIGRpc3RhbmNlPGNvbm5lY3Rvci5yZWxheGVkRGlzdGFuY2UpIHBvc2l0aW9uTGlzdC5wdXNoKGIucG9zaXRpb24pO1x0XHRcclxuXHRcdH1cclxuXHRcdGNvbm5lY3Rvci5jYWx1bGF0ZU1vdmVtZW50KG5vZGUscG9zaXRpb25MaXN0LDApO1xyXG5cdFx0Ki9cclxuXHR9XHJcblxyXG5cdHByb2Nlc3NXYWxsU3ByaW5nUmVwdWxzZU9uZU5vZGUoY29ubmVjdG9yLG5vZGUsdGltZXN0YW1wKVxyXG5cdHtcclxuXHRcdHZhciBwb3NpdGlvbkxpc3QgPSBjb25uZWN0b3IuaW5pdFByb2Nlc3NvcigpO1xyXG5cdFx0Zm9yKHZhciBpPTA7aTxjb25uZWN0b3Iubm9kZXMubGVuZ3RoO2krKylcclxuXHRcdHtcclxuXHRcdFx0dmFyIGIgPSBjb25uZWN0b3Iubm9kZXNbaV07XHJcblx0XHRcdHZhciBkaXN0YW5jZSA9IG5vZGUucG9zaXRpb24uZ2V0RGlzdGFuY2UoYi5wb3NpdGlvbik7XHJcblx0XHRcdGlmIChiICE9IG5vZGUgJiYgZGlzdGFuY2U8Y29ubmVjdG9yLnJlbGF4ZWREaXN0YW5jZSkgcG9zaXRpb25MaXN0LnB1c2goYi5wb3NpdGlvbik7XHRcdFxyXG5cdFx0fVxyXG5cdFx0Y29ubmVjdG9yLmNhbHVsYXRlTW92ZW1lbnQobm9kZSxwb3NpdGlvbkxpc3QsMCk7XHJcblx0fVxyXG59XHJcblxyXG4vLzxqczJub2RlPlxyXG5tb2R1bGUuZXhwb3J0cyA9IFNoYXBlQ29ubmVjdG9yO1xyXG5jb25zb2xlLmxvZyhcIkxvYWRpbmc6U2hhcGVDb25uZWN0b3JcIik7XHJcbi8vPC9qczJub2RlPlxyXG4iLCJ2YXIgUG9zaXRpb24gPSByZXF1aXJlKCcuLi8uLi9ub2Rlcy9wb3NpdGlvbi9wb3NpdGlvbicpO1xyXG52YXIgQ29ubmVjdG9yID0gcmVxdWlyZSgnLi4vLi4vbm9kZXMvY29ubmVjdG9yL2Nvbm5lY3RvcicpO1xyXG52YXIgQ29tbW9uID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL2NvbW1vbicpO1xyXG5cclxuY2xhc3MgU3ByaW5nQ29ubmVjdG9yIGV4dGVuZHMgQ29ubmVjdG9yXHJcbntcclxuXHRjb25zdHJ1Y3Rvcihjb25uZWN0b3JEaXNwbGF5LHNwcmluZ0FuY2hvclBvaW50LGFuY2hvck9mZnNldFBvaW50LHJlbGF4ZWREaXN0YW5jZSxlbGFzdGljaXR5RmFjdG9yLG5hbWUpXHJcblx0e1xyXG5cdFx0c3VwZXIoU3ByaW5nQ29ubmVjdG9yLnByb2Nlc3NTcHJpbmdDb25uZWN0b3JPbmVCZWFzdGllVG9Db25uZWN0ZWROb2Rlcyxjb25uZWN0b3JEaXNwbGF5LG5hbWUpO1xyXG5cdFx0dGhpcy5zcHJpbmdBbmNob3JQb2ludCA9IHNwcmluZ0FuY2hvclBvaW50O1xyXG5cdFx0dGhpcy5hbmNob3JPZmZzZXRQb2ludCA9IGFuY2hvck9mZnNldFBvaW50O1xyXG5cdFx0dGhpcy5yZWxheGVkRGlzdGFuY2UgPSByZWxheGVkRGlzdGFuY2U7XHJcblx0XHR0aGlzLmVsYXN0aWNpdHlGYWN0b3IgPSBlbGFzdGljaXR5RmFjdG9yO1xyXG5cdH1cclxuXHJcblx0c3RhdGljIHByb2Nlc3NTcHJpbmdDb25uZWN0b3JPbmVCZWFzdGllVG9Db25uZWN0ZWROb2Rlcyhjb25uZWN0b3Isbm9kZSx0aW1lc3RhbXApXHJcblx0e1xyXG5cdFx0dmFyIHBvc2l0aW9uTGlzdCA9IGNvbm5lY3Rvci5pbml0UHJvY2Vzc29yKCk7XHJcblx0XHQvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy92YXIgcG9zaXRpb25MaXN0ID0gbmV3IEFycmF5KCk7XHJcblx0XHRmb3IodmFyIGk9MDtpPGNvbm5lY3Rvci5ub2Rlcy5sZW5ndGg7aSsrKVxyXG5cdFx0e1xyXG5cdFx0XHR2YXIgYiA9IGNvbm5lY3Rvci5ub2Rlc1tpXTtcclxuXHRcdFx0dmFyIGRpc3RhbmNlID0gbm9kZS5wb3NpdGlvbi5nZXREaXN0YW5jZShiLnBvc2l0aW9uKTtcclxuXHRcdFx0aWYgKGIgIT0gbm9kZSkgcG9zaXRpb25MaXN0LnB1c2goYi5wb3NpdGlvbik7XHRcdFxyXG5cdFx0fVxyXG5cdFx0Y29ubmVjdG9yLmNhbHVsYXRlTW92ZW1lbnQobm9kZSxwb3NpdGlvbkxpc3QsMS4wKTtcclxuXHR9XHJcbn1cclxuXHJcbi8vPGpzMm5vZGU+XHJcbm1vZHVsZS5leHBvcnRzID0gU3ByaW5nQ29ubmVjdG9yO1xyXG5jb25zb2xlLmxvZyhcIkxvYWRpbmc6U3ByaW5nQ29ubmVjdG9yXCIpO1xyXG4vLzwvanMybm9kZT5cclxuIiwidmFyIFBvc2l0aW9uID0gcmVxdWlyZSgnLi4vLi4vbm9kZXMvcG9zaXRpb24vcG9zaXRpb24nKTtcclxudmFyIENvbm5lY3RvciA9IHJlcXVpcmUoJy4uLy4uL25vZGVzL2Nvbm5lY3Rvci9jb25uZWN0b3InKTtcclxudmFyIENvbW1vbiA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9jb21tb24nKTtcclxuXHJcbmNsYXNzICBXYWxsQ29ubmVjdG9yIGV4dGVuZHMgQ29ubmVjdG9yXHJcbntcclxuXHRjb25zdHJ1Y3Rvcihjb25uZWN0b3JEaXNwbGF5LHNwcmluZ0FuY2hvclBvaW50LGFuY2hvck9mZnNldFBvaW50LHJlbGF4ZWREaXN0YW5jZSxlbGFzdGljaXR5RmFjdG9yLG5hbWUpXHJcblx0e1xyXG5cdFx0Ly9zdXBlcihXYWxsQ29ubmVjdG9yLnByb3RvdHlwZS5wcm9jZXNzV2FsbFNwcmluZ1JlcHVsc2VPbmVOb2RlLGNvbm5lY3RvckRpc3BsYXkpO1xyXG5cdFx0c3VwZXIoV2FsbENvbm5lY3Rvci5wcm9jZXNzV2FsbFNwcmluZ1JlcHVsc2VPbmVOb2RlLGNvbm5lY3RvckRpc3BsYXksbmFtZSk7XHJcblxyXG5cdFx0dGhpcy5zcHJpbmdBbmNob3JQb2ludCA9IHNwcmluZ0FuY2hvclBvaW50O1xyXG5cdFx0dGhpcy5hbmNob3JPZmZzZXRQb2ludCA9IGFuY2hvck9mZnNldFBvaW50O1xyXG5cdFx0dGhpcy5yZWxheGVkRGlzdGFuY2UgPSByZWxheGVkRGlzdGFuY2U7XHJcblx0XHR0aGlzLmVsYXN0aWNpdHlGYWN0b3IgPSBlbGFzdGljaXR5RmFjdG9yO1xyXG5cdH1cclxuXHJcblx0c3RhdGljIHByb2Nlc3NXYWxsU3ByaW5nUmVwdWxzZU9uZU5vZGUoY29ubmVjdG9yLG5vZGUsdGltZXN0YW1wKVxyXG5cdHtcclxuXHRcdHZhciBwb3NpdGlvbkxpc3QgPSBjb25uZWN0b3IuaW5pdFByb2Nlc3NvcigpO1xyXG5cdFx0aWYoKG5vZGUucG9zaXRpb24uZ2V0WCgpLW5vZGUud2lkdGgvMik8MClcclxuXHRcdHtcclxuXHRcdFx0bm9kZS5wb3NpdGlvbi5zZXRYKDArbm9kZS53aWR0aC8yKTtcclxuXHRcdH1cclxuXHRcdGlmKChub2RlLnBvc2l0aW9uLmdldFgoKStub2RlLndpZHRoLzIpPm5vZGUuY2FudmFzSG9sZGVyLmdldFdpZHRoKCkpXHJcblx0XHR7XHJcblx0XHRcdG5vZGUucG9zaXRpb24uc2V0WChub2RlLmNhbnZhc0hvbGRlci5nZXRXaWR0aCgpLW5vZGUud2lkdGgvMik7XHRcclxuXHRcdH1cclxuXHRcdGlmKChub2RlLnBvc2l0aW9uLmdldFkoKS1ub2RlLmhlaWdodC8yKTwwKVxyXG5cdFx0e1xyXG5cdFx0XHRub2RlLnBvc2l0aW9uLnNldFkoMCtub2RlLmhlaWdodC8yKTtcclxuXHRcdH1cclxuXHRcdGlmKChub2RlLnBvc2l0aW9uLmdldFkoKStub2RlLmhlaWdodC8yKT5ub2RlLmNhbnZhc0hvbGRlci5nZXRIZWlnaHQoKSlcclxuXHRcdHtcclxuXHRcdFx0bm9kZS5wb3NpdGlvbi5zZXRZKG5vZGUuY2FudmFzSG9sZGVyLmdldEhlaWdodCgpLW5vZGUuaGVpZ2h0LzIpO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRjb25uZWN0b3IuY2FsdWxhdGVNb3ZlbWVudChub2RlLHBvc2l0aW9uTGlzdCwwKTtcclxuXHR9XHJcbn1cclxuXHJcbi8vPGpzMm5vZGU+XHJcbm1vZHVsZS5leHBvcnRzID0gV2FsbENvbm5lY3RvcjtcclxuY29uc29sZS5sb2coXCJMb2FkaW5nOldhbGxDb25uZWN0b3JcIik7XHJcbi8vPC9qczJub2RlPlxyXG4iLCJjbGFzcyBDb25uZWN0b3JEaXNwbGF5XHJcbntcclxuXHRjb25zdHJ1Y3RvcihkaXNwbGF5SW5mbylcclxuXHR7XHJcblx0XHRDb25uZWN0b3JEaXNwbGF5LmNyZWF0ZUNvbm5lY3RvckRpc3BsYXkodGhpcyxkaXNwbGF5SW5mbyk7XHJcblx0fVxyXG5cclxuXHRzdGF0aWMgY3JlYXRlQ29ubmVjdG9yRGlzcGxheShjb25uZWN0b3JEaXNwbGF5LGRpc3BsYXlJbmZvKVxyXG5cdHtcclxuXHRcdGNvbm5lY3RvckRpc3BsYXkuZGlzcGxheUluZm8gPSBkaXNwbGF5SW5mbztcclxuXHR9XHJcblxyXG5cdGRyYXdDb25uZWN0b3IoY2FudmFzSG9sZGVyLGNvbm5lY3Rvcixub2RlKVxyXG5cdHtcclxuXHR9XHJcblxyXG5cdGNvbnRhaW5zUG9zdGlvbihwb3NpdGlvbixjb25uZWN0b3IpXHJcblx0e1xyXG5cdFx0cmV0dXJuKGZhbHNlKTtcclxuXHR9XHJcbn1cclxuXHJcbi8vPGpzMm5vZGU+XHJcbm1vZHVsZS5leHBvcnRzID0gQ29ubmVjdG9yRGlzcGxheTtcclxuY29uc29sZS5sb2coXCJMb2FkaW5nOkNvbm5lY3RvckRpc3BsYXlcIik7XHJcbi8vPC9qczJub2RlPlxyXG4iLCJ2YXIgQ29ubmVjdG9yRGlzcGxheSA9IHJlcXVpcmUoJy4uLy4uL25vZGVzL2Nvbm5lY3RvcmRpc3BsYXkvY29ubmVjdG9yZGlzcGxheScpO1xyXG5cclxuY2xhc3MgQ29ubmVjdG9yRGlzcGxheUVtcHR5IGV4dGVuZHMgQ29ubmVjdG9yRGlzcGxheVxyXG57XHJcblx0Y29uc3RydWN0b3IoZGlzcGxheUluZm8pIFxyXG5cdHtcclxuXHRcdHN1cGVyKGRpc3BsYXlJbmZvKTtcclxuXHR9XHJcblxyXG5cdGRyYXdDb25uZWN0b3IoY2FudmFzSG9sZGVyLGNvbm5lY3Rvcixub2RlKVxyXG5cdHtcclxuXHR9XHJcbn1cclxuLy88anMybm9kZT5cclxubW9kdWxlLmV4cG9ydHMgPSBDb25uZWN0b3JEaXNwbGF5RW1wdHk7XHJcbmNvbnNvbGUubG9nKFwiTG9hZGluZzpDb25uZWN0b3JEaXNwbGF5RW1wdHlcIik7XHJcbi8vPC9qczJub2RlPlxyXG4iLCJ2YXIgUG9zaXRpb24gPSByZXF1aXJlKCcuLi9ub2Rlcy9wb3NpdGlvbi9wb3NpdGlvbicpO1xyXG52YXIgQ2FudmFzSG9sZGVyPSByZXF1aXJlKCcuLi9ub2Rlcy9ub2RlY2FudmFzL2NhbnZhc2hvbGRlcicpO1xyXG52YXIgQ29tbW9uID0gcmVxdWlyZSgnLi4vY29tbW9uL2NvbW1vbicpO1xyXG5cclxuY2xhc3MgTm9kZVxyXG57XHJcbiAgY29uc3RydWN0b3IobmFtZSxwb3NpdGlvbixjYW52YXNIb2xkZXIsZ3JhcGhEYXRhS2V5LGluZm9EYXRhKVxyXG4gIHtcclxuXHRcdHRoaXMubmFtZSA9IG5hbWU7XHJcblx0XHR0aGlzLmNhbnZhc0hvbGRlciA9IGNhbnZhc0hvbGRlcjtcclxuXHRcdHRoaXMucG9zaXRpb24gPSBwb3NpdGlvbjtcclxuXHRcdHRoaXMuZ3JhcGhEYXRhS2V5ID0gZ3JhcGhEYXRhS2V5O1xyXG5cdFx0dGhpcy5ncmFwaERhdGEgPSB0aGlzLmNhbnZhc0hvbGRlci5nZXRHcmFwaERhdGEodGhpcy5ncmFwaERhdGFLZXkpO1xyXG5cdFx0aWYoaW5mb0RhdGE9PW51bGwpXHJcblx0XHR7XHJcblx0XHRcdGNvbnNvbGUubG9nKFwiaW5mbyBkYXRhIHdhcyBudWxsIDogXCIrdGhpcy5uYW1lKTtcclxuXHRcdFx0aW5mb0RhdGEgPSB7fTtcclxuXHRcdH1cclxuXHRcdGVsc2VcclxuXHRcdHtcclxuXHRcdFx0XHJcblx0XHRcdGNvbnNvbGUubG9nKFwiaW5mbyBkYXRhIHBhc3NlZCBpbiBmb3IgIDogXCIrdGhpcy5uYW1lICtcIiBpbmZvRGF0YT1cIitDb21tb24udG9TdHJpbmcoaW5mb0RhdGEpKTtcclxuXHRcdFx0Y29uc29sZS5sb2coXCJpbmZvIGRhdGEgcGFzc2VkIGluIGZvciAgOiBcIit0aGlzLm5hbWUpO1xyXG5cdFx0fVxyXG5cdFx0dGhpcy5pbmZvRGF0YSA9IGluZm9EYXRhO1xyXG5cdFx0XHJcblx0XHR0aGlzLm5vZGVzID0gbmV3IEFycmF5KCk7XHJcblx0XHR0aGlzLm5vZGVNYXAgPSB7fTtcclxuXHRcdHRoaXMucG9zaXRpb25Nb3ZlTGlzdCA9IG5ldyBBcnJheSgpO1xyXG5cdFx0dGhpcy5jb25uZWN0b3JzID0gbmV3IEFycmF5KCk7XHJcblx0XHR0aGlzLmlzQW5pbWF0ZWQgPSB0cnVlO1xyXG5cdFx0dGhpcy5pc1NlbGVjdGVkID0gZmFsc2U7XHJcblx0XHR0aGlzLmxheWVyPTA7XHJcblxyXG5cdFx0XHJcblx0XHQvL2lmKCF0aGlzLmluZm9EYXRhLm5vZGVLZXkpXHJcblx0XHRpZighdGhpcy5pbmZvRGF0YS5oYXNPd25Qcm9wZXJ0eShcIm5vZGVLZXlcIikpXHJcblx0XHR7XHJcblx0XHRcdGNvbnNvbGUubG9nKFwibWFraW5nIG5ldyBub2RlS2V5IGZvciA6IFwiK3RoaXMubmFtZSk7XHJcblx0XHRcdHRoaXMuaW5mb0RhdGEubm9kZUtleSA9XHJcblx0XHRcdHtcclxuXHRcdFx0XHRcdGtleTpDb21tb24uZ2V0VGltZUtleSgpLFxyXG5cdFx0XHRcdFx0bm9kZUlkOlwicm9vdFwiLFxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHR0aGlzLmluZm9EYXRhLm5vZGVLZXkucGFyZW50Tm9kZUtleSA9IGZ1bmN0aW9uKCl7cmV0dXJuKFwiXCIpO307XHJcblx0XHRcclxuXHRcdHRoaXMuY29ubmVjdG9yUG9zaXRpb24gPSBuZXcgUG9zaXRpb24oMCwwKTtcclxuXHJcblx0XHRpZih0aGlzLmdyYXBoRGF0YS5pbml0R3JhcGhEYXRhIT1udWxsKSB0aGlzLmdyYXBoRGF0YS5pbml0R3JhcGhEYXRhKHRoaXMpO1x0XHRcclxuICB9XHJcblxyXG4gIFxyXG4gIGdldENsaWVudEpzb24oKVxyXG4gIHtcclxuXHQgIHZhciBqc29uID0gdGhpcy5nZXROb2RlSnNvbih7fSk7XHJcblx0ICBcclxuXHQgIGpzb24ubm9kZVRyZWUgPSB0aGlzLmdldENsaWVudEpzb25Ob2RlVHJlZSgpO1xyXG5cdCAgXHJcblx0ICBqc29uLm5vZGVNYXAgPSB7fTtcclxuXHQgIHZhciBhbGxOb2Rlc0FycmF5ID0gdGhpcy5nZXRBbGxOb2Rlc0FycmF5KG5ldyBBcnJheSgpKTtcclxuXHQgIGZvcih2YXIgaT0wO2k8YWxsTm9kZXNBcnJheS5sZW5ndGg7aSsrKVxyXG5cdCAge1xyXG5cdFx0ICB2YXIgbm9kZSA9IGFsbE5vZGVzQXJyYXlbaV07XHJcblx0XHQgIGpzb24ubm9kZU1hcFtub2RlLmdldE5vZGVLZXkoKV0gPSBub2RlLmdldE5vZGVKc29uKHt9KTtcclxuXHQgIH1cclxuXHQgIFxyXG5cdCAganNvbi5jb25uZWN0b3JNYXAgPSB7fTtcclxuXHQgIHZhciBhbGxDb25uZWN0b3JzQXJyYXkgPSB0aGlzLmdldEFsbENvbm5lY3RvcnNBcnJheShuZXcgQXJyYXkoKSk7XHQgIFxyXG5cdCAgZm9yKHZhciBpPTA7aTxhbGxDb25uZWN0b3JzQXJyYXkubGVuZ3RoO2krKylcclxuXHQgIHtcclxuXHRcdCAgdmFyIGNvbm5lY3RvciA9IGFsbENvbm5lY3RvcnNBcnJheVtpXTtcclxuXHRcdCAganNvbi5jb25uZWN0b3JNYXBbY29ubmVjdG9yLmdldENvbm5lY3RvcktleSgpXSA9IGNvbm5lY3Rvci5nZXRDbGllbnRKc29uKHt9KTtcclxuXHQgIH1cclxuXHJcblx0ICBKU09OLnN0cmluZ2lmeShqc29uKTtcclxuXHQgIHJldHVybihqc29uKVxyXG4gIH1cclxuICBcclxuICBnZXROb2RlSnNvbihqc29uKVxyXG4gIHtcclxuXHQgIGpzb24ubmFtZSA9IHRoaXMubmFtZTtcclxuXHQgIGpzb24uZ3JhcGhEYXRhS2V5ID0gdGhpcy5ncmFwaERhdGFLZXk7XHJcblx0ICBqc29uLmluZm9EYXRhID0gdGhpcy5pbmZvRGF0YTtcclxuXHQgIC8vanNvbi5pbmZvRGF0YS5ub2RlS2V5ID0gdGhpcy5nZXROb2RlS2V5KCk7XHJcblx0ICBqc29uLnBvc2l0aW9uID0gdGhpcy5wb3NpdGlvbi5nZXRDbGllbnRKc29uKCk7XHJcblx0ICBqc29uLmNvbm5lY3RvcnMgPSBuZXcgQXJyYXkoKTtcclxuXHQgIGZvcih2YXIgaT0wO2k8dGhpcy5jb25uZWN0b3JzLmxlbmd0aDtpKyspIGpzb24uY29ubmVjdG9ycy5wdXNoKHRoaXMuY29ubmVjdG9yc1tpXS5nZXRDb25uZWN0b3JLZXkoKSk7XHJcblxyXG5cdCAgcmV0dXJuKGpzb24pO1xyXG4gIH1cclxuICBcclxuICBnZXRBbGxOb2Rlc0FycmF5KGFycmF5T2ZOb2RlcylcclxuICB7XHJcblx0ICBmb3IodmFyIGk9MDtpPHRoaXMubm9kZXMubGVuZ3RoO2krKylcclxuXHQgIHtcclxuXHRcdCAgdmFyIG5vZGUgPSB0aGlzLm5vZGVzW2ldO1xyXG5cdFx0ICBhcnJheU9mTm9kZXMucHVzaChub2RlKTtcclxuXHRcdCAgbm9kZS5nZXRBbGxOb2Rlc0FycmF5KGFycmF5T2ZOb2Rlcyk7XHJcblx0ICB9XHJcblx0ICByZXR1cm4oYXJyYXlPZk5vZGVzKTtcclxuICB9XHJcbiAgXHJcbiAgZ2V0QWxsQ29ubmVjdG9yc0FycmF5KGFycmF5T2ZDb25uZWN0b3JzKVxyXG4gIHtcclxuXHQgIGZvcih2YXIgaT0wO2k8dGhpcy5ub2Rlcy5sZW5ndGg7aSsrKVxyXG5cdCAge1xyXG5cdFx0ICB2YXIgbm9kZSA9IHRoaXMubm9kZXNbaV07XHJcblx0XHQgIGZvcih2YXIgaj0wO2o8bm9kZS5jb25uZWN0b3JzLmxlbmd0aDtqKyspXHJcblx0XHQgIHtcclxuXHRcdFx0ICB2YXIgY29ubmVjdG9yID0gbm9kZS5jb25uZWN0b3JzW2pdO1xyXG5cdFx0XHQgIGFycmF5T2ZDb25uZWN0b3JzLnB1c2goY29ubmVjdG9yKTtcclxuXHRcdCAgfVxyXG5cdFx0ICBub2RlLmdldEFsbENvbm5lY3RvcnNBcnJheShhcnJheU9mQ29ubmVjdG9ycyk7XHJcblx0ICB9XHJcblx0ICByZXR1cm4oYXJyYXlPZkNvbm5lY3RvcnMpO1xyXG4gIH1cclxuICBcclxuICAgIFxyXG4gIGdldENsaWVudEpzb25Ob2RlVHJlZSgpXHJcbiAge1xyXG5cdCAgdmFyIGpzb24gPSB7fTtcclxuXHQgIGpzb24ubm9kZUtleSA9IHRoaXMuZ2V0Tm9kZUtleSgpO1xyXG5cclxuXHQgIGpzb24ubm9kZXMgPSBuZXcgQXJyYXkoKTtcclxuXHQgIGZvcih2YXIgaT0wO2k8dGhpcy5ub2Rlcy5sZW5ndGg7aSsrKVxyXG5cdCAge1xyXG5cdFx0ICBqc29uLm5vZGVzLnB1c2godGhpcy5ub2Rlc1tpXS5nZXRDbGllbnRKc29uTm9kZVRyZWUoKSk7XHQgIFxyXG5cdCAgfVxyXG5cdCAgSlNPTi5zdHJpbmdpZnkoanNvbik7XHJcblx0ICByZXR1cm4oanNvbilcclxuICB9XHJcbiAgXHJcbiAgXHJcbiAgZHJhd0NhbnZhcyh0aW1lc3RhbXApXHJcbiAge1xyXG4gIFx0dGhpcy5zZXRBbmltYXRpb25UaW1lcygpO1xyXG5cclxuICBcdHRoaXMuY2xlYXJDYW52YXMoKTtcclxuICBcdFxyXG4gICAgICBmb3IodmFyIGk9MDtpPHRoaXMubm9kZXMubGVuZ3RoO2krKylcclxuICAgICAge1xyXG4gICAgICAgICAgdmFyIG5vZGUgPSB0aGlzLm5vZGVzW2ldO1xyXG4gICAgICAgICAgaWYodGhpcy5pc0FuaW1hdGVkKSBub2RlLmFuaW1hdGVDYWxjdWxhdGUodGltZXN0YW1wKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgZm9yKHZhciBpPTA7aTx0aGlzLm5vZGVzLmxlbmd0aDtpKyspXHJcbiAgICAgIHtcclxuICAgICAgXHR2YXIgbm9kZSA9IHRoaXMubm9kZXNbaV07XHJcbiAgICAgIFx0aWYodGhpcy5pc0FuaW1hdGVkKSAgbm9kZS5hbmltYXRlRmluYWxpemUodGltZXN0YW1wKTtcclxuICAgICAgXHRub2RlLmRyYXdDYW52YXModGltZXN0YW1wKTtcclxuICAgICAgfVxyXG4gICAgICBcclxuICAgICAgaWYodGhpcy5jYW52YXNIb2xkZXIuaXNEcmF3YWJsZSgpKVxyXG4gICAgICB7XHJcbiAgICBcdCAgdGhpcy5kcmF3Q29ubmVjdG9ycygpOyBcclxuICAgIFx0ICB0aGlzLmRyYXdOb2RlcygpO1xyXG4gICAgICB9XHJcbiAgICAgIGlmKHRoaXMuZXh0cmFBbmltYXRpb24hPW51bGwpIHRoaXMuZXh0cmFBbmltYXRpb24odGltZXN0YW1wKTtcclxuICAgICAgXHJcbiAgICAgIHRoaXMuZHJhdygpO1xyXG4gICAgICB0aGlzLmRlYnVnRnVuY3Rpb24oKTtcclxuICB9XHJcblxyXG5cclxuXHRnZXROb2RlVWlEaXNwbGF5KG5vZGUpXHJcblx0e1xyXG5cdFx0cmV0dXJuKHRoaXMubmFtZSk7XHJcblx0fVxyXG5cdFxyXG5cdGdldE5vZGVLZXkoKVxyXG5cdHtcclxuICAgXHQgICAgLy9jb25zb2xlLmxvZyhcIk5vZGU6Z2V0Tm9kZUtleTpTVEFSVDpuYW1lPVwiK3RoaXMubmFtZSk7XHJcbiAgIFx0ICAgIC8vY29uc29sZS5sb2coXCJOb2RlOmdldE5vZGVLZXk6U1RBUlQ6aW5mb0RhdGE9XCIrQ29tbW9uLnRvU3RyaW5nKHRoaXMuaW5mb0RhdGEpKTtcclxuXHJcblx0XHQvL2lmKCF0aGlzLm5vZGVLZXkpIGNvbnNvbGUubG9nKFwiWFhYWFhYWFhYWFg6XCIrdGhpcy5uYW1lKTtcclxuICAgXHQgICAgLy92YXIga2V5ID0gdGhpcy5ub2RlS2V5LnBhcmVudE5vZGVLZXkoKStcIjpcIit0aGlzLm5vZGVLZXkubm9kZUlkK1wiOlwiK3RoaXMubm9kZUtleS50cy5nZXRUaW1lKCk7XHJcbiAgIFx0ICAgIC8vY29uc29sZS5sb2coXCIuLi4uLmdldE5vZGVLZXk6RU5EOm5hbWU9XCIrdGhpcy5uYW1lKTtcclxuICAgXHQgICAgdmFyIGtleSA9IHRoaXMuaW5mb0RhdGEubm9kZUtleS5wYXJlbnROb2RlS2V5KCkrXCI6XCIrdGhpcy5pbmZvRGF0YS5ub2RlS2V5Lm5vZGVJZCtcIl9cIit0aGlzLmluZm9EYXRhLm5vZGVLZXkua2V5O1xyXG5cdFx0cmV0dXJuKGtleSk7XHJcblx0XHRcclxuXHR9XHJcblx0LypcclxuXHQgKiBcdFx0dGhpcy5ub2RlS2V5ID0gXHJcblx0XHRcdHtcclxuXHRcdFx0XHR0czpuZXcgRGF0ZSgpLFxyXG5cdFx0XHRcdHBhcmVudE5vZGVLZXk6ZnVuY3Rpb24oKXtyZXR1cm4oXCJyb290XCIpO30sXHJcblx0XHRcdFx0bm9kZUlkOi0xLFxyXG5cdFx0XHR9XHJcblx0ICovXHJcblx0XHJcblx0ZG9lc05vZGVFeGlzdChub2RlS2V5KVxyXG5cdHtcclxuXHRcdHJldHVybiggdGhpcy5ub2RlTWFwLmhhc093blByb3BlcnR5KG5vZGVLZXkpICk7XHJcblx0fVxyXG5cdFxyXG5cdGdldE5vZGUobm9kZUtleSlcclxuXHR7XHJcblx0XHRpZighdGhpcy5kb2VzTm9kZUV4aXN0KG5vZGVLZXkpKVxyXG5cdFx0e1xyXG5cdFx0XHRPYmplY3Qua2V5cyh0aGlzLm5vZGVNYXApLmZvckVhY2goZnVuY3Rpb24gKGtleSlcclxuXHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0Y29uc29sZS5sb2coXCJrZXk9XCIra2V5KVxyXG5cdFx0XHRcdFx0fSk7XHJcblx0XHRcdHRocm93IFwibm9kZUtleSBkb2VzIG5vdCBleGlzdCA6ICdcIitub2RlS2V5K1wiJ1wiO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuKHRoaXMubm9kZU1hcFtub2RlS2V5XSk7XHJcblx0fVxyXG5cdFxyXG5cdGdldE5vZGVMaXN0RnJvbU1hcCgpXHJcblx0e1xyXG5cdFx0dmFyIG5vZGVMaXN0ID0gbmV3IEFycmF5KCk7XHJcblx0XHRPYmplY3Qua2V5cyh0aGlzLm5vZGVNYXApLmZvckVhY2goZnVuY3Rpb24gKGtleSlcclxuXHRcdHtcclxuXHRcdFx0bm9kZUxpc3QucHVzaChub2RlTWFwW2tleV0pO1xyXG5cdFx0fSk7XHJcblx0XHRyZXR1cm4obm9kZUxpc3QpO1xyXG5cdH1cclxuXHRcclxuXHRhZGROb2RlKG5vZGUpXHJcblx0e1xyXG5cdFx0dGhpcy5ub2Rlcy5wdXNoKG5vZGUpO1xyXG4gICBcdCAgICAvL2NvbnNvbGUubG9nKFwiTm9kZTphZGROb2RlOnBhcmVudC5uYW1lPVwiK3RoaXMubmFtZSsgXCIgdG9BZGQubmFtZT1cIitub2RlLm5hbWUpO1xyXG4gICBcdCAgICAvL2NvbnNvbGUubG9nKFwiLi4uLi5hZGROb2RlOnBhcmVudC5uYW1lPVwiK3RoaXMubmFtZSsgXCIgZ2V0Tm9kZUtleSgpPVwiK3RoaXMuZ2V0Tm9kZUtleSgpKTtcclxuXHRcdFxyXG5cdFx0aWYobm9kZS5pbmZvRGF0YS5ub2RlS2V5Lm5vZGVJZD09XCJyb290XCIpIG5vZGUuaW5mb0RhdGEubm9kZUtleS5ub2RlSWQgPSB0aGlzLm5vZGVzLmxlbmd0aDtcclxuXHRcdHZhciBzZWxmID0gdGhpcztcclxuXHRcdG5vZGUuaW5mb0RhdGEubm9kZUtleS5wYXJlbnROb2RlS2V5ID0gZnVuY3Rpb24oKXsgcmV0dXJuKHNlbGYuZ2V0Tm9kZUtleSgpKTsgfTtcclxuXHRcdFxyXG5cdFx0Ly9jb25zb2xlLmxvZyhDb21tb24udG9TdHJpbmcodGhpcy5jYW52YXNIb2xkZXIpKTtcclxuXHJcblx0XHRub2RlLmNhbnZhc0hvbGRlciA9IHRoaXMuY2FudmFzSG9sZGVyLmNsb25lKG5vZGUucG9zaXRpb24pO1xyXG5cdFx0Ly9jb25zb2xlLmxvZyhcImFkZE5vZGUgbm9kZS5jYW52YXNIb2xkZXI6XCIrQ29tbW9udG9TdHJpbmcobm9kZS5jYW52YXNIb2xkZXIpKTtcclxuXHRcdHRoaXMubm9kZXMuc29ydChmdW5jdGlvbihhLCBiKSB7XHJcblx0ICBcdCAgcmV0dXJuKGEubGF5ZXItYi5sYXllcik7XHJcblx0ICBcdH0pO1x0XHJcblx0XHRcclxuXHRcdHRoaXMubm9kZU1hcFtub2RlLmdldE5vZGVLZXkoKV0gPSBub2RlO1xyXG4gICBcdCAgICAvL2NvbnNvbGUubG9nKFwiLi4uLi5hZGROb2RlOkFEREVEOnBhcmVudC5uYW1lPVwiK3RoaXMubmFtZSsgXCIgYWRkZWQubmFtZT1cIitub2RlLm5hbWUpO1xyXG4gICBcdCAgICAvL2NvbnNvbGUubG9nKFwiLi4uLi5hZGROb2RlOkFEREVEOnBhcmVudC5uYW1lPVwiK3RoaXMubmFtZSsgXCIgZ2V0Tm9kZUtleSgpPVwiK3RoaXMuZ2V0Tm9kZUtleSgpKTtcclxuXHJcblx0fVxyXG5cdFxyXG5cdHJlbW92ZU5vZGUobm9kZSlcclxuXHR7XHJcblx0XHRDb21tb24ucmVtb3ZlSXRlbUZyb21BcnJheSh0aGlzLm5vZGVzLG5vZGUpO1xyXG5cdFx0ZGVsZXRlIHRoaXMubm9kZU1hcFtub2RlLmdldE5vZGVLZXkoKV07XHJcblxyXG5cdH1cclxuXHRcclxuXHRjbGVhckNhbnZhcyh0aW1lc3RhbXApXHJcblx0e1xyXG5cdH1cclxuXHRcclxuXHRkcmF3KClcclxuXHR7XHJcblx0fVxyXG5cdFxyXG5cdFxyXG5cdGRyYXdDb25uZWN0b3JzKHRpbWVzdGFtcClcclxuXHR7XHJcblx0XHRpZih0aGlzLmlzVmlzYWJsZSkgXHJcblx0XHR7XHJcblx0XHQgICAgZm9yKHZhciBpPTA7aTx0aGlzLm5vZGVzLmxlbmd0aDtpKyspXHJcblx0XHQgICAge1xyXG5cdFx0ICAgIFx0dmFyIG5vZGUgPSB0aGlzLm5vZGVzW2ldO1xyXG5cdFx0ICAgIFx0Zm9yKHZhciBqPTA7ajxub2RlLmNvbm5lY3RvcnMubGVuZ3RoO2orKylcclxuXHRcdCAgICBcdHtcclxuXHRcdCAgICBcdFx0dmFyIGNvbm5lY3RvciA9IG5vZGUuY29ubmVjdG9yc1tqXTtcclxuXHRcdCAgICBcdFx0Ly9jb25zb2xlLmxvZyhcImRyYXdpbmcgY29ubmVjdG9yOlwiK2Nvbm5lY3Rvci5uYW1lKTtcclxuXHRcdCAgICBcdFx0Y29ubmVjdG9yLmNvbm5lY3RvckRpc3BsYXkuZHJhd0Nvbm5lY3Rvcih0aGlzLmNhbnZhc0hvbGRlcixjb25uZWN0b3Isbm9kZSk7XHJcblx0XHQgICAgICAgIH1cclxuXHRcdCAgICB9XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdGRyYXdOb2Rlcyh0aW1lc3RhbXApXHJcblx0e1xyXG5cdFx0aWYodGhpcy5pc1Zpc2FibGUpIFxyXG5cdFx0e1xyXG5cdFx0ICAgXHRmb3IodmFyIGk9MDtpPHRoaXMubm9kZXMubGVuZ3RoO2krKylcclxuXHRcdCAgIFx0e1xyXG5cdFx0ICAgXHRcdHZhciBub2RlID0gdGhpcy5ub2Rlc1tpXTsgXHJcblx0XHQgICBcdFx0aWYodGhpcy5pc1Zpc2FibGUpIG5vZGUuZ3JhcGhEYXRhLm5vZGVEaXNwbGF5LmRyYXdOb2RlKHRoaXMuY2FudmFzSG9sZGVyLG5vZGUpO1xyXG5cdFx0ICAgXHR9XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdHNldEFuaW1hdGlvblRpbWVzKHRpbWVzdGFtcClcclxuXHR7XHJcblx0fVxyXG5cdFxyXG5cdGRlYnVnRnVuY3Rpb24oKVxyXG5cdHtcclxuXHR9XHJcblx0XHJcblx0Z2V0Tm9kZUNvbnRhaW5pbmdQb3NpdGlvbihwb3NpdGlvbilcclxuXHR7XHJcblx0XHR2YXIgZm91bmROb2RlID0gbnVsbDtcclxuXHRcclxuXHQgICAgZm9yICh2YXIgaT10aGlzLm5vZGVzLmxlbmd0aC0xO2k+PTA7aS0tKVxyXG5cdCAgICB7XHJcblx0ICAgICAgICB2YXIgbm9kZSA9IHRoaXMubm9kZXNbaV07XHJcblx0ICAgICAgICBpZihub2RlLmdyYXBoRGF0YS5ub2RlRGlzcGxheS5jb250YWluc1Bvc2l0aW9uKHBvc2l0aW9uLG5vZGUpKVxyXG5cdCAgICAgICAge1xyXG5cdCAgICAgICAgXHRmb3VuZE5vZGUgPSBub2RlO1xyXG5cdCAgICAgICAgXHRicmVhaztcclxuXHQgICAgICAgIH1cclxuXHQgICAgfVxyXG5cdCAgICByZXR1cm4oZm91bmROb2RlKTtcclxuXHR9XHJcblx0XHJcblx0XHJcblx0XHJcblx0YW5pbWF0ZUNhbGN1bGF0ZSh0aW1lc3RhbXApXHJcblx0e1xyXG5cdFx0aWYodGhpcy5pc0FuaW1hdGVkKVxyXG5cdFx0e1xyXG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuY29ubmVjdG9ycy5sZW5ndGg7IGkrKylcclxuXHRcdFx0e1xyXG5cdFx0XHRcdHZhciBjb25uZWN0b3IgPSB0aGlzLmNvbm5lY3RvcnNbaV07XHJcblx0XHRcdFx0Y29ubmVjdG9yLmV4ZWN1dGVDb25uZWN0b3JGdW5jdGlvbih0aW1lc3RhbXAsdGhpcylcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHRhbmltYXRlRmluYWxpemUodGltZXN0YW1wKVxyXG5cdHtcclxuXHRcdC8vaWYodGhpcy5pc0FuaW1hdGVkKVxyXG5cdFx0e1xyXG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuY29ubmVjdG9ycy5sZW5ndGg7IGkrKylcclxuXHRcdFx0e1xyXG5cdFx0XHRcdHRoaXMuc2V0TmV3UG9zaXRpb24oKTtcclxuXHRcdFx0fVxyXG5cdFx0XHR0aGlzLnBvc2l0aW9uTW92ZUxpc3QubGVuZ3RoID0gMDtcclxuXHRcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0Y29udGFpbnNQb3N0aW9uKHBvc2l0aW9uKVxyXG5cdHtcclxuXHRcdHJldHVybihcclxuXHRcdFx0XHQoXHJcblx0XHRcdFx0XHRcdCh0aGlzLnBvc2l0aW9uLmdldFgoKS10aGlzLndpZHRoLzIpPD1wb3NpdGlvbi5nZXRYKCkgJiZcclxuXHRcdFx0XHRcdFx0KHRoaXMucG9zaXRpb24uZ2V0WCgpK3RoaXMud2lkdGgvMik+PXBvc2l0aW9uLmdldFgoKSAmJlxyXG5cdFx0XHRcdFx0XHQodGhpcy5wb3NpdGlvbi5nZXRZKCktdGhpcy5oZWlnaHQvMik8PXBvc2l0aW9uLmdldFkoKSAmJlxyXG5cdFx0XHRcdFx0XHQodGhpcy5wb3NpdGlvbi5nZXRZKCkrdGhpcy5oZWlnaHQvMik+PXBvc2l0aW9uLmdldFkoKVxyXG5cdFx0XHRcdClcclxuXHRcdFx0KTtcclxuXHR9XHJcblx0XHJcblx0c2V0TmV3UG9zaXRpb24oKVxyXG5cdHtcclxuXHRcdGlmKHRoaXMucG9zaXRpb25Nb3ZlTGlzdC5sZW5ndGg9PTApICB0aGlzLnBvc2l0aW9uTW92ZUxpc3QucHVzaCh0aGlzLnBvc2l0aW9uKTtcdFxyXG5cdFx0dmFyIG5ld1Bvc2l0aW9uID0gbmV3IFBvc2l0aW9uKDAsMCk7XHJcblx0XHRcclxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5wb3NpdGlvbk1vdmVMaXN0Lmxlbmd0aDsgaSsrKVxyXG5cdCAgICB7XHJcblx0ICAgICAgICB2YXIgb25lUG9zaXRpb24gPSAgdGhpcy5wb3NpdGlvbk1vdmVMaXN0W2ldO1xyXG5cdCAgICAgICAgbmV3UG9zaXRpb24uc2V0WChuZXdQb3NpdGlvbi5nZXRYKCkrb25lUG9zaXRpb24uZ2V0WCgpKTtcclxuXHQgICAgICAgIG5ld1Bvc2l0aW9uLnNldFkobmV3UG9zaXRpb24uZ2V0WSgpK29uZVBvc2l0aW9uLmdldFkoKSk7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHZhciBuZXdYID0gbmV3UG9zaXRpb24uZ2V0WCgpIC8gdGhpcy5wb3NpdGlvbk1vdmVMaXN0Lmxlbmd0aDtcclxuXHRcdHZhciBuZXdZID0gbmV3UG9zaXRpb24uZ2V0WSgpIC8gdGhpcy5wb3NpdGlvbk1vdmVMaXN0Lmxlbmd0aDtcclxuXHRcdFxyXG5cdFx0dGhpcy5wb3NpdGlvbi5zZXRYKG5ld1gpO1xyXG5cdFx0dGhpcy5wb3NpdGlvbi5zZXRZKG5ld1kpO1x0XHRcclxuXHR9XHJcblxyXG59XHJcblxyXG4vLzxqczJub2RlPlxyXG5tb2R1bGUuZXhwb3J0cyA9IE5vZGU7XHJcbmNvbnNvbGUubG9nKFwiTG9hZGluZzpOb2RlXCIpO1xyXG4vLzwvanMybm9kZT5cclxuIiwiY2xhc3MgQ2FudmFzRGVmXHJcbntcclxuXHRjb25zdHJ1Y3RvcigpXHJcblx0e1x0XHRcclxuXHR9XHJcblx0XHJcblx0Z2V0V29ybGREaXNwYWx5KClcclxuXHR7XHJcblx0XHR0aHJvdyBcIkNhbnZhc0RlZi5nZXRXb3JsZERpc3BhbHkgbm90IGRlZmluZWRcIjtcclxuXHR9XHJcblx0XHJcblx0Z2V0V29ybGREZWZhdWx0cygpXHJcblx0e1xyXG5cdFx0dGhyb3cgXCJDYW52YXNEZWYuZ2V0V29ybGREZWZhdWx0cyBub3QgZGVmaW5lZFwiO1xyXG5cdH1cclxufVxyXG5cclxuLy88anMybm9kZT5cclxubW9kdWxlLmV4cG9ydHMgPSBDYW52YXNEZWY7XHJcbmNvbnNvbGUubG9nKFwiTG9hZGluZzpDYW52YXNEZWZcIik7XHJcbi8vPC9qczJub2RlPlxyXG4iLCJ2YXIgUG9zaXRpb24gPSByZXF1aXJlKCcuLi8uLi9ub2Rlcy9wb3NpdGlvbi9wb3NpdGlvbicpO1xyXG52YXIgQ29tbW9uID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL2NvbW1vbicpO1xyXG5cclxuY2xhc3MgQ2FudmFzSG9sZGVyXHJcbntcclxuXHRjb25zdHJ1Y3RvcihjYW52YXNOYW1lLHdvcmxkRGVmKVxyXG5cdHtcclxuXHRcdHRoaXMuY2FudmFzTmFtZSA9IGNhbnZhc05hbWU7XHJcblx0XHR0aGlzLndvcmxkRGVmID0gd29ybGREZWY7XHRcdFxyXG5cdFx0dGhpcy5vcmlnaW4gPSBuZXcgUG9zaXRpb24oMCwwKTtcclxuXHRcdHRoaXMuaW5pdChjYW52YXNOYW1lLHdvcmxkRGVmKTtcclxuXHR9XHJcblx0XHJcblx0aW5pdChjYW52YXNOYW1lLHdvcmxkRGVmKVxyXG5cdHtcclxuXHRcdHRoaXMuaXNDYW52YXNWaXNhYmxlID0gdHJ1ZTtcclxuXHRcdHRoaXMuaXNDYW52YXNEcmF3YWJsZSA9IHRydWU7XHJcblx0XHR0aGlzLmNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMuY2FudmFzTmFtZSk7XHRcdFx0XHJcblx0XHR0aGlzLmNvbnRleHQgPSB0aGlzLmNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xyXG5cdFx0LyppZiAodHlwZW9mIGRvY3VtZW50ICE9PSAndW5kZWZpbmVkJylcclxuXHRcdHtcclxuXHRcdFx0dGhpcy5jYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0aGlzLmNhbnZhc05hbWUpO1x0XHRcdFxyXG5cdFx0XHR0aGlzLmNvbnRleHQgPSB0aGlzLmNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xyXG5cdFx0fSovXHJcblx0fVxyXG5cdFxyXG5cdHN0YXRpYyBjcmVhdGVDYW52YXNIb2xkZXJGcm9tQ2xpZW50SnNvbih3b3JsZERlZixqc29uKVxyXG5cdHtcclxuXHQgIHZhciBjYW52YXNIb2xkZXIgPSBuZXcgQ2FudmFzSG9sZGVyKGpzb24uY2FuYXZzTmFtZSx3b3JsZERlZik7XHJcblx0ICByZXR1cm4oY2FudmFzSG9sZGVyKTtcclxuXHR9XHJcblx0ICBnZXRDbGllbnRKc29uKClcclxuXHQgIHtcclxuXHRcdCAgdmFyIGpzb24gPSB7fTtcclxuXHRcdCAgXHJcblx0XHQgIFxyXG5cdFx0ICBqc29uLmNhbnZhc05hbWUgPSB0aGlzLmNhbnZhc05hbWU7XHJcblx0XHQgIGpzb24ub3JpZ2luID0gdGhpcy5vcmlnaW47XHJcblx0XHQgIGpzb24ud2lkdGggPSB0aGlzLmdldFdpZHRoKCk7XHJcblx0XHQgIGpzb24uaGVpZ2h0ID0gdGhpcy5nZXRIZWlnaHQoKTtcclxuXHRcdCAganNvbi53b3JsZERlZiA9IHRoaXMud29ybGREZWY7XHJcblx0XHQgIFxyXG5cdFx0ICBKU09OLnN0cmluZ2lmeShqc29uKTtcclxuXHRcdCAgcmV0dXJuKGpzb24pXHJcblx0ICB9XHJcblx0XHJcblx0Z2V0Q29ubmVjdG9yKGNvbm5lY3RvckRlZktleSxuYW1lKVxyXG5cdHtcclxuXHRcdHZhciBjb25uZWN0b3IgPSB0aGlzLmdldENvbm5lY3RvckRlZihjb25uZWN0b3JEZWZLZXkpKHRoaXMud29ybGREZWYsbmFtZSk7XHJcblx0XHRjb25uZWN0b3IuY29ubmVjdG9yRGVmS2V5ID0gY29ubmVjdG9yRGVmS2V5O1xyXG5cdFx0cmV0dXJuKGNvbm5lY3Rvcik7XHJcblx0fVxyXG5cdFxyXG5cdGdldENvbm5lY3RvckRlZihjb25uZWN0b3JEZWZLZXkpXHJcblx0e1xyXG5cdFx0dmFyIGNvbm5lY3RvckRlZiA9IHRoaXMud29ybGREZWYud29ybGREaXNwbGF5LmNvbm5lY3RvckRlZnNbXCJnZW5lcmljXCJdO1xyXG5cdFx0XHJcblx0XHR2YXIgZm91bmRDb25uZWN0b3JEZWYgPSBmYWxzZTtcclxuXHRcdGlmKHRoaXMud29ybGREZWYud29ybGREaXNwbGF5LmNvbm5lY3RvckRlZnMuaGFzT3duUHJvcGVydHkoY29ubmVjdG9yRGVmS2V5KSlcclxuXHRcdHtcclxuXHRcdFx0Y29ubmVjdG9yRGVmID0gdGhpcy53b3JsZERlZi53b3JsZERpc3BsYXkuY29ubmVjdG9yRGVmc1tjb25uZWN0b3JEZWZLZXldO1xyXG5cdFx0XHRmb3VuZENvbm5lY3RvckRlZiA9IHRydWU7XHJcblx0XHR9XHJcblx0XHRpZighZm91bmRDb25uZWN0b3JEZWYpIGNvbnNvbGUudHJhY2UoXCJDYW52YXNIb2xkZXI6Z2V0Q29ubmVjdG9yRGVmOmNvbm5lY3RvckRlZktleT1cXFwiXCIrY29ubmVjdG9yRGVmS2V5KyBcIlxcXCIgd2FzIG5vdCBmb3VuZCB1c2luZyBnZW5lcmljXCIpO1xyXG5cdFx0ZWxzZSBjb25zb2xlLmxvZyhcImZvdW5kIGNvbm5lY3RvciBkaXNwbGF5IDpcIitjb25uZWN0b3JEZWZLZXkpO1xyXG5cdFx0Y29ubmVjdG9yRGVmLmNvbm5lY3RvckRlZktleSA9IGNvbm5lY3RvckRlZktleTtcclxuXHRcdHJldHVybihjb25uZWN0b3JEZWYpO1xyXG5cdH1cclxuXHRcclxuXHRnZXRDb25uZWN0b3JEaXNwbGF5KGNvbm5lY3RvckRpc3BsYXlLZXkpXHJcblx0e1xyXG5cdFx0dmFyIGNvbm5lY3RvckRpc3BsYXkgPSB0aGlzLndvcmxkRGVmLndvcmxkRGlzcGxheS5jb25uZWN0b3JEaXNwbGF5W1wiZ2VuZXJpY1wiXTtcclxuXHRcdFxyXG5cdFx0dmFyIGZvdW5kQ29ubmVjdG9yRGlzcGxheSA9IGZhbHNlO1xyXG5cdFx0aWYodGhpcy53b3JsZERlZi53b3JsZERpc3BsYXkuY29ubmVjdG9yRGlzcGxheS5oYXNPd25Qcm9wZXJ0eShjb25uZWN0b3JEaXNwbGF5S2V5KSlcclxuXHRcdHtcclxuXHRcdFx0Y29ubmVjdG9yRGlzcGxheSA9IHRoaXMud29ybGREZWYud29ybGREaXNwbGF5LmNvbm5lY3RvckRpc3BsYXlbY29ubmVjdG9yRGlzcGxheUtleV07XHJcblx0XHRcdGZvdW5kQ29ubmVjdG9yRGlzcGxheSA9IHRydWU7XHJcblx0XHR9XHJcblx0XHRpZighZm91bmRDb25uZWN0b3JEaXNwbGF5KSBjb25zb2xlLnRyYWNlKFwiQ2FudmFzSG9sZGVyOmdldENvbm5lY3RvckRpc3BsYXk6Y29ubmVjdG9yRGlzcGxheUtleT1cXFwiXCIrY29ubmVjdG9yRGlzcGxheUtleSsgXCJcXFwiIHdhcyBub3QgZm91bmQgdXNpbmcgZ2VuZXJpY1wiKTtcclxuXHRcdGNvbm5lY3RvckRpc3BsYXkuY29ubmVjdG9yRGlzcGxheUtleSA9IGNvbm5lY3RvckRpc3BsYXlLZXk7XHJcblx0XHRyZXR1cm4oY29ubmVjdG9yRGlzcGxheSk7XHJcblx0fVxyXG5cdFxyXG5cdGdldEdyYXBoRGF0YShncmFwaERhdGFLZXkpXHJcblx0e1xyXG5cdFx0dmFyIGdyYXBoRGF0YSA9IHRoaXMud29ybGREZWYud29ybGREaXNwbGF5Lm5vZGVEaXNwbGF5W1wiZ2VuZXJpY1wiXTtcdFxyXG5cdFx0dmFyIGZvdW5kR3JhcGhEYXRhID0gZmFsc2U7XHJcblx0XHRpZih0aGlzLndvcmxkRGVmLndvcmxkRGlzcGxheS5ub2RlRGlzcGxheS5oYXNPd25Qcm9wZXJ0eShncmFwaERhdGFLZXkpKVxyXG5cdFx0e1xyXG5cdFx0XHRncmFwaERhdGEgPSB0aGlzLndvcmxkRGVmLndvcmxkRGlzcGxheS5ub2RlRGlzcGxheVtncmFwaERhdGFLZXldO1xyXG5cdFx0XHRmb3VuZEdyYXBoRGF0YSA9IHRydWU7XHJcblx0XHR9XHJcblx0XHRpZighZm91bmRHcmFwaERhdGEpIGNvbnNvbGUudHJhY2UoXCJDYW52YXNIb2xkZXI6Z2V0R3JhcGhEYXRhOmdyYXBoRGF0YUtleT1cXFwiXCIrZ3JhcGhEYXRhS2V5KyBcIlxcXCIgd2FzIG5vdCBmb3VuZCB1c2luZyBnZW5lcmljXCIpXHJcblx0XHQvL2NvbnNvbGUudHJhY2UoXCJDYW52YXNIb2xkZXI6Z2V0R3JhcGhEYXRhOmdyYXBoRGF0YUtleT1cXFwiXCIrZ3JhcGhEYXRhS2V5KyBcIlxcXCIgd2FzIG5vdCBmb3VuZCB1c2luZyBnZW5lcmljXCIpXHJcblx0XHQvL2NvbnNvbGUubG9nKFwiRk9SOlwiK2dyYXBoRGF0YUtleStDb21tb24udG9TdHJpbmcoZ3JhcGhEYXRhKSk7XHJcblx0XHQvL2NvbnNvbGUubG9nKFwiZ2V0R3JhcGhEYXRhOmdyYXBoRGF0YUtleT1cIitncmFwaERhdGFLZXkrXCI6Y2xvbmU9XCIrZ3JhcGhEYXRhLm5vZGVEaXNwbGF5LmRpc3BsYXlJbmZvLmNsb25lKTtcclxuXHJcblx0XHQvL2lmKGdyYXBoRGF0YS5ub2RlRGlzcGxheS5kaXNwbGF5SW5mby5jbG9uZSlcclxuXHRcdGlmKGdyYXBoRGF0YS5ub2RlRGlzcGxheUZ1bmN0aW9uKVxyXG5cdFx0e1xyXG5cdFx0XHQvL2NvbnNvbGUubG9nKFwiZ2V0R3JhcGhEYXRhOmdyYXBoRGF0YUtleTpGT1VORCBBIEZVTkNUSU9OOlwiK2dyYXBoRGF0YUtleSk7XHJcblx0XHRcdGdyYXBoRGF0YSA9IE9iamVjdC5jcmVhdGUoZ3JhcGhEYXRhKTtcclxuXHRcdFx0Z3JhcGhEYXRhLm5vZGVEaXNwbGF5ID0gZ3JhcGhEYXRhLm5vZGVEaXNwbGF5RnVuY3Rpb24oKTtcclxuXHRcdFx0Ly9jb25zb2xlLmxvZyhcIkNMT05JTkc6XCIrZ3JhcGhEYXRhS2V5K0NvbW1vbi50b1N0cmluZyhncmFwaERhdGEpKTtcclxuXHRcdFx0Ly9ncmFwaERhdGEubm9kZURpc3BsYXkuZGlzcGxheUluZm8gPSBPYmplY3QuY3JlYXRlKGdyYXBoRGF0YS5ub2RlRGlzcGxheS5kaXNwbGF5SW5mbyk7XHJcblx0XHRcdC8vZ3JhcGhEYXRhLm5vZGVEaXNwbGF5LmRpc3BsYXlJbmZvICA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoZ3JhcGhEYXRhLm5vZGVEaXNwbGF5LmRpc3BsYXlJbmZvKSk7XHJcblx0XHRcdC8vZ3JhcGhEYXRhLm5vZGVEaXNwbGF5LmRpc3BsYXlJbmZvICA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoZ3JhcGhEYXRhLm5vZGVEaXNwbGF5LmRpc3BsYXlJbmZvKSk7XHJcblx0XHRcdC8vZ3JhcGhEYXRhID0gT2JqZWN0LmNyZWF0ZShncmFwaERhdGEpO1xyXG5cdFx0XHQvL2dyYXBoRGF0YS5ub2RlRGlzcGxheS5kaXNwbGF5SW5mby50cyA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xyXG5cclxuXHJcblx0XHR9XHJcblxyXG5cdFx0Z3JhcGhEYXRhLmdyYXBoRGF0YUtleSA9IGdyYXBoRGF0YUtleTtcclxuXHRcdHJldHVybihncmFwaERhdGEpO1xyXG5cdH1cclxuXHRcclxuXHRjbG9uZShvcmlnaW4pXHJcblx0e1xyXG5cdFx0dmFyIGNhbnZhc0hvbGRlciA9IG5ldyBDYW52YXNIb2xkZXIodGhpcy5jYW52YXNOYW1lLHRoaXMud29ybGREZWYpO1xyXG5cdFx0Y2FudmFzSG9sZGVyLm9yaWdpbiA9IG9yaWdpbjtcclxuXHRcdC8qXHJcblx0XHR2YXIgY2FudmFzSG9sZGVyID0gbmV3IE9iamVjdCgpO1xyXG5cdFx0Y2FudmFzSG9sZGVyLm9yaWdpbiA9IG9yaWdpbjtcclxuXHRcdFxyXG5cdFx0Y2FudmFzSG9sZGVyLmNhbnZhc05hbWUgPSB0aGlzLmNhbnZhc05hbWU7XHJcblx0XHRjYW52YXNIb2xkZXIuY2FudmFzID0gdGhpcy5jYW52YXM7XHJcblx0XHRjYW52YXNIb2xkZXIuY29udGV4dCA9IHRoaXMuY29udGV4dDtcclxuXHRcdGNhbnZhc0hvbGRlci5pc0NhbnZhc1Zpc2FibGUgPSB0aGlzLmlzQ2FudmFzVmlzYWJsZTtcclxuXHRcdGNhbnZhc0hvbGRlci5pc0NhbnZhc0RyYXdhYmxlID0gdGhpcy5pc0NhbnZhc0RyYXdhYmxlO1xyXG5cdFx0Y2FudmFzSG9sZGVyLmlzRHJhd2FibGUgPSB0aGlzLmlzRHJhd2FibGU7XHJcblx0XHRjYW52YXNIb2xkZXIuaXNWaXNhYmxlID0gdGhpcy5pc1Zpc2FibGU7XHJcblx0XHRjYW52YXNIb2xkZXIuZ2V0V2lkdGggPSB0aGlzLmdldFdpZHRoO1xyXG5cdFx0Y2FudmFzSG9sZGVyLmdldEhlaWdodCA9IHRoaXMuZ2V0SGVpZ2h0O1xyXG5cdFx0Y2FudmFzSG9sZGVyLndvcmxkRGVmID0gdGhpcy53b3JsZERlZjtcclxuXHRcdGNhbnZhc0hvbGRlci5nZXRHcmFwaERhdGEgPSB0aGlzLmdldEdyYXBoRGF0YTtcclxuXHRcdCovXHJcblx0XHRcclxuXHRcdHJldHVybihjYW52YXNIb2xkZXIpO1xyXG5cdH1cclxuXHRcclxuXHRpc0RyYXdhYmxlKClcclxuXHR7XHJcblx0XHRyZXR1cm4odGhpcy5pc0NhbnZhc0RyYXdhYmxlKTtcclxuXHR9XHJcblx0XHJcblx0aXNWaXNhYmxlKClcclxuXHR7XHJcblx0XHRyZXR1cm4odGhpcy5pc0NhbnZhc1Zpc2FibGUpO1xyXG5cdH1cclxuXHRcclxuXHRnZXRXaWR0aCgpXHJcblx0e1xyXG5cdFx0cmV0dXJuKHRoaXMuY2FudmFzLndpZHRoKTtcclxuXHR9XHJcblx0XHJcblx0Z2V0SGVpZ2h0KClcclxuXHR7XHJcblx0XHRyZXR1cm4odGhpcy5jYW52YXMuaGVpZ2h0KTtcclxuXHR9XHJcbn1cclxuXHJcblxyXG4vLzxqczJub2RlPlxyXG5tb2R1bGUuZXhwb3J0cyA9IENhbnZhc0hvbGRlcjtcclxuY29uc29sZS5sb2coXCJMb2FkaW5nOkNhbnZhc0hvbGRlclwiKTtcclxuLy88L2pzMm5vZGU+XHJcbiIsInZhciBDYW52YXNIb2xkZXIgPSByZXF1aXJlKCcuLi8uLi9ub2Rlcy9ub2RlY2FudmFzL2NhbnZhc2hvbGRlcicpO1xyXG52YXIgQ29tbW9uID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL2NvbW1vbicpO1xyXG5cclxuXHJcbmNsYXNzIENhbnZhc0hvbGRlclZpcnR1YWwgZXh0ZW5kcyBDYW52YXNIb2xkZXJcclxue1xyXG5cdGNvbnN0cnVjdG9yKGNhbnZhc05hbWUsd29ybGREZWYsd2lkdGgsaGVpZ2h0LG9yaWdpbilcclxuXHR7XHJcblx0XHRzdXBlcihjYW52YXNOYW1lLHdvcmxkRGVmKTtcclxuXHRcdHRoaXMud2lkdGggPSB3aWR0aDtcclxuXHRcdHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xyXG5cdH1cclxuXHRcclxuXHRpbml0KGNhbnZhc05hbWUsd29ybGREZWYpXHJcblx0e1xyXG5cdFx0dGhpcy5jYW52YXMgPSBudWxsO1xyXG5cdFx0dGhpcy5jb250ZXh0ID0gbnVsbDtcclxuXHRcdHRoaXMuaXNDYW52YXNWaXNhYmxlID0gZmFsc2U7XHJcblx0XHR0aGlzLmlzQ2FudmFzRHJhd2FibGUgPSBmYWxzZTtcclxuXHR9XHJcblxyXG5cdGNsb25lKG9yaWdpbilcclxuXHR7XHJcblx0XHR2YXIgY2FudmFzSG9sZGVyID0gbmV3IENhbnZhc0hvbGRlclZpcnR1YWwodGhpcy5jYW52YXNOYW1lLHRoaXMud29ybGREZWYsdGhpcy53aWR0aCx0aGlzLmhlaWdodCxvcmlnaW4pO1xyXG5cdFx0cmV0dXJuKGNhbnZhc0hvbGRlcik7XHJcblx0fVxyXG5cclxuXHRnZXRXaWR0aCgpXHJcblx0e1xyXG5cdFx0cmV0dXJuKHRoaXMud2lkdGgpO1xyXG5cdH1cclxuXHJcblx0Z2V0SGVpZ2h0KClcclxuXHR7XHJcblx0XHRyZXR1cm4odGhpcy5oZWlnaHQpO1xyXG5cdH1cclxufVxyXG4vLzxqczJub2RlPlxyXG5tb2R1bGUuZXhwb3J0cyA9IENhbnZhc0hvbGRlclZpcnR1YWw7XHJcbmNvbnNvbGUubG9nKFwiTG9hZGluZzpDYW52YXNIb2xkZXJWaXJ0dWFsXCIpO1xyXG4vLzwvanMybm9kZT5cclxuIiwiY2xhc3MgTW91c2VTdGF0dXNcclxue1xyXG5cdGNvbnN0cnVjdG9yKGlzRG93bixzdGFydFBvc2l0aW9uLHBvc2l0aW9uLG5vZGUsbm9kZVN0YXJ0UG9zaXRpb24pXHJcblx0e1xyXG5cdFx0dGhpcy5pc0Rvd24gPSBpc0Rvd247XHJcblx0XHR0aGlzLnN0YXJ0UG9zaXRpb24gPSBzdGFydFBvc2l0aW9uO1xyXG5cdFx0dGhpcy5wb3NpdGlvbiA9IHBvc2l0aW9uO1xyXG5cdFx0dGhpcy5ub2RlID0gbm9kZTtcclxuXHRcdHRoaXMubm9kZVN0YXJ0UG9zaXRpb24gPSBub2RlU3RhcnRQb3NpdGlvbjtcclxuXHR9XHJcbn1cclxuLy88anMybm9kZT5cclxubW9kdWxlLmV4cG9ydHMgPSBNb3VzZVN0YXR1cztcclxuY29uc29sZS5sb2coXCJMb2FkaW5nOk1vdXNlU3RhdHVzXCIpO1xyXG4vLzwvanMybm9kZT5cclxuIiwidmFyIFBvc2l0aW9uID0gcmVxdWlyZSgnLi4vcG9zaXRpb24vcG9zaXRpb24nKTtcclxudmFyIE5vZGUgPSByZXF1aXJlKCcuLi9ub2RlJyk7XHJcbnZhciBDb21tb24gPSByZXF1aXJlKCcuLi8uLi9jb21tb24vY29tbW9uJyk7XHJcblxyXG5jbGFzcyBOb2RlQ2FudmFzIGV4dGVuZHMgTm9kZVxyXG57XHJcblx0ICBjb25zdHJ1Y3RvcihjYW52YXNIb2xkZXIpXHJcblx0ICB7XHJcblx0XHQgIHN1cGVyKFx0Y2FudmFzSG9sZGVyLmNhbnZhc05hbWUsXHJcblx0XHRcdFx0XHRuZXcgUG9zaXRpb24oMCwwKSxcclxuXHRcdFx0XHRcdGNhbnZhc0hvbGRlcixcclxuXHRcdFx0XHRcdFwiZ2VuZXJpY1wiLFxyXG5cdFx0XHRcdFx0bnVsbCk7XHJcblx0XHQgIE5vZGVDYW52YXMuaW5pdE5vZGVDYW52YXModGhpcyxjYW52YXNIb2xkZXIpO1xyXG5cdFx0ICBcclxuXHQgIH1cclxuXHQgIFxyXG5cdCAgc3RhdGljIGluaXROb2RlQ2FudmFzKG5vZGVDYW52YXMsY2FudmFzSG9sZGVyKVxyXG5cdCAge1xyXG5cdFx0XHRub2RlQ2FudmFzLmV4dHJhQW5pbWF0aW9uID0gbnVsbDtcclxuXHRcdFx0bm9kZUNhbnZhcy5jYW52YXNIb2xkZXIgPSBjYW52YXNIb2xkZXI7XHJcblx0XHRcdG5vZGVDYW52YXMuc3RhcnRBbmltYXRpb25UaW1lU3RhbXAgPSBudWxsO1xyXG5cdFx0XHRub2RlQ2FudmFzLmxhc3RBbmltYXRpb25UaW1lU3RhbXAgPSBudWxsO1xyXG5cdFx0XHRub2RlQ2FudmFzLnN0YXJ0QW5pbWF0aW9uRGF0ZSA9IG51bGw7XHJcblx0XHRcdG5vZGVDYW52YXMuYW5pbWF0aW9uRXhlY1RpbWUgPSAwO1xyXG5cdFx0XHRub2RlQ2FudmFzLnRpbWVGYWN0b3IgPSAxO1xyXG5cdFx0XHRub2RlQ2FudmFzLndvcmxkVXBkYXRlUXVldWVQcm9jZXNzZWQgPSBuZXcgQXJyYXkoKTtcclxuXHJcblx0XHR9XHJcblx0ICBcclxuXHQgIGdldFdvcmxkVXBkYXRlc1Byb2Nlc3NlZCh0aW1lU3RhbXAsbWF4SXRlbXMpXHJcblx0XHR7XHJcblx0XHRcdHZhciB3b3JsZFVwZGF0ZUFycmF5ID0gbmV3IEFycmF5KCk7XHJcblx0XHRcdHZhciBmaXJzdCA9IG51bGw7XHJcblx0XHRcdGZvcih2YXIgaT0wO2k8dGhpcy53b3JsZFVwZGF0ZVF1ZXVlUHJvY2Vzc2VkLmxlbmd0aCAmJlxyXG5cdFx0XHRcdHdvcmxkVXBkYXRlQXJyYXkubGVuZ3RoPG1heEl0ZW1zO2krKylcclxuXHRcdFx0e1xyXG5cdFx0XHRcdHZhciB3b3JsZFVwZGF0ZSA9IHRoaXMud29ybGRVcGRhdGVRdWV1ZVByb2Nlc3NlZFtpXTtcclxuXHJcblx0XHRcdFx0aWYod29ybGRVcGRhdGUucHJvY2Vzc1RpbWVzdGFtcD50aW1lU3RhbXApIFxyXG5cdFx0XHRcdHtcclxuXHRcdFx0XHRcdHdvcmxkVXBkYXRlQXJyYXkucHVzaCh3b3JsZFVwZGF0ZSk7XHJcblx0XHRcdFx0XHQvKlxyXG5cdFx0XHRcdFx0Y29uc29sZS5sb2coXCIgICAgICBnZXRXb3JsZFVwZGF0ZXNQcm9jZXNzZWRcIitcclxuXHRcdFx0XHRcdFx0XHRcIjp3b3JsZFVwZGF0ZS5wcm9jZXNzVGltZXN0YW1wPVwiK3dvcmxkVXBkYXRlLnByb2Nlc3NUaW1lc3RhbXArXHJcblx0XHRcdFx0XHRcdFx0XCI6cmVhZHlUb0JlUHJvY2Vzc2VkPVwiK3dvcmxkVXBkYXRlLnJlYWR5VG9CZVByb2Nlc3NlZCh0aW1lU3RhbXApK1xyXG5cdFx0XHRcdFx0XHRcdFwiOnRpbWVTdGFtcD1cIit0aW1lU3RhbXApO1xyXG5cdFx0XHRcdFx0Ki9cclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0LypcclxuXHRcdFx0Y29uc29sZS5sb2coXCJnZXRXb3JsZFVwZGF0ZXNQcm9jZXNzZWRcIitcclxuXHRcdFx0XHRcdFwiOnRpbWVTdGFtcD1cIit0aW1lU3RhbXArXHJcblx0XHRcdFx0XHRcIjptYXhJdGVtcz1cIittYXhJdGVtcytcclxuXHRcdFx0XHRcdFwiOmZvdW5kPVwiK3dvcmxkVXBkYXRlQXJyYXkubGVuZ3RoKTtcclxuXHRcdFx0XHRcdCovXHJcblx0XHRcdHJldHVybih3b3JsZFVwZGF0ZUFycmF5KTtcclxuXHRcdH1cclxuXHRcclxuXHQgIGdldFdvcmxkQ2xpZW50SnNvbigpXHJcblx0ICB7XHJcblx0XHQgIHZhciBqc29uID0ge307XHJcblx0XHQgIFxyXG5cdFx0ICBqc29uLm5vZGVHcmFwaCA9IHN1cGVyLmdldENsaWVudEpzb24oKTtcclxuXHRcdCAganNvbi5jYW52YXNIb2xkZXIgPSB0aGlzLmNhbnZhc0hvbGRlci5nZXRDbGllbnRKc29uKCk7XHJcblx0XHQgIEpTT04uc3RyaW5naWZ5KGpzb24pO1xyXG5cdFx0ICByZXR1cm4oanNvbilcclxuXHQgIH1cclxuXHRcclxuXHRpc1Zpc2FibGUoKVxyXG5cdHtcclxuXHRcdHJldHVybih0aGlzLmNhbnZhc0hvbGRlci5pc1Zpc2FibGUoKSlcclxuXHR9XHJcblx0XHJcblx0cG9pbnRlclVwKG5vZGUpXHJcblx0e1xyXG5cdFx0Ly9jb25zb2xlLmxvZyhcIk5vZGVDYW52YXMucG9pbnRlclVwOlwiK25vZGUubmFtZSlcclxuXHR9XHJcblx0XHJcblx0cG9pbnRlck1vdmUobm9kZSlcclxuXHR7XHJcblx0XHQvL2NvbnNvbGUubG9nKFwiTm9kZUNhbnZhcy5wb2ludGVyTW92ZTpcIitub2RlLm5hbWUpXHJcblx0fVxyXG5cdFxyXG5cdHBvaW50ZXJEb3duKG5vZGUpXHJcblx0e1xyXG5cdFx0Ly9jb25zb2xlLmxvZyhcIk5vZGVDYW52YXMucG9pbnRlckRvd246XCIrbm9kZS5uYW1lKVxyXG5cdH1cclxuXHRcclxuXHRwYXVzZSgpXHJcblx0e1xyXG5cdFx0dGhpcy5pc0FuaW1hdGVkID0gZmFsc2U7XHJcblx0fVxyXG5cdFxyXG5cdHBsYXkoKVxyXG5cdHtcclxuXHRcdHRoaXMuaXNBbmltYXRlZCA9IHRydWU7XHJcblx0ICAgIHRoaXMuZHJhdygpO1xyXG5cdH1cclxuXHRkcmF3KClcclxuXHR7XHJcblx0XHR2YXIgc2VsZiA9IHRoaXM7XHJcblx0XHRpZih0aGlzLmNhbnZhc0hvbGRlci5pc0RyYXdhYmxlKCkpXHJcblx0XHRcdHJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbih0aW1lc3RhbXApIHsgc2VsZi5kcmF3Q2FudmFzKHRpbWVzdGFtcCkgfSwgZmFsc2UpO1xyXG5cdH1cclxuXHRcclxuXHRcclxuXHRzZXRBbmltYXRpb25UaW1lcyh0aW1lc3RhbXApXHJcblx0e1xyXG5cdFx0aWYodGhpcy5zdGFydEFuaW1hdGlvblRpbWVTdGFtcD09bnVsbCkgdGhpcy5zdGFydEFuaW1hdGlvblRpbWVTdGFtcCA9IHRpbWVzdGFtcCswO1xyXG5cdFx0aWYodGhpcy5zdGFydEFuaW1hdGlvbkRhdGU9PW51bGwpIHRoaXMuc3RhcnRBbmltYXRpb25EYXRlID0gbmV3IERhdGUoKTtcclxuXHRcdHZhciBub3cgPSBuZXcgRGF0ZSgpO1xyXG5cdFx0aWYodGhpcy5sYXN0QW5pbWF0aW9uVGltZVN0YW1wPT1udWxsKSB0aGlzLmxhc3RBbmltYXRpb25UaW1lU3RhbXAgPSBub3c7XHJcblx0XHJcblx0XHRpZih0aGlzLmlzQW5pbWF0ZWQpXHJcblx0XHR7XHJcblx0XHRcdHRoaXMuYW5pbWF0aW9uRXhlY1RpbWUgKz0gbm93LmdldFRpbWUoKS10aGlzLmxhc3RBbmltYXRpb25UaW1lU3RhbXAuZ2V0VGltZSgpO1xyXG5cdFx0XHQvL2NvbnNvbGUubG9nKFwibm93PVwiK25vdytcclxuXHRcdFx0Ly9cdFwiIGxhc3RBbmltYXRpb25UaW1lU3RhbXA9XCIrdGhpcy5sYXN0QW5pbWF0aW9uVGltZVN0YW1wK1xyXG5cdFx0XHQvL1x0XCIgYW5pbWF0aW9uRXhlY1RpbWU9XCIrdGhpcy5hbmltYXRpb25FeGVjVGltZStcclxuXHRcdFx0Ly9cdFwiXCIpO1xyXG5cdFx0fVxyXG5cdFx0dGhpcy5sYXN0QW5pbWF0aW9uVGltZVN0YW1wID0gbm93O1xyXG5cdFxyXG5cdH1cclxuXHRcclxuXHRcclxuXHRjbGVhckNhbnZhcyh0aW1lc3RhbXApXHJcblx0e1xyXG5cdFx0aWYodGhpcy5pc1Zpc2FibGUoKSAmJiB0aGlzLmNhbnZhc0hvbGRlci5pc0RyYXdhYmxlKCkpXHJcblx0XHR7XHJcblx0XHRcdHRoaXMuY2FudmFzSG9sZGVyLmNvbnRleHQuY2xlYXJSZWN0KDAsIDAsIHRoaXMuY2FudmFzSG9sZGVyLmdldFdpZHRoKCksIHRoaXMuY2FudmFzSG9sZGVyLmNhbnZhcy5oZWlnaHQpO1xyXG5cdFx0XHR0aGlzLmNhbnZhc0hvbGRlci5jb250ZXh0LmZpbGxTdHlsZSA9IENvbW1vbi5nZXRDb2xvckZyb21TdHJpbmcodGhpcy5maWxsU3R5bGUpXHJcblx0XHRcdHRoaXMuY2FudmFzSG9sZGVyLmNvbnRleHQuZmlsbFJlY3QoMCwgMCwgdGhpcy5jYW52YXNIb2xkZXIuZ2V0V2lkdGgoKSwgdGhpcy5jYW52YXNIb2xkZXIuZ2V0SGVpZ2h0KCkpO1xyXG5cdFx0fVxyXG5cdH1cclxufVxyXG5cclxuLy88anMybm9kZT5cclxubW9kdWxlLmV4cG9ydHMgPSBOb2RlQ2FudmFzO1xyXG5jb25zb2xlLmxvZyhcIkxvYWRpbmc6Tm9kZUNhbnZhc1wiKTtcclxuLy88L2pzMm5vZGU+XHJcbiIsInZhciBNb3VzZVN0YXR1cyA9IHJlcXVpcmUoJy4uLy4uL25vZGVzL25vZGVjYW52YXMvbW91c2VzdGF0dXMnKTtcclxudmFyIFBvc2l0aW9uID0gcmVxdWlyZSgnLi4vLi4vbm9kZXMvcG9zaXRpb24vcG9zaXRpb24nKTtcclxudmFyIENvbW1vbiA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9jb21tb24nKTtcclxuXHJcbmNsYXNzIE5vZGVDYW52YXNNb3VzZVxyXG57XHJcblx0Y29uc3RydWN0b3Iobm9kZUNhbnZhcylcclxuXHR7XHJcblx0XHROb2RlQ2FudmFzTW91c2UuY3JlYXRlTm9kZUNhbnZhc01vdXNlKHRoaXMsbm9kZUNhbnZhcyk7XHJcblx0fVxyXG5cclxuXHRzdGF0aWMgY3JlYXRlTm9kZUNhbnZhc01vdXNlKG5vZGVDYW52YXNNb3VzZSxub2RlQ2FudmFzKVxyXG5cdHtcclxuXHRcdG5vZGVDYW52YXNNb3VzZS5ub2RlQ2FudmFzID0gbm9kZUNhbnZhcztcclxuXHRcdGlmKG5vZGVDYW52YXMuaXNWaXNhYmxlKCkpIFxyXG5cdFx0e1xyXG5cdFx0XHRub2RlQ2FudmFzTW91c2Uub2Zmc2V0ID0gTm9kZUNhbnZhc01vdXNlLmdldENhbnZhc09mZnNldChub2RlQ2FudmFzLmNhbnZhc0hvbGRlci5jYW52YXMpO1xyXG5cdFx0XHRub2RlQ2FudmFzTW91c2UubW91c2VTdGF0dXMgPSBuZXcgTW91c2VTdGF0dXMoZmFsc2UsbmV3IFBvc2l0aW9uKDAsMCksbmV3IFBvc2l0aW9uKDAsMCksbnVsbCxudWxsKTtcclxuXHRcdFx0bm9kZUNhbnZhc01vdXNlLmluaXRDYXZhbnNQb2ludGVyKCk7XHJcblx0XHRcdG5vZGVDYW52YXNNb3VzZS5ub2RlTW91c2VNb3ZtZW50ID0ge307XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdHN0YXRpYyBnZXRDYW52YXNPZmZzZXQob2JqKVxyXG5cdHtcclxuXHQgICAgdmFyIG9mZnNldExlZnQgPSAwO1xyXG5cdCAgICB2YXIgb2Zmc2V0VG9wID0gMDtcclxuXHQgICAgZG9cclxuXHQgICAge1xyXG5cdCAgICAgIGlmICghaXNOYU4ob2JqLm9mZnNldExlZnQpKVxyXG5cdCAgICAgIHtcclxuXHQgICAgICAgICAgb2Zmc2V0TGVmdCArPSBvYmoub2Zmc2V0TGVmdDtcclxuXHQgICAgICB9XHJcblx0ICAgICAgaWYgKCFpc05hTihvYmoub2Zmc2V0VG9wKSlcclxuXHQgICAgICB7XHJcblx0ICAgICAgICAgIG9mZnNldFRvcCArPSBvYmoub2Zmc2V0VG9wO1xyXG5cdCAgICAgIH0gICBcclxuXHQgICAgfVxyXG5cdCAgICB3aGlsZShvYmogPSBvYmoub2Zmc2V0UGFyZW50ICk7XHJcblx0ICAgIFxyXG5cdCAgICByZXR1cm4ge2xlZnQ6IG9mZnNldExlZnQsIHRvcDogb2Zmc2V0VG9wfTtcclxuXHR9XHJcblxyXG5cdHBvaW50ZXJEb3duRXZlbnQoZXZlbnQpXHJcblx0e1xyXG5cdFx0dmFyIGV2ZW50UG9zaXRpb24gPSBuZXcgUG9zaXRpb24oZXZlbnQucGFnZVgtdGhpcy5vZmZzZXQubGVmdCxldmVudC5wYWdlWS10aGlzLm9mZnNldC50b3ApO1xyXG5cdFx0dGhpcy5oaWRlQ3VycmVudE5vZGVJbmZvKCk7XHJcblx0XHJcblx0XHR0aGlzLm1vdXNlU3RhdHVzLmlzRG93biA9IHRydWU7XHJcblx0XHR0aGlzLm1vdXNlU3RhdHVzLnN0YXJ0UG9zaXRpb24gPSBldmVudFBvc2l0aW9uO1xyXG5cdFx0dGhpcy5tb3VzZVN0YXR1cy5wb3NpdGlvbiA9IGV2ZW50UG9zaXRpb247XHJcblx0XHRpZih0aGlzLm1vdXNlU3RhdHVzLm5vZGUhPW51bGwpXHJcblx0XHR7XHJcblx0XHRcdHRoaXMubW91c2VTdGF0dXMubm9kZS5pc0FuaW1hdGVkID0gdHJ1ZTtcclxuXHRcdFx0dGhpcy5tb3VzZVN0YXR1cy5ub2RlLmlzU2VsZWN0ZWQgPSBmYWxzZTtcclxuXHRcdFx0dGhpcy5tb3VzZVN0YXR1cy5ub2RlID0gbnVsbDtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0dmFyIGNsaWNrTm9kZSA9ICB0aGlzLm5vZGVDYW52YXMuZ2V0Tm9kZUNvbnRhaW5pbmdQb3NpdGlvbihldmVudFBvc2l0aW9uKTtcclxuXHRcclxuXHRcdHZhciBjbGlja05vZGUgPSAgdGhpcy5ub2RlQ2FudmFzLmdldE5vZGVDb250YWluaW5nUG9zaXRpb24oZXZlbnRQb3NpdGlvbik7XHJcblx0XHRpZihjbGlja05vZGUhPW51bGwgJiYgY2xpY2tOb2RlIT10aGlzLm1vdXNlU3RhdHVzLmxhc3ROb2RlKVxyXG5cdFx0e1xyXG5cdFx0XHR0aGlzLm1vdXNlU3RhdHVzLm5vZGUgPSBjbGlja05vZGU7XHJcblx0XHRcdHRoaXMubW91c2VTdGF0dXMubm9kZVN0YXJ0UG9zaXRpb24gPSBjbGlja05vZGUucG9zaXRpb24uY2xvbmUoKTtcclxuXHRcdFx0dGhpcy5tb3VzZVN0YXR1cy5ub2RlLmlzU2VsZWN0ZWQgPSB0cnVlO1xyXG5cdFx0XHR0aGlzLm1vdXNlU3RhdHVzLm9mZnNldCA9IGNsaWNrTm9kZS5wb3NpdGlvbi5nZXREZWx0YShldmVudFBvc2l0aW9uKTtcclxuXHRcdFx0dGhpcy5ub2RlQ2FudmFzLnBvaW50ZXJEb3duKGNsaWNrTm9kZSk7XHJcblx0XHRcdFxyXG5cdFx0XHR0aGlzLnNob3dDdXJyZW50Tm9kZUluZm8oKTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0aWYoY2xpY2tOb2RlPT1udWxsKVxyXG5cdFx0e1xyXG5cdFx0XHR0aGlzLmhpZGVDdXJyZW50Tm9kZUluZm8oKTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0aWYodGhpcy5tb3VzZVN0YXR1cy5sYXN0Tm9kZSlcclxuXHRcdHtcclxuXHRcdFx0dGhpcy5oaWRlQ3VycmVudE5vZGVJbmZvKCk7XHJcblx0XHRcdHRoaXMubW91c2VTdGF0dXMubGFzdE5vZGUuaXNTZWxlY3RlZCA9IGZhbHNlO1xyXG5cdFx0XHR0aGlzLm1vdXNlU3RhdHVzLmxhc3ROb2RlID0gbnVsbDtcclxuXHRcdH1cclxuXHRcclxuXHR9XHJcblx0XHJcblx0c2hvd0N1cnJlbnROb2RlSW5mbygpXHJcblx0e1xyXG5cdFx0dmFyIGh0bWxPYmplY3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm5vZGVpbmZvXCIpO1xyXG5cdFx0aWYoaHRtbE9iamVjdCE9bnVsbClcclxuXHRcdHtcclxuXHRcdFx0aHRtbE9iamVjdC5zdHlsZS5sZWZ0ID0gdGhpcy5tb3VzZVN0YXR1cy5ub2RlLnBvc2l0aW9uLmdldFgoKSszMCsncHgnO1xyXG5cdFx0XHRodG1sT2JqZWN0LnN0eWxlLnRvcCAgPSB0aGlzLm1vdXNlU3RhdHVzLm5vZGUucG9zaXRpb24uZ2V0WSgpKydweCc7XHJcblx0XHRcdGh0bWxPYmplY3Quc3R5bGUudmlzaWJpbGl0eSA9ICd2aXNpYmxlJztcclxuXHRcdFx0JCgnI25vZGVpbmZvJykuaHRtbCh0aGlzLm1vdXNlU3RhdHVzLm5vZGUuZ2V0Tm9kZVVpRGlzcGxheSgpKTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0Y29uc29sZS5sb2coXCJuYW1lOlwiK3RoaXMubW91c2VTdGF0dXMubm9kZS5uYW1lK1wiXFxuXCIrXHJcblx0XHRcdFx0XCJcdGlzU2VsZWN0ZWQ6XCIrdGhpcy5tb3VzZVN0YXR1cy5ub2RlLmlzU2VsZWN0ZWQrXCJcXG5cIitcclxuXHRcdFx0XHRcIlx0aXNTZWxlY3RlZDpcIit0aGlzLm1vdXNlU3RhdHVzLm5vZGUuaXNBbmltYXRlZCtcIlxcblwiK1xyXG5cdFx0XHRcdFwiXHRwb3NpdGlvbjpcIitDb21tb24udG9TdHJpbmcodGhpcy5tb3VzZVN0YXR1cy5ub2RlLnBvc2l0aW9uKStcIlxcblwiK1xyXG5cdFx0XHRcdFwiXHRpc1NlbGVjdGVkOlwiK3RoaXMubW91c2VTdGF0dXMubm9kZS5pc1NlbGVjdGVkK1xyXG5cdFx0XHRcdFwiLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXCIrXHJcblx0XHRcdFwiXCIpO1xyXG5cdH1cclxuXHRcclxuXHRoaWRlQ3VycmVudE5vZGVJbmZvKClcclxuXHR7XHJcblx0XHR2YXIgaHRtbE9iamVjdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibm9kZWluZm9cIik7XHJcblx0XHRpZihodG1sT2JqZWN0IT1udWxsKVxyXG5cdFx0e1xyXG5cdFx0XHRodG1sT2JqZWN0LnN0eWxlLmxlZnQgPSAwKydweCc7XHJcblx0XHRcdGh0bWxPYmplY3Quc3R5bGUudG9wICA9IDArJ3B4JztcclxuXHRcdFx0aHRtbE9iamVjdC5zdHlsZS52aXNpYmlsaXR5ID0gJ2hpZGRlbic7XHJcblx0XHRcdCQoJyNub2RlaW5mbycpLmh0bWwoKTtcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0cG9pbnRlck1vdmVFdmVudChldmVudClcclxuXHR7XHJcblx0XHR2YXIgZXZlbnRQb3NpdGlvbiA9IG5ldyBQb3NpdGlvbihldmVudC5wYWdlWC10aGlzLm9mZnNldC5sZWZ0LGV2ZW50LnBhZ2VZLXRoaXMub2Zmc2V0LnRvcCk7XHJcblx0XHRpZih0aGlzLm1vdXNlU3RhdHVzLmlzRG93bilcclxuXHRcdHtcclxuXHRcdFx0dGhpcy5oaWRlQ3VycmVudE5vZGVJbmZvKCk7XHJcblx0XHJcblx0XHRcdGlmKHRoaXMubW91c2VTdGF0dXMubm9kZSE9bnVsbClcclxuXHRcdFx0e1xyXG5cdFx0XHRcdHRoaXMubW91c2VTdGF0dXMubm9kZS5pc0FuaW1hdGVkID0gZmFsc2U7XHJcblx0XHRcdFx0dGhpcy5tb3VzZVN0YXR1cy5wb3NpdGlvbiA9IGV2ZW50UG9zaXRpb247XHJcblx0XHRcdFx0dmFyIGRlbHRhUG9zaXRpb24gPSB0aGlzLm1vdXNlU3RhdHVzLm5vZGVTdGFydFBvc2l0aW9uLmdldERlbHRhKGV2ZW50UG9zaXRpb24pO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdHRoaXMubW91c2VTdGF0dXMubm9kZS5wb3NpdGlvbi5zZXRYKFxyXG5cdFx0XHRcdFx0XHR0aGlzLm1vdXNlU3RhdHVzLm5vZGVTdGFydFBvc2l0aW9uLmdldFgoKS1cclxuXHRcdFx0XHRcdFx0ZGVsdGFQb3NpdGlvbi5nZXRYKCkrXHJcblx0XHRcdFx0XHRcdHRoaXMubW91c2VTdGF0dXMub2Zmc2V0LmdldFgoKSk7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0dGhpcy5tb3VzZVN0YXR1cy5ub2RlLnBvc2l0aW9uLnNldFkoXHJcblx0XHRcdFx0XHRcdHRoaXMubW91c2VTdGF0dXMubm9kZVN0YXJ0UG9zaXRpb24uZ2V0WSgpLVxyXG5cdFx0XHRcdFx0XHRkZWx0YVBvc2l0aW9uLmdldFkoKStcclxuXHRcdFx0XHRcdFx0dGhpcy5tb3VzZVN0YXR1cy5vZmZzZXQuZ2V0WSgpKTtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHR0aGlzLm5vZGVDYW52YXMucG9pbnRlck1vdmUodGhpcy5tb3VzZVN0YXR1cy5ub2RlKTtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHRpZighdGhpcy5ub2RlTW91c2VNb3ZtZW50Lmhhc093blByb3BlcnR5KHRoaXMubW91c2VTdGF0dXMubm9kZS5nZXROb2RlS2V5KCkpKVxyXG5cdFx0XHRcdHtcclxuXHRcdFx0XHRcdHRoaXMubm9kZU1vdXNlTW92bWVudFt0aGlzLm1vdXNlU3RhdHVzLm5vZGUuZ2V0Tm9kZUtleSgpXSA9XHJcblx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdFx0bW92ZVBvc3Rpb25BcnJheTpuZXcgQXJyYXkoKVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHR0aGlzLm5vZGVNb3VzZU1vdm1lbnRbdGhpcy5tb3VzZVN0YXR1cy5ub2RlLmdldE5vZGVLZXkoKV0ubW92ZVBvc3Rpb25BcnJheS5wdXNoKHRoaXMubW91c2VTdGF0dXMubm9kZS5wb3NpdGlvbi5jbG9uZSgpKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0ZWxzZVxyXG5cdFx0e1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHRwb2ludGVyVXBFdmVudChldmVudClcclxuXHR7XHJcblx0XHRpZih0aGlzLm1vdXNlU3RhdHVzLm5vZGUhPW51bGwpXHJcblx0XHR7XHJcblx0XHRcdHRoaXMubm9kZUNhbnZhcy5wb2ludGVyVXAodGhpcy5tb3VzZVN0YXR1cy5ub2RlKTtcclxuXHRcdFx0dGhpcy5tb3VzZVN0YXR1cy5ub2RlLmlzQW5pbWF0ZWQgPSB0cnVlO1xyXG5cdFx0XHQvL3RoaXMubW91c2VTdGF0dXMubm9kZS5pc1NlbGVjdGVkID0gZmFsc2U7XHJcblx0XHRcdHRoaXMubW91c2VTdGF0dXMubGFzdE5vZGUgPSB0aGlzLm1vdXNlU3RhdHVzLm5vZGU7XHJcblx0XHJcblx0XHRcdHRoaXMubW91c2VTdGF0dXMubm9kZSA9IG51bGw7XHJcblx0XHR9XHJcblx0XHR0aGlzLm1vdXNlU3RhdHVzLmlzRG93biA9IGZhbHNlO1xyXG5cdH1cclxuXHRcclxuXHRpbml0Q2F2YW5zUG9pbnRlcigpXHJcblx0e1xyXG5cdFx0dmFyIHNlbGYgPSB0aGlzO1xyXG5cdFx0aWYod2luZG93LlBvaW50ZXJFdmVudClcclxuXHRcdHtcclxuXHRcdFx0dGhpcy5ub2RlQ2FudmFzLmNhbnZhc0hvbGRlci5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcInBvaW50ZXJkb3duXCIsIGZ1bmN0aW9uKGV2ZW50KSB7IHNlbGYucG9pbnRlckRvd25FdmVudCggZXZlbnQpIH0sIGZhbHNlKTtcclxuXHRcdFx0dGhpcy5ub2RlQ2FudmFzLmNhbnZhc0hvbGRlci5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcInBvaW50ZXJtb3ZlXCIsZnVuY3Rpb24oZXZlbnQpIHsgc2VsZi5wb2ludGVyTW92ZUV2ZW50KCBldmVudCkgfSwgZmFsc2UpO1xyXG5cdFx0XHR0aGlzLm5vZGVDYW52YXMuY2FudmFzSG9sZGVyLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwicG9pbnRlcnVwXCIsZnVuY3Rpb24oZXZlbnQpIHsgc2VsZi5wb2ludGVyVXBFdmVudCggZXZlbnQpIH0sIGZhbHNlKTtcclxuXHQgICAgfVxyXG5cdCAgICBlbHNlXHJcblx0ICAgIHtcclxuXHQgICAgXHR0aGlzLm5vZGVDYW52YXMuY2FudmFzSG9sZGVyLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsZnVuY3Rpb24oZXZlbnQpIHsgc2VsZi5wb2ludGVyRG93bkV2ZW50KCBldmVudCkgfSwgZmFsc2UpO1xyXG5cdCAgICBcdHRoaXMubm9kZUNhbnZhcy5jYW52YXNIb2xkZXIuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIixmdW5jdGlvbihldmVudCkgeyBzZWxmLnBvaW50ZXJNb3ZlRXZlbnQoIGV2ZW50KSB9LCBmYWxzZSk7XHJcblx0ICAgIFx0dGhpcy5ub2RlQ2FudmFzLmNhbnZhc0hvbGRlci5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgZnVuY3Rpb24oZXZlbnQpIHsgc2VsZi5wb2ludGVyVXBFdmVudCggZXZlbnQpIH0sIGZhbHNlKTtcclxuXHQgICAgfSAgXHJcblx0fVxyXG59XHJcblxyXG4vLzxqczJub2RlPlxyXG5tb2R1bGUuZXhwb3J0cyA9IE5vZGVDYW52YXNNb3VzZTtcclxuY29uc29sZS5sb2coXCJMb2FkaW5nOk5vZGVDYW52YXNNb3VzZVwiKTtcclxuLy88L2pzMm5vZGU+XHJcbiIsInZhciBQb3NpdGlvbiA9IHJlcXVpcmUoJy4uLy4uL25vZGVzL3Bvc2l0aW9uL3Bvc2l0aW9uJyk7XHJcbnZhciBOb2RlRGlzcGxheSA9IHJlcXVpcmUoJy4uLy4uL25vZGVzL25vZGVkaXNwbGF5L25vZGVkaXNwbGF5Jyk7XHJcbnZhciBDb21tb24gPSByZXF1aXJlKCcuLi8uLi9jb21tb24vY29tbW9uJyk7XHJcbnZhciBTaGFwZSA9IHJlcXVpcmUoJy4uLy4uL25vZGVzL3NoYXBlcy9zaGFwZScpO1xyXG5cclxuY2xhc3MgQXJjRGlzcGxheVNoYXBlIGV4dGVuZHMgTm9kZURpc3BsYXlcclxue1xyXG5cdGNvbnN0cnVjdG9yKGRpc3BsYXlJbmZvKVxyXG5cdHtcclxuXHRcdHN1cGVyKGRpc3BsYXlJbmZvKTtcclxuXHRcdHRoaXMucG9pbnRMaXN0ID0gbmV3IEFycmF5KCk7XHJcblx0XHR0aGlzLnNoYXBlID0gbnVsbDtcclxuXHRcdHRoaXMuaW5pdCgpO1xyXG5cdFx0XHJcblx0fVxyXG5cdFxyXG5cdGluaXQoKVxyXG5cdHtcclxuXHRcdHRoaXMucG9pbnRMaXN0Lmxlbmd0aCA9IDA7XHJcblx0XHR0aGlzLmFuZ2xlID0gTWF0aC5hYnModGhpcy5kaXNwbGF5SW5mby5lbmRBbmdsZSx0aGlzLmRpc3BsYXlJbmZvLnN0YXJ0QW5nbGUpO1xyXG5cdFx0dmFyIGFuZ2xlSW5jID0gdGhpcy5hbmdsZSAvIHRoaXMuZGlzcGxheUluZm8uY3VydmVQb2ludHM7XHJcblx0XHRcclxuXHRcdHRoaXMucG9pbnRMaXN0LnB1c2gobmV3IFBvc2l0aW9uKDAsMCkpO1xyXG5cdFx0Zm9yKHZhciBhbmdsZT10aGlzLmRpc3BsYXlJbmZvLnN0YXJ0QW5nbGU7XHJcblx0XHRcdGFuZ2xlPD10aGlzLmRpc3BsYXlJbmZvLmVuZEFuZ2xlICYmIGFuZ2xlSW5jPjA7XHJcblx0XHRcdGFuZ2xlPWFuZ2xlK2FuZ2xlSW5jKVxyXG5cdFx0e1xyXG5cdFx0XHRpZiggKGFuZ2xlK2FuZ2xlSW5jKSA+IHRoaXMuZGlzcGxheUluZm8uZW5kQW5nbGUgKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0aWYoYW5nbGUhPXRoaXMuZGlzcGxheUluZm8uZW5kQW5nbGUpIGFuZ2xlID0gdGhpcy5kaXNwbGF5SW5mby5lbmRBbmdsZSA7XHJcblx0XHRcdH1cclxuXHRcdFx0dmFyIHJhZHMgPSBhbmdsZSAqIChNYXRoLlBJLzE4MCk7XHJcblx0XHRcdHRoaXMucG9pbnRMaXN0LnB1c2goXHJcblx0XHRcdFx0XHRuZXcgUG9zaXRpb24oXHJcblx0XHRcdFx0XHRcdFx0dGhpcy5kaXNwbGF5SW5mby5yYWRpdXMqTWF0aC5jb3MocmFkcyksXHJcblx0XHRcdFx0XHRcdFx0dGhpcy5kaXNwbGF5SW5mby5yYWRpdXMqTWF0aC5zaW4ocmFkcykpXHJcblx0XHRcdFx0XHQpO1x0XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHRoaXMucG9pbnRMaXN0LnB1c2gobmV3IFBvc2l0aW9uKDAsMCkpO1xyXG5cdFx0aWYodGhpcy5zaGFwZT09bnVsbCkgdGhpcy5zaGFwZSA9IG5ldyBTaGFwZSh0aGlzLnBvaW50TGlzdCk7XHJcblx0XHRlbHNlIHRoaXMuc2hhcGUuaW5pdFNoYXBlKCk7XHJcblx0fVxyXG5cdFxyXG5cdGNvbnRhaW5zUG9zaXRpb24ocG9zaXRpb24sbm9kZSlcclxuXHR7XHJcblx0XHR2YXIgZGlzdGFuY2UgPSBub2RlLnBvc2l0aW9uLmdldERpc3RhbmNlKHBvc2l0aW9uKTtcclxuXHRcdHJldHVybihkaXN0YW5jZTw9dGhpcy5kaXNwbGF5SW5mby5yYWRpdXMpO1xyXG5cdH1cclxuXHRcclxuXHRcclxuXHRkcmF3Tm9kZXgoY2FudmFzSG9sZGVyLG5vZGUpXHJcblx0e1xyXG5cclxuXHR9XHJcblx0XHJcblx0ZHJhd05vZGUoY2FudmFzSG9sZGVyLG5vZGUpXHJcblx0e1xyXG5cdFx0c3VwZXIuZHJhd05vZGUoY2FudmFzSG9sZGVyLG5vZGUpO1xyXG5cclxuXHQgICAgaWYobm9kZS5pc1NlbGVjdGVkKVxyXG5cdCAgICB7XHJcblx0ICAgIFx0Y2FudmFzSG9sZGVyLmNvbnRleHQuZmlsbFN0eWxlID0gQ29tbW9uLmdldENvbG9yRnJvbVN0cmluZyh0aGlzLmRpc3BsYXlJbmZvLnNlbGVjdEZpbGxDb2xvcik7XHJcblx0ICAgIFx0Y2FudmFzSG9sZGVyLmNvbnRleHQuc3Ryb2tlU3R5bGUgPSBDb21tb24uZ2V0Q29sb3JGcm9tU3RyaW5nKHRoaXMuZGlzcGxheUluZm8uc2VsZWN0Qm9yZGVyQ29sb3IpO1xyXG5cdCAgICB9XHJcblx0ICAgIGVsc2VcclxuXHQgICAge1xyXG5cdCAgICBcdGNhbnZhc0hvbGRlci5jb250ZXh0LmZpbGxTdHlsZSA9IENvbW1vbi5nZXRDb2xvckZyb21TdHJpbmcodGhpcy5kaXNwbGF5SW5mby5maWxsQ29sb3IpO1xyXG5cdCAgICBcdGNhbnZhc0hvbGRlci5jb250ZXh0LnN0cm9rZVN0eWxlID0gQ29tbW9uLmdldENvbG9yRnJvbVN0cmluZyh0aGlzLmRpc3BsYXlJbmZvLmJvcmRlckNvbG9yKTtcclxuXHQgICAgfVxyXG5cdCAgIC8qIFxyXG5cdCAgICBjYW52YXNIb2xkZXIuY29udGV4dC5iZWdpblBhdGgoKTtcclxuXHQgICAgY2FudmFzSG9sZGVyLmNvbnRleHQuYXJjKG5vZGUucG9zaXRpb24uZ2V0WCgpLG5vZGUucG9zaXRpb24uZ2V0WSgpLHRoaXMuZGlzcGxheUluZm8ucmFkaXVzLDAsTWF0aC5QSSAqIDIsIGZhbHNlKTtcclxuXHQgICAgY2FudmFzSG9sZGVyLmNvbnRleHQuY2xvc2VQYXRoKCk7XHJcblx0ICAgIGNhbnZhc0hvbGRlci5jb250ZXh0LmZpbGwoKTtcclxuXHQgICAgY2FudmFzSG9sZGVyLmNvbnRleHQubGluZVdpZHRoID0gdGhpcy5kaXNwbGF5SW5mby5ib3JkZXJXaWR0aDtcclxuXHQgICAgY2FudmFzSG9sZGVyLmNvbnRleHQuc3Ryb2tlKCk7XHJcblx0ICAgICovXHJcblx0ICAgIGNhbnZhc0hvbGRlci5jb250ZXh0LmJlZ2luUGF0aCgpOyAvL0JlZ2lucyBkcmF3aW5nIHRoZSBwYXRoLiBTZWUgbGluayBpbiBcIkVkaXRcIiBzZWN0aW9uXHJcblx0ICAgIGNhbnZhc0hvbGRlci5jb250ZXh0Lm1vdmVUbyhub2RlLnBvc2l0aW9uLmdldFgoKSxub2RlLnBvc2l0aW9uLmdldFkoKSk7IC8vTW92ZXMgdGhlIGJlZ2lubmluZyBwb3NpdGlvbiB0byBjeCwgY3kgKDEwMCwgNzUpXHJcblx0ICAgIGNhbnZhc0hvbGRlci5jb250ZXh0LmFyYyhub2RlLnBvc2l0aW9uLmdldFgoKSxub2RlLnBvc2l0aW9uLmdldFkoKSxcclxuXHQgICAgXHRcdHRoaXMuZGlzcGxheUluZm8ucmFkaXVzLFxyXG5cdCAgICBcdFx0dGhpcy50b1JhZGlhbnModGhpcy5kaXNwbGF5SW5mby5zdGFydEFuZ2xlKSxcclxuXHQgICAgXHRcdHRoaXMudG9SYWRpYW5zKHRoaXMuZGlzcGxheUluZm8uZW5kQW5nbGUpKTsgLy9cdGN0eC5hcmMoY3gsIGN5LCByYWRpdXMsIHN0YXJ0QW5nbGUsIGVuZEFuZ2xlLCBjb3VudGVyY2xvY2t3aXNlIChvcHRpb25hbCkpO1xyXG5cdCAgICBjYW52YXNIb2xkZXIuY29udGV4dC5saW5lVG8obm9kZS5wb3NpdGlvbi5nZXRYKCksbm9kZS5wb3NpdGlvbi5nZXRZKCkpOyAvL0RyYXdzIGxpbmVzIGZyb20gdGhlIGVuZHMgb2YgdGhlIGFyYyB0byBjeCBhbmQgY3lcclxuXHQgICAgY2FudmFzSG9sZGVyLmNvbnRleHQuY2xvc2VQYXRoKCk7IC8vRmluaXNoZXMgZHJhd2luZyB0aGUgcGF0aFxyXG5cdCAgICBjYW52YXNIb2xkZXIuY29udGV4dC5maWxsKCk7IC8vQWN0dWFsbHkgZHJhd3MgdGhlIHNoYXBlIChhbmQgZmlsbHMpXHJcblx0ICAgIGNhbnZhc0hvbGRlci5jb250ZXh0LmxpbmVXaWR0aCA9IHRoaXMuZGlzcGxheUluZm8uYm9yZGVyV2lkdGg7XHJcblx0ICAgIGNhbnZhc0hvbGRlci5jb250ZXh0LnN0cm9rZSgpO1xyXG5cdH1cclxuXHQvL3RoaXMuZGlzcGxheUluZm8uZW5kQW5nbGUsdGhpcy5kaXNwbGF5SW5mby5zdGFydEFuZ2xlXHJcblx0dG9SYWRpYW5zKGRlZylcclxuXHR7XHJcblx0ICAgIHJldHVybiBkZWcgKiBNYXRoLlBJIC8gMTgwIC8vQ29udmVydHMgZGVncmVlcyBpbnRvIHJhZGlhbnNcclxuXHR9XHJcbn1cclxuLy88anMybm9kZT5cclxubW9kdWxlLmV4cG9ydHMgPSBBcmNEaXNwbGF5U2hhcGU7XHJcbmNvbnNvbGUubG9nKFwiTG9hZGluZzpBcmNEaXNwbGF5U2hhcGVcIik7XHJcbi8vPC9qczJub2RlPlxyXG4iLCJ2YXIgUG9zaXRpb24gPSByZXF1aXJlKCcuLi8uLi9ub2Rlcy9wb3NpdGlvbi9wb3NpdGlvbicpO1xyXG52YXIgTm9kZURpc3BsYXkgPSByZXF1aXJlKCcuLi8uLi9ub2Rlcy9ub2RlZGlzcGxheS9ub2RlZGlzcGxheScpO1xyXG52YXIgQ29tbW9uID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL2NvbW1vbicpO1xyXG5cclxuXHJcbmNsYXNzIENpcmNsZURpc3BsYXkgZXh0ZW5kcyBOb2RlRGlzcGxheVxyXG57XHJcblx0Y29uc3RydWN0b3IoZGlzcGxheUluZm8pXHJcblx0e1xyXG5cdFx0c3VwZXIoZGlzcGxheUluZm8pO1xyXG5cdH1cclxuXHRcclxuXHRjb250YWluc1Bvc2l0aW9uKHBvc2l0aW9uLG5vZGUpXHJcblx0e1xyXG5cdFx0dmFyIGRpc3RhbmNlID0gbm9kZS5wb3NpdGlvbi5nZXREaXN0YW5jZShwb3NpdGlvbik7XHJcblx0XHRyZXR1cm4oZGlzdGFuY2U8PXRoaXMuZGlzcGxheUluZm8ucmFkaXVzKTtcclxuXHR9XHJcblx0XHJcblx0XHJcblx0ZHJhd05vZGUoY2FudmFzSG9sZGVyLG5vZGUpXHJcblx0e1xyXG5cdFx0c3VwZXIuZHJhd05vZGUoY2FudmFzSG9sZGVyLG5vZGUpO1xyXG5cclxuXHQgICAgaWYobm9kZS5pc1NlbGVjdGVkKVxyXG5cdCAgICB7XHJcblx0ICAgIFx0Y2FudmFzSG9sZGVyLmNvbnRleHQuZmlsbFN0eWxlID0gQ29tbW9uLmdldENvbG9yRnJvbVN0cmluZyh0aGlzLmRpc3BsYXlJbmZvLnNlbGVjdEZpbGxDb2xvcik7XHJcblx0ICAgIFx0Y2FudmFzSG9sZGVyLmNvbnRleHQuc3Ryb2tlU3R5bGUgPSBDb21tb24uZ2V0Q29sb3JGcm9tU3RyaW5nKHRoaXMuZGlzcGxheUluZm8uc2VsZWN0Qm9yZGVyQ29sb3IpO1xyXG5cdCAgICB9XHJcblx0ICAgIGVsc2VcclxuXHQgICAge1xyXG5cdCAgICBcdGNhbnZhc0hvbGRlci5jb250ZXh0LmZpbGxTdHlsZSA9IENvbW1vbi5nZXRDb2xvckZyb21TdHJpbmcodGhpcy5kaXNwbGF5SW5mby5maWxsQ29sb3IpO1xyXG5cdCAgICBcdGNhbnZhc0hvbGRlci5jb250ZXh0LnN0cm9rZVN0eWxlID0gQ29tbW9uLmdldENvbG9yRnJvbVN0cmluZyh0aGlzLmRpc3BsYXlJbmZvLmJvcmRlckNvbG9yKTtcclxuXHQgICAgfVxyXG5cdCAgICBcclxuXHQgICAgY2FudmFzSG9sZGVyLmNvbnRleHQuYmVnaW5QYXRoKCk7XHJcblx0ICAgIGNhbnZhc0hvbGRlci5jb250ZXh0LmFyYyhub2RlLnBvc2l0aW9uLmdldFgoKSxub2RlLnBvc2l0aW9uLmdldFkoKSx0aGlzLmRpc3BsYXlJbmZvLnJhZGl1cywwLE1hdGguUEkgKiAyLCBmYWxzZSk7XHJcblx0ICAgIGNhbnZhc0hvbGRlci5jb250ZXh0LmNsb3NlUGF0aCgpO1xyXG5cdCAgICBjYW52YXNIb2xkZXIuY29udGV4dC5maWxsKCk7XHJcblx0ICAgIGNhbnZhc0hvbGRlci5jb250ZXh0LmxpbmVXaWR0aCA9IHRoaXMuZGlzcGxheUluZm8uYm9yZGVyV2lkdGg7XHJcblx0ICAgIGNhbnZhc0hvbGRlci5jb250ZXh0LnN0cm9rZSgpO1xyXG5cdH1cclxufVxyXG4vLzxqczJub2RlPlxyXG5tb2R1bGUuZXhwb3J0cyA9IENpcmNsZURpc3BsYXk7XHJcbmNvbnNvbGUubG9nKFwiTG9hZGluZzpDaXJjbGVEaXNwbGF5XCIpO1xyXG4vLzwvanMybm9kZT5cclxuIiwidmFyIENvbW1vbiA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9jb21tb24nKTtcclxudmFyIFBvc2l0aW9uID0gcmVxdWlyZSgnLi4vLi4vbm9kZXMvcG9zaXRpb24vcG9zaXRpb24nKTtcclxuXHJcbmNsYXNzIE5vZGVEaXNwbGF5XHJcbntcclxuXHRjb25zdHJ1Y3RvcihkaXNwbGF5SW5mbylcclxuXHR7XHJcblx0XHROb2RlRGlzcGxheS5jcmVhdGVOb2RlRGlzcGxheSh0aGlzLGRpc3BsYXlJbmZvKTtcclxuXHR9XHJcblx0XHJcblx0c3RhdGljIGNyZWF0ZU5vZGVEaXNwbGF5KG5vZGVEaXNwbGF5LGRpc3BsYXlJbmZvKVxyXG5cdHtcclxuXHRcdG5vZGVEaXNwbGF5LmRpc3BsYXlJbmZvID0gZGlzcGxheUluZm87XHJcblx0fVxyXG5cdFxyXG5cdGRyYXdOb2RlKGNhbnZhc0hvbGRlcixub2RlKVxyXG5cdHtcclxuXHRcdHRoaXMuZHJhd1Bvc2l0aW9uID0gbmV3IFBvc2l0aW9uKFxyXG5cdFx0XHRcdE1hdGgucm91bmQobm9kZS5wb3NpdGlvbi54KSxcclxuXHRcdFx0XHRNYXRoLnJvdW5kKG5vZGUucG9zaXRpb24ueSlcclxuXHRcdFx0XHQpO1xyXG5cdH1cclxuXHRcclxuXHRjb250YWluc1Bvc2l0aW9uKHBvc3Rpb24sbm9kZSlcclxuXHR7XHJcblx0fVxyXG5cdFxyXG5cdGZpbGxUZXh0TXV0aXBsZUxpbmVzKGNvbnRleHQsdGV4dCx4LHksbGluZUhlaWdodCxzcGxpdENoYXIpXHJcblx0e1xyXG5cdFx0dmFyIGxpbmVzID0gdGV4dC5zcGxpdChzcGxpdENoYXIpO1xyXG5cdCAgICB2YXIgbGluZSA9ICcnO1xyXG5cdFxyXG5cdCAgICBmb3IodmFyIG4gPSAwOyBuIDwgbGluZXMubGVuZ3RoOyBuKyspXHJcblx0ICAgIHtcclxuXHQgICAgICB2YXIgbWV0cmljcyA9IGNvbnRleHQubWVhc3VyZVRleHQobGluZXNbbl0pO1xyXG5cdCAgICAgIGNvbnRleHQuZmlsbFRleHQobGluZXNbbl0sIHgsIHkpO1xyXG5cdCAgICAgIHkgPSB5K2xpbmVIZWlnaHQ7IFxyXG5cdCAgICB9XHJcblx0ICAgIGNvbnRleHQuZmlsbFRleHQobGluZSwgeCwgeSk7XHJcblx0IH1cclxuXHRcclxuXHRtZXRyaWNzVGV4dE11dGlwbGVMaW5lcyhjb250ZXh0LHRleHQsbGluZUhlaWdodCxzcGxpdENoYXIpXHJcblx0e1xyXG5cdFx0dmFyIGxpbmVzID0gdGV4dC5zcGxpdChzcGxpdENoYXIpO1xyXG5cdCAgICB2YXIgbGluZSA9ICcnO1xyXG5cdCAgICB2YXIgbWF4V2lkdGggPSAwO1xyXG5cdCAgICB2YXIgdG90YWxIZWlnaHQgPSAwO1xyXG5cdCAgICBmb3IodmFyIG4gPSAwOyBuIDwgbGluZXMubGVuZ3RoOyBuKyspXHJcblx0ICAgIHtcclxuXHQgICAgICB2YXIgbWV0cmljcyA9IGNvbnRleHQubWVhc3VyZVRleHQobGluZXNbbl0pO1xyXG5cdCAgICAgIGlmKG1ldHJpY3Mud2lkdGg+bWF4V2lkdGgpIG1heFdpZHRoID0gbWV0cmljcy53aWR0aDtcclxuXHQgICAgICB0b3RhbEhlaWdodCA9IHRvdGFsSGVpZ2h0ICsgbGluZUhlaWdodDtcclxuXHQgICAgfVxyXG5cdCAgICByZXR1cm4oe3dpZHRoOm1heFdpZHRoLGhlaWdodDp0b3RhbEhlaWdodH0pO1xyXG5cdCB9XHJcblx0XHJcblx0cm91bmRlZFJlY3QoY29udGV4dCx4LHksdyxoLHIsYm9yZGVyV2l0ZGgsYm9yZGVyQ29sb3IscmVjdENvbG9yKVxyXG5cdHtcclxuXHRcdCAgaWYgKHcgPCAyICogcikgciA9IHcgLyAyO1xyXG5cdFx0ICBpZiAoaCA8IDIgKiByKSByID0gaCAvIDI7XHJcblx0XHQgIGNvbnRleHQuYmVnaW5QYXRoKCk7XHJcblx0XHQgIGNvbnRleHQubW92ZVRvKHgrciwgeSk7XHJcblx0XHQgIGNvbnRleHQuYXJjVG8oeCt3LCB5LCAgIHgrdywgeStoLCByKTtcclxuXHRcdCAgY29udGV4dC5hcmNUbyh4K3csIHkraCwgeCwgICB5K2gsIHIpO1xyXG5cdFx0ICBjb250ZXh0LmFyY1RvKHgsICAgeStoLCB4LCAgIHksICAgcik7XHJcblx0XHQgIGNvbnRleHQuYXJjVG8oeCwgICB5LCAgIHgrdywgeSwgICByKTtcclxuXHRcdCAgY29udGV4dC5jbG9zZVBhdGgoKTtcclxuXHRcdC8qXHJcblx0ICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XHJcblx0ICAgIGNvbnRleHQubW92ZVRvKHgsIHkpO1xyXG5cdCAgICBjb250ZXh0LmxpbmVUbyh4ICsgd2lkdGggLSBjb3JuZXJSYWRpdXMsIHkpO1xyXG5cdCAgICBjb250ZXh0LmFyY1RvKHggKyB3aWR0aCwgeSwgeCArIHdpZHRoLCB5ICsgY29ybmVyUmFkaXVzLCBjb3JuZXJSYWRpdXMpO1xyXG5cdCAgICBjb250ZXh0LmxpbmVUbyh4ICsgd2lkdGgsIHkgKyBoZWlnaHQpO1xyXG5cdCAgICovIFxyXG5cdCAgICBjb250ZXh0LmxpbmVXaWR0aCA9IGJvcmRlcldpdGRoO1xyXG5cdCAgICBjb250ZXh0LmZpbGxTdHlsZSA9IHJlY3RDb2xvcjtcclxuXHQgICAgY29udGV4dC5zdHJva2VTdHlsZSA9IGJvcmRlckNvbG9yO1xyXG5cdCAgICBcclxuXHQgICAgY29udGV4dC5zdHJva2UoKTtcclxuXHQgICAgY29udGV4dC5maWxsKCk7XHJcblx0XHJcblx0fVxyXG59XHJcbi8vPGpzMm5vZGU+XHJcbm1vZHVsZS5leHBvcnRzID0gTm9kZURpc3BsYXk7XHJcbmNvbnNvbGUubG9nKFwiTG9hZGluZzpOb2RlRGlzcGxheVwiKTtcclxuLy88L2pzMm5vZGU+XHJcbiIsInZhciBQb3NpdGlvbiA9IHJlcXVpcmUoJy4uLy4uL25vZGVzL3Bvc2l0aW9uL3Bvc2l0aW9uJyk7XHJcbnZhciBOb2RlRGlzcGxheSA9IHJlcXVpcmUoJy4uLy4uL25vZGVzL25vZGVkaXNwbGF5L25vZGVkaXNwbGF5Jyk7XHJcbnZhciBDb21tb24gPSByZXF1aXJlKCcuLi8uLi9jb21tb24vY29tbW9uJyk7XHJcblxyXG5jbGFzcyBSZWN0YW5nbGVEaXNwbGF5IGV4dGVuZHMgTm9kZURpc3BsYXlcclxue1xyXG5cdGNvbnN0cnVjdG9yKGRpc3BsYXlJbmZvKVxyXG5cdHtcclxuXHRcdHN1cGVyKGRpc3BsYXlJbmZvKTtcclxuXHR9XHJcblx0XHJcblx0Y29udGFpbnNQb3NpdGlvbihwb3NpdGlvbixub2RlKVxyXG5cdHtcclxuXHRcdHJldHVybihcclxuXHRcdFx0XHQoXHJcblx0XHRcdFx0XHRcdChub2RlLnBvc2l0aW9uLmdldFgoKS10aGlzLmRpc3BsYXlJbmZvLndpZHRoLzIpPD1wb3NpdGlvbi5nZXRYKCkgJiZcclxuXHRcdFx0XHRcdFx0KG5vZGUucG9zaXRpb24uZ2V0WCgpK3RoaXMuZGlzcGxheUluZm8ud2lkdGgvMik+PXBvc2l0aW9uLmdldFgoKSAmJlxyXG5cdFx0XHRcdFx0XHQobm9kZS5wb3NpdGlvbi5nZXRZKCktdGhpcy5kaXNwbGF5SW5mby5oZWlnaHQvMik8PXBvc2l0aW9uLmdldFkoKSAmJlxyXG5cdFx0XHRcdFx0XHQobm9kZS5wb3NpdGlvbi5nZXRZKCkrdGhpcy5kaXNwbGF5SW5mby5oZWlnaHQvMik+PXBvc2l0aW9uLmdldFkoKVxyXG5cdFx0XHRcdClcclxuXHRcdFx0KTtcclxuXHR9XHJcblx0XHJcblx0XHJcblx0ZHJhd05vZGUoY2FudmFzSG9sZGVyLG5vZGUpXHJcblx0e1xyXG5cdFx0c3VwZXIuZHJhd05vZGUoY2FudmFzSG9sZGVyLG5vZGUpO1xyXG5cclxuXHQgICAgaWYobm9kZS5pc1NlbGVjdGVkKVxyXG5cdCAgICB7XHJcblx0ICAgIFx0Y2FudmFzSG9sZGVyLmNvbnRleHQuZmlsbFN0eWxlID0gQ29tbW9uLmdldENvbG9yRnJvbVN0cmluZyh0aGlzLmRpc3BsYXlJbmZvLnNlbGVjdEZpbGxDb2xvcik7XHJcblx0ICAgIFx0Y2FudmFzSG9sZGVyLmNvbnRleHQuc3Ryb2tlU3R5bGUgPSBDb21tb24uZ2V0Q29sb3JGcm9tU3RyaW5nKHRoaXMuZGlzcGxheUluZm8uc2VsZWN0Qm9yZGVyQ29sb3IpO1xyXG5cdCAgICB9XHJcblx0ICAgIGVsc2VcclxuXHQgICAge1xyXG5cdCAgICBcdGNhbnZhc0hvbGRlci5jb250ZXh0LmZpbGxTdHlsZSA9IENvbW1vbi5nZXRDb2xvckZyb21TdHJpbmcodGhpcy5kaXNwbGF5SW5mby5maWxsQ29sb3IpO1xyXG5cdCAgICBcdGNhbnZhc0hvbGRlci5jb250ZXh0LnN0cm9rZVN0eWxlID0gQ29tbW9uLmdldENvbG9yRnJvbVN0cmluZyh0aGlzLmRpc3BsYXlJbmZvLmJvcmRlckNvbG9yKTtcclxuXHQgICAgfVxyXG5cdCAgICAvL2NvbnNvbGUubG9nKENvbW1vbnRvU3RyaW5nKHRoaXMuZGlzcGxheUluZm8pKTtcclxuXHQgICAgY2FudmFzSG9sZGVyLmNvbnRleHQuZmlsbFJlY3QoIFxyXG5cdCAgICBcdFx0KG5vZGUucG9zaXRpb24uZ2V0WCgpLXRoaXMuZGlzcGxheUluZm8ud2lkdGgvMiksXHJcblx0ICAgIFx0XHQobm9kZS5wb3NpdGlvbi5nZXRZKCktdGhpcy5kaXNwbGF5SW5mby5oZWlnaHQvMiksXHJcblx0ICAgIFx0XHR0aGlzLmRpc3BsYXlJbmZvLndpZHRoLFxyXG5cdCAgICBcdFx0dGhpcy5kaXNwbGF5SW5mby5oZWlnaHQpO1xyXG5cdCAgICBjYW52YXNIb2xkZXIuY29udGV4dC5saW5lV2lkdGggPSB0aGlzLmRpc3BsYXlJbmZvLmJvcmRlcldpZHRoO1xyXG5cdCAgICBjYW52YXNIb2xkZXIuY29udGV4dC5zdHJva2VTdHlsZSA9IENvbW1vbi5nZXRDb2xvckZyb21TdHJpbmcodGhpcy5kaXNwbGF5SW5mby5ib3JkZXJDb2xvcik7XHJcblx0ICAgIGNhbnZhc0hvbGRlci5jb250ZXh0LnN0cm9rZVJlY3QoIFxyXG5cdCAgICBcdFx0KG5vZGUucG9zaXRpb24uZ2V0WCgpLXRoaXMuZGlzcGxheUluZm8ud2lkdGgvMiksIFxyXG5cdCAgICBcdFx0KG5vZGUucG9zaXRpb24uZ2V0WSgpLXRoaXMuZGlzcGxheUluZm8uaGVpZ2h0LzIpLCBcclxuXHQgICAgXHRcdHRoaXMuZGlzcGxheUluZm8ud2lkdGgsIFxyXG5cdCAgICBcdFx0dGhpcy5kaXNwbGF5SW5mby5oZWlnaHQpO1xyXG5cdFxyXG5cdH1cclxufVxyXG4vLzxqczJub2RlPlxyXG5tb2R1bGUuZXhwb3J0cyA9IFJlY3RhbmdsZURpc3BsYXk7XHJcbmNvbnNvbGUubG9nKFwiTG9hZGluZzpSZWN0YW5nbGVEaXNwbGF5XCIpO1xyXG4vLzwvanMybm9kZT5cclxuIiwidmFyIFBvc2l0aW9uID0gcmVxdWlyZSgnLi4vLi4vbm9kZXMvcG9zaXRpb24vcG9zaXRpb24nKTtcclxudmFyIE5vZGVEaXNwbGF5ID0gcmVxdWlyZSgnLi4vLi4vbm9kZXMvbm9kZWRpc3BsYXkvbm9kZWRpc3BsYXknKTtcclxudmFyIENvbW1vbiA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9jb21tb24nKTtcclxudmFyIFNoYXBlID0gcmVxdWlyZSgnLi4vLi4vbm9kZXMvc2hhcGVzL3NoYXBlJyk7XHJcblxyXG5jbGFzcyBUcmlhbmdsZURpc3BsYXkgZXh0ZW5kcyBOb2RlRGlzcGxheVxyXG57XHJcblx0Y29uc3RydWN0b3IoZGlzcGxheUluZm8pXHJcblx0e1xyXG5cdFx0c3VwZXIoZGlzcGxheUluZm8pO1xyXG5cdFx0XHJcblx0XHR2YXIgcG9pbnRMaXN0ID0gbmV3IEFycmF5KCk7XHJcblx0XHRcclxuXHRcdHBvaW50TGlzdC5wdXNoKG5ldyBQb3NpdGlvbigwLC0odGhpcy5kaXNwbGF5SW5mby5oZWlnaHQvMikpKTtcclxuXHRcdHBvaW50TGlzdC5wdXNoKG5ldyBQb3NpdGlvbih0aGlzLmRpc3BsYXlJbmZvLndpZHRoLzIsdGhpcy5kaXNwbGF5SW5mby5oZWlnaHQvMikpO1xyXG5cdFx0cG9pbnRMaXN0LnB1c2gobmV3IFBvc2l0aW9uKC0odGhpcy5kaXNwbGF5SW5mby53aWR0aC8yKSx0aGlzLmRpc3BsYXlJbmZvLmhlaWdodC8yKSk7XHJcblx0XHRwb2ludExpc3QucHVzaChuZXcgUG9zaXRpb24oMCwtKHRoaXMuZGlzcGxheUluZm8uaGVpZ2h0LzIpKSk7XHJcblx0XHJcblx0XHR0aGlzLnBvaW50TGlzdCA9IHBvaW50TGlzdDtcclxuXHRcdHRoaXMuc2hhcGUgPSBuZXcgU2hhcGUocG9pbnRMaXN0KVxyXG5cdH1cclxuXHRcclxuXHRjb250YWluc1Bvc2l0aW9uKHBvc2l0aW9uLG5vZGUpXHJcblx0e1xyXG5cdFx0cmV0dXJuKHRoaXMuc2hhcGUuY29udGFpbnNQb3NpdGlvbihwb3NpdGlvbixub2RlKSk7XHJcblx0fVxyXG5cdFxyXG5cdFxyXG5cdGRyYXdOb2RlKGNhbnZhc0hvbGRlcixub2RlKVxyXG5cdHtcclxuXHRcdHN1cGVyLmRyYXdOb2RlKGNhbnZhc0hvbGRlcixub2RlKTtcclxuXHRcdHRoaXMuc2hhcGUuZHJhd1NoYXBlKGNhbnZhc0hvbGRlcixub2RlLHRoaXMuZGlzcGxheUluZm8pO1xyXG5cdH1cclxufVxyXG4vLzxqczJub2RlPlxyXG5tb2R1bGUuZXhwb3J0cyA9IFRyaWFuZ2xlRGlzcGxheTtcclxuY29uc29sZS5sb2coXCJMb2FkaW5nOlRyaWFuZ2xlRGlzcGxheVwiKTtcclxuLy88L2pzMm5vZGU+XHJcbiIsImNsYXNzIFBvc2l0aW9uXHJcbntcclxuXHRjb25zdHJ1Y3Rvcih4LCB5KVxyXG5cdHtcclxuXHQgICAgdGhpcy54ID0geDtcclxuXHQgICAgdGhpcy55ID0geTtcclxuXHR9XHJcblxyXG5cdHN0YXRpYyBnZXRBdmVyYWdlUG9zdGlvbkZyb21Qb3NpdGlvbkxpc3QocG9zaXRpb25MaXN0KVxyXG5cdHtcclxuXHRcdHZhciB4ID0gMC4wO1xyXG5cdFx0dmFyIHkgPSAwLjA7XHJcblx0XHRmb3IodmFyIGk9MDtpPHBvc2l0aW9uTGlzdC5sZW5ndGg7aSsrKVxyXG5cdFx0e1xyXG5cdFx0XHR2YXIgcCA9IHBvc2l0aW9uTGlzdFtpXTtcclxuXHRcdFx0eCArPSBwLmdldFgoKTtcclxuXHRcdFx0eSArPSBwLmdldFkoKTtcclxuXHRcdH1cclxuXHRcdHggPSB4IC8gcG9zaXRpb25MaXN0Lmxlbmd0aDtcclxuXHRcdHkgPSB5IC8gcG9zaXRpb25MaXN0Lmxlbmd0aDtcclxuXHRcdHJldHVybihuZXcgUG9zaXRpb24oeCx5KSk7XHJcblx0fVxyXG5cdFxyXG4gIGdldENsaWVudEpzb24oKVxyXG4gIHtcclxuXHQgIHZhciBqc29uID0ge307XHJcblx0ICBqc29uLnggPSB0aGlzLmdldFgoKTtcclxuXHQgIGpzb24ueSA9IHRoaXMuZ2V0WSgpO1xyXG5cdCAgcmV0dXJuKGpzb24pXHJcbiAgfVxyXG5cdFx0XHJcbiAgc3RhdGljIGdldEF2ZXJhZ2VQb3N0aW9uRnJvbU5vZGVMaXN0KG5vZGVsaXN0KVxyXG4gIHtcclxuXHR2YXIgeCA9IDAuMDtcclxuXHR2YXIgeSA9IDAuMDtcclxuXHRmb3IodmFyIGk9MDtpPG5vZGVsaXN0Lmxlbmd0aDtpKyspXHJcblx0e1xyXG5cdFx0dmFyIHAgPSBub2RlbGlzdFtpXS5wb3NpdGlvbjtcclxuXHRcdHggKz0gcC5nZXRYKCk7XHJcblx0XHR5ICs9IHAuZ2V0WSgpO1xyXG5cdH1cclxuXHR4ID0geCAvIG5vZGVsaXN0Lmxlbmd0aDtcclxuXHR5ID0geSAvIG5vZGVsaXN0Lmxlbmd0aDtcclxuXHRyZXR1cm4obmV3IFBvc2l0aW9uKHgseSkpO1xyXG4gIH1cclxuXHRcdFxyXG5cdHN0YXRpYyBnZXRQb3N0aW9uTGlzdEZyb21Ob2RlTGlzdChub2RlTGlzdClcclxuXHR7XHJcblx0XHR2YXIgcG9zaXRpb25zID0gbmV3IEFycmF5KCk7XHJcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IG5vZGVMaXN0Lmxlbmd0aDsgaSsrKVxyXG5cdFx0e1xyXG5cdFx0XHRwb3NpdGlvbnMucHVzaChub2RlTGlzdFtpXS5wb3NpdGlvbik7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4ocG9zaXRpb25zKTtcclxuXHR9XHJcblx0XHJcblx0YWRkVG8ocG9zaXRpb24pXHJcblx0e1xyXG5cdFx0dGhpcy5zZXRYKHRoaXMuZ2V0WCgpK3Bvc2l0aW9uLmdldFgoKSk7XHJcblx0XHR0aGlzLnNldFkodGhpcy5nZXRZKCkrcG9zaXRpb24uZ2V0WSgpKTtcclxuXHR9XHJcblxyXG5cdGNvcHlGcm9tKHBvc2l0aW9uKVxyXG5cdHtcclxuXHRcdHRoaXMuc2V0WChwb3NpdGlvbi5nZXRYKCkpO1xyXG5cdFx0dGhpcy5zZXRZKHBvc2l0aW9uLmdldFkoKSk7XHJcblx0fVxyXG5cclxuXHRjb3B5VG8ocG9zaXRpb24pXHJcblx0e1xyXG5cdFx0cG9zaXRpb24uc2V0WCh0aGlzLmdldFgoKSk7XHJcblx0XHRwb3NpdGlvbi5zZXRZKHRoaXMuZ2V0WSgpKTtcclxuXHR9XHJcblx0XHJcblx0c2V0WFkoeCx5KVxyXG5cdHtcclxuXHRcdHRoaXMuc2V0WCh4KTtcclxuXHRcdHRoaXMuc2V0WSh5KTtcclxuXHR9XHJcblxyXG5cdHNldFgoeClcclxuXHR7XHJcblx0XHR0aGlzLnggPSB4O1xyXG5cdH1cclxuXHJcblx0c2V0WSh5KVxyXG5cdHtcclxuXHRcdHRoaXMueSA9IHk7XHJcblx0fVxyXG5cclxuXHRnZXRYKClcclxuXHR7XHJcblx0XHRyZXR1cm4odGhpcy54KTtcclxuXHR9XHJcblxyXG5cdGdldFkoKVxyXG5cdHtcclxuXHRcdHJldHVybih0aGlzLnkpO1xyXG5cdH1cclxuXHRcclxuXHRjbG9uZSgpXHJcblx0e1xyXG5cdFx0cmV0dXJuKG5ldyBQb3NpdGlvbih0aGlzLmdldFgoKSx0aGlzLmdldFkoKSkpO1xyXG5cdH1cclxuXHJcblx0ZXF1YWxzKHBvc2l0aW9uKVxyXG5cdHtcclxuXHRcdHJldHVybiggKHRoaXMuZ2V0WCgpPT1wb3NpdGlvbi5nZXRYKCkpICYmICh0aGlzLmdldFkoKT09cG9zaXRpb24uZ2V0WSgpKSApIDtcclxuXHR9XHJcblxyXG5cdGNyZWF0ZUJ5QWRkaW5nKHBvc2l0aW9uKVxyXG5cdHtcclxuXHRcdHJldHVybihuZXcgUG9zaXRpb24odGhpcy5nZXRYKCkgKyBwb3NpdGlvbi5nZXRYKCksdGhpcy5nZXRZKCkrcG9zaXRpb24uZ2V0WSgpKSk7XHJcblx0fVxyXG5cclxuXHRjcmVhdGVCeVN1YnRyYWN0aW5nKHBvc2l0aW9uKVxyXG5cdHtcclxuXHRcdHJldHVybihuZXcgUG9zaXRpb24odGhpcy5nZXRYKCktcG9zaXRpb24uZ2V0WCgpLHRoaXMuZ2V0WSgpLXBvc2l0aW9uLmdldFkoKSkpO1xyXG5cdH1cclxuXHJcblx0ZmluZENsb3Nlc3RQb3N0aW9uT25MaW5lKHAxLHAyKVxyXG5cdHtcclxuXHRcdCAgdmFyIEEgPSB0aGlzLmdldERlbHRhWChwMSk7XHJcblx0XHQgIHZhciBCID0gdGhpcy5nZXREZWx0YVkocDEpO1xyXG5cdFx0ICB2YXIgQyA9IHAyLmdldERlbHRhWChwMSk7XHJcblx0XHQgIHZhciBEID0gcDIuZ2V0RGVsdGFZKHAxKTtcclxuXHRcclxuXHRcdCAgdmFyIGRvdCA9IEEgKiBDICsgQiAqIEQ7XHJcblx0XHQgIHZhciBsZW5ndGhTcXVhcmVkID0gQyAqIEMgKyBEICogRDtcclxuXHRcdCAgdmFyIHBhcmFtID0gLTE7XHJcblx0XHQgIGlmIChsZW5ndGhTcXVhcmVkICE9IDApIC8vaW4gY2FzZSBvZiAwIGxlbmd0aCBsaW5lXHJcblx0XHQgICAgICBwYXJhbSA9IGRvdCAvIGxlbmd0aFNxdWFyZWQ7XHJcblx0XHJcblx0XHQgIHZhciB4eCwgeXk7XHJcblx0XHJcblx0XHQgIGlmIChwYXJhbSA8IDApXHJcblx0XHQgIHtcclxuXHRcdCAgICB4eCA9IHAxLmdldFgoKTtcclxuXHRcdCAgICB5eSA9IHAxLmdldFkoKTtcclxuXHRcdCAgfVxyXG5cdFx0ICBlbHNlIGlmIChwYXJhbSA+IDEpIHtcclxuXHRcdCAgICB4eCA9IHAyLmdldFgoKTtcclxuXHRcdCAgICB5eSA9IHAyLmdldFkoKTtcclxuXHRcdCAgfVxyXG5cdFx0ICBlbHNlIHtcclxuXHRcdCAgICB4eCA9IHAxLmdldFgoKSArIHBhcmFtICogQztcclxuXHRcdCAgICB5eSA9IHAxLmdldFkoKSArIHBhcmFtICogRDtcclxuXHRcdCAgfVxyXG5cdC8qXHJcblx0XHQgIHZhciBkeCA9IHggLSB4eDtcclxuXHRcdCAgdmFyIGR5ID0geSAtIHl5O1xyXG5cdFx0ICByZXR1cm4gTWF0aC5zcXJ0KGR4ICogZHggKyBkeSAqIGR5KTtcclxuXHRcdCAgKi9cclxuXHRcdCAgcmV0dXJuKG5ldyBQb3NpdGlvbih4eCx5eSkpO1xyXG5cdH1cclxuXHJcblxyXG5cdGZpbmRDbG9zZXN0UG9pbnRJbkxpc3RcdChwb3NpdGlvbkxpc3QpXHJcblx0e1xyXG5cdFx0dmFyIGNsb3NldEluZGV4ID0gMDtcclxuXHRcdHZhciBjbG9zZXRQb2ludCA9IHBvc2l0aW9uTGlzdFtjbG9zZXRJbmRleF07XHJcblx0XHR2YXIgZGlzdGFuY2VUb0Nsb3Nlc3QgPSB0aGlzLmdldERpc3RhbmNlKGNsb3NldFBvaW50KTtcclxuXHRcdFxyXG5cdFx0Zm9yKHZhciBpPTA7aTxwb3NpdGlvbkxpc3QubGVuZ3RoO2krKylcclxuXHRcdHtcclxuXHRcdFx0dmFyIHBvaW50ID0gcG9zaXRpb25MaXN0W2ldO1xyXG5cdFx0XHR2YXIgZGlzdGFuY2VUb1BvaW50ID0gdGhpcy5nZXREaXN0YW5jZShwb2ludCk7XHJcblx0XHRcdGlmKGRpc3RhbmNlVG9Qb2ludDxkaXN0YW5jZVRvQ2xvc2VzdClcclxuXHRcdFx0e1xyXG5cdFx0XHRcdGNsb3NldEluZGV4ID0gaTtcclxuXHRcdFx0XHRjbG9zZXRQb2ludCA9IHBvaW50O1xyXG5cdFx0XHRcdGRpc3RhbmNlVG9DbG9zZXN0ID0gZGlzdGFuY2VUb1BvaW50O1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRyZXR1cm4oXHJcblx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0Y2xvc2V0SW5kZXg6Y2xvc2V0SW5kZXgsXHJcblx0XHRcdFx0XHRjbG9zZXRQb2ludDpjbG9zZXRQb2ludCxcclxuXHRcdFx0XHRcdGRpc3RhbmNlVG9DbG9zZXN0OmRpc3RhbmNlVG9DbG9zZXN0XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdCk7XHJcblx0fVxyXG5cclxuXHRsb2dcdCgpXHJcblx0e1xyXG5cdFx0Y29uc29sZS5sb2coXHJcblx0XHRcdFx0XCJQb3NpdGlvblwiK1xyXG5cdFx0XHRcdFwiOng9XCIrdGhpcy5nZXRYKCkrXHJcblx0XHRcdFx0XCI6eT1cIit0aGlzLmdldFkoKStcclxuXHRcdFx0XHRcIlwiXHJcblx0XHQpO1xyXG5cdH1cclxuXHJcblx0Z2V0RGVsdGFZKHBvc2l0aW9uKVxyXG5cdHtcclxuXHRcdHJldHVybih0aGlzLmdldFkoKS1wb3NpdGlvbi5nZXRZKCkpO1xyXG5cdH1cclxuXHJcblx0Z2V0RGVsdGFYKHBvc2l0aW9uKVxyXG5cdHtcclxuXHRcdHJldHVybih0aGlzLmdldFgoKS1wb3NpdGlvbi5nZXRYKCkpO1xyXG5cdH1cclxuXHJcblx0Z2V0RGVsdGEocG9zaXRpb24pXHJcblx0e1xyXG5cdFx0cmV0dXJuKG5ldyBQb3NpdGlvbih0aGlzLmdldERlbHRhWChwb3NpdGlvbiksdGhpcy5nZXREZWx0YVkocG9zaXRpb24pKSk7XHJcblx0fVxyXG5cclxuXHRnZXREaXN0YW5jZShwb3NpdGlvbilcclxuXHR7XHJcblx0XHRyZXR1cm4gKE1hdGguc3FydChNYXRoLnBvdyh0aGlzLmdldERlbHRhWChwb3NpdGlvbiksIDIpICsgTWF0aC5wb3codGhpcy5nZXREZWx0YVkocG9zaXRpb24pLCAyKSkpO1xyXG5cdH1cclxuXHJcblx0Z2V0RGlzdGFuY2VPbkxpbmVQb2ludEFycmF5KHBvc2l0aW9uT3JnLGRpc3RhbmNlKVxyXG5cdHtcclxuXHRcdHZhciBwb3NpdGlvbkxpc3QgPSBuZXcgQXJyYXkoKTtcclxuXHRcdHZhciBtb2RYID0gMC4wO1xyXG5cdFx0dmFyIG1vZFkgPSAwLjA7XHJcblx0XHJcblx0XHQvLyB3aGF0IGlmIHRoZXkgYXJlIHRvcCBvZiBlYWNoIG90aGVyP1xyXG5cdFx0aWYgKHRoaXMuZ2V0RGVsdGFYKHBvc2l0aW9uT3JnKSA9PSAwICYmIHRoaXMuZ2V0RGVsdGFZKHBvc2l0aW9uT3JnKSA9PSAwKVxyXG5cdFx0e1xyXG5cdFx0XHRtb2RYICs9IE1hdGgucmFuZG9tKCkgLSAwLjU7XHJcblx0XHRcdG1vZFkgKz0gTWF0aC5yYW5kb20oKSAtIDAuNTtcclxuXHRcdH1cclxuXHRcclxuXHRcdHZhciBwb3NpdGlvbiA9IG5ldyBQb3NpdGlvbihwb3NpdGlvbk9yZy54ICsgbW9kWCwgcG9zaXRpb25PcmcueSArIG1vZFkpO1xyXG5cdFxyXG5cdFx0Ly8gdGhpcyBpcyB3aGVuIHRoZSBzbG9wZSBpcyB1bmRlZmluZWQgKHRvdGFsbHkgaG9yaXpvbnRhbCBsaW5lKVxyXG5cdFx0aWYgKHBvc2l0aW9uLmdldFgoKSA9PSB0aGlzLmdldFgoKSlcclxuXHRcdHtcclxuXHRcdFx0dmFyIHAxID0gbmV3IFBvc2l0aW9uKHBvc2l0aW9uLmdldFgoKSxwb3NpdGlvbi5nZXRZKCkrZGlzdGFuY2UpO1xyXG5cdFx0XHR2YXIgcDIgPSBuZXcgUG9zaXRpb24ocG9zaXRpb24uZ2V0WCgpLHBvc2l0aW9uLmdldFkoKS1kaXN0YW5jZSk7XHJcblx0XHRcdHAxLmRpc3RhbmNlID0gdGhpcy5nZXREaXN0YW5jZShwMSlcclxuXHRcdFx0cDIuZGlzdGFuY2UgPSB0aGlzLmdldERpc3RhbmNlKHAyKVxyXG5cdFxyXG5cdFx0XHRwb3NpdGlvbkxpc3QucHVzaChwMSk7XHJcblx0XHRcdHBvc2l0aW9uTGlzdC5wdXNoKHAyKTtcclxuXHRcdFx0cmV0dXJuKHBvc2l0aW9uTGlzdCk7XHJcblx0XHR9XHJcblx0XHJcblx0XHQvLyBnZXQgdGhlIGVxdWF0aW9uIGZvciB0aGUgbGluZSBtPXNsb3BlIGI9eS1pbnRlcmNlcHRcclxuXHRcdHZhciBtID0gdGhpcy5nZXREZWx0YVkocG9zaXRpb24pIC8gdGhpcy5nZXREZWx0YVgocG9zaXRpb24pO1xyXG5cdFx0dmFyIGIgPSB0aGlzLmdldFkoKSAtIChtICogdGhpcy5nZXRYKCkpO1xyXG5cdFxyXG5cdFx0dmFyIHhQbHVzID0gcG9zaXRpb24uZ2V0WCgpICsgZGlzdGFuY2UgLyBNYXRoLnNxcnQoMSArIChtICogbSkpO1xyXG5cdFx0dmFyIHhNaW51cyA9IHBvc2l0aW9uLmdldFgoKSAtIGRpc3RhbmNlIC8gTWF0aC5zcXJ0KDEgKyAobSAqIG0pKTtcclxuXHRcdHZhciB5UGx1cyA9IHhQbHVzICogbSArIGI7XHJcblx0XHR2YXIgeU1pbnVzID0geE1pbnVzICogbSArIGI7XHJcblx0XHJcblx0XHR2YXIgcDEgPSBuZXcgUG9zaXRpb24oeFBsdXMsIHlQbHVzKTtcclxuXHRcdHZhciBwMiA9IG5ldyBQb3NpdGlvbih4TWludXMsIHlNaW51cyk7XHJcblx0XHRwMS5kaXN0YW5jZSA9IHRoaXMuZ2V0RGlzdGFuY2UocDEpXHJcblx0XHRwMi5kaXN0YW5jZSA9IHRoaXMuZ2V0RGlzdGFuY2UocDIpXHJcblx0XHJcblx0XHRwb3NpdGlvbkxpc3QucHVzaChwMSk7XHJcblx0XHRwb3NpdGlvbkxpc3QucHVzaChwMik7XHJcblx0XHRyZXR1cm4ocG9zaXRpb25MaXN0KTtcclxuXHR9XHJcblxyXG5cdGdldERpc3RhbmNlUG9zdGlvbkxpc3QocG9zaXRpb25MaXN0KVxyXG5cdHtcclxuXHRcdHZhciBkaXN0YW5jZUxpc3QgPSBuZXcgQXJyYXkoKTtcclxuXHRcdGZvcih2YXIgaT0wO2k8cG9zaXRpb25MaXN0Lmxlbmd0aDtpKyspXHJcblx0XHR7XHJcblx0XHRcdHZhciBwID0gcG9zaXRpb25MaXN0W2ldO1xyXG5cdFx0XHR2YXIgZCA9IHRoaXMuZ2V0RGlzdGFuY2UocCk7XHJcblx0XHRcdHZhciBwb3NpdGlvbiA9IG5ldyBQb3NpdGlvbihwLmdldFgoKSwgcC5nZXRZKCkpO1xyXG5cdFx0XHRwb3NpdGlvbi5kaXN0YW5jZSA9IGQ7XHJcblx0XHRcdGRpc3RhbmNlTGlzdC5wdXNoKHBvc2l0aW9uKTtcclxuXHRcdH1cclxuXHRcdHJldHVybiAoZGlzdGFuY2VMaXN0KTtcclxuXHR9XHJcblxyXG5cdGdldERpc3RhbmNlT25MaW5lUG9pbnRBcnJheUNsb3Nlc3QocG9zaXRpb24sZGlzdGFuY2UpXHJcblx0e1xyXG5cdFx0dmFyIHBvc2l0aW9uTGlzdCA9IHRoaXMuZ2V0RGlzdGFuY2VPbkxpbmVQb2ludEFycmF5KHBvc2l0aW9uLGRpc3RhbmNlKTtcclxuXHRcdHZhciBjbG9zZXN0ID0gbnVsbDtcclxuXHRcdGZvcih2YXIgaT0wO2k8cG9zaXRpb25MaXN0Lmxlbmd0aDtpKyspXHJcblx0XHR7XHRcdFxyXG5cdFx0XHR2YXIgcG9zaXRpb24gPSBwb3NpdGlvbkxpc3RbaV07XHJcblx0XHRcdGlmKGNsb3Nlc3Q9PW51bGwpXHJcblx0XHRcdHtcclxuXHRcdFx0XHRjbG9zZXN0ID0gcG9zaXRpb247XHJcblx0XHRcdH1cclxuXHRcdFx0ZWxzZSBpZihwb3NpdGlvbi5kaXN0YW5jZSA8IGNsb3Nlc3QuZGlzdGFuY2UpXHJcblx0XHRcdHtcclxuXHRcdFx0XHRjbG9zZXN0ID0gcG9zaXRpb247XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdC8vLy9jb25zb2xlLmxvZyhcImNsb3Nlc3Q9XCIrQ29tbW9udG9TdHJpbmcoY2xvc2VzdCkrXCIgZ2l2ZW4gZGlzdGFuY2U9XCIrZGlzdGFuY2UrXCIgcG9zaXRpb249XCIrQ29tbW9udG9TdHJpbmcocG9zaXRpb24pK1wiIGxpc3Q9XCIrQ29tbW9udG9TdHJpbmcocG9zaXRpb25MaXN0KSlcclxuXHRcdHJldHVybiAoY2xvc2VzdCk7XHJcblx0fVxyXG5cclxuXHRnZXREaXN0YW5jZU9uTGluZVBvaW50QXJyYXlGYXJ0aGVzdChwb3NpdGlvbixkaXN0YW5jZSlcclxuXHR7XHJcblx0XHR2YXIgcG9zaXRpb25MaXN0ID0gdGhpcy5nZXREaXN0YW5jZU9uTGluZVBvaW50QXJyYXkocG9zaXRpb24sZGlzdGFuY2UpO1xyXG5cdFx0dmFyIGZhcnRoZXN0ID0gbnVsbDtcclxuXHRcdGZvcih2YXIgaT0wO2k8cG9zaXRpb25MaXN0Lmxlbmd0aDtpKyspXHJcblx0XHR7XHJcblx0XHRcdHZhciBwb3NpdGlvbiA9IHBvc2l0aW9uTGlzdFtpXTtcclxuXHRcdFx0aWYoZmFydGhlc3Q9PW51bGwpXHJcblx0XHRcdHtcclxuXHRcdFx0XHRmYXJ0aGVzdCA9IHBvc2l0aW9uO1xyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2UgaWYocG9zaXRpb24uZGlzdGFuY2UgPiBmYXJ0aGVzdC5kaXN0YW5jZSlcclxuXHRcdFx0e1xyXG5cdFx0XHRcdGZhcnRoZXN0ID0gcG9zaXRpb247XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdHJldHVybiAoZmFydGhlc3QpO1xyXG5cdH1cclxufVxyXG5cclxuLy88anMybm9kZT5cclxubW9kdWxlLmV4cG9ydHMgPSBQb3NpdGlvbjtcclxuY29uc29sZS5sb2coXCJMb2FkaW5nOlBvc2l0aW9uXCIpO1xyXG4vLzwvanMybm9kZT5cclxuIiwiY2xhc3MgQm91bmRpbmdCb3hcclxue1xyXG5cdGNvbnN0cnVjdG9yKHBvaW50TGlzdClcclxuXHR7XHJcblx0XHR0aGlzLmluaXREb25lID0gZmFsc2U7XHJcblx0XHR0aGlzLnBvaW50TGlzdCA9IHBvaW50TGlzdDtcclxuXHRcdHRoaXMuaW5pdEJvdW5kaW5nQm94KCk7XHJcblx0XHJcblx0fVxyXG5cdFxyXG5cdFxyXG5cdGNvbnRhaW5zUG9zaXRpb24ocG9zaXRpb24sbm9kZSlcclxuXHR7XHJcblx0XHRpZighdGhpcy5pbml0RG9uZSkgdGhpcy5pbml0Qm91bmRpbmdCb3goKTtcclxuXHRcclxuXHRcdHJldHVybihcclxuXHRcdFx0XHQoXHJcblx0XHRcdFx0XHRcdCh0aGlzLnhNaW4uZ2V0WCgpK25vZGUucG9zaXRpb24uZ2V0WCgpKT49cG9zaXRpb24ueCAmJlxyXG5cdFx0XHRcdFx0XHQodGhpcy54TWF4LmdldFgoKStub2RlLnBvc2l0aW9uLmdldFgoKSk8PXBvc2l0aW9uLnggJiZcclxuXHRcdFx0XHRcdFx0KHRoaXMueU1pbi5nZXRZKCkrbm9kZS5wb3NpdGlvbi5nZXRZKCkpPj1wb3NpdGlvbi55ICYmXHJcblx0XHRcdFx0XHRcdCh0aGlzLnlNYXguZ2V0WSgpK25vZGUucG9zaXRpb24uZ2V0WSgpKTw9cG9zaXRpb24ueVxyXG5cdFx0XHRcdClcclxuXHRcdFx0KTtcclxuXHR9XHJcblx0XHJcblx0aW5pdEJvdW5kaW5nQm94KClcclxuXHR7XHJcblx0XHR0aGlzLmluaXREb25lID0gdHJ1ZTtcclxuXHRcdC8vdGhpcy5wb2ludExpc3QgPSBwb2ludExpc3Q7XHJcblx0XHJcblx0XHJcblx0XHR0aGlzLnhNaW4gPSBudWxsO1xyXG5cdFx0dGhpcy54TWF4ID0gbnVsbDtcclxuXHRcdHRoaXMueU1pbiA9IG51bGw7XHJcblx0XHR0aGlzLnlNYXggPSBudWxsO1xyXG5cdFx0Ly9jb25zb2xlLmxvZyhcInBsaXN0IHNpemU9XCIrcG9pbnRMaXN0Lmxlbmd0aCk7XHJcblx0XHRmb3IodmFyIGk9MDtpPHRoaXMucG9pbnRMaXN0Lmxlbmd0aDtpKyspXHJcblx0XHR7XHJcblx0XHRcdHZhciBwID0gdGhpcy5wb2ludExpc3RbaV07XHJcblx0XHRcdGlmKHRoaXMueE1pbj09bnVsbCkgdGhpcy54TWluID0gcDtcclxuXHRcdFx0aWYodGhpcy54TWF4PT1udWxsKSB0aGlzLnhNYXggPSBwO1xyXG5cdFx0XHRpZih0aGlzLnlNaW49PW51bGwpIHRoaXMueU1pbiA9IHA7XHJcblx0XHRcdGlmKHRoaXMueU1heD09bnVsbCkgdGhpcy55TWF4ID0gcDtcclxuXHRcdFx0XHJcblx0XHRcdGlmKHAuZ2V0WCgpPHRoaXMueE1pbikgdGhpcy54TWluID0gcDtcclxuXHRcdFx0aWYocC5nZXRYKCk+dGhpcy54TWF4KSB0aGlzLnhNYXggPSBwO1xyXG5cdFx0XHRpZihwLmdldFkoKTx0aGlzLnlNaW4pIHRoaXMueU1pbiA9IHA7XHJcblx0XHRcdGlmKHAuZ2V0WSgpPnRoaXMueU1heCkgdGhpcy55TWF4ID0gcDtcclxuXHRcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0dGhpcy53aWR0aCA9IHRoaXMueE1heC5nZXRYKCktdGhpcy54TWluLmdldFgoKTtcclxuXHRcdHRoaXMuaGVpZ2h0ID0gdGhpcy55TWF4LmdldFkoKS10aGlzLnlNaW4uZ2V0WSgpO1xyXG5cdH1cclxufVxyXG5cclxuXHJcblxyXG5cclxuLy88anMybm9kZT5cclxubW9kdWxlLmV4cG9ydHMgPSBCb3VuZGluZ0JveDtcclxuY29uc29sZS5sb2coXCJMb2FkaW5nOkJvdW5kaW5nQm94XCIpO1xyXG4vLzwvanMybm9kZT5cclxuIiwidmFyIFBvc2l0aW9uID0gcmVxdWlyZSgnLi4vLi4vbm9kZXMvcG9zaXRpb24vcG9zaXRpb24nKTtcclxudmFyIEJvdW5kaW5nQm94ID0gcmVxdWlyZSgnLi4vLi4vbm9kZXMvc2hhcGVzL2JvdW5kaW5nYm94Jyk7XHJcbnZhciBQb3NpdGlvbiA9IHJlcXVpcmUoJy4uLy4uL25vZGVzL3Bvc2l0aW9uL3Bvc2l0aW9uJyk7XHJcbnZhciBDb21tb24gPSByZXF1aXJlKCcuLi8uLi9jb21tb24vY29tbW9uJyk7XHJcblxyXG5jbGFzcyBTaGFwZVxyXG57XHJcblx0Y29uc3RydWN0b3IocG9pbnRMaXN0KVxyXG5cdHtcclxuXHRcdHRoaXMucG9pbnRMaXN0ID0gcG9pbnRMaXN0O1xyXG5cdFx0dGhpcy5hdmVyYWdlUG9pbnQgPSBuZXcgUG9zaXRpb24oMCwwKTtcclxuXHRcdHRoaXMuYm91bmRpbmdCb3ggPSBuZXcgQm91bmRpbmdCb3gocG9pbnRMaXN0KTtcclxuXHRcdHRoaXMuaW5pdFNoYXBlKCk7XHJcblx0fVxyXG5cdFxyXG5cdGluaXRTaGFwZSgpXHJcblx0e1xyXG5cdFx0aWYoIXRoaXMucG9pbnRMaXN0W3RoaXMucG9pbnRMaXN0Lmxlbmd0aC0xXS5lcXVhbHModGhpcy5wb2ludExpc3RbMF0pKSBcclxuXHRcdFx0dGhpcy5wb2ludExpc3QucHVzaCh0aGlzLnBvaW50TGlzdFswXS5jbG9uZSgpKTtcclxuXHRcdFxyXG5cdFx0XHJcblx0XHRQb3NpdGlvbi5nZXRBdmVyYWdlUG9zdGlvbkZyb21Qb3NpdGlvbkxpc3QodGhpcy5wb2ludExpc3QpLmNvcHlUbyh0aGlzLmF2ZXJhZ2VQb2ludCk7XHJcblx0XHRcclxuXHRcdHRoaXMuZHJhd0NlbnRlckRvdCA9IGZhbHNlO1xyXG5cdFx0LypcclxuXHRcdGZvcih2YXIgaT0wO2k8cG9pbnRMaXN0Lmxlbmd0aDtpKyspXHJcblx0XHR7XHJcblx0XHRcdGNvbnNvbGUubG9nKFwiaT1cIitpK1wiIFwiK0NvbW1vbnRvU3RyaW5nKHBvaW50TGlzdFtpXSkpO1xyXG5cdFx0fVxyXG5cdFx0Ki9cclxuXHRcdFxyXG5cdH1cclxuXHRcclxuXHRkcmF3U2hhcGUoY2FudmFzSG9sZGVyLG5vZGUsZGlzcGxheUluZm8pXHJcblx0e1xyXG5cdCAgICBpZihub2RlLmlzU2VsZWN0ZWQpXHJcblx0ICAgIHtcclxuXHQgICAgXHRjYW52YXNIb2xkZXIuY29udGV4dC5maWxsU3R5bGUgPSBDb21tb24uZ2V0Q29sb3JGcm9tU3RyaW5nKGRpc3BsYXlJbmZvLnNlbGVjdEZpbGxDb2xvcik7XHJcblx0ICAgIFx0Y2FudmFzSG9sZGVyLmNvbnRleHQuc3Ryb2tlU3R5bGUgPSBDb21tb24uZ2V0Q29sb3JGcm9tU3RyaW5nKGRpc3BsYXlJbmZvLnNlbGVjdEJvcmRlckNvbG9yKTtcclxuXHQgICAgfVxyXG5cdCAgICBlbHNlXHJcblx0ICAgIHtcclxuXHQgICAgXHRjYW52YXNIb2xkZXIuY29udGV4dC5maWxsU3R5bGUgPSBDb21tb24uZ2V0Q29sb3JGcm9tU3RyaW5nKGRpc3BsYXlJbmZvLmZpbGxDb2xvcik7XHJcblx0ICAgIFx0Y2FudmFzSG9sZGVyLmNvbnRleHQuc3Ryb2tlU3R5bGUgPSBDb21tb24uZ2V0Q29sb3JGcm9tU3RyaW5nKGRpc3BsYXlJbmZvLmJvcmRlckNvbG9yKTtcclxuXHQgICAgfVxyXG5cdCAgICBcclxuXHQgICAgY2FudmFzSG9sZGVyLmNvbnRleHQuYmVnaW5QYXRoKCk7XHJcblx0ICAgIGZvcih2YXIgaT0wO2k8dGhpcy5wb2ludExpc3QubGVuZ3RoO2krKylcclxuXHQgICAgeyAgIFx0XHJcblx0XHRcdHZhciBwb2ludCA9IHRoaXMucG9pbnRMaXN0W2ldLmNyZWF0ZUJ5QWRkaW5nKG5vZGUucG9zaXRpb24pO1xyXG5cdCAgICBcdGlmKGk9PTApIGNhbnZhc0hvbGRlci5jb250ZXh0Lm1vdmVUbyhwb2ludC5nZXRYKCkscG9pbnQuZ2V0WSgpKTtcclxuXHQgICAgXHRlbHNlIGNhbnZhc0hvbGRlci5jb250ZXh0LmxpbmVUbyhwb2ludC5nZXRYKCkscG9pbnQuZ2V0WSgpKTtcclxuXHQgICAgfVxyXG5cdCAgICBjYW52YXNIb2xkZXIuY29udGV4dC5jbG9zZVBhdGgoKTtcclxuXHQgICAgXHJcblx0ICAgIGNhbnZhc0hvbGRlci5jb250ZXh0LmZpbGwoKTtcclxuXHQgICAgY2FudmFzSG9sZGVyLmNvbnRleHQubGluZVdpZHRoID0gZGlzcGxheUluZm8uYm9yZGVyV2lkdGg7XHJcblx0ICAgIGNhbnZhc0hvbGRlci5jb250ZXh0LnN0cm9rZSgpO1xyXG5cdCAgICBcclxuXHQgICAgaWYodGhpcy5kcmF3Q2VudGVyRG90KVxyXG5cdCAgICB7XHJcblx0ICAgIFx0dmFyIGF2ZXJhZ2VUcmFucyA9IHRoaXMuZ2V0QXZlcmFnZVBvaW50VHJhbnNmb3JtZWQobm9kZSk7XHJcblx0ICAgIFx0Y2FudmFzSG9sZGVyLmNvbnRleHQuZmlsbFN0eWxlID0gQ29tbW9uLmdldENvbG9yRnJvbVN0cmluZyhcIjAwMDAwMGZmXCIpO1xyXG5cdCAgICBcdGNhbnZhc0hvbGRlci5jb250ZXh0LmJlZ2luUGF0aCgpO1xyXG5cdCAgICBcdGNhbnZhc0hvbGRlci5jb250ZXh0LmFyYyhub2RlLnBvc2l0aW9uLmdldFgoKSxub2RlLnBvc2l0aW9uLmdldFkoKSwyLDAsTWF0aC5QSSAqIDIsIGZhbHNlKTtcclxuXHQgICAgXHRjYW52YXNIb2xkZXIuY29udGV4dC5jbG9zZVBhdGgoKTtcclxuXHQgICAgXHRjYW52YXNIb2xkZXIuY29udGV4dC5maWxsKCk7XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdGdldEF2ZXJhZ2VQb2ludFRyYW5zZm9ybWVkKG5vZGUpXHJcblx0e1xyXG5cdCAgICB2YXIgYXZlcmFnZVBvaW50VHJhbnNmb3JtZWQgPSB0aGlzLmF2ZXJhZ2VQb2ludC5jcmVhdGVCeUFkZGluZyhub2RlLnBvc2l0aW9uKTtcclxuXHQgICAgcmV0dXJuKGF2ZXJhZ2VQb2ludFRyYW5zZm9ybWVkKTtcclxuXHR9XHJcblx0XHJcblx0Ly9mdW5jdGlvbiBwb2x5Z29uQXJlYShYLCBZLCBudW1Qb2ludHMpIFxyXG5cdFxyXG5cdGdldFNoYXBlQXJlYSgpXHJcblx0eyBcclxuXHQgIHZhciBhcmVhID0gMDsgICAgICAgICAvLyBBY2N1bXVsYXRlcyBhcmVhIGluIHRoZSBsb29wXHJcblx0ICB2YXIgaiA9IHRoaXMucG9pbnRMaXN0Lmxlbmd0aC0xOyAgLy8gVGhlIGxhc3QgdmVydGV4IGlzIHRoZSAncHJldmlvdXMnIG9uZSB0byB0aGUgZmlyc3RcclxuXHRcclxuXHQgIGZvciAodmFyIGk9MDsgaTx0aGlzLnBvaW50TGlzdC5sZW5ndGg7IGkrKylcclxuXHQgIHsgXHJcblx0XHQgIGFyZWEgPSBhcmVhICsgKHRoaXMucG9pbnRMaXN0W2pdLmdldFgoKSt0aGlzLnBvaW50TGlzdFtpXS5nZXRYKCkpICpcclxuXHRcdCAgXHQodGhpcy5wb2ludExpc3Rbal0uZ2V0WSgpLXRoaXMucG9pbnRMaXN0W2ldLmdldFkoKSk7IFxyXG5cdCAgICAgIGogPSBpOyAgLy9qIGlzIHByZXZpb3VzIHZlcnRleCB0byBpXHJcblx0ICB9XHJcblx0ICBpZihhcmVhPDApIGFyZWEgPSBhcmVhICogLTE7XHJcblx0ICByZXR1cm4oYXJlYS8yKTtcclxuXHR9XHJcblx0XHJcblx0XHJcblx0Z2V0U2hhcGVBcmVhMigpXHJcblx0eyBcclxuXHRcdHZhciBhcmVhID0gMDsgLy8gQWNjdW11bGF0ZXMgYXJlYSBpbiB0aGUgbG9vcFxyXG5cdFx0dmFyIGogPSB0aGlzLnBvaW50TGlzdC5sZW5ndGgtMTsgLy8gVGhlIGxhc3QgdmVydGV4IGlzIHRoZSAncHJldmlvdXMnIG9uZSB0byB0aGUgZmlyc3RcclxuXHRcdGZvciAoaT0wO2k8dGhpcy5wb2ludExpc3QubGVuZ3RoO2krKylcclxuXHRcdHtcclxuXHRcdFx0YXJlYSA9IGFyZWEgKyAodGhpcy5wb2ludExpc3Rbal0uZ2V0WCgpK3RoaXMucG9pbnRMaXN0W2ldLmdldFgoKSkgKlxyXG5cdFx0XHRcdCh0aGlzLnBvaW50TGlzdFtqXS5nZXRZKCkrdGhpcy5wb2ludExpc3RbaV0uZ2V0WSgpKTsgXHJcblx0XHRcdGogPSBpOyAvL2ogaXMgcHJldmlvdXMgdmVydGV4IHRvIGlcclxuXHRcdFx0XHJcblx0XHRcdGNvbnNvbGUubG9nKFwiWFhYWFhYWFhYWFg6aT1cIitpK1wiIGFyZWE9XCIrYXJlYSk7XHJcblx0XHJcblx0XHR9XHJcblx0XHRyZXR1cm4oYXJlYSk7XHJcblx0fVxyXG5cdFxyXG5cdGZpbmRDbG9zZXN0UG9pbnRJblNoYXBlRnJvbVN0YXJ0aW5nUG9pbnQoc3RhcnRpbmdQb3NpdGlvbixub2RlKVxyXG5cdHtcclxuXHRcdHZhciBsb29rRnJvbVBvc2l0aW9uID0gc3RhcnRpbmdQb3NpdGlvbi5jcmVhdGVCeVN1YnRyYWN0aW5nKG5vZGUucG9zaXRpb24pO1xyXG5cdFx0dmFyIGNsb3Nlc3RJbmZvID0gbG9va0Zyb21Qb3NpdGlvbi5maW5kQ2xvc2VzdFBvaW50SW5MaXN0KHRoaXMucG9pbnRMaXN0KTtcclxuXHRcclxuXHRcdHZhciBlbmRPZkxpc3QgPSB0aGlzLnBvaW50TGlzdC5sZW5ndGgtMTtcclxuXHRcdGlmKHRoaXMucG9pbnRMaXN0WzBdLmVxdWFscyh0aGlzLnBvaW50TGlzdFtlbmRPZkxpc3RdKSkgZW5kT2ZMaXN0ID0gZW5kT2ZMaXN0IC0gMTtcclxuXHRcdFx0XHJcblx0XHR2YXIgY2xvc2VzdFBvaW50ID0gY2xvc2VzdEluZm8uY2xvc2V0UG9pbnQ7XHJcblx0XHR2YXIgcDFJbmRleCA9IGNsb3Nlc3RJbmZvLmNsb3NldEluZGV4LTE7XHJcblx0XHR2YXIgcDJJbmRleCA9IGNsb3Nlc3RJbmZvLmNsb3NldEluZGV4KzE7XHJcblx0XHRpZihjbG9zZXN0SW5mby5jbG9zZXRJbmRleD09MCkgcDFJbmRleCA9IGVuZE9mTGlzdDtcclxuXHRcdGlmKGNsb3Nlc3RJbmZvLmNsb3NldEluZGV4PT1lbmRPZkxpc3QpIHAySW5kZXggPSAwO1xyXG5cdFx0XHJcblx0XHR2YXIgcDEgPSB0aGlzLnBvaW50TGlzdFtwMUluZGV4XTtcclxuXHRcdHZhciBwMiA9IHRoaXMucG9pbnRMaXN0W3AySW5kZXhdO1xyXG5cdFx0XHJcblx0XHRcclxuXHRcdHZhciBkaXN0YW5jZVRvQ2xvc2VzdCA9IGNsb3Nlc3RJbmZvLmRpc3RhbmNlVG9DbG9zZXN0O1xyXG5cdFx0dmFyIHAxTGluZVBvaW50ID0gbG9va0Zyb21Qb3NpdGlvbi5maW5kQ2xvc2VzdFBvc3Rpb25PbkxpbmUoY2xvc2VzdFBvaW50LHAxKTtcclxuXHRcdHZhciBwMkxpbmVQb2ludCA9IGxvb2tGcm9tUG9zaXRpb24uZmluZENsb3Nlc3RQb3N0aW9uT25MaW5lKGNsb3Nlc3RQb2ludCxwMik7XHJcblx0XHR2YXIgcDFEaXN0YW5jZSA9IGxvb2tGcm9tUG9zaXRpb24uZ2V0RGlzdGFuY2UocDFMaW5lUG9pbnQpO1xyXG5cdFx0dmFyIHAyRGlzdGFuY2UgPSBsb29rRnJvbVBvc2l0aW9uLmdldERpc3RhbmNlKHAyTGluZVBvaW50KTtcclxuXHRcdFxyXG5cdFx0dmFyIGZpbmFsUG9pbnQgPSBjbG9zZXN0UG9pbnQ7XHJcblx0XHR2YXIgZmluYWxEaXN0YW5jZSA9IGRpc3RhbmNlVG9DbG9zZXN0O1xyXG5cdFx0aWYoZGlzdGFuY2VUb0Nsb3Nlc3Q8cDFEaXN0YW5jZSAmJiBkaXN0YW5jZVRvQ2xvc2VzdDxwMkRpc3RhbmNlKVxyXG5cdFx0e1xyXG5cdFx0XHRmaW5hbFBvaW50ID0gY2xvc2V0UG9pbnQ7XHJcblx0XHRcdGZpbmFsRGlzdGFuY2UgPSBkaXN0YW5jZVRvQ2xvc2VzdDtcclxuXHRcdH1cclxuXHRcdGVsc2UgaWYocDFEaXN0YW5jZTxwMkRpc3RhbmNlKVxyXG5cdFx0e1xyXG5cdFx0XHRmaW5hbFBvaW50ID0gcDFMaW5lUG9pbnQ7XHJcblx0XHRcdGZpbmFsRGlzdGFuY2UgPSBwMURpc3RhbmNlO1xyXG5cdFx0fVxyXG5cdFx0ZWxzZVxyXG5cdFx0e1xyXG5cdFx0XHRmaW5hbFBvaW50ID0gcDJMaW5lUG9pbnQ7XHJcblx0XHRcdGZpbmFsRGlzdGFuY2UgPSBwMkRpc3RhbmNlO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHR2YXIgZmluYWxQb2ludFRyYW5zbGF0ZWQgPSBmaW5hbFBvaW50LmNyZWF0ZUJ5QWRkaW5nKG5vZGUucG9zaXRpb24pO1xyXG5cdFx0XHJcblx0XHQvKlxyXG5cdFx0Y29uc29sZS5sb2coQ29tbW9udG9TdHJpbmcoY2xvc2VzdEluZm8pKTtcclxuXHQgICAgY29uc29sZS5sb2coXCJzdGFydGluZ1Bvc2l0aW9uPVwiK0NvbW1vbnRvU3RyaW5nKHN0YXJ0aW5nUG9zaXRpb24pKTtcclxuXHRcdGNvbnNvbGUubG9nKFwibG9va0Zyb21Qb3NpdGlvbj1cIitDb21tb250b1N0cmluZyhsb29rRnJvbVBvc2l0aW9uKSk7XHJcblx0XHRjb25zb2xlLmxvZyhcIm5vZGUucG9zaXRpb249XCIrQ29tbW9udG9TdHJpbmcobm9kZS5wb3NpdGlvbikpO1xyXG5cdFx0Y29uc29sZS5sb2coXCJ0aGlzLnBvaW50TGlzdC5sZW5ndGg9XCIrdGhpcy5wb2ludExpc3QubGVuZ3RoKTtcclxuXHRcdGNvbnNvbGUubG9nKFwiY2xvc2VzdEluZm8uY2xvc2V0SW5kZXg9XCIrY2xvc2VzdEluZm8uY2xvc2V0SW5kZXgpO1xyXG5cdFx0Y29uc29sZS5sb2coXCJlbmRPZkxpc3Q9XCIrZW5kT2ZMaXN0KTtcclxuXHRcdGNvbnNvbGUubG9nKFwicDFJbmRleD1cIitwMUluZGV4KTtcclxuXHRcdGNvbnNvbGUubG9nKFwicDJJbmRleD1cIitwMkluZGV4KTtcclxuXHRcdGNvbnNvbGUubG9nKFwiY2xvc2VzdEluZm8uY2xvc2V0SW5kZXg9XCIrY2xvc2VzdEluZm8uY2xvc2V0SW5kZXgpO1xyXG5cdFx0Y29uc29sZS5sb2coXCJwMTpcIitDb21tb250b1N0cmluZyhwMSkpO1xyXG5cdFx0Y29uc29sZS5sb2coXCJwMjpcIitDb21tb250b1N0cmluZyhwMikpO1xyXG5cdFxyXG5cdFx0Y29uc29sZS5sb2coXCJmaW5hbERpc3RhbmNlPVwiK2ZpbmFsRGlzdGFuY2UpO1xyXG5cdFx0Y29uc29sZS5sb2coXCJmaW5hbFBvaW50PVwiK0NvbW1vbnRvU3RyaW5nKGZpbmFsUG9pbnQpKTtcclxuXHRcdGNvbnNvbGUubG9nKFwiZmluYWxQb2ludFRyYW5zbGF0ZWR0PVwiK0NvbW1vbnRvU3RyaW5nKGZpbmFsUG9pbnRUcmFuc2xhdGVkKSk7XHJcblx0XHRjb25zb2xlLmxvZyhcIi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cIik7XHJcblx0XHQqL1xyXG5cdFxyXG5cdFx0cmV0dXJuKGZpbmFsUG9pbnRUcmFuc2xhdGVkKTtcclxuXHR9XHJcblx0XHJcblx0XHJcblx0Y29udGFpbnNQb3NpdGlvbihwb3NpdGlvbixub2RlKVxyXG5cdHtcclxuXHRcdGlmKHRoaXMuYm91bmRpbmdCb3guY29udGFpbnNQb3NpdGlvbihwb3NpdGlvbixub2RlKSkgcmV0dXJuIGZhbHNlO1xyXG5cdFx0XHJcblx0XHR2YXIgaTtcclxuXHRcdHZhciBqO1xyXG5cdFx0dmFyIGMgPSBmYWxzZTtcclxuXHRcdGZvcihpPTAsaj10aGlzLnBvaW50TGlzdC5sZW5ndGgtMTtpPCB0aGlzLnBvaW50TGlzdC5sZW5ndGg7aj1pKyspXHJcblx0XHR7XHJcblx0XHRcdC8vXHJcblx0XHRcdHZhciBwaSA9IHRoaXMucG9pbnRMaXN0W2ldLmNyZWF0ZUJ5QWRkaW5nKG5vZGUucG9zaXRpb24pO1xyXG5cdFx0XHR2YXIgcGogPSB0aGlzLnBvaW50TGlzdFtqXS5jcmVhdGVCeUFkZGluZyhub2RlLnBvc2l0aW9uKTtcclxuXHRcdFx0ICBcclxuXHRcdFx0aWYgKFxyXG5cdFx0XHRcdCgocGkuZ2V0WSgpPnBvc2l0aW9uLmdldFkoKSkgIT0gKHBqLmdldFkoKT5wb3NpdGlvbi5nZXRZKCkpKSAmJlxyXG5cdFx0XHRcdFx0KHBvc2l0aW9uLmdldFgoKSA8IChwai5nZXRYKCktcGkuZ2V0WCgpKSAqXHJcblx0XHRcdFx0XHQocG9zaXRpb24uZ2V0WSgpLXBpLmdldFkoKSkgL1xyXG5cdFx0XHRcdFx0KHBqLmdldFkoKS1waS5nZXRZKCkpICtcclxuXHRcdFx0XHRcdHBpLmdldFgoKSkgKVxyXG5cdFx0XHRcdGMgPSAhYztcclxuXHRcdH1cclxuXHRcdHJldHVybiBjO1xyXG5cdH1cclxufVxyXG4vLzxqczJub2RlPlxyXG5tb2R1bGUuZXhwb3J0cyA9IFNoYXBlO1xyXG5jb25zb2xlLmxvZyhcIkxvYWRpbmc6U2hhcGVcIik7XHJcbi8vPC9qczJub2RlPlxyXG4iLCJ2YXIgTm9kZSA9IHJlcXVpcmUoJy4uL25vZGVzL25vZGUnKTtcclxudmFyIFBvc2l0aW9uID0gcmVxdWlyZSgnLi4vbm9kZXMvcG9zaXRpb24vcG9zaXRpb24nKTtcclxudmFyIENvbW1vbiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9jb21tb24nKTtcclxudmFyIENvbm5lY3RvckRpc3BsYXlFbXB0eSA9IHJlcXVpcmUoJy4uL25vZGVzL2Nvbm5lY3RvcmRpc3BsYXkvY29ubmVjdG9yZGlzcGxheWVtcHR5Jyk7XHJcbnZhciBTaGFwZUNvbm5lY3RvciA9IHJlcXVpcmUoJy4uL25vZGVzL2Nvbm5lY3Rvci9zaGFwZWNvbm5lY3RvcicpO1xyXG52YXIgQXJjRGlzcGxheVNoYXBlID0gcmVxdWlyZSgnLi4vbm9kZXMvbm9kZWRpc3BsYXkvYXJjZGlzcGxheXNoYXBlJyk7XHJcblxyXG5cclxuY2xhc3MgSnVuY3Rpb24gZXh0ZW5kcyBOb2RlXHJcbntcclxuXHRjb25zdHJ1Y3RvcihuYW1lLHBvc2l0aW9uLGNhbnZhc0hvbGRlcixzaGFwZUxpc3QsZ3JhcGhEYXRhS2V5LGluZm9EYXRhLHdvcmxkKVxyXG5cdHtcclxuXHRcdHN1cGVyKG5hbWUscG9zaXRpb24sY2FudmFzSG9sZGVyLGdyYXBoRGF0YUtleSxpbmZvRGF0YSk7XHJcblx0XHR0aGlzLnBhdGhBcnJheSA9IG5ldyBBcnJheSgpO1xyXG5cdFx0dGhpcy53YWxrZXJPYmplY3QgPSBuZXcgT2JqZWN0KCk7XHJcblx0XHR0aGlzLndhbGtlclR5cGVDb25uZWN0aW9ucyA9IG5ldyBPYmplY3QoKTtcclxuXHRcdHRoaXMubGF5ZXI9MTtcclxuXHRcdHRoaXMud29ybGQgPSB3b3JsZDtcclxuXHR9XHJcblxyXG5cdGdldENsaWVudEpzb24oKVxyXG5cdHtcclxuXHRcdHZhciBqc29uID0gc3VwZXIuZ2V0Q2xpZW50SnNvbigpO1xyXG5cdFx0anNvbi5wYXRoV29ybGRUeWUgPSBcImp1bmN0aW9uXCI7XHJcblx0XHRcclxuXHRcdFxyXG5cdFx0dmFyIHdhbGtlckxpc3QgPSB0aGlzLmdldFdhbGtlckFycmF5KCk7XHJcblx0XHRqc29uLndhbGtlckxpc3QgPSBuZXcgQXJyYXkoKTtcclxuXHRcdFxyXG5cdFx0Zm9yKHZhciBpPTA7aTx3YWxrZXJMaXN0Lmxlbmd0aDtpKyspXHJcblx0XHR7XHJcblx0XHRcdGpzb24ud2Fsa2VyTGlzdC5wdXNoKHdhbGtlckxpc3RbaV0uZ2V0Tm9kZUtleSgpKTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0cmV0dXJuKGpzb24pO1xyXG5cdH1cclxuXHRcclxuXHRnZXRDcmVhdGVXYWxrZXJUeXBlQ29ubmVjdGlvbih3YWxrZXJUeXBlKVxyXG5cdHtcclxuXHRcdGlmKCF0aGlzLndhbGtlclR5cGVDb25uZWN0aW9ucy5oYXNPd25Qcm9wZXJ0eSh3YWxrZXJUeXBlKSlcclxuXHRcdHtcclxuXHRcdFx0dmFyIHdhbGtlckdyYXBoRGF0YSA9IHRoaXMuY2FudmFzSG9sZGVyLmdldEdyYXBoRGF0YSh3YWxrZXJUeXBlKTtcclxuXHRcdFx0LyoqKlxyXG5cdFx0XHR0aGlzLndvcmxkLndvcmxkRGlzcGxheS53YWxrZXJEaXNwbGF5VHlwZXNbXCJnZW5lcmljXCJdO1xyXG5cdFx0XHRpZih0aGlzLndvcmxkLndvcmxkRGlzcGxheS53YWxrZXJEaXNwbGF5VHlwZXMuaGFzT3duUHJvcGVydHkod2Fsa2VyVHlwZSkpXHJcblx0XHRcdHtcclxuXHRcdFx0XHR3YWxrZXJHcmFwaERhdGEgPSB0aGlzLndvcmxkLndvcmxkRGlzcGxheS53YWxrZXJEaXNwbGF5VHlwZXNbd2Fsa2VyVHlwZV07XHJcblx0XHRcdH0qL1xyXG5cdFx0XHQvKlxyXG5cdFx0XHRjb25zb2xlLmxvZyhcImFkZGluZyBcIit3YWxrZXJUeXBlK1xyXG5cdFx0XHRcdFx0XCIgdGhpcy5jb25uZWN0b3JQb3NpdGlvbj1cIitDb21tb250b1N0cmluZyh0aGlzLmNvbm5lY3RvclBvc2l0aW9uKStcclxuXHRcdFx0XHRcdFwiIHRoaXMucG9zaXRpb249XCIrQ29tbW9udG9TdHJpbmcodGhpcy5wb3NpdGlvbikrXHRcdFxyXG5cdFx0XHRcdFx0XCJcIik7XHJcblx0XHRcdFx0XHQqL1xyXG5cdFx0XHQvKlxyXG5cdFx0XHRjb25zb2xlLmxvZyhcIm5kID1cIitDb21tb250b1N0cmluZyh3YWxrZXJHcmFwaERhdGEpK1xyXG5cdFx0XHRcdFx0XCJcIik7XHJcblx0XHRcdFx0XHQqL1xyXG5cdFx0XHR2YXIgc2hhcGVOb2RlID0gbmV3IE5vZGUoXHJcblx0XHRcdFx0XHRcdFwic2hhcGVOb2RlIGZvciBcIit0aGlzLm5hbWUrXCIgXCIrd2Fsa2VyVHlwZSxcclxuXHRcdFx0XHRcdFx0dGhpcy5wb3NpdGlvbixcclxuXHRcdFx0XHRcdFx0dGhpcy5jYW52YXNIb2xkZXIsXHJcblx0XHRcdFx0XHRcdFwianVuY3Rpb25QaWVTbGljZVwiLFxyXG5cdFx0XHRcdFx0XHRuZXcgT2JqZWN0KClcclxuXHRcdFx0XHRcdCk7XHJcblx0XHRcdFxyXG5cdFx0XHRcclxuXHRcdFx0c2hhcGVOb2RlLmxheWVyPTEwO1xyXG5cdFx0XHRzaGFwZU5vZGUuZGVidWdGdW5jdGlvbigpXHJcblx0XHRcdHtcclxuXHRcdFx0XHQvL2NvbnNvbGUubG9nKFwiZGVidWdGdW5jdGlvbjpcIit0aGlzLm5hbWUpO1xyXG5cdFx0XHR9XHJcblx0XHRcdFxyXG5cdFx0XHR0aGlzLndhbGtlclR5cGVDb25uZWN0aW9uc1t3YWxrZXJUeXBlXSA9IG5ldyBTaGFwZUNvbm5lY3RvcihcclxuXHRcdFx0XHRcdHNoYXBlTm9kZSxcclxuXHRcdFx0XHRcdG5ldyBDb25uZWN0b3JEaXNwbGF5RW1wdHkoKSxcclxuXHRcdFx0XHRcdHNoYXBlTm9kZS5ncmFwaERhdGEubm9kZURpc3BsYXkuc2hhcGUsXHJcblx0XHRcdFx0XHRuZXcgUG9zaXRpb24oMCwwKSxcclxuXHRcdFx0XHRcdDEwLFxyXG5cdFx0XHRcdFx0MC41LFxyXG5cdFx0XHRcdFx0MC4wLFxyXG5cdFx0XHRcdFx0MC45NSxcclxuXHRcdFx0XHRcdHRoaXMubmFtZStcIjpcIit3YWxrZXJUeXBlK1wiOlwiK3NoYXBlTm9kZS5uYW1lKTtcclxuXHRcdFx0dGhpcy53YWxrZXJUeXBlQ29ubmVjdGlvbnNbd2Fsa2VyVHlwZV0uc2hhcGVOb2RlID0gc2hhcGVOb2RlO1xyXG5cdFx0XHQvL3RoaXMubm9kZXMucHVzaChzaGFwZU5vZGUpO1xyXG5cdFx0XHRcdFx0XHRcclxuXHRcdFx0dGhpcy5hZGROb2RlKHNoYXBlTm9kZSk7XHJcblx0XHRcdHRoaXMuc2hhcGVOb2RlID0gc2hhcGVOb2RlO1xyXG5cdFx0XHQvL2NvbnNvbGUubG9nKFwiZ2V0Q3JlYXRlV2Fsa2VyVHlwZUNvbm5lY3Rpb246R09UIE5FVzp3YWxrZXI9XCIrdGhpcy5uYW1lK1wiOndhbGtlclR5cGU9XCIrd2Fsa2VyVHlwZStcIjp0cz1cIitzaGFwZU5vZGUuZ3JhcGhEYXRhLm5vZGVEaXNwbGF5LmRpc3BsYXlJbmZvLnRzKTtcclxuXHRcdFx0XHJcblx0XHR9XHJcblx0XHR2YXIgY29ubmVjdGlvbiA9IHRoaXMud2Fsa2VyVHlwZUNvbm5lY3Rpb25zW3dhbGtlclR5cGVdO1xyXG5cdFx0Ly9jb25zb2xlLmxvZyhcImdldENyZWF0ZVdhbGtlclR5cGVDb25uZWN0aW9uOndhbGtlcj1cIit0aGlzLm5hbWUrXCI6d2Fsa2VyVHlwZT1cIit3YWxrZXJUeXBlK1wiOnRzPVwiK2Nvbm5lY3Rpb24uc2hhcGVOb2RlLmdyYXBoRGF0YS5ub2RlRGlzcGxheS5kaXNwbGF5SW5mby50cyk7XHJcblx0XHRcclxuXHRcdHJldHVybihjb25uZWN0aW9uKTtcclxuXHR9XHJcblx0XHJcblx0Z2V0Tm9kZVVpRGlzcGxheShub2RlKVxyXG5cdHtcclxuXHRcdHJldHVybihcclxuXHRcdFx0XHRcIjx1bD5cIitcclxuXHRcdFx0XHRcIjxsaT4gbmFtZSA6IFwiK3RoaXMubmFtZStcIjwvbGk+XCIrXHJcblx0XHRcdFx0XCI8bGk+IG5vZGVLZXkudHMgOiBcIit0aGlzLmluZm9EYXRhLm5vZGVLZXkua2V5K1wiPC9saT5cIitcclxuXHRcdFx0XHRcIjxsaT4gbm9kZUtleS5ub2RlSWQgOiBcIit0aGlzLmluZm9EYXRhLm5vZGVLZXkubm9kZUlkK1wiPC9saT5cIitcclxuXHRcdFx0XHRcIjwvdWw+XCIpO1xyXG5cdH1cclxuXHRcclxuXHRnZXRXYWxrZXJLZXlzU29ydGVkKG5vZGUpXHJcblx0e1xyXG5cdFx0dmFyIHdhbGtlclR5cGVLZXlzID0gbmV3IEFycmF5KClcclxuXHRcdHZhciB0b3RhbFdhbGtlcnMgPSAwO1xyXG5cdFx0Zm9yICh2YXIgd2Fsa2VyVHlwZSBpbiB0aGlzLndhbGtlclR5cGVDb25uZWN0aW9ucylcclxuXHRcdHtcclxuXHRcdFx0d2Fsa2VyVHlwZUtleXMucHVzaCh3YWxrZXJUeXBlKTtcclxuXHRcdFx0dmFyIGNvbm5lY3RvciA9IHRoaXMud2Fsa2VyVHlwZUNvbm5lY3Rpb25zW3dhbGtlclR5cGVdO1xyXG5cdFx0XHR0b3RhbFdhbGtlcnMgKz0gY29ubmVjdG9yLm5vZGVzLmxlbmd0aDtcclxuXHRcdFx0Ly9jb25zb2xlLmxvZyh3YWxrZXJUeXBlK1wiOnRvdGFsV2Fsa2Vycz1cIit0b3RhbFdhbGtlcnMrXCI6Zm9yIGNvbmVjdG9yPVwiK2Nvbm5lY3Rvci5ub2Rlcy5sZW5ndGgpO1xyXG5cdFxyXG5cdFx0fVxyXG5cdFx0d2Fsa2VyVHlwZUtleXMuc29ydCgpO1xyXG5cdFx0cmV0dXJuKHdhbGtlclR5cGVLZXlzKTtcclxuXHR9XHJcblx0XHJcblx0Z2V0V2Fsa2VyQXJyYXlUb0ZpeCgpXHJcblx0e1xyXG5cdFx0dmFyIHdhbGtlckFycmF5ID0gdGhpcy53YWxrZXJPYmplY3QudmFsdWVzKCk7XHJcblx0XHRyZXR1cm4od2Fsa2VyQXJyYXkpO1xyXG5cdH1cclxuXHRcclxuXHRnZXRXYWxrZXJBcnJheSgpXHJcblx0e1xyXG5cdFx0Ly8gdGhpcyBpcyBTTE9XLi4gd2h5IGRvZXMgdGhlIGFib3ZlIG5vdCB3b3JrPyE/IT8hXHJcblx0XHR2YXIgd2Fsa2VyQXJyYXkgPSBuZXcgQXJyYXkoKTtcclxuXHRcdHZhciB3YWxrZXJUeXBlS2V5cyA9IHRoaXMuZ2V0V2Fsa2VyS2V5c1NvcnRlZCgpO1xyXG5cdFx0Zm9yICh2YXIgaT0wO2k8d2Fsa2VyVHlwZUtleXMubGVuZ3RoO2krKylcclxuXHRcdHtcclxuXHRcdFx0dmFyIHdhbGtlclR5cGUgPSB3YWxrZXJUeXBlS2V5c1tpXTtcclxuXHRcdFx0dmFyIGNvbm5lY3RvciA9IHRoaXMud2Fsa2VyVHlwZUNvbm5lY3Rpb25zW3dhbGtlclR5cGVdO1xyXG5cdFx0XHRmb3IodmFyIGo9MDtqPGNvbm5lY3Rvci5ub2Rlcy5sZW5ndGg7aisrKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0d2Fsa2VyQXJyYXkucHVzaChjb25uZWN0b3Iubm9kZXNbal0pO1xyXG5cdFxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHJcblx0XHRyZXR1cm4od2Fsa2VyQXJyYXkpO1xyXG5cdH1cclxuXHRcclxuXHRhZGp1c3R3YWxrZXJUeXBlQ29ubmVjdGlvbnMoKVxyXG5cdHtcclxuXHRcdHZhciB3YWxrZXJUeXBlS2V5cyA9IHRoaXMuZ2V0V2Fsa2VyS2V5c1NvcnRlZCgpO1xyXG5cdFx0dmFyIHRvdGFsV2Fsa2VycyA9IHRoaXMuZ2V0V2Fsa2VyQXJyYXkoKS5sZW5ndGg7XHJcblx0Ly9jb25zb2xlLmxvZyhcIndhbGVrckNvdW50PVwiK3RvdGFsV2Fsa2Vycyk7XHJcblx0XHQvL2NvbnNvbGUubG9nKFwid2Fsa2VyQ291bnRhbGtlckNvdW50PVwiK3RoaXMud2Fsa2VyT2JqZWN0KTtcclxuXHRcdC8qXHJcblx0XHRuZXcgQXJyYXkoKVxyXG5cdFx0dmFyIHRvdGFsV2Fsa2VycyA9IDA7XHJcblx0XHRmb3IgKHZhciB3YWxrZXJUeXBlIGluIHRoaXMud2Fsa2VyVHlwZUNvbm5lY3Rpb25zKVxyXG5cdFx0e1xyXG5cdFx0XHR3YWxrZXJUeXBlS2V5cy5wdXNoKHdhbGtlclR5cGUpO1xyXG5cdFx0XHR2YXIgY29ubmVjdG9yID0gdGhpcy53YWxrZXJUeXBlQ29ubmVjdGlvbnNbd2Fsa2VyVHlwZV07XHJcblx0XHRcdHRvdGFsV2Fsa2VycyArPSBjb25uZWN0b3Iubm9kZXMubGVuZ3RoO1xyXG5cdFx0XHQvL2NvbnNvbGUubG9nKHdhbGtlclR5cGUrXCI6dG90YWxXYWxrZXJzPVwiK3RvdGFsV2Fsa2VycytcIjpmb3IgY29uZWN0b3I9XCIrY29ubmVjdG9yLm5vZGVzLmxlbmd0aCk7XHJcblx0XHJcblx0XHR9XHJcblx0XHR3YWxrZXJUeXBlS2V5cy5zb3J0KCk7Ki9cclxuXHRcdHZhciBhbmdsZSA9IDA7XHJcblx0XHQvLyBhcmVhID0gcGkgcl4yXHJcblx0XHQvLyBzby4uLiBpZiB3ZSBoYXZlIDEwIG5vZGVzLi4uXHJcblx0XHQvLyBhbmQgYSBub2RlIHRha2VzIFwiMTAwIGFyZWFcIiBwZXIgbm9kZSAoYSAxMFgxMCBhcmVhKVxyXG5cdFx0Ly8gMTAgbm9kZXMgYW5kIDEwMGFyZWFeMlxyXG5cdFx0Ly8gc3FydChhcmVhL3BpKSA9IHJcclxuXHRcdC8vIHNxcnQoIChhcmVhKm51bWJlck5vZGVzKmFyZWFQZXJOb2RlKS9QSSApID0gUlxyXG5cdFx0dmFyIHdhbGtlckFyZWEgPSAyNTtcclxuXHRcdC8vdmFyIHJhZGl1cyA9IE1hdGguc3FydCggdG90YWxXYWxrZXJzL01hdGguUEkgKSo0O1xyXG5cdFx0dmFyIHJhZGl1cyA9IE1hdGguc3FydCggdG90YWxXYWxrZXJzKndhbGtlckFyZWEpIC8gTWF0aC5QSTtcclxuXHRcdFxyXG5cdFx0Zm9yKHZhciBpPTA7aTx3YWxrZXJUeXBlS2V5cy5sZW5ndGg7aSsrKVxyXG5cdFx0e1xyXG5cdFx0XHR2YXIgd2Fsa2VyVHlwZSA9IHdhbGtlclR5cGVLZXlzW2ldO1xyXG5cdFx0XHR2YXIgY29ubmVjdG9yID0gdGhpcy53YWxrZXJUeXBlQ29ubmVjdGlvbnNbd2Fsa2VyVHlwZV07XHJcblx0XHRcdHZhciBwZXJjZW50T2ZXYWxrZXJzID0gY29ubmVjdG9yLm5vZGVzLmxlbmd0aC90b3RhbFdhbGtlcnM7XHJcblx0XHRcdHZhciB3YWxrZXJBbmdsZSA9IHBlcmNlbnRPZldhbGtlcnMgKiAzNjA7XHJcblx0XHRcdFxyXG5cdFx0XHR2YXIgZ3JhcGhEYXRhID0gdGhpcy5jYW52YXNIb2xkZXIuZ2V0R3JhcGhEYXRhKHdhbGtlclR5cGUpO1xyXG5cdFx0XHQvKlxyXG5cdFx0XHRjb25zb2xlLmxvZyhcIndhbGtlclR5cGU9XCIrd2Fsa2VyVHlwZStcclxuXHRcdFx0XHRcdFwiOmNvbm5lY3Rvci5ub2Rlcy5sZW5ndGg6XCIrY29ubmVjdG9yLm5vZGVzLmxlbmd0aCtcclxuXHRcdFx0XHRcdFwiOnBlcmNlbnRPZldhbGtlcnM6XCIrcGVyY2VudE9mV2Fsa2VycytcclxuXHRcdFx0XHRcdFwiOndhbGtlckFuZ2xlOlwiK3dhbGtlckFuZ2xlK1xyXG5cdFx0XHRcdFx0XCJncmFwaERhdGE9XCIrQ29tbW9uLnRvU3RyaW5nKGdyYXBoRGF0YSkrXHJcblx0XHRcdFx0XHRcIlwiKTtcclxuXHQqL1xyXG5cdFx0XHQvL2NvbnNvbGUubG9nKHdhbGtlclR5cGUrXCI6YmVmb3JlOlwiK0NvbW1vbnRvU3RyaW5nKGNvbm5lY3Rvci5zaGFwZU5vZGUuZ3JhcGhEYXRhLm5vZGVEaXNwbGF5KSk7XHJcblx0XHRcdC8vY29uc29sZS5sb2coXCJ3YWxrZXI9XCIrdGhpcy5uYW1lK1wiOndhbGtlclR5cGU9XCIrd2Fsa2VyVHlwZStcIjp0cz1cIitjb25uZWN0b3Iuc2hhcGVOb2RlLmdyYXBoRGF0YS5ub2RlRGlzcGxheS5kaXNwbGF5SW5mby50cyk7XHJcblx0XHRcdFxyXG5cdFx0XHRjb25uZWN0b3Iuc2hhcGVOb2RlLmdyYXBoRGF0YS5ub2RlRGlzcGxheS5kaXNwbGF5SW5mby5zdGFydEFuZ2xlID0gYW5nbGU7XHJcblx0XHRcdGFuZ2xlICs9IHdhbGtlckFuZ2xlO1xyXG5cdFx0XHRjb25uZWN0b3Iuc2hhcGVOb2RlLmdyYXBoRGF0YS5ub2RlRGlzcGxheS5kaXNwbGF5SW5mby5lbmRBbmdsZSA9IGFuZ2xlO1xyXG5cdFx0XHRjb25uZWN0b3Iuc2hhcGVOb2RlLmdyYXBoRGF0YS5ub2RlRGlzcGxheS5kaXNwbGF5SW5mby5yYWRpdXMgPSByYWRpdXM7XHJcblx0XHRcdFxyXG5cdFx0XHRjb25uZWN0b3Iuc2hhcGVOb2RlLmdyYXBoRGF0YS5ub2RlRGlzcGxheS5kaXNwbGF5SW5mby5maWxsQ29sb3IgPSBncmFwaERhdGEubm9kZURpc3BsYXkuZGlzcGxheUluZm8uZmlsbENvbG9yO1xyXG5cdFx0XHQvL2lmKGNvbm5lY3Rvci5zaGFwZU5vZGUuZ3JhcGhEYXRhLm5vZGVEaXNwbGF5LmRpc3BsYXlJbmZvLmZpbGxDb2xvcilcclxuXHRcdFx0Ly9jb25uZWN0b3Iuc2hhcGVOb2RlLmdyYXBoRGF0YS5ub2RlRGlzcGxheS5kaXNwbGF5SW5mby5maWxsQ29sb3IgPSBcclxuXHRcdFx0Ly8vLy8vLy9jb25uZWN0b3Iuc2hhcGVOb2RlLmdyYXBoRGF0YS5ub2RlRGlzcGxheSA9IG5ldyBBcmNEaXNwbGF5U2hhcGUoY29ubmVjdG9yLnNoYXBlTm9kZS5ncmFwaERhdGEubm9kZURpc3BsYXkuZGlzcGxheUluZm8pXHJcblx0XHRcdGNvbm5lY3Rvci5zaGFwZU5vZGUuZ3JhcGhEYXRhLm5vZGVEaXNwbGF5LmluaXQoKTtcclxuXHRcdFx0Ly8vLy8vLy8vY29ubmVjdG9yLnNoYXBlID0gY29ubmVjdG9yLnNoYXBlTm9kZS5ncmFwaERhdGEubm9kZURpc3BsYXkuc2hhcGU7XHJcblx0XHRcdFxyXG5cdFx0XHQvL2NvbnNvbGUubG9nKHdhbGtlclR5cGUrXCI6YWZ0ZXI6XCIrQ29tbW9udG9TdHJpbmcoY29ubmVjdG9yLnNoYXBlTm9kZS5ncmFwaERhdGEubm9kZURpc3BsYXkpKTtcclxuXHRcdFx0Ly9jb25zb2xlLmxvZyhcIi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cIik7XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdGFkZFdhbGtlcih3YWxrZXIpXHJcblx0e1xyXG5cdFx0dGhpcy53YWxrZXJPYmplY3Rbd2Fsa2VyXSA9IHdhbGtlcjtcclxuXHRcdHZhciBjb25uZWN0aW9uID0gdGhpcy5nZXRDcmVhdGVXYWxrZXJUeXBlQ29ubmVjdGlvbih3YWxrZXIuZ3JhcGhEYXRhS2V5KVxyXG5cdFx0Ly92YXIgY29ubmVjdGlvbiA9IHRoaXMuZ2V0Q3JlYXRlV2Fsa2VyVHlwZUNvbm5lY3Rpb24od2Fsa2VyLmluZm9EYXRhLndhbGtlclR5cGVLZXkpXHJcblx0XHRjb25uZWN0aW9uLmFkZE5vZGUod2Fsa2VyKTtcclxuXHRcdFxyXG5cdFx0dGhpcy5hZGp1c3R3YWxrZXJUeXBlQ29ubmVjdGlvbnMoKTtcclxuXHR9XHJcblx0XHJcblx0cmVtb3ZlV2Fsa2VyKHdhbGtlcilcclxuXHR7XHJcblx0XHR2YXIgY29ubmVjdGlvbiA9IHRoaXMuZ2V0Q3JlYXRlV2Fsa2VyVHlwZUNvbm5lY3Rpb24od2Fsa2VyLmluZm9EYXRhLndhbGtlclR5cGVLZXkpO1xyXG5cdFx0ZGVsZXRlIHRoaXMud2Fsa2VyT2JqZWN0W3dhbGtlcl07IFxyXG5cdFx0Y29ubmVjdGlvbi5yZW1vdmVOb2RlKHdhbGtlcik7XHRcclxuXHRcdHRoaXMuYWRqdXN0d2Fsa2VyVHlwZUNvbm5lY3Rpb25zKCk7XHJcblx0fVxyXG5cdFxyXG5cdGxvZygpXHJcblx0e1xyXG5cdFx0Y29uc29sZS5sb2coXCJqdW5jdGlvbiBsb2c6XCIrQ29tbW9udG9TdHJpbmcodGhpcykpO1xyXG5cdH1cclxuXHJcbn1cclxuLy88anMybm9kZT5cclxubW9kdWxlLmV4cG9ydHMgPSBKdW5jdGlvbjtcclxuY29uc29sZS5sb2coXCJMb2FkaW5nOkp1bmN0aW9uXCIpO1xyXG4vLzwvanMybm9kZT5cclxuIiwidmFyIENvbm5lY3RvckRpc3BsYXkgPSByZXF1aXJlKCcuLi8uLi9ub2Rlcy9jb25uZWN0b3JkaXNwbGF5L2Nvbm5lY3RvcmRpc3BsYXknKTtcclxudmFyIE5vZGVEaXNwbGF5ID0gcmVxdWlyZSgnLi4vLi4vbm9kZXMvbm9kZWRpc3BsYXkvbm9kZWRpc3BsYXknKTtcclxudmFyIENvbW1vbiA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9jb21tb24nKTtcclxuXHJcbmNsYXNzIEp1bmN0aW9uQ29ubmVjdG9yIGV4dGVuZHMgQ29ubmVjdG9yRGlzcGxheVxyXG57XHJcblx0Y29uc3RydWN0b3IoZGlzcGxheUluZm8pXHJcblx0e1xyXG5cdFx0c3VwZXIoZGlzcGxheUluZm8pO1xyXG5cdH1cclxuXHRcclxuXHRkcmF3Q29ubmVjdG9yKGNhbnZhc0hvbGRlcixjb25uZWN0b3Isbm9kZSlcclxuXHR7XHJcblx0XHRzdXBlci5kcmF3Q29ubmVjdG9yKGNhbnZhc0hvbGRlcixjb25uZWN0b3Isbm9kZSk7XHJcblxyXG5cdFx0Zm9yKHZhciBqPTA7ajxjb25uZWN0b3Iubm9kZXMubGVuZ3RoO2orKylcclxuXHRcdHtcclxuXHRcdFx0dmFyIG5vZGVKID0gY29ubmVjdG9yLm5vZGVzW2pdO1x0XHRcclxuXHRcdFx0dmFyIHAgPSBub2RlLnBvc2l0aW9uLmNyZWF0ZUJ5QWRkaW5nKG5vZGUuY29ubmVjdG9yUG9zaXRpb24pO1xyXG5cdFx0XHR2YXIgcGogPSBub2RlSi5wb3NpdGlvbi5jcmVhdGVCeUFkZGluZyhub2RlSi5jb25uZWN0b3JQb3NpdGlvbik7XHJcblx0XHRcdGNhbnZhc0hvbGRlci5jb250ZXh0LmxpbmVXaWR0aCA9IDU7XHJcblx0XHRcdGNhbnZhc0hvbGRlci5jb250ZXh0LnN0cm9rZVN0eWxlID0gQ29tbW9uLmdldENvbG9yRnJvbVN0cmluZyhcIjAwMDAwMGZmXCIpO1xyXG5cdFx0XHRjYW52YXNIb2xkZXIuY29udGV4dC5iZWdpblBhdGgoKTtcclxuXHRcdFx0Y2FudmFzSG9sZGVyLmNvbnRleHQubW92ZVRvKHAuZ2V0WCgpLHAuZ2V0WSgpKTtcclxuXHRcdFx0Y2FudmFzSG9sZGVyLmNvbnRleHQubGluZVRvKHBqLmdldFgoKSxwai5nZXRZKCkpO1xyXG5cdFx0XHRjYW52YXNIb2xkZXIuY29udGV4dC5zdHJva2UoKTtcclxuXHRcdH1cclxuXHR9XHJcbn1cclxuLy88anMybm9kZT5cclxubW9kdWxlLmV4cG9ydHMgPSBKdW5jdGlvbkNvbm5lY3RvcjtcclxuY29uc29sZS5sb2coXCJMb2FkaW5nOkp1bmN0aW9uQ29ubmVjdG9yXCIpO1xyXG4vLzwvanMybm9kZT5cclxuIiwidmFyIFBvc2l0aW9uID0gcmVxdWlyZSgnLi4vLi4vbm9kZXMvcG9zaXRpb24vcG9zaXRpb24nKTtcclxudmFyIE5vZGVEaXNwbGF5ID0gcmVxdWlyZSgnLi4vLi4vbm9kZXMvbm9kZWRpc3BsYXkvbm9kZWRpc3BsYXknKTtcclxudmFyIENvbW1vbiA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9jb21tb24nKTtcclxuXHJcbmNsYXNzIEp1bmN0aW9uRGlzcGxheSBleHRlbmRzIE5vZGVEaXNwbGF5XHJcbntcclxuXHRjb25zdHJ1Y3RvcihkaXNwbGF5SW5mbylcclxuXHR7XHJcblx0XHRzdXBlcihkaXNwbGF5SW5mbyk7XHJcblx0XHR0aGlzLmNoZWNrUG9zaXRpb25JbmZvID0ge307XHJcblx0fVxyXG5cdFxyXG5cdGNvbnRhaW5zUG9zaXRpb24ocG9zaXRpb24sbm9kZSlcclxuXHR7XHJcblx0XHQvL2NvbnNvbGUubG9nKFwiLS0tLSBcIitub2RlLm5hbWUrXCIgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cIik7XHJcblx0XHRcclxuXHRcdGlmKCFub2RlLmhhc093blByb3BlcnR5KFwiY2hlY2tQb3NpdGlvbkluZm9cIikpXHJcblx0XHR7XHJcblx0XHRcdFx0Ly9jb25zb2xlLmxvZyhcIi0tLS0gXCIrbm9kZS5uYW1lK1wiIFwiK25vZGUuZ2V0Tm9kZUtleSgpK1wiIG1pc3NpbmcgY2hlY2tQb3NpdGlvbkluZm8gLS1cIik7XHJcblx0XHRcdFx0cmV0dXJuKGZhbHNlKTtcclxuXHRcdH1cclxuXHJcblx0XHRcclxuXHRcdHZhciBkaXN0YW5jZSA9IG5vZGUuY2hlY2tQb3NpdGlvbkluZm8uY2lyY2xlUG9zaXRpb24uZ2V0RGlzdGFuY2UocG9zaXRpb24pO1xyXG5cdFxyXG5cdFxyXG5cdFx0cmV0dXJuKFxyXG5cdFx0XHRcdChkaXN0YW5jZTw9bm9kZS5ncmFwaERhdGEucmFkaXVzKSB8fFxyXG5cdFx0XHRcdChcclxuXHRcdFx0XHRcdFx0KG5vZGUuY2hlY2tQb3NpdGlvbkluZm8udGV4dFg8PXBvc2l0aW9uLmdldFgoKSkgJiZcclxuXHRcdFx0XHRcdFx0KG5vZGUuY2hlY2tQb3NpdGlvbkluZm8udGV4dFgrbm9kZS5jaGVja1Bvc2l0aW9uSW5mby50ZXh0V2lkdGgpPj1wb3NpdGlvbi5nZXRYKCkgJiZcclxuXHRcdFx0XHRcdFx0KG5vZGUuY2hlY2tQb3NpdGlvbkluZm8udGV4dFk8PXBvc2l0aW9uLmdldFkoKSkgJiZcclxuXHRcdFx0XHRcdFx0KG5vZGUuY2hlY2tQb3NpdGlvbkluZm8udGV4dFkrbm9kZS5jaGVja1Bvc2l0aW9uSW5mby50ZXh0SGVpZ2h0KT49cG9zaXRpb24uZ2V0WSgpXHJcblx0XHRcdFx0KVxyXG5cdFx0XHRcdCk7XHJcblx0fVxyXG5cdFxyXG5cdFxyXG5cdGRyYXdOb2RlKGNhbnZhc0hvbGRlcixub2RlKVxyXG5cdHtcclxuXHRcdHN1cGVyLmRyYXdOb2RlKGNhbnZhc0hvbGRlcixub2RlKTtcclxuXHRcdC8vY29uc29sZS5sb2coXCJaWlpaWlpaWlpaWlpaWjo6OjpcIitub2RlLm5hbWUpO1xyXG5cdCAgICB2YXIgcmFkaXVzQXZlcmFnZSA9IDA7XHJcblx0ICAgIGZvcih2YXIgaT0wO2k8bm9kZS5ub2Rlcy5sZW5ndGg7aSsrKVxyXG5cdCAgICB7XHJcblx0ICAgICBcdHZhciBzdWJOb2RlID0gbm9kZS5ub2Rlc1tpXTtcclxuXHQgICAgIFx0Ly9jb25zb2xlLmxvZyhcIiAgICAgICAgICAgIFpaWlpaWlpaWlpaWlpaOjo6OlwiK3N1Yk5vZGUubmFtZSk7XHJcblx0ICAgIFx0cmFkaXVzQXZlcmFnZSArPSBzdWJOb2RlLmdyYXBoRGF0YS5ub2RlRGlzcGxheS5kaXNwbGF5SW5mby5yYWRpdXM7XHJcblx0ICAgIH1cclxuXHQgICAgaWYocmFkaXVzQXZlcmFnZSE9MCkgcmFkaXVzQXZlcmFnZSA9IChyYWRpdXNBdmVyYWdlIC8gbm9kZS5ub2Rlcy5sZW5ndGgpO1xyXG5cdCAgICByYWRpdXNBdmVyYWdlICs9IHRoaXMuZGlzcGxheUluZm8uYm9yZGVyV2lkdGgqNTtcclxuXHQgICAgXHJcblx0ICAgIHZhciBqdW5jdGlvblRleHQgPSBub2RlLm5hbWU7XHQgICAgXHJcblx0ICAgIHZhciByZWN0UGFkZGluZyA9IHRoaXMuZGlzcGxheUluZm8uZm9udFBpeGVsSGVpZ2h0LzI7XHJcblx0ICAgIFxyXG5cdCAgICBjYW52YXNIb2xkZXIuY29udGV4dC5mb250PXRoaXMuZGlzcGxheUluZm8uZm9udFN0eWxlK1wiIFwiK3RoaXMuZGlzcGxheUluZm8uZm9udFBpeGVsSGVpZ2h0K1wicHggXCIrdGhpcy5kaXNwbGF5SW5mby5mb250RmFjZTsgXHJcblx0ICAgIGNhbnZhc0hvbGRlci5jb250ZXh0LnRleHRBbGlnbj1cImNlbnRlclwiO1xyXG5cdCAgICB2YXIgdGV4dE1ldHJpY3MgPSB0aGlzLm1ldHJpY3NUZXh0TXV0aXBsZUxpbmVzKFxyXG5cdCAgICBcdFx0Y2FudmFzSG9sZGVyLmNvbnRleHQsXHJcblx0ICAgIFx0XHRqdW5jdGlvblRleHQsXHJcblx0ICAgIFx0XHR0aGlzLmRpc3BsYXlJbmZvLmZvbnRQaXhlbEhlaWdodCxcclxuXHQgICAgXHRcdFwiXFxuXCIpO1xyXG5cdCAgICBcclxuXHQgICAgdmFyIHRvdGFsV2lkdGggPSBNYXRoLm1heChyYWRpdXNBdmVyYWdlK3JlY3RQYWRkaW5nLHRleHRNZXRyaWNzLndpZHRoK3JlY3RQYWRkaW5nK3JlY3RQYWRkaW5nKTtcclxuXHQgICAgdmFyIHRvdGFsSGVpZ2h0ID0gXHJcblx0ICAgIFx0cmFkaXVzQXZlcmFnZStcclxuXHQgICAgXHR0aGlzLmRpc3BsYXlJbmZvLmJvcmRlcldpZHRoKjIrXHJcblx0ICAgIFx0bm9kZS5ncmFwaERhdGEudGV4dFNwYWNlcitcclxuXHQgICAgXHR0ZXh0TWV0cmljcy5oZWlnaHQrcmVjdFBhZGRpbmc7XHJcblx0ICAgIFxyXG5cdCAgICBub2RlLndpZHRoID0gdG90YWxXaWR0aDtcclxuXHQgICAgbm9kZS5oZWlnaHQgPSB0b3RhbEhlaWdodDtcclxuXHQgICAgXHJcblx0XHRpZighbm9kZS5oYXNPd25Qcm9wZXJ0eShcImNoZWNrUG9zaXRpb25JbmZvXCIpKVxyXG5cdFx0e1xyXG5cdFx0XHQvL2NvbnNvbGUubG9nKFwiKioqKiBcIitub2RlLm5hbWUrXCIgbWlzc2luZyBjaGVja1Bvc2l0aW9uSW5mbyAtLS0tLS0tLS0tLS0tLS0tLS0tLS1cIik7XHRcdFx0XHJcblx0XHRcdG5vZGUuY2hlY2tQb3NpdGlvbkluZm8gPSB7IG1ha2VJdFJlYWw6XCJ0cnVlXCIsIH07XHJcblx0XHR9XHJcblx0XHR2YXIgeCA9IG5vZGUucG9zaXRpb24uZ2V0WCgpO1xyXG5cdFx0dmFyIHkgPSBub2RlLnBvc2l0aW9uLmdldFkoKTtcclxuXHRcdC8veCA9IHRoaXMuZHJhd1Bvc2l0aW9uLmdldFgoKTtcclxuXHRcdC8veSA9IHRoaXMuZHJhd1Bvc2l0aW9uLmdldFkoKTtcclxuXHJcblx0ICAgIC8vaWYobm9kZS5jaGVja1Bvc2l0aW9uSW5mbz09bnVsbCkgbm9kZS5jaGVja1Bvc2l0aW9uSW5mbyA9IHt9O1xyXG5cdCAgICBub2RlLmNoZWNrUG9zaXRpb25JbmZvLmNpcmNsZVBvc2l0aW9uID0gbmV3IFBvc2l0aW9uKFxyXG5cdCAgICBcdFx0eCxcclxuXHQgICAgXHRcdHktdG90YWxIZWlnaHQvMi4wK3JhZGl1c0F2ZXJhZ2UpO1xyXG5cdCAgICBcclxuXHQgICAgbm9kZS5jb25uZWN0b3JQb3NpdGlvbi5zZXRZKC0odG90YWxIZWlnaHQvMi4wLXJhZGl1c0F2ZXJhZ2UpKTtcclxuXHRcclxuXHQgICAgXHJcblx0ICAgIG5vZGUuY2hlY2tQb3NpdGlvbkluZm8udGV4dFggPSB4LSh0ZXh0TWV0cmljcy53aWR0aCtyZWN0UGFkZGluZykvMi4wO1xyXG5cdCAgICBub2RlLmNoZWNrUG9zaXRpb25JbmZvLnRleHRZID0gbm9kZS5jaGVja1Bvc2l0aW9uSW5mby5jaXJjbGVQb3NpdGlvbi5nZXRZKCkrXHJcblx0ICAgIFx0cmFkaXVzQXZlcmFnZStcclxuXHQgICAgXHR0aGlzLmRpc3BsYXlJbmZvLmJvcmRlcldpZHRoK1xyXG5cdCAgICBcdG5vZGUuZ3JhcGhEYXRhLnRleHRTcGFjZXI7XHJcblx0ICAgIG5vZGUuY2hlY2tQb3NpdGlvbkluZm8udGV4dFdpZHRoID0gdGV4dE1ldHJpY3Mud2lkdGgrcmVjdFBhZGRpbmc7XHJcblx0ICAgIG5vZGUuY2hlY2tQb3NpdGlvbkluZm8udGV4dEhlaWdodCA9IHRleHRNZXRyaWNzLmhlaWdodCtyZWN0UGFkZGluZztcclxuXHRcclxuXHQgICAgXHJcblx0ICAgIHRoaXMucm91bmRlZFJlY3QoXHJcblx0ICAgIFx0XHRjYW52YXNIb2xkZXIuY29udGV4dCxcclxuXHQgXHRcdCAgIG5vZGUuY2hlY2tQb3NpdGlvbkluZm8udGV4dFgsXHJcblx0IFx0XHQgICBub2RlLmNoZWNrUG9zaXRpb25JbmZvLnRleHRZLFxyXG5cdCBcdFx0ICAgbm9kZS5jaGVja1Bvc2l0aW9uSW5mby50ZXh0V2lkdGgsXHJcblx0IFx0XHQgICBub2RlLmNoZWNrUG9zaXRpb25JbmZvLnRleHRIZWlnaHQsXHJcblx0IFx0XHQgICB0aGlzLmRpc3BsYXlJbmZvLmZvbnRQaXhlbEhlaWdodC8zLFxyXG5cdCBcdFx0ICAgdGhpcy5kaXNwbGF5SW5mby5ib3JkZXJXaWR0aCxcclxuXHQgXHRcdCAgIENvbW1vbi5nZXRDb2xvckZyb21TdHJpbmcodGhpcy5kaXNwbGF5SW5mby5yZWN0Qm9yZGVyQ29sb3IpLFxyXG5cdCBcdFx0ICAgQ29tbW9uLmdldENvbG9yRnJvbVN0cmluZyh0aGlzLmRpc3BsYXlJbmZvLnJlY3RGaWxsQ29sb3IpICk7XHJcblx0ICAgIFxyXG5cdCAgICBcclxuXHQgICAgY2FudmFzSG9sZGVyLmNvbnRleHQuZmlsbFN0eWxlPUNvbW1vbi5nZXRDb2xvckZyb21TdHJpbmcodGhpcy5kaXNwbGF5SW5mby5mb250Q29sb3IpO1xyXG5cdFxyXG5cdCAgICB0aGlzLmZpbGxUZXh0TXV0aXBsZUxpbmVzKFxyXG5cdCAgICBcdFx0Y2FudmFzSG9sZGVyLmNvbnRleHQsXHJcblx0ICAgIFx0XHRqdW5jdGlvblRleHQsXHJcblx0ICAgIFx0XHR4LFxyXG5cdCAgICBcdFx0bm9kZS5jaGVja1Bvc2l0aW9uSW5mby50ZXh0WStyZWN0UGFkZGluZyoyLjArdGhpcy5kaXNwbGF5SW5mby5ib3JkZXJXaWR0aCxcclxuXHQgICAgXHRcdHRoaXMuZGlzcGxheUluZm8uZm9udFBpeGVsSGVpZ2h0LFxyXG5cdCAgICBcdFx0XCJcXG5cIik7XHJcblx0ICBcclxuXHQgIFxyXG5cdCAgICBpZihub2RlLmlzU2VsZWN0ZWQpXHJcblx0ICAgIHtcclxuXHQgICAgXHRjYW52YXNIb2xkZXIuY29udGV4dC5maWxsU3R5bGUgPSBDb21tb24uZ2V0Q29sb3JGcm9tU3RyaW5nKHRoaXMuZGlzcGxheUluZm8uc2VsZWN0RmlsbENvbG9yKTtcclxuXHQgICAgXHRjYW52YXNIb2xkZXIuY29udGV4dC5zdHJva2VTdHlsZSA9IENvbW1vbi5nZXRDb2xvckZyb21TdHJpbmcodGhpcy5kaXNwbGF5SW5mby5zZWxlY3RCb3JkZXJDb2xvcik7XHJcblx0ICAgIH1cclxuXHQgICAgZWxzZVxyXG5cdCAgICB7XHJcblx0ICAgIFx0Y2FudmFzSG9sZGVyLmNvbnRleHQuZmlsbFN0eWxlID0gQ29tbW9uLmdldENvbG9yRnJvbVN0cmluZyh0aGlzLmRpc3BsYXlJbmZvLmZpbGxDb2xvcik7XHJcblx0ICAgICAgICBjYW52YXNIb2xkZXIuY29udGV4dC5zdHJva2VTdHlsZSA9IENvbW1vbi5nZXRDb2xvckZyb21TdHJpbmcodGhpcy5kaXNwbGF5SW5mby5ib3JkZXJDb2xvcik7XHJcblx0ICAgIH1cclxuXHQgIC8qXHJcblx0ICAgIGNvbnNvbGUubG9nKFwibmFtZT1cIitub2RlLm5hbWUrXHJcblx0ICAgIFx0XHRcIjpzZWxlY3RGaWxsQ29sb3I9XCIrdGhpcy5kaXNwbGF5SW5mby5zZWxlY3RGaWxsQ29sb3IrXHJcblx0ICAgIFx0XHRcIjpmaWxsQ29sb3I9XCIrdGhpcy5kaXNwbGF5SW5mby5maWxsQ29sb3IrXHJcblx0ICAgIFx0XHRcIjpYPVwiK25vZGUuY2hlY2tQb3NpdGlvbkluZm8uY2lyY2xlUG9zaXRpb24uZ2V0WCgpK1xyXG5cdCAgICBcdFx0XCI6WT1cIitub2RlLmNoZWNrUG9zaXRpb25JbmZvLmNpcmNsZVBvc2l0aW9uLmdldFkoKStcclxuXHQgICAgXHRcdFwiOnJhZGl1cz1cIityYWRpdXNBdmVyYWdlK1xyXG5cdCAgICBcdFx0XCJcIlxyXG5cdCAgICBcdFx0KTtcclxuXHQgICAgKi9cclxuXHQgICAgXHJcblx0XHJcblx0ICAgIGNhbnZhc0hvbGRlci5jb250ZXh0LmJlZ2luUGF0aCgpO1xyXG5cdCAgICBjYW52YXNIb2xkZXIuY29udGV4dC5hcmMoXHJcblx0XHRcdFx0bm9kZS5jaGVja1Bvc2l0aW9uSW5mby5jaXJjbGVQb3NpdGlvbi5nZXRYKCksXHJcblx0XHRcdFx0bm9kZS5jaGVja1Bvc2l0aW9uSW5mby5jaXJjbGVQb3NpdGlvbi5nZXRZKCksXHJcblx0XHRcdFx0cmFkaXVzQXZlcmFnZSwvL25vZGUuZ3JhcGhEYXRhLnJhZGl1cyxcclxuXHRcdFx0XHQwLFxyXG5cdFx0XHRcdE1hdGguUEkgKiAyLCBmYWxzZSk7XHJcblx0ICAgIGNhbnZhc0hvbGRlci5jb250ZXh0LmNsb3NlUGF0aCgpO1xyXG5cdCAgICBjYW52YXNIb2xkZXIuY29udGV4dC5maWxsKCk7XHJcblx0ICAgIGNhbnZhc0hvbGRlci5jb250ZXh0LmxpbmVXaWR0aCA9IHRoaXMuZGlzcGxheUluZm8uYm9yZGVyV2lkdGg7XHJcblx0ICAgIGNhbnZhc0hvbGRlci5jb250ZXh0LnN0cm9rZSgpO1xyXG5cdFxyXG5cdFxyXG5cdCAgICBmb3IodmFyIGk9MDtpPG5vZGUubm9kZXMubGVuZ3RoO2krKylcclxuXHQgICAge1xyXG5cdCAgICAgXHR2YXIgc3ViTm9kZSA9IG5vZGUubm9kZXNbaV07XHJcblx0ICAgICBcdHN1Yk5vZGUucG9zaXRpb24gPSBub2RlLmNoZWNrUG9zaXRpb25JbmZvLmNpcmNsZVBvc2l0aW9uO1xyXG5cdCAgICBcdHN1Yk5vZGUuZ3JhcGhEYXRhLm5vZGVEaXNwbGF5LmRyYXdOb2RlKG5vZGUuY2FudmFzSG9sZGVyLHN1Yk5vZGUpO1xyXG5cdCAgICB9XHJcblx0XHJcblx0fVxyXG59XHJcbi8vPGpzMm5vZGU+XHJcbm1vZHVsZS5leHBvcnRzID0gSnVuY3Rpb25EaXNwbGF5O1xyXG5jb25zb2xlLmxvZyhcIkxvYWRpbmc6SnVuY3Rpb25EaXNwbGF5XCIpO1xyXG4vLzwvanMybm9kZT5cclxuIiwidmFyIENvbm5lY3RvciA9IHJlcXVpcmUoJy4uL25vZGVzL2Nvbm5lY3Rvci9jb25uZWN0b3InKTtcclxudmFyIFNwcmluZ0Nvbm5lY3RvciA9IHJlcXVpcmUoJy4uL25vZGVzL2Nvbm5lY3Rvci9zcHJpbmdjb25uZWN0b3InKTtcclxuXHJcblxyXG5jbGFzcyBQYXRoIGV4dGVuZHMgU3ByaW5nQ29ubmVjdG9yXHJcbntcclxuXHRjb25zdHJ1Y3Rvcihjb25uZWN0b3JEaXNwbGF5LHNwcmluZ0FuY2hvclBvaW50LGFuY2hvck9mZnNldFBvaW50LHJlbGF4ZWREaXN0YW5jZSxlbGFzdGljaXR5RmFjdG9yLG5hbWUpXHJcblx0e1xyXG5cdFx0c3VwZXIoY29ubmVjdG9yRGlzcGxheSxzcHJpbmdBbmNob3JQb2ludCxhbmNob3JPZmZzZXRQb2ludCxyZWxheGVkRGlzdGFuY2UsZWxhc3RpY2l0eUZhY3RvcixuYW1lKVxyXG5cdFx0dGhpcy53YWxrZXJPYmplY3QgPSBuZXcgT2JqZWN0KCk7XHJcblx0fVxyXG5cdFxyXG5cdGdldENsaWVudEpzb24oKVxyXG5cdHtcclxuXHRcdHZhciBqc29uID0gc3VwZXIuZ2V0Q2xpZW50SnNvbigpO1xyXG5cdFx0anNvbi5qdW5jdGlvblN0YXJ0ID0gdGhpcy5qdW5jdGlvblN0YXJ0LmdldE5vZGVLZXkoKTtcclxuXHRcdGpzb24uanVuY3Rpb25FbmQgPSB0aGlzLmp1bmN0aW9uRW5kLmdldE5vZGVLZXkoKTtcclxuXHRcdHJldHVybihqc29uKTtcclxuXHR9XHJcblx0XHJcblx0c2V0SnVuY3Rpb25zKGp1bmN0aW9uU3RhcnQsanVuY3Rpb25FbmQpXHJcblx0e1xyXG5cdCAgICB0aGlzLmp1bmN0aW9uU3RhcnQgPSBqdW5jdGlvblN0YXJ0O1xyXG5cdFx0dGhpcy5qdW5jdGlvbkVuZCA9IGp1bmN0aW9uRW5kO1xyXG5cdFx0dGhpcy5hZGROb2RlKGp1bmN0aW9uU3RhcnQpO1xyXG5cdFx0dGhpcy5hZGROb2RlKGp1bmN0aW9uRW5kKTtcdFx0XHJcblx0fVxyXG5cdFxyXG5cdGdldENvbm5lY3RvcktleSgpXHJcblx0e1xyXG5cdFx0cmV0dXJuKHRoaXMuZ2V0UGF0aEtleSgpKTtcclxuXHR9XHJcblx0XHJcblx0Z2V0UGF0aEtleSgpXHJcblx0e1xyXG5cdFx0cmV0dXJuKHRoaXMuanVuY3Rpb25TdGFydC5nZXROb2RlS2V5KCkrXCIjXCIrdGhpcy5qdW5jdGlvbkVuZC5nZXROb2RlS2V5KCkpO1xyXG5cdH1cclxuXHRcclxuXHRsb2coKVxyXG5cdHtcclxuXHRcdGNvbnNvbGUubG9nKFwicGF0aCBsb2c6XCIrQ29tbW9udG9TdHJpbmcodGhpcykpO1xyXG5cdH1cclxufVxyXG4vLzxqczJub2RlPlxyXG5tb2R1bGUuZXhwb3J0cyA9IFBhdGg7XHJcbmNvbnNvbGUubG9nKFwiTG9hZGluZzpQYXRoXCIpO1xyXG4vLzwvanMybm9kZT5cclxuIiwidmFyIE5vZGUgPSByZXF1aXJlKCcuLi9ub2Rlcy9ub2RlY2FudmFzL25vZGVjYW52YXMnKTtcclxudmFyIE5vZGVDYW52YXMgPSByZXF1aXJlKCcuLi9ub2Rlcy9ub2RlY2FudmFzL25vZGVjYW52YXMnKTtcclxudmFyIE5vZGVDYW52YXNNb3VzZSA9IHJlcXVpcmUoJy4uL25vZGVzL25vZGVjYW52YXMvbm9kZWNhbnZhc21vdXNlJyk7XHJcbnZhciBDb21tb24gPSByZXF1aXJlKCcuLi9jb21tb24vY29tbW9uJyk7XHJcbnZhciBQb3NpdGlvbiA9IHJlcXVpcmUoJy4uL25vZGVzL3Bvc2l0aW9uL3Bvc2l0aW9uJyk7XHJcbnZhciBQYXRoID0gcmVxdWlyZSgnLi4vcGF0aHMvcGF0aCcpO1xyXG52YXIgV2Fsa2VyID0gcmVxdWlyZSgnLi4vcGF0aHMvd2Fsa2VyJyk7XHJcbnZhciBKdW5jdGlvbiA9IHJlcXVpcmUoJy4uL3BhdGhzL2p1bmN0aW9uJyk7XHJcblxyXG5jbGFzcyBQYXRoV29ybGQgZXh0ZW5kcyBOb2RlQ2FudmFzXHJcbntcclxuXHRjb25zdHJ1Y3RvcihjYW52YXNIb2xkZXIsd29ybGREaXNwbGF5KVxyXG5cdHtcclxuXHRcdHN1cGVyKGNhbnZhc0hvbGRlcik7XHJcblx0XHR0aGlzLmp1bmN0aW9ucyA9IG5ldyBPYmplY3QoKTtcclxuXHRcdHRoaXMucGF0aHMgPSBuZXcgT2JqZWN0KCk7XHJcblx0XHR0aGlzLndhbGtlcnMgPSBuZXcgT2JqZWN0KCk7XHJcblx0XHR0aGlzLndvcmxkVXBkYXRlUXVldWUgPSBuZXcgQXJyYXkoKTtcclxuXHRcdHRoaXMud29ybGRVcGRhdGVRdWV1ZS5pc0luTmVlZE9mU29ydGluZyA9IGZhbHNlXHJcblx0XHRcclxuXHRcdHRoaXMuanVuY3Rpb25TcGFjZXIgPSBjYW52YXNIb2xkZXIuZ2V0Q29ubmVjdG9yKFwianVuY3Rpb25TcGFjZXJcIixjYW52YXNIb2xkZXIuY2FudmFzTmFtZStcIjpqdW5jdGlvblNwYWNlclwiKSxcclxuXHRcdHRoaXMud29ybGRXYWxsID0gY2FudmFzSG9sZGVyLmdldENvbm5lY3RvcihcIndvcmxkV2FsbFwiLGNhbnZhc0hvbGRlci5jYW52YXNOYW1lK1wiOndvcmxkV2FsbFwiKSxcclxuXHRcdFxyXG5cdFx0Ly90aGlzLmp1bmN0aW9uU3BhY2VyID0ganVuY3Rpb25TcGFjZXI7XHJcblx0XHQvL3RoaXMud29ybGRXYWxsID0gd29ybGRXYWxsO1xyXG5cdFx0dGhpcy53b3JsZERpc3BsYXkgPSB3b3JsZERpc3BsYXk7XHJcblx0XHR0aGlzLmxhc3REYXRlID0gXCJcIjtcclxuXHRcdHRoaXMuY2hlY2tUaW1lc3RhbXAgPSBcIlwiO1xyXG5cdFx0dGhpcy5ub2RlQ2FudmFzTW91c2UgPSBuZXcgTm9kZUNhbnZhc01vdXNlKHRoaXMpO1xyXG5cdFx0dGhpcy5maWxsU3R5bGUgPSB3b3JsZERpc3BsYXkud29ybGRCYWNrZ3JvdW5kQ29sb3I7XHJcblx0fVxyXG5cdFxyXG5cdHN0YXRpYyBmaWxsUGF0aFdvcmxkRnJvbUNsaWVudEpzb24od29ybGQsanNvbilcclxuXHR7XHRcdFxyXG5cdFx0Ly9jb25zb2xlLmxvZyhcIlBhdGhXb2xyZDpmaWxsUGF0aFdvcmxkRnJvbUNsaWVudEpzb25cIik7XHJcblx0XHQvL2NvbnNvbGUubG9nKFwiUGF0aFdvbHJkOmZpbGxQYXRoV29ybGRGcm9tQ2xpZW50SnNvbjp3b3JsZE5hbWU9XCIrdGhpcy5uYW1lKTtcclxuXHRcdHdvcmxkLmluZm9EYXRhLm5vZGVLZXkua2V5ID0ganNvbi5pbmZvRGF0YS5ub2RlS2V5LmtleTtcclxuXHRcdHdvcmxkLmluZm9EYXRhLm5vZGVLZXkubm9kZUlkID0ganNvbi5pbmZvRGF0YS5ub2RlS2V5Lm5vZGVJZDtcclxuXHRcdFxyXG5cdFx0dmFyIGp1bmN0aW9uS2V5TWFwID0ge307XHJcblx0XHRPYmplY3Qua2V5cyhqc29uLmp1bmN0aW9ucykuZm9yRWFjaChmdW5jdGlvbiAoa2V5KVxyXG5cdFx0e1xyXG5cdFx0XHR2YXIganVuY3Rpb25Kc29uID0ganNvbi5qdW5jdGlvbnNba2V5XTtcclxuXHRcdFx0dmFyIGp1bmN0aW9uID0gd29ybGQuZ2V0Q3JlYXRlSnVuY3Rpb24oanVuY3Rpb25Kc29uLm5hbWUsanVuY3Rpb25Kc29uLmluZm9EYXRhKTtcclxuXHRcdFx0anVuY3Rpb24ucG9zaXRpb24ueCA9IGp1bmN0aW9uSnNvbi5wb3NpdGlvbi54O1xyXG5cdFx0XHRqdW5jdGlvbi5wb3NpdGlvbi55ID0ganVuY3Rpb25Kc29uLnBvc2l0aW9uLnk7XHJcblx0XHRcdGp1bmN0aW9uS2V5TWFwW2tleV0gPSBqdW5jdGlvbjtcclxuXHRcdH0pO1xyXG5cdFx0XHJcblx0XHRPYmplY3Qua2V5cyhqc29uLnBhdGhzKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpXHJcblx0XHR7XHJcblx0XHRcdHZhciBwYXRoSnNvbiA9IGpzb24ucGF0aHNba2V5XTtcclxuXHRcdFx0dmFyIHBhdGggPSB3b3JsZC5nZXRDcmVhdGVQYXRoKFxyXG5cdFx0XHRcdFx0anVuY3Rpb25LZXlNYXBbcGF0aEpzb24uanVuY3Rpb25TdGFydF0sXHJcblx0XHRcdFx0XHRqdW5jdGlvbktleU1hcFtwYXRoSnNvbi5qdW5jdGlvbkVuZF0sXHJcblx0XHRcdFx0XHRwYXRoSnNvbik7XHJcblx0XHR9KTtcclxuXHRcdFx0XHRcclxuXHRcdE9iamVjdC5rZXlzKGpzb24ud2Fsa2VycykuZm9yRWFjaChmdW5jdGlvbiAoa2V5KVxyXG5cdFx0e1xyXG5cdFx0XHR2YXIgd2Fsa2VySnNvbiA9IGpzb24ud2Fsa2Vyc1trZXldO1xyXG5cdFx0XHR2YXIgd2Fsa2VyID0gd29ybGQuZ2V0Q3JlYXRlV2Fsa2VyKHdhbGtlckpzb24ubmFtZSx3YWxrZXJKc29uLmluZm9EYXRhKTtcclxuXHRcdFx0d2Fsa2VyLnBvc2l0aW9uLnggPSB3YWxrZXJKc29uLnBvc2l0aW9uLng7XHJcblx0XHRcdHdhbGtlci5wb3NpdGlvbi55ID0gd2Fsa2VySnNvbi5wb3NpdGlvbi55O1x0XHJcblx0XHRcdHdhbGtlci5zZXRDdXJyZW50SnVuY3Rpb24oanVuY3Rpb25LZXlNYXBbd2Fsa2VySnNvbi5jdXJyZW50SnVuY3Rpb25dKTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHRcclxuXHQgIHhnZXROb2RlSnNvbihqc29uKVxyXG5cdCAge1xyXG5cdFx0ICBqc29uLm5hbWUgPSB0aGlzLm5hbWU7XHJcblx0XHQgIGpzb24uZ3JhcGhEYXRhS2V5ID0gdGhpcy5ncmFwaERhdGFLZXk7XHJcblx0XHQgIGpzb24uaW5mb0RhdGEgPSB0aGlzLmluZm9EYXRhO1xyXG5cdFx0ICAvL2pzb24uaW5mb0RhdGEubm9kZUtleSA9IHRoaXMuZ2V0Tm9kZUtleSgpO1xyXG5cdFx0ICBqc29uLnBvc2l0aW9uID0gdGhpcy5wb3NpdGlvbi5nZXRDbGllbnRKc29uKCk7XHJcblx0XHQgIGpzb24uY29ubmVjdG9ycyA9IG5ldyBBcnJheSgpO1xyXG5cdFx0ICBmb3IodmFyIGk9MDtpPHRoaXMuY29ubmVjdG9ycy5sZW5ndGg7aSsrKSBqc29uLmNvbm5lY3RvcnMucHVzaCh0aGlzLmNvbm5lY3RvcnNbaV0uZ2V0Q29ubmVjdG9yS2V5KCkpO1xyXG5cclxuXHRcdCAgcmV0dXJuKGpzb24pO1xyXG5cdCAgfVxyXG5cclxuXHRcclxuXHRzdGF0aWMgY3JlYXRlUGF0aFdvcmxkRnJvbUNsaWVudEpzb24oY2FudmFzSG9sZGVyLHdvcmxkRGVmLGpzb24pXHJcblx0e1xyXG5cdFx0dmFyIHBhdGhXb3JsZCA9IG5ldyBQYXRoV29ybGQoY2FudmFzSG9sZGVyLHdvcmxkRGVmKTtcclxuXHRcdFxyXG5cdFx0T2JqZWN0LmtleXMoanNvbi5qdW5jdGlvbnMpLmZvckVhY2goZnVuY3Rpb24gKGtleSlcclxuXHRcdHtcclxuXHRcdFx0dmFyIGp1bmN0aW9uSnNvbiA9IGpzb24uanVuY3Rpb25zW2tleV07XHJcblx0XHRcdHZhciBqdW5jdGlvbiA9IHBhdGhXb3JsZC5nZXRDcmVhdGVKdW5jdGlvbihqdW5jdGlvbkpzb24ubmFtZSxqdW5jdGlvbkpzb24uaW5mb0RhdGEpO1xyXG5cdFx0XHRqdW5jdGlvbi5wb3NpdGlvbi54ID0ganVuY3Rpb25Kc29uLnBvc2l0aW9uLng7XHJcblx0XHRcdGp1bmN0aW9uLnBvc2l0aW9uLnkgPSBqdW5jdGlvbkpzb24ucG9zaXRpb24ueTtcclxuXHRcdH0pO1xyXG5cdFx0XHJcblx0XHRPYmplY3Qua2V5cyhqc29uLndhbGtlcnMpLmZvckVhY2goZnVuY3Rpb24gKGtleSlcclxuXHRcdFx0XHR7XHJcblx0XHRcdFx0XHR2YXIgd2Fsa2VySnNvbiA9IGpzb24ud2Fsa2Vyc1trZXldO1xyXG5cdFx0XHRcdFx0dmFyIHdhbGtlciA9IHBhdGhXb3JsZC5nZXRDcmVhdGVXYWxrZXIod2Fsa2VySnNvbi5uYW1lLHdhbGtlckpzb24uaW5mb0RhdGEpO1xyXG5cdFx0XHRcdFx0d2Fsa2VyLnBvc2l0aW9uLnggPSB3YWxrZXJKc29uLnBvc2l0aW9uLng7XHJcblx0XHRcdFx0XHR3YWxrZXIucG9zaXRpb24ueSA9IHdhbGtlckpzb24ucG9zaXRpb24ueTtcclxuXHRcdFx0XHR9KTtcclxuXHRcdC8vanNvbi5qdW5jdGlvbnMgPSB7fTtcclxuXHRcdC8vanNvbi53YWxrZXJzID0ge307XHJcblx0XHQvL2pzb24ucGF0aHMgPSB7fTtcclxuXHRcdFxyXG5cdFx0LypcclxuXHRcdHZhciBpc1dhbGtlck5ldyA9IHRoaXMuaXNXYWxrZXJOZXcod29ybGRVcGRhdGUud2Fsa2VyTmFtZSk7XHJcblx0XHR2YXIgaXNKdW5jdGlvbk5ldyA9IHRoaXMuaXNKdW5jdGlvbk5ldyh3b3JsZFVwZGF0ZS5qdW5jdGlvbk5hbWUpO1xyXG5cdFx0dmFyIHdhbGtlciA9IHRoaXMuZ2V0Q3JlYXRlV2Fsa2VyKHdvcmxkVXBkYXRlLndhbGtlck5hbWUsd29ybGRVcGRhdGUud2Fsa2VySW5mbyk7XHJcblx0XHR2YXIganVuY3Rpb24gPSB0aGlzLmdldENyZWF0ZUp1bmN0aW9uKHdvcmxkVXBkYXRlLmp1bmN0aW9uTmFtZSx3b3JsZFVwZGF0ZS5qdW5jdGlvbkluZm8pO1x0XHRcclxuXHRcdHZhciBjdXJyZW50SnVuY3Rpb24gPSB3YWxrZXIuZ2V0Q3VycmVudEp1bmN0aW9uKCk7XHJcblx0XHQqL1x0XHJcblx0XHQvL3ZhciB3b3JsZERpc3BsYXkgPSBzZGZzZDtcclxuXHRcdC8vdmFyIHdvcmxkV2FsbCA9IHNmc2Q7XHJcblx0XHQvL3ZhciBqdW5jdGlvblNwYWNlciA9IHh4eFxyXG5cdFx0cmV0dXJuKHBhdGhXb3JsZCk7XHJcblx0fVxyXG5cdFxyXG5cdGRyYXdDYW52YXModGltZXN0YW1wKVxyXG5cdHtcclxuXHRcdHN1cGVyLmRyYXdDYW52YXModGltZXN0YW1wKTtcclxuXHRcdHRoaXMucGF0aFdvbHJkRXh0cmFBbmltYXRpb24odGltZXN0YW1wKTtcclxuXHR9XHJcblx0XHJcblx0Z2V0V29ybGRDbGllbnRKc29uKClcclxuXHR7XHJcblx0XHR2YXIganNvbiA9IHt9O1xyXG5cdFx0XHJcblx0XHRqc29uLmp1bmN0aW9ucyA9IHt9O1xyXG5cdFx0dmFyIGp1bmN0aW9uTGlzdCA9IHRoaXMuZ2V0SnVuY3Rpb25MaXN0KCk7XHJcblx0XHRmb3IodmFyIGk9MDtpPGp1bmN0aW9uTGlzdC5sZW5ndGg7aSsrKVxyXG5cdFx0e1xyXG5cdFx0XHR2YXIganVuY3Rpb24gPSBqdW5jdGlvbkxpc3RbaV07XHJcblx0XHRcdGpzb24uanVuY3Rpb25zW2p1bmN0aW9uLmdldE5vZGVLZXkoKV0gPSBqdW5jdGlvbi5nZXRDbGllbnRKc29uKCk7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdFxyXG5cdFx0anNvbi53YWxrZXJzID0ge307XHJcblx0XHR2YXIgd2Fsa2VyTGlzdCA9IHRoaXMuZ2V0V2Fsa2VyTGlzdCgpO1xyXG5cdFx0Zm9yKHZhciBpPTA7aTx3YWxrZXJMaXN0Lmxlbmd0aDtpKyspXHJcblx0XHR7XHJcblx0XHRcdHZhciB3YWxrZXIgPSB3YWxrZXJMaXN0W2ldO1xyXG5cdFx0XHRqc29uLndhbGtlcnNbd2Fsa2VyLmdldE5vZGVLZXkoKV0gPSB3YWxrZXIuZ2V0Q2xpZW50SnNvbigpO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRqc29uLnBhdGhzID0ge307XHJcblx0XHR2YXIgcGF0aExpc3QgPSB0aGlzLmdldFBhdGhMaXN0KCk7XHJcblx0XHRmb3IodmFyIGk9MDtpPHBhdGhMaXN0Lmxlbmd0aDtpKyspXHJcblx0XHR7XHJcblx0XHRcdHZhciBwYXRoID0gcGF0aExpc3RbaV07XHJcblx0XHRcdGpzb24ucGF0aHNbcGF0aC5nZXRDb25uZWN0b3JLZXkoKV0gPSBwYXRoLmdldENsaWVudEpzb24oKTtcclxuXHRcdH1cclxuXHRcdFxyXG4gIFx0ICAganNvbi5jYW52YXNIb2xkZXIgPSB0aGlzLmNhbnZhc0hvbGRlci5nZXRDbGllbnRKc29uKCk7XHJcbiAgXHQgICBqc29uLmluZm9EYXRhID0gdGhpcy5pbmZvRGF0YTtcdFxyXG4gIFx0ICAgcmV0dXJuKGpzb24pO1xyXG5cdH1cclxuXHRcclxuXHRwYXRoV29scmRFeHRyYUFuaW1hdGlvbih0aW1lc3RhbXApXHJcblx0e1xyXG5cdFx0dGhpcy5wcmVwYXJlV29ybGRVcGRhdGVRdWV1ZSgpO1xyXG5cclxuXHRcdHZhciBsb2NhbENoZWNrVGltZXN0YW1wID0gdGhpcy5hbmltYXRpb25FeGVjVGltZSp0aGlzLnRpbWVGYWN0b3IgKyB0aGlzLnN0YXJ0VGltZS5nZXRUaW1lKCk7XHJcblx0XHR2YXIgY2hlY2tEYXRlID0gbmV3IERhdGUobG9jYWxDaGVja1RpbWVzdGFtcCk7XHJcblxyXG5cdFx0aWYodGhpcy5sYXN0RGF0ZT09bnVsbCkgdGhpcy5sYXN0RGF0ZT09XCJcIjtcclxuXHRcdFxyXG5cdFx0aWYodGhpcy5sYXN0RGF0ZSE9Y2hlY2tEYXRlLnRvTG9jYWxlU3RyaW5nKCkrXCIgXCIrQ29tbW9uLmdldERheU9mV2VlayhjaGVja0RhdGUpKVxyXG5cdFx0e1xyXG5cdFx0XHR0aGlzLmxhc3REYXRlID0gY2hlY2tEYXRlLnRvTG9jYWxlU3RyaW5nKCkrXCIgXCIrQ29tbW9uLmdldERheU9mV2VlayhjaGVja0RhdGUpO1xyXG5cdFx0XHRpZih0aGlzLmlzQW5pbWF0ZWQgJiYgdGhpcy5jYW52YXNIb2xkZXIuaXNEcmF3YWJsZSgpKSAkKCcjd29ybGRfZGF0ZScpLmh0bWwodGhpcy5sYXN0RGF0ZSk7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHRoaXMuY2hlY2tUaW1lc3RhbXAgPSBsb2NhbENoZWNrVGltZXN0YW1wO1xyXG5cdFx0aWYodGhpcy5pc0FuaW1hdGVkKSB3aGlsZSh0aGlzLmlzTmV4dFdvcmxkVXBkYXRlUmVhZHkobG9jYWxDaGVja1RpbWVzdGFtcCkpXHJcblx0XHR7XHJcblx0XHRcdHZhciBwcm9jY2VzZWQgPSB0aGlzLnByb2Nlc3NXb3JsZFVwZGF0ZVF1ZXVlKCk7XHJcblx0XHRcdGlmKHByb2NjZXNlZCE9bnVsbClcclxuXHRcdFx0e1xyXG5cdFx0XHRcdHZhciBkYXRlID0gbmV3IERhdGUocHJvY2Nlc2VkLnByb2Nlc3NUaW1lc3RhbXAqMTAwMCswKjEwMDApOy8vcHJvY2Nlc2VkLmdldERhdGUoKTtcclxuXHRcdFx0fVxyXG5cdFx0fVx0XHJcblx0XHRcclxuXHRcdC8vIHByb2Nlc3MgdGhlIHdhbGtlcnMgcnVsZXNcclxuXHRcdGZvciAodmFyIHdhbGtlcktleSBpbiB0aGlzLndhbGtlcnMpXHJcblx0XHR7XHJcblx0XHRcdHZhciB3YWxrZXIgPSB0aGlzLndhbGtlcnNbd2Fsa2VyS2V5XTtcclxuXHRcdFx0d2Fsa2VyLnByb2Nlc3NXYWxrZXJSdWxlcyh0aGlzKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdFxyXG5cdFxyXG5cdFxyXG5cdGxvZygpXHJcblx0e1xyXG5cdFx0Y29uc29sZS5sb2coXCJwYXRoV29ybGQgbG9nOlwiK0NvbW1vbnRvU3RyaW5nKHRoaXMud29ybGREaXNwbGF5KSk7XHJcblx0fVxyXG5cdFxyXG5cdFxyXG5cdGlzV2Fsa2VyTmV3KHdhbGtlck5hbWUpXHJcblx0e1xyXG5cdFx0cmV0dXJuKCF0aGlzLndhbGtlcnMuaGFzT3duUHJvcGVydHkod2Fsa2VyTmFtZSkpO1xyXG5cdH1cclxuXHRcclxuXHRpc0p1bmN0aW9uTmV3KGp1bmN0aW9uTmFtZSlcclxuXHR7XHJcblx0XHRyZXR1cm4oIXRoaXMuanVuY3Rpb25zLmhhc093blByb3BlcnR5KGp1bmN0aW9uTmFtZSkpO1xyXG5cdH1cclxuXHRcclxuXHRpc05leHRXb3JsZFVwZGF0ZVJlYWR5KHRpbWVzdGFtcClcclxuXHR7XHJcblx0XHR2YXIgcmVhZHkgPSBmYWxzZTtcclxuXHRcdGlmKHRoaXMud29ybGRVcGRhdGVRdWV1ZS5sZW5ndGg+MClcclxuXHRcdHtcclxuXHRcdFx0cmVhZHkgPSB0aGlzLndvcmxkVXBkYXRlUXVldWVbMF0ucmVhZHlUb0JlUHJvY2Vzc2VkKHRpbWVzdGFtcCk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4ocmVhZHkpO1xyXG5cdH1cclxuXHRcclxuXHRwZWVrQXROZXh0V29ybGRVcGRhdGUoKVxyXG5cdHtcclxuXHRcdHZhciB3b3JsZFVwZGF0ZSA9IG51bGw7XHJcblx0XHRpZih0aGlzLndvcmxkVXBkYXRlUXVldWUubGVuZ3RoPjApXHJcblx0XHR7XHJcblx0XHRcdHdvcmxkVXBkYXRlID0gdGhpcy53b3JsZFVwZGF0ZVF1ZXVlWzBdO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuKHdvcmxkVXBkYXRlKTtcclxuXHR9XHJcblx0XHJcblx0Z2V0Q3JlYXRlUGF0aChqdW5jdGlvblN0YXJ0LGp1bmN0aW9uRW5kLHBhdGhJbmZvKVxyXG5cdHtcclxuXHRcdHZhciBjb25uZWN0b3JEaXNwbGF5T2JqZWN0ID0gdGhpcy5jYW52YXNIb2xkZXIuZ2V0Q29ubmVjdG9yRGlzcGxheShwYXRoSW5mby5wYXRoVHlwZUtleSk7XHJcblx0XHRcclxuXHRcdHZhciBwYXRoID0gbnVsbDtcclxuXHRcdHZhciBwYXRoS2V5ID0gdGhpcy5nZXRQYXRoS2V5KGp1bmN0aW9uU3RhcnQsanVuY3Rpb25FbmQpO1xyXG5cdFx0aWYoIXRoaXMucGF0aHMuaGFzT3duUHJvcGVydHkocGF0aEtleSkpXHJcblx0XHR7XHJcblx0XHRcdHZhciBwID0gdGhpcy5jYW52YXNIb2xkZXIuZ2V0Q29ubmVjdG9yKFwicGF0aFwiLHBhdGhLZXkpO1xyXG5cdFx0XHRwLnNldEp1bmN0aW9ucyhqdW5jdGlvblN0YXJ0LGp1bmN0aW9uRW5kKTtcclxuXHRcdFx0dGhpcy5wYXRoc1twYXRoS2V5XSA9IHA7XHJcblx0XHR9XHJcblx0XHR2YXIgcGF0aCA9IHRoaXMucGF0aHNbcGF0aEtleV07XHJcblx0XHRyZXR1cm4ocGF0aCk7XHJcblx0fVxyXG5cdFxyXG5cdGdldFdhbGtlckxpc3QoKVxyXG5cdHtcclxuXHRcdHZhciB3YWxrZXJMaXN0ID0gbmV3IEFycmF5KCk7XHJcblx0XHR2YXIgd2Fsa2VycyA9IHRoaXMud2Fsa2VycztcclxuXHRcdE9iamVjdC5rZXlzKHRoaXMud2Fsa2VycykuZm9yRWFjaChmdW5jdGlvbiAoa2V5KVxyXG5cdFx0e1xyXG5cdFx0XHR3YWxrZXJMaXN0LnB1c2god2Fsa2Vyc1trZXldKTtcclxuXHRcdH0pO1xyXG5cdFx0cmV0dXJuKHdhbGtlckxpc3QpO1xyXG5cdH1cclxuXHJcblx0Z2V0UGF0aExpc3QoKVxyXG5cdHtcclxuXHRcdHZhciBwYXRoTGlzdCA9IG5ldyBBcnJheSgpO1xyXG5cdFx0dmFyIHBhdGhzID0gdGhpcy5wYXRocztcclxuXHRcdE9iamVjdC5rZXlzKHRoaXMucGF0aHMpLmZvckVhY2goZnVuY3Rpb24gKGtleSlcclxuXHRcdHtcclxuXHRcdFx0cGF0aExpc3QucHVzaChwYXRoc1trZXldKTtcclxuXHRcdH0pO1xyXG5cdFx0cmV0dXJuKHBhdGhMaXN0KTtcclxuXHR9XHJcblxyXG5cdGdldEp1bmN0aW9uTGlzdCgpXHJcblx0e1xyXG5cdFx0dmFyIGp1bmN0aW9uTGlzdCA9IG5ldyBBcnJheSgpO1xyXG5cdFx0dmFyIGp1bmN0aW9ucyA9IHRoaXMuanVuY3Rpb25zO1xyXG5cdFx0T2JqZWN0LmtleXModGhpcy5qdW5jdGlvbnMpLmZvckVhY2goZnVuY3Rpb24gKGtleSlcclxuXHRcdHtcclxuXHRcdFx0anVuY3Rpb25MaXN0LnB1c2goanVuY3Rpb25zW2tleV0pO1xyXG5cdFx0fSk7XHJcblx0XHRyZXR1cm4oanVuY3Rpb25MaXN0KTtcclxuXHR9XHJcblx0XHJcblx0LypcclxuXHRnZXRKdW50aW9uR3JhcGhEYXRhKGp1bmN0aW9uSW5mbylcclxuXHR7XHJcblx0XHR2YXIganVuY3Rpb25HcmFwaERhdGEgPSB0aGlzLndvcmxkRGlzcGxheS5qdW5jdGlvblR5cGVzW1wiZ2VuZXJpY1wiXTtcclxuXHRcclxuXHRcdGlmKHRoaXMud29ybGREaXNwbGF5Lmp1bmN0aW9uVHlwZXMuaGFzT3duUHJvcGVydHkoanVuY3Rpb25JbmZvLmp1bmN0aW9uVHlwZUtleSkpXHJcblx0XHR7XHJcblx0XHRcdGp1bmN0aW9uR3JhcGhEYXRhID0gdGhpcy53b3JsZERpc3BsYXkuanVuY3Rpb25UeXBlc1tqdW5jdGlvbkluZm8uanVuY3Rpb25UeXBlS2V5XTtcclxuXHRcclxuXHRcdH1cclxuXHRcdHJldHVybihqdW5jdGlvbkdyYXBoRGF0YSk7XHJcblx0fVxyXG5cdCovXHJcblx0Z2V0Q3JlYXRlSnVuY3Rpb24obmFtZSxqdW5jdGlvbkluZm8pXHJcblx0e1xyXG5cdFx0Ly92YXIganVuY3Rpb25HcmFwaERhdGEgPSB0aGlzLmdldEp1bnRpb25HcmFwaERhdGEoanVuY3Rpb25JbmZvKTtcclxuXHRcdGlmKCF0aGlzLmp1bmN0aW9ucy5oYXNPd25Qcm9wZXJ0eShuYW1lKSlcclxuXHRcdHtcclxuXHRcdFx0Ly9jb25zb2xlLmxvZyhcIlBhdGhXb3JsZDpnZXRDcmVhdGVKdW5jdGlvbjp0eXBlPVwiK2p1bmN0aW9uSW5mby5qdW5jdGlvblR5cGVLZXkpO1xyXG5cclxuXHRcdFx0dmFyIHN0YXJ0UG9zaXRpb24gPSB0aGlzLmdldFN0YXJ0UG9zaXRpb25KdW5jdGlvbigpO1xyXG5cdFx0XHR0aGlzLmp1bmN0aW9uc1tuYW1lXSA9IG5ldyBKdW5jdGlvbihcclxuXHRcdFx0XHRuYW1lLFxyXG5cdFx0XHRcdG5ldyBQb3NpdGlvbihzdGFydFBvc2l0aW9uLmdldFgoKSxzdGFydFBvc2l0aW9uLmdldFkoKSksXHJcblx0XHRcdFx0dGhpcy5jYW52YXNIb2xkZXIsXHJcblx0XHRcdFx0bmV3IEFycmF5KCksXHJcblx0XHRcdFx0anVuY3Rpb25JbmZvLmp1bmN0aW9uVHlwZUtleSxcclxuXHRcdFx0XHRqdW5jdGlvbkluZm8sXHJcblx0XHRcdFx0dGhpcyk7XHJcblx0XHRcdHZhciBqID0gdGhpcy5qdW5jdGlvbnNbbmFtZV07XHJcblx0XHRcdC8vY29uc29sZS5sb2coXCJwYXRoV29ybGQgZ2V0Q3JlYXRlSnVuY3Rpb24gaW5uZXIgbmFtZTpcIitqLm5hbWUpXHRcclxuXHRcdFx0dGhpcy5hZGROb2RlKGopO1xyXG5cdFx0XHR0aGlzLndvcmxkV2FsbC5hZGROb2RlKGopO1xyXG5cdFx0XHR0aGlzLmp1bmN0aW9uU3BhY2VyLmFkZE5vZGUoaik7XHJcblx0XHR9XHJcblx0XHR2YXIganVuY3Rpb24gPSB0aGlzLmp1bmN0aW9uc1tuYW1lXTtcclxuXHRcclxuXHRcdHJldHVybihqdW5jdGlvbik7XHJcblx0fVxyXG5cdFxyXG5cdC8qXHJcblx0Z2V0V2Fsa2VyR3JhcGhEYXRhKHdhbGtlckluZm8pXHJcblx0e1xyXG5cdFx0dmFyIHdhbGtlckdyYXBoRGF0YSA9IHRoaXMud29ybGREaXNwbGF5LndhbGtlckRpc3BsYXlUeXBlc1tcImdlbmVyaWNcIl07XHJcblx0XHQvL2NvbnNvbGUubG9nKFwiZ2V0V2Fsa2VyR3JhcGhEYXRhOmxvb2tpbmcgdXA6XCIrQ29tbW9udG9TdHJpbmcod2Fsa2VySW5mbykpO1xyXG5cdFx0aWYodGhpcy53b3JsZERpc3BsYXkud2Fsa2VyRGlzcGxheVR5cGVzLmhhc093blByb3BlcnR5KHdhbGtlckluZm8ud2Fsa2VyVHlwZUtleSkpXHJcblx0XHR7XHJcblx0XHRcdC8vY29uc29sZS5sb2coXCIgICAgIGdldFdhbGtlckdyYXBoRGF0YTpmb3VuZDpcIitDb21tb250b1N0cmluZyh3YWxrZXJJbmZvLndhbGtlclR5cGVLZXkpKTtcclxuXHRcdFx0d2Fsa2VyR3JhcGhEYXRhID0gdGhpcy53b3JsZERpc3BsYXkud2Fsa2VyRGlzcGxheVR5cGVzW3dhbGtlckluZm8ud2Fsa2VyVHlwZUtleV07XHJcblx0XHR9XHJcblx0XHRyZXR1cm4od2Fsa2VyR3JhcGhEYXRhKTtcclxuXHR9XHJcblx0Ki9cclxuXHRnZXRDcmVhdGVXYWxrZXIod2Fsa2VyTmFtZSx3YWxrZXJJbmZvKVxyXG5cdHtcclxuXHRcdC8vdmFyIHdhbGtlckdyYXBoRGF0YSA9IHRoaXMuZ2V0V2Fsa2VyR3JhcGhEYXRhKHdhbGtlckluZm8pO1xyXG5cdFx0XHJcblx0XHRpZighdGhpcy53YWxrZXJzLmhhc093blByb3BlcnR5KHdhbGtlck5hbWUpKVxyXG5cdFx0e1xyXG5cdFx0XHQvL2NvbnNvbGUubG9nKFwiUGF0aFdvcmxkOmdldENyZWF0ZVdhbGtlcjp0eXBlPVwiK3dhbGtlckluZm8ud2Fsa2VyVHlwZUtleSk7XHJcblxyXG5cdFx0XHR2YXIgc3RhcnRQb3NpdGlvbiA9IHRoaXMuZ2V0U3RhcnRQb3NpdGlvbldhbGtlcigpO1xyXG5cdFx0XHR0aGlzLndhbGtlcnNbd2Fsa2VyTmFtZV0gPSBuZXcgV2Fsa2VyKFxyXG5cdFx0XHRcdFx0d2Fsa2VyTmFtZSxcclxuXHRcdFx0XHRcdG5ldyBQb3NpdGlvbihzdGFydFBvc2l0aW9uLmdldFgoKSxzdGFydFBvc2l0aW9uLmdldFkoKSksXHJcblx0XHRcdFx0XHR0aGlzLmNhbnZhc0hvbGRlcixcclxuXHRcdFx0XHRcdG5ldyBBcnJheSgpLFxyXG5cdFx0XHRcdFx0d2Fsa2VySW5mby53YWxrZXJUeXBlS2V5LFxyXG5cdFx0XHRcdFx0d2Fsa2VySW5mbyk7XHJcblx0XHRcdHZhciB3ID0gdGhpcy53YWxrZXJzW3dhbGtlck5hbWVdO1xyXG5cdFx0XHR0aGlzLmFkZE5vZGUodyk7XHJcblx0XHRcdHRoaXMud29ybGRXYWxsLmFkZE5vZGUodyk7XHJcblx0XHRcdC8vdGhpcy5qdW5jdGlvblNwYWNlci5hZGROb2RlKGopO1xyXG5cdFx0fVxyXG5cdFx0dmFyIHdhbGtlciA9IHRoaXMud2Fsa2Vyc1t3YWxrZXJOYW1lXTsgXHJcblx0XHRyZXR1cm4od2Fsa2VyKTtcclxuXHR9XHJcblx0XHJcblx0cmVtb3ZlV2Fsa2VyKHdhbGtlcilcclxuXHR7XHJcblx0XHQvL2NvbnNvbGUubG9nKFwiUGF0aFdvcmxkLnJlbW92ZVdhbGtlcjpcIit3YWxrZXIubmFtZStcIiBhdCBcIit3YWxrZXIuZ2V0Q3VycmVudEp1bmN0aW9uKCkubmFtZSk7XHJcblx0XHRpZih3YWxrZXIuZ2V0Q3VycmVudEp1bmN0aW9uKCkpXHR3YWxrZXIuZ2V0Q3VycmVudEp1bmN0aW9uKCkucmVtb3ZlV2Fsa2VyKHdhbGtlcik7XHJcblx0XHR0aGlzLnJlbW92ZU5vZGUod2Fsa2VyKTtcclxuXHRcdHRoaXMud29ybGRXYWxsLnJlbW92ZU5vZGUod2Fsa2VyKTtcclxuXHRcdGRlbGV0ZSB0aGlzLndhbGtlcnNbd2Fsa2VyLm5hbWVdO1xyXG5cdH1cclxuXHRcclxuXHRnZXRUZWxlcG9ydFBhdGgoc3RhcnRKdW5jdGlvbixlbmRKdW5jdGlvbilcclxuXHR7XHJcblx0XHR2YXIgc3RhcnRKdW5jdGlvbk5hbWUgPSBcIlwiO1xyXG5cdFx0dmFyIGVuZEp1bmN0aW9uTmFtZSA9IFwiXCI7XHJcblx0XHRpZihzdGFydEp1bmN0aW9uIT1udWxsKSBzdGFydEp1bmN0aW9uTmFtZSA9IHN0YXJ0SnVuY3Rpb24ubmFtZTtcclxuXHRcdGlmKGVuZEp1bmN0aW9uIT1udWxsKSBlbmRKdW5jdGlvbk5hbWUgPSBlbmRKdW5jdGlvbi5uYW1lO1xyXG5cdFx0dmFyIHRlbGVwb3J0UGF0aFJldHVybiA9IG51bGw7XHJcblx0XHRmb3IodmFyIGk9MDtpPHRoaXMud29ybGREaXNwbGF5LnRlbGVwb3J0UGF0aHMubGVuZ3RoO2krKylcclxuXHRcdHtcclxuXHRcdFx0dmFyIHRlbGVwb3J0UGF0aCA9IHRoaXMud29ybGREaXNwbGF5LnRlbGVwb3J0UGF0aHNbaV07XHJcblx0XHRcdHZhciBzdGFydEp1bmN0aW9uUmVnRXhwID0gbmV3IFJlZ0V4cCh0ZWxlcG9ydFBhdGguc3RhcnRKdW5jdGlvbik7XHJcblx0XHRcdHZhciBlbmRKdW5jdGlvblJlZ0V4cCA9IG5ldyBSZWdFeHAodGVsZXBvcnRQYXRoLmVuZEp1bmN0aW9uKTtcclxuXHRcdFx0aWYoXHJcblx0XHRcdFx0XHRzdGFydEp1bmN0aW9uUmVnRXhwLnRlc3Qoc3RhcnRKdW5jdGlvbk5hbWUpICYmXHJcblx0XHRcdFx0XHRlbmRKdW5jdGlvblJlZ0V4cC50ZXN0KGVuZEp1bmN0aW9uTmFtZSkgJiZcclxuXHRcdFx0XHRcdHN0YXJ0SnVuY3Rpb25OYW1lIT1lbmRKdW5jdGlvbk5hbWUpXHJcblx0XHRcdHtcclxuXHRcdFx0XHR0ZWxlcG9ydFBhdGhSZXR1cm4gPSB0ZWxlcG9ydFBhdGg7XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdHJldHVybih0ZWxlcG9ydFBhdGhSZXR1cm4pO1xyXG5cdH1cclxuXHRcclxuXHRnZXRFbmRQb2ludE1vZChzdGFydEp1bmN0aW9uLGVuZEp1bmN0aW9uKVxyXG5cdHtcclxuXHRcdHZhciBzdGFydEp1bmN0aW9uTmFtZSA9IFwiXCI7XHJcblx0XHR2YXIgZW5kSnVuY3Rpb25OYW1lID0gXCJcIjtcclxuXHRcdGlmKHN0YXJ0SnVuY3Rpb24hPW51bGwpIHN0YXJ0SnVuY3Rpb25OYW1lID0gc3RhcnRKdW5jdGlvbi5uYW1lO1xyXG5cdFx0aWYoZW5kSnVuY3Rpb24hPW51bGwpIGVuZEp1bmN0aW9uTmFtZSA9IGVuZEp1bmN0aW9uLm5hbWU7XHJcblx0XHR2YXIgZW5kUG9pbnRSZXR1cm4gPSBudWxsO1xyXG5cdFx0Zm9yKHZhciBpPTA7aTx0aGlzLndvcmxkRGlzcGxheS5lbmRQb2ludE1vZHMubGVuZ3RoO2krKylcclxuXHRcdHtcclxuXHRcdFx0dmFyIGVuZFBvaW50ID0gdGhpcy53b3JsZERpc3BsYXkuZW5kUG9pbnRNb2RzW2ldO1xyXG5cdFx0XHR2YXIgc3RhcnRKdW5jdGlvblJlZ0V4cCA9IG5ldyBSZWdFeHAoZW5kUG9pbnQuc3RhcnRKdW5jdGlvbik7XHJcblx0XHRcdHZhciBlbmRKdW5jdGlvblJlZ0V4cCA9IG5ldyBSZWdFeHAoZW5kUG9pbnQuZW5kSnVuY3Rpb24pO1xyXG5cdFx0XHRpZihcclxuXHRcdFx0XHRcdHN0YXJ0SnVuY3Rpb25SZWdFeHAudGVzdChzdGFydEp1bmN0aW9uTmFtZSkgJiZcclxuXHRcdFx0XHRcdGVuZEp1bmN0aW9uUmVnRXhwLnRlc3QoZW5kSnVuY3Rpb25OYW1lKSAmJlxyXG5cdFx0XHRcdFx0c3RhcnRKdW5jdGlvbk5hbWUhPWVuZEp1bmN0aW9uTmFtZSlcclxuXHRcdFx0e1xyXG5cdFx0XHRcdGVuZFBvaW50UmV0dXJuID0gZW5kUG9pbnQ7XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdHJldHVybihlbmRQb2ludFJldHVybik7XHJcblx0fVxyXG5cdFxyXG5cdHByb2Nlc3NXb3JsZFVwZGF0ZVF1ZXVlKClcclxuXHR7XHJcblx0XHR2YXIgd29ybGRVcGRhdGUgPSB0aGlzLmdldE5leHRGcm9tV29ybGRVcGRhdGUoKTtcclxuXHRcdGlmKHdvcmxkVXBkYXRlIT1udWxsKSB3b3JsZFVwZGF0ZSA9IHRoaXMucHJvY2Vzc1dvcmxkVXBkYXRlKHdvcmxkVXBkYXRlKTtcclxuXHRcdHJldHVybih3b3JsZFVwZGF0ZSk7XHJcblx0fVxyXG5cdFxyXG5cdHByb2Nlc3NXb3JsZFVwZGF0ZSh3b3JsZFVwZGF0ZSlcclxuXHR7XHJcblx0XHQvL2NvbnNvbGUubG9nKFwicHJvY2Vzc1dvcmxkVXBkYXRlUXVldWU6d29ybGRVcGRhdGU9XCIrQ29tbW9udG9TdHJpbmcod29ybGRVcGRhdGUpKTtcdFx0XHJcblx0XHR2YXIgaXNXYWxrZXJOZXcgPSB0aGlzLmlzV2Fsa2VyTmV3KHdvcmxkVXBkYXRlLndhbGtlck5hbWUpO1xyXG5cdFx0dmFyIGlzSnVuY3Rpb25OZXcgPSB0aGlzLmlzSnVuY3Rpb25OZXcod29ybGRVcGRhdGUuanVuY3Rpb25OYW1lKTtcclxuXHRcdHZhciB3YWxrZXIgPSB0aGlzLmdldENyZWF0ZVdhbGtlcih3b3JsZFVwZGF0ZS53YWxrZXJOYW1lLHdvcmxkVXBkYXRlLndhbGtlckluZm8pO1xyXG5cdFx0dmFyIGp1bmN0aW9uID0gdGhpcy5nZXRDcmVhdGVKdW5jdGlvbih3b3JsZFVwZGF0ZS5qdW5jdGlvbk5hbWUsd29ybGRVcGRhdGUuanVuY3Rpb25JbmZvKTtcdFx0XHJcblx0XHR2YXIgY3VycmVudEp1bmN0aW9uID0gd2Fsa2VyLmdldEN1cnJlbnRKdW5jdGlvbigpO1x0XHJcblx0XHRcclxuXHRcdHZhciBlbmRQb2ludE1vZCA9IHRoaXMuZ2V0RW5kUG9pbnRNb2QoY3VycmVudEp1bmN0aW9uLGp1bmN0aW9uKTtcdFx0XHJcblx0XHRpZihlbmRQb2ludE1vZCE9bnVsbClcclxuXHRcdHtcclxuXHRcdFx0Y29uc29sZS5sb2coXCJCZWZvcmUgZ2V0RW5kUG9pbnRNb2QhIG5hbWU9XCIrZW5kUG9pbnRNb2QuZW5kUG9pbnRNb2ROYW1lK1wiIHN0YXJ0PVwiK2N1cnJlbnRKdW5jdGlvbi5uYW1lK1xyXG5cdFx0XHRcdFx0XCIgZW5kPVwiK2p1bmN0aW9uLm5hbWUrXCIgd2Fsa2VyTmFtZTpcIit3b3JsZFVwZGF0ZS53YWxrZXJOYW1lK1xyXG5cdFx0XHRcdFx0XCIgd29ybGRVcGRhdGU9XCIrQ29tbW9udG9TdHJpbmcod29ybGRVcGRhdGUpKTtcclxuXHRcdFx0XHJcblx0XHRcdFxyXG5cdFx0XHRpc0p1bmN0aW9uTmV3ID0gdGhpcy5pc0p1bmN0aW9uTmV3KGVuZFBvaW50TW9kLmVuZFBvaW50TW9kTmFtZSk7XHJcblx0XHRcdHdvcmxkVXBkYXRlLmp1bmN0aW9uSW5mby5qdW5jdGlvbk5hbWUgPSBlbmRQb2ludE1vZC5lbmRQb2ludE1vZE5hbWU7XHJcblx0XHRcdHdvcmxkVXBkYXRlLmp1bmN0aW9uTmFtZSA9IGVuZFBvaW50TW9kLmVuZFBvaW50TW9kTmFtZTtcclxuXHRcdFx0anVuY3Rpb24gPSB0aGlzLmdldENyZWF0ZUp1bmN0aW9uKGVuZFBvaW50TW9kLmVuZFBvaW50TW9kTmFtZSx3b3JsZFVwZGF0ZS5qdW5jdGlvbkluZm8pO1xyXG5cdFx0XHRjb25zb2xlLmxvZyhcIi4uLmFmdGVyIGdldEVuZFBvaW50TW9kISBuYW1lPVwiK2VuZFBvaW50TW9kLmVuZFBvaW50TW9kTmFtZStcIiBzdGFydD1cIitjdXJyZW50SnVuY3Rpb24ubmFtZStcclxuXHRcdFx0XHRcdFwiIGVuZD1cIitqdW5jdGlvbi5uYW1lK1wiIHdhbGtlck5hbWU6XCIrd29ybGRVcGRhdGUud2Fsa2VyTmFtZStcclxuXHRcdFx0XHRcdFwiIHdvcmxkVXBkYXRlPVwiK0NvbW1vbnRvU3RyaW5nKHdvcmxkVXBkYXRlKSk7XHJcblx0XHRcdC8vd2Fsa2VyLnNldEN1cnJlbnRKdW5jdGlvbihjdXJyZW50SnVuY3Rpb24pO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHR2YXIgdGVsZXBvcnRQYXRoID0gdGhpcy5nZXRUZWxlcG9ydFBhdGgoY3VycmVudEp1bmN0aW9uLGp1bmN0aW9uKTtcclxuXHRcdGlmKHRlbGVwb3J0UGF0aCE9bnVsbClcclxuXHRcdHtcdHZhciBjam5hbWUgPSBcIm51bGxcIjtcclxuXHRcdFx0aWYoY3VycmVudEp1bmN0aW9uIT1udWxsKSBjam5hbWUgPSBjdXJyZW50SnVuY3Rpb24ubmFtZTsgXHJcblx0XHRcdC8vY29uc29sZS5sb2coXCJUZWxlcG9ydCBQYXRoISBuYW1lPVwiK3RlbGVwb3J0UGF0aC50ZWxlcG9ydE5hbWUrXCIgc3RhcnQ9XCIrY2puYW1lK1wiIGVuZD1cIitqdW5jdGlvbi5uYW1lKTtcclxuXHRcdFx0XHJcblx0XHRcdGN1cnJlbnRKdW5jdGlvbiA9IHRoaXMuZ2V0Q3JlYXRlSnVuY3Rpb24odGVsZXBvcnRQYXRoLnRlbGVwb3J0TmFtZSxcclxuXHRcdFx0XHRcdHtqdW5jdGlvbk5hbWU6dGVsZXBvcnRQYXRoLnRlbGVwb3J0TmFtZSxqdW5jdGlvblR5cGVLZXk6XCJnZW5lcmljSnVuY3Rpb25cIn0pO1xyXG5cdFx0XHQvL2NvbnNvbGUubG9nKFwiLi4uYWZ0ZXIgVGVsZXBvcnQgUGF0aCEgbmFtZT1cIit0ZWxlcG9ydFBhdGgudGVsZXBvcnROYW1lK1wiIHN0YXJ0PVwiK2N1cnJlbnRKdW5jdGlvbi5uYW1lK1wiIGVuZD1cIitqdW5jdGlvbi5uYW1lKTtcclxuXHRcdFx0d2Fsa2VyLnNldEN1cnJlbnRKdW5jdGlvbihjdXJyZW50SnVuY3Rpb24pO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRpZihjdXJyZW50SnVuY3Rpb24hPW51bGwpXHJcblx0XHR7XHJcblx0XHRcdHRoaXMuZ2V0Q3JlYXRlUGF0aChjdXJyZW50SnVuY3Rpb24sanVuY3Rpb24sd29ybGRVcGRhdGUucGF0aEluZm8pO1xyXG5cdFx0XHQvL3dhbGtlci5zZXRDdXJyZW50SnVuY3Rpb24oanVuY3Rpb24pO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHR3YWxrZXIuc2V0Q3VycmVudEp1bmN0aW9uKGp1bmN0aW9uKTtcclxuXHRcdHdhbGtlci5sYXN0VXBkYXRlVGltZVN0YW1wID0gdGhpcy5jaGVja1RpbWVzdGFtcDtcclxuXHRcdGlmKGlzSnVuY3Rpb25OZXcpXHJcblx0XHR7XHJcblx0XHRcdGlmKHRoaXMuanVuY3Rpb25zLmxlbmd0aD09MClcclxuXHRcdFx0e1xyXG5cdFx0XHRcdHRoaXMuanVuY3Rpb24ucG9zaXRpb24uc2V0WCgwKTtcclxuXHRcdFx0XHR0aGlzLmp1bmN0aW9uLnBvc2l0aW9uLnNldFkoMCk7XHJcblx0XHRcdH1cclxuXHRcdFx0ZWxzZSBpZihjdXJyZW50SnVuY3Rpb249PW51bGwpXHJcblx0XHRcdHtcclxuXHRcdFx0XHRqdW5jdGlvbi5wb3NpdGlvbi5zZXRYKHRoaXMud29ybGREaXNwbGF5LnJlbGF4ZWREaXN0YW5jZURlZmF1bHQpO1xyXG5cdFx0XHRcdGp1bmN0aW9uLnBvc2l0aW9uLnNldFkodGhpcy53b3JsZERpc3BsYXkucmVsYXhlZERpc3RhbmNlRGVmYXVsdCk7XHJcblx0XHRcdH1cclxuXHRcdFx0ZWxzZVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0anVuY3Rpb24ucG9zaXRpb24uc2V0WCggY3VycmVudEp1bmN0aW9uLnBvc2l0aW9uLmdldFgoKSt0aGlzLndvcmxkRGlzcGxheS5qdW5jdGlvblJhZGl1c0RlZmF1bHQqKE1hdGgucmFuZG9tKCkpICk7XHJcblx0XHRcdFx0anVuY3Rpb24ucG9zaXRpb24uc2V0WSggY3VycmVudEp1bmN0aW9uLnBvc2l0aW9uLmdldFkoKSt0aGlzLndvcmxkRGlzcGxheS5qdW5jdGlvblJhZGl1c0RlZmF1bHQqKE1hdGgucmFuZG9tKCkpICk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdGlmKGlzV2Fsa2VyTmV3KVxyXG5cdFx0e1xyXG5cdFx0XHR3YWxrZXIucG9zaXRpb24uc2V0WCgganVuY3Rpb24ucG9zaXRpb24uZ2V0WCgpICk7XHJcblx0XHRcdHdhbGtlci5wb3NpdGlvbi5zZXRZKCBqdW5jdGlvbi5wb3NpdGlvbi5nZXRZKCkgKTtcclxuXHRcdH1cclxuXHRcdHRoaXMud29ybGRVcGRhdGVRdWV1ZVByb2Nlc3NlZC5wdXNoKHdvcmxkVXBkYXRlKTtcclxuXHRcdHJldHVybih3b3JsZFVwZGF0ZSk7XHJcblx0fVxyXG5cdFxyXG5cdFxyXG5cdFxyXG5cdGFkZFRvV29ybGRVcGRhdGVRdWV1ZSh3b3JsZFVwZGF0ZSlcclxuXHR7XHJcblx0XHR0aGlzLndvcmxkVXBkYXRlUXVldWUuaXNJbk5lZWRPZlNvcnRpbmcgPSB0cnVlO1xyXG5cdFx0dGhpcy53b3JsZFVwZGF0ZVF1ZXVlLnB1c2god29ybGRVcGRhdGUpO1xyXG5cdH1cdFxyXG5cdFxyXG5cdHByZXBhcmVXb3JsZFVwZGF0ZVF1ZXVlKClcclxuXHR7XHJcblx0XHQvL2NvbnNvbGUubG9nKFwicHJlcGFyZVdvcmxkVXBkYXRlUXVldWU6aXNJbk5lZWRPZlNvcnRpbmc9XCIrdGhpcy53b3JsZFVwZGF0ZVF1ZXVlLmlzSW5OZWVkT2ZTb3J0aW5nKTtcclxuXHRcdGlmKHRoaXMud29ybGRVcGRhdGVRdWV1ZS5pc0luTmVlZE9mU29ydGluZylcclxuXHRcdHtcclxuXHRcdFx0dGhpcy53b3JsZFVwZGF0ZVF1ZXVlLnNvcnQoXHJcblx0XHRcdFx0ZnVuY3Rpb24oYSwgYilcclxuXHRcdFx0XHR7XHJcblx0XHRcdFx0XHRyZXR1cm4oYS5wcm9jZXNzVGltZXN0YW1wLWIucHJvY2Vzc1RpbWVzdGFtcCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdCk7XHJcblx0XHRcdHRoaXMud29ybGRVcGRhdGVRdWV1ZS5pc0luTmVlZE9mU29ydGluZyA9IGZhbHNlO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHRnZXROZXh0RnJvbVdvcmxkVXBkYXRlKHdvcmxkVXBkYXRlKVxyXG5cdHtcclxuXHRcdHZhciB3b3JsZFVwZGF0ZSA9IG51bGw7XHJcblx0XHRpZih0aGlzLndvcmxkVXBkYXRlUXVldWUubGVuZ3RoPjApXHJcblx0XHR7XHJcblx0XHRcdHdvcmxkVXBkYXRlID0gdGhpcy53b3JsZFVwZGF0ZVF1ZXVlWzBdO1xyXG5cdFx0XHR0aGlzLndvcmxkVXBkYXRlUXVldWUuc2hpZnQoKTtcclxuXHRcdH1cclxuXHRcdHJldHVybih3b3JsZFVwZGF0ZSk7XHJcblx0fVxyXG5cdFxyXG5cdGdldFdhbGtlcktleSh3YWxrZXIpXHJcblx0e1xyXG5cdFx0cmV0dXJuKHdhbGtlci5uYW1lKTtcclxuXHR9XHJcblx0XHJcblx0Z2V0SnVuY3Rpb25LZXkoanVuY3Rpb24pXHJcblx0e1xyXG5cdFx0cmV0dXJuKGp1bmN0aW9uLmdldE5vZGVLZXkoKSk7XHJcblx0fVxyXG5cdFxyXG5cdGdldFBhdGhLZXkoanVuY3Rpb25TdGFydCxqdW5jdGlvbkVuZClcclxuXHR7XHJcblx0XHRyZXR1cm4odGhpcy5nZXRKdW5jdGlvbktleShqdW5jdGlvblN0YXJ0KStcIiNcIit0aGlzLmdldEp1bmN0aW9uS2V5KGp1bmN0aW9uRW5kKSk7XHJcblx0fVxyXG5cdFxyXG5cdGdldFN0YXJ0UG9zaXRpb25XYWxrZXIoKVxyXG5cdHtcclxuXHRcdHJldHVybihuZXcgUG9zaXRpb24odGhpcy5jYW52YXNIb2xkZXIuZ2V0V2lkdGgoKS8yLHRoaXMuY2FudmFzSG9sZGVyLmdldEhlaWdodCgpLzIpKTtcclxuXHR9XHJcblx0XHJcblx0Z2V0U3RhcnRQb3NpdGlvbkp1bmN0aW9uKClcclxuXHR7XHJcblx0XHRyZXR1cm4obmV3IFBvc2l0aW9uKHRoaXMuY2FudmFzSG9sZGVyLmdldFdpZHRoKCkvMix0aGlzLmNhbnZhc0hvbGRlci5nZXRIZWlnaHQoKS8yKSk7XHJcblx0fVxyXG5cclxufVxyXG4vLzxqczJub2RlPlxyXG5tb2R1bGUuZXhwb3J0cyA9IFBhdGhXb3JsZDtcclxuY29uc29sZS5sb2coXCJMb2FkaW5nOlBhdGhXb3JsZFwiKTtcclxuLy88L2pzMm5vZGU+XHJcbiIsInZhciBDYW52YXNEZWYgPSByZXF1aXJlKCcuLi9ub2Rlcy9ub2RlY2FudmFzL2NhbnZhc2RlZicpO1xyXG5cclxuXHJcbmNsYXNzIFBhdGhXb3JsZERlZiBleHRlbmRzIENhbnZhc0RlZlxyXG57XHJcblx0Y29uc3RydWN0b3IoKVxyXG5cdHtcdFx0XHJcblx0XHRzdXBlcigpO1xyXG5cdH1cclxuXHRcclxuXHRnZXRQYXRoUGFydHMoKVxyXG5cdHtcclxuXHRcdHRocm93IFwiUGF0aFdvcmxkRGVmLmdldFBhdGhQYXJ0cyBub3QgZGVmaW5lZFwiO1xyXG5cdH1cclxuXHRcclxuXHRnZXRQYXRoRGVmKClcclxuXHR7XHJcblx0XHR0aHJvdyBcIlBhdGhXb3JsZERlZi5nZXRQYXRoRGVmIG5vdCBkZWZpbmVkXCI7XHJcblx0fVxyXG5cdFxyXG5cdGdldFdhbGtlckp1bmN0aW9uUnVsZXMoKVxyXG5cdHtcclxuXHRcdHRocm93IFwiUGF0aFdvcmxkRGVmLmdldFdhbGtlckp1bmN0aW9uUnVsZXMgbm90IGRlZmluZWRcIjtcclxuXHR9XHJcbn1cclxuXHJcbi8vPGpzMm5vZGU+XHJcbm1vZHVsZS5leHBvcnRzID0gUGF0aFdvcmxkRGVmO1xyXG5jb25zb2xlLmxvZyhcIkxvYWRpbmc6UGF0aFdvcmxkRGVmXCIpO1xyXG4vLzwvanMybm9kZT5cclxuIiwidmFyIE5vZGUgPSByZXF1aXJlKCcuLi9ub2Rlcy9ub2RlJyk7XHJcbnZhciBDb21tb24gPSByZXF1aXJlKCcuLi9jb21tb24vY29tbW9uJyk7XHJcblxyXG5jbGFzcyBXYWxrZXIgZXh0ZW5kcyBOb2RlXHJcbntcclxuXHRjb25zdHJ1Y3RvcihuYW1lLHBvc2l0aW9uLGNhbnZhc0hvbGRlcixzaGFwZUxpc3QsZ3JhcGhEYXRhS2V5LGluZm9EYXRhKVxyXG5cdHtcclxuXHRcdHN1cGVyKG5hbWUscG9zaXRpb24sY2FudmFzSG9sZGVyLGdyYXBoRGF0YUtleSxpbmZvRGF0YSk7XHJcblx0XHRXYWxrZXIuaW5pdFdhbGtlcih0aGlzLG5hbWUscG9zaXRpb24sc2hhcGVMaXN0LGdyYXBoRGF0YUtleSxpbmZvRGF0YSk7XHJcblx0fVxyXG5cdFxyXG5cdHN0YXRpYyBpbml0V2Fsa2VyKHdhbGtlcixuYW1lLHBvc2l0aW9uLHNoYXBlTGlzdCxncmFwaERhdGFLZXksaW5mb0RhdGEpXHJcblx0e1xyXG5cdFx0d2Fsa2VyLmp1bmN0aW9uQXJyYXkgPSBuZXcgQXJyYXkoKTtcclxuXHRcdHdhbGtlci5sYXllcj0yO1xyXG5cdFx0aWYoIXdhbGtlci5ncmFwaERhdGEud2Fsa2VySnVuY3Rpb25SdWxlcykgd2Fsa2VyLmdyYXBoRGF0YS53YWxrZXJKdW5jdGlvblJ1bGVzID0gbmV3IE9iamVjdCgpO1xyXG5cdFx0aWYoIXdhbGtlci5ncmFwaERhdGEud2Fsa2VySnVuY3Rpb25SdWxlcy5qdW5jdGlvbkV4aXRzKVxyXG5cdFx0XHR3YWxrZXIuZ3JhcGhEYXRhLndhbGtlckp1bmN0aW9uUnVsZXMuanVuY3Rpb25FeGl0cyA9IG5ldyBBcnJheSgpO1xyXG5cdH1cclxuXHRcclxuXHRnZXRDbGllbnRKc29uKClcclxuXHR7XHJcblx0XHR2YXIganNvbiA9IHN1cGVyLmdldENsaWVudEpzb24oKTtcclxuXHRcdGpzb24ucGF0aFdvcmxkVHllID0gXCJ3YWxrZXJcIjtcclxuXHRcdGpzb24uY3VycmVudEp1bmN0aW9uID0gdGhpcy5nZXRDdXJyZW50SnVuY3Rpb24oKS5nZXROb2RlS2V5KCk7XHJcblx0XHRyZXR1cm4oanNvbik7XHJcblx0fVxyXG5cclxuXHRcclxuXHRnZXROb2RlVWlEaXNwbGF5KG5vZGUpXHJcblx0e1xyXG5cdFx0dmFyIHZhbHVlID0gdGhpcy5uYW1lO1xyXG5cdFxyXG5cdFx0dmFsdWUgKz0gXCI8bGk+dHlwZTpcIit0aGlzLmluZm9EYXRhLndhbGtlclR5cGVLZXkrXCI8L2xpPlwiO1xyXG5cdFx0dmFsdWUgKz0gXCI8bGk+Y3VycmVudEo6XCIrdGhpcy5nZXRDdXJyZW50SnVuY3Rpb24oKS5uYW1lK1wiPC9saT5cIjtcclxuXHRcdFxyXG5cdFx0Zm9yKHZhciBpPTA7aTx0aGlzLmdyYXBoRGF0YS53YWxrZXJKdW5jdGlvblJ1bGVzLmp1bmN0aW9uRXhpdHMubGVuZ3RoO2krKylcclxuXHRcdHtcclxuXHRcdFx0dmFyIGV4aXQgPSB0aGlzLmdyYXBoRGF0YS53YWxrZXJKdW5jdGlvblJ1bGVzLmp1bmN0aW9uRXhpdHNbaV07XHJcblx0XHJcblx0XHRcdHZhciB0aW1lVG9SZW1vdmUgPSAoXHJcblx0XHRcdFx0XHQodGhpcy5sYXN0VXBkYXRlVGltZVN0YW1wK2V4aXQuZXhpdEFmdGVyTWlsaVNlY29uZHMpXHJcblx0XHRcdFx0XHQ8XHJcblx0XHRcdFx0XHR3b3JsZC5jaGVja1RpbWVzdGFtcCk7XHJcblx0XHJcblx0XHRcdHZhbHVlICs9IFwiPGxpPmV4aXRKdW5jdGlvbjppPVwiK2krXCIgXCIrZXhpdC5leGl0SnVuY3Rpb24rXHJcblx0XHRcdFx0XCIgYXQgZXhpdDpcIisoZXhpdC5leGl0SnVuY3Rpb249PXRoaXMuZ2V0Q3VycmVudEp1bmN0aW9uKCkubmFtZSkrXHJcblx0XHRcdFx0XCIgdGltZVRvUmVtb3ZlOlwiK3RpbWVUb1JlbW92ZStcclxuXHRcdFx0XHRcIjwvbGk+XCI7XHJcblx0XHR9XHJcblx0XHQvLy8vLy8vLy8vLy8vL3ZhbHVlICs9IFwiPGxpPnJlbW92ZSBhdDpcIisodGhpcy5sYXN0VXBkYXRlVGltZVN0YW1wK2V4aXQuZXhpdEFmdGVyTWlsaVNlY29uZHMpK1wiPC9saT5cIjtcclxuXHRcdC8vdmFsdWUgKz0gXCI8bGk+Y2hlY2tUaW1lOlwiK3dvcmxkLmNoZWNrVGltZXN0YW1wK1wiPC9saT5cIjtcclxuXHRcdC8vLy8vLy8vL3ZhbHVlICs9IFwiPGxpPmRpZmY6XCIrKHdvcmxkLmNoZWNrVGltZXN0YW1wLSh0aGlzLmxhc3RVcGRhdGVUaW1lU3RhbXArZXhpdC5leGl0QWZ0ZXJNaWxpU2Vjb25kcykpK1wiPC9saT5cIjtcclxuXHRcdHJldHVybih2YWx1ZSk7XHJcblx0fVxyXG5cdFxyXG5cdFxyXG5cdHByb2Nlc3NXYWxrZXJSdWxlcyh3b3JsZClcclxuXHR7XHJcblx0XHQvL2NvbnNvbGUubG9nKFwidzpcIit0aGlzLm5hbWUrXCIgY3VycmVudEp1bmN0aW9uPVwiK3RoaXMuZ2V0Q3VycmVudEp1bmN0aW9uKCkubmFtZSk7XHJcblx0XHRcclxuXHRcdGZvcih2YXIgaT0wO2k8dGhpcy5ncmFwaERhdGEud2Fsa2VySnVuY3Rpb25SdWxlcy5qdW5jdGlvbkV4aXRzLmxlbmd0aDtpKyspXHJcblx0XHR7XHJcblx0XHRcdHZhciBleGl0ID0gdGhpcy5ncmFwaERhdGEud2Fsa2VySnVuY3Rpb25SdWxlcy5qdW5jdGlvbkV4aXRzW2ldO1xyXG5cdFx0XHRpZihleGl0LmV4aXRKdW5jdGlvbj09dGhpcy5nZXRDdXJyZW50SnVuY3Rpb24oKS5uYW1lKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0dmFyIHRpbWVUb1JlbW92ZSA9IChcclxuXHRcdFx0XHRcdFx0KHRoaXMubGFzdFVwZGF0ZVRpbWVTdGFtcCtleGl0LmV4aXRBZnRlck1pbGlTZWNvbmRzKVxyXG5cdFx0XHRcdFx0XHQ8XHJcblx0XHRcdFx0XHRcdHdvcmxkLmNoZWNrVGltZXN0YW1wKTtcclxuXHRcdFx0XHRcclxuXHRcdFxyXG5cdFx0XHRcdGlmKHRpbWVUb1JlbW92ZSlcclxuXHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdGNvbnNvbGUubG9nKFwiVElNRSBUTyBFWElUIHc6XCIrdGhpcy5uYW1lK1xyXG5cdFx0XHRcdFx0XHRcdFwiIGN1cnJlbnRKdW5jdGlvbj1cIit0aGlzLmdldEN1cnJlbnRKdW5jdGlvbigpLm5hbWUrXHJcblx0XHRcdFx0XHRcdFx0XCIgZXhpdDpcIitleGl0LmV4aXRKdW5jdGlvbitcclxuXHRcdFx0XHRcdFx0XHRcIiB0eXBlOlwiK0NvbW1vbnRvU3RyaW5nKHRoaXMuaW5mb0RhdGEud2Fsa2VyVHlwZUtleSkrXHJcblx0XHRcdFx0XHRcdFx0XCIgaW5mb0RhdGE6XCIrQ29tbW9udG9TdHJpbmcodGhpcy5pbmZvRGF0YSkpO1xyXG5cdFx0XHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0d29ybGQucmVtb3ZlV2Fsa2VyKHRoaXMpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0Ly9jb25zb2xlLmxvZyhcInc6XCIrdGhpcy5uYW1lK1wiIGp1bmN0aW9uOlwiK3RoaXMuZ2V0Q3VycmVudEp1bmN0aW9uKCkpO1xyXG5cdH1cclxuXHRcclxuXHRzZXRDdXJyZW50SnVuY3Rpb24oanVuY3Rpb24pXHJcblx0e1xyXG5cdFx0aWYodGhpcy5nZXRDdXJyZW50SnVuY3Rpb24oKSE9bnVsbClcclxuXHRcdHtcclxuXHRcdFx0Ly9jb25zb2xlLmxvZyhcImdldEN1cnJlbnRKdW5jdGlvbigpLnJlbW92ZVdhbGtlciBcIik7XHJcblx0XHRcdHRoaXMuZ2V0Q3VycmVudEp1bmN0aW9uKCkucmVtb3ZlV2Fsa2VyKHRoaXMpO1xyXG5cdFx0fVxyXG5cdFx0dGhpcy5qdW5jdGlvbkFycmF5LnB1c2goanVuY3Rpb24pO1xyXG5cdFx0anVuY3Rpb24uYWRkV2Fsa2VyKHRoaXMpO1xyXG5cdH1cclxuXHRcclxuXHRnZXRDdXJyZW50SnVuY3Rpb24oKVxyXG5cdHtcclxuXHRcdGlmKHRoaXMuanVuY3Rpb25BcnJheS5sZW5ndGg9PTApIHJldHVybihudWxsKTtcclxuXHRcdHJldHVybih0aGlzLmp1bmN0aW9uQXJyYXlbdGhpcy5qdW5jdGlvbkFycmF5Lmxlbmd0aCAtIDFdKTtcclxuXHR9XHJcblx0XHJcblx0bG9nKClcclxuXHR7XHJcblx0XHRjb25zb2xlLmxvZyhcIndhbGtlciBsb2c6XCIrQ29tbW9udG9TdHJpbmcodGhpcykpO1xyXG5cdH1cclxufVxyXG4vLzxqczJub2RlPlxyXG5tb2R1bGUuZXhwb3J0cyA9IFdhbGtlcjtcclxuY29uc29sZS5sb2coXCJMb2FkaW5nOldhbGtlclwiKTtcclxuLy88L2pzMm5vZGU+XHJcbiIsIi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXHJcbi8vIFdvcmxkVXBkYXRlXHJcbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cclxuY2xhc3MgV29ybGRVcGRhdGVcclxue1xyXG5cdGNvbnN0cnVjdG9yKGp1bmN0aW9uTmFtZSx3YWxrZXJOYW1lLHByb2Nlc3NUaW1lc3RhbXAsd2Fsa2VySW5mbyxqdW5jdGlvbkluZm8scGF0aEluZm8pXHJcblx0e1xyXG5cdFx0V29ybGRVcGRhdGUuY3JlYXRlV29ybGRVcGRhdGUodGhpcyxqdW5jdGlvbk5hbWUsd2Fsa2VyTmFtZSxwcm9jZXNzVGltZXN0YW1wLHdhbGtlckluZm8sanVuY3Rpb25JbmZvLHBhdGhJbmZvKTtcclxuXHR9XHJcblx0XHJcblx0c3RhdGljIGNyZWF0ZVdvcmxkVXBkYXRlRnJvbUpzb24oanNvbilcclxuXHR7XHJcblx0XHR2YXIgd29ybGRVcGRhdGUgPSBuZXcgV29ybGRVcGRhdGUoXHJcblx0XHRcdFx0anNvbi5qdW5jdGlvbk5hbWUsXHJcblx0XHRcdFx0anNvbi53YWxrZXJOYW1lLFxyXG5cdFx0XHRcdGpzb24ucHJvY2Vzc1RpbWVzdGFtcCxcclxuXHRcdFx0XHRqc29uLndhbGtlckluZm8sXHJcblx0XHRcdFx0anNvbi5qdW5jdGlvbkluZm8sXHJcblx0XHRcdFx0anNvbi5wYXRoSW5mbyk7XHJcblx0XHRyZXR1cm4od29ybGRVcGRhdGUpO1xyXG5cdH1cclxuXHRcdFxyXG5cdHN0YXRpYyBjcmVhdGVXb3JsZFVwZGF0ZSh3b3JsZFVwZGF0ZSxqdW5jdGlvbk5hbWUsd2Fsa2VyTmFtZSxwcm9jZXNzVGltZXN0YW1wLHdhbGtlckluZm8sanVuY3Rpb25JbmZvLHBhdGhJbmZvKVxyXG5cdHtcclxuXHRcdHdvcmxkVXBkYXRlLmp1bmN0aW9uTmFtZSA9IGp1bmN0aW9uTmFtZTtcclxuXHRcdHdvcmxkVXBkYXRlLndhbGtlck5hbWUgPSB3YWxrZXJOYW1lO1xyXG5cdFx0d29ybGRVcGRhdGUucHJvY2Vzc1RpbWVzdGFtcCA9IHByb2Nlc3NUaW1lc3RhbXA7XHJcblx0XHR3b3JsZFVwZGF0ZS53YWxrZXJJbmZvID0gd2Fsa2VySW5mbztcclxuXHRcdHdvcmxkVXBkYXRlLmp1bmN0aW9uSW5mbyA9IGp1bmN0aW9uSW5mbztcclxuXHRcdHdvcmxkVXBkYXRlLnBhdGhJbmZvID0gcGF0aEluZm87XHJcblx0XHR3b3JsZFVwZGF0ZS51cGRhdGVUeXBlID0gXCJqdW5jdGlvblwiO1xyXG5cclxuXHR9XHJcblx0XHJcblx0cmVhZHlUb0JlUHJvY2Vzc2VkICh0aW1lc3RhbXApXHJcblx0e1xyXG5cdFx0cmV0dXJuKCAodGhpcy5wcm9jZXNzVGltZXN0YW1wPD10aW1lc3RhbXApICk7XHJcblx0XHQvL3JldHVybiggICh0aGlzLmdldERhdGUoKS5nZXRUaW1lKCk8PXRpbWVzdGFtcCkgICk7XHJcblx0fVxyXG5cdFxyXG5cdHhnZXREYXRlKClcclxuXHR7XHJcblx0XHRyZXR1cm4obmV3IERhdGUodGhpcy5wcm9jZXNzVGltZXN0YW1wKjEwMDApKTtcclxuXHR9XHJcbn1cclxuXHJcbi8vPGpzMm5vZGU+XHJcbm1vZHVsZS5leHBvcnRzID0gV29ybGRVcGRhdGU7XHJcbmNvbnNvbGUubG9nKFwiTG9hZGluZzpXb3JsZFVwZGF0ZVwiKTtcclxuLy88L2pzMm5vZGU+XHJcbiIsInZhciBDYW52YXNIb2xkZXIgPSByZXF1aXJlKCcuLi8uLi9ub2Rlcy9ub2RlY2FudmFzL2NhbnZhc2hvbGRlcicpO1xyXG52YXIgQ2FudmFzSG9sZGVyVmlydHVhbCA9IHJlcXVpcmUoJy4uLy4uL25vZGVzL25vZGVjYW52YXMvY2FudmFzaG9sZGVydmlydHVhbCcpO1xyXG52YXIgUG9zaXRpb24gPSByZXF1aXJlKCcuLi8uLi9ub2Rlcy9wb3NpdGlvbi9wb3NpdGlvbicpO1xyXG52YXIgUGF0aFdvcmxkID0gcmVxdWlyZSgnLi4vLi4vcGF0aHMvcGF0aHdvcmxkJyk7XHJcbnZhciBXb3JsZFVwZGF0ZSA9IHJlcXVpcmUoJy4uLy4uL3BhdGhzL3dvcmxkdXBkYXRlJyk7XHJcbnZhciBEZW1vR3JhcGgxR3JhcGhQYXRoV29ybGREZWYgPSByZXF1aXJlKCcuL2RlbW9ncmFwaDFwYXRod29ybGRkZWYnKTtcclxudmFyIENvbW1vbiA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9jb21tb24nKTtcclxudmFyIENhbnZhc0hvbGRlciA9IHJlcXVpcmUoJy4uLy4uL25vZGVzL25vZGVjYW52YXMvY2FudmFzaG9sZGVyJyk7XHJcbnZhciBQdXNoRGVtb0dyYXAxaCA9IHJlcXVpcmUoJy4vcHVzaGRlbW9ncmFwaDEnKTtcclxuXHJcbmNsYXNzIERlbW9HcmFwaDFDbGllbnRTdGFuZEFsb25lXHJcbntcclxuXHRjb25zdHJ1Y3RvcihjYW52YXNIb2xkZXIpXHJcblx0e1xyXG5cdFx0dGhpcy5jYW52YXNOYW1lID0gY2FudmFzSG9sZGVyLmNhbnZhc05hbWU7XHJcblx0XHR0aGlzLmNhbnZhc0hvbGRlciA9IGNhbnZhc0hvbGRlcjtcclxuXHRcdHRoaXMud29ybGREaXNwbGF5ID0gdGhpcy5jYW52YXNIb2xkZXIud29ybGREZWYuZ2V0V29ybGREaXNwYWx5KCk7XHRcclxuXHRcdHRoaXMud29ybGQgPSBuZXcgUGF0aFdvcmxkKFxyXG5cdFx0XHRcdHRoaXMuY2FudmFzSG9sZGVyLFx0XHRcclxuXHRcdFx0XHR0aGlzLndvcmxkRGlzcGxheSk7XHJcblx0XHR0aGlzLndvcmxkLnRpbWVGYWN0b3IgPSAxLjA7XHJcblx0XHR0aGlzLndvcmxkLnN0YXJ0VGltZSA9IG5ldyBEYXRlKCk7XHJcblx0XHR0aGlzLmxhc3RUaW1lRGVsdGEgPSAtMTtcclxuXHJcblx0XHR2YXIgZmlyc3RJdGVtID0gdGhpcy53b3JsZC5wZWVrQXROZXh0V29ybGRVcGRhdGUoKTtcclxuXHRcdGlmKGZpcnN0SXRlbSE9bnVsbClcclxuXHRcdHtcclxuXHRcdFx0dmFyIGZpcnN0RGF0ZSA9IGZpcnN0SXRlbS5nZXREYXRlKCk7XHJcblx0XHRcdHRoaXMud29ybGQuc3RhcnRUaW1lID0gZmlyc3REYXRlO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHRzdGF0aWMgZ2V0RXhwb3J0cygpXHJcblx0e1xyXG5cdFx0Ly92YXIgZXhwb3J0cyA9IHN1cGVyLmdldEV4cG9ydHMoKTtcclxuXHRcdC8vZXhwb3J0cy5QYXRoQ2xpZW50U3RhbmRBbG9uZSA9IFBhdGhDbGllbnRTdGFuZEFsb25lO1xyXG5cdFx0XHJcblx0XHRjb25zb2xlLmxvZy5hcHBseShcIkRlbW9HcmFwaDFDbGllblN0YW5kQWxvbmU6R2V0dGluZyBleHBvcnRzXCIpO1xyXG5cdFx0cmV0dXJuKFxyXG5cdFx0XHQvL2V4cG9ydHNcclxuXHRcdFx0XHRcclxuXHRcdFx0XHR7XHJcblx0XHRcdFx0XHRDYW52YXNIb2xkZXI6Q2FudmFzSG9sZGVyLFxyXG5cdFx0XHRcdFx0Q2FudmFzSG9sZGVyVmlydHVhbDpDYW52YXNIb2xkZXJWaXJ0dWFsLFxyXG5cdFx0XHRcdFx0UG9zaXRpb246UG9zaXRpb24sXHJcblx0XHRcdFx0XHRQYXRoV29ybGQ6UGF0aFdvcmxkLFxyXG5cdFx0XHRcdFx0V29ybGRVcGRhdGU6V29ybGRVcGRhdGUsXHJcblx0XHRcdFx0XHREZW1vR3JhcGgxR3JhcGhQYXRoV29ybGREZWY6RGVtb0dyYXBoMUdyYXBoUGF0aFdvcmxkRGVmLFxyXG5cdFx0XHRcdFx0Q29tbW9uOkNvbW1vbixcclxuXHRcdFx0XHRcdFB1c2hEZW1vR3JhcDFoOlB1c2hEZW1vR3JhcDFoLFxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRcclxuXHRcdFx0XHQpO1xyXG5cdH1cclxuXHRcclxuXHRzdGFydEFuaW1hdGlvbigpXHJcblx0e1xyXG5cdFx0XHR0aGlzLmRvRHJhdygpO1xyXG5cdFx0XHR2YXIgc2VsZiA9IHRoaXM7XHJcblx0XHRcdHNldEludGVydmFsKGZ1bmN0aW9uKCl7IHNlbGYuZG9EcmF3KCk7IH0sMjUwKTtcdFx0XHJcblx0fVxyXG5cdFxyXG5cdGRvRHJhdygpXHJcblx0e1xyXG5cdFx0LypcclxuXHRcdGlmKHRoaXMubGFzdFRpbWVEZWx0YTwwKSB0aGlzLmdldERhdGEoKTtcclxuXHRcdGVsc2VcclxuXHRcdHtcclxuXHRcdFx0dGhpcy5nZXREZWx0YSh0aGlzLmxhc3RUaW1lRGVsdGEpO1xyXG5cdFx0XHR0aGlzLnB1c2hVc2VyTW92bWVudHMoKTtcclxuXHRcdH1cclxuXHRcdCovXHJcblx0fSAgICBcdFx0XHRcdFxyXG5cdFxyXG5cdHB1c2hVc2VyTW92bWVudHMoKVxyXG5cdHtcclxuXHRcdC8vY29uc29sZS5sb2coXCJwdXNoVXNlck1vdm1lbnRzLi4uXCIpO1xyXG5cdFx0LypcclxuXHRcdHZhciBub2RlTW91c2VNb3ZtZW50ID0gdGhpcy53b3JsZC5ub2RlQ2FudmFzTW91c2Uubm9kZU1vdXNlTW92bWVudDtcclxuXHRcdHZhciBzZWxmID0gdGhpcztcclxuXHRcdE9iamVjdC5rZXlzKG5vZGVNb3VzZU1vdm1lbnQpLmZvckVhY2goZnVuY3Rpb24gKGtleSlcclxuXHRcdHtcclxuXHRcdFx0dmFyIG1vdmVQb3NpdGlvbiA9IFBvc2l0aW9uLmdldEF2ZXJhZ2VQb3N0aW9uRnJvbVBvc2l0aW9uTGlzdChub2RlTW91c2VNb3ZtZW50W2tleV0ubW92ZVBvc3Rpb25BcnJheSk7XHJcblx0XHRcdG5vZGVNb3VzZU1vdm1lbnRba2V5XS5tb3ZlUG9zdGlvbkFycmF5Lmxlbmd0aCA9IDA7XHJcblx0XHRcdGRlbGV0ZSBub2RlTW91c2VNb3ZtZW50W2tleV07XHJcblx0XHRcdFxyXG5cdFx0XHR2YXIgbW92ZU1lc3NhZ2UgPSBcclxuXHRcdFx0e1xyXG5cdFx0XHRcdG5vZGVLZXk6a2V5LFxyXG5cdFx0XHRcdG1vdmVQb3NpdGlvblxyXG5cdFx0XHR9O1xyXG5cdFx0XHRzZWxmLnNlbmRTZXJ2ZXJKc29uKFxyXG5cdFx0XHRcdFwiL3BhdGhzL1wiK3NlbGYuY2FudmFzTmFtZStcIi9tb3Zlbm9kZS9cIixcclxuXHRcdFx0XHRtb3ZlTWVzc2FnZSk7XHJcblx0XHRcdGNvbnNvbGUubG9nKFwibW92ZW1lbnRzIGZvciA6IFwiK2tleSk7XHJcblx0XHR9KTtcclxuXHRcdCovXHJcblx0fVxyXG5cdFxyXG5cdHNlbmRTZXJ2ZXJKc29uKHVybCxqc29uKVxyXG5cdHtcclxuXHRcdC8qXHJcblx0XHR2YXIgZW5jb2RlZEpzb24gPSBDb21tb24uanNvblRvVVJJKGpzb24pO1xyXG5cdFx0ZmV0Y2godXJsK2VuY29kZWRKc29uKS50aGVuKChyZXNwKSA9PiByZXNwLmpzb24oKSkudGhlbihcclxuXHQgIFx0XHRcdFx0ZnVuY3Rpb24oZGF0YSlcclxuXHQgIFx0XHRcdFx0e1xyXG5cdCAgICBcdFx0XHRcdGNvbnNvbGUubG9nKFwic2VudCBqc29uIHRvIFwiK3VybCk7XHJcblx0XHRcdFx0XHR9KTsgIFx0XHJcblx0XHRcdFx0XHQqL1xyXG5cdCB9XHJcblx0XHJcblx0Z2V0RGVsdGEoZGVsdGFUaW1lKVxyXG5cdHtcclxuXHRcdC8qXHJcblx0XHR2YXIgdXJsID0gXCIvcGF0aHMvXCIrdGhpcy5jYW52YXNOYW1lK1wiL2RlbHRhL1wiK2RlbHRhVGltZStcIi9cIisxMDtcclxuXHRcdHZhciBzZWxmID0gdGhpcztcclxuXHRcdGZldGNoKHVybCkudGhlbigocmVzcCkgPT4gcmVzcC5qc29uKCkpLnRoZW4oXHJcblx0ICBcdFx0XHRcdGZ1bmN0aW9uKGRhdGEpXHJcblx0ICBcdFx0XHRcdHtcclxuXHQgICAgXHRcdFx0XHRmb3IodmFyIGk9MDtpPGRhdGEubGVuZ3RoO2krKylcclxuXHQgICAgXHRcdFx0XHR7XHJcblx0ICAgIFx0XHRcdFx0XHR2YXIgIG9uZURhdGEgPSBkYXRhW2ldO1xyXG5cdCAgICBcdFx0XHRcdFx0aWYob25lRGF0YS51cGRhdGVUeXBlPT0gXCJqdW5jdGlvblwiKVxyXG5cdFx0XHRcdFx0XHRcdHtcclxuXHQgICAgXHRcdFx0XHRcdFx0c2VsZi53b3JsZC5hZGRUb1dvcmxkVXBkYXRlUXVldWUoV29ybGRVcGRhdGUuY3JlYXRlV29ybGRVcGRhdGVGcm9tSnNvbihvbmVEYXRhKSk7XHJcblx0XHJcblx0ICAgIFx0XHRcdFx0XHR9XHJcblx0ICAgIFx0XHRcdFx0XHRlbHNlIGlmKG9uZURhdGEudXBkYXRlVHlwZT09XCJtb3ZlXCIpXHJcblx0ICAgIFx0XHRcdFx0XHR7XHJcblx0ICAgIFx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKFwibW92ZTpcIitDb21tb24udG9TdHJpbmcob25lRGF0YSkpO1xyXG5cdCAgICBcdFx0XHRcdFx0XHRpZihzZWxmLndvcmxkLmRvZXNOb2RlRXhpc3Qob25lRGF0YS5ub2RlS2V5KSlcclxuXHQgICAgXHRcdFx0XHRcdFx0e1xyXG5cdCAgICBcdFx0XHRcdFx0XHRcdHZhciBub2RlID0gc2VsZi53b3JsZC5nZXROb2RlKG9uZURhdGEubm9kZUtleSk7XHJcblx0ICAgIFx0XHRcdFx0XHRcdFx0aWYoIW5vZGUuaXNTZWxlY3RlZCkgbm9kZS5wb3NpdGlvbi5zZXRYWShvbmVEYXRhLm1vdmVQb3NpdGlvbi54LG9uZURhdGEubW92ZVBvc2l0aW9uLnkpO1xyXG5cdCAgICBcdFx0XHRcdFx0XHR9XHJcblx0ICAgIFx0XHRcdFx0XHR9XHJcblx0ICAgIFx0XHRcdFx0XHRzZWxmLmxhc3RUaW1lRGVsdGEgPSBvbmVEYXRhLnByb2Nlc3NUaW1lc3RhbXA7XHJcblx0ICAgIFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fSk7ICBcdFxyXG5cdFx0XHRcdFx0Ki9cclxuXHQgfVxyXG5cdFxyXG5cdGdldERhdGEoKVxyXG5cdHtcclxuXHRcdC8qXHJcblx0XHR2YXIgdXJsID0gXCIvcGF0aHMvXCIrdGhpcy5jYW52YXNOYW1lO1xyXG5cdFx0dmFyIHNlbGYgPSB0aGlzO1xyXG5cdFx0ZmV0Y2godXJsKS50aGVuKChyZXNwKSA9PiByZXNwLmpzb24oKSkudGhlbihcclxuXHQgIFx0XHRcdFx0ZnVuY3Rpb24oZGF0YSlcclxuXHQgIFx0XHRcdFx0e1xyXG5cdCAgICBcdFx0XHRcdFBhdGhXb3JsZC5maWxsUGF0aFdvcmxkRnJvbUNsaWVudEpzb24oc2VsZi53b3JsZCxkYXRhKTtcclxuXHRcdFx0XHRcdH0pO1xyXG5cdFx0Ki9cclxuXHRcdHRoaXMubGFzdFRpbWVEZWx0YSA9IDA7XHRcclxuXHJcblx0fVxyXG59XHJcblxyXG4vLzxqczJub2RlPlxyXG5tb2R1bGUuZXhwb3J0cyA9IERlbW9HcmFwaDFDbGllbnRTdGFuZEFsb25lO1xyXG5jb25zb2xlLmxvZyhcIkxvYWRpbmc6RGVtb0dyYXBoMUNsaWVudFN0YW5kQWxvbmVcIik7XHJcbi8vPC9qczJub2RlPiIsInZhciBQYXRoV29ybGREZWYgPSByZXF1aXJlKCcuLi8uLi9wYXRocy9wYXRod29ybGRkZWYnKTtcclxudmFyIENhbnZhc0hvbGRlciA9IHJlcXVpcmUoJy4uLy4uL25vZGVzL25vZGVjYW52YXMvY2FudmFzaG9sZGVyJyk7XHJcbnZhciBQYXRoV29ybGQgPSByZXF1aXJlKCcuLi8uLi9wYXRocy9wYXRod29ybGQnKTtcclxudmFyIFdvcmxkVXBkYXRlID0gcmVxdWlyZSgnLi4vLi4vcGF0aHMvd29ybGR1cGRhdGUnKTtcclxudmFyIFBhdGggPSByZXF1aXJlKCcuLi8uLi9wYXRocy9wYXRoJyk7XHJcbnZhciBDb21tb24gPSByZXF1aXJlKCcuLi8uLi9jb21tb24vY29tbW9uJyk7XHJcbnZhciBDaXJjbGVEaXNwbGF5ID0gcmVxdWlyZSgnLi4vLi4vbm9kZXMvbm9kZWRpc3BsYXkvY2lyY2xlZGlzcGxheScpO1xyXG52YXIgQ29ubmVjdG9yRGlzcGxheUVtcHR5ID0gcmVxdWlyZSgnLi4vLi4vbm9kZXMvY29ubmVjdG9yZGlzcGxheS9jb25uZWN0b3JkaXNwbGF5ZW1wdHknKTtcclxudmFyIEdyb3VwQ29ubmVjdG9yID0gcmVxdWlyZSgnLi4vLi4vbm9kZXMvY29ubmVjdG9yL2dyb3VwY29ubmVjdG9yJyk7XHJcbnZhciBXYWxsQ29ubmVjdG9yID0gcmVxdWlyZSgnLi4vLi4vbm9kZXMvY29ubmVjdG9yL3dhbGxjb25uZWN0b3InKTtcclxudmFyIEp1bmN0aW9uQ29ubmVjdG9yID0gcmVxdWlyZSgnLi4vLi4vcGF0aHMvbm9kZWRpc3BsYXkvanVuY3Rpb25jb25uZWN0b3InKTtcclxudmFyIEp1bmN0aW9uRGlzcGxheSA9IHJlcXVpcmUoJy4uLy4uL3BhdGhzL25vZGVkaXNwbGF5L2p1bmN0aW9uZGlzcGxheScpO1xyXG52YXIgUmVjdGFuZ2xlRGlzcGxheSA9IHJlcXVpcmUoJy4uLy4uL25vZGVzL25vZGVkaXNwbGF5L3JlY3RhbmdsZWRpc3BsYXknKTtcclxudmFyIFRyaWFuZ2xlRGlzcGxheSA9IHJlcXVpcmUoJy4uLy4uL25vZGVzL25vZGVkaXNwbGF5L3RyaWFuZ2xlZGlzcGxheScpO1xyXG52YXIgQXJjRGlzcGxheVNoYXBlID0gcmVxdWlyZSgnLi4vLi4vbm9kZXMvbm9kZWRpc3BsYXkvYXJjZGlzcGxheXNoYXBlJyk7XHJcblxyXG4vL3ZhciBJbml0SW5hR3JhcGggPSByZXF1aXJlKCcuLi8uLi9wYXRoc2V4cC9pbmFncmFwaC9pbml0aW5hZ3JhcGgnKTtcclxuXHJcblxyXG5cclxuXHJcbmNsYXNzIERlbW9HcmFwaDFHcmFwaFBhdGhXb3JsZERlZiBleHRlbmRzIFBhdGhXb3JsZERlZlxyXG57XHJcblxyXG5cdGNvbnN0cnVjdG9yKClcclxuXHR7XHJcblx0XHRzdXBlcigpO1xyXG5cdFx0dGhpcy5pbml0KCk7XHJcblx0fVxyXG5cdFxyXG5cdGluaXQoKVxyXG5cdHtcclxuXHRcdHRoaXMud29ybGREZWZhdWx0cyA9XHJcblx0XHR7XHJcblx0XHRcdFx0anVuY3Rpb25SYWRpdXNEZWZhdWx0OjE1LFxyXG5cdFx0XHRcdHdhbGtlclJhZGl1c0RlZmF1bHQ6MTUqMC4zLFxyXG5cdFx0XHRcdHJlbGF4ZWREaXN0YW5jZURlZmF1bHQ6OC41KjEwLFxyXG5cdFx0XHRcdGVsYXN0aWNpdHlGYWN0b3JEZWZ1YWx0OjAuMDI1LFxyXG5cdFx0XHRcdHBvcnQ6MzAwMCxcclxuXHRcdH07XHJcblx0XHRcclxuXHRcdHRoaXMucGF0aFBhcnRzID1cclxuXHRcdHtcclxuXHRcdFx0c3RhcnRhOltcIlN0ZXAgMWFcIixcIlN0ZXAgMmFcIixcIlN0ZXAgM2FcIl0sXHJcblx0XHRcdHN0YXJ0YjpbXCJTdGVwIDFiXCIsXCJTdGVwIDJiXCIsXCJTdGVwIDNiXCJdLFxyXG5cdFx0XHRzdGFydGM6W1wiU3RlcCAxY1wiLFwiU3RlcCAyY1wiLFwiU3RlcCAzY1wiXSxcclxuXHRcdFx0bWlkZGxlOltcIlN0ZXAgNFwiLFwiU3RlcCA1XCIsXCJTdGVwIDZcIixcIlN0ZXAgN1wiLFwiU3RlcCA4XCJdLFxyXG5cdFx0XHRlbmRhOltcIlN0ZXA3XCIsXCJTdGVwIDdhXCIsXCJTdGVwIDhhXCJdLFxyXG5cdFx0XHRlbmRiOltcIlN0ZXA4XCIsXCJTdGVwIDhiXCIsXCJTdGVwIDhiXCJdLFxyXG5cdFx0XHRlbmRjOltcIlN0ZXA4XCIsXCJTdGVwIDljXCIsXCJTdGVwIDEwY1wiLFwiU3RlcCAxMWNcIixcIlN0ZXAgMTJjXCJdLFxyXG5cdFx0fTtcclxuXHJcblx0XHRcclxuXHRcdHRoaXMucGF0aERlZnMgPVxyXG5cdFx0W1xyXG5cdFx0XHR7XHJcblx0XHRcdFx0cGF0aERlZk5hbWU6XCJwYXRoMVwiLG51bWJlck5vZGVzOjEwMCxub2RlU2hhcGU6XCJjaXJjbGVcIixub2RlQ29sb3I6XCJmZjAwMDBcIixcclxuXHRcdFx0XHRwYXRoOltcInN0YXJ0YVwiLFwibWlkZGxlXCIsXCJlbmRhXCJdXHJcblx0XHRcdH0sXHJcblx0XHRcdHtcclxuXHRcdFx0XHRwYXRoRGVmTmFtZTpcInBhdGgyXCIsbnVtYmVyTm9kZXM6MTAwLG5vZGVTaGFwZTpcInNxdWFyZVwiLG5vZGVDb2xvcjpcImZmZmYwMFwiLFxyXG5cdFx0XHRcdHBhdGg6W1wic3RhcnRiXCIsXCJtaWRkbGVcIixcImVuZGJcIl1cclxuXHRcdFx0fSxcclxuXHRcdFx0e1xyXG5cdFx0XHRcdHBhdGhEZWZOYW1lOlwicGF0aDNcIixudW1iZXJOb2RlczoxMDAsbm9kZVNoYXBlOlwidHJpYW5nbGVcIixub2RlQ29sb3I6XCIwMDAwZmZcIixcclxuXHRcdFx0XHRwYXRoOltcInN0YXJ0Y1wiLFwibWlkZGxlXCIsXCJlbmRjXCJdXHJcblx0XHRcdH0sXHJcblxyXG5cdFx0XTtcclxuXHRcdFx0XHJcblx0ICAgIHRoaXMuanVuY3Rpb25FeGl0cyA9IFxyXG5cdCAgICBbXHJcblx0XHRcdHtleGl0SnVuY3Rpb246XCJTdGVwIDhhXCIsZXhpdEFmdGVyTWlsaVNlY29uZHM6NjAqNjAqMjQqMTAwMH0sXHJcblx0XHRcdHtleGl0SnVuY3Rpb246XCJTdGVwIGJhXCIsZXhpdEFmdGVyTWlsaVNlY29uZHM6NjAqNjAqMjQqMTAwMH0sXHJcblx0XHRcdHtleGl0SnVuY3Rpb246XCJTdGVwIDEyY1wiLGV4aXRBZnRlck1pbGlTZWNvbmRzOjYwKjYwKjI0KjEwMDB9LFxyXG5cdCAgICBdO1xyXG5cdFx0XHJcblx0XHR0aGlzLndvcmxkRGlzcGxheSA9XHJcblx0XHR7XHRcclxuXHRcdFx0anVuY3Rpb25SYWRpdXNEZWZhdWx0OnRoaXMud29ybGREZWZhdWx0cy5qdW5jdGlvblJhZGl1c0RlZmF1bHQsXHJcblx0XHRcdHdhbGtlclJhZGl1c0RlZmF1bHQ6dGhpcy53b3JsZERlZmF1bHRzLndhbGtlclJhZGl1c0RlZmF1bHQsXHJcblx0XHRcdHJlbGF4ZWREaXN0YW5jZURlZmF1bHQ6dGhpcy53b3JsZERlZmF1bHRzLnJlbGF4ZWREaXN0YW5jZURlZmF1bHQsXHJcblx0XHRcdGVsYXN0aWNpdHlGYWN0b3JEZWZ1YWx0OnRoaXMud29ybGREZWZhdWx0cy5lbGFzdGljaXR5RmFjdG9yRGVmdWFsdCxcclxuXHRcdFx0XHJcblx0XHQgICAgd29ybGRCYWNrZ3JvdW5kQ29sb3I6XCJlMGUwZjBmZlwiLFxyXG5cdFx0XHJcblx0XHQgICAgdGVsZXBvcnRQYXRoczpcclxuXHRcdFx0XHRbXHJcblx0XHRcdFx0XHQvLyBUZWxlcG9ydCBQYXRoISBuYW1lPVJlcXVldWUgdG8gTVMgc3RhcnQ9RFQxIGVuZD1NUy9JbiBQcm9ncmVzc1xyXG5cdFx0XHRcdFx0Ly97dGVsZXBvcnROYW1lOlwiUmVxdWV1ZSB0byBNUy9JbiBQcm9ncmVzc1wiLHN0YXJ0SnVuY3Rpb246XCJeKCg/IURUMXxNUy4qfFNpZ25pbmcpLikqJFwiLGVuZEp1bmN0aW9uOlwiTVMvSW4gUHJvZ3Jlc3NcIn0sXHJcblx0XHRcdFx0XHQvL3t0ZWxlcG9ydE5hbWU6XCJSZXF1ZXVlIHRvIE1TXCIsc3RhcnRKdW5jdGlvbjpcIl4oKD8hRFQxfE1TLip8U2lnbmluZykuKSokXCIsZW5kSnVuY3Rpb246XCJNU1wifSxcclxuXHRcdFx0XHRcdC8ve3RlbGVwb3J0TmFtZTpcIlJlcXVldWUgdG8gRFQxXCIsc3RhcnRKdW5jdGlvbjpcIl4oKD8hQ1N8TVMuKikuKSokXCIsZW5kSnVuY3Rpb246XCJEVDFcIn0sXHJcblx0XHRcdFx0XHQvL3t0ZWxlcG9ydE5hbWU6XCJSZXF1ZXVlIHRvIE1SUC1QYWNrYWdpbmdcIixzdGFydEp1bmN0aW9uOlwiXigoPyFTaWduaW5nfENhbmNsZWQpLikqJFwiLGVuZEp1bmN0aW9uOlwiTVJQLVBhY2thZ2luZ1wifSxcclxuXHRcdFx0XHRcdC8ve3RlbGVwb3J0TmFtZTpcIlJlcXVldWUgdG8gU2lnbmluZ1wiLHN0YXJ0SnVuY3Rpb246XCJeKCg/IU1TfFBhY2thZ2luZ3xNUlAtUGFja2FnaW5nKS4pKiRcIixlbmRKdW5jdGlvbjpcIlNpZ25pbmdcIn0sXHJcblx0XHRcdFx0XHQvL3t0ZWxlcG9ydE5hbWU6XCJUZXN0IGNhbmNlbGVkXCIsc3RhcnRKdW5jdGlvbjpcIl4oKD8hQ2FuY2VsZWR8LipQYWNrYWdpbmcuKikuKSokXCIsZW5kSnVuY3Rpb246XCJDYW5jZWxlZFwifSxcdFxyXG5cdFx0XHRcdF0sXHJcblx0XHRcdGVuZFBvaW50TW9kczpcclxuXHRcdFx0XHRbXHJcblx0XHRcdFx0XHQvLy8vLy8vLy8vLy8vLy8vLy8vL3tlbmRQb2ludE1vZE5hbWU6XCJNUlAtVGVzdCBSZXBvcnRlZFwiLHN0YXJ0SnVuY3Rpb246XCJNUlAtUGFja2FnaW5nXCIsZW5kSnVuY3Rpb246XCJUZXN0IFJlcG9ydGVkXCJ9LFx0XHRcclxuXHRcdFx0XHRcdC8ve2VuZFBvaW50TW9kTmFtZTpcIk5FVy1UZXN0IFJlcG9ydGVkXCIsc3RhcnRKdW5jdGlvbjpcIi4qXCIsZW5kSnVuY3Rpb246XCJUZXN0IFJlcG9ydGVkXCJ9LFx0XHRcclxuXHRcdFx0XHRdLFxyXG5cdFx0XHRjb25uZWN0b3JEZWZzOlxyXG5cdFx0XHR7XHJcblx0XHRcdFx0Z2VuZXJpYzpcclxuXHRcdFx0XHRcdGZ1bmN0aW9uKHdvcmxkRGVmLG5hbWUpIFxyXG5cdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRyZXR1cm4oXHJcblx0XHRcdFx0XHRcdFx0XHRuZXcgR3JvdXBDb25uZWN0b3IoXHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0bmV3IENvbm5lY3RvckRpc3BsYXlFbXB0eSgpLFxyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdG51bGwsXHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0bnVsbCxcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHR3b3JsZERlZi53b3JsZERlZmF1bHRzLnJlbGF4ZWREaXN0YW5jZURlZmF1bHQqMi41LFxyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdHdvcmxkRGVmLndvcmxkRGVmYXVsdHMuZWxhc3RpY2l0eUZhY3RvckRlZnVhbHQsXHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0bmFtZSlcclxuXHRcdFx0XHRcdFx0XHRcdCk7XHJcblx0XHRcdFx0XHR9LFxyXG5cdFx0XHRcdGp1bmN0aW9uU3BhY2VyOlxyXG5cdFx0XHRcdFx0ZnVuY3Rpb24od29ybGREZWYsbmFtZSkgXHJcblx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdHJldHVybihcclxuXHRcdFx0XHRcdFx0XHRcdG5ldyBHcm91cENvbm5lY3RvcihcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRuZXcgQ29ubmVjdG9yRGlzcGxheUVtcHR5KCksXHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0bnVsbCxcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRudWxsLFxyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdHdvcmxkRGVmLndvcmxkRGVmYXVsdHMucmVsYXhlZERpc3RhbmNlRGVmYXVsdCoyLjUsXHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0d29ybGREZWYud29ybGREZWZhdWx0cy5lbGFzdGljaXR5RmFjdG9yRGVmdWFsdCxcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRuYW1lKVxyXG5cdFx0XHRcdFx0XHRcdFx0KTtcclxuXHRcdFx0XHRcdH0sXHJcblx0XHRcdFx0d29ybGRXYWxsOlxyXG5cdFx0XHRcdFx0ZnVuY3Rpb24od29ybGREZWYsbmFtZSlcclxuXHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0cmV0dXJuKFxyXG5cdFx0XHRcdFx0XHRcdFx0bmV3IFdhbGxDb25uZWN0b3IoXHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0bmV3IENvbm5lY3RvckRpc3BsYXlFbXB0eSgpLFxyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdG51bGwsXHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0bnVsbCxcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHR3b3JsZERlZi53b3JsZERlZmF1bHRzLnJlbGF4ZWREaXN0YW5jZURlZmF1bHQqMC43NSxcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHQxLXdvcmxkRGVmLndvcmxkRGVmYXVsdHMuZWxhc3RpY2l0eUZhY3RvckRlZnVhbHQsXHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0bmFtZSlcclxuXHRcdFx0XHRcdFx0XHRcdCk7XHJcblx0XHRcdFx0XHR9LFxyXG5cdFx0XHRcdHBhdGg6XHJcblx0XHRcdFx0XHRmdW5jdGlvbih3b3JsZERlZixuYW1lKVxyXG5cdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRyZXR1cm4oXHJcblx0XHRcdFx0XHRcdFx0bmV3IFBhdGgobmV3IEp1bmN0aW9uQ29ubmVjdG9yKFxyXG5cdFx0XHRcdFx0XHRcdFx0XHR7bGluZUNvbG9yOlwiMDAwMGEwZmZcIixsaW5lV2lkdGg6NX0pLFxyXG5cdFx0XHRcdFx0XHRcdFx0bnVsbCxcclxuXHRcdFx0XHRcdFx0XHRcdG51bGwsXHJcblx0XHRcdFx0XHRcdFx0XHR3b3JsZERlZi53b3JsZERlZmF1bHRzLnJlbGF4ZWREaXN0YW5jZURlZmF1bHQqMS4yNSxcclxuXHRcdFx0XHRcdFx0XHRcdDEtd29ybGREZWYud29ybGREZWZhdWx0cy5lbGFzdGljaXR5RmFjdG9yRGVmdWFsdCxcclxuXHRcdFx0XHRcdFx0XHRcdG5hbWUpXHJcblx0XHRcdFx0XHRcdCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdFxyXG5cdFx0XHR9LFxyXG5cdFx0ICAgIGNvbm5lY3RvckRpc3BsYXk6XHJcblx0XHRcdHtcclxuXHRcdFx0XHRnZW5lcmljOlxyXG5cdFx0XHRcdHtcclxuXHRcdFx0XHRcdGNvbm5lY3RvckRpc3BsYXk6IG5ldyBKdW5jdGlvbkNvbm5lY3RvcihcclxuXHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0bGluZUNvbG9yOlwiMDAwMGEwZmZcIixsaW5lV2lkdGg6NVxyXG5cdFx0XHRcdFx0fSksXHRcdFx0XHRcdFxyXG5cdFx0XHRcdH0sXHJcblx0XHRcdH0sXHJcblx0XHRcdG5vZGVEaXNwbGF5OlxyXG5cdFx0XHR7XHJcblx0XHRcdFx0Z2VuZXJpYzpcclxuXHRcdFx0XHR7XHJcblx0XHRcclxuXHRcdFx0XHRcdG5vZGVEaXNwbGF5Om5ldyBUcmlhbmdsZURpc3BsYXkoXHJcblx0XHRcdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRcdFx0ZmlsbENvbG9yOlwiZmZmZmZmZmZcIixib3JkZXJDb2xvcjpcIjAwMDAwMGZmXCIsXHJcblx0XHRcdFx0XHRcdFx0XHRzZWxlY3RGaWxsQ29sb3I6XCIyMGZmMjBmZlwiLHNlbGVjdEJvcmRlckNvbG9yOlwiMDAwMGZmZmZcIixcclxuXHRcdFx0XHRcdFx0XHRcdGJvcmRlcldpZHRoOjEsXHJcblx0XHRcdFx0XHRcdFx0XHRyYWRpdXM6dGhpcy53b3JsZERlZmF1bHRzLndhbGtlclJhZGl1c0RlZmF1bHQvMS4yNSxcclxuXHRcdFx0XHRcdFx0XHRcdHdpZHRoOih0aGlzLndvcmxkRGVmYXVsdHMud2Fsa2VyUmFkaXVzRGVmYXVsdC8xLjI1KSoyLFxyXG5cdFx0XHRcdFx0XHRcdFx0aGVpZ2h0Oih0aGlzLndvcmxkRGVmYXVsdHMud2Fsa2VyUmFkaXVzRGVmYXVsdC8xLjI1KSoyLFxyXG5cdFx0XHRcdFx0XHRcdFx0Y2xvbmU6ZmFsc2VcclxuXHRcdFx0XHRcdFx0XHR9KSxcclxuXHRcdFx0XHRcdHdhbGtlckp1bmN0aW9uUnVsZXM6dGhpcy5qdW5jdGlvbkV4aXRzLFx0XHRcdFx0XHRcdFx0XHJcblx0XHRcdFx0fSxcclxuXHRcdFx0XHRnZW5lcmljSnVuY3Rpb246XHJcblx0XHRcdFx0e1x0XHRcdFxyXG5cdFx0XHRcdFx0Ly9pbml0R3JhcGhEYXRhOkluYUdyYXBoUGF0aFdvcmxkRGVmLmluaXRKdW5jdGlvbkRpc3BsYXksXHJcblx0XHRcdFx0XHRpbml0R3JhcGhEYXRhOnRoaXMuaW5pdEp1bmN0aW9uRGlzcGxheSxcclxuXHRcdFx0XHRcdG5vZGVEaXNwbGF5OntkaXNwbGF5SW5mbzp7Y2xvbmU6ZmFsc2V9fVxyXG5cdFx0XHRcdH0sXHJcblx0XHRcdFx0bm9kZUdlbmVyaWM6XHJcblx0XHRcdFx0e1xyXG5cdFx0XHJcblx0XHRcdFx0XHRub2RlRGlzcGxheTpuZXcgVHJpYW5nbGVEaXNwbGF5KFxyXG5cdFx0XHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0XHRcdGZpbGxDb2xvcjpcImZmZmZmZmZmXCIsYm9yZGVyQ29sb3I6XCIwMDAwMDBmZlwiLFxyXG5cdFx0XHRcdFx0XHRcdFx0c2VsZWN0RmlsbENvbG9yOlwiMjBmZjIwZmZcIixzZWxlY3RCb3JkZXJDb2xvcjpcIjAwMDBmZmZmXCIsXHJcblx0XHRcdFx0XHRcdFx0XHRib3JkZXJXaWR0aDoxLFxyXG5cdFx0XHRcdFx0XHRcdFx0cmFkaXVzOnRoaXMud29ybGREZWZhdWx0cy53YWxrZXJSYWRpdXNEZWZhdWx0LzEuMjUsXHJcblx0XHRcdFx0XHRcdFx0XHR3aWR0aDoodGhpcy53b3JsZERlZmF1bHRzLndhbGtlclJhZGl1c0RlZmF1bHQvMS4yNSkqMixcclxuXHRcdFx0XHRcdFx0XHRcdGhlaWdodDoodGhpcy53b3JsZERlZmF1bHRzLndhbGtlclJhZGl1c0RlZmF1bHQvMS4yNSkqMixcclxuXHRcdFx0XHRcdFx0XHRcdGNsb25lOmZhbHNlXHJcblx0XHRcdFx0XHRcdFx0fSksXHJcblx0XHRcdFx0XHR3YWxrZXJKdW5jdGlvblJ1bGVzOnRoaXMuanVuY3Rpb25FeGl0cyxcclxuXHRcdFx0XHR9LFxyXG5cdFx0XHRcdGp1bmN0aW9uUGllU2xpY2U6XHJcblx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRub2RlRGlzcGxheUZ1bmN0aW9uOmZ1bmN0aW9uKClcclxuXHRcdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRcdHJldHVybihuZXcgQXJjRGlzcGxheVNoYXBlKFxyXG5cdFx0XHRcdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRmaWxsQ29sb3I6XCIwMDAwMDAwMFwiLFxyXG5cdFx0XHRcdFx0XHRcdFx0XHRib3JkZXJDb2xvcjpcIjAwMDAwMGZmXCIsXHJcblx0XHRcdFx0XHRcdFx0XHRcdHNlbGVjdEZpbGxDb2xvcjpcIjAwZmYwMDdmXCIsc2VsZWN0Qm9yZGVyQ29sb3I6XCIwMDAwMDBmZlwiLFxyXG5cdFx0XHRcdFx0XHRcdFx0XHRib3JkZXJXaWR0aDoxLFxyXG5cdFx0XHRcdFx0XHRcdFx0XHRyYWRpdXM6MjUsXHJcblx0XHRcdFx0XHRcdFx0XHRcdGN1cnZlUG9pbnRzOjE2LFxyXG5cdFx0XHRcdFx0XHRcdFx0XHRzdGFydEFuZ2xlOjAsXHJcblx0XHRcdFx0XHRcdFx0XHRcdGVuZEFuZ2xlOjMyMCxcclxuXHRcdFx0XHRcdFx0XHRcdFx0d2lkdGg6MjUsXHJcblx0XHRcdFx0XHRcdFx0XHRcdGhlaWdodDoyNSxcclxuXHRcdFx0XHRcdFx0XHRcdFx0dHM6bmV3IERhdGUoKS5nZXRUaW1lKCksXHJcblx0XHRcdFx0XHRcdFx0XHRcdGNsb25lOnRydWVcclxuXHRcdFx0XHRcdFx0XHRcdH0pKVxyXG5cdFx0XHRcdFx0XHRcdFx0fSxcclxuXHRcdFx0XHRcdG5vZGVEaXNwbGF5Om5ldyBBcmNEaXNwbGF5U2hhcGUoXHJcblx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdGZpbGxDb2xvcjpcIjAwMDAwMDAwXCIsXHJcblx0XHRcdFx0XHRcdGJvcmRlckNvbG9yOlwiMDAwMDAwZmZcIixcclxuXHRcdFx0XHRcdFx0c2VsZWN0RmlsbENvbG9yOlwiMDBmZjAwN2ZcIixzZWxlY3RCb3JkZXJDb2xvcjpcIjAwMDAwMGZmXCIsXHJcblx0XHRcdFx0XHRcdGJvcmRlcldpZHRoOjEsXHJcblx0XHRcdFx0XHRcdHJhZGl1czoyNSxcclxuXHRcdFx0XHRcdFx0Y3VydmVQb2ludHM6MTYsXHJcblx0XHRcdFx0XHRcdHN0YXJ0QW5nbGU6MCxcclxuXHRcdFx0XHRcdFx0ZW5kQW5nbGU6MzIwLFxyXG5cdFx0XHRcdFx0XHR3aWR0aDoyNSxcclxuXHRcdFx0XHRcdFx0aGVpZ2h0OjI1LFxyXG5cdFx0XHRcdFx0XHRjbG9uZTp0cnVlXHJcblx0XHRcdFx0XHR9KSxcclxuXHRcdFx0XHR9LFxyXG5cdFx0XHRcdHBhdGgxOlxyXG5cdFx0XHRcdHtcclxuXHRcdFxyXG5cdFx0XHRcdFx0bm9kZURpc3BsYXk6bmV3IFRyaWFuZ2xlRGlzcGxheShcclxuXHRcdFx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdFx0XHRmaWxsQ29sb3I6XCJGRkE1MDBmZlwiLGJvcmRlckNvbG9yOlwiMDAwMDAwZmZcIixcclxuXHRcdFx0XHRcdFx0XHRcdHNlbGVjdEZpbGxDb2xvcjpcIjIwZmYyMGZmXCIsc2VsZWN0Qm9yZGVyQ29sb3I6XCIwMDAwZmZmZlwiLFxyXG5cdFx0XHRcdFx0XHRcdFx0Ym9yZGVyV2lkdGg6MSxcclxuXHRcdFx0XHRcdFx0XHRcdC8vcmFkaXVzOndhbGtlclJhZGl1c0RlZmF1bHQvMS4yNSxcclxuXHRcdFx0XHRcdFx0XHRcdHdpZHRoOih0aGlzLndvcmxkRGVmYXVsdHMud2Fsa2VyUmFkaXVzRGVmYXVsdC8xLjI1KSoyLFxyXG5cdFx0XHRcdFx0XHRcdFx0aGVpZ2h0Oih0aGlzLndvcmxkRGVmYXVsdHMud2Fsa2VyUmFkaXVzRGVmYXVsdC8xLjI1KSoyLFxyXG5cdFx0XHRcdFx0XHRcdFx0Y2xvbmU6ZmFsc2VcclxuXHRcdFx0XHRcdFx0XHR9KSxcclxuXHRcdFx0XHRcdHdhbGtlckp1bmN0aW9uUnVsZXM6dGhpcy5qdW5jdGlvbkV4aXRzLFxyXG5cdFx0XHRcdH0sXHJcblx0XHRcdFx0bm9ybWFsOlxyXG5cdFx0XHRcdHtcclxuXHRcdFx0XHRcdG5vZGVEaXNwbGF5Om5ldyBSZWN0YW5nbGVEaXNwbGF5KFxyXG5cdFx0XHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0XHRcdGZpbGxDb2xvcjpcImZmMjAyMGZmXCIsYm9yZGVyQ29sb3I6XCIwMDAwMDBmZlwiLFxyXG5cdFx0XHRcdFx0XHRcdFx0c2VsZWN0RmlsbENvbG9yOlwiMjBmZjIwZmZcIixzZWxlY3RCb3JkZXJDb2xvcjpcIjAwMDBmZmZmXCIsXHJcblx0XHRcdFx0XHRcdFx0XHRib3JkZXJXaWR0aDoxLFxyXG5cdFx0XHRcdFx0XHRcdFx0d2lkdGg6KHRoaXMud29ybGREZWZhdWx0cy53YWxrZXJSYWRpdXNEZWZhdWx0LzEuMjUpKjIsXHJcblx0XHRcdFx0XHRcdFx0XHRoZWlnaHQ6KHRoaXMud29ybGREZWZhdWx0cy53YWxrZXJSYWRpdXNEZWZhdWx0LzEuMjUpKjIsXHJcblx0XHRcdFx0XHRcdFx0XHRjbG9uZTpmYWxzZVx0XHRcdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRcdFx0fSksXHJcblx0XHRcdFx0XHR3YWxrZXJKdW5jdGlvblJ1bGVzOnRoaXMuanVuY3Rpb25FeGl0cyxcclxuXHRcdFx0XHR9LFxyXG5cdFx0XHRcdHBhdGgyOlxyXG5cdFx0XHRcdHtcclxuXHRcdFx0XHRcdG5vZGVEaXNwbGF5Om5ldyBDaXJjbGVEaXNwbGF5KFxyXG5cdFx0XHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0XHRcdGZpbGxDb2xvcjpcIjAwQTVGRmZmXCIsYm9yZGVyQ29sb3I6XCIwMDAwMDBmZlwiLFxyXG5cdFx0XHRcdFx0XHRcdFx0c2VsZWN0RmlsbENvbG9yOlwiMjBmZjIwZmZcIixzZWxlY3RCb3JkZXJDb2xvcjpcIjAwMDBmZmZmXCIsXHJcblx0XHRcdFx0XHRcdFx0XHRib3JkZXJXaWR0aDoxLFxyXG5cdFx0XHRcdFx0XHRcdFx0cmFkaXVzOnRoaXMud29ybGREZWZhdWx0cy53YWxrZXJSYWRpdXNEZWZhdWx0LzEuMjUsXHJcblx0XHRcdFx0XHRcdFx0XHR3aWR0aDoodGhpcy53b3JsZERlZmF1bHRzLndhbGtlclJhZGl1c0RlZmF1bHQvMS4yNSkqMixcclxuXHRcdFx0XHRcdFx0XHRcdGhlaWdodDoodGhpcy53b3JsZERlZmF1bHRzLndhbGtlclJhZGl1c0RlZmF1bHQvMS4yNSkqMixcclxuXHRcdFx0XHRcdFx0XHRcdGNsb25lOmZhbHNlXHJcblx0XHRcdFx0XHRcdFx0fSksXHJcblx0XHRcdFx0XHR3YWxrZXJKdW5jdGlvblJ1bGVzOnRoaXMuanVuY3Rpb25FeGl0cyxcdFx0XHJcblx0XHRcdFx0fSxcclxuXHRcdFx0XHRwYXRoMzpcclxuXHRcdFx0XHR7XHJcblx0XHRcdFx0XHRub2RlRGlzcGxheTpuZXcgQ2lyY2xlRGlzcGxheShcclxuXHRcdFx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdFx0XHRmaWxsQ29sb3I6XCJBNUZGMDBmZlwiLGJvcmRlckNvbG9yOlwiMDAwMDAwZmZcIixcclxuXHRcdFx0XHRcdFx0XHRcdHNlbGVjdEZpbGxDb2xvcjpcIjIwZmYyMGZmXCIsc2VsZWN0Qm9yZGVyQ29sb3I6XCIwMDAwZmZmZlwiLFxyXG5cdFx0XHRcdFx0XHRcdFx0Ym9yZGVyV2lkdGg6MSxcclxuXHRcdFx0XHRcdFx0XHRcdHJhZGl1czp0aGlzLndvcmxkRGVmYXVsdHMud2Fsa2VyUmFkaXVzRGVmYXVsdC8xLjI1LFxyXG5cdFx0XHRcdFx0XHRcdFx0d2lkdGg6KHRoaXMud29ybGREZWZhdWx0cy53YWxrZXJSYWRpdXNEZWZhdWx0LzEuMjUpKjIsXHJcblx0XHRcdFx0XHRcdFx0XHRoZWlnaHQ6KHRoaXMud29ybGREZWZhdWx0cy53YWxrZXJSYWRpdXNEZWZhdWx0LzEuMjUpKjIsXHJcblx0XHRcdFx0XHRcdFx0XHRjbG9uZTpmYWxzZVxyXG5cdFx0XHRcdFx0XHRcdH0pLFxyXG5cdFx0XHRcdFx0d2Fsa2VySnVuY3Rpb25SdWxlczp0aGlzLmp1bmN0aW9uRXhpdHMsXHJcblx0XHRcdFx0fSxcclxuXHRcdFx0XHR0ZXN0aW5nOlxyXG5cdFx0XHRcdHtcclxuXHRcdFx0XHRcdG5vZGVEaXNwbGF5Om5ldyBDaXJjbGVEaXNwbGF5KFxyXG5cdFx0XHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0XHRcdGZpbGxDb2xvcjpcIkE1RkYwMGZmXCIsYm9yZGVyQ29sb3I6XCIwMDAwMDBmZlwiLFxyXG5cdFx0XHRcdFx0XHRcdFx0c2VsZWN0RmlsbENvbG9yOlwiMjBmZjIwZmZcIixzZWxlY3RCb3JkZXJDb2xvcjpcIjAwMDBmZmZmXCIsXHJcblx0XHRcdFx0XHRcdFx0XHRib3JkZXJXaWR0aDoxLFxyXG5cdFx0XHRcdFx0XHRcdFx0cmFkaXVzOnRoaXMud29ybGREZWZhdWx0cy53YWxrZXJSYWRpdXNEZWZhdWx0KjMsXHJcblx0XHRcdFx0XHRcdFx0XHR3aWR0aDoodGhpcy53b3JsZERlZmF1bHRzLndhbGtlclJhZGl1c0RlZmF1bHQqMykqMixcclxuXHRcdFx0XHRcdFx0XHRcdGhlaWdodDoodGhpcy53b3JsZERlZmF1bHRzLndhbGtlclJhZGl1c0RlZmF1bHQqMykqMixcclxuXHRcdFx0XHRcdFx0XHRcdGNsb25lOmZhbHNlXHJcblx0XHRcdFx0XHRcdFx0fSksXHJcblx0XHRcdFx0XHR3YWxrZXJKdW5jdGlvblJ1bGVzOnRoaXMuanVuY3Rpb25FeGl0cyxcclxuXHRcdFx0XHR9LFxyXG5cdFx0XHR9LFxyXG5cdFx0fTtcclxuXHRcdFxyXG5cdH1cclxuXHRcclxuXHRnZXRQYXRoUGFydHMoKVxyXG5cdHtcclxuXHRcdHJldHVybih0aGlzLnBhdGhQYXJ0cyk7XHJcblx0fVxyXG5cdFxyXG5cdGdldFBhdGhEZWYoKVxyXG5cdHtcclxuXHRcdHJldHVybih0aGlzLnBhdGhEZWZzKTtcclxuXHR9XHJcblx0XHJcblx0Z2V0V29ybGREaXNwYWx5KClcclxuXHR7XHJcblx0XHRyZXR1cm4odGhpcy53b3JsZERpc3BsYXkpO1xyXG5cdH1cclxuXHRcclxuXHRnZXRXYWxrZXJKdW5jdGlvblJ1bGVzKClcclxuXHR7XHJcblx0XHRyZXR1cm4odGhpcy5qdW5jdGlvbkV4aXRzKTtcclxuICAgXHR9XHJcblx0XHJcblx0Z2V0V29ybGREZWZhdWx0cygpXHJcblx0e1xyXG5cclxuXHRcdHJldHVybih0aGlzLndvcmxkRGVmYXVsdHMpO1xyXG5cdH1cclxuXHRcclxuXHQvL3N0YXRpYyBpbml0SnVuY3Rpb25EaXNwbGF5KG5vZGUpXHJcblx0aW5pdEp1bmN0aW9uRGlzcGxheShub2RlKVxyXG5cdHtcclxuXHRcdGNvbnNvbGUubG9nKFwiaW5zaWRlIGluaXRKdW5jdGlvbkRpc3BsYXkgZm9yIG5hbWU9XCIrbm9kZS5uYW1lKTtcclxuXHRcdG5vZGUuZ3JhcGhEYXRhLm5vZGVEaXNwbGF5ID0gbmV3IEp1bmN0aW9uRGlzcGxheShcclxuXHRcdFx0XHR7XHJcblx0XHRcdFx0XHRmaWxsQ29sb3I6XCJhMGEwZmZmZlwiLFxyXG5cdFx0XHRcdFx0Ym9yZGVyQ29sb3I6XCIwMDAwMDBmZlwiLFxyXG5cdFx0XHRcdFx0c2VsZWN0RmlsbENvbG9yOlwiZmZmZjAwZmZcIixcclxuXHRcdFx0XHRcdHNlbGVjdEJvcmRlckNvbG9yOlwiMDAwMGZmZmZcIixcclxuXHRcdFx0XHRcdGJvcmRlcldpZHRoOjIsXHJcblx0XHRcdFx0XHRmb250U3R5bGU6XCJib2xkXCIsXHJcblx0XHRcdFx0XHRmb250UGl4ZWxIZWlnaHQ6MTUsXHJcblx0XHRcdFx0XHRmb250RmFjZTpcIkFyaWFsXCIsXHJcblx0XHRcdFx0XHRyZWN0Qm9yZGVyQ29sb3I6XCIwMDAwZmZmZlwiLFxyXG5cdFx0XHRcdFx0cmVjdEZpbGxDb2xvcjpcImZmZmZmZmZmXCIsXHJcblx0XHRcdFx0XHRmb250Q29sb3I6XCIwMDAwZmZmZlwiLFxyXG5cdFx0XHRcdFx0Y2xvbmU6ZmFsc2VcclxuXHRcdFx0XHR9KTtcclxuXHRcdC8vbm9kZS5ncmFwaERhdGEubm9kZURpc3BsYXkuY2xvbmU9ZmFsc2U7XHJcblx0XHRub2RlLmdyYXBoRGF0YS50ZXh0U3BhY2VyID0gNTtcclxuXHRcdC8vbm9kZS5ncmFwaERhdGEucmFkaXVzID0gdGhpcy53b3JsZERlZmF1bHRzLmp1bmN0aW9uUmFkaXVzRGVmYXVsdCozO1xyXG5cdFx0bm9kZS5ncmFwaERhdGEucmFkaXVzID0gMTU7XHJcblx0XHRub2RlLmdyYXBoRGF0YS53aWR0aCA9IG5vZGUuZ3JhcGhEYXRhLnJhZGl1cyoyO1xyXG5cdFx0bm9kZS5ncmFwaERhdGEuaGVpZ2h0ID0gbm9kZS5ncmFwaERhdGEucmFkaXVzKjI7XHJcblx0XHRpZihub2RlLmdyYXBoRGF0YS5ub2Rlcz09bnVsbCkgbm9kZS5ncmFwaERhdGEubm9kZXMgPSBuZXcgQXJyYXkoKTtcclxuXHR9XHJcblx0XHJcblx0XHJcblx0Z2V0UGF0aEFycmF5KClcclxuXHR7XHJcblx0XHR2YXIgYWxsUGF0aEFycmF5ID0gW107XHJcblx0XHRmb3IodmFyIGk9MDtpPHRoaXMucGF0aERlZnMubGVuZ3RoO2krKylcclxuXHRcdHtcclxuXHRcdFx0dmFyIHBhdGhEZWYgPSB0aGlzLnBhdGhEZWZzW2ldOyBcclxuXHRcdFx0Zm9yKHZhciBub2RlTG9vcD0wO25vZGVMb29wPHBhdGhEZWYubnVtYmVyTm9kZXM7bm9kZUxvb3ArKylcclxuXHRcdFx0e1xyXG5cdFx0XHRcdHZhciBwYXRoQXJyYXkgPSBbXTtcclxuXHRcdFx0XHRmb3IodmFyIGo9MDtqPHBhdGhEZWYucGF0aC5sZW5ndGg7aisrKVxyXG5cdFx0XHRcdHtcclxuXHRcdFx0XHRcdHZhciBwYXRoTmFtZSA9IHBhdGhEZWYucGF0aFtqXTtcclxuXHRcdFx0XHRcdHZhciBwYXRoRGVmTmFtZSA9IHBhdGhEZWYucGF0aERlZk5hbWU7XHJcblx0XHRcdFx0XHQvL2NvbnNvbGUubG9nKFwiICAgZG9pbmcgcGF0aERlZk5hbWU9XCIrcGF0aERlZk5hbWUrXCIgcGF0aE5hbWU9XCIrcGF0aE5hbWUpO1xyXG5cdFx0XHRcdFx0Zm9yKHZhciBrPTA7azx0aGlzLnBhdGhQYXJ0c1twYXRoTmFtZV0ubGVuZ3RoO2srKylcclxuXHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0Ly9jb25zb2xlLmxvZyhcIiAgICAgICAgICAgICAgIGp1bmN0aW9uPVwiK3BhdGhQYXJ0c1twYXRoTmFtZV1ba10pO1xyXG5cdFx0XHRcdFx0XHRwYXRoQXJyYXkucHVzaCh0aGlzLnBhdGhQYXJ0c1twYXRoTmFtZV1ba10pO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRhbGxQYXRoQXJyYXkucHVzaChcclxuXHRcdFx0XHR7XHJcblx0XHRcdFx0XHRwYXRoRGVmOnBhdGhEZWYsXHJcblx0XHRcdFx0XHRwYXRoOnBhdGhBcnJheVxyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHRcdC8vY29uc29sZS5sb2coXCIjXCIraStcIiBwYXRoQXJyYXkgc2l6ZT1cIitwYXRoQXJyYXkubGVuZ3RoK1wiIG5hbWU9XCIrcGF0aERlZi5wYXRoRGVmTmFtZSk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdC8vQ29tbW9uc2h1ZmZsZUFycmF5KGFsbFBhdGhBcnJheSk7XHJcblx0XHRyZXR1cm4oYWxsUGF0aEFycmF5KTtcclxuXHR9XHJcblx0XHJcblx0aW5pdEN1c3RvbU5vZGVzKHdvcmxkKVxyXG5cdHtcclxuXHRcdHZhciBwYXRoQXJyYXkgPSB0aGlzLmdldFBhdGhBcnJheSgpO1xyXG5cdFx0XHJcblx0XHR2YXIgbm93ID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XHJcblx0XHQvL25vdyA9IE1hdGguZmxvb3Iobm93LzEwMDApO1xyXG5cdFx0Ly9ub3cgPSBub3cvMTAwMDtcclxuXHRcdC8vdmFyIGxhc3RUaW1lID0gbm93O1xyXG5cdFx0XHJcblx0XHRmb3IodmFyIGk9MDtpPHBhdGhBcnJheS5sZW5ndGg7aSsrKVxyXG5cdFx0e1xyXG5cdFx0XHR2YXIgbGFzdFRpbWUgPSBub3c7XHJcblx0XHRcdHZhciBwZCA9IHBhdGhBcnJheVtpXTtcclxuXHRcdFx0Ly9jb25zb2xlLmxvZyhcIlN0YXJ0IG9mIHdvcmxkVXBkYXRlOlwiK0NvbW1vbnRvU3RyaW5nKHBkKSk7XHJcblx0XHRcdFxyXG5cdFx0XHR2YXIgc3RhcnRTcGFjZXIgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkqMzYwMDAwKS0wO1xyXG5cdFx0XHRpZiggKGxhc3RUaW1lK3N0YXJ0U3BhY2VyKSA8IG5vdykgc3RhcnRTcGFjZXIgPSAwO1xyXG5cdFx0XHRmb3IodmFyIGo9MDtqPHBkLnBhdGgubGVuZ3RoO2orKylcclxuXHRcdFx0e1xyXG5cdFx0XHRcdHZhciBzcGFjZXIgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkqODAwMCkrMTAwMDtcclxuXHRcdFx0XHRsYXN0VGltZSArPSBzcGFjZXI7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0Ly9jb25zb2xlLmxvZyhcImFkZGluZyA6IHBhdGhOYW1lPVwiK3BkLnBhdGhEZWYucGF0aERlZk5hbWUrXCIganVuY3Rpb249XCIrcGQucGF0aFtqXSk7XHJcblx0XHJcblx0XHRcdFx0dmFyIHdvcmxkVXBkYXRlID0gbmV3IFdvcmxkVXBkYXRlKFxyXG5cdFx0XHRcdFx0XHRwZC5wYXRoW2pdLFxyXG5cdFx0XHRcdFx0XHRwZC5wYXRoRGVmLnBhdGhEZWZOYW1lK1wiLlwiK2ksXHJcblx0XHRcdFx0XHRcdGxhc3RUaW1lK3N0YXJ0U3BhY2VyLFxyXG5cdFx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdFx0d2FrbGVyTmFtZTpwZC5wYXRoRGVmLnBhdGhEZWZOYW1lK1wiLlwiK2ksXHJcblx0XHRcdFx0XHRcdFx0d2Fsa2VyVHlwZUtleTpwZC5wYXRoRGVmLnBhdGhEZWZOYW1lXHJcblx0XHRcdFx0XHRcdH0sXHJcblx0XHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0XHRqdW5jdGlvbk5hbWU6cGQucGF0aFtqXSxcclxuXHRcdFx0XHRcdFx0XHRqdW5jdGlvblR5cGVLZXk6XCJnZW5lcmljSnVuY3Rpb25cIlxyXG5cdFx0XHRcdFx0XHR9LFxyXG5cdFx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdFx0cGF0aFR5cGVLZXk6XCJnZW5lcmljXCJcclxuXHRcdFx0XHRcdFx0fSxcclxuXHRcdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRcdHN0YXR1czpcIkluIFByb2dyZXNzXCJcclxuXHRcdFx0XHRcdFx0fSk7IC8vIDIzLUpBTi0xNyAwNi4zNS4xNCBBTVxyXG5cdFx0XHRcdGNvbnNvbGUubG9nKFwiYWRkaW5nIDogcGF0aE5hbWU9XCIrcGQucGF0aERlZi5wYXRoRGVmTmFtZStcIiBqdW5jdGlvbj1cIitwZC5wYXRoW2pdK1wiIHRzPVwiK3dvcmxkVXBkYXRlLnByb2Nlc3NUaW1lc3RhbXApO1xyXG5cclxuXHRcdFx0XHR3b3JsZC5hZGRUb1dvcmxkVXBkYXRlUXVldWUod29ybGRVcGRhdGUpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG59XHJcblxyXG4vLzxqczJub2RlPlxyXG5tb2R1bGUuZXhwb3J0cyA9IERlbW9HcmFwaDFHcmFwaFBhdGhXb3JsZERlZjtcclxuY29uc29sZS5sb2coXCJMb2FkaW5nOkRlbW9HcmFwaDFHcmFwaFBhdGhXb3JsZERlZlwiKTtcclxuLy88L2pzMm5vZGU+IiwidmFyIERlbW9HcmFwaDFHcmFwaFBhdGhXb3JsZERlZiA9IHJlcXVpcmUoJy4vZGVtb2dyYXBoMXBhdGh3b3JsZGRlZicpO1xyXG52YXIgQ29tbW9uID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL2NvbW1vbicpO1xyXG52YXIgV29ybGRVcGRhdGUgPSByZXF1aXJlKCcuLi8uLi9wYXRocy93b3JsZHVwZGF0ZScpO1xyXG52YXIgUHVzaFdvcmxkVXBkYXRlID0gcmVxdWlyZSgnLi4vLi4vcGF0aHNleHAvcGF0aHNlcnZlci9wdXNod29ybGR1cGRhdGUnKTtcclxudmFyIHdvcmxkRGVmID0gbmV3IERlbW9HcmFwaDFHcmFwaFBhdGhXb3JsZERlZigpO1x0XHRcclxudmFyIHBvcnQgPSB3b3JsZERlZi5nZXRXb3JsZERlZmF1bHRzKCkucG9ydDtcclxuXHJcblxyXG5jbGFzcyBQdXNoRGVtb0dyYXAxaCB7XHJcblxyXG5cdGNvbnN0cnVjdG9yKClcclxuXHR7XHJcblx0XHRjb25zb2xlLmxvZyhcIkdvdCBuZXcgUHVzaERlbW9HcmFwMWhcIik7XHJcblx0fVxyXG5cclxuXHRpbml0Q3VzdG9tTm9kZXMod29ybGQpXHJcblx0e1xyXG5cdFx0dmFyIHBhdGhBcnJheSA9IHRoaXMuZ2V0UGF0aEFycmF5KCk7XHJcblx0XHRcclxuXHRcdHZhciBub3cgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcclxuXHRcdFxyXG5cdFx0Zm9yKHZhciBpPTA7aTxwYXRoQXJyYXkubGVuZ3RoO2krKylcclxuXHRcdHtcclxuXHRcdFx0dmFyIGxhc3RUaW1lID0gbm93O1xyXG5cdFx0XHR2YXIgcGQgPSBwYXRoQXJyYXlbaV07XHJcblx0XHRcdC8vY29uc29sZS5sb2coXCJTdGFydCBvZiB3b3JsZFVwZGF0ZTpcIitDb21tb250b1N0cmluZyhwZCkpO1xyXG5cdFx0XHRcclxuXHRcdFx0dmFyIHN0YXJ0U3BhY2VyID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpKjM2MDAwMCktMDtcclxuXHRcdFx0aWYoIChsYXN0VGltZStzdGFydFNwYWNlcikgPCBub3cpIHN0YXJ0U3BhY2VyID0gMDtcclxuXHRcdFx0Zm9yKHZhciBqPTA7ajxwZC5wYXRoLmxlbmd0aDtqKyspXHJcblx0XHRcdHtcclxuXHRcdFx0XHR2YXIgc3BhY2VyID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpKjgwMDApKzEwMDA7XHJcblx0XHRcdFx0bGFzdFRpbWUgKz0gc3BhY2VyO1xyXG5cclxuXHRcdFx0XHR2YXIgd29ybGRVcGRhdGUgPSBuZXcgV29ybGRVcGRhdGUoXHJcblx0XHRcdFx0XHRcdHBkLnBhdGhbal0sXHJcblx0XHRcdFx0XHRcdHBkLnBhdGhEZWYucGF0aERlZk5hbWUrXCIuXCIraSxcclxuXHRcdFx0XHRcdFx0bGFzdFRpbWUrc3RhcnRTcGFjZXIsXHJcblx0XHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0XHR3YWtsZXJOYW1lOnBkLnBhdGhEZWYucGF0aERlZk5hbWUrXCIuXCIraSxcclxuXHRcdFx0XHRcdFx0XHR3YWxrZXJUeXBlS2V5OnBkLnBhdGhEZWYucGF0aERlZk5hbWVcclxuXHRcdFx0XHRcdFx0fSxcclxuXHRcdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRcdGp1bmN0aW9uTmFtZTpwZC5wYXRoW2pdLFxyXG5cdFx0XHRcdFx0XHRcdGp1bmN0aW9uVHlwZUtleTpcImdlbmVyaWNKdW5jdGlvblwiXHJcblx0XHRcdFx0XHRcdH0sXHJcblx0XHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0XHRwYXRoVHlwZUtleTpcImdlbmVyaWNcIlxyXG5cdFx0XHRcdFx0XHR9LFxyXG5cdFx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdFx0c3RhdHVzOlwiSW4gUHJvZ3Jlc3NcIlxyXG5cdFx0XHRcdFx0XHR9KTsgLy8gMjMtSkFOLTE3IDA2LjM1LjE0IEFNXHJcblx0XHRcdFx0Y29uc29sZS5sb2coXCJhZGRpbmcgOiBwYXRoTmFtZT1cIitwZC5wYXRoRGVmLnBhdGhEZWZOYW1lK1wiIGp1bmN0aW9uPVwiK3BkLnBhdGhbal0rXCIgdHM9XCIrd29ybGRVcGRhdGUucHJvY2Vzc1RpbWVzdGFtcCk7XHJcblxyXG5cdFx0XHRcdC8vdmFyIHB1c2hXb3JsZFVwZGF0ZSA9IG5ldyBQdXNoV29ybGRVcGRhdGUoKTtcclxuXHRcdFx0XHR3b3JsZC5hZGRUb1dvcmxkVXBkYXRlUXVldWUoV29ybGRVcGRhdGUuY3JlYXRlV29ybGRVcGRhdGVGcm9tSnNvbih3b3JsZFVwZGF0ZSkpO1xyXG5cclxuXHRcdFx0XHQvL3B1c2hXb3JsZFVwZGF0ZS5zZW5kVG9TZXJ2ZXIod29ybGRVcGRhdGUpO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRnZXRQYXRoQXJyYXkoKVxyXG5cdHtcclxuXHRcdHZhciBhbGxQYXRoQXJyYXkgPSBbXTtcclxuXHRcdGZvcih2YXIgaT0wO2k8d29ybGREZWYucGF0aERlZnMubGVuZ3RoO2krKylcclxuXHRcdHtcclxuXHRcdFx0dmFyIHBhdGhEZWYgPSB3b3JsZERlZi5wYXRoRGVmc1tpXTsgXHJcblx0XHRcdGZvcih2YXIgbm9kZUxvb3A9MDtub2RlTG9vcDxwYXRoRGVmLm51bWJlck5vZGVzO25vZGVMb29wKyspXHJcblx0XHRcdHtcclxuXHRcdFx0XHR2YXIgcGF0aEFycmF5ID0gW107XHJcblx0XHRcdFx0Zm9yKHZhciBqPTA7ajxwYXRoRGVmLnBhdGgubGVuZ3RoO2orKylcclxuXHRcdFx0XHR7XHJcblx0XHRcdFx0XHR2YXIgcGF0aE5hbWUgPSBwYXRoRGVmLnBhdGhbal07XHJcblx0XHRcdFx0XHR2YXIgcGF0aERlZk5hbWUgPSBwYXRoRGVmLnBhdGhEZWZOYW1lO1xyXG5cdFx0XHRcdFx0Ly9jb25zb2xlLmxvZyhcIiAgIGRvaW5nIHBhdGhEZWZOYW1lPVwiK3BhdGhEZWZOYW1lK1wiIHBhdGhOYW1lPVwiK3BhdGhOYW1lKTtcclxuXHRcdFx0XHRcdGZvcih2YXIgaz0wO2s8d29ybGREZWYucGF0aFBhcnRzW3BhdGhOYW1lXS5sZW5ndGg7aysrKVxyXG5cdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHQvL2NvbnNvbGUubG9nKFwiICAgICAgICAgICAgICAganVuY3Rpb249XCIrcGF0aFBhcnRzW3BhdGhOYW1lXVtrXSk7XHJcblx0XHRcdFx0XHRcdHBhdGhBcnJheS5wdXNoKHdvcmxkRGVmLnBhdGhQYXJ0c1twYXRoTmFtZV1ba10pO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRhbGxQYXRoQXJyYXkucHVzaChcclxuXHRcdFx0XHR7XHJcblx0XHRcdFx0XHRwYXRoRGVmOnBhdGhEZWYsXHJcblx0XHRcdFx0XHRwYXRoOnBhdGhBcnJheVxyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHRcdC8vY29uc29sZS5sb2coXCIjXCIraStcIiBwYXRoQXJyYXkgc2l6ZT1cIitwYXRoQXJyYXkubGVuZ3RoK1wiIG5hbWU9XCIrcGF0aERlZi5wYXRoRGVmTmFtZSk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdC8vQ29tbW9uc2h1ZmZsZUFycmF5KGFsbFBhdGhBcnJheSk7XHJcblx0XHRyZXR1cm4oYWxsUGF0aEFycmF5KTtcclxuXHR9XHJcbn1cclxuXHJcbi8vPGpzMm5vZGU+XHJcbm1vZHVsZS5leHBvcnRzID0gUHVzaERlbW9HcmFwMWg7XHJcbmNvbnNvbGUubG9nKFwiTG9hZGluZzpQdXNoRGVtb0dyYXAxaFwiKTtcclxuLy88L2pzMm5vZGU+XHJcbiIsIlxyXG52YXIgQ29tbW9uID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL2NvbW1vbicpO1xyXG52YXIgaHR0cCA9IHJlcXVpcmUoJ2h0dHAnKTtcclxuXHJcblxyXG5jbGFzcyBQdXNoV29ybGRVcGRhdGVcclxue1xyXG5cdGNvbnN0cnVjdG9yKGNhbnZhc0hvbGRlcilcclxuXHR7XHJcblx0fVxyXG5cdFxyXG5cdHNlbmRUb1NlcnZlcih3b3JsZFVwZGF0ZSlcclxuXHR7XHRcclxuXHRcdHZhciBvcHRpb25zID1cclxuXHRcdHtcclxuICBcdFx0XHRob3N0OiAnMTI3LjAuMC4xJyxcclxuICBcdFx0XHRwb3J0IDogMzAwMCxcclxuICBcdFx0XHRwYXRoOiAnL3BhdGhzL215Q2FudmFzL3VwZGF0ZS8nXHJcblx0XHR9O1xyXG5cdFx0XHJcblx0XHR2YXIgZW5jb2RlZFdvcmxkVXBkYXRlID0gQ29tbW9uLmpzb25Ub1VSSSh3b3JsZFVwZGF0ZSk7XHJcblx0XHRjb25zb2xlLmxvZyhcInNlbmRpbmcgOiBcIitlbmNvZGVkV29ybGRVcGRhdGUpO1xyXG5cdFx0b3B0aW9ucy5wYXRoICs9IGVuY29kZWRXb3JsZFVwZGF0ZTtcclxuXHRcdGh0dHAucmVxdWVzdChvcHRpb25zLFxyXG5cdFx0XHRmdW5jdGlvbihyZXNwb25zZSlcclxuXHRcdFx0e1xyXG5cdFx0XHRcdHZhciBzZWxmID0gdGhpcztcclxuXHRcdFx0ICBcdHZhciBzdHIgPSAnJztcclxuXHRcdFx0XHJcblx0XHRcdCAgXHQvL2Fub3RoZXIgY2h1bmsgb2YgZGF0YSBoYXMgYmVlbiByZWNpZXZlZCwgc28gYXBwZW5kIGl0IHRvIGBzdHJgXHJcblx0XHRcdCAgXHRyZXNwb25zZS5vbignZGF0YScsIGZ1bmN0aW9uIChjaHVuaylcclxuXHRcdFx0ICBcdHtcclxuXHRcdFx0ICAgIFx0c3RyICs9IGNodW5rO1xyXG5cdFx0XHQgIFx0fSk7XHJcblx0XHRcdFxyXG5cdFx0XHQgIFx0Ly90aGUgd2hvbGUgcmVzcG9uc2UgaGFzIGJlZW4gcmVjaWV2ZWQsIHNvIHdlIGp1c3QgcHJpbnQgaXQgb3V0IGhlcmVcclxuXHRcdFx0ICBcdHJlc3BvbnNlLm9uKCdlbmQnLCBmdW5jdGlvbiAoKVxyXG5cdFx0XHRcdHtcclxuXHRcdFx0XHQgIFx0Y29uc29sZS5sb2coc3RyKTtcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0fSkuZW5kKCk7XHJcblx0fVxyXG5cdFxyXG59XHJcblxyXG5cclxuLy88anMybm9kZT5cclxubW9kdWxlLmV4cG9ydHMgPSBQdXNoV29ybGRVcGRhdGU7XHJcbmNvbnNvbGUubG9nKFwiTG9hZGluZzpQdXNoV29ybGRVcGRhdGVcIik7XHJcbi8vPC9qczJub2RlPiJdfQ==
