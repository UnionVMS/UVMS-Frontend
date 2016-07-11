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
angular.module('unionvmsWeb').factory('dateTimeService',['$log', 'globalSettingsService', function($log, globalSettingsService) {

    var dateWithTimeZoneWithColonRegexp = new RegExp(/^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}\s\-?\+?\d{2}:\d{2}/);
    var dateWithTimeZoneWithoutColonRegexp = new RegExp(/^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}\s\-?\+?\d{4}/);
    var unixSecondsTimestampRegexp = new RegExp(/^\d{9,10}$/);
    var unixMillisecondsTimestampRegexp = new RegExp(/^\d{12,13}$/);

    //Value when moment.js fails to format a date
    var INVALID_DATE = 'Invalid date';
    var DEFAULT_FORMAT = 'YYYY-MM-DD HH:mm:ss';

    function getFormat() {
        var format = globalSettingsService.getDateFormat();
        if (!angular.isString(format) || format.trim().length < 6) {
            return DEFAULT_FORMAT;
        }

        return format;
    }

    function zeropadleft(str, len) {
        len -= String(str).length;
        while (len-- > 0) {
            str = '0' + str;
        }

        return str;
    }

    function getTimezoneString(utcOffsetMinutes) {
        var sign = utcOffsetMinutes < 0 ? '-' : '+';
        var hours = Math.floor(Math.abs(utcOffsetMinutes / 60));
        var minutes = Math.abs(utcOffsetMinutes % 60);
        return sign + zeropadleft(hours, 2) + ':' + zeropadleft(minutes, 2);
    }

    var dateTimeService = {
        //Convert dateTime (with timezone) to dateTime in UTC without timezone
        toUTC : function(dateTimeInput) {
            if(angular.isDefined(dateTimeInput)){
                var output = dateTimeInput;
                var outputFormat = 'YYYY-MM-DD HH:mm:ss';

                //Unix timestamp in milliseconds? Convert to seconds then.
                if(this.isFormattedAsUnixMillisecondsTimstamp(dateTimeInput)){
                    if(typeof dateTimeInput === 'string'){
                        dateTimeInput = parseInt(dateTimeInput);
                    }
                    dateTimeInput = String(Math.round(dateTimeInput/1000));
                }

                //Unix seconds timestamp?
                if(this.isFormattedAsUnixSecondsTimstamp(dateTimeInput)){
                    return moment.unix(dateTimeInput, 'X').utc().format(outputFormat);
                }

                //No timezone?
                if(!this.isFormattedWithTimeZone(dateTimeInput)){
                    return dateTimeInput;
                }

                var formatted = moment(dateTimeInput, "YYYY-MM-DD HH:mm:ss Z").utc().format(outputFormat);
                if(formatted !== INVALID_DATE){
                    output = formatted;
                }
                return output;
            }
        },
        //Return date as string with timezone
        formatUTCDateWithTimezone : function(dateTimeInput, inputFormat) {
            var outputFormat = 'YYYY-MM-DD HH:mm:ss +00:00';
            if(angular.isDefined(dateTimeInput)){
                dateTimeInput = this.userTimezoneToUtc(dateTimeInput, inputFormat);
                return moment(dateTimeInput, "YYYY-MM-DD HH:mm:ss").format(outputFormat);
            }
        },
        //Formatted with time zone in format "2015-11-18 13:49:00 +01:00" or "2015-11-18 13:49:00 +0100"
        isFormattedWithTimeZone : function(dateTime){
            if(typeof dateTime === 'string'){
              return dateTime.match(dateWithTimeZoneWithColonRegexp) || dateTime.match(dateWithTimeZoneWithoutColonRegexp);
            }
            return false;
        },

        //Formatted as unix seconds timestamp?
        isFormattedAsUnixSecondsTimstamp : function(dateTime){
            return String(dateTime).match(unixSecondsTimestampRegexp);
        },

        //Formatted as unix milliseconds timestamp?
        isFormattedAsUnixMillisecondsTimstamp : function(dateTime){
            return String(dateTime).match(unixMillisecondsTimestampRegexp);
        },

        //Format date according to user settings from configuration
        formatAccordingToUserSettings : function(dateTimeInput){
            if(angular.isDefined(dateTimeInput)){
                var output = dateTimeInput;
                //Format in UTC
                dateTimeInput = this.toUTC(dateTimeInput);

                var formatted = moment.utc(dateTimeInput, "YYYY-MM-DD HH:mm:ss");
                formatted.utcOffset(Number(globalSettingsService.getTimezone()));
                formatted = formatted.format(getFormat());
                if(formatted !== INVALID_DATE){
                    output = formatted;
                }
                return output;
            }
        },
        userTimezoneToUtc: function(dateTime, inputFormat) { // moment?
            if (!this.isFormattedWithTimeZone(dateTime) && (typeof dateTime === 'string')) {
                dateTime += getTimezoneString(globalSettingsService.getTimezone());
            }

            var format = (inputFormat || "YYYY-MM-DD HH:mm") + "Z";
            var m = moment(dateTime, format);
            m.utc();
            return m.format("YYYY-MM-DD HH:mm:ss");
        },
        utcToUserTimezone: function(utcDateTime, userFormat) {
            var m = moment.utc(utcDateTime, "YYYY-MM-DD HH:mm:ss Z");
            m.utcOffset(globalSettingsService.getTimezone());
            return m.format(userFormat || "YYYY-MM-DD HH:mm:ss");
        },
        format: function(date) {
            return moment(date).format(getFormat());
        },
        getTimezoneString: getTimezoneString
    };

    return dateTimeService;
}]);


/*FILTERS*/
//Format date according to user settings from configuration
angular.module('unionvmsWeb').filter('confDateFormat', ['$log', 'dateTimeService', function($log, dateTimeService) {
    return function(input) {
        try{
            if(angular.isDefined(input)){
                return dateTimeService.formatAccordingToUserSettings(input);
            }
        }catch(err){
            $log.warn("Failed to format date: " +input, err);
            return input;
        }
    };
}]);

//Format date as relative string from now, eg. 2 weeks (works both back in time and in the future)
angular.module('unionvmsWeb').filter('timeAgo', ['$log', 'dateTimeService', function($log, dateTimeService) {
    return function(input) {
        try{
            if(angular.isDefined(input)){
                return moment(dateTimeService.toUTC(input), 'YYYY-MM-DD HH:mm:ss').fromNow(true);
            }
        }catch(err){
            $log.warn("Failed to format date to time ago: " +input, err);
            return input;
        }
    };
}]);