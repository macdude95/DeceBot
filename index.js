var tmi = require('tmi.js');
var say = require('say');
const SoundEffect = require('./SoundEffect.js')
const TwitchJs = require('twitch-js').default; // CONSIDER REPLACING TMI WITH THIS. example: https://github.com/twitch-devs/twitch-js/blob/next/examples/runkit.js
const token = "uc83kc9uo4u90x2psnm7jyxvlv833i";
const username = "ItsDece";
// twitch api token: 

// Instantiate clients.
const { api, chat, chatConstants } = new TwitchJs({ token, username });

// Get featured streams.
api.get('streams/featured').then(response => {
  console.log(response);
  // Do stuff ...
});


var options = {
    options: {
        debug: false
    },
    connection: {
        cluster: "aws",
        reconnect: true
    },
    identity: {
        username: "DeceBot",
        password: "oauth:7fgcs39add7sai7jibewmxzr6b7ydq"
    },
    channels: ["itsdece"]
}

var client = new tmi.client(options);
client.connect();


client.on("connected", function(a,p) {
    sayInChat("SUP WORLD!");
});

var soundEffects = {
    "!Tuturu": new SoundEffect("!Tuturu", "Tuturu.mp3"),
    "!Oof": new SoundEffect("!Oof", "Roblox Death Sound Effect.mp3"),
    "!MonkaGigaDude": new SoundEffect("!MonkaGigaDude", "monka giga dude.mp3", ["itsdece", "br4c3_dk"]),
    "!MissedIt": new SoundEffect("!MissedIt", "missed it by that much.mp3"),
    "!Dust": new SoundEffect("!Dust", "another one bites the dust.mp3")
};

var sayTimeout = 60000;
var sayTimeoutList = {};

client.on("chat", function(channel, userstate, message, self) {
    console.log(userstate);
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
    if (sayTimeoutList[username]) {
        var lastTime = sayTimeoutList[username];
        var elapsedTime = Date.now() - lastTime;
        if (elapsedTime < sayTimeout) {
            sayInChat(`Yo ${username}, chill out with the !say command for at least another ${Math.ceil((sayTimeout - elapsedTime)/1000)} seconds`);
            return;
        }
    }
    sayTimeoutList[username] = Date.now();
    say.speak(message, "Microsoft Zira Desktop", 1.0, function(err){
        if (err) {
            console.log(`FAILED attempt to speak: ${message}`)
        } else {
            console.log(`SUCCESS text to speech: ${message}`)
        }
    });

    setTimeout(() => {
      say.stop((err) => {
        if (!err) {
          sayInChat(`@${username} your message was too long so I had to cut off.`)
        }        
      });
    }, 5000)
}
