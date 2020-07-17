import { ChatUserstate } from "tmi.js";

import Command from './Command';
import soundPlayer from 'sound-play';

export default class SoundCommand extends Command {
    filePath: string

    constructor(command: string, filePath: string) {
        super(command);
        this.filePath = filePath;
    }

    public execute = async (userstate: ChatUserstate, message: string) => {
        const filePath = this.filePath;

        await soundPlayer.play(filePath);
    }
}
