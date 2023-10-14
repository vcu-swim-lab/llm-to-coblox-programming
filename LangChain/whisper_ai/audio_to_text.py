import openai
from langchain.chat_models import ChatOpenAI

OPENAI_API_KEY = 'API KEY'

audio_file = open("AUDIO FILE PATH","rb")

openai.api_key = OPENAI_API_KEY

transcript = openai.Audio.translate("whisper-1",audio_file)
user_transcript = transcript["text"]

chat_model = ChatOpenAI(
    temperature = 1,
    openai_api_key = OPENAI_API_KEY
)

print(chat_model.predict(user_transcript))