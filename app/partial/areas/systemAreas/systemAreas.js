angular.module('unionvmsWeb').controller('SystemareasCtrl',function($scope,genericMapService,projectionService,areaAlertService,areaRestService,spatialRestService,areaMapService,areaHelperService,areaClickerService,locale,Area,$modal,loadingStatus){
    $scope.alert = areaAlertService;
	$scope.sysAreaType = "";
	$scope.dataConfig = {selectedProj: "", name: "", code: ""};
	$scope.isSaving = false;
	$scope.validFile = {isValid: undefined};
	$scope.projections = projectionService;
	$scope.helper = areaHelperService;
	$scope.metadataAvailable = false;
	$scope.sysSelection = "map";
	$scope.datasetNew = {};
	$scope.clickerServ = areaClickerService;
    $scope.wizardStep = 1;
    $scope.dbAttrs = [];
    $scope.shpAttrs = [];
    $scope.selectedAttrs = [];
    
	$scope.fileNameChanged = function(elem){
		$scope.SysareasForm.selectFileForm.areaFile.$setDirty();
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
        $scope.isSaving = true;
        if ($scope.SysareasForm.selectFileForm.$valid && $scope.validFile.isValid){
            loadingStatus.isLoading('AreaManagement',true,7);
            var projCode = $scope.projections.getProjectionEpsgById($scope.dataConfig.selectedProj);
        	if(angular.isDefined(projCode) && $scope.sysAreaType){
        		var objTest = {
        				"uploadedFile": $scope.files[0],
        				"crs": projCode,
        				"areaType": $scope.sysAreaType
        		};
        		spatialRestService.uploadFile(objTest).then(
				    function (data) {
                        loadingStatus.isLoading('AreaManagement',false);
				    	$scope.alert.setSuccess();
				        $scope.alert.alertMessage = locale.getString('areas.upload_system_area_success');
				    	$scope.isSaving = false;
				    }, function(error) {
                        loadingStatus.isLoading('AreaManagement',false);
				    	$scope.alert.setError();
				        $scope.alert.alertMessage = locale.getString('areas.upload_system_area_error') + error.data.msg;
				    	$scope.isSaving = false;
				    }
			    );
        	}else{
                loadingStatus.isLoading('AreaManagement',false);
        		$scope.alert.setError();
        	    $scope.alert.alertMessage = locale.getString('areas.upload_system_area_invalid_field_error');
        		$scope.isSaving = false;
        	}
        } else {
        	$scope.isSaving = false;
        	$scope.alert.setError();
            $scope.alert.alertMessage = locale.getString('areas.upload_system_area_required_fields_error');
        }
    };
    
    //Updating metadata
    $scope.saveMetadata = function(){
        if ($scope.metadataForm.$valid){
            loadingStatus.isLoading('AreaManagement',true,8);
            areaRestService.updateLayerMetadata($scope.helper.metadata).then(function(response){
                loadingStatus.isLoading('AreaManagement',false);
                $scope.alert.setSuccess();
                $scope.alert.alertMessage = locale.getString('areas.updating_metadata_success');
            }, function(error){
                loadingStatus.isLoading('AreaManagement',false);
                $scope.alert.setError();
                $scope.alert.alertMessage = locale.getString('areas.updating_metadata_error');
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
        if ($scope.projections.items.length === 0){
            $scope.projections.getProjections();
        }
    };
    
    $scope.$watch('sysAreaType', function(newVal, oldVal){
        if (!angular.isDefined(newVal)){
            areaMapService.removeLayerByType($scope.helper.displayedLayerType);
            $scope.helper.displayedLayerType = undefined;
            $scope.helper.displayedSystemAreaLayer = undefined;
            $scope.helper.updateSlider(newVal);
        }
        
        if (angular.isDefined(newVal) && newVal !== oldVal){
        	resetDatasetTab();
        	$scope.helper.resetMetadata();
            $scope.helper.displayedSystemAreaLayer = newVal;
            $scope.helper.updateSlider(newVal);
            var item = $scope.getFullDefForItem(newVal);
            
            if (angular.isDefined(item)){
                if (angular.isDefined($scope.helper.displayedLayerType)){
                    areaMapService.removeLayerByType($scope.helper.displayedLayerType);
                    $scope.helper.displayedLayerType = undefined;
                    
                }
                areaMapService.addWMS(item);
                $scope.helper.displayedLayerType = item.typeName;
                
                if ($scope.helper.sysAreasEditingType === 'metadata'){
                    $scope.metadataForm.$setPristine();
                    loadingStatus.isLoading('AreaManagement',true,9);
                    areaRestService.getLayerMetadata(item.typeName).then(getMetadataSuccess, getMetadataFailure);
                }
                if($scope.helper.sysAreasEditingType === 'upload'){
                    resetUploadTab();
                }
            }
        }
        
        
    });
    
    //Add system areas by search
    $scope.convertAreasResponse = function(data){
        var areas = [];
        for (var i = 0; i < data.length; i++){
            var area = new Area();
            area = area.fromJson(data[i]);
            areas.push(area);
        }
        
        return areas; 
    };
    
    $scope.searchSysAreas = function(){
        if (angular.isDefined($scope.searchSysString) && $scope.searchSysString !== ''){
            $scope.searchLoading = true;
            $scope.sysAreaSearch = [];
            var requestData = {
                areaType: $scope.sysAreaType,
                filter: $scope.searchSysString
            };
            spatialRestService.getAreasByFilter(requestData).then(function(response){
                $scope.sysAreaSearch = $scope.convertAreasResponse(response.data);
                $scope.updateContainerSize();
                $scope.searchLoading = false;
            }, function(error){
                $scope.alert.errorMessage = locale.getString('spatial.area_selection_modal_get<_selected_area_search_error');
                $scope.alert.hasError = true;
                $scope.alert.hideAlert();
                $scope.searchLoading = false;
            });
        }
    };
    
    $scope.$watch(function(){return $scope.helper.sysAreasEditingType;}, function(newVal, oldVal){
        $scope.helper.resetMetadata();
        if (angular.isDefined(newVal) && newVal !== oldVal){
            $scope.clickerServ.deactivate();
            if (newVal === 'metadata'){
                loadingStatus.isLoading('AreaManagement',true,9);
                var item = $scope.getFullDefForItem($scope.sysAreaType);
                areaRestService.getLayerMetadata(item.typeName).then(getMetadataSuccess, getMetadataFailure);
            } else if (newVal === 'dataset'){
                resetDatasetTab();
                $scope.clickerServ.active = true;
            }else if (newVal === 'upload'){
                resetUploadTab();
            }
        }
    });
    
    $scope.$watch('sysSelection', function(newVal, oldVal){
        if (angular.isDefined(newVal) && newVal !== oldVal){
            if (newVal === 'map' && $scope.helper.sysAreasEditingType === 'dataset'){
                $scope.clickerServ.active = true;
            } else {
                $scope.clickerServ.deactivate();
            }
        }
    });
    
    $scope.$watch(function(){return $scope.helper.displayedLayerType;}, function(newVal, oldVal){
        $scope.clickerServ.layerType = newVal;
    });
    
    $scope.$watch(function(){return $scope.clickerServ.data.length;}, function(newVal){
        if ($scope.clickerServ.active){
            if (newVal === 1){
                var rec = $scope.clickerServ.data[0];
                $scope.datasetNew.areaGid = rec.gid;
                $scope.selectedArea = rec.name + ' | ' + rec.code;
            } else {
                $scope.datasetNew = {};
                $scope.selectedArea = undefined;
                $scope.sysAreaSearch = $scope.clickerServ.data; 
            }
            
        }
    });
    
    var getMetadataSuccess = function(response){
        $scope.metadataAvailable = true;
        $scope.helper.setMetadata(response);
        loadingStatus.isLoading('AreaManagement',false);
    };
    
    var getMetadataFailure = function(error){
        $scope.metadataAvailable = false;
        loadingStatus.isLoading('AreaManagement',false);
        $scope.alert.setError();
        $scope.alert.alertMessage = locale.getString('areas.error_getting_user_area_layer');
    };
    
    locale.ready('areas').then(function(){
        $scope.init();
        if ($scope.selectedTab === 'SYSAREAS'){
            $scope.helper.tabChange('SYSAREAS');
        }
    });
    
    $scope.selectArea = function(index,gid){
        loadingStatus.isLoading('AreaManagement',true,10);
    	areaRestService.getDatasets({areaGid: gid, areaType: $scope.sysAreaType}).then(function(response){
    		$scope.datasetNew.areaGid = $scope.displayedRecordsArea[index].gid;
        	$scope.selectedArea = $scope.displayedRecordsArea[index].name + ' | ' + $scope.displayedRecordsArea[index].code;
        	if(response.length){
        		$scope.savedDatasetName = response[0].name;
        		$scope.hasDatasetCreated = true;
        		$scope.alert.setWarning();
                $scope.alert.alertMessage = locale.getString('areas.warning_dataset_already_exists');
                $scope.alert.hideAlert();
        	}else{
        		$scope.hasDatasetCreated = false;
        	}
            loadingStatus.isLoading('AreaManagement',false);
    	}, function(error){
    		loadingStatus.isLoading('AreaManagement',false);
    		$scope.alert.setError();
            $scope.alert.alertMessage = locale.getString('areas.error_checking_if_dataset_exists');
            $scope.alert.hideAlert();
    	});
    };
    
    $scope.createDataset = function() {
        loadingStatus.isLoading('AreaManagement',true,11);
    	$scope.submittedDataset = true;
    	if($scope.datasetForm.$valid){
    		$scope.datasetNew.areaType = $scope.sysAreaType;
    		areaRestService.createDataset($scope.datasetNew).then(function(){
                loadingStatus.isLoading('AreaManagement',false);
        		$scope.alert.setSuccess();
                $scope.alert.alertMessage = locale.getString('areas.create_dataset_success');
                $scope.alert.hideAlert();
    		}, function(error){
                loadingStatus.isLoading('AreaManagement',false);
        		$scope.alert.setError();
                $scope.alert.alertMessage = locale.getString('areas.create_dataset_error');
                $scope.alert.hideAlert();
    		});
    	}else{
    		loadingStatus.isLoading('AreaManagement',false);
    	}
    };
    
    var resetDatasetTab = function(){
    	$scope.datasetNew = {};
    	$scope.selectedArea = undefined;
    	$scope.sysAreaSearch = [];
    	$scope.searchSysString = undefined;
    	$scope.submittedDataset = false;
    	$scope.hasDatasetCreated = false;
    	$scope.sysSelection = 'map';
    	$scope.datasetForm.$setPristine();
    };
    
    var resetUploadTab = function(){
        $scope.wizardStep = 1;
        $scope.dbAttrs = [];
        $scope.shpAttrs = [];
        $scope.selectedAttrs = [];
        $scope.dataConfig = {selectedProj: "", name: "", code: ""};
        $scope.isSaving = false;
	    $scope.validFile = {isValid: undefined};
        $scope.sysAreafile = undefined;
        angular.element(".btn-file > input[type='file']").val(null);
        $scope.SysareasForm.$setPristine();
    };
    
    var resetUploadConfig = function(){
        $scope.selectedAttrs = [];
        $scope.dataConfig = {selectedProj: "", name: "", code: ""};
        $scope.SysareasForm.dataConfigForm.$setPristine();
    };
    
    $scope.mergeParamsWms = function(index, displayedAreasList, areaList){
    	index = areaList.indexOf(displayedAreasList[index]);
        var area = areaList[index];
        var format = new ol.format.WKT();
        var geom = format.readFeature(area.extent).getGeometry();
        geom = genericMapService.intersectGeomWithProj(geom, $scope.map);
        areaMapService.map.getView().fit(geom, areaMapService.map.getSize(), {nearest: false});
        
        var layers = areaMapService.map.getLayers();
        if (layers.getLength() > 1){
            var layer = layers.getArray().find(function(layer){
               return layer.get('type') === area.areaType; 
            });
            
            var cql = "gid = " + parseInt(area.gid);
            var src = layer.getSource();
            src.updateParams({
                time_: (new Date()).getTime(),
                'cql_filter': cql
            });
        }
    };
    
    $scope.nextStep = function(){
        if($scope.wizardStep === 1 && $scope.SysareasForm.selectFileForm.$valid){
            loadingStatus.isLoading('AreaManagement',true,1);
            var objTest = {
                    "uploadedFile": $scope.files[0],
                    "areaType": $scope.sysAreaType
            };
            areaRestService.getAttributesToMap(objTest).then(
                function (data) {
                    resetUploadConfig();
                    loadAttrsOnCombo(data.domain,'dbAttrs');
                    loadAttrsOnCombo(data.file,'shpAttrs');
                    
                    $scope.fileRef = data.ref;
                    
                    $scope.wizardStep += 1;
                    loadingStatus.isLoading('AreaManagement',false);
                }, function(error) {
                    resetUploadConfig();
                    loadingStatus.isLoading('AreaManagement',false);
                }
            );
        }else if($scope.wizardStep === 2 && $scope.SysareasForm.dataConfigForm.$valid){
            $scope.wizardStep += 1;
        }else if($scope.wizardStep === 3){
            loadingStatus.isLoading('AreaManagement',true,2);
            areaRestService.uploadArea(buildDataConfiguration(),$scope.sysAreaType,$scope.projections.getProjectionEpsgById($scope.dataConfig.selectedProj)).then(
                function (data) {
                    resetUploadTab();
                    $scope.alert.setSuccess();
                    $scope.alert.alertMessage = locale.getString('areas.saving_system_area_success');
                    loadingStatus.isLoading('AreaManagement',false);
                    genericMapService.refreshWMSLayer($scope.sysAreaType, areaMapService.map);
                }, function(error) {
                    $scope.alert.setError();
                    $scope.alert.alertMessage = locale.getString('areas.saving_system_area_error');
                    loadingStatus.isLoading('AreaManagement',false);
                }
            );
        }
    };
    
    $scope.previousStep = function(){
        $scope.wizardStep = $scope.wizardStep-1;    
    };
    
    $scope.validateForm = function(){
        if(!angular.isDefined($scope.SysareasForm)){
            return true;
        }
        switch($scope.wizardStep){
            case 1:
                return angular.isDefined($scope.SysareasForm.selectFileForm) ? $scope.SysareasForm.selectFileForm.$invalid : true;
            case 2:
                return angular.isDefined($scope.SysareasForm.dataConfigForm) ? $scope.SysareasForm.dataConfigForm.$invalid : true;
            default:
                return false;
        }
    };
    
    $scope.addNewAttr = function(){
        $scope.selectedAttrs.push({'db': undefined,'shp': undefined});
    };
    
    $scope.getProjectionNameById = function(){
        return _.findWhere($scope.projections.items, {code: $scope.dataConfig.selectedProj}).text;
    };
    
    var loadAttrsOnCombo = function(arr,comboList){
        $scope[comboList] = [];
        angular.forEach(arr,function(item){
            var comboItem = {code:item.name, text:item.name};
            $scope[comboList].push(comboItem);
        });
    };
    
    var buildDataConfiguration = function(){
        var sysAreaToUpload = {
            'ref': $scope.fileRef,
            'mapping': [
                {
                    'source': 'name',
                    'target': $scope.dataConfig.name
                },{
                    'source': 'code',
                    'target': $scope.dataConfig.code
                }
            ]
        };
        
        angular.forEach($scope.selectedAttrs,function(item){
            var attr = {'source': item.db,'target': item.shp};
            sysAreaToUpload.mapping.push(attr);
        });
        
        return sysAreaToUpload;
    };
});