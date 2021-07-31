const Constants = require('./Constants');
const FILE_SYSTEM = require('fs');
const moment = require('moment');

var Log = {
  LOG:function(data) {
    FILE_SYSTEM.appendFile('output/log/output-log_' + Log.getDateTime() + '.txt', Log.getTime() + " " + data, (err) => {
      if (err) throw err;

    });
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
