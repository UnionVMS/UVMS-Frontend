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
angular.module('unionvmsWeb').controller('AuditconfigurationCtrl',function($scope, $stateParams, $resource, $filter, alertService, spatialConfigRestService, SpatialConfig, loadingStatus, PreferencesService, userService){
	$scope.isAudit = false;
	$scope.activeTab = $stateParams.module || "systemMonitor";
	$scope.prefService = PreferencesService;

	$scope.tabs = [];
	$scope.setTabs = [];

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

	var Settings = $resource("config/rest/catalog");

	var SingleSetting = $resource("config/rest/settings/:id", {}, {
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
			$scope.tabs = ["systemMonitor", "globalSettings", "reporting", "activity"].concat(modules);

			if(userService.isAllowed("CONFIGURE_MDR_SCHEDULER", "MDR Cache", true)){
				$scope.tabs.push("mdr");
			}
			// Set tab name and title 
			for (var i = 0; i < $scope.tabs.length; i++) {
				$scope.setTabs.push({
					"tab" : $scope.tabs[i],
					"title" : $filter('i18n')('audit.configuration_header_'+$scope.tabs[i])
				});                                  
			}
		});

		loadingStatus.isLoading('Preferences',true,0);
		spatialConfigRestService.getAdminConfigs().then(function(response){
		    var model = new SpatialConfig();
		    $scope.configModel = model.forAdminConfigFromJson(response);
		    $scope.configCopy = {};
	        angular.copy($scope.configModel, $scope.configCopy);
		    loadingStatus.isLoading('Preferences',false);
		});
		spatialConfigRestService.getActivityAdminConfigs().then(function(response){
			$scope.thresholds = response;
		});
	};

	$scope.configurationPageUrl = function() {
		if ($scope.activeTab === "systemMonitor") {
			return "partial/admin/adminConfiguration/configurationModule/systemMonitor.html";
		} else if ($scope.activeTab === "globalSettings") {
			return "partial/admin/adminConfiguration/configurationGeneral/configurationGeneral.html";
		} else if ($scope.activeTab === "reporting") {
			return "partial/admin/adminConfiguration/configurationReporting/configurationReporting.html";
		} else if ($scope.activeTab === "activity") {
		    return "partial/admin/adminConfiguration/configurationActivity/configurationActivity.html";
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

    // Add tabs to directive
    $scope.contentTabsFunctions = {
        setTabs: function() {
            return $scope.setTabs;
        }
    };

	init();

}).filter('replace', function () {
    return function (value) {
        return (!value) ? '' : value.replace(/\./g, "_");
    };
});
