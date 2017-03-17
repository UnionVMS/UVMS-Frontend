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
    var scope,compile,tile,$httpBackend,mockMapServ,$filter;
    
    beforeEach(module('unionvmsWeb'));
    
    beforeEach(function(){
        mockMapServ = jasmine.createSpyObj('mapService', ['zoomTo']);
        
        module(function($provide){
            $provide.value('mapService', mockMapServ);
        });
    });
    
    beforeEach(inject(function($rootScope, $compile, $injector, _$filter_) {
        scope = $rootScope.$new();
        compile = $compile;
        
        if(!angular.element('#parent-container').length){
            var parentElement = angular.element('<div id="parent-container"></div>');
            parentElement.appendTo('body');
        }
        
        $filter = _$filter_;
        $httpBackend = $injector.get('$httpBackend');;
        $httpBackend.whenGET(/usm/).respond();
        $httpBackend.whenGET(/i18n/).respond();
        $httpBackend.whenGET(/globals/).respond({data : []});
    }));
    
    function buildMock(){
        return [{
            "country": "SC",
            "rfmoCode": "Borders",
            "geometry": "POINT(82.84711 -83.7533)",
            "structuredAddress": [{
                "streetName": "Gamo Junction",
                "plotId": "5547ad46",
                "postCode": "L4J 6N4",
                "cityName": "Ilebuoci",
                "countryCode": "VG",
                "countryName": "Andorra",
                "characteristics": {
                  "key1": "value1",
                  "key2": "value2"
                }
            },{
                "streetName": "Fahge Extension",
                "plotId": "bc9205e7",
                "postCode": "B7M 6N4",
                "cityName": "Ojsaro",
                "countryCode": "GU",
                "countryName": "U.S. Virgin Islands",
                "characteristics": {
                  "key1": "value1",
                  "key2": "value2"
                }
            }],
            "identifier": {
              "id": "3a369c59-239e-5039-b074-81fad8d526ab",
              "schemeId": "d149003f"
            }
        },{
            "country": "CI",
            "rfmoCode": "Bedfordshire",
            "geometry": "POINT(125.19486 0.15269)",
            "structuredAddress": [{
                "streetName": "Pooki Manor",
                "plotId": "8146ff53",
                "postCode": "L9G 8I0",
                "cityName": "Atanedad",
                "countryCode": "MX",
                "countryName": "Bolivia",
                "characteristics": {
                  "key1": "value1",
                  "key2": "value2"
                }
            }]
        }];
    }
    
    function getAdditionalData(){
        return {
            "country": "CI",
            "rfmoCode": "Bedfordshire",
            "geometry": "POINT(125.19486 0.15269)",
            "structuredAddress": []
        };
    }
    
    function getDataStats(srcData){
        var stats = {
            countries: [],
            rfmo: [],
            liCounter: 0,
            idCounter: 0,
            posCounter: 0,
            addCounter: 0,
            clickableCounter: 0
        }
        angular.forEach(srcData, function(record){
            stats.clickableCounter += 1;
            stats.liCounter += 1 + record.structuredAddress.length;
            stats.addCounter += record.structuredAddress.length;
            if (angular.isDefined(record.identifier)){
                stats.idCounter += 1;
            } else {
                stats.posCounter += 1;
            }
            
            if (_.indexOf(stats.countries, record.country) === -1){
                stats.countries.push(record.country)
            }
            
            if (_.indexOf(stats.rfmo, record.rfmoCode) === -1){
                stats.rfmo.push(record.rfmoCode)
            }
        });
        
        return stats;
    }
    
    function getProcessedData(srcData){
        var finalData = {
            countries: [],
            rfmo: []
        }
        
        angular.forEach(srcData, function(record){
            if (_.indexOf(finalData.countries, record.country) === -1){
                finalData.countries.push(record.country)
            }
            
            if (_.indexOf(finalData.rfmo, record.rfmoCode) === -1){
                finalData.rfmo.push(record.rfmoCode)
            }
        });
        
        return finalData;
    }
    
    function getActivityGeom(){
        return 'MULTIPOINT((145.63094 51.83387), (-78.39494 23.84))';
    }
    
    function getIdentifier(record){
        return {
            id: record.identifier.id,
            schemeId: record.identifier.schemeId,
            geometry: record.geometry
        }
    }
    
    function getPosition(record){
        var wkt = new ol.format.WKT();
        var coords = wkt.readGeometry(record.geometry).getCoordinates();
        
        return {
            geometry: record.geometry,
            lon: coords[0],
            lat: coords[1]
        }
    }
    
    describe('testing the directive: locationTile', function(){
        afterEach(function(){
            angular.element('location-tile').remove();
        });
        
        it('should properly render the location tile', function(){
            scope.locationDetails = [];
            
            tile = compile('<location-tile field-title="title" location-details="locationDetails"></location-tile>')(scope);
            tile.appendTo('#parent-container');
            scope.$digest(); 
            
            scope.locationDetails = buildMock();
            scope.$digest(); 
            
            var isolatedScope = tile.isolateScope();
            var filter = $filter('stArrayToString');
            var stats = getDataStats(scope.locationDetails);
            
            expect(angular.element('location-tile').length).toBe(1);
            expect(angular.element('legend').find('.fa-search-plus').length).toBe(0);
            expect(angular.element('.item-container').eq(0).find('span').eq(1).text()).toEqual(filter(stats.countries, ', '));
            expect(angular.element('.item-container').eq(1).find('span').eq(1).text()).toEqual(filter(stats.rfmo, ', '));
            expect(angular.element('li').length).toEqual(stats.liCounter);
            expect(angular.element('carousel-tile').length).toEqual(1);
            
            expect(isolatedScope.identifiers.length).toEqual(stats.idCounter);
            expect(isolatedScope.positions.length).toEqual(stats.posCounter);
            expect(isolatedScope.addresses.length).toEqual(stats.addCounter);
            expect(isolatedScope.activityGeom).not.toBeDefined();
        });
        
        it('should render the tile with clickable locations', function(){
            scope.locationDetails = [];
            
            tile = compile('<location-tile field-title="title" is-clickable="true" location-details="locationDetails"></location-tile>')(scope);
            tile.appendTo('#parent-container');
            scope.$digest(); 
            
            scope.locationDetails = buildMock();
            scope.$digest(); 
            
            var isolatedScope = tile.isolateScope();
            var filter = $filter('stArrayToString');
            var stats = getDataStats(scope.locationDetails);
            
            expect(angular.element('location-tile').length).toBe(1);
            expect(angular.element('legend').find('.fa-search-plus').length).toBe(0);
            expect(angular.element('.item-clickable').length).toEqual(stats.clickableCounter);
        });
        
        it('should render the tile with the button to zoom to the fishing activity', function(){
            scope.locationDetails = [];
            scope.activityGeometry = getActivityGeom();
            
            tile = compile('<location-tile field-title="title" is-clickable="true" src-activity-geom="activityGeometry" location-details="locationDetails"></location-tile>')(scope);
            tile.appendTo('#parent-container');
            scope.$digest(); 
            
            scope.locationDetails = buildMock();
            scope.$digest(); 
            
            var stats = getDataStats(scope.locationDetails);
            
            expect(angular.element('location-tile').length).toBe(1);
            expect(angular.element('legend').find('.fa-search-plus').length).toBe(1);
            expect(angular.element('.item-clickable').length).toEqual(stats.clickableCounter);
        });
        
        it('should render the tile without the button to zoom to the fishing activity if directive is configured not to be clickable', function(){
            scope.locationDetails = [];
            scope.activityGeometry = getActivityGeom();
            
            tile = compile('<location-tile field-title="title" is-clickable="false" src-activity-geom="activityGeometry" location-details="locationDetails"></location-tile>')(scope);
            tile.appendTo('#parent-container');
            scope.$digest(); 
            
            scope.locationDetails = buildMock();
            scope.$digest(); 
            
            var stats = getDataStats(scope.locationDetails);
            
            expect(angular.element('location-tile').length).toBe(1);
            expect(angular.element('legend').find('.fa-search-plus').length).toBe(0);
            expect(angular.element('.item-clickable').length).toEqual(0);
        });
        
        it('should render the location tile with no data message when locationDetails is empty', function(){
            scope.locationDetails = [];
            
            tile = compile('<location-tile field-title="title" is-clickable="true" location-details="locationDetails"></location-tile>')(scope);
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
            scope.locationDetails = [];
            expect(scope.hasData()).toBeFalsy();
            
            scope.locationDetails = buildMock();
            expect(scope.hasData()).toBeTruthy();
        });
        
        it('should properly process input locationDetails data', function(){
            scope.locationDetails = buildMock();
            scope.init();
            
            var stats = getDataStats(scope.locationDetails);
            expect(scope.countries).toEqual(stats.countries);
            expect(scope.rfmo).toEqual(stats.rfmo);
            expect(scope.activityGeom).not.toBeDefined();
            expect(scope.identifiers.length).toEqual(stats.idCounter);
            expect(scope.positions.length).toEqual(stats.posCounter);
            expect(scope.addresses.length).toEqual(stats.addCounter);
            expect(scope.identifiers[0]).toEqual(getIdentifier(scope.locationDetails[0]));
            expect(scope.positions[0]).toEqual(getPosition(scope.locationDetails[1]));
        });
        
        it('should properly process input activity geometry', function(){
            scope.srcActivityGeom = getActivityGeom();
            scope.init();
            
            expect(scope.activityGeom ).toEqual({geometry: getActivityGeom()});
        });
        
        it('should not include duplicated country and rfmo values', function(){
            scope.locationDetails = buildMock();
            scope.locationDetails.push(getAdditionalData());
            scope.init();
            
            var stats = getDataStats(scope.locationDetails);
            expect(scope.countries).toEqual(stats.countries);
            expect(scope.rfmo).toEqual(stats.rfmo);
            expect(scope.addresses.length).toEqual(stats.addCounter);
        });
        
        it('should not be clickable', function(){
            scope.isClickable = false;
            expect(scope.isItemClickable()).toBeFalsy();
        });
        
        it('should properly check if an item is clickable', function(){
            scope.isClickable = true;
            scope.locationDetails = buildMock();
            scope.init();
            
            expect(scope.isItemClickable(scope.positions[0])).toBeTruthy();
            expect(scope.isItemClickable(scope.identifiers[0])).toBeTruthy();
            
            scope.identifiers[0].geometry = null;
            expect(scope.isItemClickable(scope.identifiers[0])).toBeFalsy();
        });
        
        it('should zoom to a location when it is clickable', function(){
            scope.locationDetails = buildMock();
            scope.isClickable = true;
            scope.init();
            
            scope.zoomToLocation(scope.positions[0]);
            expect(mockMapServ.zoomTo).toHaveBeenCalled();
            expect(mockMapServ.zoomTo.mostRecentCall.args[0] instanceof ol.geom.Point).toBeTruthy();
        });
        
        it('should not zoom to a location if it is not clickable', function(){
            scope.locationDetails = buildMock();
            scope.isClickable = true;
            scope.init();
            scope.positions[0].geometry = null
            
            scope.zoomToLocation(scope.positions[0]);
            expect(mockMapServ.zoomTo).not.toHaveBeenCalled();
        });

        it('should zoom to a specified point location and apply a buffer to calculate the extent of the zoom', function(){
            scope.locationDetails = buildMock();
            scope.isClickable = true;
            scope.bufferDist = 5000;
            scope.init();
            
            scope.zoomToLocation(scope.positions[0]);
            expect(mockMapServ.zoomTo).toHaveBeenCalled();
            expect(mockMapServ.zoomTo.mostRecentCall.args[0] instanceof ol.geom.Polygon).toBeTruthy();        
        });
        
        it('should call the click callback function when zoooming to the location', function(){
            scope.locationDetails = buildMock();
            scope.isClickable = true;
            scope.clickCallback = jasmine.createSpy('clickCallback');
            scope.init();
            
            scope.zoomToLocation(scope.positions[0]);
            expect(mockMapServ.zoomTo).toHaveBeenCalled();
            expect(scope.clickCallback).toHaveBeenCalled();
        });
    });

});
