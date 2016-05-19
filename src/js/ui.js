function openLightbox() {
  $('.lightbox').toggleClass('hidden');
  $('body, html').css('overflow:hidden');
  $('.container-fluid').addClass('no-scroll');
}

function closeLightbox() {
  $('.lightbox_frame').remove();
  $('.lightbox').addClass('hidden');
  $('body, html').css('overflow:auto');
  $('.container-fluid').removeClass('no-scroll');
  $('.card-detail-wrapper').empty();
}

function cardDetail(e) {
  $('.card-detail-wrapper').append($(e.target).parents('.ais-hits--item').clone());
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

$('#results').on('click touchstart', '.ais-hits--item', function(e) {
  openLightbox();
  cardDetail(e);
});
