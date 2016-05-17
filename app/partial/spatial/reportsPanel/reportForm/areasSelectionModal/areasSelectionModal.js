var resetLayerCqlFilter = function(opt_options){
    var options = opt_options || {};
    
    var btn = document.createElement('button');
    btn.title = options.label;
    var icon = document.createElement('span');
    icon.className = 'fa fa-refresh';
    icon.style.fontSize = '13px';
    btn.appendChild(icon);
    
    var this_ = this;
    
    var resetFilter = function(e){
        var layers = this_.getMap().getLayers();
        if (layers.getLength() > 1){
            var layer = layers.getArray().find(function(layer){
                return layer.get('type') !== 'osm';
            });
            
            var cql = null;
            if (layer.get('type') === 'USERAREA'){
                var currentPams = layer.getSource().getParams();
                var cqlComps = currentPams.cql_filter.split(' and');
                cql = cqlComps[0];
            }
            
            layer.getSource().updateParams({
                'cql_filter': cql
            });
        }
    };
    
    btn.addEventListener('click', resetFilter, false);
    
    var element = document.createElement('div');
    element.className = 'ol-resetCql ol-unselectable ol-control';
    element.appendChild(btn);
    
    ol.control.Control.call(this, {
        element: element,
        target: options.target
    });
};
    
ol.inherits(resetLayerCqlFilter, ol.control.Control);

angular.module('unionvmsWeb').controller('AreasselectionmodalCtrl',function($scope, $modalInstance, $timeout, locale, selectedAreas, spatialRestService, Area, userService){
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
        spatialRestService.getAreaLayers().then(function(response){
            $scope.systemAreaTypes = response.data;
            for (var i = 0; i < $scope.systemAreaTypes.length; i++){
                $scope.systemItems.push({"text": $scope.systemAreaTypes[i].typeName, "code": $scope.systemAreaTypes[i].typeName});
            }
        }, function(error){
            $scope.errorMessage = locale.getString('spatial.area_selection_modal_get_sys_layers_error');
            $scope.hasError = true;
            $scope.hideAlert();
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
        var osm = new ol.layer.Tile({
            type: 'osm',
            source: new ol.source.OSM()
        });
        
        var projection = new ol.proj.Projection({
            code: 'EPSG:3857',
            units: 'm',
            global: false
        });
        
        var view = new ol.View({
            projection: projection,
            center: ol.proj.transform([10, 40], 'EPSG:4326', 'EPSG:3857'),
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
        
        controls.push(new resetLayerCqlFilter({
            label: locale.getString('spatial.map_tip_reset_layer_filter')
        }));
        
        interactions.push(new ol.interaction.DragPan());
        interactions.push(new ol.interaction.MouseWheelZoom());
        interactions.push(new ol.interaction.DoubleClickZoom());

        var map = new ol.Map({
            target: 'areaDisplay',
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
    }
    
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
    
    $scope.addWms = function(item){
        var layer = new ol.layer.Tile({
            type: item.typeName,
            source: new ol.source.TileWMS({
                url: item.serviceUrl,
                serverType: 'geoserver',
                params: {
                    time_: (new Date()).getTime(),
                    'LAYERS': item.geoName,
                    'TILED': true,
                    'STYLES': item.style,
                    'cql_filter': angular.isDefined(item.cql) ? item.cql : null 
                }
            })
        });
        
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
        geom.transform('EPSG:4326', 'EPSG:3857');
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
        setSystemItems();
        setMap();
        if (angular.isDefined(selectedAreas) && selectedAreas.length > 0){
            $scope.getAreaProperties($scope.buildAreaPropArray());
        }
        $timeout(function(){
            $scope.map.updateSize();
        }, 100);
        
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
           $scope.addWms($scope.userAreaType);
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
                $scope.addWms(item);
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
                
                layer.getSource().updateParams({
                    'cql_filter': null
                });
            }
        }
    });
});