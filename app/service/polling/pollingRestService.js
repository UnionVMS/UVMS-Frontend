angular.module('unionvmsWeb')
    .factory('pollingRestFactory',function($resource, $q, restConstants) {

        var baseUrl = restConstants.baseUrl;
        return {
            getRunningProgramPolls : function(){
                return $resource(baseUrl +'/mobileterminal/rest/poll/running');
            },
            startProgramPoll : function(){
                return $resource(baseUrl +'/mobileterminal/rest/poll/start/:id', {}, {
                    save: {method: 'PUT'}                    
                });
            },
            stopProgramPoll : function(){
                return $resource(baseUrl +'/mobileterminal/rest/poll/stop/:id', {}, {
                    save: {method: 'PUT'}                    
                });
            },
            inactivateProgramPoll : function(){
                return $resource(baseUrl +'/mobileterminal/rest/poll/inactivate/:id', {}, {
                    save: {method: 'PUT'}                    
                });
            },                        
        };
    })
    .service('pollingRestService',function($q, pollingRestFactory, Poll){

        var setProgramPollStatusSuccess = function(response, deferred){
            if(response.code !== "200"){
                deferred.reject("Invalid response status");
                return;
            }                    
            var updatedProgramPoll = Poll.fromJson(response.data);
            deferred.resolve(updatedProgramPoll);
        };

        var pollingRestService = {

            getRunningProgramPolls : function(){
                var deferred = $q.defer();
                pollingRestFactory.getRunningProgramPolls().get({
                }, function(response) {
                    if(response.code !== "200"){
                        deferred.reject("Invalid response status");
                        return;
                    }                    
                    var programPolls = [];

                    //Create a list of Poll objects from the response
                    if(angular.isArray(response.data)) {
                        for (var i = 0; i < response.data.length; i++) {
                            programPolls.push(Poll.fromJson(response.data[i]));
                        }
                    }
                    deferred.resolve(programPolls);
                }, function(error) {
                    console.error("Error getting running program polls");
                    deferred.reject(error);
                });
                return deferred.promise;
            },
            startProgramPoll : function(programPoll){
                var deferred = $q.defer();
                pollingRestFactory.startProgramPoll().save({id: programPoll.id}, {}, function(response) {
                    setProgramPollStatusSuccess(response, deferred);
                }, function(error) {
                    console.error("Error starting program poll.");
                    deferred.reject(error);
                });
                return deferred.promise;
            },
            stopProgramPoll : function(programPoll){
                var deferred = $q.defer();
                pollingRestFactory.stopProgramPoll().save({id: programPoll.id}, {}, function(response) {
                    setProgramPollStatusSuccess(response, deferred);
                }, function(error) {
                    console.error("Error stopping program poll.");
                    deferred.reject(error);
                });
                return deferred.promise;
            },
            inactivateProgramPoll : function(programPoll){
                var deferred = $q.defer();
                pollingRestFactory.inactivateProgramPoll().save({id: programPoll.id}, {}, function(response) {
                    setProgramPollStatusSuccess(response, deferred);
                }, function(error) {
                    console.error("Error inactivating program poll.");
                    deferred.reject(error);
                });
                return deferred.promise;
            },                   
        };
        return pollingRestService;
    }
);
