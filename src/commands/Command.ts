import {Userstate} from 'tmi.js';

export type CommandBody = (...args:any) => void;

export default class Command {
    isSubOnly: boolean;
    command: string;
    closure: () => void;
    userPermissionsList: string[];

    constructor(command: string, closure: CommandBody, userPermissionsList=[], isSubOnly=false) {
        this.isSubOnly = isSubOnly;
        this.command = command;
        this.closure = closure;
        this.userPermissionsList = userPermissionsList;
    }

    isAllowedFor(userstate: Userstate): boolean {
        const username = userstate.username;
        if (this.isSubOnly && !userstate.subscriber) {
            return false;
        }
        if (!this.userPermissionsList.length) {
            return true;
        }
        return this.userPermissionsList.includes(username);
    }

    execute(userstate: Userstate, message: string): void {
        const username = userstate.username;
        if (!this.isAllowedFor(username)) {
            return;
        }
        this.closure();
    }
}
