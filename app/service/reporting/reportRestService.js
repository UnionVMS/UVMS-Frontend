angular.module('unionvmsWeb').factory('reportRestFactory', function($resource) {
    
	return {
	    getReportsList: function(){
	        return $resource('/reporting/rest/report/list', {}, {
	            'get': {
	                method: 'GET',
	                headers: {
	                    'scopeName': 'EC'
	                }
	             }
	        });
	    },
	    getReport: function(){
	        return $resource('/reporting/rest/report/:id', {}, {
	            'get': {
	                method: 'GET',
	                headers: {
	                    'scopeName': 'EC'
	                }
	            }
	        });
	    },
	    deleteReport: function(){
	        return $resource('/reporting/rest/report/:id', {}, {
	            'delete': {
	                method: 'DELETE',
	                headers: {
                        'scopeName': 'EC'
                    }
	             }
	        });
	    },
	    updateReport: function(){
	        return $resource('/reporting/rest/report/:id', {}, {
                'update': {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'scopeName': 'EC'
                    }
                }
            });
	    },
	    createReport: function(){
	        return $resource('/reporting/rest/report', {}, {
                'create': {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'scopeName': 'EC'
                    }
                }
            });
	    },
	    getVmsData: function(){
	        return $resource('/reporting/rest/vms/mock/:id', {}, {
	            'get': {
	                method: 'GET',
	                headers: {
                        'scopeName': 'EC'
                    }
	             }
	        });
	    }
	};
})
.service('reportRestService', function($q, reportRestFactory){

    var reportRestService = {
        getReportsList: function(){
            var deferred = $q.defer();
            reportRestFactory.getReportsList().get(function(response){
                deferred.resolve(response);
            }, function(error){
                console.error('Error getting list of reports');
                deferred.reject(error);
            });
            return deferred.promise;
        },
        getReport: function(reportId){
            var deferred = $q.defer();
            reportRestFactory.getReport().get({id: reportId}, function(response){
                deferred.resolve(response.data);
            }, function(error){
                deferred.reject(error);
            });
            return deferred.promise;
        },
        deleteReport: function(reportId, reportIdx){
            var deferred = $q.defer();
            reportRestFactory.deleteReport().delete({id: reportId}, function(response){
                response.index = reportIdx;
                deferred.resolve(response);
            }, function(error){
                deferred.reject(error.data);
            });
            return deferred.promise;
        },
        updateReport: function(report){
            var deferred = $q.defer();
            reportRestFactory.updateReport().update({id: report.id}, report.toJson(), function(response){
                deferred.resolve(response);
            }, function(error){
                deferred.reject(error);
            });
            return deferred.promise;
        },
        createReport: function(report){
            var deferred = $q.defer();
            reportRestFactory.createReport().create(report.toJson(), function(response){
                deferred.resolve(response);
            }, function(error){
                deferred.reject(error);
            });
            return deferred.promise;
        },
        getVmsData: function(reportId){
            var deferred = $q.defer();
            reportRestFactory.getVmsData().get({id: reportId}, function(response){
                deferred.resolve(response.data);
            }, function(error){
                deferred.reject(error);
            });
            return deferred.promise;
        }
    };
    
    return reportRestService;
});