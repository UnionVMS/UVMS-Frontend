describe('faOverviewPanel', function() {

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

  function buildMocks(){
    scope.summary = {
      title: "title",
      subTitle: "subTitle",
      items: {
        fishery_type: "Demersal",
        no_operations: 163,
        occurence: "2017-07-30T05:40:25",
        targetted_species: ["GADUS"],
        vessel_activity: "FSH - Fishing"
      },
      subItems: {
        duration: "10d 8h"
      }
    };
  }

  it('should compile and present the model content', function() {
    buildMocks();

    var faOverviewPanel = compile('<fa-overview-panel class="col-md-12 summary-section" ng-model="summary"></fa-overview-panel>')(scope);
    scope.$digest();

    var nrItems = 0;
    var nrSubItems = 0;

    angular.forEach(scope.summary.items, function(item){
      nrItems++;
    });

    angular.forEach(scope.summary.subItems, function(item){
      nrSubItems++;
    });

    expect(angular.element(faOverviewPanel).find('> .fa-overview-fieldset > .item-container').length).toEqual(nrItems);
    expect(angular.element(faOverviewPanel).find('.fa-overview-fieldset > .fa-overview-fieldset > .item-container').length).toEqual(nrSubItems);

    expect(angular.element(faOverviewPanel).find('> .fa-overview-fieldset > legend > a').text()).toEqual(scope.summary.title);
    expect(angular.element(faOverviewPanel).find('.fa-overview-fieldset > .fa-overview-fieldset > legend > a').text()).toEqual(scope.summary.subTitle);

    faOverviewPanel.isolateScope().$destroy();
  });
});