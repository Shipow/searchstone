const algoliasearch = require('algoliasearch');
const _ = require('lodash');
const async = require('async');
const config = require('../config.json')
const https = require('https');

var client = algoliasearch(config.algolia.appID, config.algolia.apiKey);
client.setRequestTimeout(3600000);
var index = client.initIndex('hsreplay-stats');
var settings = {
  "minWordSizefor1Typo":4,
  "minWordSizefor2Typos":8,
  "hitsPerPage":20,
  "maxValuesPerFacet":100,
  "attributesToIndex":["dbf_id"],
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
  "customRanking":['desc(popularity)'],
  "separatorsToIndex":"",
  "removeWordsIfNoResults":"none",
  "queryType":"prefixLast",
  "highlightPreTag":"<em>",
  "highlightPostTag":"</em>",
  "typoTolerance":"true"
};

index.setSettings(settings);

Number.prototype.noExponents= function(){
  var data= String(this).split(/[eE]/);
  if(data.length== 1) return data[0];
  var  z= '', sign= this<0? '-':'',
  str= data[0].replace('.', ''),
  mag= Number(data[1])+ 1;
  if(mag<0){
    z= sign + '0.';
    while(mag++) z += '0';
    return z + str.replace(/^\-/,'');
  }
  mag -= str.length;
  while(mag--) z += '0';
  return str + z;
}

console.log('Start import');

let getStatsOverTime = (c,cb) => {
  https.get('https://hsreplay.net/analytics/query/single_card_stats_over_time/?GameType=RANKED_WILD&card_id=' + c.dbf_id + '&RankRange=ALL', (resp) => {
    let data = '';
    resp.on('data', (chunk) => { data += chunk;});
    resp.on('end', () => {
      c.popularityOT = JSON.parse(data).series[0].data;
      c.winrateOT = JSON.parse(data).series[1].data;
      c.objectID = c.dbf_id;
      c.popularity = parseFloat(c.popularity).noExponents() * 1;
      // c.ranking = c.total * c.winrate * c.popularity;
      cb(null,c);
    })
  }).on("error", (err) => {
    console.log("Error: " + err.message);
  });
}

  https.get('https://hsreplay.net/analytics/query/card_played_popularity_report/?GameType=RANKED_STANDARD&RankRange=ALL&TimeRange=CURRENT_EXPANSION', (resp) => {
    let data = '';
    resp.on('data', (chunk) => { data += chunk;});
    resp.on('end', () => {
      var cardStats = JSON.parse(data).series.data.ALL;
      async.mapLimit(cardStats, 1, getStatsOverTime , function(err,results){
        index.saveObjects(results, function(err, content) {
          console.log('Indexing '+ results.length + ' records');
          index.waitTask(content.taskID, function(err) {
            if (!err) {
              console.log('Done.');
            }
          });
        });
      })
    });
  }).on("error", (err) => {
    console.log("Error: " + err.message);
  });
