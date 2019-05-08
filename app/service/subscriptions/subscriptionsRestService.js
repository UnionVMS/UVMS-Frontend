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
angular.module('unionvmsWeb').factory('subscriptionsRestFactory', function ($resource, $http) {
    return {
        getOrganisations: function(){
            return $resource('usm-administration/rest/organisations', {}, {
                'get': {
                    method: 'GET'
                }
            });
        },
        getOrganisationDetails: function () {
            return $resource('usm-administration/rest/organisations/:id', {}, {
                'get': {
                    method: 'GET'
                }
            });
        },
        createSubscription: function () {
            return $resource('subscription/rest/subscription', {}, {
                'create': {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            });
        },
        updateSubscription: function () {
            return $resource('subscription/rest/subscription', {}, {
                'update': {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            });
        },
        getSubscriptionsList: function () {
            return $resource('subscription/rest/subscription/list', {}, {
                'get': {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            });
        },
        deleteSubscription: function () {
            return $resource('subscription/rest/subscription/:id', {}, {
                'delete': {
                    method: 'DELETE'
                }
            });
        },
        getSubscriptionByName: function () {
            return $resource('subscription/rest/subscription/:name', {}, {
                'get': {
                    method: 'GET'
                }
            });
        }
    };
})
/**
 * @memberof unionvmsWeb
 * @ngdoc service
 * @name subscriptionsRestService
 * @param $q {service} angular $q service
 * @param subscriptionsRestFactory {service} The REST factory for the activity module <p>{@link unionvmsWeb.subscriptionsRestFactory}</p>
 * @description
 *  REST services for the activity module
 */
.service('subscriptionsRestService', function ($q, subscriptionsRestFactory) {
    var subscriptionsRestService = {
        /**
         * Get list of the USM organisations
         *
         * @memberOf subscriptionsRestService
         * @public
         * @returns {Promise} A promise with either the list of organisations or reject error
         */
        getOrganisations: function(){
            var deferred = $q.defer();
            subscriptionsRestFactory.getOrganisations().get({ limit: '100' }, function (response) {
                deferred.resolve(response);
            }, function (error) {
                console.log('Error getting organizations from USM');
                deferred.reject(error);
            });
            return deferred.promise;
        },
        /**
         * Get the details of a USM organisation including endpoints and communication channels
         *
         * @memberOf subscriptionsRestService
         * @public
         * @returns {Promise} A promise with either the details of an organisation or reject error
         */
        getOrganisationDetails: function (id) {
            var deferred = $q.defer();
            subscriptionsRestFactory.getOrganisationDetails().get({id: id}, function (response) {
                deferred.resolve(response);
            }, function (error) {
                console.log('Error getting organizations from USM');
                deferred.reject(error);
            });
            return deferred.promise;
        },
        /**
         * Save a new subscription
         *
         * @memberOf subscriptionsRestService
         * @public
         * @param {String} data - A JSON string containing the data to be sent to the server
         * @returns {Promise} A promise with either successful saved date or reject error
         */
        createSubscription: function (data) {
            var deferred = $q.defer();
            subscriptionsRestFactory.createSubscription().create(data, function (response) {
                deferred.resolve(response);
            }, function (error) {
                console.log('Error while creating a new subscription');
                deferred.reject(error);
            });
            return deferred.promise;
        },
        /**
         * Update an existing subscription
         *
         * @memberOf subscriptionsRestService
         * @public
         * @param data
         * @returns {Promise} A promise with either successful saved date or reject error
         */
        updateSubscription: function (data) {
            var deferred = $q.defer();
            subscriptionsRestFactory.updateSubscription().update(data, function (response) {
                deferred.resolve(response.data);
            }, function (error) {
                console.log('Error while creating a new subscription');
                deferred.reject(error);
            });
            return deferred.promise;
        },
        /**
         * Get a list of subscriptions
         *
         * @memberOf subscriptionsRestService
         * @public
         * @param {Object} data - The query parameters object
         * @returns {Promise} A promise with either successful saved date or reject error
         */
        getSubscriptionsList: function (data) {
            var deferred = $q.defer();
            var payload = {
                pagination: {
                    offset: -1,
                    pageSize: 1
                },
                queryParameters: {},
                orderBy: {}
            };

            if (angular.isDefined(data.queryParameters)){
                payload.queryParameters = data.queryParameters;
            }

            subscriptionsRestFactory.getSubscriptionsList().get(angular.toJson(payload), function (response) {
                deferred.resolve(response.data);
            }, function (error) {
                console.log('Error while creating a new subscription');
                deferred.reject(error);
            });
            return deferred.promise;
        },
        /**
         * Delete a subscription
         *
         * @memberOf subscriptionsRestService
         * @public
         * @param {Number} id - The id of the subscription to be deleted
         * @returns {Promise} A promise with either successful saved date or reject error
         */
        deleteSubscription: function (id) {
            var deferred = $q.defer();
            subscriptionsRestFactory.deleteSubscription().delete({id: id}, function (response) {
                deferred.resolve(response);
            }, function (error) {
                console.error('Error deleting subscription.');
                deferred.reject(error);
            });
            return deferred.promise;
        },
        /**
         * Get subscription by its name
         *
         * @memberOf subscriptionsRestService
         * @public
         * @param {String} name - The name of the subscription
         * @returns {Promise} A promise with either successful saved date or reject error
         */
        getSubscriptionByName: function (name) {
            var deferred = $q.defer();
            subscriptionsRestFactory.getSubscriptionByName().get({name: name}, function (response) {
                deferred.resolve(response);
            }, function (error) {
                console.error('Error getting subscription.');
                deferred.reject(error);
            });
            return deferred.promise;
        }
    };

    return subscriptionsRestService;
});
