angular.module('unionvmsWeb')
    .factory('SearchResultListPage', function() {

        function SearchResultListPage(items, currentPage, totalNumberOfPages){
            this.items = _.isArray(items) ? items : [];
            this.currentPage = _.isNumber(currentPage) ? currentPage : 0;
            this.totalNumberOfPages = _.isNumber(totalNumberOfPages) ? totalNumberOfPages : 0;
        }

        SearchResultListPage.prototype.getNumberOfItems = function(){
            return this.items.length;
        };


        //Find an item in the list of items by a property
        SearchResultListPage.prototype.getItemByProperty = function(propertyKey, propertyValue) {
            if(angular.isDefined(propertyKey) && angular.isDefined(propertyValue)){
                var foundItem;
                $.each(this.items, function(index, anItem){
                    if(anItem[propertyKey] === propertyValue){
                        foundItem = anItem;
                        return false;
                    }
                });

                return foundItem;
            }
        };

        return SearchResultListPage;
    });

