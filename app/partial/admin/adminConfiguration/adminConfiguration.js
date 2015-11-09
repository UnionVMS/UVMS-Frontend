angular.module('unionvmsWeb').controller('AuditconfigurationCtrl',function($scope, $stateParams, $resource){
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

			$scope.tabs = ["systemMonitor", "globalSettings"].concat(modules);
		});
	};

	$scope.configurationPageUrl = function() {
		if ($scope.activeTab === "systemMonitor") {
			return "partial/admin/adminConfiguration/configurationModule/systemMonitor.html";
		}
		else if ($scope.activeTab === "globalSettings") {
			return "partial/admin/adminConfiguration/configurationGeneral/configurationGeneral.html";
		}
		else {
			return "partial/admin/adminConfiguration/configurationModule/configurationModule.html";
		}
	};

	$scope.updateSetting = function(setting) {
		SingleSetting.update({ id: setting.id }, setting);
		setting.editing = false;
	};

	$scope.setTab = function(tab) {
		$scope.activeTab = tab;
	};

	init();

}).filter('replace', function () {
    return function (value) {
        return (!value) ? '' : value.replace(/\./g, "_");
    };
});