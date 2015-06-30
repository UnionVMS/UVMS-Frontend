
(function(){

    var configurationService = function(vesselRestService){

        var configForVessel  = function(){
            
            return vesselRestService.getConfig();
        };

        var configForAudit = function (){
            return;
        };

        return{
            getConfigForVessel: configForVessel,
            getConfigForAudit: configForAudit
        };
    };

    angular.module('unionvmsWeb')
	.factory('configurationService',['vesselRestService', configurationService]);
    
}());
