export interface DtoUserState {
  username: string;
  mod?: boolean;
  subscriber?: boolean;
}

export interface DtoDecebotCommand {
  name: string;
  message: string;
  user: DtoUserState;
  timestamp: number;
  channel: string;
}

interface IpcHandlers {
  connect: (channel: string) => boolean;
  disconnect: () => void;
}
