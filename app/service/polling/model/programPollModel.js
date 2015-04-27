angular.module('unionvmsWeb')
.factory('ProgramPoll', function(EventHistory) {


    function ProgramPoll(){
        this.name = "SOME VESSEL NAME";
        this.transponder = "IMARSAT-C";
        this.startDate = "2015-02-24 10:32";
        this.endDate = "2015-03-24 10:32";
        this.pollInterval = "12h";
        this.user = "Test user";
        this.organization = "Control Authority 1";
    }

    ProgramPoll.fromJson = function(data){
        var programPoll = new ProgramPoll();
        return programPoll;
    };

    return ProgramPoll;
});