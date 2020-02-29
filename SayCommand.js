const Command = require('./Command.js');
var say = require('say');

var sayTimeout = 60000;
var sayTimeoutRecord = {};
var sayLengthPermissions = {
    "itsdece": 0,
}
var unlimitedSayCommandsList = [
    "itsdece"
];

class SayCommand extends Command {
    constructor(command, sayInChat, userPermissionsList=[]) {
        super(command, null, userPermissionsList);
        this.sayInChat = sayInChat;
    }

    execute(username, message) {
        var sayInChat = this.sayInChat;
        var say_text = message.toLowerCase().replace("!say", "")
        if (!say_text.length || username == "decebot") {
            return;
        }
        if (sayTimeoutRecord[username]) {
            var lastTime = sayTimeoutRecord[username];
            var elapsedTime = Date.now() - lastTime;
            if (elapsedTime < sayTimeout && !unlimitedSayCommandsList.includes(username)) {
                sayInChat(`Yo ${username}, chill out with the !say command for at least another ${Math.ceil((sayTimeout - elapsedTime)/1000)} seconds`);
                return;
            }
        }
        sayTimeoutRecord[username] = Date.now();
        say.speak(say_text, "Microsoft Zira Desktop", 1.0, function(err){ // "Microsoft Zira Desktop"
            if (err) {
                console.log(`FAILED attempt to speak: ${say_text}`)
            } else {
                console.log(`SUCCESS text to speech: ${say_text}`)
            }
        });

        var timeout = sayLengthPermissions.hasOwnProperty(username) ? sayLengthPermissions[username] : 10000;

        if (timeout > 0) {
            setTimeout(function() {
              say.stop((err) => {
                if (!err) {
                  sayInChat(`@${username} your message was too long so I had to cut off.`)
                }        
              });
            }, timeout)
        }
    }
}
module.exports = SayCommand