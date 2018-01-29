angular.module('unionvmsWeb').controller('TripreportslistCtrl',function($scope,reportService,visibilityService,locale,csvWKTService,tripSummaryService,reportingNavigatorService){

    $scope.isTripFilterVisible = false;
    $scope.startDate = undefined;
    $scope.endDate = undefined;
    $scope.attrVisibility = visibilityService;
    $scope.tripSummServ = tripSummaryService;
    $scope.activityTypes = [];
    var stLastTableState;

    $scope.updateTripsList = function(tableState, ctrl){
      delete tableState.isSorting;
      if(stLastTableState && !_.isEqual(tableState.sort, stLastTableState.sort)){
        tableState.isSorting = true;
      }
      stLastTableState = angular.copy(tableState);
      $scope.callServer(tableState, ctrl, 'tripsList');
    };

    $scope.openTripSummary = function(tripId){
      $scope.tripSummServ.openNewTrip(tripId);
      $scope.goToView(3);
    };

    $scope.tripIdSort = function(value){
      return value.schemeId + ':' + value.tripId;
  };
});