describe('dataNotAvailable', function() {

	beforeEach(module('unionvmsWeb'));

	it('should ...', inject(function($filter) {

        var filter = $filter('dataNotAvailable');

		expect(filter('input')).toEqual('output');

	}));

});