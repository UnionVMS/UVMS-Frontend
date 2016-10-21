/**
 * @memberof unionvmsWeb
 * @ngdoc filter
 * @name stVessekIdsToColumns
 * @desc
 *   A filter that extracts a property of a vesselId object as string
 */
angular.module('unionvmsWeb').filter('stVessekIdsToColumns', function() {
    /**
     * @memberof stVessekIdsToColumns
     * @func stVessekIdsToColumnsFilter
     * @desc
     *   Create and return a function to extract the property of a vesselID object as a string
     * @param {Object} data - The vesselId data object
     * @param {String} idType - The desired vessel id type to be extracted
     * @returns {String} The value of the vesselId property as a string
     */
	return function(data, idType) {
	    var convertedData = {};
	    var str = '';
	    var type = angular.isDefined(idType) ? idType.toUpperCase() : undefined;
	    if (angular.isDefined(data) && data instanceof Object){
	        _.each(data, function(value, key, list){
	            convertedData[key.toUpperCase()] = value;
	        });
	    }
	    
        if (angular.isDefined(convertedData[type])){
            str += data[type];
        }
        
        return str;
	};
});