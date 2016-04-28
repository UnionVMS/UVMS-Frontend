angular.module('unionvmsWeb').factory('mapAlarmsService',function(mapService, $resource, $q) {
    var requestRecords = [];
    
    //Preparing data to request alarms
    var getPositionsData = function(){
        var mapExtent = mapService.map.getView().calculateExtent(mapService.map.getSize());
        var layer = mapService.getLayerByType('vmspos');
        
        requestRecords = [];
        if (angular.isDefined(layer)){
            var src = layer.getSource();
            var features = src.getFeaturesInExtent(mapExtent);
            loopClusterFeatures(features);
        }
        
        return requestRecords;
    };
    
    
    var loopClusterFeatures = function(features){
        angular.forEach(features, function(clusterFeature) {
            var featuresInCluster = clusterFeature.get('features');
            if (angular.isDefined(featuresInCluster)){
                if (featuresInCluster.length > 1){
                    loopClusterFeatures(featuresInCluster);
                } else {
                    requestRecords.push(getFeatureDetails(featuresInCluster[0]));
                }
            } else {
                requestRecords.push(getFeatureDetails(clusterFeature));
            }
        });
    };
    
    var getFeatureDetails = function(feat){
        var coords = feat.getGeometry().getCoordinates();
        var rec = {
           id: feat.get('movementGuid'),
           x: coords[0],
           y: coords[1]
        };
        
        return rec;
    };
    
    //Request resource
    var getResource = function(){
        return $resource('/reporting/rest/alarms', {}, {
            'get': {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        });
    };
    
    //Do the actual request
    var requestAlarms = function(records){
        var deferred = $q.defer();
        var resource = getResource();
        var payload = {
            movements: records
        };
        resource.get(angular.toJson(payload), function(response){
            deferred.resolve(response);
        }, function(error){
            deferred.reject(error);
        });
        
        return deferred.promise;
    };
    
	var mapAlarmsService = {
	    prepareDataForRequest: getPositionsData,
	    getAlarms: requestAlarms
	};

	return mapAlarmsService;
});