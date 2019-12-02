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
angular.module('unionvmsWeb').directive('tripReportsPanel', function (loadingStatus, activityRestService, breadcrumbService,$anchorScroll, locale, reportingNavigatorService, fishingActivityService, tripReportsTimeline, $compile) {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            trip: '=',
            tripAlert: '=',
            activityTrip: '='
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
                    width: 1,
                    alignCenter: true
                },
                {
                    id: "detail",
                    label: "activity.reports_panel_column_detail",
                    width: 1,
                    alignCenter: true
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
            scope.navigate = function(node, parentId){
                fishingActivityService.resetActivity();
                    fishingActivityService.id = node.id;
                    fishingActivityService.isCorrection = node.corrections;
                    fishingActivityService.documentType = node.documentType;
                    tripReportsTimeline.setCurrentPreviousAndNextItem(node.id, parentId);
                    // Navigation to activity details in activity and reporting.  
                    if (scope.activityTrip === 'activity') {
                       fishingActivityService.activityType = node.srcType;
                       breadcrumbService.goToItem(7);
                    } else {
                        fishingActivityService.activityType = node.srcType;
                        reportingNavigatorService.goToView('tripsPanel',  'FishingActivityPanel',function(){
                            var content = angular.element('fishing-activity-navigator');
                            if(content.length){
                                $compile(content)(scope);
                            }
                        });
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
            currentItemSubIdx: undefined,
            previousItem: {
                idx: undefined,
                type: undefined
            },
            nextItem: {
                idx: undefined,
                type: undefined
            },
            previousSubItem: {
                idx: undefined,
                type: undefined
            },
            nextSubItem: {
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
         * @param {Number} id - id of the current node
         * @param {Number} parentId - id of the parent node
         */
        tripReports.setCurrentPreviousAndNextItem = function(id, parentId){

            var nodeId;
            var subNodeId;
            if(angular.isDefined(parentId)){
                nodeId = parentId;
                subNodeId = id;
            }else{
                nodeId = id;
            }

            var idx = _.findIndex(this.reports, function(report){
                return report.id === nodeId;
            });

            if (idx !== -1){
                var subIdx;
                if(angular.isDefined(subNodeId)){
                    subIdx = _.findIndex(this.reports[idx], function(subReport){
                        return subReport.id === subNodeId;
                    });
                }

                tripReports.currentItemIdx = idx;
                tripReports.currentItemSubIdx = subIdx;
                tripReports.setPreviousItem();
                tripReports.setNextItem();
                tripReports.setPreviousSubItem();
                tripReports.setNextSubItem();
            }
        };

        /**
         * Set the previous activity node item within the factory
         * 
         * @memberof tripReportsTimeline
         * @public
         * @alias setPreviousItem
         */
        tripReports.setPreviousItem = function(){
            var idx, type;
            if(this.currentItemIdx - 1 >= 0){
                idx = this.currentItemIdx - 1;
                type = this.reports[idx].srcType;
            }

            this.previousItem.idx = idx;
            this.previousItem.type = type;
        };

        /**
         * Set the next activity node item within the factory
         * 
         * @memberof tripReportsTimeline
         * @public
         * @alias setNextItem
         */
        tripReports.setNextItem = function(){
            var idx, type;
            if(this.currentItemIdx + 1 < this.reports.length){
                idx = this.currentItemIdx + 1;
                type = this.reports[idx].srcType;
            }

            this.nextItem.idx = idx;
            this.nextItem.type = type;
        };

        /**
         * Set the previous activity subnode item within the factory
         * 
         * @memberof tripReportsTimeline
         * @public
         * @alias setPreviousItem
         */
        tripReports.setPreviousSubItem = function(){
            var idx, type;
            if(angular.isDefined(this.currentItemSubIdx)){
                if(this.currentItemSubIdx > 0){
                    idx = this.currentItemSubIdx - 1;
                    type = this.reports[this.currentItemIdx].nodes[idx].srcType;
                }else if(this.currentItemSubIdx === 0){
                    type = this.reports[this.currentItemIdx].srcType;
                }
            }

            this.previousSubItem.idx = idx;
            this.previousSubItem.type = type;
        };

        /**
         * Set the next activity subnode item within the factory
         * 
         * @memberof tripReportsTimeline
         * @public
         * @alias setNextSubItem
         */
        tripReports.setNextSubItem = function(){
            var idx, type;
            if(angular.isDefined(this.currentItemSubIdx) && this.currentItemSubIdx + 1 < this.reports[this.currentItemIdx].nodes.length){
                idx = this.currentItemSubIdx + 1;
                type = this.reports[this.currentItemIdx].nodes[idx].srcType;
            }else if(angular.isDefined(this.reports[this.currentItemIdx].nodes) && this.reports[this.currentItemIdx].nodes.length){
                idx = 0;
                type = this.reports[this.currentItemIdx].nodes[idx].srcType;
            }

            this.nextSubItem.idx = idx;
            this.nextSubItem.type = type;
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
            this.currentItemSubIdx = undefined;
            this.previousItem = {
                idx: undefined,
                type: undefined
            };
            this.nextItem = {
                idx: undefined,
                type: undefined
            };
            this.previousSubItem = {
                idx: undefined,
                type: undefined
            };
            this.nextSubItem = {
                idx: undefined,
                type: undefined
            };
        };

        return tripReports;
    });

