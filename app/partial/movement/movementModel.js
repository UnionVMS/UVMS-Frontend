angular.module('unionvmsWeb')
.factory('Movement', function(){

	function Movement(){
		
	}

	Movement.fromJson = function(data){
		var movement = new Movement();
		movement.state = data.carrier.flagState;
		movement.externalMarking = data.carrier.externalMarking;
		movement.ircs = data.carrier.ircs;
		movement.name = data.carrier.name;
		movement.time = "NOT PRESENT";//data.time;
		movement.latitude = data.position.latitude;
		movement.longitude = data.position.longitude;
		movement.status = data.status;
		movement.measuredSpeed = data.measuredSpeed;
		movement.calculatedSpeed = data.calculatedSpeed;
		movement.course = data.course;
		movement.messageType = data.messageType;
		movement.source = data.source;

		return movement;
	};


    //TODO: FIX
    Movement.prototype.isEqualMovement = function(item) {
        if( item.state === this.state && 
            item.externalMarking === this.externalMarking &&
            item.calculatedSpeed === this.calculatedSpeed
            ){
            return true;
        }else{
            return false;
        }
    };    

	return Movement;
	
});