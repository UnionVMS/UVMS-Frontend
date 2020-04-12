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
angular.module('unionvmsWeb').factory('openAlarmsAndTicketsService',function($log, $rootScope, userService, alarmRestService, longPolling) {

    var checkAccess = function(feature) {
        return userService.isAllowed(feature, 'Rules' ,true);
    };

    var alarmsLongPolling, ticketsLongPolling;

    //Keep count of the number of open alarms and tickets
    var numberOfOpenTicketsAndAlarms = {
        alarms  : 0,
        tickets : 0
    };

    //Get number of opened alarms and update numberOfOpenTicketsAndAlarms
    var updateAlarmsCount = function(){
        alarmRestService.getOpenAlarmsCount().then(function(count){
            numberOfOpenTicketsAndAlarms.alarms = count;
        }, function(err){
            $log.error("Error getting number of open alarms");
        });
    };

    //Get number of opened tickets and update numberOfOpenTicketsAndAlarms
    var updateTicketsCount = function(){
        alarmRestService.getOpenTicketsCount().then(function(count){
            numberOfOpenTicketsAndAlarms.tickets = count;
        }, function(err){
            $log.error("Error getting number of open tickets.");
        });
    };

    var init = function(){
        //Reset the numbers
        numberOfOpenTicketsAndAlarms.alarms = 0;
        numberOfOpenTicketsAndAlarms.tickets = 0;

        //Check that user has access to view alarms
        if(checkAccess('viewAlarmsHoldingTable')){
            //Get start value
            updateAlarmsCount();

            //Setup long polling
            alarmsLongPolling = longPolling.poll("/rules/activity/alarmcount", function(response) {
                if(response.updated){
                    //Get new value from REST service
                    updateAlarmsCount();
                }
            }, function(error){
                $log.error("Error in long polling for alarms count.");
            });
        }

        //Check that user has access to view tickets
        if(checkAccess('manageAlarmsOpenTickets')){
            //Get start value
            updateTicketsCount();

            ticketsLongPolling = longPolling.poll("/rules/activity/ticketcount", function(response) {
                if(response.updated){
                    //Get new value from REST service
                    updateTicketsCount();
                }
            }, function(error){
                $log.error("Error in long polling for tickets count.");
            });
        }
    };

	var openAlarmsAndTicketsService = {
        getCount : function(){
            return numberOfOpenTicketsAndAlarms;
        },
        restart : function(){
            longPolling.cancel(ticketsLongPolling);
            longPolling.cancel(alarmsLongPolling);
            init();
        },
        getUpdatedCounts : function(){
            updateAlarmsCount();
            updateTicketsCount();
        }
    };

    init();
	return openAlarmsAndTicketsService;
});