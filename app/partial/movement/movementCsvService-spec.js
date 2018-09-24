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
describe('movementCsvService', function() {

    beforeEach(module('unionvmsWeb', function($provide) {
        // Filters do nothing
        $provide.value('speedFilter', noFilter);
        $provide.value('numberFilter', noFilter);
        $provide.value('confDateFormatFilter', noFilter);
        $provide.value('confCoordinateFormatFilter', noFilter);
        $provide.value('transponderNameFilter', noFilter);

        $provide.service('locale', function() {
            return mockLocale;
        });

    }));

    it('should call csvService with movement data, header and filename', inject(function(movementCsvService, csvService) {
        spyOn(csvService, 'downloadCSVFile');
        movementCsvService.exportMovements([movement]);
        expect(csvService.downloadCSVFile).toHaveBeenCalledWith([expectedRow], expectedHeader, 'positionReport.csv');
    }));

    it('should support multiple movements', inject(function(movementCsvService, csvService) {
        spyOn(csvService, 'downloadCSVFile');
        movementCsvService.exportMovements([movement, movement]);
        expect(csvService.downloadCSVFile).toHaveBeenCalledWith([expectedRow, expectedRow], expectedHeader, 'positionReports.csv');
    }));

    var movement = {
        movement: {
            calculatedSpeed: 3.5,
            latitude: '59.353',
            longitude: '11.453',
            movementType: 'POS',
            reportedCourse: 91,
            reportedSpeed: 3.145,
            source: 'Iridium',
            status: '010'
        },
        time: '2016-05-09 08:03:04',
        vessel: {
            flagStateCode: 'SWE',
            externalMarking: 'Båt',
            ircs: 'ABC123',
            name: 'Båt nummer 1'
        }
    };

    var noFilter = function(x) { return x; }

    var mockStrings = {
        'movement.movement_speed_unit': 'kts',
        'movement.file_movements_csv': 'positionReports.csv',
        'movement.file_movement_csv': 'positionReport.csv'
    };

    var mockLocale = {
        getString: function(key) {
            if (key.indexOf('movement.table_header_') >= 0) {
                return key.substring(22, key.length);
            }
            else {
                return mockStrings[key] || key;
            }
        }
    };

    var expectedHeader = ['flag_state', 'external_marking', 'ircs', 'name', 'time', 'latitude', 'longitude', 'status', 'ms', 'cs', 'course', 'movement_type', 'source'];

    var expectedRow = [
        'SWE',
        'Båt',
        'ABC123',
        'Båt nummer 1',
        '2016-05-09 08:03:04',
        '59.353',
        '11.453',
        '010',
        '3.145 kts',
        '3.5 kts',
        '91°',
        'POS',
        'Iridium'
    ];

});