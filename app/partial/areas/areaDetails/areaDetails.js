angular.module('unionvmsWeb').controller('AreadetailsCtrl',function($scope, $modalInstance, locale, areaData, scopesAllowed, datasetAllowed){
    $scope.area = areaData;
    $scope.scopes = scopesAllowed;
    $scope.dataset = datasetAllowed;
    
    //Close modal
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});