angular.module('unionvmsWeb').filter('dataNotAvailable', function($log, locale) {
	return function(input) {
	try	{
			if(angular.isDefined(input)){
				return input;
			} else {
				return locale.getString('common.short_not_available');
			}
        }
        catch(err){
            $log.warn("Data do not exists in item: " +input, err);
            return input;
        }
    };
});

