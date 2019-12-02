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
            locale.getString('alarms.alarms_table_status'),
            locale.getString('movement.manual_position_field_label_flag_state'),
            locale.getString('movement.manual_position_field_label_ircs'),
            locale.getString('movement.manual_position_field_label_cfr'),
            locale.getString('movement.manual_position_field_label_external_marking'),
            locale.getString('movement.manual_position_field_label_name'),
            locale.getString('movement.manual_position_field_label_status'),
            locale.getString('movement.manual_position_field_label_date_time'),
            locale.getString('movement.manual_position_field_label_latitude'),
            locale.getString('movement.manual_position_field_label_longitude'),
            locale.getString('movement.manual_position_field_label_measured_speed'), 
            locale.getString('movement.manual_position_field_label_course')
        ];
    }

    function getRows(alarms) {
        return alarms.map(function(alarm) {
            return getRow(alarm);
        });
    }

    function replaceUndefined(row) {
        return row.map(function(cell) {
            return angular.isUndefined(cell) ? '' : cell;
        });
    }

    function getVesselName(alarm) {
        if (alarm.incomingMovemenet === undefined || alarm.incomingMovemenet.assetName === undefined) {
            return locale.getString('alarms.alarms_affected_object_unknown');
        }

        return alarm.incomingMovemenet.assetName;
    }

    function getRuleNames(alarm) {
        return alarm.alarmItemList.map(function(alarmItem) {
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

    function getValues() {
        var missingValueText = locale.getString('alarms.position_report_information_value_missing');

        return {
            flagState: function(alarm) {
                if (angular.isDefined(alarm.placeholderVessel)) {
                    return alarm.placeholderVessel.flagStateCode; 
                } else if (angular.isDefined(alarm.incomingMovement) && angular.isDefined(alarm.incomingMovement.flagState)) {
                    return alarm.incomingMovement.flagState; 
                } else {
                    return missingValueText;
                }
            }, 
            ircs: function(alarm) {
                if (angular.isDefined(alarm.placeholderVessel)) {
                    return alarm.placeholderVessel.ircs; 
                } else if (angular.isDefined(alarm.incomingMovement) && angular.isDefined(alarm.incomingMovement.assetIRCS)) {
                    return alarm.incomingMovement.assetIRCS; 
                } else {
                    return missingValueText;
                }
            },
            externalMarking: function(alarm) {
                if (angular.isDefined(alarm.placeholderVessel)) {
                    return alarm.placeholderVessel.externalMarking; 
                } else if (angular.isDefined(alarm.incomingMovement) && angular.isDefined(alarm.incomingMovement.externalMarking)) {
                    return alarm.movement.externalMarking; 
                } else {
                    return missingValueText;
                }
            }, 
            cfr: function(alarm) {
                if (angular.isDefined(alarm.placeholderVessel)) {
                    return alarm.placeholderVessel.cfr; 
                } else if (angular.isDefined(alarm.incomingMovement) && angular.isDefined(alarm.incomingMovement.assetCFR)) {
                    return alarm.incomingMovement.assetCFR; 
                } else {
                    return missingValueText;
                }
            },
            assetName: function(alarm) {
                if (angular.isDefined(alarm.placeholderVessel)) {
                    return alarm.placeholderVessel.name; 
                } else if (angular.isDefined(alarm.incomingMovement) && angular.isDefined(alarm.incomingMovement.assetName)) {
                    return alarm.incomingMovement.assetName; 
                } else {
                    return missingValueText;
                }
            }, 
            movementStatus: function(alarm) {
                if (angular.isDefined(alarm.incomingMovement) && angular.isDefined(alarm.incomingMovement.status)) {
                    return alarm.incomingMovement.status;
                }
            }, 
            movementDateTime: function(alarm) {
                if (angular.isDefined(alarm.incomingMovement) && angular.isDefined(alarm.incomingMovement.positionTime)) {
                    return alarm.incomingMovement.positionTime;
                }
            }, 
            movementLatitude: function(alarm) {
                if (angular.isDefined(alarm.incomingMovement) && angular.isDefined(alarm.incomingMovement.latitude)) {
                    return alarm.incomingMovement.latitude;
                }
            }, 
            movementLongitude: function(alarm) {
                if (angular.isDefined(alarm.incomingMovement) && angular.isDefined(alarm.incomingMovement.longitude)) {
                    return alarm.incomingMovement.longitude;
                }
            }, 
            movementReportedSpeed: function(alarm) {
                if (angular.isDefined(alarm.incomingMovement) && angular.isDefined(alarm.incomingMovement.reportedSpeed)) {
                    return alarm.incomingMovement.reportedSpeed;
                }
            }, 
            movementReportedCourse: function(alarm) {
                if (angular.isDefined(alarm.incomingMovement) && angular.isDefined(alarm.incomingMovement.reportedCourse)) {
                    return alarm.incomingMovement.reportedCourse;
                }
            }
        };
    }

    function getRow(alarm) {
        return [
            $filter('confDateFormat')(alarm.createdDate),
            getVesselName(alarm),
            getRuleNames(alarm),
            $filter('confDateFormat')(alarm.getResolvedDate()),
            alarm.getResolvedBy(),
            getStatusLabel(alarm).toUpperCase(),
            getValues().flagState(alarm), 
            getValues().ircs(alarm),
            getValues().cfr(alarm),
            getValues().externalMarking(alarm),
            getValues().assetName(alarm),
            getValues().movementStatus(alarm),
            $filter('confDateFormat')(getValues().movementDateTime(alarm)), 
            $filter('confCoordinateFormat')(getValues().movementLatitude(alarm)),
            $filter('confCoordinateFormat')(getValues().movementLongitude(alarm)),
            getValues().movementReportedSpeed(alarm),
            getValues().movementReportedCourse(alarm)
        ];
    }

});