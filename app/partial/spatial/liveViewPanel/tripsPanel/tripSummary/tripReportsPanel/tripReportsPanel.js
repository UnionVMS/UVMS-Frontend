angular.module('unionvmsWeb').controller('TripreportspanelCtrl',function($scope,reportRestService,loadingStatus,$anchorScroll,locale,tripSummaryService){

loadingStatus.isLoading('TripSummary', true);
reportRestService.getTripMessageCount($scope.tripId).then(function(response){
    tripSummaryService.messageCount = response.data;
    $scope.messageCount = tripSummaryService.messageCount;
    loadingStatus.isLoading('TripSummary', false);
}, function(error){
    $anchorScroll();
    $scope.alert.hasAlert = true;
    $scope.alert.hasError = true;
    $scope.alert.alertMessage = locale.getString('spatial.error_loading_trip_summary_message_counter');
    $scope.alert.hideAlert();
    loadingStatus.isLoading('TripSummary', false);
});

$scope.reportHeaders = [
    {
        id: "type",
        label: "spatial.reports_panel_column_type",
        width: 3
    },
    {
        id: "date",
        label: "spatial.reports_panel_column_date",
        width: 2
    },
    {
        id: "location",
        label: "spatial.reports_panel_column_location",
        width: 1
    },
    {
        id: "reason",
        label: "spatial.reports_panel_column_reason",
        width: 1
    },
    {
        id: "remarks",
        label: "spatial.reports_panel_column_remarks",
        width: 2
    },
    {
        id: "corrections",
        label: "spatial.reports_panel_column_corrections",
        width: 1
    },
    {
        id: "detail",
        label: "spatial.reports_panel_column_detail",
        width: 1
    }
];

$scope.data = [
  {
    "type": "Departure",
    "nodes": [
      {
        "type": "Departure (Declaration)",
        "date": "yy-mm-dd hh:mm",
        "location": "BEOST",
        "reason": "Fishing",
        "remarks": "Trawling Beam (gear)",
        "corretions": false,
        "detail": true
      },
      {
        "type": "Correction: Departure (Declaration)",
        "date": "yy-mm-dd hh:mm",
        "location": "BEZEE",
        "reason": "Fishing",
        "remarks": "Trawling Beam (gear)",
        "corretions": true,
        "detail": true
      }
    ]
  },
  {
    "type": "Fishing operation (Declaration)",
    "date": "yy-mm-dd hh:mm",
    "location": "Vla - 31a4",
    "reason": "Fishing",
    "remarks": "Trawling Beam (gear used)",
    "corretions": false,
    "nodes": [
      {
        "type": "Fishing operation (Declaration)",
        "date": "yy-mm-dd hh:mm",
        "location": "Vla - 31a4",
        "reason": "Fishing",
        "remarks": "Trawling Beam (gear used)",
        "corretions": false,
        "detail": true
      },
      {
        "type": "Fishing operation (Declaration)",
        "date": "yy-mm-dd hh:mm",
        "location": "Vla - 31a4",
        "reason": "Fishing",
        "remarks": "Trawling Beam (gear used)",
        "corretions": true,
        "detail": true
      }
    ]
  },
  {
    "type": "Fishing operation (Declaration)",
    "date": "yy-mm-dd hh:mm",
    "location": "Vla - 31a4",
    "reason": "Fishing",
    "remarks": "Trawling Beam (gear used)",
    "corretions": false,
    "nodes": [
      {
        "type": "Fishing operation (Declaration)",
        "date": "yy-mm-dd hh:mm",
        "location": "Vla - 31a4",
        "reason": "Fishing",
        "remarks": "Trawling Beam (gear used)",
        "corretions": true,
        "detail": true
      },
      {
        "type": "Fishing operation (Declaration)",
        "date": "yy-mm-dd hh:mm",
        "location": "Vla - 31a4",
        "reason": "Fishing",
        "remarks": "Trawling Beam (gear used)",
        "corretions": false,
        "detail": true
      }
    ]
  }
];

});