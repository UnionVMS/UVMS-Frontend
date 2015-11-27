angular.module('unionvmsWeb').controller('MapconfigurationmodalCtrl', function ($scope, $timeout, locale, mapConfigs, $modalInstance, SpatialConfig, spatialRestService) {
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
        $scope.initialConfig = undefined;
    };

    $scope.save = function () {
        if (angular.isDefined($scope.configModel.mapSettings.displayProjectionId) && !angular.isDefined($scope.configModel.mapSettings.coordinatesFormat)){
            return false;
        } else {
            $modalInstance.close($scope.exportMapConfiguration());
            $scope.initialConfig = undefined;
        }
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
        if (angular.isDefined(mapConfigs)){
            $scope.initialConfig = $scope.configModel.forReportConfigFromJson(mapConfigs);
        } else {
            $scope.configModel = $scope.configModel.forReportConfig();
        } 
    });
});
