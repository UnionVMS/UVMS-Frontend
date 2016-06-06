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
        getUserAreaAsJSON: function(){
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
        },
        getLayerMetadata: function(){
            return $resource('/spatial/rest/servicelayer/:layer', {}, {
                'get': {
                    method: 'GET'
                }
            });
        },
        updateLayerMetadata: function(){
            return $resource('/spatial/rest/servicelayer/:id', {}, {
                'update': {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            });
        },
        getAreasByType: function(){
            return $resource('/spatial/rest/userareaslist/:type', {}, {
                'get': {
                    method: 'GET'
                }
            });
        },
        createDataset: function(){
            return $resource('/spatial/rest/area/datasets/:areaType/:areaGid/:datasetName', {}, {
                'create': {
                    method: 'POST'
                }
            });
        },
        getDatasets: function(){
            return $resource('/spatial/rest/area/datasets/:areaType/:areaGid', {}, {
                'get': {
                    method: 'GET'
                }
            });
        },
        getAttributesToMap: function(){
            return $resource('/spatial/rest/files/metadata', {}, {
                'get': {
                    method: 'POST',
                    transformRequest: function formDataObject(data) {
                    	  var fd = new FormData();
                    	  fd.append('uploadedFile', data.uploadedFile);
                    	  fd.append('areaType', data.areaType);
                    	   
                    	  return fd;
                	  },
                	  headers: {
			        	 enctype: "multipart/form-data",
			        	 'Content-Type': undefined,
			          }
                }
            });
        },
        uploadArea: function(){
            return $resource('/spatial/rest/files/upload/:areaType/:projection', {}, {
                'create': {
                    method: 'POST'
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
	    getUserAreaAsJSON: function(gid){
	        var deferred = $q.defer();
            var payload = {
                id: gid,
                isGeom: false
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
	    },
	    getLayerMetadata: function(layerName){
	        var deferred = $q.defer();
            areaRestFactory.getLayerMetadata().get({layer: layerName.toUpperCase()}, function(response){
                deferred.resolve(response.data);
            }, function(error){
                console.error('Error getting area metadata.');
                deferred.reject(error);
            });
            return deferred.promise;
	    },
	    updateLayerMetadata: function(data){
	        var id = data.id;
	        var payload = {
	            name: data.areaName,
	            layerDesc: data.areaDesc,
	            shortCopyright: data.shortCopy,
	            longCopyright: data.longCopy
	        };
	        
	        var deferred = $q.defer();
            areaRestFactory.updateLayerMetadata().update({id: id}, angular.toJson(payload), function(response){
                deferred.resolve(response.data);
            }, function(error){
                console.error('Error updating area metadata.');
                deferred.reject(error);
            });
            return deferred.promise;
	    },
	    getAreasByType: function(type){
	    	var deferred = $q.defer();
            areaRestFactory.getAreasByType().get({type: type.toUpperCase()}, function(response){
                deferred.resolve(response.data);
            }, function(error){
                console.error('Error getting area metadata.');
                deferred.reject(error);
            });
            return deferred.promise;
        },
        createDataset: function(dataset){
	        //So far we only suport saving features in WGS 84 so be sure to reproject features before calling this method
	        var deferred = $q.defer();
            areaRestFactory.createDataset().create(dataset, null, function(response){
                deferred.resolve(response.data);
            }, function(error){
                console.error('Error creating new dataset.');
                deferred.reject(error);
            });
            return deferred.promise;
	    },
	    getDatasets: function(dataset){
	        //So far we only suport saving features in WGS 84 so be sure to reproject features before calling this method
	        var deferred = $q.defer();
            areaRestFactory.getDatasets().get(dataset, function(response){
                deferred.resolve(response.data);
            }, function(error){
                console.error('Error creating new dataset.');
                deferred.reject(error);
            });
            return deferred.promise;
	    },
        getAttributesToMap: function(file){
            var deferred = $q.defer();
                areaRestFactory.getAttributesToMap().get(file, function(response){
                    deferred.resolve(response.data);
                }, function(error){
                    deferred.reject(error);
                });
            return deferred.promise;
        },
        uploadArea: function(file,areaType,projection){
            var deferred = $q.defer();
                areaRestFactory.uploadArea().create({'areaType': areaType, 'projection': projection},file, function(response){
                    deferred.resolve(response.data);
                }, function(error){
                    deferred.reject(error);
                });
            return deferred.promise;
        }
	};

	return areaRestService;
});