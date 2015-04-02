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
