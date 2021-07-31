const ADODB = require('./connections/ADODB');
const MYSQL = require('./connections/MYSQL');
const LOG = require('../../functions/util/LogAction');
const Constants = require('../util/Constants');

var HandleConnection = {
  callDBFunction:async function(type, data)
  {
    var result = "";

    switch (type) {
      case "MYSQL-returnQuery":
        result = await MYSQL.MAKE_DB_CALL_WITH_RESULT(data);
        //console.log(result);
        break;
      case "MYSQL-fireAndForget":
        result = await MYSQL.FIRE_AND_FORGET(data);
        break;
      case "ADODB-returnQuery":
        result = await ADODB.returnQuery(data);
        break;
      case "ADODB-returnCardByID":
        result = await ADODB.returnCardByID(data);
        break;
      default:
        result = null;
    }

    LOG.DB_LOG("CALL OF TYPE \'" + type + "\' REQUESTED WITH QUERY \'" + data + "\' WITH RESULT \'" + result + "\'")
    return result;
  },
};

module.exports = HandleConnection;
