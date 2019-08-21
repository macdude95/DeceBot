class SoundEffect {
  constructor(command, filePath, userPermissionsList=[]) {
    this.command = command;
    this.filePath = filePath;
    this.userPermissionsList = userPermissionsList;
  }

  isAllowedFor(username) {
    if (!this.userPermissionsList.length) {
      return true;
    } 
    return this.userPermissionsList.includes(username);
  }
}
module.exports = SoundEffect