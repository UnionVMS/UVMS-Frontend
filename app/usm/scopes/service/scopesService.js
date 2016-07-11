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
var scopesServiceModule = angular.module('scopesServiceModule', ['ngResource']);

scopesServiceModule.factory('scopeServices', ['$resource', '$q', '$log', function ($resource, $q, $log) {
    return {
        getScopes: function (criteria) {
            var message = "";
            var deferred = $q.defer();
            var resource = $resource('/usm-administration/rest/scopes');

            resource.get(criteria).$promise.then(
                function (data) {
                    deferred.resolve({
                        scopes: data.results,
                        total: data.total
                    });
                },
                function (error) {
                    $log.log(error);
                    message = error.data.message;
                    deferred.reject(message);
                }
            );

            return deferred.promise;
        },
        searchScopes: function (criteria) {
            var message = "";
            var deferred = $q.defer();
            var resource = $resource('/usm-administration/rest/scopes');

            resource.get(criteria).$promise.then(
                function (data) {
                    deferred.resolve({
                        scopes: data.results,
                        total: data.total
                    });
                },
                function (error) {
                    message = error.data.message;
                    deferred.reject(message);
                }
            );

            return deferred.promise;
        },
        getScopeDetails: function (scopeId) {
            var message = "";
            var deferred = $q.defer();
            var resource = $resource('/usm-administration/rest/scopes/:scopeId', {'scopeId': scopeId});

            resource.get().$promise.then(
                function (data) {
                    deferred.resolve({
                        scopeDetails: data
                    });
                },
                function (error) {
                    message = error.data.message;
                    deferred.reject(message);
                }
            );

            return deferred.promise;
        },
        createScope: function (scope) {
            var message = "";
            var deferred = $q.defer();
            var resource = $resource('/usm-administration/rest/scopes');
            resource.save(scope).$promise.then(
                function (data) {
                    deferred.resolve({
                        newScope: data
                    });
                },
                function (error) {
                    message = error.data.message;
                    deferred.reject(message);
                }
            );

            return deferred.promise;
        },
        updateScope: function (scope) {
            var message = "";
            var deferred = $q.defer();
            var resource = $resource('/usm-administration/rest/scopes', {}, {updateScope: {method: 'PUT'}});
            resource.updateScope(scope).$promise.then(
                function (data) {
                    //until we find a better way to avoid the issue of getting $promise in the object
                    delete data.$promise;
                    delete data.$resolved;
                    deferred.resolve({
                        updatedScope: data
                    });
                },
                function (error) {
                    message = error.data.message;
                    deferred.reject(message);
                }
            );

            return deferred.promise;
        },
        deleteScope: function (scopeId) {
            var message = "";
            var deferred = $q.defer();
            var resource = $resource('/usm-administration/rest/scopes/:scopeId', {"scopeId": scopeId});
            resource.delete().$promise.then(
                function (data) {
                    deferred.resolve({
                        deletedScope: data
                    });
                },
                function (error) {
                    message = error.data.message;
                    deferred.reject(message);
                }
            );

            return deferred.promise;
        },
        getCategories: function(){
            var message = "";
            var deferred = $q.defer();
            var resource = $resource('/usm-administration/rest/scopes/datasets/category/names');

            resource.get().$promise.then(
                function (data) {
                    deferred.resolve({
                        categories: data.results
                    });
                },
                function (error) {
                    message = error.data.message;
                    deferred.reject(message);
                }
            );

            return deferred.promise;
        },
        getAllDatasets: function() {
            var message = "";
            var deferred = $q.defer();
            var resource = $resource('/usm-administration/rest/scopes/datasets');

            resource.get().$promise.then(
                function (data) {
                    deferred.resolve({
                        datasets: data.results
                    });
                },
                function (error) {
                    message = 'Error: ' + error.data.message;
                    deferred.reject(message);
                }
            );

            return deferred.promise;
        },
        searchDataset: function (criteria) {
            var message = "";
            var deferred = $q.defer();
            var resource = $resource('/usm-administration/rest/scopes/datasets');

            resource.get(criteria).$promise.then(
                function (data) {
                    deferred.resolve({
                        datasets: data.results
                    });
                },
                function (error) {
                    message = error.data.message;
                    deferred.reject(message);
                }
            );

            return deferred.promise;
        }
    };
}]);