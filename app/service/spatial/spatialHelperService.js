angular.module('unionvmsWeb').factory('spatialHelperService',function() {

	var spServ = {
	    tbControls: {
	        measure: false,
	        fullscreen: false
	    },
	    measure: {
	        units: 'm',
	        speed: undefined,
	        startDate: undefined,
	        disabled: false
	    }
	};
	
	spServ.setToolbarControls = function(config){
	    for (var i = 0; i < config.map.tbControls.length; i++){
	        spServ.tbControls[config.map.tbControls[i].type] = true;
	    }
	};

	return spServ;
});