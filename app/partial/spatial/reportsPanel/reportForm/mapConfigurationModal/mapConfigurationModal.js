angular.module('unionvmsWeb').controller('MapconfigurationmodalCtrl', function ($scope, $timeout, locale, reportConfigs, $modalInstance, SpatialConfig, spatialRestService, spatialConfigAlertService, $anchorScroll, $location, spatialConfigRestService, loadingStatus) {
	$scope.isReportConfig = true;
	$scope.alert = spatialConfigAlertService;
	$scope.alert.hasAlert = false;
	$scope.alert.hasError = false;
	$scope.alert.hasSuccess = false;
	$scope.alert.hasWarning = false;
	$scope.loadedAllSettings = false;
	
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
        $scope.initialConfig = undefined;
    };

    $scope.save = function () {
    	if(_.keys($scope.mapConfigurationForm.$error).length > 0 || angular.isDefined($scope.configModel.mapSettings.displayProjectionId) && !angular.isDefined($scope.configModel.mapSettings.coordinatesFormat)){
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
    	var exported = {};
    	if($scope.mapConfigurationForm.$dirty){
    		exported.mapSettings = {};
    		if($scope.mapConfigurationForm.mapsettingsForm.$dirty){
    			exported.mapSettings.spatialConnectId = $scope.configModel.mapSettings.spatialConnectId;
    			exported.mapSettings.mapProjectionId = $scope.configModel.mapSettings.mapProjectionId;
    			exported.mapSettings.displayProjectionId = $scope.configModel.mapSettings.displayProjectionId;
    			exported.mapSettings.coordinatesFormat = $scope.configModel.mapSettings.coordinatesFormat;
    			exported.mapSettings.scaleBarUnits = $scope.configModel.mapSettings.scaleBarUnits;
    		}else if($scope.mapConfigurationForm.mapsettingsForm.$pristine && $scope.configModel.mapSettings.reseted){
    			exported.mapSettings.spatialConnectId = undefined;
    			exported.mapSettings.mapProjectionId = undefined;
    			exported.mapSettings.displayProjectionId = undefined;
    			exported.mapSettings.coordinatesFormat = undefined;
    			exported.mapSettings.scaleBarUnits = undefined;
    		}else{
    			exported.mapSettings.spatialConnectId = reportConfigs.mapConfiguration.spatialConnectId;
    			exported.mapSettings.mapProjectionId = reportConfigs.mapConfiguration.mapProjectionId;
    			exported.mapSettings.displayProjectionId = reportConfigs.mapConfiguration.displayProjectionId;
    			exported.mapSettings.coordinatesFormat = reportConfigs.mapConfiguration.coordinatesFormat;
    			exported.mapSettings.scaleBarUnits = reportConfigs.mapConfiguration.scaleBarUnits;
    		}
    		
    		if($scope.mapConfigurationForm.vmsstylesForm.$dirty){
    			exported.mapSettings.stylesSettings = $scope.checkStylesSettings();
    		}else{
    			exported.mapSettings.stylesSettings = $scope.configModel.stylesSettings.reseted ? undefined : reportConfigs.mapConfiguration.stylesSettings;
    		}
    		
    		if($scope.mapConfigurationForm.layersettingsForm.$dirty){
    			exported.mapSettings.layerSettings = $scope.configModel.layerSettings;
    		}else{
    			exported.mapSettings.layerSettings = $scope.configModel.layerSettings.reseted ? undefined : reportConfigs.mapConfiguration.layerSettings;
    		}
    		
    		if($scope.mapConfigurationForm.visibilitysettingsForm.$dirty){
    			exported.mapSettings.visibilitySettings = $scope.checkVisibilitySettings();
    		}else{
    			exported.mapSettings.visibilitySettings = $scope.configModel.visibilitySettings.reseted ? undefined : reportConfigs.mapConfiguration.visibilitySettings;
    		}
    		
    	}else if($scope.configModel.mapSettings.reseted || $scope.configModel.stylesSettings.reseted || $scope.configModel.layerSettings.reseted || $scope.configModel.visibilitySettings.reseted){
    		var exported = {};
    		exported.mapSettings = {};
    		angular.forEach(_.keys($scope.configModel.mapSettings), function(value, key) {
    			if(value === 'reseted' && $scope.configModel.mapSettings[value] === true){
    				exported.mapSettings.spatialConnectId = undefined;
        			exported.mapSettings.mapProjectionId = undefined;
        			exported.mapSettings.displayProjectionId = undefined;
        			exported.mapSettings.coordinatesFormat = undefined;
        			exported.mapSettings.scaleBarUnits = undefined;
    			}else if(angular.isDefined($scope.configModel.mapSettings[value]) && $scope.configModel.mapSettings[value].reseted === true){
    				exported.mapSettings[value] = undefined;
    			}
    		});
    	}else{
    		exported.mapSettings = reportConfigs.mapConfiguration;
    	}
    	
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
	    
	    if(angular.isDefined($scope.configModel.alarmStyle)){
            var alarmProperties = {};
            if($scope.mapConfigurationForm && $scope.mapConfigurationForm.vmsstylesForm.alarmsForm && $scope.mapConfigurationForm.vmsstylesForm.alarmsForm.$dirty){
            	alarmProperties.size = $scope.configModel.alarmStyle.size;
    			for (var i = 0; i < $scope.configModel.alarmStyle.style.length; i++){
    				alarmProperties[$scope.configModel.alarmStyle.style[i].id] = $scope.configModel.alarmStyle.style[i].color;
                }
	            $scope.configModel.stylesSettings.alarms = alarmProperties;
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
		    		
		    		if(visibilityCurrentSettings.values){
		    			$scope.sortArray(visibilityCurrentSettings.values);
		    		}
		    		
		    		if(angular.isDefined(visibilityCurrentSettings.values)){
			    		for(var j = 0; j < visibilities.order.length; j++){
		    				if(visibilityCurrentSettings.values.indexOf(visibilities.order[j]) !== -1){
		    					visibilities.values.push(visibilities.order[j]);
		    				}
			    		}
			    		visibilities.isAttributeVisible = visibilityCurrentSettings.isAttributeVisible;
			    		angular.copy(visibilities,visibilityCurrentSettings);
		    		}
	    		}
	    		delete visibilitySettings[visibType + contentType + 'Attrs'];
		    });
	    });
	    
        return $scope.configModel.visibilitySettings;
    };
    
    var mergePreferences = function(){
    	if(!angular.isDefined($scope.initialConfig) || _.isEmpty($scope.initialConfig)){
    		$scope.configModel = {};
    		angular.copy($scope.userConfig, $scope.configModel);
    	}
    	if(!angular.isDefined($scope.initialConfig.stylesSettings) || _.isEmpty($scope.initialConfig.stylesSettings)){
    		$scope.configModel.stylesSettings = {};
    		angular.copy($scope.userConfig.stylesSettings, $scope.configModel.stylesSettings);
    	}else{
    		if(!angular.isDefined($scope.initialConfig.stylesSettings.positions) || _.isEmpty($scope.initialConfig.stylesSettings.positions) || !angular.isDefined($scope.initialConfig.stylesSettings.positions.attribute)){
    			$scope.configModel.stylesSettings.positions = {};
        		angular.copy($scope.userConfig.stylesSettings.positions, $scope.configModel.stylesSettings.positions);
    		}
    		if(!angular.isDefined($scope.initialConfig.stylesSettings.segments) || _.isEmpty($scope.initialConfig.stylesSettings.segments) || !angular.isDefined($scope.initialConfig.stylesSettings.segments.attribute)){
    			$scope.configModel.stylesSettings.segments = {};
        		angular.copy($scope.userConfig.stylesSettings.segments, $scope.configModel.stylesSettings.segments);
    		}
    		if(!angular.isDefined($scope.initialConfig.stylesSettings.alarms) || _.isEmpty($scope.initialConfig.stylesSettings.alarms)){
    			$scope.configModel.stylesSettings.alarms = {};
        		angular.copy($scope.userConfig.stylesSettings.alarms, $scope.configModel.stylesSettings.alarms);
    		}
    	}
    	
    	if(!angular.isDefined($scope.initialConfig.layerSettings) || _.isEmpty($scope.initialConfig.layerSettings) || ((!angular.isDefined($scope.initialConfig.layerSettings.portLayers) || _.isEmpty($scope.initialConfig.layerSettings.portLayers)) &&
    			(!angular.isDefined($scope.initialConfig.layerSettings.areaLayers) || _.isEmpty($scope.initialConfig.layerSettings.areaLayers)) &&
    			(!angular.isDefined($scope.initialConfig.layerSettings.baseLayers) || _.isEmpty($scope.initialConfig.layerSettings.baseLayers)) &&
    			(!angular.isDefined($scope.initialConfig.layerSettings.additionalLayers) || _.isEmpty($scope.initialConfig.layerSettings.additionalLayers)))){
    		$scope.configModel.layerSettings = {};
    		angular.copy($scope.userConfig.layerSettings, $scope.configModel.layerSettings);
    	}
    	if(!angular.isDefined($scope.initialConfig.mapProjectionId) && 
    			!angular.isDefined($scope.initialConfig.displayProjectionId) && !angular.isDefined($scope.initialConfig.coordinatesFormat) && 
    			!angular.isDefined($scope.initialConfig.scaleBarUnits)){
    		$scope.configModel.mapSettings = {};
    		angular.copy($scope.userConfig.mapSettings, $scope.configModel.mapSettings);
    	}
    	if(!angular.isDefined($scope.initialConfig.visibilitySettings) || _.isEmpty($scope.initialConfig.visibilitySettings)){
    		$scope.configModel.visibilitySettings = {};
    		angular.copy($scope.userConfig.visibilitySettings, $scope.configModel.visibilitySettings);
    	}
    };
    
    var getConfigsSuccess = function(response){
	    $scope.srcConfigObj = response;
	    var model = new SpatialConfig();
        $scope.userConfig = model.forUserPrefFromJson(response);
        mergePreferences();
        $scope.loadedAllSettings = true;
        loadingStatus.isLoading('Preferences',false);
	};
	
	var getConfigsFailure = function(error){
	    $anchorScroll();
	    $scope.alert.hasAlert = true;
	    $scope.alert.hasError = true;
	    $scope.alert.alertMessage = locale.getString('spatial.user_preferences_error_getting_configs');
	    $scope.alert.hideAlert();
	    loadingStatus.isLoading('Preferences',false);
	};
	
	$scope.sortArray = function(data){
        var temp = _.clone(data);
        temp.sort();
        
        return temp;
    };
    
    var init = function(){
    	loadingStatus.isLoading('Preferences',true);
    	$scope.configModel = new SpatialConfig();
    	$scope.initialConfig = reportConfigs.mapConfiguration;
        if (!angular.equals({}, reportConfigs.mapConfiguration)){
        	$scope.configModel = $scope.configModel.forReportConfigFromJson(reportConfigs);
        } else {
            $scope.configModel = $scope.configModel.forReportConfig();
        } 
    	
    	if(!angular.isDefined($scope.initialConfig) || !angular.isDefined($scope.initialConfig.stylesSettings) || !angular.isDefined($scope.initialConfig.layerSettings) ||
    		!angular.isDefined($scope.initialConfig.visibilitySettings) || !angular.isDefined($scope.initialConfig.spatialConnectId) ||
    		!angular.isDefined($scope.initialConfig.mapProjectionId) || !angular.isDefined($scope.initialConfig.displayProjectionId) ||
    		!angular.isDefined($scope.initialConfig.coordinatesFormat) || !angular.isDefined($scope.initialConfig.scaleBarUnits)){
    		spatialConfigRestService.getUserConfigs().then(getConfigsSuccess, getConfigsFailure);
    	}else{
    		$scope.loadedAllSettings = true;
    		loadingStatus.isLoading('Preferences',false);
    	}
    	
    };
    
    init();
});
