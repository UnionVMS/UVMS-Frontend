angular.module('unionvmsWeb')
    .controller('AdvancedSearchSalesFormCtrl', function ($scope, $modal, locale, unitTransformer, codeListService, dateTimeService, searchService, savedSearchService, salesSearchService) { //TODO: salesValidationService,

        $scope.advancedSearch = salesSearchService.getAdvancedSearchStatus;
        $scope.savedSearches = salesSearchService.savedSearches;

        var codelists = ['flagStates', 'salesCategories', 'salesLocations', 'landingPorts', 'species'];

        //TODO: Validation
        //$scope.mmsiRegExp = salesValidationService.getMMSIPattern();
        //$scope.mmsiValidationMessages = {
        //    'pattern' : locale.getString('sales.sales_details_mmsi_pattern_validation_message')
        //};

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
            searchObj.salesStartDate = dateTimeService.isFormattedAsUnixSecondsTimstamp(newValue);
        };
        $scope.updateSalesEndDate = function (newValue) {
            if (!angular.isDefined(newValue)) { return; }
            var searchObj = searchService.getAdvancedSearchObject();
            searchObj.salesEndDate = dateTimeService.isFormattedAsUnixSecondsTimstamp(newValue);
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
        };

        //Reset the saved search dropdown
        function $$resetSelectedSearchGroup() {
            //$scope.selectedSearchGroup = undefined;
            $scope.savedSearches.selected = undefined;
        }
    }
);
