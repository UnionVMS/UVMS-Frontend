(function () {
    'use strict';

    angular
        .module('unionvmsWeb')
        .component('salesReport', {
            templateUrl: 'partial/sales/salesDetails/salesReport/salesReport.html',
            controller: salesReportCtrl,
            controllerAs: 'vm',
            bindings: {
            salesReport: '<'
            }
        });

    function salesReportCtrl($state, codeListService) {
        /* jshint validthis:true */
        var vm = this;

        getCurrency();
        getType();

        vm.close = closeSalesReport;

        /////////////////////////

        function closeSalesReport() {
            $state.go('app.sales.list');
        }

        function getCurrency() {
            codeListService.getCodeListAssured('currencies').then(
                function (list) {
                    vm.currency = list.getValue(vm.salesReport.document.currency);
                });
        }

        function getType() {
            codeListService.getCodeListAssured('salesCategories').then(
                function (list) {
                    vm.salesCategory = list.getValue(vm.salesReport.category);
                });
        }
    }
})();
