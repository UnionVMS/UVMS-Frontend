describe('SavedSearchGroup', function() {

	beforeEach(module('unionvmsWeb'));

	var responseData = {
		dynamic: true,
		guid: 44,
		name: "Test swe",
		searchFields: [
			{
				key: "FLAG_STATE",
				value: "SWE"
			},
			{
				key: "NAME",
				value: "TEST"
			},
            {
                key: "MIN_LENGTH",
                value: "4"
            },
            {
                key: "MAX_LENGTH",
                value: "12"
            },
            {
                key: "MIN_POWER",
                value: "5"
            },
		],
		user: "FRONTEND_USER",
	};


	it('fromVesselDTO should build a correct object', inject(function(SavedSearchGroup) {
		var group = SavedSearchGroup.fromVesselDTO(responseData);
		expect(group.dynamic).toEqual(responseData.dynamic);
		expect(group.id).toEqual(responseData.guid);
		expect(group.name).toEqual(responseData.name);
        expect(group.user).toEqual(responseData.user);

		expect(group.searchFields.length).toEqual(4);

        var minLength, lengthSpan, name, searchCriteriaKey, searchCriteriaValue;
        $.each(group.searchFields, function(index, serachField){
            searchCriteriaKey = serachField.key;
            searchCriteriaValue = serachField.value;
            if(searchCriteriaKey === 'LENGTH_SPAN'){
                lengthSpan = searchCriteriaValue;
            }
            if(searchCriteriaKey === 'MIN_LENGTH'){
                minLength = searchCriteriaValue;
            }
            if(searchCriteriaKey === 'POWER_SPAN'){
                powerSpan = searchCriteriaValue;
            }
            if(searchCriteriaKey === 'NAME'){
                name = searchCriteriaValue;
            }
        });
        //Correct values?
        expect(lengthSpan).toEqual('4-12');
        expect(minLength).toEqual(undefined);
        expect(powerSpan).toEqual('5+');
        expect(name).toEqual('TEST');


	}));

    it('toVesselDTO should return correctly formatted data', inject(function(SavedSearchGroup) {

        var group = SavedSearchGroup.fromVesselDTO(responseData);
        expect(group.searchFields.length).toEqual(4, 'Should be 4 searchFields in the group object');

        var dto = group.toVesselDTO(); //This function should create custom list of searchFields (replace spans with min/max values)
        expect(dto.guid).toEqual(responseData.guid, 'guid should be set in the dto');
        expect(dto.name).toEqual(responseData.name, 'name should be set in the dto');
        expect(dto.dynamic).toEqual(responseData.dynamic, 'dynamic should be set in the dto');
        expect(dto.searchFields.length).toEqual(5, 'Should be 5 searchFields in the dto');

        //Group searchFields should be untouched
        expect(group.searchFields.length).toEqual(4, 'Should still be 4 searchFields in the group object');

    }));

	it('getSearchFieldsCopy should create a copy of the searchField list', inject(function(SavedSearchGroup) {

		var group = SavedSearchGroup.fromVesselDTO(responseData);
        var searchFieldsCopy = group.getSearchFieldsCopy();
        expect(JSON.stringify(searchFieldsCopy)).toEqual(JSON.stringify(group.searchFields));

        //Modifying the copy should not modify the original list
        searchFieldsCopy[0].key ="CHANGED";
        expect(JSON.stringify(searchFieldsCopy)).not.toEqual(JSON.stringify(group.searchFields), "Modifying the copy should not modify the original list");

	}));

});