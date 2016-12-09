/*
Developed with the contribution of the European Commission - Directorate General for Maritime Affairs and Fisheries
© European Union, 2015-2016.

This file is part of the Integrated Fisheries Data Management (IFDM) Suite. The IFDM Suite is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as published by the
Free Software Foundation, either version 3 of the License, or any later version. The IFDM Suite is distributed in
the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. You should have received a
copy of the GNU General Public License along with the IFDM Suite. If not, see <http://www.gnu.org/licenses/>.
*/
angular.module('unionvmsWeb').factory('reportRestFactory', function($resource) {
    
	return {
	    getReportsList: function(){
	        return $resource('/reporting/rest/report/list', {}, {
	            'get': {
	                method: 'GET'
	             }
	        });
	    },
	    getReport: function(){
	        return $resource('/reporting/rest/report/:id', {}, {
	            'get': {
	                method: 'GET'
	            }
	        });
	    },
	    deleteReport: function(){
	        return $resource('/reporting/rest/report/:id', {}, {
	            'delete': {
	                method: 'DELETE'
	             }
	        });
	    },
	    updateReport: function(){
	        return $resource('/reporting/rest/report/:id', {}, {
                'update': {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            });
	    },
	    createReport: function(){
	        return $resource('/reporting/rest/report', {}, {
                'create': {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            });
	    },
	    executeReport: function(){
	        return $resource('/reporting/rest/report/execute/:id', {}, {
	           'get': {
	               method: 'POST',
	               headers: {
	                   'Content-Type': 'application/json'
	               }
	           } 
	        });
	    },
        shareReport: function(){
            return $resource('/reporting/rest/report/share/:id/:visibility', {}, {
               'put': {
                   method: 'PUT',
                   headers: {
                        'Content-Type': 'application/json'
                    }
               } 
            });
        },
		executeWithoutSaving: function(){
	        return $resource('/reporting/rest/report/execute/', {}, {
	           'get': {
	               method: 'POST',
	               headers: {
	                   'Content-Type': 'application/json'
	               }
	           } 
	        });
	    },
	    setDefaultReport: function(){
	        return $resource('/reporting/rest/report/default/:id', {}, {
	            'set': {
	                method: 'POST',
	                headers: {
	                    'Content-Type': 'application/json'
	                }
	            }
	        });
	    },
        getLastExecuted: function(){
            return $resource('/reporting/rest/report/list/lastexecuted/:nrReports', {}, {
	            'get': {
	                method: 'GET',
	                headers: {
	                    'Content-Type': 'application/json'
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

                response.data.filterExpression.fa = {
                    reportType: ['NOTIFICATION'],
                    activityType: ['DEPARTURE','LANDING'],
                    master: 'rep_power',
                    port: 'PORT1',
                    gear: 'GNS',
                    weight: {
                        min: 2,
                        unit: 'kg'
                    }
                };

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
            var args;
            if(report.copy){
            	args = report.toJsonCopy();
            }else{
            	args = report.toJson();
            }
            reportRestFactory.createReport().create(args, function(response){
                deferred.resolve(response);
            }, function(error){
                deferred.reject(error);
            });
            return deferred.promise;
        },
        executeReport: function(id, config){
            var deferred = $q.defer();
            reportRestFactory.executeReport().get({id: id}, angular.toJson(config), function(response){
                deferred.resolve(response.data);
            }, function(error){
                deferred.reject(error);
            });
            
            return deferred.promise;
        },
        shareReport: function(id, visibility, reportIdx){
            var deferred = $q.defer();
            reportRestFactory.shareReport().put({id: id, visibility: visibility}, {}, function(response){
                response.reportIdx = reportIdx;
                response.visibility = visibility;
                deferred.resolve(response);
            }, function(error){
                deferred.reject(error);
            });
            return deferred.promise;
        },
        executeWithoutSaving: function(config){
            var deferred = $q.defer();
            reportRestFactory.executeWithoutSaving().get(config.toJsonCopy(), function(response){
                deferred.resolve(response.data);
            }, function(error){
                deferred.reject(error);
            });
            
            return deferred.promise;
        },
        setDefaultReport: function(id, override){
            var deferred = $q.defer();
            var payload = {
                override: override
            };
            reportRestFactory.setDefaultReport().set({id: id}, angular.toJson(payload), function(response){
                response.defaultId = id;
                deferred.resolve(response);
            }, function(error){
                deferred.reject(error);
            });
            return deferred.promise;
        },
        getLastExecuted: function(nrReports){
            var deferred = $q.defer();
            reportRestFactory.getLastExecuted().get({nrReports: nrReports}, {}, function(response){
                deferred.resolve(response);
            }, function(error){
                deferred.reject(error);
            });
            return deferred.promise;
        }
    };
    return reportRestService;
});