angular.module('unionvmsWeb').controller('ConfigpanelCtrl',function($scope, $anchorScroll, locale, SpatialConfig, spatialConfigRestService, spatialConfigAlertService, formService){
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
		    formService.setAllDirty(["configPanelForm"], $scope);
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
                include = true;
                config.stylesSettings.positions = positionProperties;
            }
	    }
	    
	    if(angular.isDefined($scope.configModel.segmentStyle)){
            var segmentProperties = {};
            segmentProperties.attribute = $scope.configModel.segmentStyle.attribute;
            segmentProperties.style = {};
            
            if($scope.configPanelForm && $scope.configPanelForm.vmsstylesForm.segmentsForm && $scope.configPanelForm.vmsstylesForm.segmentsForm.$dirty){
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
                include = true;
                config.stylesSettings.segments = segmentProperties;
            }
        }
	    
	    if (include === false){
	        config.stylesSettings = undefined;
	    }
	    
	    return config;
	};
	
	$scope.checkVisibilitySettings = function(config){
	    var include = false;
	    config.visibilitySettings = $scope.configModel.visibilitySettings;
	    
	    //Positions
	    //Table
	    if (!_.isEqual($scope.configModel.visibilitySettings.positions && $scope.configModel.visibilitySettings.positions.table ? $scope.sortArray($scope.configModel.visibilitySettings.positions.table) : undefined, $scope.configCopy.visibilitySettings.positions && $scope.configCopy.visibilitySettings.positions.table ? $scope.sortArray($scope.configCopy.visibilitySettings.positions.table) : undefined)){
            include = true;
        }
	    
	    //Popups
	    if (!_.isEqual($scope.configModel.visibilitySettings.positions && $scope.configModel.visibilitySettings.positions.popup ? $scope.sortArray($scope.configModel.visibilitySettings.positions.popup) : undefined, $scope.configCopy.visibilitySettings.positions && $scope.configCopy.visibilitySettings.positions.popup ? $scope.sortArray($scope.configCopy.visibilitySettings.positions.popup) : undefined)){
	        include = true;
	    }
	    
	    //Labels
	    if (!_.isEqual($scope.configModel.visibilitySettings.positions && $scope.configModel.visibilitySettings.positions.labels ? $scope.sortArray($scope.configModel.visibilitySettings.positions.labels) : undefined, $scope.configCopy.visibilitySettings.positions && $scope.configCopy.visibilitySettings.positions.labels ? $scope.sortArray($scope.configCopy.visibilitySettings.positions.labels) : undefined)){
            include = true;
        }
	    
	    //Segments
	    //Table
	    if (!_.isEqual($scope.configModel.visibilitySettings.segments && $scope.configModel.visibilitySettings.segments.table ? $scope.sortArray($scope.configModel.visibilitySettings.segments.table) : undefined, $scope.configCopy.visibilitySettings.segments && $scope.configCopy.visibilitySettings.segments.table ? $scope.sortArray($scope.configCopy.visibilitySettings.segments.table) : undefined)){
            include = true;
        }
	    
	    //Popups
	    if (!_.isEqual($scope.configModel.visibilitySettings.segments && $scope.configModel.visibilitySettings.segments.popup ? $scope.sortArray($scope.configModel.visibilitySettings.segments.popup) : undefined, $scope.configCopy.visibilitySettings.segments && $scope.configCopy.visibilitySettings.segments.popup ? $scope.sortArray($scope.configCopy.visibilitySettings.segments.popup) : undefined)){
            include = true;
        }
        
	    //Labels
        if (!_.isEqual($scope.configModel.visibilitySettings.segments && $scope.configModel.visibilitySettings.segments.labels ? $scope.sortArray($scope.configModel.visibilitySettings.segments.labels) : undefined, $scope.configCopy.visibilitySettings.segments && $scope.configCopy.visibilitySettings.segments.labels ? $scope.sortArray($scope.configCopy.visibilitySettings.segments.labels) : undefined)){
            include = true;
        }
        
        //Tracks
        //Table
        if (!_.isEqual($scope.configModel.visibilitySettings.tracks && $scope.configModel.visibilitySettings.tracks.table ? $scope.sortArray($scope.configModel.visibilitySettings.tracks.table) : undefined, $scope.configCopy.visibilitySettings.tracks && $scope.configCopy.visibilitySettings.tracks.table ? $scope.sortArray($scope.configCopy.visibilitySettings.tracks.table) : undefined)){
            include = true;
        }
        
        
	    if (include === false){
	        config.visibilitySettings = undefined;
	    }
        
        return config;
    };
    
    $scope.checkLayerSettings = function(config){
    	if (!_.isEqual($scope.configModel.layerSettings, $scope.configCopy.layerSettings)){
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
            $scope.configCopy[keys[i]] = changes[keys[i]];
        }
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