
(function(){

    var configurationService = function(vesselRestService, movementRestService){

        var configForVessel  = function(){
            return vesselRestService.getConfig();
        };

        var configForMovement  = function(){            
            return movementRestService.getConfig();
        };

        var configForAudit = function (){
            return;
        };

        return{
            getConfigForVessel: configForVessel,
            getConfigForAudit: configForAudit,
            getConfigForMovement : configForMovement
        };
    };

    angular.module('unionvmsWeb')
	.factory('configurationService',['vesselRestService', 'movementRestService', configurationService]);
    
}());
