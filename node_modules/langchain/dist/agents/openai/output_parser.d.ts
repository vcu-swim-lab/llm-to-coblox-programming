import { AgentAction, AgentFinish, BaseMessage, ChatGeneration } from "../../schema/index.js";
import { AgentActionOutputParser } from "../types.js";
/**
 * Type that represents an agent action with an optional message log.
 */
export type FunctionsAgentAction = AgentAction & {
    messageLog?: BaseMessage[];
};
export declare class OpenAIFunctionsAgentOutputParser extends AgentActionOutputParser {
    lc_namespace: string[];
    static lc_name(): string;
    parse(text: string): Promise<AgentAction | AgentFinish>;
    parseResult(generations: ChatGeneration[]): Promise<AgentFinish | FunctionsAgentAction>;
    /**
     * Parses the output message into a FunctionsAgentAction or AgentFinish
     * object.
     * @param message The BaseMessage to parse.
     * @returns A FunctionsAgentAction or AgentFinish object.
     */
    parseAIMessage(message: BaseMessage): FunctionsAgentAction | AgentFinish;
    getFormatInstructions(): string;
}
