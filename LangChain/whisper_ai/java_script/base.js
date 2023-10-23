const recorder = require('node-record-lpcm16')
const fs = require('fs')
 
const file = fs.createWriteStream('test.wav', { encoding: 'binary' })
 
const recording = recorder.record()
recording.stream().pipe(file)

setTimeout(() => {
    recording.stop()
  }, 5000) // 5 seconds
