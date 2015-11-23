angular.module('unionvmsWeb').factory('reportConfigRestFactory',function($resource) {

	return {
	    getCountriesList: function(){
	        return $resource('/spatial/rest/countries', {}, {
	            'get': {
	                method: 'GET'
	             }
	        });
	    }
	};
	
})
.service('reportConfigRestService', function($q, reportConfigRestFactory){

    var reportConfigRestService = {
    	getCountriesList: function(){
            var deferred = $q.defer();
            reportConfigRestFactory.getCountriesList().get(function(response){
                deferred.resolve(response);
            }, function(error){
                console.error('Error getting list of countries');
                deferred.reject(error);
            });
            return deferred.promise;
        }
    };
    
    return reportConfigRestService;
});