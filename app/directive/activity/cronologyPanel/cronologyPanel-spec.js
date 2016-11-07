describe('cronologyPanel', function() {

  beforeEach(module('unionvmsWeb'));

  beforeEach(function(){
      actRestSpy = jasmine.createSpyObj('activityRestService', ['getTripCronology']);
      
      module(function($provide){
          $provide.value('activityRestService', actRestSpy);
      });
  });


  var scope,compile,actRestSpy;

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

  function getTripCronology(){
      return {"data": 
        {
          "currentTrip":"NOR-TRP-20160517234053706",
          "selectedTrip":"NOR-TRP-20160517234053706",
          "previousTrips": ["NOR-TRP-20160517234053704","NOR-TRP-20160517234053705"],
          "nextTrips": ["NOR-TRP-20160517234053707","NOR-TRP-20160517234053708"]
        },
        "code":200
      };
  } 

  function buildMocks(){
      actRestSpy.getTripCronology.andCallFake(function(){
          return {
              then: function(callback){
                  return callback(getTripCronology());
              }
          };
      });
  }

	it('should show the catch details', function() {
    buildMocks();
		var cronologyPanel = compile('<cronology-panel trip="trip"></cronology-panel>')(scope);
		scope.$digest();

    cronologyPanel.appendTo('#parent-container');

    expect(actRestSpy.getTripCronology).toHaveBeenCalled();

    angular.element('cronology-panel').remove();
		cronologyPanel.isolateScope().$destroy();
	});

});