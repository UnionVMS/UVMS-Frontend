describe('NewsubscriptionCtrl', function() {

	beforeEach(module('unionvmsWeb'));

	var scope,ctrl;

	beforeEach(inject(function($rootScope, $controller) {
		scope = $rootScope.$new();
		ctrl = $controller('NewsubscriptionCtrl', {$scope: scope});
	}));

	it('should ...', inject(function() {

			expect(1).toEqual(1);
			
	}));

});