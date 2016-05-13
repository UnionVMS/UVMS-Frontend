angular.module('unionvmsWeb').factory('movementCsvService', function(csvService, $filter, locale) {

    var columnHeaders = [
        'flag_state',
        'external_marking',
        'ircs',
        'name',
        'time',
        'latitude',
        'longitude',
        'status',
        'ms',
        'cs',
        'course',
        'movement_type',
        'source'
    ];

    var manualColumnHeaders = [
        'external_marking',
        'ircs',
        'cfr',
        'name',
        'time',
        'latitude',
        'longitude',
        'measured_speed',
        'course'
    ];

    return {
        exportMovements: function(movements) {
            downloadCSVFile(movements, false);
        },
        exportManualMovements: function(movements) {
            downloadCSVFile(movements, true);
        }
    };

    function downloadCSVFile(movements, manual) {
        var filename = getFilename(movements, manual);
        var header = getColumnHeaders(manual);
        var rows = getRows(movements, manual);
        csvService.downloadCSVFile(rows, header, filename);
    }

    function getFilename(movements, manual) {
        var key = manual ? 'movement.file_manual_' : 'movement.file_';
        key += (movements.length === 1) ? 'movement_csv' : 'movements_csv';
        return locale.getString(key);
    }

    function getColumnHeaders(manual) {
        var headers = manual ? manualColumnHeaders : columnHeaders;
        return headers.map(function(header) {
            return locale.getString('movement.table_header_' + header);
        });
    }

    function getRows(movements, manual) {
        var rowFn = manual ? getManualRow : getRow;
        return movements.map(function(movement) {
            return replaceUndefined(rowFn(movement));
        });
    }

    function replaceUndefined(row) {
        angular.forEach(row, function(value, index) {
            if (angular.isUndefined(value)) {
                row[index] = '';
            }
        });

        return row;
    }

    function getRow(movement) {
        return [
            movement.vessel.countryCode,
            movement.vessel.externalMarking,
            movement.vessel.ircs,
            movement.vessel.name,
            getDateString(movement.time),
            getCoordinateString(movement.movement.latitude),
            getCoordinateString(movement.movement.longitude),
            movement.movement.status,
            getSpeedString(movement.movement.reportedSpeed),
            getSpeedString(movement.movement.calculatedSpeed),
            getCourseString(movement.movement.reportedCourse),
            movement.movement.movementType,
            $filter('transponderName')(movement.movement.source)
        ];
    }

    function getManualRow(movement) {
        return [
            movement.carrier.externalMarking,
            movement.carrier.ircs,
            movement.carrier.cfr,
            movement.carrier.name,
            getDateString(movement.time),
            getCoordinateString(movement.position.latitude),
            getCoordinateString(movement.position.longitude),
            getSpeedString(movement.speed),
            getCourseString(movement.course)
        ];
    }

    function getSpeedString(value) {
        return $filter('number')($filter('speed')(value), 2) + ' ' + locale.getString('movement.movement_speed_unit');
    }

    function getCourseString(value) {
        return value + '\u00b0';
    }

    function getCoordinateString(value) {
        return $filter('confCoordinateFormat')(value).replace(/,/g, '.');
    }

    function getDateString(value) {
        return $filter('confDateFormat')(value);
    }

});