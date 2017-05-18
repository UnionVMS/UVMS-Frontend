(function () {
    'use strict';

    angular
        .module('unionvmsWeb')
        .component('salesDocument', {
            templateUrl: 'partial/sales/salesDetails/salesNote/document/document.html',
            controller: documentCtrl,
            controllerAs: 'vm',
            bindings: {
                document: '<'
            }
        });

    function documentCtrl() {
        /* jshint validthis:true */
        var vm = this;


        /////////////////////////


    }
})();