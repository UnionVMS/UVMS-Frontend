angular.module('unionvmsWeb').controller('CronologypanelCtrl',function($scope,reportRestService,loadingStatus,locale,tripSummaryService,$anchorScroll){

    loadingStatus.isLoading('TripSummary', true);
    reportRestService.getTripCronology($scope.tripId,5).then(function(response){
        tripSummaryService.cronology = response.data;
        $scope.cronology = tripSummaryService.cronology;

        if(angular.isDefined($scope.cronology.previousTrips) && $scope.cronology.previousTrips.length > 0){
            $scope.cronology.previousTrips = $scope.cronology.previousTrips.reverse();
        }
        if(angular.isDefined($scope.cronology.nextTrips) && $scope.cronology.nextTrips.length > 0){
            $scope.cronology.nextTrips = $scope.cronology.nextTrips.reverse();
        }
        loadingStatus.isLoading('TripSummary', false);
    }, function(error){
        $anchorScroll();
        $scope.alert.hasAlert = true;
        $scope.alert.hasError = true;
        $scope.alert.alertMessage = locale.getString('spatial.error_loading_trip_summary_cronology');
        $scope.alert.hideAlert();
        loadingStatus.isLoading('TripSummary', false);
    });

});