/**
 * @memberof unionvmsWeb
 * @ngdoc directive
 * @name tripOverviewPanel
 * @attr {Object} trip - current Fishing Trip Details.
 * @description
 *  A reusable tile that will display the Fishing Trip Details.
 */

angular.module('unionvmsWeb').directive('tripOverviewPanel', function () {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            trip: '='
        },
        templateUrl: 'directive/activity/tripOverviewPanel/tripOverviewPanel.html',

    };
});
