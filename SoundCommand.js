const Command = require('./Command.js');
var player = require('play-sound')(opts = {});

class SoundCommand extends Command {
    constructor(command, filePath, userPermissionsList=[]) {
        super(command, userPermissionsList);
        this.filePath = filePath;
    }

    execute(username, message) {
        var filePath = this.filePath;
        if (!this.isAllowedFor(username)) {
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