describe('printButton', function() {

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
    $httpBackend.whenGET(/printForm/).respond({data : '<div></div>'});
	}));

  it('should compile', function() {
    var container = angular.element('<div id="parent"></div>');

    var printButton = compile('<print-button></print-button>')(scope);
    scope.$digest();

    container.append(printButton);

    var isolatedScope = printButton.isolateScope();
    angular.element(printButton)[0].click();
    isolatedScope.$digest();

    angular.element(container).triggerHandler('scroll');
    isolatedScope.$digest();
	});

});