/*
﻿Developed with the contribution of the European Commission - Directorate General for Maritime Affairs and Fisheries
© European Union, 2015-2016.

This file is part of the Integrated Fisheries Data Management (IFDM) Suite. The IFDM Suite is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as published by the
Free Software Foundation, either version 3 of the License, or any later version. The IFDM Suite is distributed in
the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. You should have received a
copy of the GNU General Public License along with the IFDM Suite. If not, see <http://www.gnu.org/licenses/>.
 */
//Service used for storing pending http requests and being able to cancel them
angular.module('unionvmsWeb').service('httpPendingRequestsService', function ($q) {
    var cancelPromises = [];
    //List of patterns (string) of request urls that never will be cancelled
    var skipList = [];
    function newTimeout() {
        var cancelPromise = $q.defer();
        cancelPromises.push(cancelPromise);
        return cancelPromise.promise;
    }

    function cancelAll() {
        angular.forEach(cancelPromises, function (cancelPromise) {
            cancelPromise.promise.isGloballyCancelled = true;
            cancelPromise.resolve();
        });
        cancelPromises.length = 0;
    }

    function setSkipList(newSkipList){
        skipList = newSkipList;
    }

    function getSkipList(){
        return skipList;
    }

    return {
        newTimeout: newTimeout,
        cancelAll: cancelAll,
        setSkipList: setSkipList,
        getSkipList: getSkipList
    };
});

//Request interceptor used to cancel old requests
angular.module('unionvmsWeb').factory('HttpRequestTimeoutInterceptor', function ($q, httpPendingRequestsService) {
    return {
        request: function (request) {
            request = request || {};

            //Skip if a skipList pattern was in the request URL
            var skipRequest = false;
            if(typeof request.url === 'string'){
                $.each(httpPendingRequestsService.getSkipList(), function(i, skipPattern){
                    if(new RegExp(skipPattern).test(request.url)){
                        skipRequest = true;
                        return false;
                    }
                });
            }

            //Skip if noCancelOnRouteChange is set on request
            skipRequest = skipRequest || request.timeout !== undefined || request.noCancelOnRouteChange;

            if(!skipRequest){
                request.timeout = httpPendingRequestsService.newTimeout();
            }

            return request;
        },

        responseError: function (response) {
            if(angular.isDefined(response.config) && angular.isDefined(response.config.timeout)){
                if (response.config.timeout.isGloballyCancelled) {
                    return $q.defer().promise;
                }
            }
            return $q.reject(response);
        }
    };
});