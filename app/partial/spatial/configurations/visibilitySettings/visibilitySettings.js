angular.module('unionvmsWeb').controller('VisibilitysettingsCtrl',function($scope, locale, $anchorScroll, spatialConfigRestService, spatialConfigAlertService, SpatialConfig, $location){
    
    $scope.status = {
        isOpen: false
    };
    
    $scope.selectedMenu = 'POSITIONS';

    var setMenus = function(){
        return [
            {
                'menu': 'POSITIONS',
                'title': locale.getString('spatial.tab_movements')
            },
            {
                'menu': 'SEGMENTS',
                'title': locale.getString('spatial.tab_segments')
            },
            {
                'menu': 'TRACKS',
                'title': locale.getString('spatial.tab_tracks')
            }
        ];
    };
    
    $scope.selectAll = {
    	positions: {
    		table: true,
    		popup: true,
    		label: true
    	},
    	segments: {
    		table: true,
    		popup: true,
    		label: true
    	},
    	tracks: {
    		table: true
    	}
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
    	$scope.visibilitysettingsForm.$setDirty();
        var item = {
           visibilitySettings: {}
        };
        
        if($scope.isUserPreference){
	        spatialConfigRestService.resetSettings(item).then(resetSuccess, resetFailure);
	    }else if($scope.isReportConfig){
	    	spatialConfigRestService.getUserConfigs().then(getConfigsSuccess, getConfigsFailure);
	    }
    };
    
    var resetSuccess = function(response){
        $scope.configModel.visibilitySettings = response.visibilitySettings;
        if (angular.isDefined($scope.configCopy)){
            angular.copy(response.visibilitySettings, $scope.configCopy.visibilitySettings);
        }
        $anchorScroll();
        spatialConfigAlertService.hasAlert = true;
        spatialConfigAlertService.hasSuccess = true;
        spatialConfigAlertService.alertMessage = locale.getString('spatial.user_preferences_reset_visibilities_success');
        spatialConfigAlertService.hideAlert();
    };
    
    var resetFailure = function(error){
        $anchorScroll();
        spatialConfigAlertService.hasAlert = true;
        spatialConfigAlertService.hasError = true;
        spatialConfigAlertService.alertMessage = locale.getString('spatial.user_preferences_reset_visibilities_failure');
        spatialConfigAlertService.hideAlert();
    };
    
    $scope.dropItem = function(item, list){
 	   var itemIndex = list.indexOf(item);
 	   if(itemIndex !== 1){
 		   list.splice(itemIndex, 1);
 	   }
 	   return item;
    };
    
    var getConfigsSuccess = function(response){
	    $scope.srcConfigObj = response;
	    var model = new SpatialConfig();
	    $scope.userConfig = model.forUserPrefFromJson(response);
	    $scope.configModel.visibilitySettings = {};
        if(angular.isDefined($scope.userConfig.visibilitySettings)){
        	angular.copy($scope.userConfig.visibilitySettings, $scope.configModel.visibilitySettings);
        }
        
        if($scope.isReportConfig){
		    $location.hash('mapConfigurationModal');
			$anchorScroll();
			$location.hash('');
        }
        
        $anchorScroll();
	    spatialConfigAlertService.hasAlert = true;
	    spatialConfigAlertService.hasSuccess = true;
	    spatialConfigAlertService.alertMessage = locale.getString('spatial.user_preferences_reset_visibilities_success');
        spatialConfigAlertService.hideAlert();
	};
	
	var getConfigsFailure = function(error){
	    $anchorScroll();
	    $scope.alert.hasAlert = true;
	    $scope.alert.hasError = true;
	    $scope.alert.alertMessage = locale.getString('spatial.user_preferences_reset_visibilities_failure');
	    $scope.alert.hideAlert();
	};
	
	$scope.selectAllChange = function(visibilityType,contentType,isListItem,newVal){
		var currentVisibilities = $scope.configModel.visibilitySettings[visibilityType][contentType.toLowerCase() === 'label' ? contentType.toLowerCase() + 's' : contentType.toLowerCase()];
		if(isListItem){
			var checked = this.checked === true ? 1 : -1;
			if(angular.isDefined(currentVisibilities.values) && currentVisibilities.values.length + checked === currentVisibilities.order.length){
				$scope.selectAll[visibilityType][contentType] = true;
			}else{
				$scope.selectAll[visibilityType][contentType] = false;
			}
		}else{
			currentVisibilities.values = [];
//			currentVisibilities.values.splice(0,currentVisibilities.values.length);
			if($scope.selectAll[visibilityType][contentType]){
				angular.forEach(currentVisibilities.order, function(item) {
					currentVisibilities.values.push(item);
				});
			}
			
		}
	};
});
