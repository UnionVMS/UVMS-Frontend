angular.module('unionvmsWeb').factory('areaRestFactory', function($resource){
    return {
        createArea: function(){
            return $resource('/spatial/rest/userarea', {}, {
                'save': {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            });
        }
    };
})
.service('areaRestService',function($q, areaRestFactory) {

	var areaRestService = {
	    createArea: function(geoJsonFeature){
	        //So far ww only suport saving features in WGS 84 so be sure to reproject features before calling this method
	        var deferred = $q.defer();
            areaRestFactory.createArea().save(geoJsonFeature, function(response){
                deferred.resolve(response.data);
            }, function(error){
                console.error('Error saving new user area.');
                deferred.reject(error);
            });
            return deferred.promise;
	    }
	};

	return areaRestService;
});