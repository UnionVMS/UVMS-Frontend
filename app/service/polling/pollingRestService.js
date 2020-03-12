/*
Developed with the contribution of the European Commission - Directorate General for Maritime Affairs and Fisheries
© European Union, 2015-2016.

This file is part of the Integrated Fisheries Data Management (IFDM) Suite. The IFDM Suite is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as published by the
Free Software Foundation, either version 3 of the License, or any later version. The IFDM Suite is distributed in
the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. You should have received a
copy of the GNU General Public License along with the IFDM Suite. If not, see <http://www.gnu.org/licenses/>.
 */
angular.module('unionvmsWeb')
    .factory('pollingRestFactory',function($resource) {

        return {
            getRunningProgramPolls : function() {
                return $resource('asset/rest/poll/running');
            },
            getPolls : function(){
                return $resource('asset/rest/poll/list/',{},{
                    list : { method: 'POST'}
                });
            },
            startProgramPoll : function() {
                return $resource('asset/rest/poll/start/:id', {}, {
                    save: {method: 'PUT'}
                });
            },
            stopProgramPoll : function() {
                return $resource('asset/rest/poll/stop/:id', {}, {
                    save: {method: 'PUT'}
                });
            },
            inactivateProgramPoll : function() {
                return $resource('asset/rest/poll/inactivate/:id', {}, {
                    save: {method: 'PUT'}
                });
            },
            createPolls: function() {
                return $resource('asset/rest/poll');
            },
            getPollableTerminals : function(){
                return $resource('asset/rest/poll/getPollable',{},{
                     list : { method: 'POST'}
                });
            }
        };
    })
    .service('pollingRestService',function($q, pollingRestFactory, Poll, PollingLog, PollResult, PollChannel, SearchResultListPage, vesselRestService, GetListRequest){

        var setProgramPollStatusSuccess = function(response, status, deferred){
            if(status !== 200){
                deferred.reject("Invalid response status");
                return;
            }

            var updatedProgramPoll = Poll.fromAttributeList(response.values);
            deferred.resolve(updatedProgramPoll);
        };

        var updatePollChannelsWithVesselDetails = function(pollChannels) {
            var deferred = $q.defer();
            if(pollChannels.length > 0){
                var request = new GetListRequest(1, pollChannels.length, false, []);
                for (var i = 0; i < pollChannels.length; i++) {
                    if (pollChannels[i].connectId) {
                        request.addSearchCriteria("GUID", pollChannels[i].connectId);
                    }
                }

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
            }else{
                deferred.resolve(pollChannels);
            }

            return deferred.promise;
        };

        var pollingRestService = {

            getRunningProgramPolls : function(){
                var deferred = $q.defer();
                pollingRestFactory.getRunningProgramPolls().query({
                }, function(response, header, status) {
                    if(status !== 200){
                        deferred.reject("Invalid response status");
                        return;
                    }
                    var programPolls = [];

                    //Create a list of Poll objects from the response
                    if(angular.isArray(response)) {
                        for (var i = 0; i < response.length; i++) {
                            programPolls.push(Poll.fromAttributeList(response[i].values));
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
                                if (vessel) {
                                    programPoll.setVessel(vessel);
                                }
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
                pollingRestFactory.startProgramPoll().get({id: programPoll.id}, {}, function(response, header, status) {
                    setProgramPollStatusSuccess(response, status, deferred);
                }, function(error) {
                    console.error("Error starting program poll.");
                    deferred.reject(error);
                });
                return deferred.promise;
            },
            stopProgramPoll : function(programPoll){
                var deferred = $q.defer();
                pollingRestFactory.stopProgramPoll().get({id: programPoll.id}, {}, function(response, header, status) {
                    setProgramPollStatusSuccess(response, status, deferred);
                }, function(error) {
                    console.error("Error stopping program poll.");
                    deferred.reject(error);
                });
                return deferred.promise;
            },
            inactivateProgramPoll : function(programPoll){
                var deferred = $q.defer();
                pollingRestFactory.inactivateProgramPoll().get({id: programPoll.id}, {}, function(response, header, status) {
                    setProgramPollStatusSuccess(response, status, deferred);
                }, function(error) {
                    console.error("Error inactivating program poll.");
                    deferred.reject(error);
                });
                return deferred.promise;
            },
            getPollList : function(getListRequest){
                var deferred = $q.defer();
                //Get list of polls
                pollingRestFactory.getPolls().list(getListRequest.DTOForPoll(), function(response, header, status){
                        if(status !== 200){
                            deferred.reject("Invalid response status");
                            return;
                        }

                        var pollingLogs = [],
                            searchResultListPage;

                        //Create a ListPage object from the response
                        if(angular.isArray(response.pollableChannels)) {
                            for (var i = 0; i < response.pollableChannels.length; i++) {
                                var pollingLog = new PollingLog();
                                pollingLog.poll = Poll.fromAttributeList(response.pollableChannels[i].poll.values);
                                pollingLogs.push(pollingLog);
                            }
                        }
                        var currentPage = response.currentPage;
                        var totalNumberOfPages = response.totalNumberOfPages;
                        searchResultListPage = new SearchResultListPage(pollingLogs, currentPage, totalNumberOfPages);

                        deferred.resolve(searchResultListPage);
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
                pollingRestFactory.getPollableTerminals().list(getPollableListRequest.DTOForPollable(),function(response, header, status) {
                    if (status !== 200) {
                        deferred.reject("Invalid response status");
                        return;
                    }
                    var pollables = [];
                    //Create a ListPage object from the response
                    if (angular.isArray(response.pollableChannels)) {
                        for (var i = 0; i < response.pollableChannels.length; i++) {
                            pollables.push(PollChannel.fromJson(response.pollableChannels[i]));
                        }
                    }

                    var resolveChannels = function(channels) {
                        var currentPage = response.currentPage;
                        var totalNumberOfPages = response.totalNumberOfPages;
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
                pollingRestFactory.createPolls().save(polls, function(response, header, status) {
                    if (status !== 200) {
                        deferred.reject("Invalid response status");
                        return;
                    }

                    deferred.resolve(PollResult.fromDTO(response));
                },
                function(error) {
                    console.error("Could not create new polls.", error);
                    deferred.reject(error);
                });

                return deferred.promise;
            }
        };
        return pollingRestService;
    }
);
