describe('transponderName', function() {

	beforeEach(module('unionvmsWeb'));

	it('should return correct name for INMARSAT-C', inject(function($filter) {

        var filter = $filter('transponderName');

		expect(filter('INMARSAT_C')).toEqual('Inmarsat-C');

	}));

    it('should return unformated name for all values not defined', inject(function($filter) {

        var filter = $filter('transponderName');

        expect(filter('TEST')).toEqual('TEST');

    }));

});