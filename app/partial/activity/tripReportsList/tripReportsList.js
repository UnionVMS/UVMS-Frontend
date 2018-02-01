angular.module('unionvmsWeb').controller('TripreportslistCtrl',function($scope,tripSummaryService,visibilityService,$stateParams){

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
      if (angular.isUndefined($stateParams.tripId) || $stateParams.tripId === null){
          $scope.callServer(tableState, ctrl, 'tripsList');
      } else {
          $scope.actServ.tripsList.stCtrl = ctrl;
          $scope.actServ.tripsList.tableState = tableState;
      }
    };

    $scope.openTripSummary = function(tripId){
      $scope.tripSummServ.openNewTrip(tripId);
      $scope.goToView(3);
    };

    $scope.tripIdSort = function(value){
      return value.schemeId + ':' + value.tripId;
  };
});