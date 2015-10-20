describe('pollTypeName', function() {

    beforeEach(module('unionvmsWeb'));

    it('should return correct name for MANUAL_POLL', inject(function($filter, locale) {
        spyOn(locale, "getString").andReturn("Manual");
        var filter = $filter('pollTypeName');

        expect(filter('MANUAL_POLL')).toEqual('Manual');

    }));

    it('should return unformated name for all values not defined', inject(function($filter, locale) {
        spyOn(locale, "getString").andReturn("'%%KEY_NOT_FOUND%%'");

        var filter = $filter('pollTypeName');

        expect(filter('TEST')).toEqual('TEST');

    }));

});