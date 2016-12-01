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
angular.module('smart-table').filter('stSearch', function() {
	return function(array, predictedObject) {
		var filteredTable = [];
		var columns = predictedObject.split('|');
		var input = columns[columns.length-1];
		columns.splice(-1,1);
		
		if(input === "undefined") {
			return array;
		}
		
		if(input){
    		angular.forEach(array, function(row) {
    			for (var i = 0; i<columns.length; i++) {
    				if(row[columns[i]] && row[columns[i]].toLowerCase().indexOf(input.toLowerCase()) > -1) {
    					filteredTable.push(row);
    					break;
    				}
    			}
    		});
		} else {
		    filteredTable = array;
		}
		
		return filteredTable;
	};
});
