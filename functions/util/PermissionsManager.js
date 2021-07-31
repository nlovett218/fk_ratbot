const Constants = require('./Constants');
const { Permissions } = require('discord.js');

var local = {
  permissionsFlags:new Permissions([
    'SEND_MESSAGES',
    'EMBED_LINKS',
    'ATTACH_FILES',
    'ADD_REACTIONS',
    'VIEW_CHANNEL',
    'USE_EXTERNAL_EMOJIS',
    'READ_MESSAGE_HISTORY',
  ]),

  checkPermissionsForChannel:function(channelObj, clientMember)
  {
    try {
      if (channelObj.permissionsFor(clientMember).has(local.permissionsFlags, false) == false)
        return false;
    }
    catch (err)
    {
      console.log(err);
      return false;
    }

    return true;
  }
}

module.exports = local;
