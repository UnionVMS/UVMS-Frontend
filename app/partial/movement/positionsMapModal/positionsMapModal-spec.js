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
describe('PositionsmapmodalCtrl', function() {

	beforeEach(module('unionvmsWeb'));

	var scope,ctrl;
    var m1, m2;

    var mockModalInstance = {
        close: function() {},
        dismiss: function() {}
    };

    beforeEach(inject(function($rootScope, $controller, Movement) {
        //Create mock positions
        m1 = new Movement();
        m1.movement.latitude = 12.45;
        m1.movement.longitude = 22.55;
        m1.time = "2015-01-01 12:00";
        m2 = new Movement();
        m2.movement.latitude = 70.11;
        m2.movement.longitude = -13.1;
        m1.time = "2016-01-01 12:00";

        scope = $rootScope.$new();
        ctrl = $controller('positionsMapModalCtrl', {
            $scope: scope,
            $modalInstance: mockModalInstance,
            positionReports : [m1, m2]
        });
    }));

	it('should add markes and set bounds on init', inject(function() {

        //Two markers should have been aded
		expect(Object.keys(scope.markers).length).toEqual(2);

        //Bounds should be set correct
        var expectedBounds = { northEast : { lat : 70.11, lng : 22.55 }, southWest : { lat : 12.45, lng : -13.1 }};
        expect(angular.equals(scope.bounds, expectedBounds)).toBeTruthy();

	}));

});