//custom widget for language select
function languageSelect($container) {

  //language mapping
  var langMap = {
    "enUS": {
      "name": "English",
      "native": "English",
      "short": 'US'
    },
    "deDE": {
      "name": "German",
      "native": "Deutsch",
      "short": 'DE'
    },
    "esES": {
      "name": "Spanish",
      "native": "Español",
      "short": 'ES'
    },
    "esMX": {
      "name": "Mexican",
      "native": "Mexicano",
      "short": 'MX'
    },
    "frFR": {
      "name": "French",
      "native": "Français",
      "short": 'FR'
    },
    "itIT": {
      "name": "Italian",
      "native": "Italiano",
      "short": 'IT'
    },
    "jaJP": {
      "name": "Japanese",
      "native": "日本語",
      "short": 'JP'
    },
    "koKR": {
      "name": "Korean",
      "native": "한국어",
      "short": 'KR'
    },
    "plPL": {
      "name": "Polish",
      "native": "Język polski",
      "short": 'PL'
    },
    "ptBR": {
      "name": "Portuguese",
      "native": "Português",
      "short": 'BR'
    },
    "ruRU": {
      "name": "Russian",
      "native": "Русский",
      "short": 'RU'
    },
    "thTH": {
      "name": "Thai",
      "native": "ไทย",
      "short": 'TH'
    },
    "zhCN": {
      "name": "Chinese",
      "native": "中文",
      "short": 'CN'
    },
    "zhTW": {
      "name": "Taiwanese",
      "native": "國語",
      "short": 'TW'
    }
  };

  return {

    getConfiguration: function() {
      let widgetConfiguration = {
        ['disjunctiveFacets'] : ['lang']
      };
      return widgetConfiguration;
    },

    init: function(params) {
      var helper = params.helper;

      if(!helper.hasRefinements("lang")){
        helper.toggleRefinement( "lang", "enUS");
      }

      $container.on('click','.wz-select', function(e){
        e.stopPropagation();
        $(this).toggleClass('active');
      });

      $('html').click(function() {
        $('.wz-select').removeClass('active');
      });

      $container.on('click', '.wz-select ul li', function() {
        console.log('test');
        var v = $(this).html();
        $('.wz-select ul li').removeClass('active');
        $(this).addClass('active');
        $(this).find('.wz-select label button').html(v);
        helper.clearRefinements('lang');
        helper.addDisjunctiveFacetRefinement('lang', $(this).data('lang')).search();
      });
    },

    render: function(params) {
      var results = params.results;
      var helper = params.helper;

      var languages = results.getFacetValues('lang');
      var html;

      if (results.hits.length === 0) {
        html = 'No results';
      } else {
        html = "<div class='wz-select'>" +
          "<button type='button'><span class='short'>" + langMap[languages[0].name].short + "</span> <span class='long'>" + langMap[languages[0].name].name + "</span></button>" +
          "<ul id='ul-id'>";

        $.each(languages,function(){
          if(this.isRefined){
            html+= '<li class="active">';
          } else {
            html+= '<li data-lang="' + this.name + '">';
          }
          html += langMap[this.name].name + " (" + langMap[this.name].native + ")</li>";

        });

        html +=
           "</ul>" +
         "</div>";
        $container.html(html);


      }
    }
  }
}

export default languageSelect;
