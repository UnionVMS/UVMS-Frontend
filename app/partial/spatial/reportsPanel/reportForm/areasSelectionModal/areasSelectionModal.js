angular.module('unionvmsWeb').controller('AreasselectionmodalCtrl',function($scope, $modalInstance, $interval, $timeout, locale, loadingStatus, genericMapService, selectedAreas, spatialRestService, Area, userService, projectionService){
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
    
    $scope.save = function(){
        $modalInstance.close($scope.exportSelectedAreas());
    };
    
    $modalInstance.opened.then(function(){
        $scope.selectedTab = 'SYSTEM';
        $scope.sysSelection = "map";
        $scope.userSelection = "map";
        $scope.clickResults = 0;
        $scope.showWarning = false;
        $scope.warningMessage = undefined;
        $scope.hasError = false;
        $scope.errorMessage = undefined;
    });
    
    //Define tabs
    var setTabs = function(){
        return [
            {
                'tab': 'SYSTEM',
                'title': locale.getString('spatial.area_selection_modal_system_tab')
            },
            {
                'tab': 'USER',
                'title': locale.getString('spatial.area_selection_modal_user_tab')
            }
        ];
    };
    
    $scope.selectAreaTab = function(tab){
        if (tab === 'USER') {
            $scope.sysAreaType = undefined;
            $scope.sysSelection = 'map';
            setUserAreaType();
        } else {
           $scope.userSelection = 'map';
           if (angular.isDefined($scope.userAreaType)) {
                $scope.removeLayerByType($scope.userAreaType.typeName);
                $scope.userAreaType = undefined;
            }
        }
        $scope.selectedTab = tab;
    };
    
    $scope.isAreaTabSelected = function(tab){
        return $scope.selectedTab === tab;
    };
    
    locale.ready('spatial').then(function(){
        $scope.areaTabs = setTabs();
    });
    
    
    $scope.systemItems = [];
    
    function setSystemItems(){
    	$scope.isLoadingAreaLayers = true;
        spatialRestService.getAreaLayers().then(function(response){
            $scope.systemAreaTypes = response.data;
            for (var i = 0; i < $scope.systemAreaTypes.length; i++){
                $scope.systemItems.push({"text": $scope.systemAreaTypes[i].typeName, "code": $scope.systemAreaTypes[i].typeName});
            }
            $scope.isLoadingAreaLayers = false;
        }, function(error){
            $scope.errorMessage = locale.getString('spatial.area_selection_modal_get_sys_layers_error');
            $scope.hasError = true;
            $scope.hideAlert();
            $scope.isLoadingAreaLayers = false;
        });
    }

    
    $scope.hideAlert = function(){
        $timeout(function(){
            $scope.hasError = false;
            $scope.errorMessage = undefined;
            $scope.showWarning = false;
            $scope.warningMessage = undefined;
        }, 5000);
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
    
    //System areas search table
    $scope.sysAreaSearch = [];
    $scope.sysTable = {};
    $scope.itemsByPage = 5;
    $scope.displayedRecordsArea = [].concat($scope.sysAreaSearch);
    $scope.searchLoading = false;

    //User defined areas table
    $scope.userAreaType = undefined;
    $scope.userAreasList = [];
    $scope.displayedUserAreas = [].concat($scope.userAreasList);
    
    //User defined areas table by map click
    $scope.userAreasSearch = [];
    $scope.displayedUserAreasSearch = [].concat($scope.userAreasSearch);


    //Selected areas table
    $scope.areaSelectionTable = {};
    $scope.selectedAreas = [];
    $scope.displayedRecordsArea = [].concat($scope.selectedAreas);
    
    //MAP
    function setMap(){
        var projObj;
        if (angular.isDefined(genericMapService.mapBasicConfigs.success)){
            if (genericMapService.mapBasicConfigs.success){
                projObj = genericMapService.mapBasicConfigs.projection;
            } else {
                //Fallback mode
                projObj = projectionService.getStaticProjMercator();
            }
        }
        
        var view = genericMapService.createView(projObj);
        
        var controls = [];
        controls.push(new ol.control.Attribution({
            collapsible: false,
            collapsed: false
        }));
        
        controls.push(genericMapService.createZoomCtrl()); //'ol-zoom-right-side'
        
        controls.push(new ol.control.ResetLayerFilter({
            //controlClass: 'ol-resetCql-right-side',
            type: 'areamapservice',
            label: locale.getString('areas.map_tip_reset_layer_filter')
        }));
        
        var interactions = genericMapService.createZoomInteractions();
        interactions = interactions.concat(genericMapService.createPanInteractions());
        
        var map = new ol.Map({
            target: 'areaDisplay',
            controls: controls,
            interactions: interactions,
            logo: false
        });
        
        map.beforeRender(function(map){
            map.updateSize();
        });
        
        map.setView(view);
        $scope.map = map;
        
        addBaseLayers();
        
        var layers = map.getLayers();
        if (layers.getLength() > 1){
            var switcher = new ol.control.LayerSwitcher({
                controlClass: 'left-side'
            });
            map.addControl(switcher);
        }
        
        map.on('singleclick', function(evt){
            if ((($scope.sysSelection === 'map' && $scope.selectedTab === 'SYSTEM') || ($scope.userSelection === 'map' && $scope.selectedTab === 'USER')) && map.getLayers().getLength() > 1){
                var areaType = angular.isDefined($scope.sysAreaType)? $scope.sysAreaType : $scope.userAreaType.typeName;
                $scope.clickResults = 0;
                var projection = map.getView().getProjection().getCode();

                var requestData = {
                   areaType: areaType,
                   isGeom: false,
                   longitude: evt.coordinate[0],
                   latitude: evt.coordinate[1],
                   crs: projection.split(':')[1]
                };
                $scope.selectAreaFromMap(requestData);
            }
        });
        
        //$scope.map.updateSize();
        loadingStatus.isLoading('AreaSelectionModal',false);
    }
    
    function getSettingsAndSetMap(){
        genericMapService.setMapBasicConfigs();
        $scope.initInterval = $interval(function(){
            if (!_.isEqual(genericMapService.mapBasicConfigs, {})){
                setMap();
                $scope.stopInitInterval();
            }
        }, 10);
    }
    
    function addBaseLayers(){
        if (!genericMapService.mapBasicConfigs.success){
            $scope.addOSM();
        } else {
            angular.forEach(genericMapService.mapBasicConfigs.layers.baseLayers.reverse(), function(layerConf) {
                switch (layerConf.type) {
                    case 'OSM':
                        $scope.addOSM(layerConf);
                        break;
                    case 'WMS':
                        $scope.addWMS(layerConf, true);
                        break;
                    case 'BING':
                        layerConf.title = locale.getString('spatial.layer_tree_' + layerConf.title);
                        $scope.addBing(layerConf, true);
                        break;
                }
            });
        }
    }
    
    $scope.stopInitInterval = function(){
        $interval.cancel($scope.initInterval);
        $scope.initInterval = undefined;
    };
    
    $scope.checkAreaIsSelected = function(item){
        var status = false;
        $scope.showWarning = false;
        for (var i = 0; i < $scope.selectedAreas.length; i++){
            if (parseInt($scope.selectedAreas[i].gid) === item.gid && $scope.selectedAreas[i].areaType === item.areaType){
                status = true;
                $scope.showWarning = true;
                $scope.warningMessage = locale.getString('spatial.area_selection_modal_area_is_selected_warning');
            }
        }
        
        if ($scope.showWarning === true){
            $scope.hideAlert();
        }
        
        return status;
    };
    
    /**
     * Adds OpenStreeMap layer to the map
     * 
     * @memberof areasSelectionModal
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
        $scope.map.addLayer(layer);
    };
    
    /**
     * Adds BING layers to the map
     * 
     * @memberof areasSelectionModal
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
        $scope.map.addLayer(layer);
    };
    
    /**
     * Adds generic WMS layer to the map.
     * 
     * @memberof areasSelectionModal
     * @public
     * @alias addWMS
     * @param {Object} def - The layer defintion object
     * @param {Boolean} isBaselayer - True if layer is a base layer
     */
    $scope.addWMS = function(def, isBaseLayer){
        var config;
        if (isBaseLayer){
            config = genericMapService.getBaseLayerConfig(def, $scope.map);
        } else {
            config = genericMapService.getGenericLayerConfig(def, $scope.map);
        }
        
        var layer = genericMapService.defineWms(config);
        
        if (isBaseLayer){
            layer.set('switchertype', 'base'); //Necessary for the layerswitcher control
        }
        
        $scope.map.addLayer(layer);
    };
    
    
    //Add system areas by click on map
    $scope.mapLoading = false;
    $scope.selectAreaFromMap = function(data){
        $scope.mapLoading = true;
        spatialRestService.getAreaDetails(data).then(function(response){
            var area;
            $scope.clickResults = response.data.length;
            if (response.data.length > 1){
                if (angular.isDefined($scope.sysAreaType)){
                    $scope.sysAreaSearch = $scope.convertAreasResponse(response.data);
                } else {
                    $scope.userAreasSearch = $scope.convertAreasResponse(response.data);
                }
            } else {
                if (response.data.length === 0){
                    $scope.showWarning = true;
                    $scope.warningMessage = locale.getString('spatial.area_selection_modal_get_sys_area_details_empty_result');
                    $scope.hideAlert();
                } else {
                    area = new Area();
                    area = area.fromJson(response.data[0]);
                    if ($scope.checkAreaIsSelected(area) === false){
                        $scope.selectedAreas.unshift(area);
                    }
                }
            }
            $scope.mapLoading = false;
        }, function(error){
            $scope.errorMessage = locale.getString('spatial.area_selection_modal_get_sys_area_details_error');
            $scope.hasError = true;
            $scope.hideAlert();
            $scope.mapLoading = false;
        });
    };
    
    $scope.getAreaProperties = function(data){
        spatialRestService.getAreaProperties(data).then(function(response){
            $scope.selectedAreas = $scope.buildSelectedAreasArray(response.data);
        }, function(error){
            $scope.errorMessage = locale.getString('spatial.area_selection_modal_get_selected_sys_area_details_error');
            $scope.hasError = true;
            $scope.hideAlert();
        });
    };
    
    $scope.buildSelectedAreasArray = function(data){
        var finalAreas = [];
        for (var i = 0; i < data.length; i++){
            var area = data[i];
            for (var j = 0; j < selectedAreas.length; j++){
                if (parseInt(selectedAreas[j].gid) === parseInt(data[i].gid) && selectedAreas[j].areaType === data[i].areaType){
                    area.id = parseInt(selectedAreas[j].id);
                }
            }
            finalAreas.push(area);
        }
        
        return finalAreas;
    };
    
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
                $scope.searchLoading = false;
            }, function(error){
                $scope.errorMessage = locale.getString('spatial.area_selection_modal_get_selected_area_search_error');
                $scope.hasError = true;
                $scope.hideAlert();
                $scope.searchLoading = false;
            });
        }
    };
    
    $scope.mergeParamsWms = function(index, displayedAreasList, areaList){
    	index = areaList.indexOf(displayedAreasList[index]);
        var area = areaList[index];
        var format = new ol.format.WKT();
        var geom = format.readFeature(area.extent).getGeometry();
        geom = genericMapService.intersectGeomWithProj(geom, $scope.map);
        $scope.map.getView().fit(geom, $scope.map.getSize(), {nearest: false});
        
        var layers = $scope.map.getLayers();
        if (layers.getLength() > 1){
            var layer = layers.getArray().find(function(layer){
               return layer.get('type') === area.areaType; 
            });
            
            var cql = '';
            var src = layer.getSource();
            if (area.areaType === 'USERAREA'){
                var currentParams = src.getParams();
                var cqlComps = currentParams.cql_filter.split(' and');
                cql = cqlComps[0] + ' and ';
            }
            cql += "gid = " + parseInt(area.gid);
            
            src.updateParams({
                time_: (new Date()).getTime(),
                'cql_filter': cql
            });
        }
    };
    
    $scope.addAreaToSelection = function(index, displayedAreasList, areaList){
    	index = areaList.indexOf(displayedAreasList[index]);
        var area = areaList[index];
        if ($scope.checkAreaIsSelected(area) === false){
            $scope.selectedAreas.unshift(area);
        }
    };
    
    //Delete areas from selection
    $scope.deleteArea = function(index){
    	index = $scope.selectedAreas.indexOf($scope.displayedRecordsSelection[index]);
        $scope.selectedAreas.splice(index, 1);
    };
    
    $scope.exportSelectedAreas = function(){
        var exported = [];
        for (var i = 0; i < $scope.selectedAreas.length; i++){
            var area = {
                gid: parseInt($scope.selectedAreas[i].gid),
                areaType: $scope.selectedAreas[i].areaType    
            };
            exported.push(area);
        }
        
        return exported;
    };
    
    //Initialization
    $scope.init = function(){
        loadingStatus.isLoading('AreaSelectionModal',true);
        setSystemItems();
        getSettingsAndSetMap();
        if (angular.isDefined(selectedAreas) && selectedAreas.length > 0){
            $scope.getAreaProperties($scope.buildAreaPropArray());
        }
    };
    
    $scope.buildAreaPropArray = function(){
        var areas = [];
        for (var i = 0; i < selectedAreas.length; i++){
            areas.push({
                gid : selectedAreas[i].gid,
                areaType: selectedAreas[i].areaType
            });
        }
        return areas;
    };
    
    $modalInstance.rendered.then(function(){
        $scope.init();
    });
    
    //Remove layer from the map by layerType
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

    function setUserAreaType() {
        if(!angular.isDefined($scope.userAreaType)) {
            spatialRestService.getUserAreaLayer().then(function(response){
                $scope.userAreaType = response.data;
            }, function(error){
                $scope.errorMessage = locale.getString('spatial.area_selection_modal_get_sys_layers_error');
                $scope.hasError = true;
                $scope.hideAlert();
            });
        } 
    }

    function initUserAreasList() {
        if(!angular.isDefined($scope.userAreasList) || $scope.userAreasList.length === 0) {
            $scope.searchLoading = true;
            $scope.userAreasList = [];
            
            spatialRestService.getUserDefinedAreas().then(function(response){
                $scope.userAreasList = $scope.convertAreasResponse(response);
                $scope.searchLoading = false;
            }, function(error){
                if (angular.isDefined(error.data.msg)) {
                    $scope.errorMessage = locale.getString('spatial.' + error.data.msg);
                } else {
                    $scope.errorMessage = locale.getString('spatial.area_selection_modal_get_selected_area_search_error');
                   
                }
                
                $scope.hasError = true;
                $scope.hideAlert();
                $scope.searchLoading = false;
            });
        }   
    }
   

    //Events
    $scope.$watch('userAreaType', function(){
        if (angular.isDefined($scope.userAreaType)){
           $scope.userAreaType.cql = "(user_name = '" + userService.getUserName() + "' OR scopes ilike '%#" + userService.getCurrentContext().scope.scopeName +"#%')";
           $scope.addWMS($scope.userAreaType);
        }
    });
    
    $scope.$watch('userSelection', function(newVal, oldVal){
        $scope.clickResults = 0;
        if (newVal === 'map'){
            $scope.userAreasSearch = [];
        }
        if (newVal === 'search'){
            if (angular.isDefined($scope.userAreaSearchItem)){
                $scope.userAreaSearchItem = undefined;
                $scope.displayedUserAreas = [].concat($scope.userAreasList);
            }
            
            if ($scope.userAreasSearch.length === 0){
                initUserAreasList();
            }
        }
    });

    
  	$scope.$watch('sysAreaType', function(newVal, oldVal){
        if (angular.isDefined(newVal) && newVal !== oldVal){
            $scope.clickResults = 0;
            var item = $scope.getFullDefForItem(newVal);
            if (angular.isDefined(item)){
                $scope.removeLayerByType(oldVal);
                $scope.addWMS(item);
                $scope.searchSysString = undefined;
                $scope.sysAreaSearch = [];
            }
        } else {
            $scope.removeLayerByType(oldVal);
        }
    });
    
    $scope.$watch('sysSelection', function(newVal, oldVal){
        $scope.clickResults = 0;
        if (newVal === 'map' && angular.isDefined($scope.map)){
            $scope.searchSysString = undefined;
            $scope.sysAreaSearch = [];
            var layers = $scope.map.getLayers();
            if (layers.getLength() > 1){
                var layer = layers.getArray().find(function(layer){
                   return layer.get('type') === $scope.sysAreaType; 
                });
                
                if (angular.isDefined(layer)){
                    layer.getSource().updateParams({
                        'cql_filter': null
                    });
                }
            }
        }
    });
});