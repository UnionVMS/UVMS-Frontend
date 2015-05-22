describe('CommunicationChannel', function() {

    beforeEach(module('unionvmsWeb'));

    var responseData = {
        name: "VMS2",
        defaultReporting: true,
        guid: "1234-5678-9012-3456-2345-7891-678901",
        capabilities: [
            {
                "type": "POLLING",
                "value": true
            },
            {
                "type": "CONFIG",
                "value": false
            }
        ],
        attributes : [
            {
                "type" :"DNID",
                "value": "1"
            },
            {
                "type": "MEMBER_NUMBER",
                "value": "1123"
            },
            {
                "type": "START_DATE",
                "value": "2015-01-01 09:00"
            },
            {
                "type": "STOP_DATE",
                "value": "2015-03-01 09:00"
            }
        ]
    };

    function verifyChannel(channel) {
        expect(channel.name).toEqual("VMS2");
        expect(channel.defaultReporting).toBe(true);
        expect(channel.guid).toBe("1234-5678-9012-3456-2345-7891-678901");
        expect(channel.ids.DNID).toEqual("1");
        expect(channel.ids.MEMBER_NUMBER).toEqual("1123"); 
        expect(channel.ids.START_DATE).toEqual("2015-01-01 09:00"); 
        expect(channel.ids.STOP_DATE).toEqual("2015-03-01 09:00");
        expect(channel.capabilities.POLLING).toBe(true);
        expect(channel.capabilities.CONFIG).toBe(false);
    }

    it('should parse JSON input correctly', inject(function(CommunicationChannel) {
        verifyChannel(CommunicationChannel.fromJson(responseData));
    }));

    it('should produce a transfer object identical to the original data', inject(function(CommunicationChannel) {
        var channel = CommunicationChannel.fromJson(responseData);
        expect(angular.equals(channel.dataTransferObject(), responseData)).toBeTruthy();
    }));

    it('should format its start date correctly', inject(function(CommunicationChannel) {
        var channel = CommunicationChannel.fromJson(responseData);
        expect(channel.getFormattedStartDate()).toEqual("2015-01-01");
    }));

    it('should format its stop date correctly', inject(function(CommunicationChannel) {
        var channel = CommunicationChannel.fromJson(responseData);
        expect(channel.getFormattedStopDate()).toEqual("2015-03-01");
    }));

    it('should make an exact copy of itself', inject(function(CommunicationChannel) {
        verifyChannel(CommunicationChannel.fromJson(responseData).copy());
    }));
});
