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
