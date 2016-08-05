angular.module('unionvmsWeb').controller('UserareasgroupsCtrl',function($scope, locale, areaRestService, areaHelperService, areaMapService, $modal, userService, loadingStatus){
	$scope.areaHelper = areaHelperService;
	$scope.areaGroup = {'type': ''};
	$scope.currentContext = undefined;
	$scope.tableLoading = false;
	
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
		    $scope.tableLoading = true;
			angular.forEach($scope.areaHelper.userAreasGroups, function(item) {
				if($scope.areaGroup.type === item.code){
				    areaHelperService.getUserAreaGroupLayer($scope.areaGroup.type);
				    $scope.areaHelper.displayedUserAreaGroup = $scope.areaGroup.type;
					areaRestService.getAreasByType(item.text).then(function(response){
			            $scope.userAreasList = response;
			            $scope.displayedUserAreas = [].concat($scope.userAreasList);
			            $scope.tableLoading = false;
			        }, function(error){
			            $scope.tableLoading = false;
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
        $scope.areaHelper.deactivateFullscreen();
        var modalInstance = $modal.open({
           templateUrl: 'partial/areas/areaDetails/areaDetails.html',
           controller: 'AreadetailsCtrl',
           size: 'md',
           resolve: {
               areaData: function(){
                   return data;
               }
           }
        });
    };
    
    $scope.openAreaGroupEditorModal = function(){
        $scope.areaHelper.deactivateFullscreen();
    	var modalInstance = $modal.open({
            templateUrl: 'partial/areas/areaGroupEditorModal/areaGroupEditorModal.html',
            controller: 'AreagroupeditormodalCtrl',
            size: 'md',
            resolve: {
                areaGroupName: function(){
                    return $scope.areaGroup.type;
                }
            }
         });

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