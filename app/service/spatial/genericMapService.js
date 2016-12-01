/*
Developed with the contribution of the European Commission - Directorate General for Maritime Affairs and Fisheries
© European Union, 2015-2016.

This file is part of the Integrated Fisheries Data Management (IFDM) Suite. The IFDM Suite is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as published by the
Free Software Foundation, either version 3 of the License, or any later version. The IFDM Suite is distributed in
the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. You should have received a
copy of the GNU General Public License along with the IFDM Suite. If not, see <http://www.gnu.org/licenses/>.
*/
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

angular.module('unionvmsWeb').factory('genericMapService',function($localStorage, $location, $window, locale, spatialRestService) {
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
        registerProjInProj4(proj);
        
        var worldExtent = [-180, -89.99, 180, 89.99];
        if (angular.isDefined(proj.worldExtent)){
            var tempExt = proj.worldExtent.split(';');
            worldExtent = [parseFloat(tempExt[0]), parseFloat(tempExt[1]), parseFloat(tempExt[2]), parseFloat(tempExt[3])];
        }
        
        var ext = proj.extent.split(';');
        var projection = new ol.proj.Projection({
            code: 'EPSG:' + proj.epsgCode,
            units: proj.units,
            axisOrientation: proj.axis,
            global: proj.global,
            extent: [parseFloat(ext[0]), parseFloat(ext[1]), parseFloat(ext[2]), parseFloat(ext[3])],
            worldExtent: worldExtent
        });

        return projection;
    };
    
    /**
     * Register a specific projection within the proj4js workspace
     * 
     * @memberof genericMapService
     * @public
     * @param {Object} proj - The definition of the projection
     */
    var registerProjInProj4 = function(proj){
        if (!angular.isDefined(proj4.defs('EPSG:' + proj.epsgCode))){
            proj4.defs('EPSG:' + proj.epsgCode, proj.projDef);
        }
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
        
        var attribution;
        if (angular.isDefined(def.shortCopyright)){
            attribution = def.shortCopyright;
        }
        
        var config = {
            title: def.title,
            type: def.type,
            isBaseLayer: def.isBaseLayer,
            url: def.url,
            serverType: serverType,
            attribution: attribution,
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
        
        var attribution;
        if (angular.isDefined(def.shortCopyright)){
            attribution = def.shortCopyright;
        }
        
        var config = {
            type: def.typeName,
            url: def.serviceUrl,
            serverType: 'geoserver',
            attribtution: attribution,
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
    var setMapBasicConfigs = function(callback){
        var self = this;
        self.mapBasicConfigs = {};
        var callbackFunc = callback;
        spatialRestService.getBasicMapConfigurations().then(function(response){
            self.mapBasicConfigs = response.map;
            self.mapBasicConfigs.layers.baseLayers.reverse();
            self.mapBasicConfigs.success = true;
            if(angular.isDefined(callbackFunc)){
                callbackFunc();
            }
        }, function(error){
            self.mapBasicConfigs = {success: false};
            if(angular.isDefined(callbackFunc)){
                callbackFunc();
            }
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
        var proj = this.setProjection(config);
        var center = ol.proj.transform([-1.81185, 52.44314], 'EPSG:4326', 'EPSG:' + config.epsgCode);
        var view = new ol.View({
            projection: proj,
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
     * Create the scale control
     * 
     * @memberof genericMapService
     * @public
     * @alias addScale
     * @param {Object} ctrl - An object containing the definitions for the control
     * @returns {ol.control.ScaleLine} The scale control to be added to the map
     */
    var addScaleCtrl = function(ctrl){
        var olCtrl = new ol.control.ScaleLine({
            units: ctrl.units,
            className: 'ol-scale-line'
        });
        
        return olCtrl;
    };
    
    /**
     * Create Mouse Coordinates control
     * 
     * @memberof genericMapService
     * @public
     * @alias addMousecoords
     * @param {Object} ctrl - An object containing the definitions for controls
     * @param {String} targetId - The ID of the target DOM element where the coordinates will be displayed 
     * @returns {ol.control.MousePosition} The mouse coordinates OL control
     */
    var addMousecoords = function(ctrl, targetId){
        var olCtrl =  new ol.control.MousePosition({
            projection: 'EPSG:' + ctrl.epsgCode,
            coordinateFormat: function(coord){
                return formatCoords(coord, ctrl);
            },
            target: angular.element('#' + targetId)[0],
            className: 'mouse-position'
        });
        
        return olCtrl;
    };
    
    /**
     * Format mouse position coordinates according to the report/user preferences
     * 
     * @memberof genericMapService
     * @private
     * @alias formatCoords
     * @param {Array<Number>} coord - The pair of coordinates to convert
     * @param {Object} ctrl - The object containing the definitions to appy in the mouse coordinates contrl
     * @returns {String} The converted coordinates
     */
    var formatCoords = function(coord, ctrl){
        var x,y;
        if (ctrl.epsgCode === 4326){
            if (ctrl.format === 'dd'){
                return ol.coordinate.format(coord, '<b>LON:</b> {x}\u00b0 \u0090 <b>LAT:</b> {y}\u00b0' , 4);
            } else if (ctrl.format === 'dms'){
                x = coordToDMS(coord[0], 'EW');
                y = coordToDMS(coord[1], 'NS');
                return '<b>LON:</b> ' + x + '\u0090 <b>LAT:</b> ' + y;
            } else {
                x = coordToDDM(coord[0], 'EW');
                y = coordToDDM(coord[1], 'NS');
                return '<b>LON:</b> ' + x + '\u0090 <b>LAT:</b> ' + y;
            }
        } else {
            return ol.coordinate.format(coord, '<b>X:</b> {x} m \u0090 <b>Y:</b> {y} m' , 4);
        }
    };
    
    /**
     * Convert coordinates from Decimal Degrees to Degrees Minutes Seconds
     * 
     * @memberof genericMapService
     * @private
     * @alias coordToDMS
     * @param {Number} degrees
     * @param {String} hemispheres
     * @returns {String} The coordinate formated in DMS
     */
    var coordToDMS = function(degrees, hemispheres){
        var normalized = (degrees + 180) % 360 - 180;
        var x = Math.abs(Math.round(3600 * normalized));
        return Math.floor(x / 3600) + '\u00b0 ' +
            Math.floor((x / 60) % 60) + '\u2032 ' +
            Math.floor(x % 60) + '\u2033 ' +
            hemispheres.charAt(normalized < 0 ? 1 : 0);
    };

    /**
     * Convert coordinates from Decimal Degrees to Degrees Decimal Minutes
     * 
     * @memberof genericMapService
     * @private
     * @alias coordToDDM
     * @param {Number} degrees
     * @param {String} hemispheres
     * @returns {String} The coordinate formated in DDM
     */
    var coordToDDM = function(degrees, hemispheres){
        var normalized = (degrees + 180) % 360 - 180;
        var x = Math.abs(Math.round(3600 * normalized));
        return Math.floor(x / 3600) + '\u00b0 ' +
            ((x / 60) % 60).toFixed(2) + '\u2032 ' +
            hemispheres.charAt(normalized < 0 ? 1 : 0);
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
        interactions.push(new ol.interaction.PinchZoom());
        
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
	    registerProjInProj4: registerProjInProj4,
	    removeAllLayers: removeAllLayers,
	    removeLayerByType: removeLayerByType,
	    defineOsm: defineOsm,
	    defineOseam: defineOseam,
	    defineBing: defineBing,
	    getBaseLayerConfig: getBaseLayerConfig,
	    getGenericLayerConfig: getGenericLayerConfig,
	    defineWms: defineWms,
	    refreshWMSLayer: refreshWMSLayer,
	    addScale: addScaleCtrl,
	    addMousecoords: addMousecoords,
	    createZoomCtrl: createZoomCtrl,
	    createZoomInteractions: createZoomInteractions,
	    createPanInteractions: createPanInteractions,
	    intersectGeomWithProj: intersectGeomWithProj,
	    geomToGeoJson: geomToGeoJson,
	    geoJsonToOlGeom: geoJsonToOlGeom
	};

	return genericMapService;
});
