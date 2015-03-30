angular.module('unionvmsWeb')
.factory('vesselRestService', function($http, $log, $q, restConstants, VesselListPage, Vessel){

    var baseUrl = "http://"+restConstants.host + ":" + restConstants.port;

    var getVesselList = function(listSize, page, criteria, isDynamic){
        var postData = {
            "pagination":{
                "listSize":listSize,
                "page":page
            },
            "searchCriteria":{
                "criterias":criteria,
                "isDynamic": isDynamic
            }
        };

        var deferred = $q.defer();

        $http.post(baseUrl + "/vessel-rest/vessel/list", postData).success(function(response) {
            var vessels = [];
            for (var i = 0; i < response.data.vessel.length; i ++) {
                vessels.push(new Vessel(response.data.vessel[i]));
            }
            var currentPage = response.data.currentPage;
            var totalNumberOfPages = response.data.totalNumberOfPages;
            var vesselListPage = new VesselListPage(vessels, currentPage, totalNumberOfPages);
            deferred.resolve(vesselListPage);
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

    return {
        getVesselList: getVesselList,
        updateVessel: updateVessel,
        createNewVessel: createNewVessel,
        getSearchableFields : getSearchableFields,
        getVesselHistory : getVesselHistory,
        getVesselHistoryListByVesselId : getVesselHistoryListByVesselId
    };
});





