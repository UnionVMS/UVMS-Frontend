angular.module('unionvmsWeb').controller('PopupCtrl', function($scope, $modalInstance, assetInfo) {

    console.log('assetinfo:', assetInfo);
    $scope.isOpen = false;
    $scope.data = {
        items: {
            id: 1,
            pos: [10, 10]
        }
    };

    $scope.init = function(data) {
        $scope.data = data;

    };

    $scope.show = function() {
        $scope.isOpen = true;
    };

    $scope.hide = function() {
        $scope.isOpen = false;
    };
    
    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };
});

