angular.module('unionvmsWeb').controller('VmspanelmodalCtrl', function($scope, $modalInstance, loadingStatus){
    $scope.isModal = true;
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
    
    $modalInstance.rendered.then(function(){
        loadingStatus.isLoading('LiveviewMap',false);
    });
});