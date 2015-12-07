angular.module('unionvmsWeb').controller('AuditconfigurationCtrl',function($scope, $stateParams, $resource, alertService, spatialConfigRestService, SpatialConfig){
	$scope.isAudit = false;
	$scope.activeTab = $stateParams.module || "systemMonitor";

	$scope.tabs = [];

	var uvmsModules = [
		"vessel",
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

			$scope.tabs = ["systemMonitor", "globalSettings", "reporting"].concat(modules);
		});
		
		spatialConfigRestService.getAdminConfigs().then(function(response){
		    var model = new SpatialConfig();
		    $scope.configModel = model.forAdminConfigFromJson(response);
		});
	};

	$scope.configurationPageUrl = function() {
		if ($scope.activeTab === "systemMonitor") {
			return "partial/admin/adminConfiguration/configurationModule/systemMonitor.html";
		} else if ($scope.activeTab === "globalSettings") {
			return "partial/admin/adminConfiguration/configurationGeneral/configurationGeneral.html";
		} else if ($scope.activeTab === "reporting") {
			return "partial/admin/adminConfiguration/configurationReporting/configurationReporting.html";
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

	$scope.updateSetting = function(setting) {
		var s = {
			value: setting.value,
			global: setting.global,
			description: setting.description,
			key: setting.key,
			module: setting.module,
			id: setting.id
		};

		SingleSetting.update({ id: setting.id }, s, function(response) {
			$scope.setEditing(setting, false);
			setting.lastModified = response.data.lastModified;
		}, function(error) {
			alertService.showErrorMessage(error);
		});
	};

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