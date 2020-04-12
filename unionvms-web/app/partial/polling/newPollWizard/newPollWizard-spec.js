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
describe('newPollWizardCtrl', function() {

    var scope,ctrl;

    beforeEach(module('unionvmsWeb'));

    beforeEach(inject(function($rootScope, $controller) {
        scope = $rootScope.$new();
        ctrl = $controller('newPollWizardCtrl', {$scope: scope});
    }));

    beforeEach(inject(function($httpBackend) {
        //Mock
        $httpBackend.whenGET(/usm/).respond();
        $httpBackend.whenGET(/i18n/).respond();
        $httpBackend.whenGET(/globals/).respond({data : []});
    }));

    it('activeTab should be set to POLLING', inject(function($rootScope) {
        expect(scope.activeTab).toEqual('POLLING');
    }));

    it('startNewPoll should reset pollingOptions, clearSelection and move to first step 1 in the wizard', inject(function($rootScope, pollingService) {
        scope.wizardStep = 3;

        var clearSelectionSpy = spyOn(pollingService, 'clearSelection');
        var resetSpy = spyOn(pollingService, 'resetPollingOptions');

        //Start new poll
        scope.startNewPoll();
        expect(scope.wizardStep).toEqual(1);
        expect(clearSelectionSpy).toHaveBeenCalled();
        expect(resetSpy).toHaveBeenCalled();
    }));

    it('should clean up on scope destroy', inject(function($rootScope, alertService) {
        var alertSpy = spyOn(alertService, "hideMessage");
        scope.$destroy();
        expect(alertSpy).toHaveBeenCalled();
    }));

    it('should not clean up alerts on scope destroy if hideAlertsOnScopeDestroy is set to false', inject(function($rootScope, alertService) {
        //Set scope.hideAlertsOnScopeDestroy to false
        scope.hideAlertsOnScopeDestroy = false;

        var alertSpy = spyOn(alertService, "hideMessage");

        scope.$destroy();
        expect(alertSpy).not.toHaveBeenCalled();
    }));
});