
(function(){
    var vessel = function($http, $log){


        var getVesselList = function(){
            return $http.get("http://livm67u:28080/vessel-rest/vessel/list");
        };

        var updateVessel = function(data){
            return $http.put("http://livm67u:28080/vessel-rest/vessel", data );
        };

        var createNewVessel = function(data){
            return $http.post("http://livm67u:28080/vessel-rest/vessel", data);
        };

        return{
            getVesselList: getVesselList,
            updateVessel: updateVessel,
            createNewVessel: createNewVessel
        };
    };

    var module = angular.module('unionvmsWeb');
    module.factory('vessel',vessel);

}());
