import yargs from 'yargs';

export const argv = yargs.options({
  slippi: { type: 'boolean', default: false },
  serve: { type: 'boolean', default: false },
}).argv;
