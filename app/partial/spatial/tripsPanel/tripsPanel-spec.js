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
describe('TripspanelCtrl', function() {

	beforeEach(module('unionvmsWeb'));

	var scope,ctrl,spatialConfigAlertService,genMapServSpy,tripSumSpy,repNavSpy,Trip;

	beforeEach(function(){
		tripSumSpy = jasmine.createSpyObj('tripSummaryService',['resetMapConfigs','openNewTrip','initTripSummary']);
		genMapServSpy = jasmine.createSpyObj('genericMapService',['setMapBasicConfigs']);
		repNavSpy = jasmine.createSpyObj('reportingNavigatorService',['goToPreviousView', 'getCurrentView', 'goToView']);
		
		module(function($provide){
			$provide.value('genericMapService', genMapServSpy);
			$provide.value('tripSummaryService', tripSumSpy);
			$provide.value('reportingNavigatorService', repNavSpy);
		});
	});

	beforeEach(inject(function($httpBackend) {
		//Mock
		$httpBackend.whenGET(/usm/).respond();
		$httpBackend.whenGET(/i18n/).respond();
		$httpBackend.whenGET(/globals/).respond({data : []});
	}));

	beforeEach(inject(function(_spatialConfigAlertService_, _Trip_, _tripSummaryService_) {
		spatialConfigAlertService = _spatialConfigAlertService_;
		Trip = _Trip_;
	}));

	beforeEach(inject(function($rootScope, $controller) {
		buildMocks();
		scope = $rootScope.$new();
		ctrl = $controller('TripspanelCtrl', {$scope: scope, spatialConfigAlertService: spatialConfigAlertService});
	}));

	function buildMocks(){
		tripSumSpy.resetMapConfigs.andCallFake(function(){
			return {
				then: function(callback){
						return callback(resetMapConfigs());
				}
			};
		});

		tripSumSpy.openNewTrip.andCallFake(function(){
			return;
		});

		genMapServSpy.setMapBasicConfigs.andCallFake(function(){
			return {
				then: function(callback){
						return callback(setMapBasicConfigs());
				}
			};
		});

		repNavSpy.goToPreviousView.andCallFake(function(){
			return;
		});
		
		repNavSpy.getCurrentView.andCallFake(function(){
            return 'tripSummary';
        });
		
		repNavSpy.goToView.andCallFake(function(){
            return;
        });
	}

	function resetMapConfigs(){
			return true;
	}

	function setMapBasicConfigs(){
			return true;
	}

	it('should manage the trip summary tabs', inject(function() {
		scope.repNav = repNavSpy;

		scope.$digest();

		scope.tripSummServ.openNewTrip('1');
		scope.tripSummServ.tabs = [{title: '1', active: true}];
		scope.tripSummServ.initializeTrip(0);
		scope.tripSummServ.initializeTrip(1);
		expect(scope.tripSummServ.tabs.length).toEqual(1);

		scope.closeTab(0);
		expect(scope.tripSummServ.tabs.length).toEqual(0);

		scope.tripSummServ.openNewTrip('1');
		scope.tripSummServ.openNewTrip('2');
		scope.tripSummServ.tabs = [{title: '1', active: true},{title: '2', active: false}];
		scope.tripSummServ.initializeTrip(0);
		scope.tripSummServ.initializeTrip(1);
		expect(scope.tripSummServ.tabs.length).toEqual(2);

		scope.closeTab(1);
		expect(scope.tripSummServ.tabs.length).toEqual(1);

		scope.navigateBack();
		expect(scope.tripSummServ.tabs.length).toEqual(0);
		
	}));

});
