describe('confirmationModalCtrl', function() {

	beforeEach(module('unionvmsWeb'));

	var scope,ctrl,modalInstance, options;

    beforeEach(inject(function($rootScope, $controller) {
      scope = $rootScope.$new();
      modalInstance = {                    // Create a mock object using spies
        close: jasmine.createSpy('modalInstance.close'),
        dismiss: jasmine.createSpy('modalInstance.dismiss'),
        result: {
          then: jasmine.createSpy('modalInstance.result.then')
        }
      };      
      options = {};
      ctrl = $controller('confirmationModalCtrl', {$scope: scope, $modalInstance: modalInstance, options: options});

    }));	

	it('should ...', inject(function() {

		expect(1).toEqual(1);
		
	}));

});