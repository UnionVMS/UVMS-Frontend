describe('mobileTerminalFormCtrl', function() {

	beforeEach(module('unionvmsWeb'));

	var scope,ctrl;

    beforeEach(inject(function($rootScope, $controller, MobileTerminal) {
		scope = $rootScope.$new();
		ctrl = $controller('mobileTerminalFormCtrl', {$scope: scope});
		scope.currentMobileTerminal = new MobileTerminal();
    }));

	it('should unassign mobile terminal', inject(function($q, mobileTerminalRestService) {
		var deferred = $q.defer();
		spyOn(mobileTerminalRestService, "unassignMobileTerminal").andReturn(deferred.promise);
		scope.unassignVessel();
		deferred.resolve();
		expect(mobileTerminalRestService.unassignMobileTerminal).toHaveBeenCalled();
	}));
});
