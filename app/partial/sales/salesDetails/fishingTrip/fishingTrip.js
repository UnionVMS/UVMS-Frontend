(function () {
    'use strict';

    angular
        .module('unionvmsWeb')
        .component('salesFishingTrip', {
            templateUrl: 'partial/sales/salesDetails/fishingTrip/fishingTrip.html',
            controller: fishingTripCtrl,
            controllerAs: 'vm',
            bindings: {
                trip: '<'
            }
        });

    function fishingTripCtrl(userService) {
        /* jshint validthis:true */
        var vm = this;

        //HANPOP temp code untill activies are ready.
        vm.trip.departureLocation = 'TODO';
        vm.trip.departureDate = new Date();
        vm.trip.arrivalLocation = 'TODO';
        vm.trip.arrivalDate = new Date();

        vm.navigateToVesselAllowed = userService.isAllowed('viewVesselsAndMobileTerminals', 'Union-VMS', true);
    }
})();