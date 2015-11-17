describe('ConfigurationgeneralCtrl', function() {

	var scope, createController, $q, globalSettingsService, settings;

	beforeEach(module('unionvmsWeb'));

	beforeEach(inject(function($rootScope, $controller, _$q_, alertService, locale, _globalSettingsService_) {
		scope = $rootScope.$new();
		$q = _$q_;
		globalSettingsService = _globalSettingsService_;

		spyOn(alertService, 'showErrorMessage');
		spyOn(alertService, 'showSuccessMessageWithTimeout');
		spyOn(locale, 'getString').andReturn("mock string");
		spyOn(globalSettingsService, 'get').andCallFake(mockGetSetting);

		spyOn(globalSettingsService, 'getSettings').andReturn(getSettings());

		createController = function() {
			return $controller('ConfigurationgeneralCtrl', {
				'$scope': scope,
				'globalSettingsService': globalSettingsService,
				'locale': locale,
				'alertService': alertService
			});
		};
	}));

	it('should get global settings from globalSettingsService', function() {
		createController();
		expect(scope.settings).toEqual({
			availableLanguages: ["en_US", "ro_RO"],
			coordinateFormat: "degreesMinutesSeconds",
			dateTimeFormat: "YY/MM/DD",
			measurementSystem: "metric"
		});
	});

	it('should select language', function() {
		createController();
		spyOn(globalSettingsService, 'set').andCallFake(mockReturnPromise);
		scope.setLanguageSelected('sv_SE', true);
		expect(globalSettingsService.set).toHaveBeenCalledWith('availableLanguages', ["en_US", "ro_RO", "sv_SE"], true);
	});

	it('should deselect language', function() {
		createController();
		spyOn(globalSettingsService, 'set').andCallFake(mockReturnPromise);
		scope.setLanguageSelected('ro_RO', false);
		expect(globalSettingsService.set).toHaveBeenCalledWith('availableLanguages', ["en_US"], true);
	});

	it('should not add a language twice', function() {
		createController();
		spyOn(globalSettingsService, 'set').andCallFake(mockReturnPromise);
		scope.setLanguageSelected('en_US', true);
		expect(globalSettingsService.set).not.toHaveBeenCalled();
	});

	it('should return a date time format', function() {
		createController();
		expect(scope.dateFormat()).toBe("YY/MM/DD");
	});

	it('should set date time format', function() {
		createController();
		spyOn(globalSettingsService, 'set').andCallFake(mockReturnPromise);
		scope.dateFormat("MM/DD/YY");
		expect(globalSettingsService.set).toHaveBeenCalledWith("dateTimeFormat", "MM/DD/YY");
	});

	it('should return a measurement system', function() {
		createController();
		expect(scope.unit()).toBe("metric");
	});

	it('should set a measurement system', function() {
		createController();
		spyOn(globalSettingsService, 'set').andCallFake(mockReturnPromise);
		scope.unit("imperial");
		expect(globalSettingsService.set).toHaveBeenCalledWith("measurementSystem", "imperial");
	});

	it('should return a coordinate sysem', function() {
		createController();
		expect(scope.coordinateFormat()).toBe("degreesMinutesSeconds");
	});

	it('should set a measurement system', function() {
		createController();
		spyOn(globalSettingsService, 'set').andCallFake(mockReturnPromise);
		scope.coordinateFormat("decimalDegrees");
		expect(globalSettingsService.set).toHaveBeenCalledWith("coordinateFormat", "decimalDegrees");
	});

	var mockGetSetting = function(setting, isArray) {
		if (setting === "availableLanguages" && isArray) {
			return getSettings()["availableLanguages"];
		}
		else if (setting === "dateTimeFormat") {
			return getSettings()["dateTimeFormat"];
		}
		else if (setting === "measurementSystem") {
			return getSettings()["measurementSystem"];
		}
		else if (setting === "coordinateFormat") {
			return getSettings()["coordinateFormat"];
		}
	};

	var mockReturnPromise = function() {
		var deferred = $q.defer();
		deferred.resolve("hej");
		return deferred.promise;
	};

	var getAvailableLanguages = function() {
		return ["en_US", "ro_RO"];
	};

	var getSettings = function() {
		return {
			availableLanguages: getAvailableLanguages(),
			coordinateFormat: "degreesMinutesSeconds",
			dateTimeFormat: "YY/MM/DD",
			measurementSystem: "metric"
		}
	};

});