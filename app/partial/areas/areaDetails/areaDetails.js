angular.module('unionvmsWeb').controller('AreadetailsCtrl',function($scope, $modalInstance, locale, areaData, globalSettingsService){
    $scope.area = areaData;
    
    //Close modal
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});