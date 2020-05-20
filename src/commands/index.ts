import path from "path";
import fs from "fs";
import Command from './Command';
import SayCommand from "./SayCommand";
import SoundCommand from "./SoundCommand";
import { sayInChat } from "../utils";
import config from '../config';

export { Command, SayCommand, SoundCommand };

export const commands = [
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

  // Sound commands are automatically added in the code below
];

// Automatically add Sound Commands code from: https://stackoverflow.com/questions/32511789/looping-through-files-in-a-folder-node-js
(async () => {
  const soundBoardPath = config.soundBoardPath;
  const folderPaths = [
    path.join(soundBoardPath, 'General'),
    path.join(soundBoardPath, 'SubOnly'),
  ];
  try {
    const writePromises: Promise<void>[] = [];
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
      writePromises.push(fs.promises.writeFile(
        path.join(folderPath, 'Commands.txt'),
        commandsInFolder.join('\n')
      ))
    }
    await Promise.all(writePromises);
  } catch (e) {
    console.error('Exception thrown while generating sound commands:', e);
  } finally {
    console.log('Loaded all sound commands in %s', soundBoardPath);
    // Write all commands to file
    // TODO: denote sub only commands
    fs.writeFile(config.commandsPath, commands.map(c => c.command).join(" - ") + " - ", (error) => { });

  }
})();

export default commands
