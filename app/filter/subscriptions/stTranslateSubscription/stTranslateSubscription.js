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
 * @name stTranslateSubscription
 * @param locale {service} the angular locale service
 * @desc
 *      Translates the subscription and message type of a Subscription
 */
angular.module('unionvmsWeb').filter('stTranslateSubscription', function(locale) {
    /**
     * @func convertToUserFormat
     * @memberof stTranslateSubscription
     * @param {String} value - The value to use in the translation
     * @param {String} type - The type to be translated (e.g. subscriptionType or messageType)
     * @returns {String] The translated string
     */
    return function(value,type) {
        var translated = value;
        switch (type){
            case 'subscriptionType':
                translated = locale.getString('subscriptions.subscription_type_' + value.toLowerCase());
                break;
            case 'messageType':
                translated = locale.getString('subscriptions.' + value.toLowerCase());
                break;
        }

        return translated;
    };
});