describe('stArrayToString', function() {

	beforeEach(module('unionvmsWeb'));
	var filter;
	
	beforeEach(inject(function($filter){
	    filter = $filter('stArrayToString');
	}));

	it('should return an empty string if no data is passed to the filter', inject(function($filter) {
        expect(filter()).toBe('');
        expect(filter([])).toBe('');
	}));
	
	it('should return a string with multiple values separated by a comma', inject(function($filter) {
        expect(filter(['A', 'B', 'C'], ', ')).toBe('A, B, C');
    }));
	
	it('should return a string with multiple values separated by an hiffen', inject(function($filter) {
	    expect(filter(['A', 'B', 'C'], ' - ')).toBe('A - B - C');
    }));
	
	it('should return a simple string without a separator', inject(function($filter) {
	    expect(filter(['A'], ', ')).toBe('A');
    }));
});