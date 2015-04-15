describe('CommunicationChannel', function() {

  beforeEach(module('unionvmsWeb'));

    var responseData = {
        channelType: "VMS",
        order: 1,
        startDate: 1418652232,
        stopDate: 1428655732,
        idList : [
            {
                "type":"DNID",
                "value":"1"
            },
            {
                "type":"MEMBER_ID",
                "value":"1123"
            }
        ]
    };

    it('fromJson should build a correct object', inject(function(CommunicationChannel) {
        var channel = CommunicationChannel.fromJson(responseData);
        expect(channel.channelType).toEqual(responseData.channelType);
        expect(channel.order).toEqual(responseData.order);
        expect(channel.startDate).toEqual(responseData.startDate);
        expect(channel.stopDate).toEqual(responseData.stopDate);
        expect(Object.keys(channel.ids).length).toEqual(2);
        expect(channel.ids["DNID"]).toEqual("1");
        expect(channel.ids["MEMBER_ID"]).toEqual("1123");        
    }));

    it('toJson should return correctly formatted data', inject(function(CommunicationChannel) {
        var channel = CommunicationChannel.fromJson(responseData);
        var toJsonObject = JSON.parse(channel.toJson());
        expect(angular.equals(toJsonObject, responseData)).toBeTruthy();
    }));

    it('getFormattedStartDate should return correctly formatted date', inject(function(CommunicationChannel) {
        var channel = CommunicationChannel.fromJson(responseData);
        expect(channel.getFormattedStartDate()).toEqual("2014-12-15");
    }));

    it('getFormattedStopDate should return correctly formatted date', inject(function(CommunicationChannel) {
        var channel = CommunicationChannel.fromJson(responseData);
        expect(channel.getFormattedStopDate()).toEqual("2015-04-10");
    }));

});
