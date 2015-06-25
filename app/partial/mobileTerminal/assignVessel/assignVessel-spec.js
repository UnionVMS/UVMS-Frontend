describe('AssignvesselCtrl', function() {

	beforeEach(module('unionvmsWeb'));

	var scope,ctrl;

	var response = {
		mobileTerminalId: {
			systemType: "INMARSAT_C",
			idList: [{ type: "INTERNAL_ID",  value: "260" }]
		},
		attributes: [],
		channels: []
	};

    beforeEach(inject(function($rootScope, $controller, MobileTerminal, Vessel) {
		scope = $rootScope.$new();
		ctrl = $controller('AssignvesselCtrl', {$scope: scope});
		scope.currentMobileTerminal = new MobileTerminal();
		scope.toggleAssignVessel = function() {};
		scope.selectedVessel = new Vessel();
        scope.selectedVessel.vesselId = {
            guid : "asdasd-234dsaf234we-234234-24",
            type : "IRCS",
            value : "TESTIRCS1"
        };
    }));	

	it('should assign mobile terminal when assigning to selected vessel', inject(function($q, mobileTerminalRestService, locale, alertService) {
		var deferred = $q.defer();
		spyOn(mobileTerminalRestService, "assignMobileTerminal").andReturn(deferred.promise);
		deferred.resolve({data: response});
		// Skip alert message
		spyOn(locale, "getString").andReturn();
		spyOn(alertService, "showSuccessMessage").andReturn();
		scope.$apply();
		scope.assignToSelectedVesselWithComment("my comment");
		expect(mobileTerminalRestService.assignMobileTerminal).toHaveBeenCalled();
	}));
});
