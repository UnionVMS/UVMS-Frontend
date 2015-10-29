angular.module('unionvmsWeb').factory('dateTimeService',function() {

    var dateWithTimeZoneWithColonRegexp = new RegExp(/^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}\s\-?\+?\d{2}:\d{2}/);
    var dateWithTimeZoneWithoutColonRegexp = new RegExp(/^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}\s\-?\+?\d{4}/);
    var unixSecondsTimestampRegexp = new RegExp(/^\d{9,10}$/);
    var unixMillisecondsTimestampRegexp = new RegExp(/^\d{12,13}$/);

    //Value when moment.js fails to format a date
    var INVALID_DATE = 'Invalid date';

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
        formatUTCDateWithTimezone : function(dateTimeInput) {
            var outputFormat = 'YYYY-MM-DD HH:mm:ss +00:00';
            if(angular.isDefined(dateTimeInput)){
                dateTimeInput = this.toUTC(dateTimeInput);
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

                //TODO: get format from configuraton
                var format = 'DD MMM YYYY HH:mm UTC';
                var formatted = moment(dateTimeInput, "YYYY-MM-DD HH:mm:ss Z").format(format);
                if(formatted !== INVALID_DATE){
                    output = formatted;
                }
                return output;
            }
        }
    };

    return dateTimeService;
});


/*FILTERS*/
//Format date according to user settings from configuration
angular.module('unionvmsWeb').filter('confDateFormat', function($log, dateTimeService) {
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
});

//Format date as relative string from now, eg. 2 weeks (works both back in time and in the future)
angular.module('unionvmsWeb').filter('timeAgo', function($log, dateTimeService) {
    return function(input) {
        try{
            if(angular.isDefined(input)){
                return moment(dateTimeService.toUTC(input), 'YYYY-MM-DD HH:mm:ss').fromNow();
            }
        }catch(err){
            $log.warn("Failed to format date to time ago: " +input, err);
            return input;
        }
    };
});