angular.module('unionvmsWeb').controller('ConfigurationgeneralCtrl',function($scope, $resource, locale, alertService, globalSettingsService){

	$scope.settings = {};

    var init = function(){
        $scope.settings = globalSettingsService.getSettings();
    };

    //Options
	$scope.coordinateFormats = [
		"degreesMinutesSeconds",
		"decimalDegrees"
	];

	$scope.dateFormats = [
		"YYYY-MM-DD HH:mm",
		"YY/MM/DD HH:mm"
	];

	$scope.measurementSystems = [
		"metric",
		"imperial"
	];

	$scope.languages = [
		"sv_SE",
		"en_UK",
		"ro_RO"
	];

	$scope.homePages = [
		"positions",
		"exchange",
		"polling",
		"mobileTerminals",
		"assets",
		"alarms",
		"admin"
	].map(function(page) {
		return {
			text: locale.getString("config.homePage_" + page),
			code: page
		};
	});
    $scope.homePages = _.sortBy($scope.homePages, function(opt){return opt.text;});

    var saveSettingSuccess = function(){
        alertService.showSuccessMessageWithTimeout(locale.getString('common.global_setting_save_success_message'));
    };

    var saveSettingError = function(){
        alertService.showErrorMessage(locale.getString('common.global_setting_save_error_message'));
    };

	$scope.coordinateFormat = function(value) {
		if (value) {
			globalSettingsService.set("coordinateFormat", value).then(saveSettingSuccess, saveSettingError);
		}
		else {
			return globalSettingsService.get("coordinateFormat");
		}
	};

	$scope.unit = function(value) {
		if (value) {
			globalSettingsService.set("measurementSystem", value).then(saveSettingSuccess, saveSettingError);
		}
		else {
			return globalSettingsService.get("measurementSystem");
		}
	};

	$scope.dateFormat = function(value) {
		if (value) {
			globalSettingsService.set("dateTimeFormat", value).then(saveSettingSuccess, saveSettingError);
		}
		else {
			return globalSettingsService.get("dateTimeFormat");
		}
	};

	$scope.getSelectedLanguages = function() {
		return globalSettingsService.get("availableLanguages", true);
	};

    //Callback from the dropdown
    $scope.setDefaultHomePage = function(selection){
        globalSettingsService.set("defaultHomePage", selection.code).then(saveSettingSuccess, saveSettingError);
    };

	$scope.setLanguageSelected = function(language, selected) {
		var languages = globalSettingsService.get("availableLanguages", true);
		var index = languages.indexOf(language);

		if (selected && index < 0) {
			languages.push(language);
		}
		else if (!selected && index >= 0) {
			languages.splice(index, 1);
		}
		else {
			return;
		}

		globalSettingsService.set("availableLanguages", languages, true).then(saveSettingSuccess, saveSettingError);
	};

    init();

});