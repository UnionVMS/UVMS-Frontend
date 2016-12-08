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

  beforeEach(inject(function() {
    scope.fishTripDetails ={

                "tripID": "BEL-TRP-O16-2016_002",
                "vesselName": "Beagle(BEL123456789)",
                "departure": "2016-10-21T08:28:21",
                "departureAt": ["BEZEE","BEZEEF"],
                "arrival": "2016-10-21T08:28:21",
                "arrivalAt": ["BEZEE","BEZEEF"],
                "Landing": "2016-10-21T08:28:21",
                "LandingAt": ["BEZEE","BEZEEF"]

            };

		if(!angular.element('#parent-container').length){
			var parentElement = angular.element('<div id="parent-container"></div>');
			parentElement.appendTo('body');
		}
	}));

  it('should show Fishing Trip details in fishing Trip panel in Catch details Page ', function() {

   var tripOverviewPanel = compile('<trip-overview-panel trip="fishTripDetails"></trip-overview-panel>')(scope);
		scope.$digest();

    tripOverviewPanel.appendTo('#parent-container');

    var isolatedScope = tripOverviewPanel.isolateScope();

    expect(scope.fishTripDetails).toBe(isolatedScope.trip);

    angular.element('trip-overview-panel').remove();
		tripOverviewPanel.isolateScope().$destroy();

  });
});
