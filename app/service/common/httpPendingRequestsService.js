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