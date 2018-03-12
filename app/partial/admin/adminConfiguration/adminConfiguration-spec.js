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
describe('AuditconfigurationCtrl', function() {

	var scope, createController, createSetting;

	beforeEach(module('unionvmsWeb'));

	beforeEach(inject(function($rootScope, $controller) {
		scope = $rootScope.$new();

		createController = function() {
			return $controller('AuditconfigurationCtrl', {
				'$scope': scope,
				'$resource': function(url) {
					if (url === "config/rest/settings/:id") {
						return singleSettingResource;
					}
					else if (url === "config/rest/catalog") {
						return settingCatalogResource;
					}
				}
			});
		};

		createSetting = function() {
			return {
				id: 123,
				key: "test.key",
				value: "some_value",
				global: false,
				description: "A setting for testing.",
				module: "movement",
				lastModified: 0
			};
		};
	}));

	it('should only show tabs with at least one non-global setting', function() {
		var controller = createController();
		expect(scope.tabs).toEqual(["systemMonitor", "globalSettings", "reporting","activity", "mobileTerminal"]);
	});

	it('should provide the right partial URLs', function() {
		var controller = createController();

		scope.activeTab = "systemMonitor";
		expect(scope.configurationPageUrl()).toBe("partial/admin/adminConfiguration/configurationModule/systemMonitor.html");

		scope.activeTab = "globalSettings";
		expect(scope.configurationPageUrl()).toBe("partial/admin/adminConfiguration/configurationGeneral/configurationGeneral.html");
		
		scope.activeTab = "reporting";
        expect(scope.configurationPageUrl()).toBe("partial/admin/adminConfiguration/configurationReporting/configurationReporting.html");
		
		scope.activeTab = "activity";
		expect(scope.configurationPageUrl()).toBe("partial/admin/adminConfiguration/configurationActivity/configurationActivity.html");
		
		scope.activeTab = "any other value";
		expect(scope.configurationPageUrl()).toBe("partial/admin/adminConfiguration/configurationModule/configurationModule.html");
	});

	it('should begin editing a setting by backing up setting value and description', function() {
		var controller = createController();
		var setting = createSetting();

		scope.setEditing(setting, true);

		expect(setting.previousValue).toBe("some_value");
		expect(setting.previousDescription).toBe("A setting for testing.");
		expect(setting.editing).toBe(true);
	});

	it('should stop editing by deleting setting value and description backups', function() {
		var controller = createController();

		var setting = createSetting();
		setting.previousValue = "previousValue";
		setting.previousDescription = "previousDescription";

		scope.setEditing(setting, false);

		expect(setting.previousValue).not.toBeDefined();
		expect(setting.previousDescription).not.toBeDefined();
		expect(setting.editing).toBe(false);
	});

	it('should cancel editing by restoring setting value and description from backup', function() {
		var setting = createSetting();
		setting.previousValue = "previousValue";
		setting.previousDescription = "previousDescription";

		var controller = createController();
		spyOn(scope, "setEditing");

		scope.cancelEditing(setting);

		expect(setting.value).toBe("previousValue");
		expect(setting.description).toBe("previousDescription");
		expect(scope.setEditing).toHaveBeenCalledWith(jasmine.any(Object), false);
	});

	it('should set lastModified when updating a setting, and set editing to false', function() {
		var controller = createController();
		var setting = createSetting();
		spyOn(scope, "setEditing");

		scope.updateSetting(setting);

		expect(setting.lastModified).toBe(123);
		expect(scope.setEditing).toHaveBeenCalledWith(jasmine.any(Object), false);
	});

	it('should filter by replacing periods with underscores', inject(function($filter) {
		expect($filter('replace')('apa.bepa.cepa')).toBe('apa_bepa_cepa');
		expect($filter('replace')('')).toBe('');
	}));

	var catalog = {
		data: {
			"vessel": [
				{
					key: "key.1",
					value: "value.1",
					description: "A global vessel setting",
					global: true
				}
			],
			"mobileTerminal": [
				{
					key: "key.2",
					value: "value.2",
					description: "A module-specific setting for mobile terminals",
					global: false
				},
				{
					key: "key.3",
					value: "value.3",
					description: "A global mobile terminal setting",
					global: true
				}
			]
		}
	};

	var response = {
		data: {
			id: 123,
			key: "test.key",
			value: "some_value",
			global: false,
			description: "A setting for testing.",
			module: "movement",
			lastModified: 123
		}
	};

	var singleSettingResource = {
		update: function(params, data, callback) {
			callback(response);
		}
	};

	var settingCatalogResource = {
		get: function(callback) {
			callback(catalog);
		}
	};

});