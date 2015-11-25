angular.module('unionvmsWeb').controller('MapconfigurationmodalCtrl', function ($scope, locale, $modalInstance, SpatialConfig, spatialRestService) {
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

    $scope.save = function () {
        $modalInstance.close($scope.exportMapConfiguration());
    };

    $scope.exportMapConfiguration = function () {
        var exported = {
            mapProjectionId: $scope.configModel.mapSettings.mapProjectionId,
            displayProjectionId: $scope.configModel.mapSettings.displayProjectionId,
            coordinatesFormat: $scope.configModel.mapSettings.coordinatesFormat,
            scaleBarUnits: $scope.configModel.mapSettings.scaleBarUnits
        };
        return exported;
    };

    $modalInstance.rendered.then(function () {
        $scope.configModel = new SpatialConfig();
    });
});
