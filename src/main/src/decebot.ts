import OBSController from './OBSController';
import Slippi from './Slippi';
import { client } from './twitchClient';
import { argv } from './commandLine';

export class DeceBot {
  private readonly slippi: Slippi | undefined;

  constructor(runSlippi: boolean) {
    if (runSlippi) {
      const obsController = new OBSController();
      this.slippi = new Slippi(
        'D:\\Games\\Dolphin\\Slippi\\Games',
        obsController
      );
    }
  }

  async connect(): Promise<void> {
    await client.connect();
  }
}

export const decebot = new DeceBot(argv.slippi);
