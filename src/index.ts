import OBSController from './OBSController';
import Slippi from './Slippi';
import { client } from './tmiClient';
import { sayInChat, findCommandInMessage } from './utils';
import { argv } from './commandLine';

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, p) => {
  // console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
  // application specific logging, throwing an error, or other logic here
});

const obsController = new OBSController();
if (argv.slippi) {
  console.log('String slippi task...');
  const slippi = new Slippi('D:\\Games\\Dolphin\\Slippi\\Games', obsController);
}

// These handlers could arguably be move to tmiClient.ts
// We'll leave them here for now
client.on('connected', function (a, p) {
  sayInChat('SUP WORLD!');
});


client.on('chat', function (channel, userstate, message, self) {
  const command = findCommandInMessage(message);
  if (command) {
    command.execute(userstate, message);
  }
});

client.connect();
