angular.module('unionvmsWeb')
    .factory('pollingRestFactory',function($resource, $q, restConstants) {

        var baseUrl = restConstants.baseUrl;
        return {
            getRunningProgramPolls : function(){
                return $resource(baseUrl +'/mobileterminal/rest/poll/running');
            }          
        };
    })
    .service('pollingRestService',function($q, pollingRestFactory, ProgramPoll){

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
        };
        return pollingRestService;
    }
);
