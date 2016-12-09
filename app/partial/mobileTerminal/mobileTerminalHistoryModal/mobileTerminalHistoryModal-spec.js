/*
Developed with the contribution of the European Commission - Directorate General for Maritime Affairs and Fisheries
© European Union, 2015-2016.

This file is part of the Integrated Fisheries Data Management (IFDM) Suite. The IFDM Suite is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as published by the
Free Software Foundation, either version 3 of the License, or any later version. The IFDM Suite is distributed in
the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. You should have received a
copy of the GNU General Public License along with the IFDM Suite. If not, see <http://www.gnu.org/licenses/>.
 */
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