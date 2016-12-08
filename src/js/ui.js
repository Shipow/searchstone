window.openLightbox = function(e) {
  $('.lightbox').toggleClass('hidden');
  $('body, html').css('overflow:hidden');
  $('.container-fluid').addClass('no-scroll blur');
  $('.background-image').addClass('blur');
  //jHash.val('card', $(e).find('.hit-card').data('target'));
  cardDetail(e);
}

function closeLightbox() {
  $('.lightbox_frame').remove();
  $('.lightbox').addClass('hidden');
  $('body, html').css('overflow:auto');
  $('.container-fluid').removeClass('no-scroll blur');
  $('.background-image').removeClass('blur');
  $('.card-detail-wrapper').empty();
  jHash.clearQuery();
}

var goldenLoaded = false;

function cardDetail(el) {

  // hit reference
  var target = $(el).find('.hit').data('target');
  var position = $(el).find('.hit').data('position');

  // url of the golden card
  var golden = $('#results #'+ target).find('.golden-wrapper').data('golden');

  // create the golden image
  var goldenImg =  new Image();

  // do something when loaded
  goldenLoaded = false;
  $('.loading .msg').text('loading...');
  $('.loading .loader').removeClass('hide');

  goldenImg.onload = function(){
    goldenLoaded = true;
    $('.loading .msg').text('Golden ready! (click the card)');
    $('.loading .loader').addClass('hide');
  };

  // clone in lightbox
  $('.card-detail-wrapper').append($('#results #'+ target).clone());

  // append golden in lightbox
  $('.card-detail-wrapper').find('.golden-wrapper').append(goldenImg);

  // set image src
  goldenImg.src = golden;

  // delay a bit sunwell
  setTimeout( sunwellRender, 200 );

  //tracking goal
  dataLayer.push({'event': 'open_cardDetails'});
  //analytics.track('[SGMNT] Opened Card', {name: 'cardName',positon:'hitPosition'});
  _kmq.push(['record', '[KM] Opened Card', {'Clicked Hit Position': position, 'Card ID': target}]);

};

function removePlaceholder(el){
  el.siblings('.placeholder').remove();
};

function playFlash(){
  $('.lightbox').removeClass('flash');
};

$('.lightbox').on('click', function(){
  closeLightbox();
});

$('.card-detail-wrapper').on('click', '.show-golden', function(e){
  e.preventDefault();
  e.stopPropagation();
  $('.lightbox').removeClass('flash');
  if (goldenLoaded){
    $('.card-detail-wrapper').find('.golden-wrapper').toggleClass('flip');
    $('.card-detail-wrapper').find('.normal-wrapper').toggleClass('flip');
    $('.lightbox').addClass('flash');
    setTimeout(playFlash,150);
  }
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

$("#results").on('dataavailable','.card-picture', function(){
  var el = $(this);
  el.parent('.card-wrapper').removeClass('fade');
  setTimeout( removePlaceholder(el), 200 );
});

$("#template-toggle").on('click', 'a:not(.active)', function(e){
  e.preventDefault();

  $('#template-toggle a').toggleClass('active');
  $('.results').toggleClass('hide');

  if($(this).hasClass('template-cards')){
    search.helper
      .setQueryParameter('hitsPerPage',24)
      .setQueryParameter('attributesToRetrieve', '*').search();
  } else {
    search.helper
      .setQueryParameter('hitsPerPage',150)
      .setQueryParameter('attributesToRetrieve','cost,health,attack,durability,set,setFull,id,rarity,race,type,name,nameVO,playerClass,flavor,artist').search();
  }
});

$("#toggleFilters").on('click', function(e){
  e.preventDefault();
  $('aside').toggleClass('show');
  $(this).toggleClass('active');
  $("#active-refinements").toggleClass('hide');
});


var defaultHitsPerPage = 24;
var hitsPerPage = defaultHitsPerPage;

$(".load-more").on('click', function(e){
  e.preventDefault();
  hitsPerPage = hitsPerPage + defaultHitsPerPage;
  search.helper.setQueryParameter('hitsPerPage', hitsPerPage).search();
});

$('.searchbox').on('focus','.ais-search-box--input', function(){
  if($('.template-cards').hasClass('active')){
    search.helper.setQueryParameter('hitsPerPage', defaultHitsPerPage).search();
  }
});

// detect Chrome
var isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);

var cloudinaryUrl = 'https://res.cloudinary.com/hilnmyskv/image/upload/';

if (isChrome){
  cloudinaryUrl = 'https://res.cloudinary.com/hilnmyskv/image/upload/f_auto,';
}

sunwell.settings = {
  titleFont: 'arial',
  bodyFont: 'arial',
  bodyFontSize: 24,
  bodyLineHeight: 55,
  bodyFontOffset: {x: 0, y: 0},
  assetFolder: cloudinaryUrl + 'q_60/',
  textureFolder: cloudinaryUrl + 'w_300,q_80/',
  autoInit: false,
  debug: false
};

window.sunwellRender = function(){
$('.card-picture:visible').each(function(i,e){

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
    cardObj.playerClass = $(e).data("card-playerclass");
    cardObj.texture = $(e).data("card-id");


    //quick fix

    if(cardObj.playerClass.length > 15 ){
      cardObj.playerClass = "Neutral";
    }

    if ( $(e).data("card-race") !== ""){
      cardObj.race = " ";
    }

    sunwell.createCard(cardObj, 300, e);

    if ($(e).attr("src")){
      $(e).parents('.card-wrapper').addClass('loaded');
    }
  });
};
