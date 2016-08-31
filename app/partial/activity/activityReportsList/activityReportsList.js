/**
 * @memberof unionvmsWeb
 * @ngdoc controller
 * @name ActivityreportslistCtrl
 * @param $scope {Service} controller scope
 * @param activityService {Service} The activity service
 * @attr {Array} displayedActivities - The array of displayed activities used by smart tables
 * @attr {Number} itemsPerPage - The number of items to be displayed per table page
 * @description
 *  The controller for the fisihing activity reports table list
 */
angular.module('unionvmsWeb').controller('ActivityreportslistCtrl',function($scope, activityService){
    $scope.actServ = activityService;
    $scope.displayedActivities = [].concat($scope.actServ.activities);
    $scope.itemsPerPage = 25;
    
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