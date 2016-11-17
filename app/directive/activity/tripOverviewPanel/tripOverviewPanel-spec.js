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
                "departure": "yy-mm-dd hh:mm",
                "departureAt": ["BEZEE","BEZEEF"],
                "arrival": "yy-mm-dd hh:mm",
                "arrivalAt": ["BEZEE","BEZEEF"],
                "Landing": "yy-mm-dd hh:mm",
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