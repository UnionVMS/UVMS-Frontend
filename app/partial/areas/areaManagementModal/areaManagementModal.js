angular.module('unionvmsWeb').controller('AreamanagementmodalCtrl',function($scope, $modalInstance){
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
    
    $scope.save = function(srcGeom){
        $modalInstance.close(srcGeom);
    };
});