describe('transponderName', function() {

	beforeEach(module('unionvmsWeb'));

	it('should return correct name for INMARSAT-C', inject(function($filter, locale) {
        spyOn(locale, "getString").andReturn("Inmarsat-C");
        var filter = $filter('transponderName');

		expect(filter('INMARSAT_C')).toEqual('Inmarsat-C');

	}));

    it('should return unformated name for all values not defined', inject(function($filter, locale) {
        spyOn(locale, "getString").andReturn("'%%KEY_NOT_FOUND%%'");

        var filter = $filter('transponderName');

        expect(filter('TEST')).toEqual('TEST');

    }));

});