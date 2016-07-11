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