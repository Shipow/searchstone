/*jshint esversion: 6 */

let instantsearch = require('instantsearch.js');

import languageSelect from './is-custom/language-select.js';
instantsearch.widgets.languageSelect = languageSelect;

//config
let searchstone = instantsearch({
  appId: 'OWD8XOXT0U',
  apiKey: '4c77c51c3822c8a719b418b0cb47913e',
  indexName: 'searchstone_cost--asc',
  urlSync: {
    trackedParameters: ['query','attribute:playerClass','attribute:cost','attribute:set','attribute:rarity','attribute:type','attribute:race','attribute:mechanics','attribute:attack','attribute:health','attribute:format', 'attribute:artist']
  },
  searchParameters: {
    facets: ['artist']
  }
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

// hits, the template is in index.haml
searchstone.addWidget(
  instantsearch.widgets.hits({
    hitsPerPage: 12,
    container: '#results',
    templates: {
      empty: `<div class="no-results"><h2>No Results</h2><p>What about starting a new search?</p></div>`,
      item: document.getElementById('hit-template-card').innerHTML
    },
    transformData: function(hit) {

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
    },
    cssClasses: {
      root: "results-cards",
      item: "result-card"
    }
  })
);

searchstone.addWidget(
  instantsearch.widgets.hits({
    hitsPerPage: 12,
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
      item: '<a href="#" class="list-group-item{{#isRefined}} active{{/isRefined}}" data-facet-value="{{name}}"><span class="value">{{name}}</span></a>'
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
      item: '<a href="#" class="list-group-item{{#isRefined}} active{{/isRefined}}" data-facet-value="{{name}}"></a>'
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
      header: 'Mana',
      item: '<a href="#" data-facet-value="{{name}}" class="list-group-item{{#isRefined}} active{{/isRefined}}"><span class="value">{{name}}</span></a>'
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

var set = ['REWARD','CORE', 'EXPERT1', 'NAXX', 'GVG', 'BRM', 'LOE', 'TGT', 'OG', 'KARA'];
set.reverse();

var setFull = {
  KARA : "One Night in Karazhan",
  OG : "Old Gods",
  TGT : "The Grand Tournament",
  LOE : "League of Explorers",
  BRM : "Blackrock Mountain",
  GVG : "Goblins vs Gnomes",
  NAXX : "Naxxramas",
  EXPERT1 : "Expert",
  CORE : "Basic",
  REWARD : "Reward"
}

searchstone.addWidget(
  instantsearch.widgets.refinementList({
    container: '#set',
    attributeName: 'set',
    operator: 'and',
    limit: 10,
    sortBy: function(a,b){
      return set.indexOf(a.name) - set.indexOf(b.name);
    },
    transformData: {
      item: function(item){
        item.fullName = setFull[item.name];
        return item
      }
    },
    templates: {
      header: 'Set',
      item: '<a href="#" class="list-group-item{{#isRefined}} active{{/isRefined}}" data-facet-value="{{name}}"><span class="value-full">{{fullName}}</span> <span class="value">{{name}}</span> <span class="badge">{{count}}</span></a>'
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
    },
    // collapsible: true
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
    limit: 20,
    templates: {
      header: 'Mechanics',
      item: '<a href="#" class="{{#isRefined}}active{{/isRefined}}" data-facet-value="{{name}}"><span class="value">{{name}}</span> <span class="badge pull-right">{{count}}</span></a>'
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

searchstone.addWidget(
  instantsearch.widgets.rangeSlider({
    container: '#health',
    attributeName: 'health',
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
  var params = [];

  params.push(serializeRefinements(Object.assign({}, search.helper.state.disjunctiveFacetsRefinements, search.helper.state.facetsRefinements)));
  params.push(serializeNumericRefinements(search.helper.state.numericRefinements));

  params = params.filter(function(n) {
    return n != '';
  }).join('|');

  var paramsToSend = 'Query: ' + search.helper.state.query + ', ' + params;

  if(lastSentGa !== paramsToSend) {
    dataLayer.push({'event': 'search', 'Search Query': search.helper.state.query, 'Facet Parameters': params});
    lastSentGa = paramsToSend;

    // console.log('sent - ' + paramsToSend);
  }
};

var serializeRefinements = function(obj) {
  var str = [];
  for(var p in obj) {
    if (obj.hasOwnProperty(p)) {
      var values = obj[p].join('+');
      str.push(encodeURIComponent(p) + '_' + encodeURIComponent(values));
    }
  }

  return str.join('|');
};

var serializeNumericRefinements = function(numericRefinements) {
  var numericStr = [];

  for(var attr in numericRefinements) {
    if(numericRefinements.hasOwnProperty(attr)) {
      var filter = numericRefinements[attr];

      if(filter.hasOwnProperty('>=') && filter.hasOwnProperty('<=')) {
        if(filter['>='][0] == filter['<='][0]) {
          numericStr.push(attr + '_' + filter['>=']);
        }
        else {
          numericStr.push(attr + '_' + filter['>='] + 'to' + filter['<=']);
        }
      }
      else if(filter.hasOwnProperty('>=')) {
        numericStr.push(attr + '_from' + filter['>=']);
      }
      else if(filter.hasOwnProperty('<=')) {
        numericStr.push(attr + '_to' + filter['<=']);
      }
      else if(filter.hasOwnProperty('=')) {
        var equals = [];
        for(var equal in filter['=']) {
          if(filter['='].hasOwnProperty(equal)) {
            equals.push(filter['='][equal]);
          }
        }

        numericStr.push(attr + '_' + equals.join('-'));
      }
    }
  }

  return numericStr.join('|');
};

$('body').on('click', function(e) {
  sendAnalytics();
});

window.onbeforeunload = function() {
  sendAnalytics();
};

var analyticsTimeout;

searchstone.on('render', function() {
  if(analyticsTimeout) {
    clearTimeout(analyticsTimeout);
  }

  analyticsTimeout = setTimeout(sendAnalytics, 3000);

  if( $('#stats').find('.nbPages').data('nb-pages') === 1 ){
    $('.load-more').addClass('hide');
  } else {
    $('.load-more').removeClass('hide');
  }
  sunwellRender();
});

sunwell.init();
searchstone.start();
