(function () {
    'use strict';

    angular
        .module('unionvmsWeb')
        .service('salesSearchService', salesSearchService);

    function salesSearchService($q, $log, salesRestService, searchService, SearchField, SearchResults, locale, $timeout) {
        var DEFAULT_ITEMS_PER_PAGE = 10;
        var currentPageNr = 1;
        var isAdvancedSearchOpen = false;
        var advancedSearchObject = {};

        var lastSearchObject = angular.copy(advancedSearchObject);
        var searchResults = new SearchResults('', false, locale.getString('sales.search_zero_results_error'));

        var savedSearches = {
            loaded: false,
            items: [],
            selected: undefined
        };

        var service = {
            init: init,
            getSearchResults: getSearchResults,
            searchSalesReports: searchSalesReports,
            setPage: setPage,
            resetPage: resetPage,
            getAdvancedSearchStatus: getAdvancedSearchStatus,
            toggleAdvancedSearch: toggleAdvancedSearch,
            getAdvancedSearchCriterias: getAdvancedSearchCriterias,
            getAdvancedSearchObject: getAdvancedSearchObject,
            createNewSavedSearch: createNewSavedSearch,
            updateSavedSearch: updateSavedSearch,
            deleteSavedSearch: deleteSavedSearch,
            getSavedSearches: getSavedSearches,
            savedSearches: savedSearches,
            setLoading: setLoading
        };

        return service;

        ///////////////////////

        //Set state of searchService back to last known state
        function init() {
            searchService.hardResetAdvancedSearch();
            advancedSearchObject = searchService.getAdvancedSearchObject();

            //Wrap in timeout because it the search object might get reset by $destroy event on previous scope
            $timeout(function () {
                angular.copy(lastSearchObject, advancedSearchObject);
            }, 1000);
        }

        function getSearchResults() {
            if (!searchResults.loading && searchResults.items.length === 0) {
                searchSalesReports();
            }
            return searchResults;
        }

        function searchSalesReports(sorting) {
            lastSearchObject = angular.copy(advancedSearchObject);

            searchResults.clearErrorMessage();
            searchResults.setLoading(true);
            var deferred = $q.defer();

            var filters = advancedSearchObject || {};

            salesRestService.getSalesReportsPage(currentPageNr, filters, sorting).then(function (page) {
                searchResults.updateWithNewResults(page);
                deferred.resolve(page);
            }, function (error) {
                $log.error("Error: salesSearchService.searchSalesReports().", error);
                searchResults.setErrorMessage(locale.getString('common.search_failed_error'));
                searchResults.removeAllItems();
                searchResults.setLoading(false);
                deferred.reject(error);
            });
            return deferred.promise;
        }

        function setPage(pageNr) {
            if (angular.isDefined(pageNr)) {
                currentPageNr = pageNr;
            }
        }

        function resetPage() {
            currentPageNr = 1;
        }

        function getAdvancedSearchStatus() {
            return isAdvancedSearchOpen;
        }

        function toggleAdvancedSearch(value) {
            if (value !== undefined) {
                isAdvancedSearchOpen = value;
            } else {
                isAdvancedSearchOpen = !isAdvancedSearchOpen;
            }
        }

        function getSavedSearches() {
            if (!savedSearches.loaded) {
                $$getSavedSearches();
                savedSearches.loaded = true;
            }
            return savedSearches.items;
        }

        function createNewSavedSearch(savedSearchGroup) {
            return $$saveSearch(savedSearchGroup);
        }

        function updateSavedSearch(savedSearchGroup) {
            return $$saveSearch(savedSearchGroup);
        }

        function deleteSavedSearch(savedSearchGroup) {
            var defer = $q.defer();
            salesRestService.deleteSavedSearch(savedSearchGroup).then(
                function (deletedGroup) {
                    $$getSavedSearches();
                    defer.resolve(deletedGroup);
                }, function (err) {
                    defer.reject(err);
                });
            return defer.promise;
        }

        //Get the advanced search criterias as a list of SearchFields
        function getAdvancedSearchCriterias() {
            var criterias = [];
            $.each(advancedSearchObject, function (key, value) {
                //Skip empty values
                if (typeof value === 'number' || (typeof value === 'string' && value.trim().length !== 0) || value instanceof Array) {
                    criterias.push(new SearchField(key, value));
                }
            });
            return criterias;
        }

        function getAdvancedSearchObject () {
            return advancedSearchObject;
        }

        ////////////////////////
        function $$saveSearch(savedSearchGroup) {
            var defer = $q.defer();
            salesRestService.saveSearch(savedSearchGroup).then(function () {
                $$getSavedSearches();
                defer.resolve();
            }, function (err) {
                defer.reject(err);
            });
            return defer.promise;
        }

        function $$getSavedSearches() {
            salesRestService.getSavedSearches().then(function (groups) {
                savedSearches.items = groups;
            }, function (err) {
                savedSearches.items = [];
            });
        }

        function setLoading(isLoading) {
            searchResults.setLoading(isLoading);
        }
    }
})();
