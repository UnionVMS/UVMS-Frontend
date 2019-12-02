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
