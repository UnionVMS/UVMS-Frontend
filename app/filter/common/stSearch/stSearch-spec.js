describe('stSearch', function() {

	beforeEach(module('unionvmsWeb'));

	it('should ...', inject(function($filter) {

        var filter = $filter('stSearch');

		expect(filter('input')).toEqual('output');

	}));

});