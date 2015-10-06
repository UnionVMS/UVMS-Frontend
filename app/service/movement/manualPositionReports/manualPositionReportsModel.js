angular.module('unionvmsWeb').factory('ManualPosition', function() {

	function ManualPosition() {
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
		manualPosition.guid = data.guid;
		manualPosition.speed = data.speed;
		manualPosition.course = data.course;
		manualPosition.time = formatTime(data.time);
		manualPosition.updatedTime = data.updatedTime;
		manualPosition.status = data.status;
		manualPosition.archived = data.archived;

		if (data.asset) {
			manualPosition.carrier.externalMarking = data.asset.extMarking;
			manualPosition.carrier.cfr = data.asset.cfr;
			manualPosition.carrier.name = data.asset.name;
			manualPosition.carrier.ircs = data.asset.ircs;
			manualPosition.carrier.flagState = data.asset.flagState;
		}

		if (data.position) {
			manualPosition.position.latitude = data.position.latitude;
			manualPosition.position.longitude = data.position.longitude;
		}

		return manualPosition;
	};

	ManualPosition.prototype.getDto = function() {
		var data = {};
		data.guid = this.guid;
		data.speed = this.speed;
		data.course = this.course;
		data.time = this.time;
		data.archived = this.archived;
		data.status = this.status;
		data.updatedTime = this.updatedTime;

		data.asset = {
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
		return item.guid === this.guid;
	};

	function formatTime (time){
		return moment(time).format("YYYY-MM-DD HH:mm");
	}


	return ManualPosition;

});