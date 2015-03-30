angular.module('unionvmsWeb')
.factory('vesselRestService', function($http, $log, restConstants){

    var baseUrl = "http://"+restConstants.host + ":" + restConstants.port;

    var getVesselList = function(listSize, page, criteria, isDynamic){
        var data = {
            "pagination":{
                "listSize":listSize,
                "page":page
            },
            "searchCriteria":{
                "criterias":criteria,
                "isDynamic": isDynamic
            }
        };
        return $http.post(baseUrl + "/vessel-rest/vessel/list", data);
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

    return {
        getVesselList: getVesselList,
        updateVessel: updateVessel,
        createNewVessel: createNewVessel,
        getSearchableFields : getSearchableFields,
        getVesselHistory : getVesselHistory,
        getVesselHistoryListByVesselId : getVesselHistoryListByVesselId
    };
});





