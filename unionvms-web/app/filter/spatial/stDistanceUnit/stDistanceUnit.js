angular.module('unionvmsWeb').filter('stDistanceUnit', function(unitConversionService) {
	return function(distance, decimalPlaces) {
	    return unitConversionService.distance.formatDistance(distance, decimalPlaces);
	};
});