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
    .service('microMovementServerSideEventsService', function($rootScope, $localStorage){
        var subscribed = false;
        var subscribe = function() {
            subscribed = true;
            if (!!window.EventSourcePolyfill) {
                var eventSourceInitDict = {headers: {'Authorization': $localStorage.token}};

                // subscribe to sse
                let source = new window.EventSourcePolyfill('http://livm73p/unionvms/movement/rest/sse/subscribe', eventSourceInitDict);

                source.addEventListener("open",  function(e) {
                    // Connection was opened.
                    console.log('connection open');
                });
                source.addEventListener("message",  function(e) {
                    console.log(e.data);
                });
                source.addEventListener("error", function(e) {
                    if (e.readyState === EventSource.CLOSED) {
                        // Connection was closed.
                        console.error('connection closed due to error.');
                    }
                    console.error('error:', e);
                });

                source.addEventListener('Movement', function (e) {
                    $rootScope.$broadcast('event:micromovement', e.data);
                    //console.log('broadcasting:', e.data);
                });

            } else {
                console.error('Could not fetch server side events.');
            }
        };

        var hasSubscribed = function () {
            return subscribed;
        };

        return {
            subscribe: subscribe,
            hasSubscribed : hasSubscribed
        };
    });
