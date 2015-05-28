angular.module('unionvmsWeb')
.factory('Movement', function(){

	function Movement(){
		
	}

	Movement.fromJson = function(data){
		var movement = new Movement();
		movement.state = data.state;
		movement.externalMarking = data.externalMarking;
		movement.ircs = data.ircs;
		movement.name = data.name;
		movement.time = data.time;
		movement.latitude = data.latitude;
		movement.longitude = data.longitude;
		movement.status = data.status;
		movement.measuredSpeed = data.measuredSpeed;
		movement.calculatedSpeed = data.calculatedSpeed;
		movement.course = data.course;
		movement.messageType = data.messageType;
		movement.source = data.source;
	};

	return Movement;
	
});