angular.module('unionvmsWeb').controller('ConfigurationgeneralCtrl',function($scope, $resource, locale){

	var GlobalSettings = $resource("/config/rest/globals");

	var GlobalSetting = $resource("/config/rest/settings/:id", {}, {
		'put' : {
			method: 'PUT'
		}
	});

	$scope.langs = [];
	$scope.settings = {};

	var init = function() {
		GlobalSettings.get(function(response) {
			$scope.settings = {};

			$.each(response.data, function(index, setting) {
				$scope.settings[setting.key] = setting;
				if (setting.key === "defaultHomePage") {
					$scope.defaultHomePage = setting.value;
				}
			});
		});

		$scope.$watch('defaultHomePage', function(newValue) {
			set("defaultHomePage", newValue);
		});
	};

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

	var set = function(key, value, isArray) {
		if ($scope.settings[key] === undefined) {
			return;
		}

		var setting = $scope.settings[key];
		setting.value = isArray ? value.join() : value;
		GlobalSetting.put({id: setting.id}, setting);
	};

	var get = function(key, isArray) {
		if ($scope.settings[key] === undefined) {
			return isArray ? [] : undefined;
		}

		var value = $scope.settings[key].value;
		if (isArray) {
			return value.length > 0 ? value.split(",") : [];
		}

		return value;
	};

	$scope.coordinateFormat = function(value) {
		if (value) {
			set("coordinateFormat", value);
		}
		else {
			return get("coordinateFormat");
		}
	};

	$scope.unit = function(value) {
		if (value) {
			set("measurementSystem", value);
		}
		else {
			return get("measurementSystem");
		}
	};

	$scope.dateFormat = function(value) {
		if (value) {
			set("dateTimeFormat", value);
		}
		else {
			return get("dateTimeFormat");
		}
	};

	$scope.getSelectedLanguages = function() {
		return get("availableLanguages", true);
	};

	$scope.setLanguageSelected = function(language, selected) {
		var languages = get("availableLanguages", true);
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

		set("availableLanguages", languages, true);
	};

	init();

});