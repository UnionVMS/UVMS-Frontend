angular.module('unionvmsWeb').controller('TripsummaryCtrl',function($scope,activityRestService,tripSummaryService,loadingStatus,$anchorScroll,locale){

    $scope.tripSummServ = tripSummaryService;

    loadingStatus.isLoading('TripSummary', true);
    loadingStatus.isLoading('TripSummary', true);
    activityRestService.getTripVessel($scope.trip.id).then(function(response){
        $scope.trip.fromJson('vessel',response.data);
        loadingStatus.isLoading('TripSummary', false);
    }, function(error){
        $anchorScroll();
        $scope.alert.hasAlert = true;
        $scope.alert.hasError = true;
        $scope.alert.alertMessage = locale.getString('activity.error_loading_trip_summary_vessel_data');
        $scope.alert.hideAlert();
        loadingStatus.isLoading('TripSummary', false);
    });

    activityRestService.getTripReports($scope.trip.id).then(function(response){
        $scope.trip.fromJson('reports',response.data);
        loadingStatus.isLoading('TripSummary', false);
    }, function(error){
        $anchorScroll();
        $scope.alert.hasAlert = true;
        $scope.alert.hasError = true;
        $scope.alert.alertMessage = locale.getString('activity.error_loading_trip_summary_reports');
        $scope.alert.hideAlert();
        loadingStatus.isLoading('TripSummary', false);
    });

});