
(function(){
    var vessel = function($http, $log){

        var getVesselList = function(listSize, page, criteria, isDynamic){
            var data =
            {
                "pagination":{
                    "listSize":listSize,
                    "page":page
                },
                "searchCriteria":{
                    "criterias":criteria,
                    "isDynamic": isDynamic
                }
            };
            return $http.post("http://livm67u:28080/vessel-rest/vessel/list", data);
        };

        var updateVessel = function(data){
            return $http.put("http://livm67u:28080/vessel-rest/vessel", data );
        };

        var createNewVessel = function(data){
            return $http.post("http://livm67u:28080/vessel-rest/vessel", data);
        };

        var getSearchableFields = function (){
            return $http.get("http://livm67u:28080/vessel-rest/vessel/config/searchfields");
        };

        var getVesselHistoryListByVesselId = function(vesselId, maxNbr) {
            if(!maxNbr) {
return $http.get("http://livm67u:28080/vessel-rest/history/vessel?vesselId="+vesselId);
            } else {
                return $http.get("http://livm67u:28080/vessel-rest/history/vessel?vesselId="+vesselId+"&maxNbr="+maxNbr);
            }
        };

        var getVesselHistory = function(data) {
            return $http.get("http://livm67u:28080/vessel-rest/history/"+data);
        };

        return{
            getVesselList: getVesselList,
            updateVessel: updateVessel,
            createNewVessel: createNewVessel,
            getSearchableFields : getSearchableFields,
            getVesselHistory : getVesselHistory,
            getVesselHistoryListByVesselId : getVesselHistoryListByVesselId
        };
    };

    var module = angular.module('unionvmsWeb');
    module.factory('vessel',vessel);

}());



