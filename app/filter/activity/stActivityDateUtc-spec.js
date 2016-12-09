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
describe('stActivityDateUtc', function() {

    var mockUnitConversionService = {
         date: {
            convertToUserFormat: function(timeInMillisec) {
                return timeInMillisec + 'mock';
            }
         }
    };

    beforeEach(module('unionvmsWeb', function () {
      module(function ($provide) {
                $provide.value('unitConversionService', mockUnitConversionService);
              });
            }));

    it('should ...', inject(function($filter ) {

        var filter = $filter('stActivityDateUtc');
        var datetime = new Date().getTime();
        expect(filter(datetime)).toEqual(new Date(datetime)+'mock');

    }));

});

