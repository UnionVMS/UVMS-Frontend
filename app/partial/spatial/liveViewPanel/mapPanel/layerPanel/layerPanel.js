angular.module('unionvmsWeb').controller('LayerpanelCtrl',function($scope, $timeout, mapService){
  $scope.expanded = false;

  $scope.tab = "LAYERTREE";

  $scope.toggle = function() {
    $scope.expanded = !$scope.expanded;
    $timeout(mapService.updateMapSize, 50);
  };

  $scope.tabClick = function( tab ) {
    $scope.tab = tab;
  };
});
