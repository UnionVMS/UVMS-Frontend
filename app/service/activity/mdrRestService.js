angular.module('unionvmsWeb').factory('mdrRestServiceFactory',function($resource) {
  return {
          getCronJobExpression: function(){
              return $resource('/activity/rest/mdr/schedulerConfig', {}, {
                  'get': {
                      method: 'GET'
                  }
              });
          },
          updateCronJobExpression: function(){
              return $resource('/activity/rest/mdr/schedulerConfig', {}, {
                  'save': {
                      method: 'PUT',
                      headers: {
                          'Content-Type': 'application/json'
                      }
                  }
              });
          },
          getMDRCodeLists: function() {
          //the URL should be /activity/rest/acronyms/details
            return $resource('service/activity/listAcronyms.json');
          },
           getMDRCodeListByAcronym: function(acronym, offset, size, filter, sortBy, sortReversed) {
            //the URL should be /activity/rest/acronyms/details
              return $resource('service/activity/codeList.json');
          },
          syncNow: function(){
            return $resource('/activity/rest/mdr/sync', {}, {
                'update': {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            });
           },
          syncAllNow: function(){
               return $resource('/activity/rest/mdr/sync');
          }
      };
  })
  .service('mdrRestService',function($q, mdrRestServiceFactory) {

  	var mdrRestService = {
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
        }
  	};

  	return mdrRestService;
});
