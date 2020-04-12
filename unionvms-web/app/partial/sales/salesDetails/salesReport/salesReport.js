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

    function salesReportCtrl($state) {
        /* jshint validthis:true */
        var vm = this;

        getCurrency();

        vm.close = closeSalesReport;

        /////////////////////////

        function closeSalesReport() {
            $state.go('app.sales.list');
        }

        function getCurrency() {
            vm.currency = vm.salesReport.document.currency;
        }
    }
})();
