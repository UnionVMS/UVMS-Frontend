//OL Navigation History custom control
ol.control.HistoryControl = function(opt_options){
    var options = opt_options || {};

    var this_ = this;

    this_.backBtn = document.createElement('button');
    this_.backBtn.className = 'ol-history-back';
    this_.backBtn.title = options.backLabel;
    var backIcon = document.createElement('span');
    backIcon.className = 'fa fa-long-arrow-left';
    backIcon.style.fontSize = '13px';
    this_.backBtn.appendChild(backIcon);


    this_.forwardBtn = document.createElement('button');
    this_.forwardBtn.className = 'ol-history-forward';
    this_.forwardBtn.title = options.forwardLabel;
    var forwardIcon = document.createElement('span');
    forwardIcon.className = 'fa fa-long-arrow-right';
    forwardIcon.style.fontSize = '13px';
    this_.forwardBtn.appendChild(forwardIcon);

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

angular.module('unionvmsWeb').factory('mapService', function(locale, $window, $timeout, $templateRequest, spatialHelperService) {
	var ms = {};
	ms.sp = spatialHelperService;

	//Initialize the map
	ms.setMap = function(config){
	    ms.controls = [];
	    ms.interactions = [];
	    ms.overlay = ms.addPopupOverlay();
      // enables popup on positions and segments
      ms.activeLayerType = undefined;

	    var view = new ol.View({
	        projection: ms.setProjection(config.map.projection.epsgCode, config.map.projection.units, config.map.projection.global),
	        center: ol.proj.transform([-1.81185, 52.44314], 'EPSG:4326', 'EPSG:3857'),
//            extent: [-2734750,3305132,1347335,5935055],
	        zoom: 3,
	        maxZoom: 19,
//            minZoom: 3,
	        enableRotation: false
	    });

	    //Get all controls and interactions that will be added to the map
	    var controlsToMap = ms.setControls(config.map.controls);

	    var map = new ol.Map({
	        target: 'map',
	        controls: controlsToMap[0],
	        interactions: controlsToMap[1],
	        overlays: [ms.overlay],
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

	    map.on('singleclick', function(evt){
	        var coordinate = evt.coordinate;
	        var features = [];
	        map.forEachFeatureAtPixel(evt.pixel, function(feature, layer){
	            if (layer.get('type') === ms.activeLayerType){
	                features.push(feature.getProperties());
	            }
	        });

	        if (angular.isDefined(ms.activeLayerType) && features.length > 0 && angular.equals({}, ms.measureInteraction)){
	            var templateURL = 'partial/spatial/templates/' + ms.activeLayerType + '.html';

	            $templateRequest(templateURL).then(function(template){
	                var data;
	                if (ms.activeLayerType === 'vmspos'){
	                    data = ms.setPositionsObjPopup(features[0]);
	                } else if (ms.activeLayerType === 'vmsseg'){
	                    data = ms.setSegmentsObjPopup(features[0]);
	                }

	                var rendered = Mustache.render(template, data);
	                var content = document.getElementById('popup-content');
	                content.innerHTML = rendered;
	                ms.overlay.setPosition(coordinate);

	            }, function(){
	                console.log('error was here');
	                //error fetching template
	            });
	        }
	    });

	    map.setView(view);

	    ms.map = map;
	};

	//Add layers
    //create layer, returns ol.layer.* or undefined
    ms.createLayer = function( config ){
        var layer;
        switch (config.type) {
            case 'OSM':
                layer = ms.createOsm( config );
                break;
            case 'OSEA':
                layer = ms.createOseam(config);
                break;
            case 'WMS':
                layer = ms.createWms(config);
                break;
            case 'vmsseg'://'SEGMENTS':
                layer = ms.createSegmentsLayer( config );
                break;
            case 'vmspos'://'POSITIONS':
                layer = ms.createPositionsLayer( config );
                break;
            default:
        }

        return ( layer );
    };

    //Create OSM layer
    ms.createOsm = function( config ){
        var layer = new ol.layer.Tile({
            type: config.type,
            title: config.title,
            isBaseLayer: config.isBaseLayer,
            source: new ol.source.OSM()
        });

        return ( layer );
    };

    //Create OpenSeaMap layer
    ms.createOseam = function(config){
        var layer = new ol.layer.Tile({
            type: config.type,
            title: config.title,
            isBaseLayer: config.isBaseLayer,
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

        return (layer);
    };

    //create WMS tile layer
    ms.createWms = function( config ){
        var source, layer,
            attribution = new ol.Attribution({
                html: config.attribution
            });

        source = new ol.source.TileWMS({
            attributions: [ attribution ],
            url: config.url,
            serverType: config.serverType,
            params: config.params,
            crossOrigin: 'anonymous'
        });

        layer = new ol.layer.Tile({
            title: config.title,
            type: 'WMS',
            isBaseLayer: config.isBaseLayer,
            source: source
        });

        return ( layer );
    };

    //Add VMS positions layer
    ms.createPositionsLayer = function( config ) {
      var layer = new ol.layer.Vector({
          title: config.title,
          type: config.type,
          isBaseLayer: false,
          source: new ol.source.Vector({
              features: (new ol.format.GeoJSON()).readFeatures(config.geoJson, {
                  dataProjection: 'EPSG:4326',
                  featureProjection: ms.getMapProjectionCode()
              })
          }),
          style: ms.setPosStyle
      });
      
      //Update map extent
      var src = layer.getSource();
      if (src.getFeatures().length > 0){
          var geom = new ol.geom.Polygon.fromExtent(src.getExtent());
          ms.zoomTo(geom);
      }
      
      return( layer );
    };

    //Add VMS segments layer
    ms.createSegmentsLayer = function( config ) {
        var layer = new ol.layer.Vector({
            title: config.title,
            type: config.type,
            isBaseLayer: false,
            source: new ol.source.Vector({
                features: (new ol.format.GeoJSON()).readFeatures(config.geoJson, {
                    dataProjection: 'EPSG:4326',
                    featureProjection: ms.getMapProjectionCode()
                })
            }),
            style: ms.setSegStyle
        });
        
        ms.calculateJenkinsIntervals(config.geoJson);

        return( layer );
    };
    
    //Add highlight layer
    ms.addFeatureOverlay = function(){
        var layer = new ol.layer.Vector({
            type: 'highlight',
            isBaseLayer: false,
            source: new ol.source.Vector({
                features: []
            }),
            style: ms.setHighlightStyle
        });

        ms.map.addLayer(layer);
    };

    //Add highlight feature, geometry should be passed using the same projection of the map
    ms.highlightFeature = function(geom){
        var feature = new ol.Feature({
            geometry: geom
        });

        var layer = ms.getLayerByType('highlight').getSource();
        layer.clear(true);
        layer.addFeature(feature);
    };
    
    //Add vector layer for measuring purposes
    ms.addMeasureLayer = function(){
        var layer = new ol.layer.Vector({
            type: 'measure-vector',
            source: new ol.source.Vector(),
            style: ms.setMeasureStyle
        });
        ms.map.addLayer(layer);
        
        return layer;
    };
    
    //STYLES
    //Highlight styles
    ms.setHighlightStyle = function(feature, resolution){
        var style;
        var color = '#3399CC';
        var geomType = feature.getGeometry().get('GeometryType');
        if (geomType === 'Point'){
            style = new ol.style.Style({
                image: new ol.style.Circle({
                    radius: 13,
                    stroke: new ol.style.Stroke({
                        width: 4,
                        color: color
                    })
                })
            });
        } else if (geomType === 'LineString' || geomType === 'MultiLineString'){
            style = new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: color,
                    width: 8
                })
            });
        }

        return [style];
    };
    
    //Measure styles
    ms.setMeasureStyle = function(feature, resolution){
        var styles = [];
        var coords = feature.getGeometry().getCoordinates();
        coords.shift();
        
        var bufferLineStyle = new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: 'rgba(255, 255, 255, 0.8)',
                width: 4
            })
        });
        styles.push(bufferLineStyle);
        
        var lineStyle = new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: 'rgba(120, 120, 120, 1)',
                width: 2
            }) 
        });
        styles.push(lineStyle);
        
        var pointStyle = new ol.style.Style({
            image: new ol.style.Circle({
                radius: 5,
                fill: new ol.style.Fill({
                    color: 'rgba(120, 120, 120, 1)',
                    
                }),
                stroke: new ol.style.Stroke({
                    color: 'rgba(255, 255, 255, 0.8)',
                    width: 2
                })
            }),
            geometry: function(){
                return new ol.geom.MultiPoint(coords);
            }
        });
        styles.push(pointStyle);
        
        return styles;
    };

    //VMS styles
    ms.styles = {
        positions: undefined,
        segments: undefined,
        speedBreaks: []
    };
    
    ms.setFlagStateStyles = function(styles){
        ms.styles.positions = styles;
    };
    
    ms.setSpeedStyles = function(styles){
        ms.styles.segments = styles;  
    };
    
    ms.calculateJenkinsIntervals = function(geoJson){
        var breaks = turf.jenks(geoJson, 'speedOverGround', 4);
        if (breaks !== null){
            ms.styles.speedBreaks = breaks;
            ms.styles.speedBreaks[4] = ms.styles.speedBreaks[4] + 1;
        }
    };
    
    ms.getColorByFlagState = function(fs){
        return ms.styles.positions[fs.toLowerCase()];
    };
    
    ms.getColorBySpeed = function(speed){
        for (var i = 1; i < ms.styles.speedBreaks.length; i++){
            if (speed >= ms.styles.speedBreaks[i-1] && speed < ms.styles.speedBreaks[i]){
                var segStyleKey = Object.keys(ms.styles.segments)[i-1];
                return ms.styles.segments[segStyleKey];
            }
        }
    };
    
    //VMS positions style
    ms.setPosStyle = function(feature, resolution){
        var style = new ol.style.Style({
            text: new ol.style.Text({
                text: '\uf124',
                font: 'normal 22px FontAwesome',
                textBaseline: 'middle',
                textAlign: 'center',
                rotation: -0.78 + ms.degToRad(feature.get('reportedCourse')),
                fill: new ol.style.Fill({
                    color: ms.getColorByFlagState(feature.get('countryCode'))
                })
            })
        });
        
        
        return [style];
    };

    //VMS segments style
    ms.setSegStyle = function(feature, resolution){
        var geometry = feature.getGeometry();
        var color = ms.getColorBySpeed(feature.get('speedOverGround'));

        var style = [
            new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: 'white',
                    width: 4
                })
            }),
            new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: color,
                    width: 2
                })
            }),
            new ol.style.Style({
                geometry: new ol.geom.Point(ms.getMiddlePoint(geometry)),
                text: new ol.style.Text({
                    text: '\uf105',
                    font: 'bold 20px FontAwesome',
                    //textBaseline: 'middle',
                    //textAlign: 'center',
                    rotation: ms.getRotationForArrow(geometry),
                    fill: new ol.style.Fill({
                        color: 'white'
                    })
                })
            }),
            new ol.style.Style({
                geometry: new ol.geom.Point(ms.getMiddlePoint(geometry)),
                text: new ol.style.Text({
                    text: '\uf105',
                    font: 'bold 16px FontAwesome',
                    //textBaseline: 'middle',
                    //textAlign: 'center',
                    rotation: ms.getRotationForArrow(geometry),
                    fill: new ol.style.Fill({
                        color: color
                    })
                })
            })
        ];
        

        return style;
    };

    //MAP FUNCTIONS
	//Clear map before running a new report
	ms.clearVectorLayers = function(config){
	    ms.map.removeLayer(ms.getLayerByType('highlight'));
	    ms.map.removeLayer(ms.getLayerByType('vmspos'));
	    ms.map.removeLayer(ms.getLayerByType('vmsseg'));
	};

	//Find layers by title
	ms.getLayerByTitle = function(title){
	    var layers = ms.map.getLayers().getArray();
	    var layer = layers.filter(function(layer){
	        return layer.get('title') === title;
	    });

	    return layer[0];
	};

	//Find layers by type
    ms.getLayerByType = function(type){
        var layers = ms.map.getLayers().getArray();
        var layer = layers.filter(function(layer){
            return layer.get('type') === type;
        });

        return layer[0];
    };

    //Get map projection
    ms.getMapProjectionCode = function(){
        return ms.map.getView().getProjection().getCode();
    };

    //Recalculate map size
    ms.updateMapSize = function(){
        if (!ms.map) {
            return;
        }
        ms.map.updateSize();
    };

    //GENERIC FUNCTIONS FOR CONTROLS AND STYLES
	//Convert degrees to radians
	ms.degToRad = function(degrees){
	    return degrees * Math.PI / 180;
	};

	//Calculate middle point in a linestring geometry
	ms.getMiddlePoint = function(geometry){
	    var sourceProj = ms.getMapProjectionCode();
	    var p1 = ms.pointCoordsToTurf(ol.proj.transform(geometry.getFirstCoordinate(), sourceProj, 'EPSG:4326'));
	    var p2 = ms.pointCoordsToTurf(ol.proj.transform(geometry.getLastCoordinate(), sourceProj, 'EPSG:4326'));
	    
	    var middlePoint = ms.turfToOlGeom(turf.midpoint(p1, p2));
	   
	    return geometry.getClosestPoint(middlePoint.getCoordinates());
	};

	//Calculate rotation to display arrow on segments according to the geometry direction
	ms.getRotationForArrow = function(geometry){
	    var p1 = geometry.getFirstCoordinate();
        var p2 = geometry.getLastCoordinate();

        var dx = p2[0] - p1[0];
        var dy = p2[1] - p1[1];

        return Math.atan2(dy, dx) * -1;
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


    //SETTERS
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
	    ms.interactions.push(new ol.interaction.DoubleClickZoom());
	};

	ms.addHistory = function(){
        var control = new ol.control.HistoryControl({
            backLabel: locale.getString('spatial.map_tip_go_back'),
            forwardLabel: locale.getString('spatial.map_tip_go_forward')
        });
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

	//Zoom to geometry control
	ms.zoomTo = function(geom){
	    ms.map.getView().fit(geom, ms.map.getSize(), {maxZoom: 19});
	};

	//Pan to coordinates control
	ms.panTo = function(coords){
	    ms.map.getView().setCenter(coords);
	};
	
	//Measuring interaction
	ms.measureInteraction = {};
	ms.startMeasureControl = function(){
	    var layer = ms.getLayerByType('measure-vector');
        if (angular.isDefined(layer)){
            ms.map.removeLayer(layer);
        }
        layer = ms.addMeasureLayer();
        var draw = new ol.interaction.Draw({
            source: layer.getSource(),
            type: 'LineString',
            style: new ol.style.Style({
                fill: new ol.style.Fill({
                    color: 'rgba(255, 255, 255, 0.2)'
                }),
                stroke: new ol.style.Stroke({
                    color: 'rgba(0, 0, 0, 0.5)',
                    lineDash: [10, 10],
                    width: 2
                }),
                image: new ol.style.Circle({
                    radius: 5,
                    stroke: new ol.style.Stroke({
                        color: 'rgba(0, 0, 0, 0.7)'
                    }),
                    fill: new ol.style.Fill({
                        color: 'rgba(255, 255, 255, 0.2)'
                    })
                })
            })
        });
        
        ms.map.addInteraction(draw);
        ms.registerDrawEvents(draw, layer);
        ms.measureInteraction = draw;
	};
	
	ms.measurePointsLength = 0;
	ms.measureOverlays = [];
	ms.measureETA = undefined;
	ms.registerDrawEvents = function(draw, layer){
	    var listener;
	    draw.on('drawstart', function(evt){
	        //Clear any vector features previous drawn
	        layer.getSource().clear();
	        ms.clearMeasureOverlays();
	        
	        //Disable user input on config window
	        ms.sp.measure.disabled = true;
	        
	        var feature = evt.feature;
	        ms.measurePointsLength = feature.getGeometry().getCoordinates().length - 1; 
	        
	        listener = feature.getGeometry().on('change', function(evt){
	            var coords = evt.target.getCoordinates();
	            if (coords.length !== ms.measurePointsLength + 1){
	                ms.measurePointsLength += 1;
	                var data = ms.calculateLengthAndBearingAndETA(evt.target);
	                if (angular.isDefined(data)){
	                    ms.createMeasureTooltip(data);
	                }
	            }
	        });
	    });
	    
	    draw.on('drawend', function(evt){
	        ms.measurePointsLength = 0;
	        ms.sp.measure.disabled = false;
	        ol.Observable.unByKey(listener);
	        if (ms.measureOverlays.length > 1){
	            var lastOverlay = ms.measureOverlays.pop();
	            ms.map.removeOverlay(lastOverlay);
	        }
	        ms.measureETA = undefined;
	    });
	};
	
	//Calculate length over the sphere and bearing
	ms.calculateLengthAndBearingAndETA = function(line){
	    var coords = line.getCoordinates();
	    var sourceProj = ms.getMapProjectionCode();
	    
	    //Calculate distance
	    if (coords.length > 2){
    	    var c1 = ms.pointCoordsToTurf(ol.proj.transform(coords[coords.length - 3], sourceProj, 'EPSG:4326'));
    	    var c2 = ms.pointCoordsToTurf(ol.proj.transform(coords[coords.length - 2], sourceProj, 'EPSG:4326'));
    	    var units = 'kilometers';
    	    var displayUnits = 'km';
    	    if (ms.sp.measure.units === 'mi'){
    	        units = 'miles';
    	        displayUnits = 'mi';
    	    }
    	    
    	    var distance = turf.distance(c1, c2, units);
    	    var bearing = turf.bearing(c1, c2);
    	    
    	    //Calculate ETA
            if(angular.isDefined(ms.sp.measure.speed) && angular.isDefined(ms.sp.measure.startDate) && ms.sp.measure.speed != null && ms.sp.measure.speed > 0){
                //Convert knots to kmh
                var avgSpeed = ms.sp.measure.speed * 1.852;
                
                //Make sure we use distance in km
                var distanceForETA;
                if (displayUnits === 'mi'){
                    distanceForETA = distance * 1.609344;
                } else {
                    distanceForETA = distance;
                }
                
                //Calculate necessary time for the specified distance
                var timeSpent = distanceForETA / avgSpeed; //in hours
                
                if (!angular.isDefined(ms.measureETA)){
                    ms.measureETA = moment.utc(ms.sp.measure.startDate);
                }
                ms.measureETA.add(timeSpent, 'hours');
            }
    	    
    	    
    	    if (ms.sp.measure.units === 'nm'){
    	        displayUnits = 'nm';
    	        distance = distance * 1000 / 1852;
    	    }
    	    
    	    if (distance < 1 && displayUnits === 'km'){
    	        distance = distance * 1000;
    	        displayUnits = 'm';
    	    }
    	    
    	    if (bearing < 0){
    	        bearing = bearing + 360;
    	    }
    	    
    	    distance = Math.round(distance * 100) / 100; //2 decimals
    	    bearing = Math.round(bearing * 100) / 100; //2 decimals
    	    
    	    
    	    var response = {
    	        distance: distance,
    	        dist_units: displayUnits, 
    	        bearing: bearing,
    	        bearing_units: '\u00b0',
    	        anchorPosition: coords[coords.length - 2]
    	    };
    	    
    	    if (angular.isDefined(ms.measureETA)){
    	        response.eta = ms.measureETA.format('YYYY-MM-DD HH:mm:ss');
    	    }
    	    
    	    return response;
	    }
	};
	
	ms.createMeasureTooltip = function(data){
	    var el = document.createElement('div');
	    el.className = 'map-tooltip map-tooltip-small';
	    
	    data.dist_title = locale.getString('spatial.map_measure_distance_title');
	    data.bearing_title = locale.getString('spatial.map_measure_bearing_title');
	    if (angular.isDefined(data.eta)){
	        data.eta_title = locale.getString('spatial.map_measure_eta_title');
	        el.className = 'map-tooltip map-tooltip-large';
	    }
	   
	    var templateURL = 'partial/spatial/templates/measure_tooltip.html';
	    $templateRequest(templateURL).then(function(template){
            var rendered = Mustache.render(template, data);
            el.innerHTML = rendered;
        }, function(){
            //error fetching template
        });
	    
	    var offset = [];
	    if (data.bearing >= 0 && data.bearing <= 90){
	        offset = [-135, -45];
	        if (angular.isDefined(data.eta)){
	            offset = [-163, -63];
	        }
	    } else if (data.bearing > 90 && data.bearing <= 180){
	        offset = [6, -40];
	        if (angular.isDefined(data.eta)){
                offset = [6, -57];
            }
	    } else if (data.bearing > 180 && data.bearing <= 270){
	        offset = [2, 8];
	    } else {
	        offset = [-135, 6];
	        if (angular.isDefined(data.eta)){
                offset = [-163, 6];
            }
	    }
	    
	    var tooltip = new ol.Overlay({
	        element: el,
	        offset: offset,
	        insertFirst: false
	    });
	    
	    ms.map.addOverlay(tooltip);
	    tooltip.setPosition(data.anchorPosition);
	    ms.measureOverlays.push(tooltip);
	};
	
	ms.clearMeasureOverlays = function(){
	    for (var i = 0; i < ms.measureOverlays.length; i++){
	        ms.map.removeOverlay(ms.measureOverlays[i]);
	    }
	    ms.measureOverlays = [];
	};
	
	ms.clearMeasureControl = function(){
	    ms.clearMeasureOverlays();
	    ms.map.removeInteraction(ms.measureInteraction);
	    ms.map.removeLayer(ms.getLayerByType('measure-vector'));
	    ms.measureInteraction = {};
	};
	
	ms.pointCoordsToTurf = function(coords){
	    var format = new ol.format.GeoJSON();
        var point = new ol.Feature(
            new ol.geom.Point(coords)
        );
        
        return format.writeFeatureObject(point);
	};
	
	ms.turfToOlGeom = function(feature){
        var format = new ol.format.GeoJSON();
        return format.readFeature(feature).getGeometry().transform('EPSG:4326', ms.getMapProjectionCode());
    };
	
	//Popup to display vector info
	ms.addPopupOverlay = function(){
	    var overlay = new ol.Overlay({
	        element: document.getElementById('popup'),
	        autoPan: true,
	        autoPanAnimation: {
	            duration: 250
	        }
	    });

	    return overlay;
	};

	ms.closePopup = function(){
	    ms.overlay.setPosition(undefined);
	    return false;
	};

	//POPUP - Define the object that will be used in the popup for vms positions
    ms.setPositionsObjPopup = function(feature){
        //TODO fetch visibility of attributes selected by user, date format from config
        var coords = feature.geometry.getCoordinates();
        var repCoords = ol.proj.transform(coords, ms.getMapProjectionCode(), 'EPSG:4326');
        var data = {
            titles: {
                vessel_tag: locale.getString('spatial.reports_form_vessels_search_by_vessel'),
                fs: locale.getString('spatial.reports_form_vessel_search_table_header_flag_state'),
                extMark: locale.getString('spatial.reports_form_vessel_search_table_header_external_marking'),
                ircs: locale.getString('spatial.reports_form_vessel_search_table_header_ircs'),
                cfr: locale.getString('spatial.reports_form_vessel_search_table_header_cfr'),
                posTime: locale.getString('spatial.tab_vms_pos_table_header_date'),
                lon: locale.getString('spatial.tab_vms_pos_table_header_lon'),
                lat: locale.getString('spatial.tab_vms_pos_table_header_lat'),
                stat: locale.getString('spatial.tab_vms_pos_table_header_status'),
                m_spd: locale.getString('spatial.tab_vms_pos_table_header_measured_speed'),
                c_spd: locale.getString('spatial.tab_vms_pos_table_header_calculated_speed'),
                crs: locale.getString('spatial.tab_vms_pos_table_header_course'),
                msg_tp: locale.getString('spatial.tab_vms_pos_table_header_msg_type'),
                act_tp: locale.getString('spatial.tab_vms_pos_table_header_activity_type'),
                source: locale.getString('spatial.tab_vms_pos_table_header_source')
            },
            visibility: {
                fs: true,
                extMark: true,
                ircs: true,
                cfr: true,
                posTime: true,
                lon: true,
                lat: true,
                stat: true,
                m_spd: true,
                c_spd: true,
                crs: true,
                msg_tp: true,
                act_tp: true,
                src: true
            },
            properties: feature,
            formatedDate: moment.utc(feature.positionTime).format('YYYY-MM-DD HH:mm:ss'),
            coordinates: {
                lon: repCoords[0].toFixed(5).toString() + ' \u00b0',
                lat: repCoords[1].toFixed(5).toString() + ' \u00b0'
            }
        };

        return data;
    };

    //POPUP - Define the object that will be used in the popup for vms positions
    ms.setSegmentsObjPopup = function(feature){
        //TODO fetch visibility of attributes selected by user
        var data = {
            titles: {
                vessel_tag: locale.getString('spatial.reports_form_vessels_search_by_vessel'),
                fs: locale.getString('spatial.reports_form_vessel_search_table_header_flag_state'),
                extMark: locale.getString('spatial.reports_form_vessel_search_table_header_external_marking'),
                ircs: locale.getString('spatial.reports_form_vessel_search_table_header_ircs'),
                cfr: locale.getString('spatial.reports_form_vessel_search_table_header_cfr'),
                dist: locale.getString('spatial.tab_vms_seg_table_header_distance'),
                dur: locale.getString('spatial.tab_vms_seg_table_header_duration'),
                spd: locale.getString('spatial.tab_vms_seg_table_header_speed_ground'),
                crs: locale.getString('spatial.tab_vms_seg_table_header_course_ground'),
                cat: locale.getString('spatial.tab_vms_seg_table_header_category')
            },
            visibility: {
                fs: true,
                extMark: true,
                ircs: true,
                cfr: true,
                dist: true,
                dur: true,
                spd: true,
                crs: true,
                cat: true
            },
            properties: feature
        };

        return data;
    };

	return ms;
});
