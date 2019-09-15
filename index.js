var tmi = require('tmi.js');
var say = require('say');
var fs = require("fs");
const SoundEffect = require('./SoundEffect.js');

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

var client = new tmi.client(tmiOptions);
client.connect();


client.on("connected", function(a,p) {
    sayInChat("SUP WORLD!");
});

var soundEffects = {
    "!Tuturu": new SoundEffect("!Tuturu", "Tuturu.mp3"),
    "decess2Hai": new SoundEffect("decess2Hai", "Tuturu.mp3"),
    "!Oof": new SoundEffect("!Oof", "Roblox Death Sound Effect.mp3"),
    "!MonkaGigaDude": new SoundEffect("!MonkaGigaDude", "monka giga dude.mp3", ["itsdece", "br4c3_dk"]),
    "!SoClose": new SoundEffect("!SoClose", "missed it by that much.mp3"),
    "!Dust": new SoundEffect("!Dust", "another one bites the dust.mp3"),
    "!Run": new SoundEffect("!Run", "Run Sound Effect.mp3", ["itsdece", "duderonitti"]),
    "!Yeah": new SoundEffect("!Yeah", "Yeah.mp3"),
    "!Awhee": new SoundEffect("!Awhee", "Awhee.mp3", ["itsdece", "kangat"]),
    "!Peg": new SoundEffect("!Peg", "AndPeggy.mp3", ["itsdece", "br4c3_dk"]),
    "!Nice": new SoundEffect("!Nice", "verynice.mp3"),
    "!DonutAsk": new SoundEffect("!DonutAsk", "donut.mp3", ["itsdece", "BlakeSomething"]),
};

var sayTimeout = 60000;
var sayTimeoutRecord = {};
var sayLengthPermissions = {
    "itsdece": 0,
    "br4c3_dk": 0,
}
var unlimitedSayCommandsList = ["itsdece"];

client.on("chat", function(channel, userstate, message, self) {
    // console.log(userstate);
    // TwitchClient.getUser(userstate["user-id"]);
    if(message.includes("!discord")) {
        sayInChat("Join the discord here: https://discord.gg/65jUQ8G")
    } else if(message.includes("!say") && userstate.username != "decebot") {
        speakText(userstate.username, message.replace("!say", ""));
    } else if (soundEffectCommandInMessage(message)) {
        soundEffectCommandInMessage(message).playSound(userstate.username);
    } else {
        //console.log("Nothing to do here...");
    }
});

function soundEffectCommandInMessage(message) {
    for (const key of Object.keys(soundEffects)) {
        if (message.toLowerCase().includes(key.toLowerCase())) {
            return soundEffects[key];
        }
    }
    return null;
}

function sayInChat(message) {
    client.say("itsdece", message);
    // client.action("itsdece", message);
}

function speakText(username, message) {
    // Idea: https://github.com/axa-group/nlp.js/blob/HEAD/docs/binary-relevance-nlu.md
    if (!message.length) {
        return
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
    say.speak(message, "Microsoft Zira Desktop", 1.0, function(err){ // "Microsoft Zira Desktop"
        if (err) {
            console.log(`FAILED attempt to speak: ${message}`)
        } else {
            console.log(`SUCCESS text to speech: ${message}`)
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

