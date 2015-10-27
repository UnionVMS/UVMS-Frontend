angular.module('unionvmsWeb').factory('spatialHelperService',function() {

	var spatialHelperService = {
	    measure: {
	        units: 'm',
	        speed: undefined,
	        startDate: undefined,
	        disabled: false
	    }
	};

	return spatialHelperService;
});