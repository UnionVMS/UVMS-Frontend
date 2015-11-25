angular.module('unionvmsWeb').controller('MapprojectionsettingsCtrl',function($scope, locale, spatialRestService){
    $scope.projectionItems = [];
    $scope.coordinatesFormatItems = [];
    $scope.scaleBarUnitsItems = [];
    $scope.projectionSelected = false;

    function setProjectionItems() {
        spatialRestService.getSupportedProjections().then(function (response) {
            $scope.projections = response;
            for (var i = 0; i < $scope.projections.length; i++) {
                $scope.projectionItems.push({"text": $scope.projections[i].name, "code": $scope.projections[i].id});
            }
        }, function (error) {
            //TODO warn the user
        });
    }

    function setScaleBarUnits() {
        var scaleBarUnitsMap = {
            'metric': {'name': 'spatial.map_configuration_scale_bar_units_metric'}, 'degrees': {'name': 'spatial.map_configuration_scale_bar_units_degrees'},
            'nautical': {'name': 'spatial.map_configuration_scale_bar_units_nautical'}, 'imperial': {'name': 'spatial.map_configuration_scale_bar_units_imperial'}
        };
        angular.forEach(scaleBarUnitsMap, function (key, value) {
            $scope.scaleBarUnitsItems.push({"text": locale.getString(key.name), "code": value});
        });
    }

    function setCoordinatesUnitItems(newVal) {
        for (var i = 0; i < $scope.projections.length; i++) {
            if ($scope.projections[i].id === newVal) {
                $scope.projectionSelected = true;
                var formats = $scope.projections[i].formats.split(';');
                for (var j = 0; j < formats.length; j++) {
                    var name = 'spatial.map_configuration_coordinates_format_' + formats[j];
                    $scope.coordinatesFormatItems.push({"text": locale.getString(name), "code": formats[j]});
                }
            }
        }
    }

    function clearCoordinatesUnitItems() {
        $scope.coordinatesFormatItems = [];
        $scope.configModel.mapSettings.coordinatesFormat = undefined;
        $scope.projectionSelected = false;
    }

    $scope.$watch('configModel.mapSettings.displayProjectionId', function (newVal, oldVal) {
        clearCoordinatesUnitItems();
        if (angular.isDefined(newVal) && newVal !== oldVal){
            setCoordinatesUnitItems(newVal);
        }
    });

    //Initialization
    $scope.init = function () {
        setProjectionItems();
        setScaleBarUnits();
    };
    
    locale.ready('spatial').then(function(){
        $scope.init();
    });
});