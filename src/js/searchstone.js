/*jshint esversion: 6 */

let instantsearch = require('instantsearch.js');

let searchstone = instantsearch({
  appId: 'T2ZX9HO66V',
  apiKey: '7119d2f6f1cd95224251ec2e490e824f',
  indexName: 'dev_hearthstone--lang',
  urlSync: true
});

window.search = searchstone;

searchstone.addWidget(
  instantsearch.widgets.searchBox({
    container: '#search',
    wrapInput: false
  })
);

searchstone.addWidget(
  instantsearch.widgets.hits({
    hitsPerPage: 12,
    container: '#results',
    templates: {
      empty: `<div class="no-results"><h2>No Results</h2>
        <p>What about starting a new search?</p></div>`,
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

searchstone.addWidget(
  instantsearch.widgets.menu({
    container: '#lang',
    attributeName: 'lang',
    limit: 10,
    collapsible:  {
      collapsed: true
    },
    templates: {
      header: 'Language',
      item: '<a href="#" class="list-group-item{{#isRefined}} active{{/isRefined}}" data-facet-value="{{name}}"><span class="value">{{name}}</span></a>'
    }
  })
);


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
      {name: 'cost', template: '<a href="javascript:void(0)">Mana {{name}} <svg><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#clear-icon"></use></svg></a>'},
      {name: 'setFull'},
      {name: 'format'},
      {name: 'rarity'},
      {name: 'type'},
      {name: 'race'},
      {name: 'mechanics'},
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
      {start: 0, end: 0, name: '0'},
      {start: 1, end: 1, name: '1'},
      {start: 2, end: 2, name: '2'},
      {start: 3, end: 3, name: '3'},
      {start: 4, end: 4, name: '4'},
      {start: 5, end: 5, name: '5'},
      {start: 6, end: 6, name: '6'},
      {start: 7, name: '7+'}
    ],
    templates: {
      header: 'Cost',
      item: '<a href="#" class="list-group-item{{#isRefined}} active{{/isRefined}}" data-facet-value="{{name}}"><span class="value">{{name}}</span></a>'
    }
  })
);

searchstone.addWidget(
  instantsearch.widgets.toggle({
    container: '#format',
    attributeName: 'format',
    values: {
      on: "Standard",
      off: undefined
    },
    label: "Restrict to Standard",
    templates: {
      header: 'Format',
      item: '<a href="#" class="{{#isRefined}}active{{/isRefined}}"><span class="value">{{name}}</span> <span class="badge pull-right">{{count}}</span></a>'
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
  instantsearch.widgets.hitsPerPageSelector({
    container: '#hits-per-page-selector',
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

searchstone.addWidget(
  {
    init: function(opts) {
      if(!opts.helper.hasRefinements("lang")){
        opts.helper.toggleRefinement( "lang", "enUS");
      }
    }
  }
);

searchstone.on('render', function() {
  // $('.hit img').one('load', function() {
  //   var img = $(this).attr('src');
  //   $(this).parent().css('background-image', 'url("' + img + '")');
  //   $(this).parent().addClass('loaded');
  // }).each(function() {
  //     if(this.complete) $(this).load();
  // });
  // $('.ais-hits').removeClass('hide');

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
    cardObj.texture = $(e).data("card-texture").replace(/\(/g,'_').replace(/\)/g,'_');


    if ( $(e).data("card-race") !== ""){
      cardObj.race = " ";
    }

    sunwell.createCard(cardObj, 300, e);
  });

  sunwell.init();
});




searchstone.start();
