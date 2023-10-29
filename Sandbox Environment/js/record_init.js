import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: "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"
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
        console.log(transcript);
        recognition.stop();
    })
    if (speech) {
        recognition.start();
    }
}