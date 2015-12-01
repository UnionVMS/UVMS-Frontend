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

    it('should clean up on scope destroy', inject(function($rootScope, alertService, searchService) {
        var alertSpy = spyOn(alertService, "hideMessage");
        var searchSpy = spyOn(searchService, "reset");
        scope.$destroy();
        expect(alertSpy).toHaveBeenCalled();
        expect(searchSpy).toHaveBeenCalled();
    }));

    it('should not clean up alerts on scope destroy if hideAlertsOnScopeDestroy is set to false', inject(function($rootScope, alertService, searchService) {
        //Set scope.hideAlertsOnScopeDestroy to false
        scope.hideAlertsOnScopeDestroy = false;

        var alertSpy = spyOn(alertService, "hideMessage");
        var searchSpy = spyOn(searchService, "reset");

        scope.$destroy();
        expect(alertSpy).not.toHaveBeenCalled();
        expect(searchSpy).toHaveBeenCalled();
    }));
});

