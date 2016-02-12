(function() {
    'use strict';

    angular
        .module('unionvmsWeb.longPolling', ['ngResource'])
        .factory('longPolling', LongPolling);

    LongPolling.$inject = ['$resource'];

    function LongPolling($resource) {
        var runningLongPollingIds = [];
        var nextLongPollingId = 0;

        var service = {
            cancel: cancel,
            poll: poll
        };

        return service;

        //Start a long polling request and keep polling until cancelled
        function poll(path, callback, error) {
            var longPollingId = nextLongPollingId++;
            runningLongPollingIds.push(longPollingId);
            $resource(path).get(function(response) {
                callback(response);

                //Keep the longPolling running unless it has been cancelled
                var index = runningLongPollingIds.indexOf(longPollingId);
                if(index >= 0){
                    runningLongPollingIds.splice(index, 1);
                    poll(path, callback, error);
                }
            }, function(error) {
                if (angular.isFunction(error)) {
                    error(error);
                }
            });
            return longPollingId;
        }

        //Cancel a long polling (meaning no more requests will be sent when the current one is finished)
        function cancel(id){
            if(angular.isDefined(id)){
                var index = runningLongPollingIds.indexOf(id);
                if(index >= 0){
                    runningLongPollingIds.splice(index, 1);
                }
            }
        }
    }
})();