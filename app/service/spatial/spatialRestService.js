angular.module('unionvmsWeb').factory('spatialRestFactory', function($resource) {
    return {
        getAreaLayers: function(){
            return $resource('/spatial/rest/arealayers', {}, {
                'get': {method: 'GET'}
            });
        },
        getUserAreaLayer: function(){
            return $resource('/spatial/rest/userarealayers', {}, {
                'get': {method: 'GET'}
            });
        },
        getAreaDetails: function(){
            return $resource('/spatial/rest/areadetails', {}, {
                'get': {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            });
        },
        getAreasByFilter: function(){
            return $resource('/spatial/rest/areasbyfilter', {}, {
                'get': {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            });
        },
        getAreaProperties: function(){
            return $resource('/spatial/rest/areaproperties', {}, {
                'get': {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            });
        },
        getConfigsForReport: function(){
            return $resource('/spatial/rest/config/:id', {}, {
                'get': {
                    method: 'GET'
                }
            });
        },
        getConfigsForReportWithoutMap: function(){
            return $resource('/spatial/rest/config/report', {}, {
                'get': {
                    method: 'GET'
                }
            });
        },
        getSupportedProjections: function(){
            return $resource('/spatial/rest/config/projections', {}, {
                'get': {
                    method: 'GET'
                }
            });
        },
        getMapConfigurations: function(){
            return $resource('/spatial/rest/mapconfig/:id', {}, {
                'get': {
                    method: 'GET'
                }
            });
        },
        getUserDefinedAreas: function(){
          return $resource('/spatial/rest/userareaslist', {}, {
                'get': {
                    method: 'GET'
                }
            });  
        }
    };
})
.service('spatialRestService',function($q, spatialRestFactory) {
	var spatialRestService = {
	    getAreaLayers: function(){
	        var deferred = $q.defer();
	        spatialRestFactory.getAreaLayers().get({}, function(response){
                deferred.resolve(response);
            }, function(error){
                console.error('Error getting list of area layers');
                deferred.reject(error);
            });
            return deferred.promise;
	    },
        getUserAreaLayer: function(){
            var deferred = $q.defer();
            spatialRestFactory.getUserAreaLayer().get({}, function(response){
                deferred.resolve(response);
            }, function(error){
                console.error('Error getting list of area layers');
                deferred.reject(error);
            });
            return deferred.promise;
        },
	    getAreaDetails: function(data){
	        var deferred = $q.defer();
            spatialRestFactory.getAreaDetails().get(angular.toJson(data), function(response){
                deferred.resolve(response);
            }, function(error){
                console.log('Error getting area by location');
                deferred.reject(error);
            });
            return deferred.promise;
	    },
	    getAreasByFilter: function(data){
	        var deferred = $q.defer();
	        spatialRestFactory.getAreasByFilter().get(angular.toJson(data), function(response){
	            deferred.resolve(response);
	        }, function(error){
	            console.log('Error getting areas by search filter');
	            deferred.reject(error);
	        });
	        return deferred.promise;
	    },
	    getAreaProperties: function(data){
	        var deferred = $q.defer();
            spatialRestFactory.getAreaProperties().get(angular.toJson(data), function(response){
                deferred.resolve(response);
            }, function(error){
                console.log('Error getting area properties');
                deferred.reject(error);
            });

            return deferred.promise;
	    },
	    getConfigsForReport: function(id){
	        var deferred = $q.defer();
	        spatialRestFactory.getConfigsForReport().get({id: id}, function(response){
	            deferred.resolve(response.data);
	        }, function(error){
	            console.log('Error getting spatial configs for report');
	            deferred.reject(error);
	        });

	        return deferred.promise;
	    },
	    getConfigsForReportWithoutMap: function(){
            var deferred = $q.defer();
            spatialRestFactory.getConfigsForReportWithoutMap().get(function(response){
                deferred.resolve(response.data);
            }, function(error){
                console.log('Error getting spatial configs for report without map');
                deferred.reject(error);
            });

            return deferred.promise;
        },
        getSupportedProjections: function(){
            var deferred = $q.defer();
            spatialRestFactory.getSupportedProjections().get(function(response){
                deferred.resolve(response.data);
            }, function(error){
                console.log('Error getting supported projections');
                deferred.reject(error);
            });

            return deferred.promise;
        },
        getMapConfigurations: function(id){
            var deferred = $q.defer();
            spatialRestFactory.getMapConfigurations().get({id: id}, function(response){
                deferred.resolve(response.data);
            }, function(error){
                console.log('Error getting map configurations for report');
                deferred.reject(error);
            });

            return deferred.promise;
        },
        getUserDefinedAreas: function(){
            var deferred = $q.defer();
            spatialRestFactory.getUserDefinedAreas().get(function(response){
                deferred.resolve(response.data);
            }, function(error){
                console.log('Error getting user defined areas');
                deferred.reject(error);
            }); 

            return deferred.promise;
        }
	};

	return spatialRestService;
});
