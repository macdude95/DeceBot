export interface IpcHandlers {
  connect: () => boolean;
  disconnect: () => void;
}

/**
 * Return type of represent the synchronous return type. Void for no return
 */
export interface IpcMainEvents {
  something: (arg: string) => void;
}

/**
 * All Ipc renderer events return void
 */
export interface IpcRendererEvents {
  something: (arg: number) => void;
  something2: (arg: string) => void;
}
