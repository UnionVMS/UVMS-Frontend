angular.module('unionvmsWeb').filter('stSearchDynamic', ['$parse', function($parse) {
    return function(items, filters) {
        var itemsLeft = items.slice();

        Object.keys(filters).forEach(function(model) {
            var value = filters[model],
                getter = $parse(model);

            itemsLeft = itemsLeft.filter(function(item) {
                var searchItem = getter(item).toLowerCase(),
                    searchValue = value.toLowerCase();

                if (searchItem.indexOf(searchValue) > -1) {
                    return searchItem;
                } else {
                }
            });
        });

        return itemsLeft;
    };
}]);