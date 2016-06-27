/**
 * @memberof unionvmsWeb
 * @ngdoc service
 * @name genericMapService
 * @param $localStorage {service} angular local storage service
 * @param $location {service} angular location service
 * @param $window {service} angular window service
 * @param locale {service} angular locale service
 * @param spatialRestService {service} Spatial REST API service
 * @attr {Object} mapBasicConfigs - A property object that will contain basic map configurations (not used in the liveview map)
 * @description
 *  Service for map generic functions that can be used in all maps throughout the application
 */

angular.module('unionvmsWeb').factory('genericMapService',function($localStorage, $location, $window, locale, spatialRestService, projectionService) {
    /**
     * Gets the base projection of the map
     * 
     * @memberof genericMapService
     * @public
     * @param {ol.Map} map - The input OL map
     * @returns {String} Map base projection code  (e.g. 'EPSG:4326')
     */
    var getMapProjectionCode = function(map){
        return map.getView().getProjection().getCode();
    };
    
    /**
     * Force a recalculation of the map viewport size
     * 
     * @memberof genericMapService
     * @public
     * @param {ol.Map} map - The input OL map
     */
    var updateMapSize = function(map){
        if (!map) {
            return;
        }
        map.updateSize();
    };
    
    /**
     * Calculates the numeric scale of the current view of the map
     * 
     * @memberof genericMapService
     * @public
     * @param {ol.Map} map - The input OL map
     * @returns {Number} The numerical scale
     */
    var getCurrentScale = function(map){
        var view = map.getView();
        var res = view.getResolution();
        var units = view.getProjection().getUnits();
        var dpi = 25.4 / 0.28;
        var mpu = ol.proj.METERS_PER_UNIT[units];
        
        return res * mpu * 39.37 * dpi;
    };
    
    /**
     * Get the first layer with the specified title
     * 
     * @memberof genericMapService
     * @public
     * @param {String} title - The title of the layer to find
     * @param {ol.Map} map - The input OL map
     * @returns {ol.layer} The OL layer
     */
    var getLayerByTitle = function(title, map){
        var layers = map.getLayers().getArray();
        var layer = layers.filter(function(layer){
            return layer.get('title') === title;
        });

        return layer[0];
    };

    /**
     * Get the first layer with the specified type
     * 
     * @memberof genericMapService
     * @public
     * @param {String} type - The type of the layer to find
     * @param {ol.Map} map - The input OL map
     * @returns {ol.layer} The OL layer
     */
    var getLayerByType = function(type, map){
        var layers = map.getLayers().getArray();
        var layer = layers.filter(function(layer){
            return layer.get('type') === type;
        });

        return layer[0];
    };
    
    /**
     * Get list of controls by type
     *
     * @memberof genericMapService
     * @public
     * @param {String} type - The type of the controls to find
     * @param {ol.Map} map - The input OL map
     * @returns {Array<ol.control>} The list of controls
     */
    var getControlsByType = function(type, map){
        var controls = map.getControls().getArray();
        var ctrls = controls.filter(function(ctrl){
            return ctrl instanceof ol.control[type] === true;
        });
        
        return ctrls;
    };
    
    /**
     * Get list of interactions by type
     *
     * @memberof genericMapService
     * @public
     * @param {String} type - The type of the interactions to find
     * @param {ol.Map} map - The input OL map
     * @returns {Array<ol.interaction>} The list of interactions
     */
    var getInteractionsByType = function(type, map){
        var interactions = map.getInteractions().getArray();
        var ints = interactions.filter(function(int){
            return int instanceof ol.interaction[type] === true;
        });
        
        return ints;
    };
    
    /**
     * Define map projections
     * 
     * @memberof genericMapService
     * @public
     * @param {Object} proj - The definition of the projection
     * @returns {ol.prol.Projection} The OL projection
     */
    var setProjection = function(proj){
        var ext = proj.extent.split(';');
        var projection = new ol.proj.Projection({
            code: 'EPSG:' + proj.epsgCode,
            units: proj.units,
            axisOrientation: proj.axis,
            global: proj.global,
            extent: [parseFloat(ext[0]), parseFloat(ext[1]), parseFloat(ext[2]), parseFloat(ext[3])],
            worldExtent: [-180, -89.99, 180, 89.99]
        });

        return projection;
    };
    
    /**
     * Remove all layers from the map
     * 
     * @memberof genericMapService
     * @public
     * @param {ol.Map} map - The OL map
     */
    var removeAllLayers = function(map){
        var layers = map.getLayers();
        if (layers.getLength() > 0){
            layers.clear();
        }
    };
    
    /**
     * Remove layer from map by type
     * 
     * @memberof genericMapService
     * @public
     * @param {String} type - The layer type
     * @param {ol.Map} map - The OL map
     */
    var removeLayerByType = function(type, map){
        var layer = this.getLayerByType(type, map);
        if (angular.isDefined(layer)){
            map.removeLayer(layer);
        }
    };
    
    /**
     * Define OpenStreetMap layer
     * 
     * @memberof genericMapService
     * @public
     * @param {Object} [config={}] - Configurations for the layer
     * @returns {ol.layer.Tile} The OSM layer
     */
    var defineOsm = function(config){
        if (!angular.isDefined(config)){
            config = {};
        }
        
        var layer = new ol.layer.Tile({
            type: config.type ? config.type : 'osm',
            title: config.title ? config.title : null,
            isBaseLayer: config.isBaseLayer ? config.isBaseLayer : null,
            source: new ol.source.OSM()
        }); 
        
        return layer;
    };
    
    /**
     * Define OpenSeaMap layer
     * 
     * @memberof genericMapService
     * @public
     * @param {Object} [config={}] - The layer configuration object
     * @returns {ol.layer.Tile} The OpenSeaMap layer
     */
    var defineOseam = function(config){
        if (!angular.isDefined(config)){
            config = {};
        }
        
        var layer = new ol.layer.Tile({
            type: config.type ? config.type : 'osea',
            title: config.title ? config.title: null,
            isBaseLayer: config.isBaseLayer ? config.isBaseLayer : null,
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
        
        return layer;
    };
    
    /**
     * Define BING layers
     * 
     * @memberof genericMapService
     * @public
     * @param {Object} config - The layer configuration object
     * @returns {ol.layer.Tile} The BING layer
     */
    var defineBing = function(config){
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
        
        return layer;
    };
    
    /**
     * Custom tile load function to include USM jwt header in the requests
     * 
     * @memberof genericMapService
     * @private
     * @param {ol.Tile} imageTile - imageTile object provided by OL
     * @param {String} src - Src URL string object provided by OL
     */
    var customTileLoaderFunction = function(imageTile, src){
        var xhr = new XMLHttpRequest();
        xhr.open('GET', src, true);
        xhr.withCredentials = true;
        xhr.setRequestHeader('Authorization', $localStorage.token);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function(){
            var img = imageTile.getImage();
            if (typeof window.btoa === 'function'){
                if (this.status === 200){
                    var uInt8Array = new Uint8Array(this.response);
                    var i = uInt8Array.length;
                    var binaryString = new Array(i);
                    while (i--){
                        binaryString[i] = String.fromCharCode(uInt8Array[i]);
                    }
                    var data = binaryString.join('');
                    var type = xhr.getResponseHeader('content-type');
                    if (type.indexOf('image') === 0) {
                        img.src = 'data:' + type + ';base64,' + window.btoa(data);
                    }
                }
            } else {
                img.src = src;
            }
        };
        xhr.send();
    };
    
    
    /**
     * Compares a URL with the current application URL
     * @memberof genericMapService
     * @private
     * @param {String} baseUrl - A URL string to compare
     * @returns {Boolean} If URL matches the app URL then true is returned
     */
    var compareUrlWithLocation = function(baseUrl){
        var isEqual = true;
        var parser = document.createElement('a');
        parser.href = baseUrl;
        
        if (parser.protocol !== $location.protocol() || parser.hostname !== $location.host() || parser.port !== $location.port()){
            isEqual = false;
        }
        
        return isEqual;
    };
    
    /**
     * Build the configuration object for WMS base layers
     * 
     * @memberof genericMapService
     * @public
     * @param {Object} def - The initial layer definition object
     * @param {ol.Map} map - The OL map
     * @returns {Object} The final layer configuration object
     */
    var getBaseLayerConfig = function(def, map){
        var mapExtent = map.getView().getProjection().getExtent();
        var style = null;
        if (angular.isDefined(def.styles)){
            angular.forEach(def.styles, function(sldName, styleName) {
                if (styleName === 'labelGeom'){
                    style = sldName;
                } else if (styleName === 'geom' && style === null){
                    style = sldName;
                }
            });
        }
        
        var serverType;
        if (angular.isDefined(def.serverType)){
            serverType = def.serverType;
        }
        
        var config = {
            title: def.title,
            type: def.type,
            url: def.url,
            serverType: serverType,
            params: {
                time_: (new Date()).getTime(),
                'LAYERS': def.layerGeoName,
                'TILED': true,
                'TILESORIGIN': mapExtent[0] + ',' + mapExtent[1],
                'STYLES': style
            }   
        };
        
        return config;
    };
    
    /**
     * Build the configuration object for WMS overlay layers
     * 
     * @memberof genericMapService
     * @public
     * @param {Object} def - The initial layer definition object
     * @param {ol.Map} map - The OL map
     * @returns {Object} The final layer configuration object
     */
    var getGenericLayerConfig = function(def, map){
        var mapExtent = map.getView().getProjection().getExtent();
        var config = {
            type: def.typeName,
            url: def.serviceUrl,
            serverType: 'geoserver',
            params: {
                time_: (new Date()).getTime(),
                'LAYERS': def.geoName,
                'TILED': true,
                'TILESORIGIN': mapExtent[0] + ',' + mapExtent[1],
                'STYLES': def.style,
                'cql_filter': angular.isDefined(def.cql) ? def.cql : null
            }   
        };
        
        return config;
    };
    
    /**
     * Define WMS layer
     * 
     * @memberof genericMapService
     * @public
     * @param {Object} config - Configurations for the WMS layer
     * @returns {ol.layer.Tile} The WMS layer
     */
    var defineWms = function(config){
        var source, layer, attribution, isCrossOrigin,
            isInternal = false;
        
        if (angular.isDefined(config.attribution)){
            attribution = new ol.Attribution({
               html: config.attribution 
            });
        }
        
        if (angular.isDefined(config.serverType) && config.serverType === 'geoserver'){
            isInternal = true;
        }
        
        if (!compareUrlWithLocation(config.url) && isInternal){
            isCrossOrigin = 'anonymous';
        }
        
        source = new ol.source.TileWMS({
            attributions: angular.isDefined(attribution) ? [attribution] : undefined,
            url: config.url,
            serverType: isInternal ? config.serverType : undefined,
            params: config.params,
            crossOrigin: isCrossOrigin
        });
        
        if (isInternal){
            source.setTileLoadFunction(customTileLoaderFunction);
        }
        
        layer = new ol.layer.Tile({
            title: config.title,
            isInternal: isInternal,
            type: angular.isDefined(config.type) ? config.type : 'WMS',
            longAttribution: angular.isDefined(config.longAttribution) ? config.longAttribution : undefined,
            isBaseLayer: angular.isDefined(config.isBaseLayer) ? config.isBaseLayer : undefined,
            source: source
        });
        
        return layer;
    };
    
    /**
     * Refresh WMS layer in the map
     * 
     * @memberof genericMapService
     * @public
     * @param {String} type - The layer type
     * @param {ol.Map} map - The OL map
     */
    var refreshWMSLayer = function(type, map){
        var layer = this.getLayerByType(type, map);
        if (angular.isDefined(layer)){
            layer.getSource().updateParams({time_: (new Date()).getTime()});
        }
    };
    
    /**
     * Get basic map configurations stored in USM (to use in all maps except liveview) and stores them in mapBasicConfigs property object
     * 
     * @memberof genericMapService
     * @public
     */
    var setMapBasicConfigs = function(){
        var self = this;
        self.mapBasicConfigs = {};
        spatialRestService.getBasicMapConfigurations().then(function(response){
            self.mapBasicConfigs = response.map;
            self.mapBasicConfigs.success = true;
        }, function(error){
            self.mapBasicConfigs = {success: false};
        });
    };
    
    /**
     * Create a OL map view from config object
     * 
     * @memberof genericMapService
     * @public
     * @param {Object} config - The map configuration object
     * @returms {ol.View} The OL map view 
     */
    var createView = function(config){
        var center = ol.proj.transform([-1.81185, 52.44314], 'EPSG:4326', 'EPSG:' + config.epsgCode);
        var view = new ol.View({
            projection: this.setProjection(config),
            center: center,
            //extent: [-2734750,3305132,1347335,5935055],
            //loadTilesWhileInteracting: true,
            zoom: 3,
            maxZoom: 19,
            //minZoom: 3,
            enableRotation: false
        });
        
        return view;
    };
    
    /**
     * Updates a map view using a new configuration object
     * 
     * @memberof genericMapService
     * @public
     * @param {Object} config - The map configuration object
     * @param {ol.Map} map - The OL map
     */
    var updateMapView = function(config, map){
        var view = this.createView(config);
        map.setView(view);
    };
    
    /**
     * Create OL Zoom control
     * 
     * @memberof genericMapService
     * @public
     * @returns {ol.control.Zoom} The OL Zoom control
     */
    
    var createZoomCtrl = function(customClass){
        var ctrl = new ol.control.Zoom({
            className: angular.isDefined(customClass) ? customClass : undefined, 
            zoomInTipLabel: locale.getString('spatial.map_tip_zoomin'),
            zoomOutTipLabel: locale.getString('spatial.map_tip_zoomout')
        });

        return ctrl;
    };
    
    /**
     * Create all OL Zoom interactions
     * 
     * @memberof genericMapService
     * @public
     * @returns {Array<ol.interaction>} An array with zoom related interactions
     */
    var createZoomInteractions = function(){
        var interactions = [];
        interactions.push(new ol.interaction.MouseWheelZoom());
        interactions.push(new ol.interaction.KeyboardZoom());
        interactions.push(new ol.interaction.DoubleClickZoom());
        interactions.push(new ol.interaction.DragZoom());
        interactions.push(new ol.interaction.DragZoom({
            out: true,
            condition: ol.events.condition.altKeyOnly
        }));
        
        return interactions;
    };
    
    /**
     * Create all OL Pan interactions
     * 
     * @memberof genericMapService
     * @public
     * @returns {Array<ol.interaction>} An array with pan related interactions
     */
    var createPanInteractions = function(){
        var interactions = [];
        interactions.push(new ol.interaction.DragPan());
        interactions.push(new ol.interaction.KeyboardPan());
        
        return interactions;
    };
    
    /**
     * Focus to map div
     * 
     * @memberof genericMapService
     * @public
     * @param {String} mapId - The id of the div containing the map
     */
    var focusMap = function(mapId){
        var mapElement = $window.document.getElementById(mapId);
        if(mapElement){
            mapElement.focus();
        }
    };
    
    /**
     * Calculates the intersection between a given geometry and the map projection extent.
     * The input geometry must be in WGS 84 ('EPSG:4326'). The returned geometry will have the 
     * projection of the source map.
     * 
     * @memberof genericMapService
     * @public
     * @param {ol.geom.Geometry} geom - The input geometry
     * @param {ol.Map} map - The OL map to be used
     * @returns {ol.geom.Geometry} The output geometry whic is an intersection between the input geometry and the map extent
     */
    var intersectGeomWithProj = function(geom, map){
        var reproject = false;
        var projObj = map.getView().getProjection();
        var projCode = projObj.getCode();
        var extent = projObj.getExtent();
        var polygon = new ol.geom.Polygon.fromExtent(extent);
        
        if (projCode.indexOf('4326') === -1){
            reproject = true;
            polygon.transform(projCode, 'EPSG:4326');
        }
        
        var intersection = turf.intersect(geomToGeoJson(polygon), geomToGeoJson(geom));
        intersection = geoJsonToOlGeom(intersection);
        
        if (reproject){
            intersection.transform('EPSG:4326', projCode);
        }
        
        return intersection;
    };
    
    /**
     * Convert an OL geometry to a GeoJSON feature object
     * 
     * @memberof genericMapService
     * @public
     * @param {ol.geom.Geometry} geom - The input OL geometry
     * @returns {Object} The GeoJSON fetaure
     */
    var geomToGeoJson = function(geom){
        var format = new ol.format.GeoJSON();
        var feature = new ol.Feature();
        feature.setGeometry(geom);
        
        return format.writeFeatureObject(feature);
    };
    
    /**
     * Convert a GeoJSON feature object to an OL geometry
     * 
     * @memberof genericMapService
     * @public
     * @param {Object} feature - The GeoJSON feature object
     * @returns {ol.geom.Geometry} The OL geometry
     */
    var geoJsonToOlGeom = function(feature){
        var format = new ol.format.GeoJSON();
        return format.readFeature(feature).getGeometry();
    };
    
	var genericMapService = {
	    mapBasicConfigs: {},
	    setMapBasicConfigs: setMapBasicConfigs, 
	    getMapProjectionCode: getMapProjectionCode,
	    createView: createView,
	    updateMapView: updateMapView,
	    updateMapSize: updateMapSize,
	    focusMap: focusMap,
	    getCurrentScale: getCurrentScale,
	    getLayerByTitle: getLayerByTitle,
	    getLayerByType: getLayerByType,
	    getControlsByType: getControlsByType,
	    getInteractionsByType: getInteractionsByType,
	    setProjection: setProjection,
	    removeAllLayers: removeAllLayers,
	    removeLayerByType: removeLayerByType,
	    defineOsm: defineOsm,
	    defineOseam: defineOseam,
	    defineBing: defineBing,
	    getBaseLayerConfig: getBaseLayerConfig,
	    getGenericLayerConfig: getGenericLayerConfig,
	    defineWms: defineWms,
	    refreshWMSLayer: refreshWMSLayer,
	    createZoomCtrl: createZoomCtrl,
	    createZoomInteractions: createZoomInteractions,
	    createPanInteractions: createPanInteractions,
	    intersectGeomWithProj: intersectGeomWithProj,
	    geomToGeoJson: geomToGeoJson,
	    geoJsonToOlGeom: geoJsonToOlGeom
	};

	return genericMapService;
});