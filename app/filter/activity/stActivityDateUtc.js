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
        if(angular.isDefined(dateInMiliseconds) && !_.isNull(dateInMiliseconds)){
            return unitConversionService.date.convertToUserFormat(new Date(dateInMiliseconds));
        }else{
            return '';
        }
    };
});

