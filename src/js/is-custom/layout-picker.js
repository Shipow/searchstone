let currentLayout;
const layoutPicker = {
  init: () => {
    if(currentLayout === 'list')  {
      $('#template-toggle a').toggleClass('active');
      $('.results').toggleClass('hide');
    }

    $("#template-toggle").on('click', 'a:not(.active)', function(e){
      e.preventDefault();

      $('#template-toggle a').toggleClass('active');
      $('.results').toggleClass('hide');

      if(currentLayout === 'list'){
        currentLayout = 'cards'
        search.helper
          .setQueryParameter('hitsPerPage',24)
          .setQueryParameter('attributesToRetrieve', '*').search();
      } else {
        currentLayout = 'list';
        search.helper
          .setQueryParameter('hitsPerPage',150)
          .setQueryParameter('attributesToRetrieve','cost,health,attack,durability,set,setFull,id,rarity,race,type,name,nameVO,playerClass,flavor,artist,hearthpwnID,lang,anim,dbfId,setShort').search();
      }
    });
  },
  getWidgetState: function(uiState) {
    return Object.assign({}, uiState, {
      layout: currentLayout === 'list' ? 'list' : undefined,
    });
  },
  getWidgetSearchParameters: function(sp, opts) {
    const uiState = opts.uiState;
    if(uiState.layout === 'list') {
      currentLayout = 'list';
      sp.setQueryParameter('hitsPerPage',24)
        .setQueryParameter('attributesToRetrieve', '*');
    } else {
      currentLayout = 'cards';
      sp.setQueryParameter('hitsPerPage',150)
        .setQueryParameter('attributesToRetrieve','cost,health,attack,durability,set,setFull,id,rarity,race,type,name,nameVO,playerClass,flavor,artist,hearthpwnID,lang,anim,dbfId,setShort');
    }
    return sp;
  }
};

export default layoutPicker;
