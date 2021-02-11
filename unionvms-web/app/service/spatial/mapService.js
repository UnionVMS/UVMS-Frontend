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
 * @name mapService
 * @param locale {service} angular locale service
 * @param $rootScope {service} angular rootScope service
 * @param $window {service} angular window service
 * @param $localStorage {service} angular local storage service
 * @param $timeout {service} angular timeout service
 * @param $interval {service} angular interval service
 * @param $templateRequest {service} angular template request service
 * @param $filter {service} angular filter service
 * @param spatialHelperService {service} spatial helper service
 * @param globalSettingsService {service} global settings service
 * @param unitConversionService {service} unit conversion service
 * @param coordinateFormatService {service} coordinate format service
 * @param MapFish {service} Mapfish service
 * @param genericMapService {service} generic map service <p>{@link unionvmsWeb.genericMapService}</p>
 * @param layerPanelService {service} layer panel service
 * @param mdrCacheService {service} MDR cache service <p>{@link unionvmsWeb.mdrCacheService}</p>
 * @attr {ol.Graticule} mapGraticule - The OL map graticule
 * @attr {Number} mapPrintResolution - The current map resolution to use while printing
 * @attr {Object} styles - An object containing the styles definitions for vms positions, segments and alarms
 * @attr {Array<ol.control>} addedControls - An array containing all the controls added to the map
 * @attr {Object} clusterStyles - An object containing a reference to the cluster styles that were previously computed
 * @attr {Number} clusterMinFeatureCount - The feature count of the smallest cluster
 * @attr {Number} clustermaxFeatureCount - The feature count of the biggest cluster
 * @attr {Number} currentResolution - The current map resolution
 * @attr {Object} vmsSources - An object containing all the different VMS sources types and their current visibility
 * @attr {Object} measureInteraction - A quick reference to the measure OL interaction
 * @attr {Number} measurePointsLength - The number of points defining the linestring of the measure geometry
 * @attr {Boolean} measureETA - Whether the ETA should be computed while measuring
 * @attr {Object} measureOverlays - An object containing a reference to all displayed popup overlays
 * @attr {Object} labelVisibility - An object containing the visibility and attributes to be used in labels for vms positions and segments
 * @attr {Object} vmsposLabels - An object containing the activity status and the ids of all displayed position labels
 * @attr {Object} vmssegLabels - An object containing the activity status and the ids of all displayed segment labels
 * @attr {Object} popupVisibility - An object containing the visibility and attributes to be used in popups for vms positions and segments
 * @attr {Object} popupRecContainer - An object containing reference to all features to be displayed in the popup, used for looping through features that are on top of each other
 * @description
 *  Service to control the map on the liveview of the reporting tab
 */
angular.module('unionvmsWeb').factory('mapService', function(locale, $rootScope, $window, $localStorage, $timeout, $interval, $templateRequest, $filter, spatialHelperService, globalSettingsService, unitConversionService, coordinateFormatService, MapFish, genericMapService, layerPanelService, mdrCacheService) {
	var ms = {};
	ms.sp = spatialHelperService;
	/**
	 * Set liveview map according to report/preferences configurations
	 *
	 * @memberof mapService
	 * @public
	 * @alias setMap
	 * @param {Object} config -  An object containing the configurations of the map
	 */
	ms.setMap = function(config){
	    ms.controls = [];
	    ms.interactions = [];
	    ms.overlay = ms.addPopupOverlay();

	    //Get all controls and interactions that will be added to the map
	    var controlsToMap = ms.setControls(config.map.control);

	    var map = new ol.Map({
	        renderer: 'canvas',
	        target: 'map',
	        controls: controlsToMap[0],
	        interactions: controlsToMap[1],
	        overlays: [ms.overlay],
	        logo: false
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
	        var dragInteraction = ms.getCustomInteraction('Pointer', 'dragExtent')[0];

	        //get feature info
	        if (angular.equals({}, ms.measureInteraction) && !angular.isDefined(dragInteraction)){
	            var records = [];
	            map.forEachFeatureAtPixel(pixel, function(feature, layer){
	                if (layer !== null) {
	                    var type = layer.get('type');
	                    if (type === 'vmspos'){
	                        var positions = feature.get('features');
	                        var selFeat;
	                        if (positions.length === 1){
	                            selFeat = positions[0];
	                        }

	                        if (feature.get('featNumber') === 1 && !angular.isDefined(selFeat)) {
	                            selFeat = feature.get('featureToDisplay');
	                        }

	                        if (angular.isDefined(selFeat)){
	                            records.push({
                                    type: type,
                                    data: selFeat.getProperties(),
                                    coord: selFeat.getGeometry().getCoordinates(),
                                    id: selFeat.getId(),
                                    fromCluster: false
                                });
	                        }
	                    } else if (type === 'vmsseg' || type === 'alarms' || type === 'ers'){
	                        records.push({
	                            type: type,
	                            data: feature.getProperties(),
	                            coord: type === 'vmsseg' || type === 'ers' ? feature.getGeometry().getClosestPoint(coordinate) : feature.getGeometry().getCoordinates(),
	                            id: feature.getId(),
	                            fromCluster: false
	                        });
	                    }
	                }
	            });

	            //Check features in exploded cluster
	            if (angular.isDefined(selInteraction) && selInteraction.getFeatures().getLength() > 0){
	                var positions = selInteraction.getFeatures().getArray()[0].get('features');
	                var minDist, record;
	                positions.forEach(function(position){
	                    if (position.get('isVisible')){
	                        var distance = new ol.geom.LineString([coordinate, position.get('spiderCoords')]).getLength();
	                        if (!angular.isDefined(minDist) || distance < minDist){
	                            minDist = distance;
	                            record = {
	                                type: 'vmspos',
	                                data: position.getProperties(),
	                                coord: position.get('spiderCoords'),
	                                id: position.getId(),
	                                fromCluster: true
	                            };
	                        }
	                    }
	                });

	                if (angular.isDefined(record)){
	                    records.push(record);
	                }
	            }

	            if (records.length > 0){
	                ms.popupRecContainer.reset();
                    var data = ms.setObjPopup(records[0]);
                    ms.popupRecContainer.records = records;
                    ms.popupRecContainer.currentIdx = 0;
                    ms.requestPopupTemplate(data, records[0].type, records[0].coord, records[0].fromCluster);
                }
	        }
	    });

	    var view = ms.createView(config.map.projection);
	    map.setView(view);
	    ms.map = map;
	    ms.addBlankLayer();

	    //Remove display none of the popup on initial loading
	    angular.element('#popup').css('display', 'block');

	    ms.map.getViewport().addEventListener('contextmenu', function(e){
            e.preventDefault();
            var select = ms.getInteractionsByType('Select')[0];
            if (angular.isDefined(select)){
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

                            if (feature.get('featNumber') > 1){
                                selFeatures.push(feature);
                                foundedFeatures = true;
                            }
                        }
                    });

                    if (foundedFeatures === false){
                        selFeatures.clear();
                    } else if (foundedFeatures === true && angular.isDefined(ms.overlay) && ms.overlay.get('fromCluster') === true){
                        ms.closePopup();
                    }
                }
            }
        });

	    ms.setDragBoxEvent(ms.map);
	};

	/**
	 * Create a OL map view from config object
	 *
	 * @memberof mapService
	 * @public
	 * @alias createView
	 * @param {Object} config - The map configuration object
	 * @returns {ol.View} The OL map view
	 */
	ms.createView = function(config){
	    var view = genericMapService.createView(config);

	    view.on('change:resolution', function(evt){
            //Clear features on expanded clusters when zooming
            var select = ms.getInteractionsByType('Select')[0];
            if (angular.isDefined(select)){
                select.getFeatures().clear();
                if (angular.isDefined(ms.overlay) && ms.overlay.get('fromCluster') === true){
                    ms.closePopup();
                }
            }

            layerPanelService.reloadPanels();
            //$rootScope.$broadcast('reloadLegend');
        });

	    return view;
	};

	/**
	 * Update map view with new configuration object
	 *
	 * @memberof mapService
	 * @public
	 * @alias updateMapView
	 * @param {Object} config - The map configuration object
	 */
	ms.updateMapView = function(config){
	    var view = ms.createView(config);
	    ms.map.setView(view);
	};

	/**
	 * Remove all layers from the map
	 *
	 * @memberof mapService
	 * @public
	 * @alias removeAllLayers
	 */
	ms.removeAllLayers = function(){
	    genericMapService.removeAllLayers(ms.map);

	    //Always add blank layer
	    ms.addBlankLayer();
	};

	//Add layers
	/**
	 * Create and add a blank base layer to the map
	 *
	 * @memberof mapService
	 * @public
	 * @alias addBlankLayers
	 */
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
	/**
	 * Generic function to create all types of layers
	 *
	 * @memberof mapService
	 * @public
	 * @alias createLayer
	 * @param {Object} config - the object containing all layer configuration options
	 * @returns {ol.layer.Layer|undefined} The OL layer object or undefined
	 */
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
            case 'alarms':
                layer = ms.createAlarmsLayer( config );
                break;
            case 'ers':
                layer = ms.createActivityLayer( config );
                break;
            default:
        }

        return ( layer );
    };

    /**
     * Create OpenStreeMap layer
     *
     * @memberof mapService
     * @public
     * @alias createOsm
     * @param {Object} config - The layer configuration object
     * @returns {ol.layer.Tile} The OSM layer
     */
    ms.createOsm = function( config ){
        var layer = genericMapService.defineOsm(config);
        return ( layer );
    };

    /**
     * Create OpenSeaMap layer
     *
     * @memberof mapService
     * @public
     * @alias createOseam
     * @param {Object} config - The layer configuration object
     * @returns {ol.layer.Tile} The OpenSeaMap layer
     */
    ms.createOseam = function(config){
        var layer = genericMapService.defineOseam(config);
        return (layer);
    };

    /**
     * Create BING layers
     *
     * @memberof mapService
     * @public
     * @alias createBing
     * @param {Object} config - The layer configuration object
     * @returns {ol.layer.Tile} The BING layer
     */
    ms.createBing = function(config){
        var layer = genericMapService.defineBing(config);
        return (layer);
    };

    //create WMS tile layer
    /**
     * Create WMS layers
     *
     * @memberof mapService
     * @public
     * @alias createWms
     * @param {Object} config - The layer configuration object
     * @returns {ol.layer.Tile} - The WMS layer
     */
    ms.createWms = function( config ){
        var layer = genericMapService.defineWms(config);
        layer.set('serverType', config.serverType);

        return ( layer );
    };

    //Map graticule
    ms.graticuleFormat = 'dms';
    ms.mapGraticule = new ol.Graticule({
        showLabels: true,
        lonLabelFormatter: function(lon){
            return genericMapService.formatCoordsForGraticule(ms.graticuleFormat, lon, 'EW');
        },
        latLabelFormatter: function(lat){
            return genericMapService.formatCoordsForGraticule(ms.graticuleFormat, lat, 'NS');
        }
    });
    /**
     * Set mapGraticule in the current map according to a specified visibility status
     *
     * @memberof mapService
     * @public
     * @alias setGraticule
     * @param {Boolean} status - Whether the graticule is visible or not in the current map
     */
    ms.setGraticule = function(status){
        if (!status){
            ms.mapGraticule.setMap(null);
        } else {
            ms.mapGraticule.setMap(ms.map);
        }
    };

    //Add alarms layer
    /**
     * Create alarms layer
     *
     * @memberof mapService
     * @public
     * @alias createAlarmsLayer
     * @param {Object} config - The configuration object for the alarms map layer
     * @returns {ol.layer.Vector} The alarms vector layer
     */
    ms.createAlarmsLayer = function(config){
        var attribution = new ol.Attribution({
            html: locale.getString('spatial.alarms_copyright')
        });

        var source = new ol.source.Vector({
            attributions: [attribution],
            features: (new ol.format.GeoJSON()).readFeatures(config.geoJson)
        });

        var layer = new ol.layer.Vector({
            title: config.title,
            type: config.type,
            longAttribution: config.longAttribution,
            isBaseLayer: false,
            source: source,
            style: ms.setAlarmsStyle
        });

        return( layer );
    };

    /**
     * Create fishing activities layer
     *
     * @memberof mapService
     * @public
     * @alias createActivityLayer
     * @param {Object} config - The configuration object for the fishing activities map layer
     * @returns {ol.layer.Vector} The fishing activities vector layer
     */
    ms.createActivityLayer = function( config ){
        var attribution = new ol.Attribution({
            html: locale.getString('spatial.activities_copyright')
        });

        var features = (new ol.format.GeoJSON()).readFeatures(config.geoJson, {
            dataProjection: 'EPSG:4326',
            featureProjection: ms.getMapProjectionCode()
        });

        var source = new ol.source.Vector({
            attributions: [attribution],
            features: features
        });

        var layer = new ol.layer.Vector({
            title: config.title,
            type: config.type,
            longAttribution: config.longAttribution,
            isBaseLayer: false,
            source: source,
            style: ms.setActivitiesStyle
        });

        return( layer );
    };

    /**
     * Create VMS positions layer
     *
     * @memberof mapService
     * @public
     * @alias createPositionsLayer
     * @param {Object} config - The configuration object for the VMS positions map layer
     * @returns {ol.layer.Vector} The VMS positions vector layer
     */
    ms.createPositionsLayer = function( config ) {
        var features = (new ol.format.GeoJSON()).readFeatures(config.geoJson, {
            dataProjection: 'EPSG:4326',
            featureProjection: ms.getMapProjectionCode()
        });

        var count = 0;
        angular.forEach(features, function(feature) {
            count += 1;
        	feature.setId(count);
        	feature.set('isVisible', true);
        });

        var source = new ol.source.Vector({
            features: features
        });

        var attribution = new ol.Attribution({
            html: locale.getString('spatial.vms_positions_copyright')
        });

        var cluster = new ol.source.Cluster({
            attributions: [attribution],
            distance: 20,
            source: source
        });

        cluster.on('change', function(e){
            //hide popup if position is clustered
            if (angular.isDefined(ms.overlay)){
                var id = ms.overlay.get('featureId');
                var layerSrc = ms.getLayerByType('vmspos').getSource();
                var features = layerSrc.getFeaturesInExtent(ms.map.getView().calculateExtent(ms.map.getSize()));
                if (features.length > 0){
                    var visible = false;
                    angular.forEach(features, function(feature) {
                        var inFeatures = feature.get('features');
                        if (inFeatures.length === 1 && inFeatures[0].getId() === id){
                            visible = true;
                        }
                    });

                    if (!visible){
                        ms.closePopup();
                    }
                }
            }
        });

        var layer = new ol.layer.Vector({
            title: config.title,
            type: config.type,
            longAttribution: config.longAttribution,
            isBaseLayer: config.isBaseLayer,
            source: cluster,
            style: ms.setClusterStyle
        });

        ms.addClusterExploder(layer);

        return( layer );
    };

    /**
     * Zoom to the extent containing all VMS positions
     *
     * @memberof mapService
     * @public
     * @alias zoomToPositionsLayer
     */
    ms.zoomToPositionsLayer = function(){
        var layer = ms.getLayerByType('vmspos');
        if (angular.isDefined(layer)){
            var layerSrc = layer.getSource();
            var changeListenerKey = layerSrc.on('change', function(e){
                if (layerSrc.getState() === 'ready' && layerSrc.getFeatures().length > 0){
                    var extent = layerSrc.getSource().getExtent();
                    var geom = new ol.geom.Polygon.fromExtent(extent);
                    ms.zoomTo(geom);

                    //Unregister the listener
                    ol.Observable.unByKey(changeListenerKey);
                }
            });
        }
    };

    /**
     * Create and add map interaction to explode the clusters (VMS positions)
     *
     * @memberof mapService
     * @public
     * @alias addClusterExploder
     * @param {ol.layer.Vector} layer - The OL vector layer with which the exploder interaction will work with
     */
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

    /**
     * Collapse expanded clusters
     *
     * @memberof mapService
     * @public
     */
    ms.collapseClusters = function(){
        var select = ms.getInteractionsByType('Select')[0];
        if (angular.isDefined(select)){
            select.getFeatures().clear();
        }
    };

    /**
     * Create VMS segements layer
     *
     * @memberof mapService
     * @public
     * @alias createSegmentsLayer
     * @param {Object} config - The configuration object for the VMS segments map layer
     * @returns {ol.layer.Vector} The VMS segments vector layer
     */
    ms.createSegmentsLayer = function( config ) {
        var attribution = new ol.Attribution({
            html: locale.getString('spatial.vms_segments_copyright')
        });

        var layer = new ol.layer.Image({
            title: config.title,
            type: config.type,
            longAttribution: config.longAttribution,
            isBaseLayer: config.isBaseLayer,
            source: new ol.source.ImageVector({
                attributions: [attribution],
                source: new ol.source.Vector({
                    features: (new ol.format.GeoJSON()).readFeatures(config.geoJson, {
                        dataProjection: 'EPSG:4326',
                        featureProjection: ms.getMapProjectionCode()
                    })
                }),
                style: ms.setSegStyle
            })
          });

        return( layer );
    };

    //Clear vms data from layers
    /**
     * Clear vms data from vector layers (VMS positions and segments)
     *
     * @memberof mapService
     * @public
     * @alias clearVmsLayers
     */
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
    /**
     * Create and add map layer to show the printing extent supported by the mapfish print server
     *
     * @memberof mapService
     * @public
     * @alias addPrintLayer
     */
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

    /**
     * Add print extent vector feature to the printing layer
     *
     * @memberof mapService
     * @public
     * @alias addPrintExtent
     */
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
        var printFeature = new ol.Feature(ol.geom.Polygon.fromExtent(geomExtent));

        var layer = ms.getLayerByType('print').getSource();
        layer.clear(true);
        layer.addFeature(printFeature);
    };

    /**
     * Create and add a vector layer to display OSM Nominatim search results
     *
     *  @memberof mapService
     *  @public
     *  @alias addNominatimLayer
     *  @returns {ol.layer.Vector} The OL vector layer
     */
    ms.addNominatimLayer = function(){
        var layer = new ol.layer.Vector({
            type: 'nominatim',
            isBaseLayer: false,
            source: new ol.source.Vector({
                features: []
            }),
            style: ms.setNominatimStyle
        });

        ms.map.addLayer(layer);

        return layer;
    };

    /**
     * Create and add vector layer used to highlight vector features in the map
     *
     * @memberof mapService
     * @public
     * @alias  addFeatureOverlay
     */
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

    /**
     * Highlight feature in the map
     *
     * @memberof mapService
     * @public
     * @alias highlightFeature
     * @param {ol.geom.Geometry} geom - The geometry of the feature to highlight
     */
    ms.highlightFeature = function(geom){
        var feature = new ol.Feature({
            geometry: geom
        });

        var layer = ms.getLayerByType('highlight').getSource();
        layer.clear(true);
        layer.addFeature(feature);
    };

    /**
     * Create and add a vector layer for measurement controls
     *
     * @memberof mapService
     * @public
     * @alias addMeasureLayer
     * @returns {ol.layer.Vector} The OL vector layer
     */
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
    /**
     * Set print style
     *
     * @memberof mapService
     * @public
     * @alias setPrintStyle
     * @param {ol.Feature} feature - The OL feature to style
     * @returns {Array<ol.style.Style>} An array with all styles to be applied
     */
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
    /**
     * Set the highlight style
     *
     * @memberof mapService
     * @public
     * @alias setHighlightStyle
     * @param {ol.Feature} feature - The OL feature to style
     * @param {Number} resolution - The OL view's resolution
     * @returns {Array<ol.style.Style>} An array with all styles to be applied
     */
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
    /**
     * Set the measurement styles
     *
     * @memberof mapService
     * @public
     * @alias setMeasureStyle
     * @param {ol.Feature} feature - The OL feature to style
     * @param {Number} resolution - The OL view's resolution
     * @returns {Array<ol.style.Style>} An array with all styles to be applied
     */
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

    /**
     * Set the Nominatim styles
     *
     * @memberof mapService
     * @public
     * @alias setNominatimStyle
     * @param {ol.Feature} feature - The OL feature to style
     * @param {Number} resolution - The OL view's resolution
     * @returns {Array<ol.style.Style>} An array with all styles to be applied
     */
    ms.setNominatimStyle = function(feature, resolution){
        var style = new ol.style.Style({
            text: new ol.style.Text({
                text: '\uf041',
                font: 'normal 40px FontAwesome',
                offsetY: 4,
                textBaseline: 'bottom',
                textAlign: 'center',
                fill: new ol.style.Fill({
                    color: '#089FD7'
                }),
                stroke: new ol.style.Stroke({
                    color: '#ffffff',
                    width: 5
                })
            })
        });

        return [style];
    };

    //VMS styles
    ms.styles = {
        positions: undefined,
        segments: undefined,
        alarms: undefined,
        activity: {   strokeColor: '#ffffff',
                        strokeWidth: 2,
                        fillColor: '#078dbe',
                        fillOpacity: 0.3,
                    }
    };


    /**
     * Calculate breaks for range classification on VMS data. Stores the breaks under each type style object
     *
     * @memberof mapService
     * @public
     * @alias calculateBreaks
     * @param {String} type - The VMS type. Possible values are: <b>positions</b> or <b>segments</b>
     * @param {Object} style - The style object containing all porperties for the classification of the data
     */
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
    /**
     * Get color definition by Flag State
     *
     * @memberof mapService
     * @public
     * @alias getColorByFlagState
     * @param {Object} src - The source styles object containing all style definitions
     * @param {String} fs - The countryCode of the desired Flag State
     * @returns {String} The hexadecimal color code
     */
    ms.getColorByFlagState = function(src, fs){
        return src.style[fs.toUpperCase()];
    };

    /**
     * Set the displayed flag state codes in the styles object
     *
     * @memberof mapService
     * @public
     * @alias setDisplayedFlagStateCodes
     * @param {String} type - The VMS type. Possible values are: <b>positions</b> or <b>segments</b>
     * @param {Object} data - The data object converted from GeoJSON
     */
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

    /**
     * Get color code for a specific value of a field that is classified by range
     *
     * @memberof mapService
     * @public
     * @alias getColorByRange
     * @param {Object} src - The source styles object containing all style definitions
     * @param {Number} value - The property value to match within an interval
     * @returns {String} The hexadecimal color code
     */
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

    /**
     * Get color code to style fields with discrete classification (such as MovementType, ActivityType, SegmentCategory)
     *
     * @memberof mapService
     * @public
     * @alias getColorByStaticFields
     * @param {Object} src - The source styles object containing all style definitions
     * @param {String} type - The field value
     * @returns {String} The hexadecimal color code
     */
    ms.getColorByStaticFields = function(src, type){
        if (type === ''){
            return src.style['default'];
        } else {
            return src.style[type];
        }
    };

    /**
     * Set the styles object for VMS positions
     *
     * @memberof mapService
     * @public
     * @alias setPositionStylesObj
     * @param {Object} styles - The styles object from report/user preferences
     */
    ms.setPositionStylesObj = function(styles){
        ms.styles.positions = styles;

        var rangeFields = ['reportedSpeed', 'reportedCourse', 'calculatedSpeed'];
        if (_.indexOf(rangeFields, ms.styles.positions.attribute) !== -1){
            ms.calculateBreaks('positions', ms.styles.positions.style);
        }
    };

    /**
     * Get color code for each VMS position according to the styles definitions of report/user preferences
     *
     * @memberof mapService
     * @public
     * @alias getColorForPosition
     * @param {ol.Feature} feature - The OL vector feature
     * @returns {String} The hexadecimal color code
     */
    ms.getColorForPosition = function(feature){
        if (feature.get('isVisible')){
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
        } else {
            return 'rgba(0,0,0,0)';
        }
    };

    /**
     * Get color code for each VMS position according to the styles definitions of report/user preferences without depending on isVisible value.
     *
     * @memberof mapService
     * @public
     * @alias getColorForPositionWithoutIsVisible
     * @param {ol.Feature} feature - The OL vector feature
     * @returns {String} The hexadecimal color code
     */
    ms.getColorForPositionWithoutIsVisible = function(feature){
        switch (ms.styles.positions.attribute) {
            case 'countryCode':
                return ms.getColorByFlagState(ms.styles.positions, feature.get('features')[0].get('countryCode'));
            case 'type':
                return ms.getColorByStaticFields(ms.styles.positions, feature.get('features')[0].get('movementType'));
            case 'activity':
                return ms.getColorByStaticFields(ms.styles.positions, feature.get('features')[0].get('activityType'));
            case 'reportedSpeed':
                return ms.getColorByRange(ms.styles.positions, feature.get('features')[0].get('reportedSpeed'));
            case 'reportedCourse':
                return ms.getColorByRange(ms.styles.positions, feature.get('features')[0].get('reportedCourse'));
            case 'calculatedSpeed':
                return ms.getColorByRange(ms.styles.positions, feature.get('features')[0].get('calculatedSpeed'));
            default:
                return '#0066FF'; //default color
        }
    };

    //OL VMS positions cluster style
    ms.clusterStyles = {};
    ms.currentResolution = undefined;
    ms.clusterMaxFeatureCount = 1;
    ms.clusterMinFeatureCount = 100000;
    ms.vmsSources = {};

    //Calculate necessary max and min amount of features of the available map clusters at each resolution
    /**
     * Calculate the maximum and minimum cluster sizes (number of features inside clusters) at the current map resolution
     *
     * @memberof mapService
     * @public
     * @alias calculateClusterInfo
     */
    ms.calculateClusterInfo = function(){
        var layer = ms.getLayerByType('vmspos');
        var features = layer.getSource().getFeatures();

        angular.forEach(features, function(clusterFeat) {
        	var includedPositions = clusterFeat.get('features');
        	clusterFeat.set('featNumber', includedPositions.length);
        	ms.clusterMaxFeatureCount = Math.max(ms.clusterMaxFeatureCount, includedPositions.length);
            ms.clusterMinFeatureCount = Math.min(ms.clusterMinFeatureCount, includedPositions.length);

            var counter = 0;
            var displayedFeature;
            if (includedPositions.length > 1){
                angular.forEach(includedPositions, function(singleFeat){
                    if (singleFeat.get('isVisible')){
                        counter += 1;
                        displayedFeature = singleFeat;
                    }
                });
            }

            if (counter === 1){
                clusterFeat.set('featureToDisplay', displayedFeature);
            } else {
                clusterFeat.set('featureToDisplay', undefined);
            }

            if (clusterFeat.get('featNumber') !== counter && clusterFeat.get('featNumber') > 1){
                clusterFeat.set('featNumber', counter);
            }
        });
    };

    /**
     * Builds the name of the cluster style
     *
     * @memberof mapService
     * @private
     * @returns {String} The style name to be cached
     */
    var buildStyleName = function(){
        var name = '';
        angular.forEach(ms.vmsSources, function(value, key) {
            if (value === true){
                name += key;
            }
        });

        name.replace(/\s/g, '');
        return name;
    };

    /**
     * Set the cluster styles
     *
     * @memberof mapService
     * @public
     * @alias setClusterStyle
     * @param {ol.Feature} The OL feature to style
     * @param {Number} resolution - The current map view's resolution
     * @returns {Array<ol.style.Style>} An array with all styles to be applied
     */
    ms.setClusterStyle = function(feature, resolution){
        if (!angular.isDefined(feature.get('featNumber'))){
            ms.calculateClusterInfo();
            ms.currentResolution = resolution;
        }
        var size = feature.get('featNumber');
        var inFeatures = feature.get('features');

        var style;
        if (inFeatures.length === 1){ //caso de um cluster so com uma feature
            style = ms.setPosStyle(inFeatures[0]);
        } else {
            if (size === 0){
                style = new ol.style.Style();
            } else if (size === 1){
                style = ms.setPosStyle(feature.get('featureToDisplay'));
            } else {
                var styleName = buildStyleName() + '-' + size;
                style = ms.clusterStyles[styleName];
                if (!style){
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
                    var radius = Math.round((maxRadius - minRadius) * (Math.abs(feature.get('featNumber') - ms.clusterMinFeatureCount)) / (ms.clusterMaxFeatureCount - ms.clusterMinFeatureCount));
                    if (isNaN(radius) || !isFinite(radius) || radius < 0){
                        radius = 0;
                    }
                    radius += minRadius;
                    feature.set('radius', radius);

                    if (!angular.isDefined(size)){
                        var a = 'test';
                    }

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

                    ms.clusterStyles[styleName] = style;
                }
            }
        }

        return [style];
    };

    //Set style for positons when cluster is expanded
    /**
     * Set the style for unclustered style
     *
     * @memberof mapService
     * @public
     * @alias setUnclusteredStyle
     * @param {ol.Feature} The OL feature to style
     * @returns {Array<ol.style.Style>} An array with all styles to be applied
     */
    ms.setUnclusteredStyle = function(feature){
        var positions = feature.get('features');
        if (positions.length > 1){
            var centerCoords = feature.getGeometry().getCoordinates();

            var mapExtent = ms.map.getView().calculateExtent(ms.map.getSize());
            var mapSize = Math.min(ol.extent.getWidth(mapExtent), ol.extent.getHeight(mapExtent));


            var items = positions.length;
            if (positions.length !== feature.get('featNumber')){
                items = feature.get('featNumber');
            }

            var radius = mapSize / 10;
            if (items > 20){
                radius = items * radius / 20;
                if (radius > mapSize / 2.5){
                    radius = mapSize / 2.5;
                }
            }

            var circle = new ol.geom.Circle(centerCoords, radius);
            var circlePoly = ol.geom.Polygon.fromCircle(circle);
            circlePoly.transform(ms.getMapProjectionCode(), 'EPSG:4326');

            var line = turf.linestring(circlePoly.getCoordinates()[0]);

            var length = turf.lineDistance(line, 'radians') / items;

            var styles = [];
            var j = 0;
            for (var i = 0; i < positions.length; i++){
                if (positions[i].get('isVisible')){
                    var pointCoords = ms.pointCoordsToTurf(ol.proj.transform(positions[i].getGeometry().getCoordinates(), ms.getMapProjectionCode(), 'EPSG:4326'));
                    var targetPoint = ms.turfToOlGeom(turf.along(line, length * j, 'radians'));
                    positions[i].set('spiderCoords', targetPoint.getCoordinates(), true);
                    styles.push(ms.setSpiderStyle(positions[i], targetPoint.getCoordinates()));
                    j += 1;
                }
            }

            return _.flatten(styles);
        } else {
            return [ms.setPosStyle(positions[0])];
        }

    };

    /**
     * Set the spider style for unclustered data
     *
     * @memberof mapService
     * @public
     * @alias setSpiderStyle
     * @param {ol.Feature} The OL feature to style
     * @param {ol.Coordinate} pointCoords - The point coordinates in the spider style
     * @returns {Array<ol.style.Style>} An array with all styles to be applied
     */
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

    /**
     * Set the style for VMS positions
     *
     * @memberof mapService
     * @public
     * @alias setPosStyle
     * @param {ol.Feature} The OL feature to style
     * @returns {Array<ol.style.Style>} An array with all styles to be applied
     */
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
            }),
            geometry: function(feature){
                if (angular.isDefined(feature.get('featureToDisplay'))){
                    return new ol.geom.Point(feature.get('featureToDisplay').getGeometry().getCoordinates());
                } else {
                    return feature.getGeometry();
                }
            }
        });

        return style;
    };

    /**
     * Set the styles object for VMS segments
     *
     * @memberof mapService
     * @public
     * @alias setSegmentStylesObj
     * @param {Object} styles - The styles object from report/user preferences
     */
    ms.setSegmentStylesObj = function(styles){
        ms.styles.segments = styles;

        var rangeFields = ['speedOverGround', 'distance', 'courseOverGround'];
        if (_.indexOf(rangeFields, ms.styles.segments.attribute) !== -1){
            ms.calculateBreaks('segments', ms.styles.segments.style);
        }
    };

    /**
     * Get color code for each VMS segment according to the styles definitions of report/user preferences
     *
     * @memberof mapService
     * @public
     * @alias getColorForSegment
     * @param {ol.Feature} feature - The OL vector feature
     * @returns {String} The hexadecimal color code
     */
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

    /**
     * Set the style of VMS segments
     *
     * @memberof mapService
     * @public
     * @alias setSegStyle
     * @param {ol.Feature} The OL feature to style
     * @param {Number} resolution - The current map view's resolution
     * @returns {Array<ol.style.Style>} An array with all styles to be applied
     */
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

        var style;
        if (feature.getGeometry().getLength() > 0){
            style = [
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
        } else {
            style = new ol.style.Style();
        }

        return style;
    };

    /**
     * Set the styles object for VMS alarms
     *
     * @memberof mapService
     * @public
     * @alias setAlarmsStylesObj
     * @param {Object} styles - The styles object from report/user preferences
     */
    ms.setAlarmsStylesObj = function(styles){
        ms.styles.alarms = styles;
    };

    /**
     * Get color code by alarm status
     *
     * @memberof mapService
     * @public
     * @alias getColorByStatus
     * @param {Object} src - The source style object containing style definitions for alarms
     * @param {String} status - The alarm status
     * @returns {String} The hexadecimal color code
     */
    ms.getColorByStatus = function(src, status){
        return src[status.toLowerCase()];
    };

    /**
     * Set the style for the alarms layer
     *
     * @memberof mapService
     * @public
     * @alias setAlarmsStyle
     * @param {ol.Feature} The OL feature to style
     * @returns {Array<ol.style.Style>} An array with all styles to be applied
     */
    ms.setAlarmsStyle = function(feature, resolution){
        var color = ms.getColorByStatus(ms.styles.alarms, feature.get('ticketStatus'));
        var style = new ol.style.Style({
            image: new ol.style.Circle({
                radius: 2 * ms.styles.alarms.size,
                fill: new ol.style.Fill({
                    color: color
                }),
                stroke: new ol.style.Stroke({
                    color: 'white',
                    width: 2
                })
            })
        });

        return [style];
    };

    ms.setActivityStylesObj = function(styles){
        ms.styles.activities = {
            strokeColor: '#ffffff',
            strokeWidth: 2,
            fillColor: '#078dbe',
            fillOpacity: 0.3,
        };
    };

    /**
     * Set the style for the fishing activities layer
     *
     * @memberof mapService
     * @public
     * @alias setActivitiesStyle
     * @param {ol.Feature} The OL feature to style
     * @returns {Array<ol.style.Style>} An array with all styles to be applied
     */
    ms.setActivitiesStyle = function(feature, resolution){
        //FIXME the styles should be dynamic after implementing user preferences
        var style = new ol.style.Style({
            image: new ol.style.Circle({
                radius: 6,
                fill: new ol.style.Fill({
                    color: '#078dbe'
                }),
                stroke: new ol.style.Stroke({
                    color: 'white',
                    width: 2
                })
            })
        });

        return [style];
    };

    //Buffering vector data
    /*ms.addVmsSelectCtrl = function(type){
        //TODO Check if interaction is there
        var layer = ms.getLayerByType('vmspos');
        if (angular.isDefined(layer)){
            var sel = new ol.interaction.Select({
                layers: [layer],
                condition: ol.events.condition.click
            });

            ms.map.addInteraction(sel);
        }
    };*/

    //MAP FUNCTIONS
    /**
     * Clear and remove all vector layers from the map as well as reseting the cluster styles.
     * This function is used before running a new report.
     *
     * @memberof mapService
     * @public
     * @alias clearVectorLayers
     */
	ms.clearVectorLayers = function(){
	    var layers = [ms.getLayerByType('highlight'), ms.getLayerByType('vmspos'), ms.getLayerByType('vmsseg'), ms.getLayerByType('alarms'),ms.getLayerByType('ers')];
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

	/**
	 * Get the first layer with the specified title
	 *
	 * @memberof mapService
	 * @public
	 * @alias getLayerByTitle
	 * @param {String} title - The title of the layer to find
	 * @returns {ol.layer} The OL layer
	 */
	ms.getLayerByTitle = function(title){
	    return genericMapService.getLayerByTitle(title, ms.map);
	};

	/**
     * Get the first layer with the specified type
     *
     * @memberof mapService
     * @public
     * @alias getLayerByType
     * @param {String} type - The type of the layer to find
     * @returns {ol.layer} The OL layer
     */
    ms.getLayerByType = function(type){
        return genericMapService.getLayerByType(type, ms.map);
    };

    /**
     * Calculates the numeric scale of the current view of the map
     *
     * @memberof mapService
     * @public
     * @alias getCurrentScale
     * @returns {Number} The numerical scale
     */
    ms.getCurrentScale = function(){
        return genericMapService.getCurrentScale(ms.map);
    };

    /**
     * Gets the base projection of the map
     *
     * @memberof mapService
     * @public
     * @alias getMapProjectionCode
     * @returns {String} Map base projection code  (e.g. 'EPSG:4326')
     */
    ms.getMapProjectionCode = function(){
        return angular.isDefined(ms.map) ? genericMapService.getMapProjectionCode(ms.map) : undefined;
    };

    /**
     * Force a recalculation of the map viewport size
     *
     * @memberof mapService
     * @public
     * @alias updateMapSize
     * @param {ol.Map} map - The input OL map
     */
    ms.updateMapSize = function(){
        genericMapService.updateMapSize(ms.map);
    };

    /**
     * Update map div container size
     *
     * @memberof mapService
     * @public
     * @alias updateMapContainerSize
     * @param {Event} evt
     */
    ms.updateMapContainerSize = function(evt) {

    	setTimeout(function() {
	        var w = angular.element(window);
	        if(evt && (angular.element('.mapPanelContainer.fullscreen').length > 0 ||
	        		(angular.element('.mapPanelContainer.fullscreen').length === 0 && evt.type.toUpperCase().indexOf("FULLSCREENCHANGE") !== -1))){


	    		$('.map-container').css('height', w.height() + 'px');
	            $('#map').css('height', w.height() + 'px');
	            ms.updateMapSize();
	            return;
	        }

	        var minHeight = 400;
	        var headerHeight = angular.element('header')[0].offsetHeight;
	        var newHeight = w.height() - headerHeight;

	        if (newHeight < minHeight) {
	            newHeight = minHeight;
	        }

	        $('.map-container').css('height', newHeight);
	        $('#map').css('height', newHeight + 'px');

	        ms.updateMapSize();
        }, 100);
  	};

    //GENERIC FUNCTIONS FOR CONTROLS AND STYLES
  	/**
  	 * Convert degrees to radians
  	 *
  	 * @memberof mapService
  	 * @public
  	 * @alias degToRad
  	 * @param {Number} degrees - The input degrees
  	 * @returns {Number} The output radians
  	 */
	ms.degToRad = function(degrees){
	    var rad = degrees * Math.PI / 180;
	    if (isNaN(rad)){
	        rad = 0;
        }
	    return rad;
	};

	/**
	 * Calculates the middle point between the first and last coordinate of a geometry.
	 * To be used with linestring geometries representing segments.
	 *
	 * @memberof mapService
     * @public
     * @alias getMiddlePoint
     * @param {ol.geom.Geometry} geometry - The OL geometry
     * @returns {ol.Coordinate} The coordinates of the middle point
	 */
	ms.getMiddlePoint = function(geometry){
	    var sourceProj = ms.getMapProjectionCode();
	    var p1 = ms.pointCoordsToTurf(ol.proj.transform(geometry.getFirstCoordinate(), sourceProj, 'EPSG:4326'));
	    var p2 = ms.pointCoordsToTurf(ol.proj.transform(geometry.getLastCoordinate(), sourceProj, 'EPSG:4326'));

	    var middlePoint = ms.turfToOlGeom(turf.midpoint(p1, p2));

	    return geometry.getClosestPoint(middlePoint.getCoordinates());
	};

	/**
	 * Calculate the rotation of the arrows added in the segments symbology. Rotation is calculated taking into consideration
	 * the linestring geometry direction
	 *
	 * @memberof mapService
     * @public
     * @alias getRotationForArrow
     * @param {ol.geom.Geometry} geometry - The OL geometry
     * @returns {Number} The rotation
	 */
	ms.getRotationForArrow = function(geometry){
	    var p1 = geometry.getFirstCoordinate();
        var p2 = geometry.getLastCoordinate();

        var dx = p2[0] - p1[0];
        var dy = p2[1] - p1[1];

        return Math.atan2(dy, dx) * -1;
	};

    //SETTERS
    /**
     * Set map projection
     *
     * @memberof mapService
     * @public
     * @alias setProjection
     * @param {Object} proj - The definition of the projection
     * @returns {ol.prol.Projection} The OL projection
     */
	ms.setProjection = function(proj){
	    return genericMapService.setProjection(proj);
	};

	//Set map controls
	ms.addedControls = []; //quick reference to added controls
	/**
	 * Set the controls in the map
	 *
	 * @memberof mapService
     * @public
     * @alias setControls
     * @param {Array} controls - An array containing the controls tha should be added to the map
     * @returns {Array<ol.Collection>} An array containing controls and interactions collections
	 */
	ms.setControls = function(controls){
	    for (var i = 0; i < controls.length; i++){
	        var ctrl = controls[i];
	        ms.addedControls.push(ctrl.type);
	        var fnName = 'add' + ctrl.type.charAt(0).toUpperCase() + ctrl.type.slice(1);
	        ms[fnName](ctrl, true);
	    }

	    //Always add attribution control
	    ms.controls.push(new ol.control.Attribution({
	        className: 'ol-attribution reporting-map',
	        collapsible: false,
	        collapsed: false
	    }));

	    return [new ol.Collection(ms.controls), new ol.Collection(ms.interactions)];
	};

	//Update map controls according to configuration from server
	/**
	 * Update all map controls using configurations from report/user preferences.
	 *
	 * @memberof mapService
     * @public
     * @alias setControls
     * @param {Array} controls - An array containing the controls tha should be added to the map
	 */
	ms.updateMapControls = function(controls){
	    var tempControls = [];
	    var mousecoordsCtrl, scaleCtrl;

	    angular.forEach(controls, function(ctrl){
	        tempControls.push(ctrl.type);
	        if (ctrl.type === 'mousecoords'){
	            mousecoordsCtrl = ctrl;
	            ms.graticuleFormat = mousecoordsCtrl.format;
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
	                ms.graticuleFormat = mousecoordsCtrl.format;
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
                    ms.graticuleFormat = mousecoordsCtrl.format;
                } else if (ctrl === 'scale'){
                    config = scaleCtrl;
                }

                var fnName = 'add' + ctrl.charAt(0).toUpperCase() + ctrl.slice(1);
                ms[fnName](config, false);
	        }, ms);
	    }

	    ms.addedControls = _.union(ctrlsToAdd, ctrlsToUpdate);
	};

	/**
     * Get list of controls by type
     *
     * @memberof mapService
     * @public
     * @alias getControlsByType
     * @param {String} type - The type of the controls to find
     * @returns {Array<ol.control>} The list of controls
     */
	ms.getControlsByType = function(type){
	    return genericMapService.getControlsByType(type, ms.map);
	};

	/**
     * Get list of interactions by type
     *
     * @memberof mapService
     * @public
     * @alias getInteractionsByType
     * @param {String} type - The type of the interactions to find
     * @returns {Array<ol.interaction>} The list of interactions
     */
    ms.getInteractionsByType = function(type){
        return genericMapService.getInteractionsByType(type, ms.map);
    };

    //Get custom interactions by type
    /**
     * @memberof mapService
     * @public
     * @alias getCustomInteraction
     * @param {String} olType - The OL interaction type
     * @param {String} type - The custom type of the interaction
     * @returns {ol.Collection} Collection with custom interactions
     */
    ms.getCustomInteraction = function(olType, type){
        var interactions = ms.map.getInteractions().getArray();
        var ints = interactions.filter(function(int){
            return int instanceof ol.interaction[olType] === true && int instanceof ms[type];
        });

        return ints;
    };

    /**
     * Add zoom controls and interactions to the map
     *
     * @memberof mapService
     * @public
     * @alias addZoom
     * @param {Object} ctrl - An object containing the definitions for controls
     * @param {Boolean} initial - Whether it is the initial setup or an update
     */
	ms.addZoom = function(ctrl, initial){
        var olCtrl = genericMapService.createZoomCtrl('ol-zoom-liveview');

        var iconSpan = document.createElement('span');
        iconSpan.className = 'fa fa-globe';
        var fullExtent = new ol.control.ZoomToExtent({
            label: iconSpan,
            tipLabel: locale.getString('spatial.map_tip_full_extent')
        });

        var interactions = genericMapService.createZoomInteractions();

        if (initial){
            ms.controls.push(olCtrl);
            ms.controls.push(fullExtent);
            ms.interactions = ms.interactions.concat(interactions);
        } else {
            ms.map.addControl(olCtrl);
            ms.map.addControl(fullExtent);
            for (var i = 0; i < interactions.length; i++){
                ms.map.addInteraction(interactions[i]);
            }
        }
	};

	/**
	 * Remove all zoom controls and interactions from map
	 *
	 * @memberof mapService
	 * @public
	 * @alias removeZoom
	 */
	ms.removeZoom = function(){
	    ms.map.removeControl(ms.getControlsByType('Zoom')[0]);
	    ms.map.removeControl(ms.getControlsByType('ZoomToExtent')[0]);
	    ms.map.removeInteraction(ms.getInteractionsByType('MouseWheelZoom')[0]);
	    ms.map.removeInteraction(ms.getInteractionsByType('KeyboardZoom')[0]);
	    ms.map.removeInteraction(ms.getInteractionsByType('DoubleClickZoom')[0]);
	    var zoomInteractions =  ms.getInteractionsByType('DragZoom');
	    for (var i = 0; i < zoomInteractions.length; i++){
	        ms.map.removeInteraction(zoomInteractions[i]);
	    }
	    ms.map.removeInteraction(ms.getInteractionsByType('PinchZoom')[0]);
	};

	/**
	 * Creates and adds the navigation history control to the map
	 *
	 * @memberof mapService
	 * @public
	 * @alias addHistory
	 * @param {Object} ctrl - An object containing the definitions for controls
     * @param {Boolean} initial - Whether it is the initial setup or an update
	 */
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

    /**
     * Removes the navigation history control from the map
     *
     * @memberof mapService
     * @public
     * @alias removeHistory
     */
    ms.removeHistory = function(){
        ms.map.removeControl(ms.getControlsByType('HistoryControl')[0]);
    };

    /**
     * Creates and adds the scale control to the map
     *
     * @memberof mapService
     * @public
     * @alias addHistory
     * @param {Object} ctrl - An object containing the definitions for controls
     * @param {Boolean} initial - Whether it is the initial setup or an update
     */
	ms.addScale = function(ctrl, initial){
	    var olCtrl = genericMapService.addScale(ctrl);

	    if (initial){
	        ms.controls.push(olCtrl);
	    } else {
	        ms.map.addControl(olCtrl);
	    }
	};


	/**
     * Updates the scale control of the map
     *
     * @memberof mapService
     * @public
     * @alias updateScale
     * @param {Object} config - An object containing the scale definitions
     */
	ms.updateScale = function(config){
	    ms.map.removeControl(ms.getControlsByType('ScaleLine')[0]);
        ms.addScale(config, false);
	};

	/**
     * Removes the scale control from the map
     *
     * @memberof mapService
     * @public
     * @alias removeScale
     */
	ms.removeScale = function(){
	    ms.map.removeControl(ms.getControlsByType('ScaleLine')[0]);
	};

	/**
     * Creates and adds all drag related interactions to the map
     *
     * @memberof mapService
     * @public
     * @alias addDrag
     * @param {Object} ctrl - An object containing the definitions for controls
     * @param {Boolean} initial - Whether it is the initial setup or an update
     */
	ms.addDrag = function(ctrl, initial){
	    var interactions = genericMapService.createPanInteractions();
	    if (initial){
	        ms.interactions = ms.interactions.concat(interactions);
	    } else {
	        for (var i = 0; i < interactions.length; i++){
	            ms.map.addInteraction(interactions[i]);
	        }
	    }

	};

	/**
	 * Removes all drag related interactions from the map
	 *
	 * @memberof mapService
     * @public
     * @alias removeDrag
	 */
	ms.removeDrag = function(){
	    ms.map.removeInteraction(ms.getInteractionsByType('DragPan')[0]);
	    ms.map.removeInteraction(ms.getInteractionsByType('KeyboardPan')[0]);
	};

	/**
	 * Create and add Mouse Coordinates control to the map
	 *
	 * @memberof mapService
     * @public
     * @alias addMousecoords
     * @param {Object} ctrl - An object containing the definitions for controls
     * @param {Boolean} initial - Whether it is the initial setup or an update
	 */
	ms.addMousecoords = function(ctrl, initial){
	    var olCtrl = genericMapService.addMousecoords(ctrl, 'map-coordinates');

	    if (initial){
	        ms.controls.push(olCtrl);
	    } else {
	        ms.map.addControl(olCtrl);
	    }
    };

    /**
     * Updates the mouse coordinates control of the map
     *
     * @memberof mapService
     * @public
     * @alias updateMousecoords
     * @param {Object} config - An object containing the scale definitions
     */
    ms.updateMousecoords = function (config){
        ms.map.removeControl(ms.getControlsByType('MousePosition')[0]);
        ms.addMousecoords(config, false);
    };

    /**
     * Removes the mouse coordinates control from the map
     *
     * @memberof mapService
     * @public
     * @alias removeMousecoords
     */
    ms.removeMousecoords = function(){
        ms.map.removeControl(ms.getControlsByType('MousePosition')[0]);
    };

    /**
     * Zoom to a specified geometry
     *
     * @memberof mapService
     * @public
     * @alias zoomTo
     * @param {ol.geom.Geometry} geom - The OL geometry to zoom to
     * @param {Boolean} nearest - Zoom to nearest zoom level possible. Default is <b>false</b>
     */
	ms.zoomTo = function(geom, nearest){
	    var opt = {
	        maxZoom: 19,
	        nearest: false
	    };
	    if (angular.isDefined(nearest)){
	        opt.nearest = nearest;
	    }
	    ms.map.getView().fit(geom, ms.map.getSize(), opt);
	};

	/**
	 * Pan map to specified coordinates
	 *
	 * @memberof mapService
     * @public
     * @alias panTo
     * @param {Array|ol.Coordinates}
	 */
	ms.panTo = function(coords){
	    ms.map.getView().setCenter(coords);
	};

	/**
	 * Add drag interaction for the print extent feature
	 *
	 * @memberof mapService
     * @public
     * @alias addDragPrintExtent
	 */
	ms.addDragPrintExtent = function(){
	    var ctrl = new ms.dragExtent();
	    ms.map.addInteraction(ctrl);
	};

	//Custum drag interaction for print extent
	/**
	 * Creates the custom drag print extent interaction
	 *
	 * @memberof mapService
     * @public
     * @alias dragExtent
	 */
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
	    this._previousCursor = 'default';
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
                    element.style.cursor = this._cursor;
                }
            } else {
                element.style.cursor = this._previousCursor;
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
	/**
	 * Add measure control and start it automatically
	 *
	 * @memberof mapService
	 * @public
	 * @alias startMeasureControl
	 */
	ms.startMeasureControl = function(){
	    var layer = ms.getLayerByType('measure-vector');
        if (angular.isDefined(layer)){
            ms.map.removeLayer(layer);
        }
        layer = ms.addMeasureLayer();
        var draw = new ol.interaction.Draw({
            source: layer.getSource(),
            type: 'LineString',
            condition: function(evt){
                return ol.events.condition.noModifierKeys && evt.originalEvent.button === 0;
            },
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
	/**
	 * Register all draw events for the measure control
	 *
	 * @memberof mapService
	 * @public
	 * @alias registerDrawEvents
	 */
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

	/**
	 * Calculate length over the sphere, bearing and ETA of the measures drawn
	 *
	 *  @memberof mapService
	 *  @public
	 *  @alias calculateLengthAndBearingAndETA
	 *  @param {ol.geom.LineString} line - The OL line geometry
	 *  @returns {Object} An object containing the measured distances, bearing and ETA
	 */
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

	/**
	 * Create the measure tooltips
	 *
	 * @memberof mapService
	 * @public
	 * @alias createMeasureTooltip
	 * @param {Object} data - The object containing the data to be displayed on the tooltip
	 */
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

	/**
     * Remove all measure tooltip overlays
     *
     * @memberof mapService
     * @public
     * @alias clearMeasureOverlays
     */
	ms.clearMeasureOverlays = function(){
	    for (var i = 0; i < ms.measureOverlays.length; i++){
	        ms.map.removeOverlay(ms.measureOverlays[i]);
	    }
	    ms.measureOverlays = [];
	};

	/**
     * Clear the measure control by removing it from the map and destroying all tooltip overlyas
     *
     * @memberof mapService
     * @public
     * @alias clearMeasureControl
     */
	ms.clearMeasureControl = function(){
	    ms.clearMeasureOverlays();
	    ms.map.removeInteraction(ms.measureInteraction);
	    ms.map.removeLayer(ms.getLayerByType('measure-vector'));
	    ms.measureInteraction = {};
	};

	/**
	 * Convert point coordinates to GeoJSON so that they can be used in Turf
	 *
	 * @memberof mapService
	 * @public
	 * @alias pointCoordsToTurf
	 * @param {Array<ol.Coordinate>} coords - An array containing ol.Coordinate
	 * @returns {String} The GeoJSON string of the feature
	 */
	ms.pointCoordsToTurf = function(coords){
	    var geom = new ol.geom.Point(coords);
	    return genericMapService.geomToGeoJson(geom);
	};

	/**
     * Convert GeoJSON to OL feature
     *
     * @memberof mapService
     * @public
     * @alias turfToOlGeom
     * @param {String} feature - The GeoJSON feature
     * @returns {ol.geom.Geometry} The OL geometry already reprojected to the current map projection
     */
	ms.turfToOlGeom = function(feature){
	    var geom = genericMapService.geoJsonToOlGeom(feature);
        return geom.transform('EPSG:4326', ms.getMapProjectionCode());
    };

    //VECTOR LABELS
    //label visibility settings object
    ms.labelVisibility = {
        positions: ['fs', 'extMark', 'ircs', 'cfr', 'name', 'posTime', 'lat', 'lon', 'stat', 'm_spd', 'c_spd', 'crs', 'msg_tp', 'act_tp', 'source'],
        positionsNames: ['fs', 'extMark', 'ircs', 'cfr', 'name', 'posTime', 'lat', 'lon', 'stat', 'm_spd', 'c_spd', 'crs', 'msg_tp', 'act_tp', 'source'],
        positionsTitles: true,
        segments: ['fs', 'extMark', 'ircs', 'cfr', 'name', 'dist', 'dur', 'spd', 'crs', 'cat'],
        segmentsNames: ['fs', 'extMark', 'ircs', 'cfr', 'name', 'dist', 'dur', 'spd', 'crs', 'cat'],
        segmentsTitles: true,
        activities: ['fs', 'ext_mark', 'ircs', 'cfr', 'gfcm', 'iccat', 'uvi', 'name', 'source', 'activityType', 'reportType', 'purposeCode', 'occurrence', 'areas', 'gears', 'species'],
        activitiesTitles: true
    };

    /**
     * Set labels visibility according to the user configurations
     *
     * @memberof mapService
     * @public
     * @alias setLabelVisibility
     * @param {String} type - The label type (either <b>positions</b> or <b>segments</b>)
     * @param {Object} config - The label configuration object
     */
    ms.setLabelVisibility = function(type, config){
        ms.labelVisibility[type] = config.values;
        ms.labelVisibility[type + 'Titles'] = angular.isDefined(config.isAttributeVisible) ? config.isAttributeVisible : false;
        ms.labelVisibility[type + 'ReplacementTitles'] = undefined;

        if(angular.isDefined(config.titles) && config.titles.length > 0){
            var replacements = {};
            angular.forEach(config.titles,function(item){
                var key = item.code;
                replacements[key] = item.title;
            });
            ms.labelVisibility[type + 'ReplacementTitles'] = replacements;
        }

        if(type !== 'activities'){
            ms.labelVisibility[type + 'Names'] = angular.isDefined(config.names) ? config.names : [];
        }
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
       active: false,
       displayedIds: []
    };

    ms.ersLabels = {
        active: false,
        displayedIds: []
    };

    /**
     * Reset all label container objects
     *
     * @memberof mapService
     * @public
     * @alias resetLabelContainers
     */
    ms.resetLabelContainers = function(){
        ms.vmsposLabels = {
            active: false,
            displayedIds: []
        };

        ms.vmssegLabels = {
            active: false,
            displayedIds: []
        };

        ms.ersLabels = {
            active: false,
            displayedIds: []
        };
    };


    /**
     * Check label status and activate them if necessary
     *
     * @memberof mapService
     * @public
     * @alias checkLabelStatus
     */
    //Function called on map moveend and change:resolution to check for new labels
    ms.checkLabelStatus = function(){
        if (ms.vmsposLabels.active === true){
            ms.activateVectorLabels('vmspos');
        }

        if (ms.vmssegLabels.active === true){
            ms.activateVectorLabels('vmsseg');
        }

        if (ms.ersLabels.active === true){
            ms.activateVectorLabels('ers');
        }
    };

    //Activate Vector Label Overlays
    /**
     * Activate vector labels
     *
     * @memberof mapService
     * @public
     * @alias activateVectorLabels
     * @param {String} type - The type of labels to be activated (either <b>positions</b> or <b>segments</b>)
     */
    ms.activateVectorLabels = function(type){
        if ((type === 'vmspos' && ms.labelVisibility.positions.length > 0) ||
                (type === 'vmsseg' && ms.labelVisibility.segments.length > 0) ||
                (type === 'ers' && ms.labelVisibility.activities.length > 0)){
            var containerName = type + 'Labels';
            ms[containerName].active = true;
            ms[containerName].displayedIds = [];

            var layer = ms.getLayerByType(type);

            var extent = ms.map.getView().calculateExtent(ms.map.getSize());
            var size = Math.min.apply(Math, ol.extent.getSize(extent));
            //var resolution = ms.map.getView().getResolution();

            var src = layer.getSource();
            if (type === 'vmsseg'){
                src = src.getSource();
            }
            var overlayId, feat;
            src.forEachFeatureInExtent(extent, function(feature){
                var activeNodes;
                if (type === 'vmspos'){
                    activeNodes = layerPanelService.getChildrenByStatus(true, 'vmspos');
                    var containedFeatures = feature.get('features');
                    if (containedFeatures.length === 1){
                        feat = containedFeatures[0];
                    }

                    if (feature.get('featNumber') === 1 && containedFeatures.length > 1){
                        feat = feature.get('featureToDisplay');
                    }

                    if (angular.isDefined(feat) && feat.get('isVisible')){
                        overlayId = feat.get('overlayId');
                        if (!angular.isDefined(overlayId)){
                            overlayId = ms.generateOverlayId(ms[containerName]);
                        }
                        ms[containerName].displayedIds.push(overlayId);
                        if (_.indexOf(activeNodes, feat.get('source')) !== -1 && (!angular.isDefined(feat.get('overlayHidden')) || (feat.get('overlayHidden') === false && !angular.isDefined(feat.get('overlayId'))))){
                            ms.addLabelsOverlay(feat, type, overlayId);
                        }
                    }
                } else if (type === 'ers'){
                    feat = feature;
                    activeNodes = layerPanelService.getChildrenByStatus(true, 'ers');
                    if (angular.isDefined(feat)){
                        overlayId = feat.get('overlayId');
                        if (!angular.isDefined(overlayId)){
                            overlayId = ms.generateOverlayId(ms[containerName]);
                        }
                        ms[containerName].displayedIds.push(overlayId);
                        if (_.indexOf(activeNodes, feat.get('activityType')) !== -1 && (!angular.isDefined(feat.get('overlayHidden')) || (feat.get('overlayHidden') === false && !angular.isDefined(feat.get('overlayId'))))){
                            ms.addLabelsOverlay(feat, type, overlayId);
                        }
                    }
                } else {
                    //Segments
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

    /**
     * Remove labels when map changes (by zooming or panning)
     *
     * @memberof mapService
     * @public
     * @alias removeLabelsByMapChange
     * @param {String} type - The type of labels to be activated (either <b>positions</b> or <b>segments</b>)
     */
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

    /**
     * Remove labels when map changes (by zooming or panning)
     *
     * @memberof mapService
     * @public
     * @alias deactivateVectorLabels
     * @param {String} type - The type of labels to be deactivated (either <b>positions</b> or <b>segments</b>)
     */
    //Remove all labels when the tool is deactivated
    ms.deactivateVectorLabels = function(type){
        var containerName = type + 'Labels';
        var keys = _.keys(ms[containerName]);
        keys = _.without(keys, 'active', 'displayedIds');

        if (angular.isDefined(keys) && angular.isDefined(ms.map)){
            angular.forEach(keys, function(key) {
                ms.map.removeOverlay(this[key].overlay);
                this[key].feature.set('overlayId', undefined);
                this[key].feature.set('overlayHidden', undefined);
                delete this[key];
            }, ms[containerName]);

            ms[containerName].active = false;
        }
    };

    /**
     * Add label overlay
     *
     * @memberof mapService
     * @public
     * @alias addLabelsOverlay
     * @param {ol.Feature} feature - The OL feature object that will be labeled
     * @param {String} type - The type of label (either <b>vmspos</b> or <b>vmsseg</b>)
     * @param {String} overlayId - The GUID of the overlay
     */
    ms.addLabelsOverlay = function(feature, type, overlayId){
        var coords;
        if (type === 'vmspos'){
            coords = feature.getGeometry().getCoordinates();
        } else if (type === 'ers'){
            coords = feature.getGeometry().getFirstCoordinate();
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

    ms.getLabelAttrName = function(titles,replacementTitles,type,index){
        var name = ms.labelVisibility[type][index];
        var found = false;
        for(var i =0; i < ms.labelVisibility[type+'Names'].length; i++){
            if(name === ms.labelVisibility[type+'Names'][i]){
                found = true;
                break;
            }
        }
        if(found) {
            var title ;
            if(angular.isDefined(replacementTitles)){
                title = replacementTitles[name];
            }
            if(!angular.isDefined(title)){
                title = titles[name];
            }
            return title;
        }
        return '';
    };
    /**
     * Build the label object that will be used with Mustache
     *
     * @memberof mapService
     * @public
     * @alias setLabelObj
     * @param {ol.Feature} feature - The OL feature object
     * @param {String} type - The label type (either <b>vmspos</b> or <b>vmsseg</b>)
     * @param {String} id -  The label GUID
     * @returns {Object} The object containing all the necessary data for the label
     */
    ms.setLabelObj = function(feature, type, id){
        var titles, replacementTitles, srcData, showTitles, i;
        var data = [];
        if (type === 'vmspos'){
            showTitles = ms.labelVisibility.positionsNames.length > 0;
            titles = ms.getPositionTitles();
            replacementTitles = ms.labelVisibility.positionsReplacementTitles;
            srcData = ms.formatPositionDataForPopup(feature.getProperties());

            for (i = 0; i < ms.labelVisibility.positions.length; i++){
                data.push({
                    title: ms.getLabelAttrName(titles,replacementTitles,'positions',i),
                    value: srcData[ms.labelVisibility.positions[i]]
                });
            }
        } else if (type === 'ers'){
            showTitles = ms.labelVisibility.activitiesTitles;
            titles = ms.getActivityTitles();
            srcData = ms.formatActivityDataForPopup(feature.getProperties());

            for (i = 0; i < ms.labelVisibility.activities.length; i++){
                data.push({
                    title: titles[ms.labelVisibility.activities[i]],
                    value: srcData[ms.labelVisibility.activities[i]]
                });
            }
        } else {
            showTitles = ms.labelVisibility.segmentsNames.length > 0;
            replacementTitles = ms.labelVisibility.segmentsReplacementTitles;
            titles = ms.getSegmentTitles();
            srcData = ms.formatSegmentDataForPopup(feature.getProperties());

            for (i = 0; i < ms.labelVisibility.segments.length; i++){
                data.push({
                    title: ms.getLabelAttrName(titles,replacementTitles,'segments',i),
                    value: srcData[ms.labelVisibility.segments[i]]
                });
            }
        }

        if (data.length > 0){
            return {
                id: id,
                data: data,
                includeTitles: showTitles,
                includeTitle: function(){
                    return this.title !== '';
                },
                getTitle: function(){
                    return this.title;
                },
                getValue: function(){
                    return this.value;
                }
            };
        }
    };

    /**
     * Request label template and render it using Mustache
     *
     * @memberof mapService
     * @public
     * @alias requestLabelTemplate
     * @param {String} type - The label type (either <b>vmspos</b> or <b>vmsseg</b>)
     * @param {Object} data - The object containing the data to be displayed in the label
     * @param {Element} el - The html element where the label will be rendered
     */
    ms.requestLabelTemplate = function(type, data, el){
        var templateURL = 'partial/spatial/templates/label.html';
        $templateRequest(templateURL).then(function(template){
            var rendered = Mustache.render(template, data);
            el.innerHTML = rendered;
        }, function(){
            console.log('error getting template');
        });
    };

    /**
     * Close a single label overlay by id
     *
     * @memberof mapService
     * @private
     * @param {String} container - The label container name
     * @param {String} id - The GUID of the label
     */
    var closeLabelOverlay = function(container, id){
        return function(e){
            ms.map.removeOverlay(ms[container][id].overlay);
            ms[container][id].feature.set('overlayId', undefined);
            ms[container][id].feature.set('overlayHidden', true);
            var idx = _.indexOf(ms[container].displayedIds, id);
            if (idx !== -1){
                ms[container].displayedIds.splice(idx, 1);
            }
        };
    };

    /**
     * Generate an overlay id (GUID)
     *
     * @memberof mapService
     * @public
     * @alias generateOverlayId
     * @param {String} container - The label container name
     * @returns {String} The label GUID
     */
    ms.generateOverlayId = function(container){
        var id = generateGUID();

        if (_.has(container, id) === true){
            ms.generateOverlayId(container);
        } else {
            return id;
        }
    };

    /**
     * Generate random GUID
     *
     * @memberof mapService
     * @public
     * @returns {String} The generated GUID
     */
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
    /**
     * Request popup template and render it using Mustache
     *
     * @memberof mapService
     * @public
     * @alias requestPopupTemplate
     * @param {Object} data - The object containing all the necessary information to be displayed in the popup
     * @param {String} type - The type of popup. Supported values are: <b>vmspos</b>, <b>vmsseg</b> and <b>alarms</b>
     * @param {ol.Coordinate} coords - The OL Coordinate where the popup will be attached to
     * @param {Boolean} fromCluster - Whether the popup is being displayed in a feature that is clustered or not
     */
    ms.requestPopupTemplate = function(data, type, coords, fromCluster){
        ms.popupRecContainer.currentType = type;

        if (type === 'ers'){
            ms.popupRecContainer.activityType = data.activityType;
        }

        var templateURL = 'partial/spatial/templates/' + type + '.html';
        $templateRequest(templateURL).then(function(template){
            var rendered = Mustache.render(template, data);
            var content = document.getElementById('popup-content');
            content.innerHTML = rendered;
            ms.overlay.setPosition(coords);
            ms.overlay.set('fromCluster', fromCluster, true);
            if (type === 'vmspos' || type === 'ers'){
                ms.overlay.set('featureId', data.id, true);
                ms.overlay.set('vesselId', data.vesselId, true);
                ms.overlay.set('vesselName', data.vesselName, true);
                ms.overlay.set('repId', data.repId, true);
                if (type === 'ers'){
                    ms.overlay.set('activityId', data.activityId);
                    ms.overlay.set('tripId', data.tripId);
                    ms.overlay.set('isCorrection', data.isCorrection);
                    ms.overlay.set('documentType', data.reportType);
                    ms.overlay.set('activityType', data.activityType);
                }
            } else {
                ms.overlay.set('featureId', undefined, true);
            }
        }, function(){
            console.log('error getting template');
        });
    };

    /**
     * Add OL popup overlay
     *
     * @memberof mapService
     * @public
     * @alias addPopupOverlay
     */
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

	/**
     * Close OL popup overlay
     *
     * @memberof mapService
     * @public
     * @alias closePopup
     */
	ms.closePopup = function(){
	    ms.overlay.set('featureId', undefined, true);
	    ms.overlay.setPosition(undefined);
	    ms.popupRecContainer.reset();
	    return false;
	};

	//Popup visibility settings object
	ms.popupVisibility = {
	    positions: ['fs', 'extMark', 'ircs', 'cfr', 'name', 'posTime', 'lat', 'lon', 'stat', 'm_spd', 'c_spd', 'crs', 'msg_tp', 'act_tp', 'source'],
	    positionsNames: ['fs', 'extMark', 'ircs', 'cfr', 'name', 'posTime', 'lat', 'lon', 'stat', 'm_spd', 'c_spd', 'crs', 'msg_tp', 'act_tp', 'source'],
	    positionsTitles: true,
	    segments: ['fs', 'extMark', 'ircs', 'cfr', 'name', 'dist', 'dur', 'spd', 'crs', 'cat'],
	    segmentsNames: ['fs', 'extMark', 'ircs', 'cfr', 'name', 'dist', 'dur', 'spd', 'crs', 'cat'],
	    segmentsTitles: true,
	    ers: ['fs', 'ext_mark', 'ircs', 'cfr', 'gfcm', 'iccat', 'uvi', 'name', 'source', 'activityType', 'reportType', 'purposeCode', 'occurrence', 'areas', 'gears', 'species'],
	    ersTitles: true
	};

	ms.setPopupVisibility = function(type, config){
	    ms.popupVisibility[type] = config.values;
	    ms.popupVisibility[type + 'Titles'] = angular.isDefined(config.isAttributeVisible) ? config.isAttributeVisible: false;
        ms.popupVisibility[type + 'ReplacementTitles'] = undefined;
        if(angular.isDefined(config.titles) && config.titles.length > 0){
            var replacements = {};
            angular.forEach(config.titles,function(item){
                var key = item.code;
                replacements[key] = item.title;
            });
            ms.popupVisibility[type + 'ReplacementTitles'] = replacements;
        }
	    if(type !== 'ers'){
            ms.popupVisibility[type + 'Names'] = angular.isDefined(config.names) ? config.names : [];
        }
	    if (!angular.isDefined(ms.popupVisibility[type])){
	        ms.popupVisibility[type] = [];
	    }
	};

	//POPUP - decide which function to call so that data is properly formated
	/**
	 * Create object containing all the necessary information to be displayed in the popup
	 *
	 * @memberof mapService
	 * @public
	 * @alias setObjPopup
	 * @param {Object} record - The source record for which a popup will be displayed
	 * @returns {Object} An object containing the necessary information to be displayed in the popup
	 */
	ms.setObjPopup = function(record){
	    var type = record.type;
	    var data;
	    switch (type) {
            case 'vmspos':
                data = ms.setPositionsObjPopup(record.data, record.id);
                break;
            case 'vmsseg':
                data = ms.setSegmentsObjPopup(record.data);
                break;
            case 'ers':
                data = ms.setActivitiesObjPopup(record.data);
                break;
            case 'alarms':
                data = ms.setAlarmsObjPopup(record.data);
                break;
            default:
                break;
        }

	    return data;
	};

	ms.popupRecContainer = {
	    records: [],
	    currentType: undefined,
        currentIdx: undefined,
        reset: function(){
            this.records = [];
            this.currentType = undefined;
            this.currentIdx = undefined;
        }
    };

    ms.getPopupAttrName = function(titles,replacementTitles,type,index){
        var name = ms.popupVisibility[type][index];
        var found = false;
        for(var i =0; i < ms.popupVisibility[type+'Names'].length; i++){
            if(name === ms.popupVisibility[type+'Names'][i]){
                found = true;
                break;
            }
        }
        var title = '';
        if(found) {
            if(angular.isDefined(replacementTitles)){
                title = replacementTitles[name];
            }
            if(!angular.isDefined(title)){
                title = titles[name];
            }
        }
        return title;
    };
	//POPUP - Define the object that will be used in the popup for vms positions
	/**
     * Create object containing all the necessary position information to be displayed in the popup
     *
     * @memberof mapService
     * @public
     * @alias setPositionsObjPopup
     * @param {ol.Feature} feature - The OL feature used to display the popup
     * @param {String} [id] - The id of the feature
     * @returns {Object} An object containing the necessary position information to be displayed in the popup
     */
    ms.setPositionsObjPopup = function(feature, id){
        var titles = ms.getPositionTitles();
        var srcData = ms.formatPositionDataForPopup(feature);
        var showAttrNames = ms.popupVisibility.positionsNames.length > 0;
        var replacementTitles = ms.popupVisibility.positionsReplacementTitles;
        var data = [];
        for (var i = 0; i < ms.popupVisibility.positions.length; i++){
            data.push({
                title: ms.getPopupAttrName(titles,replacementTitles,'positions',i),
                value: srcData[ms.popupVisibility.positions[i]]
            });
        }

        return {
            showTitles: showAttrNames,
            position: data,
            id: id,
            vesselName: feature.name,
            vesselId: feature.connectionId,
            showTitle: function(){
                return this.title !== '';
            },
            getTitle: function(){
                return this.title;
            },
            getValue: function(){
                return this.value;
            }
        };
    };

    //Popup attribute names for positions
    /**
     * Get attributes names for positional data
     *
     * @memberof mapService
     * @public
     * @alias getPositionTitles
     * @returns {Object} An object containing the regionalized attributes for positional data
     */
    ms.getPositionTitles = function(){
        return {
            name: locale.getString('spatial.reports_form_vessel_search_table_header_name'),
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
    /**
     * Format positional data to be displayed in the popup taking into consideration user preferences
     *
     * @memberof mapService
     * @public
     * @alias formatPositionDataForPopup
     * @param {Object} data - The object containing initial data
     * @returns {Object} An object containing properly formated positional data
     */
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

    /**
     * Do the mapping between application object properties and the source data properties
     *
     * @memberof mapService
     * @public
     * @alias getMappingTitlesProperties
     * @param {String} type - The type of data to map (either <b>vmspos</b> or <b>vmsseg</b>)
     * @returns {Object} An object containig the mappings
     */
    ms.getMappingTitlesProperties = function(type){
        if (type === 'vmspos'){
            return {
                name: 'name',
                fs: 'countryCode',
                extMark: 'externalMarking',
                ircs: 'ircs',
                cfr: 'cfr',
                posTime: 'positionTime',
                stat: 'status',
                m_spd: 'reportedSpeed',
                c_spd: 'calculatedSpeed',
                crs: 'reportedCourse',
                msg_tp: 'movementType',
                act_tp: 'activityType',
                source: 'source'
            };
        }
        if (type === 'ers'){
            return {
                name: 'name',
                fs: 'flagState',
                ext_mark: 'EXT_MARK',
                ircs: 'IRCS',
                cfr: 'CFR',
                gfcm: 'GFCM',
                date: 'acceptedDateTime',
                iccat: 'ICCAT',
                uvi: 'UVI',
                source: 'dataSource',
                activityType: 'activityType',
                reportType: 'reportType',
                purposeCode: 'purposeCode',
                occurrence: 'acceptedDateTime',
                areas: 'areas',
                gears: 'gears',
                species: 'species',
                asset:'name'
            };
        }

        if (type === 'vmsseg'){
            return {
                name: 'name',
                fs: 'countrycode',
                extMark: 'externalMarking',
                ircs: 'ircs',
                cfr: 'cfr',
                dist: 'distance',
                dur: 'duration',
                spd: 'speedOverGround',
                crs: 'courseOverGround',
                cat: 'segmentCategory'
            };
        }
    };

    /**
     * Create object containing all the necessary segment information to be displayed in the popup
     *
     * @memberof mapService
     * @public
     * @alias setSegmentsObjPopup
     * @param {ol.Feature} feature - The OL feature used to display the popup
     * @returns {Object} An object containing the necessary position information to be displayed in the popup
     */
    ms.setSegmentsObjPopup = function(feature){
        var titles = ms.getSegmentTitles();
        var srcData = ms.formatSegmentDataForPopup(feature);
        var showAttrNames = ms.popupVisibility.segmentsNames.length > 0;
        var replacementTitles = ms.popupVisibility.segmentsReplacementTitles;
        var data = [];
        for (var i = 0; i < ms.popupVisibility.segments.length; i++){
            data.push({
                title: ms.getPopupAttrName(titles,replacementTitles,'segments',i),
                value: srcData[ms.popupVisibility.segments[i]]
            });
        }

        return {
            showTitles: showAttrNames,
            segment: data,
            showTitle: function(){
                return this.title !== '';
            },
            getTitle: function(){
                return this.title;
            },
            getValue: function(){
                return this.value;
            }
        };
    };

    //Popup attribute names for segments
    /**
     * Get attributes names for segment data
     *
     * @memberof mapService
     * @public
     * @alias getSegmentTitles
     * @returns {Object} An object containing the regionalized attributes for segment data
     */
    ms.getSegmentTitles = function(){
        return {
            name: locale.getString('spatial.reports_form_vessel_search_table_header_name'),
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
    /**
     * Format segment data to be displayed in the popup taking into consideration user preferences
     *
     * @memberof mapService
     * @public
     * @alias formatPositionDataForPopup
     * @param {Object} data - The object containing initial data
     * @returns {Object} An object containing properly formated segment data
     */
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

    //POPUP - alarms
    //Define the object that will be used in the popup for alarms
    /**
     * Create the alarms object that will be used in the popup
     *
     * @memberof mapService
     * @public
     * @alias setAlarmsObjPopup
     * @param {ol.Feature} feature - The OL feature representing the alarm
     * @param {Boolean} includeAsset - Whether the details button should be displayed in the popup or not
     * @returns {Object}
     */
    ms.setAlarmsObjPopup = function(feature, includeAsset){
        if (!angular.isDefined(includeAsset)){
            includeAsset = true;
        }
        var titles = ms.getAlarmTitles();
        var srcData = ms.formatAlarmDataForPopup(feature);

        return {
            alarmTitle: locale.getString('spatial.popup_alarms_title'),
            titles: titles,
            alarm: srcData,
            includeAssetDetails: includeAsset
        };
    };

    //Popup attribute names for alarms
    /**
     * Get attributes names for alarms data
     *
     * @memberof mapService
     * @public
     * @alias getAlarmTitles
     * @returns {Object} An object containing the regionalized attributes for alarms data
     */
    ms.getAlarmTitles = function(){
        return {
            name: locale.getString('spatial.reports_form_vessels_search_by_vessel'),
            fs: locale.getString('spatial.reports_form_vessel_search_table_header_flag_state'),
            extMark: locale.getString('spatial.reports_form_vessel_search_table_header_external_marking'),
            ircs: locale.getString('spatial.reports_form_vessel_search_table_header_ircs'),
            cfr: locale.getString('spatial.reports_form_vessel_search_table_header_cfr'),
            ruleDef: locale.getString('spatial.rule_definition'),
            ruleDesc: locale.getString('spatial.reports_table_header_description'),
            ruleName: locale.getString('spatial.rule_name'),
            openDate: locale.getString('spatial.rule_open_date'),
            updateDate: locale.getString('spatial.rule_update_date'),
            updatedBy: locale.getString('spatial.rule_updated_by')
        };
    };

    /**
     * Format alarm data to be displayed in the popup taking into consideration user preferences
     *
     * @memberof mapService
     * @public
     * @alias formatAlarmDataForPopup
     * @param {Object} data - The object containing initial data
     * @returns {Object} An object containing properly formated alarm data
     */
    ms.formatAlarmDataForPopup = function(data){
        return {
            name: data.name,
            fs: data.fs,
            extMark: data.extMark,
            ircs: data.ircs,
            cfr: data.cfr,
            ruleDef: data.ruleDefinitions,
            ruleDesc: data.ruleDesc,
            ruleName: data.ruleName,
            openDate: unitConversionService.date.convertToUserFormat(data.ticketOpenDate),
            status: data.ticketStatus,
            updateDate: unitConversionService.date.convertToUserFormat(data.ticketUpdateDate),
            updatedBy: data.ticketUpdatedBy,
            color: ms.getColorByStatus(ms.styles.alarms, data.ticketStatus)
        };
    };

    /**
     * Create object containing all the necessary fishing activity information to be displayed in the popup
     *
     * @memberof mapService
     * @public
     * @alias setActivitiesObjPopup
     * @param {ol.Feature} feature - The OL feature used to display the popup
     * @returns {Object} An object containing the necessary position information to be displayed in the popup
     */
    ms.setActivitiesObjPopup = function(feature){
        var titles = ms.getActivityTitles();
        var srcData = ms.formatActivityDataForPopup(feature);

        var data = [];
        for (var i = 0; i < ms.popupVisibility.ers.length; i++){
            data.push({
                title: titles[ms.popupVisibility.ers[i]],
                value: srcData[ms.popupVisibility.ers[i]]
            });
        }

        return {
            showTitles: ms.popupVisibility.ersTitles,
            activity: data,
            vesselName: feature.vesselName,
            vesselId: feature.vesselGuid,
            activityId: parseInt(feature.activityId),
            tripId: feature.tripId,
            isCorrection: feature.isCorrection,
            reportType: feature.reportType,
            activityType: feature.activityType.toLowerCase(),
            repId: parseInt(feature.faReportID),
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

    //Popup attribute names for fishing activities
    /**
     * Get attributes names for activity data
     *
     * @memberof mapService
     * @public
     * @alias getActivityTitles
     * @returns {Object} An object containing the regionalized attributes for activity data
     */
    ms.getActivityTitles = function(){
        return {
            name: locale.getString('spatial.reports_form_details_modal_vessel_name_header'),
            fs: locale.getString('activity.fa_details_item_flag_state'),
            ext_mark: locale.getString('activity.fa_details_item_ext_mark'),
            ircs: locale.getString('activity.fa_details_item_ircs'),
            cfr: locale.getString('activity.fa_details_item_cfr'),
            gfcm: locale.getString('activity.fa_details_item_gfcm'),
            iccat: locale.getString('activity.fa_details_item_iccat'),
            uvi: locale.getString('activity.fa_details_item_uvi'),
            source: locale.getString('spatial.tab_vms_pos_table_header_source'),
            activityType: locale.getString('spatial.reports_form_vms_activity_type'),
            reportType: locale.getString('spatial.reports_form_activity_report_type'),
            purposeCode: locale.getString('spatial.popup_activity_purpose'),
            occurrence: locale.getString('spatial.popup_activity_occurence'),
            areas: locale.getString('spatial.criteria_area'),
            //ports: locale.getString('spatial.layer_tree_ports'),
            gears: locale.getString('spatial.popup_activity_gears'),
            species: locale.getString('spatial.criteria_species')
        };
    };

    //Popup data values for activities
    /**
     * Format segment data to be displayed in the popup taking into consideration user preferences
     *
     * @memberof mapService
     * @public
     * @alias formatActivityDataForPopup
     * @param {Object} data - The object containing initial data
     * @returns {Object} An object containing properly formated activity data
     */
    ms.formatActivityDataForPopup = function(data){
        var filter = $filter('stArrayToString');
        var pCodeDesc = mdrCacheService.getDescriptionByCode('FLUX_GP_PURPOSE', data.purposeCode);

        return {
            fs: data.flagState,
            name: data.vesselName,
            ext_mark: data.EXT_MARK,
            ircs: data.IRCS,
            cfr: data.CFR,
            gfcm: data.GFCM,
            iccat: data.ICCAT,
            uvi: data.UVI,
            source: data.dataSource,
            activityType: data.activityType,
            reportType: data.reportType,
            purposeCode: angular.isDefined(pCodeDesc) ? data.purposeCode + ' - ' + pCodeDesc : data.purposeCode,
            occurrence: unitConversionService.date.convertToUserFormat(data.acceptedDateTime),
            areas: filter(data.areas, ' - '),
            //ports: data.ports,
            gears: filter(data.gears, ' - '),
            species: filter(data.species, ', ')
        };
    };

    ms.getMapExtent = function(){
        return ms.map.getView().calculateExtent(ms.map.getSize());
    };

    //array holding features selected by DragBox
    ms.selectedFeatures = [];

    ms.getSelectedFeatures = function() {
        return ms.selectedFeatures;
    };

    ms.setDragBoxEvent = function(map){
        var dragBox = new ol.interaction.DragBox({
            condition: ol.events.condition.shiftKeyOnly
        });

        map.addInteraction(dragBox);

        // clear selection when drawing a new box and when clicking on the map
        dragBox.on('boxstart', function () {
            ms.selectedFeatures = [];
        });

        ms.wktFormatter = new ol.format.WKT();

        dragBox.on('boxend', function () {
            if (layerPanelService.getLayerTreeStatus('ers')[0] && layerPanelService.getLayerTreeStatus('ers')[0].selected){
                ms.getFeaturesIntersectingExtent(ms.getLayerByType('ers').getSource(), dragBox.getGeometry().getExtent(), "Point", 'ers');
            }
            if (layerPanelService.getLayerTreeStatus('vmspos')[0] && layerPanelService.getLayerTreeStatus('vmspos')[0].selected){
                ms.getFeaturesIntersectingExtent(ms.getLayerByType('vmspos').getSource(), dragBox.getGeometry().getExtent(), "Point", 'vmspos');
            }
            if (layerPanelService.getLayerTreeStatus('vmsseg')[0] && layerPanelService.getLayerTreeStatus('vmsseg')[0].selected){
                ms.getFeaturesIntersectingExtent(ms.getLayerByType("vmsseg").getSource().getSource(), dragBox.getGeometry().getExtent(), "LineString", 'vmsseg');
            }
            ms.resetHighlightedFeatures();
        });
    };

    ms.resetHighlightedFeatures = function() {
        var layer = ms.getLayerByType('highlight').getSource();
        layer.clear(true);
        layer.addFeatures(ms.selectedFeatures);
    };

    ms.getFeaturesIntersectingExtent = function(source, extend, geomType, layer) {
        source.forEachFeatureIntersectingExtent(extend, function (feature) {
            ms.selectedFeatures.push(feature);
            feature.set('layerType', layer);
            feature.getGeometry().set("GeometryType", geomType);
        });
    } ;

    ms.clearFeaturesOfUnselectedLayer = function(layer) {
        ms.selectedFeatures = ms.selectedFeatures.filter(function(feature) {
            return feature.get('layerType') !== layer;
        });
        ms.resetHighlightedFeatures();
    };

    ms.getSelectedFeaturesForExport = function(identifier) {
        var features = {};
        angular.forEach(ms.selectedFeatures, function (feature) {
            var flagStateFolder = ms.defineObjectIfUndefined(features, ms.getFlagState(feature));
            var identifierFolder = ms.defineObjectIfUndefined(flagStateFolder, ms.getIdentifier(feature, identifier));
            ms.pushFeatureInRelevantLayerFolder(identifierFolder, feature);
        });
        var formatter = new ol.format.KML();
        return features;
    };

    ms.defineObjectIfUndefined = function(parent, name) {
        if(!parent[name]) {
            parent[name] = {};
        }
        return parent[name];
    };

    ms.defineArrayIfUndefined = function(parent, name) {
        if(!parent[name]) {
            parent[name] = [];
        }
        return parent[name];
    };

    ms.getFlagState = function(feature) {
        if(feature.get('layerType') === 'ers')  {
            return feature.get('flagState') !== "" ? feature.get('flagState') : "UNKNOWN";
        } else if(feature.get('layerType') === 'vmspos') {
            return feature.get('countryCode') !== "" ? feature.get('features')[0].get('countryCode') : "UNKNOWN";
        } else if(feature.get('layerType') === 'vmsseg') {
            return feature.get('countryCode') !== "" ? feature.get('countryCode') : "UNKNOWN";
        }
    };

    ms.getIdentifier = function(feature, identifier) {
        if(feature.get('layerType') === 'ers')  {
            return identifier.toUpperCase() + ": " + feature.get(identifier.toUpperCase());
        } else if(feature.get('layerType') === 'vmspos') {
            return identifier.toUpperCase() + ": " + feature.get('features')[0].get(identifier.toLowerCase());
        } else if(feature.get('layerType') === 'vmsseg') {
            return identifier.toUpperCase() + ": " + feature.get(identifier.toLowerCase());
        }
    };

    ms.pushFeatureInRelevantLayerFolder = function(parent, feature) {
        var layerFolder;
        if(feature.get('layerType') === 'ers')  {
            layerFolder = ms.defineArrayIfUndefined(parent, 'activities');
            layerFolder.push(ms.activityFeatureToDto(feature));
        } else if(feature.get('layerType') === 'vmspos') {
            layerFolder = ms.defineArrayIfUndefined(parent, 'positions');
            layerFolder.push(ms.positionFeatureToDto(feature));
        } else if(feature.get('layerType') === 'vmsseg') {
            layerFolder = ms.defineArrayIfUndefined(parent, 'segments');
            layerFolder.push(ms.segmentFeatureToDto(feature));
        }
    };

    ms.getTransformedCoordinates = function(feature) {
        var src = 'EPSG:3857';
        var dest = 'EPSG:4326';
        var clonedFeature = feature.clone();
        clonedFeature.getGeometry().transform(src, dest);
        return clonedFeature.getGeometry().getCoordinates();
    };

    ms.positionFeatureToDto = function(feature) {
        var dto = {};

        dto['geometry'] = ms.getTransformedCoordinates(feature).join();
        dto['color'] = ms.getColorForPositionWithoutIsVisible(feature);

        var properties = feature.get('features')[0].getProperties();
        dto['positionTime'] = properties['positionTime'];
        dto['connectionId'] = properties['connectionId'];
        dto['reportedCourse'] = properties['reportedCourse'];
        dto['movementType'] = properties['movementType'];
        dto['reportedSpeed'] = properties['reportedSpeed'];
        dto['cfr'] = properties['cfr'];
        dto['countryCode'] = properties['countryCode'];
        dto['calculatedSpeed'] = properties['calculatedSpeed'];
        dto['ircs'] = properties['ircs'];
        dto['name'] = properties['name'];
        dto['movementGuid'] = properties['movementGuid'];
        dto['externalMarking'] = properties['externalMarking'];
        dto['source'] = properties['source'];
        dto['isVisible'] = properties['isVisible'];
        return dto;
    };

    ms.segmentFeatureToDto = function(feature) {
        var dto = {};

        dto['geometry'] = [];
        angular.forEach(ms.getTransformedCoordinates(feature), function(coordinates) {
            dto['geometry'].push(coordinates.join());
        });
        dto['color'] = ms.getColorForSegment(feature);

        var properties = feature.getProperties();
        dto['cfr'] = properties['cfr'];
        dto['countryCode'] = properties['countryCode'];
        dto['courseOverGround'] = parseInt(properties['courseOverGround']);
        dto['distance'] = parseFloat(properties['distance']);
        dto['duration'] = parseInt(properties['duration']);
        dto['externalMarking'] = properties['externalMarking'];
        dto['ircs'] = properties['ircs'];
        dto['name'] = properties['name'];
        dto['segmentCategory'] = properties['segmentCategory'];
        dto['speedOverGround'] = parseFloat(properties['speedOverGround']);
        dto['trackId'] = properties['trackId'];
        return dto;
    };

    ms.activityFeatureToDto = function(feature) {
        var dto = {};

        dto['geometry'] = ms.getTransformedCoordinates(feature).join();

        var properties = feature.getProperties();
        dto['activityId'] = parseInt(properties['activityId']);
        dto['faReportID'] = parseInt(properties['faReportID']);
        dto['activityType'] = properties['activityType'];
        dto['acceptedDateTime'] = properties['acceptedDateTime'];
        dto['dataSource'] = properties['dataSource'];
        dto['reportType'] = properties['reportType'];
        dto['purposeCode'] = properties['purposeCode'];
        dto['vesselName'] = properties['vesselName'];
        dto['vesselGuid'] = properties['vesselGuid'];
        dto['tripId'] = properties['tripId'];
        dto['flagState'] = properties['flagState'];
        dto['isCorrection'] = properties['isCorrection'];
        dto['gears'] = properties['gears'];
        dto['species'] = properties['species'];
        dto['ports'] = properties['ports'];
        dto['areas'] = properties['areas'];
        var vesselIds = [];
        vesselIds.push({'key' : 'EXT_MARK' , 'value' : properties['EXT_MARK']});
        vesselIds.push({'key' : 'IRCS' , 'value' : properties['IRCS']});
        vesselIds.push({'key' : 'CFR' , 'value' : properties['CFR']});
        vesselIds.push({'key' : 'UVI' , 'value' : properties['UVI']});
        vesselIds.push({'key' : 'ICCAT' , 'value' : properties['ICCAT']});
        vesselIds.push({'key' : 'GFCM' , 'value' : properties['GFCM']});
        dto['vesselIdentifiers'] = vesselIds;
        return dto;
    };

	return ms;
});
