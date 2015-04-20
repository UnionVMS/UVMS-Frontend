describe('AssignvesselCtrl', function() {

	beforeEach(module('unionvmsWeb'));

	var scope,ctrl;

    beforeEach(inject(function($rootScope, $controller, MobileTerminal) {
		scope = $rootScope.$new();
		ctrl = $controller('AssignvesselCtrl', {$scope: scope});
		scope.currentMobileTerminal = new MobileTerminal();
		scope.toggleAssignVessel = function() {};
		scope.selectedVessel = { "vesselId": { "type": "ID","value": "123" } };
    }));	

	it('should assign mobile terminal when assigning to selected vessel', inject(function($q, mobileTerminalRestService) {
		var deferred = $q.defer();
		spyOn(mobileTerminalRestService, "assignMobileTerminal").andReturn(deferred.promise);
		scope.assignToSelectedVessel();
		deferred.resolve();
		expect(mobileTerminalRestService.assignMobileTerminal).toHaveBeenCalled();
	}));
});
