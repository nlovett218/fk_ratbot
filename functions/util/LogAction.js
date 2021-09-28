const Constants = require('./Constants');
const FILE_SYSTEM = require('fs');
const moment = require('moment');

var Log = {
  LOG:function(data, bNotify) {

    FILE_SYSTEM.mkdir("./output", (err) => {
        if (err) {
            throw err;
        }
        console.log("Output directory is created.");
    });

    FILE_SYSTEM.mkdir("./output/log", (err) => {
        if (err) {
            throw err;
        }
        console.log("Log directory is created.");
    });

    FILE_SYSTEM.appendFile('output/log/output-log_' + Log.getDateTime() + '.txt', Log.getTime() + " " + data, (err) => {
      if (err) throw err;

    });

    if (bNotify)
      Log.NOTIFY(data);
  },

  NOTIFY:function(data) {
    try {
      var channelObj = Constants.client.channels.cache.get(Constants.logsChannel);
      /*\const botPermCheck = guild.me.permissionsIn(channelObj);*/

      if (Constants.PermissionsManager.checkPermissionsForChannel(channelObj, channelObj.guild.me))
      {
        const statusChannel = channelObj;
        statusChannel.send(data);
      }
    }
    catch(err)
    {
      console.log(err);
    }
  },

  getTime:function() {
    return moment().format("H:mm:ss");
  },
  getDateTime:function() {
    return moment().format("MMDDYYYY");
  },
  getTimeFrom:function(amount, amountType) {
    return new Date(moment().subtract(amount, amountType).format(Constants.momentTimeFormat));
  }
};

module.exports = Log;
