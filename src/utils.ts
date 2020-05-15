import { client } from "./tmiClient";
import { commands } from "./commands";

import * as config from '../config.json';

export type SayInChatFunc = (message: string) => void;

export const sayInChat: SayInChatFunc = (message: string) => {
  client.say(config.channel, message);
  // client.action("itsdece", message);
}

export const findCommandInMessage = (message: string) => {
  for (const command of commands) {
    if (message.toLowerCase().startsWith(command.command.toLowerCase())) {
      return command;
    }
  }
  return null;
}
