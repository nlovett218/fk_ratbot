const Constants = require('../util/Constants');
const HandleFunctionCall = require('../HandleFunctionCall');
const checker = require('../../checker')

var local = {
 addgroup:async function(cmd, args)
 {
   var message = cmd.content;

   if (Constants.commandRequests.includes(cmd.author.id))
        return Constants.MessageCodes.USER_TASK_EXISTS;

   if (!(message.includes("[") && message.includes("]")))
   {
     return cmd.reply("no group name was detected! Be sure to include [] before and after the group name!  ```fk!add [[GROUP NAME]]```")
   }

   var groupname = Constants.getBetween(message, "[", "]");

   if (checker.GroupExists(groupname))
   {
     return cmd.reply("this group name already exists!");
   }

   var gid = Constants.returnNewID();

   if (checker.CreateGroup(cmd.author.id, groupname, gid)) {
     return cmd.reply(groupname + " was created! You can now start adding members to the group using ```fk!track [[GROUP NAME]] [PLAYER NAME OR ID]```")
   }
   else
     return cmd.reply("group not created! There might have been an error.")
 },

 removegroup:async function(cmd, args)
 {
    if (Constants.commandRequests.includes(cmd.author.id))
         return Constants.MessageCodes.USER_TASK_EXISTS;

    if (!(message.includes("[") && message.includes("]")))
    {
      return cmd.reply("no group name was detected! Be sure to include [] before and after the group name!  ```fk!add [[GROUP NAME]]```")
    }

    var groupname = Constants.getBetween(message, "[", "]");

    if (!(checker.GroupExists(groupname)))
    {
      return cmd.reply("this group name does not exist! If you want to create this group do ```fk!add [" + groupname + "]```");
    }

    var gid = checker.GetGroupIDFromName(groupname);

    if (checker.IsGroupCreator(cmd.author.id, gid))
    {
      var success = await checker.RemoveGroup(gid);

      if (success)
        return cmd.reply("group successfully deleted and all members untracked!");
      else
        return cmd.reply("an error occurred and the group could not be deleted, please contact the system admin!");
    }
    else
    {
      return cmd.reply("you are not the group creator!")
    }
 },

 copygroup:async function(cmd, args)
 {
   return cmd.reply("feature still being worked on!");
 },

 track:async function(cmd, args)
 {
   var message = cmd.content;

   //console.log(Constants.commandRequests);

   if (Constants.commandRequests.includes(cmd.author.id))
        return Constants.MessageCodes.USER_TASK_EXISTS;

   if (!(message.includes("[") && message.includes("]")))
   {
     return cmd.reply("no group name was detected! Be sure to include [] before and after the group name!  ```fk!track [[GROUP NAME]] [PLAYER NAME OR ID]```")
   }

   var groupname = Constants.getBetween(message, "[", "]");

   if (!(checker.GroupExists(groupname)))
   {
     return cmd.reply("this group name does not exist! If you want to create this group do ```fk!add [" + groupname + "]```");
   }

   var sindex = message.indexOf("]");
   var username = message.slice(sindex + 1, message.length).trim();

   //console.log(username);

   var user = Constants.returnClosestMatchToName([username]);
   var gid = checker.GetGroupIDFromName(groupname);

   if (checker.GroupLimitReached(gid))
   {
     return cmd.reply(`this group has reached the max limit of ${Constants.GroupLimit}!`);
   }

   if (user == null)
     return cmd.reply(`no user found`);

   var IDMatchFound = user.IDMatch;

   var IDString = IDMatchFound == false ? `Could not find user by ID, so a name search was performed.` : `Found user by ID!`;

   if (checker.MemberExists(gid, user.user.bmid))
   {

     if (await checker.AlreadyTracking(cmd.author.id, gid, user.user.bmid))
     {
       return cmd.reply(`you are already tracking ${user.user.name.trim()} [${user.user.bmid}] in this group!`);
     }

     if (await Constants.doConfirmInput(cmd.author.id, cmd, message, `User ${user.user.name.trim()} already exists in this group. Do you want to track this user?`, `You are now tracking ${user.user.name.trim()}!`, `Action canceled!`))
     {
       await checker.TrackUser(cmd.author.id, gid, user.user.bmid);
     }

     return;
     //return cmd.reply(`user ${user.user.name.trim()} already exists in this group!`);
   }

   if (await Constants.doConfirmInput(cmd.author.id, cmd, message, `${IDString} Do you want to start tracking ${user.user.name.trim()} in group ${groupname}?`, `User ${user.user.name.trim()} successfully added and tracked in group ${groupname}!`, `Action canceled.`))
   {


     await checker.AddMember(cmd.author.id, gid, user.user.bmid, user.user.name.trim());
   }

   //return cmd.reply(`found -> ${user.attributes.name}`);
 },

 untrack:async function(cmd, args)
 {
   var message = cmd.content;

   //console.log(Constants.commandRequests);

   if (Constants.commandRequests.includes(cmd.author.id))
        return Constants.MessageCodes.USER_TASK_EXISTS;

   if (!(message.includes("[") && message.includes("]")))
   {
     return cmd.reply("no group name was detected! Be sure to include [] before and after the group name!  ```fk!track [[GROUP NAME]] [PLAYER NAME OR ID]```")
   }

   var groupname = Constants.getBetween(message, "[", "]");

   if (!(checker.GroupExists(groupname)))
   {
     return cmd.reply("this group name does not exist! If you want to create this group do ```fk!add [" + groupname + "]```");
   }

   var sindex = message.indexOf("]");
   var username = message.slice(sindex + 1, message.length).trim();

   //console.log(username);

   var user = Constants.returnClosestMatchToName([username]);
   var gid = checker.GetGroupIDFromName(groupname);

   if (user == null)
     return cmd.reply(`no user found`);

   var IDMatchFound = user.IDMatch;

   var IDString = IDMatchFound == false ? `Could not find user by ID, so a name search was performed.` : `Found user by ID!`;

   if (checker.MemberExists(gid, user.user.bmid))
   {

     if (!(await checker.AlreadyTracking(cmd.author.id, gid, user.user.bmid)))
     {
       return cmd.reply(`you are not tracking ${user.user.name.trim()} [${user.user.bmid}]!`);
     }

     if (await Constants.doConfirmInput(cmd.author.id, cmd, message, `User ${user.user.name.trim()} exists in this group. Do you want to untrack this user?`, `You are now untracking ${user.user.name.trim()}!`, `Action canceled!`))
     {
       await checker.UntrackUser(cmd.author.id, gid, user.user.bmid);
       await checker.RemoveMember(cmd.author.id, gid, user.user.bmid)
     }

     return cmd.reply(`user ${user.user.name.trim()} [${user.user.bmid}] untracked!`);
     //return cmd.reply(`user ${user.user.name.trim()} already exists in this group!`);
   }

   return cmd.reply(`user is not a part of group ${groupname}!`);
 },

 initplayer:async function(cmd, args)
 {
    var message = cmd.content;
    var userData = await Constants.readJSONFile(Constants.user_data_file);

    var guildID = cmd.guild.id;
    var msgOwnerID = cmd.author.id;

    var sindex = message.indexOf(" ");
    var username = message.slice(sindex + 1, message.length).trim();

    var message = cmd.content;

    if (Constants.commandRequests.includes(cmd.author.id))
        return Constants.MessageCodes.USER_TASK_EXISTS;

    var user = Constants.returnClosestMatchToName([username]);

    if (user == null)
       return cmd.reply(`no user found`);

    var IDMatchFound = user.IDMatch;

    var IDString = IDMatchFound == false ? `Could not find user by ID, so a name search was performed.` : `Found user by ID!`;

    if (await Constants.doConfirmInput(cmd.author.id, cmd, message, `${IDString} Do you want to register ${user.user.name.trim()} [${user.user.bmid}] as your player?`, `User ${user.user.name.trim()} successfully registered!`, `Action canceled.`))
    {
      var bmid = user.user.bmid;

      if (userData[msgOwnerID] == undefined )
      {
        userData[msgOwnerID] = {};
        userData[msgOwnerID].bmid = bmid;
      //await Constants.writeJSONFile(channels);
      }
      else {
        userData[msgOwnerID].bmid = bmid;
      }

      await Constants.writeJSONFile(Constants.user_data_file, userData);
      await cmd.reply("player registered!");
    }
 },

 setnotifmode:async function(cmd, args)
 {
    var guildID = cmd.guild.id;
    var msgOwnerID = cmd.author.id;

    /*if (Constants.guildAdmins[guildID] == undefined || (!Constants.guildAdmins[guildID].includes(msgOwnerID) && msgOwnerID != Constants.botOwnerID))
      return;*/


    var notifMode = parseInt(args[1]);

    if (notifMode != 0 && notifMode != 1 && notifMode != 2 && notifMode != 3)
      return cmd.reply("invalid notification mode number!");

    if (notifMode == 3)
    {
      console.log(await Constants.GetBMIDFromDiscordUser(msgOwnerID));

      if (await Constants.GetBMIDFromDiscordUser(msgOwnerID) == null)
        return cmd.reply("to use this notification mode, you must first register your player BMID by using ```fk!init [PLAYER NAME OR ID]```");
    }

    var userNotificationData = await Constants.readJSONFile(Constants.user_data_file);

    if (userNotificationData[msgOwnerID] == undefined )
    {
      userNotificationData[msgOwnerID] = {};
      userNotificationData[msgOwnerID].notificationMode = notifMode;
    //await Constants.writeJSONFile(channels);
    }
    else {
      userNotificationData[msgOwnerID].notificationMode = notifMode;
    }

    await Constants.writeJSONFile(Constants.user_data_file, userNotificationData);
    await cmd.reply("notification mode saved!");
 },

 setresponsechannel:async function(cmd, args)
 {
   var guildID = cmd.guild.id;
   var msgOwnerID = cmd.author.id;

   if (Constants.guildAdmins[guildID] == undefined || (!Constants.guildAdmins[guildID].includes(msgOwnerID) && msgOwnerID != Constants.botOwnerID))
      return;

   var responseChannelData = await Constants.readJSONFile(Constants.channels_data_file);

   var channels_mentioned = cmd.mentions.channels.array();

  //console.log(channels_mentioned);
   //var channels = await Constants.readJSONFile(Constants.channels_data_file);

  channels_mentioned.forEach(async function(channel) {

    if (channel == null)
    {
      return;
    }

    if (responseChannelData[guildID] == undefined )
    {
      responseChannelData[guildID] = {};
      responseChannelData[guildID].responseChannel = channel.id;
      //await Constants.writeJSONFile(channels);
    }
    else {
      responseChannelData[guildID].responseChannel = channel.id;
    }
  });

  if (channels_mentioned.length < 1)
  {
    await cmd.reply("no channels were mentioned!");
    return;
  }

  await Constants.writeJSONFile(Constants.channels_data_file, responseChannelData);
  await cmd.reply("response channel saved!");

 },

 getgroups: async function(cmd, args)
 {
   var message = cmd.content;

   //console.log(Constants.commandRequests);

   if (Constants.commandRequests.includes(cmd.author.id))
        return Constants.MessageCodes.USER_TASK_EXISTS;


   var Created = [];
   var Tracked = [];

   var Groups = checker.GetGroups();


   for (const Group of Groups)
   {
     console.log(Group.startedBy);
     if (Group.startedBy == cmd.author.id)
     {
       if (!Created.includes(Group))
         Created.push(Group);
     }
     else
     {
       for (const member of Group.members)
       {
         if (member.trackedBy.includes(cmd.author.id))
         {
           if (!Tracked.includes(Group))
             Tracked.push(Group);
         }
       }
     }
   }

   var groupsCreatedStr = ``;
   var groupsTrackedStr = ``;

   for (const Group of Created)
   {
     groupsCreatedStr += `${Group.name()}\n`;
   }

   for (const Group of Tracked)
   {
     groupsTrackedStr += `${Group.name()}\n`;
   }

   if (Created.length <= 0)
     groupsCreatedStr = `NONE`;

   if (Tracked.length <= 0)
     groupsTrackedStr = `NONE`;

   const embed = new Constants.Discord.MessageEmbed()
    //console.log(obj.result[0].mtg_startingDeck);
    .setTitle(`Created/Tracked Groups`)
    .setColor(Constants.color_codes["red"])
    .setDescription(`TIMESTAMP: ${Constants.moment().format(Constants.momentTimeFormat)} EST`)
    .addField(`Groups Created`, `${groupsCreatedStr}`, false)
    .addField(`Groups Tracked`, `${groupsTrackedStr}`, false)
    .setFooter(`Total Groups: ${Created.length + Tracked.length}`)

    cmd.reply({embed});
 },

 lockchannel:async function(cmd, args)
 {
    var msgOwnerID = cmd.author.id;
    var guildID = cmd.guild.id;

    if (Constants.guildAdmins[guildID] == undefined || (!Constants.guildAdmins[guildID].includes(msgOwnerID) && msgOwnerID != Constants.botOwnerID))
      return;

    var channels_mentioned = cmd.mentions.channels.array();

    //console.log(channels_mentioned);
    var channels = await Constants.readJSONFile(Constants.channels_data_file);

    channels_mentioned.forEach(async function(channel) {

      if (channels == null)
      {
        return;
      }

      if (channels[guildID] == undefined )
      {
        channels[guildID] = {};
        channels[guildID][channel.id] = "locked";
        //await Constants.writeJSONFile(channels);
      }
      else {
        channels[guildID][channel.id] = "locked";

      }
    });

    if (channels_mentioned.length < 1)
    {
      await cmd.reply(" no channels were mentioned!");
      return;
    }

    await Constants.writeJSONFile(Constants.channels_data_file, channels);
    await cmd.reply(" the specified channels are now __**locked!**__ I will no longer respond to commands in these channels!");
  },

  unlockchannel:async function(cmd, args)
  {
    var msgOwnerID = cmd.author.id;
    var guildID = cmd.guild.id;

    if (Constants.guildAdmins[guildID] == undefined || (!Constants.guildAdmins[guildID].includes(msgOwnerID) && msgOwnerID != Constants.botOwnerID))
      return;

    var channels_mentioned = cmd.mentions.channels.array();
    var channels = await Constants.readJSONFile(Constants.channels_data_file);

    channels_mentioned.forEach(async function(channel) {


      if (channels == null)
      {
        return;
      }

      if (channels[guildID] == undefined )
      {
        channels[guildID] = {};
        channels[guildID][channel.id] = "unlocked";

      }
      else {
        channels[guildID][channel.id] = "unlocked";
        //await Constants.writeJSONFile(channels);
      }
    });

    if (channels_mentioned.length < 1)
    {
      await cmd.reply(" no channels were mentioned!");
      return;
    }

    await Constants.writeJSONFile(Constants.channels_data_file, channels);
    await cmd.reply(" the specified channels are now __**unlocked!**__ I will now respond to commands in these channels!");
  },

 searchaliases: async function(cmd, args)
 {
   var message = cmd.content;

   if (Constants.commandRequests.includes(cmd.author.id))
        return Constants.MessageCodes.USER_TASK_EXISTS;

   var sindex = message.indexOf(" ");
   var alias = message.slice(sindex + 1, message.length).trim();

  if (Constants.ServerPlayers.length <= 0)
  {
    return cmd.reply("server data has not been refreshed yet. Try again in a few seconds...");
  }

   var aliasList = Constants.GlobalUsers.users.filter(guser => guser.aliases.includes(alias));

   if (aliasList.length <= 0)
   {
     return cmd.reply("no matching users found with that alias!");
   }

   for (const user of aliasList)
   {
     var playingUnderName = `OFFLINE`;

     if (Constants.ServerPlayers.filter(player => player.id == user.bmid).length > 0)
       playingUnderName = Constants.ServerPlayers.filter(player => player.id == user.bmid)[0].attributes.name;

     var playingUnderStr = user.status == Constants.PlayerStatus.ONLINE ? `PLAYING UNDER: ${playingUnderName}` : `OFFLINE`;
     var memberstatus = user.status == Constants.PlayerStatus.ONLINE ? `<:doton:${Constants.emoji_id.doton}>` : `<:dotoff:${Constants.emoji_id.dotoff}>`;

     const embed = new Constants.Discord.MessageEmbed()
      //console.log(obj.result[0].mtg_startingDeck);
      .setTitle(`Matching Alias: ${alias}`)
      .setColor(Constants.color_codes["red"])
      .setDescription(`TIMESTAMP: ${Constants.moment().format(Constants.momentTimeFormat)} EST`)
      .addField(`${memberstatus} ${user.name}`, `${playingUnderStr}`, false)

      cmd.reply({embed});
   }
 },

 getaliases: async function(cmd, args)
 {
    var message = cmd.content;

    if (Constants.ServerPlayers.length <= 0)
    {
      return cmd.reply("server data has not been refreshed yet. Try again in a few seconds...");
    }

    if (Constants.commandRequests.includes(cmd.author.id))
        return Constants.MessageCodes.USER_TASK_EXISTS;

    if (message.includes("[") && message.includes("]"))
    {
      var groupname = Constants.getBetween(message, "[", "]");

      if (!(checker.GroupExists(groupname)))
      {
        return cmd.reply("this group name does not exist! If you want to create this group do ```fk!add [" + groupname + "]```");
      }

      var gid = checker.GetGroupIDFromName(groupname);
      var members = checker.GetGroupMembers(gid);

      //var getCommandString = getCommandsString();
      const embed = new Constants.Discord.MessageEmbed()
      //console.log(obj.result[0].mtg_startingDeck);
      .setTitle(`Players in Group ${groupname}`)
      .setColor(Constants.color_codes["red"])
      .setDescription(`TIMESTAMP: ${Constants.moment().format(Constants.momentTimeFormat)} EST`)
      .setFooter(`Total Members Online: ${members.filter(member => member.status == Constants.PlayerStatus.ONLINE).length}`)

      for (const member of members)
      {
        var memberstatus = member.status == Constants.PlayerStatus.ONLINE ? `<:doton:${Constants.emoji_id.doton}>` : `<:dotoff:${Constants.emoji_id.dotoff}>`;

        var playingUnderName = ``;

        //console.log(Constants.ServerPlayers.length);

        if (Constants.ServerPlayers.length <= 0)
          break;

        if (member.status == Constants.PlayerStatus.ONLINE)
          playingUnderName = Constants.ServerPlayers.filter(player => player.id == member.bmid)[0].attributes.name;

        var playingUnderStr = member.status == Constants.PlayerStatus.ONLINE ? `PLAYING UNDER: ${playingUnderName}` : `OFFLINE`;
        embed.addField(`${memberstatus} ${member.name} [${member.bmid}]`, `${playingUnderStr}`, false);
      }

      cmd.reply({embed});


      return;
    }

    var sindex = message.indexOf(" ");
    var username = message.slice(sindex + 1, message.length).trim();
    var player = Constants.returnClosestMatchToName([username]);
    var user = await Constants.GetGlobalUserData(player.user.bmid)
    var memberstatus = user.status == Constants.PlayerStatus.ONLINE ? `<:doton:${Constants.emoji_id.doton}>` : `<:dotoff:${Constants.emoji_id.dotoff}>`;
    var playingUnderName = ``;

    if (user.status == Constants.PlayerStatus.ONLINE)
          playingUnderName = Constants.ServerPlayers.filter(player => player.id == user.bmid)[0].attributes.name;
    else
      playingUnderName = `USER IS OFFLINE...`;

    const embed = new Constants.Discord.MessageEmbed()
    //console.log(obj.result[0].mtg_startingDeck);
    .setTitle(`${memberstatus} ${user.name} [${user.bmid}]`)
    .setColor(Constants.color_codes["red"])
    .setDescription(`TIMESTAMP: ${Constants.moment().format(Constants.momentTimeFormat)} EST`)
    .addField(`Total Aliases`, user.aliases.length, true)
    .setFooter(`Currently Playing Under: ${playingUnderName}`);

    for (const alias of user.aliases)
    {
      embed.addField(`Alias`, alias, false);
    }

    cmd.reply({embed});
 }

}

module.exports = local;
HandleFunctionCall.RegisterFunction(["addgroup", "add", "ag"], local.addgroup);
HandleFunctionCall.RegisterFunction(["removegroup", "remove", "rmv", "rg"], local.removegroup);

HandleFunctionCall.RegisterFunction(["copygroup", "copy", "cg"], local.copygroup);

HandleFunctionCall.RegisterFunction(["track", "t"], local.track);
HandleFunctionCall.RegisterFunction(["untrack", "ut"], local.untrack);

HandleFunctionCall.RegisterFunction(["notifications", "notif", "n"], local.setnotifmode);
HandleFunctionCall.RegisterFunction(["register", "init"], local.initplayer);

HandleFunctionCall.RegisterFunction(["setchannel", "set", "sc"], local.setresponsechannel);

HandleFunctionCall.RegisterFunction(["info", "alias", "find", "name"], local.getaliases);
HandleFunctionCall.RegisterFunction(["search"], local.searchaliases);
HandleFunctionCall.RegisterFunction(["groups"], local.getgroups);

HandleFunctionCall.RegisterFunction(["lock"], local.lockchannel);
HandleFunctionCall.RegisterFunction(["unlock"], local.unlockchannel);