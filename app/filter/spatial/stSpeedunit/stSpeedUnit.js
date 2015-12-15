angular.module('unionvmsWeb').filter('stSpeedUnit', function(unitConversionService) {
	return function(speed, decimalPlaces) {
	    return unitConversionService.speed.checkSpeed(speed, decimalPlaces);
	};
});