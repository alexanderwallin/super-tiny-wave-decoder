import { getAsDataView, getString } from './dataview-utils.js'

const WaveFormats = {
  [0x0001]: 'lpcm',
  [0x0003]: 'lpcm',
  [0x0006]: 'alaw',
  [0x0007]: 'ulaw',
}

/**
 * Parses a chunk of wave data and tries to extract all wave header
 * info from it.
 *
 * You can see an overview of the WAVE header format here:
 * http://www.topherlee.com/software/pcm-tut-wavformat.html
 *
 * @param  {Mixed}  data A DataView, ArrayBuffer, TypedArray or node Buffer containing WAVE audio data, more specifically the beginning of a WAVE audio file
 * @return {Object}      An object containing the WAVE header info
 * @throws {Error}       The passed data needs to be at least 44 bytes long
 * @throws {Error}       The passed data needs to match the WAVE header spec
 */
export function getWaveHeader(data) {
  const view = getAsDataView(data)

  if (view.byteLength < 44) {
    throw new Error(
      `The passed data is less than 44 bytes long, which is the length of a WAVE header.`
      + ` Are you passing the correct piece of data?`
    )
  }

  const RIFF = readString(view, 0, 4)
  const fileSize = view.getUint32(4, true) // Actual file size - 8 bytes
  const WAVE = readString(view, 8, 4)
  const fmt = readString(view, 12, 4)
  const formatDataLength = view.getUint32(16, true)
  const formatType = view.getUint16(20, true)
  const numberOfChannels = view.getUint16(22, true)
  const sampleRate = view.getUint32(24, true)
  const bytesPerSecond = view.getUint32(28, true)
  const blockAlign = view.getUint16(32, true)
  const bitsPerSample = view.getUint16(34, true)
  // const data = readString(view, 36, 4)
  const dataFileSize = view.getUint32(40, true) // Actual file size - 44 bytes

  if (RIFF !== 'RIFF' || WAVE !== 'WAVE' || fmt !== 'fmt ') {
    throw new Error(
      `The passed data does not seem to be the beginning of a WAVE file:`
      + ` "${RIFF}" should've been "RIFF", "${WAVE}" should've been "WAVE" and "${fmt}" should've been "fmt ".`
    )
  }

  return {
    fileSize,
    formatDataLength,
    formatType,
    numberOfChannels,
    sampleRate,
    bytesPerSecond,
    blockAlign,
    bitsPerSample,
    dataFileSize,
  }
}

/**
 * Returns the duration of some wave audio given its header info
 *
 * @param  {Object} header A WAVE header object
 * @return {Number}        The duration of the WAVE audio in seconds
 */
export function getWaveDuration(header) {
  const { bytesPerSecond, dataFileSize } = header
  return dataFileSize / bytesPerSecond
}

/**
 * Decodes a chunk of wave audio data
 *
 * @param  {Object}       header A WAVE header object
 * @param  {Mixed}        data   A DataView, ArrayBuffer, TypedArray or node Buffer containing WAVE audio data
 * @return {Float32Array}        A Float32Array containing decoded audio
 * @throws {Error}               The bit depth passed in header must be 8, 16, 24, 32 or 64
 */
export function decodeWaveData(header, data) {
  const numSamples = data.length / (header.bitsPerSample / 8)
  const isFloatingPoint = header.formatType === 0x0003
  const isLittleEndian = WaveFormats[header.formatType] === 'lpcm'

  const buffer = data instanceof ArrayBuffer ? data : data.buffer
  const view = new DataView(buffer)

  let output

  if (isFloatingPoint) {
    switch (header.bitsPerSample) {
      case 32:
        output = new Float32Array(numSamples)
        for (let i = 0; i < numSamples; i++) {
          output[i] = view.getFloat32(i * 4, isLittleEndian)
        }
        break
      case 64:
        output = new Float64Array(numSamples)
        for (let i = 0; i < numSamples; i++) {
          output[i] = view.getFloat64(i * 8, isLittleEndian)
        }
        break
      default:
        throw new Error(`Unsupported bit depth: ${header.bitsPerSample}`)
    }
  }
  else {
    switch (header.bitsPerSample) {
      case 8:
        output = new Int8Array(numSamples)
        for (let i = 0; i < numSamples; i++) {
          output[i] = view.getInt8(i)
        }
        break
      case 16:
        output = new Int16Array(numSamples)
        for (let i = 0; i < numSamples; i++) {
          output[i] = view.getInt16(i * 2, isLittleEndian)
        }
        break
      case 24:
        output = new Int32Array(numSamples)
        for (let i = 0; i < numSamples; i++) {
          output[i] = view.getInt24(i * 3, isLittleEndian)
        }
        break
      case 32:
        output = new Int32Array(numSamples)
        for (let i = 0; i < numSamples; i++) {
          output[i] = view.getInt32(i * 4, isLittleEndian)
        }
        break
      default:
        throw new Error(`Unsupported bit depth: ${header.bitsPerSample}`)
    }
  }

  // Convert to a Float32Array suitable for audio playback
  //
  // TODO: Move this to a separate function
  const outputFloat32 = new Float32Array(output.length)
  const sampleDivideBy = Math.pow(2, header.bitsPerSample - 1)

  for (let i = 0; i < output.length; i++) {
    outputFloat32[i] = output[i] / sampleDivideBy
  }

  return outputFloat32
}
