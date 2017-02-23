/**
 * Wraps and returns a typed array or ArrayBuffer in a DataView
 *
 * @param  {Mixed}     data A DataView, ArrayBuffer, TypedArray or node Buffer
 * @return {DataView}       A DataView wrapping the passed data
 * @throws {TypeError}      The passed data needs to be of a supported type
 */
export function getAsDataView(data) {
  if (data instanceof DataView) {
    return data
  }
  else if (data instanceof ArrayBuffer) {
    return new DataView(data)
  }
  else if ('buffer' in data) {
    return new DataView(data.buffer)
  }
  else {
    throw new TypeError(`Could not convert data of type ${typeof data} into a DataView.`)
  }
}

/**
 * Returns a string read from some data.
 *
 * This code is directly ported and rewritten from aurora.js's stream.coffee.
 * I have no idea how it works! Might use a library for this if it doesn't
 * work properly.
 *
 * @link https://github.com/audiocogs/aurora.js/blob/master/src/core/stream.coffee#L303
 *
 * @param  {Mixed}  data     A DataView, ArrayBuffer, TypedArray or node Buffer
 * @param  {Number} offset   An offset in bytes to start read the string from
 * @param  {Number} bytes    The number of bytes to read
 * @param  {String} encoding The encoding to parse the text as
 * @return {String}          A string
 */
export function getString(data, offset, bytes, encoding = 'ascii') {
  let result = ''

  const view = getAsDataView(data)

  switch (encoding.toLowerCase()) {
    case 'ascii':
    case 'latin1': {
      for (let i = 0; i < bytes; i++) {
        const charCode = view.getUint8(offset + i)
        if (charCode >= 0) {
          result += String.fromCharCode(charCode)
        }
        else {
          break
        }
      }
      break
    }

    case 'utf8':
    case 'utf-8':
      const nullEnd = length === null ? 0 : -1
      let currOffset = offset
      while (currOffset < offset + bytes) {
        const b1 = view.getUint8(currOffset)

        if (b1 === nullEnd) {
          break
        }

        if (b1 & 0x80 === 0) {
          result += String.fromCharCode(b1)
          currOffset += 1
        }
        // One continuation (128 to 2047)
        else if (b1 & 0xe0 === 0xc0) {
          const b2 = view.getUint8(currOffset + 1)
          result += String.fromCharCode(((b1 & 0x1f) << 6) | b2)
          currOffset += 2
        }
        // Two continuation (2048 to 55295 and 57344 to 65535)
        else if (b1 & 0xf0 === 0xe0) {
          const b2 = view.getUint8(currOffset + 1) & 0x3f
          const b3 = view.getUint8(currOffset + 2) & 0x3f
          result += String.fromCharCode ((b1 & 0x0f) << 12) | (b2 << 6) | b3
          currOffset += 3
        }
        // Three continuation (65536 to 1114111)
        else if (b1 & 0xf8 === 0xf0) {
          const b2 = view.getUint8(currOffset + 1) & 0x3f
          const b3 = view.getUint8(currOffset + 2) & 0x3f
          const b4 = view.getUint8(currOffset + 3) & 0x3f

          // Split into a surrogate pair
          const pt = (((b1 & 0x0f) << 18) | (b2 << 12) | (b3 << 6) | b4) - 0x10000
          result += String.fromCharCode(0xd800 + (pt >> 10), 0xdc00 + (pt & 0x3ff))
          currOffset += 4
        }
      }
      break

    case 'utf16-be':
    case 'utf16be':
    case 'utf16le':
    case 'utf16-le':
    case 'utf16bom':
    case 'utf16-bom':
      let currOffset = offset

      const bom = view.getUin16(offset)
      if (['utf16bom', 'utf16-bom'].indexOf(encoding) >= 0 && bytes < 2 && bom === nullEnd) {
        return result
      }

      // Find endianness
      let isLittleEndian = false

      switch (encoding) {
        case 'utf16le':
        case 'utf16-le':
          isLittleEndian = true
          break

        case 'utf16bom':
        case 'utf16-bom':
          isLittleEndian = bom === 0xfffe
          currOffset += 2
      }

      while (currOffset < offset + bytes) {
        const w1 = view.getUint16(currOffset, isLittleEndian)
        currOffset += 2

        if (w1 === nullEnd) {
          break
        }

        if (w1 < 0xd800 || w1 > 0xdfff) {
          result += String.fromCharCode(w1)
        }
        else {
          if (w1 > 0xdbff) {
            throw new Error(`Invalid utf16 sequence.`)
          }

          const w2 = view.getUin16(currOffset, isLittleEndian)
          if (w2 < 0xdc00 || w2 > 0xdff) {
            throw new Error(`Invalid utf16 sequence.`)
          }

          result += String.fromCharCode(w1, w2)
          currOffset += 2
        }
      }
      break

    default:
      break
  }

  return result
}
