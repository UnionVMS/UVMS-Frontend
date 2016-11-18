describe('tripSummaryService', function() {

  var scope,ctrl,tripSumSpy,genMapServSpy,repNavSpy,timeout;

  beforeEach(module('unionvmsWeb'));

  beforeEach(function(){
		genMapServSpy = jasmine.createSpyObj('genericMapService',['setMapBasicConfigs']);
		repNavSpy = jasmine.createSpyObj('reportingNavigatorService',['goToPreviousView']);
		
		module(function($provide){
				$provide.value('genericMapService', genMapServSpy);
				$provide.value('reportingNavigatorService', repNavSpy);
		});
	});

  beforeEach(inject(function($httpBackend){
    $httpBackend.whenGET(/usm/).respond();
    $httpBackend.whenGET(/i18n/).respond();
    $httpBackend.whenGET(/globals/).respond({data : []});
  }));

  beforeEach(inject(function($rootScope, $controller, spatialConfigAlertService, _$timeout_) {
    timeout = _$timeout_;
		//buildMocks();
		scope = $rootScope.$new();
		ctrl = $controller('TripspanelCtrl', {$scope: scope, spatialConfigAlertService: spatialConfigAlertService});
    scope.$digest();
	}));

	function setMapBasicConfigs(){
			return true;
	}

  function buildMocks(){
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
	}

  it('should manage the trip summary tab system', inject(function(tripSummaryService) {
    
    expect(tripSummaryService.tabs).toBeUndefined();

    tripSummaryService.openNewTrip('1');
    timeout.flush(1);
    expect(tripSummaryService.tabs.length).toEqual(1);
    expect(tripSummaryService.tabs[0].title).toEqual('1');
    expect(tripSummaryService.tabs[0].active).toBe(true);

    tripSummaryService.openNewTrip('2');
    timeout.flush(1);
    expect(tripSummaryService.tabs.length).toEqual(2);
    expect(tripSummaryService.tabs[0].title).toEqual('1');
    expect(tripSummaryService.tabs[0].active).toBe(false);
    expect(tripSummaryService.tabs[1].title).toEqual('2');
    expect(tripSummaryService.tabs[1].active).toBe(true);

    tripSummaryService.openNewTrip('1');
    timeout.flush(1);
    expect(tripSummaryService.tabs.length).toEqual(2);
    expect(tripSummaryService.tabs[0].title).toEqual('1');
    expect(tripSummaryService.tabs[0].active).toBe(true);
    expect(tripSummaryService.tabs[1].title).toEqual('2');
    expect(tripSummaryService.tabs[1].active).toBe(false);
	//expect(tripSummaryService.doSomething()).toEqual('something');

  }));

});