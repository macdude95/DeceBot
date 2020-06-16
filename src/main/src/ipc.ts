import { TypedIpcMain } from '../../ipc-dtos';

import { decebot } from './decebot';

export default (ipcMain: TypedIpcMain) => {
  ipcMain.handle('connect', async event => {
    try {
      await decebot.connect();
    } catch (e) {
      return false;
    }

    return true;
  });

  ipcMain.handle('disconnect', decebot.disconnect);
};
