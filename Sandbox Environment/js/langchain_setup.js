import { speechTT } from "./bootstrap_setup";

export function voiceToText() {
    console.log("Converting voice to text!");
    speechTT.show();
}

var startRecordButton = document.getElementById("start-recording-btn");
startRecordButton.addEventListener("click", startRecordingSpeech);

var speechTranscript = document.getElementById("recording-conversion");

function startRecordingSpeech() {
    speechTranscript.innerHTML = "Recording...";
}