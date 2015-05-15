angular.module('unionvmsWeb')
.factory('PollStatus', function() {


    function PollStatus(text){
        this.text = text;
        this.time = "2015-03-24T10:32:00Z";
    }

    return PollStatus;
});