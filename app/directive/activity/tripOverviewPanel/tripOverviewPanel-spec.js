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