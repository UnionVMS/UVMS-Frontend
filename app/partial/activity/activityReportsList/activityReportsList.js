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
 * @ngdoc controller
 * @name ActivityreportslistCtrl
 * @param $scope {Service} controller scope
 * @param activityService {Service} The activity service
 * @param visibilityService {Service} The visibility service <p>{@link unionvmsWeb.visibilityService}</p>
 * @attr {Array} displayedActivities - The array of displayed activities used by smart tables
 * @description
 *  The controller for the fisihing activity reports table list
 */
angular.module('unionvmsWeb').controller('ActivityreportslistCtrl',function($scope, activityService, visibilityService){
    $scope.actServ = activityService;
    $scope.attrVisibility = visibilityService;
    
    /**
     * Pipe function used in the smartTable in order to support server side pagination and sorting
     * 
     * @memberof ActivityreportslistCtrl
     * @public
     * @alias callServer
     */
    $scope.callServer = function(tableState){
        if (!$scope.actServ.reportsList.isLoading && angular.isDefined($scope.actServ.reportsList.searchObject.multipleCriteria)){
            $scope.actServ.reportsList.tableState = tableState;
            $scope.actServ.reportsList.isLoading = true;
            
            var searchField, sortOrder; 
            if (angular.isDefined(tableState.sort.predicate)){
                searchField = getTruePredicate(tableState.sort.predicate);
                sortOrder = tableState.sort.reverse;
            }
            
            $scope.actServ.reportsList.sorting = {
                sortBy: searchField,
                reversed: sortOrder
            };
            
            $scope.actServ.getActivityList(callServerCallback, tableState);
        }
    };
    
    /**
     * A callback function to set the correct number of pages in the smartTable. To be used with the callServer function.
     * 
     * @memberof ActivityreportslistCtrl
     * @private
     */
    function callServerCallback (tableState){
        tableState.pagination.numberOfPages = $scope.actServ.reportsList.pagination.totalPages;
    }
    
    /**
     * Get the proper match between client and server side attributes in order to properly set the field and order to request FA reports
     * 
     * @memberof ActivityreportslistCtrl
     * @private
     * @param {String} tablePredicate - The name of the attribute in the client side 
     * @returns {String} The name of the attribute in the server side
     */
    function getTruePredicate(tablePredicate){
        var predicateMapping = {
            activityType: 'ACTIVITY_TYPE',
            purposeCode: 'PURPOSE',
            occurence: 'OCCURRENCE',
            startDate: 'PERIOD_START',
            endDate: 'PERIOD_END',
            FAReportType: 'REPORT_TYPE',
            dataSource: 'SOURCE'
        };
        
        return predicateMapping[tablePredicate];
    }
    
    /**
     * Open the history partial through the index of the table row record
     * 
     * @memberof ActivityreportslistCtrl
     * @public
     * @alias openOverview
     * @param {Number} idx - The index of the activity record to use to fetch the history data
     */
    $scope.openHistory = function(idx){
        $scope.actServ.overview = $scope.actServ.displayedActivities[idx];
        if (angular.isDefined($scope.actServ.overview.fluxReportReferenceId) && $scope.actServ.overview.uniqueReportIdList.length > 0){
            $scope.actServ.getHistory();
            $scope.goToView(1);
        }
    };
    
    /**
     * Open the activity details partial through the index of the table row record
     * 
     * @memberof ActivityreportslistCtrl
     * @public
     * @alias openDetails
     * @param {Number} idx - The index of the activity record to use to fetch the detail data
     */
    $scope.openDetails = function(idx){
        //TODO fetch the data and load the partial
        $scope.actServ.overview = $scope.actServ.displayedActivities[idx]; //TODO check if we need this
        $scope.actServ.id = $scope.actServ.displayedActivities[idx].fishingActivityId;
        $scope.actServ.activityType = $scope.actServ.displayedActivities[idx].activityType.toLowerCase();
        
        $scope.goToView(3);
        //reportingNavigatorService.goToView('tripsPanel','tripDeparturePanel');
    };
});
