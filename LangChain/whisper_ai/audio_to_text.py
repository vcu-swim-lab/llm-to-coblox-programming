import openai
from langchain.chat_models import ChatOpenAI
import sounddevice as sd
import numpy as np
import wavio


OPENAI_API_KEY = 'API KEY'

# function that accesses microphone and records audio; duration is the time length of the audio file, defult is 10 seconds
def record_audio(filename="output.wav", duration=10, samplerate=44100):
    # Capture the audio
    print(f"Recording for {duration} seconds...")

    # if voice channel gives error, try print(sd.query_devices()) in main
    # It should give you a list of all available audio devices and their properties, including the maximum input channels they support
    # Then specify the device you want or try setting channels to 2
    audio_data = sd.rec(int(samplerate * duration), samplerate=samplerate, channels=1, dtype='float32', device=0)
    sd.wait()

    # Save the audio to a file
    wavio.write(filename, audio_data, samplerate, sampwidth=2)
    print(f"Recording saved to {filename}")
    return filename

if __name__ == "__main__":
    filepath = record_audio()
    print(f"File saved at: {filepath}")
 
    audio_file = open(filepath,"rb")

    openai.api_key = OPENAI_API_KEY

    transcript = openai.Audio.translate("whisper-1",audio_file)
    user_transcript = transcript["text"]

    chat_model = ChatOpenAI(
        temperature = 1,
        openai_api_key = OPENAI_API_KEY
    )

    print(chat_model.predict(user_transcript))