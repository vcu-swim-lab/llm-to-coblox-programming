"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = void 0;
var openai_1 = require("langchain/llms/openai");
//Import the PromptTemplate module
var prompts_1 = require("langchain/prompts");
//Import the Chains module
var chains_1 = require("langchain/chains");
//Load environment variables (populate process.env from .env file)
var dotenv = require("dotenv");
dotenv.config();
var run = function () { return __awaiter(void 0, void 0, void 0, function () {
    var model, template, prompt, chain, res;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                model = new openai_1.OpenAI({ temperature: 0.9 });
                template = "Imagine we are working with a robot. The job of this robot is to move, pick up objects, and release objects. The robot can move and release objects to specific coordinates: x, y, and z. The 3 objects available to pickup are: redBox, blueBox, and yellowBox. The main functions you can use are: move_robot(x, y, z): moves the robot to the specified coordinate, pickup(object): picks up the object at that coordinate if there is an object there, release(): drops the object being held. Can you make a Python program that stacks the 3 boxes vertically to form a triangle?";
                prompt = new prompts_1.PromptTemplate({ template: template, inputVariables: [] });
                chain = new chains_1.LLMChain({ llm: model, prompt: prompt });
                return [4 /*yield*/, chain.call([])];
            case 1:
                res = _a.sent();
                console.log(res);
                return [2 /*return*/];
        }
    });
}); };
exports.run = run;
(0, exports.run)();
