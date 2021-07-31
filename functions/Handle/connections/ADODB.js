const FILE_SYSTEM = require('fs');
const Constants = require('../../util/Constants');
const ADODB = require('node-adodb');
//ADODB.debug = true;

var isDatabaseAvailable = false;
var connection;

Constants.MDB.on('check-file', function()
{
    console.log("Checking read access for " + Constants.mdbPath);
    FILE_SYSTEM.access(Constants.mdbPath, FILE_SYSTEM.constants.R_OK, (err) => {
      console.log(`${Constants.mdbPath} ${err ? 'is not readable' : 'is readable'}`);

      if (!err)
      {
        Constants.MDB.emit('open-connection-test');
      }
      else {
        isDatabaseAvailable = false;
        throw err;
      }
    });
});



Constants.MDB.on('open-connection-test', function() {
    try {
      connection = ADODB.open('Provider=Microsoft.Jet.OLEDB.4.0;Data Source=' + Constants.mdbPath + ';Persist Security Info=False;');
      console.log("Successfully opened a .mdb connection...");
      isDatabaseAvailable = true;
      Constants.MDB.emit('success');
    } catch (e) {
      isDatabaseAvailable = false;
      console.log(e.message);
    } finally {
      //console.log("Starting MYSQL connection process...");
      //Constants.SQL.emit('start-connection-test');
    }
});

var mdb = {
  returnQuery:async function(query) {
    if (!isDatabaseAvailable)
    {
      console.log("ERROR: ADODB DATABASE IS NOT AVAILABLE!")
      return null;
    }

    try {
        var result = await connection.query(query);
        return result;
    } catch (error) {
      console.error(error);
    }

    return null;
  },

  returnCardByID:async function(cardID) {
    return await mdb.returnQuery("SELECT * From cards WHERE ID = " + cardID + ";");
  },

  closeConnection:function() {
    connection.close();
  }
};

module.exports = mdb;
