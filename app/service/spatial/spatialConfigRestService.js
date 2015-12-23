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
        getUserConfigs: function(){
            return $resource('/spatial/rest/config/user', {}, {
                'get': {
                    method: 'GET'
                }
            });
        },
        saveUserConfigs: function(){
            return $resource('/spatial/rest/config/user/save', {}, {
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
        },
        resetSettings: function(){
            return $resource('/spatial/rest/config/user/reset', {}, {
                'reset': {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
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
	           console.error('Error saving admin configurations');
	           deferred.reject(error);
	       });
	       return deferred.promise;
	    },
	    getUserConfigs: function(){
            var deferred = $q.defer();
            spatialConfigRestFactory.getUserConfigs().get(function(response){
                deferred.resolve(response.data);
            }, function(error){
                console.error('Error getting user configurations');
                deferred.reject(error);
            });
            return deferred.promise;
        },
        saveUserConfigs: function(configs){
           var deferred = $q.defer();
           spatialConfigRestFactory.saveUserConfigs().save(configs, function(response){
               deferred.resolve([response, configs]);
           }, function(error){
               console.error('Error saving user configurations');
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
        },
        resetSettings: function(settingsSection){
            var deferred = $q.defer();
            spatialConfigRestFactory.resetSettings().reset(angular.toJson(settingsSection), function(response){
               deferred.resolve(response.data); 
            }, function(error){
                console.error('Error reseting settings to defaults');
                deferred.reject(error);
            });
            return deferred.promise;
        }
	};
	
	return spatialConfigRestService;
});