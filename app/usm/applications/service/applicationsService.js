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
var applicationsService = angular.module('applicationsService', ['ngResource']);

applicationsService.factory('applicationsService', ['$resource', '$q', '$log', function ($resource, $q, $log) {

    return {
        getApplicationFeatures: function (applicationName) {
            var message = "";
            var deferred = $q.defer();
            var resource = $resource('usm-administration/rest/applications/:applicationName/features', {'applicationName': applicationName});

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
            var resource = $resource('usm-administration/rest/applications/features');

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
            var resource = $resource('usm-administration/rest/roles/permissions');

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
        },
        getApplications: function (criteria) {
            var message = "";
            var deferred = $q.defer();
            var resource = $resource('usm-administration/rest/applications');

            resource.get(criteria).$promise.then(
                function (data) {
                    deferred.resolve({
                        applications: data.results,
                        total: data.total
                    });
                },
                function (error) {
                    message = 'Error: ' + error.data.message;
                    deferred.reject(message);
                }
            );

            return deferred.promise;
        },
        getParentApplicationNames: function () {
            var message = "";
            var deferred = $q.defer();
            var resource = $resource('usm-administration/rest/applications/parent/names');

            resource.get().$promise.then(
                function (data) {
                    deferred.resolve({
                        parents: data.results
                    });
                },
                function (error) {
                    message = 'Error: ' + error.data.message;
                    deferred.reject(message);
                }
            );

            return deferred.promise;
        },
        getApplicationDetails: function (applicationName) {
            var message = "";
            var deferred = $q.defer();
            var resource = $resource('usm-administration/rest/applications/:applicationName', {"applicationName": applicationName});

            resource.get().$promise.then(
                function (data) {
                    deferred.resolve({
                        applicationDetails: {
                            name: data.name,
                            parent: data.parent,
                            description: data.description,
                            features: data.feature,
                            datasets: data.dataset,
                            options: data.option
                        }
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
            var resource = $resource("usm-administration/rest/applications/names");

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