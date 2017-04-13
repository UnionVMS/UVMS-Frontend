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
angular.module('unionvmsWeb').directive('tripReportsPanel', function(loadingStatus,activityRestService,$anchorScroll,locale,reportingNavigatorService,fishingActivityService,tripReportsTimeline) {
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
                    width: 2
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

            //when the trip is initialized
            scope.$watch('trip',function(newVal){
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
                loadingStatus.isLoading('TripSummary', true, 0);
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
                    fishingActivityService.id = node.id;
                    fishingActivityService.isCorrection = node.corrections;
                    fishingActivityService.documentType = node.documentType;
                    tripReportsTimeline.setCurrentPreviousAndNextItem(node);
                    reportingNavigatorService.goToView('tripsPanel', fishingActivityService.getFaView(node.srcType));
                }
            };
        }
    };
})
/**
 * @memberof unionvmsWeb
 * @ngdoc service
 * @name tripReportsTimeline
 * @description
 *  A service for managing the ordered access to fishing activities within a trip
 */
.factory('tripReportsTimeline', function(){
    var tripReports = {
        reports: [],
        currentItemIdx: undefined,
        previousItem: {
            idx: undefined,
            type: undefined
        },
        nextItem: {
            idx: undefined,
            type: undefined
        }
    };

    /**
     * Set the current, previous and next fishing activities items for navigation purposes
     * 
     * @memberof tripReportsTimeline
     * @public
     * @alias setCurrentPreviousAndNextItem
     */
    tripReports.setCurrentPreviousAndNextItem = function(selectedRecord){
        var idx = _.findIndex(this.reports, function(report){
            return report.id === selectedRecord.id;
        });

        if (idx !== -1){
            tripReports.currentItemIdx = idx;
            tripReports.setItem('previous');
            tripReports.setItem('next');
        }
    };

    /**
     * Set an activity item within the factory (it might be a next or previous item)
     * 
     * @memberof tripReportsTimeline
     * @public
     * @alias setItem
     * @param {String} direction - The direction of the item. Supported values are: next or previous.
     */
    tripReports.setItem = function(direction){
        var idx, type;
        if (direction === 'previous'){
            idx = this.currentItemIdx - 1;
            if (idx >= 0){
                type = this.reports[idx].srcType;
            } else {
                idx = undefined;
                type = undefined;
            }
            this.previousItem.idx = idx;
            this.previousItem.type = type;
        } else {
            idx = this.currentItemIdx + 1;
            if (idx < this.reports.length){
                type = this.reports[idx].srcType;
            } else {
                idx = undefined;
                type = undefined;
            }
            this.nextItem.idx = idx;
            this.nextItem.type = type;
        }
    };
    
    /**
     * Reset the trip reports timeline service
     * 
     * @memberof tripReportsTimeline
     * @public
     * @alias reset
     */
    tripReports.reset = function(){
        this.reports = [];
        this.currentItemIdx = undefined;
        this.previousItem = {
            idx: undefined,
            type: undefined
        };
        this.nextItem = {
            idx: undefined,
            type: undefined
        };
    }

    return tripReports;
});

