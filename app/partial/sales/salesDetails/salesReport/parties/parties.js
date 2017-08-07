(function () {
    'use strict';

    angular
        .module('unionvmsWeb')
        .component('salesParties', {
            templateUrl: 'partial/sales/salesDetails/salesReport/parties/parties.html',
            controller: partiesCtrl,
            controllerAs: 'vm',
            bindings: {
                parties: '<'
            }
        });

    function partiesCtrl() {
        /* jshint validthis:true */
        var vm = this;

        $$setSellerAndBuyer();

        /////////////////////////

        function $$setSellerAndBuyer() {
            vm.parties.forEach(function (party) {
                if (party.role === 'SELLER') {
                    vm.seller = party;
                }
                if (party.role === 'BUYER') {
                    vm.buyer = party;
                }
                if (party.role === 'RECIPIENT') {
                    vm.recipient = party;
                }
            });
        }
    }
})();
