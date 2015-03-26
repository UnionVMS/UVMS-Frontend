angular.module('unionvmsWeb').controller('VesselhistorymodalCtrl',function($scope, $modalInstance, vesselHistory){

    $scope.vesselHistory = vesselHistory;

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };

});