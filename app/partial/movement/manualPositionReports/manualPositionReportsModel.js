angular.module('unionvmsWeb').factory('ManualPosition', function() {

	function ManualPosition() {
		this.id = undefined; // string
		this.guid = undefined; // string
		this.speed = undefined; // number
		this.course = undefined; // number
		this.time = undefined; // string, time of the position report
		this.updatedTime = undefined; // string
		this.status = undefined; // string
		this.archived = undefined; // boolean, true if archived

		this.carrier = {
			cfr: undefined,
			name: undefined,
			externalMarking: undefined,
			ircs: undefined,
			flagState: undefined
		};

		this.position = {
			longitude: undefined,
			latitude: undefined
		};
	}

	ManualPosition.fromJson = function(data) {
		var manualPosition = new ManualPosition();
		manualPosition.id = data.id;
		manualPosition.guid = data.guid;
		manualPosition.speed = data.speed;
		manualPosition.course = data.course;
		manualPosition.time = formatTime(data.time);
		manualPosition.updatedTime = data.updatedTime;
		manualPosition.status = data.status;
		manualPosition.archived = data.archived;

		if (data.carrier) {
			manualPosition.carrier.externalMarking = data.carrier.extMarking;
			manualPosition.carrier.cfr = data.carrier.cfr;
			manualPosition.carrier.name = data.carrier.name;
			manualPosition.carrier.ircs = data.carrier.ircs;
			manualPosition.carrier.flagState = data.carrier.flagState;
		}

		if (data.position) {
			manualPosition.position.latitude = data.position.latitude;
			manualPosition.position.longitude = data.position.longitude;
		}

		return manualPosition;
	};

	ManualPosition.prototype.getDto = function() {
		var data = {};
		data.id = this.id;
		data.guid = this.guid;
		data.speed = this.speed;
		data.course = this.course;
		data.time = this.time;
		data.archived = this.archived;
		data.status = this.status;
		data.updatedTime = this.updatedTime;

		data.carrier = {
			cfr: this.carrier.cfr,
			name: this.carrier.name,
			extMarking: this.carrier.externalMarking,
			ircs: this.carrier.ircs,
			flagState: this.carrier.flagState
		};

		data.position = {
			longitude: this.position.longitude,
			latitude: this.position.latitude
		};

		return data;
	};

	ManualPosition.prototype.isEqualMovement = function(item) {
		return item.id === this.id;
	};

	function formatTime (time){
		return moment(time).format("YYYY-MM-DD hh:mm");
	};


	return ManualPosition;
	
});