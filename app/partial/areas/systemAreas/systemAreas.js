angular.module('unionvmsWeb').controller('SystemareasCtrl',function($scope,projectionService,spatialRestService,areaMapService,areaHelperService,locale){

	$scope.map = areaMapService.map;
	$scope.sysAreaType = "";
	$scope.selectedProj = "";
	$scope.isSaving = false;
	$scope.validFile = {isValid: undefined};
	$scope.projections = projectionService;
	$scope.helper = areaHelperService;
	$scope.editingType = 'upload';
    
	$scope.fileNameChanged = function(elem){
		if(elem.value){
			$scope.filepath = elem.value;
			var filename = $scope.filepath.replace(/^.*[\\\/]/, '');
			$scope.$apply(function($scope) {
				$scope.sysAreafile = filename;
				$scope.validFile.isValid = true;
				$scope.files = elem.files;         
			 });
		}else{
			$scope.$apply(function($scope) {
				$scope.sysAreafile = undefined;
				$scope.validFile.isValid = false;
			});
		}
	};
	
    $scope.save = function(){
        $scope.saved = true;
        $scope.isSaving = true;
        if ($scope.SysareasForm.$valid && $scope.validFile.isValid){
            var projCode = $scope.projections.getProjectionEpsgById($scope.selectedProj);
        	if(angular.isDefined(projCode) && $scope.sysAreaType){
        		var objTest = {
        				"uploadedFile": $scope.files[0],
        				"crs": projCode,
        				"areaType": $scope.sysAreaType
        		};
        		spatialRestService.uploadFile(objTest).then(
				    function (data) {
				    	$scope.alert.setSuccess();
				        $scope.alert.alertMessage = locale.getString('areas.upload_system_area_success');
				        $scope.alert.hideAlert();
				    	$scope.isSaving = false;
				    }, function(error) {
				    	$scope.alert.setError();
				        $scope.alert.alertMessage = locale.getString('areas.upload_system_area_error');
				        $scope.alert.hideAlert();
				    	$scope.isSaving = false;
				    }
			    );
        	}else{
        		$scope.alert.setError();
        	    $scope.alert.alertMessage = locale.getString('areas.upload_system_area_invalid_field_error');
        	    $scope.alert.hideAlert();
        		$scope.isSaving = false;
        	}
        } else {
        	$scope.isSaving = false;
        	$scope.alert.setError();
            $scope.alert.alertMessage = locale.getString('areas.upload_system_area_required_fields_error');
            $scope.alert.hideAlert();
        }
    };
    
    //Get full definition for data types, so that we can add the layer to the map
    $scope.getFullDefForItem = function(type){
        var item;
        for (var i = 0; i < $scope.helper.systemAreaTypes.length; i++){
            if ($scope.helper.systemAreaTypes[i].typeName === type){
                 item = $scope.helper.systemAreaTypes[i];
            }
        }
        return item;
    };
    
    //TODO  remove this stuff, use areamapservice instead
    $scope.removeLayerByType = function(layerType){
        if (angular.isDefined($scope.map)){
            var mapLayers = $scope.map.getLayers();
            if (mapLayers.getLength() > 1){
                var layer = mapLayers.getArray().find(function(layer){
                    return layer.get('type') === layerType;
                });
                $scope.map.removeLayer(layer);
            }
        }
    };
    
    $scope.init = function(){
        if ($scope.projections.items.length === 0){
            $scope.projections.getProjections();
        }
    };
    
    
    $scope.$watch('sysAreaType', function(newVal, oldVal){
        if (angular.isDefined(newVal) && newVal !== oldVal){
            var item = $scope.getFullDefForItem(newVal);
            
            if (angular.isDefined(item)){
                if (angular.isDefined($scope.helper.displayedLayerType)){
                    areaMapService.removeLayerByType($scope.helper.displayedLayerType);
                }
                areaMapService.addWMS(item);
                $scope.helper.displayedLayerType = item.typeName;
            }
        }
    });
    
    locale.ready('areas').then(function(){
        $scope.init();
    });

});