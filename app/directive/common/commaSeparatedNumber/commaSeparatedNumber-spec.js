describe('commaSeparatedNumber', function() {

  beforeEach(module('unionvmsWeb'));

  var scope,compile, elem, ngModelCtrl;

  beforeEach(inject(function($rootScope,$compile, $httpBackend) {
    scope = $rootScope.$new();
    scope.data = '';
    compile = $compile;

    $httpBackend.whenGET(/usm/).respond();
    $httpBackend.whenGET(/i18n/).respond();
    $httpBackend.whenGET(/globals/).respond({data: []});

    elem = compile('<input id="test-csn" type="text" ng-model="data" comma-separated-number></input>')(scope);
    elem.appendTo('body');
    ngModelCtrl = elem.controller('ngModel');
  }));

  afterEach(function() {
    angular.element('test-csn').remove();
  });

  it('should not accept two consecutive commas', function() {
      ngModelCtrl.$setViewValue('1,,2');
      scope.$digest();

      expect(angular.element('#test-csn').length).toBe(1);
      expect(elem.val()).toEqual('1,2');
  });

   it('should not accept a comma in the beginning', function() {
      ngModelCtrl.$setViewValue(',1,2');
      scope.$digest();

      expect(angular.element('#test-csn').length).toBe(1);
      expect(elem.val()).toEqual('1,2');
   });

   it('should not accept non digit characters', function() {
      ngModelCtrl.$setViewValue('1,a,b,c,2');
      scope.$digest();

      expect(angular.element('#test-csn').length).toBe(1);
      expect(elem.val()).toEqual('1,2');
   });
});