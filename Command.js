class Command {
    constructor(command, closure, userPermissionsList=[], isSubOnly=false) {
        this.isSubOnly = isSubOnly;
        this.command = command;
        this.closure = closure;
        this.userPermissionsList = userPermissionsList;
    }

    isAllowedFor(userstate) {
        const username = userstate.username;
        if (this.isSubOnly && !userstate.subscriber) {
            return false;
        }
        if (!this.userPermissionsList.length) {
            return true;
        } 
        return this.userPermissionsList.includes(username);
    }

    execute(userstate, message) {
        const username = userstate.username;
        if (!this.isAllowedFor(username)) {
            return;
        }
        this.closure();
    }
}
module.exports = Command