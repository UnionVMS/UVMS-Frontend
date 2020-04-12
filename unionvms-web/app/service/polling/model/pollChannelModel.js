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
angular.module('unionvmsWeb').factory('PollChannel', function() {

    function PollChannel(){

        this.vesselName = undefined;
        this.vesselIrcs = undefined;
        this.connectId = undefined;
        this.mobileTerminalType = undefined;
        this.comChannelId = undefined;
        this.mobileTerminalAttributes = {};
        this.mobileTerminalId = undefined;
    }

    PollChannel.fromJson = function(data) {
        var pollChannel = new PollChannel();
        for (var i = 0; i < data.mobileTerminalAttributes.length; i++) {
            var attr = data.mobileTerminalAttributes[i];
            pollChannel.mobileTerminalAttributes[attr["type"]] = attr["value"];
        }

        pollChannel.vesselName = data.vesselName;
        pollChannel.vesselIrcs = data.vesselIrcs;
        pollChannel.connectId = data.connectId;
        pollChannel.mobileTerminalType = data.mobileTerminalType;
        pollChannel.comChannelId = data.comChannelId;
        pollChannel.mobileTerminalId = data.mobileTerminalId;

        return pollChannel;
    };

    PollChannel.prototype.isEqual = function(item) {
        return item.comChannelId === this.comChannelId;
    };

    PollChannel.prototype.toCreatePoll = function() {
        return {
            connectId: this.connectId,
            comChannelId: this.comChannelId,
            mobileTerminalId : this.mobileTerminalId
        };
    };

    return PollChannel;
});