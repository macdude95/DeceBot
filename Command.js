class Command {
    constructor(command, closure, userPermissionsList=[]) {
        this.command = command;
        this.closure = closure;
        this.userPermissionsList = userPermissionsList;
    }

    isAllowedFor(username) {
        if (!this.userPermissionsList.length) {
            return true;
        } 
        return this.userPermissionsList.includes(username);
    }

    execute(username, message) {
        this.closure();
    }
}
module.exports = Command