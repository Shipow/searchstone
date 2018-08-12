/* jshint esversion: 6 */

let instantsearch = require('instantsearch.js');

import languageSelect from './is-custom/language-select.js';
instantsearch.widgets.languageSelect = languageSelect;

import layoutSelect from './is-custom/layout-picker.js';
import artistWidget from './is-custom/artist.js';

const separator = '_';
const stateMapping = {
  stateToRoute({
    query,
    sortBy,
    menu,
    toggle,
    numericRefinementList,
    refinementList,
    lang,
    layout,
    range,
    artist,
    card,
  }) {
    return {
      query: query,
      sortBy: sortBy,
      cardClass: menu && menu.cardClass,
      standardOnly: toggle && toggle.format,
      cost: numericRefinementList && numericRefinementList.cost,
      rarity: refinementList && refinementList.rarity && refinementList.rarity.join(separator),
      cardType: refinementList && refinementList.type && refinementList.type.join(separator),
      set: refinementList && refinementList.set && refinementList.set.join(separator),
      race: refinementList && refinementList.race && refinementList.race.join(separator),
      mechanics: refinementList && refinementList.mechanics && refinementList.mechanics.join(separator),
      attack: range && range.attack && range.attack.replace(':', '~'),
      health: range && range.health && range.health.replace(':', '~'),
      lang: lang,
      layout: layout,
      artist: artist,
      card: card,
    };
  },
  routeToState({
    query,
    sortBy,
    cardClass,
    standardOnly,
    cost,
    rarity,
    cardType,
    set,
    race,
    mechanics,
    attack,
    health,
    lang,
    layout,
    artist,
    card,
  }) {
    return {
      query: query,
      sortBy: sortBy,
      menu: {
        cardClass: cardClass,
      },
      toggle: {
        format: standardOnly,
      },
      numericRefinementList: {
        cost: cost,
      },
      refinementList: {
        rarity: rarity && rarity.split(separator),
        set: set && set.split(separator),
        type: cardType && cardType.split(separator),
        race: race && race.split(separator),
        mechanics: mechanics && mechanics.split(separator),
      },
      range: {
        attack: attack && attack.replace('~', ':'),
        health: health && health.replace('~', ':'),
      },
      lang: lang,
      layout: layout,
      artist: artist,
      card: card,
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
    hitsPerPage: 24
  }
});

searchstone.addWidget(artistWidget);

window.search = searchstone;

// searchbox
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

// hit row template
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
    container: '#cardClass',
    attributeName: 'cardClass',
    limit: 10,
    sortBy: function(a,b){
      return cardClass.indexOf(a.name) - cardClass.indexOf(b.name);
    },
    templates: {
      item: '<a href="?cardClass={{value}}" class="list-group-item{{#isRefined}} active{{/isRefined}}" data-facet-value="{{value}}"><span class="value">{{value}}</span></a>'
    }
  })
);

// Player class - mobile
searchstone.addWidget(
  instantsearch.widgets.menu({
    container: '#cardClassFiltersPanel',
    attributeName: 'cardClass',
    limit: 10,
    sortBy: function(a,b){
      return cardClass.indexOf(a.name) - cardClass.indexOf(b.name);
    },
    templates: {
      item: '<a href="?cardClass={{value}}" class="list-group-item{{#isRefined}} active{{/isRefined}}" data-facet-value="{{value}}"></a>'
    }
  })
);

// Mobile refinements
searchstone.addWidget(
  instantsearch.widgets.currentRefinedValues({
    container: "#active-refinements",
    clearAll: 'after',
    attributes: [
      {name: 'cardClass',template: '<span class="active-refinements-player-class"><svg><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#clear-icon"></use></svg> {{name}}</span>'},
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

// Sidebar clear all filters button
searchstone.addWidget(
  instantsearch.widgets.currentRefinedValues({
    container: "#clearAll",
    clearAll: 'after',
    attributes: [
      {name: 'cardClass',template: ''},
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
var cardClass = ['Druid', 'Hunter', 'Mage', 'Paladin', 'Priest','Rogue','Shaman', 'Warlock','Warrior','Neutral'];

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
      item: '<a href="?rarity={{value}}" class="list-group-item{{#isRefined}} active{{/isRefined}}" data-facet-value="{{value}}">{{value}}</a>'
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

var set = ['REWARD', 'HOF', 'CORE', 'EXPERT1', 'NAXX', 'GVG', 'BRM', 'LOE', 'TGT', 'OG', 'KARA', 'GANGS', 'UNGORO','ICECROWN', 'LOOTAPALOOZA', 'GILNEAS', 'DOOMSDAY'];
set.reverse();

var setFull = {
  DOOMSDAY: "The Boomsday Project",
  GILNEAS : "The Witchwood",
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
      item: '<a href="?set={{value}}" class="list-group-item{{#isRefined}} active{{/isRefined}}" data-facet-value="{{value}}"><span class="value-full">{{fullName}}</span> <span class="value">{{value}}</span> <span class="badge">{{count}}</span></a>'
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
      item: '<a href="?type={{value}}" class="{{#isRefined}}active{{/isRefined}}" data-facet-value="{{value}}"><span class="value">{{label}}</span> <span class="badge pull-right">{{count}}</span></a>'
    }
  })
);

searchstone.addWidget(
  instantsearch.widgets.refinementList({
    container: '#race',
    attributeName: 'race',
    operator: 'or',
    templates: {
      header: 'Race',
      item: '<a href="?race={{value}}" class="{{#isRefined}}active{{/isRefined}}" data-facet-value="{{value}}"><span class="value">{{label}}</span> <span class="badge pull-right">{{count}}</span></a>'
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
      item: '<a href="?mechanics={{value}}" class="{{#isRefined}}active{{/isRefined}}" data-facet-value="{{value}}"><span class="value">{{label}}</span> <span class="badge pull-right">{{count}}</span></a>'
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

// analytics
$('body').on('click', function(e) {
  sendAnalytics();
});
window.onbeforeunload = function() {
  sendAnalytics();
};
let analyticsTimeout;

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
});

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

  console.log(uiState)

  // if (typeof jHash.val('card') !== 'undefined'){
  //   var e = $('#'+ jHash.val('card')).parent() ;
  //   setTimeout(function(){
  //     openLightbox(e);
  //   }, 500);
  // }

});

sunwell.init();
searchstone.start();
