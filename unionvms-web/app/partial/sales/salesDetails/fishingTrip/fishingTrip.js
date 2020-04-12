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

    function fishingTripCtrl(userService, salesFishingActivityService, $state) {
        /* jshint validthis:true */
        var vm = this;
        vm.openFishingTrip = openFishingTrip;
        vm.hasActivityPermission = hasActivityPermission;

        salesFishingActivityService.findFishingActivity("DEPARTURE", vm.trip.extId).then(function(result) {
            vm.trip.departureLocation = result.port;
            vm.trip.departureDate = result.date;
        });
        salesFishingActivityService.findFishingActivity("ARRIVAL", vm.trip.extId).then(function(result) {
            vm.trip.arrivalLocation = result.port;
            vm.trip.arrivalDate = result.date;
        });

        vm.navigateToVesselAllowed = userService.isAllowed('viewVesselsAndMobileTerminals', 'Union-VMS', true);




        function openFishingTrip() {
            $state.go('app.activity', {tripId: vm.trip.extId});
        }

        function hasActivityPermission() {
            return userService.isAllowed('FISHING_TRIP_SUMMARY', 'Activity', true);
        }
    }
})();
