angular.module('unionvmsWeb').factory('movementCsvService', function(csvService, $filter, locale) {

    return {
        exportMovements: function(movements) {
            csvService.downloadCSVFile(getRows(movements), getColumnHeaders(), getFilename(movements));
        }
    };

    function getFilename(movements) {
        return movements.length === 1 ? 'positionReport.csv' : 'positionReports.csv';
    }

    function getColumnHeaders() {
        return [
            locale.getString('movement.table_header_flag_state'),
            locale.getString('movement.table_header_external_marking'),
            locale.getString('movement.table_header_ircs'),
            locale.getString('movement.table_header_name'),
            locale.getString('movement.table_header_time'),
            locale.getString('movement.table_header_latitude'),
            locale.getString('movement.table_header_longitude'),
            locale.getString('movement.table_header_status'),
            locale.getString('movement.table_header_ms'),
            locale.getString('movement.table_header_cs'),
            locale.getString('movement.table_header_course'),
            locale.getString('movement.table_header_movement_type'),
            locale.getString('movement.table_header_source')
        ];
    }

    function getRows(movements) {
        return movements.map(function(movement) {
            return getRow(movement);
        });
    }

    function getRow(movement) {
        return [
            movement.vessel.countryCode || '',
            movement.vessel.externalMarking || '',
            movement.vessel.ircs || '',
            movement.vessel.name || '',
            $filter('confDateFormat')(movement.time),
            $filter('confCoordinateFormat')(movement.movement.latitude).replace(/,/g, '.'),
            $filter('confCoordinateFormat')(movement.movement.longitude).replace(/,/g, '.'),
            movement.movement.status,
            $filter('number')($filter('speed')(movement.movement.reportedSpeed), 2) + ' ' + locale.getString('movement.movement_speed_unit'),
            $filter('number')($filter('speed')(movement.movement.calculatedSpeed), 2) + ' ' + locale.getString('movement.movement_speed_unit'),
            movement.movement.reportedCourse + '\u00b0',
            movement.movement.movementType,
            $filter('transponderName')(movement.movement.source)
        ];
    }

});