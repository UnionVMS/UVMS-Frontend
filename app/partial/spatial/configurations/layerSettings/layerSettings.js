angular.module('unionvmsWeb').controller('LayersettingsCtrl',function($scope, locale, $anchorScroll, spatialConfigRestService, spatialConfigAlertService){

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
		$scope.loadedAllSettings = false;
        var item = {
            layerSettings: {}
        };
        spatialConfigRestService.resetSettings(item).then(resetSuccess, resetFailure);
    };
    
    var resetSuccess = function(response){
        //TODO check if this is working properly
        $scope.configModel.layerSettings = response.layerSettings;
        if (angular.isDefined($scope.configCopy)){
            angular.copy($scope.configModel.layerSettings, $scope.configCopy.layerSettings);
	        $scope.loadedAllSettings = true;
        }
        $anchorScroll();
        spatialConfigAlertService.hasAlert = true;
        spatialConfigAlertService.hasSuccess = true;
        spatialConfigAlertService.alertMessage = locale.getString('spatial.user_preferences_reset_success');
        spatialConfigAlertService.hideAlert();
    };
    
    var resetFailure = function(error){
        $anchorScroll();
        spatialConfigAlertService.hasAlert = true;
        spatialConfigAlertService.hasError = true;
        spatialConfigAlertService.alertMessage = locale.getString('spatial.user_preferences_reset_failure');
        spatialConfigAlertService.hideAlert();
    };
    
    $scope.checkIfExists = function(item,list,tableType) {
    	var i;
    	if((item.subType !== 'userarea' && item.subType !== 'sysarea') || (item.subType === 'userarea' && tableType === 'userarea' || item.subType === 'sysarea' && tableType === 'sysarea')){
	        for(i = 0; i < list.length; i++) {
        		if(angular.isDefined(item.serviceLayerId) &&  item.serviceLayerId === list[i].serviceLayerId){	    	
		        	return undefined;
		        }
	        }
    	}else{
    		var currentList;
    		if(item.subType === 'userarea'){
    			currentList = $scope.selectedUserAreas.areas;
    		}else if(item.subType === 'sysarea'){
    			currentList = $scope.selectedSysAreas;
    		}else{
    			return undefined;
    		}
    		for(i = 0; i < currentList.length; i++) {
        		if(item.serviceLayerId === currentList[i].serviceLayerId){	    	
		        	return undefined;
		        }
	        }
    		
    		if(item.subType === 'userarea'){
    			var newList = [];
    			newList.push(item);
    			for(i = 0; i < currentList.length; i++) {
    				newList.push(currentList[i]);
    	        }
    			angular.copy(newList,currentList);
    		}else if(item.subType === 'sysarea'){
    			currentList.push(item);
    		}
    		
    		return undefined;
    	}
    	return item;
    };
    
    $scope.dragOverArea = function(itemType, listType){
    	if(itemType === 'sysarea' && listType === 'userarea'){
    		$scope.isSysItemOverUser = true;
    	}else if(itemType === 'userarea' && listType === 'sysarea'){
    		$scope.isUserItemOverSys = true;
    	}
    	return true;
	};
    
    $scope.clearPlaceHolders = function() {
    	$scope.isSysItemOverUser = false;
    	$scope.isUserItemOverSys = false;
    };
    
    $scope.$watch('isSysItemOverUser', function(newVal) {
    	if(newVal === true){
    		$('.dndPlaceholder').hide();
    	}else{
    		$('.dndPlaceholder').show();
    	}
    });
    
    $scope.$watch('isUserItemOverSys', function(newVal) {
    	if(newVal === true){
    		$('.dndPlaceholder').hide();
    	}else{
    		$('.dndPlaceholder').show();
    	}
    });
    
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
	    	if(!angular.isDefined($scope.configModel.layerSettings.areaLayers.sysAreas)){
    			$scope.configModel.layerSettings.areaLayers.sysAreas = [];
    		}
	    	$scope.selectedSysAreas = $scope.configModel.layerSettings.areaLayers.sysAreas;
	    	angular.forEach($scope.selectedSysAreas, function(item) {
	    		item.layerDesc = undefined;
	    		item.serviceLayerId = "" + item.serviceLayerId;
	    	});
	    	
	    	if(!angular.isDefined($scope.configModel.layerSettings.areaLayers.userAreas)){
    			$scope.configModel.layerSettings.areaLayers.userAreas = {};
    		}
	    	if(!angular.isDefined($scope.configModel.layerSettings.areaLayers.userAreas.areas)){
    			$scope.configModel.layerSettings.areaLayers.userAreas.areas = [];
    		}
	    	$scope.selectedUserAreas = $scope.configModel.layerSettings.areaLayers.userAreas;
	    	angular.forEach($scope.selectedUserAreas.areas, function(item) {
	    		item.desc = undefined;
	    		item.serviceLayerId = "" + item.gid;
	    		item.gid = undefined;
	    		item.subType = "userarea";
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
	    	
	    	$('[dnd-list="selectedSysAreas"]').on('dragleave', function(event) {
	        	$scope.isUserItemOverSys = false;
	        });
	        
	        $('[dnd-list="selectedUserAreas.areas"]').on('dragleave', function(event) {
	        	$scope.isSysItemOverUser = false;
	        });
    	}
    });
    
});