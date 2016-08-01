angular.module('unionvmsWeb').controller('AuditconfigurationCtrl',function($scope, $stateParams, $resource, alertService, spatialConfigRestService, SpatialConfig, loadingStatus, PreferencesService){
	$scope.isAudit = false;
	$scope.activeTab = $stateParams.module || "systemMonitor";
	$scope.prefService = PreferencesService;

	$scope.tabs = [];

	var uvmsModules = [
		"asset",
		"mobileTerminal",
		"reporting",
		"positions",
		"movement",
		"exchange",
		"rules",
		"audit"
	];

	var Settings = $resource("/config/rest/catalog");

	var SingleSetting = $resource("/config/rest/settings/:id", {}, {
		"update": {
			method: "PUT"
		}
	});

	var getNonGlobalSettings = function(settings) {
		return settings.filter(function(setting) {
			return !setting.global;
		});
	};

	var init = function() {
		Settings.get(function(response) {
			$scope.settings = response.data;
			var modules = uvmsModules.filter(function(module) {
				return $scope.settings[module] !== undefined && getNonGlobalSettings($scope.settings[module]).length > 0;
			});

			$scope.tabs = ["systemMonitor", "globalSettings", "reporting", "mdr"].concat(modules);
		});

		loadingStatus.isLoading('Preferences',true);
		spatialConfigRestService.getAdminConfigs().then(function(response){
		    var model = new SpatialConfig();
		    $scope.configModel = model.forAdminConfigFromJson(response);
		    $scope.configCopy = {};
	        angular.copy($scope.configModel, $scope.configCopy);
		    loadingStatus.isLoading('Preferences',false);
		});
	};

	$scope.configurationPageUrl = function() {
		if ($scope.activeTab === "systemMonitor") {
			return "partial/admin/adminConfiguration/configurationModule/systemMonitor.html";
		} else if ($scope.activeTab === "globalSettings") {
			return "partial/admin/adminConfiguration/configurationGeneral/configurationGeneral.html";
		} else if ($scope.activeTab === "reporting") {
			return "partial/admin/adminConfiguration/configurationReporting/configurationReporting.html";
		} else if ($scope.activeTab === "mdr") {
            return "partial/admin/adminConfiguration/configurationMDR/configurationMDR.html";
        }
		else {
			return "partial/admin/adminConfiguration/configurationModule/configurationModule.html";
		}
	};

	$scope.setEditing = function(setting, editing) {
		if (editing) {
			setting.previousValue = setting.value;
			setting.previousDescription = setting.description;
		}
		else {
			delete setting.previousValue;
			delete setting.previousDescription;
		}

		setting.editing = editing;
	};

	$scope.cancelEditing = function(setting) {
		setting.value = setting.previousValue;
		setting.description = setting.previousDescription;
		$scope.setEditing(setting, false);
	};

	/* Gets setting by module+key from catalog. */
	function getSetting(module, key) {
		if ($scope.settings !== undefined) {
			var settings = $scope.settings[module];
			if (settings !== undefined) {
				for (var i = 0; i < settings.length; i++) {
					var setting = settings[i];
					if (setting.module === module && setting.key === key) {
						return setting;
					}
				}
			}
		}
	}

	/* Creates an object for backend. */
	function getSettingTO(sett) {
		return {
			value: sett.value,
			global: sett.global,
			description: sett.description,
			key: sett.key,
			module: sett.module,
			id: sett.id
		};
	}

	/* True or false if value can be parsed, otherwise undefined. */
	function parseBoolean(value) {
		if (typeof value === 'string') {
			value = value.trim().toUpperCase();
		}

		if (value === 'TRUE') {
			return true;
		}
		else if (value === 'FALSE') {
			return false;
		}
	}

	/* Formats truthy values as TRUE, otherwise FALSE. */
	function formatBoolean(value) {
		return value ? 'TRUE' : 'FALSE';
	}

	/* True iff value can be parsed as true. */
	$scope.isTrue = isTrue;
	function isTrue(value) {
		return parseBoolean(value) === true;
	}

	/* True iff setting value can be parsed as either true or false. */
	$scope.isLikelyBoolean = function(setting) {
		return parseBoolean(setting.value) !== undefined;
	};

	/* Sends an update request to backend. */
	function updateSetting(setting) {
		SingleSetting.update({ id: setting.id }, getSettingTO(setting), function(response) {
			setting.lastModified = response.data.lastModified;
		}, function(error) {
			alertService.showErrorMessage(error);
		});
	}

	/* If setting value can be parsed as true or false, inverts value and sends update to backend. */
	$scope.toggleSetting = function(setting) {
		 var value = parseBoolean(setting.value);
		 if (value !== undefined) {
		 	setting.value = formatBoolean(!value);
		 	$scope.updateSetting(setting);
		 }
	};

	/* Sends setting update to backend. */
	$scope.updateSetting = function(setting) {
		$scope.setEditing(setting, false);
		updateSetting(setting);

		var setting2 = getMutuallyConstrainedSetting(setting);
		if (setting2 !== undefined && isTrue(setting.value) && isTrue(setting2.value)) {
			// Also update this other setting, cannot both be true.
			setting2.value = formatBoolean(false);
			updateSetting(setting2);
		}
	};

	/* Returns a setting that relates to the original setting, or undefined if none exists. */
	function getMutuallyConstrainedSetting(setting) {
		if (setting.module === 'asset' && setting.key === 'asset.eu.use') {
			return getSetting('asset', 'asset.national.use');
		}
		else if (setting.module === 'asset' && setting.key === 'asset.national.use') {
			return getSetting('asset', 'asset.eu.use');
		}
	}

	$scope.setTab = function(tab) {
		$scope.activeTab = tab;
	};

    $scope.$on("$destroy", function() {
        alertService.hideMessage();
    });

	init();

}).filter('replace', function () {
    return function (value) {
        return (!value) ? '' : value.replace(/\./g, "_");
    };
});
