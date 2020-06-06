import { client } from "./twitchClient";
import { commands } from "./commands";

import config from './config';

export type SayInChatFunc = (message: string) => void;

export const sayInChat: SayInChatFunc = (message: string) => {
  client.say(config.channel, message);
}

export const findCommandInMessage = (message: string) => {
  for (const command of commands) {
    if (message.toLowerCase().startsWith(command.command.toLowerCase())) {
      return command;
    }
  }
  return null;
}

export const sleep = (duration:number) => new Promise(resolve => setTimeout(resolve, duration));
