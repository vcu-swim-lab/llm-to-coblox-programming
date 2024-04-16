import { speechTT } from "./bootstrap_setup";
import { speechtt } from "./record_init";
import { secondWorkspace } from './blockly_setup.js';
import Blockly from 'blockly'

// const secondDiv = document.getElementById('second-workspace');
// const workArea = document.getElementById('work-area');

window.onresize = resizeWorkspace;

function resizeWorkspace() {
    setTimeout(() => { Blockly.svgResize(secondWorkspace); }, 500);
}

export function voiceToText() {
    console.log("Converting voice to text!");
    speechTT.show();

    window.dispatchEvent(new Event('resize'));

}

var startRecordButton = document.getElementById("start-recording-btn");
startRecordButton.addEventListener("click", startRecordingSpeech);

var speechTranscript = document.getElementById("recording-conversion");

function startRecordingSpeech() {
    speechtt();
    //speechTranscript.innerHTML = "Recording...";
}
