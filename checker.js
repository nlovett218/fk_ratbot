const LOG = require('./functions/util/LogAction');
const util = require('util');
const Constants = require('./functions/util/Constants');
const HandleFunctionCall = require('./functions/HandleFunctionCall');
const https = require('https')
var request = require("request");
const Group = require('./classes/Group');
const FILE_SYSTEM = require('fs');

const defaultOptions = {
  hostname: Constants.apiPath,
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
}

const rmdirSync = (path) => 
  new Promise(function (resolve, reject) {
  	FILE_SYSTEM.rmdirSync(path, { recursive: true })
    /*FILE_SYSTEM.mkdir(path, function (error, result) {

      if (error) {
        reject(error);
      } else {
        resolve(result);
        console.log("Log directory is removed.");
      }
    })*/
})


var Groups = [];
var CurrentTrackerData = {};

var CurrentSessionData = {
	list: [],
	playerData: []
};

var CurrentServerData = {};

async function readTrackerData()
{
	(async () => {
  		var trackerFile = await Constants.readJSONFile(Constants.group_tracker_file);
  		
  		CurrentTrackerData = trackerFile;
	})();


}

Constants.USER.on('init-checker', async () => {

	Constants.GlobalUsers = await Constants.readJSONFile(`./data/GlobalUser.json`);

	//await readTrackerData();

	setInterval(checkIdentifiers, Constants.refreshTime);
	console.log("Running checker.js...");


	//var testGroup = new Group("TestGroup", "T5RoE69"/*Constants.returnNewID()*/);


	await GetSessionGroups();

});

async function GetSessionGroups()
{
	Groups = [];

	var groupList = await Constants.readJSONFile(Constants.group_tracker_file);

	if (groupList == null)
	{
		groupList = {
			groups: []
		};
	}

	for (const group of groupList.groups)
	{
		var newGroup = await Constants.GetGroup(group);

		Groups.push(newGroup);
	}
}

async function getNotificationMode(callerId)
{
  //var notifMode = parseInt(args[1]);

  /*if (notifMode != 0 && notifMode != 1 && notifMode != 2 && notifMode != 3)
    return cmd.reply("invalid notification mode number!");*/

  var userNotificationData = await Constants.readJSONFile(Constants.user_data_file);

  if (userNotificationData[callerId] == undefined || userNotificationData[callerId] == null)
  {
    return 0;
  //await Constants.writeJSONFile(channels);
  }
  else {
    return userNotificationData[callerId].notificationMode;
  }
}

async function getPlayersOnServer() {

	console.log("Checking players on server...");

	//var options = defaultOptions;

	var path = `/servers/${Constants.FK_SERVERID}?include=player`;


	request(`${Constants.apiPath}${path}`, {'auth': {
    	'bearer': Constants.BM_TOKEN
  	}}, 
  	async function (error, response, body) {
		//console.log(body);

		CurrentServerData = JSON.parse(body);

		//console.log(CurrentServerData);

		var includes = CurrentServerData.included;

		var players = includes.filter(obj => obj.type.toLowerCase() == "player");

		CurrentServerData.PlayerList = players;
		Constants.ServerPlayers = players;

		//console.log(players);

		/*var includeCheck = [
			"da26ta",
			"bandit",
			"harrow",
			"andrew",
			"reaper"
		];*/

		var onlineIds = [];

		for (const player of players)
		{

			//if (!(includeCheck.includes(player.attributes.name.toLowerCase())))
				//continue;

			if (!(await Constants.GlobalUserExists(player.id)))
			{

				console.log(`inserting global user ${player.id} ${player.attributes.name}`);
				var userData = {
					name: player.attributes.name,
					bmid: player.id,
					aliases: [],
					trackedBy: [],
					groups: [],

					status: Constants.PlayerStatus.ONLINE
				}

				await Constants.InsertGlobalUser(userData);
				//console.log("user inserted");
			}
			else
			{
				var user = await Constants.GetGlobalUserData(player.id);

				/*if (player.id == '904085074')
				{
					console.log(user);
				}*/

				if (user.status == Constants.PlayerStatus.OFFLINE)
				{
					console.log(`Status changed for ${user.name}`);
					await export_functions.NotifyWentOnline(player, user);
				}

				//console.log(`global user ${player.id} exists`);
				await Constants.UpdateGlobalUserAlias(player.id, player.attributes.name)
				await Constants.UpdateGlobalUserStatus(player.id, Constants.PlayerStatus.ONLINE)
				onlineIds.push(player.id);
			}
		}

		var offlineList = Constants.GlobalUsers.users.filter(guser => (!(onlineIds.includes(guser.bmid))));


		for (const offlineUser of offlineList)
		{
			var indexOfOfflineUser = Constants.GlobalUsers.users.indexOf(offlineUser);

			if (Constants.GlobalUsers.users[indexOfOfflineUser] == undefined || Constants.GlobalUsers.users[indexOfOfflineUser] == null)
				return console.log(`GlobalUser index does not exist for index ${indexOfOfflineUser}`);

			if (Constants.GlobalUsers.users[indexOfOfflineUser].status == Constants.PlayerStatus.ONLINE)
				await export_functions.NotifyWentOffline(offlineUser);

			Constants.GlobalUsers.users[indexOfOfflineUser].status = Constants.PlayerStatus.OFFLINE;
		}

		await Constants.writeJSONFile(`./data/GlobalUser.json`, Constants.GlobalUsers);

	});
}

async function refreshGroups()
{
	console.log("Refreshing groups...");
	for (const Group of Groups)
	{
		console.log(`Refreshing group ${Group.name()}`);
		await Group.refreshData();
	}
}

async function saveMemberData()
{
	for (const Group of Groups)
	{
		console.log(`Saving group ${Group.name()}`);
		await Group.saveMemberData();
	}
}

async function checkOfflinePlayers()
{

}

async function checkTrackedPlayers()
{

}

async function checkIdentifiers() {
	await getPlayersOnServer();
	await refreshGroups();
	//await checkOfflinePlayers();
	//await checkTrackedPlayers();

	await saveMemberData();
};

async function insertTracker(id, name, group) {

}

async function insertSessionPlayer(id, name) {

	if (CurrentSessionData.list.includes(id))
		return;

	var playerData = {
		pid: id,
		cur_name: name,
		alias: aliases,
		status: Constants.PlayerStatus.ONLINE
	}

	CurrentSessionData.list.push(id);

	CurrentSessionData.playerData.push(playerData);
}



var export_functions = {

	IsOnline:async function(pid)
	{
		return Constants.GlobalUsers.users.filter(guser => guser.bmid == pid && guser.status == Constants.PlayerStatus.ONLINE).length > 0;
	},

	NotifyWentOnline:async function(player, GlobalUser)
	{
		for (const NotifyMember of GlobalUser.trackedBy)
		{
			var DiscordUser = await Constants.client.users.fetch(NotifyMember).catch(() => null);

    	if (!DiscordUser) continue;

    	var DiscordUserBMID = await Constants.GetBMIDFromDiscordUser(NotifyMember);

			if (await getNotificationMode(NotifyMember) == 0)
				continue;

			if (await getNotificationMode(NotifyMember) == 2 && player.attributes.name.trim() == GlobalUser.name.trim())
				continue;

			if (DiscordUserBMID != null) {
				if (await getNotificationMode(NotifyMember) == 3 && (!(await export_functions.IsOnline(DiscordUserBMID))))
					continue;
			}

			console.log(`Notifying ${NotifyMember} that ${GlobalUser.name.trim()} has came online!`);
			await Constants.sendDirectMessage(NotifyMember, `Tracked user **${GlobalUser.name.trim()}** has came online under the name **${player.attributes.name.trim()}**!`, null)
			await Constants.sendChannelMessage(NotifyMember, `Tracked user **${GlobalUser.name.trim()}** has came online under the name **${player.attributes.name.trim()}**!`);
		}
	},

	NotifyWentOffline: async function(GlobalUser)
	{
		for (const NotifyMember of GlobalUser.trackedBy)
		{
			var DiscordUser = await Constants.client.users.fetch(NotifyMember).catch(() => null);

    	if (!DiscordUser) continue;

    	var DiscordUserBMID = await Constants.GetBMIDFromDiscordUser(NotifyMember);

			if (await getNotificationMode(NotifyMember) == 0)
				continue;

			if (DiscordUserBMID != null) {
				if (await getNotificationMode(NotifyMember) == 3 && (!(await export_functions.IsOnline(DiscordUserBMID))))
					continue;
			}

			if (await getNotificationMode(NotifyMember) == 2)
				continue;

			await Constants.sendDirectMessage(NotifyMember, `Tracked user **${GlobalUser.name.trim()}** has went offline!`, null);
			await Constants.sendChannelMessage(NotifyMember, `Tracked user **${GlobalUser.name.trim()}** has went offline!`);
		}
	},

	GroupExists:function(name)
	{
		return Groups.filter(group => group.name().toLowerCase() == name.toLowerCase()).length > 0;
	},

	CreateGroup:async function(callerId, name, gid)
	{
		var success = false;

		try {
			var group = new Group(name, gid);

			Groups.push(group);

			//console.log(group);

			await Constants.until(_ => group.dirCreated == true);

			await export_functions.SetGroupOwner(callerId, gid);

			success = true;
		}
		catch (err)
		{
			success = false;
		}

		if (!(export_functions.GroupExists(name)))
			success = false;

		return success;
	},

	RemoveGroup:async function(callerId, gid)
	{

	},

	SetGroupOwner:async function(callerId, gid)
	{

		var GroupInfo = await Constants.readJSONFile(`./data/${gid}/GroupInfo.json`);

		if (GroupInfo == null)
			return;

		GroupInfo.startedBy = callerId;
		GroupInfo.created = Constants.moment().format(Constants.momentTimeFormat);

		await Constants.writeJSONFile(`./data/${gid}/GroupInfo.json`, GroupInfo);

		var group = Groups.filter(group => group.gid().toLowerCase() == gid.toLowerCase())[0];

		group.setOwner(callerId);
	},

	AddMember:async function(callerId, gid, pid, pname)
	{
		var Group = Groups.filter(group => group.gid() == gid)[0];

		await Group.addMember(callerId, pname, pid);
		await Group.saveMemberData();

		await Constants.UpdateGlobalUserGroup(pid, gid);
	},

	RemoveMember:async function(callerId, gid, pid)
	{
		var Group = Groups.filter(group => group.gid() == gid)[0];

		//var GroupMember = Group.members.filter(member => member.bmid == pid)[0];
		var GlobalUserData = await Constants.GetGlobalUserData(pid);
		var indexOfGlobalUser = Constants.GlobalUsers.users.indexOf(GlobalUserData);

		//console.log(GlobalUserData);

		GlobalUserData.groups = GlobalUserData.groups.filter(g => g.toLowerCase() != gid.toLowerCase());

		Constants.GlobalUsers.users[indexOfGlobalUser] = GlobalUserData;

		await Constants.writeJSONFile(`./data/GlobalUser.json`, Constants.GlobalUsers);

		Group.members = Group.members.filter(member => member.bmid != pid);
		await rmdirSync(`./data/${gid}/${pid}`);
		await Group.refreshData();
	},

	AlreadyTracking:async function(callerId, gid, pid)
	{
		return await Constants.GlobalUsers.users.filter(guser => guser.bmid == pid && guser.trackedBy.includes(callerId)).length > 0;
	},

	TrackUser:async function(callerId, gid, pid)
	{
		var group = Groups.filter(group => group.gid().toLowerCase() == gid.toLowerCase())[0];

		await Constants.TrackGlobalUser(callerId, pid);
		await group.trackMember(callerId, pid);
	},

	UntrackUser:async function(callerId, gid, pid)
	{
		var group = Groups.filter(group => group.gid().toLowerCase() == gid.toLowerCase())[0];

		await Constants.UntrackGlobalUser(callerId, pid);
		await group.untrackMember(callerId, pid);

		if (export_functions.GetTrackers(pid).length >= 0)
		{
			await export_functions.RemoveMember(callerId, gid, pid);
		}
	},

	GetGroupIDFromName:function(gname)
	{
		var group = Groups.filter(group => group.name().toLowerCase() == gname.toLowerCase())[0];
		return group.gid();
	},

	GetGroupFromID:function(gid)
	{
		var group = Groups.filter(group => group.gid().toLowerCase() == gid.toLowerCase())[0];
		return group;
	},

	GetGroups:function()
	{
		return Groups;
	},

	GetGroupMembers:function(gid)
	{
		return Constants.GlobalUsers.users.filter(guser => guser.groups.includes(gid));
	},

	GetTrackers:function(pid)
	{
		if (Constants.GlobalUsers.users.filter(guser => guser.bmid.toLowerCase() == pid.toLowerCase()).length <= 0)
		{
			console.log(`GetTrackers: User not found`)
			return [];
		}

		return Constants.GlobalUsers.users.filter(guser => guser.bmid.toLowerCase() == pid.toLowerCase())[0].trackedBy;
	},

	MemberExists:function(gid, pid)
	{
		if (Constants.GlobalUsers.users.filter(guser => guser.bmid == pid).length < 0)
			return false;

		return Constants.GlobalUsers.users.filter(guser => guser.bmid == pid)[0].groups.includes(gid);
	},

	GroupLimitReached:function(gid)
	{
		return (Constants.GlobalUsers.users.filter(guser => guser.groups.includes(gid)).length >= Constants.GroupLimit);
	},

	IsGroupCreator:function(callerId, gid)
	{
		var group = Groups.filter(group => group.gid().toLowerCase() == gid.toLowerCase())[0];

		return group.startedBy == callerId;
	}
};


module.exports = export_functions;