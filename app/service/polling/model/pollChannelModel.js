angular.module('unionvmsWeb')
.factory('PollChannel', function() {

    function PollChannel(){
        this.vesselName = undefined;
        this.vesselIrcs = undefined;
        this.mobileTerminalType = undefined;
        this.guid = undefined;
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
        pollChannel.mobileTerminalType = data.mobileTerminalType;
        pollChannel.guid = data.guid;
        
        return pollChannel;
    };

    PollChannel.prototype.isEqual = function(item) {
        if(item.guid === this.guid){
            return true;
        }else{
            return false;
        }
    };

  PollChannel.prototype.toCreatePoll = function() {
        return {
            comChannelId: this.guid
        };
    };

    return PollChannel;
});