angular.module('unionvmsWeb').controller('UserareasgroupsCtrl',function($scope, locale, areaRestService, areaHelperService, areaMapService, $modal, userService){
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
			            $scope.alert.hideAlert();
			        });
					
					
				}
			});
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
        $scope.alert.setLoading(locale.getString('areas.getting_area'));
        areaRestService.getUserAreaAsJSON($scope.displayedUserAreas[idx].id).then(function(response){
            $scope.alert.removeLoading();
            $scope.openAreaDetailsModal(response);
        }, function(error){
            $scope.alert.removeLoading();
            $scope.alert.setError();
            $scope.alert.alertMessage = locale.getString('areas.error_getting_user_area_geojson');
            $scope.alert.hideAlert();
        });
    };
    
    //Area details modal
    $scope.openAreaDetailsModal = function(data){
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
    
    $scope.isUserAllowed = function(requiredFeature) {
        var isAllowed = false;

        if (angular.isDefined($scope.currentContext.role.features)) {
            var features = $scope.currentContext.role.features.slice(0);
            var discoveredFeature = features.find(function(feature){return feature.featureName === requiredFeature;});

           if (angular.isDefined(discoveredFeature)) {
               isAllowed = true;
           }
        }

        return isAllowed;
    };
	
    init();
});