/*
﻿Developed with the contribution of the European Commission - Directorate General for Maritime Affairs and Fisheries
© European Union, 2015-2016.

This file is part of the Integrated Fisheries Data Management (IFDM) Suite. The IFDM Suite is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as published by the
Free Software Foundation, either version 3 of the License, or any later version. The IFDM Suite is distributed in
the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. You should have received a
copy of the GNU General Public License along with the IFDM Suite. If not, see <http://www.gnu.org/licenses/>.
 */
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
		},function(error){
			$scope.isLoadingSysAreas = false;
		});
		
		if($scope.settingsLevel !== 'admin'){
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
			},function(error){
				$scope.isLoadingSysAreas = false;
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
			},function(error){
				$scope.isLoadingSysAreas = false;
			});
		}
		$scope.selectedAreaType = {'name': 'sysarea'};
    };
    
    loadAreas();
});