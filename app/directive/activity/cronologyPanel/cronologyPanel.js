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
                loadingStatus.isLoading('TripSummary', true);
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

            init();
		}
	};
});
