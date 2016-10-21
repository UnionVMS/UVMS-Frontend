/**
 * @memberof unionvmsWeb
 * @ngdoc controller
 * @name ActivityreportslistCtrl
 * @param $scope {Service} controller scope
 * @param activityService {Service} The activity service
 * @attr {Array} displayedActivities - The array of displayed activities used by smart tables
 * @description
 *  The controller for the fisihing activity reports table list
 */
angular.module('unionvmsWeb').controller('ActivityreportslistCtrl',function($scope, activityService){
    $scope.actServ = activityService;
    $scope.displayedActivities = [].concat($scope.actServ.activities);
    
    /**
     * Pipe function used in the smartTable in order to support server side pagination and sorting
     * 
     * @memberof ActivityreportslistCtrl
     * @public
     * @alias callServer
     */
    $scope.callServer = function(tableState){
        $scope.actServ.reportsList.tableState = tableState;
        $scope.actServ.reportsList.isLoading = true;
        $scope.actServ.reportsList.sortKey = {
            field: getTruePredicate(tableState.sort.predicate),
            order: tableState.sort.reverse === true ? 'DESC' : 'ASC'
        };
        
        $scope.actServ.reportsList.pagination.page = tableState.pagination.start / $scope.actServ.reportsList.pagination.listSize + 1;
        
        $scope.actServ.getActivityList(callServerCallback, tableState);
    };
    
    /**
     * A callback function to set the correct number of pages in the smartTable. To be used with the callServer function.
     * 
     * @memberof ActivityreportslistCtrl
     * @private
     */
    function callServerCallback (tableState){
        tableState.pagination.numberOfPages = $scope.actServ.reportsList.pagination.totalPageCount;
    }
    
    /**
     * Get the proper match between client and server side attributes in order to properly set the field and order to request FA reports
     * 
     * @memberof ActivityreportslistCtrl
     * @private
     * @params {String} tablePredicate - The name of the attribute in the client side 
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
            dataSource: 'SOURCE',
            fromName: 'FROM_NAME'
        };
        
        return predicateMapping[tablePredicate];
    }
    
    /**
     * Open the overview partial through the index of the table row record
     * 
     * @memberof ActivityreportslistCtrl
     * @public
     * @alias openOverview
     * @param {Number} idx - The index of the activity record to use to fetch the overview data
     */
    $scope.openOverview = function(idx){
        $scope.actServ.overview = $scope.displayedActivities[idx];
        $scope.goToView(1);
    };
});