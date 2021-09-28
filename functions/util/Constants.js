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
  FILE_SYSTEM:require('fs'),
  channels_data_file: './channels-data.json',
  user_data_file: './user-notification-data.json',
  BotInfo:new BotInfo("FK Name Change Notifier", "0.12.5", "suff0cati0n", "fk!"),
  client:new Discord.Client(),
  config_file:'./config.json',
  group_tracker_file:'./data/Groups.json',
  momentTimeFormat: 'MM-DD-YYYY HH:mm:ss',
  guildPrefix: "GUILD_",
  botOwnerID: '201841156990959616', //201841156990959616
  commandCooldownTime: 500,
  refreshTime: 10000,
  IDLength: 7,
  GroupLimit: 10,

  Group:null,
  Member:null,

  BM_TOKEN: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbiI6IjgyNmUwYjYxZjMwYmM4NzQiLCJpYXQiOjE2MzIzNTUyOTksIm5iZiI6MTYzMjM1NTI5OSwiaXNzIjoiaHR0cHM6Ly93d3cuYmF0dGxlbWV0cmljcy5jb20iLCJzdWIiOiJ1cm46dXNlcjo0Njk0OTIifQ.vKgDP3OvsyE4ujuI6potdpqAcVzEpaF5ORxSiZErTHg',

  logsChannel: '890678117822246942',

  apiPath: "https://api.battlemetrics.com",
  FK_SERVERID: '8690764',

  reactionTimes: {
    test: 20000,
    doConfirmInput: 10000,
  },

  USER:new Events.EventEmitter(),
  SERVER:new Events.EventEmitter(),

  GlobalUsers: {},
  ServerPlayers: [],

  commandRequests: [

  ],

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

  PlayerStatus: {
    ONLINE: 'ONLINE',
    OFFLINE: 'OFFLINE'
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

      for (i = 0; i < msgFormatIdentifiers.length; i++)
        msgFormatted = String(msgFormatted).replace(`[${i}]`, msgFormatIdentifiers[i]);
    }

    await user.send(msgFormatted).catch(() => {
       return console.log(`Attempt to send direct message to ${userId} but user has DMs closed or has no mutual servers with the bot`);
    });
  },

  sendChannelMessage:async function(userId, msg, msgFormatIdentifiers)
  {
    //const user = await local.client.users.fetch(userId).catch(() => null);

    //if (!user) return;

    //console.log(local.client);

    var msgFormatted = msg;

    if (msgFormatIdentifiers != null) {

      for (i = 0; i < msgFormatIdentifiers.length; i++)
        msgFormatted = String(msgFormatted).replace(`[${i}]`, msgFormatIdentifiers[i]);
    }

    var responseChannelData = await local.readJSONFile(local.channels_data_file);
    var guildIDs = Object.keys(responseChannelData);

    for (const id of guildIDs)
    {
      if (responseChannelData[id]["responseChannel"] != undefined && responseChannelData[id]["responseChannel"] != null)
      {
        //const guild = await local.client.guilds.fetch(guild).catch(() => null);
        var responseChannelID = responseChannelData[id]["responseChannel"];

        try {
        //if (guild != null && guild != undefined)
        //{
          //const channel = await guild.channels
          var channelObj = local.client.channels.cache.get(responseChannelID);
          channelObj.send(`<@${userId}> -> ${msgFormatted}`);
        //}
        }
        catch (err)
        {
          console.log(err);
        }
      }
    }

    /*await user.send(msgFormatted).catch(() => {
       return console.log(`Attempt to send direct message to ${userId} but user has DMs closed or has no mutual servers with the bot`);
    });*/

    //console.log(user);
  },

  GetBMIDFromDiscordUser:async function(callerId)
  {
    var userNotificationData = await local.readJSONFile(local.user_data_file);

    if (userNotificationData[callerId] == undefined || userNotificationData[callerId] == null)
    {
      return null;
    //await Constants.writeJSONFile(channels);
    }
    else {
      return userNotificationData[callerId].bmid;
    }
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
    //var obj = null;

    try {
      var obj = await local.FILE_SYSTEM.readFileSync(filePath, 'utf8', function (err, data) 
      {
          if (err) return null; // we'll not consider error handling for now

          var parseObj = JSON.parse(data);
          return parseObj;

      });
    }
    catch (err)
    {
      return null;
    }

    if (obj == null) return null;

    return JSON.parse(obj);

    //return JSON.parse(obj);
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
      local.commandRequests = local.commandRequests.filter(req => req != id);
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

  returnNewID:function()
  {
    var chars = ["abcdefghijklmnopqrstuvwxyz","ABCDEFGHIJKLMNOPQRSTUVWXYZ","0123456789"];
    var id = "";

    for (i = 0; i < local.IDLength; i++)
    {
      var charArrayIndex = Math.floor((Math.random() * chars.length));
      var charFromArray = Math.floor((Math.random() * chars[charArrayIndex].length));

      id += chars[charArrayIndex][charFromArray];
    }

    return id;
  },

  GlobalUserExists:async function(id)
  {
    local.GlobalUsers = await local.readJSONFile(`./data/GlobalUser.json`);

    if (local.GlobalUsers == null)
    {
      console.log("global users is null");
      local.GlobalUsers = {
        users: []
      };
    }

    //console.log(local.GlobalUsers);
    //console.log(`checking ${id}`);

    return local.GlobalUsers.users.filter(user => user.bmid == id).length > 0;
  },

  GetGlobalUserData:async function(id)
  {
    local.GlobalUsers = await local.readJSONFile(`./data/GlobalUser.json`);

    if (local.GlobalUsers == null)
    {
      local.GlobalUsers = {
        users: []
      };
    }

    var list = await local.GlobalUsers.users.filter(user => user.bmid == id);

    /*console.log(list.length);

    if (Object.size(list) == 0);
    {
      console.log(`no user found with id ${id}`);
      return null;
    }*/

    //console.log(local.GlobalUsers.users.filter(user => user.bmid == id));
    return local.GlobalUsers.users.filter(user => user.bmid == id)[0];
  },

  InsertGlobalUser:async function(userData)
  {
    local.GlobalUsers = await local.readJSONFile(`./data/GlobalUser.json`);

    if (local.GlobalUsers == null)
    {
      local.GlobalUsers = {
        users: []
      };
    }

    local.GlobalUsers.users.push(userData);


    await local.writeJSONFile(`./data/GlobalUser.json`, local.GlobalUsers);
  },

  TrackGlobalUser:async function(callerId, id)
  {
    local.GlobalUsers = await local.readJSONFile(`./data/GlobalUser.json`);

    if (local.GlobalUsers == null)
    {
      local.GlobalUsers = {
        users: []
      };
    }

    //local.GlobalUsers.users.push(userData);

    var globalUserFiltered = local.GlobalUsers.users.filter(user => user.bmid == id);

    if (globalUserFiltered.length <= 0)
      return false;

    var indexOfGlobalUser = local.GlobalUsers.users.indexOf(globalUserFiltered[0]);

    if (local.GlobalUsers.users[indexOfGlobalUser]["trackedBy"] == null || local.GlobalUsers.users[indexOfGlobalUser]["trackedBy"] == undefined)
    {
      console.log(`aliases is null for index ${indexOfGlobalUser}`);
      return false;
    }

    if (!(local.GlobalUsers.users[indexOfGlobalUser]["trackedBy"].includes(callerId)))
      local.GlobalUsers.users[indexOfGlobalUser]["trackedBy"].push(callerId);

    await local.writeJSONFile(`./data/GlobalUser.json`, local.GlobalUsers);

    return true;
  },

  UntrackGlobalUser:async function(callerId, id)
  {
    local.GlobalUsers = await local.readJSONFile(`./data/GlobalUser.json`);

    if (local.GlobalUsers == null)
    {
      local.GlobalUsers = {
        users: []
      };
    }

    //local.GlobalUsers.users.push(userData);

    var globalUserFiltered = local.GlobalUsers.users.filter(user => user.bmid == id);

    if (globalUserFiltered.length <= 0)
      return false;

    var indexOfGlobalUser = local.GlobalUsers.users.indexOf(globalUserFiltered[0]);

    if (local.GlobalUsers.users[indexOfGlobalUser]["trackedBy"] == null || local.GlobalUsers.users[indexOfGlobalUser]["trackedBy"] == undefined)
    {
      console.log(`aliases is null for index ${indexOfGlobalUser}`);
      return false;
    }

    //if (!(local.GlobalUsers.users[indexOfGlobalUser]["trackedBy"].includes(callerId)))
    local.GlobalUsers.users[indexOfGlobalUser]["trackedBy"] = local.GlobalUsers.users[indexOfGlobalUser]["trackedBy"].filter(pid => pid != callerId);

    await local.writeJSONFile(`./data/GlobalUser.json`, local.GlobalUsers);

    return true;
  },

  isGlobalUserOnline:async function(id)
  {
    local.GlobalUsers = await local.readJSONFile(`./data/GlobalUser.json`);

    if (local.GlobalUsers == null)
    {
      local.GlobalUsers = {
        users: []
      };
    }

    var globalUserFiltered = local.GlobalUsers.users.filter(user => user.bmid == id);

    if (globalUserFiltered.length <= 0)
      return false;

    var indexOfGlobalUser = local.GlobalUsers.users.indexOf(globalUserFiltered[0]);

    if (local.GlobalUsers.users[indexOfGlobalUser]["aliases"] == null || local.GlobalUsers.users[indexOfGlobalUser]["aliases"] == undefined)
    {
      console.log(`aliases is null for index ${indexOfGlobalUser}`);
      return false;
    }

    return local.GlobalUsers.users[indexOfGlobalUser].status == local.PlayerStatus.ONLINE ? true : false;
  },

  UpdateGlobalUserAlias:async function(id, alias)
  {
    local.GlobalUsers = await local.readJSONFile(`./data/GlobalUser.json`);

    if (local.GlobalUsers == null)
    {
      local.GlobalUsers = {
        users: []
      };
    }

    if (local.GlobalUsers["users"] == null || local.GlobalUsers["users"] == undefined)
    {
      console.log(`users is null`);
      return;
    }

    var globalUserFiltered = local.GlobalUsers.users.filter(user => user.bmid == id);

    if (globalUserFiltered.length <= 0)
    {
      console.log("could not find global user");
      return;
    }

    var indexOfGlobalUser = local.GlobalUsers.users.indexOf(globalUserFiltered[0]);

    if (local.GlobalUsers.users[indexOfGlobalUser]["aliases"] == null || local.GlobalUsers.users[indexOfGlobalUser]["aliases"] == undefined)
    {
      console.log(`aliases is null for index ${indexOfGlobalUser}`);
      return;
    }

    if (!(local.GlobalUsers.users[indexOfGlobalUser].aliases.includes(alias)))
    {
      if (!(alias == local.GlobalUsers.users[indexOfGlobalUser].name))
        local.GlobalUsers.users[indexOfGlobalUser].aliases.push(alias);
    }

    //GlobalUsers.users.push(userData);

    await local.writeJSONFile(`./data/GlobalUser.json`, local.GlobalUsers);
  },

  UpdateGlobalUserStatus:async function(id, status)
  {
    local.GlobalUsers = await local.readJSONFile(`./data/GlobalUser.json`);

    if (local.GlobalUsers == null)
    {
      local.GlobalUsers = {
        users: []
      };
    }

    var globalUserFiltered = local.GlobalUsers.users.filter(user => user.bmid == id);

    if (globalUserFiltered.length <= 0)
      return;

    var indexOfGlobalUser = local.GlobalUsers.users.indexOf(globalUserFiltered[0]);

    local.GlobalUsers.users[indexOfGlobalUser].status = status;

    //GlobalUsers.users.push(userData);

    await local.writeJSONFile(`./data/GlobalUser.json`, local.GlobalUsers);
  },

  UpdateGlobalUserGroup:async function(pid, gid)
  {
    local.GlobalUsers = await local.readJSONFile(`./data/GlobalUser.json`);

    if (local.GlobalUsers == null)
    {
      local.GlobalUsers = {
        users: []
      };
    }

    var globalUserFiltered = local.GlobalUsers.users.filter(user => user.bmid == pid);

    if (globalUserFiltered.length <= 0)
      return;

    var indexOfGlobalUser = local.GlobalUsers.users.indexOf(globalUserFiltered[0]);

    if (!(local.GlobalUsers.users[indexOfGlobalUser].groups.includes(gid)))
    local.GlobalUsers.users[indexOfGlobalUser].groups.push(gid);

    //GlobalUsers.users.push(userData);

    await local.writeJSONFile(`./data/GlobalUser.json`, local.GlobalUsers);
  },

  GetGroup:async function(id)
  {
    var GroupInfo = await local.readJSONFile(`./data/${id}/GroupInfo.json`);

    if (GroupInfo == null)
      return null;

    return new local.Group(GroupInfo.name, GroupInfo.gid);
  },

  getBetween:function(str, first, last) {
    if (!str || !str.split(first)[1]) {
        return "";
    }
    return str.split(first)[1].split(last)[0];
  },

  returnClosestMatchToName:function(stringToMatchArrayList)
  {
      var stringToMatchArray = stringToMatchArrayList.join(" ").split('');

      var IDMatchFound = false;

      //console.log(stringToMatchArray);

      //console.log(`Length: ${local.ServerPlayers.length}`);

      /*if (local.ServerPlayers.length <= 0)
      {
        console.log(`Length is <= 0 | Length: ${local.ServerPlayers.length}`);
        return null;
      }*/

      //var card = null;
      //var card_index = -1;

      try {
        var playerMatch = {};

        if (stringToMatchArrayList[0] != undefined)
        {
          var firstMatch = stringToMatchArrayList[0];

          //console.log(`firstMatch: ${firstMatch}`);

          var searchForPlayerByIDResult = local.GlobalUsers.users.filter(guser => guser.bmid.toUpperCase() == String(firstMatch).toUpperCase())[0];

          //console.log(searchForPlayerByIDResult);

          if (!(searchForPlayerByIDResult == undefined && searchForPlayerByIDResult == null))
          {

            IDMatchFound = true;

            return {IDMatch: IDMatchFound, user: searchForPlayerByIDResult };
          }
        }

        for (i = 0; i < local.GlobalUsers.users.length; i++)
        {
          var player = local.GlobalUsers.users[i]//hand.hand[i].startsWith("LAND") ? Constants.lands.filter(search => search.ID == hand.hand[i])[0] : Constants.cards.filter(search => search.ID == hand.hand[i])[0];

          //console.log(player);

          var playerNameArray = player.name.toLowerCase().split('');

          var name_match = 0;
          var consecutive_letters = 0;

          stringToMatchArray.forEach(function(char) {
            var indexOfChar = stringToMatchArray.indexOf(char);
            if (playerNameArray.includes(String(char).toLowerCase()))
            {
              name_match++;

              if (indexOfChar == stringToMatchArray.length - 1)
                return;

              if ((String(stringToMatchArray[indexOfChar]).toLowerCase() + String(stringToMatchArray[indexOfChar + 1]).toLowerCase()) == (String(playerNameArray[indexOfChar]).toLowerCase() + String(playerNameArray[indexOfChar + 1]).toLowerCase()))
                consecutive_letters++;
            }
          });

          playerMatch[player.bmid] = name_match + consecutive_letters;
        }

        //card = null;

        var keys = Object.keys(playerMatch);
        var values = Object.values(playerMatch);
        var player_index = values.indexOf(Math.max.apply(Math, values));

        if (player_index < 0)
          return null;

        var player_id = keys[player_index];

        var foundPlayer = local.GlobalUsers.users.filter(guser => guser.bmid == player_id)[0];

        //var foundPlayer = local.ServerPlayers[GlobalServerPlayerIndex];

        /*for (const key of keys)
        {
          if (key != '904085074')
            continue;

          console.log(key);
          var indexOfKey = keys.indexOf(key);

          console.log(values[indexOfKey]);
          //console.log(values);
        }*/
        //console.log("------");
        //console.log(player_index); //13
        //console.log(GlobalServerPlayerIndex); //-1
        //console.log(foundPlayer); //undefined

        return {IDMatch: IDMatchFound, user: foundPlayer };
      }
      catch (err)
      {
        console.log(err);
        return null;
      }
  },

  doConfirmInput:async function(callerId, msgObj, msg, body = "Are you sure you want to do this?", confirmResponse = "action confirmed!", cancelResponse = "action canceled!")
  {
    local.pushIDRequest(callerId);

    //console.log(msgObj);

    const filter = (reaction, user) => {
      //console.log(reaction);
      return [local.emoji_id.yes_mark, local.emoji_id.no_mark].includes(reaction._emoji.name) && user.id == callerId;
    };

    var confirm = 0;

    var message = await msgObj.channel.send(`<@${callerId}> -> ${body}`);

    message.react(local.emoji_id.yes_mark);
    message.react(local.emoji_id.no_mark);

    var canceled = false;

    await message.awaitReactions(filter, { max: 1, time: local.reactionTimes.doConfirmInput, errors: ['time'] })
      .then(collected => {
          const reactions = collected.array();

        confirm = reactions[0]._emoji.name == local.emoji_id.yes_mark ? 1 : null;

        if (confirm == null)
        {
          canceled = true;
          message.edit(`<@${callerId}> -> ${cancelResponse}`);
          local.removeIDRequest(callerId);
          return;
        }

        message.edit(`<@${callerId}> -> ${confirmResponse}`);

      })
      .catch(collected => {
          canceled = true;
          message.edit(`<@${callerId}> -> ${cancelResponse}`);
          //Constants.removeIDRequest(obj.id);
          local.removeIDRequest(callerId);
      });

      if (canceled)
        return false;

      local.removeIDRequest(callerId);

      return true;
  }
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

Object.size = function(obj) {
  var size = 0,
    key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) size++;
  }
  return size;
};

module.exports = local;
