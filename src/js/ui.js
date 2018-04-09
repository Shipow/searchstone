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

require('chart.js');
var algoliasearch = require('algoliasearch');

var client = algoliasearch('OWD8XOXT0U', '4c77c51c3822c8a719b418b0cb47913e');
var index = client.initIndex('hsreplay-stats');

var gradientLinePlugin = {
  // Called at start of update.
  beforeUpdate: function(chartInstance) {
    if (chartInstance.options.linearGradientLine) {
      var ctx = chartInstance.chart.ctx;
      var dataset = chartInstance.data.datasets[0];
      var gradient = ctx.createLinearGradient(0, 10, 0, 140);

      switch (chartInstance.options.linearGradientLine) {
        case 'winrate':
          gradient.addColorStop(.7, '#EE7A57');
          gradient.addColorStop(0.52, '#FD4255');
          gradient.addColorStop(0.48, '#51A93F');
          gradient.addColorStop(0.2, '#34FFAC');
          break;
        case 'popularity':
          gradient.addColorStop(1, '#2C5EE3');
          gradient.addColorStop(.8, '#6B3FC8');
          gradient.addColorStop(0, '#FFB95D');
          break;
      }
      dataset.borderColor = gradient;
    }
  }
};

Chart.pluginService.register(gradientLinePlugin);
var ctxWinrate = document.getElementById('chart-winrate').getContext('2d');
var ctxPopularity = document.getElementById('chart-popularity').getContext('2d');

var chartWinrate = new Chart(ctxWinrate, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: "Winrate over time",
            tension: .6,
            fill: false,
            borderWidth: 2,
            pointRadius: 0,
            data: []
        }]
    },
    options: {
      animation: {
        duration: 0
      },
      maintainAspectRatio: false,
      linearGradientLine: 'winrate',
      legend: {
        display: false
      },
      scales: {
        yAxes: [{
          ticks: {
            min: 20,
            max: 80,
            stepSize: 10,
            callback: function(value, index, values) {
              return value + '%';
            }
          }
        }]
      }
    }
});
var chartPopularity = new Chart(ctxPopularity, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: "Popularity over time",
            tension: .6,
            fill: false,
            borderWidth: 2,
            pointRadius: 0,
            data: []
        }]
    },
    options: {
      animation: {
        duration: 0
      },
      maintainAspectRatio: false,
      linearGradientLine: 'popularity',
      legend: {
        display: false
      },
      scales: {
        yAxes: [{
          ticks: {
            min: 0,
            max: 50,
            stepSize: 10,
            callback: function(value, index, values) {
              return value + '%';
            }
          }
        }]
      }
    }
});

function addData(chart, labels, data) {
    chart.data.labels = labels;
    chart.data.datasets[0].data = data;
    chart.update();
}

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
  jHash.clearQuery();
}

function cardDetail(el) {

  // hit reference
  var target = $(el).find('.hit').data('target');
  var hearthpwnID = $('#'+ target).data('hearthpwn');
  var dbfId = $('#'+ target).data('dbfid');

  $('.stats-wrapper').addClass('hide');

  hearthpwn.helper.clearRefinements('cards');
  hearthpwn.helper.addFacetRefinement('cards', hearthpwnID );
  hearthpwn.helper.search();

  index.getObject(dbfId,function(err, data){

    var dataPopularity = data.popularityOT.map(function(v){return v.y.toFixed(2)});
    var labelsPopularity = data.popularityOT.map(function(v){return v.x;});
    var dataWinrate = data.winrateOT.map(function(v){return v.y.toFixed(2)});
    var labelsWinrate = data.winrateOT.map(function(v){return v.x});

    addData(chartWinrate, labelsWinrate, dataWinrate);
    addData(chartPopularity, labelsPopularity, dataPopularity);

    if(err === null){
      $('.stats-wrapper').removeClass('hide');
    };
  });

  var position = $('#'+ target).data('position');
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

  setTimeout(sunwellRender,200);

  // clone in lightbox
  $('.card-detail-wrapper').append($('#results #'+ target).clone());

  //tracking goal
  dataLayer.push({'event': 'open_cardDetails'});
  //analytics.track('[SGMNT] Opened Card', {name: 'cardName',positon:'hitPosition'});
  _kmq.push(['record', '[KM] Opened Card', {'Clicked Hit Position': position, 'Card ID': target}]);

}

function removePlaceholder(el){
  el.siblings('.placeholder').remove();
}

function playFlash(){
  $('.lightbox').removeClass('flash');
}

$('.lightbox').on('click', function(){
  closeLightbox();
});

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
  assetFolder: cloudinaryUrl + 'q_20,fl_lossy/',
  textureFolder: cloudinaryUrl + 'w_300,q_60,fl_lossy/',
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

  });
};
