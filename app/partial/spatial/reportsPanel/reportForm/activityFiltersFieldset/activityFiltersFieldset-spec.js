/*
Developed with the contribution of the European Commission - Directorate General for Maritime Affairs and Fisheries
© European Union, 2015-2016.

This file is part of the Integrated Fisheries Data Management (IFDM) Suite. The IFDM Suite is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as published by the
Free Software Foundation, either version 3 of the License, or any later version. The IFDM Suite is distributed in
the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. You should have received a
copy of the GNU General Public License along with the IFDM Suite. If not, see <http://www.gnu.org/licenses/>.
*/
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
