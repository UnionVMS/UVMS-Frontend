angular.module('unionvmsWeb').controller('TripreportspanelCtrl',function($scope,activityRestService,loadingStatus,$anchorScroll,locale,tripSummaryService){

    loadingStatus.isLoading('TripSummary', true);
    activityRestService.getTripMessageCount($scope.tripSummServ.trip.id).then(function(response){
        $scope.tripSummServ.trip.fromJson('messageCount',response.data);
        $scope.messageCount = tripSummaryService.trip.messageCount;
        loadingStatus.isLoading('TripSummary', false);
    }, function(error){
        $anchorScroll();
        $scope.alert.hasAlert = true;
        $scope.alert.hasError = true;
        $scope.alert.alertMessage = locale.getString('activity.error_loading_trip_summary_message_counter');
        $scope.alert.hideAlert();
        loadingStatus.isLoading('TripSummary', false);
    });

    $scope.reportHeaders = [
        {
            id: "type",
            label: "activity.reports_panel_column_type",
            width: 3
        },
        {
            id: "date",
            label: "activity.reports_panel_column_date",
            width: 2
        },
        {
            id: "location",
            label: "activity.reports_panel_column_location",
            width: 1
        },
        {
            id: "reason",
            label: "activity.reports_panel_column_reason",
            width: 1
        },
        {
            id: "remarks",
            label: "activity.reports_panel_column_remarks",
            width: 2
        },
        {
            id: "corrections",
            label: "activity.reports_panel_column_corrections",
            width: 1
        },
        {
            id: "detail",
            label: "activity.reports_panel_column_detail",
            width: 1
        }
    ];

});