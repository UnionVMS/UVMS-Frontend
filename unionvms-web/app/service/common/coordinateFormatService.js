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
angular.module('unionvmsWeb').factory('coordinateFormatService',function($log, globalSettingsService) {

    //This service handles two different coordinate formats
    // * Decimal degrees, eg: 45.343
    // * Degrees with decimal minutes, eg: 22° 30,00′

    var patternFormats = {
        DECIMAL_MINUTES : new RegExp(/^[+-]?\d{1,3}°?\s\d{1,2}(,\d+)?[′']?$/), //any number of decimals
        DECIMAL :  new RegExp(/^[+-]?\d{1,3}([\.,]+\d+)?$/), //any number of decimals
    };

    var isValidCoordinate = function(coordinate, maxAbsVal){
        //Decimal minutes?
        if(String(coordinate).match(patternFormats.DECIMAL_MINUTES)){
            coordinate = coordinateFormatService.toDecimalDegrees(coordinate, -1);
        }
        //Decimal format?
        if(String(coordinate).match(patternFormats.DECIMAL)){
            coordinate = Number(coordinate);
            return Math.abs(coordinate) <= maxAbsVal;
        }
        return false;
    };

    var matchesDecimalFormat = function(coordinate){
        if(angular.isDefined(coordinate)){
            return String(coordinate).match(patternFormats.DECIMAL);
        }
        return false;
    };

    var matchesDecimalMinutesFormat = function(coordinate){
        if(angular.isDefined(coordinate)){
            return String(coordinate).match(patternFormats.DECIMAL_MINUTES);
        }
        return false;
    };

    var formatCoordinate = function(coordinate, outputFormat, numberOfDecimals){
        var origInput = coordinate;
        var decimalDegrees, degrees, decimalMinutes;

        //PARSE INPUT
        /*Set the following variables:
         - decimalDegrees: degrees in decimal format
         - decimal: degrees (whole units)
         - decimalMinutes: minutes in decimal format
        */

        //Input is decimal degress?
        if(matchesDecimalFormat(coordinate)){
            decimalDegrees = coordinate;
            coordinate = parseFloat(coordinate);

            if(coordinate >= 0){
                degrees = Math.floor(coordinate);
            }else{
                degrees = Math.ceil(coordinate);
            }
            decimalMinutes = (Math.abs(coordinate) - Math.abs(degrees)) * 60;
        }
        //Input is decimal minutes?
        else if(matchesDecimalMinutesFormat(coordinate)){
            var coordArray = coordinate.split(' ');
            degrees = parseInt(coordArray[0].replace('°', ''));
            var decimalMinutesString = coordArray[1].replace(",", ".").trim();
            decimalMinutes = parseFloat(decimalMinutesString);
            var degreeDecimals = parseFloat(decimalMinutesString);
            degreeDecimals = degreeDecimals / 60;
            if(degrees >= 0){
                decimalDegrees = degrees +degreeDecimals;
            }else{
                decimalDegrees = degrees -degreeDecimals;
            }
            decimalDegrees = parseFloat(decimalDegrees);
        }
        //Unknown format
        else{
            $log.warn("Can't format coordinate. Input format is unkown.");
            return origInput;
        }

        //Set number of decimals (-1 means no rounding at all)
        if(angular.isUndefined(numberOfDecimals)){
            numberOfDecimals = 3; //3 decimals by defalt
        }

        //FORMAT OUTPUT
        if(outputFormat === 'DECIMAL'){
            //Set number of decimals (-1 means no rounding at all)
            decimalDegrees = parseFloat(decimalDegrees);
            if(numberOfDecimals >= 0){
                decimalDegrees = decimalDegrees.toFixed(numberOfDecimals);
            }
            return String(decimalDegrees);
        }
        else if(outputFormat === 'DECIMAL_MINUTES'){
            if(numberOfDecimals >= 0){
                decimalMinutes = decimalMinutes.toFixed(numberOfDecimals);
            }
            //Replace . with , in the decimal minutes
            decimalMinutes = String(decimalMinutes).replace(".", ",");
            return degrees + '\u00b0 ' + decimalMinutes +'\u2032';
        }else{
            $log.warn("Can't format coordinate. Format doesn't exist:" +outputFormat);
            return origInput;
        }

    };

	var coordinateFormatService = {
        //Latitude should be between -90 and +90
        isValidLatitude : function(coordinate){
            return isValidCoordinate(coordinate, 90);
        },
        //Longitude should be between -180 and +180
        isValidLongitude : function(coordinate){
            return isValidCoordinate(coordinate, 180);
        },
        //Convert coordinate to degrees and minutes on the format 00° 00,00′
        //Returns result with minutes with 3 decimals by default
        toDegreesWithDecimalMinutes : function(coordinate, numberOfDecimals){
            //Example:
            //Input: 22.500 or 22° 30,00′
            //Output: 22° 30,000′

            return formatCoordinate(coordinate, 'DECIMAL_MINUTES', numberOfDecimals);
        },

        //Convert coordinate to decimals on the format 00.000
        //Returns result with 3 decimals by default
        toDecimalDegrees : function(coordinate, numberOfDecimals){
            //Example:
            //Input: 22° 30,00′
            //Output: 22.500
            return formatCoordinate(coordinate, 'DECIMAL', numberOfDecimals);
        },

        //Format according to the user settings
        formatAccordingToUserSettings : function(coordinate){
            //Get format from global settings
            var configFormat = globalSettingsService.getCoordinateFormat();
            switch(configFormat){
                case 'degreesMinutesSeconds':
                    return this.toDegreesWithDecimalMinutes(coordinate);
                case 'decimalDegrees':
                    return this.toDecimalDegrees(coordinate);
                default:
                    $log.warn("Invalid or missing coordinate format. Using decimal degrees.");
                    return this.toDecimalDegrees(coordinate);
            }
        }
    };

	return coordinateFormatService;
});


/*FILTERS*/
//Format cooordinate according to user settings from configuration
angular.module('unionvmsWeb').filter('confCoordinateFormat', function($log, coordinateFormatService) {
    return function(input) {
        try{
            if(angular.isDefined(input) && input !== null && String(input).trim().length > 0){
                return coordinateFormatService.formatAccordingToUserSettings(input);
            }
        }catch(err){
            $log.warn("Failed to format coordinate: " +input, err);
            return input;
        }
    };
});