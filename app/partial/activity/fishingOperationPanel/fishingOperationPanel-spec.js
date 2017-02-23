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