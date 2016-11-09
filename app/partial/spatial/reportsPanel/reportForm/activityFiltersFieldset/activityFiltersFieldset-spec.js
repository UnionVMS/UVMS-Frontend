describe('ActivityfiltersfieldsetCtrl', function() {

	beforeEach(module('unionvmsWeb'));

	var scope,ctrl;

		beforeEach(inject(function($httpBackend) {
        //Mock
        $httpBackend.whenGET(/usm/).respond();
        $httpBackend.whenGET(/i18n/).respond();
        $httpBackend.whenGET(/globals/).respond({data : []});
    }));

    beforeEach(inject(function($rootScope, $controller) {
      scope = $rootScope.$new();
      ctrl = $controller('ActivityfiltersfieldsetCtrl', {$scope: scope});
			scope.$digest();
    }));	

	it('should load the combo items', inject(function() {
			expect(scope.reportTypes).not.toBeUndefined();
			expect(scope.reportTypes.length).not.toEqual(0);

			expect(scope.activityTypes).not.toBeUndefined();
			expect(scope.activityTypes.length).not.toEqual(0);

			expect(scope.ports).not.toBeUndefined();
			expect(scope.ports.length).not.toEqual(0);

			expect(scope.gearTypes).not.toBeUndefined();
			expect(scope.gearTypes.length).not.toEqual(0);

			expect(scope.species).not.toBeUndefined();
			expect(scope.species.length).not.toEqual(0);

			expect(scope.weightUnits).not.toBeUndefined();
			expect(scope.weightUnits.length).not.toEqual(0);
	}));

});