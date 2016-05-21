/*jshint esversion: 6 */

let instantsearch = require('instantsearch.js');

import languageSelect from './is-custom/language-select.js';
instantsearch.widgets.languageSelect = languageSelect;

//config
let searchstone = instantsearch({
  appId: 'OWD8XOXT0U',
  apiKey: '4c77c51c3822c8a719b418b0cb47913e',
  indexName: 'searchstone_cost--asc',
  urlSync: true
});

//expose instantsearch because of webpack
window.search = searchstone;

//searchbox
searchstone.addWidget(
  instantsearch.widgets.searchBox({
    container: '#search',
    wrapInput: false
  })
);

// hits, the template is called from index.haml
searchstone.addWidget(
  instantsearch.widgets.hits({
    hitsPerPage: 12,
    container: '#results',
    templates: {
      empty: `<div class="no-results"><h2>No Results</h2><p>What about starting a new search?</p></div>`,
      item: document.getElementById('hit-template').innerHTML
    },
    transformData: function(hit) {
      hit.textPath = "#" + hit.type;
      if (typeof hit !== 'undefined' && typeof hit._highlightResult !== 'undefined' && typeof hit._highlightResult.name !== 'undefined') {
        hit._highlightResult.name.value = hit._highlightResult.name.value.replace(/<em>/g,'<tspan>');
        hit._highlightResult.name.value = hit._highlightResult.name.value.replace(/<\/em>/g,'</tspan>');
      }
      return hit;
    }
  })
);

// languages
searchstone.addWidget(
  instantsearch.widgets.languageSelect($('#lang-select'))
);

//Player Class
searchstone.addWidget(
  instantsearch.widgets.menu({
    container: '#playerClass',
    attributeName: 'playerClass',
    limit: 10,
    sortBy: function(a,b){
      return playerClass.indexOf(a.name) - playerClass.indexOf(b.name);
    },
    templates: {
      item: '<a href="#" class="list-group-item{{#isRefined}} active{{/isRefined}}" data-facet-value="{{name}}"><span class="value">{{name}}</span></a>'
    }
  })
);

searchstone.addWidget(
  instantsearch.widgets.currentRefinedValues({
    container: "#refinements",
    clearAll: false,
    attributes: [
      {name: 'playerClass', template: '<h2 class="class-{{name}}">{{name}}</h2>'}
    ],
    onlyListedAttributes: true,
    templates: {
      item: '<a href="javascript:void(0)">{{name}} <svg><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#clear-icon"></use></svg></a>',
      clearAll: '<a href="javascript:void(0)"><svg><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#clear-icon"></use></svg> Clear All</a>',
    }
  })
);

var rarity = ['Free', 'Common', 'Rare', 'Epic', 'Legendary'];
var playerClass = ['Druid', 'Hunter', 'Mage', 'Paladin', 'Priest','Rogue','Shaman', 'Warlock','Warrior','Neutral'];
var set = ['Reward','Basic', 'Expert', 'Naxxramas', 'Goblins vs Gnomes', 'Blackrock Mountain', 'League of Explorers', 'The Grand Tournament', 'Old Gods'];
set.reverse();

searchstone.addWidget(
  instantsearch.widgets.refinementList({
    container: '#rarity',
    attributeName: 'rarity',
    operator: 'or',
    limit: 10,
    sortBy: function(a,b){
      return rarity.indexOf(a.name) - rarity.indexOf(b.name);
    },
    templates: {
      header: 'Rarity',
      item: '<a href="#" class="list-group-item{{#isRefined}} active{{/isRefined}}" data-facet-value="{{name}}"></a>'
    }
  })
);

searchstone.addWidget(
  instantsearch.widgets.numericRefinementList({
    container: '#cost',
    attributeName: 'cost',
    options: [
      // {name: 'all'},
      {start: 0, end: 0, name: '0'},
      {start: 1, end: 1, name: '1'},
      {start: 2, end: 2, name: '2'},
      {start: 3, end: 3, name: '3'},
      {start: 4, end: 4, name: '4'},
      {start: 5, end: 5, name: '5'},
      {start: 6, end: 6, name: '6'},
      {start: 7, end: 7, name: '7'},
      {start: 8, end: 8, name: '8'},
      {start: 9, name: '9+'}
    ],
    templates: {
      header: 'Cost',
      item: '<a href="#" data-facet-value="{{name}}" class="list-group-item{{#isRefined}} active{{/isRefined}}"><span class="value">{{name}}</span></a>'
    }
  })
);

searchstone.addWidget(
  instantsearch.widgets.toggle({
    container: '#format',
    attributeName: 'format',
    values: {
      on: "Standard",
      off: "Wild"
    },
    label: "Restrict to Standard",
    templates: {
      header: 'Format',
      item: '<a href="#" class="list-group-item{{#isRefined}} active{{/isRefined}}"><span class="value">{{name}}</span></a>'
    }
  })
);

searchstone.addWidget(
  instantsearch.widgets.refinementList({
    container: '#set',
    attributeName: 'setFull',
    operator: 'and',
    limit: 10,
    sortBy: function(a,b){
      return set.indexOf(a.name) - set.indexOf(b.name);
    },
    templates: {
      header: 'Set',
      item: '<a href="#" class="list-group-item{{#isRefined}} active{{/isRefined}}" data-facet-value="{{name}}"><span class="value">{{name}}</span> <span class="badge pull-right">{{count}}</span></a>'
    }
  })
);

searchstone.addWidget(
  instantsearch.widgets.refinementList({
    container: '#type',
    attributeName: 'type',
    operator: 'or',
    limit: 10,
    templates: {
      header: 'Type',
      item: '<a href="#" class="{{#isRefined}}active{{/isRefined}}" data-facet-value="{{name}}"><span class="value">{{name}}</span> <span class="badge pull-right">{{count}}</span></a>'
    }
  })
);

searchstone.addWidget(
  instantsearch.widgets.refinementList({
    container: '#race',
    attributeName: 'race',
    operator: 'or',
    limit: 10,
    templates: {
      header: 'Race',
      item: '<a href="#" class="{{#isRefined}}active{{/isRefined}}" data-facet-value="{{name}}"><span class="value">{{name}}</span> <span class="badge pull-right">{{count}}</span></a>'
    }
  })
);

searchstone.addWidget(
  instantsearch.widgets.refinementList({
    container: '#mechanics',
    attributeName: 'mechanics',
    operator: 'and',
    limit: 20,
    templates: {
      header: 'Mechanics',
      item: '<a href="#" class="{{#isRefined}}active{{/isRefined}}" data-facet-value="{{name}}"><span class="value">{{name}}</span> <span class="badge pull-right">{{count}}</span></a>'
    }
  })
);


searchstone.addWidget(
  instantsearch.widgets.sortBySelector({
    container: '#sort-by',
    indices: [
      {name: 'searchstone_cost--asc', label: 'Lowest cost'},
      {name: 'searchstone_cost--desc', label: 'Highest cost'},
      {name: 'searchstone_name', label: 'Alphabetical'}
    ]
  })
);

searchstone.addWidget(
  instantsearch.widgets.hitsPerPageSelector({
    container: '#hits-per-page',
    options: [
      {value: 8, label: '8 per page'},
      {value: 12, label: '12 per page'},
      {value: 24, label: '24 per page'},
      {value: 40, label: '40 per page'}
    ]
  })
);

searchstone.addWidget(
  instantsearch.widgets.pagination({
    container: '#pagination',
    maxPages: 20,
    padding: 1,
    showFirstLast: false
  })
);


searchstone.on('render', function() {

  $('.card-picture').each(function(i,e){

    var cardObj = {};

    cardObj.id = $(e).data("card-id");
    cardObj.set = $(e).data("card-set");
    cardObj.type = $(e).data("card-type").toUpperCase();
    cardObj.rarity = $(e).data("card-rarity").toUpperCase();
    cardObj.cost = " ";
    cardObj.durability = " ";
    cardObj.attack = " ";
    cardObj.health = " ";
    cardObj.name = "";
    cardObj.text = "";
    cardObj.playerClass = $(e).data("card-playerclass");
    cardObj.texture = $(e).data("card-id");


    if ( $(e).data("card-race") !== ""){
      cardObj.race = " ";
    }

    sunwell.createCard(cardObj, 300, e);

    if ($(e).attr("src")){
      $(e).parents('.card-wrapper').addClass('loaded');
    }
  });


});


sunwell.init();
searchstone.start();
