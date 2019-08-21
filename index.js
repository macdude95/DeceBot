var tmi = require('tmi.js');
var say = require('say');
var player = require('play-sound')(opts = {});
var rf = require('random-facts'); // Require the package
const SoundEffect = require('./SoundEffect.js')
const TwitchClient = require('twitch').default;

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
	client.action("itsdece", "SUP WORLD!");
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

	if(message.includes("!say")) {
		speakText(userstate.username, message.replace("!say", ""));
	} else if (message.includes("!randomfact")) {
		client.action("itsdece", rf.randomFact());
	} else if (soundEffectCommandInMessage(message)) {
		playSound(soundEffectCommandInMessage(message), userstate.username);
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

function speakText(username, message) {
	if (message.length)
	if (sayTimeoutList[username]) {
		var lastTime = sayTimeoutList[username];
		var elapsedTime = Date.now() - lastTime;
		if (elapsedTime < sayTimeout) {
			client.action("itsdece", `Yo ${username}, chill out with the !say command for at least another ${Math.ceil((sayTimeout - elapsedTime)/1000)} seconds`);
			return;
		}
	}
	sayTimeoutList[username] = Date.now();
	say.speak(username + " says: " + message, "Microsoft Zira Desktop", 1.0, function(err){
		if (err) {
			console.log(`FAILED attempt to speak: ${message}`)
		} else {
			console.log(`SUCCESS text to speech: ${message}`)
		}
	});
}

function playSound(soundEffect, username) {
	if (!soundEffect.isAllowedFor(username)) {
		return;
	}

	var pathToSoundEffects = "C:\\Users\\Michael\\Desktop\\StreamStuff\\SoundEffects\\";

	player.play(pathToSoundEffects + soundEffect.filePath, function(err){
		if (err) {
			console.log(`FAILED attempt to play: ${soundEffect.filePath}`)
		} else {
			console.log(`SUCCESS played audio: ${soundEffect.filePath}`)
		}
	});
}