// todo
// add popularity in deck
// add generated cards
var fs = require('fs');
var _ = require('lodash');
var base64 = require('node-base64-image');
var async = require('async');

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
  "GANGS" : "Gadtgetzan"
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
  "KARA" : 9,
  "GANGS" : 99
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

  // "HERO_SKINS" : "",
  "BEAST" : "Beast",
  "MECHANICAL" : "Mech",
  "DRAGON" : "Dragon",
  "DEMON" : "Demon",
  "MURLOC" : "Murloc",
  "PIRATE" : "Pirate",
  "TOTEM" : "Totem",

  "MINION" : "Minion",
  "SPELL" : "Spell",
  "WEAPON" : "Weapon",
  //"HERO" : "",

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
  "CANT_ATTACK": "Can't attack"
};

var specialChars = {
  "\#" : "",
  "\\$" : "",
  "\\[x\\]" : ""
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

  //var pluralRegex = /(\d+)(.+?)\|4\((.+?),(.+?)\)/g;


  Object.keys(specialChars).forEach(function(k){
    var reg = new RegExp( k ,"g");
    result = result.replace(reg, specialChars[k]);
  });


  var cards_to_keep = [];

  // filtering the collection
  async.each(JSON.parse(result), function(c, callback) {

    var options = {string: true};
    var url = 'http://res.cloudinary.com/hilnmyskv/image/fetch/c_scale,h_35,q_50,e_blur:100,fl_lossy,f_auto/http://wow.zamimg.com/images/hearthstone/cards/enus/original/' + c.id + '.png';

    base64.base64encoder(url, options, function (err, image) {

      if ( c.set === "PROMO"  ){
        c.set = 'REWARD';
      }

      c.setFull = set[c.set];

      c.dustCraft =  dust[c.rarity];

      c.setID =  setID[c.set];

      delete c.howToEarnGolden;
      delete c.howToEarn;
      delete c.playRequierements;
      delete c.collectible;

      // Fixing french plurals
      if (c.text && c.text.frFR) {
        var frenchDescription = c.text.frFR;
        var regexp = /\s(.*?) \|4\((.*?),(.*?)\)/g;
        function frenchReplacer() {
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

        var newDescription = frenchDescription.replace(regexp, frenchReplacer);
        c.text.frFR = newDescription;
      }


      c.previewImage = image;

      if ( typeof c.playerClass === "undefined"  ){
        c.playerClass = 'Neutral';
      }

      // 2016 standard
      if ( c.set === "EXPERT1" || c.set === "CORE" || c.set === "OG" || c.set === "TGT" || c.set === "LOE" || c.set === "BRM" || c.set === "KARA" || c.set === "GANGS" ){
        c.format = ['Wild','Standard'];
      }
      else {
        c.format = 'Wild';
      }

      //remove heroes
      if ( c.type !== 'HERO'){

        lang.forEach(function(l, i){
          var cl = _.clone(c);
          cl.lang = l;
          cl.name = c.name[l];

          if ( l !== 'enUS' ){
            cl.nameVO = c.name.enUS;
          }
          if(typeof c.text !== "undefined") {
            cl.text = c.text[l];
          };
          if(typeof c.flavor !== "undefined") cl.flavor = c.flavor[l];
          cards_to_keep.push(cl);
        });
      };
      callback();
    });


  }, function(err){
    // console.log(err);
    // output
    fs.writeFile('out/algolia-hearthstone.json', JSON.stringify(cards_to_keep, null, 2), 'utf8', function (err) {
       if (err) return console.log(err);
    });
  });

});
