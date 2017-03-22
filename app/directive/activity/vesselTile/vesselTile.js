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
 * @name vesselTile
 * @attr {unionvmsWeb.Trip} trip - current trip in trip summary
 * @description
 *  A reusable tile that will display the vessel details related to the selected trip
 */
angular.module('unionvmsWeb').directive('vesselTile', function() {
	return {
		restrict: 'E',
		replace: false,
		scope: {
			ngModel: '='
		},
		templateUrl: 'directive/activity/vesselTile/vesselTile.html',
		link: function(scope, element, attrs, fn) {
			var watchRef;

			var calcWidth = function(newVal){
				var nrPanels = 0;
				angular.forEach(newVal,function(prop){
					if(_.isObject(prop)){
						nrPanels++;
					}
				});
				scope.colWidth = 12 / (nrPanels || 1);
			};

			if(angular.isDefined(scope.ngModel)){
				calcWidth(scope.ngModel);
			}else{
				watchRef = scope.$watch('ngModel',function(newVal){
					if(angular.isDefined(newVal)){
						calcWidth(newVal);
						watchRef();
					}
				});	
			}
		}
	};
});
