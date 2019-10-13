var tmi = require('tmi.js');
var fs = require("fs");
const OBSController = require('./OBSController.js');
const Command = require('./Command.js');
const SoundCommand = require('./SoundCommand.js');
const SayCommand = require('./SayCommand.js');

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

    // General Sound Effect Commands:
    new SoundCommand("!Tuturu", "Tuturu.mp3", sayInChat),
    new SoundCommand("decess2Hai", "Tuturu.mp3", sayInChat),
    new SoundCommand("!Oof", "Roblox Death Sound Effect.mp3", sayInChat),
    new SoundCommand("!MonkaGigaDude", "monka giga dude.mp3", sayInChat, ["itsdece", "br4c3_dk"]),
    new SoundCommand("!SoClose", "missed it by that much.mp3", sayInChat),
    new SoundCommand("!Dust", "another one bites the dust.mp3", sayInChat),
    new SoundCommand("!Yeah", "Yeah.mp3", sayInChat),
    new SoundCommand("!Nice", "verynice.mp3", sayInChat),

    // DeceBot text commands:
    new Command("!Discord", () => { sayInChat("Join the discord here: https://discord.gg/65jUQ8G"); }),
    
    // Meme Video Commands:
    new Command("!Fortnite", () => { obsController.playVideo("FortniteDance", 9); }),
    new Command("!DontWatch", () => { obsController.playVideo("DontLetYourKidsWatchIt", 7); }, ["itsdece"]),
    new Command("!Wow", () => { obsController.playVideo("Wow", 6); }),
    new Command("!Error", () => { obsController.playVideo("WindowsError", 6); }, ["itsdece"]),
    new Command("!AnotherOne", () => { obsController.playVideo("AnotherOne", 12); }),
    new Command("!DoIt", () => { obsController.playVideo("DoIt", 8); }),

    // Subs Sound Effect Commands:
    new SoundCommand("!Run", "Run Sound Effect.mp3", sayInChat, ["itsdece", "duderonitti"]),
    new SoundCommand("!Awhee", "Awhee.mp3, sayInChat", ["itsdece", "kangat"]),
    new SoundCommand("!Mulligan", "Hercules_Mulligan.mp3", sayInChat, ["itsdece", "br4c3_dk"]),
    new SoundCommand("!DonutAsk", "donut.mp3", sayInChat, ["itsdece", "blakesomething"]),
    new SoundCommand("!Sammich", "sammich.mp3", sayInChat, ["itsdece", "sensei1667"]),
];

var client = new tmi.client(tmiOptions);
client.connect();


client.on("connected", function(a,p) {
    sayInChat("SUP WORLD!");
});

const obsController = new OBSController();


client.on("chat", function(channel, userstate, message, self) {
    if (findCommandInMessage(message)) {
        findCommandInMessage(message).execute(userstate.username, message);
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

