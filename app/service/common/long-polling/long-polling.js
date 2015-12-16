angular.module('unionvmsWeb').factory('longPolling', ['$resource', function($resource) {

    var runningLongPollingIds = [];
    var nextLongPollingId = 0;

    //Start a long polling request and keep polling until cancelled
    var poll = function(path, callback, error) {
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
    };

    //Cancel a long polling (meaning no more requests will be sent when the current one is finished)
    var cancel = function(id){
        if(angular.isDefined(id)){
            var index = runningLongPollingIds.indexOf(id);
            if(index >= 0){
                runningLongPollingIds.splice(index, 1);
            }
        }
    };

    return {
        poll: poll,
        cancel: cancel
    };

}]);