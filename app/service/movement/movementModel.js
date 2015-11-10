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
        this.mobileTerminalData = {
            guid : undefined,
            connectId : undefined,
            ids : {}
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

            if(data.guid){
			    movement.guid = data.guid;
            }
            //Used by last movement for vessel
            else if(data.movementGUID){
                movement.guid = data.movementGUID;
            }

			movement.connectId = data.connectId;
            if(data.positionTime){
			    movement.time = data.positionTime;
            }
            //Used by last movement for vessel
            else if(data.time){
                movement.time = data.time;
            }


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

            if (data.mobileTerminal) {
                movement.mobileTerminalData.guid = data.mobileTerminal.guid;
                movement.mobileTerminalData.connectId = data.mobileTerminal.connectId;
                if (data.mobileTerminal.mobileTerminalIdList) {
                    for (var i = 0; i < data.mobileTerminal.mobileTerminalIdList.length; i++) {
                        var value = data.mobileTerminal.mobileTerminalIdList[i].value;
                        var key = data.mobileTerminal.mobileTerminalIdList[i].type.toUpperCase();
                        movement.mobileTerminalData.ids[key] = value;
                    }
                }
            }
		}
		return movement;
	};

    Movement.prototype.copy = function(){
        var copy = new Movement();

        copy.guid = this.guid;
        copy.connectId = this.connectId;
        copy.time = this.time;
        copy.vessel = _.clone(this.vessel);
        copy.movement = _.clone(this.movement);
        copy.mobileTerminalData = _.clone(this.mobileTerminalData);
        return copy;
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