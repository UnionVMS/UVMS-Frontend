describe('SavedSearchGroup', function() {

	beforeEach(module('unionvmsWeb'));

	var responseData = {
		dynamic: true,
		id: 44,
		name: "Test swe",
		searchFields: [
			{
				key: "FLAG_STATE", 
				value: "SWE"
			},
			{
				key: "NAME", 
				value: "Test vessel"
			},			
		],
		user: "FRONTEND_USER",
	};


	it('fromJson should build a correct object', inject(function(SavedSearchGroup) {
		var group = SavedSearchGroup.fromJson(responseData);
		expect(group.dynamic).toEqual(responseData.dynamic);
		expect(group.id).toEqual(responseData.id);
		expect(group.name).toEqual(responseData.name);
		expect(group.user).toEqual(responseData.user);
		expect(angular.equals(group.searchFields, responseData.searchFields)).toBeTruthy();

	}));

	it('toJson should return correctly formatted data', inject(function(SavedSearchGroup) {

		var group = SavedSearchGroup.fromJson(responseData);
		var toJsonObject = JSON.parse(group.toJson());
		expect(angular.equals(toJsonObject, responseData)).toBeTruthy();

	}));

});