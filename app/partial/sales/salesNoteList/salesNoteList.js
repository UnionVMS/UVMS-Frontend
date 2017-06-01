(function () {
    'use strict';

    angular
        .module('unionvmsWeb')
        .component('salesNoteList', {
            templateUrl: 'partial/sales/salesNoteList/salesNoteList.html',
            controller: salesNoteListCtrl,
            controllerAs: 'vm',
            bindings: {
                // salesNotes: '<'
            }
        });

    function salesNoteListCtrl($state, salesSelectionService, $scope, salesSearchService) {
        /* jshint validthis:true */
        var vm = this;

        vm.displayedCollection = [];
        vm.salesNotes = [];

        vm.selectAllCheckbox = false;

        vm.checkAllCallBack = checkAllCallBack;
        vm.checkItemCallBack = checkItemCallBack;

        vm.isNoteChecked = isNoteChecked;
        vm.isAllChecked = isAllChecked;

        vm.openSalesNote = openSalesNote;

        vm.searchSalesNotes = searchSalesNotes;

        vm.goToPage = goToPage;

        vm.callServer = callServer;

        vm.sorting = {};

        vm.add = function () {
            console.log("doing stuff2222");
            console.log(vm.salesNotes.items);
        };

        init();

        ///////////////////////

        function callServer(tableState) {
            vm.sorting.sortField = tableState.sort.predicate;

            if (tableState.sort.reverse === true) {
                vm.sorting.sortDirection = "DESCENDING";
            } else if (tableState.sort.reverse === false) {
                vm.sorting.sortDirection = "ASCENDING";
            }

            salesSearchService.searchSalesNotes(vm.sorting).then(function () {
                vm.salesNotes = salesSearchService.getSearchResults();
                tableState.pagination.numberOfPages = vm.salesNotes.totalNumberOfPages;
            });
        }

        function init() {
        }

        function goToPage(page) {
            if (angular.isDefined(page)) {
                salesSearchService.setPage(page);
                searchSalesNotes(vm.sorting);
            }
        }

        function searchSalesNotes(sorting) {
            salesSearchService.searchSalesNotes(sorting).then(function () {
                salesSelectionService.reset();
            });
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
            for (var index = 0; index < vm.salesNotes.length; index++) {
                var note = vm.salesNotes[index];
                note.selected = isNoteChecked(note);
            }
        }
    }
})();
