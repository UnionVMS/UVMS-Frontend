angular.module('unionvmsWeb').controller('PortsCtrl',function($scope,spatialConfigRestService){
	$scope.ports = {
            containers: [
			{
			    "type": "container",
			    "lists": [
	              		{
	                        "type": "list",
	                        "name": "Ports",
	                        "allowedTypes": [
	                                         "port"
	                                       ],
	                        "items": undefined
	                    }
	              	]
			}
                    
            ]
        };
	
	var loadPorts = function(){
		$scope.ports.containers[0].lists[0].items = [];
		spatialConfigRestService.getPorts().then(function(response){
			 angular.copy(response,$scope.ports.containers[0].lists[0].items);
			 angular.forEach($scope.ports.containers[0].lists[0].items, function(item) {
		    		item.serviceLayerId = "" + item.serviceLayerId;
		    	});
		});
    };
    loadPorts();
});