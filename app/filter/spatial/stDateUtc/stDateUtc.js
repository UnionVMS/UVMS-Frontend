angular.module('unionvmsWeb').filter('stDateUtc', function(unitConversionService) {
	return function(date) {
	    return unitConversionService.date.convertToUserFormat(date);
	};
});