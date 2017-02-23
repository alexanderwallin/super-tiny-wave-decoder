# super-tiny-wave-decoder

[![npm version](https://badge.fury.io/js/super-tiny-wave-decoder.svg)](https://badge.fury.io/js/super-tiny-wave-decoder)

A super tiny WAVE parser and decoder, without any dependencies or unnecessary abstraction layers.

Most of the logic was directly ported from parts of [aurora.js](https://github.com/audiocogs/aurora.js), so lots of ❤️ from here to there!

**Note:** This is terribly similar to [`wav-decoder`](https://github.com/mohayonao/wav-decoder), which I found after making this. There are some minor differences in the API, but if you're fine with the one in `wav-decoder`, you should probably use that one.


## Why?

Sometimes I just want to decode WAVE audio. Sometimes I even just want to parse a WAVE header. All libraries I have found have either too much other stuff I don't need, too abstraced APIs (I don't need it to make the HTTP request for me) or is specifically targeted towards either Node or the web browser.

This library is just a utility that parses WAVE headers and decodes WAVE audio. Nothing more, nothing less.


## Installation

```sh
npm install --save super-tiny-wave-decoder
```


## Usage

```js
import { getWaveHeader, decodeWaveData } from 'super-tiny-wave-decoder'

// Read a wave file somehow
const waveContents = readAudioFileAsAnArrayBufferSomehow('sound.wav')
const waveData = new Uint8Array(waveContents)

// Get WAVE header
const header = getWaveHeader(waveData)

// Get a chunk of 4096 bytes starting after the header and
// decode that chunk
const audioDataChunk = waveData.slice(44, 44 + 4096)
const decodedAudio = decodeWaveData(audioDataChunk, header)

// decodedAudio is now a Float32Array ready to be used as an
// audio buffer
```


## API

### Functions

<dl>
<dt><a href="#getAsDataView">getAsDataView(data)</a> ⇒ <code>DataView</code></dt>
<dd><p>Wraps and returns a typed array or ArrayBuffer in a DataView</p>
</dd>
<dt><a href="#getString">getString(data, offset, bytes, encoding)</a> ⇒ <code>String</code></dt>
<dd><p>Returns a string read from some data.</p>
<p>This code is directly ported and rewritten from aurora.js&#39;s stream.coffee.
I have no idea how it works! Might use a library for this if it doesn&#39;t
work properly.</p>
</dd>
<dt><a href="#getWaveHeader">getWaveHeader(data)</a> ⇒ <code>Object</code></dt>
<dd><p>Parses a chunk of wave data and tries to extract all wave header
info from it.</p>
<p>You can see an overview of the WAVE header format here:
<a href="http://www.topherlee.com/software/pcm-tut-wavformat.html">http://www.topherlee.com/software/pcm-tut-wavformat.html</a></p>
</dd>
<dt><a href="#getWaveDuration">getWaveDuration(header)</a> ⇒ <code>Number</code></dt>
<dd><p>Returns the duration of some wave audio given its header info</p>
</dd>
<dt><a href="#decodeWaveData">decodeWaveData(header, data)</a> ⇒ <code>Float32Array</code></dt>
<dd><p>Decodes a chunk of wave audio data</p>
</dd>
</dl>

<a name="getAsDataView"></a>

### getAsDataView(data) ⇒ <code>DataView</code>
Wraps and returns a typed array or ArrayBuffer in a DataView

**Returns**: <code>DataView</code> - A DataView wrapping the passed data  
**Throws**:

- <code>TypeError</code> The passed data needs to be of a supported type

**Params**

- `data`: <code>Mixed</code> - A DataView, ArrayBuffer, TypedArray or node Buffer

<a name="getString"></a>

### getString(data, offset, bytes, encoding) ⇒ <code>String</code>
Returns a string read from some data.

This code is directly ported and rewritten from aurora.js's stream.coffee.
I have no idea how it works! Might use a library for this if it doesn't
work properly.

**Returns**: <code>String</code> - A string  
**Link**: https://github.com/audiocogs/aurora.js/blob/master/src/core/stream.coffee#L303  
**Params**

- `data`: <code>Mixed</code> - A DataView, ArrayBuffer, TypedArray or node Buffer
- `offset`: <code>Number</code> - An offset in bytes to start read the string from
- `bytes`: <code>Number</code> - The number of bytes to read
- `encoding`: <code>String</code> - The encoding to parse the text as

<a name="getWaveHeader"></a>

### getWaveHeader(data) ⇒ <code>Object</code>
Parses a chunk of wave data and tries to extract all wave header
info from it.

You can see an overview of the WAVE header format here:
http://www.topherlee.com/software/pcm-tut-wavformat.html

**Returns**: <code>Object</code> - An object containing the WAVE header info  
**Throws**:

- <code>Error</code> The passed data needs to be at least 44 bytes long
- <code>Error</code> The passed data needs to match the WAVE header spec

**Params**

- `data`: <code>Mixed</code> - A DataView, ArrayBuffer, TypedArray or node Buffer containing WAVE audio data, more specifically the beginning of a WAVE audio file

<a name="getWaveDuration"></a>

### getWaveDuration(header) ⇒ <code>Number</code>
Returns the duration of some wave audio given its header info

**Returns**: <code>Number</code> - The duration of the WAVE audio in seconds  
**Params**

- `header`: <code>Object</code> - A WAVE header object

<a name="decodeWaveData"></a>

### decodeWaveData(header, data) ⇒ <code>Float32Array</code>
Decodes a chunk of wave audio data

**Returns**: <code>Float32Array</code> - A Float32Array containing decoded audio  
**Throws**:

- <code>Error</code> The bit depth passed in header must be 8, 16, 24, 32 or 64

**Params**

- `header`: <code>Object</code> - A WAVE header object
- `data`: <code>Mixed</code> - A DataView, ArrayBuffer, TypedArray or node Buffer containing WAVE audio data



## Contributing

Do `npm run` to see what's available, and don't be shy sending a pull request!
