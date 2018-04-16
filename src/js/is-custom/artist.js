export default {
  getConfiguration: () => ({
    facets: ['artist'],
  }),
  init: ({helper}) => {
    $(document).on('click', 'a[data-filter]', (e) => {
      if (e.ctrlKey || e.altKey || e.metaKey) return true;

      const link = $(e.target);
      const filter = link.data('filter');
      const [type, value] = filter.split(':');

      e.preventDefault();

      helper.addFacetRefinement(type, value).search();
    });
  },
  getWidgetSearchParameters: (searchParameters, {uiState}) => {
    let sp = searchParameters.clearRefinements('artist');
    if (uiState.artist) {
      sp = sp.addFacetRefinement('artist', uiState.artist);
    }
    return sp;
  },
  getWidgetState: (uiState, {searchParameters}) => {
    const currentArtist = searchParameters.getConjunctiveRefinements('artist');

    if (!currentArtist) return uiState;

    return Object.assign(
      {},
      uiState,
      {artist: currentArtist[0]}
    );
  }
};
