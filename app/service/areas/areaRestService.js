angular.module('unionvmsWeb').factory('areaRestFactory', function($resource){
    return {
        getUserAreaTypes: function(){
            return $resource('/spatial/rest/userareatypes', {}, {
                'get': {
                    method: 'GET'
                }
            });
        },
        getUserAreaAsGeoJSON: function(){
            return $resource('/spatial/rest/userareadetails', {}, {
                'get': {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            });
        },
        createUserArea: function(){
            return $resource('/spatial/rest/userarea', {}, {
                'save': {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            });
        },
        updateUserArea: function(){
            return $resource('/spatial/rest/userarea', {}, {
                'update': {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            });
        },
        deleteUserArea: function(){
            return $resource('/spatial/rest/userarea/:id', {}, {
                'delete': {
                    method: 'DELETE'
                }
            });
        }
    };
})
.service('areaRestService',function($q, areaRestFactory) {
	var areaRestService = {
	    getUserAreaTypes: function(){
	        var deferred = $q.defer();
	        areaRestFactory.getUserAreaTypes().get(function(response){
	            deferred.resolve(response.data);
	        }, function(error){
	            console.error('Error getting list of user area types.');
                deferred.reject(error);
	        });
	        return deferred.promise;
	    },
	    getUserAreaAsGeoJSON: function(gid){
	        var deferred = $q.defer();
	        var payload = {
	            id: gid,
	            isGeom: true
	        };
            areaRestFactory.getUserAreaAsGeoJSON().get(angular.toJson(payload), function(response){
                deferred.resolve(response.data);
            }, function(error){
                console.error('Error getting user area details.');
                deferred.reject(error);
            });
            return deferred.promise;
	    },
	    createUserArea: function(geoJsonFeature){
	        //So far we only suport saving features in WGS 84 so be sure to reproject features before calling this method
	        var deferred = $q.defer();
            areaRestFactory.createUserArea().save(geoJsonFeature, function(response){
                deferred.resolve(response.data);
            }, function(error){
                console.error('Error saving new user area.');
                deferred.reject(error);
            });
            return deferred.promise;
	    },
	    updateUserArea: function(geoJsonFeature){
	        var deferred = $q.defer();
	        areaRestFactory.updateUserArea().update(geoJsonFeature, function(response){
	            deferred.resolve(response);
	        }, function(error){
	            console.error('Error updating user area.');
                deferred.reject(error);
	        });
	        return deferred.promise;
	    },
	    deleteUserArea: function(areaId, areaIdx){
	        var deferred = $q.defer();
	        areaRestFactory.deleteUserArea().delete({id: areaId}, function(response){
	            response.index = areaIdx;
	            deferred.resolve(response);
	        }, function(error){
	            console.error('Error deleting user area.');
                deferred.reject(error);
	        });
	        return deferred.promise;
	    }
	};

	return areaRestService;
});