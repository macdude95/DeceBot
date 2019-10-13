const Command = require('./Command.js');
var player = require('play-sound')(opts = {});

class SoundCommand extends Command {
    constructor(command, filePath, sayInChat, userPermissionsList=[]) {
        super(command, sayInChat, userPermissionsList);
        this.filePath = filePath;
        this.sayInChat = this.closure;
    }

    execute(username, message) {
        var filePath = this.filePath;
        if (username == "decebot") {
            return;
        }
        if (!this.isAllowedFor(username)) {
            this.sayInChat(`Yo ${username}, you are not allowed to use this command: ${this.command}`);
            return;
        }
        var pathToSoundEffects = "C:\\Users\\Michael\\Desktop\\StreamStuff\\SoundEffects\\";

        player.play(pathToSoundEffects + filePath, function(err){
            if (err) {
                console.log(`FAILED - ${username} attempted to play: ${filePath}`)
            } else {
                console.log(`SUCCESS - ${username} played audio: ${filePath}`)
            }
        });
    }
}
module.exports = SoundCommand