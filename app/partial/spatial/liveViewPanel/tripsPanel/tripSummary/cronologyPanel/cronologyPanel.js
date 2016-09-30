angular.module('unionvmsWeb').controller('CronologypanelCtrl',function($scope,reportRestService,loadingStatus,locale){

/*    loadingStatus.isLoading('tripSummary', true);
*/
    $scope.cronology = reportRestService.getTripCronology().data;
    if(angular.isDefined($scope.cronology.previousTrips) && $scope.cronology.previousTrips.length > 0){
        $scope.cronology.previousTrips = $scope.cronology.previousTrips.reverse();
    }
    if(angular.isDefined($scope.cronology.nextTrips) && $scope.cronology.nextTrips.length > 0){
        $scope.cronology.nextTrips = $scope.cronology.nextTrips.reverse();
    }

/*    loadingStatus.isLoading('tripSummary', false);
*/
});