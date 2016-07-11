/*
﻿Developed with the contribution of the European Commission - Directorate General for Maritime Affairs and Fisheries
© European Union, 2015-2016.

This file is part of the Integrated Fisheries Data Management (IFDM) Suite. The IFDM Suite is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as published by the
Free Software Foundation, either version 3 of the License, or any later version. The IFDM Suite is distributed in
the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. You should have received a
copy of the GNU General Public License along with the IFDM Suite. If not, see <http://www.gnu.org/licenses/>.
 */
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