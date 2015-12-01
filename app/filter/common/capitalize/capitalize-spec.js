describe('capitalize', function() {
	beforeEach(module('unionvmsWeb'));

	it('should should always capitalize the first letter', inject(function($filter) {
        var filter = $filter('capitalize');

        expect(filter("angularJs FTW")).toBe('Angularjs ftw');

	}));

});