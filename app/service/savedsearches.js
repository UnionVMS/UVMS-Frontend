(function(){
    var savedsearches = function($http){

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

        var createNewVesselGroup = function(name, advancedSearch, dynamic){
            var data = {
                "user" : userName,
                "name" : name,
                "searchFields" : createSearchFieldsFromAdvancedSearch(advancedSearch),
                "dynamic" : dynamic
            };
            return $http.post("http://livm67u:28080/vessel-rest/group", data);
        };

        var updateVesselGroup = function(groupId, advancedSearch, dynamic){
            console.log(advancedSearch);
            var data = {
                "user" : userName,
                "name" : name,
                "id" : groupId,
                "searchFields" : createSearchFieldsFromAdvancedSearch(advancedSearch),
                "dynamic" : dynamic
            };
            return $http.put("http://livm67u:28080/vessel-rest/group", data);
        };

        return{
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
