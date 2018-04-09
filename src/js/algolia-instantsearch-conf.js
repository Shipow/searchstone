/*jshint esversion: 6 */

let instantsearch = require('instantsearch.js');

import languageSelect from './is-custom/language-select.js';
instantsearch.widgets.languageSelect = languageSelect;

import layoutSelect from './is-custom/layout-picker.js';

const separator = '_';
const stateMapping = {
  stateToRoute(uiState) {
    return {
      query: uiState.query,
      sortBy: uiState.sortBy,
      playerClass: uiState.menu && uiState.menu.playerClass,
      standardOnly: uiState.toggle && uiState.toggle.format,
      cost: uiState.numericRefinementList && uiState.numericRefinementList.cost,
      rarity: uiState.refinementList && uiState.refinementList.rarity && uiState.refinementList.rarity.join(separator),
      cardType: uiState.refinementList && uiState.refinementList.type && uiState.refinementList.type.join(separator),
      set: uiState.refinementList && uiState.refinementList.set && uiState.refinementList.set.join(separator),
      race: uiState.refinementList && uiState.refinementList.race && uiState.refinementList.race.join(separator),
      mechanics: uiState.refinementList && uiState.refinementList.mechanics && uiState.refinementList.mechanics.join(separator),
      attack: uiState.range && uiState.range.attack && uiState.range.attack.replace(':', '~'),
      health: uiState.range && uiState.range.health && uiState.range.health.replace(':', '~'),
      lang: uiState.lang,
      layout: uiState.layout,
    };
  },
  routeToState(syncable) {
    return {
      query: syncable.query,
      sortBy: syncable.sortBy,
      menu: {
        playerClass: syncable.playerClass,
      },
      toggle: {
        format: syncable.standardOnly,
      },
      numericRefinementList: {
        cost: syncable.cost,
      },
      refinementList: {
        rarity: syncable.rarity && syncable.rarity.split(separator),
        set: syncable.set && syncable.set.split(separator),
        type: syncable.cardType && syncable.cardType.split(separator),
        race: syncable.race && syncable.race.split(separator),
        mechanics: syncable.mechanics && syncable.mechanics.split(separator),
      },
      range: {
        attack: syncable.attack && syncable.attack.replace('~', ':'),
        health: syncable.health && syncable.health.replace('~', ':'),
      },
      lang: syncable.lang,
      layout: syncable.layout,
    };
  }
}

//config cards
let searchstone = instantsearch({
  appId: 'OWD8XOXT0U',
  apiKey: '4c77c51c3822c8a719b418b0cb47913e',
  indexName: 'searchstone_popularity',
  routing: {
    stateMapping,
  },
  searchParameters: {
    facets: ['artist'],
    hitsPerPage: 24
  }
});

//expose instantsearch because of webpack
window.search = searchstone;

//searchbox
searchstone.addWidget(
  instantsearch.widgets.searchBox({
    container: '#search',
    wrapInput: false,
    magnifier: false,
    reset: false
  })
);

// hits, the template is in index.haml
searchstone.addWidget(
  instantsearch.widgets.hits({
    container: '#results',
    templates: {
      empty: `<div class="no-results"><h2>No Results</h2><p>What about starting a new search?</p></div>`,
      item: document.getElementById('hit-template-card').innerHTML
    },
    transformData: {
      item: function(hit) {

        hit.position = hit.__hitIndex + 1;

        hit.textPath = "#" + hit.type;

        if (typeof hit._highlightResult !== 'undefined' && typeof hit._highlightResult.name !== 'undefined') {
          hit._highlightResult.name.value = hit._highlightResult.name.value.replace(/<em>/g,'<tspan>');
          hit._highlightResult.name.value = hit._highlightResult.name.value.replace(/<\/em>/g,'</tspan>');
        }

        if(typeof hit.name !== "undefined" && hit.name.length > 22){
          hit.nameLengthClass = "xxl";
        }
        else if(typeof hit.name !== "undefined" && hit.name.length > 18){
          hit.nameLengthClass = "xl";
        }
        else if(typeof hit.name !== "undefined" && hit.name.length > 14){
          hit.nameLengthClass = "lg";
        }
        else if(typeof hit.name !== "undefined" && hit.name.length > 10){
          hit.nameLengthClass = "md";
        }

        if(typeof hit.text !== "undefined" && hit.text.length > 150){
          hit.textLengthClass = "xxl";
        }
        else if(typeof hit.text !== "undefined" && hit.text.length > 130){
          hit.textLengthClass = "xl";
        }
        else if(typeof hit.text !== "undefined" && hit.text.length > 100){
          hit.textLengthClass = "lg";
        }
        return hit;
      }
    },
    cssClasses: {
      root: "results-cards",
      item: "result-card"
    }
  })
);

searchstone.addWidget(
  instantsearch.widgets.hits({
    hitsPerPage: 24,
    container: '#table',
    templates: {
      empty: `<div class="no-results"><h2>No Results</h2><p>What about starting a new search?</p></div>`,
      item: document.getElementById('hit-template-row').innerHTML
    },
    cssClasses: {
      root: "results-table",
      item: "result-row"
    }
  })
);

// Custom widget languages
searchstone.addWidget(
  instantsearch.widgets.languageSelect($('#lang-select'))
);

// Player class
searchstone.addWidget(
  instantsearch.widgets.menu({
    container: '#playerClass',
    attributeName: 'playerClass',
    limit: 10,
    sortBy: function(a,b){
      return playerClass.indexOf(a.name) - playerClass.indexOf(b.name);
    },
    templates: {
      item: '<a href="?hFR[playerClass][0]={{value}}" class="list-group-item{{#isRefined}} active{{/isRefined}}" data-facet-value="{{value}}"><span class="value">{{value}}</span></a>'
    }
  })
);

// Player class - mobile
searchstone.addWidget(
  instantsearch.widgets.menu({
    container: '#playerClassFiltersPanel',
    attributeName: 'playerClass',
    limit: 10,
    sortBy: function(a,b){
      return playerClass.indexOf(a.name) - playerClass.indexOf(b.name);
    },
    templates: {
      item: '<a href="?hFR[playerClass][0]={{value}}" class="list-group-item{{#isRefined}} active{{/isRefined}}" data-facet-value="{{value}}"></a>'
    }
  })
);

// Selected player class title
searchstone.addWidget(
  instantsearch.widgets.currentRefinedValues({
    container: "#player-class-refinement",
    clearAll: false,
    attributes: [
      {name: 'playerClass', template: '<h2 class="class-{{name}}">{{name}}</h2>'},
      {name: 'artist', template: '<h2 class="artist">{{name}}</h2>'}
    ],
    onlyListedAttributes: true
  })
);

// Mobile refinements
searchstone.addWidget(
  instantsearch.widgets.currentRefinedValues({
    container: "#active-refinements",
    clearAll: 'after',
    attributes: [
      {name: 'playerClass',template: '<span class="active-refinements-player-class"><svg><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#clear-icon"></use></svg> {{name}}</span>'},
      {name: 'cost', template: '<svg><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#clear-icon"></use></svg> Mana:{{name}}'},
      {name: 'attack', template: ''},
      {name: 'health', template: ''},
      {name: 'mechanics'},
      {name: 'race'},
      {name: 'type'},
      {name: 'rarity'},
      {name: 'set'},
      {name: 'artist'}
    ],
    onlyListedAttributes: true,
    templates: {
      item: '<svg><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#clear-icon"></use></svg> {{name}}'
    }
  })
);

//sidebar clear all filters button
searchstone.addWidget(
  instantsearch.widgets.currentRefinedValues({
    container: "#clearAll",
    clearAll: 'after',
    attributes: [
      {name: 'playerClass',template: ''},
      {name: 'cost', template: ''},
      {name: 'attack', template: ''},
      {name: 'health', template: ''},
      {name: 'mechanics', template: ''},
      {name: 'race', template: ''},
      {name: 'type', template: ''},
      {name: 'rarity', template: ''},
      {name: 'set', template: ''},
      {name: 'artist'}
    ],
    onlyListedAttributes: true,
    templates: {
      clearAll: 'Clear all filters',
      item: '<svg><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#clear-icon"></use></svg> {{name}}'
    }
  })
);

var rarity = ['Free', 'Common', 'Rare', 'Epic', 'Legendary'];
var playerClass = ['Druid', 'Hunter', 'Mage', 'Paladin', 'Priest','Rogue','Shaman', 'Warlock','Warrior','Neutral'];

searchstone.addWidget(
  instantsearch.widgets.refinementList({
    container: '#rarity',
    attributeName: 'rarity',
    operator: 'or',
    sortBy: function(a,b){
      return rarity.indexOf(a.name) - rarity.indexOf(b.name);
    },
    templates: {
      header: 'Rarity',
      item: '<a href="?dFR[rarity][0]={{value}}" class="list-group-item{{#isRefined}} active{{/isRefined}}" data-facet-value="{{value}}">{{value}}</a>'
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
      header: 'Mana',
      item: '<a rel="nofollow" href="#" data-facet-value="{{name}}" class="list-group-item{{#isRefined}} active{{/isRefined}}"><span class="value">{{label}}</span></a>'
    },
    autoHideContainer: false
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

var set = ['REWARD', 'HOF', 'CORE', 'EXPERT1', 'NAXX', 'GVG', 'BRM', 'LOE', 'TGT', 'OG', 'KARA', 'GANGS', 'UNGORO','ICECROWN','LOOTAPALOOZA'];
set.reverse();

var setFull = {
  LOOTAPALOOZA : "Kobolds and Catacombs",
  ICECROWN : "Frozen Throne",
  UNGORO : "Un'Goro",
  GANGS : "Gadgetzan",
  KARA : "Karazhan",
  OG : "Old Gods",
  TGT : "The Grand Tournament",
  LOE : "League of Explorers",
  BRM : "Blackrock Mountain",
  GVG : "Goblins vs Gnomes",
  NAXX : "Naxxramas",
  EXPERT1 : "Expert",
  CORE : "Basic",
  HOF: "Hall of Fame",
  REWARD : "Reward"
};

searchstone.addWidget(
  instantsearch.widgets.refinementList({
    container: '#set',
    attributeName: 'set',
    operator: 'and',
    limit: 15,
    sortBy: function(a,b){
      return set.indexOf(a.name) - set.indexOf(b.name);
    },
    transformData: {
      item: function(item){
        item.fullName = setFull[item.value];
        return item;
      }
    },
    templates: {
      header: 'Set',
      item: '<a href="?fR[set][0]={{name}}" class="list-group-item{{#isRefined}} active{{/isRefined}}" data-facet-value="{{value}}"><span class="value-full">{{fullName}}</span> <span class="value">{{value}}</span> <span class="badge">{{count}}</span></a>'
    }
  })
);

searchstone.addWidget(
  instantsearch.widgets.refinementList({
    container: '#type',
    attributeName: 'type',
    operator: 'or',
    templates: {
      header: 'Type',
      item: '<a href="?dFR[type][0]={{value}}" class="{{#isRefined}}active{{/isRefined}}" data-facet-value="{{value}}"><span class="value">{{label}}</span> <span class="badge pull-right">{{count}}</span></a>'
    },
    // collapsible: true
  })
);

searchstone.addWidget(
  instantsearch.widgets.refinementList({
    container: '#race',
    attributeName: 'race',
    operator: 'or',
    templates: {
      header: 'Race',
      item: '<a href="?dFR[race][0]={{value}}" class="{{#isRefined}}active{{/isRefined}}" data-facet-value="{{value}}"><span class="value">{{label}}</span> <span class="badge pull-right">{{count}}</span></a>'
    },
    collapsible: {
      collapsed: true
    }
  })
);

searchstone.addWidget(
  instantsearch.widgets.refinementList({
    container: '#mechanics',
    attributeName: 'mechanics',
    operator: 'and',
    limit: 50,
    templates: {
      header: 'Mechanics',
      item: '<a href="?fR[mechanics][0]={{value}}" class="{{#isRefined}}active{{/isRefined}}" data-facet-value="{{value}}"><span class="value">{{label}}</span> <span class="badge pull-right">{{count}}</span></a>'
    },
    collapsible: {
      collapsed: true
    }
  })
);

searchstone.addWidget(
  instantsearch.widgets.stats({
    container: '#stats',
    templates: {
      body: "<span class='nbPages' data-nb-pages='{{nbPages}}'></span> {{nbHits}} results in {{processingTimeMS}}ms"
    }
  })
);

searchstone.addWidget(
  instantsearch.widgets.sortBySelector({
    container: '#sort-by .sort-by-selector',
    indices: [
      {name: 'searchstone_popularity', label: 'Popularity'},
      {name: 'searchstone_cost--asc', label: 'Lowest cost'},
      {name: 'searchstone_cost--desc', label: 'Highest cost'},
      {name: 'searchstone_name', label: 'Alphabetical'}
    ]
  })
);

searchstone.addWidget(
  instantsearch.widgets.rangeSlider({
    container: '#attack',
    attributeName: 'attack',
    templates: {
      header: 'Attack'
    },
    collapsible: {
      collapsed: true
    },
    tooltips: {
      format: function(formattedValue, rawValue) {return '' + formattedValue;}
    }
  })
);

searchstone.addWidget(layoutSelect);

searchstone.addWidget(
  instantsearch.widgets.rangeSlider({
    container: '#health',
    attributeName: 'health',
    pips: true,
    templates: {
      header: 'Health'
    },
    collapsible: {
      collapsed: true
    },
    tooltips: {
      format: function(formattedValue, rawValue) {return '' + formattedValue;}
    }
  })
);

var lastSentGa = null;

var sendAnalytics = function() {

  //params to url
  var params = [];
  params.push(serializeRefinements(Object.assign({}, search.helper.state.disjunctiveFacetsRefinements, search.helper.state.facetsRefinements)));
  params.push(serializeNumericRefinements(search.helper.state.numericRefinements));
  params = params.filter(function(n) {
    return n != '';
  }).join('&');

  //convert url to object
  var objParams = JSON.parse('{"' + decodeURI(params.replace(/&/g, "\",\"").replace(/=/g,"\":\"")) + '"}');

  //convert object to array
  var arrParams = $.map(objParams, function(value, index) {
      return [value];
  });

  var paramsToSend = 'Query: ' + search.helper.state.query + ', ' + params;

  if(lastSentGa !== paramsToSend) {

    //Google Analytics
    //ga('set', 'page', '/algoliasearch/?query=' + search.helper.state.query + '&' + params);
    //ga('send', 'pageview');

    //GTM
    dataLayer.push({'event': 'search', 'Search Query': search.helper.state.query, 'Facet Parameters': params, 'Number of Hits': search.helper.lastResults.nbHits});

    //segment.io
    //analytics.page( '[SEGMENT] instantsearch', {path: '/instantsearch/?query=' + search.helper.state.query + '&' + params });

    //kissmetrics
    _kmq.push(['record', '[KM] Viewed Result page', {
      'Query': search.helper.state.query ,
      'Number of Hits': search.helper.lastResults.nbHits,
      'Search Params': arrParams
    }]);

    lastSentGa = paramsToSend;
  }
};

var serializeRefinements = function(obj) {
  var str = [];
  for(var p in obj) {
    if (obj.hasOwnProperty(p)) {
      var values = obj[p].join('+');
      str.push(encodeURIComponent(p) + '=' + encodeURIComponent(p) + '_' + encodeURIComponent(values));
    }
  }
  return str.join('&');
};

var serializeNumericRefinements = function(numericRefinements) {
  var numericStr = [];

  for(var attr in numericRefinements) {
    if(numericRefinements.hasOwnProperty(attr)) {
      var filter = numericRefinements[attr];

      if(filter.hasOwnProperty('>=') && filter.hasOwnProperty('<=')) {
        if(filter['>='][0] == filter['<='][0]) {
          numericStr.push(attr + '=' + attr + '_' + filter['>=']);
        }
        else {
          numericStr.push(attr + '=' + attr + '_' + filter['>='] + 'to' + filter['<=']);
        }
      }
      else if(filter.hasOwnProperty('>=')) {
        numericStr.push(attr + '=' + attr + '_from' + filter['>=']);
      }
      else if(filter.hasOwnProperty('<=')) {
        numericStr.push(attr + '=' + attr + '_to' + filter['<=']);
      }
      else if(filter.hasOwnProperty('=')) {
        var equals = [];
        for(var equal in filter['=']) {
          if(filter['='].hasOwnProperty(equal)) {
            equals.push(filter['='][equal]);
          }
        }
        numericStr.push(attr + '=' + attr + '_' + equals.join('-'));
      }
    }
  }
  return numericStr.join('&');
};

$('body').on('click', function(e) {
  sendAnalytics();
});

window.onbeforeunload = function() {
  sendAnalytics();
};

var analyticsTimeout;

//config decks
let hearthpwn = instantsearch({
  appId: 'OWD8XOXT0U',
  apiKey: '4c77c51c3822c8a719b418b0cb47913e',
  indexName: 'hearthpwn-decks',
  searchParameters: {
    facets: ['cards']
  }
});

hearthpwn.addWidget(
  instantsearch.widgets.hits({
    hitsPerPage: 5,
    container: '#topdecks',
    templates: {
      empty: 'Nothing for this card yet. Please come back soon!',
      item: document.getElementById('hit-template-topdeck').innerHTML
    }
  })
);
window.hearthpwn = hearthpwn;
hearthpwn.start();

searchstone.on('render', function() {

  if(analyticsTimeout) {
    clearTimeout(analyticsTimeout);
  }
  analyticsTimeout = setTimeout(sendAnalytics, 2000);

  if( $('#stats').find('.nbPages').data('nb-pages') === 1 ){
    $('.load-more').addClass('hide');
  } else {
    $('.load-more').removeClass('hide');
  }
  sunwellRender();

  if (typeof jHash.val('card') !== 'undefined'){
    var e = $('#'+ jHash.val('card')).parent() ;
    setTimeout(function(){
      openLightbox(e);
    }, 500);
  }

});

sunwell.init();
searchstone.start();
