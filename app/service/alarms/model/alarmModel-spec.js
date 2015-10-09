describe('Alarm', function() {

    var alarmData = {
        guid: "abcdd-12345-fewf",
        affectedObject: "dummy_guid",
        openDate: "2015-10-09 08:13:09 +0200",
        resolveDate: "2015-10-09 08:13:09 +0200",
        resolvedBy: "close user",
        ruleTriggered: "Da Rule",
        sender: "SWE",
        status: "CLOSED",
    };

    beforeEach(module('unionvmsWeb'));


    it("should parse JSON correctly", inject(function(Alarm) {
        var alarm = Alarm.fromDTO(alarmData);

        expect(alarm.guid).toEqual(alarmData.guid);
        expect(alarm.openedDate).toEqual(alarmData.openDate);
        expect(alarm.affectedObject).toEqual(alarmData.affectedObject);
        expect(alarm.ruleName).toEqual(alarmData.ruleTriggered);
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

});
