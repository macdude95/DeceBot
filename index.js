var tmi = require('tmi.js');
var fs = require("fs");
const path = require('path');
const OBSController = require('./OBSController.js');
const Command = require('./Command.js');
const SoundCommand = require('./SoundCommand.js');
const SayCommand = require('./SayCommand.js');
const Slippi = require('./Slippi.js');

if (process.argv.includes("--help")) {
    console.log("Usage: node index.js [--slippi]");
    return;
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, p) => {
  // console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
  // application specific logging, throwing an error, or other logic here
});

var twitchPermissionsTokens = JSON.parse(fs.readFileSync("twitchPermissionsTokens.json"));
const botName = "DeceBot";
var tmiOptions = {
    options: {
        debug: false
    },
    connection: {
        reconnect: true
    },
    identity: {
        username: botName,
        password: twitchPermissionsTokens[botName]
    },
    channels: ["itsdece"]
}

var commands = [
    // Text to speech command:
    new SayCommand("!Say", message => { sayInChat(message) }),

    // DeceBot text commands:
    new Command("!Discord", () => { sayInChat("Join the discord here: https://discord.gg/65jUQ8G"); }),
    new Command("!Github", () => { sayInChat("Wanna see what my insides look like? https://github.com/micantre/DeceBot"); }),
    new Command("!CupheadWars", () => { sayInChat("The great Cuphead Wars of 2020 is a competition between me and a couple of my coworkers to see who can beat cuphead the fastest. Others in the competition are https://www.twitch.tv/kishkishftw and https://www.twitch.tv/faultymuse"); }),
    new Command("!NewSoundboard", () => { sayInChat("The subscriber sound effect commands are now shared in one collective subscriber soundboard."); }),

    // Sound commands are autimatically added in the code below
];

// Automatically add Sound Commands code from: https://stackoverflow.com/questions/32511789/looping-through-files-in-a-folder-node-js
(async ()=>{
    const soundBoardPath = "C:\\Users\\Michael\\Desktop\\StreamStuff\\Media\\SoundEffects\\SoundBoard";
    const folderPaths = [
        soundBoardPath + "\\General",
        soundBoardPath + "\\SubOnly"
    ];
    try {
        for(const folderPath of folderPaths) {
            const files = await fs.promises.readdir(folderPath);
            const isSubOnly = folderPath.includes("SubOnly");
            var commandsInFolder = [];
            for(const file of files) {
                if (file.includes(".txt")) {
                    continue;
                }
                const fullPath = path.join( folderPath, file );
                var command =`!${file.split(".")[0]}`;
                commands.push(new SoundCommand(command, fullPath, sayInChat, isSubOnly));
                commandsInFolder.push(command);
            }
            fs.writeFile(folderPath + "\\Commands.txt", commandsInFolder.join("\n"), (error) => {});
        }
    } catch(e) {
        console.error( "Exception thrown while generating sound commands:", e );
    } finally {
        console.log( "Loaded all sound commands in %s", soundBoardPath);
    }

})();

var client = new tmi.client(tmiOptions);
client.connect();


client.on("connected", function(a,p) {
    sayInChat("SUP WORLD!");
});

const obsController = new OBSController();
if (process.argv.includes("--slippi")) {
    console.log("String slippi task...");
    const slippi = new Slippi("D:\\Games\\Dolphin\\Slippi\\Games", obsController);
}

client.on("chat", function(channel, userstate, message, self) {
    if (findCommandInMessage(message)) {
        findCommandInMessage(message).execute(userstate, message);
    }
});

function findCommandInMessage(message) {
    for (const command of commands) {
        if (message.toLowerCase().includes(command.command.toLowerCase())) {
            return command;
        }
    }
    return null;
}

function sayInChat(message) {
    client.say("itsdece", message);
    // client.action("itsdece", message);
}

