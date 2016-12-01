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
        },
        getSysArea: function(){
            return $resource('/spatial/rest/servicelayer/layer/sysarea', {}, {
                'get': {
                    method: 'GET'
                }
            });
        },
        getUserArea: function(){
            return $resource('/spatial/rest/servicelayer/layer/userarea', {}, {
                'get': {
                    method: 'GET'
                }
            });
        },
        getAreaGroup: function(){
            return $resource('/spatial/rest/servicelayer/layer/AREAGROUP', {}, {
                'get': {
                    method: 'GET'
                }
            });
        },
        getBackground: function(){
            return $resource('/spatial/rest/servicelayer/layer/background', {}, {
                'get': {
                    method: 'GET'
                }
            });
        },
        getAdditionalCartography: function(){
            return $resource('/spatial/rest/servicelayer/layer/additional', {}, {
                'get': {
                    method: 'GET'
                }
            });
        },
        getPorts: function(){
            return $resource('/spatial/rest/servicelayer/layer/port', {}, {
                'get': {
                    method: 'GET'
                }
            });
        },
        getMapConfigsFromReport: function(){
            return $resource('/spatial/rest/config/fromreport', {}, {
                'get': {
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
	    getUserConfigs: function(settingsType,configModel,form,isReportConfig,merge,callback){
            var deferred = $q.defer();
            spatialConfigRestFactory.getUserConfigs().get(function(response){
                response.data.settingsType = settingsType;
                response.data.configModel = configModel;
                response.data.form = form;
                response.data.isReportConfig = isReportConfig;
                response.data.merge = merge;
                response.data.callback = callback;
                deferred.resolve(response.data);
            }, function(error){
                error.settingsType = settingsType;
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
        resetSettings: function(settingsSection,settingsType,configModel,configCopy,form){
            var deferred = $q.defer();
            spatialConfigRestFactory.resetSettings().reset(angular.toJson(settingsSection), function(response){
                response.data.settingsType = settingsType;
                response.data.configModel = configModel;
                response.data.configCopy = configCopy;
                response.data.form = form;
                deferred.resolve(response.data); 
            }, function(error){
                error.settingsType = settingsType;
                console.error('Error reseting settings to defaults');
                deferred.reject(error);
            });
            return deferred.promise;
        },
        getSysArea: function(){
        	var deferred = $q.defer();
        	spatialConfigRestFactory.getSysArea().get(function(response){
                deferred.resolve(response.data);
            }, function(error){
                console.log('Error getting system areas');
                deferred.reject(error);
            });

            return deferred.promise;
        },
        getUserArea: function(){
        	var deferred = $q.defer();
        	spatialConfigRestFactory.getUserArea().get(function(response){
                deferred.resolve(response.data);
            }, function(error){
                console.log('Error getting user areas');
                deferred.reject(error);
            });

            return deferred.promise;
        },
        getAreaGroup: function(){
        	var deferred = $q.defer();
        	spatialConfigRestFactory.getAreaGroup().get(function(response){
                deferred.resolve(response.data);
            }, function(error){
                console.log('Error getting user areas');
                deferred.reject(error);
            });

            return deferred.promise;
        },
        getBackground: function(){
        	var deferred = $q.defer();
        	spatialConfigRestFactory.getBackground().get(function(response){
                deferred.resolve(response.data);
            }, function(error){
                console.log('Error getting background');
                deferred.reject(error);
            });

            return deferred.promise;
        },
        getAdditionalCartography: function(){
        	var deferred = $q.defer();
        	spatialConfigRestFactory.getAdditionalCartography().get(function(response){
                deferred.resolve(response.data);
            }, function(error){
                console.log('Error getting additional cartography');
                deferred.reject(error);
            });

            return deferred.promise;
        },
        getPorts: function(){
        	var deferred = $q.defer();
        	spatialConfigRestFactory.getPorts().get(function(response){
                deferred.resolve(response.data);
            }, function(error){
                console.log('Error getting ports');
                deferred.reject(error);
            });

            return deferred.promise;
        },
        getMapConfigsFromReport: function(configs){
            var deferred = $q.defer();
            spatialConfigRestFactory.getMapConfigsFromReport().get(configs, function(response){
                deferred.resolve([response.data, configs]);
            }, function(error){
                console.error('Error getting user configurations');
                deferred.reject(error);
            });
            return deferred.promise;
        }
	};
	
	return spatialConfigRestService;
});
