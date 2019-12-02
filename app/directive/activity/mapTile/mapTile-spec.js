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
describe('mapTile', function() {

    beforeEach(module('unionvmsWeb'));
    
    var scope, mockTripSumServ, $interval, el, controller,$httpBackend;
    
    beforeEach(function(){
        mockTripSumServ = jasmine.createSpyObj('tripSummaryService', ['mapConfigs']);
        
        module(function($provide){
            $provide.value('tripSummaryService', mockTripSumServ);
        });
    });
    
    beforeEach(inject(function($rootScope, $injector, _$interval_, $controller){
        $httpBackend = $injector.get('$httpBackend');
        $httpBackend.whenGET(/usm/).respond();
        $httpBackend.whenGET(/i18n/).respond();
        $httpBackend.whenGET(/globals/).respond({data : []});
        
        scope = $rootScope.$new();
        
        controller = $controller('MapTileCtrl', {
            $scope: scope
        }); 
    }));
    
    describe('Testing the controller: MapTileCtrl', function(){
        beforeEach(inject(function(_$interval_){
            $interval = _$interval_;
        }));
        
        it('should have default mapHeight defined', function(){
            expect(scope.mapHeight).toEqual('200');
            expect(scope.mapId).not.toBeDefined();
        });
        
        it('should generate an id for the map div', function(){
            scope.generateMapId();
            expect(scope.mapId).toBeDefined();
        });
        
        it('should create a map with fallback configurations', function(){
            controller.registerZoomToExtentListener = jasmine.createSpy('registerZoomToExtentListener');
            mockTripSumServ.mapConfigs = {success: false};
            
            scope.mapId = 'mapTile';
            scope.mapData = buildVectorData();
            scope.getMapConfigs();
            $interval.flush(1000);
            
            expect(scope.map).toBeDefined();
            expect(scope.map.getView().getProjection().getCode()).toEqual('EPSG:3857');
            expect(scope.map.getLayers().getLength()).toEqual(2);
            var layer = scope.map.getLayers().getArray()[1];
            var features = layer.getSource().getFeatures();
            expect(layer).toEqual(jasmine.any(ol.layer.Vector));
            expect(features).toEqual(jasmine.any(Array));
            expect(features.length).toEqual(2);
        });
        
        it('should get map configurations from trip service and create the map without vector data', function(){
            mockTripSumServ.mapConfigs = buildMapConfigs();
            scope.mapId = 'mapTile';
            scope.getMapConfigs();
            $interval.flush(1000);
            
            expect(scope.map).toBeDefined();
            expect(scope.map.getView().getProjection().getCode()).toEqual('EPSG:3857');
            expect(scope.map.getLayers().getLength()).toEqual(4);
            var layer = scope.map.getLayers().getArray()[3];
            var features = layer.getSource().getFeatures();
            expect(layer).toEqual(jasmine.any(ol.layer.Vector));
            expect(features).toEqual(jasmine.any(Array));
            expect(features.length).toEqual(0);
        });
        
        it('should create a map with vector data', function(){
            controller.registerZoomToExtentListener = jasmine.createSpy('registerZoomToExtentListener');
            mockTripSumServ.mapConfigs = buildMapConfigs();
            scope.mapId = 'mapTile';
            scope.mapData = buildVectorData();
            scope.getMapConfigs();
            $interval.flush(1000);
            
            expect(scope.map).toBeDefined();
            expect(scope.map.getView().getProjection().getCode()).toEqual('EPSG:3857');
            expect(scope.map.getLayers().getLength()).toEqual(4);
            var layer = scope.map.getLayers().getArray()[3];
            var features = layer.getSource().getFeatures();
            expect(layer).toEqual(jasmine.any(ol.layer.Vector));
            expect(features).toEqual(jasmine.any(Array));
            expect(features.length).toEqual(2);
        });
        
        it('should create a map with vector data and clear the vector data', function(){
            controller.registerZoomToExtentListener = jasmine.createSpy('registerZoomToExtentListener');
            mockTripSumServ.mapConfigs = buildMapConfigs();
            scope.mapId = 'mapTile';
            scope.mapData = buildVectorData();
            scope.getMapConfigs();
            $interval.flush(1000);
            scope.clearVectorData();
            
            expect(scope.map).toBeDefined();
            expect(scope.map.getView().getProjection().getCode()).toEqual('EPSG:3857');
            expect(scope.map.getLayers().getLength()).toEqual(4);
            var layer = scope.map.getLayers().getArray()[3];
            var features = layer.getSource().getFeatures();
            expect(layer).toEqual(jasmine.any(ol.layer.Vector));
            expect(features).toEqual(jasmine.any(Array));
            expect(features.length).toEqual(0);
        });
    });
    
    describe('Testing the directive: mapTile', function(){
        beforeEach(inject(function($compile){
            scope.tileTitle = 'Tile';
            scope.mapHeight = '300';
            scope.mapData = buildVectorData();
            
            el = angular.element('<map-tile tile-title="tileTitle" map-data="mapData" map-height="mapHeight"></div>');
            $compile(el)(scope);
            scope.$digest();
        }));
        
        it('should generate the directive with a legend and map html elements', function(){
            var testScope = el.isolateScope();
            expect(testScope.mapId).toBeDefined();
            expect(el.find('legend')).toBeDefined();
            expect(el.find('#' + testScope.mapId)).toBeDefined();
        });
    });
    
    function buildVectorData(){
        var geojson = {
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "geometry": {
                        "type": "MultiPoint",
                        "coordinates": [[-9.5, 39],[-7.5, 42.5]]
                    },
                    "properties": {}
                },{
                    "type": "Feature",
                    "geometry": {
                        "type": "MultiPoint",
                        "coordinates": [[-8.5, 38.8],[-8.5, 40.5]]
                    },
                    "properties": {}
                }
            ]
        };
        
        return angular.fromJson(geojson);
    }
    
    function buildMapConfigs(){
        var configs = {
            "projection": {
                "epsgCode": 3857,
                "units": "m",
                "global": true,
                "extent": "-20026376.39;-20048966.10;20026376.39;20048966.10",
                "axis": "enu",
                "projDef": "+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs",
                "worldExtent": "-180;-89.99;180;89.99"
            },
            "layers": {
                "baseLayers": [
                    {
                        "type": "BING",
                        "title": "bing_aerial",
                        "isBaseLayer": true,
                        "layerGeoName": "Aerial",
                        "apiKey": "Ak3IP_0UhIvAVSr45qPJK0IWNNXlpcicIyjcKaz-3duMJX0TE1xX18nM7q6kGe-u",
                        "typeName": "BINGAREAL"
                    },
                    {
                        "type": "WMS",
                        "title": "Countries",
                        "isBaseLayer": true,
                        "shortCopyright": "&copy; <b>Countries</b>: EuroGeographics for the administrative boundaries.",
                        "longCopyright": "&copy; EuroGeographics for the administrative boundaries",
                        "url": "http://localhost:8080/geoserver-postgres/wms",
                        "serverType": "geoserver",
                        "layerGeoName": "uvms:countries",
                        "styles": {
                            "geom": "countries",
                            "label": "countries_label",
                            "labelGeom": "countries_label_geom"
                        },
                        "typeName": "COUNTRY"
                    },
                    {
                        "type": "OSM",
                        "title": "OpenStreetMap",
                        "isBaseLayer": true,
                        "typeName": "OSM"
                    }
                ]
            },
            "success": true
        };
        
        return angular.fromJson(configs);
    }
});
