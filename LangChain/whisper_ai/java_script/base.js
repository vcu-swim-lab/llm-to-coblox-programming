const recorder = require("node-record-lpcm16");
const OpenAI = require("openai");
const fs = require("fs");

const file = fs.createWriteStream("test.wav", { encoding: "binary" });

const recording = recorder.record();
recording.stream().pipe(file);

setTimeout(async () => {
    recording.stop();

    // Wait for a bit to ensure the file write is completed
    setTimeout(async () => {
        try {
            await audioConvert();
            
            // Delete the temporary WAV file after transcription
            fs.unlinkSync("test.wav");
        } catch (error) {
            console.error("Error during audio conversion:", error);
        }
    }, 1000); // Wait 1 second

}, 5000); // 5 seconds

const openai = new OpenAI({
  apiKey: "API KEY" 
});

const audioConvert = async () => {
  const transcription = await openai.audio.transcriptions.create({
    file: fs.createReadStream("test.wav"),
    model: "whisper-1"
  });
  console.log(transcription);
}
