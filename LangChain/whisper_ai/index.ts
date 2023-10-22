import { OpenAI } from "langchain/llms/openai";

  //Import the PromptTemplate module
  import { PromptTemplate } from "langchain/prompts";

  //Import the Chains module
  import { LLMChain } from "langchain/chains";

  //Load environment variables (populate process.env from .env file)
  import * as dotenv from "dotenv";
  dotenv.config();

  import { AudioTranscriptLoader } from 'langchain/document_loaders/web/assemblyai';

  export const run = async () => {
      //Instantiante the OpenAI model 
      //Pass the "temperature" parameter which controls the RANDOMNESS of the model's output. A lower temperature will result in more predictable output, while a higher temperature will result in more random output. The temperature parameter is set between 0 and 1, with 0 being the most predictable and 1 being the most random
      const model = new OpenAI({ temperature: 0.9 });

      //Create the template. The template is actually a "parameterized prompt". A "parameterized prompt" is a prompt in which the input parameter names are used and the parameter values are supplied from external input 
      const template = "Imagine we are working with a robot. The job of this robot is to move, pick up objects, and release objects. The robot can move and release objects to specific coordinates: x, y, and z. The 3 objects available to pickup are: redBox, blueBox, and yellowBox. The main functions you can use are: move_robot(x, y, z): moves the robot to the specified coordinate, pickup(object): picks up the object at that coordinate if there is an object there, release(): drops the object being held. Can you make a Python program that stacks the 3 boxes vertically to form a triangle?";

      //Instantiate "PromptTemplate" passing the prompt template string initialized above and a list of variable names the final prompt template will expect
      const prompt = new PromptTemplate({template, inputVariables: []});

      //Instantiate LLMChain, which consists of a PromptTemplate and an LLM. Pass the result from the PromptTemplate and the OpenAI LLM model
      const chain = new LLMChain({ llm: model, prompt });

      //Run the chain. Pass the value for the variable name that was sent in the "inputVariables" list passed to "PromptTemplate" initialization call
      const res = await chain.call([]);
      console.log(res);
  };

  run();