angular.module('unionvmsWeb').controller('MappanelCtrl',function($scope, $rootScope, $timeout, locale){
    //Define map
    var setMap = function(){
        var osmLayer = new ol.layer.Tile({
            source: new ol.source.OSM()
        });
        
        var attribution = new ol.Attribution({
            html: 'This is a custom layer from UnionVMS'
        });
        
        var eezLayer = new ol.layer.Tile({
            source: new ol.source.TileWMS({
                attributions: [attribution],
                url: 'http://localhost:8080/geoserver/wms',
                serverType: 'geoserver',
                params: {
                    'LAYERS': 'uvms:eez',
                    'TILED': true,
                    'STYLES': ''
                    //'cql_filter': "sovereign='Portugal' OR sovereign='Poland' OR sovereign='Bulgaria' OR sovereign='Belgium'"
                }
            })
        });
        
        
        var view = new ol.View({
            projection: setProjection(3857, 'm', true),
            center: ol.proj.transform([-1.81185, 52.44314], 'EPSG:4326', 'EPSG:3857'),
            zoom: 3,
            enableRotation: false
        });
        
        var map = new ol.Map({
            target: 'map',
            controls: setControls(),
            interactions: setInteractions(),
            logo: false
        });
        
        map.beforeRender(function(map){
            map.updateSize();
        });
        
        map.addLayer(osmLayer);
        map.addLayer(eezLayer);
        map.setView(view);
        
        return map;
    };
    
    var updateMapSize = function(){
        $scope.map.updateSize();
        console.log('inside update function');
    };
    
    
    
    var setProjection = function(projCode, units, global){
        var projection = new ol.proj.Projection({
            code: 'EPSG:' + projCode,
            units: units,
            global: global
        });
        
        return projection;
    };
    
    var setControls = function(){
        var fullScreen = new ol.control.FullScreen();
        var attribution = new ol.control.Attribution();
        var zoom = new ol.control.Zoom();
//        var mousePosition = new ol.control.MousePosition({
//            projection: setProjection(4326),
//            coordinateFormat: ol.coordinate.createStringXY(4),
//            className: 'mouse-position'
//        });
        var scale = new ol.control.ScaleLine();
        
        return new ol.Collection([fullScreen, attribution, zoom, scale]);
    };
    
    var setInteractions = function(){
        var dragPan = new ol.interaction.DragPan();
//        var keyPan = new ol.interaction.KeyboardPan();
//        var keyZoom = new ol.interaction.KeyboardZoom();
        var mouseWheel = new ol.interaction.MouseWheelZoom();
        
        return new ol.Collection([dragPan, mouseWheel]);
    };
        
    locale.ready('spatial').then(function(){
        $scope.map = setMap();
    });
   
    $rootScope.$on('mapTabSelected', function(a){
        //Fix map size when the user changes tabs
        $timeout(updateMapSize, 10);
    });

});