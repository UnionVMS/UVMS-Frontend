/**
 * @memberof unionvmsWeb
 * @ngdoc directive
 * @name vesselPanel
 * @attr {unionvmsWeb.Trip} trip - current trip in trip summary
 * @description
 *  A reusable tile that will display the vessel details related to the selected trip
 */
angular.module('unionvmsWeb').directive('vesselPanel', function() {
	return {
		restrict: 'E',
		replace: true,
		scope: {
			trip: '='
		},
		templateUrl: 'directive/activity/vesselPanel/vesselPanel.html'
	};
});