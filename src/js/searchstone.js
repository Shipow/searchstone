/*jshint esversion: 6 */

let instantsearch = require('instantsearch.js');

import languageSelect from './is-custom/language-select.js';
instantsearch.widgets.languageSelect = languageSelect;

//config
let searchstone = instantsearch({
  appId: 'OWD8XOXT0U',
  apiKey: '4c77c51c3822c8a719b418b0cb47913e',
  indexName: 'searchstone_cost--asc',
  urlSync: false
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

      if(typeof hit.name !== "undefined" && hit.name.length > 24){
        hit.nameLengthClass = "xl";
      }
      else if(typeof hit.name !== "undefined" && hit.name.length > 16){
        hit.nameLengthClass = "lg";
      }
      else if(typeof hit.name !== "undefined" && hit.name.length > 12){
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

// custom widget languages
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

//Player Class - mobile
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

searchstone.addWidget(
  instantsearch.widgets.currentRefinedValues({
    container: "#player-class-refinement",
    clearAll: false,
    attributes: [
      {name: 'playerClass', template: '<h2 class="class-{{name}}">{{name}}</h2>'}
    ],
    onlyListedAttributes: true
  })
);

searchstone.addWidget(
  instantsearch.widgets.currentRefinedValues({
    container: "#active-refinements",
    clearAll: 'after',
    attributes: [
      {name: 'playerClass',template: '<span class="active-refinements-player-class"><svg><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#clear-icon"></use></svg> {{name}}</span>'},
      {name: 'cost', template: '<svg><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#clear-icon"></use></svg> Mana:{{name}}'},
      {name: 'rarity'},
      {name: 'set'}
    ],
    onlyListedAttributes: true,
    templates: {
      item: '<svg><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#clear-icon"></use></svg> {{name}}'
    }
  })
);

var rarity = ['Free', 'Common', 'Rare', 'Epic', 'Legendary'];
var playerClass = ['Druid', 'Hunter', 'Mage', 'Paladin', 'Priest','Rogue','Shaman', 'Warlock','Warrior','Neutral'];
var set = ['Reward','Basic', 'Expert', 'Naxxramas', 'Goblins vs Gnomes', 'Blackrock Mountain', 'League of Explorers', 'The Grand Tournament', 'Old Gods'];
var setShort = ['REWARD','CORE', 'EXPERT1', 'NAXX', 'GVG', 'BRM', 'LOE', 'TGT', 'OG'];
set.reverse();
setShort.reverse();

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
      item: '<a href="#" class="list-group-item{{#isRefined}} active{{/isRefined}}" data-facet-value="{{name}}"><span class="value">{{name}}</span> <span class="badge">{{count}}</span></a>'
    }
  })
);

searchstone.addWidget(
  instantsearch.widgets.refinementList({
    container: '#setShort',
    attributeName: 'set',
    operator: 'and',
    limit: 10,
    sortBy: function(a,b){
      return setShort.indexOf(a.name) - setShort.indexOf(b.name);
    },
    templates: {
      header: 'Set',
      item: '<a href="#" class="list-group-item{{#isRefined}} active{{/isRefined}}" data-facet-value="{{name}}"><span class="value">{{name}}</span> <span class="badge">{{count}}</span></a>'
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

// searchstone.addWidget(
//   instantsearch.widgets.pagination({
//     container: '#pagination',
//     autoHideContainer: true,
//     maxPages: 20,
//     padding: 1,
//     showFirstLast : false
//   })
// );

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

searchstone.on('render', function() {
 if( $('#stats').find('.nbPages').data('nb-pages') === 1 ){
  $('.load-more').addClass('hide');
} else {
  $('.load-more').removeClass('hide');
}
  sunwellRender();
});

sunwell.init();
searchstone.start();
