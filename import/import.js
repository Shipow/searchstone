var fs = require('fs');
var _ = require('lodash');
var async = require('async');
var algoliasearch = require('algoliasearch');

// load configuration
var config = require('../config.json')

// Algolia indexes that contains hearthpwn infos and hsreplay stats.
var hearthpwnCards = algoliasearch(config.algolia.appID, config.algolia.apiKey).initIndex('hearthpwn-cards');
var hsreplayStats = algoliasearch(config.algolia.appID, config.algolia.apiKey).initIndex('hsreplay-stats');

// localisation
var lang = [
  "deDE",
  "enUS",
  "esES",
  "esMX",
  "frFR",
  "itIT",
  "jaJP",
  "koKR",
  "plPL",
  "ptBR",
  "ruRU",
  "thTH",
  "zhCN",
  "zhTW"
]

var setFull = {
  "EXPERT1" : "Classic",
  "CORE" : "Basic",
  "TB" : "Tavern Brawl",
  "HERO_SKINS" : "Hero Skin",
  "MISSIONS" : "Missions",
  "OG" : "Old Gods",
  "TGT" : "The Grand Tournament",
  "GVG" : "Goblins vs Gnomes",
  "LOE" : "League of Explorers",
  "BRM" : "Blackrock Mountain",
  "NAXX" : "Naxxramas",
  "PROMO" : "Promotion",
  "REWARD" : "Reward",
  "KARA" : "Karazhan",
  "GANGS" : "Gadtgetzan",
  "UNGORO" : "Un'Goro",
  "ICECROWN" : "Frozen Throne",
  "LOOTAPALOOZA" : "Kobolds and Catacombs",
  "GILNEAS": "The Witchwood",
}

var setID = {
  "CORE" : 0,
  "EXPERT1" : 1,
  "NAXX" : 2,
  "GVG" : 3,
  "BRM" : 4,
  "LOE" : 5,
  "TGT" : 6,
  "OG" : 7,
  "KARA" : 8,
  "GANGS" : 9,
  "UNGORO" : 10,
  "ICECROWN": 11,
  "LOOTAPALOOZA":12,
  "GILNEAS": 13,
  "REWARD": 99
}

var setShort = {
  "CORE" : "CORE",
  "EXPERT1" : "EXP",
  "NAXX" : "NAXX",
  "GVG" : "GVG",
  "BRM" : "BRM",
  "LOE" : "LOE",
  "TGT" : "TGT",
  "OG" : "OG",
  "KARA" : "KAR",
  "GANGS" : "GANG",
  "UNGORO" : "UNG",
  "ICECROWN": "ICC",
  "LOOTAPALOOZA": "LOOT",
  "GILNEAS": "WITCH",
  "REWARD": "RWD"
}

var dust = {
  "Common" : 40,
  "Rare" : 100,
  "Epic" : 400,
  "Legendary" : 1600,
  "Free" : ""
}

var map = {
  "HUNTER" : "Hunter",
  "MAGE" : "Mage",
  "PALADIN" : "Paladin",
  "WARRIOR" : "Warrior",
  "DRUID" : "Druid",
  "PRIEST" : "Priest",
  "ROGUE" : "Rogue",
  "SHAMAN" : "Shaman",
  "WARLOCK" : "Warlock",
  "NEUTRAL" : "Neutral",
  "BEAST" : "Beast",
  "MECHANICAL" : "Mech",
  "DRAGON" : "Dragon",
  "DEMON" : "Demon",
  "MURLOC" : "Murloc",
  "PIRATE" : "Pirate",
  "TOTEM" : "Totem",
  "ELEMENTAL" : "Elemental",
  "MINION" : "Minion",
  "SPELL" : "Spell",
  "WEAPON" : "Weapon",
  "COMMON" : "Common",
  "RARE" : "Rare",
  "EPIC" : "Epic",
  "LEGENDARY" : "Legendary",
  "FREE" : "Free",
  "ALLIANCE" : "Alliance",
  "HORDE" : "Horde",
  "BATTLECRY" : "Battlecry",
  "DEATHRATTLE" : "Deathrattle",
  "TAUNT" : "Taunt",
  "AURA" : "Aura",
  "SECRET" : "Secret",
  "INSPIRE" : "Inspire",
  "CHOOSE_ONE" : "Choose one",
  "CHARGE" : "Charge",
  "RITUAL" : "C'Thun Ritual",
  "DIVINE_SHIELD" : "Divine shield",
  "COMBO" : "Combo",
  "STEALTH" : "Stealth",
  "WINDFURY" : "Windfury",
  "ENRAGED" : "Enraged",
  "FREEZE" : "Freeze",
  "FORGETFUL" : "Forgetful",
  "POISONOUS" : "Poisonous",
  "DISCOVER" : "Discover",
  "ImmuneToSpellpower" : "Immune to spell power",
  "SILENCE" : "Silence",
  "ADJACENT_BUFF" : "Adjacent buff",
  "TOPDECK" : "Top deck",
  "InvisibleDeathrattle" : "Invisible deathrattle",
  "CANT_BE_TARGETED_BY_HERO_POWERS" : "Can't be targeted by hero power",
  "CANT_BE_TARGETED_BY_SPELLS" : "Can't be targeted by spells",
  "CANT_ATTACK" : "Can't attack",
  "JADE_GOLEM" : "Jade Golem",
  "IMMUNE" : "Immune",
  "COUNTER" : "Counter",
  "RECEIVES_DOUBLE_SPELLDAMAGE_BONUS" : "Double spell bonus",
  "QUEST" : "Quest",
  "ADAPT" : "Adapt",
  "OVERLOAD": "Overload",
  "SPELLPOWER": "Spell Power",
  "LIFESTEAL": "Lifesteal",
  "DEATHKNIGHT" : "Death Knight",
  "RECRUIT" : "Recruit",
  "HERO_POWER" : "Hero Power",
  "HERO" : "Hero",
  "ENCHANTMENT" : "Token",
  "EVIL_GLOW" : "While is in your hand",
  "RUSH" : "Rush",
  "ECHO" : "Echo",
  "SPARE_PART" : "Spare Part",
  "ALL" : "All",
};

function langRulesReplacer() {
  var number = arguments[2];
  var singular = arguments[3];
  var plural = arguments[4];
  var realNumber = _.parseInt(number);
  var word = (realNumber > 1) ? plural : singular;
  var newString = arguments[1] + ' ' + word;
  return newString;
}

var specialChars = {
  "\\[x\\]" : "",
  "\\#?\\$?" : "",
  "(\\(?(\\d*)\\)?)\\s\\|4\\((\\w*),(\\w*)\\)" : langRulesReplacer
}

function remove(array, element) {
  const index = array.indexOf(element);
  array.splice(index, 1);
}

fs.readFile('in/cards.collectible.json', 'utf8', function (err, result) {

  if (err) return console.log(err)

  // remap strings
  Object.keys(map).forEach(function(k){
    var reg = new RegExp('"' + k + '"', "g");
    result = result.replace(reg, '"' + map[k] + '"');
  });

  var cards_to_keep = [];
  var i = 1;
  var nb_cards = JSON.parse(result).length;

  // the loop
  async.eachSeries(JSON.parse(result), function(c, callback) {

    setTimeout(function () {

      // remove unwanted
      if ((c.set === "CORE" && c.type === "Hero") || c.set === "HERO_SKINS"){
        nb_cards = nb_cards - 1;
        return callback();
      }

      // add
      c.setID = setID[c.set];
      c.setFull = setFull[c.set];
      c.setShort = setShort[c.set];
      c.dustCraft = dust[c.rarity];

      // neutral
      if ( typeof c.playerClass === "undefined"  ){
        c.playerClass = 'Neutral';
      }

      // wild/standard - Year of Raven
      if (
        c.set === "CORE" ||
        c.set === "EXPERT1" ||
        c.set === "UNGORO" ||
        c.set === "ICECROWN" ||
        c.set === "LOOTAPALOOZA" ||
        c.set === "GILNEAS"
      ){
        c.format = ['Wild','Standard'];
      } else {
        c.format = 'Wild';
      }

      // mechanics
      if ( typeof c.mechanics === "undefined" ){
        c.mechanics = [];
      }

      // remove system tags
      remove(c.mechanics,"AI_MUST_PLAY");
      remove(c.mechanics,"TAG_ONE_TURN_EFFECT");
      remove(c.mechanics,"UNTOUCHABLE");
      remove(c.mechanics,"MORPH");
      remove(c.mechanics,"APPEAR_FUNCTIONALLY_DEAD");
      remove(c.mechanics,"CANT_BE_DESTROYED");
      remove(c.mechanics,"CANT_BE_SILENCED");

      // merge referencedTags and mechanics
      if ( typeof c.referencedTags === "object") {
        c.mechanics = c.mechanics.concat(c.referencedTags);
      }

      // delete not used
      delete c.playRequirements;
      delete c.targetingArrowText;
      delete c.howToEarnGolden;

      //GANG groups
      if (typeof c.multiClassGroup !== "undefined"){
        switch (c.multiClassGroup) {
          case "KABAL":
            c.playerClass = ["Mage", "Priest", "Warlock"]
            break;
          case "JADE_LOTUS":
            c.playerClass = ["Druid", "Rogue", "Shaman"]
            break;
          case "GRIMY_GOONS":
            c.playerClass = ["Hunter", "Paladin", "Warrior"]
            break;
        }
      }

      // async tasks hearthpwn + hsreplay
      async.parallel([
        function(cb) {
          setTimeout(function() {
            // golden card animation + hearthpwnID
            if (typeof c.name.enUS !== 'undefined'){
              hearthpwnCards.search(c.name.enUS, function searchDone(err, content) {
                if (err) return cb();
                if (content.hits.length > 0){
                  c.hearthpwnID = content.hits[0].id;
                  c.hearthpwnUrl = content.hits[0].href;
                  c.anim = content.hits[0].goldenAnimation;
                  cb(null,'id');
                }
              });
            }
          }, 20);
        },
        function(cb) {
          setTimeout(function() {
            // hsreplay popularity stats
            if (typeof c.dbfId !== 'stats:yes'){
              hsreplayStats.getObject(c.dbfId, function searchDone(err, content) {
                if (err) return cb();
                c.popularity = content.popularity;
                c.winrate = content.winrate;
                cb(null,'stats:yes');
              });
            }
          }, 20);
        }
      ],
      function(err, results) {
        // show progression
        console.log(i + '/' + nb_cards, c.id, c.name.enUS, results);
        // localisation: create a new record for each language
        lang.forEach(function(l, i){
          var cl = _.clone(c);
          cl.lang = l;
          cl.name = c.name[l];
          if ( l !== 'enUS' ){
            cl.nameVO = c.name.enUS;
          }
          if(typeof c.collectionText !== "undefined" && typeof c.collectionText[l] !== "undefined") {
            cl.text = c.collectionText[l];
          }
          else if(typeof c.text !== "undefined" && typeof c.text[l] !== "undefined") {
            cl.text = c.text[l];
          };
          if(typeof cl.text === "string") {
            Object.keys(specialChars).forEach(function(k){
              var reg = new RegExp( k ,"g");
              cl.text = cl.text.replace(reg, specialChars[k]);
            });
          }
          if(typeof c.flavor !== "undefined") cl.flavor = c.flavor[l];
          if(typeof c.howToEarn !== "undefined") cl.howToEarn = c.howToEarn[l];

          cl.objectID = c.id + '-' + cl.lang;
          cards_to_keep.push(cl);
        });
        if (i === nb_cards){
          console.log('created ' + cards_to_keep.length + ' cards');
        }
        callback();
        i++;
      })
    }, 1);
  }, function(err,results){
    console.log('Saved file with ' + cards_to_keep.length + ' records');
    fs.writeFile('out/algolia-hearthstone.json', JSON.stringify(cards_to_keep, null, 2), 'utf8', function (err) {
       if (err) return console.log(err);
    });
  });
});
