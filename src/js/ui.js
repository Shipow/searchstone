// init algolia
var algoliasearch = require('algoliasearch');
var client = algoliasearch('OWD8XOXT0U', '4c77c51c3822c8a719b418b0cb47913e');
var index = client.initIndex('hsreplay-stats');

window.openLightbox = function(e) {
  $('.lightbox').toggleClass('hidden');
  document.body.classList.toggle('no-scroll');
  $('.container-fluid').addClass('no-scroll blur');
  $('.background-image').addClass('blur');
  cardDetail(e);
};

function closeLightbox() {
  $('.lightbox_frame').remove();
  $('.lightbox').addClass('hidden');
  document.body.classList.toggle('no-scroll');
  $('.container-fluid').removeClass('no-scroll blur');
  $('.background-image').removeClass('blur');
  $('.card-detail-wrapper').empty();
}

function playFlash(){
  $('.lightbox').removeClass('flash');
}

$('.lightbox').on('click', function(){
  closeLightbox();
});

function cardDetail(el) {
  // hit reference
  var target = $(el).find('.hit').data('target');
  var hearthpwnID = $('#'+ target).data('hearthpwn');
  var dbfId = $('#'+ target).data('dbfid');
  $('.stats-wrapper').addClass('hide');
  //decks
  hearthpwn.helper.clearRefinements('cards');
  hearthpwn.helper.addFacetRefinement('cards', hearthpwnID );
  hearthpwn.helper.search();
  index.getObject(dbfId,function(err, data){
    var dataPopularity = data.popularityOT.map(function(v){return v.y.toFixed(2)});
    var labelsPopularity = data.popularityOT.map(function(v){return v.x;});
    var dataWinrate = data.winrateOT.map(function(v){return v.y.toFixed(2)});
    var labelsWinrate = data.winrateOT.map(function(v){return v.x});
    updateChart(chartWinrate, labelsWinrate, dataWinrate);
    updateChart(chartPopularity, labelsPopularity, dataPopularity);
    if(err === null){
      $('.stats-wrapper').removeClass('hide');
    };
  });
  //golden
  var goldenAnimation = $('#'+ target).find('.golden-wrapper').data('golden');
  var video = $('<video />', {
    autoplay:"autoplay",
    loop:"loop",
    width:"286",
    height:"395",
    src: goldenAnimation,
    type:"video/webm"
  });
  if ($('#results #'+ target).find('video').length === 0){
    video.appendTo($('#results #'+ target).find('.golden-wrapper'));
  }
  // render card if it doesn't exist ie. row hit template
  setTimeout(sunwellRender,200);
  // clone in lightbox
  $('.card-detail-wrapper').append($('#results #'+ target).clone());
  //tracking goal
  dataLayer.push({'event': 'open_cardDetails'});
  var position = $('#'+ target).data('position');
  //analytics.track('[SGMNT] Opened Card', {name: 'cardName',positon:'hitPosition'});
  _kmq.push(['record', '[KM] Opened Card', {'Clicked Hit Position': position, 'Card ID': target}]);

}

function removePlaceholder(el){
  el.siblings('.placeholder').remove();
}

$('.card-detail-wrapper').on('click', '.show-golden', function(e){
  e.preventDefault();
  e.stopPropagation();
  $('.lightbox').removeClass('flash');
  $('.card-detail-wrapper').find('.golden-wrapper').toggleClass('flip');
  $('.card-detail-wrapper').find('.normal-wrapper').toggleClass('flip');
  $('.lightbox').addClass('flash');
  setTimeout(playFlash,150);
});

$(document).keyup(function(e) {
   if (e.keyCode == 27 && $('.lightbox:not(.hidden)') !== null) {
    closeLightbox();
  }
});

$('.sbx-custom__reset').on('click touchstart', function(e) {
  e.preventDefault();
  $(this).parent().find('input').val('').focus();
  search.helper.setQuery('').search();
});

$('#results, #table').on('click', '.ais-hits--item', function(e) {
  e.stopPropagation();
  openLightbox(this);
});

$("#toggleFilters").on('click', function(e){
  e.preventDefault();
  $('aside').toggleClass('show');
  $(this).toggleClass('active');
  $("#active-refinements").toggleClass('hide');
});

// load more
var defaultHitsPerPage = 24;
var hitsPerPage = defaultHitsPerPage;
$(".load-more").on('click', function(e){
  e.preventDefault();
  hitsPerPage = hitsPerPage + defaultHitsPerPage;
  search.helper.setQueryParameter('hitsPerPage', hitsPerPage).search();
});

var cloudinaryUrl = 'https://res.cloudinary.com/hilnmyskv/image/upload/';
// detect Chrome
if (/Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)){
  cloudinaryUrl = 'https://res.cloudinary.com/hilnmyskv/image/upload/f_auto,';
}

sunwell.settings = {
  titleFont: 'arial',
  bodyFont: 'arial',
  bodyFontSize: 24,
  bodyLineHeight: 55,
  bodyFontOffset: {x: 0, y: 0},
  assetFolder: cloudinaryUrl + 'q_20,fl_lossy/',
  textureFolder: cloudinaryUrl + 'w_300,q_60,fl_lossy/',
  autoInit: false,
  debug: false
};

window.renderIteratee = 1;
window.sunwellRender = function(cb){
  var cards = $('.card-picture:visible');
  cards.each(function(i,e){
    var cardObj = {};
    cardObj.id = $(e).data("card-id");
    cardObj.set = $(e).data("card-set");
    cardObj.type = $(e).data("card-type").toUpperCase();
    cardObj.rarity = $(e).data("card-rarity").toUpperCase();
    cardObj.cost = " ";
    cardObj.multiClassGroup = $(e).data("card-multiclassgroup");
    cardObj.durability = " ";
    cardObj.attack = " ";
    cardObj.health = " ";
    cardObj.name = "";
    cardObj.text = "";
    cardObj.cardClass = $(e).data("card-cardClass");
    cardObj.texture = $(e).data("card-id");
    // apply neutral bg on multi class GANG
    if(cardObj.cardClass.length > 15 ){
      cardObj.cardClass = "Neutral";
    }
    if ( $(e).data("card-race") !== ""){
      cardObj.race = " ";
    }
    sunwell.createCard(cardObj, 300, e, function(renderIteratee){
      if (renderIteratee === cards.length){
        window.renderIteratee = 1;
        //statsRender();
        // if (typeof jHash.val('card') !== 'undefined'){
        //   var e = $('#'+ jHash.val('card')).parent() ;
        //   setTimeout(function(){
        //     openLightbox(e);
        //   }, 500);
        // }
      }
    });
  });
};

// fix safari mobile interactions
document.addEventListener('touchmove', function(event) {
    event = event.originalEvent || event;
    if (event.scale !== 1) {
       event.preventDefault();
    }
}, false);

var lastTouchEnd = 0;
document.addEventListener('touchend', function (event) {
  var now = (new Date()).getTime();
  if (now - lastTouchEnd <= 300) {
    event.preventDefault();
  }
  lastTouchEnd = now;
}, false);
