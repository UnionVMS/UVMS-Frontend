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

angular.module('unionvmsWeb').factory('mapService', function(locale, $window, $timeout, $interval, $templateRequest, $filter, spatialHelperService, globalSettingsService, unitConversionService, coordinateFormatService, MapFish) {
	var ms = {};
	ms.sp = spatialHelperService;

	//Initialize the map
	ms.setMap = function(config){
	    ms.controls = [];
	    ms.interactions = [];
	    ms.overlay = ms.addPopupOverlay();
        
	    // enables popup on positions and segments
        ms.activeLayerType = undefined;
        
	    //Get all controls and interactions that will be added to the map
	    var controlsToMap = ms.setControls(config.map.control);

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
            
            //Adjust print extent to the new map scale
            var printLayer = ms.getLayerByType('print');
            if (angular.isDefined(printLayer) && ms.map.getView().getResolution() !== ms.mapPrintResolution){
                ms.addPrintExtent();
            }
            
            ms.checkLabelStatus();
	    });
	    
	    map.on('change:size', function(e){
	        //Adjust print extent to the new map scale
            var printLayer = ms.getLayerByType('print');
            if (angular.isDefined(printLayer)){
                ms.addPrintExtent();
            }
	    });

	    map.on('singleclick', function(evt){
	        var pixel = evt.pixel;
	        var coordinate = evt.coordinate;
	        var selInteraction = ms.getInteractionsByType('Select')[0];
	        
	        var record;
	        ms.popupSegRecContainer.reset();
	        var records = [];
	        
	        //get feature info
	        if (angular.isDefined(ms.activeLayerType) && ((ms.activeLayerType === 'vmspos' && ms.popupVisibility.positions.length > 0) || (ms.activeLayerType === 'vmsseg' && ms.popupVisibility.segments.length > 0))){
	            map.forEachFeatureAtPixel(pixel, function(feature, layer){
	                if (angular.isDefined(ms.activeLayerType)){
	                    if (layer !== null && layer.get('type') === ms.activeLayerType){
	                        if (ms.activeLayerType === 'vmspos'){
	                            var positions = feature.get('features');
	                            if (positions.length === 1){
	                                record = {
	                                    data: positions[0].getProperties(),
	                                    coord: positions[0].getGeometry().getCoordinates(),
	                                    fromCluster: false
	                                };
	                            }
	                        } else{
	                            records.push({
	                                data: feature.getProperties(),
	                                coord: feature.getGeometry().getClosestPoint(coordinate),
	                                fromCluster: false
	                            });
	                        }
	                    }
	                }
	            });
	            
	            if (!angular.isDefined(record) && ms.activeLayerType === 'vmspos' && selInteraction.getFeatures().getLength() > 0){
	                var positions = selInteraction.getFeatures().getArray()[0].get('features');
	                var minDist;
	                positions.forEach(function(position){
	                    var distance = new ol.geom.LineString([coordinate, position.get('spiderCoords')]).getLength();
	                    if (!angular.isDefined(minDist) || distance < minDist){
	                        minDist = distance;
	                        record = {
	                            data: position.getProperties(),
	                            coord: position.get('spiderCoords'),
	                            fromCluster: true
	                        };
	                    }
	                });
	            }
	            
	            if (angular.isDefined(ms.activeLayerType) && (angular.isDefined(record) || records.length > 0) && angular.equals({}, ms.measureInteraction)){
	                if (records.length > 0){
	                    record = records[0];
	                }
	                
	                var data;
	                if (ms.activeLayerType === 'vmspos'){
	                    data = ms.setPositionsObjPopup(record.data);
	                } else if (ms.activeLayerType === 'vmsseg'){
	                    data = ms.setSegmentsObjPopup(record.data);
	                    ms.popupSegRecContainer.records = records;
	                    ms.popupSegRecContainer.currentIdx = 0;
	                }
	                ms.requestPopupTemplate(data, record.coord, record.fromCluster);
	            }
	        }
	    });
	    
	    var view = ms.createView(config.map.projection);
	    view.on('change:resolution', function(evt){
	        //Clear features on expanded clusters when zooming
	        var select = ms.getInteractionsByType('Select')[0];
	        if (angular.isDefined(select)){
	            select.getFeatures().clear();
	            if (angular.isDefined(ms.overlay) && ms.overlay.get('fromCluster') === true){
	                ms.closePopup();
	            }
	        }
	        
	        ms.checkLabelStatus();
	    });
	    
	    map.setView(view);
	    ms.map = map;
	    ms.addBlankLayer();
	    
	    ms.map.getViewport().addEventListener('contextmenu', function(e){
            e.preventDefault();
            var select = ms.getInteractionsByType('Select')[0];
            var selFeatures = select.getFeatures();
            if (angular.isDefined(ms.overlay) && ms.overlay.get('fromCluster') === true){
                ms.closePopup();
            }
            if (e.shiftKey === true){
                selFeatures.clear();
            } else {
                var foundedFeatures = false;
                map.forEachFeatureAtPixel(map.getEventPixel(e), function(feature, layer){
                    if (layer !== null && layer.get('type') === 'vmspos'){
                        if (selFeatures.getLength() > 0){
                            selFeatures.clear();
                        }
                        selFeatures.push(feature);
                        foundedFeatures = true;
                    }
                });
                
                if (foundedFeatures === false){
                    selFeatures.clear();
                } else if (foundedFeatures === true && angular.isDefined(ms.overlay) && ms.overlay.get('fromCluster') === true){
                    ms.closePopup();
                }
            }
        });
	};
	
	//Create map view
	ms.createView = function(config){
	    var center = ol.proj.transform([-1.81185, 52.44314], 'EPSG:4326', 'EPSG:' + config.epsgCode);
	    
	    var view = new ol.View({
            projection: ms.setProjection(config),
            center: center,
//            extent: [-2734750,3305132,1347335,5935055],
//            loadTilesWhileInteracting: true,
            zoom: 3,
            maxZoom: 19,
//            minZoom: 3,
            enableRotation: false
        });
	    
	    return view;
	};
	
	//Change map view with new config
	ms.updateMapView = function(config){
	    var view = ms.createView(config);
	    ms.map.setView(view);
	};
	
	//Remove all layers
	ms.removeAllLayers = function(){
	    var layers = ms.map.getLayers();
	    if (layers.getLength() > 0){
	        layers.clear();
	    }
	    
	    //Always add blank layer
	    ms.addBlankLayer();
	};
	
	//Add layers
	//Create and add blank base layer
	ms.addBlankLayer = function(){
	    var proj = ms.map.getView().getProjection(); 
	    var layer = new ol.layer.Image({
	        type: 'mapbackground',
	        opacity: 1,
	        source: new ol.source.ImageStatic({
	            url: 'assets/images/base-layer.png',
	            proj: proj,
	            imageExtent: proj.getExtent(),
	            imageSize: [256,256]
	        })
	    });
	    
	    ms.map.addLayer(layer);
	};
	
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
            case 'BING':
                layer = ms.createBing(config);
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
                    })
                ],
                url: 'http://tiles.openseamap.org/seamark/{z}/{x}/{y}.png',
                crossOrigin: null
            })
        });

        return (layer);
    };
    
    //Create Bing layers
    ms.createBing = function(config){
        var layer = new ol.layer.Tile({
            type: config.type,
            title: config.title,
            isBaseLayer: config.isBaseLayer,
            //preload: Infinity,
            source: new ol.source.BingMaps({
                key: config.apiKey,
                imagerySet: config.layerGeoName,
                maxZoom: 19
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
            longAttribution: config.longAttribution,
            isBaseLayer: config.isBaseLayer,
            source: source
        });
        
        layer.set('serverType', config.serverType); 

        return ( layer );
    };

    //Add VMS positions layer
    ms.createPositionsLayer = function( config ) {
        var source = new ol.source.Vector({
            features: (new ol.format.GeoJSON()).readFeatures(config.geoJson, {
                dataProjection: 'EPSG:4326',
                featureProjection: ms.getMapProjectionCode()
            })
        });
        
        var attribution = new ol.Attribution({
            html: locale.getString('spatial.vms_positions_copyright')
        });
        
        var cluster = new ol.source.Cluster({
            attributions: [attribution],
            distance: 20,
            source: source
        });
        
        var layer = new ol.layer.Vector({
            title: config.title,
            type: config.type,
            longAttribution: config.longAttribution,
            isBaseLayer: false,
            source: cluster,
            style: ms.setClusterStyle
        });
        
        ms.addClusterExploder(layer);
      
        return( layer );
    };
    
    //Update map extent after loading vector layers if the map tab is active
    ms.zoomPromise = undefined;
    ms.zoomToPositionsLayer = function(){
        var layerSrc = ms.getLayerByType('vmspos').getSource();
        ms.zoomPromise = $interval(function(){
            if (angular.isDefined(layerSrc) && layerSrc.getFeatures().length > 0){
                var geom = new ol.geom.Polygon.fromExtent(layerSrc.getExtent());
                ms.zoomTo(geom);
                ms.cancelZoomPromise();
            }
        }, 1);
    };
    
    ms.cancelZoomPromise = function(){
        $interval.cancel(ms.zoomPromise);
        ms.zoomPromise = undefined;
    };
    
    //Interaction to open cluster on click
    ms.addClusterExploder = function(layer){
        var exploder = new ol.interaction.Select({
            layers: [layer],
            style: ms.setUnclusteredStyle,
            condition: function(mapBrowserEvent) {
                return false;
            }
        });

        ms.map.addInteraction(exploder);
    };
    
    //Add VMS segments layer
    ms.createSegmentsLayer = function( config ) {
        var attribution = new ol.Attribution({
            html: locale.getString('spatial.vms_segments_copyright')
        });
        
        var layer = new ol.layer.Vector({
            title: config.title,
            type: config.type,
            longAttribution: config.longAttribution,
            isBaseLayer: false,
            source: new ol.source.Vector({
                attributions: [attribution],
                features: (new ol.format.GeoJSON()).readFeatures(config.geoJson, {
                    dataProjection: 'EPSG:4326',
                    featureProjection: ms.getMapProjectionCode()
                })
            }),
            style: ms.setSegStyle
        });
        
        //ms.calculateJenkinsIntervals(config.geoJson);

        return( layer );
    };
    
    //Clear vms data from layers
    ms.clearVmsLayers = function(){
        var layers = [ms.getLayerByType('vmspos'), ms.getLayerByType('vmsseg')];
        for (var i = 0; i < layers.length; i++){
            if (angular.isDefined(layers[i])){
                layers[i].getSource().clear();
            }
        }
    };
    
    //MAPFISH PRINT
    //Add printing extent layer
    ms.addPrintLayer = function(){
        var layer = new ol.layer.Vector({
            type: 'print',
            isBaseLayer: false,
            source: new ol.source.Vector({
                features: []
            }),
            style: ms.setPrintStyle
        });

        ms.map.addLayer(layer);
    };
    
    ms.mapPrintResolution = undefined;
    ms.addPrintExtent = function(){
        ms.mapPrintResolution = ms.map.getView().getResolution();
        
        var mapSize = ms.map.getSize();
        var currentMapRatio = mapSize[0] / mapSize[1];
        var scaleFactor = 0.9;
        var desiredPrintRatio = MapFish.printMapSize[0] / MapFish.printMapSize[1];
        
        var targetWidth, targetHeight;
        if (desiredPrintRatio >= currentMapRatio){
            targetWidth = mapSize[0] * scaleFactor;
            targetHeight = targetWidth / desiredPrintRatio;
        } else {
            targetHeight = mapSize[1] * scaleFactor;
            targetWidth = targetHeight * desiredPrintRatio;
        }
        
        var geomExtent = ms.map.getView().calculateExtent([targetWidth, targetHeight]);
        var printFeature = new ol.Feature(ol.geom.Polygon.fromExtent(geomExtent)); //FIXME - probably it is a good idea to store the feature in the model
        
        var layer = ms.getLayerByType('print').getSource();
        layer.clear(true);
        layer.addFeature(printFeature);
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
    //Print style
    ms.setPrintStyle = function(feature){
        var style = new ol.style.Style({
            stroke: new ol.style.Stroke({
                width: 2,
                color: 'rgba(136, 136, 136, 1)'
            }),
            fill: new ol.style.Fill({
                color: 'rgba(255, 255, 255, 0.3)'
            })
        });
        
        return [style];
    };
    
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
            var width = 6;
            if (angular.isDefined(ms.styles.segments.style.lineWidth)){
                width = parseInt(ms.styles.segments.style.lineWidth) + 6;
            }
            
            style = new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: color,
                    width: width
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
                    color: 'rgba(120, 120, 120, 1)'
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
        segments: undefined
    };
    
    
    var sortIntervals = function(a,b){
        return (a[0] < b[0]) ? -1 : 1;
    };
    
    //Build breaks object for range classification on VMS data
    ms.calculateBreaks = function(type, style){
        var breaks = {
            defaultColor: undefined,
            intervals: []
        };
        
        angular.forEach(style, function(value, key){
            var gapNum = key.split('-');
            var tempBreak = [];
            for (var i = 0; i < gapNum.length; i++){
                if (gapNum[i] === 'default'){
                    breaks.defaultColor = value;
                } else if (gapNum[i] === 'lineStyle' || gapNum[i] === 'lineWidth'){
                    return;
                } else {
                    tempBreak.push(parseFloat(gapNum[i]));
                }
            }
            if (tempBreak.length > 0){
                breaks.intervals.push(tempBreak);
            }
        });
        
        //Sort intervals
        if (breaks.intervals.length > 0){
            breaks.intervals.sort(function(a,b){
                return (a[0] < b[0]) ? -1 : 1;
            });
        }
        
        if (type === 'positions'){
            ms.styles.positions.breaks = breaks;
        } else {
            ms.styles.segments.breaks = breaks;
        }
    };
    
    //COLORING BY ATTRIBUTES
    //Colors by countryCode
    ms.getColorByFlagState = function(src, fs){
        return src.style[fs.toUpperCase()];
    };
    
    ms.setDisplayedFlagStateCodes = function(type, data){
        var src = ms.styles[type];
        if (!angular.isDefined(src.displayedCodes)){
            src.displayedCodes = [];
        }
        
        angular.forEach(data, function(item){
            if (src.displayedCodes.indexOf(item.properties.countryCode) === -1){
                src.displayedCodes.push(item.properties.countryCode);
            }
        }, src);
    };
    
    //Color by range field
    ms.getColorByRange = function(src, value){
        var intervals = src.breaks.intervals;
        var color;
        for (var i = 0; i < intervals.length; i++){
            if (value >= intervals[i][0] && value < intervals[i][1]){
                color = src.style[intervals[i][0] + '-' + intervals[i][1]];
                break;
            }
        }
        
        if (angular.isDefined(color)){
            return color;
        } else {
            return src.breaks.defaultColor;
        }
    };
    
    //Color by MovementType, ActivityType, SegmentCategory
    ms.getColorByStaticFields = function(src, type){
        if (type === ''){
            return src.style['default'];
        } else {
            return src.style[type];
        }
    };
    
    //Styles methods for positions
    ms.setPositionStylesObj = function(styles){
        ms.styles.positions = styles;
        
        var rangeFields = ['reportedSpeed', 'reportedCourse', 'calculatedSpeed'];
        if (_.indexOf(rangeFields, ms.styles.positions.attribute) !== -1){
            ms.calculateBreaks('positions', ms.styles.positions.style);
        }
    };
    
    ms.getColorForPosition = function(feature){
        switch (ms.styles.positions.attribute) {
            case 'countryCode':
                return ms.getColorByFlagState(ms.styles.positions, feature.get('countryCode'));
            case 'type':
                return ms.getColorByStaticFields(ms.styles.positions, feature.get('movementType'));
            case 'activity':
                return ms.getColorByStaticFields(ms.styles.positions, feature.get('activityType'));
            case 'reportedSpeed':
                return ms.getColorByRange(ms.styles.positions, feature.get('reportedSpeed'));
            case 'reportedCourse':
                return ms.getColorByRange(ms.styles.positions, feature.get('reportedCourse'));
            case 'calculatedSpeed':
                return ms.getColorByRange(ms.styles.positions, feature.get('calculatedSpeed'));
            default:
                return '#0066FF'; //default color
        }
    };
    
    //OL VMS positions cluster style
    ms.clusterStyles = {};
    ms.currentResolution = undefined;
    ms.clusterMaxFeatureCount = 1;
    ms.clusterMinFeatureCount = 100000;
    
    //Calculate necessary max and min amount of features of the available map clusters at each resolution
    ms.calculateClusterInfo = function(){
        var layer = ms.getLayerByType('vmspos');
        var features = layer.getSource().getFeatures();
        
        var feature;
        for (var i = 0; i < features.length; i++){
            feature = features[i];
            var includedPositions = feature.get('features');
            
            feature.set('featNumber', includedPositions.length);
            ms.clusterMaxFeatureCount = Math.max(ms.clusterMaxFeatureCount, includedPositions.length);
            ms.clusterMinFeatureCount = Math.min(ms.clusterMinFeatureCount, includedPositions.length);
        }
    };
    
    //Apply the default style to the cluster
    ms.setClusterStyle = function(feature, resolution){
        if (resolution !== ms.currentResolution || !angular.isDefined(ms.currentResolution)) {
            ms.calculateClusterInfo();
            ms.currentResolution = resolution;
        }
        
        var size = feature.get('features').length;
        var style = ms.clusterStyles[size];
        
        if (size > 1 && !style){
            //Normalize radius to scale between 40 and 10
            var maxRadius = 35;
            var minRadius = 10;
            if (ms.clusterMaxFeatureCount <= 50){
                maxRadius = 15;
                minRadius = 7;
            } else if (ms.clusterMaxFeatureCount > 50 && ms.clusterMaxFeatureCount <= 100){
                maxRadius = 20;
            }
            
            //Normalize radius to scale between maxRadius and minRadius
            var radius = Math.round((maxRadius - minRadius) * (feature.get('featNumber') - ms.clusterMinFeatureCount) / (ms.clusterMaxFeatureCount - ms.clusterMinFeatureCount) + minRadius);
            feature.set('radius', radius);
            
            //Apply cluster style
            style = new ol.style.Style({
                
                image: new ol.style.Circle({
                    radius: radius,
                    stroke: new ol.style.Stroke({
                        color: '#F7580D',
                        width: 2    
                    }),
                    fill: new ol.style.Fill({
                        color: 'rgba(255, 255, 255, 0.7)',
                    })
                }),
                text: new ol.style.Text({
                    text: size.toString(),
                    fill: new ol.style.Fill({
                        color: 'rgb(80, 80, 80)'
                    }),
                    stroke: new ol.style.Stroke({
                        color: 'rgb(80, 80, 80)'
                    })
                })
            });
            ms.clusterStyles[size] = style;
        } else if (size === 1){
            var orignalFeature = feature.get('features')[0];
            style = ms.setPosStyle(orignalFeature);
        }
        
        return [style];
    };
    
    //Set style for positons when cluster is expanded
    ms.setUnclusteredStyle = function(feature){
        var positions = feature.get('features');
        if (positions.length > 1){
            var centerCoords = feature.getGeometry().getCoordinates();
            
            var mapExtent = ms.map.getView().calculateExtent(ms.map.getSize());
            var mapSize = Math.min(ol.extent.getWidth(mapExtent), ol.extent.getHeight(mapExtent));
            
            var radius = mapSize / 10;
            if (positions.length > 20){
                radius = positions.length * radius / 20;
                if (radius > mapSize / 2.5){
                    radius = mapSize / 2.5;
                }
            }
            
            var circle = new ol.geom.Circle(centerCoords, radius);
            var circlePoly = ol.geom.Polygon.fromCircle(circle);
            circlePoly.transform(ms.getMapProjectionCode(), 'EPSG:4326');
            
            var line = turf.linestring(circlePoly.getCoordinates()[0]);
            var length = turf.lineDistance(line, 'radians') / positions.length;
            
            var styles = [];
            for (var i = 0; i < positions.length; i++){
                var pointCoords = ms.pointCoordsToTurf(ol.proj.transform(positions[i].getGeometry().getCoordinates(), ms.getMapProjectionCode(), 'EPSG:4326'));
                var targetPoint = ms.turfToOlGeom(turf.along(line, length * i, 'radians'));
                positions[i].set('spiderCoords', targetPoint.getCoordinates(), true);
                styles.push(ms.setSpiderStyle(positions[i], targetPoint.getCoordinates()));
            }
            
            return _.flatten(styles);
        } else {
            return [ms.setPosStyle(positions[0])];
        }
        
    };
    
    //Build spider style for expanded clusters
    ms.setSpiderStyle = function(feature, pointCoords){
        var pointStyle = new ol.style.Style({
            text: new ol.style.Text({
                text: '\uf124',
                font: 'normal 22px FontAwesome',
                  textBaseline: 'middle',
                  textAlign: 'center',
                  rotation: -0.78 + ms.degToRad(feature.get('reportedCourse')),
                  fill: new ol.style.Fill({
                      color: ms.getColorForPosition(feature)
                  })
            }),
            geometry: function(){
                return new ol.geom.Point(pointCoords);
            }
        });
        
        var lineStyle = new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: 'rgba(120, 120, 120, 0.7)',
                width: 1
            }),
            geometry: function(feature){
                return new ol.geom.LineString([pointCoords, feature.getGeometry().getCoordinates()]);
            }
        });
        
        var centerStyle = new ol.style.Style({
            image: new ol.style.Circle({
                radius: 5,
                fill: new ol.style.Fill({
                    color: 'rgba(255, 255, 255, 0.7)',
                    
                }),
                stroke: new ol.style.Stroke({
                    color: '#F7580D',
                    width: 1
                }),
                geometry: function(feature){
                    return feature.getGeometry();
                }
            })
        });
        
        return [pointStyle, lineStyle, centerStyle];
    };
    
    //OL VMS positions style
    ms.setPosStyle = function(feature){
        var style = new ol.style.Style({
            text: new ol.style.Text({
                text: '\uf124',
                font: 'normal 22px FontAwesome',
                textBaseline: 'middle',
                textAlign: 'center',
                rotation: -0.78 + ms.degToRad(feature.get('reportedCourse')),
                fill: new ol.style.Fill({
                    color: ms.getColorForPosition(feature)
                })
            })
        });
        
        return style;
    };
    
    //Styles methods for segments
    ms.setSegmentStylesObj = function(styles){
        ms.styles.segments = styles;
        
        var rangeFields = ['speedOverGround', 'distance', 'courseOverGround'];
        if (_.indexOf(rangeFields, ms.styles.segments.attribute) !== -1){
            ms.calculateBreaks('segments', ms.styles.segments.style);
        }
    };
    
    ms.getColorForSegment = function(feature){
        switch (ms.styles.segments.attribute) {
            case 'countryCode':
                return ms.getColorByFlagState(ms.styles.segments, feature.get('countryCode'));
            case 'segmentCategory':
                return ms.getColorByStaticFields(ms.styles.segments, feature.get('segmentCategory'));
            case 'speedOverGround':
                return ms.getColorByRange(ms.styles.segments, feature.get('speedOverGround'));
            case 'distance':
                return ms.getColorByRange(ms.styles.segments, feature.get('distance'));
            case 'courseOverGround':
                return ms.getColorByRange(ms.styles.segments, feature.get('courseOverGround'));
            default:
                return '#0066FF'; //default color
        }
    };
    
//    ms.calculateJenkinsIntervals = function(geoJson){
//        var breaks = turf.jenks(geoJson, 'speedOverGround', 4);
//        if (breaks !== null){
//            ms.styles.speedBreaks = breaks;
//            ms.styles.speedBreaks[4] = ms.styles.speedBreaks[4] + 1;
//        }
//    };
//    
//    ms.getColorBySpeed = function(speed){
//        for (var i = 1; i < ms.styles.speedBreaks.length; i++){
//            if (speed >= ms.styles.speedBreaks[i-1] && speed < ms.styles.speedBreaks[i]){
//                var segStyleKey = Object.keys(ms.styles.segments)[i-1];
//                return ms.styles.segments[segStyleKey];
//            }
//        }
//    };
    
    //OL VMS segments style
    ms.setSegStyle = function(feature, resolution){
        var geometry = feature.getGeometry();
        var color = ms.getColorForSegment(feature);
        
        var width = 2;
        if (angular.isDefined(ms.styles.segments.style.lineWidth)){
            width = parseInt(ms.styles.segments.style.lineWidth);
        }
        
        var lineDash = null;
        if (angular.isDefined(ms.styles.segments.style.lineStyle)){
            switch (ms.styles.segments.style.lineStyle) {
                case 'dashed':
                    lineDash = [width * 2, width * 2];
                    break;
                case 'dotted':
                    lineDash = [0.1, width * 2];
                    break;
                case 'dotdashed':
                    lineDash = [width * 2, 0.1, width * 2];
                    break;
                default:
                    lineDash = null;
                    break;
            }
        }
        
        var fontSize = 10;
        if (width > 2){
            fontSize = Math.round((width - 2) * 2.5 + 10);
        }

        var style = [
            new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: 'white',
                    width: width + 2,
                    lineDash: lineDash
                })
            }),
            new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: color,
                    width: width,
                    lineDash: lineDash
                })
            }),
            new ol.style.Style({
                geometry: new ol.geom.Point(ms.getMiddlePoint(geometry)),
                text: new ol.style.Text({
                    text: '\uf054',
                    font: 'bold ' + fontSize + 'px FontAwesome',
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
	    var layers = [ms.getLayerByType('highlight'), ms.getLayerByType('vmspos'), ms.getLayerByType('vmsseg')];
        for (var i = 0; i < layers.length; i++){
            if (angular.isDefined(layers[i])){
                ms.map.removeLayer(layers[i]);
            }
        }
	    
	    //Clear the cluster styles applied to vms positions
	    ms.clusterStyles = {};
	    ms.currentResolution = undefined;
	    ms.clusterMaxFeatureCount = 1;
	    ms.clusterMinFeatureCount = 100000;
	    var selectInteraction = ms.getInteractionsByType('Select')[0];
	    if (angular.isDefined(selectInteraction)){
	        ms.map.removeInteraction(selectInteraction);
	    }
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
    
    ms.updateMapContainerSize = function(evt) {
    	
    	setTimeout(function() {
	        var w = angular.element(window);
	        
	        if(evt && (angular.element('.mapPanelContainer.fullscreen').length > 0 ||
	        		(angular.element('.mapPanelContainer.fullscreen').length === 0 && evt.type.toUpperCase().indexOf("FULLSCREENCHANGE") !== -1))){
	        	
	        	
	    		$('.map-container').css('height', w.height() - parseInt($('.map-bottom').css('height')) + 'px');
	    		$('.layer-panel').css('height', w.height() - parseInt($('#map-toolbar').css('height')) + 'px');
	            $('#map').css('height', w.height() - parseInt($('#map-toolbar').css('height')) - parseInt($('.map-bottom').css('height')) + 'px');
	            ms.updateMapSize();
	      	  return;
	        }
	        
	        var offset = 120;
	        var minHeight = 340;
	        var footerHeight = angular.element('footer')[0].offsetHeight;
	        var headerHeight = angular.element('header')[0].offsetHeight;
	        var newHeight = w.height() - headerHeight - footerHeight - offset;
	        
	        if (newHeight < minHeight) {
	            newHeight = minHeight;
	        }
	        
	        $('.map-container').css('height', newHeight);
	        $('.layer-panel').css('height', newHeight);
	
	        var mapToolbarHeight = parseInt($('#map-toolbar').css('height'));
	        if(mapToolbarHeight > 31){
	        	$('#map').css('height', newHeight - (mapToolbarHeight - 31) - parseInt($('.map-bottom').css('height')) + 'px');
	        }else{
	        	$('#map').css('height', newHeight - parseInt($('.map-bottom').css('height')) + 'px');
	        }
	        
	        ms.updateMapSize();
        }, 100);
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
	ms.setProjection = function(proj){
	    var ext = proj.extent.split(';');
        var projection = new ol.proj.Projection({
            code: 'EPSG:' + proj.epsgCode,
            units: proj.units,
            axisOrientation: proj.axis,
            global: proj.global,
            extent: [parseFloat(ext[0]), parseFloat(ext[1]), parseFloat(ext[2]), parseFloat(ext[3])]
        });

        return projection;
	};

	//Set map controls
	ms.addedControls = []; //quick reference to added controls
	ms.setControls = function(controls){
	    for (var i = 0; i < controls.length; i++){
	        var ctrl = controls[i];
	        ms.addedControls.push(ctrl.type);
	        var fnName = 'add' + ctrl.type.charAt(0).toUpperCase() + ctrl.type.slice(1);
	        ms[fnName](ctrl, true);
	    }

	    //Always add attribution control
	    ms.controls.push(new ol.control.Attribution({
	        collapsible: false,
	        collapsed: false
	    }));

	    return [new ol.Collection(ms.controls), new ol.Collection(ms.interactions)];
	};
	
	//Update map controls according to configuration from server
	ms.updateMapControls = function(controls){
	    var tempControls = [];
	    var mousecoordsCtrl, scaleCtrl;
	    
	    angular.forEach(controls, function(ctrl){
	        tempControls.push(ctrl.type);
	        if (ctrl.type === 'mousecoords'){
	            mousecoordsCtrl = ctrl;
	        } else if (ctrl.type === 'scale'){
	            scaleCtrl = ctrl;
	        }
	    });
	    
	    var ctrlsToRemove = _.difference(ms.addedControls, tempControls);
	    var ctrlsToAdd = _.difference(tempControls, ms.addedControls);
	    var ctrlsToUpdate = _.intersection(ms.addedControls, tempControls);
	    
	    //Remove controls and interactions
	    if (ctrlsToRemove.length > 0){
	        angular.forEach(ctrlsToRemove, function(ctrl){
	            var fnName = 'remove' + ctrl.charAt(0).toUpperCase() + ctrl.slice(1);
	            ms[fnName]();
	        }, ms);
	    }
	    
	    //Update controls
	    if (ctrlsToUpdate.length > 0){
	        angular.forEach(ctrlsToUpdate, function(ctrl){
	            var config;
	            if (ctrl === 'mousecoords'){
	                config = mousecoordsCtrl;
	            } else if (ctrl === 'scale'){
	                config = scaleCtrl;
	            }
	            
	            if (angular.isDefined(config)){
	                var fnName = 'update' + ctrl.charAt(0).toUpperCase() + ctrl.slice(1);
	                ms[fnName](config);
	            }
	        }, ms);
	    }
	    
	    //Add controls
	    if (ctrlsToAdd.length > 0){
	        angular.forEach(ctrlsToAdd, function(ctrl){
	            var config;
                if (ctrl === 'mousecoords'){
                    config = mousecoordsCtrl;
                } else if (ctrl === 'scale'){
                    config = scaleCtrl;
                }
                
                var fnName = 'add' + ctrl.charAt(0).toUpperCase() + ctrl.slice(1);
                ms[fnName](config, false);
	        }, ms);
	    }
	    
	    ms.addedControls = _.union(ctrlsToAdd, ctrlsToUpdate);
	};
	
	//Get array of controls by type
	ms.getControlsByType = function(type){
	    var controls = ms.map.getControls().getArray();
	    var ctrls = controls.filter(function(ctrl){
	        return ctrl instanceof ol.control[type] === true;
	    });
	    
	    return ctrls;
	};
	
	//Get array of interactions by type
    ms.getInteractionsByType = function(type){
        var interactions = ms.map.getInteractions().getArray();
        var ints = interactions.filter(function(int){
            return int instanceof ol.interaction[type] === true;
        });
        
        return ints;
    };
    
    //Get custom interactions by type
    ms.getCustomInteraction = function(olType, type){
        var interactions = ms.map.getInteractions().getArray();
        var ints = interactions.filter(function(int){
            return int instanceof ol.interaction[olType] === true && int instanceof ms[type];
        });
        
        return ints;
    };

	//Add map controls
	ms.addZoom = function(ctrl, initial){
        var olCtrl = new ol.control.Zoom({
            zoomInTipLabel: locale.getString('spatial.map_tip_zoomin'),
            zoomOutTipLabel: locale.getString('spatial.map_tip_zoomout')
        });
        
        var mouseWheel =  new ol.interaction.MouseWheelZoom();
        var keyboardZoom = new ol.interaction.KeyboardZoom();
        var dblClickZoom = new ol.interaction.DoubleClickZoom();
        var dragZoom = new ol.interaction.DragZoom();
        
        if (initial){
            ms.controls.push(olCtrl);
            ms.interactions.push(mouseWheel);
            ms.interactions.push(keyboardZoom);
            ms.interactions.push(dblClickZoom);
            ms.interactions.push(dragZoom);
        } else {
            ms.map.addControl(olCtrl);
            ms.map.addInteraction(mouseWheel);
            ms.map.addInteraction(keyboardZoom);
            ms.map.addInteraction(dblClickZoom);
            ms.map.addInteraction(dragZoom);
        }
	};
	
	ms.removeZoom = function(){
	    ms.map.removeControl(ms.getControlsByType('Zoom')[0]);
	    ms.map.removeInteraction(ms.getInteractionsByType('MouseWheelZoom')[0]);
	    ms.map.removeInteraction(ms.getInteractionsByType('KeyboardZoom')[0]);
	    ms.map.removeInteraction(ms.getInteractionsByType('DoubleClickZoom')[0]);
	    ms.map.removeInteraction(ms.getInteractionsByType('DragZoom')[0]);
	};

	ms.addHistory = function(ctrl, initial){
        var olCtrl = new ol.control.HistoryControl({
            backLabel: locale.getString('spatial.map_tip_go_back'),
            forwardLabel: locale.getString('spatial.map_tip_go_forward')
        });
        
        if (initial){
            ms.controls.push(olCtrl);
        } else {
            ms.map.addControl(olCtrl);
        }
    };
    
    ms.removeHistory = function(){
        ms.map.removeControl(ms.getControlsByType('HistoryControl')[0]);
    };

	ms.addScale = function(ctrl, initial){
	    var olCtrl = new ol.control.ScaleLine({
            units: ctrl.units,
            target: angular.element('#map-scale')[0],
            className: 'ol-scale-line'
        });
	    
	    if (initial){
	        ms.controls.push(olCtrl);
	    } else {
	        ms.map.addControl(olCtrl);
	    }
	    
	};
	
	ms.updateScale = function(config){
	    ms.map.removeControl(ms.getControlsByType('ScaleLine')[0]);
        ms.addScale(config, false);
	};
	
	ms.removeScale = function(){
	    ms.map.removeControl(ms.getControlsByType('ScaleLine')[0]);
	};

	ms.addDrag = function(ctrl, initial){
	    var dragPan = new ol.interaction.DragPan();
	    var keyboardPan = new ol.interaction.KeyboardPan();
	    if (initial){
	        ms.interactions.push(dragPan);
	        ms.interactions.push(keyboardPan);
	    } else {
	        ms.map.addInteraction(dragPan);
	        ms.map.addInteraction(keyboardPan);
	    }
	    
	};
	
	ms.removeDrag = function(){
	    ms.map.removeInteraction(ms.getInteractionsByType('DragPan')[0]);
	    ms.map.removeInteraction(ms.getInteractionsByType('KeyboardPan')[0]);
	};

	ms.addMousecoords = function(ctrl, initial){
	    var olCtrl =  new ol.control.MousePosition({
            projection: 'EPSG:' + ctrl.epsgCode,
            coordinateFormat: function(coord){
                return ms.formatCoords(coord, ctrl);
            },
            target: angular.element('#map-coordinates')[0],
            className: 'mouse-position'
        });
	    
	    if (initial){
	        ms.controls.push(olCtrl);
	    } else {
	        ms.map.addControl(olCtrl);
	    }
    };
    
    ms.updateMousecoords = function (config){
        ms.map.removeControl(ms.getControlsByType('MousePosition')[0]);
        ms.addMousecoords(config, false);
    };
    
    ms.removeMousecoords = function(){
        ms.map.removeControl(ms.getControlsByType('MousePosition')[0]);
    };

	//Zoom to geometry control
	ms.zoomTo = function(geom){
	    ms.map.getView().fit(geom, ms.map.getSize(), {maxZoom: 19});
	};

	//Pan to coordinates control
	ms.panTo = function(coords){
	    ms.map.getView().setCenter(coords);
	};
	
	//Add Print drag interaction
	ms.addDragPrintExtent = function(){
	    var ctrl = new ms.dragExtent();
	    ms.map.addInteraction(ctrl);
	};
	
	//Custum drag interaction for print extent
	ms.dragExtent = function(){
	    ol.interaction.Pointer.call(this, {
	        handleDownEvent: ms.dragExtent.prototype.handleDownEvent,
	        handleDragEvent: ms.dragExtent.prototype.handleDragEvent,
	        handleMoveEvent: ms.dragExtent.prototype.handleMoveEvent,
	        handleUpEvent: ms.dragExtent.prototype.handleUpEvent
	    });
	    
	    this._coordinate = null;
	    this._feature = null;
	    this._cursor = 'pointer';
	    this._previousCursor = undefined;
	};
	ol.inherits(ms.dragExtent, ol.interaction.Pointer);
	
	ms.dragExtent.prototype.handleDownEvent = function(evt){
	    var map = evt.map;
	    var feature = map.forEachFeatureAtPixel(evt.pixel, function(feature, layer){
	        if (layer !== null){
                return feature;
            }
            return false;
	    }, this, function(layer){
	        return layer.get('type') === 'print';
	    });
	    
	    if (feature){
	        this._coordinate = evt.coordinate;
	        this._feature = feature;
	    }
	    
	    return !!feature;
	};
	
	ms.dragExtent.prototype.handleDragEvent = function(evt){
	    var deltaX = evt.coordinate[0] - this._coordinate[0];
        var deltaY = evt.coordinate[1] - this._coordinate[1];

        var geometry = (this._feature.getGeometry());
        geometry.translate(deltaX, deltaY);

        this._coordinate[0] = evt.coordinate[0];
        this._coordinate[1] = evt.coordinate[1];
	};
	
	ms.dragExtent.prototype.handleMoveEvent = function(evt){
	    if (this._cursor) {
	        var map = evt.map;
	        var feature = map.forEachFeatureAtPixel(evt.pixel, function(feature, layer){
	            if (layer !== null){
	                return feature;
	            }
	            return false;
	        }, this, function(layer){
	            return layer.get('type') === 'print';
	        });
            var element = evt.map.getTargetElement();
            if (feature) {
                if (element.style.cursor !== this._cursor) {
                    this._previousCursor = element.style.cursor;
                    element.style.cursor = this._cursor;
                }
            } else if (this._previousCursor !== undefined) {
                element.style.cursor = this._previousCursor;
                this._previousCursor = undefined;
            }
        }
	};
	
	ms.dragExtent.prototype.handleUpEvent = function(evt){
	    this._coordinate = null;
        this._feature = null;
        return false;
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
            condition: ol.events.condition.noModifierKeys,
            freehandCondition: ol.events.condition.never,
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
            if(angular.isDefined(ms.sp.measure.speed) && angular.isDefined(ms.sp.measure.startDate) && ms.sp.measure.speed !== null && ms.sp.measure.speed > 0){
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
                    ms.measureETA = moment.utc(ms.sp.measure.startDate, 'YYYY-MM-DD HH:mm:ss Z');
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
    	        response.eta = ms.measureETA.format(globalSettingsService.getDateFormat());
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
            console.log('error fetching template');
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
    
    //VECTOR LABELS
    //label visibility settings object
    ms.labelVisibility = {
        positions: ['fs', 'extMark', 'ircs', 'cfr', 'name', 'posTime', 'lat', 'lon', 'stat', 'm_spd', 'c_spd', 'crs', 'msg_tp', 'act_tp', 'source'],
        positionsTitles: true,
        segments: ['fs', 'extMark', 'ircs', 'cfr', 'name', 'dist', 'dur', 'spd', 'crs', 'cat'],
        segmentsTitles: true
    };
    
    ms.setLabelVisibility = function(type, config){
        ms.labelVisibility[type] = config.values;
        ms.labelVisibility[type + 'Titles'] = angular.isDefined(config.isAttributeVisible) ? config.isAttributeVisible : false;
        if (!angular.isDefined(ms.labelVisibility[type])){
            ms.labelVisibility[type] = [];
        }
    };
    
    //Container for displayed label overlays
    ms.vmsposLabels = {
       active: false,
       displayedIds: []
    };
    
    ms.vmssegLabels = {
       active: false
    };
    
    //Function called on map moveend and change:resolution to check for new labels
    ms.checkLabelStatus = function(){
        if (ms.vmsposLabels.active === true){
            ms.activateVectorLabels('vmspos');
        }
        
        if (ms.vmssegLabels.active === true){
            ms.activateVectorLabels('vmsseg');
        }
    };
    
    //Activate Vector Label Overlays
    ms.activateVectorLabels = function(type){
        if ((type === 'vmspos' && ms.labelVisibility.positions.length > 0) || (type === 'vmsseg' && ms.labelVisibility.segments.length > 0)){
            var containerName = type + 'Labels'; 
            ms[containerName].active = true;
            ms[containerName].displayedIds = [];
            
            var layer = ms.getLayerByType(type);
            
            var extent = ms.map.getView().calculateExtent(ms.map.getSize());
            var size = Math.min.apply(Math, ol.extent.getSize(extent));
            //var resolution = ms.map.getView().getResolution();
            
            var src = layer.getSource();
            var overlayId;
            src.forEachFeatureInExtent(extent, function(feature){
                if (type === 'vmspos'){
                    var containedFeatures = feature.get('features');
                    
                    if (containedFeatures.length === 1 ){
                        var feat = containedFeatures[0];
                        overlayId = feat.get('overlayId');
                        if (!angular.isDefined(overlayId)){
                            overlayId = ms.generateOverlayId(ms[containerName]);
                        }
                        ms[containerName].displayedIds.push(overlayId);
                        if (!angular.isDefined(feat.get('overlayHidden'))){
                            ms.addLabelsOverlay(feat, type, overlayId);
                        }
                    }
                } else {
                    var geom = feature.getGeometry();
                    if (geom.getLength() > 0){
                        var featSize = geom.getLength();
                        var ratio = featSize * 100 / size;
                        if (ratio >= 10){
                            overlayId = feature.get('overlayId');
                            if (!angular.isDefined(overlayId)){
                                overlayId = ms.generateOverlayId(ms[containerName]);
                            }
                            ms[containerName].displayedIds.push(overlayId);
                            if (!angular.isDefined(feature.get('overlayHidden'))){
                                ms.addLabelsOverlay(feature, type, overlayId);
                            }
                        }
                    }
                }
            });
            
            //Finally we remove overlays that are no longer visible
            ms.removeLabelsByMapChange(type);
        }
    };
    
    //Remove labels when zooming and panning (mainly to deal with clusters)
    ms.removeLabelsByMapChange = function(type){
        var containerName = type + 'Labels';
        var existingKeys = _.keys(ms[containerName]);
        existingKeys = _.without(existingKeys, 'active', 'displayedIds');
        
        var diff = _.difference(existingKeys, ms[containerName].displayedIds);
        angular.forEach(diff, function(key){
            var hidden = this[key].feature.get('overlayHidden');
            if (angular.isDefined(hidden) && hidden === false){
                ms.map.removeOverlay(this[key].overlay);
                this[key].feature.set('overlayId', undefined);
                this[key].feature.set('overlayHidden', undefined);
                delete this[key];
            }
        }, ms[containerName]);
    };
    
    //Remove all labels when the tool is deactivated
    ms.deactivateVectorLabels = function(type){
        var containerName = type + 'Labels';
        var keys = _.keys(ms[containerName]);
        keys = _.without(keys, 'active', 'displayedIds');        
        
        angular.forEach(keys, function(key) {
            ms.map.removeOverlay(this[key].overlay);
            this[key].feature.set('overlayId', undefined);
            this[key].feature.set('overlayHidden', undefined);
            delete this[key];
        }, ms[containerName]);
        
        ms[containerName].active = false;
    };
    
    ms.addLabelsOverlay = function(feature, type, overlayId){
        var coords;
        if (type === 'vmspos'){
            coords = feature.getGeometry().getCoordinates();    
        } else {
            coords = ms.getMiddlePoint(feature.getGeometry());
        }
        
        var containerName = type + 'Labels';
            
        //HTML DOM
        var labelEl = document.createElement('div');
        labelEl.className = 'col-md-12 vector-label vector-label-' + type;
        
        var toolsEl = document.createElement('div');
        
        var closeBtn = document.createElement('span');
        closeBtn.className = 'fa fa-times close-icon pull-right';
        closeBtn.addEventListener('click', closeLabelOverlay(containerName, overlayId), false);
        
        toolsEl.appendChild(closeBtn);
        labelEl.appendChild(toolsEl);
        
        var contentEl = document.createElement('div');
        contentEl.className = 'col-md-12 label-content';
        labelEl.appendChild(contentEl);
        
        //Mustache
        var data = ms.setLabelObj(feature, type);
        ms.requestLabelTemplate(type, data, contentEl);
        
        var overlay = new ol.Overlay({
            element: labelEl,
            autoPan: false,
            position: coords,
            positioning: 'top-left'
        });
        
        ms.map.addOverlay(overlay);
        ms[containerName][overlayId] = {
            feature: feature,
            overlay: overlay
        };
        feature.set('overlayId', overlayId);
        feature.set('overlayHidden', false);
    };
    
    ms.setLabelObj = function(feature, type, id){
        var titles, srcData, showTitles, i;
        var data = [];
        if (type === 'vmspos'){
            showTitles = ms.labelVisibility.positionsTitles;
            titles = ms.getPositionTitles();
            srcData = ms.formatPositionDataForPopup(feature.getProperties());
            
            for (i = 0; i < ms.labelVisibility.positions.length; i++){
                data.push({
                    title: titles[ms.labelVisibility.positions[i]],
                    value: srcData[ms.labelVisibility.positions[i]]
                });
            }
        } else {
            showTitles = ms.labelVisibility.segmentsTitles;
            titles = ms.getSegmentTitles();
            srcData = ms.formatSegmentDataForPopup(feature.getProperties());
            
            for (i = 0; i < ms.labelVisibility.segments.length; i++){
                data.push({
                    title: titles[ms.labelVisibility.segments[i]],
                    value: srcData[ms.labelVisibility.segments[i]]
                });
            }
        }
        
        if (data.length > 0){
            return {
                id: id,
                data: data,
                includeTitles: showTitles,
                getTitle: function(){
                    return this.title;
                },
                getValue: function(){
                    return this.value;
                }
            };
        }
    };
    
    //Request template and render with Mustache
    ms.requestLabelTemplate = function(type, data, el){
        var templateURL = 'partial/spatial/templates/label.html';
        $templateRequest(templateURL).then(function(template){
            var rendered = Mustache.render(template, data);
            el.innerHTML = rendered;
        }, function(){
            console.log('error getting template');
        });
    };
    
    //Close single label overlay on close btn click evvt
    var closeLabelOverlay = function(container, id){
        return function(e){
            ms.map.removeOverlay(ms[container][id].overlay);
            ms[container][id].feature.set('overlayId', undefined);
            ms[container][id].feature.set('overlayHidden', true);
        };
    };
    
    ms.generateOverlayId = function(container){
        var id = generateGUID();
        
        if (_.has(container, id) === true){
            ms.generateOverlayId(container);
        } else {
            return id;
        }
    };
    
    var generateGUID = function(){
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
              .toString(16)
              .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    };
	
    //POPUPS
	//Render popup info using mustache
    ms.requestPopupTemplate = function(data, coords, fromCluster){
        var templateURL = 'partial/spatial/templates/' + ms.activeLayerType + '.html';
        $templateRequest(templateURL).then(function(template){
            var rendered = Mustache.render(template, data);
            var content = document.getElementById('popup-content');
            content.innerHTML = rendered;
            ms.overlay.setPosition(coords);
            ms.overlay.set('fromCluster', fromCluster, true);
        }, function(){
            console.log('error getting template');
        });
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
	
	//Popup visibility settings object
	ms.popupVisibility = {
	    positions: ['fs', 'extMark', 'ircs', 'cfr', 'name', 'posTime', 'lat', 'lon', 'stat', 'm_spd', 'c_spd', 'crs', 'msg_tp', 'act_tp', 'source'],
	    positionsTitles: true,
	    segments: ['fs', 'extMark', 'ircs', 'cfr', 'name', 'dist', 'dur', 'spd', 'crs', 'cat'],
	    segmentsTitles: true
	};
	
	ms.setPopupVisibility = function(type, config){
	    ms.popupVisibility[type] = config.values;
	    ms.popupVisibility[type + 'Titles'] = angular.isDefined(config.isAttributeVisible) ? config.isAttributeVisible: false;
	    if (!angular.isDefined(ms.popupVisibility[type])){
	        ms.popupVisibility[type] = [];
	    }
	};

	//POPUP - Define the object that will be used in the popup for vms positions
    ms.setPositionsObjPopup = function(feature){
        var titles = ms.getPositionTitles();
        var srcData = ms.formatPositionDataForPopup(feature);
        
        var data = [];
        for (var i = 0; i < ms.popupVisibility.positions.length; i++){
            data.push({
                title: titles[ms.popupVisibility.positions[i]],
                value: srcData[ms.popupVisibility.positions[i]]
            });
        }
        
        return {
            windowTitle: locale.getString('spatial.popup_positions_title'),
            showTitles: ms.popupVisibility.positionsTitles,
            position: data,
            getTitle: function(){
                return this.title;
            },
            getValue: function(){
                return this.value;
            },
            doDisplay: function(){
                if (!angular.isDefined(this.value) || this.value === ''){
                    return false;
                } else {
                    return true;
                }
            }
        };
    };
    
    //Popup attribute names for positions
    ms.getPositionTitles = function(){
        return {
            name: locale.getString('spatial.reports_form_vessels_search_by_vessel'),
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
        };
    };
    
    //Popup data values for positions
    ms.formatPositionDataForPopup = function(data){
        var coords = data.geometry.getCoordinates();
        var repCoords = ol.proj.transform(coords, ms.getMapProjectionCode(), 'EPSG:4326');
        
        return {
            name: data.name,
            fs: data.countryCode,
            extMark: data.externalMarking,
            ircs: data.ircs,
            cfr: data.cfr,
            posTime: unitConversionService.date.convertToUserFormat(data.positionTime),
            lon: coordinateFormatService.formatAccordingToUserSettings(repCoords[0]),
            lat: coordinateFormatService.formatAccordingToUserSettings(repCoords[1]),
            stat: data.status,
            m_spd: unitConversionService.speed.formatSpeed(data.reportedSpeed, 5),
            c_spd: unitConversionService.speed.formatSpeed(data.calculatedSpeed, 5),
            crs: data.reportedCourse + '\u00b0',
            msg_tp: data.movementType,
            act_tp: data.activityType,
            source: data.source
        };
    };
    
    //POPUP - vms segments
    ms.popupSegRecContainer = {
        records: [],
        currentIdx: undefined,
        reset: function(){
            this.records = [];
            this.currentidx = undefined;
        }
    };
    
    //Define the object that will be used in the popup for vms segments
    ms.setSegmentsObjPopup = function(feature){
        var titles = ms.getSegmentTitles();
        var srcData = ms.formatSegmentDataForPopup(feature);
        
        var data = [];
        for (var i = 0; i < ms.popupVisibility.segments.length; i++){
            data.push({
                title: titles[ms.popupVisibility.segments[i]],
                value: srcData[ms.popupVisibility.segments[i]]
            });
        }
        
        return {
            windowTitle: locale.getString('spatial.popup_segments_title'),
            showTitles: ms.popupVisibility.segmentsTitles,
            segment: data,
            getTitle: function(){
                return this.title;
            },
            getValue: function(){
                return this.value;
            },
            doDisplay: function(){
                if (!angular.isDefined(this.value) || this.value === ''){
                    return false;
                } else {
                    return true;
                }
            }
        };
    };
    
    //Popup attribute names for segments
    ms.getSegmentTitles = function(){
        return {
            name: locale.getString('spatial.reports_form_vessels_search_by_vessel'),
            fs: locale.getString('spatial.reports_form_vessel_search_table_header_flag_state'),
            extMark: locale.getString('spatial.reports_form_vessel_search_table_header_external_marking'),
            ircs: locale.getString('spatial.reports_form_vessel_search_table_header_ircs'),
            cfr: locale.getString('spatial.reports_form_vessel_search_table_header_cfr'),
            dist: locale.getString('spatial.tab_vms_seg_table_header_distance'),
            dur: locale.getString('spatial.tab_vms_seg_table_header_duration'),
            spd: locale.getString('spatial.tab_vms_seg_table_header_speed_ground'),
            crs: locale.getString('spatial.tab_vms_seg_table_header_course_ground'),
            cat: locale.getString('spatial.tab_vms_seg_table_header_category')
        };
    };
    
    //Popup data values for segments
    ms.formatSegmentDataForPopup = function(data){
        return {
            name: data.name,
            fs: data.countryCode,
            extMark: data.externalMarking,
            ircs: data.ircs,
            cfr: data.cfr,
            dist: unitConversionService.distance.formatDistance(data.distance, 5),
            dur: unitConversionService.duration.timeToHuman(data.duration),
            spd: unitConversionService.speed.formatSpeed(data.speedOverGround, 5),
            crs: data.courseOverGround + '\u00b0',
            cat: data.segmentCategory
        };
    };

	return ms;
});
