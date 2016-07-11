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
describe('Movement', function() {

    beforeEach(module('unionvmsWeb'));
    var  move = {
        "guid": "73",
        "connectId": "67d73ab6-b461-432f-bded-d4548a08e3b1",
        "position": {
          "longitude": 1.0,
          "latitude": 55.0,
        },
        "positionTime": 1431106680000,
        "reportedCourse": 3.3,
        "reportedSpeed": 2,
        "status": "33",
        "calculatedSpeed": 12,
        "movementType": "POS",
        "source": "INMARSAT_C",
        "mobileTerminal": {
            "guid": "MOBILE_TERMINAL_GUID_1",
            "connectId": "connectid_1",
            "mobileTerminalIdList": [
              {
                "type": "MEMBER_NUMBER",
                "value": "MEMBER_NUMBER_1"
              },
              {
                "type": "DNID",
                "value": "DNID_1"
              }
            ]
        },
    };

    var  lastReportMovement = {
        "movementGUID": "73",
        "time": 1431106680000,
    };

     function verifyMovement(movement) {
        expect(movement.guid).toEqual(move.guid);
        expect(movement.time).toEqual('2015-05-08 17:38:00 +00:00');

        expect(movement.connectId).toEqual(move.connectId);

        expect(movement.movement.latitude).toEqual(move.position.latitude);
        expect(movement.movement.longitude).toEqual(move.position.longitude);
        expect(movement.movement.status).toEqual(move.status);
        expect(movement.movement.source).toEqual(move.source);
        expect(movement.movement.reportedCourse).toEqual(move.reportedCourse);
        expect(movement.movement.reportedSpeed).toEqual(move.reportedSpeed);
        expect(movement.movement.calculatedSpeed).toEqual(move.calculatedSpeed);
        expect(movement.movement.movementType).toEqual(move.movementType);
        expect(movement.mobileTerminalData.guid).toEqual(move.mobileTerminal.guid);
        expect(movement.mobileTerminalData.connectId).toEqual(move.mobileTerminal.connectId);
        expect(Object.keys(movement.mobileTerminalData.ids).length).toEqual(move.mobileTerminal.mobileTerminalIdList.length);
        expect(movement.mobileTerminalData.ids['DNID']).toBe("DNID_1");
    }

    it('Should parse JSON input correctly', inject(function(Movement) {
        verifyMovement(Movement.fromJson(move));
    }));

    it('Should parse lastReport JSON correctly', inject(function(Movement) {
        //Last report is used in vessel to show the latest report for a vessel
        //and this movement object has a other format the the ones in the list movements
        var m = Movement.fromJson(lastReportMovement);
        expect(m.time).toEqual(lastReportMovement.time);
        expect(m.guid).toEqual(lastReportMovement.movementGUID);
    }));


    it('setVessel should set correct data', inject(function(Movement, Vessel) {
        var movement = Movement.fromJson(move);
        var vessel = new Vessel();
        vessel.name = "TestName";
        vessel.ircs = "TestIRCS";
        vessel.countryCode = "TestContryCode";
        vessel.externalMarking = "TestExternalMarking";
        movement.setVessel(vessel);
        expect(movement.vessel).toEqual(vessel);
    }));

    it('isEqualMovement should return true only when guid is the same', inject(function(Movement, Vessel) {
        var movement = Movement.fromJson(move);
        var movement2 = Movement.fromJson(move);
        var movement3 = new Movement();
        movement3.guid = movement.guid;

        //Same guid means isEqualMovement is true
        expect(movement.isEqualMovement(movement2)).toBeTruthy();
        expect(movement.isEqualMovement(movement3)).toBeTruthy();

        //Different guid means isEqualMovement is false
        movement2.guid = "changed";
        expect(movement.isEqualMovement(movement2)).toBeFalsy();
    }));


    it('copy should return a copy of the object', inject(function(Movement, Vessel) {
        var movement = Movement.fromJson(move);
        var copy = movement.copy();

        //Verify that original item isn't changed
        copy.movement.status = 'CHANGED';
        expect(movement.movement.status).not.toEqual('CHANGED');

        expect(copy.isEqualMovement(movement)).toBeTruthy();

    }));

    it('should make an identical copy of a movement', inject(function(Movement) {
        var movement = Movement.fromJson(move);
        expect(movement.copy()).toEqual(movement);
    }));

 });