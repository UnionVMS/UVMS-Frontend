(function(){

    var savedsearches = function($http){

        var getSavedSearches = function(){
            return[
                {
                    'name':'Groups',
                            'members':[
                                {
                                    'name':'Swedish shrimp fishing vessel',
                                    'value':'Swedish'
                                },
                                {
                                    'name':'EU Fishing vessels',
                                    'value':'EU'
                                },
                                {
                                    'name':'Swedish vessels',
                                    'value':'SWV'
                                }
                            ]
                },
                {
                    'name':'Saved searches',
                            'members':[
                                {
                                    'name':'Inactive for over a year',
                                    'value':'Inactive'
                                },
                                {
                                    'name':'EU vessels',
                                    'value':'EUV'
                                }
                            ]
                }
            ];
        };

        var getGroups = function(){
            return[
                {
                    'id':'12',
                    'name':'Swedish sharks',
                    'filter': 'Dock'
                },
                {
                    'id':'13',
                    'name':'Danish shrimps',
                    'filter': 'Anchor'
                },
                {
                    'id':'14',
                    'name':'UK lobsters',
                    'filter': 'Fishing'
                }

            ];
        };

        var getPredefinedGroups = function(){
            return[
                {
                    'id':'21',
                    'name':'Swedish vessels',
                    'filter': 'SWE'
                },
                {
                    'id':'22',
                    'name':'Danish trawlers',
                    'filter': 'DK'
                },
                {
                    'id':'23',
                    'name':'EU vessels',
                    'filter': 'ROU'
                }];
        };

        var createSearchFieldsFromAdvancedSearch = function(advancedSearch){
            var searchFields = [];
            $.each(advancedSearch, function(key, value){
                searchFields.push({
                    "key" : key,
                    "value" : value
                });
                
            });
            return searchFields;
        };

        var userName = "FRONTEND_USER";
        var getVesselGroupsForUser = function (){
            return $http.get("http://livm67u:28080/vessel-rest/group/list?user=" +userName);
        };

        var createNewVesselGroup = function(name, advancedSearch){
            var data = {
                "user" : userName,
                "name" : name,
                "searchFields" : createSearchFieldsFromAdvancedSearch(advancedSearch)
            };
            return $http.post("http://livm67u:28080/vessel-rest/group", data);
        };        

        var updateVesselGroup = function(groupId, advancedSearch){
            var data = {
                "user" : userName,
                "id" : groupId,
                "searchFields" : createSearchFieldsFromAdvancedSearch(advancedSearch)
            };
            return $http.put("http://livm67u:28080/vessel-rest/group", data);
        };  

        return{
            getSavedSearches : getSavedSearches,
            getGroups : getGroups,
            getPredefinedGroups : getPredefinedGroups,
            getVesselGroupsForUser : getVesselGroupsForUser,
            createNewVesselGroup : createNewVesselGroup,
            updateVesselGroup : updateVesselGroup
        };
    };

    var module = angular.module('unionvmsWeb');
    module.factory('savedsearches',savedsearches);

}());

/*
angular.module('unionvmsWeb').factory('savedsearches',function() {

	var savedsearches = {};

	return savedsearches;
});
*/
