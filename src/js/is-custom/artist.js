export default {
  getConfiguration: () => ({
    facets: ['artist'],
  }),
  init: () => {},
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
