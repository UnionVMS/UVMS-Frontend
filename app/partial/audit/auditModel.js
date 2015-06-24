angular.module('unionvmsWeb').factory('Audit', function() {

	function Audit() {
		this.username = undefined;
		this.operation = undefined;
		this.objectType = undefined;
		this.date = undefined;
	}

	Audit.fromJson = function(data) {
		var audit = new Audit();
		audit.username = data.username;
		audit.operation = data.operation;
		audit.objectType = data.objectType;
		audit.date = data.date;

		return audit;
	};

	return Audit;
});
