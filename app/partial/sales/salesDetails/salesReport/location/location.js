(function () {
    'use strict';

    angular
        .module('unionvmsWeb')
        .component('salesLocation', {
            templateUrl: 'partial/sales/salesDetails/salesReport/location/location.html',
            controller: locationCtrl,
            controllerAs: 'vm',
            bindings: {
                location: '<'
            }
        });

    function locationCtrl() {
        /* jshint validthis:true */
        var vm = this;
        vm.bounds = {};
        vm.center = {};
        vm.markers = {};

        createMarker();

        /////////////////////////

        /**
         * Creates a marker to show the location on the map
         */
        function createMarker () {
            if (angular.isDefined(vm.location) && vm.location.latitude && vm.location.longitude) {
                vm.markers.reportPosition = {
                    lat: vm.location.latitude,
                    lng: vm.location.longitude,
                    message: vm.location.extId,
                    focus: true
                };

                //Set map center to marker
                var zoom = vm.location.country === 'BEL'? 8: 3; //For Belgium zoom in closer
                vm.center = {
                    lat: vm.markers.reportPosition.lat,
                    lng: vm.markers.reportPosition.lng,
                    zoom: zoom
                };
            } else {
                vm.coordinatesmissing = true;
            }
        }
    }
})();
