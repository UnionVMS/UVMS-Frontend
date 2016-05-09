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
            countryCode: 'SWE',
            externalMarking: 'Båt',
            ircs: 'ABC123',
            name: 'Båt nummer 1'
        }
    };

    var noFilter = function(x) { return x; }

    var mockLocale = {
        getString: function(key) {
            if (key.indexOf('movement.table_header_') >= 0) {
                return key.substring(22, key.length);
            }
            else if (key === 'movement.movement_speed_unit') {
                return 'kts';
            }
            else {
                return key;
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