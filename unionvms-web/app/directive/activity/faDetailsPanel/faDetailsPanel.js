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
 * @name faDetailsPanel
 * @attr {Array} ngModel - the content data of fa overview
 * @attr {Function} isLocClickable - callback to check if location is clickable
 * @attr {Function} locClickCallback - callback for the click in the location
 * @attr {Array} locDetails - location data
 * @description
 *  A reusable tile that will display the fishing activity overview data in every fishing activity report panel
 */
angular.module('unionvmsWeb').directive('faDetailsPanel', function($filter,locale) {
	return {
		restrict: 'E',
		replace: false,
		scope: {
			ngModel: '=',
			isLocClickable: '&',
		    locClickCallback: '&',
			locDetails: '=',
			noDataMsgLoc: '@'
		},
		templateUrl: 'directive/activity/faDetailsPanel/faDetailsPanel.html',
		link: function(scope, element, attrs, fn) {

			function init(){
				if(scope.noDataMsgLoc){
					scope.noDataMsg = locale.getString(scope.noDataMsgLoc);
				}else{
					scope.noDataMsg = locale.getString('activity.no_data');
				}
			}

			/**
			 * Checks if value is array
			 * 
			 * @memberof faDetailsPanel
			 * @public
			 * @param {Any} val - any value
			 * @returns {Boolean} returns true if it's array
			 */
			scope.isArray = function(val){
				 return _.isArray(val);
			};

			/**
			 * Checks if has location data
			 * 
			 * @memberof faDetailsPanel
			 * @public
			 * @returns {Boolean} returns true if has location data
			 */
			scope.hasLocData = function(){
				var status = false;
				if (angular.isDefined(scope.locDetails) && ((_.isArray(scope.locDetails) && scope.locDetails.length > 0) || (!_.isArray(scope.locDetails) && !_.isEqual(scope.locDetails, {})))){
					status = true;
				}
				return status;
			};

			init();
		}
	};
});
