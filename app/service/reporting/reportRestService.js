angular.module('unionvmsWeb').factory('reportRestFactory', function($resource, $q, restConstants) {
    
    var baseUrl = restConstants.baseUrl;
	return {
	    //FIXME remove mock data and set proper requests
	    getReportsList: function(){
	        //return $resource(baseUrl +'/reporting/rest/report/list');
	        return $resource(baseUrl + '/app/test_data/reports.json');
	    },
	    getReport: function(){
	        return $resource(baseUrl +'/reporting/rest/report/:id');
	    },
	    deleteReport: function(){
	        return $resource(baseUrl +'/reporting/rest/report/:id', {}, {
	            'delete': {method: 'DELETE'}
	        });
	    },
	    updateReport: function(){
	        return $resource(baseUrl +'/reporting/rest/report/:id', {}, {
                'update': {method: 'PUT'}
            });
	    },
	    createReport: function(){
	        return $resource(baseUrl + '/reporting/rest/report/', {}, {
                'create': {method: 'POST'}
            });
	    }
	};
})
.service('reportRestService', function($q, reportRestFactory){
    
    var reportRestService = {
        getReportsList: function(){
            var deferred = $q.defer();
            reportRestFactory.getReportsList().get({}, function(response){
                if (response.code !== 200){
                    deferred.reject('Invalid response status');
                    return;
                }
                deferred.resolve(response.data);
            }, function(error){
                console.error('Error getting list of reports');
                deferred.reject(error);
            });
            return deferred.promise;
        }
    };
    
    return reportRestService;
});