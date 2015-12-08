angular.module('unionvmsWeb').controller('ConfigurationgeneralCtrl',function($scope, $resource, locale, alertService, globalSettingsService){

	$scope.settings = {};

    var init = function(){
        $scope.settings = globalSettingsService.getSettings();
        $scope.speedUnit = globalSettingsService.getSpeedUnit();
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

	$scope.distanceUnits = [
		"km",
		"nm",
		"mi"
	].map(function(unit) {
		return {
			text: locale.getString("config.distance_unit_" + unit),
			code: unit
		}
	});

	$scope.speedUnits = [
		"kts",
		"kph",
		"mph"
	].map(function(unit) {
		return {
			text: locale.getString("config.speed_unit_" + unit),
			code: unit
		}
	});

	$scope.timezones = (function() {
		var minZone = -12;
		var maxZone = 12;
		var zones = [];

		function toTimezone(offset) {
			var hours = Math.abs(offset / 60);
			var mins = offset % 60;

			if (hours < 10) {
				hours = '0' + hours;
			}

			if (mins < 10) {
				mins = '0' + mins;
			}

			return (offset < 0 ? '-' : '+') + hours + ':' + mins;
		}

		for (var i = minZone; i <= maxZone; i++) {
			var utcOffset = 60 * i;
			zones.push({
				text: toTimezone(utcOffset),
				code: String(utcOffset)
			});
		}

		return zones;
	})();

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

	$scope.maxSpeed = function(value) {
		if (value !== undefined) {
			globalSettingsService.set("maxSpeed", value).then(saveSettingSuccess, saveSettingError);
		}
		else {
			return globalSettingsService.get("maxSpeed");
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

	$scope.setDistanceUnit = function(selection) {
		globalSettingsService.set("distanceUnit", selection.code).then(saveSettingSuccess, saveSettingError);

	};

	$scope.setSpeedUnit = function(selection) {
		globalSettingsService.set("speedUnit", selection.code).then(saveSettingSuccess, saveSettingError);

	};

	$scope.setTimezone = function(selection) {
		globalSettingsService.set("timezone", selection.code).then(saveSettingSuccess, saveSettingError);

	};

    init();

});