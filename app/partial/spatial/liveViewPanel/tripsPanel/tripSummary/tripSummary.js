angular.module('unionvmsWeb').controller('TripsummaryCtrl',function($scope,reportRestService,tripSummaryService,loadingStatus,spatialConfigAlertService,$anchorScroll,locale){

    $scope.alert = spatialConfigAlertService;

    $scope.tabTitles = [
        {
            title: 'BEL-TRP-O16-2016-0020'
        },
        {
            title: 'BEL-TRP-O16-2016-0021'
        },
        {
            title: 'BEL-TRP-O16-2016-0022'
        }
    ];

    var tripId = 'NOR-TRP-20160517234053706';

    loadingStatus.isLoading('TripSummary', true);
    reportRestService.getTripVessel(tripId).then(function(response){
        tripSummaryService.tripVessel = response.data;
        tripSummaryService.tripRoles = tripSummaryService.tripVessel.contactPersons;

        angular.forEach(tripSummaryService.tripRoles,function(value, key) {
            value.code = value.id = key;
            value.text = value.title + ' ' + value.givenName + ' ' + value.middleName + ' ' + value.familyName;
        });
        loadingStatus.isLoading('TripSummary', false);
    }, function(error){
        $anchorScroll();
        $scope.alert.hasAlert = true;
        $scope.alert.hasError = true;
        $scope.alert.alertMessage = locale.getString('spatial.error_loading_trip_summary_vessel_data');
        $scope.alert.hideAlert();
        loadingStatus.isLoading('TripSummary', false);
    });

});