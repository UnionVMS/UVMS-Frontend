angular.module('unionvmsWeb').filter('stHumanizeTime', function(unitConversionService) {
	return function(number, type) {
	    return unitConversionService.duration.timeToHuman(number);
	};
});