describe('removeUnderscore', function() {

	beforeEach(module('unionvmsWeb'));

	it('should replace underscore with an space', inject(function($filter) {

        var filter = $filter('removeUnderscore');
		expect(filter('Happy_Angular')).toEqual('Happy Angular');

	}));

});