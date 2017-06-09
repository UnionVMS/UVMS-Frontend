(function () {
    'use strict';

    angular
        .module('unionvmsWeb')
        .component('salesReportList', {
            templateUrl: 'partial/sales/salesReportList/salesReportList.html',
            controller: salesReportListCtrl,
            controllerAs: 'vm',
            bindings: {
            salesReports: '<'
            }
        });

    function salesReportListCtrl($state, salesSelectionService) {
        /* jshint validthis:true */
        var vm = this;

        vm.selectAllCheckbox = false;

        vm.checkAllCallBack = checkAllCallBack;
        vm.checkItemCallBack = checkItemCallBack;

        vm.isNoteChecked = isNoteChecked;
        vm.isAllChecked = isAllChecked;

        vm.openSalesReport = openSalesReport;

        init();

        ///////////////////////

        function init() {

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
            for (var index = 0; index < vm.salesReports.items.length; index++) {
                var note = vm.salesReports.items[index];
                note.selected = isNoteChecked(note);
            }
        }
    }
})();
