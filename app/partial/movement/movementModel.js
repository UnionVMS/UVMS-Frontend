angular.module('unionvmsWeb')
.factory('Movement', function(){

	function Movement(){
		
		this.id = undefined;
		this.time = undefined;
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
			measuredSpeed : undefined, 
			calculatedSpeed : undefined, 
			course : undefined,
			messageType : undefined
		};
	}

	Movement.fromJson = function(data){
		var movement = new Movement();
		
		if(data){

			movement.id = data.id;
			movement.time = "-";//data.time;

			if(data.vessel)
			{
				movement.vessel.state = data.vessel.flagState;
				movement.vessel.externalMarking = data.vessel.externalMarking;
				movement.vessel.ircs = data.vessel.ircs;
				movement.vessel.name = data.vessel.name;
			}
			if (data.movement) {
				movement.movement.latitude = data.movement.latitude;
				movement.movement.longitude = data.movement.longitude;
				movement.movement.status = data.movement.status;
				movement.movement.source = data.movement.source;
				movement.movement.measuredSpeed = data.movement.measuredSpeed;
				movement.movement.calculatedSpeed = data.movement.calculatedSpeed;
				movement.movement.course = data.movement.course;
				movement.movement.messageType = "-"; //data.movement.messageType;	
			}
		}
		return movement;
	};


    //TODO: FIX - remove/adapt to model. (eg. when we got id from model, remove ircs  )
    Movement.prototype.isEqualMovement = function(item) {
        if( item.id === this.id && item.ircs === this.ircs ){
            return true;
        }else{
            return false;
        }
    };

	return Movement;
	
});