  var algoliasearch = require('algoliasearch');
  var _ = require('lodash');
  var Xray = require('x-ray');
  var async = require('async');

  var config = require('../../config.json')

  var x = new Xray();
  // var x = new Xray().driver(phantom());
  const makeDriver = require('request-x-ray')

  const options = {
      method: "GET",                      //Set HTTP method
      jar: true,                          //Enable cookies
      headers: {                          //Set headers
          "User-Agent": "Firefox/48.0"
      }
  }
  const driver = makeDriver(options)      //Create driver
  x.driver(driver)                        //Set driver



  var client = algoliasearch(config.algolia.appID, config.algolia.apiKey);
  client.setRequestTimeout(3600000);
  var index = client.initIndex('hearthpwn-cards');
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
    "attributesForFaceting":[],
    "attributesToSnippet":["text:60"],
    "attributesToHighlight":null,
    "attributeForDistinct":null,
    "ranking":["typo","geo","words","proximity",
    "attribute","exact","custom"],
    "customRanking":['desc(id)'],
    "separatorsToIndex":"",
    "removeWordsIfNoResults":"none",
    "queryType":"prefixLast",
    "highlightPreTag":"<em>",
    "highlightPostTag":"</em>",
    "typoTolerance":"true"
  };

  index.setSettings(settings);

  var numberPattern = /\/([0-9]*)-/;
  var idPattern = /[0-9]*-([-a-z]*)/;

  console.log('Start scrap');

  // ranked deck - last extension: gadgetzan
  x('http://www.hearthpwn.com/cards?display=3&filter-premium=1', '.card-image-item', [{
    href: 'img@data-href',
    goldenAnimation: 'img@data-animationurl'
  }])
  .paginate('a[rel="next"]@href')
  .limit(50)
  //.write('decks.json');

  (function(err, data) {
    console.log(data.length);
    _.forEach(data, function(item,k){

      data[k] = item;
      data[k].href = 'http://www.hearthpwn.com/'+ item.href;
      data[k].name = (item.href).match(idPattern)[1];
      data[k].id = parseInt((item.href).match(numberPattern)[1]);
      data[k].objectID = k;
    });
    // split our results into chunks of 200 objects, to get a good indexing/insert performance
    var chunkedResults = _.chunk(data, 200);
    //console.log("results", data, chunkedResults);
    async.each(chunkedResults, index.saveObjects.bind(index), end);
    function end(err) {
      if (err) {
        throw err;
      }
      console.log('Algolia import done')
    };
  });
