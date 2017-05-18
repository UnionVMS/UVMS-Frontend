(function () {
    'use strict';

    angular
        .module('unionvmsWeb')
        .component('salesNote', {
            templateUrl: 'partial/sales/salesDetails/salesNote/salesNote.html',
            controller: salesNoteCtrl,
            controllerAs: 'vm',
            bindings: {
                salesNote: '<'
            }
        });

    function salesNoteCtrl($state, codeListService) {
        /* jshint validthis:true */
        var vm = this;

        getCurrency();
        getType();

        vm.close = closeSalesNote;

        /////////////////////////

        function closeSalesNote() {
            $state.go('app.sales.list');
        }

        function getCurrency() {
            codeListService.getCodeListAssured('currencies').then(
                function (list) {
                    vm.currency = list.getValue(vm.salesNote.document.currency);
                });
        }

        function getType() {
            codeListService.getCodeListAssured('salesCategories').then(
                function (list) {
                    vm.salesCategory = list.getValue(vm.salesNote.category);
                });
        }
    }
})();
