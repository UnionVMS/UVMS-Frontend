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

        vm.editSelectionCallBack = editSelectionCallBack;


        init();

        //////////// Loading sales notes ////////////

        function init() {
            salesSearchService.init();
        }

        //Search sales notes
        function searchSalesReports() {
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
                vm.currentSearchResults.setLoading(true);
                var exportlist = salesSelectionService.getExportList();
                salesRestService.exportSelectedDocuments(exportlist)
                    .then(function (data) {
                        exportSelectionSuccess(data);
                    }, exportSelectionFailed);
            }
        }
        function exportSelectionSuccess(data) {
            vm.currentSearchResults.setLoading(false);
            var header = salesCsvService.headers.salesReport;
            csvService.downloadCSVFile(data, header, "sales_documents_export.csv");
        }
        function exportSelectionFailed() {
            vm.currentSearchResults.setLoading(false);
            vm.currentSearchResults.setErrorMessage(locale.getString('sales.documents_export_failed'));
        }
    }
})();
