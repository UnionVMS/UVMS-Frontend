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
 * @ngdoc directive
 * @name tableChart
 * @attr {Array} columns - Array of columns to be displayed in the table
 * @attr {Array} ngModel - Data to be displayed
 * @attr {Object} selectedItem - Object with the selected item
 * @description
 *  A widget to display the same data as a chart or a table
 */
angular.module('unionvmsWeb').directive('tableChart', function() {
	return {
		restrict: 'E',
		replace: false,
		scope: {
			columns: '=',
			ngModel: '=',
			selectedItem: '='
		},
		templateUrl: 'directive/activity/tableChart/tableChart.html',
		link: function(scope, element, attrs, fn) {
			scope.mode = 'table';

			/**
			 * Switch mode between table and chart
			 * 
			 * @memberof tableChart
			 * @public
			 * @alias switchMode
			 */
			scope.switchMode = function(){
				if(scope.mode === 'table'){
					scope.mode = 'chart';
				}else{
					scope.mode = 'table';
				}
			};

		}
	};
});
