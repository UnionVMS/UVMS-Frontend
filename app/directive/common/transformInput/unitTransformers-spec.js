/*
Developed with the contribution of the European Commission - Directorate General for Maritime Affairs and Fisheries
© European Union, 2015-2016.

This file is part of the Integrated Fisheries Data Management (IFDM) Suite. The IFDM Suite is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as published by the
Free Software Foundation, either version 3 of the License, or any later version. The IFDM Suite is distributed in
the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. You should have received a
copy of the GNU General Public License along with the IFDM Suite. If not, see <http://www.gnu.org/licenses/>.
 */
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