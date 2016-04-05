angular.module('unionvmsWeb').controller('MapsettingscollapsiblepanelCtrl',function($scope, locale, $anchorScroll, spatialConfigRestService, spatialConfigAlertService, SpatialConfig, $location){

	$scope.status = {
		isOpen: false
	};
	
	$scope.reset = function(){
		$scope.mapsettingsForm.$setDirty();
	    var item = {
	       mapSettings: {}
	    };
	    
	    if($scope.isUserPreference){
		    spatialConfigRestService.resetSettings(item).then(resetSuccess, resetFailure);
		}else if($scope.isReportConfig){
			spatialConfigRestService.getUserConfigs().then(getConfigsSuccess, getConfigsFailure);
		}
	};
	
	var resetSuccess = function(response){
	    $scope.configModel.mapSettings = response.mapSettings;
	    if (angular.isDefined($scope.configCopy)){
	        angular.copy(response.mapSettings, $scope.configCopy.mapSettings);
	    }
	    $anchorScroll();
	    spatialConfigAlertService.hasAlert = true;
	    spatialConfigAlertService.hasSuccess = true;
	    spatialConfigAlertService.alertMessage = locale.getString('spatial.user_preferences_reset_map_settings_success');
        spatialConfigAlertService.hideAlert();
	};
	
	var resetFailure = function(error){
	    $anchorScroll();
        spatialConfigAlertService.hasAlert = true;
        spatialConfigAlertService.hasError = true;
        spatialConfigAlertService.alertMessage = locale.getString('spatial.user_preferences_reset_map_settings_failure');
        spatialConfigAlertService.hideAlert();
	};
	
	var getConfigsSuccess = function(response){
	    $scope.srcConfigObj = response;
	    var model = new SpatialConfig();
        $scope.userConfig = model.forUserPrefFromJson(response);
        
	    $scope.configModel.mapSettings.spatialConnectId = $scope.userConfig.mapSettings.spatialConnectId;
	    $scope.configModel.mapSettings.mapProjectionId = $scope.userConfig.mapSettings.mapProjectionId;
	    $scope.configModel.mapSettings.displayProjectionId = $scope.userConfig.mapSettings.displayProjectionId;
	    $scope.configModel.mapSettings.coordinatesFormat = $scope.userConfig.mapSettings.coordinatesFormat;
	    $scope.configModel.mapSettings.scaleBarUnits = $scope.userConfig.mapSettings.scaleBarUnits;
	    
	    if($scope.isReportConfig){
		    $location.hash('mapConfigurationModal');
			$anchorScroll();
			$location.hash('');
        }
	    
	    $anchorScroll();
	    spatialConfigAlertService.hasAlert = true;
	    spatialConfigAlertService.hasSuccess = true;
	    spatialConfigAlertService.alertMessage = locale.getString('spatial.user_preferences_reset_map_settings_success');
        spatialConfigAlertService.hideAlert();
	};
	
	var getConfigsFailure = function(error){
	    $anchorScroll();
	    $scope.alert.hasAlert = true;
	    $scope.alert.hasError = true;
	    $scope.alert.alertMessage = locale.getString('spatial.user_preferences_reset_map_settings_failure');
	    $scope.alert.hideAlert();
	};
});