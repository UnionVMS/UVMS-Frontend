angular.module('unionvmsWeb')
.factory('Movement', function(){

	function Movement(){
		
		this.id = undefined;
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
			movement.connectId = data.connectId;
			movement.time = "-";//data.time;
			movement.movement.source = data.source;
			movement.movement.measuredSpeed = data.measuredSpeed;
			movement.movement.course = data.course;
			movement.movement.status = data.status;

			if (data.position) {
				movement.movement.latitude = data.position.latitude;
				movement.movement.longitude = data.position.longitude;
				movement.movement.calculatedSpeed = data.position.calculatedSpeed;
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