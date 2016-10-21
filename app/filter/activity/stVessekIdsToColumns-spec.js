describe('stVessekIdsToColumns', function() {

    beforeEach(module('unionvmsWeb'));
    var filter;
    
    beforeEach(inject(function($filter){
        filter = $filter('stVessekIdsToColumns');
    }));

	it('should return empty string when no data is passed to the filter', function() {
	    expect(filter({})).toBe('');
	});

	it('should return the appropriate items specified by the idType argument', function() {
	    expect(filter({CFR: 'CFR', IRCS: 'IRCS', EXT_MARK: 'EXT_MARK'}, 'CFR')).toBe('CFR');
        expect(filter({CFR: 'CFR', IRCS: 'IRCS', EXT_MARK: 'EXT_MARK'}, 'IRCS')).toBe('IRCS');
        expect(filter({CFR: 'CFR', IRCS: 'IRCS', EXT_MARK: 'EXT_MARK'}, 'EXT_MARK')).toBe('EXT_MARK');
    });
	
	it('should return the appropriate items and the evaluation of the idType should be case insensitive', function() {
        expect(filter({CFR: 'CFR', IRCS: 'IRCS', EXT_MARK: 'EXT_MARK'}, 'cfr')).toBe('CFR');
        expect(filter({CFR: 'CFR', IRCS: 'IRCS', EXT_MARK: 'EXT_MARK'}, 'IRCS')).toBe('IRCS');
        expect(filter({CFR: 'CFR', IRCS: 'IRCS', EXT_MARK: 'EXT_MARK'}, 'ExT_MarK')).toBe('EXT_MARK');
    });
	
	it('should return an empty string if the specified idType does not exist in the data object', function() {
        expect(filter({CFR: 'CFR', IRCS: 'IRCS', EXT_MARK: 'EXT_MARK'}, 'test')).toBe('');        
    });
});