angular.module('unionvmsWeb')
.factory('PollStatus', function(EventHistory) {


    function PollStatus(text){
        this.text = text;
        this.time = "2015-03-24 10:32";
    }

    return PollStatus;
});