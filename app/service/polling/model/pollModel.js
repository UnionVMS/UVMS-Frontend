angular.module('unionvmsWeb')
.factory('Poll', function(MobileTerminal, locale) {

    function Poll(){
        this.id = undefined;
        this.type = undefined;
        this.comment = undefined;
        this.mobileTerminal = new MobileTerminal();
        this.attributes = {};
    }

    Poll.fromJson = function(data){
        var poll = new Poll();

        poll.id = data.pollId;
        poll.type = data.pollType;
        poll.comment = data.comment;        

        //Mobile terminal
        poll.mobileTerminal = MobileTerminal.fromJson(data.mobileTerminal); 

        //Attributes
        $.each(data.attributes, function(index, attribute){
            poll.attributes[attribute.key] = attribute.value;
        });
 

        return poll;
    };

    Poll.prototype.getFormattedStartDate = function() {
        return moment(parseInt(this.attributes["START_DATE"])).format("YYYY-MM-DD HH:mm");
    };

    Poll.prototype.getFormattedEndDate = function() {
        return moment(parseInt(this.attributes["END_DATE"])).format("YYYY-MM-DD HH:mm");
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
        var hours = moment.duration(frequency, 'seconds').get('hours');
        var minutes = moment.duration((frequency -hours*60*60), 'seconds').get('minutes');
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