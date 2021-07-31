//const BotInfo = require('./classes/BotInfo');
const LOG = require('./functions/util/LogAction');
const util = require('util');
const Constants = require('./functions/util/Constants');
//const HandleConnection = require('./functions/handle/HandleConnection');
const HandleFunctionCall = require('./functions/HandleFunctionCall');
//const repeating = require('repeating');
const Topgg = require("@top-gg/sdk");
const express = require("express");

const app = express();

const webhook = new Topgg.Webhook(Constants.bot_webhook_authorization);

var listenServerInit = false;

Constants.BotInfo.logBotInfo();

//var isDatabaseAvailable = false;
//var isMYSQLAvailable = false;


//This is where the start of our bot begins
Constants.client.on('ready', async () => {

  Constants.USER.emit('success');
});



Constants.USER.on('success', async function() {
  console.log("Getting guild admins...");
  Constants.client.guilds.cache.map((guild) => {
    Constants.guildAdmins[guild.id] = [];
    Constants.guildAdmins[guild.id].push(guild.ownerID);
  });

  console.log("Our client is ready to go, awaiting questions..");


  console.log("Registering trackers");

  (async () => {
    var config = await Constants.readJSONFile(Constants.config_file);
    Constants.trackChannelData = config.trackers;
  })();

});

Constants.client.on('guildCreate', guild => {
  Constants.guildAdmins[guild.id] = [];
  Constants.guildAdmins[guild.id].push(guild.ownerID);
});


process.on('uncaughtException', (err) => {
    const errorMsg = err.stack.replace(new RegExp(`${__dirname}/`, 'g'), './');
    console.error('Uncaught Exception: ', errorMsg);
    Constants.commandRequests = [];
    // process.exit(1); //Eh, should be fine, but maybe handle this?
});

process.on('uncaughtExceptionMonitor', (err, origin) => {
  console.error(origin);
  console.error(err);
  Constants.commandRequests = [];
});

process.on('unhandledRejection', err => {
    console.error('Uncaught Promise Error: ', err);
    Constants.commandRequests = [];
    // process.exit(1); //Eh, should be fine, but maybe handle this?
});

process.on('SIGINT', async err => {

  process.exit(0);
});


(async () => {
  var config = await Constants.readJSONFile(Constants.config_file);
  Constants.client.login(config.bot_token);
})();
