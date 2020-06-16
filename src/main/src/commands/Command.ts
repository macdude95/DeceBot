import {ChatUserstate} from 'tmi.js';

export default abstract class Command {
    public command: string;

    public constructor(command: string) {
        this.command = command;
    }

    public abstract async execute(userstate: ChatUserstate, message: string): Promise<void>

}
