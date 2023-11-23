import { ChatOpenAI } from 'langchain/chat_models/openai';
import { HumanMessage, SystemMessage } from "langchain/schema";
import { injectXML } from './blockly_setup';
import { speechTT } from './bootstrap_setup';
import { savedVariables } from './initial_setup';

/*const template = "Consider you're an assistant robot, your job is to locate, pick up, move, and release objects to specific coordinates.\
    \n{prompt}\
    \nThese are methods that you're provided with:\
    \nlocate_object(obj_name):returns a X,Y,Z tuple representing the location of the desired object defined by string obj_name;\
    \nmove_location(X,Y,Z): moves the robots hands to a specific X,Y,Z location in space. Returns nothing;\
    \ngrab_object(obj_name): picks a particular object defined by “obj_name”. Returns nothing;\
    \nplace_object(obj_name): releases the object defined by “obj_name”. Returns nothing;";
*/
const positions = savedVariables;

const template = "You are an assistant ai, your job is to move a robot, and have that robot pick up and release items.\
These are the blocks you can use with type values. Using these, I want you to write Blockly XML code to do as the user defines.\
move_to_position; this moves to the robot to a given position. the field name \"DROPDOWN_OPTIONS\" that are available are Home and Test, Test2, Test3. This is how the robot knows what position to move to.\
pick_object; this is used to pick up items.\
release_object; this is used to release an item.\
Your job is to listen to what the user wants the robot to do, and convert their requests into Blockly format XML. Create blocks with their types from above and connect them using ordering that is given. You also dont need the beginning <xml> tags!"

let audio_transcript = "";

const chat = new ChatOpenAI({
    openAIApiKey: "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",
    temperature: 0.2
});

export function speechtt() {
    let speech = true;
    window.SpeechRecognition = window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    //recognition.interimResults = true;

    recognition.addEventListener('result', e => {
        const transcript = e.results[0][0].transcript;
        const code = document.getElementById("recording-conversion");
        code.innerHTML = transcript;
        audio_transcript = transcript;
        recognition.stop();
        speech = false;
        sendTranscriptToAI();
        // speechTT.hide();

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

    console.log(response3.generations[0][0].text);

    injectXML(response3.generations[0][0].text);


}