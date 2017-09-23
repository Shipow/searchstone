  var algoliasearch = require('algoliasearch');
  var _ = require('lodash');
  var Xray = require('x-ray');
  var async = require('async');

  var config = require('../../config.json')

  var x = new Xray();
  // var x = new Xray().driver(phantom());
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
  var index = client.initIndex('hs-deck');
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

  console.log('Start scrap');

  // ranked deck - last extension: gadgetzan
  x('http://www.hearthpwn.com/decks?filter-build=31&filter-show-standard=1&filter-deck-type-val=10&filter-deck-type-op=3', '.listing tbody tr', [{
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
  .limit(50)
  // .write('decks.json');

  (function(err, data) {

    _.forEach(data, function(item,k){

      data[k] = item;
      data[k].objectID = (item.objectID).match(idPattern)[1] || 0;
      data[k].views = parseInt((item.views));
      data[k].comments = parseInt((item.comments));
      //data[k].dust = parseInt( item.dust.replace(',','').replace('.','').replace('k','00') );
      //data[k].timestamp = parseInt((item.timestamp));
      //data[k].rating = parseInt((item.rating));
    });
    // split our results into chunks of 100 objects, to get a good indexing/insert performance
    console.log(data);
    var chunkedResults = _.chunk(data, 100);
    async.each(chunkedResults, index.saveObjects.bind(index), end);
    function end(err) {
      if (err) {
        throw err;
      }
      console.log('Algolia import done')
    };
  });
