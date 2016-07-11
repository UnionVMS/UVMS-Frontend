/*
﻿Developed with the contribution of the European Commission - Directorate General for Maritime Affairs and Fisheries
© European Union, 2015-2016.

This file is part of the Integrated Fisheries Data Management (IFDM) Suite. The IFDM Suite is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as published by the
Free Software Foundation, either version 3 of the License, or any later version. The IFDM Suite is distributed in
the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. You should have received a
copy of the GNU General Public License along with the IFDM Suite. If not, see <http://www.gnu.org/licenses/>.
 */
angular.module('unionvmsWeb').controller('MapprojectionsettingsCtrl',function($scope, locale, spatialRestService, projectionService){
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