angular.module('unionvmsWeb')
.factory('Poll', function(PollStatus) {


    function Poll(){
        this.name = "SOME VESSEL NAME";
        this.extNo = "SKRM";
        this.pollType = "Manual";
        this.transponder = "IMARSAT-C";
        this.user = "Test user";
        this.organization = "Control Authority 1";
        this.status = [];
        this.status.push(new PollStatus("Succeeded"));
        this.status.push(new PollStatus("Issued"));
        this.status.push(new PollStatus("Transmitted"));
    }

    Poll.fromJson = function(data){
        var poll = new Poll();
        return poll;
    };

    return Poll;
});