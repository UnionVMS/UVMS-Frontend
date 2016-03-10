(function() {
    'use strict';

    angular
        .module('unionvmsWeb.longPolling', ['ngResource'])
        .factory('longPolling', LongPolling);

    LongPolling.$inject = ['$resource', '$log', '$filter', 'globalSettingsService'];

    function LongPolling($resource, $log, $filter, globalSettingsService) {
        var runningLongPollingIds = [];
        var nextLongPollingId = 0;

        var service = {
            cancel: cancel,
            poll: poll,
            cancelAll: cancelAll
        };

        return service;

        function isEnabled() {
            return globalSettingsService.get("longPollingEnabled") === 'true';
        }

        //Start a long polling request and keep polling until cancelled
        function poll(path, callback, error) {
            if (!isEnabled()) {
                return;
            }

            var longPollingId = nextLongPollingId++;
            runningLongPollingIds.push(longPollingId);
            $resource(path).get(function(response) {
                log('Long-polling completed with path ' + path + ', id = ' + longPollingId);
                callback(response);

                //Keep the longPolling running unless it has been cancelled
                var index = runningLongPollingIds.indexOf(longPollingId);
                if(index >= 0){
                    runningLongPollingIds.splice(index, 1);
                    poll(path, callback, error);
                }

                logSessions();
            }, function(error) {
                log('Long-polling failed with path ' + path + ', id = ' + longPollingId);
                if (angular.isFunction(error)) {
                    error(error);
                }

                logSessions();
            });

            log('Long-polling request sent with path ' + path + ', id = ' + longPollingId);
            logSessions();
            return longPollingId;
        }

        //Cancel a long polling (meaning no more requests will be sent when the current one is finished)
        function cancel(id){
            if(angular.isDefined(id)){
                var index = runningLongPollingIds.indexOf(id);
                if(index >= 0){
                    log('Long-polling canceled with id = ' + id);
                    runningLongPollingIds.splice(index, 1);
                    logSessions();
                }
            }
        }

        function cancelAll() {
            while (runningLongPollingIds.length > 0) {
                cancel(runningLongPollingIds[0]);
            }
        }

        function logSessions() {
            log('Long-polling running ' + runningLongPollingIds.length + ' sessions.');
        }

        function log(message) {
            var date = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');
            $log.debug(date + ' ' + message);
        }
    }
})();