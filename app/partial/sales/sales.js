(function () {
    'use strict';

    angular
        .module('unionvmsWeb')
        .controller('SalesCtrl', salesCtrl);

    function salesCtrl(locale, alertService, salesSearchService, SearchResults, salesRestService, salesSelectionService, csvService, salesCsvService) {
        /* jshint validthis:true */
        var vm = this;

        vm.editSelectionDropdownItems = [
            { text: locale.getString('common.export_selection'), code: 'EXPORT' }
        ];

        vm.gotoPage = gotoPage;
        vm.searchSalesReports = searchSalesReports;
        vm.exportSalesReports = salesRestService.exportDocuments;
        vm.exportDocuments = exportDocuments;
        vm.getAmountOfReportsInSearch = getAmountOfReportsInSearch;

        vm.editSelectionCallBack = editSelectionCallBack;

        vm._searchResults = null;


        init();

        //////////// Loading sales notes ////////////

        function init() {
            salesSearchService.init();
            $('[data-toggle="popover"]').popover()
        }

        function getAmountOfReportsInSearch() {
            if (vm._searchResults == null) {
                vm._searchResults = salesSearchService.getSearchResults();
                return vm._searchResults.totalNumberOfPages * salesSearchService.DEFAULT_ITEMS_PER_PAGE;
            } else {
                return 0;
            }
        }

        function exportDocuments() {
            $('#popover').popover('show')

        }

        //Search sales notes
        function searchSalesReports() {
            vm._searchResults = null;
            salesSearchService.searchSalesReports().then(function () {
                salesSelectionService.reset();
            });
        }

        //Goto page in the search results
        function gotoPage(page) {
            if (angular.isDefined(page)) {
                salesSearchService.setPage(page);
                searchSalesReports();
            }
        }

        //////////// DropDown actions on selected items ////////////

        function editSelectionCallBack(item) {
            if (item.code.toUpperCase() === 'EXPORT') {
                salesSearchService.setLoading(true);
                var exportlist = salesSelectionService.getExportList();
                salesRestService.exportSelectedDocuments(exportlist)
                    .then(function (data) {
                        exportSelectionSuccess(data);
                    }, exportSelectionFailed);
            }
        }
        function exportSelectionSuccess(data) {
            salesSearchService.setLoading(false);
            var header = salesCsvService.headers.salesReport;
            csvService.downloadCSVFile(data, header, "sales_documents_export.csv");
        }
        function exportSelectionFailed() {
            salesSearchService.setLoading(false);
            vm.currentSearchResults.setErrorMessage(locale.getString('sales.documents_export_failed'));
        }
    }
})();
