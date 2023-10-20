import openai
from langchain.chat_models import ChatOpenAI
import sounddevice as sd
import numpy as np
import wavio

OPENAI_API_KEY = 'API KEY'

def record_audio(filename="output.wav", duration=15, samplerate=44100):
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

    voice_template = user_transcript

    template = f"""
                Consider you're an assistant robot, your job is to locate, pick up, move, and release objects to specific coordinates.
                {voice_template}
                These are methods that you're provided with: locate_object(obj_name): returns a X,Y,Z tuple representing the location of the desired object defined by string "obj_name";
                move_location(X,Y,Z): moves the robots hands to a specific X,Y,Z location in space. Returns nothing;
                grab_object(obj_name): picks a particular object defined by “obj_name”. Returns nothing;
                place_object(obj_name): releases the object defined by “obj_name”. Returns nothing;
    """

    llm = ChatOpenAI(
        temperature = 1,
        openai_api_key = OPENAI_API_KEY
    )
    
    print(llm.predict(template))