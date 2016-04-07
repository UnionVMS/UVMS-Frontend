angular.module('unionvmsWeb').controller('BackgroundCtrl',function($scope,spatialConfigRestService){
	$scope.backgrounds = {
            containers: [
			{
			    "type": "container",
			    "lists": [
	              		{
	                        "type": "list",
	                        "name": "spatial.layer_settings_base",
	                        "allowedTypes": [
	                                         "background",
	                                         "others"
	                                       ],
	                        "items": undefined
	                    }
	              	]
			}
                    
            ]
        };
	
	var loadBackground = function(){
		$scope.isLoadingBackgrounds = true;
		$scope.backgrounds.containers[0].lists[0].items = [];
		spatialConfigRestService.getBackground().then(function(response){
			angular.copy(response,$scope.backgrounds.containers[0].lists[0].items);
			angular.forEach($scope.backgrounds.containers[0].lists[0].items, function(item) {
	    		item.serviceLayerId = "" + item.serviceLayerId;
	    	});
			$scope.isLoadingBackgrounds = false;
		});
    };
    
    loadBackground();
});