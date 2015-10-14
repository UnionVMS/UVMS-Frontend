angular.module('unionvmsWeb')
.factory('SearchResults', function(SearchField, locale, SearchResultListPage) {

    function SearchResults(sortyBy, sortReverse, zeroResultsErrorMessage, equals){
        this.page = 0;
        this.totalNumberOfPages = 0;
        this.items = [];
        this.errorMessage = "";
        this.loading = false;
        this.sortBy = angular.isDefined(sortyBy) ? sortyBy : '';
        this.sortReverse = angular.isDefined(sortReverse) ? sortReverse : false;
        this.zeroResultsErrorMessage = angular.isDefined(zeroResultsErrorMessage) ? zeroResultsErrorMessage : locale.getString('common.search_zero_results_error');
        this.equals = equals;
    }

    SearchResults.prototype.setLoading = function(newLoading){
        this.loading = newLoading;
    };

    SearchResults.prototype.setErrorMessage = function(newErrorMessage){
        this.errorMessage = newErrorMessage;
    };

    SearchResults.prototype.resetPages = function(){
        this.totalNumberOfPages = 0;
        this.page = 0;
    };

    var contains = function(items, item, equals) {
        if (!angular.isFunction(equals)) {
            return false;
        }

        for (var i = 0; i < items.length; i++) {
            if (equals(items[i], item)) {
                return true;
            }
        }

        return false;
    };

    SearchResults.prototype.updateWithSingleItem = function(item) {
        var page = new SearchResultListPage();
        page.items.push(item);
        page.currentPage = undefined;
        page.totalNumberOfPages = undefined;

        this.updateWithNewResults(page, true);
    };

    //Update the search results
    SearchResults.prototype.updateWithNewResults = function(searchResultsListPage, keepOldItems){
        //Remove old item, set loading to false and remove old error messages
        this.loading = false;
        this.errorMessage = "";
        if(!keepOldItems){
            this.items.length = 0;
        }

        //Update with new data
        if(searchResultsListPage.totalNumberOfPages === 0 ){
            this.errorMessage = this.zeroResultsErrorMessage;
        } else {
            this.errorMessage = "";
            if(!this.items){
                this.items = searchResultsListPage.items;
            }
            else {
                for (var i = 0; i < searchResultsListPage.items.length; i++){
                    if (!contains(this.items, searchResultsListPage.items[i], this.equals)) {
                        this.items.push(searchResultsListPage.items[i]);
                    }
                }
            }
        }

        //Update page info
        if (angular.isDefined(searchResultsListPage.totalNumberOfPages)) {
            this.totalNumberOfPages = searchResultsListPage.totalNumberOfPages;
        }

        if (angular.isDefined(searchResultsListPage.currentPage)) {
            this.page = searchResultsListPage.currentPage;
        }
    };

    return SearchResults;
});
