describe('addNewMobileTerminalCtrl', function() {

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

    beforeEach(inject(function($rootScope, $controller) {
		scope = $rootScope.$new();
		ctrl = $controller('addNewMobileTerminalCtrl', {$scope: scope});
    }));

	it('should update currentMobileTerminal with created terminal', inject(function(MobileTerminal, $compile, $q, mobileTerminalRestService, alertService, locale) {
		scope.currentMobileTerminal = new MobileTerminal();

		// A form to be valid
		var element = angular.element('<form name="mobileTerminalForm"></form>');
		$compile(element)(scope);

		// Skip alert message
		spyOn(locale, "getString").andReturn();
		spyOn(alertService, "showSuccessMessage").andReturn();

		// Return a response
		var deferred = $q.defer();
		spyOn(mobileTerminalRestService, "createNewMobileTerminal").andReturn(deferred.promise);
		deferred.resolve(response);

		// Create new terminal and check INTERNAL_ID set on scope
		scope.createNewMobileTerminal();
		scope.$apply();
		expect(scope.currentMobileTerminal.mobileTerminalId.ids['INTERNAL_ID']).toBe("260");
	}));
});