(function() {
    'use strict';

    angular
        .module('unionvmsWeb.longPolling', ['ngResource'])
        .factory('longPolling', LongPolling);

    /* @ngInject */
    function LongPolling($resource, $log, $filter, globalSettingsService) {
        var runningLongPollingIds = [];
        var nextLongPollingId = 0;

        return {
            cancel: cancel,
            poll: poll,
            cancelAll: cancelAll
        };

        /* Start a long polling request and keep polling until cancelled */
        function poll(path, callback, error, sessionId) {
            if (!isLongPollingEnabled()) {
                return;
            }

            if (angular.isUndefined(sessionId)) {
                sessionId = nextLongPollingId++;
                runningLongPollingIds.push(sessionId);
            }

            $resource(path).get(function(response) {
                log('Long-polling completed with path ' + path + ', sessionId = ' + sessionId);
                if (angular.isFunction(callback)) {
                    callback(response);
                }

                //Keep the longPolling running unless it has been cancelled
                if(runningLongPollingIds.indexOf(sessionId) >= 0){
                    poll(path, callback, error, sessionId);
                }

            }, function(errorResponse) {
                log('Long-polling failed with path ' + path + ', sessionId = ' + sessionId);
                if (angular.isFunction(error)) {
                    error(errorResponse);
                }

                cancel(sessionId);
                logSessions();
            });

            log('Long-polling request sent with path ' + path + ', sessionId = ' + sessionId);
            logSessions();
            return sessionId;
        }

        //Cancel a long polling (meaning no more requests will be sent when the current one is finished)
        function cancel(sessionId){
            if(angular.isDefined(sessionId)){
                var index = runningLongPollingIds.indexOf(sessionId);
                if(index >= 0){
                    log('Long-polling canceled with sessionId = ' + sessionId);
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

        /* True iff property longPollingEnabled has string-value 'true' */
        function isLongPollingEnabled() {
            return globalSettingsService.get("longPollingEnabled") === 'true';
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