angular.module('unionvmsWeb').filter('roundDecimals', function() {
	return function(number,decimalPlaces) {
		var scale = Math.pow(10, decimalPlaces);
		return Math.round(number * scale) / scale;
	};
});