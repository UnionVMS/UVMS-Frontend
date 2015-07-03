angular.module('unionvmsWeb')
.factory('Poll', function(locale) {

    function Poll(){
        this.id = undefined;
        this.type = undefined;
        this.comment = undefined;
        this.mobileTerminalId = undefined;
        this.connectionId = undefined;
        this.attributes = {};
    }

    Poll.fromAttributeList = function(attrs) {
        var poll = new Poll();
        for (var i = 0; i < attrs.length; i++) {
            var attr = attrs[i];
            poll.attributes[attr["key"]] = attr["value"];
        }

        poll.id = poll.attributes.POLL_ID;
        poll.type = poll.attributes.POLL_TYPE;
        poll.startDate = poll.attributes.START_DATE;
        poll.endDate = poll.attributes.END_DATE;
        poll.connectionId = poll.attributes.CONNECTION_ID;
        return poll;
    };

    Poll.fromJson = function(data){
        var poll = new Poll();

        poll.id = data.pollId;
        poll.type = data.pollType;
        poll.comment = data.comment;

        //Mobile terminal
        poll.mobileTerminalId = data.mobileTerminal;

        //Attributes
        $.each(data.attributes, function(index, attribute){
            poll.attributes[attribute.key] = attribute.value;
        });


        return poll;
    };

    Poll.prototype.setVesselName = function(name) {
        this.attributes.VESSEL_NAME = name;
    };

    return Poll;
});