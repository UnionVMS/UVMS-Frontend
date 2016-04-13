angular.module('unionvmsWeb').controller('AreaslayersCtrl',function($scope,spatialConfigRestService){
	$scope.areas = {
            containers: [
				{
				    "type": "container",
				    "lists": [
		              		{
		                        "type": "sysarea",
		                        "name": "spatial.layer_settings_system_areas",
		                        "allowedTypes": [
		                                         "sysarea"
		                                       ],
		                        "items": undefined
		                    }
		              	]
				},
	 			{
	 			    "type": "container",
	 			    "lists": [
	 	              		{
	 	                        "type": "userarea",
	 	                        "name": "spatial.layer_settings_user_areas",
	 	                        "allowedTypes": [
	 	                                         "userarea"
	 	                                       ],
	 	                        "items": undefined
	 	                    }
	 	              	]
	 			},
	 			{
	 			    "type": "container",
	 			    "lists": [
	 	              		{
	 	                        "type": "areagroup",
	 	                        "name": "spatial.layer_settings_group_areas",
	 	                        "allowedTypes": [
	 	                                         "areagroup"
	 	                                       ],
	 	                        "items": undefined
	 	                    }
	 	              	]
	 			}
            ]
        };
	
	var loadAreas = function(){
		$scope.areas.containers[0].lists[0].items = [];
		$scope.isLoadingSysAreas = true;
		
		spatialConfigRestService.getSysArea().then(function(response){
			angular.copy(response,$scope.areas.containers[0].lists[0].items);
			angular.forEach($scope.areas.containers[0].lists[0].items, function(item) {
	    		item.layerDesc = undefined;
	    		item.serviceLayerId = "" + item.serviceLayerId;
	    		item.areaType = 'sysarea';
	    	});
			$scope.isLoadingSysAreas = false;
		});
		
		if(!$scope.isAdminConfig){
			$scope.areas.containers[1].lists[0].items = [];
			$scope.areas.containers[2].lists[0].items = [];
			$scope.isLoadingUserAreas = true;
			$scope.isLoadingAreaGroups = true;
			spatialConfigRestService.getUserArea().then(function(response){
				angular.copy(response[0].data,$scope.areas.containers[1].lists[0].items);
				angular.forEach($scope.areas.containers[1].lists[0].items, function(item) {
					item.subType = response[0].subType;
		    		item.serviceLayerId = "" + response[0].serviceLayerId;
		    		item.areaType = 'userarea';
		    	});
				$scope.isLoadingUserAreas = false;
			});
			spatialConfigRestService.getAreaGroup().then(function(response){
				angular.copy(response,$scope.areas.containers[2].lists[0].items);
				angular.forEach($scope.areas.containers[2].lists[0].items, function(item) {
					item.subType = response[0].subType;
		    		item.serviceLayerId = "" + response[0].serviceLayerId;
		    		item.areaType = 'areagroup';
		    		item.areaGroupName = response[0].data[0].name;
		    		item.name = response[0].data[0].name;
		    		delete response[0].data;
		    	});
				$scope.isLoadingAreaGroups = false;
			});
		}
		$scope.selectedAreaType = {'name': 'sysarea'};
    };
    
    loadAreas();
});