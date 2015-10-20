angular.module('unionvmsWeb')
.factory('PollingLog', function(locale) {

	function PollingLog(){
		this.vessel = undefined;
		this.poll = undefined;
		this.pollingStatuses = [];
	}

    //Polls are equal?
    PollingLog.prototype.isEqualPollId = function(otherPollingLog){
        if(angular.isDefined(this.poll) && angular.isDefined(otherPollingLog)){
            return this.poll.id === otherPollingLog.poll.id;
        }
        return false;
    };

	return PollingLog;

});