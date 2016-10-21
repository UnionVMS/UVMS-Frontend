/**
 * @memberof unionvmsWeb
 * @ngdoc filter
 * @name stArrayToString
 * @desc
 *   A filter that converts an array into a string using a separator specified in the arguments
 */
angular.module('unionvmsWeb').filter('stArrayToString', function() {
    /**
    * @memberof stArrayToString
    * @func stArrayToStringFilter
    * @desc
    *   Create and return a function to convert the array into a string
    * @param {Array} data - The data array to be converted
    * @param {String} separator - The desired separator to include in the string
    * @returns {String} The formatted string
    */
	return function(data, separator) {
	    var str = '';
	    if (angular.isDefined(data)){
	        for (var i = 0; i < data.length; i++){
	            str += data[i];
	            if (i < data.length - 1){
	                str += separator;
	            }
	        }
	    }
		
		return str;
	};
});