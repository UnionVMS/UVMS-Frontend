var applicationsService = angular.module('applicationsService', ['ngResource']);

applicationsService.factory('applicationsService', ['$resource', '$q', '$log', function ($resource, $q, $log) {

    return {
        getApplicationFeatures: function (applicationName) {
            var message = "";
            var deferred = $q.defer();
            var resource = $resource('/usm-administration/rest/applications/:applicationName/features', {'applicationName': applicationName});

            resource.get().$promise.then(
                function (data) {
                    deferred.resolve({
                        features: data.results
                    });
                },
                function (error) {
                    message = 'Error: ' + error.data.message;
                    deferred.reject(message);
                }
            );

            return deferred.promise;
        },
        getAllFeatures: function () {
            var message = "";
            var deferred = $q.defer();
            var resource = $resource('/usm-administration/rest/applications/features');

            resource.get().$promise.then(
                function (data) {
                    deferred.resolve({
                        features: data.results
                    });
                },
                function (error) {
                    message = 'Error: ' + error.data.message;
                    deferred.reject(message);
                }
            );

            return deferred.promise;
        },
        getPermissionByCriteria: function (criteria) {
            var message = "";
            var deferred = $q.defer();
            var resource = $resource('/usm-administration/rest/roles/permissions');

            resource.get(criteria).$promise.then(
                function (data) {
                    deferred.resolve({
                        features: data.results
                    });
                },
                function (error) {
                    message = 'Error: ' + error.data.message;
                    deferred.reject(message);
                }
            );

            return deferred.promise;
        }
    };
}]);

applicationsService.factory('getApplications', ['$resource', '$q', '$log', function ($resource, $q, $log) {
    return {
        get: function () {
            var message = "";
            var deferred = $q.defer();
            var resource = $resource("/usm-administration/rest/applications/names");

            resource.get().$promise.then(
                function (data) {
                    deferred.resolve({
                        applications: data.results
                    });
                },
                function (error) {
                    $log.log(error);
                    message = "Error: " + error.data.message;
                    deferred.reject(message);
                }
            );
            return deferred.promise;
        }
    };

}]);
