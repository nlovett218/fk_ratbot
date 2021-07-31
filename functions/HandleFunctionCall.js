var requireDir = require('require-dir');
const Constants = require('./util/Constants');
const LOG = require('./util/LogAction');
const util = require('util');

var timers = [

];

function userHasTimer(id)
{
  var pass = false;
  for(i = 0; i < timers.length; i++)
  {
    if (timers[i].ownerID == id)
      pass = true;
  }

  return pass;
}

function returnIndexOfFunction(string) //UNUSED
{

}

Constants.client.on('message', async function(msg) {
  //console.log(msg);
    if (String(msg).lowerCase().startsWith(Constants.BotInfo.prefix().lowerCase(), 0))
    {
      if (msg.channel.type === 'dm') {
          return msg.reply('I can\'t execute that command inside DMs!');
      }

      if (msg.author.id != Constants.client.user.id) {

          if (msg.channel.guild["me"] == undefined)
            return console.log("Error: could not get this bot's guild member");

          if (msg.channel.guild["me"] == null)
            return console.log("Error: could not get this bot's guild member");

          if (msg.author.bot) return;
          if (!Constants.PermissionsManager.checkPermissionsForChannel(msg.channel, msg.channel.guild.me)) {
            var DMChannel = await msg.author.createDM();
            await DMChannel.send(`The appropiate permissions for this channel have not been set for me! That means I am not able to respond in this channel! Please contact the server owner!\n` +
            `I require the following permissions:\n` +
            `\`'SEND_MESSAGES'\`\n\`'EMBED_LINKS'\`\n\`'ATTACH_FILES'\`\n\`'ADD_REACTIONS'\`\n\`'VIEW_CHANNEL'\`\n\`'USE_EXTERNAL_EMOJIS'\`\n\`'READ_MESSAGE_HISTORY'\``);
            return;
          }

          var allowChannelResponse = await Constants.allowChannelResponse(msg);
          if (!allowChannelResponse && (msg.author.id != msg.guild.ownerID && msg.author.id != Constants.botOwnerID))
            return;
          else {

            if (!userHasTimer(msg.author.id))
              Constants.USER.emit('processusercommand', msg);
            else {
              msg.channel.send(`<@${msg.author.id}> slow down!`);
            }
        }
      }
    }
});

Constants.USER.on('processusercommand', cmd => {
  var args = String(cmd).toUpperCase().split(" ");
  var exclamationIndexIdentifier = String(cmd).indexOf("!");
  var endCommandIndex = String(cmd).indexOf(" ");
  var commandSubstring = String(cmd).substring(exclamationIndexIdentifier + 1, endCommandIndex > -1 ? endCommandIndex : String(cmd).length);

  HandleFunctionCall.CallFunction(commandSubstring, cmd, args);
});

Constants.USER.on('start-timer', async timerObj => {
  var indexOfObj = timers.indexOf(timerObj);
  timers[indexOfObj].timerObj(Constants.commandCooldownTime).then(() => {
    var newIndex = timers.indexOf(timerObj);
    timers.splice(newIndex, 1);
  });
});

var HandleFunctionCall = {

  FunctionsList: {

  },

  RegisterFunction:function(commandCallStrings, func) {
    var newFunction = {
      commandStrings: commandCallStrings,
      funcRef: func
    };
    HandleFunctionCall.FunctionsList[func.name] = newFunction;
  },

  CallFunction:function(funcName, cmd, args)
  {
    var funcStringToMatch = args[0].lowerCase();
    const funcValues = Object.values(HandleFunctionCall.FunctionsList);
    var commandIndex = -1;

    funcValues.forEach(function(element) {
      element.commandStrings.forEach(function(strElement) {
        if (Constants.BotInfo.prefix().lowerCase() + strElement.lowerCase() == String(funcStringToMatch)) {
          commandIndex = funcValues.indexOf(element);
        }
      });
    });

    if (commandIndex < 0)
      return;

    var newTimer = {
      ownerID: cmd.author.id,
      timerObj: util.promisify(setTimeout)
    };

    timers.push(newTimer);
    Constants.USER.emit('start-timer', newTimer)

    funcValues[commandIndex].funcRef(cmd, args);
  },
};

module.exports = HandleFunctionCall;

const ClientFunctions = requireDir('./Client'); //MUST BE AT THE BOTTOM
