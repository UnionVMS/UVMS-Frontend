angular.module('unionvmsWeb')
.factory('vesselRestService', function($http, $log, $q, restConstants, VesselListPage, Vessel, SavedSearchGroup){

    var baseUrl = restConstants.baseUrl;

    var getVesselList = function(getListRequest){
        var deferred = $q.defer();

        $http.post(baseUrl + "/vessel-rest/vessel/list", getListRequest.toJson())
            .success(function(response, status) {
                var vessels = [];
                if(angular.isArray(response.data.vessel)){
                    for (var i = 0; i < response.data.vessel.length; i ++) {
                        vessels.push(Vessel.fromJson(response.data.vessel[i]));
                    }
                }
                var currentPage = response.data.currentPage;
                var totalNumberOfPages = response.data.totalNumberOfPages;
                var vesselListPage = new VesselListPage(vessels, currentPage, totalNumberOfPages);
                deferred.resolve(vesselListPage);
            })
            .error(function(data, status, headers, config){
                deferred.reject(data);
            });

        return deferred.promise;        
    };

    var updateVessel = function(data){
        return $http.put(baseUrl + "/vessel-rest/vessel", data );
    };

    var createNewVessel = function(data){
        return $http.post(baseUrl + "/vessel-rest/vessel", data);
    };

    var getSearchableFields = function (){
        return $http.get(baseUrl + "/vessel-rest/vessel/config/searchfields");
    };

    var getVesselHistoryListByVesselId = function(vesselId, maxNbr) {
        if(!maxNbr) {
            return $http.get(baseUrl + "/vessel-rest/history/vessel?vesselId="+vesselId);
        } else {
            return $http.get(baseUrl + "/vessel-rest/history/vessel?vesselId="+vesselId+"&maxNbr="+maxNbr);
        }
    };

    var getVesselHistory = function(data) {
        return $http.get(baseUrl + "/vessel-rest/history/"+data);
    };

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
        var deferred = $q.defer();

        $http.get(baseUrl+"/vessel-rest/group/list?user=" +userName).success(function(response) {
            var groups = [];
            if(angular.isArray(response.data)){
                for (var i = 0; i < response.data.length; i ++) {
                    groups.push(SavedSearchGroup.fromJson(response.data[i]));
                }
            }
            deferred.resolve(groups);
        });

        return deferred.promise;           
    };

    var createNewVesselGroup = function(savedSearchGroup){
        savedSearchGroup.user = userName;
        /*var data = {
            "user" : userName,
            "name" : name,
            "searchFields" : createSearchFieldsFromSearchObj(searchObj, dynamic),
            "dynamic" : dynamic
        };*/
        return $http.post(baseUrl+"/vessel-rest/group", savedSearchGroup.toJson());
    };

    var updateVesselGroup = function(savedSearchGroup){
        savedSearchGroup.user = userName;
        /*var data = {
            "user" : userName,
            "name" : name,
            "id" : groupId,
            "searchFields" : createSearchFieldsFromSearchObj(searchObj, dynamic),
            "dynamic" : dynamic
        };*/
        return $http.put(baseUrl+"/vessel-rest/group", savedSearchGroup.toJson());
    };    

    return {
        getVesselList: getVesselList,
        updateVessel: updateVessel,
        createNewVessel: createNewVessel,
        getSearchableFields : getSearchableFields,
        getVesselHistory : getVesselHistory,
        getVesselHistoryListByVesselId : getVesselHistoryListByVesselId,
        getVesselGroupsForUser : getVesselGroupsForUser,
        createNewVesselGroup : createNewVesselGroup,
        updateVesselGroup : updateVesselGroup        
    };
});





