/*
Developed with the contribution of the European Commission - Directorate General for Maritime Affairs and Fisheries
© European Union, 2015-2016.

This file is part of the Integrated Fisheries Data Management (IFDM) Suite. The IFDM Suite is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as published by the
Free Software Foundation, either version 3 of the License, or any later version. The IFDM Suite is distributed in
the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. You should have received a
copy of the GNU General Public License along with the IFDM Suite. If not, see <http://www.gnu.org/licenses/>.
 */
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