describe('HeaderMenuCtrl', function() {

	beforeEach(module('unionvmsWeb'));

	it('should be active', inject(function($rootScope, $controller) {
		var scope = $rootScope.$new();
		var ctrl = $controller('HeaderMenuCtrl', {
			$scope: scope,
			$location: {
				path: function() {
					return "/uvms";
				}
			}
		});

		expect(scope.isActive("/uvms")).toBeTruthy();
		expect(scope.isActive("/uvms/apa")).toBeTruthy();

		expect(scope.isActive("uvms/apa")).toBeFalsy();
		expect(scope.isActive("")).toBeFalsy();
		expect(scope.isActive("/")).toBeFalsy();
		expect(scope.isActive("/uvms2")).toBeFalsy();
	}));

});
