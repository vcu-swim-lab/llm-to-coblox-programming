import os
import sys
from langchain.llms import OpenAI
from langchain.chat_models import ChatOpenAI

# Put your api key for 'API_KEY'
os.environ['OPENAI_API_KEY'] = 'API_KEY' 

query = sys.argv[1]

llm = OpenAI()
chat_model = ChatOpenAI()

print(llm.predict(query))
print(chat_model.predict(query))
