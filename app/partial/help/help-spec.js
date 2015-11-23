ddescribe('help.controller', function() {

	beforeEach(module('unionvmsWeb'));



	it('should', inject(['help.toc', function(toc) {
		toc.add("myTest", "Test title no 1");
		expect(toc.sections).toEqual(["myTest"]);
		expect(toc.titles["myTest"]).toBe("Test title no 1");

		toc.add("myTest2", "Test title no 2");
		expect(toc.sections).toEqual(["myTest", "myTest2"]);
		expect(toc.titles["myTest2"]).toBe("Test title no 2");

		toc.reset();
		expect(toc.sections).toEqual([]);
		expect(toc.titles).toEqual({});

		toc.add("myTest", "Test title no 1");
		expect(toc.sections).toEqual(["myTest"]);
		expect(toc.titles["myTest"]).toBe("Test title no 1");
	}]));

	it('', inject(function($injector) {

		$provide('locale', {
			getLocale: function() {
				return "en-us";
			}
		});
		$provide('help.langReplacements', {
			"sv": "en"
		});

		var lang = $injector.get('help.lang');
		expect(lang).toBe("en");
	}));

});