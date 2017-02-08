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
 * @name activitySummaryTile
 * @attr {String} faType - The title of the fieldset tile that needs to be translated
 * @attr {Object} summary - An object containing the data that should be displayed in the tile
 * @description
 *  A reusable tile that will display the summary tile of a fishing activity
 */
angular.module('unionvmsWeb').directive('activitySummaryTile', function() {
	return {
		restrict: 'E',
		replace: false,
		controller: 'ActivitySummaryTileCtrl',
		scope: {
		    faType: '@',
		    summary: '=',
		    isLocClickable: '&',
		    locClickCallback: '&',
		    locDetails: '='
		},
		templateUrl: 'directive/activity/activitySummaryTile/activitySummaryTile.html'
	};
})
/**
 * @memberof unionvmsWeb
 * @ngdoc controller
 * @name ActivitySummaryTileCtrl
 * @param $scope {Service} The controller scope
 * @param locale {Service} The angular locale service
 * @attr {String} translatedFaType - The translated string of the fishing activity type (faType)
 * @description
 *  The controller for the activitySummaryTile directive ({@link unionvmsWeb.activitySummaryTile})
 */
.controller('ActivitySummaryTileCtrl', function($scope, locale){
    $scope.$watch('faType', function(newVal){
        if (!angular.isDefined($scope.translatedFaType) && newVal !== ''){
            $scope.translatedFaType = locale.getString('activity.' + $scope.faType);
        }
    });
});

