angular.module('unionvmsWeb')
.factory('PollResult', function(locale) {


    function PollResult(){
        this.success = undefined;
        this.sentPollGuids = [];
        this.unsentPollsGuids = [];
    }

    PollResult.fromDTO = function(dto) {
        var pollResult = new PollResult();
        pollResult.success = !dto.unsentPoll;
        pollResult.sentPollGuids = dto.sentPolls;
        pollResult.unsentPollsGuids = dto.unsentPolls;
        return pollResult;
    };

    return PollResult;
});