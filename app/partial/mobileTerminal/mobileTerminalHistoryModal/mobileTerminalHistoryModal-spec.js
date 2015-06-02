describe('mobileTerminalHistoryModalCtrl', function() {

	beforeEach(module('unionvmsWeb'));

	var scope, ctrl, modalInstance, currentMobileTerminalHistory, mobileTerminal;

    beforeEach(inject(function($rootScope, $controller) {
        scope = $rootScope.$new();
        currentMobileTerminalHistory = {};
        mobileTerminal = {};
        modalInstance = {                    // Create a mock object using spies
            close: jasmine.createSpy('modalInstance.close'),
            dismiss: jasmine.createSpy('modalInstance.dismiss'),
            result: {
              then: jasmine.createSpy('modalInstance.result.then')
            }
        };
        ctrl = $controller('mobileTerminalHistoryModalCtrl', {$scope: scope, $modalInstance: modalInstance, currentMobileTerminalHistory: currentMobileTerminalHistory, mobileTerminal: mobileTerminal});


    }));	

    describe('Initial state', function () {
        it('should dismiss the modal on cancel', function () {
            scope.cancel();
            expect(modalInstance.dismiss).toHaveBeenCalledWith('cancel');
        });

    });

    describe('cancelbutton', function() {
        it('should dismiss the modal on x button', function(){
            scope.cancel();
            expect(modalInstance.dismiss).toHaveBeenCalledWith('cancel');
        });
    });

});