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
describe('locationTile', function() {
    var scope,compile,tile,$httpBackend,mockMapServ;
    
    beforeEach(module('unionvmsWeb'));
    
    beforeEach(function(){
        mockMapServ = jasmine.createSpyObj('mapService', ['zoomTo']);
        
        module(function($provide){
            $provide.value('mapService', mockMapServ);
        });
    });
    
    beforeEach(inject(function($rootScope, $compile, $injector) {
        scope = $rootScope.$new();
        compile = $compile;
        
        if(!angular.element('#parent-container').length){
            var parentElement = angular.element('<div id="parent-container"></div>');
            parentElement.appendTo('body');
        }
        
        $httpBackend = $injector.get('$httpBackend');;
        $httpBackend.whenGET(/usm/).respond();
        $httpBackend.whenGET(/i18n/).respond();
        $httpBackend.whenGET(/globals/).respond({data : []});
    }));
    
    function buildSingleMock(){
        return {
            name: 'BEZEE -  Zeebrugge',
            geometry: 'POINT(5.5 60.5)'
        };
    }
    
    function buildMultipleMock(){
        return [{
            name: '39F6-27.4.b.XEU',
            geometry: 'POINT(5.5 60.5)'
        }, {
            name: '39F6-27.4.a.XEU',
            geometry: 'POLYGON ((30 10, 10 20, 20 40, 40 40, 30 10))'
        }];
    }
    
    describe('testing the directive: locationTile', function(){
        afterEach(function(){
            angular.element('location-tile').remove();
        });
        
        it('should render the location tile with a single location', function(){
            scope.locationDetails = buildSingleMock();
            
            tile = compile('<location-tile field-title="single" location-details="locationDetails"></location-tile>')(scope);
            tile.appendTo('#parent-container');
            scope.$digest(); 
            
            expect(angular.element('location-tile').length).toBe(1);
            expect(angular.element('legend').children().text()).toEqual('single');
            expect(angular.element('.name').text()).toEqual(scope.locationDetails.name);
        });
        
        it('should render the location tile with multiple locations', function(){
            scope.locationDetails = buildMultipleMock();
            
            tile = compile('<location-tile field-title="multiple" multiple="true" location-details="locationDetails"></location-tile>')(scope);
            tile.appendTo('#parent-container');
            scope.$digest();
            
            expect(angular.element('location-tile').length).toBe(1);
            expect(angular.element('legend').children().text()).toEqual('multiple');
            expect(angular.element('li').length).toBe(2);
            expect(angular.element('li').eq(0).text()).toEqual(scope.locationDetails[0].name);
            expect(angular.element('li').eq(1).text()).toEqual(scope.locationDetails[1].name);
        });
        
        it('should render the location tile with a single location when the locationDetails is an array composed by a single item', function(){
            scope.locationDetails = buildMultipleMock();
            scope.locationDetails.shift();
            
            tile = compile('<location-tile field-title="single" multiple="true" location-details="locationDetails"></location-tile>')(scope);
            tile.appendTo('#parent-container');
            scope.$digest();
            
            expect(angular.element('location-tile').length).toBe(1);
            expect(angular.element('legend').children().text()).toEqual('single');
            expect(angular.element('.name').text()).toEqual(scope.locationDetails[0].name);
        });
        
        it('should render the location tile with a single clickable location', function(){
            scope.locationDetails = buildSingleMock();
            
            tile = compile('<location-tile field-title="single" is-clickable="true" location-details="locationDetails"></location-tile>')(scope);
            tile.appendTo('#parent-container');
            scope.$digest(); 
            
            expect(angular.element('.clickable').length).toBe(1);
        });
        
        it('should render the location tile with multiple clickable locations', function(){
            scope.locationDetails = buildMultipleMock();
            
            tile = compile('<location-tile field-title="multiple" is-clickable="true" multiple="true" location-details="locationDetails"></location-tile>')(scope);
            tile.appendTo('#parent-container');
            scope.$digest(); 
            
            expect(angular.element('.item-clickable').length).toBe(2);
        });
        
        it('should render the location tile with multiple locations, but only some of them should be clickable', function(){
            scope.locationDetails = buildMultipleMock();
            scope.locationDetails[0].geometry = undefined;
            
            tile = compile('<location-tile field-title="multiple" is-clickable="true" multiple="true" location-details="locationDetails"></location-tile>')(scope);
            tile.appendTo('#parent-container');
            scope.$digest(); 
            
            expect(angular.element('.item-clickable').length).toBe(1);
        });
        
        it('should render the location tile with no data message when locationDetails is an object', function(){
            scope.locationDetails = {};
            
            tile = compile('<location-tile field-title="nodata" multiple="false" location-details="locationDetails"></location-tile>')(scope);
            tile.appendTo('#parent-container');
            scope.$digest(); 
            
            expect(angular.element('.no-data').length).toBe(1);
        });
        
        it('should render the location tile with no data message when locationDetails is an array', function(){
            scope.locationDetails = [];
            
            tile = compile('<location-tile field-title="nodata" multiple="true" location-details="locationDetails"></location-tile>')(scope);
            tile.appendTo('#parent-container');
            scope.$digest(); 
            
            expect(angular.element('.no-data').length).toBe(1);
        });
    });
    
    describe('testing the controller: LocationTileCtrl', function(){
        beforeEach(inject(function($controller) {
            controller = $controller('LocationTileCtrl', {
                $scope: scope
            });
        }));
        
        it('should properly detect if the locationDetails contains data', function(){
            scope.multiple = false;
            scope.locationDetails = buildSingleMock();
            var test = scope.hasData();
            expect(test).toBeTruthy();
            
            scope.locationDetails = {};
            test = scope.hasData();
            expect(test).toBeFalsy();
            
            scope.multiple = true;
            scope.locationDetails = buildMultipleMock();
            test = scope.hasData()
            expect(test).toBeTruthy();
            
            scope.locationDetails = [];
            test = scope.hasData()
            expect(test).toBeFalsy();
        });
        
        it('should properly check if the directive is multiple or not', function(){
            scope.multiple = false;
            var test = scope.checkIsMultiple();
            expect(test).toBeFalsy();
            
            scope.locationDetails = buildMultipleMock();
            scope.multiple = true;
            test = scope.checkIsMultiple();
            expect(test).toBeTruthy();
            
            scope.locationDetails.shift();
            test = scope.checkIsMultiple();
            expect(test).toBeFalsy();
        });
        
        it('should not be clickable', function(){
            scope.isClickable = false;
            var test = scope.isItemClickable();
            expect(test).toBeFalsy();
        });
        
        it('should properly check if a single position is clickable', function(){
            scope.isClickable = true;
            scope.multiple = false;
            scope.locationDetails = buildSingleMock();
            
            var test = scope.isItemClickable();
            expect(test).toBeTruthy();
            
            scope.locationDetails.geometry = undefined;
            var test = scope.isItemClickable();
            expect(test).toBeFalsy();
        });
        
        it('should properly check if multiple positions are clickable', function(){
            scope.isClickable = true;
            scope.multiple = true;
            scope.locationDetails = buildMultipleMock();
            scope.locationDetails[1].geometry = undefined;
            
            var test = scope.isItemClickable(scope.locationDetails[0]);
            expect(test).toBeTruthy();
            
            var test = scope.isItemClickable(scope.locationDetails[1]);
            expect(test).toBeFalsy();
        });
        
        it('should zoom to a single location when it is clickable', function(){
            scope.locationDetails = buildSingleMock();
            scope.isClickable = true;
            scope.mulitple = false;
            
            scope.zoomToLocation();
            expect(mockMapServ.zoomTo).toHaveBeenCalled();
        });
        
        it('should zoom to the first location when it is clickable and no item is specified', function(){
            scope.locationDetails = buildMultipleMock();
            scope.isClickable = true;
            scope.multiple = true;
            
            scope.zoomToLocation();
            expect(mockMapServ.zoomTo).toHaveBeenCalled();
            expect(mockMapServ.zoomTo.mostRecentCall.args[0] instanceof ol.geom.Point).toBeTruthy();
        });
        
        it('should zoom to a specified point location and apply a buffer to calculate the extent of the zoom', function(){
            scope.locationDetails = buildMultipleMock();
            scope.isClickable = true;
            scope.multiple = true;
            scope.bufferDist = 5000;
            
            scope.zoomToLocation(scope.locationDetails[0]);
            expect(mockMapServ.zoomTo).toHaveBeenCalled();
            expect(mockMapServ.zoomTo.mostRecentCall.args[0] instanceof ol.geom.Polygon).toBeTruthy();        
        });
        
        it('should not zoom to a location if it is not clickable', function(){
            scope.locationDetails = buildSingleMock();
            scope.isClickable = false;
            scope.multiple = false;
            
            scope.zoomToLocation();
            expect(mockMapServ.zoomTo).not.toHaveBeenCalled();
        });
        
        it('should call the click callback function when zoooming to the location', function(){
            scope.locationDetails = buildSingleMock();
            scope.isClickable = true;
            scope.multiple = false;
            scope.clickCallback = jasmine.createSpy('clickCallback');
            
            scope.zoomToLocation();
            expect(mockMapServ.zoomTo).toHaveBeenCalled();
            expect(scope.clickCallback).toHaveBeenCalled();
        });
    });

});
