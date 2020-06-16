import {
  ipcMain,
  IpcMainInvokeEvent,
  IpcMainEvent,
  IpcMain,
  IpcRenderer,
  ipcRenderer,
  IpcRendererEvent,
} from 'electron';

import { IpcMainEvents, IpcHandlers, IpcRendererEvents } from './ipcEvents';

interface TypedIpcMainEvent<T> extends IpcMainEvent {
  // Type reply function if indicated as async or never to render unusable
  readonly reply: <K extends keyof IpcRendererEvents>(
    channel: K,
    ...args: Parameters<IpcRendererEvents[K]>
  ) => void;

  // Type return value if indicated as sync and not void or never to render unusable
  returnValue: T;
}

type IpcMainHandlerListener<K extends keyof IpcHandlers> = (
  event: IpcMainInvokeEvent,
  ...args: Parameters<IpcHandlers[K]>
) => Promise<ReturnType<IpcHandlers[K]>> | ReturnType<IpcHandlers[K]>;

type IpcMainEventListener<K extends keyof IpcMainEvents> = (
  event: TypedIpcMainEvent<ReturnType<IpcMainEvents[K]>>,
  ...args: Parameters<IpcMainEvents[K]>
) => void;

export interface TypedIpcMain extends IpcMain {
  handle<K extends keyof IpcHandlers>(
    channel: K,
    listener: IpcMainHandlerListener<K>
  ): void;

  handleOnce<K extends keyof IpcHandlers>(
    channel: K,
    listener: IpcMainHandlerListener<K>
  ): void;

  on<K extends keyof IpcMainEvents>(
    channel: K,
    listener: IpcMainEventListener<K>
  ): this;

  once<K extends keyof IpcMainEvents>(
    channel: K,
    listener: IpcMainEventListener<K>
  ): this;

  removeAllListeners<K extends keyof IpcMainEvents>(channel?: K): this;

  removeListener<K extends keyof IpcMainEvents>(
    channel: K,
    listener: IpcMainEventListener<K>
  ): this;

  removeHandler<K extends keyof IpcHandlers>(channel: K): void;
}

export const typedIpcMain = ipcMain as TypedIpcMain;

type IpcRendererEventListener<K extends keyof IpcRendererEvents> = (
  event: IpcRendererEvent,
  ...args: Parameters<IpcRendererEvents[K]>
) => void;

export interface TypedIpcRenderer extends IpcRenderer {
  invoke<K extends keyof IpcHandlers>(
    channel: K,
    ...args: Parameters<IpcHandlers[K]>
  ): Promise<ReturnType<IpcHandlers[K]>>;

  on<K extends keyof IpcRendererEvents>(
    channel: K,
    listener: IpcRendererEventListener<K>
  ): this;

  once<K extends keyof IpcRendererEvents>(
    channel: K,
    listener: IpcRendererEventListener<K>
  ): this;

  removeAllListeners<K extends keyof IpcRendererEvents>(channel: K): this;

  removeListener<K extends keyof IpcRendererEvents>(
    channel: K,
    listener: IpcRendererEventListener<K>
  ): this;

  send<K extends keyof IpcMainEvents>(
    channel: K,
    ...args: Parameters<IpcMainEvents[K]>
  ): void;

  sendSync<K extends keyof IpcMainEvents>(
    channel: K,
    ...args: Parameters<IpcMainEvents[K]>
  ): ReturnType<IpcMainEvents[K]>;

  sendTo<K extends keyof IpcRendererEvents>(
    webContentsId: number,
    channel: K,
    ...args: Parameters<IpcRendererEvents[K]>
  ): void;

  sendToHost<K extends keyof IpcRendererEvents>(
    channel: K,
    ...args: Parameters<IpcRendererEvents[K]>
  ): void;
}

export const typedIpcRenderer = ipcRenderer as TypedIpcRenderer;
