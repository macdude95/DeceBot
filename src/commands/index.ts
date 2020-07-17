import path from "path";
import fs from "fs";
import Command from './Command';
import SayCommand from "./SayCommand";
import SoundCommand from "./SoundCommand";
import { sayInChat } from "../utils";
import config from '../config';
import SimpleCommand from "./SimpleCommand";
import { subOnly, throttle, queued } from "./decorators";

export { Command, SayCommand, SoundCommand };

export const commands: Command[] = [
  // Text to speech command:
  throttle(
    queued(new SayCommand('!Say')),
    { waitTime: config.sayThrottleTime }
  ),

  // DeceBot text commands:
  new SimpleCommand('!Discord', () => {
    sayInChat('Join the discord here: https://discord.gg/65jUQ8G');
  }),
  new SimpleCommand('!Github', () => {
    sayInChat(
      'Wanna see what my insides look like? https://github.com/micantre/DeceBot'
    );
  }),
  new SimpleCommand('!SoundBoard', () => {
    sayInChat(
      'Use sound board commands to play sound effects in the stream!'
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
          subOnly(new SoundCommand(command, fullPath), isSubOnly)
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
