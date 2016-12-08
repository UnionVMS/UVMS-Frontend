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
describe('fishingTripPanel', function() {

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

	beforeEach(inject(function(Trip) {
    scope.trip = new Trip('NOR-TRP-20160517234053706');

		if(!angular.element('#parent-container').length){
			var parentElement = angular.element('<div id="parent-container"></div>');
			parentElement.appendTo('body');
		}
	}));

	it('should show the catch details', function() {
		var fishTripPanel = compile('<fishing-trip-panel trip="trip"></fishing-trip-panel>')(scope);
		scope.$digest();

    fishTripPanel.appendTo('#parent-container');
		expect(angular.element('.fishing-trip-panel').length).toEqual(1);

    angular.element('fishing-trip-panel').remove();
		fishTripPanel.isolateScope().$destroy();
	});

});
