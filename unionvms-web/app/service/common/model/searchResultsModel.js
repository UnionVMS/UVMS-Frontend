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
        this.showZeroResultsMessage = false;
        this.equals = equals;
    }

    SearchResults.prototype.setLoading = function(newLoading){
        this.loading = newLoading;
    };

    SearchResults.prototype.setErrorMessage = function(newErrorMessage){
        this.errorMessage = newErrorMessage;
    };

    SearchResults.prototype.clearErrorMessage = function(){
        this.errorMessage = undefined;
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

    SearchResults.prototype.removeAllItems = function() {
        this.items.length = 0;
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
            this.showZeroResultsMessage = true;
        } else {
            this.errorMessage = "";
            this.showZeroResultsMessage = false;
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
