angular.module('unionvmsWeb')
.factory('ManualPosition', function(){

	function ManualPosition(){
		
	}

	ManualPosition.fromJson = function(data){
		var ManualPosition = new ManualPosition();
		if (data.carrier){
			ManualPosition.externalMarking = data.carrier.externalMarking;
			ManualPosition.ircs = data.carrier.ircs;
			ManualPosition.cfr = data.carrier.cfr;
			ManualPosition.name = data.carrier.name;
		}
		ManualPosition.time = data.time;
		ManualPosition.latitude = data.position.latitude;
		ManualPosition.longitude = data.position.longitude;
		ManualPosition.measuredSpeed = data.measuredSpeed;
		ManualPosition.course = data.course;
		
		return ManualPosition;
	};

	return ManualPosition;
	
});