(function () {
    'use strict';

    angular
        .module('unionvmsWeb')
        .component('salesProductsTable', {
            templateUrl: 'partial/sales/salesDetails/salesReport/products/productsTable.html',
            controller: productsTableCtrl,
            controllerAs: 'vm',
            bindings: {
                products: '<',
                currency: '<',
                showArea: '<'
            }
        });

    function productsTableCtrl() {
        /* jshint validthis:true */
        var vm = this;

        /////////////////////////

    }
})();
