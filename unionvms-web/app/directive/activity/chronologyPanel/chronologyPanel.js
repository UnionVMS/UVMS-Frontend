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
 * @name chronologyPanel
 * @attr {unionvmsWeb.Trip} trip - current trip in trip summary
 * @attr {Object} tripAlert - trip summary alert state
 * @description
 *  A reusable tile that will display the chronology of trips related to the current trip
 */
angular.module('unionvmsWeb').directive('chronologyPanel', function(loadingStatus,activityRestService,$anchorScroll,locale,tripSummaryService) {
	return {
		restrict: 'E',
		replace: true,
		scope: {
            trip: '=',
            tripAlert: '='
		},
		templateUrl: 'directive/activity/chronologyPanel/chronologyPanel.html',
		link: function(scope, element, attrs, fn) {

            /**
			 * Open trip in new tab
			 *
			 * @memberof chronologyPanel
			 * @public
			 * @param {String} tripName - name of the trip
			 */
            scope.openTrip = function(tripName){
                tripSummaryService.openNewTrip(tripName);
            };

            //when tthe trip is initialized
            scope.$watch('trip',function(){
				init();
			});

            /**
			 * Initializes the chronology panel directive
			 *
			 * @memberof chronologyPanel
			 * @private
			 */
            var init = function(){
                scope.chronology = {};
                //get trip chronology
                loadingStatus.isLoading('TripSummary', true, 0);
                activityRestService.getTripChronology(scope.trip.id,5).then(function(response){
                    scope.trip.fromJson('chronology',response.data);
                    scope.chronology = scope.trip.chronology;
                    loadingStatus.isLoading('TripSummary', false);
                }, function(error){
                    $anchorScroll();
                    scope.tripAlert.hasAlert = true;
                    scope.tripAlert.hasError = true;
                    scope.tripAlert.alertMessage = locale.getString('activity.error_loading_trip_summary_chronology');
                    scope.tripAlert.hideAlert();
                    loadingStatus.isLoading('TripSummary', false);
                });
            };
		}
	};
});

