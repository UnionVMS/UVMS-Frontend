angular.module('unionvmsWeb').controller('MapprojectionsettingsCtrl',function($scope, $timeout, locale, spatialRestService){
    $scope.projectionItems = [];
    $scope.coordinatesFormatItems = [];
    $scope.scaleBarUnitsItems = [];
    $scope.projectionSelected = false;
    $scope.hasError = false;

    function setProjectionItems() {
        var tempProj = [];
        for (var i = 0; i < $scope.projections.length; i++) {
            tempProj.push({"text": $scope.projections[i].name, "code": $scope.projections[i].id});
        }
        $scope.projectionItems = tempProj;
    }

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

    function setCoordinatesUnitItems(newVal) {
        var tempCoords = [];
        for (var i = 0; i < $scope.projections.length; i++) {
            if ($scope.projections[i].id === newVal) {
                $scope.projectionSelected = true;
                var formats = $scope.projections[i].formats.split(';');
                for (var j = 0; j < formats.length; j++) {
                    var name = 'spatial.map_configuration_coordinates_format_' + formats[j];
                    tempCoords.push({"text": locale.getString(name), "code": formats[j]});
                }
            }
        }
        $scope.coordinatesFormatItems = tempCoords;
    }

    function clearCoordinatesUnitItems() {
        $scope.coordinatesFormatItems = [];
        if ($scope.projectionSelected === true){
            $scope.configModel.mapSettings.coordinatesFormat = undefined;
        }
        $scope.projectionSelected = false;
    }

    $scope.$watch('configModel.mapSettings.displayProjectionId', function (newVal, oldVal) {
        clearCoordinatesUnitItems();
        if (angular.isDefined(newVal)){
            if (newVal !== oldVal){
                setCoordinatesUnitItems(newVal);
            }
        }
    });

    //Initialization
    $scope.init = function () {
        setProjectionItems();
        setScaleBarUnits();
        //Read properties in the modal
        if (angular.isDefined($scope.initialConfig)){
            angular.copy($scope.initialConfig, $scope.configModel);
        }
        
        //Setting up coordinates format in admin and user preferences
        if (angular.isDefined($scope.configModel.mapSettings.coordinatesFormat)){
            $scope.projectionSelected = true;
            setCoordinatesUnitItems($scope.configModel.mapSettings.displayProjectionId);
        }
    };
    
    //Get data from server
    $scope.getSupportedProjections = function(){
        spatialRestService.getSupportedProjections().then(function (response){
            $scope.projections = response;
            $scope.init();
        }, function(error){
            $scope.hasError = true;
            $timeout(function(){
                $scope.hasError = false;
            }, 5000);
        });
    };
    
    locale.ready('spatial').then(function(){
        $scope.getSupportedProjections();
    });
});