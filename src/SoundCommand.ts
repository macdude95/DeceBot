import { Userstate } from "tmi.js";
import { SayInChatFunc } from "./utils";

import Command from './Command.js';
import Player from 'play-sound';


const player = Player({});

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
        if (username == "decebot") {
            return;
        }
        if (!this.isAllowedFor(userstate)) {
            this.sayInChat(`Yo ${username}, you are not allowed to use this command: ${this.command}`);
            return;
        }

        player.play(filePath, function(err: any){
            if (err) {
                console.log(`FAILED - ${username} attempted to play: ${filePath}`)
            } else {
                console.log(`SUCCESS - ${username} played audio: ${filePath}`)
            }
        });
    }
}
