angular.module('unionvmsWeb')
.factory('PollStatus', function() {


    function PollStatus(text){
        this.status = undefined;
        this.time = undefined;
    }

    PollStatus.fromDTO = function(dto){
        var pollStatus = new PollStatus();
        pollStatus.status = dto.status;
        pollStatus.time = dto.timestamp;

        return pollStatus;
    };

    return PollStatus;
});