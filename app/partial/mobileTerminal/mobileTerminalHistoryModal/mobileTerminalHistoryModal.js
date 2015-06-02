angular.module('unionvmsWeb').controller('mobileTerminalHistoryModalCtrl',function($scope, $modalInstance, currentMobileTerminalHistory, mobileTerminal){

    $scope.currentMobileTerminalHistory = currentMobileTerminalHistory;
    $scope.mobileTerminal = mobileTerminal;

    //Current filter and sorting for the results table
    $scope.sortType = 'changeDate';
    $scope.sortReverse = true;

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});