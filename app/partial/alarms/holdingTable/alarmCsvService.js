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