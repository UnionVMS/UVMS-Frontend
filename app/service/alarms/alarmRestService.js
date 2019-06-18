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
    .factory('alarmRestFactory',function($resource) {

        return {
            alarm : function(){
                return $resource('movement/rest/alarms', {}, {
                    update: {method: 'PUT'}
                });
            },
            getAlarms : function(){
                return $resource('movement/rest/alarms/list/',{},{
                    list : { method: 'POST'}
                });
            },
            getAlarm: function() {
                return $resource('movement/rest/alarms/:guid');
            },
            getOpenAlarmsCount: function() {
                return $resource('movement/rest/alarms/countopen', {} ,
                {
                	getText : {
                		transformResponse: function(data, header, status) {
                			return {content: data, code: status};
                		}
                	}
                });
            },
            getTicket: function() {
                return $resource('movement-rules/rest/tickets/:guid');
            },
            getOpenTicketsCount: function() {
                return $resource('movement-rules/rest/tickets/countopen/:userName', {} ,
                    {
                        getText : {
                            transformResponse: function(data, header, status) {
                                return {content: data, code: status};
                            }
                        }
                    });
            },
            getTickets : function(){
                return $resource('movement-rules/rest/tickets/list/:userName',null,{
                    list : { method: 'POST'}
                });
            },
            ticketStatus : function() {
                return $resource('movement-rules/rest/tickets/status', {}, {
                    update: { method: 'PUT' }
                });
            },
            ticketStatusQuery : function() {
                return $resource('movement-rules/rest/tickets/status/:userName/:status', {}, {
                    update: { method: 'POST' }
                });
            },
            reprocessAlarms : function(){
                return $resource('movement/rest/alarms/reprocess', {}, {
                    reprocess: {method: 'POST'}
                });
            },
            getAlarmStatusConfig : function(){
                return $resource('movement/rest/config/alarmstatus');
            },
            getTicketStatusConfig : function(){
                return $resource('movement-rules/rest/config/ticketstatus');
            },
            getSanityRuleNames : function() {
            	return $resource('movement/rest/alarms/sanityrules');
            },
        };
    })
.factory('alarmRestService', function($q, $log, alarmRestFactory, Alarm, Ticket, SearchResultListPage, userService, vesselRestService){

    var updateAlarmStatus = function(alarm){
        //Set updatedBy to the current user
        alarm.setUpdatedBy(userService.getUserName());

        var deferred = $q.defer();
        alarmRestFactory.alarm().update(alarm.DTO(), function(response, header, status) {
            if(status !== 200){
                deferred.reject("Invalid response status");
                return;
            }
            deferred.resolve(Alarm.fromDTO(response));
        }, function(error) {
            $log.error("Error updating alarm status");
            $log.error(error);
            deferred.reject(error);
        });
        return deferred.promise;
    };

    var getAlarmsList = function(getListRequest){
        var deferred = $q.defer();

        //Get list of all alarms
        alarmRestFactory.getAlarms().list(getListRequest.DTOForAlarms(), function(response, header, status){
                if(status !== 200){
                    deferred.reject("Invalid response status");
                    return;
                }
                var alarms = [],
                    searchResultListPage;

                if(angular.isArray(response.alarmList)) {
                    for (var i = 0; i < response.alarmList.length; i++) {
                        alarms.push(Alarm.fromDTO(response.alarmList[i]));
                    }
                }

                var currentPage = response.currentPage;
                var totalNumberOfPages = response.totalNumberOfPages;
                searchResultListPage = new SearchResultListPage(alarms, currentPage, totalNumberOfPages);

                deferred.resolve(searchResultListPage);
            },
            function(error) {
                $log.error("Error getting list of alarms");
                $log.error(error);
                deferred.reject(error);
            }
        );
        return deferred.promise;
    };

    var reprocessAlarms = function(alarmGuids){
        var deferred = $q.defer();
        alarmRestFactory.reprocessAlarms().reprocess(alarmGuids, function(response, header, status) {
            if(status !== 200){
                deferred.reject("Invalid response status");
                return;
            }
            deferred.resolve();
        }, function(error) {
            $log.error("Error reprocessing alarms");
            $log.error(error);
            deferred.reject(error);
        });
        return deferred.promise;
    };

    var getTicketsListForCurrentUser = function(getListRequest){
        var deferred = $q.defer();
        var dto = getListRequest.DTOForTickets();
        //Get list of all tickets
        alarmRestFactory.getTickets().list({userName : userService.getUserName()}, dto, function(response, header, status){
                if(status !== 200){
                    deferred.reject("Invalid response status");
                    return;
                }
                var tickets = [],
                    searchResultListPage;

                if(angular.isArray(response.tickets)) {
                    for (var i = 0; i < response.tickets.length; i++) {
                        tickets.push(Ticket.fromJSON(response.tickets[i]));
                    }
                }

                var currentPage = response.currentPage;
                var totalNumberOfPages = response.totalNumberOfPages;
                searchResultListPage = new SearchResultListPage(tickets, currentPage, totalNumberOfPages);

                deferred.resolve(searchResultListPage);
            },
            function(error) {
                $log.error("Error getting list of tickets");
                $log.error(error);
                deferred.reject(error);
            }
        );
        return deferred.promise;
    };

    var updateTicketStatus = function(ticket){
        //Set updatedBy to the current user
        ticket.setUpdatedBy(userService.getUserName());

        var deferred = $q.defer();
        alarmRestFactory.ticketStatus().update(ticket.DTO(), function(response, header, status) {
            if(status !== 200){
                deferred.reject("Invalid response status");
                return;
            }
            deferred.resolve(Ticket.fromJSON(response));
        }, function(error) {
            $log.error("Error updating ticket status");
            $log.error(error);
            deferred.reject(error);
        });
        return deferred.promise;
    };

    var updateTicketStatusQuery = function(tickets, status){
        var deferred = $q.defer();
        alarmRestFactory.ticketStatusQuery().update({userName: userService.getUserName(), status: status}, tickets, function(response, header, status) {
            if(status !== 200){
                deferred.reject("Invalid response status");
                return;
            }
            var tickets = [],
                searchResultListPage;

            if(angular.isArray(response)) {
                for (var i = 0; i < response.length; i++) {
                    tickets.push(Ticket.fromJSON(response[i]));
                }
            }

            deferred.resolve(tickets);
        }, function(error) {
            $log.error("Error updating ticket status");
            $log.error(error);
            deferred.reject(error);
        });
        return deferred.promise;
    };

    var getAlarmReport = function(guid) {
        var deferred = $q.defer();
        alarmRestFactory.getAlarm().get({guid:guid}, function(response, header, status) {
            if (status !== 200) {
                deferred.reject("Invalid response status");
                return;
            }

            var alarmReport = Alarm.fromDTO(response);
            deferred.resolve(alarmReport);
        },
        function(error) {
            deferred.reject("Invalid getting alarm");
        });

        return deferred.promise;
    };

    var getTicket = function(guid) {
        var deferred = $q.defer();
        alarmRestFactory.getTicket().get({guid:guid}, function(response, header, status) {
            if (status !== 200) {
                deferred.reject("Invalid response status");
                return;
            }

            var ticket = Ticket.fromJSON(response);

            if(angular.isUndefined(ticket) || angular.isUndefined(ticket.vesselGuid)){
                return deferred.resolve(ticket);
            }

            //Get vessel
            vesselRestService.getVessel(ticket.vesselGuid).then(function(vessel) {
                ticket.vessel = vessel;
                deferred.resolve(ticket);
            }, function(error) {
                //deferred.reject("Could not get vessel for ticket");
                deferred.resolve(ticket);
            });
        },
        function(error) {
            deferred.reject("Error getting ticket");
        });

        return deferred.promise;
    };
    
    var getOpenTicketsCount = function(){
        var deferred = $q.defer();
        alarmRestFactory.getOpenTicketsCount().getText({userName: userService.getUserName()}, function(response) {
                if (response.code !== 200) {
                    deferred.reject("Invalid response status");
                    return;
                }
                deferred.resolve(parseInt(response.content));
            },
            function(error) {
                deferred.reject("Error getting alarm count.");
            });
        return deferred.promise;
    };

    var getOpenAlarmsCount = function(){
        var deferred = $q.defer();
        alarmRestFactory.getOpenAlarmsCount().getText({}, function(response) {
            if (response.code !== 200) {
                deferred.reject("Invalid response status");
                return;
            }
            deferred.resolve(parseInt(response.content));
        },
        function(error) {
            deferred.reject("Error getting alarm count.");
        });
        return deferred.promise;
    };

    var getConfigurationFromResource = function(resource, validCode){
        var deferred = $q.defer();
        resource.get({},
            function(response){
                if(response.code !== validCode){
                    deferred.reject("Not valid alarm/ticket statuses configuration status.");
                    return;
                }
                deferred.resolve(response.data);
            }, function(error){
                console.error("Error getting configuration for alarm/ticket statuses.");
                deferred.reject(error);
            });
        return deferred.promise;
    };

    var getTicketStatusConfigFromResource = function(resource){
        var deferred = $q.defer();
        resource.query({},
            function(response, header, status){
                if(status !== 200){
                    deferred.reject("Not valid alarm/ticket statuses configuration status.");
                    return;
                }

                deferred.resolve(response);
            }, function(error){
                console.error("Error getting configuration for alarm/ticket statuses.");
                deferred.reject(error);
            });
        return deferred.promise;
    };

    var getAlarmStatusConfig = function(){
        return getConfigurationFromResource(alarmRestFactory.getAlarmStatusConfig(), '200');
    };

    var getTicketStatusConfig = function(){
        return getTicketStatusConfigFromResource(alarmRestFactory.getTicketStatusConfig());
    };
    
    var getSanityRuleNames = function() {
    	var deferred = $q.defer();
    	alarmRestFactory.getSanityRuleNames().query({},
            function(response, header, status){
                if(status !== 200){
                    deferred.reject("No valid sanityrule names return status.");
                    return;
                }
                deferred.resolve(response);
            }, function(error){
                console.error("Error getting sanityrule names.");
                deferred.reject(error);
            });
        return deferred.promise;
    };

    return {
        updateAlarmStatus: updateAlarmStatus,
        getAlarmsList: getAlarmsList,
        getTicketsListForCurrentUser: getTicketsListForCurrentUser,
        updateTicketStatus: updateTicketStatus,
        updateTicketStatusQuery: updateTicketStatusQuery,
        reprocessAlarms: reprocessAlarms,
        getAlarmReport: getAlarmReport,
        getTicket: getTicket,
        getOpenTicketsCount: getOpenTicketsCount,
        getOpenAlarmsCount: getOpenAlarmsCount,
        getAlarmStatusConfig: getAlarmStatusConfig,
        getTicketStatusConfig: getTicketStatusConfig,
        getSanityRuleNames : getSanityRuleNames,
    };
});
