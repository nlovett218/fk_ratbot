const MYSQL = require('mysql');
const Constants = require('../../util/Constants');
const util = require('util');
const LOG = require('../../util/LogAction');

var isMYSQLAvailable = false;

Constants.SQL.on('test-sql-connection', function()
{
    Constants.mysql_connection_pool.query("SELECT * FROM mtg_user", function(err,rows){
      if(err) {
        isMYSQLAvailable = false;
          console.log(err);
      }
      else {
        isMYSQLAvailable = true;
          console.log("MYSQL Connection Successful!");
          Constants.SQL.emit('success');
      }
  });
});

Constants.SQL.on('client-begin-upload', async data => {
    var drawTime = LOG.getTimeFrom(Constants.drawCooldown, "minutes");

    //console.log(time);
    var table_name_user = "mtg_user";
    var table_name_gamedata = "mtg_gamedata";
    var table_name_guild ="mtg_discord_servers";
    var userID = data.ownerID;
    var health = 20;
    var rankxp = 0;
    var currency = 0;
    var wildcards = {
      "mythic": 1,
      "rare": 2,
      "uncommon": 5,
      "common": 10
    }
    var packs = 0;
    var mtg_lastCardDrawnTime = Constants.moment(drawTime).format(Constants.momentTimeFormat);
    var mtg_lastDeathDateTime = null;
    var mtg_lastAttackDateTime = null;
    var mtg_lastQuerySentDateTime = Constants.moment().format(Constants.momentTimeFormat);
    var mtg_optedIn = 0;
    var mtg_guilds = {

    }
    var mtg_startingDeck = data.color;
    var mtg_kills = 0;
    var mtg_deaths = 0;
    var mtg_damagedealt = 0;
    var mtg_amounthealed = 0;
    //mtg_userID
    //mtg_health
    //mtg_wildcards
    //mtg_lastCardDrawnDateTime
    //mtg_optedIn
    //mtg_startingDeck
    //mtg_kills
    //mtg_deaths
    //mtg_damagedealt
    //INSERT INTO table_name (column1, column2, column3, ...)
    //VALUES (value1, value2, value3, ...);
    var query_user = `INSERT INTO ${table_name_user} (mtg_userID, mtg_rankxp, mtg_health, mtg_wildcards, mtg_lastClaimDateTime, mtg_packs, mtg_dailyPackCooldown, mtg_weeklyPackCooldown, mtg_currency, mtg_lastCardDrawnDateTime, mtg_lastAttackDateTime, mtg_lastDeathDateTime, mtg_lastQuerySentDateTime, mtg_guilds, mtg_lastOptInOutDateTime, mtg_startingDeck, mtg_kills, mtg_deaths, mtg_damagedealt, mtg_amounthealed, mtg_reset) VALUES ('${userID}', '${rankxp}', '${health}', '${JSON.stringify(wildcards)}', NULL, '${packs}', NULL, NULL, '${currency}', STR_TO_DATE('${mtg_lastCardDrawnTime}','%m-%d-%Y %H:%i:%s'), NULL, NULL, STR_TO_DATE('${mtg_lastQuerySentDateTime}', '%m-%d-%Y %H:%i:%s'), '${JSON.stringify(mtg_guilds)}', NULL, '${mtg_startingDeck}', '${mtg_kills}', '${mtg_deaths}', '${mtg_damagedealt}', '${mtg_amounthealed}', '0');`;
    //console.log(data.cards + "\n");
    try {
      var hand = (function() {
        var cards = data.cards.slice(0,7);
        var cardIdList = [

        ];
        for (i = 0; i < cards.length; i++)
          cardIdList.push(cards[i].ID);
        return cardIdList;
      })();
      for (i = data.cards.length; i > Constants.startingCardAmount - 7; i--)
      {
          data.cards.shift();
      }
      var deck = (function() {
        var cards = data.cards;
        var cardIdList = [

        ];
        for (i = 0; i < cards.length; i++)
          cardIdList.push(cards[i].ID);
        return cardIdList;
      })();
    }
    catch (err) {
      console.log(err);
    }


    var mana = {
      "untapped": {

      },
      "tapped": {

      }
    };

    var currentHand = {
      hand: hand,
      graveyard: [

      ]
    };

    var currentDeck = {
      deck: deck
    };

    var battlefield = {
      "lands": [

      ],
      "creatures": [

      ],
      "enchantments": [

      ]
    };
    //console.log(data.cards);
    //mtg_userID
    //mtg_currentHand
    //mtg_currentMana
    //mtg_currentDeck
    //mtg_currentPhase
    //mtg_currentBattlefield

    var query_gamedata = `INSERT INTO ${table_name_gamedata} (mtg_userID, mtg_currentHand, mtg_currentMana, mtg_currentDeck, mtg_currentPhase, mtg_currentBattlefield, mtg_allowedCardDraw, mtg_allowedLandCast) VALUES ('${userID}', '${JSON.stringify(currentHand)}', '${JSON.stringify(mana)}', '${JSON.stringify(currentDeck)}', '1', '${JSON.stringify(battlefield)}', '1', '1');`;

    //var query_addguildmember = `INSERT INTO ${table_name_guild} (mtg_userID, mtg_guilds) VALUES ('${userID}');`;

    var q_user = await sql.FIRE_AND_FORGET(query_user);
    var q_data = await sql.FIRE_AND_FORGET(query_gamedata);
    //var q_guild = await sql.FIRE_AND_FORGET(query_addguildmember);
});

Constants.SQL.on('client-reset-update', async data => {
    var drawTime = LOG.getTimeFrom(Constants.drawCooldown, "minutes");
    var attackTime = LOG.getTimeFrom(Constants.attackCooldown, "minutes");

    //console.log(time);
    var table_name_user = "mtg_user";
    var table_name_gamedata = "mtg_gamedata";
    var userID = data.ownerID;
    var health = 20;
    var rankxp = data.mtg_user.mtg_rankxp;
    var currency = data.mtg_user.mtg_currency;
    var wildcards = JSON.parse(data.mtg_user.mtg_wildcards);
    var packs = data.mtg_user.mtg_packs;
    var mtg_lastCardDrawnTime = Constants.moment(drawTime).format(Constants.momentTimeFormat);
    var mtg_lastDeathDateTime = null;
    var mtg_lastAttackDateTime = null;
    var mtg_lastQuerySentDateTime = Constants.moment().format(Constants.momentTimeFormat);
    var mtg_optedIn = data.mtg_user.mtg_optedIn;
    var mtg_startingDeck = data.color;
    var mtg_kills = data.mtg_user.mtg_kills;
    var mtg_deaths = data.mtg_user.mtg_deaths;
    var mtg_damagedealt = data.mtg_user.mtg_damagedealt;
    var mtg_amounthealed = data.mtg_user.mtg_amounthealed;
    //mtg_userID
    //mtg_health
    //mtg_wildcards
    //mtg_lastCardDrawnDateTime
    //mtg_optedIn
    //mtg_startingDeck
    //mtg_kills
    //mtg_deaths
    //mtg_damagedealt
    //INSERT INTO table_name (column1, column2, column3, ...)
    //VALUES (value1, value2, value3, ...);
    var query_user = `UPDATE ${table_name_user} SET mtg_rankxp='${rankxp}', mtg_health='${health}', mtg_wildcards='${JSON.stringify(wildcards)}', mtg_packs='${packs}', mtg_currency='${currency}', mtg_lastCardDrawnDateTime=STR_TO_DATE('${mtg_lastCardDrawnTime}', '%m-%d-%Y %H:%i:%s'), mtg_lastAttackDateTime=NULL, mtg_lastDeathDateTime=NULL, mtg_lastQuerySentDateTime=STR_TO_DATE('${mtg_lastQuerySentDateTime}', '%m-%d-%Y %H:%i:%s'), mtg_startingDeck='${mtg_startingDeck}', mtg_kills='${mtg_kills}', mtg_deaths='${mtg_deaths}', mtg_damagedealt='${mtg_damagedealt}', mtg_amounthealed='${mtg_amounthealed}', mtg_reset='0' WHERE mtg_userID='${data.ownerID}';`;
    //console.log(data.cards + "\n");
    try {
      var hand = (function() {
        var cards = data.cards.slice(0,7);
        var cardIdList = [

        ];
        for (i = 0; i < cards.length; i++)
          cardIdList.push(cards[i].ID);
        return cardIdList;
      })();
      for (i = data.cards.length; i > Constants.startingCardAmount - 7; i--)
      {
          data.cards.shift();
      }
      var deck = (function() {
        var cards = data.cards;
        var cardIdList = [

        ];
        for (i = 0; i < cards.length; i++)
          cardIdList.push(cards[i].ID);
        return cardIdList;
      })();
    }
    catch (err) {
      console.log(err);
    }


    var mana = {
      "untapped": {

      },
      "tapped": {

      }
    };

    var currentHand = {
      hand: hand,
      graveyard: [

      ]
    };

    var currentDeck = {
      deck: deck
    };

    var battlefield = {
      "lands": [

      ],
      "creatures": [

      ],
      "enchantments": [

      ]
    };

    var query_gamedata = `UPDATE ${table_name_gamedata} SET mtg_currentHand='${JSON.stringify(currentHand)}', mtg_currentMana='${JSON.stringify(mana)}', mtg_currentDeck='${JSON.stringify(currentDeck)}', mtg_currentPhase='1', mtg_currentBattlefield='${JSON.stringify(battlefield)}', mtg_allowedCardDraw='1', mtg_allowedLandCast='1' WHERE mtg_userID='${data.mtg_user.mtg_userID}';`;
    var q_user = await sql.FIRE_AND_FORGET(query_user);
    var q_data = await sql.FIRE_AND_FORGET(query_gamedata);
});

Constants.SQL.on('client-update-sql', async data => {
  sql.FIRE_AND_FORGET(data);
});
Constants.SQL.on('check-user-exists', async data => {
  var msgOwnerID = data.id;
  var message = data.messageObj;
  var args = data.messageArgs == undefined ? null : data.messageArgs;
  var callback = data.callback;
  var error = null;

  try {
    var res = await sql.MAKE_DB_CALL_WITH_RESULT("SELECT * FROM mtg_user WHERE mtg_userID = \'"+ msgOwnerID + "\';");/*mtg_user WHERE 'mtg_userID'=" + msgOwnerID + ";");*/
  }
  catch (err)
  {
    error = Constants.MessageCodes.MYSQL_query_unsuccessful;
    console.log(err);
  }

  var returnData = {
    id: msgOwnerID,
    message: message,
    args: args,
    result: res,
    callback: callback,
    param: data.optional_param,
    error: error
  };

  (async () => {
    var callbackresult = await callback(returnData);

    //console.log("function finished");

    if (callbackresult == null || callbackresult != Constants.MessageCodes.USER_TASK_EXISTS)
      Constants.removeIDRequest(msgOwnerID);
    else
      message.channel.send(`<@${msgOwnerID}> -> ${Constants.MessageCodes.USER_TASK_EXISTS}`);
  })();

});

function send_sql_query(options) {
    return new Promise(( resolve, reject ) => {
        Constants.mysql_connection_pool.query(options, ( err, rows ) => {
            if ( err )
            {
                console.log(err);
                return reject( err );
            }
            resolve( rows );
        } );
    } );
}

var sql = {
  MAKE_DB_CALL_WITH_RESULT:async function(query)
  {
    try{
      var options = {sql: query, nestTables: true, timeout: 6000};
      const data = await send_sql_query(options);
      //console.log(data);
      return data;//JSON.stringify(data);
    }
    catch (err)
    {
      console.log(err);
    }
  },

  FIRE_AND_FORGET:async function(query)
  {
    try {
      var options = {sql: query, nestTables: true, timeout: 6000};
      const data = await send_sql_query(options);
    } catch (e) {
      console.log(e);
    } finally {

    }

    return;
  },

  closeConnection:function(){
    //Constants.mysql_connection_pool.close();
  },

  getUserCount:function(){
    var query = "SELECT COUNT(*) FROM mtg_user";

    var result = local.MAKE_DB_CALL_WITH_RESULT(query);

    console.log(result);

    return result;
  }
};

module.exports = sql;
