angular.module('unionvmsWeb')
    .factory('alarmRestFactory',function($resource) {

        return {
            alarm : function(){
                return $resource('/rules/rest/alarms', {}, {
                    update: {method: 'PUT'}
                });
            },
            getAlarms : function(){
                return $resource('/rules/rest/alarms/list/',{},{
                    list : { method: 'POST'}
                });
            },
            getAlarm: function() {
                return $resource('/rules/rest/alarms/:guid');
            },
            getOpenAlarmsCount: function() {
                return $resource('/rules/rest/alarms/countopen');
            },
            getTicket: function() {
                return $resource('/rules/rest/tickets/:guid');
            },
            getOpenTicketsCount: function() {
                return $resource('/rules/rest/tickets/countopen/:userName');
            },
            getTickets : function(){
                return $resource('/rules/rest/tickets/list/:userName',null,{
                    list : { method: 'POST'}
                });
            },
            ticketStatus : function() {
                return $resource('/rules/rest/tickets/status', {}, {
                    update: { method: 'PUT' }
                });
            },
            reprocessAlarms : function(){
                return $resource('/rules/rest/alarms/reprocess', {}, {
                    reprocess: {method: 'POST'}
                });
            },
            getAlarmStatusConfig : function(){
                return $resource('/rules/rest/config/alarmstatus');
            },
            getTicketStatusConfig : function(){
                return $resource('/rules/rest/config/ticketstatus');
            },
        };
    })
.factory('alarmRestService', function($q, $log, alarmRestFactory, Alarm, Ticket, SearchResultListPage, userService, vesselRestService){

    var updateAlarmStatus = function(alarm){
        //Set updatedBy to the current user
        alarm.setUpdatedBy(userService.getUserName());

        var deferred = $q.defer();
        alarmRestFactory.alarm().update(alarm.DTO(), function(response) {
            if(response.code !== 200){
                deferred.reject("Invalid response status");
                return;
            }
            deferred.resolve(Alarm.fromDTO(response.data));
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
        alarmRestFactory.getAlarms().list(getListRequest.DTOForAlarms(), function(response){
                if(parseInt(response.code) !== 200){
                    deferred.reject("Invalid response status");
                    return;
                }
                var alarms = [],
                    searchResultListPage;

                if(angular.isArray(response.data.alarms)) {
                    for (var i = 0; i < response.data.alarms.length; i++) {
                        alarms.push(Alarm.fromDTO(response.data.alarms[i]));
                    }
                }

                var currentPage = response.data.currentPage;
                var totalNumberOfPages = response.data.totalNumberOfPages;
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
        alarmRestFactory.reprocessAlarms().reprocess(alarmGuids, function(response) {
            if(response.code !== 200){
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
        alarmRestFactory.getTickets().list({userName : userService.getUserName()}, dto, function(response){
                if(parseInt(response.code) !== 200){
                    deferred.reject("Invalid response status");
                    return;
                }
                var tickets = [],
                    searchResultListPage;

                if(angular.isArray(response.data.tickets)) {
                    for (var i = 0; i < response.data.tickets.length; i++) {
                        tickets.push(Ticket.fromDTO(response.data.tickets[i]));
                    }
                }

                var currentPage = response.data.currentPage;
                var totalNumberOfPages = response.data.totalNumberOfPages;
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
        alarmRestFactory.ticketStatus().update(ticket.DTO(), function(response) {
            if(response.code !== 200){
                deferred.reject("Invalid response status");
                return;
            }
            deferred.resolve(Ticket.fromDTO(response.data));
        }, function(error) {
            $log.error("Error updating ticket status");
            $log.error(error);
            deferred.reject(error);
        });
        return deferred.promise;
    };

    var getAlarmReport = function(guid) {
        var deferred = $q.defer();
        alarmRestFactory.getAlarm().get({guid:guid}, function(response) {
            if (response.code !== 200) {
                deferred.reject("Invalid response status");
                return;
            }

            var alarmReport = Alarm.fromDTO(response.data);
            deferred.resolve(alarmReport);
        },
        function(error) {
            deferred.reject("Invalid getting alarm");
        });

        return deferred.promise;
    };

    var getTicket = function(guid) {
        var deferred = $q.defer();
        alarmRestFactory.getTicket().get({guid:guid}, function(response) {
            if (response.code !== 200) {
                deferred.reject("Invalid response status");
                return;
            }

            var ticket = Ticket.fromDTO(response.data);

            if(angular.isUndefined(ticket) || angular.isUndefined(ticket.vesselGuid)){
                return deferred.resolve(ticket);
            }

            //Get vessel
            vesselRestService.getVessel(ticket.vesselGuid).then(function(vessel) {
                ticket.vessel = vessel;
                deferred.resolve(ticket);
            }, function(error) {
                deferred.reject("Could not get vessel for ticket");
            });
        },
        function(error) {
            deferred.reject("Error getting ticket");
        });

        return deferred.promise;
    };

    var getCountFromResource = function(resource, queryData) {
        var deferred = $q.defer();
        resource.get(queryData, function(response) {
            if (response.code !== 200) {
                deferred.reject("Invalid response status");
                return;
            }

            deferred.resolve(response.data);
        },
        function(error) {
            deferred.reject("Error getting alarm or ticket count.");
        });
        return deferred.promise;
    };

    var getOpenTicketsCount = function(){
        return getCountFromResource(alarmRestFactory.getOpenTicketsCount(), {userName: userService.getUserName()});
    };

    var getOpenAlarmsCount = function(){
        return getCountFromResource(alarmRestFactory.getOpenAlarmsCount(), {});
    };

    var getConfigurationFromResource = function(resource){
        var deferred = $q.defer();
        resource.get({},
            function(response){
                if(response.code !== 200){
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

    var getAlarmStatusConfig = function(){
        return getConfigurationFromResource(alarmRestFactory.getAlarmStatusConfig());
    };

    var getTicketStatusConfig = function(){
        return getConfigurationFromResource(alarmRestFactory.getTicketStatusConfig());
    };

    return {
        updateAlarmStatus: updateAlarmStatus,
        getAlarmsList: getAlarmsList,
        getTicketsListForCurrentUser: getTicketsListForCurrentUser,
        updateTicketStatus: updateTicketStatus,
        reprocessAlarms: reprocessAlarms,
        getAlarmReport: getAlarmReport,
        getTicket: getTicket,
        getOpenTicketsCount: getOpenTicketsCount,
        getOpenAlarmsCount: getOpenAlarmsCount,
        getAlarmStatusConfig: getAlarmStatusConfig,
        getTicketStatusConfig: getTicketStatusConfig,
    };
});
