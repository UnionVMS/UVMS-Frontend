describe('vesselPanel', function() {

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
		var fishTripPanel = compile('<vessel-panel trip="trip"></vessel-panel>')(scope);
		scope.$digest();

    fishTripPanel.appendTo('#parent-container');
		expect(angular.element('.vessel-panel').length).toEqual(1);

    angular.element('vessel-panel').remove();
		fishTripPanel.isolateScope().$destroy();
	});

});