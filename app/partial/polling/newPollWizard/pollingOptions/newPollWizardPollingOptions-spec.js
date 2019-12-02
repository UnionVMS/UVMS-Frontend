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
describe('NewpollwizardpollingoptionsCtrl', function() {

    var scope,ctrl;

    beforeEach(module('unionvmsWeb'));

    beforeEach(inject(function($rootScope, $controller) {
        scope = $rootScope.$new();
        ctrl = $controller('NewpollwizardpollingoptionsCtrl', {$scope: scope});
    }));

    beforeEach(inject(function($httpBackend) {
        //Mock
        $httpBackend.whenGET(/usm/).respond();
        $httpBackend.whenGET(/i18n/).respond();
        $httpBackend.whenGET(/globals/).respond({data : []});
    }));

    it('isAllSelectedTerminalsOfTheSameType should only return true whenn all are of same type', inject(function($rootScope, pollingService, PollChannel) {
        expect(scope.isAllSelectedTerminalsOfTheSameType()).toBeTruthy();

        //Add INMARSAT-
        var inmarsatc1 = new PollChannel();
        inmarsatc1.mobileTerminalType = 'INMARSAT_C';
        inmarsatc1.comChannelId = '1';
        pollingService.addMobileTerminalToSelection(inmarsatc1);
        expect(scope.isAllSelectedTerminalsOfTheSameType()).toBeTruthy();

        //Add another INMARSAT-C
        var inmarsatc2 = new PollChannel();
        inmarsatc2.mobileTerminalType = 'INMARSAT_C';
        inmarsatc2.comChannelId = '2';
        pollingService.addMobileTerminalToSelection(inmarsatc2);
        expect(scope.isAllSelectedTerminalsOfTheSameType()).toBeTruthy();

        //Add another type-C
        var anotherType = new PollChannel();
        anotherType.mobileTerminalType = 'IRIDIUM';
        anotherType.comChannelId = '3';
        pollingService.addMobileTerminalToSelection(anotherType);
        expect(scope.isAllSelectedTerminalsOfTheSameType()).toBeFalsy();
    }));

    it('runPoll should stop if form is invalid', inject(function($rootScope, $compile, pollingService, alertService) {
        var createPollSpy = spyOn(pollingService, 'createPolls');
        var errorAlertSpy = spyOn(alertService, 'showErrorMessage');

        //Create form
        var element = angular.element('<form name="pollingOptionsForm"><input type="text" required name="test"></form>');
        $compile(element)(scope);
        //Set form as invalid
        scope.pollingOptionsForm.$valid = false;

        //Shoud be invalid
        expect(scope.pollingOptionsForm.$valid).toBeFalsy();

        //Try to run poll
        scope.runPoll();
        scope.$digest();

        //Create poll method shoud not have been called
        expect(createPollSpy).not.toHaveBeenCalled();
        //Error alert shoud have been shown
        expect(errorAlertSpy).toHaveBeenCalled();

        expect(scope.submitAttempted).toBeTruthy();


    }));

    it('runPoll should create poll and redirect to polling logs when all polls are sent', inject(function($rootScope, $q, $state, $compile, pollingService, alertService) {
        var deferred = $q.defer();
        deferred.resolve();
        var pollResult = {
            unsentPolls : [],
            sentPolls : ['abc', 'def'],
            programPoll: false
        };

        scope.setHideAlertOnScopeDestroy = function(){};
        var createPollSpy = spyOn(pollingService, 'createPolls').andReturn(deferred.promise);
        var getResultSpy = spyOn(pollingService, 'getResult').andReturn(pollResult);
        var errorAlertSpy = spyOn(alertService, 'showErrorMessage');
        var successAlertSpy = spyOn(alertService, 'showSuccessMessageWithTimeout');
        var locationChangeSpy = spyOn($state, 'go');
        var setHideAlertOnScopeDestroySpy = spyOn(scope, 'setHideAlertOnScopeDestroy');

        spyOn(pollingService, 'getPollAttributes').andReturn(['dummyOption']);

        //Create form
        var element = angular.element('<form name="pollingOptionsForm"></form>');
        $compile(element)(scope);

        //Try to run poll
        scope.runPoll();
        scope.$digest();

        expect(createPollSpy).toHaveBeenCalled();

        //Success alert shoud have been shown
        expect(successAlertSpy).toHaveBeenCalled();
        expect(errorAlertSpy).not.toHaveBeenCalled();

        //setHideAlertOnScopeDestroy should have been set to false to keep success message on location change
        expect(setHideAlertOnScopeDestroySpy).toHaveBeenCalledWith(false);

        //Should be redirected to polling logs
        expect(locationChangeSpy).toHaveBeenCalledWith('app.pollingLogs');
    }));

    it('runPoll should create poll and redirect to exchange when all polls are not sent', inject(function($rootScope, $q, $state, $compile, pollingService, alertService) {
        var deferred = $q.defer();
        deferred.resolve();
        var pollResult = {
            unsentPolls : ['ijk'],
            sentPolls : ['abc', 'def'],
            programPoll: false
        };

        scope.setHideAlertOnScopeDestroy = function(){};
        var createPollSpy = spyOn(pollingService, 'createPolls').andReturn(deferred.promise);
        var getResultSpy = spyOn(pollingService, 'getResult').andReturn(pollResult);
        var errorAlertSpy = spyOn(alertService, 'showErrorMessage');
        var successAlertSpy = spyOn(alertService, 'showSuccessMessageWithTimeout');
        var locationChangeSpy = spyOn($state, 'go');
        var setHideAlertOnScopeDestroySpy = spyOn(scope, 'setHideAlertOnScopeDestroy');

        spyOn(pollingService, 'getPollAttributes').andReturn(['dummyOption']);

        //Create form
        var element = angular.element('<form name="pollingOptionsForm"></form>');
        $compile(element)(scope);

        //Try to run poll
        scope.runPoll();
        scope.$digest();

        expect(createPollSpy).toHaveBeenCalled();

        //Error alert shoud have been shown
        expect(successAlertSpy).not.toHaveBeenCalled();
        expect(errorAlertSpy).toHaveBeenCalled();

        //setHideAlertOnScopeDestroy should have been set to false to keep success message on location change
        expect(setHideAlertOnScopeDestroySpy).toHaveBeenCalledWith(false);

        //Should be redirected to polling logs
        expect(locationChangeSpy).toHaveBeenCalledWith('app.exchange');
    }));

    it('should return to first step of wizard when all selected terminals are removed', inject(function($rootScope, $compile, PollChannel, pollingService) {

        scope.previousStep = function(){};
        var previousStepSpy = spyOn(scope, 'previousStep');

        //Create form
        var element = angular.element('<form name="pollingOptionsForm"></form>');
        $compile(element)(scope);

        //Add one terminal
        var terminal1 = new PollChannel();
        terminal1.mobileTerminalType = 'INMARSAT_C';
        terminal1.comChannelId = '1';
        pollingService.addMobileTerminalToSelection(terminal1);

        //Set wizard step to 2, options page
        scope.wizardStep = 2;
        scope.$digest();
        expect(previousStepSpy).not.toHaveBeenCalled();

        //Remove all terminals
        pollingService.clearSelection();
        scope.$digest();
        expect(previousStepSpy).toHaveBeenCalled();
    }));

    it('should reset form when entering wizard step 2', inject(function($rootScope, $compile) {
        //Create form and make it dirty
        var element = angular.element('<form name="pollingOptionsForm"></form>');
        $compile(element)(scope);
        scope.submitAttempted = true;
        scope.pollingOptionsForm.$setDirty();

        //Set to step 1
        scope.wizardStep = 1;
        scope.$digest();
        expect(scope.submitAttempted).toBeTruthy();

        //Set wizard step to 2, options page
        scope.wizardStep = 2;
        scope.$digest();
        expect(scope.submitAttempted).toBeFalsy();
        expect(scope.pollingOptionsForm.$pristine).toBeTruthy();
    }));
});