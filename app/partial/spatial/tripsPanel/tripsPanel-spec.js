describe('TripspanelCtrl', function() {

	beforeEach(module('unionvmsWeb'));

	var scope,ctrl,spatialConfigAlertService,genMapServSpy,tripSumSpy,repNavSpy,Trip;

	beforeEach(function(){
		tripSumSpy = jasmine.createSpyObj('tripSummaryService',['resetMapConfigs','openNewTrip']);
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

		scope.quitTripSummary();
		expect(scope.tripSummServ.tabs.length).toEqual(0);
		
	}));

});