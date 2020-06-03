import { Client, Options } from "tmi.js";

import config from './config';

export const botName = config.botName;

const tmiOptions: Options = {
  options: {
    debug: config.debug,
  },
  connection: {
    reconnect: true,
  },
  identity: {
    username: botName,
    password: config.twitchToken,
  },
  channels: [ config.channel ],
};

export const client = new (Client as unknown as { new(opts: Options): Client })(tmiOptions);
export default client;
