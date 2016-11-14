angular.module('unionvmsWeb').directive('tripOverviewPanel', function () {
    return {
        restrict: 'E',
        replace: true,
        scope: {
           trip: '='
         },
        templateUrl: 'directive/activity/tripOverviewPanel/tripOverviewPanel.html',
        link: function (scope, element, attrs, fn) {
           /* scope.fieldTripData = {

                tripID: 'BEL-TRP-O16-2016_0021',
                vesselName: 'Beagle(BEL123456789)',
                departure: 'yy-mm-dd hh:mm',
                departureAt: 'BEZEE',
                arrival: 'yy-mm-dd hh:mm',
                arrivalAt: 'BEOST',
                Landing: 'yy-mm-dd hh:mm',
                LandingAt: 'BEOST'
            }*/

        }
    };
});
