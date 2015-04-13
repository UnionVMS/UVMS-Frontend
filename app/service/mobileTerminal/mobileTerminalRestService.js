angular.module('unionvmsWeb')
    .factory('mobileTerminalRestFactory',function($resource, $q, restConstants) {

        var baseUrl = restConstants.baseUrl;
        return {
            getTranspondersConfig : function(){
                return $resource(baseUrl +'/mobileterminal-rest/mobileTerminal/config/transponders');
            },
            mobileTerminal : function(){
                return $resource(baseUrl +'/mobileterminal-rest/mobileTerminal/');
            },
            getMobileTerminals : function(){
                return $resource(baseUrl +'/mobileterminal-rest/mobileTerminal/list/',{},{list : { method: 'POST'}
                });
            }
        };
    })
    .service('mobileTerminalRestService',function($q, mobileTerminalRestFactory, MobileTerminal, MobileTerminalListPage){

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

            getMobileTerminalList : function(getListRequest){
                var deferred = $q.defer();
                mobileTerminalRestFactory.getMobileTerminals().list(getListRequest.toJsonforMobile(), function(response){
                    console.log("SUCCESS");
                    console.log(response);
                /*
                        var mobileTerminals = [];
                        if(angular.isArray(response.data.mobileTerminal)){
                            for (var i = 0; i < response.data.mobileTerminal.length; i++){
                                mobileTerminals.push(MobileTerminal.fromJson(response.data.mobileTerminal[i]));
                            }
                            var currentPage = response.data.currentPage;
                            var totalNumberOfPages = response.data.totalNumberOfPages;
                            var mobileTerminalListPage = new MobileTerminalListPage(mobileTerminals, currentPage, totalNumberOfPages);
                            deferred.resolve(mobileTerminalListPage);
                        }*/

                        deferred.resolve(response.data);
                    },
                function(error){
                        console.log("ERROR GETTING MOBILETERMIALS");
                        console.log(error);
                        deferred.reject(error);
                    }
                );
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
            }
        };
        return mobileTerminalRestService;
    }
);
