import { safeLoad } from 'js-yaml';
import { readFileSync } from 'fs';

export interface Config {
  /**
   * Login name for the bot
   */
  botName: string;

  /**
   * Channel to speak in
   */
  channel: string;

  /**
   * Channels to connect to
   */
  channels: string[];

  /**
   * TTS Voice to use
   */
  sayVoice: string;

  /**
   * Path to Soundboard files
   */
  soundBoardPath: string;

  /**
   * Output path for combined Commands.txt
   */
  commandsPath: string;

  /**
   * Login token for twitch IRC client
   */
  twitchToken: string;

  /**
   * Enables debugging logging for twitch client
   */
  debug: boolean;

  /**
   * The maximum number of !say commands that can be queued at once
   *
   * -1 mean unlimited
   */
  maxSayQueue: number;

  /**
   *  Max amount of time to allow a !say command to go on for
   */
  sayTimeout: number;

  /**
   * Time between queued !say commands
   */
  saySpacing: number

  /**
   * The amount of time a user must wait between !say commands
   */
  sayThrottleTime: number;
}

type ConfigFile = Partial<Config>;

const requiredKeys = [ 'channel', 'soundBoardPath', 'commandsPath', 'twitchToken' ]

const defaultConfig: Partial<Config> = {
  botName: 'decebot',
  sayVoice: 'Microsoft Zira Desktop',
  debug: false,
  maxSayQueue: -1,
  sayThrottleTime: 60000,
  sayTimeout: 10000,
  saySpacing: 1000
};

let configFile: ConfigFile;

try {
  configFile = require('../config.json');
} catch {
  try {
    configFile = safeLoad(readFileSync('./config.yaml', 'utf8'));
  } catch(e) {
    console.error('No config file found. Please create config.json or config.yaml')
    console.error(e)
    process.exit(1)
  }
}

const config = { ...defaultConfig, ...configFile } as Config;

if (!Array.isArray(config.channels)) {
  config.channels = [ config.channel ]
}

const providedKeys = new Set(Object.keys(config));

const missingKeys = requiredKeys.filter(k => !providedKeys.has(k))

if (missingKeys.length > 0) {
  console.error(`Missing the following keys from your config file: [${missingKeys.join(', ')}]`);
  process.exit(1)
}

export default config;
