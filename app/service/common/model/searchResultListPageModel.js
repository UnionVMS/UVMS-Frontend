angular.module('unionvmsWeb')
    .factory('SearchResultListPage', function() {

        function SearchResultListPage(items, currentPage, totalNumberOfPages){
            this.items = _.isArray(items) ? items : [];
            this.currentPage = _.isNumber(currentPage) ? currentPage : 0;
            this.totalNumberOfPages = _.isNumber(totalNumberOfPages) ? totalNumberOfPages : 0;
        }

        return SearchResultListPage;
    });

