/*
Developed with the contribution of the European Commission - Directorate General for Maritime Affairs and Fisheries
© European Union, 2015-2016.

This file is part of the Integrated Fisheries Data Management (IFDM) Suite. The IFDM Suite is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as published by the
Free Software Foundation, either version 3 of the License, or any later version. The IFDM Suite is distributed in
the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. You should have received a
copy of the GNU General Public License along with the IFDM Suite. If not, see <http://www.gnu.org/licenses/>.
 */
describe('CommunicationChannel', function() {

    beforeEach(module('unionvmsWeb'));

    var responseData = {
        name: "VMS2",
        id: "1234-5678-9012-3456-2345-7891-678901",
        pollChannel: true,
        configChannel: false,
        dnid :"1",
        memberNumber: "1123",
        startDate : "2015-06-01T09:00:00Z",
        endDate : "2015-06-01T09:00:00Z"
    };

    function verifyChannel(channel) {
        var currentTimeZoneOffsetInHours = (new Date().getTimezoneOffset()) / 60;
        var prefix = currentTimeZoneOffsetInHours >= 0 ? "+" : "-";
        currentTimeZoneOffsetInHours = ("00" + Math.abs(currentTimeZoneOffsetInHours)).substr(-2,2);

        expect(channel.name).toEqual("VMS2");
        expect(channel.id).toBe("1234-5678-9012-3456-2345-7891-678901");
        expect(channel.DNID).toEqual("1");
        expect(channel.memberNumber).toEqual("1123");
        expect(channel.startDate).toEqual("2015-06-01 09:00:00 " + prefix + currentTimeZoneOffsetInHours + ":00");
        expect(channel.endDate).toEqual("2015-06-01 09:00:00 " + prefix + currentTimeZoneOffsetInHours + ":00");
        expect(channel.pollChannel).toBe(true);
        expect(channel.configChannel).toBe(false);
    }

    it('should parse JSON input correctly', inject(function(CommunicationChannel) {
        verifyChannel(CommunicationChannel.fromJson(responseData));
    }));

    it('should make an exact copy of itself', inject(function(CommunicationChannel) {
        verifyChannel(CommunicationChannel.fromJson(responseData).copy());
    }));
});
