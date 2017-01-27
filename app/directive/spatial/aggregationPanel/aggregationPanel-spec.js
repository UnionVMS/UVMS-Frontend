describe('aggregationPanel', function() {

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
      scope.model = [
        {
            code: "area",
            text: "Area"
        },
        {
            code: "vessel",
            text: "Vessel/Vessel group"
        },
        {
            code: "period",
            text: "Period",
            items: [
                {
                    code: "day",
                    text: "Day"
                },
                {
                    code: "month",
                    text: "Month"
                },
                {
                    code: "year",
                    text: "Year"
                }
            ]
        }
    ];

    scope.aggregationTypes = [
        {
            code: "fs",
            text: "Flag state"
        },
        {
            code: "vessel",
            text: "Vessel/Vessel group"
        },
        {
            code: "period",
            text: "Period",
            items: [
                {
                    code: "day",
                    text: "Day"
                },
                {
                    code: "month",
                    text: "Month"
                },
                {
                    code: "year",
                    text: "Year"
                }

            ]
        },
        {
            code: "area",
            text: "Area"
        },
        {
            code: "geartype",
            text: "Gear type"
        },
        {
            code: "species",
            text: "Species"
        },
        {
            code: "presentation",
            text: "Presentation"
        }
    ];

  }));

  var compileAggrPanel = function() {
    var aggrPanel = compile('<aggregation-panel ng-model="model" aggregation-types="aggregationTypes" min-selections="2" title="titleTest"></aggregation-panel>')(scope);
    scope.$digest();
    return aggrPanel;
  };

  var destroyCombo = function() {
    var comboToRemove = angular.element('.comboList');

    for(var i=0;i<comboToRemove.length;i++){
      var comboScope = comboToRemove[i].isolateScope();
      if(comboToRemove[i]){
          comboToRemove[i].remove();
      }
      comboScope.$destroy();
    }
  };

  it('should compile and allow the user to add/remove items', function() {

    var aggrPanel = compileAggrPanel();
    var isolatedScope = aggrPanel.isolateScope();

    expect(scope.model).toBe(isolatedScope.ngModel);
    expect(scope.aggregationTypes).toBe(isolatedScope.aggregationTypes);
    expect('titleTest').toEqual(isolatedScope.title);

    var aggrTypesId = angular.element(aggrPanel).find('.aggr-types-combo')[0].attributes['combolist-id'].value;


    expect(scope.model[2].code).toEqual('period');

    destroyCombo();
  });
});