const BotInfo = require('../../classes/BotInfo');
const Events = require('events');
const Discord = require('discord.js');
const { Permissions } = require('discord.js');
const path = require('path');
const FILE_SYSTEM = require('fs');

var local = {
  permissionsFlags:new Permissions([
  	'SEND_MESSAGES',
  	'EMBED_LINKS',
    'ADD_REACTIONS',
    'VIEW_CHANNEL',
    'USE_EXTERNAL_EMOJIS',
  	'READ_MESSAGE_HISTORY'
  ]),
  PermissionsManager:require('./PermissionsManager'),
  Discord:require('discord.js'),
  moment:require('moment'),
  Canvas:require('canvas'),
  snekfetch:require('snekfetch'),
  HandleConnection:null, //will be initialized after starting
  FILE_SYSTEM:require('fs'),
  channels_data_file: './channels-data.json',
  BotInfo:new BotInfo("Taking Wall Street Bot", "0.12.5", "suff0cati0n", "w!"),
  client:new Discord.Client(),
  config_file:'./config.json',
  trackChannelData: null,
  momentTimeFormat: 'MM-DD-YYYY HH:mm:ss',
  guildPrefix: "GUILD_",
  botOwnerID: '201841156990959616', //201841156990959616
  commandCooldownTime: 500,

  baseDailyPackAward: 2,
  extraDailyPackAward: 3,
  baseWeeklyPackAward: 3,
  extraWeeklyPackAward: 4,

  packAmounts: {
    guaranteed_lands: 2,
    guaranteed_commons: 2,
    guaranteed_uncommons: 2,
    guaranteed_rare_mythic: 1
  },

  reactionTimes: {
    test: 20000,
  },

  SQL:new Events.EventEmitter(),
  MDB:new Events.EventEmitter(),
  USER:new Events.EventEmitter(),
  SERVER:new Events.EventEmitter(),

  commandRequests: [

  ],

  imageDir: './Images/',

  botAdmins: [
    '201841156990959616', //youviolateme
    '809299109743820800' //TWS-Nic
  ],

  guildAdmins: {

  },

  emoji_id: {
      yes_mark: '✅',
      no_mark: '🚫',
      balloon: '🎈',
      heart: '♥',
      clock: '⏰',
      doton: '831077338992476170',
      dotoff: '831077331900301312',      //558087733747122186
  },

  emoji_letters:[
    "🇦",
    "🇧",
    "🇨",
    "🇩",
    "🇪",
    "🇫",
    "🇬",
    "🇭",
    "🇮",
    "🇯",
    "🇰",
    "🇱",
    "🇲",
    "🇳",
    "🇴",
    "🇵",
    "🇶",
    "🇷",
    "🇸",
    "🇹",
    "🇺",
    "🇻",
    "🇼",
    "🇽",
    "🇾",
    "🇿"
  ],

  color_codes: {
    white: "#FFFFFF",
    black: "#000000",
    green: "#008000",
    red: "#FF0000",
    blue: "#0000FF"
  },

  MessageCodes: {
      INVALID_discord_token: "ERROR: You have provided an invalid discord token.",
      STRING_too_long: "ERROR: String is too long. If sending a discord message, please shorten to less than 2000 characters.",
      EMOJI_not_found: "ERROR: Specified emoji was not found.",
      USER_TASK_EXISTS: `Unable to perform command at this time.`,

  },

  sendDirectMessage:async function(userId, msg, msgFormatIdentifiers)
  {
    const user = await local.client.users.fetch(userId).catch(() => null);

    if (!user) return;

    var msgFormatted = msg;

    if (msgFormatIdentifiers != null) {

      msgFormatted = String(msgFormatted).replace(`[${i}]`, msgFormatIdentifiers[i]);
    }

    await user.send(msgFormatted).catch(() => {
       return console.log(`Attempt to send direct message to ${userId} but user has DMs closed or has no mutual servers with the bot`);
    });
  },

  until:function(conditionFunction) {

    const poll = resolve => {
      if(conditionFunction()) resolve();
      else setTimeout(_ => poll(resolve), 400);
    }

    return new Promise(poll);
  },

  shuffle:function(array) {
      var a = array;
      var j, x, i;
      for (i = a.length - 1; i > 0; i--) {
          j = Math.floor(Math.random() * (i + 1));
          x = a[i];
          a[i] = a[j];
          a[j] = x;
      }
      return a;
  },

  between:function(num, a, b, inclusive) {
    var min = Math.min.apply(Math, [a, b]),
      max = Math.max.apply(Math, [a, b]);
    return inclusive ? num >= min && num <= max : num > min && num < max;
  },

  getTimeBetween:function(time1, time2)
  {
    var diff = time1 - time2; //in ms

    var days = Math.floor(diff / (1000 * 60 * 60 * 24));
    diff -=  days * (1000 * 60 * 60 * 24);

    var hours = Math.floor(diff / (1000 * 60 * 60));
    diff -= hours * (1000 * 60 * 60);

    var minutes = Math.floor(diff / (1000 * 60));
    diff -= minutes * (1000 * 60);

    var seconds = Math.floor(diff / (1000));
    diff -= seconds * (1000);

    var humanReadable = {};
    humanReadable.days = days;//Math.floor(hours/1440);
    humanReadable.hours = hours;
    humanReadable.minutes = minutes;
    humanReadable.seconds = seconds;

    return humanReadable;
  },

  isGuildAdmin:function(guildID, userID)
  {
    return local.guildAdmins[guildID].includes(userID);
  },

  readJSONFile:async function(filePath)
  {
    var obj = await local.FILE_SYSTEM.readFileSync(filePath, 'utf8', function (err, data) {
    if (err) throw err; // we'll not consider error handling for now
      var parseObj = JSON.parse(data);
      return parseObj;//console.log(obj);
    });
    //console.log(obj);
    return JSON.parse(obj);
  },

  writeJSONFile:async function(filePath, jsonObj)
  {
    await local.FILE_SYSTEM.writeFileSync(filePath, JSON.stringify(jsonObj), 'utf8', function (err) {
    if (err) {
        console.log("An error occured while writing JSON Object to File.");
        return console.log(err);
    }

    console.log("JSON file has been saved.");
    });
  },

  allowChannelResponse: async function(messageObj)
  {
    var jsonObj = await local.readJSONFile(local.channels_data_file);
    var channelID = messageObj.channel.id;
    var guildID = messageObj.guild.id;

    if (jsonObj[guildID] == undefined || jsonObj[guildID][channelID] == undefined)
      return true;

    return jsonObj[guildID][channelID] == 'locked' ? false : true;
  },

  pushIDRequest:function(id)
  {
    if (!local.commandRequests.includes(id))
      local.commandRequests.push(id);
  },

  removeIDRequest:function(id)
  {
    if (local.commandRequests.includes(id))
      local.commandRequests.splice(local.commandRequests.indexOf(id), 1);
  },


  fragmentText:function(ctx, text, maxWidth) {
      var textOriginal = text.replace("[NEW_LINE]", " [NEW_LINE] ").split(' ');
      var newLineIndexes = []

      var words = /*text.split(' ')*/textOriginal, lines = [], line = "";
      if (ctx.measureText(text).width < maxWidth) {
          return [text];
      }
      while (words.length > 0) {
          var split = false;

            //if (words[0].toUpperCase().includes("[NEW LINE]"))
              //split = true;

            while (ctx.measureText(words[0]).width >= maxWidth) {
                var tmp = words[0];
                words[0] = tmp.slice(0, -1);
                if (!split) {
                    split = true;
                    words.splice(1, 0, tmp.slice(-1));
                } else {
                    words[1] = tmp.slice(-1) + words[1];
                }

            }


          if (line.includes("[NEW_LINE]"))
          {
            //newLineIndexes
            line = line.replace("[NEW_LINE] ", "");
            lines.push(line);
            line = "";
          }

          if ((ctx.measureText(line + words[0]).width < maxWidth)) {
              //continue current line
              line += words.shift() + " ";
          } 

          else {
              //start new line
              lines.push(line);
              line = "";
          }
          if (words.length === 0) {
              lines.push(line);
          }
      }
      return lines;
  },

  isNumber:function(num)
  {
    return Number.isNaN(parseFloat(num));
  },
};

Number.prototype.pad = function(size) {
    var s = String(this);
    while (s.length < (size || 2)) {s = "0" + s;}
    return s;
}

String.prototype.capitalize = function() {
  var charArray = this.split('');
  charArray[0] = charArray[0].toUpperCase();
  return charArray.join('');
}

String.prototype.lowerCase = function() {
  var charArray = this.split('');
  for (i = 0; i < charArray.length; i++)
    charArray[i] = charArray[i].toLowerCase();
  return charArray.join('');
}
module.exports = local;
