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
	
    $scope.checkIfExists = function(item,list,isBaseList) {
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
		if(angular.isDefined($scope.layerSettingsForm)){
    		$scope.layerSettingsForm.$setDirty();
			if(isBaseList || (!isBaseList && !_.isEmpty($scope.selectedBases))){
				$scope.layerSettingsForm.baseLayers.$setValidity('empty',true);
			}else{
				$scope.layerSettingsForm.baseLayers.$setValidity('empty',false);
			}
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
    			$scope.configModel.layerSettings.areaLayers = [];
    		}
	    	
	    	$scope.selectedAreas = $scope.configModel.layerSettings.areaLayers;
	    	angular.forEach($scope.selectedAreas, function(item) {
	    		item.serviceLayerId = "" + item.serviceLayerId;
	            item.gid = "" + item.gid;
	            if(item.areaType === "userarea"){
	            	item.name = angular.isDefined(item.areaName) ? item.areaName : item.name;
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
    
	$scope.validateBackGroundLayers = function(){
		if(_.isEmpty($scope.selectedBases)){
			$scope.layerSettingsForm.baseLayers.$setValidity('empty',false);
		}else{
			$scope.layerSettingsForm.baseLayers.$setValidity('empty',true);
		}
	};
    
});