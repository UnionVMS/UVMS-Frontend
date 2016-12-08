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
angular.module('unionvmsWeb').factory('alarmCsvService', function(csvService, $filter, locale) {

    return {
        exportAlarms: function(alarms) {
            downloadCSVFile(alarms);
        }
    };

    function downloadCSVFile(alarms) {
        var filename = getFilename(alarms);
        var header = getColumnHeaders();
        var rows = getRows(alarms);
        csvService.downloadCSVFile(rows, header, filename);
    }

    function getFilename(alarm) {
        return 'holdingTable.csv';
    }

    function getColumnHeaders(manual) {
        return [
            locale.getString('alarms.alarms_table_date_openend'),
            locale.getString('alarms.alarms_table_object_affected'),
            locale.getString('alarms.alarms_table_rule'),
            locale.getString('alarms.alarms_table_date_resolved'),
            locale.getString('alarms.alarms_table_resolved_by'),
            locale.getString('alarms.alarms_table_status')
        ];
    }

    function getRows(alarms) {
        return alarms.map(function(alarm) {
            return getRow(alarm);
        });
    }

    function getRow(alarm) {
        var row = getRow(alarm);
        return replaceUndefined(row);
    }

    function replaceUndefined(row) {
        return row.map(function(cell) {
            return angular.isUndefined(cell) ? '' : cell;
        });
    }

    function getVesselName(alarm) {
        if (alarm.vessel === undefined) {
            return locale.getString('alarms.alarms_affected_object_unknown');
        }

        return alarm.vessel.name;
    }

    function getRuleNames(alarm) {
        return alarm.alarmItems.map(function(alarmItem) {
            return alarmItem.ruleName;
        }).join(' & ');
    }

    function getStatusLabel(alarm) {
        if (alarm.status === 'OPEN') {
            return locale.getString('alarms.alarms_status_open');
        }
        else if (alarm.status === 'REJECTED') {
            return locale.getString('alarms.alarms_status_rejected');
        }
        else if (alarm.status === 'REPROCESSED') {
            return locale.getString('alarms.alarms_status_reprocessed');
        }
        else {
            return alarm.status;
        }
    }

    function getRow(alarm) {
        return [
            $filter('confDateFormat')(alarm.openDate),
            getVesselName(alarm),
            getRuleNames(alarm),
            $filter('confDateFormat')(alarm.getResolvedDate()),
            alarm.getResolvedBy(),
            getStatusLabel(alarm).toUpperCase()
        ];
    }

});