angular.module('unionvmsWeb').controller('AdditionalcartographyCtrl',function($scope,spatialConfigRestService,locale){
	$scope.additionals = {
            containers: [
			{
			    "type": "container",
			    "lists": [
	              		{
	                        "type": "list",
	                        "name": "spatial.layer_settings_additional",
	                        "allowedTypes": [
	                                         "additional",
	                                         "others"
	                                       ],
	                        "items": undefined
	                    }
	              	]
			}
                    
            ]
        };
	
	var loadAdditional = function(){
		$scope.additionals.containers[0].lists[0].items = [];
		spatialConfigRestService.getAdditionalCartography().then(function(response){
			angular.copy(response,$scope.additionals.containers[0].lists[0].items);
			angular.forEach($scope.additionals.containers[0].lists[0].items, function(item) {
	    		item.serviceLayerId = "" + item.serviceLayerId;
	    	});
		});
    };
    
    loadAdditional();
});