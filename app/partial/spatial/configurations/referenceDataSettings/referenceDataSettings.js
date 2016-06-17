angular.module('unionvmsWeb').controller('SystemareassettingsCtrl',function($scope, locale, $localStorage, $interval, $timeout, genericMapService, projectionService, spatialRestService, comboboxService, spatialConfigAlertService, $anchorScroll, loadingStatus, spatialConfigRestService, SpatialConfig, $location){
    $scope.status = {
        isOpen: false
    };
    
    $scope.currentSelection = {
        selectedAreaType: undefined,
        areaSelector: 'all',
        selectionType: 'map',
        searchString: undefined
    };
    
    $scope.alert = {
        hasAlert: false,
        hasError: false,
        hasSuccess: false,
        hasWarning: false,
        alertMessage: undefined,
        hideAlert: function(timeoutInMilliSeconds){
            var alertObj = this;
            if (angular.isUndefined(timeoutInMilliSeconds)) {
                timeoutInMilliSeconds = 3000;
            }
            $timeout(function(){
                alertObj.hasAlert = false;
                alertObj.hasError = false;
                alertObj.hasSuccess = false;
                alertObj.hasWarning = false;
                alertObj.alertMessage = undefined;
            }, timeoutInMilliSeconds, true, alertObj);
        }
    };
    
    $scope.displayCodes = []; //List of codes displayed on the area selection card on the right
    
    $scope.searchString = undefined;
    $scope.srcSysAreas = undefined;
    $scope.systemAreaItems = [];
    $scope.isLoadingAreaTypes = false;
    
    //Area selector type
    $scope.isAreaSelectorComboVisible = false;
    $scope.areaSelectorTypeItems = [
       {"text": locale.getString('spatial.area_selection_type_all_areas'), "code": "all"},
       {"text": locale.getString('spatial.area_selection_type_custom'), "code": "custom"}
    ];
    
    $scope.isLoading = false; //to use on map click
    
    //Ref data type change
    $scope.$watch('currentSelection.selectedAreaType',function(newVal,oldVal){
        $scope.displayCodes = [];
        $scope.clearSearchProps();
        $scope.currentSelection.selectionType = 'map';
        $scope.clickResultsMap = true;
        if (angular.isDefined($scope.currentSelection.selectedAreaType)){
            $scope.isAreaSelectorComboVisible = true;
            //TODO copy to model
            
            if (!angular.isDefined($scope.configModel.referenceDataSettings[$scope.currentSelection.selectedAreaType])){
                $scope.configModel.referenceDataSettings[$scope.currentSelection.selectedAreaType] = {
                    selection: 'all',
                    codes: []
                };
                
                $scope.currentSelection.areaSelector = 'all';
            } else {
                if ($scope.configModel.referenceDataSettings[$scope.currentSelection.selectedAreaType].codes.length === 0){
                    $scope.configModel.referenceDataSettings[$scope.currentSelection.selectedAreaType].selection = 'all';
                    $scope.currentSelection.areaSelector = 'all';
                } else {
                    $scope.currentSelection.areaSelector = $scope.configModel.referenceDataSettings[$scope.currentSelection.selectedAreaType].selection;
                    $scope.displayCodes = $scope.configModel.referenceDataSettings[$scope.currentSelection.selectedAreaType].codes; 
                }
            }
            
            //Clear map
            $scope.removeWMS($scope.currentSelection.selectedAreaType);
            
            if ($scope.currentSelection.areaSelector === 'custom'){
                $scope.updateMap();
            }
        } else {
            $scope.isAreaSelectorComboVisible = false;
        }
    });
    
    //Selection type change
    $scope.changeSelectionType = function(){
        $scope.configModel.referenceDataSettings[$scope.currentSelection.selectedAreaType].selection = $scope.currentSelection.areaSelector;
        if ($scope.currentSelection.areaSelector === 'custom'){
            $scope.updateMap();
        } else {
            $scope.removeAllCodes();
        }
    };
    
    //Get Ref data types
    $scope.getSysAreaLayers = function(){
        $scope.isLoadingAreaTypes = true;
        spatialRestService.getAreaLocationLayers().then(function(response){
            $scope.srcSysAreas = response.data;
            angular.forEach(response.data, function(item) {
            	$scope.systemAreaItems.push({"text": item.typeName, "code": item.typeName.toLowerCase()});
            });
            $scope.isLoadingAreaTypes = false;
        }, function(error){
            comboboxService.closeCurrentCombo();
            $scope.alert.hasAlert = true;
            $scope.alert.hasError = true;
            $scope.alert.alertMessage = locale.getString('spatial.get_ref_data_type_error');
            $scope.alert.hideAlert();
        });
    };
    
    $scope.$watch('status.isOpen', function(newVal){
        if (angular.isDefined(newVal) && newVal === true && $scope.systemAreaItems.length === 0){
            //Load reference data types
            $scope.getSysAreaLayers();
        }
    });
    
    $scope.$watch('currentSelection.selectionType', function(newVal, oldVal){
        $scope.clearSearchProps();
        if (angular.isDefined(newVal) && newVal === 'map'){
            $scope.clickResultsMap = true;
        }
    });
    
    //SELECT ON MAP
    $scope.clickResultsMap = true;
    $scope.selectAreaFromMap = function(data){
        spatialRestService.getAreaDetails(data).then(function(response){
            var area;
            $scope.isLoading = false;
            $scope.clickResults = response.data.length;
            if ($scope.clickResults > 0){
                if ($scope.clickResults === 1){
                    $scope.checkAndAddToSelection(response.data[0].code);
                } else {
                    $scope.refDataRecords = $scope.convertRefData(response.data, true);
                    $scope.clickResultsMap = false;
                }
            } else {
                $scope.alert.hasAlert = true;
                $scope.alert.hasWarning = true;
                $scope.alert.alertMessage = locale.getString('spatial.ref_data_empty_search_by_click_msg');
                $scope.alert.hideAlert();
            }
        }, function(error){
            $scope.isLoading = false;
            $scope.errorMessage = locale.getString('spatial.get_ref_data_details_error');
            $scope.hasError = true;
            $scope.hideAlert();
            $scope.mapLoading = false;
        });
    };
    
    $scope.goBackToMap = function(){
        $scope.clickResultsMap = true;
    };
    
    //SELECT TABLE
    $scope.itemsByPage = 5;
    $scope.refDataRecords = [];
    $scope.displayedRefDataRecords = [].concat($scope.refDataRecords);
    $scope.searchByProps = function(){
        if (angular.isDefined($scope.currentSelection.searchString) && $scope.currentSelection.searchString !== ''){
            $scope.isLoading = true;
            $scope.refDataRecords = [];
            var requestData = {
                areaType: $scope.currentSelection.selectedAreaType,
                filter: $scope.currentSelection.searchString
            };
            spatialRestService.getAreasByCode(requestData).then(function(response){
                $scope.isLoading = false;
                if (response.data.length > 0){
                    $scope.refDataRecords = $scope.convertRefData(response.data, false);
                } else {
                    $scope.alert.hasAlert = true;
                    $scope.alert.hasWarning = true;
                    $scope.alert.alertMessage = locale.getString('spatial.ref_data_empty_search_by_prop_msg');
                    $scope.alert.hideAlert();
                }
            }, function(error){
                $scope.isLoading = false;
                $scope.errorMessage = locale.getString('spatial.get_ref_data_details_error');
                $scope.hasError = true;
                $scope.hideAlert();
                $scope.mapLoading = false;
            });
        }
    };
    
    $scope.toggleRowDetails = function(rec){
        rec.isExpanded = !rec.isExpanded;
    };
    
    $scope.convertRefData = function(data, fromClick){
        if (fromClick){
            var refData = [];
            var availableCodes = [];
            angular.forEach(data, function(rec) {
                if (_.indexOf(availableCodes, rec.code) === -1){
                    refData.push({
                        code: rec.code,
                        isSelected: _.indexOf($scope.displayCodes, rec.code) === -1 ? false : true,
                        isExpanded: false,
                        areaNames: [rec.name]
                    });
                    availableCodes.push(rec.code);
                } else {
                    var recContainer = _.findWhere(refData, {code: rec.code});
                    recContainer.areaNames.push(rec.name);
                }
            });
              
            return refData;
        } else {
            angular.forEach(data, function(rec) {
                rec.isSelected = _.indexOf($scope.displayCodes, rec.code) === -1 ? false : true;
                rec.isExpanded = false;
            });
            
            return data;
        }
    };
    
    $scope.clearSearchProps = function(){
        $scope.refDataRecords = [];
        $scope.currentSelection.searchString = undefined;
    };
    
    $scope.getGroupTip = function(rec){
        return rec.areaNames.length + ' ' + locale.getString('spatial.ref_data_group_tip');
    };
    
    $scope.getSelectionTip = function(number){
        return number + ' ' + locale.getString('spatial.ref_data_selection_group_tip');
    };
    
    $scope.selectAreaFromTable = function(record){
        if (record.isSelected){
            $scope.removeCode(record.code, false);
        } else {
            $scope.checkAndAddToSelection(record.code);
        }
        record.isSelected = !record.isSelected;
    };
    
    $scope.selectAllAreasFromTable = function(){
        angular.forEach($scope.refDataRecords, function(record) {
        	if (!record.isSelected){
        	    $scope.checkAndAddToSelection(record.code);
        	    record.isSelected = true;
        	}
        });
    };
    
    $scope.checkAndAddToSelection = function(code){
        $scope.configModel.referenceDataSettings[$scope.currentSelection.selectedAreaType].codes = _.uniq($scope.configModel.referenceDataSettings[$scope.currentSelection.selectedAreaType].codes);
        $scope.displayCodes = _.uniq($scope.displayCodes);
        if (_.indexOf($scope.displayCodes, code) === -1){
            $scope.configModel.referenceDataSettings[$scope.currentSelection.selectedAreaType].codes.push(code);
            $scope.displayCodes.push(code);
        } else {
            $scope.alert.hasAlert = true;
            $scope.alert.hasWarning = true;
            $scope.alert.alertMessage = locale.getString('spatial.ref_data_group_already_added_msg');
            $scope.alert.hideAlert();
        }
    };
    
    $scope.removeCode = function(code, fromCard){
        var idx = _.indexOf($scope.displayCodes, code);
        if (idx !== -1){
            $scope.displayCodes.splice(idx, 1);
            idx = _.indexOf($scope.configModel.referenceDataSettings[$scope.currentSelection.selectedAreaType].codes, code); 
            $scope.configModel.referenceDataSettings[$scope.currentSelection.selectedAreaType].codes.splice(idx, 1);
        }
        
        if (fromCard){
            var rec = _.findWhere($scope.refDataRecords, {code: code});
            if (angular.isDefined(rec)){
                rec.isSelected = false;
            }
        }
    };
    
    $scope.removeAllCodes = function(){
        $scope.configModel.referenceDataSettings[$scope.currentSelection.selectedAreaType].codes = [];
        $scope.displayCodes = [];
        
        if ($scope.refDataRecords.length !== 0){
            angular.forEach($scope.refDataRecords, function(record) {
            	record.isSelected = false;
            });
        }
    };
    
    //MAP 
    $scope.updateMap = function(){
        if (!angular.isDefined($scope.map)){
            setMap();
            $scope.mapInterval = $interval(function(){
                var mapEl = angular.element('#sys-areas-map');
                if (mapEl.length > 0){
                    $scope.stopInterval();
                    $scope.map.updateSize();
                    $scope.addWMS();
                }
            }, 10);
        } else {
            $scope.addWMS();
        }
    };
    
    $scope.stopInterval = function(){
        $interval.cancel($scope.mapInterval);
        $scope.mapInterval = undefined;
    };
    
    $scope.removeWMS = function(selectedAreaType){
        if (angular.isDefined($scope.map)){
            var layers = $scope.map.getLayers().getArray();
            angular.forEach(layers, function(layer) {
                if (layer.get('type') === 'WMS' && layer.get('areaType') !== selectedAreaType){
                    $scope.map.removeLayer(layer);
                }
            });
        }
    };
    
    $scope.addWMS = function(){
        var layerDef = _.findWhere($scope.srcSysAreas, {typeName: $scope.currentSelection.selectedAreaType});
        if (angular.isDefined(layerDef)){
            var mapExtent = $scope.map.getView().getProjection().getExtent();
            var config = {
                url: layerDef.serviceUrl,
                serverType: 'geoserver',
                params: {
                    time_: (new Date()).getTime(),
                    'LAYERS': layerDef.geoName,
                    'TILED': true,
                    'TILESORIGIN': mapExtent[0] + ',' + mapExtent[1],
                    'STYLES': angular.isDefined(layerDef.style) ? layerDef.style : ''
                }
            };
            var layer = genericMapService.defineWms(config);
            $scope.map.addLayer(layer);
        }
    };
    
    
    function setMap(){
        var osm = genericMapService.defineOsm();
        
        //FIXME fetch this through service
        var projObj = projectionService.getFullProjByEpsg('3857');
        var projection = genericMapService.setProjection(projObj);
        
        var view = new ol.View({
            projection: projection,
            center: ol.proj.transform([10, 40], 'EPSG:4326', 'EPSG:3857'), //FIXME
            zoom: 1,
            maxZoom: 19,
            enableRotation: false
        });
        
        var controls = [];
        var interactions = [];
        controls.push(new ol.control.Attribution({
            collapsible: false,
            collapsed: false
        }));
        
        controls.push(new ol.control.Zoom({
            zoomInTipLabel: locale.getString('spatial.map_tip_zoomin'),
            zoomOutTipLabel: locale.getString('spatial.map_tip_zoomout')
        }));
        
        interactions.push(new ol.interaction.DragPan());
        interactions.push(new ol.interaction.MouseWheelZoom());
        interactions.push(new ol.interaction.DoubleClickZoom());

        var map = new ol.Map({
            target: 'sys-areas-map',
            controls: controls,
            interactions: interactions,
            logo: false
        });
        
        map.beforeRender(function(map){
            map.updateSize();
        });
        
        map.addLayer(osm);
        map.setView(view);
        
        $scope.map = map;
        
        map.on('singleclick', function(evt){
            if ($scope.currentSelection.selectionType === 'map' && angular.isDefined($scope.currentSelection.selectedAreaType) && $scope.currentSelection.areaSelector === 'custom'){
                $scope.isLoading = true;
                var projection = $scope.map.getView().getProjection().getCode();
                var requestData = {
                    areaType: $scope.currentSelection.selectedAreaType,
                    isGeom: false,
                    longitude: evt.coordinate[0],
                    latitude: evt.coordinate[1],
                    crs: projection.split(':')[1]
                };
                
                $scope.selectAreaFromMap(requestData);
            }
        });
    }

    $scope.reset = function(){
		loadingStatus.isLoading('ResetPreferences',true);
        var item = {
            referenceDataSettings: {}
        };
        
        if($scope.isUserPreference){
	        spatialConfigRestService.resetSettings(item).then(resetSuccess, resetFailure);
		}else if($scope.isReportConfig){
	    	spatialConfigRestService.getUserConfigs().then(getConfigsSuccess, getConfigsFailure);
	    }
    };

    var resetSuccess = function(response){
        $scope.configModel.referenceDataSettings = response.referenceDataSettings;
        if (angular.isDefined($scope.configCopy)){
            angular.copy($scope.configModel.referenceDataSettings, $scope.configCopy.referenceDataSettings);
        }
        $anchorScroll();
        spatialConfigAlertService.hasAlert = true;
        spatialConfigAlertService.hasSuccess = true;
        spatialConfigAlertService.alertMessage = locale.getString('spatial.user_preferences_reset_layers_success');
        spatialConfigAlertService.hideAlert();
        
        $scope.currentSelection = {
            selectedAreaType: undefined,
            areaSelector: 'all',
            selectionType: 'map',
            searchString: undefined
        };

		if(angular.isDefined($scope.systemAreasSettingsForm)){
        	$scope.systemAreasSettingsForm.$setPristine();
		}
        $scope.configModel.referenceDataSettings.reseted = true;
        loadingStatus.isLoading('ResetPreferences',false);
    };
    
    var resetFailure = function(error){
        $anchorScroll();
        spatialConfigAlertService.hasAlert = true;
        spatialConfigAlertService.hasError = true;
        spatialConfigAlertService.alertMessage = locale.getString('spatial.user_preferences_reset_layers_failure');
        spatialConfigAlertService.hideAlert();
        loadingStatus.isLoading('ResetPreferences',false);
    };

    var getConfigsSuccess = function(response){
	    $scope.srcConfigObj = response;
	    var model = new SpatialConfig();
	    $scope.userConfig = model.forUserPrefFromJson(response);
	    $scope.configModel.referenceDataSettings = {};
        if(angular.isDefined($scope.configModel.referenceDataSettings)){
        	angular.copy($scope.userConfig.referenceDataSettings, $scope.configModel.referenceDataSettings);
        }

        if($scope.isReportConfig){
		    $location.hash('mapConfigurationModal');
			$anchorScroll();
			$location.hash('');
        }
        
        $anchorScroll();
	    spatialConfigAlertService.hasAlert = true;
	    spatialConfigAlertService.hasSuccess = true;
	    spatialConfigAlertService.alertMessage = locale.getString('spatial.user_preferences_reset_layers_success');
        spatialConfigAlertService.hideAlert();
        
        $scope.currentSelection = {
            selectedAreaType: undefined,
            areaSelector: 'all',
            selectionType: 'map',
            searchString: undefined
        };

        if(angular.isDefined($scope.systemAreasSettingsForm)){
        	$scope.systemAreasSettingsForm.$setPristine();
		}
        $scope.configModel.referenceDataSettings.reseted = true;
        loadingStatus.isLoading('ResetPreferences',false);
	};
	
	var getConfigsFailure = function(error){
	    $anchorScroll();
	    $scope.alert.hasAlert = true;
	    $scope.alert.hasError = true;
	    $scope.alert.alertMessage = locale.getString('spatial.user_preferences_reset_layers_failure');
	    $scope.alert.hideAlert();
	    loadingStatus.isLoading('ResetPreferences',false);
	};

});