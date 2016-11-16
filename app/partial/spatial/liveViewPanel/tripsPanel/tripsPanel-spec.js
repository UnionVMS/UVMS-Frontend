describe('TripspanelCtrl', function() {

	beforeEach(module('unionvmsWeb'));

	var scope,ctrl,spatialConfigAlertService,genMapServSpy,tripSumSpy,Trip;

	beforeEach(function(){
			tripSumSpy = jasmine.createSpyObj('tripSummaryService',['resetMapConfigs']);
			genMapServSpy = jasmine.createSpyObj('genericMapService',['setMapBasicConfigs']);
			
			module(function($provide){
					$provide.value('genericMapService', genMapServSpy);
					$provide.value('tripSummaryService', tripSumSpy);
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

			genMapServSpy.setMapBasicConfigs.andCallFake(function(){
				return {
						then: function(callback){
								return callback(setMapBasicConfigs());
						}
				};
			});
	}

	function resetMapConfigs(){
			return true;
	}

	function setMapBasicConfigs(){
			return true;
	}

	it('should ...', inject(function() {
		scope.$digest();

		scope.tripSummServ.initializeTrip(0);
		//scope.tripSummServ.isLoadingTrip = true;
		scope.$digest();

		scope.tripSummServ.closeTab(0);
		scope.$digest();
		
	}));

});