describe('MobileTerminalHistory', function() {

  beforeEach(module('unionvmsWeb'));

    var responseData = {
        "eventCode": "MODIFY",
        "dnid": {
            "type": "DNID",
            "value": "66542"
        },
        "memberId": {
            "type": "MEMBER_ID",
            "value": "23456"
        },
        "satelliteNumber": {
            "fieldType": "SATELLITE_NUMBER",
            "value": "2345"
        },
        "installedOn": {
            "fieldType": "INSTALLED_ON",
            "value": 1429367200000
        },        
        "uninstalledOn": {
            "fieldType": "UNINSTALLED_ON",
            "value": 1427467200000
        },              
        "changeDate": 1429567200000,
        "comments": "my comment"
    };

    it('fromJson should build a correct object', inject(function(MobileTerminalHistory) {
        var history = MobileTerminalHistory.fromJson(responseData);
        expect(history.eventCode).toEqual(responseData.eventCode);
        expect(history.changeDate).toEqual(responseData.changeDate);        
        expect(history.comment).toEqual(responseData.comments);

        expect(history.dnid).toEqual(responseData.dnid.value);
        expect(history.memberId).toEqual(responseData.memberId.value);
        expect(history.satelliteNumber).toEqual(responseData.satelliteNumber.value);
        expect(history.installed).toEqual(responseData.installedOn.value);
        expect(history.uninstalled).toEqual(responseData.uninstalledOn.value);
    }));


    it('getFormattedInstalled should format date correct', inject(function(MobileTerminalHistory) {
        var history = MobileTerminalHistory.fromJson(responseData);
        expect(history.getFormattedInstalled()).toEqual("2015-04-18");
    }));

    it('getFormattedUninstalled should format date correct', inject(function(MobileTerminalHistory) {
        var history = MobileTerminalHistory.fromJson(responseData);
        expect(history.getFormattedUninstalled()).toEqual("2015-03-27");
    }));

    it('getFormattedChangeDate should format date correct', inject(function(MobileTerminalHistory) {
        var history = MobileTerminalHistory.fromJson(responseData);
        expect(history.getFormattedChangeDate()).toEqual("2015-04-21");
    }));

});
