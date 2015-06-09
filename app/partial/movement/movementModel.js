angular.module('unionvmsWeb')
.factory('Movement', function(){

	function Movement(){
		
	}

	Movement.fromJson = function(data){
		var movement = new Movement();
		if (data.movement.carrier){
			movement.state = data.movement.carrier.flagState;
			movement.externalMarking = data.movement.carrier.externalMarking;
			movement.ircs = data.movement.carrier.ircs;
			movement.name = data.movement.carrier.name;
		}
		if (data.movement.position) {
			movement.latitude = data.movement.position.latitude;
			movement.longitude = data.movement.position.longitude;	
		}
		movement.id = data.movement.id;
		movement.time = "NOT PRESENT";//data.time;	
		movement.status = data.movement.status;
		movement.measuredSpeed = data.movement.measuredSpeed;
		movement.calculatedSpeed = data.movement.calculatedSpeed;
		movement.course = data.movement.course;
		movement.messageType = data.movement.messageType;
		movement.source = data.movement.source;

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