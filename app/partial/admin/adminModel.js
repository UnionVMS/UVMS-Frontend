angular.module('unionvmsWeb').factory('Audit', function() {

	function Audit() {
		this.username = undefined;
		this.operation = undefined;
		this.objectType = undefined;
		this.date = undefined;
        this.affectedObject = undefined;
		this.comment = undefined;
	}

	Audit.fromJson = function(data) {
		var audit = new Audit();
		audit.username = data.username;
		audit.operation = data.operation;
		audit.objectType = data.objectType;
		audit.date = data.timestamp;
        audit.affectedObject = data.affectedObject;
		audit.comment = data.comment;

		return audit;
	};

	return Audit;
});
