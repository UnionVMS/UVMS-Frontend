angular.module('unionvmsWeb').controller('PortsCtrl',function($scope,spatialConfigRestService){
	$scope.ports = {
            containers: [
			{
			    "type": "container",
			    "lists": [
	              		{
	                        "type": "list",
	                        "name": "spatial.layer_settings_port",
	                        "allowedTypes": [
	                                         "port", "portarea"
	                                       ],
	                        "items": undefined
	                    }
	              	]
			}
                    
            ]
        };
	
	var loadPorts = function(){
		$scope.isLoadingPorts = true;
		$scope.ports.containers[0].lists[0].items = [];
		spatialConfigRestService.getPorts().then(function(response){
			 angular.copy(response,$scope.ports.containers[0].lists[0].items);
			 angular.forEach($scope.ports.containers[0].lists[0].items, function(item) {
		    		item.serviceLayerId = "" + item.serviceLayerId;
		    	});
			 $scope.isLoadingPorts = false;
		},function(error){
			$scope.isLoadingPorts = false;
		});
    };
    loadPorts();
});