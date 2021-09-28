const Constants = require('../util/Constants');
const HandleFunctionCall = require('../HandleFunctionCall');

function getCommandsString()
{
  var FunctionsList = HandleFunctionCall.FunctionsList;
  var keys = Object.keys(FunctionsList);
  var values = Object.values(FunctionsList);
  var commandString = "";

  for (i = 0; i < keys.length; i++)
  {
    var funcName = keys[i];
    var commandSubstrings = FunctionsList[funcName].commandStrings;
    //console.log(commandSubstrings);
    commandString += `**${funcName}** -> \`${commandSubstrings.join('|')}\`\n`;
  }

  return commandString;
}

var local = {
  vote:async function (cmd, args)
  {
    
  },

  help:async function(cmd, args)
  {
    Constants.pushIDRequest(cmd.author.id);

    if (args.length > 1)
    {
      if (args[1].toLowerCase() == 'commands')
      {

        var getCommandString = getCommandsString();
        const embed = new Constants.Discord.MessageEmbed()
        //console.log(obj.result[0].mtg_startingDeck);
        .setTitle(`FK NameChangeDiscoveryBot Command List`)
        .setColor(Constants.color_codes["green"])
        .setDescription(`${getCommandString}`);

        cmd.reply({embed});

        Constants.removeIDRequest(cmd.author.id);

        return;
      }
      if (args[1].toLowerCase() == 'notifications')
      {

        var getCommandString = getCommandsString();
        const embed = new Constants.Discord.MessageEmbed()
        //console.log(obj.result[0].mtg_startingDeck);
        .setTitle(`FK NameChangeDiscoveryBot Notification Modes`)
        .setColor(Constants.color_codes["green"])
        .setDescription(`` +
          `0 = Disabled\n` +
          `1 = Notify when tracked player enters the server even if you are not on the server\n` + 
          `2 = Only notify when tracked player enters under new name\n` + 
          `3 = Only notify when you are on the server\n` +
        ``);

        cmd.reply({embed});

        Constants.removeIDRequest(cmd.author.id);

        return;
      }
    }

    Constants.removeIDRequest(cmd.author.id);
  },

  about:function(cmd, args)
  {
    Constants.pushIDRequest(cmd.author.id);

    var BotInfo = Constants.BotInfo;

    const embed = new Constants.Discord.MessageEmbed()
    ///const embed = new Constants.Discord.MessageEmbed()
    //console.log(obj.result[0].mtg_startingDeck);
    embed.setTitle(BotInfo.name())
    embed.setColor(Constants.color_codes["green"])
    embed.setDescription(`Creator: **${BotInfo.author()}**\n` +
    `Version: **${BotInfo.version()}**\n` +
    `Prefix: **${BotInfo.prefix()}**\n` +
    `Description: **This bot will notify you when a tracked player has entered the server under a new and/or different name.**\n` +
    `\n` +
    `**NOTE:** This bot is still in the development process and some features may not work as intended or provide unexpected results. The bot will be restarted on many occasions.`);
    cmd.reply({embed});

    Constants.removeIDRequest(cmd.author.id);
  },

}

module.exports = local;
HandleFunctionCall.RegisterFunction(["help", "whatthefuckdoido"], local.help);
HandleFunctionCall.RegisterFunction(["ab", "about"], local.about);
