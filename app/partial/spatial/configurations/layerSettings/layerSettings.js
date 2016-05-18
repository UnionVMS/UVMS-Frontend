angular.module('unionvmsWeb').controller('LayersettingsCtrl',function($scope, locale, $anchorScroll, spatialConfigRestService, spatialConfigAlertService, SpatialConfig, $location, loadingStatus){

	$scope.status = {
		isOpen: false
	};
	
	$scope.selectedMenu = 'PORTS';
	
	var setMenus = function(){
	        return [
	            {
	                'menu': 'PORTS',
	                'title': locale.getString('spatial.layer_settings_port')
	            },
	            {
	                'menu': 'AREAS',
	                'title': locale.getString('spatial.layer_settings_area')
	            },
	            {
	                'menu': 'ADDITIONALCARTOGRAPHY',
	                'title': locale.getString('spatial.layer_settings_additional')
	            },
	            {
	                'menu': 'BACKGROUND',
	                'title': locale.getString('spatial.layer_settings_base')
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
            layerSettings: {}
        };
        
        if($scope.isUserPreference){
	        spatialConfigRestService.resetSettings(item).then(resetSuccess, resetFailure);
		}else if($scope.isReportConfig){
	    	spatialConfigRestService.getUserConfigs().then(getConfigsSuccess, getConfigsFailure);
	    }
    };
    
    var resetSuccess = function(response){
    	$scope.layersettingsForm.$setPristine();
        $scope.configModel.layerSettings = response.layerSettings;
        if (angular.isDefined($scope.configCopy)){
            angular.copy($scope.configModel.layerSettings, $scope.configCopy.layerSettings);
	        $scope.loadedAllSettings = true;
        }
        $anchorScroll();
        spatialConfigAlertService.hasAlert = true;
        spatialConfigAlertService.hasSuccess = true;
        spatialConfigAlertService.alertMessage = locale.getString('spatial.user_preferences_reset_layers_success');
        spatialConfigAlertService.hideAlert();
        $scope.layersettingsForm.$setPristine();
        $scope.configModel.layerSettings.reseted = true;
        loadingStatus.isLoading('ResetPreferences',false);
    };
    
    var resetFailure = function(error){
        $anchorScroll();
        spatialConfigAlertService.hasAlert = true;
        spatialConfigAlertService.hasError = true;
        spatialConfigAlertService.alertMessage = locale.getString('spatial.user_preferences_reset_layers_failure');
        spatialConfigAlertService.hideAlert();
        loadingStatus.isLoading('ResetPreferences',false);
    };
    
    $scope.checkIfExists = function(item,list,layersettingsForm,isBaseList) {
    	for(var i=0;i<list.length;i++){
    		if(angular.isDefined(item.areaType)){
	    		if(angular.equals(item.areaType,list[i].areaType)){
		    		switch(item.areaType){
			    		case 'sysarea':
		    				if(angular.equals(item.serviceLayerId,list[i].serviceLayerId)){
		    					return undefined;
		    				}
	    				break;
		    			case 'userarea':
		    				if(angular.equals(item.gid,list[i].gid)){
		    					return undefined;
		    				}
		    				break;
		    			case 'areagroup':
		    				if(angular.equals(item.name,list[i].name)){
		    					return undefined;
		    				}
		    				break;
		    		}
	    		}
    		}else{
				if(angular.equals(item.serviceLayerId,list[i].serviceLayerId)){
					return undefined;
				}
    		}
    	}
    	layersettingsForm.$setDirty();
    	if(isBaseList || (!isBaseList && !_.isEmpty($scope.selectedBases))){
    		$scope.layersettingsForm.baseLayers.$setValidity('empty',true);
    	}else{
    		$scope.layersettingsForm.baseLayers.$setValidity('empty',false);
    	}
    	
    	return item;
    };
    
    $scope.$watch('configModel.layerSettings', function(newVal) {
    	if(angular.isDefined(newVal)){
    		
    		if(!angular.isDefined($scope.configModel.layerSettings.portLayers)){
    			$scope.configModel.layerSettings.portLayers = [];
    		}
	    	$scope.selectedPorts = $scope.configModel.layerSettings.portLayers;
	    	angular.forEach($scope.selectedPorts, function(item) {
	    		item.serviceLayerId = "" + item.serviceLayerId;
	    	});
	    	
	    	if(!angular.isDefined($scope.configModel.layerSettings.areaLayers)){
    			$scope.configModel.layerSettings.areaLayers = {};
    		}
	    	
	    	$scope.selectedAreas = $scope.configModel.layerSettings.areaLayers;
	    	angular.forEach($scope.selectedAreas, function(item) {
	    		item.serviceLayerId = "" + item.serviceLayerId;
	            item.gid = "" + item.gid;
	            if(item.areaType === "userarea"){
	            	item.name = item.areaName;
	            }else if(item.areaType === "areagroup"){
	            	item.name = item.areaGroupName;
	            }
	    	});
	    	
	    	if(!angular.isDefined($scope.configModel.layerSettings.additionalLayers)){
    			$scope.configModel.layerSettings.additionalLayers = [];
    		}
	    	$scope.selectedAdditionals = $scope.configModel.layerSettings.additionalLayers;
	    	angular.forEach($scope.selectedAdditionals, function(item) {
	    		item.serviceLayerId = "" + item.serviceLayerId;
	    	});
	    	
	    	if(!angular.isDefined($scope.configModel.layerSettings.baseLayers)){
    			$scope.configModel.layerSettings.baseLayers = [];
    		}
	    	$scope.selectedBases = $scope.configModel.layerSettings.baseLayers;
	    	angular.forEach($scope.selectedBases, function(item) {
	    		item.serviceLayerId = "" + item.serviceLayerId;
	    	});
	    	$scope.validateBackGroundLayers();
	    	
    	}
    });
    
    var getConfigsSuccess = function(response){
	    $scope.srcConfigObj = response;
	    var model = new SpatialConfig();
	    $scope.userConfig = model.forUserPrefFromJson(response);
	    $scope.configModel.layerSettings = {};
        if(angular.isDefined($scope.configModel.layerSettings)){
        	angular.copy($scope.userConfig.layerSettings, $scope.configModel.layerSettings);
        }

        if($scope.isReportConfig){
		    $location.hash('mapConfigurationModal');
			$anchorScroll();
			$location.hash('');
        }
        
        $anchorScroll();
	    spatialConfigAlertService.hasAlert = true;
	    spatialConfigAlertService.hasSuccess = true;
	    spatialConfigAlertService.alertMessage = locale.getString('spatial.user_preferences_reset_layers_success');
        spatialConfigAlertService.hideAlert();
        $scope.layersettingsForm.$setPristine();
        $scope.configModel.layerSettings.reseted = true;
        loadingStatus.isLoading('ResetPreferences',false);
	};
	
	var getConfigsFailure = function(error){
	    $anchorScroll();
	    $scope.alert.hasAlert = true;
	    $scope.alert.hasError = true;
	    $scope.alert.alertMessage = locale.getString('spatial.user_preferences_reset_layers_failure');
	    $scope.alert.hideAlert();
	    loadingStatus.isLoading('ResetPreferences',false);
	};
	
	$scope.validateBackGroundLayers = function(){
		if(_.isEmpty($scope.selectedBases)){
			$scope.layersettingsForm.baseLayers.$setValidity('empty',false);
		}else{
			$scope.layersettingsForm.baseLayers.$setValidity('empty',true);
		}
	};
    
});