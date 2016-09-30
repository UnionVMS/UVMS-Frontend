describe('MdrcodelistCtrl', function() {

    beforeEach(module('unionvmsWeb'));

    var scope,ctrl,modalInstance,acronym;

    beforeEach(inject(function($rootScope, $controller) {
      scope = $rootScope.$new();
      modalInstance = {                    // Create a mock object using spies
        close: jasmine.createSpy('modalInstance.close'),
        dismiss: jasmine.createSpy('modalInstance.dismiss'),
        result: {
          then: jasmine.createSpy('modalInstance.result.then')
        }
      };
      acronym = jasmine.createSpy('acronym');
      ctrl = $controller('MdrcodelistCtrl', {$scope: scope, $modalInstance: modalInstance, acronym: acronym});
    }));

  /*  it('should ...', inject(function() {

        expect(1).toEqual(1);

    }));*/

});
