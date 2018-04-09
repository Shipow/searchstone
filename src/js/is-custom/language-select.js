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

//custom widget for language select
function languageSelect($container) {
  return {

    getConfiguration: function() {
      let widgetConfiguration = {
        ['disjunctiveFacets'] : ['lang']
      };
      return widgetConfiguration;
    },

    init: function(params) {
      var helper = params.helper;

      $container.on('click','.wz-select', function(e){
        e.stopPropagation();
        $(this).toggleClass('active');
      });

      $('html').click(function() {
        $container.find('.wz-select').removeClass('active');
      });

      $container.on('click', '.wz-select ul li:not(.active)', function() {
        var v = $(this).html();
        var lang = $(this).data('lang')
        $('.wz-select ul li').removeClass('active');
        $(this).addClass('active');
        $(this).find('.wz-select label button').html(v);
        helper.clearRefinements('lang');
        helper.addDisjunctiveFacetRefinement('lang', lang).search();
        localStorage.setItem("lang", lang);
      });
    },

    render: function(params) {
      var results = params.results;

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
    },

    getWidgetState: function(uiState, opts) {
      const searchParameters = opts.searchParameters;
      const selectedLang = searchParameters.getDisjunctiveRefinements('lang');
      if(selectedLang.length > 0) {
        return Object.assign({}, uiState, {
          lang: selectedLang[0],
        });
      }
      return uiState;
    },

    getWidgetSearchParameters: function(searchParameters, opts) {
      const uiState = opts.uiState;
      if(uiState.lang) {
        return searchParameters.clearRefinements('lang').toggleRefinement('lang', uiState.lang);
      }
      else {
        // Retrieve in local storage fallback to browser lang
        var lang = localStorage.getItem("lang") || getNavLang();
        return searchParameters.clearRefinements('lang').toggleRefinement('lang', lang);
      }
    }
  }
}

function getNavLang() {
  var navLang = window.navigator.userLanguage || window.navigator.language || 'en-US';

  if (navLang.indexOf('-') !== -1){
    navLang = navLang.split('-')[0] + navLang.split('-')[1].toUpperCase();
  } else if (navLang.indexOf('_') !== -1) {
    navLang = navLang.split('_')[0] + navLang.split('_')[1].toUpperCase();
  } else {
    navLang = navLang + navLang.toUpperCase();
  }

  //fallback to English
  if (typeof langMap[navLang] === 'undefined'){
    navLang = 'enUS';
  }

  return navLang;
}

export default languageSelect;
