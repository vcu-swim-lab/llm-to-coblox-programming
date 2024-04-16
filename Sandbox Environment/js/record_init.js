import { ChatOpenAI } from 'langchain/chat_models/openai';
import { HumanMessage, SystemMessage } from "langchain/schema";
import { injectXML } from './blockly_setup';
import { speechTT } from './bootstrap_setup';
import { savedVariables } from './initial_setup';
import { PromptTemplate } from "langchain/prompts";
import { savedPos } from './initial_setup';


/*const template = "Consider you're an assistant robot, your job is to locate, pick up, move, and release objects to specific coordinates.\
    \n{prompt}\
    \nThese are methods that you're provided with:\
    \nlocate_object(obj_name):returns a X,Y,Z tuple representing the location of the desired object defined by string obj_name;\
    \nmove_location(X,Y,Z): moves the robots hands to a specific X,Y,Z location in space. Returns nothing;\
    \ngrab_object(obj_name): picks a particular object defined by “obj_name”. Returns nothing;\
    \nplace_object(obj_name): releases the object defined by “obj_name”. Returns nothing;";
*/

const template = PromptTemplate.fromTemplate("You are an assistant ai, your job is to write Blockly XML code to move a robot and have that robot pick up and release items when commanded.\
These are the blocks you can use with type values. Using these, I want you to write Blockly XML code to do as the user defines.\
move_to_position; this moves to the robot to a given position. the field name \"DROPDOWN_OPTIONS\" that are available are {positions}. This is how the robot knows what position to move to.\
pick_object; this is used to pick up items.\
release_object; this is used to release or drop the current picked up item if the user tells you to.\
Your job is to listen to what the user wants the robot to do, and convert their requests into Blockly XML. Create blocks with their types from above and connect them using ordering that is given. You also dont need the beginning <xml> tags.\
Here is an example input and output: \
input: move the robot to test then pick up the object then move the robot home and release the object\
output: <block type=\"move_to_position\">\
<field name=\"DROPDOWN_OPTIONS\">Test</field>\
<next>\
  <block type=\"pick_object\">\
    <next>\
      <block type=\"move_to_position\">\
        <field name=\"DROPDOWN_OPTIONS\">Home</field>\
        <next>\
          <block type=\"release_object\"></block>\
        </next>\
      </block>\
    </next>\
  </block>\
</next>\
</block>\
if the input has an unavailable position, say invalid in the output.");

let audio_transcript = "";

const chat = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_KEY,
  temperature: 0.2
});

window.SpeechRecognition = window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.continuous = true;
let speech = false;

export function speechtt() {

  const recordbtn = document.getElementById("start-recording-btn");
  // recognition.interimResults = true;


  if (speech) {
    recognition.onend = null;
    recognition.stop();
    speech = false;

    recognition.onresult = (event) => {
      const code = document.getElementById("recording-conversion");
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
        code.innerHTML = transcript;
        audio_transcript = transcript;
      }
      console.log(transcript)
    }
    recordbtn.innerHTML = "Record"
    sendTranscriptToAI();
  } else {
    recordbtn.innerHTML = "Stop"
    recognition.onend = onEnd;
    console.log(recognition)
    recognition.start();
    speech = true;
  }
}

function onEnd() {
  recognition.start();
}

recognition.addEventListener('result', e => {
  const transcript = e.results[0][0].transcript;
  // recognition.stop();
  // speech = false;
  // sendTranscriptToAI();
  // speechTT.hide();

})

async function sendTranscriptToAI() {
  let formattedTemplate = await template.format({ positions: savedPos });
  const response3 = await chat.generate([
    [
      new SystemMessage(
        formattedTemplate
      ),
      new HumanMessage(
        audio_transcript
      ),
    ],
  ]);

  console.log(response3.generations[0][0].text);

  injectXML(response3.generations[0][0].text);


}