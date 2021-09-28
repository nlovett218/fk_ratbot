const Constants = require('../functions/util/Constants');
const FILE_SYSTEM = require('fs');
//const Member = require('./classes/Member');
const util = require('util');

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

class Member {

  constructor(id, name, aliases = [], trackedBy = [])
  {
    this.name = name;
    this.bmid = id;

    this.aliases = aliases;
    this.trackedBy = trackedBy;

    /*"name": "Xizwhoa",
  "bmid": "1295308",
  "aliases": [
    "Survivor",
    "XizWhoa",
    "|SVG| XizWhoa"
  ],

  "trackedBy": [
    "904085074"
  ],*/

  /*(async () => {
    await this.populate();
  })();*/

  }

  name() { return this.name; }

  mid() { return this.bmid; }

  async populate() 
  {
    try {
      if (await Constants.GlobalUserExists(this.bmid))
      {
        var GlobalUserData = await Constants.GetGlobalUserData(this.bmid);


        //console.l

        this.name = GlobalUserData.name;
        this.aliases = GlobalUserData.aliases;
        this.trackedBy = GlobalUserData.trackedBy;

        //console.log(GlobalUserData);
      }
    }
    catch (err)
    {
      console.log(err);
    }
  }

  //refresh() { }

  track(callerId) { this.trackedBy.push(callerId); }

  async save(gid) { 

    var id = this.bmid;

    if (!(FILE_SYSTEM.existsSync(`./data/${gid}/${this.bmid}`)))
    {
      console.log(`Making dir for missing ${this.bmid} in ${gid}`)
      await mkdir(`./data/${gid}/${this.bmid}`);
    }

    var playerJson = {
      name: this.name,
      bmid: this.bmid,
      aliases: this.aliases,

      trackedBy: this.trackedBy
    };

    //console.log(gid);
    //console.log(this.bmid);

    await Constants.writeJSONFile(`./data/${gid}/${this.bmid}/Player.json`, playerJson);
  }

  setStatus(status) {

  }

}

module.exports = Member;
