angular.module('unionvmsWeb').filter('stDateUtc', function(globalSettingsService) {
	return function(date) {
	    if (date !== null && angular.isDefined(date)){
	        var displayFormat = globalSettingsService.getDateFormat();
	        var tz = parseInt(globalSettingsService.getTimezone());
	        return moment.utc(date).utcOffset(tz).format(displayFormat);
	    }
	};
});