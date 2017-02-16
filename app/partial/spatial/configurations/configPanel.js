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
angular.module('unionvmsWeb').controller('ConfigpanelCtrl',function($scope, $anchorScroll, locale, SpatialConfig, spatialConfigRestService, spatialConfigAlertService, loadingStatus, PreferencesService, mapService){
    $scope.settingsLevel = 'user';
	$scope.alert = spatialConfigAlertService;
	$scope.prefService = PreferencesService;
	
	var loadUserPreferences = function(){
		loadingStatus.isLoading('Preferences',true,0);
		spatialConfigRestService.getUserConfigs().then(getConfigsSuccess, getConfigsFailure);
	};
	
	$scope.save = function(){
		if(_.keys($scope.configPanelForm.$error).length === 0){
			loadingStatus.isLoading('Preferences',true,2);
		    
			if ($scope.configPanelForm.$dirty){
				var newConfig = new SpatialConfig();
				newConfig = $scope.configModel.forUserPrefToServer($scope.configPanelForm);
		    
		        spatialConfigRestService.saveUserConfigs(newConfig).then(saveSuccess, saveFailure);  
		    } else {
		        $anchorScroll();
		        $scope.alert.hasAlert = true;
		        $scope.alert.hasWarning = true;
		        $scope.alert.alertMessage = locale.getString('spatial.user_preferences_warning_saving');
		        $scope.alert.hideAlert();
		        loadingStatus.isLoading('Preferences',false);
		    }
		}else{
		    $anchorScroll();
		    $scope.alert.hasAlert = true;
		    $scope.alert.hasError = true;
		    $scope.alert.alertMessage = locale.getString('spatial.invalid_data_saving');
		    $scope.alert.hideAlert();
		    $scope.submitedWithErrors = true;
		}
	};
	
	$scope.cancel = function(){
	    $scope.repNav.goToPreviousView();
	    mapService.updateMapSize()
	}
	
    //Update config copy after saving new preferences
    $scope.updateConfigCopy = function(src){
        var changes = angular.fromJson(src);
        var keys = _.keys(changes);
        
        for (var i = 0; i < keys.length; i++){
        	if(keys[i] === 'layerSettings'){
        		$scope.configCopy.layerSettings = {};
        		angular.copy($scope.configCopy.layerSettingsToSave,$scope.configCopy.layerSettings);
        		$scope.configCopy.layerSettingsToSave = undefined;
        	}else{
        		$scope.configCopy[keys[i]] = changes[keys[i]];
        	}
        }
    };
    
    $scope.removeHashKeys = function(arr){
    	angular.forEach(arr, function(item) {
    		delete item.$$hashKey;
    	});
    };
    
	var saveSuccess = function(response){
	    $anchorScroll();
	    $scope.alert.hasAlert = true;
	    $scope.alert.hasSuccess = true;
	    $scope.alert.alertMessage = locale.getString('spatial.user_preferences_success_saving');
	    $scope.alert.hideAlert(6000);
	    $scope.updateConfigCopy(response[1]);
		$scope.configPanelForm.$setPristine();
	    loadingStatus.isLoading('Preferences',false);
	};
	
	var saveFailure = function(error){
	    $anchorScroll();
	    $scope.alert.hasAlert = true;
	    $scope.alert.hasError = true;
	    $scope.alert.alertMessage = locale.getString('spatial.user_preferences_error_saving');
	    $scope.alert.hideAlert();
	    loadingStatus.isLoading('Preferences',false);
	};
	
	var getConfigsSuccess = function(response){
	    var srcConfigObj = response;
	    var model = new SpatialConfig();
        $scope.configModel = model.forUserPrefFromJson(response);
        $scope.configCopy = {};
        angular.copy($scope.configModel, $scope.configCopy);
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

	$scope.$watch('repNav.isSectionVisible("userPreferences")', function(newVal,oldVal){
        if(newVal===true){
            loadUserPreferences();
        }
    });
	
});
