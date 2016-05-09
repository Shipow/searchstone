// todo
// add popularity in deck
// split languages

var set = {
  "EXPERT1" : "Expert",
  "CORE" : "Basic",
  "OG" : "Old Gods",
  "TGT" : "The Grand Tournament",
  "GVG" : "Goblins vs Gnomes",
  "LOE" : "League of Explorers",
  "BRM" : "Blackrock Mountain",
  "NAXX" : "Naxxramas",
  "PROMO" : "Promo",
  "REWARD" : "Reward"
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
  "REWARD" : 99
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
  "RITUAL" : "Ritual",
  "DIVINE_SHIELD" : "Divine shield",
  "COMBO" : "Combo",
  "STEALTH" : "Stealth",
  "WINDFURY" : "Wind fury",
  "ENRAGED" : "Enraged",
  "FREEZE" : "Freeze",
  "FORGETFUL" : "Forgetful",
  "POISONOUS" : "Poisonous",
  "TREASURE" : "Discover",
  "ImmuneToSpellpower" : "Immune to spell power",
  "SILENCE" : "Silence",
  "ADJACENT_BUFF" : "Adjacent buff",
  "TOPDECK" : "Top deck",
  "InvisibleDeathrattle" : "Invisible deathrattle"
};

var specialChars = {
  "\#" : "",
  "\\$" : "",
  "\\[x\\]" : ""
}

var fs = require('fs');
var _ = require('lodash');

fs.readFile('in/all.cards.collectible.json', 'utf8', function (err, data) {
// fs.readFile('in/test.json', 'utf8', function (err, data) {
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
  JSON.parse(result).forEach(function(c, i){

    if ( c.set === "PROMO"  ){
      c.set = 'REWARD';
    }

    c.setFull = set[c.set];

    c.dustCraft =  dust[c.rarity];

    c.setID =  setID[c.set];

    if ( typeof c.playerClass === "undefined"  ){
      c.playerClass = 'Neutral';
    }

    // 2016 standard
    if ( c.set === "EXPERT1" || c.set === "CORE" || c.set === "OG" || c.set === "TGT" || c.set === "LOE" || c.set === "BRM" ){
      c.format = ['Wild','Standard'];
    }
    else {
      c.format = 'Wild';
    }

    //remove heroes
    if ( c.type !== 'HERO'){
      cards_to_keep.push(c);
    };

  });

  // output
  fs.writeFile('out/algolia-hearthstone.json', JSON.stringify(cards_to_keep, null, 2), 'utf8', function (err) {
     if (err) return console.log(err);
  });
});
