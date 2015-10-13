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
                    return moment.unix(dateTimeInput).utc().format(outputFormat);
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

        //Add UTC timezone to date
        addUTCTimeZone : function(dateTimeInput) {
            if(angular.isDefined(dateTimeInput)){
                var output = dateTimeInput;
                //Already formatted with timezone?
                if(this.isFormattedWithTimeZone(dateTimeInput)){
                    dateTimeInput = this.toUTC(dateTimeInput);
                }

                var formatted = moment(dateTimeInput).format("YYYY-MM-DD HH:mm:ss Z");
                if(formatted !== INVALID_DATE){
                    output = formatted;
                }
                return output;
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
                var formatted = moment(dateTimeInput).format(format);
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