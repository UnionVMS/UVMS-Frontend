/**
 * @memberof unionvmsWeb
 * @ngdoc directive
 * @name tripReportsPanel
 * @attr {unionvmsWeb.Trip} trip - current trip in trip summary
 * @attr {Object} tripAlert - trip summary alert state
 * @description
 *  A reusable tile that will display the report messages and the message types count related to the selected trip
 */
angular.module('unionvmsWeb').directive('tripReportsPanel', function(loadingStatus,activityRestService,$anchorScroll,locale) {
	return {
		restrict: 'E',
		replace: true,
		scope: {
            trip: '=',
            tripAlert: '='
		},
		templateUrl: 'directive/activity/tripReportsPanel/tripReportsPanel.html',
		link: function(scope, element, attrs, fn) {

            //Report table headers
            scope.reportHeaders = [
                {
                    id: "type",
                    label: "activity.reports_panel_column_type",
                    width: 3
                },
                {
                    id: "date",
                    label: "activity.reports_panel_column_date",
                    width: 2
                },
                {
                    id: "location",
                    label: "activity.reports_panel_column_location",
                    width: 1
                },
                {
                    id: "reason",
                    label: "activity.reports_panel_column_reason",
                    width: 1
                },
                {
                    id: "remarks",
                    label: "activity.reports_panel_column_remarks",
                    width: 2
                },
                {
                    id: "corrections",
                    label: "activity.reports_panel_column_corrections",
                    width: 1
                },
                {
                    id: "detail",
                    label: "activity.reports_panel_column_detail",
                    width: 1
                }
            ];

            //when tthe trip is initialized
            scope.$watch('trip',function(){
				init();
			});

            /**
			 * Initializes the trip reports panel directive
			 * 
			 * @memberof tripReportsPanel
			 * @private
			 */
            var init = function(){
                //get trip message count
                loadingStatus.isLoading('TripSummary', true);
                activityRestService.getTripMessageCount(scope.trip.id).then(function(response){
                    scope.trip.fromJson('messageCount',response.data);
                    scope.messageCount = scope.trip.messageCount;
                    loadingStatus.isLoading('TripSummary', false);
                }, function(error){
                    $anchorScroll();
                    scope.tripAlert.hasAlert = true;
                    scope.tripAlert.hasError = true;
                    scope.tripAlert.alertMessage = locale.getString('activity.error_loading_trip_summary_message_counter');
                    scope.tripAlert.hideAlert();
                    loadingStatus.isLoading('TripSummary', false);
                });
            };
		}
	};
});
