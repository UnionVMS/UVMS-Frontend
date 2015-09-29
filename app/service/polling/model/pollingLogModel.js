angular.module('unionvmsWeb')
.factory('PollingLog', function(locale) {

	function PollingLog(){
		this.vessel = undefined;
		this.poll = undefined;
		this.pollingStatuses = [];
	}

	return PollingLog;

});