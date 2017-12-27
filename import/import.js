var fs = require('fs');
var _ = require('lodash');
var async = require('async');
//var base64 = require('node-base64-image');

var algoliasearch = require('algoliasearch');
var config = require('../config.json')

// golden card animation + hearthpwnID
var hearthpwnCards = algoliasearch(config.algolia.appID, config.algolia.apiKey).initIndex('hearthpwn-cards');


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
  "DEATH_KNIGHT" : "Death Knight"
};

var specialChars = {
  "\#" : "",
  "\\$" : "",
  "\\[x\\]" : ""
}

var regexp = /\s(.*?) \|4\((.*?),(.*?)\)/g;

function langRulesReplacer() {
  var originalString = arguments[arguments.length - 1];
  var match = arguments[0];
  var number = arguments[1];
  var singular = arguments[2];
  var plural = arguments[3];
  var placeholder = '|4(' + singular + ',' + plural + ')';
  var realNumber = _.parseInt(number.replace('(', '').replace(')', ''));
  var word = (realNumber > 1) ? plural : singular;
  return match.replace(placeholder, word);
}

fs.readFile('in/cards.collectible.json', 'utf8', function (err, data) {

  if (err) {
    return console.log(err);
  }

  var result = data;

  // remap strings to something more user friendly
  Object.keys(map).forEach(function(k){
    var reg = new RegExp('"' + k + '"',"g");
    result = result.replace(reg, '"'+map[k]+'"');
  });

  Object.keys(specialChars).forEach(function(k){
    var reg = new RegExp( k ,"g");
    result = result.replace(reg, specialChars[k]);
  });

  var cards_to_keep = [];

  // filtering the collection
  async.eachSeries(JSON.parse(result), function(c, callback) {

    setTimeout(function () {
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
      }
      else {
        c.format = 'Wild';
      }

      if ( typeof c.referencedTags === "object") {
        if ( typeof c.mechanics === "undefined" ){
          c.mechanics = [];
        }
        c.mechanics = c.mechanics.concat(c.referencedTags);
      }

      //remove heroes
      if ( ['HERO'].indexOf(c.type) === -1 && c.collectible === true){

        delete c.howToEarnGolden;
        delete c.howToEarn;
        delete c.playRequirements;
        delete c.collectible;
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

              if(typeof c.collectionText !== "undefined") {
                // use collectionText if available
                cl.text = c.collectionText[l].replace(regexp, langRulesReplacer);
              }
              else if(typeof c.text !== "undefined") {
                // clean language rules
                cl.text = c.text[l].replace(regexp, langRulesReplacer);
              };

              if(typeof c.flavor !== "undefined") cl.flavor = c.flavor[l];

              cards_to_keep.push(cl);
            });
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
