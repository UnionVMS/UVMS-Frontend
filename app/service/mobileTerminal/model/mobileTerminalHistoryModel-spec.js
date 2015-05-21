describe('MobileTerminalHistory', function() {

    beforeEach(module('unionvmsWeb'));

    var responseData  = {
        "changeDate": 1432209400084,
        "comments": "Automatic create comment",
        "eventCode": "CREATE",
        "mobileTerminal": {
            "attributes": [{
                "type": "SATELLITE_NUMBER",
                "value": "3435"
            },
            {
                "type": "ANTENNA",
                "value": "dgnlkj"
            }],
            "channels": [{
                "attributes": [
                {
                    "type": "DNID",
                    "value": "1253"
                },
                {
                    "type": "MEMBER_NUMBER",
                    "value": "5370"
                },
                {
                    "type": "START_DATE",
                    "value": "Thu May 21 13:56:40 CEST 2015"
                }],
                "capabilities": null,
                "defaultReporting": false,
                "name": "VMS"
            }],
            "inactive": false,
            "mobileTerminalId": {
                "guid": "909c7e99-0276-4ff1-8574-13221485b42a"
            },
            "source": "INTERNAL",
            "type": "INMARSAT_C"
        }
    };

    it('fromJson should build a correct object', inject(function(MobileTerminalHistory) {
        var history = MobileTerminalHistory.fromJson(responseData);
        
        expect(history.mobileTerminal.attributes.SATELLITE_NUMBER).toEqual("3435");
        expect(history.comment).toEqual(responseData.comments);
        expect(history.eventCode).toEqual(responseData.eventCode);
        expect(history.changeDate).toEqual(responseData.changeDate);
        
        expect(history.mobileTerminal.channels[0].name).toEqual("VMS");
        expect(history.mobileTerminal.channels[0].ids.DNID).toEqual("1253");
        expect(history.mobileTerminal.channels[0].ids.MEMBER_NUMBER).toEqual("5370");
    }));
});
