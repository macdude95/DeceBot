var tmi = require('tmi.js');
var say = require('say');
var player = require('play-sound')(opts = {});
var rf = require('random-facts'); // Require the package

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

var sound_effects = {
	"Tuturu": {
		path: "Tuturu.mp3",
		userPermissionsList: []
	}, 
	"Oof": {
		path: "Roblox Death Sound Effect.mp3",
		userPermissionsList: []
	}, 
	"MonkaGigaDude": {
		path: "monka giga dude.mp3",
		userPermissionsList: ["itsdece", "br4c3_dk"]
	}, 
	"MissedIt": {
		path: "missed it by that much.mp3",
		userPermissionsList: []
	}, 
	"Dust": {
		path: "another one bites the dust.mp3",
		userPermissionsList: []
	}, 
};

var sayTimeout = 60000;
var sayTimeoutList = {};

client.on("chat", function(channel, userstate, message, self) {
	if(message.includes("!say")) {
		speak_text(userstate.username, message.replace("!say", ""));
	} else if (message.includes("!randomfact")) {
		client.action("itsdece", rf.randomFact());
	} else if (sound_effect_command_in_message(message) != "") {
		play_sound(sound_effect_command_in_message(message), userstate.username);
	} else {
		//console.log("Nothing to do here...");
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
	if (sayTimeoutList[username]) {
		var lastTime = sayTimeoutList[username];
		var elapsedTime = Date.now() - lastTime;
		if (elapsedTime < sayTimeout) {
			client.action("itsdece", `Yo ${username}, chill out with the !say command for at least another ${Math.ceil((sayTimeout - elapsedTime)/1000)} seconds`);
			return;
		}
	}
	sayTimeoutList[username] = Date.now();
	say.speak(username + " says: " + message, "Microsoft Zira Desktop");
}

function user_is_allowed_to_use_sound_effect(sound_effect, username) {
	if (!sound_effect.userPermissionsList.length) {
		return true;
	} 
	return sound_effect.userPermissionsList.includes(username);
}

function play_sound(sound_effect, username) {
	if (!user_is_allowed_to_use_sound_effect(sound_effect, username)) {
		return;
	}

	var pathToSoundEffects = "C:\\Users\\Michael\\Desktop\\StreamStuff\\SoundEffects\\";

	player.play(pathToSoundEffects + sound_effect.path, function(err){
	  if (err) throw err
	});
}