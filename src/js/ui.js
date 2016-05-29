function openLightbox() {
  $('.lightbox').toggleClass('hidden');
  $('body, html').css('overflow:hidden');
  $('.container-fluid').addClass('no-scroll blur');
  $('.background-image').addClass('blur');
}

function closeLightbox() {
  $('.lightbox_frame').remove();
  $('.lightbox').addClass('hidden');
  $('body, html').css('overflow:auto');
  $('.container-fluid').removeClass('no-scroll blur');
  $('.background-image').removeClass('blur');
  $('.card-detail-wrapper').empty();
}

function cardDetail(el) {
  var target = $(el).find('.hit').data('target');
  $('.card-detail-wrapper').append($('#results #'+ target).clone());
  setTimeout( sunwellRender, 200 );
}

function removePlaceholder(el){
  el.siblings('.placeholder').remove();
}

$('.lightbox').on('click', function(){
  closeLightbox();
}).find('.lightbox_sharing').click(function(e) {
    return false;
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
  openLightbox();
  cardDetail(this);
});

$("#results").on('dataavailable','.card-picture', function(){
  var el = $(this);
  el.parent('.card-wrapper').removeClass('fade');
  setTimeout( removePlaceholder(el), 200 );
})

$("#template-toggle").on('click', 'a:not(.active)', function(e){
  e.preventDefault();

  $('#template-toggle a').toggleClass('active');
  $('.results').toggleClass('hide');

  if($(this).hasClass('template-cards')){
    search.helper
      .setQueryParameter('hitsPerPage',12)
      .setQueryParameter('attributesToRetrieve', '*')
      .search();
  } else {
    search.helper
      .setQueryParameter('hitsPerPage',150)
      .setQueryParameter('attributesToRetrieve','cost,health,attack,durability,set,setFull,id,rarity,race,type,name,nameVO,playerClass,flavor,artist')
      .search();
  }
})

$("#toggleFilters").on('click', function(e){
  e.preventDefault();
  $('aside').toggleClass('show');
  $(this).toggleClass('active');
  $("#active-refinements").toggleClass('hide');
})


sunwell.settings = {
  titleFont: 'arial',
  bodyFont: 'arial',
  bodyFontSize: 24,
  bodyLineHeight: 55,
  bodyFontOffset: {x: 0, y: 0},
  assetFolder: 'http://res.cloudinary.com/hilnmyskv/image/upload/f_auto,q_80/',
  textureFolder: 'http://res.cloudinary.com/hilnmyskv/image/upload/f_auto,w_300,q_80/',
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
    cardObj.durability = " ";
    cardObj.attack = " ";
    cardObj.health = " ";
    cardObj.name = "";
    cardObj.text = "";
    cardObj.playerClass = $(e).data("card-playerclass");
    cardObj.texture = $(e).data("card-id");

    if ( $(e).data("card-race") !== ""){
      cardObj.race = " ";
    }

    sunwell.createCard(cardObj, 300, e);

    if ($(e).attr("src")){
      $(e).parents('.card-wrapper').addClass('loaded');
    }
  });
}
