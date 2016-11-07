describe('catchPanel', function() {

  beforeEach(module('unionvmsWeb'));

  beforeEach(function(){
      actRestSpy = jasmine.createSpyObj('activityRestService', ['getTripCatches']);
      
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

  function getCatchDetails(){
        return {
          "data": {
            "onboard": {
              "speciesList": [
                  {"speciesCode":"BEAGLE","weight":111.0},
                  {"speciesCode":"SEAFOOD","weight":111.0},
                  {"speciesCode":"SEAFOOD_2","weight":111.0},
                  {"speciesCode":"SEAFOOD_3","weight":111.0},
                  {"speciesCode":"BEAGLE","weight":111.0}
                ],
              "total":555.0
            },
            "landed": {
              "speciesList": [
                {"speciesCode":"BEAGLE","weight":111.0},
                {"speciesCode":"SEAFOOD","weight":111.0}
              ],
            "total":222.0
            }
          },
          "code": 200
      };
    } 

  function buildMocks(){
      actRestSpy.getTripCatches.andCallFake(function(){
          return {
              then: function(callback){
                  return callback(getCatchDetails());
              }
          };
      });

  }

	it('should show the catch details', function() {
    buildMocks();
		var catchPanel = compile('<catch-panel trip="trip"></catch-panel>')(scope);
		scope.$digest();

    catchPanel.appendTo('#parent-container');

    expect(actRestSpy.getTripCatches).toHaveBeenCalled();

    angular.element('catch-panel').remove();
		catchPanel.isolateScope().$destroy();
	});


});