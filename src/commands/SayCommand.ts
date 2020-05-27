import say from 'say';
import { ChatUserstate } from 'tmi.js';
import { promisify } from 'util';

import Command from './Command';
import { sayInChat } from '../utils';

import config from '../config';


const speak = promisify(say.speak.bind(say));

interface SayLengthPermissions {
    [username: string]: number
}

type SpeechAssist = [string, string];

const speechAssistReplacements:SpeechAssist[] = [
    ['decebot', 'dece bot'],
    ['dece', 'deese'],
    ['nani', 'naw knee']
]

export default class SayCommand extends Command {
    // This is a theoretical memory leak since we are never removing records from here.
    // It's probably fine
    private readonly sayLengthPermissions: SayLengthPermissions = {
        [config.channel]: 0,
    }

    constructor(command: string) {
        super(command);
    }

    public execute = async (user: ChatUserstate, message: string) => {
        const sayText = this.parseCommand(message);
        if (!sayText.length) {
            return;
        }

        const username = user.username as string;

        const maxSayDuration = this.sayLengthPermissions.hasOwnProperty(username) ? this.sayLengthPermissions[username] : config.sayTimeout;
        // const maxSayDuration = config.sayTimeout;

        let cutoffMessage: NodeJS.Timeout|undefined = undefined;
        let speaking = true;
        if (maxSayDuration > 0) {
            cutoffMessage = setTimeout(() => {
                say.stop(err => {
                    if (!err && speaking) {
                        sayInChat(`@${username} your message was too long so I had to cut off.`);
                    }
                });
            }, maxSayDuration);
        }

        try {
            await speak(sayText, config.sayVoice, 1.0);
        } catch (err) {
            console.log(`FAILED text to speech: ${sayText}`)
            if (config.debug) {
                console.error(err);
            }
            return;
        } finally {
            speaking = false;
            if(cutoffMessage) {
                clearTimeout(cutoffMessage);
            }
        }

        console.log(`SUCCESS text to speech: ${sayText}`)
    }

    private parseCommand = (rawText: string): string => {
        return speechAssistReplacements.reduce(
            (str, replacement) => str.replace(replacement[0], replacement[1]),
                rawText.toLowerCase().slice('!say'.length).trim()
        ).trim();
    }
}
