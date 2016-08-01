angular.module('unionvmsWeb').filter('stMDRCodeLists', function($filter) {
    return function(input, predicate) {
        var searchString = predicate['$'];

        var customSearch = function(value, index, array){
            if (typeof searchString === 'undefined'){
                return true;
            }

            var name = value.name === null ? -1 : value.name.toLowerCase().indexOf(searchString);
            var acronym = value.acronym === null ? -1 : value.acronym.toLowerCase().indexOf(searchString);

            if (name !== -1 || acronym !== -1){
                return true;
            } else {
                return false;
            }
        };

        return $filter('filter')(input, customSearch, false);
    };
});
