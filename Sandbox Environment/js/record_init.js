import { ChatOpenAI } from 'langchain/chat_models/openai';
import { HumanMessage, SystemMessage } from "langchain/schema";

const template = "Consider you're an assistant robot, your job is to locate, pick up, move, and release objects to specific coordinates.\
    \n{prompt}\
    \nThese are methods that you're provided with:\
    \nlocate_object(obj_name):returns a X,Y,Z tuple representing the location of the desired object defined by string obj_name;\
    \nmove_location(X,Y,Z): moves the robots hands to a specific X,Y,Z location in space. Returns nothing;\
    \ngrab_object(obj_name): picks a particular object defined by “obj_name”. Returns nothing;\
    \nplace_object(obj_name): releases the object defined by “obj_name”. Returns nothing;";

let audio_transcript = "";

const chat = new ChatOpenAI({
    openAIApiKey: "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",
    temperature: 0.2
});

export function speechtt() {
    let speech = true;
    window.SpeechRecognition = window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    // recognition.interimResults = true;

    recognition.addEventListener('result', e => {
        const transcript = e.results[0][0].transcript;
        const code = document.getElementById("recording-conversion");
        code.innerHTML = transcript;
        audio_transcript = transcript;
        recognition.stop();
        sendTranscriptToAI();
    })
    if (speech) {
        recognition.start();
    }
}

async function sendTranscriptToAI() {
    const response3 = await chat.generate([
        [
            new SystemMessage(
                template
            ),
            new HumanMessage(
                audio_transcript
            ),
        ],
    ]);

    const outputArea = document.getElementById("chat-output");
    outputArea.innerHTML = response3.generations[0][0].text;

    console.log(response3.generations[0][0].text)
}