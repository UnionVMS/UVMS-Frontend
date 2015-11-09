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
