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
 * @name titleTransformer
 *
 * @desc
 *      transforms text following a key, value mapping
 */
angular.module('unionvmsWeb').filter('titleTransformer',  function() {

    var valueMap = {
        //Activity types
        'DEPARTURE': 'DEP',
        'AREA_ENTRY': 'ENTRY',
        'AREA_EXIT': 'ΕΧΙΤ',
        'FISHING_OPERATION': 'FOP',
        'DISCARD': 'DIS',
        'RELOCATION': 'RLC',
        'JOINED_FISHING_OPERATION': 'JFOP',
        'TRANSHIPMENT': 'TRA',
        'ARRIVAL': 'ARR',
        'LANDING': 'LAND',
        //Report types
        'DECLARATION': 'DECL.',
        'NOTIFICATION': 'NOT.',
        //Table header types
        'Cumul_catches': 'Cumul. catches',
        'ARRIVAL_NOTIFICATION_ONBOARD': 'ARR NOT ONBOARD',
        'ARRIVAL_NOTIFICATION_LOADED': 'ARR NOT LOAD',
        'ARRIVAL_NOTIFICATION_UNLOADED': 'ARR NOT UNLOAD',
        'ARRIVAL_DECLARATION_ONBOARD': 'ARR DECL ONBOARD',
        'ARRIVAL_DECLARATION_LOADED': 'ARR DECL LOAD',
        'ARRIVAL_DECLARATION_UNLOADED': 'ARR DECL UNLOAD',
        'TRANSHIPMENT_NOTIFICATION_ONBOARD': 'TRA NOT ONBOARD',
        'TRANSHIPMENT_NOTIFICATION_LOADED': 'TRA NOT LOAD',
        'TRANSHIPMENT_NOTIFICATION_UNLOADED': 'TRA NOT UNLOAD',
        'TRANSHIPMENT_DECLARATION_ONBOARD': 'TRA DECL ONBOARD',
        'TRANSHIPMENT_DECLARATION_LOADED': 'TRA DECL LOAD',
        'TRANSHIPMENT_DECLARATION_UNLOADED': 'TRA DECL UNLOAD',
        'LANDING_NOTIFICATION_ONBOARD': 'LAN NOT ONBOARD',
        'LANDING_NOTIFICATION_LOADED': 'LAN NOT LOADED',
        'LANDING_NOTIFICATION_UNLOADED': 'LAN NOT UNLOADED',
        'LANDING_DECLARATION_ONBOARD': 'LAN DECL ONBOARD',
        'LANDING_DECLARATION_LOADED': 'LAN DECL LOADED',
        'LANDING_DECLARATION_UNLOADED': 'LAN DECL UNLOADED'
    };

    return function(title) {
        if (angular.isDefined(title) && !!valueMap[title]) {
            return valueMap[title];
        }
        return title;
    };
});
