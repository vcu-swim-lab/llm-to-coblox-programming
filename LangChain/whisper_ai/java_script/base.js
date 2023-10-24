const recorder = require("node-record-lpcm16")
const OpenAI = require("openai")
const fs = require("fs")
 
const file = fs.createWriteStream("test.wav", { encoding: "binary" })

const recording = recorder.record()
recording.stream().pipe(file)

setTimeout(() => {
    recording.stop()
    audioConvert();
  }, 5000) // 5 seconds

const openai = new OpenAI({
  apiKey: "API KEY"
})

// Converting audio to text, prints the transcript
const audioConvert=async()=>{
  const transcription=await openai.audio.transcriptions.create({
    file:fs.createReadStream("test.wav"),
    model:"whisper-1"
  })
  console.log(transcription)
}
