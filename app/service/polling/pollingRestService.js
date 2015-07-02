angular.module('unionvmsWeb')
    .factory('pollingRestFactory',function($resource, $q, restConstants) {

        var baseUrl = restConstants.baseUrl;
        return {
            getRunningProgramPolls : function() {
                return $resource(baseUrl +'/mobileterminal/rest/poll/running');
            },
            getPolls : function(){
                return $resource(baseUrl +'/mobileterminal/rest/poll/list/',{},{
                    list : { method: 'POST'}
                });
            },
            startProgramPoll : function() {
                return $resource(baseUrl +'/mobileterminal/rest/poll/start/:id', {}, {
                    save: {method: 'PUT'}
                });
            },
            stopProgramPoll : function() {
                return $resource(baseUrl +'/mobileterminal/rest/poll/stop/:id', {}, {
                    save: {method: 'PUT'}
                });
            },
            inactivateProgramPoll : function() {
                return $resource(baseUrl +'/mobileterminal/rest/poll/inactivate/:id', {}, {
                    save: {method: 'PUT'}
                });
            },
            createPolls: function() {
                return $resource(baseUrl + '/mobileterminal/rest/poll');
            },
            getPollableTerminals : function(){
                return $resource(baseUrl + '/mobileterminal/rest/poll/pollable',{},{
                     list : { method: 'POST'}
                });
            }
        };
    })
    .service('pollingRestService',function($q, pollingRestFactory, Poll, PollChannel, PollListPage, SearchResultListPage, vesselRestService, GetListRequest){

        var setProgramPollStatusSuccess = function(response, deferred){
            if(response.code !== 200){
                deferred.reject("Invalid response status");
                return;
            }

            var updatedProgramPoll = Poll.fromAttributeList(response.data.value);
            deferred.resolve(updatedProgramPoll);
        };

        var updatePollChannelsWithVesselDetails = function(pollChannels) {
            var request = new GetListRequest(1, pollChannels.length, false, []);
            for (var i = 0; i < pollChannels.length; i++) {
                if (pollChannels[i].connectId) {
                    request.addSearchCriteria("GUID", pollChannels[i].connectId);
                }
            }

            var deferred = $q.defer();
            if(request.getNumberOfSearchCriterias() === 0){
                deferred.resolve(pollChannels);
            }

            vesselRestService.getVesselList(request).then(function(page) {
                for (var i = 0; i < pollChannels.length; i++) {
                    var pollChannel = pollChannels[i];
                    var vessel = page.getVesselByGuid(pollChannel.connectId);
                    if (vessel) {
                        pollChannel.vesselName = vessel.name;
                        pollChannel.vesselIrcs = vessel.ircs;
                    }
                }

                deferred.resolve(pollChannels);
            },
            function(error) {
                deferred.reject(error);
            });

            return deferred.promise;
        };

        var pollingRestService = {

            getRunningProgramPolls : function(){
                var deferred = $q.defer();
                pollingRestFactory.getRunningProgramPolls().get({
                }, function(response) {
                    if(response.code !== 200){
                        deferred.reject("Invalid response status");
                        return;
                    }
                    var programPolls = [];

                    //Create a list of Poll objects from the response
                    if(angular.isArray(response.data)) {
                        for (var i = 0; i < response.data.length; i++) {
                            programPolls.push(Poll.fromAttributeList(response.data[i].value));
                        }
                    }

                    var request = new GetListRequest(1, programPolls.length, false, []);
                    for (var j = 0; j < programPolls.length; j++) {
                        if (programPolls[j].connectionId) {
                            request.addSearchCriteria("GUID", programPolls[j].connectionId);
                        }
                    }

                    vesselRestService.getVesselList(request).then(function(page) {
                        for (var i = 0; i < programPolls.length; i++) {
                            var programPoll = programPolls[i];
                            if (programPoll.connectionId) {
                                var vessel = page.getVesselByGuid(programPoll.connectionId);
                                programPoll.setVesselName(vessel.name);
                            }
                        }

                        deferred.resolve(programPolls);
                    },
                    function() {
                        deferred.resolve(programPolls);
                    });
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
            getPollList : function(getListRequest){
                var deferred = $q.defer();
                //Get list of polls
                pollingRestFactory.getPolls().list(getListRequest.DTOForPoll(), function(response){
                        if(response.code !== 200){
                            deferred.reject("Invalid response status");
                            return;
                        }
                        var polls = [],
                            pollListPage;

                        //Create a ListPage object from the response
                        if(angular.isArray(response.data.poll)) {
                            for (var i = 0; i < response.data.poll.length; i++) {
                                polls.push(Poll.fromAttributeList(response.data[i].value));
                            }
                        }
                        var currentPage = response.data.currentPage;
                        var totalNumberOfPages = response.data.totalNumberOfPages;
                        pollListPage = new PollListPage(polls, currentPage, totalNumberOfPages);
                    
                        deferred.resolve(pollListPage);
                    },
                function(error) {
                    console.error("Error getting polls");
                    console.error(error);
                    deferred.reject(error);
                });
                return deferred.promise;
            },
            getPollablesMobileTerminal : function(getPollableListRequest){
                var deferred = $q.defer();
                pollingRestFactory.getPollableTerminals().list(getPollableListRequest.DTOForPollable(),function(response) {
                    if (response.code !== 200) {
                        deferred.reject("Invalid response status");
                        return;
                    }
                    var pollables = [];
                    //Create a ListPage object from the response
                    if (angular.isArray(response.data.pollableChannels)) {
                        for (var i = 0; i < response.data.pollableChannels.length; i++) {
                            pollables.push(PollChannel.fromJson(response.data.pollableChannels[i]));
                        }
                    }

                    var resolveChannels = function(channels) {
                        var currentPage = response.data.currentPage;
                        var totalNumberOfPages = response.data.totalNumberOfPages;
                        var searchResultListPage = new SearchResultListPage(channels, currentPage, totalNumberOfPages);
                        deferred.resolve(searchResultListPage);
                    };

                    updatePollChannelsWithVesselDetails(pollables).then(function(pollablesWithVesselDetails) {
                        resolveChannels(pollablesWithVesselDetails);
                    },
                    function(error) {
                        resolveChannels(pollables);
                    });
                },
                function(error) {
                    console.error("Error");
                    deferred.reject(error);
                });

                return deferred.promise;
            },
            createPolls: function(polls) {
                var deferred = $q.defer();
                pollingRestFactory.createPolls().save(polls, function(response) {
                    if (response.code !== 200) {
                        deferred.reject("Invalid response status");
                        return;
                    }

                    deferred.resolve(response.data.map(function(attrs) {
                        return Poll.fromAttributeList(attrs.value);
                    }));
                },
                function(error) {
                    console.error("Could not add new polls: " + error);
                    deferred.reject(error);
                });

                return deferred.promise;
            }
        };
        return pollingRestService;
    }
);
