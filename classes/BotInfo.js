class BotInfo {
  constructor(name, version, author, cmdPrefix)
  {
    this.processName = name;
    this.processVersion = version;
    this.processAuthor = author;
    this.commandPrefix = cmdPrefix;

    this.verbose = true;
    this.debug = true;
  }

  name() { return this.processName; }

  version() { return this.processVersion; }

  author() { return this.processAuthor; }

  prefix() { return this.commandPrefix; }

  logBotInfo() {
    console.log(this.processName + " is running version " + this.processVersion + "| Created by " + this.processAuthor);
  }
}

module.exports = BotInfo;
