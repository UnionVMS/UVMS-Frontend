describe('Alarm', function() {

    var alarmData = {
        "guid": "1",
        "status": "OPEN",
        "openDate": "2015-10-23 08:40:56 +0200",
        "updated": "2015-10-23 08:40:56 +0200",
        "updatedBy": "CLOSING USER",
        "vesselGuid": "ABCD1234",
        "recipient" : "FIN",
        "sender" : "SWE",
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
        expect(alarm.vesselGuid).toEqual(alarmData.vesselGuid);
        expect(alarm.recipient).toEqual(alarmData.recipient);
        expect(alarm.sender).toEqual(alarmData.sender);
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

    it("isClosed should return true only when status is CLOSED", inject(function(Alarm) {
        var alarm = Alarm.fromDTO(alarmData);
        alarm.status = "CLOSED";
        expect(alarm.isClosed()).toBeTruthy();

        alarm.status = "closed";
        expect(alarm.isClosed()).toBeTruthy();

        alarm.status = "OPEN";
        expect(alarm.isClosed()).toBeFalsy();

        alarm.status = "";
        expect(alarm.isClosed()).toBeFalsy();
    }));

    it("isPending should return true only when status is PENDING", inject(function(Alarm) {
        var alarm = Alarm.fromDTO(alarmData);
        alarm.status = "PENDING";
        expect(alarm.isPending()).toBeTruthy();

        alarm.status = "pending";
        expect(alarm.isPending()).toBeTruthy();

        alarm.status = "OPEN";
        expect(alarm.isPending()).toBeFalsy();

        alarm.status = "";
        expect(alarm.isPending()).toBeFalsy();
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

        alarm.setStatusToClosed();
        alarm.setUpdatedBy("TEST");
        alarm.inactivatePosition   = true;

        var dto = alarm.DTO();

        expect(dto.guid).toEqual(alarm.guid);
        expect(dto.status).toEqual("CLOSED");
        expect(dto.updatedBy).toEqual("TEST");
        //Skip linkedVesselGuid for now
        //expect(dto.linkedVesselGuid).toEqual(vessel.vesselId.guid);
        expect(dto.inactivatePosition).toEqual(true);
    }));
});
