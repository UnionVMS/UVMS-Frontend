describe('unitTransformers', function() {

    beforeEach(module('unionvmsWeb'));

    beforeEach(module(function($provide) {
        $provide.service('unitScaleFactors', function() {
            return {
                getLengthScaleFactor: function() {
                    return 3.2808399;
                }
            }
        })
    }));

    it('should convert range end to user length units', inject(function(unitTransformer) {
        expect(unitTransformer.length.toLengthUnitRangeString('0-11,99')).toBe('0-39,337');
    }));

    it('should convert range start to user length units', inject(function(unitTransformer) {
        expect(unitTransformer.length.toLengthUnitRangeString('12,01-15')).toBe('39,403-49,213');
    }));

    it('should convert open ended range to user length units', inject(function(unitTransformer) {
        expect(unitTransformer.length.toLengthUnitRangeString('24+')).toBe('78,74+');
    }));

    it('should replace period with comma', inject(function(unitTransformer) {
        expect(unitTransformer.length.toLengthUnitRangeString('10.4')).toBe('34,121');
    }));

});