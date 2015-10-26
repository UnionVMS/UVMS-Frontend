var userPreferencesServiceModule = angular.module('userPreferencesServiceModule', ['ngResource']);

userPreferencesServiceModule.factory('userPreferencesService', ['$resource', '$q', '$log',
    function ($resource, $q, $log) {

        return {
            getUserPreferences: function (userName,groupName) {
                var message = "";
                var deferred = $q.defer();

                var resource = $resource('/usm-administration/rest/users/:userName/userPreferences', {"userName":userName});
                resource.get(groupName).$promise.then(
                    function (data) {
                        deferred.resolve({
                            userPreferences: data.results
                        });
                    },
                    function (error) {
                        $log.log(error);
                        message = error.data.message;
                        deferred.reject(message);
                    }
                );

                return deferred.promise;
            }
        };

    }]);
