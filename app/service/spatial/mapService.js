angular.module('unionvmsWeb').factory('mapService',function() {
	var ms = {};
	ms.controls = [];
	ms.interactions = [];
	
	//Initialize the map
	ms.setMap = function(config){
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
            projection: ms.setProjection(config.map.projection.epsgCode, config.map.projection.units, config.map.projection.global),
            center: ol.proj.transform([-1.81185, 52.44314], 'EPSG:4326', 'EPSG:3857'),
            zoom: 3,
            enableRotation: false
        });
        
        //Get all controls and interactions that will be added to the map
        var controlsToMap = ms.setControls(config.map.controls);
        
        var map = new ol.Map({
            target: config.map.target,
            controls: controlsToMap[0],
            interactions: controlsToMap[1],
            logo: false
            //keyboardEventTarget: document.getElementById('map')
        });
        
        map.beforeRender(function(map){
            map.updateSize();
        });
        
        map.addLayer(osmLayer);
        map.addLayer(eezLayer);
        map.setView(view);
        
        ms.map = map;
	};
	
	//Set map projections
	ms.setProjection = function(projCode, units, global){
        var projection = new ol.proj.Projection({
            code: 'EPSG:' + projCode,
            units: units,
            global: global
        });
        
        return projection;
	};
	
	//Set map controls
	ms.setControls = function(controls){
	    for (var i = 0; i < controls.length; i++){
	        var ctrl = controls[i];
	        var fnName = 'add' + ctrl.type.charAt(0).toUpperCase() + ctrl.type.slice(1);
	        ms[fnName](ctrl);
	    }
	    
	    //Always add attribution control
	    //TODO CSS style for attribution
	    ms.controls.push(new ol.control.Attribution({
	        collapsible: false,
	        collapsed: false
	        //className: 'map-attribution'
	    }));
	    
	    return [new ol.Collection(ms.controls), new ol.Collection(ms.interactions)];
	};
	
	//Add map controls
	ms.addZoom = function(){
	    ms.controls.push(new ol.control.Zoom());
	    ms.interactions.push(new ol.interaction.MouseWheelZoom());
	    ms.interactions.push(new ol.interaction.KeyboardZoom());
	};
	
	ms.addFullscreen = function(){
	    //TODO change height when fullscreen is toggled on/off
	    ms.controls.push(new ol.control.FullScreen());
	};
	
	ms.addScale = function(ctrl){
	    //TODO get control definitions and apply style
	    ms.controls.push(new ol.control.ScaleLine({
	        units: ctrl.units,
	        target: angular.element('#map-scale')[0],
	        className: 'ol-scale-line'
	    }));
	};
	
	ms.addDrag = function(){
	    ms.interactions.push(new ol.interaction.DragPan());
	    ms.interactions.push(new ol.interaction.KeyboardPan());
	};
	
	ms.addMousecoords = function(ctrl){
        ms.controls.push(new ol.control.MousePosition({
            projection: 'EPSG:' + ctrl.epsgCode,
            coordinateFormat: function(coord){
                return ms.formatCoords(coord, ctrl);
            },
            target: angular.element('#map-coordinates')[0],
            className: 'mouse-position'
        }));
    };
	
	//Format mouse position coordinates according to the configuration
	ms.formatCoords = function(coord, ctrl){
	    var x,y;
	    if (ctrl.epsgCode === 4326){
	        if (ctrl.format === 'dd'){
	            return ol.coordinate.format(coord, '<b>Lon:</b> {x}\u00b0 \u0090 <b>Lat:</b> {y}\u00b0' , 4);
	        } else if (ctrl.format === 'dms'){
	            x = ms.coordToDMS(coord[0], 'EW');
	            y = ms.coordToDMS(coord[1], 'NS');
	            return '<b>Lon:</b> ' + x + '\u0090 <b>Lat:</b> ' + y;
	        } else {
	            x = ms.coordToDDM(coord[0], 'EW');
                y = ms.coordToDDM(coord[1], 'NS');
                return '<b>Lon:</b> ' + x + '\u0090 <b>Lat:</b> ' + y;
	        }
	    } else {
	        return ol.coordinate.format(coord, '<b>X:</b> {x} m \u0090 <b>Y:</b> {y} m' , 4);
	    }
	};
	
	//Convert coordinate to DMS
	ms.coordToDMS = function(degrees, hemispheres){
	    var normalized = (degrees + 180) % 360 - 180;
	    var x = Math.abs(Math.round(3600 * normalized));
	    return Math.floor(x / 3600) + '\u00b0 ' +
            Math.floor((x / 60) % 60) + '\u2032 ' +
            Math.floor(x % 60) + '\u2033 ' +
            hemispheres.charAt(normalized < 0 ? 1 : 0);
	};
	
	//Convert coordinate to DDM
	ms.coordToDDM = function(degrees, hemispheres){
	    var normalized = (degrees + 180) % 360 - 180;
        var x = Math.abs(Math.round(3600 * normalized));
        return Math.floor(x / 3600) + '\u00b0 ' +
            ((x / 60) % 60).toFixed(2) + '\u2032 ' +
            hemispheres.charAt(normalized < 0 ? 1 : 0);
	};
	
	//Recalculate map size
    ms.updateMapSize = function(){
        ms.map.updateSize();
    };

	return ms;
});