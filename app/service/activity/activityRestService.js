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
/**
 * @memberof unionvmsWeb
 * @ngdoc service
 * @name activityRestFactory
 * @param $resource {service} angular resource service
 * @param $http {service} angular http service 
 * @description
 *  REST factory for the activity module
 */
angular.module('unionvmsWeb').factory('activityRestFactory', function ($resource, $http) {
    return {
        getUserPreferences: function () {
            return $resource('/activity/rest/config/user', {}, {
                'get': {
                    method: 'GET'
                }
            });
        },
        getActivityList: function (data) {
            return $resource('/activity/rest/fa/list', {}, {
                'get': {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            });
        },
        getTripsList: function (data) {
            return $resource('/activity/rest/fa/listTrips', {}, {
                'get': {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            });
        },
        getReportHistory: function () {
            return $resource('/activity/rest/fa/history/:referenceId/:schemeId', {}, {
                'get': {
                    method: 'GET',
                }
            });
        },
        getTripCronology: function () {
            return $resource('/activity/rest/trip/cronology/:id/:nrItems', {}, {
                'get': {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            });
        },
        getTripVessel: function () {
            return $resource('/activity/rest/trip/vessel/details/:id', {}, {
                'get': {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            });
        },
        getTripMessageCount: function () {
            return $resource('/activity/rest/trip/messages/:id', {}, {
                'get': {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            });
        },
        getTripCatches: function () {
            return $resource('/activity/rest/trip/catches/:id', {}, {
                'get': {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            });
        },
        getTripReports: function () {
            return $resource('/activity/rest/trip/reports/:id', {}, {
                'get': {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            });
        },
        getTripMapData: function(){
            return $resource('/activity/rest/trip/mapData/:id', {}, {
                'get': {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            });
        },
        getTripCatchDetail: function () {
            return $resource('/mock/activity/catchdetails/:id', {}, {
                'get': {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            });
        },
        getTripCatchesLandingDetails: function () {
            return $resource('/activity/rest/catch/details/:id', {}, {
                'get': {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            });
        },
        getTripCatchesEvolution: function () {
            return $resource('/mock/activity/tripcatchevolution/:id', {}, {
                'get': {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            });
        },
        getFishingActivityDetails: function(){
            return $resource('/activity/rest/fa/views/:fatype', {}, {
               'get': {
                   method: 'POST',
                   headers: {
                       'Content-Type': 'application/json'
                   }
               }
            });
        }
    };

})
/**
 * @memberof unionvmsWeb
 * @ngdoc service
 * @name activityRestService
 * @param $q {service} angular $q service
 * @param activityRestFactory {service} The REST factory for the activity module <p>{@link unionvmsWeb.activityRestFactory}</p> 
 * @description
 *  REST services for the activity module
 */
.service('activityRestService', function ($q, activityRestFactory) {
    var activityService = {
        /**
         * Get the user preferences for the activty module
         * 
         * @memberof activityRestService
         * @public
         * @returns {Promise} A promise with either the user preferences of the activity module or reject error
         */
        getUserPreferences: function () {
            var deferred = $q.defer();
            activityRestFactory.getUserPreferences().get(function (response) {
                deferred.resolve(response.data);
            }, function (error) {
                console.log('Error getting user preferences for activity');
                deferred.reject(error);
            });
            return deferred.promise;
        },
        /**
         * Get a list of fishing activity reports according to search criteria
         * 
         * @memberof activityRestService
         * @public
         * @param {Object} data - The search criteria and table pagination data object
         * @returns {Promise} A promise with either the list of activities or reject error
         */
        getActivityList: function (data) {
            var deferred = $q.defer();
            activityRestFactory.getActivityList().get(angular.toJson(data), function (response) {
                deferred.resolve(response);
            }, function (error) {
                console.log('Error getting list of activity reports');
                deferred.reject(error);
            });
            return deferred.promise;
        },
        /**
         * Get a list of trips according to search criteria
         * 
         * @memberof activityRestService
         * @public
         * @param {Object} data - The search criteria and table pagination data object
         * @returns {Promise} A promise with either the list of trips or reject error
         */
        getTripsList: function (data) {
            var deferred = $q.defer();
            activityRestFactory.getTripsList().get(angular.toJson(data), function (response) {
                response.data.resultList = angular.copy(response.data.fishingTripIdList);
                delete response.data.fishingTripIdList;
                deferred.resolve(response.data);
            }, function (error) {
                console.log('Error getting list of trips');
                deferred.reject(error);
            });
            return deferred.promise;
        },
        /**
	     * Get the history for a FA report
         * 
    	 * @memberof activityRestService
	     * @public
         * @param {Number} refId - The reference ID
         * @param {Number} schId - The scheme ID
    	 * @returns {Promise} A promise with either the history list of the FA report or reject error
	     */
        getReportHistory: function (refId, schId) {
            var deferred = $q.defer();
            activityRestFactory.getReportHistory().get({ referenceId: refId, schemeId: schId }, function (response) {
                deferred.resolve(response.data);
            }, function (error) {
                deferred.reject(error);
            });
            return deferred.promise;
        },
        /**
         * Get the trip cronology of a specific trip
         * 
         * @memberof activityRestService
         * @public
         * @param {String} id - The trip id of the selected trip
         * @param {Number} nrItems - The number of trips to display in trip cronology
         * @returns {Promise} A promise with either the trip cronology or reject error
         */
        getTripCronology: function (id, nrItems) {
            var deferred = $q.defer();
            activityRestFactory.getTripCronology().get({ id: id, nrItems: nrItems }, function (response) {
                deferred.resolve(response);
            }, function (error) {
                deferred.reject(error);
            });
            return deferred.promise;
        },
        /**
         * Get the vessel and roles details of a specific trip
         * 
         * @memberof activityRestService
         * @public
         * @param {String} id - The trip id of the selected trip
         * @returns {Promise} A promise with either the vessel and roles details or reject error
         */
        getTripVessel: function (id) {
            var deferred = $q.defer();
            activityRestFactory.getTripVessel().get({ id: id }, function (response) {
                deferred.resolve(response);
            }, function (error) {
                deferred.reject(error);
            });
            return deferred.promise;
        },
        /**
         * Get the message type count of a specific trip
         * 
         * @memberof activityRestService
         * @public
         * @param {String} id - The trip id of the selected trip
         * @returns {Promise} A promise with either the vessel and roles details or reject error
         */
        getTripMessageCount: function (id) {
            var deferred = $q.defer();
            activityRestFactory.getTripMessageCount().get({ id: id }, function (response) {
                deferred.resolve(response);
            }, function (error) {
                deferred.reject(error);
            });
            return deferred.promise;
        },
        /**
         * Get the catch details of a specific trip
         * 
         * @memberof activityRestService
         * @public
         * @param {String} id - The trip id of the selected trip
         * @returns {Promise} A promise with either the vessel and roles details or reject error
         */
        getTripCatches: function (id) {
            var deferred = $q.defer();
            activityRestFactory.getTripCatches().get({ id: id }, function (response) {
                deferred.resolve(response);
            }, function (error) {
                deferred.reject(error);
            });
            return deferred.promise;
        },
        /**
         * Get the trip reports of a specific trip
         * 
         * @memberof activityRestService
         * @public
         * @param {String} id - The trip id of the selected trip
         * @returns {Promise} A promise with either the vessel and roles details or reject error
         */
        getTripReports: function (id) {
            var deferred = $q.defer();
            activityRestFactory.getTripReports().get({ id: id }, function (response) {
                deferred.resolve(response);
            }, function (error) {
                deferred.reject(error);
            });
            return deferred.promise;
        },
        /**
         * Get the trip map data
         * 
         * @memberof activityRestService
         * @public
         * @param {String} id - The trip id of the selected trip
         * @returns {Promise} A promise with either the spatial trip data or reject error
         */
        getTripMapData: function(id){
            var deferred = $q.defer();
            activityRestFactory.getTripMapData().get({ id: id }, function (response) {
                deferred.resolve(response.data);
            }, function (error) {
                deferred.reject(error);
            });
            return deferred.promise;
        },
        /**
         * Get the Catch Details of a specific trip
         * 
         * @memberof activityRestService
         * @public
         * @param {String} id - The trip id of the selected trip
         * @returns {Promise} A promise with either the trip catch details or reject error
         */
        getTripCatchDetail: function (id) {
            var deferred = $q.defer();
            activityRestFactory.getTripCatchDetail().get({ id: id }, function (response) {
                deferred.resolve(response.data);
            }, function (error) {
                deferred.reject(error);
            });
            return deferred.promise;
        },
        /**
         * Get the Catches and Landing Details for Tables. 
         * 
         * @memberof activityRestService
         * @public
         * @param {String} id - The trip id of the selected trip
         * @returns {Promise} A promise with either the trip catch details or reject error
         */
        getTripCatchesLandingDetails: function (id) {
            var deferred = $q.defer();
            activityRestFactory.getTripCatchesLandingDetails().get({ id: id }, function (response) {
                deferred.resolve(response.data);
            }, function (error) {
                deferred.reject(error);
            });
            return deferred.promise;
        },
        /**
         * Get the Catches Evolution Details. 
         * 
         * @memberof activityRestService
         * @public
         * @param {String} id - The trip id of the selected trip
         * @returns {Promise} A promise with either the trip catch details or reject error
         */
        getTripCatchesEvolution: function (id) {
            var deferred = $q.defer();
            activityRestFactory.getTripCatchesEvolution().get({ id: id }, function (response) {
                deferred.resolve(response.data);
            }, function (error) {
                deferred.reject(error);
            });
            return deferred.promise;

        },
        /**
         * Get Fishing Activity details by type
         * 
         * @memberof activityRestService
         * @public
         * @param {String} type - The fisihing activity type (e.g. departure, landing, arrival)
         * @param {Object} payload - The post payload containing the activity id (mandatory) and the trip id (not mandatory and to be used only in the report tab) 
         * @returns {Promise}  A promise with either the fishing activity details or reject error
         */
        getFishingActivityDetails: function(type, payload){
            var deferred = $q.defer();
            activityRestFactory.getFishingActivityDetails().get({fatype: type}, payload, function (response) {
                deferred.resolve(response.data);
            }, function (error) {
                deferred.reject(error);
            });
            return deferred.promise;
        }
    };

    return activityService;
});

