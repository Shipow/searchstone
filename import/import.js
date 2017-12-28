var fs = require('fs');
var _ = require('lodash');
var async = require('async');
//var base64 = require('node-base64-image');

var algoliasearch = require('algoliasearch');
var config = require('../config.json')

// golden card animation + hearthpwnID
var hearthpwnCards = algoliasearch(config.algolia.appID, config.algolia.apiKey).initIndex('hearthpwn-cards');
var hsreplayStats = algoliasearch(config.algolia.appID, config.algolia.apiKey).initIndex('hsreplay-stats');

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

var set = {
  "EXPERT1" : "Expert",
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
  "LOOTAPALOOZA" : "Kobolds and Catacombs"
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
  "REWARD": 99
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
  "CANT_BE_TARGETED_BY_HERO_POWERS": "Can't be targeted by hero power",
  "CANT_BE_TARGETED_BY_SPELLS": "Can't be targeted by spells",
  "CANT_ATTACK": "Can't attack",
  "JADE_GOLEM": "Jade Golem",
  "IMMUNE": "Immune",
  "COUNTER": "Counter",
  "RECEIVES_DOUBLE_SPELLDAMAGE_BONUS": "Double spell bonus",
  "QUEST": "Quest",
  "ADAPT": "Adapt",
  "OVERLOAD": "Overload",
  "SPELLPOWER": "Spell Power",
  "LIFESTEAL": "Lifesteal",
  "DEATHKNIGHT" : "Death Knight",
  "RECRUIT" : "Recruit",
  "HERO_POWER" : "Hero Power",
  "HERO" : "Hero",
  "ENCHANTMENT" : "Token",
  "EVIL_GLOW" : "While is in your hand"
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

fs.readFile('in/cards.json', 'utf8', function (err, data) {

  if (err) {
    return console.log(err);
  }

  var result = data;

  // remap strings to something more user friendly
  Object.keys(map).forEach(function(k){
    var reg = new RegExp('"' + k + '"',"g");
    result = result.replace(reg, '"'+map[k]+'"');
  });

  var cards_to_keep = [];

  // filtering the collection
  async.eachSeries(JSON.parse(result), function(c, callback) {

    setTimeout(function () {
      //remove unwanted
      if (c.collectible === true && c.set !== "HERO_SKINS" && !(c.set === "CORE" && c.type === "Hero")){

        // rename
        if ( c.set === "PROMO"  ){
          c.set = 'REWARD';
        }
        c.setFull = set[c.set];
        c.dustCraft =  dust[c.rarity];
        c.setID =  setID[c.set];

        // old base64 image preview
        // var options = {string: true};
        // var url = 'http://res.cloudinary.com/hilnmyskv/image/fetch/c_scale,h_35,q_50,e_blur:100,fl_lossy,f_auto/http://wow.zamimg.com/images/hearthstone/cards/enus/original/' + c.id + '.png';
        // base64.base64encoder(url, options, function (err, image) {
        //c.previewImage = image;
        //callback();
        // });

        if ( typeof c.playerClass === "undefined"  ){
          c.playerClass = 'Neutral';
        }

        // Year of Mammoth
        if ( c.set === "EXPERT1" || c.set === "CORE" || c.set === "OG" || c.set === "KARA" || c.set === "GANGS" || c.set === "UNGORO" || c.set === "ICECROWN" || c.set === "LOOTAPALOOZA" ){
          c.format = ['Wild','Standard'];
        } else {
          c.format = 'Wild';
        }

        if ( typeof c.mechanics === "undefined" ){
          c.mechanics = [];
        }
        // remove system mechanics
        remove(c.mechanics,"AI_MUST_PLAY");
        remove(c.mechanics,"TAG_ONE_TURN_EFFECT");
        remove(c.mechanics,"UNTOUCHABLE");
        remove(c.mechanics,"MORPH");
        remove(c.mechanics,"APPEAR_FUNCTIONALLY_DEAD");
        remove(c.mechanics,"CANT_BE_DESTROYED");
        remove(c.mechanics,"CANT_BE_SILENCED");

        // merge referencedTags
        if ( typeof c.referencedTags === "object") {
          c.mechanics = c.mechanics.concat(c.referencedTags);
        }

        delete c.howToEarnGolden;
        delete c.howToEarn;
        delete c.playRequirements;
        delete c.targetingArrowText

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

        // hsreplay popularity stats
        if (typeof c.dbfId !== 'undefined'){
          hsreplayStats.search(c.dbfId, function searchDone(err, content) {
            if (err){
              console.log(err);
              return;
            }
            if (content.hits.length > 0){
              c.popularity = content.hits[0].popularity;
              c.winrate = content.hits[0].winrate;
            };

            // golden card animation + hearthpwnID
            if (typeof c.name !== 'undefined' && typeof c.name.enUS !== 'undefined'){
              hearthpwnCards.search(c.name.enUS, function searchDone(err, content) {
                if (err){
                  console.log(err);
                  return;
                }
                if (content.hits.length > 0){
                  c.hearthpwnID = content.hits[0].id;
                  c.hearthpwnUrl = content.hits[0].href;
                  c.anim = content.hits[0].goldenAnimation;
                };

                // localisation
                lang.forEach(function(l, i){
                  var cl = _.clone(c);
                  cl.lang = l;
                  cl.name = c.name[l];

                  if ( l !== 'enUS' ){
                    cl.nameVO = c.name.enUS;
                  }

                  if(typeof c.collectionText !== "undefined" && typeof c.collectionText[l] !== "undefined") {
                    // use collectionText if available
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

                  cl.objectID = c.id + '-' + cl.lang;
                  //console.log(cl.objectID);

                  cards_to_keep.push(cl);
                });
              });
            }

          });
        }





      };
      callback();
    }, 1);

  }, function(err){
    fs.writeFile('out/algolia-hearthstone.json', JSON.stringify(cards_to_keep, null, 2), 'utf8', function (err) {
       if (err) return console.log(err);
    });
  });
});
