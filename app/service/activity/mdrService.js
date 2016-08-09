angular.module('unionvmsWeb').factory('mdrServiceFactory',function($resource) {
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
           getMDRCodeListByAcronym: function(acronym) {
            //the URL should be /activity/rest/acronyms/details
              return $resource('service/activity/codeList.json');
            }
      };
  })
  .service('mdrService',function($q, mdrServiceFactory) {

  	var mdrService = {
  	    getCronJobExpression: function(){
  	        var deferred = $q.defer();
  	       // deferred.resolve('0 0/1 * 1/1 * ? *'); //mocked
  	       mdrServiceFactory.getCronJobExpression().get(function(response){
  	            deferred.resolve(response.data);
  	        }, function(error){
  	            console.error('Error getting MDR cron job settings.');
  	            deferred.reject(error);
  	        });
  	        return deferred.promise;
  	    },
  	    updateCronJobExpression: function(configs){
  	       var deferred = $q.defer();
  	       mdrServiceFactory.updateCronJobExpression().save(configs, function(response){
  	           deferred.resolve(response);
  	       }, function(error){
  	           console.error('Error saving MDR cron job settings.');
  	           deferred.reject(error);
  	       });
  	       return deferred.promise;
  	    },
  	    getMDRCodeLists: function() {
  	        var deferred = $q.defer();
  	        mdrServiceFactory.getMDRCodeLists().get(function(response) {
  	            deferred.resolve(response.data);
  	        }, function(error) {
  	            console.error('Error listing the acronyms table');
  	            deferred.reject(error);
  	        });
  	        return deferred.promise;
  	    },
  	    getMDRCodeListByAcronym: function(acronym) {
            var deferred = $q.defer();
            mdrServiceFactory.getMDRCodeListByAcronym(acronym).get(function(response) {
                deferred.resolve(response.data);
            }, function(error) {
                console.error('Error listing code list details');
                deferred.reject(error);
            });
            return deferred.promise;
  	    }
  	};

  	return mdrService;
});
