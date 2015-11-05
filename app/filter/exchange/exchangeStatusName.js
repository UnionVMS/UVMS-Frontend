angular.module('unionvmsWeb').filter('exchangeStatusName', function(locale) {
    return function(input) {
        if(angular.isDefined(input)){
            var name = input;
            //Lookup name in langugage file
            var localeName = locale.getString('config.EXCHANGE_STATUS_' +input);
            if(localeName.indexOf('%%KEY_NOT_FOUND%%') < 0){
                name = localeName;
            }
            return name;
        }
    };
});