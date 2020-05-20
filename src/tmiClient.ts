import { Client, Options } from "tmi.js";

import * as config from '../config.json';

export const botName = config.botName;

const tmiOptions: Options = {
  options: {
    debug: true,
  },
  connection: {
    reconnect: true,
  },
  identity: {
    username: botName,
    password: config.twitchToken,
  },
  channels: config.channels,
};

export const client = new (Client as unknown as { new(opts: Options): Client })(tmiOptions);
export default client;
