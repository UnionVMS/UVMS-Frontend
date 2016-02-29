describe('UserareasgroupsCtrl', function() {

	beforeEach(module('unionvmsWeb'));

	var scope,ctrl;

    beforeEach(inject(function($rootScope, $controller) {
      scope = $rootScope.$new();
      ctrl = $controller('UserareasgroupsCtrl', {$scope: scope});
    }));	

	it('should ...', inject(function() {

		expect(1).toEqual(1);
		
	}));

});