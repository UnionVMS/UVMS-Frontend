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
describe('GetListRequest', function() {

  beforeEach(module('unionvmsWeb'));

	it('should set correct values from the start with empty constructor', inject(function(GetListRequest) {
		var getListRequest = new GetListRequest();
		expect(getListRequest.listSize).toEqual(10);
		expect(getListRequest.page).toEqual(1);
		expect(getListRequest.isDynamic).toEqual(true);
		expect(getListRequest.criterias).toEqual([]);
	}));

	it('should set correct values from the start', inject(function(GetListRequest, SearchField) {
		var searchField1 = new SearchField("NAME", "TEST"),
			searchField2 = new SearchField("COUNTRY", "Swe"),
			criterias = [searchField1, searchField2],
			listSize = 15,
			page = 2,
			dynamic = false;
		var getListRequest = new GetListRequest(page, listSize, dynamic, criterias);

		expect(getListRequest.listSize).toEqual(listSize);
		expect(getListRequest.page).toEqual(page);
		expect(getListRequest.isDynamic).toEqual(dynamic);
		expect(getListRequest.criterias.length).toEqual(criterias.length);
	}));

	/**
	* it should look like:
	* {pagination: {listSize: "10", page: "1"}, searchCriteria: {criterias: [], isDynamic: "true"}}
	*
	*/
	it('toJson should return correctly formatted data', inject(function(GetListRequest, SearchField) {
		var searchField1 = new SearchField("NAME", "TEST"),
			searchField2 = new SearchField("COUNTRY", "Swe"),
			criterias = [searchField1, searchField2],
			listSize = 15,
			page = 2,
			dynamic = false;
		var getListRequest = new GetListRequest(page, listSize, dynamic, criterias);
		var toJsonObject = JSON.parse(getListRequest.toJson());

		expect(toJsonObject.pagination.listSize).toEqual(listSize);
		expect(toJsonObject.pagination.page).toEqual(page);
		expect(toJsonObject.searchCriteria.isDynamic).toEqual(dynamic);
		expect(angular.equals(toJsonObject.searchCriteria.criterias, criterias)).toBeTruthy();
	}));

	it('setPage should set correct page', inject(function(GetListRequest) {
		var getListRequest = new GetListRequest();
		getListRequest.setPage(5);
		expect(getListRequest.page).toEqual(5);
	}));

    it('addSearchCriteria to add a search criteria to the list', inject(function(GetListRequest) {
        var getListRequest = new GetListRequest();
        expect(getListRequest.criterias.length).toEqual(0);

        //Add criteria 1
        getListRequest.addSearchCriteria("NAME", "TEST");
        expect(getListRequest.criterias.length).toEqual(1);

        //Add criteria 2);
        getListRequest.addSearchCriteria("COUNTRY", "Swe");
        expect(getListRequest.criterias.length).toEqual(2);
    }));

	it('removeSearchCriteria to remove a search criteria from the list', inject(function(GetListRequest) {
		var getListRequest = new GetListRequest();

		//Add criterias
        getListRequest.addSearchCriteria("NAME", "TEST");
        getListRequest.addSearchCriteria("COUNTRY", "Swe");
        getListRequest.addSearchCriteria("IRCS", "ABCD123");
		expect(getListRequest.criterias.length).toEqual(3, "Should be 3 search criterias before removeing one");

        //remove country search criteria
        getListRequest.removeSearchCriteria("COUNTRY");

        expect(getListRequest.criterias.length).toEqual(2, "Should be 2 search criterias after removing one");
        expect(getListRequest.criterias[0].key).toEqual("NAME");
        expect(getListRequest.criterias[1].key).toEqual("IRCS");
	}));

	it('setSearchCriteria should set the search criteria list', inject(function(GetListRequest, SearchField) {
		var getListRequest = new GetListRequest();

		var searchField0 = new SearchField("NAME", "TADA");
		getListRequest.addSearchCriteria(searchField0);
		expect(getListRequest.criterias.length).toEqual(1);

		var searchField1 = new SearchField("NAME", "TEST"),
			searchField2 = new SearchField("COUNTRY", "Swe"),
			criterias = [searchField1, searchField2];

		getListRequest.setSearchCriterias(criterias);
		expect(getListRequest.criterias.length).toEqual(2);
		expect(getListRequest.criterias[0]).toEqual(searchField1);
	}));

	it('resetCriterias to remove all search criterias from the list', inject(function(GetListRequest, SearchField) {
		var searchField1 = new SearchField("NAME", "TEST"),
			searchField2 = new SearchField("COUNTRY", "Swe"),
			criterias = [searchField1, searchField2];

		var getListRequest = new GetListRequest(1, 10, false, criterias);
		expect(getListRequest.criterias.length).toEqual(2);

		//Reset criterias
		getListRequest.resetCriterias();
		expect(getListRequest.criterias.length).toEqual(0);
	}));

	it('setDynamicToFalse should set dynamic to false', inject(function(GetListRequest) {
		var getListRequest = new GetListRequest();
		expect(getListRequest.isDynamic).toEqual(true);
		getListRequest.setDynamicToFalse();
		expect(getListRequest.isDynamic).toEqual(false);
	}));

	it('setDynamicToTrue should set dynamic to true', inject(function(GetListRequest) {
		var getListRequest = new GetListRequest();
		getListRequest.setDynamicToFalse();
		expect(getListRequest.isDynamic).toEqual(false);
		getListRequest.setDynamicToTrue();
		expect(getListRequest.isDynamic).toEqual(true);
	}));
});