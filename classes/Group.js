const Constants = require('../functions/util/Constants');
const FILE_SYSTEM = require('fs');
const Member = require('./Member');
const util = require('util');
//const mkdir = util.promisify(FILE_SYSTEM.mkdir);

const mkdir = (path) => 
  new Promise(function (resolve, reject) {
    FILE_SYSTEM.mkdir(path, function (error, result) {

      if (error) {
        reject(error);
      } else {
        resolve(result);
        console.log("Log directory is created.");
      }
    })
})

class Group {

  constructor(name, id)
  {
    this.groupName = name;
    this.groupId = id;
    this.dirCreated = false;

    (async () => {
      await this.createGroupDir();

      await this.refreshMembers();

      //await this.setOwner()
    })();

    this.startedBy = "";
    this.created = "";
  }

  name() { return this.groupName; }

  gid() { return this.groupId; }

  async createGroupDir() 
  {
    var groupJson = await Constants.readJSONFile(Constants.group_tracker_file);

    if (groupJson == null)
    {
      groupJson = {
        groups: []
      };
    }

    if (!(groupJson.groups.includes(this.groupId)))
      groupJson.groups.push(this.groupId);

    await Constants.writeJSONFile(Constants.group_tracker_file, groupJson);

    var id = this.groupId;

    if (!(FILE_SYSTEM.existsSync(`./data/${id}`)))
      await mkdir(`./data/${id}`);
    
    //console.log("Checking groupinfo");
    var GroupInfo = await Constants.readJSONFile(`./data/${this.groupId}/GroupInfo.json`);
    //console.log("Read groupinfo");

    if (GroupInfo == null)
    {
      GroupInfo = {
        name: this.groupName,
        gid: this.groupId,
        contributors: [],

        contributor_data: {},

        include: [],

        startedBy: "",
        created: ""
      };
    }
    else
    {
      this.startedBy = GroupInfo.startedBy;
      this.created = GroupInfo.created;
    }

    //console.log(GroupInfo);

    await Constants.writeJSONFile(`./data/${this.groupId}/GroupInfo.json`, GroupInfo);

    this.dirCreated = true;
  }

  async setOwner(callerId)
  {
    var id = this.groupId;

    if (!(FILE_SYSTEM.existsSync(`./data/${id}`)))
      await mkdir(`./data/${id}`);
    
    //console.log("Checking groupinfo");
    var GroupInfo = await Constants.readJSONFile(`./data/${this.groupId}/GroupInfo.json`);
    //console.log("Read groupinfo");

    if (GroupInfo == null)
    {
      GroupInfo = {
        name: this.groupName,
        gid: this.groupId,
        contributors: [],

        contributor_data: {},

        include: [],

        startedBy: callerId,
        created: Constants.moment().format(Constants.momentTimeFormat)
      };
    }

    //console.log(GroupInfo);

    GroupInfo.startedBy = callerId;
    GroupInfo.created = Constants.moment().format(Constants.momentTimeFormat);

    await Constants.writeJSONFile(`./data/${this.groupId}/GroupInfo.json`, GroupInfo);

    this.dirCreated = true;
  }

  members(bOnline = false) { 
    if (bOnline)
      return this.members.filter(member => Constants.isGlobalUserOnline(member.bmid)); 

    return this.members;
  }

  hasMember(bmid)
  {
    return this.members.filter(member => member.bmid == bmid).length > 0;
  }

  async refreshMembers() {
    this.members = await this.fetchMembers();


    //console.log(`refresh members ${this.groupId}`)
    //console.log(this.members);
  }

  async fetchMembers() {
    var members = [];

    //(async () => {
      try {
        var groupJson = await Constants.readJSONFile(Constants.group_tracker_file);

        if (groupJson == null)
          throw "GROUPS JSON IS CORRUPT!!!";

        if (groupJson.groups.includes(this.groupId))
        {

          var groupInfoJson = await Constants.readJSONFile(`./data/${this.groupId}/GroupInfo.json`);

          if (groupInfoJson == null)
          {
            throw "GroupInfo is corrupt!!";
            return;
          }

          //console.log(groupInfoJson);

          var membersInGroup = groupInfoJson.include;

          //console.log(membersInGroup)

          for (const groupMemberId of membersInGroup)
          {
            //console.log(groupMemberId);
            var member = new Member(groupMemberId);
            await member.populate();

            //console.log(`populated ${groupMemberId}`);

            if (!(this.hasMember(groupMemberId)))
            {
              //console.log(member)
              members.push(member);
            }

          }
        }
      }
      catch(err)
      {
        //console.log(err);
        return members;
      }

    //})();

    //console.log("members:");
    //console.log(members);

    this.members = members;
    return members;
  }

  async addMember(callerId, mname, mid)
  {

    var gid = this.groupId;

    if (!(FILE_SYSTEM.existsSync(`./data/${gid}`)))
      await mkdir(`./data/${gid}`);

    if (!(FILE_SYSTEM.existsSync(`./data/${gid}/${mid}`)))
      await mkdir(`./data/${gid}/${mid}`);


    var GroupInfoJson = await Constants.readJSONFile(`./data/${gid}/GroupInfo.json`);

    if (GroupInfoJson == null)
    {
      GroupInfoJson = {
        name: this.groupName,
        gid: this.groupId,
        contributors: [],

        contributor_data: {},

        include: [],

        startedBy: "",
        created: ""
      };
    }

    if (!GroupInfoJson.contributors.includes(callerId))
      GroupInfoJson.contributors.push(callerId);

    if (GroupInfoJson.contributor_data[callerId] == null || GroupInfoJson.contributor_data[callerId] == undefined)
    {
      GroupInfoJson.contributor_data[callerId] = {
        users: []
      };
    }

    if (!GroupInfoJson.contributor_data[callerId].users.includes(mid))
    GroupInfoJson.contributor_data[callerId].users.push(mid);

    if (!GroupInfoJson.include.includes(mid))
      GroupInfoJson.include.push(mid);

    await Constants.writeJSONFile(`./data/${gid}/GroupInfo.json`, GroupInfoJson);

    var playerJson = await Constants.readJSONFile(`./data/${this.groupId}/${mid}/Player.json`);

    if (playerJson == null)
    {
      playerJson = {
        name: mname,
        bmid: mid,
        aliases: [],

        trackedBy: [callerId]
      };

      await Constants.writeJSONFile(`./data/${this.groupId}/${mid}/Player.json`, playerJson);
    }

    if (await Constants.GlobalUserExists(mid))
    {
      var GlobalUserData = await Constants.GetGlobalUserData(mid);
      var indexOfUser = Constants.GlobalUsers.users.indexOf(GlobalUserData);

      if (!Constants.GlobalUsers.users[indexOfUser].trackedBy.includes(callerId))
        Constants.GlobalUsers.users[indexOfUser].trackedBy.push(callerId);

      playerJson.aliases = GlobalUserData.aliases;

      if (!Constants.GlobalUsers.users[indexOfUser].groups.includes(this.groupId))
        Constants.GlobalUsers.users[indexOfUser].groups.push(this.groupId);



      await Constants.writeJSONFile(`./data/${this.groupId}/${mid}/Player.json`, playerJson);
      await Constants.writeJSONFile(`./data/GlobalUser.json`, Constants.GlobalUsers);
    }

    await this.refreshMembers()
  }

  async removeMember(callerId, id)
  {

  }

  async trackMember(callerId, id)
  {
    for (const member of this.members)
    {
      if (member.bmid == id)
      {
        if (!member.trackedBy.includes(callerId))
        {
          member.trackedBy.includes(callerId);
          await member.save(this.groupId);
        }
      }
    }
  }

  async untrackMember(callerId, id)
  {
    for (const member of this.members)
    {
      if (member.bmid == id)
      {
        //if (!member.trackedBy.includes(callerId))
        //{
          member.trackedBy = member.trackedBy.filter(user => user != callerId);
          await member.save(this.groupId);
        //}
      }
    }
  }

  async saveMemberData()
  {
    //console.log(this.members);
    for (const member of this.members)
    {
      //console.log(`Saving member ${member.id()}`);
      await member.save(this.groupId);
    }
  }

  async refreshData()
  {
    await this.refreshMembers();

    for (const member of this.members) {

      var gid = this.groupId;

      if (!(FILE_SYSTEM.existsSync(`./data/${this.groupId}/${member.bmid}`)))
        await mkdir(`./data/${this.groupId}/${member.bmid}`);

      var memberJson = await Constants.readJSONFile(`./data/${this.groupId}/${member.bmid}/Player.json`);

      if (memberJson == null)
      {
          memberJson = {
          name: member.name,
          bmid: member.bmid,
          aliases: member.aliases,

          trackedBy: member.trackedBy
        };
      }

      if (await Constants.GlobalUserExists(member.bmid))
      {
        var GlobalUserData = await Constants.GetGlobalUserData(member.bmid);
        memberJson.aliases = GlobalUserData.aliases;
        await Constants.writeJSONFile(`./data/${this.groupId}/${member.bmid}/Player.json`, memberJson);
      }

    };
  }


}

module.exports = Group;
