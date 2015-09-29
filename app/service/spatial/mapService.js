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

angular.module('unionvmsWeb').factory('mapService', function(locale, $window, $timeout) {
	var ms = {};

	//Initialize the map
	ms.setMap = function(config){
	    ms.controls = [];
	    ms.interactions = [];

      var attribution = new ol.Attribution({
          html: 'This is a custom layer from UnionVMS'
      });

      var rfmoLayer = new ol.layer.Tile({
          title: 'rfmo',
          isBaseLayer: false,
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

      //map.addLayer(osmLayer);
      //map.addLayer(eezLayer);
//        map.addLayer(rfmoLayer);
//        map.addLayer(ms.addOpenSeaMap());
      map.setView(view);

      ms.map = map;
	};

  // create layer, returns ol.layer.* or undefined
  ms.createLayer = function( config ){
    var layer;

    switch (config.title) {
      case 'osm':
        layer = ms.createOsm( config );
        break;
      case 'eez':
        layer = ms.createWms( config );
        break;
      default:
    }

    return ( layer );
  };

  ms.createOsm = function( config ){
    var layer = new ol.layer.Tile({
      title: config.title,
      isBaseLayer: config.isBaseLayer,
      source: new ol.source.OSM()
    });

    return ( layer );
  };

  // create WMS tile layer
  ms.createWms = function( config ){
    var source = new ol.source.TileWMS({
      attributions: config.attributions,
      url: config.url,
      serverType: config.serverType,
      params: config.params
    });

    var layer = new ol.layer.Tile({
      title: config.title,
      isBaseLayer: config.isBaseLayer,
      source: source
    });

    return ( layer );
  };

	//Clear map before running a new report
	ms.clearMap = function(config){
	    ms.map.removeLayer(ms.getLayerByTitle('highlight'));
	    ms.map.removeLayer(ms.getLayerByTitle('vmspos'));
	    ms.map.removeLayer(ms.getLayerByTitle('vmsseg'));

	    //TODO change map and view properties according to user definition
	};

	//Add layers
	ms.addOpenSeaMap = function(){
	    var layer = new ol.layer.Tile({
	        title: 'oseam',
	        isBaseLayer: true,
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

	//Add highlight layer
	ms.addFeatureOverlay = function(){
	    var layer = new ol.layer.Vector({
	        title: 'highlight',
	        isBaseLayer: false,
	        source: new ol.source.Vector({
	            features: []
	        }),
	        style: ms.setHighlightStyle
	    });

	    ms.map.addLayer(layer);
	};

	//Highlight styles
	ms.setHighlightStyle = function(feature, resolution){
	    var style;
	    var color = '#FF9966';
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
	    } else if (geomType === 'LineString'){
	        style = new ol.style.Style({
	            stroke: new ol.style.Stroke({
	                color: color,
	                width: 6
	            })
	        });
	    }

	    return [style];
	};

	//Add highlight feature, geometry should be passed using the same projection of the map
	ms.highlightFeature = function(geom){
	    var feature = new ol.Feature({
            geometry: geom
        });

	    var layer = ms.getLayerByTitle('highlight').getSource();
	    layer.clear(true);
	    layer.addFeature(feature);
	};

	//Find layers by title
	ms.getLayerByTitle = function(title){
	    var layers = ms.map.getLayers().getArray();
	    var layer = layers.filter(function(layer){
	        return layer.get('title') === title;
	    });

	    return layer[0];
	};

	//Add VMS positions layer
	ms.addPositions = function(geojson) {
	    var layer = new ol.layer.Vector({
	        title: 'vmspos',
	        isBaseLayer: false,
            source: new ol.source.Vector({
                features: (new ol.format.GeoJSON()).readFeatures(geojson, {
                    dataProjection: 'EPSG:4326',
                    featureProjection: ms.getMapProjectionCode()
                })
            }),
            style: ms.setPosStyle
        });

	    ms.map.addLayer(layer);
	};

	//Convert degrees to radians
	ms.degToRad = function(degrees){
	    return degrees * Math.PI / 180;
	};

	//VMS positions style
	ms.setPosStyle = function(feature, resolution){
	    var style = new ol.style.Style({
            text: new ol.style.Text({
                text: '\uf124',
                font: 'normal 22px FontAwesome',
                textBaseline: 'middle',
                textAlign: 'center',
                rotation: -0.78 + ms.degToRad(feature.get('crs')),
                fill: new ol.style.Fill({
                    color: feature.get('color')
                })
            })
        });

	    return [style];
	};

	//Calculate middle point in a linestring geometry
	ms.getMiddlePoint = function(geometry){
	    var p1 = geometry.getFirstCoordinate();
	    var p2 = geometry.getLastCoordinate();

	    var x = (p1[0] + p2[0]) / 2;
	    var y = (p1[1] + p2[1]) / 2;

	    return [x,y];
	};

	//Calculate rotation to display arrow on segments according to the geometry direction
	ms.getRotationForArrow = function(geometry){
	    var p1 = geometry.getFirstCoordinate();
        var p2 = geometry.getLastCoordinate();

        var dx = p2[0] - p1[0];
        var dy = p2[1] - p1[1];

        return Math.atan2(dy, dx) * -1;
	};

	//VMS segments style
	ms.setSegStyle = function(feature, resolution){
	    var geometry = feature.getGeometry();

	    var style = [
	        new ol.style.Style({
	            stroke: new ol.style.Stroke({
	                color: feature.get('color'),
	                width: 2
	            })
	        }),
	        new ol.style.Style({
	            geometry: new ol.geom.Point(ms.getMiddlePoint(geometry)),
	            text: new ol.style.Text({
	                text: '\uf105',
	                font: 'bold 16px FontAwesome',
	                textBaseline: 'middle',
	                textAlign: 'center',
	                rotation: ms.getRotationForArrow(geometry),
	                fill: new ol.style.Fill({
	                    color: feature.get('color')
	                })
	            })
	        })
	    ];

	    return style;
	};

	//Add VMS segments layer
	ms.addSegments = function(geojson){
	    var layer = new ol.layer.Vector({
	        title: 'vmsseg',
	        isBaseLayer: false,
	        source: new ol.source.Vector({
	            features: (new ol.format.GeoJSON()).readFeatures(geojson, {
	                dataProjection: 'EPSG:4326',
	                featureProjection: ms.getMapProjectionCode()
	            })
	        }),
	        style: ms.setSegStyle
	    });

	    ms.map.addLayer(layer);
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

	//Get map projection
	ms.getMapProjectionCode = function(){
	    return ms.map.getView().getProjection().getCode();
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
	    var fullIcon = document.createElement('span');
	    fullIcon.className = 'fa fa-arrows-alt';
	    fullIcon.style.fontSize = '12px';
	    fullIcon.style.fontWeight = '100';

	    var control = new ol.control.FullScreen({
            tipLabel: locale.getString('spatial.map_tip_fullscreen'),
            label: fullIcon
        });

	    //We need to manually fix map height when map is toggled to fullscreen
	    control.element.onclick = function(e){
	        if (this.children[0].className.indexOf('false') !== -1){
	            //Map is in fullscreen
	            $timeout(function(){
	                angular.element('#map')[0].style.height = $window.innerHeight + 'px';
	                angular.element('#map')[0].style.width = $window.innerWidth + 'px';
	                ms.updateMapSize();
	            }, 150);
	        } else {
	            $timeout(function(){
                    angular.element('#map')[0].style.width = '';
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

	//Zoom to geometry control
	ms.zoomTo = function(geom){
	    ms.map.getView().fit(geom, ms.map.getSize(), {maxZoom: 19});
	};

	//Pan to coordinates control
	ms.panTo = function(coords){
	    ms.map.getView().setCenter(coords);
	};

	//Recalculate map size
  ms.updateMapSize = function(){
    if (!ms.map) {
      return;
    }
    ms.map.updateSize();
  };

	return ms;
});
