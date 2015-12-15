angular.module('unionvmsWeb').filter('stHumanizeTime', function(unitConversionService) {
	return function(number) {
	   return unitConversionService.duration.timeToHuman(number, 'ms');
	};
});