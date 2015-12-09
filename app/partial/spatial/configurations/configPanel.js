angular.module('unionvmsWeb').controller('ConfigpanelCtrl',function($scope, $anchorScroll, $timeout, locale, SpatialConfig, spatialConfigRestService){

	$scope.isConfigVisible= false;
	$scope.hasError = false;
	$scope.errorMessage = undefined;
	$scope.hasSuccess = false;
	
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
	
	$scope.hideAlerts = function(){
	    $timeout(function(){
	        $scope.hasError = false;
	        $scope.errorMessage = undefined;
	        $scope.hasSuccess = false;
	    }, 3000);
	};
	
	$scope.save = function(){
	    var newConfig = new SpatialConfig();
	    newConfig = newConfig.forUserPrefToServer();
	    
	    newConfig = $scope.checkMapSettings(newConfig);
	    newConfig = $scope.checkStylesSttings(newConfig);
	    newConfig = $scope.checkVisibilitySttings(newConfig);
	    
	    newConfig = angular.toJson(newConfig);
	    
	    if (!angular.equals({}, newConfig)){
	        spatialConfigRestService.saveUserConfigs(newConfig).then(saveSuccess, saveFailure);  
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
	
	$scope.checkStylesSttings = function(config){
	    var include = false;
	    //Rebuild colors from fs
	    config.stylesSettings = $scope.configModel.stylesSettings;
	    if (angular.isDefined($scope.configModel.posFsStyle)){
	        var posStyle = {};
	        for (var i = 0; i < $scope.configModel.posFsStyle.length; i++){
	            posStyle[$scope.configModel.posFsStyle[i].code] = $scope.configModel.posFsStyle[i].color; 
	        }
	        
	        if (!_.isEqual($scope.configCopy.stylesSettings.positions.style, posStyle)){
	            config.stylesSettings.positions.style = posStyle;
	            include = true;
	        }
	    }
	    
	    if (!_.isEqual($scope.configCopy.stylesSettings.segments, $scope.configModel.stylesSettings.segments)){
	        include = true;
	    }
	    
	    if (include === false){
	        config.stylesSettings = undefined;
	    }
	    
	    return config;
	};
	
	$scope.checkVisibilitySttings = function(config){
	    var include = false;
	    config.visibilitySettings = $scope.configModel.visibilitySettings;
	    
	    //Positions
	    //Popups
	    if (!_.isEqual($scope.sortArray($scope.configModel.visibilitySettings.positions.popup), $scope.sortArray($scope.configCopy.visibilitySettings.positions.popup))){
	        include = true;
	    }
	    
	    //Labels
	    if (!_.isEqual($scope.sortArray($scope.configModel.visibilitySettings.positions.labels), $scope.sortArray($scope.configCopy.visibilitySettings.positions.labels))){
            include = true;
        }
	    
	    //Segments
	    //Popups
	    if (!_.isEqual($scope.sortArray($scope.configModel.visibilitySettings.segments.popup), $scope.sortArray($scope.configCopy.visibilitySettings.segments.popup))){
            include = true;
        }
        
	    //Labels
        if (!_.isEqual($scope.sortArray($scope.configModel.visibilitySettings.segments.labels), $scope.sortArray($scope.configCopy.visibilitySettings.segments.labels))){
            include = true;
        }
        
	    if (include === false){
	        config.visibilitySettings = undefined;
	    }
        
        return config;
    };
    
    $scope.sortArray = function(data){
        var temp = _.clone(data);
        temp.sort();
        
        return temp;
    };
	
	var saveSuccess = function(response){
	    $scope.hasSuccess = true;
	    $scope.hideAlerts();
	};
	
	var saveFailure = function(error){
	    $scope.hasError = true;
	    $scope.errorMessage = locale.getString('spatial.user_preferences_error_saving');
	    $scope.hideAlerts();
	};
	
	var getConfigsSuccess = function(response){
	    $scope.srcConfigObj = response;
	    var model = new SpatialConfig();
        $scope.configModel = model.forUserPrefFromJson(response);
        $scope.configCopy = {};
        angular.copy($scope.configModel, $scope.configCopy);
	};
	
	var getConfigsFailure = function(error){
	    $scope.hasError = true;
	    $scope.errorMessage = locale.getString('spatial.user_preferences_error_getting_configs');
	    $scope.hideAlerts();
	};
	
});