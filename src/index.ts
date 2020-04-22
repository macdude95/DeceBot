import { Client, Options } from 'tmi.js';
import fs from 'fs';
import path from 'path';

import OBSController from './OBSController';
import Command from './Command';
import SoundCommand from './SoundCommand';
import SayCommand from './SayCommand';
import Slippi from './Slippi.js';

import * as twitchPermissionsTokens from '../twitchPermissionsTokens.json';

if (process.argv.includes('--help')) {
  console.log('Usage: node index.js [--slippi]');
  process.exit();
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, p) => {
  // console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
  // application specific logging, throwing an error, or other logic here
});

const botName = 'DeceBot';
const tmiOptions:Options = {
  options: {
    debug: false,
  },
  connection: {
    reconnect: true,
  },
  identity: {
    username: botName,
    password: twitchPermissionsTokens[botName],
  },
  channels: ['itsdece'],
};

const commands = [
  // Text to speech command:
  new SayCommand('!Say', (message) => {
    sayInChat(message);
  }),

  // DeceBot text commands:
  new Command('!Discord', () => {
    sayInChat('Join the discord here: https://discord.gg/65jUQ8G');
  }),
  new Command('!Github', () => {
    sayInChat(
      'Wanna see what my insides look like? https://github.com/micantre/DeceBot'
    );
  }),
  new Command('!CupheadWars', () => {
    sayInChat(
      'The great Cuphead Wars of 2020 is a competition between me and a couple of my coworkers to see who can beat cuphead the fastest. Others in the competition are https://www.twitch.tv/kishkishftw and https://www.twitch.tv/faultymuse'
    );
  }),
  new Command('!NewSoundboard', () => {
    sayInChat(
      'The subscriber sound effect commands are now shared in one collective subscriber soundboard.'
    );
  }),

  // Sound commands are autimatically added in the code below
];

// Automatically add Sound Commands code from: https://stackoverflow.com/questions/32511789/looping-through-files-in-a-folder-node-js
(async () => {
  const soundBoardPath =
    'C:\\Users\\Michael\\Desktop\\StreamStuff\\Media\\SoundEffects\\SoundBoard';
  const folderPaths = [
    soundBoardPath + '\\General',
    soundBoardPath + '\\SubOnly',
  ];
  try {
    for (const folderPath of folderPaths) {
      const files = await fs.promises.readdir(folderPath);
      const isSubOnly = folderPath.includes('SubOnly');
      const commandsInFolder = [];
      for (const file of files) {
        if (file.includes('.txt')) {
          continue;
        }
        const fullPath = path.join(folderPath, file);
        const command = `!${file.split('.')[0]}`;
        commands.push(
          new SoundCommand(command, fullPath, sayInChat, isSubOnly)
        );
        commandsInFolder.push(command);
      }
      fs.writeFile(
        folderPath + '\\Commands.txt',
        commandsInFolder.join('\n'),
        (error) => {}
      );
    }
  } catch (e) {
    console.error('Exception thrown while generating sound commands:', e);
  } finally {
    console.log('Loaded all sound commands in %s', soundBoardPath);
  }
})();

const client = new (Client as unknown as {new(opts:Options):Client})(tmiOptions);
client.connect();

client.on('connected', function (a, p) {
  sayInChat('SUP WORLD!');
});

const obsController = new OBSController();
if (process.argv.includes('--slippi')) {
  console.log('String slippi task...');
  const slippi = new Slippi('D:\\Games\\Dolphin\\Slippi\\Games', obsController);
}

client.on('chat', function (channel, userstate, message, self) {
  const command = findCommandInMessage(message);
  if (command) {
    command.execute(userstate, message);
  }
});

function findCommandInMessage(message: string) {
  for (const command of commands) {
    if (message.toLowerCase().startsWith(command.command.toLowerCase())) {
      return command;
    }
  }
  return null;
}

function sayInChat(message: string) {
  client.say('itsdece', message);
  // client.action("itsdece", message);
}
