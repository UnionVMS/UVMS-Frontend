/**
 * @memberof unionvmsWeb
 * @ngdoc controller
 * @name ActivityoverviewCtrl
 * @param $scope {Service} controller scope
 * @param activityService {Service} The activity service
 * @description
 *  The controller for the fishing activity overview page
 */
angular.module('unionvmsWeb').controller('ActivityoverviewCtrl',function($scope, activityService){
    $scope.actServ = activityService;
    
    /**
     * Get the details of an activity an open the activity details page
     * 
     * @memberof ActivityoverviewCtrl
     * @public
     * @alias getDetails
     */
    $scope.getDetails = function(){
        $scope.actServ.details = {
            name: 'Activity details will be here'
        };
        $scope.goToView(2);
    }
});