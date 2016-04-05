angular.module('unionvmsWeb').controller('MapprojectionsettingsCtrl',function($scope, $timeout, $interval, locale, spatialRestService, projectionService){
    $scope.coordinatesFormatItems = [];
    $scope.scaleBarUnitsItems = [];
    $scope.projectionSelected = false;
    $scope.hasError = false;
    $scope.isMapConfigurationModal = $('.mapConfigurationModal').length ? true : false;
    $scope.projections = projectionService;

    function setScaleBarUnits() {
        var tempScale = [];
        var scaleBarUnitsMap = {
            'metric': {'name': 'spatial.map_configuration_scale_bar_units_metric'}, 'degrees': {'name': 'spatial.map_configuration_scale_bar_units_degrees'},
            'nautical': {'name': 'spatial.map_configuration_scale_bar_units_nautical'}, 'imperial': {'name': 'spatial.map_configuration_scale_bar_units_imperial'}
        };
        angular.forEach(scaleBarUnitsMap, function (key, value) {
            tempScale.push({"text": locale.getString(key.name), "code": value});
        });
        $scope.scaleBarUnitsItems = tempScale;
    }

    $scope.$watch('configModel.mapSettings.displayProjectionId', function (newVal, oldVal) {
        if (angular.isDefined(newVal)){
            if (newVal !== oldVal && angular.isDefined($scope.projections.items)){
                $scope.projections.setCoordinatesUnitItems(newVal);
                $scope.projectionSelected = true;
            }
        }else if(!newVal){
        	$scope.projectionSelected = false;
        }
    });

    //Initialization
    $scope.init = function () {
        $scope.projectionSelected = false;
        $scope.projections.getProjections();
        setScaleBarUnits();
        //Read properties in the modal
        if (angular.isDefined($scope.initialConfig)){
            if (angular.isDefined($scope.configModel) && angular.isDefined($scope.configModel.mapSettings) && angular.isDefined($scope.configModel.mapSettings.displayProjectionId)){
                $scope.projections.setLazyProjectionAndCoordinates($scope.configModel.mapSettings.displayProjectionId);
                $scope.projectionSelected = true;
            }
        }
        
        //Setting up coordinates format in admin and user preferences
        if (!angular.isDefined($scope.initialConfig) && angular.isDefined($scope.configModel) && angular.isDefined($scope.configModel.mapSettings) && angular.isDefined($scope.configModel.mapSettings.coordinatesFormat)){
            $scope.projections.setLazyProjectionAndCoordinates($scope.configModel.mapSettings.displayProjectionId);
            $scope.projectionSelected = true;
        }
    };
    
    locale.ready('spatial').then(function(){
        $scope.init();
    });
});