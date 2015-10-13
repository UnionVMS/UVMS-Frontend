//Service used for storing pending http requests and being able to cancel them
angular.module('unionvmsWeb').service('httpPendingRequestsService', function ($q) {
    var cancelPromises = [];

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

    return {
        newTimeout: newTimeout,
        cancelAll: cancelAll
    };
});

//Request interceptor used to cancel old requests
angular.module('unionvmsWeb').factory('HttpRequestTimeoutInterceptor', function ($q, httpPendingRequestsService) {
    return {
        request: function (request) {
            request = request || {};
            //Skip if noCancelOnRouteChange is set on request
            if (request.timeout === undefined && !request.noCancelOnRouteChange) {
              request.timeout = httpPendingRequestsService.newTimeout();
            }
            return request;
        },

        responseError: function (response) {
            if (response.config.timeout.isGloballyCancelled) {
              return $q.defer().promise;
            }
            return $q.reject(response);
        }
    };
});