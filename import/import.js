// read the colelctible
// add attribute for standard/wild
// remap name with user friendly text
// add popularity in deck

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

  "EXPERT1" : "Classic",
  "CORE" : "Basic",
  "OG" : "Old Gods",
  "TGT" : "The Grand Tournament",
  "GVG" : "Goblins vs Gnomes",
  "LOE" : "League of Explorers",
  "BRM" : "Blackrock Mountain",
  "NAXX" : "Naxxramas",
  // "HERO_SKINS" : "",
  "PROMO" : "Promo",
  "REWARD" : "Reward",

  "BEAST" : "Beast",
  "MECHANICAL" : "Mechanical",
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
  "ImmuneToSpellpower" : "Immune to spell power",
  "SILENCE" : "Silence",
  "ADJACENT_BUFF" : "Adjacent buff",
  "TOPDECK" : "Top deck",
  "InvisibleDeathrattle" : "Invisible deathrattle"
};

var fs = require('fs');
var _ = require('lodash');

fs.readFile('in/cards.collectible.json', 'utf8', function (err, data) {
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

  var cards_to_keep = [];

  // filtering the collection
  JSON.parse(result).forEach(function(c, i){


    // 2016 standard
    if ( c.set === map.EXPERT1 || c.set === map.CORE || c.set === map.OG || c.set === map.TGT || c.set === map.LOE || c.set === map.BRM ){
      c.format = ['Wild','Standard'];
    }
    else {
      c.format = 'Wild';
    }

    //remove heroes and hero skins
    if ( c.type !== 'HERO_SKINS' && c.set !== 'HERO'){
      cards_to_keep.push(c);
    };

  });

  // output
  fs.writeFile('out/algolia-hearthstone.json', JSON.stringify(cards_to_keep, null, 2), 'utf8', function (err) {
     if (err) return console.log(err);
  });
});
