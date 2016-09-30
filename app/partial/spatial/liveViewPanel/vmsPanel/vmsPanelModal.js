angular.module('unionvmsWeb').controller('VmspanelmodalCtrl', function($scope, $modalInstance, loadingStatus, reportingNavigatorService){
    $scope.isModal = true;
    $scope.repNav = reportingNavigatorService;
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
    
    $modalInstance.rendered.then(function(){
        loadingStatus.isLoading('LiveviewMap',false);
    });
});