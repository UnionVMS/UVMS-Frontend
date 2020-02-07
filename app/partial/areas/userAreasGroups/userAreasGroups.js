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
angular.module('unionvmsWeb').controller('UserareasgroupsCtrl',function($scope, locale, areaRestService, areaHelperService, areaMapService, $uibModal, userService, loadingStatus){
	$scope.areaHelper = areaHelperService;
	$scope.areaGroup = {'type': ''};
	$scope.currentContext = undefined;

	var init = function(){
		$scope.currentContext = userService.getCurrentContext();
	};

	$scope.getAreasByType = function(){
	    if (!angular.isDefined($scope.areaGroup.type)){
	        //let's remove the layer from the map
	        areaMapService.removeLayerByType('AREAGROUPS');
	        $scope.areaHelper.displayedUserAreaGroup = undefined;
	        $scope.areaHelper.updateSlider(undefined);
	    }

		if(angular.isDefined($scope.areaGroup.type) && $scope.areaGroup.type !== ''){
		    loadingStatus.isLoading('AreaManagementPanel', true);
			angular.forEach($scope.areaHelper.userAreasGroups, function(item) {
				if($scope.areaGroup.type === item.code){
				    areaHelperService.getUserAreaGroupLayer($scope.areaGroup.type);
				    $scope.areaHelper.displayedUserAreaGroup = $scope.areaGroup.type;
					areaRestService.getAreasByType(item.text).then(function(response){
			            $scope.userAreasList = response;
			            $scope.displayedUserAreas = [].concat($scope.userAreasList);
			            loadingStatus.isLoading('AreaManagementPanel', false);
			        }, function(error){
			            loadingStatus.isLoading('AreaManagementPanel', false);
			            $scope.alert.setError();
			            $scope.alert.alertMessage = locale.getString('areas.error_getting_user_area_list');
			        });
				}
			});
			$scope.areaHelper.updateSlider('AREAGROUPS');
		}else{
			$scope.userAreasList = [];
		}
	};

	//Table buttons
    //Zoom
    $scope.zoomToArea = function(idx){
        //Zoom to area
        var wkt = new ol.format.WKT();
        var geom = wkt.readGeometry($scope.displayedUserAreas[idx].extent, {
            dataProjection: 'EPSG:4326',
            featureProjection: areaMapService.getMapProjectionCode()
        });
        areaMapService.zoomToGeom(geom);

        //Filter wms layer
        areaMapService.mergeParamsGid($scope.displayedUserAreas[idx].id, "AREAGROUPS", true);
    };

    //Get area details
    $scope.getAreaDetails = function(idx){
        loadingStatus.isLoading('AreaManagement',true,3);
        areaRestService.getUserAreaAsJSON($scope.displayedUserAreas[idx].id).then(function(response){
            loadingStatus.isLoading('AreaManagement',false);
            $scope.openAreaDetailsModal(response);
        }, function(error){
            loadingStatus.isLoading('AreaManagement',false);
            $scope.alert.setError();
            $scope.alert.alertMessage = locale.getString('areas.error_getting_user_area_geojson');
        });
    };

    //Area details modal
    $scope.openAreaDetailsModal = function(data){
        var modalInstance = $uibModal.open({
           templateUrl: 'partial/areas/areaDetails/areaDetails.html',
           controller: 'AreadetailsCtrl',
           size: 'md',
           resolve: {
               areaData: function(){
                   return data;
               }
           }
        });
        $scope.helper.configureFullscreenModal(modalInstance);
    };

    $scope.openAreaGroupEditorModal = function(){
    	var modalInstance = $uibModal.open({
            templateUrl: 'partial/areas/areaGroupEditorModal/areaGroupEditorModal.html',
            controller: 'AreagroupeditormodalCtrl',
            size: 'md',
            resolve: {
                areaGroupName: function(){
                    return $scope.areaGroup.type;
                }
            }
         });
         $scope.helper.configureFullscreenModal(modalInstance);

         modalInstance.result.then(function(data){
        	if(data !== 'cancel'){
        		$scope.alert.setSuccess();
                $scope.alert.alertMessage = data;
                $scope.alert.hideAlert();
        	}
        });
    };

    init();
});
