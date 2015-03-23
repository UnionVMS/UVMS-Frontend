
(function(){
    var vessel = function($http, $log){


        var getVesselList = function(){
            return $http.get("http://livm67t:28080/vessel-rest/vessel/list");
        };

        var updateVessel = function(data){
            return $http.put("http://livm67t:28080/vessel-rest/vessel", data );
        };

        var createNewVessel = function(data){
            return $http.post("http://livm67t:28080/vessel-rest/vessel", data);
        };

        var getSearchableFields = function (){
            return $http.get("http://livm67u:28080/vessel-rest/vessel/config/searchfields");
        };

        return{
            getVesselList: getVesselList,
            updateVessel: updateVessel,
            createNewVessel: createNewVessel,
            getSearchableFields : getSearchableFields
        };
    };

    var module = angular.module('unionvmsWeb');
    module.factory('vessel',vessel);

}());



