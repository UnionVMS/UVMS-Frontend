angular.module('unionvmsWeb').controller('SystemareasCtrl',function($scope,projectionService,spatialRestService,areaMapService,locale){

	$scope.map = areaMapService.map;
	$scope.systemItems = [];
	$scope.sysAreaType = "";
	$scope.selectedProj = "";
	$scope.isSaving = false;
	$scope.projections = projectionService;
    
	$scope.fileNameChanged = function(elem){
		$scope.filepath = elem.value;
		var filename = $scope.filepath.replace(/^.*[\\\/]/, '');
		var extension = filename.split('.');
		extension = extension[extension.length-1];
		$scope.sysAreafile = filename;
		if(extension === 'zip'){
			$scope.validFile = true;
			$scope.SysareasForm.areaFile.$setValidity('invalidExtension', true);
		}else{
			$scope.validFile = false;
			$scope.SysareasForm.areaFile.$setValidity('invalidExtension', false);
		}
		$scope.$apply(function($scope) {
		   $scope.files = elem.files;         
		 });
	};
	
    $scope.save = function(){
        $scope.saved = true;
        $scope.isSaving = true;
        if ($scope.SysareasForm.$valid && $scope.validFile){
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
    
    $scope.getFullDefForItem = function(type){
        var item;
        for (var i = 0; i < $scope.systemAreaTypes.length; i++){
            if ($scope.systemAreaTypes[i].typeName === type){
                 item = $scope.systemAreaTypes[i];
            }
        }
        return item;
    };
    
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
    
    $scope.addWms = function(item){
        var layer = new ol.layer.Tile({
            type: item.typeName,
            source: new ol.source.TileWMS({
                url: item.serviceUrl,
                serverType: 'geoserver',
                params: {
                    'LAYERS': item.geoName,
                    'TILED': true,
                    'STYLES': item.style,
                    'cql_filter': angular.isDefined(item.cql) ? item.cql : null 
                }
            })
        });
        
        $scope.map.addLayer(layer);
    };
    
    function setSystemItems(){
        spatialRestService.getAreaLayers().then(function(response){
            $scope.systemAreaTypes = response.data;
            for (var i = 0; i < $scope.systemAreaTypes.length; i++){
                $scope.systemItems.push({"text": $scope.systemAreaTypes[i].typeName, "code": $scope.systemAreaTypes[i].typeName});
            }
        }, function(error){
            $scope.errorMessage = locale.getString('spatial.area_selection_modal_get_sys_layers_error');
            $scope.hasError = true;
            $scope.hideAlerts();
        });
    }
    
    $scope.init = function(){
        setSystemItems();
        if ($scope.projections.items.length === 0){
            $scope.projections.getProjections();
        }
    };
    
    
    $scope.$watch('sysAreaType', function(newVal, oldVal){
        if (angular.isDefined(newVal) && newVal !== oldVal){
            $scope.clickResults = 0;
            var item = $scope.getFullDefForItem(newVal);
            if (angular.isDefined(item)){
                $scope.removeLayerByType(oldVal);
                $scope.addWms(item);
            }
        } else {
            $scope.removeLayerByType(oldVal);
        }
    });
    
    locale.ready('areas').then(function(){
        $scope.init();
    });

});