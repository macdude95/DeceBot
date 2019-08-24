var player = require('play-sound')(opts = {});

class SoundEffect {
    constructor(command, filePath, userPermissionsList=[]) {
        this.command = command;
        this.filePath = filePath;
        this.userPermissionsList = userPermissionsList;
    }

    isAllowedFor(username) {
        if (!this.userPermissionsList.length) {
            return true;
        } 
        return this.userPermissionsList.includes(username);
    }

    playSound(username) {
        var filePath = this.filePath;
        if (!this.isAllowedFor(username)) {
            return;
        }

        var pathToSoundEffects = "C:\\Users\\Michael\\Desktop\\StreamStuff\\SoundEffects\\";

        player.play(pathToSoundEffects + filePath, function(err){
            if (err) {
                console.log(`FAILED attempt to play: ${filePath}`)
            } else {
                console.log(`SUCCESS played audio: ${filePath}`)
            }
        });
    }
}
module.exports = SoundEffect