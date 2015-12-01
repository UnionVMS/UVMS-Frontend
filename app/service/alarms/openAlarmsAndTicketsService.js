angular.module('unionvmsWeb').factory('openAlarmsAndTicketsService',function($log, $rootScope, userService, alarmRestService, longPolling) {

    var checkAccess = function(feature) {
        return userService.isAllowed(feature, 'Rules' ,true);
    };

    //Keep count of the number of open alarms and tickets
    var numberOfOpenTicketsAndAlarms = {
        alarms  : 0,
        tickets : 0
    };

    var init = function(){
        //Reset the numbers
        numberOfOpenTicketsAndAlarms.alarms = 0;
        numberOfOpenTicketsAndAlarms.tickets = 0;

        //Check that user has access to view alarms
        if(checkAccess('viewAlarmsHoldingTable')){
            //Get start value
            alarmRestService.getOpenAlarmsCount().then(function(count){
                numberOfOpenTicketsAndAlarms.alarms = count;
            }, function(err){
                $log.error("Error getting number of open alarms");
            });

            //Setup long polling
            longPolling.poll("/rules/activity/alarmcount", function(response) {
                if(angular.isDefined(response.count)){
                    numberOfOpenTicketsAndAlarms.alarms = response.count;
                }
            }, function(error){
                $log.error("Error in long polling for alarms count.");
            });
        }

        //Check that user has access to view tickets
        if(checkAccess('manageAlarmsOpenTickets')){
            //Get start value
            alarmRestService.getOpenTicketsCount().then(function(count){
                numberOfOpenTicketsAndAlarms.tickets = count;
            }, function(err){
                $log.error("Error getting number of open tickets.");
            });

            longPolling.poll("/rules/activity/ticketcount", function(response) {
                if(angular.isDefined(response.count)){
                    numberOfOpenTicketsAndAlarms.tickets = response.count;
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
            init();
        }
    };

    init();
	return openAlarmsAndTicketsService;
});