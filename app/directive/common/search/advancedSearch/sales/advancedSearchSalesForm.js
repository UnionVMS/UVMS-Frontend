angular.module('unionvmsWeb')
    .controller('AdvancedSearchSalesFormCtrl', function ($scope, $modal, locale, unitTransformer, codeListService, dateTimeService, searchService, savedSearchService, salesSearchService, userService) { //TODO: salesValidationService,

        $scope.advancedSearch = salesSearchService.getAdvancedSearchStatus;
        $scope.savedSearches = salesSearchService.savedSearches;

        var codelists = ['flagStates', 'salesCategories', 'salesLocations', 'landingPorts', 'species'];

        var init = function () {
            codeListService.getCodeListsAssured(codelists).then(function (lists) {
                $scope.config = lists;
            });
        };

        //On click on the reset link
        $scope.resetSearch = function () {
            $scope.resetAdvancedSearchForm(true);
            $$resetSelectedSearchGroup();
            $scope.$broadcast("sales.advanced-search-reset");
        };

        $scope.toggleAdvancedSearch = function () {
            salesSearchService.toggleAdvancedSearch();
            $$resetSearchFields();
        };

        $scope.performSearch = function () {
            salesSearchService.resetPage();
            $scope.searchfunc();
        };

        $scope.updateSalesStartDate = function (newValue) {
            if (!angular.isDefined(newValue)) { return; }
            var searchObj = searchService.getAdvancedSearchObject();
            searchObj.salesStartDate = newValue;
        };
        $scope.updateSalesEndDate = function (newValue) {
            if (!angular.isDefined(newValue)) { return; }
            var searchObj = searchService.getAdvancedSearchObject();
            searchObj.salesEndDate = newValue;
        };

        $scope.setCorrectSpecies = function (species, func) {
            var searchObj = searchService.getAdvancedSearchObject();
            if (func === "and") {
                searchObj.allSpecies = species;
                searchObj.anySpecies = undefined;
            } else {
                searchObj.allSpecies = undefined;
                searchObj.anySpecies = species;
            }
        };

        $scope.checkAccess = function (feature) {
            if (userService.isAllowed(feature, "Sales", true)) {
                return true;
            }
            return false;
        };

        $scope.openSaveGroupModal = function () {
            var options = {
                dynamicSearch: false,
            };
            savedSearchService.openSaveSearchModal("SALES", options);
        };

        $scope.performSavedSearch = function (savedSearchGroup) {
            if (angular.isUndefined(savedSearchGroup.searchFields)) {
                return;
            }

            salesSearchService.toggleAdvancedSearch(true);
            $$resetSearchFields();
            $scope.performSavedGroupSearch(savedSearchGroup, true, true);
            $scope.$broadcast("sales.perform-saved-search", searchService.getAdvancedSearchObject());
        };

        init();

        /////////////////

        //Reset all search fields
        function $$resetSearchFields() {
            $scope.resetAdvancedSearchForm(false);
        }

        //Reset the saved search dropdown
        function $$resetSelectedSearchGroup() {
            //$scope.selectedSearchGroup = undefined;
            $scope.savedSearches.selected = undefined;
        }
    }
);
