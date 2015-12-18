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

	it('should add undefined language to end of list', function() {
		createController();
		scope.selectedLanguages = ['sv', 'en_gb'];
		scope.addLanguage();
		expect(scope.selectedLanguages).toEqual(['sv', 'en_gb', undefined]);
	});

	it('should remove a language from the list', function() {
		createController();
		scope.selectedLanguages = ['sv', 'en_gb', 'en_us'];
		scope.removeLanguage(1);
		expect(scope.selectedLanguages).toEqual(['sv', 'en_us']);
	});

	it('set language', function() {
		createController();
	});

	it('should return a date time format', function() {
		var en_gb = {
			code: 'en_gb',
			text: 'English (British)'
		};

		createController();
		scope.selectedLanguages = ['sv', undefined, 'en_us'];
		scope.selectLanguage(en_gb, 1);
		expect(scope.selectedLanguages).toEqual(['sv', 'en_gb', 'en_us']);
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