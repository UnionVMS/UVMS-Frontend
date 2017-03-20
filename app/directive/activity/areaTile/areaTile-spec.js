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
describe('areaTile', function() {

    beforeEach(module('unionvmsWeb'));

    var scope, compile, $httpBackend, mockMapServ;
    
    beforeEach(function(){
        mockMapServ = jasmine.createSpyObj('mapService', ['zoomTo', 'getMapProjectionCode']);
        
        module(function($provide){
            $provide.value('mapService', mockMapServ);
        });
    });

    beforeEach(inject(function($rootScope, $compile, $injector) {
        scope = $rootScope.$new();
        compile = $compile;
        if (!angular.element('#parent-container').length) {
            var parentElement = angular.element('<div id="parent-container"></div>');
            parentElement.appendTo('body');
        }
        $httpBackend = $injector.get('$httpBackend');;
        $httpBackend.whenGET(/usm/).respond();
        $httpBackend.whenGET(/i18n/).respond();
        $httpBackend.whenGET(/globals/).respond({
            data: []
        });
    }));

    afterEach(function() {
        angular.element('area-tile').remove();
    });
    
    function mockService(){
        mockMapServ.getMapProjectionCode.andCallFake(function(){
            return 'EPSG:4326'
        });
    }

    function buildMockData() {
        return {
            "areaData": {
                "transmission": {
                    "occurence": "2018-04-04T19:50:58",
                    "geometry": new ol.geom.Point([-43.18354, -32.38937]),
                    "long": -43.18354,
                    "lat": -32.38937
                },
                "crossing": {
                    "occurence": "2017-06-08T11:01:35",
                    "geometry": new ol.geom.Point([39.474, -87.1144]),
                    "long": 39.474,
                    "lat": -87.1144
                },
                "startFishing": {
                    "occurence": "2017-08-15T23:32:33",
                    "geometry": new ol.geom.Point([164.33991, 0.49033]),
                    "long": 164.33991,
                    "lat": 0.49033
                },
                "startActivity": {
                    "occurence": "2017-11-07T03:00:30",
                    "geometry": new ol.geom.Point([-121.98674, 26.40755]),
                    "long": -121.98674,
                    "lat": 26.40755
                }
            },
            "title": "Entry into Area",
            "number": 3
        }

    }

    it('should render area tile and the properties should be defined', inject(function() {
        scope.ngModel = buildMockData();

        tile = compile('<area-tile ng-model="ngModel"></area-tile>')(scope);
        tile.appendTo('#parent-container');
        scope.$digest();

        var testScope = tile.isolateScope();
        expect(testScope.ngModel).toBeDefined();

        expect(angular.element('area-tile').length).toBe(1);
        expect(angular.element(tile).find('.area-subsection').length).toEqual(4);
        expect(angular.element(tile).find('.is-clickable').length).toEqual(0);
        tile.isolateScope().$destroy();
    }));
    
    it('should render the tile with clickable areas', function(){
        scope.ngModel = buildMockData();
        
        tile = compile('<area-tile ng-model="ngModel" is-clickable="true"></area-tile>')(scope);
        tile.appendTo('#parent-container');
        scope.$digest(); 
        
        expect(angular.element(tile).find('.is-clickable').length).toEqual(4);
    });
    
    it('should render the tile with clickable areas only if geometry is defined', function(){
        scope.ngModel = buildMockData();
        scope.ngModel.areaData.transmission.geometry = null;
        
        tile = compile('<area-tile ng-model="ngModel" is-clickable="true"></area-tile>')(scope);
        tile.appendTo('#parent-container');
        scope.$digest(); 
        
        expect(angular.element(tile).find('.is-clickable').length).toEqual(3);
    });
    
    it('should zoom to an area when it is clickable', function(){
        scope.ngModel = buildMockData();
        mockService();
        
        tile = compile('<area-tile ng-model="ngModel" is-clickable="true"></area-tile>')(scope);
        tile.appendTo('#parent-container');
        scope.$digest();
        
        angular.element(tile).find('.is-clickable').eq(0).click();
        expect(mockMapServ.zoomTo).toHaveBeenCalled();
        expect(mockMapServ.zoomTo.mostRecentCall.args[0] instanceof ol.geom.Point).toBeTruthy();
    });
    
    it('should zoom to an area with a buffer applied when it is clickable', function(){
        scope.ngModel = buildMockData();
        mockService();
        
        tile = compile('<area-tile ng-model="ngModel" buffer-dist="1000" is-clickable="true"></area-tile>')(scope);
        tile.appendTo('#parent-container');
        scope.$digest();
        
        angular.element(tile).find('.is-clickable').eq(0).click();
        expect(mockMapServ.zoomTo).toHaveBeenCalled();
        expect(mockMapServ.zoomTo.mostRecentCall.args[0] instanceof ol.geom.Polygon).toBeTruthy();
    });
    
    it('should zoom to an area and call the click callback function', function(){
        scope.ngModel = buildMockData();
        scope.clickCallback = function(){return true};
        mockService();
        
        tile = compile('<area-tile ng-model="ngModel" click-callback="clickCallback" is-clickable="true"></area-tile>')(scope);
        tile.appendTo('#parent-container');
        scope.$digest();
        
        var isolatedScope = tile.isolateScope();
        spyOn(isolatedScope, 'clickCallback');
        
        angular.element(tile).find('.is-clickable').eq(0).click();
        expect(isolatedScope.clickCallback).toHaveBeenCalled();
        isolatedScope.$destroy();
    });
});