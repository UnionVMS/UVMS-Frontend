angular.module('unionvmsWeb').filter('vesselGearTypeTranslation', function(locale) {
    return function(input) {
        var name = input;
        //Lookup name in langugage file
        var localeName = locale.getString('config.VESSEL_GEAR_TYPE_' +input);
        if(localeName.indexOf('%%KEY_NOT_FOUND%%') < 0){
            name = localeName;
        }

        return name;
    };
});

angular.module('unionvmsWeb').filter('vesselLicenseTypeTranslation', function(locale) {
    return function(input) {
        var name = input;
        //Lookup name in langugage file
        var localeName = locale.getString('config.VESSEL_LICENSE_TYPE_' +input);
        if(localeName.indexOf('%%KEY_NOT_FOUND%%') < 0){
            name = localeName;
        }

        return name;
    };
});