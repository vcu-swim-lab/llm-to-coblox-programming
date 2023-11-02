import axios from 'axios';
import * as fs from 'fs';
import recorder from 'node-record-lpcm16';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { PromptTemplate } from "langchain/prompts";


// Creating test.wav audio file
const file = fs.createWriteStream("test.wav", { encoding: "binary" });

// Customized prompt
const template = "Consider you're an assistant robot, your job is to locate, pick up, move, and release objects to specific coordinates.\
    \n{prompt}\
    \nThese are methods that you're provided with:\
    \nlocate_object(obj_name):returns a X,Y,Z tuple representing the location of the desired object defined by string obj_name;\
    \nmove_location(X,Y,Z): moves the robots hands to a specific X,Y,Z location in space. Returns nothing;\
    \ngrab_object(obj_name): picks a particular object defined by “obj_name”. Returns nothing;\
    \nplace_object(obj_name): releases the object defined by “obj_name”. Returns nothing;";

const promptTemmplate = new PromptTemplate({
    template: template,
    inputVariables: ["prompt"],
});

let audio_transcript = "";

// Recording startes here
const recording = recorder.record();
recording.stream().pipe(file);

// Connecting to Chat model with API key
const chat = new ChatOpenAI({
    openAIApiKey: "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",
    temperature: 1
});

setTimeout(async () => {
    recording.stop();

    try {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        audio_transcript = await transcribe(fs.createReadStream("test.wav")); //transcript of audio

        const formattedTemplate = await promptTemmplate.format({
            prompt: audio_transcript
        });

        const response = await chat.predict(formattedTemplate);

        console.log(response); // AI generates response here

        // Delete the temporary WAV file after transcription
        fs.unlinkSync("test.wav");
    } catch (error) {
        console.error("Error during audio conversion:", error);
    }
}, 15000); // 15 seconds

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
