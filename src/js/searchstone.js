/*jshint esversion: 6 */

let instantsearch = require('instantsearch.js');

let searchstone = instantsearch({
  appId: 'T2ZX9HO66V',
  apiKey: '7119d2f6f1cd95224251ec2e490e824f',
  indexName: 'dev_hearthstone--updated',
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
      if (typeof hit !== 'undefined' && typeof hit._highlightResult !== 'undefined' && typeof hit._highlightResult.name.enUS !== 'undefined') {
        hit._highlightResult.name.enUS.value = hit._highlightResult.name.enUS.value.replace(/<em>/g,'<tspan>');
        hit._highlightResult.name.enUS.value = hit._highlightResult.name.enUS.value.replace(/<\/em>/g,'</tspan>');
      }
      return hit;
    }
  })
);

searchstone.addWidget(
  instantsearch.widgets.currentRefinedValues({
    container: "#refinements",
    clearAll: false,
    templates: {
      item: '<a href="javascript:void(0)">{{name}} <svg><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#clear-icon"></use></svg></a>',
      clearAll: '<a href="javascript:void(0)"><svg><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#clear-icon"></use></svg> Clear All</a>',
    }
  })
);

searchstone.addWidget(
  instantsearch.widgets.refinementList({
    container: '#rarity',
    attributeName: 'rarity',
    operator: 'or',
    limit: 10,
    templates: {
      header: 'Rarity',
      item: '<a href="#" class="list-group-item{{#isRefined}} active{{/isRefined}}" data-facet-value="{{name}}"><span class="value">{{name}}</span> <span class="badge pull-right">{{count}}</span></a>'
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
      item: '<a href="#" class="list-group-item{{#isRefined}} active{{/isRefined}}" data-facet-value="{{name}}"><span class="value">{{name}}</span> <span class="badge pull-right">{{count}}</span></a>'
    }
  })
);

searchstone.addWidget(
  instantsearch.widgets.refinementList({
    container: '#set',
    attributeName: 'setFull',
    operator: 'or',
    limit: 10,
    templates: {
      header: 'Set',
      item: '<a href="#" class="list-group-item{{#isRefined}} active{{/isRefined}}" data-facet-value="{{name}}"><span class="value">{{name}}</span> <span class="badge pull-right">{{count}}</span></a>'
    }
  })
);

searchstone.addWidget(
  instantsearch.widgets.refinementList({
    container: '#format',
    attributeName: 'format',
    operator: 'or',
    limit: 10,
    templates: {
      header: 'Game format',
      item: '<a href="#" class="list-group-item{{#isRefined}} active{{/isRefined}}" data-facet-value="{{name}}"><span class="value">{{name}}</span> <span class="badge pull-right">{{count}}</span></a>'
    }
  })
);

searchstone.addWidget(
  instantsearch.widgets.menu({
    container: '#playerClass',
    attributeName: 'playerClass',
    limit: 10,
    templates: {
      item: '<a href="#" class="list-group-item{{#isRefined}} active{{/isRefined}}" data-facet-value="{{name}}"><span class="value">{{name}}</span> <span class="badge pull-right">{{count}}</span></a>'
    }
  })
);

searchstone.addWidget(
  instantsearch.widgets.rangeSlider({
    container: '#cost',
    attributeName: 'cost',
    templates: {
      header: 'Cost'
    }
  })
);


search.addWidget(
  instantsearch.widgets.pagination({
    container: '#pagination',
    maxPages: 20,
    padding: 1,
    showFirstLast: false
  })
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
