angular.module('unionvmsWeb')
.factory('SearchResults', function(SearchField, locale) {

    function SearchResults(sortyBy, sortReverse, zeroResultsErrorMessage){
        this.page = 0;
        this.totalNumberOfPages = 0;
        this.items = [];
        this.errorMessage = "";
        this.loading = false;
        this.sortBy = angular.isDefined(sortyBy) ? sortyBy : '';
        this.sortReverse = angular.isDefined(sortReverse) ? sortReverse : false;
        this.zeroResultsErrorMessage = angular.isDefined(zeroResultsErrorMessage) ? zeroResultsErrorMessage : locale.getString('common.search_zero_results_error');
    }

    //Clear for search
    SearchResults.prototype.clearForSearch = function(){
        this.errorMessage = "";
        this.loading = true;
        this.items.length = 0;
        this.page = 0;
        this.totalNumberOfPages = 0;
    };

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

    //Update the search results
    SearchResults.prototype.updateWithNewResults = function(searchResultsListPage){
        this.loading = false;
        if(searchResultsListPage.totalNumberOfPages === 0 ){
            this.errorMessage = this.zeroResultsErrorMessage;
        } else {
            this.errorMessage = "";
            if(!this.items){
                this.items = searchResultsListPage.items;
            }
            else {
                for (var i = 0; i < searchResultsListPage.items.length; i++){
                    this.items.push(searchResultsListPage.items[i]);
                }
            }
        }

        //Update page info
        this.totalNumberOfPages = searchResultsListPage.totalNumberOfPages;
        this.page = searchResultsListPage.currentPage;
    };

    return SearchResults;
});
