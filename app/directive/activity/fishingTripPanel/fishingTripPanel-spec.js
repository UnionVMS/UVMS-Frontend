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

    angular.element('fishing-trip-panel').remove();
		fishTripPanel.isolateScope().$destroy();
	});

});