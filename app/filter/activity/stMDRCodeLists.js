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
 * @memberof unionvmsWeb
 * @ngdoc filter
 * @name stMDRCodeLists
 * @param $filter {Service} angular filter service
 * @desc
 *      filter the MDR code list table by MDR name and acronym
 */
angular.module('unionvmsWeb').filter('stMDRCodeLists', function($filter) {
    /**
     * @func filterMdrCodeList
     * @memberof stMDRCodeLists
     * @param {String} input - current iterator value
     * @param {String} predicate - search value
     */
    return function(input, predicate) {
        var searchString = predicate['$'];

        var customSearch = function(value, index, array){
            if (typeof searchString === 'undefined'){
                return true;
            }

            var name = value.name === null ? -1 : value.objectName.toLowerCase().indexOf(searchString);
            var acronym = value.acronym === null ? -1 : value.objectAcronym.toLowerCase().indexOf(searchString);

            if (name !== -1 || acronym !== -1){
                return true;
            } else {
                return false;
            }
        };

        return $filter('filter')(input, customSearch, false);
    };
});

