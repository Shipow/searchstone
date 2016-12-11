//https://support.google.com/webmasters/answer/183668?hl=en
//A sitemap file can't contain more than 50,000 URLs and must be no larger than 10 MB uncompressed.

var algoliasearch = require('algoliasearch');
var _ = require('lodash');
var fs = require('fs');
var config = require('../config.json');

var nameCollection = {};
var client = algoliasearch(config.algolia.appID, config.algolia.apiKey);
var index = client.initIndex(config.algolia.index);
var browser = index.browseAll();
var hits = [];

function buildSitemapIndex(urls) {
  var xml = [];
  xml.push('<?xml version="1.0" encoding="UTF-8"?>');
  xml.push('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" ' +
      'xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0" ' +
      'xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">');

  urls.forEach(function (url) {
    xml.push('<url><loc>' + config.prod.protocol + '://' +  config.prod.domain + url + '</loc></url>');
  });

  xml.push('</urlset>');

  return xml.join('\n');
}

browser.on('result', function onResult(content) {
  _.each(content.hits, function(hit) {

    if (!nameCollection[hit.name + hit.lang]) {
      nameCollection[hit.name] = {
        name: hit.name,
        lang: hit.lang
      };
    }
  });
});

browser.on('end', function onEnd() {
  console.log('Finished!');

  var urls = [];
  _.each(nameCollection, function(item) {
    urls.push('?q=' + encodeURIComponent(item.name) + '&amp;dFR[lang][0]=' + item.lang + '&amp;is_v=1');
  });

  console.log(urls.length + ' urls');

  sitemap = buildSitemapIndex(urls);


  fs.writeFileSync("../src/sitemap.xml", sitemap.toString());
  console.log('sitemap.xml saved');
});

browser.on('error', function onError(err) {
  throw err;
});
