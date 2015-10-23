angular.module('unionvmsWeb')
    .factory('alarmRestFactory',function($resource) {

        return {
            getAlarms : function(){
                return $resource('/rules/rest/alarms/list/',{},{
                    list : { method: 'POST'}
                });
            },
            getTickets : function(){
                return $resource('/rules/rest/tickets/list/',{},{
                    list : { method: 'POST'}
                });
            },
            ticket : function(){
                return $resource('/rules/rest/tickets', {}, {
                    update: {method: 'PUT'}
                });
            },
        };
    })
.factory('alarmRestService', function($q, $log, alarmRestFactory, Alarm, Ticket, SearchResultListPage, userService){

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


    var getTicketsList = function(getListRequest){
        var deferred = $q.defer();

        //Get list of all tickets
        alarmRestFactory.getTickets().list(getListRequest.DTOForTickets(), function(response){
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
        //Set resolveBy to the current user
        ticket.setResolvedBy(userService.getUserName());

        var deferred = $q.defer();
        alarmRestFactory.ticket().update(ticket.DTO(), function(response) {
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

    return {
        getAlarmsList: getAlarmsList,
        getTicketsList: getTicketsList,
        updateTicketStatus: updateTicketStatus,
    };
});
