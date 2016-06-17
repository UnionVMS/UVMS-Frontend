angular.module('unionvmsWeb').factory('mapFishPrintRestFactory', function($resource) {

    var appName = "/mapfish-print/";
    var mapFishUrl =  appName + 'print';

    return {
        ping: function(){
            return $resource(appName + 'metrics/ping', {}, {
                'get': {
                    method: 'GET'
                }
            });
        },
        getTemplates: function(){
            return $resource(mapFishUrl + '/apps.json', {}, {
                'get': {
                    isArray: true,
                    method: 'GET'
                }
            });
        },
        getCapabilities: function(){
            return $resource(mapFishUrl + '/:appId/capabilities.json', {}, {
                'get': {
                    method: 'GET'
                }
            });
        },
        createPrintJob: function(){
            return $resource(mapFishUrl + '/:appId/report.:format', {}, {
                'get': {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            });
        },
        getPrintJobStatus: function(){
            return $resource(mapFishUrl + '/status/:referenceId' + '.json', {}, {
                'get': {
                    method: 'GET'
                }
            });
        },
        cancelPrintJob: function(){
            return $resource(mapFishUrl + '/cancel/:referenceId', {}, {
                'get': {
                    method: 'DELETE'
                }
            });
        },
        getIconAndLegends: function(){
            return $resource('/spatial/rest/image', {}, {
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
.factory('mapFishPrintRestService',function($q, mapFishPrintRestFactory, $log, MapFish) {

    return {
        ping: function() {
            var deferred = $q.defer();
            mapFishPrintRestFactory.ping().get(function(response) {
                deferred.resolve(response);
            }, function (error) {
                $log.log('Mapfish not deployed');
                deferred.reject(error);
            });
            return deferred.promise;
        },
        getTemplates: function() {
            var deferred = $q.defer();
            mapFishPrintRestFactory.getTemplates().get(function(response) {
                deferred.resolve(response);
            }, function (error) {
                $log.log('Error getting mapfish templates');
                deferred.reject(error);
            });
            return deferred.promise;
        },
        getCapabilities: function(appId) {
            var deferred = $q.defer();
            mapFishPrintRestFactory.getCapabilities().get({appId: appId}, function(response) {
                deferred.resolve(response);
            }, function (error) {
                $log.log('Error getting ' + appId + ' mapfish capabilities');
                deferred.reject(error);
            });
            return deferred.promise;
        },
        createPrintJob: function(appId, format, data) {
            var deferred = $q.defer();
            mapFishPrintRestFactory.createPrintJob().get({appId: appId, format: format}, angular.toJson(data), function(response) {
                deferred.resolve(response);
            }, function (error) {
                $log.log('Error creating print job ' + appId);
                deferred.reject(error);
            });
            return deferred.promise;
        },
        getPrintJobStatus: function(referenceId) {
            var deferred = $q.defer();
            mapFishPrintRestFactory.getPrintJobStatus().get({referenceId: referenceId}, function(response) {
                deferred.resolve(response);
            }, function (error) {
                $log.log('Error getting print job status ' + referenceId);
                deferred.reject(error);
            });
            return deferred.promise;
        },
        cancelPrintJob: function(referenceId) {
            var deferred = $q.defer();
            mapFishPrintRestFactory.cancelPrintJob().get({referenceId: referenceId}, function(response) {
                deferred.resolve(response);
            }, function (error) {
                $log.log('Error getting print job status ' + referenceId);
                deferred.reject(error);
            });
            return deferred.promise;
        },
        getIconAndLegends: function(data){
            var deferred = $q.defer();
            mapFishPrintRestFactory.getIconAndLegends().get(angular.toJson(data), function(response){
                deferred.resolve(response.data);
            }, function(error){
                console.log('Error getting icons and legends ids.');
                deferred.reject(error);
            });

            return deferred.promise;
        }
    };
});

