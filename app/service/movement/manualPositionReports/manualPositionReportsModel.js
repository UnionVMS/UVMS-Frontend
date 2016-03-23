angular.module('unionvmsWeb').factory('ManualPosition', function() {

	function ManualPosition() {
		this.guid = undefined; // string
		this.speed = undefined; // number
		this.course = undefined; // number
		this.time = undefined; // string, time of the position report
		this.updatedTime = undefined; // string
		this.status = undefined; // string
		this.state = undefined; // string

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
		manualPosition.time = data.time;
		manualPosition.updatedTime = data.updatedTime;
		manualPosition.status = data.status;
		manualPosition.state = data.state;

		if (data.asset) {
			manualPosition.carrier.externalMarking = data.asset.extMarking;
			manualPosition.carrier.cfr = data.asset.cfr;
			manualPosition.carrier.name = data.asset.name;
			manualPosition.carrier.ircs = data.asset.ircs;
			manualPosition.carrier.flagState = data.asset.flagState;
		}

		if (data.position) {
            manualPosition.position.latitude = data.position.latitude !== null ? data.position.latitude : undefined;
			manualPosition.position.longitude = data.position.longitude !== null ? data.position.longitude : undefined;
		}

		return manualPosition;
	};

	ManualPosition.prototype.getDto = function() {
		var data = {};
		data.guid = this.guid;
		data.speed = this.speed;
		data.course = this.course;
		data.time = this.time;
		data.status = this.status;
		data.updatedTime = this.updatedTime;
		data.state = this.state;

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

    ManualPosition.prototype.copy = function() {
        var copy = new ManualPosition();
        copy.guid = this.guid;
        copy.speed = this.speed;
        copy.course = this.course;
        copy.time = this.time;
        copy.status = this.status;
        copy.updatedTime = this.updatedTime;
        copy.state = this.state;

        copy.carrier = {
            cfr: this.carrier.cfr,
            name: this.carrier.name,
            externalMarking: this.carrier.externalMarking,
            ircs: this.carrier.ircs,
            flagState: this.carrier.flagState
        };

        copy.position = {
            longitude: this.position.longitude,
            latitude: this.position.latitude
        };

        return copy;
    };

	ManualPosition.prototype.isEqualMovement = function(item) {
		return item.guid === this.guid;
	};

	ManualPosition.prototype.draft = function() {
		this.state = 'DRAFT';
	};

	ManualPosition.prototype.isDraft = function() {
		return this.state === 'DRAFT';
	};

	ManualPosition.prototype.isSent = function() {
		return this.state === 'SENT';
	};

	return ManualPosition;

});