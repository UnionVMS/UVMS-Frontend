(function () {
    'use strict';

    angular
        .module('unionvmsWeb')
        .component('salesTotals', {
            templateUrl: 'partial/sales/salesDetails/salesReport/totals/totals.html',
            controller: totalsCtrl,
            controllerAs: 'vm',
            bindings: {
                totals: '<',
                currency: '<'
            }
        });

    function totalsCtrl() {
        /* jshint validthis:true */
        var vm = this;

        /////////////////////////

    }
})();
