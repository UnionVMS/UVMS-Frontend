describe('searchService', function() {

  beforeEach(module('unionvmsWeb'));


  it('getAdvancedSearchObject should return the advanced search object', inject(function(searchService) {

    expect(Object.keys(searchService.getAdvancedSearchObject()).length).toEqual(0);

  }));

  it('getListRequest should return the getListRequest object', inject(function(searchService, GetListRequest) {

    expect(searchService.getListRequest() instanceof GetListRequest).toBeTruthy();

  }));


  it('resetAdvancedSearch should reset the advanced search object', inject(function(searchService) {

    var advancedSearchObject = searchService.getAdvancedSearchObject();
    advancedSearchObject.TEST = 'Test';
    advancedSearchObject.ANOTHER_SEARCH_KEY = 'Test again';

    expect(Object.keys(searchService.getAdvancedSearchObject()).length).toEqual(2);
    searchService.resetAdvancedSearch();
    expect(Object.keys(searchService.getAdvancedSearchObject()).length).toEqual(0);

  }));

  it('reset should reset the getListRequest and the advanced search object', inject(function(searchService) {

    var advancedSearchObject = searchService.getAdvancedSearchObject();
    var getListRequest = searchService.getListRequest();
    getListRequest.page = 4;
    getListRequest.isDynamic = false;
    getListRequest.criterias = [1,2,3];

    advancedSearchObject.TEST = 'Test';
    advancedSearchObject.ANOTHER_SEARCH_KEY = 'Test again';
    expect(Object.keys(searchService.getAdvancedSearchObject()).length).toEqual(2);

    //Reset
    searchService.reset();
    var getListRequest = searchService.getListRequest();

    expect(Object.keys(searchService.getAdvancedSearchObject()).length).toEqual(0);
    expect(getListRequest.page).toEqual(1);
    expect(getListRequest.isDynamic).toEqual(true);
    expect(getListRequest.criterias.length).toEqual(0);

  }));
});