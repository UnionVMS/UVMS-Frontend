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
