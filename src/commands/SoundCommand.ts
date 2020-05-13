import { Userstate } from "tmi.js";
import { SayInChatFunc } from "../utils";

import Command from './Command';
import soundPlayer from 'sound-play';
import * as config from '../../config.json';

export default class SoundCommand extends Command {
    sayInChat: SayInChatFunc
    filePath: string

    constructor(command: string, filePath: string, sayInChat: SayInChatFunc, isSubOnly: boolean) {
        super(command, sayInChat, [], isSubOnly);
        this.filePath = filePath;
        this.sayInChat = sayInChat;
    }

    execute(userstate: Userstate, message: string) {
        const username = userstate.username;
        const filePath = this.filePath;
        if (username == config.botName) {
            return;
        }
        if (!this.isAllowedFor(userstate)) {
            this.sayInChat(`Yo ${username}, you are not allowed to use this command: ${this.command}`);
            return;
        }

        soundPlayer.play(filePath);
    }
}
