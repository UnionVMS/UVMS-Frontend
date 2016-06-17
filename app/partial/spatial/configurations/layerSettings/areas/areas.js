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
		                        "items": []
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
	 	                        "items": []
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
	 	                        "items": []
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
				if(angular.isDefined(response[0]) && angular.isDefined(response[0].data) && response[0].data.length){
					angular.copy(response[0].data,$scope.areas.containers[1].lists[0].items);
					angular.forEach($scope.areas.containers[1].lists[0].items, function(item) {
						item.subType = response[0].subType;
						item.serviceLayerId = "" + response[0].serviceLayerId;
						item.areaType = 'userarea';
					});
				}else{
					$scope.areas.containers[1].lists[0].items = [];
				}
				$scope.isLoadingUserAreas = false;
			});
			spatialConfigRestService.getAreaGroup().then(function(response){
				if(angular.isDefined(response[0]) && angular.isDefined(response[0].data) && response[0].data.length){
					angular.copy(response[0].data,$scope.areas.containers[2].lists[0].items);
					for(var i=0;i<$scope.areas.containers[2].lists[0].items.length;i++){
						$scope.areas.containers[2].lists[0].items[i].subType = response[0].subType;
						$scope.areas.containers[2].lists[0].items[i].serviceLayerId = "" + response[0].serviceLayerId;
						$scope.areas.containers[2].lists[0].items[i].areaType = 'areagroup';
						$scope.areas.containers[2].lists[0].items[i].areaGroupName = response[0].data[i].name;
						$scope.areas.containers[2].lists[0].items[i].name = response[0].data[i].name;
					}
				}else{
					$scope.areas.containers[2].lists[0].items = [];
				}
				$scope.isLoadingAreaGroups = false;
			});
		}
		$scope.selectedAreaType = {'name': 'sysarea'};
    };
    
    loadAreas();
});