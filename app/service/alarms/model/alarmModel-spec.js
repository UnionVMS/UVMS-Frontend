describe('Alarm', function() {

    var alarmData = {
        guid: "abcdd-12345-fewf",
        assetId: {
            type: "DUMMY_ASSET_TYPE_1",
            value: "DUMMY_ASSET_TYPE_VALUE_1"
        },
        openDate: "2015-10-09 08:13:09 +0200",
        resolveDate: "2015-10-09 08:13:09 +0200",
        resolvedBy: "close user",
        ruleName: "Da Rule",
        sender: "SWE",
        status: "CLOSED",
    };

    beforeEach(module('unionvmsWeb'));


    it("should parse JSON correctly", inject(function(Alarm) {
        var alarm = Alarm.fromDTO(alarmData);

        expect(alarm.guid).toEqual(alarmData.guid);
        expect(alarm.openedDate).toEqual(alarmData.openDate);
        expect(alarm.assetId.type).toEqual(alarmData.assetId.type);
        expect(alarm.assetId.value).toEqual(alarmData.assetId.value);
        expect(alarm.ruleName).toEqual(alarmData.ruleName);
        expect(alarm.sender).toEqual(alarmData.sender);
        expect(alarm.resolvedDate).toEqual(alarmData.resolveDate);
        expect(alarm.resolvedBy).toEqual(alarmData.resolvedBy);
        expect(alarm.status).toEqual(alarmData.status);

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
        expect(alarm.isVesselAsset().toBeFalsy();

        alarm.assetId = {
            type : "ASSET",
            value : "test-123"
        };
        expect(alarm.isVesselAsset().toBeTruthy();

       alarm.assetId = {
            type : "OTHER_TYPE",
            value : "test-123"
        };

        expect(alarm.isVesselAsset().toBeFalsy();
    }));


});
