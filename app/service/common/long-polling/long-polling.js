angular.module('unionvmsWeb').factory('longPolling', ['$resource', function($resource) {

    var poll = function(path, callback, error) {
        $resource(path).get(function(response) {
            callback(response);
            poll(path, callback, error);
        }, function(error) {
            if (angular.isFunction(error)) {
                error(error);
            }
        });
    };

    return {
        poll: poll
    };

}]);