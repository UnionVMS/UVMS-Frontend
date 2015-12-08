angular.module('unionvmsWeb').factory('spatialConfigRestFactory', function($resource){
    return {
        getAdminConfigs: function(){
            return $resource('/spatial/rest/config/admin', {}, {
                'get': {
                    method: 'GET'
                }
            });
        },
        saveAdminConfigs: function(){
            return $resource('/spatial/rest/config/admin/save', {}, {
                'save': {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            });
        },
        getCountriesList: function(){
            return $resource('/spatial/rest/countries', {}, {
                'get': {
                    method: 'GET'
                 }
            });
        }
    };
})
.service('spatialConfigRestService',function($q, spatialConfigRestFactory) {

	var spatialConfigRestService = {
	    getAdminConfigs: function(){
	        var deferred = $q.defer();
	        spatialConfigRestFactory.getAdminConfigs().get(function(response){
	            deferred.resolve(response.data);
	        }, function(error){
	            console.error('Error getting admin configurations');
	            deferred.reject(error);
	        });
	        return deferred.promise;
	    },
	    saveAdminConfigs: function(configs){
	       var deferred = $q.defer();
	       spatialConfigRestFactory.saveAdminConfigs().save(configs, function(response){
	           deferred.resolve(response);
	       }, function(error){
	           deferred.reject(error);
	       });
	       return deferred.promise;
	    },
	    getCountriesList: function(){
            var deferred = $q.defer();
            spatialConfigRestFactory.getCountriesList().get(function(response){
                deferred.resolve(response.data);
            }, function(error){
                console.error('Error getting list of countries');
                deferred.reject(error);
            });
            return deferred.promise;
        }
	};
	
	return spatialConfigRestService;
});