angular.module('unionvmsWeb')
.factory('ProgramPoll', function(MobileTerminalId) {


    function ProgramPoll(){
        this.mobileTerminalId = new MobileTerminalId();
        this.startDate = undefined;
        this.endDate = undefined;
        this.frequency = -1;
        this.channel = {
            type : undefined,
            value : undefined,
        };

        //MOCKED VALUES
        //TODO: Use real values
        this.running = false;
        this.user = "Test user";
        this.organization = "Control Authority 1";
    }

    ProgramPoll.fromJson = function(data){
        var programPoll = new ProgramPoll();
        //Mobile terminal
        programPoll.mobileTerminalId = MobileTerminalId.fromJson(data.mobileTerminal); 

        programPoll.frequency = data.frequency;
        programPoll.comment = data.comment;
        programPoll.startDate = data.date.startDate;
        programPoll.endDate = data.date.endDate;

        //Channel
        programPoll.channel.type = data.comChannel.type;
        programPoll.channel.value = data.comChannel.value;
        return programPoll;
    };

    ProgramPoll.prototype.getFormattedStartDate = function() {
        return moment(this.startDate).format("YYYY-MM-DD hh:mm");
    };

    ProgramPoll.prototype.getFormattedEndDate = function() {
        return moment(this.endDate).format("YYYY-MM-DD hh:mm");
    };

    ProgramPoll.prototype.getFrequencyAsText = function() {
        //Less than 60 seconds
        if(this.frequency < 60){
            return this.frequency +" s";
        }
        //Return hour and minutes, e.g. 2h 45 min
        var hours = moment.duration(this.frequency, 'seconds').get('hours');
        var minutes = moment.duration((this.frequency -hours*60*60), 'seconds').get('minutes');
        var text = "";
        if(hours > 0){
            text += hours +"h";
        }
        if(minutes > 0){
            text += (text.length === 0) ? minutes +" min" : " " +minutes +" min" ;
        }
        return text;
    };

    //TODO: write test for this
    ProgramPoll.prototype.start = function(){
        this.running = true;
    };

    //TODO: write test for this
    ProgramPoll.prototype.stop = function(){
        this.running = false;
    };

    return ProgramPoll;
});