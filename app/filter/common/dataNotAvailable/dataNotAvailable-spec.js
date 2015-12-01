describe('dataNotAvailable', function() {

	var dataNotAvailable;
	var locale;

	beforeEach(module('unionvmsWeb'));
    beforeEach(function() {
        locale = {
            getString : function(str){
                if(str === 'common.short_not_available'){
                	return 'N/A';
                }
            }
        }
        module(function ($provide) {
          $provide.value('locale', locale);
        });
    });

	it('should return N/A when undefined', inject(function($filter){
		var filter = $filter('dataNotAvailable');
		expect(filter(undefined)).toBe('N/A');
		expect(filter(undefined)).not.toBe('foo');
	}));

	it('should return input as output ', inject(function($filter){
		var filter = $filter('dataNotAvailable');
		expect(filter('DATA')).toBe('DATA');
	}));

});