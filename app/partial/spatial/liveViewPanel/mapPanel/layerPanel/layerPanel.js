angular.module('unionvmsWeb').controller('LayerpanelCtrl',function($scope){
  $scope.expanded = true;

  $scope.tab = "LAYERTREE";

  $scope.toggle = function() {
    $scope.expanded = !$scope.expanded;
  };

  $scope.tabClick = function( tab ) {
    $scope.tab = tab;
  };
});
