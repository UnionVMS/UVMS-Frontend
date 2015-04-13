angular.module('unionvmsWeb')
    .factory('mobileTerminalRestFactory',function($resource, restConstants) {

        var baseUrl = restConstants.baseUrl;
        return {
            getTranspondersConfig : function(){
                return $resource(baseUrl +'/mobileterminal-rest/mobileTerminal/config/transponders');
            },        
            getMobileTerminals : function(){
                return $resource(baseUrl+ '/unionvms-api/sec/active/:mobileterminal');
            },
            getMobileTerminalsWithoutVessels : function(){
                return $resource(baseUrl +'/mobileterminal-rest/mobile/list');
            },
            mobileTerminal : function(){
                return $resource(baseUrl +'/mobileterminal-rest/mobileTerminal/');
            },            
        };
    })
    .service('mobileTerminalRestService',function($q, mobileTerminalRestFactory, MobileTerminal){

        var mobileTerminalRestService = {

            getTranspondersConfig : function(){
                var deferred = $q.defer();
                mobileTerminalRestFactory.getTranspondersConfig().get({
                }, function(response) {
                    console.log("Got config!");
                    console.log(response);
                    //TODO: Parse response
                    deferred.resolve(response.data);
                }, function(error) {
                    console.error("Error getting transponders config.");
                    console.error(error);
                    deferred.reject(error);
                });
                return deferred.promise;
            },

            createNewMobileTerminal : function(mobileTerminal){
                console.log("create new mobile terminal!");
                console.log(mobileTerminal.toJson());
                var deferred = $q.defer();
                mobileTerminalRestFactory.mobileTerminal().save(mobileTerminal.toJson(), function(response) {
                    console.log("Create response!");
                    console.log(response);
                    //TODO: Parse response
                    deferred.resolve(response.data);
                }, function(error) {
                    console.error("Error creating mobile terminal.");
                    console.error(error);
                    deferred.reject(error);
                });
                return deferred.promise;                
            },
        };

        return mobileTerminalRestService;
        /*mobileTerminalRestFactory.getMobileTerminalsWithoutVessels().get("",
            function (success) {
                var mobileTerminals = [];
                for (var i = 0; i < success.response.length; i ++) {
                    mobileTerminals.push(new MobileTerminal(success.response[i]));
                }
            },
            function (error) {
            console.log('Unable to get mobile terminals ' + error);
        });*/

    }
);
