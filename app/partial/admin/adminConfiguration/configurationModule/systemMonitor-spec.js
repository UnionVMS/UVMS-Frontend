describe('SystemMonitorController', function() {

	var scope;

	beforeEach(module('unionvmsWeb'));

	beforeEach(inject(function($rootScope, $controller) {
		scope = $rootScope.$new();
		$controller('SystemMonitorController', {'$scope': scope});
	}));

	it('should set status label online or offline', function() {
		expect(scope.statusLabel({online: true})).toBe('config.online');
		expect(scope.statusLabel({online: false})).toBe('config.offline');
	});

});