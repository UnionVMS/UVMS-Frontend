angular.module('unionvmsWeb').controller('SystemareasCtrl',function($scope,projectionService,areaAlertService,areaRestService,spatialRestService,areaMapService,areaHelperService,locale){
    $scope.alert = areaAlertService;
    $scope.map = areaMapService.map;
	$scope.sysAreaType = "";
	$scope.selectedProj = "";
	$scope.isSaving = false;
	$scope.validFile = {isValid: undefined};
	$scope.projections = projectionService;
	$scope.helper = areaHelperService;
	$scope.editingType = 'upload';
	$scope.metadataAvailable = false;
    
	$scope.fileNameChanged = function(elem){
		$scope.SysareasForm.areaFile.$setDirty();
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
	
	
	//Uploading new file
    $scope.save = function(){
        $scope.saved = true;
        $scope.isSaving = true;
        if ($scope.SysareasForm.$valid && $scope.validFile.isValid){
            $scope.alert.setLoading(locale.getString('areas.uploading_message'));
            var projCode = $scope.projections.getProjectionEpsgById($scope.selectedProj);
        	if(angular.isDefined(projCode) && $scope.sysAreaType){
        		var objTest = {
        				"uploadedFile": $scope.files[0],
        				"crs": projCode,
        				"areaType": $scope.sysAreaType
        		};
        		spatialRestService.uploadFile(objTest).then(
				    function (data) {
				        $scope.alert.removeLoading();
				    	$scope.alert.setSuccess();
				        $scope.alert.alertMessage = locale.getString('areas.upload_system_area_success');
				        $scope.alert.hideAlert();
				    	$scope.isSaving = false;
				    	$scope.saved = false;
				    }, function(error) {
				        $scope.alert.removeLoading();
				    	$scope.alert.setError();
				        $scope.alert.alertMessage = locale.getString('areas.upload_system_area_error') + error.data.msg;
				        $scope.alert.hideAlert();
				    	$scope.isSaving = false;
				    	$scope.saved = false;
				    }
			    );
        	}else{
        	    $scope.alert.removeLoading();
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
    
    //Updating metadata
    $scope.saveMetadata = function(){
        if ($scope.metadataForm.$valid){
            $scope.alert.setLoading(locale.getString('areas.updating_metadata'));
            areaRestService.updateLayerMetadata($scope.helper.metadata).then(function(response){
                $scope.alert.removeLoading();
                $scope.alert.setSuccess();
                $scope.alert.alertMessage = locale.getString('areas.updating_metadata_success');
                $scope.alert.hideAlert();
            }, function(error){
                $scope.alert.removeLoading();
                $scope.alert.setError();
                $scope.alert.alertMessage = locale.getString('areas.updating_metadata_error');
                $scope.alert.hideAlert();
            });
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
    
    $scope.init = function(){
        $scope.saved = false;
        if ($scope.projections.items.length === 0){
            $scope.projections.getProjections();
        }
    };
    
    $scope.$watch('sysAreaType', function(newVal, oldVal){
        if (!angular.isDefined(newVal)){
            areaMapService.removeLayerByType($scope.helper.displayedLayerType);
            $scope.helper.displayedLayerType = undefined;
            $scope.helper.displayedSystemAreaLayer = undefined;
        }
        
        if (angular.isDefined(newVal) && newVal !== oldVal){
            $scope.helper.resetMetadata();
            $scope.helper.displayedSystemAreaLayer = newVal;
            var item = $scope.getFullDefForItem(newVal);
            
            if (angular.isDefined(item)){
                if (angular.isDefined($scope.helper.displayedLayerType)){
                    areaMapService.removeLayerByType($scope.helper.displayedLayerType);
                    $scope.helper.displayedLayerType = undefined;
                    
                }
                areaMapService.addWMS(item);
                $scope.helper.displayedLayerType = item.typeName;
                
                if ($scope.editingType === 'metadata'){
                    $scope.metadataForm.$setPristine();
                    $scope.alert.setLoading(locale.getString('areas.getting_area_metadata'));
                    areaRestService.getLayerMetadata(item.typeName).then(getMetadataSuccess, getMetadataFailure);
                }
            }
        }
    });
    
    $scope.$watch('editingType', function(newVal, oldVal){
        $scope.helper.resetMetadata();
        if (angular.isDefined(newVal) && newVal !== oldVal && newVal === 'metadata'){
            $scope.alert.setLoading(locale.getString('areas.getting_area_metadata'));
            var item = $scope.getFullDefForItem($scope.sysAreaType);
            areaRestService.getLayerMetadata(item.typeName).then(getMetadataSuccess, getMetadataFailure);
        }
    });
    
    var getMetadataSuccess = function(response){
        $scope.metadataAvailable = true;
        $scope.helper.setMetadata(response);
        $scope.alert.removeLoading();
    };
    
    var getMetadataFailure = function(error){
        $scope.metadataAvailable = false;
        $scope.alert.removeLoading();
        $scope.alert.setError();
        $scope.alert.alertMessage = locale.getString('areas.error_getting_user_area_layer');
        $scope.alert.hideAlert();
    };
    
    locale.ready('areas').then(function(){
        $scope.init();
        if ($scope.selectedTab === 'SYSAREAS'){
            $scope.helper.tabChange('SYSAREAS');
        }
    });

});