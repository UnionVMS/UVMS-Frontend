describe('MobileTerminalHistory', function() {

  beforeEach(module('unionvmsWeb'));

    var responseData = { 
        "eventCode": "LINK",
        "carrier": {
            "carrierType": "VESSEL",
            "idType": "IRCS",
            "value": "HJASDP"
        },
        "attributes": [{
            "fieldType": "SATELLITE_NUMBER",
            "value": "12345"
        },
        {
            "fieldType": "INSTALLED_ON",
            "value": "2006-04-03"
        },
        {
            "fieldType": "UNINSTALLED_ON",
            "value": "2009-12-22"
        }],
        "channels": [{
            "attributes": [{
                "type": "DNID",
                "value": "12345"
            },
            {
                "type": "MEMBER_ID",
                "value": "7"
            },
            {
                "type": "START_DATE",
                "value": "2015-04-07T14:27:00"
            },
            {
                "type": "STOP_DATE",
                "value": "2015-04-09T14:27:00"
            }],
            "channelType": "VMS",
            "order": 1
        }],
        "changeDate": 1430949600000,
        "comments": "Automatic create comment"
    };


    it('fromJson should build a correct object', inject(function(MobileTerminalHistory) {
        var history = MobileTerminalHistory.fromJson(responseData);
        
        expect(Object.keys(history.attributes).length).toEqual(3);
        expect(history.attributes.SATELLITE_NUMBER).toEqual("12345");
        expect(history.comment).toEqual(responseData.comments);
        expect(history.eventCode).toEqual(responseData.eventCode);
        expect(history.changeDate).toEqual(responseData.changeDate);
        
        expect(Object.keys(history.channels[0].ids).length).toEqual(4);
        expect(history.channels[0].order).toEqual(1);
        expect(history.channels[0].channelType).toEqual("VMS");
        expect(history.channels[0].ids.DNID).toEqual("12345");
        expect(history.channels[0].ids.MEMBER_ID).toEqual("7");

        expect(history.carrierId).toBeDefined();

       
    }));


});
