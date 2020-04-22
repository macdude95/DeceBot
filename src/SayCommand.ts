import Command from './Command.js';
import say from 'say';
import { Userstate } from 'tmi.js';
import { SayInChatFunc } from './utils';

interface SayTimeouts {
    [username: string]: number
}

interface SayLengthPermissions {
    [username: string]: number
}

const sayTimeout = 60000;
const sayTimeoutRecord: SayTimeouts = {};
const sayLengthPermissions: SayLengthPermissions = {
    "itsdece": 0,
}

export default class SayCommand extends Command {
    sayInChat: SayInChatFunc;

    constructor(command: string, sayInChat: SayInChatFunc, userPermissionsList=[]) {
        super(command, sayInChat, userPermissionsList);

        this.sayInChat = sayInChat;
    }

    execute(userstate: Userstate, message: string) {
        const username = userstate.username;
        const sayInChat = this.sayInChat;
        const say_text = message.toLowerCase().replace("!say", "").replace("decebot", "dece bot").replace("dece", "deese");
        if (!say_text.length || username == "decebot") {
            return;
        }
        if (sayTimeoutRecord[username]) {
            const lastTime = sayTimeoutRecord[username];
            const elapsedTime = Date.now() - lastTime;
            if (elapsedTime < sayTimeout && !userstate.mod) {
                sayInChat(`Yo ${username}, chill out with the !say command for at least another ${Math.ceil((sayTimeout - elapsedTime)/1000)} seconds`);
                return;
            } else {

            }
        }
        sayTimeoutRecord[username] = Date.now();
        say.speak(say_text, "Microsoft Zira Desktop", 1.0, function(err){ // "Microsoft Zira Desktop"
            if (err) {
                console.log(`FAILED attempt to speak: ${say_text}`)
            } else {
                console.log(`SUCCESS text to speech: ${say_text}`)
            }
            delete sayTimeoutRecord[username];
        });

        const timeout = sayLengthPermissions.hasOwnProperty(username) ? sayLengthPermissions[username] : 10000;

        if (timeout > 0) {
            setTimeout(() => {
                say.stop((err: any) => {
                    if (!err) {
                        sayInChat(`@${username} your message was too long so I had to cut off.`);
                    }
                });
            }, timeout)
        }
    }
}
