/**
 * @memberof unionvmsWeb
 * @ngdoc directive
 * @name fishingTripPanel
 * @attr {unionvmsWeb.Trip} trip - current trip in trip summary
 * @description
 *  A reusable tile that will display the main events dates and locations(departure,arrival and landing) related to the current trip
 */
angular.module('unionvmsWeb').directive('fishingTripPanel', function() {
	return {
		restrict: 'E',
		replace: true,
		scope: {
			trip: '='
		},
		templateUrl: 'directive/activity/fishingTripPanel/fishingTripPanel.html',
		link: function(scope, element, attrs, fn) {


		}
	};
});
