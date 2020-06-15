import { Injectable } from '@angular/core';
import { IpcService } from '../ipc/ipc.service';

@Injectable({
  providedIn: 'root',
})
export class DecebotService {
  private connected: boolean = false;

  constructor(private ipc: IpcService) {}

  async connect(): Promise<void> {
    await this.ipc.connectDecebot();
  }

  async disconnect(): Promise<void> {
    await this.ipc.disconnectDecebot();
  }
}
