/*
﻿Developed with the contribution of the European Commission - Directorate General for Maritime Affairs and Fisheries
© European Union, 2015-2016.

This file is part of the Integrated Fisheries Data Management (IFDM) Suite. The IFDM Suite is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as published by the
Free Software Foundation, either version 3 of the License, or any later version. The IFDM Suite is distributed in
the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. You should have received a
copy of the GNU General Public License along with the IFDM Suite. If not, see <http://www.gnu.org/licenses/>.
 */
describe('ManualPositionReportModalCtrl', function() {

	beforeEach(module('unionvmsWeb'));

	var scope, ctrl, getVesselsResponse;

    var mockModalInstance = {
        close: function() {},
        dismiss: function() {}
    };

    var reloadSpy;

    var mockLocale = {
        getString: function() {
            return 'fakeString';
        }
    };

    beforeEach(inject(function($rootScope, $httpBackend, $controller, Vessel, VesselListPage, ManualPosition) {
        scope = $rootScope.$new();
        scope.manualPositionReportForm = {
            '$valid': function() {
                return true;
            }
        };

        reloadSpy = jasmine.createSpy('reloadSpy');

        ctrl = $controller('ManualPositionReportModalCtrl', {
            $scope: scope,
            $modalInstance: mockModalInstance,
            positionReport: new ManualPosition(),
            addAnother: false,
            reloadFunction: reloadSpy,
            readOnly: false,
            sentReport: false,
            locale: mockLocale,
            openedFromMovementPage: false,
        });

        //Mock translation files for usm
        $httpBackend.whenGET(/^usm\//).respond({});
        //Mock locale file
        $httpBackend.whenGET(/^i18n\//).respond({});
        // Mock config
        $httpBackend.whenGET(/config/).respond({});

        var vessels = [];
        var vessel1 = new Vessel();
        var vessel2 = new Vessel();
        var vessel3 = new Vessel();
        vessels.push(vessel1);
        vessels.push(vessel2);
        vessels.push(vessel3);
        getVesselsResponse = new VesselListPage(vessels, 1, 1);
    }));

    it('getVesselsByIrcs should return list of vessels', inject(function($q, vesselRestService, alertService) {

          var deferred = $q.defer();
          spyOn(vesselRestService, "getVesselList").andReturn(deferred.promise);
          deferred.resolve(getVesselsResponse);

          var suggestions;
          scope.getVesselsByIrcs("A").then(function(data) {
              suggestions = data;
          });
          scope.$digest();
    	expect(suggestions.length).toEqual(3);
    }));

    it('getVesselsByCFR should return list of vessels', inject(function($q, vesselRestService, alertService) {

        var deferred = $q.defer();
        spyOn(vesselRestService, "getVesselList").andReturn(deferred.promise);
        deferred.resolve(getVesselsResponse);

        var suggestions;
        scope.getVesselsByCFR("A").then(function(data) {
            suggestions = data;
        });
        scope.$digest();
        expect(suggestions.length).toEqual(3);
    }));

    it('should clear movement', inject(function() {
        scope.positionReport.status = "999";
        scope.positionReport.carrier.flagState = "DNK";
        scope.guid = '8badf00d-1234';

        scope.clearMovement();

        expect(scope.positionReport.status).toBe("010");
        expect(scope.guid).not.toBeDefined();
    }));

    it('should initialize', function() {
        // Make it initialize with last known position
        scope.positionReport.carrier.ircs = 'ABC123';
        scope.positionReport.carrier.cfr = 'ABC123456789';

        // Should center the map on these coordinates
        scope.newPosition.lat = 57.343;
        scope.newPosition.lng = 11.563;

        spyOn(scope, 'resetMap');
        spyOn(scope, 'initLastPosition');
        scope.init();

        expect(scope.resetMap).toHaveBeenCalled();
        expect(scope.initLastPosition).toHaveBeenCalledWith('ABC123', 'ABC123456789');
        expect(scope.center).toEqual({
            lat: 57.343,
            lng: 11.563,
            zoom: 5
        });
    });

    it('should initialize last position', inject(function(vesselRestService, $q, GetListRequest) {
        var movement = {
            lat: 10,
            lng: 30
        };

        var deferred = $q.defer();
        deferred.resolve({
            items: [movement]
        });

        spyOn(scope, 'showLastMovementByVessel');
        spyOn(vesselRestService, 'getVesselList').andReturn(deferred.promise);

        scope.initLastPosition('ircs123', 'cfr123');

        var expectedRequest = new GetListRequest(1,1,true,[]);
        expectedRequest.addSearchCriteria("IRCS", "ircs123");
        expectedRequest.addSearchCriteria("CFR", "cfr123");

        scope.$digest();
        expect(vesselRestService.getVesselList).toHaveBeenCalledWith(expectedRequest);
        expect(scope.showLastMovementByVessel).toHaveBeenCalledWith(movement);

    }));

    it('should return correct modal title', function() {
        scope.readOnly = false;
        scope.sendSuccess = false;
        scope.confirmSend = false;
        expect(scope.modalTitle()).toBe("movement.manual_position_header_new");

        scope.confirmSend = true;
        expect(scope.modalTitle()).toBe("movement.manual_position_header_confirm");

        scope.sendSuccess = true;
        expect(scope.modalTitle()).toBe("movement.manual_position_header_sent");

        scope.readOnly = true;
        expect(scope.modalTitle()).toBe("movement.position_report_header");
    });

    it('should close modal and add another', inject(function() {
        scope.positionReport.carrier.ircs = 'ircs123';
        scope.positionReport.carrier.cfr = 'cfr123';
        scope.positionReport.carrier.externalMarking = 'ext123';
        scope.positionReport.carrier.name = 'name123';
        ctrl.addAnother = true;

        spyOn(mockModalInstance, 'close');
        scope.closeModal();
        expect(mockModalInstance.close).toHaveBeenCalledWith({
            addAnother: true,
            ircs: 'ircs123',
            cfr: 'cfr123',
            externalMarking: 'ext123',
            name: 'name123'
        });
    }));

    it('should not save position if waiting for response', inject(function(manualPositionRestService) {
        spyOn(manualPositionRestService, 'updateManualMovement');
        spyOn(manualPositionRestService, 'createManualMovement');
        scope.waitingForResponse = true;
        scope.savePosition();
        expect(manualPositionRestService.updateManualMovement).not.toHaveBeenCalled();
        expect(manualPositionRestService.createManualMovement).not.toHaveBeenCalled();
    }));

    it('should update existing position', inject(function(manualPositionRestService, $q, ManualPosition) {
        var report = new ManualPosition();
        scope.waitingForResponse = false;
        scope.positionReport = report;
        scope.positionReport.guid = 'guid-1234';
        var deferred = $q.defer();
        spyOn(manualPositionRestService, 'updateManualMovement').andReturn(deferred.promise);
        spyOn(scope, 'setSuccessText');

        // Call save position
        scope.savePosition();
        expect(manualPositionRestService.updateManualMovement).toHaveBeenCalledWith(report);
        expect(scope.waitingForResponse).toBe(true);

        // Resolve and verify scope updated
        deferred.resolve();
        scope.$digest();
        expect(reloadSpy).toHaveBeenCalled();
        expect(scope.setSuccessText).toHaveBeenCalledWith('fakeString', scope.closeModal);
        expect(scope.waitingForResponse).toBe(false);
    }));

    it('should create a new position', inject(function(manualPositionRestService, $q, ManualPosition) {
        var report = new ManualPosition();
        scope.waitingForResponse = false;
        scope.positionReport = report;
        scope.positionReport.guid = undefined;
        var deferred = $q.defer();
        spyOn(manualPositionRestService, 'createManualMovement').andReturn(deferred.promise);
        spyOn(scope, 'setSuccessText');

        // Call save position
        scope.savePosition();
        expect(manualPositionRestService.createManualMovement).toHaveBeenCalledWith(report);
        expect(scope.waitingForResponse).toBe(true);

        // Resolve and verify scope updated
        deferred.resolve();
        scope.$digest();
        expect(reloadSpy).toHaveBeenCalled();
        expect(scope.setSuccessText).toHaveBeenCalledWith('fakeString', scope.closeModal);
        expect(scope.waitingForResponse).toBe(false);
    }));

    it('should show error if unsuccessful', inject(function(manualPositionRestService, $q, ManualPosition) {
        scope.waitingForResponse = false;
        scope.positionReport.guid = undefined;
        var deferred = $q.defer();
        spyOn(manualPositionRestService, 'createManualMovement').andReturn(deferred.promise);
        spyOn(scope, 'setErrorText');

        scope.savePosition();

        deferred.reject();
        scope.$digest();
        expect(reloadSpy).not.toHaveBeenCalled();
        expect(scope.setErrorText).toHaveBeenCalledWith('fakeString');
        expect(scope.waitingForResponse).toBe(false);
    }));

    it('should confirm send of new position', inject(function(manualPositionRestService) {
        scope.confirmSend = false;
        spyOn(manualPositionRestService, 'saveAndSendMovement');
        scope.sendPosition();
        expect(manualPositionRestService.saveAndSendMovement).not.toHaveBeenCalled();
    }));

    it('should send new position once confirmed', inject(function(manualPositionRestService, $q, ManualPosition) {
        var deferred = $q.defer();
        var report = new ManualPosition();
        scope.positionReport = report;
        scope.confirmSend = true;
        scope.sendSuccess = false;
        spyOn(manualPositionRestService, 'saveAndSendMovement').andReturn(deferred.promise);
        spyOn(scope, 'setSuccessText');

        // Send position and wait for promise to resolve
        scope.sendPosition();
        expect(manualPositionRestService.saveAndSendMovement).toHaveBeenCalledWith(report);
        expect(scope.waitingForResponse).toBe(true);

        // Resolve promise
        deferred.resolve();
        scope.$digest();
        expect(scope.sendSuccess).toBe(true);
        expect(scope.waitingForResponse).toBe(false);
        expect(scope.setSuccessText).toHaveBeenCalledWith('fakeString', scope.closeModal);
        expect(reloadSpy).toHaveBeenCalled();
    }));

    it('should update scope if sending of new position was unsuccessful', inject(function(manualPositionRestService, $q) {
        var deferred = $q.defer();
        spyOn(manualPositionRestService, 'saveAndSendMovement').andReturn(deferred.promise);
        scope.confirmSend = true;
        spyOn(scope, 'setErrorText');

        scope.sendPosition();
        deferred.reject();
        scope.$digest();

        expect(scope.waitingForResponse).toBe(false);
        expect(scope.sendSuccess).toBe(false);
        expect(scope.setErrorText).toHaveBeenCalledWith('fakeString');
    }));

    it('should dismiss modal on cancel', function() {
        spyOn(mockModalInstance, 'dismiss');
        scope.cancel();
        expect(mockModalInstance.dismiss).toHaveBeenCalled();
    });

    it('should reset confirm send on back', function() {
        scope.confirmSend = true;
        scope.back();
        expect(scope.confirmSend).toBe(false);
    });

    it('should return marker bounds', function() {
        scope.markers.newPosition = {lat: 3, lng: 57};
        scope.markers.lastPosition = {lat: 8, lng: -12};
        var bounds = scope.getMarkerBounds();
        expect(bounds).toEqual([
            [3, 57],
            [8, -12]
        ]);
    });

    it('should filter out undefined positions', function() {
        scope.markers.newPosition = {lat: 3, lng: 57};
        scope.markers.lastPosition = undefined;
        var bounds = scope.getMarkerBounds();
        expect(bounds).toEqual([
            [3, 57]
        ]);
    });

    // $scope.updateNewPositionVisibility()
    it('should remove markers if new position has invalid coordinates', inject(function(coordinateFormatService) {
        spyOn(coordinateFormatService, 'isValidLatitude').andReturn(false);
        spyOn(coordinateFormatService, 'isValidLongitude').andReturn(false);
        scope.markers.newPosition = {};
        scope.updateNewPositionVisibility();
        expect(scope.markers).toEqual({});
    }));

    it('should set markers to single new position marker', inject(function(coordinateFormatService) {
        spyOn(coordinateFormatService, 'isValidLatitude').andReturn(true);
        spyOn(coordinateFormatService, 'isValidLongitude').andReturn(true);
        scope.markers.newPosition = undefined;
        scope.newPosition = {lat: 1, lng: 2};
        scope.updateNewPositionVisibility();
        expect(scope.markers).toEqual({
            newPosition: {
                lat: 1,
                lng: 2
            }
        });
    }));

    it('should set marker for last position', function(argument) {
        scope.lastPosition = {lat: 12, lng: 13};
        scope.updateNewPositionVisibility();
        expect(scope.markers.lastPosition).toEqual({
            lat: 12,
            lng: 13
        });
    });

    it('should reset marker for last position', function () {
        scope.markers.lastPosition = { lat: 12, lng: 13 };
        scope.lastPosition = undefined;
        scope.updateNewPositionVisibility();
        expect(scope.markers.lastPosition).not.toBeDefined();
    });

    it('should reset map if no markers', inject(function(coordinateFormatService) {
        spyOn(coordinateFormatService, 'isValidLatitude').andReturn(false);
        spyOn(coordinateFormatService, 'isValidLongitude').andReturn(false);
        scope.lastPosition = undefined;
        scope.newPosition = {lat: 1, lng: 2};
        spyOn(scope, 'resetMap');
        scope.updateNewPositionVisibility();
        expect(Object.keys(scope.markers).length).toBe(0);
        expect(scope.resetMap).toHaveBeenCalled();
    }));

    it('should reset marker for last position', inject(function(coordinateFormatService) {
        spyOn(coordinateFormatService, 'isValidLatitude').andReturn(true);
        spyOn(coordinateFormatService, 'isValidLongitude').andReturn(true);
        scope.newPosition = {lat: 1, lng: 2};

        scope.updateNewPositionVisibility();
        expect(Object.keys(scope.markers).length).toBe(1);
        expect(scope.center).toEqual({
            lat: 1,
            lng: 2,
            zoom: 5
        });
    }));

    it('should reset marker for last position', inject(function(coordinateFormatService) {
        spyOn(coordinateFormatService, 'isValidLatitude').andReturn(true);
        spyOn(coordinateFormatService, 'isValidLongitude').andReturn(true);
        scope.newPosition = { lat: 2, lng: 6 };
        scope.lastPosition = { lat: 4, lng: 8 };

        scope.updateNewPositionVisibility();
        expect(Object.keys(scope.markers).length).toBe(2);
        expect(scope.bounds).toEqual({
            northEast: { lat: 2, lng: 6 },
            southWest: { lat: 4, lng: 8 }
        });
    }));

    it('should watch latitude and update new position visibility', function() {
        spyOn(scope, 'updateNewPositionVisibility');
        scope.positionReport.position.latitude = 12;
        scope.$digest();
        expect(scope.updateNewPositionVisibility).toHaveBeenCalled();
    });

    it('should watch longitude and update new position visibility', function() {
        spyOn(scope, 'updateNewPositionVisibility');
        scope.positionReport.position.longitude = 12;
        scope.$digest();
        expect(scope.updateNewPositionVisibility).toHaveBeenCalled();
    });

    it('should should determine high-speed', function() {
        scope.measuredSpeedWarningThreshold = 15;
        scope.positionReport.speed = 17;
        expect(scope.isHighSpeed()).toBe(true);
    });

    it('should dismiss modal on dismiss', function() {
        spyOn(mockModalInstance, 'dismiss');
        scope.dismiss();
        expect(mockModalInstance.dismiss).toHaveBeenCalled();
    });

    it('should update position report on suggested vessel select and show last movement', function() {
        spyOn(scope, 'showLastMovementByVessel');
        scope.onVesselSuggestionSelect({
            ircs: 'ircs123',
            name: 'name123',
            externalMarking: 'ext123',
            cfr: 'cfr123'
        });

        expect(scope.positionReport.carrier.ircs).toBe('ircs123');
        expect(scope.positionReport.carrier.name).toBe('name123');
        expect(scope.positionReport.carrier.externalMarking).toBe('ext123');
        expect(scope.positionReport.carrier.cfr).toBe('cfr123');
        expect(scope.showLastMovementByVessel).toHaveBeenCalled();
    });

    it('should reset last postition if movement is undefined', inject(function(ManualPosition) {
        scope.lastPosition = new ManualPosition();
        spyOn(scope, 'updateNewPositionVisibility');
        scope.setLastPosition(undefined);
        expect(scope.lastPosition).not.toBeDefined();
        expect(scope.updateNewPositionVisibility).toHaveBeenCalled();
    }));

    it('should set last postition', inject(function(ManualPosition, dateTimeService) {
        var position = new ManualPosition();
        position.movement = {};
        position.movement.longitude = 3.3;
        position.movement.latitude = 76;
        spyOn(scope, 'updateNewPositionVisibility');
        spyOn(mockLocale, 'getString').andReturn('fakeString');
        spyOn(dateTimeService, 'formatAccordingToUserSettings').andReturn("2015-11-18 13:03:44");

        scope.setLastPosition(position);
        expect(scope.updateNewPositionVisibility).toHaveBeenCalled();
        expect(mockLocale.getString).toHaveBeenCalledWith("movement.manual_position_label_previous_position", "2015-11-18 13:03:44");
        expect(scope.lastPosition).toEqual({
            lng: 3.3,
            lat: 76,
            message: 'fakeString',
            focus: true,
            icon: jasmine.any(Object)
        });
    }));

    it('should return if no vessel ID', inject(function(movementRestService) {
        spyOn(movementRestService, 'getLastMovement');
        scope.showLastMovementByVessel({
            vessel: {
                vesselId: undefined
            }
        });

        expect(movementRestService.getLastMovement).not.toHaveBeenCalled();
    }));

    it('should return if vessel ID type not GUID', inject(function(movementRestService) {
        spyOn(movementRestService, 'getLastMovement');
        scope.showLastMovementByVessel({
            vesselId: {
                type: "GUID-A"
            }
        });

        expect(movementRestService.getLastMovement).not.toHaveBeenCalled();
    }));

    it('should return if no vessel ID', inject(function(movementRestService) {
        spyOn(movementRestService, 'getLastMovement');
        scope.showLastMovementByVessel({
            vesselId: {
                type: "GUID",
                value: undefined
            }
        });

        expect(movementRestService.getLastMovement).not.toHaveBeenCalled();
    }));

    it('should fetch last movement given a vessel with valid vessel ID', inject(function(movementRestService, $q, ManualPosition) {
        var deferred = $q.defer();
        spyOn(movementRestService, 'getLastMovement').andReturn(deferred.promise);
        spyOn(scope, 'setLastPosition');
        scope.showLastMovementByVessel({
            vesselId: {
                type: "GUID",
                value: "ABC-123"
            }
        });

        expect(movementRestService.getLastMovement).toHaveBeenCalledWith("ABC-123");

        var p = new ManualPosition();
        deferred.resolve(p);
        scope.$digest();
        expect(scope.setLastPosition).toHaveBeenCalledWith(p);
    }));

});