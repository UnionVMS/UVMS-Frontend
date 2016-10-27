/**
 * @memberof unionvmsWeb
 * @ngdoc service
 * @name activityRestFactory
 * @param $resource {service} angular resource service
 * @param $http {service} angular http service 
 * @description
 *  REST factory for the activity module
 */
angular.module('unionvmsWeb').factory('activityRestFactory',function($resource, $http) {
    return {
        getUserPreferences: function(){
            return $resource('/activity/rest/config/user', {}, {
                'get': {
                    method: 'GET'
                }
            })
        },
        getActivityList: function(){
            return $resource('/activity/rest/fa/list', {}, {
                'get': {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            });
        },
        getTripCronology: function(){
            return $resource('/activity/rest/trip/cronology/:id/:nrItems', {}, {
	            'get': {
	                method: 'GET',
	                headers: {
	                    'Content-Type': 'application/json'
	                }
	            }
	        });
        },
        getTripVessel: function(){
            return $resource('/activity/rest/trip/vessel/details/:id', {}, {
	           'get': {
	               method: 'GET',
	               headers: {
	                   'Content-Type': 'application/json'
	               }
	           } 
	        });
        },
        getTripMessageCount: function(){
            return $resource('/activity/rest/trip/messages/:id', {}, {
	           'get': {
	               method: 'GET',
	               headers: {
	                   'Content-Type': 'application/json'
	               }
	           } 
	        });
        },
        getTripCatches: function(){
            return $resource('/activity/rest/trip/catches/:id', {}, {
	           'get': {
	               method: 'GET',
	               headers: {
	                   'Content-Type': 'application/json'
	               }
	           } 
	        });
        },
        getTripReports: function(){
            return $resource('/activity/rest/trip/reports/:id', {}, {
	           'get': {
	               method: 'GET',
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
.service('activityRestService', function($q, activityRestFactory){
    var activityService = {
        /**
         * Get the user preferences for the activty module
         * 
         * @memberof activityRestService
         * @public
         * @returns {Promise} A promise with either the user preferences of the activity module or reject error
         */
        getUserPreferences: function(){
            var deferred = $q.defer();
            activityRestFactory.getUserPreferences().get(function(response){
                deferred.resolve(response.data);
            }, function(error){
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
        getActivityList: function(data){
            var deferred = $q.defer();
            activityRestFactory.getActivityList().get(angular.toJson(data), function(response){
                deferred.resolve(response.data);
            }, function(error){
                console.log('Error getting list of activity reports');
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
        getTripCronology: function(id,nrItems){
            var deferred = $q.defer();
            activityRestFactory.getTripCronology().get({id: id, nrItems: nrItems}, {}, function(response){
                deferred.resolve(response);
            }, function(error){
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
        getTripVessel: function(id){
            var deferred = $q.defer();
            activityRestFactory.getTripVessel().get({id: id}, {}, function(response){
                deferred.resolve(response);
            }, function(error){
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
        getTripMessageCount: function(id){
            var deferred = $q.defer();
            activityRestFactory.getTripMessageCount().get({id: id}, {}, function(response){
                deferred.resolve(response);
            }, function(error){
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
        getTripCatches: function(id){
            var deferred = $q.defer();
            activityRestFactory.getTripCatches().get({id: id}, {}, function(response){
                deferred.resolve(response);
            }, function(error){
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
        getTripReports: function(id){
            var deferred = $q.defer();
            activityRestFactory.getTripReports().get({id: id}, {}, function(response){
                deferred.resolve(response);
            }, function(error){
                deferred.reject(error);
            });
            return deferred.promise;
        }

    };

    return activityService;
});
