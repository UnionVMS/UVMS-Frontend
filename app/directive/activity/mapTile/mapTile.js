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
 * @ngdoc directive
 * @name mapTile
 * @attr {String} tileTitle - The title of the fieldset tile
 * @attr {String} mapHeight - The height for the div containing the map
 * @attr {Object} mapData - A GeoJSON object conatining the features that should be displayed in the map
 * @description
 *  A reusable tile that will display a map with vectorial spatial data. The base layers are fetched from the user/admin preferences and the vector data should be passed through the model
 */
angular.module('unionvmsWeb').directive('mapTile', function($timeout) {
	return {
		restrict: 'E',
		replace: false,
		controller: 'MapTileCtrl',
		scope: {
		    tileTitle: '@',
		    mapHeight: '@',
		    mapData: '='
		},
		templateUrl: 'directive/activity/mapTile/mapTile.html',
		link: function(scope, element, attrs, fn) {
		    scope.generateMapId();
		    
		    $timeout(function(){
		        if (element.find('#' + scope.mapId)){
		            scope.getMapConfigs();
		        }
		    }, 0); 
		}
	};
})
/**
 * @memberof unionvmsWeb
 * @ngdoc controller
 * @name MapTileCtrl
 * @param $scope {Service} The controller scope
 * @param locale {Service} The angular locale service
 * @param $interval {Service} The angular interval
 * @param genericMapService {Service} The generic map service <p>{@link unionvmsWeb.genericMapService}</p>
 * @param tripSummaryService {Service} The trip summary service <p>{@link unionvmsWeb.tripSummaryService}</p>
 * @param projectionService {Service} The projection service <p>{@link unionvmsWeb.projectionService}</p>
 * @attr {String} mapId - The ID of the div containing the map
 * @attr {ol.Map} map - The OL map object
 * @attr {String} mapHeight - The height for the div containing the map
 * @description
 *  The controller for the mapTile directive ({@link unionvmsWeb.mapTile})
 */
.controller('MapTileCtrl', function($scope, locale, $interval, genericMapService, tripSummaryService, projectionService){
    var self = this;
    $scope.mapHeight = '200';
    
    /**
     * Generates a map id to be used in the div containing the map
     * 
     * @memberof MapTileCtrl
     * @public
     * @alias generateMapId
     * @returns {String} The generated map ID 
     */
    $scope.generateMapId = function(){
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
              .toString(16)
              .substring(1);
        }
        $scope.mapId = 'mapTile-' + s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    };
    
    /**
     * Creates an interval to get the basic configurations for the OL map
     * 
     * @memberof MapTileCtrl
     * @public
     * @alias getMapConfigs
     */
    $scope.getMapConfigs = function(){
        $scope.interval = $interval(function(){
            if (angular.isDefined(tripSummaryService.mapConfigs)){
                stopInterval();
                $scope.createMap();
            }
        }, 1000);
    };
    
    /**
     * Stop the interval that sets up the map
     * 
     * @memberof MapTileCtrl
     * @private
     * @alias stopInterval
     */
    function stopInterval(){
        $interval.cancel($scope.interval);
        delete $scope.interval;
    }
    
    /**
     * Creates the OL map
     * 
     * @memberof MapTileCtrl
     * @public
     * @alias createMap
     */
    $scope.createMap = function(){
        var projObj;
        if (angular.isDefined(tripSummaryService.mapConfigs) && tripSummaryService.mapConfigs.success){
            projObj = tripSummaryService.mapConfigs.projection;
        } else {
            //Fallback mode
            projObj = projectionService.getStaticProjMercator();
        }
        
        var view = genericMapService.createView(projObj);
        var controls = [];
        controls.push(new ol.control.Attribution({
            collapsible: false,
            collapsed: false
        }));
        
        controls.push(genericMapService.createZoomCtrl());
        
        var interactions = genericMapService.createZoomInteractions();
        interactions = interactions.concat(genericMapService.createPanInteractions());
        
        $scope.map = new ol.Map({
            target: $scope.mapId,
            controls: controls,
            interactions: interactions,
            logo: false
        });
        
        $scope.map.beforeRender(function(map){
            map.updateSize();
        });
        
        $scope.map.setView(view);
        addBaseLayers();
        
        var layers = $scope.map.getLayers();
        if (layers.getLength() > 1){
            var switcher = new ol.control.LayerSwitcher({
                controlClass: 'left-side-up'
            });
            $scope.map.addControl(switcher);
        }
        
        if (angular.isDefined($scope.mapData)){
            var layer = createVectorLayer();
            addVectorData(layer);
        }
    };
    
    /**
     * Add base layers to the map
     * 
     * @memberof MapTileCtrl
     * @private
     */
    function addBaseLayers(){
        if (!tripSummaryService.mapConfigs.success){
            addOSM();
        } else {
            angular.forEach(tripSummaryService.mapConfigs.layers.baseLayers, function(layerConf) {
                switch (layerConf.type) {
                    case 'OSM':
                        addOSM(layerConf);
                        break;
                    case 'WMS':
                        addWMS(layerConf);
                        break;
                    case 'BING':
                        layerConf.title = locale.getString('spatial.layer_tree_' + layerConf.title);
                        addBing(layerConf);
                        break;
                }
            });
        }
    }
    
    /**
     * Add OSM layer to the map
     * 
     * @memberof MapTileCtrl
     * @private
     * @param {Object} [config={}] - The object containing the layer definitions
     */
    function addOSM(config){
        if (!angular.isDefined(config)){
            config = {};
        }
        var layer = genericMapService.defineOsm(config);
        layer.set('switchertype', 'base'); //Necessary for the layerswitcher control
        $scope.map.addLayer(layer);
    }
    
    /**
     * Add WMS layers to the map
     * 
     * @memberof MapTileCtrl
     * @private
     * @param {Object} [config={}] - The object containing the layer definitions
     */
    function addWMS(config){
        var configObj = genericMapService.getBaseLayerConfig(config, $scope.map);
        var layer = genericMapService.defineWms(configObj);
        layer.set('switchertype', 'base'); //Necessary for the layerswitcher control
        
        $scope.map.addLayer(layer);
    }
    
    /**
     * Add Bing layers to the map
     * 
     * @memberof MapTileCtrl
     * @private
     * @param {Object} [config={}] - The object containing the layer definitions
     */
    function addBing(config){
        if (!angular.isDefined(config)){
            config = {};
        }
        var layer = genericMapService.defineBing(config);
        layer.set('switchertype', 'base'); //Necessary for the layerswitcher control
        $scope.map.addLayer(layer);
    }
    
    /**
     * Create vector layer and add it to the map
     * 
     * @memberof MapTileCtrl
     * @private
     * @returns {ol.layer.Vector} The OL vector layer
     */
    function createVectorLayer(){
        var layer = new ol.layer.Vector({
            isBaseLayer: false,
            source: new ol.source.Vector(),
            style: new ol.style.Style({
                image: new ol.style.Circle({
                    radius: 5,
                    fill: new ol.style.Fill({
                        color:'rgba(31,119,180,1)'
                    }),
                    stroke: new ol.style.Stroke({
                        color:'rgb(255,255,255)',
                        width: 2
                    })
                })
            })
        });
        
        $scope.map.addLayer(layer);
        self.registerZoomToExtentListener(layer);
        
        return layer;
    }
    
    /**
     * Add vector data to the vector layer
     * 
     * @memberof MapTileCtrl
     * @private
     * @param {ol.layer.Vector} layer - The OL vector layer
     */
    function addVectorData(layer){
        var features = (new ol.format.GeoJSON()).readFeatures($scope.mapData, {
            dataProjection: 'EPSG:4326',
            featureProjection: genericMapService.getMapProjectionCode($scope.map)
        });
        
        layer.getSource().addFeatures(features);
    }
    
    /**
     * Register listener that will zoom to the extent of the vector source data
     * 
     * @memberof MapTileCtrl
     * @public
     * @alias registerZoomToExtentListener
     * @param {ol.layer.Vector} layer - The OL vector layer
     */
     this.registerZoomToExtentListener = function(layer){
        var src = layer.getSource();
        
        var changeListenerKey = src.on('change', function(){
            if (src.getState() === 'ready' && src.getFeatures().length > 0){
                var extent = src.getExtent();
                var geom = new ol.geom.Polygon.fromExtent(extent);
                
                $scope.map.getView().fit(geom, $scope.map.getSize(), {
                    maxZoom: 19,
                    nearest: false
                });
                
                ol.Observable.unByKey(changeListenerKey);
            }
        });
    };
    
    $scope.$on('$destroy', function(){
        if (angular.isDefined($scope.interval)){
            stopInterval();
        }
    });
});

