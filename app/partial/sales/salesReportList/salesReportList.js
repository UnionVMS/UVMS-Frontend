(function () {
    'use strict';

    angular
        .module('unionvmsWeb')
        .component('salesReportList', {
            templateUrl: 'partial/sales/salesReportList/salesReportList.html',
            controller: salesReportListCtrl,
            controllerAs: 'vm'
        });

    function salesReportListCtrl($state, salesSelectionService, $scope, salesSearchService) {
        /* jshint validthis:true */
        var vm = this;

        vm.displayedCollection = [];
        vm.salesReports = [];

        vm.selectAllCheckbox = false;
        vm.isLoading = false;

        vm.checkAllCallBack = checkAllCallBack;
        vm.checkItemCallBack = checkItemCallBack;

        vm.isNoteChecked = isNoteChecked;
        vm.isAllChecked = isAllChecked;

        vm.openSalesReport = openSalesReport;

        vm.searchSalesReports = searchSalesReports;

        vm.goToPage = goToPage;

        vm.callServer = callServer;

        vm.sorting = {};



        init();

        ///////////////////////

        function callServer(tableState) {
            vm.sorting.sortField = tableState.sort.predicate;

            if (tableState.sort.reverse === true) {
                vm.sorting.sortDirection = "DESCENDING";
            } else if (tableState.sort.reverse === false) {
                vm.sorting.sortDirection = "ASCENDING";
            }

            searchSalesReports(vm.sorting, tableState);
        }

        function init() {
        }

        function goToPage(page) {
            if (angular.isDefined(page)) {
                salesSearchService.setPage(page);
                searchSalesReports(vm.sorting);
            }
        }

        function searchSalesReports(sorting, tableState) {
            vm.isLoading = true;
            salesSearchService.searchSalesReports(sorting).then(function () {
                salesSelectionService.reset();
                vm.salesReports = salesSearchService.getSearchResults();

                if (tableState) {
                    tableState.pagination.numberOfPages = vm.salesReports.totalNumberOfPages;
                }

                vm.isLoading = false;
            });
        }

        function openSalesReport(item) {
            $state.go('app.sales.details', {id: item.extId});
        }

        //Handle click on the top "check all" checkbox
        function checkAllCallBack() {
            salesSelectionService.checkAll();
            refreshCheckboxes();
        }
        function checkItemCallBack(item) {
            item.selected = !item.selected;
            salesSelectionService.checkItem(item.extId,item.selected);
            refreshCheckboxes();
        }
        function isAllChecked() {
            return salesSelectionService.getSelectAll() && salesSelectionService.getToExclude().length === 0;
        }
        function isNoteChecked(note) {
            return ((salesSelectionService.getSelectAll() && salesSelectionService.getToExclude().indexOf(note.extId) === -1) ||
                    salesSelectionService.getToInclude().indexOf(note.extId) > -1);
        }

        function refreshCheckboxes() {
            vm.selectAllCheckbox = isAllChecked();
            for (var index = 0; index < vm.salesReports.length; index++) {
                var note = vm.salesReports[index];
                note.selected = isNoteChecked(note);
            }
        }
    }

})();
