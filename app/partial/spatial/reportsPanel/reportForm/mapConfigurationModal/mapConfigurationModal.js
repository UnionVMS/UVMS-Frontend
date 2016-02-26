angular.module('unionvmsWeb').controller('MapconfigurationmodalCtrl', function ($scope, $timeout, locale, reportConfigs, $modalInstance, SpatialConfig, spatialRestService, spatialConfigAlertService, $anchorScroll, $location) {
	$scope.isReportConfig = true;
	$scope.alert = spatialConfigAlertService;
	$scope.loadedAllSettings = false;
	
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
        $scope.initialConfig = undefined;
    };

    $scope.save = function () {
    	if(_.keys($scope.mapConfigurationForm.$error).length > 0 || angular.isDefined($scope.configModel.mapSettings.displayProjectionId) && !angular.isDefined($scope.configModel.mapSettings.coordinatesFormat)){
//        if (angular.isDefined($scope.configModel.mapSettings.displayProjectionId) && !angular.isDefined($scope.configModel.mapSettings.coordinatesFormat)){
    		$location.hash('mapConfigurationModal');
    		$anchorScroll();
    		$location.hash('');
    		$anchorScroll();
		    $scope.alert.hasAlert = true;
		    $scope.alert.hasError = true;
		    $scope.alert.alertMessage = locale.getString('spatial.invalid_data_saving');
		    $scope.alert.hideAlert();
		    $scope.submitedWithErrors = true;
		    
            return false;
        } else {
            $modalInstance.close($scope.exportMapConfiguration());
            $scope.initialConfig = undefined;
        }
    };

    $scope.exportMapConfiguration = function () {
        var exported = {
        	mapSettings: {
	            spatialConnectId: angular.isDefined($scope.configModel.mapSettings.spatialConnectId) ? $scope.configModel.mapSettings.spatialConnectId : undefined,
	            mapProjectionId: $scope.configModel.mapSettings.mapProjectionId,
	            displayProjectionId: $scope.configModel.mapSettings.displayProjectionId,
	            coordinatesFormat: $scope.configModel.mapSettings.coordinatesFormat,
	            scaleBarUnits: $scope.configModel.mapSettings.scaleBarUnits
        	},
        	stylesSettings: $scope.checkStylesSettings(),
            visibilitySettings: $scope.checkVisibilitySettings(),
            layerSettings: $scope.configModel.layerSettings
        };
        
        return exported;
    };
    
    $scope.checkStylesSettings = function() {
    	if (angular.isDefined($scope.configModel.positionStyle)){
	    	var positionProperties = {};
	    	positionProperties.attribute = $scope.configModel.positionStyle.attribute;
	    	positionProperties.style = {};
            
            if($scope.mapConfigurationForm && $scope.mapConfigurationForm.vmsstylesForm.positionsForm && $scope.mapConfigurationForm.vmsstylesForm.positionsForm.$dirty){
	            switch (positionProperties.attribute) {
					case "reportedSpeed":
					case "calculatedSpeed":
					case "reportedCourse":
						angular.forEach($scope.configModel.positionStyle.style, function(item){
							positionProperties.style[item.propertyFrom + "-" + item.propertyTo] = item.color;
		                });
						positionProperties.style["default"] = $scope.configModel.positionStyle.defaultColor;
						break;
					case "countryCode":
						angular.forEach($scope.configModel.positionStyle.style, function(item){
							positionProperties.style[item.code] = item.color;
		                });
						break;
					case "activity":
					case "type":
						angular.forEach($scope.configModel.positionStyle.style, function(item){
							positionProperties.style[item.code] = item.color;
		                });
						positionProperties.style["default"] = $scope.configModel.positionStyle.defaultColor;
						break;
					default:
						break;
				}
	            $scope.configModel.stylesSettings.positions = positionProperties;
            }
	    }
	    
	    if(angular.isDefined($scope.configModel.segmentStyle)){
            var segmentProperties = {};
            segmentProperties.attribute = $scope.configModel.segmentStyle.attribute;
            segmentProperties.style = {};
            
            if($scope.mapConfigurationForm && $scope.mapConfigurationForm.vmsstylesForm.segmentsForm && $scope.mapConfigurationForm.vmsstylesForm.segmentsForm.$dirty){
            	segmentProperties.style.lineStyle = $scope.configModel.segmentStyle.lineStyle;
            	segmentProperties.style.lineWidth = "" + $scope.configModel.segmentStyle.lineWidth;
	            switch (segmentProperties.attribute) {
					case "speedOverGround":
					case "distance":
					case "duration":
					case "courseOverGround":
						angular.forEach($scope.configModel.segmentStyle.style, function(item){
		                    segmentProperties.style[item.propertyFrom + "-" + item.propertyTo] = item.color;
		                });
		                segmentProperties.style["default"] = $scope.configModel.segmentStyle.defaultColor;
						break;
					case "countryCode":
						angular.forEach($scope.configModel.segmentStyle.style, function(item){
		                    segmentProperties.style[item.code] = item.color;
		                });
						break;
					case "segmentCategory":
						angular.forEach($scope.configModel.segmentStyle.style, function(item){
		                    segmentProperties.style[item.code] = item.color;
		                });
						segmentProperties.style["default"] = $scope.configModel.segmentStyle.defaultColor;
						break;
					default:
						break;
				}
	            $scope.configModel.stylesSettings.segments = segmentProperties;
            }
        }
	    return $scope.configModel.stylesSettings;
    };
    
    $scope.checkVisibilitySettings = function(){
	    var visibilitySettings = $scope.configModel.visibilitySettings;
	    var visibilityTypes = ['position','segment','track'];
	    var contentTypes = ['Table','Popup','Label'];
	    
	    angular.forEach(visibilityTypes, function(visibType) {
	    	angular.forEach(contentTypes, function(contentType) {
	    		if(visibType !== 'track' || visibType === 'track' && contentType === 'Table'){
		    		var visibilities = {};
		    		visibilities.values = [];
		    		visibilities.order = [];
		    		var visibilityCurrentSettings = visibilitySettings[visibType + 's'][contentType.toLowerCase() === 'label' ? contentType.toLowerCase() + 's' : contentType.toLowerCase()];
		    		var visibilityCurrentAttrs = visibilitySettings[visibType + contentType + 'Attrs'];
		    		var content;
		    		for(var i = 0; i < visibilityCurrentAttrs.length; i++){
	    	    		visibilities.order.push(visibilityCurrentAttrs[i].value);
		    		}
		    		
		    		if(angular.isDefined(visibilityCurrentSettings.values)){
			    		for(var j = 0; j < visibilities.order.length; j++){
		    				if(visibilityCurrentSettings.values.indexOf(visibilities.order[j]) !== -1){
		    					visibilities.values.push(visibilities.order[j]);
		    				}
			    		}
			    		angular.copy(visibilities,visibilityCurrentSettings);
		    		}
	    		}
	    		delete visibilitySettings[visibType + contentType + 'Attrs'];
		    });
	    });
	    
        return $scope.configModel.visibilitySettings;
    };
    
    $modalInstance.rendered.then(function () {
        $scope.configModel = new SpatialConfig();
        if (!angular.equals({}, reportConfigs)){
            $scope.initialConfig = $scope.configModel.forReportConfigFromJson(reportConfigs);
            angular.copy($scope.initialConfig, $scope.configModel);
        } else {
            $scope.configModel = $scope.configModel.forReportConfig();
        } 
        $scope.loadedAllSettings = true;
    });
});
