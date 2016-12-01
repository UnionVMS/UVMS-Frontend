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
