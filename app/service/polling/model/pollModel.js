angular.module('unionvmsWeb')
.factory('Poll', function(locale) {

    function Poll(){
        this.id = undefined;
        this.type = undefined;
        this.comment = undefined;
        this.mobileTerminalId = undefined;
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

    Poll.prototype.getFrequencyAsText = function() {
        var frequency = this.attributes["FREQUENCY"];
        if(angular.isUndefined(frequency)){
            return "";
        }

        //Less than 60 seconds
        if(frequency < 60){
            return frequency +" " +locale.getString('common.time_second_short');
        }
        //Return hour and minutes, e.g. 2h 45 min
        var hours = Math.floor(frequency / 3600);
        var minutes = Math.floor((frequency % 3600) / 60);
        var text = "";
        if(hours > 0){
            text += hours + locale.getString('common.time_hour_short');
        }
        if(minutes > 0){
            text += (text.length === 0) ? "" : " ";
            text += minutes + " " +locale.getString('common.time_minute_short');
        }
        return text;
    };

    return Poll;
});