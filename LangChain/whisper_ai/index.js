"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = void 0;
const openai_1 = require("langchain/llms/openai");
//Import the PromptTemplate module
const prompts_1 = require("langchain/prompts");
//Import the Chains module
const chains_1 = require("langchain/chains");
//Load environment variables (populate process.env from .env file)
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    //Instantiante the OpenAI model 
    //Pass the "temperature" parameter which controls the RANDOMNESS of the model's output. A lower temperature will result in more predictable output, while a higher temperature will result in more random output. The temperature parameter is set between 0 and 1, with 0 being the most predictable and 1 being the most random
    const model = new openai_1.OpenAI({ temperature: 0.9 });
    //Create the template. The template is actually a "parameterized prompt". A "parameterized prompt" is a prompt in which the input parameter names are used and the parameter values are supplied from external input 
    const template = "Imagine we are working with a robot. The job of this robot is to move, pick up objects, and release objects. The robot can move and release objects to specific coordinates: x, y, and z. The 3 objects available to pickup are: redBox, blueBox, and yellowBox. The main functions you can use are: move_robot(x, y, z): moves the robot to the specified coordinate, pickup(object): picks up the object at that coordinate if there is an object there, release(): drops the object being held. Can you make a Python program that stacks the 3 boxes vertically to form a triangle?";
    //Instantiate "PromptTemplate" passing the prompt template string initialized above and a list of variable names the final prompt template will expect
    const prompt = new prompts_1.PromptTemplate({ template, inputVariables: [] });
    //Instantiate LLMChain, which consists of a PromptTemplate and an LLM. Pass the result from the PromptTemplate and the OpenAI LLM model
    const chain = new chains_1.LLMChain({ llm: model, prompt });
    //Run the chain. Pass the value for the variable name that was sent in the "inputVariables" list passed to "PromptTemplate" initialization call
    const res = yield chain.call([]);
    console.log(res);
});
exports.run = run;
(0, exports.run)();
