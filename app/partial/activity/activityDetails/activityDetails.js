/**
 * @memberof unionvmsWeb
 * @ngdoc controller
 * @name ActivitydetailsCtrl
 * @param $scope {Service} controller scope
 * @param activityService {Service} The activity service
 * @description
 *  The controller for the activity details page
 */
angular.module('unionvmsWeb').controller('ActivitydetailsCtrl',function($scope, activityService){
    $scope.actServ = activityService;
});