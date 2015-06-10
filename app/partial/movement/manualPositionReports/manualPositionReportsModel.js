angular.module('unionvmsWeb')
.factory('ManualPosition', function(){

	function ManualPosition(){
		this.movement = {};
		this.vessel = {};
	}

	ManualPosition.fromJson = function(data){
		var manualPosition = new ManualPosition();
		if (data.vessel) {
			manualPosition.vessel.externalMarking = data.vessel.externalMarking;
			manualPosition.vessel.cfr = data.vessel.cfr;
			manualPosition.vessel.name = data.vessel.name;
			manualPosition.vessel.ircs = data.vessel.ircs; 
		}
		if (data.movement) {
			manualPosition.movement.time = data.movement.time;
			manualPosition.movement.latitude = data.movement.latitude;
			manualPosition.movement.longitude = data.movement.longitude;
			manualPosition.movement.measuredSpeed = data.movement.measuredSpeed;
			manualPosition.movement.course = data.movement.course;
		}

		return manualPosition;
	};

	return ManualPosition;
	
});