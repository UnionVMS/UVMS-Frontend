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
describe('FishingoperationpanelCtrl', function() {

	beforeEach(module('unionvmsWeb'));

	var scope,ctrl,fishActRestServSpy,actRestSpy,fishOperSpy;
	
	beforeEach(function(){
		fishActRestServSpy = jasmine.createSpyObj('fishingActivityService', ['getFishingActivity']);
		actRestSpy = jasmine.createSpyObj('activityRestService', ['getTripCatchDetail']);
		fishOperSpy = jasmine.createSpy('FishingOperation');
		
		module(function($provide){
			$provide.value('fishingActivityService', fishActRestServSpy);
			$provide.value('activityRestService', actRestSpy);
			$provide.value('FishingOperation', fishOperSpy);
		});
	});

	beforeEach(inject(function($httpBackend) {
		//Mock
		$httpBackend.whenGET(/usm/).respond();
		$httpBackend.whenGET(/i18n/).respond();
		$httpBackend.whenGET(/globals/).respond({data : []});
	}));

	beforeEach(inject(function($rootScope, $controller) {
		buildMocks();

		scope = $rootScope.$new();
		ctrl = $controller('FishingoperationpanelCtrl', {$scope: scope});
		scope.$digest();
	}));

	function getFishingActivity(){
		return {code: 200};
	}

	function buildMocks() {
		fishActRestServSpy.getFishingActivity.andCallFake(function(){
			return {
				then: function(callback){
						return callback(getFishingActivity());
				}
			};
		});

		actRestSpy.getTripCatchDetail.andCallFake(function(){
			return {
				then: function(callback){
						return callback(getFishingActivity());
				}
			};
		});
	}


	it('should initialize the fishing activity', inject(function() {
		expect(fishActRestServSpy.getFishingActivity).toHaveBeenCalled();
		expect(actRestSpy.getTripCatchDetail).toHaveBeenCalled();
	}));

});