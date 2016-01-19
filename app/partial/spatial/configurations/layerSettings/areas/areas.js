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
	 			}
            ]
        };
	
	var loadAreas = function(){
		$scope.areas.containers[0].lists[0].items = [];
		$scope.areas.containers[1].lists[0].items = [];
		spatialConfigRestService.getSysArea().then(function(response){
			angular.copy(response,$scope.areas.containers[0].lists[0].items);
			angular.forEach($scope.areas.containers[0].lists[0].items, function(item) {
	    		item.layerDesc = undefined;
	    		item.serviceLayerId = "" + item.serviceLayerId;
	    	});
		});
		spatialConfigRestService.getUserArea().then(function(response){
			$scope.configModel.layerSettings.areaLayers.userAreas.serviceLayerId = response[0].serviceLayerId;
			angular.copy(response[0].data,$scope.areas.containers[1].lists[0].items);
			angular.forEach($scope.areas.containers[1].lists[0].items, function(item) {
				item.subType = response[0].subType;
	    		item.desc = undefined;
	    		item.serviceLayerId = "" + item.gid;
	    		item.gid = undefined;
	    	});
		});
    };
    
    loadAreas();
});