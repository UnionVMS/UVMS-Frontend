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
describe('PositionReportModalCtrl', function() {

	beforeEach(module('unionvmsWeb'));

	var scope, createController, mockPositionReport;
    var mockModalInstance = {
        close: function() {},
        dismiss: function() {}
    };

    beforeEach(inject(function($rootScope, $controller, Movement) {
        scope = $rootScope.$new();
        mockPositionReport = new Movement();
        mockPositionReport.movement.latitude = 12;
        mockPositionReport.movement.longitude = 22;
        mockPositionReport.time = '2015-01-01 12:00';
        mockPositionReport.connectId = 'TestConnectId';
        createController = function(positionReportGuid){
            return $controller('PositionReportModalCtrl', {
                $scope: scope,
                $modalInstance: mockModalInstance,
                positionReport: mockPositionReport,
                positionReportGuid : positionReportGuid
            });
        };
    }));

    beforeEach(inject(function($httpBackend) {
        //Mock
        $httpBackend.whenGET(/usm/).respond();
        $httpBackend.whenGET(/i18n/).respond();
        $httpBackend.whenGET(/globals/).respond({data : []});
    }));

	it('should create marker on start', inject(function() {
        var ctrl = createController();
        scope.$digest();
		expect(Object.keys(scope.markers).length).toEqual(1);
	}));

    it('should get position from server when only positionReportGuid is provided', inject(function($q, Vessel, movementRestService, vesselRestService) {
        var deferred = $q.defer();
        deferred.resolve(mockPositionReport);
        var getMovementSpy = spyOn(movementRestService, "getMovement").andReturn(deferred.promise);
        var deferred2 = $q.defer();
        var vessel = new Vessel();
        vessel.name ="Test vessel";
        deferred2.resolve(vessel);
        var getVesselSpy = spyOn(vesselRestService, "getVesselByVesselHistoryId").andReturn(deferred2.promise);

        var ctrl = createController('ABC-123');
        scope.$digest();
        //Get movement should have been called
        expect(getMovementSpy).toHaveBeenCalledWith('ABC-123');
        scope.$digest();

        //Marker should have been created
        expect(getVesselSpy).toHaveBeenCalledWith('TestConnectId');
        //Get vessel should have been called
        expect(Object.keys(scope.markers).length).toEqual(1);
        scope.$digest();
        expect(scope.waitingForResponse).toBeFalsy();
    }));

    it('should dismiss modal on cancel', function() {
        spyOn(mockModalInstance, 'dismiss');
        var ctrl = createController();
        scope.cancel();
        expect(mockModalInstance.dismiss).toHaveBeenCalled();
    });
});