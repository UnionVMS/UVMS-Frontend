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