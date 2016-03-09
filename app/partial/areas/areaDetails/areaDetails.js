angular.module('unionvmsWeb').controller('AreadetailsCtrl',function($scope, $modalInstance, locale, areaData){
    $scope.area = areaData;
    
    //Close modal
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});