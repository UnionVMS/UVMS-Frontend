angular.module('unionvmsWeb').filter('stActivityDateUtc',  function(unitConversionService) {
    return function(dateInMiliseconds) {
        return unitConversionService.date.convertToUserFormat(new Date(dateInMiliseconds));
    };
});
