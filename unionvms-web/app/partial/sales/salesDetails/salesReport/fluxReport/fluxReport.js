(function () {
    'use strict';

    angular
        .module('unionvmsWeb')
        .component('salesFluxReport', {
            templateUrl: 'partial/sales/salesDetails/salesReport/fluxReport/fluxReport.html',
            controller: reportCtrl,
            controllerAs: 'vm',
            bindings: {
                report: '<'
            }
        });

    function reportCtrl() {
        /* jshint validthis:true */
        var vm = this;


        /////////////////////////


    }
})();
