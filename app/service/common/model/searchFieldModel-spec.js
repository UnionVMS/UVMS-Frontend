/*
﻿Developed with the contribution of the European Commission - Directorate General for Maritime Affairs and Fisheries
© European Union, 2015-2016.

This file is part of the Integrated Fisheries Data Management (IFDM) Suite. The IFDM Suite is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as published by the
Free Software Foundation, either version 3 of the License, or any later version. The IFDM Suite is distributed in
the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. You should have received a
copy of the GNU General Public License along with the IFDM Suite. If not, see <http://www.gnu.org/licenses/>.
 */
describe('SearchField', function() {

  beforeEach(module('unionvmsWeb'));

	var responseData = {
		key: "FLAG_STATE", 
		value: "SWE"
	};

	it('fromJson should build a correct object', inject(function(SearchField) {
		var searchField = SearchField.fromJson(responseData);
		expect(searchField.key).toEqual(responseData.key);
		expect(searchField.value).toEqual(responseData.value);
	}));

	it('toJson should return correctly formatted data', inject(function(SearchField) {

		var searchField = SearchField.fromJson(responseData);
		var toJsonObject = JSON.parse(searchField.toJson());
		expect(angular.equals(toJsonObject, responseData)).toBeTruthy();

	}));

});