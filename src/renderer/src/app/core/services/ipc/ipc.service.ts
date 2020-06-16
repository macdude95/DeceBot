import { Injectable } from '@angular/core';

import { ElectronService } from '../electron/electron.service';
import { TypedIpcRenderer } from '../../../../../../ipc-dtos';

@Injectable({
  providedIn: 'root',
})
export class IpcService {
  private ipcRenderer: TypedIpcRenderer;

  constructor(electron: ElectronService) {
    this.ipcRenderer = electron.ipcRenderer;
  }

  async connectDecebot(): Promise<boolean> {
    // this.ipcRenderer.invoke('')
    const result = await this.ipcRenderer.invoke('connect');

    return result;
  }

  async disconnectDecebot(): Promise<void> {
    await this.ipcRenderer.invoke('disconnect');
  }
}
