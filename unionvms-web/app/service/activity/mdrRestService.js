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
 * @name mdrRestFactory
 * @param $resource {service} angular resource service
 * @description
 *  REST factory for the Master Data Registry(MDR)
 */
angular.module('unionvmsWeb').factory('mdrRestFactory',function($resource) {
  return {
            getCronJobExpression: function(){
              return $resource('mdr/rest/service/scheduler/config', {}, {
                  'get': {
                      method: 'GET'
                  }
              });
            },
            updateCronJobExpression: function(){
              return $resource('mdr/rest/service/scheduler/config/update', {}, {
                  'save': {
                      method: 'PUT',
                      headers: {
                          'Content-Type': 'application/json'
                      }
                  }
              });
            },
            getAcronymsDetails: function() {
            return $resource('mdr/rest/service/acronyms/details', {}, {
                  'get': {
                      method: 'GET'
                  }
              });
            },
            getMDRCodeList: function() {
            //the URL should be /activity/rest/acronyms/details
            //return $resource('service/activity/codeList.json');
            return $resource('mdr/rest/cl/search' , {}, {
                'get': {
                    method: 'POST'
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            },
            syncNow: function(){
            return $resource('mdr/rest/service/sync/list', {}, {
                'update': {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            });
            },
            syncAllNow: function(){
            return $resource('mdr/rest/service/sync/all', {}, {
                'get': {
                    method: 'GET'
                }
            });
            },
            enableDisableScheduledUpdate: function() {
               return $resource('mdr/rest/service/status/schedulable/update/:acronym/:schedulable', {
                     acronym: '@acronymID',
                     schedulable: '@schedulableFlag'
                }, {
                    'update': {
                        method:'PUT'
                    }
               });
            },
            getWebserviceConfiguration: function () {
                return $resource('mdr/rest/service/webservice/config', {}, {
                    'get': {
                        method: 'GET'
                    }
                });
            },
            updateWebserviceConfiguration: function () {
                return $resource('mdr/rest/service/webservice/config', {}, {
                    update: {
                        method: 'PUT'
                    }
                });
            }
      /*,
          getCodeList: function(){
              return $resource('mock/mdr/cl/:acronym', {
                  acronym: '@acronym'
              }, {
                  'get': {
                      method: 'POST',
                      headers: {
                          'Content-Type': 'application/json'
                      }
                  }
              });
          }*/
      };
  })
  /**
   * @memberof unionvmsWeb
   * @ngdoc service
   * @name mdrRestService
   * @param $q {service} angular $q service
   * @param mdrRestFactory {service} The REST factory for the Master Data Registry(MDR) <p>{@link unionvmsWeb.mdrRestFactory}</p>
   * @description
   *  REST services for the Master Data Registry(MDR)
   */
  .service('mdrRestService',function($q, mdrRestFactory) {

  	var mdrRestService = {
        /**
         * Get the current cronJob expression
         *
         * @memberof mdrRestService
         * @public
         * @returns {Promise} A promise with either the current cronJob expression or reject error
         */
  	    getCronJobExpression: function(){
  	        var deferred = $q.defer();
  	       mdrRestFactory.getCronJobExpression().get(function(response){
  	            deferred.resolve(response.data);
  	        }, function(error){
  	            console.error('Error getting MDR cron job settings.');
  	            deferred.reject(error);
  	        });
  	        return deferred.promise;
  	    },
        /**
         * Save the current cronJob expression
         *
         * @memberof mdrRestService
         * @public
         * @returns {Promise} A promise with either the success code or reject error
         */
  	    updateCronJobExpression: function(configs){
  	       var deferred = $q.defer();
  	       mdrRestFactory.updateCronJobExpression().save(configs, function(response){
  	           deferred.resolve(response);
  	       }, function(error){
  	           console.error('Error saving MDR cron job settings.');
  	           deferred.reject(error);
  	       });
  	       return deferred.promise;
  	    },
        /**
         * Save the current cronJob expression
         *
         * @memberof mdrRestService
         * @public
         * @returns {Promise} A promise with either the MDR code list or reject error
         */
  	    getAcronymsDetails: function() {
  	        var deferred = $q.defer();
  	        mdrRestFactory.getAcronymsDetails().get(function(response) {
  	            deferred.resolve(response.data);
  	        }, function(error) {
  	            console.error('Error listing the acronyms table');
  	            deferred.reject(error);
  	        });
  	        return deferred.promise;
  	    },
        /**
         *  Requests all code lists belonging to a given acronym, and updates the smart table state according to the response object.
         *
         * @memberof mdrRestService
         * @public
         * @param {String} acronym - is MDR acronym
         * @param {String} tableState - is an object representing the smart table state
         * @returns {Promise} A promise with either the MDR code list or reject error
         */
  	    getMDRCodeList: function(acronym, tableState, searchAttribute, sortAttribute) {
            var payload;

            if(angular.isDefined(tableState)){
                payload = {
                    pagination: {
                        offset: tableState.pagination.start || 0, // This is NOT the page number, but the index of item in the list that you want to use to display the table.
                        pageSize: tableState.pagination.number || 10 // Number of entries showed per page.
                    },
                    sorting: {
                        sortBy: sortAttribute ? sortAttribute : tableState.sort.predicate,
                        isReversed: tableState.sort.reverse
                    },
                    criteria: {
                        acronym: acronym,
                        filter: tableState.search.predicateObject && tableState.search.predicateObject.$ ? '*' + tableState.search.predicateObject.$ + '*' : '*',
                        searchAttribute: searchAttribute
                    }
                };
            }else{
                payload = {
                    criteria: {
                        acronym: acronym,
                        filter: '*',
                    }
                };
            }

            var deferred = $q.defer();
            mdrRestFactory.getMDRCodeList().get(payload, function(response) {
                if(angular.isDefined(tableState) && angular.isDefined(tableState.pagination)){
                    var pageSize = tableState.pagination.number || 10;
                    tableState.pagination.numberOfPages = Math.ceil(response.totalItemsCount / pageSize) || 1;//set the number of pages so the pagination can update
                }
                deferred.resolve(response.resultList);
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
         * @returns {Promise} containing the updated code list
         */
  	    syncNow: function(acronymsArray) {
  	        var deferred = $q.defer();
  	        mdrRestFactory.syncNow().update(acronymsArray, function(response){
                deferred.resolve(response);
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
         * @returns {Promise} containing the updated code list
         */
        syncAllNow: function() {
            var deferred = $q.defer();
            mdrRestFactory.syncAllNow().get(function(response){
                 deferred.resolve(response);
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
         * @returns {Promise} containing either the success code or the reject error
         */
        enableDisableScheduledUpdate: function(acronym, schedulable) {
            var deferred = $q.defer();
            mdrRestFactory.enableDisableScheduledUpdate().update({acronymID: acronym, schedulableFlag: schedulable},
                function(response){
                     deferred.resolve(response.data);
                },
                function(error) {
                     console.error('Error enabling/disabling automatic updates for acronym: ' + acronym);
                     deferred.reject(error);
                });
          return deferred.promise;
        },
        /**
         * Used to get webservice configuration data, for mdr synchronisation.
         *
         * @memberof mdrRestService
         * @returns {*} {Promise} containing either the success code and data or the reject error
         */
        getWebserviceConfiguration: function() {
            var deferred = $q.defer();
            mdrRestFactory.getWebserviceConfiguration().get(function(response){
                    deferred.resolve(response.data);
                },
                function(error) {
                    console.error('Error getting webservice configuration');
                    deferred.reject(error);
                });
            return deferred.promise;
        },
        /**
         * Used to update webservice configuration data.
         *
         * @memberof mdrRestService
         * @param {Object} webserviceConfig - object holding the webservice configuration data
         * @returns {*} {Promise} containing either the success code or the reject error
         */
        updateWebserviceConfiguration: function(webserviceConfig) {
            var deferred = $q.defer();
            mdrRestFactory.updateWebserviceConfiguration().update(webserviceConfig,
                function(response){
                    deferred.resolve(response.data);
                },
                function(error) {
                    console.error('Error updating webservice configuration: ' + webserviceConfig);
                    deferred.reject(error);
                });
            return deferred.promise;
        }
        /*,
        getCodeList: function(acronym){
            var deferred = $q.defer();
            //TODO the payload for pagination
            mdrRestFactory.getCodeList().get({acronym: acronym}, function(response){
                deferred.resolve(response.resultList);
            }, function(error){
                console.error('Error returning the code list for the acronym: ' + acronym);
                deferred.reject(error);
            });
            return deferred.promise;
        }*/
  	};

  	return mdrRestService;
});

