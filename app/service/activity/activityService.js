angular.module('unionvmsWeb').factory('activityServiceFactory',function($resource) {

   return {
          getCronJobExpression: function(){
              return $resource('/activity/rest/mdr/cron', {}, {
                  'get': {
                      method: 'GET'
                  }
              });
          },
          updateCronJobExpression: function(){
              return $resource('/activity/rest/mdr/cron', {}, {
                  'save': {
                      method: 'PUT',
                      headers: {
                          'Content-Type': 'application/json'
                      }
                  }
              });
          },
          getMDRCodeLists: function() {
            return $resource('service/activity/listAcronyms.json');
          }
      };
  })
  .service('activityService',function($q, activityServiceFactory) {

  	var activityService = {
  	    getCronJobExpression: function(){
  	        var deferred = $q.defer();
  	        deferred.resolve('0 0/1 * 1/1 * ? *'); //mocked
  	       /* activityServiceFactory.getCronJobExpression().get(function(response){
  	            deferred.resolve(response.data);
  	        }, function(error){
  	            console.error('Error getting MDR cron job settings.');
  	            deferred.reject(error);
  	        });*/
  	        return deferred.promise;
  	    },
  	    updateCronJobExpression: function(configs){
  	       var deferred = $q.defer();
  	       activityServiceFactory.updateCronJobExpression().save(configs, function(response){
  	           deferred.resolve(response);
  	       }, function(error){
  	           console.error('Error saving MDR cron job settings.');
  	           deferred.reject(error);
  	       });
  	       return deferred.promise;
  	    },
  	    getMDRCodeLists: function() {
  	        var deferred = $q.defer();
  	        activityServiceFactory.getMDRCodeLists().get(function(response) {
  	            deferred.resolve(response.data);
  	        }, function(error) {
  	            console.error('Error listing the acronyms table');
  	            deferred.reject(error);
  	        });
  	        return deferred.promise;
  	    }
  	};

  	return activityService;
  });
