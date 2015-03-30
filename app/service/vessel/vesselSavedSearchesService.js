angular.module('unionvmsWeb')
.factory('vesselSavedSearchesService', function($http, restConstants) {
    var baseUrl = "http://"+restConstants.host+":"+restConstants.port;

        var createSearchFieldsFromSearchObj = function(searchObj, dynamic){
            var searchFields = [];
            $.each(searchObj, function(key, value){
                if(!dynamic){
                    key = "INTERNAL_ID";
                }
                searchFields.push({
                    "key": key,
                    "value": value
                });
            });
            return searchFields;
        };

    var userName = "FRONTEND_USER";
    var getVesselGroupsForUser = function (){
        return $http.get(baseUrl+"/vessel-rest/group/list?user=" +userName);
    };

    var createNewVesselGroup = function(name, searchObj, dynamic){
        var data = {
            "user" : userName,
            "name" : name,
            "searchFields" : createSearchFieldsFromSearchObj(searchObj, dynamic),
            "dynamic" : dynamic
        };
        return $http.post(baseUrl+"/vessel-rest/group", data);
    };

    var updateVesselGroup = function(groupId, searchObj, dynamic){
        var data = {
            "user" : userName,
            "name" : name,
            "id" : groupId,
            "searchFields" : createSearchFieldsFromSearchObj(searchObj, dynamic),
            "dynamic" : dynamic
        };
        return $http.put(baseUrl+"/vessel-rest/group", data);
    };

    return{
        getVesselGroupsForUser : getVesselGroupsForUser,
        createNewVesselGroup : createNewVesselGroup,
        updateVesselGroup : updateVesselGroup
    };
});
