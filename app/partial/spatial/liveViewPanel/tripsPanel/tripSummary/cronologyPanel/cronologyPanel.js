angular.module('unionvmsWeb').controller('CronologypanelCtrl',function($scope,activityRestService,loadingStatus,locale,tripSummaryService,$anchorScroll){

    loadingStatus.isLoading('TripSummary', true);
    activityRestService.getTripCronology($scope.trip.id,5).then(function(response){
        $scope.trip.fromJson('cronology',response.data);
        $scope.cronology = tripSummaryService.trip.cronology;
        loadingStatus.isLoading('TripSummary', false);
    }, function(error){
        $anchorScroll();
        $scope.alert.hasAlert = true;
        $scope.alert.hasError = true;
        $scope.alert.alertMessage = locale.getString('activity.error_loading_trip_summary_cronology');
        $scope.alert.hideAlert();
        loadingStatus.isLoading('TripSummary', false);
    });

});