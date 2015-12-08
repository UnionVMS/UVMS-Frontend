describe('globalSettingsService', function() {

	beforeEach(module('unionvmsWeb'));

	beforeEach(module(function($provide) {
		$provide.value({'$resource': function(url) {
			if (url === "/config/rest/globals") {
				return mockGlobalSettingsResource;
			}
			else if (url === "/config/rest/settings/:id") {
				return mockSingleSettingResource;
			}
		}});
	}));

	it('should set a single property value and reload settings', inject(function(globalSettingsService) {
		set(globalSettingsService, "myProperty", "myValue", false);
		expect(globalSettingsService.getSettings()["myProperty"]).toEqual({
			key: "myProperty",
			value: "myValue"
		});

		expect(globalSettingsService.get("myProperty", false)).toBe("myValue");
	}));

	it('should set a single array property value and reload settings', inject(function(globalSettingsService) {
		set(globalSettingsService, "myProperty", ["v1", "v2", "v3"], true);
		expect(globalSettingsService.getSettings()["myProperty"]).toEqual({
			key: "myProperty",
			value: "v1,v2,v3"
		});

		expect(globalSettingsService.get("myProperty", true)).toEqual(["v1", "v2", "v3"]);
	}));

	it('should get initial settings', inject(function(globalSettingsService) {
		var settings = globalSettingsService.getSettings();
		expect(Object.keys(settings).length).toBe(2);
		expect(settings["setting1"]).toEqual({
			key: "setting1",
			value: "value1"
		});
		expect(settings["setting2"]).toEqual({
			key: "setting2",
			value: "value2"
		});
	}));

	it('should update existing setting', inject(function(globalSettingsService) {
		spyOn(mockSingleSettingResource, 'put');
		globalSettingsService.set("setting1", "value1-updated");
		var settings = globalSettingsService.getSettings();
		expect(settings["setting1"]).toEqual({
			key: "setting1",
			value:  "value1-updated"
		});
	}));

	var set = function(globalSettingsService, key, value, isArray) {
		var expected = {
			setting: {
				module: "",
				description: key,
				global: true,
				value: isArray ? value.join() : value,
				key: key
			},
			moduleName: ""
		};

		spyOn(mockSingleSettingResource, 'save').andCallFake(function(data, callback, error) {
			callback({
				code: '200'
			});
		});

		spyOn(mockGlobalSettingsResource, 'get').andCallFake(function(callback) {
			callback({
                code: '200',
				data: [{
					key: key,
					value: isArray ? value.join() : value
				}]
			});
		});

		globalSettingsService.set(key, value, isArray);
		expect(mockSingleSettingResource.save).toHaveBeenCalledWith(expected, jasmine.any(Function), jasmine.any(Function));
		expect(mockGlobalSettingsResource.get).toHaveBeenCalled();
	};

	var getInitialSettings = function() {
		return [{
			key: "setting1",
			value: "value1"
		}, {
			key: "setting2",
			value: "value2"
		}];
	};

	var mockSingleSettingResource = {
		save: function(data, callback) {
			callback({code: '200', data: {}});
		},
		put: function(params, data, callback) {
			callback({code: '200'});
		}
	};

	var mockGlobalSettingsResource = {
		get: function(callback) {
			callback({
				code: '200',
				data: getInitialSettings()
			});
		}
	};

});