(function () {
    'use strict';

    angular
        .module('unionvmsWeb')
        .component('salesNoteList', {
            templateUrl: 'partial/sales/salesNoteList/salesNoteList.html',
            controller: salesNoteListCtrl,
            controllerAs: 'vm',
            bindings: {
                salesNotes: '<'
            }
        });

    function salesNoteListCtrl($state, salesSelectionService) {
        /* jshint validthis:true */
        var vm = this;

        vm.selectAllCheckbox = false;

        vm.checkAllCallBack = checkAllCallBack;
        vm.checkItemCallBack = checkItemCallBack;

        vm.isNoteChecked = isNoteChecked;
        vm.isAllChecked = isAllChecked;

        vm.openSalesNote = openSalesNote;

        init();

        ///////////////////////

        function init() {

        }

        function openSalesNote(item) {
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
            for (var index = 0; index < vm.salesNotes.items.length; index++) {
                var note = vm.salesNotes.items[index];
                note.selected = isNoteChecked(note);
            }
        }
    }
})();
