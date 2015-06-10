angular.module('unionvmsWeb')
.factory('Movement', function(){

	function Movement(){
		
	}

	Movement.fromJson = function(data){
		var movement = new Movement();
		
		if(data){

			movement.id = data.movement.id;
			movement.time = "-";//data.time;

			if(data.vessel)
			{
				movement.state = data.vessel.flagState;
				movement.externalMarking = data.vessel.externalMarking;
				movement.ircs = data.vessel.ircs;
				movement.name = data.vessel.name;

			}
			if (data.movement) {
				movement.latitude = data.movement.latitude;
				movement.longitude = data.movement.longitude;
				movement.status = data.movement.status;
				movement.source = data.movement.source;
				movement.measuredSpeed = data.movement.measuredSpeed;
				movement.calculatedSpeed = data.movement.calculatedSpeed;
				movement.course = data.movement.course;
				movement.messageType = "-"; //data.movement.messageType;	
			}
		}

		return movement;
	};


    //TODO: FIX
    Movement.prototype.isEqualMovement = function(item) {
        if( item.id === this.id ){
            return true;
        }else{
            return false;
        }
    };

	return Movement;
	
});