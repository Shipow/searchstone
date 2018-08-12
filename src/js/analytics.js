// jshint ignore: start

//google tag manager
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-PKZX5XH');

//segment io
// !function(){var analytics=window.analytics=window.analytics||[];if(!analytics.initialize)if(analytics.invoked)window.console&&console.error&&console.error("Segment snippet included twice.");else{analytics.invoked=!0;analytics.methods=["trackSubmit","trackClick","trackLink","trackForm","pageview","identify","reset","group","track","ready","alias","debug","page","once","off","on"];analytics.factory=function(t){return function(){var e=Array.prototype.slice.call(arguments);e.unshift(t);analytics.push(e);return analytics}};for(var t=0;t<analytics.methods.length;t++){var e=analytics.methods[t];analytics[e]=analytics.factory(e)}analytics.load=function(t){var e=document.createElement("script");e.type="text/javascript";e.async=!0;e.src=("https:"===document.location.protocol?"https://":"http://")+"cdn.segment.com/analytics.js/v1/"+t+"/analytics.min.js";var n=document.getElementsByTagName("script")[0];n.parentNode.insertBefore(e,n)};analytics.SNIPPET_VERSION="4.0.0";
// analytics.load("b1EnU092c9zFiUe4WhKM46Bu9hSN0y63");
// analytics.page();
// }}();

//kissmetrics
// window._kmq = window._kmq || [];
// var _kmk = _kmk || '48c6c32e10ce72788509b898a879715ae35416e8';
// function _kms(u){
//   setTimeout(function(){
//     var d = document, f = d.getElementsByTagName('script')[0],
//     s = d.createElement('script');
//     s.type = 'text/javascript'; s.async = true; s.src = u;
//     f.parentNode.insertBefore(s, f);
//   }, 1);
// }
// _kms('//i.kissmetrics.com/i.js');
// _kms('//scripts.kissmetrics.com/' + _kmk + '.2.js');

var lastSentGa = null;

window.sendAnalytics = function() {

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
    // _kmq.push(['record', '[KM] Viewed Result page', {
    //   'Query': search.helper.state.query ,
    //   'Number of Hits': search.helper.lastResults.nbHits,
    //   'Search Params': arrParams
    // }]);

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
