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