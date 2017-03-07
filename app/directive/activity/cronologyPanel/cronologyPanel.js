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
 * @name cronologyPanel
 * @attr {unionvmsWeb.Trip} trip - current trip in trip summary
 * @attr {Object} tripAlert - trip summary alert state
 * @description
 *  A reusable tile that will display the cronology of trips related to the current trip
 */
angular.module('unionvmsWeb').directive('cronologyPanel', function(loadingStatus,activityRestService,$anchorScroll,locale,tripSummaryService) {
	return {
		restrict: 'E',
		replace: true,
		scope: {
            trip: '=',
            tripAlert: '='
		},
		templateUrl: 'directive/activity/cronologyPanel/cronologyPanel.html',
		link: function(scope, element, attrs, fn) {

            /**
			 * Open trip in new tab
			 * 
			 * @memberof cronologyPanel
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
			 * Initializes the cronology panel directive
			 * 
			 * @memberof cronologyPanel
			 * @private
			 */
            var init = function(){
                //get trip cronology
                loadingStatus.isLoading('TripSummary', true, 0);
                activityRestService.getTripCronology(scope.trip.id,5).then(function(response){
                    scope.trip.fromJson('cronology',response.data);
                    scope.cronology = scope.trip.cronology;
                    loadingStatus.isLoading('TripSummary', false);
                }, function(error){
                    $anchorScroll();
                    scope.tripAlert.hasAlert = true;
                    scope.tripAlert.hasError = true;
                    scope.tripAlert.alertMessage = locale.getString('activity.error_loading_trip_summary_cronology');
                    scope.tripAlert.hideAlert();
                    loadingStatus.isLoading('TripSummary', false);
                });
            };
		}
	};
});

