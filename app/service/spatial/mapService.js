//OL Navigation History custom control
ol.control.HistoryControl = function(opt_options){
    var options = opt_options || {};
    
    var this_ = this;
    
    this_.backBtn = document.createElement('button');
    this_.backBtn.className = 'ol-history-back';
    this_.backBtn.title = options.backLabel;
    this_.backBtn.innerHTML = '&#8592';
    
    this_.forwardBtn = document.createElement('button');
    this_.forwardBtn.className = 'ol-history-forward';
    this_.forwardBtn.title = options.forwardLabel;
    this_.forwardBtn.innerHTML = '&#8594';
    
    this_.historyArray = [];
    this_.historyLimit = 50;
    this_.updateByClick = false;
    
    //Calculate map state object describing the map view state
    this_.calculateMapState = function(){
        var view = this_.getMap().getView();
        var center = view.getCenter();
        return {
            zoom:  view.getZoom(),
            center: {
                x: Math.round(center[0] * 100) / 100,
                y: Math.round(center[1] * 100) / 100
            }
        };
    };
    
    //Update history array
    this_.updateHistory = function(){
        if (this_.updateByClick === false){
            var newMapState = this_.calculateMapState();
            if (typeof this_.historyIndex === 'undefined'){
                this_.historyArray.push(newMapState);
                this_.historyIndex = 0;
            } else {
                var oldMapState = this_.getMapState(this_.historyIndex);
                //Check if the new state is not equal to the current index (we need this to avoid 
                // pushing new states when the screen is being resized)
                if (this_.compareMapState(oldMapState, newMapState) === false){
                    if (this_.historyIndex < this_.historyArray.length - 1){
                        this_.historyArray.splice(this_.historyIndex + 1, this_.historyArray.length - 1 - this_.historyIndex);
                    }
                    this_.historyArray.push(newMapState);
                    this_.historyIndex += 1;
                }
                this_.checkHistoryLength();
            }
        } else {
            this_.updateByClick = false;
        }
    };
    
    //Get the state object of the map at the specified index
    this_.getMapState = function(idx){
        return this_.historyArray[idx];
    };
    
    //Check if new map state is equal to the current history index state
    this_.compareMapState = function(oldState, newState){
        var isEqual = true;
        for (var key in oldState){
            var value = oldState[key];
            if (typeof value === 'object'){
                if (value.x !== newState[key].x || value.y !== newState[key].y){
                    isEqual = false;
                }
            } else {
                if (value !== newState[key]){
                    isEqual = false;
                }
            }
        }
        
        return isEqual;
    };
    
    //Check length of history array and remove items if needed
    this_.checkHistoryLength = function(){
        if (this_.historyArray.length > this_.historyLimit){
            this_.historyArray.shift();
            if (this_.historyIndex !== 0){
                this_.historyIndex -= 1;
            }
        }
    };
    
    //Set map view by index
    this_.setMapView = function(idx){
        this_.updateByClick = true;
        var view = this_.getMap().getView();
        var viewData = this_.getMapState(idx);
        view.setZoom(viewData.zoom);
        view.setCenter([viewData.center.x, viewData.center.y]);
    };
    
    //Click event listeners for the buttons
    var backClick = function(e){
        if (this_.historyIndex > 0){
            this_.setMapView(this_.historyIndex - 1);
            this_.historyIndex -= 1;
        }
    };
    
    var forwardClick = function(e){
        if (this_.historyIndex < this_.historyArray.length - 1){
            this_.setMapView(this_.historyIndex + 1);
            this_.historyIndex += 1;
        }
    };
    
    this_.backBtn.addEventListener('click', backClick, false);
    this_.forwardBtn.addEventListener('click', forwardClick, false);
    
    var element = document.createElement('div');
    element.className = 'ol-history ol-unselectable ol-control';
    element.appendChild(this_.backBtn);
    element.appendChild(this_.forwardBtn);
    
    ol.control.Control.call(this, {
        element: element,
        target: options.target
    });
};
ol.inherits(ol.control.HistoryControl, ol.control.Control);

angular.module('unionvmsWeb').factory('mapService', function(locale, $window, $timeout) {
	var ms = {};
	
	//Initialize the map
	ms.setMap = function(config){
	    ms.controls = [];
	    ms.interactions = [];
	    
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
                    'STYLES': 'eez_label_geom'
                    //'cql_filter': "sovereign='Portugal' OR sovereign='Poland' OR sovereign='Bulgaria' OR sovereign='Belgium'"
                }
            })
        });
        
        var rfmoLayer = new ol.layer.Tile({
            source: new ol.source.TileWMS({
                attributions: [attribution],
                url: 'http://localhost:8080/geoserver/wms',
                serverType: 'geoserver',
                params: {
                    'LAYERS': 'uvms:rfmo',
                    'TILED': true,
                    'STYLES': ''
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
            target: 'map',
            controls: controlsToMap[0],
            interactions: controlsToMap[1],
            logo: false
        });
        
        map.beforeRender(function(map){
            map.updateSize();
        });
        
        map.on('moveend', function(e){
           var controls = e.map.getControls();
           controls.forEach(function(control){
               if (control instanceof ol.control.HistoryControl){
                   control.updateHistory();
               }
           }, controls);
        });
        
        map.addLayer(osmLayer);
//        map.addLayer(eezLayer);
//        map.addLayer(rfmoLayer);
//        map.addLayer(ms.addOpenSeaMap());
        map.setView(view);
        
        ms.map = map;
	};
	
	//Add layers
	ms.addOpenSeaMap = function(){
	    var layer = new ol.layer.Tile({
	        source: new ol.source.OSM({
	            attributions:[
	                new ol.Attribution({
	                    html: '&copy; <a href="http://www.openseamap.org/">OpenSeaMap</a> contributors.'
	                }),
	                ol.source.OSM.ATTRIBUTION
	            ],
	            url: 'http://tiles.openseamap.org/seamark/{z}/{x}/{y}.png',
	            crossOrigin: null
	        })
	    });
	    
	    return layer;
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
	    ms.controls.push(new ol.control.Attribution({
	        collapsible: false,
	        collapsed: false
	    }));
	    
	    return [new ol.Collection(ms.controls), new ol.Collection(ms.interactions)];
	};
	
	//Add map controls
	ms.addZoom = function(){
	    ms.controls.push(new ol.control.Zoom({
	        zoomInTipLabel: locale.getString('spatial.map_tip_zoomin'),
	        zoomOutTipLabel: locale.getString('spatial.map_tip_zoomout')
	    }));
	    ms.interactions.push(new ol.interaction.MouseWheelZoom());
	    ms.interactions.push(new ol.interaction.KeyboardZoom());
	};
	
	ms.addHistory = function(){
        var control = new ol.control.HistoryControl({
            backLabel: locale.getString('spatial.map_tip_go_back'),
            forwardLabel: locale.getString('spatial.map_tip_go_forward')
        });
        ms.controls.push(control);
    };
	
	ms.addFullscreen = function(){
	    var control = new ol.control.FullScreen({
            tipLabel: locale.getString('spatial.map_tip_fullscreen')
        });
	    
	    //We need to manually fix map height when map is toggled to fullscreen
	    control.element.onclick = function(e){
	        if (this.children[0].className.indexOf('false') !== -1){
	            //Map is in fullscreen
	            $timeout(function(){
	                angular.element('#map')[0].style.height = $window.innerHeight + 'px';
	                ms.updateMapSize();
	            }, 150);
	        }
	    };
	    
	    ms.controls.push(control);
	};
	
	ms.addScale = function(ctrl){
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