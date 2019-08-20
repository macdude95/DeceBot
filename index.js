var tmi = require('tmi.js');
var say = require('say');
var player = require('play-sound')(opts = {});

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
	client.action("itsdece", "SUP");
});

var sound_effects = {
	"Tuturu": "Tuturu.mp3", 
	"Oof": "Roblox Death Sound Effect.mp3",
	"MonkaGigaDude": "monka giga dude.mp3",
	"MissedIt": "missed it by that much.mp3",
	"Dust": "another one bites the dust.mp3"
};

client.on("chat", function(channel, userstate, message, self) {
	console.log(channel);
	if(message.includes("!say")) {
		speak_text(userstate.username, message.replace("!say", ""));
	}
	else if (sound_effect_command_in_message(message) != "") {
		play_sound(sound_effect_command_in_message(message));
	} else {
		console.log("Nothing to do here...");
	}
});

function sound_effect_command_in_message(message) {
	for (const key of Object.keys(sound_effects)) {
	  if (message.toLowerCase().includes("!" + key.toLowerCase())) {
		return sound_effects[key];
		}
	}
	return "";
}

function speak_text(username, message) { 
	say.speak(username + " says: " + message, "Microsoft Zira Desktop");
}

function play_sound(sound_effect_path) {
	var pathToSoundEffects = "C:\\Users\\Michael\\Desktop\\StreamStuff\\SoundEffects\\";

	player.play(pathToSoundEffects + sound_effect_path, function(err){
	  if (err) throw err
	});
}