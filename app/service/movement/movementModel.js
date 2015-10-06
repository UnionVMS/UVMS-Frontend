angular.module('unionvmsWeb')
.factory('Movement', function(){

	function Movement(){

		this.guid = undefined;
		this.time = undefined;
		this.connectId = undefined;
		this.vessel = {
			state : undefined,
			externalMarking : undefined,
			ircs : undefined,
			name : undefined
		};
		this.movement = {
			latitude : undefined,
			longitude : undefined,
			status : undefined,
			source : undefined,
			calculatedSpeed : undefined,
            reportedSpeed : undefined,
			reportedCourse : undefined,
			movementType : undefined
		};
	}

	Movement.fromJson = function(data){
		var movement = new Movement();

		if(data){

			movement.guid = data.guid;
			movement.connectId = data.connectId;
			movement.time = data.positionTime;

			movement.movement.movementType = data.movementType;
			movement.movement.source = data.source;
            movement.movement.calculatedSpeed = data.calculatedSpeed;
			movement.movement.reportedSpeed = data.reportedSpeed;
			movement.movement.reportedCourse = data.reportedCourse;
			movement.movement.status = data.status;

			if (data.position) {
				movement.movement.latitude = data.position.latitude;
				movement.movement.longitude = data.position.longitude;
			}
		}
		return movement;
	};


    Movement.prototype.isEqualMovement = function(item) {
        return item.guid === this.guid;
    };

    Movement.prototype.setVesselData = function(vesselModel) {
        this.vessel.name = vesselModel.name;
        this.vessel.ircs = vesselModel.ircs;
        this.vessel.state = vesselModel.countryCode;
        this.vessel.externalMarking = vesselModel.externalMarking;
    };

    return Movement;

});