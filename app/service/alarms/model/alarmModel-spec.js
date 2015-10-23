describe('Alarm', function() {

    var alarmData = {
        "guid": "1",
        "status": "OPEN",
        "openDate": "2015-10-23 08:40:56 +0200",
        "resolveDate": "2015-10-23 08:40:56 +0200",
        "resolvedBy": "CLOSING USER",
        "alarmItem": [
          {
            "guid": "ALARM_ITEM_GUID_1",
            "ruleName": "Sanity check - Latitude must exist"
          },
          {
            "guid": "ALARM_ITEM_GUID_2",
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
        expect(alarm.openedDate).toEqual(alarmData.openDate);
        expect(alarm.resolvedDate).toEqual(alarmData.resolveDate);
        expect(alarm.resolvedBy).toEqual(alarmData.resolvedBy);
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

    it("isVesselAsset() should return true only when assetId type is VESSEL", inject(function(Alarm) {
        var alarm = new Alarm();
        expect(alarm.isVesselAsset()).toBeFalsy();

        alarm.asset = {type : "VESsEL"};
        expect(alarm.isVesselAsset()).toBeTruthy();

        alarm.asset = {type : "OTHER_TYPE"};
        expect(alarm.isVesselAsset()).toBeFalsy();
    }));

});
