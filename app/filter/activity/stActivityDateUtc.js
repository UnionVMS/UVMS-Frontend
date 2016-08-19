/**
 * The siteLanguageServices provides information about available languges
 * of a site.
 *
 * @memberof unionvmsWeb
 * @ngdoc filter
 * @name stActivityDateUtc
 * @param {service} unitConversionService - is a service used for different types of conversions.
 * @desc
 *      converts a date/time variable, specified in milliseconds, into human readable string, following system defined formatting
 */
angular.module('unionvmsWeb').filter('stActivityDateUtc',  function(unitConversionService) {
    /**
     * @func convertToUserFormat
     * @memberof stActivityDateUtc
     * @param {Number} dateInMiliseconds - datetime in milliseconds
     */
    return function(dateInMiliseconds) {
        return unitConversionService.date.convertToUserFormat(new Date(dateInMiliseconds));
    };
});
