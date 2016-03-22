angular.module('unionvmsWeb').factory('spatialHelperService',function() {

	var spServ = {
	    tbControl: {
	        measure: false,
	        fullscreen: false,
	        print: false,
	        mapFishPrint: false,
	        bookmarks: false
	    },
	    measure: {
	        units: 'm',
	        speed: undefined,
	        startDate: undefined,
	        disabled: false
	    }
	};
	
	spServ.setToolbarControls = function(config){
	    for (var i = 0; i < config.map.tbControl.length; i++){
	        spServ.tbControl[config.map.tbControl[i].type] = true;
	    }
	};

	return spServ;
});