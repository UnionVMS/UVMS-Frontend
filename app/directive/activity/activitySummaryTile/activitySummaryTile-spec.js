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
describe('activitySummaryTile', function() {
    var scope,compile,tile,$httpBackend;
    
    beforeEach(module('unionvmsWeb'));
    
    beforeEach(inject(function($rootScope, $compile, $injector) {
        scope = $rootScope.$new();
        compile = $compile;
        
        if(!angular.element('#parent-container').length){
            var parentElement = angular.element('<div id="parent-container"></div>');
            parentElement.appendTo('body');
        }
        
        $httpBackend = $httpBackend = $injector.get('$httpBackend');;
        $httpBackend.whenGET(/usm/).respond();
        $httpBackend.whenGET(/i18n/).respond();
        $httpBackend.whenGET(/globals/).respond({data : []});
    }));
    
    afterEach(function(){
        angular.element('activity-summary-tile').remove();
    });

    function buildMockData() {
        return {
            occurence: '2014-05-27T07:47:31',
            reason: 'Fishing',
            fisheryType: 'Demersal',
            targetedSpecies: ['COD', 'SOL', 'COD', 'SOL', 'COD']
        };
    }
    
    function buildPortData(){
        return {
            "name": "Test port",
            "geometry": "POINT(-121.7621 -49.65102)"
        }
    }
    
    it('should render the activity summary tile without location tile', inject(function($filter) {
        scope.summary = buildMockData();
        scope.faType = 'fa_type_departure';
        
        tile = compile('<activity-summary-tile fa-type="faType" summary="summary"></activity-summary-tile>')(scope); 
        tile.appendTo('#parent-container');
        scope.$digest();
        
        expect(angular.element('activity-summary-tile').length).toBe(1);
        expect(angular.element('.item-container').children().eq(1).text()).toEqual($filter('stDateUtc')(scope.summary.occurence));
        expect(angular.element('.item-container').children().eq(3).text()).toEqual(scope.summary.reason);
        expect(angular.element('.item-container').children().eq(5).text()).toEqual(scope.summary.fisheryType);
        expect(angular.element('.item-container').children().eq(7).text()).toEqual($filter('stArrayToString')(scope.summary.targetedSpecies, ', '));
    }));
    
    it('should render the activity summary tile with location tile', inject(function($filter) {
        scope.summary = buildMockData();
        scope.faType = 'fa_type_departure';
        scope.port = buildPortData();
        
        tile = compile('<activity-summary-tile fa-type="faType" summary="summary" loc-details="port"></activity-summary-tile>')(scope); 
        tile.appendTo('#parent-container');
        scope.$digest();
        
        expect(angular.element('activity-summary-tile').length).toBe(1);
        expect(angular.element('.item-container').children().eq(1).text()).toEqual($filter('stDateUtc')(scope.summary.occurence));
        expect(angular.element('.item-container').children().eq(3).text()).toEqual(scope.summary.reason);
        expect(angular.element('.item-container').children().eq(5).text()).toEqual(scope.summary.fisheryType);
        expect(angular.element('.item-container').children().eq(7).text()).toEqual($filter('stArrayToString')(scope.summary.targetedSpecies, ', '));
        expect(angular.element('.location-tile').length).toBe(1);
    }));
});
