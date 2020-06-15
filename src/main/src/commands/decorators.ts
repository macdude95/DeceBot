import Command from './Command';
import { ChatUserstate } from 'tmi.js';

import { sayInChat } from '../utils';
import { EventEmitter } from 'events';
import config from '../config';
import { sleep } from '../../../shared/utils';

interface SayTimeouts {
  [username: string]: number;
}

interface ThrottleOptions {
  waitTime: number;
  modsImmune?: boolean;
  sharedTimeout?: SayTimeouts;
}

interface CommandInfo {
  user: ChatUserstate;
  message: string;
}

type CommandQueue = CommandInfo[];

interface QueueOptions {
  maxQueueSize?: number;
  commandSpacing?: number;
  sharedQueue?: CommandQueue;
}

type AllowedUsers = string[] | ((userstate: ChatUserstate) => boolean);

export const allowedUsers = (inner: Command, allowedUsers: AllowedUsers) => {
  return new (class extends Command {
    public execute = async (userstate: ChatUserstate, message: string) => {
      let shouldExecute = false;
      const username = userstate.username as string;

      if (typeof allowedUsers === 'function') {
        if (allowedUsers(userstate)) {
          shouldExecute = true;
        }
      } else if (Array.isArray(allowedUsers)) {
        if (allowedUsers.includes(username)) {
          shouldExecute = true;
        }
      }

      if (shouldExecute) {
        await inner.execute(userstate, message);
      } else {
        sayInChat(
          `Yo ${username}, you are not allowed to use this command: ${this.command}`
        );
      }
    };
  })(inner.command);
};

export const subOnly = (inner: Command, isSubOnly: boolean = true) =>
  allowedUsers(inner, user => {
    const isSub = !!(
      user.subscriber ||
      user.mod ||
      user.badges?.subscriber ||
      user.badges?.founder
    );
    return isSubOnly ? isSub : true;
  });

export const throttle = (inner: Command, options: ThrottleOptions): Command => {
  return new (class extends Command {
    private readonly sayTimeoutRecords: SayTimeouts =
      options.sharedTimeout || {};

    public execute = async (userstate: ChatUserstate, message: string) => {
      if (this.checkTimeout(userstate)) {
        return;
      }

      await inner.execute(userstate, message);
    };

    private checkTimeout = (userstate: ChatUserstate) => {
      const username = userstate.username as string;

      if (
        userstate.badges?.broadcaster ||
        (options.modsImmune && userstate.mod)
      ) {
        return false;
      }

      if (this.sayTimeoutRecords[username]) {
        const lastTime = this.sayTimeoutRecords[username];
        const elapsedTime = Date.now() - lastTime;
        if (elapsedTime < options.waitTime) {
          sayInChat(
            `Yo ${username}, chill out with the ${
              inner.command
            } command for at least another ${Math.ceil(
              (options.waitTime - elapsedTime) / 1000
            )} seconds`
          );
          return true;
        } else {
          delete this.sayTimeoutRecords[username];
        }
      }

      return false;
    };
  })(inner.command);
};

export const queued = (inner: Command, options: QueueOptions = {}) => {
  return new (class extends Command {
    private readonly commandQueue: CommandQueue = options.sharedQueue || [];

    private eventEmitter: EventEmitter = new EventEmitter();

    constructor() {
      super(inner.command);

      config.debug &&
        this.eventEmitter.on('commandQueued', (commandInfo: CommandInfo) => {
          console.log(`Queuing command: '${commandInfo.message}'`);
        });

      this.runQueue();
    }

    public execute = async (
      user: ChatUserstate,
      message: string
    ): Promise<void> => {
      if (
        options.maxQueueSize !== undefined &&
        this.commandQueue.length >= options.maxQueueSize
      ) {
        sayInChat(
          `@${user.username}, I cannot run ${inner.command} because the queue is full. Please wait and try again.`
        );
        return;
      }

      this.enqueueCommand({ user, message });
    };

    private enqueueCommand = (command: CommandInfo) => {
      this.commandQueue.push(command);

      this.eventEmitter.emit('commandQueued', command);
    };

    private runQueue = async () => {
      while (await this.waitForCommand()) {
        await this.tryDequeue();
      }
    };

    private waitForCommand = (): Promise<boolean> => {
      return new Promise(resolve => {
        if (this.commandQueue.length) {
          resolve(true);
        } else {
          this.eventEmitter.once('commandQueued', () => {
            resolve(true);
          });
        }
      });
    };

    private tryDequeue = async () => {
      const nextItem = this.commandQueue.shift();

      if (nextItem === undefined) {
        return;
      }

      config.debug && console.log(`Running command: '${nextItem.message}'`);

      await inner.execute(nextItem.user, nextItem.message);

      if (options.commandSpacing !== undefined) {
        await sleep(options.commandSpacing);
      }
    };
  })();
};
