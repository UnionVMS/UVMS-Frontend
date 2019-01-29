angular.module('unionvmsWeb').controller('PopupCtrl', function($scope, $modalInstance, assetInfo) {
    $scope.data = assetInfo;

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };
});

