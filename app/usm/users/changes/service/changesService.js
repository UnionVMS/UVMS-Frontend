var changesServiceModule = angular.module('changesServiceModule', ['ngResource']);

changesServiceModule.factory('changesService', ['$resource', '$q', '$log', function ($resource, $q, $log) {

    return {
        isReviewContactDetailsEnabled: function() {
            var message = "";
            var deferred = $q.defer();
            var resource = $resource('/usm-administration/rest/persons/isReviewContactDetailsEnabled');

            resource.get().$promise.then(
                function (data) {
                    deferred.resolve({
                        isReviewContactDetailsEnabled: data.result
                    });
                },
                function (error) {
					if (!_.isUndefined(error.data)) {
						message = 'Error: ' + error.data.message;
					} else {
						message = 'Error: undefined';
					}
					deferred.reject(message);
                }
            );

            return deferred.promise;
        },
        findPendingContactDetails: function() {
            var message = "";
            var deferred = $q.defer();
            var resource = $resource('/usm-administration/rest/persons/pendingContactDetails');

            resource.get().$promise.then(
                function (data) {
                    deferred.resolve({
                        changes: data.results
                    });
                },
                function (error) {
                    message = 'Error: ' + error.data.message;
                    deferred.reject(message);
                }
            );

            return deferred.promise;
        },
        getPendingContactDetails: function(userName) {
            var message = "";
            var deferred = $q.defer();
            var resource = $resource('/usm-administration/rest/persons/pendingContactDetails/:userName', {"userName":userName});

            resource.get().$promise.then(
                function (data) {
                    deferred.resolve({
                        change: data
                    });
                },
                function (error) {
                    message = 'Error: ' + error.data.message;
                    deferred.reject(message);
                }
            );

            return deferred.promise;
        },
        getContactDetails: function(userName) {
            var message = "";
            var deferred = $q.defer();
            var resource = $resource('/usm-administration/rest/persons/contactDetails/:userName', {"userName":userName});

            resource.get().$promise.then(
                function (data) {
                    deferred.resolve({
                        contactDetails: data
                    });
                },
                function (error) {
                    message = 'Error: ' + error.data.message;
                    deferred.reject(message);
                }
            );

            return deferred.promise;
        },
        rejectPendingContactDetails: function(userName) {
            var message = "";
            var deferred = $q.defer();
            var resource = $resource('/usm-administration/rest/persons/pendingContactDetails/:userName/reject', {"userName":userName});

            resource.get().$promise.then(
                function (data) {
                    deferred.resolve({

                    });
                },
                function (error) {
                    message = 'Error: ' + error.data.message;
                    deferred.reject(message);
                }
            );

            return deferred.promise;
        },
        acceptPendingContactDetails: function(userName) {
            var message = "";
            var deferred = $q.defer();
            var resource = $resource('/usm-administration/rest/persons/pendingContactDetails/:userName/accept', {"userName":userName});

            resource.get().$promise.then(
                function (data) {
                    deferred.resolve({

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
