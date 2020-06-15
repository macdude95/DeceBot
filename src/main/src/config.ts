import { safeLoad } from 'js-yaml';
import { readFileSync, existsSync } from 'fs';

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
  saySpacing: number;

  /**
   * The amount of time a user must wait between !say commands
   */
  sayThrottleTime: number;

  /**
   * What text to announce in chat when joining a channel
   */
  announceText: string;

  /**
   * Response to greet user with the first time they talk since Decebot connected.
   * If an array, will randomly pick a greeting from the list
   *
   * Will replace `$user` with the username of the user being greeted
   */
  userGreeting: string | string[];
}

type ConfigFile = Partial<Config>;

const requiredKeys = [
  'channel',
  'soundBoardPath',
  'commandsPath',
  'twitchToken',
];

const defaultConfig: Partial<Config> = {
  botName: 'decebot',
  sayVoice: 'Microsoft Zira Desktop',
  debug: false,
  maxSayQueue: -1,
  sayThrottleTime: 60000,
  sayTimeout: 10000,
  saySpacing: 1000,
  announceText: 'SUP WORLD!',
  userGreeting: 'Hey, @$user! Welcome to the stream!',
};

let configFile: ConfigFile;

try {
  configFile = require('../../config.json');
} catch {
  let configFilePath = ['./config.yaml', './config.yml'].find(path =>
    existsSync(path)
  );
  try {
    if (!configFilePath) {
      throw new Error('No config file found.');
    }
    configFile = safeLoad(readFileSync(configFilePath), 'utf8');
  } catch (e) {
    console.error(
      'No config file found. Please create config.json or config.yaml'
    );
    console.error(e);
    process.exit(1);
  }
  if (!configFilePath) {
  }
}

const config = { ...defaultConfig, ...configFile } as Config;

const providedKeys = new Set(Object.keys(config));

const missingKeys = requiredKeys.filter(k => !providedKeys.has(k));

if (missingKeys.length > 0) {
  console.error(
    `Missing the following keys from your config file: [${missingKeys.join(
      ', '
    )}]`
  );
  process.exit(1);
}

export default config;
