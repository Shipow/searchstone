  const algoliasearch = require('algoliasearch');
  const _ = require('lodash');
  const Xray = require('x-ray');
  const async = require('async');
  const config = require('../config.json')
  const x = new Xray();
  const makeDriver = require('request-x-ray');
  const options = {
      method: "GET",                      //Set HTTP method
      jar: true,                          //Enable cookies
      headers: {                          //Set headers
          "User-Agent": "Chrome/18.0.1025.133"
      }
  };
  const driver = makeDriver(options);      //Create driver
  x.driver(driver);                        //Set driver
  x.concurrency(4);

  var client = algoliasearch(config.algolia.appID, config.algolia.apiKey);
  client.setRequestTimeout(3600000);
  var index = client.initIndex('hearthpwn-decks');
  var settings = {
    "minWordSizefor1Typo":4,
    "minWordSizefor2Typos":8,
    "hitsPerPage":20,
    "maxValuesPerFacet":100,
    "attributesToIndex":["name"],
    "numericAttributesToIndex":null,
    "attributesToRetrieve":null,
    "allowTyposOnNumericTokens":true,
    "ignorePlurals":false,
    "advancedSyntax":false,
    "removeStopWords":false,
    "replaceSynonymsInHighlight":true,
    "distinct":false,
    "unretrievableAttributes":null,
    "optionalWords":null,
    "slaves":[],
    "attributesForFaceting":["class","type","cards"],
    "attributesToSnippet":["text:60"],
    "attributesToHighlight":null,
    "attributeForDistinct":null,
    "ranking":["typo","geo","words","proximity",
    "attribute","exact","custom"],
    "customRanking":["desc(rating)","desc(views)"],
    "separatorsToIndex":"",
    "removeWordsIfNoResults":"none",
    "queryType":"prefixLast",
    "highlightPreTag":"<em>",
    "highlightPostTag":"</em>",
    "typoTolerance":"true"
  };

  index.setSettings(settings);

  var idPattern = /\/([0-9]*)-/;
  var offset = 1;
  var pageLimit = 20;

  console.log('Start scrap');

  // ranked deck
  x('http://www.hearthpwn.com/decks?filter-build=40&filter-show-standard=1&filter-deck-type-val=10&filter-deck-type-op=3&page=' + offset, '.listing tbody tr', [{
    objectID: '.col-name a@href',
    href: '.col-name a@href',
    name: '.col-name div a',
    type: '.is-std',
    class: '.col-class',
    views: '.col-views',
    comments: '.col-comments',
    rating: '.rating-average',
    dust: '.col-dust-cost',
    timestamp: '.standard-date@data-epoch',
    cards: x('td.col-name a@href', ['.infobox tbody td.col-name a@data-id'])
  }])
  .paginate('a[rel="next"]@href')
  .limit(pageLimit)
  // .write('decks.json');

  (function(err, data) {
    _.forEach(data, function(item,k){
      //console.log('Scrapped '+ item.name);
      data[k] = item;
      data[k].objectID = (item.objectID).match(idPattern)[1] || 0;
      data[k].views = parseInt((item.views));
      data[k].comments = parseInt((item.comments));
      //data[k].dust = parseInt( item.dust.replace(',','').replace('.','').replace('k','00') );
      //data[k].timestamp = parseInt((item.timestamp));
      //data[k].rating = parseInt((item.rating));
    });
    // split our results into chunks of 100 objects, to get a good indexing/insert performance
    var chunkedResults = _.chunk(data, 100);
    async.each(chunkedResults, index.saveObjects.bind(index), end);
    function end(err) {
      if (err) {
        throw err;
      }
      console.log('Algolia import done')
    };
  });
