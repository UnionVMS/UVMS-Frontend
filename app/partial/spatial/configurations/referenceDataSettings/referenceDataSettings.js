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
angular.module('unionvmsWeb').controller('SystemareassettingsCtrl',function($scope, locale, $localStorage, $interval, $timeout, mapReference, genericMapService, projectionService, spatialRestService, comboboxService, spatialConfigAlertService, $anchorScroll, loadingStatus, spatialConfigRestService, SpatialConfig, $location){
    mapReference.refData = {};
    $scope.status = {
        isOpen: false
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
    
    
    genericMapService.setMapBasicConfigs();
    
    //Ref data type change
    $scope.$watch('currentSelection.selectedAreaType',function(newVal,oldVal){
        $scope.displayCodes = [];
        $scope.clearSearchProps();
        $scope.currentSelection.selectionType = 'map';
        $scope.clickResultsMap = true;
        if (angular.isDefined($scope.currentSelection.selectedAreaType)){
            $scope.isAreaSelectorComboVisible = true;
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
            $scope.removeWMS($scope.currentSelection.selectedAreaType.toUpperCase());
            
            if ($scope.currentSelection.areaSelector === 'custom'){
                $scope.updateMap();
            }
        } else {
            $scope.isAreaSelectorComboVisible = false;
        }
    });
    
    $scope.initializeCurrentSelection = function(){
        $scope.currentSelection = {
            selectedAreaType: undefined,
            areaSelector: 'all',
            selectionType: 'map',
            searchString: undefined
        };
        
        if (angular.isDefined($scope.components) && $scope.components.referenceData && angular.isDefined($scope.components.fromLayerTree)){
            //$scope.status.isOpen = true;
            $scope.getSysAreaLayers();
        }
    };

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
            	$scope.systemAreaItems.push({"text": item.typeName, "code": item.typeName.toUpperCase()});
            });
            $scope.isLoadingAreaTypes = false;
            if (angular.isDefined($scope.components) && angular.isDefined($scope.components.referenceDataType)){
                lazySetupCurrentSelection();
            }
        }, function(error){
            comboboxService.closeCurrentCombo();
            $scope.alert.hasAlert = true;
            $scope.alert.hasError = true;
            $scope.alert.alertMessage = locale.getString('spatial.get_ref_data_type_error');
            $scope.alert.hideAlert();
        });
    };
    
    $scope.setInitialValues = function(){
        if (angular.isDefined($scope.components) && angular.isDefined($scope.components.referenceDataType)){
            $scope.currentSelection.selectedAreaType = $scope.components.referenceDataType.toUpperCase();
        }
    };
    
    var lazySetupCurrentSelection = function(){
        if (!angular.isDefined($scope.setupInterval)){
            $scope.setupInterval = $interval(function(){
                var keys = _.keys($scope.configModel.referenceDataSettings);
                var dataset = $scope.components.referenceDataType.toUpperCase();
                if (keys.length !== 0 && _.indexOf(keys, dataset) !== -1){
                    $scope.status.isOpen = true;
                    $scope.currentSelection.selectedAreaType = dataset;
                    stopSetupInterval();
                }
            }, 10);
        }
    };
    
    var stopSetupInterval = function(){
        $interval.cancel($scope.setupInterval);
        delete $scope.setupInterval;
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
            if (angular.isDefined($scope.currentSelection.selectedAreaType) && $scope.currentSelection.areaSelector === 'custom'){
                lazyLoadWMSLayer();
            }
        }
    });
    
    var lazyLoadWMSLayer = function(){
        if (!angular.isDefined($scope.addWMSInterval)){
            $scope.addWMSInterval = $interval(function(){
                if (angular.isDefined(mapReference.refData.map)){
                    $scope.addWMS();
                    stopWMSInterval();
                }
            }, 10);
        }
    };
    
    var stopWMSInterval = function(){
        $interval.cancel($scope.addWMSInterval);
        delete $scope.addWMSInterval;
    };
    
    //SELECT ON MAP
    $scope.clickResultsMap = true;
    $scope.selectAreaFromMap = function(data){
        if ($scope.currentSelection.selectedAreaType === 'PORT'){
            spatialRestService.getLocationDetails(data).then(function(response){
                loadingStatus.isLoading('SearchReferenceData',false);
                $scope.clickResults = 0;
                $scope.checkAndAddToSelection(response.data.code);
            }, function(error){
                loadingStatus.isLoading('SearchReferenceData',false);
                $scope.alert.hasAlert = true;
                $scope.alert.hasError = true;
                $scope.alert.alertMessage = locale.getString('spatial.get_ref_data_details_error');
                $scope.alert.hideAlert();
            });
        } else {
            spatialRestService.getAreaDetails(data).then(function(response){
                loadingStatus.isLoading('SearchReferenceData',false);
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
                loadingStatus.isLoading('SearchReferenceData',false);
                $scope.alert.hasAlert = true;
                $scope.alert.hasError = true;
                $scope.alert.alertMessage = locale.getString('spatial.get_ref_data_details_error');
                $scope.alert.hideAlert();
            });
        }
    };
    
    $scope.goBackToMap = function(){
        $scope.clickResultsMap = true;
        if (angular.isDefined($scope.currentSelection.selectedAreaType) && $scope.currentSelection.areaSelector === 'custom'){
            lazyLoadWMSLayer();
        }
    };
    
    //SELECT TABLE
    $scope.itemsByPage = 5;
    $scope.refDataRecords = [];
    $scope.displayedRefDataRecords = [].concat($scope.refDataRecords);
    $scope.searchByProps = function(){
        if (angular.isDefined($scope.currentSelection.searchString) && $scope.currentSelection.searchString !== ''){
            loadingStatus.isLoading('SearchReferenceData',true);
            $scope.refDataRecords = [];
            var requestData = {
                areaType: $scope.currentSelection.selectedAreaType,
                filter: $scope.currentSelection.searchString
            };
            spatialRestService.getAreasByCode(requestData).then(function(response){
                if (response.data.length > 0){
                    $scope.refDataRecords = $scope.convertRefData(response.data, false);
                } else {
                    $scope.alert.hasAlert = true;
                    $scope.alert.hasWarning = true;
                    $scope.alert.alertMessage = locale.getString('spatial.ref_data_empty_search_by_prop_msg');
                    $scope.alert.hideAlert();
                }
                loadingStatus.isLoading('SearchReferenceData',false);
            }, function(error){
                $scope.alert.alertMessage = locale.getString('spatial.get_ref_data_details_error');
                $scope.alert.hasError = true;
                $scope.alert.hideAlert();
                loadingStatus.isLoading('SearchReferenceData',false);
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
                        areaNames: [rec.name],
                        extent: rec.extent
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
        if (!angular.isDefined(mapReference.refData.map)){
            loadingStatus.isLoading('SearchReferenceData',true);
            
            angular.element('#sys-areas-map').ready(function(){
                $scope.mapInterval = $interval(function(){
                    if (angular.isDefined(mapReference.refData.map)){
                        $scope.stopInterval();
                        $scope.addWMS();
                        loadingStatus.isLoading('SearchReferenceData',false);
                        $timeout(function(){
                            mapReference.refData.map.updateSize();
                        });
                    }
                }, 10);
            });
        } else {
            $scope.addWMS();
        }
    };
    
    $scope.stopInterval = function(){
        $interval.cancel($scope.mapInterval);
        $scope.mapInterval = undefined;
    };
    
    $scope.removeWMS = function(selectedAreaType){
        if (angular.isDefined(mapReference.refData.map)){
            var layers = mapReference.refData.map.getLayers().getArray();
            angular.forEach(layers, function(layer) {
                if (!angular.isDefined(layer.get('switchertype')) && layer.get('type') !== selectedAreaType){
                    mapReference.refData.map.removeLayer(layer);
                }
            });
        }
    };
    
    /**
     * Adds generic WMS layer to the map.
     * 
     * @memberof referenceDataSettings
     * @public
     * @alias addWMS
     * @param {Object} def - The layer defintion object
     * @param {Boolean} isBaselayer - True if layer is a base layer
     */
    $scope.addWMS = function(def, isBaseLayer){
        var config;
        
        if (!angular.isDefined(def)){
            def = _.findWhere($scope.srcSysAreas, {typeName: $scope.currentSelection.selectedAreaType.toUpperCase()});
        }
        
        if (!angular.isDefined(isBaseLayer)){
            isBaseLayer = false;
        }
        
        if (isBaseLayer){
            config = genericMapService.getBaseLayerConfig(def, mapReference.refData.map);
        } else {
            config = genericMapService.getGenericLayerConfig(def, mapReference.refData.map);
        }
        
        var layer = genericMapService.defineWms(config);
        
        if (isBaseLayer){
            layer.set('switchertype', 'base'); //Necessary for the layerswitcher control
        } 
        
        mapReference.refData.map.addLayer(layer);
    };
    
    /**
     * Get area layer properties so that they can be used for the tooltips showing the area image
     * 
     * @memberof referenceDataSettings
     * @public
     * @alias getPropsForToolTip
     */
    $scope.getPropsForToolTip = function(){
        var def =  _.findWhere($scope.srcSysAreas, {typeName: $scope.currentSelection.selectedAreaType.toUpperCase()});
        var includeStyle = false;
        
        if ($scope.currentSelection.selectedAreaType === 'PORT' || $scope.currentSelection.selectedAreaType === 'STATRECT'){
            includeStyle = true;
        }
        
        if (angular.isDefined(def)){
            return {
                url: def.serviceUrl,
                layer: def.geoName,
                style: angular.isDefined(def.style) ? def.style : null,
                cqlProperty: 'code',
                propertyType: 'string',
                includeStyle: includeStyle
            };
        }
    };
    
    /**
     * Setup the map
     * 
     * @memberof referenceDataSettings
     * @public
     * @alias setMap
     */
    $scope.setMap = function(){
        var projObj;
        if (angular.isDefined(genericMapService.mapBasicConfigs) && genericMapService.mapBasicConfigs.success){
            projObj = genericMapService.mapBasicConfigs.projection;
        } else {
            //Fallback mode
            projObj = projectionService.getStaticProjMercator();
        }
        
        var view = genericMapService.createView(projObj);
        
        var controls = [];
        controls.push(new ol.control.Attribution({
            collapsible: false,
            collapsed: false
        }));
        
        controls.push(genericMapService.createZoomCtrl()); //'ol-zoom-right-side'
        
        var interactions = genericMapService.createZoomInteractions();
        interactions = interactions.concat(genericMapService.createPanInteractions());
       
        var map = new ol.Map({
            target: 'sys-areas-map',
            controls: controls,
            interactions: interactions,
            logo: false
        });
        
        map.beforeRender(function(map){
            map.updateSize();
        });
        
        map.setView(view);
        mapReference.refData.map = map; 
        
        addBaseLayers();
        
        var layers = map.getLayers();
        if (layers.getLength() > 1){
            var switcher = new ol.control.LayerSwitcher({
                controlClass: 'left-side-up'
            });
            map.addControl(switcher);
        }
        
        map.on('singleclick', function(evt){
            if ($scope.currentSelection.selectionType === 'map' && angular.isDefined($scope.currentSelection.selectedAreaType) && $scope.currentSelection.areaSelector === 'custom'){
                loadingStatus.isLoading('SearchReferenceData',true);
                var projection = mapReference.refData.map.getView().getProjection().getCode();
                var requestData = {
                    isGeom: false,
                    longitude: evt.coordinate[0],
                    latitude: evt.coordinate[1],
                    crs: projection.split(':')[1]
                };
                
                if ($scope.currentSelection.selectedAreaType === 'PORT'){
                    requestData.locationType = $scope.currentSelection.selectedAreaType;
                } else {
                    requestData.areaType = $scope.currentSelection.selectedAreaType;
                }
                
                
                $scope.selectAreaFromMap(requestData);
            }
        });
    };
    
    function addBaseLayers(){
        if (!genericMapService.mapBasicConfigs.success){
            $scope.addOSM();
        } else {
            angular.forEach(genericMapService.mapBasicConfigs.layers.baseLayers, function(layerConf) {
                switch (layerConf.type) {
                    case 'OSM':
                        $scope.addOSM(layerConf);
                        break;
                    case 'WMS':
                        $scope.addWMS(layerConf, true);
                        break;
                    case 'BING':
                        layerConf.title = locale.getString('spatial.layer_tree_' + layerConf.title);
                        $scope.addBing(layerConf);
                        break;
                }
            });
        }
    }
    
    /**
     * Adds OpenStreeMap layer to the map
     * 
     * @memberof referenceDataSettings
     * @public
     * @alias addOSM
     * @param {Object} [config={}] - The layer configuration object
     */
    $scope.addOSM =  function(config){
        if (!angular.isDefined(config)){
            config = {};
        }
        var layer = genericMapService.defineOsm(config);
        layer.set('switchertype', 'base'); //Necessary for the layerswitcher control
        mapReference.refData.map.addLayer(layer);
    };
    
    /**
     * Adds BING layers to the map
     * 
     * @memberof referenceDataSettings
     * @public
     * @alias addBing
     * @param {Object} [config={}] - The layer configuration object
     */
    $scope.addBing = function(config){
        if (!angular.isDefined(config)){
            config = {};
        }
        var layer = genericMapService.defineBing(config);
        layer.set('switchertype', 'base'); //Necessary for the layerswitcher control
        mapReference.refData.map.addLayer(layer);
    };

    $scope.initializeCurrentSelection();

});
