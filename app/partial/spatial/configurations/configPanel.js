angular.module('unionvmsWeb').controller('ConfigpanelCtrl',function($scope, $anchorScroll, locale, SpatialConfig, spatialConfigRestService, spatialConfigAlertService){
    $scope.isUserPreference = true;
	$scope.isConfigVisible= false;
	$scope.alert = spatialConfigAlertService;
	$scope.loadedAllSettings = false;
	$scope.isAdminConfig = false;
	
	$scope.toggleUserPreferences = function(){
		$scope.isConfigVisible = !$scope.isConfigVisible;
		$anchorScroll();

		//Call function from parent to toggle menu visibility
		$scope.toggleMenuVisibility();

		if($scope.isConfigVisible === false){
			$scope.$emit('closeUserPreferences', $scope.previousSelection);
		}
	};

	$scope.$on('loadUserPreferences', function(serviceName, previousSelection){
		$scope.toggleUserPreferences();
		$scope.previousSelection = previousSelection;
		if (!angular.isDefined($scope.configModel)){
		    spatialConfigRestService.getUserConfigs().then(getConfigsSuccess, getConfigsFailure);
		}
	});
	
	$scope.cancel = function(){
	    $scope.toggleUserPreferences();
	};
	
	
	$scope.save = function(){
		if(_.keys($scope.configPanelForm.$error).length === 0){
		    var newConfig = new SpatialConfig();
		    newConfig = newConfig.forUserPrefToServer();
		    
		    newConfig = $scope.checkMapSettings(newConfig);
		    newConfig = $scope.checkStylesSettings(newConfig);
		    newConfig = $scope.checkVisibilitySettings(newConfig);
		    newConfig = $scope.checkLayerSettings(newConfig);
		    
		    console.log(newConfig);
		    newConfig = angular.toJson(newConfig);
		    
		    if (!angular.equals('{}', newConfig)){
		        spatialConfigRestService.saveUserConfigs(newConfig).then(saveSuccess, saveFailure);  
		    } else {
		        $anchorScroll();
		        $scope.alert.hasAlert = true;
		        $scope.alert.hasWarning = true;
		        $scope.alert.alertMessage = locale.getString('spatial.user_preferences_warning_saving');
		        $scope.alert.hideAlert();
		    }
		}else{
		    $anchorScroll();
		    $scope.alert.hasAlert = true;
		    $scope.alert.hasError = true;
		    $scope.alert.alertMessage = locale.getString('spatial.invalid_data_saving');
		    $scope.alert.hideAlert();
		    $scope.submitedWithErrors = true;
		}
	};
	
	$scope.checkMapSettings = function(config){
	    if (!_.isEqual($scope.configModel.mapSettings, $scope.configCopy.mapSettings)){
	        config.mapSettings = $scope.configModel.mapSettings;
        } else {
            config.mapSettings = undefined;
        }
	    
	    return config;
	};
	
	$scope.checkStylesSettings = function(config){
	    var include = false;
	    //Rebuild colors from fs
	    config.stylesSettings = $scope.configModel.stylesSettings;
	    if (angular.isDefined($scope.configModel.positionStyle)){
	    	var positionProperties = {};
	    	positionProperties.attribute = $scope.configModel.positionStyle.attribute;
	    	positionProperties.style = {};
            
            if($scope.configPanelForm && $scope.configPanelForm.vmsstylesForm.positionsForm && $scope.configPanelForm.vmsstylesForm.positionsForm.$dirty){
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
                config.stylesSettings.positions = positionProperties;
            }
	    }
	    
	    if(angular.isDefined($scope.configModel.segmentStyle)){
            var segmentProperties = {};
            segmentProperties.attribute = $scope.configModel.segmentStyle.attribute;
            segmentProperties.style = {};
            
            if($scope.configPanelForm && $scope.configPanelForm.vmsstylesForm.segmentsForm && $scope.configPanelForm.vmsstylesForm.segmentsForm.$dirty){
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
                config.stylesSettings.segments = segmentProperties;
            }
        }
	    
	    if(!_.isEqual(config.stylesSettings.positions,$scope.configCopy.stylesSettings.positions) || !_.isEqual(config.stylesSettings.segments,$scope.configCopy.stylesSettings.segments)){
	    	include = true;
	    }
	    if (include === false){
	        config.stylesSettings = undefined;
	    }
	    
	    return config;
	};
	
	$scope.checkVisibilitySettings = function(config){
	    var include = false;
	    config.visibilitySettings = {};
	    angular.copy($scope.configModel.visibilitySettings,config.visibilitySettings);
	    var visibilityTypes = ['position','segment','track'];
	    var contentTypes = ['Table','Popup','Label'];
	    
	    angular.forEach(visibilityTypes, function(visibType) {
	    	angular.forEach(contentTypes, function(contentType) {
	    		if(visibType !== 'track' || visibType === 'track' && contentType === 'Table'){
		    		var visibilities = {};
		    		visibilities.values = [];
		    		visibilities.order = [];
		    		var visibilityCurrentSettings = config.visibilitySettings[visibType + 's'][contentType.toLowerCase() === 'label' ? contentType.toLowerCase() + 's' : contentType.toLowerCase()];
		    		var visibilityCurrentAttrs = config.visibilitySettings[visibType + contentType + 'Attrs'];
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
	    		delete config.visibilitySettings[visibType + contentType + 'Attrs'];
		    });
	    });
	    
	    //check if it is equals
	    if(config.visibilitySettings){
    		angular.forEach(visibilityTypes, function(visibType) {
    			if(config.visibilitySettings[visibType + 's']){
    				for(var i = 0;i<contentTypes.length;i++){
    					var visibilityCurrentSettings = config.visibilitySettings[visibType + 's'][contentTypes[i].toLowerCase() === 'label' ? contentTypes[i].toLowerCase() + 's' : contentTypes[i].toLowerCase()];
    					var visibilityCopySettings = $scope.configCopy.visibilitySettings[visibType + 's'][contentTypes[i].toLowerCase() === 'label' ? contentTypes[i].toLowerCase() + 's' : contentTypes[i].toLowerCase()];
    					
    					if(visibilityCurrentSettings &&
    					((visibilityCurrentSettings.values &&
    					!_.isEqual(visibilityCurrentSettings.values ? $scope.sortArray(visibilityCurrentSettings.values) : undefined, visibilityCopySettings.values)) ||
    					(visibilityCurrentSettings.order &&
    					!_.isEqual(visibilityCurrentSettings.values ? $scope.sortArray(visibilityCurrentSettings.values) : undefined, visibilityCopySettings.order)))){
    						include = true;
    					}
    				}
    			}
    		});
	    }
        
	    if (include === false){
	        config.visibilitySettings = undefined;
	    }
        
        return config;
    };
    
    $scope.checkLayerSettings = function(config){
    	
    	$scope.removeHashKeys($scope.configModel.layerSettings.portLayers);
    	$scope.removeHashKeys($scope.configModel.layerSettings.areaLayers.sysAreas);
    	$scope.removeHashKeys($scope.configModel.layerSettings.areaLayers.userAreas);
    	$scope.removeHashKeys($scope.configModel.layerSettings.additionalLayers);
    	$scope.removeHashKeys($scope.configModel.layerSettings.baseLayers);
    	
    	if (!_.isEqual($scope.configModel.layerSettings, $scope.configCopy.layerSettings)){
    		$scope.configCopy.layerSettingsToSave = {};
    		angular.copy($scope.configModel.layerSettings, $scope.configCopy.layerSettingsToSave);
    		config.layerSettings = {};
    		if(angular.isDefined($scope.configModel.layerSettings.portLayers) && !_.isEmpty($scope.configModel.layerSettings.portLayers)){
        		var ports = [];
        		angular.forEach($scope.configModel.layerSettings.portLayers, function(item) {
        			var port = {'serviceLayerId': item.serviceLayerId};
    	    		ports.push(port);
    	    	});
        		config.layerSettings.portLayers = [];
        		angular.copy(ports,config.layerSettings.portLayers);
        	}else{
    			config.layerSettings.portLayers = undefined;
    		}
        	
        	if(angular.isDefined($scope.configModel.layerSettings.areaLayers)){
        		config.layerSettings.areaLayers = {};
        		if(angular.isDefined($scope.configModel.layerSettings.areaLayers.sysAreas) && !_.isEmpty($scope.configModel.layerSettings.areaLayers.sysAreas)){
        			config.layerSettings.areaLayers.sysAreas = {};
    	    		var sysareas = [];
    	    		angular.forEach($scope.configModel.layerSettings.areaLayers.sysAreas, function(item) {
    	    			var area = {'serviceLayerId': item.serviceLayerId};
    	    			sysareas.push(area);
    		    	});
    	    		config.layerSettings.areaLayers.sysAreas = [];
    	    		angular.copy(sysareas,config.layerSettings.areaLayers.sysAreas);
        		}else{
        			config.layerSettings.areaLayers.sysAreas = undefined;
        		}
        		
        		if(angular.isDefined($scope.configModel.layerSettings.areaLayers.userAreas)){
        			config.layerSettings.areaLayers.userAreas = {};
        			if(!angular.isDefined($scope.configModel.layerSettings.areaLayers.userAreas.areas) || _.isEmpty($scope.configModel.layerSettings.areaLayers.userAreas.areas)){
	    				config.layerSettings.areaLayers.userAreas = undefined;
	    			}else{
    		    		var areas = [];
    		    		angular.forEach($scope.configModel.layerSettings.areaLayers.userAreas.areas, function(item) {
    		    			var area = {'gid': item.serviceLayerId};
    		    			areas.push(area);
    			    	});
    		    		config.layerSettings.areaLayers.userAreas.areas = [];
    		    		angular.copy(areas,config.layerSettings.areaLayers.userAreas.areas);
        			}
        			if(angular.isDefined(config.layerSettings.areaLayers.userAreas)){
        				config.layerSettings.areaLayers.userAreas.serviceLayerId = $scope.configModel.layerSettings.areaLayers.userAreas.serviceLayerId;
        			}
        		}
        	}
        	
        	if(angular.isDefined($scope.configModel.layerSettings.additionalLayers) && !_.isEmpty($scope.configModel.layerSettings.additionalLayers)){
        		var additionals = [];
        		angular.forEach($scope.configModel.layerSettings.additionalLayers, function(item) {
        			var additional = {'serviceLayerId': item.serviceLayerId};
        			additionals.push(additional);
    	    	});
        		config.layerSettings.additionalLayers = [];
        		angular.copy(additionals,config.layerSettings.additionalLayers);
        	}else{
    			config.layerSettings.additionalLayers = undefined;
    		}
        	
        	if(angular.isDefined($scope.configModel.layerSettings.baseLayers) && !_.isEmpty($scope.configModel.layerSettings.baseLayers)){
        		var bases = [];
        		angular.forEach($scope.configModel.layerSettings.baseLayers, function(item) {
        			var base = {'serviceLayerId': item.serviceLayerId};
        			bases.push(base);
    	    	});
        		config.layerSettings.baseLayers = [];
        		angular.copy(bases,config.layerSettings.baseLayers);
        	}else{
    			config.layerSettings.baseLayers = undefined;
    		}
        	
        } else {
            config.layerSettings = undefined;
        }
	    return config;
	};
    
    $scope.sortArray = function(data){
        var temp = _.clone(data);
        temp.sort();
        
        return temp;
    };
    
    //Update config copy after saving new preferences
    $scope.updateConfigCopy = function(src){
        var changes = angular.fromJson(src);
        var keys = _.keys(changes);
        
        for (var i = 0; i < keys.length; i++){
        	if(keys[i] === 'layerSettings'){
        		$scope.configCopy.layerSettings = {};
        		angular.copy($scope.configCopy.layerSettingsToSave,$scope.configCopy.layerSettings);
        		$scope.configCopy.layerSettingsToSave = undefined;
        	}else{
        		$scope.configCopy[keys[i]] = changes[keys[i]];
        	}
        }
    };
    
    $scope.removeHashKeys = function(arr){
    	angular.forEach(arr, function(item) {
    		delete item.$$hashKey;
    	});
    };
    
	var saveSuccess = function(response){
	    $anchorScroll();
	    $scope.alert.hasAlert = true;
	    $scope.alert.hasSuccess = true;
	    $scope.alert.alertMessage = locale.getString('spatial.user_preferences_success_saving');
	    $scope.alert.hideAlert();
	    $scope.updateConfigCopy(response[1]);
	};
	
	var saveFailure = function(error){
	    $anchorScroll();
	    $scope.alert.hasAlert = true;
	    $scope.alert.hasError = true;
	    $scope.alert.alertMessage = locale.getString('spatial.user_preferences_error_saving');
	    $scope.alert.hideAlert();
	};
	
	var getConfigsSuccess = function(response){
	    $scope.srcConfigObj = response;
	    var model = new SpatialConfig();
        $scope.configModel = model.forUserPrefFromJson(response);
        $scope.configCopy = {};
        angular.copy($scope.configModel, $scope.configCopy);
        $scope.loadedAllSettings = true;
	};
	
	var getConfigsFailure = function(error){
	    $anchorScroll();
	    $scope.alert.hasAlert = true;
	    $scope.alert.hasError = true;
	    $scope.alert.alertMessage = locale.getString('spatial.user_preferences_error_getting_configs');
	    $scope.alert.hideAlert();
	};
	
});