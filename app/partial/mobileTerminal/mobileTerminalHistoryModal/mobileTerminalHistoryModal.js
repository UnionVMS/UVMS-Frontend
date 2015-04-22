angular.module('unionvmsWeb').controller('mobileTerminalHistoryModalCtrl',function($scope, $modalInstance, currentMobileTerminalHistory, $filter, mobileTerminalId){

$scope.currentMobileTerminalHistory = currentMobileTerminalHistory;
$scope.mobileTerminalId = mobileTerminalId;

//Current filter and sorting for the results table
    $scope.sortType = 'changeDate';
    $scope.sortReverse = false;

$scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };

});