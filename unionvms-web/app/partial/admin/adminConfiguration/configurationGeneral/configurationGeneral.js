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
angular.module('unionvmsWeb').controller('ConfigurationgeneralCtrl',function($scope, $resource, $state, $timeout, locale, alertService, globalSettingsService, languageNames, $log, longPolling){

	$scope.settings = {};

    var init = function(){
        $scope.settings = globalSettingsService.getSettings();
        $scope.speedUnit = globalSettingsService.getSpeedUnit();
        $scope.selectedLanguages = globalSettingsService.getAvailableLanguages();
		$scope.longPollingEnabled = (globalSettingsService.get("longPollingEnabled") === 'true');
    };

    //Options
	$scope.coordinateFormats = [
		"degreesMinutesSeconds",
		"decimalDegrees"
	];

	$scope.dateFormats = [
		"YYYY-MM-DD HH:mm:ss",
		"YY/MM/DD HH:mm:ss"
	];

	$scope.measurementSystems = [
		"metric",
		"imperial"
	];

    //Get languages from constant languageNames, defined in app.js
    $scope.languages = Object.keys(languageNames).map(function(key) {
        return {text: languageNames[key], code: key};
    });

	$scope.homePages = [
		"positions",
		"exchange",
		"polling",
		"mobileTerminals",
		"assets",
		"alarms",
		"admin",
		"reporting",
		"today",
		"areaManagement",
		"subscription",
        "activity"
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
		};
	});

	$scope.speedUnits = [
		"kts",
		"kph",
		"mph"
	].map(function(unit) {
		return {
			text: locale.getString("config.speed_unit_" + unit),
			code: unit
		};
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

    //Reload the current state
    var reloadTimeout;
    var saveSettingSuccessWithPageReload = function(){
        saveSettingSuccess();
        //Reload page after 2 seconds
        $timeout.cancel(reloadTimeout);
        reloadTimeout = $timeout(function(){
            $state.go($state.$current, null, {reload: true});
        }, 2000);
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

    //Callback from the dropdown
    $scope.setDefaultHomePage = function(selection){
        globalSettingsService.set("defaultHomePage", selection.code).then(saveSettingSuccess, saveSettingError);
    };

	$scope.addLanguage = function() {
		$scope.selectedLanguages.push(undefined);
	};

	$scope.removeLanguage = function(index) {
		$scope.selectedLanguages.splice(index, 1);
		globalSettingsService.set("availableLanguages", $scope.selectedLanguages, true).then(saveSettingSuccessWithPageReload, saveSettingError);		
	};

	$scope.selectLanguage = function(language, index) {
		$scope.selectedLanguages[index] = language.code;
		globalSettingsService.set("availableLanguages", $scope.selectedLanguages, true).then(saveSettingSuccessWithPageReload, saveSettingError);
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

	$scope.toggleLongPollingEnabled = function() {
		$log.info($scope.longPollingEnabled ? 'Toggled long-polling on' : 'Toggled long-polling off');
		globalSettingsService.set("longPollingEnabled", $scope.longPollingEnabled);
		if ($scope.longPollingEnabled) {
			$scope.reloadLongPolling = true;
		}
		else {
			longPolling.cancelAll();
		}
	};

    init();

});