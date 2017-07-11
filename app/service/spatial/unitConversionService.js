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
angular.module('unionvmsWeb').factory('unitConversionService',function($filter, globalSettingsService, locale, dateTimeService) {

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
            miToKm: function(dist){
                return dist * 1.609344;
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
	            var duration = moment.duration(Math.abs(time));
	            
	            var days = Math.floor(duration.asDays());
	            var hours = Math.floor(duration.asHours()) - (days * 24);
	            var minutes = Math.floor(duration.asMinutes()) - (days * 24 * 60) - (hours * 60);
	            var seconds = Math.round(duration.asSeconds()  - (days * 24 * 3600) - (hours * 3600) - (minutes * 60));
	            
	            var value = '';
	            if (days !== 0){
	                value += days + 'd ';
	            }
	            if (hours !== 0){
	                value += hours + 'h ';
	            }
	            if (minutes !== 0){
	                value += minutes + 'm ';
	            }
	            
	            if (seconds !== 0){
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
                        return dateTimeService.formatUTCDateWithTimezone(dateTimeService.utcToUserTimezone(moment.utc(date, server_format), displayFormat), displayFormat);
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
