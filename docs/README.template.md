# super-tiny-wave-decoder

A super tiny WAVE parser and decoder, without any dependencies or unnecessary abstraction layers.

Most of the logic was directly ported from parts of [aurora.js](https://github.com/audiocogs/aurora.js), so lots of ❤️ from here to there!


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

{{>main}}


## Contributing

Do `npm run` to see what's available, and don't be shy sending a pull request!
