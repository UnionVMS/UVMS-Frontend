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
angular.module('unionvmsWeb').factory('PreferencesService',function(loadingStatus,spatialConfigRestService, spatialConfigAlertService, $anchorScroll, locale, $location, SpatialConfig) {

	var resetSuccess = function(response){
		var settingsType = response.settingsType;
		var configModel = response.configModel;
		var configCopy = response.configCopy;
		var form = response.form;
        configModel[settingsType + 'Settings'] = response[settingsType + 'Settings'];
        if (angular.isDefined(configCopy)){
            angular.copy(configModel[settingsType + 'Settings'], configCopy[settingsType + 'Settings']);
        }
        $anchorScroll();
        spatialConfigAlertService.hasAlert = true;
        spatialConfigAlertService.hasSuccess = true;
        spatialConfigAlertService.alertMessage = locale.getString('spatial.user_preferences_reset_' + settingsType.toLowerCase() + '_settings_success');
        spatialConfigAlertService.hideAlert();

		if(angular.isDefined(form)){
        	form.$setPristine();
		}
        configModel[settingsType + 'Settings'].reseted = true;
        loadingStatus.isLoading('ResetPreferences',false);
    };

	var resetFailure = function(error){
		var settingsType = error.settingsType;
	    $anchorScroll();
        spatialConfigAlertService.hasAlert = true;
        spatialConfigAlertService.hasError = true;
        spatialConfigAlertService.alertMessage = locale.getString('spatial.user_preferences_reset_' + settingsType.toLowerCase() + '_settings_failure');
        spatialConfigAlertService.hideAlert();
        loadingStatus.isLoading('ResetPreferences',false);
	};

	var getConfigsSuccess = function(response){
		var settingsType = response.settingsType;
		var configModel = response.configModel;
		var isReportConfig = response.isReportConfig;
		var form = response.form;
	    var model = new SpatialConfig();
        var userConfig = model.forUserPrefFromJson(response);
		
		//MAP
		if(settingsType === 'map'){
			configModel.mapSettings.spatialConnectId = userConfig.mapSettings.spatialConnectId;
			configModel.mapSettings.mapProjectionId = userConfig.mapSettings.mapProjectionId;
			configModel.mapSettings.displayProjectionId = userConfig.mapSettings.displayProjectionId;
			configModel.mapSettings.coordinatesFormat = userConfig.mapSettings.coordinatesFormat;
			configModel.mapSettings.scaleBarUnits = userConfig.mapSettings.scaleBarUnits;
		}else{
			//OTHER SETTINGS
			configModel[settingsType + 'Settings'] = {};
			if(angular.isDefined(userConfig[settingsType + 'Settings'])){
				angular.copy(userConfig[settingsType + 'Settings'], configModel[settingsType + 'Settings']);
			}
		}
	 
	    if(isReportConfig){
		    $location.hash('mapConfigurationModal');
			$anchorScroll();
			$location.hash('');
        }
	    
	    $anchorScroll();
	    spatialConfigAlertService.hasAlert = true;
	    spatialConfigAlertService.hasSuccess = true;
	    spatialConfigAlertService.alertMessage = locale.getString('spatial.user_preferences_reset_'+ settingsType.toLowerCase() + '_settings_success');
        spatialConfigAlertService.hideAlert();
		if(angular.isDefined(form)){
        	form.$setPristine();
		}
        configModel[settingsType + 'Settings'].reseted = true;
        loadingStatus.isLoading('ResetPreferences',false);
	};

	var getConfigsFailure = function(error){
		var settingsType = error.settingsType;
	    $anchorScroll();
	    spatialConfigAlertService.hasAlert = true;
        spatialConfigAlertService.hasError = true;
        spatialConfigAlertService.alertMessage = locale.getString('spatial.user_preferences_reset_' + settingsType.toLowerCase() + '_settings_failure');
        spatialConfigAlertService.hideAlert();
	    loadingStatus.isLoading('ResetPreferences',false);
	};

	var PreferencesService = {
		stylesErrors : {
			admin: {
				positions: {},
				segments: {}
			},
			user: {
				positions: {},
				segments: {}
			},
			report: {
				positions: {},
				segments: {}
			}
		},
		reset : function(settingsType,form,configModel,configCopy,settingsLevel){
			loadingStatus.isLoading('ResetPreferences',true);
			var item = {};
			item[settingsType + 'Settings'] = {};
			
			if(settingsLevel === 'user'){
				spatialConfigRestService.resetSettings(item,settingsType,configModel,configCopy,form).then(resetSuccess, resetFailure);
			}else if(settingsLevel === 'report'){
				spatialConfigRestService.getUserConfigs(settingsType,configModel,form,true).then(getConfigsSuccess, getConfigsFailure);
			}
		},
		clearStylesErrors : function(level){
			this.stylesErrors[level] = {
				positions: {},
				segments: {}
			};
		}
	};


	return PreferencesService;
});