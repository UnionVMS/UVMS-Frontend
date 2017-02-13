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
 * @name tripReportsPanel
 * @attr {unionvmsWeb.Trip} trip - current trip in trip summary
 * @attr {Object} tripAlert - trip summary alert state
 * @description
 *  A reusable tile that will display the report messages and the message types count related to the selected trip
 */
angular.module('unionvmsWeb').directive('tripReportsPanel', function(loadingStatus,activityRestService,$anchorScroll,locale,reportingNavigatorService,fishingActivityService) {
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
            
            /**
             * Navigate to the proper partial when details button is clicked
             * 
             * @memberof tripReportsPanel
             * @public
             * @alias navigate
             * @param {Object} item - the item object used in the table row
             * @param {Object} node - the node object used as the table subrow
             * @param {String} type - the node type
             */
            scope.navigate = function(item, node, type){
                //FIXME this needs to be changed when the proper data is displayed in the table
                if (type !== 'corrections'){
                    //TODO check the type of fa operation so that we can open the proper partial
                    //FIXME set proper id and correction in the faservice
                    fishingActivityService.resetActivity();
                    fishingActivityService.id = '1234';
                    fishingActivityService.isCorrection = node.corrections;
                    reportingNavigatorService.goToView('tripsPanel','tripDeparturePanel'); 
		           // reportingNavigatorService.goToView('tripsPanel','tripArrivalPanel');
                }
            };
		}
	};
});

