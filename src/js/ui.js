
function openLightbox(e) {
  var yt = $(e).data('yt') || jHash.val('yt');
  jHash.val('yt', yt);

  $('.lightbox_frame_wrapper')
    .append($('<iframe class="lightbox_frame" type="text/html" width="640" height="385" allowfullscreen></iframe>'));
  $('.lightbox_frame').attr('src', 'https://www.youtube.com/embed/'+ yt + '?autoplay=1').load(function(){
    $(this).addClass('loaded');
  });
  $('.lightbox').toggleClass('hidden');
  $('body, html').css('overflow:hidden');
  $('.container-fluid').addClass('no-scroll');
  $(".lightbox .share-video").data('brand', $(e).data('brand'));
}

function closeLightbox() {
  $('.lightbox_frame').remove();
  $('.lightbox').addClass('hidden');
  $('body, html').css('overflow:auto');
  $('.container-fluid').removeClass('no-scroll');
  jHash.clearQuery();
}

// init
var yt = jHash.val('yt');
if (yt) {
  openLightbox();
}

// $('#results').on('click', '.hit', function(e) {
//   e.preventDefault();
//   openLightbox(e.target);
// });

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


// select
$('.wz-select').on('click', function(){
  $(this).toggleClass('active');
});

$('.wz-select ul li').on('click', function() {
  var v = $(this).html();
  $('.wz-select ul li').not($(this)).removeClass('active');
  $(this).addClass('active');
  $(this).find('.wz-select label button').html(v);
});
