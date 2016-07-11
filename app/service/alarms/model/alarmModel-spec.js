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
describe('Alarm', function() {

    var alarmData = {
        "guid": "1",
        "status": "OPEN",
        "openDate": "2015-10-23 08:40:56 +0200",
        "updated": "2015-10-23 08:40:56 +0200",
        "updatedBy": "CLOSING USER",
        "assetGuid": "ABCD1234",
        "recipient" : "FIN",
        "alarmItem": [
          {
            "guid": "ALARM_ITEM_GUID_1",
            "ruleGuid": "RULE_GUID",
            "ruleName": "Sanity check - Latitude must exist"
          },
          {
            "guid": "ALARM_ITEM_GUID_2",
            "ruleGuid": "RULE_GUID",
            "ruleName": "Sanity check - Longitude must exist"
          }
        ],
        "rawMovement": {
            "guid": "RAW_MOVEMENT_GUID_1",
            "connectId": "connectId_1",
            "assetId": {
                "assetType": "VESSEL",
                "assetIdList": [
                    {
                        "idType": "CFR",
                        "value": "SWE111111"
                    }
                ]
            },
            "comChannelType": "MOBILE_TERMINAL",
            "mobileTerminal": {
                "guid": "MOBILE_TERMINAL_GUID_1",
                "connectId": "connectid_1",
                "mobileTerminalIdList": null
            },
            "position": {
                "longitude": 1.11,
                "latitude": 1.22,
                "altitude": 0.0
            },
            "positionTime": 1445582456984,
            "status": "010",
            "reportedSpeed": 11.1,
            "reportedCourse": 1.11,
            "movementType": "POS",
            "source": "INMARSAT_C",
            "activity": {
                "messageType": "COE",
                "messageId": "messageid_1",
                "callback": "callback_1"
            }
        }
    };

    beforeEach(module('unionvmsWeb'));


    it("should parse JSON correctly", inject(function(Alarm) {
        var alarm = Alarm.fromDTO(alarmData);

        expect(alarm.guid).toEqual(alarmData.guid);
        expect(alarm.status).toEqual(alarmData.status);
        expect(alarm.openDate).toEqual(alarmData.openDate);
        expect(alarm.updated).toEqual(alarmData.updated);
        expect(alarm.updatedBy).toEqual(alarmData.updatedBy);
        expect(alarm.vesselGuid).toEqual(alarmData.assetGuid);
        expect(alarm.recipient).toEqual(alarmData.recipient);
        expect(alarm.alarmItems.length).toEqual(alarmData.alarmItem.length);

        expect(alarm.asset.type).toEqual(alarmData.rawMovement.assetId.assetType);
        expect(Object.keys(alarm.asset.ids).length).toEqual(alarmData.rawMovement.assetId.assetIdList.length);

        //Movement
        expect(alarm.movement.guid).toEqual(alarmData.rawMovement.guid);
        expect(alarm.movement.movementType).toEqual(alarmData.rawMovement.messageType);
        expect(alarm.movement.connectId).toEqual(alarmData.rawMovement.connectId);
    }));


    it("isOpen should return true only when status is OPEN", inject(function(Alarm) {
        var alarm = Alarm.fromDTO(alarmData);
        alarm.status = "OPEN";
        expect(alarm.isOpen()).toBeTruthy();

        alarm.status = "open";
        expect(alarm.isOpen()).toBeTruthy();

        alarm.status = "CLOSED";
        expect(alarm.isOpen()).toBeFalsy();

        alarm.status = "";
        expect(alarm.isOpen()).toBeFalsy();
    }));

    it("isReprocessed should return true only when status is REPROCESSED", inject(function(Alarm) {
        var alarm = Alarm.fromDTO(alarmData);
        alarm.status = "REPROCESSED";
        expect(alarm.isReprocessed()).toBeTruthy();

        alarm.status = "reprocessed";
        expect(alarm.isReprocessed()).toBeTruthy();

        alarm.status = "OPEN";
        expect(alarm.isReprocessed()).toBeFalsy();

        alarm.status = "";
        expect(alarm.isReprocessed()).toBeFalsy();
    }));

    it("isRejected should return true only when status is REJECTED", inject(function(Alarm) {
        var alarm = Alarm.fromDTO(alarmData);
        alarm.status = "REJECTED";
        expect(alarm.isRejected()).toBeTruthy();

        alarm.status = "rejected";
        expect(alarm.isRejected()).toBeTruthy();

        alarm.status = "OPEN";
        expect(alarm.isRejected()).toBeFalsy();

        alarm.status = "";
        expect(alarm.isRejected()).toBeFalsy();
    }));


    it('copy should return a copy of the object', inject(function(Alarm) {
        var alarm = Alarm.fromDTO(alarmData);
        var copy = alarm.copy();

        expect(copy.equals(alarm)).toBeTruthy();
        expect(copy.alarmItems.length).toEqual(alarm.alarmItems.length);

        //Verify that original item isn't changed
        copy.alarmItems[0].guid = 'CHANGED';
        expect(alarm.alarmItems[0].guid).not.toEqual('CHANGED');


    }));


    it("DTO() should create an object with guid and status and linkedVessel", inject(function(Alarm, Vessel) {
        var alarm = Alarm.fromDTO(alarmData);

        var vessel = new Vessel();
        vessel.vesselId = {
            guid: "ABCD123"
        };
        alarm.placeholderVessel = vessel;

        alarm.setStatusToReprocessed();
        alarm.setUpdatedBy("TEST");

        var dto = alarm.DTO();

        expect(dto.guid).toEqual(alarm.guid);
        expect(dto.status).toEqual("REPROCESSED");
        expect(dto.updatedBy).toEqual("TEST");
        //Skip linkedVesselGuid for now
        //expect(dto.linkedVesselGuid).toEqual(vessel.vesselId.guid);
    }));

    it('getResolvedDate should return updateDate when status isnt open', inject(function(Alarm) {
        var alarm = Alarm.fromDTO(alarmData);
        var updated = '2015-01-01 12:00:00';
        alarm.updated = updated;

        alarm.status = "OPEN";
        expect(alarm.getResolvedDate()).toBeUndefined();

        alarm.status = "REPROCESSED";
        expect(alarm.getResolvedDate()).toEqual(updated);

        alarm.status = "REJECTED";
        expect(alarm.getResolvedDate()).toEqual(updated);
    }));

    it('getResolvedBy should return updatedBy when status isnt open', inject(function(Alarm) {
        var alarm = Alarm.fromDTO(alarmData);
        var updatedBy = 'TEST_USER';
        alarm.updatedBy = updatedBy;

        alarm.status = "OPEN";
        expect(alarm.getResolvedBy()).toBeUndefined();

        alarm.status = "REPROCESSED";
        expect(alarm.getResolvedBy()).toEqual(updatedBy);

        alarm.status = "REJECTED";
        expect(alarm.getResolvedBy()).toEqual(updatedBy);
    }));

});