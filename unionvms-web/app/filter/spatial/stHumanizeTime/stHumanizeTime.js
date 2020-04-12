angular.module('unionvmsWeb').filter('stHumanizeTime', function(unitConversionService) {
    return function(number, type, showSeconds) {
        return unitConversionService.duration.timeToHuman(number, type, showSeconds);
    };
});
