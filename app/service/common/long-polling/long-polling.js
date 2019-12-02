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
                    // Call back with entire response
                    callback(response);
                }
                else if (angular.isObject(callback)) {
                    // Call back to individual functions

                    if (angular.isFunction(callback.onCreate) && angular.isDefined(response.created)) {
                        // Call onCreate with 'created' part of response
                        callback.onCreate(response.created);
                    }

                    if (angular.isFunction(callback.onUpdate) && angular.isDefined(response.updated)) {
                        // Call onUpdate(...) with 'updated' part of response
                        callback.onUpdate(response.updated);
                    }
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