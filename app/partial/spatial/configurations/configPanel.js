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
	    
	    console.log(angular.toJson(newConfig));
	    
	    //spatialConfigRestService.saveUserConfigs(angular.toJson(newConfig)).save().then(saveSuccess, saveFailure);
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
	    //FIXME
	    config.stylesSettings = undefined;
	    return config;
	};
	
	$scope.checkVisibilitySttings = function(config){
	    if (!_.isEqual($scope.configModel.visibilitySettings, $scope.configCopy.visibilitySettings)){
            config.visibilitySettings = $scope.configModel.visibilitySettings;
        } else {
            config.visibilitySettings = undefined;
        }
        
        return config;
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