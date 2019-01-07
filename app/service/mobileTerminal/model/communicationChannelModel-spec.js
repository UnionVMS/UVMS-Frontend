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
        defaultReporting: true,
        id: "1234-5678-9012-3456-2345-7891-678901",
        defaultChannel: true,
        configChannel: false,
        DNID :"1",
        memberNumber: "1123",
        startDate : "2015-06-01 09:00 +02:00",
        endDate : "2015-06-01 09:00 +02:00"
    };

    function verifyChannel(channel) {
        expect(channel.name).toEqual("VMS2");
        expect(channel.defaultReporting).toBe(true);
        expect(channel.id).toBe("1234-5678-9012-3456-2345-7891-678901");
        expect(channel.DNID).toEqual("1");
        expect(channel.memberNumber).toEqual("1123"); 
        expect(channel.startDate).toEqual("2015-06-01 09:00 +02:00"); 
        expect(channel.endDate).toEqual("2015-06-01 09:00 +02:00");
        expect(channel.pollChannel).toBe(true);
        expect(channel.configChannel).toBe(false);
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
        expect(channel.getFormattedStartDate()).toEqual("2015-06-01 09:00 +02:00");
    }));

    it('should format its stop date correctly', inject(function(CommunicationChannel) {
        var channel = CommunicationChannel.fromJson(responseData);
        expect(channel.getFormattedStopDate()).toEqual("2015-06-01 09:00 +02:00");
    }));

    it('should make an exact copy of itself', inject(function(CommunicationChannel) {
        verifyChannel(CommunicationChannel.fromJson(responseData).copy());
    }));
});