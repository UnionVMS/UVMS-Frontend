describe('VesselhistorymodalCtrl', function () {

  beforeEach(module('unionvmsWeb'));

  var scope, ctrl, modalInstance, vesselHistory;

  // Initialize the controller and a mock scope
  beforeEach(inject(
    function ($controller, $rootScope) {     // Don't bother injecting a 'real' modal
      scope = $rootScope.$new();      
      modalInstance = {                    // Create a mock object using spies
        close: jasmine.createSpy('modalInstance.close'),
        dismiss: jasmine.createSpy('modalInstance.dismiss'),
        result: {
          then: jasmine.createSpy('modalInstance.result.then')
        }
      };
      vesselHistory = {};
      ctrl = $controller('VesselhistorymodalCtrl', {$scope: scope, $modalInstance: modalInstance, vesselHistory: vesselHistory});
    })
  );

  describe('Initial state', function () {
    it('should dismiss the modal on cancel', function () {
      scope.cancel();
      expect(modalInstance.dismiss).toHaveBeenCalledWith('cancel');
    });
  });
});