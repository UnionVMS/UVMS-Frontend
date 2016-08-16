/**
 * @memberof unionvmsWeb
 * @ngdoc service
 * @name PreferencesService
 * @param loadingStatus {service} loading status service
 * @param spatialConfigRestService {service} Spatial REST API service
 * @param spatialConfigAlertService {service} Spatial REST API service
 * @param $anchorScroll {service} angular anchorScroll service
 * @param locale {service} angular locale service
 * @param $location {service} angular location service
 * @param SpatialConfig {service} Spatial Config service
 * @attr {Object} stylesErrors - A property object where are registered all the form errors from styles settings
 * @description
 *  Service to manage the Preferences(Admin,User and report levels)
 */
angular.module('unionvmsWeb').factory('PreferencesService',function(loadingStatus,spatialConfigRestService, spatialConfigAlertService, $anchorScroll, locale, $location, SpatialConfig) {

	/**
     * Reset success callback - reset settings of a specific type
     * 
     * @memberof PreferencesService
     * @private
     * @param {Object} response
     */
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
        loadingStatus.isLoading('Preferences',false);
    };

	/**
     * Reset failure callback - display error message
     * 
     * @memberof PreferencesService
     * @private
     * @param {Object} error
     */
	var resetFailure = function(error){
		var settingsType = error.settingsType;
	    $anchorScroll();
        spatialConfigAlertService.hasAlert = true;
        spatialConfigAlertService.hasError = true;
        spatialConfigAlertService.alertMessage = locale.getString('spatial.user_preferences_reset_' + settingsType.toLowerCase() + '_settings_failure');
        spatialConfigAlertService.hideAlert();
        loadingStatus.isLoading('Preferences',false);
	};

	/**
     * Get config success callback - get and load spatial config settings
     * 
     * @memberof PreferencesService
     * @private
     * @param {Object} response
     */
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
		
		if (angular.isDefined(response.callback)){
		    response.callback();
		}
        configModel[settingsType + 'Settings'].reseted = true;
        loadingStatus.isLoading('Preferences',false);
	};

	/**
     * Get config failure callback - display error message
     * 
     * @memberof PreferencesService
     * @private
     * @param {Object} error
     */
	var getConfigsFailure = function(error){
		var settingsType = error.settingsType;
	    $anchorScroll();
	    spatialConfigAlertService.hasAlert = true;
        spatialConfigAlertService.hasError = true;
        spatialConfigAlertService.alertMessage = locale.getString('spatial.user_preferences_reset_' + settingsType.toLowerCase() + '_settings_failure');
        spatialConfigAlertService.hideAlert();
	    loadingStatus.isLoading('Preferences',false);
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

		/**
		 * Reset preferences of a specific type
		 * 
		 * @memberof PreferencesService
		 * @public
		 * @param {String} settingsType
		 * @param {Object} form
		 * @param {Object} configModel
		 * @param {Object} configCopy
		 * @param {String} settingsLevel
		 * @param {Function} callback
		 */
		reset : function(settingsType,form,configModel,configCopy,settingsLevel,callback){
			loadingStatus.isLoading('Preferences',true, 1);
			var item = {};
			item[settingsType + 'Settings'] = {};
			
			if(settingsLevel === 'user'){
				spatialConfigRestService.resetSettings(item,settingsType,configModel,configCopy,form).then(resetSuccess, resetFailure);
			}else if(settingsLevel === 'report'){
				spatialConfigRestService.getUserConfigs(settingsType,configModel,form,true,undefined,callback).then(getConfigsSuccess, getConfigsFailure);
			}
		},

		/**
		 * Clear errors in styles settings form from a specified level(Admin,User,Report)
		 * 
		 * @memberof PreferencesService
		 * @public
		 * @param {String} settingsLevel
		 */
		clearStylesErrors : function(settingsLevel){
			this.stylesErrors[settingsLevel] = {
				positions: {},
				segments: {}
			};
		}
	};


	return PreferencesService;
});