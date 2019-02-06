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
 * @name realtimeMapService
 * @param locale {service} angular locale service
 * @param genericMapService {service} generic map service<p>{@link unionvmsWeb.genericMapService}</p>
 * @param projectionService {service} map projection service <p>{@link unionvmsWeb.projectionService}</p>
 * @param UserArea {service} user area service
 * @param userService {service} USM user service
 * @param areaClickerService {service} area map click service
 * @param loadingStatus {service} loading status service <p>{@link unionvmsWeb.loadingStatus}</p>
 * @attr mapGraticule {ol.Graticule} - The base OL graticule component
 * @description
 *  Service to control the map on the area management tab
 */
angular.module('unionvmsWeb').factory('realtimeMapService',function(locale, genericMapService, projectionService, UserArea, userService, areaClickerService, loadingStatus) {

    var rtMs = {};

    /**
     * Set the map
     *
     * @memberof realtimeMapService
     * @public
     */
    rtMs.setMap = function(){
        var projObj;
        if (angular.isDefined(genericMapService.mapBasicConfigs.success)){
            if (genericMapService.mapBasicConfigs.success){
                projObj = genericMapService.mapBasicConfigs.projection;
            } else {
                //Fallback mode
                projObj = projectionService.getStaticProjMercator();
            }
        }

        var view = genericMapService.createView(projObj);

        var map = new ol.Map({

            target: 'realtimeMap',
            controls: rtMs.getControls(),
            interactions: rtMs.getInteractions(),
            logo: false
        });

        /*
        map.on('singleclick', function(evt){
            var layerType = areaClickerService.layerType;
            if (areaClickerService.active && angular.isDefined(layerType) && layerType !== 'USERAREA' && layerType !== 'AREAGROUPS'){
                var proj = rtMs.getMapProjectionCode();

                var requestData = {
                    areaType: layerType,
                    isGeom: false,
                    longitude: evt.coordinate[0],
                    latitude: evt.coordinate[1],
                    crs: proj.split(':')[1]
                };

                areaClickerService.getDataFromMap(requestData);
            }
        });
        */
        map.setView(view);
        rtMs.map = map;

        rtMs.addBaseLayers();
        rtMs.addVector();

        rtMs.addLayerSwitcher();
    };

    //LAYERS
    /**
     * Add base layers to the map
     *
     * @memberof realtimeMapService
     * @public
     */
    rtMs.addBaseLayers = function(){
        if (!genericMapService.mapBasicConfigs.success){
            rtMs.addOSM();
        } else {
            angular.forEach(genericMapService.mapBasicConfigs.layers.baseLayers, function(layerConf) {
                switch (layerConf.type) {
                    case 'OSM':
                        rtMs.addOSM(layerConf);
                        break;
                    case 'WMS':
                        rtMs.addWMS(layerConf, true);
                        break;
                    case 'BING':
                        layerConf.title = locale.getString('spatial.layer_tree_' + layerConf.title);
                        rtMs.addBing(layerConf, true);
                        break;
                }
            });
        }
    };

    /**
     * Adds OpenStreeMap layer to the map
     *
     * @memberof realtimeMapService
     * @public
     * @alias addOSM
     * @param {Object} [config={}] - The layer configuration object
     */
    rtMs.addOSM =  function(config){
        if (!angular.isDefined(config)){
            config = {};
        }
        var layer = genericMapService.defineOsm(config);
        layer.set('switchertype', 'base'); //Necessary for the layerswitcher control
        rtMs.map.addLayer(layer);
    };

    /**
     * Adds BING layers to the map
     *
     * @memberof realtimeMapService
     * @public
     * @alias addBing
     * @param {Object} [config={}] - The layer configuration object
     */
    rtMs.addBing = function(config){
        if (!angular.isDefined(config)){
            config = {};
        }
        var layer = genericMapService.defineBing(config);
        layer.set('switchertype', 'base'); //Necessary for the layerswitcher control
        rtMs.map.addLayer(layer);
    };

    /**
     * Adds UserAreas WMS layer to the map
     *
     * @memberof realtimeMapService
     * @public
     * @alias addUserAreasWMS
     * @param {Object} def - The layer defintion object
     */
    rtMs.addUserAreasWMS = function(def){
        var cql = "(user_name = '" + userService.getUserName() + "' OR scopes ilike '%#" + userService.getCurrentContext().scope.scopeName +"#%')";
        var finalCql = cql;
        if (angular.isDefined(def.groupCql)){
            finalCql += def.groupCql;
        }

        var mapExtent = rtMs.map.getView().getProjection().getExtent();
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
                'cql_filter': finalCql
            }
        };

        var layer = genericMapService.defineWms(config);
        layer.set('areaType', 'USERAREA');

        layer.set('baseCql', cql);
        var groupCql = angular.isDefined(def.groupCql) ? def.groupCql : undefined;
        layer.set('groupCql', groupCql);

        rtMs.map.addLayer(layer);
        loadingStatus.isLoading('AreaManagementPanel', false);
    };

    /**
     * Adds generic WMS layer to the map. It is used for system areas.
     *
     * @memberof realtimeMapService
     * @public
     * @alias addWMS
     * @param {Object} def - The layer defintion object
     * @param {Boolean} isBaselayer - True if layer is a base layer
     */
    rtMs.addWMS = function(def, isBaseLayer){
        var config;
        if (isBaseLayer){
            config = genericMapService.getBaseLayerConfig(def, rtMs.map);
        } else {
            config = genericMapService.getGenericLayerConfig(def, rtMs.map);
        }

        var layer = genericMapService.defineWms(config);
        if (angular.isDefined(def.areaType)){
            layer.set('areaType', def.areaType);
        }

        if (isBaseLayer){
            layer.set('switchertype', 'base'); //Necessary for the layerswitcher control
        }

        rtMs.map.addLayer(layer);
        loadingStatus.isLoading('AreaManagementPanel', false);
    };

    /**
     * Merge new CQL params to WMS layers using GID
     *
     * @memberof realtimeMapService
     * @public
     * @alias mergeParamsGid
     * @param {Integer|String} gid - the geoemtry id
     * @param {String} type - the layer type
     * @param {Boolean} isEqual - whether the cql condition shoulb be equal (true) or different (false)
     */
    rtMs.mergeParamsGid = function(gid, type, isEqual){
        var layer = rtMs.getLayerByType(type);
        if (angular.isDefined(layer)){
            var layerSrc = layer.getSource();
            var cql = layer.get('baseCql');
            if (isEqual){
                cql += " and gid = " + parseInt(gid);
            } else {
                cql += " and gid <> " + parseInt(gid);
            }

            layerSrc.updateParams({
                time_: (new Date()).getTime(),
                'cql_filter': cql
            });
        }
    };

    /**
     * Reset WMS CQL params
     *
     * @memberof realtimeMapService
     * @public
     * @alias clearParams
     * @param {String} type - the layer type
     */
    rtMs.clearParams = function(type){
        var layer = rtMs.getLayerByType(type);
        if (angular.isDefined(layer)){
            var layerSrc = layer.getSource();
            var cql = layer.get('baseCql');

            layerSrc.updateParams({
                'cql_filter': cql,
                time_: (new Date()).getTime()
            });
        }
    };

    /**
     * Add vector layers for drawing purposes
     *
     * @memberof realtimeMapService
     * @public
     * @alias addVector
     */
    rtMs.addVector = function(){
        var features = new ol.Collection();
        var layer = new ol.layer.Vector({
            type: 'drawlayer',
            source: new ol.source.Vector({
                features: features,
                wrapX: false
            }),
            wrapX: false,
            style: rtMs.setVectorStyle
        });

        rtMs.map.addLayer(layer);

        var points = new ol.Collection();
        var pointLayer = new ol.layer.Vector({
            type: 'pointdraw',
            source: new ol.source.Vector({
                features: points,
                wrapX: false
            }),
            wrapX: false,
            style: rtMs.setPointStyle
        });

        rtMs.map.addLayer(pointLayer);
    };

    /**
     * Set the style for the polygons in the drawing layer
     *
     * @memberof realtimeMapService
     * @public
     * @alias setVectorStyle
     * @param {ol.Feature} feature
     * @param {Number} resolution - the current map resolution
     * @returns {Array} - Array of ol.Style objects
     */
    rtMs.setVectorStyle = function(feature, resolution){
        var styles = [];
        var coords = feature.getGeometry().getCoordinates()[0];
        coords.pop();

        var polygonStyle = new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgba(255, 255, 255, 0.2)'
            }),
            stroke: new ol.style.Stroke({
                color: '#F7580D',
                width: 2
            })
        });
        styles.push(polygonStyle);

        for (var i = 0; i < coords.length; i++){
            var pointStyle = new ol.style.Style({
                image: new ol.style.Circle({
                    radius: 8,
                    fill: new ol.style.Fill({
                        color: 'rgba(255, 255, 255, 1)'
                    }),
                    stroke: new ol.style.Stroke({
                        color: '#F7580D',
                        width: 1
                    })
                }),
                text: new ol.style.Text({
                    text: i.toString(),
                    fill: new ol.style.Fill({
                        color: 'rgb(80, 80, 80)'
                    }),
                    stroke: new ol.style.Stroke({
                        color: 'rgb(80, 80, 80)'
                    })
                }),
                geometry: new ol.geom.Point(coords[i])
            });
            styles.push(pointStyle);
        }

        return styles;
    };

    /**
     * Set the style for the points in the drawing layer
     *
     * @memberof realtimeMapService
     * @public
     * @alias setPointStyle
     * @param {ol.Feature} feature
     * @param {Number} resolution - the current map resolution
     * @returns {Array} - Array of ol.Style objects
     */
    rtMs.setPointStyle = function(feature, resolution){
        var style = new ol.style.Style({
            image: new ol.style.Circle({
                radius: 8,
                fill: new ol.style.Fill({
                    color: '#A94442'
                }),
                stroke: new ol.style.Stroke({
                    color: '#FFFFFF',
                    width: 3
                })
            })
        });

        return [style];
    };

    /**
     * Remove all vector features from a vector layer
     *
     * @memberof realtimeMapService
     * @public
     * @alias removeVectorFeatures
     * @param {String} type - the layer type
     */
    rtMs.removeVectorFeatures = function(type){
        var layer = rtMs.getLayerByType(type);
        if (angular.isDefined(layer)){
            layer.getSource().clear();
        }
    };

    /**
     * Add polygon feature from input coordinates
     *
     * @memberof realtimeMapService
     * @public
     * @alias addVectorFeatureFromCoords
     * @param {Array} coords - array of coordinates
     * @param {String} srcProj - The EPSG projection code for the input coordinates
     * @param {Boolean} doZoom - Boolean indicating whether the map should be zoomed into the new area
     * @returns {Boolean} Boolean indicating if area was valid and inserted into the layer
     */
    rtMs.addVectorFeatureFromCoords = function(coords, srcProj, doZoom){
        var geom = new ol.geom.Polygon();
        geom.setCoordinates([coords]);

        var status = true;
        if (geom.getArea() === 0){
            status = false;
        } else {
            if (srcProj !== rtMs.getMapProjectionCode()){
                geom.transform(srcProj, rtMs.getMapProjectionCode());
            }

            rtMs.addVectorFeature(geom, doZoom);
        }
        return status;
    };

    /**
     * Add polygon feature from geometry
     *
     * @memberof realtimeMapService
     * @public
     * @alias addVectorFeature
     * @param {ol.geom.Geometry} geom - The OL geometry object
     * @param {Boolean} doZoom - Boolean indicating whether the map should be zoomed into the new area
     */
    rtMs.addVectorFeature = function(geom, doZoom){
        var feature = new ol.Feature({
            geometry: geom
        });

        UserArea.geometry = geom;
        var layer = rtMs.getLayerByType('drawlayer');
        if (angular.isDefined(layer)){
            var src = layer.getSource();
            src.clear();
            src.addFeature(feature);
        }

        if (doZoom){
            rtMs.zoomToGeom(geom);
        }
    };

    //CONTROLS AND INTERACTIONS
    /**
     * Add draw controls to the map
     *
     * @memberof realtimeMapService
     * @memberof realtimeMapService
     * @public
     * @alias addDrawControl
     */
    rtMs.addDrawControl = function(){
        var layer = rtMs.getLayerByType('drawlayer');
        if (angular.isDefined(layer)){
            var source = layer.getSource();
            var draw = new ol.interaction.Draw({
                source: source,
                type: 'Polygon',
                condition: ol.events.condition.noModifierKeys,
                freehandCondition: ol.events.condition.never
            });

            draw.on('drawstart', function(evt){
                var features = source.getFeatures();
                if (features.length !== 0){
                    UserArea.geometry = undefined;
                    source.clear();
                }
            });

            draw.on('drawend', function(evt){
                UserArea.geometry = evt.feature.getGeometry();
                UserArea.setCoordsFromGeom();
                UserArea.coordsProj = rtMs.getMapProjectionCode();
            });

            rtMs.map.addInteraction(draw);
        }
    };

    /**
     * Remove draw controls from the map
     *
     * @memberof realtimeMapService
     * @public
     * @alias removeDrawControl
     */
    rtMs.removeDrawControl = function(){
        rtMs.map.removeInteraction(rtMs.getInteractionsByType('Draw')[0]);
    };

    /**
     * Add circular areas draw control to the map
     *
     * @memberof realtimeMapService
     * @public
     * @alias addCircularControl
     */
    rtMs.addCircularControl = function(){
        var layer = rtMs.getLayerByType('pointdraw');
        if (angular.isDefined(layer)){
            var source = layer.getSource();
            var draw = new ol.interaction.Draw({
                source: source,
                type: 'Point',
                condition: ol.events.condition.noModifierKeys,
                freehandCondition: ol.events.condition.never
            });

            draw.on('drawstart', function(evt){
                var features = source.getFeatures();
                if (features.length !== 0){
                    UserArea.centroidCoords = [];
                    source.clear();
                }
            });

            draw.on('drawend', function(evt){
                var coords = evt.feature.getGeometry().getCoordinates();
                var mapProj = rtMs.getMapProjectionCode();
                if (!angular.isDefined(UserArea.centroidProj)){
                    UserArea.centroidProj = mapProj;
                }
                if (mapProj !== UserArea.centroidProj){
                    coords = ol.proj.transform(coords, mapProj, UserArea.centroidProj);
                }
                UserArea.centroidCoords = coords;
            });

            rtMs.map.addInteraction(draw);
        }
    };

    /**
     * Remove circular areas draw control from the map
     *
     * @memberof realtimeMapService
     * @public
     * @alias removeCircularControl
     */
    rtMs.removeCircularControl = function(){
        rtMs.map.removeInteraction(rtMs.getInteractionsByType('Draw')[0]);
    };

    /**
     * Add edit control to the map
     *
     * @memberof realtimeMapService
     * @public
     * @alias addEditControl
     */
    rtMs.addEditControl = function(){
        var layer = rtMs.getLayerByType('drawlayer');
        if (angular.isDefined(layer)){
            var source = layer.getSource();
            var edit = new ol.interaction.Modify({
                features: source.getFeaturesCollection(),
                deleteCondition: function(event) {
                    return ol.events.condition.shiftKeyOnly(event) && ol.events.condition.singleClick(event);
                }
            });

            edit.on('modifyend', function(evt){
                UserArea.geometry = evt.features.item(0).getGeometry();
                UserArea.setCoordsFromGeom();
                UserArea.coordsProj = rtMs.getMapProjectionCode();
            });

            rtMs.map.addInteraction(edit);
        }
    };

    /**
     * Remove edit control from the map
     *
     * @memberof realtimeMapService
     * @public
     * @alias removeEditControl
     */
    rtMs.removeEditControl = function(){
        rtMs.map.removeInteraction(rtMs.getInteractionsByType('Modify')[0]);
    };

    /**
     * Add drag control to the map
     *
     * @memberof realtimeMapService
     * @public
     * @alias addDragControl
     */
    rtMs.addDragControl = function(){
        var layer = rtMs.getLayerByType('drawlayer');
        if (angular.isDefined(layer)){
            var translate = new ol.interaction.Translate({
                features: layer.getSource().getFeaturesCollection()
            });

            translate.on('translateend', function(evt){
                UserArea.geometry = evt.features.item(0).getGeometry();
                UserArea.setCoordsFromGeom();
                UserArea.coordsProj = rtMs.getMapProjectionCode();
            });

            rtMs.map.addInteraction(translate);
        }
    };

    /**
     * Remove drag control to the map
     *
     * @memberof realtimeMapService
     * @public
     * @alias removeDragControl
     */
    rtMs.removeDragControl = function(){
        rtMs.map.removeInteraction(rtMs.getInteractionsByType('Translate')[0]);
    };

    /**
     * Get default map controls
     *
     * @memberof realtimeMapService
     * @public
     * @alias getControls
     * @returns {ol.Collection} The OL collection of map controls
     */
    rtMs.getControls = function(){
        var ctrls = [];

        ctrls.push(new ol.control.Attribution({
            collapsible: false,
            collapsed: false
        }));

        ctrls.push(genericMapService.createZoomCtrl('ol-zoom-liveview'));
        ctrls.push(rtMs.addScale());
        ctrls.push(rtMs.addMouseCoords());

        var iconSpan = document.createElement('span');
        iconSpan.className = 'fa fa-globe';
        ctrls.push(new ol.control.ZoomToExtent({
            className: 'ol-zoom-extent ol-zoomextent-areamap',
            label: iconSpan,
            tipLabel: locale.getString('areas.map_tip_full_extent')
        }));

        var resetStyle = 'ol-resetCql-right-side';
        if (genericMapService.mapBasicConfigs.success && genericMapService.mapBasicConfigs.layers.baseLayers.length > 1){
            resetStyle = 'ol-resetCql-right-side-with-switcher';
        }

        ctrls.push(new ol.control.ResetLayerFilter({
            controlClass: resetStyle,
            type: 'realtimeMapService',
            label: locale.getString('areas.map_tip_reset_layer_filter')
        }));

        return new ol.Collection(ctrls);
    };

    /**
     * Find control defintions by type
     *
     * @memberof realtimeMapService
     * @private
     * @alias findControlByType
     * @param {String} type - The type of the control to find
     * @returns {Object} The object containing the control definitions
     */
    var findControlByType = function(type){
        var ctrl = _.find(genericMapService.mapBasicConfigs.control, function(item) {
            return item.type === type;
        });

        return ctrl;
    };

    /**
     * Add the mouse coordinates contrl to the map
     *
     * @memberof realtimeMapService
     * @public
     * @alias addMouseCoords
     * @returns {ol.control.MousePosition} The mouse position OL control
     */
    rtMs.addMouseCoords = function(){
        var ctrlDef;
        if (angular.isDefined(genericMapService.mapBasicConfigs.control)){
            ctrlDef = findControlByType('mousecoords');
        }

        if (!angular.isDefined(ctrlDef)){
            ctrlDef = {
                epsg: 4326,
                format: 'dd'
            };
        }

        rtMs.graticuleFormat = ctrlDef.format;
        var olCtrl = genericMapService.addMousecoords(ctrlDef, 'areaMap-coordinates');
        return olCtrl;
    };

    /**
     * Add the scale contrl to the map
     *
     * @memberof realtimeMapService
     * @public
     * @alias addScale
     * @returns {ol.control.ScaleLine} The scale line OL control
     */
    rtMs.addScale = function(){
        var ctrlDef;
        if (angular.isDefined(genericMapService.mapBasicConfigs.control)){
            ctrlDef = findControlByType('scale');
        }

        if (!angular.isDefined(ctrlDef)){
            ctrlDef = {
                units: 'nautical'
            };
        }

        var olCtrl = genericMapService.addScale(ctrlDef);
        return olCtrl;
    };

    /**
     * Get the default map interactions
     *
     * @memberof realtimeMapService
     * @public
     * @alias getInteractions
     * @returns {ol.Collection} The OL collection of map interactions
     */
    rtMs.getInteractions = function(){
        var interactions = genericMapService.createZoomInteractions();
        interactions = interactions.concat(genericMapService.createPanInteractions());

        return new ol.Collection(interactions);
    };

    /**
     * Add layer switcher control for base layers
     *
     * @memberof realtimeMapService
     * @public
     * @alias addLayerSwitcher
     */
    rtMs.addLayerSwitcher = function(){
        var layers = rtMs.map.getLayers();
        if (layers.getLength() > 3){ // areaMs always has drawlayer, pointdraw and one base layer
            var switcher = new ol.control.LayerSwitcher({
                controlClass: 'right-side'
            });
            rtMs.map.addControl(switcher);
        }
    };

    //Map graticule
    rtMs.graticuleFormat = 'dms';
    rtMs.mapGraticule = new ol.Graticule({
        showLabels: true,
        lonLabelFormatter: function(lon){
            return genericMapService.formatCoordsForGraticule(rtMs.graticuleFormat, lon, 'EW');
        },
        latLabelFormatter: function(lat){
            return genericMapService.formatCoordsForGraticule(rtMs.graticuleFormat, lat, 'NS');
        }
    });

    /**
     * Set mapGraticule in the current map according to a specified visibility status
     *
     * @memberof genericMapService
     * @public
     * @alias setGraticule
     * @param {Boolean} status - Whether the graticule is visible or not in the current map
     */
    rtMs.setGraticule = function(status){
        if (!status){
            rtMs.mapGraticule.setMap(null);
        } else {
            rtMs.mapGraticule.setMap(rtMs.map);
        }
    };

    //TURF
    /**
     * Convert point coordinates to GeoJSON to use in Turf
     *
     * @memberof realtimeMapService
     * @public
     * @alias pointCoordsToTurf
     * @param {Array} coords - An array of point coordinates
     * @returns {String} - a GeoJSON string of the point geometry
     */
    rtMs.pointCoordsToTurf = function(coords){
        var format = new ol.format.GeoJSON();
        var point = new ol.Feature(
            new ol.geom.Point(coords)
        );

        return format.writeFeatureObject(point);
    };

    /**
     * Convert Turf GeoJSON feature to OL feature
     *
     * @memberof realtimeMapService
     * @public
     * @alias turfToOlGeom
     * @param {String} feature - A GeoJSON string of the feature
     * @returns {ol.Feature} - The OL feature
     */
    rtMs.turfToOlGeom = function(feature){
        var format = new ol.format.GeoJSON();
        return format.readFeatures(feature)[0].getGeometry().transform('EPSG:4326', rtMs.getMapProjectionCode());
    };

    //GENERIC FUNCTIONS
    /**
     * Refresh WMS layer in the map
     *
     * @memberof realtimeMapService
     * @public
     * @alias refreshWMSLayer
     * @param {String} type - The layer type
     */
    rtMs.refreshWMSLayer = function(type){
        genericMapService.refreshWMSLayer(type, rtMs.map);
    };

    /**
     * Set the opacity of a map layer
     *
     * @memberof realtimeMapService
     * @public
     * @alias setLayerOpacity
     * @param {String} type - the layer type
     * @param {Number} value - the opacity level for the specified layer
     */
    rtMs.setLayerOpacity = function(type, value){
        var layer = rtMs.getLayerByType(type);
        if (angular.isDefined(layer)){
            layer.setOpacity(value);
        }
    };

    /**
     * Get the opacity level of a map layer
     *
     * @memberof realtimeMapService
     * @public
     * @alias getLayerOpacity
     * @param {String} type - the layer type
     * @returns {Number} - The opacity of the layer converted into transparency
     */
    rtMs.getLayerOpacity = function(type){
        var transparency = 0;
        var layer = rtMs.getLayerByType(type);
        if (angular.isDefined(layer)){
            transparency = (1 - layer.getOpacity()) * 100;
        }

        return transparency;
    };

    /**
     * Toggle visibility for a layer
     *
     * @memberof realtimeMapService
     * @public
     * @alias toggleLayerVisibility
     * @param {String} type - the layer type
     */
    rtMs.toggleLayerVisibility = function(type){
        var layer = rtMs.getLayerByType(type);
        var currentVis = layer.get('visible');
        layer.set('visible', !currentVis);
    };

    /**
     * Force a recalculation of the map viewport size
     *
     * @memberof realtimeMapService
     * @public
     * @alias updateMapSize
     */
    rtMs.updateMapSize = function(){
        genericMapService.updateMapSize(rtMs.map);
    };

    /**
     * Get the first layer with the specified type
     *
     * @memberof realtimeMapService
     * @public
     * @alias getLayerByType
     * @param {String} type - The type of the layer to find
     * @returns {ol.layer} The OL layer
     */
    rtMs.getLayerByType = function(type){
        return genericMapService.getLayerByType(type, rtMs.map);
    };

    /**
     * Remove layer from map by type
     *
     * @memberof realtimeMapService
     * @public
     * @alias removeLayerByType
     * @param {String} type - The type of the layer to remove from map
     */
    rtMs.removeLayerByType = function(type){
        genericMapService.removeLayerByType(type, rtMs.map);
    };

    /**
     * Remove all WMS Area layers (USER and SYSTEM)
     *
     * @memberof realtimeMapService
     * @public
     * @alias removeAreaLayers
     */
    rtMs.removeAreaLayers = function(){
        if (angular.isDefined(rtMs.map)){
            var layers = rtMs.map.getLayers().getArray();
            var filteredLayers = layers.filter(function(layer){
                var type = layer.get('areaType');
                if (type === 'USERAREA' || type === 'SYSAREA'){
                    return true;
                }
            });

            if (filteredLayers.length > 0){
                angular.forEach(filteredLayers, function(layer){
                    rtMs.map.removeLayer(layer);
                });
            }
        }
    };

    /**
     * Raise a layer to the top of the map
     *
     * @memberof realtimeMapService
     * @public
     * @alias raiseLayer
     * @param {String} type - The type of the layer
     */
    rtMs.raiseLayer = function(type){
        var layer = rtMs.getLayerByType(type);

        var layers = rtMs.map.getLayers();
        var lyrLength = layers.getLength();

        var idx;
        layers.forEach(function(lyr, lyrIdx){
            if (lyr.get('type') === type){
                idx = lyrIdx;
            }
        });

        layers.removeAt(idx);
        layers.insertAt(lyrLength - 1, layer);
    };

    //Get map projection
    /**
     * Gets the base projection of the map
     *
     * @memberof realtimeMapService
     * @public
     * @alias getMapProjectionCode
     * @returns {String} Map base projection code  (e.g. 'EPSG:4326')
     */
    rtMs.getMapProjectionCode = function(){
        return genericMapService.getMapProjectionCode(rtMs.map);
    };

    /**
     * Zoom to a geometry
     *
     * @memberof realtimeMapService
     * @public
     * @alias zoomToGeom
     * @param {ol.geom.Geometry} geom - the geometry to zoom to
     */
    rtMs.zoomToGeom = function(geom){
        rtMs.map.getView().fit(geom, rtMs.map.getSize(), {maxZoom:19});
    };

    //Get array of interactions by type
    /**
     * Get an array of interactions by their type
     * @memberof realtimeMapService
     * @public
     * @alias getInteractionsByType
     * @param {String} type - the interaction type
     */
    rtMs.getInteractionsByType = function(type){
        var interactions = rtMs.map.getInteractions().getArray();
        var ints = interactions.filter(function(int){
            return int instanceof ol.interaction[type] === true;
        });

        return ints;
    };


    rtMs.getZoomLevel = function() {
        return rtMs.map.getView().getZoom();
    };

    rtMs.getCenter = function() {
        return rtMs.map.getView().getCenter();
    };

    rtMs.getMap = function() {
        return rtMs.map;
    };

    rtMs.updateView = function(center, zoomLevel) {
        let view = rtMs.map.getView();
        view.setCenter(center);
        view.setZoom(zoomLevel);
        rtMs.map.setView(view);

    };

    return rtMs;

});
