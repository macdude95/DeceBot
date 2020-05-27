import { Command } from ".";
import { ChatUserstate } from "tmi.js";

export default class SimpleCommand extends Command {

    constructor(command: string, private readonly closure: () => Promise<void> | void) {
        super(command);
    }

    public execute = async (userstate: ChatUserstate, message: string) => {
        await this.closure();
    }

}
