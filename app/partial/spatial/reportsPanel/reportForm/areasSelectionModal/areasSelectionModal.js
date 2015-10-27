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
            
            layer.getSource().updateParams({
                'cql_filter': null
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

angular.module('unionvmsWeb').controller('AreasselectionmodalCtrl',function($scope, $modalInstance, $timeout, locale, selectedAreas, datatablesService, DTOptionsBuilder, DTColumnDefBuilder, spatialRestService, Area){
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
    
    $scope.save = function(){
        $modalInstance.close($scope.exportSelectedAreas());
    };
    
    $scope.selectedTab = 'SYSTEM';
    $scope.sysSelection = "map";
    $scope.clickResults = 0;
    $scope.showWarning = false;
    
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
            //TODO warn the user
        });
    }
    
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
    $scope.searchLoading = false;
    $scope.sysTable.dtOptions = DTOptionsBuilder.newOptions()
                        .withBootstrap()
                        .withPaginationType('simple_numbers')
                        .withDisplayLength(5)
                        .withLanguage(datatablesService)
                        .withDOM('trp')
                        .withOption('autoWidth', true)
                        .withBootstrapOptions({
                            pagination: {
                                classes: {
                                    ul: 'pagination pagination-sm'
                                }
                            }
                        });
    
    $scope.sysTable.dtColumnDefs = [
        DTColumnDefBuilder.newColumnDef(0),
        DTColumnDefBuilder.newColumnDef(1),
        DTColumnDefBuilder.newColumnDef(2).notSortable()
    ];
    
    //Selected areas table
    $scope.areaSelectionTable = {};
    $scope.selectedAreas = [];
    $scope.areaSelectionTable.dtOptions = DTOptionsBuilder.newOptions()
                        .withBootstrap()
                        .withPaginationType('simple_numbers')
                        .withDisplayLength(5)
                        .withLanguage(datatablesService)
                        .withDOM('trp')
                        .withOption('autoWidth', true)
                        .withBootstrapOptions({
                            pagination: {
                                classes: {
                                    ul: 'pagination pagination-sm'
                                }
                            }
                        });
    
    $scope.areaSelectionTable.dtColumnDefs = [
        DTColumnDefBuilder.newColumnDef(0),
        DTColumnDefBuilder.newColumnDef(1),
        DTColumnDefBuilder.newColumnDef(2),
        DTColumnDefBuilder.newColumnDef(3).notSortable()
    ];
    
    
    
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
            if ($scope.selectedTab === 'SYSTEM' && $scope.sysSelection === 'map' && map.getLayers().getLength() > 1){
                $scope.clickResults = 0;
                var projection = map.getView().getProjection().getCode();
                var requestData = {
                   areaType: $scope.sysAreaType,
                   isGeom: false,
                   longitude: evt.coordinate[0],
                   latitude: evt.coordinate[1],
                   crs: projection.split(':')[1]
                };
                $scope.getAreaDetails(requestData);
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
            }
        }
        
        if ($scope.showWarning === true){
            $timeout(function(){
                $scope.showWarning = false;
            }, 5000);
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
                    'LAYERS': item.geoName,
                    'TILED': true,
                    'STYLES': item.style
                }
            })
        });
        
        $scope.map.addLayer(layer);
    };
    
    //Add system areas by click on map
    $scope.mapLoading = false;
    $scope.getAreaDetails = function(data){
        $scope.mapLoading = true;
        spatialRestService.getAreaDetails(data).then(function(response){
            var area;
            $scope.clickResults = response.data.length;
            if (response.data.length > 1){
                $scope.sysAreaSearch = $scope.convertSysAreasResponse(response.data);
            } else {
                area = new Area();
                area = area.fromJson(response.data[0]);
                if ($scope.checkAreaIsSelected(area) === false){
                    $scope.selectedAreas.unshift(area);
                }
            }
            $scope.mapLoading = false;
        }, function(error){
            //TODO warn the user
            $scope.mapLoading = false;
        });
    };
    
    $scope.getAreaProperties = function(data){
        spatialRestService.getAreaProperties(data).then(function(response){
            $scope.selectedAreas = $scope.buildSelectedAreasArray(response.data);
        }, function(error){
            //TODO warn the user
            console.log(error);
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
    $scope.convertSysAreasResponse = function(data){
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
                $scope.sysAreaSearch = $scope.convertSysAreasResponse(response.data);
                $scope.searchLoading = false;
            }, function(error){
               //TODO warn the user 
                $scope.searchLoading = false;
            });
        }
    };
    
    $scope.mergeParamsWms = function(index){
        var format = new ol.format.WKT();
        var geom = format.readFeature($scope.sysAreaSearch[index].extent).getGeometry();
        geom.transform('EPSG:4326', 'EPSG:3857');
        $scope.map.getView().fit(geom, $scope.map.getSize(), {nearest: false});
        
        var layers = $scope.map.getLayers();
        if (layers.getLength() > 1){
            var layer = layers.getArray().find(function(layer){
               return layer.get('type') === $scope.sysAreaSearch[index].areaType; 
            });
            
            layer.getSource().updateParams({
                'cql_filter': "gid = " + parseInt($scope.sysAreaSearch[index].gid)
            });
        }
    };
    
    $scope.addAreaToSelection = function(index){
        if ($scope.checkAreaIsSelected($scope.sysAreaSearch[index]) === false){
            $scope.selectedAreas.unshift($scope.sysAreaSearch[index]);
        }
    };
    
    //Delete areas from selection
    $scope.deleteArea = function(index){
        $scope.selectedAreas.splice(index, 1);
    };
    
    $scope.exportSelectedAreas = function(){
        var exported = [];
        for (var i = 0; i < $scope.selectedAreas.length; i++){
            var area = {
                gid: parseInt($scope.selectedAreas[i].gid),
                areaType: $scope.selectedAreas[i].areaType    
            };
            
            if (angular.isDefined($scope.selectedAreas[i].id)){
                area.id = $scope.selectedAreas[i].id;
            }
            
//            if (angular.isDefined($scope.selectedAreas[i].type)){
//                area.type = $scope.selectedAreas[i].type;
//            }
            
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
    
    //Events
    $scope.$watch('sysAreaType', function(newVal, oldVal){
        if (angular.isDefined(newVal) && newVal !== oldVal){
            $scope.clickResults = 0;
            var item = $scope.getFullDefForItem(newVal);
            if (angular.isDefined(item)){
                var mapLayers = $scope.map.getLayers();
                if (mapLayers.getLength() > 1){
                    var layer = mapLayers.getArray().find(function(layer){
                        return layer.get('type') === oldVal;
                    });
                    $scope.map.removeLayer(layer);
                }
                $scope.addWms(item);
                $scope.searchSysString = undefined;
                $scope.sysAreaSearch = [];
            }
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