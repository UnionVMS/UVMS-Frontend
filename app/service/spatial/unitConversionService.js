angular.module('unionvmsWeb').factory('unitConversionService',function($filter, globalSettingsService, locale) {

	var unitConversionService = {
	    speed: {
	        getUnit: function(){
	            return globalSettingsService.getSpeedUnit();
	        },
	        knotsToKph: function(speed){
	            return speed * 1.852;
	        },
	        kphToKnots: function(speed){
	            return speed / 1.852;
	        },
	        knotsToMph: function(speed){
	            return speed * 1.15077945;
	        },
	        mphToKnots: function(speed){
	            return speed / 1.15077945;
	        },
	        checkSpeed: function(speed, decimalPlaces){
	            var unit = this.getUnit();
	            var finalUnit = locale.getString('common.speed_unit_' + unit);
	            var value = $filter('number')(speed, decimalPlaces);
	            
	            if (unit === 'kph'){
	                value = $filter('number')(this.knotsToKph(speed), decimalPlaces);
	            }
	            
	            if (unit === 'mph'){
	                value = $filter('number')(this.knotsToMph(speed), decimalPlaces);
	            }
	            return value + ' ' + finalUnit;
	        }
	    },
	    distance: {
	        getUnit: function(){
	            return globalSettingsService.getDistanceUnit();
	        },
	        nmToKm: function(dist){
	            return dist * 1.85200;
	        },
	        kmToNm: function(dist){
                return dist / 1.85200;
            },
	        nmToMi: function(dist){
	            return dist * 1.15077945;
	        },
	        miToNm: function(dist){
                return dist / 1.15077945;
            },
            checkDistance: function(distance, decimalPlaces){
                var unit = this.getUnit();
                var value = $filter('number')(distance, decimalPlaces);
                
                if (unit === 'km'){
                    value = $filter('number')(this.nmToKm(distance), decimalPlaces);
                }
                
                if (unit === 'mi'){
                    value = $filter('number')(this.nmToMi(distance), decimalPlaces);
                }
                
                return value + ' ' + unit;
            }
	    },
	    duration: {
	        timeToHuman: function(units, time){
	            // units can be: http://momentjs.com/docs/#/manipulating/add/
	            var duration = moment().startOf('day').add(units, time);
	            var format = "";

	            if(duration.hour() > 0){
	                format += "H[h] ";
	            }

	            if(duration.minute() > 0){
	                format += "m[m] ";
	            }

	            format += " s[s]";

	            return duration.format(format);
	        }
	    },
	    date: {
	        convertToUserFormat: function(date){
	            if (date !== null && angular.isDefined(date)){
	                var displayFormat = globalSettingsService.getDateFormat();
	                var tz = parseInt(globalSettingsService.getTimezone());
	                return moment.utc(date).utcOffset(tz).format(displayFormat);
	            }
	        }
	    }
	};

	return unitConversionService;
});