angular.module('unionvmsWeb').controller('VmsstylescollapsiblepanelCtrl',function($scope, locale, $anchorScroll, spatialConfigRestService, spatialConfigAlertService, SpatialConfig, $location, loadingStatus){

	$scope.status = {
		isOpen: false
	};
	
	$scope.selectedMenu = 'position';

	var setMenus = function(){
	        return [
	            {
	                'menu': 'position',
	                'title': locale.getString('spatial.tab_movements')
	            },
	            {
	                'menu': 'segment',
	                'title': locale.getString('spatial.tab_segments')
	            },
	            {
	            	'menu': 'alarm',
	                'title': locale.getString('spatial.tab_alarms')
	            }
	        ];
	    };
	    
	locale.ready('spatial').then(function(){
	   $scope.headerMenus = setMenus();
	});
	
	$scope.selectMenu = function(menu){
	   $scope.selectedMenu = menu;
	};
	
	$scope.isMenuSelected = function(menu){
	   return $scope.selectedMenu === menu;
	};
	
	$scope.reset = function(){
		loadingStatus.isLoading('ResetPreferences',true);
		$scope.loadedAllSettings = false;
        var item = {
            stylesSettings: {}
        };
        
        if($scope.isUserPreference){
        	spatialConfigRestService.resetSettings(item).then(resetSuccess, resetFailure);
        }else if($scope.isReportConfig){
        	spatialConfigRestService.getUserConfigs().then(getConfigsSuccess, getConfigsFailure);
        }
    };
    
    var resetSuccess = function(response){
        //TODO check if this is working properly
        $scope.configModel.stylesSettings = response.stylesSettings;
        if (angular.isDefined($scope.configCopy)){
            angular.copy($scope.configModel.stylesSettings, $scope.configCopy.stylesSettings);
	        $scope.loadedAllSettings = true;
	        $scope.$broadcast('loadCountries');
        }
        $anchorScroll();
        spatialConfigAlertService.hasAlert = true;
        spatialConfigAlertService.hasSuccess = true;
        spatialConfigAlertService.alertMessage = locale.getString('spatial.user_preferences_reset_vms_styles_success');
        spatialConfigAlertService.hideAlert();
        $scope.configModel.stylesSettings.reseted = true;
        loadingStatus.isLoading('ResetPreferences',false);
    };
    
    var resetFailure = function(error){
        $anchorScroll();
        spatialConfigAlertService.hasAlert = true;
        spatialConfigAlertService.hasError = true;
        spatialConfigAlertService.alertMessage = locale.getString('spatial.user_preferences_reset_vms_styles_failure');
        spatialConfigAlertService.hideAlert();
        loadingStatus.isLoading('ResetPreferences',false);
    };
    
    $scope.generateRandomColor = function(){
		var color = "#";
	    var possible = "0123456789";
	    for( var i=0; i < 6; i++ ){
	        color += possible.charAt(Math.floor(Math.random() * possible.length));
	    }
	    return color;
	};
	
	var getConfigsSuccess = function(response){
	    $scope.srcConfigObj = response;
	    var model = new SpatialConfig();
	    
	    $scope.userConfig = model.forUserPrefFromJson(response);
	    $scope.configModel.stylesSettings = {};
        
        if(angular.isDefined($scope.userConfig.stylesSettings)){
        	angular.copy($scope.userConfig.stylesSettings, $scope.configModel.stylesSettings);
        	$scope.$broadcast('loadCountries');
        }
        $scope.loadedAllSettings = true;
        
        if($scope.isReportConfig){
		    $location.hash('mapConfigurationModal');
			$anchorScroll();
			$location.hash('');
        }
        
        $anchorScroll();
	    spatialConfigAlertService.hasAlert = true;
	    spatialConfigAlertService.hasSuccess = true;
	    spatialConfigAlertService.alertMessage = locale.getString('spatial.user_preferences_reset_vms_styles_success');
        spatialConfigAlertService.hideAlert();
        $scope.configModel.stylesSettings.reseted = true;
        loadingStatus.isLoading('ResetPreferences',false);
	};
	
	var getConfigsFailure = function(error){
	    $anchorScroll();
	    $scope.alert.hasAlert = true;
	    $scope.alert.hasError = true;
	    $scope.alert.alertMessage = locale.getString('spatial.user_preferences_reset_vms_styles_failure');
	    $scope.alert.hideAlert();
	    loadingStatus.isLoading('ResetPreferences',false);
	};

});