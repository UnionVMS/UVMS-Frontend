angular.module('unionvmsWeb').factory('subscriptionsRestFactory', function ($resource, $http) {

    return {
        getFormDetails: function () {
            return $resource('/mock/subscriptions/newSubscription/:id', {}, {
                'get': {
                    method: 'GET'
                }
            });
        },
        getFormComboDetails: function () {
            return $resource('/mock/subscriptions/formComboData/:id', {}, {
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
             * Get the user preferences for the activty module
             * 
             * @memberof activityRestService
             * @public
             * @returns {Promise} A promise with either the user preferences of the activity module or reject error
             */
            getFormDetails: function (id) {
                var deferred = $q.defer();
                subscriptionsRestFactory.getFormDetails().get({ id: id }, function (response) {
                    deferred.resolve(response.data);
                }, function (error) {
                    console.log('Error getting user preferences for activity');
                    deferred.reject(error);
                });
                return deferred.promise;
            },
            /**
             * Get the user preferences for the activty module
             * 
             * @memberof activityRestService
             * @public
             * @returns {Promise} A promise with either the user preferences of the activity module or reject error
             */
            getFormComboDetails: function (id) {
                var deferred = $q.defer();
                subscriptionsRestFactory.getFormComboDetails().get({ id: id }, function (response) {
                    deferred.resolve(response.data);
                }, function (error) {
                    console.log('Error getting user preferences for activity');
                    deferred.reject(error);
                });
                return deferred.promise;
            }


        };

        return subscriptionsRestService;
    });