/**
 * @memberof unionvmsWeb
 * @ngdoc service
 * @name mdrRestService
 * @param $q {service} A service that helps you run functions asynchronously, and use their return values (or exceptions) when they are done processing.
 * @param mdrRestServiceFactory {service}
 * @description
 *  A REST service that serves all Master Data Registry requests
 */
angular.module('unionvmsWeb').factory('mdrRestServiceFactory',function($resource) {
  return {
          getCronJobExpression: function(){
              return $resource('/activity/rest/mdr/scheduler/config', {}, {
                  'get': {
                      method: 'GET'
                  }
              });
          },
          updateCronJobExpression: function(){
              return $resource('/activity/rest/mdr/scheduler/config/update', {}, {
                  'save': {
                      method: 'PUT',
                      headers: {
                          'Content-Type': 'application/json'
                      }
                  }
              });
          },
          getMDRCodeLists: function() {
            return $resource('/activity/rest/mdr/acronyms/details');
          },
           getMDRCodeListByAcronym: function(acronym, offset, size, filter, sortBy, sortReversed) {
            //the URL should be /activity/rest/acronyms/details
              return $resource('service/activity/codeList.json');
          },
          syncNow: function(){
            return $resource('/activity/rest/mdr/sync/list', {}, {
                'update': {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            });
           },
          syncAllNow: function(){
               return $resource('/activity/rest/mdr/sync/all');
          },

          enableDisableScheduledUpdate: function() {
               return $resource('/activity/rest/mdr/status/schedulable/update/:acronymID/:schedulableFlag', {
                     acronymID: '@acronymID',
                     schedulableFlag: '@schedulableFlag'
                }, {
                    'update': {
                        method:'PUT'
                    }
               });
          }
      };
  })
  .service('mdrRestService',function($q, mdrRestServiceFactory) {

  	var mdrRestService = {
    /**
     * @memberof mdrRestService
     * @public
     * @returns {Promise} containing a response, which might be a String or an Error.
     */
  	    getCronJobExpression: function(){
  	        var deferred = $q.defer();
  	       // deferred.resolve('0 0/1 * 1/1 * ? *'); //mocked
  	       mdrRestServiceFactory.getCronJobExpression().get(function(response){
  	            deferred.resolve(response.data);
  	        }, function(error){
  	            console.error('Error getting MDR cron job settings.');
  	            deferred.reject(error);
  	        });
  	        return deferred.promise;
  	    },
     /**
     * @memberof mdrRestService
     * @public
     * @param {String} configs - the crontab expression
     * @returns {Promise} containing a response.
     */
  	    updateCronJobExpression: function(configs){
  	       var deferred = $q.defer();
  	       mdrRestServiceFactory.updateCronJobExpression().save(configs, function(response){
  	           deferred.resolve(response);
  	       }, function(error){
  	           console.error('Error saving MDR cron job settings.');
  	           deferred.reject(error);
  	       });
  	       return deferred.promise;
  	    },
    /**
     * @memberof mdrRestService
     * @public
     * @param {String} configs - the crontab expression
     * @returns {Promise} containing a response.
     */
  	    getMDRCodeLists: function() {
  	        var deferred = $q.defer();
  	        mdrRestServiceFactory.getMDRCodeLists().get(function(response) {
  	            deferred.resolve(response.data);
  	        }, function(error) {
  	            console.error('Error listing the acronyms table');
  	            deferred.reject(error);
  	        });
  	        return deferred.promise;
  	    },
    /**
     *  This method requests all code lists belonging to a given acronym, and updates the smart table state according to the response object.
     *
     * @memberof mdrRestService
     * @public
     * @param {String} acronym - is MDR acronym
     * @param {String} tableState - is an object representing the smart table state, with the following structure:
                    {
                        pagination: {
                                start: 0,     // This is NOT the page number, but the index of item in the list that you want to use to display the table.
                                number: 10  // Number of entries showed per page.
                        },
                        search: {
                            predicateObject: 'search text'
                        },
                        sort: {
                            predicate: 'attributeName',
                            reverse: true
                        }
                    }
     * @returns {Promise} containing a response - either an array of code list objects, or an error.
     */
  	    getMDRCodeListByAcronym: function(acronym, tableState) {
      	    var pagination = tableState.pagination;
            var offset = pagination.start || 0;     // This is NOT the page number, but the index of item in the list that you want to use to display the table.
            var size = pagination.number || 10;  // Number of entries showed per page.
            var filter = tableState.search.predicateObject;
            var sortBy = tableState.sort.predicate;
            var sortReversed = tableState.sort.reverse;

            var deferred = $q.defer();
            mdrRestServiceFactory.getMDRCodeListByAcronym(acronym, offset, size, filter, sortBy, sortReversed).get(function(response) {
                tableState.pagination.numberOfPages = response.numberOfPages||0;//set the number of pages so the pagination can update
                deferred.resolve(response.data);
            }, function(error) {
                console.error('Error listing code list details');
                deferred.reject(error);
            });
            return deferred.promise;
  	    },
      /**
         *  This method requests an update of selected MDR code lists.
         *
         * @memberof mdrRestService
         * @public
         * @param {Array} acronymsArray - is an array of acronyms (String).
         * @returns {Promise} containing a response.
         */
  	    syncNow: function(acronymsArray) {
  	        var deferred = $q.defer();
  	        mdrRestServiceFactory.syncNow().update(acronymsArray, function(response){
                deferred.resolve(response.data);
  	        },
  	        function(error) {
                console.error('Error requesting synchronization of the following acronyms: ' + acronymsArray);
                deferred.reject(error);
  	        });
  	        return deferred.promise;
  	    },
  	     /**
         *  This method requests an update of all MDR code lists.
         *
         * @memberof mdrRestService
         * @public
         * @returns {Promise} containing a response.
         */
        syncAllNow: function() {
            var deferred = $q.defer();
            mdrRestServiceFactory.syncAllNow().get(function(response){
                 deferred.resolve(response.data);
            },
            function(error) {
                 console.error('Error requesting synchronization of all acronyms.');
                 deferred.reject(error);
            });
            return deferred.promise;
        },

        /**
         *  This method enables/disables the automatic update of a given acronym.
         *
         * @memberof mdrRestService
         * @public
         * @param {String} acronym - is the acronym which automatic update will be modified.
         * @param {boolean} schedulable - is a boolean flag. When false - the automatic update will be disabled and vice versa.
         * @returns {Promise} containing a response.
         */
        enableDisableScheduledUpdate: function(acronym, schedulable) {
            var deferred = $q.defer();
            mdrRestServiceFactory.enableDisableScheduledUpdate().update({acronymID: acronym, schedulableFlag: schedulable},
                function(response){
                     deferred.resolve(response.data);
                },
                function(error) {
                     console.error('Error enabling/disabling automatic updates for acronym: ' + acronym);
                     deferred.reject(error);
                });
          return deferred.promise;
        }
  	};

  	return mdrRestService;
});
