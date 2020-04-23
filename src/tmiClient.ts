import { Client, Options } from "tmi.js";

import * as twitchPermissionsTokens from '../twitchPermissionsTokens.json';

export const botName = 'DeceBot';

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

export const client = new (Client as unknown as {new(opts:Options):Client})(tmiOptions);
export default client;
