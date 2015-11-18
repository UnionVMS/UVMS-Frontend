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

    beforeEach(inject(function($rootScope, $httpBackend, $controller, MobileTerminal, Vessel) {
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

    beforeEach(inject(function($httpBackend) {
        //Mock
        $httpBackend.whenGET(/usm/).respond();
        $httpBackend.whenGET(/i18n/).respond();
        $httpBackend.whenGET(/globals/).respond({data : []});
    }));

	it('should assign mobile terminal when assigning to selected vessel', inject(function($q, mobileTerminalRestService,
     alertService) {
		var deferred = $q.defer();
		spyOn(mobileTerminalRestService, "assignMobileTerminal").andReturn(deferred.promise);
		deferred.resolve({data: response});
		// Skip alert message
		spyOn(alertService, "showSuccessMessage");
		scope.mergeCurrentMobileTerminalIntoSearchResults = function() {};
		scope.$digest();
		scope.assignToSelectedVesselWithComment("my comment");
		expect(mobileTerminalRestService.assignMobileTerminal).toHaveBeenCalled();
	}));
});
