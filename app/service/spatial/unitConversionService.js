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
	        formatSpeed: function(speed, decimalPlaces){
	            var unit = this.getUnit();
	            var finalUnit = locale.getString('common.speed_unit_' + unit);
	            var value = speed;
	            if (value !== 0){
	                value = $filter('number')(speed, decimalPlaces);
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
            formatDistance: function(distance, decimalPlaces){
                var unit = this.getUnit();
                var value = distance;
                if (value !== 0){
                    value = $filter('number')(distance, decimalPlaces);
                }
                
                return value + ' ' + unit;
            }
	    },
	    duration: {
	        timeToHuman: function(time){
	            var days = Math.floor(time / (24 * 3600));
	            
	            var divisor_for_hours = time % (24 * 3600);
	            var hours = Math.floor(divisor_for_hours / 3600);

	            var divisor_for_minutes = time % 3600;
	            var minutes = Math.floor(divisor_for_minutes / 60);

	            var divisor_for_seconds = divisor_for_minutes % 60;
	            var seconds = Math.ceil(divisor_for_seconds);
	            
	            var value = '';
	            if (days){
	                value += days + 'd ';
	            }
	            if (hours){
	                value += hours + 'h ';
	            }
	            if (minutes){
	                value += minutes + 'm ';
	            }
	            
	            if (seconds){
	                value += seconds + 's';
	            }
	            
	            if (value === ''){
	                value = '0s';
	            }
	            
	            return value;
	        },
	        humanToTime: function(duration){
	            var parsedDuration = duration.match(/([0-9]+[dhms]{1})/ig);
	            
	            var finalDuration = 0;
	            if (parsedDuration){
	                for (var i = 0; i < parsedDuration.length; i++){
	                    if (parsedDuration[i].toUpperCase().indexOf('D') !== -1){
	                        finalDuration += (parseInt(parsedDuration[i]) * 24 * 3600);
                        }
	                    if (parsedDuration[i].toUpperCase().indexOf('H') !== -1){
	                        finalDuration += (parseInt(parsedDuration[i]) * 3600);
	                    }
	                    
	                    if (parsedDuration[i].toUpperCase().indexOf('M') !== -1){
	                        finalDuration += (parseInt(parsedDuration[i]) * 60);
	                    }
	                    
	                    if (parsedDuration[i].toUpperCase().indexOf('S') !== -1){
	                        finalDuration += parseInt(parsedDuration[i]);
	                    }
	                }
	                
	                return finalDuration;
	            }
	            
	            return undefined;
	        }
	    },
	    date: {
	        getDateFormat: function(){
	            return globalSettingsService.getDateFormat();
	        },
	        getTimeZone: function(){
	            return parseInt(globalSettingsService.getTimezone());
	        },
	        convertDate: function(date, direction){
	            var displayFormat = this.getDateFormat();
                var src_format = 'YYYY-MM-DD HH:mm:ss Z';
                var server_format = 'YYYY-MM-DDTHH:mm:ss';
                
                if (direction === 'to_server'){
                    if (moment.utc(date, src_format).isValid()){
                        return moment.utc(date, src_format).format(server_format);
                    }
                } else if(direction === 'from_server') {
                    if (moment.utc(date, server_format).isValid()){
                        return moment.utc(date, server_format).format(displayFormat);
                    }
                }
	        },
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