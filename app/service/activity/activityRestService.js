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
        getActivityList: function(){
            return $resource('/activity/rest/fa/list', {}, {
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
.service('activityRestService', function($q, activityRestFactory){
    var activityService = {
        /**
         * Get a list of fishing activity reports according to search criteria
         * 
         * @memberof activityRestService
         * @public
         * @param {Object} data - The search criteria and table pagination data object
         * @returns {Promise} A promise with either the resolved data response or reject error
         */
        getActivityList: function(data){
            var deferred = $q.defer();
            activityRestFactory.getActivityList().get(angular.toJson(data), function(response){
                deferred.resolve(response);
            }, function(error){
                console.log('Error getting list of activity reports');
                deferred.reject(error);
            });
            return deferred.promise;
        }
    };

    return activityService;
});
