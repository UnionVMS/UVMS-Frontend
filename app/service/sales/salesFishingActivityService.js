(function () {
    'use strict';

    angular
        .module('unionvmsWeb')
        .factory('salesFishingActivityService', salesFishingActivityService);

    function salesFishingActivityService(activityRestService) {

        var service = {
            findFishingActivity: findFishingActivity
        };

        return service;

        /////////////////////////////

        function findFishingActivity(activityType, tripId) {
            var payload = {
                searchCriteriaMap: {
                    ACTIVITY_TYPE: activityType,
                    TRIP_ID: tripId
                }, searchCriteriaMapMultipleValues: {
                    PURPOSE:["9","1","5","3"]
                }
            };

            return activityRestService.getActivityList(payload).then(function(result) {
                if (result && result.totalItemsCount && result.totalItemsCount > 0) {
                    return {
                        date: result.resultList[0].occurence,
                        port: result.resultList[0].port && result.resultList[0].port.length > 0 ? result.resultList[0].port[0] : ""
                    };
                } else {
                    return {
                        date: "-",
                        port: "-"
                    };
                }
            });
        }
    }
})();
