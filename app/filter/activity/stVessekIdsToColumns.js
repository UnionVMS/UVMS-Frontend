/*
Developed with the contribution of the European Commission - Directorate General for Maritime Affairs and Fisheries
© European Union, 2015-2016.

This file is part of the Integrated Fisheries Data Management (IFDM) Suite. The IFDM Suite is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as published by the
Free Software Foundation, either version 3 of the License, or any later version. The IFDM Suite is distributed in
the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. You should have received a
copy of the GNU General Public License along with the IFDM Suite. If not, see <http://www.gnu.org/licenses/>.
*/
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
