/*
Developed with the contribution of the European Commission - Directorate General for Maritime Affairs and Fisheries
© European Union, 2015-2016.

This file is part of the Integrated Fisheries Data Management (IFDM) Suite. The IFDM Suite is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as published by the
Free Software Foundation, either version 3 of the License, or any later version. The IFDM Suite is distributed in
the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. You should have received a
copy of the GNU General Public License along with the IFDM Suite. If not, see <http://www.gnu.org/licenses/>.
*/
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
		$scope.isLoadingAdditionals = true;
		$scope.additionals.containers[0].lists[0].items = [];
		spatialConfigRestService.getAdditionalCartography().then(function(response){
			angular.copy(response,$scope.additionals.containers[0].lists[0].items);
			angular.forEach($scope.additionals.containers[0].lists[0].items, function(item) {
	    		item.serviceLayerId = "" + item.serviceLayerId;
	    	});
			$scope.isLoadingAdditionals = false;
		},function(error){
			$scope.isLoadingAdditionals = false;
		});
    };
    
    loadAdditional();
});
