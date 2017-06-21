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
describe('tripOverviewPanel', function() {

    beforeEach(module('unionvmsWeb'));

    var scope,compile;

    beforeEach(inject(function($rootScope,$compile) {
        scope = $rootScope.$new();
        compile = $compile;
    }));

    beforeEach(inject(function($httpBackend) {
        //Mock
        $httpBackend.whenGET(/usm/).respond();
        $httpBackend.whenGET(/i18n/).respond();
        $httpBackend.whenGET(/globals/).respond({data : []});
    }));
    
    afterEach(function(){
        angular.element('trip-overview-panel').remove();
    });

    beforeEach(inject(function() {
        scope.fishTripDetails = {
              "trips": [{
                  "tripId": {
                      "id": "b473f4d3-ccf2-5532-8c08-ca9e88f48bc1",
                      "schemeId": "d591ff7c"
                  },
                  "departureTime": "2016-11-16T17:08:15",
                  "arrivalTime": "2017-04-26T07:14:47",
                  "landingTime": "2018-04-27T21:15:55"
              },{
                  "tripId": {
                      "id": "3e1b6aaf-842c-5d57-b6b1-d98bb587fbdf",
                      "schemeId": "df88d4c8"
                    },
                    "departureTime": "2018-09-28T09:13:06",
                    "arrivalTime": "2017-04-11T02:09:37",
                    "landingTime": "2016-03-20T00:58:13"
              }],
              "vesselDetails": {
                  "role": "Master",
                  "name": "Austyn Watsica IV",
                  "country": "SX"
              }
        };
        
        if(!angular.element('#parent-container').length){
            var parentElement = angular.element('<div id="parent-container"></div>');
            parentElement.appendTo('body');
        }
    }));

    it('should properly render the trip overview tile ', function() {

        var tripOverviewPanel = compile('<trip-overview-panel trip="fishTripDetails"></trip-overview-panel>')(scope);
        scope.$digest();

        tripOverviewPanel.appendTo('#parent-container');

        var isolatedScope = tripOverviewPanel.isolateScope();

        expect(scope.fishTripDetails).toBe(isolatedScope.trip);
        expect(angular.element('.trip-row').length).toBe(isolatedScope.trip.trips.length);

    });
    
    it('should properly show/hide the vessel details', function(){
        
        var oneTrip = angular.copy(scope.fishTripDetails.trips[0]);
        scope.fishTripDetails.trips = [oneTrip];
        
        var tripOverviewPanel = compile('<trip-overview-panel trip="fishTripDetails"></trip-overview-panel>')(scope);
        scope.$digest();

        tripOverviewPanel.appendTo('#parent-container');

        var isolatedScope = tripOverviewPanel.isolateScope();

        expect(isolatedScope.isVesselTileVisible).toEqual(false);

        tripOverviewPanel.find('.field-icon').click();
        scope.$digest();

        expect(isolatedScope.isVesselTileVisible).toEqual(true);
    });
});
