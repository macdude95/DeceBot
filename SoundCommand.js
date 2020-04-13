const Command = require('./Command.js');
var player = require('play-sound')(opts = {});

class SoundCommand extends Command {
    constructor(command, filePath, sayInChat, isSubOnly) {
        super(command, sayInChat, [], isSubOnly);
        this.filePath = filePath;
        this.sayInChat = this.closure;
    }

    execute(userstate, message) {
        const username = userstate.username;
        var filePath = this.filePath;
        if (username == "decebot") {
            return;
        }
        if (!this.isAllowedFor(userstate)) {
            this.sayInChat(`Yo ${username}, you are not allowed to use this command: ${this.command}`);
            return;
        }

        player.play(filePath, function(err){
            if (err) {
                console.log(`FAILED - ${username} attempted to play: ${filePath}`)
            } else {
                console.log(`SUCCESS - ${username} played audio: ${filePath}`)
            }
        });
    }
}
module.exports = SoundCommand