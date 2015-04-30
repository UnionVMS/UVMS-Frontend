angular.module('unionvmsWeb')
    .factory('pollingRestFactory',function($resource, $q, restConstants) {

        var baseUrl = restConstants.baseUrl;
        return {
            getRunningProgramPolls : function(){
                return $resource(baseUrl +'/mobileterminal/rest/poll/running');
            },
            startProgramPoll : function(){
                return $resource(baseUrl +'/mobileterminal/rest/poll/start', {}, {
                    save: {method: 'POST'}                    
                });
            },
            stopProgramPoll : function(){
                return $resource(baseUrl +'/mobileterminal/rest/poll/stop', {}, {
                    save: {method: 'POST'}                    
                });
            },
            inactivateProgramPoll : function(){
                return $resource(baseUrl +'/mobileterminal/rest/poll/inactivate', {}, {
                    save: {method: 'POST'}                    
                });
            },                        
        };
    })
    .service('pollingRestService',function($q, pollingRestFactory, ProgramPoll){

        var setProgramPollStatusSuccess = function(response, deferred){
            if(response.code !== "200"){
                deferred.reject("Invalid response status");
                return;
            }                    
            var updatedProgramPoll = ProgramPoll.fromJson(response.data);
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

                    //Create a list of ProgramPoll objects from the response
                    if(angular.isArray(response.data)) {
                        for (var i = 0; i < response.data.length; i++) {
                            programPolls.push(ProgramPoll.fromJson(response.data[i]));
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
                pollingRestFactory.startProgramPoll().save({}, programPoll.toJson(), function(response) {
                    setProgramPollStatusSuccess(response, deferred);
                }, function(error) {
                    console.error("Error starting program poll.");
                    deferred.reject(error);
                });
                return deferred.promise;
            },
            stopProgramPoll : function(programPoll){
                var deferred = $q.defer();
                pollingRestFactory.stopProgramPoll().save({}, programPoll.toJson(), function(response) {
                    setProgramPollStatusSuccess(response, deferred);
                }, function(error) {
                    console.error("Error stopping program poll.");
                    deferred.reject(error);
                });
                return deferred.promise;
            },
            inactivateProgramPoll : function(programPoll){
                var deferred = $q.defer();
                pollingRestFactory.inactivateProgramPoll().save({}, programPoll.toJson(), function(response) {
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
