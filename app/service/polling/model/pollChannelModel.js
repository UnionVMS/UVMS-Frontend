angular.module('unionvmsWeb').factory('PollChannel', function() {

    function PollChannel(){
        this.vesselName = undefined;
        this.vesselIrcs = undefined;
        this.connectId = undefined;
        this.mobileTerminalType = undefined;
        this.comChannelId = undefined;
        this.attributes = {};
    }

    PollChannel.fromJson = function(data) {
        var pollChannel = new PollChannel();
        for (var i = 0; i < data.attributes.length; i++) {
            var attr = data.attributes[i];
            pollChannel.attributes[attr["type"]] = attr["value"];
        }

        pollChannel.vesselName = data.vesselName;
        pollChannel.vesselIrcs = data.vesselIrcs;
        pollChannel.connectId = data.connectId;
        pollChannel.mobileTerminalType = data.mobileTerminalType;
        pollChannel.comChannelId = data.comChannelId;

        return pollChannel;
    };

    PollChannel.prototype.isEqual = function(item) {
        return item.comChannelId === this.comChannelId;
    };

    PollChannel.prototype.toCreatePoll = function() {
        return {
            connectId: this.connectId,
            comChannelId: this.comChannelId
        };
    };

    return PollChannel;
});