(function () {
    'use strict';

    angular
        .module('unionvmsWeb')
        .controller('SalesDetailsCtrl', salesDetailsCtrl);

    function salesDetailsCtrl($log, $state, alertService, locale, salesDetails) {
        /* jshint validthis:true */
        var vm = this;

        if (salesDetails === null || angular.isUndefined(salesDetails)) {
            alertService.showErrorMessageWithTimeout(locale.getString('sales.sales_note_not_exist_error'));
            $state.go('app.sales.list');
        }

        //Salesdetails from route resolve
        vm.salesDetails = salesDetails;

        ////////////////////////

    }
})();
