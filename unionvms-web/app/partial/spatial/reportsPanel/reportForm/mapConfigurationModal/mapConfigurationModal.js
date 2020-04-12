/*
Developed with the contribution of the European Commission - Directorate General for Maritime Affairs and Fisheries
© European Union, 2015-2016.

This file is part of the Integrated Fisheries Data Management (IFDM) Suite. The IFDM Suite is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as published by the
Free Software Foundation, either version 3 of the License, or any later version. The IFDM Suite is distributed in
the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. You should have received a
copy of the GNU General Public License along with the IFDM Suite. If not, see <http://www.gnu.org/licenses/>.
*/
angular.module('unionvmsWeb').controller('MapconfigurationmodalCtrl', function ($scope, $timeout, locale, reportConfigs, $modalInstance, SpatialConfig, reportService, spatialRestService, spatialConfigAlertService, $anchorScroll, $location, spatialConfigRestService, loadingStatus, displayComponents, PreferencesService) {
	$scope.settingsLevel = 'report';
	$scope.alert = spatialConfigAlertService;
	$scope.alert.hasAlert = false;
	$scope.alert.hasError = false;
	$scope.alert.hasSuccess = false;
	$scope.alert.hasWarning = false;
	$scope.components = displayComponents;
	$scope.prefService = PreferencesService;
	var userConfig;
	
	$modalInstance.opened.then(function(){
	    loadingStatus.isLoading('LiveviewMap', false);
	});
	
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
        $scope.initialConfig = undefined;
    };
    
    $scope.validate = function(){
        if(_.keys($scope.mapConfigurationForm.$error).length > 0 || angular.isDefined($scope.configModel.mapSettings.displayProjectionId) && !angular.isDefined($scope.configModel.mapSettings.coordinatesFormat)){
            $location.hash('mapConfigurationModal');
            $anchorScroll();
            $location.hash('');
            $anchorScroll();
            $scope.alert.hasAlert = true;
            $scope.alert.hasError = true;
            $scope.alert.alertMessage = locale.getString('spatial.invalid_data_saving');
            $scope.alert.hideAlert();
            $scope.submitedWithErrors = true;
            return false;
        } else {
            return true;
        }
    };

    $scope.save = function () {
        if ($scope.validate()){
            $modalInstance.close($scope.exportMapConfiguration());
            $scope.initialConfig = undefined;
        }
    };
    
    $scope.apply = function(){
        if ($scope.validate()){
            var rep = $scope.exportMapConfiguration();
            $modalInstance.close(rep);
            $scope.initialConfig = undefined;
        }
    };

    $scope.exportMapConfiguration = function () {
    	var exported = {};
    	exported = $scope.configModel.forReportConfig($scope.mapConfigurationForm,userConfig);
    	exported.mapSettings.spatialConnectId = $scope.initialConfig.spatialConnectId;
        return exported;
    };
    
    var mergePreferences = function(){
    	if(!angular.isDefined($scope.initialConfig) || _.isEmpty($scope.initialConfig)){
			$scope.configModel = new SpatialConfig();
    		angular.copy(userConfig, $scope.configModel);
    	}
    	if(!angular.isDefined($scope.initialConfig) || !angular.isDefined($scope.initialConfig.stylesSettings) || _.isEmpty($scope.initialConfig.stylesSettings)){
    		$scope.configModel.stylesSettings = {};
    		angular.copy(userConfig.stylesSettings, $scope.configModel.stylesSettings);
    	}else{
    		if(!angular.isDefined($scope.initialConfig.stylesSettings.positions) || _.isEmpty($scope.initialConfig.stylesSettings.positions) || !angular.isDefined($scope.initialConfig.stylesSettings.positions.attribute)){
    			$scope.configModel.stylesSettings.positions = {};
        		angular.copy(userConfig.stylesSettings.positions, $scope.configModel.stylesSettings.positions);
    		}
    		if(!angular.isDefined($scope.initialConfig.stylesSettings.segments) || _.isEmpty($scope.initialConfig.stylesSettings.segments) || !angular.isDefined($scope.initialConfig.stylesSettings.segments.attribute)){
    			$scope.configModel.stylesSettings.segments = {};
        		angular.copy(userConfig.stylesSettings.segments, $scope.configModel.stylesSettings.segments);
    		}
    		if(!angular.isDefined($scope.initialConfig.stylesSettings.alarms) || _.isEmpty($scope.initialConfig.stylesSettings.alarms)){
    			$scope.configModel.stylesSettings.alarms = {};
        		angular.copy(userConfig.stylesSettings.alarms, $scope.configModel.stylesSettings.alarms);
    		}
    	}
    	
    	if(!angular.isDefined($scope.initialConfig) || !angular.isDefined($scope.initialConfig.layerSettings) || _.isEmpty($scope.initialConfig.layerSettings) || ((!angular.isDefined($scope.initialConfig.layerSettings.portLayers) || _.isEmpty($scope.initialConfig.layerSettings.portLayers)) &&
    			(!angular.isDefined($scope.initialConfig.layerSettings.areaLayers) || _.isEmpty($scope.initialConfig.layerSettings.areaLayers)) &&
    			(!angular.isDefined($scope.initialConfig.layerSettings.baseLayers) || _.isEmpty($scope.initialConfig.layerSettings.baseLayers)) &&
    			(!angular.isDefined($scope.initialConfig.layerSettings.additionalLayers) || _.isEmpty($scope.initialConfig.layerSettings.additionalLayers)))){
    		$scope.configModel.layerSettings = {};
    		angular.copy(userConfig.layerSettings, $scope.configModel.layerSettings);
    	}
    	if(!angular.isDefined($scope.initialConfig) || !angular.isDefined($scope.initialConfig.mapProjectionId) && 
    			!angular.isDefined($scope.initialConfig.displayProjectionId) && !angular.isDefined($scope.initialConfig.coordinatesFormat) && 
    			!angular.isDefined($scope.initialConfig.scaleBarUnits)){
    		$scope.configModel.mapSettings = {};
    		angular.copy(userConfig.mapSettings, $scope.configModel.mapSettings);
    	}
    	if(!angular.isDefined($scope.initialConfig) || !angular.isDefined($scope.initialConfig.visibilitySettings) || _.isEmpty($scope.initialConfig.visibilitySettings)){
    		$scope.configModel.visibilitySettings = {};
    		angular.copy(userConfig.visibilitySettings, $scope.configModel.visibilitySettings);
    	}

		if(!angular.isDefined($scope.initialConfig) || !angular.isDefined($scope.initialConfig.referenceDataSettings) || _.isEmpty($scope.initialConfig.referenceDataSettings)){
    		$scope.configModel.referenceDataSettings = {};
    		angular.copy(userConfig.referenceDataSettings, $scope.configModel.referenceDataSettings);
    	}
    };
    
    var getConfigsSuccess = function(response){
	    var srcConfigObj = response;
	    var model = new SpatialConfig();
        userConfig = model.forUserPrefFromJson(response);
		if(response.merge){
        	mergePreferences();
		}
        loadingStatus.isLoading('Preferences',false);
	};
	
	var getConfigsFailure = function(error){
	    $anchorScroll();
	    $scope.alert.hasAlert = true;
	    $scope.alert.hasError = true;
	    $scope.alert.alertMessage = locale.getString('spatial.user_preferences_error_getting_configs');
	    $scope.alert.hideAlert();
	    loadingStatus.isLoading('Preferences',false);
	};
	
	$scope.sortArray = function(data){
        var temp = _.clone(data);
        temp.sort();
        
        return temp;
    };
    
    var init = function(){
    	loadingStatus.isLoading('Preferences',true, 0);
    	$scope.configModel = new SpatialConfig();
    	$scope.initialConfig = reportConfigs.mapConfiguration || {};
        if(!angular.equals({}, reportConfigs.mapConfiguration)){
        	$scope.configModel = $scope.configModel.forReportConfigFromJson(reportConfigs.mapConfiguration);
        }

    	if(angular.isDefined($scope.initialConfig) && angular.isDefined($scope.initialConfig.stylesSettings) && angular.isDefined($scope.initialConfig.layerSettings) &&
    		angular.isDefined($scope.initialConfig.visibilitySettings) && angular.isDefined($scope.initialConfig.referenceDataSettings) && angular.isDefined($scope.initialConfig.spatialConnectId) &&
    		angular.isDefined($scope.initialConfig.mapProjectionId) && angular.isDefined($scope.initialConfig.displayProjectionId) &&
    		angular.isDefined($scope.initialConfig.coordinatesFormat) && angular.isDefined($scope.initialConfig.scaleBarUnits)){
			spatialConfigRestService.getUserConfigs().then(getConfigsSuccess, getConfigsFailure);
    	}else{
			spatialConfigRestService.getUserConfigs(undefined,undefined,undefined,undefined,true).then(getConfigsSuccess, getConfigsFailure);
		}
    };
    
    init();
});

